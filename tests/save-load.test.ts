/**
 * Step 7 save/load tests — atomic write behavior (S7), empty-state round-trip
 * byte identity (S5 @ M0), crash-during-write survival of the prior save,
 * the Alpha A1 stocked seeded-storage round-trip (S5 @ A1), and the Alpha A2
 * reward-bearing ledger round-trip + v1→v2 save migration (S5 @ A2;
 * Save/Load §14 — migration function + committed v1 fixture + round-trip
 * test).
 * Runs on node:test via tsx (no new dependencies):
 *   pnpm run test:save
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §1/§14/§15/§16;
 * SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.6 (S5/S7), §7 (M0 exit gate).
 * Invariant refs: S5, S7 (the same proofs are wired into the harness registry).
 */

import { strict as assert } from "node:assert";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { loadSave, rollbackPath, saveAtomically, tempPath } from "../src/save/atomic-save.js";
import { canonicalSerialize, NonSerializableSaveError } from "../src/save/canonical-json.js";
import { createEmptySaveBlob } from "../src/save/empty-save.js";
import { migrateSaveBlobToCurrent, SaveMigrationError } from "../src/save/migrations.js";
import {
  proveCrashDuringWriteSurvival,
  proveEmptyStateRoundTrip,
  proveLedgerStateRoundTrip,
  proveStockedStateRoundTrip,
  SimulatedCrashError,
} from "../src/save/proofs.js";
import { createSaveBlobValidator, SaveValidationError } from "../src/save/save-blob-validator.js";
import type { SaveBlob } from "../src/contracts/save-blob.js";
import { SAVE_SCHEMA_VERSION } from "../src/contracts/save-blob.js";
import { loadClaimLedgerRulesSeed } from "../sim-harness/ledger-rules-seed.js";
import { loadStorageSeed } from "../sim-harness/storage-seed.js";

const validate = createSaveBlobValidator();
const V1_FIXTURE_PATH = "tests/fixtures/save.v1.json";

