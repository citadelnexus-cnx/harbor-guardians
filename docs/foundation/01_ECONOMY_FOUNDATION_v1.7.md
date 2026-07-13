---
title: "Economy Foundation"
doc_id: "01_ECONOMY_FOUNDATION"
version: 1.7-DRAFT
date: 2026-07-09
status: DRAFT v1.7 for owner review — F-1 resolution: E21 (end-of-pulse display consistency) promoted from Sim Harness into the economy invariant list, closing the claim-to-test provenance gap. No mechanics changed. Self-contained (D21). APPROVED-FOR-REVISION; not canon.
supersedes: "01_ECONOMY_FOUNDATION v1.6"
authority: Layer-1 canon only after owner approval + authorized merge.
source: "Blueprint v6.0; Decision Register D1–D22; AMEND-02 v0.5.1; AMEND-03 v0.4; Doc 04 v0.4; Doc 04A v0.3"
bundle_version: v0.5.2
classification: FUTURE BUILD — every number is a design target pending sim validation
supersedes: "01_ECONOMY_FOUNDATION v1.2–v1.5 (retired)"
---

# Economy Foundation v1.7

## 1. Purpose & authority
Implements Blueprint + AMEND-02 v0.5.1 doctrine. Amendments and Docs 04/04A win on conflict. Approved-for-revision only; no merge without a separately authorized session.

## 2. Source doctrine
Harbor operations not refill · four time layers (per-pulse rates; pulse length sim-tuned) · **Safe S / Exposed 2S / Total 3S for all core resources incl. Crowns** · online+offline to 3S · **exposed surplus raidable (incl. Crowns); safe storage + Merit never raidable** · Universal Claim Ledger (Doc 04) · Harbor Manifest + System Inbox (Doc 04A) · Aether settlement-only, combat = Bond Charge · no hidden loss · claim-to-test.

## 3. Resource Identity Map
| Resource | Identity | Failure pressure | Recovery |
|---|---|---|---|
| Crowns | Liquidity; safe if Vaulted, at-risk if exposed | Debt; exposed-Crown raid loss; trade loss | Sell goods, quests, contracts, claim rewards |
| Provisions | Population/travel pressure | Starvation stalls, expedition limits | Farms, docks, market, reassign |
| Iron | Structural commitment | Weak defenses, repair backlog | Mines, salvage, trade |
| Aether | Volatile strategic power | Ward failure, Rite delay | Spire, leylines, guardian utility |
| Merit | Soulbound contribution record | Rank/treaty delay | Quests, raids, contracts, receipts |

Starting stock (owner-approved): Crowns 200 · Provisions 150 · Iron 100 · Aether 0 · Merit 0/faction.

## 4. Time Layer Model
World Clock (real 24h) · Simulation Tick (internal) · Economy Pulse (player-facing, sim-tuned) · Action Timers. Rates below are per pulse (pp). Session targets: ST1 ≤5 min visible change; ST2–3 one activity in 10–15 min; ST4–5 gates always expose a short-session action.

## 5. Harbor Operations Chain
`source → operating building/activity → worker/crew/route → throughput → storage state (safe → exposed → hard stop at 3S) → sink/risk`.

## 6. Worker & Building States
Worker: Active/Unfed/Unpaid/Idle/Disabled. Pulse order: (1) eligibility from prior pulse + debt → (2) Active workers produce → (3) fill Safe, then Exposed, hard-stop at 3S → (4) upkeep pays food/wages/maintenance → (5) next-pulse states set → (6) ledger + world-clock stamp. Building: Operating/Idle/Stalled/Disabled/Under-repair.

## 7. Storage — 3S uniform incl. Crowns
| Resource | Store | ST1 S | ST5 S | ST10 S | Total (3S) | Exposed behavior |
|---|---|---|---|---|---|---|
| Crowns | Vault + counting-yards | 500 | 3,000 | 20,000 | 1,500 / 9,000 / 60,000 | Exposed surplus raidable; NO decay/leak |
| Provisions | Granary + yards | 300 | 1,800 | 10,000 | 900 / 5,400 / 30,000 | Spoils −10%/pp exposed; raidable |
| Iron | Ironworks + stacks | 300 | 2,000 | 12,000 | 900 / 6,000 / 36,000 | No decay; raidable; idles at 3S |
| Aether | Crystal + leybanks | 200 (ST4) | 1,200 | 6,000 | 600 / 3,600 / 18,000 | Leaks −15%/pp exposed; raidable/drainable |

Safe Vault Crowns protected; exposed Crown surplus (counting-yards) raidable but never decays/leaks. The Claim Ledger (§10) is the relief valve for unclaimed earned Crown rewards.

## 8. Online & Offline Reconciliation (D7)
Production continues online/offline to 3S; Offline Return Report itemizes gains/exposed/upkeep/stalls/blocked-at-3S; no offline Assault. Technical rules: `SAVE_LOAD_TIME_RECONCILIATION_SPEC`.

## 9. Resource chains (summary)
Provisions: Farm/Fishing (+8/+10 pp per Active worker) → Granary → yards → feeding/rations/siege/trade. Iron: Mine (+6 pp) + salvage → Ironworks → stacks → construction/walls/maintenance/Steel(2→1,ST7)/hulls/repairs. Aether: Spire(+5,ST4)+leylines(+3,ST5)+post-ST4 utility → Crystal → leybanks → wards(−2 pp)/enchanting/Rite(150 Aether+300 Crowns+quest). Crowns: Market/quests(40–150)/loot(60–200)/contracts(ST5,100–300) → Vault → buildings/wages(−2 pp)/crafting/tavern/ships/repairs; exposed surplus in counting-yards. Merit: recorded acts (§17).

