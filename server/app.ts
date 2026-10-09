import express from 'express';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { createServer as createHttpsServer, type Server as HttpsServer } from 'node:https';
import type { Duplex } from 'node:stream';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { WebSocketServer, type WebSocket } from 'ws';
import { TTS_INFO } from '../shared/catalog.js';
import { IMAGE_MAX_BYTES, TTS_ENGINES, type ClientMsg, type TtsEngine } from '../shared/protocol.js';
import { DURATIONS, type Durations } from './game/types.js';
import { FreshnessLog } from './fresh.js';
import { saveReport } from './report.js';
import { logLine } from './log.js';
import { RoomStore } from './persist.js';
import { Relay, RELAY_HEADER } from './relay.js';
import { Room, send } from './room.js';
import type { Tls } from './tls.js';
import type { Tts, TtsAudio } from './tts.js';
import { newId, type Rng } from './util.js';

export interface AppOptions {
  port: number;
  durations?: Durations;
  rng?: Rng;
  botPace?: number;
  /** Mounts page routes; dev wires Vite in here, prod serves dist/. */
  pages?: (app: express.Express, server: Server) => Promise<void>;
  /** Second listener for phones that need a secure context (tilt sensors). */
  https?: { port: number; tls: () => Promise<Tls> };
  /** Where rooms are saved so a restarted server picks them up again; no saving without it. */
  stateDir?: string;
  /** Where the TV's «что-то пошло не так» button saves bug reports; no button without it. */
  reportsDir?: string;
  /**
   * Public address when the game is hosted on the internet behind an HTTPS proxy, e.g.
   * `https://party.example.com`. Phones then join through it instead of the LAN address.
   */
  publicUrl?: string;
  /** Neural narrator voices; the TV falls back to its own speech synthesis without them. */
  tts?: Tts;
  /**
   * Internet relay phones can join through when the host asks for it, and the file keeping this
   * computer's code there; no relay without it, and never on a public server.
   */
  relay?: { url: string; identityFile: string };
  /** Packs the logs into an archive for the developer and resolves to its path; no log collecting without it. */
  collectLogs?: (details: object) => Promise<string>;
}

const ROOM_IDLE_MS = 60 * 60_000;
/** A room nobody ever joined is a closed tab or a script, not a party on a break. */
const UNUSED_ROOM_IDLE_MS = 10 * 60_000;
const HEARTBEAT_MS = 20_000;
/** On a public server room codes are guessable, so cap how many wrong ones one address may try. */
const BAD_CODE_LIMIT = 20;
const BAD_CODE_WINDOW_MS = 60_000;
/** Keeps one public server from being filled up by a script creating rooms. */
const MAX_ROOMS = 500;
/** Rooms are saved at most this often; a crash loses at most this much lobby activity. */
const SAVE_DEBOUNCE_MS = 1000;
const LAN_CACHE_MS = 5_000;
/** The TV sends its log in small batches; anything bigger is not a log. */
const LOG_POST_MAX_BYTES = 64 * 1024;
const LOG_POST_MAX_LINES = 100;
const LOG_LINE_MAX = 2000;
/** A phone sends about 40 messages a second at most (ink, tilt, pings); anything past this is a flood. */
const MSG_PER_SEC = 60;
const MSG_BURST = 120;

/**
 * The TV page in the desktop app shares the computer with the server; a phone has no business with its logs.
 * Phones on the internet relay reach us from 127.0.0.1 too, so they are told apart by the relay's nonce.
 */
function fromThisComputer(req: IncomingMessage, relayNonce: string): boolean {
  return /^(::1|127\.|::ffff:127\.)/.test(req.socket.remoteAddress ?? '') && req.headers[RELAY_HEADER] !== relayNonce;
}

// every room flush builds the join URL, and networkInterfaces() is a syscall that allocates
let lanCache = { at: -Infinity, address: '' };

export function lanAddress(): string {
  const now = Date.now();
  if (now - lanCache.at < LAN_CACHE_MS) return lanCache.address;
  lanCache = { at: now, address: findLanAddress() };
  return lanCache.address;
}

