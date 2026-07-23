/**
 * Save-blob schema validation — step 2 of the atomic save pipeline
 * (Save/Load §15: "Write to a temp file. Validate schema. Flush. Rename.").
 *
 * Validates against the GENERATED /schema/save_blob.schema.json (D39; drift-
 * guarded by `pnpm run schema:validate`). Uses ajv — currently a
 * devDependency, which is correct for M0 where the save path runs only under
 * tests/harness; whether shipping builds bundle ajv or a precompiled
 * validator is an Alpha packaging decision.
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §15;
 * 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §3/§5.
 * Invariant refs: S7 (validation before commit), DC5.
 */

import { readFileSync } from "node:fs";
import Ajv from "ajv";
import type { SaveBlob } from "../contracts/save-blob.js";
import type { ExpeditionState, HarborOperationsState } from "../contracts/expedition.js";

/** Thrown when a blob fails schema validation — the save aborts before commit (S7). */
export class SaveValidationError extends Error {
  constructor(detail: string) {
    super(`save blob failed schema validation — save aborted before commit (S7): ${detail}`);
    this.name = "SaveValidationError";
  }
}

/**
 * Thrown when the persisted events collection violates instance-identity
 * integrity — a semantic invariant JSON Schema cannot express (non-empty
 * string, unique-by-field). Like a schema failure it aborts before commit
 * (in saveAtomically) and before an event can be resumed (in loadSave).
 */
export class SaveIdentityError extends Error {
  constructor(detail: string) {
    super(`save blob failed persisted-identity validation — aborted before commit/resume (EVT3): ${detail}`);
    this.name = "SaveIdentityError";
  }
}

export type SaveBlobValidator = (blob: unknown) => asserts blob is SaveBlob;

/** Default location of the generated schema, relative to the repo root (the cwd for all M0 tooling). */
export const SAVE_BLOB_SCHEMA_PATH = "schema/save_blob.schema.json";

/**
 * Pure identity-level invariant over the persisted `events` collection
 * (EVT3): every `instance_id` is a non-empty string, and every `instance_id`
 * is unique across the whole collection — so a duplicate or empty identity
 * is rejected loudly before an event can be resumed. Multiple DISTINCT
 * instances may legitimately reference the same `event_id`; that is not an
 * identity conflict. JSON Schema cannot express unique-by-property, so this
 * runs alongside schema validation in the real save path.
 */
export function assertPersistedEventIdentity(events: ReadonlyArray<{ instance_id: string }>): void {
  const seen = new Set<string>();
  for (const [index, record] of events.entries()) {
    const id = record.instance_id;
    if (typeof id !== "string" || id === "") {
      throw new SaveIdentityError(`events[${index}] has an empty or non-string instance_id`);
    }
    if (seen.has(id)) {
      throw new SaveIdentityError(
        `duplicate persisted instance_id "${id}" — exactly-once lifecycle resumption requires unique event identity`,
      );
    }
    seen.add(id);
  }
}

/** The A4 expedition phases that require an active expedition (everything but idle). */
const NON_IDLE_PHASES: ReadonlyArray<ExpeditionState["phase"]> = [
  "preparing",
  "en_route",
  "at_outpost",
  "returning",
  "docked",
  "recovering",
];

/**
 * Pure structural invariants over the persisted A4 blocks (SaveBlob v4) that
 * JSON Schema cannot express — the phase/active coupling (an active expedition
 * exists iff the phase is not idle) and non-negativity of the overflow
 * holdings and counters. A tampered save that violates these is refused loudly
 * before commit and before resume (malformed-state rejection — brief §11). The
 * deeper overflow-CAP check needs the /data seed's Safe capacity and runs in
 * the sim (assertExpeditionDomainValid), not here.
 */
export function assertExpeditionSaveShape(expedition: ExpeditionState, ops: HarborOperationsState): void {
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
 * Compile a validator from the committed generated schema. Throws
 * SaveValidationError on any schema violation, then SaveIdentityError on any
 * semantic invariant the schema cannot express (persisted-events identity;
 * A4 expedition phase/active coupling + overflow non-negativity). Both
 * saveAtomically (pre-commit) and loadSave (post-migration) call the returned
 * validator, so none of these guards is bypassable.
 */
export function createSaveBlobValidator(schemaPath: string = SAVE_BLOB_SCHEMA_PATH): SaveBlobValidator {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validate = ajv.compile(schema);
  return (blob: unknown): asserts blob is SaveBlob => {
    if (!validate(blob)) {
      throw new SaveValidationError(ajv.errorsText(validate.errors, { separator: "; " }));
    }
    // Schema passed → the blob has the SaveBlob shape. Enforce the semantic
    // invariants the schema cannot express (identity + A4 phase/active coupling).
    assertPersistedEventIdentity((blob as SaveBlob).events);
    assertExpeditionSaveShape((blob as SaveBlob).expedition, (blob as SaveBlob).harbor_operations);
  };
}
