---
title: "External Design Review — Disposition & Refinement Plan"
doc_id: "13_DESIGN_REVIEW_DISPOSITION"
version: 0.2
date: 2026-07-12
status: APPROVED — owner approved the full disposition 2026-07-12; R-D1–R-D6 PLANNING-LOCKED. Supersedes v0.1. NOT canon; does not alter M0 scope or authorization.
owner: Anthony Hammon
source: "External review 'Harbor Guardians – Design Review & Strategic Recommendations' (2026-07-12); full 26-doc FINALIZED corpus; M0_BUILD_AUTHORIZATION_RECORD_v1.0"
---

# External Design Review — Disposition & Refinement Plan (v0.2 — APPROVED)

## 0. Position: received mid-M0 — M0 is unaffected

The review arrived with **M0 Step 1 complete (environment verified)** and **Step 2 (repo creation) pending**. Assessment: **nothing in this review touches M0 scope.** M0 is environment/repo/docs/schemas/harness/save-load — design-agnostic machinery. Every recommendation here is either already doctrine, new *documentation* work, or deferred content.

**Directive: continue M0 without pause.** Next action remains Step 2 (remember: `winget install GitHub.cli` + `gh auth login` before approving it). This disposition work runs in the document channel, in parallel, exactly as the foundation was built.

## 1. Overall assessment of the review

The review is high quality and — notably — **validates the existing architecture** rather than challenging it. Its "Major Strengths" section independently re-derives our locked doctrine: one-guardian identity, Everything-Is-A-Harbor, sidegrades-not-power-creep, ST as progression spine, 3S storage, Claim Ledger separation, simulation-first order. Its central warning (**scope, not design quality, is the primary risk**) matches the project's own governing discipline. Where it adds value is the *emotional/content* layer: pillars, lore, personality, liveliness, audio — the layer our foundation deliberately left for content phases.

## 2. Already covered (no action — existing doctrine, cited)

| Review recommendation | Existing doctrine |
|---|---|
| Never allow power creep; guardians are sidegrades | Economy §16, E16, GDN4 (ST5 variance ≤0.15, tradeoff >0.20), GDN5 no-trap |
| Protect one-guardian / one-harbor identity | Blueprint v6 core fantasy; D-register; Rite (GDN9) preserves single-active model |
| Everything-Is-A-Harbor as structural rule | Blueprint v6; World Atlas W-suite (all 20 Sanctums as harbor nodes, W-D5) |
| ST as universal progression spine; no bypass systems | Foundation-wide; GDN11 / E15 (no new sources); Gear GEAR6 anti-loop |
| Keep 3S storage strategic; resist universal storage | AMEND-02 3S model; E12/E13; CARGO1–5 boundaries |
| Maintain Ledger / Inbox / Cargo / Storage / Merit separation | L-suite, M-suite, CARGO1 (physical cargo never enters Ledger), Merit soulbound (D-register) |
| Docs → schemas → simulation → tests → UI order; sim authoritative, UI thin | M0 packet areas 1–9; repo scaffold rule (`/src/ui` reads sim state) |
| Every claim needs doc + schema + sim + test before implementation | Claim-to-test doctrine; Sim Harness fail-loud stubs; CI gate |
| Deterministic sim, schema-driven data, documentation authoritative | Doc 07 (D39), No Magic Numbers, DECISIONS.md protocol |
| No paid advantages / reputation shortcuts / economy bypasses | D6 (Surge never economy-bought), Merit non-purchasable, E15/GDN11 |

The review's "Content Scalability Rules" are ~90% existing invariants; §5 proposes ratifying the set as a named principle for future content reviews.

## 3. Accepted — new documentation queue (the real additions)

Five documents, slotted by when they're actually needed. None block M0.

| # | New doc | Covers | Timing | Rationale |
|---|---|---|---|---|
| N1 | **14_DESIGN_PILLARS** (short) | The five emotional pillars (restore / protect / grow through partnership / visible marks / every expedition changes home) as decision filters | **During M0 window** (author now, in parallel) | Cheap, high-leverage; becomes the filter every future feature answers to; belongs in /docs before Alpha content decisions |
| N2 | **15_EVENT_SYSTEM_SPEC** | Quests, world events, seasonal triggers, timers, conditions, state transitions, failure recovery — generalizing what Threat/Raid (TD) already does for raids | **Before Alpha content work** | Alpha's core loop touches events; raids are one event class; needs invariants (EVT-suite) + schema before content authors against it |
| N3 | **16_WORLD_LORE_BIBLE** | Origin of harbors/Guardians/Aether/Sanctums, meaning of Drowned Harbors, the collapse, why restoration is possible; naming conventions | **Beta window** (start earlier if desired) | Pure content; **absorbs the G-D6 / W-D1 / F-D1 naming passes** (final guardian names + animals, region names, faction names) as its deliverable |
| N4 | **17_GUARDIAN_BIBLE** (extends B4/B4A/B4B) | Personality layer per guardian: beliefs, humor, likes/dislikes, faction opinions, reaction dialogue, idle behaviors, sanctum history, music motif, color language | **Beta window** | Mechanical layer already exists (kit sheets); this is the emotional layer; template extends the GuardianKit schema with a `personality` block — additive, no schema break |
| N5 | **18_DIFFICULTY_PHILOSOPHY** (thin consolidation) | Challenge goals, assist modes, failure recovery, loss boundaries, player-trust principles — consolidating what Doc 06 (A11Y), OB-suite, and D38 already establish into one referenceable statement | **Pre-Alpha** (short) | Mostly assembly, not invention; valuable as a single citation target for balance work |

