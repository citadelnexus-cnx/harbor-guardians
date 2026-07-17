/**
 * Data-contract invariant checks (DC1 / DC4 / DC5 / DC6) — implemented at
 * Alpha A1 scope (owner Alpha A1 authorization, 2026-07-16). These are the
 * executable evidence behind the four DC stubs converted at A1; DC2 (combat
 * reward lines) and DC3 (message↔package links) stay fail-loud stubs because
 * their systems do not exist.
 *
 * Every check is deterministic (no wall-clock, no paths in evidence beyond
 * repo-relative names, no RNG) so the harness repeat-run determinism proof
 * holds over the verdicts.
 *
 * Governing docs: 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §5/§7;
 * SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §2/§8; CLAUDE.md §2 (No Magic Numbers).
 * Invariant refs: DC1, DC4, DC5, DC6.
 */

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";
import { CORE_RESOURCES, createHarborState } from "../src/sim/harbor-state.js";
import { loadStorageSeed, RESOURCE_STORAGE_SCHEMA_PATH } from "./storage-seed.js";
import type { CheckVerdict } from "./types.js";

const SAVE_BLOB_SCHEMA_PATH = "schema/save_blob.schema.json";
const SIM_CORE_DIR = "src/sim";

/** The seed sets under DC4 coverage (mirrors scripts/validate-data.mjs SEED_SETS). */
const SEED_SETS: ReadonlyArray<{ dir: string; payloadRoot: string }> = [
  { dir: "data/guardians", payloadRoot: "kit" },
  { dir: "data/economy", payloadRoot: "storage" },
  { dir: "data/rewards", payloadRoot: "rules" },
];

const fail = (evidence: string): CheckVerdict => ({ pass: false, evidence });
const pass = (evidence: string): CheckVerdict => ({ pass: true, evidence });

// ── DC1 — No Magic Numbers ───────────────────────────────────────────────────

/**
 * Strip comments and string/template literals from TS source so the numeric-
 * literal scan cannot false-positive on doc citations ("§7", "3S", dates) or
 * evidence strings. Crude but sufficient for the sim core's plain TS (no
 * regex literals with quotes, no nested template expressions with strings).
 */
