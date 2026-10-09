//! Desktop shell for «Кто из нас?».
//!
//! Starts the bundled game server as a sidecar process, shows a splash page until the server
//! reports it is listening, then points the window at the TV page. The server dies with the app.

use std::io::Write;
use std::net::TcpListener;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::Duration;

use tauri::{AppHandle, Manager, RunEvent, Url};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

/// Phones are told this port in the QR code, so keep it stable when it's free.
const PREFERRED_PORT: u16 = 3000;
const PORT_ATTEMPTS: u16 = 20;
/// Line the server prints once it accepts connections, followed by the port.
const READY_MARKER: &str = "KTO_READY ";
const DEFAULT_RELAY_URL: &str = "https://kto-relay.swchck.workers.dev";
/// A server that keeps dying is broken, not unlucky; stop restarting it after this many tries.
const MAX_RESTARTS: u32 = 5;
const RESTART_DELAY: Duration = Duration::from_secs(1);
/// How long a quitting app waits for the server to save its rooms before killing it.
const SAVE_GRACE: Duration = Duration::from_secs(2);

struct Server {
    child: Mutex<Option<CommandChild>>,
    exiting: AtomicBool,
    stopped: AtomicBool,
}

fn pick_port() -> u16 {
    (PREFERRED_PORT..PREFERRED_PORT + PORT_ATTEMPTS)
        .find(|port| TcpListener::bind(("0.0.0.0", *port)).is_ok())
        .unwrap_or(PREFERRED_PORT)
}

fn open_game(app: &AppHandle, port: &str) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    match Url::parse(&format!("http://localhost:{port}/")) {
        Ok(url) => {
            if let Err(err) = window.navigate(url) {
                eprintln!("cannot open the game page: {err}");
            }
        }
        Err(err) => eprintln!("server reported a bad port {port:?}: {err}"),
    }
}

/// Prints a line about the game server and keeps it in logs/app.log beside the server's own log, so
/// an archive collected later also tells when the server died, which the server cannot write itself.
fn note(app: &AppHandle, line: &str) {
    eprintln!("{line}");
    let Ok(dir) = app.path().app_data_dir().map(|d| d.join("logs")) else { return };
    let _ = std::fs::create_dir_all(&dir);
    if let Ok(mut file) = std::fs::OpenOptions::new().create(true).append(true).open(dir.join("app.log")) {
        let secs = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0);
        let _ = writeln!(file, "{secs} {line}");
    }
}

fn show_failure(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.eval("window.showFailure && window.showFailure()");
    }
}

