import { clueProblem, dmThread, givesAway } from '../../shared/catalog.js';
import { JUNK_BIDS, NINJA_BOMB, MONSTER_GUIDE, PERCENT_STEP, RPS_THROWS, SCALE_MAX, SIMON_COLORS } from '../../shared/protocol.js';
import { guessSpot, nearestSample } from './wave.js';
import { junkBotPitches, rhymeBotLines, taleBotClues, blankBotFills, emojiBotRows, garble, marketClueLine, marketSmallTalk, masqSmallTalk, rushAnyReplies, rushMessages, guessWords, lieBotStatements, plotPlotterTalk, plotSmallTalk, quoteBotAnswers, storyBotLines } from '../content/index.js';
import { doodle, faceSvg, type Mood } from './art.js';
import type { Game } from './game.js';
import type { GameHost, Player } from './types.js';
import { pick, shuffle } from '../util.js';

export const BOT_NAMES = ['Робот Вася', 'Кибер-Маша', 'Бот Пётр', 'Нейро-Оля', 'Чайник', 'Тостер', 'Бип-Буп', 'Пылесос'];

/** Russian keyboard rows: a hurried bot hits a key next to the one it meant. */
const KEY_ROWS = ['йцукенгшщзхъ', 'фывапролджэ', 'ячсмитьбю'];

function slip(text: string, rng: () => number): string {
  return [...text]
    .map((ch) => {
      const row = KEY_ROWS.find((r) => r.includes(ch));
      if (!row || rng() > 0.06) return ch;
      const i = row.indexOf(ch);
      return ch + row[Math.min(row.length - 1, Math.max(0, i + (rng() < 0.5 ? -1 : 1)))]!;
    })
    .join('');
}

const MOODS: Mood[] = ['grin', 'wow', 'grumpy', 'silly'];
/** Bots have no sense of humour, so their punchlines are honest about it. */
const QUIP_LINES = ['Ошибка 404: шутка не найдена', 'Бип-буп, это смешно', 'Загружаю чувство юмора…', 'Спросите у моего создателя', 'Тостер одобряет'];
/** Off-the-wall «Стадное чувство» answers for when a bot goes its own way. */
const HERD_STRAYS = ['Кот', 'Пицца', 'Бабушка', 'Не знаю', 'Банан', 'Море', 'Борщ', 'Синий'];
/** «Контакт»: hints vague enough to fit any word. */
const CONTACT_BOT_HINTS = ['Это бывает дома', 'Это можно потрогать', 'Это знают все', 'Это бывает летом', 'Это есть в городе', 'Это встречается в сказках'];
const BOT_CLOVER_CLUES = ['Лето', 'Детство', 'Праздник', 'Дорога', 'Вкусно', 'Шум', 'Круглое', 'Мечта'];
const FOREHEAD_BOT_HINTS = ['Бывает дома', 'Это весело', 'Знают все дети', 'Можно потрогать', 'Яркое', 'Встречается летом', 'Не помещается в карман'];
/** «Словарь выдумок»: fakes that sound like any old dictionary entry. */
const FIB_BOT_DEFS = [
  'Старинная деревянная ложка для мёда',
  'Мелкая северная рыба',
  'Танец моряков на палубе',
  'Шапка с ушами у ямщика',
  'Медная кастрюля для варенья',
  'Узел на рыболовной сети',
  'Игра в мяч у древних славян',
  'Ласковое прозвище для кота',
];

interface Step {
  bot: string;
  fn: () => void;
  due: number;
  /** Time still to go when paused. */
  left?: number;
  timer?: ReturnType<typeof setTimeout>;
}

/** Bots spend jokers now and then; the game refuses one where jokers do not apply. */
const BOT_JOKER_CHANCE = 0.12;

/**
 * Drives bot players through the same game entry points phones use. `pace` scales the
 * think time, so tests can run bots at full speed. Bots freeze while the game is paused and
 * finish at once when the humans are done, so nobody waits on their fake thinking.
 */
export class BotDriver {
  private steps: Step[] = [];
  /** Per bot, what to do instead of the remaining steps when told to hurry. */
  private rush = new Map<string, () => void>();
  private paused = false;

  constructor(
    private readonly host: GameHost,
    private readonly game: Game,
    private readonly pace = 1,
  ) {
    game.listen({
      phase: () => this.phaseStarted(),
      hurry: () => this.hurry(),
      paused: (paused) => (paused ? this.pause() : this.resume()),
    });
  }

  stop(): void {
    for (const step of this.steps) clearTimeout(step.timer);
    this.steps = [];
    this.rush.clear();
  }

  private later(bot: Player, ms: number, fn: () => void): void {
    const step: Step = { bot: bot.id, fn, due: Date.now() + ms * this.pace };
    this.steps.push(step);
    if (this.paused) step.left = step.due - Date.now();
    else this.arm(step);
  }

  private arm(step: Step): void {
    step.timer = setTimeout(
      () => {
        this.steps = this.steps.filter((s) => s !== step);
        step.fn();
      },
      Math.max(0, step.due - Date.now()),
    );
  }

  private pause(): void {
    this.paused = true;
    const now = Date.now();
    for (const step of this.steps) {
      clearTimeout(step.timer);
      step.left = step.due - now;
    }
  }

