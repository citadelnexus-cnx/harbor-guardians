# docs/alpha — Alpha planning & authorization boundary

Alpha-phase planning documents. Governing rules: [`CLAUDE.md`](../../CLAUDE.md) §6/§7, [`AGENTS.md`](../../AGENTS.md).

## Current authorization state (2026-07-19)

| Phase | Status |
| --- | --- |
| **Milestone 0** | CLOSED (see [`M0_EXIT_EVIDENCE.md`](../../M0_EXIT_EVIDENCE.md)) |
| **Alpha A0** — planning & harness preparation | CLOSED — owner authorization 2026-07-15; EVT1–EVT10 registered fail-loud, registry 132 (PR #14) |
| **Alpha A1** — Minimal Harbor State and Resource Spine | CLOSED — owner authorization 2026-07-16; harbor spine + DC1/DC4/DC5/DC6 + stocked S5 (PR #15) |
| **Alpha A2** — Claim Ledger and Reward Routing | CLOSED — owner authorization 2026-07-17; ledger spine + L1/L5/L6/L7/L11/L14 + save v1→v2 (PR #16) |
| **Alpha A3** — Expedition and Event Skeleton (Option A: lifecycle mechanics only) | CLOSED — owner authorization 2026-07-18; EVT1–EVT4 + save v2→v3 + integrity corrections (PR #18) |
| **Alpha A4+** | **NOT AUTHORIZED** — no scope, brief, or implementation permission exists |

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

## Current hard boundary

No implementation phase is currently authorized. Specifically, there is no authorization for EVT5+, event reward generation, event-to-Claim-Ledger delivery, any new Claim Ledger `source_type`, effect execution or dispatch, real event content, gameplay loop work, combat, raids, threat behavior, guardians, factions, cargo voyages, gear gameplay, Harbor Inbox/messages, gameplay UI, Tauri changes, deployment, production, or Alpha A4.

Any next phase requires a separate owner decision, a bounded execution brief, branch-first implementation, draft PR, review, and merge gate.

## Documents

| Document | Purpose |
| --- | --- |
| [`ALPHA_A0_EXECUTION_BRIEF_v0.1.md`](ALPHA_A0_EXECUTION_BRIEF_v0.1.md) | The A0 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A1_EXECUTION_BRIEF_v0.1.md`](ALPHA_A1_EXECUTION_BRIEF_v0.1.md) | The A1 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A2_EXECUTION_BRIEF_v0.1.md`](ALPHA_A2_EXECUTION_BRIEF_v0.1.md) | The A2 scope, deliverables, hard limits, and exit condition (closed) |
| [`ALPHA_A3_EXECUTION_BRIEF_v0.1.md`](ALPHA_A3_EXECUTION_BRIEF_v0.1.md) | The A3 Option A scope, deliverables, hard limits, and exit condition (closed) |
