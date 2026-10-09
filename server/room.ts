import type { WebSocket } from 'ws';
import {
  GAMES,
  LOCATIONS,
  CUSTOM_LIMIT,
  CUSTOM_MAX,
  CUSTOM_PER_PLAYER,
  NAME_TOKEN,
  OPTION_MAX,
  PREDICT_OPTIONS_MAX,
  QUESTION_KINDS,
  SCALE_LABEL_MAX,
  MAX_AUDIENCE,
  MAX_PLAYERS,
  JOKERS_START,
  TEAM_GAME_MIN,
  MINIS_MAX,
  MINIS_MIN,
  PLACEMENTS,
  PACES,
  PACKS,
  PLAYER_COLORS,
  QUESTIONS_MAX,
  QUESTIONS_MIN,
  ROUNDS_MAX,
  TIMERS,
  TTS_ENGINES,
  type ArenaSnap,
  type ClientMsg,
  type CustomQuestion,
  type Evening,
  type InkOp,
  type Phase,
  type QuestionDraft,
  type QuestionKind,
  type Personal,
  type PlayerView,
  type PublicPlayer,
  type RoomView,
  type ServerMsg,
  type Settings,
  type TtsEngine,
} from '../shared/protocol.js';
import { speechSentences, speechText, TIMER_INFO, TTS_INFO } from '../shared/catalog.js';
import { holdAwake, releaseAwake } from './awake.js';
import { faceSvg } from './game/art.js';
import { BOT_NAMES, BotDriver } from './game/bots.js';
import { ContentDecks } from './game/content.js';
import { Game } from './game/game.js';
import { estimateMinutes, type Episode } from './game/plan.js';
import { emptyStats, pacedDurations, withTimers, type Durations, type GameHost, type Player } from './game/types.js';
import type { RoomSnapshot } from './persist.js';
import type { Tts, TtsPriority } from './tts.js';
import { cleanName, clip, newId, shuffle, stripControls, type Freshness, type Rng } from './util.js';

export interface Asset {
  mime: string;
  data: Buffer;
}

export interface RoomOptions {
  durations: Durations;
  rng: Rng;
  /** Bot think-time multiplier; tests pass a small number. */
  botPace: number;
  /** Phone URL for the room; `secure` selects the HTTPS listener. */
  joinUrl: (code: string, secure: boolean) => string;
  /** Whether an HTTPS listener is running, so the secure setting can be offered at all. */
  httpsAvailable: boolean;
  /** What came up in earlier rooms and evenings, so a new room starts with the stalest content. */
  fresh?: Freshness;
  /** Phones join over the internet rather than the local network. */
  online?: boolean;
  /** Called after any change worth saving; the room manager batches these into a snapshot. */
  onChange?: () => void;
  /** Neural voices, for rendering upcoming narration while the room plays. */
  tts?: Tts;
  /** Writes a bug report; absent where the server keeps no files. */
  report?: (code: string, data: object) => Promise<{ dir: string; screenshot: boolean }>;
}

/** Longest «Поехали!» waits for the narrator's voice; Vosk loads its model in under a minute even on a busy machine. */
const WARM_MAX_MS = 60_000;

/** Events kept for a bug report: enough to see the last few minutes of play. */
const JOURNAL_MAX = 300;
/** Messages that stream several times a second and would wash everything else out of the journal. */
const NOISY = new Set(['tilt', 'ink', 'ping', 'host.spoken']);

const LOBBY: Phase = { kind: 'lobby' };

/** A phone that came too late or into a full room. It votes along for fun and plays the next round. */
interface Spectator {
  id: string;
  token: string;
  name: string;
  ws: WebSocket | null;
  /** When the phone dropped; a spectator gone longer than SPECTATOR_GRACE_MS gives up their seat. */
  leftAt: number;
}
/** Keeps a room's memory bounded: a long session with 8 players stays well under this. */
const MAX_ASSETS = 600;
const LOBBY_GRACE_MS = 90_000;
/** How long the room waits for a dropped VIP before the crown goes to someone still here. */
const VIP_GRACE_MS = 20_000;
const SPECTATOR_GRACE_MS = 120_000;

/** How long the TV may drop off before the game pauses for it; a Wi-Fi blip should not stop the show. */
const HOST_GONE_MS = 5000;
/** Each report holds a screenshot of several megabytes, so a stuck button must not fill the disk. */
const REPORT_COOLDOWN_MS = 10_000;
const REPORT_CLIENT_MAX = 2000;

/** One TV and its phones. Owns the players, the uploaded assets and the running game. */

export class Room implements GameHost {
  hostToken = newId(12);
  readonly decks: ContentDecks;
  readonly settings: Settings = {
    episodes: 4,
    questions: 5,
    minis: 1,
    placement: 'mixed',
    spotlight: true,
    teams: false,
    selfVote: true,
    missions: true,
    modifiers: true,
    timers: {},
    pace: 'normal',
    narrator: true,
    music: true,
    secure: false,
    games: [...GAMES],
    locations: [...LOCATIONS],
    packs: ['party'],
  };
  private minutes: { key: string; value: number[] } | null = null;
  readonly rng: Rng;

