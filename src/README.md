# /src

**One responsibility:** application source, split by layer — `sim/` (pure deterministic core), `save/` (persistence), `ui/` (presentation), `platform/` (Tauri shell). Dependencies point inward: ui/platform may read sim; sim imports neither.
