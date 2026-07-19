/**
 * Event lifecycle invariant checks (EVT1 / EVT2 / EVT3 / EVT4) — implemented
 * at Alpha A3 Option A scope (owner Alpha A3 authorization, 2026-07-18:
 * lifecycle mechanics only, test fixtures only). These are the executable
 * evidence behind the four EVT stubs converted at A3. EVT5–EVT10 stay
 * fail-loud, each for a concrete reason recorded in the A3 brief §2: EVT5
 * (reward routing from events) is a deliberately deferred capability
 * increment; EVT6 has no economy loop to bind against; EVT7/EVT8 depend on
 * Inbox/Cargo/Threat systems that don't exist; EVT9 needs the Threat & Raid
 * Director in code; EVT10 ships with real event content authoring.
 *
 * Every check is deterministic (no wall-clock, no paths in evidence, no RNG)
 * and consumes only schema-validated inputs: the event fixtures under
 * tests/fixtures/events/ (test-supplied, exactly like A2's reward drafts)
 * plus the A1 storage and A2 ledger-rules seeds for observable state.
 *
 * Governing docs: 15_EVENT_SYSTEM_SPEC v0.2 §2/§3/§5; ALPHA_A3_EXECUTION_
 * BRIEF v0.1 §1/§2; SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §2/§8; CLAUDE.md §3.
 * Invariant refs: EVT1, EVT2, EVT3, EVT4.
 */

import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Condition, Event, EventInstance } from "../src/contracts/event.js";
import {
  advance,
  assertEventInstanceValid,
  createEventInstance,
  EventLifecycleInvariantError,
  evaluateCondition,
  type ObservableState,
  type TransitionSignal,
} from "../src/sim/event-lifecycle.js";
import { createClaimLedgerState, routeRewardPackage } from "../src/sim/claim-ledger.js";
import { createHarborState } from "../src/sim/harbor-state.js";
import { canonicalSerialize } from "../src/save/canonical-json.js";
import { loadSave, saveAtomically } from "../src/save/atomic-save.js";
import { createEmptySaveBlob } from "../src/save/empty-save.js";
import { SimulatedCrashError } from "../src/save/proofs.js";
import { SaveIdentityError, type SaveBlobValidator } from "../src/save/save-blob-validator.js";
import { numericLeafPaths, resolvePath } from "./data-contract-checks.js";
import {
  BROKEN_EVENT_FIXTURE_PATH,
  CHOICE_EVENT_FIXTURE_PATH,
  EventFixtureValidationError,
  IMPOSED_EVENT_FIXTURE_PATH,
  loadEventFixture,
} from "./event-fixtures.js";
import { loadClaimLedgerRulesSeed } from "./ledger-rules-seed.js";
import { loadStorageSeed } from "./storage-seed.js";
import type { CheckVerdict } from "./types.js";

const fail = (evidence: string): CheckVerdict => ({ pass: false, evidence });
const pass = (evidence: string): CheckVerdict => ({ pass: true, evidence });

/** World-creation observable state (A1 harbor from the storage seed; empty A2 ledger; supplied resolved set). */
function observedState(resolvedEventIds: readonly string[]): ObservableState {
  return {
    harbor: createHarborState(loadStorageSeed()),
    ledger: createClaimLedgerState(),
    resolved_event_ids: resolvedEventIds,
  };
}

/** Drive an instance through a signal sequence, asserting input immutability at every step; returns the canonical trace. */
function walk(event: Event, start: EventInstance, signals: readonly TransitionSignal[]): { trace: string; final: EventInstance } {
  let instance = start;
  const steps: unknown[] = [];
  for (const signal of signals) {
    const before = canonicalSerialize(instance);
    const result = advance(event, instance, signal);
    if (canonicalSerialize(instance) !== before) {
      throw new EventLifecycleInvariantError(`advance mutated its input at ${instance.state} + ${signal.kind}`);
    }
    steps.push({ from: result.from, to: result.to, transitioned: result.transitioned, instance: result.instance });
    instance = result.instance;
  }
  return { trace: canonicalSerialize(steps), final: instance };
}

// ── EVT1 — events are pure schema-validated data ─────────────────────────────

