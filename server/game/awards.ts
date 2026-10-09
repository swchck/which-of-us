import type { Award } from '../../shared/protocol.js';
import { shuffle, type Rng } from '../util.js';
import type { Player, Stats } from './types.js';

interface StatAward {
  stat: Exclude<keyof Stats, 'titles'>;
  title: string;
  detail: (n: number) => string;
}

const STAT_AWARDS: StatAward[] = [
  { stat: 'predictHits', title: 'Телепат', detail: (n) => `Угаданных ответов: ${n}` },
  { stat: 'guessedAbout', title: 'Открытая книга', detail: (n) => `Друзья угадали ответы ${n} раз` },
  { stat: 'art', title: 'Художник вечера', detail: (n) => `Голосов за рисунки: ${round(n)}` },
  { stat: 'photo', title: 'Мастер гримас', detail: (n) => `Голосов за фото: ${round(n)}` },
  { stat: 'majority', title: 'Голос народа', detail: (n) => `Совпадений с большинством: ${n}` },
  { stat: 'guessHits', title: 'Зоркий глаз', detail: (n) => `Угаданных рисунков: ${n}` },
  { stat: 'drawingsSolved', title: 'Понятный художник', detail: (n) => `Рисунки угадали ${n} раз` },
  { stat: 'stars', title: 'Ловец звёзд', detail: (n) => `Собрано звёзд: ${n}` },
  { stat: 'fooled', title: 'Мастер маскировки', detail: (n) => `Запутанных игроков: ${n}` },
  { stat: 'reflexWins', title: 'Самый быстрый палец', detail: (n) => `Выигранных раундов реакции: ${n}` },
];

const MAX_TITLES = 5;

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Stat awards go to a single clear leader only; ties would make the trophy meaningless. */
export function buildAwards(players: Player[], rng: Rng): Award[] {
  const awards: Award[] = [];
  for (const a of STAT_AWARDS) {
    const best = Math.max(0, ...players.map((p) => p.stats[a.stat]));
    if (best <= 0) continue;
    const leaders = players.filter((p) => p.stats[a.stat] === best);
    if (leaders.length !== 1) continue;
    awards.push({ title: a.title, detail: a.detail(best), player: leaders[0]!.id });
  }
  const titles = players.flatMap((p) =>
    p.stats.titles.map((t) => ({ title: t.title, detail: t.question, player: p.id })),
  );
  awards.push(...shuffle(titles, rng).slice(0, MAX_TITLES));
  return awards;
}
