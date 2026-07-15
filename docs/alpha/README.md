# docs/alpha — Alpha planning & authorization boundary

Alpha-phase planning documents. Governing rules: [`CLAUDE.md`](../../CLAUDE.md) §6/§7, [`AGENTS.md`](../../AGENTS.md).

## Current authorization state (2026-07-15)

| Phase | Status |
| --- | --- |
| **Milestone 0** | CLOSED (see [`M0_EXIT_EVIDENCE.md`](../../M0_EXIT_EVIDENCE.md)) |
| **Alpha A0** — planning & harness preparation | **AUTHORIZED** — owner authorization record, Anthony Hammon, 2026-07-15 (held privately outside this public repo, per CLAUDE.md §7) |
| **Alpha A1+** — gameplay implementation | **NOT AUTHORIZED** — requires a separate owner approval |

## The Alpha A0 boundary

Alpha A0 authorizes **planning and harness preparation only**. Explicitly:

- **A0 is authorized**; **A1 is not authorized**.
- **No gameplay implementation** of any kind.
- **No UI gameplay** (the Tauri shell stays an empty smoke-test window).
- **No event lifecycle logic** — EVT1–EVT10 exist in the sim harness as **fail-loud stubs only** (registered per [`15_EVENT_SYSTEM_SPEC v0.2 §5`](../pre-alpha/15_EVENT_SYSTEM_SPEC_v0.2.md)); executing any EVT stub throws.
- **No economy, combat, or raid implementation.**
- **No deployment** (no packaging, installers, or release artifacts).

Work performed under A0 is recorded in [`ALPHA_A0_EXECUTION_BRIEF_v0.1.md`](ALPHA_A0_EXECUTION_BRIEF_v0.1.md). Any task that appears to require crossing this boundary is a stop-and-ask escalation (CLAUDE.md §6), not a judgment call.

## Documents

| Document | Purpose |
| --- | --- |
| [`ALPHA_A0_EXECUTION_BRIEF_v0.1.md`](ALPHA_A0_EXECUTION_BRIEF_v0.1.md) | The A0 scope, deliverables, hard limits, and exit condition |
