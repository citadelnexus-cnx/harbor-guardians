---
title: "Threat & Raid Director Foundation"
doc_id: "05_THREAT_AND_RAID_DIRECTOR_FOUNDATION"
version: 0.1.3-DRAFT
date: 2026-07-10
bundle_version: v0.1.3-microcleanup
status: DRAFT v0.1.3 for owner review — micro-cleanup: source-ref sync (AMEND-02 v0.5.1, Sim v0.6.2, 04B v0.1.2). corrected raid-protection doctrine wording (v0.1.1). APPROVED-FOR-REVISION; not canon; no repo/vault mutation.
source: "Decision Register D1–D22; AMEND-02 v0.5.1 (A2.5 raid risk, threat drivers, readiness fields, phases); 01_ECONOMY_FOUNDATION v1.7 (§12 loss/repair); 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 (raid reward packages, L15); 04B v0.1.2 (docked cargo exposure); SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 (D7 no offline Assault); SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2"
classification: FUTURE BUILD — all numbers are design targets pending sim validation
blocks: "raid generation / threat pacing / raid director implementation"
---

# Threat & Raid Director Foundation v0.1.3

**Why this exists:** AMEND-02 A2.5 defines *what* raids may target, the threat drivers, the readiness formula fields, and the five phases — but not the *orchestration*: how threat grows, which raid type fires, how long Warning lasts, when Assault becomes eligible, and how rewards/severity resolve. This doc founds the director. It never overrides A2.5 protections: **safe storage is protected; exposed surplus is raidable — including exposed Crowns; Merit, the Claim Ledger, and Story Claims are never touched; and no Assault auto-resolves offline.**

## 1. Design goals
Raids create tension through **preparation, not invisible punishment**. Every raid is telegraphed, explainable, and reducible by player action. A prepared defender is rewarded; a spend-down player who keeps exposed surplus low is resource-safe but still faces structure pressure and forgoes salvage/Merit. No raid ever wipes safe storage or soft-locks the game.

## 2. Threat phases (from AMEND-02 A2.5)
`Calm → Watch → Warning → Assault → Aftermath`. A mandatory visible **Warning** with a preparation window always precedes **Assault**. Offline, threat may advance to a **maximum of Warning**; an Assault never auto-resolves offline in v1 (D7).

## 3. Threat score model
Per AMEND-02 A2.5, threat is composed from named components; the director maintains a running `threat_score` per harbor:
```
threat_score = regional_threat
             + exposed_surplus_threat
             + story_gate_threat
             + route_threat
             + defense_neglect_risk
             − faction_support_modifier
```
- **regional_threat** rises passively while a nearby Drowned Harbor is uncleansed.
- **exposed_surplus_threat** rises with total exposed surplus across raidable resources (incl. exposed Crowns and Docked Cargo, 04B) — hoarding invites pillagers.
- **story_gate_threat** is a scripted spike when a story tier gate opens a raid window.
- **route_threat** rises with repeated hazard-route use.
- **defense_neglect_risk** rises as walls/towers/wards fall below coverage targets or sit damaged.
- **faction_support_modifier** subtracts when a treaty suppresses a raid type (§7).
All weights and thresholds are data-seed values (No Magic Numbers); actual numbers are [UNKNOWN — sim].

## 4. Phase-advance thresholds
`threat_score` crossing tuned thresholds advances the phase: Calm→Watch (early signal), Watch→Warning (commit + start the mandatory prep window), Warning→Assault (only after the prep window elapses **and** the player is online, D7). Aftermath follows any Assault resolution. Thresholds, hysteresis (to avoid flapping), and the **Warning duration** (`warning_pulses` target [sim-tunable]) are data-seed values. Warning duration must be long enough for a reasonable player to prepare (invariant E12 fairness).

## 5. Raid-type selection
On Warning commit, the director selects a raid type from the target categories (AMEND-02 A2.5), weighted by what generated the threat:
| Raid type | Primary target | Biased by |
|---|---|---|
| Pillager raid | Exposed surplus + Docked Cargo | high exposed_surplus_threat |
| Siege | Walls/towers | defense_neglect_risk |
| Saboteur strike | Production buildings (temporary disable) | defense_neglect + high value buildings |
| Cultist incursion | Aether systems (drain exposed Aether, disrupt wards) | exposed Aether + active wards |
| Blockade | Routes/docks (raise rations, delay contracts, threaten ship durability) | route_threat |
Selection is seeded/deterministic for the sim. A story_gate raid may force a specific type.

