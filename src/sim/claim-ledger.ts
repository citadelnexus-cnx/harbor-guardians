/**
 * Claim Ledger / reward-routing spine — Alpha A2 "Claim Ledger and Reward
 * Routing" (owner Alpha A2 authorization, 2026-07-17). Pure, deterministic,
 * headless: no I/O, no RNG, no wall-clock — every function maps inputs to
 * outputs so the sim harness replays it byte-identically (Sim §2).
 *
 * What this is: the minimal spine proving earned rewards can be represented,
 * routed, partially claimed, blocked safely at capacity, and preserved
 * without hidden loss:
 *   - Test-supplied reward packages route per line (CARGO2/D24: one line,
 *     one route). `claim_ledger` lines become a held LedgerPackage;
 *     `story_claim` lines become a protected StoryClaim. The cargo / gear /
 *     auto-receipt routes are structurally present but BLOCKED — routing
 *     them fails loud (their systems are FUTURE BUILD).
 *   - Slot accounting (Doc 04 §5, L7) reads its caps ENTIRELY from the
 *     schema-validated /data/rewards seed (No Magic Numbers, DC1 — the only
 *     numeric literal in this file is the identity 0). A delivery that would
 *     breach a cap becomes a persistent PendingRewardResolution (Doc 04 §10,
 *     D14/D19, L11): never deleted, never duplicated, not in the Ledger.
 *   - Partial claim (Doc 04 §7, L6) transfers into the A1 harbor spine via
 *     `deposit` (fill Safe → Exposed → 3S hard stop); every mode preserves
 *     `claimed + held_remainder == original` exactly — remainders are held,
 *     never dropped (no hidden loss, CLAUDE.md §5).
 *
 * What this is NOT (A2 boundary): no gameplay reward source (nothing in the
 * game mints drafts — tests/harness supply them), no raid-phase claim matrix
 * (L8/L9 fail-loud), no story-claim harbor transfer, no system grants, no
 * inbox notices, no expiry, no A3+. Those are FUTURE BUILD; their invariants
 * remain fail-loud stubs.
 *
 * Governing docs:
 *   - 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §1 (transfer valve), §5 (slot
 *     accounting), §6/§11 (Story Claims protected/separate), §7 (partial
 *     claim), §10 (pending resolution)
 *   - 01_ECONOMY_FOUNDATION v1.7 §10 (Ledger summary; claiming obeys 3S)
 *   - SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §10/§11 (persistence rules)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §2 (RewardRoute), §3
 *   - 00_DECISION_REGISTER D14/D15/D19/D20/D24/D26
 * Invariant refs: L1 (transfer-only), L5 (story protection, A2 scope), L6
 * (partial-claim exactness), L7 (slot accounting), L11 (full-slot no
 * delete/duplicate), L14 (pending preserved); feeds S5/S7 via the save blob.
 */

import type {
  ClaimLedgerState,
  LedgerPackage,
  PendingRewardResolution,
  RewardPackageContents,
  RewardPackageDraft,
  RewardResources,
  StoryClaim,
} from "../contracts/claim-ledger.js";
import type { ClaimLedgerRules } from "../contracts/claim-ledger-rules.js";
import type { CoreResource, RewardRoute } from "../contracts/enums.js";
import { CORE_RESOURCES, deposit, type HarborState } from "./harbor-state.js";

/** Thrown when an operation would violate Claim Ledger doctrine (Doc 04) or lose/duplicate value. */
export class ClaimLedgerInvariantError extends Error {
  constructor(detail: string) {
    super(`claim ledger invariant violated: ${detail}`);
    this.name = "ClaimLedgerInvariantError";
  }
}

/**
 * Thrown when a reward line declares a route whose delivery system is FUTURE
 * BUILD (ship_hold_docked_cargo / gear_locker / auto_receipt at A2). Fail-loud
 * by design: a blocked route can never silently drop or re-route a reward
 * (CARGO1/CARGO2 doctrine; CLAUDE.md §3 — no claimed-but-untested capability).
 */
