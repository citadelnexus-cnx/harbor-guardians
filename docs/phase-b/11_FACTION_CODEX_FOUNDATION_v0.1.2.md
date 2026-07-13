---
title: "Faction Codex Foundation"
doc_id: "11_FACTION_CODEX_FOUNDATION"
version: 0.1.2-DRAFT
date: 2026-07-11
bundle_version: B3-factioncodex-2026-07-11
status: DRAFT v0.1.2 for owner/independent review — Phase B / B3, P2 enum normalization (support_type values "raid_support"|"route_support"). APPROVED-FOR-REVISION; NOT canon; NOT implementation authorization; no repo/vault mutation.
source: "Blueprint v6.0 (5 faction capitals, contribution-earned Merit, treaties); 00_DECISION_REGISTER v0.2 (D1–D22) + 00_DECISION_REGISTER_ADDENDUM_D23_D40 v0.3; HG-BLUEPRINT-AMEND-02_v0.5.1 (economy, Merit non-raidable); 01_ECONOMY_FOUNDATION v1.7 (§9 dock contracts, §14 per-faction Merit, ladder Moored/Anchored/Charted, rival −25%); 05_THREAT_AND_RAID_DIRECTOR_FOUNDATION v0.1.3 (faction_support_modifier softens a raid type; route_threat; Drowned suppression); 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 (faction quest rewards → Claim Ledger); 04B_SHIP_HOLD_AND_DOCKED_CARGO_FOUNDATION v0.1.2 (route/hazard, salvage cargo); 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 (StandingResource=Merit, data contracts, D39); 10_WORLD_ATLAS_FOUNDATION v0.2.1 (faction capitals, region placement, hazard routes, W-D4 node budget)"
classification: FUTURE BUILD — all values are design targets pending sim validation
supersedes: "11_FACTION_CODEX_FOUNDATION v0.1, v0.1.1"
foundation_status: "Pre-planning foundation set approved for closure 2026-07-11. B2 World Atlas accepted for document-stage closure 2026-07-11. This B3 doc builds on both; it modifies no foundation doctrine. NOT implementation authorization; NOT a canon/repo merge. Document completion does not equal build authorization — build begins only after Milestone 0 environment/repo/toolchain readiness is approved."
---

# Faction Codex Foundation — B3 (v0.1.2)

**Position in the project.** The foundation set is closed; B2 World Atlas is at document-stage closure. This is B3, the next document-mode content-structure doc. It founds the **5 factions** the closed foundation already references — per-faction Merit (Economy §14), dock contracts (Economy §9), the faction support that softens a raid type (Doc 05) or a route/hazard pressure (Doc 05 route_threat / World Atlas §8), and the faction capitals placed on the map (World Atlas §10). It defines faction **structure and mechanics hooks**, not final narrative lore.

**Standing constraints (unchanged):** approved-for-revision; not canon; **not implementation authorization**; no repo/vault mutation; every gameplay number originates in a data seed (No Magic Numbers, Doc 07); Merit is a `StandingResource` (soulbound, never raidable, never spent — Doc 07 / AMEND-02). Every faction mechanic either maps to an existing foundation invariant or is flagged UNKNOWN — requires sim.

**Governing reminder:** *Document completion does not equal build authorization. Build begins only after Milestone 0 environment/repo/toolchain readiness is approved.*

**v0.1.1 change log (cleanup only):** (P1) split faction support into **raid-support** (softens a Doc 05 raid type) and **route-support** (softens seeded route/hazard/escort pressure); Deepcurrent Compact is a **route-support** faction for v1; both types share one active-support cap; added **FCT7**. (P2) added no-stacking rival cap **FCT8**. (Wording) replaced "unlocks access/benefit, never power" with the precise operational-support phrasing. Recorded owner answers **F-D1–F-D6**. No doctrine changes outside this clarification; no new systems.

## 1. What a faction is (structural definition)
A faction is a standing relationship the player builds through contribution, expressed as:
- a **per-faction Merit track** (Economy §14 ladder: Moored 500 · Anchored 1,500 · Charted 4,000; soulbound `StandingResource`);
- a **capital node** on the World Atlas (§10, one per region-anchored faction);
- a **contract/quest surface** (dock contracts, Economy §9; quest rewards route to the Claim Ledger, Doc 04);
- a **treaty benefit** that is either **raid-support** (sets `faction_support_modifier` to soften one Doc 05 raid type) or **route-support** (sets `route_support_modifier` to soften seeded route/hazard/escort pressure) — see §5;
- a **rival-tension rule** (Economy §14: aiding one faction may slow another by −25% future gain, never retroactive, non-stacking — §4/FCT8).

