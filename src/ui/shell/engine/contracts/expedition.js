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