## 6. Assault resolution → severity & rewards
- **Defense outcome** maps to a breach class → `raid_severity_rate ∈ {0.25, 0.50, 0.75, 1.00}` (Minor/Moderate/Severe/Critical), per Economy §12 / prior severity table.
- **Resource loss:** `loss = floor(exposed_surplus_current × severity_rate)` per raidable resource. **Only exposed surplus is at risk — including exposed Crowns and Docked Cargo (04B).** Safe storage, Merit, the Claim Ledger (held packages), and Story Claims are never touched (E6/E7).
- **Structure damage:** 10/20/35/50% by class; Critical additionally disables one production building until repaired (Build Queue §10; repair `ceil(base × missing_dur% × repair_rate)`).
- **Rewards on success:** a raid-victory **reward package** is created **after the battle result screen** (Doc 04 §2) — salvage (+30–80 Iron class), Vanguard-weighted Merit, structure-intact bonus, tier-gate progress. If Ledger caps are full, it enters the persistent pending state (Doc 04 §10); a **mandatory defensive raid is never frozen by a pending reward** (L15).

## 7. Reduction & suppression (player agency)
Threat is reducible: a **successful Drowned Harbor expedition** delays, weakens, or resets regional_threat; **faction treaty support** suppresses or softens a specific raid type (faction_support_modifier); investing in **walls/towers/wards/militia** raises readiness (§8) and lowers realized severity; keeping **exposed surplus low** (spending/storing to Safe) shrinks exposed_surplus_threat and the pillager loss ceiling. Every reduction lever is surfaced in the UI before Warning commits.

## 8. Readiness scoring (from AMEND-02 A2.5)
```
Harbor_Readiness = wall_coverage + tower_coverage + militia_readiness + ward_coverage + route_security
                 − exposed_surplus_risk − nearby_drowned_pressure − damaged_structure_penalty
```
Readiness is **visible pre-Warning** so the player can act. Higher readiness lowers realized breach class for a given raid strength. Numbers are data-seed [UNKNOWN — sim].

## 9. Offline behavior (D7, hard)
During an offline window, `threat_score` may advance up to Warning and a Raid Notice (System Inbox, M5) is generated, but **no Assault resolves**. On return: show the Warning + Aftermath-free report, allow preparation, then the encounter may begin. No offline return reveals hidden raid damage, hidden loss, or invisible disablement (E19, Save/Load §7).

## 10. Save/load
Persist `threat` block: `phase · threat_score components · selected_raid_type? · warning_started_world_clock · readiness_snapshot`. Round-trip preserves phase and components (S5). Threat math is deterministic/seedable for sim replay.

## 11. Sim invariants (extends E-suite; feeds SIM_HARNESS_ACCEPTANCE_SPEC)
Reuses E6 (safe storage + Merit + Claim Ledger + Story Claims immune; exposed surplus raidable, including exposed Crowns), E7 (loss ≤ exposed surplus), E12 (raid warning fairness — no Assault without a visible Warning + adequate prep window), E13 (failed-raid recoverability — never unrecoverable), E14 (structure damage bounded by tier recovery budget), E19 (offline trust — no hidden resolution/loss), plus L15 (pending reward cannot freeze a mandatory raid). Director-specific checks: **TD1** threat advance is deterministic under a seed; **TD2** Warning duration ≥ the tuned fairness floor for every raid type; **TD3** every realized loss/ damage event is ledger-logged (no hidden loss); **TD4** reduction levers measurably lower realized severity in sim.

## 12. Data-seed exports (`/data/threat/`)
`threat_components (weights) · phase_thresholds (incl. hysteresis) · warning_pulses · raid_type_table (targets, biases) · severity_map · readiness_formula · suppression_rules (drowned/faction) · reward_timing · threat_save_schema · threat_invariants`. No Magic Numbers rule applies.

## 13. Open questions for owner
1. **Warning duration by raid type** — uniform vs per-type (e.g. Blockade slower than Pillager)? Recommended: per-type, all above a fairness floor.
2. **Multiple simultaneous raids** — allowed at high tiers, or strictly one active threat at a time in v1? Recommended: one active Assault at a time in v1.
3. **Drowned Harbor reset strength** — full reset vs partial decay of regional_threat on a cleared expedition? Recommended: strong partial reset, tuned by sim.

*DRAFT v0.1.3 — FUTURE BUILD. Approved-for-revision; merge requires a separately authorized session. Required before raid-director implementation.*
