---
title: "Build Queue & Harbor Operations Foundation"
doc_id: "03_BUILD_QUEUE_AND_HARBOR_OPERATIONS_FOUNDATION"
version: 0.4-DRAFT
date: 2026-07-09
bundle_version: v0.5.2
status: DRAFT v0.4 for owner review — v0.5.1 cleanup: cancel/refund routing + OPS1 (P1.5), optional-lock wording (P1.4). APPROVED-FOR-REVISION; not canon.
source: "Blueprint v6.0 §5.4; Decision Register D1–D22; AMEND-02 v0.5.1; Doc 04 v0.4; v0.5 independent audit P1.5"
classification: FUTURE BUILD
supersedes: "03_BUILD_QUEUE_AND_HARBOR_OPERATIONS_FOUNDATION v0.1, v0.2, v0.3"
---

# Build Queue & Harbor Operations Foundation v0.4

**Why this exists:** the economy produces resources; a city-builder must also *operate* — queue construction, assign labor, repair after raids, reconcile online/offline. This is the operational layer between resources (Economy) and the Building View UI (Blueprint §5.4 Tier 3).

## 1. Build queue slots by Settlement Tier
| Tier | Build slots | Repair slots (separate lane) |
|---|---:|---:|
| ST1–ST2 | 1 | 1 |
| ST3–ST4 | 2 | 1 |
| ST5–ST6 | 2 | 2 |
| ST7–ST8 | 3 | 2 |
| ST9–ST10 | 3 | 3 |
Slots are per-harbor; a queued item occupies a slot from start to finish; a slot frees on completion or cancellation. Counts are sim-tunable targets.

## 2. Construction start/finish rules
- **Cost paid at start** (resources deducted when the item enters an active slot, not when queued) — prevents reserve-by-queueing.
- Queued-but-not-started items reserve nothing; if resources are spent elsewhere first, the item waits in **Blocked (insufficient resources)** and shows the blocking resource.
- **Action Timer** governs duration, tuned by tier and building role; timers advance on the World Clock (online and offline).
- Finish → **Operating** (worker assigned) or **Idle** (none).

## 3. Worker assignment to construction
Construction consumes **builder labor** from the shared worker pool (assigning builders reduces production workers — a real tradeoff). A build slot with no builder is **Stalled (no labor)** and does not progress. Builders return to the pool on completion. Minimum builders per slot and speed-per-builder are sim-tuned; more builders shorten timers up to a per-building cap.

## 4. Offline construction reconciliation
Active build/repair timers advance offline on the World Clock (consistent with production-to-3S). On return, the Offline Report lists items completed · items in progress (time remaining) · items that entered Blocked while away (and why). Offline construction never consumes resources it did not already reserve at start (cost paid at start). No build/repair *decisions* auto-made offline — only started timers advance.

## 5. Repair queue vs build queue priority
Separate lanes: repairs never block new construction and vice-versa. Within the repair lane, default priority: defensive structures (walls/towers) → disabled production buildings → other; player can reorder. Repair cost `ceil(base_build_cost × missing_durability% × repair_rate)`, repair_rate target 0.35 (sim).

## 6. Building operational states
| State | Meaning | Produces? | Worker upkeep? |
|---|---|---|---|
| Operating | Worker assigned, inputs available | Yes | Yes |
| Idle | No worker assigned | No | No |
| Stalled | Worker present, inputs missing | No | Yes |
| Disabled | Raid/sabotage disabled it | No | No (workers → Idle, reassignable) |
| Under-repair | In a repair slot | No until repaired | No |

## 7. Payment source — Claim Ledger separation (D14/D19)
Build and repair costs are paid **only from claimed Harbor stock** (Safe, then Exposed if the player allows). **Neither the build queue nor the repair queue can draw directly from the Claim Ledger.** The player must claim rewards into the Harbor first (Doc 04 partial-claim modes), then spend. A build/repair blocked for resources shows the blocking resource and may flag that a Claim Ledger package could cover it once claimed — informative, never an auto-draw.

## 8. Pending-reward activity lock scoping (D19 — narrowed)
A pending full-slot reward (Doc 04 §10) blocks **only new *optional* reward-generating activities** that could create additional Claim Ledger packages (new quests/expeditions/contracts). It does **not** block building, repairing, claiming existing packages, reading messages, organizing workers, upgrading storage, or spending resources. It also **never** blocks a **mandatory defensive raid** already in Warning/Assault flow or a **story-critical resolution event** (Doc 04 L15). Normal harbor management always continues.

## 9. Cancel / pause & refunds (P1.5 — routing made explicit)
Pause (optional v1): slot stays occupied, no refund, timer holds — may be cut if it complicates offline math (sim-flagged). Cancel: frees the slot, refunds a fraction of paid resources (refund_rate target 0.75, sim-tunable), no refund of elapsed builder-time. Never a total loss; the refund appears in the ledger.

**Refund routing (OPS1):** a cancel/refund is a return of already-claimed Harbor resources, so it routes **directly to Harbor stock, never to the Claim Ledger**:
1. Fill Safe storage first.
2. Then fill Exposed surplus up to Total 3S.
3. If the refund would exceed Total 3S, **block cancellation by default** and show a storage warning (the player frees room first), or allow explicit-confirm loss only if the owner approves that behavior.
4. Refunds are never silently deleted and never enter the Claim Ledger.
Invariant **OPS1**: cancel refunds obey Safe/Exposed/Total capacity, never enter the Claim Ledger, never exceed 3S, and are never silently deleted.

## 10. Damaged & disabled buildings
Raid damage reduces durability; below a threshold a building shows needs-repair but keeps operating at reduced output until Critical. A Disabled building (Critical breach/sabotage) produces 0, must enter the repair lane; its workers become Idle and are reassignable immediately (no labor trapped).

## 11. Building View UI claims
Every panel shows: time-to-finish (if queued/building) · blocking resource (if Blocked) · worker/builder assigned (and the Stalled fix) · repair-needed state + repair cost · operational state. No hidden progress; all queue changes and refunds hit the ledger with a world-clock stamp.

## 12. Data-seed exports (`/data/operations/`)
`build_queue (slots by tier) · construction_rules (cost-at-start, blocked behavior) · builder_labor · offline_construction · repair_queue (lanes, priority, repair_rate) · building_states · cancel_refund (refund_rate) · damaged_building_thresholds · pending_reward_lock_scope`. No Magic Numbers rule.

## 13. Sim/acceptance hooks
Feeds `SIM_HARNESS_ACCEPTANCE_SPEC`: offline-construction reconciliation correctness · builder-vs-production labor tradeoff surfaces in personas · cancel refund never negative · disabled buildings never trap labor · repair lane never starves build lane · pending-reward lock blocks only reward-generating events. Save/load preserves full queue + slot + timer state (S5).

**OPS-suite hook:** OPS1 cancel/refund routing (Safe→Exposed→3S, never Ledger, never >3S, never silent-delete) is asserted in `SIM_HARNESS_ACCEPTANCE_SPEC`.

*DRAFT v0.4 — self-contained; approved-for-revision; not merged. FUTURE BUILD.*
