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
 * `createEmptySaveBlob` to build the current SaveBlob, `migrateSaveBlobToCurrent`
 * to bring a loaded blob current, and — as of HG-POST-A4-STABILIZATION-01 (H2) —
 * the SHARED, complete `assertSaveBlobValid` (the precompiled generated schema
 * validator + every semantic invariant) both BEFORE persistence and AFTER
 * migration on load, so the desktop path enforces the exact same save contract
 * as the Node/test pipeline. The sim's domain-specific structural invariants
 * (`assertExpeditionDomainValid`, `fromResourceBands`, `assertClaimStateValid`)
 * still run on load as defense in depth (they also check the /data-seeded
 * overflow cap the schema cannot). Malformed state is refused loudly; nothing is
 * accepted into controller state until validation succeeds.
 *
 * Governing docs: ALPHA_A4_EXECUTION_BRIEF v0.1 §2 (player-facing loop), §3
 * (deterministic content + duplicate-resistant commands); CLAUDE.md §5 (no
 * hidden loss, preserve don't rewrite). Invariant refs: mirrors the sim (OPS1,
 * conservation, overflow, EVT reuse); introduces none of its own.
 */
import { assertClaimStateValid } from "../sim/claim-ledger.js";
import { applyCommand, assertExpeditionDomainValid, AT_OUTPOST_OUTCOMES, createExpeditionState, createHarborOperationsState, ExpeditionInvariantError, isUnloadBlocked, STARTING_GUARDIANS, unloadRoom, } from "../sim/expedition.js";
import { CORE_RESOURCES, createHarborState, deposit, fromResourceBands, toResourceBands, } from "../sim/harbor-state.js";
import { canonicalSerialize } from "../save/canonical-json.js";
import { createEmptySaveBlob } from "../save/empty-save.js";
import { migrateSaveBlobToCurrent } from "../save/migrations.js";
import { assertSaveBlobValid } from "../save/save-semantics.js";
function labelOutcome(outcome) {
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
function guardianLabel(id) {
    return id === "gdn.raxa" ? "Raxa" : id === "gdn.tarin" ? "Tarin" : "Nova";
}
function bandLabel(band) {
    return band === "overflow" ? "unsafe Overflow" : band === "exposed" ? "Exposed storage" : "Safe Storage";
}
/**
 * The pure interactive controller. Holds the authoritative ExpeditionDomain and
 * a template SaveBlob (for the non-expedition blocks, preserved across
 * save/load), plus a small amount of UI-local state (the pending Guardian
 * selection, the last message, and whether the last unload was blocked).
 */
export class ExpeditionController {
    domain;
    template;
    ctx;
    storageSeed;
    pendingGuardian = null;
    message = "New game. Start an expedition from the Harbor.";
    /** True while the UI is in the bounded Harbor-management (free-capacity) view. */
    managementMode = false;
    /**
     * A destructive discard awaiting confirmation — transient UI state, never
     * persisted. Selecting a discard sets this (mutating NOTHING); Confirm issues
     * the authoritative jettison exactly once; Cancel clears it. `command_id` is
     * captured at selection so the eventual jettison keeps its idempotency.
     */
    pendingDiscard = null;
    /** Monotonic command counter → stable, unique command ids (duplicate-resistant). */
    commandCounter = 0;
    constructor(storageSeed, expeditionSeed, seed, scenario = "fresh") {
        this.storageSeed = storageSeed;
        this.ctx = { seed, content: expeditionSeed.content };
        this.template = createEmptySaveBlob({ game_version: "0.0.0", last_saved_utc: new Date(0).toISOString() });
        this.domain = {
            expedition: createExpeditionState(),
            harbor_operations: createHarborOperationsState(),
            harbor: createHarborState(storageSeed),
        };
        if (scenario === "overflow_demo")
            this.applyOverflowDemoScenario();
        else if (scenario === "cancel_block_demo")
            this.applyCancelBlockScenario();
        assertExpeditionDomainValid(this.domain, this.ctx.content);
    }
    /**
     * Alpha acceptance scenario: pre-fill the Harbor toward its 3S caps and the
     * Overflow toward its cap for the first Guardian's salvage resource, using
     * REAL deposit transactions (conservation-safe — never a cheat), so the next
     * expedition's unload visibly overflows and then blocks. Clearly an Alpha
     * acceptance aid, inside A4, using the real transition system.
     */
    applyOverflowDemoScenario() {
        const content = this.ctx.content;
        let harbor = this.domain.harbor;
        const overflow = {};
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
    applyCancelBlockScenario() {
        let harbor = this.domain.harbor;
        for (const resource of CORE_RESOURCES) {
            harbor = deposit(harbor, resource, harbor.resources[resource].caps.total_capacity_st1).state;
        }
        this.domain = { ...this.domain, harbor };
        const prepared = applyCommand(this.domain, { command_id: this.nextCommandId("prepare"), kind: "prepare", guardian_id: "gdn.nova" }, this.ctx);
        this.domain = prepared.domain;
        let topped = this.domain.harbor;
        for (const resource of Object.keys(this.ctx.content.supply_set)) {
            const band = topped.resources[resource];
            const room = band.caps.total_capacity_st1 - (band.safe + band.exposed);
            if (room > 0)
                topped = deposit(topped, resource, room).state;
        }
        this.domain = { ...this.domain, harbor: topped };
        this.message = "Blocked-cancel demo: the vessel is prepared and the Harbor is full. Cancelling now would exceed the 3S hard stop — cancellation will block and preserve the supplies (OPS1).";
    }
    nextCommandId(kind) {
        this.commandCounter += 1;
        return `ui.${kind}.${this.commandCounter}`;
    }
    apply(command, note) {
        let result;
        try {
            result = applyCommand(this.domain, command, this.ctx);
        }
        catch (err) {
            const message = err instanceof ExpeditionInvariantError ? err.message : String(err);
            return { ok: false, error: message, view: this.view(), applied: false, idempotent: false };
        }
        this.domain = result.domain;
        if (result.idempotent) {
            // A re-submitted (duplicate) command — nothing changed. Keep the message.
            return { ok: true, view: this.view(), applied: false, idempotent: true };
        }
        if (command.kind === "cancel" && result.cancellation_blocked) {
            this.message = "Cancellation blocked: refunding the supplies would exceed the 3S hard stop. Supplies are preserved on the vessel (OPS1).";
            return { ok: true, view: this.view(), applied: true, idempotent: false };
        }
        this.message = note;
        return { ok: true, view: this.view(), applied: true, idempotent: false };
    }
    /** UI-local Guardian selection (no command until `prepare`). */
    selectGuardian(id) {
        if (!STARTING_GUARDIANS.includes(id))
            return { ok: false, error: `unknown guardian ${id}`, view: this.view() };
        this.pendingGuardian = id;
        this.message = `${guardianLabel(id)} selected. Review the supply loadout, then prepare the vessel.`;
        return { ok: true, view: this.view() };
    }
    /** The actions offered from the current phase (what the UI renders as buttons). */
    availableActions() {
        // While a destructive discard awaits confirmation, ONLY Confirm/Cancel are
        // offered — every other Harbor-management shortcut is suppressed so a key
        // press cannot bypass the confirmation (keyboard safety).
        if (this.pendingDiscard)
            return this.confirmationActions();
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
                if (!cargo)
                    return [{ kind: "complete", label: "Complete the expedition" }];
                if (this.managementMode)
                    return this.managementActions();
                if (isUnloadBlocked(this.domain, this.ctx.content)) {
                    // Blocked soft-lock recovery: offer the Harbor-management continuation
                    // (never a dead-end "unload again" that can't progress).
                    return [{ kind: "manage", label: "Free capacity (manage Harbor storage)" }];
                }
                return [{ kind: "unload", label: "Unload recovered materials" }];
            }
            case "recovering":
                return [{ kind: "recover", label: "Perform bounded recovery (restore readiness)" }];
            default:
                return [];
        }
    }
    outcomeActions() {
        const objectiveBegun = this.domain.expedition.active?.event?.state === "ACTIVE";
        return AT_OUTPOST_OUTCOMES.filter((o) => objectiveBegun || o === "forced_withdrawal").map((o) => ({
            kind: "resolve",
            label: labelOutcome(o),
            outcome: o,
        }));
    }
    /**
     * Harbor-management actions (blocked-unload recovery): for each blocking
     * resource still aboard, offer a bounded, explicit DISCARD from a band that
     * holds stock (unsafe Overflow first, then Exposed, then Safe) to free
     * capacity — plus Resume unloading and Back. Pure enumeration (M2): the
     * offered discard descriptors are (resource, band, amount) only and carry NO
     * command id — a command id is allocated only when a discard is SELECTED
     * (perform → jettison), so repeated rendering never advances the command
     * counter or changes command identity. Cargo is never touched here; it stays
     * aboard, preserved.
     */
    managementActions() {
        const actions = [];
        const active = this.domain.expedition.active;
        if (active) {
            for (const resource of CORE_RESOURCES) {
                const aboard = active.cargo_aboard[resource] ?? 0;
                if (aboard <= 0)
                    continue;
                const band = this.domain.harbor.resources[resource];
                const held = [
                    ["overflow", this.domain.harbor_operations.overflow[resource] ?? 0],
                    ["exposed", band.exposed],
                    ["safe", band.safe],
                ];
                for (const [bandName, amount] of held) {
                    if (amount <= 0)
                        continue;
                    const discard = Math.min(aboard, amount);
                    actions.push({
                        kind: "jettison",
                        label: `Discard ${discard} ${resource} from ${bandLabel(bandName)} (free capacity)`,
                        resource,
                        band: bandName,
                        amount: discard,
                    });
                }
            }
        }
        actions.push({ kind: "resume_unload", label: "Resume unloading" });
        actions.push({ kind: "back", label: "Back to dock" });
        return actions;
    }
    /** The two-action destructive-discard confirmation (shown while a discard is pending). */
    confirmationActions() {
        const p = this.pendingDiscard;
        if (!p)
            return [];
        return [
            { kind: "confirm_discard", label: `Confirm discard — permanently remove ${p.amount} ${p.resource} from ${bandLabel(p.band)}` },
            { kind: "cancel_discard", label: "Cancel — keep the material" },
        ];
    }
    /**
     * True iff `action` semantically matches one of the actions the controller is
     * CURRENTLY offering (M1). Matching is by stable semantic descriptor (kind +
     * the fields that discriminate one offered action from another) — never object
     * identity — so a stale, fabricated, or altered descriptor (wrong outcome,
     * altered discard amount/band/resource, a management action outside management
     * mode, a jettison/confirm with no matching pending discard) does not match and
     * is refused.
     */
    actionIsOffered(action) {
        return this.availableActions().some((offered) => ExpeditionController.actionsMatch(offered, action));
    }
    static actionsMatch(offered, incoming) {
        if (offered.kind !== incoming.kind)
            return false;
        switch (offered.kind) {
            case "start":
            case "prepare":
                return offered.guardian_id === incoming.guardian_id;
            case "resolve":
                return offered.outcome === incoming.outcome;
            case "jettison":
                return (offered.resource === incoming.resource &&
                    offered.band === incoming.band &&
                    offered.amount === incoming.amount);
            default:
                return true;
        }
    }
    /**
     * Perform an offered action. Enforces action authority (M1): the submitted
     * action must match an action the controller is currently offering, else it is
     * refused with no state change — a direct programmatic caller cannot execute a
     * stale, fabricated, altered, or currently-unavailable action. The
     * authoritative sim's phase/domain guards remain as defense in depth.
     */
    perform(action) {
        if (!this.actionIsOffered(action)) {
            return {
                ok: false,
                error: `action "${action.kind}" is not offered in the current state — refused (M1 action authority)`,
                view: this.view(),
                applied: false,
                idempotent: false,
            };
        }
        switch (action.kind) {
            case "start":
                return action.guardian_id ? this.selectGuardian(action.guardian_id) : { ok: false, error: "no guardian", view: this.view() };
            case "prepare": {
                const guardian = action.guardian_id ?? this.pendingGuardian;
                if (!guardian)
                    return { ok: false, error: "select a Guardian first", view: this.view() };
                const res = this.apply({ command_id: this.nextCommandId("prepare"), kind: "prepare", guardian_id: guardian }, `Prepared Theo's vessel with ${guardianLabel(guardian)}; supplies loaded aboard. Depart when ready.`);
                if (res.ok)
                    this.pendingGuardian = null;
                return res;
            }
            case "cancel":
                return this.apply({ command_id: this.nextCommandId("cancel"), kind: "cancel" }, "Expedition cancelled; supplies refunded to Harbor stock (OPS1).");
            case "depart":
                return this.apply({ command_id: this.nextCommandId("depart"), kind: "dispatch" }, "Departed along the route; supplies are spent.");
            case "advance":
                return this.apply({ command_id: this.nextCommandId("advance"), kind: "arrive" }, "Arrived at the damaged outpost. Resolve the stabilization objective.");
            case "resolve":
                if (!action.outcome)
                    return { ok: false, error: "no outcome", view: this.view() };
                return this.apply({ command_id: this.nextCommandId("resolve"), kind: "resolve", outcome: action.outcome }, `Outcome: ${labelOutcome(action.outcome)}. Recovered materials loaded; returning.`);
            case "dock":
                return this.apply({ command_id: this.nextCommandId("dock"), kind: "dock" }, "Docked at the Harbor. Review and unload recovered materials.");
            case "unload":
                return this.apply({ command_id: this.nextCommandId("unload"), kind: "unload" }, "Unloaded: Safe Storage first, then unsafe Overflow — every unit conserved.");
            case "manage":
                this.managementMode = true;
                this.message = "Harbor management: discard a bounded quantity to free capacity, then resume unloading. Cargo stays aboard, preserved.";
                return { ok: true, view: this.view(), applied: true, idempotent: false };
            case "jettison": {
                if (!action.resource || !action.band || action.amount === undefined) {
                    return { ok: false, error: "incomplete jettison action", view: this.view(), applied: false, idempotent: false };
                }
                // SELECT only — open the destructive-action confirmation. Nothing is
                // discarded and no authoritative command is issued until Confirm. The
                // stable command id is allocated HERE, on selection (M2 — never during
                // action enumeration), and captured so the eventual jettison stays
                // idempotent (a duplicate Confirm never double-discards).
                this.pendingDiscard = {
                    resource: action.resource,
                    band: action.band,
                    amount: action.amount,
                    command_id: this.nextCommandId("jettison"),
                };
                this.message = `Permanently discard ${action.amount} ${action.resource} from ${bandLabel(action.band)}? This removes the material for good and cannot be undone.`;
                return { ok: true, view: this.view(), applied: true, idempotent: false };
            }
            case "confirm_discard": {
                const pending = this.pendingDiscard;
                // No pending discard (e.g. a duplicate Confirm) — idempotent no-op, no discard.
                if (!pending)
                    return { ok: true, view: this.view(), applied: false, idempotent: true };
                // Clear the pending prompt BEFORE issuing, so a second Confirm cannot re-issue.
                this.pendingDiscard = null;
                return this.apply({ command_id: pending.command_id, kind: "jettison", resource: pending.resource, band: pending.band, amount: pending.amount }, `Discarded ${pending.amount} ${pending.resource} from ${bandLabel(pending.band)} — capacity freed. Resume unloading.`);
            }
            case "cancel_discard":
                this.pendingDiscard = null;
                this.message = "Discard cancelled. Nothing was removed; the material is preserved.";
                return { ok: true, view: this.view(), applied: true, idempotent: false };
            case "resume_unload":
                this.managementMode = false;
                return this.apply({ command_id: this.nextCommandId("unload"), kind: "unload" }, "Resumed unloading: moved what now fits; any remainder stays aboard, preserved.");
            case "back":
                this.managementMode = false;
                this.message = "Returned to dock. Recovered cargo remains aboard, preserved.";
                return { ok: true, view: this.view(), applied: true, idempotent: false };
            case "complete":
                return this.apply({ command_id: this.nextCommandId("complete"), kind: "complete" }, "Expedition complete.");
            case "recover":
                return this.apply({ command_id: this.nextCommandId("recover"), kind: "recover" }, "Recovery complete; vessel, crew, and Guardian are ready.");
            default:
                return { ok: false, error: `unknown action ${action.kind}`, view: this.view() };
        }
    }
    /** The current renderable view. */
    view() {
        const content = this.ctx.content;
        const active = this.domain.expedition.active;
        const harbor = {};
        const overflowCap = {};
        for (const resource of CORE_RESOURCES) {
            const band = this.domain.harbor.resources[resource];
            const room = unloadRoom(this.domain, content, resource);
            harbor[resource] = {
                safe: band.safe,
                exposed: band.exposed,
                safe_capacity: band.caps.safe_capacity_st1,
                total_capacity: band.caps.total_capacity_st1,
                storage_room: room.storage,
                overflow_room: room.overflow,
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
            unload_blocked: isUnloadBlocked(this.domain, content),
            management_mode: this.managementMode && this.domain.expedition.phase === "docked",
            pending_discard: this.pendingDiscard
                ? { resource: this.pendingDiscard.resource, band: this.pendingDiscard.band, amount: this.pendingDiscard.amount }
                : null,
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
    toSaveBlob(lastSavedUtc) {
        return {
            ...this.template,
            meta: { ...this.template.meta, last_saved_utc: lastSavedUtc },
            resources: toResourceBands(this.domain.harbor),
            expedition: this.domain.expedition,
            harbor_operations: this.domain.harbor_operations,
        };
    }
    /**
     * Canonical JSON string for persistence (the exact bytes the Rust bridge
     * writes). Runs the complete shared validation BEFORE persistence (H2) so the
     * desktop save path can never write a malformed SaveBlob — invalid state
     * throws here and the Rust bridge is never handed it.
     */
    serialize(lastSavedUtc) {
        const blob = this.toSaveBlob(lastSavedUtc);
        assertSaveBlobValid(blob);
        return canonicalSerialize(blob);
    }
    /**
     * Restore a controller from a persisted save string: migrate to v4, rebuild
     * the domain from the real blocks, and re-assert every structural invariant
     * (harbor 3S, claim ledger, expedition/overflow). Malformed state throws —
     * never silently repaired.
     */
    static fromSerialized(json, storageSeed, expeditionSeed, seed) {
        const parsed = JSON.parse(json);
        const migrated = migrateSaveBlobToCurrent(parsed);
        // Complete shared validation (H2): the precompiled schema validator + every
        // semantic invariant — the SAME contract the Node save path enforces. Nothing
        // is accepted into controller state until this passes (malformed non-
        // expedition blocks, bad event identity, and tampered committed-command
        // records are all refused here).
        assertSaveBlobValid(migrated);
        const blob = migrated;
        const harbor = fromResourceBands(blob.resources, storageSeed); // asserts 3S validity (defense in depth)
        assertClaimStateValid(blob.claim_ledger, blob.pending_reward_resolution);
        const controller = new ExpeditionController(storageSeed, expeditionSeed, seed);
        controller.template = blob;
        controller.domain = { expedition: blob.expedition, harbor_operations: blob.harbor_operations, harbor };
        assertExpeditionDomainValid(controller.domain, expeditionSeed.content); // also checks the /data overflow cap
        // Continue the command counter beyond every persisted committed id so a
        // resumed session never reissues a committed command id (duplicate-command
        // resistance across save/reload — H3).
        controller.commandCounter = ExpeditionController.counterFloor(blob.expedition.committed_command_ids);
        controller.message = "Resumed the saved expedition exactly where it left off.";
        return controller;
    }
    /**
     * The highest UI command-counter value embedded in the persisted committed
     * command ids (`ui.<kind>.<counter>`), so a resumed session's next allocation
     * is strictly greater than any id already committed (H3 — no reissue across
     * save/reload, even though the record now holds many ids, not just the last).
     */
    static counterFloor(committedCommandIds) {
        let floor = 0;
        for (const id of committedCommandIds) {
            const n = Number(id.split(".").pop());
            if (Number.isFinite(n) && n > floor)
                floor = n;
        }
        return floor;
    }
}
export const CONTROLLER_GUARDIANS = STARTING_GUARDIANS;
