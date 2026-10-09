export const POINTS = {
  /** Per voter who picked the same leader, the voter included: the wider the agreement, the more it pays. */
  majorityPerMatch: 50,
  received: 100,
  predictHit: 150,
  predictTarget: 50,
  galleryVote: 100,
} as const;

export interface VoteResult {
  leaders: string[];
  gains: Record<string, number>;
  /** True when the votes are spread so evenly that nobody stands out. */
  noConsensus: boolean;
}

function countVotes(votes: Record<string, string>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const target of Object.values(votes)) counts.set(target, (counts.get(target) ?? 0) + 1);
  return counts;
}

function leadersOf(counts: Map<string, number>): string[] {
  let best = 0;
  for (const n of counts.values()) best = Math.max(best, n);
  if (best === 0) return [];
  return [...counts].filter(([, n]) => n === best).map(([id]) => id);
}

/**
 * Scores a "who of us" vote. In majority mode voters who picked a leader score 50 for every
 * voter who picked the same person; in received mode every vote received is worth points to its target.
 */
export function scoreVote(
  votes: Record<string, string>,
  scoring: 'majority' | 'received',
  multiplier = 1,
): VoteResult {
  const counts = countVotes(votes);
  const leaders = leadersOf(counts);
  const voters = Object.keys(votes).length;
  const gains: Record<string, number> = {};
  const noConsensus = voters >= 2 && leaders.length === voters;

  if (scoring === 'received') {
    for (const [target, n] of counts) gains[target] = n * POINTS.received * multiplier;
    return { leaders, gains, noConsensus };
  }
  // a lone voter agrees only with themselves
  if (noConsensus || voters < 2) return { leaders, gains, noConsensus };
  for (const [voter, target] of Object.entries(votes)) {
    if (leaders.includes(target)) gains[voter] = POINTS.majorityPerMatch * counts.get(target)! * multiplier;
  }
  return { leaders, gains, noConsensus };
}

export interface PredictResult {
  gains: Record<string, number>;
  hits: string[];
}

export function scorePredict(
  target: string,
  targetAnswer: number | undefined,
  guesses: Record<string, number>,
): PredictResult {
  const gains: Record<string, number> = {};
  const hits: string[] = [];
  if (targetAnswer === undefined) return { gains, hits };
  for (const [guesser, answer] of Object.entries(guesses)) {
    if (answer !== targetAnswer) continue;
    hits.push(guesser);
    gains[guesser] = POINTS.predictHit;
  }
  if (hits.length > 0) gains[target] = hits.length * POINTS.predictTarget;
  return { gains, hits };
}

export interface GalleryResult {
  /** item id -> voter ids */
  votes: Record<string, string[]>;
  winners: string[];
  gains: Record<string, number>;
}

/** Points per vote are split between co-authors, rounded to tens so the scoreboard stays tidy. */
export function scoreGallery(
  items: { id: string; authors: string[] }[],
  ballots: Record<string, string>,
): GalleryResult {
  const votes: Record<string, string[]> = {};
  for (const item of items) votes[item.id] = [];
  for (const [voter, itemId] of Object.entries(ballots)) votes[itemId]?.push(voter);

  const gains: Record<string, number> = {};
  for (const item of items) {
    const received = votes[item.id]!.length;
    if (received === 0 || item.authors.length === 0) continue;
    const share = Math.round((received * POINTS.galleryVote) / item.authors.length / 10) * 10;
    for (const author of item.authors) gains[author] = (gains[author] ?? 0) + share;
  }

  let best = 0;
  for (const v of Object.values(votes)) best = Math.max(best, v.length);
  const winners = best === 0 ? [] : items.filter((i) => votes[i.id]!.length === best).map((i) => i.id);
  return { votes, winners, gains };
}

/** Assigns monster chains: in step s, chain c is drawn by player (c + s) mod n. */
export function relayArtist(players: readonly string[], chain: number, step: number): string {
  return players[(chain + step) % players.length]!;
}

export function relayChainOf(players: readonly string[], player: string, step: number): number {
  const index = players.indexOf(player);
  const n = players.length;
  return (((index - step) % n) + n) % n;
}

export function sharedTurnCount(players: number): number {
  const laps = Math.min(3, Math.max(1, Math.ceil(6 / players)));
  return laps * players;
}

export interface RankInput {
  id: string;
  score: number;
  delta: number;
}

/** Standard competition ranking: equal scores share a place, the next place is skipped. */
export function rank(rows: RankInput[]): { player: string; score: number; delta: number; place: number }[] {
  const sorted = rows.slice().sort((a, b) => b.score - a.score);
  let place = 0;
  return sorted.map((row, i) => {
    if (i === 0 || row.score !== sorted[i - 1]!.score) place = i + 1;
    return { player: row.id, score: row.score, delta: row.delta, place };
  });
}
