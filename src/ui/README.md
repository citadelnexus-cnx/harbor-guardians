# /src/ui

**One responsibility:** PixiJS presentation. Thin layer — reads sim state, renders it, forwards input; contains no simulation rules. No game UI exists in M0 (empty shell only).

[`shell/`](shell/) is the M0 static placeholder page served as the Tauri
`frontendDist` (M0 packet §1/§5 smoke-test window) — plain HTML/CSS, no
framework, no PixiJS yet (M0 excludes UI beyond the smoke-test window; PixiJS
arrives with Alpha UI work under its own authorization).
