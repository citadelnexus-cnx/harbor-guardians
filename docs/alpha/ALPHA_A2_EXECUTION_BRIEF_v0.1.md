---
title: "Harbor Guardians — Alpha A2 Execution Brief"
doc_id: "ALPHA_A2_EXECUTION_BRIEF"
version: 0.1
date: 2026-07-17
status: ACTIVE — records the scope of the owner's Alpha A2 authorization (2026-07-17). A2 = Claim Ledger and Reward Routing only. Does not authorize A3 or any gameplay loop.
owner: Anthony Hammon
source: "Owner Alpha A2 authorization 2026-07-17 (limited authorization, Alpha A2 only); 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4; 04A_HARBOR_INBOX_AND_SYSTEM_MESSAGES_FOUNDATION v0.3 (boundary only); 01_ECONOMY_FOUNDATION v1.7 §10; SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §10/§11/§14; SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.2; 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2; 18_DIFFICULTY_PHILOSOPHY v0.2 §4 (partial credit); 00_DECISION_REGISTER D14/D15/D19/D20/D24/D26; ALPHA_A1_EXECUTION_BRIEF v0.1; CLAUDE.md §3/§4/§6/§7"
classification: CURRENT BUILD — deterministic claim-ledger/reward-routing spine only, test-supplied packages; every gameplay system remains FUTURE BUILD
---

# Harbor Guardians — Alpha A2 Execution Brief (v0.1)

## 0. Authorization

