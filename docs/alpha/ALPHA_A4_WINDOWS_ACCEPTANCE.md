# Alpha A4 — Windows Desktop Acceptance

Acceptance evidence for the **interactive** Windows player flow of the Bounded
First Playable Expedition Loop (owner Alpha A4 authorization 2026-07-23,
Option A; PR #21 review correction — the earlier read-only transcript viewer
was rejected as not playable).

> **Evidence integrity note.** This document distinguishes **(1) automated
> evidence executed by the implementer** (headless, reproducible) from
> **(2) interactive Windows evidence that must be executed by the owner** in a
> real desktop session. The implementer runs in a headless environment with no
> display and **cannot** launch or click through a native GUI window, so the
> interactive section below is a **procedure with a results template — it has
> NOT been executed by the implementer and no interactive result is claimed.**

## Owner acceptance findings & corrections

- **Finding 1 (soft-lock, corrected).** Owner interactive run reached a blocked
  unload — phase `docked`, ~470 Provisions preserved aboard, message "blocked",
  and the only action was "Unload again (blocked)", with no way to create
  capacity → a dead-end. **Correction:** an authoritative `jettison` command
  (explicit, bounded discard from a chosen band via the real storage
  operations; non-negative; fully reported — D30 discard-with-confirm) plus a
  Harbor-management UI flow: when unloading is blocked, the UI offers **"Free
  capacity (manage Harbor storage)"** → discard from unsafe Overflow / Exposed /
  Safe → **"Resume unloading"** (moves only what fits) → repeat until the hold
  is empty → **Complete**. Cargo is preserved throughout; completion stays
  gated until the hold is zero; discards are duplicate-click safe. Proven by
  `tests/ui-controller.test.ts` (blocked→manage→discard→resume→drain→complete,
  save/reload while blocked, duplicate-discard idempotency) and
  `tests/expedition.test.ts` (sim-level jettison conservation + recovery).
  **Owner retest of the full interactive flow is still pending** (see scenario F
  below).

## What the desktop app is

A Tauri 2 window (`src-tauri`) over the interactive frontend in
[`src/ui/shell`](../../src/ui/shell), served under the strict CSP
`default-src 'self'` (no dev server, no bundler, no external hosts, no inline
script/style, no IPC beyond the two save commands). The webview loads the
**compiled authoritative sim** from `src/ui/shell/engine/` (built by
`pnpm run ui:engine` via `tsc` — the same `src/sim/expedition.ts` the tests and
harness use) and drives the real `ExpeditionController`. There is **no parallel
gameplay model**. Save/resume goes through the Rust `save_game`/`load_game`
commands (one local file, atomic temp→fsync→rename). The player uses buttons
and number keys to run the whole loop without developer commands.

## (1) Automated evidence — executed by the implementer (reproducible)

| Check | Command | Result |
| --- | --- | --- |
| Types | `pnpm run typecheck` | PASS (exit 0) |
| Lint (incl. generated engine + app.js) | `pnpm run lint` | PASS, 0 warnings |
| Seed validation | `pnpm run schema:validate` | PASS (13 seeds / 4 sets) |
| Invariant harness | `pnpm run sim:harness` | **A4 BATCH GREEN** — 132/17/115; determinism byte-identical @ seed 20260714 |
| Interactive controller (UI→sim mapping, incl. blocked-unload recovery) | `pnpm run test:ui` | 14/14 |
| Expedition scenario matrix | `pnpm run test:expedition` | 15/15 |
| Save/migration (incl. v3→v4) | `pnpm run test:save` | 25/25 |
| A1–A3 regression | `pnpm run test:harbor` / `test:ledger` / `test:events` | 9/9 · 16/16 · 21/21 |
| UI data bundles match the sim | `pnpm run ui:playthrough -- --check` | PASS (no drift) |
| Persistence bridge (atomic write) | `cd src-tauri && cargo test --locked` | 1/1 |
| Desktop crate + frontend embed | `cd src-tauri && cargo build --locked` | PASS |

The `test:ui` suite proves the interactive layer drives the authoritative sim:
UI-command→transition mapping, invalid-action rejection, OPS1 refund + blocked
branches, adverse outcome + recovery, blocked-unloading preservation,
duplicate-submit resistance, **save→serialize→restore exact-phase resume**,
malformed-save rejection, all three Guardians, and repeatability.

## (2) Interactive Windows acceptance — MUST BE EXECUTED BY THE OWNER

**Status: NOT executed by the implementer (headless — no display).** Run these
in an interactive Windows session with the Tauri/WebView2 runtime, then record
results/screenshots in the template.

Build + launch:

```sh
pnpm install
pnpm run ui:build          # compiles the engine + regenerates seeds/transcript
cd src-tauri
cargo run --locked         # or: pnpm run tauri dev
```

| # | Scenario | Steps | Expected | Result (owner to fill) |
| --- | --- | --- | --- | --- |
| A | Launch | run `cargo run` | native window "Harbor Guardians — First Playable Expedition Loop" opens; no crash; offline | ☐ |
| B | Canonical completion | Choose a Guardian → Prepare → Depart → Advance → resolve **full success** → Dock → Unload → Complete | returns to idle-ready; **route-anchor ops = unlocked**; storage/overflow update | ☐ |
| C | Repeat expedition | start a second expedition after B | loop runs again; completed count increments; no incorrect intro replay | ☐ |
| D | Cancellation | Choose Guardian → Prepare → **Cancel**; then "Blocked-cancel demo" → Cancel | refund exact (stock restored); blocked-cancel branch preserves supplies (stays *preparing*) | ☐ |
| E | Adverse outcome | resolve **forced withdrawal** (or retreat/partial) → Dock → Complete → Recover | readiness shows *damaged*; phase *recovering*; recover restores readiness | ☐ |
| F | Overflow / blocked unload + recovery | "Overflow demo" → run to Dock → (blocked) **Free capacity** → discard from Overflow → **Resume unloading** → repeat until empty → **Complete** | Storage/Overflow fill; remainder **stays aboard (blocked)**; Complete refused until empty; discard frees room; resume drains cargo to zero; then Complete succeeds — **no dead-end** | ☐ |
| G | Save & relaunch | at a non-Harbor phase click **Save**, close the window, relaunch | resumes the exact phase/state/actions; no reroll/duplication; complete the loop | ☐ |
| H | Stability | throughout A–G | no crash, dead end, silent loss, duplicated value, invalid transition, or reroll | ☐ |

Record for the session: exact date, OS build, `cargo`/WebView2 versions, the
commands run, scenarios executed, observed results, and any screenshots or
concise notes. Do not mark a row complete unless it was actually observed.

## Boundary / known limitations

- The desktop persistence bridge serializes with the real `canonicalSerialize`,
  migrates with the real `migrateSaveBlobToCurrent`, and validates with the
  sim's shared structural invariants (`assertExpeditionDomainValid`,
  `fromResourceBands`, `assertClaimStateValid`). The **ajv JSON-Schema gate**
  remains in the Node/test save pipeline (unchanged, still tested); the desktop
  bridge uses the shared structural validators — a deliberate Alpha bound.
- Single local save file; no multi-slot browser, no cloud, no accounts, no
  networking (A4 exclusions / later phases).
- Minimal Alpha styling; no animation, controller support, accessibility
  certification, installers, or packaging (FUTURE BUILD).