function withTempDir(run: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), "hg-saveload-test-"));
  try {
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const blobV1 = () => createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" });
const blobV2 = () => createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:01.000Z" });

// ── Atomic write behavior (S7 pipeline mechanics) ────────────────────────────

test("S7 pipeline: successful save commits canonical bytes and leaves no temp file", () => {
  withTempDir((dir) => {
    const slot = join(dir, "slot.save.json");
    const blob = blobV1();
    const result = saveAtomically(slot, blob, { validate });
    const onDisk = readFileSync(slot, "utf8");
    assert.equal(onDisk, canonicalSerialize(blob), "committed bytes must be the canonical serialization");
    assert.equal(result.bytes, Buffer.byteLength(onDisk), "reported byte count matches the committed file");
    assert.equal(result.rollback_preserved, false, "first save has no prior save to preserve");
    assert.ok(!existsSync(tempPath(slot)), "temp file must not survive a successful commit");
  });
});

test("S7 pipeline: serialization is canonical — key order cannot change the bytes", () => {
  withTempDir((dir) => {
    const blob = blobV1();
    // Same logical state, reversed property insertion order.
    const reordered = Object.fromEntries(Object.entries(blob).reverse()) as typeof blob;
    assert.equal(canonicalSerialize(reordered), canonicalSerialize(blob));
    const slotA = join(dir, "a.save.json");
    const slotB = join(dir, "b.save.json");
    saveAtomically(slotA, blob, { validate });
    saveAtomically(slotB, reordered, { validate });
    assert.equal(readFileSync(slotA, "utf8"), readFileSync(slotB, "utf8"));
  });
});

test("S7 pipeline: canonical serializer refuses silent state loss (undefined / non-finite)", () => {
  assert.throws(() => canonicalSerialize({ meta: undefined }), NonSerializableSaveError);
  assert.throws(() => canonicalSerialize({ world_clock: { day_index: Number.NaN } }), NonSerializableSaveError);
});

// ── Empty/minimal round-trip byte identity (S5 @ M0) ─────────────────────────

test("S5 @ M0: empty-state save → load → re-serialize is byte-identical", () => {
  withTempDir((dir) => {
    const slot = join(dir, "roundtrip.save.json");
    const blob = blobV1();
    saveAtomically(slot, blob, { validate });
    const onDisk = readFileSync(slot, "utf8");
    const loaded = loadSave(slot, validate);
    assert.equal(canonicalSerialize(loaded), onDisk, "round-trip must be byte-identical");
    assert.deepEqual(loaded, blob, "loaded state must equal the saved state");
  });
});

test("S5 @ M0: full round-trip proof (as wired into the harness) passes", () => {
  withTempDir((dir) => {
    const proof = proveEmptyStateRoundTrip(dir, validate);
    assert.ok(proof.pass, proof.detail);
  });
});

test("S5 @ A1: stocked seeded-storage round-trip proof (as wired into the harness) passes", () => {
  withTempDir((dir) => {
    const proof = proveStockedStateRoundTrip(dir, validate, loadStorageSeed());
    assert.ok(proof.pass, proof.detail);
  });
});

test("S5 @ A2: reward-bearing ledger round-trip proof (as wired into the harness) passes", () => {
  withTempDir((dir) => {
    const proof = proveLedgerStateRoundTrip(dir, validate, loadStorageSeed(), loadClaimLedgerRulesSeed());
    assert.ok(proof.pass, proof.detail);
  });
});

// ── Save-schema migration v1 → v2 (Save/Load §14; A2 bump) ──────────────────

test("migration: committed v1 fixture loads, migrates to the current version, and equals a fresh v2 equivalent", () => {
  withTempDir((dir) => {
    const slot = join(dir, "migrated.save.json");
    copyFileSync(V1_FIXTURE_PATH, slot);
    const fixtureBytes = readFileSync(slot, "utf8");

    const loaded = loadSave(slot, validate);
    assert.equal(loaded.meta.save_schema_version, SAVE_SCHEMA_VERSION, "migrated save carries the current version");
    assert.deepEqual(loaded.claim_ledger, { packages: [], story_claims: [] }, "v1 empty ledger migrates to the empty v2 shape");
    assert.deepEqual(loaded.pending_reward_resolution, [], "v1 empty pending block is preserved empty");

    // Player value preserved exactly: the fixture's stocked A1 3S bands match the seeded capacities.
    const seed = loadStorageSeed();
    for (const [resource, def] of Object.entries(seed.storage)) {
      const band = loaded.resources[resource as keyof typeof loaded.resources];
      assert.equal(band.safe, def.safe_capacity_st1, `${resource} safe preserved through migration`);
      assert.equal(band.exposed, def.exposed_capacity_st1, `${resource} exposed preserved through migration`);
    }

    // Migrated state equals a fresh v2 blob with the same meta + resources (round-trip equivalence, §14).
    const fresh: SaveBlob = {
      ...createEmptySaveBlob({ game_version: loaded.meta.game_version, last_saved_utc: loaded.meta.last_saved_utc }),
      resources: loaded.resources,
    };
    assert.equal(canonicalSerialize(loaded), canonicalSerialize(fresh), "migrated save equals a fresh v2 equivalent");

    // Loading never mutates the on-disk v1 file; re-saving commits the migrated state atomically.
    assert.equal(readFileSync(slot, "utf8"), fixtureBytes, "load leaves the v1 file untouched");
    saveAtomically(slot, loaded, { validate });
    assert.equal(canonicalSerialize(loadSave(slot, validate)), canonicalSerialize(loaded), "re-saved migrated state round-trips");
  });
});

test("migration: a future-version save is refused loudly", () => {
  const future = createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: "2026-01-01T00:00:00.000Z" });
  const bumped = { ...future, meta: { ...future.meta, save_schema_version: SAVE_SCHEMA_VERSION + 1 } };
  assert.throws(() => migrateSaveBlobToCurrent(bumped), SaveMigrationError);
});

