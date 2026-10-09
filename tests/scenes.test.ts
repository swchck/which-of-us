import { describe, expect, it } from 'vitest';
import { GAMES, LOCATIONS } from '../shared/protocol.js';
import { PLACE_SCENES, placeScenes } from '../shared/scenes.js';
import { sceneLines } from '../server/content/scenes.js';
import { planGame, type PlanOptions } from '../server/game/plan.js';
import { seededRng } from '../server/util.js';
import { ContentDecks } from '../server/game/content.js';
import { placeContent } from '../server/content/index.js';
import { VARIANT_LOADERS } from '../client/src/host/backdrop/variants.js';

const keys = Object.entries(PLACE_SCENES).flatMap(([place, scenes]) => Object.keys(scenes ?? {}).map((s) => `${place}/${s}`));

describe('scenes of a place', () => {
  it('have a backdrop and narrator lines each, and nothing extra', () => {
    expect(Object.keys(VARIANT_LOADERS).sort()).toEqual([...keys].sort());
    expect(Object.keys(sceneLines).sort()).toEqual([...keys].sort());
    for (const key of keys) expect(sceneLines[key]!.length, key).toBeGreaterThanOrEqual(2);
  });

  it('come up in a round in order, between segments, never at its very start', () => {
    const options: PlanOptions = { games: GAMES, locations: LOCATIONS, questions: 6, minis: 2, spotlight: true };
    let seen = 0;
    for (let seed = 1; seed <= 30; seed++) {
      for (const e of planGame(4, seededRng(seed), options)) {
        const known = placeScenes(e.location);
        const at = e.scenes.map((s) => s.at);
        expect(at).toEqual([...at].sort((a, b) => a - b));
        expect(new Set(e.scenes.map((s) => s.scene)).size).toBe(e.scenes.length);
        for (const s of e.scenes) {
          expect(known).toContain(s.scene);
          expect(s.at).toBeGreaterThan(0);
          expect(s.at).toBeLessThan(e.segments.length);
        }
        if (known.length > 0) expect(e.scenes.length).toBeGreaterThan(0);
        seen += e.scenes.length;
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});

describe('question decks in a scene', () => {
  it('ask the scene its own questions first and keep two-player rounds for a game for two', () => {
    const decks = new ContentDecks(seededRng(4));
    decks.setPlace('school');
    decks.setScene('exam');
    const own = placeContent.school.vote.filter((q) => q.scene === 'exam' && !q.pair);
    expect(own.length).toBeGreaterThan(0);
    const asked = Array.from({ length: 40 }, () => decks.nextVote());
    expect(asked.filter((q) => q.scene === 'exam').length).toBeGreaterThan(10);
    expect(asked.some((q) => 'pair' in q && q.pair)).toBe(false);

    decks.setPairs(true);
    decks.setPlace('school');
    const pairs = Array.from({ length: 200 }, () => decks.nextPredict()).filter((q) => 'pair' in q && q.pair);
    expect(pairs.length).toBeGreaterThan(0);
  });
});
