import type { Moment, Phase } from '../../shared/protocol.js';

/** How many moments the final shows; the album keeps the same ones. */
export const MOMENTS_MAX = 8;
/** A three-round game would otherwise fill the whole reel on its own. */
const PER_KIND_MAX = 3;

function top<T>(items: readonly T[], score: (item: T) => number): T | undefined {
  let best: T | undefined;
  for (const item of items) if (score(item) > 0 && (!best || score(item) > score(best))) best = item;
  return best;
}

/** The moment a reveal leaves behind, if it has one worth keeping. */
export function momentOf(phase: Phase): Moment | null {
  switch (phase.kind) {
    case 'quipReveal': {
      const best = top(phase.answers, (a) => a.votes.length);
      return best ? { icon: '💬', label: `«Битва ответов»: ${phase.prompt}`, text: best.text, players: [best.author] } : null;
    }
    case 'rushReveal': {
      const best = top(phase.replies, (r) => r.votes.length);
      return best ? { icon: '⌨️', label: `«Без стёрки»: ${phase.from} — ${phase.message}`, text: best.text, players: [best.player] } : null;
    }
    case 'radioReveal': {
      const i = phase.tally.indexOf(Math.max(...phase.tally));
      const author = phase.authors[i];
      if (i < 0 || !phase.tally[i]) return null;
      return { icon: '📻', label: '«Сарафанное радио»: слух после всех пересказов', text: phase.finals[i]!, players: author ? [author] : [] };
    }
    case 'voteReveal':
      if (!phase.unanimous) return null;
      return { icon: '🃏', label: phase.title ? `Единогласно: «${phase.title}»` : 'Единогласно', text: phase.question, players: phase.leaders };
    case 'waveReveal': {
      const hits = Object.entries(phase.guesses).filter(([, g]) => Math.abs(g - phase.target) <= 5).map(([id]) => id);
      if (hits.length === 0) return null;
      return { icon: '🌊', label: `«Волна»: ${phase.left} — ${phase.right}`, text: `«${phase.hint}» — и точно в цель`, players: [phase.psychic, ...hits] };
    }
    case 'freezeReveal':
      if (phase.survivors.length === 0) return null;
      return { icon: '🧊', label: '«Замри!»: до конца продержались', text: 'Ледяное спокойствие', players: phase.survivors };
    default:
      return null;
  }
}

/** Up to MOMENTS_MAX, one of each kind before seconds of any, latest first within a kind, at most PER_KIND_MAX of a kind. */
export function pickMoments(all: readonly Moment[]): Moment[] {
  const byIcon = new Map<string, Moment[]>();
  for (const m of [...all].reverse()) byIcon.set(m.icon, [...(byIcon.get(m.icon) ?? []), m]);
  const out: Moment[] = [];
  for (let round = 0; round < PER_KIND_MAX && out.length < MOMENTS_MAX; round++) {
    for (const list of byIcon.values()) if (list[round] && out.length < MOMENTS_MAX) out.push(list[round]!);
  }
  return out;
}
