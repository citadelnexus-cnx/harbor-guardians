/**
 * Harbor resource state spine — Alpha A1 "Minimal Harbor State and Resource
 * Spine" (owner Alpha A1 authorization, 2026-07-16). Pure, deterministic,
 * headless: no I/O, no RNG, no wall-clock — every function maps inputs to
 * outputs so the sim harness replays it byte-identically (Sim §2).
 *
 * What this is: the 3S storage-state model (D1 — Safe S / Exposed 2S / Total
 * 3S) for the four CoreResources, driven ENTIRELY by schema-validated seed
 * values (No Magic Numbers, DC1 — the only numeric literal in this file is
 * the identity 0). Deposits fill Safe first, then Exposed, then hard-stop at
 * Total 3S (Economy §5/§6 step 3); blocked amounts are always returned to the
 * caller, never silently dropped (no hidden loss, CLAUDE.md §5).
 *
 * What this is NOT (A1 boundary): no production, no pulses, no decay/leak,
 * no upkeep, no raids, no offline reconciliation, no gameplay loop. Those are
 * FUTURE BUILD; their invariants (E-suite, TD, OPS, …) remain fail-loud stubs.
 *
 * Governing docs:
 *   - 01_ECONOMY_FOUNDATION v1.7 §3 (start stock), §5/§6 (fill order:
 *     safe → exposed → hard stop at 3S), §7 (3S table incl. Crowns)
 *   - 00_DECISION_REGISTER D1 (3S model, LOCKED), D26 (CoreResource-only
 *     storage — DC6)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §2 (StorageStateBand),
 *     §7 (DC1/DC6)
 *   - SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §16 (resources save block shape)
 * Invariant refs: DC1, DC6 (typing + seeded values); S5 (state maps onto the
 * save blob's resources block via toResourceBands); feeds FUTURE E5/E6/E7.
 */

import type { CoreResource } from "../contracts/enums.js";
import type { ResourceBand } from "../contracts/save-blob.js";
import type { ResourceStorageDefinition, ResourceStorageSeed } from "../contracts/resource-storage.js";

/**
 * The four CoreResources in canonical order (Doc 07 §2, D26). Storage and
 * exposure key on these ONLY (DC6) — Merit and receipt metrics have no
 * storage bands by construction.
 */
export const CORE_RESOURCES: readonly CoreResource[] = ["Crowns", "Provisions", "Iron", "Aether"];

/** One resource's Safe/Exposed stock plus its seeded capacities. */
export interface ResourceStorageState {
  readonly safe: number;
  readonly exposed: number;
  /** Seeded capacities (DC1) — carried with the state so every bound check reads seed values, never constants. */
  readonly caps: ResourceStorageDefinition;
}

/** The minimal A1 harbor state: per-CoreResource 3S storage state. */
export interface HarborState {
  readonly resources: Readonly<Record<CoreResource, ResourceStorageState>>;
}

/** Thrown when an operation would violate the 3S storage doctrine (D1) or lose value silently. */
export class HarborStateInvariantError extends Error {
  constructor(detail: string) {
    super(`harbor state invariant violated: ${detail}`);
    this.name = "HarborStateInvariantError";
  }
}

function assertFiniteNonNegative(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new HarborStateInvariantError(`${label} must be a finite non-negative number, got ${value}`);
  }
}

/** Assert one resource's storage state obeys D1: 0 ≤ safe ≤ S, 0 ≤ exposed ≤ 2S, safe+exposed ≤ 3S. */
function assertBandValid(resource: CoreResource, band: ResourceStorageState): void {
  assertFiniteNonNegative(`${resource}.safe`, band.safe);
  assertFiniteNonNegative(`${resource}.exposed`, band.exposed);
  if (band.safe > band.caps.safe_capacity_st1) {
    throw new HarborStateInvariantError(`${resource}.safe ${band.safe} exceeds Safe capacity S ${band.caps.safe_capacity_st1}`);
  }
  if (band.exposed > band.caps.exposed_capacity_st1) {
    throw new HarborStateInvariantError(`${resource}.exposed ${band.exposed} exceeds Exposed capacity 2S ${band.caps.exposed_capacity_st1}`);
  }
  if (band.safe + band.exposed > band.caps.total_capacity_st1) {
    throw new HarborStateInvariantError(`${resource} total ${band.safe + band.exposed} exceeds Total capacity 3S ${band.caps.total_capacity_st1}`);
  }
}

/** Assert the whole harbor state is valid under D1 — every operation returns only states that pass this. */
export function assertHarborStateValid(state: HarborState): void {
  for (const resource of CORE_RESOURCES) {
    assertBandValid(resource, state.resources[resource]);
  }
}

/**
 * Create the world-creation harbor state from a schema-validated storage
 * seed: each CoreResource starts with its owner-approved start_stock in Safe
 * storage (Economy §3; the validator guarantees start_stock ≤ S) and zero
 * Exposed surplus. Every number comes from the seed (DC1).
 */
