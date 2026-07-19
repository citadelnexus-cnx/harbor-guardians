# Harbor Guardians — Project Progress Ledger

**Status: TRACKING RECORD — not gameplay doctrine.**

This document tracks phase progress and authorization state. It does not authorize implementation. The durable source of truth is the GitHub repository: merged pull requests, CI evidence, and `main` history. `CLAUDE.md` §7 and the applicable execution brief govern current implementation scope.

## Status legend

| Status | Meaning |
| --- | --- |
| **CLOSED** | Exit conditions met, evidence merged, and owner accepted the phase as complete. |
| **AUTHORIZED** | Owner authorization exists, but the phase is not closed. |
| **REVIEW** | Work and evidence await owner review. |
| **HOLD** | Authorized work is paused. |
| **NOT AUTHORIZED** | No implementation permission exists. |
| **FUTURE** | Placeholder only; scope may not yet be defined. |

## Current control state

| Area | Status |
| --- | --- |
| Foundation / Document Foundation | CLOSED |
| Milestone 0 | CLOSED |
| Pre-Alpha Docs | CLOSED |
| Alpha A0 | CLOSED |
| Alpha A1 | CLOSED |
| Alpha A2 | CLOSED |
| Alpha A3 | CLOSED |
| Alpha A4 | NOT AUTHORIZED |
| Alpha A5–A6 | FUTURE |
| Beta | FUTURE |
| Production | FUTURE |
| Gameplay loop | NOT AUTHORIZED |
| Event rewards / effect execution / real event content | NOT AUTHORIZED |
| Combat / raids / guardians / factions / cargo voyages | NOT AUTHORIZED |
| Gameplay UI | NOT AUTHORIZED |
| Deployment / production packaging | NOT AUTHORIZED |

## Phase ledger

### Foundation / Document Foundation

- **Status:** CLOSED
- **Purpose:** Establish the design doctrine, decision register, foundation specifications, Phase-B content documents, external review disposition, and design pillars before implementation.
- **Durable evidence:** `docs/foundation/`, `docs/phase-b/`, `docs/reviews/`, `docs/14_DESIGN_PILLARS_v0.1.md`, `docs/00_PRE_M0_MASTER_MANIFEST_v1.3.md`, and `DECISIONS.md`.
- **Implemented invariants:** none; doctrine-only phase.

### Milestone 0

- **Status:** CLOSED
- **Purpose:** Repository scaffold, operating rules, CI gate, deterministic sim-harness skeleton, save/load skeleton, and empty Tauri shell; no gameplay.
- **Durable evidence:** PRs #1–#11 and `M0_EXIT_EVIDENCE.md`.
- **Implemented invariants:** S5 and S7 at empty-shell scope.

### Pre-Alpha Docs

- **Status:** CLOSED
- **Purpose:** Add `18_DIFFICULTY_PHILOSOPHY_v0.2` and `15_EVENT_SYSTEM_SPEC_v0.2` as pre-Alpha references.
- **Durable evidence:** PR #13.
- **Implemented invariants:** none directly; the event specification supplied EVT1–EVT10 statements.

### Alpha A0

- **Status:** CLOSED
- **Purpose:** Register EVT1–EVT10 as addressable fail-loud stubs; no event behavior.
- **Durable evidence:** PR #14 and `docs/alpha/ALPHA_A0_EXECUTION_BRIEF_v0.1.md`.
- **Implemented invariants:** none newly implemented; registry expanded to 132.
- **Result:** 132 registered / 2 implemented / 130 fail-loud at that stage.

### Alpha A1

- **Status:** CLOSED
- **Purpose:** Minimal Harbor State and Resource Spine with deterministic 3S storage and schema-backed data.
- **Durable evidence:** PR #15 and `docs/alpha/ALPHA_A1_EXECUTION_BRIEF_v0.1.md`.
- **Implemented invariants:** DC1, DC4, DC5, DC6; S5 extended.
- **Result:** 132 registered / 6 implemented / 126 fail-loud.

### Alpha A2

- **Status:** CLOSED
- **Purpose:** Claim Ledger and Reward Routing spine using test-supplied reward packages only.
- **Durable evidence:** PR #16 and `docs/alpha/ALPHA_A2_EXECUTION_BRIEF_v0.1.md`.
- **Implemented invariants:** L1, L5, L6, L7, L11, L14; S5 and S7 extended.
- **Save contract:** v1→v2 migration.
- **Result:** 132 registered / 12 implemented / 120 fail-loud.
- **Retained boundary:** no gameplay reward source; `source_type` remains `test_supplied` only.

