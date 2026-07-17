/**
 * GuardianKit data contract — the B4 §4 authoring shape as refined at M0
 * schema setup (G-D1: "field names refined during M0 schema setup").
 *
 * Source of truth: these TypeScript types; /schema/guardian_kit_seed.schema.json
 * is GENERATED from them (D39) — never hand-authored.
 * Governing docs:
 *   - 12_GUARDIAN_SANCTUM_AND_KIT_FOUNDATION v0.1.2 §4 (GuardianKit schema)
 *   - 12A_FLAGSHIP_GUARDIAN_KIT_SHEETS v0.1.2 §4A (economy-shift source
 *     binding), §4B (enums), §6 (seed object shape — mirrored field-for-field)
 *   - 12B_LAUNCH_CHASSIS_ANCHOR_KIT_SHEETS v0.2.1 §6 (anchor seed objects)
 *   - 07_CONTENT_SCHEMA_AND_DATA_CONTRACTS_SPEC v0.1.2 §1.2/§7 (DC4 value
 *     metadata; DC5 versioned schema; §1.3 schema_version)
 * Invariant refs: DC1, DC4, DC5, GDN1, GDN3, GDN4, GDN11.
 */

import type { Chassis, DifficultyTag, LaunchWave, Region } from "./enums.js";
import type { SeedValueMetadata } from "./seed-metadata.js";

/**
 * One economy shift, bound to an existing source/sink/event (B4A §4A, GDN11):
 * a shift may re-weight an already-approved faucet/sink/event; it may never
 * create a new resource source. No free-text shift compiles into data — the
 * validator rejects any shift whose target_kind is not one of these three.
 */
export interface EconomyShift {
  dir: "+" | "-";
  target_kind: "source_id" | "sink_id" | "event_id";
  target: string;
  effect: string;
}

/** Bond-Charge build profile (B4 §3 chassis leans; C4 secondary-source floor). */
export interface BondChargeProfile {
  primary_source: string;
  secondary_sources: string[];
  /** Design-target enum/string (B4A §4B) — not a final numeric balance value. */
  bond_charge_fill_rate_target: string;
  /** Reset/decay policy string (B4A §4B) — not free implementation behavior. */
  bond_charge_reset_or_decay_rule: string;
}

/**
 * Guardian Surge block (B4 §5; GDN3 — combat-only, bounded, `never` flags set;
 * D6 — never economy-bought). `mints_resources` appears on Quartermaster-lean
 * kits per B4B §3 (GDN11).
 */
export interface GuardianSurge {
  name_working: string;
  duration_turns_target: number;
  recharge_target: string;
  effect_hooks: string[];
  never: Array<
    | "consumes_aether"
    | "bought_from_economy"
    | "gated_behind_perfect_timing"
    | "mints_resources"
  >;
}

/**
 * Sidegrade economy modifier (Economy §16; GDN4 variance budget, §4C threshold
 * roles). The numeric thresholds are seed data, not code constants (DC1).
 */
export interface EconomyModifier {
  shifts: EconomyShift[];
  st5_median_completion_variance_max: number;
  st5_tradeoff_required_threshold: number;
  projected_st5_variance_target: number;
  /** Required in review when a kit sits at/above the variance ceiling (B4A §4C, Nova). */
  documented_tradeoff?: string;
}

/** Accessibility conformance block (Doc 06; C2/GDN8 assist parity; never color-only cues). */
export interface AccessibilityBlock {
  assist_parity: boolean;
  cues: Array<"shape" | "icon" | "text">;
}

/** One guardian kit — pure data, no behavior (GDN1). Shape mirrors B4A/B4B §6. */
export interface GuardianKit {
  guardian_id: string;
  name_working: string;
  /** Working placeholder except the flagship trio (G-D6). */
  animal: string;
  chassis: Chassis;
  launch_wave: LaunchWave;
  home_region: Region;
  identity_line: string;
  difficulty_tag: DifficultyTag;
  bond_charge_profile: BondChargeProfile;
  guardian_surge: GuardianSurge;
  economy_modifier: EconomyModifier;
  accessibility: AccessibilityBlock;
  sanctum_ref: string;
  provenance: string;
}

/**
 * A /data/guardians seed file: versioned envelope (DC5 — an unversioned seed
 * blocks the build) carrying one GuardianKit plus its DC4 value metadata.
 */
export interface GuardianKitSeed {
  schema_version: string;
  kit: GuardianKit;
  value_metadata: SeedValueMetadata[];
}
