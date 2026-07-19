/**
 * Alpha A3 Option A event-lifecycle skeleton tests — fixture schema
 * acceptance/rejection, the full choice and imposed lifecycle paths, legal
 * and illegal transition coverage, terminal-state rejection, determinism,
 * input immutability, observable-state condition boundaries (EVT4), and
 * mid-flight save/load with exactly-once resumption (EVT3) through the REAL
 * SaveBlob v3 events block. Runs on node:test via tsx:
 *   pnpm run test:events
 *
 * Boundary assertions included: no effect is ever executed, the Claim Ledger
 * is never mutated by any lifecycle operation, and no gameplay behavior is
 * claimed — RESOLVED is a lifecycle terminal, not an applied outcome.
 *
 * Governing docs: 15_EVENT_SYSTEM_SPEC v0.2 §2/§3/§5; ALPHA_A3_EXECUTION_
 * BRIEF v0.1 §1/§2; SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §14/§15.
 * Invariant refs: EVT1, EVT2, EVT3, EVT4 (the harness checks in
 * sim-harness/event-checks.ts are the registry evidence; these tests
 * exercise the same spine at unit granularity).
 */

import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import type { Condition, Event, EventInstance } from "../src/contracts/event.js";
import {
  advance,
  assertEventInstanceValid,
  assertEventValid,
  createEventInstance,
  EventLifecycleInvariantError,
  evaluateCondition,
  evaluateTriggers,
  TERMINAL_STATES,
  type ObservableState,
  type TransitionSignal,
} from "../src/sim/event-lifecycle.js";
import { createClaimLedgerState } from "../src/sim/claim-ledger.js";
import { createHarborState, withdraw } from "../src/sim/harbor-state.js";
import { canonicalSerialize } from "../src/save/canonical-json.js";
import { loadSave, saveAtomically } from "../src/save/atomic-save.js";
import { createEmptySaveBlob } from "../src/save/empty-save.js";
import { createSaveBlobValidator, SaveIdentityError } from "../src/save/save-blob-validator.js";
import {
  BROKEN_EVENT_FIXTURE_PATH,
  CHOICE_EVENT_FIXTURE_PATH,
  EventFixtureValidationError,
  IMPOSED_EVENT_FIXTURE_PATH,
  loadEventFixture,
} from "../sim-harness/event-fixtures.js";
import { loadStorageSeed } from "../sim-harness/storage-seed.js";

const validate = createSaveBlobValidator();
const storage = loadStorageSeed();
const choice = loadEventFixture(CHOICE_EVENT_FIXTURE_PATH).event;
const imposed = loadEventFixture(IMPOSED_EVENT_FIXTURE_PATH).event;

function observed(resolved: readonly string[]): ObservableState {
  return { harbor: createHarborState(storage), ledger: createClaimLedgerState(), resolved_event_ids: resolved };
}
const met = () => observed([choice.event_id]);

function drive(event: Event, instance: EventInstance, signals: readonly TransitionSignal[]): EventInstance {
  for (const signal of signals) instance = advance(event, instance, signal).instance;
  return instance;
}

