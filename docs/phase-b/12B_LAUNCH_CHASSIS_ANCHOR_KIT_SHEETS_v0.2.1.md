---
title: "Remaining Launch Chassis Anchor Kit Sheets — Warden, Skirmisher, Quartermaster"
doc_id: "12B_LAUNCH_CHASSIS_ANCHOR_KIT_SHEETS"
version: 0.2.1-DRAFT
date: 2026-07-11
bundle_version: B4B-chassisanchors-2026-07-11
status: DRAFT v0.2.1 for owner/independent review — Phase B / B4B, micro-cleanup: section headings synced to corrected names (BRU/SEF/DAGG); B4A source ref updated to v0.1.2. APPROVED-FOR-REVISION; NOT canon; NOT implementation authorization; no repo/vault mutation.
source: "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 (§4 schema, §3 chassis, §6 sidegrade budget, GDN1–GDN11); 12A_FLAGSHIP_GUARDIAN_KIT_SHEETS v0.1.2 (sheet format, §4A source-binding rule, §4B enum guidance, §4C variance note, JSON seed form); 02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION v0.5 (chassis frames, Tide Chain → Bond Charge → Surge, C1–C8); 01_ECONOMY_FOUNDATION v1.7 (§16 sidegrade budget, §9 dock contracts); HG-BLUEPRINT-AMEND-03_v0.4 (original-motif boundary); 06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2; 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 (types, D39); 10_WORLD_ATLAS_FOUNDATION v0.2.1 (home regions); 05_THREAT_AND_RAID_DIRECTOR_FOUNDATION v0.1.3 (raid context for Quartermaster)"
classification: FUTURE BUILD — all numbers are design targets pending sim validation
supersedes: "12B_LAUNCH_CHASSIS_ANCHOR_KIT_SHEETS v0.1, v0.2"
foundation_status: "Foundation set closed 2026-07-11; B2/B3/B4 at document-stage closure; B4A flagship sheets delivered. This B4B doc fills the three remaining launch chassis anchors against the closed B4 schema; it modifies no foundation doctrine. NOT implementation authorization; NOT a canon/repo merge. Document completion does not equal build authorization — build begins only after Milestone 0 environment/repo/toolchain readiness is approved."
---

# Remaining Launch Chassis Anchor Kit Sheets — B4B (v0.2.1)

**Position in the project.** B4A filled the flagship trio (Striker/Bulwark/Oracle). This is **B4B**: one filled launch anchor for each of the **three remaining chassis — Warden, Skirmisher, Quartermaster** — so that after B4B **all six chassis have a concrete, testable launch anchor** (G-D2: every chassis ships with ≥1 launch guardian). These complete the "at least one anchor per chassis" precondition the reviewer set before Milestone 0.

**Standing constraints (unchanged):** approved-for-revision; not canon; **not implementation authorization**; no repo/vault mutation; sidegrades not power creep (median ST5 variance ≤0.15, tradeoff mandatory >0.20); Surge battle-earned only (D6); original motifs (AMEND-03 §A3.4); every economy shift binds to an existing `source_id`/`sink_id`/`event_id` (B4A §4A); enum values per B4A §4B. Each sheet satisfies GDN1–GDN11 or flags UNKNOWN — requires sim.

**v0.2.1 change log (micro-cleanup only):** section headings synced to the corrected names — **BRU / SEF / DAGG** (the v0.2 rename had updated every live field, table, and JSON seed but left the three all-caps section headings as KESS/VELL/BROM); B4A source reference updated to v0.1.2. No doctrine change; no mechanics/numbers changed.

**Governing reminder:** *Document completion does not equal build authorization. Build begins only after Milestone 0 environment/repo/toolchain readiness is approved.*

**v0.2 change log (correction only):** the v0.1 placeholder animals (Heron/Fox/Beaver) were never owner-approved; per owner note they are replaced with better-fitting placeholders — **Bru/Bear (Warden), Sef/Falcon (Skirmisher), Dagg/Badger (Quartermaster)**. Only the flagship trio (Nova/owl, Tarin/elephant, Raxa/tiger) is approved canon; all other animals remain **unapproved placeholders** pending the lore/naming pass (G-D6). No mechanics/numbers changed — names, animals, and motif provenance only.

