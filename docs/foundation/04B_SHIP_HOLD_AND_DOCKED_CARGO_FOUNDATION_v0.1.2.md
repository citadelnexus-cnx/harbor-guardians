---
title: "Ship Hold & Docked Cargo Foundation"
doc_id: "04B_SHIP_HOLD_AND_DOCKED_CARGO_FOUNDATION"
version: 0.1.2-DRAFT
date: 2026-07-10
bundle_version: v0.1.2-dependency
status: DRAFT v0.1.2 for owner review — cleanup: CARGO1 exception phrase removed (P1); H1/version drift fixed (P2). APPROVED-FOR-REVISION; not canon; no repo/vault mutation.
source: "Decision Register D1–D22 (00_DECISION_REGISTER v0.2); AMEND-02 v0.5.1 (A2.10 routing, A2.12 Docked Cargo placeholder); 01_ECONOMY_FOUNDATION v1.7 (§7 storage, §13 routing); 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4; SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5; SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2"
classification: FUTURE BUILD — all numbers are design targets pending sim validation
blocks: "ship/cargo/expedition-loot implementation"
---

# Ship Hold & Docked Cargo Foundation v0.1.2

**Why this exists:** expedition loot and combat routing already point *physical cargo* at "Ship Hold → Docked Cargo" (AMEND-02 A2.10/A2.12, Economy §13, Combat §6). That target was a placeholder. This doc founds it so cargo has explicit capacity, exposure, unload, and persistence rules — and can never become a second Claim Ledger or a hidden bank.

## 1. Scope & separation
Covers only **physical cargo**: resources and salvage physically carried by the ship (Provisions, Iron, Aether shards, mixed salvage). It does **not** cover: Crowns (Vault/Claim Ledger), Merit/Bond XP (auto-receipts), gear (Gear Locker — Doc 09), story rewards (Story Claim), or completion/objective bounties (Claim Ledger). Cargo is the one reward channel that is *physical and location-bound* rather than claimed.

## 2. Ship Hold (in transit)
- Hold capacity per ship tier (Economy §11): Skiff 150 · Cutter 400 · Galleon 1,000 · Flagship 2,500 (mixed cargo units; unit weights are data-seed values).
- Loot collected on a voyage fills the hold up to capacity; **loot beyond hold capacity is left behind at the source** (anti-farming, matches Blueprint hold rule) — never silently stored elsewhere, never routed to the Claim Ledger (CARGO1).
- Hold contents are **not raidable while at sea** (the ship is away); they become exposed only after docking (§3).
- The hold has no decay in transit (voyages are bounded by rations/range, Economy §11).

## 3. Docked Cargo (arrived, not yet unloaded)
When a voyage returns, hold contents become **Docked Cargo** — physical, exposed, and time-limited, sitting on the dock until the player unloads it into Harbor storage.
- **Exposed & raidable:** Docked Cargo is treated as exposed surplus for raid purposes (Economy §12 / AMEND-02 A2.5). A failed raid can take Docked Cargo per the standard `floor(exposed × severity_rate)` rule. It is never "safe" until unloaded into Safe storage.
- **Spoilage/leak by type:** Provisions Docked Cargo spoils and Aether-shard Docked Cargo leaks at the exposed rates (Economy §7: Provisions −10%/pulse, Aether −15%/pulse); Iron/salvage does not decay. Crowns are never in cargo, so the no-decay Crown rule is not relevant here.
- **Pressure timer / Needs Resolution (time-limited, no deletion):** Docked Cargo carries a **pressure timer**, not a deletion timer. When it elapses the cargo enters **Needs Resolution** status: it is **never hard-deleted**, it stays exposed/raidable, it continues to spoil/leak by type, and it **blocks new cargo voyages from that ship/dock until resolved** (the dock is occupied). Resolution = unload (§4) or an explicit discard-with-confirm. This creates pressure to clear the dock without ever silently wiping goods (no-hidden-loss doctrine, AMEND-02 A2.8).

## 4. Unloading into Harbor (Safe/Exposed/Total 3S)
Unloading transfers Docked Cargo into Harbor storage under the **same Safe/Exposed/Total 3S rules** as all core resources (Economy §7):
- Fill Safe storage first, then Exposed surplus, up to Total 3S.
- **Partial unload** mirrors the Claim Ledger's partial-claim modes (Doc 04 §7): Unload to Safe / Unload to Capacity / Unload All / Leave on Dock. `unloaded + left_on_dock == arrived` exactly (no rounding leak).
- If Harbor storage cannot accept the full cargo (would exceed 3S), the remainder **stays as Docked Cargo** (still exposed, still under its pressure timer / Needs Resolution) — never silently deleted, never pushed into the Claim Ledger.
- Unloading is a normal management action; it is **not** blocked by a pending reward (Doc 04 L15 / Build Queue §8 scope — cargo unload is management, not new reward generation).

