---
title: "Milestone 0 — Implementation Readiness Packet"
doc_id: "M0_IMPLEMENTATION_READINESS_PACKET"
version: 0.1.3-DRAFT
date: 2026-07-11
bundle_version: M0-readiness-2026-07-11
status: DRAFT v0.1.3 for owner/independent review — the pre-build readiness plan; F-1 resolved (Economy v1.7 defines E21; Sim v0.6.2 cross-refs it). APPROVED-FOR-REVISION; NOT canon; NOT implementation authorization; no repo/vault mutation. Approval of THIS packet plus the §13 signature is what authorizes Milestone 0 build work — and nothing before it.
owner: Anthony Hammon
project: "Harbor Guardians — standalone city-builder × RPG hybrid (TypeScript + Tauri 2, PixiJS, deterministic sim core)"
source: "Governing build sequence (owner); full closed foundation set (18 docs) + Decision Registers (D1–D40); B2 World Atlas v0.2.1; B3 Faction Codex v0.1.2; B4 Guardian Sanctum & Kit v0.1.2; B4A Flagship Kit Sheets v0.1.2; B4B Launch Chassis Anchors v0.2.1; 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 (D39); SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2; SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5"
classification: FUTURE BUILD — planning artifact; defines readiness, does not perform it
---

# Milestone 0 — Implementation Readiness Packet (v0.1.3)

## 0. What this packet is (and is not)

This is the **single planning artifact that defines everything that must exist and be approved before Claude Code writes a line of Harbor Guardians code.** It gathers the ten required setup areas into one reviewable place, gives each a concrete plan and an acceptance checklist, and ends with a **Build-Authorization Gate** you sign.

**Governing principle (repeated by design):**
> **Foundation documents define *what* Harbor Guardians is.**
> **Milestone planning defines *how* Claude Code will build it.**
> **Environment/toolchain setup defines *where* Claude Code will build it.**
> **Implementation begins only after all three are ready and owner-approved.**
> **Document completion does not equal build authorization.**

**This packet is NOT:**
- not canon; not a repo/vault mutation; not code;
- not implementation authorization *until you approve it* — approval of this packet (§13) is precisely the act that authorizes Milestone 0 work to begin;
- not a substitute for the foundation docs — it references them, it does not replace them.

**Current source of truth:** the documents only. No repo exists yet. Harbor Guardians is a standalone project with no code, no deployment, no infrastructure.

---

## 1. Readiness area 1 — Milestone 0 setup plan (the overall shape)

**Goal:** a clean, reproducible path from "documents only" to "environment + repo + schemas + sim harness + save/load skeleton exist and pass their checks," with **no gameplay implemented yet**.

**Milestone 0 scope (what M0 delivers):**
1. A prepared Windows development environment (area 5).
2. An initialized Git repo with the agreed scaffold (areas 2, 4).
3. The foundation docs + `CLAUDE.md` + `AGENTS.md` + `DECISIONS.md` committed (areas 3, 6).
4. The data-contract schemas generated from TS types (area 7).
5. A running sim harness with the claim-to-test invariant suites wired (area 8).
6. A save/load skeleton that round-trips an empty/minimal state (area 8, foundation Save/Load spec).
7. CI that runs typecheck + lint + schema-validation + sim-harness on every push (areas 4, 8).

**Milestone 0 explicitly does NOT include:** any gameplay loop, combat, economy simulation of real content, UI beyond a smoke-test window, or any guardian/faction/world *content* logic. Those are Alpha+ (area 9). M0 proves the *machine that will build the game* works — not the game.

**Phasing target (owner-stated):** M0 → Alpha → Beta → Production candidate (defined in area 9). The desired final target is the most optimized *practical production-level* build, reached in phases, not a throwaway prototype.

**M0 acceptance:** all seven M0 deliverables above exist, each passes its area checklist, and the §12 readiness checklist is fully green.

---

## 2. Readiness area 2 — Repo scaffold plan

**Goal:** a repo layout that matches the architecture the foundation docs already imply (data-driven, deterministic sim core, Tauri shell), so content and code have exactly one home each.

