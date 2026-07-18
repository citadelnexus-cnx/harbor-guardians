/**
 * Claim Ledger / reward-routing data contracts — the Alpha A2 "Claim Ledger
 * and Reward Routing" spine shapes (owner Alpha A2 authorization, 2026-07-17).
 *
 * Source of truth: these TypeScript types; the claim_ledger and
 * pending_reward_resolution portions of /schema/save_blob.schema.json are
 * GENERATED from them (D39) — never hand-authored.
 *
 * A2 structural boundaries (enforced by the generated schema, not convention):
 *   - `source_type` is the literal "test_supplied": NO gameplay reward source
 *     exists at A2 (no events, quests, expeditions, raids, milestones, or
 *     system grants — all FUTURE BUILD). A save claiming a gameplay source
 *     fails validation until that source's feature + migration land.
 *   - `contents.resources` keys against CoreResource ONLY (D26/DC6-adjacent):
 *     Merit, XP, BondXP, and BondCharge can never appear in a reward package
 *     (Doc 04 §3 ineligible; Doc 07 §2).
 *   - `flags` / `cosmetics` / `gear_refs` are schema-enforced EMPTY (the M0
 *     empty-block pattern): story flags, cosmetics, and gear rewards are
 *     FUTURE BUILD; growing them is a save_schema_version bump + migration.
 *   - `system_grant` is the literal false (D13/L13: v1 grants only via
 *     approved migration/recovery/dev paths — none exist at A2).
 *   - `related_system_message_id` is the literal null: the System Inbox does
 *     not exist (Doc 04A is FUTURE BUILD; M-suite fail-loud). The Doc 04 §10
 *     critical Claim Notice arrives with the inbox feature + migration.
 *   - `allowed_resolution_actions` admits only "deliver_to_ledger": the Doc 04
 *     §10.3 split/convert/direct-claim resolution actions are FUTURE BUILD and
 *     schema-rejected until implemented.
 *
 * Field shapes follow Doc 07 §3 (`claim_package`, `pending_reward_resolution`)
 * as the canonical contract layer; Save/Load §11 states the same pending block
 * with variant field names (`blocking_categories[]`/`resolution_state`) —
 * Doc 07 is the schema authority (it exists to be "the canonical schema shape
 * for each data type"), so its field names are used here.
 *
 * Governing docs:
 *   - 04_REWARD_CLAIM_LEDGER_FOUNDATION v0.4 §1 (valve, never storage/bank),
 *     §4 (package contents), §5 (slot accounting), §6/§11 (Story Claims),
 *     §7 (partial claim, L6), §10 (pending resolution, D14/D19), §13 (save
 *     schema)
 *   - SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §10 (ledger persistence),
 *     §11 (pending block, L14), §16 (save blocks)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §2 (RewardRoute),
 *     §3 (claim_package / pending_reward_resolution shapes), §7 (DC5/DC6)
 *   - 00_DECISION_REGISTER D14 (resolution screen + pending state), D15
 *     (story boundary), D19 (pending save block), D20 (routing), D26 (resource
 *     split)
 * Invariant refs: L1, L5, L6, L7, L11, L14 (implemented at A2 scope);
 * L2/L3/L4/L8/L9/L10/L12/L13/L15 remain fail-loud (their systems are
 * FUTURE BUILD); S5/S7 (these shapes persist in the save blob); DC5/DC6.
 */

import type { CoreResource, RewardRoute } from "./enums.js";
import type { WorldClock } from "./save-blob.js";

/**
 * The only reward source that exists at A2: test-supplied packages driven by
 * the harness/tests. Gameplay sources (Doc 04 §2) widen this union via
 * migration when their features are authorized and implemented.
 */
export type RewardSourceType = "test_supplied";

/**
 * Per-CoreResource reward amounts. Partial map — only resources actually
 * present carry entries; the generated schema rejects any non-CoreResource
 * key (Merit/XP/BondXP/BondCharge can never be packaged — Doc 04 §3, D26).
 */
export type RewardResources = Partial<Record<CoreResource, number>>;

/** A2 empty-block placeholder (M0 pattern): schema-enforced empty until the feature + migration land. */
export type EmptyRewardListA2 = [];

/**
 * Reward package contents (Doc 04 §4 / §13 `contents`). At A2 only the
 * resource portion is real; flags/cosmetics/gear_refs are schema-enforced
 * empty (FUTURE BUILD — Doc 04 §4, Doc 09).
 */
