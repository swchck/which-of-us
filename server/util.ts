import { randomBytes } from 'node:crypto';
import { NAME_MAX } from '../shared/protocol.js';
import { stripControls } from '../shared/catalog.js';

export type Rng = () => number;

export function newId(bytes = 6): string {
  return randomBytes(bytes).toString('base64url');
}

export function pick<T>(items: readonly T[], rng: Rng = Math.random): T {
  if (items.length === 0) throw new Error('pick from empty list');
  return items[Math.floor(rng() * items.length)]!;
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Mulberry32: tiny seedable PRNG so tests can replay a whole game. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const graphemes = new Intl.Segmenter('ru', { granularity: 'grapheme' });

/** The first `max` characters as a reader counts them, so an emoji at the cut is never split in half. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  let out = '';
  for (const { segment } of graphemes.segment(text)) {
    if (out.length + segment.length > max) break;
    out += segment;
  }
  return out;
}

export { stripControls };

export function cleanName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const name = clip(stripControls(raw).replace(/\s+/g, ' ').trim(), NAME_MAX).trim();
  return name.length > 0 ? name : null;
}

/** Joins names the Russian way: «Аня, Боря и Вика». */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} и ${names.at(-1)}`;
}

export function fill(template: string, name: string): string {
  return template.replaceAll('{name}', name);
}

/** Shared memory of what came up when; see FreshnessLog. */
export interface Freshness {
  lastUsed(kind: string, key: string): number;
  mark(kind: string, key: string): void;
}

/**
 * Endless deck: hands out items in random order, reshuffles once exhausted. With a freshness
 * log, each reshuffle puts the items unused for longest first, so a new room skips last night's.
 */
export class Deck<T> {
  private queue: T[] = [];

  constructor(
    private readonly items: readonly T[],
    private readonly rng: Rng,
    private readonly fresh?: { log: Freshness; kind: string; key: (item: T) => string },
  ) {}

  draw(): T {
    this.refill();
    const item = this.queue.pop()!;
    if (this.fresh) this.fresh.log.mark(this.fresh.kind, this.fresh.key(item));
    return item;
  }

  /** The next `n` items `draw` will return from the current shuffle; empty before the first draw. */
  get empty(): boolean {
    return this.items.length === 0;
  }

  peek(n: number): T[] {
    return this.queue.slice(-n).reverse();
  }

  /** The item the next `draw` returns, shuffling a fresh round first when the deck is spent. */
  next(): T {
    this.refill();
    return this.queue[this.queue.length - 1]!;
  }

  private refill(): void {
    if (this.queue.length > 0) return;
    this.queue = shuffle(this.items, this.rng);
    const f = this.fresh;
    // the queue pops from the end, so the stalest items go last
    if (f) this.queue.sort((a, b) => f.log.lastUsed(f.kind, f.key(b)) - f.log.lastUsed(f.kind, f.key(a)));
  }
}
