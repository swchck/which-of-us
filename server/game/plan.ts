import {
  LOCATIONS,
  QUESTIONS_MAX,
  QUESTIONS_MIN,
  ROUNDS_MAX,
  type GameId,
  type LocationId,
  type Pace,
  type Placement,
} from '../../shared/protocol.js';
import { GAME_INFO } from '../../shared/catalog.js';
import { placeScenes } from '../../shared/scenes.js';
import { pick, seededRng, shuffle, type Freshness, type Rng } from '../util.js';
import { PACE_FACTOR } from './types.js';

export type Segment = 'vote' | 'bonusVote' | GameId;

/**
 * group: «Кто из нас?» votes about everyone, with a mini-game or two in between.
 * spotlight: one player is the hero of the round and every question is about them.
 */
type RoundKind = 'group' | 'spotlight';

export interface Episode {
  location: LocationId;
  kind: RoundKind;
  segments: Segment[];
  /** The round moves to `scene` right before segment `at`; ordered by `at`, empty for a place without scenes. */
  scenes: { at: number; scene: string }[];
}

export interface PlanOptions {
  games: readonly GameId[];
  locations: readonly LocationId[];
  questions: number;
  minis: number;
  spotlight: boolean;
  /** Mixed when absent. */
  placement?: Placement;
  /** Only the estimate looks at it; normal when absent. */
  pace?: Pace;
  /** Prefers places and games that have not come up for longest, and records the ones picked. */
  fresh?: Freshness;
  /** Players in the room, bots included; games that need more are left out. Any game fits when absent. */
  players?: number;
}

/** Roughly how much of a segment is answer time, which is what the pace stretches. */
const ANSWER_SHARE = 0.6;

/** Questions about one person; in a spotlight round they are all about the hero. */
const HERO_QUESTIONS: readonly GameId[] = ['predict', 'scale'];
/** Mini-games that put the hero at the centre: the portrait is drawn of them. */
const HERO_GAMES: readonly GameId[] = ['selfie'];

/** Typical wall-clock length of each segment in seconds, for the lobby's length labels. */
const SEGMENT_SECONDS: Record<Segment, number> = {
  vote: 35,
  bonusVote: 35,
  predict: 35,
  scale: 45,
  story: 200,
  quote: 150,
  lie: 105,
  guess: 150,
  selfie: 160,
  describe: 160,
  monster: 240,
  shared: 180,
  photo: 115,
  tilt: 60,
  reflex: 35,
  never: 110,
  tap: 35,
  emoji: 190,
  herd: 100,
  duel: 80,
  sync: 110,
  bomb: 90,
  closest: 110,
  quip: 190,
  mime: 150,
  truth: 140,
  spy: 160,
  clue: 190,
  treasure: 180,
  list: 120,
  rps: 100,
  plot: 190,
  date: 270,
  masq: 160,
  radio: 300,
  rush: 150,
  blank: 120,
  market: 160,
  wave: 150,
  order: 130,
  freeze: 70,
  sumo: 70,
  tag: 70,
  tug: 50,
  odd: 110,
  even: 70,
  percent: 110,
  fib: 160,
  simon: 60,
  reply: 130,
  forehead: 100,
  hat: 300,
  just: 100,
  shaker: 45,
  clover: 240,
  quiz: 190,
  years: 220,
  tale: 230,
  copy: 130,
  rhyme: 200,
  junk: 230,
  ninja: 55,
  case: 170,
  contact: 240,
  band: 45,
  mafia: 330,
  paint: 70,
};
const INTRO_SECONDS = 10;
const SCORES_SECONDS = 10;
const SCENE_SECONDS = 6;

/** A round this long passes through two scenes of its place, a shorter one through one. */
const TWO_SCENES_SEGMENTS = 8;

/**
 * Puts mini-games after questions: at equal gaps, or after random questions. Either way each gap holds at most one
 * game while there are enough questions, so two games never run back to back and a round always opens on a question.
 */
function interleave(questions: Segment[], minis: Segment[], placement: Placement, rng: Rng): Segment[] {
  const n = questions.length;
  let slots: number[];
  if (placement === 'even' || minis.length >= n) {
    slots = [];
    for (let j = 0; j < minis.length; j++) {
      const even = Math.ceil(((j + 1) * n) / (minis.length + 1));
      slots.push(Math.min(n, Math.max((slots[j - 1] ?? 0) + 1, even)));
    }
  } else {
    slots = shuffle(Array.from({ length: n }, (_, i) => i + 1), rng)
      .slice(0, minis.length)
      .sort((a, b) => a - b);
  }
  return questions.flatMap((q, i) => [q, ...minis.filter((_, j) => slots[j] === i + 1)]);
}

/**
 * Builds a fresh running order. Rounds alternate between everyone and a spotlight on one
 * player (when spotlight rounds are on and a question kind about one person is allowed).
 * Mini-games are picked by fewest plays so far, then by how long ago they last came up.
 */
