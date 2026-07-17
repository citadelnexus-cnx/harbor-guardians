/**
 * Save/load proofs — the executable evidence behind S5 (round-trip) and S7
 * (atomic save integrity). S5 runs at two scopes: the M0 empty-shell
 * round-trip and, since Alpha A1, the stocked harbor-state round-trip
 * (seeded 3S storage bands incl. Crowns — owner A1 authorization,
 * 2026-07-16). One implementation, two consumers: `tests/save-load.test.ts`
 * and the sim-harness registry checks (claim-to-test, CLAUDE.md §3 — the
 * harness is the arbiter of "done").
 *
 * Detail strings are deterministic (no paths, no wall-clock) so the harness
 * repeat-run determinism proof holds over them.
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15/§16;
 * SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.6 (S5/S7), §7 ("Milestone 0 exit:
 * … S5/S7 pass on the empty shell"), §8 (evidence rules).
 * Invariant refs: S5, S7.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ResourceStorageSeed } from "../contracts/resource-storage.js";
import type { SaveBlob } from "../contracts/save-blob.js";
import { CORE_RESOURCES, createHarborState, deposit, fromResourceBands, toResourceBands } from "../sim/harbor-state.js";
import { canonicalSerialize } from "./canonical-json.js";
import { loadSave, rollbackPath, saveAtomically, tempPath, type CrashSimulationHooks } from "./atomic-save.js";
import { createEmptySaveBlob } from "./empty-save.js";
import { SaveValidationError, type SaveBlobValidator } from "./save-blob-validator.js";

/** Deterministic proof fixtures — test parameters, not gameplay values (Sim §8: seeds/inputs recorded). */
const PROOF_GAME_VERSION = "0.0.0";
const PROOF_UTC_V1 = "2026-01-01T00:00:00.000Z";
const PROOF_UTC_V2 = "2026-01-01T00:00:01.000Z";

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
 * S7 @ M0: a known-good save must survive — byte-identical and loadable — a
 * simulated crash at every pre-commit pipeline point, plus a schema-validation
 * abort; a subsequent successful save must swap in the new state and preserve
 * the prior good save as rollback.
 */
export function proveCrashDuringWriteSurvival(dir: string, validate: SaveBlobValidator): ProofResult {
  const slot = join(dir, "crash.save.json");
  const v1 = createEmptySaveBlob({ game_version: PROOF_GAME_VERSION, last_saved_utc: PROOF_UTC_V1 });
  const v2 = createEmptySaveBlob({ game_version: PROOF_GAME_VERSION, last_saved_utc: PROOF_UTC_V2 });

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
      `M0 empty-shell scope (Sim §7 M0 exit): prior good save (${Buffer.byteLength(v1Bytes)} bytes) survived ` +
      `byte-identical and loadable through 4 simulated crash points (torn temp write · pre-fsync · pre-rollback · ` +
      `pre-rename) plus a schema-validation abort; the next successful save committed atomically and preserved the ` +
      `prior save as rollback. No partial write ever became the current save. Reward-duplication half of S7 ` +
      `remains FUTURE BUILD until rewards exist.`,
  };
}