  private resume(): void {
    this.paused = false;
    const now = Date.now();
    for (const step of this.steps) {
      step.due = now + (step.left ?? 0);
      this.arm(step);
    }
  }

  private hurry(): void {
    const pending = [...this.steps].sort((a, b) => a.due - b.due);
    const rush = new Map(this.rush);
    this.stop();
    const rushed = new Set<string>();
    for (const step of pending) {
      const instead = rush.get(step.bot);
      if (!instead) step.fn();
      else if (!rushed.has(step.bot)) {
        rushed.add(step.bot);
        instead();
      }
    }
  }

  private think(min: number, max: number): number {
    return min + this.host.rng() * (max - min);
  }

  private bots(): Player[] {
    return this.host.players().filter((p) => p.bot && p.connected);
  }

  /**
   * One «Заговор» bot, writing every few seconds until the chat closes: a plotter sends the target
   * lures, a target answers what it was asked (sometimes with the very word), a bystander chats.
   */
  private plotChat(bot: Player, phaseId: number): void {
    const rng = this.host.rng;
    const tick = () => {
      const me = this.game.personal(bot.id);
      const secret = this.game.plotSecret();
      if (this.game.phaseId !== phaseId || me.kind !== 'plot' || !secret || me.left <= 0) return;
      const others = this.host.players().filter((p) => p.connected && p.id !== bot.id);
      const unanswered = me.chats.find((t) => t.id.startsWith('dm:') && t.messages.at(-1)?.from !== bot.id && t.messages.length > 0);
      let post: { thread: string; text: string } | null = null;
      if (me.role === 'plotter') {
        post =
          rng() < 0.25
            ? { thread: 'group:plot', text: pick(plotPlotterTalk, rng) }
            : { thread: dmThread(bot.id, me.target), text: pick(me.lures ?? secret.lures, rng) };
      } else if (unanswered) {
        const asked = unanswered.messages.at(-1)!.text;
        // a lure is a question; a bot target falls for one now and then, which keeps the trap winnable
        const bite = me.role === 'target' && asked.includes('?') && rng() < 0.3;
        post = { thread: unanswered.id, text: bite ? `Наверное, ${secret.word}?` : pick(plotSmallTalk, rng) };
      } else if (others.length > 0 && rng() < 0.5) {
        post = { thread: dmThread(bot.id, pick(others, rng).id), text: pick(plotSmallTalk, rng) };
      }
      if (post) this.game.answer(bot.id, phaseId, post);
      this.later(bot, this.think(5000, 12000), tick);
    };
    this.later(bot, this.think(2000, 6000), tick);
  }

  /** One «Свидание вслепую» bot: answers whoever wrote last, otherwise opens a chat, in its own quirk. */
  private dateChat(bot: Player, phaseId: number): void {
    const rng = this.host.rng;
    const tick = () => {
      const me = this.game.personal(bot.id);
      const quirk = this.game.dateQuirk(bot.id);
      if (this.game.phaseId !== phaseId || me.kind !== 'date' || !quirk || me.left <= 0) return;
      const waiting = me.chats.find((t) => t.messages.at(-1) && t.messages.at(-1)!.from !== bot.id);
      const others = this.host.players().filter((p) => p.connected && p.id !== bot.id);
      const thread = waiting?.id ?? (others.length > 0 ? dmThread(bot.id, pick(others, rng).id) : null);
      if (thread) this.game.answer(bot.id, phaseId, { thread, text: pick(quirk.bot, rng) });
      this.later(bot, this.think(9000, 16000), tick);
    };
    this.later(bot, this.think(2000, 8000), tick);
  }

  /** One «Маскарад» bot: answers the current topic, sometimes just chats along. */
  private masqChat(bot: Player, phaseId: number): void {
    const rng = this.host.rng;
    const tick = () => {
      const me = this.game.personal(bot.id);
      const topic = this.game.masqTopic();
      if (this.game.phaseId !== phaseId || me.kind !== 'masq' || !topic || me.left <= 0) return;
      const said = new Set(me.chats.flatMap((t) => t.messages.map((m) => m.text)));
      const fresh = topic.bot.filter((line) => !said.has(line));
      const text = fresh.length > 0 && rng() < 0.7 ? pick(fresh, rng) : pick(masqSmallTalk, rng);
      this.game.answer(bot.id, phaseId, { thread: me.chats[0]?.id ?? '', text });
      this.later(bot, this.think(8000, 16000), tick);
    };
    this.later(bot, this.think(3000, 9000), tick);
  }

  /** One «Без стёрки» bot: types its reply a few letters at a time, slips included, then sends it. */
  private rushType(bot: Player, phaseId: number, message: string, line: number): void {
    const rng = this.host.rng;
    const lines = [...(rushMessages.find((m) => m.text === message)?.bot ?? []), ...rushAnyReplies];
    const target = slip(lines[line % lines.length]!, rng);
    let typed = '';
    const tick = () => {
      if (this.game.phaseId !== phaseId) return;
      typed = target.slice(0, typed.length + 2 + Math.floor(rng() * 3));
      const final = typed.length >= target.length;
      this.game.answer(bot.id, phaseId, { text: typed, final });
      if (!final) this.later(bot, this.think(500, 1300), tick);
    };
    this.later(bot, this.think(3000, 8000), tick);
    this.rush.set(bot.id, () => {
      if (this.game.phaseId === phaseId) this.game.answer(bot.id, phaseId, { text: target, final: true });
    });
  }

