import { describe, expect, it } from 'vitest';
import { dateQuirks } from '../server/content/date.js';

describe('«Свидание вслепую» quirks', () => {
  it('has enough distinct quirks for a full room', () => {
    expect(new Set(dateQuirks.map((q) => q.id)).size).toBe(dateQuirks.length);
    expect(dateQuirks.length).toBeGreaterThanOrEqual(8);
  });

  it.each(dateQuirks.map((q) => [q.id, q] as const))('bots keep «%s» in every line', (_, quirk) => {
    for (const line of quirk.bot) expect(quirk.keeps(line), line).toBe(true);
  });

  it('checks the quirks it promises to check', () => {
    const by = Object.fromEntries(dateQuirks.map((q) => [q.id, q.keeps]));
    expect(by.questions!('Как дела?')).toBe(true);
    expect(by.questions!('Как дела')).toBe(false);
    expect(by['no-o']!('Привет')).toBe(true);
    expect(by['no-o']!('Пока')).toBe(false);
    expect(by.oi!('Ой, привет')).toBe(true);
    expect(by.oi!('Ойкнуть')).toBe(false);
    expect(by.three!('раз два три')).toBe(true);
    expect(by.three!('раз два три четыре')).toBe(false);
    expect(by.caps!('ПРИВЕТ 123')).toBe(true);
    expect(by.caps!('ПРИВЕт')).toBe(false);
    expect(by.emoji!('привет 💘')).toBe(true);
    expect(by.emoji!('привет')).toBe(false);
  });
});
