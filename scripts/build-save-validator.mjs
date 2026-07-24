/**
 * Generate the browser-safe, precompiled SaveBlob JSON-Schema validator from
 * the committed generated schema (HG-POST-A4-STABILIZATION-01 H2).
 *
 * The generated /schema/save_blob.schema.json (itself GENERATED from the TS
 * contracts, D39) is the single source contract. This script compiles it with
 * ajv's standalone code generator into a dependency-free ESM module
 * (src/save/generated/save-blob-schema-validator.mjs) that runs the IDENTICAL
 * structural validation in Node (tests/save path) and in the Tauri webview
 * (desktop/controller path) — no hand-authored second contract, no ajv runtime
 * dependency shipped, no filesystem read at validation time.
 *
 * The output is committed and drift-guarded: `--check` fails if the committed
 * validator differs from a fresh generation (so the schema and its precompiled
 * validator can never silently diverge). Wired into `pnpm run schema:validate`
 * and CI.
 *
 * Usage:
 *   node scripts/build-save-validator.mjs           # (re)generate the validator
 *   node scripts/build-save-validator.mjs --check    # drift guard (exit 1 on drift)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";
import { SAVE_BLOB_SCHEMA_FILE } from "./build-schema.mjs";

export const SAVE_VALIDATOR_FILE = "src/save/generated/save-blob-schema-validator.mjs";

const GENERATED_HEADER =
  "/* eslint-disable -- GENERATED ajv standalone code; not hand-maintained (H2). */\n" +
  "/**\n" +
  " * GENERATED — do not edit by hand.\n" +
  " *\n" +
  " * Precompiled, browser-safe SaveBlob JSON-Schema validator produced by\n" +
  " * `node scripts/build-save-validator.mjs` from the committed generated schema\n" +
  " * (schema/save_blob.schema.json). Dependency-free ESM: the SAME structural\n" +
  " * validator runs in Node and in the Tauri webview (HG-POST-A4-STABILIZATION-01\n" +
  " * H2 — one save contract, both paths). Drift-guarded by\n" +
  " * `node scripts/build-save-validator.mjs --check` (run under `schema:validate`\n" +
  " * and CI). Regenerate whenever the schema changes.\n" +
  " */\n";

/** Produce the standalone validator module source from the committed schema. */
export function buildSaveValidatorSource() {
  const schema = JSON.parse(readFileSync(SAVE_BLOB_SCHEMA_FILE, "utf8"));
  // esm output; allErrors so a malformed blob reports every violation; the
  // schema uses only structural keywords (type/properties/required/enum/
  // additionalProperties), so ajv inlines everything and the output has no
  // runtime import of ajv.
  const ajv = new Ajv({ code: { source: true, esm: true }, allErrors: true, allowUnionTypes: true });
  const validate = ajv.compile(schema);
  const code = standaloneCode(ajv, validate);
  // Normalize to LF and prepend the generated-file header.
  return GENERATED_HEADER + code.replace(/\r\n/g, "\n");
}

// CLI entry only — importing this module (for buildSaveValidatorSource /
// SAVE_VALIDATOR_FILE) must have NO side effects, so generation/drift-check runs
// only when the file is executed directly.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const source = buildSaveValidatorSource();
  if (process.argv.includes("--check")) {
    const committed = readFileSync(SAVE_VALIDATOR_FILE, "utf8").replace(/\r\n/g, "\n");
    if (committed !== source) {
      console.error(
        `FAIL  ${SAVE_VALIDATOR_FILE} drifts from a fresh generation off ${SAVE_BLOB_SCHEMA_FILE} — run \`node scripts/build-save-validator.mjs\` (H2 drift guard).`,
      );
      process.exit(1);
    }
    console.log(`ok    ${SAVE_VALIDATOR_FILE} matches a fresh generation off the committed schema (H2 drift guard).`);
  } else {
    writeFileSync(SAVE_VALIDATOR_FILE, source, "utf8");
    console.log(`generated ${SAVE_VALIDATOR_FILE} from ${SAVE_BLOB_SCHEMA_FILE}`);
  }
}
