import { randomBytes, randomInt } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { request, type IncomingHttpHeaders } from 'node:http';
import { dirname } from 'node:path';
import { WebSocket, type RawData } from 'ws';
import type { RelayState, RelayView } from '../shared/protocol.js';
import { Kind, decode, decodeClose, decodeWs, encode, encodeClose, encodeHead, encodeWs, type HeaderList, type ReqHead, type WsOpenHead } from './tunnel.js';

/**
 * Keeps this computer reachable through the internet relay (`relay/`): one outgoing WebSocket
 * carries every phone's requests and sockets, and each of them is replayed against this same
 * server on 127.0.0.1. The game code sees the phones as ordinary clients; it tells them apart
 * from the TV by the `x-kto-relay` header carrying the per-process nonce.
 */

/** Header that marks a request as coming from a phone through the relay. */
export const RELAY_HEADER = 'x-kto-relay';

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LEN = 8;
const BODY_CHUNK = 256 * 1024;
const RESPONSE_MAX_BYTES = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 25_000;
/** Phones ping every 15 s; a channel this quiet is a phone that vanished without a close. */
const PHONE_IDLE_MS = 40_000;
/** Cloudflare drops a WebSocket after ~100 s of silence; the relay answers these without waking up. */
const KEEPALIVE_MS = 30_000;
const RETRY_MIN_MS = 1_000;
const RETRY_MAX_MS = 30_000;
const MAX_CHANNELS = 256;

export interface RelayOptions {
  /** The relay's address, e.g. `https://kto-relay.example.workers.dev`. */
  url: string;
  /** Where this computer's host code and secret are kept between runs. */
  identityFile: string;
  port: () => number;
  nonce: string;
  onStatus: () => void;
}

interface Identity {
  host: string;
  secret: string;
}

interface HttpChannel {
  kind: 'http';
  head: ReqHead;
  body: Buffer[];
}

interface WsChannel {
  kind: 'ws';
  local: WebSocket;
  /** Messages from the phone that arrived before the local socket opened. */
  queue: { data: Buffer; binary: boolean }[];
  idle?: ReturnType<typeof setTimeout>;
}

function newIdentity(): Identity {
  let host = '';
  for (let i = 0; i < CODE_LEN; i++) host += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return { host, secret: randomBytes(32).toString('hex') };
}

function validIdentity(v: unknown): v is Identity {
  const id = v as Identity | null;
  return typeof id?.host === 'string' && id.host.length === CODE_LEN && [...id.host].every((c) => CODE_ALPHABET.includes(c)) && typeof id.secret === 'string' && id.secret.length >= 32;
}

/** Close codes `ws` lets us send; everything else is reserved for the protocol. */
function sendableClose(code: number): number {
  return code === 1000 || (code >= 3000 && code <= 4999) ? code : 1000;
}

function toHeaders(list: HeaderList, ip: string, nonce: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of list) out[k] = k in out ? `${out[k]}, ${v}` : v;
  out[RELAY_HEADER] = nonce;
  out['x-forwarded-for'] = ip;
  return out;
}

function responseHeaders(headers: IncomingHttpHeaders): HeaderList {
  const out: HeaderList = [];
  for (const [k, v] of Object.entries(headers)) {
    if (v === undefined) continue;
    for (const one of Array.isArray(v) ? v : [v]) out.push([k, one]);
  }
  return out;
}

export class Relay {
  private identity: Identity;
  private socket: WebSocket | null = null;
  private wanted = false;
  private state: RelayState = 'off';
  private error: RelayView['error'];
  private retry = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private keepalive: ReturnType<typeof setInterval> | undefined;
  private heardPong = true;
  private readonly channels = new Map<number, HttpChannel | WsChannel>();

  constructor(private readonly opts: RelayOptions) {
    this.identity = this.loadIdentity();
  }

  /** The address phones open for this computer; a room code goes after it as `?c=`. */
  get joinBase(): string {
    return `${this.opts.url}/${this.identity.host}`;
  }

  view(): RelayView {
    return { state: this.state, error: this.error };
  }

  /** Connects while some room wants phones to come through the internet, and lets go otherwise. */
  setWanted(on: boolean): void {
    if (on === this.wanted) return;
    this.wanted = on;
    if (on) this.connect();
    else this.disconnect('off');
  }

