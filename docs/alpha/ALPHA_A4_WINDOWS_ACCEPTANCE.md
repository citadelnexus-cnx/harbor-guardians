# Alpha A4 — Windows Desktop Acceptance

Acceptance evidence for the **interactive** Windows player flow of the Bounded
First Playable Expedition Loop (owner Alpha A4 authorization 2026-07-23,
Option A; PR #21 review correction — the earlier read-only transcript viewer
was rejected as not playable).

> **Evidence integrity note.** This document distinguishes **(1) automated
> evidence executed by the implementer** (headless, reproducible) from
> **(2) interactive Windows evidence that must be executed by the owner** in a
> real desktop session. The implementer runs in a headless environment with no
> display and **cannot** launch or click through a native GUI window; it makes
> no interactive claim of its own. Section (2) below now records the **owner's**
> interactive execution and disposition — the results there are the owner's,
> observed in a real Windows desktop session, not the implementer's.

## Owner acceptance disposition

- **Disposition: PASS.**
- **Acceptance date:** 2026-07-23.
- **Executed by:** Owner (Anthony Hammon).
- **Environment:** Interactive Windows desktop session (native Tauri window;
  mouse-driven; offline — no network connection required or observed).
- **Scope executed:** Scenarios **A–H** plus the **destructive-discard safety**
  procedure below, all against PR #21 head
  `0495358df891215b6725824114bba068b8eb8f72`.
- **Result:** every verified area returned PASS; no crash, dead-end,
  unrecoverable phase, negative balance, silent deletion, duplicate transfer, or
  unintended reroll was observed.
- **Evidence:** the owner captured a screenshot sequence spanning launch, the
  canonical first completion, repeat expedition, cancellation/OPS1, adverse
  outcome + recovery, overflow/blocked-unload recovery, the destructive-discard
  confirmation, and save/relaunch/resume. Screenshots are held with the owner's
  acceptance record; per repository policy the binaries are **not** committed —
  the per-scenario observations recorded below are the durable in-repo evidence.
- **This disposition records acceptance of the interactive flow only.** It does
  **not** promote, merge, close, or deploy anything: Alpha A4 remains
  **REVIEW / ACCEPTANCE PASSED — PENDING PR PROMOTION AND MERGE** until the owner
  promotes and merges PR #21 (`CLAUDE.md` §4/§7).

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
  **Owner retest of the full interactive flow: PASS (2026-07-23)** — the blocked
  unload exposed the Harbor-management recovery path; explicit bounded discards
  created capacity; resume moved only what fit; cargo reached zero and completion
  became available; no dead-end or silent loss remained (see scenario F below).

- **Finding 2 (destructive discard had no confirmation, corrected).** Owner
  found that discard actions (e.g. "Discard 900 Iron from unsafe Overflow")
  executed immediately and irreversibly, and could be triggered by the numbered
  keyboard shortcuts — no confirmation, no cancel. **Correction (UI/controller
  only):** selecting a discard now opens a **destructive-action confirmation**
  ("Permanently discard N of a resource from a named band? … cannot be undone") offering exactly
  **Confirm** and **Cancel**. Selecting mutates nothing (no authoritative
  command, no stock change). **Cancel** clears it and changes nothing.
  **Confirm** issues the existing authoritative `jettison` exactly once
  (idempotent — a duplicate Confirm never double-discards) and returns to the
  Harbor-management actions. While a confirmation is open, **only Confirm/Cancel
  are offered** — every other management shortcut is suppressed, so a number key
  cannot bypass it. The pending confirmation is **transient UI state, never
  persisted**: saving during it stores only the last committed state, and
  reload never executes a pending discard. Proven by six new
  `tests/ui-controller.test.ts` safety tests. **Owner confirmation retest: PASS
  (2026-07-23)** — selecting discard opened a distinct confirmation showing the
  exact resource, quantity, band, and irreversible effect; Cancel left storage
  and cargo unchanged; Confirm removed exactly the stated amount from the stated
  band; cargo stayed unchanged until Resume unloading; keyboard actions did not
  visibly bypass confirmation (see scenario F and the destructive-discard safety
  results below).

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
| Interactive controller (UI→sim mapping, blocked-unload recovery, discard confirmation) | `pnpm run test:ui` | 18/18 |
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

## (2) Interactive Windows acceptance — OWNER-EXECUTED (PASS, 2026-07-23)