export function planGame(episodes: number, rng: Rng, options: PlanOptions): Episode[] {
  const log = options.fresh;
  const count = Math.max(1, Math.min(ROUNDS_MAX, episodes));
  const questions = Math.max(QUESTIONS_MIN, Math.min(QUESTIONS_MAX, options.questions));
  const placement = options.placement ?? 'mixed';
  const games = options.games.filter((g) => (GAME_INFO[g].players ?? 0) <= (options.players ?? Infinity));
  const heroQuestions = HERO_QUESTIONS.filter((g) => games.includes(g));
  const spotlight = options.spotlight && heroQuestions.length > 0 && count > 1;
  // with spotlight rounds the questions about one person live there, not among the mini-games
  const minisPool = games.filter((g) => !spotlight || !HERO_QUESTIONS.includes(g));
  const pool = options.locations.length > 0 ? options.locations : LOCATIONS;
  // fewer chosen places than rounds means a place comes back, but never twice in a row
  const locations: LocationId[] = [];
  while (locations.length < count) {
    const next = shuffle(pool, rng);
    if (log) next.sort((a, b) => log.lastUsed('place', a) - log.lastUsed('place', b));
    if (next.length > 1 && next[0] === locations.at(-1)) next.push(next.shift()!);
    locations.push(...next);
  }
  const played = new Map<Segment, number>();
  let previous: Segment | undefined;

  const pickMini = (allowed: readonly GameId[]): Segment | undefined => {
    if (allowed.length === 0) return undefined;
    const fresh = allowed.filter((s) => s !== previous);
    const age = (s: Segment) => log?.lastUsed('game', s) ?? 0;
    const chosen = shuffle(fresh.length > 0 ? fresh : allowed, rng).sort(
      (a, b) => (played.get(a) ?? 0) - (played.get(b) ?? 0) || age(a) - age(b),
    )[0]!;
    played.set(chosen, (played.get(chosen) ?? 0) + 1);
    previous = chosen;
    return chosen;
  };

  const plan = locations.slice(0, count).map((location, index): Episode => {
    const kind: RoundKind = spotlight && index % 2 === 1 ? 'spotlight' : 'group';
    let segments: Segment[];
    if (kind === 'spotlight') {
      const asked = Array.from({ length: questions }, () => pick(heroQuestions, rng));
      const heroGames = HERO_GAMES.filter((g) => games.includes(g));
      const minis = options.minis > 0 ? [pickMini(heroGames)].filter((m) => m !== undefined) : [];
      segments = interleave(asked, minis, placement, rng);
    } else {
      const minis: Segment[] = [];
      for (let i = 0; i < options.minis; i++) {
        const m = pickMini(minisPool);
        if (m) minis.push(m);
      }
      segments = interleave(Array<Segment>(questions).fill('vote'), minis, placement, rng);
    }
    if (index === count - 1) segments.push('bonusVote');
    return { location, kind, segments, scenes: pickScenes(location, segments.length, rng, log) };
  });
  for (const e of plan) {
    log?.mark('place', e.location);
    for (const s of e.segments) log?.mark('game', s);
    for (const s of e.scenes) log?.mark('scene', `${e.location}/${s.scene}`);
  }
  return plan;
}

/** Scenes the round moves through, spread evenly so each gets about as many segments as the place. */
function pickScenes(location: LocationId, segments: number, rng: Rng, log?: Freshness): Episode['scenes'] {
  const all = placeScenes(location);
  if (all.length === 0) return [];
  const count = Math.min(all.length, segments >= TWO_SCENES_SEGMENTS ? 2 : 1);
  const chosen = shuffle(all, rng);
  if (log) chosen.sort((a, b) => log.lastUsed('scene', `${location}/${a}`) - log.lastUsed('scene', `${location}/${b}`));
  return chosen.slice(0, count).map((scene, i) => ({ at: Math.round((segments * (i + 1)) / (count + 1)), scene }));
}

/** Average length in minutes of a game with these settings, for 1 to ROUNDS_MAX rounds. */
export function estimateMinutes(options: PlanOptions): number[] {
  const rng = seededRng(7);
  return Array.from({ length: ROUNDS_MAX }, (_, i) => {
    const rounds = i + 1;
    const samples = 30;
    let total = 0;
    for (let n = 0; n < samples; n++) {
      const plan = planGame(rounds, rng, options);
      total += plan.length * INTRO_SECONDS + (plan.length - 1) * SCORES_SECONDS;
      for (const e of plan) total += e.scenes.length * SCENE_SECONDS;
      for (const e of plan) for (const s of e.segments) total += SEGMENT_SECONDS[s];
    }
    const stretch = 1 + (PACE_FACTOR[options.pace ?? 'normal'] - 1) * ANSWER_SHARE;
    return Math.max(1, Math.round((total * stretch) / samples / 60));
  });
}
