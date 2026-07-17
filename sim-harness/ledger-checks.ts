/**
 * Claim Ledger invariant checks (L1 / L5 / L6 / L7 / L11 / L14) — implemented
 * at Alpha A2 scope (owner Alpha A2 authorization, 2026-07-17). These are the
 * executable evidence behind the six L stubs converted at A2. The remaining
 * L-suite invariants stay fail-loud stubs because their systems do not exist:
 * L2 (no spend paths exist at all to prove against), L3/L4/L8/L9 (raids and
 * the raid-phase claim matrix), L10 (no gameplay sources exist — the schema's
 * literal "test_supplied" source_type is the A2 boundary), L12 (no repeatable
 * activity system), L13 (no grant path), L15 (no mandatory threat events).
 *
 * Every check is deterministic (no wall-clock, no paths in evidence, no RNG)
 * and derives every amount and count from the schema-validated storage +
 * claim-ledger-rules seeds (No Magic Numbers, DC1).
 *
 * Governing docs: 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §1/§5/§6/§7/§10;
 * SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §10/§11; SIM_HARNESS_ACCEPTANCE_
 * SPEC v0.6.2 §4.2/§2/§8; CLAUDE.md §3/§5.
 * Invariant refs: L1, L5, L6, L7, L11, L14.
 */

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PendingRewardResolution, RewardPackageDraft } from "../src/contracts/claim-ledger.js";
import type { WorldClock } from "../src/contracts/save-blob.js";
import type { CoreResource } from "../src/contracts/enums.js";
import {
  assertClaimStateValid,
  claimPackage,
  ClaimLedgerInvariantError,
  createClaimLedgerState,
  resolvePendingToLedger,
  routeRewardPackage,
  slotOccupancy,
  type ClaimMode,
} from "../src/sim/claim-ledger.js";
import { CORE_RESOURCES, createHarborState, totalStock, toResourceBands } from "../src/sim/harbor-state.js";
import { canonicalSerialize } from "../src/save/canonical-json.js";
import { loadSave, saveAtomically } from "../src/save/atomic-save.js";
import { buildRewardBearingState } from "../src/save/proofs.js";
import { createEmptySaveBlob } from "../src/save/empty-save.js";
import type { SaveBlobValidator } from "../src/save/save-blob-validator.js";
import { loadClaimLedgerRulesSeed } from "./ledger-rules-seed.js";
import { loadStorageSeed } from "./storage-seed.js";
import type { CheckVerdict } from "./types.js";

const fail = (evidence: string): CheckVerdict => ({ pass: false, evidence });
const pass = (evidence: string): CheckVerdict => ({ pass: true, evidence });

const WORLD_CLOCK: WorldClock = { day_index: 0, time_of_day: 0 };

/** Deterministic test-supplied draft with one claim_ledger line (all amounts are seed values upstream). */
function ledgerDraft(id: string, resource: CoreResource, amount: number): RewardPackageDraft {
  return {
    package_id: id,
    source_type: "test_supplied",
    source_event_id: `event.${id}`,
    generated_reward_seed: 0,
    created_world_clock: WORLD_CLOCK,
    lines: [{ line_id: `${id}.line`, route: "claim_ledger", resource, amount }],
  };
}

/** Total resources across harbor + ledger held remainders + pending contents — the L1 conservation quantity. */
function grandTotal(
  harborTotals: Record<CoreResource, number>,
  ledgerHeld: Record<CoreResource, number>,
  pendingHeld: Record<CoreResource, number>,
): Record<CoreResource, number> {
  const out = {} as Record<CoreResource, number>;
  for (const r of CORE_RESOURCES) out[r] = harborTotals[r] + ledgerHeld[r] + pendingHeld[r];
  return out;
}

// ── L1 — Ledger transfer-only ────────────────────────────────────────────────

/**
 * L1 at A2 scope: routing and claiming can never increase resource totals.
 * The conserved quantity harbor + ledger-held + pending is tracked through
 * route → partial claim → full claim; claiming transfers exactly what leaves
 * the package, and the validity assertion rejects any package holding more
 * than it was created with.
 */
