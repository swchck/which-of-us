//! Frames of the tunnel between the relay and the game computer.
//!
//! Every WebSocket message on the host connection is one frame: a type byte, a big-endian
//! channel number and a payload. Channels multiplex the phones' HTTP requests and WebSockets
//! over that one connection. The same codec lives in `server/tunnel.ts`; both are checked
//! against `tests/tunnel-vectors.json`, so a change here needs the same change there.

use serde::{Deserialize, Serialize};

pub const HEADER_LEN: usize = 5;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum Kind {
    Req = 1,
    ReqBody = 2,
    ReqEnd = 3,
    Res = 4,
    ResBody = 5,
    ResEnd = 6,
    WsOpen = 7,
    WsMsg = 8,
    WsClose = 9,
    Reset = 10,
}

impl Kind {
    fn from_byte(b: u8) -> Option<Kind> {
        Some(match b {
            1 => Kind::Req,
            2 => Kind::ReqBody,
            3 => Kind::ReqEnd,
            4 => Kind::Res,
            5 => Kind::ResBody,
            6 => Kind::ResEnd,
            7 => Kind::WsOpen,
            8 => Kind::WsMsg,
            9 => Kind::WsClose,
            10 => Kind::Reset,
            _ => return None,
        })
    }
}

/// Frame is one decoded tunnel message.
#[derive(Debug, PartialEq, Eq)]
pub struct Frame<'a> {
    pub kind: Kind,
    pub channel: u32,
    pub payload: &'a [u8],
}

/// ReqHead starts a phone's HTTP request on a fresh channel.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReqHead {
    pub method: String,
    pub path: String,
    pub headers: Vec<(String, String)>,
    pub ip: String,
}

/// ResHead is the game computer's answer to a [`ReqHead`].
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ResHead {
    pub status: u16,
    pub headers: Vec<(String, String)>,
}

/// WsOpenHead announces a phone's WebSocket on a fresh channel.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WsOpenHead {
    pub path: String,
    pub headers: Vec<(String, String)>,
    pub ip: String,
}

/// WsData is the payload of a [`Kind::WsMsg`] frame.
#[derive(Debug, PartialEq, Eq)]
pub enum WsData<'a> {
    Text(&'a str),
    Binary(&'a [u8]),
}

/// Encodes a frame.
pub fn encode(kind: Kind, channel: u32, payload: &[u8]) -> Vec<u8> {
    let mut out = Vec::with_capacity(HEADER_LEN + payload.len());
    out.push(kind as u8);
    out.extend_from_slice(&channel.to_be_bytes());
    out.extend_from_slice(payload);
    out
}

/// Encodes a frame whose payload is a JSON head.
pub fn encode_head<T: Serialize>(kind: Kind, channel: u32, head: &T) -> Vec<u8> {
    let json = serde_json::to_vec(head).expect("heads are plain data");
    encode(kind, channel, &json)
}

/// Decodes a frame, or returns `None` for a truncated one or an unknown type.
pub fn decode(buf: &[u8]) -> Option<Frame<'_>> {
    if buf.len() < HEADER_LEN {
        return None;
    }
    let kind = Kind::from_byte(buf[0])?;
    let channel = u32::from_be_bytes([buf[1], buf[2], buf[3], buf[4]]);
    Some(Frame {
        kind,
        channel,
        payload: &buf[HEADER_LEN..],
    })
}

/// Encodes a [`Kind::WsMsg`] frame.
pub fn encode_ws(channel: u32, data: WsData<'_>) -> Vec<u8> {
    let (tag, bytes) = match data {
        WsData::Text(s) => (0u8, s.as_bytes()),
        WsData::Binary(b) => (1u8, b),
    };
    let mut payload = Vec::with_capacity(1 + bytes.len());
    payload.push(tag);
    payload.extend_from_slice(bytes);
    encode(Kind::WsMsg, channel, &payload)
}

/// Decodes the payload of a [`Kind::WsMsg`] frame.
pub fn decode_ws(payload: &[u8]) -> Option<WsData<'_>> {
    let (&tag, rest) = payload.split_first()?;
    match tag {
        0 => std::str::from_utf8(rest).ok().map(WsData::Text),
        1 => Some(WsData::Binary(rest)),
        _ => None,
    }
}