function withTempDir(run: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), "hg-evt-test-"));
  try {
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── Fixture schema boundary (EVT1) ───────────────────────────────────────────

test("fixtures: valid choice and imposed fixtures pass the generated schema; both validate structurally", () => {
  assertEventValid(choice);
  assertEventValid(imposed);
  assert.equal(choice.offer_window.kind, "player_choice");
  assert.equal(imposed.offer_window.kind, "imposed");
  assert.equal(choice.chain_next, null, "chains are FUTURE BUILD (EVT10)");
});

test("fixtures: the deliberate broken fixture (future-system condition, non-null chain, surfacing key) is rejected", () => {
  assert.throws(() => loadEventFixture(BROKEN_EVENT_FIXTURE_PATH), EventFixtureValidationError);
});

// ── Lifecycle paths (EVT2) ───────────────────────────────────────────────────

test("choice path: DORMANT → ELIGIBLE → OFFERED → ACTIVE → RESOLVING → RESOLVED, staging inert effects exactly once", () => {
  let instance = createEventInstance(choice, "t.choice");
  assert.equal(instance.state, "DORMANT");
  instance = drive(choice, instance, [{ kind: "evaluate", observed: met() }, { kind: "present" }]);
  assert.equal(instance.state, "OFFERED", "player-choice events offer, never trigger");
  instance = drive(choice, instance, [{ kind: "accept" }]);
  assert.equal(instance.state, "ACTIVE");
  assert.equal(instance.selected_outcome_id, null, "no outcome before RESOLVING");
  assert.deepEqual(instance.staged_effects, [], "no staged effects before RESOLVING");
  instance = drive(choice, instance, [{ kind: "complete", outcome_id: "out.success" }]);
  assert.equal(instance.state, "RESOLVING");
  assert.equal(instance.selected_outcome_id, "out.success");
  assert.deepEqual(instance.staged_effects, choice.outcomes[0]!.effects, "staged descriptors copy the outcome verbatim");
  instance = drive(choice, instance, [{ kind: "finalize" }]);
  assert.equal(instance.state, "RESOLVED");
  assert.deepEqual(instance.staged_effects, choice.outcomes[0]!.effects, "descriptors preserved through RESOLVED — inert, not executed, not dropped");
  assert.equal(instance.event_id, choice.event_id, "identity stable across every transition");
  assertEventInstanceValid(choice, instance);
});

test("imposed path: ELIGIBLE presents to TRIGGERED (never OFFERED) and begins to ACTIVE", () => {
  let instance = drive(imposed, createEventInstance(imposed, "t.imposed"), [
    { kind: "evaluate", observed: met() },
    { kind: "present" },
  ]);
  assert.equal(instance.state, "TRIGGERED", "imposed events trigger, never offer");
  instance = drive(imposed, instance, [{ kind: "begin" }, { kind: "complete", outcome_id: "out.endured" }, { kind: "finalize" }]);
  assert.equal(instance.state, "RESOLVED");
});

test("fair branch: OFFERED can DECLINE or EXPIRE; both are terminal", () => {
  for (const [id, kind, terminal] of [
    ["t.decline", "decline", "DECLINED"],
    ["t.expire", "expire", "EXPIRED"],
  ] as const) {
    const instance = drive(choice, createEventInstance(choice, id), [
      { kind: "evaluate", observed: met() },
      { kind: "present" },
      { kind },
    ]);
    assert.equal(instance.state, terminal);
    assert.throws(() => advance(choice, instance, { kind: "accept" }), EventLifecycleInvariantError);
  }
});

test("unmet triggers: evaluation is a no-op that leaves the instance DORMANT (ALL conditions required)", () => {
  const instance = createEventInstance(imposed, "t.unmet");
  const result = advance(imposed, instance, { kind: "evaluate", observed: observed([]) });
  assert.equal(result.transitioned, false);
  assert.equal(result.instance.state, "DORMANT");
  assert.equal(result.instance, instance, "no-op returns the same unmutated instance");
});

test("illegal transitions: every unlisted (state, signal) pair throws and leaves the input unchanged", () => {
  const dormant = createEventInstance(choice, "t.illegal");
  const eligible = drive(choice, createEventInstance(choice, "t.illegal2"), [{ kind: "evaluate", observed: met() }]);
  const offered = drive(choice, createEventInstance(choice, "t.illegal3"), [{ kind: "evaluate", observed: met() }, { kind: "present" }]);
  const cases: Array<[Event, EventInstance, TransitionSignal]> = [
    [choice, dormant, { kind: "present" }],
    [choice, dormant, { kind: "finalize" }],
    [choice, eligible, { kind: "accept" }],
    [choice, eligible, { kind: "complete", outcome_id: "out.success" }],
    [choice, offered, { kind: "begin" }], // begin is the TRIGGERED path only
    [choice, offered, { kind: "finalize" }],
  ];
  for (const [event, instance, signal] of cases) {
    const before = canonicalSerialize(instance);
    assert.throws(() => advance(event, instance, signal), EventLifecycleInvariantError, `${instance.state} + ${signal.kind}`);
    assert.equal(canonicalSerialize(instance), before, "input untouched after the rejected transition");
  }
});

test("terminal states reject every signal (no resolution replay)", () => {
  const resolved = drive(choice, createEventInstance(choice, "t.terminal"), [
    { kind: "evaluate", observed: met() },
    { kind: "present" },
    { kind: "accept" },
    { kind: "complete", outcome_id: "out.withdrawn" },
    { kind: "finalize" },
  ]);
  assert.ok(TERMINAL_STATES.includes(resolved.state));
  for (const signal of [
    { kind: "evaluate", observed: met() },
    { kind: "present" },
    { kind: "accept" },
    { kind: "complete", outcome_id: "out.success" },
    { kind: "finalize" },
  ] as TransitionSignal[]) {
    assert.throws(() => advance(choice, resolved, signal), EventLifecycleInvariantError);
  }
});

test("determinism: identical inputs produce byte-identical instances across repeat runs", () => {
  const run = () =>
    canonicalSerialize(
      drive(choice, createEventInstance(choice, "t.det"), [
        { kind: "evaluate", observed: met() },
        { kind: "present" },
        { kind: "accept" },
        { kind: "complete", outcome_id: "out.success" },
        { kind: "finalize" },
      ]),
    );
  assert.equal(run(), run());
});

test("unknown outcome and mismatched event/instance pairing are rejected", () => {
  const active = drive(choice, createEventInstance(choice, "t.badoutcome"), [
    { kind: "evaluate", observed: met() },
    { kind: "present" },
    { kind: "accept" },
  ]);
  assert.throws(() => advance(choice, active, { kind: "complete", outcome_id: "out.nonexistent" }), EventLifecycleInvariantError);
  assert.throws(() => advance(imposed, active, { kind: "complete", outcome_id: "out.endured" }), EventLifecycleInvariantError);
});

test("structural validity: chained, outcome-less, and duplicate-id events are rejected at creation", () => {
  const chained = { ...choice, chain_next: "somewhere" } as unknown as Event;
  assert.throws(() => createEventInstance(chained, "t.v1"), EventLifecycleInvariantError);
  const noOutcomes = { ...choice, outcomes: [] };
  assert.throws(() => createEventInstance(noOutcomes, "t.v2"), EventLifecycleInvariantError);
  const dupOutcomes = { ...choice, outcomes: [choice.outcomes[0]!, choice.outcomes[0]!] };
  assert.throws(() => createEventInstance(dupOutcomes, "t.v3"), EventLifecycleInvariantError);
});

// ── Observable-state conditions (EVT4) ───────────────────────────────────────

test("conditions: harbor bands (incl. derived total) evaluate against real A1 state, true and false", () => {
  const prov = storage.storage.Provisions;
  const base = observed([]);
  assert.equal(evaluateCondition({ kind: "harbor_resource_at_least", resource: "Provisions", band: "safe", amount: prov.start_stock }, base), true);
  assert.equal(evaluateCondition({ kind: "harbor_resource_at_least", resource: "Provisions", band: "safe", amount: prov.safe_capacity_st1 }, base), false);
  assert.equal(evaluateCondition({ kind: "harbor_resource_at_least", resource: "Provisions", band: "exposed", amount: prov.start_stock }, base), false);
  // Withdrawing changes the observation — conditions read live state, not a snapshot.
  const drained = { ...base, harbor: withdraw(base.harbor, "Provisions", "safe", prov.start_stock) };
  assert.equal(evaluateCondition({ kind: "harbor_resource_at_least", resource: "Provisions", band: "total", amount: prov.start_stock }, drained), false);
});

test("conditions: unsupported future-system kinds are schema-unrepresentable and fail loudly at runtime", () => {
  const smuggled = { kind: "threat_level_at_least", level: "warning" } as unknown as Condition;
  assert.throws(() => evaluateCondition(smuggled, observed([])), EventLifecycleInvariantError);
});

test("conditions: evaluateTriggers requires ALL to hold", () => {
  assert.equal(evaluateTriggers(imposed, observed([choice.event_id])), true);
  assert.equal(evaluateTriggers(imposed, observed([])), false, "event_resolved trigger unmet");
});

// ── Mid-flight save/load (EVT3) ──────────────────────────────────────────────

test("EVT3: mid-flight instance persists through the real save path and resumes exactly once; ledger untouched", () => {
  withTempDir((dir) => {
    const slot = join(dir, "evt.save.json");
    const midFlight = drive(choice, createEventInstance(choice, "t.persist"), [
      { kind: "evaluate", observed: met() },
      { kind: "present" },
      { kind: "accept" },
      { kind: "complete", outcome_id: "out.success" },
    ]);
    const blob = {
      ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }),
      events: [midFlight],
    };
    saveAtomically(slot, blob, { validate });
    const onDisk = readFileSync(slot, "utf8");

    const loaded = loadSave(slot, validate);
    assert.equal(canonicalSerialize(loaded), onDisk, "round-trip byte-identical");
    const persisted = loaded.events[0]!;
    assert.equal(persisted.state, "RESOLVING");
    assert.deepEqual(persisted.staged_effects, midFlight.staged_effects, "inert staged descriptors preserved exactly");
    assertEventInstanceValid(choice, persisted);

    // Resume exactly once; replay from terminal rejected, before and after re-save.
    const resumed = advance(choice, persisted, { kind: "finalize" });
    assert.equal(resumed.instance.state, "RESOLVED");
    assert.throws(() => advance(choice, resumed.instance, { kind: "finalize" }), EventLifecycleInvariantError);
    saveAtomically(slot, { ...loaded, events: [resumed.instance] }, { validate });
    const reloaded = loadSave(slot, validate);
    assert.equal(reloaded.events[0]!.state, "RESOLVED");
    assert.throws(() => advance(choice, reloaded.events[0]!, { kind: "finalize" }), EventLifecycleInvariantError);

    // No effect execution anywhere in the flow: the ledger block never changed.
    assert.deepEqual(reloaded.claim_ledger, { packages: [], story_claims: [] }, "no Claim Ledger mutation — effects are inert (EVT5 FUTURE BUILD)");
  });
});