export class RewardRouteNotImplementedError extends Error {
  constructor(readonly route: RewardRoute, lineId: string) {
    super(
      `reward route "${route}" (line ${lineId}) is FUTURE BUILD at Alpha A2 — ` +
        `no delivery system exists for it; routing fails loud instead of dropping or re-routing the line ` +
        `(CARGO2 single-route doctrine; CLAUDE.md §3)`,
    );
    this.name = "RewardRouteNotImplementedError";
  }
}

/** The routes with an implemented delivery at A2. */
const IMPLEMENTED_ROUTES: readonly RewardRoute[] = ["claim_ledger", "story_claim"];

/** Empty ledger state (world-creation identity — no packages, no story claims). */
export function createClaimLedgerState(): ClaimLedgerState {
  return { packages: [], story_claims: [] };
}

function assertPositiveFiniteAmount(label: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ClaimLedgerInvariantError(`${label} must be a finite positive amount, got ${value}`);
  }
}

/** Deterministic canonical iteration over a RewardResources map (CORE_RESOURCES order). */
function resourceEntries(resources: RewardResources): Array<[CoreResource, number]> {
  const entries: Array<[CoreResource, number]> = [];
  for (const resource of CORE_RESOURCES) {
    const amount = resources[resource];
    if (amount !== undefined) entries.push([resource, amount]);
  }
  return entries;
}

/** Sum of all amounts in a RewardResources map. */
export function totalRewardAmount(resources: RewardResources): number {
  let total = 0;
  for (const [, amount] of resourceEntries(resources)) total += amount;
  return total;
}

/** Empty contents envelope (flags/cosmetics/gear_refs schema-enforced empty at A2). */
function contentsOf(resources: RewardResources): RewardPackageContents {
  return { resources, flags: [], cosmetics: [], gear_refs: [] };
}

/** Every id currently occupied across ledger packages, story claims, and pending records. */
function occupiedIds(ledger: ClaimLedgerState, pending: readonly PendingRewardResolution[]): Set<string> {
  const ids = new Set<string>();
  for (const p of ledger.packages) ids.add(p.package_id);
  for (const s of ledger.story_claims) ids.add(s.claim_id);
  for (const r of pending) ids.add(r.pending_id);
  return ids;
}

/**
 * Doc 04 §5 slot occupancy: per-resource = unclaimed non-story packages still
 * holding that resource (one slot per contained resource); global = active
 * non-story packages. Story Claims never count (§5/§6). Pending records are
 * NOT in the Ledger and occupy no slots — but they are also not storage
 * (L11: not spendable, not claimable, resolvable only back into the Ledger).
 */
export function slotOccupancy(ledger: ClaimLedgerState): {
  per_resource: Record<CoreResource, number>;
  global: number;
} {
  const per = {} as Record<CoreResource, number>;
  for (const resource of CORE_RESOURCES) {
    per[resource] = ledger.packages.filter((p) => (p.held_remainder[resource] ?? 0) > 0).length;
  }
  return { per_resource: per, global: ledger.packages.length };
}

/**
 * The slot categories a candidate resource set would breach, in deterministic
 * order (global first, then CORE_RESOURCES order). Empty array = deliverable.
 */
function blockedSlots(
  ledger: ClaimLedgerState,
  resources: RewardResources,
  rules: ClaimLedgerRules,
): string[] {
  const occupancy = slotOccupancy(ledger);
  const blocked: string[] = [];
  if (occupancy.global >= rules.max_global_active_packages) {
    blocked.push("global_cap");
  }
  for (const [resource] of resourceEntries(resources)) {
    if (occupancy.per_resource[resource] >= rules.max_unclaimed_packages_per_resource) {
      blocked.push(`per_resource_cap:${resource}`);
    }
  }
  return blocked;
}

/** Outcome of routing one draft — full accounting of where every line went (no hidden loss). */
export interface RoutingResult {
  readonly ledger: ClaimLedgerState;
  readonly pending: readonly PendingRewardResolution[];
  /** How the claim_ledger-routed portion was delivered ("none" when the draft had no ledger lines). */
  readonly ledger_delivery: "delivered" | "held_pending" | "none";
  /** The Doc 04 §10 blocking reason when ledger_delivery is "held_pending". */
  readonly blocking_reason?: string;
  /** claim_id of the StoryClaim created from story_claim-routed lines, if any. */
  readonly story_claim_id?: string;
}

