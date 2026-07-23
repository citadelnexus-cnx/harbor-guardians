/**
 * Expedition loop spine — Alpha A4 "Bounded First Playable Expedition Loop"
 * (owner Alpha A4 authorization, 2026-07-23, Option A). Pure, deterministic,
 * headless: no I/O, no RNG, no wall-clock — every command maps immutable
 * inputs to new outputs, so the sim harness replays it byte-identically
 * (Sim §2). The ONLY numeric literal in this file is the identity 0; every
 * gameplay number comes from the schema-validated /data expedition seed (No
 * Magic Numbers, DC1).
 *
 * What this is (brief §1–§3): one canonical, repeatable Harbor →
 * route-anchor-outpost → Harbor loop as a strict deterministic state machine
 * driven by stable, duplicate-resistant commands:
 *
 *   idle ─prepare→ preparing ─dispatch→ en_route ─arrive→ at_outpost
 *        ─resolve→ returning ─dock→ docked ─(unload*)→ ─complete→
 *        recovering ─recover→ idle           (clean expeditions skip recovering)
 *   preparing ─cancel→ idle                  (full supply refund — OPS1)
 *
 * Conservation, everywhere (CLAUDE.md §5 — no hidden loss):
 *   - Preparation WITHDRAWS the seeded supply set from the Harbor onto the
 *     vessel; cancellation REFUNDS it exactly via the A1 deposit valve
 *     (Safe→Exposed→3S), and blocks by default if the refund would breach 3S
 *     (OPS1); dispatch SPENDS it.
 *   - Resolution loads a seeded, deterministic salvage yield into the vessel
 *     hold. This is the expedition's authorized recovered material (brief
 *     §2.11) — NOT Claim-Ledger reward generation and NOT D20 Docked-Cargo
 *     routing (both FUTURE BUILD). The Claim Ledger is untouched by A4.
 *   - Unloading is a three-tier conservation transaction per resource:
 *     Safe Storage (A1 deposit, Safe→Exposed→3S) → unsafe Overflow (capped at
 *     `overflow_cap_multiplier × Safe capacity S`) → blocked remainder stays
 *     ABOARD (preserved, never dropped — brief §2.13). arrived ==
 *     to_storage + to_overflow + left_aboard, asserted per resource.
 *
 * Guardian equivalence (brief §4): `guardian_id` selects only which resource
 * the equal-total salvage arrives as (seed `guardian_primary_salvage`); the
 * total is identical across Guardians. A sidegrade, never superior — no
 * leveling, power, or success change.
 *
 * Bounded EVT reuse (brief §2.6): the at-outpost objective is a real EVT1–EVT4
 * event. At arrival the sim builds a schema-shaped Event and advances its
 * instance over OBSERVABLE state (EVT4 harbor trigger) through the A3 lifecycle
 * (EVT2). Staged effects are INERT descriptors — never executed (EVT5+
 * fail-loud). A resolvable outcome requires the objective to have BEGUN
 * (event ACTIVE); if the observable trigger was unmet, only forced_withdrawal
 * is available.
 *
 * Governing docs:
 *   - ALPHA_A4_EXECUTION_BRIEF v0.1 §1–§13
 *   - 01_ECONOMY_FOUNDATION v1.7 §5/§6 (deposit fill order; 3S hard stop)
 *   - 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 (A4 does NOT route through it)
 *   - 15_EVENT_SYSTEM_SPEC v0.2 §2/§3 (embedded lifecycle)
 *   - SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §4.7 (OPS1 cancel/refund)
 *   - CLAUDE.md §5 (preserve, don't rewrite; no hidden loss)
 * Invariant refs: OPS1 (cancel/refund routing — converted at A4); S5/S7 (this
 * state persists in SaveBlob v4); EVT1/EVT2/EVT4 (bounded reuse). A4-specific
 * conservation/overflow/recovery/determinism/idempotency properties are proven
 * in tests/expedition.test.ts.
 */
