---
title: "Sim Harness Acceptance Specification"
doc_id: "SIM_HARNESS_ACCEPTANCE_SPEC"
version: 0.6.2-DRAFT
date: 2026-07-09
bundle_version: v0.5.3-microcleanup
status: DRAFT v0.6.2 for owner review — E21 now has a matching economy-doc invariant (Economy v1.7), closing the F-1 provenance gap; v0.5.1 cleanup (E21, L15, OPS1, S7) + micro-cleanup CARGO1/CARGO2 doctrine-sync. APPROVED-FOR-REVISION; not canon.
source: "HG-BLUEPRINT-AMEND-02_v0.5.1 + HG-BLUEPRINT-AMEND-03_v0.4 + 01_ECONOMY_FOUNDATION_v1.7 + 02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION_v0.5 + 03_BUILD_QUEUE_AND_HARBOR_OPERATIONS_FOUNDATION_v0.4 + 04_REWARD_CLAIM_LEDGER_FOUNDATION_v0.4 + 04A_HARBOR_INBOX_AND_SYSTEM_MESSAGES_FOUNDATION_v0.3 + SAVE_LOAD_TIME_RECONCILIATION_SPEC_v0.5 + 00_DECISION_REGISTER_v0.2; v0.5 independent audit P1 fixes"
classification: FUTURE BUILD
supersedes: "SIM_HARNESS_ACCEPTANCE_SPEC v0.1–v0.5"
---

# Sim Harness Acceptance Spec v0.6.2

**Doctrine:** no gameplay claim is permitted anywhere (docs, store copy, README, chat) without a test, sim invariant, or acceptance proof. Unproven statements are labeled FUTURE BUILD or UNKNOWN. This document restates every invariant in full — it does not rely on "carried forward" references, so it can be read standalone.

## 1. Claim-to-test map
| Claim | Proof |
|---|---|
| 10–15 min session loop | Playwright sessions + sim persona traces |
| No runaway economy | Headless ST1→ST5 sim, full persona matrix |
| Offline is fair | Reconciliation tests 8h/24h/72h |
| Raids telegraphed | Threat-state tests (no skipped Warning; no offline Assault) |
| Exposed Crowns raidable, safe Crowns protected | Raid-target tests on Crown safe vs exposed |
| Claim Ledger is a valve, not storage | L-suite |
| System Inbox holds no resources; is not economic truth | M-suite (incl. M9) |
| No hidden loss | Ledger completeness tests |
| Timing accessible | Settings + assist parity + training-mode + latency-calibration |
| Every guardian viable | Per-guardian variance (all 20) |
| No purchasable power | Static config scan + monetization non-goal test |
| No external dependency | Offline launch/save/load (network disabled) |
| No copied assets | Provenance checklist 100% |
| Combat suspend/resume safe | C8 |
| Pending rewards persist and never exploit | L11 + L14 |
| Pending never freezes mandatory defense | L15 |
| Offline long-absence converges correctly | E21 + clamp-convergence tests (72h/7d/14d) |
| Cancel/refund routes safely | OPS1 |
| Crash-safe saves | S7 |

## 2. Harness architecture
Deterministic, seedable, rendering-free core (`/src/sim`); headless in CI; consumes only schema-validated data seeds (No Magic Numbers — CI fails on unapproved constants outside approved data/config modules); every batch emits the §5 report as machine-readable JSON + human summary; a failed invariant blocks the PR.

## 3. Persona matrix (every economy batch runs all)
Casual Collector · Hoarder · Spender · Defender · Explorer · Trader · Tavern Grinder · Insolvent · Guardian Bias Runs (one per guardian, all 20) · Offline Returner (8h/24h/72h) · Claim Hoarder (probes Ledger caps + pending state) · Message Hoarder (probes inbox↔ledger separation + retention/compaction).

## 4. Invariant suites (restated in full)

