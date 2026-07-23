/**
 * Alpha A4 "Bounded First Playable Expedition Loop" tests — the scenario
 * matrix from the execution brief §8, exercising the pure sim state machine
 * (src/sim/expedition.ts) over the schema-validated canonical seed
 * (data/expeditions/exp.first_playable.json) and the A1 harbor spine.
 * Runs on node:test via tsx (no new dependencies):
 *   pnpm run test:expedition
 *
 * Covers: all three starting Guardians (equal-total, distinct-resource
 * salvage — brief §4); the canonical first completion and a repeat expedition;
 * every outcome (cancellation, full/partial success, retreat, forced
 * withdrawal); vessel/crew/Guardian recovery; Safe Storage + unsafe Overflow
 * (incl. full Overflow and blocked unloading with preservation); OPS1
 * cancel/refund routing (incl. the 3S-block path); duplicate-command
 * resistance; deterministic replay + exact relaunch; save/load at every major
 * phase; malformed-command rejection; and A1–A3 regression protection (the
 * Claim Ledger is never touched by A4).
 *
 * Governing docs: ALPHA_A4_EXECUTION_BRIEF v0.1 §1–§13;
 * SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.7 (OPS1); CLAUDE.md §5 (no hidden loss).
 * Invariant refs: OPS1 (converted at A4), EVT1/EVT2/EVT4 (bounded reuse),
 * S5/S7 (state persists — proven in save-load.test.ts too).
 */

import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import type { CoreResource } from "../src/contracts/enums.js";
import type { ExpeditionCommand, ExpeditionOutcome, StartingGuardianId } from "../src/contracts/expedition.js";
import type { ExpeditionContent } from "../src/contracts/expedition-seed.js";
import type { SaveBlob } from "../src/contracts/save-blob.js";
import {
  applyCommand,
  assertExpeditionDomainValid,
  AT_OUTPOST_OUTCOMES,
  createExpeditionState,
  createHarborOperationsState,
  ExpeditionInvariantError,
  salvageFor,
  STARTING_GUARDIANS,
  type ExpeditionDomain,
} from "../src/sim/expedition.js";
import {
  CORE_RESOURCES,
  createHarborState,
  deposit,
  fromResourceBands,
  toResourceBands,
} from "../src/sim/harbor-state.js";
import { canonicalSerialize } from "../src/save/canonical-json.js";
import { createEmptySaveBlob } from "../src/save/empty-save.js";
import { loadSave, saveAtomically } from "../src/save/atomic-save.js";
import { createSaveBlobValidator } from "../src/save/save-blob-validator.js";
import { buildPlaythrough } from "../src/ui/playthrough.js";
import { loadExpeditionSeed } from "../sim-harness/expedition-seed.js";
import { loadStorageSeed } from "../sim-harness/storage-seed.js";

const SEED = 20260723;
const storageSeed = loadStorageSeed();
const content: ExpeditionContent = loadExpeditionSeed().content;
const ctx = { seed: SEED, content };
const validate = createSaveBlobValidator();

function fresh(): ExpeditionDomain {
  return {
    expedition: createExpeditionState(),
    harbor_operations: createHarborOperationsState(),
    harbor: createHarborState(storageSeed),
  };
}

/** Apply a command and assert it was really applied (not an idempotent no-op). */
function run(domain: ExpeditionDomain, command: ExpeditionCommand): ExpeditionDomain {
  const result = applyCommand(domain, command, ctx);
  assert.ok(result.applied, `command ${command.kind} should apply`);
  return result.domain;
}

function harborTotal(domain: ExpeditionDomain, resource: CoreResource): number {
  const band = domain.harbor.resources[resource];
  return band.safe + band.exposed;
}

/** Drive a full loop for one guardian+outcome, unloading fully, to just before `complete`. */
function toDocked(guardian: StartingGuardianId, outcome: ExpeditionOutcome, tag: string): ExpeditionDomain {
  let d = fresh();
  d = run(d, { command_id: `${tag}.prepare`, kind: "prepare", guardian_id: guardian });
  d = run(d, { command_id: `${tag}.dispatch`, kind: "dispatch" });
  d = run(d, { command_id: `${tag}.arrive`, kind: "arrive" });
  d = run(d, { command_id: `${tag}.resolve`, kind: "resolve", outcome });
  d = run(d, { command_id: `${tag}.dock`, kind: "dock" });
  return d;
}

