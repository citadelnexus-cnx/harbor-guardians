# DECISIONS.md — Harbor Guardians Decision Ledger

The single in-repo place to resolve "what did we decide about X" (M0 packet area 6). Seeded at M0 Step 4 from the governing documents — nothing here is invented; every entry cites its source. New decisions are appended here when their doc is approved.

> **Status vocabulary** (from `00_DECISION_REGISTER_v0.2` P2.1): **PLANNING-LOCKED / LOCKED** = owner-accepted for the current draft direction — *not* canonized, implemented, or merged. **RATIFIED / APPROVED** = owner action recorded on the stated date. **SUPERSEDED** = retained for traceability only. Committing this ledger does not change any document's doctrinal status.

## Core register — D1–D22

Source: [`docs/foundation/00_DECISION_REGISTER_v0.2.md`](docs/foundation/00_DECISION_REGISTER_v0.2.md)

| ID | Decision | Approved value | Status |
| --- | --- | --- | --- |
| D1 | Storage model | **3S total** — Safe S + Exposed 2S = Total 3S (all core resources) | LOCKED 2026-07-09 |
| D2 | Claim relief valve | Superseded by Universal Claim Ledger (D14/D15/D19 now govern) | SUPERSEDED |
| D3 | Deepstakes EV | ≤ 1.00 for v1; rare high payout profile only | LOCKED |
| D4 | Timing system name | **Tide Chain** | LOCKED |
| D5 | Combat charge name | **Bond Charge** | LOCKED |
| D6 | Aether combat spend | Settlement-only; never buys Bond Charge / triggers Guardian Surge | LOCKED |
| D7 | Offline raid resolution | No offline Assault auto-resolution in v1 | LOCKED |
| D8 | Art label | **Mythic Coastal JRPG Fantasy** | LOCKED |
| D9 | Transformation term | **Guardian Surge** | LOCKED |
| D10 | Accessibility baseline | Mandatory from first prototype (+ training dummy + latency calibration) | LOCKED |
| D11 | Harbor Manifest parent UI | Approved — Claim Ledger / Story Claims / System Inbox tabs | LOCKED |
| D12 | System Inbox tab | Approved — messages only, no direct resources | LOCKED |
| D13 | System grant handling | Migration/recovery/dev only in v1; production build-flag guard | LOCKED |
| D14 | Full-slot reward behavior | Reward Delivery Resolution Screen + persistent pending state | LOCKED |
| D15 | Story Claim resource boundary | Finite / non-repeatable / non-compounding | LOCKED |
| D16 | Combat suspend/resume | Option B — turn-boundary snapshot, no reward reroll | LOCKED |
| D17 | Docked Cargo handling | Physical, exposed, separate from Claim Ledger; 04B required before ship/cargo implementation | LOCKED (spec delivered as 04B) |
| D18 | Inbox retention/compaction | Active visible target 100; critical/migration/unresolved/package-linked persist | LOCKED |
| D19 | Pending Reward Resolution save block | Required persistent block; survives save/load; no duplication | LOCKED |
| D20 | Expedition reward routing | completion/objective → Claim Ledger; salvage/cargo → Ship Hold/Docked Cargo; story → Story Claim; gear → inventory/locker; Merit/Bond XP → auto-receipts | LOCKED |
| D21 | Bundle format | v0.5 must be fully self-contained (no "carried forward" for current doctrine) | LOCKED |
| D22 | Consolidated Decision Register | The register document itself | LOCKED |

## Addendum — D23–D40

Source: [`docs/foundation/00_DECISION_REGISTER_ADDENDUM_D23_D40_v0.3.md`](docs/foundation/00_DECISION_REGISTER_ADDENDUM_D23_D40_v0.3.md)