Also accepted in principle: **Audio Bible** (regional instruments, guardian motifs, raid/ship/harbor themes) — **Beta**, paired with the Art Bible as a sibling direction doc.

## 4. Deferred — v1 scope protection (per the review's own core warning)

These are good ideas that would expand v1. Per the review's own discipline ("Does this improve the ST1–ST5 experience? If not, defer"), they are recorded and deferred:

| Item | Disposition |
|---|---|
| Harbor Life (NPC schedules, festivals, construction animation, banners) | **Defer to Beta polish**; implement as data-driven ambience, not new systems; a minimal "returning home feels alive" slice can be an Alpha-exit stretch goal |
| Dynamic Harbor Identity (architecture/lighting/music evolving with ST + guardian influence) | **Defer to Beta**; hooks exist (ST tiers, guardian home_region); pure presentation layer |
| Living World Simulation (regions evolve, routes shift, ignored Drowned Harbors worsen) | **Defer — design in Lore/Event docs, implement post-v1**; TD threat model already gives one dynamic axis; full living-world sim is the classic scope trap the review itself warns about |
| Guardian Presence Outside Combat (walks town, visits buildings, greets NPCs) | **Partially accept at Beta**: idle presence + a few contextual placements deliver most of the fantasy at a fraction of the cost; full behavioral sim deferred |
| Seasonal festivals/events | **Defer**; Event System Spec (N2) defines the *capability*; seasonal *content* is post-v1 |

## 5. Decisions R-D1–R-D6 — APPROVED by owner 2026-07-12 (PLANNING-LOCKED)

| ID | Question | Decision (2026-07-12) |
|---|---|---|
| **R-D1** | Adopt **v1 = ST1–ST5 proving ground** as formal scope doctrine (full ST1–ST10 remains the design; v1 ships and is balanced around ST1–ST5)? | **APPROVED** — v1 = ST1–ST5 proving ground is formal scope doctrine |
| **R-D2** | Approve the five Design Pillars as stated (N1) as permanent decision filters? | **APPROVED** — pillars locked; wording finalized in 14_DESIGN_PILLARS |
| **R-D3** | Approve the new-doc queue and timing in §3 (N1 + N5 pre-Alpha; N2 before Alpha content; N3 + N4 + Audio Bible at Beta)? | **APPROVED** — queue and timing locked |
| **R-D4** | Ratify the **Content Scalability Rules** as a named invariant set (no guardian stronger than launch; no paid advantages; no reputation shortcuts; no economy bypasses; no progression skipping; no parallel/duplicate systems — new mechanics integrate into existing systems)? | **APPROVED** — Content Scalability Rules ratified as a named invariant set |
| **R-D5** | Assign the G-D6/W-D1/F-D1 naming passes (final guardian names + animals, regions, factions) to the World Lore Bible (N3) as its concrete deliverable? | **APPROVED** — Lore Bible owns the G-D6/W-D1/F-D1 naming passes |
| **R-D6** | Author **14_DESIGN_PILLARS now** (during the M0 window, document channel, parallel to Claude Code's repo work)? | **APPROVED** — pillars doc authored same day (delivered with this v0.2) |

## 6. Impact on gates

- **M0:** zero impact. Scope, checklist, and authorization unchanged. **Proceed to Step 2.**
- **Alpha entry:** unchanged. Alpha *content* work gains two lightweight prerequisites if R-D3 approves: Design Pillars (N1) and Difficulty Philosophy (N5) in /docs, and the Event System Spec (N2) before event/quest content is authored.
- **Beta entry:** gains the content-doc set (Lore Bible incl. naming pass, Guardian Bible personality layer, Audio Bible) — consistent with the existing rule that final animals/names lock before Beta (F-2).
- **No new systems enter v1** without passing the pillars filter + Content Scalability Rules + existing invariant suites.

## 7. Next actions

1. **You:** continue M0 — approve Step 2 (repo) in Claude Code after `gh auth login`.
2. **You:** approve/amend R-D1–R-D6 above.
3. **Me (on R-D6 approval):** draft 14_DESIGN_PILLARS immediately; queue 18_DIFFICULTY_PHILOSOPHY and 15_EVENT_SYSTEM_SPEC next in the document channel while Claude Code works M0 steps 2–10.
4. External review filed in /docs alongside this disposition once the repo exists (M0 Step 4 adds a `/docs/reviews/` subfolder for both).

*Disposition v0.2 — APPROVED; R-D1–R-D6 planning-locked 2026-07-12. M0 authorization and scope unchanged. Not canon.*
