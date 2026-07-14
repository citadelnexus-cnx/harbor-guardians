---
title: "Flagship Guardian Kit Sheets — Raxa, Tarin, Nova"
doc_id: "12A_FLAGSHIP_GUARDIAN_KIT_SHEETS"
version: 0.1.2-DRAFT
date: 2026-07-11
bundle_version: B4A-flagshipkits-2026-07-11
status: DRAFT v0.1.2 for owner/independent review — Phase B / B4A, micro-cleanup: live cross-sheet table retied to rations pressure; Raxa JSON enums normalized to canonical lower-case. APPROVED-FOR-REVISION; NOT canon; NOT implementation authorization; no repo/vault mutation.
source: "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 (§4 GuardianKit schema, §3 chassis, §5 Surge rules, §6 sidegrade budget, §9 GDN1–GDN11, G-D1–G-D6 recorded); 02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION v0.5 (§7 flagship trio, Tide Chain → Bond Charge → Surge, C1–C8); 01_ECONOMY_FOUNDATION v1.7 (§16 sidegrade budget, §13 Rite); HG-BLUEPRINT-AMEND-03_v0.4 (original-motif boundary); 00_ART_BIBLE_DIRECTION v0.5 (shape language); 06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 (assist parity, cues); 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 (types, D39); 10_WORLD_ATLAS_FOUNDATION v0.2.1 (Sanctum home regions)"
classification: FUTURE BUILD — all numbers are design targets pending sim validation
foundation_status: "Foundation set closed 2026-07-11; B2/B3/B4 at document-stage closure. This B4A doc fills the flagship kit sheets against the closed B4 schema; it modifies no foundation doctrine. NOT implementation authorization; NOT a canon/repo merge. Document completion does not equal build authorization — build begins only after Milestone 0 environment/repo/toolchain readiness is approved."
---

# Flagship Guardian Kit Sheets — B4A (v0.1.2)

**Position in the project.** B4 (Guardian Sanctum & Kit) closed its document stage with the GuardianKit schema and GDN1–GDN11 accepted (G-D1). This is **B4A**: the first *filled* kit sheets, for the flagship trio **Raxa / Tarin / Nova** (G-D3 fill order: flagships first). These three are the **quality bar and testable examples** every later guardian batch is measured against. All numbers are **design targets pending sim** (No Magic Numbers, Doc 07) — the value of this doc is the *shape* and the *invariant discipline*, not final tuning.

**Standing constraints (unchanged):** approved-for-revision; not canon; **not implementation authorization**; no repo/vault mutation; guardians are **sidegrades, never power creep** (Economy §16; median ST5 completion variance ≤ 0.15, tradeoff mandatory > 0.20); Guardian Surge is battle-earned via Bond Charge, never economy-bought (D6); all Surge motifs original (AMEND-03 §A3.4). Each sheet satisfies GDN1–GDN11 or flags UNKNOWN — requires sim.

**Governing reminder:** *Document completion does not equal build authorization. Build begins only after Milestone 0 environment/repo/toolchain readiness is approved.*

*Supersedes: 12A_FLAGSHIP_GUARDIAN_KIT_SHEETS v0.1, v0.1.1.*

**v0.1.1 change log (cleanup only):** (1) Raxa's negative economy shift retied to a named existing sink (expedition rations pressure) instead of an undefined "passive Provisions trickle"; (2) added the rule that every economy shift must name an existing `source_id`/`sink_id`/`event_id` at data-seed authoring — no free-text shift compiles (§4A, mirrors GDN11); (3) added canonical enum guidance for `difficulty_tag`, `launch_wave`, `chassis` (§4B); (4) clarified the 0.15 vs 0.20 variance thresholds (§4C); (5) added compact JSON-shaped seed objects for Tarin and Nova alongside Raxa (§6). No doctrine changes; no new systems; numbers remain design targets pending sim.

**v0.1.2 change log (micro-cleanup only):** (1) the live cross-sheet validation table's Raxa row now reads **"expedition rations pressure"** (it had still shown the retired "passive Provisions" label even though the sheet and JSON were already corrected in v0.1.1); (2) Raxa's JSON seed enums normalized to canonical lower-case (`"chassis": "striker"`, `"difficulty_tag": "approachable"`) to match Tarin/Nova and the §4B enum guidance. No doctrine change; no mechanics/numbers changed.

