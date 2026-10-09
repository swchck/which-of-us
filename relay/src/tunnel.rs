//! One Durable Object per host code: it holds the computer's WebSocket and the phones' sockets
//! and passes frames between them.
//!
//! Sockets are accepted through the hibernation API and tagged with their role, so the object
//! can sleep between messages without losing who is who. Only in-flight HTTP requests live in
//! memory, and a pending request keeps the object awake until it is answered.

use std::cell::RefCell;
use std::collections::HashMap;
use std::time::Duration;

use futures_channel::oneshot;
use futures_util::future::{select, Either};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use worker::*;

use crate::frame::{self, Kind, ReqHead, ResHead, WsData, WsOpenHead};
use crate::page;

const HOST_TAG: &str = "host";
const CLAIM_KEY: &str = "claim";
/// The computer sends 32 random bytes as hex.
const SECRET_MIN_LEN: usize = 32;
/// A code nobody connected with for this long goes back to the pool.
const CLAIM_TTL: Duration = Duration::from_secs(60 * 24 * 3600);
const BODY_CHUNK: usize = 256 * 1024;
/// Photos are capped at 600 KB by the game; this leaves room and still stops abuse.
const REQUEST_MAX_BYTES: usize = 1024 * 1024;
/// The biggest thing a phone loads is a ~300 KB script or backdrop.
const RESPONSE_MAX_BYTES: usize = 4 * 1024 * 1024;
const RESPONSE_TIMEOUT: Duration = Duration::from_secs(30);
/// Phones reconnect on any close code but 4000 (taken over by another tab).
const CLOSE_HOST_GONE: u16 = 4012;
const CLOSE_REPLACED: u16 = 4000;
/// The computer pings with exactly this text; the runtime answers without waking the object.
const KEEPALIVE_PING: &str = "ping";
const KEEPALIVE_PONG: &str = "pong";

/// Request headers that describe the hop to us, not the phone's request.
const DROP_REQUEST_HEADERS: &[&str] = &[
    "cookie",
    "host",
    "connection",
    "upgrade",
    "keep-alive",
    "te",
    "trailer",
    "transfer-encoding",
    "content-length",
    "cdn-loop",
    "x-real-ip",
];
const DROP_REQUEST_PREFIXES: &[&str] = &["cf-", "x-forwarded-", "x-kto-", "sec-websocket-", "proxy-"];
/// The only response headers a phone gets back; anything else (cookies above all) stays home.
const KEEP_RESPONSE_HEADERS: &[&str] = &[
    "content-type",
    "content-encoding",
    "cache-control",
    "etag",
    "last-modified",
    "vary",
    "content-security-policy",
    "content-language",
];

#[derive(Serialize, Deserialize)]
struct Claim {
    secret_sha256: String,
    last_seen: u64,
}

type Answer = std::result::Result<(ResHead, Vec<u8>), String>;

struct Pending {
    head: Option<ResHead>,
    body: Vec<u8>,
    done: Option<oneshot::Sender<Answer>>,
}

#[durable_object]
pub struct Tunnel {
    state: State,
    pending: RefCell<HashMap<u32, Pending>>,
}