// ── Guardian equivalence (brief §4) ──────────────────────────────────────────

test("guardians: for every outcome the salvage TOTAL is equal across all three Guardians, but the resource DIFFERS", () => {
  for (const outcome of AT_OUTPOST_OUTCOMES) {
    const totals = STARTING_GUARDIANS.map((g) => {
      const salvage = salvageFor(content, outcome, g);
      return Object.values(salvage).reduce((a, b) => a + b, 0);
    });
    const total0 = totals[0] ?? 0;
    assert.ok(totals.every((t) => t === total0), `outcome ${outcome}: totals equal across guardians (${totals.join(",")})`);

    const resources = STARTING_GUARDIANS.map((g) => Object.keys(salvageFor(content, outcome, g))[0]).filter(Boolean);
    if (total0 > 0) {
      assert.equal(new Set(resources).size, STARTING_GUARDIANS.length, `outcome ${outcome}: each guardian salvages a DISTINCT resource`);
    }
  }
});

// ── Canonical first completion + repeat (brief §1/§2.17) ─────────────────────

test("canonical first completion: full-success loop returns to idle-ready, unlocks route-anchor ops, consumes the intro once", () => {
  let d = fresh();
  assert.equal(d.harbor_operations.canonical_intro_consumed, false);
  d = run(d, { command_id: "c.prepare", kind: "prepare", guardian_id: "gdn.nova" });
  assert.equal(d.harbor_operations.canonical_intro_consumed, true, "the intro is consumed at first prepare");
  assert.equal(d.expedition.phase, "preparing");
  d = run(d, { command_id: "c.dispatch", kind: "dispatch" });
  d = run(d, { command_id: "c.arrive", kind: "arrive" });
  assert.equal(d.expedition.active?.event?.state, "ACTIVE", "the outpost objective began (EVT4 trigger met)");
  d = run(d, { command_id: "c.resolve", kind: "resolve", outcome: "full_success" });
  assert.equal(d.expedition.active?.event?.state, "RESOLVED", "the embedded event reached RESOLVED (EVT2)");
  d = run(d, { command_id: "c.dock", kind: "dock" });
  d = run(d, { command_id: "c.unload", kind: "unload" });
  d = run(d, { command_id: "c.complete", kind: "complete" });
  assert.equal(d.expedition.phase, "idle", "a clean full success returns straight to idle");
  assert.equal(d.expedition.active, null);
  assert.equal(d.harbor_operations.completed_expeditions, 1);
  assert.equal(d.harbor_operations.route_anchor_operations_unlocked, true, "first full success unlocks route-anchor ops (brief §2.16)");
});

test("repeat expedition: a second loop runs without replaying the canonical intro and increments the completed count", () => {
  let d = fresh();
  for (const [i, guardian] of (["gdn.nova", "gdn.raxa"] as StartingGuardianId[]).entries()) {
    d = run(d, { command_id: `r${i}.prepare`, kind: "prepare", guardian_id: guardian });
    d = run(d, { command_id: `r${i}.dispatch`, kind: "dispatch" });
    d = run(d, { command_id: `r${i}.arrive`, kind: "arrive" });
    d = run(d, { command_id: `r${i}.resolve`, kind: "resolve", outcome: "full_success" });
    d = run(d, { command_id: `r${i}.dock`, kind: "dock" });
    d = run(d, { command_id: `r${i}.unload`, kind: "unload" });
    d = run(d, { command_id: `r${i}.complete`, kind: "complete" });
  }
  assert.equal(d.harbor_operations.completed_expeditions, 2, "two expeditions completed");
  assert.equal(d.expedition.next_expedition_index, 2, "the deterministic expedition stream advanced twice");
});

// ── Outcomes + recovery (brief §2.9/§2.15) ───────────────────────────────────

