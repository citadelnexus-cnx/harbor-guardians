/**
 * Generate /schema/guardian_kit_seed.schema.json from the TS contract types.
 * D39 (TS types → generated JSON Schema); Doc 07 §3/§8 (/schema exports).
 * Usage: pnpm run schema:generate
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { buildGuardianKitSeedSchema, SCHEMA_FILE, serializeSchema } from "./build-schema.mjs";

const schema = buildGuardianKitSeedSchema();
mkdirSync(dirname(SCHEMA_FILE), { recursive: true });
writeFileSync(SCHEMA_FILE, serializeSchema(schema), "utf8");
console.log(`generated ${SCHEMA_FILE} ($id: ${schema.$id})`);
