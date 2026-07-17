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

import type { CoreResource } from "./enums.js";
import type { SeedValueMetadata } from "./seed-metadata.js";

/**
 * One CoreResource's storage definition at ST1 (Economy §7 row + §3 start
 * stock). All three capacities are seeded explicitly — the D1 relationship
 * (exposed = 2×S, total = 3×S) is cross-checked by the seed validator, never
 * derived in sim code (No Magic Numbers: the multipliers are doctrine values,
 * not code constants).
 */
export interface ResourceStorageDefinition {
  /** Owner-approved starting stock (Economy §3); placed in Safe storage at world creation. */
  start_stock: number;
  /** Safe storage capacity S at ST1 (Economy §7). */
  safe_capacity_st1: number;
  /** Exposed surplus capacity 2S at ST1 (D1). */
  exposed_capacity_st1: number;
  /** Total hard-stop capacity 3S at ST1 (D1). */
  total_capacity_st1: number;
}

/**
 * A /data/economy resource-storage seed file: versioned envelope (DC5)
 * keyed by CoreResource ONLY (DC6) plus DC4 value metadata for every
 * numeric leaf under `storage`.
 */
export interface ResourceStorageSeed {
  schema_version: string;
  /** Exactly the four CoreResources; the generated schema rejects any other key (DC6). */
  storage: Record<CoreResource, ResourceStorageDefinition>;
  value_metadata: SeedValueMetadata[];
}
