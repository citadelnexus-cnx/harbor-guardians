# /src/sim

**One responsibility:** the deterministic simulation core. **Pure and headless** — no UI imports, no Tauri imports, no DOM, no I/O side effects; runnable by `/sim-harness` without a window (Sim Harness spec; Blueprint deterministic-core requirement).

No gameplay literals anywhere in this tree (No Magic Numbers, Doc 07): every value is read from `/data` seeds validated against `/schema`. This is **mechanically enforced** since Alpha A1 — the DC1 harness check scans every file here and fails on any numeric literal other than the identity `0`. Module headers cite the governing doc section and invariant IDs they implement.

## Contents

- [`harbor-state.ts`](harbor-state.ts) *(Alpha A1 — owner authorization 2026-07-16)* — the Minimal Harbor State and Resource Spine: per-CoreResource 3S storage state (D1 — Safe S / Exposed 2S / Total 3S), seed-driven creation (Economy §3 start stocks), deposit with safe → exposed → hard-stop fill order and explicit blocked-amount accounting (no hidden loss), never-negative withdrawal, and the save-blob `resources` projection (S5).
- [`claim-ledger.ts`](claim-ledger.ts) *(Alpha A2 — owner authorization 2026-07-17)* — the Claim Ledger and Reward Routing spine: deterministic routing of **test-supplied** reward packages (one line one route — CARGO2/D24; `claim_ledger` and `story_claim` delivered, cargo/gear/auto-receipt routes fail loud as FUTURE BUILD), Doc 04 §5 slot accounting from the seeded caps, §7 partial claim into the harbor spine (`claimed + held_remainder == original` exactly — L6), §10 persistent pending resolution on cap block (never deleted, never duplicated — L11/L14), and protected Story Claims (L5). **No gameplay reward source**: nothing here mints packages.
- [`event-lifecycle.ts`](event-lifecycle.ts) *(Alpha A3 Option A — owner authorization 2026-07-18)* — the Expedition and Event Skeleton, lifecycle mechanics only: the deterministic nine-label state machine (Doc 15 §2 — `DORMANT → ELIGIBLE → OFFERED|TRIGGERED → ACTIVE → RESOLVING → RESOLVED`, plus the fair `EXPIRED`/`DECLINED` branch), driven only by test-harness-supplied signals (no timers, no clock, no RNG). Triggers observe ONLY implemented state — A1 harbor bands + A2 ledger occupancy + explicit prior-event completion (EVT4). Outcomes stage **inert** effect descriptors that are preserved verbatim through save/load and never executed — reaching `RESOLVED` is a lifecycle terminal, **not** an applied gameplay effect. **No event reward generation, no effect dispatch, no chains, no real event content** (EVT5–EVT10 stay fail-loud); test fixtures live under `tests/fixtures/events/`.

**No gameplay loop**: no production, pulses, upkeep, decay/leak, raids, or offline reconciliation — those are FUTURE BUILD behind fail-loud invariant stubs.

I/O (seed/fixture file loading + ajv validation) lives in `/sim-harness/storage-seed.ts`, `/sim-harness/ledger-rules-seed.ts`, and `/sim-harness/event-fixtures.ts`, not here — this tree stays pure.
