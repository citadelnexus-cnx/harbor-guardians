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

/** Every generated schema, one entry per /schema output file (drift-guarded in validate-data.mjs). */
export const SCHEMA_BUILDS = [
  { file: SCHEMA_FILE, build: buildGuardianKitSeedSchema },
  { file: SAVE_BLOB_SCHEMA_FILE, build: buildSaveBlobSchema },
];

export function serializeSchema(schema) {
  return JSON.stringify(schema, null, 2) + "\n";
}
