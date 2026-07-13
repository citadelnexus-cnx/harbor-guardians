---
title: "Harbor Inbox & System Messages Foundation"
doc_id: "04A_HARBOR_INBOX_AND_SYSTEM_MESSAGES_FOUNDATION"
version: 0.3-DRAFT
date: 2026-07-09
bundle_version: v0.5.2
status: DRAFT v0.3 for owner review — v0.5.1 cleanup: M1 wording precision (P1.3). Self-contained (D21). APPROVED-FOR-REVISION; not canon.
source: "Blueprint v6.0; Decision Register D1–D22; AMEND-02 v0.5.1; Doc 04 v0.4; Save/Load v0.5; v0.5 independent audit P1.3"
classification: FUTURE BUILD
supersedes: "04A_HARBOR_INBOX_AND_SYSTEM_MESSAGES_FOUNDATION v0.1, v0.2"
---

# Harbor Inbox & System Messages Foundation v0.3

**Role:** a readable, persistent place for notices/reports/warnings — separate from reward claiming. Shares the Harbor Manifest shell with the Claim Ledger but holds **messages, never resources**, and is **never the source of economic truth**.

## 1. Harbor Manifest parent UI
Tabs: **Claim Ledger** (reward packages, Doc 04) · **Story Claims** (protected narrative claims) · **System Inbox** (messages/notices/reports) · **Reports** (a filter/tab under System Inbox). Hard separation: the Claim Ledger holds transferable rewards; the System Inbox holds information only. A message may reference a Claim Ledger package by `package_id`, but never itself contains spendable resources.

## 2. Message categories
| Category | Examples | Persistence |
|---|---|---|
| Offline Report | production, exposed surplus created, upkeep, stalls, no-offline-raid confirmation | auto-archive after read unless it contains a warning |
| Raid Notice | Watch/Warning phase, exposed resources at risk, breached-lane report, Aftermath summary | until acknowledged |
| Claim Notice | Ledger full, partial-claim remainder, Story Claim available, blocked-claim reason, pending-reward alert | while relevant |
| Build/Repair Notice | construction complete, repair blocked, building disabled, worker freed | auto-archive after read |
| Migration Notice | save upgraded, Crown Hold → Universal Claim Ledger migrated | permanent history |
| Tutorial Notice | first-hour guidance, storage tutorial, accessibility reminders | dismissible; recoverable in Help |
| Accessibility Notice | timing assist available, input calibration required, mobile prompt help | until acknowledged or configured |
| System Grant Notice | migration/recovery/dev grant available | references a Claim Ledger package; the package owns the reward |

## 3. Message schema (holds no resources — M1; authoritative-boundary — M9)
```
SystemMessage {
  message_id · world_id
  type: offline_report | raid_notice | claim_notice | build_notice | migration_notice | tutorial | accessibility | system_grant_notice
  priority: low | normal | high | critical
  title · body_summary
  created_world_clock · created_utc
  read_state: unread | read | archived
  persist_policy: auto_archive | until_read | until_acknowledged | permanent
  related_ids?: { package_id? · building_id? · raid_id? · quest_id? · migration_id? · ledger_entry_ids? · report_id? · threat_id? · pending_reward_id? }
}
```
**Hard rules (P1.3 precision):** a message has **no authoritative resource payload fields** and never transfers resources (M1). A message may *display* resource amounts (e.g. an Offline Report showing "Provisions +300, exposed +120, upkeep −45") **only** as a display-only summary derived by reading the referenced ledger/report record through `related_ids` — the referenced record is the source of truth. `body_summary` is rendered/derived text, never an authoritative store. Summaries must reconcile to the authoritative ledger/report record (M9).

## 4. Inbox ↔ Claim Ledger interaction
| Situation | Rule |
|---|---|
| System grants a reward | One Claim Ledger package (`source_type=system_grant`) + one referencing message (M3) |
| Player archives/deletes a message | Referenced package remains until claimed/resolved (M2) |
| Player claims the reward | Message may update to "claimed" or auto-archive; package logs the transfer |
| Claim Ledger full / pending reward | Critical Claim Notice names the blocking slot (links `pending_reward_id`) |
| Story Claim available | Story Notice; the Story Claim stays separate and protected |
| Offline return with changes | Message records the report and links `report_id`/`ledger_entry_ids`; authoritative amounts live in those records (M9) |

## 5. Persistence, retention & compaction (D18)
Active Inbox visible target: ~100 messages. Low-priority read messages may auto-archive; archived low-priority reports may compact into periodic system-history summaries. **Critical, migration, story, package-linked, and unresolved-claim messages persist until resolved/acknowledged.** Compaction never deletes those protected classes (M10). No message deletion ever affects a reward package (M2).

## 6. Save/load behavior
`system_messages` save block persists: message list · type · priority · read_state · persist_policy · related_ids · created stamps. Round-trip preserves read/archive state and package links (M8). Migration Notices survive schema migrations and name the migrated systems (M6).

## 7. UX action-label lock (UX1)
Reward packages use **Claim**. Messages use **Read / Acknowledge / Archive**, and may show **View Reward Package** (which navigates to the Claim Ledger). A System Inbox message never shows a Claim button and never transfers resources directly (UX1).

## 8. Sim invariants (M-suite + UX1)
M1 messages contain no authoritative resource payload fields and never transfer resources; display-only summaries may show values only by reading referenced ledger/report records · M2 archiving/deleting a message never deletes a package · M3 one grant = one package + one message, no duplicates · M4 Offline Report generated after reconciliation and matches the ledger summary · M5 Raid Warning appears before Assault eligibility · M6 Migration Notice persists and names migrated systems · M7 critical persist-until-acknowledged; low-priority archive-after-read · M8 inbox save/load preserves read/archive state + package links · **M9 message summaries reconcile to authoritative ledger/report records; messages are never the source of economic truth** · **M10 compaction cannot delete unresolved, critical, migration, or package-linked messages** · **UX1 no System Inbox action may transfer resources directly**.

## 9. Data-seed exports (`/data/inbox/`)
`message_categories · message_schema · persist_policies · retention_compaction_rules · inbox_claim_ledger_interactions · message_invariants`. No message seed may contain a spendable resource field (schema + M1). No Magic Numbers rule.

*DRAFT v0.3 — self-contained; approved-for-revision; not merged. FUTURE BUILD.*
