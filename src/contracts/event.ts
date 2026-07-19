/**
 * Event data contracts — the Alpha A3 Option A "Expedition and Event
 * Skeleton" shapes (owner Alpha A3 authorization, 2026-07-18, Option A only:
 * lifecycle mechanics). The principal contract shapes are `Event`,
 * `Condition`, `Outcome`, and `Effect` per 15_EVENT_SYSTEM_SPEC v0.2 §3;
 * supporting types exist only to make those contracts complete.
 *
 * Source of truth: these TypeScript types;
 * /schema/event_fixture_seed.schema.json is GENERATED from them (D39) —
 * never hand-authored.
 *
 * A3 structural boundaries (schema-enforced, not conventional):
 *   - `Condition` is a closed discriminated union over state that actually
 *     exists in code: A1 harbor/resource bands, A2 claim-ledger occupancy,
 *     and prior-event completion (EVT4). Conditions referencing faction
 *     standing, threat level, world-node state, or any other unimplemented
 *     system are REJECTED by the generated schema — the schema cannot
 *     express them until those systems exist.
 *   - `Effect` is an inert structural reference (an id plus the existing
 *     system it WOULD bind to per Doc 15 §4). No effect is ever executed,
 *     dispatched, or applied at A3 — the lifecycle only stages and preserves
 *     descriptors. Reaching RESOLVED means the lifecycle reached its
 *     deterministic terminal state, NOT that gameplay effects were applied.
 *   - `chain_next` is the literal null: multi-step chains are FUTURE BUILD
 *     (EVT10 ships with real event content authoring).
 *   - Doc 15 §3's `surfacing: InboxCategory` field is deliberately ABSENT:
 *     the Harbor Inbox does not exist (Doc 04A FUTURE BUILD; M-suite
 *     fail-loud). The field arrives with the Inbox feature as a fixture-
 *     schema change.
 *   - `offer_window` carries no timer numbers: Doc 15 §3's `Timer` is a
 *     string reference label at A3 — no clock exists, and expiry is a
 *     harness-supplied signal (fair-window mechanics are FUTURE BUILD,
 *     D35/EVT7).
 *
 * Field-shape note (Doc 15 §3 declares "final field names set during
 * implementation"): the spec lists both top-level `effects: Effect[]` and
 * `outcomes: Outcome[]`; here effects are nested per outcome
 * (`Outcome.effects`) so the resolution branch that stages them is explicit
 * and deterministic. No behavior differs — effects stay inert either way.
 *
 * Governing docs:
 *   - 15_EVENT_SYSTEM_SPEC v0.2 §2 (lifecycle), §3 (schema shape), §4
 *     (effects bind to existing systems — the hard boundary), §5 (EVT suite)
 *   - ALPHA_A3_EXECUTION_BRIEF v0.1 §1 (authorized shapes), §2 (boundary)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §1 (DC4 metadata),
 *     §7 (DC5 versioned envelope)
 * Invariant refs: EVT1 (pure data, schema-validated), EVT2 (deterministic
 * lifecycle over these shapes), EVT3 (EventInstance persists in the save),
 * EVT4 (Condition closed over observable state); DC4/DC5 (fixture envelope).
 * EVT5–EVT10 remain fail-loud — nothing here executes, delivers, or chains.
 */

import type { CoreResource } from "./enums.js";
import type { SeedValueMetadata } from "./seed-metadata.js";

/** Event taxonomy (Doc 15 §1/§3) — pure classification labels; the A3 lifecycle is class-agnostic. */
export type EventClass = "threat" | "expedition" | "quest" | "world" | "faction" | "seasonal";

/**
 * Lifecycle state labels (Doc 15 §2; A3 brief §1.3). OFFERED and TRIGGERED
 * are mutually exclusive paths — player-choice events offer, imposed events
 * trigger; the slash notation in Doc 15's diagram expresses alternatives,
 * never a literal combined state. RESOLVED, EXPIRED, and DECLINED are
 * terminal.
 */
export type EventLifecycleState =
  | "DORMANT"
  | "ELIGIBLE"
  | "OFFERED"
  | "TRIGGERED"
  | "ACTIVE"
  | "RESOLVING"
  | "RESOLVED"
  | "EXPIRED"
  | "DECLINED";

/** Storage-band selector for harbor-observing conditions ("total" = safe + exposed). */
export type ObservableBand = "safe" | "exposed" | "total";

