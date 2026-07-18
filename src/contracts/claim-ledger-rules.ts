/**
 * Claim-ledger rules data contract — the Alpha A2 `/data/rewards` seed shape
 * carrying the Doc 04 §5 slot-accounting caps (owner Alpha A2 authorization,
 * 2026-07-17). These are gameplay numbers, so they live in a schema-validated
 * seed with full DC4 metadata — never in code (No Magic Numbers, DC1;
 * CLAUDE.md §2).
 *
 * Source of truth: these TypeScript types;
 * /schema/claim_ledger_rules_seed.schema.json is GENERATED from them (D39) —
 * never hand-authored.
 *
 * Governing docs:
 *   - 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §5 (slot accounting: max 5
 *     unclaimed packages per resource type + 20 global active non-story
 *     packages; a package consumes one slot per contained resource; Story
 *     Claims never count), §15 (`/data/rewards/claim_ledger_rules` export)
 *   - 01_ECONOMY_FOUNDATION v1.7 §10 (Claim Ledger summary: 5/resource +
 *     20 global)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §1 (contract
 *     principles), §7 (DC1, DC4, DC5)
 * Invariant refs: DC1, DC4, DC5; L7 (slot accounting consumes these caps),
 * L11 (full-slot delivery behavior binds to them).
 */

import type { SeedValueMetadata } from "./seed-metadata.js";

/** The Doc 04 §5 slot-accounting caps (v1 values; sim-tuned only via this seed). */
export interface ClaimLedgerRules {
  /** Max unclaimed non-story packages holding a given CoreResource (Doc 04 §5: "5 unclaimed packages per resource type"). */
  max_unclaimed_packages_per_resource: number;
  /** Max global active non-story packages (Doc 04 §5: "20 global active non-story packages"). */
  max_global_active_packages: number;
}

/**
 * A /data/rewards claim-ledger rules seed file: versioned envelope (DC5)
 * plus DC4 value metadata for every numeric leaf under `rules`.
 */
export interface ClaimLedgerRulesSeed {
  schema_version: string;
  rules: ClaimLedgerRules;
  value_metadata: SeedValueMetadata[];
}