/**
 * Route a test-supplied reward package draft (Doc 04 §2–§5, §10; D20/D24).
 * Deterministic; pure. Per line: `claim_ledger` lines aggregate into one held
 * LedgerPackage (or one PendingRewardResolution when a slot cap blocks —
 * the event still completes, nothing is deleted); `story_claim` lines
 * aggregate into one protected StoryClaim (never capped, never counted);
 * any other route fails loud (FUTURE BUILD). Duplicate package ids are
 * rejected outright — a package can never be delivered twice (no
 * duplication, L11).
 */
export function routeRewardPackage(
  ledger: ClaimLedgerState,
  pending: readonly PendingRewardResolution[],
  draft: RewardPackageDraft,
  rules: ClaimLedgerRules,
): RoutingResult {
  // Identity: one delivery per package_id, ever (L11 no-duplication).
  const ids = occupiedIds(ledger, pending);
  const storyClaimId = `${draft.package_id}.story`;
  if (ids.has(draft.package_id) || ids.has(storyClaimId)) {
    throw new ClaimLedgerInvariantError(
      `package_id "${draft.package_id}" already delivered (ledger, story, or pending) — a reward can never be duplicated (L11)`,
    );
  }

  // Validate lines: unique line ids, positive finite amounts, known routes.
  const lineIds = new Set<string>();
  for (const line of draft.lines) {
    if (lineIds.has(line.line_id)) {
      throw new ClaimLedgerInvariantError(`duplicate line_id "${line.line_id}" in package "${draft.package_id}"`);
    }
    lineIds.add(line.line_id);
    assertPositiveFiniteAmount(`line ${line.line_id} amount`, line.amount);
    if (!IMPLEMENTED_ROUTES.includes(line.route)) {
      throw new RewardRouteNotImplementedError(line.route, line.line_id);
    }
  }
  if (draft.lines.length === 0) {
    throw new ClaimLedgerInvariantError(`package "${draft.package_id}" has no reward lines — nothing to route`);
  }

  // Aggregate per route (one line one route — CARGO2/D24; amounts sum per resource).
  const ledgerResources: RewardResources = {};
  const storyResources: RewardResources = {};
  for (const line of draft.lines) {
    const target = line.route === "claim_ledger" ? ledgerResources : storyResources;
    target[line.resource] = (target[line.resource] ?? 0) + line.amount;
  }

  // Story portion: protected, never capped, never counted (Doc 04 §5/§6, D15).
  let nextStoryClaims = ledger.story_claims;
  let storyId: string | undefined;
  if (resourceEntries(storyResources).length > 0) {
    const story: StoryClaim = {
      claim_id: storyClaimId,
      source_type: draft.source_type,
      contents: contentsOf(storyResources),
      created_world_clock: draft.created_world_clock,
      is_story: true,
    };
    nextStoryClaims = [...ledger.story_claims, story];
    storyId = story.claim_id;
  }

  // Ledger portion: deliver, or hold as persistent pending when a cap blocks (Doc 04 §10).
  if (resourceEntries(ledgerResources).length === 0) {
    return {
      ledger: { packages: ledger.packages, story_claims: nextStoryClaims },
      pending,
      ledger_delivery: "none",
      ...(storyId !== undefined ? { story_claim_id: storyId } : {}),
    };
  }

  const blocked = blockedSlots(ledger, ledgerResources, rules);
  if (blocked.length > 0) {
    const record: PendingRewardResolution = {
      pending_id: draft.package_id,
      source_type: draft.source_type,
      source_event_id: draft.source_event_id,
      generated_reward_seed: draft.generated_reward_seed,
      package_contents: contentsOf(ledgerResources),
      created_world_clock: draft.created_world_clock,
      blocking_reason: blocked.join("+"),
      allowed_resolution_actions: ["deliver_to_ledger"],
      related_system_message_id: null,
    };
    return {
      ledger: { packages: ledger.packages, story_claims: nextStoryClaims },
      pending: [...pending, record],
      ledger_delivery: "held_pending",
      blocking_reason: record.blocking_reason,
      ...(storyId !== undefined ? { story_claim_id: storyId } : {}),
    };
  }

  const pkg: LedgerPackage = {
    package_id: draft.package_id,
    source_type: draft.source_type,
    contents: contentsOf(ledgerResources),
    created_world_clock: draft.created_world_clock,
    is_story: false,
    system_grant: false,
    held_remainder: { ...ledgerResources },
  };
  return {
    ledger: { packages: [...ledger.packages, pkg], story_claims: nextStoryClaims },
    pending,
    ledger_delivery: "delivered",
    ...(storyId !== undefined ? { story_claim_id: storyId } : {}),
  };
}

