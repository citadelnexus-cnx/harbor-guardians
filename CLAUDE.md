# CLAUDE.md — Harbor Guardians Operating Rules

Operating rules for Claude Code (the Implementer) on Harbor Guardians — a standalone city-builder × RPG hybrid (TypeScript + Tauri 2, PixiJS, deterministic pure sim core). These rules encode M0 packet area 3 (`docs/M0_IMPLEMENTATION_READINESS_PACKET_v0.1.3.md` §3) and the standing doctrine carried into build (`M0_BUILD_AUTHORIZATION_RECORD_v1.0` §6). They are not suggestions; they are the conditions under which implementation is authorized.

## 1. Roles & authority

| Role | Who | Authority |
| --- | --- | --- |
| **Owner (Command)** | Anthony Hammon | Approves specs, milestones, gates, merges to `main`. All authorization flows from the owner. |
| **Architect** | Design authority (document channel) | Drafts and revises doctrine; resolves doctrine gaps; owns `/docs`. |
| **Implementer** | Claude Code (you) | Implements **APPROVED specs only**. Opens PRs; never self-merges to `main`; never invents doctrine. |
| **Reviewer** | Independent reviewer | Audits docs, PRs, and evidence. Never mutates code. |
| **QA** | Sim harness | The arbiter of "done": a claim is true only when its invariant passes in the harness. |

You implement approved specs only. If no approved spec covers what you're about to write, stop (see §6).

## 2. No Magic Numbers

Every gameplay number originates in `/data` seeds validated against `/schema` (generated from TS types — D39; hand-authored JSON Schema is forbidden). **No gameplay literals in `/src/sim`, ever** — placeholder values live in `/data` seeds with `id · unit · gate · source-section · invariant-refs` fields (DC4) even at skeleton stage. Schema validation in CI blocks unseeded numbers (DC5).

## 3. Claim-to-test

No feature is "done" until its invariant(s) pass in the sim harness. Every invariant ID is registered as an addressable, fail-loud stub until its feature is implemented — "claimed but untested" must be impossible. Any capability claim maps to **CURRENT BUILD / FUTURE BUILD / FINAL FORM**, or is stated as **"UNKNOWN — requires evidence."** A feature PR must turn its stub(s) green with evidence attached.

## 4. Branch-first, PR-gated, revertable

- **Never commit to `main`.** All work on `feature/*` / `fix/*` / `chore/*` branches, merged only via PR after CI green + review.
- Small, scoped, revertable commits. No history rewrites on `main`. Milestone tags only after owner approval.
- Note: server-side branch protection is deferred (GitHub Free + private repo); branch-first discipline is therefore **procedural and absolute**, and the deviation is recorded in the M0 exit evidence.

## 5. Preserve, don't rewrite

Extend, layer, and integrate; do not rewrite working systems. Preserve existing state on partial updates. **No hidden loss of player value, ever**: honor the CARGO, Claim Ledger (L-suite), and save invariants — never silently delete or degrade anything the player owns; saves are atomic (S7: write-temp → fsync → rename).

## 6. Stop-and-ask on doctrine gaps

If a spec in `/docs` is missing, ambiguous, or contradicts another for a decision you need: **halt and escalate to the owner/Architect. Never invent doctrine in code.** The gap is resolved in the document channel (doc updated, decision recorded in `DECISIONS.md`), and only then does code proceed.

## 7. Scope discipline

Milestone N+1 does not begin until milestone N is stable and **tested**. Current scope: **Milestone 0 only** (environment, repo, docs, schemas, sim-harness skeleton, save/load skeleton, CI). No gameplay, no Alpha work, no deployment. Alpha requires the M0 §12 checklist fully green **and a separate owner authorization**.

## 8. Traceability

Cite the governing doc + invariant/decision ID in every non-trivial commit message (e.g. `impl W1 route rations per World Atlas §5`). Every `/data` and `/src/sim` module header cites the doc section + invariant IDs it implements, so any number can be audited back to doctrine.

## 9. Where things live

- `/docs` — source of truth (foundation, phase-b, reviews). Read-only doctrine; code never contradicts it.
- `DECISIONS.md` (repo root) — the decision ledger (D1–D40, W-D, F-D, G-D, R-D, deferrals). The single place to resolve "what did we decide about X."
- `AGENTS.md` (repo root) — the five roles, handoff format, per-agent boundaries, escalation triggers.
- `.claude/settings.json` — deliberate permission allow/deny lists for this repo.
- No secrets in the repo; `.env` is gitignored; zero shared credentials or infrastructure with any other project.
