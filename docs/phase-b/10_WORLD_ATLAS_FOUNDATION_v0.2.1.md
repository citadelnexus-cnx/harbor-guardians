---
title: "World Atlas Foundation (The Evermeer)"
doc_id: "10_WORLD_ATLAS_FOUNDATION"
version: 0.2.1-DRAFT
date: 2026-07-11
bundle_version: B2-worldatlas-2026-07-11
status: DRAFT v0.2.1 for owner/independent review — Phase B / B2, targeted cleanup after v0.2 independent review. APPROVED-FOR-REVISION; NOT canon; NOT implementation authorization; no repo/vault mutation.
source: "Blueprint v6.0 (the Evermeer, six elemental regions, Everything-Is-A-Harbor, Drowned Harbors, Sanctums, 5 faction capitals, 3-tier view stack); 00_DECISION_REGISTER v0.2 (D1–D22) + 00_DECISION_REGISTER_ADDENDUM_D23_D40 v0.3 (ratified/approved); HG-BLUEPRINT-AMEND-02_v0.5.1 (A2.5 raid risk, A2.10 routing, A2.12 cargo); 01_ECONOMY_FOUNDATION v1.7 (§11 rations 20+10×regions_crossed, hazard routes; §13 expedition routing); 05_THREAT_AND_RAID_DIRECTOR_FOUNDATION v0.1.3 (regional_threat, route_threat, Drowned suppression, D36/D37); 04B_SHIP_HOLD_AND_DOCKED_CARGO_FOUNDATION v0.1.2 (voyages, D32/D33/D34); 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 (CoreResource enums, data contracts, D39); 06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 (fog UX, scouting cue accessibility); 08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC v0.1.2 (first-hour placement, start-region legibility)"
classification: FUTURE BUILD — all geography values are design targets pending sim validation
supersedes: "10_WORLD_ATLAS_FOUNDATION v0.1, v0.2"
foundation_status: "Pre-planning foundation set approved for closure 2026-07-11 (owner action). This is NOT implementation authorization and NOT a canon/repo merge; repo/canon merge requires separate owner action. This B2 doc builds on the closed set and modifies no foundation doctrine."
---

# World Atlas Foundation — The Evermeer (v0.2.1)

**Position in the project.** The pre-planning foundation set (18 docs) was approved for closure on 2026-07-11. This is the first Phase-B (B2) content-structure doc drafted against that closed base; v0.2.1 applies the targeted cleanup from the v0.2 independent review. It defines the **world structure** — the region graph, harbor taxonomy, and route-distance model — that the already-locked economy and threat formulas resolve against. It changes **no** foundation doctrine.

**Standing constraints (unchanged):** approved-for-revision; not canon; not implementation authorization; no repo/vault mutation; every gameplay number originates in a data seed (No Magic Numbers, Doc 07); every structural claim carries a W-suite invariant or is flagged UNKNOWN — requires sim.

**v0.2.1 change log (cleanup only):** (1) route-distance classes made exact and non-overlapping (0–5); (2) `regions_crossed` clarified as a seeded route value, not automatic shortest-path; (3) worked example reworded as a seeded deep-water route; (4) `min_ship_tier` made the exact gate, table labels are design targets; (5) Drowned Harbor cross-ref §6→§7 fixed; (6) source line expanded for Docs 06/08; (7) "adjacency ring"→"adjacency graph"; (8) added B2 decision IDs **W-D1–W-D7** with recorded owner answers. No doctrine, no new systems.

## 1. The Evermeer
The playable world is **the Evermeer** (working name; see W-D2): a mythic coastal expanse of fortified harbors, elemental seas, and sacred sites. It is **not** an open landmass — it is a **graph of harbors connected by sea routes**. The player's Harbor is one node; everything else is reached by voyage. This realizes the Blueprint "Everything-Is-A-Harbor" rule and the one-guardian, settlement-as-character model.

## 2. View stack (Blueprint 3-tier)
The Atlas is the **World** tier of World ▸ Harbor ▸ Building:
- **World View** — the region graph: harbors, routes, region boundaries, fog/undiscovered nodes, threat overlays.
- **Harbor View** — a single settlement (the player's, or a visited harbor's dock face).
- **Building View** — inside a structure (Build Queue / Economy surfaces).
The Atlas owns World View only; it hands off to Harbor View on arrival.

## 3. Six elemental regions
| Region (working name) | Element | Palette (Art v0.5) | Signature hazard |
|---|---|---|---|
| Emberreach | Fire | ember ambers over black basalt shoals | ash squalls, lava vents |
| Rimeholt | Frost | pale cyan fjords, white-gold ice light | ice floes, whiteout fog |
| Galewrack | Storm | slate greens, lightning-silver headlands | lightning, rogue swells |
| Verdance | Earth | loam golds, deep river greens | shoals, choking kelp |
| Lumenshoal | Radiant | luminous shallows, pearl and dawn-gold | glare-blind, mirror calms |
| Umbral Deep | Umbral | violet-black deltas, bioluminescent teal | dark water, lure-wrecks |

