/**
 * Generate every /schema/*.json from the TS contract types.
 * D39 (TS types → generated JSON Schema); Doc 07 §3/§8 (/schema exports).
 * Usage: pnpm run schema:generate
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { SCHEMA_BUILDS, serializeSchema } from "./build-schema.mjs";

for (const { file, build } of SCHEMA_BUILDS) {
  const schema = build();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, serializeSchema(schema), "utf8");
  console.log(`generated ${file} ($id: ${schema.$id})`);
}
