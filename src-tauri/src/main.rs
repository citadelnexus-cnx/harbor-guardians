// Harbor Guardians — Alpha A4 Tauri 2 desktop shell (owner A4 authorization
// 2026-07-23, Option A; PR #21 review correction). Boots one native window
// over the interactive frontend in /src/ui/shell and exposes a minimal local
// persistence bridge (save_game / load_game) so the player can save an active
// expedition, close the app, and resume the exact state.
//
// The bridge is deliberately minimal (brief §5): one local save file in the
// app data dir, written atomically (temp -> fsync -> rename, mirroring the S7
// pipeline principle so a crash never corrupts the prior save). No cloud saves,
// no accounts, no networking, no multi-slot management. All gameplay logic and
// SaveBlob serialization/validation live in the shared TypeScript sim/save core
// (compiled to the webview engine); this crate only reads/writes the bytes the
// webview hands it.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use tauri::Manager;

const SAVE_FILE: &str = "harbor-guardians.save.json";

/// Atomic write: temp file in the target's directory -> fsync -> rename over
/// the target. A failure before the rename leaves any prior save byte-untouched
/// (S7 principle). Pure of Tauri so it is unit-testable with `cargo test`.
fn atomic_write(path: &Path, contents: &str) -> io::Result<()> {
    let dir = path
        .parent()
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "save path has no parent directory"))?;
    fs::create_dir_all(dir)?;
    let tmp = path.with_extension("json.tmp");
    {
        let mut file = fs::File::create(&tmp)?;
        file.write_all(contents.as_bytes())?;
        file.sync_all()?;
    }
    fs::rename(&tmp, path)?;
    Ok(())
}

/// The single local save-file path in the OS app-data directory.
fn save_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(dir.join(SAVE_FILE))
}

/// Persist the canonical SaveBlob JSON the webview produced (already serialized
/// and structurally validated by the shared save core). Atomic on disk.
#[tauri::command]
fn save_game(app: tauri::AppHandle, json: String) -> Result<(), String> {
    let path = save_path(&app)?;
    atomic_write(&path, &json).map_err(|e| e.to_string())
}

/// Load the local save file if it exists (the webview migrates + validates it).
/// Returns None when no save exists yet.
#[tauri::command]
fn load_game(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = save_path(&app)?;
    match fs::read_to_string(&path) {
        Ok(contents) => Ok(Some(contents)),
        Err(ref e) if e.kind() == io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_game, load_game])
        .run(tauri::generate_context!())
        .expect("Harbor Guardians A4 shell failed to start");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn atomic_write_roundtrips_and_overwrites_without_leaving_a_temp_file() {
        let dir = std::env::temp_dir().join(format!("hg-a4-save-test-{}", std::process::id()));
        let path = dir.join(SAVE_FILE);

        atomic_write(&path, "{\"v\":1}").expect("first write");
        assert_eq!(fs::read_to_string(&path).unwrap(), "{\"v\":1}");

        atomic_write(&path, "{\"v\":2}").expect("overwrite");
        assert_eq!(fs::read_to_string(&path).unwrap(), "{\"v\":2}");
        assert!(!path.with_extension("json.tmp").exists(), "no temp file survives a successful write");

        fs::remove_dir_all(&dir).ok();
    }
}
