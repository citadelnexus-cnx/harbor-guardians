---
title: "Harbor Guardians — Foundation Set (Complete, Final Draft Versions)"
doc_id: "00_FOUNDATION_SET_INDEX"
version: 1.3
date: 2026-07-11
bundle_version: foundation-set-final-2026-07-11 (metadata-normalized)
status: COMPLETE foundation set at final draft versions. Metadata-normalization pass applied (source lines cite AMEND-02 v0.5.1, Sim v0.6.2, 05 v0.1.3; status lines aligned). F-1 resolution reflected (Economy v1.7 defines E21; Sim v0.6.2 cross-refs it). No doctrine change. APPROVED-FOR-REVISION; NOT canon; no repo/vault mutation. B2 World Atlas held until this set is approved.
owner: Anthony Hammon
role: "Claude = Head of Project Design & Command (Architect)"
---

# Harbor Guardians — Foundation Set (Final Draft Versions)

This is the complete pre-planning foundation set for **Harbor Guardians**, a standalone city-builder × RPG hybrid (TypeScript + Tauri 2, data-driven, deterministic sim core). Every document below is at its **current final draft version**, self-contained, and consistent with the locked decision register.

**Governance (applies to every doc in this set):**
- **APPROVED-FOR-REVISION, not canon.** Nothing here is merged. Canon requires a separately authorized repo/vault mutation session.
- **No repo or vault mutation** has occurred.
- Decisions D1–D22 are locked; **D23–D31 ratified**; **D32–D40 approved** (2026-07-10).
- Standing gate: **no raid/cargo/schema/combat-playable implementation** until the relevant doc + decision is in place and a mutation session is authorized.
- **B2 World Atlas is on hold** until this foundation set is complete and approved (a v0.1 draft exists separately but is not part of this set).

## Document manifest

| # | Doc | Final version | Role |
|---|---|---|---|
| — | Decision Register | `00_DECISION_REGISTER_v0.2` | D1–D22, "LOCKED = planning-locked, not canon" |
| — | Decision Register Addendum | `00_DECISION_REGISTER_ADDENDUM_D23_D40_v0.3` | D23–D31 ratified, D32–D40 approved |
| A | Blueprint Amendment 02 | `HG-BLUEPRINT-AMEND-02_v0.5.1` | Harbor-operations economy, time layers, 3S storage, offline, raid risk, Harbor Manifest, Aether/Bond-Charge |
| B | Blueprint Amendment 03 | `HG-BLUEPRINT-AMEND-03_v0.4` | Art direction + combat inspiration boundary |
| 00 | Art Bible Direction | `00_ART_BIBLE_DIRECTION_v0.5` | Mythic Coastal JRPG Fantasy direction |
| 01 | Economy Foundation | `01_ECONOMY_FOUNDATION_v1.7` | Currencies, 3S storage, faucets/sinks, conversions, raids, Merit, tavern, sim invariants E1–E21 |
| 02 | Combat & Guardian Surge | `02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION_v0.5` | Tide Chain → Bond Charge → Guardian Surge; accessibility; C1–C8 |
| 03 | Build Queue & Harbor Ops | `03_BUILD_QUEUE_AND_HARBOR_OPERATIONS_FOUNDATION_v0.4` | Build/repair queues, worker/building states, refund routing OPS1 |
| 04 | Reward Claim Ledger | `04_REWARD_CLAIM_LEDGER_FOUNDATION_v0.4` | Universal Claim Ledger, Story Claims, partial claim, pending resolution; L1–L15 |
| 04A | Harbor Inbox & System Messages | `04A_HARBOR_INBOX_AND_SYSTEM_MESSAGES_FOUNDATION_v0.3` | System Inbox, message categories, authoritative-report boundary; M1–M10, UX1 |
| 04B | Ship Hold & Docked Cargo | `04B_SHIP_HOLD_AND_DOCKED_CARGO_FOUNDATION_v0.1.2` | Physical cargo, pressure timer / Needs Resolution; CARGO1–CARGO5 |
| 05 | Threat & Raid Director | `05_THREAT_AND_RAID_DIRECTOR_FOUNDATION_v0.1.3` | Threat scoring, raid-type selection, severity/reward timing; TD1–TD4 |
| 06 | Accessibility & Input Calibration | `06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC_v0.1.2` | Assist tiers, latency calibration, touch/remap rules; A11Y1–A11Y5 |
| 07 | Content Schema & Data Contracts | `07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC_v0.1.2` | Shared schemas, CoreResource/StandingResource/ReceiptMetric split; DC1–DC6 |
| 08 | First-Hour Onboarding & Safety | `08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC_v0.1.2` | Creation flow, taught loop, no-trap picks, safety; OB1–OB5 |
| 09 | Gear Locker & Item Reward | `09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION_v0.1.2` | Gear schema, locker, overflow actions, anti-loop; GEAR1–GEAR6 |
| — | Save/Load & Time Reconciliation | `SAVE_LOAD_TIME_RECONCILIATION_SPEC_v0.5` | Atomic saves, deterministic replay, offline convergence, migration; S7 |
| — | Sim Harness Acceptance | `SIM_HARNESS_ACCEPTANCE_SPEC_v0.6.2` | Persona matrix, all invariant suites, acceptance gates |

**Total: 18 documents.**

## Invariant suite roll-up (the claim-to-test backbone)
- **E1–E21** economy (3S model, no inflation, exposed-Crown raidability, offline parity)
- **L1–L15** Claim Ledger (transfer-only, Story Claims, pending resolution, mandatory-event carve-out)
- **M1–M10 + UX1** System Inbox (no resource payload, authoritative-report boundary, retention)
- **C1–C8** combat (base-progress-without-timing, assist parity, suspend/resume integrity)
- **S1–S7** trust & safety (no network, no paid power, atomic saves)
- **OPS1** operations (refund routing)
- **CARGO1–CARGO5** cargo (never Ledger, pressure timer, no hidden loss)
- **TD1–TD4** threat director
- **A11Y1–A11Y5** accessibility
- **DC1–DC6** data contracts
- **OB1–OB5** onboarding
- **GEAR1–GEAR6** gear
- **W1–W6** world (defined in the held B2 World Atlas draft, not part of this set)

## Held / not in this set
- **B2 World Atlas** (`10_WORLD_ATLAS_FOUNDATION_v0.1`) — drafted but **held** until this foundation set is approved; resumes on owner go-ahead.
- Future content docs (Faction Codex, Guardian Kit Sheets, Ship & Travel, Creation Flow narrative) — Phase B content, after the foundation set locks.

## What "approved" unlocks
Owner approval of this set promotes D23–D40 values into the data-seed targets and clears each implementation surface to proceed **in a separately authorized mutation session** (never automatically). Until then everything remains FUTURE BUILD planning.

*Index v1.3 — complete foundation set, final draft versions. Approved-for-revision; not canon; not merged.*
