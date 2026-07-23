/**
 * Interactive expedition controller — the pure, headless-testable core of the
 * Alpha A4 Windows player flow (owner Alpha A4 authorization 2026-07-23,
 * Option A; PR #21 review correction). It maps high-level PLAYER INTENTS
 * (start, select Guardian, confirm supplies, cancel, depart, advance, resolve,
 * dock, unload, recover, complete, repeat) onto the AUTHORITATIVE expedition
 * sim (src/sim/expedition.ts) — there is no second gameplay model. The Tauri
 * webview glue (src/ui/shell/app.js) and the Rust persistence command are thin
 * layers over this controller; all real logic lives here and is unit-tested in
 * tests/ui-controller.test.ts.
 *
 * Persistence uses the real, tested pure pieces: `canonicalSerialize` +
 * `createEmptySaveBlob` to build a v4 SaveBlob, `migrateSaveBlobToCurrent` to
 * bring a loaded blob current, and the sim's own structural invariants
 * (`assertExpeditionDomainValid`, `fromResourceBands`, `assertClaimStateValid`)
 * to reject malformed state loudly on load. File I/O + the ajv schema gate live
 * in the Node/test save pipeline (unchanged); the desktop bridge writes/reads
 * through the Rust command and validates with these shared structural asserts —
 * a deliberate Alpha bound, documented in ALPHA_A4_WINDOWS_ACCEPTANCE.md.
 *
 * Governing docs: ALPHA_A4_EXECUTION_BRIEF v0.1 §2 (player-facing loop), §3
 * (deterministic content + duplicate-resistant commands); CLAUDE.md §5 (no
 * hidden loss, preserve don't rewrite). Invariant refs: mirrors the sim (OPS1,
 * conservation, overflow, EVT reuse); introduces none of its own.
 */

import type { CoreResource } from "../contracts/enums.js";
import type {
  ExpeditionCommand,
  ExpeditionOutcome,
  ResourceAmounts,
  StartingGuardianId,
} from "../contracts/expedition.js";
import type { ExpeditionSeed } from "../contracts/expedition-seed.js";
import type { ResourceStorageSeed } from "../contracts/resource-storage.js";
import type { SaveBlob } from "../contracts/save-blob.js";
import { assertClaimStateValid } from "../sim/claim-ledger.js";
import {
  applyCommand,
  assertExpeditionDomainValid,
  AT_OUTPOST_OUTCOMES,
  createExpeditionState,
  createHarborOperationsState,
  ExpeditionInvariantError,
  STARTING_GUARDIANS,
  type CommandResult,
  type ExpeditionDomain,
} from "../sim/expedition.js";
import {
  CORE_RESOURCES,
  createHarborState,
  deposit,
  fromResourceBands,
  toResourceBands,
} from "../sim/harbor-state.js";
import { canonicalSerialize } from "../save/canonical-json.js";
import { createEmptySaveBlob } from "../save/empty-save.js";
import { migrateSaveBlobToCurrent } from "../save/migrations.js";

/** A player intent the UI can offer, resolved against the current phase. */
export type UiActionKind =
  | "start" // idle → begin Guardian selection (UI-local; no command yet)
  | "prepare" // confirm the Guardian + supply loadout → withdraw supplies
  | "cancel" // pre-dispatch cancellation (OPS1 refund)
  | "depart" // dispatch
  | "advance" // arrive at the outpost
  | "resolve" // choose an outcome at the outpost
  | "dock" // return + dock
  | "unload" // unload one pass (Safe Storage → Overflow → aboard)
  | "complete" // finish (→ recovering or idle)
  | "recover"; // clear damage → idle

/** One offered action, ready to render as a button. */
export interface UiAction {
  kind: UiActionKind;
  label: string;
  /** For "prepare": the Guardian to prepare with. For "resolve": the outcome. */
  guardian_id?: StartingGuardianId;
  outcome?: ExpeditionOutcome;
}