/**
 * Partial-claim modes (Doc 04 §7 at A2 scope). "claim_safe" transfers only
 * what fits in Safe storage room; "claim_to_capacity" transfers what fits
 * under the 3S hard stop (Safe first, then Exposed — Economy §5/§6). In both
 * modes the untransferred remainder is HELD in the package (Hold Remaining is
 * automatic — L6; a remainder is never dropped). Doc 04 §7's "Claim All" as a
 * distinct all-or-blocked mode is not implemented: its semantics beyond
 * claim-to-capacity + hold-remaining are undefined in doctrine at this level.
 */
export type ClaimMode = "claim_safe" | "claim_to_capacity";

/** Outcome of a (partial) claim: new states plus exact per-resource accounting (L6). */
export interface ClaimResult {
  readonly ledger: ClaimLedgerState;
  readonly harbor: HarborState;
  /** Exactly what entered Harbor storage, per resource. */
  readonly claimed: RewardResources;
  /** Exactly what remains held in the package (empty map = fully claimed, package left the Ledger). */
  readonly held_remainder: RewardResources;
  /** True when the package was fully claimed and removed from the Ledger. */
  readonly fully_claimed: boolean;
}

/**
 * Claim a held package's remainder into the Harbor (Doc 04 §1: claiming
 * TRANSFERS under Safe/Exposed/Total — the Ledger never mints; L1). For every
 * resource: `claimed + new_held_remainder == old_held_remainder` exactly (L6,
 * asserted). A remainder blocked by the 3S hard stop stays held in the
 * package — never deleted, never forced into storage.
 */
export function claimPackage(
  ledger: ClaimLedgerState,
  harbor: HarborState,
  packageId: string,
  mode: ClaimMode,
): ClaimResult {
  const pkg = ledger.packages.find((p) => p.package_id === packageId);
  if (!pkg) {
    throw new ClaimLedgerInvariantError(`package "${packageId}" is not in the Claim Ledger — cannot claim`);
  }

  let nextHarbor = harbor;
  const claimed: RewardResources = {};
  const newRemainder: RewardResources = {};

  for (const [resource, held] of resourceEntries(pkg.held_remainder)) {
    assertPositiveFiniteAmount(`${packageId}.held_remainder.${resource}`, held);
    const band = nextHarbor.resources[resource];
    const safeRoom = band.caps.safe_capacity_st1 - band.safe;
    const attempt = mode === "claim_safe" ? Math.min(held, Math.max(safeRoom, 0)) : held;

    let transferred = 0;
    if (attempt > 0) {
      const result = deposit(nextHarbor, resource, attempt);
      transferred = result.deposited_to_safe + result.deposited_to_exposed;
      // claim_safe attempts only what fits in Safe, so nothing may block; in
      // claim_to_capacity the blocked amount stays held (never dropped).
      nextHarbor = result.state;
    }

    const remaining = held - transferred;
    if (transferred + remaining !== held) {
      throw new ClaimLedgerInvariantError(
        `partial-claim conservation violated for ${packageId}.${resource}: ${transferred} + ${remaining} != ${held} (L6)`,
      );
    }
    if (transferred > 0) claimed[resource] = transferred;
    if (remaining > 0) newRemainder[resource] = remaining;
  }

  const fullyClaimed = resourceEntries(newRemainder).length === 0;
  const nextPackages = fullyClaimed
    ? ledger.packages.filter((p) => p.package_id !== packageId)
    : ledger.packages.map((p) => (p.package_id === packageId ? { ...p, held_remainder: newRemainder } : p));

  return {
    ledger: { packages: nextPackages, story_claims: ledger.story_claims },
    harbor: nextHarbor,
    claimed,
    held_remainder: newRemainder,
    fully_claimed: fullyClaimed,
  };
}