function findLanAddress(): string {
  const candidates: string[] = [];
  for (const [name, list] of Object.entries(networkInterfaces())) {
    for (const info of list ?? []) {
      if (info.family !== 'IPv4' || info.internal) continue;
      // en0/wlan0 is the Wi-Fi the phones are on; docker/vpn bridges come last
      if (/^(en|wl|eth)/.test(name)) candidates.unshift(info.address);
      else candidates.push(info.address);
    }
  }
  return candidates[0] ?? 'localhost';
}

function sniffImage(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

class RoomManager {
  private rooms = new Map<string, Room>();
  private saveTimer: ReturnType<typeof setTimeout> | undefined;
  private closed = false;
  readonly fresh: FreshnessLog;

  constructor(
    private readonly durations: Durations,
    private readonly rng: Rng,
    private readonly botPace: number,
    private readonly joinBase: (secure: boolean) => string,
    private readonly httpsAvailable: () => boolean,
    private readonly store?: RoomStore,
    private readonly online = false,
    stateDir?: string,
    private readonly reportsDir?: string,
    private readonly tts?: Tts,
    private readonly relay?: Relay,
  ) {
    this.fresh = new FreshnessLog(stateDir && join(stateDir, 'seen.json'));
    for (const { snapshot, assets } of store?.load(ROOM_IDLE_MS) ?? []) {
      try {
        this.open(snapshot.code).restore(snapshot, assets);
      } catch (err) {
        console.error(`saved room ${String(snapshot.code)} is damaged, dropping it:`, err);
        this.rooms.get(snapshot.code)?.dispose();
        this.rooms.delete(snapshot.code);
      }
    }
  }

  create(): Room {
    let code: string;
    do code = String(1000 + Math.floor(this.rng() * 9000));
    while (this.rooms.has(code));
    return this.open(code);
  }

  private open(code: string): Room {
    const https = this.httpsAvailable;
    const reports = this.reportsDir;
    const relay = this.relay;
    const room = new Room(code, {
      durations: this.durations,
      rng: this.rng,
      botPace: this.botPace,
      joinUrl: (c, via) => (via.relay && relay ? `${relay.joinBase}?c=${c}` : `${this.joinBase(via.secure && this.httpsAvailable())}/p?c=${c}`),
      // restored rooms open before the HTTPS listener exists, so read it live rather than once
      get httpsAvailable() {
        return https();
      },
      relay: relay ? () => relay.view() : undefined,
      onChange: () => {
        this.scheduleSave();
        this.updateRelay();
      },
      report: reports ? (c, data) => saveReport(reports, c, data) : undefined,
      tts: this.tts,
      online: this.online,
      fresh: this.fresh,
    });
    this.rooms.set(code, room);
    return room;
  }

  private scheduleSave(): void {
    if (!this.store || this.saveTimer || this.closed) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = undefined;
      this.save();
    }, SAVE_DEBOUNCE_MS);
  }

  private save(): void {
    try {
      this.store?.save([...this.rooms.values()].map((room) => ({ snapshot: room.snapshot(), asset: (id) => room.getAsset(id) })));
    } catch (err) {
      console.error('saving rooms failed:', err);
    }
  }

  /** Keeps the relay connected exactly while some room sends its phones through it. */
  updateRelay(): void {
    if (this.closed) return;
    this.relay?.setWanted([...this.rooms.values()].some((r) => r.viaRelay));
  }

  /** The TVs of relayed rooms show the connection state, so they need a fresh view when it moves. */
  relayChanged(): void {
    for (const room of this.rooms.values()) if (room.viaRelay) room.changed();
  }

  get size(): number {
    return this.rooms.size;
  }

  get(code: unknown): Room | undefined {
    return typeof code === 'string' ? this.rooms.get(code.trim()) : undefined;
  }

  sweep(): void {
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      const idle = room.players().length === 0 ? UNUSED_ROOM_IDLE_MS : ROOM_IDLE_MS;
      if (room.empty && now - room.lastActivity > idle) {
        room.dispose();
        this.rooms.delete(code);
        this.scheduleSave();
      }
    }
    this.updateRelay();
  }

  disposeAll(): void {
    clearTimeout(this.saveTimer);
    this.saveTimer = undefined;
    // a clean shutdown saves first, so the next start picks up the very latest lobby; closing the
    // sockets below reports changes too, and saving those would write an empty room list
    if (this.store) this.save();
    this.fresh.flush();
    this.closed = true;
    for (const room of this.rooms.values()) room.dispose();
    this.rooms.clear();
  }
}

