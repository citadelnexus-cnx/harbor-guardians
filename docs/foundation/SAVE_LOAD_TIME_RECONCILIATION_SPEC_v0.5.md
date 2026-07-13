---
title: "Save/Load & Time Reconciliation Spec"
doc_id: "SAVE_LOAD_TIME_RECONCILIATION_SPEC"
version: 0.5-DRAFT
date: 2026-07-09
bundle_version: v0.5.2
status: DRAFT v0.5 for owner review — v0.5.1 cleanup pass. Adds offline convergence rule (P1.1), end-of-pulse display rule (P1.2), atomic save/autosave policy + S7 (P1.6). APPROVED-FOR-REVISION; not canon.
source: "Decision Register D1–D22; HG-BLUEPRINT-AMEND-02_v0.5.1; 01_ECONOMY_FOUNDATION_v1.7; 02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION_v0.5; 03_BUILD_QUEUE_AND_HARBOR_OPERATIONS_FOUNDATION_v0.4; 04_REWARD_CLAIM_LEDGER_FOUNDATION_v0.4; 04A_HARBOR_INBOX_AND_SYSTEM_MESSAGES_FOUNDATION_v0.3; v0.5 independent audit P1 fixes"
classification: FUTURE BUILD — offline-first state-integrity spec (integrity, not anti-cheat)
supersedes: "SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.1–v0.4"
---

# Save/Load & Time Reconciliation Spec v0.5

**Stance:** state integrity, not punishment. Offline-first, single-player; no punitive anti-cheat in v1. This document states its rules in full rather than referencing prior versions.

## 1. Save schema versioning
Every save carries `save_schema_version` (integer) + `game_version`. On load, if `save_schema_version < current`, ordered, pure, tested migration functions bring it forward. Saves are local JSON (no server, no account). A corrupt/unreadable save never hard-crashes: it surfaces a recovery prompt and the last good autosave if present.

## 2. World-clock timestamp
Store an absolute UTC timestamp `last_saved_utc` (ISO-8601) plus the in-game World Clock (day index, time-of-day) at every save. On load, elapsed real time = `now_utc − last_saved_utc`, clamped by §5.

## 3. Local-time-change behavior
Reconciliation uses UTC deltas only, never local wall-clock, so timezone changes and DST neither grant nor steal progress. Device local time is display-only.

## 4. Deterministic replay order (per Economy Pulse — identical online and offline)
1. Worker eligibility from prior-pulse resources + debt state.
2. Active workers produce → fill Safe storage, then Exposed surplus, then hard-stop at 3S Total (all core resources incl. Crowns).
3. Build/repair timers advance (Build Queue spec).
4. Spoilage/leak applied to Exposed surplus (Provisions −10%/pulse; Aether −15%/pulse; Iron no decay; **Crowns exempt — no decay/leak**).
5. Upkeep (food/wages/maintenance/ward) attempts payment; floors at the soft-stall (never negative, never lost workers).
6. Threat may advance a phase to a maximum of **Warning** — an Assault never auto-resolves offline (v1).
7. Ledger accrues a summarized, world-clock-stamped entry.
Same seed + same elapsed time ⇒ identical result (testable).

## 5. Offline clamp and convergence rule (P1.1 — revised)
Offline reconciliation simulates elapsed time up to `max_offline_reconcile_window` (target 72h of pulses [sim-tunable]) using the deterministic pulse order in §4.

If elapsed time exceeds the window, the game does not grant additional uncapped production, additional rewards, or hidden raid resolution. The post-window state is treated as the deterministic **converged state** for capped production systems — **but only after applying the same worker, upkeep, decay/leak, exposed-surplus, build-completion, debt, and threat rules** through the simulated window.

The shortcut may **never** assume "full to 3S" for any system unless the deterministic sim proves that system actually converges there under the current worker/upkeep/decay/leak rules. Provisions and Aether in particular may converge **below** 3S because exposed surplus decays/leaks each pulse (see §5a). Threat advancement still stops at Warning (§7) regardless of window length.

