import { shallowRef, ref } from 'vue';
import type { ClientMsg, ServerMsg } from '../../../shared/protocol';

/** Close code the server uses when a newer connection takes over the same seat. */
const REPLACED_CODE = 4000;

/** replaced: the same seat opened on another tab or device, which now owns it until `reclaim()`. */
export type Status = 'connecting' | 'open' | 'closed' | 'replaced';

const PING_MS = 15_000;
// two missed pongs: a phone that slept or hopped networks can keep a dead socket OPEN without a close event
const SILENCE_MS = 35_000;
const OUTBOX_MAX = 200;

/** Input that belongs to the game state and must survive a Wi-Fi blip; live strokes and tilt go stale instead. */
function worthQueueing(msg: ClientMsg): boolean {
  if (msg.t === 'ink') return msg.op.k !== 'move';
  return msg.t === 'answer' || msg.t === 'submit' || msg.t === 'guess';
}

/**
 * Self-healing WebSocket: reconnects with backoff, replays the handshake on every
 * reconnect, and keeps an estimate of the server clock for countdowns.
 */
export class GameSocket {
  readonly status = ref<Status>('connecting');
  readonly clockOffset = ref(0);
  readonly lastError = shallowRef<Extract<ServerMsg, { t: 'error' }> | null>(null);

  private ws: WebSocket | null = null;
  private retry = 0;
  private closedByUs = false;
  private pingTimer: ReturnType<typeof setInterval> | undefined;
  private lastHeard = 0;
  private clockSamples: { rtt: number; offset: number }[] = [];
  private outbox: ClientMsg[] = [];
  private handlers = new Set<(msg: ServerMsg) => void>();

  constructor(private handshake: () => ClientMsg | null) {
    this.connect();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible' || this.closedByUs) return;
      if (this.status.value === 'closed') this.connect();
      else if (this.status.value === 'replaced') return;
      else this.checkAlive();
    });
  }

  on(handler: (msg: ServerMsg) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(msg: ClientMsg): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
    else if (worthQueueing(msg) && this.outbox.length < OUTBOX_MAX) this.outbox.push(msg);
  }

  /** Runs the handshake again on the live connection, e.g. after the user enters a room code. */
  rehandshake(): void {
    const hello = this.handshake();
    if (hello) this.send(hello);
  }

  now(): number {
    return Date.now() + this.clockOffset.value;
  }

  close(): void {
    this.closedByUs = true;
    clearInterval(this.pingTimer);
    this.ws?.close();
  }

  private connect(): void {
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) return;
    this.status.value = 'connecting';
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    this.ws = ws;

    ws.onopen = () => {
      this.retry = 0;
      this.status.value = 'open';
      this.lastHeard = Date.now();
      this.rehandshake();
      // the server drops anything stamped with a finished phase, so a stale replay is harmless
      for (const msg of this.outbox.splice(0)) this.send(msg);
      this.ping();
      clearInterval(this.pingTimer);
      this.pingTimer = setInterval(() => {
        this.checkAlive();
        this.ping();
      }, PING_MS);
    };
    ws.onmessage = (ev) => {
      this.lastHeard = Date.now();
      let msg: ServerMsg;
      try {
        msg = JSON.parse(String(ev.data)) as ServerMsg;
      } catch {
        return;
      }
      if (msg.t === 'pong') {
        const rtt = Date.now() - msg.at;
        // a slow pong has a lopsided trip and skews the offset; trust the fastest recent one
        this.clockSamples = [...this.clockSamples.slice(-4), { rtt, offset: msg.serverNow + rtt / 2 - Date.now() }];
        this.clockOffset.value = this.clockSamples.reduce((a, b) => (b.rtt < a.rtt ? b : a)).offset;
        return;
      }
      if (msg.t === 'error') this.lastError.value = msg;
      for (const h of this.handlers) h(msg);
    };
    ws.onclose = (ev) => {
      // reconnecting here would kick the other tab, which would kick this one back, forever
      if (ev.code === REPLACED_CODE) {
        clearInterval(this.pingTimer);
        if (this.ws === ws) this.ws = null;
        this.status.value = 'replaced';
        return;
      }
      this.dropped(ws);
    };
  }

  /** Takes the seat back from whichever tab or device took it over. */
  reclaim(): void {
    if (this.status.value !== 'replaced') return;
    this.retry = 0;
    this.connect();
  }

  private dropped(ws: WebSocket): void {
    clearInterval(this.pingTimer);
    this.status.value = 'closed';
    if (this.ws === ws) this.ws = null;
    if (this.closedByUs) return;
    // jitter keeps a room of phones from reconnecting in lockstep after a server restart
    const delay = Math.min(5000, 400 * 2 ** this.retry++) * (0.75 + Math.random() * 0.5);
    setTimeout(() => this.connect(), delay);
  }

  private checkAlive(): void {
    const ws = this.ws;
    if (ws?.readyState !== WebSocket.OPEN || Date.now() - this.lastHeard < SILENCE_MS) return;
    // a dead link can take minutes to finish the close handshake, so stop waiting for onclose
    ws.onclose = null;
    ws.onmessage = null;
    ws.close();
    this.dropped(ws);
  }

  private ping(): void {
    this.send({ t: 'ping', at: Date.now() });
  }
}
