import { describe, expect, it } from 'vitest';
import { speechSentences } from '../shared/catalog.js';
import { narrator } from '../server/content/index.js';
import { ContentDecks } from '../server/game/content.js';
import { fill, seededRng } from '../server/util.js';

describe('narration rendered ahead', () => {
  it('knows the narrator line it will say next', () => {
    const decks = new ContentDecks(seededRng(5));
    for (let i = 0; i < narrator.voteReveal.length * 2; i++) {
      const next = decks.nextLine('voteReveal');
      expect(decks.line('voteReveal', 'Аня')).toBe(fill(next, 'Аня'));
    }
  });

  it('says every variant of a line once before repeating any', () => {
    const decks = new ContentDecks(seededRng(6));
    const said = Array.from({ length: narrator.voteReveal.length }, () => decks.line('voteReveal', 'Аня'));
    expect(new Set(said).size).toBe(narrator.voteReveal.length);
  });

  it('lists the lines of the next segment first, each with every name, and only sentences with a name', () => {
    const decks = new ContentDecks(seededRng(7));
    const names = ['Аня', 'Боря'];
    const ahead = decks.namedAhead(['tug', 'vote'], [], names);
    const tug = names.flatMap((n) => speechSentences(fill(decks.nextLine('tugWin'), n)).filter((s) => s.includes(n)));
    expect(ahead.slice(0, tug.length)).toEqual(tug);
    expect(ahead.some((s) => s.includes(fill(decks.nextLine('voteReveal'), 'Боря').slice(0, 10)))).toBe(true);
    expect(ahead.every((s) => names.some((n) => s.includes(n)))).toBe(true);
  });
});
