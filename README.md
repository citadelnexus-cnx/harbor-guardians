# Harbor Guardians

[![ci](https://github.com/citadelnexus-cnx/harbor-guardians/actions/workflows/ci.yml/badge.svg)](https://github.com/citadelnexus-cnx/harbor-guardians/actions/workflows/ci.yml)

Standalone project. Currently under **Milestone 0** scope only (environment, repo, docs, schemas, sim-harness skeleton, save/load skeleton, CI). No gameplay implementation is authorized at this stage.

## Commands

```sh
pnpm run schema:validate   # generated-schema drift guard + /data seed validation
pnpm run sim:harness       # headless claim-to-test batch (no window required)
pnpm run test:save         # save/load atomic-write + round-trip + crash tests
pnpm exec tsc --noEmit     # typecheck
pnpm tauri dev             # M0 smoke-test window (empty shell; no gameplay)
```
