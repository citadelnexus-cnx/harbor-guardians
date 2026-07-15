---
title: "Harbor Guardians — Difficulty Philosophy"
doc_id: "18_DIFFICULTY_PHILOSOPHY"
version: 0.2-DRAFT
date: 2026-07-14
bundle_version: difficulty-2026-07-14
status: DRAFT pre-Alpha reference; not yet accepted into the repo doctrine set. Thin consolidation per approved R-D3 — gathers EXISTING doctrine into one citable statement; introduces no new mechanics. Does not alter M0 (closed) or authorize Alpha.
owner: Anthony Hammon
source: "06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 (A11Y1–A11Y5); 08_FIRST_HOUR_ONBOARDING_AND_SAFETY v0.1.2 (OB1–OB5); 01_ECONOMY_FOUNDATION v1.7 (E12/E13 raid loss bounds); 04_REWARD_CLAIM_LEDGER v0.4 (partial claim, L-suite); 04B_SHIP_HOLD_AND_DOCKED_CARGO v0.1.2 (CARGO1–5, pressure timer); SAVE_LOAD_TIME_RECONCILIATION v0.5 (S7 atomic saves); 05_THREAT_AND_RAID_DIRECTOR v0.1.3 (TD warnings); DECISIONS.md D32 (medium pressure-timer), D35 (per-type warning), D37 (partial Drowned reset), D38 (Assisted-default); 14_DESIGN_PILLARS (Pillar II)"
classification: FUTURE BUILD — philosophy/consolidation; no new numbers
---

# Harbor Guardians — Difficulty Philosophy (v0.2)

## 0. What this is

A **consolidation**, not an invention. Harbor Guardians' stance on challenge, accessibility, failure, and loss is already established across the foundation specs; this document gathers it into one citable statement so future balance and content work references a single source instead of five. Every principle below traces to an existing invariant or decision — cited inline. If this doc and a source spec ever disagree, **the source spec wins** and this doc is corrected.

**Governing stance (one sentence):** *Harbor Guardians is challenging through meaningful decisions, never through hidden information, unrecoverable loss, or punished inexperience — the player is always trusted, always warned, and never permanently harmed by a single bad moment.*

## 1. Challenge goals — where difficulty comes from

Difficulty in Harbor Guardians is **decision difficulty**, not execution difficulty or information difficulty:
- **Legitimate sources of challenge:** logistics and exposure tradeoffs (3S storage — what to keep safe vs. expose); guardian playstyle mastery (Bond Charge timing, when to Surge — C-suite); threat management (reading TD warnings, prioritizing defense); economic planning (faucets/sinks, rations pressure); route and expedition risk (World Atlas distances, Drowned hazards).
- **Never sources of challenge:** hidden information the player couldn't have known; twitch-execution barriers (accessibility parity, §3); memorization of unforeseeable events; punishing the player for not knowing an unstated rule (OB5 no-trap-picks).

The player should lose because they made a readable choice that didn't pan out — never because the game withheld what they needed to decide.

## 2. Player trust — the non-negotiable core

Three trust guarantees run beneath everything (this is Pillar II in operational form):
1. **No hidden loss, ever.** Nothing the player owns is silently deleted or degraded (CARGO invariants, L-suite, preserve-don't-rewrite). Losses are always shown, always attributable.
2. **Foreseeable threat.** Danger is warned before it lands (TD warning discipline; per-type warnings, D35). A raid threatens *exposed* value the player chose to expose — never a bolt from the blue.
3. **Recoverable failure.** A bad moment is a setback, not an ending (§4). Saves are atomic and never corrupt (S7). Restoration progress isn't wiped by a single loss (partial Drowned reset, D37).

These are guarantees, not difficulty settings — they hold at every difficulty level.

## 3. Accessibility — parity, not a lower tier

Accessibility is **outcome parity across input abilities**, not an easier game for some players (A11Y1–A11Y5, D38):
- **Assisted is the default**, not a stigmatized "easy mode" the player must opt into (D38). The game meets people where they are.
- **Timing-based systems have an assist path** that reaches comparable outcomes (wider windows, guaranteed floors — mirrors the guardian assist-parity model, C4/GDN8): a lower-dexterity or Assisted-tier player reaches the same Bond Charge / Surge cadence a precision player does.
- **Cues are redundant** — shape + icon + text, never color-only (Doc 06). No information lives in a single channel.
- **Input is calibratable** — latency, touch targets, remapping (A11Y-suite; touch-target minimums per D-register).

Difficulty settings adjust the *decision stakes* (how punishing exposure is, how aggressive threat is), never the *information or input fairness* — those stay constant.

## 4. Failure recovery — the shape of a setback

When things go wrong, the recovery path is designed, never incidental:
- **Bounded loss.** Raids take from *exposed surplus*, within bounds — never Safe Storage, never Merit (soulbound), never everything (E12/E13, 3S model). The floor is real.
- **Partial credit.** Interrupted rewards resolve partially rather than vanishing (partial claim, L-suite); docked cargo has a foreseeable pressure-timer window, not an instant loss (D32 medium timer, CARGO-suite).
- **Restoration persists.** A lost defense doesn't un-reclaim what you restored (D37 partial reset, not full wipe) — Pillar I ("restore what was lost") requires restoration to *stay* restored.
- **The save is safe.** No crash, quit, or bad session corrupts a save (S7 write-temp→fsync→rename). The player can always walk away and come back to exactly where they were.

## 5. Loss boundaries — what can and cannot be lost

| Can be lost (fairly, visibly, bounded) | Can NEVER be lost |
|---|---|
| Exposed surplus in a raid (chose to expose it) | Safe Storage contents |
| Docked cargo past its pressure-timer window (warned) | Merit (soulbound standing) |
| An expedition's outcome (readable risk taken) | Earned Story Claims / Ledger entries already recorded |
| Time / efficiency from a setback | Restoration progress (beyond a bounded partial reset) |
| — | Save integrity |

This table is the operational boundary of "no hidden loss." Anything a future feature proposes to take from the player must live in the left column, be warned, and be bounded — or it violates doctrine.

## 6. Difficulty settings — what they may and may not touch

If/when difficulty options exist (a v1+ consideration, not an M0/Alpha requirement), they may adjust: threat aggression, exposure penalties within bounds, economic pressure, expedition risk. They may **not** adjust: information fairness, input/accessibility parity, the no-hidden-loss guarantee, save integrity, or the loss-boundary table (§5). Difficulty scales the *stakes of decisions*, never the *fairness of the frame*.

## 7. What this doc does NOT do
- No new mechanics, no new numbers — pure consolidation.
- No difficulty-setting implementation spec (deferred; this is philosophy, the mechanics live in the source specs).
- DRAFT pre-Alpha reference; not yet accepted into the repo doctrine set; does not authorize Alpha; M0 remains closed.

## 8. Review routing
Standard document-mode review: confirm every principle traces to a cited source; confirm no principle contradicts its source (source wins on conflict); confirm the §5 loss-boundary table matches E12/E13 + CARGO + L-suite + Merit doctrine. Enters `/docs` as a pre-Alpha reference; balance and content work cite it instead of re-deriving from five specs.

*DRAFT v0.2 — consolidation per R-D3. Pre-Alpha reference, not yet accepted into repo doctrine; no new mechanics; does not authorize Alpha. Source specs win on any conflict.*
