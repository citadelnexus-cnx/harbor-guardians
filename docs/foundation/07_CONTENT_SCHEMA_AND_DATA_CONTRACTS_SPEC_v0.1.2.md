---
title: "Content Schema & Data Contracts Spec"
doc_id: "07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC"
version: 0.1.2-DRAFT
date: 2026-07-10
bundle_version: v0.1.2-dependency
status: DRAFT v0.1.2 for owner review — metadata cleanup: H1/version drift fixed. split Resource into CoreResource / StandingResource / ReceiptMetric. APPROVED-FOR-REVISION; not canon; no repo/vault mutation.
source: "Decision Register D1–D22 + Addendum D23–D40; core v0.5.2 foundation docs (Economy v1.7, Combat v0.5, Build Queue v0.4, Doc 04 v0.4, Doc 04A v0.3, Save/Load v0.5, Sim v0.6.2); dependency docs 04B v0.1.2, 05 v0.1.3, 06 v0.1.2, 08 v0.1.2, 09 v0.1.2; No Magic Numbers doctrine"
classification: FUTURE BUILD — schema contracts; field names are proposals pending owner/implementer confirmation
blocks: "Milestone 0 code/data scaffolding and any data-driven implementation"
---

# Content Schema & Data Contracts Spec v0.1.2

**Why this exists:** every foundation doc ends with a `/data/...` seed list and the **No Magic Numbers** rule (no gameplay number lives only in engine code). This doc is the shared contract layer: the canonical schema shape for each data type, so the sim harness, the engine, and the agents all read/write the same structures. It does not introduce new mechanics — it formalizes the structures the existing docs already imply.

## 1. Contract principles
1. **Single source of truth:** every gameplay-affecting number originates in a schema-validated data seed; code references it by id. CI fails on hard-coded economy/combat constants outside approved data/config modules.
2. **Every numeric value carries metadata:** `id · resource? · amount|formula · unit · availability_gate · offline_behavior · storage_state_behavior? · source_doc_section · invariant_refs[]` (the "unit requirement" from Economy §18 / prior docs).
3. **Schemas are versioned** with `$id` + `schema_version`; a schema change is a migration event (Save/Load §14).
4. **Deterministic & seedable:** all randomized content declares a seed field so the sim can replay (Sim harness requirement).

## 2. Core enumerations (shared vocab)
- `CoreResource = Crowns | Provisions | Iron | Aether` — the four storable, spendable, cap-bound resources. **Storage, exposed surplus, cargo, and raid loss use `CoreResource` only.**
- `StandingResource = Merit` — soulbound standing; never stored in 3S bands, never cargo, never raidable, never spent.
- `ReceiptMetric = XP | BondXP | BondCharge` — progression/combat records, applied as auto-receipts; never stored as resources, never cargo, never in the Claim Ledger.
- `AnyResourceRef = CoreResource | StandingResource | ReceiptMetric` — used only where a schema must reference the union for logging/receipts; **capacity, cargo, and raid-loss fields must type against `CoreResource`, never `AnyResourceRef`** (DC6).
- `StorageStateBand = safe | exposed | hard_stop` (Safe S / Exposed 2S / Total 3S) — applies to `CoreResource` only.
- `Unit = per_pulse | per_minute | per_world_day | per_run | per_quest | flat`
- `RaidPhase = calm | watch | warning | assault | aftermath`
- `SeverityRate = 0.25 | 0.50 | 0.75 | 1.00`
- `RewardRoute = claim_ledger | story_claim | ship_hold_docked_cargo | gear_locker | auto_receipt`
- `MessageType = offline_report | raid_notice | claim_notice | build_notice | migration_notice | tutorial | accessibility | system_grant_notice`
- `WorkerState = active | unfed | unpaid | idle | disabled`
- `BuildingState = operating | idle | stalled | disabled | under_repair`

## 3. Schema catalog (canonical shapes)
Each is a JSON Schema with `$id`, validated in CI. Summaries below name required fields; full JSON Schemas are generated as `/schemas/*.json`.

