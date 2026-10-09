import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Duplex } from 'node:stream';
import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import type { ClientMsg, RoomView, ServerMsg } from '../shared/protocol.js';
import { startApp, type RunningApp } from '../server/app.js';
import { scaledDurations } from '../server/game/types.js';
import { Kind, decode, decodeClose, decodeWs, encode, encodeClose, encodeHead, encodeWs, type HeaderList, type ResHead } from '../server/tunnel.js';
import { seededRng } from '../server/util.js';

/** Plays the relay's Durable Object: takes the computer's connection and speaks tunnel frames to it. */
class FakeRelay {
  private readonly server: Server;
  private readonly wss = new WebSocketServer({ noServer: true });
  private nextChannel = 1;
  private readonly listeners = new Map<number, (kind: Kind, payload: Buffer) => void>();
  host: WebSocket | null = null;
  hellos: IncomingMessage['headers'][] = [];
  rejectOnce = 0;
  url = '';

  constructor() {
    this.server = createServer((_req, res) => res.writeHead(404).end());
    this.server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
      if (req.url !== '/host') return socket.destroy();
      this.hellos.push(req.headers);
      if (this.rejectOnce) {
        socket.end(`HTTP/1.1 ${this.rejectOnce} Nope\r\nContent-Length: 0\r\n\r\n`);
        this.rejectOnce = 0;
        return;
      }
      this.wss.handleUpgrade(req, socket, head, (ws) => {
        this.host = ws;
        ws.on('message', (data: Buffer, binary) => {
          if (!binary) {
            if (String(data) === 'ping') ws.send('pong');
            return;
          }
          const f = decode(data);
          if (f) this.listeners.get(f.channel)?.(f.kind, Buffer.from(f.payload));
        });
        ws.on('close', () => {
          if (this.host === ws) this.host = null;
        });
      });
    });
  }

  async listen(): Promise<void> {
    await new Promise<void>((resolve) => this.server.listen(0, '127.0.0.1', resolve));
    const addr = this.server.address();
    this.url = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`;
  }

  async close(): Promise<void> {
    for (const ws of this.wss.clients) ws.terminate();
    this.server.closeAllConnections();
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
  }

  async connected(): Promise<WebSocket> {
    for (let i = 0; i < 200 && !this.host; i++) await new Promise((r) => setTimeout(r, 25));
    if (!this.host) throw new Error('the computer never connected');
    return this.host;
  }

  request(method: string, path: string, headers: HeaderList = [], body?: Buffer): Promise<{ head: ResHead; body: Buffer }> {
    const ch = this.nextChannel++;
    return new Promise((resolve, reject) => {
      let head: ResHead | undefined;
      const parts: Buffer[] = [];
      this.listeners.set(ch, (kind, payload) => {
        if (kind === Kind.Res) head = JSON.parse(payload.toString()) as ResHead;
        else if (kind === Kind.ResBody) parts.push(payload);
        else if (kind === Kind.ResEnd) resolve({ head: head!, body: Buffer.concat(parts) });
        else if (kind === Kind.Reset) reject(new Error(payload.toString()));
      });
      this.host!.send(encodeHead(Kind.Req, ch, { method, path, headers, ip: '198.51.100.7' }));
      if (body) this.host!.send(encode(Kind.ReqBody, ch, body));
      this.host!.send(encode(Kind.ReqEnd, ch));
    });
  }

  phone(): FakePhone {
    const ch = this.nextChannel++;
    const phone = new FakePhone(ch, this.host!);
    this.listeners.set(ch, (kind, payload) => phone.frame(kind, payload));
    this.host!.send(encodeHead(Kind.WsOpen, ch, { path: '/ws', headers: [['user-agent', 'test phone']], ip: '198.51.100.7' }));
    return phone;
  }
}

class FakePhone {
  readonly inbox: ServerMsg[] = [];
  closed: { code: number; reason: string } | null = null;

  constructor(
    private readonly channel: number,
    private readonly host: WebSocket,
  ) {}

  frame(kind: Kind, payload: Buffer): void {
    if (kind === Kind.WsMsg) this.inbox.push(JSON.parse(decodeWs(payload)!.data.toString()) as ServerMsg);
    if (kind === Kind.WsClose) this.closed = decodeClose(payload);
  }

  send(msg: ClientMsg): void {
    this.host.send(encodeWs(this.channel, Buffer.from(JSON.stringify(msg)), false));
  }

  close(): void {
    this.host.send(encodeClose(this.channel, 1000, 'bye'));
  }

  async next<T extends ServerMsg['t']>(t: T): Promise<Extract<ServerMsg, { t: T }>> {
    for (let i = 0; i < 200; i++) {
      const found = this.inbox.find((m) => m.t === t);
      if (found) return found as Extract<ServerMsg, { t: T }>;
      await new Promise((r) => setTimeout(r, 25));
    }
    throw new Error(`timeout waiting for ${t}`);
  }
}

class Tv {
  readonly ws: WebSocket;
  view: RoomView | null = null;

  constructor(port: number) {
    this.ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    this.ws.on('message', (data: Buffer) => {
      const msg = JSON.parse(data.toString()) as ServerMsg;
      if (msg.t === 'room') this.view = msg.view as RoomView;
    });
  }

  async open(): Promise<void> {
    await new Promise((resolve) => this.ws.once('open', resolve));
    this.send({ t: 'host.create' });
    await this.until(() => this.view !== null);
  }

  send(msg: ClientMsg): void {
    this.ws.send(JSON.stringify(msg));
  }

  async until(test: () => boolean): Promise<void> {
    for (let i = 0; i < 200 && !test(); i++) await new Promise((r) => setTimeout(r, 25));
    if (!test()) throw new Error('condition never held');
  }
}

let relay: FakeRelay;
let app: RunningApp;
let dir: string;
let tv: Tv;

async function start(): Promise<void> {
  relay = new FakeRelay();
  await relay.listen();
  dir = mkdtempSync(join(tmpdir(), 'kto-relay-'));
  app = await startApp({
    port: 0,
    durations: scaledDurations(0.01),
    rng: seededRng(5),
    botPace: 0.01,
    relay: { url: relay.url, identityFile: join(dir, 'relay.json') },
    collectLogs: () => Promise.resolve('archive'),
  });
  tv = new Tv(app.port);
  await tv.open();
}

afterEach(async () => {
  tv.ws.close();
  await app.close();
  await relay.close();
  rmSync(dir, { recursive: true, force: true });
});

describe('internet relay', () => {
  it('connects only once a room asks for it, and points the QR at it', async () => {
    await start();
    expect(tv.view!.relay).toEqual({ state: 'off' });
    expect(relay.hellos).toHaveLength(0);

    tv.send({ t: 'host.settings', settings: { relay: true } });
    await relay.connected();
    const identity = JSON.parse(readFileSync(join(dir, 'relay.json'), 'utf8')) as { host: string; secret: string };
    expect(relay.hellos[0]!.authorization).toBe(`Bearer ${identity.secret}`);
    expect(relay.hellos[0]!['x-kto-host']).toBe(identity.host);
    await tv.until(() => tv.view!.relay?.state === 'online');
    expect(tv.view!.joinUrl).toBe(`${relay.url}/${identity.host}?c=${tv.view!.code}`);
    expect(tv.view!.lan).toBe(false);

    tv.send({ t: 'host.settings', settings: { relay: false } });
    await tv.until(() => tv.view!.relay?.state === 'off' && relay.host === null);
    expect(tv.view!.joinUrl).toMatch(/^http:\/\/.*\/p\?c=/);
  });

  it('carries phone requests without the rights of this computer', async () => {
    await start();
    tv.send({ t: 'host.settings', settings: { relay: true } });
    await relay.connected();

    const local = (await (await fetch(`http://127.0.0.1:${app.port}/api/info`)).json()) as { logs: boolean };
    expect(local.logs).toBe(true);
    const info = await relay.request('GET', '/api/info');
    expect(info.head.status).toBe(200);
    expect((JSON.parse(info.body.toString()) as { logs: boolean }).logs).toBe(false);
    const logs = await relay.request('POST', '/api/logs', [['content-type', 'application/json']], Buffer.from('{}'));
    expect(logs.head.status).toBe(403);
  });

  it('lets phones join but not run rooms, and never hands a seat over by name alone', async () => {
    await start();
    tv.send({ t: 'host.settings', settings: { relay: true } });
    await relay.connected();
    const code = tv.view!.code;

    const stranger = relay.phone();
    stranger.send({ t: 'host.create' });
    await new Promise((r) => setTimeout(r, 200));
    expect(stranger.inbox.filter((m) => m.t === 'room')).toHaveLength(0);

    const anya = relay.phone();
    anya.send({ t: 'join', code, name: 'Аня', color: 0 });
    await anya.next('welcome');
    await tv.until(() => tv.view!.players.some((p) => p.name === 'Аня' && p.connected));
    anya.close();
    await tv.until(() => tv.view!.players.some((p) => p.name === 'Аня' && !p.connected));

    const impostor = relay.phone();
    impostor.send({ t: 'join', code, name: 'Аня', color: 1 });
    const err = await impostor.next('error');
    expect(err.code).toBe('name_taken');
  });

  it('passes the game closing a phone on to the relay, code and all', async () => {
    await start();
    tv.send({ t: 'host.settings', settings: { relay: true } });
    await relay.connected();
    const first = relay.phone();
    first.send({ t: 'join', code: tv.view!.code, name: 'Боря', color: 2 });
    const welcome = await first.next('welcome');
    const second = relay.phone();
    second.send({ t: 'resume', code: tv.view!.code, token: welcome.token });
    await second.next('welcome');
    for (let i = 0; i < 100 && !first.closed; i++) await new Promise((r) => setTimeout(r, 25));
    expect(first.closed?.code).toBe(4000);
  });

  it('comes back on the local network after a restart', async () => {
    relay = new FakeRelay();
    await relay.listen();
    dir = mkdtempSync(join(tmpdir(), 'kto-relay-'));
    const options = { port: 0, stateDir: join(dir, 'rooms'), relay: { url: relay.url, identityFile: join(dir, 'relay.json') } };
    const first = await startApp(options);
    const before = new Tv(first.port);
    await before.open();
    before.send({ t: 'host.settings', settings: { relay: true } });
    await relay.connected();
    const code = before.view!.code;
    before.ws.close();
    await first.close();
    await relay.close();
    relay = new FakeRelay();
    await relay.listen();

    app = await startApp({ ...options, relay: { ...options.relay, url: relay.url } });
    const room = app.rooms.get(code)!;
    expect(room.settings.relay).toBe(false);
    expect(room.view().joinUrl).toMatch(/^http:\/\/.*\/p\?c=/);
    await new Promise((r) => setTimeout(r, 300));
    expect(relay.hellos).toHaveLength(0);
    tv = new Tv(app.port);
    await tv.open();
  });

  it('takes a new host code when the relay says this one is taken', async () => {
    await start();
    const before = JSON.parse(readFileSync(join(dir, 'relay.json'), 'utf8')) as { host: string };
    relay.rejectOnce = 409;
    tv.send({ t: 'host.settings', settings: { relay: true } });
    await relay.connected();
    const after = JSON.parse(readFileSync(join(dir, 'relay.json'), 'utf8')) as { host: string };
    expect(after.host).not.toBe(before.host);
    expect(relay.hellos.at(-1)!['x-kto-host']).toBe(after.host);
    await tv.until(() => tv.view!.joinUrl.includes(`/${after.host}?c=`));
  });
});