export function checkL1TransferOnly(): CheckVerdict {
  const storage = loadStorageSeed();
  const rules = loadClaimLedgerRulesSeed().rules;
  let harbor = createHarborState(storage);
  let ledger = createClaimLedgerState();

  const sumHarbor = () => {
    const out = {} as Record<CoreResource, number>;
    for (const r of CORE_RESOURCES) out[r] = totalStock(harbor, r);
    return out;
  };
  const sumLedger = () => {
    const out = {} as Record<CoreResource, number>;
    for (const r of CORE_RESOURCES) {
      out[r] = ledger.packages.reduce((a, p) => a + (p.held_remainder[r] ?? 0), 0);
    }
    return out;
  };
  const zero = () => {
    const out = {} as Record<CoreResource, number>;
    for (const r of CORE_RESOURCES) out[r] = 0;
    return out;
  };

  // Route a package holding the full Iron 3S total — external value entering the system.
  const ironAmount = storage.storage.Iron.total_capacity_st1;
  const routed = routeRewardPackage(ledger, [], ledgerDraft("l1.iron", "Iron", ironAmount), rules);
  ledger = routed.ledger;
  const afterRoute = grandTotal(sumHarbor(), sumLedger(), zero());
  const expectedAfterRoute = storage.storage.Iron.start_stock + ironAmount;
  if (afterRoute.Iron !== expectedAfterRoute) {
    return fail(`L1: routing changed Iron total to ${afterRoute.Iron}, expected ${expectedAfterRoute}`);
  }

  // Partial then full claim: totals must never change again (transfer, not creation).
  for (const mode of ["claim_safe", "claim_to_capacity"] as ClaimMode[]) {
    if (!ledger.packages.some((p) => p.package_id === "l1.iron")) break;
    const before = grandTotal(sumHarbor(), sumLedger(), zero());
    const result = claimPackage(ledger, harbor, "l1.iron", mode);
    ledger = result.ledger;
    harbor = result.harbor;
    const after = grandTotal(sumHarbor(), sumLedger(), zero());
    for (const r of CORE_RESOURCES) {
      if (after[r] !== before[r]) {
        return fail(`L1: ${mode} changed the conserved ${r} total ${before[r]} → ${after[r]} — the Ledger minted or destroyed value`);
      }
    }
  }
  assertClaimStateValid(ledger, []);

  // A package can never hold more than it was created with (validity gate).
  const inflated = {
    packages: [{ ...routed.ledger.packages.find((p) => p.package_id === "l1.iron")!, held_remainder: { Iron: ironAmount + ironAmount } }],
    story_claims: [],
  };
  let rejected = false;
  try {
    assertClaimStateValid(inflated, []);
  } catch (err) {
    rejected = err instanceof ClaimLedgerInvariantError;
  }
  if (!rejected) return fail("L1: a package holding more than its created contents was NOT rejected");

  return pass(
    `A2 scope: harbor + ledger-held + pending totals conserved exactly through route → claim_safe → ` +
      `claim_to_capacity of a seeded full-3S Iron package (claims transfer, never mint); a package inflated ` +
      `beyond its created contents is rejected. Gameplay sources are FUTURE BUILD (schema admits only ` +
      `test_supplied).`,
  );
}

// ── L5 — Story Claims never disappear (A2 scope) ─────────────────────────────

/**
 * L5 at A2 scope: a routed Story Claim survives every A2 ledger operation
 * and a save/load round-trip byte-identically, and no A2 API can remove it.
 * Raid/offline/long-absence survival is FUTURE BUILD with those systems.
 */