- **resource_definition** — `id · resource · start_stock · cap_store_mapping · raidable · decays · leaks` (Economy §3/§7).
- **storage_state** — `core_resource (CoreResource) · S_by_tier[] · exposed_capacity(2S) · total(3S) · exposed_behavior (spoil/leak/none) · crown_no_decay_flag` (Economy §7, AMEND-02 A2.3). Merit and receipt metrics have no storage_state.
- **faucet** / **sink** — `id · resource · amount|formula · unit · st_gate · building? · modifiers_hook` (Economy §3/§4).
- **conversion** — `from · to · rate · venue (market|docks|forge) · one_way=true` with the round-trip-≤0.60× proof reference (Economy §10).
- **upkeep** — `subject (worker|wall|ward) · resource · amount · unit · insolvency_rule` (Economy §11).
- **claim_package** — `package_id · source_type · contents{resource:amount, flags[], cosmetics[], gear_refs[]} · created_world_clock · is_story · system_grant? · held_remainder · pending_state?` (Doc 04 §13).
- **pending_reward_resolution** — `pending_id · source_event_id · generated_reward_seed · package_contents · created_world_clock · blocking_reason · allowed_resolution_actions · related_system_message_id` (Doc 04 §10, Save/Load §11).
- **system_message** — the Doc 04A §3 schema; **no authoritative resource payload fields**; `related_ids{package_id?, ledger_entry_ids?, report_id?, threat_id?, pending_reward_id?, ...}` (M1/M9).
- **threat_event** — `phase · components{regional, exposed_surplus, story_gate, route, defense_neglect, faction_support} · selected_raid_type? · warning_started_world_clock · readiness_snapshot · seed` (Doc 05).
- **combat_reward_line** — `line_id · route (RewardRoute) · contents · source_rule_id` with CARGO2 single-route constraint (Combat §6, 04B).
- **docked_cargo** — `cargo_id · source_voyage_id · contents{CoreResource:amount} · arrived_world_clock · pressure_timer_state (active|needs_resolution) · exposed=true` (04B §7). Cargo contents are `CoreResource` only (never Merit/receipts).
- **save_blob** — the Save/Load §16 block list, each sub-block schema-referenced; carries `save_schema_version · game_version · last_saved_utc · world_clock`.
- **sim_report** — the Sim §5 field set, machine-readable, with `seed` and an `invariant_results[]` table.
- **sim_invariant** — `id (E*/L*/M*/C*/S*/CARGO*/OPS*/TD*/A11Y*/UX1) · statement · suite · blocking=true`.

## 4. Cross-system referential integrity
- A `combat_reward_line.route` must resolve to exactly one delivery system (CARGO2).
- A `system_message.related_ids.package_id` must reference an existing `claim_package` (M2 — deleting the message never deletes the package).
- A `pending_reward_resolution.related_system_message_id` must reference an existing `system_message` (Doc 04 §10).
- Any `amount|formula` tagged as a gameplay value must appear in a data seed, never inline in code (No Magic Numbers; enforced by the S3/S6-adjacent static scan).

## 5. Validation & CI
- All seeds validate against their `$id` schema in CI; an invalid or unversioned seed blocks the PR.
- A static scan asserts no gameplay constant is hard-coded outside approved data/config modules.
- Schema changes require a migration function + fixture + round-trip test (Save/Load §14) and a Migration Notice on live saves (M6).
- The sim harness consumes only schema-validated seeds (Sim §2).

## 6. Save/load & migration
Every schema carries `schema_version`; bumping it is a migration event. The canonical migration example (Crown-only Claim Hold → Universal Claim Ledger) lives in Save/Load §14; new migrations follow the same pattern (function + fixture + test + notice).

## 7. Sim invariants (contract-level)
**DC1** every gameplay number resolves to a schema-validated seed field (No Magic Numbers); **DC2** every `combat_reward_line` declares exactly one `RewardRoute` (mirrors CARGO2); **DC3** referential integrity holds for message↔package↔pending links; **DC4** every seed value carries the full unit-requirement metadata; **DC5** an unversioned or invalid schema blocks CI; **DC6** storage_state, exposed-surplus, cargo, and raid-loss fields type against `CoreResource` only — a schema that admits `StandingResource` (Merit) or `ReceiptMetric` into any of those fields fails validation.

## 8. Data-seed / schema exports (`/schemas/`, `/data/`)
`/schemas/` holds the JSON Schemas for every type in §3; `/data/` holds the seed instances (economy, cargo, threat, rewards, inbox, accessibility, operations, sim). This doc is the index; each foundation doc owns its seed contents.

## 9. Open questions for owner
1. **Schema language:** JSON Schema (draft 2020-12) vs a typed IDL (e.g. TypeScript types as source of truth with generated JSON Schema). Recommended: TS types as authorship source → generated JSON Schema for runtime/sim validation (fits the TS + Tauri stack).
2. **ID convention:** confirm `snake_case` string ids with a `hg.` namespace prefix (e.g. `hg.faucet.farm`).
3. **Seed directory layout:** per-system folders (recommended) vs one flat seed set.

*DRAFT v0.1.2 — FUTURE BUILD. Approved-for-revision; merge requires a separately authorized session. Required before Milestone 0 scaffolding and data-driven implementation.*
