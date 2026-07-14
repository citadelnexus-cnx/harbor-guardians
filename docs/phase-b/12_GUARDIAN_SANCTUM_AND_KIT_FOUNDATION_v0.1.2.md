---
title: "Guardian Sanctum & Kit Foundation"
doc_id: "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION"
version: 0.1.2-DRAFT
date: 2026-07-11
bundle_version: B4-guardiankit-2026-07-11
status: DRAFT v0.1.2 — B4 document-stage closed; owner answers G-D1–G-D6 recorded 2026-07-11. APPROVED-FOR-REVISION; NOT canon; NOT implementation authorization; no repo/vault mutation.
source: "Blueprint v6.0 (one guardian per playthrough, 20 designed / 10 launch, Rite of the Changing Tide, Sanctums, animal-spirit identity); 00_DECISION_REGISTER v0.2 (D1–D22) + 00_DECISION_REGISTER_ADDENDUM_D23_D40 v0.3; HG-BLUEPRINT-AMEND-03_v0.4 (Guardian Surge original-motif boundary); 00_ART_BIBLE_DIRECTION v0.5 (guardian shape language, Surge visuals); 01_ECONOMY_FOUNDATION v1.7 (§13 Rite Aether+Crowns+quest, §16 guardian budgets ≤12–15% ST5 variance); 02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION v0.5 (Tide Chain → Bond Charge → Guardian Surge; §7 flagship trio + 6 chassis frames; C1–C8, D16 suspend snapshot); 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 (gear/rewards, L5); 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 (data contracts, D39); 09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION v0.1.2 (gear routing, GEAR6); 10_WORLD_ATLAS_FOUNDATION v0.2.1 (Sanctum nodes, W-D6 visibility); 11_FACTION_CODEX_FOUNDATION v0.1.2 (faction context, FCT1)"
classification: FUTURE BUILD — all values are design targets pending sim validation
supersedes: "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1, v0.1.1"
foundation_status: "Pre-planning foundation set approved for closure 2026-07-11. B2 World Atlas, B3 Faction Codex accepted for document-stage closure. This B4 doc builds on all; it modifies no foundation doctrine. NOT implementation authorization; NOT a canon/repo merge. Document completion does not equal build authorization — build begins only after Milestone 0 environment/repo/toolchain readiness is approved."
---

# Guardian Sanctum & Kit Foundation — B4 (v0.1.2)

**Position in the project.** The foundation set is closed; B2 (World Atlas) and B3 (Faction Codex) are at document-stage closure. This is B4. It founds the **guardian content structure** that Combat §7 gestures at: the 20-guardian roster shape, the **6-chassis sidegrade model**, the **Guardian Kit sheet schema**, the **Sanctum** nodes on the map, and the **Rite of the Changing Tide**. It defines **structure, schema, and the sidegrade rules** — not final per-guardian numbers or lore.

**Standing constraints (unchanged):** approved-for-revision; not canon; **not implementation authorization**; no repo/vault mutation; every gameplay number originates in a data seed (No Magic Numbers, Doc 07); guardians are **sidegrades, never power creep** (Economy §16, median ST5 variance ≤12–15%); Guardian Surge is battle-earned via Bond Charge, never economy-bought (Combat §3/§4, D6); all Surge motifs are original (AMEND-03 §A3.4). Every kit mechanic maps to an existing foundation invariant or is flagged UNKNOWN — requires sim.

**Governing reminder:** *Document completion does not equal build authorization. Build begins only after Milestone 0 environment/repo/toolchain readiness is approved.*

**v0.1.1 change log (cleanup only):** (1) Rite duration wording corrected to allow further eligible Rites under cooldown/tier gates; (2) added **GDN9** (atomic Rite state transition, no duplication); (3) split save fields into persistent guardian bond/progress + dormant states vs combat-only Bond Charge/Surge state; (4) added **GDN10** (separate save blocks, non-convertible); (5) tightened Quartermaster wording (no direct resource minting); (6) added **GDN11** (kits cannot create new resource sources); (7) field renames (`bond_charge_fill_rate_target`, `bond_charge_reset_or_decay_rule`) and defined `st5_median_completion_variance_max = 0.15`, `st5_tradeoff_required_threshold = 0.20`. No doctrine changes beyond clarification; no new systems.

