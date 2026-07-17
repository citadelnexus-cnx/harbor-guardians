---
title: "Harbor Guardians — Alpha A1 Execution Brief"
doc_id: "ALPHA_A1_EXECUTION_BRIEF"
version: 0.1
date: 2026-07-16
status: ACTIVE — records the scope of the owner's Alpha A1 authorization (2026-07-16). A1 = Minimal Harbor State and Resource Spine only. Does not authorize A2 or any gameplay loop.
owner: Anthony Hammon
source: "Owner Alpha A1 authorization 2026-07-16 (limited authorization, Alpha A1 only); 01_ECONOMY_FOUNDATION v1.7 §3/§5/§6/§7; 00_DECISION_REGISTER D1/D26; 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2; SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5; SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2; 18_DIFFICULTY_PHILOSOPHY v0.2; ALPHA_A0_EXECUTION_BRIEF v0.1; CLAUDE.md §3/§4/§6/§7"
classification: CURRENT BUILD — deterministic harbor/resource state spine only; every gameplay system remains FUTURE BUILD
---

# Harbor Guardians — Alpha A1 Execution Brief (v0.1)

## 0. Authorization

Alpha A0 is closed (EVT1–EVT10 registered fail-loud; registry 132 — PR #14). On **2026-07-16** the owner (Anthony Hammon) issued a **limited authorization covering Alpha A1 only: Minimal Harbor State and Resource Spine** — deterministic harbor/resource state, schema-backed core resource storage, selected honest invariant conversion, and save/load compatibility only as needed. It explicitly authorizes **no Alpha A2, no gameplay loop, no events, no expeditions, no combat, no raids, no guardians, no gameplay UI, no deployment, and no production work**.

Like the M0 and A0 records, the authorization record is held privately by the owner outside this public repo (CLAUDE.md §7). This brief records what the authorization covers so every A1 PR traces to it.

## 1. A1 scope — what is authorized

1. **Deterministic harbor/resource state spine** (`src/sim/harbor-state.ts`): pure, headless, seedable state for the four CoreResources with the D1 3S model — Safe S / Exposed 2S / Total 3S — fill order safe → exposed → hard stop (Economy §5/§6), explicit blocked-amount accounting (no hidden loss), never-negative withdrawal.
2. **Typed contracts** (`src/contracts/resource-storage.ts`, shared `seed-metadata.ts`): CoreResource-only storage typing (D26/DC6) — `StandingResource` (Merit) and `ReceiptMetric` (XP/BondXP/BondCharge) are rejected from storage/exposure fields by the generated schema, not by convention.
3. **Schema-backed seed data** (`data/economy/storage.st1.json`): owner-approved start stocks (Economy §3) and ST1 3S capacities (Economy §7) with full DC4 metadata; a deliberate negative fixture proves rejection; the validator cross-checks the D1 2×/3× relationship.
4. **Selected honest invariant conversion**: DC1, DC4, DC5, DC6 converted from fail-loud stubs to implemented checks; S5 extended with the stocked seeded-storage round-trip. S7 unchanged and passing.
5. **Save/load compatibility only as needed**: the A1 state maps onto the existing `SaveBlob.resources` block (Save/Load §16) — **no schema change, no `save_schema_version` bump, no migration required**.

## 2. A1 boundary — what is NOT authorized

- **No Alpha A2.**
- **No gameplay loop** — no production, pulses, upkeep, decay/leak, workers, buildings.
- **No events** (EVT1–EVT10 stay fail-loud), **no expeditions, no combat, no raids, no guardians or guardian abilities, no factions, no cargo voyages, no build-queue gameplay**.
- **No Claim Ledger gameplay** beyond the structural references A1 requires (the empty save block is untouched).
- **No gameplay UI; the Tauri shell is unchanged.**
- **No deployment, no production packaging, no secrets, no private owner records committed.**

Invariants tied to unimplemented systems (all E/L/M/C/CARGO/OPS/TD/A11Y/OB/GEAR/W/FCT/GDN/EVT suites, plus DC2/DC3 and S1–S4/S6) remain **fail-loud stubs**: executing any of them throws. In particular, no E-suite invariant was converted — every E invariant binds to production/offline/raid/conversion behavior that does not exist at A1, and converting one would claim untested capability (CLAUDE.md §3).

## 3. Exit condition

A1 is complete when: the harbor/resource spine exists and is exercised by tests; the storage seed validates and invalid data (incl. Merit/receipt-metric storage keys) is rejected; safe/exposed separation is tested; DC1/DC4/DC5/DC6 pass honestly; S5 (empty + stocked) and S7 pass; the harness batch is green with 132 invariants (126 fail-loud stubs verified + 6 implemented); and all verification commands exit 0. Anything further is A2+ and waits for a separate owner authorization.

*A1 brief v0.1 — Minimal Harbor State and Resource Spine only. Does not authorize A2 or any gameplay loop. Escalation on any boundary question per CLAUDE.md §6.*
