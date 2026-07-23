/**
 * Save/load proofs — the executable evidence behind S5 (round-trip) and S7
 * (atomic save integrity). S5 runs at three scopes: the M0 empty-shell
 * round-trip; the Alpha A1 stocked harbor-state round-trip (seeded 3S
 * storage bands incl. Crowns — owner A1 authorization, 2026-07-16); and the
 * Alpha A2 reward-bearing round-trip (Claim Ledger packages incl. partial
 * remainders, Story Claims, and pending_reward_resolution — owner A2
 * authorization, 2026-07-17). S7 runs its crash simulation over the A2
 * reward-bearing state, so "a simulated crash never duplicates rewards" is
 * exercised against actual reward state (the M0 limitation "reward-
 * duplication portion is future" is closed at A2 scope). One implementation,
 * two consumers: `tests/save-load.test.ts` and the sim-harness registry
 * checks (claim-to-test, CLAUDE.md §3 — the harness is the arbiter of
 * "done").
 *
 * Detail strings are deterministic (no paths, no wall-clock) so the harness
 * repeat-run determinism proof holds over them.
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §10/§11/§15/§16;
 * 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §5/§7/§10/§13;
 * SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.6 (S5/S7), §7, §8 (evidence rules).
 * Invariant refs: S5, S7; the A2 state builder feeds L5/L6/L7/L11/L14 checks.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ClaimLedgerRulesSeed } from "../contracts/claim-ledger-rules.js";
import type { ClaimLedgerState, PendingRewardResolution } from "../contracts/claim-ledger.js";
import type { ExpeditionCommand } from "../contracts/expedition.js";
import type { ExpeditionSeed } from "../contracts/expedition-seed.js";
import type { ResourceStorageSeed } from "../contracts/resource-storage.js";
import type { SaveBlob, WorldClock } from "../contracts/save-blob.js";
import {
  assertClaimStateValid,
  claimPackage,
  createClaimLedgerState,
  routeRewardPackage,
} from "../sim/claim-ledger.js";
import {
  applyCommand,
  assertExpeditionDomainValid,
  createExpeditionState,
  createHarborOperationsState,
  type ExpeditionDomain,
} from "../sim/expedition.js";
import { CORE_RESOURCES, createHarborState, deposit, fromResourceBands, toResourceBands, type HarborState } from "../sim/harbor-state.js";
import { canonicalSerialize } from "./canonical-json.js";
import { loadSave, rollbackPath, saveAtomically, tempPath, type CrashSimulationHooks } from "./atomic-save.js";
import { createEmptySaveBlob } from "./empty-save.js";
import { SaveValidationError, type SaveBlobValidator } from "./save-blob-validator.js";

/** Deterministic proof fixtures — test parameters, not gameplay values (Sim §8: seeds/inputs recorded). */
const PROOF_GAME_VERSION = "0.0.0";
const PROOF_UTC_V1 = "2026-01-01T00:00:00.000Z";
const PROOF_UTC_V2 = "2026-01-01T00:00:01.000Z";
/** Deterministic base seed for the A4 expedition-stream proofs (harness parameter, not gameplay). */
const PROOF_EXPEDITION_SEED = 20260723;

export interface ProofResult {
  pass: boolean;
  detail: string;
}

/** Thrown from a fault-injection hook to simulate a crash at that pipeline point. */
export class SimulatedCrashError extends Error {
  constructor(point: string) {
    super(`simulated crash: ${point} (S7 fault injection)`);
    this.name = "SimulatedCrashError";
  }
}

const failed = (detail: string): ProofResult => ({ pass: false, detail });

/**
 * S5 @ M0: save the empty/minimal blob, load it, re-serialize — require
 * byte-identical output; then re-save and require byte stability + rollback
 * preservation. Content-bearing state (real ledger/inbox/queues/threat
 * contents) remains FUTURE BUILD and grows this proof with each feature.
 */
