/**
 * Validate every /data seed against its generated schema (DC5) and enforce
 * the DC4 unit-requirement metadata mechanically. Extended at Alpha A1 with
 * the /data/economy resource-storage seed set (owner Alpha A1 authorization,
 * 2026-07-16) and the D1 3S structural cross-check.
 *
 * Checks (Doc 07 §5/§7; M0 packet §7; Economy v1.7 §7):
 *   1. Drift guard (D39): every committed /schema file must byte-match a
 *      fresh generation from the TS types — hand-edits are rejected.
 *   2. Every seed file in every seed set validates against its schema. Files
 *      named *.invalid.json are deliberate negative fixtures: they MUST fail
 *      validation; if one passes, this script exits non-zero.
 *   3. DC4: every numeric leaf under the set's payload root carries exactly
 *      one value_metadata entry (id · unit · gate · source_doc_section ·
 *      invariant_refs), and every value_metadata.path resolves to a numeric
 *      leaf.
 *   4. D1 3S model (economy storage seeds only): for every CoreResource,
 *      exposed_capacity == 2 × safe_capacity, total_capacity == 3 × safe
 *      (Safe S + Exposed 2S = Total 3S — D1, LOCKED), and
 *      start_stock ≤ safe_capacity (Economy §3 stocks fit Safe at creation).
 * Exit code 0 only if all checks pass.
 * Usage: pnpm run schema:validate
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";
import {
  RESOURCE_STORAGE_SCHEMA_FILE,
  SCHEMA_BUILDS,
  SCHEMA_FILE,
  serializeSchema,
} from "./build-schema.mjs";

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`FAIL  ${msg}`);
};

/**
 * The seed sets under validation. `payloadRoot` is the object whose numeric
 * leaves DC4 metadata must cover; `structuralCheck` runs set-specific
 * doctrine checks on valid (non-fixture) seeds.
 */
const SEED_SETS = [
  { dir: "data/guardians", schemaFile: SCHEMA_FILE, payloadRoot: "kit", structuralCheck: null },
  { dir: "data/economy", schemaFile: RESOURCE_STORAGE_SCHEMA_FILE, payloadRoot: "storage", structuralCheck: check3SModel },
];

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

// DC4 helpers: walk numeric leaves under the payload root, resolve dot-paths
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

function checkDc4(file, seed, payloadRoot) {
  const leafPaths = numericLeafPaths(seed[payloadRoot], payloadRoot);
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

/**
 * D1 structural check (economy storage seeds): Safe S + Exposed 2S = Total 3S
 * for every CoreResource, and start_stock fits Safe storage at creation
 * (Economy v1.7 §3/§7; D1 LOCKED 2026-07-09). The 2×/3× multipliers are
 * doctrine values asserted here in the validator — the sim core never derives
 * capacities (it consumes the seeded values verbatim, DC1).
 */
function check3SModel(file, seed) {
  for (const [resource, def] of Object.entries(seed.storage)) {
    if (def.exposed_capacity_st1 !== 2 * def.safe_capacity_st1) {
      fail(`${file}: D1 — ${resource} exposed_capacity_st1 (${def.exposed_capacity_st1}) != 2 × safe_capacity_st1 (${def.safe_capacity_st1})`);
    }
    if (def.total_capacity_st1 !== 3 * def.safe_capacity_st1) {
      fail(`${file}: D1 — ${resource} total_capacity_st1 (${def.total_capacity_st1}) != 3 × safe_capacity_st1 (${def.safe_capacity_st1})`);
    }
    if (def.start_stock > def.safe_capacity_st1) {
      fail(`${file}: Economy §3 — ${resource} start_stock (${def.start_stock}) exceeds safe_capacity_st1 (${def.safe_capacity_st1}); starting stock must fit Safe storage`);
    }
    if (def.start_stock < 0 || def.safe_capacity_st1 <= 0) {
      fail(`${file}: ${resource} start_stock must be ≥ 0 and safe_capacity_st1 > 0`);
    }
  }
}

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
let totalFiles = 0;

for (const { dir, schemaFile, payloadRoot, structuralCheck } of SEED_SETS) {
  const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
  const validate = ajv.compile(schema);

  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  if (files.length === 0) fail(`${dir}: no seed files found`);
  totalFiles += files.length;

  for (const file of files) {
    const fullPath = join(dir, file);
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
    const failuresBefore = failures;
    checkDc4(fullPath, seed, payloadRoot);
    structuralCheck?.(fullPath, seed);
    if (failures === failuresBefore) {
      console.log(`ok    ${fullPath} valid ($id: ${schema.$id}, schema_version: ${seed.schema_version})`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} validation failure(s).`);
  process.exit(1);
}
console.log(`\nAll ${totalFiles} seed file(s) checked across ${SEED_SETS.length} seed sets: valid seeds pass, negative fixtures rejected (DC4/DC5/D1 green).`);