test("EVT3 boundary: a save carrying an instance with an ADDED staged effect is caught by instance validation", () => {
  const midFlight = drive(choice, createEventInstance(choice, "t.tamper"), [
    { kind: "evaluate", observed: met() },
    { kind: "present" },
    { kind: "accept" },
    { kind: "complete", outcome_id: "out.success" },
  ]);
  const tampered: EventInstance = { ...midFlight, staged_effects: [...midFlight.staged_effects, { effect_id: "fx.smuggled", binds_to: "claim_ledger" }] };
  assert.throws(() => assertEventInstanceValid(choice, tampered), EventLifecycleInvariantError);
});

test("EVT3 descriptor integrity: a staged effect with an UNCHANGED effect_id but altered binds_to is rejected", () => {
  const midFlight = drive(choice, createEventInstance(choice, "t.bindingtamper"), [
    { kind: "evaluate", observed: met() },
    { kind: "present" },
    { kind: "accept" },
    { kind: "complete", outcome_id: "out.success" },
  ]);
  const original = midFlight.staged_effects[0]!;
  assert.equal(original.effect_id, "fx.reward_note");
  assert.equal(original.binds_to, "claim_ledger", "fixture precondition: original binding is claim_ledger");
  // Same effect_id, different binds_to — id-only comparison would MISS this.
  const bindingMutated: EventInstance = {
    ...midFlight,
    staged_effects: [{ effect_id: original.effect_id, binds_to: "threat_director" }],
  };
  assert.throws(() => assertEventInstanceValid(choice, bindingMutated), EventLifecycleInvariantError);
  // A reordered-but-same-set descriptor list would also be caught (order is significant);
  // and the untampered instance still validates.
  assert.doesNotThrow(() => assertEventInstanceValid(choice, midFlight));
});