export function proveEmptyStateRoundTrip(dir: string, validate: SaveBlobValidator): ProofResult {
  const slot = join(dir, "roundtrip.save.json");
  const blob = createEmptySaveBlob({ game_version: PROOF_GAME_VERSION, last_saved_utc: PROOF_UTC_V1 });

  const saved = saveAtomically(slot, blob, { validate });
  if (existsSync(tempPath(slot))) {
    return failed("S5 round-trip: temp file survived a successful commit — pipeline defect");
  }

  const onDisk = readFileSync(slot, "utf8");
  if (onDisk !== canonicalSerialize(blob)) {
    return failed("S5 round-trip: committed bytes differ from the canonical serialization of the saved blob");
  }

  const loaded = loadSave(slot, validate);
  const reserialized = canonicalSerialize(loaded);
  if (reserialized !== onDisk) {
    return failed(
      `S5 round-trip: save→load→re-serialize NOT byte-identical (${reserialized.length} vs ${onDisk.length} chars)`,
    );
  }

  const resaved = saveAtomically(slot, loaded, { validate });
  const onDiskAfterResave = readFileSync(slot, "utf8");
  if (onDiskAfterResave !== onDisk) {
    return failed("S5 round-trip: re-saving the loaded state changed the committed bytes");
  }
  if (!resaved.rollback_preserved || readFileSync(rollbackPath(slot), "utf8") !== onDisk) {
    return failed("S5 round-trip: re-save did not preserve the prior good save as rollback");
  }

  return {
    pass: true,
    detail:
      `M0 empty-shell scope (Sim §7 M0 exit): empty/minimal save blob (all Save/Load §16 blocks at identity state) ` +
      `save→load→re-serialize byte-identical (${saved.bytes} bytes); re-save byte-stable with prior save preserved ` +
      `as rollback. Content-bearing state preservation remains FUTURE BUILD per feature.`,
  };
}

/**
 * S5 @ A1: the STOCKED harbor state round-trips byte-identically. Builds the
 * world-creation state from the schema-validated storage seed (Economy §3
 * start stocks), deposits each resource's seeded total capacity so every
 * resource sits at the 3S hard stop with a non-zero Exposed band (all
 * amounts are seed values — No Magic Numbers), saves, loads, and requires
 * byte identity plus exact stock preservation through fromResourceBands.
 * This is the A1 extension of S5's "storage states (safe/exposed incl.
 * Crowns)" clause; all other §16 blocks remain at identity state (their
 * features are FUTURE BUILD).
 */
