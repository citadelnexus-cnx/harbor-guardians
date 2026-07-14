# /sim-harness — claim-to-test QA spine (M0 skeleton)

**One responsibility:** the headless CLI runner over the pure sim core (`/src/sim`) —
persona matrix plus the claim-to-test invariant suites. QA per [`AGENTS.md`](../AGENTS.md):
the arbiter of "done" — a claim is true only when its invariant passes here.

Governing docs: [`SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2`](../docs/foundation/SIM_HARNESS_ACCEPTANCE_SPEC_v0.6.2.md)
(architecture §2, persona matrix §3, suites §4, report §5, gates §7, evidence §8);
M0 packet §8; [`CLAUDE.md`](../CLAUDE.md) §3 (claim-to-test).

## M0 state — registry + fail-loud stubs only

**No gameplay or sim-core logic exists here.** What exists:

- **Invariant registry** ([`registry.ts`](registry.ts)) — all 122 required IDs
  registered as addressable, fail-loud stubs:
  E1–E21 · L1–L15 · M1–M10 · C1–C8 · CARGO1–CARGO5 · S1–S7 · OPS1 · UX1 ·
  DC1–DC6 · TD1–TD4 · A11Y1–A11Y5 · OB1–OB5 · GEAR1–GEAR6 · W1–W9 ·
  FCT1–FCT8 · GDN1–GDN11.
  Executing a stub **throws** (`InvariantStubError`) — "claimed but untested"
  is impossible. A feature PR turns its stub(s) green by replacing the check
  body, flipping `status` to `"implemented"`, and attaching evidence.
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
pnpm run sim:harness                    # full M0 batch — exit 0 iff green
pnpm run sim:harness -- --seed 1234     # same batch under another fixed seed
pnpm run sim:harness -- --list          # print the registry
pnpm run sim:harness -- --invariant E2  # execute one invariant for real
```

At M0, `--invariant <ID>` **exits 1 for every ID** — that is the point: every
invariant is a fail-loud stub until its feature is implemented and proven.
The batch records stubs as `STUB_FAIL_LOUD_VERIFIED`, never `PASS`.

Batch reports are written to `sim-harness/reports/` (gitignored); they are
evidence artifacts attached to PRs per Sim §8, not committed state.
