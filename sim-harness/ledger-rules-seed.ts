/**
 * Schema-validated loader for the A2 claim-ledger rules seed — the single
 * gate through which the harness and tests obtain the Doc 04 §5 slot caps.
 * The sim core (src/sim) is pure and does no I/O; file access + ajv
 * validation live here (Sim §2: the harness consumes ONLY schema-validated
 * seeds).
 *
 * Governing docs: SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §2; 04_REWARD_CLAIM_
 * LEDGER_FOUNDATION v0.4 §5/§15; 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC
 * v0.1.2 §5 (validation); D39 (generated schema).
 * Invariant refs: DC1 (numbers resolve to validated seed fields), DC5; L7
 * (the caps these rules carry).
 */

import { readFileSync } from "node:fs";
import Ajv from "ajv";
import type { ClaimLedgerRulesSeed } from "../src/contracts/claim-ledger-rules.js";

export const CLAIM_LEDGER_RULES_SEED_PATH = "data/rewards/claim_ledger_rules.json";
export const CLAIM_LEDGER_RULES_SCHEMA_PATH = "schema/claim_ledger_rules_seed.schema.json";

/** Thrown when the rules seed fails schema validation — nothing downstream may consume it (Sim §2). */
export class LedgerRulesSeedValidationError extends Error {
  constructor(detail: string) {
    super(`claim-ledger rules seed failed schema validation — refusing to load (DC5): ${detail}`);
    this.name = "LedgerRulesSeedValidationError";
  }
}

/**
 * Load and schema-validate the claim-ledger rules seed. Throws
 * LedgerRulesSeedValidationError on any violation; on success the returned
 * object is the only source of slot-cap numbers for harness checks and tests
 * (No Magic Numbers, DC1).
 */
export function loadClaimLedgerRulesSeed(
  seedPath: string = CLAIM_LEDGER_RULES_SEED_PATH,
  schemaPath: string = CLAIM_LEDGER_RULES_SCHEMA_PATH,
): ClaimLedgerRulesSeed {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validate = ajv.compile(schema);
  const seed: unknown = JSON.parse(readFileSync(seedPath, "utf8"));
  if (!validate(seed)) {
    throw new LedgerRulesSeedValidationError(ajv.errorsText(validate.errors, { separator: "; " }));
  }
  return seed as ClaimLedgerRulesSeed;
}
