# docs/alpha — Alpha planning & authorization boundary

Alpha-phase planning documents. Governing rules: [`CLAUDE.md`](../../CLAUDE.md) §6/§7, [`AGENTS.md`](../../AGENTS.md).

## Current authorization state (2026-07-18)

| Phase | Status |
| --- | --- |
| **Milestone 0** | CLOSED (see [`M0_EXIT_EVIDENCE.md`](../../M0_EXIT_EVIDENCE.md)) |
| **Alpha A0** — planning & harness preparation | CLOSED — owner authorization 2026-07-15; EVT1–EVT10 registered fail-loud, registry 132 (PR #14) |
| **Alpha A1** — Minimal Harbor State and Resource Spine | CLOSED — owner authorization 2026-07-16; harbor spine + DC1/DC4/DC5/DC6 + stocked S5 (PR #15) |
| **Alpha A2** — Claim Ledger and Reward Routing | CLOSED — owner authorization 2026-07-17; ledger spine + L1/L5/L6/L7/L11/L14 + save v1→v2 (PR #16) |
| **Alpha A3** — Expedition and Event Skeleton (Option A: lifecycle mechanics only) | **AUTHORIZED** — limited owner authorization, Anthony Hammon, 2026-07-18 (held privately outside this public repo, per CLAUDE.md §7) |
| **Alpha A4+** — event rewards, gameplay loop, and beyond | **NOT AUTHORIZED** — requires a separate owner approval |

## The Alpha A3 boundary

Alpha A3 Option A authorizes the **Expedition and Event Skeleton, lifecycle mechanics only**. Explicitly:

- **A3 Option A is authorized**; **A4 is not authorized**.
- Typed `Event`/`Condition`/`Outcome`/`Effect` contracts (Doc 15 §3), the deterministic nine-label lifecycle state machine driven by test-harness-supplied signals, schema-backed **test fixtures only**, observable-state triggers limited to the implemented A1 harbor + A2 ledger state, the v2→v3 save migration (events block for EVT3), and honest conversion of **EVT1–EVT4 only** — nothing more.
- **No EVT5 conversion, no event reward generation, no new Claim Ledger `source_type`** — the A2 `test_supplied` boundary is unchanged; effects are inert descriptors that are staged and preserved, never executed or dispatched.
- **No real event content** — no `/data/events`, no runtime event-content loading; fixtures live under `tests/fixtures/events/` only.
- **No gameplay loop** — no production, pulses, upkeep, decay/leak, workers, buildings, or offline reconciliation.
- **No combat, raids, threat behavior, guardians, factions, cargo voyages, or gear gameplay.** EVT5–EVT10 remain **fail-loud stubs**.
- **No System Inbox** — no messages, Claim Notices, or Migration Notices (Doc 04A is FUTURE BUILD; M-suite fail-loud).
- **No gameplay UI** (the Tauri shell stays the empty smoke-test window).
- **No deployment** (no packaging, installers, or release artifacts).

Work performed under A3 is recorded in [`ALPHA_A3_EXECUTION_BRIEF_v0.1.md`](ALPHA_A3_EXECUTION_BRIEF_v0.1.md). Any task that appears to require crossing this boundary is a stop-and-ask escalation (CLAUDE.md §6), not a judgment call.

## Documents

| Document | Purpose |
| --- | --- |
| [`ALPHA_A0_EXECUTION_BRIEF_v0.1.md`](ALPHA_A0_EXECUTION_BRIEF_v0.1.md) | The A0 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A1_EXECUTION_BRIEF_v0.1.md`](ALPHA_A1_EXECUTION_BRIEF_v0.1.md) | The A1 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A2_EXECUTION_BRIEF_v0.1.md`](ALPHA_A2_EXECUTION_BRIEF_v0.1.md) | The A2 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A3_EXECUTION_BRIEF_v0.1.md`](ALPHA_A3_EXECUTION_BRIEF_v0.1.md) | The A3 Option A scope, deliverables, hard limits, and exit condition |
