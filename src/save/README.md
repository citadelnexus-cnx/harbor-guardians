# /src/save

**One responsibility:** save/load and time reconciliation per
[`SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5`](../../docs/foundation/SAVE_LOAD_TIME_RECONCILIATION_SPEC_v0.5.md).
Saves are atomic (S7) and never silently lose player value (CLAUDE.md §5).

## M0 state (Step 7) — persistence spine only

No gameplay, no reconciliation logic yet. What exists:

- [`atomic-save.ts`](atomic-save.ts) — the S7 pipeline (Save/Load §15):
  temp write → readback + schema validate → fsync → preserve prior good save
  as `<slot>.bak` → atomic rename into the active slot. A failure at any
  pre-commit point leaves the active slot byte-untouched; loads read the
  active slot only, never the temp file. Fault-injection hooks exist solely
  for the S7 crash simulation.
- [`canonical-json.ts`](canonical-json.ts) — canonical serialization (sorted
  keys, 2-space indent, trailing newline); save → load → re-serialize is
  byte-identical, and silent field-dropping throws instead of losing state.
- [`empty-save.ts`](empty-save.ts) — the empty/minimal M0 blob: every
  Save/Load §16 block at identity state (zeros / calm / schema-enforced
  empty). The blob type lives in
  [`src/contracts/save-blob.ts`](../contracts/save-blob.ts);
  `/schema/save_blob.schema.json` is generated from it (D39). Growing any
  block is a `save_schema_version` migration event (Save/Load §14).
- [`save-blob-validator.ts`](save-blob-validator.ts) — ajv validation against
  the generated schema (§15 step 2).
- [`proofs.ts`](proofs.ts) — the executable S5 (round-trip byte identity) and
  S7 (crash-during-write survival) proofs, shared by
  [`tests/save-load.test.ts`](../../tests/save-load.test.ts) and the
  sim-harness registry (claim-to-test).

Time reconciliation (§2–§9), migrations (§14), and content-bearing blocks are
FUTURE BUILD — they land with their features, each behind its invariants.

## Commands

```sh
pnpm run test:save     # atomic write + round-trip + crash-survival tests
pnpm run sim:harness   # batch incl. S5/S7 checks (empty-shell scope)
```
