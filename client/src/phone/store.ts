import { computed, reactive, shallowRef, watch } from 'vue';
import type { ClientMsg, InkOp, Personal, PlayerView } from '../../../shared/protocol';
import { LiveInk } from '../common/ink';
import { GameSocket } from '../common/socket';
import { tap } from './haptics';

const params = new URLSearchParams(location.search);
const SESSION_KEY = 'kto-iz-nas:session';

interface Saved {
  code: string;
  token: string;
}

function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(s: Saved | null): void {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // private mode: the session just won't survive a reload
  }
}

const urlCode = params.get('c')?.replace(/\D/g, '').slice(0, 4) ?? '';
const saved = loadSaved();

export const state = reactive({
  code: urlCode || saved?.code || '',
  token: saved && (!urlCode || saved.code === urlCode) ? saved.token : '',
  you: '',
  joining: false,
  pendingJoin: null as { name: string; color: number } | null,
  error: '',
  kicked: false,
});

export const view = shallowRef<PlayerView | null>(null);

/** Live strokes of whoever is drawing on the shared canvas right now. */
export const live = new LiveInk();
let liveArtist = '';

export const socket = new GameSocket((): ClientMsg | null => {
  if (state.token && state.code) return { t: 'resume', code: state.code, token: state.token };
  if (state.pendingJoin) return { t: 'join', code: state.code, ...state.pendingJoin };
  return null;
});

socket.on((msg) => {
  switch (msg.t) {
    case 'welcome':
      state.token = msg.token;
      state.you = msg.you;
      state.code = msg.code;
      state.joining = false;
      state.pendingJoin = null;
      state.error = '';
      state.kicked = false;
      save({ code: msg.code, token: msg.token });
      break;
    case 'me': {
      const prev = view.value?.personal;
      const next = msg.view.personal;
      // the server sends own strokes once per phase; keep that copy for screens mounted later
      if ('strokes' in next && next.strokes === undefined && prev && 'strokes' in prev && view.value?.phaseId === msg.view.phaseId) {
        next.strokes = prev.strokes;
        if (next.kind === 'draw' && prev.kind === 'draw' && next.guide === undefined) next.guide = prev.guide;
      }
      view.value = msg.view;
      break;
    }
    case 'error':
      state.joining = false;
      state.pendingJoin = null;
      if (msg.code === 'bad_token' || (msg.code === 'no_room' && state.token)) {
        state.token = '';
        view.value = null;
        save(null);
        if (msg.code === 'no_room') state.error = 'Игра закончилась — подключитесь к новой';
        return;
      }
      state.error = msg.message;
      break;
    case 'kicked':
      state.kicked = true;
      state.token = '';
      view.value = null;
      save(null);
      socket.close();
      break;
    case 'ink':
      applyLive(msg.player, msg.op);
      break;
    case 'inkFull':
      if (msg.phaseId !== view.value?.phaseId) break;
      liveArtist = msg.player;
      live.replace(msg.strokes);
      break;
    default:
      break;
  }
});

function applyLive(player: string, op: InkOp): void {
  if (liveArtist !== player) {
    liveArtist = player;
    live.reset();
  }
  live.apply(op);
}

watch(
  () => view.value?.phaseId,
  () => {
    liveArtist = '';
    live.reset();
  },
);

export function join(code: string, name: string, color: number): void {
  state.code = code;
  state.token = '';
  state.error = '';
  state.joining = true;
  state.pendingJoin = { name, color };
  socket.rehandshake();
}

export function send(msg: ClientMsg): void {
  socket.send(msg);
}

const PICKS = new Set<Personal['kind']>(['vote', 'predict', 'scale', 'sync', 'closest', 'quipVote', 'truth', 'even', 'percent', 'percentGuess', 'percentBet', 'fibVote', 'replyPick', 'mafia', 'quiz', 'years', 'taleVote', 'junkBid', 'caseClue', 'spy', 'spyGuess', 'clueGuess', 'treasure', 'rps', 'datePick', 'radioVote', 'rushVote', 'waveGuess']);

export function answer(value: string | number | (string | null)[] | number[], buzz = true): void {
  const v = view.value;
  if (!v) return;
  send({ t: 'answer', phaseId: v.phaseId, value });
  if (buzz) tap();
  // show the lock-in screen now rather than after the round trip; the next 'me' replaces this with the server's truth
  const p = v.personal;
  let next: Personal | null = null;
  if (PICKS.has(p.kind) && !Array.isArray(value)) next = { ...p, answer: value } as Personal;
  else if (p.kind === 'never' && typeof value === 'string') {
    const [did, guess] = value.split(':');
    next = { kind: 'never', did: did === '1', guess: Number(guess) };
  } else if (p.kind === 'write' || p.kind === 'radio') next = { ...p, done: true };
  else if (p.kind === 'masqGuess' && Array.isArray(value)) next = { ...p, answer: value as (string | null)[] };
  else if (p.kind === 'market' && Array.isArray(value)) next = { ...p, guess: value as number[] };
  else if (p.kind === 'waveHint') next = { ...p, sent: true };
  else if (p.kind === 'caseSurvey' || p.kind === 'contactWrite' || p.kind === 'contactGuess') next = { ...p, done: true };
  else if (p.kind === 'clover' && Array.isArray(value)) next = { ...p, answer: value as number[] };
  else if (p.kind === 'orderWrite' && typeof value === 'string') next = { ...p, text: value };
  else if (p.kind === 'orderSort' && Array.isArray(value)) next = { ...p, answer: value as string[] };
  if (next) view.value = { ...v, personal: next };
}

export const me = computed(() => view.value?.players.find((p) => p.id === view.value?.you));

export function playerById(id: string | undefined) {
  return view.value?.players.find((p) => p.id === id);
}

export async function uploadImage(blob: Blob, kind: 'selfie' | 'photo', phaseId = 0): Promise<boolean> {
  const res = await fetch(`/api/room/${state.code}/image?kind=${kind}&phase=${phaseId}`, {
    method: 'POST',
    headers: { 'x-token': state.token, 'Content-Type': blob.type || 'image/jpeg' },
    body: blob,
  });
  return res.ok;
}
