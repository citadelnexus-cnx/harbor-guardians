/**
 * Alpha A4 interactive-controller tests — the headless-verifiable core of the
 * Windows player flow (PR #21 review correction). Every test drives the pure
 * ExpeditionController (src/ui/controller.ts), which maps player intents onto
 * the AUTHORITATIVE sim (src/sim/expedition.ts) — proving the UI operates on
 * the real state machine, not a parallel JS model. The Tauri webview glue and
 * the Rust persistence command are thin layers over exactly this logic.
 *   pnpm run test:ui
 *
 * Governing docs: ALPHA_A4_EXECUTION_BRIEF v0.1 §2/§3; SIM_HARNESS_ACCEPTANCE
 * §4.7 (OPS1). Invariant refs: mirrors the sim; introduces none.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import type { StartingGuardianId } from "../src/contracts/expedition.js";
import { ExpeditionController, type UiAction } from "../src/ui/controller.js";
import { loadExpeditionSeed } from "../sim-harness/expedition-seed.js";
import { loadStorageSeed } from "../sim-harness/storage-seed.js";

const SEED = 20260723;
const storageSeed = loadStorageSeed();
const expeditionSeed = loadExpeditionSeed();

function controller(scenario?: "fresh" | "overflow_demo" | "cancel_block_demo"): ExpeditionController {
  return new ExpeditionController(storageSeed, expeditionSeed, SEED, scenario);
}

/** Find an offered action by kind (and optional outcome/guardian) — asserts it is actually available. */
function offered(c: ExpeditionController, kind: UiAction["kind"], match?: Partial<UiAction>): UiAction {
  const action = c.availableActions().find(
    (a) => a.kind === kind && (!match?.outcome || a.outcome === match.outcome) && (!match?.guardian_id || a.guardian_id === match.guardian_id),
  );
  assert.ok(action, `action ${kind} ${JSON.stringify(match ?? {})} should be offered in phase ${c.view().phase}`);
  return action;
}

/** Drive one offered action and assert it applied. */
function act(c: ExpeditionController, kind: UiAction["kind"], match?: Partial<UiAction>): void {
  const res = c.perform(offered(c, kind, match));
  assert.ok(res.ok, res.error);
}

/** Drive a full success loop for a guardian, unloading fully, back to idle-ready. */
function fullLoop(c: ExpeditionController, guardian: StartingGuardianId): void {
  act(c, "start", { guardian_id: guardian });
  act(c, "prepare", { guardian_id: guardian });
  act(c, "depart");
  act(c, "advance");
  act(c, "resolve", { outcome: "full_success" });
  act(c, "dock");
  // Unload until the hold clears (full success fits in Safe Storage + Overflow).
  for (let i = 0; i < 6 && c.view().phase === "docked" && Object.keys(c.view().cargo_aboard).length > 0; i++) {
    act(c, "unload");
  }
  act(c, "complete");
}

test("full canonical loop via UI actions returns to idle, unlocks route-anchor ops, and exercises Overflow", () => {
  const c = controller();
  fullLoop(c, "gdn.nova");
  const v = c.view();
  assert.equal(v.phase, "idle", "clean full success returns to idle");
  assert.equal(v.completed_expeditions, 1);
  assert.equal(v.route_anchor_unlocked, true, "first full success unlocks route-anchor ops");
  assert.equal(v.intro_consumed, true);
  assert.ok((v.overflow.Crowns ?? 0) > 0, "Nova's full-success salvage overflowed Safe Storage into Overflow");
});

test("each starting Guardian can complete the loop; salvage arrives as that Guardian's distinct resource, equal totals", () => {
  const byGuardian: Record<string, number> = {};
  for (const guardian of ["gdn.raxa", "gdn.tarin", "gdn.nova"] as StartingGuardianId[]) {
    const c = controller();
    act(c, "start", { guardian_id: guardian });
    act(c, "prepare", { guardian_id: guardian });
    act(c, "depart");
    act(c, "advance");
    act(c, "resolve", { outcome: "full_success" });
    act(c, "dock");
    const cargo = c.view().cargo_aboard;
    const keys = Object.keys(cargo);
    assert.equal(keys.length, 1, `${guardian}: salvage is a single resource`);
    byGuardian[guardian] = cargo[keys[0] as keyof typeof cargo] ?? 0;
  }
  const totals = Object.values(byGuardian);
  assert.ok(totals.every((t) => t === totals[0]), `equal totals across guardians: ${JSON.stringify(byGuardian)}`);
});

test("available actions are phase-correct and an unavailable action is rejected leaving state unchanged", () => {
  const c = controller();
  // At idle, only Guardian-choice actions are offered; resolving is not.
  assert.ok(c.availableActions().every((a) => a.kind === "start"));
  const before = c.serialize("2026-01-01T00:00:00.000Z");
  const res = c.perform({ kind: "resolve", label: "x", outcome: "full_success" });
  assert.equal(res.ok, false, "resolve at idle is rejected");
  assert.ok(res.error);
  assert.equal(c.serialize("2026-01-01T00:00:00.000Z"), before, "rejected action leaves the domain unchanged");
});

test("OPS1 via UI: cancel before departure refunds supplies exactly and returns to idle", () => {
  const c = controller();
  const start = c.view().harbor;
  act(c, "start", { guardian_id: "gdn.nova" });
  act(c, "prepare", { guardian_id: "gdn.nova" });
  const afterPrepare = c.view().harbor;
  assert.ok(afterPrepare.Provisions.safe + afterPrepare.Provisions.exposed < start.Provisions.safe + start.Provisions.exposed, "supplies withdrawn at prepare");
  act(c, "cancel");
  const after = c.view();
  assert.equal(after.phase, "idle");
  for (const r of ["Crowns", "Provisions", "Iron", "Aether"] as const) {
    assert.equal(after.harbor[r].safe + after.harbor[r].exposed, start[r].safe + start[r].exposed, `${r} fully refunded`);
  }
  assert.equal(after.completed_expeditions, 0);
});

