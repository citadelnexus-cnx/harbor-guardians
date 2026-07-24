# Harbor Guardians — Project Progress Ledger

**Status: TRACKING RECORD — not gameplay doctrine.**

This document tracks phase progress and authorization state across the whole project, from the pre-implementation document foundation through a hypothetical Production gate. It does not authorize anything, does not invent scope, and is not a substitute for `CLAUDE.md` §7 (current scope) or the `docs/alpha/*_EXECUTION_BRIEF_*` documents, which remain the governing record for what an Implementer may do at any given time.

**The durable source of truth is the GitHub repo itself** — merged pull requests, their CI evidence, and `main`'s commit history — not this ledger. This ledger is a convenience index over that history, updated after the fact. If this document and the merged PR record ever disagree, the PR record wins and this document is corrected.

**Owner authorization is required before each implementation stage begins.** Every phase past the document foundation started only after a distinct, explicit owner authorization; no phase in this ledger was self-authorized by the Implementer, and none of the authorization records themselves are reproduced here (per `CLAUDE.md` §7, they are held privately by the owner outside this public repo). Entries below describe *what was authorized and what was built*, in public-safe summary form, with dates and PR numbers as the verifiable evidence.

## Status legend

| Status | Meaning |
| --- | --- |
| **CLOSED** | The phase's exit condition was met, its evidence merged, and the owner accepted it as complete. No further work happens under that phase's authorization. |
| **AUTHORIZED** | The owner has issued authorization for this phase and work is permitted, but the phase has not yet been declared closed. |
| **IN PROGRESS** | Work is actively underway under a current authorization; not yet at a review or exit gate. |
| **REVIEW** | Work is complete and evidence is presented (e.g. a draft PR open) awaiting owner review before closure. |
| **HOLD** | Work that was in progress has been paused; the phase is neither closed nor actively continuing. |
| **NOT AUTHORIZED** | No owner authorization exists for this phase. No implementation work may begin. |
| **FUTURE** | A phase anticipated by the project's structure but not yet reached, defined, or scheduled; distinct from NOT AUTHORIZED in that it may not yet have a name, brief, or defined boundary at all. |

## Current control state

