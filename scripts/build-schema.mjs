/**
 * Shared schema builder — the single place the JSON Schema is produced.
 *
 * D39: TypeScript types (src/contracts/) are the source of truth; the schema
 * is GENERATED here via ts-json-schema-generator. Never hand-author or
 * hand-edit /schema output — validate-data.mjs fails on drift.
 * Doc 07 §1.3: every schema carries $id + is versioned via the seed
 * envelope's schema_version field (DC5).
 */

import { createGenerator } from "ts-json-schema-generator";

export const SCHEMA_ID = "hg.guardian_kit_seed";
export const SCHEMA_FILE = "schema/guardian_kit_seed.schema.json";

export const SAVE_BLOB_SCHEMA_ID = "hg.save_blob";
export const SAVE_BLOB_SCHEMA_FILE = "schema/save_blob.schema.json";

export const RESOURCE_STORAGE_SCHEMA_ID = "hg.resource_storage_seed";
export const RESOURCE_STORAGE_SCHEMA_FILE = "schema/resource_storage_seed.schema.json";

export const CLAIM_LEDGER_RULES_SCHEMA_ID = "hg.claim_ledger_rules_seed";
export const CLAIM_LEDGER_RULES_SCHEMA_FILE = "schema/claim_ledger_rules_seed.schema.json";

export const EVENT_FIXTURE_SCHEMA_ID = "hg.event_fixture_seed";
export const EVENT_FIXTURE_SCHEMA_FILE = "schema/event_fixture_seed.schema.json";

function generateFrom(sourcePath, typeName, schemaId) {
  const generator = createGenerator({
    tsconfig: "tsconfig.json",
    path: sourcePath,
    type: typeName,
    topRef: true,
    additionalProperties: false,
    sortProps: true,
  });
  const schema = generator.createSchema(typeName);
  schema.$id = schemaId;
  schema.$comment = `GENERATED from ${sourcePath} (D39) — do not edit by hand; run \`pnpm run schema:generate\`.`;
  return schema;
}

export function buildGuardianKitSeedSchema() {
  return generateFrom("src/contracts/guardian-kit.ts", "GuardianKitSeed", SCHEMA_ID);
}

/** save_blob schema (Doc 07 §3; Save/Load §16) — the S7 save pipeline validates against this. */
export function buildSaveBlobSchema() {
  return generateFrom("src/contracts/save-blob.ts", "SaveBlob", SAVE_BLOB_SCHEMA_ID);
}

/**
 * resource_storage_seed schema (Doc 07 §3 storage_state; Economy §7 3S; D26/DC6)
 * — Alpha A1 harbor/resource spine. `storage` keys are CoreResource-only with
 * additionalProperties=false, so Merit/receipt-metric keys fail validation (DC6).
 */
export function buildResourceStorageSeedSchema() {
  return generateFrom("src/contracts/resource-storage.ts", "ResourceStorageSeed", RESOURCE_STORAGE_SCHEMA_ID);
}

/**
 * claim_ledger_rules_seed schema (Doc 04 §5/§15; Economy §10) — Alpha A2
 * Claim Ledger slot-accounting caps. Gameplay numbers seeded, never coded
 * (DC1); full DC4 metadata envelope.
 */
export function buildClaimLedgerRulesSeedSchema() {
  return generateFrom("src/contracts/claim-ledger-rules.ts", "ClaimLedgerRulesSeed", CLAIM_LEDGER_RULES_SCHEMA_ID);
}

/**
 * event_fixture_seed schema (Doc 15 §3 at A3 Option A scope; A3 brief §1) —
 * validates the TEST-ONLY event fixtures under tests/fixtures/events/.
 * Deliberately NOT a /data seed set: no runtime event content exists and the
 * validate-data.mjs SEED_SETS discovery path is untouched (A3 brief §2).
 */
export function buildEventFixtureSeedSchema() {
  return generateFrom("src/contracts/event.ts", "EventFixtureSeed", EVENT_FIXTURE_SCHEMA_ID);
}

/** Every generated schema, one entry per /schema output file (drift-guarded in validate-data.mjs). */
export const SCHEMA_BUILDS = [
  { file: SCHEMA_FILE, build: buildGuardianKitSeedSchema },
  { file: SAVE_BLOB_SCHEMA_FILE, build: buildSaveBlobSchema },
  { file: RESOURCE_STORAGE_SCHEMA_FILE, build: buildResourceStorageSeedSchema },
  { file: CLAIM_LEDGER_RULES_SCHEMA_FILE, build: buildClaimLedgerRulesSeedSchema },
  { file: EVENT_FIXTURE_SCHEMA_FILE, build: buildEventFixtureSeedSchema },
];

export function serializeSchema(schema) {
  return JSON.stringify(schema, null, 2) + "\n";
}
