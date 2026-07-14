---
title: "Decision Register — Dependency-Docs Addendum (D23–D40)"
doc_id: "00_DECISION_REGISTER_ADDENDUM_D23_D40"
version: 0.3-DRAFT
date: 2026-07-10
bundle_version: v0.5.3-microcleanup
status: DRAFT v0.3 — owner ratified D23–D31 and approved D32–D40 (2026-07-10); micro-cleanup source-ref sync. Planning-locked, NOT canon. No repo/vault mutation.
source: "00_DECISION_REGISTER v0.2 (D1–D22); dependency docs 04B v0.1.2 / 05 v0.1.3 / 06 v0.1.2 / 07 v0.1.2 / 08 v0.1.2 / 09 v0.1.2 open questions + cleanup resolutions"
classification: FUTURE BUILD governance
supersedes: "none (extends D1–D22)"
---

# Decision Register — Dependency-Docs Addendum (D23–D40)

Extends the core register (D1–D22, in `00_DECISION_REGISTER v0.2`). Same rules apply: **"planning-locked" ≠ canon**. **Owner action 2026-07-10: D23–D31 ratified; D32–D40 approved as recommended.** All entries below are now **PLANNING-LOCKED** (owner-accepted for draft direction), not canonized/merged. Nothing is merged without a separately authorized repo/vault session.

## Applied in v0.1.1 → reflected in the v0.1.2 docs (cleanup, listed for traceability)

| ID | Topic | Applied resolution | Status |
|---|---|---|---|
| D23 | Raid protection wording (Doc 05) | Safe storage protected; exposed surplus raidable **including exposed Crowns**; Merit, Claim Ledger, Story Claims untouched. Stale "Crowns-safe" language removed. | RATIFIED 2026-07-10 |
| D24 | Cargo→Ledger boundary (04B) | Route chosen at generation, before delivery; one line, one route; a line routed to physical cargo can never later enter the Claim Ledger (CARGO2). | RATIFIED 2026-07-10 |
| D25 | Docked-cargo timer model (04B) | **Pressure timer → Needs Resolution**: no hard deletion; stays exposed/raidable; keeps spoil/leak; blocks new cargo voyages from that ship/dock until resolved. | RATIFIED 2026-07-10 |
| D26 | Resource type split (Doc 07) | `CoreResource` (Crowns/Provisions/Iron/Aether) vs `StandingResource` (Merit) vs `ReceiptMetric` (XP/BondXP/BondCharge). Storage, exposed surplus, cargo, raid loss use CoreResource only (DC6). | RATIFIED 2026-07-10 |
| D27 | Touch-target minimums (Doc 06) | ≥24×24 CSS px all controls; 44–48 for primary touch controls (A11Y4). | RATIFIED 2026-07-10 |
| D28 | No mandatory key path (Doc 06) | Every action remappable or has an alternate input path; no single hardcoded key gates progression (A11Y5). | RATIFIED 2026-07-10 |
| D29 | Gear craft/enchant/salvage anti-loop (Doc 09) | GEAR6: expected salvage value < total craft+enchant input value; no seed makes the loop non-lossy. | RATIFIED 2026-07-10 |
| D30 | Gear-overflow resolution actions (Doc 09) | Equip / Move to Locker / Salvage / Discard-with-confirm / Keep Pending; never silent-delete. | RATIFIED 2026-07-10 |
| D31 | First-hour no-trap picks (Doc 08) | Full launch roster at creation **with** honest per-guardian summaries (role, sidegrade, tradeoff, difficulty tag, "good if you like"); no guardian strictly dominated within its tag (OB5). | RATIFIED 2026-07-10 |

## Approved 2026-07-10 (owner accepted all recommendations)

| ID | Question | Options | Approved value (owner, 2026-07-10) |
|---|---|---|---|
| D32 | Pressure-timer length (04B) | short / medium / long `pressure_timer_pulses` before Needs Resolution | Medium; sim-tuned so a normal player clears the dock comfortably |
| D33 | Iron docked cargo (04B) | non-decaying-but-raidable vs slow-decay | Non-decaying but raidable (consistent with Iron exposed behavior) |
| D34 | Cargo hold model (04B) | single mixed hold cap vs per-resource sub-holds | Single mixed cap for v1; per-resource display only |
| D35 | Warning duration by raid type (05) | uniform vs per-type | Per-type, all above a fairness floor (E12) |
| D36 | Simultaneous raids (05) | one active Assault vs multiple at high tier | One active Assault at a time in v1 |
| D37 | Drowned reset strength (05) | full reset vs strong partial | Strong partial reset of regional_threat, sim-tuned |
| D38 | Default assist tier (06) | Assisted vs Precise default | Assisted default (inclusive; easy opt to Precise) |
| D39 | Schema authorship source (07) | JSON Schema authored directly vs TS types → generated JSON Schema | TS types as source → generated JSON Schema (fits TS + Tauri stack) |
| D40 | Guided vs open first hour (08) | structured tutorial path vs light nudges over free play | Light nudges over free play (matches no-dark-pattern stance) |

## Secondary open items (tracked, not yet numbered — fold into a later addendum if the owner wants them formalized)
- Auto-complete bonus % target (06): 60% vs 70% starting point (sim-tuned within the assist-parity band).
- Latency-offset ceiling (06): the point past which the game recommends Auto-complete rather than widening windows.
- Emergency-ration size (08): enough to restart production for N pulses (sim/playtest).
- Bound-on-pickup policy (09): story/mythic soulbound vs freely salvageable (recommended: story/mythic soulbound; common–rare salvageable).
- Locker size model (09): finite-generous vs effectively-unlimited-with-filtering (recommended: finite generous).
- Guardian-specific gear (09): mostly Hero-equipped with a few guardian-flavored trinkets (recommended).
- ID/namespace convention (07): `hg.` prefix + snake_case ids (recommended).

## Governance note
D23–D31 (cleanup, reflected in the v0.1.2 docs) are **RATIFIED**; D32–D40 are **APPROVED as recommended**. All are planning-locked, not canon. The standing implementation gate still holds: **no raid/cargo/schema/combat-playable implementation until the relevant doc + decision is in place and a separate repo/vault mutation session is authorized.** Approved values now feed the corresponding data-seed targets (e.g. D33 → Iron docked cargo non-decaying/raidable; D36 → one active Assault in v1; D39 → TS-types-as-source schema authorship).

*DRAFT v0.3 — governance reference. D23–D31 ratified, D32–D40 approved (2026-07-10). Planning-locked, not canon; not merged.*