**Proposed top-level layout (subject to owner/Claude Code refinement at M0):**
```
harbor-guardians/
  /docs/                     # all foundation + B-series docs (read-only source of truth in-repo)
    /foundation/             # the closed 18-doc set
    /phase-b/                # B2, B3, B4, B4A, B4B
    CLAUDE.md AGENTS.md DECISIONS.md
  /data/                     # data seeds (No Magic Numbers) — the game's content
    /world/ /factions/ /guardians/ /economy/ /combat/ /threat/ ...
  /schema/                   # generated JSON Schema (from TS types, D39)
  /src/
    /sim/                    # deterministic simulation core (pure, headless-testable)
    /save/                   # save/load + time reconciliation
    /ui/                     # PixiJS/Tauri presentation (thin; reads sim state)
    /platform/               # Tauri 2 shell, OS integration
  /sim-harness/              # persona matrix + invariant suites (claim-to-test)
  /tests/                    # unit/integration/e2e
  /.github/workflows/        # CI
  package.json tsconfig.json …
```

**Scaffold rules:**
- `/data/` is authored content; `/src/sim/` reads it, never hard-codes numbers (Doc 07 No Magic Numbers).
- The sim core is **pure and headless** — runnable without the UI so the sim harness can drive it deterministically (Sim Harness spec; Blueprint deterministic-core requirement).
- `/docs/` is committed so Claude Code always has the source of truth in-context.
- One home per feature (foundation layer rule): world→`/data/world`, factions→`/data/factions`, guardians→`/data/guardians`, etc.

**Acceptance:** the scaffold is created empty (folders + placeholder READMEs + config), typechecks, and CI runs green on an empty project.

---

## 3. Readiness area 3 — Claude Code operating rules (`CLAUDE.md` + `AGENTS.md`)

**Goal:** encode the discipline this project has run on so Claude Code inherits it automatically.

**`CLAUDE.md` (operating rules for the coding agent) — required contents:**
- **Role & authority:** Owner = Command; Architect (design authority) approves specs; Claude Code = Implementer; Independent Reviewer audits; sim harness = QA. Claude Code implements *approved* specs only.
- **No Magic Numbers:** every gameplay number comes from `/data/` seeds validated against `/schema/`; no literals in `/src/sim`.
- **Branch-first:** never commit to `main`; every change on a branch → PR → review (area 4).
- **Claim-to-test:** no feature is "done" until its invariant(s) pass in the sim harness (area 8). A capability claim must map to CURRENT BUILD / FUTURE BUILD / FINAL FORM, or "UNKNOWN — requires evidence."
- **Preserve, don't rewrite:** extend/layer/integrate; do not rewrite working systems; preserve existing state on partial updates (foundation code-hygiene rules).
- **No hidden loss:** honor CARGO/ledger/save invariants — never silently delete player value; atomic saves (S7).
- **Doctrine lookups:** cite the governing doc/decision for any non-trivial change; if a spec is missing or ambiguous, stop and ask rather than invent doctrine.
- **Scope discipline:** implement the current milestone only; do not begin milestone N+1 until N is stable and tested.

**`AGENTS.md` (multi-agent workflow) — required contents:**
- Who does what (the five roles), how a spec flows from Architect → Implementer → Reviewer → QA.
- Handoff format: `CHANNEL / LAYER / TASK / SAFEGUARDS / SUCCESS CONDITION / CONTEXT`.
- What each agent may and may not do (e.g. Implementer may open PRs, may not self-merge to `main` without approval; Reviewer never mutates code).
- Escalation: what forces a stop-and-ask (missing doctrine, an invariant conflict, a request that would breach a foundation invariant).

**Acceptance:** both files exist, are committed to `/docs/`, and encode every rule above; a dry-run "explain how you'd approach task X" from Claude Code reflects them.

---

## 4. Readiness area 4 — Git / GitHub workflow rules

**Goal:** a safe, reviewable, reversible change process from day one.

**Workflow:**
- **Branching:** `main` is protected; work happens on `feature/*`, `fix/*`, `chore/*` branches.
- **PRs required:** every merge to `main` is a PR; no direct pushes. PR template includes: linked spec/doc, affected invariants, test evidence, reviewer sign-off.
- **Review gate:** a PR merges only after (a) CI green, (b) reviewer approval, (c) for anything touching an invariant, sim-harness evidence attached.
- **Commits:** small, scoped, message references the doc/decision (e.g. "impl W1 route rations per World Atlas §5").
- **CI on every push:** typecheck → lint → schema validation → sim-harness invariant run. Red CI blocks merge.
- **Reversibility:** every change is a revertable commit; no destructive history rewrites on `main`; tags at each milestone.
- **Secrets:** none in the repo; `.env` gitignored; no tokens/keys committed (foundation evidence/security rules).
- **Owner approval points:** repo creation, first push, milestone tags, and any deployment are explicit owner actions (not automatic).