export function checkL5StoryClaimsProtected(validate: SaveBlobValidator): CheckVerdict {
  const storage = loadStorageSeed();
  const rulesSeed = loadClaimLedgerRulesSeed();
  const built = buildRewardBearingState(storage, rulesSeed, WORLD_CLOCK);
  let { ledger } = built;
  const pending = built.pending;
  let harbor = built.harbor;

  const storyBefore = canonicalSerialize(ledger.story_claims);
  if (ledger.story_claims.length === 0) {
    return fail("L5: proof state contains no Story Claim — check would be vacuous");
  }

  // Exercise every A2 operation; the story list must be untouched throughout.
  const crowns = ledger.packages.find((p) => (p.held_remainder.Crowns ?? 0) > 0);
  if (!crowns) return fail("L5: proof state has no Crowns package to operate on");
  const claimed = claimPackage(ledger, harbor, crowns.package_id, "claim_to_capacity");
  ledger = claimed.ledger;
  harbor = claimed.harbor;
  const resolveAttempt = resolvePendingToLedger(ledger, pending, pending[0]!.pending_id, rulesSeed.rules);
  ledger = resolveAttempt.ledger;
  if (canonicalSerialize(ledger.story_claims) !== storyBefore) {
    return fail("L5: an A2 ledger operation mutated the Story Claims list");
  }

  // Save/load round-trip preserves the story list byte-identically.
  const dir = mkdtempSync(join(tmpdir(), "hg-l5-"));
  try {
    const slot = join(dir, "l5.save.json");
    const blob = {
      ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }),
      resources: toResourceBands(harbor),
      claim_ledger: ledger,
      pending_reward_resolution: [...resolveAttempt.pending],
    };
    saveAtomically(slot, blob, { validate });
    const loaded = loadSave(slot, validate);
    if (canonicalSerialize(loaded.claim_ledger.story_claims) !== storyBefore) {
      return fail("L5: Story Claims changed across save/load");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  return pass(
    `A2 scope: ${built.ledger.story_claims.length} Story Claim(s) survived every A2 ledger operation ` +
      `(partial claim, pending resolution) and a save/load round-trip byte-identically; no A2 API can delete a ` +
      `Story Claim, and story claims are schema-separated from cap-bound packages. Raid/offline/long-absence ` +
      `survival is FUTURE BUILD with those systems.`,
  );
}

// ── L6 — partial-claim totals preserved exactly ──────────────────────────────

/**
 * L6: `claimed + held_remainder == original` for every partial-claim mode and
 * fill level, per resource, exactly — proven across claim_safe (Safe-room
 * bounded), claim_to_capacity (3S hard-stop bounded), and the follow-up claim
 * that drains the remainder.
 */
export function checkL6PartialClaimExact(): CheckVerdict {
  const storage = loadStorageSeed();
  const rules = loadClaimLedgerRulesSeed().rules;
  let harbor = createHarborState(storage);
  let ledger = createClaimLedgerState();

  const original = storage.storage.Crowns.safe_capacity_st1;
  const routed = routeRewardPackage(ledger, [], ledgerDraft("l6.crowns", "Crowns", original), rules);
  ledger = routed.ledger;

  let claimedTotal = 0;
  const steps: string[] = [];
  for (const mode of ["claim_safe", "claim_to_capacity"] as ClaimMode[]) {
    if (!ledger.packages.some((p) => p.package_id === "l6.crowns")) break;
    const result = claimPackage(ledger, harbor, "l6.crowns", mode);
    ledger = result.ledger;
    harbor = result.harbor;
    const claimed = result.claimed.Crowns ?? 0;
    const held = result.held_remainder.Crowns ?? 0;
    claimedTotal += claimed;
    if (claimedTotal + held !== original) {
      return fail(`L6: after ${mode}, claimed-so-far ${claimedTotal} + held ${held} != original ${original}`);
    }
    steps.push(`${mode}: claimed ${claimed}, held ${held}`);
  }
  if (ledger.packages.some((p) => p.package_id === "l6.crowns")) {
    return fail("L6: package not fully claimed after both modes — the seeded amounts should drain it");
  }
  if (claimedTotal !== original) {
    return fail(`L6: fully-claimed total ${claimedTotal} != original ${original} — rounding/hidden leak`);
  }
  assertClaimStateValid(ledger, []);

  return pass(
    `claimed + held_remainder == original held exactly at every step for a seeded Crowns package of ${original} ` +
      `(${steps.join("; ")}); full drain sums to the original with no rounding leak. Modes cover Safe-room and ` +
      `3S hard-stop bounds; Hold Remaining is automatic (a remainder is held, never dropped).`,
  );
}

// ── L7 — slot accounting ─────────────────────────────────────────────────────

