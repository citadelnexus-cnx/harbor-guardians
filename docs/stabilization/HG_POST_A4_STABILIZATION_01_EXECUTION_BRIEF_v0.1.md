---
title: "Harbor Guardians — HG-POST-A4-STABILIZATION-01 Execution Brief"
doc_id: "HG_POST_A4_STABILIZATION_01_EXECUTION_BRIEF"
version: 0.1
date: 2026-07-23
status: ACTIVE — records the scope of the owner's HG-POST-A4-STABILIZATION-01 authorization (2026-07-23). This is a bounded, non-phase post-Alpha-A4 integrity and verification stabilization lane, NOT Alpha A5. Authorization to implement is gated on the merge of the authorization-record PR that lands this brief and its companion governance amendments; the brief itself carries no implementation permission before that merge.
owner: Anthony Hammon
source: "Owner HG-POST-A4-STABILIZATION-01 authorization 2026-07-23 (bounded non-phase stabilization lane); source audit HG-POST-A4-INDEPENDENT-CODE-REVIEW-01; ALPHA_A4_EXECUTION_BRIEF v0.1 (closed Bounded First Playable Expedition Loop, save v4); SAVE_LOAD_TIME_RECONCILIATION_SPEC (migration pattern); SIM_HARNESS_ACCEPTANCE_SPEC; CLAUDE.md §2/§3/§4/§5/§6/§7"
classification: post-A4 stabilization (NOT an Alpha phase). Strengthens continuous verification, save integrity, command-replay resistance, controller authority boundaries, and deterministic UI action generation over the CLOSED Alpha A4 implementation. Adds no gameplay and reopens no Alpha A4 feature scope.
baseline_sha: b4ff741a0e1ed4956e5eb3e2e2fabafe861a0b83
---

# Harbor Guardians — HG-POST-A4-STABILIZATION-01 Execution Brief (v0.1)

## 1. Identity

- **Lane name:** HG-POST-A4-STABILIZATION-01 — Bounded post-Alpha-A4 integrity and verification stabilization.
- **Authorization date:** 2026-07-23.
- **Owner:** Anthony Hammon.
- **Source audit:** HG-POST-A4-INDEPENDENT-CODE-REVIEW-01.
- **Audit disposition:** Blocking 0 · High 3 (H1, H2, H3) · Medium 3 (M1, M2, M3) · Low 2 · Accepted Alpha limitations 3.
- **Exact baseline:** `main` = `origin/main` = `b4ff741a0e1ed4956e5eb3e2e2fabafe861a0b83`.
- **Classification:** This is a **post-A4 stabilization lane**, not an Alpha phase. It is **not Alpha A5** and authorizes **no new player capability**. It is a non-phase integrity and verification lane over the **closed** Alpha A4 implementation.
- **Governing authority:** The full authorization text is held privately by the owner outside this public repo, like the M0, A0, A1, A2, A3, and A4 records (`CLAUDE.md` §7). This brief records the public-safe scope so every stabilization PR traces to it.
- **Implementation gate:** This brief authorizes stabilization implementation **only after** the authorization-record PR that lands it (this document plus the `CLAUDE.md` §7, `docs/alpha/README.md`, and `docs/progress/PROJECT_PROGRESS_LEDGER.md` amendments) is reviewed and merged to `main` by the owner. Until that PR merges, the lane is **AUTHORIZATION RECORD IN REVIEW** and no code, schema, data, save, test, CI, or UI change may begin.

## 2. Purpose

Strengthen continuous verification, save integrity, command-replay resistance, controller authority boundaries, and deterministic UI action generation **without adding gameplay or reopening Alpha A4 feature scope**. Alpha A4 remains CLOSED; this lane hardens what was already delivered. It converts no new invariant merely because verification, validation, command identity, or enumeration purity improve.

## 3. Authorized technical scope

The following remediation targets are authorized. Each is bounded to correcting an audited integrity/verification weakness; none introduces new player-facing capability.

### H1 — Complete A4 CI gate

CI must continuously execute the **complete** Alpha A4 verification suite. Authorized:

- `test:expedition`;
- `test:ui`;
- generated browser-engine build/drift verification;
- `ui:playthrough -- --check`;
- `cargo test --locked`;
- `cargo build --locked`;
- line-ending normalization required for deterministic generated artifacts (so byte-identical checks are reproducible on Windows and Linux);
- correction of stale CI labels and package descriptions.

