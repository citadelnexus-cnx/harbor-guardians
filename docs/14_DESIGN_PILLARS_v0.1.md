---
title: "Harbor Guardians — Design Pillars"
doc_id: "14_DESIGN_PILLARS"
version: 0.1-DRAFT
date: 2026-07-12
bundle_version: pillars-2026-07-12
status: DRAFT v0.1 for owner/independent review — authored per approved decisions R-D2/R-D6 (13_DESIGN_REVIEW_DISPOSITION v0.2, 2026-07-12). Once review passes, this document is NEAR-IMMUTABLE: changing a pillar requires explicit owner sign-off and a dossier note. NOT canon until reviewed; does not alter M0 scope.
owner: Anthony Hammon
source: "13_DESIGN_REVIEW_DISPOSITION v0.2 (R-D1–R-D6 approved); external design review 2026-07-12; HARBOR_GUARDIANS_BLUEPRINT_FINAL_v6; Economy v1.7 (E15/E16); 12_GUARDIAN_SANCTUM_AND_KIT v0.1.2 (GDN4/GDN5/GDN11); 08_FIRST_HOUR_ONBOARDING_AND_SAFETY v0.1.2 (OB-suite); World Atlas v0.2.1"
classification: FUTURE BUILD — decision-filter doctrine, not mechanics; no numbers
---

# Harbor Guardians — Design Pillars (v0.1)

## 0. What this document is

The foundation set defines Harbor Guardians' **systems**. This document defines its **emotional goals** — five pillars that every future feature, content addition, and technical choice must serve. Pillars are **decision filters, not features**: they are applied at design review, before anything reaches a spec, a schema, or the sim harness.

**Identity anchor (the meta-pillar, from Blueprint v6):**

> **One Guardian. One Harbor. One Ship. One World.**

If a proposal weakens this sentence, the pillars below don't need consulting — it's already out.

**Usage protocol:** every proposed feature answers all five filter questions (§1–§5) plus the two gates in §6–§7. A feature that fails any filter is redesigned or rejected; "it's cool" is not an answer. This checklist runs at design review (human judgment), not in the sim harness — pillars are qualitative by design, and pretending otherwise would corrupt the claim-to-test discipline that governs everything else.

---

## 1. Pillar I — Restore what was lost

**Meaning.** The Evermeer is a broken world that *can be mended*. The player's arc is restoration: Drowned Harbors reclaimed, routes reopened, Sanctums reawakened. Hope is structural, not decorative.

**Demands:** restoration must always be *possible* and *legible* — every ruin the player can see should communicate a path back (W-D6 sealed-but-visible Sanctums is this pillar in world form). Progress against the world's damage must be permanent enough to feel earned (partial Drowned resets per D37, never full wipes of restoration).

**Forbids:** unwinnable decay, permanent unrecoverable world states, despair-as-aesthetic, content that exists only to be lost.

**Filter question:** *Does this give the player something meaningful to restore — or does it only add something to lose?*

## 2. Pillar II — Protect what you've built

**Meaning.** Threat is real (raids bite — E12/E13, exposed surplus is genuinely at risk) but the player defends a home, not a spreadsheet. Defense should feel like stewardship, never like punishment.

**Demands:** honest, foreseeable threat (TD warning discipline, per-type warnings per D35); losses bounded and recoverable (no-hidden-loss doctrine, S-suite, CARGO invariants); defense choices that are strategic (3S storage exposure decisions) rather than chores.

**Forbids:** hidden loss of any kind, unavoidable losses, punishment loops, raids that erase restoration (Pillar I), any system where the optimal play is not building.

**Filter question:** *Does this make the player's home more worth defending — or just easier to lose?*

## 3. Pillar III — Grow through partnership

**Meaning.** The guardian is a partner, not equipment. One guardian per playthrough (D-register) means the relationship deepens instead of rotating. Bond Charge, Surge, and the Rite all express *relationship*, not inventory.