test("migration: a v1 save claiming ledger content (impossible under the v1 schema) is refused, not silently dropped", () => {
  const v1 = JSON.parse(readFileSync(V1_FIXTURE_PATH, "utf8")) as Record<string, unknown>;
  const poisoned = { ...v1, claim_ledger: { packages: [{ smuggled: true }] } };
  assert.throws(() => migrateSaveBlobToCurrent(poisoned), SaveMigrationError);
});

test("migration: malformed saves are refused (no meta, non-integer version)", () => {
  assert.throws(() => migrateSaveBlobToCurrent({}), SaveMigrationError);
  assert.throws(() => migrateSaveBlobToCurrent({ meta: { save_schema_version: "one" } }), SaveMigrationError);
  assert.throws(() => migrateSaveBlobToCurrent(null), SaveMigrationError);
});

// ── Crash-during-write survival (S7) ─────────────────────────────────────────

test("S7: crash before commit/rename leaves the prior intact save byte-identical (direct)", () => {
  withTempDir((dir) => {
    const slot = join(dir, "crash.save.json");
    saveAtomically(slot, blobV1(), { validate });
    const priorBytes = readFileSync(slot, "utf8");

    assert.throws(
      () =>
        saveAtomically(slot, blobV2(), {
          validate,
          hooks: {
            beforeCommit: () => {
              throw new SimulatedCrashError("before commit rename");
            },
          },
        }),
      SimulatedCrashError,
    );

    assert.equal(readFileSync(slot, "utf8"), priorBytes, "prior save must be byte-identical after the crash");
    assert.equal(
      canonicalSerialize(loadSave(slot, validate)),
      priorBytes,
      "prior save must still load to the same state",
    );
  });
});

test("S7: torn temp write leaves the prior intact save untouched (direct)", () => {
  withTempDir((dir) => {
    const slot = join(dir, "torn.save.json");
    saveAtomically(slot, blobV1(), { validate });
    const priorBytes = readFileSync(slot, "utf8");

    assert.throws(
      () =>
        saveAtomically(slot, blobV2(), {
          validate,
          hooks: {
            duringTempWrite: () => {
              throw new SimulatedCrashError("during temp write");
            },
          },
        }),
      SimulatedCrashError,
    );

    assert.equal(readFileSync(slot, "utf8"), priorBytes, "a partial temp write must never touch the active slot");
    const temp = tempPath(slot);
    assert.ok(existsSync(temp), "the torn temp file is left behind, exactly as a real crash would leave it");
    assert.notEqual(readFileSync(temp, "utf8"), canonicalSerialize(blobV2()), "temp file is partial");
  });
});

test("S7: schema-invalid blob aborts before commit; active slot untouched", () => {
  withTempDir((dir) => {
    const slot = join(dir, "invalid.save.json");
    saveAtomically(slot, blobV1(), { validate });
    const priorBytes = readFileSync(slot, "utf8");
    const corrupt = { ...blobV2(), threat: { phase: "not_a_raid_phase" } } as unknown as SaveBlob;
    assert.throws(() => saveAtomically(slot, corrupt, { validate }), SaveValidationError);
    assert.equal(readFileSync(slot, "utf8"), priorBytes);
  });
});

test("S7: successful overwrite preserves the prior good save as rollback", () => {
  withTempDir((dir) => {
    const slot = join(dir, "rollback.save.json");
    saveAtomically(slot, blobV1(), { validate });
    const priorBytes = readFileSync(slot, "utf8");
    const result = saveAtomically(slot, blobV2(), { validate });
    assert.equal(result.rollback_preserved, true);
    assert.equal(readFileSync(rollbackPath(slot), "utf8"), priorBytes, "rollback must be the prior good save");
    assert.equal(readFileSync(slot, "utf8"), canonicalSerialize(blobV2()));
  });
});

test("S7: full crash-during-write proof over reward-bearing saves (as wired into the harness) passes", () => {
  withTempDir((dir) => {
    const proof = proveCrashDuringWriteSurvival(dir, validate, loadStorageSeed(), loadClaimLedgerRulesSeed());
    assert.ok(proof.pass, proof.detail);
  });
});
