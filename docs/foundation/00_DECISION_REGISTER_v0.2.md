---
title: "Decision Register"
doc_id: "00_DECISION_REGISTER"
version: 0.2-DRAFT
date: 2026-07-09
bundle_version: v0.5.2
status: DRAFT v0.2 for owner review — v0.5.1 cleanup: LOCKED-semantics clarified (P2.1). APPROVED-FOR-REVISION; not canon; no repo/vault mutation.
source: "Blueprint v6.0; all owner decision packets through 2026-07-09"
classification: FUTURE BUILD governance
supersedes: "00_DECISION_REGISTER v0.1"
---

# Decision Register — D1–D22

> **What "LOCKED" means (P2.1):** LOCKED = owner-accepted for the current draft direction. It does **not** mean canonized, implemented, or merged. Nothing in this set is canon; merge requires a separately authorized repo/vault mutation session.

Single source of truth for owner decisions across the pre-planning foundation set. Prevents drift; every affected doc cites this register.

| ID | Decision | Approved value | Status | Affected docs |
|---|---|---|---|---|
| D1 | Storage model | **3S total** — Safe S + Exposed 2S = Total 3S (all core resources) | LOCKED 2026-07-09 | AMEND-02, Economy, Sim, Save/Load, Build Queue |
| D2 | Claim relief valve | Superseded by Universal Claim Ledger (see D14/register note) | SUPERSEDED | Doc 04 |
| D3 | Deepstakes EV | ≤ 1.00 for v1; rare high payout profile only | LOCKED | Economy |
| D4 | Timing system name | **Tide Chain** | LOCKED | AMEND-03, Combat |
| D5 | Combat charge name | **Bond Charge** | LOCKED | AMEND-03, Combat, Economy |
| D6 | Aether combat spend | Settlement-only; never buys Bond Charge / triggers Guardian Surge | LOCKED | AMEND-02, Economy, Combat |
| D7 | Offline raid resolution | No offline Assault auto-resolution in v1 | LOCKED | AMEND-02, Economy, Save/Load, Sim |
| D8 | Art label | **Mythic Coastal JRPG Fantasy** | LOCKED | AMEND-03, Art |
| D9 | Transformation term | **Guardian Surge** | LOCKED | AMEND-03, Combat, Art |
| D10 | Accessibility baseline | Mandatory from first prototype (+ training dummy + latency calibration) | LOCKED | AMEND-03, Combat, Sim |
| D11 | Harbor Manifest parent UI | Approved — Claim Ledger / Story Claims / System Inbox tabs | LOCKED | AMEND-02, Doc 04, Doc 04A, Art |
| D12 | System Inbox tab | Approved — messages only, no direct resources | LOCKED | Doc 04A, AMEND-02, Art |
| D13 | System grant handling | Migration/recovery/dev only in v1; production build-flag guard | LOCKED | Doc 04, Doc 04A, Sim |
| D14 | Full-slot reward behavior | Reward Delivery Resolution Screen + persistent pending state | LOCKED | Doc 04, Save/Load, Sim |
| D15 | Story Claim resource boundary | Finite / non-repeatable / non-compounding | LOCKED | Doc 04, Sim |
| D16 | Combat suspend/resume | Option B — turn-boundary snapshot, no reward reroll | LOCKED | Combat, Save/Load, Sim |
| D17 | Docked Cargo handling | Physical, exposed, separate from Claim Ledger; 04B required before ship/cargo implementation | LOCKED (spec deferred) | AMEND-02, Economy, Combat |
| D18 | Inbox retention/compaction | Active visible target 100; critical/migration/unresolved/package-linked persist | LOCKED | Doc 04A, Save/Load, Sim |
| D19 | Pending Reward Resolution save block | Required persistent block; survives save/load; no duplication | LOCKED | Doc 04, Save/Load, Sim |
| D20 | Expedition reward routing | completion/objective → Claim Ledger; salvage/cargo → Ship Hold/Docked Cargo; story → Story Claim; gear → inventory/locker; Merit/Bond XP → auto-receipts | LOCKED | Economy, Combat, Doc 04, AMEND-02 |
| D21 | Bundle format | v0.5 must be fully self-contained (no "carried forward" for current doctrine) | LOCKED | all |
| D22 | Consolidated Decision Register | This document | LOCKED | this doc |

**Note on D2:** the original count-limited Crown-only Claim Hold (D2, 2026-07-09 morning) was superseded the same day by the Universal Claim Ledger direction. D14/D15/D19 now govern the reward-hold system. D2 is retained here only for historical traceability.

*DRAFT v0.2 — governance reference. "LOCKED" = planning-locked, not canon/merge-locked. Approved-for-revision; not merged.*