export function proveStockedStateRoundTrip(
  dir: string,
  validate: SaveBlobValidator,
  storageSeed: ResourceStorageSeed,
): ProofResult {
  const slot = join(dir, "stocked-roundtrip.save.json");

  // World-creation state, then fill every resource to its 3S hard stop so the
  // round-trip covers a non-trivial safe AND exposed band per resource.
  let harbor = createHarborState(storageSeed);
  for (const resource of CORE_RESOURCES) {
    const result = deposit(harbor, resource, storageSeed.storage[resource].total_capacity_st1);
    harbor = result.state;
    const conserved =
      result.deposited_to_safe + result.deposited_to_exposed + result.blocked_at_cap ===
      storageSeed.storage[resource].total_capacity_st1;
    if (!conserved) {
      return failed(`S5 stocked round-trip: deposit conservation violated for ${resource} — hidden loss`);
    }
    if (harbor.resources[resource].exposed <= 0) {
      return failed(`S5 stocked round-trip: ${resource} exposed band not exercised — proof would be vacuous`);
    }
  }

  const blob: SaveBlob = {
    ...createEmptySaveBlob({ game_version: PROOF_GAME_VERSION, last_saved_utc: PROOF_UTC_V1 }),
    resources: toResourceBands(harbor),
  };

  saveAtomically(slot, blob, { validate });
  const onDisk = readFileSync(slot, "utf8");
  const loaded = loadSave(slot, validate);
  if (canonicalSerialize(loaded) !== onDisk) {
    return failed("S5 stocked round-trip: save→load→re-serialize NOT byte-identical for the stocked state");
  }

  // Rebuild the harbor state from the loaded blob + seed; every band must match exactly.
  const rebuilt = fromResourceBands(loaded.resources, storageSeed);
  for (const resource of CORE_RESOURCES) {
    const before = harbor.resources[resource];
    const after = rebuilt.resources[resource];
    if (before.safe !== after.safe || before.exposed !== after.exposed) {
      return failed(
        `S5 stocked round-trip: ${resource} bands changed across save/load ` +
          `(safe ${before.safe}→${after.safe}, exposed ${before.exposed}→${after.exposed}) — hidden loss`,
      );
    }
  }

  return {
    pass: true,
    detail:
      `A1 scope: seeded harbor state (start stocks per Economy §3, then filled to the seeded 3S hard stop — ` +
      `non-zero Safe + Exposed bands for all ${CORE_RESOURCES.length} CoreResources incl. Crowns) ` +
      `save→load→re-serialize byte-identical; rebuilt state matches every band exactly (no hidden loss). ` +
      `Deposit conservation held at the cap. Remaining §16 blocks stay at identity state (FUTURE BUILD).`,
  };
}

/**
 * Deterministic reward-bearing state for the A2 proofs, driven ENTIRELY by
 * seed values (No Magic Numbers): the world-creation harbor plus a Claim
 * Ledger exercising every A2 structure — the Crowns per-resource slot cap
 * filled exactly (Doc 04 §5), one overflow package held as a persistent
 * pending record (Doc 04 §10), one package partially claimed to a held
 * remainder at the Iron 3S hard stop (Doc 04 §7, L6), and one Story Claim
 * (Doc 04 §6).
 */
export function buildRewardBearingState(
  storageSeed: ResourceStorageSeed,
  rulesSeed: ClaimLedgerRulesSeed,
  worldClock: WorldClock,
): { harbor: HarborState; ledger: ClaimLedgerState; pending: readonly PendingRewardResolution[] } {
  const rules = rulesSeed.rules;
  let harbor = createHarborState(storageSeed);
  let ledger = createClaimLedgerState();
  let pending: readonly PendingRewardResolution[] = [];

  // Fill the Crowns per-resource cap exactly, then overflow into pending.
  const crownsAmount = storageSeed.storage.Crowns.safe_capacity_st1;
  for (let i = 0; i < rules.max_unclaimed_packages_per_resource; i += 1) {
    const routed = routeRewardPackage(ledger, pending, {
      package_id: `proof.crowns.${i}`,
      source_type: "test_supplied",
      source_event_id: `proof.event.crowns.${i}`,
      generated_reward_seed: i,
      created_world_clock: worldClock,
      lines: [{ line_id: `proof.crowns.${i}.a`, route: "claim_ledger", resource: "Crowns", amount: crownsAmount }],
    }, rules);
    ledger = routed.ledger;
    pending = routed.pending;
  }
  const overflow = routeRewardPackage(ledger, pending, {
    package_id: "proof.crowns.overflow",
    source_type: "test_supplied",
    source_event_id: "proof.event.crowns.overflow",
    generated_reward_seed: rules.max_unclaimed_packages_per_resource,
    created_world_clock: worldClock,
    lines: [{ line_id: "proof.crowns.overflow.a", route: "claim_ledger", resource: "Crowns", amount: crownsAmount }],
  }, rules);
  ledger = overflow.ledger;
  pending = overflow.pending;

  // A mixed package: Iron to the Ledger (claimed partially below), Provisions to a Story Claim.
  const ironAmount = storageSeed.storage.Iron.total_capacity_st1;
  const mixed = routeRewardPackage(ledger, pending, {
    package_id: "proof.mixed",
    source_type: "test_supplied",
    source_event_id: "proof.event.mixed",
    generated_reward_seed: 0,
    created_world_clock: worldClock,
    lines: [
      { line_id: "proof.mixed.iron", route: "claim_ledger", resource: "Iron", amount: ironAmount },
      { line_id: "proof.mixed.story", route: "story_claim", resource: "Provisions", amount: storageSeed.storage.Provisions.start_stock },
    ],
  }, rules);
  ledger = mixed.ledger;
  pending = mixed.pending;

  // Partial claim to the 3S hard stop: Iron start_stock occupies room, so a
  // total-capacity claim leaves exactly start_stock held as remainder (L6).
  const claimed = claimPackage(ledger, harbor, "proof.mixed", "claim_to_capacity");
  ledger = claimed.ledger;
  harbor = claimed.harbor;

  assertClaimStateValid(ledger, pending);
  return { harbor, ledger, pending };
}