## 5. Relationship to the Claim Ledger (hard boundary)
- Physical cargo **never enters the Claim Ledger** (CARGO1). The Ledger is for *claimed* earned reward packages; cargo is *physically carried* goods.
- **One line, one route, chosen before delivery.** A reward/loot line's route (Claim Ledger vs physical cargo vs the others) is decided by source rule **at generation, before delivery**. A source rule may mint a Claim Ledger reward package *instead of* physical cargo for a given line — but never both, and **once a line is routed as physical cargo it can never later enter the Claim Ledger** (no post-hoc re-routing, CARGO2). Salvage of already-delivered goods is a separate new event, not a re-route.
- The dockmaster's manifest (Harbor Manifest UI) may *show* Docked Cargo as an informational panel, but Docked Cargo is not a Ledger tab and uses **Unload**, never **Claim** (UX parity with UX1: distinct verbs for distinct systems).

## 6. Ambush & loss during voyage (cross-ref Economy §11, hazard routes)
Hazard-route ambushes may reduce hold contents or ship durability per the hazard-route risk rules (Economy §11). Any such loss is logged in the ledger with a world-clock stamp (no hidden loss). A lost/retreated ambush never permanently locks travel and never deletes safe-stored Harbor resources.

## 7. Save/load & offline (cross-ref Save/Load spec)
- Docked Cargo persists as its own save block: `cargo_id · source_voyage_id · contents (resource:amount map) · arrived_world_clock · pressure_timer_state (active|needs_resolution) · exposed=true`.
- Offline: Docked Cargo continues to spoil/leak and remains raidable-eligible during reconciliation exactly as exposed surplus does (Save/Load §4 step 4), but — like all raids — **no Assault auto-resolves offline** (D7); threat may reach Warning only.
- Docked Cargo is never auto-unloaded offline (the player chooses unload targets on return); it simply continues its pressure timer and decay, moving to Needs Resolution if the timer elapses.
- Save/load round-trip preserves cargo contents, arrival stamp, and pressure-timer state (feeds S5).

## 8. Sim invariants (CARGO suite; feed SIM_HARNESS_ACCEPTANCE_SPEC)
- **CARGO1** — physical cargo never enters the Claim Ledger. A source rule may choose Claim Ledger *instead of* physical cargo at generation time, but once a line is routed to Ship Hold / Docked Cargo, it cannot later be converted or re-routed into the Claim Ledger.
- **CARGO2** — every reward line's route is chosen at generation, before delivery; exactly one route per line: Claim Ledger, Story Claim, Ship Hold / Docked Cargo, Gear Locker, or Auto-Receipt. A line routed to physical cargo remains physical cargo until unloaded, lost, salvaged by an explicit cargo rule, or discarded with confirmation.
- **CARGO3** — loot exceeding hold capacity is left at source, never silently stored and never Ledger-routed.
- **CARGO4** — Docked Cargo obeys exposed-surplus raid/spoilage/leak rules; unloading obeys Safe/Exposed/Total 3S; partial unload preserves totals (`unloaded + left_on_dock == arrived`).
- **CARGO5** — no hidden cargo loss: every spoilage/leak/raid/left-behind event is ledger-logged; the pressure timer only moves cargo to Needs Resolution (blocking new voyages from that ship/dock), and **never hard-deletes cargo**.

## 9. Data-seed exports (`/data/cargo/`)
`ship_hold_capacity (per tier) · cargo_unit_weights · docked_cargo_rules (exposure, spoilage/leak by type, pressure_timer_pulses, needs_resolution_behavior) · unload_modes · ambush_loss_rules (cross-ref hazard routes) · cargo_save_schema · cargo_invariants`. Every value carries id · resource · amount|formula · unit · gate · offline behavior · storage-state behavior · source section · invariant refs. No Magic Numbers rule applies.

## 10. Open questions for owner
1. **Pressure-timer length:** confirm `pressure_timer_pulses` target — how long before Docked Cargo enters Needs Resolution and blocks new voyages from that ship/dock. (Resolved model: pressure timer → Needs Resolution → blocks new cargo voyages, never hard-deletes; only the duration is open.)
2. **Iron/salvage on the dock:** confirm Iron Docked Cargo stays non-decaying but remains raidable (consistent with Iron exposed behavior).
3. **Cargo unit model:** single mixed "cargo units" cap vs. per-resource sub-holds. Recommended: single mixed hold cap for v1 simplicity; per-resource display.

*DRAFT v0.1.2 — FUTURE BUILD. Approved-for-revision; merge requires a separately authorized session. Required before any ship/cargo/expedition-loot implementation.*
