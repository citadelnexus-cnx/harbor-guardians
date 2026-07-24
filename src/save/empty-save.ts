/**
 * Empty/minimal save-blob factory — the M0 persistence shell.
 *
 * Produces the identity state for every Save/Load §16 block: zero stocks in
 * every Safe/Exposed band (real start stocks come from /data
 * resource_definition seeds at Alpha — DC1), World Clock at day 0, threat at
 * its "calm" zero-state (Doc 05 phase order), and every content-bearing block
 * empty (blocks whose feature is FUTURE BUILD remain schema-enforced empty;
 * the A2 claim_ledger/pending blocks are simply at their empty identity).
 * No gameplay numbers: zeros/empties are identity state, not tuned values.
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §16; M0 packet §8
 * ("save/load skeleton round-trips an empty/minimal state").
 * Invariant refs: S5, S7 (this blob is what the M0 proofs round-trip).
 */

import type { SaveBlob } from "../contracts/save-blob.js";
import { SAVE_SCHEMA_VERSION } from "../contracts/save-blob.js";

export interface EmptySaveArgs {
  /** e.g. package.json version — recorded per Save/Load §1. */
  game_version: string;
  /** ISO-8601 UTC timestamp of the save (Save/Load §2). Explicit so callers (and deterministic tests) control it. */
  last_saved_utc: string;
}

/** Build the empty/minimal M0 save blob (all §16 blocks at identity state). */
export function createEmptySaveBlob(args: EmptySaveArgs): SaveBlob {
  return {
    meta: {
      save_schema_version: SAVE_SCHEMA_VERSION,
      game_version: args.game_version,
      last_saved_utc: args.last_saved_utc,
    },
    world_clock: { day_index: 0, time_of_day: 0 },
    resources: {
      Crowns: { safe: 0, exposed: 0 },
      Provisions: { safe: 0, exposed: 0 },
      Iron: { safe: 0, exposed: 0 },
      Aether: { safe: 0, exposed: 0 },
    },
    buildings: [],
    workers: [],
    threat: { phase: "calm" },
    claim_ledger: { packages: [], story_claims: [] },
    pending_reward_resolution: [],
    events: [],
    expedition: { phase: "idle", active: null, next_expedition_index: 0, committed_command_ids: [] },
    harbor_operations: {
      overflow: {},
      canonical_intro_consumed: false,
      route_anchor_operations_unlocked: false,
      completed_expeditions: 0,
    },
    system_messages: [],
    merit: {},
    guardian_bond: null,
    flags_story: {},
  };
}