**Not every faction treaty softens a raid type.** Some factions provide route-support instead (§5). Factions are **not** a second currency, not raidable, and not a power-purchase path. **Standing unlocks operational support and access, not direct stat purchases, currency multipliers, or raw combat power. Treaty support may reduce specific pressure types, but remains bounded, telegraphed, and sim-tested** (mirrors the guardian sidegrade philosophy, Economy §16).

## 2. The five factions (working structure)
Working names and identities; final lore is later Phase-B content. Each maps to one region-anchored capital (World Atlas §3/§10) and provides either raid-support (a Doc 05 raid type: Pillager / Siege / Saboteur / Cultist / Blockade) or route-support.

| Faction (working) | Identity axis | Home region (working) | Support type | Softens | Contract flavor (Economy §9) |
|---|---|---|---|---|---|
| **Gilded Wake** | Merchant-financiers | Lumenshoal (Radiant) | raid-support | Blockade (keeps routes/docks open) | trade contracts, Crown-weighted |
| **Breakwater Vanguard** | Wall-and-siege defenders | Emberreach (Fire) | raid-support | Siege (walls/towers) | defense/fortification, Iron-weighted |
| **Leyward Order** | Aether wardens / scholars | Rimeholt (Frost) | raid-support | Cultist (Aether/ward disruption) | ward/Rite-support, Aether-weighted |
| **Verdant Kith** | Provisioners / farm-fisher clans | Verdance (Earth) | raid-support | Pillager (protects exposed surplus) | supply contracts, Provisions-weighted |
| **Deepcurrent Compact** | Navigators / salvagers | Umbral Deep (Umbral) | **route-support** | seeded route/hazard/escort pressure (Doc 05 route_threat / World Atlas §8) | expedition/salvage, cargo-weighted |

Notes: the four raid-support factions cover four of the five Doc 05 raid types; **Saboteur** has no dedicated faction softener in this working split (a design lever — the player mitigates saboteur strikes through defense investment rather than a treaty). Galewrack (Storm) has no faction capital — contested/neutral waters (F-D2). Deepcurrent's route-support is deliberately **not** a fifth raid type; it reduces route/hazard/escort pressure on the expedition route system (F-D3).

## 3. Merit & standing (Economy §14 hooks — no new economy)
- Per-faction Merit is earned only from **recorded contribution** (quests, contracts, raids defended, expeditions), never purchased (E10), never raidable (soulbound `StandingResource`).
- Ladder tiers per faction: **Moored (500) · Anchored (1,500) · Charted (4,000)** (Economy §14 values; unchanged here).
- Tier unlocks are **operational support and access** — higher contract tiers, treaty strength, capital services, Sanctum/Rite convenience — **not** stat purchases, currency multipliers, or raw combat power.
- **Rival tension:** aiding one faction may reduce another's future Merit gain by up to −25% (Economy §14), never retroactive, never below zero, **non-stacking** (§4/FCT8). This doc adds no new penalty math; it only names which pairs are rivals (§4) and caps stacking.

## 4. Rival/ally structure (which pairs tension)
A working tension graph so the −25% rule (Economy §14) has a concrete basis (data seed; F-D4):

```
Gilded Wake ⟷ Breakwater Vanguard      (commerce vs fortification spending priorities)
Leyward Order ⟷ Deepcurrent Compact     (ward-caution vs deep-salvage risk-taking)
Verdant Kith  ⟷ Gilded Wake             (provisioner fairness vs market leverage)
```
Non-listed pairs are neutral. Gilded Wake appears in two rivalries; **rival slow does not stack** — if multiple rival triggers would apply to the same faction, only the strongest active rival slow applies, capped at the existing −25% future-gain modifier (FCT8). Alliances are not hard-coded bonuses in v1 — only rivalries carry the defined −25% tension; ally warmth is expressed through content availability, not a stacking buff (F-D6). All pairings are data-seed values.

