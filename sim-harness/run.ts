/**
 * Headless sim-harness runner (CLI) — M0 skeleton + A0 EVT registration +
 * A1 data-contract/harbor-spine checks + A2 claim-ledger/reward-routing
 * checks + A3 event-lifecycle checks (owner A3 authorization 2026-07-18,
 * Option A).
 *
 * What it does at A3 (no gameplay LOOP — A3 authorizes the event-lifecycle
 * skeleton only: test-fixture events, signal-driven transitions, inert
 * effects, no reward generation; M0 packet §1/§8 doctrine still applies):
 *   1. Registry integrity: every required invariant ID (E/L/M/C/S/OPS/CARGO/
 *      TD/A11Y/DC/OB/GEAR/W/FCT/GDN/EVT/UX1) is registered exactly once.
 *   2. Seed-validation gate: the harness consumes only schema-validated
 *      seeds (Sim §2) — it invokes the Step-5 validator over /data/guardians
 *      and fails loud if any seed is invalid.
 *   3. Fail-loud stub verification: every "stub" invariant is executed and
 *      MUST throw InvariantStubError. A stub that silently passes is a
 *      batch-fatal harness defect ("claimed but untested" impossible).
 *   4. Fixed-seed determinism: the batch computation runs twice with the
 *      same seed and must produce byte-identical canonical output.
 *   5. Emits the report as machine-readable JSON + human summary (Sim §2/§5).
 *
 * Usage:
 *   pnpm run sim:harness                      # full batch (exit 0 iff green)
 *   pnpm run sim:harness -- --seed 1234       # batch under a different fixed seed
 *   pnpm run sim:harness -- --list            # print the registry
 *   pnpm run sim:harness -- --invariant E1    # execute one invariant for real:
 *                                             #   a stub throws → exit 1 (fail-loud)
 *   pnpm run sim:harness -- --out report.json # also write the JSON report here
 *
 * Governing docs: SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §2/§3/§5/§7/§8;
 * M0 packet §8; CLAUDE.md §3 (claim-to-test).
 * Invariant refs: registers all suites (incl. EVT1–EVT10, added at Alpha A0
 * per 15_EVENT_SYSTEM_SPEC v0.2 §5 — stubs only, no event logic).
 * Implemented: S5/S7 (M0 Step 7; S5 extended at A1 with the stocked
 * round-trip and at A2 with the reward-bearing ledger round-trip; S7
 * upgraded at A2 to reward-bearing crash simulation) + DC1/DC4/DC5/DC6
 * (Alpha A1) + L1/L5/L6/L7/L11/L14 (Alpha A2, A2 scope) + EVT1/EVT2/EVT3/
 * EVT4 (Alpha A3 Option A, A3 scope); all other IDs are fail-loud stubs.
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { EXPECTED_SUITE_COUNTS, findInvariant, INVARIANT_REGISTRY } from "./registry.js";
import { buildPersonaMatrix } from "./personas.js";
import { createRng, proveRepeatRunDeterminism } from "./determinism.js";
import {
  InvariantStubError,
  type HarnessReport,
  type InvariantResult,
  type Suite,
} from "./types.js";

/** Default fixed seed for the M0 smoke batch (harness test parameter, not gameplay). */
const DEFAULT_SEED = 20260714;
const DEFAULT_REPORT_PATH = "sim-harness/reports/latest-report.json";

// ── CLI parsing ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function flagValue(name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
const listMode = args.includes("--list");
const invariantId = flagValue("--invariant");
const seed = Number(flagValue("--seed") ?? DEFAULT_SEED);
const outPath = flagValue("--out") ?? DEFAULT_REPORT_PATH;

if (!Number.isInteger(seed)) {
  console.error(`sim-harness: --seed must be an integer, got: ${flagValue("--seed")}`);
  process.exit(2);
}

