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
 *   - Post-A4 stabilization (v5 — owner HG-POST-A4-STABILIZATION-01
 *     authorization 2026-07-23, H3): the `expedition` block's v4
 *     `last_command_id: string | null` (which remembered only the immediately
 *     previous command) is replaced by `committed_command_ids: string[]` — a
 *     bounded, insertion-ordered, per-expedition committed-command record so a
 *     duplicate command is rejected even after intervening commands. This is
 *     the only shape change; the deterministic v4→v5 migration (committed v4
 *     fixture + round-trip test) seeds the record from the single known v4
 *     last_command_id (inventing no prior history) and preserves every other
 *     A0–A4 block byte-for-byte. No new gameplay, no new player capability.
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
/**
 * Current save schema version (infrastructure version, not a gameplay value).
 * Bumping it is a migration event: function + fixture + round-trip test
 * (Save/Load §14; the M6 Migration Notice is FUTURE BUILD with the inbox).
 * v1 = M0/A1 empty-ledger shell · v2 = A2 claim_ledger + pending blocks ·
 * v3 = A3 events block (lifecycle instances, inert effects) ·
 * v4 = A4 expedition + harbor_operations blocks (first playable loop) ·
 * v5 = post-A4 stabilization H3 (bounded committed-command record replaces
 * the v4 last_command_id).
 */
export const SAVE_SCHEMA_VERSION = 5;