### H2 — Unified save validation

One save contract, enforced identically on both save paths. Authorized:

- one browser-compatible / precompiled `SaveBlob` schema validator **generated from the existing committed schema**;
- reuse of the **same semantic validation rules** in the Node and desktop paths;
- desktop validation **after migration and before load acceptance**;
- desktop validation **before persistence**;
- refactoring pure semantic checks into a browser-safe shared module;
- generated-validator drift checks;
- tests proving malformed non-expedition blocks and event identities are rejected through the desktop/controller path.

**No second save contract may be authored manually.** The desktop and canonical Node paths must enforce **one** contract.

### H3 — Bounded committed-command replay protection

Replace last-command-only duplicate protection with a persisted, bounded, phase-appropriate committed-command identity record. Authorized:

- replacing last-command-only duplicate protection with a persisted, bounded, phase-appropriate committed-command identity record;
- deterministic command-record ordering;
- exact duplicate rejection **across intervening commands**;
- save/reload preservation of the record;
- deterministic migration if the `SaveBlob` contract must change;
- **save schema version v5 and deterministic v4→v5 migration only if technically required** for an honest persisted command record.

The chosen design **must**:

- reject replay of any command **still relevant to the active expedition**;
- **not** depend only on the immediately preceding command;
- **avoid an unbounded global history**;
- define explicit reset/pruning rules;
- preserve all A0–A4 state;
- **not** invent gameplay transactions or networking.

### M1 — Controller action authority

The controller must enforce semantic action eligibility. Authorized:

- semantic action eligibility enforcement inside the controller;
- rejection of stale, fabricated, altered, or currently-unavailable action descriptors;
- authoritative sim phase guards retained as **defense in depth** (not removed);
- tests for direct programmatic bypass attempts.

### M2 — Pure action enumeration

Enumerating available actions must not mutate state. Authorized:

- making `view()` and `availableActions()` **side-effect free**;
- allocating command IDs only when an action is **selected or committed** (never during enumeration/render);
- stable action descriptors independent of render frequency;
- tests proving repeated rendering does not change serialized state, counters, command identity, or subsequent behavior.

### M3 — Conditional protected over-cap abstraction

A forward-compatible protected-over-cap abstraction is authorized for **assessment and implementation only when all of the following conditions hold**. It may be implemented **only if**:

- it fits naturally into the **same save-contract change already required by H3** (it does not justify its own contract change);
- **no new storage capacity mechanic** is added;
- **no player-facing progression or economy system** is introduced;
- legitimate previously-valid over-cap value can be **distinguished** from malformed or tampered state;
- new deposits/unloads **cannot increase** protected over-cap holdings;
- withdrawals or explicit confirmed discard **can reduce** them;
- existing value is **never truncated**;
- tests prove save/load preservation and withdrawal-only behavior;
- implementation remains **small and localized**.

**If legitimate provenance cannot be represented without broad architecture, capacity-history infrastructure, or speculative gameplay, M3 must be recorded as DEFERRED WITH RATIONALE rather than implemented.** M3 is narrow-or-defer; it is never a reason to expand the save contract, the storage model, or gameplay.

## 4. Save-version decision boundary

The implementation lane **must assess** whether H3 requires save schema **v5**. There is no predetermined answer; the decision is recorded explicitly in the PR evidence either way.

**If v5 is required:**

- add **one** deterministic v4→v5 migration;
- commit a canonical v4 fixture;
- preserve **every** A0–A4 block;
- reject impossible/tampered v4 claims;
- update the generated schema (D39 pipeline; no hand-authored JSON Schema);
- extend the S5/S7 proofs to the v5 round-trip and crash-survival;
- **do not** claim a new invariant conversion merely because the schema changed.

**If v5 is not required:**

- document how replay protection persists honestly under **v4** without overloading or misusing an existing field.

**No silent in-place v4 contract mutation is permitted.** Either a clean, migrated v5 or an honest, documented v4 representation — never a quiet reshape of the v4 contract.

## 5. Hard exclusions

This lane authorizes none of the following. Each remains fail-loud / not authorized:

- Alpha A5 or later;
- new expeditions, routes, outposts, events, rewards, Guardians, or party systems;
- combat, raids, factions, threat director, economy pulses;
- markets, trading, crafting, full Cargo or Inbox;
- new Claim Ledger source types;
- production packaging, deployment, release, installer, networking, or cloud saves;
- unrelated refactors or formatting sweeps;
- dependency upgrades unless strictly required **and separately justified**;
- invariant conversions unrelated to fully proven stabilization behavior.