  close(): void {
    this.wanted = false;
    this.disconnect('off');
  }

  private loadIdentity(): Identity {
    try {
      const saved: unknown = JSON.parse(readFileSync(this.opts.identityFile, 'utf8'));
      if (validIdentity(saved)) return saved;
    } catch {
      // first run, or a file someone edited by hand: either way a fresh code is the answer
    }
    return this.saveIdentity(newIdentity());
  }

  private saveIdentity(id: Identity): Identity {
    mkdirSync(dirname(this.opts.identityFile), { recursive: true });
    writeFileSync(this.opts.identityFile, JSON.stringify(id), { mode: 0o600 });
    return id;
  }

  private setState(state: RelayState, error?: RelayView['error']): void {
    if (state === this.state && error === this.error) return;
    this.state = state;
    this.error = error;
    console.log(`relay: ${state}${error ? ` (${error})` : ''}`);
    this.opts.onStatus();
  }

  private connect(): void {
    clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
    if (!this.wanted || this.socket) return;
    if (this.state !== 'error') this.setState('connecting');
    const url = `${this.opts.url.replace(/^http/, 'ws')}/host`;
    const ws = new WebSocket(url, {
      headers: { authorization: `Bearer ${this.identity.secret}`, 'x-kto-host': this.identity.host },
      handshakeTimeout: 15_000,
    });
    this.socket = ws;

    ws.on('unexpected-response', (_req, res) => {
      res.resume();
      ws.terminate();
      if (res.statusCode === 409) {
        // someone else holds this code: a copied data folder, or a one-in-a-trillion collision
        console.log('relay: host code taken, picking a new one');
        this.identity = this.saveIdentity(newIdentity());
        this.retry = 0;
        this.opts.onStatus();
      } else {
        this.error = 'rejected';
      }
    });
    ws.on('open', () => {
      this.retry = 0;
      this.heardPong = true;
      this.setState('online');
      this.keepalive = setInterval(() => {
        if (!this.heardPong) {
          ws.terminate();
          return;
        }
        this.heardPong = false;
        ws.send('ping');
      }, KEEPALIVE_MS);
    });
    ws.on('message', (data, binary) => {
      if (!binary) {
        if (String(data) === 'pong') this.heardPong = true;
        return;
      }
      try {
        this.frame(Buffer.isBuffer(data) ? data : Buffer.concat(data as Buffer[]));
      } catch (err) {
        console.error('relay frame failed:', err);
      }
    });
    ws.on('error', (err) => {
      if (this.state !== 'online') console.log(`relay: ${err.message}`);
    });
    ws.on('close', () => {
      if (this.socket !== ws) return;
      this.socket = null;
      clearInterval(this.keepalive);
      this.dropChannels();
      if (!this.wanted) return;
      this.setState('error', this.error === 'rejected' ? 'rejected' : 'unreachable');
      this.error = undefined;
      const delay = Math.min(RETRY_MAX_MS, RETRY_MIN_MS * 2 ** this.retry++);
      this.retryTimer = setTimeout(() => this.connect(), delay * (0.75 + Math.random() * 0.5));
    });
  }

  private disconnect(state: RelayState): void {
    clearTimeout(this.retryTimer);
    clearInterval(this.keepalive);
    this.retryTimer = undefined;
    const ws = this.socket;
    this.socket = null;
    ws?.terminate();
    this.dropChannels();
    this.retry = 0;
    this.setState(state);
  }

  private dropChannels(): void {
    for (const ch of this.channels.values()) {
      if (ch.kind === 'ws') {
        clearTimeout(ch.idle);
        ch.local.terminate();
      }
    }
    this.channels.clear();
  }