test("OPS1 blocked-cancel demo: a refund that would breach 3S blocks and preserves supplies (supplies not deleted)", () => {
  const c = controller("cancel_block_demo");
  assert.equal(c.view().phase, "preparing", "the demo starts prepared with a full Harbor");
  const before = c.view().harbor;
  const res = c.perform(offered(c, "cancel"));
  assert.ok(res.ok);
  assert.equal(c.view().phase, "preparing", "cancellation blocked — still preparing (supplies preserved)");
  for (const r of ["Crowns", "Provisions", "Iron", "Aether"] as const) {
    assert.equal(c.view().harbor[r].safe + c.view().harbor[r].exposed, before[r].safe + before[r].exposed, `${r} stock unchanged`);
  }
});

test("adverse outcome: forced withdrawal leads to recovering; a single recover restores readiness", () => {
  const c = controller();
  act(c, "start", { guardian_id: "gdn.raxa" });
  act(c, "prepare", { guardian_id: "gdn.raxa" });
  act(c, "depart");
  act(c, "advance");
  act(c, "resolve", { outcome: "forced_withdrawal" });
  act(c, "dock");
  // No cargo on forced withdrawal → complete goes straight to recovering.
  act(c, "complete");
  assert.equal(c.view().phase, "recovering");
  assert.equal(c.view().vessel_condition, "damaged");
  act(c, "recover");
  assert.equal(c.view().phase, "idle");
});

test("blocked unloading: with Storage + Overflow full, unload leaves cargo aboard (preserved) and blocks completion", () => {
  const c = controller("overflow_demo");
  act(c, "start", { guardian_id: "gdn.raxa" }); // Raxa → Iron
  act(c, "prepare", { guardian_id: "gdn.raxa" });
  act(c, "depart");
  act(c, "advance");
  act(c, "resolve", { outcome: "full_success" });
  act(c, "dock");
  const arrived = c.view().cargo_aboard.Iron ?? 0;
  assert.ok(arrived > 0);
  act(c, "unload");
  const v = c.view();
  assert.ok(v.unload_blocked, "unloading is blocked (Storage + Overflow full)");
  assert.equal(v.cargo_aboard.Iron, arrived, "the full salvage stays aboard, preserved");
  // Completion is refused while cargo remains aboard.
  const complete = c.perform({ kind: "complete", label: "x" });
  assert.equal(complete.ok, false, "completion blocked while cargo remains (no stranding)");
});

test("duplicate-submit resistance: re-performing a resolve action does not double-apply", () => {
  const c = controller();
  act(c, "start", { guardian_id: "gdn.nova" });
  act(c, "prepare", { guardian_id: "gdn.nova" });
  act(c, "depart");
  act(c, "advance");
  // Perform the SAME UiAction object twice; the second is not a legal transition from `returning`.
  const resolveAction = offered(c, "resolve", { outcome: "full_success" });
  const first = c.perform(resolveAction);
  assert.ok(first.ok);
  assert.equal(c.view().phase, "returning");
  const second = c.perform(resolveAction);
  assert.equal(second.ok, false, "re-issuing resolve from returning is rejected (no double-apply)");
  assert.equal(c.view().phase, "returning", "state unchanged after the rejected duplicate");
});

test("save + relaunch: serialize during an active non-Harbor phase, restore, and resume the EXACT state and actions", () => {
  const c = controller();
  act(c, "start", { guardian_id: "gdn.tarin" });
  act(c, "prepare", { guardian_id: "gdn.tarin" });
  act(c, "depart");
  act(c, "advance");
  act(c, "resolve", { outcome: "partial_success" });
  // Save mid-loop at `returning`.
  const saved = c.serialize("2026-02-02T00:00:00.000Z");

  // Relaunch: restore from the saved string.
  const resumed = ExpeditionController.fromSerialized(saved, storageSeed, expeditionSeed, SEED);
  assert.equal(resumed.view().phase, "returning", "resumed at the exact saved phase");
  assert.equal(resumed.serialize("2026-02-02T00:00:00.000Z"), saved, "resumed state re-serializes byte-identically (no reroll/duplication)");
  // The same next action is available and completes the loop.
  const r = resumed.perform(offered(resumed, "dock"));
  assert.ok(r.ok);
  assert.equal(resumed.view().phase, "docked");
});

test("malformed save is rejected loudly on restore (never silently repaired)", () => {
  assert.throws(
    () => ExpeditionController.fromSerialized("{ not valid json", storageSeed, expeditionSeed, SEED),
    "invalid JSON is rejected",
  );
  const goodBlob = JSON.parse(controller().serialize("2026-01-01T00:00:00.000Z")) as Record<string, unknown>;
  const tampered = { ...goodBlob, expedition: { phase: "not_a_phase", active: null, next_expedition_index: 0, last_command_id: null } };
  assert.throws(
    () => ExpeditionController.fromSerialized(JSON.stringify(tampered), storageSeed, expeditionSeed, SEED),
    "a malformed expedition block is rejected",
  );
});

test("repeat expedition via UI: a second loop runs and the completed count advances without replaying the intro", () => {
  const c = controller();
  fullLoop(c, "gdn.nova");
  assert.equal(c.view().completed_expeditions, 1);
  assert.equal(c.view().intro_consumed, true);
  fullLoop(c, "gdn.raxa");
  assert.equal(c.view().completed_expeditions, 2, "the loop is repeatable");
});