import { createClaimLedgerState } from "./claim-ledger.js";
import { advance, createEventInstance, } from "./event-lifecycle.js";
import { CORE_RESOURCES, deposit, withdraw } from "./harbor-state.js";
/** Thrown when a command would violate A4 expedition doctrine or lose/duplicate value. */
export class ExpeditionInvariantError extends Error {
    constructor(detail) {
        super(`expedition invariant violated: ${detail}`);
        this.name = "ExpeditionInvariantError";
    }
}
/** The four at-outpost resolvable outcomes (cancellation is a distinct pre-dispatch path). */
export const AT_OUTPOST_OUTCOMES = [
    "full_success",
    "partial_success",
    "retreat",
    "forced_withdrawal",
];
/** True for any outcome resolvable at the outpost (i.e. not the pre-dispatch cancellation). */
export function isAtOutpostOutcome(outcome) {
    return outcome !== "cancelled";
}
/** The three starting Guardians (brief §2.3). */
export const STARTING_GUARDIANS = ["gdn.raxa", "gdn.tarin", "gdn.nova"];
/** Empty/identity expedition domain state (world-creation). */
export function createExpeditionState() {
    return { phase: "idle", active: null, next_expedition_index: 0, last_command_id: null };
}
/** Empty/identity harbor-operations state (world-creation). */
export function createHarborOperationsState() {
    return { overflow: {}, canonical_intro_consumed: false, route_anchor_operations_unlocked: false, completed_expeditions: 0 };
}
/** Deterministic canonical iteration over a partial resource map (CORE_RESOURCES order). */
function amountEntries(amounts) {
    const entries = [];
    for (const resource of CORE_RESOURCES) {
        const amount = amounts[resource];
        if (amount !== undefined && amount !== 0)
            entries.push([resource, amount]);
    }
    return entries;
}
function assertFiniteNonNegative(label, value) {
    if (!Number.isFinite(value) || value < 0) {
        throw new ExpeditionInvariantError(`${label} must be a finite non-negative number, got ${value}`);
    }
}
/**
 * Withdraw `amount` of `resource` from the Harbor across bands (Safe first,
 * then Exposed). Throws if the combined stock is insufficient — supplies can
 * never be conjured, and a stock never goes negative.
 */
function withdrawTotal(harbor, resource, amount) {
    assertFiniteNonNegative(`supply ${resource}`, amount);
    const band = harbor.resources[resource];
    if (amount > band.safe + band.exposed) {
        throw new ExpeditionInvariantError(`cannot prepare: Harbor has ${band.safe + band.exposed} ${resource} but the supply set needs ${amount}`);
    }
    const fromSafe = Math.min(amount, band.safe);
    let next = withdraw(harbor, resource, "safe", fromSafe);
    const fromExposed = amount - fromSafe;
    if (fromExposed > 0)
        next = withdraw(next, resource, "exposed", fromExposed);
    return next;
}
/**
 * The bounded at-outpost event (EVT1–EVT4 reuse). Its outcomes mirror the four
 * at-outpost ExpeditionOutcomes; every effect is an INERT descriptor
 * (guardian_reaction — a non-delivering flavor binding, never executed). The
 * sole trigger observes the Harbor Provisions band (EVT4) at the seeded
 * threshold — the objective becomes eligible only when it holds.
 */
