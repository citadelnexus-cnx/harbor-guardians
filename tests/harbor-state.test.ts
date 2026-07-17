/**
 * Alpha A1 harbor/resource state spine tests — safe/exposed storage-state
 * separation, safe→exposed→hard-stop fill order, no-hidden-loss accounting,
 * never-negative withdrawal, and DC6 CoreResource-only typing at the schema
 * boundary. Runs on node:test via tsx:
 *   pnpm run test:harbor
 *
 * Every number in these tests is read from the schema-validated storage seed
 * (No Magic Numbers, DC1) — the tests derive their amounts from seeded
 * capacities instead of hard-coding values.
 *
 * Governing docs: 01_ECONOMY_FOUNDATION v1.7 §3/§5/§6/§7; D1 (3S model);
 * D26/DC6 (CoreResource-only storage); CLAUDE.md §5 (no hidden loss).
 * Invariant refs: DC1, DC6; exercises the spine behind the A1-extended S5.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  assertHarborStateValid,
  CORE_RESOURCES,
  createHarborState,
  deposit,
  fromResourceBands,
  HarborStateInvariantError,
  toResourceBands,
  totalStock,
  withdraw,
} from "../src/sim/harbor-state.js";
import { loadStorageSeed, StorageSeedValidationError } from "../sim-harness/storage-seed.js";

const seed = loadStorageSeed();

test("world creation: every CoreResource starts with its seeded start_stock in Safe, zero Exposed", () => {
  const state = createHarborState(seed);
  assertHarborStateValid(state);
  for (const resource of CORE_RESOURCES) {
    const def = seed.storage[resource];
    assert.equal(state.resources[resource].safe, def.start_stock, `${resource} safe == seeded start_stock`);
    assert.equal(state.resources[resource].exposed, 0, `${resource} exposed starts at 0`);
    assert.equal(totalStock(state, resource), def.start_stock);
  }
});

test("deposit fills Safe first, then Exposed, and hard-stops at Total 3S (Economy §5/§6 order)", () => {
  let state = createHarborState(seed);
  for (const resource of CORE_RESOURCES) {
    const def = seed.storage[resource];
    const safeRoom = def.safe_capacity_st1 - def.start_stock;

    // Deposit exactly the remaining Safe room: all of it must land in Safe.
    const first = deposit(state, resource, safeRoom);
    assert.equal(first.deposited_to_safe, safeRoom, `${resource}: fills Safe first`);
    assert.equal(first.deposited_to_exposed, 0);
    assert.equal(first.blocked_at_cap, 0);
    assert.equal(first.state.resources[resource].safe, def.safe_capacity_st1, `${resource}: Safe at S`);

    // Deposit the full Total again: only the Exposed band can absorb it; the rest blocks.
    const second = deposit(first.state, resource, def.total_capacity_st1);
    assert.equal(second.deposited_to_safe, 0, `${resource}: Safe already full`);
    assert.equal(second.deposited_to_exposed, def.exposed_capacity_st1, `${resource}: Exposed fills to 2S`);
    assert.equal(
      second.blocked_at_cap,
      def.total_capacity_st1 - def.exposed_capacity_st1,
      `${resource}: remainder blocked at the 3S hard stop`,
    );
    assert.equal(totalStock(second.state, resource), def.total_capacity_st1, `${resource}: total == 3S, never above`);
    state = second.state;
  }
  assertHarborStateValid(state);
});

test("deposit conservation: deposited_to_safe + deposited_to_exposed + blocked_at_cap == amount (no hidden loss)", () => {
  const state = createHarborState(seed);
  for (const resource of CORE_RESOURCES) {
    const def = seed.storage[resource];
    // An amount guaranteed to overflow everything: the full 3S total on top of the start stock.
    const amount = def.total_capacity_st1;
    const result = deposit(state, resource, amount);
    assert.equal(
      result.deposited_to_safe + result.deposited_to_exposed + result.blocked_at_cap,
      amount,
      `${resource}: every unit is accounted for — landed or explicitly blocked, never dropped`,
    );
  }
});

test("deposit at the cap blocks the full amount rather than silently deleting it", () => {
  let state = createHarborState(seed);
  for (const resource of CORE_RESOURCES) {
    const def = seed.storage[resource];
    state = deposit(state, resource, def.total_capacity_st1).state; // now at 3S
    const atCap = deposit(state, resource, def.start_stock + def.safe_capacity_st1);
    assert.equal(atCap.deposited_to_safe, 0);
    assert.equal(atCap.deposited_to_exposed, 0);
    assert.equal(atCap.blocked_at_cap, def.start_stock + def.safe_capacity_st1, `${resource}: everything blocked, nothing lost`);
    state = atCap.state;
  }
});

test("withdraw draws from the named band only and never goes negative", () => {
  const state = createHarborState(seed);
  for (const resource of CORE_RESOURCES) {
    const def = seed.storage[resource];
    if (def.start_stock > 0) {
      const after = withdraw(state, resource, "safe", def.start_stock);
      assert.equal(after.resources[resource].safe, 0, `${resource}: safe drained exactly`);
      assert.equal(after.resources[resource].exposed, 0, `${resource}: exposed untouched`);
      // Over-withdrawal from the drained band must throw, not go negative.
      assert.throws(() => withdraw(after, resource, "safe", def.start_stock), HarborStateInvariantError);
    }
    // Exposed starts empty: any withdrawal from it must throw.
    assert.throws(() => withdraw(state, resource, "exposed", def.safe_capacity_st1), HarborStateInvariantError);
  }
});

test("negative and non-finite amounts are rejected outright", () => {
  const state = createHarborState(seed);
  const [resource] = CORE_RESOURCES;
  assert.ok(resource);
  const negative = 0 - seed.storage[resource].safe_capacity_st1;
  assert.throws(() => deposit(state, resource, negative), HarborStateInvariantError);
  assert.throws(() => deposit(state, resource, Number.POSITIVE_INFINITY), HarborStateInvariantError);
  assert.throws(() => deposit(state, resource, Number.NaN), HarborStateInvariantError);
  assert.throws(() => withdraw(state, resource, "safe", negative), HarborStateInvariantError);
});

test("safe/exposed separation survives the save-blob projection round-trip", () => {
  let state = createHarborState(seed);
  for (const resource of CORE_RESOURCES) {
    state = deposit(state, resource, seed.storage[resource].safe_capacity_st1).state;
  }
  const bands = toResourceBands(state);
  const rebuilt = fromResourceBands(bands, seed);
  for (const resource of CORE_RESOURCES) {
    assert.equal(rebuilt.resources[resource].safe, state.resources[resource].safe, `${resource}: safe preserved`);
    assert.equal(rebuilt.resources[resource].exposed, state.resources[resource].exposed, `${resource}: exposed preserved`);
  }
});

test("fromResourceBands rejects bands that violate the seeded 3S caps (D1)", () => {
  const state = createHarborState(seed);
  const bands = toResourceBands(state);
  const [resource] = CORE_RESOURCES;
  assert.ok(resource);
  const def = seed.storage[resource];
  const overSafe = { ...bands, [resource]: { safe: def.safe_capacity_st1 + def.safe_capacity_st1, exposed: 0 } };
  assert.throws(() => fromResourceBands(overSafe, seed), HarborStateInvariantError);
  const overTotal = { ...bands, [resource]: { safe: def.safe_capacity_st1, exposed: def.exposed_capacity_st1 + def.safe_capacity_st1 } };
  assert.throws(() => fromResourceBands(overTotal, seed), HarborStateInvariantError);
});

test("DC6: the storage-seed loader rejects a seed admitting Merit into a storage field", () => {
  // The on-disk negative fixture carries Merit + BondCharge storage keys; the
  // loader must refuse it (StandingResource/ReceiptMetric never in 3S bands).
  assert.throws(
    () => loadStorageSeed("data/economy/storage.broken.invalid.json"),
    StorageSeedValidationError,
  );
});
