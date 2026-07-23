/**
 * Resource-storage data contract — the Alpha A1 "Minimal Harbor State and
 * Resource Spine" seed shape: per-CoreResource start stock + the D1 3S
 * storage bands (Safe S / Exposed 2S / Total 3S) at ST1 scope.
 *
 * Source of truth: these TypeScript types;
 * /schema/resource_storage_seed.schema.json is GENERATED from them (D39) —
 * never hand-authored.
 *
 * DC6 is enforced structurally: `storage` is keyed by `CoreResource` with
 * additionalProperties=false in the generated schema, so a seed that admits
 * `Merit` (StandingResource) or `XP`/`BondXP`/`BondCharge` (ReceiptMetric)
 * into a storage field FAILS validation — storage/exposure typing is
 * CoreResource-only by construction (D26).
 *
 * Governing docs:
 *   - 01_ECONOMY_FOUNDATION v1.7 §3 (owner-approved starting stock),
 *     §7 (3S storage table incl. Crowns; ST1 S values; Aether ST4 gate)
 *   - 00_DECISION_REGISTER D1 (Safe S + Exposed 2S = Total 3S), D26
 *     (CoreResource / StandingResource / ReceiptMetric split)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §2 (CoreResource,
 *     StorageStateBand), §3 (resource_definition / storage_state shapes),
 *     §7 (DC1, DC4, DC5, DC6)
 * Invariant refs: DC1, DC4, DC5, DC6; feeds future E5/E6/E7 (capacity/raid
 * bounds — FUTURE BUILD, their invariants remain fail-loud stubs at A1).
 *
 * A1 scope note: only the ST1 band is seeded (`*_st1`). The full
 * `S_by_tier[]` progression (Doc 07 §3 storage_state) arrives with the
 * Settlement Tier feature and is a schema migration event (Doc 07 §6).
 * Decay/leak behavior fields are deliberately absent — no pulse simulation
 * exists at A1, so seeding behavior no code consumes would be a claim
 * without a test (CLAUDE.md §3).
 */
export {};