  /** One «Рынок слухов» bot: shares its clues honestly, then names a version from what it knows. */
  private marketTrade(bot: Player, phaseId: number, deadline: number): void {
    const rng = this.host.rng;
    const tick = () => {
      const me = this.game.personal(bot.id);
      const known = this.game.marketView(bot.id);
      if (this.game.phaseId !== phaseId || me.kind !== 'market' || !known || me.left <= 0) return;
      const others = this.host.players().filter((p) => p.connected && p.id !== bot.id);
      if (others.length > 0) {
        const k = Math.floor(rng() * known.categories.length);
        const cat = known.categories[k]!;
        const text = rng() < 0.7 ? marketClueLine(cat.title, cat.options[me.clues[k]!]!) : pick(marketSmallTalk, rng);
        this.game.answer(bot.id, phaseId, { thread: dmThread(bot.id, pick(others, rng).id), text });
      }
      this.later(bot, this.think(8000, 15000), tick);
    };
    this.later(bot, this.think(2000, 6000), tick);
    const window = Math.max(0, deadline - Date.now()) / this.pace;
    this.later(bot, window * (0.5 + rng() * 0.35), () => {
      const me = this.game.personal(bot.id);
      const known = this.game.marketView(bot.id);
      if (me.kind !== 'market' || !known || me.guess) return;
      const heard = me.chats.flatMap((t) => t.messages.filter((m) => m.from !== bot.id).map((m) => m.text.toLowerCase()));
      const guess = known.categories.map((cat, k) => {
        const open = cat.options
          .map((o, i) => i)
          .filter((i) => i !== me.clues[k] && !heard.some((h) => h.includes(`не ${cat.options[i]!.toLowerCase()}`)));
        return pick(open.length > 0 ? open : cat.options.map((_, i) => i), rng);
      });
      this.game.answer(bot.id, phaseId, guess);
    });
  }