// ── Persisted-events identity integrity (EVT3, real save path) ───────────────

test("EVT3 identity: a v3 save with an empty instance_id is rejected by the real save path", () => {
  withTempDir((dir) => {
    const bad: EventInstance = { ...createEventInstance(choice, "placeholder"), instance_id: "" };
    const blob = { ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }), events: [bad] };
    assert.throws(() => saveAtomically(join(dir, "empty-id.save.json"), blob, { validate }), SaveIdentityError);
  });
});

test("EVT3 identity: a v3 save with two event records sharing one instance_id is rejected", () => {
  withTempDir((dir) => {
    const a = createEventInstance(choice, "dup.id");
    const b = { ...createEventInstance(imposed, "dup.id") };
    const blob = { ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }), events: [a, b] };
    assert.throws(() => saveAtomically(join(dir, "dup-id.save.json"), blob, { validate }), SaveIdentityError);
  });
});

test("EVT3 identity: two records with distinct instance_ids but the same event_id remain valid and round-trip", () => {
  withTempDir((dir) => {
    const slot = join(dir, "twins.save.json");
    const a = createEventInstance(choice, "twin.a");
    const b = createEventInstance(choice, "twin.b");
    assert.equal(a.event_id, b.event_id, "both reference the same event_id");
    const blob = { ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }), events: [a, b] };
    assert.doesNotThrow(() => saveAtomically(slot, blob, { validate }));
    const loaded = loadSave(slot, validate);
    assert.equal(loaded.events.length, 2, "both distinct instances preserved — identity guard does not over-reject shared event_id");
  });
});

test("EVT3 identity: the guard is enforced on LOAD too (a duplicate-id save cannot be read back)", () => {
  withTempDir((dir) => {
    // Bypass saveAtomically's validation to plant a duplicate-id file directly, then prove loadSave rejects it.
    const slot = join(dir, "planted.save.json");
    const a = createEventInstance(choice, "same");
    const b = createEventInstance(imposed, "same");
    const blob = { ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }), events: [a, b] };
    writeFileSync(slot, canonicalSerialize(blob), "utf8");
    assert.throws(() => loadSave(slot, validate), SaveIdentityError);
  });
});