Names **and animals** are working placeholders (G-D6 — only the flagship trio Nova/owl, Tarin/elephant, Raxa/tiger are approved canon; every other guardian animal here is an unapproved placeholder pending the lore/naming pass). Animals were chosen for shape-language fit to the chassis role (Art v0.5): a **Bear** for the ground-holding Warden, a **Falcon** for the fast-initiative Skirmisher, a **Badger** for the den-guarding Quartermaster. Final animals and names are owner's call.

---

## 1. BRU — Bear — Warden (Standard)

**Identity line:** *"Claim the ground, deny the lane, make them fight on your terms."* A zone-control companion who charges by holding contested space and projects an area of denial.

```
GuardianKit {
  guardian_id:  "gdn.bru"
  name_working: "Bru"
  animal:       "Bear"
  chassis:      Warden
  launch_wave:  launch
  home_region:  Galewrack            // Storm — contested/neutral waters, fits a zone-holder identity (World Atlas §3; Galewrack has no faction capital, F-D2)
  identity_line:"Claim the ground, deny the lane, make them fight on your terms."
  difficulty_tag: Standard            // positioning matters; base attacks always viable (GDN2)

  bond_charge_profile {
    primary_source:   "sustained pressure / holding a contested zone across turns"   // Warden lean (B4 §3)
    secondary_sources: ["denying an enemy approach lane", "surviving a full raid Watch→Assault without ceding ground"]
    bond_charge_fill_rate_target: "steady-slow (target ~3 held turns per charge tick)"
    bond_charge_reset_or_decay_rule: "slow decay out of combat; no cross-Harbor carry"
  }

  guardian_surge {
    name_working: "Tideward Dominion"
    duration_turns_target: 3
    recharge_target: "combat only; favors held, drawn-out engagements (target ~1 Surge per zone-hold fight)"
    effect_hooks: [
      "creates a denial zone: enemies entering take bounded attrition + reduced initiative (Tide order pushed back)",
      "allies inside the zone gain a small, bounded defensive steadiness"
    ]
    never: [consumes_aether, bought_from_economy, gated_behind_perfect_timing]   // D6, C1/C7, GDN3
  }

  economy_modifier {
    shifts: [ {dir:"+", target_kind:"event_id", target:"defended_route_hold", effect:"reduced_route_threat_accrual_on_held_lanes"},   // binds to existing route_threat event (§4A/GDN11)
              {dir:"-", target_kind:"event_id", target:"expedition_speed", effect:"slower_expedition_turnaround"} ]
    st5_median_completion_variance_max: 0.15
    st5_tradeoff_required_threshold:    0.20
    projected_st5_variance_target: 0.12
  }

  accessibility {
    assist_parity: true               // Assisted tier reaches comparable zone uptime (C2/GDN8)
    cues: [shape+icon+text]           // denial-zone shown as bordered area + icon + label, never color-only (Doc 06)
  }

  sanctum_ref: "sanctum.bru (Galewrack)"
  provenance:  "original bear-stance + storm-ward ring motifs (AMEND-03 §A3.4)"
}
```

**Sidegrade check (GDN4/§6):** Bru trades expedition speed for lane control and lower route_threat on held lanes — projected variance ~0.12, within budget. **No-trap (GDN5):** Standard tag, honest identity, not dominated — the "hold and deny" option.

---

## 2. SEF — Falcon — Skirmisher (Approachable)

**Identity line:** *"Move first, hit twice, never be where they swing."* A mobility/initiative companion who charges through fast successful chains and repositioning, rewarding tempo over raw force.

