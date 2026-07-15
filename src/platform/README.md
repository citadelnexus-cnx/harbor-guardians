# /src/platform

**One responsibility:** the Tauri 2 shell and OS integration (window, filesystem paths, packaging hooks). Windows-only for M0, but no Windows-only assumptions may leak into `/src/sim` or `/data`.

## M0 state (Step 8)

The Tauri 2 crate lives at [`/src-tauri`](../../src-tauri/) — the Tauri CLI's
discovery convention (an M0 packet §2 layout refinement; §2 marks the layout
"subject to owner/Claude Code refinement at M0"). Platform-side TypeScript
integration code, when it exists, lives here.

The shell is a **smoke-test window only** (M0 packet §1/§5): one window over
the static placeholder in [`/src/ui/shell`](../ui/shell/) — no dev server, no
game UI, no IPC commands, no plugins, no bundling (`bundle.active: false`).
The placeholder app icon is an original generated solid-color image
(provenance: generated in-session, no external assets).

**Launch:**

```sh
pnpm tauri dev
```

The sim core, harness, and save/load tests are headless and never require
this shell (Sim spec §2): `pnpm run sim:harness`, `pnpm run test:save`,
`pnpm run schema:validate` all run without Tauri or a browser window.
