# /src/platform

**One responsibility:** the Tauri 2 shell and OS integration (window, filesystem paths, packaging hooks). Windows-only for M0, but no Windows-only assumptions may leak into `/src/sim` or `/data`.
