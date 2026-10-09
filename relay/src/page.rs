//! The few pages the relay answers by itself, when it cannot hand a phone to the game.

use worker::{Headers, Response, Result};

const OFFLINE_RETRY_SECS: u32 = 5;

fn render(status: u16, title: &str, advice: &str, head: &str) -> Result<Response> {
    let html = format!(
        r#"<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">{head}<title>{title}</title><style>body{{margin:0;min-height:100vh;display:grid;place-content:center;gap:12px;padding:24px;background:#2a1458;color:#fff;font:18px/1.4 system-ui,sans-serif;text-align:center}}h1{{margin:0;font-size:26px}}p{{margin:0;opacity:.8}}</style></head><body><h1>{title}</h1><p>{advice}</p></body></html>"#
    );
    let headers = Headers::new();
    headers.set("content-type", "text/html; charset=utf-8")?;
    headers.set("cache-control", "no-store")?;
    Ok(Response::from_bytes(html.into_bytes())?
        .with_status(status)
        .with_headers(headers))
}

/// Returns a small phone page with a title and one line of advice.
///
/// Both strings are written into HTML as they are, so only constants may be passed.
pub fn error(status: u16, title: &'static str, advice: &'static str) -> Result<Response> {
    render(status, title, advice, "")
}

/// Returns the page for a host code whose computer is not connected right now; it reloads
/// itself, so a phone that scanned the QR early gets in as soon as the computer is online.
pub fn offline() -> Result<Response> {
    render(
        503,
        "Компьютер с игрой не в сети",
        "Проверьте, что игра запущена и подключение через интернет включено. Страница обновится сама.",
        &format!(r#"<meta http-equiv="refresh" content="{OFFLINE_RETRY_SECS}">"#),
    )
}
