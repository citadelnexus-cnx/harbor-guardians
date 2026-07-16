---
title: "Harbor Guardians — Alpha A0 Execution Brief"
doc_id: "ALPHA_A0_EXECUTION_BRIEF"
version: 0.1
date: 2026-07-15
status: ACTIVE — records the scope of the owner's Alpha A0 authorization (2026-07-15). A0 = planning and harness preparation only. Does not authorize A1 or any gameplay.
owner: Anthony Hammon
source: "Owner Alpha A0 authorization record 2026-07-15 (held privately outside this public repo, per CLAUDE.md §7); 15_EVENT_SYSTEM_SPEC v0.2 §5 (EVT suite); 18_DIFFICULTY_PHILOSOPHY v0.2; M0_EXIT_EVIDENCE.md; SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2; CLAUDE.md §3/§4/§6/§7"
classification: CURRENT BUILD — harness registration only; all EVT capability remains FUTURE BUILD
---

# Harbor Guardians — Alpha A0 Execution Brief (v0.1)

## 0. Authorization

Milestone 0 is closed ([`M0_EXIT_EVIDENCE.md`](../../M0_EXIT_EVIDENCE.md)). On **2026-07-15** the owner (Anthony Hammon) issued a limited authorization covering **Alpha A0 only — planning and harness preparation**. It authorizes no gameplay implementation, and no Alpha A1 work may begin without a separate owner approval.

The authorization record itself is held privately outside this public repo, like the M0 record (CLAUDE.md §7), and is not reproduced here. This brief records what that authorization covers so every A0 PR traces to it.

## 1. A0 scope — what is authorized

1. **Alpha planning documents** under `docs/alpha/` (this brief + the boundary README).
2. **EVT harness registration:** EVT1–EVT10 from [`15_EVENT_SYSTEM_SPEC v0.2 §5`](../pre-alpha/15_EVENT_SYSTEM_SPEC_v0.2.md) registered in the sim-harness invariant registry as **addressable, fail-loud stubs** — exactly like every other suite at M0 (claim-to-test, CLAUDE.md §3). Registry total rises 122 → **132**.
3. **The minimal harness bookkeeping that registration requires:** the `EVT` suite prefix in the harness types, expected suite counts, and README/label updates. Nothing else.

## 2. A0 boundary — what is NOT authorized

- **No gameplay implementation** — no event lifecycle logic, no harbor state, no economy, no combat, no raids, no quests, no factions, no guardians, no UI screens.
- **No UI gameplay** — the Tauri shell remains the empty M0 smoke-test window, unchanged.
- **No content events** — no `/data` event seeds, no event schema generation.
- **No Alpha A1 work** — A1 begins only with a separate owner approval.
- **No deployment, no secrets, no private owner records committed to the repo.**

Every EVT invariant remains status `"stub"`: executing it throws `InvariantStubError`. **No EVT invariant is claimed as implemented or passing.** S5 and S7 remain the only implemented invariants (M0 empty-shell scope). A future feature PR (A1+, separately authorized) turns an EVT stub green only with evidence.

## 3. Exit condition

A0 is complete when: the two `docs/alpha/` documents exist on `main`; EVT1–EVT10 are registered fail-loud; the harness batch is green with 132 invariants (130 fail-loud stubs verified + S5/S7 passing); and all M0 verification commands still exit 0. Anything further is A1 and waits for the owner.

*A0 brief v0.1 — planning and harness preparation only. Does not authorize gameplay or A1. Escalation on any boundary question per CLAUDE.md §6.*
