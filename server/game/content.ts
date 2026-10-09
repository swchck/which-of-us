import {
  describeScenes,
  bombCategories,
  closestQuestions,
  duelChallenges,
  herdPrompts,
  mimeWords,
  quipPrompts,
  spyPlaces,
  truthFacts,
  clueSets,
  listCategories,
  placeContent,
  syncPrompts,
  neverStatements,
  guessWords,
  monsterThemes,
  narrator,
  photoPrompts,
  questionPacks,
  quotePrompts,
  scaleQuestions,
  selfiePrompts,
  sharedThemes,
  storyStarts,
  blankPrompts,
  evenQuestions,
  fibWords,
  oddPairs,
  percentQuestions,
  replyCards,
  replySituations,
  foreheadWords,
  quizQuestions,
  yearEvents,
} from '../content/index.js';
import type { FibWord } from '../content/fib.js';
import type { EvenQuestion } from '../content/even.js';
import type { OddPair } from '../content/odd.js';
import { GAMES, type CustomQuestion, type LocationId, type PackId } from '../../shared/protocol.js';
import { speechSentences } from '../../shared/catalog.js';
import type { Segment } from './plan.js';
import type {
  BlankPrompt,
  ListCategory,
  ClueSet,
  ClosestQuestion,
  MonsterTheme,
  TruthFact,
  QuizQuestion,
  YearEvent,
  PredictQuestion,
  SharedTheme,
  SketchPrompt,
  SyncPrompt,
  VoteQuestion,
} from '../content/types.js';
import { Deck, fill, pick, type Freshness, type Rng } from '../util.js';
import { placeScenes } from '../../shared/scenes.js';

export { narrator, spyPlaces };

/**
 * Share of a round's questions and mini-game tasks taken from its place: most of them, so the place
 * sets the scene, while the rest still come from the room's chosen packs and keep their tone.
 */
export const PLACE_SHARE = 0.7;

interface PlaceDecks {
  vote: Deck<VoteQuestion>;
  predict: Deck<PredictQuestion>;
  words: Deck<string>;
  list: Deck<ListCategory>;
  quip: Deck<string>;
  bomb: Deck<string>;
  blank: Deck<BlankPrompt>;
  sketch: Deck<SketchPrompt>;
  /** Questions tagged with a scene, which the place decks leave out. */
  scenes: Map<string, Pick<PlaceDecks, 'vote' | 'predict'>>;
}

/** Narrator lines that say a player's name; the voice renders them whole ahead of time. */
const NAMED_KEYS = (Object.keys(narrator) as (keyof typeof narrator)[]).filter(
  (k): k is LineKey => k !== 'locations' && (narrator[k] as readonly string[]).some((v) => v.includes('{name}')),
);

/**
 * The game a narrator line belongs to, read off its key: `tugWin` is said in «tug», `voteReveal` in
 * the votes. Lines of no game (leaders, jokers, scores) give undefined.
 */
function lineGame(key: LineKey): Segment | undefined {
  return SEGMENTS.find((g) => key.startsWith(g) && /[A-Z]/.test(key.charAt(g.length)));
}

const SEGMENTS: readonly Segment[] = ['vote', ...GAMES];

const CUSTOM_TITLES = ['Легенда компании', 'Тот самый человек', 'Живая легенда', 'Герой этой истории', 'Звезда вечера'];

export type LineKey = Exclude<keyof typeof narrator, 'locations'>;

