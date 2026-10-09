/**
 * Secret missions: one hidden objective per player for the whole party, checked against what
 * happens in the game. The game reports events here; this module never touches scores itself.
 */
import { pick, shuffle } from '../util.js';
import type { Rng } from '../util.js';

export interface MissionView {
  text: string;
  done: boolean;
}

interface Mission {
  text: string;
  done: boolean;
  /** Counts toward the goal; what it counts depends on the mission. */
  count: number;
  /** Reacts to one event; returns true when this event completes the mission. */
  on: (event: MissionEvent, self: Mission) => boolean;
  /** Missions about what never happened can only be judged when the party is over. */
  atEnd?: (self: Mission) => boolean;
}

export type MissionEvent =
  /** A «Кто из нас?» question closed: who voted for whom, in answer order, and its sole leader. */
  | { kind: 'vote'; votes: Record<string, string>; order: string[]; leader: string | null }
  /** Anything a player typed: answers, chat messages, list items. */
  | { kind: 'text'; player: string; text: string }
  /** A mini-game finished with these points. */
  | { kind: 'game'; gains: Record<string, number> };

const SECRET_WORDS = ['банан', 'пингвин', 'кактус', 'носок', 'ракета', 'пельмень', 'единорог', 'батут', 'зонтик', 'огурец'];

const normal = (s: string) => s.toLowerCase().replaceAll('ё', 'е');

type Factory = (me: string, others: { id: string; name: string }[], rng: Rng) => Mission;

const FACTORIES: Factory[] = [
  (me) => ({
    text: 'Получите титул хотя бы в двух вопросах «Кто из нас?»',
    done: false,
    count: 0,
    on: (e, m) => e.kind === 'vote' && e.leader === me && ++m.count >= 2,
  }),
  (me, others, rng) => {
    const friend = pick(others, rng);
    return {
      text: `Голосуйте за игрока ${friend.name} в трёх вопросах`,
      done: false,
      count: 0,
      on: (e, m) => e.kind === 'vote' && e.votes[me] === friend.id && ++m.count >= 3,
    };
  },
  (_me, others, rng) => {
    const friend = pick(others, rng);
    return {
      text: `Добейтесь, чтобы титул в каком-нибудь вопросе достался игроку ${friend.name}`,
      done: false,
      count: 0,
      on: (e) => e.kind === 'vote' && e.leader === friend.id,
    };
  },
  (me) => ({
    text: 'Ответьте первым в трёх вопросах «Кто из нас?»',
    done: false,
    count: 0,
    on: (e, m) => e.kind === 'vote' && e.order[0] === me && ++m.count >= 3,
  }),
  (me) => ({
    text: 'Ответьте последним в трёх вопросах «Кто из нас?» — но успейте до конца таймера',
    done: false,
    count: 0,
    on: (e, m) => e.kind === 'vote' && e.order.length > 1 && e.order.at(-1) === me && ++m.count >= 3,
  }),
  (me) => ({
    text: 'Ни разу не голосуйте за того, кто получит титул (нужно хотя бы три голоса)',
    done: false,
    count: 0,
    on: (e, m) => {
      if (e.kind !== 'vote' || !(me in e.votes) || !e.leader) return false;
      m.count = e.votes[me] === e.leader || m.count < 0 ? -1 : m.count + 1;
      return false;
    },
    atEnd: (m) => m.count >= 3,
  }),
  (me) => ({
    text: 'Наберите больше всех очков в любой мини-игре',
    done: false,
    count: 0,
    on: (e) => {
      if (e.kind !== 'game') return false;
      const best = Math.max(0, ...Object.values(e.gains));
      return best > 0 && e.gains[me] === best && Object.values(e.gains).filter((g) => g === best).length === 1;
    },
  }),
  (me, _others, rng) => {
    const word = pick(SECRET_WORDS, rng);
    return {
      text: `Впишите слово «${word}» в любой свой ответ или сообщение`,
      done: false,
      count: 0,
      on: (e) => e.kind === 'text' && e.player === me && normal(e.text).includes(word),
    };
  },
  (me) => ({
    text: 'Не получите ни одного голоса в трёх вопросах подряд',
    done: false,
    count: 0,
    on: (e, m) => {
      if (e.kind !== 'vote' || Object.keys(e.votes).length === 0) return false;
      m.count = Object.values(e.votes).includes(me) ? 0 : m.count + 1;
      return m.count >= 3;
    },
  }),
];

export class Missions {
  private readonly byPlayer = new Map<string, Mission>();

  constructor(players: { id: string; name: string }[], rng: Rng) {
    // a room bigger than the list repeats missions, but never two of a kind in a row
    let deck: Factory[] = [];
    for (const p of players) {
      if (deck.length === 0) deck = shuffle(FACTORIES, rng);
      this.byPlayer.set(p.id, deck.pop()!(p.id, players.filter((o) => o.id !== p.id), rng));
    }
  }

  view(player: string): MissionView | undefined {
    const m = this.byPlayer.get(player);
    return m && { text: m.text, done: m.done };
  }

  /** Feeds an event to every unfinished mission; returns who just completed theirs. */
  report(event: MissionEvent): string[] {
    const finished: string[] = [];
    for (const [id, m] of this.byPlayer) {
      if (!m.done && m.on(event, m)) {
        m.done = true;
        finished.push(id);
      }
    }
    return finished;
  }

  /** Settles the missions judged at the end and lists everyone's outcome. */
  close(): { player: string; text: string; done: boolean }[] {
    for (const m of this.byPlayer.values()) if (!m.done && m.atEnd?.(m)) m.done = true;
    return [...this.byPlayer].map(([player, m]) => ({ player, text: m.text, done: m.done }));
  }
}
