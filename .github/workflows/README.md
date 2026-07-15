# /.github/workflows

**One responsibility:** CI pipelines. On every push and pull request, [`ci.yml`](ci.yml) runs, in order: install → typecheck → lint → schema validation (including proof the broken fixture is rejected, DC5) → sim-harness smoke → save/load tests → headless Tauri/Rust compile check. Red CI blocks merge to `main` via the `main-protection` ruleset's required status check (M0 packet §4, added at M0 Step 9).

CI is headless (no GUI window), needs no secrets, publishes no artifacts, and deploys nothing.
