/**
 * Copy the non-TypeScript runtime assets the browser engine imports but `tsc`
 * does not emit — currently the GENERATED, precompiled SaveBlob schema validator
 * (save-blob-schema-validator.mjs). `pnpm run ui:engine` runs `tsc` (which emits
 * the compiled sim/save/controller graph) and then this copy so the webview can
 * resolve `./generated/save-blob-schema-validator.mjs` at runtime under the
 * strict `default-src 'self'` CSP (H2 — the desktop path validates through the
 * same precompiled contract as Node).
 *
 * The copied file is a committed engine artifact and is drift-guarded together
 * with the rest of src/ui/shell/engine/ by the engine drift check (H1). Content
 * is normalized to LF so the byte-exact drift check is stable on Windows.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { SAVE_VALIDATOR_FILE } from "./build-save-validator.mjs";

/** [source, destination] pairs copied into the compiled engine tree. */
const ENGINE_ASSETS = [[SAVE_VALIDATOR_FILE, "src/ui/shell/engine/save/generated/save-blob-schema-validator.mjs"]];

for (const [source, dest] of ENGINE_ASSETS) {
  mkdirSync(dirname(dest), { recursive: true });
  // Normalize to LF (mirrors the tsc-emitted engine files) so the drift check is deterministic across platforms.
  const contents = readFileSync(source, "utf8").replace(/\r\n/g, "\n");
  writeFileSync(dest, contents, "utf8");
  console.log(`copied ${source} -> ${dest}`);
}
