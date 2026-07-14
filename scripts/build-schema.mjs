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

export function buildGuardianKitSeedSchema() {
  const generator = createGenerator({
    tsconfig: "tsconfig.json",
    path: "src/contracts/guardian-kit.ts",
    type: "GuardianKitSeed",
    topRef: true,
    additionalProperties: false,
    sortProps: true,
  });
  const schema = generator.createSchema("GuardianKitSeed");
  schema.$id = SCHEMA_ID;
  schema.$comment =
    "GENERATED from src/contracts/guardian-kit.ts (D39) — do not edit by hand; run `pnpm run schema:generate`.";
  return schema;
}

export function serializeSchema(schema) {
  return JSON.stringify(schema, null, 2) + "\n";
}