  hostSocket: WebSocket | null = null;
  lastActivity = Date.now();
  private list: Player[] = [];
  private sockets = new Map<string, WebSocket>();
  private crowd = new Map<string, Spectator>();
  private assets = new Map<string, Asset>();
  private faces = new Map<string, string>();
  private lobbyGrace = new Map<string, ReturnType<typeof setTimeout>>();
  private vipTimer: ReturnType<typeof setTimeout> | undefined;
  private gamesPlayed = 0;
  private wins = new Map<string, number>();
  private game: Game | null = null;
  private hostGone: ReturnType<typeof setTimeout> | undefined;
  /** The game was paused because the TV dropped, not by a person, so the TV coming back resumes it. */
  private pausedForHost = false;
  private bots: BotDriver | null = null;
  private flushQueued = false;
  /** Phase whose strokes each phone already got; its own canvas is ahead of the server after that. */
  private strokesSent = new Map<string, number>();
  /** Screens that (re)connected mid-drawing and still need the drawing so far, sent right after their next view. */
  private inkPending = new Set<WebSocket>();

  private journal: { at: string; what: string }[] = [];
  private journaledPhase = -1;
  private voice: { engine: TtsEngine; voice: string } | null = null;
  /** `engine:voice:name` already queued, so a busy room does not queue the same lines on every update. */
  private warmed = new Set<string>();
  private reportedAt = 0;
  /** Sentences with names still to render ahead, the nearest first; see renderAhead. */
  private ahead: string[] = [];
  private aheadBusy = false;
  /** «Поехали!» is waiting for the narrator's voice to load. */
  private warming = false;

  constructor(
    readonly code: string,
    private readonly opts: RoomOptions,
  ) {
    this.rng = opts.rng;
    this.decks = new ContentDecks(opts.rng, opts.fresh);
  }

  players(): Player[] {
    return this.list;
  }

  get fresh(): Freshness | undefined {
    return this.opts.fresh;
  }

  get phase(): Phase {
    return this.game?.phase ?? LOBBY;
  }

  /** What the narrator is saying now. */
  get say(): string | undefined {
    return this.game?.say;
  }

  get inLobby(): boolean {
    return this.game === null;
  }

  putAsset(mime: string, data: Buffer | string): string {
    const id = newId(9);
    this.assets.set(id, { mime, data: typeof data === 'string' ? Buffer.from(data) : data });
    if (this.assets.size > MAX_ASSETS) this.evictOne();
    return id;
  }

  /** Drops the oldest asset that no avatar still points at; selfies are the oldest and must survive. */
  private evictOne(): void {
    const pinned = new Set<string>([...this.faces.values()]);
    for (const p of this.list) if (p.selfie) pinned.add(p.selfie);
    for (const key of this.assets.keys()) {
      if (pinned.has(key)) continue;
      this.assets.delete(key);
      return;
    }
  }

  dropAsset(id: string): void {
    this.assets.delete(id);
  }

  getAsset(id: string): Asset | undefined {
    return this.assets.get(id);
  }

  faceAsset(player: Player): string {
    if (player.selfie) return player.selfie;
    let face = this.faces.get(player.id);
    if (!face) {
      face = this.putAsset('image/svg+xml', faceSvg(player.color, this.rng));
      this.faces.set(player.id, face);
    }
    return face;
  }

  changed(): void {
    this.lastActivity = Date.now();
    this.opts.onChange?.();
    if (this.flushQueued) return;
    this.flushQueued = true;
    setTimeout(() => {
      this.flushQueued = false;
      this.flush();
    }, 15);
  }

  relayInk(player: string, op: InkOp, toPlayers: boolean): void {
    const data = JSON.stringify({ t: 'ink', player, op } satisfies ServerMsg);
    sendRaw(this.hostSocket, data);
    if (!toPlayers) return;
    for (const [id, ws] of this.sockets) if (id !== player) sendRaw(ws, data);
  }

  sendTap(phaseId: number, counts: Record<string, number>): void {
    send(this.hostSocket, { t: 'tap', phaseId, counts });
  }

  sendArena(phaseId: number, snap: ArenaSnap): void {
    send(this.hostSocket, { t: 'arena', phaseId, snap });
  }

