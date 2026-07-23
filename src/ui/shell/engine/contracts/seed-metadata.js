/**
 * Shared DC4 seed-value metadata contract — the unit-requirement envelope
 * every /data seed carries for every numeric value (Doc 07 §1.2, DC4;
 * CLAUDE.md §2 — carried even at skeleton stage).
 *
 * Extracted from guardian-kit.ts at Alpha A1 so the resource-storage seed
 * (and every future seed type) shares one metadata shape instead of
 * re-declaring it. No shape change — the guardian_kit_seed schema is
 * byte-identical after regeneration.
 *
 * Source of truth: these TypeScript types; JSON Schema is GENERATED (D39).
 * Governing docs: 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §1.2/§7.
 * Invariant refs: DC4, DC5.
 */
export {};