**Acceptance:** branch protection on `main` documented; PR template committed; CI workflow file present and green on the empty scaffold; a test PR demonstrates the full gate.

---

## 5. Readiness area 5 — Local Windows development environment setup

**Goal:** a reproducible Windows dev box that can build and run a Tauri 2 + TypeScript + PixiJS project and run the headless sim harness.

**Toolchain checklist (owner installs; versions pinned at M0):**
- **Node.js** (LTS) + a pinned package manager (npm or pnpm) — for the TS/PixiJS/UI layer and sim harness.
- **Rust toolchain** (stable, via rustup) — required by **Tauri 2** (Tauri's backend is Rust).
- **Tauri 2 prerequisites on Windows:** Microsoft C++ Build Tools + the WebView2 runtime (Tauri's documented Windows deps).
- **Git** (+ a GitHub account/auth for the remote).
- **A code editor** (e.g. VS Code) with the agent integration the owner uses.
- **PowerShell** as the local shell (owner's environment).

**Verification steps (part of M0, not before):**
1. `node -v`, `npm -v`/`pnpm -v`, `rustc --version`, `cargo --version` all succeed.
2. A stock `create-tauri-app` (or equivalent) scaffold **builds and launches an empty window** on the Windows box.
3. The headless sim harness runs from the CLI without the UI.
4. CI mirrors these versions so local and CI agree.

**Acceptance:** a short "environment verified" note capturing each command's output and exit code (foundation verification discipline); the empty Tauri window launches; the harness runs headless.

**Open item for owner:** confirm the target machine(s) and whether builds also need to be reproducible on the remote Ubuntu box, or Windows-only for M0. (Recommendation: Windows-only for M0; cross-platform is a Beta concern.)

---

## 6. Readiness area 6 — Memory / document-access setup

**Goal:** Claude Code always has the current source of truth and never drifts from doctrine.

**Plan:**
- **Docs in-repo:** the full foundation set + B-series live under `/docs/` and are the in-context reference for every task.
- **`DECISIONS.md`:** a running, in-repo ledger of D1–D40 + W-D/F-D/G-D decisions (and any new ones), each with status (planning-locked / ratified / superseded) — the single place to resolve "what did we decide about X."
- **Doc→code traceability:** each `/data` and `/src/sim` module header cites the governing doc section + invariant IDs it implements (so an audit can trace any number back to a doc).
- **Change protocol:** if implementation reveals a doctrine gap, Claude Code stops, the Architect drafts/updates a doc, the decision is recorded in `DECISIONS.md`, and only then does code proceed — never invent doctrine in code.
- **Versioning:** docs keep the version discipline used throughout Phase B (frontmatter version, H1, closing line, supersedes).

**Acceptance:** `/docs/` populated; `DECISIONS.md` seeded with D1–D40 + W/F/G decisions; a sample module header shows the doc/invariant citation pattern.

---

## 7. Readiness area 7 — Schema / data-contract setup

**Goal:** turn the foundation's data contracts (Doc 07) into enforced schemas so No Magic Numbers is mechanically guaranteed.

**Plan (per Doc 07 / D39):**
- **TS types are the source of truth**; JSON Schema is **generated** from them (D39). No hand-authored JSON Schema.
- **Enums pinned:** `CoreResource` / `StandingResource` / `ReceiptMetric` (Doc 07 DC6); region enum + `HarborType` (World Atlas); `support_type` (B3); `chassis` / `difficulty_tag` / `launch_wave` (B4/B4A §4B).
- **Every seed value carries** id · unit · gate · source-section · invariant-refs (Doc 07 DC4).
- **Validation in CI (DC5):** an unversioned or invalid schema, or a `/data` file that fails its schema, blocks the build.
- **Boundary rules enforced by schema:** storage/exposed/cargo/raid-loss fields type against `CoreResource` only (DC6); economy shifts must name an existing `source_id`/`sink_id`/`event_id` (B4A §4A); `regions_crossed ∈ 0..5` (World Atlas W1).
- **Sample objects to validate against first:** the six guardian seed objects from B4A/B4B are the initial fixtures the schema must accept.

**Acceptance:** TS types compiled → JSON Schema generated; the six guardian fixtures validate; a deliberately-broken fixture is rejected by CI; DC1–DC6 wired as checks.

---

## 8. Readiness area 8 — Sim harness + claim-to-test + save/load skeleton

**Goal:** the QA spine exists before gameplay, so every future feature is provable.

**Plan (per SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 + SAVE_LOAD spec v0.5):**
- **Headless sim harness** drives the pure sim core deterministically (fixed seeds → reproducible runs).
- **Invariant suites wired as tests:** E1–E21, L1–L15, M1–M10+UX1, C1–C8, S1–S7, OPS1, CARGO1–CARGO5, TD1–TD4, A11Y1–A11Y5, DC1–DC6, OB1–OB5, GEAR1–GEAR6, and the Phase-B suites W1–W9, FCT1–FCT8, GDN1–GDN11. At M0 these exist as **registered, addressable test stubs** that fail-loud until their feature is implemented (so "claimed but untested" is impossible).
- **Persona matrix:** the harness runs the spec's player personas (e.g. assist-tier vs precision, aggressive vs economic) so parity invariants (C2/GDN8) are testable.
- **Claim-to-test rule:** a feature PR must turn its stub(s) green with evidence; no feature merges "done" without its invariant passing.
- **Save/load skeleton:** implements atomic save (S7) + deterministic replay + time reconciliation (Save/Load spec) for a **minimal/empty state** — round-trips with no loss, proving the persistence spine before any content depends on it.

**Acceptance:** harness runs headless on fixed seeds; all invariant IDs are registered (failing-loud where unimplemented); the save/load skeleton round-trips an empty state atomically; CI runs the harness.

---

## 9. Readiness area 9 — Alpha / Beta / Production-readiness gates

**Goal:** unambiguous, testable definitions of each phase so "done" is never subjective.

**Milestone 0 — exit gate (environment/repo/toolchain readiness):**
- Areas 1–8 complete; §12 checklist green; empty Tauri window launches; sim harness runs; save/load skeleton round-trips; CI green. **This gate + owner approval = build may proceed to Alpha.**

**Alpha — exit gate (playable core loop, placeholder assets):**
- The core loop runs end-to-end with placeholder art: build/harbor-ops → expedition → combat (Tide Chain→Bond Charge→Surge) → reward routing (Claim Ledger / Docked Cargo) → raid → save/load.
- The **flagship guardian (Raxa) plus at least one other chassis anchor** are playable from their kit sheets.
- Core invariant suites pass (economy E-suite, combat C-suite, ledger L-suite, cargo, save S7).
- No hidden-loss bugs; no broken saves. Systems *function*; polish/balance not required.

**Beta — exit gate (content + polish + stability):**
- All 10 launch guardians + 5 factions + the v1 world map (W-D4 node budget) implemented from data.
- Full accessibility (A11Y suite), onboarding/first-hour (OB suite), UI/UX pass, balance tuning against sim (ST5 variance ≤0.15 across guardians, GDN4).
- Stability: no P0/P1 bugs; all invariant suites green; performance within target on the Windows target box.

**Production candidate — exit gate (optimized, deployable):**
- Optimized build + packaging (Tauri installers); all tests passing; no hidden-loss bugs, no broken saves, no missing claimed systems (every claimed capability maps to a passing invariant).
- Deployment-ready artifacts; save-migration path validated; a full playthrough completes with the starting guardian.

**Acceptance:** these gate definitions are recorded (in `/docs/` + `DECISIONS.md`) and each becomes a checklist the project is measured against at phase boundaries.

---

## 10. Risk register (pre-build)

| Risk | Mitigation |
|---|---|
| Doctrine drift once code starts | `DECISIONS.md` + doc→code citations + stop-and-ask on gaps (area 6) |
| Magic numbers creeping into code | schema validation in CI blocks unseeded numbers (area 7, DC5) |
| "Claimed but untested" features | claim-to-test: invariant stubs fail-loud until proven (area 8) |
| Hidden player-value loss | CARGO/ledger/save invariants + atomic save S7 wired from M0 (area 8) |
| Windows/Tauri env friction | pinned toolchain + verified empty-window build before any gameplay (area 5) |
| Scope creep (building past a milestone) | scope discipline in `CLAUDE.md`; N+1 blocked until N tested (areas 3, 9) |
| Irreversible mistakes | branch-first + protected `main` + revertable commits + milestone tags (area 4) |

---

## 11. What is still needed from the owner before/at M0

1. **Approve this packet** (§13) — the act that authorizes M0 work.
2. **Confirm the target Windows machine(s)** and whether cross-platform is in M0 scope (recommendation: Windows-only for M0).
3. **Confirm the GitHub destination** (account/org, repo name — e.g. `harbor-guardians`; note this is separate from the existing Citadel/Evolution repos).
4. **Confirm package manager** preference (npm vs pnpm).
5. **Confirm any remaining B-series content** you want before Alpha (the anchor set is complete; future-wave guardians and full rosters can be Beta content).
6. **Sign the Build-Authorization Gate** (§13) when ready.

---

## 12. Milestone 0 readiness checklist (all must be green before Alpha)

```
[ ] Area 1  M0 setup plan approved
[ ] Area 2  Repo scaffold created, typechecks, CI green on empty project
[ ] Area 3  CLAUDE.md + AGENTS.md committed and encode all operating rules
[ ] Area 4  Git/GitHub workflow: main protected, PR template, CI on push, test PR passes
[ ] Area 5  Windows env verified (node/rust/tauri), empty Tauri window launches, harness runs headless
[ ] Area 6  /docs populated, DECISIONS.md seeded (D1–D40 + W/F/G), doc→code citation pattern shown
[ ] Area 7  TS types → JSON Schema generated; 6 guardian fixtures validate; broken fixture rejected; DC1–DC6 wired
[ ] Area 8  Sim harness headless on fixed seeds; all invariant IDs registered/fail-loud; save/load skeleton round-trips empty state atomically
[ ] Area 9  Alpha/Beta/Production gate definitions recorded
[ ] Owner    Machine, GitHub destination, package manager confirmed
```

## 13. Build-Authorization Gate (owner sign-off)

```
Harbor Guardians — Build Authorization

I confirm the foundation set and Phase-B content are sufficient to define the game,
this Milestone 0 Implementation Readiness Packet is approved, and I authorize
Claude Code to begin MILESTONE 0 work (environment, repo, docs, schemas, CI,
sim harness, save/load skeleton) — and no gameplay implementation beyond M0 scope.

Alpha work is authorized only after the §12 checklist is fully green and I approve
the M0 exit gate.

Owner: ______________________   Date: ____________

Scope authorized: [ ] Milestone 0 only   [ ] M0 + proceed to Alpha on green checklist
                  (Independent review recommends: **Milestone 0 only** — not auto-proceed to Alpha.
                   Alpha should be a separate, deliberate authorization after the M0 exit gate is green.)
Repo destination: ____________________________
Target environment: __________________________
```

Until this gate is signed, everything remains **document-mode planning**: not canon, no repo/vault mutation, no code, no build.

---

## 14. Document set status at time of this packet

| Layer | Docs | Status |
|---|---|---|
| Foundation (pre-planning) | 18-doc set + registers | CLOSED (approved 2026-07-11) |
| B2 World Atlas | v0.2.1 | document-stage closed |
| B3 Faction Codex | v0.1.2 | document-stage closed |
| B4 Guardian Sanctum & Kit | v0.1.2 | document-stage closed |
| B4A Flagship Kit Sheets | v0.1.2 | document-stage closed |
| B4B Launch Chassis Anchors | v0.2.1 | document-stage closed |
| **M0 Implementation Readiness Packet** | **v0.1.3** | **this doc — in review; approval + §13 signature authorizes Milestone 0** |

**Guardian-animal canon note:** only the flagship trio is approved canon — **Nova (owl), Tarin (elephant), Raxa (tiger)**. Every other guardian animal in B4B (Bru/Bear, Sef/Falcon, Dagg/Badger) is an **unapproved working placeholder** (G-D6), to be finalized in the lore/naming pass. This does not block M0 (schema/sim work is animal-agnostic), but final animals should be locked before Beta content.

With B4B + this packet reviewed and approved, the documentation prerequisites for Milestone 0 are complete, and the Build-Authorization Gate (§13) is the remaining step before build.

*Reminder repeated by design: document completion does not equal build authorization; build begins only after this Milestone 0 packet is approved and the §13 gate is signed.*

*DRAFT v0.1.3 — FUTURE BUILD. Approved-for-revision; not canon; not implementation authorization; not merged. Approval of this packet is the build-authorization gate for Milestone 0.*
