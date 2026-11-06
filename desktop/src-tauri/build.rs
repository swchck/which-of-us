fn main() {
    // the game page is served over http, which makes it a remote origin: Tauri hands a remote page
    // only the commands a capability names, and naming one needs it declared here first
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new()
                .commands(&["app_version", "voice_state", "voice_install", "voice_cancel"]),
        ),
    )
    .expect("failed to run tauri-build")
}