test("outcomes: partial/retreat/forced-withdrawal send the domain to recovering; a single recover restores readiness", () => {
  for (const outcome of ["partial_success", "retreat", "forced_withdrawal"] as ExpeditionOutcome[]) {
    let d = toDocked("gdn.raxa", outcome, `rec.${outcome}`);
    // Fully unload whatever is aboard first.
    if (Object.keys(d.expedition.active?.cargo_aboard ?? {}).length > 0) {
      d = run(d, { command_id: `rec.${outcome}.unload`, kind: "unload" });
    }
    d = run(d, { command_id: `rec.${outcome}.complete`, kind: "complete" });
    assert.equal(d.expedition.phase, "recovering", `${outcome} leaves damage requiring recovery`);
    assert.notEqual(d.expedition.active, null);
    d = run(d, { command_id: `rec.${outcome}.recover`, kind: "recover" });
    assert.equal(d.expedition.phase, "idle", `${outcome}: recovery returns to idle-ready`);
    assert.equal(d.expedition.active, null);
  }
});

test("forced withdrawal is available even when the EVT4 trigger is unmet; success outcomes are then refused", () => {
  // Drain Harbor Provisions below the seeded threshold BEFORE arrival so the objective can't begin.
  let d = fresh();
  d = run(d, { command_id: "fw.prepare", kind: "prepare", guardian_id: "gdn.tarin" });
  // Withdraw the rest of the Provisions directly so total < min_provisions_to_begin.
  const provTotal = harborTotal(d, "Provisions");
  const drainTo = content.event.min_provisions_to_begin;
  d = { ...d, harbor: withdrawAll(d, "Provisions", provTotal - (drainTo - 1)) };
  d = run(d, { command_id: "fw.dispatch", kind: "dispatch" });
  d = run(d, { command_id: "fw.arrive", kind: "arrive" });
  assert.equal(d.expedition.active?.event?.state, "DORMANT", "the objective never began (trigger unmet)");
  assert.throws(
    () => applyCommand(d, { command_id: "fw.bad", kind: "resolve", outcome: "full_success" }, ctx),
    ExpeditionInvariantError,
    "a success outcome is refused when the objective never began",
  );
  const resolved = run(d, { command_id: "fw.resolve", kind: "resolve", outcome: "forced_withdrawal" });
  assert.equal(resolved.expedition.phase, "returning");
  assert.deepEqual(resolved.expedition.active?.cargo_aboard, {}, "forced withdrawal recovers nothing by default");
});

/** Withdraw an amount across bands (Safe then Exposed) directly, for test setup. */
function withdrawAll(domain: ExpeditionDomain, resource: CoreResource, amount: number) {
  const band = domain.harbor.resources[resource];
  const fromSafe = Math.min(amount, band.safe);
  const fromExposed = amount - fromSafe;
  const resources = {
    ...domain.harbor.resources,
    [resource]: { ...band, safe: band.safe - fromSafe, exposed: band.exposed - fromExposed },
  };
  return { resources };
}

// ── Safe Storage + unsafe Overflow (brief §2.11–2.13) ────────────────────────

test("unload: full-success salvage fills Safe Storage then Overflow, conserving every unit; the hold clears", () => {
  let d = toDocked("gdn.nova", "full_success", "of"); // Nova → Crowns
  const arrived = d.expedition.active?.cargo_aboard.Crowns ?? 0;
  const storageBefore = harborTotal(d, "Crowns");
  const overflowBefore = d.harbor_operations.overflow.Crowns ?? 0;
  const result = applyCommand(d, { command_id: "of.unload", kind: "unload" }, ctx);
  d = result.domain;
  const acc = result.unload?.per_resource.Crowns;
  assert.ok(acc, "unload reported Crowns accounting");
  assert.equal(acc!.arrived, arrived);
  assert.equal(acc!.to_storage + acc!.to_overflow + acc!.left_aboard, arrived, "three-tier conservation (no hidden loss)");
  assert.ok(acc!.to_overflow > 0, "this salvage exceeds 3S so Overflow is exercised");
  assert.equal(acc!.left_aboard, 0, "it still fully unloads (fits within Safe Storage + Overflow)");
  assert.equal(harborTotal(d, "Crowns"), storageBefore + acc!.to_storage, "Safe Storage grew by exactly the stored amount");
  assert.equal((d.harbor_operations.overflow.Crowns ?? 0), overflowBefore + acc!.to_overflow, "Overflow grew by exactly the overflow amount");
  assert.deepEqual(d.expedition.active?.cargo_aboard, {}, "the hold is empty after a full unload");
});