export function buildOutpostEvent(content) {
    const eventId = content.event.event_id;
    return {
        event_id: eventId,
        class: "expedition",
        triggers: [
            { kind: "harbor_resource_at_least", resource: "Provisions", band: "total", amount: content.event.min_provisions_to_begin },
        ],
        offer_window: { kind: "imposed" },
        objectives: [{ objective_id: `${eventId}.stabilize` }],
        outcomes: [
            { outcome_id: "full_success", effects: [{ effect_id: `${eventId}.full.reaction`, binds_to: "guardian_reaction" }] },
            { outcome_id: "partial_success", effects: [{ effect_id: `${eventId}.partial.reaction`, binds_to: "guardian_reaction" }] },
            { outcome_id: "retreat", effects: [] },
            { outcome_id: "forced_withdrawal", effects: [] },
        ],
        chain_next: null,
        invariant_refs: ["EVT1", "EVT2", "EVT4"],
    };
}
/** The equal-total salvage yield for an (outcome, guardian): the seeded total, entirely in the guardian's resource. */
export function salvageFor(content, outcome, guardian) {
    if (outcome === "cancelled")
        return {};
    const total = content.salvage_total[outcome];
    assertFiniteNonNegative(`salvage_total.${outcome}`, total);
    if (total === 0)
        return {};
    const resource = content.guardian_primary_salvage[guardian];
    return { [resource]: total };
}
/** Per-resource unsafe Overflow cap = seeded multiplier × current Safe capacity S (brief §2.12). */
function overflowCap(content, harbor, resource) {
    return content.overflow_cap_multiplier * harbor.resources[resource].caps.safe_capacity_st1;
}
/** Free room for one resource across the two unload tiers: Safe Storage (to 3S) and unsafe Overflow (to its cap). */
export function unloadRoom(domain, content, resource) {
    const band = domain.harbor.resources[resource];
    const storage = Math.max(band.caps.total_capacity_st1 - (band.safe + band.exposed), 0);
    const overflow = Math.max(overflowCap(content, domain.harbor, resource) - (domain.harbor_operations.overflow[resource] ?? 0), 0);
    return { storage, overflow };
}
/**
 * True when a further unload would move at least one unit — i.e. some aboard
 * resource still has Safe Storage or Overflow room. When there is cargo aboard
 * and this is false, unloading is BLOCKED (the soft-lock the jettison recovery
 * path resolves). Pure function of the persisted authoritative state, so it is
 * stable across save/reload.
 */
export function unloadWouldProgress(domain, content) {
    const active = domain.expedition.active;
    if (!active)
        return false;
    for (const [resource] of amountEntries(active.cargo_aboard)) {
        const room = unloadRoom(domain, content, resource);
        if (room.storage > 0 || room.overflow > 0)
            return true;
    }
    return false;
}
/** True when there is cargo aboard AND no further unload can make progress (docked soft-lock). */
export function isUnloadBlocked(domain, content) {
    const active = domain.expedition.active;
    if (!active || amountEntries(active.cargo_aboard).length === 0)
        return false;
    return !unloadWouldProgress(domain, content);
}
/** Build the ObservableState for the at-outpost EVT4 evaluation from the domain + context. */
function observedState(domain, ctx) {
    return {
        harbor: domain.harbor,
        ledger: ctx.ledger ?? createClaimLedgerState(),
        resolved_event_ids: ctx.resolved_event_ids ?? [],
    };
}
// ── Structural validity ──────────────────────────────────────────────────────
const PHASES = [
    "idle",
    "preparing",
    "en_route",
    "at_outpost",
    "returning",
    "docked",
    "recovering",
];
/**
 * Shape-level validity of the persisted A4 state (used after load, and by the
 * save validator's lighter guard). Overflow never negative or above its cap;
 * counters non-negative; phase/active consistency; cargo/supply amounts
 * positive-finite. Every command returns only states that pass this.
 */
