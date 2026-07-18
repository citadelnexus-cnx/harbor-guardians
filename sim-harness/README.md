# /sim-harness — claim-to-test QA spine (M0 skeleton + A0 EVT registration + A1 data-contract checks + A2 claim-ledger checks)

**One responsibility:** the headless CLI runner over the pure sim core (`/src/sim`) —
persona matrix plus the claim-to-test invariant suites. QA per [`AGENTS.md`](../AGENTS.md):
the arbiter of "done" — a claim is true only when its invariant passes here.

Governing docs: [`SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2`](../docs/foundation/SIM_HARNESS_ACCEPTANCE_SPEC_v0.6.2.md)
(architecture §2, persona matrix §3, suites §4, report §5, gates §7, evidence §8);
M0 packet §8; [`CLAUDE.md`](../CLAUDE.md) §3 (claim-to-test).

## A2 state — registry + fail-loud stubs + honest conversions

**No gameplay loop exists.** What exists:

- **Invariant registry** ([`registry.ts`](registry.ts)) — all 132 required IDs
  registered and addressable:
  E1–E21 · L1–L15 · M1–M10 · C1–C8 · CARGO1–CARGO5 · S1–S7 · OPS1 · UX1 ·
  DC1–DC6 · TD1–TD4 · A11Y1–A11Y5 · OB1–OB5 · GEAR1–GEAR6 · W1–W9 ·
  FCT1–FCT8 · GDN1–GDN11 · EVT1–EVT10.
  **EVT1–EVT10** were registered at **Alpha A0** (owner A0 authorization,
  2026-07-15) from [`15_EVENT_SYSTEM_SPEC v0.2 §5`](../docs/pre-alpha/15_EVENT_SYSTEM_SPEC_v0.2.md)
  as fail-loud stubs only — **no event lifecycle logic exists**; A0 authorizes
  planning + harness preparation, not gameplay (see
  [`docs/alpha/`](../docs/alpha/README.md)).
  **Implemented (M0 Step 7):** S5 + S7 at empty-shell scope (Sim §7 M0 exit
  gate), backed by the save/load proofs in
  [`src/save/proofs.ts`](../src/save/proofs.ts).
  **Implemented (Alpha A1, owner authorization 2026-07-16):** DC1, DC4, DC5,
  DC6 ([`data-contract-checks.ts`](data-contract-checks.ts)) at A1 scope —
  No-Magic-Numbers scan + harbor-spine seed binding, DC4 metadata across all
  seed sets, the CI validation gate + drift guard + negative fixtures, and
  CoreResource-only storage typing probes; S5 extended with the stocked
  seeded-storage round-trip (3S bands from
  [`data/economy/storage.st1.json`](../data/economy/storage.st1.json)).
  **Implemented (Alpha A2, owner authorization 2026-07-17):** L1, L5, L6, L7,
  L11, L14 ([`ledger-checks.ts`](ledger-checks.ts)) at A2 scope — routing/
  claiming conservation, Story Claim protection, partial-claim exactness,
  seeded slot accounting ([`data/rewards/claim_ledger_rules.json`](../data/rewards/claim_ledger_rules.json)),
  full-slot pending safety, and pending save/load persistence — over
  **test-supplied packages only** (no gameplay reward source exists); S5
  extended with the reward-bearing ledger round-trip and S7 upgraded to
  crash-simulate over reward-bearing saves.
  Every other ID is a fail-loud stub: executing it **throws**
  (`InvariantStubError`) — "claimed but untested" is impossible. A feature PR
  turns its stub(s) green by replacing the check body, flipping `status` to
  `"implemented"`, and attaching evidence.
- **Fail-loud runner** ([`run.ts`](run.ts)) — verifies registry completeness,
  gates on schema-validated seeds (invokes `scripts/validate-data.mjs`, Sim §2),
  verifies every stub throws, proves fixed-seed repeat-run determinism, and
  emits the machine-readable JSON report + human summary (Sim §2/§5).
- **Persona matrix hooks** ([`personas.ts`](personas.ts)) — the Sim §3 personas
  declared with the assisted/precise timing axis (D38) and parameter axes
  (offline windows 8h/24h/72h; guardian-bias runs enumerated from the
  validated `/data/guardians` seeds). Hooks only — behavior models are
  FUTURE BUILD; a persona claiming one at M0 fails the batch.
- **Determinism spine** ([`determinism.ts`](determinism.ts)) — seeded PRNG +
  repeat-run proof (same seed + same input ⇒ byte-identical output).

## Commands

```sh
pnpm run sim:harness                    # full batch — exit 0 iff green
pnpm run sim:harness -- --seed 1234     # same batch under another fixed seed
pnpm run sim:harness -- --list          # print the registry
pnpm run sim:harness -- --invariant E2  # execute one invariant for real
```

`--invariant <ID>` **exits 1 for every stub ID** — that is the point: an
invariant stays a fail-loud stub until its feature is implemented and proven
(S5/S7 exit 0 since M0 Step 7; DC1/DC4/DC5/DC6 exit 0 since Alpha A1;
L1/L5/L6/L7/L11/L14 exit 0 since Alpha A2). The batch records stubs as
`STUB_FAIL_LOUD_VERIFIED`, never `PASS` — at A2 that is 120 stubs + 12
implemented.

Batch reports are written to `sim-harness/reports/` (gitignored); they are
evidence artifacts attached to PRs per Sim §8, not committed state.
