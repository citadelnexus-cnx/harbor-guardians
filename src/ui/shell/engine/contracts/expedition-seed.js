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
export {};
