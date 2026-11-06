//! The half of the voice that is downloaded rather than shipped.
//!
//! The rendered lines and the speech engine are more than a gigabyte together, which is most of
//! the installer for something not every player wants. The light build leaves them out and fetches
//! them here on first run; the full build carries them inside and never comes this way, so a
//! computer with no connection can still be handed one installer and be done.

use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};

use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Emitter, Manager};

const RELEASES: &str = "https://github.com/swchck/which-of-us/releases/download";
/// Progress is emitted at most this often: a byte-by-byte event stream costs more than it shows.
const REPORT_EVERY: u64 = 2 * 1024 * 1024;

#[derive(Deserialize, Serialize, Clone)]
pub struct Part {
    pub id: String,
    /// Directory the archive unpacks to, and the name the server is pointed at.
    pub dir: String,
    pub file: String,
    pub size: u64,
    pub sha256: String,
}

#[derive(Deserialize)]
struct Manifest {
    parts: Vec<Part>,
}

#[derive(Serialize, Clone)]
struct Progress {
    id: String,
    received: u64,
    total: u64,
}

/// Set while a download should stop. One download runs at a time, so one flag is enough.
static ABORT: AtomicBool = AtomicBool::new(false);

pub fn abort() {
    ABORT.store(true, Ordering::SeqCst);
}

pub fn dir(app: &AppHandle) -> Option<PathBuf> {
    app.path().app_data_dir().ok().map(|d| d.join("voice"))
}

/// A downloaded directory, when this computer has it.
pub fn downloaded(app: &AppHandle, name: &str) -> Option<PathBuf> {
    let path = dir(app)?.join(name);
    path.is_dir().then_some(path)
}

/// Which manifest this build asks for: the engine ships a relocatable Python, so the archives are
/// built per platform.
const OS: &str = if cfg!(target_os = "windows") { "windows" } else { "macos" };

async fn manifest(version: &str) -> Result<Manifest, String> {
    let url = format!("{RELEASES}/v{version}/voice-{OS}.json");
    let body = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    if !body.status().is_success() {
        return Err(format!("{url} answered {}", body.status()));
    }
    body.json::<Manifest>().await.map_err(|e| e.to_string())
}

/// Which parts this computer already has, by id.
pub fn present(app: &AppHandle, parts: &[Part]) -> Vec<String> {
    parts
        .iter()
        .filter(|p| downloaded(app, &p.dir).is_some())
        .map(|p| p.id.clone())
        .collect()
}

async fn fetch(app: &AppHandle, version: &str, part: &Part, to: &Path) -> Result<(), String> {
    let url = format!("{RELEASES}/v{version}/{}", part.file);
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!("{url} answered {}", response.status()));
    }
    let total = response.content_length().unwrap_or(part.size);

    let mut file = File::create(to).map_err(|e| e.to_string())?;
    let mut hasher = Sha256::new();
    let mut received: u64 = 0;
    let mut reported: u64 = 0;
    let mut stream = response.bytes_stream();
    while let Some(chunk) = stream.next().await {
        if ABORT.load(Ordering::SeqCst) {
            drop(file);
            let _ = fs::remove_file(to);
            return Err("cancelled".into());
        }
        let chunk = chunk.map_err(|e| e.to_string())?;
        hasher.update(&chunk);
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        received += chunk.len() as u64;
        if received - reported >= REPORT_EVERY || received == total {
            reported = received;
            let _ = app.emit("voice:progress", Progress { id: part.id.clone(), received, total });
        }
    }
    file.flush().map_err(|e| e.to_string())?;

    let got = format!("{:x}", hasher.finalize());
    if got != part.sha256 {
        let _ = fs::remove_file(to);
        return Err(format!("{} arrived damaged", part.file));
    }
    Ok(())
}

/// Unpacks into a temporary name first, so an interrupted run never leaves half a voice behind
/// that the next start would read as installed.
fn unpack(archive: &Path, into: &Path, name: &str) -> Result<(), String> {
    let staging = into.join(format!(".{name}.incoming"));
    let _ = fs::remove_dir_all(&staging);
    fs::create_dir_all(&staging).map_err(|e| e.to_string())?;

    let file = File::open(archive).map_err(|e| e.to_string())?;
    let mut tar = tar::Archive::new(flate2::read::GzDecoder::new(file));
    tar.unpack(&staging).map_err(|e| e.to_string())?;

    let target = into.join(name);
    let _ = fs::remove_dir_all(&target);
    fs::rename(staging.join(name), &target).map_err(|e| e.to_string())?;
    let _ = fs::remove_dir_all(&staging);
    Ok(())
}

/// Fetches every named part, checks it and puts it where the server will look.
pub async fn install(app: &AppHandle, version: &str, ids: Vec<String>) -> Result<(), String> {
    ABORT.store(false, Ordering::SeqCst);
    let manifest = manifest(version).await?;
    let into = dir(app).ok_or("no application data directory")?;
    fs::create_dir_all(&into).map_err(|e| e.to_string())?;

    for id in ids {
        let part = manifest
            .parts
            .iter()
            .find(|p| p.id == id)
            .ok_or_else(|| format!("release {version} offers no part «{id}»"))?;
        let archive = into.join(&part.file);
        fetch(app, version, part, &archive).await?;
        unpack(&archive, &into, &part.dir)?;
        let _ = fs::remove_file(&archive);
    }
    Ok(())
}

/// What the screen needs to decide what to offer: the catalogue and what is already here.
pub async fn state(app: &AppHandle, version: &str) -> Result<(Vec<Part>, Vec<String>), String> {
    let manifest = manifest(version).await?;
    let here = present(app, &manifest.parts);
    Ok((manifest.parts, here))
}
