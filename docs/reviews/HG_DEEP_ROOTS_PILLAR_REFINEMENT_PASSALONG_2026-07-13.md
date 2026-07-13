---
title: "Harbor Guardians — Deep Roots Pillar Refinement Passalong"
doc_id: "HG_DEEP_ROOTS_PILLAR_REFINEMENT_PASSALONG"
version: 0.1-AUDIT
created: 2026-07-13
status: AUDIT / REFINEMENT RECOMMENDATION — not canon, no repo/vault mutation
author_role: Independent Design Reviewer
source: "14_DESIGN_PILLARS v0.1-DRAFT; 13_DESIGN_REVIEW_DISPOSITION v0.2 APPROVED; Harbor Guardians foundation context"
classification: PRE-PLANNING DESIGN REFINEMENT
---

# Harbor Guardians — Deep Roots Pillar Refinement Passalong

## 0. Summary

The current Design Pillars are directionally correct, but they need a deeper connective layer. They describe five emotional outcomes:

1. Restore what was lost.
2. Protect what you've built.
3. Grow through partnership.
4. Leave visible marks on the world.
5. Every expedition changes home.

The gap is that they do not yet fully explain the **living reason these five belong together**. They are currently good filters, but not yet a complete root system.

Recommendation: do **not** add a sixth pillar. Instead, add a **Deep Roots Doctrine** beneath the identity anchor and above the five pillars in `14_DESIGN_PILLARS`. This preserves R-D2 while giving the pillars the connective tissue Anthony is identifying.

Proposed principle:

> **The harbor is not a base menu. It is a living root system: memory, shelter, bond, trade, risk, return, and restoration all flow through it. Every system must either feed the roots, protect the roots, reveal the roots, or grow from the roots.**

## 1. Why this is needed

The current pillars are strong but can still be interpreted too separately:

- Pillar I can become world-cleanup content.
- Pillar II can become raid-defense tuning.
- Pillar III can become guardian progression.
- Pillar IV can become visual polish.
- Pillar V can become reward routing.

Those are useful, but Harbor Guardians needs the player to feel that all of those are one package. The player should feel:

> I am not just upgrading a town, fighting battles, managing storage, and bonding with a guardian. I am restoring a wounded harbor-world by growing roots deep enough that the sea, factions, guardian, people, and routes can live again.

That is the missing “deep roots” layer.

## 2. Proposed insertion for `14_DESIGN_PILLARS v0.2`

Place this after the Identity Anchor and before Pillar I.

```md
## 0.1 Deep Roots Doctrine — the connective layer

The five pillars are not separate goals. They are the visible branches of one root system.

**Harbor Guardians is about re-rooting a broken world.** The Player Harbor is the living root: it gathers people, protects memory, shelters resources, receives cargo, records deeds, anchors the guardian bond, and sends the player back out into danger. The World is damaged because its roots were drowned, severed, abandoned, or corrupted. Progress means making those roots live again.

Every major system must answer one root question:

> **How does this deepen the Harbor's roots in the world?**

A feature may deepen roots by:

1. restoring a place that was broken;
2. protecting people, structures, routes, or memory;
3. strengthening the bond with the chosen guardian;
4. making the player's choices visible in the Harbor or world map;
5. bringing something home that changes the Harbor;
6. revealing why the world broke and why restoration matters;
7. creating future obligations the player understands and accepts.

If a feature creates activity but does not deepen roots, it is probably noise. If it creates power but does not deepen roots, it is probably a bypass. If it creates loss but does not threaten roots fairly and visibly, it violates player trust.

**Root rule:** every system must either feed the roots, protect the roots, reveal the roots, or grow from the roots.
```

## 3. Refine each pillar with “root” language

### Pillar I — Restore what was lost

Current meaning is good. Add a stronger root requirement:

```md
**Deep-root requirement.** Restoration must reveal what the place used to mean, not only clear its corrupted state. A restored harbor, route, Sanctum, or faction site should regain at least one living function: shelter, trade, memory, production, travel, defense, ritual, or relationship.
```

Reason: prevents “restore” from becoming a checklist of cleansed nodes.

### Pillar II — Protect what you've built

Add a people/home layer:

```md
**Deep-root requirement.** Protection is not only resource defense. The player protects a living harbor: workers, routes, docks, storage, rituals, claims, messages, repairs, and the visible marks of prior restoration. A raid should threaten the Harbor's exposed roots, not randomly punish the player.
```

Reason: connects 3S storage, raids, Inbox, repair queues, and harbor life.

### Pillar III — Grow through partnership

Add covenant language:

```md
**Deep-root requirement.** Guardian bond is a covenant with a place. The guardian should not only become stronger beside the hero; the Harbor should become more itself because this guardian lives there. Bond growth should echo in buildings, routes, warnings, rituals, idle presence, Surge presentation, and Sanctum restoration.
```

Reason: prevents guardian progression from staying combat-only.

### Pillar IV — Leave visible marks on the world

Add memory/persistence:

```md
**Deep-root requirement.** A visible mark is more than decoration. It is world memory. The player should be able to look at the Harbor or map and remember: this wall survived a raid, this route reopened after an expedition, this district reflects my guardian, this claim came from a story beat, this Sanctum woke because of our bond.
```

Reason: ties art, save/load, system reports, geography, and player memory together.

### Pillar V — Every expedition changes home

Add return ritual:

```md
**Deep-root requirement.** Return is a ritual. Docking should reconcile the journey into the Harbor through cargo, claims, messages, faction receipts, threat changes, repairs, guardian reactions, and next-step prompts. The expedition is not complete when the battle ends; it is complete when the Harbor absorbs what happened.
```

