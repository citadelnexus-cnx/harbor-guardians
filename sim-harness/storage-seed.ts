/**
 * Schema-validated loader for the A1 resource-storage seed — the single
 * gate through which the harness and tests obtain storage numbers. The sim
 * core (src/sim) is pure and does no I/O; file access + ajv validation live
 * here (Sim §2: the harness consumes ONLY schema-validated seeds).
 *
 * Governing docs: SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §2; 07_CONTENT_SCHEMA_
 * AND_DATA_CONTRACTS_SPEC v0.1.2 §5 (validation); D39 (generated schema).
 * Invariant refs: DC1 (numbers resolve to validated seed fields), DC5.
 */

import { readFileSync } from "node:fs";
import Ajv from "ajv";
import type { ResourceStorageSeed } from "../src/contracts/resource-storage.js";

export const RESOURCE_STORAGE_SEED_PATH = "data/economy/storage.st1.json";
export const RESOURCE_STORAGE_SCHEMA_PATH = "schema/resource_storage_seed.schema.json";

/** Thrown when the storage seed fails schema validation — nothing downstream may consume it (Sim §2). */
export class StorageSeedValidationError extends Error {
  constructor(detail: string) {
    super(`resource-storage seed failed schema validation — refusing to load (DC5): ${detail}`);
    this.name = "StorageSeedValidationError";
  }
}

/**
 * Load and schema-validate the ST1 storage seed. Throws
 * StorageSeedValidationError on any violation; on success the returned
 * object is the only source of storage numbers for harness checks and tests
 * (No Magic Numbers, DC1).
 */
export function loadStorageSeed(
  seedPath: string = RESOURCE_STORAGE_SEED_PATH,
  schemaPath: string = RESOURCE_STORAGE_SCHEMA_PATH,
): ResourceStorageSeed {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validate = ajv.compile(schema);
  const seed: unknown = JSON.parse(readFileSync(seedPath, "utf8"));
  if (!validate(seed)) {
    throw new StorageSeedValidationError(ajv.errorsText(validate.errors, { separator: "; " }));
  }
  return seed as ResourceStorageSeed;
}