### 4.1 Economy suite (E1–E20)
- **E1** No unbounded inflation: no spendable currency trends parked-at-3S-Total across ST1→ST5.
- **E2** Conversions strictly lossy: no sequence returns net ≥1.0× in any currency (numeric proof; all round-trips ≤0.60×).
- **E3** Idle decay floors at soft-stall: an unmanaged run never goes negative and never loses workers.
- **E4** Sink capacity ≥ faucet output at each tier.
- **E5** Offline accrual respects cap: offline production stops at 3S Total; exposed surplus accrues offline only as production overflow, never as reward duplication.
- **E6** Merit and safe-stored Crowns are raid-immune; exposed Crown surplus is raidable.
- **E7** Raid loss ≤ current exposed surplus of any core resource; safe storage untouchable.
- **E8** Progression pacing within target band [UNKNOWN — measured at Milestone-0+, then enforced].
- **E9** No soft-lock: insolvency always recovers with normal play.
- **E10** Merit never purchasable (static + runtime check).
- **E11** Tavern is not a faucet: `expected_hourly_gain = attempts/hr × stake × (EV−1)`; Deepstakes below 25% of base Mine Crowns-equivalent/hr, or ≤0 while no skill model exists; no Tavern route is the optimal ST1→ST5 path.
- **E12** Raid warning fairness: no raid resolves without a visible Warning/preparation phase.
- **E13** Failed-raid recoverability: no failed raid creates an unrecoverable state.
- **E14** Structure damage bounded: repair cost after a failed raid cannot exceed the tier recovery budget.
- **E15** Combat faucet dominance: expedition/raid rewards may spike but cannot dominate settlement production beyond allowed burst windows.
- **E16** Guardian economy budget: no guardian exceeds the ST5 variance band (12–15% median target; >20% flags) without a documented tradeoff.
- **E17** Tavern exploit: no Tavern strategy becomes the optimal economy path.
- **E18** Hazard routes never strictly superior for all same-tier players.
- **E19** Offline trust: return never auto-resolves hidden raids or applies hidden punitive loss.
- **E20** Sink desirability: available sinks are rationally attractive to sim agents (walls when raids threaten, Vault when the cap bites, ship when hold/range blocks rewards, wards when they save measurable cost).
- **E21** End-of-pulse display consistency (P1.2; now also formalized as Economy v1.7 invariant E21): offline and online runs with the same seed and elapsed time produce the same final visible stock after production, exposed decay/leak, upkeep, and ledger recording. Provisions/Aether may legitimately settle **below** 3S because decay/leak applies after production in the final pulse; the test asserts online==offline, not stock==3S.

### 4.2 Claim Ledger suite (L1–L15)
- **L1** Ledger transfer-only (cannot increase resource totals).
- **L2** Ledger not spendable directly (must claim into Harbor first).
- **L3** Held rewards cannot be raided.
- **L4** Claimed exposed resources can be raided.
- **L5** Story Claims never disappear (survive raids, offline, save/load, long absence).
- **L6** Partial-claim math preserves totals exactly: `claimed + held_remainder == original`.
- **L7** Multi-resource slot accounting correct (5 per resource + 20 global non-story).
- **L8** No claim during raid Assault.
- **L9** Claiming to Exposed during Warning raises the exposed-risk preview.
- **L10** Ineligible sources never enter the Ledger (production/market/dock overflow, cargo, Merit, XP, Bond XP, Bond Charge, direct build/repair payments).
- **L11** Full-slot delivery never deletes or duplicates a reward; unresolved pending rewards cannot be exploited as unlimited storage.
- **L12** Story Claims are finite, non-repeatable, non-compounding, cannot become repeatable protected storage.
- **L13** v1 system grants exist only via an approved migration/recovery/test path (production build-flag guarded; see §4.6 S6).
- **L14** `pending_reward_resolution` **persists across save/load and offline** exactly as generated (no loss, no duplication, no reroll); while a pending reward blocks, only new *optional* reward-generating activities are locked, and resolving it restores normal flow.
- **L15** Pending rewards cannot freeze mandatory threat resolution (P1.4): an unresolved pending reward may block optional reward generation, but can never indefinitely suspend a required defensive raid or story-critical resolution event; such events resolve and may themselves enter pending resolution if caps remain full.