test("blocked unloading preserves material aboard and never clamps existing holdings (protected over-cap state)", () => {
  let d = toDocked("gdn.raxa", "full_success", "blk"); // Raxa → Iron
  const arrived = d.expedition.active?.cargo_aboard.Iron ?? 0;
  // Fill Iron Safe Storage to the 3S hard stop AND Overflow to its exact cap, so unloading is fully blocked.
  const caps = storageSeed.storage.Iron;
  const need3S = caps.total_capacity_st1 - harborTotal(d, "Iron");
  d = { ...d, harbor: deposit(d.harbor, "Iron", need3S).state };
  const overflowCap = content.overflow_cap_multiplier * caps.safe_capacity_st1;
  d = { ...d, harbor_operations: { ...d.harbor_operations, overflow: { Iron: overflowCap } } };
  assertExpeditionDomainValid(d, content);

  const storageBefore = harborTotal(d, "Iron");
  const result = applyCommand(d, { command_id: "blk.unload", kind: "unload" }, ctx);
  d = result.domain;
  const acc = result.unload?.per_resource.Iron;
  assert.ok(acc);
  assert.equal(acc!.to_storage, 0, "Safe Storage was full — nothing stored");
  assert.equal(acc!.to_overflow, 0, "Overflow was at cap — nothing overflowed");
  assert.equal(acc!.left_aboard, arrived, "the entire salvage stays aboard, preserved (brief §2.13)");
  assert.equal(harborTotal(d, "Iron"), storageBefore, "existing Safe Storage was not clamped or altered");
  assert.equal(d.harbor_operations.overflow.Iron, overflowCap, "the at-cap Overflow holding was preserved exactly");
  assert.equal(d.expedition.active?.cargo_aboard.Iron, arrived, "the hold still carries the full salvage");
  assert.throws(
    () => applyCommand(d, { command_id: "blk.complete", kind: "complete" }, ctx),
    ExpeditionInvariantError,
    "completion is refused while cargo remains aboard (no stranding)",
  );
});

// ── OPS1 cancel/refund routing (brief §2.9; SIM §4.7) ────────────────────────

test("OPS1: cancellation refunds the committed supply set to Harbor stock (Safe→Exposed), never to the Ledger, and clears the expedition", () => {
  const base = fresh();
  const before = CORE_RESOURCES.map((r) => [r, harborTotal(base, r)] as const);
  const prepared = run(base, { command_id: "ops.prepare", kind: "prepare", guardian_id: "gdn.nova" });
  // Supplies were withdrawn — Harbor stock dropped.
  for (const [resource, amount] of Object.entries(content.supply_set) as [CoreResource, number][]) {
    assert.equal(harborTotal(prepared, resource), (before.find(([r]) => r === resource)?.[1] ?? 0) - amount, `${resource} withdrawn at prepare`);
  }
  const result = applyCommand(prepared, { command_id: "ops.cancel", kind: "cancel" }, ctx);
  assert.ok(result.applied);
  assert.ok(!result.cancellation_blocked, "cancellation succeeds when the refund fits");
  assert.equal(result.refund?.total_blocked, 0);
  // Every unit came back to Harbor stock exactly; the domain is idle again.
  for (const [resource, total] of before) {
    assert.equal(harborTotal(result.domain, resource), total, `${resource} fully refunded (no hidden loss)`);
  }
  assert.equal(result.domain.expedition.phase, "idle");
  assert.equal(result.domain.expedition.active, null);
  assert.equal(result.domain.harbor_operations.completed_expeditions, 0, "a cancelled expedition is not a completion");
});