## 6. Expected implementation areas

Implementation, once authorized by the merge of this authorization-record PR, is expected to touch only the areas below. Anything outside these areas requires explicit justification and is otherwise a stop condition (`CLAUDE.md` §6).

- `.github/workflows/ci.yml`
- `.gitattributes`
- `package.json` (descriptive / scripts fields)
- `src/contracts/save-blob.ts`
- `src/contracts/expedition.ts`
- `schema/save_blob.schema.json` (generated via the D39 pipeline)
- `scripts/build-schema.mjs`
- scripts or generated-validator build tooling
- `src/save/`
- `src/sim/expedition.ts`
- `src/ui/controller.ts`
- browser-engine generated outputs
- `tests/`
- sim-harness **only** where existing save/determinism proof integration requires it
- stabilization and progress documentation

## 7. Verification requirements

The stabilization implementation must run and record the following, and CI must execute the **complete** stabilized gate:

```
pnpm run typecheck
pnpm run lint
pnpm run schema:validate
pnpm run sim:harness
pnpm run test:harbor
pnpm run test:ledger
pnpm run test:events
pnpm run test:save
pnpm run test:expedition
pnpm run test:ui
pnpm run ui:playthrough -- --check
pnpm run ui:build            # or the approved generated-artifact build/drift command
```

```powershell
Push-Location .\src-tauri
cargo test --locked
cargo build --locked
Pop-Location
```

CI must execute the complete stabilized gate (the whole suite above, including `test:expedition`, `test:ui`, the generated-artifact build/drift check, `ui:playthrough -- --check`, and the two `cargo` steps) so no part of the Alpha A4 verification set can silently rot.

## 8. Invariant boundary

**Current state: 132 registered / 17 implemented / 115 fail-loud.**

**Expected default: unchanged.**

Do **not** convert a new invariant merely because:

- CI becomes stronger;
- save validation is unified;
- command identity tracking is improved;
- action enumeration becomes pure.

Any proposed invariant conversion requires a **separate exact proof and owner review**. S5/S7 may be *extended* to a new save round-trip (as at prior phases) without that being a new conversion; a genuine stub→implemented transition still requires its own proof.

## 9. Exit condition

The stabilization implementation is complete **only** when all of the following hold:

- H1–H3 and M1–M2 are corrected;
- M3 is either narrowly implemented under **all** its §3 conditions or **explicitly deferred with rationale**;
- all tests are green;
- generated artifacts are reproducible on Windows;
- desktop and canonical save validation enforce **one** contract;
- replay tests prove an older command **cannot** execute after intervening commands;
- stale/fabricated UI actions are rejected;
- action enumeration is pure (repeated rendering changes no serialized state, counter, or command identity);
- **no A5 capability or gameplay expansion occurred**;
- exactly **one controlled draft PR** is open and remains **unmerged** until the owner reviews, promotes, and merges it.

Closure requires an owner-approved merge and a clean post-merge reconciliation of `CLAUDE.md` §7, `docs/alpha/README.md`, and `docs/progress/PROJECT_PROGRESS_LEDGER.md`. The Implementer never marks the PR ready and never merges (`CLAUDE.md` §4).

## 10. Governance position

- Alpha A4 remains **CLOSED** (PR #21 merged as `08f84deffd68a0b7eeeff47ab84612d877708d60`).
- Alpha A5 and later remain **NOT AUTHORIZED** — no scope, brief, branch, or implementation permission exists.
- HG-POST-A4-STABILIZATION-01 is **AUTHORIZED** as a bounded non-phase stabilization lane.
- No new gameplay, deployment, or production activation is authorized.
- Implementation is gated on merge of the authorization-record PR.
- Authorized implementation branch (only after that merge): **`stabilization/post-a4-integrity-01`**.
- Draft PR only; closure requires owner-approved merge and post-merge reconciliation.

*HG-POST-A4-STABILIZATION-01 brief v0.1 — bounded post-Alpha-A4 integrity and verification stabilization. Authority derives from the private owner authorization record (2026-07-23) and this public-safe brief. Implementation is gated on the merge of the authorization-record PR. Escalation on any boundary question per `CLAUDE.md` §6.*