Each region contains multiple harbors (§4) and at least one Drowned Harbor (§7). Region palettes map to the Art Bible; region elements map to the combat elemental wheel (Combat §1).

## 4. Harbor taxonomy (Everything-Is-A-Harbor)
| Type | Count (target) | Role |
|---|---|---|
| **Player Harbor** | 1 | the settlement the player builds (start node) |
| **Faction Capital** | 5 | one per faction — trade, contracts, Merit, treaties |
| **Guardian Sanctum** | 20 | one per designed guardian — Rite site / lore node |
| **Drowned Harbor** | ≥6 (≥1 per region) | enemy-held raid source + expedition target (§7) |
| **Free Port / waypoint** | several | neutral trade/rest nodes, route junctions |

Counts align with the roster model (20 guardians designed / 10 launch) and 5 factions. Node-scale target in W-D4. Placement per region is content, tuned later; this doc fixes the taxonomy and graph rules.

## 5. Route-distance model (feeds Economy §11 rations)
The world is a weighted graph. Each **route** (edge) carries an integer `regions_crossed` that drives the locked rations formula verbatim:
> `expedition_rations = 20 + (10 × regions_crossed)` (Economy §11)

**`regions_crossed` is a seeded route value, not automatically the shortest path across the adjacency graph (§6).** Designers may set a deep-water or detour route higher than the visual graph-shortest distance (e.g. to route around Drowned waters), but any such value must be **explicit in the route data seed**. Each class below maps to exactly one integer; ranges do not overlap.

| Route class | `regions_crossed` | Rations | Ship-tier gate target |
|---|---:|---:|---|
| Local harbor route, same region | 0 | 20 | S1 Skiff |
| Nearby route, one boundary | 1 | 30 | S1/S2 (hazard-dependent) |
| Standard regional route, two boundaries | 2 | 40 | S2 Cutter |
| Long regional route, three boundaries | 3 | 50 | S3 Galleon |
| Deep-water route, four boundaries | 4 | 60 | S4 Flagship |
| Extreme / deep-route cap | 5 | 70 | S4 Flagship / story-gated |

**Ship-tier gate rule (exact).** Each route **must declare `min_ship_tier`** in its data seed. The class table's ship-tier column is a **design target, not automatic logic**; W4 validates the declared `min_ship_tier`, not the table label. Likewise the rations column is the deterministic output of the formula for that `regions_crossed`, not a separate seed.

**Worked example (seeded deep-water route, illustrative).** A seeded deep-water route from **Verdance to Umbral Deep** may declare `regions_crossed = 4` — paying `20 + 10×4 = 60` rations — **even though a shorter visual path exists on the adjacency graph**, because the route is a dangerous detour around Drowned waters. The value comes from the route's data seed, not from graph-shortest distance. A Skiff intra-region loop, by contrast, declares `regions_crossed = 0` and pays `20`. Rations are provisioning costs charged at voyage start (Economy §11), not map facts.

## 6. Region adjacency graph (structural, tunable)
A working adjacency graph so `regions_crossed` has a concrete basis for boundary-crossing routes (final layout is content; see W-D3):

```
Emberreach — Galewrack — Rimeholt
    |            |            |
 Verdance — Lumenshoal — Umbral Deep
```

Shared-boundary adjacencies (each = one region crossed on a graph-shortest hop): Emberreach↔Galewrack, Galewrack↔Rimeholt, Emberreach↔Verdance, Galewrack↔Lumenshoal, Rimeholt↔Umbral Deep, Verdance↔Lumenshoal, Lumenshoal↔Umbral Deep. Non-adjacent pairs cross multiple boundaries on the graph. Because `regions_crossed` is a seeded route value (§5), an individual route may declare a higher crossing count than the graph-shortest path when the fiction/threat calls for a detour. This graph is a **structural test graph** (W-D3), not final layout; the shipped adjacency is a data seed.

## 7. Drowned Harbors (threat + expedition targets)
Drowned Harbors are corrupted enemy-held nodes and the spatial anchor of the threat system (Doc 05 v0.1.3):
- **regional_threat** rises passively while a region's Drowned Harbor is **uncleansed**; graph-distance from the Player Harbor weights `nearby_drowned_pressure` in the readiness formula (Doc 05 / AMEND-02 A2.5).
- A **successful Drowned Harbor expedition** applies a **strong partial reset** of that region's regional_threat (Doc 05 §7, **D37 ratified**).
- Primary **expedition target**: physical loot → Ship Hold / Docked Cargo (04B, CARGO1/CARGO2); completion/objective rewards → Claim Ledger (D20); story → Story Claim.
- Gated by ship tier and region distance (§5) so raid pressure and exploration pace scale with progression.
- **One active Assault at a time in v1** (Doc 05, **D36 approved**): the director resolves a single Drowned-driven Assault at once; the Atlas surfaces which region is currently the active threat source (W-D7).

