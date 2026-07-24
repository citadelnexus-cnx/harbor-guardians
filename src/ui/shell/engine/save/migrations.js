/**
 * Save-schema migrations — ordered, pure functions bringing an older save
 * forward to SAVE_SCHEMA_VERSION (Save/Load §1/§14). Each schema bump ships
 * its migration here plus a committed fixture at the prior version and a
 * round-trip test asserting the migrated save loads identically to a fresh
 * equivalent (tests/save-load.test.ts; CI runs the suite — a failing
 * migration blocks the PR).
 *
 * Registered migrations:
 *   - v1 → v2 (Alpha A2, owner authorization 2026-07-17): the M0/A1
 *     `claim_ledger` block (`{ packages: [] }`, schema-enforced empty) grows
 *     the A2 shape `{ packages: [], story_claims: [] }`. v1 saves could hold
 *     no packages or pending records (empty tuples by schema), so the
 *     migration adds the empty `story_claims` list and bumps the version —
 *     no player value exists to transform, none is created or lost.
 *   - v2 → v3 (Alpha A3, owner authorization 2026-07-18, Option A): the
 *     `events` block (mid-flight event-lifecycle instances, EVT3) is added
 *     empty. A v2 save cannot legally carry an `events` key at all
 *     (additionalProperties=false in the v2 schema), so a "v2" save that
 *     already has one was hand-edited or corrupted and is refused loudly.
 *     Every A2 block — resources, claim_ledger packages/story claims,
 *     pending records — passes through byte-preserved: nothing is
 *     transformed, created, or lost.
 *   - v3 → v4 (Alpha A4, owner authorization 2026-07-23, Option A): the
 *     `expedition` and `harbor_operations` blocks (the Bounded First Playable
 *     Expedition Loop) are added at identity — an idle expedition domain and
 *     an empty overflow with the intro/unlock flags false. A v3 save cannot
 *     legally carry either key (additionalProperties=false in the v3 schema),
 *     so a "v3" save that already has one was hand-edited or corrupted and is
 *     refused loudly (same tamper stance as v1→v2 / v2→v3). Every A1–A3 block
 *     passes through byte-preserved: no player value is transformed, created,
 *     or lost, and the migration is idempotent (re-running it on a v4 save is
 *     a no-op — the chain stops once the version reaches current).
 *   - v4 → v5 (post-A4 stabilization, owner HG-POST-A4-STABILIZATION-01
 *     authorization 2026-07-23, H3): the `expedition` block's v4
 *     `last_command_id: string | null` is replaced by the bounded
 *     `committed_command_ids: string[]`. The record is seeded from the single
 *     known v4 last_command_id, inventing NO prior history: `[]` at idle (the
 *     per-expedition record resets there, and the idle last_command_id was a
 *     completed lifecycle command whose phase has already advanced) or when it
 *     was null; `[id]` for a mid-flight expedition, carrying the one real
 *     in-flight id forward so the existing duplicate-command protection survives
 *     the boundary. A "v4" save that already carries `committed_command_ids`, or
 *     whose `last_command_id` is not a string/null, is impossible under the v4
 *     schema and is refused loudly (same tamper stance as the earlier
 *     migrations). Every other A0–A4 block passes through byte-preserved.
 *
 * The Save/Load §14 Migration Notice ("written to the System Inbox, M6") is
 * FUTURE BUILD: no System Inbox exists at A2 (Doc 04A unimplemented; M6
 * fail-loud). When the inbox feature lands, its migration adds notice
 * emission here. The Save/Load §14 legacy Crown-Hold migration predates this
 * repo's first save format and has no v1 saves to act on (documented, not
 * implemented — no retired Crown-only Claim Hold save was ever written).
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §1/§14;
 * 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §6; CLAUDE.md §5
 * (preserve, don't rewrite — migrations never delete player value).
 * Invariant refs: S5 (migrated saves round-trip), S7 (migration happens on
 * load, never mutates the on-disk save), L5/L14 (ledger/pending state is
 * preserved exactly by every future migration).
 */