**How to read these sheets.** Each sheet fills the B4 §4 `GuardianKit` schema field-for-field. Numeric fields marked `(target)` are sim-tunable design intents; enum/boundary fields are structural. The three flagships deliberately sit at **different difficulty tags** and **different Bond-Charge leans** to prove the sidegrade model spans playstyles without power tiers.

---

## 1. RAXA — Tiger — Striker (Approachable)

**Identity line:** *"Hit the breach hard and clear it fast."* A forward, aggressive companion who rewards clean precision Tide Chains with burst that punishes already-breached lanes.

```
GuardianKit {
  guardian_id:  "gdn.raxa"
  name_working: "Raxa"
  animal:       "Tiger"
  chassis:      Striker
  launch_wave:  launch
  home_region:  Emberreach          // Fire — aggressive, breach-clearing identity (World Atlas §3)
  identity_line:"Hit the breach hard and clear it fast."
  difficulty_tag: Approachable       // forgiving Bond-Charge fill; base attacks clear content (GDN2)

  bond_charge_profile {
    primary_source:   "precision Tide Chains (successful timed hits)"   // Striker lean (B4 §3)
    secondary_sources: ["finishing a breached-lane enemy", "clearing a raid Assault wave"]  // diversity → C4/GDN8
    bond_charge_fill_rate_target: "moderate–fast (target ~3 clean chains to first Surge)"
    bond_charge_reset_or_decay_rule: "partial carry between encounters in the same expedition; full reset on return to Harbor"
  }

  guardian_surge {
    name_working: "Emberbreak"
    duration_turns_target: 3
    recharge_target: "refill from combat only; ~1 Surge per 2–3 encounters (target)"
    effect_hooks: [
      "bonus burst damage vs enemies on a breached lane (World Atlas hazard/raid context)",
      "on-Surge Tide Chain window slightly widened (helps land the burst — accessibility-friendly)"
    ]
    never: [consumes_aether, bought_from_economy, gated_behind_perfect_timing]   // D6, C1/C7, GDN3
  }

  economy_modifier {
    shifts: ["+ raid-salvage yield on existing defended-raid reward events (event_id set at authoring; GDN11)",
             "- expedition ration efficiency / higher rations pressure on the existing rations sink (sink_id set at authoring)"]  // both bind to existing source/sink; shift, not pure gain (§6/§4A)
    st5_median_completion_variance_max: 0.15
    st5_tradeoff_required_threshold:    0.20
    projected_st5_variance_target: 0.10          // within budget, no extra tradeoff needed (GDN4)
  }

  accessibility {
    assist_parity: true               // Assisted tier reaches comparable Surge rate (C2/GDN8)
    cues: [shape+icon+text]           // striped-flare Surge cue also shown as icon+label, never color-only (Doc 06)
  }

  sanctum_ref: "sanctum.raxa (Emberreach)"
  provenance:  "original tiger-sigil + ember-flare motifs; no external transformation forms (AMEND-03 §A3.4)"
}
```

**Sidegrade check (GDN4/§6):** Raxa trades economy headroom (higher expedition rations pressure on the existing rations sink) for combat tempo and raid-salvage upside — a lateral shift bound to named existing source/sink (§4A), projected ST5 variance ~0.10, no mandatory tradeoff triggered. **No-trap check (GDN5/OB5):** Approachable tag, honest identity line, not dominated — Raxa is the "easy to pick up, aggressive" option.

---

## 2. TARIN — Elephant — Bulwark (Standard)

**Identity line:** *"Stand in front, hold the wall, send the damage back."* A protective anchor who builds Bond Charge by guarding allies and structures, then redirects incoming force.

