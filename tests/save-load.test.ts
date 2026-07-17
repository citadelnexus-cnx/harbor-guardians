/**
 * Step 7 save/load tests — atomic write behavior (S7), empty-state round-trip
 * byte identity (S5 @ M0), crash-during-write survival of the prior save,
 * and (Alpha A1) the stocked seeded-storage round-trip (S5 @ A1).
 * Runs on node:test via tsx (no new dependencies):
 *   pnpm run test:save
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15/§16;
 * SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.6 (S5/S7), §7 (M0 exit gate).
 * Invariant refs: S5, S7 (the same proofs are wired into the harness registry).
 */

import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { loadSave, rollbackPath, saveAtomically, tempPath } from "../src/save/atomic-save.js";
import { canonicalSerialize, NonSerializableSaveError } from "../src/save/canonical-json.js";
import { createEmptySaveBlob } from "../src/save/empty-save.js";
import {
  proveCrashDuringWriteSurvival,
  proveEmptyStateRoundTrip,
  proveStockedStateRoundTrip,
  SimulatedCrashError,
} from "../src/save/proofs.js";
import { createSaveBlobValidator, SaveValidationError } from "../src/save/save-blob-validator.js";
import type { SaveBlob } from "../src/contracts/save-blob.js";
import { loadStorageSeed } from "../sim-harness/storage-seed.js";

const validate = createSaveBlobValidator();

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

test("S7: full crash-during-write proof (as wired into the harness) passes", () => {
  withTempDir((dir) => {
    const proof = proveCrashDuringWriteSurvival(dir, validate);
    assert.ok(proof.pass, proof.detail);
  });
});