Reason: makes the home loop the emotional cadence of the entire game.

## 4. Add a “Root Pass” review checklist

Add this after §7, before Change Control.

```md
## Root Pass — final qualitative review before spec

After a feature passes the five pillars and companion gates, it receives a Root Pass.

A feature passes the Root Pass only if it can answer at least three of these questions clearly:

1. **Memory:** what does the player remember about this later?
2. **Home:** what changes in the Harbor because this exists?
3. **Guardian:** how can the chosen guardian react to, shape, or be shaped by this?
4. **Risk:** what is fairly at stake, and how is it shown before loss?
5. **Return:** what comes back from this into the Harbor loop?
6. **World:** what does this reveal or repair in the Evermeer?
7. **Future:** what new obligation, route, relationship, or choice does this create?

If a feature cannot answer at least three, it is likely a detached activity and must be redesigned, deferred, or rejected.
```

This converts “deep roots” into a usable review instrument without pretending it is numeric.

## 5. Add “Root Threads” as cross-system contracts

These are not new systems. They are tags every future feature can use.

| Root Thread | What it means | Example surfaces |
|---|---|---|
| `memory` | The world records what happened | restored site visuals, Inbox reports, scarred/repaired walls |
| `shelter` | The Harbor protects life/resources/story | Safe Storage, Story Claims, worker states |
| `exposure` | Valuable things outside safety create fair risk | 3S exposed surplus, Docked Cargo, raid warnings |
| `bond` | Guardian relationship changes play and presentation | Surge, Hearth, Sanctum, reactions |
| `return` | Away content resolves through home | cargo, claims, receipts, repair prompts |
| `route` | Travel creates obligations and opportunity | Ship Hold, World Atlas, Drowned routes |
| `restoration` | Damaged places regain function | Sanctums, Drowned Harbors, faction harbors |
| `stewardship` | Good planning protects future play | repairs, storage, readiness, accessibility/no-hidden-loss |

Recommended future schema use:

```ts
rootThreads: Array<
  "memory" | "shelter" | "exposure" | "bond" | "return" | "route" | "restoration" | "stewardship"
>
```

Do not implement this as a hard requirement in M0 unless it is cheap. For now, it belongs in the design review template and future content schemas.

## 6. Specific missing “deep roots” content hooks

These are not immediate implementation tasks, but the design should plan for them.

### 6.1 Harbor memory

Every Harbor should retain visible history:

- first wall built;
- first raid survived;
- first route reopened;
- first Drowned Harbor cleansed;
- first Story Claim resolved;
- first Guardian Surge used;
- Sanctum restoration stages;
- faction treaty markers.

This can start as data flags and later become art/UI.

### 6.2 Guardian presence as root expression

Guardian identity should appear in:

- Hearth state;
- idle city placement;
- warning messages;
- Surge presentation;
- favored building reactions;
- Sanctum restoration visuals;
- faction comments;
- first-hour guidance.

Minimum future slice: each launch guardian gets one Harbor idle placement, one raid-warning line, one expedition-return line, and one Sanctum-stage reaction.

### 6.3 People of the Harbor

The Harbor needs a light human layer so the player protects more than resources. Not a full NPC life sim for v1; just enough to imply life:

- worker groups;
- dockhands;
- militia;
- builders;
- keep steward / dockmaster / hearth attendant roles;
- System Inbox sender identities.

This supports Pillar II without adding a complex NPC simulation.

### 6.4 Rituals of return

Returning from an expedition should always have a small, reliable structure:

1. Dock arrival.
2. Cargo / reward routing.
3. Guardian reaction.
4. Ledger / Inbox update.
5. Threat / faction / route change.
6. Next suggested action.

This can be UI-first and cheap. It will make the game feel cohesive early.

### 6.5 Roots under the world lore

The Lore Bible should explain why everything is a harbor and why Drowned Harbors matter. Suggested spine:

- Harbors were once anchors between people, guardians, routes, and Aether currents.
- The Drowning severed those anchors.
- Guardians are tied to Sanctums because Sanctums are root-harbors, not temples in isolation.
- Restoration reconnects routes, memory, trade, faction trust, and guardian inheritance.

This makes the pillars feel inevitable rather than decorative.

## 7. Proposed pass-back to Claude

```text
Anthony likes the current pillars, but they still feel like separate goals. Add a Deep Roots layer that binds them into one package.

Do not add a sixth pillar unless necessary. Instead prepare 14_DESIGN_PILLARS v0.2 with:

1. New §0.1 Deep Roots Doctrine after the identity anchor.
2. Deep-root requirement paragraph under each of the five pillars.
3. New Root Pass checklist: Memory / Home / Guardian / Risk / Return / World / Future.
4. Root Thread tags: memory, shelter, exposure, bond, return, route, restoration, stewardship.
5. Cross-doc notes for Lore Bible, Guardian Bible, Event System, Difficulty Philosophy, and future schema/content review.

Core wording:
"The Harbor is not a base menu. It is a living root system: memory, shelter, bond, trade, risk, return, and restoration all flow through it. Every system must either feed the roots, protect the roots, reveal the roots, or grow from the roots."

No repo/vault mutation. No canon merge. Return 14_DESIGN_PILLARS v0.2 for independent review.
```

## 8. Recommendation

Proceed with a **pillars v0.2 refinement**, not a whole new doctrine package. This should be a small but important document update before the pillars become near-immutable.

The project should preserve the five approved pillars, but add the Deep Roots layer so they function as one coherent emotional architecture.