**Test requirement:** 72h, 7d, and 14d absence tests must converge without creating extra resources, hidden loss, negative stocks, lost workers, or different reward outcomes than a continuously-simulated equivalent.

## 5a. End-of-pulse display consistency (P1.2 — new)
Displayed stock after reconciliation is the **post-pulse** state, i.e. after production, exposed spoilage/leak, and upkeep have all applied in the final reconciled pulse. Therefore Provisions and Aether may end **below** Total 3S even after long absences, because decay/leak applies after production within that final pulse. **This is expected, not a bug.** Iron and Crowns (no decay/leak) may sit at 3S; Provisions and Aether typically settle at a decay/leak equilibrium below 3S. Online and offline runs with the same seed and elapsed time must produce the same final visible stock (invariant E21).

## 6. Exposed surplus & construction while offline
Exposed surplus is created offline only as ordinary production overflow above Safe storage (never as duplicated reward). Started build/repair timers advance offline; no new builds auto-start. Contract/world-day refreshes falling within the window apply on return.

## 7. No hidden raid resolution (D7)
Threat may advance to Warning during the offline window; an Assault never auto-resolves offline in v1. On return the player sees the Warning, a report, and a preparation opportunity before any resolution. No offline return may reveal hidden raid damage, hidden resource loss, or invisible structure disablement.

## 8. Debt / stall calculation order
Wage debt and Unfed/Unpaid states are computed inside the per-pulse order (§4 step 5), so offline debt evolves exactly as online debt would — capped by the debt cap and always recoverable (no soft-lock).

## 9. Clock rollback handling
If `now_utc < last_saved_utc` (clock moved backward): reconcile zero elapsed time (never negative), log a benign note, and continue. No penalty, no reward. Forward jumps are handled under the §5 clamp.

## 10. Claim Ledger persistence
Persist every reward package: `package_id · source_type · contents (resource:amount map, flags, cosmetics, gear refs) · created_world_clock · is_story · system_grant? · held_remainder · pending_state?`. Rules: Story Claims persist permanently (never expire, never deleted, never raided while unclaimed) across save/load and any-length absence; non-story packages persist until claimed; caps (5/resource + 20 global) are re-validated on load — if a data change ever lowered a cap, existing packages are grandfathered read-only until claimed, never silently deleted; partial-claim remainders preserved exactly (`claimed + held_remainder == original`, no rounding drift); the Ledger never advances or auto-claims offline; held rewards are never raided (only claimed exposed resources are).

## 11. Persistent pending_reward_resolution (full-slot cases)
When a non-story reward package cannot enter the Claim Ledger because a cap is full, it becomes a **persistent `pending_reward_resolution` record**, saved as its own block:
`pending_id · source_type · source_id · contents · created_world_clock · blocking_categories[] · resolution_state`.
Rules:
- **Persists across save/load and offline** exactly as generated — no loss, no duplication, no reroll (L14).
- Not usable/spendable while pending; not in the Ledger yet, not in Harbor storage.
- Reconciliation (§4) never resolves or claims it automatically; the player resolves it via the Reward Delivery Resolution Screen on return.
- **Scope of the block (P1.4):** while a pending reward is unresolved, only *new optional reward-generating activities* are locked (new quests/expeditions/contracts that would mint rewards). Normal management, building, repair, and claiming remain fully available. **Mandatory defensive raids and story-critical resolution events are never blocked** — they resolve normally, and any reward they mint also enters pending resolution if Ledger caps remain full (L15).
- A referencing System Inbox Claim Notice is created (informational only; holds no resources).

