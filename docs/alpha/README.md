# docs/alpha — Alpha planning & authorization boundary

Alpha-phase planning documents. Governing rules: [`CLAUDE.md`](../../CLAUDE.md) §6/§7, [`AGENTS.md`](../../AGENTS.md).

## Current authorization state (2026-07-23)

| Phase | Status |
| --- | --- |
| **Milestone 0** | CLOSED (see [`M0_EXIT_EVIDENCE.md`](../../M0_EXIT_EVIDENCE.md)) |
| **Alpha A0** — planning & harness preparation | CLOSED — owner authorization 2026-07-15; EVT1–EVT10 registered fail-loud, registry 132 (PR #14) |
| **Alpha A1** — Minimal Harbor State and Resource Spine | CLOSED — owner authorization 2026-07-16; harbor spine + DC1/DC4/DC5/DC6 + stocked S5 (PR #15) |
| **Alpha A2** — Claim Ledger and Reward Routing | CLOSED — owner authorization 2026-07-17; ledger spine + L1/L5/L6/L7/L11/L14 + save v1→v2 (PR #16) |
| **Alpha A3** — Expedition and Event Skeleton (Option A: lifecycle mechanics only) | CLOSED — owner authorization 2026-07-18; EVT1–EVT4 + save v2→v3 + integrity corrections (PR #18) |
| **Alpha A4** — Bounded First Playable Expedition Loop (Option A only) | REVIEW — owner authorization 2026-07-23; scope in [`ALPHA_A4_EXECUTION_BRIEF_v0.1.md`](ALPHA_A4_EXECUTION_BRIEF_v0.1.md). Implementation complete on `alpha/a4-first-playable-expedition-loop` (OPS1 converted; save v4; 132/17/115); draft PR open for owner review, not yet merged |
| **Alpha A5+** | **NOT AUTHORIZED** — no scope, brief, or implementation permission exists |

## Closed Alpha A3 boundary

Alpha A3 Option A delivered only the **Expedition and Event Skeleton lifecycle mechanics**:

- Typed `Event`/`Condition`/`Outcome`/inert `Effect` contracts.
- Generated schema-backed test fixtures only; no real `/data/events` content.
- Deterministic nine-label lifecycle transitions driven by test-harness signals.
- Observable triggers limited to implemented A1 harbor and A2 Claim Ledger state.
- Save schema v2→v3 events-block migration for honest EVT3 persistence.
- EVT1–EVT4 implemented; EVT5–EVT10 remain fail-loud.
- Full staged-effect descriptor integrity and unique/non-empty persisted `instance_id` enforcement.
- Final evidence: `test:events` 21/21, `test:ledger` 16/16, `test:save` 20/20, `test:harbor` 9/9, A3 BATCH GREEN, 132 registered / 16 implemented / 116 fail-loud.

PR #18 squash-merged to `main` as `245b73215cf9b098b8f54eaa559dabc1b49703d4`.

## Authorized Alpha A4 boundary (Option A only)

On **2026-07-23** the owner authorized **Alpha A4 Option A — Bounded First Playable Expedition Loop** (public-safe scope in [`ALPHA_A4_EXECUTION_BRIEF_v0.1.md`](ALPHA_A4_EXECUTION_BRIEF_v0.1.md); baseline `a08b4ad`). A4 is bounded to exactly one canonical, repeatable, deterministic, save-safe early-game Harbor → route-anchor-outpost → Harbor loop, with:

- Theo's inherited salvage vessel and a fixed group (player, selected starting Guardian, Morra Dalmere, any approved fixed support character) — no selectable party, no formations.
- A small deterministic supply set, one short route, bounded reuse of the existing EVT1–EVT4 lifecycle, one damaged route-anchor outpost, and a non-combat stabilization/salvage objective.
- Outcomes: cancellation, full success, partial success, retreat, forced withdrawal/failure; then return, docking, review, and unloading.
- Safe Storage transfer with unsafe Overflow capped at 3× current Safe Storage capacity; blocked-unloading preservation (no loss, no duplication).
- **Only already-valid Claim Ledger routing** — no new `source_type`, no general expedition reward generation.
- Bounded vessel/crew/Guardian recovery; a limited route-anchor operations unlock; repeatable expeditions; exact save/exit/relaunch/resume.
- A minimal Alpha-quality Windows desktop interface; save v4 + deterministic v3→v4 migration **only if technically required** (assess v3 first).
- Starting Guardians (Raxa, Tarin, Nova) as **equivalent sidegrades only** — no superior rewards, guaranteed success, leveling, evolution, equipment, combat powers, bond tree, or roster.

Convert only fully proven A4-scoped invariants; everything else stays fail-loud. Implementation runs on branch `alpha/a4-first-playable-expedition-loop`, is **gated on the merge of the authorization-record PR** that lands the A4 brief and the CLAUDE.md §7 / README / progress-ledger amendments, ships as a draft PR only, and A4 closes only after owner-approved merge.

## Still outside the boundary

A4's hard exclusions (and Alpha A5 and later) remain NOT AUTHORIZED: combat; raids/theft activation; multiplayer/networking; fleet and full ship progression; crew recruitment and detailed crew systems; full Guardian progression; selectable party and battle formations; equipment and broad loot; full Cargo/Docked Cargo system; trading and markets; unrestricted Claim Ledger `source_type`s; general expedition reward generation; effect execution or dispatch beyond the bounded loop; full Harbor Inbox; full quest framework; Atlas/world traversal; factions; threat director; economy pulses; full city-builder departments; controller certification; deployment; production.

Any phase beyond this A4 boundary requires a separate owner decision, a bounded execution brief, branch-first implementation, draft PR, review, and merge gate.

## Documents

| Document | Purpose |
| --- | --- |
| [`ALPHA_A0_EXECUTION_BRIEF_v0.1.md`](ALPHA_A0_EXECUTION_BRIEF_v0.1.md) | The A0 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A1_EXECUTION_BRIEF_v0.1.md`](ALPHA_A1_EXECUTION_BRIEF_v0.1.md) | The A1 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A2_EXECUTION_BRIEF_v0.1.md`](ALPHA_A2_EXECUTION_BRIEF_v0.1.md) | The A2 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A3_EXECUTION_BRIEF_v0.1.md`](ALPHA_A3_EXECUTION_BRIEF_v0.1.md) | The A3 Option A scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A4_EXECUTION_BRIEF_v0.1.md`](ALPHA_A4_EXECUTION_BRIEF_v0.1.md) | The A4 Option A scope, deliverables, hard limits, and exit condition (authorized; implementation gated on the authorization-record PR merge) |
