/**
 * Expedition domain contracts — the Alpha A4 "Bounded First Playable
 * Expedition Loop" persistent-state shapes (owner Alpha A4 authorization,
 * 2026-07-23, Option A only; public-safe scope in
 * docs/alpha/ALPHA_A4_EXECUTION_BRIEF_v0.1.md).
 *
 * Source of truth: these TypeScript types; the `expedition` and
 * `harbor_operations` portions of /schema/save_blob.schema.json are GENERATED
 * from them (D39) — never hand-authored. These are player STATE shapes that
 * live in SaveBlob v4; every gameplay NUMBER (supply set, salvage totals,
 * overflow multiplier, route) lives in the /data expedition seed (DC1), never
 * here.
 *
 * A4 structural boundaries (schema-enforced / doctrine, not convention):
 *   - The expedition group is FIXED (brief §2.3): the player, the selected
 *     starting Guardian, and canonically Morra Dalmere + approved support.
 *     Only the starting-Guardian CHOICE is represented as state
 *     (`StartingGuardianId`) — there is no selectable party, no roster, no
 *     formations (A4 hard exclusions).
 *   - Guardians are equivalent SIDEGRADES only (brief §4): the guardian id
 *     selects a salvage COMPOSITION (which resource the equal-total salvage
 *     arrives as), never a magnitude, success chance, or power. No leveling,
 *     evolution, equipment, combat powers, bond tree, or roster.
 *   - Salvage recovery unloads via a bounded direct-recovery transaction into
 *     Safe Storage + a capped unsafe Overflow (brief §2.11–13). This is
 *     deliberately NOT D20 Ship-Hold/Docked-Cargo routing and NOT Claim-Ledger
 *     reward generation — both remain FUTURE BUILD. No new Claim Ledger
 *     `source_type` and no general expedition reward generation exist (A4
 *     exclusions; the Claim Ledger is untouched by A4).
 *   - The at-outpost objective drives a bounded reuse of the existing A3
 *     EVT1–EVT4 event lifecycle (brief §2.6): the embedded `event` instance is
 *     advanced deterministically; its staged effects are INERT (no effect
 *     execution — EVT5+ remain fail-loud).
 *   - Commands carry a stable `command_id`; re-applying any command id still in
 *     the current expedition's bounded committed-command record is an idempotent
 *     no-op (brief §3, duplicate-command resistance; HG-POST-A4-STABILIZATION-01
 *     H3 — the record survives intervening commands, not just the last one).
 *
 * Governing docs:
 *   - ALPHA_A4_EXECUTION_BRIEF v0.1 §1–§13 (bounded scope, outcomes, overflow,
 *     recovery, unlock, save disposition)
 *   - 15_EVENT_SYSTEM_SPEC v0.2 §2/§3 (embedded event lifecycle + shape)
 *   - 01_ECONOMY_FOUNDATION v1.7 §5/§6 (Safe→Exposed→3S fill order on unload)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §2/§3 (CoreResource,
 *     save-block shapes), §7 (DC1/DC6 — CoreResource-only resource maps)
 *   - SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §1/§16 (versioned save blocks)
 *   - CLAUDE.md §5 (preserve, no hidden loss)
 * Invariant refs: OPS1 (cancel/refund routing), S5/S7 (these blocks persist);
 * bounded reuse of EVT1/EVT2/EVT4. A4-specific conservation/overflow/recovery
 * properties are proven by tests/expedition.test.ts.
 */

import type { CoreResource } from "./enums.js";
import type { EventInstance } from "./event.js";