```
GuardianKit {
  guardian_id:  "gdn.tarin"
  name_working: "Tarin"
  animal:       "Elephant"
  chassis:      Bulwark
  launch_wave:  launch
  home_region:  Verdance             // Earth — grounded, wall-and-hold identity (World Atlas §3)
  identity_line:"Stand in front, hold the wall, send the damage back."
  difficulty_tag: Standard            // needs positioning awareness but base attacks always viable (GDN2)

  bond_charge_profile {
    primary_source:   "guarding allies/structures (damage absorbed or prevented)"   // Bulwark lean (B4 §3)
    secondary_sources: ["surviving a raid Assault with walls intact", "intercepting a hit meant for an ally"]
    bond_charge_fill_rate_target: "steady (target ~2 defended turns per charge tick)"
    bond_charge_reset_or_decay_rule: "slow decay out of combat; no cross-Harbor carry"
  }

  guardian_surge {
    name_working: "Wavebreaker Aegis"
    duration_turns_target: 3
    recharge_target: "combat only; favors longer defensive fights (target ~1 Surge per drawn-out encounter)"
    effect_hooks: [
      "party/structure damage-taken reduced for the duration (aegis)",
      "a portion of prevented damage is redirected back as counter-force (bounded, never lethal-swingy)"
    ]
    never: [consumes_aether, bought_from_economy, gated_behind_perfect_timing]   // D6, C1/C7, GDN3
  }

  economy_modifier {
    shifts: ["+ structure durability / cheaper wall repair (attaches to existing Build/repair event; GDN11)",
             "- burst clear speed (fights run longer)"]                           // shift, not pure gain (§6)
    st5_median_completion_variance_max: 0.15
    st5_tradeoff_required_threshold:    0.20
    projected_st5_variance_target: 0.13          // within budget (GDN4)
  }

  accessibility {
    assist_parity: true               // Assisted tier reaches comparable aegis uptime (C2/GDN8)
    cues: [shape+icon+text]           // wall-glyph aegis cue shown as icon+label + shield outline, never color-only (Doc 06)
  }

  sanctum_ref: "sanctum.tarin (Verdance)"
  provenance:  "original elephant-crest + wave-breaker arc motifs (AMEND-03 §A3.4)"
}
```

**Sidegrade check (GDN4/§6):** Tarin trades clear speed for durability and cheaper repairs — slower fights, sturdier harbor. Projected ST5 variance ~0.13, within budget. **No-trap check (GDN5/OB5):** Standard tag, honest identity, not dominated — the "defensive anchor" option. The redirect is explicitly bounded (never a lethal swing) so it stays a sidegrade, not a power spike (§6).

---

## 3. NOVA — Owl — Oracle (Demanding)

**Identity line:** *"See the pattern first, act at the right beat, reveal what's hidden."* An insight/tempo companion who charges by exploiting revealed weaknesses and rewards players who read the Tide order — the highest skill ceiling of the trio, with a strong assist path so it is never a trap.

```
GuardianKit {
  guardian_id:  "gdn.nova"
  name_working: "Nova"
  animal:       "Owl"
  chassis:      Oracle
  launch_wave:  launch
  home_region:  Rimeholt             // Frost — cool, clear-sighted, patient identity (World Atlas §3)
  identity_line:"See the pattern first, act at the right beat, reveal what's hidden."
  difficulty_tag: Demanding           // high skill ceiling; BUT base attacks still clear content (GDN2) and assist path reaches parity (GDN8)

  bond_charge_profile {
    primary_source:   "exploiting a revealed elemental weakness (hitting the shown weak element)"  // Oracle lean (B4 §3)
    secondary_sources: ["completing a Tide Chain in the predicted order", "scouting-reveal on the World map before an expedition fight"]
    bond_charge_fill_rate_target: "skill-scaled: faster with good reads, but secondary sources guarantee a floor (C4)"
    bond_charge_reset_or_decay_rule: "partial carry within an expedition; full reset on return to Harbor"
  }

  guardian_surge {
    name_working: "Omenlight"
    duration_turns_target: 2
    recharge_target: "combat only; frequent short Surges rather than rare long ones (target ~1 per 1–2 encounters)"
    effect_hooks: [
      "reveals enemy weaknesses + upcoming Tide order for the duration (insight)",
      "timing-assist aura: widens Tide Chain windows for the whole party briefly (accessibility-positive by design)"
    ]
    never: [consumes_aether, bought_from_economy, gated_behind_perfect_timing]   // D6, C1/C7, GDN3
  }

  economy_modifier {
    shifts: ["+ scouting/fog-reveal value on the World map (attaches to existing exploration event; GDN11)",
             "- raw single-target damage (relies on the party exploiting reveals)"]   // shift, not pure gain (§6)
    st5_median_completion_variance_max: 0.15
    st5_tradeoff_required_threshold:    0.20
    projected_st5_variance_target: 0.15          // at the ceiling; documented tradeoff = lowest raw damage of the trio (GDN4)
  }

  accessibility {
    assist_parity: true               // Assisted tier: secondary Bond sources + wider windows reach comparable Surge (C2/C4/GDN8)
    cues: [shape+icon+text]           // eye-sigil reveal cue shown as icon+label + marker on weak enemies, never color-only (Doc 06)
  }

  sanctum_ref: "sanctum.nova (Rimeholt)"
  provenance:  "original owl eye-sigil + star-map wing motifs (AMEND-03 §A3.4)"
}
```