## 10. Crowns / Claim Ledger / Market / Docks
Claim Ledger (summary; full rules Doc 04): holds eligible earned reward packages; 5/resource + 20 global; Story Claims separate/protected/finite; partial claim; raid-phase matrix; Reward Delivery Resolution Screen + persistent pending state for full slots. Never enters: passive/market/dock overflow, cargo, Merit/XP/Bond. Market: a sale exceeding Crown 3S is blocked by default; optional "allow exposed Crown surplus" sells into exposed up to 3S; excess never silently deleted (explicit confirm). Docks: purchase blocked if no safe/exposed room; may buy into exposed with warning; never exceeds 3S. Conversions (all round-trips ≤0.60×): Market Prov→0.8, Iron→1.2; Docks 1.5→1 Prov, 2.0→1 Iron; Steel one-way.

## 11. Provisions / Iron / Aether / Bond Charge
Upkeep −1 pp/worker (Provisions) + −2 pp/worker (Crowns wages) from ST1; rations `20+10×regions`; wall maintenance −1 pp/segment after a stable Iron faucet; repair `ceil(base×missing_dur%×0.35)`; ships S1–S4 (400C+300I / 1,200C+900I / 3,000C+600Steel), holds 150/400/1,000/2,500. Aether settlement-only + fairness guard. Bond Charge combat-only; no economy faucet buys it; converts to economy only via defined loot tables delivered as Claim Ledger reward packages where eligible.

## 12. Raids / threat / loss / repairs
`loss = floor(exposed_surplus_current × severity_rate)`, severity {0.25,0.50,0.75,1.00}; applies to all core exposed resources incl. Crowns; safe storage + Merit untouched; structure durability damage 10/20/35/50%; Critical disables one production building until repaired. Readiness/threat fields per AMEND-02 A2.5. Full orchestration → planned Doc 05.

## 13. Expedition reward routing (D20 — explicit)
| Expedition output | Routing |
|---|---|
| Completion bounty | Claim Ledger |
| Faction/objective reward | Claim Ledger |
| Story reward | Story Claim |
| Physical salvage/cargo collected during voyage | Ship Hold → Docked Cargo (Doc 04B, planned) |
| Gear drop | Gear locker/inventory |
| Merit / Bond XP | Auto-applied receipt |
Invariants CARGO1/CARGO2 (AMEND-02 A2.12) bind this table.

## 14. Merit / receipts / repeat controls
Soulbound; no receipt no Merit (world-clock-stamped schema); world-day refresh; diminishing returns by repeat_group_id; tier rank caps; faction cooldowns; objective > repeatable. Ladder (owner-kept): Moored 500 · Anchored 1,500 · Charted 4,000; rival slow −25% future gain, never retroactive.

## 15. Tavern (D3)
Knuckles (easy, clear sink, EV <1.00) · Tide-Toss (median, ≤1.00) · Deepstakes (hard, rare high payout, EV ≤1.00 v1). Hard controls: per-attempt + per-world-day stake caps · no offline play · no automation · no balance-scaled stakes · never the optimal ST1→ST5 path · no real money · timing elements carry full assist options.

## 16. Guardian economy budgets
Sidegrades, one shared budget; shift scarcity, never erase it; no early gated-currency access; no undocumented ST5 acceleration; median ST5 variance ≤12–15%, >20% needs a documented tradeoff.

## 17. Sim invariants (economy)
E1 no parked-at-3S accumulation pattern ST1→ST5 · E2 conversions strictly lossy (numeric) · E3 idle decays floor at soft-stall (no negatives, no lost workers) · E4 sink capacity ≥ faucet output per tier · E5 offline stops at 3S; exposed accrues offline only as production overflow, never reward duplication · E6 Merit + safe-stored Crowns raid-immune; exposed Crowns raidable · E7 raid loss ≤ exposed surplus of any core resource; safe storage untouchable · E8 pacing band [UNKNOWN→measured] · E9 no soft-lock · E10 Merit never purchasable · E11 tavern not a faucet · E12 raid warning fairness · E13 failed-raid recoverability · E14 structure damage bounded by tier budget · E15 combat faucet dominance bounded · E16 guardian variance band · E17 tavern exploit · E18 hazard routes never strictly superior · E19 offline trust · E20 sink desirability · E21 end-of-pulse display consistency: offline and online runs with the same seed and elapsed time produce the same final visible stock after production, exposed decay/leak, upkeep, and ledger recording (online==offline; Provisions/Aether may legitimately settle below 3S because decay/leak applies after production in the final pulse). Mirrors SIM_HARNESS_ACCEPTANCE_SPEC E21. Claim-Ledger L-suite, message M-suite, combat C-suite, and CARGO invariants live in their docs + the Sim spec.

## 18. Data-seed exports (`/data/economy/`, No Magic Numbers)
`currencies · storage_states (S/2S/3S incl. Crown exposed/raidable/no-decay) · faucets · sinks · conversions · upkeep · worker_states · building_states · time_model · offline_rules · raids · market_overflow_rules · dock_overflow_rules · ship_economy · expedition_reward_routing · merit · tavern · guardian_economy_modifiers · sim_personas · sim_reports_schema · sim_invariants`. Every value carries id · resource · amount|formula · unit · gate · offline behavior · storage-state behavior · source section · invariant refs. Canon + seeds move in one authorized PR.

*DRAFT v1.7 — self-contained; approved-for-revision; not merged. FUTURE BUILD.*
