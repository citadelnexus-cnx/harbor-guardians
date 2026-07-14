# /docs

**One responsibility:** hold the project's source-of-truth documents — read-only doctrine in-repo so the implementer always has the current spec in context (M0 packet area 6).

Code never contradicts these documents; on any gap or ambiguity, stop and ask (never invent doctrine in code).

## Layout (installed at M0 Step 4)

- [`foundation/`](foundation/) — the closed 18-doc foundation set + its index: registers, amendments, art bible, docs 01–09, save/load spec, sim-harness acceptance spec.
- [`phase-b/`](phase-b/) — Phase-B content: World Atlas (B2), Faction Codex (B3), Guardian Sanctum & Kit (B4), Flagship Kit Sheets (B4A), Launch Chassis Anchors (B4B).
- [`reviews/`](reviews/) — external design review artifacts: the review disposition (R-D1–R-D6) and the Deep Roots pillar-refinement passalong.
- Root of `/docs` — [`00_PRE_M0_MASTER_MANIFEST_v1.3.md`](00_PRE_M0_MASTER_MANIFEST_v1.3.md) (the doc map), [`M0_IMPLEMENTATION_READINESS_PACKET_v0.1.3.md`](M0_IMPLEMENTATION_READINESS_PACKET_v0.1.3.md) (the M0 spec), [`14_DESIGN_PILLARS_v0.1.md`](14_DESIGN_PILLARS_v0.1.md) (decision-filter doctrine, per R-D2/R-D6).

Operating rules and the decision ledger live at repo root: [`CLAUDE.md`](../CLAUDE.md), [`AGENTS.md`](../AGENTS.md), [`DECISIONS.md`](../DECISIONS.md).