## 5. Treaty benefits → threat/route hooks (Doc 05)
Faction support can target **either raid pressure or route pressure**:
- **Raid-support treaties** set `faction_support_modifier` for a **Doc 05 raid type** (Pillager / Siege / Saboteur / Cultist / Blockade). The modifier reduces realized severity or probability of that raid type; it never grants immunity (raids stay telegraphed and reducible — E12/E13).
- **Route-support treaties** set `route_support_modifier` for **seeded route/hazard/escort pressure** (Doc 05 route_threat; World Atlas §8 hazard routes). The modifier reduces ambush chance or route_threat accrual on eligible routes; it never bypasses route gates, rations, or cargo risk.
- **Shared active-support cap:** only a bounded number of **total** active supports at once — v1 target **2 active supports** across raid-support *and* route-support treaties (F-D5), sim-tuned — so the player chooses coverage rather than blanketing all pressure types (FCT2).
- **Bounded by tier:** support strength scales with Merit tier (Moored < Anchored < Charted) but is capped so it never fully removes threat or route risk (FCT3).
- **Never immunity, never bypass:** no support removes a pressure entirely, bypasses route gates/rations/cargo risk, or suppresses all threat categories (FCT7).
- Losing standing (rival tension) can weaken/suspend a support — surfaced via the System Inbox (Doc 04A), never a hidden change.

## 6. Contracts & rewards (Economy §9 / Doc 04 hooks)
- Faction contracts appear at the dock (Economy §9) and at the faction capital (World Atlas §10).
- Contract/quest **rewards route to the Claim Ledger** as earned reward packages (Doc 04 §2, D20); physical salvage cargo routes to Ship Hold / Docked Cargo (04B, CARGO1/CARGO2); Merit applies as an auto-receipt (never the Ledger, StandingResource).
- Contracts obey all economy invariants: no contract mints resources outside a claimable package; no contract is a hidden faucet (E15); rewards respect Safe/Exposed/Total on claim.
- Contract availability scales with Merit tier and (for capitals) with Player-Harbor proximity (World Atlas §10) — convenience, not power.

## 7. Faction capitals on the map (World Atlas §10 / W-D4)
- Each faction has one capital node (5 total), placed in its home region (§2), counted in the W-D4 node budget (~25–35 functional nodes).
- Capitals offer: trade, tier-gated contracts, treaty negotiation, Merit-standing display, and faction-flavored services.
- Capitals are **not** raid sources (that is the Drowned Harbors, Doc 05 / World Atlas §7); a capital is a friendly/neutral service node.
- Proximity flavors early access (World Atlas §10) but never gates required progression behind a distant capital (W2 connectivity analog).

## 8. Save/load
Persist a `factions` block: `faction_id · merit_track (per-faction total + tier) · active_supports[] (faction_id, support_type["raid_support" | "route_support"], target[raid_type|route_scope], strength) · rival_state[] (pair, current modifier) · contract_state[] (offered, accepted, package_refs) · capital_discovered`. Merit is soulbound and never raidable (persists through raids/offline). Round-trip preserves standing, active supports, and rival modifiers (feeds S5). All values are data-driven (Doc 07; D39 TS-types→generated JSON Schema).

## 9. Sim invariants (FCT-suite; feeds SIM_HARNESS_ACCEPTANCE_SPEC)
- **FCT1** per-faction Merit is soulbound: never purchasable (mirrors E10), never raidable (mirrors E6), never spent; standing only unlocks operational support/access, never stat power, currency multipliers, or raw combat power.
- **FCT2** at most the v1 cap of active supports at once (target 2 total, across raid-support and route-support); a player cannot blanket-suppress all pressure types simultaneously.
- **FCT3** a support reduces but never eliminates its target pressure (raids stay telegraphed/reducible — E12/E13; routes stay risk-bearing); strength is bounded by Merit tier and capped.
- **FCT4** rival tension applies only the defined −25% future-gain modifier (Economy §14), never retroactive, never below zero; rival pairs come from the data seed.
- **FCT5** all faction contract/quest resource rewards deliver via the Claim Ledger (Doc 04); Merit via auto-receipt; salvage via Docked Cargo (04B) — no faction reward bypasses these routes (mirrors L1/CARGO2).
- **FCT6** faction capitals are never raid sources and never gate required progression behind distance.
- **FCT7** faction support type is explicit: `raid_support` or `route_support`. A support effect can reduce pressure but cannot grant immunity, bypass route gates, bypass rations, bypass cargo risk, or suppress all threat/route categories at once; both types count against the shared active-support cap (FCT2).
- **FCT8** rival slow is capped at −25% future gain per affected faction unless a later owner-approved rule changes the cap; multiple rival relationships do **not** stack by default — only the strongest active rival slow applies per affected faction.