export interface RewardPackageContents {
  resources: RewardResources;
  flags: EmptyRewardListA2;
  cosmetics: EmptyRewardListA2;
  gear_refs: EmptyRewardListA2;
}

/**
 * One reward line in a test-supplied draft: exactly one route per line
 * (CARGO2/D24 — the single-route declaration happens at generation time).
 * Resource lines only at A2 (flag/cosmetic/gear lines are FUTURE BUILD).
 */
export interface RewardLine {
  line_id: string;
  route: RewardRoute;
  resource: CoreResource;
  amount: number;
}

/**
 * A test-supplied reward package draft — the INPUT to routing. This shape is
 * never persisted; routing turns it into a LedgerPackage, StoryClaim, and/or
 * PendingRewardResolution. No gameplay system mints drafts at A2.
 */
export interface RewardPackageDraft {
  package_id: string;
  source_type: RewardSourceType;
  /** The originating event id (test-supplied at A2; Doc 04 §10 `source_event_id`). */
  source_event_id: string;
  /** Doc 04 §10 `generated_reward_seed` — recorded so a reward can never be rerolled (L14/GEAR3 doctrine). */
  generated_reward_seed: number;
  created_world_clock: WorldClock;
  lines: RewardLine[];
}

/**
 * One held (earned-but-unclaimed) reward package in the Claim Ledger
 * (Doc 04 §13; Save/Load §10; Doc 07 §3 `claim_package`).
 *
 * `contents` is the original as-routed package (immutable record of what was
 * earned); `held_remainder` is what remains unclaimed — entries are strictly
 * positive and never exceed their `contents` counterpart, so at any moment
 * `claimed-so-far == contents − held_remainder` and every partial claim
 * satisfies `claimed + held_remainder == original` (L6). A package with an
 * empty held_remainder is fully claimed and leaves the Ledger.
 */
export interface LedgerPackage {
  package_id: string;
  source_type: RewardSourceType;
  contents: RewardPackageContents;
  created_world_clock: WorldClock;
  /** Ledger packages are non-story by construction; Story Claims live in their own protected list. */
  is_story: false;
  /** D13/L13: no system-grant path exists at A2 (literal false until the guarded feature lands). */
  system_grant: false;
  held_remainder: RewardResources;
}

/**
 * One protected Story Claim (Doc 04 §6/§11, D15): non-expiring, never
 * deleted, never counts against slot caps. At A2 this is a structural
 * placeholder — Story Claims are created by routing and preserved forever;
 * claiming their resource portion into the Harbor is FUTURE BUILD (no
 * gameplay story source exists to feed them).
 */
export interface StoryClaim {
  claim_id: string;
  source_type: RewardSourceType;
  contents: RewardPackageContents;
  created_world_clock: WorldClock;
  is_story: true;
}

/**
 * The Claim Ledger save/sim state (Save/Load §16 `claim_ledger` block:
 * "packages, story claims, remainders" — remainders live inside packages).
 */
export interface ClaimLedgerState {
  packages: LedgerPackage[];
  story_claims: StoryClaim[];
}

/**
 * The only pending-resolution action implemented at A2: re-deliver the
 * package into the Claim Ledger once slot capacity frees. Doc 04 §10.3's
 * further actions (direct claim, split, convert) are FUTURE BUILD and
 * schema-rejected until implemented.
 */
export type PendingResolutionAction = "deliver_to_ledger";

/**
 * One persistent pending reward (Doc 04 §10; Save/Load §11; Doc 07 §3;
 * D14/D19/L11/L14): a non-story package that could not enter the Claim
 * Ledger because a slot cap was full. Not in the Ledger, not spendable,
 * never silently deleted, never duplicated by reload. At A2 `pending_id`
 * is the blocked package's `package_id` (1:1, globally unique), preserving
 * exact identity through block → resolve.
 */
export interface PendingRewardResolution {
  pending_id: string;
  source_type: RewardSourceType;
  source_event_id: string;
  generated_reward_seed: number;
  package_contents: RewardPackageContents;
  created_world_clock: WorldClock;
  /** Deterministic description of the blocking slot(s), e.g. "per_resource_cap:Crowns" or "global_cap" (Doc 04 §10.6 "naming the blocking slot"). */
  blocking_reason: string;
  allowed_resolution_actions: PendingResolutionAction[];
  /** Literal null until the System Inbox exists (Doc 04A FUTURE BUILD); becomes a message link via migration (M2/M3/DC3). */
  related_system_message_id: null;
}