/** Per-room content decks, so questions don't repeat until the bank runs out. */
export class ContentDecks {
  vote: Deck<VoteQuestion>;
  predict: Deck<PredictQuestion>;
  selfie: Deck<SketchPrompt>;
  blank: Deck<BlankPrompt>;
  readonly photo: Deck<string>;
  readonly monster: Deck<MonsterTheme>;
  readonly shared: Deck<SharedTheme>;
  readonly guess: Deck<string>;
  readonly quote: Deck<string>;
  readonly describe: Deck<string>;
  readonly scale: Deck<{ q: string; low: string; high: string }>;
  readonly story: Deck<string>;
  readonly never: Deck<string>;
  readonly herd: Deck<string>;
  readonly duel: Deck<string>;
  readonly sync: Deck<SyncPrompt>;
  readonly bomb: Deck<string>;
  readonly closest: Deck<ClosestQuestion>;
  readonly quip: Deck<string>;
  readonly mime: Deck<string>;
  readonly truth: Deck<TruthFact>;
  readonly quiz: Deck<QuizQuestion>;
  readonly years: Deck<YearEvent>;
  readonly spy: Deck<string>;
  readonly clue: Deck<ClueSet>;
  readonly list: Deck<ListCategory>;
  readonly odd: Deck<OddPair>;
  readonly even: Deck<EvenQuestion>;
  readonly percent: Deck<string>;
  readonly fib: Deck<FibWord>;
  readonly reply: Deck<string>;
  readonly replyCards: Deck<string>;
  readonly forehead: Deck<string>;

  constructor(
    private readonly rng: Rng,
    private readonly fresh?: Freshness,
  ) {
    this.vote = this.deck('vote', this.fit(questionPacks.party.vote), (q) => q.q);
    this.predict = this.deck('predict', this.fit(questionPacks.party.predict), (q) => q.q);
    this.selfie = this.deck('selfie', this.fit(selfiePrompts), (t) => t.q);
    this.blank = this.deck('blank', this.fit(blankPrompts), (t) => t.q);
    this.photo = this.deck('photo', photoPrompts, (t) => t);
    this.monster = this.deck('monster', monsterThemes, (t) => t.name);
    this.shared = this.deck('shared', sharedThemes, (t) => t.theme);
    this.guess = this.deck('guess', guessWords, (t) => t);
    this.quote = this.deck('quote', quotePrompts, (t) => t);
    this.describe = this.deck('describe', describeScenes, (t) => t);
    this.scale = this.deck('scale', scaleQuestions, (q) => q.q);
    this.story = this.deck('story', storyStarts, (t) => t);
    this.never = this.deck('never', neverStatements, (t) => t);
    this.herd = this.deck('herd', herdPrompts, (t) => t);
    this.duel = this.deck('duel', duelChallenges, (t) => t);
    this.sync = this.deck('sync', syncPrompts, (t) => t.q);
    this.bomb = this.deck('bomb', bombCategories, (t) => t);
    this.closest = this.deck('closest', closestQuestions, (t) => t.q);
    this.quip = this.deck('quip', quipPrompts, (t) => t);
    this.mime = this.deck('mime', mimeWords, (t) => t);
    this.truth = this.deck('truth', truthFacts, (t) => t.s);
    this.quiz = this.deck('quiz', quizQuestions, (q) => q.q);
    this.years = this.deck('years', yearEvents, (y) => y.e);
    this.spy = this.deck('spy', spyPlaces, (t) => t);
    this.clue = this.deck('clue', clueSets, (t) => t.words[0]);
    this.list = this.deck('list', listCategories, (t) => t.q);
    this.odd = this.deck('odd', oddPairs, (t) => t.q);
    this.even = this.deck('even', evenQuestions, (t) => t.q);
    this.percent = this.deck('percent', percentQuestions, (t) => t);
    this.fib = this.deck('fib', fibWords, (t) => t.word);
    this.reply = this.deck('reply', replySituations, (t) => t);
    this.replyCards = this.deck('reply-card', replyCards, (t) => t);
    this.forehead = this.deck('forehead', foreheadWords, (t) => t);
  }

  /** Rounds written for two players come up only in a game for two, where they are the point. */
  private pairs = false;
  private packs: readonly PackId[] = ['party'];

  private fit<T extends { pair?: true }>(items: readonly T[]): T[] {
    return this.pairs ? [...items] : items.filter((i) => !i.pair);
  }

