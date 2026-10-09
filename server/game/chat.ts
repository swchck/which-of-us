/**
 * The phone messenger behind the chat mini-games: direct chats between any two players plus named
 * groups. It validates and stores messages and projects each player's view; what a message means
 * for scoring is up to the game running it.
 */
import { dmThread, stripControls } from '../../shared/catalog.js';
import {
  CHAT_GAP_MS,
  CHAT_MESSAGE_MAX,
  CHAT_MESSAGES_MAX,
  type ChatFlight,
  type ChatMessage,
  type ChatThread,
} from '../../shared/protocol.js';
import { clip } from '../util.js';

/** How many recent messages the TV animates. */
const FLIGHTS_SHOWN = 24;

export class Chat {
  private readonly threads = new Map<string, ChatThread>();
  private readonly sent = new Map<string, number>();
  private readonly lastAt = new Map<string, number>();
  private seq = 0;
  readonly flights: ChatFlight[] = [];

  private readonly limit: number;
  private readonly now: () => number;

  constructor(
    private readonly players: readonly string[],
    opts: {
      groups?: { id: string; title: string; members: string[] }[];
      /** Messages each player may send per round; see `nextRound`. */
      limit?: number;
      now?: () => number;
    } = {},
  ) {
    this.limit = opts.limit ?? CHAT_MESSAGES_MAX;
    this.now = opts.now ?? Date.now;
    for (const g of opts.groups ?? []) this.threads.set(g.id, { id: g.id, title: g.title, members: g.members, messages: [] });
  }

  /** Messages `player` may still send this round. */
  left(player: string): number {
    return this.limit - (this.sent.get(player) ?? 0);
  }

  /** Gives everyone a fresh message allowance; conversations carry on where they were. */
  nextRound(): void {
    this.sent.clear();
    this.flights.length = 0;
  }

  /**
   * Posts `text` from `from` to `threadId` (a group, or a direct chat that is created on first use).
   * Returns the stored message, or null when the post breaks a rule.
   */
  post(from: string, threadId: string, raw: string): ChatMessage | null {
    if (!this.players.includes(from) || this.left(from) <= 0) return null;
    const at = this.now();
    if (at - (this.lastAt.get(from) ?? 0) < CHAT_GAP_MS) return null;
    const text = clip(stripControls(raw.slice(0, CHAT_MESSAGE_MAX * 4)).replace(/\s+/g, ' ').trim(), CHAT_MESSAGE_MAX);
    if (!text) return null;
    const thread = this.thread(threadId, from);
    if (!thread) return null;
    const message = { id: ++this.seq, from, text, at };
    thread.messages.push(message);
    this.sent.set(from, (this.sent.get(from) ?? 0) + 1);
    this.lastAt.set(from, at);
    // a group's traffic stays off the TV: whoever writes to it would give the group away
    if (thread.id.startsWith('dm:')) {
      this.flights.push({ id: message.id, from, to: thread.members.find((m) => m !== from)! });
      if (this.flights.length > FLIGHTS_SHOWN) this.flights.splice(0, this.flights.length - FLIGHTS_SHOWN);
    }
    return message;
  }

  private thread(id: string, from: string): ChatThread | null {
    const existing = this.threads.get(id);
    if (existing) return existing.members.includes(from) ? existing : null;
    const match = /^dm:(.+):(.+)$/.exec(id);
    if (!match || match[1] === match[2] || !match.slice(1).includes(from)) return null;
    const members = [match[1]!, match[2]!];
    if (!members.every((m) => this.players.includes(m)) || dmThread(members[0]!, members[1]!) !== id) return null;
    const thread = { id, members, messages: [] };
    this.threads.set(id, thread);
    return thread;
  }

  /** The conversations `player` is part of, groups first. */
  view(player: string): ChatThread[] {
    return [...this.threads.values()]
      .filter((t) => t.members.includes(player))
      .sort((a, b) => Number(a.id.startsWith('dm:')) - Number(b.id.startsWith('dm:')));
  }

  /** Every message `player` has sent, oldest first. */
  by(player: string): ChatMessage[] {
    return [...this.threads.values()].flatMap((t) => t.messages.filter((m) => m.from === player)).sort((a, b) => a.id - b.id);
  }

  get total(): number {
    return this.seq;
  }
}

function normal(text: string): string {
  return text.toLowerCase().replaceAll('ё', 'е');
}

/**
 * Whether `text` contains `word` in any grammatical form: «пельменей» counts for «пельмени».
 * The word loses its ending vowel, and a long one two more letters, but the stem never drops below
 * four letters unless the word is that short; a match may run only a few letters past the word,
 * so «котлета» is not «кот».
 */
export function mentions(text: string, word: string): boolean {
  const target = normal(word);
  const base = target.replace(/[аяоеёыиуюьй]$/, '');
  const stem = base.length <= 4 ? base : base.slice(0, Math.max(4, base.length - 2));
  return normal(text)
    .split(/[^\p{L}]+/u)
    .some((w) => w.startsWith(stem) && w.length <= target.length + 3);
}