/** Outcome of a pending-resolution attempt: explicit resolved/blocked — never a silent drop. */
export interface PendingResolutionResult {
  readonly ledger: ClaimLedgerState;
  readonly pending: readonly PendingRewardResolution[];
  readonly resolved: boolean;
  /** When not resolved: the still-blocking slots (the record stays pending, preserved exactly). */
  readonly blocking_reason?: string;
}

/**
 * Attempt the A2 resolution action "deliver_to_ledger" (Doc 04 §10.3): if
 * slot capacity has freed, the pending record becomes a held LedgerPackage
 * with its exact original contents (no reroll — the recorded
 * generated_reward_seed and contents transfer verbatim); otherwise the record
 * stays pending unchanged. It is never deleted either way (L11/L14).
 */
export function resolvePendingToLedger(
  ledger: ClaimLedgerState,
  pending: readonly PendingRewardResolution[],
  pendingId: string,
  rules: ClaimLedgerRules,
): PendingResolutionResult {
  const record = pending.find((r) => r.pending_id === pendingId);
  if (!record) {
    throw new ClaimLedgerInvariantError(`pending record "${pendingId}" does not exist — cannot resolve`);
  }

  const blocked = blockedSlots(ledger, record.package_contents.resources, rules);
  if (blocked.length > 0) {
    return { ledger, pending, resolved: false, blocking_reason: blocked.join("+") };
  }

  const pkg: LedgerPackage = {
    package_id: record.pending_id,
    source_type: record.source_type,
    contents: record.package_contents,
    created_world_clock: record.created_world_clock,
    is_story: false,
    system_grant: false,
    held_remainder: { ...record.package_contents.resources },
  };
  return {
    ledger: { packages: [...ledger.packages, pkg], story_claims: ledger.story_claims },
    pending: pending.filter((r) => r.pending_id !== pendingId),
    resolved: true,
  };
}

/**
 * Assert structural validity of ledger + pending state (used by tests/harness
 * and after load): unique ids, positive finite amounts, remainders bounded by
 * contents, story/non-story flags correct, pending never overlapping the
 * Ledger. Every operation in this module returns only states that pass this.
 */
export function assertClaimStateValid(
  ledger: ClaimLedgerState,
  pending: readonly PendingRewardResolution[],
): void {
  const seen = new Set<string>();
  const claim = (id: string, what: string) => {
    if (seen.has(id)) throw new ClaimLedgerInvariantError(`duplicate id "${id}" (${what})`);
    seen.add(id);
  };
  for (const pkg of ledger.packages) {
    claim(pkg.package_id, "ledger package");
    if (pkg.is_story !== false || pkg.system_grant !== false) {
      throw new ClaimLedgerInvariantError(`package "${pkg.package_id}" breaks A2 structural flags`);
    }
    const held = resourceEntries(pkg.held_remainder);
    if (held.length === 0) {
      throw new ClaimLedgerInvariantError(`package "${pkg.package_id}" holds nothing — fully claimed packages leave the Ledger`);
    }
    for (const [resource, amount] of held) {
      assertPositiveFiniteAmount(`${pkg.package_id}.held_remainder.${resource}`, amount);
      const original = pkg.contents.resources[resource] ?? 0;
      if (amount > original) {
        throw new ClaimLedgerInvariantError(
          `package "${pkg.package_id}" holds ${amount} ${resource} but was created with ${original} — value cannot grow in the Ledger (L1)`,
        );
      }
    }
  }
  for (const story of ledger.story_claims) {
    claim(story.claim_id, "story claim");
    if (story.is_story !== true) {
      throw new ClaimLedgerInvariantError(`story claim "${story.claim_id}" is not flagged is_story`);
    }
    for (const [resource, amount] of resourceEntries(story.contents.resources)) {
      assertPositiveFiniteAmount(`${story.claim_id}.contents.${resource}`, amount);
    }
  }
  for (const record of pending) {
    claim(record.pending_id, "pending record");
    for (const [resource, amount] of resourceEntries(record.package_contents.resources)) {
      assertPositiveFiniteAmount(`${record.pending_id}.package_contents.${resource}`, amount);
    }
  }
}