**Sidegrade check (GDN4/§6):** Nova sits **at** the 0.15 variance ceiling, so it carries a **documented tradeoff** (lowest raw single-target damage of the trio; leans on the party exploiting reveals) — satisfying the >0.20 rule proactively rather than exceeding it. **No-trap check (GDN5/OB5):** Demanding tag is honest; the guaranteed Bond floor + timing-assist aura mean a lower-skill or Assisted-tier player still reaches comparable outcomes, so Nova is a *high-ceiling* pick, **not** a trap pick.

---

## 4A. Economy-shift source-binding rule (GDN11 enforcement)
Every entry in a kit sheet's `economy_modifier.shifts[]` **must name an existing `source_id`, `sink_id`, or `event_id`** at data-seed authoring time. A shift may raise or lower the magnitude/efficiency of an already-approved faucet, sink, or reward event — it may **never** create a new resource source (GDN11 / Economy E15). **No free-text shift compiles into data:** the schema validator rejects any shift lacking a resolved `target_kind ∈ {source_id, sink_id, event_id}` and a resolvable `target`. The prose descriptions in the sheets above are review shorthand; the authored seed form is the object shape shown in §6 (`{dir, target_kind, target, effect}`).

## 4B. Canonical enum guidance (pins field values before schema use)
For Doc 07 / Milestone 0 schema authoring (D39 TS-types→JSON Schema), the flagship sheets use these canonical enum values (lower_snake in data; the sheets above show display-cased forms for readability):
- `difficulty_tag` ∈ `["approachable" | "standard" | "demanding"]`
- `launch_wave` ∈ `["launch" | "future_wave"]`
- `chassis` ∈ `["striker" | "bulwark" | "oracle" | "warden" | "skirmisher" | "quartermaster"]`
- `home_region` ∈ the World Atlas region enum (Emberreach / Rimeholt / Galewrack / Verdance / Lumenshoal / Umbral_Deep)
- `bond_charge_fill_rate_target` — a design-target enum/string (e.g. `moderate_fast`), **not** a final numeric balance value
- `bond_charge_reset_or_decay_rule` — an enum/string describing reset/decay policy, **not** free implementation behavior
These remain document-level guidance until Doc 07/Milestone 0 turns them into a validated schema.

## 4C. Variance-threshold clarification (0.15 vs 0.20)
The two ST5 constants play distinct roles: **`st5_median_completion_variance_max = 0.15`** is the *normal target ceiling* every guardian is authored to sit within. **`st5_tradeoff_required_threshold = 0.20`** is a *hard review threshold* used only if sim evidence shows a guardian outside the normal band; crossing it requires **owner review and a documented tradeoff**, never silent acceptance. A guardian between 0.15 and 0.20 is a flag for scrutiny; above 0.20 it cannot ship without the documented tradeoff (GDN4). Nova is authored *at* 0.15 (the ceiling) with its tradeoff already documented, so it needs no exception.

## 4. Cross-sheet validation (proves the trio spans the model)

| Dimension | Raxa | Tarin | Nova |
|---|---|---|---|
| Chassis | Striker | Bulwark | Oracle |
| Difficulty tag | Approachable | Standard | Demanding |
| Bond-Charge lean | precision chains | guarding | exploiting reveals |
| Surge length / cadence | 3 turns / medium | 3 turns / longer fights | 2 turns / frequent |
| Economy shift (+) | raid-salvage | structure durability | scouting/reveal value |
| Economy shift (−) | expedition rations pressure | clear speed | raw single-target dmg |
| Projected ST5 variance | ~0.10 | ~0.13 | ~0.15 (tradeoff documented) |

This spread demonstrates the three core proofs the schema must support: (a) **different playstyles, no power tier** (all within the ≤0.15 median budget); (b) **three distinct Bond-Charge leans** all reaching Surge with an assist-mode floor (C4/GDN8); (c) **the tradeoff rule works** — Nova shows how a guardian at the variance ceiling documents its cost rather than being quietly stronger.

