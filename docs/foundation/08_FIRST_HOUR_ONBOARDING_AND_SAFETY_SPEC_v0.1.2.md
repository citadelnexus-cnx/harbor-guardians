---
title: "First-Hour Onboarding & Safety Spec"
doc_id: "08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC"
version: 0.1.2-DRAFT
date: 2026-07-10
bundle_version: v0.1.2-dependency
status: DRAFT v0.1.2 for owner review — metadata cleanup: H1/version drift fixed. guardian-summary "no trap picks" rule for the first-hour roster. APPROVED-FOR-REVISION; not canon; no repo/vault mutation.
source: "Decision Register D1–D22; Blueprint v6.0 (creation flow, one-guardian model); AMEND-02 v0.5.1 (harbor operations, soft-stall, no hidden loss); AMEND-03 v0.4 (safety doctrine); 01_ECONOMY_FOUNDATION v1.7 (§0 session contract, tutorial ration); 04/04A/06 (claims, inbox, accessibility); SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2"
classification: FUTURE BUILD — onboarding targets pending playtest
blocks: "public playable / usability testing"
---

# First-Hour Onboarding & Safety Spec v0.1.2

**Why this exists:** the foundation set defines the systems; this doc defines the *first hour* — how a new player creates a world, meets their guardian, learns the harbor loop, and hits the first storage/claim/raid moments — plus the safety guardrails that must hold in that window. It operationalizes the Player Session Economy Contract (Economy §0.2) and the no-dark-pattern doctrine (AMEND-03 A3.5).

## 1. Goals
1. A new player reaches a **first visible advancement within the first session** (Economy §0.2).
2. Core loop taught by *doing*, not walls of text: build → produce → store → spend.
3. Every teaching moment is skippable/recoverable (Tutorial Notices persist in the System Inbox, Doc 04A).
4. No pressure tactics, no dark patterns, no fear-of-missing-out timers (AMEND-03 A3.5).

## 2. World creation flow (Blueprint one-guardian model)
1. Player names **World / Harbor / Ship / Hero** (procedural placeholders offered; renaming is free except the cosmetic Keep rename fee later).
2. Player **chooses one guardian** for this playthrough (Blueprint: one guardian per world; swap later only via the Rite of the Changing Tide). **No-trap-pick rule (P8):** because the full launch roster is available at creation (§10 Q3) and the choice is long-lived, each guardian shows a **clear, honest creation-screen summary** before selection — chassis/role, playstyle in one line, its economy *sidegrade* and the matching *tradeoff* (guardians are sidegrades, never power creep — Economy §16), difficulty-feel tag (e.g. Approachable / Standard / Demanding), and a "good if you like…" hint. Summaries must make the tradeoff legible so **no first-hour pick is a hidden trap**; a picker cannot be strictly worse than another with the same tag. Full kit detail lives in the Guardian Kit Sheets; the creation summary is the honest short form.
3. The chosen guardian themes the starting harbor palette (Art v0.5) and seeds early flavor.
4. Start stock granted (Economy §3: Crowns 200 · Provisions 150 · Iron 100 · Aether 0 · Merit 0). Aether intentionally 0 (non-magical early game).

## 3. The taught loop (first ~10–15 minutes)
| Beat | Teaches | System |
|---|---|---|
| Assign a worker to a Farm | production + worker states | Economy §6, Build Queue |
| Watch Provisions fill toward Safe cap | Safe/Exposed/Total 3S | Economy §7 |
| Build a second building via the queue | cost-at-start, builder labor | Build Queue §2–3 |
| First storage-full moment | caps are an opportunity, not failure; exposed surplus is visible/at-risk | Economy §7, AMEND-02 A2.8 |
| First reward package | Claim Ledger, partial claim (Claim Safe/Capacity/All/Hold) | Doc 04 §7 |
| First System Inbox message | Read vs Claim distinction (UX1) | Doc 04A §7 |
| First Watch→Warning threat | raids are telegraphed and reducible; readiness is visible | Doc 05, AMEND-02 A2.5 |

