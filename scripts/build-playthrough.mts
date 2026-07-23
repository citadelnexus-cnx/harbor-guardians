/**
 * Generate the committed frontend data bundles the Alpha A4 Windows app needs,
 * from the schema-validated seeds + the real expedition sim:
 *   - src/ui/shell/seeds.json      — the storage + expedition seeds the
 *     interactive controller loads at runtime (the webview can only fetch
 *     assets under frontendDist, so the seeds are bundled here).
 *   - src/ui/shell/playthrough.json — a deterministic sim-derived transcript
 *     retained as demonstration/test evidence (drift-guarded; the interactive
 *     UI is the primary experience, per the PR #21 review).
 * Both are deterministic and drift-guarded by tests/expedition.test.ts.
 * Usage: pnpm run ui:playthrough  [-- --check]
 *
 * Governing docs: ALPHA_A4_EXECUTION_BRIEF v0.1 §2/§7; D39-style drift discipline.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { canonicalSerialize } from "../src/save/canonical-json.js";
import { buildPlaythrough } from "../src/ui/playthrough.js";
import { loadExpeditionSeed } from "../sim-harness/expedition-seed.js";
import { loadStorageSeed } from "../sim-harness/storage-seed.js";

/** Base seed for the demonstration transcript (presentation parameter, not gameplay). */
const PLAYTHROUGH_SEED = 20260723;
const SEEDS_PATH = "src/ui/shell/seeds.json";
const PLAYTHROUGH_PATH = "src/ui/shell/playthrough.json";

const storageSeed = loadStorageSeed();
const expeditionSeed = loadExpeditionSeed();

const seedsBundle = canonicalSerialize({ storage: storageSeed, expedition: expeditionSeed }) + "\n";
const transcript = canonicalSerialize(buildPlaythrough(storageSeed, expeditionSeed, PLAYTHROUGH_SEED)) + "\n";

const outputs: ReadonlyArray<readonly [string, string]> = [
  [SEEDS_PATH, seedsBundle],
  [PLAYTHROUGH_PATH, transcript],
];

if (process.argv.includes("--check")) {
  let drift = false;
  for (const [path, expected] of outputs) {
    if (readFileSync(path, "utf8") !== expected) {
      console.error(`FAIL  ${path} drifts from a fresh sim-derived generation — run \`pnpm run ui:playthrough\`.`);
      drift = true;
    } else {
      console.log(`ok    ${path} matches a fresh sim-derived generation.`);
    }
  }
  process.exit(drift ? 1 : 0);
}

for (const [path, contents] of outputs) {
  writeFileSync(path, contents, "utf8");
  console.log(`generated ${path}`);
}
