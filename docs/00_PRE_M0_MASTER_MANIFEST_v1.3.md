---
title: "Harbor Guardians — Complete Pre-Milestone-0 Document Manifest"
doc_id: "00_PRE_M0_MASTER_MANIFEST"
version: 1.3
date: 2026-07-11
status: MASTER MANIFEST — the complete list of every document required before Milestone 0 approval. NOT canon; not implementation authorization; no repo/vault mutation.
owner: Anthony Hammon
project: "Harbor Guardians — standalone city-builder × RPG hybrid (TypeScript + Tauri 2, PixiJS, deterministic sim core)"
---

# Harbor Guardians — Complete Pre-Milestone-0 Document Manifest

This is the **complete set of documents** that must be reviewed before Milestone 0 build can be authorized. Everything below is at its current head version and is included in the consolidated package `hg-COMPLETE-pre-M0-set-FINALIZED-2026-07-11.zip`. Nothing is canon; no repo/vault/code exists; approval of the M0 packet's §13 gate is the only step that turns any of this into build authorization.

**Total: 25 documents** (F-1 resolved: Economy v1.7 defines E21) = 18 foundation (pre-planning, CLOSED) + 6 Phase-B content + 1 Milestone 0 packet, plus this manifest.

---

## Group A — Governance & blueprint (4 docs)
| # | Document | Version | Role |
|---|---|---|---|
| A1 | `00_DECISION_REGISTER_v0.2` | v0.2 | Decisions D1–D22 (planning-locked) |
| A2 | `00_DECISION_REGISTER_ADDENDUM_D23_D40_v0.3` | v0.3 | D23–D31 ratified, D32–D40 approved |
| A3 | `HG-BLUEPRINT-AMEND-02_v0.5.1` | v0.5.1 | Harbor-ops economy, time, 3S storage, offline, raid, Harbor Manifest, Aether/Bond-Charge, cargo |
| A4 | `HG-BLUEPRINT-AMEND-03_v0.4` | v0.4 | Art direction + combat inspiration boundary |

## Group B — Foundation set (14 docs, pre-planning CLOSED 2026-07-11)
| # | Document | Version | Role | Invariants |
|---|---|---|---|---|
| B0 | `00_FOUNDATION_SET_INDEX_v1.3` | v1.3 | Foundation set index/manifest | — |
| B1 | `00_ART_BIBLE_DIRECTION_v0.5` | v0.5 | Mythic Coastal JRPG art direction | — |
| B2 | `01_ECONOMY_FOUNDATION_v1.7` | v1.7 | Currencies, 3S storage, faucets/sinks, raids, Merit | E1–E21 (E21 added, F-1 resolved) |
| B3 | `02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION_v0.5` | v0.5 | Tide Chain → Bond Charge → Guardian Surge; chassis | C1–C8 |
| B4 | `03_BUILD_QUEUE_AND_HARBOR_OPERATIONS_FOUNDATION_v0.4` | v0.4 | Build/repair queues, worker/building states | OPS1 |
| B5 | `04_REWARD_CLAIM_LEDGER_FOUNDATION_v0.4` | v0.4 | Universal Claim Ledger, Story Claims, partial claim | L1–L15 |
| B6 | `04A_HARBOR_INBOX_AND_SYSTEM_MESSAGES_FOUNDATION_v0.3` | v0.3 | System Inbox, message categories | M1–M10, UX1 |
| B7 | `04B_SHIP_HOLD_AND_DOCKED_CARGO_FOUNDATION_v0.1.2` | v0.1.2 | Physical cargo, pressure timer / Needs Resolution | CARGO1–CARGO5 |
| B8 | `05_THREAT_AND_RAID_DIRECTOR_FOUNDATION_v0.1.3` | v0.1.3 | Threat scoring, raid selection, severity/reward timing | TD1–TD4 |
| B9 | `06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC_v0.1.2` | v0.1.2 | Assist tiers, latency calibration, touch/remap | A11Y1–A11Y5 |
| B10 | `07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC_v0.1.2` | v0.1.2 | Shared schemas, CoreResource/StandingResource/ReceiptMetric | DC1–DC6 |
| B11 | `08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC_v0.1.2` | v0.1.2 | Creation flow, taught loop, no-trap picks, safety | OB1–OB5 |
| B12 | `09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION_v0.1.2` | v0.1.2 | Gear schema, locker, overflow, anti-loop | GEAR1–GEAR6 |
| B13 | `SAVE_LOAD_TIME_RECONCILIATION_SPEC_v0.5` | v0.5 | Atomic saves, deterministic replay, offline convergence | S7 |
| B14 | `SIM_HARNESS_ACCEPTANCE_SPEC_v0.6.2` | v0.6.2 | Persona matrix, all invariant suites, acceptance gates | all suites |

