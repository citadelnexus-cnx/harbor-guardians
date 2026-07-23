/**
 * Generate the committed A4 playthrough transcript the minimal Windows desktop
 * viewer renders (src/ui/shell/playthrough.json), from the REAL expedition sim
 * over the schema-validated seeds. Deterministic; the output is drift-guarded
 * by tests/expedition.test.ts (a fresh build must byte-match the committed
 * file). Usage: pnpm run ui:playthrough  [-- --check]
 *
 * Governing docs: ALPHA_A4_EXECUTION_BRIEF v0.1 §2/§7 (minimal Windows
 * interface + acceptance evidence); D39-style drift discipline.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { canonicalSerialize } from "../src/save/canonical-json.js";
import { buildPlaythrough } from "../src/ui/playthrough.js";
import { loadExpeditionSeed } from "../sim-harness/expedition-seed.js";
import { loadStorageSeed } from "../sim-harness/storage-seed.js";

/** Base seed for the viewer transcript (presentation parameter, not gameplay). */
const PLAYTHROUGH_SEED = 20260723;
const OUT_PATH = "src/ui/shell/playthrough.json";

const transcript = buildPlaythrough(loadStorageSeed(), loadExpeditionSeed(), PLAYTHROUGH_SEED);
const serialized = canonicalSerialize(transcript) + "\n";

if (process.argv.includes("--check")) {
  const committed = readFileSync(OUT_PATH, "utf8");
  if (committed !== serialized) {
    console.error(`FAIL  ${OUT_PATH} drifts from a fresh sim-derived generation — run \`pnpm run ui:playthrough\`.`);
    process.exit(1);
  }
  console.log(`ok    ${OUT_PATH} matches a fresh sim-derived generation.`);
  process.exit(0);
}

writeFileSync(OUT_PATH, serialized, "utf8");
console.log(`generated ${OUT_PATH} (${transcript.runs.length} runs from seed ${PLAYTHROUGH_SEED}).`);
