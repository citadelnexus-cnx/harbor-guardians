# data/expeditions — Alpha A4 expedition content seeds

Version-pinned content for the **Bounded First Playable Expedition Loop**
(owner Alpha A4 authorization 2026-07-23, Option A; scope in
[`docs/alpha/ALPHA_A4_EXECUTION_BRIEF_v0.1.md`](../../docs/alpha/ALPHA_A4_EXECUTION_BRIEF_v0.1.md)).

Every A4 gameplay number lives here (No Magic Numbers, DC1); the sim core
(`src/sim/expedition.ts`) consumes these values verbatim and contains no
gameplay literals. Seeds validate against the generated
`schema/expedition_seed.schema.json` (D39; `pnpm run schema:validate`), carry
full DC4 unit metadata for every numeric leaf under `content`, and are
cross-checked by `checkExpeditionContent` in `scripts/validate-data.mjs`.

| File | Purpose |
| --- | --- |
| `exp.first_playable.json` | The one canonical first-playable expedition: supply set, one short route, one damaged route-anchor outpost, per-outcome salvage totals, per-Guardian salvage composition (equal total, distinct resource — brief §4), the ×3 unsafe-Overflow multiplier, per-outcome readiness, and the EVT4 outpost trigger. |
| `exp.broken.invalid.json` | Negative fixture — admits a non-CoreResource key (`Merit`) into `supply_set`; the schema **must** reject it (DC5). |

**Boundary:** this is a bounded A4 content set, not general expedition content
authoring. No Claim Ledger reward generation, no new reward `source_type`, no
Docked-Cargo routing, no combat, no real event-content library — all FUTURE
BUILD. Salvage is recovered directly into Safe Storage + capped Overflow
(brief §2.11–13).