/**
 * EVT1 at A3 scope: both valid fixtures load only through schema validation;
 * the deliberate broken fixture (unsupported condition kind, non-null chain,
 * unknown surfacing key) is rejected; every numeric leaf carries exactly one
 * DC4 metadata entry resolving to a numeric value; and fixtures are NOT
 * runtime content (no data/events exists — the /data seed-discovery path is
 * untouched). The no-gameplay-numbers-in-code half is enforced by the DC1
 * scan over src/sim (which includes event-lifecycle.ts) in this same batch.
 */
export function checkEvt1PureDataEvents(): CheckVerdict {
  const fixtures = [
    { path: CHOICE_EVENT_FIXTURE_PATH, label: "choice" },
    { path: IMPOSED_EVENT_FIXTURE_PATH, label: "imposed" },
  ];
  let leaves = 0;
  for (const { path, label } of fixtures) {
    const fixture = loadEventFixture(path); // throws if schema-invalid
    const leafPaths = numericLeafPaths(fixture.event, "event");
    leaves += leafPaths.length;
    const metaPaths = fixture.value_metadata.map((m) => m.path);
    for (const leaf of leafPaths) {
      if (metaPaths.filter((p) => p === leaf).length !== 1) {
        return fail(`EVT1: ${label} fixture numeric leaf \`${leaf}\` lacks exactly one DC4 metadata entry`);
      }
    }
    for (const m of fixture.value_metadata) {
      if (typeof resolvePath(fixture, m.path) !== "number") {
        return fail(`EVT1: ${label} fixture metadata path \`${m.path}\` does not resolve to a numeric value`);
      }
    }
  }

  let rejected = false;
  try {
    loadEventFixture(BROKEN_EVENT_FIXTURE_PATH);
  } catch (err) {
    rejected = err instanceof EventFixtureValidationError;
  }
  if (!rejected) {
    return fail("EVT1: the deliberate broken fixture PASSED validation — the schema is not rejecting invalid events");
  }

  if (existsSync("data/events")) {
    return fail("EVT1: data/events exists — test fixtures must never become runtime event content at A3");
  }

  return pass(
    `A3 scope: ${fixtures.length} valid test fixtures load only through generated-schema validation ` +
      `(hg.event_fixture_seed, D39); ${leaves} numeric leaf/leaves each carry exactly one DC4 metadata entry; ` +
      `the deliberate broken fixture (unsupported condition kind, non-null chain_next, unknown surfacing key) is ` +
      `rejected; no data/events runtime content exists (fixtures are test-supplied only). Lifecycle code carries ` +
      `no gameplay literals — enforced by the DC1 src/sim scan in this batch.`,
  );
}

// ── EVT2 — deterministic lifecycle transitions ───────────────────────────────

/**
 * EVT2 at A3 scope: identical event definition + instance + observed state +
 * signal sequence produce byte-identical canonical traces across repeat
 * runs, on both the player-choice path (OFFERED, incl. decline/expire
 * variants) and the imposed path (TRIGGERED); an unmet evaluation is a
 * deterministic no-op; every illegal (state, signal) pair fails loudly and
 * identically; inputs are never mutated (asserted at every step).
 */
