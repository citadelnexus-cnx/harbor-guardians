---
title: "Reward Claim Ledger Foundation"
doc_id: "04_REWARD_CLAIM_LEDGER_FOUNDATION"
version: 0.4-DRAFT
date: 2026-07-09
bundle_version: v0.5.2
status: DRAFT v0.4 for owner review — v0.5.1 cleanup: mandatory-defense carve-out + L15 (P1.4). Self-contained (D21). APPROVED-FOR-REVISION; not canon.
source: "Blueprint v6.0; Decision Register D1–D22; AMEND-02 v0.5.1; Doc 04A v0.3; Save/Load v0.5; v0.5 independent audit P1.4"
classification: FUTURE BUILD
supersedes: "04_REWARD_CLAIM_LEDGER_FOUNDATION v0.1, v0.2, v0.3"
---

# Reward Claim Ledger Foundation v0.4

**Role:** a reward-delivery valve, never off-map storage, never a spendable bank.

## 1. Definitions (Harbor Manifest terminology)
- **Harbor Manifest** — parent in-world UI for claims, story claims, reports, and system messages.
- **Claim Ledger** — the reward-package tab; holds earned-but-unclaimed reward packages.
- **Story Claims** — protected narrative claims tab (§6, §11).
- **System Inbox** — message tab (Doc 04A); notices/reports/warnings; never holds resources.
- **Reward package** — a discrete earned bundle from a defined event, not passive production.
Core principle: the Claim Ledger *holds* rewards; it never *creates, stores-indefinitely, or spends* them. Claiming *transfers* into the Harbor under Safe/Exposed/Total (Economy §7).

## 2. Eligible sources
Main story reward → Story Claim · faction quest · expedition completion (non-cargo) · raid victory (after result screen) · milestone/achievement · migration/recovery/dev system grant (flagged, §9).

## 3. Ineligible (never enters the Ledger)
Passive production overflow · Market sale overflow · Dock purchase overflow · ship cargo · Merit · XP · Bond XP · Bond Charge · direct build/repair payments.

## 4. Package contents
Resources (obey Safe/Exposed/Total on claim) · story flags/cosmetics (apply immediately on claim, no storage cost) · gear (routes to inventory/gear locker on claim).

## 5. Slot accounting
Max 5 unclaimed packages per resource type + 20 global active non-story packages; a package consumes one slot per contained resource; Story Claims are separate and never count against caps.

## 6. Story Claim rules
Non-expiring · never deleted · never raided while unclaimed · no compounding/interest · unlock flags may apply immediately · resource portions stay unclaimed until transferred, then obey Safe/Exposed/Total. Resource boundary in §11.

## 7. Partial claim
Claim Safe / Claim to Capacity / Claim All / Hold Remaining. `claimed + held_remainder == original` always (L6). No rounding leak.

## 8. Claiming by raid phase
Calm/Watch normal (Watch: claiming into exposed raises risk) · Warning safe-only free, exposed requires explicit warning · Assault read-only/no-claim · Aftermath normal.

## 9. System grants — production guard (D13, L13)
Disabled in normal v1 gameplay except approved paths: save-migration recovery (logged + test-covered) · corrupt-save compensation (references a `recovery_event_id`) · debug/dev testing (**dev only — disabled in production builds by build flag**). Live-service compensation is future-only (offline-first v1). No random system gifts in v1. Every grant requires a `migration_id` or `recovery_event_id`, creates exactly one Claim Ledger package + one System Inbox notice (Doc 04A M3).

## 10. Reward Delivery Resolution Screen + persistent pending state (D14/D19, L11/L14)
When a non-story reward package cannot enter the Claim Ledger because a cap is full:
1. The event completes normally.
2. The package enters a **persistent pending state** (not in the Ledger, not spendable) — persisted, not merely a transient result screen.
3. The player resolves via: claim some/all directly into Harbor capacity · resolve an existing held package · split (if source rules allow) · convert (only if an approved conversion rule exists).
4. Never silently deleted; never duplicated by reload.
5. Not usable/spendable while pending.
6. A **critical Claim Notice** is raised in the System Inbox naming the blocking slot.

**Persistent save block (`pending_reward_resolution`):**
```
pending_reward_resolution {
  pending_id
  source_event_id
  generated_reward_seed
  package_contents
  created_world_clock
  blocking_reason
  allowed_resolution_actions
  related_system_message_id
}
```
Rules: survives save/load, crash, and mobile-suspend · does not enter the Claim Ledger until resolved · not spendable · cannot be duplicated by reload · must generate a critical Claim Notice · **blocks only new *optional* reward-generating activities** (Build Queue §8) — building, repairing, claiming existing packages, reading messages, organizing workers, upgrading storage, and spending resources all remain allowed.

**Mandatory-event carve-out (P1.4, L15):** a pending reward blocks *optional* reward generation only (new quests/expeditions/contracts). It can **never** freeze a **mandatory defensive raid** already in Warning/Assault flow, nor a **story-critical resolution event**. Those resolve normally; if such an event mints a reward while Ledger caps remain full, that reward simply also enters pending resolution. A player can never be soft-locked out of a required defense by leaving a reward unresolved.

## 11. Story Claim Resource Boundary (D15, L12)
Story flags/unlocks/cosmetics bypass caps permanently. Story **resource** rewards may be held because they are finite and non-repeatable; they never compound, grow, or earn interest; they cannot be generated by repeatable activities. Large story-resource rewards split into a permanent narrative-unlock Story Claim + a finite one-time Story Claim resource portion. The sim tracks total unclaimed Story-Claim resources **separately** so they never mask economy pressure.

## 12. Sim invariants (L-suite)
L1 transfer-only · L2 not spendable directly · L3 held rewards unraidable · L4 claimed exposed resources raidable · L5 Story Claims never disappear · L6 partial-claim totals preserved · L7 slot accounting correct (5/resource + 20 global) · L8 no claim during Assault · L9 Warning exposed-risk preview · L10 ineligible sources excluded · L11 full-slot delivery never deletes/duplicates; pending not exploitable as storage · L12 Story Claims finite/non-repeatable/non-compounding · L13 v1 system grants only via approved migration/recovery/test path · **L14 pending reward resolution survives save/load, cannot duplicate, cannot be spent, and blocks only new optional reward-generating events until resolved** · **L15 pending rewards cannot freeze mandatory threat resolution — an unresolved pending reward may block optional reward generation, but can never indefinitely suspend a required defensive raid or story-critical resolution event**.

## 13. Save schema
Persist per package: `package_id · source_type · contents · created_world_clock · is_story · system_grant? · held_remainder`; plus the `pending_reward_resolution` block (§10). Story Claims persist permanently; migration from retired Crown-only Claim Hold (Save/Load §11).

## 14. Cross-links & UI states
System messages live in Doc 04A; a message references a package by `package_id` and never holds resources. Per package UI: source · contents · story flag · resource categories occupied · slot usage (n/5, n/20) · partial-claim actions · raid-phase availability · pending-resolution state. Reward packages use **Claim**; messages use Read/Acknowledge/Archive/View Reward Package (UX1). Every claim/transfer/remainder hits the ledger log with a world-clock stamp.

## 15. Data-seed exports (`/data/rewards/`)
`claim_ledger_rules · reward_package_schema · eligible_sources · ineligible_sources · partial_claim_modes · raid_phase_claim_matrix · story_claim_rules (incl. resource boundary) · reward_delivery_resolution (incl. pending_reward_resolution) · system_grant_rules (production guard)`. No Magic Numbers rule.

*DRAFT v0.4 — self-contained; approved-for-revision; not merged. FUTURE BUILD.*