test("OPS1: cancellation blocks by default (supplies preserved) when the refund would breach the 3S hard stop", () => {
  let d = run(fresh(), { command_id: "opsb.prepare", kind: "prepare", guardian_id: "gdn.nova" });
  // Fill every supplied resource's Harbor stock to its 3S hard stop, so refunding the supplies would exceed 3S.
  for (const resource of Object.keys(content.supply_set) as CoreResource[]) {
    const cap = storageSeed.storage[resource].total_capacity_st1;
    d = { ...d, harbor: deposit(d.harbor, resource, cap - harborTotal(d, resource)).state };
  }
  const stockAtCap = CORE_RESOURCES.map((r) => [r, harborTotal(d, r)] as const);
  const result = applyCommand(d, { command_id: "opsb.cancel", kind: "cancel" }, ctx);
  assert.ok(result.cancellation_blocked, "cancellation is blocked (OPS1: blocks by default if it would exceed 3S)");
  assert.equal(result.refund?.total_refunded, 0, "nothing was refunded");
  assert.equal(result.domain.expedition.phase, "preparing", "the expedition stays preparing — supplies preserved");
  assert.notEqual(result.domain.expedition.active, null);
  for (const [resource, total] of stockAtCap) {
    assert.equal(harborTotal(result.domain, resource), total, `${resource} stock unchanged (supplies not silently deleted)`);
  }
});

// ── Duplicate-command resistance + malformed commands (brief §3/§11) ─────────

test("duplicate-command resistance: re-applying the last command id is an idempotent no-op", () => {
  const prepared = run(fresh(), { command_id: "dup.prepare", kind: "prepare", guardian_id: "gdn.nova" });
  const again = applyCommand(prepared, { command_id: "dup.prepare", kind: "prepare", guardian_id: "gdn.nova" }, ctx);
  assert.equal(again.applied, false, "the duplicate is not applied");
  assert.ok(again.idempotent);
  assert.equal(again.domain.expedition.next_expedition_index, prepared.expedition.next_expedition_index, "no second expedition was created");
  assert.equal(canonicalSerialize(again.domain), canonicalSerialize(prepared), "the domain is byte-identical (no second effect)");
});

test("malformed commands and illegal transitions throw and leave the input unchanged", () => {
  const base = fresh();
  assert.throws(() => applyCommand(base, { command_id: "x", kind: "resolve", outcome: "full_success" }, ctx), ExpeditionInvariantError, "resolve is illegal at idle");
  assert.throws(() => applyCommand(base, { command_id: "x", kind: "dispatch" }, ctx), ExpeditionInvariantError, "dispatch is illegal at idle");
  assert.throws(() => applyCommand(base, { command_id: "", kind: "prepare", guardian_id: "gdn.nova" }, ctx), ExpeditionInvariantError, "empty command_id rejected");
  assert.throws(
    () => applyCommand(base, { command_id: "x", kind: "prepare", guardian_id: "gdn.unknown" as StartingGuardianId }, ctx),
    ExpeditionInvariantError,
    "unknown guardian rejected",
  );
});

// ── Determinism + exact relaunch (brief §3/§8) ───────────────────────────────

test("deterministic replay: the same command sequence from the same seed yields a byte-identical domain", () => {
  const script = (tag: string): ExpeditionDomain => {
    let d = fresh();
    d = run(d, { command_id: `${tag}.p`, kind: "prepare", guardian_id: "gdn.tarin" });
    d = run(d, { command_id: `${tag}.d`, kind: "dispatch" });
    d = run(d, { command_id: `${tag}.a`, kind: "arrive" });
    d = run(d, { command_id: `${tag}.r`, kind: "resolve", outcome: "partial_success" });
    d = run(d, { command_id: `${tag}.k`, kind: "dock" });
    return d;
  };
  // Same command ids on both runs → byte-identical.
  const a = script("det");
  const b = script("det");
  assert.equal(canonicalSerialize(a), canonicalSerialize(b), "identical inputs produce byte-identical output");
});

// ── Save/load at every major phase (brief §2.18 exact save/relaunch/resume) ──

