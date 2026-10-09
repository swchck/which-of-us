import { describe, expect, it } from 'vitest';
import { placeContent } from '../server/content/index.js';
import { ContentDecks } from '../server/game/content.js';
import { seededRng } from '../server/util.js';

describe('place content in a round', () => {
  it('leans questions and tasks towards the place, and still mixes in the packs', () => {
    const decks = new ContentDecks(seededRng(3));
    const camp = placeContent.camp!;
    decks.setPlace('camp');
    const own = new Set(camp.vote.map((q) => q.q));
    const drawn = Array.from({ length: 60 }, () => decks.nextVote().q);
    const share = drawn.filter((q) => own.has(q)).length / drawn.length;
    expect(share).toBeGreaterThan(0.5);
    expect(share).toBeLessThan(0.9);
    const words = new Set(camp.words);
    expect(Array.from({ length: 30 }, () => decks.guessWord()).some((w) => words.has(w))).toBe(true);

    decks.setPlace(undefined);
    expect(Array.from({ length: 30 }, () => decks.nextVote().q).some((q) => own.has(q))).toBe(false);
  });

  it('puts the room’s own questions first, whatever the place', () => {
    const decks = new ContentDecks(seededRng(4));
    decks.setPlace('camp');
    decks.custom = [{ id: 'x', kind: 'vote', text: 'Кто из нас придумал эту игру?' }];
    expect(decks.nextVote()).toMatchObject({ q: 'Кто из нас придумал эту игру?', custom: true });
  });
});
