---
title: "Harbor Guardians — Event System Specification"
doc_id: "15_EVENT_SYSTEM_SPEC"
version: 0.2-DRAFT
date: 2026-07-14
bundle_version: eventsystem-2026-07-14
status: DRAFT pre-Alpha reference; not yet accepted into the repo doctrine set. Event/quest/world-event framework required before any Alpha event content (approved R-D3, disposition N2). Introduces the EVT invariant suite. Does not authorize Alpha; M0 remains closed.
owner: Anthony Hammon
source: "05_THREAT_AND_RAID_DIRECTOR v0.1.3 (TD1–TD4 — raids are one event class); 04_REWARD_CLAIM_LEDGER v0.4 (L-suite — all rewards route here); 04A_HARBOR_INBOX v0.3 (M-suite — event surfacing); 04B_SHIP_HOLD_AND_DOCKED_CARGO v0.1.2 (CARGO — physical outcomes); 01_ECONOMY_FOUNDATION v1.7 (E15 no new sources); 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS v0.1.2 (D39 schema discipline); SAVE_LOAD_TIME_RECONCILIATION v0.5 (S7 — events persist); 10_WORLD_ATLAS v0.2.1 (world/route events); 11_FACTION_CODEX v0.1.2 (faction events); 12_GUARDIAN_SANCTUM_AND_KIT v0.1.2 (guardian reactions); 14_DESIGN_PILLARS (Pillar V — every expedition changes home); DECISIONS.md D32/D35/D37"
classification: FUTURE BUILD — framework/schema shape; all numbers are design targets pending sim
---

# Harbor Guardians — Event System Specification (v0.2)

## 0. Position & purpose

Raid doctrine is already defined by the Threat & Raid Director (TD-suite) — note the doctrine exists, the gameplay does not (M0 has no gameplay implementation). But raids are **one kind of event**. Alpha needs quests, world events, seasonal events, story beats, and faction events — and authoring each as a bespoke system would create the exact parallel-systems sprawl the Content Scalability Rules forbid (R-D4). This spec defines **one event framework** that raids are a member of, so every timed/triggered/conditional occurrence in the game shares a lifecycle, a schema, and an invariant suite.

**Core principle:** an event is a **data-defined state machine** that observes game state, may present the player a choice or challenge, and resolves into effects — where **every effect routes through an existing system** (Ledger for rewards, Cargo for physical goods, TD for threat, Inbox for messaging). Events **create no new resource sources** (E15/GDN11) and **cause no hidden loss** (no-hidden-loss doctrine).

**Governing reminder:** this is document-mode, a pre-Alpha reference not yet accepted into the repo doctrine set; does not authorize Alpha. M0 is closed; this is pre-Alpha design.

## 1. Event taxonomy (raids become one class)

| Class | Examples | Existing home it generalizes |
|---|---|---|
| **Threat events** | raids, assaults, blockades | Threat & Raid Director (TD) — raids are the reference implementation |
| **Expedition events** | route encounters, discoveries, hazards | World Atlas routes/hazards |
| **Quest events** | multi-step objectives, story beats, Sanctum-restoration arcs | new — but rewards via Ledger, surfacing via Inbox |
| **World events** | Drowned Harbor escalation, storms shifting routes, regional shifts | World Atlas + TD threat model |
| **Faction events** | treaty offers, requests, rivalry flare-ups, support windows | Faction Codex (FCT-suite) |
| **Seasonal/ambient events** | festivals, periodic windows | new — deferred content, but the framework supports it (disposition §4) |

All six classes share the §2 lifecycle, §3 schema shape, and §5 invariants. Raids specifically **must remain conformant** — this spec does not rewrite TD, it recognizes TD as the proven instance the rest inherit from.

## 2. Event lifecycle (the shared state machine)

Every event moves through a fixed, save-safe state machine:

```
DORMANT → ELIGIBLE → OFFERED/TRIGGERED → ACTIVE → RESOLVING → RESOLVED
                                    │                    │
                                    └──── EXPIRED/DECLINED (fair, warned) ────┘
```

- **DORMANT** — defined in data, conditions not yet met.
- **ELIGIBLE** — trigger conditions satisfied; event is a candidate.
- **OFFERED** (player-choice events) or **TRIGGERED** (imposed events like raids) — the player is informed (Inbox, M-suite) with any decision window.
- **ACTIVE** — running; may involve combat, a timer, an objective, an expedition.
- **RESOLVING** — outcome computed; effects staged.
- **RESOLVED** — effects applied through existing systems; recorded; event closes or advances a chain.
- **EXPIRED/DECLINED** — the player didn't engage in the window; must be **fair and foreseeable** (warned per D35), never a hidden penalty.

Transitions are **deterministic** (same state + same seed = same transition — harness-testable) and **atomic across save** (S7): an event mid-flight persists and resumes exactly, never duplicating or losing its effects (mirrors the guardian Rite atomicity, GDN9).

## 3. Event schema shape (data-defined, D39)

Events are `/data` seeds validated against generated schema — no event logic hard-codes numbers (No Magic Numbers). Shape (final field names set during implementation, TS-types→JSON Schema per D39):

