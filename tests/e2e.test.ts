import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import type { ClientMsg, PhaseKind, PlayerView, RoomView, ServerMsg } from '../shared/protocol.js';
import type { Segment } from '../server/game/plan.js';
import { startApp, type RunningApp } from '../server/app.js';
import { scaledDurations } from '../server/game/types.js';
import { seededRng } from '../server/util.js';

// smallest thing that passes the server's JPEG magic-byte sniffing
const FAKE_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 0xff, 0xd9]);

let app: RunningApp;
let base: string;

beforeAll(async () => {
  app = await startApp({ port: 0, durations: scaledDurations(0.01), rng: seededRng(11), botPace: 0.01 });
  base = `http://127.0.0.1:${app.port}`;
});

afterAll(async () => {
  await app.close();
});

class Client {
  readonly ws: WebSocket;
  readonly inbox: ServerMsg[] = [];
  private waiters: { test: (m: ServerMsg) => boolean; resolve: (m: ServerMsg) => void }[] = [];

  constructor() {
    this.ws = new WebSocket(`${base.replace('http', 'ws')}/ws`);
    this.ws.on('message', (data) => {
      const msg = JSON.parse(data.toString()) as ServerMsg;
      this.inbox.push(msg);
      this.waiters = this.waiters.filter((w) => {
        if (!w.test(msg)) return true;
        w.resolve(msg);
        return false;
      });
      this.onMessage?.(msg);
    });
  }

  onMessage?: (msg: ServerMsg) => void;

  open(): Promise<void> {
    return new Promise((resolve) => this.ws.once('open', () => resolve()));
  }

  send(msg: ClientMsg): void {
    this.ws.send(JSON.stringify(msg));
  }

