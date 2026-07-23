/**
 * Claim Ledger / reward-routing data contracts — the Alpha A2 "Claim Ledger
 * and Reward Routing" spine shapes (owner Alpha A2 authorization, 2026-07-17).
 *
 * Source of truth: these TypeScript types; the claim_ledger and
 * pending_reward_resolution portions of /schema/save_blob.schema.json are
 * GENERATED from them (D39) — never hand-authored.
 *
 * A2 structural boundaries (enforced by the generated schema, not convention):
 *   - `source_type` is the literal "test_supplied": NO gameplay reward source
 *     exists at A2 (no events, quests, expeditions, raids, milestones, or
 *     system grants — all FUTURE BUILD). A save claiming a gameplay source
 *     fails validation until that source's feature + migration land.
 *   - `contents.resources` keys against CoreResource ONLY (D26/DC6-adjacent):
 *     Merit, XP, BondXP, and BondCharge can never appear in a reward package
 *     (Doc 04 §3 ineligible; Doc 07 §2).
 *   - `flags` / `cosmetics` / `gear_refs` are schema-enforced EMPTY (the M0
 *     empty-block pattern): story flags, cosmetics, and gear rewards are
 *     FUTURE BUILD; growing them is a save_schema_version bump + migration.
 *   - `system_grant` is the literal false (D13/L13: v1 grants only via
 *     approved migration/recovery/dev paths — none exist at A2).
 *   - `related_system_message_id` is the literal null: the System Inbox does
 *     not exist (Doc 04A is FUTURE BUILD; M-suite fail-loud). The Doc 04 §10
 *     critical Claim Notice arrives with the inbox feature + migration.
 *   - `allowed_resolution_actions` admits only "deliver_to_ledger": the Doc 04
 *     §10.3 split/convert/direct-claim resolution actions are FUTURE BUILD and
 *     schema-rejected until implemented.
 *
 * Field shapes follow Doc 07 §3 (`claim_package`, `pending_reward_resolution`)
 * as the canonical contract layer; Save/Load §11 states the same pending block
 * with variant field names (`blocking_categories[]`/`resolution_state`) —
 * Doc 07 is the schema authority (it exists to be "the canonical schema shape
 * for each data type"), so its field names are used here.
 *
 * Governing docs:
 *   - 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §1 (valve, never storage/bank),
 *     §4 (package contents), §5 (slot accounting), §6/§11 (Story Claims),
 *     §7 (partial claim, L6), §10 (pending resolution, D14/D19), §13 (save
 *     schema)
 *   - SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §10 (ledger persistence),
 *     §11 (pending block, L14), §16 (save blocks)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §2 (RewardRoute),
 *     §3 (claim_package / pending_reward_resolution shapes), §7 (DC5/DC6)
 *   - 00_DECISION_REGISTER D14 (resolution screen + pending state), D15
 *     (story boundary), D19 (pending save block), D20 (routing), D26 (resource
 *     split)
 * Invariant refs: L1, L5, L6, L7, L11, L14 (implemented at A2 scope);
 * L2/L3/L4/L8/L9/L10/L12/L13/L15 remain fail-loud (their systems are
 * FUTURE BUILD); S5/S7 (these shapes persist in the save blob); DC5/DC6.
 */
export {};