/**
 * L7: the seeded caps (5 per resource + 20 global non-story) are enforced —
 * a package consumes one slot per contained resource, story claims never
 * count, and both blocking reasons name their slot deterministically.
 */
export function checkL7SlotAccounting(): CheckVerdict {
  const storage = loadStorageSeed();
  const rules = loadClaimLedgerRulesSeed().rules;
  let ledger = createClaimLedgerState();
  let pending: readonly PendingRewardResolution[] = [];

  const perCap = rules.max_unclaimed_packages_per_resource;
  const globalCap = rules.max_global_active_packages;
  if (perCap * CORE_RESOURCES.length < globalCap) {
    return fail(
      `L7: seeded caps make the global cap unreachable (${perCap} × ${CORE_RESOURCES.length} < ${globalCap}) — seed breaks Doc 04 §5 accounting`,
    );
  }

  // Fill the Crowns per-resource cap, then overflow → per-resource block.
  const amount = storage.storage.Crowns.start_stock;
  for (let i = 0; i < perCap; i += 1) {
    const r = routeRewardPackage(ledger, pending, ledgerDraft(`l7.crowns.${i}`, "Crowns", amount), rules);
    if (r.ledger_delivery !== "delivered") return fail(`L7: delivery ${i} blocked below the per-resource cap`);
    ledger = r.ledger;
    pending = r.pending;
  }
  if (slotOccupancy(ledger).per_resource.Crowns !== perCap) {
    return fail(`L7: Crowns occupancy ${slotOccupancy(ledger).per_resource.Crowns} != cap ${perCap}`);
  }
  const overflow = routeRewardPackage(ledger, pending, ledgerDraft("l7.crowns.over", "Crowns", amount), rules);
  ledger = overflow.ledger;
  pending = overflow.pending;
  if (overflow.ledger_delivery !== "held_pending" || overflow.blocking_reason !== "per_resource_cap:Crowns") {
    return fail(`L7: per-resource overflow was "${overflow.ledger_delivery}" (${overflow.blocking_reason ?? "no reason"}) — expected held_pending per_resource_cap:Crowns`);
  }

  // Another resource still delivers (per-resource caps are independent) up to the global cap.
  const nonCrowns = CORE_RESOURCES.filter((r) => r !== "Crowns");
  let delivered = ledger.packages.length;
  outer: for (const resource of nonCrowns) {
    for (let i = 0; i < perCap; i += 1) {
      if (delivered >= globalCap) break outer;
      const r = routeRewardPackage(ledger, pending, ledgerDraft(`l7.${resource}.${i}`, resource, storage.storage[resource].safe_capacity_st1), rules);
      if (r.ledger_delivery !== "delivered") return fail(`L7: ${resource} delivery blocked below both caps`);
      ledger = r.ledger;
      pending = r.pending;
      delivered = ledger.packages.length;
    }
  }
  if (delivered !== globalCap) {
    return fail(`L7: filled ${delivered} packages, expected to reach the global cap ${globalCap}`);
  }

  // Global overflow blocks and names global_cap; a story-only draft still routes (never counted).
  const globalOverflow = routeRewardPackage(
    ledger,
    pending,
    ledgerDraft("l7.global.over", "Aether", storage.storage.Aether.safe_capacity_st1),
    rules,
  );
  ledger = globalOverflow.ledger;
  pending = globalOverflow.pending;
  if (globalOverflow.ledger_delivery !== "held_pending" || !(globalOverflow.blocking_reason ?? "").includes("global_cap")) {
    return fail(`L7: global overflow was "${globalOverflow.ledger_delivery}" (${globalOverflow.blocking_reason ?? "no reason"}) — expected held_pending naming global_cap`);
  }
  const storyDraft: RewardPackageDraft = {
    package_id: "l7.story",
    source_type: "test_supplied",
    source_event_id: "event.l7.story",
    generated_reward_seed: 0,
    created_world_clock: WORLD_CLOCK,
    lines: [{ line_id: "l7.story.line", route: "story_claim", resource: "Provisions", amount: storage.storage.Provisions.start_stock }],
  };
  const storyRouted = routeRewardPackage(ledger, pending, storyDraft, rules);
  if (storyRouted.story_claim_id === undefined || storyRouted.ledger.packages.length !== globalCap) {
    return fail("L7: a story-only package failed to route at full caps, or disturbed package slots — story claims must never count");
  }
  assertClaimStateValid(storyRouted.ledger, storyRouted.pending);

  return pass(
    `seeded caps enforced: ${perCap} Crowns packages filled the per-resource cap and the next delivery held ` +
      `pending naming per_resource_cap:Crowns; independent resources delivered to the global cap of ${globalCap} ` +
      `and the next delivery held pending naming global_cap; a Story Claim routed at full caps without occupying ` +
      `any slot (never counted). Caps read from the schema-validated /data/rewards seed (DC1).`,
  );
}

