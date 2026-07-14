/**
 * Validate every /data seed against the generated schema (DC5) and enforce
 * the DC4 unit-requirement metadata mechanically.
 *
 * Checks (Doc 07 §5/§7; M0 packet §7):
 *   1. Drift guard (D39): every committed /schema file must byte-match a
 *      fresh generation from the TS types — hand-edits are rejected.
 *   2. Every data/guardians/*.json validates against the schema. Files named
 *      *.invalid.json are deliberate negative fixtures: they MUST fail
 *      validation; if one passes, this script exits non-zero.
 *   3. DC4: every numeric leaf under `kit` carries exactly one value_metadata
 *      entry (id · unit · gate · source_doc_section · invariant_refs), and
 *      every value_metadata.path resolves to a numeric leaf.
 * Exit code 0 only if all checks pass.
 * Usage: pnpm run schema:validate
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";
import { SCHEMA_BUILDS, SCHEMA_FILE, serializeSchema } from "./build-schema.mjs";

const DATA_DIR = "data/guardians";
let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`FAIL  ${msg}`);
};

// 1. Drift guard (D39: every schema must be generated, never hand-edited).
// CRLF normalized so git autocrlf checkouts on Windows don't false-positive.
for (const { file, build } of SCHEMA_BUILDS) {
  const committedFile = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  if (committedFile !== serializeSchema(build())) {
    fail(`${file} drifts from src/contracts — run \`pnpm run schema:generate\`; hand-edits are forbidden (D39)`);
  } else {
    console.log(`ok    ${file} matches a fresh generation from src/contracts (D39 drift guard)`);
  }
}

const schema = JSON.parse(readFileSync(SCHEMA_FILE, "utf8"));
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
const validate = ajv.compile(schema);

// DC4 helpers: walk numeric leaves under `kit`, resolve dot-paths
function numericLeafPaths(node, prefix = "") {
  const paths = [];
  if (typeof node === "number") return [prefix];
  if (Array.isArray(node)) {
    node.forEach((v, i) => paths.push(...numericLeafPaths(v, `${prefix}[${i}]`)));
  } else if (node !== null && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      paths.push(...numericLeafPaths(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return paths;
}
function resolvePath(root, path) {
  return path
    .split(".")
    .flatMap((seg) => seg.split(/[[\]]/).filter(Boolean))
    .reduce((node, seg) => (node == null ? undefined : node[seg]), root);
}

function checkDc4(file, seed) {
  const leafPaths = numericLeafPaths(seed.kit, "kit");
  const metaPaths = seed.value_metadata.map((m) => m.path);
  for (const p of leafPaths) {
    const count = metaPaths.filter((m) => m === p).length;
    if (count !== 1) {
      fail(`${file}: DC4 — numeric value \`${p}\` has ${count} value_metadata entries (need exactly 1)`);
    }
  }
  for (const m of seed.value_metadata) {
    if (typeof resolvePath(seed, m.path) !== "number") {
      fail(`${file}: DC4 — value_metadata path \`${m.path}\` (${m.id}) does not resolve to a numeric value`);
    }
  }
}

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json")).sort();
if (files.length === 0) fail(`${DATA_DIR}: no seed files found`);

for (const file of files) {
  const fullPath = join(DATA_DIR, file);
  const seed = JSON.parse(readFileSync(fullPath, "utf8"));
  const valid = validate(seed);
  const mustFail = file.endsWith(".invalid.json");

  if (mustFail) {
    if (valid) {
      fail(`${fullPath}: negative fixture PASSED validation — the schema is not rejecting broken seeds (DC5)`);
    } else {
      console.log(`ok    ${fullPath} rejected as expected (${validate.errors.length} schema errors)`);
    }
    continue;
  }

  if (!valid) {
    fail(`${fullPath}: schema validation errors:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
    continue;
  }
  const failuresBeforeDc4 = failures;
  checkDc4(fullPath, seed);
  if (failures === failuresBeforeDc4) {
    console.log(`ok    ${fullPath} valid ($id: ${schema.$id}, schema_version: ${seed.schema_version})`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} validation failure(s).`);
  process.exit(1);
}
console.log(`\nAll ${files.length} seed file(s) checked: valid seeds pass, negative fixtures rejected (DC4/DC5 green).`);