  next<T extends ServerMsg['t']>(t: T, test: (m: Extract<ServerMsg, { t: T }>) => boolean = () => true, ms = 30_000) {
    const found = this.inbox.find((m) => m.t === t && test(m as Extract<ServerMsg, { t: T }>));
    if (found) return Promise.resolve(found as Extract<ServerMsg, { t: T }>);
    return new Promise<Extract<ServerMsg, { t: T }>>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout waiting for ${t}`)), ms);
      this.waiters.push({
        test: (m) => m.t === t && test(m as Extract<ServerMsg, { t: T }>),
        resolve: (m) => {
          clearTimeout(timer);
          resolve(m as Extract<ServerMsg, { t: T }>);
        },
      });
    });
  }
}

/** Phases each planned segment must have shown on the TV. */
const SEGMENT_PHASES: Record<Segment, PhaseKind[]> = {
  vote: ['vote', 'voteReveal'],
  bonusVote: ['vote', 'voteReveal'],
  predict: ['predict', 'predictReveal'],
  quote: ['write', 'vote', 'voteReveal'],
  selfie: ['draw', 'gallery'],
  describe: ['draw', 'gallery'],
  monster: ['draw', 'gallery'],
  photo: ['photo', 'gallery'],
  shared: ['shared', 'sharedReveal'],
  guess: ['guess', 'guessReveal'],
  tilt: ['tilt', 'tiltReveal'],
  reflex: ['reflex', 'reflexReveal'],
  lie: ['write', 'predict', 'predictReveal'],
  scale: ['scale', 'scaleReveal'],
  story: ['write', 'storyReveal'],
  never: ['never', 'neverReveal'],
  tap: ['tap', 'tapReveal'],
  emoji: ['write', 'vote', 'voteReveal'],
  herd: ['write', 'herdReveal'],
  duel: ['vote', 'voteReveal'],
  sync: ['sync', 'syncReveal'],
  bomb: ['bomb', 'bombReveal'],
  closest: ['closest', 'closestReveal'],
  quip: ['write', 'quipVote', 'quipReveal'],
  mime: ['guess', 'guessReveal'],
  truth: ['truth', 'truthReveal'],
  spy: ['spy', 'spyReveal'],
  clue: ['write', 'clueGuess', 'clueReveal'],
  treasure: ['treasure', 'treasureReveal'],
  list: ['list', 'listReveal'],
  rps: ['rps', 'rpsReveal'],
  plot: ['plot', 'plotGuess', 'plotReveal'],
  date: ['date', 'datePick', 'dateMatch'],
  masq: ['masq', 'masqGuess', 'masqReveal'],
  radio: ['radio', 'radioShow', 'radioVote', 'radioReveal'],
  rush: ['rush', 'rushVote', 'rushReveal'],
  market: ['market', 'marketReveal'],
  wave: ['waveHint', 'waveGuess', 'waveReveal'],
  order: ['orderWrite', 'orderSort', 'orderReveal'],
  freeze: ['freeze', 'freezeReveal'],
  sumo: ['tilt', 'brawlReveal'],
  tag: ['tilt', 'brawlReveal'],
  tug: ['tug', 'tugReveal'],
  paint: ['tilt', 'brawlReveal'],
  hat: ['write', 'hat', 'hatReveal'],
  just: ['write', 'foreheadGuess', 'foreheadReveal'],
  shaker: ['shaker', 'shakerReveal'],
  clover: ['write', 'clover', 'cloverReveal'],
  quiz: ['quiz', 'quizReveal'],
  years: ['years', 'yearsReveal'],
  tale: ['draw', 'write', 'taleVote', 'taleReveal'],
  copy: ['copyShow', 'draw', 'gallery', 'galleryReveal'],
  rhyme: ['write', 'rushVote', 'rushReveal'],
  junk: ['write', 'junkBid', 'junkSold'],
  ninja: ['ninja', 'ninjaReveal'],
  case: ['caseSurvey', 'caseClue', 'caseReveal'],
  contact: ['contactWrite', 'contactGuess', 'contactReveal'],
  band: ['band', 'bandReveal'],
  mafia: ['mafiaRoles', 'mafiaNight', 'mafiaDay', 'mafiaVote', 'mafiaExile', 'mafiaEnd'],
  blank: ['write', 'rushVote', 'rushReveal'],
  odd: ['write', 'rushVote', 'rushReveal'],
  even: ['even', 'evenReveal'],
  percent: ['percent', 'percentGuess', 'percentBet', 'percentReveal'],
  fib: ['write', 'fibVote', 'fibReveal'],
  simon: ['simon', 'simonReveal'],
  reply: ['replyPick', 'fibVote', 'fibReveal'],
  forehead: ['write', 'foreheadGuess', 'foreheadReveal'],
};

/** Word of the current draw-and-guess round, as seen on the artist's phone. */
const secrets = new Map<number, string>();

/** A phone that plays along automatically, like a fast and indecisive human. */
function autoplay(phone: Client, code: string, token: string): void {
  const handled = new Set<string>();
  phone.onMessage = (msg) => {
    if (msg.t !== 'me') return;
    const v: PlayerView = msg.view;
    const key = `${v.phaseId}:${v.phase.kind}`;
    const p = v.phase;
    const act = (fn: () => void) => {
      if (handled.has(key)) return;
      handled.add(key);
      fn();
    };
    switch (p.kind) {
      case 'rules':
        act(() => phone.send({ t: 'answer', phaseId: v.phaseId, value: 'ready' }));
        break;
      case 'vote':
        act(() => {
          const options = p.options.filter((id) => p.allowSelf || id !== v.you);
          phone.send({ t: 'answer', phaseId: v.phaseId, value: options[0]! });
        });
        break;
      case 'predict':
        act(() => phone.send({ t: 'answer', phaseId: v.phaseId, value: 0 }));
        break;
      case 'scale':
        act(() => phone.send({ t: 'answer', phaseId: v.phaseId, value: 5 }));
        break;
      case 'write':
        if (p.author && p.author !== v.you) break;
        act(() =>
          phone.send({
            t: 'answer',
            phaseId: v.phaseId,
            value: p.slots ? p.slots.map((_, i) => `факт ${i}`) : p.clue ? 'загадочная штука' : `ответ ${v.you}`,
          }),
        );
        break;
      case 'reflex':
        if (p.stage === 'go') act(() => phone.send({ t: 'answer', phaseId: v.phaseId, value: 300 }));
        break;
      case 'draw':
        act(() => {
          const s = { c: '#ff3b5c', w: 14, p: [10, 10, 300, 300, 600, 200] };
          phone.send({ t: 'ink', phaseId: v.phaseId, op: { k: 'move', s } });
          phone.send({ t: 'ink', phaseId: v.phaseId, op: { k: 'end', s } });
          phone.send({ t: 'submit', phaseId: v.phaseId });
        });
        break;
      case 'shared':
        if (v.personal.kind === 'shared' && v.personal.myTurn) {
          act(() => {
            phone.send({ t: 'ink', phaseId: v.phaseId, op: { k: 'end', s: { c: '#1fa5ff', w: 6, p: [5, 5, 500, 400] } } });
            phone.send({ t: 'submit', phaseId: v.phaseId });
          });
        }
        break;
      case 'photo':
        act(() => {
          void fetch(`${base}/api/room/${code}/image?kind=photo&phase=${v.phaseId}`, {
            method: 'POST',
            headers: { 'x-token': token, 'Content-Type': 'image/jpeg' },
            body: FAKE_JPEG,
          });
        });
        break;
      case 'guess':
        if (v.personal.kind !== 'guess') break;
        if (v.personal.role === 'artist') {
          if (v.personal.word) secrets.set(v.phaseId, v.personal.word);
          act(() => {
            phone.send({ t: 'ink', phaseId: v.phaseId, op: { k: 'end', s: { c: '#1b1033', w: 14, p: [100, 100, 900, 500] } } });
          });
        } else if (!v.personal.solved) {
          act(() => {
            phone.send({ t: 'guess', phaseId: v.phaseId, text: 'точно не это' });
            // the server rate-limits guesses, so the real answer goes in a moment later
            setTimeout(() => {
              const word = secrets.get(v.phaseId);
              if (word) phone.send({ t: 'guess', phaseId: v.phaseId, text: word.toUpperCase() });
            }, 550);
          });
        }
        break;
      case 'tilt':
        act(() => {
          const timer = setInterval(() => {
            if (phone.ws.readyState !== phone.ws.OPEN) return clearInterval(timer);
            phone.send({ t: 'tilt', phaseId: v.phaseId, x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 });
          }, 50);
          setTimeout(() => clearInterval(timer), 3000);
        });
        break;
      case 'gallery':
        if (v.personal.kind === 'gallery' && v.personal.canVote) {
          act(() => {
            const pick = p.items.find((i) => !i.authors.includes(v.you));
            const wait = Math.max(0, p.votingFrom - v.serverNow) + 20;
            setTimeout(() => pick && phone.send({ t: 'answer', phaseId: v.phaseId, value: pick.id }), wait);
          });
        }
        break;
      default:
        break;
    }
  };
}

describe('e2e over websockets', () => {
  it('runs lobby, selfies, a whole game and a rematch', async () => {
    const host = new Client();
    await host.open();
    host.send({ t: 'host.create' });
    const { code, token: hostToken } = await host.next('host.welcome');
    host.send({ t: 'host.settings', settings: { episodes: 2 } });

    const phones: Client[] = [];
    const tokens: string[] = [];
    for (const name of ['Аня', 'Боря', 'Вика']) {
      const phone = new Client();
      await phone.open();
      phone.send({ t: 'join', code, name, color: 0 });
      const welcome = await phone.next('welcome');
      phones.push(phone);
      tokens.push(welcome.token);
    }

    const dup = new Client();
    await dup.open();
    dup.send({ t: 'join', code, name: 'аня', color: 1 });
    expect((await dup.next('error')).code).toBe('name_taken');
    dup.ws.close();

    const lobby = await host.next('room', (m) => m.view.players.length === 3);
    expect(new Set(lobby.view.players.map((p) => p.color)).size).toBe(3);
    expect(lobby.view.players.filter((p) => p.vip)).toHaveLength(1);

    const res = await fetch(`${base}/api/room/${code}/image?kind=selfie`, {
      method: 'POST',
      headers: { 'x-token': tokens[0]!, 'Content-Type': 'image/jpeg' },
      body: FAKE_JPEG,
    });
    expect(res.status).toBe(200);
    const { asset } = (await res.json()) as { asset: string };
    const img = await fetch(`${base}/a/${code}/${asset}`);
    expect(img.headers.get('content-type')).toBe('image/jpeg');

    const bad = await fetch(`${base}/api/room/${code}/image?kind=selfie`, {
      method: 'POST',
      headers: { 'x-token': tokens[1]!, 'Content-Type': 'image/jpeg' },
      body: Buffer.from('<svg onload=alert(1)>'),
    });
    expect(bad.status).toBe(415);
    const forged = await fetch(`${base}/api/room/${code}/image?kind=selfie`, {
      method: 'POST',
      headers: { 'x-token': 'nope', 'Content-Type': 'image/jpeg' },
      body: FAKE_JPEG,
    });
    expect(forged.status).toBe(403);

    host.send({ t: 'host.addBot' });
    phones.forEach((phone, i) => autoplay(phone, code, tokens[i]!));

    // a non-VIP cannot start the game; the pong proves the server got past the start, and the music
    // toggle forces a room view built after it
    phones[1]!.send({ t: 'start' });
    phones[1]!.send({ t: 'ping', at: 7 });
    await phones[1]!.next('pong', (m) => m.at === 7);
    host.send({ t: 'host.settings', settings: { music: false } });
    const latest = await host.next('room', (m) => !m.view.settings.music);
    expect(latest.view.phase.kind).toBe('lobby');

    phones[0]!.send({ t: 'start' });
    await host.next('room', (m) => m.view.phase.kind === 'intro');
    const plan = app.rooms.get(code)!.plan!;

    phones[2]!.ws.close();
    const back = new Client();
    await back.open();
    back.send({ t: 'resume', code, token: tokens[2]! });
    const rewelcome = await back.next('welcome');
    expect(rewelcome.you).toBeTruthy();
    autoplay(back, code, tokens[2]!);

    host.ws.close();
    const host2 = new Client();
    await host2.open();
    host2.send({ t: 'host.resume', code, token: hostToken });
    await host2.next('host.welcome');

    const kinds = new Set<string>();
    let arenaSnaps = 0;
    const solvedRounds: string[][] = [];
    host2.onMessage = (m) => {
      if (m.t === 'room') {
        kinds.add(m.view.phase.kind);
        if (m.view.phase.kind === 'guessReveal') solvedRounds.push(m.view.phase.solved);
      }
      if (m.t === 'arena') arenaSnaps++;
    };
    const final = await host2.next('room', (m) => m.view.phase.kind === 'final', 60_000);
    const view: RoomView = final.view;
    if (view.phase.kind !== 'final') throw new Error('expected final');
    expect(view.phase.rows).toHaveLength(4);
    expect(view.phase.rows.reduce((n, r) => n + r.score, 0)).toBeGreaterThan(0);
    const segments = new Set(plan.flatMap((e) => e.segments));
    const expected = ['scores', ...[...segments].flatMap((s) => SEGMENT_PHASES[s])];
    for (const k of expected) expect(kinds, k).toContain(k);
    const games = [...segments].filter((s) => s !== 'vote' && s !== 'bonusVote');
    if (games.length > 0) expect(kinds).toContain('rules');
    if (segments.has('tilt')) expect(arenaSnaps).toBeGreaterThan(5);
    // humans that saw the word on the artist's phone typed it in, so someone solved each round with a human artist
    if (segments.has('guess')) expect(solvedRounds.some((s) => s.length > 0)).toBe(true);

    for (const item of view.phase.gallery) {
      if (!item.ink) continue;
      const ink = await fetch(`${base}/a/${code}/${item.ink}`);
      expect(Array.isArray(await ink.json())).toBe(true);
    }

    phones[0]!.send({ t: 'again' });
    const again = await host2.next('room', (m) => m.view.phase.kind === 'lobby' && m.view.players.every((p) => p.score === 0));
    expect(again.view.players.length).toBeGreaterThanOrEqual(3);

    for (const c of [host2, back, ...phones]) c.ws.close();
  });

  it('survives oversized frames and garbage messages', async () => {
    const rogue = new Client();
    await rogue.open();
    const closed = new Promise<number>((resolve) => rogue.ws.once('close', (code) => resolve(code)));
    rogue.send({ t: 'ink', phaseId: 1, op: null } as unknown as ClientMsg);
    rogue.ws.send('x'.repeat(300 * 1024));
    expect(await closed).toBe(1009);

    const fine = new Client();
    await fine.open();
    fine.send({ t: 'ping', at: 1 });
    expect((await fine.next('pong')).at).toBe(1);
    fine.ws.close();
  });

  it('rejects joining a missing room', async () => {
    const phone = new Client();
    await phone.open();
    phone.send({ t: 'join', code: '0000', name: 'X', color: 0 });
    expect((await phone.next('error')).code).toBe('no_room');
    phone.ws.close();
  });
});

describe('https listener', () => {
  it('serves phones over TLS and switches the join link when enabled', async () => {
    const { mkdtemp } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const { loadOrCreateCert } = await import('../server/tls.js');
    const dir = await mkdtemp(join(tmpdir(), 'kto-tls-'));
    const secureApp = await startApp({
      port: 0,
      https: { port: 0, tls: () => loadOrCreateCert(dir, '127.0.0.1') },
    });
    try {
      expect(secureApp.httpsPort).not.toBeNull();
      const host = new WebSocket(`ws://127.0.0.1:${secureApp.port}/ws`);
      await new Promise((r) => host.once('open', r));
      host.send(JSON.stringify({ t: 'host.create' }));
      host.send(JSON.stringify({ t: 'host.settings', settings: { secure: true } }));
      const view = await new Promise<RoomView>((resolve) => {
        host.on('message', (data) => {
          const msg = JSON.parse(data.toString()) as ServerMsg;
          if (msg.t === 'room' && msg.view.settings.secure) resolve(msg.view);
        });
      });
      expect(view.httpsAvailable).toBe(true);
      expect(view.joinUrl.startsWith('https://')).toBe(true);

      const phone = new WebSocket(`wss://127.0.0.1:${secureApp.httpsPort}/ws`, { rejectUnauthorized: false });
      await new Promise((r) => phone.once('open', r));
      phone.send(JSON.stringify({ t: 'join', code: view.code, name: 'Секьюрный', color: 0 }));
      const welcome = await new Promise<ServerMsg>((resolve) => phone.once('message', (d) => resolve(JSON.parse(d.toString()))));
      expect(welcome.t).toBe('welcome');

      const again = await loadOrCreateCert(dir, '127.0.0.1');
      const first = await loadOrCreateCert(dir, '127.0.0.1');
      expect(again.cert).toBe(first.cert);
      host.close();
      phone.close();
    } finally {
      await secureApp.close();
    }
  });
});
