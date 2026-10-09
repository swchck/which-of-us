import { describe, expect, it } from 'vitest';
import { ARENA, PAINT } from '../shared/protocol.js';
import { Arena } from '../server/game/arena.js';
import { cleanGuess, guessPoints, hintOf, judge, levenshtein, normalize } from '../server/game/guess.js';
import { seededRng } from '../server/util.js';

describe('judge', () => {
  it('accepts the word regardless of case, ё and punctuation', () => {
    expect(judge('Вертолёт', 'вертолёт')).toBe('right');
    expect(judge('вертолет', 'вертолёт')).toBe('right');
    expect(judge('  ВЕРТОЛЁТ!! ', 'вертолёт')).toBe('right');
    expect(judge('чёрная  дыра', 'чёрная дыра')).toBe('right');
  });

  it('forgives one typo only in longer words', () => {
    expect(judge('вертолот', 'вертолёт')).toBe('right');
    expect(judge('пингвен', 'пингвин')).toBe('right');
    expect(judge('кит', 'кот')).not.toBe('right');
  });

  it('marks near misses as close', () => {
    expect(judge('пингвинчик', 'пингвин')).toBe('close');
    expect(judge('кит', 'кот')).toBe('close');
    expect(judge('вертолётик', 'вертолёт')).toBe('close');
  });

  it('rejects unrelated words and empty input', () => {
    expect(judge('арбуз', 'вертолёт')).toBe('wrong');
    expect(judge('!!!', 'вертолёт')).toBe('wrong');
  });

  it('computes edit distance', () => {
    expect(levenshtein('кот', 'кит')).toBe(1);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(normalize('Ёж-Ик')).toBe('ежик');
  });
});

describe('hints and points', () => {
  it('hides letters but keeps spaces and hyphens', () => {
    expect(hintOf('кот', new Set())).toBe('_ _ _');
    expect(hintOf('кот', new Set([0]))).toBe('К _ _');
    expect(hintOf('чёрная дыра', new Set([0]))).toBe('Ч _ _ _ _ _   _ _ _ _');
  });

  it('pays more for faster guesses', () => {
    expect(guessPoints(1)).toBe(200);
    expect(guessPoints(0.5)).toBe(150);
    expect(guessPoints(0)).toBe(100);
    expect(guessPoints(-3)).toBe(100);
  });

  it('cleans guesses', () => {
    expect(cleanGuess('  кот <b>  ')).toBe('кот b');
    expect(cleanGuess('   ')).toBeNull();
    expect(cleanGuess(42)).toBeNull();
    expect(cleanGuess('а'.repeat(100))!.length).toBeLessThanOrEqual(32);
  });
});

let clock = 0;

/** Advances a shared wall clock, so input freshness behaves like in a real round. */
function simulate(arena: Arena, seconds: number, input?: (nowMs: number) => void): void {
  const dt = 1 / 30;
  const end = clock + seconds * 1000;
  while (clock < end) {
    input?.(clock);
    arena.step(dt, clock);
    clock += dt * 1000;
  }
}

describe('arena', () => {
  it('paints the floor under a rolling ball in «Захват»', () => {
    const arena = new Arena([{ id: 'a', bot: false }, { id: 'b', bot: true }], seededRng(9), 'paint');
    simulate(arena, 0.1);
    const before = arena.painted().get('a')!;
    simulate(arena, 3, (now) => arena.input('a', 1, 0.3, now));
    expect(before).toBeGreaterThan(0);
    expect(arena.painted().get('a')!).toBeGreaterThan(before * 3);
    expect(arena.painted().get('b')!).toBeGreaterThan(0);
    expect(arena.snapshot().paint).toHaveLength(PAINT.cols * PAINT.rows);
  });

  it('rolls a ball in the tilt direction and keeps it inside the walls', () => {
    const arena = new Arena([{ id: 'a', bot: false }], seededRng(1));
    const start = arena.positions()[0]!;
    simulate(arena, 3, (now) => arena.input('a', 1, 0, now));
    const end = arena.positions()[0]!;
    expect(end.x).toBeGreaterThan(start.x);
    expect(end.x).toBeLessThanOrEqual(ARENA.w - ARENA.ball);
  });

  it('stops a ball whose phone went quiet', () => {
    const arena = new Arena([{ id: 'a', bot: false }], seededRng(2));
    const start = arena.positions()[0]!;
    arena.input('a', 0, 1, clock);
    simulate(arena, 0.3);
    const moving = arena.positions()[0]!;
    simulate(arena, 4);
    const end = arena.positions()[0]!;
    simulate(arena, 1);
    const later = arena.positions()[0]!;
    expect(moving.y).toBeGreaterThan(start.y);
    expect(Math.hypot(later.x - end.x, later.y - end.y)).toBeLessThan(2);
  });

  it('never lets two balls overlap after a step', () => {
    const arena = new Arena(
      [
        { id: 'a', bot: false },
        { id: 'b', bot: false },
      ],
      seededRng(3),
    );
    simulate(arena, 4, (now) => {
      arena.input('a', 1, 0.2, now);
      arena.input('b', -1, -0.2, now);
    });
    const [a, b] = arena.positions();
    expect(Math.hypot(a!.x - b!.x, a!.y - b!.y)).toBeGreaterThanOrEqual(ARENA.ball * 2 - 1);
  });

  it('lets bots collect stars and spawns a big star periodically', () => {
    const arena = new Arena(
      [
        { id: 'b1', bot: true },
        { id: 'b2', bot: true },
      ],
      seededRng(4),
    );
    let sawBig = false;
    const dt = 1 / 30;
    for (let t = 0; t < 30; t += dt) {
      arena.step(dt, t * 1000);
      if (arena.snapshot().stars.some((s) => s[3] === 1)) sawBig = true;
    }
    const total = [...arena.stars.values()].reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(3);
    expect(sawBig).toBe(true);
  });

  it('reports each collected star exactly once', () => {
    const arena = new Arena([{ id: 'b', bot: true }], seededRng(5));
    let reported = 0;
    const dt = 1 / 30;
    for (let t = 0; t < 20; t += dt) {
      arena.step(dt, t * 1000);
      reported += arena.snapshot().hits.reduce((n, h) => n + h[2], 0);
    }
    expect(reported).toBe(arena.stars.get('b'));
  });
});