### 4.3 Messages suite (M1–M10)
- **M1** Messages cannot contain resource amounts or spendable resources directly.
- **M2** Archiving/deleting a message cannot delete a Claim Ledger package.
- **M3** A system grant creates exactly one Claim Ledger package and one referencing message; no duplicate grants.
- **M4** The Offline Return Report message is generated after offline reconciliation and matches the ledger/report record.
- **M5** A Raid Warning message appears before Assault eligibility; no hidden raid warning.
- **M6** A Migration Notice persists after save-schema migration and names the migrated systems.
- **M7** Critical messages persist until acknowledged; low-priority may archive only after read.
- **M8** System Inbox save/load round-trip preserves read/archive state and related package links.
- **M9** **Authoritative-report boundary:** a message may *display* a summary, but economic truth is read from the ledger/report record it references (`related_ids`), never from the message body. A discrepancy between a message summary and the underlying record is always resolved in favor of the record, and flagged.
- **M10** **Retention/compaction:** auto-archive and compaction never delete an unacknowledged critical/high message, never delete a permanent Migration Notice, and never sever a live `package_id` link; compaction only collapses already-read low/normal messages per the retention policy.

### 4.4 Combat suite (C1–C8)
- **C1** Base-progress-without-timing: a zero-timing run completes the reference expedition set.
- **C2** Assist parity: assist-mode clear rates within the approved band of manual play.
- **C3** Guardian Surge uptime bounded (duration/cooldown honored).
- **C4** Bond Charge source diversity: no single source exceeds the dominance threshold.
- **C5** Mobile input pass: touch-target and window minimums met.
- **C6** Training mode exists before balance tuning.
- **C7** Input-latency calibration exists before any public playable claim.
- **C8** Combat suspend/resume cannot duplicate rewards, reroll loot, or convert Bond Charge into economy resources.

### 4.5 Cargo suite (CARGO1–CARGO5)
- **CARGO1** — physical cargo never enters the Claim Ledger. A source rule may choose Claim Ledger instead of physical cargo at generation time, but once a line is routed to Ship Hold / Docked Cargo, it cannot later be converted or re-routed into the Claim Ledger.
- **CARGO2** — every expedition reward line must declare exactly one route at generation time: Claim Ledger, Story Claim, Ship Hold / Docked Cargo, Gear Locker, or Auto-Receipt. A line routed to physical cargo remains physical cargo until unloaded, lost through a governed cargo rule, or resolved through the Docked Cargo system.
- **CARGO3** — loot exceeding hold capacity is left at source, never silently stored and never Ledger-routed. *(registered as a fail-loud stub until cargo implementation)*
- **CARGO4** — Docked Cargo obeys exposed-surplus raid/spoilage/leak rules; unloading obeys Safe/Exposed/Total 3S; partial unload preserves totals (`unloaded + left_on_dock == arrived`). *(registered as a fail-loud stub until cargo implementation)*
- **CARGO5** — no hidden cargo loss: every spoilage/leak/raid/left-behind event is ledger-logged; the pressure timer only moves cargo to Needs Resolution (blocking new voyages from that ship/dock), and **never hard-deletes cargo**. *(registered as a fail-loud stub until cargo implementation)*

(Full model in `04B_SHIP_HOLD_AND_DOCKED_CARGO_FOUNDATION` v0.1.2, which defines CARGO1–CARGO5.)