/**
 * S5 @ A2: the REWARD-BEARING state round-trips byte-identically — Claim
 * Ledger packages (incl. a partial-claim held remainder), a Story Claim, and
 * a persistent pending_reward_resolution record all survive save → load
 * exactly (Save/Load §10/§11; L5/L14 feed on this proof through the harness
 * ledger checks). All amounts and counts are seed values (No Magic Numbers).
 */
export function proveLedgerStateRoundTrip(
  dir: string,
  validate: SaveBlobValidator,
  storageSeed: ResourceStorageSeed,
  rulesSeed: ClaimLedgerRulesSeed,
): ProofResult {
  const slot = join(dir, "ledger-roundtrip.save.json");
  const worldClock: WorldClock = { day_index: 0, time_of_day: 0 };
  const { harbor, ledger, pending } = buildRewardBearingState(storageSeed, rulesSeed, worldClock);

  const blob: SaveBlob = {
    ...createEmptySaveBlob({ game_version: PROOF_GAME_VERSION, last_saved_utc: PROOF_UTC_V1 }),
    resources: toResourceBands(harbor),
    claim_ledger: ledger,
    pending_reward_resolution: [...pending],
  };

  saveAtomically(slot, blob, { validate });
  const onDisk = readFileSync(slot, "utf8");
  const loaded = loadSave(slot, validate);
  if (canonicalSerialize(loaded) !== onDisk) {
    return failed("S5 ledger round-trip: save→load→re-serialize NOT byte-identical for the reward-bearing state");
  }
  if (canonicalSerialize(loaded.claim_ledger) !== canonicalSerialize(ledger)) {
    return failed("S5 ledger round-trip: claim_ledger block changed across save/load — hidden reward loss/mutation");
  }
  if (canonicalSerialize(loaded.pending_reward_resolution) !== canonicalSerialize(pending)) {
    return failed("S5 ledger round-trip: pending_reward_resolution block changed across save/load (L14 feed)");
  }
  // Loading twice must not duplicate anything (reload-no-duplication feed for L14).
  const reloaded = loadSave(slot, validate);
  if (canonicalSerialize(reloaded) !== canonicalSerialize(loaded)) {
    return failed("S5 ledger round-trip: repeated load produced a different state — reload duplication/mutation");
  }
  assertClaimStateValid(loaded.claim_ledger, loaded.pending_reward_resolution);

  return {
    pass: true,
    detail:
      `A2 scope: reward-bearing save (Claim Ledger with the seeded Crowns per-resource cap filled, ` +
      `a partial-claim held remainder at the Iron 3S hard stop, ${ledger.story_claims.length} Story Claim(s), ` +
      `${pending.length} persistent pending record(s)) save→load→re-serialize byte-identical; claim_ledger and ` +
      `pending_reward_resolution blocks preserved exactly; repeated load byte-identical (no reload duplication). ` +
      `All amounts/counts from schema-validated seeds.`,
  };
}

