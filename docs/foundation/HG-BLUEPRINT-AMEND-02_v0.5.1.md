---
title: "HG-BLUEPRINT-AMEND-02 — Harbor Operations Economy, Time, Storage, and Raid Risk"
doc_id: "HG-BLUEPRINT-AMEND-02"
version: 0.5.1-DRAFT
date: 2026-07-09
status: DRAFT AMENDMENT — APPROVED-FOR-REVISION. Fully self-contained (D21). NOT canon; merge requires a separately authorized session.
amends: "Blueprint v6.0 §4, §7, §7.1, §14.1"
supersedes: "HG-ECON-AMEND-01 (subsumed); AMEND-02 v0.1–v0.4"
source: "Blueprint v6.0; Decision Register D1–D22 (00_DECISION_REGISTER v0.2)"
bundle_version: v0.5.3-microcleanup
classification: FUTURE BUILD doctrine; numbers are design targets pending sim validation
---

# HG-BLUEPRINT-AMEND-02 (v0.5.1)
## Harbor Operations Economy, Time, Storage, Offline, Raid Risk, Harbor Manifest, Aether/Bond-Charge

**Governance:** approved foundation draft; not merged. Implementation still requires a separately authorized milestone/session (branch-first). Decisions applied: full set per `00_DECISION_REGISTER`.

## A2.1 Harbor Operations Economy Doctrine
The economy is harbor operations, not refill meters. Every resource defines a full chain: **source identity → operating building/activity → worker/crew/route assignment → production throughput → storage state (safe → exposed → hard stop at 3S) → sink/risk outcome**, plus bottlenecks and recovery paths. "Recovery/refill/regen" language is retired. A flow that cannot state its chain is invalid by construction.

## A2.2 Time Layer Doctrine
Four layers: **World Clock** (real-time 24h; day/night modifiers, raid windows, contract/attempt refresh, return reports — canon rhythm), **Simulation Tick** (deterministic internal math; never player-facing), **Economy Pulse** (grouped player-facing resource/upkeep events; sim-tuned cadence), **Action Timer** (construction/craft/expedition/repair/route/ward durations; tier- and session-tuned). The World Clock gives rhythm; it never forces one-minute refill bars. "1 cycle = 1 minute" is an illustrative example, not doctrine. Session targets: ST1 visible change within 2–5 min; ST2–3 one main activity in 10–15 min; ST4–5 long gates always expose a short-session action.

## A2.3 Storage State Doctrine — 3S total (D1), uniform across all core resources incl. Crowns
Three physical states per storable resource: `0→S` **Safe Storage** (protected, never raidable); `S+1→3S` **Exposed Surplus** (capacity 2S; usable, visible, logged, raidable); `>3S` **Hard stop** (production idles/blocks). Canonical: Safe = S, Exposed = 2S, Total = 3S. Exposed surplus renders physically in Harbor View (yards, stacks, crates, leybanks). **Crowns follow this same model:** Safe Vault Crowns protected; exposed Crown surplus raidable; **Crowns never spoil or leak**; Crowns stop at 3S. Provisions spoil −10%/pulse while exposed; Aether leaks −15%/pulse while exposed; Iron does not decay (mining idles at 3S). Merit is never a stored raidable resource. If the sim proves 3S too generous, tune production/decay/raid/sinks before reducing doctrine.

## A2.4 Online/Offline Production Doctrine
Production continues online and offline to Total Physical Capacity (3S). Safe storage stays protected; exposed surplus stays exposed; nothing produces beyond 3S. Offline Return Report itemizes: production gained · safe filled · exposed surplus created · upkeep consumed · stalls · production blocked at 3S · explicit confirmation no raid resolved. Never on return: negative stocks, lost workers, lost safe storage, lost Crowns. **D7: no raid Assault auto-resolves offline in v1** — threat may reach Warning; the player returns to visible information and a preparation opportunity. Technical rules: `SAVE_LOAD_TIME_RECONCILIATION_SPEC`.

## A2.5 Raid Risk Doctrine (replaces Blueprint §7.1)
Failed raids never remove safe-stored resources. **Merit is never raidable; safe-stored Crowns are protected, but exposed Crown surplus is raidable like other exposed harbor resources.** Failed raids may remove exposed surplus (any core resource), damage structures, temporarily disable operations, and forfeit salvage/Merit rewards. Threat must be visible, explainable, reducible.
Target categories: exposed surplus (pillagers) · walls/towers (siege) · production buildings (saboteurs disable) · Aether systems (cultists drain exposed Aether) · routes/docks (blockades raise rations, delay contracts, threaten ship durability).
Threat drivers: uncleansed nearby Drowned Harbor (passive rise) · high exposed surplus (pillager probability rise) · story tier gate (scripted window) · repeated hazard-route use (sea-route pressure) · defensive neglect (breach severity rise) · successful Drowned Harbor expedition (delay/weaken/reset) · faction treaty support (suppress/soften a type).
Readiness schema fields: `Harbor_Readiness = wall_coverage + tower_coverage + militia_readiness + ward_coverage + route_security − exposed_surplus_risk − nearby_drowned_pressure − damaged_structure_penalty`. Threat components: `regional_threat · exposed_surplus_threat · story_gate_threat · route_threat · defense_neglect_risk · faction_support_modifier`. Phases: **Calm → Watch → Warning → Assault → Aftermath**, with a mandatory visible Warning and preparation window. Full orchestration planned as `05_THREAT_AND_RAID_DIRECTOR_FOUNDATION` (owner-gated).

