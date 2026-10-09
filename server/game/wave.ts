import type { Spectrum } from '../content/spectrum.js';

/** «Волна» pays by how far a mark lands from the secret point, on the 0–100 scale. */
const WAVE_ZONES = [
  { within: 5, points: 200 },
  { within: 12, points: 120 },
  { within: 20, points: 50 },
] as const;

export function wavePoints(guess: number, target: number): number {
  const off = Math.abs(guess - target);
  return WAVE_ZONES.find((z) => off <= z.within)?.points ?? 0;
}

/** The sample sitting closest to `at`, skipping texts already taken; what a bot or a silent player names. */
export function nearestSample(spectrum: Spectrum, at: number, taken: ReadonlySet<string> = new Set()): string {
  const free = spectrum.samples.filter((s) => !taken.has(s.text));
  const pool = free.length > 0 ? free : spectrum.samples;
  return pool.reduce((best, s) => (Math.abs(s.at - at) < Math.abs(best.at - at) ? s : best)).text;
}

/** Where a bot believes a named thing sits: its sample's spot, or the middle for words it does not know. */
export function guessSpot(spectrum: Spectrum, text: string): number | undefined {
  const key = text.trim().toLowerCase();
  return spectrum.samples.find((s) => s.text.toLowerCase() === key)?.at;
}

/** Share of card pairs that `order` puts the right way round, from 0 to 1. */
export function orderAccuracy(order: readonly string[], numbers: ReadonlyMap<string, number>): number {
  let right = 0;
  let pairs = 0;
  for (let i = 0; i < order.length; i++) {
    for (let j = i + 1; j < order.length; j++) {
      pairs++;
      if (numbers.get(order[i]!)! < numbers.get(order[j]!)!) right++;
    }
  }
  return pairs === 0 ? 0 : right / pairs;
}
