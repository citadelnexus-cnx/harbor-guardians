/**
 * Shared contract enumerations — pinned per M0 packet §7 ("Enums pinned").
 *
 * Source of truth: TypeScript types; JSON Schema is GENERATED from these (D39).
 * Governing docs:
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §2 (CoreResource /
 *     StandingResource / ReceiptMetric split per D26; Unit vocabulary)
 *   - 10_WORLD_ATLAS_FOUNDATION v0.2.1 §3 (regions), §4 (harbor taxonomy)
 *   - 11_FACTION_CODEX_FOUNDATION v0.1.2 FCT7 (support_type values)
 *   - 12A_FLAGSHIP_GUARDIAN_KIT_SHEETS v0.1.2 §4B (chassis / difficulty_tag /
 *     launch_wave / home_region canonical data values)
 * Invariant refs: DC1, DC5, DC6 (boundary typing), FCT7, GDN-suite (fixtures).
 */

/**
 * The four storable, spendable, cap-bound resources (Doc 07 §2, D26).
 * Storage, exposed surplus, cargo, and raid loss type against CoreResource
 * ONLY (DC6) — never StandingResource or ReceiptMetric.
 */
export type CoreResource = "Crowns" | "Provisions" | "Iron" | "Aether";

/**
 * Soulbound standing (Doc 07 §2, D26): never stored in 3S bands, never cargo,
 * never raidable, never spent.
 */
export type StandingResource = "Merit";

/**
 * Progression/combat records applied as auto-receipts (Doc 07 §2, D26):
 * never stored as resources, never cargo, never in the Claim Ledger.
 */
export type ReceiptMetric = "XP" | "BondXP" | "BondCharge";

/**
 * Union used ONLY where a schema must reference all three for logging or
 * receipts. Capacity, cargo, and raid-loss fields must type against
 * CoreResource, never AnyResourceRef (Doc 07 §2, DC6).
 */
export type AnyResourceRef = CoreResource | StandingResource | ReceiptMetric;

/** Value-cadence vocabulary for seed metadata (Doc 07 §2 / §1.2, DC4). */
export type Unit =
  | "per_pulse"
  | "per_minute"
  | "per_world_day"
  | "per_run"
  | "per_quest"
  | "flat";

/**
 * Threat/raid phase vocabulary (Doc 07 §2; Doc 05 phase order). The empty
 * world's zero-state is "calm"; an Assault never auto-resolves offline (D7).
 */
export type RaidPhase = "calm" | "watch" | "warning" | "assault" | "aftermath";

/**
 * Reward delivery routes (Doc 07 §2; CARGO2 — every reward line declares
 * exactly one route at generation time; D20 routing table, D24 one line/one
 * route). Full five-value enum per Doc 07; at Alpha A2 only `claim_ledger`
 * and `story_claim` have implemented delivery — `ship_hold_docked_cargo`,
 * `gear_locker`, and `auto_receipt` are structurally present but BLOCKED
 * (routing them fails loud; their systems are FUTURE BUILD, 04B/09/receipts).
 */
export type RewardRoute =
  | "claim_ledger"
  | "story_claim"
  | "ship_hold_docked_cargo"
  | "gear_locker"
  | "auto_receipt";

/**
 * The six elemental regions (World Atlas §3; working names per W-D1).
 * Canonical data form per B4A §4B — matches the B4A/B4B §6 seed objects
 * (display case, underscore for Umbral_Deep).
 */
export type Region =
  | "Emberreach"
  | "Rimeholt"
  | "Galewrack"
  | "Verdance"
  | "Lumenshoal"
  | "Umbral_Deep";

/** Harbor taxonomy (World Atlas §4, Everything-Is-A-Harbor); lower_snake data form per B4A §4B convention. */
export type HarborType =
  | "player_harbor"
  | "faction_capital"
  | "guardian_sanctum"
  | "drowned_harbor"
  | "free_port";

/**
 * Faction support types (B3 v0.1.2 FCT7, F-D3): explicit raid_support or
 * route_support; both count against the shared active-support cap (FCT2/F-D5).
 */
export type SupportType = "raid_support" | "route_support";

/** Guardian chassis (B4 §3, pinned data values per B4A §4B). */
export type Chassis =
  | "striker"
  | "bulwark"
  | "oracle"
  | "warden"
  | "skirmisher"
  | "quartermaster";

/** Honest difficulty tag (B4A §4B; GDN2/GDN5 — affects feel, never viability). */
export type DifficultyTag = "approachable" | "standard" | "demanding";

/** Roster wave (B4A §4B; G-D2 — every chassis has ≥1 launch guardian). */
export type LaunchWave = "launch" | "future_wave";
