import { describe, expect, it, vi } from 'vitest';
import type { WebSocket } from 'ws';
import { dmThread } from '../shared/catalog.js';
import { DATE_MESSAGES, QUESTIONS_MIN, RADIO_WORDS_MAX, type Phase, type PhaseKind } from '../shared/protocol.js';
import { scaledDurations, type Player } from '../server/game/types.js';
import type { Game } from '../server/game/game.js';
import { Room } from '../server/room.js';
import { caseQuestions, narrator, replyCards } from '../server/content/index.js';
import { fill, seededRng } from '../server/util.js';
import { orderAccuracy, wavePoints } from '../server/game/wave.js';
import { momentOf, pickMoments } from '../server/game/moments.js';

function makeRoom(seed: number, episodes: number): Room {
  const room = new Room('0000', {
    durations: scaledDurations(0.004),
    rng: seededRng(seed),
    botPace: 0.004,
    joinUrl: () => 'http://test/p',
    httpsAvailable: false,
  });
  room.settings.episodes = episodes;
  room.settings.questions = QUESTIONS_MIN;
  room.settings.minis = 2;
  // the twists rescale points, which the scoring tests check exactly; the twist tests turn them back on
  room.settings.modifiers = false;
  return room;
}

/** Enough of a socket for the room to treat this player as a human on a phone. */
function fakePhone(): WebSocket {
  return { readyState: 1, OPEN: 1, send: () => undefined, close: () => undefined } as unknown as WebSocket;
}

async function until(test: () => boolean, timeoutMs = 10_000): Promise<void> {
  const started = Date.now();
  while (!test()) {
    if (Date.now() - started > timeoutMs) throw new Error('condition never held');
    await new Promise((r) => setTimeout(r, 2));
  }
}

async function playToEnd(room: Room, timeoutMs = 20_000, phases: Phase[] = []): Promise<PhaseKind[]> {
  const seen: PhaseKind[] = [];
  const started = Date.now();
  let last: Phase | null = null;
  while (room.phase.kind !== 'final') {
    if (room.phase !== last) {
      last = room.phase;
      seen.push(room.phase.kind);
      phases.push(room.phase);
    }
    if (Date.now() - started > timeoutMs) throw new Error(`stuck in ${room.phase.kind}`);
    await new Promise((r) => setTimeout(r, 2));
  }
  seen.push('final');
  return seen;
}

