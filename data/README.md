# /data

**One responsibility:** authored content seeds — every gameplay value originates here (No Magic Numbers, Doc 07), validated against `/schema`.

Each seed value carries id · unit · gate · source-section · invariant-refs (DC4). `/src/sim` reads this data; it never hard-codes numbers. One home per feature: world→`world/`, factions→`factions/`, guardians→`guardians/`, etc.