## 8. Hazard routes (feeds Economy §11 hazard rule + Doc 05 route_threat)
Some edges are **hazard routes** (Drowned-influenced or elementally violent seas):
- Base ambush chance 15% (Economy §11), reducible by ship tier/escort.
- Repeated hazard-route use raises **route_threat** (Doc 05) — over-farming a lane invites sea raids.
- An ambush is a bonus fight with bonus salvage (→ Ship Hold/Docked Cargo) or a durability/ration cost on loss (04B §6); never a permanent lockout (W6).
- Each region's signature hazard (§3) flavors its hazard routes and may carry a region-specific modifier (e.g. Rimeholt whiteout raises rations; Galewrack lightning raises ambush chance). Modifiers are data-seed values.

## 9. Docked Cargo interaction at harbors (04B, D32/D33/D34)
When a voyage returns to the Player Harbor, hold contents become **Docked Cargo** at that harbor's dock (04B §3), which the Atlas represents as a dock-state on the node:
- Physical, exposed, raidable-on-arrival; obeys the **pressure timer → Needs Resolution** model (04B, **D32** medium timer, sim-tuned) — never hard-deleted; blocks new cargo voyages from that ship/dock until resolved.
- **Iron docked cargo** is non-decaying but raidable (**D33 ratified**); Provisions/Aether spoil/leak per exposed rates.
- **Single mixed hold cap** in v1 (**D34 approved**); per-resource display.
Cargo never enters the Claim Ledger (CARGO1). The Atlas shows dock occupancy so the player sees when a harbor's dock is blocked.

## 10. Faction capitals & guardian Sanctums (placement rules)
- **Faction capitals** anchor each faction's territory; Player-Harbor proximity flavors early treaty access (faction_support_modifier, Doc 05) and dock contract availability (Economy §9). Merit is earned per faction regardless of distance (Economy §14, StandingResource in Doc 07) — distance affects convenience, not the soulbound record.
- **Guardian Sanctums** are lore/Rite nodes; the chosen guardian's Sanctum is thematically "home." The Rite of the Changing Tide (Economy §13 Aether sink) resolves at a Sanctum. Sanctum visibility follows W-D6: all 20 may exist as map/lore nodes, but only active/chosen Sanctums have full interactions.

## 11. Exploration & fog (Doc 06 / Doc 08)
- World View starts partially fogged: the Player Harbor, its region, and immediate routes are visible; distant regions are undiscovered until scouted or reached.
- Scouting (an Oracle-chassis guardian bias, e.g. Nova, Combat §7) reveals nodes/routes — real map value for a non-bankable pre-Spire utility (Economy §11 Aether rule). Scouting cues follow the accessibility spec (Doc 06: shape+icon+text, never color-only).
- Discovery is persistent (save/load, S5) and never resets; revealing a node is a permanent, no-loss gain (W5).
- First-hour placement interacts with onboarding (Doc 08): the taught loop assumes the start region is fully legible before any cross-region voyage (W-D5 fixed start region for v1).

## 12. Save/load
Persist a `world_atlas` block: `regions[] · harbors[] (id, type, region, discovered) · routes[] (from, to, regions_crossed, hazard, min_ship_tier, discovered) · drowned_state[] (per region: cleansed/uncleansed, threat_weight) · active_assault_region? · player_harbor_id · dock_state[] (per harbor: docked_cargo present, pressure-timer state)`. Round-trip preserves discovery/fog, Drowned state, active-assault pointer, and dock state (feeds S5). All geometry is data-driven; the map is a seed, not code (Doc 07, D39 TS-types→generated JSON Schema).

## 13. Sim invariants (W-suite; feeds SIM_HARNESS_ACCEPTANCE_SPEC)
- **W1** each route declares exactly one integer `regions_crossed` in the range 0–5; the class ranges do not overlap; the value is a seeded route property used verbatim by the rations formula (never geometry-derived).
- **W2** the graph is connected from the Player Harbor for the intended ship-tier progression (no unreachable required content at the tier that needs it).
- **W3** every region contains ≥1 Drowned Harbor and its regional_threat resolves against a real node.
- **W4** ship range gates route traversability by the route's declared `min_ship_tier` (validated against the declaration, not the class-table label).
- **W5** discovery/fog state persists and never regresses (no lost exploration).
- **W6** hazard-route ambush/threat interactions honor Economy §11 + Doc 05 (no hidden loss; ambush never permanently locks travel).
- **W7** at most one active Drowned-driven Assault region at a time in v1 (mirrors Doc 05 D36); the `active_assault_region` pointer is single-valued.
- **W8** a successful Drowned Harbor expedition applies the D37 strong-partial-reset to that region's regional_threat and the change is ledger-logged (no hidden threat mutation).
- **W9** cargo routing at any harbor obeys CARGO1/CARGO2 (physical cargo never enters the Claim Ledger; route fixed at generation); dock-state never converts cargo to a claim.