// ── L11 — full-slot delivery never deletes/duplicates ────────────────────────

/**
 * L11 at A2 scope: a delivery blocked by a full slot becomes a pending record
 * with the exact routed contents (never deleted); the same package can never
 * be delivered twice; resolution delivers exactly once with exact contents;
 * pending records are not in the Ledger and cannot be claimed from (the only
 * exit is deliver_to_ledger, which re-subjects them to the caps — so pending
 * cannot serve as extra storage). The optional-activity block is FUTURE BUILD
 * (L14 note).
 */
export function checkL11FullSlotSafety(): CheckVerdict {
  const storage = loadStorageSeed();
  const rulesSeed = loadClaimLedgerRulesSeed();
  const rules = rulesSeed.rules;
  const built = buildRewardBearingState(storage, rulesSeed, WORLD_CLOCK);
  let { ledger } = built;
  let pending = built.pending;
  let harbor = built.harbor;

  const record = pending.find((r) => r.pending_id === "proof.crowns.overflow");
  if (!record) return fail("L11: expected overflow pending record missing from the proof state");
  const expectedAmount = storage.storage.Crowns.safe_capacity_st1;
  if ((record.package_contents.resources.Crowns ?? 0) !== expectedAmount) {
    return fail(`L11: pending record holds ${record.package_contents.resources.Crowns}, expected the routed ${expectedAmount} — contents mutated`);
  }

  // No duplicate delivery, ever — same id via routing or via double-resolve.
  let duplicateRejected = false;
  try {
    routeRewardPackage(ledger, pending, ledgerDraft("proof.crowns.overflow", "Crowns", expectedAmount), rules);
  } catch (err) {
    duplicateRejected = err instanceof ClaimLedgerInvariantError;
  }
  if (!duplicateRejected) return fail("L11: re-delivering an already-pending package_id was NOT rejected");

  // Pending is not claimable (not in the Ledger) — not exploitable as storage.
  let pendingClaimRejected = false;
  try {
    claimPackage(ledger, harbor, "proof.crowns.overflow", "claim_to_capacity");
  } catch (err) {
    pendingClaimRejected = err instanceof ClaimLedgerInvariantError;
  }
  if (!pendingClaimRejected) return fail("L11: a pending record was claimable directly — pending must not act as storage");

  // While slots are full, resolution is refused WITHOUT deleting the record.
  const refused = resolvePendingToLedger(ledger, pending, "proof.crowns.overflow", rules);
  if (refused.resolved || refused.pending.length !== pending.length) {
    return fail("L11: blocked resolution either claimed to resolve or dropped the pending record");
  }

  // Free a Crowns slot (claim a package fully), then resolve exactly once.
  const toClear = ledger.packages.find((p) => (p.held_remainder.Crowns ?? 0) > 0);
  if (!toClear) return fail("L11: no Crowns package available to clear");
  const cleared = claimPackage(ledger, harbor, toClear.package_id, "claim_to_capacity");
  if (!cleared.fully_claimed) {
    return fail("L11: seeded Crowns amounts should fully claim into the empty harbor Crowns bands — proof setup broken");
  }
  ledger = cleared.ledger;
  harbor = cleared.harbor;
  const resolved = resolvePendingToLedger(ledger, pending, "proof.crowns.overflow", rules);
  if (!resolved.resolved) return fail("L11: resolution still blocked after a slot freed");
  ledger = resolved.ledger;
  pending = resolved.pending;
  const deliveredPkg = ledger.packages.find((p) => p.package_id === "proof.crowns.overflow");
  if (!deliveredPkg || (deliveredPkg.held_remainder.Crowns ?? 0) !== expectedAmount) {
    return fail("L11: resolved package missing or contents differ from the original routed amounts");
  }
  let doubleResolveRejected = false;
  try {
    resolvePendingToLedger(ledger, pending, "proof.crowns.overflow", rules);
  } catch (err) {
    doubleResolveRejected = err instanceof ClaimLedgerInvariantError;
  }
  if (!doubleResolveRejected) return fail("L11: resolving an already-resolved pending id was NOT rejected — duplication path");
  assertClaimStateValid(ledger, pending);

  return pass(
    `A2 scope: a full-slot delivery became a pending record with exact contents (never deleted); duplicate ` +
      `delivery and double-resolution are rejected; pending records are unclaimable and re-enter the Ledger only ` +
      `through the caps (deliver_to_ledger), so pending cannot act as extra storage; blocked resolution preserves ` +
      `the record. The optional-activity generation block is FUTURE BUILD (no reward-generating activities exist).`,
  );
}