import { SAVE_SCHEMA_VERSION } from "../contracts/save-blob.js";
/** Thrown when a save cannot be migrated to the current schema version. */
export class SaveMigrationError extends Error {
    constructor(detail) {
        super(`save migration failed: ${detail}`);
        this.name = "SaveMigrationError";
    }
}
function rawVersion(blob) {
    const meta = blob.meta;
    if (meta === null || typeof meta !== "object") {
        throw new SaveMigrationError("save has no meta block — not a Harbor Guardians save");
    }
    const version = meta.save_schema_version;
    if (typeof version !== "number" || !Number.isInteger(version)) {
        throw new SaveMigrationError(`meta.save_schema_version is not an integer (got ${String(version)})`);
    }
    return version;
}
/**
 * v1 → v2: claim_ledger gains its empty story_claims list (A2 shape). Pure;
 * input untouched. Both content-bearing v1 blocks (`claim_ledger.packages`
 * and `pending_reward_resolution`) were schema-enforced empty tuples under
 * v1 — a real v1 save can never carry content in either. Non-empty content
 * here means the file was hand-edited or corrupted outside this build, not
 * that player value needs transforming: refusing loudly (not silently
 * dropping or inventing state) is the correct response, mirrored identically
 * across both blocks.
 */
function migrateV1ToV2(blob) {
    const ledger = blob.claim_ledger;
    if (ledger === null || typeof ledger !== "object" || !Array.isArray(ledger.packages)) {
        throw new SaveMigrationError("v1 save has a malformed claim_ledger block — refusing to guess (no invented state)");
    }
    const packages = ledger.packages;
    if (packages.length > 0) {
        // The v1 schema enforced an empty packages tuple; content here means the
        // save was hand-edited or corrupt. Refuse rather than silently drop.
        throw new SaveMigrationError("v1 save claims ledger packages, but v1 could hold none — refusing to migrate");
    }
    const pending = blob.pending_reward_resolution;
    if (!Array.isArray(pending)) {
        throw new SaveMigrationError("v1 save has a malformed pending_reward_resolution block — refusing to guess");
    }
    if (pending.length > 0) {
        // The v1 schema enforced an empty pending_reward_resolution tuple;
        // content here means the save was hand-edited or corrupt. Refuse rather
        // than silently preserve impossible state.
        throw new SaveMigrationError("v1 save claims pending reward resolutions, but v1 could hold none — refusing to migrate");
    }
    return {
        ...blob,
        meta: { ...blob.meta, save_schema_version: rawVersion(blob) + 1 },
        claim_ledger: { packages: [], story_claims: [] },
    };
}
/**
 * v2 → v3: the save gains its empty `events` block (A3 shape). Pure; input
 * untouched. The v2 schema's additionalProperties=false means a real v2 save
 * can never contain an `events` key — one already present means the file was
 * hand-edited or corrupted outside this build, and is refused loudly rather
 * than silently trusted or dropped (same tamper stance as v1 → v2). All A2
 * player value (resources, ledger packages, story claims, pending records)
 * passes through untouched.
 */
function migrateV2ToV3(blob) {
    if ("events" in blob) {
        throw new SaveMigrationError("v2 save already carries an events block, but v2 could hold none — refusing to migrate");
    }
    return {
        ...blob,
        meta: { ...blob.meta, save_schema_version: rawVersion(blob) + 1 },
        events: [],
    };
}
/**
 * v3 → v4: the save gains its identity `expedition` and `harbor_operations`
 * blocks (A4 shape). Pure; input untouched. The v3 schema's
 * additionalProperties=false means a real v3 save can never contain either
 * key — one already present means the file was hand-edited or corrupted
 * outside this build, and is refused loudly rather than silently trusted or
 * dropped (same tamper stance as the earlier migrations). All A1–A3 player
 * value (resources, ledger, pending, events) passes through untouched.
 */
