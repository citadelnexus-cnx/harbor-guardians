/**
 * Event lifecycle spine — Alpha A3 Option A "Expedition and Event Skeleton"
 * (owner Alpha A3 authorization, 2026-07-18: lifecycle mechanics only).
 * Pure, deterministic, headless: no I/O, no wall-clock, no timers, no global
 * state, no RNG — every transition is an explicit harness-supplied signal
 * mapped over immutable inputs, so identical inputs produce byte-identical
 * canonical output (EVT2; Sim §2).
 *
 * What this is: the Doc 15 §2 state machine over the nine lifecycle labels,
 * with OFFERED and TRIGGERED as mutually exclusive paths (player-choice
 * events offer; imposed events trigger) and the fair EXPIRED/DECLINED branch
 * as explicit signals. The legal transition matrix at A3:
 *
 *   DORMANT   → ELIGIBLE                    (evaluate: ALL triggers hold)
 *   ELIGIBLE  → OFFERED | TRIGGERED         (present: by offer_window kind)
 *   OFFERED   → ACTIVE | EXPIRED | DECLINED (accept / expire / decline)
 *   TRIGGERED → ACTIVE                      (begin)
 *   ACTIVE    → RESOLVING                   (complete: selects one outcome,
 *                                            stages its INERT effects)
 *   RESOLVING → RESOLVED                    (finalize)
 *
 * RESOLVED, EXPIRED, and DECLINED are terminal: every signal against a
 * terminal instance fails loudly, so a lifecycle resolution can never be
 * replayed or duplicated (EVT3). Every unlisted (state, signal) pair fails
 * loudly and leaves the input unchanged.
 *
 * What this is NOT (A3 boundary): reaching RESOLVED means the lifecycle
 * reached its deterministic terminal state — it does NOT mean gameplay
 * effects were applied. Staged effect descriptors are inert copies: this
 * module never executes or dispatches an effect, never touches the Claim
 * Ledger or harbor storage, never mints a reward, and never consults a
 * clock. Trigger evaluation observes ONLY implemented state — the A1 harbor
 * bands, the A2 claim-ledger occupancy, and explicit prior-event completion
 * (EVT4); anything else is unrepresentable in the Condition union and
 * rejected here as a defense behind the schema.
 *
 * Governing docs:
 *   - 15_EVENT_SYSTEM_SPEC v0.2 §2 (lifecycle), §3 (shapes), §4 (effects
 *     bind to existing systems — none are dispatched at A3)
 *   - ALPHA_A3_EXECUTION_BRIEF v0.1 §1 (Option A scope), §2 (boundary)
 *   - SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15/§16 (instances persist in
 *     the SaveBlob events block, v3)
 * Invariant refs: EVT2 (deterministic transitions), EVT3 (instances persist
 * and resume exactly once — proven with the save pipeline), EVT4 (observable
 * state only); EVT1's no-magic-numbers half is enforced by the DC1 scan over
 * this file (the only numeric literal here is the identity 0). EVT5–EVT10
 * remain fail-loud stubs — nothing here delivers, chains, or executes.
 */

import type {
  Condition,
  Effect,
  Event,
  EventInstance,
  EventLifecycleState,
} from "../contracts/event.js";
import type { ClaimLedgerState } from "../contracts/claim-ledger.js";
import { slotOccupancy } from "./claim-ledger.js";
import type { HarborState } from "./harbor-state.js";

/** Thrown when a transition, evaluation, or instance shape would violate the Doc 15 §2 lifecycle doctrine. */
export class EventLifecycleInvariantError extends Error {
  constructor(detail: string) {
    super(`event lifecycle invariant violated: ${detail}`);
    this.name = "EventLifecycleInvariantError";
  }
}

/** The terminal states (Doc 15 §2): no further transition is ever legal. */
export const TERMINAL_STATES: readonly EventLifecycleState[] = ["RESOLVED", "EXPIRED", "DECLINED"];

/**
 * The observable state a trigger may reference at A3 (EVT4): the implemented
 * A1 harbor spine, the implemented A2 Claim Ledger, and explicit prior-event
 * completion. Nothing else exists in code, so nothing else is observable.
 */
export interface ObservableState {
  readonly harbor: HarborState;
  readonly ledger: ClaimLedgerState;
  readonly resolved_event_ids: readonly string[];
}

/** Harness-supplied transition signals — the lifecycle never invents its own (no timers, no clocks, no player input). */
export type TransitionSignal =
  | { kind: "evaluate"; observed: ObservableState }
  | { kind: "present" }
  | { kind: "accept" }
  | { kind: "decline" }
  | { kind: "expire" }
  | { kind: "begin" }
  | { kind: "complete"; outcome_id: string }
  | { kind: "finalize" };