fn sha256_hex(s: &str) -> String {
    Sha256::digest(s.as_bytes())
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

fn channel_tag(ch: u32) -> String {
    format!("ch:{ch}")
}

fn channel_of(tags: &[String]) -> Option<u32> {
    tags.iter().find_map(|t| t.strip_prefix("ch:")?.parse().ok())
}

fn forwardable(name: &str) -> bool {
    !DROP_REQUEST_HEADERS.contains(&name) && !DROP_REQUEST_PREFIXES.iter().any(|p| name.starts_with(p))
}

fn request_headers(req: &Request) -> Vec<(String, String)> {
    req.headers().entries().filter(|(k, _)| forwardable(k)).collect()
}

fn phone_ip(req: &Request) -> String {
    req.headers().get("cf-connecting-ip").ok().flatten().unwrap_or_default()
}

fn path_and_query(req: &Request) -> Result<String> {
    let url = req.url()?;
    Ok(match url.query() {
        Some(q) => format!("{}?{q}", url.path()),
        None => url.path().to_string(),
    })
}

/// Reports whether a successful answer for `path` may carry this content type. A phone only
/// ever gets the game's own kinds of files, so a modified host cannot serve arbitrary pages
/// from the relay's domain except the one game page.
fn allowed_type(path: &str, content_type: &str) -> bool {
    let ct = content_type.split(';').next().unwrap_or("").trim();
    if path == "/p" {
        return ct == "text/html";
    }
    if path.starts_with("/assets/") {
        return matches!(
            ct,
            "text/css" | "text/javascript" | "application/javascript" | "application/json" | "audio/mp4"
        ) || ct.starts_with("font/")
            || ct.starts_with("image/");
    }
    if path.starts_with("/a/") || path.starts_with("/sketch/") {
        return ct.starts_with("image/");
    }
    if path.starts_with("/licenses/") {
        return ct == "text/plain";
    }
    if path.starts_with("/api/") {
        return ct == "application/json";
    }
    false
}

/// Close codes a WebSocket may be closed with; the rest are reserved for the protocol itself.
fn sendable_close(code: u16) -> u16 {
    if code == 1000 || (3000..=4999).contains(&code) {
        code
    } else {
        1000
    }
}

impl Tunnel {
    fn host(&self) -> Option<WebSocket> {
        self.state.get_websockets_with_tag(HOST_TAG).into_iter().next()
    }

    fn phone(&self, ch: u32) -> Option<WebSocket> {
        self.state.get_websockets_with_tag(&channel_tag(ch)).into_iter().next()
    }

    fn new_channel(&self) -> u32 {
        loop {
            let ch = (js_sys::Math::random() * u32::MAX as f64) as u32;
            if ch != 0 && !self.pending.borrow().contains_key(&ch) && self.phone(ch).is_none() {
                return ch;
            }
        }
    }

    /// Drops every phone and pending request: their channels belonged to a connection that is gone.
    fn drop_phones(&self, reason: &str) {
        for ws in self.state.get_websockets() {
            if !self.state.get_tags(&ws).iter().any(|t| t == HOST_TAG) {
                let _ = ws.close(Some(CLOSE_HOST_GONE), Some(reason));
            }
        }
        for (_, mut p) in self.pending.borrow_mut().drain() {
            if let Some(done) = p.done.take() {
                let _ = done.send(Err(reason.to_string()));
            }
        }
    }

    async fn connect_host(&self, req: Request) -> Result<Response> {
        let auth = req.headers().get("authorization")?.unwrap_or_default();
        let Some(secret) = auth.strip_prefix("Bearer ").filter(|s| s.len() >= SECRET_MIN_LEN) else {
            return Response::error("unauthorized", 401);
        };
        let hash = sha256_hex(secret);
        let storage = self.state.storage();
        if let Some(claim) = storage.get::<Claim>(CLAIM_KEY).await? {
            if claim.secret_sha256 != hash {
                return Response::error("code taken", 409);
            }
        }
        storage
            .put(
                CLAIM_KEY,
                Claim {
                    secret_sha256: hash,
                    last_seen: Date::now().as_millis(),
                },
            )
            .await?;
        storage.set_alarm(CLAIM_TTL).await?;

        // a reconnect after a silent network drop arrives before the old socket notices
        if let Some(old) = self.host() {
            let _ = old.close(Some(CLOSE_REPLACED), Some("replaced"));
        }
        self.drop_phones("host reconnected");
        let pair = WebSocketPair::new()?;
        self.state.accept_websocket_with_tags(&pair.server, &[HOST_TAG]);
        Response::from_websocket(pair.client)
    }

    fn open_phone_socket(&self, req: &Request, host: &WebSocket) -> Result<Response> {
        let ch = self.new_channel();
        let pair = WebSocketPair::new()?;
        self.state.accept_websocket_with_tags(&pair.server, &[&channel_tag(ch)]);
        let head = WsOpenHead {
            path: path_and_query(req)?,
            headers: request_headers(req),
            ip: phone_ip(req),
        };
        host.send_with_bytes(frame::encode_head(Kind::WsOpen, ch, &head))?;
        Response::from_websocket(pair.client)
    }

    async fn forward_request(&self, mut req: Request, host: &WebSocket) -> Result<Response> {
        let path = req.path();
        let body = if matches!(req.method(), Method::Get | Method::Head) {
            Vec::new()
        } else {
            req.bytes().await?
        };
        if body.len() > REQUEST_MAX_BYTES {
            return Response::error("too large", 413);
        }
        let ch = self.new_channel();
        let (tx, rx) = oneshot::channel();
        self.pending.borrow_mut().insert(
            ch,
            Pending {
                head: None,
                body: Vec::new(),
                done: Some(tx),
            },
        );
        let head = ReqHead {
            method: req.method().to_string(),
            path: path_and_query(&req)?,
            headers: request_headers(&req),
            ip: phone_ip(&req),
        };
        host.send_with_bytes(frame::encode_head(Kind::Req, ch, &head))?;
        for chunk in body.chunks(BODY_CHUNK) {
            host.send_with_bytes(frame::encode(Kind::ReqBody, ch, chunk))?;
        }
        host.send_with_bytes(frame::encode(Kind::ReqEnd, ch, &[]))?;

        let answer = match select(rx, Box::pin(Delay::from(RESPONSE_TIMEOUT))).await {
            Either::Left((Ok(answer), _)) => answer,
            Either::Left((Err(_), _)) => Err("dropped".into()),
            Either::Right(_) => Err("timeout".into()),
        };
        self.pending.borrow_mut().remove(&ch);
        let (head, body) = match answer {
            Ok(a) => a,
            Err(reason) => {
                console_warn!("request on channel {ch} failed: {reason}");
                return Response::error("the game did not answer", 502);
            }
        };

        let headers = Headers::new();
        let mut content_type = String::new();
        let mut encoded = false;
        for (k, v) in &head.headers {
            let k = k.to_ascii_lowercase();
            if !KEEP_RESPONSE_HEADERS.contains(&k.as_str()) {
                continue;
            }
            if k == "content-type" {
                content_type = v.clone();
            }
            if k == "content-encoding" {
                encoded = true;
            }
            headers.append(&k, v)?;
        }
        headers.set("x-content-type-options", "nosniff")?;
        let ok = (200..300).contains(&head.status);
        if ok && !body.is_empty() && !allowed_type(&path, &content_type) {
            console_warn!("refused {content_type} for {path}");
            return Response::error("not a game file", 502);
        }
        // error pages from the game's server are Express defaults nobody needs to read
        let body = if ok || head.status == 304 { body } else { Vec::new() };
        let res = Response::from_bytes(body)?
            .with_status(head.status)
            .with_headers(headers);
        // the computer sends Vite's prebuilt .br/.gz as they are; automatic mode would compress them again
        Ok(if encoded {
            res.with_encode_body(EncodeBody::Manual)
        } else {
            res
        })
    }

    fn socket_closed(&self, ws: WebSocket, code: usize, reason: &str) -> Result<()> {
        let tags = self.state.get_tags(&ws);
        if tags.iter().any(|t| t == HOST_TAG) {
            // a replaced host closes after its successor is in; its phones were dropped back then
            let successor = self
                .state
                .get_websockets_with_tag(HOST_TAG)
                .into_iter()
                .any(|other| other != ws);
            if !successor {
                self.drop_phones("host offline");
            }
            return Ok(());
        }
        if let (Some(ch), Some(host)) = (channel_of(&tags), self.host()) {
            let code = u16::try_from(code)
                .ok()
                .filter(|c| *c != 1005 && *c != 1006)
                .unwrap_or(1000);
            let _ = host.send_with_bytes(frame::encode_close(ch, code, reason));
        }
        Ok(())
    }

    fn host_frame(&self, bytes: &[u8]) {
        let Some(f) = frame::decode(bytes) else {
            console_warn!("bad frame from host, {} bytes", bytes.len());
            return;
        };
        let ch = f.channel;
        match f.kind {
            Kind::Res => {
                let head = serde_json::from_slice::<ResHead>(f.payload).ok();
                if let Some(p) = self.pending.borrow_mut().get_mut(&ch) {
                    p.head = head;
                }
            }
            Kind::ResBody => {
                let mut pending = self.pending.borrow_mut();
                if let Some(p) = pending.get_mut(&ch) {
                    if p.body.len() + f.payload.len() > RESPONSE_MAX_BYTES {
                        if let Some(done) = p.done.take() {
                            let _ = done.send(Err("response too large".into()));
                        }
                    } else {
                        p.body.extend_from_slice(f.payload);
                    }
                }
            }
            Kind::ResEnd => {
                let mut pending = self.pending.borrow_mut();
                if let Some(p) = pending.get_mut(&ch) {
                    if let Some(done) = p.done.take() {
                        let answer = match p.head.take() {
                            Some(head) => Ok((head, std::mem::take(&mut p.body))),
                            None => Err("no response head".into()),
                        };
                        let _ = done.send(answer);
                    }
                }
            }
            Kind::WsMsg => {
                let Some(ws) = self.phone(ch) else { return };
                let sent = match frame::decode_ws(f.payload) {
                    Some(WsData::Text(t)) => ws.send_with_str(t),
                    Some(WsData::Binary(b)) => ws.send_with_bytes(b),
                    None => Ok(()),
                };
                if sent.is_err() {
                    let _ = ws.close(Some(1000), Some("send failed"));
                }
            }
            Kind::WsClose => {
                if let Some(ws) = self.phone(ch) {
                    let (code, reason) = frame::decode_close(f.payload).unwrap_or((1000, String::new()));
                    let _ = ws.close(Some(sendable_close(code)), Some(reason));
                }
            }
            Kind::Reset => {
                if let Some(ws) = self.phone(ch) {
                    let _ = ws.close(Some(1000), Some("reset"));
                }
                if let Some(mut p) = self.pending.borrow_mut().remove(&ch) {
                    if let Some(done) = p.done.take() {
                        let _ = done.send(Err(String::from_utf8_lossy(f.payload).into_owned()));
                    }
                }
            }
            Kind::Req | Kind::ReqBody | Kind::ReqEnd | Kind::WsOpen => {
                console_warn!("host sent a phone-side frame {:?}", f.kind);
            }
        }
    }
}

impl DurableObject for Tunnel {
    fn new(state: State, _env: Env) -> Self {
        if let Ok(pair) = WebSocketRequestResponsePair::new(KEEPALIVE_PING, KEEPALIVE_PONG) {
            state.set_websocket_auto_response(&pair);
        }
        Self {
            state,
            pending: RefCell::new(HashMap::new()),
        }
    }

    async fn fetch(&self, req: Request) -> Result<Response> {
        let path = req.path();
        let upgrade = req
            .headers()
            .get("upgrade")?
            .is_some_and(|u| u.eq_ignore_ascii_case("websocket"));
        if path == "/host" {
            if !upgrade {
                return Response::error("expected a websocket", 426);
            }
            return self.connect_host(req).await;
        }
        let Some(host) = self.host() else {
            return page::offline();
        };
        if path == "/ws" {
            if !upgrade {
                return Response::error("expected a websocket", 426);
            }
            return self.open_phone_socket(&req, &host);
        }
        self.forward_request(req, &host).await
    }

    async fn websocket_message(&self, ws: WebSocket, message: WebSocketIncomingMessage) -> Result<()> {
        let tags = self.state.get_tags(&ws);
        if tags.iter().any(|t| t == HOST_TAG) {
            if let WebSocketIncomingMessage::Binary(bytes) = message {
                self.host_frame(&bytes);
            }
            return Ok(());
        }
        let Some(ch) = channel_of(&tags) else { return Ok(()) };
        let Some(host) = self.host() else {
            let _ = ws.close(Some(CLOSE_HOST_GONE), Some("host offline"));
            return Ok(());
        };
        let data = match &message {
            WebSocketIncomingMessage::String(s) => WsData::Text(s),
            WebSocketIncomingMessage::Binary(b) => WsData::Binary(b),
        };
        host.send_with_bytes(frame::encode_ws(ch, data))
    }

    async fn websocket_close(&self, ws: WebSocket, code: usize, reason: String, _clean: bool) -> Result<()> {
        self.socket_closed(ws, code, &reason)
    }

    async fn websocket_error(&self, ws: WebSocket, _error: Error) -> Result<()> {
        self.socket_closed(ws, 1006, "")
    }

    async fn alarm(&self) -> Result<Response> {
        let storage = self.state.storage();
        let claim = storage.get::<Claim>(CLAIM_KEY).await?;
        let stale =
            claim.is_some_and(|c| Date::now().as_millis().saturating_sub(c.last_seen) >= CLAIM_TTL.as_millis() as u64);
        if stale && self.host().is_none() {
            storage.delete_all().await?;
        } else if self.host().is_some() {
            storage.set_alarm(CLAIM_TTL).await?;
        }
        Response::ok("")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hop_headers_stay_behind() {
        for drop in [
            "cookie",
            "cf-connecting-ip",
            "x-forwarded-for",
            "x-kto-relay",
            "sec-websocket-key",
            "host",
            "upgrade",
        ] {
            assert!(!forwardable(drop), "{drop}");
        }
        for keep in [
            "accept",
            "accept-encoding",
            "user-agent",
            "x-token",
            "content-type",
            "if-none-match",
        ] {
            assert!(forwardable(keep), "{keep}");
        }
    }

    #[test]
    fn content_types_by_path() {
        assert!(allowed_type("/p", "text/html; charset=utf-8"));
        assert!(!allowed_type("/assets/x.js", "text/html"));
        assert!(allowed_type("/assets/x.js", "text/javascript; charset=utf-8"));
        assert!(allowed_type("/assets/x.woff2", "font/woff2"));
        assert!(allowed_type("/assets/x.m4a", "audio/mp4"));
        assert!(allowed_type("/a/1234/abc", "image/svg+xml"));
        assert!(!allowed_type("/a/1234/abc", "text/html"));
        assert!(allowed_type("/api/room/1234/image", "application/json; charset=utf-8"));
        assert!(!allowed_type("/ws", "text/html"));
    }

    #[test]
    fn reserved_close_codes_become_normal() {
        assert_eq!(sendable_close(4000), 4000);
        assert_eq!(sendable_close(1000), 1000);
        assert_eq!(sendable_close(1001), 1000);
        assert_eq!(sendable_close(1006), 1000);
    }
}