/**
 * Trigger conditions (EVT4): a CLOSED union over observable state that
 * exists at A3 — nothing else is expressible. Every numeric threshold in a
 * fixture carries DC4 metadata (the fixture envelope enforces coverage).
 */
export type Condition =
  | {
      /** A1 harbor spine observation: the named band of a CoreResource is at least `amount`. */
      kind: "harbor_resource_at_least";
      resource: CoreResource;
      band: ObservableBand;
      amount: number;
    }
  | {
      /** A2 Claim Ledger observation: global non-story package occupancy is at most `count` (Doc 04 §5 slots). */
      kind: "ledger_global_occupancy_at_most";
      count: number;
    }
  | {
      /** Prior-event completion: the referenced event id appears in the observed resolved set. */
      kind: "event_resolved";
      event_id: string;
    };

/**
 * Offer-window reference (Doc 15 §3 `offer_window: Timer | "imposed"`).
 * At A3 no clock exists: `window_ref` is a reference label, and expiry is an
 * explicit harness-supplied signal. Real timer mechanics are FUTURE BUILD
 * (EVT7/D35 fairness doctrine binds when they exist).
 */
export type OfferWindow =
  | { kind: "player_choice"; window_ref: string }
  | { kind: "imposed" };

/** Structural objective reference (Doc 15 §3). Inert at A3 — completion is a harness-supplied signal, not evaluated gameplay. */
export interface Objective {
  objective_id: string;
}

/**
 * The existing system an effect WOULD bind to (Doc 15 §4 table). Pure
 * reference vocabulary at A3: no dispatch to any of these systems exists,
 * and the lifecycle never interprets this field (EVT5/EVT6 fail-loud).
 */
export type EffectBinding =
  | "claim_ledger"
  | "ship_hold_docked_cargo"
  | "threat_director"
  | "economy_modifier"
  | "faction_standing"
  | "harbor_inbox"
  | "guardian_reaction";

/**
 * Inert effect descriptor (Doc 15 §4): names the existing system it would
 * route through. Carries NO amounts, NO payload, NO execution path — it is
 * staged and preserved by the lifecycle, never applied (A3 brief §2).
 */
export interface Effect {
  effect_id: string;
  binds_to: EffectBinding;
}

/** One resolution branch (Doc 15 §3): the effects staged if this outcome is selected at ACTIVE → RESOLVING. */
export interface Outcome {
  outcome_id: string;
  effects: Effect[];
}

/**
 * A data-defined event (Doc 15 §3 at A3 scope). At A3 these exist ONLY as
 * schema-validated test fixtures under tests/fixtures/events/ — no real
 * /data event content, no runtime content loading (A3 brief §2).
 */
export interface Event {
  event_id: string;
  class: EventClass;
  /** ALL must hold against the observed state to become ELIGIBLE (Doc 15 §3). */
  triggers: Condition[];
  offer_window: OfferWindow;
  objectives: Objective[];
  /** Resolution branches; exactly one is selected deterministically at ACTIVE → RESOLVING. */
  outcomes: Outcome[];
  /** Literal null: multi-step chains are FUTURE BUILD (EVT10) — the schema rejects any non-null value. */
  chain_next: null;
  /** EVT + any suite this event touches (Doc 15 §3). */
  invariant_refs: string[];
}

/**
 * One in-flight event's persistent state — the shape that lives in the
 * SaveBlob `events` block (v3) so EVT3's save-atomicity claim is about the
 * REAL save path, not a side file. `staged_effects` are inert copies made at
 * ACTIVE → RESOLVING and preserved verbatim through RESOLVING → RESOLVED and
 * across save/load: never executed, never duplicated, never dropped.
 */
export interface EventInstance {
  instance_id: string;
  /** Stable identity of the defining Event; never changes across transitions (EVT2). */
  event_id: string;
  state: EventLifecycleState;
  /** Set exactly once at ACTIVE → RESOLVING; null before that. */
  selected_outcome_id: string | null;
  staged_effects: Effect[];
}

/**
 * A tests/fixtures/events/ fixture file: versioned envelope (DC5) around one
 * Event plus DC4 metadata (shared SeedValueMetadata shape) for every numeric
 * leaf under `event`. Test-only — never loaded by runtime code and never
 * part of the /data seed-discovery path (EVT1 asserts data/events does not
 * exist).
 */
export interface EventFixtureSeed {
  schema_version: string;
  event: Event;
  value_metadata: SeedValueMetadata[];
}
