---
title: "Harbor Guardians — Alpha A3 Execution Brief"
doc_id: "ALPHA_A3_EXECUTION_BRIEF"
version: 0.1
date: 2026-07-18
status: ACTIVE — records the scope of the owner's Alpha A3 authorization (2026-07-18, Option A only). A3 = Expedition and Event Skeleton, lifecycle mechanics only. Does not authorize A4, event reward generation, or any gameplay loop.
owner: Anthony Hammon
source: "Owner Alpha A3 authorization 2026-07-18 (limited authorization, Option A only); 15_EVENT_SYSTEM_SPEC v0.2 §2/§3/§5 (lifecycle, schema shape, EVT1-EVT10); ALPHA_A2_EXECUTION_BRIEF v0.1 (test_supplied source_type boundary, unchanged); SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 (migration pattern); SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2; DECISIONS.md D32/D35 (fairness/warning-window doctrine); CLAUDE.md §3/§4/§6/§7"
classification: CURRENT BUILD — event lifecycle skeleton, test-supplied fixtures only, EVT1-EVT4; event reward generation, economy effects, and every other effect-binding invariant remain FUTURE BUILD
---

# Harbor Guardians — Alpha A3 Execution Brief (v0.1)

## 0. Authorization

Alpha A2 is closed (Claim Ledger and Reward Routing — PR #16 merged; 12 implemented invariants, 120 fail-loud, 132 registered). On **2026-07-18** the owner (Anthony Hammon) issued a **limited authorization covering Alpha A3 Option A only: Expedition and Event Skeleton lifecycle mechanics**. It explicitly authorizes no EVT5 conversion, no event reward generation, no new Claim Ledger `source_type`, no gameplay loop, no combat, no raids, no guardians, no factions, no cargo voyages, no gameplay UI, no deployment, and no Alpha A4 work.

Like the M0, A0, A1, and A2 records, the full authorization text is held by the owner and is not reproduced here beyond this summary (CLAUDE.md §7). This brief records what the authorization covers so every A3 PR traces to it.

## 1. A3 scope — what is authorized

1. **Typed contracts**: `Event`, `Condition`, `Outcome`, `Effect` reference shapes (schema shapes per `15_EVENT_SYSTEM_SPEC v0.2` §3) — declared shapes only; no effect *execution* beyond the lifecycle transitions themselves (§2 covers the explicit boundary).
2. **Schema-backed seed data for test fixtures only** — DC4 metadata, D39-generated schema, same pattern as A2's `claim_ledger_rules.json`. No real `/data` event content.
3. **Pure deterministic sim module**: the six-state lifecycle `DORMANT → ELIGIBLE → OFFERED/TRIGGERED → ACTIVE → RESOLVING → RESOLVED`, with the fair `EXPIRED/DECLINED` branch where applicable (D35 warning-window doctrine) — driven only by test-harness-supplied event definitions and test-harness-supplied trigger state.
4. **Save/load extension with migration** (`save_schema_version` 2 → 3) — **only if required** to prove EVT3's save-atomicity honestly. If the skeleton's event state can be proven save-atomic without a schema bump, the migration step may be skipped — but state that decision explicitly in the PR evidence; don't silently assume either way.
5. **Selected honest invariant conversion — EVT1-EVT4 only**:
   - **EVT1** — pure data, schema-validated; no event hard-codes gameplay numbers.
   - **EVT2** — deterministic transitions (same state + seed ⇒ same transition), proven via the same determinism-proof pattern A2 already uses.
   - **EVT3** — save-atomic mid-flight events, proven via the same crash-simulate pattern as S7/A2 (contingent on item 4).
   - **EVT4** — triggers reference only observable state. Narrowly: at A3 the only observable state that exists in code is A1's harbor/resource state and A2's claim-ledger state. Conditions referencing faction standing, threat level, or world-node state are out of scope — those systems don't exist yet.
6. **`CLAUDE.md` §7 updated** to reflect Alpha A3 Option A as current scope, superseding the "Alpha A2 only" line.

## 2. A3 boundary — what is NOT authorized

- **No EVT5 conversion, no event reward generation, no new Claim Ledger `source_type`.** Reward packages remain `test_supplied` only — the A2 boundary is unchanged. An event-driven reward source is a real capability increment, deliberately deferred to a later, separately authorized phase, not bundled into A3.
- **EVT6-EVT10 remain fail-loud**, each for a concrete reason: EVT6 (economy source binding) has no economy production loop to bind against; EVT7 (fair expiry warning) and EVT8 (no hidden loss across systems) depend on systems — Inbox, Cargo, Threat Director — that don't exist in code; EVT9 (raid conformance) can't be proven until Threat & Raid Director exists in code; EVT10 (multi-step chain atomicity) ships with real event content authoring, which is out of scope here.
- **No gameplay loop** — no production, pulses, upkeep, decay, workers, buildings, offline reconciliation.
- **No combat, no raids, no guardians, no factions, no cargo voyages, no gear gameplay.**
- **No gameplay UI** — the Tauri shell remains the empty M0 smoke-test window, unchanged.
- **No real event content** — the expedition-class skeleton runs on test fixtures only, the same boundary A2 drew around reward packages.
- **No deployment, no production packaging, no secrets, no private authorization text committed to the repo.**
- **No Alpha A4.** Any scope beyond this record requires its own separate owner authorization.

Invariants tied to unimplemented systems (EVT5-EVT10, and every suite already fail-loud at A2: E/M/C/CARGO/OPS/TD/A11Y/OB/GEAR/W/FCT/GDN, plus L2/L3/L4/L8/L9/L10/L12/L13/L15, DC2/DC3, S1-S4/S6) stay fail-loud stubs. Converting any of them at A3 would claim untested capability (CLAUDE.md §3).

## 3. Doctrine notes recorded at A3

1. **EVT5 deferral is deliberate, not an oversight.** A2 already established `test_supplied` as the sole reward source; introducing an event-driven source is a real capability increment reserved for a future, separately authorized phase. No `DECISIONS.md` entry is needed for A3 as a result — there is no schema change to record.
2. **`CLAUDE.md` §7 lag**: the prior scope line read "Alpha A2 only," dated 2026-07-17, through this authorization. This brief supersedes it as of 2026-07-18.
3. **Save migration is conditional, not assumed.** Item 4 (§1) is a judgment call for whichever session implements it — if EVT3 can be proven honestly without a `save_schema_version` bump, skip it, but say so explicitly in the PR rather than leaving it ambiguous.

## 4. Exit condition

A3 is complete when: the event schema/contracts and lifecycle module exist and are exercised by tests; the fixture seed validates with DC4 metadata; the six-state lifecycle plus fair `EXPIRED/DECLINED` transition is tested; EVT1-EVT4 pass honestly at A3 scope; if a save migration was needed, it round-trips a committed fixture and that necessity is stated in the PR evidence; the harness batch is green with the registry total unchanged at 132 (only stub→implemented status moves, for EVT1-EVT4 only); all twelve prior implemented invariants (L1, L5, L6, L7, L11, L14, S5, S7, DC1, DC4, DC5, DC6) remain green with no regressions; and all verification commands exit 0. Anything further — EVT5+, real event content, Alpha A4 — waits for a separate owner authorization.

## 5. Handoff checklist for the Implementer (Claude Code)

1. Branch: `alpha/a3-expedition-event-skeleton`. Branch-first, never commit to `main` (CLAUDE.md §4).
2. Update `CLAUDE.md` §7 to reflect Alpha A3 Option A as current scope.
3. Create/confirm `docs/alpha/ALPHA_A3_EXECUTION_BRIEF_v0.1.md` on the branch (this document).
4. Implement typed event contracts and generated schema (D39 pipeline).
5. Add test-only event fixture data — no real `/data` event content.
6. Implement the pure deterministic lifecycle module.
7. Add the save v2→v3 migration only if required to prove EVT3; state the decision either way in PR evidence.
8. Convert EVT1-EVT4 honestly, with harness evidence attached.
9. Keep EVT5-EVT10 fail-loud — do not touch reward routing, economy, Cargo, Threat Director, Inbox, or guardian code paths.
10. Keep all prior implemented invariants (L-suite, S5/S7, DC-suite) green — no regressions.
11. Open a **draft PR only**. Never mark ready, never merge.
12. **Stop** once the draft PR is open. Escalate to owner/Architect on any ambiguity (CLAUDE.md §6) rather than guessing.

**Hard limits, explicit:** no event reward generation · no new Claim Ledger `source_type` · no gameplay loop · no real event content · no combat · no raids · no guardians · no factions · no cargo · no gear · no gameplay UI · no deployment · no production · no Alpha A4.

*A3 brief v0.1 — Expedition and Event Skeleton, Option A (lifecycle mechanics only). Does not authorize A4, event reward generation, or any gameplay loop. Escalation on any boundary question per CLAUDE.md §6.*