**v0.1.2 change log:** owner answers **G-D1–G-D6 recorded** (2026-07-11) — see §13; B4 closes document-stage review. No content changes beyond recording decisions.

## 1. Core model (Blueprint)
- **One guardian per playthrough.** The player picks one guardian at world creation (Doc 08); it is their companion for that world. Swapping is possible only via the **Rite of the Changing Tide** (§7).
- **20 guardians designed / 10 at launch** (Blueprint; W-D6). Launch guardians have full active kits + Sanctum interactions; future-wave guardians exist as sealed/lore Sanctum nodes (World Atlas W-D6) until content-unlocked.
- Guardians are **majestic animal spirits** with settlement-scale presence (Art v0.5), never pet mascots.
- Each guardian has a **kit** (§4) built on one of **6 chassis** (§3) and a unique **Guardian Surge** (§5), all within a shared sidegrade budget (§6).

## 2. Flagship trio (from Combat §7, carried as anchors)
| Guardian | Animal | Chassis | Surge sketch (original motifs) | Kit lean |
|---|---|---|---|---|
| **Raxa** | Tiger | Striker | striped light trails, amber-gold flares; breach-clearing burst | precision Tide Chains; bonus vs breached lanes; raid-salvage |
| **Tarin** | Elephant | Bulwark | stone-gold planes, wall glyphs, wave-breaker arcs | guard allies/structures; damage redirection; wall-adjacent power |
| **Nova** | Owl | Oracle | cyan-gold eye sigils, star-map wings, moonlit geometry | weakness reveals; Tide-order insight; timing-assist aura; scouting |

These three are the quality bar and the reference for the chassis frames (§3). The remaining 17 designed guardians slot onto the six chassis with distinct animal identities (roster table §8, working).

## 3. The six chassis (sidegrade frames, from Combat §7)
Each chassis is a **role frame** with a Surge archetype and a Bond-Charge lean. Guardians on the same chassis share a budget envelope but differ in flavor and specific hooks — never in raw power tier (§6).

| Chassis | Role | Surge archetype | Bond Charge lean (how it fills) |
|---|---|---|---|
| **Striker** | burst damage | offensive burst | precision Tide Chains |
| **Bulwark** | protection / control | defensive aegis | guarding allies/structures |
| **Oracle** | insight / tempo | reveal & timing (omen) | exploiting elemental weakness |
| **Warden** | zone / denial | area dominion | sustained pressure / holding ground |
| **Skirmisher** | mobility / initiative | tempo & repositioning | fast successful chains / swaps |
| **Quartermaster** | economy-adjacent utility | requisition / support | protecting harbor assets in raids |

Chassis rules: (a) every chassis can clear all required content with base attacks (C1 — zero-timing viability); (b) each chassis's Surge is bounded in duration/recharge (C3) and works in expeditions and raids (Combat §3); (c) **Quartermaster's "economy-adjacent utility" never mints resources directly** — any reward modifier must attach to an existing approved source/event and remain within the sidegrade budget (§6/GDN11), never buys Bond Charge (D6), and never creates a new faucet (E15).

## 4. Guardian Kit sheet — schema (the B4 deliverable shape)
Every guardian is expressed as a **data-seeded kit sheet**, not hand-coded logic (No Magic Numbers; Doc 07 D39). Schema (field names proposed; types per Doc 07):