| ID | Decision | Approved value | Status |
| --- | --- | --- | --- |
| D23 | Raid protection wording (Doc 05) | Safe storage protected; exposed surplus raidable **including exposed Crowns**; Merit, Claim Ledger, Story Claims untouched | RATIFIED 2026-07-10 |
| D24 | Cargo→Ledger boundary (04B) | Route chosen at generation; one line, one route; cargo-routed lines never later enter the Claim Ledger (CARGO2) | RATIFIED 2026-07-10 |
| D25 | Docked-cargo timer model (04B) | Pressure timer → Needs Resolution: no hard deletion; stays exposed/raidable; keeps spoil/leak; blocks new cargo voyages from that ship/dock until resolved | RATIFIED 2026-07-10 |
| D26 | Resource type split (Doc 07) | `CoreResource` (Crowns/Provisions/Iron/Aether) vs `StandingResource` (Merit) vs `ReceiptMetric` (XP/BondXP/BondCharge); storage/exposed/cargo/raid loss use CoreResource only (DC6) | RATIFIED 2026-07-10 |
| D27 | Touch-target minimums (Doc 06) | ≥24×24 CSS px all controls; 44–48 for primary touch controls (A11Y4) | RATIFIED 2026-07-10 |
| D28 | No mandatory key path (Doc 06) | Every action remappable or has an alternate input path; no single hardcoded key gates progression (A11Y5) | RATIFIED 2026-07-10 |
| D29 | Gear anti-loop (Doc 09) | GEAR6: expected salvage value < total craft+enchant input value; no seed makes the loop non-lossy | RATIFIED 2026-07-10 |
| D30 | Gear-overflow resolution actions (Doc 09) | Equip / Move to Locker / Salvage / Discard-with-confirm / Keep Pending; never silent-delete | RATIFIED 2026-07-10 |
| D31 | First-hour no-trap picks (Doc 08) | Full launch roster at creation with honest per-guardian summaries; no guardian strictly dominated within its tag (OB5) | RATIFIED 2026-07-10 |
| D32 | Pressure-timer length (04B) | Medium; sim-tuned so a normal player clears the dock comfortably | APPROVED 2026-07-10 |
| D33 | Iron docked cargo (04B) | Non-decaying but raidable (consistent with Iron exposed behavior) | APPROVED 2026-07-10 |
| D34 | Cargo hold model (04B) | Single mixed cap for v1; per-resource display only | APPROVED 2026-07-10 |
| D35 | Warning duration by raid type (05) | Per-type, all above a fairness floor (E12) | APPROVED 2026-07-10 |
| D36 | Simultaneous raids (05) | One active Assault at a time in v1 | APPROVED 2026-07-10 |
| D37 | Drowned reset strength (05) | Strong partial reset of regional_threat, sim-tuned | APPROVED 2026-07-10 |
| D38 | Default assist tier (06) | Assisted default (inclusive; easy opt to Precise) | APPROVED 2026-07-10 |
| D39 | Schema authorship source (07) | TS types as source → generated JSON Schema (fits TS + Tauri stack) | APPROVED 2026-07-10 |
| D40 | Guided vs open first hour (08) | Light nudges over free play (matches no-dark-pattern stance) | APPROVED 2026-07-10 |

## World Atlas — W-D1–W-D7

Source: [`docs/phase-b/10_WORLD_ATLAS_FOUNDATION_v0.2.1.md`](docs/phase-b/10_WORLD_ATLAS_FOUNDATION_v0.2.1.md) §16

| ID | Decision | Approved value | Status |
| --- | --- | --- | --- |
| W-D1 | Region names | Keep the working set (Emberreach / Rimeholt / Galewrack / Verdance / Lumenshoal / Umbral Deep); final names deferred to an art/lore pass (assigned to the World Lore Bible by R-D5) | PLANNING-LOCKED (working) |
| W-D2 | World name | Keep "the Evermeer" as the working label; not a final brand lock — revisit in a naming/legal/brand pass | PLANNING-LOCKED (working) |
| W-D3 | Adjacency layout | The §6 graph is a structural test graph, not final layout; route costs tune via data seeds | PLANNING-LOCKED |
| W-D4 | v1 map scale | ~25–35 functional v1 nodes (support up to 30–40 with lightweight sealed/lore sanctums): 1 Player Harbor · 5 faction capitals · 10 active launch-guardian Sanctums · 10 sealed/lore future Sanctums · ≥6 Drowned Harbors · 3–8 free ports/waypoints | PLANNING-LOCKED |
| W-D5 | Player Harbor placement | Fixed starting region for v1 (protects onboarding, first-hour safety, sim validation, balance); player-chosen start is a possible future option | PLANNING-LOCKED |
| W-D6 | Sanctum visibility | All 20 Sanctums may exist as map/lore nodes; only the chosen guardian's is "home"; launch guardians get active Sanctum interactions; future-wave appear sealed/lore until unlocked | PLANNING-LOCKED |
| W-D7 | Active-threat surfacing | Passive overlay for Calm/Watch; explicit alert for Warning/Assault; the active Assault region unmistakable at Warning/Assault but not alarm-heavy before Warning | PLANNING-LOCKED |

## Faction Codex — F-D1–F-D6 (owner answers recorded 2026-07-11)

Source: [`docs/phase-b/11_FACTION_CODEX_FOUNDATION_v0.1.2.md`](docs/phase-b/11_FACTION_CODEX_FOUNDATION_v0.1.2.md) §12

| ID | Decision | Approved value | Status |
| --- | --- | --- | --- |
| F-D1 | Faction names | Keep the working set (Gilded Wake / Breakwater Vanguard / Leyward Order / Verdant Kith / Deepcurrent Compact); revisit in a lore pass (assigned to the World Lore Bible by R-D5) | PLANNING-LOCKED (working) |
| F-D2 | Galewrack has no capital | Storm region contested/neutral in v1 (5 factions per Blueprint); Storm as a neutral-waters lever | PLANNING-LOCKED |
| F-D3 | Deepcurrent treaty benefit | Deepcurrent is route-support / hazard-escort mitigation, not a Doc 05 raid-type support (FCT7) | PLANNING-LOCKED |
| F-D4 | Rivalry pairs | The §4 tension graph is a structural test graph; no-stacking rival slow (FCT8) | PLANNING-LOCKED |
| F-D5 | Active-support cap | 2 total active supports in v1, across raid-support and route-support treaties (sim-tuned) | PLANNING-LOCKED |
| F-D6 | Alliance warmth | Content-availability only in v1; no stacking ally buffs | PLANNING-LOCKED |