/** A renderable snapshot of the whole player-visible state. */
export interface UiView {
  phase: string;
  guardian_id: StartingGuardianId | null;
  content_id: string;
  route_id: string;
  outpost_id: string;
  /** Harbor Safe/Exposed per resource. */
  harbor: Record<CoreResource, { safe: number; exposed: number; safe_capacity: number; total_capacity: number }>;
  /** Unsafe Overflow holdings per resource + the per-resource cap. */
  overflow: ResourceAmounts;
  overflow_cap: Record<CoreResource, number>;
  cargo_aboard: ResourceAmounts;
  /** True when the last unload left material aboard (both Safe Storage and Overflow were full). */
  unload_blocked: boolean;
  vessel_condition: string | null;
  crew_condition: string | null;
  guardian_condition: string | null;
  route_anchor_unlocked: boolean;
  completed_expeditions: number;
  intro_consumed: boolean;
  event_state: string | null;
  outcome: ExpeditionOutcome | null;
  supply_set: ResourceAmounts;
  /** Human-readable note for the last performed action / current situation. */
  message: string;
}

/** Result of performing a UI action. */
export interface PerformResult {
  ok: boolean;
  error?: string;
  view: UiView;
}

/** Alpha acceptance scenario the UI can start from (real transitions only — no cheats). */
export type StartScenario = "fresh" | "overflow_demo" | "cancel_block_demo";

function labelOutcome(outcome: ExpeditionOutcome): string {
  switch (outcome) {
    case "full_success":
      return "Stabilize fully (full success)";
    case "partial_success":
      return "Stabilize partially (partial success)";
    case "retreat":
      return "Withdraw voluntarily (retreat)";
    case "forced_withdrawal":
      return "Forced withdrawal";
    default:
      return outcome;
  }
}

function guardianLabel(id: StartingGuardianId): string {
  return id === "gdn.raxa" ? "Raxa" : id === "gdn.tarin" ? "Tarin" : "Nova";
}

/**
 * The pure interactive controller. Holds the authoritative ExpeditionDomain and
 * a template SaveBlob (for the non-expedition blocks, preserved across
 * save/load), plus a small amount of UI-local state (the pending Guardian
 * selection, the last message, and whether the last unload was blocked).
 */
export class ExpeditionController {
  private domain: ExpeditionDomain;
  private template: SaveBlob;
  private readonly ctx: { seed: number; content: ExpeditionSeed["content"] };
  private readonly storageSeed: ResourceStorageSeed;
  private pendingGuardian: StartingGuardianId | null = null;
  private message = "New game. Start an expedition from the Harbor.";
  private lastUnloadBlocked = false;
  /** Monotonic command counter → stable, unique command ids (duplicate-resistant). */
  private commandCounter = 0;

