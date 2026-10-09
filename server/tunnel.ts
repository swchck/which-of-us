/**
 * Frames of the tunnel between this computer and the internet relay: a type byte, a big-endian
 * channel number and a payload. Channels multiplex the phones' HTTP requests and WebSockets over
 * the one connection the computer keeps open. The relay has the same codec in
 * `relay/src/frame.rs`; both are checked against `tests/tunnel-vectors.json`.
 */

export const Kind = {
  Req: 1,
  ReqBody: 2,
  ReqEnd: 3,
  Res: 4,
  ResBody: 5,
  ResEnd: 6,
  WsOpen: 7,
  WsMsg: 8,
  WsClose: 9,
  Reset: 10,
} as const;
export type Kind = (typeof Kind)[keyof typeof Kind];

const HEADER_LEN = 5;
const KINDS = new Set<number>(Object.values(Kind));

export type HeaderList = [string, string][];

export interface ReqHead {
  method: string;
  path: string;
  headers: HeaderList;
  ip: string;
}

export interface ResHead {
  status: number;
  headers: HeaderList;
}

export interface WsOpenHead {
  path: string;
  headers: HeaderList;
  ip: string;
}

export interface Frame {
  kind: Kind;
  channel: number;
  payload: Buffer;
}

export function encode(kind: Kind, channel: number, payload: Buffer | string = Buffer.alloc(0)): Buffer {
  const body = typeof payload === 'string' ? Buffer.from(payload) : payload;
  const out = Buffer.allocUnsafe(HEADER_LEN + body.length);
  out[0] = kind;
  out.writeUInt32BE(channel, 1);
  body.copy(out, HEADER_LEN);
  return out;
}

export function encodeHead(kind: typeof Kind.Req | typeof Kind.Res | typeof Kind.WsOpen, channel: number, head: ReqHead | ResHead | WsOpenHead): Buffer {
  return encode(kind, channel, JSON.stringify(head));
}

/** Returns null for a truncated frame or an unknown type. */
export function decode(buf: Buffer): Frame | null {
  if (buf.length < HEADER_LEN || !KINDS.has(buf[0]!)) return null;
  return { kind: buf[0] as Kind, channel: buf.readUInt32BE(1), payload: buf.subarray(HEADER_LEN) };
}

export function encodeWs(channel: number, data: Buffer, binary: boolean): Buffer {
  return encode(Kind.WsMsg, channel, Buffer.concat([Buffer.from([binary ? 1 : 0]), data]));
}

export function decodeWs(payload: Buffer): { data: Buffer; binary: boolean } | null {
  const tag = payload[0];
  if (tag !== 0 && tag !== 1) return null;
  return { data: payload.subarray(1), binary: tag === 1 };
}

export function encodeClose(channel: number, code: number, reason: string): Buffer {
  const head = Buffer.allocUnsafe(2);
  head.writeUInt16BE(code, 0);
  return encode(Kind.WsClose, channel, Buffer.concat([head, Buffer.from(reason)]));
}

export function decodeClose(payload: Buffer): { code: number; reason: string } | null {
  if (payload.length < 2) return null;
  return { code: payload.readUInt16BE(0), reason: payload.subarray(2).toString() };
}
