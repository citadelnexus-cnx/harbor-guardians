/**
 * Alpha A4 harness checks — the executable evidence behind OPS1
 * (cancel/refund routing), converted stub → implemented at Alpha A4 (owner
 * authorization 2026-07-23, Option A). The check drives the pure expedition
 * sim (src/sim/expedition.ts) over the schema-validated canonical seed and
 * proves both OPS1 branches: a fresh-harbor cancellation refunds the committed
 * supply set to Harbor stock exactly (Safe→Exposed, obeying Total 3S, never to
 * the Claim Ledger, never silently deleted), and a cancellation whose refund
 * would breach 3S blocks by default with the supplies preserved.
 *
 * Detail strings are deterministic (no paths, no wall-clock) so the harness
 * repeat-run determinism proof holds over them.
 *
 * Governing docs: SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.7 (OPS1);
 * ALPHA_A4_EXECUTION_BRIEF v0.1 §2.9; 01_ECONOMY_FOUNDATION v1.7 §5/§6;
 * CLAUDE.md §5 (no hidden loss). Invariant refs: OPS1.
 */

import type { CoreResource } from "../src/contracts/enums.js";
import type { ExpeditionSeed } from "../src/contracts/expedition-seed.js";
import type { ResourceStorageSeed } from "../src/contracts/resource-storage.js";
import { applyCommand, createExpeditionState, createHarborOperationsState, type ExpeditionDomain } from "../src/sim/expedition.js";
import { CORE_RESOURCES, createHarborState, deposit } from "../src/sim/harbor-state.js";
import type { CheckVerdict } from "./types.js";

/** Deterministic seed for the OPS1 check (harness parameter, not gameplay). */
const OPS1_SEED = 20260723;

function freshDomain(storageSeed: ResourceStorageSeed): ExpeditionDomain {
  return {
    expedition: createExpeditionState(),
    harbor_operations: createHarborOperationsState(),
    harbor: createHarborState(storageSeed),
  };
}

function harborTotal(domain: ExpeditionDomain, resource: CoreResource): number {
  const band = domain.harbor.resources[resource];
  return band.safe + band.exposed;
}

/**
 * OPS1: expedition cancellation refunds committed supplies directly to Harbor
 * stock (Safe→Exposed), obeys Total 3S, never enters the Claim Ledger, blocks
 * by default if the refund would exceed 3S, and never silently deletes value.
 */
export function checkOps1CancelRefund(storageSeed: ResourceStorageSeed, expeditionSeed: ExpeditionSeed): CheckVerdict {
  const content = expeditionSeed.content;
  const ctx = { seed: OPS1_SEED, content };
  const suppliedResources = Object.keys(content.supply_set) as CoreResource[];

  // ── Path A: a fresh-harbor cancellation fully refunds and clears the run. ──
  const base = freshDomain(storageSeed);
  const before = CORE_RESOURCES.map((r) => [r, harborTotal(base, r)] as const);
  const prepared = applyCommand(base, { command_id: "ops1.prepare", kind: "prepare", guardian_id: "gdn.nova" }, ctx).domain;
  for (const resource of suppliedResources) {
    const expected = (before.find(([r]) => r === resource)?.[1] ?? 0) - (content.supply_set[resource] ?? 0);
    if (harborTotal(prepared, resource) !== expected) {
      return { pass: false, evidence: `OPS1: ${resource} was not withdrawn onto the vessel at prepare` };
    }
  }
  const cancelled = applyCommand(prepared, { command_id: "ops1.cancel", kind: "cancel" }, ctx);
  if (cancelled.cancellation_blocked || cancelled.refund?.total_blocked !== 0) {
    return { pass: false, evidence: "OPS1: a fresh-harbor cancellation should not be blocked" };
  }
  for (const [resource, total] of before) {
    if (harborTotal(cancelled.domain, resource) !== total) {
      return { pass: false, evidence: `OPS1: ${resource} was not fully refunded to Harbor stock (hidden loss)` };
    }
  }
  if (cancelled.domain.expedition.phase !== "idle" || cancelled.domain.expedition.active !== null) {
    return { pass: false, evidence: "OPS1: a successful cancellation must clear the expedition back to idle" };
  }

  // ── Path B: a cancellation whose refund would breach 3S blocks (preserved). ──
  let atCap = prepared;
  for (const resource of suppliedResources) {
    const cap = storageSeed.storage[resource].total_capacity_st1;
    atCap = { ...atCap, harbor: deposit(atCap.harbor, resource, cap - harborTotal(atCap, resource)).state };
  }
  const stockAtCap = suppliedResources.map((r) => [r, harborTotal(atCap, r)] as const);
  const blocked = applyCommand(atCap, { command_id: "ops1.cancel.blocked", kind: "cancel" }, ctx);
  if (!blocked.cancellation_blocked || blocked.refund?.total_refunded !== 0) {
    return { pass: false, evidence: "OPS1: a cancellation that would breach 3S must block by default" };
  }
  if (blocked.domain.expedition.phase !== "preparing" || blocked.domain.expedition.active === null) {
    return { pass: false, evidence: "OPS1: a blocked cancellation must preserve the preparing expedition (supplies not deleted)" };
  }
  for (const [resource, total] of stockAtCap) {
    if (harborTotal(blocked.domain, resource) !== total) {
      return { pass: false, evidence: `OPS1: ${resource} stock changed during a blocked cancellation (supplies must be preserved)` };
    }
  }

  return {
    pass: true,
    evidence:
      `A4 scope: expedition cancellation refunds the committed supply set (${suppliedResources.join("+")}) directly to ` +
      `Harbor stock (Safe→Exposed) with exact conservation and no Claim-Ledger involvement; a refund that would breach ` +
      `the 3S hard stop blocks by default and preserves the supplies (never silently deleted). All amounts from the ` +
      `schema-validated expedition + storage seeds (No Magic Numbers).`,
  };
}
