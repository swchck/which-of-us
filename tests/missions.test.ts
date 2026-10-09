import { describe, expect, it } from 'vitest';
import { Missions } from '../server/game/missions.js';
import { seededRng } from '../server/util.js';

const players = [
  { id: 'a', name: 'Аня' },
  { id: 'b', name: 'Боря' },
  { id: 'c', name: 'Вика' },
];

/** A mission set whose first player got the mission starting with `prefix`. */
function withMission(prefix: string): Missions {
  for (let seed = 1; seed < 500; seed++) {
    const m = new Missions(players, seededRng(seed));
    if (m.view('a')!.text.startsWith(prefix)) return m;
  }
  throw new Error(`no seed gives «${prefix}»`);
}

describe('secret missions', () => {
  it('gives everyone a different mission while the deck lasts', () => {
    const m = new Missions(players, seededRng(1));
    const texts = players.map((p) => m.view(p.id)!.text);
    expect(new Set(texts.map((t) => t.split(' ')[0])).size).toBeGreaterThan(1);
    expect(m.view('a')!.done).toBe(false);
  });

  it('counts titles won', () => {
    const m = withMission('Получите титул');
    const vote = { kind: 'vote' as const, votes: { b: 'a', c: 'a' }, order: ['b', 'c'], leader: 'a' };
    expect(m.report(vote)).not.toContain('a');
    expect(m.report(vote)).toContain('a');
    expect(m.view('a')!.done).toBe(true);
  });

  it('spots the secret word in anything typed, in any case', () => {
    const m = withMission('Впишите слово');
    const word = /«(.+)»/.exec(m.view('a')!.text)![1]!;
    expect(m.report({ kind: 'text', player: 'b', text: word })).not.toContain('a');
    expect(m.report({ kind: 'text', player: 'a', text: `Мой ${word.toUpperCase()}!` })).toContain('a');
  });

  it('judges «never vote for the winner» only at the end, and one slip spoils it', () => {
    const clean = withMission('Ни разу не голосуйте');
    for (let i = 0; i < 3; i++) clean.report({ kind: 'vote', votes: { a: 'b', b: 'c', c: 'c' }, order: ['a'], leader: 'c' });
    expect(clean.view('a')!.done).toBe(false);
    expect(clean.close().find((r) => r.player === 'a')!.done).toBe(true);

    const slipped = withMission('Ни разу не голосуйте');
    slipped.report({ kind: 'vote', votes: { a: 'c', b: 'c' }, order: ['a'], leader: 'c' });
    for (let i = 0; i < 3; i++) slipped.report({ kind: 'vote', votes: { a: 'b', b: 'c', c: 'c' }, order: ['a'], leader: 'c' });
    expect(slipped.close().find((r) => r.player === 'a')!.done).toBe(false);
  });

  it('rewards the sole top scorer of a mini-game, not a tie', () => {
    const m = withMission('Наберите больше всех');
    expect(m.report({ kind: 'game', gains: { a: 100, b: 100 } })).not.toContain('a');
    expect(m.report({ kind: 'game', gains: { a: 150, b: 100 } })).toContain('a');
  });
});