export interface RunningApp {
  server: Server;
  rooms: RoomManager;
  port: number;
  httpsPort: number | null;
  close(): Promise<void>;
}

export async function startApp(opts: AppOptions): Promise<RunningApp> {
  const app = express();
  app.disable('x-powered-by');
  const server = createServer(app);
  let port = opts.port;
  let secure: HttpsServer | null = null;
  let httpsPort = opts.https?.port ?? 0;
  const relayNonce = newId(18);
  const relay =
    opts.relay && !opts.publicUrl
      ? new Relay({
          url: opts.relay.url.replace(/\/+$/, ''),
          identityFile: opts.relay.identityFile,
          port: () => port,
          nonce: relayNonce,
          onStatus: () => rooms.relayChanged(),
        })
      : undefined;
  const rooms = new RoomManager(
    opts.durations ?? DURATIONS,
    opts.rng ?? Math.random,
    opts.botPace ?? 1,
    (tls) =>
      opts.publicUrl ?? (tls ? `https://${lanAddress()}:${httpsPort}` : `http://${lanAddress()}:${port}`),
    () => secure !== null && !opts.publicUrl,
    opts.stateDir ? new RoomStore(opts.stateDir) : undefined,
    opts.publicUrl !== undefined,
    opts.stateDir,
    // a server on the internet has no TV screen of its own to photograph, and its disk is not the host's
    opts.publicUrl ? undefined : opts.reportsDir,
    opts.publicUrl ? undefined : opts.tts,
    relay,
  );

  app.get('/api/info', (req, res) => {
    res.json({ lan: `http://${lanAddress()}:${port}`, logs: !!opts.collectLogs && !opts.publicUrl && fromThisComputer(req, relayNonce) });
  });

  app.get('/a/:code/:id', (req, res) => {
    const asset = rooms.get(req.params.code)?.getAsset(req.params.id);
    if (!asset) {
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', asset.mime);
    res.setHeader('Cache-Control', 'private, max-age=86400, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // svg assets are generated by the server, but lock them down anyway in case one is opened directly
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    res.end(asset.data);
  });

  app.post(
    '/api/room/:code/image',
    express.raw({ type: () => true, limit: IMAGE_MAX_BYTES }),
    (req, res) => {
      const room = rooms.get(req.params.code);
      const token = req.header('x-token');
      const player = room?.players().find((p) => p.token === token && !p.bot);
      if (!room || !player) {
        res.status(403).json({ error: 'forbidden' });
        return;
      }
      const body = req.body as unknown;
      const mime = Buffer.isBuffer(body) ? sniffImage(body) : null;
      if (!mime || !Buffer.isBuffer(body)) {
        res.status(415).json({ error: 'not an image' });
        return;
      }
      const asset = room.putAsset(mime, body);
      if (req.query.kind === 'photo') {
        const ok = room.photo(player, Number(req.query.phase), asset);
        if (!ok) room.dropAsset(asset);
        res.status(ok ? 200 : 409).json({ asset });
        return;
      }
      room.setSelfie(player, asset);
      res.json({ asset });
    },
  );

  const tts = opts.publicUrl ? undefined : opts.tts;
  app.get('/api/tts', (_req, res) => {
    res.json({ engines: tts?.status() ?? [] });
  });

  app.get('/tts/:engine/:voice', (req, res) => {
    const engine = req.params.engine as TtsEngine;
    const text = typeof req.query.t === 'string' ? req.query.t : '';
    if (!tts || !TTS_ENGINES.includes(engine) || !(Object.hasOwn(TTS_INFO[engine].voices, req.params.voice)) || !text) {
      res.status(404).end();
      return;
    }
    const voice = req.params.voice;
    const send = (audio: TtsAudio) => {
      res.setHeader('Cache-Control', 'private, max-age=86400');
      // send serves start..end of a pack as a file of its own, Range requests from WebKit's player included
      res.type(audio.type).sendFile(audio.file, { start: audio.start, end: audio.end });
    };
    // a line with a name asks first whether the whole sentence is ready; if not, it says the name and
    // the text around it from cache, while the whole sentence renders for next time
    if (req.query.cached === '1') {
      const hit = tts.cached(engine, voice, text);
      if (hit) send(hit);
      else {
        res.status(404).end();
        tts.file(engine, voice, text, { priority: 'idle' }).catch(() => {});
      }
      return;
    }
    // a skipped line closes its requests, and a render nobody waits for anymore should not hold the queue
    const gone = new AbortController();
    res.on('close', () => gone.abort());
    tts.file(engine, voice, text, { signal: gone.signal }).then(send, (err: unknown) => {
      if (gone.signal.aborted) return;
      console.error('tts:', err instanceof Error ? err.message : err);
      if (!res.headersSent) res.status(503).end();
    });
  });

  const collect = opts.publicUrl ? undefined : opts.collectLogs;
  app.post('/api/log', express.json({ limit: LOG_POST_MAX_BYTES }), (req, res) => {
    const lines = (req.body as { lines?: unknown } | undefined)?.lines;
    if (!collect || !fromThisComputer(req, relayNonce) || !Array.isArray(lines)) {
      res.status(403).end();
      return;
    }
    for (const line of lines.slice(0, LOG_POST_MAX_LINES)) if (typeof line === 'string') logLine('tv', line.slice(0, LOG_LINE_MAX));
    res.status(204).end();
  });
  app.post('/api/logs', express.json({ limit: LOG_POST_MAX_BYTES }), (req, res) => {
    if (!collect || !fromThisComputer(req, relayNonce)) {
      res.status(403).end();
      return;
    }
    const details = { tts: tts?.diagnostics() ?? null, tv: req.body as unknown };
    collect(details).then(
      (file) => res.json({ file }),
      (err: unknown) => {
        console.error('collecting logs failed:', err);
        res.status(500).json({ error: 'failed' });
      },
    );
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'not found' });
  });

  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 });
  const upgrade = (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    if (req.url?.split('?')[0] !== '/ws') return;
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  };
  server.on('upgrade', upgrade);

  const alive = new WeakMap<WebSocket, boolean>();
  const badCodes = new Map<string, { count: number; since: number }>();
  const throttled = (ip: string, failed: boolean): boolean => {
    const now = Date.now();
    let entry = badCodes.get(ip);
    if (!entry || now - entry.since > BAD_CODE_WINDOW_MS) {
      entry = { count: 0, since: now };
      badCodes.set(ip, entry);
    }
    if (failed) entry.count++;
    return entry.count > BAD_CODE_LIMIT;
  };

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // behind the public proxy every socket comes from the proxy, so trust its header there only;
    // the proxy appends the real peer last, while earlier entries are whatever the client sent
    const forwarded = opts.publicUrl ? String(req.headers['x-forwarded-for'] ?? '').split(',').at(-1)?.trim() : '';
    // our own relay client sets the header to exactly the phone's address, nothing the phone sent
    const viaRelay = req.headers[RELAY_HEADER] === relayNonce;
    const ip = (viaRelay ? String(req.headers['x-forwarded-for'] ?? '') : forwarded) || req.socket.remoteAddress || '';
    alive.set(ws, true);
    ws.on('pong', () => alive.set(ws, true));
    // ws emits 'error' for oversized or malformed frames and closes the socket itself; unhandled, it kills the process
    ws.on('error', () => undefined);
    let room: Room | undefined;
    let role: 'host' | 'player' | null = null;

    let budget = MSG_BURST;
    let refilled = Date.now();
    ws.on('message', (data) => {
      const now = Date.now();
      budget = Math.min(MSG_BURST, budget + ((now - refilled) * MSG_PER_SEC) / 1000);
      refilled = now;
      if (budget < 1) return;
      budget--;
      try {
        handle(data.toString());
      } catch (err) {
        console.error('message handler failed:', err);
      }
    });

    const handle = (data: string): void => {
      let msg: ClientMsg;
      try {
        msg = JSON.parse(data) as ClientMsg;
      } catch {
        return;
      }
      if (typeof msg !== 'object' || msg === null || typeof msg.t !== 'string') return;

      if (msg.t === 'ping') {
        send(ws, { t: 'pong', at: Number(msg.at) || 0, serverNow: Date.now() });
        return;
      }

      if (role === null) {
        // the relay is a way in for phones; a TV across the internet would be a stranger running rooms on this computer
        if (viaRelay && (msg.t === 'host.create' || msg.t === 'host.resume')) return;
        if (msg.t === 'host.create') {
          // online, a script could otherwise fill every slot; at home one TV makes one room
          if (opts.publicUrl && throttled(ip, true)) {
            send(ws, { t: 'error', code: 'too_many', message: 'Слишком много попыток — подождите минуту' });
            return;
          }
          if (rooms.size >= MAX_ROOMS) {
            send(ws, { t: 'error', code: 'room_full', message: 'Сервер переполнен — попробуйте чуть позже' });
            return;
          }
          room = rooms.create();
          role = 'host';
          room.attachHost(ws);
        } else if (msg.t === 'host.resume') {
          if (throttled(ip, false)) {
            send(ws, { t: 'error', code: 'too_many', message: 'Слишком много попыток — подождите минуту' });
            return;
          }
          const found = rooms.get(msg.code);
          if (!found || found.hostToken !== msg.token) {
            throttled(ip, true);
            send(ws, { t: 'error', code: 'no_room', message: 'Комната не найдена' });
            return;
          }
          room = found;
          role = 'host';
          room.attachHost(ws);
        } else if (msg.t === 'join' || msg.t === 'resume') {
          if (throttled(ip, false)) {
            send(ws, { t: 'error', code: 'too_many', message: 'Слишком много попыток — подождите минуту' });
            return;
          }
          const found = rooms.get(msg.code);
          if (!found) {
            throttled(ip, true);
            send(ws, { t: 'error', code: 'no_room', message: 'Комната не найдена — проверьте код' });
            return;
          }
          const err = msg.t === 'join' ? found.join(ws, msg.name, msg.color, viaRelay) : found.resume(ws, msg.token);
          if (err) {
            send(ws, err);
            return;
          }
          room = found;
          role = 'player';
        }
        return;
      }

      if (!room) return;
      if (role === 'host') {
        if (msg.t.startsWith('host.')) room.handleHost(msg);
        return;
      }
      const player = room.playerOf(ws);
      if (player) room.handlePlayer(player, msg);
      else {
        const spectator = room.spectatorOf(ws);
        if (spectator) room.handleSpectator(spectator, msg);
      }
    };

    ws.on('close', () => {
      if (!room) return;
      if (role === 'host') room.detachHost(ws);
      else room.disconnect(ws);
    });
  });

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!alive.get(ws)) {
        ws.terminate();
        continue;
      }
      alive.set(ws, false);
      ws.ping();
    }
    rooms.sweep();
    const now = Date.now();
    for (const [ip, entry] of badCodes) if (now - entry.since > BAD_CODE_WINDOW_MS) badCodes.delete(ip);
  }, HEARTBEAT_MS);

  if (opts.pages) await opts.pages(app, server);

  await new Promise<void>((resolve) => server.listen(opts.port, '0.0.0.0', resolve));
  const address = server.address();
  if (address && typeof address === 'object') port = address.port;
  // rooms restored with the relay on reconnect it, and only now is there a port to replay phones against
  rooms.updateRelay();

  if (opts.https) {
    // tilt sensors are optional, so a busy port or a cert failure must not stop the game
    try {
      const tls = await opts.https.tls();
      const candidate = createHttpsServer({ key: tls.key, cert: tls.cert }, app);
      candidate.on('upgrade', upgrade);
      await new Promise<void>((resolve, reject) => {
        candidate.once('error', reject);
        candidate.listen(httpsPort, '0.0.0.0', () => resolve());
      });
      secure = candidate;
      const addr = candidate.address();
      if (addr && typeof addr === 'object') httpsPort = addr.port;
    } catch (err) {
      console.warn(`HTTPS для датчиков наклона недоступен: ${(err as Error).message}`);
    }
  }

  return {
    server,
    rooms,
    port,
    httpsPort: secure ? httpsPort : null,
    close: async () => {
      tts?.close();
      relay?.close();
      clearInterval(heartbeat);
      rooms.disposeAll();
      for (const ws of wss.clients) ws.terminate();
      wss.close();
      // close() waits for every open socket, and a TV or phone left on keep-alive would stall it
      if (secure) {
        const s = secure;
        await new Promise<void>((resolve) => {
          s.close(() => resolve());
          s.closeAllConnections();
        });
      }
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      });
    },
  };
}
