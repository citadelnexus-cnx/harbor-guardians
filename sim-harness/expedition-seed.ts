/**
 * Schema-validated loader for the A4 expedition content seed — the single gate
 * through which the harness and tests obtain expedition numbers (supply set,
 * salvage totals, overflow multiplier, route, event trigger). The sim core
 * (src/sim/expedition.ts) is pure and does no I/O; file access + ajv
 * validation live here (Sim §2: the harness consumes ONLY schema-validated
 * seeds).
 *
 * Governing docs: SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §2; 07_CONTENT_SCHEMA_
 * AND_DATA_CONTRACTS_SPEC v0.1.2 §5 (validation); D39 (generated schema);
 * ALPHA_A4_EXECUTION_BRIEF v0.1 §3 (version-pinned content).
 * Invariant refs: DC1 (numbers resolve to validated seed fields), DC5.
 */

import { readFileSync } from "node:fs";
import Ajv from "ajv";
import type { ExpeditionSeed } from "../src/contracts/expedition-seed.js";

export const EXPEDITION_SEED_PATH = "data/expeditions/exp.first_playable.json";
export const EXPEDITION_SEED_SCHEMA_PATH = "schema/expedition_seed.schema.json";

/** Thrown when the expedition seed fails schema validation — nothing downstream may consume it (Sim §2). */
export class ExpeditionSeedValidationError extends Error {
  constructor(detail: string) {
    super(`expedition seed failed schema validation — refusing to load (DC5): ${detail}`);
    this.name = "ExpeditionSeedValidationError";
  }
}

/**
 * Load and schema-validate the canonical A4 expedition seed. Throws
 * ExpeditionSeedValidationError on any violation; on success the returned
 * object is the only source of A4 gameplay numbers for the harness and tests
 * (No Magic Numbers, DC1).
 */
export function loadExpeditionSeed(
  seedPath: string = EXPEDITION_SEED_PATH,
  schemaPath: string = EXPEDITION_SEED_SCHEMA_PATH,
): ExpeditionSeed {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validate = ajv.compile(schema);
  const seed: unknown = JSON.parse(readFileSync(seedPath, "utf8"));
  if (!validate(seed)) {
    throw new ExpeditionSeedValidationError(ajv.errorsText(validate.errors, { separator: "; " }));
  }
  return seed as ExpeditionSeed;
}