## 14. Data-seed exports (`/data/world/`, No Magic Numbers; types per Doc 07)
`regions · harbors (id, type[HarborType], region, coords_for_display, discovered_default) · routes (from, to, regions_crossed:int[0..5], hazard_flag, region_modifiers, min_ship_tier) · drowned_harbors (region, threat_weight, expedition_ref) · faction_capitals (faction, region) · guardian_sanctums (guardian, region, sanctum_state[active|lore_sealed]) · fog_defaults · dock_state_schema · world_save_schema · world_invariants (W1–W9)`. Every value carries id · unit · gate · source section · invariant refs, and types against the Doc 07 enums (regions, HarborType, CoreResource for any cargo/loss field). `regions_crossed` validates as an integer in 0–5 (W1).

## 15. What this doc does NOT do
- No narrative/lore text (faction stories, guardian myths, region history) — later Phase-B content (Faction Codex, Guardian Kit Sheets).
- No final map layout, no final region names, no final node counts — all are structural proposals + data seeds.
- No implementation authorization — cargo/raid/schema/combat-playable work still requires its foundation doc + a separately authorized milestone/session.
- No repo/vault mutation; not canon.

## 16. B2 World Atlas decisions (W-D1–W-D7)
Following the decision-register pattern. Status reflects the owner answers recorded 2026-07-11 from the v0.2 review. **Planning-locked ≠ canon**; these govern B2 drafting direction only.

| ID | Question | Owner answer (2026-07-11) | Status |
|---|---|---|---|
| **W-D1** | Region names | Keep the working set (Emberreach / Rimeholt / Galewrack / Verdance / Lumenshoal / Umbral Deep) for now; do not lock final names — a later art/lore pass may improve them. | PLANNING-LOCKED (working) |
| **W-D2** | World name | Keep "the Evermeer" as the working world-name label; not a final brand lock — revisit in a naming/legal/brand pass. | PLANNING-LOCKED (working) |
| **W-D3** | Adjacency layout | Accept the §6 graph as a **structural test graph**, not final layout, following the route-distance table cleanup (§5). Route costs tune via data seeds. | PLANNING-LOCKED |
| **W-D4** | v1 map scale | Target **~25–35 functional v1 nodes**, with support up to 30–40 if the extra sanctums are lightweight lore/sealed nodes. Working split: 1 Player Harbor · 5 faction capitals · 10 active launch-guardian Sanctums · 10 sealed/lore future Sanctums · ≥6 Drowned Harbors · 3–8 free ports/waypoints. Preserves the 20-guardian doctrine without overloading implementation. | PLANNING-LOCKED |
| **W-D5** | Player Harbor placement | **Fixed starting region for v1** (protects onboarding, first-hour safety, sim validation, balance). Player-chosen start is a possible future option. | PLANNING-LOCKED |
| **W-D6** | Sanctum visibility | All 20 Sanctums may exist as map/lore nodes; only the chosen guardian's is "home." Launch-available guardians get active Sanctum interactions; future-wave guardians appear as sealed/lore nodes until unlocked by content state. | PLANNING-LOCKED |
| **W-D7** | Active-threat surfacing | Passive overlay for Calm/Watch; explicit alert for Warning/Assault. The active Assault region must be unmistakable at Warning/Assault but not alarm-heavy before Warning. | PLANNING-LOCKED |

These feed the §14 data seeds (e.g. `guardian_sanctums.sanctum_state`, map node budget, fixed start region) and the World-View threat overlay behavior.

## 17. Review routing
v0.2.1 addresses the v0.2 independent-review cleanup list (items 1–8) and records W-D1–W-D7. Ready for a re-check: package integrity → doctrine-consistency (no contradiction with the closed foundation) → W-suite completeness → confirmation that the route-distance model and decision block read cleanly. On review pass, B2 can proceed to **B3 (Faction Codex)** and the guardian Sanctum/kit content — still in document mode, no implementation.

*DRAFT v0.2.1 — FUTURE BUILD. Approved-for-revision; not canon; not implementation authorization; not merged. B2 of Phase B; builds on the closed pre-planning foundation set; structure only, content tuned later.*