/** Outcome of one advance call: full accounting — the new instance plus whether/where it moved. */
export interface TransitionResult {
  readonly instance: EventInstance;
  readonly transitioned: boolean;
  readonly from: EventLifecycleState;
  readonly to: EventLifecycleState;
}

function assertUniqueIds(label: string, ids: readonly string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (id === "") throw new EventLifecycleInvariantError(`${label} contains an empty id`);
    if (seen.has(id)) throw new EventLifecycleInvariantError(`${label} contains duplicate id "${id}"`);
    seen.add(id);
  }
}

/** Structural validity of an event definition (fail-loud; the schema is the first gate, this is the runtime defense). */
export function assertEventValid(event: Event): void {
  if (event.event_id === "") throw new EventLifecycleInvariantError("event_id must be non-empty");
  if (event.outcomes.length === 0) {
    throw new EventLifecycleInvariantError(`event "${event.event_id}" declares no outcomes — it could never resolve`);
  }
  assertUniqueIds(`event "${event.event_id}" outcomes`, event.outcomes.map((o) => o.outcome_id));
  assertUniqueIds(`event "${event.event_id}" objectives`, event.objectives.map((o) => o.objective_id));
  for (const outcome of event.outcomes) {
    assertUniqueIds(`event "${event.event_id}" outcome "${outcome.outcome_id}" effects`, outcome.effects.map((e) => e.effect_id));
  }
  if (event.chain_next !== null) {
    throw new EventLifecycleInvariantError(`event "${event.event_id}" declares a chain — chains are FUTURE BUILD (EVT10)`);
  }
}

/**
 * Evaluate one trigger condition against observed state (EVT4). Exhaustive
 * over the closed Condition union; a condition kind outside it (impossible
 * through the schema, constructible only by cast) fails loudly — this module
 * never pretends an unimplemented system is observable.
 */
export function evaluateCondition(condition: Condition, observed: ObservableState): boolean {
  switch (condition.kind) {
    case "harbor_resource_at_least": {
      const band = observed.harbor.resources[condition.resource];
      const value =
        condition.band === "safe" ? band.safe : condition.band === "exposed" ? band.exposed : band.safe + band.exposed;
      return value >= condition.amount;
    }
    case "ledger_global_occupancy_at_most":
      return slotOccupancy(observed.ledger).global <= condition.count;
    case "event_resolved":
      return observed.resolved_event_ids.includes(condition.event_id);
    default: {
      const impossible: never = condition;
      throw new EventLifecycleInvariantError(
        `condition kind "${(impossible as { kind?: string }).kind}" references state that does not exist at A3 (EVT4)`,
      );
    }
  }
}

/** ALL triggers must hold for eligibility (Doc 15 §3). */
export function evaluateTriggers(event: Event, observed: ObservableState): boolean {
  return event.triggers.every((condition) => evaluateCondition(condition, observed));
}

/** Create the DORMANT instance for a validated event definition. `instance_id` is harness-supplied (deterministic). */
export function createEventInstance(event: Event, instanceId: string): EventInstance {
  assertEventValid(event);
  if (instanceId === "") throw new EventLifecycleInvariantError("instance_id must be non-empty");
  return {
    instance_id: instanceId,
    event_id: event.event_id,
    state: "DORMANT",
    selected_outcome_id: null,
    staged_effects: [],
  };
}

/**
 * Deterministic structural fingerprint of one effect descriptor: every own
 * key, sorted, with its value — so the staged-vs-declared comparison covers
 * ALL authorized descriptor fields (currently effect_id AND binds_to), not
 * just the id. Any changed, added, or removed field alters the fingerprint.
 */
function descriptorFingerprint(effect: Effect): string {
  const record = effect as unknown as Record<string, unknown>;
  return Object.keys(record)
    .sort()
    .map((key) => `${key}=${String(record[key])}`)
    .join("|");
}

/** Ordered structural fingerprint of a descriptor list (order is significant — verbatim preservation, EVT3). */
function descriptorSequence(effects: readonly Effect[]): string {
  return effects.map(descriptorFingerprint).join(";");
}