```
GuardianKit {
  guardian_id:  "gdn.sef"
  name_working: "Sef"
  animal:       "Falcon"
  chassis:      Skirmisher
  launch_wave:  launch
  home_region:  Lumenshoal           // Radiant — quick, bright, darting identity (World Atlas §3)
  identity_line:"Move first, hit twice, never be where they swing."
  difficulty_tag: Approachable         // fast, forgiving fill; base attacks clear content (GDN2)

  bond_charge_profile {
    primary_source:   "fast successful Tide Chains / acting early in the Initiative Tide"   // Skirmisher lean (B4 §3)
    secondary_sources: ["repositioning out of a telegraphed hit", "first-strike on a new encounter"]
    bond_charge_fill_rate_target: "fast (target ~2–3 quick chains to first Surge)"
    bond_charge_reset_or_decay_rule: "partial carry intra-expedition; full reset at Harbor"
  }

  guardian_surge {
    name_working: "Quicklight Gambit"
    duration_turns_target: 2
    recharge_target: "combat only; frequent short Surges (target ~1 per 1–2 encounters)"
    effect_hooks: [
      "guardian + party gain an initiative/tempo boost (act earlier in the Tide order)",
      "one bonus repositioning action per turn for the duration (no extra damage packet — tempo, not power)"
    ]
    never: [consumes_aether, bought_from_economy, gated_behind_perfect_timing]   // D6, C1/C7, GDN3
  }

  economy_modifier {
    shifts: [ {dir:"+", target_kind:"event_id", target:"expedition_completion", effect:"faster_expedition_turnaround"},   // binds to existing expedition event (§4A)
              {dir:"-", target_kind:"event_id", target:"defended_raid_reward", effect:"lower_raid_salvage_yield"} ]
    st5_median_completion_variance_max: 0.15
    st5_tradeoff_required_threshold:    0.20
    projected_st5_variance_target: 0.11
  }

  accessibility {
    assist_parity: true               // Assisted tier reaches comparable tempo via secondary sources (C4/GDN8)
    cues: [shape+icon+text]           // tempo aura shown as motion-trail icon + label, never color-only (Doc 06)
  }

  sanctum_ref: "sanctum.sef (Lumenshoal)"
  provenance:  "original falcon-dart + light-trail motifs (AMEND-03 §A3.4)"
}
```

**Sidegrade check (GDN4/§6):** Sef trades raid-salvage yield for expedition speed and tempo — the mirror of Bru. Projected variance ~0.11. The Surge is explicitly **tempo, not a damage packet**, so it stays a sidegrade. **No-trap (GDN5):** Approachable, honest, not dominated.

---

## 3. DAGG — Badger — Quartermaster (Standard)

**Identity line:** *"Protect what's stored, waste nothing, turn a bad raid into a smaller loss."* An economy-adjacent utility companion who charges by protecting harbor assets during raids and improves *existing* reward outcomes without ever minting resources.

```
GuardianKit {
  guardian_id:  "gdn.dagg"
  name_working: "Dagg"
  animal:       "Badger"
  chassis:      Quartermaster
  launch_wave:  launch
  home_region:  Umbral Deep          // Umbral — salvage/deep-storage identity (World Atlas §3)
  identity_line:"Protect what's stored, waste nothing, turn a bad raid into a smaller loss."
  difficulty_tag: Standard

  bond_charge_profile {
    primary_source:   "protecting harbor assets during a raid (exposed surplus/structures preserved)"   // Quartermaster lean (B4 §3)
    secondary_sources: ["successfully unloading Docked Cargo before pressure-timer resolution", "completing a supply contract"]
    bond_charge_fill_rate_target: "steady (target ~2 protected assets per charge tick)"
    bond_charge_reset_or_decay_rule: "slow decay out of combat; no cross-Harbor carry"
  }

  guardian_surge {
    name_working: "Warden's Ledger"
    duration_turns_target: 3
    recharge_target: "combat only; favors raid-defense (target ~1 Surge per defended Assault)"
    effect_hooks: [
      "raid loss severity against exposed surplus reduced for the duration (bounded, never zero — raids still bite; E12/E13)",
      "improves the outcome of an ALREADY-TRIGGERED reward/salvage event (better roll within its existing table) — never creates a reward (GDN11/§4A)"
    ]
    never: [consumes_aether, bought_from_economy, gated_behind_perfect_timing, mints_resources]   // D6, C1/C7, GDN3, GDN11
  }

  economy_modifier {
    shifts: [ {dir:"+", target_kind:"event_id", target:"defended_raid_reward", effect:"improved_roll_within_existing_reward_table"},   // improves existing event only (§4A/GDN11)
              {dir:"-", target_kind:"event_id", target:"combat_damage_output", effect:"lower_offensive_damage"} ]
    st5_median_completion_variance_max: 0.15
    st5_tradeoff_required_threshold:    0.20
    projected_st5_variance_target: 0.14
  }

  accessibility {
    assist_parity: true               // Assisted tier reaches comparable protection uptime (C2/GDN8)
    cues: [shape+icon+text]           // asset-protection aura shown as vault-icon + label over protected storage, never color-only (Doc 06)
  }

  sanctum_ref: "sanctum.dagg (Umbral Deep)"
  provenance:  "original badger-ledger + tide-vault motifs (AMEND-03 §A3.4)"
}
```