  private send(frame: Buffer): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(frame);
  }

  private frame(buf: Buffer): void {
    const f = decode(buf);
    if (!f) return;
    const ch = this.channels.get(f.channel);
    switch (f.kind) {
      case Kind.Req: {
        if (this.channels.size >= MAX_CHANNELS) {
          this.send(encode(Kind.Reset, f.channel, 'busy'));
          return;
        }
        this.channels.set(f.channel, { kind: 'http', head: JSON.parse(f.payload.toString()) as ReqHead, body: [] });
        return;
      }
      case Kind.ReqBody:
        if (ch?.kind === 'http') ch.body.push(Buffer.from(f.payload));
        return;
      case Kind.ReqEnd:
        if (ch?.kind === 'http') this.forward(f.channel, ch);
        return;
      case Kind.WsOpen: {
        if (this.channels.size >= MAX_CHANNELS) {
          this.send(encodeClose(f.channel, 1013, 'busy'));
          return;
        }
        this.openSocket(f.channel, JSON.parse(f.payload.toString()) as WsOpenHead);
        return;
      }
      case Kind.WsMsg: {
        const msg = decodeWs(f.payload);
        if (ch?.kind !== 'ws' || !msg) return;
        this.touch(f.channel, ch);
        const data = Buffer.from(msg.data);
        if (ch.local.readyState === WebSocket.OPEN) ch.local.send(data, { binary: msg.binary });
        else ch.queue.push({ data, binary: msg.binary });
        return;
      }
      case Kind.WsClose: {
        if (ch?.kind !== 'ws') return;
        const close = decodeClose(f.payload);
        this.channels.delete(f.channel);
        clearTimeout(ch.idle);
        ch.local.close(sendableClose(close?.code ?? 1000), close?.reason.slice(0, 120));
        return;
      }
      case Kind.Reset: {
        if (ch?.kind === 'ws') {
          clearTimeout(ch.idle);
          ch.local.terminate();
        }
        this.channels.delete(f.channel);
        return;
      }
      default:
        return;
    }
  }

  private forward(channel: number, ch: HttpChannel): void {
    const { head } = ch;
    const body = Buffer.concat(ch.body);
    const fail = (reason: string) => {
      if (this.channels.delete(channel)) this.send(encode(Kind.Reset, channel, reason));
    };
    const req = request(
      { host: '127.0.0.1', port: this.opts.port(), method: head.method, path: head.path, headers: toHeaders(head.headers, head.ip, this.opts.nonce), timeout: REQUEST_TIMEOUT_MS },
      (res) => {
        const parts: Buffer[] = [];
        let size = 0;
        res.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > RESPONSE_MAX_BYTES) {
            res.destroy();
            fail('response too large');
            return;
          }
          parts.push(chunk);
        });
        res.on('end', () => {
          if (!this.channels.delete(channel)) return;
          const all = Buffer.concat(parts);
          this.send(encodeHead(Kind.Res, channel, { status: res.statusCode ?? 502, headers: responseHeaders(res.headers) }));
          for (let at = 0; at < all.length; at += BODY_CHUNK) this.send(encode(Kind.ResBody, channel, all.subarray(at, at + BODY_CHUNK)));
          this.send(encode(Kind.ResEnd, channel));
        });
        res.on('error', () => fail('local response failed'));
      },
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (err) => fail(err.message));
    req.end(body.length > 0 ? body : undefined);
  }

  private openSocket(channel: number, head: WsOpenHead): void {
    const local = new WebSocket(`ws://127.0.0.1:${this.opts.port()}${head.path}`, { headers: toHeaders(head.headers, head.ip, this.opts.nonce) });
    const ch: WsChannel = { kind: 'ws', local, queue: [] };
    this.channels.set(channel, ch);
    this.touch(channel, ch);
    local.on('open', () => {
      for (const m of ch.queue) local.send(m.data, { binary: m.binary });
      ch.queue = [];
    });
    local.on('message', (data: RawData, binary: boolean) => {
      const buf = Buffer.isBuffer(data) ? data : Array.isArray(data) ? Buffer.concat(data) : Buffer.from(data);
      if (this.channels.get(channel) === ch) this.send(encodeWs(channel, buf, binary));
    });
    local.on('error', () => undefined);
    local.on('close', (code: number, reason: Buffer) => {
      clearTimeout(ch.idle);
      if (this.channels.get(channel) !== ch) return;
      this.channels.delete(channel);
      this.send(encodeClose(channel, sendableClose(code), reason.toString()));
    });
  }

  private touch(channel: number, ch: WsChannel): void {
    clearTimeout(ch.idle);
    ch.idle = setTimeout(() => {
      if (this.channels.get(channel) !== ch) return;
      this.channels.delete(channel);
      ch.local.terminate();
      this.send(encodeClose(channel, 1000, 'idle'));
    }, PHONE_IDLE_MS);
  }
}
