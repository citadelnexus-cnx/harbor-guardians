/**
 * Invariant registry — every claim-to-test invariant ID, registered as an
 * addressable, FAIL-LOUD stub (M0 packet §8: "claimed but untested" must be
 * impossible). No gameplay logic lives here; feature PRs replace a stub's
 * check body and flip its status with evidence attached (CLAUDE.md §3).
 *
 * Implemented at M0 Step 7 (save/load skeleton): S5 + S7, at empty-shell
 * scope per the Sim §7 M0 exit gate ("S5/S7 pass on the empty shell");
 * proofs in src/save/proofs.ts.
 * Implemented at Alpha A1 (owner A1 authorization 2026-07-16 — Minimal
 * Harbor State and Resource Spine): DC1, DC4, DC5, DC6 (checks in
 * data-contract-checks.ts), and S5 extended with the stocked seeded-storage
 * round-trip.
 * Implemented at Alpha A2 (owner A2 authorization 2026-07-17 — Claim Ledger
 * and Reward Routing): L1, L5, L6, L7, L11, L14 at A2 scope (checks in
 * ledger-checks.ts — test-supplied packages only; no gameplay reward source
 * exists), S5 extended with the reward-bearing ledger round-trip, and S7
 * upgraded to crash-simulate over reward-bearing saves (the M0 "reward-
 * duplication portion is future" limitation is closed at A2 scope).
 * Everything else remains a fail-loud stub — every remaining invariant binds
 * to a system that does not exist at A2 (production, offline, raids, cargo,
 * inbox, grants, events), and converting any of them would claim untested
 * capability.
 *
 * Governing docs (statements condensed from, and audited against):
 *   - SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.1–§4.8 (E, L, M, C, CARGO, S, OPS, UX1)
 *   - SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15/§16 (S5/S7 checks)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §7 (DC1–DC6)
 *   - 05_THREAT_AND_RAID_DIRECTOR_FOUNDATION v0.1.3 §11 (TD1–TD4)
 *   - 06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 §9 (A11Y1–A11Y5)
 *   - 08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC v0.1.2 §8 (OB1–OB5)
 *   - 09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION v0.1.2 §8 (GEAR1–GEAR6)
 *   - 10_WORLD_ATLAS_FOUNDATION v0.2.1 §13 (W1–W9)
 *   - 11_FACTION_CODEX_FOUNDATION v0.1.2 §9 (FCT1–FCT8)
 *   - 12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9 (GDN1–GDN11)
 *   - 15_EVENT_SYSTEM_SPEC v0.2 §5 (EVT1–EVT10 — registered at Alpha A0 as
 *     fail-loud stubs only, per owner Alpha A0 authorization 2026-07-15;
 *     no event logic exists and none is authorized until A1)
 * Invariant refs: the registry itself IS the claim-to-test index (all suites).
 */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  proveCrashDuringWriteSurvival,
  proveEmptyStateRoundTrip,
  proveLedgerStateRoundTrip,
  proveStockedStateRoundTrip,
  type ProofResult,
} from "../src/save/proofs.js";
import { createSaveBlobValidator, type SaveBlobValidator } from "../src/save/save-blob-validator.js";
import {
  checkDc1NoMagicNumbers,
  checkDc4SeedMetadata,
  checkDc5ValidationGate,
  checkDc6CoreResourceOnly,
} from "./data-contract-checks.js";
import {
  checkL1TransferOnly,
  checkL5StoryClaimsProtected,
  checkL6PartialClaimExact,
  checkL7SlotAccounting,
  checkL11FullSlotSafety,
  checkL14PendingPersistence,
} from "./ledger-checks.js";
import { loadClaimLedgerRulesSeed } from "./ledger-rules-seed.js";
import { loadStorageSeed } from "./storage-seed.js";
import { InvariantStubError, type CheckVerdict, type InvariantEntry, type Suite } from "./types.js";

const SIM = "SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2";

/** Build a registered, addressable, fail-loud stub (M0 packet §8). */
function stub(id: string, suite: Suite, statement: string, source: string): InvariantEntry {
  return {
    id,
    suite,
    statement,
    source,
    status: "stub",
    blocking: true,
    check: () => {
      throw new InvariantStubError(id, source);
    },
  };
}