## 12. System Inbox persistence + retention/compaction
`system_messages` save block persists: `message_id · type · priority · title · body_summary · created_world_clock · created_utc · read_state · persist_policy · related_ids`. Round-trip preserves read/archive state and package links (M8). Messages hold no authoritative resource payload fields (M1); archiving/deleting a message never removes a Claim Ledger package (M2). **Retention/compaction:** low/normal read messages auto-archive per policy and may be compacted to save space; compaction never deletes an unacknowledged critical/high message, never deletes a permanent Migration Notice, and never severs a live `package_id` link (M10). Authoritative economic values come from the referenced ledger/report record, never the message body (M9).

## 13. Combat suspend/resume policy (D16 — Option B, recommended)
The game may create a local combat suspend snapshot at safe turn boundaries (not economy persistence, not farmable): snapshot at a turn boundary only; includes battle state, Bond Charge, turn order, HP/status, enemy state, and the generated loot seed; does not allow rerolling loot or replaying reward results; the Claim Ledger receives rewards only after battle-result finalization; if the snapshot corrupts, fall back to the defined safe retreat outcome. Invariant C8: suspend/resume cannot duplicate rewards, reroll loot, or convert Bond Charge into economy resources. (If the owner prefers Option A — no mid-combat save, retreat on reload — this section is replaced by that simpler policy; Option B is recommended for mobile.)

## 14. Migration (required)
Each schema bump ships a migration function + a fixture save at the prior version + a round-trip test asserting the migrated save loads and reconciles identically to a fresh equivalent. **Specific migration:** the retired v0.2 Crown-only Claim Hold migrates to a single-resource Crown reward package in the Universal Claim Ledger (`source_type=legacy-crown-hold`), preserving amount and created timestamp; no Crowns lost or created. A Migration Notice is written to the System Inbox (M6) naming the migrated systems. CI runs the migration suite; a failing migration blocks the PR.

## 15. Atomic save & autosave policy (P1.6 — new)
All saves use **atomic write semantics**:
1. Write to a temp file.
2. Validate schema.
3. Flush to disk.
4. Rename/swap into the active slot.
5. Preserve the previous good save as rollback.

**Autosave triggers:** after world creation · after claim / partial claim / pending resolution · after build/repair start / cancel / finish · after combat result finalization · after offline reconciliation · after migration.

A failed or interrupted save can **never** overwrite the last known-good save, and can never duplicate rewards. Invariant **S7**: a simulated crash during save never corrupts the last known-good save and never duplicates rewards.

## 16. Save blocks (complete list)
`meta (versions, last_saved_utc) · world_clock · resources (safe + exposed per resource, incl. Crown exposed) · buildings (state, durability, queue) · workers · threat (phase, components) · claim_ledger (packages, story claims, remainders) · pending_reward_resolution (pending records) · system_messages (read/archive, related_ids, retention) · combat_suspend? (turn-boundary snapshot) · merit (per faction + receipts) · guardian (bond; Bond Charge/Surge combat-only, persisted only inside a suspend snapshot) · flags/story`. All reconciliation values originate in data seeds (No Magic Numbers).

## 17. Sim/acceptance hooks
Feeds `SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2`: reconciliation determinism (8/24/72h) · **clamp convergence proven under worker/upkeep/decay rules, incl. 7d/14d (P1.1)** · **end-of-pulse online/offline display parity (E21, P1.2)** · clock-rollback safety · migration round-trip (incl. Crown-hold→Ledger + Migration Notice) · no-offline-Assault (E19) · Story Claim permanence (L5) · partial-remainder preservation (L6) · pending_reward_resolution persistence (L14) · **pending cannot freeze mandatory defense (L15, P1.4)** · System Inbox read/archive round-trip + compaction (M8, M10) · authoritative-report boundary (M9) · combat suspend/resume reward-integrity (C8) · **atomic save integrity (S7, P1.6)** · save/load completeness (S5).

*DRAFT v0.5 — approved-for-revision; not merged. FUTURE BUILD. Self-contained: all reconciliation rules stated in full above.*
