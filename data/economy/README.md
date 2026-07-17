# /data/economy

**One responsibility:** economy seeds — resources, sources, sinks, events — per the Economy Foundation (Doc 01) and the data contracts spec (Doc 07: CoreResource / StandingResource / ReceiptMetric enums). Economy shifts must name an existing `source_id`/`sink_id`/`event_id` (B4A §4A).

## Seeds (Alpha A1)

- [`storage.st1.json`](storage.st1.json) — the resource-storage seed: owner-approved start stocks (Economy v1.7 §3) and the ST1 3S capacities (Economy v1.7 §7; D1 — Safe S / Exposed 2S / Total 3S) for the four CoreResources, with full DC4 value metadata. Validated against the generated [`resource_storage_seed.schema.json`](../../schema/resource_storage_seed.schema.json); the validator also cross-checks the D1 2×/3× relationship and that start stocks fit Safe storage.
- `storage.broken.invalid.json` — deliberate negative fixture: Merit (StandingResource) and BondCharge (ReceiptMetric) storage keys, a missing CoreResource, a non-numeric capacity, and a non-string schema_version. It MUST fail validation (DC5/DC6); if it ever passes, the build breaks.

Faucets, sinks, conversions, upkeep, and every other Economy §18 export are **FUTURE BUILD** — they arrive with their systems, never before (claim-to-test).
