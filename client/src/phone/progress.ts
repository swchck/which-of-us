import { reactive } from 'vue';

/**
 * What this phone has done across parties: kept in localStorage only, so it belongs to the device
 * rather than a name, needs no account, and is gone with the browser's site data.
 */
export interface Progress {
  parties: number;
  wins: number;
  points: number;
  best: number;
  /** Titles from the final's awards, with how often each came. */
  awards: Record<string, number>;
  games: string[];
  badges: string[];
  /** The last few parties already counted, so a reload of the final screen does not count one twice. */
  counted: string[];
}

/** One party as the final screen sees it, from this phone's side. */
export interface PartyResult {
  id: string;
  place: number;
  score: number;
  awards: string[];
  games: string[];
}

interface Badge {
  id: string;
  icon: string;
  title: string;
  note: string;
  earned: (p: Progress, party: PartyResult) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first', icon: '🎉', title: 'Первая вечеринка', note: 'Сыграть одну игру', earned: (p) => p.parties >= 1 },
  { id: 'regular', icon: '🛋', title: 'Завсегдатай', note: 'Сыграть пять игр', earned: (p) => p.parties >= 5 },
  { id: 'soul', icon: '❤', title: 'Душа компании', note: 'Сыграть двадцать игр', earned: (p) => p.parties >= 20 },
  { id: 'winner', icon: '🏆', title: 'Чемпион', note: 'Занять первое место', earned: (p) => p.wins >= 1 },
  { id: 'hattrick', icon: '👑', title: 'Хет-трик', note: 'Победить трижды', earned: (p) => p.wins >= 3 },
  { id: 'thousand', icon: '💎', title: 'Тысячник', note: 'Набрать тысячу очков за игру', earned: (_, party) => party.score >= 1000 },
  { id: 'bank', icon: '💸', title: 'Копилка', note: 'Набрать десять тысяч очков за всё время', earned: (p) => p.points >= 10_000 },
  { id: 'titled', icon: '🥇', title: 'Со званием', note: 'Получить звание в финале', earned: (p) => Object.keys(p.awards).length >= 1 },
  { id: 'star', icon: '🌟', title: 'Звезда вечера', note: 'Получить два звания за одну игру', earned: (_, party) => party.awards.length >= 2 },
  { id: 'explorer', icon: '🔎', title: 'Исследователь', note: 'Попробовать пятнадцать разных мини-игр', earned: (p) => p.games.length >= 15 },
  { id: 'collector', icon: '🧩', title: 'Коллекционер', note: 'Попробовать сорок разных мини-игр', earned: (p) => p.games.length >= 40 },
];

const KEY = 'kto-progress';
/** Parties remembered as counted; a final is only ever re-shown for the game just played. */
const COUNTED_MAX = 20;

function empty(): Progress {
  return { parties: 0, wins: 0, points: 0, best: 0, awards: {}, games: [], badges: [], counted: [] };
}

function load(): Progress {
  // private windows and blocked site data throw on access; the phone then just keeps no record
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Record<keyof Progress, unknown>>;
    const p = empty();
    const count = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
    const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
    p.parties = count(saved.parties);
    p.wins = count(saved.wins);
    p.points = count(saved.points);
    p.best = count(saved.best);
    p.games = list(saved.games);
    p.badges = list(saved.badges);
    p.counted = list(saved.counted);
    if (saved.awards && typeof saved.awards === 'object' && !Array.isArray(saved.awards)) {
      for (const [title, n] of Object.entries(saved.awards)) p.awards[title] = count(n);
    }
    return p;
  } catch {
    return empty();
  }
}

export const progress = reactive<Progress>(load());

/** Counts a finished party once and returns the badges it unlocked. */
export function record(party: PartyResult): Badge[] {
  if (progress.counted.includes(party.id)) return [];
  progress.counted = [...progress.counted, party.id].slice(-COUNTED_MAX);
  progress.parties++;
  if (party.place === 1) progress.wins++;
  progress.points += party.score;
  progress.best = Math.max(progress.best, party.score);
  for (const title of party.awards) progress.awards[title] = (progress.awards[title] ?? 0) + 1;
  progress.games = [...new Set([...progress.games, ...party.games])];
  const fresh = BADGES.filter((b) => !progress.badges.includes(b.id) && b.earned(progress, party));
  progress.badges = [...progress.badges, ...fresh.map((b) => b.id)];
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // storage refused: the record still holds until the page reloads
  }
  return fresh;
}
