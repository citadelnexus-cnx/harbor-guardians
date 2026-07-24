/**
 * Shared, browser-safe SaveBlob validation — the single validation contract used
 * by BOTH the Node/test save pipeline and the Tauri desktop/controller path
 * (HG-POST-A4-STABILIZATION-01 H2). No `node:*` imports, no ajv runtime
 * dependency: schema validation runs through the GENERATED, precompiled
 * standalone validator (save-blob-schema-validator.mjs, produced from the
 * committed schema/save_blob.schema.json), and the semantic invariants JSON
 * Schema cannot express run here too. Because both paths call
 * `assertSaveBlobValid`, a malformed non-expedition block, a bad event identity,
 * or a tampered committed-command record is refused identically whether the save
 * came through Node or the desktop bridge — there is exactly one contract.
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15;
 * 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §3/§5;
 * HG_POST_A4_STABILIZATION_01_EXECUTION_BRIEF v0.1 §3 (H2).
 * Invariant refs: S7 (validation before commit / before load acceptance), DC5,
 * EVT3 (event identity), plus the H3 committed-command record shape.
 */
import { assertCommittedCommandRecordShape } from "../sim/expedition.js";
import validateSaveBlobSchema from "./generated/save-blob-schema-validator.mjs";
/** Thrown when a blob fails schema validation — the save aborts before commit (S7). */
export class SaveValidationError extends Error {
    constructor(detail) {
        super(`save blob failed schema validation — save aborted before commit (S7): ${detail}`);
        this.name = "SaveValidationError";
    }
}
/**
 * Thrown when a blob violates a semantic invariant JSON Schema cannot express
 * (persisted-event identity; the A4 expedition phase/active coupling + overflow
 * non-negativity; the H3 committed-command record shape). Like a schema failure
 * it aborts before commit (saveAtomically) and before a save is accepted into
 * controller/game state (loadSave / controller load).
 */
export class SaveIdentityError extends Error {
    constructor(detail) {
        super(`save blob failed semantic validation — aborted before commit/accept: ${detail}`);
        this.name = "SaveIdentityError";
    }
}
/** Human-readable summary of the precompiled validator's error objects. */
function formatSchemaErrors(errors) {
    if (!errors || errors.length === 0)
        return "unknown schema violation";
    return errors
        .map((e) => `${e.instancePath && e.instancePath.length > 0 ? e.instancePath : "(root)"} ${e.message ?? "is invalid"}`)
        .join("; ");
}
/**
 * Pure identity-level invariant over the persisted `events` collection (EVT3):
 * every `instance_id` is a non-empty string and unique across the collection, so
 * a duplicate or empty identity is rejected loudly before an event can be
 * resumed. Multiple DISTINCT instances may legitimately reference the same
 * `event_id`; that is not a conflict. JSON Schema cannot express unique-by-
 * property, so this runs alongside schema validation.
 */
export function assertPersistedEventIdentity(events) {
    const seen = new Set();
    for (const [index, record] of events.entries()) {
        const id = record.instance_id;
        if (typeof id !== "string" || id === "") {
            throw new SaveIdentityError(`events[${index}] has an empty or non-string instance_id`);
        }
        if (seen.has(id)) {
            throw new SaveIdentityError(`duplicate persisted instance_id "${id}" — exactly-once lifecycle resumption requires unique event identity`);
        }
        seen.add(id);
    }
}
/** The A4 expedition phases that require an active expedition (everything but idle). */
const NON_IDLE_PHASES = [
    "preparing",
    "en_route",
    "at_outpost",
    "returning",
    "docked",
    "recovering",
];
/**
 * Pure structural invariants over the persisted A4/A5 blocks that JSON Schema
 * cannot express — the phase/active coupling (an active expedition exists iff
 * the phase is not idle), non-negativity of the overflow holdings and counters,
 * and the H3 committed-command record shape (bounded, unique, empty-at-idle). A
 * tampered save that violates these is refused loudly before commit and before
 * acceptance. The deeper overflow-CAP check needs the /data seed's Safe capacity
 * and runs in the sim (assertExpeditionDomainValid), not here.
 */
export function assertExpeditionSaveShape(expedition, ops) {
    const idle = expedition.phase === "idle";
    if (idle && expedition.active !== null) {
        throw new SaveIdentityError("expedition phase is idle but an active expedition is present");
    }
    if (NON_IDLE_PHASES.includes(expedition.phase) && expedition.active === null) {
        throw new SaveIdentityError(`expedition phase is ${expedition.phase} but no active expedition is present`);
    }
    if (!Number.isInteger(expedition.next_expedition_index) || expedition.next_expedition_index < 0) {
        throw new SaveIdentityError(`expedition.next_expedition_index must be a non-negative integer`);
    }
    // H3 committed-command record — reuse the sim's single source of truth for the
    // rule, but surface it as a save-path SaveIdentityError for a consistent
    // malformed-save contract across Node and desktop.
    try {
        assertCommittedCommandRecordShape(expedition.committed_command_ids, expedition.phase);
    }
    catch (err) {
        throw new SaveIdentityError(err instanceof Error ? err.message : String(err));
    }
    if (!Number.isInteger(ops.completed_expeditions) || ops.completed_expeditions < 0) {
        throw new SaveIdentityError(`harbor_operations.completed_expeditions must be a non-negative integer`);
    }
    for (const [resource, amount] of Object.entries(ops.overflow)) {
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
            throw new SaveIdentityError(`harbor_operations.overflow.${resource} must be a finite non-negative number`);
        }
    }
}
/**
 * The complete, shared save-validation sequence (H2). Runs the precompiled
 * schema validator (structure + version-gated block shapes) first, then every
 * semantic invariant the schema cannot express (event identity; expedition
 * phase/active coupling; overflow non-negativity; committed-command record).
 * Throws SaveValidationError (schema) or SaveIdentityError (semantic). Used
 * identically by the Node save validator and the desktop/controller path.
 */
export function assertSaveBlobValid(blob) {
    if (!validateSaveBlobSchema(blob)) {
        throw new SaveValidationError(formatSchemaErrors(validateSaveBlobSchema.errors));
    }
    assertPersistedEventIdentity(blob.events);
    assertExpeditionSaveShape(blob.expedition, blob.harbor_operations);
}
