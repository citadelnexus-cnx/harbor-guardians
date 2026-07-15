// Harbor Guardians — M0 Tauri 2 shell (M0 packet §1 deliverable "UI beyond a
// smoke-test window" is explicitly OUT of M0; §5 verification: "builds and
// launches an empty window"). Boots one window over the static placeholder in
// /src/ui/shell. No gameplay, no sim integration, no IPC commands, no plugins
// (CLAUDE.md §7 scope discipline). The sim core and harness stay headless and
// never depend on this crate (Sim spec §2).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Harbor Guardians M0 shell failed to start");
}
