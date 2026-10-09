import { GUESS_MAX } from '../../shared/protocol.js';
import { clip, stripControls } from '../util.js';

export type Verdict = 'right' | 'close' | 'wrong';

export function normalize(text: string): string {
  return text.toLowerCase().replaceAll('ё', 'е').replace(/[^\p{L}\p{N}]/gu, '');
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/** One typo is forgiven in words of 5+ letters; two typos or a word inside the guess count as close. */
export function judge(guess: string, word: string): Verdict {
  const g = normalize(guess);
  const w = normalize(word);
  if (g.length === 0) return 'wrong';
  if (g === w) return 'right';
  const d = levenshtein(g, w);
  if (w.length >= 5 && d <= 1) return 'right';
  if (d <= 2 || (g.length >= 4 && (w.includes(g) || g.includes(w)))) return 'close';
  return 'wrong';
}

export function cleanGuess(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const text = clip(stripControls(raw).replace(/\s+/g, ' ').trim(), GUESS_MAX);
  return text.length > 0 ? text : null;
}

/** "_ _ _ _" with the given letter positions revealed; spaces and hyphens are always shown. */
export function hintOf(word: string, revealed: ReadonlySet<number>): string {
  return [...word]
    .map((ch, i) => {
      if (ch === ' ') return ' ';
      if (ch === '-') return '-';
      return revealed.has(i) ? ch.toUpperCase() : '_';
    })
    .join(' ');
}

/** Points for a correct guess: 100 base plus up to 100 for speed, rounded to tens. */
export function guessPoints(timeLeftFraction: number): number {
  const bonus = Math.round((Math.max(0, Math.min(1, timeLeftFraction)) * 100) / 10) * 10;
  return 100 + bonus;
}

export const ARTIST_POINTS = 50;