**Sidegrade check (GDN4/§6):** Dagg trades offensive damage for raid-loss mitigation and better rolls on *existing* reward events — the highest-utility, lowest-aggression flagship-adjacent pick. Projected variance ~0.14 (highest in B4B, still under 0.15). **Critical GDN11 check:** every Dagg bonus improves an *already-triggered* event's roll within its existing table — it never creates a new source, never mints. The extra `never: [mints_resources]` flag makes this explicit. **No-trap (GDN5):** Standard, honest, not dominated.

---

## 4. Cross-sheet validation (all six chassis now anchored)

| Dimension | Bru (Warden) | Sef (Skirmisher) | Dagg (Quartermaster) |
|---|---|---|---|
| Animal | Bear | Falcon | Badger |
| Difficulty | Standard | Approachable | Standard |
| Bond lean | holding zones | fast chains / tempo | protecting assets |
| Surge / cadence | Tideward Dominion 3t / long fights | Quicklight Gambit 2t / frequent | Warden's Ledger 3t / raid-defense |
| Economy + | lower route_threat on held lanes | faster expeditions | better roll on existing reward event |
| Economy − | slower expeditions | lower raid salvage | lower offensive damage |
| Projected variance | ~0.12 | ~0.11 | ~0.14 |

Combined with B4A, all six chassis now have a launch anchor:

| Chassis | Launch anchor (working) |
|---|---|
| Striker | Raxa (Tiger) — B4A |
| Bulwark | Tarin (Elephant) — B4A |
| Oracle | Nova (Owl) — B4A |
| Warden | Bru (Bear) — B4B |
| Skirmisher | Sef (Falcon) — B4B |
| Quartermaster | Dagg (Badger) — B4B |

Six anchors, six distinct economy-shift pairs, all within the ≤0.15 median budget — the sidegrade model spans all six playstyles with no power tier (G-D2 satisfied for the anchor set).

## 5. Invariant conformance (per sheet)
Each B4B sheet is asserted against GDN1–GDN11 as claim-to-test rows for the Sim Harness (same convention as B4A §5): GDN1/GDN3/GDN6/GDN7/GDN9/GDN10/GDN11 hold **by construction** (pure data, combat-only Surge with `never` flags, no Rite reward-dup, original provenance, no new sources); GDN2/GDN4/GDN5/GDN8 are **CLAIM — sim to confirm** (base-attack viability, projected variance, no-domination, assist parity). Dagg's GDN11 conformance is called out explicitly (improves-existing-event-only, `never: mints_resources`).

## 6. Sample data-seed objects (`/data/guardians/`, JSON-shaped; types per Doc 07, D39)

```json
{
  "guardian_id": "gdn.bru",
  "name_working": "Bru",
  "animal": "Bear",
  "chassis": "warden",
  "launch_wave": "launch",
  "home_region": "Galewrack",
  "identity_line": "Claim the ground, deny the lane, make them fight on your terms.",
  "difficulty_tag": "standard",
  "bond_charge_profile": {
    "primary_source": "hold_contested_zone",
    "secondary_sources": ["deny_enemy_lane", "survive_full_raid_without_ceding_ground"],
    "bond_charge_fill_rate_target": "steady_slow",
    "bond_charge_reset_or_decay_rule": "slow_decay_out_of_combat_no_cross_harbor_carry"
  },
  "guardian_surge": {
    "name_working": "Tideward Dominion",
    "duration_turns_target": 3,
    "recharge_target": "combat_only_favors_held_fights",
    "effect_hooks": ["denial_zone_attrition_and_initiative_pushback", "bounded_ally_steadiness_in_zone"],
    "never": ["consumes_aether", "bought_from_economy", "gated_behind_perfect_timing"]
  },
  "economy_modifier": {
    "shifts": [
      {"dir": "+", "target_kind": "event_id", "target": "defended_route_hold", "effect": "reduced_route_threat_accrual_on_held_lanes"},
      {"dir": "-", "target_kind": "event_id", "target": "expedition_speed", "effect": "slower_expedition_turnaround"}
    ],
    "st5_median_completion_variance_max": 0.15,
    "st5_tradeoff_required_threshold": 0.20,
    "projected_st5_variance_target": 0.12
  },
  "accessibility": { "assist_parity": true, "cues": ["shape", "icon", "text"] },
  "sanctum_ref": "sanctum.bru",
  "provenance": "original_bear_stance_storm_ward_ring"
}
```

