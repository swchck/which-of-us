import { describe, expect, it } from 'vitest';
import type { WebSocket } from 'ws';
import { GAMES, MINIS_MAX, QUESTIONS_MIN, type Phase } from '../shared/protocol.js';
import { scaledDurations } from '../server/game/types.js';
import type { Game } from '../server/game/game.js';
import { Room } from '../server/room.js';
import { seededRng } from '../server/util.js';

/**
 * Whole parties on fast-forward with nothing but bots, checking what must hold in any game:
 * it ends, numbers stay finite, standings add up. `SOAK=300 npm test -- soak` runs a long batch.
 */

const SEEDS = Number(process.env.SOAK) || 8;

function makeRoom(seed: number): Room {
  const rng = seededRng(seed);
  const room = new Room('0000', {
    durations: scaledDurations(0.003),
    rng,
    botPace: 0.003,
    joinUrl: () => 'http://test/p',
    httpsAvailable: false,
  });
  room.settings.episodes = 2 + (seed % 2);
  room.settings.questions = QUESTIONS_MIN;
  room.settings.minis = MINIS_MAX;
  room.settings.games = [...GAMES];
  room.settings.missions = seed % 3 === 0;
  room.settings.teams = seed % 4 === 0;
  return room;
}

function fakePhone(): WebSocket {
  return { readyState: 1, OPEN: 1, send: () => undefined, close: () => undefined } as unknown as WebSocket;
}

async function record(room: Room, timeoutMs: number): Promise<Phase[]> {
  const phases: Phase[] = [];
  const started = Date.now();
  let last: Phase | null = null;
  while (room.phase.kind !== 'final') {
    if (room.phase !== last) phases.push((last = room.phase));
    if (Date.now() - started > timeoutMs) throw new Error(`stuck in ${room.phase.kind} after ${phases.map((p) => p.kind).join(' > ')}`);
    await new Promise((r) => setTimeout(r, 2));
  }
  phases.push(room.phase);
  return phases;
}

/** Paths to every number in `value` that is not finite; JSON would quietly turn them into null. */
function badNumbers(value: unknown, path = ''): string[] {
  if (typeof value === 'number') return Number.isFinite(value) ? [] : [path];
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => badNumbers(v, `${path}.${k}`));
  return [];
}

describe('soak: bot-only parties', () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    it(`seed ${seed} plays to the end and keeps its books straight`, async () => {
      const room = makeRoom(seed);
      for (let i = 0; i < 3 + (seed % 4); i++) room.addBot();
      room.start();
      const phases = await record(room, 60_000);

      for (const p of phases) expect(badNumbers(p), p.kind).toEqual([]);
      for (const p of phases) {
        if (!('gains' in p)) continue;
        for (const [id, g] of Object.entries(p.gains)) expect(Number.isInteger(g) && g >= 0, `${p.kind} pays ${g} to ${id}`).toBe(true);
      }

      // each standings table is the previous one plus this round's deltas
      let before = new Map<string, number>();
      for (const p of phases) {
        if (p.kind !== 'scores' && p.kind !== 'final') continue;
        for (const r of p.rows) expect(r.score - r.delta, `${p.kind} row for ${r.player}`).toBe(before.get(r.player) ?? 0);
        const scores = p.rows.map((r) => r.score);
        expect(scores).toEqual([...scores].sort((a, b) => b - a));
        p.rows.forEach((r, i) => expect(r.place).toBe(i === 0 || r.score !== p.rows[i - 1]!.score ? i + 1 : p.rows[i - 1]!.place));
        before = new Map(p.rows.map((r) => [r.player, r.score]));
      }
      const final = phases.at(-1)!;
      if (final.kind !== 'final') throw new Error('no final');
      for (const p of room.players()) expect(final.rows.find((r) => r.player === p.id)?.score).toBe(p.score);
      room.dispose();
    });
  }
});

describe('balance: the same answers earn the same points', () => {
  /** Plays every phase that scores by agreement with identical answers from everyone. */
  function mirror(game: Game, ids: string[]): void {
    const p = game.phase;
    const id = game.phaseId;
    if (p.kind === 'vote' && !p.duel) for (const pl of ids) game.answer(pl, id, p.options[0]!);
    else if (p.kind === 'write' && p.herd) for (const pl of ids) game.answer(pl, id, 'кот');
    else if (p.kind === 'closest') for (const pl of ids) game.answer(pl, id, 42);
    else if (p.kind === 'truth') for (const pl of ids) game.answer(pl, id, 1);
    else if (p.kind === 'rules') for (const pl of ids) game.answer(pl, id, 'ready');
  }

  for (const games of [[], ['herd'], ['closest'], ['truth']] as const) {
    it(`gives equal scores in ${games[0] ?? 'plain questions'}`, async () => {
      const room = makeRoom(200 + games.length);
      room.settings.games = [...games];
      room.settings.minis = games.length ? 2 : 0;
      room.settings.missions = false;
      room.settings.teams = false;
      room.settings.spotlight = false;
      for (const name of ['Аня', 'Боря', 'Вера', 'Гоша']) room.join(fakePhone(), name, 0);
      room.start();
      const game = (room as unknown as { game: Game }).game;
      const ids = room.players().map((p) => p.id);
      let seen = -1;
      const started = Date.now();
      while (room.phase.kind !== 'final') {
        if (game.phaseId !== seen) {
          seen = game.phaseId;
          mirror(game, ids);
        }
        if (Date.now() - started > 60_000) throw new Error(`stuck in ${room.phase.kind}`);
        await new Promise((r) => setTimeout(r, 1));
      }
      const scores = room.players().map((p) => p.score);
      expect(new Set(scores).size, `scores ${scores.join(', ')}`).toBe(1);
      expect(scores[0]).toBeGreaterThan(0);
      room.dispose();
    });
  }
});
