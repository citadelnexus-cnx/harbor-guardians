/**
 * Sim-harness contract types — the shapes of the invariant registry and the
 * per-batch report.
 *
 * Governing docs:
 *   - SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §2 (deterministic, seedable,
 *     rendering-free; machine-readable JSON + human summary per batch),
 *     §4 (invariant suites), §5 (sim output report shape)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §3 (`sim_invariant`:
 *     id · statement · suite · blocking=true; `sim_report`: seed +
 *     invariant_results[] table)
 *   - M0 packet §8 (every invariant ID registered as an addressable,
 *     fail-loud stub until its feature is implemented)
 * Invariant refs: registry carries E/L/M/C/S/OPS/CARGO/TD/A11Y/UX/DC/OB/GEAR/
 * W/FCT/GDN/EVT suites; DC1 (ids resolve to seeds) applies when checks land.
 * EVT1–EVT10 registered at Alpha A0 (15_EVENT_SYSTEM_SPEC v0.2 §5) as
 * fail-loud stubs only — no event logic exists (A0 authorizes no gameplay).
 */

/** Suite names, per Sim spec §4 + Doc 07 §3 `sim_invariant.id` prefixes. */
export type Suite =
  | "E" // Economy — Sim spec §4.1 (E21 also Economy v1.7)
  | "L" // Claim Ledger — Sim spec §4.2
  | "M" // Messages / System Inbox — Sim spec §4.3
  | "C" // Combat — Sim spec §4.4
  | "CARGO" // Ship Hold / Docked Cargo — Sim spec §4.5 (04B v0.1.2)
  | "S" // Trust & safety — Sim spec §4.6
  | "OPS" // Operations — Sim spec §4.7
  | "UX" // UX — Sim spec §4.8
  | "DC" // Data contracts — Doc 07 §7
  | "TD" // Threat director — Doc 05 §11
  | "A11Y" // Accessibility — Doc 06 §9
  | "OB" // Onboarding — Doc 08 §8
  | "GEAR" // Gear / item rewards — Doc 09 §8
  | "W" // World Atlas — Doc 10 §13
  | "FCT" // Faction Codex — Doc 11 §9
  | "GDN" // Guardian Sanctum & Kit — Doc 12 §9
  | "EVT"; // Event System — 15_EVENT_SYSTEM_SPEC v0.2 §5 (registered A0; stubs only)

/**
 * Implementation status of an invariant check.
 * - "stub": M0 state — registered and addressable, but the feature does not
 *   exist yet; executing the check MUST throw InvariantStubError (fail-loud;
 *   M0 packet §8 — "claimed but untested" is impossible).
 * - "implemented": a real check exists; executing it returns pass/fail.
 *   No invariant may be marked "implemented" without its feature + evidence
 *   (claim-to-test, CLAUDE.md §3). At M0 Step 6 every entry is "stub".
 */
export type InvariantStatus = "stub" | "implemented";

/** One registered invariant (Doc 07 §3 `sim_invariant`; blocking is always true). */
export interface InvariantEntry {
  /** e.g. "E1", "CARGO3", "UX1", "GDN11". */
  readonly id: string;
  readonly suite: Suite;
  /** The invariant statement, condensed from its governing doc. */
  readonly statement: string;
  /** Governing doc + section, e.g. "SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.1". */
  readonly source: string;
  readonly status: InvariantStatus;
  /** A failed (or unimplemented-but-claimed) invariant blocks the PR (Sim §2). */
  readonly blocking: true;
  /**
   * The executable check. For "stub" entries this MUST throw
   * InvariantStubError. Implemented checks receive the batch seed and return
   * a verdict. Signature is fixed now so future feature PRs only swap the
   * body and flip status (claim-to-test).
   */
  readonly check: (ctx: CheckContext) => CheckVerdict;
}

/** Context handed to every check — seeded so runs replay (Sim §2). */
export interface CheckContext {
  readonly seed: number;
}

export interface CheckVerdict {
  readonly pass: boolean;
  readonly evidence: string;
}

/** Thrown by every unimplemented stub — the fail-loud signal (M0 packet §8). */
export class InvariantStubError extends Error {
  constructor(readonly invariantId: string, source: string) {
    super(
      `${invariantId}: NOT IMPLEMENTED — fail-loud stub (M0). ` +
        `This invariant is registered but its feature does not exist yet; ` +
        `any claim that it holds is false until a real check passes ` +
        `(claim-to-test, CLAUDE.md §3). Source: ${source}`,
    );
    this.name = "InvariantStubError";
  }
}

/** Per-invariant row in the batch report (Doc 07 §3 `sim_report.invariant_results[]`). */
export interface InvariantResult {
  readonly id: string;
  readonly suite: Suite;
  readonly status: InvariantStatus;
  /**
   * - "STUB_FAIL_LOUD_VERIFIED": stub executed and threw as required — the
   *   only acceptable non-PASS state at M0 (explicit stub placeholder).
   * - "PASS" / "FAIL": implemented checks only.
   * - "STUB_SILENT" / "ERROR": harness defects — always batch-fatal.
   */
  readonly outcome: "STUB_FAIL_LOUD_VERIFIED" | "PASS" | "FAIL" | "STUB_SILENT" | "ERROR";
  readonly detail: string;
}

/** Machine-readable batch report (Sim §2/§5 skeleton; grows with real suites). */
export interface HarnessReport {
  readonly harness: "harbor-guardians sim-harness";
  readonly milestone: "M0" | "A0";
  readonly seed: number;
  readonly registry_counts: Readonly<Record<Suite, number>> & { readonly total?: never };
  readonly total_invariants: number;
  readonly seed_validation_gate: { readonly pass: boolean; readonly detail: string };
  readonly determinism_proof: { readonly pass: boolean; readonly detail: string };
  readonly persona_matrix_declared: readonly string[];
  readonly invariant_results: readonly InvariantResult[];
  readonly batch_green: boolean;
}
