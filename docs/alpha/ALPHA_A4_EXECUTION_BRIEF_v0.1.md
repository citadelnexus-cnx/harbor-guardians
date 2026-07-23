---
title: "Harbor Guardians — Alpha A4 Execution Brief"
doc_id: "ALPHA_A4_EXECUTION_BRIEF"
version: 0.1
date: 2026-07-23
status: ACTIVE — records the scope of the owner's Alpha A4 authorization (2026-07-23, Option A only). A4 = Bounded First Playable Expedition Loop. Authorization to implement is gated on the merge of the authorization-record PR that lands this brief and its companion governance amendments; the brief itself carries no implementation permission before that merge.
owner: Anthony Hammon
source: "Owner Alpha A4 authorization 2026-07-23 (limited authorization, Option A only, Bounded First Playable Expedition Loop); controlling locked architecture 11A / 11B / 11C; ALPHA_A3_EXECUTION_BRIEF v0.1 (event lifecycle skeleton, EVT1–EVT4, save v3); ALPHA_A2_EXECUTION_BRIEF v0.1 (Claim Ledger source_type boundary); ALPHA_A1_EXECUTION_BRIEF v0.1 (harbor 3S storage spine, D1); 15_EVENT_SYSTEM_SPEC v0.2 (EVT1–EVT10); SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 (migration pattern); SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2; CLAUDE.md §3/§4/§5/§6/§7"
classification: CURRENT BUILD (once authorization-record PR merges) — one bounded, deterministic, save-safe first-playable Harbor→route-anchor-outpost→Harbor expedition loop with a minimal Windows desktop interface. Every capability outside the bounded scope enumerated here remains FUTURE BUILD and fail-loud.
baseline_sha: a08b4ad3a5dd81694c6d49cdee5d13ad4dcab5cd
---

# Harbor Guardians — Alpha A4 Execution Brief (v0.1)

## 0. Authorization identity