**Demands:** guardian progression reads as mutual growth (bond levels persist, dormant states honored — GDN9/GDN10); every guardian is a different *way of playing*, never a better one (sidegrades — GDN4/GDN5, E16); the guardian's presence is felt beyond combat as content phases allow (disposition §4: Beta idle-presence slice).

**Forbids:** power creep in any form, guardians as consumables or mounts, mechanics that commodify the bond (D6: Surge is battle-earned, never bought), roster pressure.

**Filter question:** *Does this deepen the partnership with THIS guardian — or push the player to want a different one?*

## 4. Pillar IV — Leave visible marks on the world

**Meaning.** Play changes the world and the world shows it. Settlement Tier is the spine, and what ST buys must be *visible*: buildings rise, districts fill, banners change, routes open.

**Demands:** progression that renders (harbor visibly grows with ST); world-state changes the map reflects (reclaimed harbors look reclaimed); the player's specific choices distinguishable in their harbor (guardian influence, district layout).

**Forbids:** invisible progression (stat-only upgrades with no world expression), interchangeable end-states, resets that erase the player's marks.

**Filter question:** *Will the player be able to SEE this in their world a session later — or is it only a number that changed?*

## 5. Pillar V — Every expedition changes home

**Meaning.** The loop closes at the harbor. Leaving is for the sake of returning: cargo docks (CARGO-suite), claims land in the Ledger (L-suite), Merit accrues, threat shifts (TD), and the harbor is different because you went. Returning home is the reward cadence of the entire game.

**Demands:** every expedition produces a legible delta at home (rewards routed through Ledger/Cargo — never lost, never ambient); the return moment is designed, not incidental (Inbox digest, dock arrival); risk taken out there is felt back here (rations pressure, exposed surplus decisions).

**Forbids:** expeditions as disconnected minigames, rewards that bypass the home loop (GDN11/E15 no-new-sources), grind loops that never touch the harbor.

**Filter question:** *When the player gets home from this, what's different — and will they notice within a minute of docking?*

---

## 6. Companion gate — Content Scalability Rules (ratified, R-D4)

The named invariant set every post-launch or post-v1 addition must pass, alongside the pillars:

1. **No guardian stronger than launch guardians** (sidegrade budget is permanent — GDN4/E16).
2. **No paid gameplay advantages** of any kind.
3. **No reputation shortcuts** (Merit is earned, soulbound, non-purchasable).
4. **No economy bypasses** (every value flows through approved sources/sinks — E15/GDN11).
5. **No progression skipping** (ST is the spine; nothing routes around it).
6. **No parallel or duplicate systems** — new mechanics integrate into existing systems (one home per feature).

## 7. Companion gate — v1 scope filter (R-D1)

**v1 = the ST1–ST5 proving ground.** Full ST1–ST10 remains the design; v1 ships and is balanced around ST1–ST5. Every v1 proposal answers: *does this improve the ST1–ST5 experience?* If not, it is recorded and deferred — the disposition's §4 deferral list is this filter already applied.

## 8. Change control

Pillars are the most stable layer of the project — beneath even the foundation specs. Amending a pillar requires: (1) explicit owner sign-off, (2) a recorded decision in DECISIONS.md, (3) a consolidated-dossier note assessing what existing doctrine the change ripples into. Adding a sixth pillar meets the same bar. Anything failing the pillars today should be redesigned to pass them — not used as an argument to weaken them.

## 9. Placement & review routing

Enters `/docs/` at M0 Step 4 alongside the foundation set (M0 scope unaffected — this is a document, not a build task). Review loop: standard package check → wording review against R-D2 → confirm filter questions are answerable for the existing v1 feature set (they are — §1–§5 each cite the systems that already embody them).

*DRAFT v0.1 — decision-filter doctrine per R-D2/R-D6. Not canon until reviewed; near-immutable after. Does not alter M0 scope or authorization.*