  constructor(
    storageSeed: ResourceStorageSeed,
    expeditionSeed: ExpeditionSeed,
    seed: number,
    scenario: StartScenario = "fresh",
  ) {
    this.storageSeed = storageSeed;
    this.ctx = { seed, content: expeditionSeed.content };
    this.template = createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: new Date(0).toISOString() });
    this.domain = {
      expedition: createExpeditionState(),
      harbor_operations: createHarborOperationsState(),
      harbor: createHarborState(storageSeed),
    };
    if (scenario === "overflow_demo") this.applyOverflowDemoScenario();
    else if (scenario === "cancel_block_demo") this.applyCancelBlockScenario();
    assertExpeditionDomainValid(this.domain, this.ctx.content);
  }

  /**
   * Alpha acceptance scenario: pre-fill the Harbor toward its 3S caps and the
   * Overflow toward its cap for the first Guardian's salvage resource, using
   * REAL deposit transactions (conservation-safe — never a cheat), so the next
   * expedition's unload visibly overflows and then blocks. Clearly an Alpha
   * acceptance aid, inside A4, using the real transition system.
   */
  private applyOverflowDemoScenario(): void {
    const content = this.ctx.content;
    let harbor = this.domain.harbor;
    const overflow: ResourceAmounts = {};
    for (const resource of CORE_RESOURCES) {
      const caps = harbor.resources[resource].caps;
      // Fill to the 3S hard stop via the real deposit valve.
      harbor = deposit(harbor, resource, caps.total_capacity_st1).state;
      // Seed Overflow near its cap so a modest salvage tips it over into "blocked".
      overflow[resource] = content.overflow_cap_multiplier * caps.safe_capacity_st1;
    }
    this.domain = { ...this.domain, harbor, harbor_operations: { ...this.domain.harbor_operations, overflow } };
    this.message = "Overflow demo: Harbor Storage and Overflow are pre-filled (real deposits). Unloading will block — free space to continue.";
  }

  /**
   * Alpha acceptance scenario for the OPS1 BLOCKED-cancel branch (acceptance
   * item D): prepare the vessel, then top the Harbor back to its 3S caps via
   * real deposits, so a cancellation's refund would breach 3S and must block
   * (supplies preserved). Not reachable in a normal single-expedition flow
   * (supplies come out of the Harbor), so this scenario makes it demonstrable
   * — using only real transitions, never a cheat.
   */
  private applyCancelBlockScenario(): void {
    let harbor = this.domain.harbor;
    for (const resource of CORE_RESOURCES) {
      harbor = deposit(harbor, resource, harbor.resources[resource].caps.total_capacity_st1).state;
    }
    this.domain = { ...this.domain, harbor };
    const prepared = applyCommand(this.domain, { command_id: this.nextCommandId("prepare"), kind: "prepare", guardian_id: "gdn.nova" }, this.ctx);
    this.domain = prepared.domain;
    let topped = this.domain.harbor;
    for (const resource of Object.keys(this.ctx.content.supply_set) as CoreResource[]) {
      const band = topped.resources[resource];
      const room = band.caps.total_capacity_st1 - (band.safe + band.exposed);
      if (room > 0) topped = deposit(topped, resource, room).state;
    }
    this.domain = { ...this.domain, harbor: topped };
    this.message = "Blocked-cancel demo: the vessel is prepared and the Harbor is full. Cancelling now would exceed the 3S hard stop — cancellation will block and preserve the supplies (OPS1).";
  }

  private nextCommandId(kind: string): string {
    this.commandCounter += 1;
    return `ui.${kind}.${this.commandCounter}`;
  }

  private apply(command: ExpeditionCommand, note: string): PerformResult {
    let result: CommandResult;
    try {
      result = applyCommand(this.domain, command, this.ctx);
    } catch (err) {
      const message = err instanceof ExpeditionInvariantError ? err.message : String(err);
      return { ok: false, error: message, view: this.view() };
    }
    this.domain = result.domain;
    if (command.kind === "unload") {
      this.lastUnloadBlocked = result.unload ? !result.unload.fully_unloaded : false;
    }
    if (command.kind === "cancel" && result.cancellation_blocked) {
      this.message = "Cancellation blocked: refunding the supplies would exceed the 3S hard stop. Supplies are preserved on the vessel (OPS1).";
      return { ok: true, view: this.view() };
    }
    this.message = note;
    return { ok: true, view: this.view() };
  }

  /** UI-local Guardian selection (no command until `prepare`). */
  selectGuardian(id: StartingGuardianId): PerformResult {
    if (!STARTING_GUARDIANS.includes(id)) return { ok: false, error: `unknown guardian ${id}`, view: this.view() };
    this.pendingGuardian = id;
    this.message = `${guardianLabel(id)} selected. Review the supply loadout, then prepare the vessel.`;
    return { ok: true, view: this.view() };
  }

  /** The actions offered from the current phase (what the UI renders as buttons). */
  availableActions(): UiAction[] {
    const phase = this.domain.expedition.phase;
    switch (phase) {
      case "idle": {
        if (this.pendingGuardian === null) {
          return STARTING_GUARDIANS.map((g) => ({ kind: "start", label: `Choose ${guardianLabel(g)}`, guardian_id: g }));
        }
        return [
          { kind: "prepare", label: `Prepare Theo's vessel with ${guardianLabel(this.pendingGuardian)}`, guardian_id: this.pendingGuardian },
        ];
      }
      case "preparing":
        return [
          { kind: "depart", label: "Depart on the route" },
          { kind: "cancel", label: "Cancel (refund supplies — OPS1)" },
        ];
      case "en_route":
        return [{ kind: "advance", label: "Advance to the route-anchor outpost" }];
      case "at_outpost":
        return this.outcomeActions();
      case "returning":
        return [{ kind: "dock", label: "Return and dock at the Harbor" }];
      case "docked": {
        const cargo = Object.keys(this.domain.expedition.active?.cargo_aboard ?? {}).length > 0;
        const actions: UiAction[] = [];
        if (cargo) actions.push({ kind: "unload", label: this.lastUnloadBlocked ? "Unload again (blocked — free space first)" : "Unload recovered materials" });
        else actions.push({ kind: "complete", label: "Complete the expedition" });
        return actions;
      }
      case "recovering":
        return [{ kind: "recover", label: "Perform bounded recovery (restore readiness)" }];
      default:
        return [];
    }
  }

  private outcomeActions(): UiAction[] {
    const objectiveBegun = this.domain.expedition.active?.event?.state === "ACTIVE";
    return AT_OUTPOST_OUTCOMES.filter((o) => objectiveBegun || o === "forced_withdrawal").map((o) => ({
      kind: "resolve",
      label: labelOutcome(o),
      outcome: o,
    }));
  }

  /** Perform an offered action; rejects anything not currently available. */
  perform(action: UiAction): PerformResult {
    switch (action.kind) {
      case "start":
        return action.guardian_id ? this.selectGuardian(action.guardian_id) : { ok: false, error: "no guardian", view: this.view() };
      case "prepare": {
        const guardian = action.guardian_id ?? this.pendingGuardian;
        if (!guardian) return { ok: false, error: "select a Guardian first", view: this.view() };
        const res = this.apply({ command_id: this.nextCommandId("prepare"), kind: "prepare", guardian_id: guardian }, `Prepared Theo's vessel with ${guardianLabel(guardian)}; supplies loaded aboard. Depart when ready.`);
        if (res.ok) this.pendingGuardian = null;
        return res;
      }
      case "cancel":
        return this.apply({ command_id: this.nextCommandId("cancel"), kind: "cancel" }, "Expedition cancelled; supplies refunded to Harbor stock (OPS1).");
      case "depart":
        return this.apply({ command_id: this.nextCommandId("depart"), kind: "dispatch" }, "Departed along the route; supplies are spent.");
      case "advance":
        return this.apply({ command_id: this.nextCommandId("advance"), kind: "arrive" }, "Arrived at the damaged outpost. Resolve the stabilization objective.");
      case "resolve":
        if (!action.outcome) return { ok: false, error: "no outcome", view: this.view() };
        return this.apply({ command_id: this.nextCommandId("resolve"), kind: "resolve", outcome: action.outcome }, `Outcome: ${labelOutcome(action.outcome)}. Recovered materials loaded; returning.`);
      case "dock":
        return this.apply({ command_id: this.nextCommandId("dock"), kind: "dock" }, "Docked at the Harbor. Review and unload recovered materials.");
      case "unload":
        return this.apply({ command_id: this.nextCommandId("unload"), kind: "unload" }, "Unloaded: Safe Storage first, then unsafe Overflow — every unit conserved.");
      case "complete":
        return this.apply({ command_id: this.nextCommandId("complete"), kind: "complete" }, "Expedition complete.");
      case "recover":
        return this.apply({ command_id: this.nextCommandId("recover"), kind: "recover" }, "Recovery complete; vessel, crew, and Guardian are ready.");
      default:
        return { ok: false, error: `unknown action ${(action as UiAction).kind}`, view: this.view() };
    }
  }

  /** The current renderable view. */
  view(): UiView {
    const content = this.ctx.content;
    const active = this.domain.expedition.active;
    const harbor = {} as UiView["harbor"];
    const overflowCap = {} as Record<CoreResource, number>;
    for (const resource of CORE_RESOURCES) {
      const band = this.domain.harbor.resources[resource];
      harbor[resource] = {
        safe: band.safe,
        exposed: band.exposed,
        safe_capacity: band.caps.safe_capacity_st1,
        total_capacity: band.caps.total_capacity_st1,
      };
      overflowCap[resource] = content.overflow_cap_multiplier * band.caps.safe_capacity_st1;
    }
    return {
      phase: this.domain.expedition.phase,
      guardian_id: active?.guardian_id ?? this.pendingGuardian,
      content_id: content.content_id,
      route_id: content.route.route_id,
      outpost_id: content.outpost.outpost_id,
      harbor,
      overflow: { ...this.domain.harbor_operations.overflow },
      overflow_cap: overflowCap,
      cargo_aboard: { ...active?.cargo_aboard },
      unload_blocked: this.lastUnloadBlocked && this.domain.expedition.phase === "docked",
      vessel_condition: active?.vessel_condition ?? null,
      crew_condition: active?.crew_condition ?? null,
      guardian_condition: active?.guardian_condition ?? null,
      route_anchor_unlocked: this.domain.harbor_operations.route_anchor_operations_unlocked,
      completed_expeditions: this.domain.harbor_operations.completed_expeditions,
      intro_consumed: this.domain.harbor_operations.canonical_intro_consumed,
      event_state: active?.event?.state ?? null,
      outcome: active?.outcome ?? null,
      supply_set: { ...content.supply_set },
      message: this.message,
    };
  }

  /** Serialize the full authoritative v4 SaveBlob (domain projected onto the preserved template). */
  toSaveBlob(lastSavedUtc: string): SaveBlob {
    return {
      ...this.template,
      meta: { ...this.template.meta, last_saved_utc: lastSavedUtc },
      resources: toResourceBands(this.domain.harbor),
      expedition: this.domain.expedition,
      harbor_operations: this.domain.harbor_operations,
    };
  }

  /** Canonical JSON string for persistence (the exact bytes the Rust bridge writes). */
  serialize(lastSavedUtc: string): string {
    return canonicalSerialize(this.toSaveBlob(lastSavedUtc));
  }

  /**
   * Restore a controller from a persisted save string: migrate to v4, rebuild
   * the domain from the real blocks, and re-assert every structural invariant
   * (harbor 3S, claim ledger, expedition/overflow). Malformed state throws —
   * never silently repaired.
   */
  static fromSerialized(
    json: string,
    storageSeed: ResourceStorageSeed,
    expeditionSeed: ExpeditionSeed,
    seed: number,
  ): ExpeditionController {
    const parsed: unknown = JSON.parse(json);
    const migrated = migrateSaveBlobToCurrent(parsed) as SaveBlob;
    const harbor = fromResourceBands(migrated.resources, storageSeed); // asserts 3S validity
    assertClaimStateValid(migrated.claim_ledger, migrated.pending_reward_resolution);
    const controller = new ExpeditionController(storageSeed, expeditionSeed, seed);
    controller.template = migrated;
    controller.domain = { expedition: migrated.expedition, harbor_operations: migrated.harbor_operations, harbor };
    assertExpeditionDomainValid(controller.domain, expeditionSeed.content);
    // Continue the command counter beyond any persisted id so a resumed session
    // never reissues a committed command id (duplicate-command resistance).
    controller.commandCounter = ExpeditionController.counterFloor(migrated.expedition.last_command_id);
    controller.message = "Resumed the saved expedition exactly where it left off.";
    return controller;
  }

  private static counterFloor(lastCommandId: string | null): number {
    if (!lastCommandId) return 0;
    const n = Number(lastCommandId.split(".").pop());
    return Number.isFinite(n) ? n : 0;
  }
}

export const CONTROLLER_GUARDIANS = STARTING_GUARDIANS;