export function createHarborState(seed: ResourceStorageSeed): HarborState {
  const resources = {} as Record<CoreResource, ResourceStorageState>;
  for (const resource of CORE_RESOURCES) {
    const caps = seed.storage[resource];
    resources[resource] = { safe: caps.start_stock, exposed: 0, caps };
  }
  const state: HarborState = { resources };
  assertHarborStateValid(state);
  return state;
}

/** Total stock of one resource across both bands. */
export function totalStock(state: HarborState, resource: CoreResource): number {
  const band = state.resources[resource];
  return band.safe + band.exposed;
}

/** Outcome of a deposit: the new state plus a full accounting of where every unit went (no hidden loss). */
export interface DepositResult {
  readonly state: HarborState;
  readonly deposited_to_safe: number;
  readonly deposited_to_exposed: number;
  /** Amount refused at the 3S hard stop — returned to the caller, NEVER silently deleted (Economy §10; CLAUDE.md §5). */
  readonly blocked_at_cap: number;
}

function withBand(state: HarborState, resource: CoreResource, band: ResourceStorageState): HarborState {
  return { resources: { ...state.resources, [resource]: band } };
}

/**
 * Deposit `amount` of `resource`: fill Safe storage first, then Exposed
 * surplus, hard-stop at Total 3S (Economy §5/§6 step 3). Conservation holds
 * exactly: deposited_to_safe + deposited_to_exposed + blocked_at_cap ==
 * amount — a blocked remainder is reported, never dropped.
 */
export function deposit(state: HarborState, resource: CoreResource, amount: number): DepositResult {
  assertFiniteNonNegative(`deposit(${resource}) amount`, amount);
  const band = state.resources[resource];

  const safeRoom = band.caps.safe_capacity_st1 - band.safe;
  const toSafe = Math.min(amount, safeRoom);

  const exposedRoomByBand = band.caps.exposed_capacity_st1 - band.exposed;
  const exposedRoomByTotal = band.caps.total_capacity_st1 - (band.safe + toSafe) - band.exposed;
  const toExposed = Math.min(amount - toSafe, exposedRoomByBand, exposedRoomByTotal);

  const blocked = amount - toSafe - toExposed;

  const next = withBand(state, resource, {
    safe: band.safe + toSafe,
    exposed: band.exposed + toExposed,
    caps: band.caps,
  });
  assertHarborStateValid(next);
  return { state: next, deposited_to_safe: toSafe, deposited_to_exposed: toExposed, blocked_at_cap: blocked };
}

/** Storage band selector for withdrawals (Doc 07 §2 StorageStateBand, minus the hard_stop pseudo-band). */
export type StorageBand = "safe" | "exposed";

/**
 * Withdraw `amount` of `resource` from an explicit band. Insufficient stock
 * throws — a stock can never go negative and value can never be created by
 * over-withdrawal (Economy §6 floor discipline).
 */
export function withdraw(state: HarborState, resource: CoreResource, band: StorageBand, amount: number): HarborState {
  assertFiniteNonNegative(`withdraw(${resource}) amount`, amount);
  const current = state.resources[resource];
  const available = current[band];
  if (amount > available) {
    throw new HarborStateInvariantError(
      `withdraw(${resource}.${band}) of ${amount} exceeds available ${available} — stocks never go negative`,
    );
  }
  const next = withBand(state, resource, {
    ...current,
    [band]: available - amount,
  });
  assertHarborStateValid(next);
  return next;
}

/**
 * Project the harbor state onto the save blob's `resources` block
 * (Save/Load §16; SaveBlob.resources keys are CoreResource ONLY — DC6).
 * Capacities are NOT persisted: they are /data seed values (DC1), the save
 * carries player state only.
 */
export function toResourceBands(state: HarborState): Record<CoreResource, ResourceBand> {
  const bands = {} as Record<CoreResource, ResourceBand>;
  for (const resource of CORE_RESOURCES) {
    const { safe, exposed } = state.resources[resource];
    bands[resource] = { safe, exposed };
  }
  return bands;
}

/**
 * Rebuild a harbor state from a save blob's `resources` block plus the
 * storage seed (load path: state from the save, capacities from /data —
 * DC1). Validates the merged state against D1 before returning.
 */
export function fromResourceBands(
  bands: Record<CoreResource, ResourceBand>,
  seed: ResourceStorageSeed,
): HarborState {
  const resources = {} as Record<CoreResource, ResourceStorageState>;
  for (const resource of CORE_RESOURCES) {
    const { safe, exposed } = bands[resource];
    resources[resource] = { safe, exposed, caps: seed.storage[resource] };
  }
  const state: HarborState = { resources };
  assertHarborStateValid(state);
  return state;
}
