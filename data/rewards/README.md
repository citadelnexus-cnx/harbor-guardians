# /data/rewards

**One responsibility:** Claim Ledger / reward-delivery seed data (Doc 04 §15 exports), validated against `/schema` (DC5) with full DC4 metadata.

## Contents (Alpha A2 — owner authorization 2026-07-17)

- [`claim_ledger_rules.json`](claim_ledger_rules.json) — the Doc 04 §5 slot-accounting caps (5 unclaimed packages per resource type · 20 global active non-story packages; Economy v1.7 §10). Consumed by `src/sim/claim-ledger.ts` via the schema-validated loader `sim-harness/ledger-rules-seed.ts` (No Magic Numbers, DC1); invariant L7 binds to these values.
- [`claim_ledger_rules.broken.invalid.json`](claim_ledger_rules.broken.invalid.json) — deliberate negative fixture: MUST fail validation (DC5 proof that the gate rejects broken reward seeds).

The remaining Doc 04 §15 exports (`eligible_sources`, `raid_phase_claim_matrix`, `system_grant_rules`, …) are FUTURE BUILD — they arrive with the systems that consume them; seeding values no code reads would be a claim without a test (CLAUDE.md §3).
