# docs/alpha — Alpha planning & authorization boundary

Alpha-phase planning documents. Governing rules: [`CLAUDE.md`](../../CLAUDE.md) §6/§7, [`AGENTS.md`](../../AGENTS.md).

## Current authorization state (2026-07-16)

| Phase | Status |
| --- | --- |
| **Milestone 0** | CLOSED (see [`M0_EXIT_EVIDENCE.md`](../../M0_EXIT_EVIDENCE.md)) |
| **Alpha A0** — planning & harness preparation | CLOSED — owner authorization 2026-07-15; EVT1–EVT10 registered fail-loud, registry 132 (PR #14) |
| **Alpha A1** — Minimal Harbor State and Resource Spine | **AUTHORIZED** — limited owner authorization, Anthony Hammon, 2026-07-16 (held privately outside this public repo, per CLAUDE.md §7) |
| **Alpha A2+** — gameplay loop, events, and beyond | **NOT AUTHORIZED** — requires a separate owner approval |

## The Alpha A1 boundary

Alpha A1 authorizes the **Minimal Harbor State and Resource Spine only**. Explicitly:

- **A1 is authorized**; **A2 is not authorized**.
- Deterministic harbor/resource state, schema-backed CoreResource storage (3S model, D1), selected honest invariant conversion (DC1/DC4/DC5/DC6 + the S5 stocked-state extension), and save/load compatibility only as needed — nothing more.
- **No gameplay loop** — no production, pulses, upkeep, decay/leak, workers, or buildings.
- **No events** — EVT1–EVT10 remain **fail-loud stubs**; executing any EVT stub throws.
- **No expeditions, combat, raids, guardians, factions, cargo voyages, or build-queue gameplay.**
- **No gameplay UI** (the Tauri shell stays the empty smoke-test window).
- **No deployment** (no packaging, installers, or release artifacts).

Work performed under A1 is recorded in [`ALPHA_A1_EXECUTION_BRIEF_v0.1.md`](ALPHA_A1_EXECUTION_BRIEF_v0.1.md). Any task that appears to require crossing this boundary is a stop-and-ask escalation (CLAUDE.md §6), not a judgment call.

## Documents

| Document | Purpose |
| --- | --- |
| [`ALPHA_A0_EXECUTION_BRIEF_v0.1.md`](ALPHA_A0_EXECUTION_BRIEF_v0.1.md) | The A0 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A1_EXECUTION_BRIEF_v0.1.md`](ALPHA_A1_EXECUTION_BRIEF_v0.1.md) | The A1 scope, deliverables, hard limits, and exit condition |