export function checkEvt2DeterministicTransitions(): CheckVerdict {
  const choice = loadEventFixture(CHOICE_EVENT_FIXTURE_PATH).event;
  const imposed = loadEventFixture(IMPOSED_EVENT_FIXTURE_PATH).event;
  const met = observedState([choice.event_id]);
  const successOutcome = choice.outcomes[0]!.outcome_id;

  const choiceSignals: TransitionSignal[] = [
    { kind: "evaluate", observed: met },
    { kind: "present" },
    { kind: "accept" },
    { kind: "complete", outcome_id: successOutcome },
    { kind: "finalize" },
  ];
  const imposedSignals: TransitionSignal[] = [
    { kind: "evaluate", observed: met },
    { kind: "present" },
    { kind: "begin" },
    { kind: "complete", outcome_id: imposed.outcomes[0]!.outcome_id },
    { kind: "finalize" },
  ];

  // Repeat-run determinism over both full paths.
  const run = () => {
    const a = walk(choice, createEventInstance(choice, "evt2.choice"), choiceSignals);
    const b = walk(imposed, createEventInstance(imposed, "evt2.imposed"), imposedSignals);
    const declined = walk(choice, createEventInstance(choice, "evt2.decline"), [
      { kind: "evaluate", observed: met },
      { kind: "present" },
      { kind: "decline" },
    ]);
    const expired = walk(choice, createEventInstance(choice, "evt2.expire"), [
      { kind: "evaluate", observed: met },
      { kind: "present" },
      { kind: "expire" },
    ]);
    return a.trace + b.trace + declined.trace + expired.trace;
  };
  const first = run();
  const second = run();
  if (first !== second) {
    return fail("EVT2: two identical runs produced different canonical traces — the lifecycle is not deterministic");
  }

  // Unmet evaluation is a deterministic no-op (imposed event requires the choice event resolved).
  const unmet = advance(imposed, createEventInstance(imposed, "evt2.unmet"), {
    kind: "evaluate",
    observed: observedState([]),
  });
  if (unmet.transitioned || unmet.instance.state !== "DORMANT") {
    return fail("EVT2: an unmet evaluation transitioned — eligibility must require ALL triggers");
  }

  // Illegal transitions fail loudly and identically across runs.
  const illegal: Array<[EventInstance, TransitionSignal]> = [
    [createEventInstance(choice, "evt2.i1"), { kind: "accept" }], // DORMANT + accept
    [createEventInstance(choice, "evt2.i2"), { kind: "finalize" }], // DORMANT + finalize
    [walk(choice, createEventInstance(choice, "evt2.i3"), [{ kind: "evaluate", observed: met }]).final, { kind: "complete", outcome_id: successOutcome }], // ELIGIBLE + complete
  ];
  for (const [instance, signal] of illegal) {
    const messages: string[] = [];
    for (const attempt of ["first", "second"]) {
      try {
        advance(choice, instance, signal);
        return fail(`EVT2: illegal ${instance.state} + ${signal.kind} did not fail loudly (${attempt} attempt)`);
      } catch (err) {
        if (!(err instanceof EventLifecycleInvariantError)) throw err;
        messages.push(err.message);
      }
    }
    const [firstMessage, secondMessage] = messages;
    if (firstMessage !== secondMessage) {
      return fail(`EVT2: illegal ${instance.state} + ${signal.kind} failed with different messages across runs`);
    }
  }

  return pass(
    `A3 scope: repeat runs over the full choice path (DORMANT→ELIGIBLE→OFFERED→ACTIVE→RESOLVING→RESOLVED), the ` +
      `imposed path (→TRIGGERED→ACTIVE→…), and the DECLINED/EXPIRED branches produced byte-identical canonical ` +
      `traces; an unmet evaluation is a deterministic no-op; illegal (state, signal) pairs fail loudly with ` +
      `identical messages; inputs proven unmutated at every step. No RNG, clock, timer, or I/O exists in the ` +
      `lifecycle module.`,
  );
}

// ── EVT3 — save-atomic mid-flight events (A3-authorized claim only) ──────────

/**
 * EVT3 at A3 scope: a mid-flight instance (RESOLVING, with staged INERT
 * effect descriptors) persists through the REAL save path (SaveBlob v3
 * events block) byte-identically; repeated load cannot duplicate it; a
 * simulated crash during the next save leaves the prior mid-flight state
 * intact (same crash-simulate pattern as S7); resumption advances the
 * lifecycle exactly once; a terminal instance rejects every further signal
 * (replay cannot duplicate the resolution); and no effect is executed — the
 * claim_ledger block is untouched throughout. This proves lifecycle
 * persistence ONLY: reward delivery and effect application do not exist
 * (EVT5+ fail-loud).
 */