```
GuardianKit {
  guardian_id · name_working · animal · chassis[Striker|Bulwark|Oracle|Warden|Skirmisher|Quartermaster]
  launch_wave[launch|future]           // launch = full kit; future = sealed/lore until unlocked (W-D6)
  home_region[region enum]             // Sanctum placement (World Atlas §10)
  identity_line                        // one-line playstyle summary (no-trap-pick, Doc 08 OB5)
  difficulty_tag[Approachable|Standard|Demanding]

  bond_charge_profile {
    primary_source[chassis lean]         // how this guardian mainly fills Bond Charge
    secondary_sources[]                  // diversity so no single dominant source (C4)
    bond_charge_fill_rate_target         // (renamed from fill_rate_target)
    bond_charge_reset_or_decay_rule      // (renamed from decay_between_encounters) — reset/decay between encounters
  }

  guardian_surge {
    name_working · duration_turns_target(2–3) · recharge_target
    effect_hooks[]                       // bounded, chassis-consistent, original motifs (AMEND-03 §A3.4)
    never: [consumes_aether, bought_from_economy, gated_behind_perfect_timing]  // D6, C1/C7
  }

  economy_modifier {                     // the sidegrade knob (Economy §16)
    shifts[]                             // e.g. "+ salvage yield, − ward efficiency" (must attach to an existing source; GDN11)
    st5_median_completion_variance_max = 0.15   // median ST5 completion variance ceiling
    st5_tradeoff_required_threshold     = 0.20   // above this, a documented tradeoff is mandatory
  }

  accessibility {
    assist_parity[true]                  // C2: assist tiers reach comparable outcomes
    cues[shape+icon+text]                // Doc 06, never color/audio-only
  }

  sanctum_ref · provenance               // Sanctum node + art provenance (AMEND-03)
}
```

Every kit sheet must pass the sidegrade budget (§6) and the guardian invariants (§9) before it is considered review-complete. This doc defines the **schema and rules**; the 20 filled sheets are subsequent B4 content (owner-gated, one batch at a time).

## 5. Guardian Surge rules (Combat §3/§4 — restated, not changed)
- Bond Charge is **battle-earned only**; Guardian Surge cannot be charged from the Claim Ledger or any economy resource (D6).
- Surge has a clear bounded duration (target 2–3 turns) + recharge; no perpetual uptime (C3).
- Multiple Bond-Charge sources per guardian so assist-mode players reach comparable Surge rates (C4/C2); never gated behind perfect timing (C1/C7).
- All Surge visuals use **original motifs** (animal sigils, harbor crests, elemental tide rings); no imitated external transformation forms (AMEND-03 §A3.4), with per-asset provenance.

## 6. Sidegrade budget (Economy §16 — the anti-power-creep spine)
- All guardians draw from **one shared budget**; a guardian's `economy_modifier.shifts` must **shift** scarcity/advantage, never erase it or stack pure gains, and must **attach to an existing approved source/event** — never create a new resource source (§GDN11).
- **Median ST5 completion variance ≤ 0.15** (`st5_median_completion_variance_max`); any guardian exceeding `st5_tradeoff_required_threshold = 0.20` needs a **documented tradeoff** (a real cost paid elsewhere), surfaced in its kit sheet.
- No guardian grants early gated-currency access, undocumented ST5 acceleration, or raw stat superiority. Differences are in *how* you play (chassis, Surge, Bond-Charge lean, economy shifts), not *how strong* you are.
- **No trap picks** (Doc 08 OB5): every guardian's kit sheet carries an honest identity line + difficulty tag; no guardian is strictly dominated within its difficulty tag (sim cross-check against E16).

## 7. Sanctums & the Rite of the Changing Tide
- **Sanctum nodes** live on the World Atlas (§10 / W-D6): one per designed guardian, placed in the guardian's home region. Launch guardians' Sanctums are fully interactive; future-wave Sanctums are sealed/lore nodes until unlocked.
- The chosen guardian's Sanctum is thematically "home"; visiting other Sanctums is optional exploration/lore.
- **Rite of the Changing Tide** — the sanctioned guardian-swap ritual, resolved at a Sanctum:
  - Costs per Economy §13 (Aether + Crowns + a quest/condition gate); a deliberate, non-trivial commitment (not a casual respec).
  - Swapping guardians changes the active kit/chassis/Surge **until another eligible Rite is performed, if the world allows further Rites under existing cooldown/tier gates.** It **does not** refund or duplicate rewards, and it **preserves** soulbound Merit and Story Claims (StandingResource/Story protections — L5, FCT1).
  - The state transition is **atomic** (§GDN9): the prior guardian's persistent bond/Sanctum state is preserved (dormant), the new active guardian is applied in one committed step, and no rewards/Merit/Story Claims/progression are duplicated.
  - The Rite is optional; a full playthrough is completable with the starting guardian (one-guardian model).