/**
 * S7 @ A2: a known-good REWARD-BEARING save must survive — byte-identical and
 * loadable — a simulated crash at every pre-commit pipeline point, plus a
 * schema-validation abort; a subsequent successful save must swap in the new
 * state and preserve the prior good save as rollback. Because the prior save
 * (with its ledger packages, story claim, held remainder, and pending record)
 * is byte-identical after every crash, and a failed save never commits, a
 * crash can neither duplicate nor lose a reward (Save/Load §15).
 */
export function proveCrashDuringWriteSurvival(
  dir: string,
  validate: SaveBlobValidator,
  storageSeed: ResourceStorageSeed,
  rulesSeed: ClaimLedgerRulesSeed,
): ProofResult {
  const slot = join(dir, "crash.save.json");
  const worldClock: WorldClock = { day_index: 0, time_of_day: 0 };
  const rewardState = buildRewardBearingState(storageSeed, rulesSeed, worldClock);
  const v1: SaveBlob = {
    ...createEmptySaveBlob({ game_version: PROOF_GAME_VERSION, last_saved_utc: PROOF_UTC_V1 }),
    resources: toResourceBands(rewardState.harbor),
    claim_ledger: rewardState.ledger,
    pending_reward_resolution: [...rewardState.pending],
  };
  const v2: SaveBlob = { ...v1, meta: { ...v1.meta, last_saved_utc: PROOF_UTC_V2 } };

  saveAtomically(slot, v1, { validate });
  const v1Bytes = readFileSync(slot, "utf8");

  const crashAt = (point: string) => () => {
    throw new SimulatedCrashError(point);
  };
  const crashPoints: ReadonlyArray<readonly [string, CrashSimulationHooks]> = [
    ["during temp write (torn/partial write)", { duringTempWrite: crashAt("during temp write") }],
    ["before flush (fsync)", { beforeFlush: crashAt("before flush") }],
    ["before rollback preservation", { beforeRollback: crashAt("before rollback") }],
    ["before commit rename", { beforeCommit: crashAt("before commit") }],
  ];

  for (const [label, hooks] of crashPoints) {
    let threw = false;
    try {
      saveAtomically(slot, v2, { validate, hooks });
    } catch (err) {
      threw = err instanceof SimulatedCrashError;
    }
    if (!threw) {
      return failed(`S7 crash sim [${label}]: pipeline did not surface the simulated crash`);
    }
    if (readFileSync(slot, "utf8") !== v1Bytes) {
      return failed(`S7 crash sim [${label}]: prior good save was NOT byte-identical after the crash — S7 violated`);
    }
    if (canonicalSerialize(loadSave(slot, validate)) !== v1Bytes) {
      return failed(`S7 crash sim [${label}]: prior good save no longer loads to the same state — S7 violated`);
    }
  }

  // Schema-validation abort (§15 step 2): an invalid blob must never commit.
  const corrupt = { ...v2, threat: { phase: "not_a_raid_phase" } } as unknown as SaveBlob;
  let validationAborted = false;
  try {
    saveAtomically(slot, corrupt, { validate });
  } catch (err) {
    validationAborted = err instanceof SaveValidationError;
  }
  if (!validationAborted) {
    return failed("S7 validation abort: schema-invalid blob was not rejected before commit");
  }
  if (readFileSync(slot, "utf8") !== v1Bytes) {
    return failed("S7 validation abort: prior good save was disturbed by a rejected save");
  }

  // A subsequent good save must commit (stale temp from the crash sims is inert) and keep v1 as rollback.
  const committed = saveAtomically(slot, v2, { validate });
  if (readFileSync(slot, "utf8") !== canonicalSerialize(v2)) {
    return failed("S7 recovery: post-crash save did not commit the new state");
  }
  if (!committed.rollback_preserved || readFileSync(rollbackPath(slot), "utf8") !== v1Bytes) {
    return failed("S7 recovery: prior good save was not preserved as rollback after the successful commit");
  }

  return {
    pass: true,
    detail:
      `A2 reward-bearing scope: prior good save (${Buffer.byteLength(v1Bytes)} bytes — Claim Ledger packages incl. ` +
      `a partial-claim held remainder, a Story Claim, and a persistent pending record) survived byte-identical and ` +
      `loadable through 4 simulated crash points (torn temp write · pre-fsync · pre-rollback · pre-rename) plus a ` +
      `schema-validation abort; the next successful save committed atomically and preserved the prior save as ` +
      `rollback. No partial write ever became the current save; no crash duplicated or lost a reward.`,
  };
}