| Area | Status |
| --- | --- |
| Foundation / Document Foundation | CLOSED |
| Milestone 0 | CLOSED |
| Pre-Alpha Docs | CLOSED |
| Alpha A0 | CLOSED |
| Alpha A1 | CLOSED |
| Alpha A2 | CLOSED |
| Alpha A3 | CLOSED |
| Alpha A4 | CLOSED — Option A implementation merged (PR #21 → `main` `08f84de`, 2026-07-23); owner interactive Windows acceptance PASS; 132/17/115; save v4 |
| HG-POST-A4-STABILIZATION-01 (non-phase stabilization lane) | IMPLEMENTED / IN REVIEW — owner authorization 2026-07-23; source audit HG-POST-A4-INDEPENDENT-CODE-REVIEW-01 (Blocking 0 / High 3 / Medium 3 / Low 2 / Accepted Alpha limitations 3); H1–H3 + M1–M2 implemented, M3 DEFERRED WITH RATIONALE; save schema **v5** (deterministic v4→v5 migration); invariant boundary unchanged (132/17/115); draft PR on `stabilization/post-a4-integrity-01` awaiting owner review; not Alpha A5; adds no gameplay; A4 stays CLOSED |
| Alpha A5–A6 | FUTURE — NOT AUTHORIZED |
| Beta | FUTURE |
| Production | FUTURE |
| Gameplay loop | Only the bounded A4 first-playable expedition loop (Option A) is authorized; every other/general gameplay loop remains NOT AUTHORIZED |
| Event rewards / effect execution / real event content | NOT AUTHORIZED (A4 reuses the existing EVT1–EVT4 lifecycle only — no reward generation, no effect execution, no real event content) |
| Combat / raids / factions / cargo voyages | NOT AUTHORIZED |
| Guardian system (progression / roster / evolution / equipment / combat powers) | NOT AUTHORIZED — A4 uses only a fixed starting Guardian (Raxa/Tarin/Nova) as an equivalent sidegrade |
| Gameplay UI | NOT AUTHORIZED beyond the minimal Alpha-quality Windows desktop interface for the A4 loop |
| Deployment / production packaging | NOT AUTHORIZED |

## Phase ledger

### Foundation / Document Foundation

- **Status:** CLOSED
- **Purpose:** Establish the design doctrine before any code exists — the Blueprint, decision register, foundation docs (Economy, Combat, Build Queue, Reward Claim Ledger, Inbox, Ship Hold/Cargo, Threat/Raid Director, Accessibility, Content Schema, Onboarding, Gear), Phase-B content docs (World Atlas, Faction Codex, Guardian Sanctum & Kit, kit sheets), the external design review, and the Design Pillars.
- **Durable evidence:** `docs/foundation/` (18-doc foundation set + index `00_FOUNDATION_SET_INDEX_v1.3.md`), `docs/phase-b/`, `docs/reviews/` (`13_DESIGN_REVIEW_DISPOSITION_v0.2.md`, `EXTERNAL_DESIGN_REVIEW_2026-07-12.md`), `docs/14_DESIGN_PILLARS_v0.1.md`, `docs/00_PRE_M0_MASTER_MANIFEST_v1.3.md`, `DECISIONS.md` (D1–D40, W-D, F-D, G-D, R-D series).
- **Implemented invariants:** none — this phase is doctrine only, predates the sim harness and the invariant registry.
- **Remaining blocked scope:** none for this phase itself; it is the source doctrine that later phases implement against. Individual documents remain marked `APPROVED-FOR-REVISION` / `PLANNING-LOCKED` rather than final canon — see each document's own status line.
- **Next authorization gate:** Milestone 0 (already passed).

### Milestone 0

- **Status:** CLOSED
- **Purpose:** Stand up the build environment, repo scaffold, operating rules, CI gate, and a pure headless sim-harness skeleton — no gameplay. Defined by `docs/M0_IMPLEMENTATION_READINESS_PACKET_v0.1.3.md`.
- **Durable evidence:** PRs #1–#10 (permission lists, scaffold, `CLAUDE.md`/`AGENTS.md`/`DECISIONS.md`, schema/data contracts, sim-harness skeleton, save/load skeleton, Tauri shell, CI gate + PR template, CI gate proof), exit evidence in `M0_EXIT_EVIDENCE.md` (PR #11).
- **Implemented invariants:** S5, S7 at empty-shell scope (2 of what was then a 122-entry registry).
- **Remaining blocked scope:** all gameplay; M0 authorized infrastructure only.
- **Next authorization gate:** Alpha A0 (separate owner authorization, distinct from the M0 gate per `M0_EXIT_EVIDENCE.md` §9).

### Pre-Alpha Docs

- **Status:** CLOSED
- **Purpose:** Deliver two named pre-Alpha reference documents queued by the external review disposition (R-D3): `18_DIFFICULTY_PHILOSOPHY_v0.2` (challenge/accessibility/loss-boundary doctrine, consolidating existing invariants) and `15_EVENT_SYSTEM_SPEC_v0.2` (event lifecycle spec, feeding the Alpha A0 EVT stub registration). Document-channel work; no code.
- **Durable evidence:** PR #13 (`docs/pre-alpha/18_DIFFICULTY_PHILOSOPHY_v0.2.md`, `docs/pre-alpha/15_EVENT_SYSTEM_SPEC_v0.2.md`, `docs/pre-alpha/README.md`).
- **Implemented invariants:** none directly — these are reference/spec documents; `15_EVENT_SYSTEM_SPEC_v0.2` §5 supplies the EVT1–EVT10 statements registered (as stubs) in Alpha A0.
- **Remaining blocked scope:** neither document is yet accepted into full repo doctrine status; both are explicitly pre-Alpha references per their own status lines.
- **Next authorization gate:** Alpha A0.

### Alpha A0

- **Status:** CLOSED
- **Purpose:** Planning and harness preparation only — register EVT1–EVT10 (from `15_EVENT_SYSTEM_SPEC_v0.2` §5) as addressable, fail-loud invariant stubs; no event logic, no gameplay.
- **Durable evidence:** PR #14 (`docs/alpha/ALPHA_A0_EXECUTION_BRIEF_v0.1.md`, `docs/alpha/README.md`, EVT1–EVT10 registered in `sim-harness/registry.ts`). Owner authorization dated 2026-07-15 (record held privately, per `CLAUDE.md` §7).
- **Implemented invariants:** none newly implemented; registry grew 122 → 132 IDs, all EVT entries registered as fail-loud stubs (verified throwing `InvariantStubError`).
- **Remaining blocked scope:** all gameplay; no event lifecycle logic, no harbor state, no UI.
- **Next authorization gate:** Alpha A1.

### Alpha A1

- **Status:** CLOSED
- **Purpose:** Minimal Harbor State and Resource Spine — deterministic per-`CoreResource` 3S storage state (Safe S / Exposed 2S / Total 3S, D1), schema-backed seed data, selected honest invariant conversion, save/load compatibility only as needed.
- **Durable evidence:** PR #15 (`docs/alpha/ALPHA_A1_EXECUTION_BRIEF_v0.1.md`, `src/sim/harbor-state.ts`, `src/contracts/resource-storage.ts`, `data/economy/storage.st1.json`, `schema/resource_storage_seed.schema.json`). Owner authorization dated 2026-07-16.
- **Implemented invariants:** DC1, DC4, DC5, DC6 (converted from stub); S5 extended with the stocked seeded-storage round-trip. Running total after A1: 6 implemented, 126 fail-loud stubs, 132 registered.
- **Remaining blocked scope:** no gameplay loop (production/pulses/upkeep/decay), no events beyond A0's fail-loud stubs, no expeditions/combat/raids/guardians/factions/cargo, no gameplay UI, no deployment.
- **Next authorization gate:** Alpha A2.

### Alpha A2

- **Status:** CLOSED
- **Purpose:** Claim Ledger and Reward Routing — the minimal spine to prove earned rewards can be represented, routed, partially claimed, blocked safely at capacity, and preserved without hidden loss, using **test-supplied** reward packages only (no gameplay reward source).
- **Durable evidence:** PR #16 (`docs/alpha/ALPHA_A2_EXECUTION_BRIEF_v0.1.md`, `src/sim/claim-ledger.ts`, `src/contracts/claim-ledger.ts` / `claim-ledger-rules.ts`, `data/rewards/claim_ledger_rules.json`, `src/save/migrations.ts` [`save_schema_version` 1→2], `sim-harness/ledger-checks.ts`), plus a follow-up review-cleanup commit on the same PR (mirrored v1-tamper refusal for `pending_reward_resolution`; fixed a stale DC6 probe base shape). Owner authorization dated 2026-07-17.
- **Implemented invariants:** L1, L5, L6, L7, L11, L14 (converted from stub, at explicitly A2-scoped evidence); S5 extended with the reward-bearing ledger round-trip; S7 upgraded to crash-simulate over reward-bearing saves. Running total after A2: **12 implemented, 120 fail-loud stubs, 132 registered.**
- **Remaining blocked scope:** no gameplay reward source (packages are test-supplied only — `source_type` is schema-literal `"test_supplied"`); cargo/gear/auto-receipt reward routes are structurally present but fail loud if routed; no System Inbox; no raid-phase claim matrix (L8/L9 stay fail-loud); no story-claim harbor transfer; no gameplay UI, deployment, or production packaging.
- **Next authorization gate:** Alpha A3 (already passed and closed; see below).

### Alpha A3

- **Status:** CLOSED
- **Purpose:** Expedition and Event Skeleton, Option A only — lifecycle mechanics without gameplay effects, event rewards, or a gameplay loop.
- **Authorization:** limited owner authorization dated 2026-07-18; public-safe boundary recorded in `docs/alpha/ALPHA_A3_EXECUTION_BRIEF_v0.1.md`.
- **Durable evidence:** PR #18, reviewed head `2a1254f147c56bc9742726ea0bbf339cfc67d0a3`, squash commit `245b73215cf9b098b8f54eaa559dabc1b49703d4`, CI run #41 successful.
- **Delivered:** typed `Event` / `Condition` / `Outcome` / inert `Effect` contracts; generated schema-backed test fixtures only; deterministic nine-label lifecycle transitions; observable trigger evaluation limited to implemented A1 harbor and A2 Claim Ledger state; real-save-path event persistence through save schema v2→v3; full staged-effect descriptor integrity; non-empty and unique persisted `instance_id` enforcement.
- **Implemented invariants:** EVT1, EVT2, EVT3, EVT4.
- **Verification:** `test:events` 21/21; `test:ledger` 16/16; `test:save` 20/20; `test:harbor` 9/9; sim harness A3 BATCH GREEN.
- **Result:** **16 implemented, 116 fail-loud stubs, 132 registered.**
- **Remaining blocked scope:** EVT5–EVT10, event reward generation, event-to-Claim-Ledger delivery, any new Claim Ledger `source_type`, effect execution or dispatch, real event content, gameplay loop, combat, raids, threat behavior, guardians, factions, cargo voyages, gear gameplay, Harbor Inbox/messages, gameplay UI, deployment, and production work.
- **Next authorization gate:** a separate owner architecture decision defining a bounded Alpha A4 scope. A3 closure does not imply or authorize A4.

### Alpha A4

- **Status:** CLOSED. Option A implementation complete, independently reviewed and corrected, owner-accepted in an interactive Windows session (PASS), CI-green, and squash-merged via PR #21.
- **Decision date:** 2026-07-23 (authorization); implementation drafted 2026-07-23; owner Windows acceptance 2026-07-23; closed 2026-07-23.
- **Merged main SHA:** `08f84deffd68a0b7eeeff47ab84612d877708d60` (PR #21 squash-merge; source head `b49c999fceeffc880f9c95e9e1ee8837720d95cd`).
- **Purpose:** Bounded First Playable Expedition Loop — one canonical, repeatable, deterministic, save-safe early-game Harbor → route-anchor-outpost → Harbor loop, non-combat, using already-valid Claim Ledger routing (the Ledger is untouched) and the existing EVT1–EVT4 lifecycle only.
- **Controlling brief:** [`docs/alpha/ALPHA_A4_EXECUTION_BRIEF_v0.1.md`](../alpha/ALPHA_A4_EXECUTION_BRIEF_v0.1.md) (public-safe scope; authority from the private owner authorization record dated 2026-07-23, per `CLAUDE.md` §7).
- **Pre-implementation baseline SHA:** `b46c2d09bf25b809c1671265225bc2f0d0498287` (`main` = `origin/main` after the authorization-record PR #20 merged) — the point the implementation branch `alpha/a4-first-playable-expedition-loop` forked from. Final merged closure SHA is `08f84de` (above).
- **Correction history (PR #21 independent review):** (1) the initial read-only transcript viewer was rejected and corrected to an **interactive** player flow driving the authoritative sim; (2) a **blocked-unloading deadlock** was corrected with an authoritative bounded capacity-creation (`jettison`) path plus a Harbor-management recovery UI; (3) **destructive discards** were gated behind an explicit confirmation (Confirm/Cancel, keyboard-bypass suppressed, never persisted). All three corrections landed on PR #21 before merge and were re-verified in owner interactive acceptance.
- **Delivered:** typed `expedition` domain + `expedition-seed` contracts and generated `expedition_seed` schema; a pure deterministic expedition state machine (`src/sim/expedition.ts`) with stable duplicate-resistant commands, Theo's-vessel abstraction, the fixed group + starting-Guardian choice, equal-total/distinct-resource Guardian salvage composition, deterministic seeded supplies + consumption, one route + one damaged outpost, bounded EVT1–EVT4 reuse, the five outcomes (cancellation/full/partial/retreat/forced-withdrawal), return/dock/unload with Safe Storage + unsafe Overflow (capped ×3 Safe) + blocked-unload preservation, bounded recovery, first-completion route-anchor unlock, repeatable expeditions, and exact save/exit/relaunch/resume; **save schema v3→v4** (deterministic, idempotent, tamper-refusing migration + committed `save.v3` fixture) for the new `expedition`/`harbor_operations` blocks; one canonical A4 seed + negative fixture; and — after the PR #21 review (which rejected the initial read-only transcript viewer) — an **interactive** Windows desktop player flow: a pure `ExpeditionController` (`src/ui/controller.ts`) mapping player intents onto the authoritative sim, compiled to the webview via `tsc` (`src/ui/shell/engine/`, no bundler/no new dep), and a minimal atomic Tauri persistence bridge (`save_game`/`load_game`) for save/exit/relaunch/resume. The deterministic transcript remains as demonstration/test evidence only.
- **Implemented invariants:** **OPS1** (expedition cancel/refund routing — converted stub→implemented; both the fresh-harbor full-refund and the 3S-block branches), plus **S5/S7 extended** to cover the v4 expedition-bearing round-trip and crash-survival. A4-specific properties (conservation, overflow ×3 cap, blocked-unload preservation, guardian equivalence, duplicate-command resistance, determinism, migration idempotency, UI-command→transition mapping, exact-phase resume) are proven by `tests/expedition.test.ts` + `tests/save-load.test.ts` + `tests/ui-controller.test.ts` without inventing registry IDs.
- **Verification (automated, re-run post-merge on `main` = `08f84de`, all exit 0):** `typecheck`, `lint` (0 warnings), `schema:validate` (13 seeds / 4 sets), `sim:harness` **A4 BATCH GREEN** (132 registered / 17 implemented / 115 fail-loud; determinism byte-identical at seed 20260714), `test:harbor` 9/9, `test:ledger` 16/16, `test:events` 21/21, `test:save` 25/25, `test:expedition` 16/16, `test:ui` 18/18, `ui:playthrough -- --check` (no drift), `cargo test --locked` (persistence bridge) 1/1, `cargo build --locked` (Tauri desktop crate compiles with the interactive frontend + engine embedded). Interactive Windows GUI acceptance (A–H plus destructive-discard safety) is documented in `ALPHA_A4_WINDOWS_ACCEPTANCE.md` and was **executed by the owner** in an interactive Windows desktop session on 2026-07-23 with disposition **PASS** — the implementer's headless environment cannot launch a GUI, so that PASS is the owner's recorded observation, not an implementer claim. (Note: on a Windows checkout with `core.autocrlf=true`, the `test:expedition` and `ui:playthrough --check` byte-identical bundle checks fail against the CRLF working-tree copies of `src/ui/shell/seeds.json`/`playthrough.json`; the committed blobs are LF and CI is green, so this is a local line-ending artifact, not drift.)
- **Result (at closure):** **132 registered / 17 implemented / 115 fail-loud** (adds OPS1 to the 16 prior); save schema **v4**. No unresolved blocking findings.
- **Remaining blocked scope:** all A4 hard exclusions — combat; raids/theft; multiplayer/networking; fleet and full ship progression; crew recruitment and detailed crew systems; full Guardian progression; selectable party and battle formations; equipment and broad loot; full Cargo/Docked Cargo system; trading and markets; unrestricted Claim Ledger `source_type`s; general expedition reward generation; effect execution/dispatch beyond the bounded loop; full Harbor Inbox; full quest framework; Atlas/world traversal; factions; threat director; economy pulses; full city-builder departments; controller certification; deployment; production — plus Alpha A5 and later.
- **Next valid action:** none under A4 — the phase is closed. Preparing an Alpha A5 architecture / authorization decision may begin **only if separately directed by the owner** via a new authorization record and bounded execution brief; no A5+ scope, deployment, or production work is authorized.

### HG-POST-A4-STABILIZATION-01 (non-phase stabilization lane)

- **Status:** IMPLEMENTED / IN REVIEW — implementation complete on branch `stabilization/post-a4-integrity-01`; single draft PR open awaiting owner review. **Not closed** (closure requires an owner-approved merge + post-merge reconciliation).
- **Classification:** A bounded **post-Alpha-A4 integrity and verification stabilization lane**, over the CLOSED Alpha A4 implementation. **It is not an Alpha phase; it is not Alpha A5; it authorizes no new player capability.** Alpha A4 remains **CLOSED**; Alpha A5+ remains **NOT AUTHORIZED**.
- **Decision date:** 2026-07-23 (owner authorization); implementation drafted 2026-07-24.
- **Source audit:** HG-POST-A4-INDEPENDENT-CODE-REVIEW-01 — disposition Blocking **0** / High **3** (H1, H2, H3) / Medium **3** (M1, M2, M3) / Low **2** / Accepted Alpha limitations **3**.
- **Controlling brief:** [`docs/stabilization/HG_POST_A4_STABILIZATION_01_EXECUTION_BRIEF_v0.1.md`](../stabilization/HG_POST_A4_STABILIZATION_01_EXECUTION_BRIEF_v0.1.md) (public-safe scope; authority from the private owner authorization record dated 2026-07-23, per `CLAUDE.md` §7).
- **Authorization-record baseline:** `b4ff741a0e1ed4956e5eb3e2e2fabafe861a0b83`. **Implementation baseline:** `b762f0ba051ae8de3cf3b2bd03532cc511f6aaf6` (`main` = `origin/main` after the authorization-record PR #23 merged) — the point `stabilization/post-a4-integrity-01` forked from.
- **Remediation disposition:**
  - **H1 — IMPLEMENTED.** CI now runs the complete gate (typecheck, lint, schema + precompiled-validator drift, sim-harness, save/harbor/ledger/events/expedition/ui, generated-engine + UI-bundle drift, `ui:playthrough --check`, `cargo test`/`cargo build`). `.gitattributes` pins the byte-compared generated artifacts to LF (removes the documented Windows CRLF false-drift); the package description was refreshed.
  - **H2 — IMPLEMENTED.** One precompiled, browser-safe `SaveBlob` validator generated from the committed schema (`src/save/generated/`, drift-guarded), plus a shared semantic module; both the Node save pipeline and the desktop/controller path validate through the same `assertSaveBlobValid` (before persistence and after migration on load).
  - **H3 — IMPLEMENTED.** The v4 `last_command_id` (last-command-only) is replaced by a bounded, per-expedition `committed_command_ids` record that rejects a duplicate even after intervening commands; bounded twice over (per-expedition reset + FIFO cap `COMMITTED_COMMAND_HISTORY_LIMIT = 64`); persisted in **save schema v5**.
  - **M1 — IMPLEMENTED.** The controller refuses any submitted action that does not match a currently-offered semantic descriptor (stale/fabricated/altered/out-of-mode); the sim phase/domain guards remain as defense in depth.
  - **M2 — IMPLEMENTED.** `view()`/`availableActions()` are side-effect free; command ids are allocated only on select/commit, never during enumeration.
  - **M3 — DEFERRED WITH RATIONALE.** A4 has no runtime capacity-lowering mechanic, so a legitimate over-cap holding cannot arise; distinguishing legitimate over-cap provenance from tampered state would require capacity-history infrastructure (explicitly excluded), and a trust-any-over-cap field would admit tampered value inflation. Future prerequisite: a runtime capacity-change mechanic that can legitimately produce over-cap holdings (none authorized). No code was written for M3.
- **Save-version decision:** H3 introduces a new authoritative persisted field, so **v5 was technically required.** One deterministic **v4→v5** migration seeds the record from the single known v4 `last_command_id` (inventing no history), preserves every A0–A4 block, refuses tampered/impossible v4 claims, and chains v1→v2→v3→v4→v5; a canonical **v4 fixture** is committed. No silent v4-contract mutation.
- **Implemented invariants:** none newly converted. Invariant boundary **unchanged: 132 registered / 17 implemented / 115 fail-loud.** Stronger CI, unified validation, the committed-command record, and pure enumeration are not invariant conversions (per the brief's §8 boundary); S5/S7 proofs were extended to the v5 round-trip without claiming a new conversion.
- **Verification (implementer, headless):** typecheck 0 · lint 0 warnings · schema:validate (incl. H2 validator drift) green · sim:harness A4 BATCH GREEN (132/17/115, determinism byte-identical @ seed 20260714) · test:save · test:harbor · test:ledger · test:events · test:expedition · test:ui all green · generated-engine + UI-bundle drift clean · `ui:playthrough --check` no drift · `cargo test --locked` · `cargo build --locked` green.
- **Remaining blocked scope:** all A4 hard exclusions, all Alpha A5+ scope, deployment, and production — unchanged. This lane added no gameplay, routes, outposts, events, rewards, Guardians, party systems, Claim Ledger source types, networking, or packaging.
- **Next authorization gate:** owner review, promotion, and merge of the single draft PR on `stabilization/post-a4-integrity-01`, then post-merge reconciliation. The Implementer does not mark the PR ready and does not merge (`CLAUDE.md` §4).

### Alpha A5 / A6

- **Status:** FUTURE
- **Purpose:** Not yet named, scoped, or defined by any document. Listed here only as placeholders in the phase sequence used for tracking; their existence, order, and content are not decided.
- **Durable evidence:** none.
- **Implemented invariants:** none.
- **Remaining blocked scope:** everything.
- **Next authorization gate:** not applicable until Alpha A4 closes and a further owner authorization defines the next phase.

### Beta

- **Status:** FUTURE
- **Purpose:** Referenced in existing doctrine as a later milestone (e.g. `R-D3`'s doc queue names World Lore Bible / Guardian Bible / Audio Bible as Beta-timed deliverables; `M0_EXIT_EVIDENCE.md` §7 and the Sim Harness acceptance gates reference a "v1 candidate" / broader-suite-green milestone). Not otherwise scoped.
- **Durable evidence:** none beyond the doctrine references above.
- **Implemented invariants:** none.
- **Remaining blocked scope:** everything.
- **Next authorization gate:** not applicable until the intervening Alpha phases close.

### Production

- **Status:** FUTURE
- **Purpose:** Referenced in `M0_EXIT_EVIDENCE.md` §7 and `CLAUDE.md`/`AGENTS.md` as a gate requiring separate, later criteria (packaging, installers, release artifacts) — explicitly out of scope for every phase closed or authorized so far.
- **Durable evidence:** none.
- **Implemented invariants:** none.
- **Remaining blocked scope:** everything, including all deployment and packaging work.
- **Next authorization gate:** not applicable until Beta closes and production-candidate criteria are defined and authorized.

## Current invariant summary

As of closed Alpha A4 (merged PR #21 → `main` `08f84de`), the sim-harness invariant registry (`sim-harness/registry.ts`) holds:

- **132 total registered invariants** (every ID from the SIM_HARNESS_ACCEPTANCE_SPEC, Doc 07, and later specs is addressable — no ID is ever silently absent).
- **17 implemented and proven green:** L1, L5, L6, L7, L11, L14, S5, S7, **OPS1**, DC1, DC4, DC5, DC6, EVT1, EVT2, EVT3, EVT4. OPS1 (expedition cancel/refund routing) was converted at A4; S5/S7 were extended to the v4 expedition-bearing round-trip + crash proofs.
- **115 remain fail-loud stubs** — executing any of them throws `InvariantStubError`; none is claimed as passing without a real feature and evidence behind it.

This is evidence, not a target: the count only changes when a phase PR converts a specific stub to a real, tested check. The A4 delta (16→17) is now durable — PR #21 is merged and the post-merge harness re-run confirms 132/17/115.

## Deferred hardening notes

Recorded from the Alpha A2 review (findings not fixed in A2's scope; not blocking, not scope creep, tracked here so they are not lost):

- **A2 amount safe-integer/fraction hardening** — reward amounts are currently validated as finite-and-positive only; fractional or unsafe-integer amounts are structurally admitted, and floating-point drift could in principle trip an exact-conservation assertion. Recommended future hardening: enforce `Number.isSafeInteger` at the contract/schema boundary.
- **A2 story-id collision hardening** — Story Claim ids are derived by string suffix (`${package_id}.story`), which can collide with a distinct, legitimately named test-supplied package. The collision is rejected loudly today (no value loss), but an explicit source-package-id field would remove the collision class entirely.
- **Harness schema-load caching / subprocess dedup** — `sim-harness`'s seed loaders (storage seed, claim-ledger rules seed) re-read JSON and recompile their ajv validators on every invariant check call rather than caching, and the schema-validation gate spawns `scripts/validate-data.mjs` as a subprocess more than once per batch run. This is CI-time waste only, not a correctness issue.

## Update protocol

- This ledger is updated **only through a branch + draft PR**, exactly like any other repo change — never edited directly on `main`.
- It is updated **after every merged phase PR**, to reflect what actually landed (not what was planned).
- A phase is **never marked CLOSED** in this ledger without a corresponding owner decision recorded via a merged PR (or, for the owner directly, an explicit statement); the Implementer does not self-close phases here any more than in code.
- A phase is **never marked AUTHORIZED** in this ledger without an explicit owner authorization already having been recorded in the corresponding `docs/alpha/*_EXECUTION_BRIEF_*` (or equivalent future-phase) document.
- Every phase entry **cites PR numbers and verification evidence** (test/harness exit codes, invariant IDs converted) rather than restating claims without a traceable source.
- This document never reproduces private owner authorization text, signatures, or private strategy notes — only public-safe summaries of what was authorized and dates/PR numbers as evidence.

## Next valid artifact

### An owner-directed Alpha A5 architecture / authorization decision (only if the owner directs it)

- **Status: NOT AUTHORIZED — no scope, brief, branch, or implementation permission exists.**
- Alpha A4 Option A (Bounded First Playable Expedition Loop) is **closed**: implementation PR #21 squash-merged to `main` as `08f84deffd68a0b7eeeff47ab84612d877708d60` on 2026-07-23, owner interactive Windows acceptance PASS, post-merge verification re-run green (132/17/115, save v4), and this ledger, `docs/alpha/README.md`, and `CLAUDE.md` §7 reconciled to CLOSED.
- The only forward artifact is a **separate, explicit owner authorization** defining a bounded Alpha A5 scope. Until such a record exists, no A5+ scope, no A4 hard-exclusion system, no deployment, and no production work may begin; anything outside a current brief remains a stop condition (`CLAUDE.md` §6/§7, A4 brief §11).
