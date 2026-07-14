/**
 * Atomic save/load — the S7 persistence spine.
 *
 * Pipeline (Save/Load §15, in the order that satisfies its guarantees):
 *   1. Write the canonical bytes to a temp file in the same directory
 *      (same volume, so the final rename is atomic). The active slot is
 *      never touched before commit.
 *   2. Validate: read the temp file back, require byte-identity with the
 *      intended serialization (write verification), and schema-validate the
 *      parsed content (Save/Load §15 step 2).
 *   3. Flush: fsync the temp file descriptor.
 *   4. Preserve the previous good save as rollback (`<slot>.bak`, itself
 *      fsynced). §15 lists this after the swap, but the swap replaces the
 *      active slot — preserving first is the only ordering that satisfies
 *      §15's own guarantee ("preserve the previous good save as rollback").
 *   5. Commit: atomic rename of the temp file into the active slot.
 *
 * A failure at ANY point before step 5 leaves the active slot byte-untouched:
 * a partial write can never become the current save (S7). Loads read the
 * active slot ONLY — never the temp file. A stale temp file from a crashed
 * save is inert and is truncated by the next save attempt.
 *
 * `CrashSimulationHooks` are fault-injection seams for the S7 proof
 * ("a SIMULATED crash during save never corrupts the last known-good save");
 * every hook is a no-op unless a test provides one.
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15/§16;
 * SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.6 S7; CLAUDE.md §5 (atomic saves,
 * no hidden loss). No gameplay numbers here — file-plumbing only.
 * Invariant refs: S5, S7.
 */

import {
  closeSync,
  existsSync,
  fsyncSync,
  openSync,
  readFileSync,
  renameSync,
  writeSync,
} from "node:fs";
import type { SaveBlob } from "../contracts/save-blob.js";
import { canonicalSerialize } from "./canonical-json.js";
import type { SaveBlobValidator } from "./save-blob-validator.js";

/** Temp-write location for a slot — same directory, so the commit rename is atomic. */
export function tempPath(slotPath: string): string {
  return `${slotPath}.tmp`;
}

/** Rollback location for a slot — the previous good save (Save/Load §15 step 5). */
export function rollbackPath(slotPath: string): string {
  return `${slotPath}.bak`;
}

/**
 * Fault-injection seams for the S7 crash simulation. Each hook fires at the
 * named point in the pipeline; a test simulates a crash by throwing from one.
 * All are no-ops in normal operation.
 */
export interface CrashSimulationHooks {
  /** Fires mid-way through the temp write — simulates a torn/partial write. */
  duringTempWrite?: () => void;
  /** Fires after the temp file is fully written + validated, before fsync. */
  beforeFlush?: () => void;
  /** Fires before the previous good save is preserved as rollback. */
  beforeRollback?: () => void;
  /** Fires after rollback preservation, before the commit rename. */
  beforeCommit?: () => void;
}

export interface AtomicSaveOptions {
  /** Schema validation gate — step 2 of §15; a failing blob aborts before commit. */
  validate: SaveBlobValidator;
  hooks?: CrashSimulationHooks;
}

export interface SaveResult {
  /** Bytes committed to the active slot. */
  bytes: number;
  /** True when a previous save existed and was preserved as `<slot>.bak`. */
  rollback_preserved: boolean;
}

/** Write one buffer through an fd with fsync, for the rollback copy. */
function writeFileWithFsync(path: string, data: Buffer): void {
  const fd = openSync(path, "w");
  try {
    writeSync(fd, data, 0, data.length);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/**
 * Save `blob` into `slotPath` with atomic write semantics (S7). Throws on any
 * failure; on a throw the active slot is guaranteed byte-untouched.
 */
export function saveAtomically(slotPath: string, blob: SaveBlob, options: AtomicSaveOptions): SaveResult {
  const validate: SaveBlobValidator = options.validate;
  const serialized = canonicalSerialize(blob);
  const bytes = Buffer.from(serialized, "utf8");
  const temp = tempPath(slotPath);

  // Steps 1–3: temp write → validate → flush. The active slot is not touched.
  const fd = openSync(temp, "w");
  try {
    const half = Math.floor(bytes.length / 2);
    writeSync(fd, bytes, 0, half);
    options.hooks?.duringTempWrite?.();
    writeSync(fd, bytes, half, bytes.length - half);

    const readback = readFileSync(temp, "utf8");
    if (readback !== serialized) {
      throw new Error(
        `atomic save: temp-file readback differs from intended serialization (${readback.length} vs ${serialized.length} chars) — aborting before commit (S7)`,
      );
    }
    const parsed: unknown = JSON.parse(readback);
    validate(parsed);

    options.hooks?.beforeFlush?.();
    fsyncSync(fd);
  } finally {
    // On failure the (possibly partial) temp file is left behind, exactly as a
    // real crash would leave it: loads never read it, and the next save
    // attempt truncates it.
    closeSync(fd);
  }

  // Step 4: preserve the previous good save as rollback BEFORE the swap.
  options.hooks?.beforeRollback?.();
  let rollbackPreserved = false;
  if (existsSync(slotPath)) {
    writeFileWithFsync(rollbackPath(slotPath), readFileSync(slotPath));
    rollbackPreserved = true;
  }

  // Step 5: atomic commit — the only operation that ever touches the active slot.
  options.hooks?.beforeCommit?.();
  renameSync(temp, slotPath);

  return { bytes: bytes.length, rollback_preserved: rollbackPreserved };
}

/**
 * Load the active slot ONLY (never the temp file), schema-validating before
 * returning — a partial or foreign file never comes back as a save.
 */
export function loadSave(slotPath: string, validate: SaveBlobValidator): SaveBlob {
  const raw = readFileSync(slotPath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  validate(parsed);
  return parsed;
}
