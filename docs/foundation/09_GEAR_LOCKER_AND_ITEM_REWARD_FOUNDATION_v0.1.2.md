---
title: "Gear Locker & Item Reward Foundation"
doc_id: "09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION"
version: 0.1.2-DRAFT
date: 2026-07-10
bundle_version: v0.1.2-dependency
status: DRAFT v0.1.2 for owner review — metadata cleanup: H1/version drift fixed. GEAR6 craft/enchant/salvage anti-loop; explicit gear-overflow resolution actions. APPROVED-FOR-REVISION; not canon; no repo/vault mutation.
source: "Decision Register D1–D22; AMEND-03 v0.4 (safety: no paid power); 02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION v0.5 (§6 gear routes to inventory/locker); 01_ECONOMY_FOUNDATION v1.7 (Forge crafting, Aether enchanting); 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 (gear applies on claim); SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5; SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2"
classification: FUTURE BUILD — all numbers are design targets pending sim validation
blocks: "gear reward routing / inventory / equipment / loot persistence implementation"
---

# Gear Locker & Item Reward Foundation v0.1.2

**Why this exists:** Combat §6 and Economy route **gear → inventory/gear locker**, and the Claim Ledger applies gear grants "on claim, not into resource storage" (Doc 04 §4). But the gear system itself was never founded. This doc founds it: what a gear item is, where it lives, how duplicates and claims behave, and the hard no-pay-to-power rule.

## 1. Scope & separation
Covers gear items: equipable/consumable non-resource reward objects (weapons, armor, trinkets, charms, consumables). Gear is **not** a currency and **not** cargo: it never occupies resource storage (Safe/Exposed/Total), never enters ship hold as cargo, and is limited by **inventory/locker slots**, not by 3S. Gear reward *routing* is declared per reward line (CARGO2 / RewardRoute `gear_locker`).

## 2. Gear item schema
```
GearItem {
  item_id · def_id (references a gear definition seed)
  slot_type: weapon | armor | trinket | charm | consumable
  rarity: common | uncommon | rare | mythic
  stackable: bool           // consumables typically stack; equipables do not
  stack_count?              // only if stackable
  affixes[]?                // rolled modifiers (deterministic from a seed)
  bound: bool               // soulbound-on-pickup? (design choice, §6)
  enchant_state?            // set by Forge/Aether enchanting (Economy §13)
  source_rule_id · acquired_world_clock
}
```
Gear definitions live in seeds; instances carry rolled state. All rolls are seeded for sim replay.

## 3. Gear Locker (storage)
- The **Gear Locker** is slot-based storage for gear, separate from resource storage and cargo.
- **Slot model (v1 target):** a generous but finite locker (target `locker_slots` [sim-tunable]); equipables occupy one slot each, stackable consumables share a slot up to a stack cap.
- **Over-capacity behavior:** if a claimed gear item would exceed locker slots, it enters the **same persistent pending-resolution pattern as rewards** (Doc 04 §10); gear is **never silently deleted** (no-hidden-loss). The **gear-overflow resolution actions (P7)** are exactly: **Equip** (place on Hero/guardian, freeing no locker slot but resolving the item) · **Move to Locker** (if a slot is freed) · **Salvage** (convert via §5, strictly lossy) · **Discard with confirmation** (explicit two-step confirm; logged) · **Keep Pending** (leave in persistent pending resolution; does not block normal management, but blocks new gear-generating reward claims until resolved, mirroring Doc 04 §10 scope).
- Equipped gear (on the Hero/guardian) is tracked separately from locker slots.

## 4. Claim routing from combat/rewards
- A combat/reward line routed `gear_locker` delivers the gear on **claim** (Claim Ledger package with a `gear_ref`, Doc 04 §4) — the item materializes in the locker when the player claims the package, obeying §3 capacity.
- Gear never raises a resource total and never converts to Crowns except via an explicit **salvage** rule (§5).
- Merit/Bond XP/Bond Charge remain auto-receipts, never gear (Combat §6).

## 5. Duplicates, salvage & stacking
- **Duplicate equipables:** allowed to exist; the player may keep, salvage, or discard. No auto-delete.
- **Salvage:** an optional rule may convert unwanted gear into a small Crowns/Iron reward package (Claim Ledger) — a *sink-friendly* dead-end, never a loop that inflates (respects Economy arbitrage/no-inflation invariants). Salvage yield is a data-seed target and is **bounded so expected salvage value stays below total craft+enchant input value** (GEAR6).
- **Stacking:** consumables stack to a cap; equipables never stack.

## 6. No pay-to-power & fairness (AMEND-03 A3.5)
- No gear is purchasable with real money; no paid boosts; no premium-only power tiers.
- Mythic gear is earnable through play only; power budgets are bounded so gear is a *sidegrade/progression* aid, not an unbounded power spike (mirrors the guardian sidegrade philosophy, Economy §16).
- Enchanting (Economy §13, Aether sink) modifies gear within bounded budgets; it never bypasses the fairness cap.

## 7. Save/load & migration
- Gear Locker persists as a `gear_locker` save block: `items[] (full GearItem instances) · equipped_refs[] · locker_slots`. Pending gear-over-capacity uses the shared `pending_reward_resolution` pattern (Save/Load §11).
- All gear rolls are seed-derived so a reload cannot reroll affixes (parity with the combat loot-seed rule, C8).
- Round-trip preserves gear instances, stacks, equip state, and enchant state (S5).
- Schema changes follow the migration pattern (Save/Load §14, No Magic Numbers).

## 8. Sim invariants (GEAR suite; feeds SIM_HARNESS_ACCEPTANCE_SPEC)
- **GEAR1** gear never enters resource storage or ship cargo; it is slot-bound, not 3S-bound.
- **GEAR2** gear delivers only on claim of its Claim Ledger package; over-capacity gear uses persistent pending resolution and is never silently deleted.
- **GEAR3** no gear roll can be re-rolled by save/load (seed-derived).
- **GEAR4** no pay-to-power path exists (static scan, mirrors S3); gear power stays within the bounded budget.
- **GEAR5** salvage is strictly lossy/dead-end and cannot form an inflationary loop (numeric check, mirrors E2).
- **GEAR6** craft/enchant/salvage anti-loop: for any item, **expected salvage value < total resource input value** of crafting + enchanting that item (i.e. craft → enchant → salvage always nets a loss). The numeric check sums Forge/Aether inputs (Economy §13) against expected salvage yield across the affix/rarity distribution; no seed configuration may make the loop non-lossy.

## 9. Data-seed exports (`/data/gear/`)
`gear_definitions · affix_tables (seeded) · rarity_tiers · locker_slots · stack_caps · salvage_yields (bounded < craft+enchant input, GEAR6) · overflow_resolution_actions (equip|move_to_locker|salvage|discard_confirm|keep_pending) · enchant_bounds · gear_save_schema · gear_invariants`. Every gameplay value follows No Magic Numbers (Doc 07).

## 10. Open questions for owner
1. **Bound-on-pickup?** Should mythic/story gear be soulbound (like Merit-adjacent identity) or freely salvageable? Recommended: story/mythic soulbound; common–rare salvageable.
2. **Locker size model:** finite generous slots (recommended) vs effectively unlimited with UI filtering.
3. **Guardian-specific gear:** does some gear key to the chosen guardian/chassis, or is all gear Hero-equipped? Recommended: mostly Hero-equipped, a few guardian-flavored trinkets.

*DRAFT v0.1.2 — FUTURE BUILD. Approved-for-revision; merge requires a separately authorized session. Required before gear/inventory/loot-persistence implementation.*
