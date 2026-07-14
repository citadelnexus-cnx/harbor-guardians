---
title: "Accessibility & Input Calibration Spec"
doc_id: "06_ACCESSIBILITY_INPUT_CALIBRATION_SPEC"
version: 0.1.2-DRAFT
date: 2026-07-10
bundle_version: v0.1.2-dependency
status: DRAFT v0.1.2 for owner review — metadata cleanup: H1/version drift fixed. explicit touch-target + remapping acceptance rules. APPROVED-FOR-REVISION; not canon; no repo/vault mutation.
source: "Decision Register D1–D22 (D10); AMEND-03 v0.4 (A3.3 combat accessibility doctrine); 02_COMBAT_AND_GUARDIAN_SURGE_FOUNDATION v0.5 (Tide Chain, §5 accessibility, §6 training/latency); SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 (C1–C7, S4)"
classification: FUTURE BUILD — targets pending prototype measurement
blocks: "any public 'playable' claim for timing/combat prototype"
---

# Accessibility & Input Calibration Spec v0.1.2

**Why this exists:** D10 makes accessibility mandatory **from the first prototype**, and AMEND-03 A3.3 + Combat §5–6 state the doctrine. This doc turns that doctrine into concrete, testable settings and a calibration flow, so no timing feature ships without its assist path and no timing prototype is called "playable" before calibration exists.

## 1. Non-negotiable principles
1. **Base progress is never gated behind manual precision timing.** The base attack always resolves; timing (Tide Chain) is bonus-only (Combat §2). A zero-timing player can finish all required content (C1).
2. **Every timing feature ships its assist path in the same build** (D10). Assist is a launch requirement, never a patch.
3. **No color-only, no audio-only cues.** All critical cues use shape + icon + text, with color as reinforcement only.
4. **Mobile is first-class**, not a port afterthought.

## 2. Assist tiers (player-selectable, changeable any time)
| Tier | Timing window | Bonus scaling | Intended for |
|---|---|---|---|
| Precise | base (target ≥400ms desktop / ≥500ms touch) | 100% of manual bonus | players who want full mastery |
| Assisted | widened ×1.5–2.0 | ~85% | motor/latency needs, casual play |
| Auto-complete | no input required | ~60–70% | fatigue, one-handed, cognitive load |
All three reach Guardian Surge at a sim-verified comparable rate (C2 assist parity; Combat §3 rule 7). Windows/scalars are data-seed targets [UNKNOWN — prototype].

## 3. Sensory accessibility
- **Colorblind-safe:** every timing/threat/economy cue carries shape + icon + text; a colorblind simulation test (protan/deutan/tritan) is part of QA.
- **Hearing:** no timing or warning depends on audio alone; captions/visual equivalents for every audio cue.
- **Reduced-effects mode:** dampens flashes/particles while preserving all mechanical information (turn bar, timing prompt, hit feedback) — also a photosensitivity safeguard.
- **Text scale & high-contrast UI** options for all readable surfaces.

## 4. Motor & input accessibility
- Widened/held-input timing options; no double-tap or precision-drag requirement for progression.
- Remappable inputs (desktop); large touch zones (mobile) with no tiny precision-only controls.
- One-handed / auto-resolve fallback for combat (fatigue-friendly).

**Touch-target acceptance rules (P5):**
- Every interactive control has a hit area of **at least 24×24 CSS px equivalent** (hard minimum — a control below this fails QA).
- **Primary touch controls** (Tide Chain prompt, Claim/Unload, Read/Acknowledge, confirm/cancel, combat actions) target **44–48 CSS px equivalent**.
- Spacing prevents adjacent-target mis-taps (minimum gap tuned in QA); prompts never require pixel-precise placement.

**Remapping / no-mandatory-key-path rule (P5):**
- No action is reachable only through a single hardcoded key or gesture. Every gameplay action is either remappable or reachable through an alternate input path (pointer/touch/menu).
- Desktop bindings are fully remappable; a remap profile persists (§8).
- No progression step requires a specific physical key that cannot be reassigned or substituted.

## 5. Input-latency calibration (required before any public playable claim — C7)
A calibration flow measures device round-trip input latency (desktop + mobile) and offsets timing windows accordingly, so a high-latency device is not unfairly penalized:
- Runs on first launch and is re-runnable from settings.
- Stores a per-device `input_latency_offset`.
- Timing-window evaluation applies the offset so "on time" means on time *for that device*.
- Calibration existence and correctness is an acceptance gate (C7): no public "playable" claim without it.

## 6. Training arena / practice mode (required before balance tuning — C6)
A no-stakes training space (practice dummy) exists **before** combat balance tuning:
- Lets players learn Tide Chain timing and see assist tiers in action with no resource/raid consequence.
- Used by QA to validate assist parity and by the sim to check C1 (zero-timing completion) and C2 (assist parity).
- Available from the first combat prototype.

## 7. Settings persistence & defaults
- All accessibility settings persist across sessions and apply from the first prototype (S4).
- Safe defaults: Assisted timing on, reduced-effects off, colorblind-safe cues always on (never a toggle that can hide critical info), captions on.
- Changing a setting takes effect immediately, including mid-session (not mid-timing-window).

## 8. Save/load
Persist an `accessibility` block: `assist_tier · input_latency_offset · reduced_effects · text_scale · contrast · captions · remap_profile`. Round-trip preserves all settings (S4/S5). Settings are device/player-scoped, not part of world economic state.

## 9. Sim & QA invariants (feeds SIM_HARNESS_ACCEPTANCE_SPEC)
Reuses **C1** (base progress without timing), **C2** (assist parity within band), **C5** (mobile input pass — touch-target + window minimums), **C6** (training mode before balance tuning), **C7** (latency calibration before public playable), **S4** (settings persist/apply from first prototype). Spec-specific: **A11Y1** no critical cue is color-only or audio-only (automated audit); **A11Y2** every timing feature has a shipping assist path in the same build (build-time check); **A11Y3** latency offset is applied in window evaluation (unit test across simulated latencies); **A11Y4** every interactive control ≥ 24×24 CSS px, primary touch controls 44–48 (automated layout audit); **A11Y5** no action is reachable only via a single hardcoded key path — every action is remappable or has an alternate input path (input-map audit).

## 10. Data-seed / config exports (`/data/accessibility/`)
`assist_tiers (windows, bonus scalars) · latency_calibration (offset bounds) · cue_requirements (shape/icon/text mandates) · defaults · a11y_invariants`. No Magic Numbers rule applies to any gameplay-affecting timing value.

## 11. Open questions for owner
1. **Default assist tier** — ship defaulting to Assisted (inclusive) or Precise (mastery-first with easy opt-down)? Recommended: Assisted default.
2. **Auto-complete bonus %** — 60% vs 70% starting target (sim-tuned within parity band).
3. **Latency offset ceiling** — cap beyond which the game recommends Auto-complete rather than widening indefinitely.

*DRAFT v0.1.2 — FUTURE BUILD. Approved-for-revision; merge requires a separately authorized session. Required before any public "playable" timing/combat claim.*
