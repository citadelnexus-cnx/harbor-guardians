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

/** Find an offered action by kind (and optional outcome/guardian/band) — asserts it is actually available. */
function offered(c: ExpeditionController, kind: UiAction["kind"], match?: Partial<UiAction>): UiAction {
  const action = c.availableActions().find(
    (a) =>
      a.kind === kind &&
      (!match?.outcome || a.outcome === match.outcome) &&
      (!match?.guardian_id || a.guardian_id === match.guardian_id) &&
      (!match?.band || a.band === match.band),
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

/** Drive a Raxa full-success expedition in the overflow_demo scenario to the blocked dock. */
/** Select a discard and CONFIRM it (the two-step destructive flow). */
function discard(c: ExpeditionController, band: "safe" | "exposed" | "overflow"): void {
  c.perform(offered(c, "jettison", { band })); // opens confirmation (no discard yet)
  const r = c.perform(offered(c, "confirm_discard")); // commits exactly once
  assert.ok(r.ok, r.error);
}

function toBlockedDock(c: ExpeditionController): number {
  act(c, "start", { guardian_id: "gdn.raxa" }); // Raxa → Iron
  act(c, "prepare", { guardian_id: "gdn.raxa" });
  act(c, "depart");
  act(c, "advance");
  act(c, "resolve", { outcome: "full_success" });
  act(c, "dock");
  return c.view().cargo_aboard.Iron ?? 0;
}

test("blocked unloading is NOT a dead-end: it offers a manage action, blocks completion, and preserves cargo", () => {
  const c = controller("overflow_demo");
  const arrived = toBlockedDock(c);
  assert.ok(arrived > 0);
  const v = c.view();
  assert.ok(v.unload_blocked, "unloading is blocked (Storage + Overflow full)");
  assert.equal(v.cargo_aboard.Iron, arrived, "the full salvage stays aboard, preserved");
  const actions = c.availableActions();
  assert.ok(actions.some((a) => a.kind === "manage"), "a Harbor-management continuation is offered (no dead-end)");
  assert.ok(!actions.some((a) => a.kind === "complete"), "completion is not offered while cargo remains");
  const complete = c.perform({ kind: "complete", label: "x" });
  assert.equal(complete.ok, false, "completion is refused while cargo remains (no stranding)");
});

test("blocked-unload RECOVERY: manage → discard to free capacity → resume unloading → drain to zero → complete", () => {
  const c = controller("overflow_demo");
  const arrived = toBlockedDock(c);

  // Enter Harbor management; cargo is preserved and unchanged.
  act(c, "manage");
  assert.equal(c.view().management_mode, true);
  assert.equal(c.view().cargo_aboard.Iron, arrived, "cargo preserved on entering management");

  // Drain across as many discard→resume cycles as needed (bounded loop).
  for (let i = 0; i < 8 && (c.view().cargo_aboard.Iron ?? 0) > 0; i++) {
    if (!c.view().management_mode) act(c, "manage");
    // Confirmed discard from unsafe Overflow (explicit, bounded, authoritative).
    const beforeOverflow = c.view().overflow.Iron ?? 0;
    discard(c, "overflow");
    assert.ok((c.view().overflow.Iron ?? 0) < beforeOverflow, "Overflow was reduced by the confirmed discard");
    // Resume unloading — moves only what now fits.
    act(c, "resume_unload");
  }
  assert.equal(Object.keys(c.view().cargo_aboard).length, 0, "cargo drained to zero across discard/resume cycles");

  // Completion is now available and succeeds.
  act(c, "complete");
  assert.notEqual(c.view().phase, "docked", "the expedition completed once cargo reached zero");
});

test("destructive-discard SAFETY: selecting a discard only opens a confirmation and mutates nothing", () => {
  const c = controller("overflow_demo");
  toBlockedDock(c);
  act(c, "manage");
  const before = c.serialize("2026-01-01T00:00:00.000Z");
  const overflowBefore = c.view().overflow.Iron ?? 0;
  const sel = offered(c, "jettison", { band: "overflow" });
  const res = c.perform(sel);
  assert.ok(res.ok);
  // Nothing discarded; a pending confirmation is recorded with the exact fields.
  assert.equal(c.view().overflow.Iron ?? 0, overflowBefore, "selecting a discard does not reduce Overflow");
  assert.equal(c.serialize("2026-01-01T00:00:00.000Z"), before, "no authoritative state changed on selection");
  assert.ok(c.view().pending_discard, "a pending confirmation is recorded");
  assert.equal(c.view().pending_discard!.resource, "Iron");
  assert.equal(c.view().pending_discard!.band, "overflow");
  assert.equal(c.view().pending_discard!.amount, sel.amount);
});

test("destructive-discard SAFETY: only Confirm/Cancel are offered while pending (management shortcuts suppressed — keyboard cannot bypass)", () => {
  const c = controller("overflow_demo");
  toBlockedDock(c);
  act(c, "manage");
  c.perform(offered(c, "jettison", { band: "overflow" }));
  const kinds = c.availableActions().map((a) => a.kind).sort();
  assert.deepEqual(kinds, ["cancel_discard", "confirm_discard"], "while pending, only confirm/cancel are available");
  assert.ok(!c.availableActions().some((a) => a.kind === "jettison" || a.kind === "resume_unload" || a.kind === "back"), "management shortcuts are suppressed");
});

test("destructive-discard SAFETY: Cancel clears the pending confirmation and changes nothing", () => {
  const c = controller("overflow_demo");
  toBlockedDock(c);
  act(c, "manage");
  const before = c.serialize("2026-01-01T00:00:00.000Z");
  c.perform(offered(c, "jettison", { band: "overflow" }));
  const cancel = c.perform(offered(c, "cancel_discard"));
  assert.ok(cancel.ok);
  assert.equal(c.view().pending_discard, null, "pending cleared");
  assert.equal(c.serialize("2026-01-01T00:00:00.000Z"), before, "nothing discarded; state unchanged");
  // Back in the normal management actions.
  assert.ok(c.availableActions().some((a) => a.kind === "jettison"), "management actions restored after cancel");
});

test("destructive-discard SAFETY: Confirm issues the discard exactly once; a duplicate Confirm does not double-discard", () => {
  const c = controller("overflow_demo");
  toBlockedDock(c);
  act(c, "manage");
  const overflowBefore = c.view().overflow.Iron ?? 0;
  const sel = offered(c, "jettison", { band: "overflow" });
  c.perform(sel);
  const confirm = offered(c, "confirm_discard");
  const first = c.perform(confirm);
  assert.ok(first.ok && first.applied, "confirm applied the discard once");
  const after = c.view().overflow.Iron ?? 0;
  assert.equal(after, overflowBefore - (sel.amount ?? 0), "exactly the confirmed amount was discarded");
  assert.equal(c.view().pending_discard, null, "pending cleared after commit");
  // A duplicate Confirm (pending already cleared) is an idempotent no-op.
  const second = c.perform(confirm);
  assert.equal(second.applied, false, "duplicate confirm not applied");
  assert.ok(second.idempotent);
  assert.equal(c.view().overflow.Iron ?? 0, after, "no second discard occurred");
});

test("destructive-discard SAFETY: save while confirmation is open contains only committed state; reload never executes the pending discard", () => {
  const c = controller("overflow_demo");
  const arrived = toBlockedDock(c);
  act(c, "manage");
  const committed = c.serialize("2026-04-04T00:00:00.000Z");
  // Open a confirmation, THEN save.
  c.perform(offered(c, "jettison", { band: "overflow" }));
  const savedWhilePending = c.serialize("2026-04-04T00:00:00.000Z");
  assert.equal(savedWhilePending, committed, "the save contains only committed state (pending is transient UI, not persisted)");
  // Reload: no discard executed; a safe committed blocked state with full cargo.
  const resumed = ExpeditionController.fromSerialized(savedWhilePending, storageSeed, expeditionSeed, SEED);
  assert.equal(resumed.view().pending_discard, null, "no pending discard after reload");
  assert.equal(resumed.view().cargo_aboard.Iron, arrived, "cargo intact — the pending discard never executed");
  assert.ok(resumed.view().unload_blocked, "resumes to the safe committed blocked state");
});

test("save/reload while blocked restores the exact blocked state and its recovery actions", () => {
  const c = controller("overflow_demo");
  const arrived = toBlockedDock(c);
  const saved = c.serialize("2026-03-03T00:00:00.000Z");

  const resumed = ExpeditionController.fromSerialized(saved, storageSeed, expeditionSeed, SEED);
  const v = resumed.view();
  assert.equal(v.phase, "docked");
  assert.equal(v.cargo_aboard.Iron, arrived, "exact blocked cargo restored");
  assert.ok(v.unload_blocked, "blocked state re-derived from persisted state after reload");
  assert.ok(resumed.availableActions().some((a) => a.kind === "manage"), "the manage recovery action is available after reload");
  // The recovery path works on the resumed session — drain across bounded cycles, then complete.
  for (let i = 0; i < 8 && (resumed.view().cargo_aboard.Iron ?? 0) > 0; i++) {
    if (!resumed.view().management_mode) resumed.perform(offered(resumed, "manage"));
    discard(resumed, "overflow");
    resumed.perform(offered(resumed, "resume_unload"));
  }
  assert.equal(Object.keys(resumed.view().cargo_aboard).length, 0, "resumed session drains the cargo");
  resumed.perform(offered(resumed, "complete"));
  assert.notEqual(resumed.view().phase, "docked", "resumed session completes the loop after recovery");
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