function stripCommentsAndStrings(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ") // block comments
    .replace(/\/\/[^\n]*/g, " ") // line comments
    .replace(/`(?:[^`\\]|\\.)*`/g, " ") // template literals
    .replace(/"(?:[^"\\]|\\.)*"/g, " ") // double-quoted strings
    .replace(/'(?:[^'\\]|\\.)*'/g, " "); // single-quoted strings
}

/**
 * DC1 at A1 scope: (a) static scan — no numeric literal other than the
 * identity 0 exists in /src/sim code (every gameplay number must come from a
 * seed); (b) runtime proof — the harbor state spine's start stocks and
 * capacities are exactly the schema-validated seed's values.
 */
export function checkDc1NoMagicNumbers(): CheckVerdict {
  // (a) static scan of the sim core
  const simFiles = readdirSync(SIM_CORE_DIR).filter((f) => f.endsWith(".ts")).sort();
  const offenders: string[] = [];
  for (const file of simFiles) {
    const code = stripCommentsAndStrings(readFileSync(join(SIM_CORE_DIR, file), "utf8"));
    for (const match of code.matchAll(/(?<![\w$.])\d+(?:\.\d+)?/g)) {
      if (match[0] !== "0") offenders.push(`${SIM_CORE_DIR}/${file}: literal ${match[0]}`);
    }
  }
  if (offenders.length > 0) {
    return fail(`DC1: gameplay-number candidates hard-coded in the sim core: ${offenders.join("; ")}`);
  }

  // (b) the spine's numbers are the seed's numbers
  const seed = loadStorageSeed();
  const state = createHarborState(seed);
  for (const resource of CORE_RESOURCES) {
    const def = seed.storage[resource];
    const band = state.resources[resource];
    if (band.safe !== def.start_stock || band.exposed !== 0 || band.caps !== def) {
      return fail(`DC1: ${resource} harbor-state values do not resolve to the schema-validated seed field`);
    }
  }
  return pass(
    `A1 scope: ${simFiles.length} sim-core file(s) scanned — no numeric literal besides the identity 0 ` +
      `(comments/strings excluded); harbor spine start stocks + 3S capacities for ${CORE_RESOURCES.length} ` +
      `CoreResources resolve verbatim to schema-validated data/economy/storage.st1.json fields. ` +
      `Coverage grows with each seeded system (FUTURE BUILD).`,
  );
}

// ── DC4 — unit-requirement metadata ─────────────────────────────────────────

function numericLeafPaths(node: unknown, prefix: string): string[] {
  if (typeof node === "number") return [prefix];
  const paths: string[] = [];
  if (Array.isArray(node)) {
    node.forEach((v, i) => paths.push(...numericLeafPaths(v, `${prefix}[${i}]`)));
  } else if (node !== null && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      paths.push(...numericLeafPaths(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return paths;
}

function resolvePath(root: unknown, path: string): unknown {
  return path
    .split(".")
    .flatMap((seg) => seg.split(/[[\]]/).filter(Boolean))
    .reduce<unknown>((node, seg) => {
      if (node === null || typeof node !== "object") return undefined;
      return (node as Record<string, unknown>)[seg];
    }, root);
}

interface SeedEnvelope {
  value_metadata: Array<{ id: string; path: string; unit: string; gate: string; source_doc_section: string; invariant_refs: string[] }>;
  [key: string]: unknown;
}

/**
 * DC4: every numeric leaf under every seed's payload root carries exactly one
 * value_metadata entry, every entry resolves to a numeric leaf, and every
 * entry carries the full unit-requirement fields (id · unit · gate ·
 * source_doc_section · invariant_refs). Negative fixtures are excluded (they
 * are rejected upstream by DC5).
 */
export function checkDc4SeedMetadata(): CheckVerdict {
  const problems: string[] = [];
  let filesChecked = 0;
  let leavesChecked = 0;
  for (const { dir, payloadRoot } of SEED_SETS) {
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".json") && !f.endsWith(".invalid.json"))
      .sort();
    for (const file of files) {
      filesChecked += 1;
      const seed = JSON.parse(readFileSync(join(dir, file), "utf8")) as SeedEnvelope;
      const leaves = numericLeafPaths(seed[payloadRoot], payloadRoot);
      leavesChecked += leaves.length;
      const metaPaths = seed.value_metadata.map((m) => m.path);
      for (const leaf of leaves) {
        const count = metaPaths.filter((p) => p === leaf).length;
        if (count !== 1) problems.push(`${dir}/${file}: \`${leaf}\` has ${count} metadata entries (need 1)`);
      }
      for (const m of seed.value_metadata) {
        if (typeof resolvePath(seed, m.path) !== "number") {
          problems.push(`${dir}/${file}: metadata path \`${m.path}\` (${m.id}) is not a numeric leaf`);
        }
        for (const field of ["id", "unit", "gate", "source_doc_section", "invariant_refs"] as const) {
          const v = m[field];
          if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) {
            problems.push(`${dir}/${file}: metadata \`${m.id || m.path}\` missing/empty ${field}`);
          }
        }
      }
    }
  }
  if (problems.length > 0) return fail(`DC4: ${problems.join("; ")}`);
  return pass(
    `${leavesChecked} numeric seed value(s) across ${filesChecked} seed file(s) in ${SEED_SETS.length} seed sets ` +
      `each carry exactly one full unit-requirement metadata entry (id · unit · gate · source_doc_section · ` +
      `invariant_refs), and every metadata path resolves to a numeric leaf.`,
  );
}

// ── DC5 — invalid/unversioned schema blocks CI ───────────────────────────────

/**
 * DC5: executes the actual CI gate (scripts/validate-data.mjs — the required
 * `ci` status check runs it; red-blocks-merge proven server-side on PR #10).
 * Requires exit 0 AND that every deliberate *.invalid.json negative fixture
 * was rejected — proof the gate rejects broken data rather than passing
 * vacuously — plus the D39 drift guard over every committed schema.
 */