  private phaseStarted(): void {
    this.stop();
    const phase = this.game.phase;
    const phaseId = this.game.phaseId;
    const rng = this.host.rng;
    for (const bot of this.bots()) {
      switch (phase.kind) {
        case 'vote': {
          if (phase.duel && phase.options.includes(bot.id)) break;
          const options = phase.options.filter((id) => phase.allowSelf || id !== bot.id);
          if (options.length === 0) break;
          const joker = rng() < BOT_JOKER_CHANCE;
          this.later(bot, this.think(2000, 9000), () => {
            if (joker) this.game.playJoker(bot.id, phaseId);
            this.game.answer(bot.id, phaseId, pick(options, rng));
          });
          break;
        }
        case 'write': {
          if (phase.author && phase.author !== bot.id) break;
          if (phase.rhyme) {
            this.later(bot, this.think(5000, 20000), () => this.game.answer(bot.id, phaseId, pick(rhymeBotLines, rng)));
            break;
          }
          if (phase.junk) {
            this.later(bot, this.think(5000, 20000), () => this.game.answer(bot.id, phaseId, pick(junkBotPitches, rng)));
            break;
          }
          if (phase.tale) {
            this.later(bot, this.think(4000, 12000), () => this.game.answer(bot.id, phaseId, pick(taleBotClues, rng)));
            break;
          }
          if (phase.quip) {
            const me = this.game.personal(bot.id);
            if (me.kind !== 'write' || !me.prompt) break;
            const line = pick(QUIP_LINES, rng);
            this.later(bot, this.think(4000, 15000), () => this.game.answer(bot.id, phaseId, line));
            break;
          }
          if (phase.clue) {
            const clue = this.game.botClue(bot.id);
            if (clue) this.later(bot, this.think(4000, 15000), () => this.game.answer(bot.id, phaseId, clue));
            break;
          }
          if (phase.forehead) {
            if (phase.forehead === bot.id) break;
            const word = this.game.foreheadSecret() ?? '';
            const hint = shuffle(FOREHEAD_BOT_HINTS, rng).find((h) => !givesAway(word, h));
            if (hint) this.later(bot, this.think(3000, 12000), () => this.game.answer(bot.id, phaseId, hint));
            break;
          }
          if (phase.clover) {
            const me = this.game.personal(bot.id);
            if (me.kind !== 'write' || !me.clover) break;
            const words = me.clover;
            const pool = shuffle([...BOT_CLOVER_CLUES, ...guessWords.filter((w) => !/\s/.test(w))], rng);
            const clues = words.map((w, k) => {
              const pair = [w, words[(k + 1) % words.length]!];
              return pool.find((c) => !pair.some((p) => clueProblem(p, c))) ?? 'Хм';
            });
            this.later(bot, this.think(8000, 30000), () => this.game.answer(bot.id, phaseId, clues));
            break;
          }
          if (phase.hat) {
            this.later(bot, this.think(3000, 12000), () => this.game.answer(bot.id, phaseId, pick(guessWords, rng)));
            break;
          }
          if (phase.odd) {
            this.later(bot, this.think(3000, 12000), () => this.game.answer(bot.id, phaseId, pick(HERD_STRAYS, rng)));
            break;
          }
          if (phase.herd) {
            // the answer is picked when it is sent, so a slow bot can join a herd that formed meanwhile
            this.later(bot, this.think(3000, 12000), () => {
              const seen = this.game.writtenSoFar();
              const answer = seen.length > 0 && rng() < 0.6 ? pick(seen, rng) : pick(HERD_STRAYS, rng);
              this.game.answer(bot.id, phaseId, answer);
            });
            break;
          }
          const answer = phase.slots
            ? shuffle(lieBotStatements, rng).slice(0, phase.slots.length)
            : pick(phase.emoji ? emojiBotRows : phase.story ? storyBotLines : phase.blank ? blankBotFills : phase.fib ? FIB_BOT_DEFS : quoteBotAnswers, rng);
          this.later(bot, this.think(4000, 15000), () => this.game.answer(bot.id, phaseId, answer));
          break;
        }
        case 'reflex': {
          // bots are fast but beatable, and once in a while they jump the gun like people do
          if (phase.stage === 'wait') {
            if (rng() < 0.06) this.later(bot, this.think(300, 1200), () => this.game.answer(bot.id, phaseId, 'early'));
            break;
          }
          if (phase.stage === 'decoy') {
            if (rng() < 0.2) this.later(bot, this.think(250, 500), () => this.game.answer(bot.id, phaseId, 'early'));
            break;
          }
          const ms = Math.round(this.think(230, 650));
          this.later(bot, ms, () => this.game.answer(bot.id, phaseId, ms));
          break;
        }
        case 'scale': {
          // bots lean to the middle, like people who don't know the person well
          const value = Math.max(0, Math.min(SCALE_MAX, Math.round(5 + (rng() + rng() - 1) * 5)));
          this.later(bot, this.think(2000, 8000), () => this.game.answer(bot.id, phaseId, value));
          break;
        }
        case 'never': {
          const did = rng() < 0.4 ? 1 : 0;
          const guess = Math.round(rng() * phase.players);
          this.later(bot, this.think(2000, 8000), () => this.game.answer(bot.id, phaseId, `${did}:${guess}`));
          break;
        }
        case 'tap': {
          const rate = this.think(4, 9);
          const opensIn = Math.max(0, phase.startsAt - Date.now()) / this.pace;
          const window = (phase.deadline - phase.startsAt) / this.pace;
          for (let i = 1; i <= 5; i++) {
            this.later(bot, opensIn + (window * i) / 5, () => {
              const elapsed = Math.max(0, Math.min(Date.now(), phase.deadline) - phase.startsAt) / 1000;
              this.game.answer(bot.id, phaseId, Math.floor((elapsed * rate) / this.pace));
            });
          }
          break;
        }
        case 'contactWrite': {
          if (phase.leader === bot.id) break;
          const prefix = phase.prefix.toLowerCase().replace(/ё/g, 'е');
          const words = guessWords.filter((w) => /^[А-ЯЁа-яё]+$/.test(w) && w.toLowerCase().replace(/ё/g, 'е').startsWith(prefix) && w.length > prefix.length);
          if (words.length === 0) break;
          const w = pick(words, rng);
          const hint = shuffle(CONTACT_BOT_HINTS, rng).find((h) => !clueProblem(w, h));
          if (hint) this.later(bot, this.think(5000, 20000), () => this.game.answer(bot.id, phaseId, [w, hint]));
          break;
        }
        case 'contactGuess': {
          const me = this.game.personal(bot.id);
          if (me.kind !== 'contactGuess') break;
          const hints = phase.hints.filter((h) => h.id !== me.mine);
          if (hints.length === 0) break;
          // right about a third of the time, and once in a while straight at the leader's word
          const guess = (id: string) => {
            const secret = this.game.contactSecret();
            if (!me.leader && secret && rng() < 0.08) return secret;
            return rng() < 0.35 ? (this.game.contactHintWord(id) ?? pick(guessWords, rng)) : pick(guessWords, rng);
          };
          const value = me.leader ? hints.map((h) => `${h.id}:${guess(h.id)}`) : (() => {
            const h = pick(hints, rng);
            return `${h.id}:${guess(h.id)}`;
          })();
          this.later(bot, this.think(5000, 18000), () => this.game.answer(bot.id, phaseId, value));
          break;
        }
        case 'band': {
          const part = phase.parts[bot.id];
          if (!part) break;
          // a bot hits most notes a little off the beat, so its accuracy lands below a careful person's
          const opensIn = Math.max(0, phase.startsAt - Date.now()) / this.pace;
          for (const n of part.notes) {
            if (rng() > 0.85) continue;
            const off = (rng() - 0.5) * 240;
            // stamped when it fires: a pause moves startsAt after the plan is made
            this.later(bot, opensIn + (n * phase.beat) / this.pace, () => {
              const live = this.game.phase;
              if (live.kind === 'band') this.game.answer(bot.id, phaseId, live.startsAt + n * live.beat + off);
            });
          }
          break;
        }
        case 'caseSurvey': {
          const picks = phase.questions.map((q) => Math.floor(rng() * q.options.length));
          this.later(bot, this.think(4000, 15000), () => this.game.answer(bot.id, phaseId, picks));
          break;
        }
        case 'caseClue': {
          const me = this.game.personal(bot.id);
          if (me.kind !== 'caseClue' || me.culprit || me.answer || phase.accused.includes(bot.id)) break;
          // a bot holds out for more clues, then points at the culprit more often the more clues it saw
          if (phase.round < phase.rounds && rng() < 0.6) break;
          const culprit = this.game.caseSecret();
          const others = this.host.players().filter((p) => p.id !== bot.id).map((p) => p.id);
          const suspect = culprit && culprit !== bot.id && rng() < 0.2 * phase.round ? culprit : pick(others, rng);
          this.later(bot, this.think(3000, 12000), () => this.game.answer(bot.id, phaseId, suspect));
          break;
        }
        case 'junkBid': {
          const me = this.game.personal(bot.id);
          if (me.kind !== 'junkBid' || me.seller) break;
          const affordable = JUNK_BIDS.filter((b) => b <= me.coins);
          this.later(bot, this.think(3000, 10000), () => this.game.answer(bot.id, phaseId, pick(affordable, rng)));
          break;
        }
        case 'ninja': {
          // a bot cuts most fruit and now and then a bomb, at a random moment of each flight
          const opensIn = Math.max(0, phase.startsAt - Date.now()) / this.pace;
          for (const f of phase.fruits) {
            const bomb = f.kind === NINJA_BOMB;
            if (rng() > (bomb ? 0.15 : 0.7)) continue;
            this.later(bot, opensIn + (f.at + f.flight * (0.2 + rng() * 0.6)) / this.pace, () => this.game.answer(bot.id, phaseId, f.id));
          }
          break;
        }
        case 'taleVote': {
          const me = this.game.personal(bot.id);
          if (me.kind !== 'taleVote' || me.teller) break;
          const options = phase.items.map((c) => c.id).filter((id) => id !== me.mine);
          this.later(bot, this.think(4000, 15000), () => this.game.answer(bot.id, phaseId, pick(options, rng)));
          break;
        }
        case 'quiz': {
          if (!phase.alive.includes(bot.id)) break;
          // right about two times in three, so a bot table lasts a few questions
          const answer = this.game.quizSecret();
          const choice = answer !== undefined && rng() < 0.65 ? answer : Math.floor(rng() * phase.options.length);
          this.later(bot, this.think(2000, 9000), () => this.game.answer(bot.id, phaseId, choice));
          break;
        }
        case 'years': {
          const slot = this.game.yearsSecret();
          const guess = slot !== undefined && rng() < 0.5 ? slot : Math.floor(rng() * (phase.timeline.length + 1));
          this.later(bot, this.think(3000, 12000), () => this.game.answer(bot.id, phaseId, guess));
          break;
        }
        case 'clover': {
          if (phase.author === bot.id) break;
          // start from the right layout and spoil about half the corners, so bots land near the middle of the table
          const order = [...this.game.cloverSecret()];
          if (order.length === 0) break;
          const spare = phase.cards.map((_, i) => i).filter((i) => !order.includes(i));
          for (let k = 0; k < order.length; k++) {
            if (rng() > 0.45) continue;
            const j = Math.floor(rng() * (order.length + spare.length));
            if (j < order.length) [order[k], order[j]] = [order[j]!, order[k]!];
            else [order[k], spare[j - order.length]] = [spare[j - order.length]!, order[k]!];
          }
          this.later(bot, this.think(5000, 20000), () => this.game.answer(bot.id, phaseId, order));
          break;
        }
        case 'shaker': {
          // a bot settles on a size up front, so some stop short and some burst, like people
          const rate = this.think(4, 8);
          const goal = 20 + Math.floor(rng() * 90);
          const opensIn = Math.max(0, phase.startsAt - Date.now()) / this.pace;
          const window = (phase.deadline - phase.startsAt) / this.pace;
          for (let i = 1; i <= 6; i++) {
            this.later(bot, opensIn + (window * i) / 6, () => {
              const elapsed = Math.max(0, Math.min(Date.now(), phase.deadline) - phase.startsAt) / 1000;
              this.game.answer(bot.id, phaseId, Math.min(goal, Math.floor((elapsed * rate) / this.pace)));
            });
          }
          break;
        }
        case 'tug': {
          // same thumb speed as «Тапалка», but reported more often so the rope moves smoothly on the TV
          const rate = this.think(4, 8);
          const opensIn = Math.max(0, phase.startsAt - Date.now()) / this.pace;
          const window = (phase.deadline - phase.startsAt) / this.pace;
          for (let i = 1; i <= 12; i++) {
            this.later(bot, opensIn + (window * i) / 12, () => {
              const elapsed = Math.max(0, Math.min(Date.now(), phase.deadline) - phase.startsAt) / 1000;
              this.game.answer(bot.id, phaseId, Math.floor((elapsed * rate) / this.pace));
            });
          }
          break;
        }
        case 'quipVote': {
          const me = this.game.personal(bot.id);
          if (me.kind !== 'quipVote' || me.mine) break;
          const pickId = pick(phase.answers, rng).id;
          this.later(bot, this.think(2500, 9000), () => this.game.answer(bot.id, phaseId, pickId));
          break;
        }
        case 'list': {
          // a few common answers trickling in, so bots share some and leave the unique points to people
          const answers = shuffle(this.game.listSample(), rng).slice(0, 3 + Math.floor(rng() * 4));
          const window = Math.max(0, phase.deadline - Date.now()) / this.pace;
          answers.forEach((_, i) => {
            this.later(bot, (window * (i + 1)) / (answers.length + 1), () => this.game.answer(bot.id, phaseId, answers.slice(0, i + 1)));
          });
          break;
        }
        case 'rps': {
          if (!phase.matches.some((m) => m.b !== null && (m.a === bot.id || m.b === bot.id))) break;
          const hand = pick(RPS_THROWS, rng);
          this.later(bot, this.think(1000, 5000), () => this.game.answer(bot.id, phaseId, hand));
          break;
        }
        case 'clueGuess': {
          if (phase.author === bot.id) break;
          const word = this.game.clueWord();
          // a canned clue is usually clear, so bots get it right more often than not
          const choice = word && rng() < 0.65 ? word : pick(phase.options, rng);
          this.later(bot, this.think(2500, 9000), () => this.game.answer(bot.id, phaseId, choice));
          break;
        }
        case 'treasure': {
          if (phase.stage !== 'choose' || !phase.inside.includes(bot.id)) break;
          // a fuller bag and a more dangerous path both make leaving tempting
          const traps = phase.path.filter((c) => 'trap' in c).length;
          const carried = phase.carried[bot.id] ?? 0;
          const risk = carried === 0 ? 0 : Math.min(0.9, carried / 25 + traps * 0.12);
          const value = rng() < risk ? 0 : 1;
          this.later(bot, this.think(1500, 6000), () => this.game.answer(bot.id, phaseId, value));
          break;
        }
        case 'percentGuess': {
          if (phase.hero !== bot.id) break;
          const guess = Math.round(rng() * (100 / PERCENT_STEP)) * PERCENT_STEP;
          this.later(bot, this.think(2000, 8000), () => this.game.answer(bot.id, phaseId, guess));
          break;
        }
        case 'truth':
        case 'even':
        case 'percent':
        case 'percentBet': {
          if (phase.kind === 'percentBet' && phase.hero === bot.id) break;
          const value = rng() < 0.5 ? 1 : 0;
          this.later(bot, this.think(2000, 9000), () => this.game.answer(bot.id, phaseId, value));
          break;
        }
        case 'plot':
          this.plotChat(bot, phaseId);
          break;
        case 'date':
          this.dateChat(bot, phaseId);
          break;
        case 'masq':
          this.masqChat(bot, phaseId);
          break;
        case 'rush':
          // each bot takes the next line, so their replies differ until the lines run out
          this.rushType(bot, phaseId, phase.message, this.bots().indexOf(bot) + phase.round);
          break;
        case 'replyPick': {
          const me = this.game.personal(bot.id);
          if (me.kind !== 'replyPick' || me.hand.length === 0) break;
          const i = Math.floor(rng() * me.hand.length);
          this.later(bot, this.think(3000, 10000), () => this.game.answer(bot.id, phaseId, i));
          break;
        }
        case 'hat':
          if (phase.explainer !== bot.id) this.hatAlong(bot, phaseId);
          break;
        case 'mafiaNight':
        case 'mafiaVote': {
          const me = this.game.personal(bot.id);
          if (me.kind !== 'mafia' || me.options.length === 0) break;
          // a seer that has found a wolf names it; everyone else picks blind, as a bot cannot follow the talk
          const known = me.seen.find((s) => s.wolf && me.options.includes(s.player))?.player;
          const others = me.options.filter((id) => id !== bot.id && !(me.role === 'wolf' && me.mates.includes(id)));
          const unseen = others.filter((id) => !me.seen.some((s) => s.player === id));
          const pool = me.role === 'doctor' ? me.options : me.role === 'seer' && unseen.length > 0 ? unseen : others;
          if (pool.length === 0) break;
          const choice = phase.kind === 'mafiaVote' && known ? known : pick(pool, rng);
          this.later(bot, this.think(3000, 12000), () => this.game.answer(bot.id, phaseId, choice));
          break;
        }
        case 'foreheadGuess': {
          if (phase.guesser !== bot.id) break;
          const word = this.game.foreheadSecret();
          const guess = word && rng() < 0.45 ? word : pick(HERD_STRAYS, rng);
          this.later(bot, this.think(3000, 9000), () => this.game.answer(bot.id, phaseId, guess));
          break;
        }
        case 'fibVote': {
          const mine = this.game.personal(bot.id);
          const options = phase.options.map((o) => o.id).filter((id) => mine.kind !== 'fibVote' || id !== mine.mine);
          if (options.length === 0) break;
          this.later(bot, this.think(3000, 12000), () => this.game.answer(bot.id, phaseId, pick(options, rng)));
          break;
        }
        case 'simon': {
          if (!phase.alive.includes(bot.id)) break;
          // bots slip now and then, like people: a wrong colour or a press on a trap
          const slip = rng() < 0.12;
          const press = phase.magic ? (slip ? (phase.color + 1) % SIMON_COLORS.length : phase.color) : slip ? phase.color : null;
          if (press !== null) this.later(bot, this.think(600, 2200), () => this.game.answer(bot.id, phaseId, press));
          break;
        }
        case 'rushVote': {
          const options = phase.replies.map((r) => r.player).filter((id) => id !== bot.id);
          if (options.length === 0) break;
          this.later(bot, this.think(3000, 9000), () => this.game.answer(bot.id, phaseId, pick(options, rng)));
          break;
        }
        case 'waveHint': {
          const secret = this.game.waveSecret(bot.id);
          if (phase.psychic !== bot.id || secret?.target === undefined) break;
          const hint = nearestSample(secret.spectrum, secret.target);
          this.later(bot, this.think(3000, 9000), () => this.game.answer(bot.id, phaseId, hint));
          break;
        }
        case 'waveGuess': {
          const secret = this.game.waveSecret(bot.id);
          if (phase.psychic === bot.id || !secret) break;
          // a hint the bot knows lands it near; a person's own word leaves it guessing around the middle
          const known = guessSpot(secret.spectrum, phase.hint);
          const mark = Math.round(Math.max(0, Math.min(100, (known ?? 50) + (rng() * 2 - 1) * (known === undefined ? 30 : 12))));
          this.later(bot, this.think(2500, 8000), () => this.game.answer(bot.id, phaseId, mark));
          break;
        }
        case 'orderWrite': {
          const secret = this.game.orderSecret(bot.id);
          if (!secret) break;
          // the two nearest samples, so bots with close numbers still name different things
          const taken = new Set(rng() < 0.5 ? [nearestSample(secret.spectrum, secret.number)] : []);
          const text = nearestSample(secret.spectrum, secret.number, taken);
          this.later(bot, this.think(4000, 12000), () => this.game.answer(bot.id, phaseId, text));
          break;
        }
        case 'orderSort': {
          const secret = this.game.orderSecret(bot.id);
          if (!secret) break;
          const spot = (c: { player: string; text: string }) =>
            c.player === bot.id ? secret.number : (guessSpot(secret.spectrum, c.text) ?? 50) + (rng() * 2 - 1) * 15;
          const order = phase.cards.map((c) => ({ id: c.player, at: spot(c) })).sort((a, b) => a.at - b.at).map((c) => c.id);
          this.later(bot, this.think(5000, 15000), () => this.game.answer(bot.id, phaseId, order));
          break;
        }
        case 'market':
          this.marketTrade(bot, phaseId, phase.deadline);
          break;
        case 'masqGuess': {
          const me = this.game.personal(bot.id);
          if (me.kind !== 'masqGuess') break;
          // bots cannot tell writing styles apart, so they guess blind and leave the detective work to people
          const suspects = shuffle(
            this.host.players().filter((p) => p.connected && p.id !== bot.id).map((p) => p.id),
            rng,
          );
          const guess = Array.from({ length: phase.masks }, (_, i) => (i === me.mask ? null : (suspects.pop() ?? null)));
          this.later(bot, this.think(4000, 15000), () => this.game.answer(bot.id, phaseId, guess));
          break;
        }
        case 'radio': {
          const me = this.game.personal(bot.id);
          if (me.kind !== 'radio') break;
          const text = garble(me.incoming, rng);
          this.later(bot, this.think(6000, 20000), () => this.game.answer(bot.id, phaseId, text));
          break;
        }
        case 'radioVote': {
          const me = this.game.personal(bot.id);
          const options = phase.finals.map((_, i) => i).filter((i) => me.kind === 'radioVote' && !me.mine.includes(i));
          if (options.length === 0) break;
          this.later(bot, this.think(3000, 10000), () => this.game.answer(bot.id, phaseId, pick(options, rng)));
          break;
        }
        case 'datePick': {
          const me = this.game.personalChats(bot.id);
          const others = this.host.players().filter((p) => p.connected && p.id !== bot.id).map((p) => p.id);
          if (others.length === 0) break;
          // whoever wrote the most gets the invitation, so a person who flirts with a bot can win it over
          const fans = others.map((id) => ({ id, n: me.filter((t) => t.members.includes(id)).flatMap((t) => t.messages).filter((m) => m.from === id).length }));
          const best = Math.max(...fans.map((f) => f.n));
          const choice = best > 0 ? pick(fans.filter((f) => f.n === best), rng).id : pick(others, rng);
          this.later(bot, this.think(2000, 8000), () => this.game.answer(bot.id, phaseId, choice));
          break;
        }
        case 'plotGuess': {
          if (!phase.voters.includes(bot.id)) break;
          const suspects = shuffle(
            this.host.players().filter((p) => p.connected && p.id !== bot.id && p.id !== phase.target).map((p) => p.id),
            rng,
          ).slice(0, phase.plotters);
          this.later(bot, this.think(3000, 12000), () => this.game.answer(bot.id, phaseId, suspects));
          break;
        }
        case 'spy': {
          // bots cannot follow the talk, so they accuse late and at random, leaving it to the people
          const others = phase.options.filter((id) => id !== bot.id);
          if (others.length === 0) break;
          const window = Math.max(0, phase.deadline - Date.now()) / this.pace;
          this.later(bot, window * (0.6 + rng() * 0.3), () => this.game.answer(bot.id, phaseId, pick(others, rng)));
          break;
        }
        case 'spyGuess': {
          if (phase.spy !== bot.id) break;
          const guess = pick(phase.options, rng);
          this.later(bot, this.think(3000, 8000), () => this.game.answer(bot.id, phaseId, guess));
          break;
        }
        case 'bomb': {
          if (phase.holder !== bot.id) break;
          this.later(bot, this.think(1800, 4500), () => {
            const me = this.game.personal(bot.id);
            if (me.kind === 'bomb' && me.targets.length > 0) this.game.answer(bot.id, phaseId, pick(me.targets, rng));
          });
          break;
        }
        case 'closest': {
          // no idea of the real answer, so a wild guess across a few orders of magnitude
          const value = Math.round(10 ** (rng() * 4));
          this.later(bot, this.think(3000, 10000), () => this.game.answer(bot.id, phaseId, value));
          break;
        }
        case 'sync': {
          if (!phase.groups.some((g) => g.includes(bot.id))) break;
          const value = Math.floor(rng() * phase.options.length);
          this.later(bot, this.think(2000, 8000), () => this.game.answer(bot.id, phaseId, value));
          break;
        }
        case 'predict': {
          const value = Math.floor(rng() * phase.options.length);
          const joker = rng() < BOT_JOKER_CHANCE;
          this.later(bot, this.think(2000, 9000), () => {
            if (joker) this.game.playJoker(bot.id, phaseId);
            this.game.answer(bot.id, phaseId, value);
          });
          break;
        }
        case 'draw': {
          if (phase.describer === bot.id) break;
          const monster = phase.mode === 'monster';
          const bottom = monster ? phase.board.h - MONSTER_GUIDE : phase.board.h;
          const strokes = doodle(phase.board, rng, 0, bottom);
          const last = (phase.steps?.length ?? 1) - 1;
          if (monster && (phase.step ?? 0) < last) {
            // reach into the handoff band like a human would, or the next artist gets a blank strip
            const x = 300 + Math.round(rng() * 250);
            const c = strokes[0]?.c ?? '#1b1033';
            strokes.push(
              { c, w: 12, p: [x, bottom - 120, x - 20, phase.board.h - 5] },
              { c, w: 12, p: [x + 160, bottom - 120, x + 180, phase.board.h - 5] },
            );
          }
          this.draw(bot, phaseId, strokes);
          break;
        }
        case 'shared':
          if (phase.artist === bot.id) this.draw(bot, phaseId, doodle(phase.board, rng));
          break;
        case 'guess':
          if (phase.artist === bot.id) {
            if (!phase.mime) this.draw(bot, phaseId, doodle(phase.board, rng));
          }
          else this.guessAlong(bot, phaseId, phase.deadline - Date.now());
          break;
        case 'photo': {
          const asset = this.host.putAsset('image/svg+xml', faceSvg(bot.color, rng, pick(MOODS, rng)));
          this.later(bot, this.think(3000, 12000), () => this.game.photoUploaded(bot.id, phaseId, asset));
          break;
        }
        case 'gallery': {
          const options = phase.items.filter((i) => !i.authors.includes(bot.id));
          if (options.length === 0 || phase.items.length < 2) break;
          const wait = Math.max(0, phase.votingFrom - Date.now()) / this.pace + this.think(1500, 6000);
          this.later(bot, wait, () => this.game.answer(bot.id, phaseId, pick(options, rng).id));
          break;
        }
        default:
          break;
      }
    }
  }

