# /data/guardians

**One responsibility:** guardian kit seeds per B4 (Guardian Sanctum & Kit), B4A (Flagship Kit Sheets), and B4B (Launch Chassis Anchors) — including the six GuardianKit fixtures (Raxa, Tarin, Nova, Bru, Sef, Dagg) added at M0 Step 5.

Enums: `chassis`, `difficulty_tag`, `launch_wave` (B4/B4A §4B).

Seed files are `GuardianKitSeed` envelopes (`schema_version` + `kit` verbatim from B4A/B4B §6 + DC4 `value_metadata` for every numeric value). Files named `*.invalid.json` are deliberate negative fixtures: `pnpm run schema:validate` requires them to FAIL validation and exits non-zero if one ever passes.