/// Encodes a [`Kind::WsClose`] frame.
pub fn encode_close(channel: u32, code: u16, reason: &str) -> Vec<u8> {
    let mut payload = Vec::with_capacity(2 + reason.len());
    payload.extend_from_slice(&code.to_be_bytes());
    payload.extend_from_slice(reason.as_bytes());
    encode(Kind::WsClose, channel, &payload)
}

/// Decodes the payload of a [`Kind::WsClose`] frame into a code and a reason.
pub fn decode_close(payload: &[u8]) -> Option<(u16, String)> {
    if payload.len() < 2 {
        return None;
    }
    let code = u16::from_be_bytes([payload[0], payload[1]]);
    Some((code, String::from_utf8_lossy(&payload[2..]).into_owned()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;

    fn hex(s: &str) -> Vec<u8> {
        (0..s.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&s[i..i + 2], 16).unwrap())
            .collect()
    }

    #[test]
    fn matches_shared_vectors() {
        let vectors: Vec<Value> = serde_json::from_str(include_str!("../../tests/tunnel-vectors.json")).unwrap();
        for v in vectors {
            let name = v["name"].as_str().unwrap();
            let bytes = hex(v["frame"].as_str().unwrap());
            let frame = decode(&bytes).unwrap_or_else(|| panic!("{name}: does not decode"));
            assert_eq!(frame.kind as u8 as u64, v["type"].as_u64().unwrap(), "{name}");
            assert_eq!(frame.channel as u64, v["channel"].as_u64().unwrap(), "{name}");
            let ch = frame.channel;
            let encoded = match frame.kind {
                Kind::Req => {
                    let head: ReqHead = serde_json::from_value(v["head"].clone()).unwrap();
                    assert_eq!(
                        serde_json::from_slice::<ReqHead>(frame.payload).unwrap(),
                        head,
                        "{name}"
                    );
                    encode_head(Kind::Req, ch, &head)
                }
                Kind::Res => {
                    let head: ResHead = serde_json::from_value(v["head"].clone()).unwrap();
                    assert_eq!(
                        serde_json::from_slice::<ResHead>(frame.payload).unwrap(),
                        head,
                        "{name}"
                    );
                    encode_head(Kind::Res, ch, &head)
                }
                Kind::WsOpen => {
                    let head: WsOpenHead = serde_json::from_value(v["head"].clone()).unwrap();
                    assert_eq!(
                        serde_json::from_slice::<WsOpenHead>(frame.payload).unwrap(),
                        head,
                        "{name}"
                    );
                    encode_head(Kind::WsOpen, ch, &head)
                }
                Kind::WsMsg => {
                    let data = decode_ws(frame.payload).unwrap();
                    match (&data, v.get("text")) {
                        (WsData::Text(t), Some(want)) => assert_eq!(*t, want.as_str().unwrap(), "{name}"),
                        (WsData::Binary(b), None) => {
                            assert_eq!(b.to_vec(), hex(v["bytes"].as_str().unwrap()), "{name}")
                        }
                        _ => panic!("{name}: wrong message kind"),
                    }
                    encode_ws(ch, data)
                }
                Kind::WsClose => {
                    let (code, reason) = decode_close(frame.payload).unwrap();
                    assert_eq!(code as u64, v["code"].as_u64().unwrap(), "{name}");
                    assert_eq!(reason, v["reason"].as_str().unwrap(), "{name}");
                    encode_close(ch, code, &reason)
                }
                Kind::Reset => {
                    assert_eq!(
                        std::str::from_utf8(frame.payload).unwrap(),
                        v["reason"].as_str().unwrap(),
                        "{name}"
                    );
                    encode(Kind::Reset, ch, frame.payload)
                }
                Kind::ReqBody | Kind::ResBody => {
                    assert_eq!(frame.payload.to_vec(), hex(v["bytes"].as_str().unwrap()), "{name}");
                    encode(frame.kind, ch, frame.payload)
                }
                Kind::ReqEnd | Kind::ResEnd => {
                    assert!(frame.payload.is_empty(), "{name}");
                    encode(frame.kind, ch, &[])
                }
            };
            assert_eq!(encoded, bytes, "{name}: re-encoding differs");
        }
    }

    #[test]
    fn rejects_short_and_unknown_frames() {
        assert_eq!(decode(&[1, 0, 0, 0]), None);
        assert_eq!(decode(&[99, 0, 0, 0, 1]), None);
        assert_eq!(decode_ws(&[]), None);
        assert_eq!(decode_ws(&[2, 1]), None);
        assert_eq!(decode_close(&[3]), None);
    }
}
