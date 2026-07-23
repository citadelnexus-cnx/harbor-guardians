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
export {};