### 4.6 Trust & safety suite (S1–S7)
- **S1** Ledger completeness: every economic delta has a world-clock-stamped ledger entry.
- **S2** No network calls on launch/save/load with network disabled.
- **S3** Static scan: no monetization hooks, no paid-power config paths.
- **S4** Accessibility settings persist and apply from the first prototype.
- **S5** Save/load round-trip preserves world clock, storage states (safe/exposed incl. Crowns), threat phase, build/repair queues, Claim Ledger (incl. Story Claims + partial remainders + `pending_reward_resolution`), System Inbox (read/archive + package links), combat suspend snapshot if present.
- **S6** **Production build-flag guard:** system-grant code paths are compiled out / disabled under the production build flag except approved migration/recovery paths; a test asserts no dev/debug grant path is reachable in a production build.
- **S7** **Atomic save integrity (P1.6):** all saves use atomic write semantics (temp write → schema validate → flush → rename/swap → preserve prior good save); a simulated crash during save never corrupts the last known-good save and never duplicates rewards.

### 4.7 Operations suite (OPS1)
- **OPS1** Cancel/refund routing (P1.5): cancel refunds return directly to Harbor stock (Safe→Exposed), obey Total 3S, never enter the Claim Ledger, never exceed 3S (cancellation blocks by default if it would), and are never silently deleted.

### 4.8 UX invariant (UX1)
- **UX1** The System Inbox never transfers resources directly. Message actions are limited to **Read / Acknowledge / Archive / View Reward Package**. Only Claim Ledger packages expose **Claim**. A test asserts no inbox action mutates a resource total.

## 5. Sim output report (per batch, archived as evidence)
Time/sessions to ST2–ST5 · median + p90 safe/exposed stock by resource by tier · exposure frequency + raid-loss totals · resources lost to spoilage/leak/hard-stop-at-3S · raid win/loss + severity distribution · structure repair-cost burden · debt/stall frequency + recovery time · Tavern net · combat-vs-settlement resource share · per-guardian ST5 pacing variance · no-arbitrage numeric result · Claim Ledger occupancy (per-resource + global) · pending-reward-resolution outcomes · Story-Claim resource totals tracked separately · System Inbox occupancy + read/archive integrity + compaction results · invariant pass/fail table with seeds.

## 6. Minimum playable proof (before any "v1 works" claim)
1 world creation · 2 guardian choice · 3 Harbor View loads · 4 Farm/Mine/Housing/Keep loop · 5 production+storage reconcile online/offline · 6 safe/exposed/3S behave per doctrine (incl. Crowns) · 7 raid warning appears + resolves only after a player-visible opportunity · 8 expedition on Initiative Tide · 9 Tide Chain + Guardian Surge prototype with assist mode + training dummy · 10 save/load preserves all state (incl. pending rewards + inbox) · 11 sim runs ST1→ST5 · 12 no hidden network dependency · 13 no crash on clean install · 14 full-slot Reward Delivery Resolution Screen works and persists · 15 System Inbox holds no resources and shows Read/Acknowledge/Archive/View, never Claim · 16 combat suspend/resume resumes or retreats without reward duplication. Each item checked with exact commands, outputs, and exit codes in a checkpoint report; owner signs before any public "playable" statement.

## 7. Acceptance gates
**Milestone 0 exit:** harness runs a seeded smoke batch; E2 numeric proof passes; S2/S5/S7 pass on the empty shell; L1/L2 and M1/M2 static checks pass; S6 build-flag guard test passes. **First playable:** §6 items 1–7 + E-suite smoke (incl. E21) + L-suite smoke (incl. L15) + M-suite smoke + OPS1 + C6. **v1 candidate:** full §6 + all suites green across the persona matrix + provenance checklist 100%. **Any balance PR:** full economy + L + M suites green or the PR is blocked.

## 8. Evidence rules
Facts only: command, output, exit code, seed. UNKNOWN targets (pulse length, pacing band, repair rate, exposure decay finals) are measured by this harness and written back into canon in the same authorized PR that sets them. No claim graduates from FUTURE BUILD to CURRENT BUILD without a green run recorded here.

*DRAFT v0.6.2 — approved-for-revision; not merged. FUTURE BUILD. Self-contained: all suites restated in full above.*
