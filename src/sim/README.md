# /src/sim

**One responsibility:** the deterministic simulation core. **Pure and headless** — no UI imports, no Tauri imports, no DOM, no I/O side effects; runnable by `/sim-harness` without a window (Sim Harness spec; Blueprint deterministic-core requirement).

No gameplay literals anywhere in this tree (No Magic Numbers, Doc 07): every value is read from `/data` seeds validated against `/schema`. Module headers cite the governing doc section and invariant IDs they implement.