  /** Lets in the rounds written for two players; rebuilds the decks, so it goes before the first round. */
  setPairs(on: boolean): void {
    if (on === this.pairs) return;
    this.pairs = on;
    this.setPacks(this.packs);
    this.selfie = this.deck('selfie', this.fit(selfiePrompts), (t) => t.q);
    this.blank = this.deck('blank', this.fit(blankPrompts), (t) => t.q);
    this.places.clear();
    this.place = null;
  }

  private deck<T>(kind: string, items: readonly T[], key: (item: T) => string): Deck<T> {
    return new Deck(items, this.rng, this.fresh && { log: this.fresh, kind, key });
  }

  /** Room-written questions waiting to be asked; they jump the queue. */
  custom: CustomQuestion[] = [];

  /** The current round's place decks; kept per place, so a place visited twice does not repeat itself. */
  private place: PlaceDecks | null = null;
  private places = new Map<LocationId, PlaceDecks>();

  /** Makes the round's questions and tasks lean towards this place's situation. */
  setPlace(id: LocationId | undefined): void {
    const content = id && placeContent[id];
    if (!id || !content) {
      this.place = null;
      return;
    }
    const vote = this.fit(content.vote);
    const predict = this.fit(content.predict);
    let decks = this.places.get(id);
    if (!decks) {
      decks = {
        vote: this.deck('place-vote', vote.filter((q) => !q.scene), (q) => q.q),
        predict: this.deck('place-predict', predict.filter((q) => !q.scene), (q) => q.q),
        words: this.deck('place-word', content.words, (t) => t),
        list: this.deck('place-list', content.list, (t) => t.q),
        quip: this.deck('place-quip', content.quip, (t) => t),
        bomb: this.deck('place-bomb', content.bomb, (t) => t),
        blank: this.deck('blank', this.fit(content.blank ?? []), (t) => t.q),
        sketch: this.deck('selfie', this.fit(content.sketch ?? []), (t) => t.q),
        scenes: new Map(
          placeScenes(id).map((scene) => [
            scene,
            {
              vote: this.deck('place-vote', vote.filter((q) => q.scene === scene), (q) => q.q),
              predict: this.deck('place-predict', predict.filter((q) => q.scene === scene), (q) => q.q),
            },
          ]),
        ),
      };
      this.places.set(id, decks);
    }
    this.place = decks;
    this.scene = undefined;
  }

  private scene: string | undefined;

  /** Moves the round to a scene of its place, whose own questions then come first. */
  setScene(scene: string | undefined): void {
    this.scene = scene;
  }

  /** The scene's deck when it has questions of this kind, else the place's. */
  private placeDeck<K extends 'vote' | 'predict'>(p: PlaceDecks, kind: K): PlaceDecks[K] {
    const own: PlaceDecks[K] | undefined = this.scene ? p.scenes.get(this.scene)?.[kind] : undefined;
    return own && !own.empty ? own : p[kind];
  }

  /** Draws from the place's deck most of the time, else from the general one. */
  private themed<T>(general: Deck<T>, from: (p: PlaceDecks) => Deck<T>): T {
    const own = this.place && from(this.place);
    return own && !own.empty && this.rng() < PLACE_SHARE ? own.draw() : general.draw();
  }

  sketchPrompt(): SketchPrompt {
    return this.themed(this.selfie, (p) => p.sketch);
  }

  blankPrompt(): BlankPrompt {
    return this.themed(this.blank, (p) => p.blank);
  }

  guessWord(): string {
    return this.themed(this.guess, (p) => p.words);
  }

  mimeWord(): string {
    return this.themed(this.mime, (p) => p.words);
  }

  listCategory(): ListCategory {
    return this.themed(this.list, (p) => p.list);
  }

  quipPrompt(): string {
    return this.themed(this.quip, (p) => p.quip);
  }

  bombCategory(): string {
    return this.themed(this.bomb, (p) => p.bomb);
  }