// ── Registry integrity (M0 packet §8: every required ID registered) ─────────
function verifyRegistryIntegrity(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const entry of INVARIANT_REGISTRY) {
    if (seen.has(entry.id)) problems.push(`duplicate invariant id: ${entry.id}`);
    seen.add(entry.id);
  }
  for (const [suite, count] of Object.entries(EXPECTED_SUITE_COUNTS) as [Suite, number][]) {
    for (let n = 1; n <= count; n += 1) {
      const id = `${suite}${n}`;
      if (!seen.has(id)) problems.push(`missing required invariant id: ${id}`);
    }
    const actual = INVARIANT_REGISTRY.filter((e) => e.suite === suite).length;
    if (actual !== count) {
      problems.push(`suite ${suite}: expected ${count} invariants, registry has ${actual}`);
    }
  }
  const expectedTotal = Object.values(EXPECTED_SUITE_COUNTS).reduce((a, b) => a + b, 0);
  if (INVARIANT_REGISTRY.length !== expectedTotal) {
    problems.push(`registry total ${INVARIANT_REGISTRY.length} != expected ${expectedTotal}`);
  }
  return problems;
}

// ── Modes ────────────────────────────────────────────────────────────────────
if (listMode) {
  for (const e of INVARIANT_REGISTRY) {
    console.log(`${e.id.padEnd(7)} [${e.status.toUpperCase().padEnd(11)}] ${e.statement}  (${e.source})`);
  }
  console.log(`\n${INVARIANT_REGISTRY.length} invariants registered.`);
  process.exit(0);
}