export function assertExpeditionDomainValid(domain, content) {
    const { expedition: exp, harbor_operations: ops, harbor } = domain;
    if (!PHASES.includes(exp.phase)) {
        throw new ExpeditionInvariantError(`unknown expedition phase "${exp.phase}"`);
    }
    if (exp.phase === "idle") {
        if (exp.active !== null)
            throw new ExpeditionInvariantError("phase idle must carry no active expedition");
    }
    else if (exp.active === null) {
        throw new ExpeditionInvariantError(`phase ${exp.phase} requires an active expedition`);
    }
    if (!Number.isInteger(exp.next_expedition_index) || exp.next_expedition_index < 0) {
        throw new ExpeditionInvariantError(`next_expedition_index must be a non-negative integer, got ${exp.next_expedition_index}`);
    }
    if (!Number.isInteger(ops.completed_expeditions) || ops.completed_expeditions < 0) {
        throw new ExpeditionInvariantError(`completed_expeditions must be a non-negative integer, got ${ops.completed_expeditions}`);
    }
    for (const [resource, amount] of amountEntries(ops.overflow)) {
        assertFiniteNonNegative(`overflow.${resource}`, amount);
        const cap = overflowCap(content, harbor, resource);
        if (amount > cap) {
            throw new ExpeditionInvariantError(`overflow.${resource} ${amount} exceeds cap ${cap} (${content.overflow_cap_multiplier}× Safe S)`);
        }
    }
    if (exp.active) {
        for (const [resource, amount] of amountEntries(exp.active.supplies_committed)) {
            assertFiniteNonNegative(`supplies_committed.${resource}`, amount);
        }
        for (const [resource, amount] of amountEntries(exp.active.cargo_aboard)) {
            assertFiniteNonNegative(`cargo_aboard.${resource}`, amount);
        }
    }
}
// ── Command application ───────────────────────────────────────────────────────
function withExpedition(domain, patch) {
    return { ...domain.expedition, ...patch };
}
function requirePhase(domain, phase, kind) {
    if (domain.expedition.phase !== phase) {
        throw new ExpeditionInvariantError(`command "${kind}" requires phase ${phase} but the domain is ${domain.expedition.phase} — the state is unchanged`);
    }
}
function requireActive(domain, kind) {
    if (!domain.expedition.active) {
        throw new ExpeditionInvariantError(`command "${kind}" requires an active expedition`);
    }
    return domain.expedition.active;
}
function anyDamaged(active) {
    return active.vessel_condition === "damaged" || active.crew_condition === "damaged" || active.guardian_condition === "damaged";
}
/**
 * Apply one command to the expedition domain. Pure and deterministic: inputs
 * are never mutated. Re-applying the last command id is an idempotent no-op
 * (brief §3, duplicate-command resistance); every illegal (phase, command)
 * pair throws and leaves the input unchanged. Returns the new domain plus full
 * accounting for value-moving commands (cancel refund, unload).
 */
