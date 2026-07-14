---
title: "Combat & Guardian Surge Foundation"
doc_id: "02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION"
version: 0.5-DRAFT
date: 2026-07-09
status: DRAFT v0.5 for owner review — fully expanded (D21). APPROVED-FOR-REVISION; not canon.
source: "Blueprint v6.0 §10; Decision Register D1–D22; AMEND-03 v0.4; Doc 04 v0.4; Save/Load v0.5"
bundle_version: v0.5.2
classification: FUTURE BUILD
supersedes: "02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION v0.1–v0.4"
---

# Combat & Guardian Surge Foundation v0.5

## 1. Where this sits
Initiative Tide (Blueprint §10) is the combat spine: fully visible turn bar, push/pull turn manipulation, free party swaps, elemental wheel (Fire/Frost/Storm/Earth/Radiant/Umbral), bond-fed Tide Surge slot-shoves. This doc adds the active-execution layer (**Tide Chain**, D4) and the transformation layer (**Guardian Surge**, D9), fueled by **Bond Charge** (D5). Relationship: **Tide Chain builds Bond Charge; Bond Charge powers Guardian Surge.**

## 2. Tide Chain (D4)
Optional timed input sequence on a basic or guardian-assisted strike. Binding: (1) the base attack **always resolves** — timing affects bonus only; (2) success adds bonus damage · status chance · Bond Charge · bond gain; (3) a miss never drops base progression below the safe minimum; (4) chain length grows with Hero level + bond (1 → up to 4–5 links; curve = prototype); (5) accessibility can simplify or auto-complete at reduced bonus (§5); (6) mobile touch is first-class from day one; (7) prompts use shape+icon+text+motion, never color- or audio-only. Targets (prototype): window ≥400ms desktop / ≥500ms touch; assist widens ×1.5–2.0; auto-complete ≈60–70% of manual bonus.

## 3. Guardian Surge (D9), fueled by Bond Charge (D5)
Limited, high-impact, guardian-specific battle state — not a permanent form, species identity, or external transformation copy. Binding: (1) Bond Charge sources are **battle-earned only** — successful Tide Chains, guarding allies/structures, exploiting elemental weaknesses, protecting structures in raids, guardian-specific triggers; (2) **does not consume settlement Aether** (D6); (3) clear duration (target 2–3 turns) + recharge, no perpetual uptime; (4) unique identity per guardian; (5) original motifs only (animal sigils, harbor crests, elemental tide rings) per AMEND-03 §A3.4; (6) works in expeditions and raids; (7) never gated behind perfect timing — multiple charge sources keep assist-mode players at comparable (sim-verified) rates. **Guardian Surge cannot be charged from Claim Ledger resources or any economy resource.**

## 4. Combat / economy separation (D6)
Bond Charge is not an economy resource: no faucet buys it; it never converts to Crowns/Provisions/Iron/Aether except through defined loot tables delivered as Claim Ledger reward packages; it resets/decays between encounters per tuning. Aether touches combat only via pre-battle prep (wards, enchanted gear, route protection). Economy invariant E15 + Ledger L1 govern the reward side.

## 5. Accessibility modes (D10 — from first prototype)
Motor: assist timing / slower prompts / wider windows. Visual: high-contrast indicators, reduced-effects mode. Colorblind: shape+icon+text, never color-only. Hearing: no audio-only timing. Mobile: touch-friendly zones, no tiny precision UI. Fatigue/casual: auto-resolve at reduced bonus. Every timing feature ships its assist path in the same build. **Training arena / practice dummy exists before balance tuning; input-latency calibration (desktop + mobile) exists before any public playable claim.** A zero-timing player can finish all required content; manual timing only improves efficiency, spectacle, or optional mastery rewards.

## 6. Combat rewards → delivery routing (D20)
| Reward from combat | Delivery |
|---|---|
| Bond Charge | In-battle, combat-only; never economy |
| Bond XP / Merit | Auto-apply as receipts (never the Ledger) |
| Resource loot | Reward package → Claim Ledger → claimed under Safe/Exposed/Total |
| Physical cargo (expeditions) | Ship Hold / Docked Cargo (Doc 04B, planned) |
| Gear | Inventory / gear locker |
| Story reward | Protected Story Claim |
Raid victory packages are created after the battle result screen. Nothing raises a resource total except via defined claimable packages (E15 + L1). Invariants CARGO1/CARGO2 bind routing.

## 7. Per-guardian Surge hooks (flagship trio; chassis rules govern the rest)
| Guardian | Surge sketch | Bond Charge lean | Gameplay tie |
|---|---|---|---|
| Raxa (Tiger, Striker) | Striped light trails, amber-gold flares; breach-clearing burst | Precision Tide Chains | Bonus vs breached lanes; raid-salvage identity |
| Tarin (Elephant, Bulwark) | Stone-gold planes, wall glyphs, wave-breaker arcs | Guarding allies/structures | Damage redirection + wall-adjacent power |
| Nova (Owl, Oracle) | Cyan-gold eye sigils, star-map wings, moonlit geometry | Weakness exploitation & reveals | Tide-order insight, timing-assist aura, post-ST4 Aether synergy |
Chassis Surge frames (Striker burst / Bulwark aegis / Oracle omen / Warden dominion / Skirmisher tempo / Quartermaster requisition) live in the Kit Sheets; each fits the flat chassis budget.

## 8. Mobile-safe combat suspend/resume (D16 — Option B)
The game may create a **local combat suspend snapshot at safe turn boundaries** — not economy persistence, not farmable. Snapshot includes battle state, Bond Charge, turn order, HP/status, enemy state, and the generated loot seed. On reload the player resumes the same battle state or exits with the defined retreat outcome. The snapshot cannot reroll loot or replay reward results; the Claim Ledger receives rewards only after battle-result finalization. If the snapshot corrupts, fall back to the safe retreat outcome. Persistence: `SAVE_LOAD_TIME_RECONCILIATION_SPEC` §13.

## 9. Sim invariants (C-suite)
C1 base-progress-without-timing (zero-timing run clears required content) · C2 assist parity · C3 Guardian Surge uptime bounded · C4 Bond Charge source diversity (no single dominant source) · C5 mobile input pass · C6 training-mode before balance tuning · C7 latency calibration before public playable claim · **C8 combat suspend/resume cannot duplicate rewards, reroll loot, or convert Bond Charge into economy resources**.

*DRAFT v0.5 — self-contained; approved-for-revision; not merged. FUTURE BUILD.*