```
Event {
  event_id:        string
  class:           "threat" | "expedition" | "quest" | "world" | "faction" | "seasonal"
  triggers:        Condition[]          // ALL must hold to become ELIGIBLE
  offer_window:    Timer | "imposed"    // player-choice window, or imposed (raids)
  objectives:      Objective[]          // what ACTIVE requires
  outcomes:        Outcome[]            // resolution branches (success/partial/fail/decline)
  effects:         Effect[]             // each binds to an existing system (see §4)
  surfacing:       InboxCategory        // how the player is told (M-suite)
  chain_next:      event_id | null      // multi-step quests
  invariant_refs:  string[]             // EVT + any suite this event touches
}
```

**Condition** references only observable state (ST tier, resources, threat level, faction standing, prior event completion, world node state) — never hidden RNG the player can't anticipate (§5 EVT4). **Every value carries id·unit·gate·source·invariant-refs (DC4).**

## 4. Effects bind to existing systems (the hard boundary)

An event **may not** invent a delivery mechanism. Each effect names an existing system:

| Effect kind | Routes through | Guarantees inherited |
|---|---|---|
| Grant reward | Claim Ledger (L-suite) | earned, recorded, partial-claimable — never ambient |
| Grant physical goods | Ship Hold / Docked Cargo (CARGO) | pressure-timer, raidable-if-exposed, never auto-banked |
| Change threat | Threat & Raid Director (TD) | warned, bounded |
| Adjust economy | existing source/sink/event_id only (E15/GDN11) | no new faucet — magnitude shift only |
| Change faction standing | Faction Codex (FCT) | within existing support/rivalry model |
| Message the player | Harbor Inbox (M-suite) | categorized, non-spammy (D40 light nudges) |
| Guardian reaction | Guardian kit reaction hooks | flavor/presentation, no power |

If a proposed event needs an effect with no existing home, that is a **stop-and-ask** doctrine gap — the Architect adds the capability to the right system first; the event system never becomes a backdoor faucet.

## 5. EVT invariant suite (claim-to-test; registered as fail-loud stubs)

| ID | Invariant |
|---|---|
| **EVT1** | Every event is pure data validated against schema; no event hard-codes gameplay numbers. |
| **EVT2** | The lifecycle state machine is deterministic: same state + seed ⇒ same transition. |
| **EVT3** | Events are save-atomic: an event mid-flight persists and resumes exactly once; never duplicates or drops effects across save/load (S7). |
| **EVT4** | Trigger conditions reference only observable state; no hidden-information gating (player-trust / OB5). |
| **EVT5** | Every reward effect routes through the Claim Ledger; no event grants resources ambiently (L-suite). |
| **EVT6** | No event creates a new resource source; economy effects bind to an existing source/sink/event_id (E15/GDN11). |
| **EVT7** | Expiry/decline is fair: the player was warned within a foreseeable window before any loss (D35/D32). |
| **EVT8** | No event causes hidden loss; all losses are shown, attributable, and within the loss boundaries defined by Economy (E12/E13), Claim Ledger (L-suite), Cargo (CARGO-suite), Threat Director (TD-suite), and Save/Load (S7) doctrine. (Difficulty Philosophy consolidates those boundaries into one table once accepted; this invariant binds to the source specs directly and does not depend on that doc's acceptance.) |
| **EVT9** | Raids (TD) validate as conformant threat-class events — the framework does not break the proven raid implementation. |
| **EVT10** | Multi-step chains advance atomically; a chain cannot double-grant or skip a step across save/load. |

On owner acceptance, a separate pre-Alpha documentation/skeleton PR may register EVT1–EVT10 in the sim harness as fail-loud stubs, exactly like every other suite — no event content is "done" until its EVT invariants pass. This spec does not itself mutate the repo or the harness.

## 6. Player-experience shape (Pillar V in operation)

Events exist to make the world feel alive and to make **every expedition change home** (Pillar V). The return-from-expedition ritual is itself an event-resolution sequence: dock → cargo/claims routed → threat/faction deltas → Inbox digest → next prompt. Events should feel like the world acting, not like a quest-log checklist — but that texture is content authored *against* this framework, not part of it.

## 7. Scope discipline
- This spec defines the **framework** (lifecycle, schema, effects boundary, invariants). It does **not** author event *content* — that's Alpha/Beta content work, gated behind this framework's acceptance and the EVT stubs.
- **Seasonal/ambient events** and **living-world escalation** are supported by the framework but remain **deferred content** (disposition §4) — the capability exists; the content is post-v1 unless it improves the ST1–ST5 experience (R-D1 filter).
- DRAFT pre-Alpha reference, not yet accepted into repo doctrine; does not authorize Alpha; M0 stays closed.

## 8. Review routing & what comes next
Review: confirm the lifecycle is save-atomic and deterministic; confirm §4's effects-bind-to-existing-systems boundary has no gap; confirm EVT1–EVT10 are testable and that EVT9 keeps raids conformant; confirm no new resource path sneaks in. On acceptance, EVT stubs join the harness. This closes the pre-Alpha document queue from R-D3 — after which an **Alpha authorization record** (owner) and an **Alpha execution brief** (Architect→Implementer) are the next artifacts, when the owner chooses to proceed.

*DRAFT v0.2 — event framework per R-D3/N2. Numbers are design targets pending sim. Pre-Alpha reference, not yet accepted into repo doctrine; does not authorize Alpha. Raids (TD) remain the reference doctrine the framework must not break.*