**Status: executed by the owner in an interactive Windows desktop session —
disposition PASS.** The implementer did not (and cannot) run the GUI; the results
below are the owner's recorded observations. The build + launch steps and
scenario procedure are retained for reproducibility.

Build + launch:

```sh
pnpm install
pnpm run ui:build          # compiles the engine + regenerates seeds/transcript
cd src-tauri
cargo run --locked         # or: pnpm run tauri dev
```

| # | Scenario | Steps | Expected | Result (owner-observed 2026-07-23) |
| --- | --- | --- | --- | --- |
| A | Launch | run `cargo run` | native window "Harbor Guardians — First Playable Expedition Loop" opens; no crash; offline | **PASS** — native window opened, interface rendered correctly, mouse controls operated; no startup crash, blank state, or required network connection |
| B | Canonical completion | Choose a Guardian → Prepare → Depart → Advance → resolve **full success** → Dock → Unload → Complete | returns to idle-ready; **route-anchor ops = unlocked**; storage/overflow update | **PASS** — Guardian selected, supplies reserved and consumed, route advanced, outpost resolved, cargo returned and unloaded, first expedition completed, route-anchor operations unlocked |
| C | Repeat expedition | start a second expedition after B | loop runs again; completed count increments; no incorrect intro replay | **PASS** — a second expedition completed, completed-expedition counter advanced, existing storage and unlock state persisted, first-completion gating did not block repeat use |
| D | Cancellation | Choose Guardian → Prepare → **Cancel**; then "Blocked-cancel demo" → Cancel | refund exact (stock restored); blocked-cancel branch preserves supplies (stays *preparing*) | **PASS** — normal pre-departure cancellation refunded supplies exactly; full-cap cancellation blocked safely; supplies remained preserved aboard when the refund could not fit (OPS1) |
| E | Adverse outcome | resolve **forced withdrawal** (or retreat/partial) → Dock → Complete → Recover | readiness shows *damaged*; phase *recovering*; recover restores readiness | **PASS** — forced withdrawal produced damaged vessel, crew, and Guardian readiness; retreat produced the defined degraded readiness state; recovery phase and action appeared; bounded recovery restored readiness and normal expedition availability |
| F | Overflow / blocked unload + recovery + discard confirmation | "Overflow demo" → run to Dock → (blocked) **Free capacity** → select a discard → **confirm the destructive prompt** (try **Cancel** first — nothing changes) → **Resume unloading** → repeat until empty → **Complete** | Storage/Overflow fill; remainder **stays aboard (blocked)**; Complete refused until empty; selecting a discard shows a confirmation and changes nothing; Cancel is safe; Confirm discards once (a number key cannot bypass it); resume drains cargo to zero; then Complete succeeds — **no dead-end, no accidental discard** | **PASS** — Safe, Exposed, and unsafe Overflow bands displayed separately with the Overflow cap shown; full capacity caused cargo to remain aboard; blocked unloading exposed the Harbor-management recovery path; explicit bounded discards created capacity; resume unloading moved only what fit; cargo reached zero and completion became available; no dead-end or silent loss remained |
| G | Save & relaunch | at a non-Harbor phase click **Save**, close the window, relaunch | resumes the exact phase/state/actions; no reroll/duplication; complete the loop | **PASS** — an active returning state was saved, the app closed and relaunched, and load restored the same phase, Guardian, outcome, cargo, storage quantities, unlock status, completed-expedition count, and available action; no reroll, duplicate transfer, or state reset observed |
| H | Stability | throughout A–G | no crash, dead end, silent loss, duplicated value, invalid transition, or reroll | **PASS** — no crash, frozen control, unrecoverable phase, negative balance, silent deletion, duplicate transfer, or unintended reroll observed during the owner-executed scenarios |

### Destructive-discard safety (owner-observed 2026-07-23) — PASS

- Selecting discard opened a distinct confirmation state.
- The warning showed the exact resource, quantity, band, and irreversible effect.
- Only **Confirm** and **Cancel** were available.
- **Cancel** preserved storage and cargo unchanged.
- **Confirm** removed exactly the stated amount from the stated band.
- Cargo remained unchanged until **Resume unloading**.
- Subsequent unloading completed safely.
- Keyboard actions did not visibly bypass confirmation.

Session record: owner-executed on **2026-07-23** in an interactive Windows
desktop session; scenarios **A–H** and the destructive-discard safety procedure
were run against PR #21 head `0495358`; observed results are recorded above; a
screenshot sequence covering these scenarios is held with the owner's acceptance
record (binaries not committed, per repository policy).

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