/** Assert an instance is shape-valid against its defining event (used by tests/harness and after load). */
export function assertEventInstanceValid(event: Event, instance: EventInstance): void {
  assertEventValid(event);
  if (instance.event_id !== event.event_id) {
    throw new EventLifecycleInvariantError(
      `instance "${instance.instance_id}" belongs to event "${instance.event_id}", not "${event.event_id}"`,
    );
  }
  const resolvingOrLater = instance.state === "RESOLVING" || instance.state === "RESOLVED";
  if (resolvingOrLater) {
    if (instance.selected_outcome_id === null) {
      throw new EventLifecycleInvariantError(`instance "${instance.instance_id}" is ${instance.state} without a selected outcome`);
    }
    const outcome = event.outcomes.find((o) => o.outcome_id === instance.selected_outcome_id);
    if (!outcome) {
      throw new EventLifecycleInvariantError(
        `instance "${instance.instance_id}" selected unknown outcome "${instance.selected_outcome_id}"`,
      );
    }
    // Full ordered structural comparison: every authorized descriptor field
    // (effect_id AND binds_to) must match the declared outcome effects
    // verbatim and in order. Catches an added, removed, reordered, or
    // structurally altered descriptor — including a same-effect_id descriptor
    // whose binds_to was changed (EVT3, staged descriptors are inert and
    // preserved exactly; they are never executed).
    const staged = descriptorSequence(instance.staged_effects);
    const declared = descriptorSequence(outcome.effects);
    if (staged !== declared) {
      throw new EventLifecycleInvariantError(
        `instance "${instance.instance_id}" staged effects [${staged}] differ from outcome "${outcome.outcome_id}" effects [${declared}] — staged descriptors must be preserved verbatim, ordered, with every field intact (EVT3)`,
      );
    }
  } else {
    if (instance.selected_outcome_id !== null || instance.staged_effects.length > 0) {
      throw new EventLifecycleInvariantError(
        `instance "${instance.instance_id}" carries outcome/effect state before RESOLVING — staging happens exactly once at ACTIVE → RESOLVING`,
      );
    }
  }
}

const fail = (instance: EventInstance, signal: TransitionSignal): never => {
  throw new EventLifecycleInvariantError(
    `signal "${signal.kind}" is not a legal transition from ${instance.state} ` +
      `(instance "${instance.instance_id}") — the input state is unchanged (Doc 15 §2 matrix)`,
  );
};

/**
 * Advance one instance by one harness-supplied signal. Pure and
 * deterministic: inputs are never mutated; a transition returns a NEW
 * instance; a no-op evaluation returns the SAME instance with
 * `transitioned: false`; every illegal (state, signal) pair throws and
 * leaves the input untouched. Terminal instances reject every signal, so a
 * resolution can never be replayed (EVT3).
 */
export function advance(event: Event, instance: EventInstance, signal: TransitionSignal): TransitionResult {
  assertEventInstanceValid(event, instance);
  const from = instance.state;

  if (TERMINAL_STATES.includes(from)) {
    throw new EventLifecycleInvariantError(
      `instance "${instance.instance_id}" is terminal (${from}) — no further transition is ever legal; ` +
        `a resolved lifecycle cannot be replayed or duplicated (EVT3)`,
    );
  }

  const move = (to: EventLifecycleState, patch?: Partial<EventInstance>): TransitionResult => ({
    instance: { ...instance, ...patch, state: to },
    transitioned: true,
    from,
    to,
  });

  switch (from) {
    case "DORMANT": {
      if (signal.kind !== "evaluate") return fail(instance, signal);
      if (!evaluateTriggers(event, signal.observed)) {
        return { instance, transitioned: false, from, to: from };
      }
      return move("ELIGIBLE");
    }
    case "ELIGIBLE": {
      if (signal.kind !== "present") return fail(instance, signal);
      return event.offer_window.kind === "player_choice" ? move("OFFERED") : move("TRIGGERED");
    }
    case "OFFERED": {
      if (signal.kind === "accept") return move("ACTIVE");
      if (signal.kind === "decline") return move("DECLINED");
      if (signal.kind === "expire") return move("EXPIRED");
      return fail(instance, signal);
    }
    case "TRIGGERED": {
      if (signal.kind !== "begin") return fail(instance, signal);
      return move("ACTIVE");
    }
    case "ACTIVE": {
      if (signal.kind !== "complete") return fail(instance, signal);
      const outcome = event.outcomes.find((o) => o.outcome_id === signal.outcome_id);
      if (!outcome) {
        throw new EventLifecycleInvariantError(
          `complete named unknown outcome "${signal.outcome_id}" for event "${event.event_id}"`,
        );
      }
      return move("RESOLVING", {
        selected_outcome_id: outcome.outcome_id,
        staged_effects: outcome.effects.map((e) => ({ ...e })),
      });
    }
    case "RESOLVING": {
      if (signal.kind !== "finalize") return fail(instance, signal);
      // Staged descriptors pass through VERBATIM: not executed, not dropped,
      // not duplicated (EVT3). RESOLVED is a lifecycle terminal, not an
      // effect application.
      return move("RESOLVED");
    }
    default:
      // Terminal states were rejected above; anything else here is a
      // corrupted state label (constructible only by cast or tampered save).
      throw new EventLifecycleInvariantError(`unknown or terminal lifecycle state "${from}" reached the transition switch`);
  }
}