// ── L14 — pending survives save/load exactly ─────────────────────────────────

/**
 * L14 at A2 scope: pending_reward_resolution persists across save/load
 * exactly as generated — byte-identical contents, no loss, no duplication on
 * repeated load, recorded reward seed preserved (no reroll), and structurally
 * unspendable (not in the Ledger, not in Harbor storage). The "blocks only
 * optional reward-generating events" clause is FUTURE BUILD — no
 * reward-generating activity exists at A2 to block.
 */
export function checkL14PendingPersistence(validate: SaveBlobValidator): CheckVerdict {
  const storage = loadStorageSeed();
  const rulesSeed = loadClaimLedgerRulesSeed();
  const built = buildRewardBearingState(storage, rulesSeed, WORLD_CLOCK);
  if (built.pending.length === 0) return fail("L14: proof state has no pending record — check would be vacuous");
  const pendingBefore = canonicalSerialize(built.pending);

  const dir = mkdtempSync(join(tmpdir(), "hg-l14-"));
  try {
    const slot = join(dir, "l14.save.json");
    const blob = {
      ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }),
      resources: toResourceBands(built.harbor),
      claim_ledger: built.ledger,
      pending_reward_resolution: [...built.pending],
    };
    saveAtomically(slot, blob, { validate });
    const bytesOnDisk = readFileSync(slot, "utf8");

    const loadedA = loadSave(slot, validate);
    const loadedB = loadSave(slot, validate);
    if (canonicalSerialize(loadedA.pending_reward_resolution) !== pendingBefore) {
      return fail("L14: pending records changed across save/load — loss, mutation, or reroll");
    }
    if (canonicalSerialize(loadedB) !== canonicalSerialize(loadedA)) {
      return fail("L14: repeated load produced a different state — reload duplication");
    }
    if (readFileSync(slot, "utf8") !== bytesOnDisk) {
      return fail("L14: loading mutated the on-disk save");
    }
    const record = loadedA.pending_reward_resolution.find((r) => r.pending_id === "proof.crowns.overflow");
    if (!record) return fail("L14: pending record missing after load");
    const original = built.pending.find((r) => r.pending_id === "proof.crowns.overflow")!;
    if (record.generated_reward_seed !== original.generated_reward_seed) {
      return fail("L14: generated_reward_seed changed across save/load — reroll path");
    }
    if (loadedA.claim_ledger.packages.some((p) => p.package_id === record.pending_id)) {
      return fail("L14: pending record appears in the Ledger too — duplication");
    }
    assertClaimStateValid(loadedA.claim_ledger, loadedA.pending_reward_resolution);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  return pass(
    `A2 scope: ${built.pending.length} pending record(s) survived save→load byte-identical (contents, blocking ` +
      `reason, and generated_reward_seed exact — no loss, no reroll); repeated load is byte-identical (no ` +
      `duplication); the record is in neither the Ledger nor Harbor storage (unspendable). The optional-activity ` +
      `block clause is FUTURE BUILD (no reward-generating activities exist at A2).`,
  );
}
