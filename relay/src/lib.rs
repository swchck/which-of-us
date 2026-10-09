//! Internet relay for «Кто из нас?».
//!
//! The game keeps running on the host's computer; this Worker only lets phones reach it over
//! one fixed HTTPS address. The computer dials out to `/host` and keeps that WebSocket open,
//! and every phone request is carried to it through a [`tunnel::Tunnel`] Durable Object, one
//! per host code. Nothing about a game is stored here, only which secret owns which code.
//!
//! Phones are routed by a cookie rather than a path prefix, because the game's pages and
//! server use absolute paths (`/ws`, `/assets/...`) everywhere.

pub mod frame;
pub mod page;
mod tunnel;

use worker::*;

const HOST_COOKIE: &str = "kto_host";
const HOST_COOKIE_MAX_AGE_SECS: u32 = 12 * 3600;
const CODE_LEN: usize = 8;
/// No 0/O, 1/I/L: the code may be read aloud or typed from a screen.
const CODE_ALPHABET: &str = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/// Reports whether `code` looks like a host code. Lowercase is accepted, people type links.
pub fn valid_code(code: &str) -> bool {
    code.len() == CODE_LEN && code.chars().all(|c| CODE_ALPHABET.contains(c.to_ascii_uppercase()))
}

/// Reports whether a phone may reach this path of the game through the relay.
///
/// Everything else (the TV page, narration, logs) stays on the computer: a relay that forwarded
/// any path would be a free open proxy on our domain.
pub fn phone_path(method: &str, path: &str) -> bool {
    match method {
        "GET" | "HEAD" => {
            path == "/p"
                || path == "/ws"
                || ["/assets/", "/a/", "/sketch/", "/licenses/"]
                    .iter()
                    .any(|p| path.starts_with(p))
        }
        "POST" => {
            let mut parts = path.split('/');
            matches!(
                (parts.next(), parts.next(), parts.next(), parts.next(), parts.next(), parts.next()),
                (Some(""), Some("api"), Some("room"), Some(code), Some("image"), None) if !code.is_empty()
            )
        }
        _ => false,
    }
}

fn cookie(req: &Request, name: &str) -> Option<String> {
    let header = req.headers().get("cookie").ok()??;
    header.split(';').find_map(|pair| {
        let (k, v) = pair.trim().split_once('=')?;
        (k == name).then(|| v.to_string())
    })
}

fn tunnel(env: &Env, code: &str) -> Result<Stub> {
    env.durable_object("TUNNEL")?.get_by_name(&code.to_ascii_uppercase())
}

async fn landing(req: &Request, env: &Env, code: &str) -> Result<Response> {
    let ip = req.headers().get("cf-connecting-ip")?.unwrap_or_default();
    if !env.rate_limiter("LANDING")?.limit(ip).await?.success {
        return page::error(
            429,
            "Слишком много попыток",
            "Подождите минуту и откройте ссылку снова.",
        );
    }
    let query = req.url()?.query().map(|q| format!("?{q}")).unwrap_or_default();
    let headers = Headers::new();
    headers.set("location", &format!("/p{query}"))?;
    headers.set(
        "set-cookie",
        &format!(
            "{HOST_COOKIE}={}; Path=/; Max-Age={HOST_COOKIE_MAX_AGE_SECS}; Secure; HttpOnly; SameSite=Lax",
            code.to_ascii_uppercase()
        ),
    )?;
    headers.set("cache-control", "no-store")?;
    Ok(Response::empty()?.with_status(302).with_headers(headers))
}

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    let path = req.path();
    if path == "/host" {
        let code = req.headers().get("x-kto-host")?.unwrap_or_default();
        if !valid_code(&code) {
            return Response::error("bad host code", 400);
        }
        return tunnel(&env, &code)?.fetch_with_request(req).await;
    }
    if let Some(code) = path.strip_prefix('/').filter(|c| valid_code(c)) {
        return landing(&req, &env, code).await;
    }
    if path == "/" {
        return page::error(404, "Кто из нас?", "Отсканируйте QR-код с экрана телевизора.");
    }
    if !phone_path(req.method().as_ref(), &path) {
        return Response::error("not found", 404);
    }
    match cookie(&req, HOST_COOKIE).filter(|c| valid_code(c)) {
        Some(code) => tunnel(&env, &code)?.fetch_with_request(req).await,
        None => page::error(
            404,
            "Не знаем, к какой игре подключить",
            "Отсканируйте QR-код с экрана телевизора ещё раз.",
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn codes() {
        assert!(valid_code("K7M2QXAB"));
        assert!(valid_code("k7m2qxab"));
        assert!(!valid_code("K7M2QXA"));
        assert!(!valid_code("K7M2QXA0"));
        assert!(!valid_code("K7M2QXAÉ"));
    }

    #[test]
    fn only_phone_paths_pass() {
        for ok in [
            "/p",
            "/ws",
            "/assets/play-x.js",
            "/a/1234/abc",
            "/sketch/hat.webp",
            "/licenses/font-rubik.txt",
        ] {
            assert!(phone_path("GET", ok), "{ok}");
        }
        assert!(phone_path("POST", "/api/room/1234/image"));
        for bad in [
            "/",
            "/tts/piper/irina",
            "/api/logs",
            "/api/info",
            "/api/tts",
            "/host.html",
            "/pp",
            "/assets",
        ] {
            assert!(!phone_path("GET", bad), "{bad}");
        }
        assert!(!phone_path("POST", "/api/logs"));
        assert!(!phone_path("POST", "/api/room//image"));
        assert!(!phone_path("POST", "/api/room/1234/image/x"));
        assert!(!phone_path("PUT", "/p"));
    }
}