## Guardian Sanctum & Kit — G-D1–G-D6 (owner answers recorded 2026-07-11)

Source: [`docs/phase-b/12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION_v0.1.2.md`](docs/phase-b/12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION_v0.1.2.md) §13

| ID | Decision | Approved value | Status |
| --- | --- | --- | --- |
| G-D1 | Kit-sheet schema | GuardianKit schema accepted as the B4 authoring shape; field names refined during M0 schema setup (Doc 07 / D39) | PLANNING-LOCKED |
| G-D2 | Launch chassis spread | Every chassis must have at least one launch guardian, so all six playstyles ship at launch | PLANNING-LOCKED |
| G-D3 | Roster fill order | Flagships first, then one chassis batch at a time | PLANNING-LOCKED |
| G-D4 | Rite cost weight | Medium-heavy Aether+Crowns+gate; a real commitment, not a casual respec — sim-tuned within Economy §13 | PLANNING-LOCKED |
| G-D5 | Future-wave visibility | Future-wave Sanctums visible as sealed/lore nodes (consistent with W-D6), not fully interactive until unlocked | PLANNING-LOCKED |
| G-D6 | Guardian naming | Working/placeholder names until a lore/naming pass (parallel to W-D1/F-D1; assigned to the World Lore Bible by R-D5). Only the flagship trio is approved canon: **Nova (owl), Tarin (elephant), Raxa (tiger)** — Bru/Bear, Sef/Falcon, Dagg/Badger are unapproved working placeholders, to be locked before Beta content | PLANNING-LOCKED |

## External design review disposition — R-D1–R-D6 (approved 2026-07-12)

Source: [`docs/reviews/13_DESIGN_REVIEW_DISPOSITION_v0.2.md`](docs/reviews/13_DESIGN_REVIEW_DISPOSITION_v0.2.md) §5

| ID | Decision | Approved value | Status |
| --- | --- | --- | --- |
| R-D1 | v1 scope doctrine | **v1 = ST1–ST5 proving ground** (full ST1–ST10 remains the design; v1 ships and is balanced around ST1–ST5) | APPROVED 2026-07-12, PLANNING-LOCKED |
| R-D2 | Design Pillars | The five Design Pillars approved as permanent decision filters; wording finalized in [`docs/14_DESIGN_PILLARS_v0.1.md`](docs/14_DESIGN_PILLARS_v0.1.md) | APPROVED 2026-07-12, PLANNING-LOCKED |
| R-D3 | New-doc queue & timing | 14_DESIGN_PILLARS + 18_DIFFICULTY_PHILOSOPHY pre-Alpha; 15_EVENT_SYSTEM_SPEC before Alpha content; 16_WORLD_LORE_BIBLE + 17_GUARDIAN_BIBLE + Audio Bible at Beta | APPROVED 2026-07-12, PLANNING-LOCKED |
| R-D4 | Content Scalability Rules | Ratified as a named invariant set: no guardian stronger than launch; no paid advantages; no reputation shortcuts; no economy bypasses; no progression skipping; no parallel/duplicate systems | APPROVED 2026-07-12, PLANNING-LOCKED |
| R-D5 | Naming-pass ownership | The G-D6 / W-D1 / F-D1 naming passes (final guardian names + animals, regions, factions) assigned to the World Lore Bible (N3) as its concrete deliverable | APPROVED 2026-07-12, PLANNING-LOCKED |
| R-D6 | Pillars authoring timing | 14_DESIGN_PILLARS authored during the M0 window (document channel, parallel to repo work); delivered with disposition v0.2 | APPROVED 2026-07-12, PLANNING-LOCKED |

## Deferral log

| Item | Disposition | Source |
| --- | --- | --- |
| **Deep Roots pillar refinement** (Deep Roots Doctrine §0.1, per-pillar deep-root requirements, Root Pass checklist, Root Thread tags → proposed 14_DESIGN_PILLARS v0.2) | **DEFERRED — document channel, not M0.** Received 2026-07-13 as an independent-reviewer refinement recommendation; explicitly "not canon, no repo/vault mutation"; its own guidance: do not implement Root Threads as a hard requirement in M0. Pillars v0.2 refinement awaits owner/Architect action and independent review; recorded here so the recommendation is not lost | [`docs/reviews/HG_DEEP_ROOTS_PILLAR_REFINEMENT_PASSALONG_2026-07-13.md`](docs/reviews/HG_DEEP_ROOTS_PILLAR_REFINEMENT_PASSALONG_2026-07-13.md) |
| **v1 scope deferrals from the external review** (Harbor Life ambience; Dynamic Harbor Identity; Living World Simulation; full guardian out-of-combat behavioral sim; seasonal festival content) | Deferred per disposition §4 (Beta polish / Beta / post-v1 respectively); recorded there, not re-decided here | [`docs/reviews/13_DESIGN_REVIEW_DISPOSITION_v0.2.md`](docs/reviews/13_DESIGN_REVIEW_DISPOSITION_v0.2.md) §4 |
