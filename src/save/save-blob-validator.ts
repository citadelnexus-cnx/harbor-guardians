/**
 * Save-blob schema validation — step 2 of the atomic save pipeline
 * (Save/Load §15: "Write to a temp file. Validate schema. Flush. Rename.").
 *
 * Validates against the GENERATED /schema/save_blob.schema.json (D39; drift-
 * guarded by `pnpm run schema:validate`). Uses ajv — currently a
 * devDependency, which is correct for M0 where the save path runs only under
 * tests/harness; whether shipping builds bundle ajv or a precompiled
 * validator is an Alpha packaging decision.
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15;
 * 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §3/§5.
 * Invariant refs: S7 (validation before commit), DC5.
 */

import { readFileSync } from "node:fs";
import Ajv from "ajv";
import type { SaveBlob } from "../contracts/save-blob.js";

/** Thrown when a blob fails schema validation — the save aborts before commit (S7). */
export class SaveValidationError extends Error {
  constructor(detail: string) {
    super(`save blob failed schema validation — save aborted before commit (S7): ${detail}`);
    this.name = "SaveValidationError";
  }
}

export type SaveBlobValidator = (blob: unknown) => asserts blob is SaveBlob;

/** Default location of the generated schema, relative to the repo root (the cwd for all M0 tooling). */
export const SAVE_BLOB_SCHEMA_PATH = "schema/save_blob.schema.json";

/**
 * Compile a validator from the committed generated schema. Throws
 * SaveValidationError from the returned function on any schema violation.
 */
export function createSaveBlobValidator(schemaPath: string = SAVE_BLOB_SCHEMA_PATH): SaveBlobValidator {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validate = ajv.compile(schema);
  return (blob: unknown): asserts blob is SaveBlob => {
    if (!validate(blob)) {
      throw new SaveValidationError(ajv.errorsText(validate.errors, { separator: "; " }));
    }
  };
}