/// Runs the sidecar on `port`. `restarts` counts earlier crashes; the first run opens the TV page,
/// later ones just come back on the same port, where the open page is already reconnecting.
fn start_server(app: &AppHandle, port: u16, restarts: u32) -> Result<(), Box<dyn std::error::Error>> {
    let resources = app.path().resource_dir()?;
    let web = resources.join("web");
    let runtime = resources.join("tts-runtime");
    // an app copied from a downloaded DMG carries the quarantine flag into every file; macOS lets the
    // app itself start after «Открыть», but would refuse the Python it ships when the server spawns it
    #[cfg(target_os = "macos")]
    let _ = std::process::Command::new("xattr").args(["-dr", "com.apple.quarantine"]).arg(&runtime).status();
    let data = app.path().app_data_dir()?;
    let mut command = app.shell().sidecar("kto-server")?;
    // a dev build borrows the checkout's engines; a release carries its own runtime, and looking into
    // the checkout (say, under ~/Downloads) made macOS ask the player for access to that folder
    if cfg!(debug_assertions) {
        let tts = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../tts");
        if tts.join("protocol.py").exists() {
            command = command.env("KTO_TTS_DIR", tts.to_string_lossy().to_string());
        }
    }
    // baked in at build time (see docs/RELAY.md), so every copy of the app knows the same relay;
    // an empty KTO_RELAY_URL builds an app without the internet option
    let relay = option_env!("KTO_RELAY_URL").unwrap_or(DEFAULT_RELAY_URL);
    if !relay.is_empty() {
        command = command.env("KTO_RELAY_URL", relay);
    }
    let (mut events, child) = command
        .env("PORT", port.to_string())
        .env("NODE_ENV", "production")
        .env("KTO_DIST", web.to_string_lossy().to_string())
        .env("KTO_TTS_BUNDLE", resources.join("tts-cache").to_string_lossy().to_string())
        .env("KTO_TTS_RUNTIME", runtime.to_string_lossy().to_string())
        .env("KTO_DATA_DIR", data.to_string_lossy().to_string())
        .env("KTO_EXIT_WITH_STDIN", "1")
        .spawn()?;
    let state = app.state::<Server>();
    // the app may have quit while this restart slept; a child stored now would never be killed
    if state.exiting.load(Ordering::SeqCst) {
        let _ = child.kill();
        return Ok(());
    }
    if let Ok(mut slot) = state.child.lock() {
        *slot = Some(child);
    }

    let handle = app.clone();
    tauri::async_runtime::spawn(async move {
        let mut ready = false;
        while let Some(event) = events.recv().await {
            match event {
                CommandEvent::Stdout(bytes) => {
                    let line = String::from_utf8_lossy(&bytes);
                    print!("{line}");
                    if !ready {
                        if let Some(reported) = line.trim().strip_prefix(READY_MARKER) {
                            ready = true;
                            if restarts == 0 {
                                open_game(&handle, reported.trim());
                            }
                        }
                    }
                }
                CommandEvent::Stderr(bytes) => eprint!("{}", String::from_utf8_lossy(&bytes)),
                CommandEvent::Terminated(status) => {
                    note(&handle, &format!("game server exited: {status:?}"));
                    let state = handle.state::<Server>();
                    if state.exiting.load(Ordering::SeqCst) {
                        state.stopped.store(true, Ordering::SeqCst);
                        break;
                    }
                    // count only crashes in a row: a server that came up fine earned a fresh budget
                    let crashes = if ready { 1 } else { restarts + 1 };
                    if restarts == 0 && !ready {
                        show_failure(&handle);
                    } else if crashes <= MAX_RESTARTS {
                        restart(handle.clone(), port, crashes);
                    } else {
                        note(&handle, "game server keeps crashing, giving up");
                        show_failure(&handle);
                    }
                    break;
                }
                _ => {}
            }
        }
    });
    Ok(())
}

fn restart(app: AppHandle, port: u16, restarts: u32) {
    tauri::async_runtime::spawn_blocking(move || {
        std::thread::sleep(RESTART_DELAY);
        if let Err(err) = start_server(&app, port, restarts) {
            note(&app, &format!("cannot restart the game server: {err}"));
        }
    });
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            app.manage(Server {
                child: Mutex::new(None),
                exiting: AtomicBool::new(false),
                stopped: AtomicBool::new(false),
            });
            if let Err(err) = start_server(app.handle(), pick_port(), 0) {
                note(app.handle(), &format!("cannot start the game server: {err}"));
                show_failure(app.handle());
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building the app")
        .run(|app, event| {
            if let RunEvent::Exit = event {
                let Some(state) = app.try_state::<Server>() else {
                    return;
                };
                state.exiting.store(true, Ordering::SeqCst);
                let child = state.child.lock().ok().and_then(|mut c| c.take());
                if let Some(mut child) = child {
                    // ask first: a kill skips the server's final save of the rooms
                    if child.write(b"quit\n").is_ok() {
                        let deadline = std::time::Instant::now() + SAVE_GRACE;
                        while !state.stopped.load(Ordering::SeqCst) && std::time::Instant::now() < deadline {
                            std::thread::sleep(Duration::from_millis(20));
                        }
                    }
                    if !state.stopped.load(Ordering::SeqCst) {
                        let _ = child.kill();
                    }
                }
            }
        });
}