Alpha A3 Option A is closed (Expedition and Event Skeleton lifecycle mechanics — PR #18 merged; EVT1–EVT4 implemented; save schema v3; 132 registered / 16 implemented / 116 fail-loud). On **2026-07-23** the owner (Anthony Hammon) issued a **limited authorization covering Alpha A4 Option A only: a Bounded First Playable Expedition Loop.**

- **Phase:** Alpha A4
- **Option:** Option A only — Bounded First Playable Expedition Loop
- **Owner authorization date:** 2026-07-23
- **Controlling locked architecture:** 11A, 11B, and 11C
- **Repository baseline:** `a08b4ad3a5dd81694c6d49cdee5d13ad4dcab5cd` (`main` = `origin/main` at authorization time)

Like the M0, A0, A1, A2, and A3 records, the full authorization text is held privately by the owner outside this public repo and is not reproduced here beyond this public-safe summary (CLAUDE.md §7). This brief records what the authorization covers so every A4 PR traces to it.

**This brief authorizes A4 implementation only after the authorization-record PR that lands it (this document plus the CLAUDE.md §7, `docs/alpha/README.md`, and `docs/progress/PROJECT_PROGRESS_LEDGER.md` amendments) is reviewed and merged to `main` by the owner.** The authorization-record PR is documentation only and moves no implementation. Until that PR merges, A4 remains not yet started and no A4 code, schema, data, save, test, or UI change may begin.

## 1. Proof target

**One canonical and repeatable early-game Harbor → route-anchor-outpost → Harbor loop.** A4 is complete when a player can, deterministically and save-safely, prepare and dispatch one bounded expedition from the Harbor, resolve it at one damaged route-anchor outpost through the full set of authorized outcomes, return, unload, and repeat — with exact save/exit/relaunch/resume at every major phase and full A1–A3 state preserved.

## 2. Authorized player-facing scope

1. A Harbor need surfacing after Theo's funeral and early stabilization (canonical early-game framing).
2. Theo's inherited salvage vessel as the expedition craft.
3. A fixed expedition group: the player, the selected starting Guardian, Morra Dalmere, and any specifically approved fixed support character. No selectable party, no formations.
4. Bounded preparation using a small deterministic supply set.
5. One short deterministic route.
6. Bounded, schema-backed use of the existing EVT1–EVT4 event lifecycle (no new event capability, no reward generation, no effect execution).
7. One damaged route-anchor outpost as the destination.
8. A non-combat stabilization and salvage objective.
9. The full authorized outcome set: cancellation, full success, partial success, retreat, and forced withdrawal / failure.
10. Return, docking, result review, and unloading.
11. Safe Storage transfer of recovered material.
12. Unsafe Overflow capped at **3× the applicable current Safe Storage capacity**.
13. Blocked unloading that preserves remaining material aboard or pending — never dropped, never duplicated.
14. Only already-valid Claim Ledger routing (no new `source_type`, no general expedition reward generation).
15. Bounded vessel, crew, and Guardian recovery after an expedition.
16. A limited route-anchor operations unlock.
17. Repeat expeditions without replaying canonical story contradictions.
18. Exact save, exit, relaunch, and resume.

## 3. Authorized technical scope

- Typed A4 contracts and runtime schemas (D39-generated schema only; no hand-authored JSON Schema).
- Modular authoritative state domains.
- Atomic, validated state transitions.
- Stable command and transaction identities (duplicate-command resistant).
- A deterministic seeded expedition stream.
- Version-pinned content.
- Resource-conservation transactions (no loss, no duplication, no reroll).
- A minimal Alpha-quality Windows desktop player interface for the approved flow.
- Bounded canonical A4 seeds (approved content only).
- Required tests, simulation evidence, and progress updates.

## 4. Guardian boundary

The three starting Guardians — **Raxa, Tarin, and Nova** — provide **distinct but equivalent sidegrades only**. A4 authorizes **no** superior rewards, **no** guaranteed success, **no** leveling, **no** evolution, **no** equipment, **no** combat powers, **no** bond tree, and **no** roster system. Guardian choice changes flavor and equivalent trade-offs, never power or outcome guarantees.

## 5. Save disposition

- First **assess** whether the A4 loop is additively compatible with save schema **v3**.
- Save schema **v4** and a deterministic **v3 → v4** migration are **conditionally authorized** only if technically required to prove the loop honestly. If v3 suffices, do not bump; state that decision explicitly in the PR evidence either way.
- Preserve all A1–A3 state.
- Any migration must be deterministic and idempotent, with explicit defaults.
- Commit a v3 save fixture; migration must round-trip it.
- Malformed and unsupported saves are rejected loudly.
- **No reset, silent repair, coercion, loss, or duplication** — ever (CLAUDE.md §5).

## 6. Expected implementation areas

Implementation, when authorized, is expected to touch only:

- `src/contracts/`
- `src/sim/`
- `src/save/`
- `schema/` — generated files only (D39 pipeline)
- `data/` — approved A4 content only
- `tests/`
- `tests/fixtures/`
- `sim-harness/`
- minimal existing frontend / Tauri files strictly needed for the approved Windows flow
- `scripts/`, `package.json`, CI — only where strictly required for approved verification
- `CLAUDE.md`, `docs/alpha/`, `docs/progress/`

Anything outside these areas is out of scope and is a stop condition (§12).

## 7. Required verification

- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run schema:validate`
- `pnpm run sim:harness`
- `pnpm run test:harbor`
- `pnpm run test:ledger`
- `pnpm run test:events`
- `pnpm run test:save`
- A4 contract, transition, conservation, migration, deterministic-replay, idempotency, and full-loop tests
- `cargo check --locked`
- Documented Windows desktop acceptance of the approved flow

## 8. Scenario matrix

Implementation evidence must cover:

- All three starting Guardians (Raxa, Tarin, Nova).
- Canonical first completion.
- Repeat expedition (no canonical story contradiction on repeat).
- All approved completion / failure outcomes (cancellation, full success, partial success, retreat, forced withdrawal / failure).
- Vessel repair.
- Crew and Guardian recovery.
- Safe Storage, Overflow, full Overflow (at the 3× cap), and blocked unloading.
- Protected over-cap legacy state (pre-existing over-cap holdings are preserved, not clamped away).
- Save / load at all major phases.
- Exact relaunch.
- Duplicate-command resistance.
- Deterministic replay.
- Malformed content / save rejection.
- A1–A3 regression protection.

## 9. Invariant rule

**No predetermined conversion count.** Convert **only** fully proven A4-scoped invariants. Partial or future-dependent invariants remain fail-loud stubs (CLAUDE.md §3). The registry total does not change to hit a number; only genuine stub→implemented transitions, each with harness evidence, are permitted.

## 10. Hard exclusions

A4 authorizes none of the following. Each remains fail-loud / not authorized:

- combat
- raids or theft activation
- multiplayer / networking
- fleet and full ship progression
- crew recruitment and detailed crew systems
- full Guardian progression
- selectable five-member party and battle formations
- equipment and broad loot
- full Cargo / Docked Cargo system
- trading and markets
- unrestricted Claim Ledger source types
- general expedition reward generation
- full Harbor Inbox
- full quest framework
- Atlas / world traversal
- factions
- threat director
- economy pulses
- full city-builder departments
- controller certification
- packaging, deployment, or production

## 11. Mandatory stop conditions

Halt and escalate to the owner/Architect (CLAUDE.md §6) — do not proceed on a guess — on any of:

- baseline drift (working `main`/`origin/main` no longer at the recorded baseline SHA when implementation begins);
- doctrine conflict (a `/docs` spec is missing, ambiguous, or contradictory for a needed decision);
- a dependency on any excluded system (§10);
- file-scope expansion beyond §6;
- any regression in A1–A3 implemented invariants or tests;
- any loss, duplication, reroll, or stranding of player-owned value;
- any destructive or non-idempotent migration;
- acceptance of malformed state;
- content-version / version-pin failure;
- incomplete invariant proof (a stub cannot be honestly converted at A4 scope);
- an unsafe Windows flow;
- incomplete or contradictory evidence.

## 12. Promotion and completion boundaries

- Implementation, once authorized by the merge of this authorization-record PR, uses branch **`alpha/a4-first-playable-expedition-loop`**.
- A single controlled **draft** PR (CLAUDE.md §4; draft-first workflow).
- The Implementer **cannot** mark the PR ready and **cannot** merge.
- A4 **closes only** after a verified, owner-approved merge and a clean post-merge reconciliation.
- Deployment remains **separately prohibited** and is not part of A4 under any outcome.

## 13. Handoff checklist for the Implementer (Claude Code)

1. Confirm `main` = `origin/main` = the recorded baseline SHA before starting; if drifted, stop (§11).
2. Confirm this authorization-record PR (brief + CLAUDE.md §7 + README + ledger amendments) has merged to `main`. If not merged, A4 implementation is not yet authorized — stop.
3. Branch: `alpha/a4-first-playable-expedition-loop`. Branch-first, never commit to `main` (CLAUDE.md §4).
4. Implement typed A4 contracts and generated schema (D39 pipeline), modular authoritative state domains, and atomic validated transitions.
5. Add only approved bounded canonical A4 seed content under `data/`.
6. Implement the deterministic seeded expedition loop per §1–§3, honoring the Overflow 3× cap and blocked-unloading preservation.
7. Assess save-v3 compatibility; add a deterministic idempotent v3→v4 migration and committed fixture only if required, stating the decision in PR evidence (§5).
8. Convert only fully proven A4-scoped invariants; keep everything else fail-loud (§9).
9. Keep all A1–A3 implemented invariants and tests green — no regressions.
10. Run the full verification set (§7) and cover the scenario matrix (§8); document Windows desktop acceptance.
11. Open a **draft PR only** targeting `main`. Never mark ready, never merge.
12. **Stop** once the draft PR is open. Escalate on any boundary question (CLAUDE.md §6) rather than guessing.

**Hard limits, explicit:** no combat · no raids/theft · no multiplayer · no fleet/full ship progression · no crew recruitment · no full Guardian progression · no selectable party/formations · no equipment/loot · no full Cargo system · no trading/markets · no unrestricted Claim Ledger source types · no general expedition reward generation · no full Harbor Inbox · no full quest framework · no Atlas/world traversal · no factions · no threat director · no economy pulses · no full city-builder departments · no controller certification · no packaging/deployment/production. A5 and later remain not authorized.

*A4 brief v0.1 — Bounded First Playable Expedition Loop, Option A only. Authority derives from the private owner authorization record (2026-07-23) and this public-safe brief. Implementation is gated on the merge of the authorization-record PR. Escalation on any boundary question per CLAUDE.md §6.*