```json
{
  "guardian_id": "gdn.sef",
  "name_working": "Sef",
  "animal": "Falcon",
  "chassis": "skirmisher",
  "launch_wave": "launch",
  "home_region": "Lumenshoal",
  "identity_line": "Move first, hit twice, never be where they swing.",
  "difficulty_tag": "approachable",
  "bond_charge_profile": {
    "primary_source": "fast_tide_chains_early_initiative",
    "secondary_sources": ["reposition_out_of_telegraph", "first_strike_new_encounter"],
    "bond_charge_fill_rate_target": "fast",
    "bond_charge_reset_or_decay_rule": "partial_carry_intra_expedition_full_reset_at_harbor"
  },
  "guardian_surge": {
    "name_working": "Quicklight Gambit",
    "duration_turns_target": 2,
    "recharge_target": "combat_only_frequent_short_surges",
    "effect_hooks": ["party_initiative_tempo_boost", "one_bonus_reposition_per_turn_no_damage_packet"],
    "never": ["consumes_aether", "bought_from_economy", "gated_behind_perfect_timing"]
  },
  "economy_modifier": {
    "shifts": [
      {"dir": "+", "target_kind": "event_id", "target": "expedition_completion", "effect": "faster_expedition_turnaround"},
      {"dir": "-", "target_kind": "event_id", "target": "defended_raid_reward", "effect": "lower_raid_salvage_yield"}
    ],
    "st5_median_completion_variance_max": 0.15,
    "st5_tradeoff_required_threshold": 0.20,
    "projected_st5_variance_target": 0.11
  },
  "accessibility": { "assist_parity": true, "cues": ["shape", "icon", "text"] },
  "sanctum_ref": "sanctum.sef",
  "provenance": "original_falcon_dart_light_trail"
}
```

```json
{
  "guardian_id": "gdn.dagg",
  "name_working": "Dagg",
  "animal": "Badger",
  "chassis": "quartermaster",
  "launch_wave": "launch",
  "home_region": "Umbral_Deep",
  "identity_line": "Protect what's stored, waste nothing, turn a bad raid into a smaller loss.",
  "difficulty_tag": "standard",
  "bond_charge_profile": {
    "primary_source": "protect_harbor_assets_in_raid",
    "secondary_sources": ["unload_docked_cargo_before_resolution", "complete_supply_contract"],
    "bond_charge_fill_rate_target": "steady",
    "bond_charge_reset_or_decay_rule": "slow_decay_out_of_combat_no_cross_harbor_carry"
  },
  "guardian_surge": {
    "name_working": "Warden's Ledger",
    "duration_turns_target": 3,
    "recharge_target": "combat_only_favors_raid_defense",
    "effect_hooks": ["bounded_raid_loss_reduction_never_zero", "improve_roll_within_existing_reward_table"],
    "never": ["consumes_aether", "bought_from_economy", "gated_behind_perfect_timing", "mints_resources"]
  },
  "economy_modifier": {
    "shifts": [
      {"dir": "+", "target_kind": "event_id", "target": "defended_raid_reward", "effect": "improved_roll_within_existing_reward_table"},
      {"dir": "-", "target_kind": "event_id", "target": "combat_damage_output", "effect": "lower_offensive_damage"}
    ],
    "st5_median_completion_variance_max": 0.15,
    "st5_tradeoff_required_threshold": 0.20,
    "projected_st5_variance_target": 0.14
  },
  "accessibility": { "assist_parity": true, "cues": ["shape", "icon", "text"] },
  "sanctum_ref": "sanctum.dagg",
  "provenance": "original_badger_ledger_tide_vault"
}
```

## 7. What this doc does NOT do
- No final numbers — all `(target)`/`projected` values are design intents pending sim.
- No future-wave guardians — B4B fills only the three remaining **launch** chassis anchors; future-wave slots (§B4 §8) remain sealed/lore.
- No lore/narrative or final names (G-D6 working names).
- No implementation authorization; no repo/vault mutation; not canon.

## 8. Review routing & what comes after B4B
Ready for the document-mode review loop: package check → schema conformance (all three sheets fill B4 §4 + B4A §4A/§4B) → invariant conformance (§5) → sidegrade-budget sanity (§4). With all six chassis anchored, the remaining pre-Milestone-0 document is the **Milestone 0 Implementation Readiness Packet** (delivered alongside this doc in the same batch).

*Reminder repeated by design: document completion does not equal build authorization; build begins only after Milestone 0 environment/repo/toolchain readiness is approved.*

*DRAFT v0.2.1 — FUTURE BUILD. Approved-for-revision; not canon; not implementation authorization; not merged. B4B of Phase B; launch chassis anchors against the closed B4 schema; numbers are design targets pending sim.*
