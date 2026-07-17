# docs/alpha — Alpha planning & authorization boundary

Alpha-phase planning documents. Governing rules: [`CLAUDE.md`](../../CLAUDE.md) §6/§7, [`AGENTS.md`](../../AGENTS.md).

## Current authorization state (2026-07-17)

| Phase | Status |
| --- | --- |
| **Milestone 0** | CLOSED (see [`M0_EXIT_EVIDENCE.md`](../../M0_EXIT_EVIDENCE.md)) |
| **Alpha A0** — planning & harness preparation | CLOSED — owner authorization 2026-07-15; EVT1–EVT10 registered fail-loud, registry 132 (PR #14) |
| **Alpha A1** — Minimal Harbor State and Resource Spine | CLOSED — owner authorization 2026-07-16; harbor spine + DC1/DC4/DC5/DC6 + stocked S5 (PR #15) |
| **Alpha A2** — Claim Ledger and Reward Routing | **AUTHORIZED** — limited owner authorization, Anthony Hammon, 2026-07-17 (held privately outside this public repo, per CLAUDE.md §7) |
| **Alpha A3+** — gameplay loop, events, and beyond | **NOT AUTHORIZED** — requires a separate owner approval |

## The Alpha A2 boundary

Alpha A2 authorizes the **Claim Ledger and Reward Routing spine only**. Explicitly:

- **A2 is authorized**; **A3 is not authorized**.
- Minimal Claim Ledger / reward-routing spine: typed contracts, pure deterministic routing of **test-supplied** reward packages, Doc 04 §5 slot accounting from seeded caps, §7 partial claim against the A1 harbor spine, §10 persistent pending resolution, protected Story Claim placeholders, the v1→v2 save migration, and selected honest L-suite invariant conversion (L1/L5/L6/L7/L11/L14 + the S5/S7 extensions) — nothing more.
- **No gameplay reward source** — nothing in the game mints packages; the schema's literal `test_supplied` source type makes gameplay sources structurally impossible without a migration.
- **No gameplay loop** — no production, pulses, upkeep, decay/leak, workers, or buildings.
- **No events** — EVT1–EVT10 remain **fail-loud stubs**; executing any EVT stub throws.
- **No expeditions, combat, raids, guardians, factions, cargo voyages, gear gameplay, or build-queue gameplay.** The cargo/gear/auto-receipt reward routes are blocked stubs — routing them fails loud.
- **No System Inbox** — no messages, Claim Notices, or Migration Notices (Doc 04A is FUTURE BUILD; M-suite fail-loud).
- **No gameplay UI** (the Tauri shell stays the empty smoke-test window).
- **No deployment** (no packaging, installers, or release artifacts).

Work performed under A2 is recorded in [`ALPHA_A2_EXECUTION_BRIEF_v0.1.md`](ALPHA_A2_EXECUTION_BRIEF_v0.1.md). Any task that appears to require crossing this boundary is a stop-and-ask escalation (CLAUDE.md §6), not a judgment call.

## Documents

| Document | Purpose |
| --- | --- |
| [`ALPHA_A0_EXECUTION_BRIEF_v0.1.md`](ALPHA_A0_EXECUTION_BRIEF_v0.1.md) | The A0 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A1_EXECUTION_BRIEF_v0.1.md`](ALPHA_A1_EXECUTION_BRIEF_v0.1.md) | The A1 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A2_EXECUTION_BRIEF_v0.1.md`](ALPHA_A2_EXECUTION_BRIEF_v0.1.md) | The A2 scope, deliverables, hard limits, and exit condition |