function migrateV3ToV4(blob) {
    if ("expedition" in blob) {
        throw new SaveMigrationError("v3 save already carries an expedition block, but v3 could hold none — refusing to migrate");
    }
    if ("harbor_operations" in blob) {
        throw new SaveMigrationError("v3 save already carries a harbor_operations block, but v3 could hold none — refusing to migrate");
    }
    return {
        ...blob,
        meta: { ...blob.meta, save_schema_version: rawVersion(blob) + 1 },
        expedition: { phase: "idle", active: null, next_expedition_index: 0, last_command_id: null },
        harbor_operations: {
            overflow: {},
            canonical_intro_consumed: false,
            route_anchor_operations_unlocked: false,
            completed_expeditions: 0,
        },
    };
}
/**
 * v4 → v5: the `expedition` block's `last_command_id` is replaced by the bounded
 * `committed_command_ids` record (H3). Pure; input untouched. The record is
 * seeded from the one known v4 last_command_id (no invented history), and a
 * "v4" save whose expedition block is malformed, already carries
 * `committed_command_ids`, or whose `last_command_id` is not a string/null was
 * hand-edited or corrupted and is refused loudly. Every other A0–A4 block passes
 * through untouched.
 */
function migrateV4ToV5(blob) {
    const expedition = blob.expedition;
    if (expedition === null || typeof expedition !== "object" || Array.isArray(expedition)) {
        throw new SaveMigrationError("v4 save has a malformed expedition block — refusing to guess (no invented state)");
    }
    const exp = expedition;
    if ("committed_command_ids" in exp) {
        throw new SaveMigrationError("v4 save already carries committed_command_ids, but v4 could hold none — refusing to migrate");
    }
    const lastCommandId = exp.last_command_id;
    if (lastCommandId !== null && (typeof lastCommandId !== "string" || lastCommandId === "")) {
        throw new SaveMigrationError("v4 save has a malformed expedition.last_command_id (expected a non-empty string or null) — refusing to migrate");
    }
    // Seed the bounded record from the single known committed id (invent nothing).
    // At idle the record must be empty (per-expedition reset — the v4 idle
    // last_command_id was a complete/recover/cancel command whose phase has already
    // advanced, so it is no longer relevant and dropping it loses no protection);
    // mid-flight we carry the one in-flight id forward, preserving the existing
    // duplicate-command protection across the boundary.
    const idle = exp.phase === "idle";
    const committed_command_ids = idle || lastCommandId === null ? [] : [lastCommandId];
    const nextExpedition = { ...exp };
    delete nextExpedition.last_command_id;
    nextExpedition.committed_command_ids = committed_command_ids;
    return {
        ...blob,
        meta: { ...blob.meta, save_schema_version: rawVersion(blob) + 1 },
        expedition: nextExpedition,
    };
}
/** Ordered migration chain: MIGRATIONS[v] brings a version-v save to v+1. */
const MIGRATIONS = {
    1: migrateV1ToV2,
    2: migrateV2ToV3,
    3: migrateV3ToV4,
    4: migrateV4ToV5,
};
/**
 * Bring a parsed save blob to SAVE_SCHEMA_VERSION by applying the ordered
 * migration chain (Save/Load §1). A current-version save is returned as-is
 * (byte-identity of the round-trip proofs is untouched); a future-version
 * save is refused loudly (never load state this build cannot represent).
 * The caller schema-validates the result — migration never bypasses
 * validation.
 */
export function migrateSaveBlobToCurrent(parsed) {
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new SaveMigrationError("save is not a JSON object");
    }
    let blob = parsed;
    let version = rawVersion(blob);
    if (version > SAVE_SCHEMA_VERSION) {
        throw new SaveMigrationError(`save_schema_version ${version} is newer than this build's ${SAVE_SCHEMA_VERSION} — refusing to load`);
    }
    while (version < SAVE_SCHEMA_VERSION) {
        const migrate = MIGRATIONS[version];
        if (!migrate) {
            throw new SaveMigrationError(`no migration registered from save_schema_version ${version}`);
        }
        blob = migrate(blob);
        const next = rawVersion(blob);
        if (next !== version + 1) {
            throw new SaveMigrationError(`migration from v${version} produced v${next}, expected v${version + 1}`);
        }
        version = next;
    }
    return blob;
}