  /** Next «Кто из нас?» question: the room's own first, in random order, then the place and the packs. */
  nextVote(): VoteQuestion & { custom?: boolean } {
    const own = this.takeCustom('vote');
    if (own) return { q: own.text, title: pick(CUSTOM_TITLES, this.rng), custom: true };
    return this.themed(this.vote, (p) => this.placeDeck(p, 'vote'));
  }

  /** Next question about one person: the room's own first, then the place and the packs. `q` has `{name}`. */
  nextPredict(): PredictQuestion & { custom?: boolean } {
    const own = this.takeCustom('predict');
    return own ? { q: own.text, options: own.options ?? [], custom: true } : this.themed(this.predict, (p) => this.placeDeck(p, 'predict'));
  }

  nextScale(): { q: string; low: string; high: string; custom?: boolean } {
    const own = this.takeCustom('scale');
    return own ? { q: own.text, low: own.low ?? '', high: own.high ?? '', custom: true } : this.scale.draw();
  }

  private takeCustom(kind: CustomQuestion['kind']): CustomQuestion | undefined {
    const mine = this.custom.filter((q) => q.kind === kind);
    if (mine.length === 0) return undefined;
    const q = mine[Math.floor(this.rng() * mine.length)]!;
    this.custom = this.custom.filter((c) => c !== q);
    return q;
  }

  /** Questions the narrator will most likely read next, for rendering their voice ahead of time. */
  upcoming(): string[] {
    return [
      ...(this.place ? this.placeDeck(this.place, 'vote').peek(3) : []),
      ...this.vote.peek(2),
      ...this.custom.filter((c) => c.kind === 'vote').map((c) => c.text),
      ...this.scale.peek(1).map((q) => q.q),
      ...this.never.peek(1),
    ].map((q) => (typeof q === 'string' ? q : q.q));
  }

  /** Swaps the vote and predict decks for the chosen packs mixed together. */
  setPacks(packs: readonly PackId[]): void {
    this.packs = packs;
    this.vote = this.deck('vote', this.fit(packs.flatMap((p) => questionPacks[p].vote)), (q) => q.q);
    this.predict = this.deck('predict', this.fit(packs.flatMap((p) => questionPacks[p].predict)), (q) => q.q);
  }

  /** A narrator line, dealt from a deck per key, so a party hears every variant before one repeats. */
  line(key: LineKey, name = ''): string {
    return fill(this.lineDeck(key).draw(), name);
  }

  /** The variant `line(key)` says next, with `{name}` still in it; lets the voice render it ahead. */
  nextLine(key: LineKey): string {
    return this.lineDeck(key).next();
  }

  /**
   * Whole narrator sentences with a player's name that may come up soon, most imminent first: the
   * next variant of each named line of the segments ahead, in plan order, then the lines any round
   * can say (leaders, jokers, scores), then predict questions and spotlight intros. Each is filled
   * with every name, since who wins is not known yet.
   */
  namedAhead(segments: readonly Segment[], spotlights: readonly LocationId[], names: readonly string[]): string[] {
    const keys: LineKey[] = [];
    const add = (k: LineKey) => !keys.includes(k) && keys.push(k);
    for (const seg of segments) for (const k of NAMED_KEYS) if (lineGame(k) === (seg === 'bonusVote' ? 'vote' : seg)) add(k);
    for (const k of NAMED_KEYS) if (!lineGame(k)) add(k);
    const templates = [
      ...keys.map((k) => this.nextLine(k)),
      ...this.predict.peek(2).map((q) => q.q),
      ...spotlights.flatMap((l) => narrator.locations[l].spotlight),
    ];
    return [...new Set(templates.flatMap((t) => names.flatMap((n) => speechSentences(fill(t, n)).filter((x) => x.includes(n)))))];
  }

  private readonly lines = new Map<LineKey, Deck<string>>();

  private lineDeck(key: LineKey): Deck<string> {
    let deck = this.lines.get(key);
    if (!deck) {
      deck = this.deck(`line-${key}`, narrator[key], (t) => t);
      this.lines.set(key, deck);
    }
    return deck;
  }
}