## 5. Invariant conformance (per sheet)
Each sheet is asserted against the B4 GDN-suite; these become claim-to-test rows in the Sim Harness:
- **GDN1** all three are pure data (kit-sheet fields), no hard-coded behavior. PASS (by construction).
- **GDN2** each clears required content with base attacks (difficulty tag affects *feel*, not viability). CLAIM — sim to confirm.
- **GDN3** Surge is combat-only, bounded duration/recharge, `never` flags set. PASS (by construction).
- **GDN4** projected ST5 variance ≤ 0.15; Nova at ceiling carries a documented tradeoff. CLAIM — sim to confirm the projections.
- **GDN5** each has an honest identity line + difficulty tag; none strictly dominates another (different shifts). CLAIM — sim cross-check vs E16.
- **GDN6** none interacts with the Rite except as swappable actives; no reward mint/dup. PASS (by construction).
- **GDN7** each carries original-motif provenance. PASS (by construction).
- **GDN8** each declares assist parity + shape+icon+text cues. CLAIM — accessibility/sim to confirm parity.
- **GDN9/GDN10/GDN11** honored: swappable via Rite (atomic), no combat/persistent state bleed, no new resource sources (economy shifts attach to existing events). PASS (by construction).

"CLAIM — sim to confirm" items are exactly the numbers Milestone 0's sim harness will validate; nothing here is asserted as final-tuned.

## 6. Sample data-seed object (illustrative; `/data/guardians/`, types per Doc 07)
All three flagships rendered as seed records, to anchor the Milestone 0 schema/sim work with concrete `GuardianKit` objects (JSON-shaped; final schema authored TS-types→JSON Schema per D39). Economy shifts use the object form `{dir, target_kind, target, effect}` so each binds to a named existing source/sink/event (§4A):

```json
{
  "guardian_id": "gdn.raxa",
  "name_working": "Raxa",
  "animal": "Tiger",
  "chassis": "striker",
  "launch_wave": "launch",
  "home_region": "Emberreach",
  "identity_line": "Hit the breach hard and clear it fast.",
  "difficulty_tag": "approachable",
  "bond_charge_profile": {
    "primary_source": "precision_tide_chains",
    "secondary_sources": ["breached_lane_finish", "assault_wave_clear"],
    "bond_charge_fill_rate_target": "moderate_fast",
    "bond_charge_reset_or_decay_rule": "partial_carry_intra_expedition_full_reset_at_harbor"
  },
  "guardian_surge": {
    "name_working": "Emberbreak",
    "duration_turns_target": 3,
    "recharge_target": "combat_only_1_per_2to3_encounters",
    "effect_hooks": ["bonus_burst_vs_breached_lane", "surge_widened_chain_window"],
    "never": ["consumes_aether", "bought_from_economy", "gated_behind_perfect_timing"]
  },
  "economy_modifier": {
    "shifts": [
      {"dir": "+", "target_kind": "event_id", "target": "defended_raid_reward", "effect": "raid_salvage_yield"},
      {"dir": "-", "target_kind": "sink_id", "target": "expedition_rations", "effect": "higher_rations_pressure"}
    ],
    "st5_median_completion_variance_max": 0.15,
    "st5_tradeoff_required_threshold": 0.20,
    "projected_st5_variance_target": 0.10
  },
  "accessibility": { "assist_parity": true, "cues": ["shape", "icon", "text"] },
  "sanctum_ref": "sanctum.raxa",
  "provenance": "original_tiger_sigil_ember_flare"
}
```

```json
{
  "guardian_id": "gdn.tarin",
  "name_working": "Tarin",
  "animal": "Elephant",
  "chassis": "bulwark",
  "launch_wave": "launch",
  "home_region": "Verdance",
  "identity_line": "Stand in front, hold the wall, send the damage back.",
  "difficulty_tag": "standard",
  "bond_charge_profile": {
    "primary_source": "guarding_allies_structures",
    "secondary_sources": ["survive_assault_walls_intact", "intercept_hit_for_ally"],
    "bond_charge_fill_rate_target": "steady",
    "bond_charge_reset_or_decay_rule": "slow_decay_out_of_combat_no_cross_harbor_carry"
  },
  "guardian_surge": {
    "name_working": "Wavebreaker Aegis",
    "duration_turns_target": 3,
    "recharge_target": "combat_only_favors_long_defensive_fights",
    "effect_hooks": ["party_structure_damage_reduction", "bounded_counter_force_redirect"],
    "never": ["consumes_aether", "bought_from_economy", "gated_behind_perfect_timing"]
  },
  "economy_modifier": {
    "shifts": [
      {"dir": "+", "target_kind": "event_id", "target": "wall_repair", "effect": "structure_durability_cheaper_repair"},
      {"dir": "-", "target_kind": "event_id", "target": "combat_clear", "effect": "slower_burst_clear_speed"}
    ],
    "st5_median_completion_variance_max": 0.15,
    "st5_tradeoff_required_threshold": 0.20,
    "projected_st5_variance_target": 0.13
  },
  "accessibility": { "assist_parity": true, "cues": ["shape", "icon", "text"] },
  "sanctum_ref": "sanctum.tarin",
  "provenance": "original_elephant_crest_wave_breaker_arc"
}
```

