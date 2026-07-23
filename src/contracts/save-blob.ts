/**
 * save_blob data contract — the Save/Load §16 block list at Alpha A2 scope.
 * Doc 07 §3 catalogs `save_blob` as a schema type; per D39 these TS types are
 * the source of truth and /schema/save_blob.schema.json is GENERATED from
 * them — never hand-authored.
 *
 * Scope history:
 *   - M0 (v1): meta / world_clock / resources / threat carry their minimal
 *     real shape; every content-bearing block is mechanically EMPTY at schema
 *     level (empty tuple / empty map / null) so content cannot be smuggled in
 *     without a migration (Save/Load §14, Doc 07 §6).
 *   - A1 (still v1): `resources` carries real stocked 3S bands; no shape
 *     change, no bump.
 *   - A2 (v2 — owner Alpha A2 authorization 2026-07-17): `claim_ledger` and
 *     `pending_reward_resolution` grow their real Doc 04/Save-Load shapes
 *     (packages + story claims + remainders; persistent pending records).
 *     The v1→v2 migration lives in src/save/migrations.ts with a committed
 *     v1 fixture + round-trip test (Save/Load §14). The §14 Migration Notice
 *     is FUTURE BUILD with the System Inbox itself (M6 remains fail-loud;
 *     no message system exists at A2).
 *   - A3 (v3 — owner Alpha A3 authorization 2026-07-18, Option A): the
 *     `events` block is added so mid-flight event-lifecycle instances
 *     persist through the REAL save path (Doc 15 §2 "atomic across save";
 *     EVT3). Save/Load §16 predates the event framework and lists no events
 *     block; A3's authorization + the v2→v3 migration (committed v2 fixture
 *     + round-trip test) are the recorded basis for adding it. Instances
 *     carry lifecycle state and INERT staged-effect descriptors only — no
 *     effect execution exists (EVT5+ fail-loud).
 *   - A4 (v4 — owner Alpha A4 authorization 2026-07-23, Option A): two blocks
 *     are added for the Bounded First Playable Expedition Loop —
 *     `expedition` (the idle/active expedition domain, brief §2/§3) and
 *     `harbor_operations` (the unsafe Overflow holdings + the one-time
 *     intro/unlock flags, brief §2.12/§2.16/§2.17). Save/Load §16 predates
 *     the expedition loop; A4's authorization + the v3→v4 migration (committed
 *     v3 fixture + round-trip test) are the recorded basis. No gameplay
 *     numbers here — these are player STATE; A4 content lives in the /data
 *     expedition seed (DC1). The Claim Ledger blocks are UNTOUCHED by A4 (no
 *     new source_type, no reward generation — A4 exclusions).
 *   - `combat_suspend?` (optional in §16) is deliberately absent until the
 *     D16/C8 combat-suspend feature lands; its migration adds it.
 *
 * Governing docs:
 *   - SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §1 (versioning), §2 (UTC
 *     timestamp + World Clock day index/time-of-day), §10/§11 (ledger +
 *     pending persistence), §14 (migration), §16 (block list)
 *   - 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §10/§13 (package + pending
 *     save shapes)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §3 (save_blob),
 *     §2 (CoreResource/RaidPhase vocab), §7 (DC5 versioned, DC6 boundary)
 * Invariant refs: S5, S7, DC5, DC6 (resources key on CoreResource only);
 * L5/L6/L7/L11/L14 (ledger + pending blocks persist exactly).
 *
 * No gameplay numbers live here: the blob is player STATE, not a tuned seed.
 * Empty-state zeros are the identity state; real start stocks arrive from
 * /data resource_definition seeds (Economy §3/§7, DC1/DC4).
 */

import type { ClaimLedgerState, PendingRewardResolution } from "./claim-ledger.js";
import type { CoreResource, RaidPhase } from "./enums.js";
import type { EventInstance } from "./event.js";
import type { ExpeditionState, HarborOperationsState } from "./expedition.js";

/**
 * Current save schema version (infrastructure version, not a gameplay value).
 * Bumping it is a migration event: function + fixture + round-trip test
 * (Save/Load §14; the M6 Migration Notice is FUTURE BUILD with the inbox).
 * v1 = M0/A1 empty-ledger shell · v2 = A2 claim_ledger + pending blocks ·
 * v3 = A3 events block (lifecycle instances, inert effects) ·
 * v4 = A4 expedition + harbor_operations blocks (first playable loop).
 */
export const SAVE_SCHEMA_VERSION = 4;

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
  /** Claim Ledger block (Save/Load §16: packages + story claims + remainders) — real shape since A2 (v2). */
  claim_ledger: ClaimLedgerState;
  /** Persistent pending_reward_resolution records (Doc 04 §10; Save/Load §11; D19/L14) — real shape since A2 (v2). */
  pending_reward_resolution: PendingRewardResolution[];
  /** Mid-flight event-lifecycle instances (Doc 15 §2; EVT3) — real shape since A3 (v3). Inert staged effects only; no effect execution exists. */
  events: EventInstance[];
  /** Bounded First Playable Expedition Loop domain (brief §2/§3) — real shape since A4 (v4). */
  expedition: ExpeditionState;
  /** Unsafe Overflow holdings + one-time intro/unlock flags (brief §2.12/§2.16/§2.17) — real shape since A4 (v4). */
  harbor_operations: HarborOperationsState;
  /** system_message records (Save/Load §12, M8). */
  system_messages: EmptyListM0;
  /** Per-faction Merit standing (soulbound; never in 3S bands — DC6/FCT1). */
  merit: EmptyMapM0;
  /** Persistent guardian bond state (GDN10); null until the guardian feature lands. */
  guardian_bond: null;
  /** Story/flag state (§16 "flags/story"). */
  flags_story: EmptyMapM0;
}