// ── A4 expedition-bearing proofs (SaveBlob v4) ───────────────────────────────

/** Apply one command in a proof, asserting it was really applied (not an idempotent no-op). */
function drive(domain: ExpeditionDomain, command: ExpeditionCommand, seed: ExpeditionSeed): ExpeditionDomain {
  const result = applyCommand(domain, command, { seed: PROOF_EXPEDITION_SEED, content: seed.content });
  if (!result.applied) {
    throw new Error(`expedition proof: command ${command.kind} was not applied`);
  }
  return result.domain;
}

/**
 * Deterministic mid-loop A4 domain for the save proofs: one full-success
 * expedition run to completion (populating completed_expeditions, the
 * route-anchor unlock, and — when the seeded salvage exceeds the target
 * resource's 3S room — the unsafe Overflow), then a SECOND expedition left
 * mid-loop at `docked` with recovered cargo aboard. All amounts derive from
 * the schema-validated storage + expedition seeds (No Magic Numbers).
 */
export function buildExpeditionBearingDomain(
  storageSeed: ResourceStorageSeed,
  expeditionSeed: ExpeditionSeed,
): ExpeditionDomain {
  let domain: ExpeditionDomain = {
    expedition: createExpeditionState(),
    harbor_operations: createHarborOperationsState(),
    harbor: createHarborState(storageSeed),
  };

  // First expedition: full loop to completion with Nova (Crowns composition).
  domain = drive(domain, { command_id: "p1.prepare", kind: "prepare", guardian_id: "gdn.nova" }, expeditionSeed);
  domain = drive(domain, { command_id: "p1.dispatch", kind: "dispatch" }, expeditionSeed);
  domain = drive(domain, { command_id: "p1.arrive", kind: "arrive" }, expeditionSeed);
  domain = drive(domain, { command_id: "p1.resolve", kind: "resolve", outcome: "full_success" }, expeditionSeed);
  domain = drive(domain, { command_id: "p1.dock", kind: "dock" }, expeditionSeed);
  // Unload until the hold is empty (Safe Storage → Overflow); bounded loop.
  for (let i = 0; i < CORE_RESOURCES.length + 1 && domain.expedition.active !== null; i += 1) {
    const before = domain;
    domain = drive(domain, { command_id: `p1.unload.${i}`, kind: "unload" }, expeditionSeed);
    const remaining = domain.expedition.active?.cargo_aboard ?? {};
    if (Object.keys(remaining).length === 0) break;
    if (domain === before) break;
  }
  domain = drive(domain, { command_id: "p1.complete", kind: "complete" }, expeditionSeed);
  if (domain.expedition.phase === "recovering") {
    domain = drive(domain, { command_id: "p1.recover", kind: "recover" }, expeditionSeed);
  }

  // Second expedition: leave mid-loop at `docked` with cargo aboard (partial success).
  domain = drive(domain, { command_id: "p2.prepare", kind: "prepare", guardian_id: "gdn.tarin" }, expeditionSeed);
  domain = drive(domain, { command_id: "p2.dispatch", kind: "dispatch" }, expeditionSeed);
  domain = drive(domain, { command_id: "p2.arrive", kind: "arrive" }, expeditionSeed);
  domain = drive(domain, { command_id: "p2.resolve", kind: "resolve", outcome: "partial_success" }, expeditionSeed);
  domain = drive(domain, { command_id: "p2.dock", kind: "dock" }, expeditionSeed);

  assertExpeditionDomainValid(domain, expeditionSeed.content);
  return domain;
}