/**
 * Hard cap on the persisted committed-command record
 * (`ExpeditionState.committed_command_ids`) — HG-POST-A4-STABILIZATION-01 H3.
 * This is an INFRASTRUCTURE bound (a replay-protection buffer size), not a
 * gameplay number, so — like `SAVE_SCHEMA_VERSION` — it lives in the contracts
 * layer, not a /data seed and not the DC1-scanned sim core.
 *
 * Derivation (why 64 is safe): the record only has to catch a delayed DUPLICATE
 * of a command whose replay the strict phase machine would not already reject.
 * Every lifecycle command (prepare/dispatch/arrive/resolve/dock/complete/
 * recover) advances the phase, so a stale replay of one is rejected by the phase
 * guard regardless of this record; the only commands that stay in the same phase
 * — and so genuinely need duplicate protection across intervening commands — are
 * the in-place docked commands (`unload`, `jettison`). A single expedition's
 * whole command sequence (≈8 lifecycle commands + at most one discard per
 * resource×band = 4×3 = 12, plus a handful of unload passes) is well under 64.
 * Combined with the per-expedition RESET (the record clears when the expedition
 * returns to idle), the record is bounded twice over and never grows into an
 * unbounded global history. If a pathological session ever exceeded 64 commands,
 * the OLDEST (already phase-guarded or long-past) ids are evicted first (FIFO),
 * never a still-relevant recent one.
 */
export const COMMITTED_COMMAND_HISTORY_LIMIT = 64;

/**
 * The three starting Guardians (brief §2.3/§4). These ids match the canonical
 * /data/guardians launch seeds (gdn.raxa / gdn.tarin / gdn.nova). The choice
 * is an equivalent sidegrade — it selects salvage composition only.
 */
export type StartingGuardianId = "gdn.raxa" | "gdn.tarin" | "gdn.nova";

/**
 * Expedition lifecycle phase (brief §1/§2). A strict, deterministic sequence:
 *
 *   idle → preparing → en_route → at_outpost → returning → docked
 *        → (unloading is performed in-place at `docked`) → recovering? → idle
 *
 * `cancelled` is not a phase: cancellation returns the domain to `idle` from
 * `preparing` (OPS1 refund). Damage sends `docked`→`recovering`; a clean
 * expedition returns straight to `idle`.
 */
export type ExpeditionPhase =
  | "idle"
  | "preparing"
  | "en_route"
  | "at_outpost"
  | "returning"
  | "docked"
  | "recovering";

/**
 * The authorized outcome set (brief §2.9). `cancelled` is reachable only from
 * `preparing` (pre-dispatch, full supply refund — OPS1); the other four are
 * at-outpost resolutions selected at `at_outpost → returning`.
 */
export type ExpeditionOutcome =
  | "cancelled"
  | "full_success"
  | "partial_success"
  | "retreat"
  | "forced_withdrawal";

/** Condition of the vessel / crew / Guardian after an outcome (brief §2.15 bounded recovery). */
export type ReadinessCondition = "ready" | "damaged";

/**
 * A storage band a jettison (explicit discard-to-free-capacity) may reduce.
 * Used only to resolve a blocked-unloading soft-lock (PR #21 acceptance
 * finding): when Safe Storage AND unsafe Overflow are both full for a resource,
 * the player deliberately discards a bounded quantity from one band to make
 * room, then resumes unloading. An explicit, player-initiated discard with full
 * accounting — never silent loss (D30 "Discard-with-confirm" precedent).
 */
export type JettisonBand = "safe" | "exposed" | "overflow";

/** A partial per-CoreResource amount map (DC6: CoreResource keys only — never Merit/receipt metrics). */
export type ResourceAmounts = Partial<Record<CoreResource, number>>;

/**
 * One in-flight expedition. Created at `prepare`, cleared at completion. All
 * amounts are copied from the schema-validated /data expedition seed at
 * preparation time (version-pinned content, brief §3) — never recomputed from
 * magic numbers.
 */
