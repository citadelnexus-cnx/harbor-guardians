# docs/progress

**One responsibility:** the project progress ledger — a tracking record of phase status and authorization state, kept separate from doctrine (`/docs/foundation`, `/docs/phase-b`, `/docs/pre-alpha`, `/docs/reviews`) and from Alpha execution briefs (`/docs/alpha`).

- [`PROJECT_PROGRESS_LEDGER.md`](PROJECT_PROGRESS_LEDGER.md) — the ledger itself: current control state, a phase-by-phase table (Foundation through Production), the current invariant summary, deferred hardening notes, and the update protocol.

This ledger does not authorize anything and is not gameplay doctrine. The durable source of truth for what actually happened is the GitHub repo: merged PRs, `CLAUDE.md` §7 (current scope), and the `docs/alpha/*_EXECUTION_BRIEF_*` documents. The ledger is a convenience index over that history — if it ever disagrees with the merged PR record, the PR record wins.