- Rite economics obey all invariants: Aether comes from settlement storage (D6, never combat), the cost is a real sink (E4/E20), and nothing about the Rite mints resources (E15).

## 8. Working roster shape (structure only, not final)
20 designed guardians across 6 chassis (working distribution; owner G-D2). Flagships fixed (Raxa/Tarin/Nova); the rest are placeholders to be filled one batch at a time:

| Chassis | Launch-wave (target) | Example anchor | Future-wave slots |
|---|---|---|---|
| Striker | 2 | Raxa (Tiger) | +1–2 |
| Bulwark | 2 | Tarin (Elephant) | +1–2 |
| Oracle | 2 | Nova (Owl) | +1–2 |
| Warden | 1–2 | (TBD animal) | +1–2 |
| Skirmisher | 1–2 | (TBD animal) | +1–2 |
| Quartermaster | 1 | (TBD animal) | +1–2 |

Working target: ~10 launch guardians spread so every chassis has at least one launch representative (so any chassis playstyle is available at launch), with the remaining 10 as future-wave. Exact per-chassis counts and animals are content (G-D2/G-D3), filled in later batches.

## 9. Sim invariants (GDN-suite; feeds SIM_HARNESS_ACCEPTANCE_SPEC)
- **GDN1** every guardian is fully data-seeded (kit sheet); no guardian behavior is hard-coded outside approved data/config (mirrors DC1).
- **GDN2** every guardian clears all required content with base attacks only (zero-timing viability; mirrors C1).
- **GDN3** Guardian Surge is battle-earned only — never charged from the Claim Ledger or any economy resource (mirrors D6/C-suite); bounded duration/recharge (C3).
- **GDN4** median ST5 completion variance across guardians ≤ 0.15; any guardian above the 0.20 tradeoff threshold carries a documented tradeoff in its sheet (mirrors E16/§16).
- **GDN5** no guardian is strictly dominated within its difficulty tag (no trap picks; mirrors OB5) and no guardian grants raw stat superiority (sidegrade only).
- **GDN6** the Rite of the Changing Tide is a real sink (Aether+Crowns+gate, Economy §13), never mints/refunds/duplicates rewards, and preserves soulbound Merit + Story Claims (mirrors E15/L5/FCT1).
- **GDN7** all Surge/guardian assets carry original-motif provenance (mirrors AMEND-03 §A3.4); a failed provenance entry blocks the asset.
- **GDN8** assist tiers reach comparable Surge/Bond-Charge outcomes for every guardian (mirrors C2/C4); cues are shape+icon+text (Doc 06).
- **GDN9** the Rite state transition is atomic: it preserves the prior guardian's bond/Sanctum state (as dormant), applies the new active guardian in one committed step, and cannot duplicate rewards, Story Claims, Merit, or guardian progression. A failed/interrupted Rite leaves the prior guardian active (no partial swap, no loss).
- **GDN10** persistent guardian bond state (`guardian_bond_level`/progress, `dormant_guardian_states`) and combat-only state (`bond_charge_state`, `guardian_surge_state`) are **separate save blocks**; save/load cannot convert one into the other (combat-only state persists only inside a turn-boundary suspend snapshot, D16/C8).
- **GDN11** guardian kits cannot create new resource sources. Any guardian reward modifier must attach to an existing approved event/source and remain within the sidegrade budget (mirrors E15/§6); no kit is a hidden faucet.

## 10. Data-seed exports (`/data/guardians/`, No Magic Numbers; types per Doc 07)
`chassis (id, role, surge_archetype, bond_lean) · guardian_kits (full GuardianKit schema per §4) · guardian_surges (name, duration, recharge, effect_hooks, never_flags) · economy_modifiers (shifts, st5_median_completion_variance_max=0.15, st5_tradeoff_required_threshold=0.20) · sanctums (guardian_id, region, sanctum_state[active|lore_sealed]) · rite_of_changing_tide (aether_cost, crown_cost, gate, cooldown/tier_gate, preserves[merit, story_claims], atomic=true) · guardian_save_refs · guardian_invariants (GDN1–GDN11)`. Every value carries id · unit · gate · source section · invariant refs; types against Doc 07 enums (chassis, region, CoreResource for Rite costs, StandingResource for Merit).