if (invariantId !== undefined) {
  const entry = findInvariant(invariantId);
  if (!entry) {
    console.error(`sim-harness: unknown invariant id "${invariantId}" — run --list for the registry.`);
    process.exit(2);
  }
  console.log(`Executing ${entry.id} (${entry.source}) under seed ${seed} ...`);
  try {
    const verdict = entry.check({ seed });
    if (verdict.pass) {
      console.log(`PASS  ${entry.id}: ${verdict.evidence}`);
      process.exit(0);
    }
    console.error(`FAIL  ${entry.id}: ${verdict.evidence}`);
    process.exit(1);
  } catch (err) {
    console.error(`FAIL-LOUD  ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// ── Full M0 batch ────────────────────────────────────────────────────────────
let batchGreen = true;
const problem = (msg: string) => {
  batchGreen = false;
  console.error(`FAIL  ${msg}`);
};

console.log(`sim-harness A3 batch — seed ${seed}\n`);

// 1. Registry integrity
const integrityProblems = verifyRegistryIntegrity();
if (integrityProblems.length > 0) {
  integrityProblems.forEach((p) => problem(`registry integrity: ${p}`));
} else {
  console.log(`ok    registry integrity: all ${INVARIANT_REGISTRY.length} required invariant IDs registered exactly once`);
}

// 2. Seed-validation gate (Sim §2: harness consumes only schema-validated seeds)
const gate = spawnSync(process.execPath, ["scripts/validate-data.mjs"], { encoding: "utf8" });
const gatePass = gate.status === 0;
const gateDetail = gatePass
  ? "scripts/validate-data.mjs exit 0 — all /data seed sets schema-valid (DC4/DC5/D1 checks green)"
  : `scripts/validate-data.mjs exit ${gate.status} — invalid seeds; harness refuses to run on unvalidated data (Sim §2)`;
if (gatePass) {
  console.log(`ok    seed-validation gate: ${gateDetail}`);
} else {
  problem(`seed-validation gate: ${gateDetail}`);
  console.error(gate.stdout);
  console.error(gate.stderr);
}

// 3. + 4. The deterministic batch computation (run twice for the repeat-run proof)
function computeBatch(batchSeed: number): {
  invariant_results: InvariantResult[];
  rng_witness: number[];
} {
  const results: InvariantResult[] = [];
  for (const entry of INVARIANT_REGISTRY) {
    try {
      const verdict = entry.check({ seed: batchSeed });
      if (entry.status === "stub") {
        results.push({
          id: entry.id,
          suite: entry.suite,
          status: entry.status,
          outcome: "STUB_SILENT",
          detail: "stub returned a verdict instead of failing loud — harness defect",
        });
      } else {
        results.push({
          id: entry.id,
          suite: entry.suite,
          status: entry.status,
          outcome: verdict.pass ? "PASS" : "FAIL",
          detail: verdict.evidence,
        });
      }
    } catch (err) {
      if (entry.status === "stub" && err instanceof InvariantStubError) {
        results.push({
          id: entry.id,
          suite: entry.suite,
          status: entry.status,
          outcome: "STUB_FAIL_LOUD_VERIFIED",
          detail: "unimplemented stub threw InvariantStubError as required (fail-loud)",
        });
      } else {
        results.push({
          id: entry.id,
          suite: entry.suite,
          status: entry.status,
          outcome: "ERROR",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }
  // Seeded RNG witness: ties the batch output to the seed so the repeat-run
  // proof exercises the determinism spine, not just static data.
  const rng = createRng(batchSeed);
  const rng_witness = Array.from({ length: 8 }, () => rng());
  return { invariant_results: results, rng_witness };
}

const batch = computeBatch(seed);
const badOutcomes = batch.invariant_results.filter(
  (r) => r.outcome === "STUB_SILENT" || r.outcome === "ERROR" || r.outcome === "FAIL",
);
if (badOutcomes.length === 0) {
  const stubs = batch.invariant_results.filter((r) => r.outcome === "STUB_FAIL_LOUD_VERIFIED").length;
  const passes = batch.invariant_results.filter((r) => r.outcome === "PASS").length;
  console.log(
    `ok    fail-loud stub verification: ${stubs} stubs threw as required, ${passes} implemented invariants passed`,
  );
} else {
  for (const r of badOutcomes) problem(`${r.id} [${r.outcome}]: ${r.detail}`);
}

const determinism = proveRepeatRunDeterminism(seed, computeBatch);
if (determinism.pass) {
  console.log(`ok    determinism: ${determinism.detail}`);
} else {
  problem(`determinism: ${determinism.detail}`);
}

// Persona matrix — declared hooks only at M0 (Sim §3; behavior models are FUTURE BUILD)
const personas = buildPersonaMatrix();
const personaIds = personas.map((p) =>
  p.parameters ? `${p.id}[${p.parameters.length} params]` : p.id,
);
const personasWithBehavior = personas.filter((p) => p.run !== undefined);
if (personasWithBehavior.length > 0) {
  // Through A3 no persona may claim a behavior model (scope guard, CLAUDE.md
  // §7; A3 authorizes the event-lifecycle skeleton only — no gameplay loop,
  // so behavior models remain unauthorized).
  problem(
    `persona matrix: ${personasWithBehavior.map((p) => p.id).join(", ")} declare behavior models — not authorized at M0/A0/A1/A2/A3`,
  );
} else {
  console.log(`ok    persona matrix declared (hooks only, no behavior models): ${personaIds.join(" · ")}`);
}

// 5. Report — machine-readable JSON + human summary (Sim §2/§5)
const registryCounts = Object.fromEntries(
  (Object.keys(EXPECTED_SUITE_COUNTS) as Suite[]).map((s) => [
    s,
    INVARIANT_REGISTRY.filter((e) => e.suite === s).length,
  ]),
) as Record<Suite, number>;

const report: HarnessReport = {
  harness: "harbor-guardians sim-harness",
  milestone: "A3",
  seed,
  registry_counts: registryCounts,
  total_invariants: INVARIANT_REGISTRY.length,
  seed_validation_gate: { pass: gatePass, detail: gateDetail },
  determinism_proof: determinism,
  persona_matrix_declared: personaIds,
  invariant_results: batch.invariant_results,
  batch_green: batchGreen,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(`\nreport written: ${outPath}`);

const implementedIds = batch.invariant_results.filter((r) => r.outcome === "PASS").map((r) => r.id);
const stubTotal = batch.invariant_results.filter((r) => r.outcome === "STUB_FAIL_LOUD_VERIFIED").length;
console.log(
  batchGreen
    ? `\nA3 BATCH GREEN — ${INVARIANT_REGISTRY.length} invariants registered: ${stubTotal} fail-loud stubs (no unimplemented invariant is claimed as passing) + ${implementedIds.length} implemented and proven green (${implementedIds.join(", ") || "none"}); seed gate + determinism proof passed (seed ${seed}).`
    : `\nA3 BATCH RED — see failures above (seed ${seed}).`,
);
process.exit(batchGreen ? 0 : 1);