describe('full game with bots', () => {
  for (const episodes of [1, 2, 3]) {
    it(`plays ${episodes} episode(s) from intro to final`, async () => {
      const room = makeRoom(episodes * 7, episodes);
      for (let i = 0; i < 4; i++) room.addBot();
      expect(room.canStart()).toBe(true);
      room.start();
      const segments = room.plan!.flatMap((e) => e.segments);
      const seen = await playToEnd(room);

      expect(seen.filter((k) => k === 'intro')).toHaveLength(episodes);
      expect(seen.slice(-2)).toEqual(['missions', 'final']);
      if (segments.includes('selfie') || segments.includes('monster')) expect(seen).toContain('draw');
      if (segments.includes('photo')) expect(seen).toContain('photo');
      if (segments.includes('shared')) expect(seen).toContain('shared');
      if (segments.includes('guess')) expect(seen).toContain('guessReveal');
      if (segments.includes('tilt')) expect(seen).toContain('tiltReveal');
      if (segments.includes('quote')) expect(seen).toContain('write');
      if (segments.includes('reflex')) expect(seen).toContain('reflexReveal');
      const exhibited = segments.some((s) => ['selfie', 'monster', 'describe', 'photo'].includes(s));
      if (exhibited) expect(seen).toContain('galleryReveal');

      const final = room.phase;
      if (final.kind !== 'final') throw new Error('not final');
      expect(final.rows).toHaveLength(4);
      expect(final.rows[0]!.score).toBeGreaterThan(0);
      if (exhibited) expect(final.gallery.length).toBeGreaterThan(0);
      for (const item of final.gallery) {
        if (item.ink) expect(room.getAsset(item.ink)).toBeDefined();
      }
      room.dispose();
    });
  }

  it('puts one person in the spotlight and asks only about them that round', async () => {
    const room = makeRoom(11, 2);
    room.settings.games = ['predict', 'scale', 'tilt'];
    expect(room.join(fakePhone(), 'Аня', 0)).toBeNull();
    expect(room.join(fakePhone(), 'Боря', 1)).toBeNull();
    room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const intros = phases.filter((p) => p.kind === 'intro');
    expect(intros[0]!.hero).toBeUndefined();
    const hero = intros[1]!.hero;
    const human = room.players().find((p) => p.id === hero);
    expect(human?.bot).toBe(false);
    const after = phases.slice(phases.indexOf(intros[1]!));
    const about = after.filter((p) => p.kind === 'predict' || p.kind === 'scale');
    expect(about).toHaveLength(QUESTIONS_MIN);
    for (const p of about) expect(p.target).toBe(hero);
    room.dispose();
  });

  it('runs the host-set timers instead of the pace', () => {
    const room = makeRoom(12, 1);
    room.handleHost({ t: 'host.settings', settings: { timers: { answer: 40, write: 999, nonsense: 5 } as never } });
    expect(room.settings.timers).toEqual({ answer: 40 });
    room.dispose();
  });

  it('plays «Я никогда не…», «Тапалка» and «Эмодзи-портрет» through to their reveals', async () => {
    const room = makeRoom(21, 3);
    room.settings.games = ['never', 'tap', 'emoji'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 30_000, phases);
    for (const kind of ['neverReveal', 'tapReveal'] as const) expect(seen).toContain(kind);
    const emojiVote = phases.find((p) => p.kind === 'vote' && p.emoji);
    expect(emojiVote).toBeDefined();
    const reveal = phases.find((p) => p.kind === 'voteReveal' && p.about);
    if (reveal?.kind !== 'voteReveal') throw new Error('no emoji reveal');
    expect(reveal.author).not.toBe(reveal.about);
    const taps = phases.find((p) => p.kind === 'tapReveal');
    if (taps?.kind !== 'tapReveal') throw new Error('no tap reveal');
    expect(Object.values(taps.counts).some((n) => n > 0)).toBe(true);
    room.dispose();
  });

  it('plays «Чужак в стае» and «Поровну»: the outsider is someone who answered, the minority scores', async () => {
    const room = makeRoom(31, 3);
    room.settings.games = ['odd', 'even'];
    room.settings.minis = 2;
    room.settings.spotlight = false;
    for (let i = 0; i < 6; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 30_000, phases);
    expect(seen).toContain('evenReveal');

    for (const p of phases) {
      if (p.kind === 'rushReveal' && p.odd) {
        const odd = p.odd;
        expect(p.replies.map((r) => r.player)).toContain(odd.player);
        for (const [id, gain] of Object.entries(p.gains)) {
          if (id === odd.player) continue;
          expect(p.replies.find((r) => r.player === odd.player)!.votes).toContain(id);
          expect(gain).toBe(100);
        }
      }
      if (p.kind === 'evenReveal') {
        const [a, b] = p.sides;
        const scored = Object.keys(p.gains);
        if (a.length === b.length) expect(scored.sort()).toEqual([...a, ...b].sort());
        else if (a.length && b.length) expect(scored.sort()).toEqual([...(a.length < b.length ? a : b)].sort());
        else expect(scored).toEqual([]);
      }
    }
    expect(phases.some((p) => p.kind === 'rushReveal' && p.odd)).toBe(true);
    room.dispose();
  });

  it('plays «Сколько процентов?», «Словарь выдумок» and «Бублик говорит» by their rules', async () => {
    const room = makeRoom(37, 3);
    room.settings.games = ['percent', 'fib', 'simon'];
    room.settings.minis = 3;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 30_000, phases);
    for (const kind of ['percentReveal', 'fibReveal', 'simonReveal'] as const) expect(seen).toContain(kind);

    for (const p of phases) {
      if (p.kind === 'percentReveal') {
        expect(p.share).toBeGreaterThanOrEqual(0);
        expect(p.share).toBeLessThanOrEqual(100);
        for (const id of p.higher) expect(id in p.gains).toBe(p.share > p.guess);
        for (const id of p.lower) expect(id in p.gains).toBe(p.share < p.guess);
      }
      if (p.kind === 'fibReveal') {
        const truth = p.options.find((o) => o.id === p.truth)!;
        expect(truth.author).toBeUndefined();
        for (const o of p.options) expect(o.votes).not.toContain(o.author);
      }
      if (p.kind === 'simon') expect(p.alive.some((id) => p.out.includes(id))).toBe(false);
      if (p.kind === 'simonReveal') for (const id of Object.keys(p.gains)) expect(p.alive).toContain(id);
    }
    room.dispose();
  });

  it('plays «Подбери реплику» and «Что у меня на лбу?»: picks come from hands, hints never come from the guesser', async () => {
    const room = makeRoom(41, 3);
    room.settings.games = ['reply', 'forehead'];
    room.settings.minis = 2;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 30_000, phases);
    expect(seen).toContain('foreheadReveal');
    expect(phases.some((p) => p.kind === 'fibReveal' && p.title)).toBe(true);
    for (const p of phases) {
      if (p.kind === 'fibReveal' && p.title) {
        for (const o of p.options) expect(replyCards).toContain(o.text);
        for (const o of p.options) expect(o.votes).not.toContain(o.author);
      }
      if (p.kind === 'foreheadReveal') {
        expect(p.hints.map((h) => h.player)).not.toContain(p.guesser);
        expect(Object.keys(p.gains).length > 0).toBe(p.right);
      }
    }
    room.dispose();
  });

  it('plays «Шляпа»: three rounds over one hat of words, explained only by people', async () => {
    const room = makeRoom(43, 1);
    room.settings.games = ['hat'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    expect(room.join(fakePhone(), 'Аня', 0)).toBeNull();
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 60_000, phases);
    expect(seen).toContain('hatReveal');
    const anya = room.players().find((p) => !p.bot)!.id;
    const turns = phases.filter((p) => p.kind === 'hatReveal');
    expect(new Set(turns.map((t) => t.mode))).toEqual(new Set(['talk', 'word', 'mime']));
    const words = new Set<string>();
    for (const t of turns) {
      if (t.kind !== 'hatReveal') continue;
      expect(t.explainer).toBe(anya);
      for (const c of t.got) {
        expect(c.player).not.toBe(anya);
        words.add(c.word.toLowerCase());
      }
      expect(t.gains[anya] ?? 0).toBe(t.got.length * 40);
    }
    // the hat holds at most twelve words, and every round goes over the same ones
    expect(words.size).toBeLessThanOrEqual(12);
    room.dispose();
  });

  it('plays «Мафия-ТВ»: secret roles, nights, exiles and a winner that matches who is left', async () => {
    const room = makeRoom(47, 1);
    room.settings.games = ['mafia'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 7; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 60_000, phases);
    expect(seen).toContain('mafiaEnd');
    const end = phases.find((p) => p.kind === 'mafiaEnd');
    if (end?.kind !== 'mafiaEnd') throw new Error('no mafia end');
    const roles = Object.values(end.roles);
    expect(roles.filter((r) => r === 'wolf')).toHaveLength(2);
    expect(roles).toContain('doctor');
    expect(roles).toContain('seer');
    const wolvesAlive = end.alive.filter((id) => end.roles[id] === 'wolf').length;
    expect(end.winner).toBe(wolvesAlive === 0 ? 'village' : 'wolves');
    for (const [id, role] of Object.entries(end.roles)) {
      if ((role === 'wolf') === (end.winner === 'wolves')) expect(end.gains[id] ?? 0).toBeGreaterThanOrEqual(250);
    }
    for (const p of phases) {
      if (p.kind === 'mafiaExile' && p.exiled) expect(p.role).toBe(end.roles[p.exiled]);
      if (p.kind === 'mafiaExile') for (const v of p.votes) expect(v.from).not.toBe(v.to);
    }
    room.dispose();
  });

  it('plays «Ровно один»: matching hints burn and earn nothing', async () => {
    const room = makeRoom(53, 1);
    room.settings.games = ['just'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 7; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 30_000, phases);
    expect(seen).toContain('foreheadReveal');
    const reveals = phases.filter((p) => p.kind === 'foreheadReveal');
    // seven bots draw hints from a short list, so some always collide
    expect(reveals.some((r) => r.kind === 'foreheadReveal' && r.hints.some((h) => h.cancelled))).toBe(true);
    for (const r of reveals) {
      if (r.kind !== 'foreheadReveal') continue;
      expect(r.just).toBe(true);
      for (const h of r.hints) if (h.cancelled) expect(r.gains[h.player]).toBeUndefined();
    }
    for (const p of phases) if (p.kind === 'foreheadGuess') for (const h of p.hints) if (h.cancelled) expect(h.text).toBe('');
    room.dispose();
  });

  it('plays «Шейкер»: a burst balloon scores nothing and the biggest whole one wins', async () => {
    const room = makeRoom(59, 1);
    room.settings.games = ['shaker'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 6; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const reveal = phases.find((p) => p.kind === 'shakerReveal');
    if (reveal?.kind !== 'shakerReveal') throw new Error('no shaker reveal');
    for (const id of reveal.popped) expect(reveal.gains[id]).toBeUndefined();
    const whole = Object.entries(reveal.sizes).filter(([id, n]) => n > 0 && !reveal.popped.includes(id));
    const best = Math.max(0, ...whole.map(([, n]) => n));
    for (const [id, n] of whole) if (n === best) expect(reveal.gains[id]).toBe(200);
    room.dispose();
  });

  it('plays «Четырёхлистник»: clues per pair, placements scored per corner', async () => {
    const room = makeRoom(61, 1);
    room.settings.games = ['clover'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 60_000, phases);
    expect(seen).toContain('cloverReveal');
    for (const p of phases) {
      if (p.kind !== 'cloverReveal') continue;
      expect(p.clues).toHaveLength(4);
      expect(p.cards).toHaveLength(5);
      for (const w of p.words) expect(p.cards).toContain(w);
      expect(Object.keys(p.picks).length).toBeGreaterThan(0);
      for (const [id, pick] of Object.entries(p.picks)) {
        expect(id).not.toBe(p.author);
        const right = pick.filter((c, k) => p.cards[c] === p.words[k]).length;
        expect(p.gains[id] ?? 0).toBe(right * 40 + (right === 4 ? 60 : 0));
      }
    }
    room.dispose();
  });

  it('plays «Викторина на выбывание»: a miss costs a life and the last ones standing get the bonus', async () => {
    const room = makeRoom(67, 1);
    room.settings.games = ['quiz'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    const reveals = phases.filter((p) => p.kind === 'quizReveal');
    expect(reveals.length).toBeGreaterThan(1);
    let before: Record<string, number> | null = null;
    for (const r of reveals) {
      if (r.kind !== 'quizReveal' || r.answer < 0) continue;
      if (before) {
        for (const [id, lives] of Object.entries(r.lives)) {
          const lost = (before[id] ?? 3) - lives;
          expect(lost).toBe(before[id]! > 0 && r.picks[id] !== r.answer ? 1 : 0);
        }
      }
      before = r.lives;
    }
    const final = reveals.at(-1)!;
    if (final.kind !== 'quizReveal') throw new Error('no final');
    expect(final.answer).toBe(-1);
    for (const [id, lives] of Object.entries(final.lives)) if (lives > 0) expect(final.gains[id]).toBeGreaterThanOrEqual(150);
    room.dispose();
  });

  it('plays «В каком году?»: the timeline stays sorted and the right slot scores', async () => {
    const room = makeRoom(71, 1);
    room.settings.games = ['years'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    const reveals = phases.filter((p) => p.kind === 'yearsReveal');
    expect(reveals.length).toBeGreaterThan(3);
    for (const r of reveals) {
      if (r.kind !== 'yearsReveal') continue;
      const years = r.timeline.map((c) => c.year);
      expect(years).toEqual([...years].sort((a, b) => a - b));
      expect(r.timeline[r.slot]).toMatchObject({ e: r.event, year: r.year });
      for (const [id, slot] of Object.entries(r.picks)) expect(r.gains[id] ?? 0).toBe(slot === r.slot ? 100 : 0);
    }
    room.dispose();
  });

  it('plays «Сказочник»: Dixit scoring over the party\'s drawings', async () => {
    const room = makeRoom(73, 1);
    room.settings.games = ['tale'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 60_000, phases);
    expect(seen).toContain('taleReveal');
    for (const p of phases) {
      if (p.kind === 'taleVote') for (const c of p.items) expect(c).not.toHaveProperty('author');
      if (p.kind !== 'taleReveal') continue;
      const truth = p.items.find((c) => c.id === p.truth)!;
      expect(truth.author).toBe(p.teller);
      const voters = p.items.flatMap((c) => c.votes);
      expect(voters).not.toContain(p.teller);
      for (const c of p.items) expect(c.votes).not.toContain(c.author);
      const found = truth.votes.length;
      const missed = found === 0 || found === voters.length;
      expect(p.gains[p.teller] ?? 0).toBe(missed ? 0 : 120);
    }
    room.dispose();
  });

  it('plays «Срисуй по памяти»: the picture shows, hides, and the copies go to the gallery beside it', async () => {
    const room = makeRoom(79, 1);
    room.settings.games = ['copy'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    const show = phases.find((p) => p.kind === 'copyShow');
    if (show?.kind !== 'copyShow') throw new Error('no copy show');
    expect(show.picture.ink ?? show.picture.image).toBeTruthy();
    const draw = phases.find((p) => p.kind === 'draw' && p.mode === 'copy');
    expect(draw).toBeDefined();
    const reveal = phases.find((p) => p.kind === 'galleryReveal');
    if (reveal?.kind !== 'galleryReveal') throw new Error('no gallery');
    expect(reveal.original).toEqual(show.picture);
    room.dispose();
  });

  it('plays «Рифмач»: couplets from the first line, votes per couplet', async () => {
    const room = makeRoom(83, 1);
    room.settings.games = ['rhyme'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    const reveals = phases.filter((p) => p.kind === 'rushReveal');
    expect(reveals.length).toBeGreaterThan(0);
    for (const r of reveals) {
      if (r.kind !== 'rushReveal') continue;
      expect(r.from).toBe('Рифмач');
      for (const reply of r.replies) expect(r.gains[reply.player] ?? 0).toBe(reply.votes.length * 100);
    }
    room.dispose();
  });

  it('plays «Барахолка»: the top bid buys, nobody overspends, sellers earn the price', async () => {
    const room = makeRoom(89, 1);
    room.settings.games = ['junk'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    const sales = phases.filter((p) => p.kind === 'junkSold');
    expect(sales.length).toBeGreaterThan(2);
    for (const s of sales) {
      if (s.kind !== 'junkSold') continue;
      for (const coins of Object.values(s.coins)) expect(coins).toBeGreaterThanOrEqual(0);
      if (!s.buyer) continue;
      expect(s.buyer).not.toBe(s.seller);
      expect(s.gains[s.seller]).toBe(s.price);
      expect(s.gains[s.buyer]).toBe(s.bidders.length * 60);
    }
    room.dispose();
  });

  it('plays «Фруктовый ниндзя»: fruit scores, bombs cost, nobody drops below zero', async () => {
    const room = makeRoom(97, 1);
    room.settings.games = ['ninja'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    const play = phases.find((p) => p.kind === 'ninja');
    if (play?.kind !== 'ninja') throw new Error('no ninja');
    expect(play.fruits.length).toBeGreaterThan(20);
    expect(play.fruits.some((f) => f.kind === '💣')).toBe(true);
    const reveal = phases.find((p) => p.kind === 'ninjaReveal');
    if (reveal?.kind !== 'ninjaReveal') throw new Error('no ninja reveal');
    expect(Math.max(...Object.values(reveal.scores))).toBeGreaterThan(0);
    for (const n of Object.values(reveal.scores)) expect(n).toBeGreaterThanOrEqual(0);
    room.dispose();
  });

  it('plays «Расследование»: clues are the culprit\'s own survey answers, early right accusations pay more', async () => {
    const room = makeRoom(101, 1);
    room.settings.games = ['case'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 60_000, phases);
    expect(seen).toContain('caseReveal');
    const reveal = phases.find((p) => p.kind === 'caseReveal');
    if (reveal?.kind !== 'caseReveal') throw new Error('no case reveal');
    expect(reveal.clues).toHaveLength(3);
    for (const clue of reveal.clues) expect(caseQuestions.some((q) => q.clues.includes(clue))).toBe(true);
    expect(reveal.accusations.map((a) => a.player)).not.toContain(reveal.culprit);
    for (const a of reveal.accusations) expect(reveal.gains[a.player] ?? 0).toBe(a.suspect === reveal.culprit ? [300, 200, 100][a.clue - 1] : 0);
    room.dispose();
  });

  it('plays «Контакт»: words on the prefix, contacts open letters, the leader blocks', async () => {
    const room = makeRoom(103, 1);
    room.settings.games = ['contact'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 60_000, phases);
    expect(seen).toContain('contactGuess');
    expect(seen).toContain('contactReveal');
    const reveals = phases.filter((p) => p.kind === 'contactReveal');
    expect(reveals.at(-1)).toMatchObject({ word: expect.any(String) });
    for (const p of phases) {
      if (p.kind === 'contactWrite') expect(p.prefix.length).toBeGreaterThan(0);
      if (p.kind !== 'contactReveal') continue;
      for (const h of p.hints) {
        expect(h.contacts).not.toContain(h.author);
        expect(h.contacts).not.toContain(p.leader);
      }
      if (p.opened) expect(p.hints.some((h) => h.contacts.length > 0 && !h.blocked)).toBe(true);
    }
    room.dispose();
  });

  it('plays «Оркестр»: taps near a note score, accuracy stays within a hundred percent', async () => {
    const room = makeRoom(107, 1);
    room.settings.games = ['band'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    const reveal = phases.find((p) => p.kind === 'bandReveal');
    if (reveal?.kind !== 'bandReveal') throw new Error('no band reveal');
    expect(new Set(Object.values(reveal.parts).map((p) => p.instrument)).size).toBe(4);
    for (const pct of Object.values(reveal.scores)) {
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
    expect(Math.max(...Object.values(reveal.scores))).toBeGreaterThan(30);
    room.dispose();
  });

  it('plays the last of three rounds for double points and the first straight', async () => {
    const room = makeRoom(109, 3);
    room.settings.games = [];
    room.settings.spotlight = false;
    room.settings.modifiers = true;
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    const intros = phases.filter((p) => p.kind === 'intro');
    expect(intros).toHaveLength(3);
    expect(intros[0]).not.toHaveProperty('modifier', expect.anything());
    expect(intros[2]).toMatchObject({ modifier: 'double' });
    // every vote reveal of the doubled round pays even multiples of what the first round paid
    const last = phases.slice(phases.indexOf(intros[2]!)).filter((p) => p.kind === 'voteReveal');
    for (const r of last) if (r.kind === 'voteReveal') for (const g of Object.values(r.gains)) expect(g % 2).toBe(0);
    room.dispose();
  });

  it('takes no twists when the host turns them off', async () => {
    const room = makeRoom(113, 3);
    room.settings.games = [];
    room.settings.modifiers = false;
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    for (const p of phases) if (p.kind === 'intro') expect(p.modifier).toBeUndefined();
    room.dispose();
  });

  it('lets the audience pick a favourite answer in «Вставь слово» without scoring it', async () => {
    const room = makeRoom(127, 1);
    room.settings.games = ['blank'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const late = fakePhone();
    expect(room.join(late, 'Зритель', 0)).toBeNull();
    const spectator = room.spectatorOf(late)!;
    await until(() => room.phase.kind === 'rushVote', 30_000);
    const phase = room.phase;
    if (phase.kind !== 'rushVote') throw new Error('expected rushVote');
    const target = phase.replies[0]!.player;
    room.handleSpectator(spectator, { t: 'answer', phaseId: room.view().phaseId, value: target });
    await until(() => room.phase.kind === 'rushReveal', 30_000);
    const reveal = room.phase;
    if (reveal.kind !== 'rushReveal') throw new Error('expected reveal');
    expect(reveal.crowd).toEqual({ pick: target, votes: 1, total: 1 });
    for (const r of reveal.replies) expect(r.votes).not.toContain(spectator.id);
    room.dispose();
  });

  it('plays «Стадное чувство», «Дуэль» and «Синхрон» through to their reveals', async () => {
    const room = makeRoom(23, 3);
    room.settings.games = ['herd', 'duel', 'sync'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 30_000, phases);
    expect(seen).toContain('herdReveal');
    expect(seen).toContain('syncReveal');

    const herd = phases.find((p) => p.kind === 'herdReveal');
    if (herd?.kind !== 'herdReveal') throw new Error('no herd reveal');
    const sizes = herd.groups.map((g) => g.players.length);
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
    for (const [id, gain] of Object.entries(herd.gains)) {
      expect(herd.groups.find((g) => g.players.includes(id))!.players.length).toBeGreaterThan(1);
      expect(gain).toBeGreaterThan(0);
    }

    const duel = phases.find((p) => p.kind === 'vote' && p.duel);
    if (duel?.kind !== 'vote') throw new Error('no duel');
    expect(duel.options).toHaveLength(2);
    expect(duel.answered.some((id) => duel.options.includes(id))).toBe(false);

    const sync = phases.find((p) => p.kind === 'syncReveal');
    if (sync?.kind !== 'syncReveal') throw new Error('no sync reveal');
    expect(sync.groups.flat().sort()).toEqual(room.players().map((p) => p.id).sort());
    expect(sync.groups.every((g) => g.length === 2 || g.length === 3)).toBe(true);
    for (const id of Object.keys(sync.gains)) {
      const group = sync.groups.find((g) => g.includes(id))!;
      expect(group.some((o) => o !== id && sync.picks[o] === sync.picks[id])).toBe(true);
    }
    room.dispose();
  });

  it('plays «Горячая картошка» and «Ближе всех» through to their reveals', async () => {
    const room = makeRoom(31, 2);
    room.settings.games = ['bomb', 'closest'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 30_000, phases);
    expect(seen).toContain('bombReveal');
    expect(seen).toContain('closestReveal');

    const boom = phases.find((p) => p.kind === 'bombReveal');
    if (boom?.kind !== 'bombReveal') throw new Error('no bomb reveal');
    expect(boom.gains[boom.loser]).toBeUndefined();
    expect(Object.keys(boom.gains).length).toBeGreaterThan(0);

    const closest = phases.find((p) => p.kind === 'closestReveal');
    if (closest?.kind !== 'closestReveal') throw new Error('no closest reveal');
    const offs = closest.guesses.map((g) => Math.abs(g.value - closest.answer));
    expect(offs).toEqual([...offs].sort((a, b) => a - b));
    for (const g of closest.guesses) {
      if (closest.gains[g.player]) expect(Math.abs(g.value - closest.answer)).toBeLessThanOrEqual(Math.max(2, closest.answer / 2));
    }
    room.dispose();
  });

  it('plays «Битва ответов» with anonymous answers that authors cannot vote on', async () => {
    const room = makeRoom(41, 1);
    room.settings.games = ['quip'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    const seen = await playToEnd(room, 30_000, phases);
    expect(seen).toContain('quipReveal');
    const vote = phases.find((p) => p.kind === 'quipVote');
    const reveal = phases.find((p) => p.kind === 'quipReveal');
    if (vote?.kind !== 'quipVote' || reveal?.kind !== 'quipReveal') throw new Error('no quip');
    expect(JSON.stringify(vote.answers)).not.toMatch(/author/);
    const authors = reveal.answers.map((a) => a.author);
    for (const a of reveal.answers) for (const v of a.votes) expect(authors).not.toContain(v);
    room.dispose();
  });

  it('plays «Крокодил» with a person acting and no drawing', async () => {
    const room = makeRoom(43, 1);
    room.settings.games = ['mime'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 60_000, phases);
    const acts = phases.filter((p) => p.kind === 'guess');
    expect(acts.length).toBeGreaterThan(0);
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    for (const p of acts) {
      if (p.kind !== 'guess') continue;
      expect(p.mime).toBe(true);
      expect(p.artist).toBe(anya);
    }
    room.dispose();
  }, 90_000);

  it('plays «Верю — не верю» and scores only the side that was right', async () => {
    const room = makeRoom(47, 1);
    room.settings.games = ['truth'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const reveals = phases.filter((p) => p.kind === 'truthReveal');
    expect(reveals.length).toBeGreaterThan(0);
    for (const r of reveals) {
      if (r.kind !== 'truthReveal') continue;
      const right = r.truth ? r.believers : r.doubters;
      expect(Object.keys(r.gains).sort()).toEqual([...right].sort());
    }
    room.dispose();
  });

  it('casts a person as the spy and hides the place from them only', async () => {
    const room = makeRoom(53, 1);
    room.settings.games = ['spy'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    await until(() => game.phase.kind === 'spy', 30_000);
    const mine = game.personal(anya);
    const bot = game.personal(room.players().find((p) => p.bot)!.id);
    expect(mine).toMatchObject({ kind: 'spy', spy: true, place: undefined });
    expect(bot.kind === 'spy' && bot.place).toBeTruthy();
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const reveal = phases.find((p) => p.kind === 'spyReveal');
    if (reveal?.kind !== 'spyReveal') throw new Error('no spy reveal');
    expect(reveal.spy).toBe(anya);
    room.dispose();
  });

  it('plays «Заговор»: a person is the target, the word springs the trap and pays the plotters', async () => {
    const room = makeRoom(67, 1);
    room.settings.games = ['plot'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    await until(() => game.phase.kind === 'plot', 30_000);
    const mine = game.personal(anya);
    if (mine.kind !== 'plot') throw new Error('no plot view');
    expect(mine).toMatchObject({ role: 'target', target: anya, word: undefined, plotters: undefined });
    const plotter = room.players().find((p) => game.personal(p.id).kind === 'plot' && (game.personal(p.id) as { role: string }).role === 'plotter')!;
    const seen = game.personal(plotter.id);
    if (seen.kind !== 'plot' || !seen.word) throw new Error('plotter does not see the word');
    expect(seen.chats.map((t) => t.id)).toContain('group:plot');
    expect(mine.chats.some((t) => t.id === 'group:plot')).toBe(false);

    const thread = dmThread(anya, plotter.id);
    expect(game.answer(anya, game.phaseId, { thread, text: `Ну наверное ${seen.word}` })).toBe(true);
    expect(game.phase).toMatchObject({ kind: 'plot', caught: true });
    expect(game.answer(anya, game.phaseId, { thread, text: 'ой' })).toBe(false);

    await until(() => game.phase.kind === 'plotGuess', 30_000);
    const guess = game.phase;
    if (guess.kind !== 'plotGuess') throw new Error('no guess');
    expect(guess.voters).toContain(anya);
    expect(guess.voters).not.toContain(plotter.id);
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const reveal = phases.find((p) => p.kind === 'plotReveal');
    if (reveal?.kind !== 'plotReveal') throw new Error('no plot reveal');
    expect(reveal.slip).toContain(seen.word);
    for (const id of reveal.plotters) expect(reveal.gains[id]).toBeGreaterThanOrEqual(300);
    expect(reveal.gains[anya] ?? 0).toBeLessThan(300);
    room.dispose();
  });

  it('plays «Свидание вслепую»: nights of chat, mutual picks score, quirks are revealed at the end', async () => {
    const room = makeRoom(71, 1);
    room.settings.games = ['date'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    const bot = room.players().find((p) => p.bot)!.id;
    await until(() => game.phase.kind === 'date', 30_000);
    const mine = game.personal(anya);
    if (mine.kind !== 'date') throw new Error('no date view');
    expect(mine.quirk).toBeTruthy();
    expect(mine.left).toBe(DATE_MESSAGES);
    expect(game.answer(anya, game.phaseId, { thread: dmThread(anya, bot), text: 'Привет?' })).toBe(true);

    const phases: Phase[] = [];
    for (let night = 1; night <= 3; night++) {
      await until(() => game.phase.kind === 'datePick' && game.phase.night === night, 30_000);
      expect(game.answer(anya, game.phaseId, anya)).toBe(false);
      expect(game.answer(anya, game.phaseId, bot)).toBe(true);
      await until(() => game.phase.kind === 'dateMatch' && game.phase.night === night, 30_000);
      phases.push(game.phase);
    }
    const last = phases.at(-1);
    if (last?.kind !== 'dateMatch') throw new Error('no final match');
    expect(Object.keys(last.quirks ?? {})).toHaveLength(4);
    for (const p of phases) {
      if (p.kind !== 'dateMatch') continue;
      expect(p.picks[anya]).toBe(bot);
      const mutual = p.picks[bot] === anya;
      expect(p.matches.some((m) => m.includes(anya) && m.includes(bot))).toBe(mutual);
    }
    await playToEnd(room, 30_000);
    room.dispose();
  });

  it('plays «Маскарад»: others see masks only, guesses are checked and scored against the owners', async () => {
    const room = makeRoom(73, 1);
    room.settings.games = ['masq'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    await until(() => game.phase.kind === 'masq', 30_000);
    const owners: string[] = [];
    for (const p of room.players()) {
      const v = game.personal(p.id);
      if (v.kind === 'masq') owners[v.mask] = p.id;
    }
    expect(owners.filter(Boolean)).toHaveLength(4);
    const mine = game.personal(anya);
    if (mine.kind !== 'masq') throw new Error('no masq view');
    expect(game.answer(anya, game.phaseId, { thread: dmThread(anya, owners.find((id) => id !== anya)!), text: 'тсс' })).toBe(false);
    expect(game.answer(anya, game.phaseId, { thread: mine.chats[0]!.id, text: 'Привет всем под масками' })).toBe(true);
    const bot = room.players().find((p) => p.bot)!.id;
    const seen = game.personal(bot);
    if (seen.kind !== 'masq') throw new Error('no bot masq view');
    const hers = seen.chats[0]!.messages.find((m) => m.text === 'Привет всем под масками')!;
    expect(hers.from).toBe(`mask:${mine.mask}`);
    expect(game.personal(anya).kind === 'masq' && game.personal(anya)).toMatchObject({ chats: [{ messages: [{ from: anya }] }] });
    expect(game.phase).toMatchObject({ kind: 'masq', feed: [{ mask: mine.mask, text: 'Привет всем под масками' }] });

    await until(() => game.phase.kind === 'masqGuess', 30_000);
    const right = owners.map((id, i) => (i === mine.mask ? null : id));
    const selfMask = right.map((id, i) => (i === mine.mask ? anya : id));
    expect(game.answer(anya, game.phaseId, selfMask)).toBe(false);
    const twice = right.map((id) => (id === null ? null : owners.find((o) => o !== anya)!));
    expect(game.answer(anya, game.phaseId, twice)).toBe(false);
    expect(game.answer(anya, game.phaseId, right)).toBe(true);
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const reveal = phases.find((p) => p.kind === 'masqReveal');
    if (reveal?.kind !== 'masqReveal') throw new Error('no masq reveal');
    expect(reveal.owners).toEqual(owners);
    expect(reveal.gains[anya]).toBeGreaterThanOrEqual(3 * 60);
    room.dispose();
  });

  it('plays «Сарафанное радио»: retellings join the chains in turn and nobody votes for their own final', async () => {
    const room = makeRoom(79, 1);
    room.settings.games = ['radio'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    // the chains flash by between the steps, so record every phase from the start
    const phases: Phase[] = [];
    const ended = playToEnd(room, 30_000, phases);
    const told: string[] = [];
    for (let step = 1; step <= 4; step++) {
      await until(() => game.phase.kind === 'radio' && game.phase.step === step, 30_000);
      const mine = game.personal(anya);
      if (mine.kind !== 'radio') throw new Error('no radio view');
      expect(mine.original).toBe(step === 1);
      expect(game.answer(anya, game.phaseId, Array.from({ length: RADIO_WORDS_MAX + 1 }, () => 'слово').join(' '))).toBe(false);
      const text = `Пересказ номер ${step}`;
      expect(game.answer(anya, game.phaseId, text)).toBe(true);
      told.push(text);
    }
    await until(() => game.phase.kind === 'radioVote', 30_000);
    const vote = game.personal(anya);
    if (vote.kind !== 'radioVote') throw new Error('no radio vote');
    expect(vote.mine).toHaveLength(1);
    expect(game.answer(anya, game.phaseId, vote.mine[0]!)).toBe(false);
    await ended;
    const shows = phases.filter((p) => p.kind === 'radioShow');
    const chains = shows.map((p) => (p.kind === 'radioShow' ? p.chain : []));
    for (const text of told) expect(chains.filter((c) => c.some((l) => l.author === anya && l.text === text))).toHaveLength(1);
    // a full room of four makes four steps, so each chain met every player once
    for (const c of chains) expect(new Set(c.slice(1).map((l) => l.author)).size).toBe(c.length - 1);
    expect(phases.some((p) => p.kind === 'radioReveal')).toBe(true);
    room.dispose();
  });

  it('plays «Без стёрки»: replies only grow, are typed live and voted on', async () => {
    const room = makeRoom(83, 1);
    room.settings.games = ['rush'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    const phases: Phase[] = [];
    const ended = playToEnd(room, 30_000, phases);
    await until(() => game.phase.kind === 'rush', 30_000);
    expect(game.answer(anya, game.phaseId, { text: 'Сейчас прие' })).toBe(true);
    expect(game.answer(anya, game.phaseId, { text: 'Сейчас при' })).toBe(false);
    expect(game.answer(anya, game.phaseId, { text: 'Сейчас приеду' })).toBe(true);
    expect(game.phase).toMatchObject({ kind: 'rush', texts: { [anya]: 'Сейчас приеду' } });
    expect(game.answer(anya, game.phaseId, { text: 'Сейчас приеду!', final: true })).toBe(true);
    expect(game.answer(anya, game.phaseId, { text: 'Сейчас приеду!!' })).toBe(false);
    expect(game.personal(anya)).toEqual({ kind: 'rush', text: 'Сейчас приеду!', done: true });

    await until(() => game.phase.kind === 'rushVote', 30_000);
    expect(game.answer(anya, game.phaseId, anya)).toBe(false);
    const other = game.phase.kind === 'rushVote' ? game.phase.replies.find((r) => r.player !== anya)!.player : '';
    expect(game.answer(anya, game.phaseId, other)).toBe(true);
    await ended;
    const reveal = phases.find((p) => p.kind === 'rushReveal');
    if (reveal?.kind !== 'rushReveal') throw new Error('no rush reveal');
    expect(reveal.replies.find((r) => r.player === anya)?.text).toBe('Сейчас приеду!');
    expect(reveal.replies.find((r) => r.player === other)?.votes).toContain(anya);
    expect(phases.filter((p) => p.kind === 'rush')).toHaveLength(3);
    room.dispose();
  });

  it('plays «Вставь слово»: everyone fills the gap about one player, then votes for the funniest', async () => {
    const room = makeRoom(84, 1);
    room.settings.games = ['blank'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    const names = room.players().map((p) => p.name);
    const phases: Phase[] = [];
    const ended = playToEnd(room, 30_000, phases);
    await until(() => game.phase.kind === 'write', 30_000);
    const write = game.phase;
    if (write.kind !== 'write') throw new Error('no write');
    expect(write.blank).toBe(true);
    expect(write.prompt).toContain('…');
    expect(write.prompt).not.toContain('{name}');
    expect(names.some((n) => write.prompt.includes(n))).toBe(true);
    expect(game.answer(anya, game.phaseId, 'резиновую уточку')).toBe(true);

    await until(() => game.phase.kind === 'rushVote', 30_000);
    expect(game.answer(anya, game.phaseId, anya)).toBe(false);
    const other = game.phase.kind === 'rushVote' ? game.phase.replies.find((r) => r.player !== anya)!.player : '';
    expect(game.answer(anya, game.phaseId, other)).toBe(true);
    await ended;
    const reveals = phases.filter((p) => p.kind === 'rushReveal');
    expect(reveals).toHaveLength(2);
    const first = reveals[0]!;
    if (first.kind !== 'rushReveal') throw new Error('no reveal');
    expect(first.replies.find((r) => r.player === anya)?.text).toBe('резиновую уточку');
    expect(first.replies.find((r) => r.player === other)?.votes).toContain(anya);
    for (const r of first.replies) expect(first.gains[r.player] ?? 0).toBe(r.votes.length * 100);
    room.dispose();
  });

  it('has the narrator follow the race between rounds: halfway, leaders and the last round', async () => {
    const room = makeRoom(85, 4);
    room.settings.minis = 0;
    room.settings.spotlight = false;
    for (const name of ['Аня', 'Боря', 'Вера']) room.join(fakePhone(), name, 0);
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const said: string[] = [];
    let seen = -1;
    const started = Date.now();
    while (room.phase.kind !== 'final') {
      if (game.phase.kind === 'scores' && game.phaseId !== seen) {
        seen = game.phaseId;
        said.push(game.say ?? '');
      }
      if (game.phase.kind === 'vote') for (const p of room.players()) game.answer(p.id, game.phaseId, room.players()[0]!.id);
      if (Date.now() - started > 60_000) throw new Error('stuck');
      await new Promise((r) => setTimeout(r, 1));
    }
    expect(said).toHaveLength(3);
    const from = (key: keyof typeof narrator) => (s: string) => (narrator[key] as string[]).some((l) => s.includes(fill(l, 'Аня').split('Аня')[0]!));
    expect(said.some(from('halfway'))).toBe(true);
    expect(from('lastRound')(said[2]!) || from('lastRoundClose')(said[2]!)).toBe(true);
    // everyone keeps voting the same, so the scores stay level and the top is shared all game
    expect(said.every(from('leadersTied'))).toBe(true);
    room.dispose();
  });

  it('plays «Рынок слухов»: clues never name the answer, versions score by parts and by order', async () => {
    const room = makeRoom(89, 1);
    room.settings.games = ['market'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    const bot = room.players().find((p) => p.bot)!.id;
    const phases: Phase[] = [];
    const ended = playToEnd(room, 30_000, phases);
    await until(() => game.phase.kind === 'market', 30_000);
    const mine = game.personal(anya);
    if (mine.kind !== 'market') throw new Error('no market view');
    expect(mine.clues).toHaveLength(3);
    const clues = new Map(room.players().map((p) => [p.id, (game.personal(p.id) as { clues: number[] }).clues]));
    expect(game.answer(anya, game.phaseId, { thread: 'group:all', text: 'всем привет' })).toBe(false);
    expect(game.answer(anya, game.phaseId, [0, 0])).toBe(false);
    expect(game.answer(anya, game.phaseId, [0, 0, 9])).toBe(false);
    expect(game.answer(anya, game.phaseId, [0, 1, 2])).toBe(true);
    expect(game.answer(anya, game.phaseId, [1, 1, 1])).toBe(false);
    expect(game.answer(anya, game.phaseId, { thread: dmThread(anya, bot), text: 'Кто: точно не Кот' })).toBe(true);
    expect(game.personal(anya)).toMatchObject({ kind: 'market', guess: [0, 1, 2] });
    await ended;
    const reveal = phases.find((p) => p.kind === 'marketReveal');
    if (reveal?.kind !== 'marketReveal') throw new Error('no market reveal');
    for (const [, c] of clues) c.forEach((clue, k) => expect(clue).not.toBe(reveal.truth[k]));
    const parts = [0, 1, 2].filter((g, k) => g === reveal.truth[k]).length;
    const right = reveal.solved.filter((id) => reveal.guesses[id]!.every((g, k) => g === reveal.truth[k]));
    const expected = parts === 3 ? 300 + [150, 100, 50][right.indexOf(anya)]! : parts * 50;
    expect(reveal.gains[anya] ?? 0).toBe(expected);
    expect(reveal.solved[0]).toBe(anya);
    room.dispose();
  });

  it('doubles a joker and hands everyone a joker for a unanimous vote', async () => {
    const room = makeRoom(107, 1);
    room.settings.minis = 0;
    room.settings.spotlight = false;
    for (const name of ['Аня', 'Боря', 'Вера']) room.join(fakePhone(), name, 0);
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const [anya, borya, vera] = ['Аня', 'Боря', 'Вера'].map((n) => room.players().find((p) => p.name === n)!);
    const phases: Phase[] = [];
    const ended = playToEnd(room, 30_000, phases);
    await until(() => game.phase.kind === 'vote', 30_000);
    expect(game.personal(anya!.id)).toMatchObject({ kind: 'vote', joker: false });
    game.playJoker(anya!.id, game.phaseId);
    expect(anya!.jokers).toBe(2);
    expect(game.personal(anya!.id)).toMatchObject({ joker: true });
    for (const p of [anya!, borya!, vera!]) game.answer(p.id, game.phaseId, anya!.id);
    game.playJoker(borya!.id, game.phaseId);
    expect(borya!.jokers).toBe(3);
    await until(() => game.phase.kind === 'voteReveal', 30_000);
    const reveal = game.phase;
    if (reveal.kind !== 'voteReveal') throw new Error('no vote reveal');
    expect(reveal.unanimous).toBe(true);
    expect(reveal.jokers).toEqual([anya!.id]);
    expect(reveal.gains).toEqual({ [anya!.id]: 300, [borya!.id]: 150, [vera!.id]: 150 });
    expect([anya!.jokers, borya!.jokers, vera!.jokers]).toEqual([3, 4, 4]);
    await ended;
    room.dispose();
  });

  it('gives a joker back when nobody could score or its owner never answered', async () => {
    const room = makeRoom(108, 1);
    room.settings.minis = 0;
    room.settings.spotlight = false;
    for (const name of ['Аня', 'Боря', 'Вера']) room.join(fakePhone(), name, 0);
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const [anya, borya, vera] = ['Аня', 'Боря', 'Вера'].map((n) => room.players().find((p) => p.name === n)!) as [Player, Player, Player];
    const ended = playToEnd(room, 30_000, []);
    await until(() => game.phase.kind === 'vote', 30_000);
    game.playJoker(anya.id, game.phaseId);
    game.playJoker(vera.id, game.phaseId);
    game.answer(anya.id, game.phaseId, borya.id);
    game.answer(borya.id, game.phaseId, vera.id);
    await until(() => game.phase.kind === 'voteReveal', 30_000);
    const reveal = game.phase;
    if (reveal.kind !== 'voteReveal') throw new Error('no vote reveal');
    expect(reveal.jokers ?? []).toEqual([]);
    expect([anya.jokers, vera.jokers]).toEqual([3, 3]);
    await ended;
    room.dispose();
  });

  it('puts two people on one shared team and counts how often they answered alike', async () => {
    const room = makeRoom(109, 1);
    room.settings.minis = 0;
    room.settings.spotlight = false;
    for (const name of ['Аня', 'Боря']) room.join(fakePhone(), name, 0);
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const [anya, borya] = ['Аня', 'Боря'].map((n) => room.players().find((p) => p.name === n)!);
    expect([anya!.team, borya!.team]).toEqual([0, 0]);
    const phases: Phase[] = [];
    const ended = playToEnd(room, 30_000, phases);
    await until(() => game.phase.kind === 'vote', 30_000);
    for (const p of [anya!, borya!]) game.answer(p.id, game.phaseId, borya!.id);
    await ended;
    const final = room.phase;
    if (final.kind !== 'final') throw new Error('no final');
    expect(final.coop?.matched).toBeGreaterThanOrEqual(1);
    expect(final.coop!.asked).toBeGreaterThanOrEqual(final.coop!.matched);
    room.dispose();
  });

  it('splits four or more into two teams with people spread across them', () => {
    const room = makeRoom(113, 1);
    room.settings.teams = true;
    for (const name of ['Аня', 'Боря']) room.join(fakePhone(), name, 0);
    room.addBot();
    room.addBot();
    room.start();
    const people = room.players().filter((p) => !p.bot);
    expect(new Set(people.map((p) => p.team))).toEqual(new Set([0, 1]));
    expect(room.players().filter((p) => p.team === 0)).toHaveLength(2);
    room.dispose();
  });

  for (const mode of ['sumo', 'tag', 'paint'] as const) {
    it(`plays «${{ sumo: 'Сумо', tag: 'Квач', paint: 'Захват' }[mode]}» on the arena and ranks everyone`, async () => {
      const room = new Room('0000', { durations: scaledDurations(0.05), rng: seededRng(127), botPace: 0.05, joinUrl: () => 'http://test/p', httpsAvailable: false });
      room.settings.episodes = 1;
      room.settings.questions = QUESTIONS_MIN;
      room.settings.games = [mode];
      room.settings.minis = 1;
      room.settings.spotlight = false;
      for (let i = 0; i < 4; i++) room.addBot();
      room.start();
      const phases: Phase[] = [];
      await playToEnd(room, 60_000, phases);
      const play = phases.find((p) => p.kind === 'tilt');
      expect(play).toMatchObject({ kind: 'tilt', mode });
      const reveal = phases.find((p) => p.kind === 'brawlReveal');
      if (reveal?.kind !== 'brawlReveal') throw new Error('no brawl reveal');
      expect(reveal.ranking).toHaveLength(4);
      expect(reveal.ranking[0]!.place).toBe(1);
      if (mode === 'tag') {
        // somebody always hunts, so the free seconds add up to less than four whole bouts
        const free = reveal.ranking.reduce((sum, r) => sum + r.seconds, 0);
        expect(free).toBeLessThan(4 * 2);
        for (const r of reveal.ranking) expect(reveal.gains[r.player] ?? 0).toBe(r.seconds * 6);
      } else if (mode === 'paint') {
        expect(play).toMatchObject({ painters: expect.arrayContaining(reveal.ranking.map((r) => r.player)) });
        const areas = reveal.ranking.map((r) => r.area ?? 0);
        expect(areas).toEqual([...areas].sort((a, b) => b - a));
        expect(areas.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(102);
        for (const r of reveal.ranking) expect(reveal.gains[r.player] ?? 0).toBe((r.area ?? 0) * 6 + (r.place === 1 && r.area ? 100 : 0));
      } else {
        const winners = reveal.ranking.filter((r) => r.place === 1);
        for (const r of winners) expect(reveal.gains[r.player]).toBeGreaterThanOrEqual(300);
      }
      room.dispose();
    });
  }

  it('plays «Перетягивание каната»: the team that taps harder per member wins', async () => {
    const room = makeRoom(131, 1);
    room.settings.games = ['tug'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    const phases: Phase[] = [];
    const ended = playToEnd(room, 30_000, phases);
    await until(() => game.phase.kind === 'tug' && Date.now() >= game.phase.startsAt, 30_000);
    const phase = game.phase;
    if (phase.kind !== 'tug') throw new Error('no tug');
    expect(game.personal(anya)).toMatchObject({ kind: 'tug', team: phase.teams[anya] });
    expect(game.answer(anya, game.phaseId, 1)).toBe(true);
    expect(game.answer(anya, game.phaseId, 10_000)).toBe(true);
    expect(phase.counts[anya]).toBeLessThan(10_000);
    await ended;
    const reveal = phases.find((p) => p.kind === 'tugReveal');
    if (reveal?.kind !== 'tugReveal') throw new Error('no tug reveal');
    expect(new Set(Object.values(reveal.teams))).toEqual(new Set([0, 1]));
    if (reveal.winner !== null) for (const [id, t] of Object.entries(reveal.teams)) if (t === reveal.winner) expect(reveal.gains[id]).toBeGreaterThanOrEqual(150);
    room.dispose();
  });

  it('hands a bug report the recent events and the room, without anyone\'s token', async () => {
    let saved: Record<string, unknown> | null = null;
    const room = new Room('0000', {
      durations: scaledDurations(0.004),
      rng: seededRng(137),
      botPace: 0.004,
      joinUrl: () => 'http://test/p',
      httpsAvailable: false,
      report: async (_code, data) => {
        saved = data as Record<string, unknown>;
        return { dir: '/tmp/report', screenshot: false };
      },
    });
    room.settings.minis = 0;
    room.join(fakePhone(), 'Аня', 0);
    room.addBot();
    room.start();
    await until(() => room.phase.kind === 'vote', 30_000);
    await new Promise((r) => setTimeout(r, 30));
    room.handleHost({ t: 'host.report', client: { agent: 'test', width: 1, height: 1, dpr: 1 } });
    await until(() => saved !== null);
    const journal = (saved!.journal as { what: string }[]).map((e) => e.what);
    expect(journal.some((w) => w.includes('vote'))).toBe(true);
    expect(JSON.stringify(saved)).not.toContain(room.players()[0]!.token);
    room.dispose();
  });

  it('keeps the winning lines as moments, one of each kind first', () => {
    const quip = momentOf({
      kind: 'quipReveal',
      prompt: 'Худший подарок',
      answers: [
        { id: '1', text: 'Носки', author: 'a', votes: [] },
        { id: '2', text: 'Ёжик', author: 'b', votes: ['c'] },
      ],
      gains: {},
    });
    expect(quip).toMatchObject({ text: 'Ёжик', players: ['b'] });
    expect(momentOf({ kind: 'quipReveal', prompt: 'x', answers: [{ id: '1', text: 'Носки', author: 'a', votes: [] }], gains: {} })).toBeNull();
    const many = [...Array.from({ length: 9 }, (_, i) => ({ ...quip!, text: `q${i}` })), { icon: '🧊', label: 'l', text: 't', players: [] }];
    const picked = pickMoments(many);
    expect(picked).toHaveLength(4);
    expect(picked.slice(0, 2).map((m) => m.icon).sort()).toEqual(['💬', '🧊']);
    expect(picked.map((m) => m.text)).toEqual(['t', 'q8', 'q7', 'q6']);
  });

  it('plays «Волна»: only the hint-giver writes, marks pay by distance and the hint-giver gets the average', async () => {
    const room = makeRoom(97, 1);
    room.settings.games = ['wave'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    const phases: Phase[] = [];
    const ended = playToEnd(room, 30_000, phases);
    await until(() => game.phase.kind === 'waveHint' && game.phase.psychic !== anya, 30_000);
    expect(game.answer(anya, game.phaseId, 'мороженое')).toBe(false);
    expect(game.personal(anya)).toEqual({ kind: 'none' });
    await until(() => game.phase.kind === 'waveGuess' && game.phase.psychic !== anya, 30_000);
    expect(game.answer(anya, game.phaseId, 101)).toBe(false);
    expect(game.answer(anya, game.phaseId, 50)).toBe(true);
    await ended;
    const reveals = phases.filter((p) => p.kind === 'waveReveal');
    expect(reveals).toHaveLength(3);
    for (const r of reveals) {
      if (r.kind !== 'waveReveal') continue;
      const earned = Object.entries(r.guesses).map(([, g]) => wavePoints(g, r.target));
      const average = Math.round(earned.reduce((a, b) => a + b, 0) / earned.length / 10) * 10;
      expect(r.gains[r.psychic] ?? 0).toBe(average);
      for (const [id, g] of Object.entries(r.guesses)) expect(r.gains[id] ?? 0).toBe(wavePoints(g, r.target));
    }
    room.dispose();
  });

  it('plays «По порядку»: numbers stay secret, orders must hold every card and score by right pairs', async () => {
    const room = makeRoom(101, 1);
    room.settings.games = ['order'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    const phases: Phase[] = [];
    const ended = playToEnd(room, 30_000, phases);
    await until(() => game.phase.kind === 'orderWrite', 30_000);
    const mine = game.personal(anya);
    if (mine.kind !== 'orderWrite') throw new Error('no order view');
    expect(mine.number).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(game.phase)).not.toContain(`"number"`);
    expect(game.answer(anya, game.phaseId, 'Тёплый чай')).toBe(true);
    expect(game.answer(anya, game.phaseId, 'Ещё раз')).toBe(false);
    await until(() => game.phase.kind === 'orderSort', 30_000);
    const cards = game.phase.kind === 'orderSort' ? game.phase.cards.map((c) => c.player) : [];
    expect(game.answer(anya, game.phaseId, cards.slice(1))).toBe(false);
    expect(game.answer(anya, game.phaseId, cards)).toBe(true);
    await ended;
    const reveal = phases.find((p) => p.kind === 'orderReveal');
    if (reveal?.kind !== 'orderReveal') throw new Error('no order reveal');
    expect(reveal.cards.find((c) => c.player === anya)?.text).toBe('Тёплый чай');
    const numbers = reveal.cards.map((c) => c.number);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    const byPlayer = new Map(reveal.cards.map((c) => [c.player, c.number]));
    const own = Math.round((orderAccuracy(cards, byPlayer) * 200) / 10) * 10;
    expect(reveal.gains[anya] ?? 0).toBeGreaterThanOrEqual(own);
    room.dispose();
  });

  it('plays «Замри!»: a touch during the pause or a still finger in the song puts a player out', async () => {
    const room = new Room('0000', {
      durations: scaledDurations(0.03),
      rng: seededRng(103),
      botPace: 0.03,
      joinUrl: () => 'http://test/p',
      httpsAvailable: false,
    });
    room.settings.episodes = 1;
    room.settings.questions = QUESTIONS_MIN;
    room.settings.games = ['freeze'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    room.join(fakePhone(), 'Боря', 0);
    room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const [anya, borya] = ['Аня', 'Боря'].map((n) => room.players().find((p) => p.name === n)!.id) as [string, string];
    const phases: Phase[] = [];
    const ended = playToEnd(room, 60_000, phases);
    await until(() => game.phase.kind === 'freeze' && game.phase.stage === 'music', 60_000);
    expect(game.answer(anya, game.phaseId, [1, 1e9])).toBe(true);
    expect(game.answer(anya, game.phaseId, [2, 1e9])).toBe(false);
    await until(() => game.phase.kind === 'freeze' && game.phase.stage === 'freeze', 60_000);
    await new Promise((r) => setTimeout(r, 40));
    expect(game.answer(anya, game.phaseId, 'moved:1')).toBe(true);
    await ended;
    const reveal = phases.find((p) => p.kind === 'freezeReveal');
    if (reveal?.kind !== 'freezeReveal') throw new Error('no freeze reveal');
    expect(reveal.out).toContainEqual({ player: anya, round: 1, why: 'moved' });
    expect(reveal.out).toContainEqual({ player: borya, round: 1, why: 'lazy' });
    expect(reveal.gains[anya] ?? 0).toBe(0);
    room.dispose();
  });

  it('plays «Три слова»: refuses clues that give the word away and pays guessers and the author', async () => {
    const room = makeRoom(61, 1);
    room.settings.games = ['clue'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    await until(() => game.phase.kind === 'write', 30_000);
    const me = game.personal(anya);
    if (me.kind !== 'write' || !me.prompt) throw new Error('no secret word');
    expect(game.answer(anya, game.phaseId, `это ${me.prompt}`)).toBe(false);
    expect(game.answer(anya, game.phaseId, 'раз два три четыре')).toBe(false);
    expect(game.answer(anya, game.phaseId, 'очень хорошая вещь')).toBe(true);

    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const reveals = phases.filter((p) => p.kind === 'clueReveal');
    expect(reveals.length).toBe(4);
    for (const r of reveals) {
      if (r.kind !== 'clueReveal') continue;
      expect(r.options).toContain(r.word);
      const right = Object.keys(r.picks).filter((id) => r.picks[id] === r.word);
      for (const id of right) expect(r.gains[id]).toBe(100);
      expect(r.gains[r.author] ?? 0).toBe(right.length * 50);
      expect(r.picks[r.author]).toBeUndefined();
    }
    room.dispose();
  });

  it('plays «Сокровища»: leavers bank their gems, a repeated trap empties the bags inside', async () => {
    const room = makeRoom(67, 1);
    room.settings.games = ['treasure'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const reveals = phases.filter((p) => p.kind === 'treasureReveal');
    expect(reveals.length).toBe(2);
    for (const r of reveals) {
      if (r.kind !== 'treasureReveal') continue;
      for (const id of r.lost) expect(r.haul[id]).toBeUndefined();
      for (const [id, gems] of Object.entries(r.haul)) expect(r.gains[id] ?? 0).toBe(gems * 10);
    }
    // until a bust, every gem turned over is in a bag, on the path, or already carried out
    const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);
    let start = 0;
    let expedition = 0;
    for (const p of phases) {
      if (p.kind !== 'treasure' || p.bust) continue;
      if (p.expedition !== expedition) [expedition, start] = [p.expedition, sum(p.banked)];
      const dealt = p.path.reduce((n, c) => n + ('gems' in c ? c.gems : 0), 0);
      const bags = p.inside.reduce((n, id) => n + (p.carried[id] ?? 0), 0);
      expect(bags + p.loose + sum(p.banked) - start).toBe(dealt);
    }
    for (const p of phases) {
      if (p.kind !== 'treasure' || p.stage !== 'card' || !p.bust) continue;
      const traps = p.path.filter((c) => 'trap' in c && c.trap === p.bust);
      expect(traps.length).toBe(2);
    }
    room.dispose();
  });

  it('only takes a treasure decision from someone still in the cave, while deciding', () => {
    const room = makeRoom(71, 1);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const ids = room.players().map((p) => p.id);
    const base = { kind: 'treasure', expedition: 1, expeditions: 1, path: [], left: [], carried: {}, banked: {}, loose: 0, answered: [] } as const;
    (game as unknown as { phase: Phase }).phase = { ...base, stage: 'choose', inside: [ids[0]!], path: [], left: [], answered: [] };
    expect(game.answer(ids[1]!, game.phaseId, 1)).toBe(false);
    expect(game.answer(ids[0]!, game.phaseId, 2)).toBe(false);
    expect(game.answer(ids[0]!, game.phaseId, 0)).toBe(true);
    (game as unknown as { phase: Phase }).phase = { ...base, stage: 'card', inside: [ids[1]!], path: [], left: [], answered: [] };
    expect(game.answer(ids[1]!, game.phaseId, 1)).toBe(false);
    room.dispose();
  });

  it('plays «Кто больше»: one entry per answer, three times the points for nobody else’s', async () => {
    const room = makeRoom(73, 1);
    room.settings.games = ['list'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    await until(() => game.phase.kind === 'list', 30_000);
    expect(game.answer(anya, game.phaseId, ['Ёжик', 'ежик!', '  ', 'кактус'])).toBe(true);
    expect(game.answer(anya, game.phaseId, ['Ёжик', 'ежик!', 'кактус', 'зонтик-трость'])).toBe(true);
    expect(game.personal(anya)).toEqual({ kind: 'list', items: ['Ёжик', 'кактус', 'зонтик-трость'] });
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const reveals = phases.filter((p) => p.kind === 'listReveal');
    expect(reveals.length).toBe(2);
    for (const r of reveals) {
      if (r.kind !== 'listReveal') continue;
      const expected: Record<string, number> = {};
      for (const item of r.items) for (const id of item.by) expected[id] = (expected[id] ?? 0) + (item.by.length === 1 ? 30 : 10);
      expect(r.gains).toEqual(expected);
    }
    const first = reveals[0];
    if (first?.kind !== 'listReveal') throw new Error('no list reveal');
    expect(first.items.filter((i) => i.by.includes(anya)).map((i) => i.text)).toEqual(expect.arrayContaining(['Ёжик', 'кактус']));
    room.dispose();
  });

  it('plays «Цу-е-фа» down to one champion, with byes and rethrows', async () => {
    const room = makeRoom(79, 1);
    room.settings.games = ['rps'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 5; i++) room.addBot();
    room.start();
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    const reveals = phases.filter((p) => p.kind === 'rpsReveal');
    const champions = reveals.flatMap((r) => (r.kind === 'rpsReveal' && r.champion ? [r.champion] : []));
    expect(champions).toHaveLength(1);
    const beats = { rock: 'scissors', scissors: 'paper', paper: 'rock' } as const;
    for (const r of reveals) {
      if (r.kind !== 'rpsReveal') continue;
      for (const m of r.matches) {
        if (m.ta && m.tb && m.ta !== m.tb) expect(m.winner).toBe(beats[m.ta] === m.tb ? m.a : m.b);
        if (m.winner) expect(r.gains[m.winner]).toBeGreaterThanOrEqual(50);
      }
    }
    const final = reveals.find((r) => r.kind === 'rpsReveal' && r.champion);
    if (final?.kind !== 'rpsReveal') throw new Error('no final');
    expect(final.gains[final.champion!]).toBe(200);
    room.dispose();
  });

  it('lets a phone that reconnected mid-round into «Кто больше», but not one-letter mashing', async () => {
    const room = makeRoom(83, 1);
    room.settings.games = ['list'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    const anya = room.players().find((p) => p.name === 'Аня')!;
    room.start();
    const game = (room as unknown as { game: Game }).game;
    anya.connected = false;
    await until(() => game.phase.kind === 'list', 30_000);
    anya.connected = true;
    expect(game.answer(anya.id, game.phaseId, ['а', 'б', 'кот', ...Array.from({ length: 100 }, (_, i) => `слово${i}`)])).toBe(true);
    const me = game.personal(anya.id);
    if (me.kind !== 'list') throw new Error('no list');
    expect(me.items[0]).toBe('кот');
    expect(me.items).toHaveLength(30);
    room.dispose();
  });

  it('gives a walkover in «Цу-е-фа» when somebody has left, without waiting or paying the absent', async () => {
    const room = makeRoom(89, 1);
    room.settings.games = ['rps'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 4; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    await until(() => game.phase.kind === 'rps', 30_000);
    const gone = room.players()[0]!;
    gone.connected = false;
    const phases: Phase[] = [];
    await playToEnd(room, 30_000, phases);
    for (const p of phases) {
      if (p.kind !== 'rpsReveal') continue;
      expect(p.gains[gone.id]).toBeUndefined();
      for (const m of p.matches) if (m.walkover && m.b) expect(m.winner).not.toBe(gone.id);
    }
    expect(phases.some((p) => p.kind === 'rpsReveal' && p.champion)).toBe(true);
    room.dispose();
  });

  it('only lets the holder pass the bomb, and never straight back', () => {
    const room = makeRoom(32, 1);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const ids = room.players().map((p) => p.id);
    (game as unknown as { phase: Phase }).phase = { kind: 'bomb', category: 'x', holder: ids[0]!, round: 1, rounds: 1, passes: 0, startedAt: 0 };
    const id = game.phaseId;
    (game as unknown as { bombPassedAt: number }).bombPassedAt = 0;
    expect(game.answer(ids[1]!, id, ids[2]!)).toBe(false);
    expect(game.answer(ids[0]!, id, ids[0]!)).toBe(false);
    expect(game.answer(ids[0]!, id, ids[1]!)).toBe(true);
    (game as unknown as { bombPassedAt: number }).bombPassedAt = 0;
    expect(game.answer(ids[1]!, id, ids[0]!)).toBe(false);
    room.dispose();
  });

  it('does not wait for players who dropped off', async () => {
    const room = makeRoom(99, 1);
    room.addBot();
    room.addBot();
    room.addBot();
    room.players()[2]!.connected = false;
    room.start();
    await playToEnd(room);
    room.dispose();
  });

  it('returns to a clean lobby for another round', async () => {
    const room = makeRoom(5, 1);
    room.addBot();
    room.addBot();
    room.start();
    await playToEnd(room);
    room.again();
    expect(room.phase.kind).toBe('lobby');
    expect(room.players().every((p) => p.score === 0)).toBe(true);
    room.dispose();
  });
});

describe('pause', () => {
  it('freezes the clock and shifts the deadline on resume', async () => {
    const room = new Room('0001', {
      durations: scaledDurations(0.02),
      rng: seededRng(3),
      botPace: 100,
      joinUrl: () => '',
      httpsAvailable: false,
    });
    room.settings.episodes = 1;
    room.addBot();
    room.addBot();
    room.start();
    while (room.phase.kind !== 'vote') await new Promise((r) => setTimeout(r, 5));
    const before = (room.phase as Extract<Phase, { kind: 'vote' }>).deadline;
    room.handleHost({ t: 'host.pause', paused: true });
    await new Promise((r) => setTimeout(r, 800));
    expect(room.phase.kind).toBe('vote');
    room.handleHost({ t: 'host.pause', paused: false });
    const after = (room.phase as Extract<Phase, { kind: 'vote' }>).deadline;
    expect(after - before).toBeGreaterThanOrEqual(750);
    room.dispose();
  });

  it('keeps the phase open while paused even when everyone has answered', async () => {
    const room = new Room('0002', {
      durations: scaledDurations(0.02),
      rng: seededRng(4),
      botPace: 0.001,
      joinUrl: () => '',
      httpsAvailable: false,
    });
    room.settings.episodes = 1;
    room.addBot();
    room.addBot();
    room.start();
    while (room.phase.kind !== 'vote') await new Promise((r) => setTimeout(r, 1));
    room.handleHost({ t: 'host.pause', paused: true });
    await new Promise((r) => setTimeout(r, 400));
    expect(room.phase.kind).toBe('vote');
    room.handleHost({ t: 'host.pause', paused: false });
    while (room.phase.kind === 'vote') await new Promise((r) => setTimeout(r, 5));
    room.dispose();
  });
});

describe('humans never wait for bots', () => {
  it('ends a question right after the only human answers, while bots would still be thinking', async () => {
    const room = new Room('0003', {
      durations: scaledDurations(0.2),
      rng: seededRng(8),
      botPace: 1,
      joinUrl: () => '',
      httpsAvailable: false,
    });
    room.settings.episodes = 1;
    // «Кто соврал?» waits on one writer only, which may be a bot, so keep to questions everyone answers
    room.settings.games = ['predict', 'quote'];
    expect(room.join(fakePhone(), 'Аня', 0)).toBeNull();
    room.addBot();
    room.addBot();
    room.start();
    // every plan opens with a question of some kind
    await until(() => ['vote', 'predict', 'write'].includes(room.phase.kind));
    const phase = room.phase;
    const human = room.players().find((p) => !p.bot)!;
    const value =
      phase.kind === 'vote' ? phase.options.find((id) => id !== human.id)! : phase.kind === 'predict' ? 0 : 'кактус';
    const answeredAt = Date.now();
    room.handlePlayer(human, { t: 'answer', phaseId: room.view().phaseId, value });
    // all answers are in, yet the narrator is still reading the question
    await new Promise((r) => setTimeout(r, 400));
    expect(room.phase).toBe(phase);
    room.handleHost({ t: 'host.spoken', phaseId: room.view().phaseId });
    await until(() => room.phase !== phase);
    // bots think for seconds and the question stays open for 5+ s; only hurrying explains a quick finish
    expect(Date.now() - answeredAt).toBeLessThan(1500);
    room.dispose();
  });

  it('freezes bots while paused', async () => {
    const room = new Room('0004', {
      durations: scaledDurations(0.2),
      rng: seededRng(9),
      botPace: 0.05,
      joinUrl: () => '',
      httpsAvailable: false,
    });
    room.settings.episodes = 1;
    room.settings.games = ['predict', 'quote'];
    room.addBot();
    room.addBot();
    room.start();
    await until(() => ['vote', 'predict', 'write'].includes(room.phase.kind));
    const phase = room.phase;
    room.handleHost({ t: 'host.pause', paused: true });
    await new Promise((r) => setTimeout(r, 700));
    const progress = phase.kind === 'write' ? phase.done : 'answered' in phase ? phase.answered : [];
    expect(progress).toHaveLength(0);
    room.handleHost({ t: 'host.pause', paused: false });
    await until(() => room.phase !== phase);
    room.dispose();
  });
});

describe('rules cards', () => {
  it('explains each mini-game once and moves on as soon as the people have read it', async () => {
    const room = new Room('0005', {
      durations: scaledDurations(0.05),
      rng: seededRng(10),
      botPace: 0.05,
      joinUrl: () => '',
      httpsAvailable: false,
    });
    room.settings.episodes = 2;
    room.settings.games = ['predict'];
    room.settings.spotlight = false;
    expect(room.join(fakePhone(), 'Аня', 0)).toBeNull();
    room.addBot();
    room.addBot();
    room.start();
    await until(() => room.phase.kind === 'rules', 30_000);
    const phase = room.phase;
    if (phase.kind !== 'rules') throw new Error('expected rules');
    expect(phase.game).toBe('predict');
    const human = room.players().find((p) => !p.bot)!;
    room.handlePlayer(human, { t: 'answer', phaseId: room.view().phaseId, value: 'ready' });
    await until(() => room.phase !== phase);
    // only the tap explains leaving the card before its own deadline
    expect(Date.now()).toBeLessThan(phase.deadline);

    let rulesShown = 1;
    let last = room.phase;
    while (room.phase.kind !== 'final') {
      if (room.phase !== last) {
        last = room.phase;
        if (last.kind === 'rules') rulesShown++;
        if (last.kind === 'predict' || last.kind === 'vote') {
          const value = last.kind === 'predict' ? 0 : last.options.find((id) => id !== human.id)!;
          room.handlePlayer(human, { t: 'answer', phaseId: room.view().phaseId, value });
        }
      }
      await new Promise((r) => setTimeout(r, 2));
    }
    expect(rulesShown).toBe(1);
    room.dispose();
  }, 60_000);
});

describe('audience', () => {
  it('lets a latecomer vote without points and seats them for the next round', async () => {
    const room = new Room('0006', {
      durations: scaledDurations(0.05),
      rng: seededRng(11),
      botPace: 0.05,
      joinUrl: () => '',
      httpsAvailable: false,
    });
    room.settings.episodes = 1;
    room.settings.games = [];
    room.addBot();
    room.addBot();
    room.start();
    const late = fakePhone();
    expect(room.join(late, 'Зритель', 0)).toBeNull();
    expect(room.players().map((p) => p.name)).not.toContain('Зритель');
    expect(room.view().audience).toBe(1);
    const spectator = room.spectatorOf(late)!;

    await until(() => room.phase.kind === 'vote' && !room.phase.quote);
    const phase = room.phase;
    if (phase.kind !== 'vote') throw new Error('expected vote');
    const target = phase.options[0]!;
    room.handleSpectator(spectator, { t: 'answer', phaseId: room.view().phaseId, value: target });
    await until(() => room.phase.kind === 'voteReveal');
    const reveal = room.phase;
    if (reveal.kind !== 'voteReveal') throw new Error('expected reveal');
    expect(reveal.crowd).toEqual({ pick: target, votes: 1, total: 1 });
    expect(reveal.votes.some((v) => v.from === spectator.id)).toBe(false);

    await until(() => room.phase.kind === 'final', 20_000);
    room.again();
    const seated = room.players().find((p) => p.name === 'Зритель');
    expect(seated?.id).toBe(spectator.id);
    expect(room.playerOf(late)).toBe(seated);
    expect(room.view().audience).toBe(0);
    room.dispose();
  }, 30_000);
});

describe('draw from a description', () => {
  it('keeps the scene on the describer’s phone only and pays them the artists’ average', async () => {
    const room = new Room('0007', {
      durations: scaledDurations(0.05),
      rng: seededRng(12),
      botPace: 0.05,
      joinUrl: () => '',
      httpsAvailable: false,
    });
    room.settings.episodes = 1;
    room.settings.games = ['describe'];
    expect(room.join(fakePhone(), 'Аня', 0)).toBeNull();
    room.addBot();
    room.addBot();
    room.start();
    await until(() => room.phase.kind === 'draw');
    const phase = room.phase;
    if (phase.kind !== 'draw') throw new Error('expected draw');
    const human = room.players().find((p) => !p.bot)!;
    // people go first, so the only human describes
    expect(phase.describer).toBe(human.id);
    expect(phase.prompt).toBe('');
    const view = room.playerView(human.id, room.view());
    expect(view.personal.kind).toBe('describe');
    if (view.personal.kind === 'describe') expect(view.personal.scene.length).toBeGreaterThan(5);
    room.handlePlayer(human, { t: 'ink', phaseId: room.view().phaseId, op: { k: 'end', s: { c: '#000000', w: 8, p: [1, 1, 50, 50] } } });

    await until(() => room.phase.kind === 'galleryReveal', 20_000);
    const reveal = room.phase;
    if (reveal.kind !== 'galleryReveal') throw new Error('expected reveal');
    expect(reveal.items.length).toBeGreaterThan(0);
    for (const item of reveal.items) expect(item.authors).not.toContain(human.id);
    const total = Object.values(reveal.gains).reduce((a, b) => a + b, 0);
    const before = human.score;
    await until(() => room.phase !== reveal, 20_000);
    expect(human.score - before).toBe(Math.round(total / reveal.items.length));
    room.dispose();
  }, 30_000);
});

describe('team star fall', () => {
  it('splits four or more players into two even teams and pays the winners a bonus', async () => {
    let checked = false;
    for (let seed = 1; seed <= 12 && !checked; seed++) {
      const room = new Room('0008', {
        durations: scaledDurations(0.05),
        rng: seededRng(seed),
        botPace: 0.05,
        joinUrl: () => '',
        httpsAvailable: false,
      });
      room.settings.episodes = 1;
      room.settings.games = ['tilt'];
      for (let i = 0; i < 5; i++) room.addBot();
      room.start();
      await until(() => room.phase.kind === 'tilt', 20_000);
      const phase = room.phase;
      if (phase.kind !== 'tilt' || !phase.teams) {
        room.dispose();
        continue;
      }
      const sides = Object.values(phase.teams);
      expect(Math.abs(sides.filter((t) => t === 0).length - sides.filter((t) => t === 1).length)).toBeLessThanOrEqual(1);
      await until(() => room.phase.kind === 'tiltReveal', 20_000);
      const reveal = room.phase;
      if (reveal.kind !== 'tiltReveal' || !reveal.teamStars) throw new Error('expected a team reveal');
      const total = Object.values(reveal.stars).reduce((a, b) => a + b, 0);
      expect(reveal.teamStars[0] + reveal.teamStars[1]).toBe(total);
      if (reveal.winner != null) {
        for (const [id, team] of Object.entries(reveal.teams!)) {
          if (team === reveal.winner) expect(reveal.gains[id]).toBeGreaterThanOrEqual(100);
        }
      }
      checked = true;
      room.dispose();
    }
    expect(checked).toBe(true);
  }, 120_000);
});

describe('VIP', () => {
  it('passes the crown on when the VIP stays away, and the TV can hand it out too', () => {
    vi.useFakeTimers();
    try {
      const room = makeRoom(13, 1);
      const anya = fakePhone();
      const borya = fakePhone();
      room.join(anya, 'Аня', 0);
      room.join(borya, 'Боря', 1);
      const [a, b] = room.players();
      expect(a!.vip).toBe(true);
      room.disconnect(anya);
      vi.advanceTimersByTime(19_000);
      expect(a!.vip).toBe(true);
      vi.advanceTimersByTime(2000);
      expect(a!.vip).toBe(false);
      expect(b!.vip).toBe(true);
      room.handleHost({ t: 'host.vip', player: a!.id });
      expect(room.players().filter((p) => p.vip).map((p) => p.name)).toEqual(['Аня']);
      room.dispose();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('custom questions', () => {
  it('asks the room’s own questions first, once each, and keeps one phone from flooding them', async () => {
    const room = makeRoom(14, 1);
    room.settings.games = [];
    const ws = fakePhone();
    room.join(ws, 'Аня', 0);
    const anya = room.players()[0]!;
    room.addBot();
    room.handlePlayer(anya, { t: 'question', text: '  Кто из нас   съест весь торт ' });
    room.handlePlayer(anya, { t: 'question', text: 'Кто из нас съест весь торт?' });
    room.handleHost({ t: 'host.question', text: 'Кто первым уснёт сегодня?' });
    room.handleHost({ t: 'host.question', text: 'ой' });
    expect(room.view().customCount).toBe(2);
    for (let i = 0; i < 12; i++) room.handlePlayer(anya, { t: 'question', text: `Кто из нас номер ${i}?` });
    expect(room.view().customCount).toBe(2 + 7);
    const extra = room.decks.custom.filter((q) => q.text.includes('номер')).map((q) => q.id);
    for (const id of extra) room.handleHost({ t: 'host.dropQuestion', id });

    room.start();
    const asked: string[] = [];
    let last = room.phase;
    while (room.phase.kind !== 'final') {
      if (room.phase !== last) {
        last = room.phase;
        if (last.kind === 'vote' && !last.quote) asked.push(`${last.custom ? '+' : '-'}${last.question}`);
      }
      await new Promise((r) => setTimeout(r, 2));
    }
    expect(asked.slice(0, 2).sort()).toEqual(['+Кто из нас съест весь торт?', '+Кто первым уснёт сегодня?']);
    expect(asked.slice(2).every((q) => q.startsWith('-'))).toBe(true);
    room.dispose();
  }, 30_000);
});

describe('scale and story', () => {
  it('scores scale guesses by distance and builds a story only from its authors', async () => {
    const room = makeRoom(15, 2);
    room.settings.games = ['scale', 'story'];
    const ws = fakePhone();
    room.join(ws, 'Аня', 0);
    const anya = room.players()[0]!;
    room.addBot();
    room.addBot();
    room.start();

    let scaled = false;
    let told = false;
    let last = room.phase;
    while (room.phase.kind !== 'final') {
      const phase = room.phase;
      if (phase !== last) {
        last = phase;
        const phaseId = room.view().phaseId;
        if (phase.kind === 'scale') room.handlePlayer(anya, { t: 'answer', phaseId, value: phase.target === anya.id ? 7 : 3 });
        if (phase.kind === 'write' && phase.story) {
          const writer = phase.author === anya.id;
          room.handlePlayer(anya, { t: 'answer', phaseId, value: 'И тут пришёл Бублик.' });
          expect(phase.done.includes(anya.id)).toBe(writer);
        }
        if (phase.kind === 'scaleReveal' && phase.truth !== null) {
          scaled = true;
          for (const g of phase.guesses) {
            const expected = [100, 60, 30][Math.abs(g.value - phase.truth)] ?? 0;
            expect(phase.gains[g.player] ?? 0).toBe(expected);
          }
        }
        if (phase.kind === 'storyReveal') {
          told = true;
          expect(phase.lines[0]!.author).toBeUndefined();
          expect(phase.lines.length).toBeGreaterThanOrEqual(3);
        }
      }
      await new Promise((r) => setTimeout(r, 2));
    }
    expect(scaled).toBe(true);
    expect(told).toBe(true);
    room.dispose();
  }, 60_000);
});

describe('evening', () => {
  it('counts games and first places across rematches', async () => {
    const room = makeRoom(16, 1);
    room.addBot();
    room.addBot();
    for (let game = 1; game <= 2; game++) {
      room.start();
      await playToEnd(room);
      const phase = room.phase;
      if (phase.kind !== 'final') throw new Error('expected final');
      expect(phase.evening.games).toBe(game);
      const winners = phase.rows.filter((r) => r.place === 1).length;
      expect(phase.evening.wins.reduce((n, w) => n + w.count, 0)).toBeGreaterThanOrEqual(winners);
      room.again();
    }
    room.dispose();
  }, 60_000);
});

describe('TV dropping off', () => {
  it('pauses the game after a grace period and resumes when the TV is back', () => {
    vi.useFakeTimers();
    try {
      const room = makeRoom(17, 1);
      const tv = fakePhone();
      room.attachHost(tv);
      for (let i = 0; i < 3; i++) room.addBot();
      room.start();
      room.detachHost(tv);
      vi.advanceTimersByTime(4000);
      expect(room.view().paused).toBe(false);
      vi.advanceTimersByTime(2000);
      expect(room.view().paused).toBe(true);
      room.attachHost(fakePhone());
      expect(room.view().paused).toBe(false);
      room.dispose();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('rejoining without a token', () => {
  it('gives a dropped player their own seat back by name, with the score intact', () => {
    const room = makeRoom(19, 1);
    const old = fakePhone();
    room.join(old, 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const anya = room.players().find((p) => p.name === 'Аня')!;
    anya.score = 120;
    room.disconnect(old);
    expect(room.join(fakePhone(), 'аня', 3)).toBeNull();
    const back = room.players().filter((p) => p.name === 'Аня');
    expect(back).toHaveLength(1);
    expect(back[0]!.connected).toBe(true);
    expect(back[0]!.score).toBe(120);
    expect(room.join(fakePhone(), 'Аня', 3)).toMatchObject({ code: 'name_taken' });
    room.dispose();
  });
});

describe('pause', () => {
  it('does not stretch the next phase when the host skips while paused', async () => {
    vi.useFakeTimers();
    try {
      const room = makeRoom(23, 1);
      for (let i = 0; i < 3; i++) room.addBot();
      room.start();
      const game = (room as unknown as { game: Game }).game;
      game.setPaused(true);
      vi.advanceTimersByTime(60_000);
      const skipped = game.phaseId;
      game.skip();
      await vi.advanceTimersByTimeAsync(0);
      expect(game.phaseId).toBeGreaterThan(skipped);
      const phase = game.phase;
      const before = 'deadline' in phase ? phase.deadline : undefined;
      vi.advanceTimersByTime(5000);
      game.setPaused(false);
      const after = 'deadline' in game.phase ? game.phase.deadline : undefined;
      if (before !== undefined && after !== undefined) expect(after - before).toBeLessThanOrEqual(5000);
      room.dispose();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('reconnecting mid-drawing', () => {
  it('sends the drawing so far right after the view, once', () => {
    vi.useFakeTimers();
    try {
      const room = makeRoom(29, 1);
      const sent: string[] = [];
      const phone = { readyState: 1, OPEN: 1, send: (m: string) => sent.push(m), close: () => undefined } as unknown as WebSocket;
      room.join(fakePhone(), 'Аня', 0);
      for (let i = 0; i < 3; i++) room.addBot();
      room.start();
      const game = (room as unknown as { game: Game }).game;
      const artist = room.players().find((p) => p.bot)!.id;
      const stroke = { c: '#1b1033', w: 10, p: [1, 2, 3, 4] };
      (game as unknown as { phase: Phase }).phase = {
        kind: 'guess', artist, hint: '_', round: 0, rounds: 1, deadline: 0, board: { w: 1600, h: 1000 }, solved: [], feed: [],
      };
      (game as unknown as { inks: Map<string, unknown[]> }).inks.set(artist, [stroke]);
      const token = room.players().find((p) => p.name === 'Аня')!.token;
      room.resume(phone, token);
      vi.advanceTimersByTime(50);
      const kinds = sent.map((m) => (JSON.parse(m) as { t: string }).t);
      expect(kinds.indexOf('inkFull')).toBeGreaterThan(kinds.indexOf('me'));
      room.changed();
      vi.advanceTimersByTime(50);
      expect(sent.map((m) => (JSON.parse(m) as { t: string }).t).filter((t) => t === 'inkFull')).toHaveLength(1);
      room.dispose();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('review fixes', () => {
  it('gives every role the same night grid in «Мафия-ТВ», so a neighbour learns nothing from the phone', async () => {
    const room = makeRoom(131, 1);
    room.settings.games = ['mafia'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    for (let i = 0; i < 7; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    await until(() => game.phase.kind === 'mafiaNight', 30_000);
    const grids = room.players().map((p) => game.personal(p.id)).flatMap((v) => (v.kind === 'mafia' && v.alive ? [[...v.options].sort().join()] : []));
    expect(new Set(grids).size).toBe(1);
    room.dispose();
  });

  it('refuses a forehead hint that names the word or its root', async () => {
    const room = makeRoom(137, 1);
    room.settings.games = ['forehead'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    await until(() => game.phase.kind === 'write' && game.phase.forehead !== undefined && game.phase.forehead !== anya, 30_000);
    const word = game.foreheadSecret()!;
    expect(game.answer(anya, game.phaseId, `Это ${word}`)).toBe(false);
    expect(game.answer(anya, game.phaseId, 'Бывает в детстве')).toBe(true);
    room.dispose();
  });

  it('takes «Оркестр» taps only when their stamp is near the server clock', async () => {
    const room = makeRoom(139, 1);
    room.settings.games = ['band'];
    room.settings.minis = 1;
    room.settings.spotlight = false;
    room.join(fakePhone(), 'Аня', 0);
    for (let i = 0; i < 3; i++) room.addBot();
    room.start();
    const game = (room as unknown as { game: Game }).game;
    const anya = room.players().find((p) => p.name === 'Аня')!.id;
    await until(() => game.phase.kind === 'band', 30_000);
    expect(game.answer(anya, game.phaseId, Date.now() + 60_000)).toBe(false);
    expect(game.answer(anya, game.phaseId, Date.now())).toBe(true);
    room.dispose();
  });
});

describe('narrator warm-up', () => {
  it('holds «Поехали!» until the voice and every name are ready, then starts', async () => {
    let loaded!: () => void;
    const model = new Promise<void>((res) => (loaded = res));
    const rendered = new Set<string>();
    const tts = {
      installed: () => true,
      cached: (_e: string, _v: string, s: string) => (rendered.has(s) ? s : undefined),
      warm: () => model,
      file: (_e: string, _v: string, s: string) => model.then(() => (rendered.add(s), s)),
    };
    const room = new Room('0007', {
      durations: scaledDurations(0.05),
      rng: seededRng(12),
      botPace: 0.05,
      joinUrl: () => '',
      httpsAvailable: false,
      tts: tts as unknown as ConstructorParameters<typeof Room>[1]['tts'],
    });
    room.handleHost({ t: 'host.voice', engine: 'vosk', voice: 'speaker-3' });
    expect(room.join(fakePhone(), 'Аня', 0)).toBeNull();
    room.addBot();
    room.start();
    expect(room.view().warming).toBe(true);
    expect(room.phase.kind).toBe('lobby');
    room.start();
    loaded();
    await until(() => room.phase.kind !== 'lobby');
    expect(room.view().warming).toBeUndefined();
    room.dispose();
  });
});

describe('narration ahead', () => {
  it('renders whole sentences with every player name in the background once the game starts', async () => {
    const idle: string[] = [];
    const tts = {
      installed: () => true,
      cached: () => undefined,
      warm: () => Promise.resolve(),
      file: (_e: string, _v: string, s: string, o?: { priority?: string }) => {
        if (o?.priority === 'idle') idle.push(s);
        return Promise.resolve(s);
      },
    };
    const room = new Room('0008', {
      durations: scaledDurations(0.05),
      rng: seededRng(13),
      botPace: 0.05,
      joinUrl: () => '',
      httpsAvailable: false,
      tts: tts as unknown as ConstructorParameters<typeof Room>[1]['tts'],
    });
    room.handleHost({ t: 'host.voice', engine: 'vosk', voice: 'speaker-3' });
    expect(room.join(fakePhone(), 'Аня', 0)).toBeNull();
    room.addBot();
    room.start();
    await until(() => room.phase.kind !== 'lobby' && idle.length > 4);
    const names = room.players().map((p) => p.name);
    expect(idle.every((s) => names.some((n) => s.includes(n)))).toBe(true);
    expect(names.every((n) => idle.some((s) => s.includes(n)))).toBe(true);
    room.dispose();
  });
});

describe('narrated phases', () => {
  async function revealLength(voiced: boolean): Promise<{ took: number; base: number; cap: number }> {
    const dur = scaledDurations(0.2);
    const room = new Room('0009', { durations: dur, rng: seededRng(14), botPace: 0.05, joinUrl: () => '', httpsAvailable: false });
    room.settings.games = [];
    room.settings.spotlight = false;
    expect(room.join(fakePhone(), 'Аня', 0)).toBeNull();
    room.addBot();
    room.addBot();
    room.start();
    const human = room.players().find((p) => !p.bot)!;
    await until(() => room.phase.kind === 'vote', 30_000);
    const ask = room.phase;
    if (ask.kind !== 'vote') throw new Error('expected a vote');
    room.handlePlayer(human, { t: 'answer', phaseId: room.view().phaseId, value: ask.options.find((id) => id !== human.id)! });
    await until(() => room.phase.kind === 'voteReveal', 30_000);
    const reveal = room.phase;
    const started = Date.now();
    const cap = dur.voteReveal + (room.view().say?.length ?? 0) * dur.speechPerChar;
    room.handleHost({ t: 'host.spoken', phaseId: room.view().phaseId, voiced });
    await until(() => room.phase !== reveal, 30_000);
    room.dispose();
    return { took: Date.now() - started, base: dur.voteReveal, cap };
  }

  it('moves on a beat after the voice has read the reveal, not after the length estimate', async () => {
    const { took, base, cap } = await revealLength(true);
    expect(took).toBeGreaterThanOrEqual(base - 20);
    expect(took).toBeLessThan(cap - 200);
  }, 60_000);

  it('keeps the reading time when the narrator is off', async () => {
    const { took, cap } = await revealLength(false);
    expect(took).toBeGreaterThanOrEqual(cap - 50);
  }, 60_000);
});
