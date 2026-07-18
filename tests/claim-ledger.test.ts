/**
 * Alpha A2 Claim Ledger / reward-routing spine tests — deterministic routing
 * of test-supplied packages, blocked FUTURE-BUILD routes, Doc 04 §5 slot
 * accounting from the seeded caps, §7 partial-claim exactness against the A1
 * harbor spine, §10 pending resolution, Story Claim protection, and exact
 * no-hidden-loss accounting throughout. Runs on node:test via tsx:
 *   pnpm run test:ledger
 *
 * Every gameplay number in these tests is read from the schema-validated
 * storage + claim-ledger-rules seeds (No Magic Numbers, DC1) — amounts and
 * counts derive from seeded capacities/caps instead of hard-coded values.
 *
 * Governing docs: 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §1/§5/§6/§7/§10;
 * 01_ECONOMY_FOUNDATION v1.7 §10; SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5
 * §10/§11; CLAUDE.md §5 (no hidden loss).
 * Invariant refs: L1, L5, L6, L7, L11, L14 (the harness checks in
 * sim-harness/ledger-checks.ts are the registry evidence; these tests
 * exercise the same spine at unit granularity).
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import type { PendingRewardResolution, RewardPackageDraft } from "../src/contracts/claim-ledger.js";
import type { CoreResource, RewardRoute } from "../src/contracts/enums.js";
import type { WorldClock } from "../src/contracts/save-blob.js";
import {
  assertClaimStateValid,
  claimPackage,
  ClaimLedgerInvariantError,
  createClaimLedgerState,
  resolvePendingToLedger,
  RewardRouteNotImplementedError,
  routeRewardPackage,
  slotOccupancy,
  totalRewardAmount,
} from "../src/sim/claim-ledger.js";
import { createHarborState, totalStock } from "../src/sim/harbor-state.js";
import { loadClaimLedgerRulesSeed } from "../sim-harness/ledger-rules-seed.js";
import { loadStorageSeed } from "../sim-harness/storage-seed.js";

const storage = loadStorageSeed();
const rules = loadClaimLedgerRulesSeed().rules;
const CLOCK: WorldClock = { day_index: 0, time_of_day: 0 };

function draft(id: string, lines: Array<{ route: RewardRoute; resource: CoreResource; amount: number }>): RewardPackageDraft {
  return {
    package_id: id,
    source_type: "test_supplied",
    source_event_id: `event.${id}`,
    generated_reward_seed: 0,
    created_world_clock: CLOCK,
    lines: lines.map((l, i) => ({ line_id: `${id}.${i}`, ...l })),
  };
}

// ── Routing ──────────────────────────────────────────────────────────────────

test("routing: claim_ledger lines become one held package with aggregated contents", () => {
  const amount = storage.storage.Crowns.start_stock;
  const routed = routeRewardPackage(createClaimLedgerState(), [], draft("r1", [
    { route: "claim_ledger", resource: "Crowns", amount },
    { route: "claim_ledger", resource: "Crowns", amount },
    { route: "claim_ledger", resource: "Iron", amount },
  ]), rules);
  assert.equal(routed.ledger_delivery, "delivered");
  const pkg = routed.ledger.packages.find((p) => p.package_id === "r1");
  assert.ok(pkg, "package delivered to the Ledger");
  assert.equal(pkg.contents.resources.Crowns, amount + amount, "same-resource lines aggregate");
  assert.equal(pkg.contents.resources.Iron, amount);
  assert.deepEqual(pkg.held_remainder, pkg.contents.resources, "delivered package holds its full contents");
  assert.equal(pkg.is_story, false);
  assert.equal(pkg.system_grant, false);
  assertClaimStateValid(routed.ledger, [...routed.pending]);
});

test("routing: story_claim lines become a protected Story Claim that occupies no slots", () => {
  const amount = storage.storage.Provisions.start_stock;
  const routed = routeRewardPackage(createClaimLedgerState(), [], draft("r2", [
    { route: "story_claim", resource: "Provisions", amount },
  ]), rules);
  assert.equal(routed.ledger_delivery, "none", "no ledger portion");
  assert.equal(routed.story_claim_id, "r2.story");
  assert.equal(routed.ledger.story_claims.length, 1);
  assert.equal(routed.ledger.story_claims[0]!.is_story, true);
  assert.equal(routed.ledger.story_claims[0]!.contents.resources.Provisions, amount);
  assert.equal(routed.ledger.packages.length, 0, "story claims never occupy package slots");
  assert.equal(slotOccupancy(routed.ledger).global, 0);
});

test("routing: a mixed draft yields both a ledger package and a story claim", () => {
  const iron = storage.storage.Iron.safe_capacity_st1;
  const prov = storage.storage.Provisions.start_stock;
  const routed = routeRewardPackage(createClaimLedgerState(), [], draft("r3", [
    { route: "claim_ledger", resource: "Iron", amount: iron },
    { route: "story_claim", resource: "Provisions", amount: prov },
  ]), rules);
  assert.equal(routed.ledger_delivery, "delivered");
  assert.equal(routed.story_claim_id, "r3.story");
  assert.equal(routed.ledger.packages.length, 1);
  assert.equal(routed.ledger.story_claims.length, 1);
});

test("routing: FUTURE-BUILD routes (cargo, gear, auto-receipt) fail loud — never dropped or re-routed", () => {
  const amount = storage.storage.Iron.start_stock;
  for (const route of ["ship_hold_docked_cargo", "gear_locker", "auto_receipt"] as RewardRoute[]) {
    assert.throws(
      () => routeRewardPackage(createClaimLedgerState(), [], draft(`r4.${route}`, [{ route, resource: "Iron", amount }]), rules),
      RewardRouteNotImplementedError,
      `route ${route} must fail loud at A2`,
    );
  }
});

test("routing: invalid drafts are rejected outright (empty, zero/negative/non-finite amounts, duplicate line ids)", () => {
  const ledger = createClaimLedgerState();
  const amount = storage.storage.Crowns.start_stock;
  assert.throws(() => routeRewardPackage(ledger, [], draft("bad.empty", []), rules), ClaimLedgerInvariantError);
  assert.throws(
    () => routeRewardPackage(ledger, [], draft("bad.zero", [{ route: "claim_ledger", resource: "Crowns", amount: 0 }]), rules),
    ClaimLedgerInvariantError,
  );
  assert.throws(
    () => routeRewardPackage(ledger, [], draft("bad.neg", [{ route: "claim_ledger", resource: "Crowns", amount: 0 - amount }]), rules),
    ClaimLedgerInvariantError,
  );
  assert.throws(
    () =>
      routeRewardPackage(
        ledger,
        [],
        draft("bad.inf", [{ route: "claim_ledger", resource: "Crowns", amount: Number.POSITIVE_INFINITY }]),
        rules,
      ),
    ClaimLedgerInvariantError,
  );
  const dupLines: RewardPackageDraft = {
    ...draft("bad.dup", [{ route: "claim_ledger", resource: "Crowns", amount }]),
    lines: [
      { line_id: "same", route: "claim_ledger", resource: "Crowns", amount },
      { line_id: "same", route: "claim_ledger", resource: "Iron", amount },
    ],
  };
  assert.throws(() => routeRewardPackage(ledger, [], dupLines, rules), ClaimLedgerInvariantError);
});

test("routing: a package_id can never be delivered twice (L11 no-duplication)", () => {
  const amount = storage.storage.Crowns.start_stock;
  const first = routeRewardPackage(createClaimLedgerState(), [], draft("dup", [{ route: "claim_ledger", resource: "Crowns", amount }]), rules);
  assert.throws(
    () => routeRewardPackage(first.ledger, first.pending, draft("dup", [{ route: "claim_ledger", resource: "Crowns", amount }]), rules),
    ClaimLedgerInvariantError,
  );
});

// ── Slot accounting (Doc 04 §5, L7) ──────────────────────────────────────────

test("slots: the seeded per-resource cap blocks delivery into a pending record naming the slot", () => {
  let ledger = createClaimLedgerState();
  let pending: readonly PendingRewardResolution[] = [];
  const amount = storage.storage.Aether.safe_capacity_st1;
  for (let i = 0; i < rules.max_unclaimed_packages_per_resource; i += 1) {
    const r = routeRewardPackage(ledger, pending, draft(`cap.${i}`, [{ route: "claim_ledger", resource: "Aether", amount }]), rules);
    assert.equal(r.ledger_delivery, "delivered");
    ledger = r.ledger;
    pending = r.pending;
  }
  const over = routeRewardPackage(ledger, pending, draft("cap.over", [{ route: "claim_ledger", resource: "Aether", amount }]), rules);
  assert.equal(over.ledger_delivery, "held_pending");
  assert.equal(over.blocking_reason, "per_resource_cap:Aether");
  const record = over.pending.find((r) => r.pending_id === "cap.over");
  assert.ok(record, "blocked delivery preserved as a pending record");
  assert.equal(record.package_contents.resources.Aether, amount, "pending preserves exact contents");
  assert.deepEqual(record.allowed_resolution_actions, ["deliver_to_ledger"]);
  assert.equal(record.related_system_message_id, null, "inbox is FUTURE BUILD — no message link exists");
  assert.equal(over.ledger.packages.length, rules.max_unclaimed_packages_per_resource, "the Ledger itself is unchanged");
});

test("slots: a package consumes one slot per contained resource", () => {
  const crowns = storage.storage.Crowns.start_stock;
  const iron = storage.storage.Iron.start_stock;
  const routed = routeRewardPackage(createClaimLedgerState(), [], draft("multi", [
    { route: "claim_ledger", resource: "Crowns", amount: crowns },
    { route: "claim_ledger", resource: "Iron", amount: iron },
  ]), rules);
  const occ = slotOccupancy(routed.ledger);
  assert.equal(occ.per_resource.Crowns, 1);
  assert.equal(occ.per_resource.Iron, 1);
  assert.equal(occ.per_resource.Provisions, 0);
  assert.equal(occ.global, 1, "one package = one global slot regardless of resource count");
});

// ── Partial claim (Doc 04 §7, L6) against the A1 harbor spine ────────────────

test("claim_safe: transfers only what fits in Safe room; remainder held exactly (L6)", () => {
  const def = storage.storage.Crowns;
  const original = def.safe_capacity_st1; // start_stock already occupies Safe room
  const harbor = createHarborState(storage);
  const routed = routeRewardPackage(createClaimLedgerState(), [], draft("c1", [{ route: "claim_ledger", resource: "Crowns", amount: original }]), rules);
  const result = claimPackage(routed.ledger, harbor, "c1", "claim_safe");
  const safeRoom = def.safe_capacity_st1 - def.start_stock;
  assert.equal(result.claimed.Crowns, safeRoom, "claims exactly the Safe room");
  assert.equal(result.held_remainder.Crowns, original - safeRoom, "remainder held, not dropped");
  assert.equal((result.claimed.Crowns ?? 0) + (result.held_remainder.Crowns ?? 0), original, "claimed + held == original");
  assert.equal(result.harbor.resources.Crowns.safe, def.safe_capacity_st1, "Safe filled to S");
  assert.equal(result.harbor.resources.Crowns.exposed, 0, "claim_safe never spills to Exposed");
  assert.equal(result.fully_claimed, false);
  assertClaimStateValid(result.ledger, []);
});

test("claim_to_capacity: transfers to the 3S hard stop; blocked remainder stays held (no hidden loss)", () => {
  const def = storage.storage.Iron;
  const original = def.total_capacity_st1; // start_stock occupies room → remainder guaranteed
  const harbor = createHarborState(storage);
  const routed = routeRewardPackage(createClaimLedgerState(), [], draft("c2", [{ route: "claim_ledger", resource: "Iron", amount: original }]), rules);
  const result = claimPackage(routed.ledger, harbor, "c2", "claim_to_capacity");
  const room = def.total_capacity_st1 - def.start_stock;
  assert.equal(result.claimed.Iron, room, "claims exactly the remaining 3S room");
  assert.equal(result.held_remainder.Iron, original - room, "hard-stop overflow held in the package");
  assert.equal(totalStock(result.harbor, "Iron"), def.total_capacity_st1, "harbor at 3S, never above");
  assert.equal(result.fully_claimed, false, "package stays in the Ledger holding the remainder");

  // Withdrawing nothing, claiming again changes nothing (still no room) — remainder preserved.
  const again = claimPackage(result.ledger, result.harbor, "c2", "claim_to_capacity");
  assert.deepEqual(again.claimed, {}, "no room → nothing claimed");
  assert.equal(again.held_remainder.Iron, result.held_remainder.Iron, "remainder unchanged, never deleted");
});

test("full claim drains the package and removes it from the Ledger; totals conserved (L1)", () => {
  const def = storage.storage.Aether; // start_stock 0 → full total fits
  const original = def.total_capacity_st1;
  const harbor = createHarborState(storage);
  const routed = routeRewardPackage(createClaimLedgerState(), [], draft("c3", [{ route: "claim_ledger", resource: "Aether", amount: original }]), rules);
  const before = totalStock(harbor, "Aether") + totalRewardAmount(routed.ledger.packages[0]!.held_remainder);
  const result = claimPackage(routed.ledger, harbor, "c3", "claim_to_capacity");
  assert.equal(result.fully_claimed, true);
  assert.equal(result.ledger.packages.length, 0, "fully claimed package leaves the Ledger");
  const after = totalStock(result.harbor, "Aether");
  assert.equal(after, before, "claiming transferred, never minted or destroyed");
});

test("claiming a package that is not in the Ledger throws", () => {
  const harbor = createHarborState(storage);
  assert.throws(() => claimPackage(createClaimLedgerState(), harbor, "ghost", "claim_safe"), ClaimLedgerInvariantError);
});

// ── Pending resolution (Doc 04 §10, L11/L14) ─────────────────────────────────

test("pending: blocked while caps are full (record preserved), resolves exactly once after a slot frees", () => {
  let ledger = createClaimLedgerState();
  let pending: readonly PendingRewardResolution[] = [];
  const amount = storage.storage.Crowns.safe_capacity_st1;
  let harbor = createHarborState(storage);
  for (let i = 0; i < rules.max_unclaimed_packages_per_resource; i += 1) {
    const r = routeRewardPackage(ledger, pending, draft(`p.${i}`, [{ route: "claim_ledger", resource: "Crowns", amount }]), rules);
    ledger = r.ledger;
    pending = r.pending;
  }
  const over = routeRewardPackage(ledger, pending, draft("p.over", [{ route: "claim_ledger", resource: "Crowns", amount }]), rules);
  ledger = over.ledger;
  pending = over.pending;

  const refused = resolvePendingToLedger(ledger, pending, "p.over", rules);
  assert.equal(refused.resolved, false);
  assert.equal(refused.blocking_reason, "per_resource_cap:Crowns");
  assert.equal(refused.pending.length, pending.length, "blocked resolution preserves the record");

  // Fully claim one package (harbor Crowns bands have room for safe_capacity) to free a slot.
  const cleared = claimPackage(ledger, harbor, "p.0", "claim_to_capacity");
  assert.equal(cleared.fully_claimed, true, "seeded amounts drain the package into the empty bands");
  ledger = cleared.ledger;
  harbor = cleared.harbor;

  const resolved = resolvePendingToLedger(ledger, pending, "p.over", rules);
  assert.equal(resolved.resolved, true);
  const pkg = resolved.ledger.packages.find((p) => p.package_id === "p.over");
  assert.ok(pkg, "resolved package entered the Ledger");
  assert.equal(pkg.held_remainder.Crowns, amount, "exact original contents — no reroll, no loss");
  assert.equal(resolved.pending.length, pending.length - 1, "record left the pending list exactly once");
  assert.throws(() => resolvePendingToLedger(resolved.ledger, resolved.pending, "p.over", rules), ClaimLedgerInvariantError);
  assertClaimStateValid(resolved.ledger, [...resolved.pending]);
});

test("pending: records are not claimable (not in the Ledger — not exploitable as storage)", () => {
  let ledger = createClaimLedgerState();
  let pending: readonly PendingRewardResolution[] = [];
  const amount = storage.storage.Provisions.start_stock;
  for (let i = 0; i < rules.max_unclaimed_packages_per_resource; i += 1) {
    const r = routeRewardPackage(ledger, pending, draft(`q.${i}`, [{ route: "claim_ledger", resource: "Provisions", amount }]), rules);
    ledger = r.ledger;
    pending = r.pending;
  }
  const over = routeRewardPackage(ledger, pending, draft("q.over", [{ route: "claim_ledger", resource: "Provisions", amount }]), rules);
  const harbor = createHarborState(storage);
  assert.throws(() => claimPackage(over.ledger, harbor, "q.over", "claim_to_capacity"), ClaimLedgerInvariantError);
});

// ── Story Claim protection (Doc 04 §6, L5 structural) ────────────────────────

test("story claims: unaffected by claims and pending resolution; no A2 operation can remove one", () => {
  const prov = storage.storage.Provisions.start_stock;
  const iron = storage.storage.Iron.safe_capacity_st1;
  let ledger = createClaimLedgerState();
  const routedStory = routeRewardPackage(ledger, [], draft("s.story", [{ route: "story_claim", resource: "Provisions", amount: prov }]), rules);
  ledger = routedStory.ledger;
  const routedIron = routeRewardPackage(ledger, [], draft("s.iron", [{ route: "claim_ledger", resource: "Iron", amount: iron }]), rules);
  ledger = routedIron.ledger;
  const storySnapshot = JSON.stringify(ledger.story_claims);

  const harbor = createHarborState(storage);
  const claimed = claimPackage(ledger, harbor, "s.iron", "claim_to_capacity");
  assert.equal(JSON.stringify(claimed.ledger.story_claims), storySnapshot, "claiming leaves story claims untouched");
  assertClaimStateValid(claimed.ledger, []);
});

// ── Structural validity ──────────────────────────────────────────────────────

test("validity: inflated remainders, duplicate ids, and empty held packages are rejected", () => {
  const amount = storage.storage.Crowns.start_stock;
  const routed = routeRewardPackage(createClaimLedgerState(), [], draft("v1", [{ route: "claim_ledger", resource: "Crowns", amount }]), rules);
  const pkg = routed.ledger.packages[0]!;

  const inflated = { packages: [{ ...pkg, held_remainder: { Crowns: amount + amount } }], story_claims: [] };
  assert.throws(() => assertClaimStateValid(inflated, []), ClaimLedgerInvariantError);

  const duplicate = { packages: [pkg, pkg], story_claims: [] };
  assert.throws(() => assertClaimStateValid(duplicate, []), ClaimLedgerInvariantError);

  const emptyHeld = { packages: [{ ...pkg, held_remainder: {} }], story_claims: [] };
  assert.throws(() => assertClaimStateValid(emptyHeld, []), ClaimLedgerInvariantError);
});