```json
{
  "guardian_id": "gdn.nova",
  "name_working": "Nova",
  "animal": "Owl",
  "chassis": "oracle",
  "launch_wave": "launch",
  "home_region": "Rimeholt",
  "identity_line": "See the pattern first, act at the right beat, reveal what's hidden.",
  "difficulty_tag": "demanding",
  "bond_charge_profile": {
    "primary_source": "exploit_revealed_elemental_weakness",
    "secondary_sources": ["tide_chain_predicted_order", "world_map_scouting_reveal"],
    "bond_charge_fill_rate_target": "skill_scaled_with_guaranteed_floor",
    "bond_charge_reset_or_decay_rule": "partial_carry_intra_expedition_full_reset_at_harbor"
  },
  "guardian_surge": {
    "name_working": "Omenlight",
    "duration_turns_target": 2,
    "recharge_target": "combat_only_frequent_short_surges",
    "effect_hooks": ["reveal_weakness_and_tide_order", "party_timing_assist_aura_wider_windows"],
    "never": ["consumes_aether", "bought_from_economy", "gated_behind_perfect_timing"]
  },
  "economy_modifier": {
    "shifts": [
      {"dir": "+", "target_kind": "event_id", "target": "world_map_exploration", "effect": "scouting_fog_reveal_value"},
      {"dir": "-", "target_kind": "event_id", "target": "single_target_attack", "effect": "lower_raw_single_target_damage"}
    ],
    "st5_median_completion_variance_max": 0.15,
    "st5_tradeoff_required_threshold": 0.20,
    "projected_st5_variance_target": 0.15,
    "documented_tradeoff": "lowest_raw_single_target_damage_of_trio"
  },
  "accessibility": { "assist_parity": true, "cues": ["shape", "icon", "text"] },
  "sanctum_ref": "sanctum.nova",
  "provenance": "original_owl_eye_sigil_star_map_wing"
}
```

Every field types against the Doc 07 enums (`chassis`, `region`/home_region, `CoreResource` for any economy-shift target); numeric targets carry unit/gate/source per No Magic Numbers.

## 7. What this doc does NOT do
- No final numbers — all `(target)`/`projected` values are design intents pending sim.
- No new guardians beyond the flagship trio — later chassis batches (G-D3) fill the rest one batch at a time.
- No lore/narrative or final names (G-D6 working names).
- No implementation authorization; no repo/vault mutation; not canon.

## 8. Review routing & what comes after B4A
Ready for the document-mode review loop: package check → schema conformance (do all three sheets fill B4 §4 exactly?) → invariant conformance (§5) → sidegrade-budget sanity (§4 table).

**Next document-mode steps** (per the governing build sequence and the reviewer recommendation): **B4B — Remaining Launch Chassis Anchor Kit Sheets** for **Warden / Skirmisher / Quartermaster** (so all six chassis have at least one concrete, testable anchor before implementation planning), then begin the **Milestone 0 Implementation Readiness Packet** (setup plan, repo scaffold, Claude Code operating rules, Git/GitHub workflow, Windows env, memory/doc-access, schema/data-contract setup, sim-harness + claim-to-test, alpha/beta/production gates). Both are document-mode; neither authorizes a build.

*Reminder repeated by design: document completion does not equal build authorization; build begins only after Milestone 0 environment/repo/toolchain readiness is approved.*

*DRAFT v0.1.2 — FUTURE BUILD. Approved-for-revision; not canon; not implementation authorization; not merged. B4A of Phase B; filled flagship kit sheets against the closed B4 schema; numbers are design targets pending sim.*
