/**
 * Save-blob validation entry point for the Node/test save pipeline — step 2 of
 * the atomic save (Save/Load §15: "Write to a temp file. Validate schema. Flush.
 * Rename.").
 *
 * As of HG-POST-A4-STABILIZATION-01 (H2) this is a thin adapter over the SHARED,
 * browser-safe validator in save-semantics.ts: it runs the GENERATED precompiled
 * schema validator (save-blob-schema-validator.mjs, produced from the committed
 * schema/save_blob.schema.json) plus the semantic invariants. The Tauri
 * desktop/controller path calls the same `assertSaveBlobValid`, so both paths
 * enforce ONE save contract — there is no separate desktop-only or hand-authored
 * validator, and no runtime ajv/fs dependency remains here.
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15;
 * 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §3/§5;
 * HG_POST_A4_STABILIZATION_01_EXECUTION_BRIEF v0.1 §3 (H2).
 * Invariant refs: S7 (validation before commit), DC5.
 */

import type { SaveBlob } from "../contracts/save-blob.js";
import { assertSaveBlobValid } from "./save-semantics.js";

// Re-export the shared validation surface so existing importers (proofs,
// atomic-save, harness, tests) keep importing from this module unchanged.
export {
  SaveValidationError,
  SaveIdentityError,
  assertPersistedEventIdentity,
  assertExpeditionSaveShape,
  assertSaveBlobValid,
  type SaveBlobValidator,
} from "./save-semantics.js";

/** Location of the committed generated schema — retained for reference/tools. */
export const SAVE_BLOB_SCHEMA_PATH = "schema/save_blob.schema.json";

/**
 * Build a validator over the shared save contract. The precompiled generated
 * validator IS the committed schema (H2), so — unlike the pre-stabilization
 * build, which read + compiled the schema at runtime with ajv — this needs no
 * filesystem access and runs identically in Node and the browser. The optional
 * `schemaPath` argument is accepted for backward compatibility but ignored: the
 * one generated contract is authoritative and drift-guarded.
 */
export function createSaveBlobValidator(_schemaPath: string = SAVE_BLOB_SCHEMA_PATH): (blob: unknown) => asserts blob is SaveBlob {
  return (blob: unknown): asserts blob is SaveBlob => {
    assertSaveBlobValid(blob);
  };
}
