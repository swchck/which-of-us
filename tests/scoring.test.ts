import { describe, expect, it } from 'vitest';
import { cleanName, clip } from '../server/util.js';
import { clueProblem, withUnit } from '../shared/catalog.js';
import {
  POINTS,
  rank,
  relayArtist,
  relayChainOf,
  scoreGallery,
  scorePredict,
  scoreVote,
  sharedTurnCount,
} from '../server/game/scoring.js';
import { guideStrip } from '../server/game/game.js';
import { BOARDS, MONSTER_GUIDE } from '../shared/protocol.js';

describe('scoreVote', () => {
  it('rewards voters who sided with the majority', () => {
    const r = scoreVote({ a: 'c', b: 'c', c: 'a' }, 'majority');
    expect(r.leaders).toEqual(['c']);
    expect(r.gains).toEqual({ a: 2 * POINTS.majorityPerMatch, b: 2 * POINTS.majorityPerMatch });
    expect(r.noConsensus).toBe(false);
  });

  it('pays nobody for agreeing with themselves', () => {
    expect(scoreVote({ a: 'c' }, 'majority').gains).toEqual({});
  });

  it('pays more the more people agree', () => {
    const wide = scoreVote({ a: 'c', b: 'c', c: 'c', d: 'c' }, 'majority');
    const narrow = scoreVote({ a: 'c', b: 'c', c: 'a', d: 'b' }, 'majority');
    expect(wide.gains.a).toBe(4 * POINTS.majorityPerMatch);
    expect(narrow.gains.a).toBe(2 * POINTS.majorityPerMatch);
  });

  it('pays the same to everyone who answered the same', () => {
    const r = scoreVote({ a: 'c', b: 'c', c: 'c', d: 'a', e: 'a' }, 'majority');
    expect(new Set(['a', 'b', 'c'].map((id) => r.gains[id])).size).toBe(1);
  });

  it('rewards everyone in a tie between leaders', () => {
    const r = scoreVote({ a: 'c', b: 'c', c: 'a', d: 'a', e: 'b' }, 'majority');
    expect(r.leaders.sort()).toEqual(['a', 'c']);
    expect(Object.keys(r.gains).sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('gives nothing when every vote went somewhere different', () => {
    const r = scoreVote({ a: 'b', b: 'c', c: 'a' }, 'majority');
    expect(r.noConsensus).toBe(true);
    expect(r.gains).toEqual({});
  });

  it('doubles bonus rounds', () => {
    const r = scoreVote({ a: 'b', b: 'b' }, 'majority', 2);
    expect(r.gains.a).toBe(2 * POINTS.majorityPerMatch * 2);
  });

  it('pays per vote received in received mode', () => {
    const r = scoreVote({ a: 'b', c: 'b', b: 'a' }, 'received');
    expect(r.gains).toEqual({ b: 2 * POINTS.received, a: POINTS.received });
  });

  it('handles an empty ballot', () => {
    expect(scoreVote({}, 'majority')).toEqual({ leaders: [], gains: {}, noConsensus: false });
  });
});

describe('scorePredict', () => {
  it('pays guessers and the target', () => {
    const r = scorePredict('t', 1, { a: 1, b: 0, c: 1 });
    expect(r.hits.sort()).toEqual(['a', 'c']);
    expect(r.gains).toEqual({ a: POINTS.predictHit, c: POINTS.predictHit, t: 2 * POINTS.predictTarget });
  });

  it('pays nobody when the target stayed silent', () => {
    expect(scorePredict('t', undefined, { a: 1 })).toEqual({ gains: {}, hits: [] });
  });
});

describe('scoreGallery', () => {
  it('splits a monster vote between co-authors and picks winners', () => {
    const items = [
      { id: 'm1', authors: ['a', 'b'] },
      { id: 'm2', authors: ['c'] },
    ];
    const r = scoreGallery(items, { a: 'm2', b: 'm2', c: 'm1' });
    expect(r.winners).toEqual(['m2']);
    expect(r.gains).toEqual({ c: 200, a: 50, b: 50 });
    expect(r.votes).toEqual({ m1: ['c'], m2: ['a', 'b'] });
  });

  it('ignores ballots for unknown items', () => {
    const r = scoreGallery([{ id: 'x', authors: ['a'] }], { b: 'nope' });
    expect(r.gains).toEqual({});
    expect(r.winners).toEqual([]);
  });
});

describe('monster relay', () => {
  it('gives every player exactly one chain per step', () => {
    for (const n of [2, 3, 5, 8]) {
      const players = Array.from({ length: n }, (_, i) => `p${i}`);
      for (let step = 0; step < 3; step++) {
        const artists = players.map((_, chain) => relayArtist(players, chain, step));
        expect(new Set(artists).size).toBe(n);
        for (const [chain, artist] of artists.entries()) {
          expect(relayChainOf(players, artist, step)).toBe(chain);
        }
      }
    }
  });

  it('passes the chain to a different player each step when there are enough players', () => {
    const players = ['a', 'b', 'c'];
    const drawers = [0, 1, 2].map((step) => relayArtist(players, 0, step));
    expect(new Set(drawers).size).toBe(3);
  });

  it('keeps only strokes reaching the bottom band and lifts them above the next section', () => {
    const board = BOARDS.monster;
    const low = { c: '#1b1033', w: 10, p: [100, board.h - 20, 200, board.h - 5] };
    const high = { c: '#1b1033', w: 10, p: [100, 50, 200, 80] };
    const strip = guideStrip([low, high], board);
    expect(strip).toHaveLength(1);
    expect(strip[0]!.p[1]).toBe(-20);
    expect(strip[0]!.p[1]).toBeGreaterThanOrEqual(-MONSTER_GUIDE);
  });
});

describe('rank', () => {
  it('shares places on ties and skips the next', () => {
    const rows = rank([
      { id: 'a', score: 300, delta: 0 },
      { id: 'b', score: 500, delta: 0 },
      { id: 'c', score: 300, delta: 0 },
      { id: 'd', score: 100, delta: 0 },
    ]);
    expect(rows.map((r) => [r.player, r.place])).toEqual([
      ['b', 1],
      ['a', 2],
      ['c', 2],
      ['d', 4],
    ]);
  });
});

describe('sharedTurnCount', () => {
  it('gives small groups more laps', () => {
    expect(sharedTurnCount(2)).toBe(6);
    expect(sharedTurnCount(3)).toBe(6);
    expect(sharedTurnCount(4)).toBe(8);
    expect(sharedTurnCount(7)).toBe(7);
  });
});

describe('withUnit', () => {
  it('agrees the unit with the number the Russian way', () => {
    expect(withUnit(1, 'лет')).toBe('1 год');
    expect(withUnit(4, 'лет')).toBe('4 года');
    expect(withUnit(11, 'лет')).toBe('11 лет');
    expect(withUnit(21, 'дней')).toBe('21 день');
    expect(withUnit(116, 'лет')).toBe('116 лет');
    expect(withUnit(45, 'мин')).toBe('45 минут');
    expect(withUnit(7)).toBe('7');
  });
});

describe('clip', () => {
  it('never cuts an emoji in half and keeps joined emoji whole', () => {
    expect(clip('Аня👩‍🚀', 4)).toBe('Аня');
    expect(cleanName('  Аня 👩‍🚀  ')).toBe('Аня 👩‍🚀');
    expect(cleanName('Ан‮я<b>')).toBe('Аняb');
  });
});

describe('formatNumber', () => {
  it('groups digits only from five up, the Russian way', () => {
    expect(withUnit(1997)).toBe('1997');
    expect(withUnit(86400)).toBe((86400).toLocaleString('ru'));
  });
});

describe('clueProblem', () => {
  it.each([
    ['кошка', 'мурлычет на подоконнике', null],
    ['кошка', 'кошачий корм', 'Без самого слова и однокоренных'],
    ['Луна', 'лунный свет', 'Без самого слова и однокоренных'],
    ['ёлка', 'елки зелёные', 'Без самого слова и однокоренных'],
    ['Мальчик-с-пальчик', 'крошечный сын', null],
    ['Мальчик-с-пальчик', 'маленький пальчик', 'Без самого слова и однокоренных'],
    ['качели', 'вверх-вниз во дворе', null],
    ['качели', 'раз два три четыре', 'Не больше 3 слов'],
    ['кошка', 'ко<шка', 'Без самого слова и однокоренных'],
    ['кошка', '  ', 'Напишите подсказку'],
  ])('%s ← «%s»', (word, clue, problem) => {
    expect(clueProblem(word, clue)).toBe(problem);
  });
});