*(Group A's two registers + two amendments + Group B's 14 = the 18-doc foundation set; B0 index is the 19th supporting file in that set.)*

## Group C — Phase-B content (6 docs)
| # | Document | Version | Role | Invariants | Status |
|---|---|---|---|---|---|
| C1 | `10_WORLD_ATLAS_FOUNDATION_v0.2.1` | v0.2.1 | The Evermeer graph, regions, routes, Drowned Harbors | W1–W9 | document-stage closed |
| C2 | `11_FACTION_CODEX_FOUNDATION_v0.1.2` | v0.1.2 | 5 factions, Merit, treaties, raid/route support | FCT1–FCT8 | document-stage closed |
| C3 | `12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION_v0.1.2` | v0.1.2 | 6-chassis model, GuardianKit schema, Rite | GDN1–GDN11 | document-stage closed |
| C4 | `12A_FLAGSHIP_GUARDIAN_KIT_SHEETS_v0.1.2` | v0.1.2 | Filled sheets: Raxa/Tiger, Tarin/Elephant, Nova/Owl | GDN conformance | document-stage closed |
| C5 | `12B_LAUNCH_CHASSIS_ANCHOR_KIT_SHEETS_v0.2.1` | v0.2.1 | Filled sheets: Bru/Bear, Sef/Falcon, Dagg/Badger (placeholder animals) | GDN conformance | document-stage closed |

## Group D — Milestone 0 (1 doc)
| # | Document | Version | Role | Status |
|---|---|---|---|---|
| D1 | `M0_IMPLEMENTATION_READINESS_PACKET_v0.1.3` | v0.1.3 | 10 readiness areas, §12 checklist, §13 Build-Authorization Gate | in review — **approval + §13 signature authorizes Milestone 0** |

---

## Guardian-animal canon status (important)
Only the **flagship trio** is approved canon:
- **Nova — Owl — Oracle**
- **Tarin — Elephant — Bulwark**
- **Raxa — Tiger — Striker**

All other guardian animals (Bru/Bear, Sef/Falcon, Dagg/Badger in C5, and any future-wave slots) are **unapproved working placeholders** (decision G-D6), to be finalized in the lore/naming pass. This does not block Milestone 0 (schema/sim work is animal-agnostic) but should be locked before Beta content.

## Build sequence — where we are
```
1. Finish foundation documents.                              ✓ done
2. Close foundation pre-planning.                            ✓ done (2026-07-11)
3. Complete B2/B3/B4+ as needed.                             ✓ B2, B3, B4, B4A, B4B done
4. Create Milestone 0 Implementation Readiness Packet.       ✓ done  ← REVIEW THIS SET
--- build-authorization gate (M0 §13) sits here ---
5. Set up Windows dev environment.                           ⟶ M0 build work (after sign-off)
6. Create repo.                                              ⟶ M0
7. Add docs + CLAUDE.md + AGENTS.md + DECISIONS.md.          ⟶ M0
8. Add schemas / data contracts.                            ⟶ M0
9. Add sim harness.                                          ⟶ M0
10. Add save/load skeleton.                                  ⟶ M0
11. Only then gameplay implementation.                       ⟶ Alpha (after M0 exit gate)
```

## What your consolidated review decides
1. **Each document:** `ACCEPT` / `ACCEPT WITH EDITS (list)` / `REVISE (reasons)`.
2. **The six M0 items** (packet §11): approve packet; target Windows machine(s) + cross-platform scope; GitHub destination/repo name; npm vs pnpm; any remaining B-content wanted before Alpha; sign §13.
3. **Guardian animals:** approve the placeholders as working names, or supply preferred final animals for the lore pass.

## Posture (unchanged)
Not canon. Not implementation authorization. No repo/vault mutation. **Document completion does not equal build authorization; build begins only after the Milestone 0 packet is approved and its §13 gate is signed.**

*Master manifest v1.3 — complete pre-Milestone-0 document set. Not canon; not implementation authorization; not merged.*