export interface ActiveExpedition {
  /** Deterministic identity `exp.<index>` from the seeded expedition stream (brief §3). */
  expedition_id: string;
  /** Deterministic per-expedition seed derived from the stream (brief §3). */
  expedition_seed: number;
  /** The version-pinned content id this expedition was prepared from (brief §3). */
  content_id: string;
  /** The selected starting Guardian (equivalent sidegrade — composition only). */
  guardian_id: StartingGuardianId;
  /**
   * Supplies withdrawn from the Harbor at preparation and held on the vessel.
   * Refunded exactly on cancellation (OPS1); consumed (spent) on dispatch.
   */
  supplies_committed: ResourceAmounts;
  /** True once dispatched — supplies are then spent and cancellation is no longer legal. */
  dispatched: boolean;
  /** The resolved outcome, or null until `at_outpost → returning`. */
  outcome: ExpeditionOutcome | null;
  /**
   * Recovered salvage still aboard the vessel, awaiting unload. Loaded at
   * resolution per (outcome, guardian composition); reduced by each unload;
   * any blocked remainder stays here (preserved, never dropped — brief §2.13).
   */
  cargo_aboard: ResourceAmounts;
  vessel_condition: ReadinessCondition;
  crew_condition: ReadinessCondition;
  guardian_condition: ReadinessCondition;
  /**
   * The bounded at-outpost event (EVT1–EVT4 reuse). Null before arrival;
   * created DORMANT at arrival and advanced deterministically to RESOLVED at
   * resolution. Staged effects are inert (no execution).
   */
  event: EventInstance | null;
}

/** The expedition domain state (SaveBlob v5 `expedition` block). */
export interface ExpeditionState {
  phase: ExpeditionPhase;
  active: ActiveExpedition | null;
  /** Monotonic counter driving the deterministic expedition stream (brief §3). */
  next_expedition_index: number;
  /**
   * The bounded, persisted record of committed command ids for the CURRENT
   * expedition, in commit (insertion) order — oldest first. Re-applying ANY id
   * still in this record is an idempotent no-op, so a duplicate is rejected even
   * after intervening commands (HG-POST-A4-STABILIZATION-01 H3 — replaces the
   * v4 `last_command_id`, which remembered only the immediately previous
   * command). The record is scoped to one expedition (reset to `[]` when the
   * expedition returns to idle) and additionally hard-capped at
   * `COMMITTED_COMMAND_HISTORY_LIMIT` (FIFO eviction), so it is bounded twice
   * over and never an unbounded global history. Persisted in SaveBlob v5.
   */
  committed_command_ids: string[];
}

/**
 * Harbor-side A4 operations state (SaveBlob v4 `harbor_operations` block).
 * Persists the unsafe Overflow holdings and the one-time unlock/intro flags.
 */
export interface HarborOperationsState {
  /**
   * Unsafe Overflow holdings per CoreResource (brief §2.12): salvage that did
   * not fit Safe Storage, capped per resource at `overflow_cap_multiplier ×`
   * the current Safe capacity S. Never negative; never exceeds the cap.
   */
  overflow: ResourceAmounts;
  /**
   * The one-time canonical intro (Theo's funeral / need surfacing, brief §2.1)
   * has been consumed. Set true at the first `prepare`; repeat expeditions skip
   * the narrative beat so they never replay a story contradiction (brief §2.17).
   */
  canonical_intro_consumed: boolean;
  /** Limited route-anchor operations unlocked (brief §2.16) — set at first full success. */
  route_anchor_operations_unlocked: boolean;
  /** Count of completed expeditions (deterministic; supports repeatability, brief §2.17). */
  completed_expeditions: number;
}

/**
 * A player command against the expedition domain. Every command carries a
 * stable `command_id`; the domain records committed ids in a bounded per-
 * expedition record and treats a repeat of any retained id as an idempotent
 * no-op (brief §3, duplicate-command resistance; H3).
 */
export type ExpeditionCommand =
  | { command_id: string; kind: "prepare"; guardian_id: StartingGuardianId }
  | { command_id: string; kind: "cancel" }
  | { command_id: string; kind: "dispatch" }
  | { command_id: string; kind: "arrive" }
  | { command_id: string; kind: "resolve"; outcome: ExpeditionOutcome }
  | { command_id: string; kind: "dock" }
  | { command_id: string; kind: "unload" }
  | { command_id: string; kind: "jettison"; resource: CoreResource; band: JettisonBand; amount: number }
  | { command_id: string; kind: "complete" }
  | { command_id: string; kind: "recover" };