test("save/load at every major phase round-trips byte-identically and reloads a valid domain", () => {
  const dir = mkdtempSync(join(tmpdir(), "hg-exp-phase-"));
  try {
    // Build one representative domain per phase.
    const phases: Array<[string, ExpeditionDomain]> = [];
    let d = fresh();
    phases.push(["idle", d]);
    d = run(d, { command_id: "ph.prepare", kind: "prepare", guardian_id: "gdn.raxa" });
    phases.push(["preparing", d]);
    d = run(d, { command_id: "ph.dispatch", kind: "dispatch" });
    phases.push(["en_route", d]);
    d = run(d, { command_id: "ph.arrive", kind: "arrive" });
    phases.push(["at_outpost", d]);
    d = run(d, { command_id: "ph.resolve", kind: "resolve", outcome: "retreat" });
    phases.push(["returning", d]);
    d = run(d, { command_id: "ph.dock", kind: "dock" });
    phases.push(["docked", d]);
    if (Object.keys(d.expedition.active?.cargo_aboard ?? {}).length > 0) d = run(d, { command_id: "ph.unload", kind: "unload" });
    d = run(d, { command_id: "ph.complete", kind: "complete" });
    phases.push(["recovering", d]);

    for (const [label, domain] of phases) {
      const slot = join(dir, `${label}.save.json`);
      const blob: SaveBlob = {
        ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }),
        resources: toResourceBands(domain.harbor),
        expedition: domain.expedition,
        harbor_operations: domain.harbor_operations,
      };
      saveAtomically(slot, blob, { validate });
      const loaded = loadSave(slot, validate);
      assert.equal(canonicalSerialize(loaded), readFileSync(slot, "utf8"), `${label}: save→load byte-identical`);
      assert.deepEqual(loaded.expedition, domain.expedition, `${label}: expedition block preserved`);
      assert.deepEqual(loaded.harbor_operations, domain.harbor_operations, `${label}: harbor_operations preserved`);
      assertExpeditionDomainValid(
        { expedition: loaded.expedition, harbor_operations: loaded.harbor_operations, harbor: fromResourceBands(loaded.resources, storageSeed) },
        content,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── A1–A3 regression protection (A4 never touches the Claim Ledger) ──────────

test("A4 regression guard: a full expedition leaves a pre-existing Claim Ledger byte-identical (no new source_type, no reward generation)", () => {
  const dir = mkdtempSync(join(tmpdir(), "hg-exp-reg-"));
  try {
    // Run a full loop, then project into a blob that ALSO carries a pre-existing ledger package.
    let d = fresh();
    d = run(d, { command_id: "reg.prepare", kind: "prepare", guardian_id: "gdn.nova" });
    d = run(d, { command_id: "reg.dispatch", kind: "dispatch" });
    d = run(d, { command_id: "reg.arrive", kind: "arrive" });
    d = run(d, { command_id: "reg.resolve", kind: "resolve", outcome: "full_success" });
    d = run(d, { command_id: "reg.dock", kind: "dock" });
    d = run(d, { command_id: "reg.unload", kind: "unload" });
    d = run(d, { command_id: "reg.complete", kind: "complete" });

    const priorLedger = {
      packages: [
        {
          package_id: "pre.pkg",
          source_type: "test_supplied" as const,
          contents: { resources: { Crowns: 100 }, flags: [] as [], cosmetics: [] as [], gear_refs: [] as [] },
          created_world_clock: { day_index: 0, time_of_day: 0 },
          is_story: false as const,
          system_grant: false as const,
          held_remainder: { Crowns: 100 },
        },
      ],
      story_claims: [],
    };
    const blob: SaveBlob = {
      ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }),
      resources: toResourceBands(d.harbor),
      claim_ledger: priorLedger,
      expedition: d.expedition,
      harbor_operations: d.harbor_operations,
    };
    const slot = join(dir, "reg.save.json");
    saveAtomically(slot, blob, { validate });
    const loaded = loadSave(slot, validate);
    assert.equal(canonicalSerialize(loaded.claim_ledger), canonicalSerialize(priorLedger), "the Claim Ledger is untouched by A4");
    assert.deepEqual(loaded.pending_reward_resolution, [], "A4 creates no pending reward records");
    assert.deepEqual(loaded.events, [], "A4 stores its bounded event inside the expedition, not the shared events block");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── Minimal Windows desktop viewer transcript (brief §2/§7) ──────────────────

test("UI viewer transcript: the committed src/ui/shell/playthrough.json is byte-identical to a fresh sim-derived generation (no drift)", () => {
  const committed = readFileSync("src/ui/shell/playthrough.json", "utf8");
  const fresh = canonicalSerialize(buildPlaythrough(storageSeed, loadExpeditionSeed(), 20260723)) + "\n";
  assert.equal(committed, fresh, "the viewer transcript must be regenerated from the sim (run `pnpm run ui:playthrough`)");
});
