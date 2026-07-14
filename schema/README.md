# /schema

**One responsibility:** generated JSON Schema for the data contracts. TS types are the source of truth; every schema here is **generated** from them (D39) — never hand-authored.

CI blocks the build on an unversioned/invalid schema or any `/data` file that fails validation (DC5).

- Source types: [`src/contracts/`](../src/contracts/) · generate: `pnpm run schema:generate` · validate: `pnpm run schema:validate`.
- `schema:validate` includes a drift guard: a hand-edited schema file fails validation until regenerated (D39).
