import { computed, ref, shallowRef } from 'vue';
import type { ArenaSnap, ClientMsg, RoomView } from '../../../shared/protocol';
import { audio } from '../common/audio';
import { LiveInk } from '../common/ink';
import { GameSocket } from '../common/socket';
import { collectLogs, keepLog, tvLog, watchErrors } from './log';

const SESSION_KEY = 'kto-iz-nas:host';

interface HostSession {
  code: string;
  token: string;
}

function loadSession(): HostSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as HostSession) : null;
  } catch {
    return null;
  }
}

function saveSession(s: HostSession | null): void {
  try {
    if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // private mode can refuse storage; the TV then just won't survive a reload
  }
}

let session = loadSession();
export const wantRoom = ref(session !== null);

export const view = shallowRef<RoomView | null>(null);
/** The last bug report this TV asked for: saving, saved to a folder, or failed. */
export const report = shallowRef<{ state: 'saving' } | { state: 'saved'; dir: string; screenshot: boolean } | { state: 'failed' } | null>(null);

/** Log collecting, offered only by the desktop app's own server; null until it says yes. */
export const logs = shallowRef<{ state: 'ready' | 'saving' | 'failed' } | { state: 'saved'; file: string } | null>(null);

audio.log = tvLog;
watchErrors();
fetch('/api/info')
  .then((res) => res.json() as Promise<{ logs?: boolean }>)
  .then((info) => {
    keepLog(!!info.logs);
    if (info.logs) logs.value = { state: 'ready' };
  })
  .catch(() => keepLog(false));

export async function saveLogs(): Promise<void> {
  logs.value = { state: 'saving' };
  const file = await collectLogs({
    agent: navigator.userAgent,
    screen: `${innerWidth}×${innerHeight}@${devicePixelRatio}`,
    narrator: audio.voiceChoice.value,
    engines: audio.engines.value,
    room: view.value?.code ?? null,
  });
  logs.value = file ? { state: 'saved', file } : { state: 'failed' };
}

export const socket = new GameSocket((): ClientMsg | null => {
  if (session) return { t: 'host.resume', code: session.code, token: session.token };
  if (wantRoom.value) return { t: 'host.create' };
  return null;
});

const arenaListeners = new Set<(snap: ArenaSnap) => void>();

export function onArena(fn: (snap: ArenaSnap) => void): () => void {
  arenaListeners.add(fn);
  return () => arenaListeners.delete(fn);
}

// plain Map on purpose: each LiveInk carries its own version, so a stroke repaints one canvas, not the screen
const live = new Map<string, LiveInk>();

/** Returns the stroke buffer fed by one phone, created on first use. */
export function liveInk(player: string): LiveInk {
  let ink = live.get(player);
  if (!ink) {
    ink = new LiveInk();
    live.set(player, ink);
  }
  return ink;
}

socket.on((msg) => {
  switch (msg.t) {
    case 'host.reported':
      report.value = msg.dir ? { state: 'saved', dir: msg.dir, screenshot: msg.screenshot } : { state: 'failed' };
      break;
    case 'host.welcome':
      session = { code: msg.code, token: msg.token };
      saveSession(session);
      tellVoice();
      break;
    case 'room': {
      const prev = view.value;
      if (!prev || prev.phaseId !== msg.view.phaseId) for (const ink of live.values()) ink.reset();
      view.value = msg.view;
      break;
    }
    case 'ink':
      liveInk(msg.player).apply(msg.op);
      break;
    case 'inkFull':
      if (msg.phaseId === view.value?.phaseId) liveInk(msg.player).replace(msg.strokes);
      break;
    case 'tap': {
      const v = view.value;
      if ((v?.phase.kind === 'tap' || v?.phase.kind === 'tug') && msg.phaseId === v.phaseId) view.value = { ...v, phase: { ...v.phase, counts: msg.counts } };
      else if (v?.phase.kind === 'shaker' && msg.phaseId === v.phaseId) view.value = { ...v, phase: { ...v.phase, sizes: msg.counts } };
      else if (v?.phase.kind === 'ninja' && msg.phaseId === v.phaseId) view.value = { ...v, phase: { ...v.phase, scores: msg.counts } };
      break;
    }
    case 'arena':
      if (msg.phaseId === view.value?.phaseId) for (const fn of arenaListeners) fn(msg.snap);
      break;
    case 'error':
      if (msg.code === 'no_room') {
        session = null;
        saveSession(null);
        view.value = null;
        socket.rehandshake();
      }
      break;
    default:
      break;
  }
});

export function createRoom(): void {
  wantRoom.value = true;
  socket.rehandshake();
}

export function sendReport(): void {
  report.value = { state: 'saving' };
  send({ t: 'host.report', client: { agent: navigator.userAgent, width: innerWidth, height: innerHeight, dpr: devicePixelRatio } });
}

/** Tells the server which voice narrates, so it renders the lines ahead in that voice. */
export function tellVoice(): void {
  const v = audio.neuralVoice();
  socket.send({ t: 'host.voice', engine: v?.engine ?? null, voice: v?.voice ?? '' });
}

export function send(msg: ClientMsg): void {
  socket.send(msg);
}

export const players = computed(() => view.value?.players ?? []);

export function playerById(id: string | undefined) {
  return view.value?.players.find((p) => p.id === id);
}
