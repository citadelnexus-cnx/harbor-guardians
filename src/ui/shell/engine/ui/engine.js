/**
 * Browser engine entry point — the single module the Tauri webview imports.
 * It re-exports the pure, authoritative interactive controller (and its view
 * types); `pnpm run ui:engine` compiles this file and its dependency graph
 * (the real sim + save serialization/migration, all browser-safe) to ESM under
 * src/ui/shell/engine/ via the existing `tsc` (no bundler, no new dependency).
 * The webview (src/ui/shell/app.js) drives THIS compiled code — the same
 * authoritative sim the tests and harness use — never a parallel model.
 *
 * Governing docs: ALPHA_A4_EXECUTION_BRIEF v0.1 §2 (minimal Windows interface).
 */
export { ExpeditionController, CONTROLLER_GUARDIANS } from "./controller.js";