  /** «Шляпа»: keeps guessing through the turn; about one try in four is the word itself. */
  private hatAlong(bot: Player, phaseId: number): void {
    const rng = this.host.rng;
    const tick = () => {
      const word = this.game.hatSecret();
      if (!word) return;
      this.game.guess(bot.id, phaseId, rng() < 0.25 ? word : pick(guessWords, rng));
      this.later(bot, this.think(2500, 7000), tick);
    };
    this.later(bot, this.think(2500, 7000), tick);
  }

  /** A few wild guesses, getting it right more often as time runs on. */
  private guessAlong(bot: Player, phaseId: number, window: number): void {
    const rng = this.host.rng;
    const tries = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < tries; i++) {
      const at = (window / this.pace) * ((i + 1) / (tries + 1)) * (0.7 + rng() * 0.3);
      this.later(bot, at, () => {
        const word = this.game.secretWord();
        if (!word) return;
        const right = rng() < 0.12 + (i / tries) * 0.3;
        this.game.guess(bot.id, phaseId, right ? word : pick(guessWords, rng));
      });
    }
    this.rush.set(bot.id, () => {
      const word = this.game.secretWord();
      if (word) this.game.guess(bot.id, phaseId, word);
    });
  }

  private draw(bot: Player, phaseId: number, strokes: ReturnType<typeof doodle>): void {
    let at = this.think(1000, 3000);
    for (const s of strokes) {
      at += this.think(400, 1500);
      this.later(bot, at, () => this.game.ink(bot.id, phaseId, { k: 'end', s }));
    }
    this.later(bot, at + this.think(800, 2500), () => this.game.submit(bot.id, phaseId));
  }
}
