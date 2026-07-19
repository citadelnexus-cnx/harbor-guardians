# CLAUDE.md — Harbor Guardians Operating Rules

Operating rules for Claude Code (the Implementer) on Harbor Guardians — a standalone city-builder × RPG hybrid (TypeScript + Tauri 2, PixiJS, deterministic pure sim core). These rules encode M0 packet area 3 (`docs/M0_IMPLEMENTATION_READINESS_PACKET_v0.1.3.md` §3) and the standing doctrine carried into build. Milestone 0 was authorized by a signed owner authorization record executing the packet's §13 gate; that record is held privately by the owner outside this public repo. These rules are not suggestions; they are the conditions under which implementation is authorized.

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

- **Never commit to `main`.** All work on `feature/*` / `fix/*` / `chore/*` branches, merged only via PR after CI green + owner review.
- **Draft-first:** every PR opens as a **draft** (`gh pr create --draft`). The Implementer never marks a PR ready for review and never merges. The owner reviews the draft, promotes it (`gh pr ready`), and merges.
- **Server-side enforcement is active:** `main` is protected by a GitHub ruleset — PR required, force-push blocked, deletion restricted, CI status checks required (from M0 Step 9 onward). Protection is mechanical, not merely procedural.
- Small, scoped, revertable commits. No history rewrites on `main`. Milestone tags only after owner approval.

## 5. Preserve, don't rewrite

Extend, layer, and integrate; do not rewrite working systems. Preserve existing state on partial updates. **No hidden loss of player value, ever**: honor the CARGO, Claim Ledger (L-suite), and save invariants — never silently delete or degrade anything the player owns; saves are atomic (S7: write-temp → fsync → rename).

## 6. Stop-and-ask on doctrine gaps

If a spec in `/docs` is missing, ambiguous, or contradicts another for a decision you need: **halt and escalate to the owner/Architect. Never invent doctrine in code.** The gap is resolved in the document channel (doc updated, decision recorded in `DECISIONS.md`), and only then does code proceed.

Escalation = stop work, state the gap and the decision it blocks, and wait. Do not proceed on a best guess; do not open a PR containing guessed behavior.

## 7. Scope discipline

Milestone N+1 does not begin until milestone N is stable and **tested**. Milestone 0 is **closed** (see `M0_EXIT_EVIDENCE.md`); Alpha A0 is **closed** (EVT stubs registered fail-loud, registry 132); Alpha A1 is **closed** (harbor/resource spine, PR #15); Alpha A2 is **closed** (Claim Ledger / reward routing, PR #16); Alpha A3 Option A is **closed** (Expedition and Event Skeleton lifecycle mechanics, PR #18; EVT1–EVT4 implemented; save schema v3; 132 registered / 16 implemented / 116 fail-loud). **No implementation phase is currently authorized. Alpha A4 and later are not authorized.** No event reward generation, event-to-Claim-Ledger delivery, new Claim Ledger `source_type`, effect execution or dispatch, gameplay loop, real event content, combat, raids, threat behavior, guardians, factions, cargo voyages, gear gameplay, Harbor Inbox/messages, gameplay UI, Tauri shell changes, deployment, or production work may begin without a separate owner authorization and bounded execution brief.

This scope section is amended only by a new owner authorization record (held privately outside this public repo, like the M0, A0, A1, A2, and A3 records). If you believe scope has expanded, verify with the owner against the latest authorization record before acting — never assume.

## 8. Traceability

Cite the governing doc + invariant/decision ID in every non-trivial commit message (e.g. `impl W1 route rations per World Atlas §5`). Every `/data` and `/src/sim` module header cites the doc section + invariant IDs it implements, so any number can be audited back to doctrine.

## 9. Where things live

- `/docs` — source of truth (foundation, phase-b, reviews). Read-only doctrine; code never contradicts it.
- `DECISIONS.md` (repo root) — the decision ledger (D1–D40, W-D, F-D, G-D, R-D, deferrals). The single place to resolve "what did we decide about X."
- `AGENTS.md` (repo root) — the five roles, handoff format, per-agent boundaries, escalation triggers.
- `.claude/settings.json` — deliberate permission allow/deny lists for this repo.
- No secrets in the repo; `.env` is gitignored; zero shared credentials or infrastructure with any other project.
