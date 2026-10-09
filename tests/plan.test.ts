import { describe, expect, it } from 'vitest';
import { GAMES, LOCATIONS, MINIS_MAX, MINIS_MIN, PLACEMENTS, QUESTIONS_MAX, QUESTIONS_MIN, ROUNDS_MAX, type GameId } from '../shared/protocol.js';
import { GAME_INFO } from '../shared/catalog.js';
import { estimateMinutes, planGame, type PlanOptions, type Segment } from '../server/game/plan.js';
import { DURATIONS, pacedDurations } from '../server/game/types.js';
import { seededRng } from '../server/util.js';

const EVERYTHING: PlanOptions = { games: GAMES, locations: LOCATIONS, questions: 5, minis: 1, spotlight: true };
const HERO_SEGMENTS: Segment[] = ['predict', 'scale', 'selfie'];
const isMini = (s: Segment) => s !== 'vote' && s !== 'bonusVote';

describe('planGame', () => {
  it('leaves out games that need more players than the room has', () => {
    for (const players of [2, 3]) {
      for (let seed = 1; seed <= 20; seed++) {
        const minis = planGame(ROUNDS_MAX, seededRng(seed), { ...EVERYTHING, minis: MINIS_MAX, players })
          .flatMap((e) => e.segments)
          .filter((s): s is GameId => s in GAME_INFO);
        for (const game of minis) expect(GAME_INFO[game].players ?? 0, game).toBeLessThanOrEqual(players);
        expect(minis.length).toBeGreaterThan(0);
      }
    }
  });

  it('differs between games', () => {
    const plans = new Set(Array.from({ length: 12 }, (_, seed) => JSON.stringify(planGame(4, seededRng(seed + 1), EVERYTHING))));
    expect(plans.size).toBeGreaterThan(8);
  });

  it('uses distinct locations and ends on the bonus question', () => {
    for (let seed = 1; seed <= 30; seed++) {
      for (let rounds = 1; rounds <= ROUNDS_MAX; rounds++) {
        const plan = planGame(rounds, seededRng(seed), EVERYTHING);
        expect(plan).toHaveLength(rounds);
        expect(new Set(plan.map((e) => e.location)).size).toBe(rounds);
        const segments = plan.flatMap((e) => e.segments);
        expect(segments.at(-1)).toBe('bonusVote');
        expect(segments.filter((s) => s === 'bonusVote')).toHaveLength(1);
      }
    }
  });

  it('fills a group round with the asked number of votes and mini-games, never two games back to back', () => {
    for (const placement of PLACEMENTS) {
      for (let questions = QUESTIONS_MIN; questions <= QUESTIONS_MAX; questions++) {
        for (let minis = MINIS_MIN; minis <= MINIS_MAX; minis++) {
          const plan = planGame(3, seededRng(minis + questions), { ...EVERYTHING, questions, minis, placement, spotlight: false });
          for (const round of plan) {
            const own = round.segments.filter((s) => s !== 'bonusVote');
            expect(own.filter((s) => s === 'vote')).toHaveLength(questions);
            expect(own.filter(isMini)).toHaveLength(minis);
            expect(own[0]).toBe('vote');
            for (let i = 1; i < own.length; i++) expect(isMini(own[i]!) && isMini(own[i - 1]!)).toBe(false);
          }
        }
      }
    }
  });

  it('spreads mini-games evenly or drops them between random questions', () => {
    const where = (placement: 'mixed' | 'even', seed: number) =>
      planGame(1, seededRng(seed), { ...EVERYTHING, questions: 10, minis: 2, placement, spotlight: false })[0]!
        .segments.map((s, i) => (isMini(s) ? i : -1))
        .filter((i) => i >= 0)
        .join();
    const even = new Set(Array.from({ length: 10 }, (_, seed) => where('even', seed + 1)));
    const mixed = new Set(Array.from({ length: 10 }, (_, seed) => where('mixed', seed + 1)));
    expect(even.size).toBe(1);
    expect(mixed.size).toBeGreaterThan(3);
  });

  it('alternates group rounds with spotlight rounds that only ask about the hero', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const plan = planGame(5, seededRng(seed), EVERYTHING);
      expect(plan.map((e) => e.kind)).toEqual(['group', 'spotlight', 'group', 'spotlight', 'group']);
      for (const round of plan) {
        const own = round.segments.filter((s) => s !== 'bonusVote');
        if (round.kind === 'spotlight') {
          for (const s of own) expect(HERO_SEGMENTS).toContain(s);
          expect(own.filter((s) => s === 'predict' || s === 'scale')).toHaveLength(5);
        } else {
          for (const s of own) expect(['predict', 'scale']).not.toContain(s);
        }
      }
    }
  });

  it('skips spotlight rounds when they are off or nothing can be asked about one person', () => {
    const off = planGame(4, seededRng(2), { ...EVERYTHING, spotlight: false });
    expect(off.every((e) => e.kind === 'group')).toBe(true);
    const noHero = planGame(4, seededRng(2), { ...EVERYTHING, games: GAMES.filter((g) => g !== 'predict' && g !== 'scale') });
    expect(noHero.every((e) => e.kind === 'group')).toBe(true);
    expect(planGame(1, seededRng(2), EVERYTHING)[0]!.kind).toBe('group');
  });

  it('spreads mini-games instead of repeating favourites', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const games = planGame(ROUNDS_MAX, seededRng(seed), { ...EVERYTHING, minis: 2, spotlight: false })
        .flatMap((e) => e.segments)
        .filter(isMini);
      expect(new Set(games).size).toBe(games.length);
    }
  });

  it('gets to every mini-game over a few long games', () => {
    const seen = new Set<Segment>(
      Array.from({ length: 40 }, (_, i) => planGame(ROUNDS_MAX, seededRng(i + 1), { ...EVERYTHING, minis: 3, spotlight: false }))
        .flat()
        .flatMap((e) => e.segments),
    );
    for (const g of GAMES) expect(seen).toContain(g);
  });

  it('puts every location in rotation over many games', () => {
    const rng = seededRng(1);
    const seen = new Set(Array.from({ length: 400 }, () => planGame(1, rng, EVERYTHING)[0]!.location));
    expect(seen.size).toBe(LOCATIONS.length);
  });

  it('only plays the games and places the host switched on', () => {
    const games: GameId[] = ['tilt', 'guess', 'predict'];
    for (let seed = 1; seed <= 20; seed++) {
      const plan = planGame(4, seededRng(seed), { ...EVERYTHING, games, locations: ['ocean'], minis: 2 });
      for (const e of plan) {
        expect(e.location).toBe('ocean');
        for (const s of e.segments) expect(['vote', 'bonusVote', ...games]).toContain(s);
      }
    }
  });

  it('falls back to votes when every mini-game is off', () => {
    const plan = planGame(3, seededRng(3), { ...EVERYTHING, games: [], minis: 2 });
    for (const s of plan.flatMap((e) => e.segments)) expect(['vote', 'bonusVote']).toContain(s);
  });

  it('never repeats a location back to back when there are enough of them', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const plan = planGame(ROUNDS_MAX, seededRng(seed), { ...EVERYTHING, locations: ['party', 'camp'] });
      for (let i = 1; i < plan.length; i++) expect(plan[i]!.location).not.toBe(plan[i - 1]!.location);
    }
  });

  it('estimates longer games for more rounds and shorter ones with fewer mini-games', () => {
    const all = estimateMinutes(EVERYTHING);
    expect(all).toHaveLength(ROUNDS_MAX);
    for (let i = 1; i < all.length; i++) expect(all[i - 1]).toBeLessThan(all[i]!);
    const fewer = estimateMinutes({ ...EVERYTHING, minis: MINIS_MIN });
    expect(fewer[3]).toBeLessThan(estimateMinutes({ ...EVERYTHING, minis: MINIS_MAX })[3]!);
  });
});

describe('pace', () => {
  it('stretches answer time only and shows up in the estimate', () => {
    const relaxed = pacedDurations(DURATIONS, 'relaxed');
    const brisk = pacedDurations(DURATIONS, 'brisk');
    expect(relaxed.voteAsk).toBeGreaterThan(DURATIONS.voteAsk);
    expect(brisk.selfieDraw).toBeLessThan(DURATIONS.selfieDraw);
    expect(relaxed.voteReveal).toBe(DURATIONS.voteReveal);
    const slow = estimateMinutes({ ...EVERYTHING, pace: 'relaxed' })[3]!;
    const fast = estimateMinutes({ ...EVERYTHING, pace: 'brisk' })[3]!;
    expect(slow).toBeGreaterThan(estimateMinutes(EVERYTHING)[3]!);
    expect(fast).toBeLessThan(estimateMinutes(EVERYTHING)[3]!);
  });
});