Alpha A1 is closed (Minimal Harbor State and Resource Spine — PR #15 merged; 6 implemented invariants, 126 fail-loud). On **2026-07-17** the owner (Anthony Hammon) issued a **limited authorization covering Alpha A2 only: Claim Ledger and Reward Routing** — the minimal Claim Ledger / reward-routing spine needed to prove earned rewards can be represented, routed, partially claimed, blocked safely at capacity, and preserved without hidden loss. It explicitly authorizes **no Alpha A3, no gameplay loop, no events, no expeditions, no combat, no raids, no guardians, no factions, no cargo voyages, no gameplay UI, no deployment, and no production work**.

Like the M0, A0, and A1 records, the authorization record is held privately by the owner outside this public repo (CLAUDE.md §7). This brief records what the authorization covers so every A2 PR traces to it.

## 1. A2 scope — what is authorized

1. **Typed contracts** ([`src/contracts/claim-ledger.ts`](../../src/contracts/claim-ledger.ts), [`claim-ledger-rules.ts`](../../src/contracts/claim-ledger-rules.ts), `RewardRoute` in [`enums.ts`](../../src/contracts/enums.ts)): `RewardLine` (one line, one route — CARGO2/D24), `RewardPackageDraft` (test-supplied input), `LedgerPackage`, `StoryClaim`, `ClaimLedgerState`, `PendingRewardResolution` (Doc 04 §10/§13; Doc 07 §3 canonical shapes). Structural boundaries are **schema-enforced, not conventional**: `source_type` is the literal `"test_supplied"` (no gameplay source can exist in a save), `system_grant` is literal `false` (D13/L13), `related_system_message_id` is literal `null` (no inbox exists), contents `flags`/`cosmetics`/`gear_refs` are schema-empty, and reward resources key on `CoreResource` only (D26).
2. **Pure deterministic sim module** ([`src/sim/claim-ledger.ts`](../../src/sim/claim-ledger.ts)): test-supplied reward routing (`claim_ledger` and `story_claim` delivered; `ship_hold_docked_cargo` / `gear_locker` / `auto_receipt` structurally present but **blocked — routing them fails loud**), Doc 04 §5 slot accounting from the seeded caps, §10 pending resolution on cap block (never deleted, never duplicated), §7 partial claim against the A1 harbor spine (`claim_safe` / `claim_to_capacity`; `claimed + held_remainder == original` exactly; remainder always held). Doc 04 §7's "Claim All" as a distinct all-or-blocked mode is **not implemented** — doctrine does not define semantics beyond claim-to-capacity + hold-remaining, and the owner's A2 instruction permits all-or-blocked only if doctrine does.
3. **Schema-backed seed data** ([`data/rewards/claim_ledger_rules.json`](../../data/rewards/claim_ledger_rules.json)): the Doc 04 §5 caps (5 per resource, 20 global) with full DC4 metadata and a deliberate negative fixture; validator cross-checks positive integers and cap coherence. Generated schema `claim_ledger_rules_seed.schema.json` (D39).
4. **Save/load extension with migration** (Save/Load §14): `save_schema_version` 1 → 2 — the `claim_ledger` block grows `{ packages, story_claims }` and `pending_reward_resolution` grows its real record shape. The pure v1→v2 migration ([`src/save/migrations.ts`](../../src/save/migrations.ts)) ships with a committed v1 fixture ([`tests/fixtures/save.v1.json`](../../tests/fixtures/save.v1.json)) and a round-trip test asserting the migrated save equals a fresh v2 equivalent. Loading migrates in memory and never mutates the on-disk file.
5. **Selected honest invariant conversion**: **L1, L5, L6, L7, L11, L14** converted from fail-loud stubs to implemented checks at explicitly-scoped A2 evidence ([`sim-harness/ledger-checks.ts`](../../sim-harness/ledger-checks.ts)); **S5** extended with the reward-bearing ledger round-trip; **S7** upgraded to crash-simulate over reward-bearing saves, closing the M0 "reward-duplication portion is future" limitation at A2 scope. DC1/DC4/DC5/DC6 coverage extends over the new seed set and sim module.

## 2. A2 boundary — what is NOT authorized

- **No Alpha A3.**
- **No gameplay reward source**: nothing in the game mints reward packages — drafts are test/harness-supplied only, and the schema's literal `test_supplied` source type makes a gameplay source structurally impossible without a future migration. No events (EVT stubs stay fail-loud), no quests, no expeditions, no milestones, no system grants.
- **No gameplay loop** — no production, pulses, upkeep, decay/leak, workers, buildings, offline reconciliation.
- **No combat, raids, guardians, factions, cargo voyages, gear gameplay.** The cargo/gear/auto-receipt reward routes exist as enum values only and fail loud if routed.
- **No System Inbox** (Doc 04A): no messages, no Claim Notices, no Migration Notices. The Doc 04 §10 critical Claim Notice and the Save/Load §14 Migration Notice are FUTURE BUILD with the inbox feature; `related_system_message_id` is structurally `null` until then (M-suite stays fail-loud).
- **No raid-phase claim matrix** (Doc 04 §8): claims do not consult threat phase; L8/L9 stay fail-loud until raids exist.
- **No story-claim harbor transfer**: Story Claims are protected structural placeholders; claiming their resource portion lands with the story system.
- **No gameplay UI; the Tauri shell is unchanged. No deployment, no production packaging, no secrets, no private owner records committed.**

Invariants tied to unimplemented systems (all E/M/C/CARGO/OPS/TD/A11Y/OB/GEAR/W/FCT/GDN/EVT suites, plus L2/L3/L4/L8/L9/L10/L12/L13/L15, DC2/DC3, and S1–S4/S6) remain **fail-loud stubs**. In particular: L2 has no spend path at all to prove against; L10's ineligible gameplay sources do not exist (the literal source type is the A2 boundary, not an L10 claim); L15's mandatory threat events do not exist. Converting any of them would claim untested capability (CLAUDE.md §3).

## 3. Doctrine notes recorded at A2

1. **Pending-record field names**: Doc 04 §10 / Doc 07 §3 (`blocking_reason`, `allowed_resolution_actions`, `related_system_message_id`) vs Save/Load §11 (`blocking_categories[]`, `resolution_state`) differ in naming. Doc 07 is the canonical contract layer ("the canonical schema shape for each data type"), so its field names are implemented; noted here for the Architect — no behavior differs.
2. **A2 pending resolution actions**: only `deliver_to_ledger` is implemented (re-delivery through the caps). Doc 04 §10.3's direct-claim/split/convert actions are FUTURE BUILD and schema-rejected until implemented.
3. **`pending_id`** equals the blocked package's `package_id` at A2 (1:1, globally unique) — exact identity is preserved through block → resolve; no separate id space is needed until a system can re-mint packages.

## 4. Exit condition

A2 is complete when: the claim-ledger/reward-routing spine exists and is exercised by tests; the rules seed validates with DC4 metadata and its negative fixture is rejected; routing, slot caps, partial claim, pending preservation, and story protection are tested; L1/L5/L6/L7/L11/L14 pass honestly at A2 scope; S5 (empty + stocked + ledger) and S7 (reward-bearing crash sim) pass; the v1→v2 migration round-trips the committed fixture; the harness batch is green with 132 invariants (120 fail-loud stubs verified + 12 implemented); and all verification commands exit 0. Anything further is A3+ and waits for a separate owner authorization.

*A2 brief v0.1 — Claim Ledger and Reward Routing only. Does not authorize A3 or any gameplay loop. Escalation on any boundary question per CLAUDE.md §6.*
