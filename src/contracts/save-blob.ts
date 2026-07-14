/**
 * save_blob data contract — the Save/Load §16 block list at M0 empty-shell
 * scope. Doc 07 §3 catalogs `save_blob` as a schema type; per D39 these TS
 * types are the source of truth and /schema/save_blob.schema.json is
 * GENERATED from them — never hand-authored.
 *
 * M0 scope (M0 packet §8: "round-trips an empty/minimal state"):
 *   - meta / world_clock / resources / threat carry their minimal real shape.
 *   - Every content-bearing block is mechanically EMPTY at schema level
 *     (empty tuple / empty map / null): the schema itself rejects content
 *     state before its feature exists. Growing any block is a
 *     `save_schema_version` bump = a migration event (Save/Load §14,
 *     Doc 07 §6) — content cannot be smuggled in without a migration.
 *   - `combat_suspend?` (optional in §16) is deliberately absent until the
 *     D16/C8 combat-suspend feature lands; its migration adds it.
 *
 * Governing docs:
 *   - SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §1 (versioning), §2 (UTC
 *     timestamp + World Clock day index/time-of-day), §16 (block list)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §3 (save_blob),
 *     §2 (CoreResource/RaidPhase vocab), §7 (DC5 versioned, DC6 boundary)
 * Invariant refs: S5, S7, DC5, DC6 (resources key on CoreResource only).
 *
 * No gameplay numbers live here: the blob is player STATE, not a tuned seed.
 * Empty-state zeros are the identity state; real start stocks arrive from
 * /data resource_definition seeds at Alpha (Economy §3/§7, DC1/DC4).
 */

import type { CoreResource, RaidPhase } from "./enums.js";

/**
 * Current save schema version (infrastructure version, not a gameplay value).
 * Bumping it is a migration event: function + fixture + round-trip test +
 * Migration Notice (Save/Load §14, M6).
 */
export const SAVE_SCHEMA_VERSION = 1;

/** Save/Load §1/§2: versions + absolute UTC timestamp (ISO-8601). */
export interface SaveMeta {
  save_schema_version: number;
  game_version: string;
  /** ISO-8601 UTC (§2); reconciliation uses UTC deltas only (§3). */
  last_saved_utc: string;
}

/**
 * In-game World Clock (§2: "day index, time-of-day"). `time_of_day` is an
 * integer pulse counter within the day; its cadence binds to the Economy
 * pulse when the sim core lands (E8 pacing is UNKNOWN until measured).
 */
export interface WorldClock {
  day_index: number;
  time_of_day: number;
}

/**
 * Per-resource stored state: Safe S + Exposed 2S bands (D1). These are state
 * values; the S/2S/3S caps themselves are /data seed values (DC1), not save
 * fields.
 */
export interface ResourceBand {
  safe: number;
  exposed: number;
}

/** Threat block, minimal at M0: phase only (Doc 05; components land with the threat director). */
export interface ThreatBlock {
  phase: RaidPhase;
}

/** M0 empty-shell placeholder: schema-enforced empty list until the block's feature + migration land. */
export type EmptyListM0 = [];

/** M0 empty-shell placeholder: schema-enforced empty map until the block's feature + migration land. */
export type EmptyMapM0 = Record<string, never>;

/**
 * The complete save blob (Save/Load §16). Field order here is documentation
 * only — serialization is canonical (sorted keys) so round-trips are
 * byte-identical regardless of construction order.
 */
export interface SaveBlob {
  meta: SaveMeta;
  world_clock: WorldClock;
  /** Safe + exposed per resource incl. Crown exposed (§16); keys are CoreResource ONLY (DC6). */
  resources: Record<CoreResource, ResourceBand>;
  /** BuildingState/queue records land with the Build Queue feature. */
  buildings: EmptyListM0;
  /** WorkerState records land with the Economy feature. */
  workers: EmptyListM0;
  threat: ThreatBlock;
  /** claim_package records (Doc 04 §13; story claims + remainders live inside packages). */
  claim_ledger: { packages: EmptyListM0 };
  /** pending_reward_resolution records (Save/Load §11, L14). */
  pending_reward_resolution: EmptyListM0;
  /** system_message records (Save/Load §12, M8). */
  system_messages: EmptyListM0;
  /** Per-faction Merit standing (soulbound; never in 3S bands — DC6/FCT1). */
  merit: EmptyMapM0;
  /** Persistent guardian bond state (GDN10); null until the guardian feature lands. */
  guardian_bond: null;
  /** Story/flag state (§16 "flags/story"). */
  flags_story: EmptyMapM0;
}