## 10. Data-seed exports (`/data/factions/`, No Magic Numbers; types per Doc 07)
`factions (id, name_working, identity_axis, home_region[region enum], support_type["raid_support" | "route_support"], support_target[raid_type|route_scope]) · merit_tracks (per-faction, ladder Moored/Anchored/Charted) · supports (faction_id, support_type, target, strength_by_tier, active_cap=2) · rivalries (pair, future_gain_modifier=−0.25, stacking=false) · contracts (id, faction_id, tier_gate, reward_package_ref[Claim Ledger], cargo_ref?[04B], merit_receipt) · capitals (faction_id, region, services[]) · faction_save_schema · faction_invariants (FCT1–FCT8)`. Every value carries id · unit · gate · source section · invariant refs; Merit types as `StandingResource`, contract resource rewards as `CoreResource` (Doc 07 DC6).

## 11. What this doc does NOT do
- No final faction names, no narrative lore/history, no character rosters — later Phase-B content (Faction lore pass, Guardian Kit Sheets).
- No new economy, currency, or power system — only structural hooks into existing foundation mechanics.
- No final support/rivalry numbers — all are structural proposals + data-seed targets pending sim.
- No implementation authorization; no repo/vault mutation; not canon.

## 12. B3 decisions (F-D1–F-D6) — owner answers recorded 2026-07-11
Decision-register pattern; **planning-locked ≠ canon**. These govern B3 drafting direction only.

| ID | Question | Owner answer (2026-07-11) | Status |
|---|---|---|---|
| **F-D1** | Faction names | Keep the working set (Gilded Wake / Breakwater Vanguard / Leyward Order / Verdant Kith / Deepcurrent Compact) for now; revisit in a lore pass. | PLANNING-LOCKED (working) |
| **F-D2** | Galewrack has no capital | Leave the Storm region contested/neutral in v1 (5 factions per Blueprint); Storm as a neutral-waters lever. | PLANNING-LOCKED |
| **F-D3** | Deepcurrent treaty benefit | **Approve Deepcurrent as route-support / hazard-escort mitigation**, not a Doc 05 raid-type support (§5, FCT7). | PLANNING-LOCKED |
| **F-D4** | Rivalry pairs | Accept the §4 tension graph as a structural test graph, with **no-stacking** rival slow (FCT8). | PLANNING-LOCKED |
| **F-D5** | Active-support cap | **2 total active supports** in v1, across raid-support and route-support treaties (sim-tuned). | PLANNING-LOCKED |
| **F-D6** | Alliance warmth | Content-availability only in v1; no stacking ally buffs. | PLANNING-LOCKED |

These feed the §10 data seeds (support_type, active_cap=2, rivalries stacking=false) and the threat/route support hooks (Doc 05).

## 13. Review routing & what comes after B3
Ready for the same document-mode review loop: package check → doctrine-consistency (no contradiction with the closed foundation or B2) → FCT-suite completeness (FCT1–FCT8) → confirmation the support-type split reads cleanly.

**Remaining document-mode work before Milestone 0 readiness** (per the governing build sequence): B4+ as needed (e.g. **Guardian Sanctum/Kit content** — the per-guardian sidegrade sheets referenced in Combat §7), then the **Milestone 0 Implementation Readiness Packet** (setup plan, repo scaffold plan, Claude Code operating rules, Git/GitHub workflow, Windows env setup, memory/document-access, schema/data-contract setup, sim-harness + claim-to-test setup, and the alpha/beta/production-readiness gates). Those are document-mode planning artifacts too — none authorize a build.

*Reminder repeated by design: document completion does not equal build authorization; build begins only after Milestone 0 environment/repo/toolchain readiness is approved.*

*DRAFT v0.1.2 — FUTURE BUILD. Approved-for-revision; not canon; not implementation authorization; not merged. B3 of Phase B; builds on the closed foundation set + B2; structure only, lore tuned later.*