export function checkEvt3SaveAtomicLifecycle(validate: SaveBlobValidator): CheckVerdict {
  const choiceFixture = loadEventFixture(CHOICE_EVENT_FIXTURE_PATH);
  const imposedFixture = loadEventFixture(IMPOSED_EVENT_FIXTURE_PATH);
  const choice = choiceFixture.event;
  const met = observedState([choice.event_id]);

  // Build the mid-flight instance: ACTIVE → RESOLVING with staged effects.
  const midFlight = walk(choice, createEventInstance(choice, "evt3.midflight"), [
    { kind: "evaluate", observed: met },
    { kind: "present" },
    { kind: "accept" },
    { kind: "complete", outcome_id: choice.outcomes[0]!.outcome_id },
  ]).final;
  const dormant = createEventInstance(imposedFixture.event, "evt3.dormant");
  const stagedBefore = canonicalSerialize(midFlight.staged_effects);

  const dir = mkdtempSync(join(tmpdir(), "hg-evt3-"));
  try {
    const slot = join(dir, "evt3.save.json");
    const blob = {
      ...createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" }),
      events: [midFlight, dormant],
    };
    saveAtomically(slot, blob, { validate });
    const onDisk = readFileSync(slot, "utf8");

    // Round-trip byte identity + no duplication across repeated loads.
    const loadedA = loadSave(slot, validate);
    const loadedB = loadSave(slot, validate);
    if (canonicalSerialize(loadedA) !== onDisk || canonicalSerialize(loadedB) !== canonicalSerialize(loadedA)) {
      return fail("EVT3: mid-flight save→load not byte-identical or repeated load diverged — loss/duplication path");
    }
    if (loadedA.events.length !== blob.events.length) {
      return fail("EVT3: events block changed cardinality across save/load");
    }
    const persisted = loadedA.events.find((e) => e.instance_id === "evt3.midflight");
    if (!persisted || persisted.state !== "RESOLVING" || canonicalSerialize(persisted.staged_effects) !== stagedBefore) {
      return fail("EVT3: mid-flight lifecycle state or staged inert effect descriptors changed across save/load");
    }
    assertEventInstanceValid(choice, persisted);

    // Crash-simulate pattern (S7): a crash during the NEXT save leaves the mid-flight state intact.
    const resumed = advance(choice, persisted, { kind: "finalize" });
    if (!resumed.transitioned || resumed.instance.state !== "RESOLVED") {
      return fail("EVT3: resumption did not advance the mid-flight instance exactly once to RESOLVED");
    }
    const nextBlob = { ...loadedA, events: [resumed.instance, dormant] };
    let crashed = false;
    try {
      saveAtomically(slot, nextBlob, {
        validate,
        hooks: {
          beforeCommit: () => {
            throw new SimulatedCrashError("before commit rename (EVT3)");
          },
        },
      });
    } catch (err) {
      crashed = err instanceof SimulatedCrashError;
    }
    if (!crashed || readFileSync(slot, "utf8") !== onDisk) {
      return fail("EVT3: simulated crash corrupted the prior save — the mid-flight event did not persist atomically");
    }
    if (canonicalSerialize(loadSave(slot, validate).events.find((e) => e.instance_id === "evt3.midflight")) !== canonicalSerialize(persisted)) {
      return fail("EVT3: after the crash the mid-flight instance no longer loads to the same state");
    }

    // Successful commit, then replay protection: a terminal instance rejects every signal, before and after reload.
    saveAtomically(slot, nextBlob, { validate });
    const reloaded = loadSave(slot, validate);
    const terminal = reloaded.events.find((e) => e.instance_id === "evt3.midflight");
    if (!terminal || terminal.state !== "RESOLVED" || canonicalSerialize(terminal.staged_effects) !== stagedBefore) {
      return fail("EVT3: resolved instance or its staged descriptors changed through commit + reload");
    }
    let replayRejected = false;
    try {
      advance(choice, terminal, { kind: "finalize" });
    } catch (err) {
      replayRejected = err instanceof EventLifecycleInvariantError;
    }
    if (!replayRejected) {
      return fail("EVT3: a reloaded terminal instance accepted a further transition — resolution replay/duplication path");
    }

    // No effect execution: the ledger block is untouched end to end.
    if (canonicalSerialize(reloaded.claim_ledger) !== canonicalSerialize(blob.claim_ledger)) {
      return fail("EVT3: the claim_ledger block changed — an effect executed, which is FUTURE BUILD (EVT5)");
    }

    // Descriptor integrity: a same-effect_id descriptor whose binds_to is
    // altered (id unchanged) must be rejected — staged descriptors are
    // preserved verbatim with every field intact, not merely by id.
    const firstStaged = persisted.staged_effects[0];
    if (!firstStaged) {
      return fail("EVT3: the mid-flight fixture staged no effect — descriptor-integrity probe would be vacuous");
    }
    const altBinding = firstStaged.binds_to === "claim_ledger" ? "threat_director" : "claim_ledger";
    const bindingMutated: EventInstance = {
      ...persisted,
      staged_effects: persisted.staged_effects.map((e, i) =>
        i === 0 ? { ...e, binds_to: altBinding } : { ...e },
      ),
    };
    let bindingRejected = false;
    try {
      assertEventInstanceValid(choice, bindingMutated);
    } catch (err) {
      bindingRejected = err instanceof EventLifecycleInvariantError;
    }
    if (!bindingRejected) {
      return fail("EVT3: a staged descriptor with an unchanged effect_id but altered binds_to was NOT rejected");
    }

    // Persisted-identity integrity, enforced in the REAL save path (the same
    // validator saveAtomically and loadSave use): duplicate and empty
    // instance_id are rejected; distinct ids sharing an event_id are accepted.
    const dupId: EventInstance = { ...dormant, instance_id: "evt3.midflight" };
    let dupRejected = false;
    try {
      saveAtomically(join(dir, "evt3.dup.json"), { ...loadedA, events: [persisted, dupId] }, { validate });
    } catch (err) {
      dupRejected = err instanceof SaveIdentityError;
    }
    if (!dupRejected) {
      return fail("EVT3: a save with duplicate persisted instance_id was NOT rejected by the real save path");
    }

    const emptyId: EventInstance = { ...dormant, instance_id: "" };
    let emptyRejected = false;
    try {
      saveAtomically(join(dir, "evt3.empty.json"), { ...loadedA, events: [emptyId] }, { validate });
    } catch (err) {
      emptyRejected = err instanceof SaveIdentityError;
    }
    if (!emptyRejected) {
      return fail("EVT3: a save with an empty persisted instance_id was NOT rejected by the real save path");
    }

    // Two DISTINCT instances of the SAME event_id are a valid collection.
    const twinA = createEventInstance(choice, "evt3.twin.a");
    const twinB = createEventInstance(choice, "evt3.twin.b");
    if (twinA.event_id !== twinB.event_id) {
      return fail("EVT3: twin setup broken — both instances must share an event_id");
    }
    const twinSlot = join(dir, "evt3.twins.json");
    saveAtomically(twinSlot, { ...loadedA, events: [twinA, twinB] }, { validate });
    const twinsLoaded = loadSave(twinSlot, validate);
    if (twinsLoaded.events.length !== [twinA, twinB].length) {
      return fail("EVT3: distinct instances sharing an event_id were not both preserved — identity guard over-rejected");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  return pass(
    `A3 scope: a RESOLVING mid-flight instance (staged inert descriptors) persisted through the REAL SaveBlob v3 ` +
      `events block byte-identically; repeated load cannot duplicate it; a simulated pre-commit crash left the ` +
      `prior mid-flight state intact and loadable (S7 pattern); resumption advanced exactly once to RESOLVED; the ` +
      `reloaded terminal instance rejects every further signal (no resolution replay); staged descriptors were ` +
      `neither executed, duplicated, nor dropped — the claim_ledger block is untouched. Descriptor integrity: a ` +
      `same-effect_id/changed-binds_to mutation is rejected (full-field, ordered comparison). Persisted identity: ` +
      `the real save path rejects duplicate and empty instance_id and accepts distinct instances sharing an ` +
      `event_id. This proves lifecycle persistence only; reward delivery and effect application remain FUTURE ` +
      `BUILD (EVT5+ fail-loud).`,
  );
}

// ── EVT4 — triggers reference only observable state ──────────────────────────

/**
 * EVT4 at A3 scope: every accepted condition kind maps to state that
 * actually exists and is visible (A1 harbor bands incl. the derived total;
 * A2 ledger occupancy through the real routing module; explicit prior-event
 * completion); unsupported future-system conditions are unrepresentable in
 * the schema (broken fixture rejected) AND rejected at runtime; no condition
 * consults RNG, a clock, or hidden state.
 */
export function checkEvt4ObservableConditions(): CheckVerdict {
  const storage = loadStorageSeed();
  const rules = loadClaimLedgerRulesSeed().rules;
  const harbor = createHarborState(storage);
  const emptyLedger = createClaimLedgerState();

  // A1 harbor observations, true and false, per band (amounts from the seed — No Magic Numbers).
  const prov = storage.storage.Provisions;
  const base: ObservableState = { harbor, ledger: emptyLedger, resolved_event_ids: [] };
  const harborCases: Array<[Condition, boolean]> = [
    [{ kind: "harbor_resource_at_least", resource: "Provisions", band: "safe", amount: prov.start_stock }, true],
    [{ kind: "harbor_resource_at_least", resource: "Provisions", band: "safe", amount: prov.safe_capacity_st1 }, false],
    [{ kind: "harbor_resource_at_least", resource: "Provisions", band: "exposed", amount: prov.start_stock }, false],
    [{ kind: "harbor_resource_at_least", resource: "Provisions", band: "total", amount: prov.start_stock }, true],
  ];
  for (const [condition, expected] of harborCases) {
    if (evaluateCondition(condition, base) !== expected) {
      return fail(`EVT4: harbor condition (${JSON.stringify(condition)}) evaluated to ${!expected} — misreads A1 state`);
    }
  }

  // A2 ledger observation through the real routing module: occupancy 0 → 1.
  const routed = routeRewardPackage(emptyLedger, [], {
    package_id: "evt4.probe",
    source_type: "test_supplied",
    source_event_id: "evt4.event",
    generated_reward_seed: 0,
    created_world_clock: { day_index: 0, time_of_day: 0 },
    lines: [{ line_id: "evt4.probe.line", route: "claim_ledger", resource: "Crowns", amount: storage.storage.Crowns.start_stock }],
  }, rules);
  const occupied: ObservableState = { harbor, ledger: routed.ledger, resolved_event_ids: [] };
  if (
    evaluateCondition({ kind: "ledger_global_occupancy_at_most", count: 0 }, occupied) !== false ||
    evaluateCondition({ kind: "ledger_global_occupancy_at_most", count: 0 }, base) !== true
  ) {
    return fail("EVT4: ledger occupancy condition misreads the A2 Claim Ledger state");
  }

  // Prior-event completion: explicit, observable, no hidden state.
  const done: ObservableState = { harbor, ledger: emptyLedger, resolved_event_ids: ["evt4.prior"] };
  if (
    evaluateCondition({ kind: "event_resolved", event_id: "evt4.prior" }, done) !== true ||
    evaluateCondition({ kind: "event_resolved", event_id: "evt4.prior" }, base) !== false
  ) {
    return fail("EVT4: event_resolved condition misreads the explicit completion set");
  }

  // Unsupported future-system conditions: schema-unrepresentable AND runtime-rejected.
  let fixtureRejected = false;
  try {
    loadEventFixture(BROKEN_EVENT_FIXTURE_PATH);
  } catch (err) {
    fixtureRejected = err instanceof EventFixtureValidationError;
  }
  if (!fixtureRejected) {
    return fail("EVT4: a fixture with a faction-standing condition passed the schema — future-system state leaked in");
  }
  const smuggled = { kind: "faction_standing_at_least", faction: "gilded_wake" } as unknown as Condition;
  let runtimeRejected = false;
  try {
    evaluateCondition(smuggled, base);
  } catch (err) {
    runtimeRejected = err instanceof EventLifecycleInvariantError;
  }
  if (!runtimeRejected) {
    return fail("EVT4: a smuggled unsupported condition kind did not fail loudly at evaluation");
  }

  return pass(
    `A3 scope: every accepted condition kind maps to implemented, visible state — A1 harbor bands (safe/exposed/` +
      `derived total, true and false cases from seed values), A2 ledger occupancy observed through the real ` +
      `routing module (0 → occupied flip), and explicit prior-event completion; a faction-standing condition is ` +
      `unrepresentable in the generated schema (broken fixture rejected) and a smuggled one fails loudly at ` +
      `runtime. No condition consults RNG, clocks, or hidden state — the ObservableState shape admits none.`,
  );
}