Each beat surfaces **the action that fixes/advances it** (no-hidden-loss UX). Timing/combat beats use the accessibility defaults (Doc 06): Assisted timing on, a practice dummy available.

## 4. First-hour safety guardrails
- **Emergency ration grant (once, tutorial only):** if the new player starves workers early, a one-time Provisions grant prevents a discouraging stall (Economy §7 soft-stall). Flagged so it can never recur or be farmed.
- **No irreversible failure:** insolvency is a soft-stall with visible recovery actions (Economy §7); the first raid cannot wipe safe storage (E6/E7) and a first-hour Assault is gently tuned (low severity floor) via the Threat Director (Doc 05).
- **No hidden loss:** every early spoilage/leak/cap-block is shown with its fix, so the player learns the model instead of feeling cheated.
- **Accessibility from the first screen:** calibration + assist settings reachable before any timing challenge (Doc 06 D10).

## 5. Anti-dark-pattern rules (AMEND-03 A3.5, restated for onboarding)
No real-money prompts, no paid skips, no login-streak pressure, no manipulative countdowns, no "your harbor is being attacked, come back now" guilt notifications. Offline is respected (no punishment for leaving). Tutorial prompts never block the player from exploring; they can be dismissed and re-read from the Inbox/Help.

## 6. Tutorial notices & recoverability
First-hour guidance is delivered as **Tutorial Notices** (Doc 04A category): dismissible, recoverable in Help, never resource-bearing (M1). A player who skips the tutorial can replay any step from Help without penalty.

## 7. Save/load
Onboarding progress persists as a small `onboarding` flag block (`steps_completed[] · emergency_ration_used · tutorial_dismissed`). It is player/world-scoped, never economic state. The emergency-ration-used flag ensures the one-time grant never repeats across save/load (anti-farm).

## 8. Sim / QA invariants (feeds SIM_HARNESS_ACCEPTANCE_SPEC)
Reuses **E9** (no soft-lock — a new player always recovers), **E19** (offline trust), **S4** (accessibility from first prototype), **UX1** (inbox never transfers resources). Onboarding-specific: **OB1** the emergency ration grant fires at most once per world (save/load-safe); **OB2** a first-hour playthrough reaches a visible advancement within the session-contract window in sim/playtest; **OB3** no onboarding prompt blocks exploration or applies a countdown; **OB4** first-hour raid severity floor is capped (no first-hour wipe); **OB5** every selectable creation-screen guardian has a complete honest summary (role, sidegrade, tradeoff, difficulty tag, "good if you like") and no guardian is strictly dominated within its difficulty tag — no trap picks (content audit + sim variance cross-check against Economy §16 / E16).

## 9. Data-seed exports (`/data/onboarding/`)
`creation_flow_steps · guardian_creation_summaries (role, sidegrade, tradeoff, difficulty_tag, good_if_you_like) · taught_loop_beats · emergency_ration (amount, once-flag) · tutorial_notices (copy refs) · first_hour_threat_caps · onboarding_save_schema · onboarding_invariants`. Copy text is content, not gameplay numbers, but any gameplay values (grant amount, severity floor) follow No Magic Numbers.

## 10. Open questions for owner
1. **Guided vs open first hour** — a structured tutorial path or a light "suggested next step" nudge over free play? Recommended: light nudges over free play, matching the no-dark-pattern stance.
2. **Emergency ration size** — enough to restart production for N pulses; exact amount sim/playtest-tuned.
3. **First guardian choice** — confirm the full 10-launch roster is available at creation *with* the no-trap-pick summaries (§2, OB5). (Resolved direction: full roster + honest summaries; open only if the owner prefers a curated starter subset instead.)

*DRAFT v0.1.2 — FUTURE BUILD. Approved-for-revision; merge requires a separately authorized session. Required before public playable / usability testing.*