export function applyCommand(domain, command, ctx) {
    // Idempotent duplicate-command guard: a repeat of the last applied command
    // id is a no-op (e.g. a double-submitted button), never a second effect.
    if (command.command_id !== "" && command.command_id === domain.expedition.last_command_id) {
        return { domain, applied: false, idempotent: true };
    }
    if (command.command_id === "") {
        throw new ExpeditionInvariantError("command_id must be non-empty (stable command identity, brief §3)");
    }
    const content = ctx.content;
    const stamp = (expedition) => ({ ...expedition, last_command_id: command.command_id });
    switch (command.kind) {
        case "prepare": {
            requirePhase(domain, "idle", command.kind);
            if (!STARTING_GUARDIANS.includes(command.guardian_id)) {
                throw new ExpeditionInvariantError(`unknown starting guardian "${command.guardian_id}"`);
            }
            // Withdraw the seeded supply set onto the vessel (fails loud if the Harbor lacks it).
            let harbor = domain.harbor;
            const committed = {};
            for (const [resource, amount] of amountEntries(content.supply_set)) {
                harbor = withdrawTotal(harbor, resource, amount);
                committed[resource] = amount;
            }
            const index = domain.expedition.next_expedition_index;
            const active = {
                expedition_id: `exp.${index}`,
                expedition_seed: ctx.seed + index,
                content_id: content.content_id,
                guardian_id: command.guardian_id,
                supplies_committed: committed,
                dispatched: false,
                outcome: null,
                cargo_aboard: {},
                vessel_condition: "ready",
                crew_condition: "ready",
                guardian_condition: "ready",
                event: null,
            };
            const next = {
                harbor,
                harbor_operations: { ...domain.harbor_operations, canonical_intro_consumed: true },
                expedition: stamp(withExpedition(domain, { phase: "preparing", active, next_expedition_index: index + 1 })),
            };
            assertExpeditionDomainValid(next, content);
            return { domain: next, applied: true, idempotent: false };
        }
        case "cancel": {
            requirePhase(domain, "preparing", command.kind);
            const active = requireActive(domain, command.kind);
            if (active.dispatched) {
                throw new ExpeditionInvariantError("cannot cancel a dispatched expedition — supplies are already spent");
            }
            // Refund the committed supplies to Harbor stock via the A1 deposit valve
            // (Safe→Exposed→3S). If ANY resource would breach 3S, cancellation blocks
            // by default and the supplies stay committed (OPS1 — never silently
            // deleted, never routed to the Claim Ledger).
            let harbor = domain.harbor;
            const per = {};
            let anyBlocked = false;
            for (const [resource, amount] of amountEntries(active.supplies_committed)) {
                const result = deposit(harbor, resource, amount);
                if (result.blocked_at_cap > 0)
                    anyBlocked = true;
                harbor = result.state;
                per[resource] = { refunded: result.deposited_to_safe + result.deposited_to_exposed, blocked: result.blocked_at_cap };
            }
            if (anyBlocked) {
                // Blocked cancellation: discard the partial refund attempt (start from
                // the un-refunded domain) so supplies remain committed and preserved.
                const held = {};
                let totalBlocked = 0;
                for (const [resource, amount] of amountEntries(active.supplies_committed)) {
                    held[resource] = { refunded: 0, blocked: amount };
                    totalBlocked += amount;
                }
                const next = { ...domain, expedition: stamp(domain.expedition) };
                return {
                    domain: next,
                    applied: true,
                    idempotent: false,
                    cancellation_blocked: true,
                    refund: { per_resource: held, total_refunded: 0, total_blocked: totalBlocked },
                };
            }
            let totalRefunded = 0;
            for (const [, acc] of Object.entries(per))
                totalRefunded += acc?.refunded ?? 0;
            const next = {
                harbor,
                harbor_operations: domain.harbor_operations,
                expedition: stamp(withExpedition(domain, { phase: "idle", active: null })),
            };
            assertExpeditionDomainValid(next, content);
            return {
                domain: next,
                applied: true,
                idempotent: false,
                refund: { per_resource: per, total_refunded: totalRefunded, total_blocked: 0 },
            };
        }
        case "dispatch": {
            requirePhase(domain, "preparing", command.kind);
            const active = requireActive(domain, command.kind);
            const next = {
                ...domain,
                expedition: stamp(withExpedition(domain, { phase: "en_route", active: { ...active, dispatched: true } })),
            };
            assertExpeditionDomainValid(next, content);
            return { domain: next, applied: true, idempotent: false };
        }
        case "arrive": {
            requirePhase(domain, "en_route", command.kind);
            const active = requireActive(domain, command.kind);
            // Build and advance the at-outpost EVT event as far as OBSERVABLE state
            // permits (EVT4): DORMANT → ELIGIBLE (triggers hold) → TRIGGERED → ACTIVE.
            // An unmet trigger leaves it DORMANT; only forced_withdrawal is then
            // resolvable (the objective could not be begun).
            const event = buildOutpostEvent(content);
            let instance = createEventInstance(event, `${active.expedition_id}.${event.event_id}`);
            const eligible = advance(event, instance, { kind: "evaluate", observed: observedState(domain, ctx) });
            instance = eligible.instance;
            if (eligible.transitioned) {
                instance = advance(event, instance, { kind: "present" }).instance; // ELIGIBLE → TRIGGERED (imposed)
                instance = advance(event, instance, { kind: "begin" }).instance; //   TRIGGERED → ACTIVE
            }
            const next = {
                ...domain,
                expedition: stamp(withExpedition(domain, { phase: "at_outpost", active: { ...active, event: instance } })),
            };
            assertExpeditionDomainValid(next, content);
            return { domain: next, applied: true, idempotent: false };
        }
        case "resolve": {
            requirePhase(domain, "at_outpost", command.kind);
            const active = requireActive(domain, command.kind);
            const outcome = command.outcome;
            if (!isAtOutpostOutcome(outcome)) {
                throw new ExpeditionInvariantError(`"${outcome}" is not an at-outpost outcome (cancellation is a pre-dispatch path)`);
            }
            const objectiveBegun = active.event?.state === "ACTIVE";
            if (outcome !== "forced_withdrawal" && !objectiveBegun) {
                throw new ExpeditionInvariantError(`cannot resolve "${outcome}": the outpost objective was never begun (EVT4 trigger unmet) — only forced_withdrawal is available`);
            }
            // Advance the embedded event to RESOLVED when the objective was begun
            // (staging inert effects); leave it DORMANT for an un-begun forced
            // withdrawal. The event is deterministic and never executes an effect.
            let event = active.event;
            const eventObj = buildOutpostEvent(content);
            if (objectiveBegun && event) {
                event = advance(eventObj, event, { kind: "complete", outcome_id: outcome }).instance;
                event = advance(eventObj, event, { kind: "finalize" }).instance;
            }
            const readiness = content.outcome_readiness[outcome];
            const cargo = salvageFor(content, outcome, active.guardian_id);
            const next = {
                ...domain,
                expedition: stamp(withExpedition(domain, {
                    phase: "returning",
                    active: {
                        ...active,
                        outcome,
                        cargo_aboard: cargo,
                        vessel_condition: readiness.vessel,
                        crew_condition: readiness.crew,
                        guardian_condition: readiness.guardian,
                        event,
                    },
                })),
            };
            assertExpeditionDomainValid(next, content);
            return { domain: next, applied: true, idempotent: false };
        }
        case "dock": {
            requirePhase(domain, "returning", command.kind);
            requireActive(domain, command.kind);
            const next = { ...domain, expedition: stamp(withExpedition(domain, { phase: "docked" })) };
            assertExpeditionDomainValid(next, content);
            return { domain: next, applied: true, idempotent: false };
        }
        case "unload": {
            requirePhase(domain, "docked", command.kind);
            const active = requireActive(domain, command.kind);
            let harbor = domain.harbor;
            const overflow = { ...domain.harbor_operations.overflow };
            const remainingAboard = {};
            const per = {};
            for (const [resource, arrived] of amountEntries(active.cargo_aboard)) {
                // Tier 1: Safe Storage (A1 deposit — Safe→Exposed→3S).
                const dep = deposit(harbor, resource, arrived);
                harbor = dep.state;
                const toStorage = dep.deposited_to_safe + dep.deposited_to_exposed;
                // Tier 2: unsafe Overflow, capped at multiplier × Safe capacity S.
                const cap = overflowCap(content, harbor, resource);
                const room = Math.max(cap - (overflow[resource] ?? 0), 0);
                const toOverflow = Math.min(dep.blocked_at_cap, room);
                if (toOverflow > 0)
                    overflow[resource] = (overflow[resource] ?? 0) + toOverflow;
                // Tier 3: blocked remainder stays aboard (preserved — brief §2.13).
                const leftAboard = dep.blocked_at_cap - toOverflow;
                if (leftAboard > 0)
                    remainingAboard[resource] = leftAboard;
                if (toStorage + toOverflow + leftAboard !== arrived) {
                    throw new ExpeditionInvariantError(`unload conservation violated for ${resource}: ${toStorage} + ${toOverflow} + ${leftAboard} != ${arrived}`);
                }
                per[resource] = { arrived, to_storage: toStorage, to_overflow: toOverflow, left_aboard: leftAboard };
            }
            const fullyUnloaded = amountEntries(remainingAboard).length === 0;
            const next = {
                harbor,
                harbor_operations: { ...domain.harbor_operations, overflow },
                expedition: stamp(withExpedition(domain, { active: { ...active, cargo_aboard: remainingAboard } })),
            };
            assertExpeditionDomainValid(next, content);
            return { domain: next, applied: true, idempotent: false, unload: { per_resource: per, fully_unloaded: fullyUnloaded } };
        }
        case "jettison": {
            // Explicit discard-to-free-capacity — the bounded recovery path for a
            // blocked-unloading soft-lock (PR #21 acceptance finding). Legal only at
            // the dock (the unload context). Reduces exactly one band by an exact
            // amount through the authoritative storage operations (never a direct
            // overwrite); a stock/holding never goes negative; the discarded amount
            // is reported, never silently deleted (D30 discard-with-confirm).
            requirePhase(domain, "docked", command.kind);
            requireActive(domain, command.kind);
            assertFiniteNonNegative(`jettison ${command.resource} amount`, command.amount);
            if (command.amount === 0) {
                throw new ExpeditionInvariantError("jettison amount must be positive — nothing to discard");
            }
            let jettisonHarbor = domain.harbor;
            let jettisonOps = domain.harbor_operations;
            if (command.band === "overflow") {
                const current = jettisonOps.overflow[command.resource] ?? 0;
                if (command.amount > current) {
                    throw new ExpeditionInvariantError(`cannot jettison ${command.amount} ${command.resource} from Overflow — only ${current} held (stocks never go negative)`);
                }
                const nextOverflow = { ...jettisonOps.overflow };
                const remaining = current - command.amount;
                if (remaining === 0)
                    delete nextOverflow[command.resource];
                else
                    nextOverflow[command.resource] = remaining;
                jettisonOps = { ...jettisonOps, overflow: nextOverflow };
            }
            else {
                // Safe / Exposed: the A1 authoritative withdraw (throws if amount exceeds the band; never negative).
                jettisonHarbor = withdraw(jettisonHarbor, command.resource, command.band, command.amount);
            }
            const next = {
                harbor: jettisonHarbor,
                harbor_operations: jettisonOps,
                expedition: stamp(domain.expedition),
            };
            assertExpeditionDomainValid(next, content);
            return {
                domain: next,
                applied: true,
                idempotent: false,
                jettisoned: { resource: command.resource, band: command.band, amount: command.amount },
            };
        }
        case "complete": {
            requirePhase(domain, "docked", command.kind);
            const active = requireActive(domain, command.kind);
            if (amountEntries(active.cargo_aboard).length > 0) {
                throw new ExpeditionInvariantError("cannot complete: cargo remains aboard — unload it first (no stranding; material stays preserved)");
            }
            const damaged = anyDamaged(active);
            const ops = {
                ...domain.harbor_operations,
                completed_expeditions: domain.harbor_operations.completed_expeditions + 1,
                route_anchor_operations_unlocked: domain.harbor_operations.route_anchor_operations_unlocked || active.outcome === "full_success",
            };
            const expedition = damaged
                ? withExpedition(domain, { phase: "recovering" })
                : withExpedition(domain, { phase: "idle", active: null });
            const next = { harbor: domain.harbor, harbor_operations: ops, expedition: stamp(expedition) };
            assertExpeditionDomainValid(next, content);
            return { domain: next, applied: true, idempotent: false };
        }
        case "recover": {
            requirePhase(domain, "recovering", command.kind);
            requireActive(domain, command.kind);
            // Bounded recovery (brief §2.15): a single command restores readiness and
            // returns the domain to idle-ready. A resource-costed recovery is FUTURE
            // BUILD (not claimed here).
            const next = {
                ...domain,
                expedition: stamp(withExpedition(domain, { phase: "idle", active: null })),
            };
            assertExpeditionDomainValid(next, content);
            return { domain: next, applied: true, idempotent: false };
        }
        default: {
            const impossible = command;
            throw new ExpeditionInvariantError(`unknown command "${impossible.kind}"`);
        }
    }
}