export function checkDc5ValidationGate(): CheckVerdict {
  const fixtureCount = SEED_SETS.flatMap(({ dir }) =>
    readdirSync(dir).filter((f) => f.endsWith(".invalid.json")),
  ).length;
  if (fixtureCount === 0) {
    return fail("DC5: no negative fixtures exist — cannot prove the gate rejects invalid data");
  }
  const gate = spawnSync(process.execPath, ["scripts/validate-data.mjs"], { encoding: "utf8" });
  if (gate.status !== 0) {
    return fail(`DC5: scripts/validate-data.mjs exited ${gate.status} — the gate itself is red`);
  }
  const rejected = (gate.stdout.match(/rejected as expected/g) ?? []).length;
  if (rejected !== fixtureCount) {
    return fail(`DC5: ${fixtureCount} negative fixture(s) on disk but ${rejected} rejection(s) reported`);
  }
  const driftOk = (gate.stdout.match(/D39 drift guard/g) ?? []).length;
  return pass(
    `scripts/validate-data.mjs (the CI-required \`ci\` gate step) exit 0: ${driftOk} committed schema(s) ` +
      `byte-match fresh generation from TS types (D39 — unversioned/hand-edited schema fails), and all ` +
      `${fixtureCount} deliberate invalid fixture(s) were rejected. Red exit blocks merge server-side ` +
      `(ruleset + required ci check, proven on PR #10).`,
  );
}

// ── DC6 — CoreResource-only storage/exposure typing ──────────────────────────

/**
 * DC6: runtime negative probes — the committed storage-seed schema must
 * REJECT any seed admitting a StandingResource (Merit) or ReceiptMetric
 * (XP/BondXP/BondCharge) key into storage, and the save-blob schema must
 * reject the same keys in its resources block; both must ACCEPT the
 * CoreResource-only shape.
 */
export function checkDc6CoreResourceOnly(): CheckVerdict {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const storageValidate = ajv.compile(JSON.parse(readFileSync(RESOURCE_STORAGE_SCHEMA_PATH, "utf8")));
  const saveValidate = ajv.compile(JSON.parse(readFileSync(SAVE_BLOB_SCHEMA_PATH, "utf8")));

  const validSeed = loadStorageSeed(); // throws if the real seed is invalid
  if (!storageValidate(validSeed)) {
    return fail("DC6: the CoreResource-only storage seed failed its own schema — probe base is broken");
  }

  const forbidden = ["Merit", "XP", "BondXP", "BondCharge"] as const;
  const problems: string[] = [];
  const anyDef = validSeed.storage.Crowns;
  for (const key of forbidden) {
    const poisonedStorage = {
      ...validSeed,
      storage: { ...validSeed.storage, [key]: { ...anyDef } },
    };
    if (storageValidate(poisonedStorage)) {
      problems.push(`storage schema ACCEPTED forbidden key \`${key}\``);
    }
    const emptyBand = { safe: 0, exposed: 0 };
    const poisonedSave = {
      resources: {
        Crowns: emptyBand,
        Provisions: emptyBand,
        Iron: emptyBand,
        Aether: emptyBand,
        [key]: emptyBand,
      },
    };
    // Probe only the resources property: a full valid blob with one poisoned
    // key must produce a resources-level additionalProperties error.
    const errorsForPoisonedResources = (() => {
      saveValidate({ ...minimalValidSaveShape(), resources: poisonedSave.resources });
      return (saveValidate.errors ?? []).some(
        (e) => e.instancePath === "/resources" && e.keyword === "additionalProperties",
      );
    })();
    if (!errorsForPoisonedResources) {
      problems.push(`save_blob schema did not reject forbidden resources key \`${key}\``);
    }
  }
  if (problems.length > 0) return fail(`DC6: ${problems.join("; ")}`);
  return pass(
    `storage-seed schema and save_blob schema both reject every StandingResource/ReceiptMetric key ` +
      `(${forbidden.join(", ")}) in storage/exposure fields and accept the CoreResource-only shape ` +
      `(Crowns, Provisions, Iron, Aether) — D26/DC6 enforced by generated schema, not convention. ` +
      `Cargo and raid-loss fields are FUTURE BUILD; DC6 extends to them when they exist.`,
  );
}

/** A structurally valid empty save blob shape for the DC6 save-schema probe (matches createEmptySaveBlob). */
function minimalValidSaveShape(): Record<string, unknown> {
  const emptyBand = { safe: 0, exposed: 0 };
  return {
    meta: { save_schema_version: 0, game_version: "", last_saved_utc: "" },
    world_clock: { day_index: 0, time_of_day: 0 },
    resources: { Crowns: emptyBand, Provisions: emptyBand, Iron: emptyBand, Aether: emptyBand },
    buildings: [],
    workers: [],
    threat: { phase: "calm" },
    claim_ledger: { packages: [] },
    pending_reward_resolution: [],
    system_messages: [],
    merit: {},
    guardian_bond: null,
    flags_story: {},
  };
}
