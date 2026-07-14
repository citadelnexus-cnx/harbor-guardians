/**
 * Persona matrix hooks — the harness-side declaration of the player personas
 * every economy batch must run, so parity invariants (C2/GDN8) are testable
 * when the sim core exists.
 *
 * Governing docs:
 *   - SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §3 (persona matrix; Offline Returner
 *     windows 8h/24h/72h; Guardian Bias Runs one per guardian)
 *   - 06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 + D38 (assist tiers:
 *     Assisted default, Precise opt-in — the assist-tier vs precision axis)
 *   - M0 packet §8 ("Persona matrix: the harness runs the spec's player
 *     personas … so parity invariants (C2/GDN8) are testable")
 * Invariant refs: C2, GDN8 (parity across timing profiles); E-suite consumers.
 *
 * M0 state: HOOKS ONLY. No persona has a behavior model yet — `run` is
 * undefined on every entry, and the runner refuses to execute a persona
 * without one (fail-loud, same doctrine as invariant stubs).
 */

import { readdirSync } from "node:fs";

/**
 * Timing-profile axis (Doc 06 / D38): every persona batch runs under both
 * profiles so C2/GDN8 assist-parity can compare like-for-like. Assisted is
 * the shipped default (D38).
 */
export const TIMING_PROFILES = ["assisted", "precise"] as const;
export type TimingProfile = (typeof TIMING_PROFILES)[number];

/** A persona's future behavior model — absent at M0 (hook only). */
export type PersonaRun = (seed: number, timingProfile: TimingProfile) => unknown;

export interface PersonaSpec {
  readonly id: string;
  /** What this persona probes, per Sim spec §3. */
  readonly probes: string;
  /**
   * Parameter axis, if the spec defines one (e.g. offline windows in hours,
   * or one run per guardian seed id). Test-spec parameters from Sim §3 —
   * not gameplay numbers (those live in /data).
   */
  readonly parameters?: readonly string[];
  /** Behavior model hook — undefined at M0; executing without one fails loud. */
  readonly run?: PersonaRun;
}

/** Sim spec §3 Offline Returner windows (test-spec parameters, hours). */
export const OFFLINE_RETURNER_WINDOWS_HOURS = [8, 24, 72] as const;

/**
 * Guardian Bias Runs are parameterized one-per-guardian from the validated
 * /data/guardians seeds (Sim §3: "one per guardian, all 20"; at M0 the six
 * Step-5 seed guardians are the roster). Negative fixtures are excluded.
 */
export function guardianBiasParameters(dataDir = "data/guardians"): string[] {
  return readdirSync(dataDir)
    .filter((f) => f.endsWith(".json") && !f.endsWith(".invalid.json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

/** The Sim spec §3 persona matrix, declared as addressable hooks. */
export function buildPersonaMatrix(): readonly PersonaSpec[] {
  return [
    { id: "casual_collector", probes: "baseline low-intensity economy pacing" },
    { id: "hoarder", probes: "3S caps, parked-stock behavior (E1/E5)" },
    { id: "spender", probes: "sink capacity and desirability (E4/E20)" },
    { id: "defender", probes: "raid preparation and loss bounds (E7/E12–E14)" },
    { id: "explorer", probes: "route/hazard economy and world traversal (E18, W-suite)" },
    { id: "trader", probes: "conversion lossiness and market routes (E2)" },
    { id: "tavern_grinder", probes: "Tavern faucet and exploit paths (E11/E17)" },
    { id: "insolvent", probes: "soft-stall floor and recovery (E3/E9)" },
    {
      id: "guardian_bias_run",
      probes: "per-guardian economy/variance parity (E16, GDN4/GDN5)",
      parameters: guardianBiasParameters(),
    },
    {
      id: "offline_returner",
      probes: "offline reconciliation fairness (E5/E19/E21)",
      parameters: OFFLINE_RETURNER_WINDOWS_HOURS.map((h) => `${h}h`),
    },
    { id: "claim_hoarder", probes: "Ledger caps + pending state (L7/L11/L14)" },
    { id: "message_hoarder", probes: "inbox↔ledger separation + retention/compaction (M-suite)" },
  ];
}