### Alpha A3

- **Status:** CLOSED
- **Purpose:** Expedition and Event Skeleton, Option A only — lifecycle mechanics without gameplay effects or event rewards.
- **Authorization:** limited owner authorization dated 2026-07-18; public-safe boundary recorded in `docs/alpha/ALPHA_A3_EXECUTION_BRIEF_v0.1.md`.
- **Durable evidence:** PR #18, reviewed head `2a1254f147c56bc9742726ea0bbf339cfc67d0a3`, squash commit `245b73215cf9b098b8f54eaa559dabc1b49703d4`, CI run #41 successful.
- **Delivered:**
  - typed `Event`, `Condition`, `Outcome`, and inert `Effect` contracts;
  - generated schema-backed test fixtures only;
  - deterministic nine-label lifecycle transitions;
  - observable trigger conditions limited to implemented A1 harbor and A2 Claim Ledger state;
  - real-save-path event persistence with save schema v2→v3;
  - full staged-effect descriptor integrity;
  - non-empty and unique persisted `instance_id` enforcement.
- **Implemented invariants:** EVT1, EVT2, EVT3, EVT4.
- **Verification:** `test:events` 21/21; `test:ledger` 16/16; `test:save` 20/20; `test:harbor` 9/9; A3 BATCH GREEN.
- **Result:** **132 registered / 16 implemented / 116 fail-loud.**
- **Remaining blocked scope:** EVT5–EVT10, event reward generation, event-to-Claim-Ledger delivery, new Claim Ledger `source_type`, effect execution, real event content, gameplay loop, combat, raids, threat behavior, guardians, factions, cargo, gear, Inbox, gameplay UI, deployment, and production.
- **Next authorization gate:** a separate owner decision defining a bounded Alpha A4 scope. No A4 scope is implied by A3 closure.

### Alpha A4

- **Status:** NOT AUTHORIZED
- **Purpose:** Not selected or defined.
- **Durable evidence:** none.
- **Implemented invariants:** none.
- **Remaining blocked scope:** everything until a separate architecture decision, execution brief, and owner authorization exist.

### Alpha A5 / A6

- **Status:** FUTURE
- **Purpose:** placeholders only; not defined or scheduled.

### Beta

- **Status:** FUTURE
- **Purpose:** later milestone referenced by existing doctrine; not currently scoped.

### Production

- **Status:** FUTURE
- **Purpose:** later release gate requiring separate packaging, deployment, and production criteria.

## Current invariant summary

As of closed Alpha A3 and merged PR #18:

- **132 total registered invariants**.
- **16 implemented and green:** L1, L5, L6, L7, L11, L14, S5, S7, DC1, DC4, DC5, DC6, EVT1, EVT2, EVT3, EVT4.
- **116 remain fail-loud stubs**.

The count is evidence, not a target. It changes only when an authorized phase converts specific stubs into honest, tested checks.

## Deferred hardening notes

These remain tracked but are not authorized merely by appearing here:

- **A2 amount safe-integer/fraction hardening:** enforce `Number.isSafeInteger` at the contract/schema boundary.
- **A2 story-id collision hardening:** replace suffix-derived identity with an explicit source-package relationship.
- **Harness schema-load caching / subprocess dedup:** reduce repeated JSON reads, AJV compilation, and validation subprocess work.

## Update protocol

- Update this ledger only through a branch and draft PR.
- Update it after merged phase evidence.
- Never mark a phase CLOSED without an owner decision and merged evidence.
- Never mark a phase AUTHORIZED without a separate owner authorization and governing brief.
- Cite PRs, SHAs, tests, and invariant evidence.
- Never reproduce private authorization text.

## Next valid artifact

**Alpha A4 Architecture Decision Record**

- **Status: NOT AUTHORIZED FOR IMPLEMENTATION.**
- The next valid work is architecture and scope selection only: compare bounded options, identify dependencies and risks, and prepare a proposed execution brief for owner review.
- No A4 code, schema, invariant conversion, gameplay behavior, or deployment work may begin until the owner separately authorizes a named A4 option.