## 11. Save/load (split blocks — GDN10)
Guardian state persists in two separate save blocks:
- **Persistent guardian state** (`guardian_persistent`): `active_guardian_id · chassis · guardian_bond_level · guardian_bond_progress · dormant_guardian_states[] (per previously-active guardian: bond_level, progress) · sanctum_discovery[] · rite_history[]`. This is durable world state; Sanctum discovery is persistent/no-loss (mirrors W5).
- **Combat-only state** (`guardian_combat_transient`): `bond_charge_state · guardian_surge_state`. Battle-scoped; **not** persisted between encounters except inside a turn-boundary combat suspend snapshot (Combat §8 / D16 / C8).
Save/load cannot convert combat-only state into persistent bond progress or vice-versa (GDN10). Round-trip preserves the persistent block (active guardian, chassis, bond level/progress, dormant states, Sanctum discovery) and, if mid-combat, the suspend snapshot's transient block (feeds S5).

## 12. What this doc does NOT do
- No final guardian names, animals, lore, or per-guardian numbers — those are subsequent B4 content batches (filled kit sheets), owner-gated.
- No new combat/economy system — only the kit structure, chassis frames, and Rite rules that sit on existing foundation mechanics.
- No final roster counts per chassis — working targets only.
- No implementation authorization; no repo/vault mutation; not canon.

## 13. B4 decisions (G-D1–G-D6) — owner answers recorded 2026-07-11
Decision-register pattern; **planning-locked ≠ canon**. These govern B4 authoring direction only.

| ID | Question | Owner answer (2026-07-11) | Status |
|---|---|---|---|
| **G-D1** | Kit-sheet schema (§4) | Accept the GuardianKit schema as the B4 authoring shape (with the v0.1.1 renames); refine field names during Milestone 0 schema setup (Doc 07/D39). | PLANNING-LOCKED |
| **G-D2** | Launch chassis spread | Every chassis must have at least one launch guardian, so all six playstyles ship at launch. | PLANNING-LOCKED |
| **G-D3** | Roster fill order | Flagships first, then one chassis batch at a time (keeps review tractable). | PLANNING-LOCKED |
| **G-D4** | Rite cost weight | Medium-heavy Aether+Crowns+gate; a real commitment, not a casual respec — sim-tuned later within Economy §13. | PLANNING-LOCKED |
| **G-D5** | Future-wave visibility | Future-wave Sanctums visible as sealed/lore nodes (consistent with W-D6), not fully interactive until unlocked. | PLANNING-LOCKED |
| **G-D6** | Guardian naming | Keep working/placeholder names until a lore/naming pass (parallel to W-D1/F-D1). | PLANNING-LOCKED |

**B4 document-stage: CLOSED (2026-07-11).** Remaining guardian work is content authoring (filled kit sheets), starting with B4A (flagship trio), still document mode.

## 14. Review routing & what comes after B4
Ready for the same document-mode review loop: package check → doctrine-consistency (no contradiction with the closed foundation, B2, or B3) → GDN-suite completeness (GDN1–GDN11) → owner decisions on §13.

**Remaining document-mode work before Milestone 0 readiness** (per the governing build sequence): optional further B4 content batches (filled kit sheets, one chassis at a time) and any remaining B-docs, then the **Milestone 0 Implementation Readiness Packet** — the setup plan, repo scaffold plan, Claude Code operating rules, Git/GitHub workflow, Windows env setup, memory/document-access, schema/data-contract setup, sim-harness + claim-to-test setup, and the alpha/beta/production-readiness gates. Those are document-mode planning artifacts too — none authorize a build.

*Reminder repeated by design: document completion does not equal build authorization; build begins only after Milestone 0 environment/repo/toolchain readiness is approved.*

*DRAFT v0.1.2 — FUTURE BUILD. Approved-for-revision; not canon; not implementation authorization; not merged. B4 of Phase B; builds on the closed foundation set + B2 + B3; structure/schema only, per-guardian content tuned later.*
