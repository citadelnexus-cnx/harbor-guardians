/**
 * Expedition seed contract — the Alpha A4 version-pinned CONTENT shape (owner
 * Alpha A4 authorization, 2026-07-23, Option A). Every A4 gameplay number
 * (supply set, salvage totals, overflow multiplier, route legs, event
 * threshold) originates here in a schema-validated /data seed (No Magic
 * Numbers, DC1) — the sim core (src/sim/expedition.ts) consumes these values
 * verbatim and contains no gameplay literals.
 *
 * Source of truth: these TypeScript types; /schema/expedition_seed.schema.json
 * is GENERATED from them (D39) — never hand-authored. Full DC4 unit-requirement
 * metadata covers every numeric leaf under `content` (brief §3 version-pinned
 * content; Doc 07 §1.2/§7).
 *
 * Guardian equivalence (brief §4): the seed assigns each starting Guardian a
 * single `primary_salvage` CoreResource. A given outcome's salvage TOTAL is one
 * seeded integer shared by all three Guardians; the Guardian only chooses which
 * resource that equal total arrives as. Distinct composition, identical
 * magnitude — an equivalent sidegrade, never superior. tests/expedition.test.ts
 * asserts the equal-total property directly.
 *
 * Governing docs:
 *   - ALPHA_A4_EXECUTION_BRIEF v0.1 §2 (supply set, route, outpost, outcomes,
 *     overflow ×3), §3 (version-pinned content), §4 (Guardian equivalence)
 *   - 01_ECONOMY_FOUNDATION v1.7 §7 (Safe capacity S the ×3 overflow cap reads)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §1.2/§7 (DC1/DC4/DC5)
 *   - 15_EVENT_SYSTEM_SPEC v0.2 §3 (the at-outpost EVT4 trigger threshold)
 * Invariant refs: DC1, DC4, DC5; feeds the OPS1 (supply refund) and A4
 * conservation/overflow proofs.
 */

import type { CoreResource } from "./enums.js";
import type { ReadinessCondition, ResourceAmounts } from "./expedition.js";
import type { SeedValueMetadata } from "./seed-metadata.js";

/** The single short deterministic route (brief §2.5). Not the World Atlas graph (W-suite FUTURE BUILD). */
export interface ExpeditionRoute {
  route_id: string;
  /** Number of legs — a deterministic descriptive property, not a traversal graph. */
  legs: number;
}

/** The one damaged route-anchor outpost destination (brief §2.7). */
export interface OutpostSpec {
  outpost_id: string;
  /** Fixed literal: the outpost is damaged (the non-combat stabilization target). */
  condition: "damaged";
}

/** Per-outcome salvage TOTAL (units). Shared across all Guardians — equal magnitude (brief §4). */
export interface OutcomeSalvageTotals {
  full_success: number;
  partial_success: number;
  retreat: number;
  /** Forced withdrawal recovers nothing by default (may be 0). */
  forced_withdrawal: number;
}

/** Which CoreResource each starting Guardian's equal-total salvage arrives as (brief §4). */
export interface GuardianSalvageComposition {
  "gdn.raxa": CoreResource;
  "gdn.tarin": CoreResource;
  "gdn.nova": CoreResource;
}

/** Vessel/crew/Guardian condition produced by one outcome (brief §2.15 bounded recovery). */
export interface OutcomeReadiness {
  vessel: ReadinessCondition;
  crew: ReadinessCondition;
  guardian: ReadinessCondition;
}

/** Readiness produced by each at-outpost outcome. */
export interface OutcomeReadinessMap {
  full_success: OutcomeReadiness;
  partial_success: OutcomeReadiness;
  retreat: OutcomeReadiness;
  forced_withdrawal: OutcomeReadiness;
}

/**
 * The bounded at-outpost event spec (EVT1–EVT4 reuse, brief §2.6). The sim
 * builds a schema-shaped `Event` from these values; `min_provisions_to_begin`
 * is the seeded threshold of a real EVT4 observable trigger (harbor Provisions
 * ≥ threshold) — the only way the outpost objective becomes eligible.
 */
export interface OutpostEventSpec {
  event_id: string;
  min_provisions_to_begin: number;
}

/** The A4 expedition content payload (DC4 metadata covers every numeric leaf under here). */
export interface ExpeditionContent {
  /** Version-pinned content id (brief §3) — recorded on every ActiveExpedition prepared from it. */
  content_id: string;
  route: ExpeditionRoute;
  outpost: OutpostSpec;
  /** Supplies withdrawn from the Harbor at preparation; refunded exactly on cancellation (OPS1). */
  supply_set: ResourceAmounts;
  /** Unsafe Overflow cap = this × the current Safe capacity S, per resource (brief §2.12). */
  overflow_cap_multiplier: number;
  salvage_total: OutcomeSalvageTotals;
  guardian_primary_salvage: GuardianSalvageComposition;
  outcome_readiness: OutcomeReadinessMap;
  event: OutpostEventSpec;
}

/** A /data/expeditions seed file: versioned envelope (DC5) + DC4 value metadata. */
export interface ExpeditionSeed {
  schema_version: string;
  content: ExpeditionContent;
  value_metadata: SeedValueMetadata[];
}