## A2.6 Universal Claim Ledger (D14/D15/D19)
The **Claim Ledger** (a tab of the Harbor Manifest, A2.11) holds eligible earned reward packages: Crowns, Provisions, Iron, Aether, story, quest, expedition completion, raid, milestone. It never catches passive production overflow, Market sale overflow, Dock purchase overflow, ship cargo, Merit, XP, Bond XP, Bond Charge, or direct build/repair payments. Limits: 5 unclaimed packages per resource type + 20 global active non-story packages; a package consumes one slot per contained resource. Story Claims are separate, protected, finite, non-repeatable, non-compounding. Partial claim (Claim Safe / to Capacity / All / Hold Remaining). Raid-phase claiming: Calm/Watch normal · Warning safe-only free, exposed requires warning · Assault read-only/no-claim · Aftermath normal. Full-slot cases use the **Reward Delivery Resolution Screen** with a **persistent pending state** (survives save/load, no duplication, blocks only new reward-generating activities). Full system: `04_REWARD_CLAIM_LEDGER_FOUNDATION`.

## A2.7 Aether vs Bond Charge (D5/D6)
Aether is settlement-strategic: wards, enchanting, the Rite, leylines, harbor systems. **Bond Charge** is battle-earned combat timing payoff. Terminology: **Tide Chain builds Bond Charge; Bond Charge powers Guardian Surge.** Aether does not buy Bond Charge or trigger Guardian Surge; it may influence pre-battle prep (wards, enchanted gear, route protection) only. Aether fairness guard: safe-stored Aether required for a known Rite/story gate is never silently consumed by ward upkeep without a clear warning.

## A2.8 Economy UX Doctrine
No hidden loss: every loss to cap-block, spoilage, leak, raid, upkeep, or blockade appears in the ledger with a world-clock stamp. Every economy screen answers: safe stock · exposed surplus · total capacity (3S) · throughput · major sources/drains · raid-vulnerability · the action that fixes the bottleneck. Storage-full is presented as an opportunity, never failure.

## A2.9 Sim Validation Doctrine
No gameplay/economy claim graduates from FUTURE BUILD without a test, sim invariant, or acceptance proof (`SIM_HARNESS_ACCEPTANCE_SPEC`). All numbers are targets pending ST1→ST5 sim batches across the persona matrix; invariants use the 3S model and include exposed-Crown, Claim-Ledger (L-suite), message (M-suite), combat (C-suite), and cargo (CARGO) checks.

## A2.10 Expedition cargo classification & reward routing (D20)
Every expedition output declares exactly one route: completion bounty → Claim Ledger · faction/objective reward → Claim Ledger · story reward → Story Claim · physical salvage/cargo collected during the voyage → Ship Hold → Docked Cargo · gear drop → gear locker/inventory · Merit/Bond XP → auto-applied receipt. Physical cargo counts against ship hold; Crowns route to Vault/Claim Ledger; Merit/Bond XP/Bond Charge are records, not held resources; story items get a special slot and are never blocked by cargo cap.

## A2.11 Harbor Manifest doctrine (D11/D12)
The Harbor Manifest is the parent in-world UI with separate tabs: **Claim Ledger** (reward packages), **Story Claims** (protected narrative claims), **System Inbox** (messages/notices/reports; **Reports** is a filter/tab under it). System messages are not resources and are not spendable. A message may reference a Claim Ledger package by `package_id`, but the reward package remains owned by the Claim Ledger; deleting/archiving/acknowledging a message never deletes an unclaimed reward package. **Authoritative-truth boundary:** messages render display-only summaries drawn from ledger/report records; a message never owns authoritative resource amounts (M9). A **system grant** creates exactly one Claim Ledger package + one referencing System Inbox notice (v1 grants limited to migration/recovery/dev with a production build-flag guard, D13). Full system: `04A_HARBOR_INBOX_AND_SYSTEM_MESSAGES_FOUNDATION`.

## A2.12 Docked Cargo doctrine (D17 — placeholder; full spec deferred)
Physical expedition cargo is not the Claim Ledger. Docked Cargo is physical, exposed, and time-limited: it exists only after a voyage returns and before cargo is unloaded into Harbor storage; it may be raidable or spoil if left unresolved, depending on resource type. Invariant **CARGO1** — physical cargo never enters the Claim Ledger. A source rule may choose Claim Ledger instead of physical cargo at generation time, but once a line is routed to Ship Hold / Docked Cargo, it cannot later be converted or re-routed into the Claim Ledger. Invariant **CARGO2** — every expedition reward line must declare exactly one route at generation time: Claim Ledger, Story Claim, Ship Hold / Docked Cargo, Gear Locker, or Auto-Receipt. A line routed to physical cargo remains physical cargo until unloaded, lost through a governed cargo rule, or resolved through the Docked Cargo system. Full spec required as `04B_SHIP_HOLD_AND_DOCKED_CARGO_FOUNDATION` before any ship/cargo implementation.

*DRAFT v0.5.1 — self-contained; approved foundation draft; not merged. FUTURE BUILD.*
