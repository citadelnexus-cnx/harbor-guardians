# /src/save

**One responsibility:** save/load and time reconciliation per
[`SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5`](../../docs/foundation/SAVE_LOAD_TIME_RECONCILIATION_SPEC_v0.5.md).
Saves are atomic (S7) and never silently lose player value (CLAUDE.md §5).

## State (M0 Step 7 spine · A1 stocked round-trip · A2 ledger blocks + migration · A3 events block + migration)

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
- [`empty-save.ts`](empty-save.ts) — the empty/minimal blob: every
  Save/Load §16 block at identity state (zeros / calm / empty). The blob type
  lives in [`src/contracts/save-blob.ts`](../contracts/save-blob.ts);
  `/schema/save_blob.schema.json` is generated from it (D39). Growing any
  block is a `save_schema_version` migration event (Save/Load §14).
- [`migrations.ts`](migrations.ts) — the ordered, pure migration chain
  (Save/Load §1/§14). v1→v2 (Alpha A2): the `claim_ledger` block grows
  `{ packages, story_claims }`; committed v1 fixture at
  [`tests/fixtures/save.v1.json`](../../tests/fixtures/save.v1.json).
  v2→v3 (Alpha A3): the `events` block is added (mid-flight event-lifecycle
  instances, EVT3); committed v2 fixture at
  [`tests/fixtures/save.v2.json`](../../tests/fixtures/save.v2.json). Each
  step refuses a tampered older save that carries content its schema could
  not hold, and round-trips its committed fixture. Loading migrates in
  memory — the on-disk file is never mutated by a load. The §14 Migration
  Notice is FUTURE BUILD with the System Inbox.
- [`save-blob-validator.ts`](save-blob-validator.ts) — ajv validation against
  the generated schema (§15 step 2).
- [`proofs.ts`](proofs.ts) — the executable S5 (round-trip byte identity at
  empty / A1 stocked / A2 reward-bearing scopes) and S7 (crash-during-write
  survival over reward-bearing saves — no reward duplication) proofs, shared
  by [`tests/save-load.test.ts`](../../tests/save-load.test.ts) and the
  sim-harness registry (claim-to-test). The A3 event-lifecycle persistence
  proof (EVT3) reuses this pipeline from
  [`sim-harness/event-checks.ts`](../../sim-harness/event-checks.ts).

Time reconciliation (§2–§9) and the remaining content-bearing blocks are
FUTURE BUILD — they land with their features, each behind its invariants.

## Commands

```sh
pnpm run test:save     # atomic write + round-trip + crash-survival tests
pnpm run sim:harness   # batch incl. S5/S7 checks (empty-shell scope)
```