/** Project an expedition-bearing domain onto a full SaveBlob v4. */
function expeditionBearingBlob(domain: ExpeditionDomain, utc: string): SaveBlob {
  return {
    ...createEmptySaveBlob({ game_version: PROOF_GAME_VERSION, last_saved_utc: utc }),
    resources: toResourceBands(domain.harbor),
    expedition: domain.expedition,
    harbor_operations: domain.harbor_operations,
  };
}

/**
 * S5 @ A4: the EXPEDITION-BEARING state round-trips byte-identically — the
 * active expedition (phase, guardian, cargo aboard, resolved event instance),
 * the completed-count / route-anchor unlock, and the unsafe Overflow holdings
 * all survive save → load exactly (brief §2 exact save/relaunch/resume;
 * Save/Load §16). Repeated load is byte-identical (no reload duplication).
 */
export function proveExpeditionStateRoundTrip(
  dir: string,
  validate: SaveBlobValidator,
  storageSeed: ResourceStorageSeed,
  expeditionSeed: ExpeditionSeed,
): ProofResult {
  const slot = join(dir, "expedition-roundtrip.save.json");
  const domain = buildExpeditionBearingDomain(storageSeed, expeditionSeed);
  const blob = expeditionBearingBlob(domain, PROOF_UTC_V1);

  saveAtomically(slot, blob, { validate });
  const onDisk = readFileSync(slot, "utf8");
  const loaded = loadSave(slot, validate);
  if (canonicalSerialize(loaded) !== onDisk) {
    return failed("S5 expedition round-trip: save→load→re-serialize NOT byte-identical for the expedition-bearing state");
  }
  if (canonicalSerialize(loaded.expedition) !== canonicalSerialize(domain.expedition)) {
    return failed("S5 expedition round-trip: expedition block changed across save/load — hidden state loss/mutation");
  }
  if (canonicalSerialize(loaded.harbor_operations) !== canonicalSerialize(domain.harbor_operations)) {
    return failed("S5 expedition round-trip: harbor_operations block changed across save/load (overflow/unlock/count)");
  }
  const reloaded = loadSave(slot, validate);
  if (canonicalSerialize(reloaded) !== canonicalSerialize(loaded)) {
    return failed("S5 expedition round-trip: repeated load produced a different state — reload duplication/mutation");
  }
  // Rebuild the full domain from the loaded blob + seed; it must pass every A4 invariant.
  assertExpeditionDomainValid(
    { expedition: loaded.expedition, harbor_operations: loaded.harbor_operations, harbor: fromResourceBands(loaded.resources, storageSeed) },
    expeditionSeed.content,
  );

  const active = domain.expedition.active;
  const overflowResources = Object.keys(domain.harbor_operations.overflow).length;
  return {
    pass: true,
    detail:
      `A4 scope: expedition-bearing save (completed_expeditions=${domain.harbor_operations.completed_expeditions}, ` +
      `route_anchor_operations_unlocked=${domain.harbor_operations.route_anchor_operations_unlocked}, ` +
      `overflow over ${overflowResources} resource(s); a second expedition at phase "${domain.expedition.phase}" ` +
      `with ${active ? Object.keys(active.cargo_aboard).length : 0} resource(s) aboard and a ${active?.event?.state ?? "no"} ` +
      `event instance) save→load→re-serialize byte-identical; expedition and harbor_operations preserved exactly; ` +
      `repeated load byte-identical; rebuilt domain passes every A4 invariant. All amounts from schema-validated seeds.`,
  };
}