  private publicPlayers(): PublicPlayer[] {
    return this.list.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      selfie: p.selfie,
      connected: p.connected,
      score: p.score,
      jokers: p.jokers,
      team: p.team,
      vip: p.vip,
      bot: p.bot,
    }));
  }

  view(): RoomView {
    return {
      code: this.code,
      phaseId: this.game?.phaseId ?? 0,
      phase: this.phase,
      players: this.publicPlayers(),
      say: this.game?.say,
      serverNow: Date.now(),
      joinUrl: this.opts.joinUrl(this.code, this.settings.secure),
      httpsAvailable: this.opts.httpsAvailable,
      minutes: this.estimate(),
      paused: this.game?.paused ?? false,
      warming: this.warming || undefined,
      settings: this.settings,
      location: this.game?.location,
      scene: this.game?.scene,
      audience: [...this.crowd.values()].filter((s) => s.ws).length,
      customCount: this.decks.custom.length,
      lan: !this.opts.online,
    };
  }

  private estimate(): number[] {
    const { games, locations, pace, questions, minis, spotlight } = this.settings;
    const key = JSON.stringify([games, locations, pace, questions, minis, spotlight]);
    if (this.minutes?.key !== key) this.minutes = { key, value: estimateMinutes(this.settings) };
    return this.minutes.value;
  }

  playerView(id: string, base: RoomView): PlayerView {
    const { code, phaseId, phase, players, say, serverNow, paused, location, audience, customCount, settings } = base;
    return {
      code,
      phaseId,
      phase,
      players,
      say,
      serverNow,
      paused,
      location,
      audience,
      customCount,
      settings: { selfVote: settings.selfVote },
      you: id,
      personal: this.personalFor(id, phaseId),
      mission: this.game?.mission(id),
    };
  }

  // a guess round flushes on every try, and resending the artist's whole drawing each time costs tens of KB
  private personalFor(id: string, phaseId: number): Personal {
    const personal = this.game?.personal(id) ?? { kind: 'none' };
    if (!('strokes' in personal)) return personal;
    if (this.strokesSent.get(id) !== phaseId) {
      this.strokesSent.set(id, phaseId);
      return personal;
    }
    // the monster guide is the same strokes all phase long, and a fresh copy repaints the whole pad
    return { ...personal, strokes: undefined, ...('guide' in personal ? { guide: undefined } : {}) };
  }

  /** Notes an event for the next bug report. */
  note(what: string): void {
    this.journal.push({ at: new Date().toISOString(), what });
    if (this.journal.length > JOURNAL_MAX) this.journal.splice(0, this.journal.length - JOURNAL_MAX);
  }

  private async report(client: unknown): Promise<void> {
    const write = this.opts.report;
    const reply = (dir: string | null, screenshot: boolean) => send(this.hostSocket, { t: 'host.reported', dir, screenshot });
    if (!write || Date.now() - this.reportedAt < REPORT_COOLDOWN_MS) return reply(null, false);
    this.reportedAt = Date.now();
    const about = JSON.stringify(client) ?? '';
    try {
      const { dir, screenshot } = await write(this.code, {
        savedAt: new Date().toISOString(),
        client: about.length <= REPORT_CLIENT_MAX ? client : about.slice(0, REPORT_CLIENT_MAX),
        view: this.view(),
        plan: this.plan,
        // tokens are the players' passwords back into the room; a report may get passed around
        players: this.list.map((p) => ({ ...p, token: undefined })),
        journal: this.journal,
      });
      reply(dir, screenshot);
    } catch (err) {
      console.error('bug report failed:', err);
      reply(null, false);
    }
  }

  private flush(): void {
    const { joinUrl, httpsAvailable, minutes, lan, settings, ...common } = this.view();
    if (common.phaseId !== this.journaledPhase) {
      this.journaledPhase = common.phaseId;
      this.note(`phase ${common.phaseId} ${common.phase.kind}${common.say ? `: ${common.say}` : ''}`);
      this.prefetch(this.decks.upcoming().flatMap(speechSentences), 'soon');
      this.renderAhead();
    }
    this.warmNames();
    // the shared view is most of every message: serialize it once and splice each recipient's part in
    const shared = JSON.stringify(common).slice(0, -1);
    const wrap = (t: 'room' | 'me', extra: object) => `{"t":"${t}","view":${shared},${JSON.stringify(extra).slice(1)}}`;
    if (isOpen(this.hostSocket)) {
      sendRaw(this.hostSocket, wrap('room', { joinUrl, httpsAvailable, minutes, lan, settings, custom: this.decks.custom }));
      this.catchUpInk(this.hostSocket, common.phaseId);
    }
    const phoneSettings = { selfVote: settings.selfVote };
    for (const [id, ws] of this.sockets) {
      if (!isOpen(ws)) continue;
      sendRaw(ws, wrap('me', { settings: phoneSettings, you: id, personal: this.personalFor(id, common.phaseId), mission: this.game?.mission(id) }));
      this.catchUpInk(ws, common.phaseId);
    }
    for (const s of this.crowd.values()) {
      if (!isOpen(s.ws)) continue;
      const personal = this.game?.crowdPersonal(s.id) ?? { kind: 'none' };
      sendRaw(s.ws, wrap('me', { settings: phoneSettings, you: s.id, personal, spectator: true }));
    }
  }

  private prefetch(sentences: string[], priority: TtsPriority): void {
    const tts = this.opts.tts;
    const v = this.voice;
    if (!tts || !v || !tts.installed(v.engine)) return;
    for (const s of sentences) tts.file(v.engine, v.voice, s, { priority }).catch(() => {});
  }

  /**
   * Renders whole sentences with players' names ahead of the game, one at a time and below every line
   * someone waits for. Until one is ready the TV says its name between prebuilt pieces; once it is,
   * the TV plays it whole, with the voice's own intonation. Each phase reorders the list to what is near.
   */
  private renderAhead(): void {
    const tts = this.opts.tts;
    const v = this.voice;
    const game = this.game;
    if (!tts || !v || !game || !tts.installed(v.engine)) return;
    const { segments, spotlights } = game.ahead();
    this.ahead = this.decks.namedAhead(segments, spotlights, this.list.map((p) => p.name)).filter((s) => !tts.cached(v.engine, v.voice, s));
    if (this.aheadBusy) return;
    this.aheadBusy = true;
    const next = () => {
      const s = this.ahead.shift();
      if (!s || this.game !== game || this.voice !== v) {
        this.aheadBusy = false;
        return;
      }
      tts.file(v.engine, v.voice, s, { priority: 'idle' }).then(next, next);
    };
    next();
  }

  /** Renders each player's name as soon as they join; the TV says it between prebuilt pieces of text. */
  private warmNames(): void {
    const v = this.voice;
    if (!v || !this.opts.tts) return;
    for (const p of this.list) {
      const key = `${v.engine}:${v.voice}:${p.name}`;
      if (this.warmed.has(key)) continue;
      this.warmed.add(key);
      this.prefetch([speechText(p.name)], 'soon');
    }
  }

  // after the view, never before: a screen resets its live ink when the view says the phase changed
  private catchUpInk(ws: WebSocket, phaseId: number): void {
    if (!this.inkPending.delete(ws)) return;
    const snap = this.game?.inkSnapshot();
    if (snap && snap.strokes.length > 0) send(ws, { t: 'inkFull', phaseId, ...snap });
  }

  attachHost(ws: WebSocket): void {
    this.inkPending.add(ws);
    if (this.hostSocket && this.hostSocket !== ws) this.hostSocket.close(4000, 'replaced');
    this.hostSocket = ws;
    clearTimeout(this.hostGone);
    if (this.pausedForHost) {
      this.pausedForHost = false;
      this.game?.setPaused(false);
    }
    send(ws, { t: 'host.welcome', code: this.code, token: this.hostToken });
    this.changed();
  }

  detachHost(ws: WebSocket): void {
    this.inkPending.delete(ws);
    if (this.hostSocket !== ws) return;
    this.hostSocket = null;
    clearTimeout(this.hostGone);
    // nobody sees questions or reveals while the TV is away, so hold the game rather than play on blind
    this.hostGone = setTimeout(() => {
      const game = this.game;
      if (this.hostSocket || !game || game.finished || game.paused) return;
      this.pausedForHost = true;
      game.setPaused(true);
      this.changed();
    }, HOST_GONE_MS);
  }

  join(ws: WebSocket, rawName: unknown, rawColor: unknown): ServerMsg | null {
    const name = cleanName(rawName);
    if (!name) return error('bad_name', 'Введите имя');
    const lower = name.toLowerCase();
    this.dropGoneSpectators();
    // a phone that lost its token (private tab, cleared storage) takes its own seat back by name: a party
    // trusts names, and the alternative is watching your avatar sit offline for the rest of the game
    // only on a LAN: on the internet a stranger could wait for someone to blip and take their seat and crown
    const seat = this.opts.online ? undefined : this.list.find((p) => !p.bot && !p.connected && p.name.toLowerCase() === lower);
    if (seat) {
      seat.token = newId(12);
      return this.resume(ws, seat.token);
    }
    if ([...this.list, ...this.crowd.values()].some((p) => p.name.toLowerCase() === lower)) {
      return error('name_taken', 'Такое имя уже занято');
    }
    if (!this.inLobby || this.list.length >= MAX_PLAYERS) {
      if (this.crowd.size >= MAX_AUDIENCE) return error('room_full', 'Комната заполнена');
      const spectator: Spectator = { id: newId(), token: newId(12), name, ws, leftAt: 0 };
      this.crowd.set(spectator.id, spectator);
      send(ws, { t: 'welcome', code: this.code, token: spectator.token, you: spectator.id });
      this.changed();
      return null;
    }
    const player: Player = {
      id: newId(),
      token: newId(12),
      name,
      color: this.freeColor(rawColor),
      score: 0,
      vip: !this.list.some((p) => p.vip && !p.bot),
      bot: false,
      connected: true,
      jokers: 0,
      stats: emptyStats(),
    };
    this.list.push(player);
    this.bindSocket(player, ws);
    send(ws, { t: 'welcome', code: this.code, token: player.token, you: player.id });
    this.changed();
    return null;
  }

  resume(ws: WebSocket, token: unknown): ServerMsg | null {
    const spectator = [...this.crowd.values()].find((s) => s.token === token);
    if (spectator) {
      if (spectator.ws && spectator.ws !== ws) spectator.ws.close(4000, 'replaced');
      spectator.ws = ws;
      send(ws, { t: 'welcome', code: this.code, token: spectator.token, you: spectator.id });
      this.changed();
      return null;
    }
    const player = this.list.find((p) => p.token === token && !p.bot);
    if (!player) return error('bad_token', 'Сессия устарела');
    this.bindSocket(player, ws);
    this.inkPending.add(ws);
    player.connected = true;
    clearTimeout(this.lobbyGrace.get(player.id));
    this.lobbyGrace.delete(player.id);
    send(ws, { t: 'welcome', code: this.code, token: player.token, you: player.id });
    this.game?.rosterChanged();
    this.changed();
    return null;
  }

  private bindSocket(player: Player, ws: WebSocket): void {
    const old = this.sockets.get(player.id);
    if (old && old !== ws) old.close(4000, 'replaced');
    this.sockets.set(player.id, ws);
    this.strokesSent.delete(player.id);
  }

  playerOf(ws: WebSocket): Player | undefined {
    for (const [id, socket] of this.sockets) if (socket === ws) return this.list.find((p) => p.id === id);
    return undefined;
  }

  spectatorOf(ws: WebSocket): Spectator | undefined {
    for (const s of this.crowd.values()) if (s.ws === ws) return s;
    return undefined;
  }

  // a dropped phone that lost its token would otherwise hold its name and a seat until the next lobby
  private dropGoneSpectators(): void {
    const now = Date.now();
    for (const [id, s] of this.crowd) if (!s.ws && now - s.leftAt > SPECTATOR_GRACE_MS) this.crowd.delete(id);
  }

  handleSpectator(spectator: Spectator, msg: ClientMsg): void {
    if (msg.t === 'answer') this.game?.crowdAnswer(spectator.id, msg.phaseId, msg.value);
    else if (msg.t === 'leave') {
      this.crowd.delete(spectator.id);
      spectator.ws?.close(4001, 'left');
      this.changed();
    }
  }

  disconnect(ws: WebSocket): void {
    this.inkPending.delete(ws);
    const spectator = this.spectatorOf(ws);
    if (spectator) {
      spectator.ws = null;
      spectator.leftAt = Date.now();
      this.changed();
      return;
    }
    const player = this.playerOf(ws);
    if (!player) return;
    this.sockets.delete(player.id);
    player.connected = false;
    if (player.vip) {
      clearTimeout(this.vipTimer);
      this.vipTimer = setTimeout(() => this.passCrown(player), VIP_GRACE_MS);
    }
    // taking a selfie backgrounds the tab and drops the socket, so give phones time to return
    if (this.inLobby) this.startLobbyGrace(player);
    this.game?.rosterChanged();
    this.changed();
  }

  private startLobbyGrace(player: Player): void {
    clearTimeout(this.lobbyGrace.get(player.id));
    const timer = setTimeout(() => {
      this.lobbyGrace.delete(player.id);
      if (player.connected || !this.inLobby) return;
      this.remove(player.id);
      this.changed();
    }, LOBBY_GRACE_MS);
    this.lobbyGrace.set(player.id, timer);
  }

  /** Hands the VIP role to the longest-standing connected person, if the VIP is still away. */
  private passCrown(from: Player): void {
    if (from.connected || !from.vip) return;
    const next = this.list.find((p) => !p.bot && p.connected);
    if (!next) return;
    from.vip = false;
    next.vip = true;
    this.changed();
  }

  /** Player gone for good: only possible in the lobby, mid-game they just stay offline. */
  private remove(id: string): void {
    const index = this.list.findIndex((p) => p.id === id);
    if (index < 0) return;
    const [removed] = this.list.splice(index, 1);
    this.faces.delete(id);
    clearTimeout(this.lobbyGrace.get(id));
    this.lobbyGrace.delete(id);
    const ws = this.sockets.get(id);
    this.sockets.delete(id);
    if (ws) {
      send(ws, { t: 'kicked' });
      ws.close(4001, 'kicked');
    }
    if (removed?.vip) {
      const next = this.list.find((p) => !p.bot);
      if (next) next.vip = true;
    }
    if (this.inLobby) this.seatAudience();
  }

  private freeColor(raw: unknown): number {
    const taken = new Set(this.list.map((p) => p.color));
    if (typeof raw === 'number' && Number.isInteger(raw) && raw >= 0 && raw < PLAYER_COLORS.length && !taken.has(raw)) {
      return raw;
    }
    for (let i = 0; i < PLAYER_COLORS.length; i++) if (!taken.has(i)) return i;
    return 0;
  }

  setSelfie(player: Player, asset: string): void {
    // mid-game the old selfie may still be a drawing's model on screen, so only the lobby frees it
    if (this.inLobby && player.selfie) this.dropAsset(player.selfie);
    player.selfie = asset;
    this.faces.delete(player.id);
    this.changed();
  }

  photo(player: Player, phaseId: number, asset: string): boolean {
    return this.game?.photoUploaded(player.id, phaseId, asset) ?? false;
  }

  addBot(): void {
    if (!this.inLobby || this.list.length >= MAX_PLAYERS) return;
    const used = new Set(this.list.map((p) => p.name));
    const name = BOT_NAMES.find((n) => !used.has(n)) ?? `Бот ${this.list.length + 1}`;
    const color = this.freeColor(-1);
    this.list.push({
      id: newId(),
      token: newId(12),
      name,
      color,
      selfie: this.putAsset('image/svg+xml', faceSvg(color, this.rng)),
      score: 0,
      vip: false,
      bot: true,
      connected: true,
      jokers: 0,
      stats: emptyStats(),
    });
    this.changed();
  }

  recordGame(winners: string[]): Evening {
    this.gamesPlayed++;
    for (const id of winners) this.wins.set(id, (this.wins.get(id) ?? 0) + 1);
    const present = new Set(this.list.map((p) => p.id));
    return {
      games: this.gamesPlayed,
      wins: [...this.wins]
        .filter(([id]) => present.has(id))
        .map(([player, count]) => ({ player, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  snapshot(): RoomSnapshot {
    const selfies = this.list.flatMap((p) => (p.selfie ? [p.selfie] : []));
    return {
      code: this.code,
      hostToken: this.hostToken,
      savedAt: this.lastActivity,
      settings: this.settings,
      players: this.list.map(({ id, token, name, color, selfie, vip, bot }) => ({ id, token, name, color, selfie, vip, bot })),
      custom: this.decks.custom,
      gamesPlayed: this.gamesPlayed,
      wins: [...this.wins],
      assets: selfies.flatMap((id) => {
        const asset = this.assets.get(id);
        return asset ? [{ id, mime: asset.mime }] : [];
      }),
    };
  }

  /**
   * Brings a saved room back in the lobby. Everyone starts offline: phones and the TV resume on
   * their own as they reconnect, and anyone who does not return drops out after the lobby grace.
   */
  restore(snapshot: RoomSnapshot, assets: Map<string, Asset>): void {
    this.hostToken = snapshot.hostToken;
    Object.assign(this.settings, snapshot.settings);
    // rooms saved before the 5..15 questions and 1..3 mini-games rule could hold shorter rounds
    this.settings.questions = Math.min(QUESTIONS_MAX, Math.max(QUESTIONS_MIN, this.settings.questions));
    this.settings.minis = Math.min(MINIS_MAX, Math.max(MINIS_MIN, this.settings.minis));
    this.decks.setPacks(this.settings.packs);
    // rooms saved before typed questions only held «Кто из нас?» ones
    this.decks.custom = snapshot.custom.map((q) => ({ ...q, kind: q.kind ?? 'vote' }));
    this.gamesPlayed = snapshot.gamesPlayed;
    this.wins = new Map(snapshot.wins);
    for (const [id, asset] of assets) this.assets.set(id, asset);
    this.list = snapshot.players.map((p) => ({
      ...p,
      selfie: p.selfie && this.assets.has(p.selfie) ? p.selfie : undefined,
      score: 0,
      connected: p.bot,
      jokers: 0,
      stats: emptyStats(),
    }));
    for (const p of this.list) if (!p.bot) this.startLobbyGrace(p);
  }

  /** Running order of the current game, if one is on. */
  get plan(): readonly Episode[] | undefined {
    return this.game?.plan;
  }

  canStart(): boolean {
    return this.inLobby && !this.warming && this.list.filter((p) => p.connected).length >= 2;
  }

  /**
   * Starts the game, first waiting for the narrator's engine and every player's name when they are
   * not ready yet: the opening lines name players, and a voice that is still loading would hand them
   * to the system one. A stuck engine gets WARM_MAX_MS, then the game starts anyway.
   */
  start(): void {
    if (!this.canStart()) return;
    const ready = this.voiceReady();
    if (!ready) {
      this.begin();
      return;
    }
    this.warming = true;
    this.flush();
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const late = new Promise<'late'>((res) => (timer = setTimeout(() => res('late'), WARM_MAX_MS)));
    void Promise.race([ready.then(() => 'ready' as const, (err: unknown) => (console.error('narrator voice failed to load:', err), 'failed' as const)), late]).then((how) => {
      clearTimeout(timer);
      this.warming = false;
      this.note(`voice ${how} after ${Date.now() - started} ms`);
      if (how !== 'ready') console.error(`narrator voice ${how} after ${Date.now() - started} ms, starting anyway`);
      if (this.canStart()) this.begin();
      else this.flush();
    });
  }

  /** Resolves once the narrator's engine is up and every name is rendered; undefined when nothing needs it. */
  private voiceReady(): Promise<unknown> | undefined {
    const tts = this.opts.tts;
    const v = this.voice;
    if (!tts || !v || !tts.installed(v.engine)) return undefined;
    if (this.list.every((p) => tts.cached(v.engine, v.voice, speechText(p.name)))) return undefined;
    return Promise.all([tts.warm(v.engine), ...this.list.map((p) => tts.file(v.engine, v.voice, speechText(p.name)))]);
  }

  private begin(): void {
    for (const p of this.list) p.jokers = JOKERS_START;
    this.seatTeams();
    const game = new Game(this, withTimers(pacedDurations(this.opts.durations, this.settings.pace), this.settings.timers));
    this.game = game;
    // phase ids start over with each game, so a record from the last one would skip a reconnecting phone's strokes
    this.strokesSent.clear();
    this.bots = new BotDriver(this, game, this.opts.botPace);
    game
      .run()
      .catch((err: unknown) => {
        console.error('game script failed, back to the lobby:', err);
        this.note(`game script failed: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
        if (this.game === game) this.stopGame();
      })
      .finally(() => {
        releaseAwake(game);
        this.changed();
      });
    holdAwake(game);
    this.changed();
  }

  /**
   * Two people always play together on one shared score, as in a game for a couple; four or more
   * split into two teams when the host asks, people spread evenly so bots never make up a whole team.
   */
  private seatTeams(): void {
    const seated = this.list.filter((p) => p.connected);
    for (const p of this.list) p.team = undefined;
    if (seated.length === 2 && seated.every((p) => !p.bot)) {
      for (const p of seated) p.team = 0;
      return;
    }
    if (!this.settings.teams || seated.length < TEAM_GAME_MIN) return;
    const order = [...shuffle(seated.filter((p) => !p.bot), this.rng), ...shuffle(seated.filter((p) => p.bot), this.rng)];
    order.forEach((p, i) => (p.team = i % 2));
  }

  /** Back to the lobby with the same people; offline players and scores are dropped, the audience steps in. */
  again(): void {
    this.stopGame();
    for (const p of this.list.filter((p) => !p.connected)) this.remove(p.id);
    for (const p of this.list) {
      p.score = 0;
      p.team = undefined;
      p.stats = emptyStats();
    }
    this.seatAudience();
    this.changed();
  }

  /** Turns audience phones into players while seats last; the same id and token keep their session. */
  private seatAudience(): void {
    for (const s of [...this.crowd.values()]) {
      if (!s.ws) {
        this.crowd.delete(s.id);
        continue;
      }
      if (this.list.length >= MAX_PLAYERS) break;
      this.crowd.delete(s.id);
      this.list.push({
        id: s.id,
        token: s.token,
        name: s.name,
        color: this.freeColor(-1),
        score: 0,
        vip: !this.list.some((p) => p.vip && !p.bot),
        bot: false,
        connected: true,
        jokers: 0,
      stats: emptyStats(),
      });
      this.sockets.set(s.id, s.ws);
    }
  }

  stopGame(): void {
    if (this.game) releaseAwake(this.game);
    this.game?.stop();
    this.bots?.stop();
    this.game = null;
    this.bots = null;
  }

  handleHost(msg: ClientMsg): void {
    if (!NOISY.has(msg.t)) this.note(`tv: ${msg.t}`);
    switch (msg.t) {
      case 'host.report':
        void this.report(msg.client);
        break;
      case 'host.voice': {
        const engine = msg.engine;
        this.voice = engine && TTS_ENGINES.includes(engine) && typeof msg.voice === 'string' && Object.hasOwn(TTS_INFO[engine].voices, msg.voice) ? { engine, voice: msg.voice } : null;
        // the TV opening is the earliest sign of a party: the model loads while people join
        if (this.voice) this.opts.tts?.warm(this.voice.engine).catch((err: unknown) => console.error('narrator voice failed to load:', err));
        this.warmNames();
        break;
      }
      case 'host.start':
        this.start();
        break;
      case 'host.skip':
        this.game?.skip();
        break;
      case 'host.spoken':
        this.game?.spoken(Number(msg.phaseId), msg.voiced === true);
        break;
      case 'host.pause':
        this.pausedForHost = false;
        this.game?.setPaused(Boolean(msg.paused));
        break;
      case 'host.addBot':
        this.addBot();
        break;
      case 'host.kick':
        if (this.inLobby) this.remove(String(msg.player));
        this.changed();
        break;
      case 'host.settings':
        this.applySettings(msg.settings);
        break;
      case 'host.question':
        this.addQuestion(msg);
        break;
      case 'host.dropQuestion':
        this.decks.custom = this.decks.custom.filter((q) => q.id !== msg.id);
        this.changed();
        break;
      case 'host.vip': {
        const next = this.list.find((p) => p.id === msg.player && !p.bot);
        if (!next) break;
        for (const p of this.list) p.vip = p === next;
        this.changed();
        break;
      }
      case 'host.again':
        this.again();
        if (msg.start === true) this.start();
        break;
      default:
        break;
    }
  }

  private applySettings(raw: unknown): void {
    if (typeof raw !== 'object' || raw === null) return;
    const s = raw as Partial<Settings>;
    if (this.inLobby) {
      const count = (v: unknown, min: number, max: number) => (Number.isInteger(v) && (v as number) >= min && (v as number) <= max ? (v as number) : undefined);
      this.settings.episodes = count(s.episodes, 1, ROUNDS_MAX) ?? this.settings.episodes;
      this.settings.questions = count(s.questions, QUESTIONS_MIN, QUESTIONS_MAX) ?? this.settings.questions;
      this.settings.minis = count(s.minis, MINIS_MIN, MINIS_MAX) ?? this.settings.minis;
      if (PLACEMENTS.includes(s.placement as never)) this.settings.placement = s.placement!;
      if (typeof s.spotlight === 'boolean') this.settings.spotlight = s.spotlight;
      if (typeof s.selfVote === 'boolean') this.settings.selfVote = s.selfVote;
      if (typeof s.missions === 'boolean') this.settings.missions = s.missions;
      if (typeof s.modifiers === 'boolean') this.settings.modifiers = s.modifiers;
      if (typeof s.teams === 'boolean') this.settings.teams = s.teams;
      if (typeof s.timers === 'object' && s.timers !== null) this.settings.timers = cleanTimers(s.timers);
    }
    if (this.inLobby && PACES.includes(s.pace as never)) this.settings.pace = s.pace!;
    if (typeof s.narrator === 'boolean') this.settings.narrator = s.narrator;
    if (typeof s.music === 'boolean') this.settings.music = s.music;
    if (typeof s.secure === 'boolean' && this.opts.httpsAvailable) this.settings.secure = s.secure;
    if (this.inLobby) {
      const games = pickFrom(s.games, GAMES);
      if (games) this.settings.games = games;
      const locations = pickFrom(s.locations, LOCATIONS);
      if (locations?.length) this.settings.locations = locations;
      const packs = pickFrom(s.packs, PACKS);
      if (packs?.length) {
        this.settings.packs = packs;
        this.decks.setPacks(packs);
      }
    }
    this.changed();
  }

  private addQuestion(raw: QuestionDraft, by?: Player): void {
    const q = cleanQuestion(raw);
    if (!q) return;
    const custom = this.decks.custom;
    const same = (other: CustomQuestion) => other.kind === q.kind && other.text.toLowerCase() === q.text.toLowerCase();
    if (custom.length >= CUSTOM_LIMIT || custom.some(same)) return;
    if (by && custom.filter((c) => c.by === by.id).length >= CUSTOM_PER_PLAYER) return;
    custom.push({ ...q, id: newId(), by: by?.id });
    this.changed();
  }


  handlePlayer(player: Player, msg: ClientMsg): void {
    const game = this.game;
    // running totals from «Тапалка» and friends arrive several times a second; one line per phase says enough
    if (!NOISY.has(msg.t) && !(msg.t === 'answer' && ['tap', 'tug', 'freeze'].includes(this.phase.kind))) {
      this.note(`${player.name}: ${msg.t}${msg.t === 'answer' ? ` ${(JSON.stringify(msg.value) ?? '').slice(0, 80)}` : ''}`);
    }
    switch (msg.t) {
      case 'start':
        if (player.vip) this.start();
        break;
      case 'again':
        if (player.vip && this.phase.kind === 'final') {
          this.again();
          if (msg.start === true) this.start();
        }
        break;
      case 'pause':
        if (player.vip) {
          this.pausedForHost = false;
          this.game?.setPaused(Boolean(msg.paused));
        }
        break;
      case 'skip':
        if (player.vip) this.game?.skip();
        break;
      case 'joker':
        this.game?.playJoker(player.id, Number(msg.phaseId));
        break;
      case 'rename': {
        // mid-game a name is already printed on titles, drawings and chat threads
        const name = cleanName(msg.name);
        if (!this.inLobby || !name || name === player.name) break;
        // the phone checks the roster before sending, so a clash here is a race and is simply dropped
        if ([...this.list, ...this.crowd.values()].some((p) => p !== player && p.name.toLowerCase() === name.toLowerCase())) break;
        player.name = name;
        this.changed();
        break;
      }
      case 'color': {
        if (!this.inLobby) break;
        const color = msg.color;
        const taken = this.list.some((p) => p.id !== player.id && p.color === color);
        if (Number.isInteger(color) && color >= 0 && color < PLAYER_COLORS.length && !taken) {
          player.color = color;
          this.faces.delete(player.id);
          this.changed();
        }
        break;
      }
      case 'question':
        this.addQuestion(msg, player);
        break;
      case 'leave':
        if (this.inLobby) {
          this.remove(player.id);
          this.changed();
        }
        break;
      case 'answer':
        // the phone already shows its answer as locked in, so a refusal sends the truth back to undo that
        if (game && !game.answer(player.id, msg.phaseId, msg.value)) this.changed();
        break;
      case 'ink':
        game?.ink(player.id, msg.phaseId, msg.op);
        break;
      case 'submit':
        game?.submit(player.id, msg.phaseId);
        break;
      case 'guess':
        game?.guess(player.id, msg.phaseId, msg.text);
        break;
      case 'tilt':
        game?.tiltInput(player.id, msg.phaseId, msg.x, msg.y);
        break;
      default:
        break;
    }
  }

  get empty(): boolean {
    return this.hostSocket === null && this.sockets.size === 0 && ![...this.crowd.values()].some((s) => s.ws);
  }

  dispose(): void {
    this.stopGame();
    clearTimeout(this.vipTimer);
    clearTimeout(this.hostGone);
    for (const timer of this.lobbyGrace.values()) clearTimeout(timer);
    this.lobbyGrace.clear();
    this.hostSocket?.close();
    for (const ws of this.sockets.values()) ws.close();
    for (const s of this.crowd.values()) s.ws?.close();
  }
}

/** Normalises an editor's question, or rejects it; predict and scale get a `{name}` slot. */
function cleanQuestion(raw: QuestionDraft): Omit<CustomQuestion, 'id' | 'by'> | null {
  const kind = QUESTION_KINDS.includes(raw.kind as QuestionKind) ? raw.kind! : 'vote';
  const line = (v: unknown, max: number) => (typeof v === 'string' ? clip(stripControls(v).replace(/\s+/g, ' ').trim(), max) : '');
  let text = line(raw.text, CUSTOM_MAX);
  if (text.length < 5) return null;
  if (!/[?!.]$/.test(text)) text += '?';
  if (kind === 'vote') return { kind, text };
  text = text.replaceAll(NAME_TOKEN, '{name}');
  if (!text.includes('{name}')) text = `Вопрос про {name}: ${text}`;
  if (kind === 'scale') {
    return { kind, text, low: line(raw.low, SCALE_LABEL_MAX) || 'совсем нет', high: line(raw.high, SCALE_LABEL_MAX) || 'очень' };
  }
  const options = (Array.isArray(raw.options) ? raw.options : []).map((o) => line(o, OPTION_MAX)).filter(Boolean);
  if (options.length < 2) return null;
  return { kind, text, options: options.slice(0, PREDICT_OPTIONS_MAX) };
}

/** Keeps only known timers with whole seconds inside their allowed range. */
function cleanTimers(raw: object): Settings['timers'] {
  const out: Settings['timers'] = {};
  for (const id of TIMERS) {
    const v = (raw as Record<string, unknown>)[id];
    const { min, max } = TIMER_INFO[id];
    if (Number.isInteger(v) && (v as number) >= min && (v as number) <= max) out[id] = v as number;
  }
  return out;
}

export function send(ws: WebSocket | null | undefined, msg: ServerMsg): void {
  sendRaw(ws, JSON.stringify(msg));
}

function isOpen(ws: WebSocket | null | undefined): ws is WebSocket {
  return !!ws && ws.readyState === ws.OPEN;
}

function sendRaw(ws: WebSocket | null | undefined, data: string): void {
  if (isOpen(ws)) ws.send(data);
}

function error(code: Extract<ServerMsg, { t: 'error' }>['code'], message: string): ServerMsg {
  return { t: 'error', code, message };
}

/** Known ids from a client-sent list, in canonical order; undefined when it isn't a list at all. */
function pickFrom<T extends string>(raw: unknown, known: readonly T[]): T[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return known.filter((id) => raw.includes(id));
}