// ── Save/load checks (M0 Step 7) — S5/S7 implemented at empty-shell scope ────
// Sim §7 M0 exit gate: "S2/S5/S7 pass on the empty shell". The proofs live in
// src/save/proofs.ts (shared with tests/save-load.test.ts); each runs in a
// throwaway temp dir with deterministic evidence (no paths/wall-clock), so the
// batch repeat-run determinism proof holds over the results.
let saveBlobValidator: SaveBlobValidator | undefined;
function getSaveBlobValidator(): SaveBlobValidator {
  saveBlobValidator ??= createSaveBlobValidator();
  return saveBlobValidator;
}
function runSaveProof(proof: (dir: string, validate: SaveBlobValidator) => ProofResult): CheckVerdict {
  const validate = getSaveBlobValidator();
  const dir = mkdtempSync(join(tmpdir(), "hg-save-proof-"));
  try {
    const result = proof(dir, validate);
    return { pass: result.pass, evidence: result.detail };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** An invariant whose check is real and scoped to the M0 empty shell (Sim §7). */
function implemented(
  id: string,
  suite: Suite,
  statement: string,
  source: string,
  check: (ctx: { seed: number }) => CheckVerdict,
): InvariantEntry {
  return { id, suite, statement, source, status: "implemented", blocking: true, check };
}

/** Expected ID count per suite — the runner fails loud if the registry drifts. */
export const EXPECTED_SUITE_COUNTS: Readonly<Record<Suite, number>> = {
  E: 21,
  L: 15,
  M: 10,
  C: 8,
  CARGO: 5,
  S: 7,
  OPS: 1,
  UX: 1,
  DC: 6,
  TD: 4,
  A11Y: 5,
  OB: 5,
  GEAR: 6,
  W: 9,
  FCT: 8,
  GDN: 11,
  EVT: 10,
};

export const INVARIANT_REGISTRY: readonly InvariantEntry[] = [
  // ── Economy suite (E1–E21) — SIM spec §4.1 ────────────────────────────────
  stub("E1", "E", "No unbounded inflation: no spendable currency trends past parked-at-3S-Total across ST1→ST5.", `${SIM} §4.1`),
  stub("E2", "E", "Conversions strictly lossy: no sequence returns net ≥1.0× in any currency; all round-trips ≤0.60× (numeric proof).", `${SIM} §4.1`),
  stub("E3", "E", "Idle decay floors at soft-stall: an unmanaged run never goes negative and never loses workers.", `${SIM} §4.1`),
  stub("E4", "E", "Sink capacity ≥ faucet output at each tier.", `${SIM} §4.1`),
  stub("E5", "E", "Offline accrual respects cap: production stops at 3S Total; exposed surplus accrues offline only as production overflow, never reward duplication.", `${SIM} §4.1`),
  stub("E6", "E", "Merit and safe-stored Crowns are raid-immune; exposed Crown surplus is raidable.", `${SIM} §4.1`),
  stub("E7", "E", "Raid loss ≤ current exposed surplus of any core resource; safe storage untouchable.", `${SIM} §4.1`),
  stub("E8", "E", "Progression pacing within target band [UNKNOWN — measured at Milestone-0+, then enforced].", `${SIM} §4.1`),
  stub("E9", "E", "No soft-lock: insolvency always recovers with normal play.", `${SIM} §4.1`),
  stub("E10", "E", "Merit never purchasable (static + runtime check).", `${SIM} §4.1`),
  stub("E11", "E", "Tavern is not a faucet: Deepstakes expected gain below threshold; no Tavern route is the optimal ST1→ST5 path.", `${SIM} §4.1`),
  stub("E12", "E", "Raid warning fairness: no raid resolves without a visible Warning/preparation phase.", `${SIM} §4.1`),
  stub("E13", "E", "Failed-raid recoverability: no failed raid creates an unrecoverable state.", `${SIM} §4.1`),
  stub("E14", "E", "Structure damage bounded: repair cost after a failed raid cannot exceed the tier recovery budget.", `${SIM} §4.1`),
  stub("E15", "E", "Combat faucet dominance: expedition/raid rewards may spike but cannot dominate settlement production beyond allowed burst windows.", `${SIM} §4.1`),
  stub("E16", "E", "Guardian economy budget: no guardian exceeds the ST5 variance band without a documented tradeoff.", `${SIM} §4.1`),
  stub("E17", "E", "Tavern exploit: no Tavern strategy becomes the optimal economy path.", `${SIM} §4.1`),
  stub("E18", "E", "Hazard routes never strictly superior for all same-tier players.", `${SIM} §4.1`),
  stub("E19", "E", "Offline trust: return never auto-resolves hidden raids or applies hidden punitive loss.", `${SIM} §4.1`),
  stub("E20", "E", "Sink desirability: available sinks are rationally attractive to sim agents.", `${SIM} §4.1`),
  stub("E21", "E", "End-of-pulse display consistency: offline and online runs with the same seed and elapsed time produce the same final visible stock (online==offline, not stock==3S).", `${SIM} §4.1 + 01_ECONOMY_FOUNDATION v1.7 E21`),

  // ── Claim Ledger suite (L1–L15) — SIM spec §4.2 ───────────────────────────
  // L1/L5/L6/L7/L11/L14 converted stub → implemented at Alpha A2 (owner A2
  // authorization 2026-07-17); checks in ledger-checks.ts, exercising
  // test-supplied packages against the A1 harbor spine. The rest stay
  // fail-loud: L2 (no spend path exists at all to prove against), L3/L4/L8/L9
  // (raids + raid-phase claim matrix), L10 (no gameplay sources — the literal
  // test_supplied source_type is the A2 boundary), L12 (no repeatable
  // activity system), L13 (no grant path), L15 (no mandatory threat events).
  implemented(
    "L1",
    "L",
    "Ledger transfer-only: cannot increase resource totals.",
    `${SIM} §4.2 (A2 scope: route/claim conservation over test-supplied packages; gameplay sources FUTURE BUILD)`,
    () => checkL1TransferOnly(),
  ),
  stub("L2", "L", "Ledger not spendable directly: must claim into Harbor first.", `${SIM} §4.2`),
  stub("L3", "L", "Held rewards cannot be raided.", `${SIM} §4.2`),
  stub("L4", "L", "Claimed exposed resources can be raided.", `${SIM} §4.2`),
  implemented(
    "L5",
    "L",
    "Story Claims never disappear (survive raids, offline, save/load, long absence).",
    `${SIM} §4.2 (A2 scope: survive all A2 ledger ops + save/load; raid/offline survival lands with those systems)`,
    () => checkL5StoryClaimsProtected(getSaveBlobValidator()),
  ),
  implemented(
    "L6",
    "L",
    "Partial-claim math preserves totals exactly: claimed + held_remainder == original.",
    `${SIM} §4.2 + 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §7`,
    () => checkL6PartialClaimExact(),
  ),
  implemented(
    "L7",
    "L",
    "Multi-resource slot accounting correct (5 per resource + 20 global non-story).",
    `${SIM} §4.2 + 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §5 (caps from data/rewards/claim_ledger_rules.json — DC1)`,
    () => checkL7SlotAccounting(),
  ),
  stub("L8", "L", "No claim during raid Assault.", `${SIM} §4.2`),
  stub("L9", "L", "Claiming to Exposed during Warning raises the exposed-risk preview.", `${SIM} §4.2`),
  stub("L10", "L", "Ineligible sources never enter the Ledger (production/market/dock overflow, cargo, Merit, XP, Bond XP, Bond Charge, direct build/repair payments).", `${SIM} §4.2`),
  implemented(
    "L11",
    "L",
    "Full-slot delivery never deletes or duplicates a reward; unresolved pending rewards cannot be exploited as unlimited storage.",
    `${SIM} §4.2 + 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §10 (A2 scope: optional-activity block is FUTURE BUILD)`,
    () => checkL11FullSlotSafety(),
  ),
  stub("L12", "L", "Story Claims are finite, non-repeatable, non-compounding; cannot become repeatable protected storage.", `${SIM} §4.2`),
  stub("L13", "L", "v1 system grants exist only via an approved migration/recovery/test path (production build-flag guarded, see S6).", `${SIM} §4.2`),
  implemented(
    "L14",
    "L",
    "pending_reward_resolution persists across save/load and offline exactly as generated (no loss, duplication, or reroll); blocking locks only new optional reward generation.",
    `${SIM} §4.2 + SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §11 (A2 scope: save/load persistence; offline + activity-block land with those systems)`,
    () => checkL14PendingPersistence(getSaveBlobValidator()),
  ),
  stub("L15", "L", "Pending rewards cannot freeze mandatory threat resolution; required defensive/story-critical events resolve and may themselves enter pending resolution.", `${SIM} §4.2`),

  // ── Messages suite (M1–M10) — SIM spec §4.3 ───────────────────────────────
  stub("M1", "M", "Messages cannot contain resource amounts or spendable resources directly.", `${SIM} §4.3`),
  stub("M2", "M", "Archiving/deleting a message cannot delete a Claim Ledger package.", `${SIM} §4.3`),
  stub("M3", "M", "A system grant creates exactly one Claim Ledger package and one referencing message; no duplicate grants.", `${SIM} §4.3`),
  stub("M4", "M", "The Offline Return Report message is generated after offline reconciliation and matches the ledger/report record.", `${SIM} §4.3`),
  stub("M5", "M", "A Raid Warning message appears before Assault eligibility; no hidden raid warning.", `${SIM} §4.3`),
  stub("M6", "M", "A Migration Notice persists after save-schema migration and names the migrated systems.", `${SIM} §4.3`),
  stub("M7", "M", "Critical messages persist until acknowledged; low-priority may archive only after read.", `${SIM} §4.3`),
  stub("M8", "M", "System Inbox save/load round-trip preserves read/archive state and related package links.", `${SIM} §4.3`),
  stub("M9", "M", "Authoritative-report boundary: economic truth is read from the referenced ledger/report record, never the message body; discrepancies resolve in favor of the record and are flagged.", `${SIM} §4.3`),
  stub("M10", "M", "Retention/compaction never deletes an unacknowledged critical/high message, a permanent Migration Notice, or a live package_id link; compaction only collapses read low/normal messages.", `${SIM} §4.3`),

  // ── Combat suite (C1–C8) — SIM spec §4.4 ──────────────────────────────────
  stub("C1", "C", "Base-progress-without-timing: a zero-timing run completes the reference expedition set.", `${SIM} §4.4`),
  stub("C2", "C", "Assist parity: assist-mode clear rates within the approved band of manual play.", `${SIM} §4.4`),
  stub("C3", "C", "Guardian Surge uptime bounded (duration/cooldown honored).", `${SIM} §4.4`),
  stub("C4", "C", "Bond Charge source diversity: no single source exceeds the dominance threshold.", `${SIM} §4.4`),
  stub("C5", "C", "Mobile input pass: touch-target and window minimums met.", `${SIM} §4.4`),
  stub("C6", "C", "Training mode exists before balance tuning.", `${SIM} §4.4`),
  stub("C7", "C", "Input-latency calibration exists before any public playable claim.", `${SIM} §4.4`),
  stub("C8", "C", "Combat suspend/resume cannot duplicate rewards, reroll loot, or convert Bond Charge into economy resources.", `${SIM} §4.4`),

  // ── Cargo suite (CARGO1–CARGO5) — SIM spec §4.5 (04B v0.1.2) ─────────────
  stub("CARGO1", "CARGO", "Physical cargo never enters the Claim Ledger; once a line is routed to Ship Hold / Docked Cargo it cannot later be converted or re-routed into the Ledger.", `${SIM} §4.5 (04B v0.1.2)`),
  stub("CARGO2", "CARGO", "Every expedition reward line declares exactly one route at generation time (Claim Ledger / Story Claim / Ship Hold–Docked Cargo / Gear Locker / Auto-Receipt); a physical-cargo line stays physical until unloaded, lost by governed rule, or resolved via Docked Cargo.", `${SIM} §4.5 (04B v0.1.2)`),
  stub("CARGO3", "CARGO", "Loot exceeding hold capacity is left at source, never silently stored and never Ledger-routed.", `${SIM} §4.5 (04B v0.1.2)`),
  stub("CARGO4", "CARGO", "Docked Cargo obeys exposed-surplus raid/spoilage/leak rules; unloading obeys Safe/Exposed/Total 3S; partial unload preserves totals (unloaded + left_on_dock == arrived).", `${SIM} §4.5 (04B v0.1.2)`),
  stub("CARGO5", "CARGO", "No hidden cargo loss: every spoilage/leak/raid/left-behind event is ledger-logged; the pressure timer only moves cargo to Needs Resolution and never hard-deletes cargo.", `${SIM} §4.5 (04B v0.1.2)`),

  // ── Trust & safety suite (S1–S7) — SIM spec §4.6 ──────────────────────────
  stub("S1", "S", "Ledger completeness: every economic delta has a world-clock-stamped ledger entry.", `${SIM} §4.6`),
  stub("S2", "S", "No network calls on launch/save/load with network disabled.", `${SIM} §4.6`),
  stub("S3", "S", "Static scan: no monetization hooks, no paid-power config paths.", `${SIM} §4.6`),
  stub("S4", "S", "Accessibility settings persist and apply from the first prototype.", `${SIM} §4.6`),
  implemented(
    "S5",
    "S",
    "Save/load round-trip preserves world clock, storage states (incl. Crowns), threat phase, queues, Claim Ledger (incl. Story Claims, partial remainders, pending_reward_resolution), System Inbox, and combat suspend snapshot if present.",
    `${SIM} §4.6 + SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §16 (M0: empty shell; A1: + stocked 3S bands; A2: + Claim Ledger/Story Claims/pending)`,
    () => {
      const empty = runSaveProof(proveEmptyStateRoundTrip);
      if (!empty.pass) return empty;
      const stocked = runSaveProof((dir, validate) => proveStockedStateRoundTrip(dir, validate, loadStorageSeed()));
      if (!stocked.pass) return stocked;
      const ledger = runSaveProof((dir, validate) =>
        proveLedgerStateRoundTrip(dir, validate, loadStorageSeed(), loadClaimLedgerRulesSeed()),
      );
      if (!ledger.pass) return ledger;
      return {
        pass: true,
        evidence: `[empty shell] ${empty.evidence} [A1 stocked state] ${stocked.evidence} [A2 ledger state] ${ledger.evidence}`,
      };
    },
  ),
  stub("S6", "S", "Production build-flag guard: system-grant code paths are compiled out/disabled in production except approved migration/recovery paths; no dev/debug grant path is reachable.", `${SIM} §4.6`),
  implemented(
    "S7",
    "S",
    "Atomic save integrity: temp write → schema validate → flush → rename/swap → preserve prior good save; a simulated crash never corrupts the last known-good save and never duplicates rewards.",
    `${SIM} §4.6 + SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15 (A2: crash simulation over reward-bearing saves — no reward duplication)`,
    () =>
      runSaveProof((dir, validate) =>
        proveCrashDuringWriteSurvival(dir, validate, loadStorageSeed(), loadClaimLedgerRulesSeed()),
      ),
  ),

  // ── Operations suite (OPS1) — SIM spec §4.7 ───────────────────────────────
  stub("OPS1", "OPS", "Cancel/refund routing: refunds return directly to Harbor stock (Safe→Exposed), obey Total 3S, never enter the Claim Ledger, never exceed 3S (cancellation blocks by default if it would), never silently deleted.", `${SIM} §4.7`),

  // ── UX invariant (UX1) — SIM spec §4.8 ────────────────────────────────────
  stub("UX1", "UX", "The System Inbox never transfers resources directly; message actions are Read / Acknowledge / Archive / View Reward Package; only Claim Ledger packages expose Claim; no inbox action mutates a resource total.", `${SIM} §4.8`),

  // ── Data contracts (DC1–DC6) — Doc 07 v0.1.2 §7 ───────────────────────────
  // DC1/DC4/DC5/DC6 converted stub → implemented at Alpha A1 (owner A1
  // authorization 2026-07-16); checks in data-contract-checks.ts. DC2/DC3
  // stay fail-loud: combat reward lines and message↔package links do not
  // exist, and converting them would claim untested capability (CLAUDE.md §3).
  implemented(
    "DC1",
    "DC",
    "Every gameplay number resolves to a schema-validated seed field (No Magic Numbers).",
    "07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §7 (A1 scope: sim-core literal scan + harbor spine seed binding)",
    () => checkDc1NoMagicNumbers(),
  ),
  stub("DC2", "DC", "Every combat_reward_line declares exactly one RewardRoute (mirrors CARGO2).", "07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §7"),
  stub("DC3", "DC", "Referential integrity holds for message↔package↔pending links.", "07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §7"),
  implemented(
    "DC4",
    "DC",
    "Every seed value carries the full unit-requirement metadata (id · unit · gate · source-section · invariant-refs).",
    "07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §7 (A1: enforced across all committed seed sets)",
    () => checkDc4SeedMetadata(),
  ),
  implemented(
    "DC5",
    "DC",
    "An unversioned or invalid schema blocks CI.",
    "07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §7 (A1: executes the CI gate + drift guard + negative fixtures)",
    () => checkDc5ValidationGate(),
  ),
  implemented(
    "DC6",
    "DC",
    "storage_state, exposed-surplus, cargo, and raid-loss fields type against CoreResource only; a schema admitting Merit or receipt metrics into those fields fails validation.",
    "07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §7 (A1 scope: storage/exposure fields; cargo/raid-loss are FUTURE BUILD)",
    () => checkDc6CoreResourceOnly(),
  ),

  // ── Threat director (TD1–TD4) — Doc 05 v0.1.3 §11 ─────────────────────────
  stub("TD1", "TD", "Threat advance is deterministic under a seed.", "05_THREAT_AND_RAID_DIRECTOR_FOUNDATION v0.1.3 §11"),
  stub("TD2", "TD", "Warning duration ≥ the tuned fairness floor for every raid type.", "05_THREAT_AND_RAID_DIRECTOR_FOUNDATION v0.1.3 §11"),
  stub("TD3", "TD", "Every realized loss/damage event is ledger-logged (no hidden loss).", "05_THREAT_AND_RAID_DIRECTOR_FOUNDATION v0.1.3 §11"),
  stub("TD4", "TD", "Reduction levers measurably lower realized severity in sim.", "05_THREAT_AND_RAID_DIRECTOR_FOUNDATION v0.1.3 §11"),

  // ── Accessibility (A11Y1–A11Y5) — Doc 06 v0.1.2 §9 ────────────────────────
  stub("A11Y1", "A11Y", "No critical cue is color-only or audio-only (automated audit).", "06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 §9"),
  stub("A11Y2", "A11Y", "Every timing feature has a shipping assist path in the same build (build-time check).", "06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 §9"),
  stub("A11Y3", "A11Y", "Latency offset is applied in window evaluation (unit test across simulated latencies).", "06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 §9"),
  stub("A11Y4", "A11Y", "Every interactive control ≥ 24×24 CSS px; primary touch controls 44–48 (automated layout audit; D27).", "06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 §9"),
  stub("A11Y5", "A11Y", "No action reachable only via a single hardcoded key path — every action remappable or with an alternate input path (input-map audit; D28).", "06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC v0.1.2 §9"),

  // ── Onboarding (OB1–OB5) — Doc 08 v0.1.2 §8 ───────────────────────────────
  stub("OB1", "OB", "The emergency ration grant fires at most once per world (save/load-safe).", "08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC v0.1.2 §8"),
  stub("OB2", "OB", "A first-hour playthrough reaches a visible advancement within the session-contract window in sim/playtest.", "08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC v0.1.2 §8"),
  stub("OB3", "OB", "No onboarding prompt blocks exploration or applies a countdown.", "08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC v0.1.2 §8"),
  stub("OB4", "OB", "First-hour raid severity floor is capped (no first-hour wipe).", "08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC v0.1.2 §8"),
  stub("OB5", "OB", "Every selectable creation-screen guardian has a complete honest summary and no guardian is strictly dominated within its difficulty tag — no trap picks (D31).", "08_FIRST_HOUR_ONBOARDING_AND_SAFETY_SPEC v0.1.2 §8"),

  // ── Gear (GEAR1–GEAR6) — Doc 09 v0.1.2 §8 ─────────────────────────────────
  stub("GEAR1", "GEAR", "Gear never enters resource storage or ship cargo; it is slot-bound, not 3S-bound.", "09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION v0.1.2 §8"),
  stub("GEAR2", "GEAR", "Gear delivers only on claim of its Claim Ledger package; over-capacity gear uses persistent pending resolution and is never silently deleted (D30).", "09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION v0.1.2 §8"),
  stub("GEAR3", "GEAR", "No gear roll can be re-rolled by save/load (seed-derived).", "09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION v0.1.2 §8"),
  stub("GEAR4", "GEAR", "No pay-to-power path exists (static scan, mirrors S3); gear power stays within the bounded budget.", "09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION v0.1.2 §8"),
  stub("GEAR5", "GEAR", "Salvage is strictly lossy/dead-end and cannot form an inflationary loop (numeric check, mirrors E2).", "09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION v0.1.2 §8"),
  stub("GEAR6", "GEAR", "Craft/enchant/salvage anti-loop: expected salvage value < total craft+enchant input value for any item; no seed makes the loop non-lossy (D29).", "09_GEAR_LOCKER_AND_ITEM_REWARD_FOUNDATION v0.1.2 §8"),

  // ── World Atlas (W1–W9) — Doc 10 v0.2.1 §13 ───────────────────────────────
  stub("W1", "W", "Each route declares exactly one integer regions_crossed in 0–5; class ranges do not overlap; the value is a seeded route property used verbatim by the rations formula.", "10_WORLD_ATLAS_FOUNDATION v0.2.1 §13"),
  stub("W2", "W", "The graph is connected from the Player Harbor for the intended ship-tier progression (no unreachable required content at the tier that needs it).", "10_WORLD_ATLAS_FOUNDATION v0.2.1 §13"),
  stub("W3", "W", "Every region contains ≥1 Drowned Harbor and its regional_threat resolves against a real node.", "10_WORLD_ATLAS_FOUNDATION v0.2.1 §13"),
  stub("W4", "W", "Ship range gates route traversability by the route's declared min_ship_tier (validated against the declaration, not the class-table label).", "10_WORLD_ATLAS_FOUNDATION v0.2.1 §13"),
  stub("W5", "W", "Discovery/fog state persists and never regresses (no lost exploration).", "10_WORLD_ATLAS_FOUNDATION v0.2.1 §13"),
  stub("W6", "W", "Hazard-route ambush/threat interactions honor Economy §11 + Doc 05 (no hidden loss; ambush never permanently locks travel).", "10_WORLD_ATLAS_FOUNDATION v0.2.1 §13"),
  stub("W7", "W", "At most one active Drowned-driven Assault region at a time in v1 (D36); the active_assault_region pointer is single-valued.", "10_WORLD_ATLAS_FOUNDATION v0.2.1 §13"),
  stub("W8", "W", "A successful Drowned Harbor expedition applies the D37 strong-partial-reset to that region's regional_threat; the change is ledger-logged.", "10_WORLD_ATLAS_FOUNDATION v0.2.1 §13"),
  stub("W9", "W", "Cargo routing at any harbor obeys CARGO1/CARGO2; dock-state never converts cargo to a claim.", "10_WORLD_ATLAS_FOUNDATION v0.2.1 §13"),

  // ── Faction Codex (FCT1–FCT8) — Doc 11 v0.1.2 §9 ──────────────────────────
  stub("FCT1", "FCT", "Per-faction Merit is soulbound: never purchasable, never raidable, never spent; standing unlocks operational support/access only, never stat power.", "11_FACTION_CODEX_FOUNDATION v0.1.2 §9"),
  stub("FCT2", "FCT", "At most the v1 cap of active supports at once (target 2 total across raid-support and route-support; F-D5); no blanket suppression of all pressure types.", "11_FACTION_CODEX_FOUNDATION v0.1.2 §9"),
  stub("FCT3", "FCT", "A support reduces but never eliminates its target pressure; strength bounded by Merit tier and capped.", "11_FACTION_CODEX_FOUNDATION v0.1.2 §9"),
  stub("FCT4", "FCT", "Rival tension applies only the defined −25% future-gain modifier, never retroactive, never below zero; rival pairs come from the data seed.", "11_FACTION_CODEX_FOUNDATION v0.1.2 §9"),
  stub("FCT5", "FCT", "All faction contract/quest resource rewards deliver via the Claim Ledger; Merit via auto-receipt; salvage via Docked Cargo — no faction reward bypasses these routes.", "11_FACTION_CODEX_FOUNDATION v0.1.2 §9"),
  stub("FCT6", "FCT", "Faction capitals are never raid sources and never gate required progression behind distance.", "11_FACTION_CODEX_FOUNDATION v0.1.2 §9"),
  stub("FCT7", "FCT", "Support type is explicit (raid_support or route_support); a support cannot grant immunity, bypass gates/rations/cargo risk, or suppress all categories at once; both types count against the shared cap (F-D3).", "11_FACTION_CODEX_FOUNDATION v0.1.2 §9"),
  stub("FCT8", "FCT", "Rival slow capped at −25% future gain per affected faction; multiple rival relationships do not stack — only the strongest active rival slow applies (F-D4).", "11_FACTION_CODEX_FOUNDATION v0.1.2 §9"),

  // ── Guardian Sanctum & Kit (GDN1–GDN11) — Doc 12 v0.1.2 §9 ────────────────
  stub("GDN1", "GDN", "Every guardian is fully data-seeded (kit sheet); no guardian behavior hard-coded outside approved data/config (mirrors DC1).", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN2", "GDN", "Every guardian clears all required content with base attacks only (zero-timing viability; mirrors C1).", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN3", "GDN", "Guardian Surge is battle-earned only — never charged from the Claim Ledger or any economy resource (D6); bounded duration/recharge (C3).", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN4", "GDN", "Median ST5 completion variance across guardians ≤ 0.15; any guardian above the 0.20 threshold carries a documented tradeoff (mirrors E16).", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN5", "GDN", "No guardian is strictly dominated within its difficulty tag (no trap picks; mirrors OB5) and none grants raw stat superiority (sidegrade only).", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN6", "GDN", "The Rite of the Changing Tide is a real sink, never mints/refunds/duplicates rewards, and preserves soulbound Merit + Story Claims.", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN7", "GDN", "All Surge/guardian assets carry original-motif provenance; a failed provenance entry blocks the asset.", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN8", "GDN", "Assist tiers reach comparable Surge/Bond-Charge outcomes for every guardian (mirrors C2/C4); cues are shape+icon+text.", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN9", "GDN", "The Rite state transition is atomic: prior guardian preserved as dormant, new active applied in one committed step, no duplication; a failed/interrupted Rite leaves the prior guardian active.", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN10", "GDN", "Persistent guardian bond state and combat-only state are separate save blocks; save/load cannot convert one into the other (combat-only persists only inside a turn-boundary suspend snapshot, D16/C8).", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),
  stub("GDN11", "GDN", "Guardian kits cannot create new resource sources; any reward modifier attaches to an existing approved event/source and stays within the sidegrade budget — no kit is a hidden faucet.", "12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §9"),

  // ── Event System (EVT1–EVT10) — 15_EVENT_SYSTEM_SPEC v0.2 §5 ──────────────
  // Registered at Alpha A0 (owner authorization 2026-07-15) as fail-loud stubs
  // only. No event lifecycle logic exists; none is authorized before A1.
  stub("EVT1", "EVT", "Every event is pure data validated against schema; no event hard-codes gameplay numbers.", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
  stub("EVT2", "EVT", "The lifecycle state machine is deterministic: same state + seed ⇒ same transition.", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
  stub("EVT3", "EVT", "Events are save-atomic: an event mid-flight persists and resumes exactly once; never duplicates or drops effects across save/load (S7).", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
  stub("EVT4", "EVT", "Trigger conditions reference only observable state; no hidden-information gating (player-trust / OB5).", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
  stub("EVT5", "EVT", "Every reward effect routes through the Claim Ledger; no event grants resources ambiently (L-suite).", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
  stub("EVT6", "EVT", "No event creates a new resource source; economy effects bind to an existing source/sink/event_id (E15/GDN11).", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
  stub("EVT7", "EVT", "Expiry/decline is fair: the player was warned within a foreseeable window before any loss (D35/D32).", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
  stub("EVT8", "EVT", "No event causes hidden loss; all losses are shown, attributable, and within the loss boundaries defined by Economy (E12/E13), Claim Ledger (L-suite), Cargo (CARGO-suite), Threat Director (TD-suite), and Save/Load (S7) doctrine.", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
  stub("EVT9", "EVT", "Raids (TD) validate as conformant threat-class events — the framework does not break the proven raid implementation.", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
  stub("EVT10", "EVT", "Multi-step chains advance atomically; a chain cannot double-grant or skip a step across save/load.", "15_EVENT_SYSTEM_SPEC v0.2 §5"),
];

/** Addressable lookup (M0 packet §8: every ID is addressable). */
export function findInvariant(id: string): InvariantEntry | undefined {
  return INVARIANT_REGISTRY.find((e) => e.id.toUpperCase() === id.toUpperCase());
}