/**
 * S7 @ A4: a known-good EXPEDITION-BEARING save survives — byte-identical and
 * loadable — a simulated crash at every pre-commit pipeline point, plus a
 * schema-validation abort; a subsequent successful save swaps in the new state
 * and preserves the prior good save as rollback. A crash can neither duplicate
 * the recovered cargo/overflow nor lose the mid-loop expedition (Save/Load §15).
 */
export function proveExpeditionCrashSurvival(
  dir: string,
  validate: SaveBlobValidator,
  storageSeed: ResourceStorageSeed,
  expeditionSeed: ExpeditionSeed,
): ProofResult {
  const slot = join(dir, "expedition-crash.save.json");
  const domain = buildExpeditionBearingDomain(storageSeed, expeditionSeed);
  const v1 = expeditionBearingBlob(domain, PROOF_UTC_V1);
  const v2: SaveBlob = { ...v1, meta: { ...v1.meta, last_saved_utc: PROOF_UTC_V2 } };

  saveAtomically(slot, v1, { validate });
  const v1Bytes = readFileSync(slot, "utf8");

  const crashAt = (point: string) => () => {
    throw new SimulatedCrashError(point);
  };
  const crashPoints: ReadonlyArray<readonly [string, CrashSimulationHooks]> = [
    ["during temp write (torn/partial write)", { duringTempWrite: crashAt("during temp write") }],
    ["before flush (fsync)", { beforeFlush: crashAt("before flush") }],
    ["before rollback preservation", { beforeRollback: crashAt("before rollback") }],
    ["before commit rename", { beforeCommit: crashAt("before commit") }],
  ];

  for (const [label, hooks] of crashPoints) {
    let threw = false;
    try {
      saveAtomically(slot, v2, { validate, hooks });
    } catch (err) {
      threw = err instanceof SimulatedCrashError;
    }
    if (!threw) return failed(`S7 expedition crash sim [${label}]: pipeline did not surface the simulated crash`);
    if (readFileSync(slot, "utf8") !== v1Bytes) {
      return failed(`S7 expedition crash sim [${label}]: prior good save was NOT byte-identical after the crash — S7 violated`);
    }
    if (canonicalSerialize(loadSave(slot, validate)) !== v1Bytes) {
      return failed(`S7 expedition crash sim [${label}]: prior good save no longer loads to the same state — S7 violated`);
    }
  }

  // Schema-validation abort: a malformed expedition block must never commit.
  const corrupt = { ...v2, expedition: { ...v2.expedition, phase: "not_a_phase" } } as unknown as SaveBlob;
  let validationAborted = false;
  try {
    saveAtomically(slot, corrupt, { validate });
  } catch {
    validationAborted = true;
  }
  if (!validationAborted) return failed("S7 expedition validation abort: malformed expedition blob was not rejected before commit");
  if (readFileSync(slot, "utf8") !== v1Bytes) {
    return failed("S7 expedition validation abort: prior good save was disturbed by a rejected save");
  }

  const committed = saveAtomically(slot, v2, { validate });
  if (readFileSync(slot, "utf8") !== canonicalSerialize(v2)) {
    return failed("S7 expedition recovery: post-crash save did not commit the new state");
  }
  if (!committed.rollback_preserved || readFileSync(rollbackPath(slot), "utf8") !== v1Bytes) {
    return failed("S7 expedition recovery: prior good save was not preserved as rollback after the successful commit");
  }

  return {
    pass: true,
    detail:
      `A4 scope: prior good save (${Buffer.byteLength(v1Bytes)} bytes — a completed expedition's overflow/unlock/count ` +
      `plus a second expedition mid-loop at "docked" with cargo aboard) survived byte-identical and loadable through 4 ` +
      `simulated crash points plus a schema-validation abort; the next successful save committed atomically and ` +
      `preserved the prior save as rollback. No crash duplicated the recovered cargo or lost the mid-loop expedition.`,
  };
}
