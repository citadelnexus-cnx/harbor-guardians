# /src/save

**One responsibility:** save/load and time reconciliation per SAVE_LOAD_TIME_RECONCILIATION_SPEC. Saves are atomic — write-temp → fsync → rename (S7) — and never silently lose player value.
