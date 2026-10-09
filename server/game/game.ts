import {
  BOARDS,
  ARENA,
  ERASER,
  INK_COLORS,
  MONSTER_GUIDE,
  CLOSEST_MAX,
  CLUE_MAX,
  LIST_ITEM_MAX,
  LIST_MIN_KEY,
  LIST_MAX_ITEMS,
  RPS_THROWS,
  type RpsThrow,
  TRAPS,
  HERD_MAX,
  QUIP_MAX,
  QUOTE_MAX,
  SCALE_MAX,
  PERCENT_STEP,
  SIMON_COLORS,
  FIB_MAX,
  GUESS_MAX,
  HAT_MODES,
  PAINT,
  type BrawlMode,
  type HatMode,
  type MafiaRole,
  type ForeheadHint,
  CLOVER_SIZE,
  type YearCard,
  type PictureRef,
  type TaleCard,
  type NinjaFruit,
  type ContactHint,
  type CrowdPick,
  type RoundModifier,
  type BandPart,
  type BandInstrument,
  BAND_INSTRUMENTS,
  JUNK_BIDS,
  JUNK_BUDGET,
  NINJA_BOMB,
  NINJA_BOMB_POINTS,
  NINJA_FRUIT_POINTS,
  QUIZ_LIVES,
  SHAKER_POP_MAX,
  SHAKER_POP_MIN,
  type Board,
  type ChatPost,
  type ChatThread,
  DATE_MESSAGES,
  MASKS,
  RADIO_WORDS_MAX,
  RUSH_MAX,
  type RushDraft,
  ORDER_MAX,
  JOKERS_MAX,
  ORDER_TEXT_MAX,
  WAVE_HINT_MAX,
  WAVE_MAX,
  type FreezeFault,
  type PlotRole,
  type GalleryItem,
  type GameId,
  type InkOp,
  type LocationId,
  type Moment,
  type Personal,
  type Phase,
  type Stroke,
  type TrapId,
  type TreasureCard,
} from '../../shared/protocol.js';
import { GAME_INFO, TEAM_INFO, clueProblem, givesAway, listKey, rulesLine, withUnit } from '../../shared/catalog.js';
import { Arena, STAR_POINTS } from './arena.js';
import { planGame, type Episode, type Segment } from './plan.js';
import { narrator, spyPlaces, type LineKey } from './content.js';
import { buildAwards } from './awards.js';
import { ARTIST_POINTS, cleanGuess, guessPoints, hintOf, judge, normalize } from './guess.js';
import {
  rank,
  relayChainOf,
  scoreGallery,
  scorePredict,
  scoreVote,
  sharedTurnCount,
} from './scoring.js';
import { blitzDurations, type Durations, type GameHost, type Player } from './types.js';
import { clip, fill, joinNames, newId, pick, shuffle, stripControls } from '../util.js';
import { Chat, mentions } from './chat.js';
import { Missions, type MissionEvent, type MissionView } from './missions.js';
import { plotWords, type PlotWord } from '../content/plot.js';
import { dateQuirks, type DateQuirk } from '../content/date.js';
import { masqTopics } from '../content/masq.js';
import { radioRumours } from '../content/radio.js';
import { rushMessages } from '../content/rush.js';
import { sceneLines } from '../content/scenes.js';
import { taleBotClues, taleThemes } from '../content/tale.js';
import { junkItems, rhymeStarts } from '../content/rhyme.js';
import { caseCrimes, caseQuestions } from '../content/case.js';
import { SKETCH_IMAGES } from '../content/types.js';
import type { OddPair } from '../content/odd.js';
import { PLACE_SCENES } from '../../shared/scenes.js';
import { marketCases, type MarketCase } from '../content/market.js';
import { spectra, type Spectrum } from '../content/spectrum.js';
import { nearestSample, orderAccuracy, wavePoints } from './wave.js';
import { momentOf, pickMoments } from './moments.js';

const MAX_STROKES = 500;
const MAX_POINTS = 1200;

class Aborted extends Error {}

interface PhaseTimer {
  fn: () => void;
  remaining: number;
  startedAt: number;
  timer?: ReturnType<typeof setTimeout>;
}

interface GuessRound {
  word: string;
  artist: string;
  revealed: Set<number>;
  points: Map<string, number>;
  tries: Map<string, string[]>;
  feedback: Map<string, 'close' | 'wrong'>;
  lastAt: Map<string, number>;
}

const GUESS_COOLDOWN_MS = 500;
const GUESS_FEED = 8;
const ARENA_TICK_MS = 33;
/** Anonymous answers put to the vote in one «Кто это написал?» round. */
const QUOTE_ROUNDS = 3;
const NEVER_ROUNDS = 3;
/** «Я никогда не…» points for the «how many said yes» guess: exact, one off. */
const NEVER_POINTS = [100, 40];
/** «Тапалка» points for the first, second and third fastest; ties share a place. */
const TAP_POINTS = [150, 100, 50];
/** Taps per second nobody's thumb beats; counts above it are a script, not a person. */
const TAP_MAX_RATE = 20;
const TAP_SHOW_MS = 120;
const EMOJI_ROUNDS = 4;
const EMOJI_MAX = 5;
const EMOJI_GUESS_POINTS = 100;
const EMOJI_AUTHOR_POINTS = 50;
const HERD_ROUNDS = 2;
/** «Стадное чувство» points for the biggest group of matching answers, and for any smaller group that still matched. */
const HERD_TOP_POINTS = 100;
const HERD_MATCH_POINTS = 40;
const DUEL_ROUNDS = 2;
const DUEL_WIN_POINTS = 150;
/** For each voter who backed the winning duelist. */
const DUEL_BACKER_POINTS = 50;
const SYNC_ROUNDS = 3;
const SYNC_POINTS = 100;
const BOMB_ROUNDS = 3;
const BOMB_SURVIVE_POINTS = 50;
/** A bomb that bounces back within this many ms was passed without naming anything. */
const BOMB_MIN_HOLD_MS = 1500;
const CLOSEST_ROUNDS = 3;
/** «Ближе всех» points by place; ties share a place. */
const CLOSEST_POINTS = [150, 90, 50];
const CLOSEST_EXACT_BONUS = 100;
/** A guess scores only within this share of the answer, or this many units for small answers. */
const CLOSEST_SLACK = 0.5;
const CLOSEST_MIN_SLACK = 2;
/** «Битва ответов» matchups shown per game; more would drag on in a big room. */
const QUIP_MATCHES = 4;
const QUIP_VOTE_POINTS = 100;
/** On top of the votes, for an answer that took every single one. */
const QUIP_SWEEP_BONUS = 150;
const MIME_ROUNDS = 2;
const TRUTH_ROUNDS = 4;
const TRUTH_POINTS = 100;
/** Places a caught spy picks from, the real one among them. */
const SPY_GUESS_OPTIONS = 6;
const SPY_ESCAPE_POINTS = 200;
const SPY_SAVE_POINTS = 150;
/** For each vote on the spy; halved when the spy then guesses the place. */
const SPY_CATCH_POINTS = 100;
/** To every plotter when the target writes the secret word. */
const PLOT_TRAP_POINTS = 300;
/** To a target who never wrote the word. */
const PLOT_HOLD_POINTS = 200;
/** For each plotter a target or bystander names correctly. */
const PLOT_SPOT_POINTS = 100;
/** For a secret mission completed by the end of the party. */
export const MISSION_POINTS = 300;
export const DATE_NIGHTS = 3;
export const DATE_NIGHT_NAMES = ['первый', 'второй', 'третий'];
/** To both players of a pair who picked each other. */
const DATE_MATCH_POINTS = 200;
/** For every invitation received, mutual or not. */
const DATE_ASKED_POINTS = 50;
/** For each night a player wrote at least once and kept to their quirk every time. */
const DATE_QUIRK_POINTS = 50;
const MASQ_SPOT_POINTS = 60;
const MASQ_HIDE_POINTS = 40;
/** Fewer messages than this and nobody can be expected to spot you, so hiding pays nothing. */
const MASQ_HIDE_MIN_MESSAGES = 2;
const MASQ_MESSAGES = 12;
const MASQ_TOPICS = 3;
const MASQ_FEED = 6;
const MASQ_THREAD = 'group:masq';
const RADIO_STEPS_MAX = 4;
const RADIO_VOTE_POINTS = 100;
const RADIO_CHAIN_POINTS = 30;
const RUSH_ROUNDS = 3;
const RUSH_VOTE_POINTS = 100;
const BLANK_ROUNDS = 2;
const ODD_ROUNDS = 2;
const ODD_FOUND_POINTS = 100;
const ODD_FOOL_POINTS = 100;
const EVEN_ROUNDS = 3;
const EVEN_MINORITY_POINTS = 100;
const EVEN_HALF_POINTS = 150;
const PERCENT_ROUNDS = 2;
const PERCENT_BET_POINTS = 100;
/** The hero's points for a guess this many points off: exact, within ten, within twenty. */
const PERCENT_HERO_POINTS = [200, 150, 100];
const FIB_ROUNDS = 2;
const FIB_FOUND_POINTS = 100;
const FIB_FOOL_POINTS = 100;
const SIMON_STEPS = 10;
/** About a third of commands lack the magic words; fewer and nobody falls for them. */
const SIMON_TRAP_SHARE = 0.35;
const SIMON_SURVIVOR_POINTS = 200;
const REPLY_ROUNDS = 2;
const REPLY_HAND = 5;
const REPLY_VOTE_POINTS = 100;
const FOREHEAD_ROUNDS = 2;
const FOREHEAD_GUESSER_POINTS = 200;
const FOREHEAD_HINT_POINTS = 50;
/** A round between the first and the last gets a twist with this chance. */
const MODIFIER_CHANCE = 0.4;
const UNDERDOG_FACTOR = 1.5;
const MODIFIER_LINES = { double: 'modifierDouble', blitz: 'modifierBlitz', underdog: 'modifierUnderdog' } as const;
/** «Контакт»: the leader's word is one plain word long enough to open over a few steps. */
const CONTACT_WORD = /^[А-ЯЁа-яё]{6,}$/;
const CONTACT_STEPS = 3;
const CONTACT_POINTS = 80;
const CONTACT_BLOCK_POINTS = 50;
const CONTACT_SOLVE_POINTS = 200;
/** The leader's, per letter still hidden when the steps run out. */
const CONTACT_HIDDEN_POINTS = 60;
/** «Оркестр»: eight bars of four beats; a tap within the window of a note hits it, within the tight one perfectly. */
const BAND_BEATS = 32;
const BAND_WINDOW_MS = 200;
const BAND_PERFECT_MS = 80;
/** How far a tap's stamp may sit from the server's clock: lag plus the phone's clock error. */
const BAND_CLOCK_SLACK_MS = 1000;
const BAND_POINTS_PER_PERCENT = 3;
/** «Расследование»: clues per case, and points for a right accusation locked after each one. */
const CASE_CLUES = 3;
const CASE_POINTS = [300, 200, 100];
/** The culprit's, per person who never pointed at them. */
const CASE_ESCAPE_POINTS = 80;
const RHYME_ROUNDS = 2;
const RHYME_VOTE_POINTS = 100;
/** «Барахолка»: lots auctioned per fair; more and the bidding drags. */
const JUNK_LOTS = 6;
/** Per person who bid on the lot: a wanted thing is worth more to the one who got it. */
const JUNK_WANTED_POINTS = 60;
/**
 * «Фруктовый ниндзя»: the first launch, the mean gap between launches and a fruit's time in the air, as
 * shares of the round, so a sped-up test game flies the same pattern; at 30 s that is 0.8, 0.7 and 2.2 s.
 */
const NINJA_FIRST = 0.027;
const NINJA_GAP = 0.023;
const NINJA_FLIGHT = 0.075;
const NINJA_BOMB_SHARE = 0.18;
/** The phone's clock and the trip to the server each add a few hundred ms to when a slice lands. */
const NINJA_SLACK_MS = 400;
const NINJA_FRUITS = ['🍉', '🍊', '🍋', '🍎', '🍓', '🍌', '🍍', '🥝', '🍑', '🍇'];
/** «Сказочник»: tellers per game; each is a full round of clue, vote and reveal. */
const TALE_ROUNDS = 2;
const TALE_FIND_POINTS = 120;
const TALE_BASE_POINTS = 80;
/** Per vote a decoy drawing draws away from the teller's. */
const TALE_FOOL_POINTS = 40;
/** At most this many questions; the quiz usually ends sooner, when one player is left. */
const QUIZ_QUESTIONS = 8;
const QUIZ_RIGHT_POINTS = 50;
/** On top of a right answer, scaled by the share of the timer still left. */
const QUIZ_SPEED_POINTS = 50;
const QUIZ_SURVIVOR_POINTS = 150;
/** «В каком году?»: events placed after the first one, which the timeline starts with. */
const YEARS_ROUNDS = 6;
const YEARS_POINTS = 100;
/** «Четырёхлистник»: clovers rebuilt per game, about four minutes with the writing. */
const CLOVER_ROUNDS = 3;
const CLOVER_CORNER_POINTS = 40;
const CLOVER_PERFECT_BONUS = 60;
const CLOVER_AUTHOR_POINTS = 15;
const SHAKER_POINTS = [200, 120, 60];
/** «Мафия-ТВ»: a second wolf from seven players, a doctor from five, a seer from six. */
const MAFIA_TWO_WOLVES = 7;
const MAFIA_DOCTOR_FROM = 5;
const MAFIA_SEER_FROM = 6;
/** Three nights keep the game near five minutes; wolves left after the third one win. */
const MAFIA_NIGHTS = 3;
const MAFIA_WIN_POINTS = 250;
const MAFIA_HIT_POINTS = 50;
const MAFIA_SAVE_POINTS = 100;
const MAFIA_SEER_POINTS = 50;
/** «Шляпа»: the room's words are topped up from the guess deck to this many, and capped so a round can empty the hat. */
const HAT_MIN_WORDS = 8;
const HAT_MAX_WORDS = 12;
const HAT_TURNS_PER_ROUND = 2;
const HAT_GUESS_POINTS = 60;
const HAT_EXPLAIN_POINTS = 40;
/** A turn that lands this many words gets the narrator's praise. */
const HAT_GOOD_TURN = 3;
/** «Захват»: points per percent of the floor, and the bonus for the biggest area. */
const PAINT_POINTS_PER_PERCENT = 6;
const PAINT_WIN_BONUS = 100;
/** A last place gets cheered on once the leader has this many points and the last has under a share of them, in tenths. */
const FAR_BEHIND_MIN = 600;
const FAR_BEHIND_SHARE = 3;
/** The race into the last round is close when the top two are this many points apart, or this share of the lead. */
const CLOSE_RACE_MIN = 200;
const CLOSE_RACE_SHARE = 0.15;
/** Questions a pair must answer on both sides of the standings before the narrator calls a trend, and the change in match rate that counts. */
const COOP_TREND_MIN = 2;
const COOP_TREND_STEP = 0.2;
const BLANK_VOTE_POINTS = 100;
const MARKET_MESSAGES = 10;
const MARKET_PART_POINTS = 50;
const MARKET_FULL_POINTS = 300;
/** Extra points for the first, second and third right version. */
const MARKET_RANK_POINTS = [150, 100, 50];
const WAVE_ROUNDS = 3;
/** «По порядку»: a perfect order earns this, a partly right one its share of correctly placed pairs. */
const ORDER_POINTS = 200;
const ORDER_EXACT_POINTS = 20;
const FREEZE_ROUNDS = 6;
const FREEZE_SURVIVE_POINTS = 50;
const FREEZE_WIN_POINTS = 150;
const FREEZE_DANCE_SHARE = 0.5;
// bots have no finger to dance with, so each pause the game rolls whether one of them flinched
const FREEZE_BOT_SLIP = 0.15;
/** How far team 0 is ahead of team 1, in taps per member; negative when team 1 leads. */
/** A «Бублик говорит» command as the narrator says it; without the magic words it is a trap. */
export function simonCommand(magic: boolean, color: number): string {
  return magic ? `Бублик говорит: жми ${SIMON_COLORS[color]}!` : `Жми ${SIMON_COLORS[color]}!`;
}

function tugLead(teams: Record<string, 0 | 1>, counts: Record<string, number>): number {
  const sum = [0, 0];
  const size = [0, 0];
  for (const [id, team] of Object.entries(teams)) {
    sum[team]! += counts[id] ?? 0;
    size[team]!++;
  }
  return sum[0]! / Math.max(1, size[0]!) - sum[1]! / Math.max(1, size[1]!);
}

/** «Сумо»: by place on the ice, then per knockout. */
const SUMO_POINTS = [300, 150, 75];
const SUMO_KO_POINTS = 50;
/** «Квач»: per second spent not hunting; a 40-second bout tops out near a gallery win. */
const TAG_POINTS_PER_SECOND = 6;
/** «Перетягивание каната»: taps per player a team must lead by to win before time runs out. */
const TUG_GAP = 25;
const TUG_WIN_POINTS = 150;
const TUG_STRONGEST_POINTS = 50;
/** Clues shown for guessing; with a bigger room the rest stay unread so the game keeps moving. */
const CLUE_ROUNDS = 5;
const CLUE_GUESS_POINTS = 100;
const CLUE_AUTHOR_POINTS = 50;
const TREASURE_EXPEDITIONS = 2;
/** The gem cards of the board game Diamant; two traps of every kind make a bust likely after a dozen cards. */
const TREASURE_GEMS = [1, 2, 3, 4, 5, 5, 7, 7, 9, 11, 11, 13, 14, 15, 17];
const TREASURE_TRAP_COPIES = 2;
const TREASURE_GEM_POINTS = 10;
const LIST_ROUNDS = 2;
const LIST_SHARED_POINTS = 10;
const LIST_UNIQUE_POINTS = 30;
const LIST_UNIQUE_CAP = 8;
const RPS_WIN_POINTS = 50;
const RPS_CHAMPION_POINTS = 150;
/** Rethrows of a drawn match before a coin decides it, so two stubborn rocks cannot stall the bracket. */
const RPS_MAX_REPLAYS = 3;
const QUOTE_GUESS_POINTS = 100;
const QUOTE_FOOL_POINTS = 50;
const REFLEX_ROUNDS = 3;
const LIE_SLOTS = ['Правда', 'Правда', 'Ложь'];
/** Round points by finishing place; anyone slower who still tapped gets the last entry. */
const REFLEX_POINTS = [60, 40, 25, 10];
/** Phones measure the reaction themselves; anything outside this window is noise or tampering. */
const REFLEX_MIN_MS = 80;
/** Wi-Fi delivery of «go» plus the tap's way back; an honest phone is never slower than the server's clock by more. */
const REFLEX_SLACK_MS = 300;
/** «Шкала» points by distance from the target's own answer: exact, one off, two off. */
const SCALE_POINTS = [100, 60, 30];
const SCALE_TARGET_POINTS = 20;
const STORY_MIN_LINES = 4;
const STORY_MAX_LINES = 6;
/** Share of «Звездопад» rounds played in two teams, once there are enough people for it. */
const TEAM_CHANCE = 0.5;
const TEAM_MIN_PLAYERS = 4;
const TEAM_BONUS = 100;
/** Share of rounds after the first that flash the blue trap before green. */
const REFLEX_DECOY_CHANCE = 0.6;
const IDLE_ARENA_MS = 500;

/**
 * Who a wait is for; it ends early once all of them are done. An empty list never ends it early,
 * or a room whose phones all dropped off Wi-Fi would race through the whole game.
 */
interface Expect {
  who: () => Player[];
  done: (p: Player) => boolean;
  /** Gate before which nobody counts as done, e.g. gallery voting opens after the slideshow. */
  open?: () => boolean;
  /** Nothing left to wait for, e.g. the artist left. */
  abandoned?: () => boolean;
}

interface Waiter {
  expect?: Expect;
  /** Bots were already told to wrap up for this wait. */
  hurried: boolean;
  remaining: number;
  startedAt: number;
  timer?: ReturnType<typeof setTimeout>;
  graceTimer?: ReturnType<typeof setTimeout>;
  /** A narrated phase may not end before this moment, however soon the line is read out; see narrated(). */
  floor?: number;
  finish: () => void;
}

/** Bot-facing events: a new phase, every human is done (bots should wrap up), pause toggled. */
export interface GameListener {
  phase(game: Game): void;
  hurry(): void;
  paused(paused: boolean): void;
}

/**
 * One play-through, from the first episode intro to the final screen. The flow is a plain
 * async script; every `wait` resolves on its timer, when everyone has answered, or on skip.
 */
export class Game {
  phase: Phase = { kind: 'lobby' };
  phaseId = 0;
  say: string | undefined;
  location: LocationId | undefined;
  scene: string | undefined;
  paused = false;
  /** Running order, shuffled per game. */
  readonly plan: Episode[];
  finished = false;

  private aborted = false;
  private waiter: Waiter | null = null;
  private pausedAt = 0;
  private listeners: GameListener[] = [];
  private deltas = new Map<string, number>();

  private answers = new Map<string, string | number | string[]>();
  private crowdVotes = new Map<string, string>();
  private done = new Set<string>();
  private inks = new Map<string, Stroke[]>();
  private photos = new Map<string, string>();
  private monster: { order: string[]; sections: string[]; guides: Map<string, Stroke[]> } | null = null;
  private sharedArtist: string | null = null;
  private quoteAuthor: string | null = null;
  private reflexEarly = new Set<string>();
  private describeScene: string | null = null;
  private storyPrevious: string | null = null;
  /** «Эмодзи-портрет»: who each player secretly describes. */
  private emojiTargets = new Map<string, string>();
  private dueled = new Map<string, number>();
  private bombFrom: string | null = null;
  /** «Битва ответов»: each writer's prompt, and the author behind each anonymous answer id. */
  private quipPrompts = new Map<string, string>();
  private oddRound: { pair: OddPair; player: string } | null = null;
  /** «Словарь выдумок»: the author behind each fake's opaque id. */
  private fibAuthors = new Map<string, string>();
  private replyHands = new Map<string, string[]>();
  private foreheadWord: string | null = null;
  /** «Контакт»: the leader's word, its open part, and this step's hints by id. */
  private contactWord: string | null = null;
  private contactLeader: string | null = null;
  private contactPrefix = '';
  private contactHints = new Map<string, { author: string; word: string; text: string }>();
  /** «Оркестр»: per player, the notes already hit and the points each earned. */
  private bandHits = new Map<string, Map<number, number>>();
  /** «Оркестр»: taps that hit no note; each one takes back a point so mashing does not pay. */
  private bandStrays = new Map<string, number>();
  /** «Расследование»: who did it, while the clues come out. */
  private caseCulprit: string | null = null;
  /** Accusations locked so far, with how many clues were out at the time. */
  private caseLocked = new Map<string, { suspect: string; clue: number }>();
  /** «Барахолка»: each seller's item and each buyer's coins left. */
  private junkItems = new Map<string, string>();
  private junkCoins = new Map<string, number>();
  /** «Фруктовый ниндзя»: fruit ids each player has cut, and bombs each one hit. */
  private ninjaSliced = new Map<string, Set<number>>();
  private ninjaBombs = new Map<string, number>();
  /** «Сказочник»: each artist's card id, and the teller while the room votes. */
  private taleCards = new Map<string, string>();
  private taleTeller: string | null = null;
  /** «Викторина на выбывание»: ms left on the clock at each answer, for the speed bonus, and the right option while asking. */
  private quizTimes = new Map<string, number>();
  private quizAnswer: number | undefined;
  /** «В каком году?»: the right slot for the event on the table. */
  private yearsSlot: number | undefined;
  /** «Четырёхлистник»: each writer's five words, the first four on the corners and the last a decoy. */
  private cloverCards = new Map<string, string[]>();
  /** The card index on each corner of the clover being rebuilt. */
  private cloverTruth: number[] = [];
  /** «Шейкер»: the pump count at which each balloon bursts. */
  private shakerLimits = new Map<string, number>();
  /** «Мафия-ТВ»: roles, who is still in the village, and what the seer has learned. */
  private mafiaRoles = new Map<string, MafiaRole>();
  private mafiaAlive = new Set<string>();
  private mafiaSeen: { player: string; wolf: boolean }[] = [];
  /** «Шляпа»: the words still in the hat this round, the one being explained first. */
  private hatQueue: string[] = [];
  private hatTurn: { explainer: string; close: Set<string>; lastAt: Map<string, number> } | null = null;
  private quipAuthors = new Map<string, string>();
  private bombPassedAt = 0;
  private reflexGoAt = 0;
  private spyId: string | null = null;
  private spyPlace = '';
  private plot: {
    chat: Chat;
    target: string;
    word: PlotWord;
    plotters: string[];
    slip: string | null;
  } | null = null;
  private date: { chat: Chat; quirks: Map<string, DateQuirk> } | null = null;
  /** «Маскарад»: who wears each mask, by mask index. */
  private masq: { chat: Chat; owners: string[] } | null = null;
  /** «Сарафанное радио»: every chain so far, and the seating that decides who retells which. */
  private radio: { chains: { author: string | null; text: string }[][]; order: string[]; step: number } | null = null;
  /** «Рынок слухов»: the case, its answer, every player's clues and named versions. */
  private market: { chat: Chat; case: MarketCase; truth: number[]; clues: Map<string, number[]>; guesses: Map<string, number[]> } | null = null;
  private wave: { spectrum: Spectrum; target: number; psychic: string } | null = null;
  /** Who played a joker on the current question; cleared with every new phase. */
  private jokersPlayed = new Set<string>();
  private voteExplained = false;
  /** «Перетягивание каната»: the team that pulled the rope past the line, once one has. */
  private tugWinner: 0 | 1 | null = null;
  /** A game for two keeps count of how often the pair answered alike, for the final. */
  private coop: { matched: number; asked: number } | null = null;
  /** Co-op tallies at the previous standings, to tell whether the pair is getting closer. */
  private coopBefore = { matched: 0, asked: 0 };
  private scoreLeader: string | undefined;
  private readonly cheered = new Set<string>();
  private order: { spectrum: Spectrum; numbers: Map<string, number> } | null = null;
  private freeze: { round: number; musicMs: number; holdFrom: number; dance: Map<string, number>; moved: Set<string> } | null = null;
  private missions: Missions | null = null;
  /** «Три слова»: each writer's secret word, its decoy set and the clue a bot would give. */
  private clueSecrets = new Map<string, { word: string; options: string[]; bot: string }>();
  private clueAnswer = '';
  private listSamples: string[] = [];
  private explained = new Set<GameId>();
  private tapShown = 0;

  private timers = new Set<PhaseTimer>();
  /** Until when an early finish waits for the TV to report the line read out; 0 once it has. */
  private spokenAt = 0;
  private speechTimer: ReturnType<typeof setTimeout> | undefined;
  private guessRound: GuessRound | null = null;
  private drawnCount = new Map<string, number>();
  private arena: Arena | null = null;

  private lastLeader: string | null = null;
  private targeted = new Map<string, number>();
  /** Where the run is in the plan; the voice renders lines for what comes next. */
  private at = { episode: 0, segment: 0 };

  /** Segments still to play, the current one first, and the places of spotlight rounds still to come. */
  ahead(): { segments: Segment[]; spotlights: LocationId[] } {
    const rest = this.plan.slice(this.at.episode);
    return {
      segments: rest.flatMap((e, i) => (i === 0 ? e.segments.slice(this.at.segment) : e.segments)),
      spotlights: rest.slice(1).filter((e) => e.kind === 'spotlight').map((e) => e.location),
    };
  }

  /** The spotlight round's hero, whom every question of the round is about. */
  private hero: Player | null = null;
  private spotlighted = new Map<string, number>();
  private highlights: GalleryItem[] = [];
  private moments: Moment[] = [];

  /** This round's durations: the room's own, or cut short in a «Блиц» round. */
  private dur: Durations;
  /** The current round's twist, if it has one. */
  private modifier: RoundModifier | null = null;

  constructor(
    private readonly host: GameHost,
    private readonly baseDur: Durations,
  ) {
    this.dur = baseDur;
    this.plan = planGame(host.settings.episodes, host.rng, {
      ...host.settings,
      fresh: host.fresh,
      players: host.players().filter((p) => p.connected).length,
    });
  }

  listen(listener: GameListener): void {
    this.listeners.push(listener);
  }

  async run(): Promise<void> {
    try {
      const episodes = this.plan;
      if (this.host.settings.missions) this.missions = new Missions(this.active(), this.host.rng);
      const seated = this.active();
      if (seated.length === 2 && seated.every((p) => p.team === 0)) this.coop = { matched: 0, asked: 0 };
      this.host.decks.setPairs(this.coop !== null);
      for (const [index, episode] of episodes.entries()) {
        this.at = { episode: index, segment: 0 };
        this.hero = episode.kind === 'spotlight' ? this.pickHero() : null;
        this.modifier = this.host.settings.modifiers ? this.pickModifier(index, episodes.length) : null;
        this.dur = this.modifier === 'blitz' ? blitzDurations(this.baseDur) : this.baseDur;
        await this.intro(index, episodes.length, episode.location);
        for (const [at, segment] of episode.segments.entries()) {
          this.at = { episode: index, segment: at };
          const next = episode.scenes.find((s) => s.at === at);
          if (next) await this.enterScene(episode.location, next.scene);
          await this.segment(segment);
        }
        this.hero = null;
        if (index < episodes.length - 1) await this.scores(index + 1, episodes.length);
      }
      // missions are paid after the rounds, so the last round's double must not reach them
      this.modifier = null;
      this.dur = this.baseDur;
      await this.missionsReveal();
      this.final();
    } catch (err) {
      if (!(err instanceof Aborted)) throw err;
    }
  }

  stop(): void {
    this.aborted = true;
    this.clearTimers();
    clearTimeout(this.speechTimer);
    this.waiter?.finish();
  }

  skip(): void {
    this.waiter?.finish();
  }

  setPaused(paused: boolean): void {
    if (paused === this.paused || this.finished) return;
    this.paused = paused;
    const w = this.waiter;
    if (paused) {
      this.pausedAt = Date.now();
      clearTimeout(this.speechTimer);
      for (const t of this.timers) {
        clearTimeout(t.timer);
        t.remaining -= Date.now() - t.startedAt;
      }
      if (w?.timer) {
        clearTimeout(w.timer);
        w.timer = undefined;
        w.remaining -= Date.now() - w.startedAt;
      }
      if (w?.graceTimer) {
        clearTimeout(w.graceTimer);
        w.graceTimer = undefined;
      }
    } else {
      const delta = Date.now() - this.pausedAt;
      // the TV pauses the narrator too, so the line ends that much later
      if (this.spokenAt > 0) this.spokenAt += delta;
      const phase = this.phase as { deadline?: number; showFrom?: number; votingFrom?: number; startsAt?: number };
      if (phase.deadline !== undefined) phase.deadline += delta;
      if (phase.showFrom !== undefined) phase.showFrom += delta;
      if (phase.votingFrom !== undefined) phase.votingFrom += delta;
      if (phase.startsAt !== undefined) phase.startsAt += delta;
      for (const t of this.timers) this.arm(t);
      if (w) {
        if (w.floor !== undefined) w.floor += delta;
        w.startedAt = Date.now();
        w.timer = setTimeout(w.finish, Math.max(0, w.remaining));
      }
      this.poke();
    }
    for (const listener of this.listeners) listener.paused(paused);
    this.host.changed();
  }

  private active(): Player[] {
    return this.host.players().filter((p) => p.connected);
  }

  private player(id: string): Player | undefined {
    return this.host.players().find((p) => p.id === id);
  }

  private name(id: string | undefined): string {
    return (id && this.player(id)?.name) || '';
  }

  /** Runs fn after ms of unpaused time, unless the phase changes first. */
  private after(ms: number, fn: () => void): void {
    const t: PhaseTimer = { fn, remaining: ms, startedAt: Date.now() };
    this.timers.add(t);
    if (!this.paused) this.arm(t);
  }

  private arm(t: PhaseTimer): void {
    t.startedAt = Date.now();
    t.timer = setTimeout(() => {
      this.timers.delete(t);
      t.fn();
    }, Math.max(0, t.remaining));
  }

  private clearTimers(): void {
    for (const t of this.timers) clearTimeout(t.timer);
    this.timers.clear();
  }

  private setPhase(phase: Phase, say?: string): void {
    this.clearTimers();
    clearTimeout(this.speechTimer);
    this.phaseId++;
    this.phase = phase;
    this.say = say;
    const moment = momentOf(phase);
    if (moment) this.moments.push(moment);
    this.spokenAt = say ? Date.now() + this.speech(say) + this.dur.speechSlack : 0;
    this.answers.clear();
    this.jokersPlayed.clear();
    this.crowdVotes.clear();
    this.done.clear();
    this.inks.clear();
    this.photos.clear();
    // a phase born mid-pause (the host skipped) only owes the pause from now on, or resume overshoots its deadline
    if (this.paused) this.pausedAt = Date.now();
    this.host.changed();
    for (const listener of this.listeners) listener.phase(this);
  }

  private speech(text: string | undefined): number {
    return (text?.length ?? 0) * this.dur.speechPerChar;
  }

  private wait(ms: number, expect?: Expect): Promise<void> {
    if (this.aborted) return Promise.reject(new Aborted());
    return new Promise<void>((resolve, reject) => {
      const w: Waiter = {
        expect,
        hurried: false,
        remaining: ms,
        startedAt: Date.now(),
        finish: () => {
          if (this.waiter !== w) return;
          clearTimeout(w.timer);
          clearTimeout(w.graceTimer);
          this.waiter = null;
          if (this.aborted) reject(new Aborted());
          else resolve();
        },
      };
      this.waiter = w;
      if (!this.paused) w.timer = setTimeout(w.finish, ms);
      this.poke();
    });
  }

  /** Spends one of the player's jokers on the current question, if it takes jokers and they have not answered yet. */
  playJoker(playerId: string, phaseId: number): void {
    const p = this.player(playerId);
    if (phaseId !== this.phaseId || !p || p.jokers <= 0 || !this.jokerAllowed(playerId)) return;
    if (this.jokersPlayed.has(playerId) || this.answers.has(playerId)) return;
    p.jokers--;
    this.jokersPlayed.add(playerId);
    this.host.changed();
  }

  /** Jokers double points for agreeing with the room, so only questions scored that way take them. */
  private jokerAllowed(playerId: string): boolean {
    const phase = this.phase;
    if (phase.kind === 'vote') return phase.scoring === 'majority' && !phase.quote && !phase.emoji && !phase.duel;
    return phase.kind === 'predict' && !phase.lie && phase.target !== playerId;
  }

  /**
   * Doubles the gains of everyone who played a joker on this question and returns who did. A joker
   * goes back when the question was `void` (nobody could score) or its owner never answered.
   */
  private spendJokers(gains: Record<string, number>, isVoid: boolean): string[] {
    const spent: string[] = [];
    for (const id of this.jokersPlayed) {
      if (isVoid || !this.answers.has(id)) {
        this.giveJoker(id);
        continue;
      }
      if (gains[id]) gains[id] *= 2;
      spent.push(id);
    }
    return spent;
  }

  /** Whether the pair matched more or less often since the last standings than before them. */
  private coopTrend(): 'coopUp' | 'coopDown' | null {
    const now = this.coop!;
    const before = this.coopBefore;
    this.coopBefore = { ...now };
    const asked = now.asked - before.asked;
    if (before.asked < COOP_TREND_MIN || asked < COOP_TREND_MIN) return null;
    const recent = (now.matched - before.matched) / asked;
    const earlier = before.matched / before.asked;
    if (Math.abs(recent - earlier) < COOP_TREND_STEP) return null;
    return recent > earlier ? 'coopUp' : 'coopDown';
  }

  /** The narrator's word on the jokers played this question, with a leading space; empty when none were. */
  private jokerLine(jokers: string[], gains: Record<string, number>): string {
    if (jokers.length === 0) return '';
    const won = jokers.filter((id) => (gains[id] ?? 0) > 0).length;
    if (jokers.length === 1) return ` ${this.host.decks.line(won ? 'jokerOneWin' : 'jokerOneLose', this.name(jokers[0]!))}`;
    return ` ${this.host.decks.line(won === jokers.length ? 'jokerAllWin' : won > 0 ? 'jokerSomeWin' : 'jokerNoneWin')}`;
  }

  private giveJoker(playerId: string): void {
    const p = this.player(playerId);
    if (p) p.jokers = Math.min(JOKERS_MAX, p.jokers + 1);
  }

  /** The TV reports the narration of `phaseId` read out, which lets the phase end early. */
  spoken(phaseId: number, voiced = false): void {
    if (phaseId !== this.phaseId || this.spokenAt === 0) return;
    this.spokenAt = 0;
    const w = this.waiter;
    if (voiced && w?.floor !== undefined && w.timer && !this.paused) {
      const left = Math.max(w.floor - Date.now(), this.dur.grace);
      if (left < w.remaining - (Date.now() - w.startedAt)) {
        clearTimeout(w.timer);
        w.remaining = left;
        w.startedAt = Date.now();
        w.timer = setTimeout(w.finish, left);
      }
    }
    this.poke();
  }

  /**
   * Holds a phase the narrator reads out: at least `base` for what the screen shows, and past that
   * only until the TV has said the line, plus a beat. The length estimate from the text is only the
   * cap for a TV that never reports; it runs long for a quick voice, which left dead air after reveals.
   */
  private narrated(base: number, say: string | undefined): Promise<void> {
    const done = this.wait(base + this.speech(say));
    if (this.waiter) this.waiter.floor = Date.now() + base;
    return done;
  }

  private poke(): void {
    const w = this.waiter;
    // answers still land while paused, but the phase may only end once the host resumes
    if (this.paused || !w?.expect || w.graceTimer || (w.expect.open && !w.expect.open())) return;
    const { who, done, abandoned } = w.expect;
    const players = who();
    if (abandoned?.() || (players.length > 0 && players.every(done))) {
      // everyone answered while the narrator is still reading: wait for the line, or for the TV to go quiet
      const speaking = this.spokenAt - Date.now();
      if (speaking > 0) {
        clearTimeout(this.speechTimer);
        this.speechTimer = setTimeout(() => this.spoken(this.phaseId), speaking);
        return;
      }
      w.graceTimer = setTimeout(w.finish, this.dur.grace);
      return;
    }
    // people should never sit waiting on a bot's fake thinking time
    const humans = players.filter((p) => !p.bot);
    if (!w.hurried && humans.length > 0 && humans.every(done)) {
      w.hurried = true;
      for (const listener of this.listeners) listener.hurry();
    }
  }

  /** Everyone still connected owes an answer. */
  private answering(): Expect {
    return { who: () => this.active(), done: (p) => this.answers.has(p.id) };
  }

  /** Only players dealt a hand can answer; someone who reconnects mid-phase has none and is not waited for. */
  private answeringDealt(hands: Map<string, unknown>): Expect {
    return { who: () => this.active().filter((p) => hands.has(p.id)), done: (p) => this.answers.has(p.id) };
  }

  /** Everyone still connected owes a submitted drawing or photo. */
  private submitting(): Expect {
    return { who: () => this.active(), done: (p) => this.done.has(p.id) };
  }

  /**
   * The first round plays straight; the last of three or more doubles; in between a round now and
   * then gets a twist, never the one before it. A shared score has no bottom half to help.
   */
  private pickModifier(index: number, total: number): RoundModifier | null {
    if (index === 0) return null;
    if (index === total - 1 && total >= 3) return 'double';
    if (this.host.rng() >= MODIFIER_CHANCE) return null;
    const options = (['blitz', 'underdog'] as const).filter((m) => m !== this.modifier && !(m === 'underdog' && (this.coop || this.host.settings.teams)));
    return options.length > 0 ? pick(options, this.host.rng) : null;
  }

  /** Adds points, applying the round's twist in place so a reveal showing `gains` shows what was paid. */
  private award(gains: Record<string, number>): void {
    if (this.modifier === 'double') for (const id of Object.keys(gains)) gains[id]! *= 2;
    if (this.modifier === 'underdog') {
      const scores = this.host.players().map((p) => p.score).sort((a, b) => a - b);
      const median = scores[Math.floor((scores.length - 1) / 2)] ?? 0;
      for (const id of Object.keys(gains)) if (gains[id]! > 0 && (this.player(id)?.score ?? 0) <= median) gains[id] = Math.round(gains[id]! * UNDERDOG_FACTOR);
    }
    for (const [id, points] of Object.entries(gains)) {
      const p = this.player(id);
      if (!p || points === 0) continue;
      p.score += points;
      this.deltas.set(id, (this.deltas.get(id) ?? 0) + points);
    }
  }

  private async segment(segment: Segment): Promise<void> {
    if (segment === 'vote' || segment === 'bonusVote') return this.playSegment(segment);
    const before = new Map(this.host.players().map((p) => [p.id, p.score]));
    await this.playSegment(segment);
    const gains = Object.fromEntries(this.host.players().map((p) => [p.id, p.score - (before.get(p.id) ?? 0)]));
    this.report({ kind: 'game', gains });
  }

  private async playSegment(segment: Segment): Promise<void> {
    // people left since the plan was made: a plain question beats explaining rules nobody can play
    if (segment in GAME_INFO && this.active().length < (GAME_INFO[segment as GameId].players ?? 0)) return this.vote(false);
    if (segment !== 'vote' && segment !== 'bonusVote' && !this.explained.has(segment)) {
      this.explained.add(segment);
      await this.rules(segment);
    }
    switch (segment) {
      case 'vote':
        return this.vote(false);
      case 'bonusVote':
        return this.vote(true);
      case 'predict':
        return this.predict();
      case 'selfie':
        return this.selfie();
      case 'photo':
        return this.photo();
      case 'monster':
        return this.monsterRound();
      case 'shared':
        return this.shared();
      case 'guess':
        return this.guessSegment();
      case 'tilt':
        return this.tilt();
      case 'quote':
        return this.quote();
      case 'reflex':
        return this.reflex();
      case 'lie':
        return this.lie();
      case 'describe':
        return this.describe();
      case 'scale':
        return this.scale();
      case 'story':
        return this.story();
      case 'never':
        return this.never();
      case 'tap':
        return this.tap();
      case 'emoji':
        return this.emoji();
      case 'herd':
        return this.herd();
      case 'duel':
        return this.duel();
      case 'sync':
        return this.sync();
      case 'bomb':
        return this.bomb();
      case 'closest':
        return this.closest();
      case 'quip':
        return this.quip();
      case 'mime':
        return this.mime();
      case 'truth':
        return this.truth();
      case 'spy':
        return this.spy();
      case 'clue':
        return this.clue();
      case 'treasure':
        return this.treasure();
      case 'list':
        return this.list();
      case 'rps':
        return this.rps();
      case 'plot':
        return this.plotGame();
      case 'date':
        return this.dateGame();
      case 'masq':
        return this.masqGame();
      case 'radio':
        return this.radioGame();
      case 'rush':
        return this.rushGame();
      case 'blank':
        return this.blankGame();
      case 'odd':
        return this.oddGame();
      case 'even':
        return this.evenGame();
      case 'percent':
        return this.percentGame();
      case 'fib':
        return this.fibGame();
      case 'simon':
        return this.simonGame();
      case 'reply':
        return this.replyGame();
      case 'forehead':
        return this.foreheadGame();
      case 'just':
        return this.foreheadGame(true);
      case 'shaker':
        return this.shaker();
      case 'clover':
        return this.clover();
      case 'quiz':
        return this.quiz();
      case 'tale':
        return this.tale();
      case 'rhyme':
        return this.rhyme();
      case 'case':
        return this.investigation();
      case 'contact':
        return this.contact();
      case 'band':
        return this.band();
      case 'junk':
        return this.junk();
      case 'ninja':
        return this.ninja();
      case 'copy':
        return this.copy();
      case 'years':
        return this.years();
      case 'hat':
        return this.hatGame();
      case 'mafia':
        return this.mafiaGame();
      case 'paint':
        return this.brawl('paint');
      case 'market':
        return this.marketGame();
      case 'wave':
        return this.waveGame();
      case 'order':
        return this.orderGame();
      case 'freeze':
        return this.freezeGame();
      case 'sumo':
        return this.brawl('sumo');
      case 'tag':
        return this.brawl('tag');
      case 'tug':
        return this.tug();
    }
  }

  private async intro(episode: number, episodes: number, location: LocationId): Promise<void> {
    this.location = location;
    this.scene = undefined;
    this.host.decks.setPlace(location);
    const lines = narrator.locations[location];
    const hero = this.hero;
    const opening = hero ? fill(pick(lines.spotlight, this.host.rng), hero.name) : pick(lines.intros, this.host.rng);
    const twist = this.modifier && this.host.decks.line(MODIFIER_LINES[this.modifier]);
    const say = twist ? `${opening} ${twist}` : opening;
    this.setPhase({ kind: 'intro', episode, episodes, location, title: lines.title, hero: hero?.id, modifier: this.modifier ?? undefined }, say);
    await this.narrated(this.dur.intro, say);
  }

  private async enterScene(location: LocationId, scene: string): Promise<void> {
    this.scene = scene;
    this.host.decks.setScene(scene);
    const say = pick(sceneLines[`${location}/${scene}`]!, this.host.rng);
    this.setPhase({ kind: 'scene', location, scene, title: PLACE_SCENES[location]?.[scene] ?? '' }, say);
    await this.narrated(this.dur.scene, say);
  }

  private async rules(game: GameId): Promise<void> {
    const say = rulesLine(game);
    const ms = this.dur.rules + this.speech(say);
    const phase: Phase = { kind: 'rules', game, deadline: Date.now() + ms, ready: [] };
    this.setPhase(phase, say);
    await this.wait(ms, { who: () => this.active().filter((p) => !p.bot), done: (p) => this.answers.has(p.id) });
  }

  private async vote(bonus: boolean): Promise<void> {
    const q = this.host.decks.nextVote();
    const options = this.host.players().map((p) => p.id);
    const intro = bonus
      ? 'Последний вопрос — и он стоит двойных очков!'
      : this.host.decks.line('voteIntro');
    // the scoring is said once, on the first plain question of the game, where it matters
    const rules = this.voteExplained ? '' : 'За каждого, кто ответит так же, как вы, — пятьдесят очков. Уверены? Ставьте джокер!';
    this.voteExplained = true;
    this.setPhase(
      {
        kind: 'vote',
        question: q.q,
        options,
        allowSelf: true,
        scoring: 'majority',
        deadline: Date.now() + this.dur.voteAsk,
        answered: [],
        bonus,
        custom: q.custom,
      },
      `${q.custom ? 'Вопрос от вашей компании!' : (q.setup ?? intro)} ${rules ? `${rules} ` : ''}${q.q}`,
    );
    await this.wait(this.dur.voteAsk, this.answering());

    const votes = this.stringAnswers();
    const crowd = this.crowdPick();
    const result = scoreVote(votes, 'majority', bonus ? 2 : 1);
    const jokers = this.spendJokers(result.gains, result.noConsensus || Object.keys(votes).length < 2);
    const voters = Object.keys(votes);
    const unanimous = voters.length >= 3 && result.leaders.length === 1 && voters.every((id) => votes[id] === result.leaders[0]);
    if (this.coop && voters.length === 2) {
      this.coop.asked++;
      if (votes[voters[0]!] === votes[voters[1]!]) this.coop.matched++;
    }
    if (unanimous) for (const id of voters) this.giveJoker(id);
    const sole = result.leaders.length === 1 && !result.noConsensus ? result.leaders[0]! : null;
    this.report({ kind: 'vote', votes, order: this.phase.kind === 'vote' ? [...this.phase.answered] : [], leader: sole });
    this.award(result.gains);
    for (const id of Object.keys(result.gains)) {
      const p = this.player(id);
      if (p) p.stats.majority++;
    }

    let say: string;
    let title: string | undefined;
    if (result.leaders.length === 0) {
      say = this.host.decks.line('voteEmpty');
    } else if (result.noConsensus || result.leaders.length > 1) {
      say = this.host.decks.line('voteTie');
    } else {
      const leader = result.leaders[0]!;
      title = q.title;
      this.player(leader)?.stats.titles.push({ title: q.title, question: q.q });
      say = `${this.host.decks.line('voteReveal', this.name(leader))} Титул «${q.title}»!`;
    }
    if (q.after) say += ` ${q.after}`;
    if (unanimous) say += ' Единогласно — каждому по джокеру!';
    say += this.jokerLine(jokers, result.gains);
    if (result.leaders.length > 0) this.lastLeader = pick(result.leaders, this.host.rng);

    this.setPhase(
      {
        kind: 'voteReveal',
        question: q.q,
        votes: Object.entries(votes).map(([from, to]) => ({ from, to })),
        leaders: result.leaders,
        gains: result.gains,
        title,
        crowd,
        jokers,
        unanimous: unanimous || undefined,
      },
      say,
    );
    await this.narrated(this.dur.voteReveal, say);
  }

  /** People before bots, and whoever has had the spotlight least, so everyone gets a turn. */
  private pickHero(): Player | null {
    const people = this.active().filter((p) => !p.bot);
    const pool = people.length > 0 ? people : this.active();
    if (pool.length === 0) return null;
    const fewest = Math.min(...pool.map((p) => this.spotlighted.get(p.id) ?? 0));
    const hero = pick(pool.filter((p) => (this.spotlighted.get(p.id) ?? 0) === fewest), this.host.rng);
    this.spotlighted.set(hero.id, fewest + 1);
    return hero;
  }

  private pickTarget(): Player {
    if (this.hero?.connected) return this.hero;
    const pool = this.active().filter((p) => !p.bot);
    const candidates = pool.length > 0 ? pool : this.active();
    const fallback = candidates.length > 0 ? candidates : this.host.players();
    const fewest = Math.min(...fallback.map((p) => this.targeted.get(p.id) ?? 0));
    const target = pick(
      fallback.filter((p) => (this.targeted.get(p.id) ?? 0) === fewest),
      this.host.rng,
    );
    this.targeted.set(target.id, fewest + 1);
    return target;
  }

  private async predict(): Promise<void> {
    const q = this.host.decks.nextPredict();
    const target = this.pickTarget();
    const question = fill(q.q, target.name);
    this.setPhase(
      {
        kind: 'predict',
        question,
        target: target.id,
        options: q.options,
        deadline: Date.now() + this.dur.predictAsk,
        answered: [],
      },
      `${q.setup ? fill(q.setup, target.name) : this.host.decks.line('predictIntro', target.name)} ${question}`,
    );
    await this.wait(this.dur.predictAsk, this.answering());

    const targetAnswer = this.answers.get(target.id);
    const guesses: Record<string, number> = {};
    for (const [id, value] of this.answers) {
      if (id !== target.id && typeof value === 'number') guesses[id] = value;
    }
    const correct = typeof targetAnswer === 'number' ? targetAnswer : undefined;
    const result = scorePredict(target.id, correct, guesses);
    const jokers = this.spendJokers(result.gains, correct === undefined);
    this.award(result.gains);
    if (this.coop && correct !== undefined && Object.keys(guesses).length === 1) {
      this.coop.asked++;
      this.coop.matched += result.hits.length;
    }
    for (const id of result.hits) {
      const p = this.player(id);
      if (p) p.stats.predictHits++;
    }
    target.stats.guessedAbout += result.hits.length;

    const guessers = Object.keys(guesses).length;
    let say: string;
    if (correct === undefined) say = `${target.name} так и не ответит. Загадка века!`;
    else if (guessers > 0 && result.hits.length * 2 >= guessers)
      say = this.host.decks.line('predictMostRight', target.name);
    else say = this.host.decks.line('predictMostWrong', target.name);
    if (q.after) say += ` ${fill(q.after, target.name)}`;
    say += this.jokerLine(jokers, result.gains);

    this.setPhase(
      {
        kind: 'predictReveal',
        question,
        target: target.id,
        options: q.options,
        correct: correct ?? -1,
        guesses,
        gains: result.gains,
        jokers,
      },
      say,
    );
    await this.narrated(this.dur.predictReveal, say);
  }

  private async selfie(): Promise<void> {
    const players = this.host.players();
    const subject =
      (this.hero?.connected && this.hero) || (this.lastLeader && this.player(this.lastLeader)) || pick(players, this.host.rng);
    this.lastLeader = null;
    const task = this.host.decks.sketchPrompt();
    const image = task.image ? `/sketch/${task.image}.webp` : ((task.pose && (await this.pose(subject, task.pose))) ?? this.host.faceAsset(subject));
    const prompt = fill(task.q, subject.name);
    const intro = task.setup ? fill(task.setup, subject.name) : this.host.decks.line('selfieIntro');
    this.setPhase(
      {
        kind: 'draw',
        mode: 'selfie',
        prompt,
        subject: subject.id,
        image,
        board: BOARDS.selfie,
        deadline: Date.now() + this.dur.selfieDraw,
        done: [],
      },
      task.q.includes('{name}') ? `${intro} ${prompt}!` : `${intro} Модель — ${subject.name}. ${prompt}!`,
    );
    await this.wait(this.dur.selfieDraw, this.submitting());

    const items: GalleryItem[] = [];
    for (const p of players) {
      const strokes = this.inks.get(p.id);
      if (!strokes?.length) continue;
      items.push({
        id: newId(),
        authors: [p.id],
        kind: 'selfie',
        ink: this.host.putAsset('application/json', JSON.stringify(strokes)),
        image,
        board: BOARDS.selfie,
        caption: prompt,
      });
    }
    await this.gallery(`${prompt} · модель: ${subject.name}`, items, 'art', task.after && fill(task.after, subject.name));
  }

  /** The model takes a fresh selfie with the asked face; undefined when it never arrives, so the old one stands in. */
  private async pose(subject: Player, face: string): Promise<string | undefined> {
    if (subject.bot || !subject.connected) return undefined;
    const prompt = `${subject.name}, сделайте селфи ${face}`;
    this.setPhase({ kind: 'photo', prompt, deadline: Date.now() + this.dur.photo, done: [], subject: subject.id }, `${prompt}!`);
    await this.wait(this.dur.photo, { who: () => (subject.connected ? [subject] : []), done: (p) => this.done.has(p.id) });
    return this.photos.get(subject.id);
  }

  private async describe(): Promise<void> {
    const describer = this.pickTarget();
    const scene = this.host.decks.describe.draw();
    this.describeScene = scene;
    this.setPhase(
      {
        kind: 'draw',
        mode: 'describe',
        prompt: '',
        describer: describer.id,
        board: BOARDS.describe,
        deadline: Date.now() + this.dur.selfieDraw,
        done: [],
      },
      this.host.decks.line('describeIntro', describer.name),
    );
    await this.wait(this.dur.selfieDraw, {
      who: () => this.active().filter((p) => p.id !== describer.id),
      done: (p) => this.done.has(p.id),
    });
    this.describeScene = null;

    const items: GalleryItem[] = [];
    for (const p of this.host.players()) {
      const strokes = this.inks.get(p.id);
      if (p.id === describer.id || !strokes?.length) continue;
      items.push({
        id: newId(),
        authors: [p.id],
        kind: 'describe',
        ink: this.host.putAsset('application/json', JSON.stringify(strokes)),
        board: BOARDS.describe,
        caption: scene,
      });
    }
    const gains = await this.gallery(`${scene} · описание: ${describer.name}`, items, 'art');
    // a clear description lifts every drawing, so the describer earns the artists' average
    const earned = Object.values(gains);
    if (earned.length > 0) this.award({ [describer.id]: Math.round(earned.reduce((a, b) => a + b, 0) / items.length) });
  }

  private async scale(): Promise<void> {
    const target = this.pickTarget();
    const q = this.host.decks.nextScale();
    const question = fill(q.q, target.name);
    this.setPhase(
      {
        kind: 'scale',
        question,
        target: target.id,
        low: q.low,
        high: q.high,
        deadline: Date.now() + this.dur.scaleAsk,
        answered: [],
      },
      `${this.host.decks.line('scaleIntro', target.name)} ${question}`,
    );
    await this.wait(this.dur.scaleAsk, this.answering());

    const truthAnswer = this.answers.get(target.id);
    const truth = typeof truthAnswer === 'number' ? truthAnswer : null;
    const guesses = [...this.answers]
      .filter((e): e is [string, number] => e[0] !== target.id && typeof e[1] === 'number')
      .map(([player, value]) => ({ player, value }));
    const gains: Record<string, number> = {};
    if (truth !== null) {
      for (const g of guesses) {
        const points = SCALE_POINTS[Math.abs(g.value - truth)] ?? 0;
        if (points > 0) gains[g.player] = points;
      }
      // a player the room can read well earns a little for being an open book
      const close = guesses.filter((g) => Math.abs(g.value - truth) <= 1).length;
      if (close > 0) gains[target.id] = close * SCALE_TARGET_POINTS;
    }
    this.award(gains);
    for (const id of Object.keys(gains)) if (id !== target.id) this.player(id)!.stats.predictHits++;

    const exact = guesses.filter((g) => g.value === truth).map((g) => this.name(g.player));
    const say =
      truth === null
        ? 'Своей оценки так и не появилось — загадка остаётся загадкой!'
        : exact.length > 0
          ? `${target.name}: ${truth} из ${SCALE_MAX}. В точку попали: ${joinNames(exact)}!`
          : `${target.name} — это ${truth} из ${SCALE_MAX}. Точно не угадал никто!`;
    this.setPhase(
      { kind: 'scaleReveal', question, target: target.id, low: q.low, high: q.high, truth, guesses, gains },
      say,
    );
    await this.narrated(this.dur.scaleReveal, say);
  }

  private async story(): Promise<void> {
    const players = shuffle(this.active(), this.host.rng);
    if (players.length < 2) return;
    const turns = Math.min(STORY_MAX_LINES, Math.max(STORY_MIN_LINES, players.length));
    const start = this.host.decks.story.draw();
    const lines: { author?: string; text: string }[] = [{ text: start }];
    for (let turn = 0; turn < turns; turn++) {
      const author = players[turn % players.length]!;
      if (!author.connected) continue;
      this.storyPrevious = lines.at(-1)!.text;
      const say = turn === 0 ? `${this.host.decks.line('storyIntro')} Начало такое: ${start}` : undefined;
      const ms = this.dur.storyTurn + this.speech(say);
      this.setPhase(
        {
          kind: 'write',
          prompt: 'Продолжите историю',
          deadline: Date.now() + ms,
          done: [],
          author: author.id,
          story: { turn, turns },
        },
        say,
      );
      await this.wait(ms, {
        who: () => (author.connected ? [author] : []),
        done: (p) => this.answers.has(p.id),
        abandoned: () => !author.connected,
      });
      const text = this.answers.get(author.id);
      if (typeof text === 'string') lines.push({ author: author.id, text });
    }
    this.storyPrevious = null;

    const say = lines.map((l) => l.text).join(' ');
    this.setPhase({ kind: 'storyReveal', lines }, say);
    await this.wait(lines.length * this.dur.storyLine + this.dur.sharedReveal + this.speech(say));

    const authors = [...new Set(lines.flatMap((l) => (l.author ? [l.author] : [])))];
    await this.bestOf('Чья строчка в истории самая смешная?', authors, 'art');
  }

  private async photo(): Promise<void> {
    const prompt = this.host.decks.photo.draw();
    this.setPhase(
      { kind: 'photo', prompt, deadline: Date.now() + this.dur.photo, done: [] },
      `${this.host.decks.line('photoIntro')} ${prompt}`,
    );
    await this.wait(this.dur.photo, this.submitting());

    const items: GalleryItem[] = [];
    for (const p of this.host.players()) {
      const image = this.photos.get(p.id);
      if (image) items.push({ id: newId(), authors: [p.id], kind: 'photo', image, caption: prompt });
    }
    await this.gallery(prompt, items, 'photo');
  }

  private async monsterRound(): Promise<void> {
    const theme = this.host.decks.monster.draw();
    const order = shuffle(
      this.active().map((p) => p.id),
      this.host.rng,
    );
    const board = BOARDS.monster;
    const chains: Stroke[][][] = order.map(() => []);
    const artists: string[][] = order.map(() => []);

    for (let step = 0; step < theme.sections.length; step++) {
      const guides = new Map<string, Stroke[]>();
      if (step > 0) {
        for (const id of order) {
          const above = chains[relayChainOf(order, id, step)]![step - 1] ?? [];
          guides.set(id, guideStrip(above, board));
        }
      }
      this.monster = { order, sections: theme.sections, guides };
      const say =
        step === 0
          ? `${this.host.decks.line('monsterIntro')} Тема: ${theme.name}.`
          : step === 1
            ? 'Передаём дальше! Продолжите то, что торчит сверху.'
            : 'Последний этап — дорисуйте низ!';
      this.setPhase(
        {
          kind: 'draw',
          mode: 'monster',
          prompt: theme.name,
          board,
          deadline: Date.now() + this.dur.monsterStep,
          done: [],
          step,
          steps: theme.sections,
        },
        say,
      );
      await this.wait(this.dur.monsterStep, this.submitting());
      for (const id of order) {
        const chain = relayChainOf(order, id, step);
        const strokes = this.inks.get(id) ?? [];
        chains[chain]![step] = strokes;
        if (strokes.length > 0) artists[chain]!.push(id);
      }
    }
    this.monster = null;

    const tall: Board = { w: board.w, h: board.h * theme.sections.length };
    const items: GalleryItem[] = [];
    chains.forEach((sections, chain) => {
      const authors = [...new Set(artists[chain])];
      if (authors.length === 0) return;
      const merged = sections.flatMap((strokes, step) =>
        (strokes ?? []).map((s) => shiftStroke(s, step * board.h)),
      );
      items.push({
        id: newId(),
        authors,
        kind: 'monster',
        ink: this.host.putAsset('application/json', JSON.stringify(merged)),
        board: tall,
        caption: theme.name,
      });
    });
    await this.gallery(theme.name, items, 'art');
  }

  private async shared(): Promise<void> {
    const theme = this.host.decks.shared.draw();
    const order = shuffle(
      this.active().map((p) => p.id),
      this.host.rng,
    );
    if (order.length === 0) return;
    const turns = sharedTurnCount(order.length);
    const tasks = shuffle(theme.tasks, this.host.rng);
    const committed: Stroke[] = [];
    const contributors = new Set<string>();
    let ink: string | undefined;

    for (let turn = 0; turn < turns; turn++) {
      const artist = order[turn % order.length]!;
      if (!this.player(artist)?.connected) continue;
      this.sharedArtist = artist;
      const say =
        turn === 0
          ? `${this.host.decks.line('sharedIntro')} Тема: ${theme.theme}. Первым рисует ${this.name(artist)}!`
          : undefined;
      this.setPhase(
        {
          kind: 'shared',
          theme: theme.theme,
          order,
          turn,
          turns,
          artist,
          task: tasks[turn % tasks.length]!,
          deadline: Date.now() + this.dur.sharedTurn + this.speech(say),
          board: BOARDS.shared,
          ink,
        },
        say,
      );
      await this.wait(this.dur.sharedTurn + this.speech(say), {
        who: () => this.active().filter((p) => p.id === artist),
        done: (p) => this.done.has(p.id),
        abandoned: () => !this.player(artist)?.connected,
      });
      const added = this.inks.get(artist) ?? [];
      if (added.length > 0) {
        committed.push(...added);
        contributors.add(artist);
        ink = this.host.putAsset('application/json', JSON.stringify(committed));
      }
    }
    this.sharedArtist = null;
    if (!ink) return;

    const caption = theme.theme;
    this.highlights.push({
      id: newId(),
      authors: [...contributors],
      kind: 'shared',
      ink,
      board: BOARDS.shared,
      caption,
    });
    const revealSay = 'Вот это шедевр! Повесим его в Лувр. Ну, или хотя бы на холодильник.';
    this.setPhase(
      { kind: 'sharedReveal', theme: caption, ink, board: BOARDS.shared, order: order.filter((id) => contributors.has(id)) },
      revealSay,
    );
    await this.narrated(this.dur.sharedReveal, revealSay);

    await this.bestOf('Чей вклад в картину самый удачный?', order.filter((id) => contributors.has(id)), 'art');
  }

  /** «Whose part was best?» over the given people; each vote received is worth points. */
  private async bestOf(question: string, options: string[], stat: 'art'): Promise<void> {
    if (options.length < 2) return;
    this.setPhase(
      {
        kind: 'vote',
        question,
        options,
        allowSelf: this.host.settings.selfVote,
        scoring: 'received',
        deadline: Date.now() + this.dur.voteAsk,
        answered: [],
        bonus: false,
      },
      question,
    );
    await this.wait(this.dur.voteAsk, this.answering());
    const votes = this.stringAnswers();
    const result = scoreVote(votes, 'received');
    // the stats feed the final's titles, which should not lean on a round's twist
    for (const [id, points] of Object.entries(result.gains)) {
      const p = this.player(id);
      if (p) p.stats[stat] += points / 100;
    }
    this.award(result.gains);
    const say =
      result.leaders.length === 1
        ? `Лучше всех — ${this.name(result.leaders[0])}!`
        : 'Голоса разделились — все молодцы!';
    this.setPhase(
      {
        kind: 'voteReveal',
        question,
        votes: Object.entries(votes).map(([from, to]) => ({ from, to })),
        leaders: result.leaders,
        gains: result.gains,
      },
      say,
    );
    await this.narrated(this.dur.voteReveal, say);
  }

  /** Two draw-and-guess rounds, preferring people who haven't held the brush yet. */
  private async guessSegment(): Promise<void> {
    if (this.active().length < 2) return;
    const rounds = 2;
    const used = new Set<string>();
    for (let round = 0; round < rounds; round++) {
      const pool = this.active().filter((p) => !used.has(p.id));
      if (pool.length === 0 || this.active().length < 2) break;
      const humans = pool.filter((p) => !p.bot);
      const candidates = humans.length > 0 ? humans : pool;
      const fewest = Math.min(...candidates.map((p) => this.drawnCount.get(p.id) ?? 0));
      const artist = pick(
        candidates.filter((p) => (this.drawnCount.get(p.id) ?? 0) === fewest),
        this.host.rng,
      );
      used.add(artist.id);
      this.drawnCount.set(artist.id, fewest + 1);
      await this.guessOne(artist, round, rounds);
    }
  }

  private async mime(): Promise<void> {
    // a bot cannot act anything out, so only people take the stage
    const actors = shuffle(
      this.active().filter((p) => !p.bot),
      this.host.rng,
    ).sort((a, b) => (this.drawnCount.get(a.id) ?? 0) - (this.drawnCount.get(b.id) ?? 0));
    if (actors.length === 0 || this.active().length < 2) return this.vote(false);
    const rounds = Math.min(MIME_ROUNDS, actors.length);
    for (let round = 0; round < rounds; round++) {
      const actor = actors[round]!;
      if (!actor.connected) continue;
      this.drawnCount.set(actor.id, (this.drawnCount.get(actor.id) ?? 0) + 1);
      await this.guessOne(actor, round, rounds, true);
    }
  }

  private async guessOne(artist: Player, round: number, rounds: number, mime = false): Promise<void> {
    const word = mime ? this.host.decks.mimeWord() : this.host.decks.guessWord();
    const state: GuessRound = {
      word,
      artist: artist.id,
      revealed: new Set(),
      points: new Map(),
      tries: new Map(),
      feedback: new Map(),
      lastAt: new Map(),
    };
    this.guessRound = state;
    const say = this.host.decks.line(mime ? 'mimeIntro' : 'guessIntro', artist.name);
    const total = (mime ? this.dur.mimeAct : this.dur.guessDraw) + this.speech(say);
    this.setPhase(
      {
        kind: 'guess',
        artist: artist.id,
        hint: hintOf(word, state.revealed),
        round,
        rounds,
        deadline: Date.now() + total,
        board: BOARDS.shared,
        solved: [],
        feed: [],
        mime: mime || undefined,
      },
      say,
    );

    const letters = [...word].map((ch, i) => (/[\p{L}\p{N}]/u.test(ch) ? i : -1)).filter((i) => i >= 0);
    const reveal = (index: number | undefined) => {
      const phase = this.phase;
      if (index === undefined || phase.kind !== 'guess' || this.guessRound !== state) return;
      state.revealed.add(index);
      phase.hint = hintOf(word, state.revealed);
      this.host.changed();
    };
    this.after(total * 0.5, () => reveal(letters[0]));
    if (letters.length >= 5) {
      this.after(total * 0.75, () => reveal(pick(letters.slice(1), this.host.rng)));
    }

    await this.wait(total, {
      who: () => this.active().filter((p) => p.id !== artist.id),
      done: (p) => state.points.has(p.id),
      abandoned: () => !this.player(artist.id)?.connected,
    });

    const solved = [...state.points.keys()];
    const gains: Record<string, number> = Object.fromEntries(state.points);
    if (solved.length > 0) gains[artist.id] = solved.length * ARTIST_POINTS;
    this.award(gains);
    for (const id of solved) {
      const p = this.player(id);
      if (p) p.stats.guessHits++;
    }
    artist.stats.drawingsSolved += solved.length;

    const strokes = this.inks.get(artist.id) ?? [];
    const ink = strokes.length > 0 ? this.host.putAsset('application/json', JSON.stringify(strokes)) : undefined;
    if (ink && solved.length > 0) {
      this.highlights.push({
        id: newId(),
        authors: [artist.id],
        kind: 'guess',
        ink,
        board: BOARDS.shared,
        caption: `«${word}» — рисует ${artist.name}`,
      });
    }
    this.guessRound = null;
    const guessers = this.active().filter((p) => p.id !== artist.id).length;
    const most = solved.length > 0 && solved.length * 2 >= guessers;
    const revealSay = mime
      ? most
        ? this.host.decks.line('mimeDone', artist.name)
        : `Загаданное слово — «${word}». ${solved.length > 0 ? 'Угадали не все, но актёрский талант налицо!' : 'Крокодил остался непонятым!'}`
      : most
        ? this.host.decks.line('guessSolved', artist.name)
        : solved.length > 0
          ? `Загаданное слово — «${word}». Угадали не все, но художник не зря старается!`
          : this.host.decks.line('guessUnsolved', artist.name);
    this.setPhase(
      { kind: 'guessReveal', artist: artist.id, word, ink, board: BOARDS.shared, solved, gains, mime: mime || undefined },
      revealSay,
    );
    await this.narrated(this.dur.guessReveal, revealSay);
  }

  /** What the current artist has drawn so far, when there is a live drawing to catch a fresh screen up on. */
  inkSnapshot(): { player: string; strokes: Stroke[] } | undefined {
    const phase = this.phase;
    const artist =
      phase.kind === 'guess' && !phase.mime ? phase.artist : phase.kind === 'shared' ? this.sharedArtist : null;
    return artist ? { player: artist, strokes: this.inks.get(artist) ?? [] } : undefined;
  }

  /** Text answers already in for the current phase, for bots that follow the herd. */
  writtenSoFar(): string[] {
    return [...this.answers.values()].filter((v): v is string => typeof v === 'string');
  }

  /** Word the current artist is drawing; bots peek at it to guess sometimes. */
  secretWord(): string | undefined {
    return this.guessRound?.word;
  }

  guess(playerId: string, phaseId: number, raw: unknown): void {
    const phase = this.phase;
    const state = this.guessRound;
    if (phaseId === this.phaseId && phase.kind === 'hat') return this.hatGuess(playerId, raw);
    if (phaseId !== this.phaseId || phase.kind !== 'guess' || !state) return;
    if (playerId === state.artist || state.points.has(playerId)) return;
    const now = Date.now();
    if (now - (state.lastAt.get(playerId) ?? 0) < GUESS_COOLDOWN_MS) return;
    const text = cleanGuess(raw);
    if (!text) return;
    state.lastAt.set(playerId, now);
    const tries = [...(state.tries.get(playerId) ?? []), text].slice(-5);
    state.tries.set(playerId, tries);

    const verdict = judge(text, state.word);
    if (verdict === 'right') {
      const total = phase.mime ? this.dur.mimeAct : this.dur.guessDraw;
      state.points.set(playerId, guessPoints((phase.deadline - now) / total));
      state.feedback.delete(playerId);
      phase.solved.push(playerId);
    } else {
      state.feedback.set(playerId, verdict);
      phase.feed = [...phase.feed, { player: playerId, text }].slice(-GUESS_FEED);
    }
    this.host.changed();
    this.poke();
  }

  /** «Кто соврал?»: one player writes two truths and a lie about themselves, the rest hunt the lie. */
  private async lie(): Promise<void> {
    const target = this.pickTarget();
    const say = this.host.decks.line('lieIntro', target.name);
    this.setPhase(
      {
        kind: 'write',
        prompt: `${target.name}: две правды и одна ложь о себе`,
        deadline: Date.now() + this.dur.write,
        done: [],
        author: target.id,
        slots: LIE_SLOTS,
      },
      say,
    );
    await this.wait(this.dur.write, {
      who: () => this.active().filter((p) => p.id === target.id),
      done: (p) => this.answers.has(p.id),
      abandoned: () => !this.player(target.id)?.connected,
    });
    const written = this.answers.get(target.id);
    if (!Array.isArray(written)) return;

    // the last slot is the lie; shuffle so its position gives nothing away
    const order = shuffle([0, 1, 2], this.host.rng);
    const options = order.map((i) => written[i]!);
    const lieAt = order.indexOf(LIE_SLOTS.length - 1);
    const question = `Что из этого — ложь? Пишет ${target.name}`;
    this.setPhase(
      {
        kind: 'predict',
        question,
        target: target.id,
        options,
        deadline: Date.now() + this.dur.predictAsk,
        answered: [],
        lie: true,
      },
      question,
    );
    await this.wait(this.dur.predictAsk, {
      who: () => this.active().filter((p) => p.id !== target.id),
      done: (p) => this.answers.has(p.id),
    });

    const guesses: Record<string, number> = {};
    const gains: Record<string, number> = {};
    let fooled = 0;
    for (const [id, value] of this.answers) {
      if (id === target.id || typeof value !== 'number') continue;
      guesses[id] = value;
      if (value === lieAt) {
        gains[id] = QUOTE_GUESS_POINTS;
        const p = this.player(id);
        if (p) p.stats.predictHits++;
      } else fooled++;
    }
    if (fooled > 0) gains[target.id] = fooled * QUOTE_FOOL_POINTS;
    target.stats.fooled += fooled;
    this.award(gains);

    const caught = Object.keys(guesses).length - fooled;
    const revealSay = this.host.decks.line(caught > fooled ? 'lieFound' : 'lieHidden', target.name);
    this.setPhase(
      { kind: 'predictReveal', question, target: target.id, options, correct: lieAt, guesses, gains, lie: true },
      revealSay,
    );
    await this.narrated(this.dur.predictReveal, revealSay);
  }

  /** «Кто это написал?»: everyone finishes a phrase, then the room hunts for the authors. */
  private async quote(): Promise<void> {
    // with two players the author is whoever you are not
    if (this.active().length < 3) return this.vote(false);
    const prompt = this.host.decks.quote.draw();
    const say = this.host.decks.line('writeIntro');
    this.setPhase({ kind: 'write', prompt, deadline: Date.now() + this.dur.write, done: [] }, say);
    await this.wait(this.dur.write, this.answering());

    const written = [...this.answers].filter((e): e is [string, string] => typeof e[1] === 'string');
    const lead = prompt.replace(/…$/, '').trim();
    for (const [author, text] of shuffle(written, this.host.rng).slice(0, QUOTE_ROUNDS)) {
      await this.quoteRound(`${lead} ${text}`, author);
    }
    this.quoteAuthor = null;
  }

  private async quoteRound(question: string, author: string): Promise<void> {
    this.quoteAuthor = author;
    const say = this.host.decks.line('quoteIntro');
    this.setPhase(
      {
        kind: 'vote',
        question,
        options: this.host.players().map((p) => p.id),
        allowSelf: false,
        scoring: 'majority',
        deadline: Date.now() + this.dur.voteAsk,
        answered: [],
        bonus: false,
        quote: true,
      },
      say,
    );
    await this.wait(this.dur.voteAsk, {
      who: () => this.active().filter((p) => p.id !== author),
      done: (p) => this.answers.has(p.id),
    });

    const votes = this.stringAnswers();
    const gains: Record<string, number> = {};
    let fooled = 0;
    for (const [voter, pickId] of Object.entries(votes)) {
      if (pickId === author) gains[voter] = QUOTE_GUESS_POINTS;
      else fooled++;
    }
    if (fooled > 0) gains[author] = fooled * QUOTE_FOOL_POINTS;
    const writer = this.player(author);
    if (writer) writer.stats.fooled += fooled;
    this.award(gains);

    const found = Object.keys(votes).length - fooled;
    const line = found > fooled ? 'quoteFound' : 'quoteHidden';
    const revealSay = this.host.decks.line(line, this.name(author));
    this.setPhase(
      {
        kind: 'voteReveal',
        question,
        votes: Object.entries(votes).map(([from, to]) => ({ from, to })),
        leaders: [author],
        gains,
        author,
      },
      revealSay,
    );
    await this.narrated(this.dur.voteReveal, revealSay);
  }

  private async never(): Promise<void> {
    if (this.active().length < 2) return this.vote(false);
    for (let round = 1; round <= NEVER_ROUNDS; round++) {
      const statement = this.host.decks.never.draw();
      const intro = round === 1 ? `${this.host.decks.line('neverIntro')} ` : '';
      this.setPhase(
        {
          kind: 'never',
          statement,
          round,
          rounds: NEVER_ROUNDS,
          deadline: Date.now() + this.dur.neverAsk,
          answered: [],
          players: this.active().length,
        },
        `${intro}Я никогда не ${statement}.`,
      );
      await this.wait(this.dur.neverAsk, this.answering());

      const did: string[] = [];
      const didNot: string[] = [];
      const guesses: Record<string, number> = {};
      for (const [id, value] of this.answers) {
        if (typeof value !== 'string') continue;
        const [yes, guess] = value.split(':');
        (yes === '1' ? did : didNot).push(id);
        guesses[id] = Number(guess);
      }
      const gains: Record<string, number> = {};
      for (const [id, guess] of Object.entries(guesses)) {
        const points = NEVER_POINTS[Math.abs(guess - did.length)] ?? 0;
        if (points > 0) gains[id] = points;
      }
      this.award(gains);
      const say = `${this.host.decks.line('neverReveal')} «Было» — у ${did.length} из ${did.length + didNot.length}.`;
      this.setPhase({ kind: 'neverReveal', statement, did, didNot, guesses, gains }, say);
      await this.narrated(this.dur.neverReveal, say);
    }
  }

  private async tap(): Promise<void> {
    const say = this.host.decks.line('tapIntro');
    const countdown = this.dur.tapCountdown + this.speech(say);
    const startsAt = Date.now() + countdown;
    const counts: Record<string, number> = {};
    for (const p of this.active()) counts[p.id] = 0;
    this.setPhase({ kind: 'tap', startsAt, deadline: startsAt + this.dur.tapPlay, counts }, say);
    // phones send their total every 250 ms, so the last taps land after the deadline
    await this.wait(countdown + this.dur.tapPlay + this.dur.grace);

    const ranked = Object.entries(counts)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1]);
    const gains: Record<string, number> = {};
    let place = 0;
    ranked.forEach(([id, n], i) => {
      if (i > 0 && n < ranked[i - 1]![1]) place = i;
      const points = TAP_POINTS[place] ?? 0;
      if (points > 0) gains[id] = points;
    });
    this.award(gains);
    const winner = ranked[0]?.[0];
    const result = winner ? this.host.decks.line('tapWin', this.name(winner)) : 'Пальцы так и не разогрелись!';
    this.setPhase({ kind: 'tapReveal', counts: { ...counts }, gains }, result);
    await this.narrated(this.dur.tapReveal, result);
  }

  private async herd(): Promise<void> {
    if (this.active().length < 3) return this.vote(false);
    for (let round = 1; round <= HERD_ROUNDS; round++) {
      const prompt = this.host.decks.herd.draw();
      const say = round === 1 ? `${this.host.decks.line('herdIntro')} ${prompt}` : prompt;
      this.setPhase({ kind: 'write', prompt, deadline: Date.now() + this.dur.herdWrite, done: [], herd: true }, say);
      await this.wait(this.dur.herdWrite, this.answering());

      const byKey = new Map<string, { answer: string; players: string[] }>();
      for (const [id, value] of this.answers) {
        if (typeof value !== 'string') continue;
        const key = herdKey(value);
        const group = byKey.get(key);
        if (group) group.players.push(id);
        else byKey.set(key, { answer: value, players: [id] });
      }
      const groups = [...byKey.values()].sort((a, b) => b.players.length - a.players.length);
      const top = groups[0]?.players.length ?? 0;
      const gains: Record<string, number> = {};
      for (const group of groups) {
        if (group.players.length < 2) continue;
        for (const id of group.players) gains[id] = group.players.length === top ? HERD_TOP_POINTS : HERD_MATCH_POINTS;
      }
      this.award(gains);
      const result = top >= 2 ? this.host.decks.line('herdMatch', groups[0]!.answer) : this.host.decks.line('herdSplit');
      this.setPhase({ kind: 'herdReveal', prompt, groups, gains }, result);
      await this.narrated(this.dur.herdReveal, result);
    }
  }

  private async duel(): Promise<void> {
    if (this.active().length < 3) return this.vote(false);
    for (let round = 1; round <= DUEL_ROUNDS; round++) {
      // whoever has duelled least goes next, so a second round brings two new faces
      const [a, b] = shuffle(this.active(), this.host.rng).sort(
        (x, y) => (this.dueled.get(x.id) ?? 0) - (this.dueled.get(y.id) ?? 0),
      );
      if (!a || !b) return;
      for (const p of [a, b]) this.dueled.set(p.id, (this.dueled.get(p.id) ?? 0) + 1);
      const pair = [a.id, b.id];
      const challenge = this.host.decks.duel.draw();
      this.setPhase(
        {
          kind: 'vote',
          question: challenge,
          options: pair,
          allowSelf: false,
          scoring: 'received',
          deadline: Date.now() + this.dur.voteAsk,
          answered: [],
          bonus: false,
          duel: true,
        },
        `${this.host.decks.line('duelIntro', joinNames([a.name, b.name]))} ${challenge}`,
      );
      await this.wait(this.dur.voteAsk, {
        who: () => this.active().filter((p) => !pair.includes(p.id)),
        done: (p) => this.answers.has(p.id),
      });

      const votes = this.stringAnswers();
      const tally = pair.map((id) => Object.values(votes).filter((to) => to === id).length);
      const winner = tally[0]! === tally[1]! ? undefined : pair[tally[0]! > tally[1]! ? 0 : 1]!;
      const gains: Record<string, number> = {};
      if (winner) {
        gains[winner] = DUEL_WIN_POINTS;
        for (const [voter, to] of Object.entries(votes)) if (to === winner) gains[voter] = DUEL_BACKER_POINTS;
      }
      this.award(gains);
      const say = winner ? this.host.decks.line('duelWin', this.name(winner)) : this.host.decks.line('duelDraw');
      this.setPhase(
        {
          kind: 'voteReveal',
          question: challenge,
          votes: Object.entries(votes).map(([from, to]) => ({ from, to })),
          leaders: winner ? [winner] : tally[0]! > 0 ? pair : [],
          gains,
          crowd: this.crowdPick(),
        },
        say,
      );
      await this.narrated(this.dur.voteReveal, say);
    }
  }

  private async sync(): Promise<void> {
    const circle = shuffle(this.active(), this.host.rng).map((p) => p.id);
    if (circle.length < 2) return this.vote(false);
    const groups: string[][] = [];
    for (let i = 0; i + 1 < circle.length; i += 2) groups.push([circle[i]!, circle[i + 1]!]);
    if (circle.length % 2 === 1) groups.at(-1)!.push(circle.at(-1)!);
    const members = groups.flat();

    for (let round = 1; round <= SYNC_ROUNDS; round++) {
      const prompt = this.host.decks.sync.draw();
      const intro = round === 1 ? `${this.host.decks.line('syncIntro')} ` : '';
      this.setPhase(
        {
          kind: 'sync',
          question: prompt.q,
          options: [...prompt.options],
          round,
          rounds: SYNC_ROUNDS,
          deadline: Date.now() + this.dur.syncAsk,
          answered: [],
          groups,
        },
        `${intro}${prompt.q}`,
      );
      await this.wait(this.dur.syncAsk, {
        who: () => this.active().filter((p) => members.includes(p.id)),
        done: (p) => this.answers.has(p.id),
      });

      const picks: Record<string, number> = {};
      for (const [id, value] of this.answers) if (typeof value === 'number') picks[id] = value;
      const gains: Record<string, number> = {};
      const matched: string[][] = [];
      for (const group of groups) {
        const hits = group.filter((id) => id in picks && group.some((o) => o !== id && picks[o] === picks[id]));
        for (const id of hits) gains[id] = SYNC_POINTS;
        if (hits.length > 0) matched.push(hits);
      }
      this.award(gains);
      const say =
        matched.length > 0
          ? this.host.decks.line('syncMatch', joinNames(pick(matched, this.host.rng).map((id) => this.name(id))))
          : this.host.decks.line('syncMiss');
      this.setPhase({ kind: 'syncReveal', question: prompt.q, options: [...prompt.options], groups, picks, gains }, say);
      await this.narrated(this.dur.syncReveal, say);
    }
  }

  private async bomb(): Promise<void> {
    if (this.active().length < 3) return this.vote(false);
    let holder = pick(this.active(), this.host.rng).id;
    for (let round = 1; round <= BOMB_ROUNDS; round++) {
      const category = this.host.decks.bombCategory();
      const intro = round === 1 ? `${this.host.decks.line('bombIntro')} ` : '';
      const say = `${intro}${category}! Начинает ${this.name(holder)}.`;
      this.bombFrom = null;
      this.bombPassedAt = Date.now();
      this.setPhase({ kind: 'bomb', category, holder, round, rounds: BOMB_ROUNDS, passes: 0, startedAt: Date.now() }, say);
      const { bombFuseMin: min, bombFuseMax: max } = this.dur;
      await this.wait(min + this.host.rng() * (max - min) + this.speech(say));

      const phase = this.phase;
      if (phase.kind !== 'bomb') return;
      const loser = phase.holder;
      const gains: Record<string, number> = {};
      for (const p of this.active()) if (p.id !== loser) gains[p.id] = BOMB_SURVIVE_POINTS;
      this.award(gains);
      const boom = this.host.decks.line('bombBoom', this.name(loser));
      this.setPhase({ kind: 'bombReveal', category, loser, passes: phase.passes, gains }, boom);
      await this.narrated(this.dur.bombReveal, boom);
      // the one who blew up starts the next round, a small chance at revenge
      if (this.active().length < 2) return;
      holder = this.player(loser)?.connected ? loser : pick(this.active(), this.host.rng).id;
    }
  }

  private bombTargets(holder: string): string[] {
    const others = this.active()
      .map((p) => p.id)
      .filter((id) => id !== holder);
    return others.length > 1 ? others.filter((id) => id !== this.bombFrom) : others;
  }

  private passBomb(to: string): void {
    const phase = this.phase;
    if (phase.kind !== 'bomb') return;
    this.bombFrom = phase.holder;
    this.bombPassedAt = Date.now();
    phase.holder = to;
    phase.passes++;
    // the holder changes inside one phase, so bots get told the same way a new phase tells them
    for (const listener of this.listeners) listener.phase(this);
    this.host.changed();
  }

  private async closest(): Promise<void> {
    for (let round = 1; round <= CLOSEST_ROUNDS; round++) {
      const q = this.host.decks.closest.draw();
      const intro = round === 1 ? `${this.host.decks.line('closestIntro')} ` : '';
      this.setPhase(
        {
          kind: 'closest',
          question: q.q,
          unit: q.unit,
          round,
          rounds: CLOSEST_ROUNDS,
          deadline: Date.now() + this.dur.closestAsk,
          answered: [],
        },
        `${intro}${q.q}`,
      );
      await this.wait(this.dur.closestAsk, this.answering());

      const guesses = [...this.answers]
        .filter((e): e is [string, number] => typeof e[1] === 'number')
        .map(([player, value]) => ({ player, value }))
        .sort((a, b) => Math.abs(a.value - q.answer) - Math.abs(b.value - q.answer));
      const gains: Record<string, number> = {};
      let place = 0;
      guesses.forEach((g, i) => {
        const off = Math.abs(g.value - q.answer);
        if (i > 0 && off > Math.abs(guesses[i - 1]!.value - q.answer)) place = i;
        // the least wrong of three wild guesses is still wild: «5» for 206 bones earns nothing
        const fair = off <= Math.max(CLOSEST_MIN_SLACK, q.answer * CLOSEST_SLACK);
        const points = fair ? (CLOSEST_POINTS[place] ?? 0) + (off === 0 ? CLOSEST_EXACT_BONUS : 0) : 0;
        if (points > 0) gains[g.player] = points;
      });
      this.award(gains);
      const exact = guesses.find((g) => g.value === q.answer);
      const truth = `Правильный ответ — ${withUnit(q.answer, q.unit)}.`;
      const verdict = exact
        ? this.host.decks.line('closestExact', this.name(exact.player))
        : guesses[0]
          ? this.host.decks.line('closestWin', this.name(guesses[0].player))
          : 'Никто не рискнул назвать число!';
      const say = `${truth} ${verdict}`;
      this.setPhase(
        { kind: 'closestReveal', question: q.q, unit: q.unit, answer: q.answer, guesses, gains },
        say,
      );
      await this.narrated(this.dur.closestReveal, say);
    }
  }

  private async quip(): Promise<void> {
    const people = shuffle(this.active(), this.host.rng);
    if (people.length < 3) return this.vote(false);
    // pairs, a trio for an odd count; with three people one sits out the writing so somebody can vote
    const groups: Player[][] = [];
    for (let i = 0; i + 1 < people.length; i += 2) groups.push([people[i]!, people[i + 1]!]);
    if (people.length % 2 === 1 && people.length >= 5) groups.at(-1)!.push(people.at(-1)!);
    const matches = groups.slice(0, QUIP_MATCHES).map((group) => ({ group, prompt: this.host.decks.quipPrompt() }));
    const writers = matches.flatMap((m) => m.group);
    this.quipPrompts = new Map(matches.flatMap((m) => m.group.map((p) => [p.id, m.prompt] as const)));
    this.setPhase(
      { kind: 'write', prompt: '', deadline: Date.now() + this.dur.quipWrite, done: [], quip: true },
      this.host.decks.line('quipIntro'),
    );
    await this.wait(this.dur.quipWrite, {
      who: () => writers.filter((p) => p.connected),
      done: (p) => this.answers.has(p.id),
    });
    const written = new Map(this.answers);
    this.quipPrompts = new Map();

    for (const [index, { group, prompt }] of matches.entries()) {
      const entries = shuffle(
        group.flatMap((p) => {
          const text = written.get(p.id);
          return typeof text === 'string' ? [{ id: newId(), text, author: p.id }] : [];
        }),
        this.host.rng,
      );
      if (entries.length < 2) continue;
      this.quipAuthors = new Map(entries.map((e) => [e.id, e.author]));
      const authors = entries.map((e) => e.author);
      const say = `${this.host.decks.line('quipVs')} ${prompt}`;
      this.setPhase(
        {
          kind: 'quipVote',
          prompt,
          answers: entries.map(({ id, text }) => ({ id, text })),
          match: index + 1,
          matches: matches.length,
          deadline: Date.now() + this.dur.quipVote + this.speech(say),
          voted: [],
        },
        say,
      );
      await this.wait(this.dur.quipVote + this.speech(say), {
        who: () => this.active().filter((p) => !authors.includes(p.id)),
        done: (p) => this.answers.has(p.id),
      });

      const votes = this.stringAnswers();
      const tallied = entries.map((e) => ({ ...e, votes: Object.keys(votes).filter((v) => votes[v] === e.id) }));
      const gains: Record<string, number> = {};
      for (const e of tallied) if (e.votes.length > 0) gains[e.author] = e.votes.length * QUIP_VOTE_POINTS;
      const total = Object.keys(votes).length;
      const top = Math.max(...tallied.map((e) => e.votes.length));
      const leaders = tallied.filter((e) => e.votes.length === top);
      let line: string;
      if (top === 0 || leaders.length > 1) line = this.host.decks.line('quipTie');
      else if (total >= 2 && top === total) {
        gains[leaders[0]!.author] = (gains[leaders[0]!.author] ?? 0) + QUIP_SWEEP_BONUS;
        line = this.host.decks.line('quipSweep', this.name(leaders[0]!.author));
      } else line = this.host.decks.line('quipWin', this.name(leaders[0]!.author));
      this.award(gains);
      this.quipAuthors = new Map();
      this.setPhase({ kind: 'quipReveal', prompt, answers: tallied, gains }, line);
      await this.narrated(this.dur.quipReveal, line);
    }
  }

  private async truth(): Promise<void> {
    for (let round = 1; round <= TRUTH_ROUNDS; round++) {
      const fact = this.host.decks.truth.draw();
      const intro = round === 1 ? `${this.host.decks.line('truthIntro')} ` : '';
      this.setPhase(
        {
          kind: 'truth',
          statement: fact.s,
          round,
          rounds: TRUTH_ROUNDS,
          deadline: Date.now() + this.dur.truthAsk,
          answered: [],
        },
        `${intro}${fact.s}`,
      );
      await this.wait(this.dur.truthAsk, this.answering());

      const believers: string[] = [];
      const doubters: string[] = [];
      for (const [id, value] of this.answers) (value === 1 ? believers : doubters).push(id);
      const gains: Record<string, number> = {};
      for (const id of fact.truth ? believers : doubters) gains[id] = TRUTH_POINTS;
      this.award(gains);
      const say = `${this.host.decks.line(fact.truth ? 'truthTrue' : 'truthFalse')} ${fact.note}`;
      this.setPhase(
        { kind: 'truthReveal', statement: fact.s, truth: fact.truth, note: fact.note, believers, doubters, gains },
        say,
      );
      await this.narrated(this.dur.truthReveal, say);
    }
  }

  /** «Свидание вслепую»: nights of capped chatting in secret quirks, each closed by asking someone out. */
  private async dateGame(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    const deck = shuffle(dateQuirks, this.host.rng);
    const quirks = new Map(players.map((p, i) => [p.id, deck[i % deck.length]!]));
    const chat = new Chat(
      players.map((p) => p.id),
      { limit: DATE_MESSAGES },
    );
    this.date = { chat, quirks };
    const kept = new Map<string, number>();
    const totals: Record<string, number> = {};

    for (let night = 1; night <= DATE_NIGHTS; night++) {
      chat.nextRound();
      const before = new Map(players.map((p) => [p.id, chat.by(p.id).length]));
      const say = night === 1 ? this.host.decks.line('dateIntro') : `Вечер ${DATE_NIGHT_NAMES[night - 1]}! Продолжаем знакомиться.`;
      const ms = this.dur.dateChat + this.speech(say);
      this.setPhase({ kind: 'date', night, nights: DATE_NIGHTS, deadline: Date.now() + ms, flights: chat.flights, sent: 0 }, say);
      await this.wait(ms);
      for (const p of players) {
        const tonight = chat.by(p.id).slice(before.get(p.id));
        if (tonight.length > 0 && tonight.every((m) => quirks.get(p.id)!.keeps(m.text))) kept.set(p.id, (kept.get(p.id) ?? 0) + 1);
      }

      const ask = night === 1 ? this.host.decks.line('datePick') : 'С кем на свидание сегодня?';
      const pickMs = this.dur.datePick + this.speech(ask);
      this.setPhase({ kind: 'datePick', night, nights: DATE_NIGHTS, deadline: Date.now() + pickMs, voted: [] }, ask);
      await this.wait(pickMs, { who: () => this.active().filter((p) => quirks.has(p.id)), done: (p) => this.answers.has(p.id) });

      const picks = this.stringAnswers();
      const gains: Record<string, number> = {};
      const matches: [string, string][] = [];
      for (const [from, to] of Object.entries(picks)) {
        gains[to] = (gains[to] ?? 0) + DATE_ASKED_POINTS;
        if (picks[to] === from && from < to) matches.push([from, to]);
      }
      for (const pair of matches) for (const id of pair) gains[id] = (gains[id] ?? 0) + DATE_MATCH_POINTS;
      const last = night === DATE_NIGHTS;
      if (last) for (const [id, n] of kept) gains[id] = (gains[id] ?? 0) + n * DATE_QUIRK_POINTS;
      this.award(gains);
      for (const [id, n] of Object.entries(gains)) totals[id] = (totals[id] ?? 0) + n;

      const pair = matches[0];
      const line = pair
        ? this.host.decks.line('dateMatch', joinNames(pair.map((id) => this.name(id))))
        : this.host.decks.line('dateLonely');
      this.setPhase(
        {
          kind: 'dateMatch',
          night,
          nights: DATE_NIGHTS,
          picks,
          matches,
          gains: last ? totals : gains,
          quirks: last ? Object.fromEntries(players.map((p) => [p.id, { text: quirks.get(p.id)!.text, kept: kept.get(p.id) ?? 0 }])) : undefined,
        },
        line,
      );
      await this.wait((last ? this.dur.dateMatch * 2 : this.dur.dateMatch) + this.speech(line));
    }
    this.date = null;
  }

  /** The conversations a player has had in «Свидание вслепую», which outlast the chat phase into the picking. */
  personalChats(playerId: string): ChatThread[] {
    return this.date?.chat.view(playerId) ?? [];
  }

  /** A bot's quirk in «Свидание вслепую», so its lines keep to it; null outside the game. */
  dateQuirk(playerId: string): DateQuirk | null {
    return this.date?.quirks.get(playerId) ?? null;
  }

  /** «Заговор»: plotters steer the target into writing a secret word, then the rest name the plotters. */
  private async plotGame(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    // a bot target replies from a script, so the trap is more fun when a person has to dodge it
    const humans = players.filter((p) => !p.bot);
    const target = pick(humans.length > 0 ? humans : players, this.host.rng);
    const others = shuffle(
      players.filter((p) => p !== target),
      this.host.rng,
    );
    // about half the room plots; the rest are bystanders, so naming the plotters is never a gimme
    const plotters = others.slice(0, Math.max(1, Math.floor(others.length / 2))).map((p) => p.id);
    const word = pick(plotWords, this.host.rng);
    const chat = new Chat(
      players.map((p) => p.id),
      { groups: [{ id: 'group:plot', title: 'Сговор 🤫', members: plotters }] },
    );
    this.plot = { chat, target: target.id, word, plotters, slip: null };

    const intro = this.host.decks.line('plotIntro');
    const ms = this.dur.plotChat + this.speech(intro);
    this.setPhase({ kind: 'plot', target: target.id, deadline: Date.now() + ms, flights: chat.flights, sent: 0, caught: false }, intro);
    await this.wait(ms, { who: () => [], done: () => true, abandoned: () => this.plot?.slip != null });
    if (this.plot.slip !== null) await this.wait(this.dur.plotCaught);

    const voters = players.filter((p) => !plotters.includes(p.id)).map((p) => p.id);
    const ask = this.host.decks.line('plotGuess');
    const guessMs = this.dur.plotGuess + this.speech(ask);
    this.setPhase({ kind: 'plotGuess', target: target.id, deadline: Date.now() + guessMs, plotters: plotters.length, voters, voted: [] }, ask);
    await this.wait(guessMs, {
      who: () => this.active().filter((p) => voters.includes(p.id)),
      done: (p) => this.answers.has(p.id),
    });

    const guesses: Record<string, string[]> = {};
    const gains: Record<string, number> = {};
    for (const id of voters) {
      const picked = this.answers.get(id);
      if (!Array.isArray(picked)) continue;
      guesses[id] = picked as string[];
      const right = guesses[id].filter((g) => plotters.includes(g)).length;
      if (right > 0) gains[id] = right * PLOT_SPOT_POINTS;
    }
    const slip = this.plot.slip;
    if (slip !== null) for (const id of plotters) gains[id] = (gains[id] ?? 0) + PLOT_TRAP_POINTS;
    else gains[target.id] = (gains[target.id] ?? 0) + PLOT_HOLD_POINTS;
    this.award(gains);
    this.plot = null;
    const line = `${this.host.decks.line(slip !== null ? 'plotCaught' : 'plotHeld', target.name)} Тайное слово — «${word.word}».`;
    this.setPhase({ kind: 'plotReveal', target: target.id, word: word.word, plotters, slip, guesses, gains }, line);
    await this.narrated(this.dur.plotReveal, line);
  }

  /** «Без стёрки»: everyone answers an urgent message live on the TV, with no way to take a letter back. */
  private async rushGame(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    const ids = players.map((p) => p.id);
    const messages = shuffle(rushMessages, this.host.rng).slice(0, RUSH_ROUNDS);
    for (const [i, { from, text: message }] of messages.entries()) {
      const say = `${i === 0 ? `${this.host.decks.line('rushIntro')} ` : ''}${from} пишет: ${message}`;
      const ms = this.dur.rushType + this.speech(say);
      const phase: Phase = { kind: 'rush', from, message, round: i + 1, rounds: messages.length, deadline: Date.now() + ms, texts: {}, done: [] };
      this.setPhase(phase, say);
      await this.wait(ms, { who: () => this.active().filter((p) => ids.includes(p.id)), done: (p) => phase.done.includes(p.id) });

      const replies = shuffle(
        Object.entries(phase.texts)
          .map(([player, text]) => ({ player, text: text.trim() }))
          .filter((r) => r.text),
        this.host.rng,
      );
      if (replies.length < 2) continue;
      const ask = this.host.decks.line('rushVote');
      const voteMs = this.dur.rushVote + this.speech(ask);
      this.setPhase({ kind: 'rushVote', from, message, replies, deadline: Date.now() + voteMs, voted: [] }, ask);
      await this.wait(voteMs, { who: () => this.active().filter((p) => ids.includes(p.id)), done: (p) => this.answers.has(p.id) });

      const votes = this.stringAnswers();
      const tallied = replies.map((r) => ({ ...r, votes: Object.keys(votes).filter((v) => votes[v] === r.player) }));
      const gains: Record<string, number> = {};
      for (const r of tallied) if (r.votes.length > 0) gains[r.player] = r.votes.length * RUSH_VOTE_POINTS;
      this.award(gains);
      const top = Math.max(...tallied.map((r) => r.votes.length));
      const leaders = tallied.filter((r) => r.votes.length === top);
      const line = top > 0 && leaders.length === 1 ? this.host.decks.line('rushWin', this.name(leaders[0]!.player)) : this.host.decks.line('rushTie');
      this.setPhase({ kind: 'rushReveal', from, message, replies: tallied, gains, crowd: this.crowdPick() }, line);
      await this.narrated(this.dur.rushReveal, line);
    }
  }

  /** «Вставь слово»: everyone fills the gap in a sentence about one player, then votes for the funniest. */
  private async blankGame(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    const heroes = shuffle(players, this.host.rng);
    for (let round = 0; round < BLANK_ROUNDS; round++) {
      const hero = heroes[round % heroes.length]!;
      const prompt = this.host.decks.blankPrompt();
      const message = fill(prompt.q, hero.name).replace('___', '…');
      const lead = prompt.setup ? fill(prompt.setup, hero.name) : round === 0 ? this.host.decks.line('blankIntro') : '';
      const say = `${lead ? `${lead} ` : ''}${message}`;
      const ms = this.dur.blankWrite + this.speech(say);
      this.setPhase({ kind: 'write', prompt: message, deadline: Date.now() + ms, done: [], blank: true }, say);
      await this.wait(ms, this.answering());

      const replies = shuffle(
        [...this.answers].flatMap(([player, text]) => (typeof text === 'string' ? [{ player, text }] : [])),
        this.host.rng,
      );
      if (replies.length < 2) continue;
      const from = GAME_INFO.blank.title;
      const ask = this.host.decks.line('blankVote');
      const voteMs = this.dur.rushVote + this.speech(ask);
      this.setPhase({ kind: 'rushVote', from, message, replies, deadline: Date.now() + voteMs, voted: [] }, ask);
      await this.wait(voteMs, this.answering());

      const votes = this.stringAnswers();
      const tallied = replies.map((r) => ({ ...r, votes: Object.keys(votes).filter((v) => votes[v] === r.player) }));
      const gains: Record<string, number> = {};
      for (const r of tallied) if (r.votes.length > 0) gains[r.player] = r.votes.length * BLANK_VOTE_POINTS;
      this.award(gains);
      const top = Math.max(...tallied.map((r) => r.votes.length));
      const leaders = tallied.filter((r) => r.votes.length === top);
      const verdict = top > 0 && leaders.length === 1 ? this.host.decks.line('blankWin', this.name(leaders[0]!.player)) : this.host.decks.line('rushTie');
      const line = prompt.after ? `${verdict} ${fill(prompt.after, hero.name)}` : verdict;
      this.setPhase({ kind: 'rushReveal', from, message, replies: tallied, gains, crowd: this.crowdPick() }, line);
      await this.narrated(this.dur.rushReveal, line);
    }
  }

  /** «Чужак в стае»: one player answers a different question; the room votes on whose answer is odd. */
  private async oddGame(): Promise<void> {
    const players = this.active();
    if (players.length < (GAME_INFO.odd.players ?? 0)) return this.vote(false);
    for (let round = 0; round < ODD_ROUNDS; round++) {
      const pair = this.host.decks.odd.draw();
      // people before bots: a bot has no poker face worth testing
      const people = this.active().filter((p) => !p.bot);
      const player = pick(people.length > 0 ? people : this.active(), this.host.rng).id;
      this.oddRound = { pair, player };
      const say = round === 0 ? this.host.decks.line('oddIntro') : undefined;
      const ms = this.dur.herdWrite + (say ? this.speech(say) : 0);
      this.setPhase({ kind: 'write', prompt: '', deadline: Date.now() + ms, done: [], odd: true }, say);
      await this.wait(ms, this.answering());

      const replies = shuffle(
        [...this.answers].flatMap(([id, text]) => (typeof text === 'string' ? [{ player: id, text }] : [])),
        this.host.rng,
      );
      const from = GAME_INFO.odd.title;
      if (replies.length < 3 || !replies.some((r) => r.player === player)) {
        this.oddRound = null;
        continue;
      }
      const ask = this.host.decks.line('oddVote');
      const voteMs = this.dur.oddVote + this.speech(ask);
      this.setPhase({ kind: 'rushVote', from, message: pair.q, replies, deadline: Date.now() + voteMs, voted: [], ask: 'Чей ответ чужой?' }, ask);
      await this.wait(voteMs, this.answering());

      const votes = this.stringAnswers();
      const tallied = replies.map((r) => ({ ...r, votes: Object.keys(votes).filter((v) => votes[v] === r.player) }));
      const gains: Record<string, number> = {};
      const fooled = Object.entries(votes).filter(([voter, pickId]) => voter !== player && pickId !== player).length;
      for (const [voter, pickId] of Object.entries(votes)) if (pickId === player) gains[voter] = ODD_FOUND_POINTS;
      if (fooled > 0) gains[player] = fooled * ODD_FOOL_POINTS;
      this.award(gains);
      const caught = Object.values(votes).filter((v) => v === player).length * 2 > Object.keys(votes).length;
      const line = `${this.host.decks.line(caught ? 'oddCaught' : 'oddEscaped', this.name(player))} Другой вопрос был такой: ${pair.odd}.`;
      this.setPhase({ kind: 'rushReveal', from, message: pair.q, replies: tallied, gains, crowd: this.crowdPick(), odd: { player, question: pair.odd } }, line);
      this.oddRound = null;
      await this.narrated(this.dur.oddReveal, line);
    }
  }

  /** «Поровну»: two answers to pick from; the smaller side scores, an exact half pays everyone. */
  private async evenGame(): Promise<void> {
    if (this.active().length < (GAME_INFO.even.players ?? 0)) return this.vote(false);
    for (let round = 1; round <= EVEN_ROUNDS; round++) {
      const q = this.host.decks.even.draw();
      const intro = round === 1 ? `${this.host.decks.line('evenIntro')} ` : '';
      const say = `${intro}${q.q}`;
      const ms = this.dur.evenAsk + this.speech(say);
      this.setPhase({ kind: 'even', question: q.q, options: q.options, round, rounds: EVEN_ROUNDS, deadline: Date.now() + ms, answered: [] }, say);
      await this.wait(ms, this.answering());

      const sides: [string[], string[]] = [[], []];
      for (const [id, value] of this.answers) if (value === 0 || value === 1) sides[value].push(id);
      const gains: Record<string, number> = {};
      const [a, b] = sides;
      let key: LineKey;
      if (a.length === b.length && a.length > 0) {
        for (const id of [...a, ...b]) gains[id] = EVEN_HALF_POINTS;
        key = 'evenHalf';
      } else if (a.length === 0 || b.length === 0) {
        key = 'evenSame';
      } else {
        for (const id of a.length < b.length ? a : b) gains[id] = EVEN_MINORITY_POINTS;
        key = 'evenMinority';
      }
      this.award(gains);
      const line = this.host.decks.line(key);
      this.setPhase({ kind: 'evenReveal', question: q.q, options: q.options, sides, gains }, line);
      await this.narrated(this.dur.evenReveal, line);
    }
  }

  /** «Сколько процентов?»: secret yes-or-no, the hero guesses the share of yeses, the rest bet higher or lower. */
  private async percentGame(): Promise<void> {
    if (this.active().length < (GAME_INFO.percent.players ?? 0)) return this.vote(false);
    const heroes = shuffle(this.active(), this.host.rng).sort((a, b) => Number(a.bot) - Number(b.bot));
    for (let round = 1; round <= PERCENT_ROUNDS; round++) {
      const hero = heroes[(round - 1) % heroes.length]!;
      const question = this.host.decks.percent.draw();
      const intro = round === 1 ? `${this.host.decks.line('percentIntro')} ` : '';
      const say = `${intro}${question}`;
      const askMs = this.dur.percentAsk + this.speech(say);
      this.setPhase({ kind: 'percent', question, hero: hero.id, round, rounds: PERCENT_ROUNDS, deadline: Date.now() + askMs, answered: [] }, say);
      await this.wait(askMs, this.answering());
      const yes = [...this.answers.values()].filter((v) => v === 1).length;
      const total = [...this.answers.values()].filter((v) => v === 0 || v === 1).length;
      if (total === 0) continue;
      const share = Math.round((yes / total) * 100);

      const guessSay = this.host.decks.line('percentGuess', hero.name);
      const guessMs = this.dur.percentGuess + this.speech(guessSay);
      this.setPhase({ kind: 'percentGuess', question, hero: hero.id, deadline: Date.now() + guessMs }, guessSay);
      await this.wait(guessMs, { who: () => (hero.connected ? [hero] : []), done: (p) => this.answers.has(p.id) });
      const picked = this.answers.get(hero.id);
      const guess = typeof picked === 'number' ? picked : 50;

      const betSay = this.host.decks.line('percentBet', hero.name);
      const betMs = this.dur.percentBet + this.speech(betSay);
      this.setPhase({ kind: 'percentBet', question, hero: hero.id, guess, deadline: Date.now() + betMs, answered: [] }, betSay);
      await this.wait(betMs, { who: () => this.active().filter((p) => p.id !== hero.id), done: (p) => this.answers.has(p.id) });

      const higher: string[] = [];
      const lower: string[] = [];
      for (const [id, v] of this.answers) if (id !== hero.id) (v === 1 ? higher : v === 0 ? lower : []).push(id);
      const gains: Record<string, number> = {};
      if (share > guess) for (const id of higher) gains[id] = PERCENT_BET_POINTS;
      if (share < guess) for (const id of lower) gains[id] = PERCENT_BET_POINTS;
      const off = Math.abs(share - guess);
      const heroPoints = PERCENT_HERO_POINTS[Math.ceil(off / 10)];
      if (heroPoints) gains[hero.id] = heroPoints;
      this.award(gains);
      const line = `${this.host.decks.line(off <= 10 ? 'percentClose' : 'percentFar', hero.name)} На самом деле ${withUnit(share, 'процентов')}.`;
      this.setPhase({ kind: 'percentReveal', question, hero: hero.id, guess, share, higher, lower, gains }, line);
      await this.narrated(this.dur.percentReveal, line);
    }
  }

  /** «Словарь выдумок»: fake definitions for a rare word, mixed with the real one, then a vote for the real one. */
  private async fibGame(): Promise<void> {
    if (this.active().length < (GAME_INFO.fib.players ?? 0)) return this.vote(false);
    for (let round = 1; round <= FIB_ROUNDS; round++) {
      const { word, def } = this.host.decks.fib.draw();
      const say = round === 1 ? `${this.host.decks.line('fibIntro')} ${word}.` : `${word}.`;
      const ms = this.dur.fibWrite + this.speech(say);
      this.setPhase({ kind: 'write', prompt: word, deadline: Date.now() + ms, done: [], fib: word }, say);
      await this.wait(ms, this.answering());

      const fakes = [...this.answers].flatMap(([author, text]) => (typeof text === 'string' ? [{ id: newId(), text, author }] : []));
      if (fakes.length < 2) continue;
      const all = shuffle([{ id: 'truth', text: def, author: undefined as string | undefined }, ...fakes], this.host.rng);
      this.fibAuthors = new Map(fakes.map((f) => [f.id, f.author]));
      const ask = this.host.decks.line('fibVote');
      const voteMs = this.dur.fibVote + this.speech(ask);
      this.setPhase({ kind: 'fibVote', word, options: all.map(({ id, text }) => ({ id, text })), deadline: Date.now() + voteMs, voted: [] }, ask);
      await this.wait(voteMs, this.answering());

      const votes = this.stringAnswers();
      const gains: Record<string, number> = {};
      for (const [voter, id] of Object.entries(votes)) {
        if (id === 'truth') gains[voter] = (gains[voter] ?? 0) + FIB_FOUND_POINTS;
        const author = this.fibAuthors.get(id);
        if (author && author !== voter) gains[author] = (gains[author] ?? 0) + FIB_FOOL_POINTS;
      }
      this.award(gains);
      const options = all.map((o) => ({ ...o, votes: Object.keys(votes).filter((v) => votes[v] === o.id) }));
      const best = options.filter((o) => o.author && o.votes.length > 0).sort((a, b) => b.votes.length - a.votes.length)[0];
      const verdict = best?.author ? this.host.decks.line('fibFooled', this.name(best.author)) : this.host.decks.line('fibHonest');
      const line = `${verdict} ${word} — это ${def.charAt(0).toLowerCase()}${def.slice(1)}.`;
      this.fibAuthors = new Map();
      this.setPhase({ kind: 'fibReveal', word, options, truth: 'truth', gains }, line);
      await this.narrated(this.dur.fibReveal, line);
    }
  }

  /** «Бублик говорит»: quick colour commands; obey only those with the magic words, a slip puts you out. */
  private async simonGame(): Promise<void> {
    const rng = this.host.rng;
    let alive = this.active().map((p) => p.id);
    const out: string[] = [];
    const intro = this.host.decks.line('simonIntro');
    for (let step = 1; step <= SIMON_STEPS && alive.length > 0; step++) {
      // the first command always has the magic words, so nobody is out before they get the idea
      const magic = step === 1 || rng() >= SIMON_TRAP_SHARE;
      const color = Math.floor(rng() * SIMON_COLORS.length);
      const command = simonCommand(magic, color);
      const say = step === 1 ? `${intro} ${command}` : command;
      const ms = this.dur.simonStep + this.speech(say);
      this.setPhase({ kind: 'simon', command, magic, color, step, steps: SIMON_STEPS, deadline: Date.now() + ms, alive: [...alive], out: [...out] }, say);
      // a trap waits the whole step, since doing nothing is the right answer
      await this.wait(ms, magic ? { who: () => this.active().filter((p) => alive.includes(p.id)), done: (p) => this.answers.has(p.id) } : undefined);
      const failed = alive.filter((id) => {
        const pressed = this.answers.get(id);
        return magic ? pressed !== color : pressed !== undefined;
      });
      alive = alive.filter((id) => !failed.includes(id));
      out.push(...failed);
    }
    const gains = Object.fromEntries(alive.map((id) => [id, SIMON_SURVIVOR_POINTS]));
    this.award(gains);
    const line = alive.length > 0 ? this.host.decks.line('simonWin', joinNames(alive.map((id) => this.name(id)))) : this.host.decks.line('simonNone');
    this.setPhase({ kind: 'simonReveal', alive, out, gains }, line);
    await this.narrated(this.dur.simonReveal, line);
  }

  /** «Подбери реплику»: a hand of phrases per phone, the best fit for the situation wins the vote. */
  private async replyGame(): Promise<void> {
    if (this.active().length < (GAME_INFO.reply.players ?? 0)) return this.vote(false);
    const title = GAME_INFO.reply.title;
    for (let round = 1; round <= REPLY_ROUNDS; round++) {
      const situation = this.host.decks.reply.draw();
      this.replyHands = new Map(
        this.active().map((p) => {
          const hand = new Set<string>();
          // the deck reshuffles when it runs dry, so a short pass can repeat a card; skip those
          for (let tries = 0; hand.size < REPLY_HAND && tries < REPLY_HAND * 3; tries++) hand.add(this.host.decks.replyCards.draw());
          return [p.id, [...hand]];
        }),
      );
      const say = round === 1 ? `${this.host.decks.line('replyIntro')} ${situation}` : situation;
      const ms = this.dur.replyPick + this.speech(say);
      this.setPhase({ kind: 'replyPick', situation, round, rounds: REPLY_ROUNDS, deadline: Date.now() + ms, done: [] }, say);
      await this.wait(ms, this.answeringDealt(this.replyHands));

      const picks = [...this.answers].flatMap(([author, i]) => {
        const text = typeof i === 'number' ? this.replyHands.get(author)?.[i] : undefined;
        return text ? [{ id: newId(), text, author }] : [];
      });
      this.replyHands = new Map();
      if (picks.length < 2) continue;
      const options = shuffle(picks, this.host.rng);
      this.fibAuthors = new Map(options.map((o) => [o.id, o.author]));
      const ask = this.host.decks.line('replyVote');
      const voteMs = this.dur.fibVote + this.speech(ask);
      this.setPhase(
        { kind: 'fibVote', word: situation, options: options.map(({ id, text }) => ({ id, text })), deadline: Date.now() + voteMs, voted: [], title, ask: 'Какая реплика смешнее?' },
        ask,
      );
      await this.wait(voteMs, this.answering());

      const votes = this.stringAnswers();
      const gains: Record<string, number> = {};
      for (const id of Object.values(votes)) {
        const author = this.fibAuthors.get(id);
        if (author) gains[author] = (gains[author] ?? 0) + REPLY_VOTE_POINTS;
      }
      this.award(gains);
      const tallied = options.map((o) => ({ ...o, votes: Object.keys(votes).filter((v) => votes[v] === o.id) }));
      const top = Math.max(...tallied.map((o) => o.votes.length));
      const leaders = tallied.filter((o) => o.votes.length === top);
      const line = top > 0 && leaders.length === 1 ? this.host.decks.line('replyWin', this.name(leaders[0]!.author)) : this.host.decks.line('rushTie');
      this.fibAuthors = new Map();
      this.setPhase({ kind: 'fibReveal', word: situation, options: tallied, truth: '', gains, title }, line);
      await this.narrated(this.dur.fibReveal, line);
    }
  }

  /**
   * «Что у меня на лбу?»: everyone but the guesser sees the word and writes a hint; the guesser reads them and answers.
   * «Ровно один» plays the same, but hints that match each other burn before the guesser sees them.
   */
  private async foreheadGame(just = false): Promise<void> {
    if (this.active().length < (GAME_INFO[just ? 'just' : 'forehead'].players ?? 0)) return this.vote(false);
    const guessers = shuffle(this.active(), this.host.rng).sort((a, b) => Number(a.bot) - Number(b.bot));
    for (let round = 0; round < FOREHEAD_ROUNDS; round++) {
      const guesser = guessers[round % guessers.length]!;
      const word = this.host.decks.forehead.draw();
      this.foreheadWord = word;
      const say = this.host.decks.line(just ? 'justIntro' : 'foreheadIntro', guesser.name);
      const ms = this.dur.foreheadWrite + this.speech(say);
      this.setPhase({ kind: 'write', prompt: '', deadline: Date.now() + ms, done: [], forehead: guesser.id, just: just || undefined }, say);
      await this.wait(ms, { who: () => this.active().filter((p) => p.id !== guesser.id), done: (p) => this.answers.has(p.id) });
      const written = shuffle(
        [...this.answers].flatMap(([player, text]) => (typeof text === 'string' && player !== guesser.id ? [{ player, text }] : [])),
        this.host.rng,
      );
      const burnt = (h: { text: string }) => just && written.some((o) => o !== h && normalize(o.text) === normalize(h.text));
      const hints: ForeheadHint[] = written.map((h) => (burnt(h) ? { ...h, cancelled: true } : h));
      const burns = hints.some((h) => h.cancelled);

      const ask = `${burns ? `${this.host.decks.line('justBurnt')} ` : ''}${this.host.decks.line('foreheadGuess', guesser.name)}`;
      const guessMs = this.dur.foreheadGuess + this.speech(ask);
      const shown = hints.map((h) => (h.cancelled ? { ...h, text: '' } : h));
      this.setPhase({ kind: 'foreheadGuess', guesser: guesser.id, hints: shown, deadline: Date.now() + guessMs, just: just || undefined }, ask);
      await this.wait(guessMs, { who: () => [guesser], done: (p) => this.answers.has(p.id), abandoned: () => !guesser.connected });
      const typed = this.answers.get(guesser.id);
      const guess = typeof typed === 'string' ? typed : '';
      const right = guess !== '' && judge(guess, word) === 'right';
      const gains: Record<string, number> = {};
      if (right) {
        gains[guesser.id] = FOREHEAD_GUESSER_POINTS;
        for (const h of hints) if (!h.cancelled) gains[h.player] = FOREHEAD_HINT_POINTS;
      }
      this.award(gains);
      this.foreheadWord = null;
      const line = `${this.host.decks.line(right ? 'foreheadRight' : 'foreheadWrong', guesser.name)} Загаданное слово — «${word}».`;
      this.setPhase({ kind: 'foreheadReveal', guesser: guesser.id, word, guess, right, hints, gains, just: just || undefined }, line);
      await this.narrated(this.dur.foreheadReveal, line);
    }
  }

  /** «Контакт»: the leader's word opens letter by letter as the others make contact on words with its prefix. */
  private async contact(): Promise<void> {
    const players = this.active();
    if (players.length < (GAME_INFO.contact.players ?? 0)) return this.vote(false);
    const rng = this.host.rng;
    // a bot cannot block a contact by ear, so a person leads whenever there is one
    const people = players.filter((p) => !p.bot);
    const leader = pick(people.length > 0 ? people : players, rng);
    let word = this.host.decks.guessWord();
    for (let tries = 0; !CONTACT_WORD.test(word) && tries < 50; tries++) word = this.host.decks.guessWord();
    this.contactWord = word;
    this.contactLeader = leader.id;
    let open = 1;
    // paid step by step so each reveal shows the total after the round's twist
    const gains: Record<string, number> = {};
    const pay = (earned: Record<string, number>) => {
      this.award(earned);
      for (const [id, n] of Object.entries(earned)) gains[id] = (gains[id] ?? 0) + n;
    };
    let solved = false;
    for (let step = 1; step <= CONTACT_STEPS && !solved && open < word.length; step++) {
      const prefix = word.slice(0, open).toUpperCase();
      this.contactPrefix = prefix;
      const say = step === 1 ? this.host.decks.line('contactIntro', leader.name) : undefined;
      const writeMs = this.dur.contactWrite + this.speech(say);
      this.setPhase({ kind: 'contactWrite', leader: leader.id, prefix, step, steps: CONTACT_STEPS, deadline: Date.now() + writeMs, done: [] }, say);
      await this.wait(writeMs, { who: () => this.active().filter((p) => p.id !== leader.id), done: (p) => this.answers.has(p.id) });
      const written = [...this.answers].flatMap(([author, v]) => (Array.isArray(v) ? [{ id: newId(), author, word: v[0]!, text: v[1]! }] : []));
      if (written.length === 0) continue;
      this.contactHints = new Map(written.map((h) => [h.id, h]));

      const ask = this.host.decks.line('contactGuess');
      const guessMs = this.dur.contactGuess + this.speech(ask);
      const hints = shuffle(written, rng).map((h) => ({ id: h.id, text: h.text }));
      this.setPhase({ kind: 'contactGuess', leader: leader.id, prefix, hints, deadline: Date.now() + guessMs, done: [] }, ask);
      await this.wait(guessMs, this.answering());

      const named = new Map(
        [...this.answers].map(([id, v]) => [
          id,
          (Array.isArray(v) ? v : [v]).filter((e): e is string => typeof e === 'string').map((e) => ({ hint: e.slice(0, e.indexOf(':')), word: e.slice(e.indexOf(':') + 1) })),
        ]),
      );
      const said = (id: string, hint: string) => (named.get(id) ?? []).filter((e) => e.hint === hint).map((e) => e.word);
      const results: ContactHint[] = written.map((h) => {
        const contacts = players.filter((p) => p.id !== h.author && p.id !== leader.id && said(p.id, h.id).some((w) => judge(w, h.word) === 'right')).map((p) => p.id);
        const blocked = said(leader.id, h.id).some((w) => judge(w, h.word) === 'right');
        return { id: h.id, text: h.text, author: h.author, word: h.word, contacts, blocked };
      });
      const solvers = new Set([
        ...written.filter((h) => judge(h.word, word) === 'right').map((h) => h.author),
        ...[...named].filter(([id, ws]) => id !== leader.id && ws.some((e) => judge(e.word, word) === 'right')).map(([id]) => id),
      ]);
      solved = solvers.size > 0;
      const earned: Record<string, number> = {};
      const add = (id: string, n: number) => (earned[id] = (earned[id] ?? 0) + n);
      for (const id of solvers) add(id, CONTACT_SOLVE_POINTS);
      const through = results.filter((r) => r.contacts.length > 0 && !r.blocked);
      for (const r of through) for (const id of [r.author, ...r.contacts]) add(id, CONTACT_POINTS);
      for (const r of results) if (r.blocked) add(leader.id, CONTACT_BLOCK_POINTS);
      pay(earned);
      const opened = !solved && through.length > 0;
      if (opened) open++;
      if (open >= word.length) solved = true;
      const line = solved
        ? `${this.host.decks.line('contactSolved')} Загаданное слово — «${word}».`
        : this.host.decks.line(opened ? 'contactOpened' : results.some((r) => r.blocked) ? 'contactBlocked' : 'contactNone');
      this.setPhase({ kind: 'contactReveal', leader: leader.id, prefix: word.slice(0, open).toUpperCase(), hints: results, opened, word: solved ? word : undefined, gains: { ...gains } }, line);
      await this.narrated(this.dur.contactReveal, line);
    }
    if (!solved) {
      pay({ [leader.id]: (word.length - open) * CONTACT_HIDDEN_POINTS });
      const line = `${this.host.decks.line('contactEnd')} Загаданное слово — «${word}».`;
      this.setPhase({ kind: 'contactReveal', leader: leader.id, prefix: word.toUpperCase(), hints: [], opened: false, word, gains: { ...gains } }, line);
      await this.narrated(this.dur.contactReveal, line);
    }
    this.contactWord = null;
    this.contactLeader = null;
    this.contactHints = new Map();
  }

  /** «Оркестр»: everyone taps their own instrument's part in time; the TV plays the whole score. */
  private async band(): Promise<void> {
    const players = this.active();
    if (players.length === 0) return;
    const parts: Record<string, BandPart> = Object.fromEntries(
      shuffle(players, this.host.rng).map((p, i) => {
        const instrument = BAND_INSTRUMENTS[i % BAND_INSTRUMENTS.length]!;
        return [p.id, { instrument, notes: bandNotes(instrument) }];
      }),
    );
    const say = this.host.decks.line('bandIntro');
    const beat = Math.round(this.dur.bandPlay / BAND_BEATS);
    const countdown = this.dur.bandCountdown + this.speech(say);
    const startsAt = Date.now() + countdown;
    this.bandHits = new Map(players.map((p) => [p.id, new Map<number, number>()]));
    this.bandStrays = new Map();
    const scores: Record<string, number> = Object.fromEntries(players.map((p) => [p.id, 0]));
    this.setPhase({ kind: 'band', startsAt, beat, beats: BAND_BEATS, parts, deadline: startsAt + beat * BAND_BEATS, scores }, say);
    await this.wait(countdown + beat * BAND_BEATS + this.dur.grace);

    const gains: Record<string, number> = {};
    for (const [id, pct] of Object.entries(scores)) if (pct > 0) gains[id] = pct * BAND_POINTS_PER_PERCENT;
    this.award(gains);
    const best = Math.max(0, ...Object.values(scores));
    const leaders = Object.keys(scores).filter((id) => scores[id] === best && best > 0).map((id) => this.name(id));
    const line = leaders.length > 0 ? this.host.decks.line('bandWin', joinNames(leaders)) : 'Оркестр сыграл вразнобой! Зато от души.';
    this.setPhase({ kind: 'bandReveal', parts, scores: { ...scores }, gains }, line);
    this.bandHits = new Map();
    this.bandStrays = new Map();
    await this.narrated(this.dur.bandReveal, line);
  }

  /** The word behind a «Контакт» hint, so a bot can make or block a contact now and then. */
  contactHintWord(hint: string): string | undefined {
    return this.contactHints.get(hint)?.word;
  }

  /** The «Контакт» leader's word while it is in play; bots peek to block or solve now and then. */
  contactSecret(): string | undefined {
    return this.contactWord ?? undefined;
  }

  /** «Расследование»: a survey about yourselves, then a mischief whose clues are the culprit's own answers. */
  private async investigation(): Promise<void> {
    const players = this.active();
    if (players.length < (GAME_INFO.case.players ?? 0)) return this.vote(false);
    const rng = this.host.rng;
    const questions = shuffle(caseQuestions, rng).slice(0, CASE_CLUES);
    const intro = this.host.decks.line('caseIntro');
    const surveyMs = this.dur.caseSurvey + this.speech(intro);
    this.setPhase({ kind: 'caseSurvey', questions: questions.map((q) => ({ q: q.q, options: [...q.options] })), deadline: Date.now() + surveyMs, done: [] }, intro);
    await this.wait(surveyMs, this.answering());
    const surveys = new Map(Object.entries(this.stringAnswers()).map(([id, v]) => [id, cloverPick(v)]));

    const suspects = players.filter((p) => surveys.has(p.id));
    if (suspects.length < 2) return;
    const culprit = pick(suspects, rng);
    const answersOf = surveys.get(culprit.id)!;
    this.caseCulprit = culprit.id;
    const crime = pick(caseCrimes, rng);
    const clues: string[] = [];
    const locked = new Map<string, { suspect: string; clue: number }>();
    this.caseLocked = locked;
    for (const [i, q] of questions.entries()) {
      clues.push(q.clues[answersOf[i]!]!);
      const say = `${i === 0 ? `${crime} ` : ''}${narrator.caseClues[i] ?? ''} ${clues.at(-1)}`;
      const ms = this.dur.caseClue + this.speech(say);
      this.setPhase({ kind: 'caseClue', crime, clues: [...clues], round: i + 1, rounds: questions.length, deadline: Date.now() + ms, accused: [...locked.keys()] }, say);
      const detectives = () => this.active().filter((p) => p.id !== culprit.id && !locked.has(p.id));
      await this.wait(ms, { who: detectives, done: (p) => this.answers.has(p.id) });
      for (const [id, v] of Object.entries(this.stringAnswers())) if (!locked.has(id) && id !== culprit.id) locked.set(id, { suspect: v, clue: i + 1 });
      if (detectives().length === 0) {
        // everyone has accused: the reveal still lays out the clues nobody needed
        for (const [k, rest] of questions.entries()) if (k > i) clues.push(rest.clues[answersOf[k]!]!);
        break;
      }
    }
    this.caseCulprit = null;
    this.caseLocked = new Map();

    const gains: Record<string, number> = {};
    let caught = 0;
    for (const [id, a] of locked) {
      if (a.suspect !== culprit.id) continue;
      caught++;
      gains[id] = CASE_POINTS[a.clue - 1] ?? 0;
    }
    const missed = players.filter((p) => p.id !== culprit.id).length - caught;
    if (missed > 0) gains[culprit.id] = missed * CASE_ESCAPE_POINTS;
    this.award(gains);
    const line = this.host.decks.line(caught > 0 ? 'caseCaught' : 'caseEscaped', culprit.name);
    const accusations = [...locked].map(([player, a]) => ({ player, ...a }));
    this.setPhase({ kind: 'caseReveal', crime, culprit: culprit.id, clues, accusations, gains }, line);
    await this.narrated(this.dur.caseReveal, line);
  }

  /** «Рифмач»: the narrator starts a couplet, everyone rhymes the second line, the narrator performs them all, the room votes. */
  private async rhyme(): Promise<void> {
    const players = this.active();
    if (players.length < (GAME_INFO.rhyme.players ?? 0)) return this.vote(false);
    const starts = shuffle(rhymeStarts, this.host.rng);
    const from = GAME_INFO.rhyme.title;
    for (let round = 0; round < RHYME_ROUNDS; round++) {
      const first = starts[round % starts.length]!;
      const say = `${round === 0 ? `${this.host.decks.line('rhymeIntro')} ` : ''}${first}…`;
      const ms = this.dur.rhymeWrite + this.speech(say);
      this.setPhase({ kind: 'write', prompt: first, deadline: Date.now() + ms, done: [], rhyme: true }, say);
      await this.wait(ms, this.answering());

      const replies = shuffle(
        [...this.answers].flatMap(([player, text]) => (typeof text === 'string' ? [{ player, text }] : [])),
        this.host.rng,
      );
      if (replies.length < 2) continue;
      // the couplets are the players' own words, so this is the one line here the TV voices live
      const show = `${this.host.decks.line('rhymeShow')} ${replies.map((r) => `${first}, ${r.text}.`).join(' ')}`;
      const voteMs = this.dur.rhymeVote + this.speech(show);
      this.setPhase({ kind: 'rushVote', from, message: first, replies, deadline: Date.now() + voteMs, voted: [], ask: 'Какой куплет — хит?' }, show);
      await this.wait(voteMs, this.answering());

      const votes = this.stringAnswers();
      const tallied = replies.map((r) => ({ ...r, votes: Object.keys(votes).filter((v) => votes[v] === r.player) }));
      const gains: Record<string, number> = {};
      for (const r of tallied) if (r.votes.length > 0) gains[r.player] = r.votes.length * RHYME_VOTE_POINTS;
      this.award(gains);
      const top = Math.max(...tallied.map((r) => r.votes.length));
      const leaders = tallied.filter((r) => r.votes.length === top);
      const line = top > 0 && leaders.length === 1 ? this.host.decks.line('rhymeWin', this.name(leaders[0]!.player)) : this.host.decks.line('rushTie');
      this.setPhase({ kind: 'rushReveal', from, message: first, replies: tallied, gains, crowd: this.crowdPick() }, line);
      await this.narrated(this.dur.rhymeReveal, line);
    }
  }

  /** «Барахолка»: everyone pitches their junk, then each lot goes to the highest sealed bid. */
  private async junk(): Promise<void> {
    const players = this.active();
    if (players.length < (GAME_INFO.junk.players ?? 0)) return this.vote(false);
    const rng = this.host.rng;
    const items = shuffle(junkItems, rng);
    this.junkItems = new Map(players.map((p, i) => [p.id, items[i % items.length]!]));
    const intro = this.host.decks.line('junkIntro');
    const writeMs = this.dur.junkWrite + this.speech(intro);
    this.setPhase({ kind: 'write', prompt: '', deadline: Date.now() + writeMs, done: [], junk: true }, intro);
    await this.wait(writeMs, this.answering());
    const pitches = new Map([...this.answers].filter((e): e is [string, string] => typeof e[1] === 'string'));

    this.junkCoins = new Map(players.map((p) => [p.id, JUNK_BUDGET]));
    const sellers = shuffle([...pitches.keys()], rng).slice(0, JUNK_LOTS);
    for (const [i, seller] of sellers.entries()) {
      const item = this.junkItems.get(seller)!;
      const pitch = pitches.get(seller)!;
      const say = `${this.host.decks.line('junkLot', this.name(seller))} ${item}. ${pitch}`;
      const ms = this.dur.junkBid + this.speech(say);
      this.setPhase({ kind: 'junkBid', seller, item, pitch, lot: i + 1, lots: sellers.length, deadline: Date.now() + ms, bids: [] }, say);
      await this.wait(ms, { who: () => this.active().filter((p) => p.id !== seller), done: (p) => this.answers.has(p.id) });

      // the earliest of equal top bids wins, the way an auctioneer hears the first hand
      const bids = [...this.answers].flatMap(([id, v]) => (typeof v === 'number' && v > 0 ? [{ id, v }] : []));
      const price = Math.max(0, ...bids.map((b) => b.v));
      const buyer = price > 0 ? bids.find((b) => b.v === price)!.id : undefined;
      const bidders = bids.map((b) => b.id);
      const sale: Record<string, number> = {};
      if (buyer) {
        this.junkCoins.set(buyer, this.junkCoins.get(buyer)! - price);
        sale[seller] = price;
        sale[buyer] = bidders.length * JUNK_WANTED_POINTS;
        this.award(sale);
      }
      const line = buyer ? this.host.decks.line('junkSold', this.name(buyer)) : this.host.decks.line('junkUnsold');
      this.setPhase({ kind: 'junkSold', seller, item, pitch, buyer, price, bidders, coins: Object.fromEntries(this.junkCoins), gains: sale }, line);
      await this.narrated(this.dur.junkSold, line);
    }
    this.junkItems = new Map();
    this.junkCoins = new Map();
  }

  /** «Фруктовый ниндзя»: the same fruit schedule flies down every lane; slices on the phone score, bombs cost. */
  private async ninja(): Promise<void> {
    const players = this.active();
    if (players.length === 0) return;
    const rng = this.host.rng;
    const play = this.dur.ninjaPlay;
    const flight = Math.round(play * NINJA_FLIGHT);
    const fruits: NinjaFruit[] = [];
    for (let at = play * NINJA_FIRST, id = 0; at < play - flight / 2; at += play * NINJA_GAP * (0.5 + rng())) {
      fruits.push({ id: id++, at: Math.round(at), x: Math.round((0.15 + rng() * 0.7) * 100) / 100, flight, kind: rng() < NINJA_BOMB_SHARE ? NINJA_BOMB : pick(NINJA_FRUITS, rng) });
    }
    const say = this.host.decks.line('ninjaIntro');
    const countdown = this.dur.ninjaCountdown + this.speech(say);
    const startsAt = Date.now() + countdown;
    this.ninjaSliced = new Map(players.map((p) => [p.id, new Set<number>()]));
    this.ninjaBombs = new Map();
    const scores: Record<string, number> = Object.fromEntries(players.map((p) => [p.id, 0]));
    this.setPhase({ kind: 'ninja', startsAt, deadline: startsAt + this.dur.ninjaPlay, fruits, scores }, say);
    await this.wait(countdown + this.dur.ninjaPlay + this.dur.grace);

    const gains: Record<string, number> = {};
    for (const [id, n] of Object.entries(scores)) if (n > 0) gains[id] = n;
    this.award(gains);
    const best = Math.max(0, ...Object.values(scores));
    const leaders = Object.keys(scores).filter((id) => scores[id] === best && best > 0).map((id) => this.name(id));
    const line = leaders.length > 0 ? this.host.decks.line('ninjaWin', joinNames(leaders)) : 'Фрукты улетели целыми! В следующий раз режем смелее.';
    this.setPhase({ kind: 'ninjaReveal', scores: { ...scores }, bombs: Object.fromEntries(this.ninjaBombs), gains }, line);
    this.ninjaSliced = new Map();
    await this.narrated(this.dur.ninjaReveal, line);
  }

  /** The «Расследование» culprit while the clues come out; bots peek to accuse right now and then. */
  caseSecret(): string | undefined {
    return this.caseCulprit ?? undefined;
  }

  /** The «Барахолка» item this seller pitches. */
  junkItemOf(playerId: string): string | undefined {
    return this.junkItems.get(playerId);
  }

  /** «Срисуй по памяти»: a picture shows for a few seconds and hides; everyone redraws it, then the gallery votes. */
  private async copy(): Promise<void> {
    // a drawing from tonight is the most fun to copy; the built-in sketches cover an early slot
    const drawn = this.highlights.filter((h) => h.ink && !h.image);
    const source = drawn.length > 0 ? pick(drawn, this.host.rng) : undefined;
    const picture: PictureRef = source
      ? { ink: source.ink, board: source.board ?? BOARDS.selfie }
      : { image: `/sketch/${pick(SKETCH_IMAGES, this.host.rng)}.webp`, board: BOARDS.selfie };
    const intro = this.host.decks.line('copyIntro');
    const showMs = this.dur.copyShow + this.speech(intro);
    this.setPhase({ kind: 'copyShow', picture, deadline: Date.now() + showMs }, intro);
    await this.wait(showMs);

    const go = this.host.decks.line('copyGo');
    const prompt = 'Нарисуйте картинку по памяти';
    this.setPhase({ kind: 'draw', mode: 'copy', prompt, board: picture.board, deadline: Date.now() + this.dur.copyDraw + this.speech(go), done: [] }, go);
    await this.wait(this.dur.copyDraw + this.speech(go), this.submitting());
    const items: GalleryItem[] = [];
    for (const p of this.host.players()) {
      const strokes = this.inks.get(p.id);
      if (!strokes?.length) continue;
      items.push({ id: newId(), authors: [p.id], kind: 'copy', ink: this.host.putAsset('application/json', JSON.stringify(strokes)), board: picture.board, caption: 'Срисовано по памяти' });
    }
    await this.gallery('Чья копия ближе к оригиналу?', items, 'art', undefined, picture);
  }

  /** «Сказочник»: everyone draws on one theme; a teller gives a clue and the room hunts for the teller's drawing. */
  private async tale(): Promise<void> {
    const players = this.active();
    if (players.length < (GAME_INFO.tale.players ?? 0)) return this.vote(false);
    const rng = this.host.rng;
    const theme = pick(taleThemes, rng);
    const intro = `${this.host.decks.line('taleIntro')} Тема: ${theme.charAt(0).toLowerCase()}${theme.slice(1)}.`;
    const drawMs = this.dur.taleDraw + this.speech(intro);
    this.setPhase({ kind: 'draw', mode: 'tale', prompt: theme, board: BOARDS.describe, deadline: Date.now() + drawMs, done: [] }, intro);
    await this.wait(drawMs, this.submitting());
    const cards = new Map<string, TaleCard>();
    for (const p of this.host.players()) {
      const strokes = this.inks.get(p.id);
      if (strokes?.length) cards.set(p.id, { id: newId(), ink: this.host.putAsset('application/json', JSON.stringify(strokes)), board: BOARDS.describe });
    }
    if (cards.size < 3) return;

    // a bot cannot think up a clue for its own doodle, so people tell first
    const tellers = shuffle([...cards.keys()], rng)
      .map((id) => this.player(id))
      .filter((p) => p !== undefined)
      .sort((a, b) => Number(a.bot) - Number(b.bot))
      .slice(0, TALE_ROUNDS);
    const order = shuffle([...cards.values()], rng);
    const authorOf = new Map([...cards].map(([author, card]) => [card.id, author]));
    for (const [i, teller] of tellers.entries()) {
      const ask = this.host.decks.line('taleClue', teller.name);
      const clueMs = this.dur.taleClue + this.speech(ask);
      this.setPhase({ kind: 'write', prompt: 'Подсказка к своему рисунку', deadline: Date.now() + clueMs, done: [], author: teller.id, tale: true }, ask);
      await this.wait(clueMs, { who: () => [teller], done: (p) => this.answers.has(p.id), abandoned: () => !teller.connected });
      const typed = this.answers.get(teller.id);
      // a made-up clue for a person's drawing would send everyone hunting at random
      if (typeof typed !== 'string' && !teller.bot) continue;
      const clue = typeof typed === 'string' ? typed : pick(taleBotClues, rng);
      const truth = cards.get(teller.id)!.id;

      this.taleCards = new Map([...cards].map(([author, card]) => [author, card.id]));
      this.taleTeller = teller.id;
      const say = this.host.decks.line('taleVote');
      const voteMs = this.dur.taleVote + this.speech(say);
      this.setPhase({ kind: 'taleVote', teller: teller.id, clue, items: order, round: i + 1, rounds: tellers.length, deadline: Date.now() + voteMs, voted: [] }, say);
      await this.wait(voteMs, { who: () => this.active().filter((p) => p.id !== teller.id), done: (p) => this.answers.has(p.id) });
      this.taleTeller = null;

      const votes = this.stringAnswers();
      const finders = Object.keys(votes).filter((id) => votes[id] === truth);
      const voters = Object.keys(votes).length;
      const gains: Record<string, number> = {};
      const add = (id: string, n: number) => (gains[id] = (gains[id] ?? 0) + n);
      // Dixit: a clue everyone or nobody gets scores the teller nothing and everyone else the base
      const missed = finders.length === 0 || finders.length === voters;
      if (missed) for (const id of Object.keys(votes)) add(id, TALE_BASE_POINTS);
      else {
        add(teller.id, TALE_FIND_POINTS);
        for (const id of finders) add(id, TALE_FIND_POINTS);
      }
      for (const [voter, card] of Object.entries(votes)) {
        const author = authorOf.get(card);
        if (author && card !== truth && author !== voter) add(author, TALE_FOOL_POINTS);
      }
      this.award(gains);
      const items = order.map((c) => ({ ...c, author: authorOf.get(c.id)!, votes: Object.keys(votes).filter((v) => votes[v] === c.id) }));
      const line = this.host.decks.line(missed ? 'taleMissed' : 'taleFound', teller.name);
      this.setPhase({ kind: 'taleReveal', teller: teller.id, clue, items, truth, gains }, line);
      await this.narrated(this.dur.taleReveal, line);
    }
    this.taleCards = new Map();
  }

  /** «Викторина на выбывание»: quick four-option questions; a miss costs one of three lives. */
  private async quiz(): Promise<void> {
    const players = this.active();
    if (players.length === 0) return;
    const lives: Record<string, number> = Object.fromEntries(players.map((p) => [p.id, QUIZ_LIVES]));
    const alive = () => Object.keys(lives).filter((id) => lives[id]! > 0);
    const done = () => alive().length === 0 || (players.length > 1 && alive().length <= 1);
    const gains: Record<string, number> = {};
    for (let n = 1; n <= QUIZ_QUESTIONS && !done(); n++) {
      const question = this.host.decks.quiz.draw();
      const say = n === 1 ? `${this.host.decks.line('quizIntro')} ${question.q}` : question.q;
      const ms = this.dur.quizAsk + this.speech(say);
      this.quizTimes = new Map();
      this.quizAnswer = question.answer;
      this.setPhase({ kind: 'quiz', q: question.q, options: [...question.options], n, of: QUIZ_QUESTIONS, deadline: Date.now() + ms, alive: alive(), lives: { ...lives }, answered: [] }, say);
      await this.wait(ms, { who: () => this.active().filter((p) => (lives[p.id] ?? 0) > 0), done: (p) => this.answers.has(p.id) });
      this.quizAnswer = undefined;

      const picks: Record<string, number> = {};
      for (const [id, v] of this.answers) if (typeof v === 'number') picks[id] = v;
      const out: string[] = [];
      for (const id of alive()) {
        if (picks[id] === question.answer) {
          const left = (this.quizTimes.get(id) ?? 0) / ms;
          gains[id] = (gains[id] ?? 0) + QUIZ_RIGHT_POINTS + Math.round(left * QUIZ_SPEED_POINTS);
        } else if (--lives[id]! === 0) out.push(id);
      }
      const right = `${this.host.decks.line('quizRight')} ${question.options[question.answer]}.`;
      const line = out.length > 0 ? `${right} ${this.host.decks.line('quizOut', joinNames(out.map((id) => this.name(id))))}` : right;
      this.setPhase({ kind: 'quizReveal', q: question.q, options: [...question.options], answer: question.answer, picks, lives: { ...lives }, out, gains: {} }, line);
      await this.narrated(this.dur.quizReveal, line);
    }
    this.quizTimes = new Map();
    const survivors = alive();
    for (const id of survivors) gains[id] = (gains[id] ?? 0) + QUIZ_SURVIVOR_POINTS;
    this.award(gains);
    const line = survivors.length > 0 ? this.host.decks.line('quizWin', joinNames(survivors.map((id) => this.name(id)))) : this.host.decks.line('quizAllOut');
    this.setPhase({ kind: 'quizReveal', q: '', options: [], answer: -1, picks: {}, lives: { ...lives }, out: [], gains }, line);
    await this.narrated(this.dur.quizReveal, line);
  }

  /** The right option of the quiz question on the table; bots peek at it to answer right sometimes. */
  quizSecret(): number | undefined {
    return this.quizAnswer;
  }

  /** The right slot for the «В каком году?» event on the table; bots peek at it too. */
  yearsSecret(): number | undefined {
    return this.yearsSlot;
  }

  /** «В каком году?»: each new event goes before, between or after the ones already on the timeline. */
  private async years(): Promise<void> {
    if (this.active().length === 0) return;
    const anchor = this.host.decks.years.draw();
    let timeline: YearCard[] = [anchor];
    for (let round = 1; round <= YEARS_ROUNDS; round++) {
      let card = this.host.decks.years.draw();
      // a twin year has two right slots, and the reveal could only show one
      for (let tries = 0; timeline.some((c) => c.year === card.year) && tries < 5; tries++) card = this.host.decks.years.draw();
      if (timeline.some((c) => c.year === card.year)) continue;
      const lead = round === 1 ? `${this.host.decks.line('yearsIntro')} ` : '';
      const say = `${lead}${this.host.decks.line('yearsAsk')} ${card.e}.`;
      const ms = this.dur.yearsAsk + this.speech(say);
      const slot = timeline.filter((c) => c.year < card.year).length;
      this.yearsSlot = slot;
      this.setPhase({ kind: 'years', event: card.e, timeline, round, rounds: YEARS_ROUNDS, deadline: Date.now() + ms, done: [] }, say);
      await this.wait(ms, this.answering());
      this.yearsSlot = undefined;

      const picks: Record<string, number> = {};
      for (const [id, v] of this.answers) if (typeof v === 'number') picks[id] = v;
      const gains: Record<string, number> = {};
      for (const [id, s] of Object.entries(picks)) if (s === slot) gains[id] = YEARS_POINTS;
      this.award(gains);
      timeline = [...timeline.slice(0, slot), { e: card.e, year: card.year }, ...timeline.slice(slot)];
      const winners = Object.keys(gains).map((id) => this.name(id));
      const line = winners.length > 0 ? this.host.decks.line('yearsRight', joinNames(winners)) : this.host.decks.line('yearsNone');
      this.setPhase({ kind: 'yearsReveal', event: card.e, year: card.year, timeline, slot, picks, gains }, line);
      await this.narrated(this.dur.yearsReveal, line);
    }
  }

  /** «Четырёхлистник»: everyone links neighbouring words on their clover; the room then rebuilds a few of them. */
  private async clover(): Promise<void> {
    const players = this.active();
    if (players.length < (GAME_INFO.clover.players ?? 0)) return this.vote(false);
    const rng = this.host.rng;
    this.cloverCards = new Map(
      players.map((p) => {
        const words = new Set<string>();
        for (let tries = 0; words.size < CLOVER_SIZE + 1 && tries < 30; tries++) words.add(this.host.decks.guessWord());
        return [p.id, [...words]];
      }),
    );
    const intro = this.host.decks.line('cloverIntro');
    const writeMs = this.dur.cloverWrite + this.speech(intro);
    this.setPhase({ kind: 'write', prompt: '', deadline: Date.now() + writeMs, done: [], clover: true }, intro);
    await this.wait(writeMs, this.answeringDealt(this.cloverCards));
    const written = new Map([...this.answers].filter((e): e is [string, string[]] => Array.isArray(e[1])));

    // a bot's clues are noise, so people's clovers go first and bots' only fill a short table
    const authors = shuffle([...written.keys()], rng)
      .map((id) => this.player(id))
      .filter((p) => p !== undefined)
      .sort((a, b) => Number(a.bot) - Number(b.bot))
      .slice(0, CLOVER_ROUNDS);
    for (const [i, author] of authors.entries()) {
      const words = this.cloverCards.get(author.id)!;
      const clues = written.get(author.id)!;
      const cards = shuffle(words, rng);
      this.cloverTruth = words.slice(0, CLOVER_SIZE).map((w) => cards.indexOf(w));
      const say = this.host.decks.line('cloverGuess', author.name);
      const ms = this.dur.cloverGuess + this.speech(say);
      this.setPhase({ kind: 'clover', author: author.id, clues, cards, round: i + 1, rounds: authors.length, deadline: Date.now() + ms, done: [] }, say);
      await this.wait(ms, { who: () => this.active().filter((p) => p.id !== author.id), done: (p) => this.answers.has(p.id) });

      const truth = this.cloverTruth;
      const picks = Object.fromEntries(Object.entries(this.stringAnswers()).map(([id, v]) => [id, cloverPick(v)]));
      const gains: Record<string, number> = {};
      let perfect = false;
      for (const [id, pick] of Object.entries(picks)) {
        const right = pick.filter((c, k) => c === truth[k]).length;
        if (right === CLOVER_SIZE) perfect = true;
        const points = right * CLOVER_CORNER_POINTS + (right === CLOVER_SIZE ? CLOVER_PERFECT_BONUS : 0);
        if (points > 0) gains[id] = points;
        if (right > 0) gains[author.id] = (gains[author.id] ?? 0) + right * CLOVER_AUTHOR_POINTS;
      }
      this.award(gains);
      this.cloverTruth = [];
      const line = this.host.decks.line(perfect ? 'cloverPerfect' : 'cloverDone', author.name);
      this.setPhase({ kind: 'cloverReveal', author: author.id, clues, cards, words: words.slice(0, CLOVER_SIZE), picks, gains }, line);
      await this.narrated(this.dur.cloverReveal, line);
    }
    this.cloverCards = new Map();
  }

  /** «Четырёхлистник»: the card index on each corner; bots peek to place some right. */
  cloverSecret(): number[] {
    return this.cloverTruth;
  }

  /** «Шейкер»: pump your balloon as big as you dare; each bursts at its own secret size and a burst one scores nothing. */
  private async shaker(): Promise<void> {
    const players = this.active();
    if (players.length === 0) return;
    const rng = this.host.rng;
    this.shakerLimits = new Map(players.map((p) => [p.id, SHAKER_POP_MIN + Math.floor(rng() * (SHAKER_POP_MAX - SHAKER_POP_MIN + 1))]));
    const say = this.host.decks.line('shakerIntro');
    const countdown = this.dur.shakerCountdown + this.speech(say);
    const startsAt = Date.now() + countdown;
    const sizes: Record<string, number> = Object.fromEntries(players.map((p) => [p.id, 0]));
    this.setPhase({ kind: 'shaker', startsAt, deadline: startsAt + this.dur.shakerPlay, sizes, popped: [] }, say);
    // phones send their total every 250 ms, so the last pumps land after the deadline
    await this.wait(countdown + this.dur.shakerPlay + this.dur.grace);

    const phase = this.phase;
    const popped = phase.kind === 'shaker' ? phase.popped : [];
    this.shakerLimits = new Map();
    const whole = Object.entries(sizes)
      .filter(([id, n]) => n > 0 && !popped.includes(id))
      .sort((a, b) => b[1] - a[1]);
    const gains: Record<string, number> = {};
    let place = 0;
    whole.forEach(([id, n], i) => {
      if (i > 0 && n < whole[i - 1]![1]) place = i;
      const points = SHAKER_POINTS[place] ?? 0;
      if (points > 0) gains[id] = points;
    });
    this.award(gains);
    const leaders = whole.filter(([, n]) => n === whole[0]?.[1]).map(([id]) => this.name(id));
    const line =
      leaders.length > 0 ? this.host.decks.line('shakerWin', joinNames(leaders)) : this.host.decks.line(popped.length > 0 ? 'shakerAllPopped' : 'shakerFlat');
    this.setPhase({ kind: 'shakerReveal', sizes: { ...sizes }, popped: [...popped], gains }, line);
    await this.narrated(this.dur.shakerReveal, line);
  }

  /** «Мафия-ТВ»: wolves hunt at night, the village argues and exiles by day, the TV narrates. */
  private async mafiaGame(): Promise<void> {
    const players = this.active();
    if (players.length < (GAME_INFO.mafia.players ?? 0)) return this.vote(false);
    const rng = this.host.rng;
    const deck = shuffle(players, rng);
    const wolves = deck.length >= MAFIA_TWO_WOLVES ? 2 : 1;
    this.mafiaRoles = new Map(
      deck.map((p, i): [string, MafiaRole] => [
        p.id,
        i < wolves ? 'wolf' : i === wolves && deck.length >= MAFIA_DOCTOR_FROM ? 'doctor' : i === wolves + 1 && deck.length >= MAFIA_SEER_FROM ? 'seer' : 'villager',
      ]),
    );
    this.mafiaAlive = new Set(players.map((p) => p.id));
    this.mafiaSeen = [];
    const gains: Record<string, number> = {};
    const add = (id: string, points: number) => (gains[id] = (gains[id] ?? 0) + points);
    const alive = () => [...this.mafiaAlive];
    const role = (id: string) => this.mafiaRoles.get(id) ?? 'villager';
    const wolvesLeft = () => alive().filter((id) => role(id) === 'wolf').length;
    const over = () => wolvesLeft() === 0 || wolvesLeft() * 2 >= this.mafiaAlive.size;

    const intro = this.host.decks.line('mafiaIntro');
    this.setPhase({ kind: 'mafiaRoles', deadline: Date.now() + this.dur.mafiaRoles + this.speech(intro), alive: alive() }, intro);
    await this.wait(this.dur.mafiaRoles + this.speech(intro));

    for (let night = 1; night <= MAFIA_NIGHTS && !over(); night++) {
      const say = this.host.decks.line('mafiaNight');
      const ms = this.dur.mafiaNight + this.speech(say);
      const known = new Set(this.mafiaSeen.map((s) => s.player));
      this.setPhase({ kind: 'mafiaNight', night, nights: MAFIA_NIGHTS, deadline: Date.now() + ms, alive: alive(), done: [] }, say);
      await this.wait(ms, { who: () => this.active().filter((p) => this.mafiaAlive.has(p.id)), done: (p) => this.answers.has(p.id) });

      const picks = this.stringAnswers();
      const hunt = new Map<string, number>();
      for (const [id, to] of Object.entries(picks)) if (role(id) === 'wolf' && role(to) !== 'wolf') hunt.set(to, (hunt.get(to) ?? 0) + 1);
      const most = Math.max(0, ...hunt.values());
      const prey = [...hunt].filter(([, n]) => n === most && most > 0).map(([id]) => id);
      const target = prey.length > 0 ? pick(prey, rng) : undefined;
      const healer = alive().find((id) => role(id) === 'doctor');
      const saved = target !== undefined && healer !== undefined && picks[healer] === target;
      if (saved) add(healer!, MAFIA_SAVE_POINTS);
      const seer = alive().find((id) => role(id) === 'seer');
      if (seer && picks[seer] && role(picks[seer]) === 'wolf' && !known.has(picks[seer])) add(seer, MAFIA_SEER_POINTS);
      const victim = target !== undefined && !saved ? target : undefined;
      if (victim) this.mafiaAlive.delete(victim);

      const morning = victim ? this.host.decks.line('mafiaVictim', this.name(victim)) : this.host.decks.line(saved ? 'mafiaSaved' : 'mafiaQuiet');
      // a night that decides the game leaves nothing to talk over, so the day is only the news
      const dayMs = (over() ? this.dur.mafiaExile : this.dur.mafiaDay) + this.speech(morning);
      this.setPhase({ kind: 'mafiaDay', day: night, days: MAFIA_NIGHTS, deadline: Date.now() + dayMs, alive: alive(), victim, saved }, morning);
      await this.wait(dayMs);
      if (over()) break;

      const ask = this.host.decks.line('mafiaVote');
      const voteMs = this.dur.mafiaVote + this.speech(ask);
      this.setPhase({ kind: 'mafiaVote', day: night, deadline: Date.now() + voteMs, alive: alive(), voted: [] }, ask);
      await this.wait(voteMs, { who: () => this.active().filter((p) => this.mafiaAlive.has(p.id)), done: (p) => this.answers.has(p.id) });

      const votes = this.stringAnswers();
      const tally = new Map<string, number>();
      for (const to of Object.values(votes)) tally.set(to, (tally.get(to) ?? 0) + 1);
      const top = Math.max(0, ...tally.values());
      const leaders = [...tally].filter(([, n]) => n === top).map(([id]) => id);
      const exiled = top > 0 && leaders.length === 1 ? leaders[0]! : undefined;
      for (const [from, to] of Object.entries(votes)) if (role(to) === 'wolf' && role(from) !== 'wolf') add(from, MAFIA_HIT_POINTS);
      if (exiled) this.mafiaAlive.delete(exiled);
      const verdict = !exiled
        ? this.host.decks.line('mafiaExileNone')
        : this.host.decks.line(role(exiled) === 'wolf' ? 'mafiaExileWolf' : 'mafiaExileTown', this.name(exiled));
      this.setPhase(
        { kind: 'mafiaExile', day: night, alive: alive(), exiled, role: exiled ? role(exiled) : undefined, votes: Object.entries(votes).map(([from, to]) => ({ from, to })) },
        verdict,
      );
      await this.narrated(this.dur.mafiaExile, verdict);
    }

    // wolves still in the village when the nights run out have got away with it
    const winner = wolvesLeft() === 0 ? 'village' : 'wolves';
    for (const p of players) if ((role(p.id) === 'wolf') === (winner === 'wolves')) add(p.id, MAFIA_WIN_POINTS);
    this.award(gains);
    const roles = Object.fromEntries(this.mafiaRoles);
    const end = this.host.decks.line(winner === 'village' ? 'mafiaVillageWins' : 'mafiaWolvesWin');
    this.setPhase({ kind: 'mafiaEnd', winner, roles, alive: alive(), gains }, end);
    this.mafiaRoles = new Map();
    this.mafiaAlive = new Set();
    this.mafiaSeen = [];
    await this.narrated(this.dur.mafiaEnd, end);
  }

  /** «Шляпа»: the room's words go round three times, explained freely, then in one word, then by gestures. */
  private async hatGame(): Promise<void> {
    const humans = this.active().filter((p) => !p.bot);
    if (this.active().length < (GAME_INFO.hat.players ?? 0) || humans.length === 0) return this.vote(false);
    const intro = this.host.decks.line('hatIntro');
    const writeMs = this.dur.hatWrite + this.speech(intro);
    this.setPhase({ kind: 'write', prompt: 'Бросьте в шляпу одно слово', deadline: Date.now() + writeMs, done: [], hat: true }, intro);
    await this.wait(writeMs, this.answering());
    const seen = new Set<string>();
    const words: string[] = [];
    const add = (w: string) => {
      const key = w.toLowerCase().replace(/ё/g, 'е');
      if (seen.has(key)) return;
      seen.add(key);
      words.push(w);
    };
    for (const v of shuffle([...this.answers.values()], this.host.rng)) if (typeof v === 'string') add(v);
    for (let tries = 0; words.length < HAT_MIN_WORDS && tries < HAT_MIN_WORDS * 3; tries++) add(this.host.decks.guessWord());
    words.splice(HAT_MAX_WORDS);

    // a bot cannot explain out loud, so only people take the hat, in one fixed order across the rounds
    const order = shuffle(humans, this.host.rng);
    let seat = 0;
    for (const [i, mode] of HAT_MODES.entries()) {
      this.hatQueue = shuffle(words, this.host.rng);
      for (let turn = 0; turn < HAT_TURNS_PER_ROUND && this.hatQueue.length > 0; turn++) {
        const here = order.filter((p) => p.connected);
        if (here.length === 0) return;
        await this.hatTurnOf(here[seat++ % here.length]!, mode, i + 1, turn === 0);
      }
    }
    this.hatQueue = [];
  }

  private async hatTurnOf(explainer: Player, mode: HatMode, round: number, opensRound: boolean): Promise<void> {
    const modeLine = ({ talk: 'hatTalk', word: 'hatWord', mime: 'hatMime' } as const)[mode];
    const turnLine = this.host.decks.line('hatTurn', explainer.name);
    const say = opensRound ? `${this.host.decks.line(modeLine)} ${turnLine}` : turnLine;
    const ms = this.dur.hatTurn + this.speech(say);
    const turn = { explainer: explainer.id, close: new Set<string>(), lastAt: new Map<string, number>() };
    this.hatTurn = turn;
    const phase: Phase = { kind: 'hat', explainer: explainer.id, mode, round, rounds: HAT_MODES.length, deadline: Date.now() + ms, left: this.hatQueue.length, got: [], feed: [] };
    this.setPhase(phase, say);
    await this.wait(ms, { who: () => [], done: () => false, abandoned: () => this.hatQueue.length === 0 || !this.player(explainer.id)?.connected });
    this.hatTurn = null;

    const got = phase.kind === 'hat' ? phase.got : [];
    const gains: Record<string, number> = {};
    for (const c of got) {
      gains[c.player] = (gains[c.player] ?? 0) + HAT_GUESS_POINTS;
      gains[explainer.id] = (gains[explainer.id] ?? 0) + HAT_EXPLAIN_POINTS;
    }
    this.award(gains);
    // an ordinary turn passes without a remark, or the narrator would talk between every pair of turns
    const line =
      got.length === 0 ? this.host.decks.line('hatTurnNone', explainer.name) : got.length >= HAT_GOOD_TURN ? this.host.decks.line('hatTurnGood', explainer.name) : undefined;
    this.setPhase({ kind: 'hatReveal', explainer: explainer.id, mode, round, rounds: HAT_MODES.length, got, gains }, line);
    await this.narrated(this.dur.hatReveal, line);
  }

  /**
   * «Мафия-ТВ»: whom this player may pick right now; nobody outside the night and the vote, or once out.
   * At night every role gets the same grid, so a glance at a neighbour's phone tells nothing.
   */
  private mafiaOptions(playerId: string): string[] {
    const phase = this.phase;
    if (!this.mafiaAlive.has(playerId) || (phase.kind !== 'mafiaNight' && phase.kind !== 'mafiaVote')) return [];
    const alive = [...this.mafiaAlive];
    return phase.kind === 'mafiaNight' ? alive : alive.filter((id) => id !== playerId);
  }

  /** «Шляпа»: the explainer passes on the current word, which goes to the bottom of the hat. */
  private hatSkip(): void {
    const phase = this.phase;
    const turn = this.hatTurn;
    if (phase.kind !== 'hat' || !turn || this.hatQueue.length < 2) return;
    // a double tap would skip the word behind it before the explainer ever saw it
    const now = Date.now();
    if (now - (turn.lastAt.get(turn.explainer) ?? 0) < GUESS_COOLDOWN_MS) return;
    turn.lastAt.set(turn.explainer, now);
    this.hatQueue.push(this.hatQueue.shift()!);
    turn.close.clear();
    this.host.changed();
  }

  private hatGuess(playerId: string, raw: unknown): void {
    const phase = this.phase;
    const turn = this.hatTurn;
    const word = this.hatQueue[0];
    if (phase.kind !== 'hat' || !turn || !word || playerId === turn.explainer || !this.player(playerId)) return;
    const now = Date.now();
    if (now - (turn.lastAt.get(playerId) ?? 0) < GUESS_COOLDOWN_MS) return;
    const text = cleanGuess(raw);
    if (!text) return;
    turn.lastAt.set(playerId, now);
    const verdict = judge(text, word);
    if (verdict === 'right') {
      phase.got = [...phase.got, { word, player: playerId }];
      this.hatQueue.shift();
      phase.left = this.hatQueue.length;
      turn.close.clear();
      this.poke();
    } else {
      if (verdict === 'close') turn.close.add(playerId);
      else turn.close.delete(playerId);
      phase.feed = [...phase.feed, { player: playerId, text }].slice(-GUESS_FEED);
    }
    this.host.changed();
  }

  /** The word the «Шляпа» explainer is on; bots peek at it to guess sometimes. */
  hatSecret(): string | undefined {
    return this.hatTurn ? this.hatQueue[0] : undefined;
  }

  /** «Рынок слухов»: clues that rule answers out are spread over the phones; trade them and name the version first. */
  private async marketGame(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    const rng = this.host.rng;
    const mystery = pick(marketCases, rng);
    const truth = mystery.categories.map((c) => Math.floor(rng() * c.options.length));
    // wrong answers are dealt round the table, so the room sees every one before any repeats
    const decks = mystery.categories.map((c, k) => shuffle(c.options.map((_, i) => i).filter((i) => i !== truth[k]), rng));
    const order = shuffle(players, rng).map((p) => p.id);
    const clues = new Map(order.map((id, seat) => [id, decks.map((d) => d[seat % d.length]!)]));
    const chat = new Chat(order, { limit: MARKET_MESSAGES });
    this.market = { chat, case: mystery, truth, clues, guesses: new Map() };

    const intro = `${this.host.decks.line('marketIntro')} ${mystery.title}`;
    const ms = this.dur.marketChat + this.speech(intro);
    this.setPhase(
      { kind: 'market', title: mystery.title, categories: mystery.categories, deadline: Date.now() + ms, flights: chat.flights, sent: 0, solved: [] },
      intro,
    );
    const guesses = this.market.guesses;
    await this.wait(ms, { who: () => this.active().filter((p) => clues.has(p.id)), done: (p) => guesses.has(p.id) });

    const solved = [...guesses.keys()];
    const right = solved.filter((id) => guesses.get(id)!.every((g, k) => g === truth[k]));
    const gains: Record<string, number> = {};
    for (const [id, guess] of guesses) {
      const rank = right.indexOf(id);
      gains[id] = rank >= 0 ? MARKET_FULL_POINTS + (MARKET_RANK_POINTS[rank] ?? 0) : guess.filter((g, k) => g === truth[k]).length * MARKET_PART_POINTS;
    }
    this.award(gains);
    this.market = null;
    const line = right[0] ? this.host.decks.line('marketFirst', this.name(right[0])) : this.host.decks.line('marketCold');
    const answer = mystery.categories.map((c, k) => c.options[truth[k]!]).join(', ');
    const say = `${line} Ответ: ${answer}.`;
    this.setPhase(
      { kind: 'marketReveal', title: mystery.title, categories: mystery.categories, truth, guesses: Object.fromEntries(guesses), solved, gains },
      say,
    );
    await this.narrated(this.dur.marketReveal, say);
  }

  /** «Волна»: one player sees a secret point on a scale and names something there; the rest aim for it. */
  private async waveGame(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    const rng = this.host.rng;
    const scales = shuffle(spectra, rng);
    const psychics = shuffle(players, rng).slice(0, WAVE_ROUNDS);
    for (const [i, psychic] of psychics.entries()) {
      if (!this.active().some((p) => p.id === psychic.id)) continue;
      const spectrum = scales[i % scales.length]!;
      const { left, right } = spectrum;
      // kept off the very ends, where a hint like «лёд» would make it too easy
      const target = 5 + Math.floor(rng() * (WAVE_MAX - 9));
      this.wave = { spectrum, target, psychic: psychic.id };
      const round = { round: i + 1, rounds: psychics.length };
      const say = `${i === 0 ? `${this.host.decks.line('waveIntro')} ` : ''}${this.host.decks.line('waveHint', psychic.name)} Шкала: ${left} — ${right}.`;
      const hintMs = this.dur.waveHint + this.speech(say);
      this.setPhase({ kind: 'waveHint', left, right, psychic: psychic.id, ...round, deadline: Date.now() + hintMs }, say);
      await this.wait(hintMs, { who: () => this.active().filter((p) => p.id === psychic.id), done: (p) => this.answers.has(p.id) });

      const written = this.answers.get(psychic.id);
      const hint = typeof written === 'string' ? written : nearestSample(spectrum, target);
      const ask = `Подсказка: ${hint}. Где это на шкале?`;
      const guessMs = this.dur.waveGuess + this.speech(ask);
      const guessers = () => this.active().filter((p) => p.id !== psychic.id);
      this.setPhase({ kind: 'waveGuess', left, right, psychic: psychic.id, hint, ...round, deadline: Date.now() + guessMs, answered: [] }, ask);
      await this.wait(guessMs, { who: guessers, done: (p) => this.answers.has(p.id) });

      const guesses: Record<string, number> = {};
      for (const [id, value] of this.answers) if (typeof value === 'number') guesses[id] = value;
      const gains: Record<string, number> = {};
      for (const [id, value] of Object.entries(guesses)) {
        const points = wavePoints(value, target);
        if (points > 0) gains[id] = points;
      }
      const earned = Object.values(guesses).map((g) => wavePoints(g, target));
      // the hint-giver earns what an average guesser did, so a clear hint pays and a cryptic one does not
      if (earned.length > 0) gains[psychic.id] = Math.round(earned.reduce((a, b) => a + b, 0) / earned.length / 10) * 10;
      this.award(gains);
      const best = Object.entries(guesses).sort((a, b) => Math.abs(a[1] - target) - Math.abs(b[1] - target))[0];
      const line = best && wavePoints(best[1], target) > 0 ? this.host.decks.line('waveWin', this.name(best[0])) : this.host.decks.line('waveMiss');
      this.setPhase({ kind: 'waveReveal', left, right, psychic: psychic.id, hint, target, guesses, gains }, line);
      await this.narrated(this.dur.waveReveal, line);
    }
    this.wave = null;
  }

  /** What a bot playing «Волна» knows: the scale, and the secret point when it is the hint-giver. */
  waveSecret(playerId: string): { spectrum: Spectrum; target?: number } | null {
    if (!this.wave) return null;
    return { spectrum: this.wave.spectrum, target: this.wave.psychic === playerId ? this.wave.target : undefined };
  }

  /** «По порядку»: secret numbers, a thing named for each, then everyone sorts the things. */
  private async orderGame(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    const rng = this.host.rng;
    const spectrum = pick(spectra, rng);
    const { left, right } = spectrum;
    const pool = shuffle(
      Array.from({ length: ORDER_MAX }, (_, i) => i + 1),
      rng,
    );
    const numbers = new Map(players.map((p, i) => [p.id, pool[i]!]));
    this.order = { spectrum, numbers };
    const seated = () => this.active().filter((p) => numbers.has(p.id));

    const say = `${this.host.decks.line('orderIntro')} Шкала: ${left} — ${right}.`;
    const writeMs = this.dur.orderWrite + this.speech(say);
    const writing: Phase = { kind: 'orderWrite', left, right, deadline: Date.now() + writeMs, done: [] };
    this.setPhase(writing, say);
    await this.wait(writeMs, { who: seated, done: (p) => writing.done.includes(p.id) });

    const taken = new Set<string>();
    const texts = new Map<string, string>();
    for (const [id, number] of numbers) {
      const written = this.answers.get(id);
      const text = typeof written === 'string' ? written : nearestSample(spectrum, number, taken);
      taken.add(text);
      texts.set(id, text);
    }
    const cards = shuffle(
      [...texts].map(([player, text]) => ({ player, text })),
      rng,
    );
    const ask = this.host.decks.line('orderSort');
    const sortMs = this.dur.orderSort + this.speech(ask);
    const sorting: Phase = { kind: 'orderSort', left, right, cards, deadline: Date.now() + sortMs, done: [] };
    this.setPhase(sorting, ask);
    await this.wait(sortMs, { who: seated, done: (p) => sorting.done.includes(p.id) });

    const truth = [...numbers].sort((a, b) => a[1] - b[1]).map(([id]) => id);
    const exact = new Map<string, number>();
    const gains: Record<string, number> = {};
    let perfect: string[] = [];
    for (const [id, value] of this.answers) {
      if (!Array.isArray(value)) continue;
      const order = value as string[];
      const accuracy = orderAccuracy(order, numbers);
      if (accuracy === 1) perfect.push(id);
      const points = Math.round((accuracy * ORDER_POINTS) / 10) * 10;
      if (points > 0) gains[id] = points;
      order.forEach((card, place) => {
        if (card !== id && truth[place] === card) exact.set(card, (exact.get(card) ?? 0) + 1);
      });
    }
    for (const [card, n] of exact) gains[card] = (gains[card] ?? 0) + n * ORDER_EXACT_POINTS;
    this.award(gains);
    this.order = null;
    perfect = perfect.map((id) => this.name(id));
    const line = perfect.length > 0 ? this.host.decks.line('orderPerfect', joinNames(perfect)) : this.host.decks.line('orderClose');
    this.setPhase(
      {
        kind: 'orderReveal',
        left,
        right,
        cards: truth.map((id) => ({ player: id, text: texts.get(id)!, number: numbers.get(id)!, exact: exact.get(id) ?? 0 })),
        gains,
      },
      line,
    );
    await this.narrated(this.dur.orderReveal, line);
  }

  /** What a bot playing «По порядку» knows: the scale and its own number. */
  orderSecret(playerId: string): { spectrum: Spectrum; number: number } | null {
    const number = this.order?.numbers.get(playerId);
    return this.order && number !== undefined ? { spectrum: this.order.spectrum, number } : null;
  }

  /** «Замри!»: dance with a finger while the music plays, keep it off the screen when it stops. */
  private async freezeGame(): Promise<void> {
    const rng = this.host.rng;
    const say = this.host.decks.line('freezeIntro');
    const readyMs = this.dur.freezeReady + this.speech(say);
    const phase: Phase = { kind: 'freeze', stage: 'ready', round: 0, rounds: FREEZE_ROUNDS, alive: this.active().map((p) => p.id), out: [], deadline: Date.now() + readyMs };
    this.setPhase(phase, say);
    await this.wait(readyMs);

    const gains: Record<string, number> = {};
    // once only bots are left the rest is dice rolls nobody wants to watch
    const people = () => phase.alive.some((id) => !this.player(id)?.bot);
    for (let round = 1; round <= FREEZE_ROUNDS && phase.alive.length > 1 && people(); round++) {
      // songs of uneven length, so nobody can count the beats to the stop
      const musicMs = Math.round(this.dur.freezeHold * (1.2 + rng() * 1.3));
      this.freeze = { round, musicMs, holdFrom: 0, dance: new Map(), moved: new Set() };
      Object.assign(phase, { stage: 'music', round, deadline: Date.now() + musicMs });
      this.host.changed();
      await this.wait(musicMs);

      this.freeze.holdFrom = Date.now();
      Object.assign(phase, { stage: 'freeze', deadline: Date.now() + this.dur.freezeHold });
      this.host.changed();
      await this.wait(this.dur.freezeHold);

      const { dance, moved } = this.freeze;
      const fault = (id: string): FreezeFault | null => {
        const p = this.player(id);
        if (!p?.connected) return 'lazy';
        if (p.bot) return rng() < FREEZE_BOT_SLIP ? 'moved' : null;
        if (moved.has(id)) return 'moved';
        return (dance.get(id) ?? 0) < musicMs * FREEZE_DANCE_SHARE ? 'lazy' : null;
      };
      const caught = phase.alive.flatMap((id) => {
        const why = fault(id);
        return why ? [{ player: id, round, why }] : [];
      });
      phase.out.push(...caught);
      phase.alive = phase.alive.filter((id) => !caught.some((c) => c.player === id));
      // paid every pause rather than at the end, so the score rail ticks up while the game runs
      this.award(Object.fromEntries(phase.alive.map((id) => [id, FREEZE_SURVIVE_POINTS])));
      for (const id of phase.alive) gains[id] = (gains[id] ?? 0) + FREEZE_SURVIVE_POINTS;
      this.host.changed();
    }
    this.freeze = null;
    for (const id of phase.alive) gains[id] = (gains[id] ?? 0) + FREEZE_WIN_POINTS;
    this.award(Object.fromEntries(phase.alive.map((id) => [id, FREEZE_WIN_POINTS])));
    const line = phase.alive.length > 0 ? this.host.decks.line('freezeWin', joinNames(phase.alive.map((id) => this.name(id)))) : this.host.decks.line('freezeNone');
    this.setPhase({ kind: 'freezeReveal', survivors: phase.alive, out: phase.out, gains }, line);
    await this.narrated(this.dur.freezeReveal, line);
  }

  /** The «Рынок слухов» case as bots see it: the questions, their own clues and what they were told. */
  marketView(playerId: string): { categories: MarketCase['categories']; clues: number[] } | null {
    const clues = this.market?.clues.get(playerId);
    return this.market && clues ? { categories: this.market.case.categories, clues } : null;
  }

  /** «Маскарад»: an anonymous group chat under animal masks, then everyone matches people to masks. */
  private async masqGame(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    const rng = this.host.rng;
    const owners = shuffle(players, rng)
      .slice(0, MASKS.length)
      .map((p) => p.id);
    const chat = new Chat(owners, { groups: [{ id: MASQ_THREAD, title: '🎭 Маскарад', members: owners }], limit: MASQ_MESSAGES });
    this.masq = { chat, owners };
    const topics = shuffle(masqTopics, rng).slice(0, MASQ_TOPICS);

    const intro = this.host.decks.line('masqIntro');
    const ms = this.dur.masqChat + this.speech(intro);
    const phase: Phase = { kind: 'masq', deadline: Date.now() + ms, prompt: topics[0]!.prompt, feed: [], masks: owners.length };
    this.setPhase(phase, intro);
    // a fresh topic now and then keeps a quiet room talking
    topics.slice(1).forEach((topic, i) =>
      this.after(((i + 1) * ms) / topics.length, () => {
        phase.prompt = topic.prompt;
        this.say = `Новая тема: ${topic.prompt}`;
        this.host.changed();
      }),
    );
    await this.wait(ms);

    const ask = this.host.decks.line('masqGuess');
    const guessMs = this.dur.masqGuess + this.speech(ask);
    this.setPhase({ kind: 'masqGuess', deadline: Date.now() + guessMs, masks: owners.length, voted: [] }, ask);
    await this.wait(guessMs, { who: () => this.active().filter((p) => owners.includes(p.id)), done: (p) => this.answers.has(p.id) });

    const guesses: Record<string, (string | null)[]> = {};
    for (const id of owners) {
      const guess = this.answers.get(id);
      if (Array.isArray(guess)) guesses[id] = guess as (string | null)[];
    }
    const gains: Record<string, number> = {};
    const hidden = new Map<string, number>();
    for (const [guesser, guess] of Object.entries(guesses)) {
      const right = guess.filter((g, i) => g !== null && g === owners[i]).length;
      if (right > 0) gains[guesser] = right * MASQ_SPOT_POINTS;
    }
    owners.forEach((owner, i) => {
      if (chat.by(owner).length < MASQ_HIDE_MIN_MESSAGES) return;
      const fooled = Object.entries(guesses).filter(([guesser, guess]) => guesser !== owner && guess[i] !== owner).length;
      if (fooled === 0) return;
      hidden.set(owner, fooled);
      gains[owner] = (gains[owner] ?? 0) + fooled * MASQ_HIDE_POINTS;
    });
    this.award(gains);
    this.masq = null;

    const best = [...hidden].sort((a, b) => b[1] - a[1])[0];
    const line = best ? this.host.decks.line('masqReveal', this.name(best[0])) : 'Маски долой! Посмотрим, кто был кем.';
    this.setPhase({ kind: 'masqReveal', owners, guesses, gains }, line);
    await this.narrated(this.dur.masqReveal, line);
  }

  /** The masquerade chat as `playerId` sees it: everyone else signs with `mask:<index>`. */
  private masqChats(playerId: string): ChatThread[] {
    const masq = this.masq;
    if (!masq) return [];
    return masq.chat.view(playerId).map((t) => ({
      ...t,
      messages: t.messages.map((m) => (m.from === playerId ? m : { ...m, from: `mask:${masq.owners.indexOf(m.from)}` })),
    }));
  }

  /** «Сарафанное радио»: rumours go round the room, each retold from memory by the next player. */
  private async radioGame(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    const rng = this.host.rng;
    const order = shuffle(players, rng).map((p) => p.id);
    const chains = shuffle(radioRumours, rng)
      .slice(0, order.length)
      .map((text) => [{ author: null as string | null, text }]);
    const steps = Math.min(order.length, RADIO_STEPS_MAX);
    this.radio = { chains, order, step: 0 };

    for (let step = 0; step < steps; step++) {
      this.radio.step = step;
      const say = step === 0 ? this.host.decks.line('radioIntro') : 'Передаём слухи дальше!';
      const ms = this.dur.radioWrite + this.speech(say);
      this.setPhase({ kind: 'radio', step: step + 1, steps, deadline: Date.now() + ms, done: [] }, say);
      await this.wait(ms, { who: () => this.active().filter((p) => order.includes(p.id)), done: (p) => this.answers.has(p.id) });
      for (const id of order) {
        const text = this.answers.get(id);
        if (typeof text === 'string') this.radioChain(id)!.push({ author: id, text });
      }
    }

    for (const [index, chain] of chains.entries()) {
      const say =
        chain.length > 1 ? `Было: «${chain[0]!.text}». Стало: «${chain.at(-1)!.text}».` : `Этот слух никто не подхватил: «${chain[0]!.text}».`;
      this.setPhase({ kind: 'radioShow', index, total: chains.length, chain }, say);
      await this.narrated(this.dur.radioShow, say);
    }

    const finals = chains.map((c) => c.at(-1)!.text);
    const ask = this.host.decks.line('radioVote');
    const voteMs = this.dur.radioVote + this.speech(ask);
    this.setPhase({ kind: 'radioVote', deadline: Date.now() + voteMs, finals, voted: [] }, ask);
    await this.wait(voteMs, { who: () => this.active().filter((p) => order.includes(p.id)), done: (p) => this.answers.has(p.id) });

    const tally = finals.map(() => 0);
    for (const value of this.answers.values()) if (typeof value === 'number') tally[value]!++;
    const gains: Record<string, number> = {};
    chains.forEach((chain, i) => {
      const final = chain.at(-1)!.author;
      if (tally[i] === 0 || final === null) return;
      gains[final] = (gains[final] ?? 0) + tally[i]! * RADIO_VOTE_POINTS;
      for (const id of new Set(chain.map((c) => c.author))) {
        if (id !== null && id !== final) gains[id] = (gains[id] ?? 0) + tally[i]! * RADIO_CHAIN_POINTS;
      }
    });
    this.award(gains);
    const top = Math.max(...tally);
    const line = top > 0 ? `Лучший слух: «${finals[tally.indexOf(top)]}»!` : 'Голосов нет — слухи так и остались слухами.';
    this.radio = null;
    this.setPhase({ kind: 'radioReveal', finals, authors: chains.map((c) => c.at(-1)!.author), tally, gains }, line);
    await this.narrated(this.dur.radioReveal, line);
  }

  /** The chain `playerId` retells at the current step; null when they sit this game out. */
  private radioChain(playerId: string): { author: string | null; text: string }[] | null {
    const radio = this.radio;
    const seat = radio?.order.indexOf(playerId) ?? -1;
    if (!radio || seat < 0) return null;
    const n = radio.order.length;
    return radio.chains[(seat - radio.step + n) % n]!;
  }

  /** Which chains end in `playerId`'s own words, so their vote cannot go there. */
  private radioMine(playerId: string): number[] {
    return (this.radio?.chains ?? []).flatMap((c, i) => (c.at(-1)!.author === playerId ? [i] : []));
  }

  /** The «Маскарад» talking point a bot answers right now; null outside the chat. */
  masqTopic(): { prompt: string; bot: string[] } | null {
    const phase = this.phase;
    return phase.kind === 'masq' ? (masqTopics.find((t) => t.prompt === phase.prompt) ?? null) : null;
  }

  /** The «Заговор» secret word and its lures, for bot players; null outside the game. */
  plotSecret(): PlotWord | null {
    return this.plot?.word ?? null;
  }

  private async spy(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    // a bot spy cannot bluff out loud, so a person gets the part whenever there is one
    const humans = players.filter((p) => !p.bot);
    const spy = pick(humans.length > 0 ? humans : players, this.host.rng);
    const place = this.host.decks.spy.draw();
    this.spyId = spy.id;
    this.spyPlace = place;
    const options = players.map((p) => p.id);
    const intro = this.host.decks.line('spyIntro');
    this.setPhase({ kind: 'spy', deadline: Date.now() + this.dur.spyTalk + this.speech(intro), options, voted: [] }, intro);
    await this.wait(this.dur.spyTalk + this.speech(intro), {
      who: () => this.active().filter((p) => options.includes(p.id)),
      done: (p) => this.answers.has(p.id),
    });

    const votes = this.stringAnswers();
    const tally = new Map<string, number>();
    for (const to of Object.values(votes)) tally.set(to, (tally.get(to) ?? 0) + 1);
    const top = Math.max(0, ...tally.values());
    const leaders = [...tally].filter(([, n]) => n === top).map(([id]) => id);
    const accused = top > 0 && leaders.length === 1 ? leaders[0]! : null;
    const caught = accused === spy.id;

    let guessed: boolean | null = null;
    if (caught && spy.connected) {
      const decoys = shuffle(
        spyPlaces.filter((p) => p !== place),
        this.host.rng,
      ).slice(0, SPY_GUESS_OPTIONS - 1);
      const choices = shuffle([place, ...decoys], this.host.rng);
      const say = this.host.decks.line('spyCornered', spy.name);
      this.setPhase({ kind: 'spyGuess', spy: spy.id, options: choices, deadline: Date.now() + this.dur.spyGuess + this.speech(say) }, say);
      await this.wait(this.dur.spyGuess + this.speech(say), {
        who: () => (spy.connected ? [spy] : []),
        done: (p) => this.answers.has(p.id),
      });
      guessed = this.answers.get(spy.id) === place;
    }

    const gains: Record<string, number> = {};
    const catchers = Object.keys(votes).filter((id) => votes[id] === spy.id && id !== spy.id);
    if (!caught) gains[spy.id] = SPY_ESCAPE_POINTS;
    else {
      if (guessed) gains[spy.id] = SPY_SAVE_POINTS;
      for (const id of catchers) gains[id] = guessed ? SPY_CATCH_POINTS / 2 : SPY_CATCH_POINTS;
    }
    this.award(gains);
    this.spyId = null;
    const line = !caught ? 'spyEscaped' : guessed ? 'spyGuessed' : 'spyCaught';
    const say = `${this.host.decks.line(line, spy.name)} Место — «${place}».`;
    this.setPhase(
      {
        kind: 'spyReveal',
        spy: spy.id,
        place,
        accused,
        caught,
        guessed,
        votes: Object.entries(votes).map(([from, to]) => ({ from, to })),
        gains,
      },
      say,
    );
    await this.narrated(this.dur.spyReveal, say);
  }

  private async clue(): Promise<void> {
    const players = this.active();
    if (players.length < 3) return this.vote(false);
    // a set per writer, so no two secret words compete among the same four options
    this.clueSecrets = new Map(
      players.map((p) => {
        const set = this.host.decks.clue.draw();
        const i = Math.floor(this.host.rng() * set.words.length);
        return [p.id, { word: set.words[i]!, options: [...set.words], bot: set.clues[i]! }] as const;
      }),
    );
    this.setPhase(
      { kind: 'write', prompt: '', deadline: Date.now() + this.dur.clueWrite, done: [], clue: true },
      this.host.decks.line('clueIntro'),
    );
    await this.wait(this.dur.clueWrite, {
      who: () => players.filter((p) => p.connected),
      done: (p) => this.answers.has(p.id),
    });
    const written = this.stringAnswers();
    const secrets = this.clueSecrets;
    this.clueSecrets = new Map();
    const authors = shuffle(
      players.filter((p) => written[p.id]),
      this.host.rng,
    ).slice(0, CLUE_ROUNDS);

    for (const [index, author] of authors.entries()) {
      const secret = secrets.get(author.id)!;
      const clue = written[author.id]!;
      const options = shuffle(secret.options, this.host.rng);
      this.clueAnswer = secret.word;
      const ask = this.host.decks.line('clueAsk', author.name);
      this.setPhase(
        {
          kind: 'clueGuess',
          author: author.id,
          clue,
          options,
          round: index + 1,
          rounds: authors.length,
          deadline: Date.now() + this.dur.clueGuess + this.speech(ask),
          answered: [],
        },
        ask,
      );
      await this.wait(this.dur.clueGuess + this.speech(ask), {
        who: () => this.active().filter((p) => p.id !== author.id),
        done: (p) => this.answers.has(p.id),
      });

      const picks = this.stringAnswers();
      const right = Object.keys(picks).filter((id) => picks[id] === secret.word);
      const gains: Record<string, number> = {};
      for (const id of right) gains[id] = CLUE_GUESS_POINTS;
      if (right.length > 0) gains[author.id] = right.length * CLUE_AUTHOR_POINTS;
      this.award(gains);
      const guessed = Object.keys(picks).length;
      const good = right.length > 0 && right.length * 2 >= guessed;
      const say = `Загадано: «${secret.word}». ${this.host.decks.line(good ? 'clueGood' : 'clueBad', author.name)}`;
      this.setPhase({ kind: 'clueReveal', author: author.id, clue, word: secret.word, options, picks, gains }, say);
      await this.narrated(this.dur.clueReveal, say);
    }
  }

  /** The word on the guesser's forehead; bots peek at it to guess right some of the time. */
  foreheadSecret(): string | null {
    return this.foreheadWord;
  }

  /** What a bot writes for its secret word in «Три слова». */
  botClue(playerId: string): string | undefined {
    return this.clueSecrets.get(playerId)?.bot;
  }

  /** The word behind the clue being guessed; bots peek at it to be right some of the time. */
  clueWord(): string | undefined {
    const phase = this.phase;
    return phase.kind === 'clueGuess' ? this.clueAnswer : undefined;
  }

  private async treasure(): Promise<void> {
    const banked: Record<string, number> = {};
    for (let expedition = 1; expedition <= TREASURE_EXPEDITIONS; expedition++) {
      const deck = shuffle<TreasureCard>(
        [...TREASURE_GEMS.map((gems) => ({ gems })), ...TRAPS.flatMap((trap) => Array.from({ length: TREASURE_TRAP_COPIES }, () => ({ trap })))],
        this.host.rng,
      );
      const path: TreasureCard[] = [];
      let inside = this.active().map((p) => p.id);
      const carried: Record<string, number> = Object.fromEntries(inside.map((id) => [id, 0]));
      const haul: Record<string, number> = {};
      const seen = new Set<TrapId>();
      let loose = 0;
      let left: string[] = [];
      let bust: TrapId | undefined;
      let lost: string[] = [];
      const show = (stage: 'choose' | 'card', say?: string, deadline?: number) =>
        this.setPhase(
          {
            kind: 'treasure',
            stage,
            expedition,
            expeditions: TREASURE_EXPEDITIONS,
            path: [...path],
            inside: [...inside],
            left,
            carried: { ...carried },
            banked: { ...banked },
            loose,
            bust,
            deadline,
            answered: [],
          },
          say,
        );

      // two traps of every kind guarantee a bust before the deck runs dry, so the loop ends with nobody inside
      while (inside.length > 0 && deck.length > 0) {
        if (path.length > 0) {
          show('choose', this.host.decks.line('treasureDeeper'), Date.now() + this.dur.treasureChoose);
          const deciding = inside;
          await this.wait(this.dur.treasureChoose, {
            who: () => this.active().filter((p) => deciding.includes(p.id)),
            done: (p) => this.answers.has(p.id),
          });
          // silence counts as leaving: a phone that wandered off keeps what it carries
          left = inside.filter((id) => this.answers.get(id) !== 1);
          if (left.length > 0) {
            const share = Math.floor(loose / left.length);
            loose -= share * left.length;
            for (const id of left) {
              const got = carried[id]! + share;
              banked[id] = (banked[id] ?? 0) + got;
              haul[id] = got;
              delete carried[id];
            }
            inside = inside.filter((id) => !left.includes(id));
          }
          if (inside.length === 0) break;
        }

        const card = deck.pop()!;
        path.push(card);
        let say: string | undefined;
        if ('gems' in card) {
          const each = Math.floor(card.gems / inside.length);
          for (const id of inside) carried[id]! += each;
          loose += card.gems - each * inside.length;
        } else if (seen.has(card.trap)) {
          bust = card.trap;
          lost = [...inside];
          for (const id of inside) carried[id] = 0;
          say = this.host.decks.line('treasureBust');
        } else seen.add(card.trap);
        if (path.length === 1 && expedition === 1) say = this.host.decks.line('treasureIntro');
        show('card', say);
        await this.narrated(this.dur.treasureCard, say);
        left = [];
        if (bust) break;
      }

      const gains: Record<string, number> = {};
      for (const [id, gems] of Object.entries(haul)) if (gems > 0) gains[id] = gems * TREASURE_GEM_POINTS;
      this.award(gains);
      const say = bust ? 'Считаем, что удалось вынести.' : this.host.decks.line('treasureSafe');
      this.setPhase({ kind: 'treasureReveal', expedition, expeditions: TREASURE_EXPEDITIONS, haul, lost, gains }, say);
      await this.narrated(this.dur.treasureReveal, say);
    }
  }

  private async list(): Promise<void> {
    for (let round = 1; round <= LIST_ROUNDS; round++) {
      const category = this.host.decks.listCategory();
      this.listSamples = category.sample;
      const say = round === 1 ? `${this.host.decks.line('listIntro')} ${category.q}!` : `${category.q}!`;
      const ms = this.dur.listWrite + this.speech(say);
      const counts: Record<string, number> = Object.fromEntries(this.active().map((p) => [p.id, 0]));
      this.setPhase({ kind: 'list', category: category.q, round, rounds: LIST_ROUNDS, deadline: Date.now() + ms, counts }, say);
      await this.wait(ms);

      const groups = new Map<string, { text: string; by: string[] }>();
      for (const [id, value] of this.answers) {
        if (!Array.isArray(value)) continue;
        for (const text of value) {
          const key = listKey(text);
          const group = groups.get(key) ?? { text, by: [] };
          if (!group.by.includes(id)) group.by.push(id);
          groups.set(key, group);
        }
      }
      const items = [...groups.values()].sort((a, b) => b.by.length - a.by.length || a.text.localeCompare(b.text, 'ru'));
      const gains: Record<string, number> = {};
      const unique = new Map<string, number>();
      for (const item of items) {
        const alone = item.by.length === 1;
        for (const id of item.by) {
          const uniques = unique.get(id) ?? 0;
          // past the cap a «unique» answer pays like a shared one, so typing gibberish fast stops paying
          gains[id] = (gains[id] ?? 0) + (alone && uniques < LIST_UNIQUE_CAP ? LIST_UNIQUE_POINTS : LIST_SHARED_POINTS);
          if (alone) unique.set(id, uniques + 1);
        }
      }
      this.award(gains);
      const best = [...unique].sort((a, b) => b[1] - a[1])[0];
      const line = best
        ? this.host.decks.line('listUnique', this.name(best[0]))
        : items.length > 0
          ? this.host.decks.line('listSame')
          : 'Ни одного ответа? Тема оказалась слишком хитрой!';
      this.setPhase({ kind: 'listReveal', category: category.q, items, gains }, line);
      await this.narrated(this.dur.listReveal, line);
    }
    this.listSamples = [];
  }

  /** Answers a bot can type for the current «Кто больше» category. */
  listSample(): string[] {
    return this.listSamples;
  }

  private async rps(): Promise<void> {
    let alive = shuffle(
      this.active().map((p) => p.id),
      this.host.rng,
    );
    if (alive.length < 2) return this.vote(false);
    let say: string | undefined = this.host.decks.line('rpsIntro');
    while (alive.length > 1) {
      const matches: { a: string; b: string | null }[] = [];
      for (let i = 0; i < alive.length; i += 2) matches.push({ a: alive[i]!, b: alive[i + 1] ?? null });
      const winners = new Map(matches.filter((m) => m.b === null).map((m) => [m, m.a] as const));
      let pending = matches.filter((m) => m.b !== null);
      const online = (id: string | null) => id !== null && this.player(id)?.connected === true;
      for (let tries = 0; pending.length > 0; tries++) {
        // a match with somebody gone is a walkover, so nobody waits out the timer for a throw that cannot come
        const playing = pending.filter((m) => online(m.a) && online(m.b));
        if (playing.length > 0) {
          const ms = this.dur.rpsThrow + this.speech(say);
          this.setPhase(
            {
              kind: 'rps',
              matches: tries === 0 ? matches : playing,
              left: alive.length,
              replay: tries > 0,
              through: [...winners.values()],
              deadline: Date.now() + ms,
              answered: [],
            },
            say,
          );
          await this.wait(ms, {
            who: () => this.active().filter((p) => playing.some((m) => m.a === p.id || m.b === p.id)),
            done: (p) => this.answers.has(p.id),
          });
        }

        const results = pending.map((m) => {
          if (!playing.includes(m)) {
            const winner = online(m.a) ? m.a : online(m.b) ? m.b! : pick([m.a, m.b!], this.host.rng);
            winners.set(m, winner);
            return { ...m, winner, walkover: true };
          }
          const ta = this.answers.get(m.a) as RpsThrow | undefined;
          const tb = this.answers.get(m.b!) as RpsThrow | undefined;
          let winner: string | null = null;
          if (ta && !tb) winner = m.a;
          else if (tb && !ta) winner = m.b;
          else if (ta && tb && ta !== tb) winner = beats(ta, tb) ? m.a : m.b;
          const coin = !winner && (!ta || tries + 1 >= RPS_MAX_REPLAYS);
          if (coin) winner = pick([m.a, m.b!], this.host.rng);
          if (winner) winners.set(m, winner);
          return { ...m, ta, tb, winner, coin: coin || undefined };
        });
        pending = pending.filter((m) => !winners.has(m));
        const gains: Record<string, number> = {};
        for (const r of results) if (r.winner && online(r.winner)) gains[r.winner] = RPS_WIN_POINTS;
        const next = pending.length === 0 ? matches.map((m) => winners.get(m)!) : [];
        const champion = next.length === 1 ? next[0] : undefined;
        if (champion && online(champion)) gains[champion] = (gains[champion] ?? 0) + RPS_CHAMPION_POINTS;
        this.award(gains);
        const line = champion
          ? this.host.decks.line('rpsChampion', this.name(champion))
          : pending.length > 0
            ? this.host.decks.line('rpsTie')
            : undefined;
        this.setPhase({ kind: 'rpsReveal', matches: results, left: alive.length, champion, gains }, line);
        await this.narrated(this.dur.rpsReveal, line);
        if (pending.length === 0) alive = next;
        say = undefined;
      }
    }
  }

  private async emoji(): Promise<void> {
    const people = this.active();
    if (people.length < 3) return this.vote(false);
    // a cycle over a shuffled circle: everyone describes somebody else and nobody is left out
    const circle = shuffle(people, this.host.rng);
    this.emojiTargets = new Map(circle.map((p, i) => [p.id, circle[(i + 1) % circle.length]!.id]));
    const targets = this.emojiTargets;
    this.setPhase(
      { kind: 'write', prompt: 'Опишите тремя эмодзи', deadline: Date.now() + this.dur.emojiWrite, done: [], emoji: true },
      this.host.decks.line('emojiIntro'),
    );
    await this.wait(this.dur.emojiWrite, this.answering());

    const written = [...this.answers].filter((e): e is [string, string] => typeof e[1] === 'string');
    this.emojiTargets = new Map();
    for (const [author, row] of shuffle(written, this.host.rng).slice(0, EMOJI_ROUNDS)) {
      const about = targets.get(author);
      if (about) await this.emojiRound(row, author, about);
    }
    this.quoteAuthor = null;
  }

  private async emojiRound(row: string, author: string, about: string): Promise<void> {
    this.quoteAuthor = author;
    this.setPhase(
      {
        kind: 'vote',
        question: row,
        options: this.host.players().map((p) => p.id),
        allowSelf: true,
        scoring: 'majority',
        deadline: Date.now() + this.dur.voteAsk,
        answered: [],
        bonus: false,
        emoji: true,
      },
      'Про кого эти эмодзи?',
    );
    await this.wait(this.dur.voteAsk, {
      who: () => this.active().filter((p) => p.id !== author),
      done: (p) => this.answers.has(p.id),
    });

    const votes = this.stringAnswers();
    const gains: Record<string, number> = {};
    let found = 0;
    for (const [voter, pickId] of Object.entries(votes)) {
      if (pickId !== about) continue;
      gains[voter] = EMOJI_GUESS_POINTS;
      found++;
    }
    if (found > 0) gains[author] = (gains[author] ?? 0) + found * EMOJI_AUTHOR_POINTS;
    this.award(gains);
    const line = found > 0 && found * 2 >= Object.keys(votes).length ? 'emojiFound' : 'emojiHidden';
    const say = this.host.decks.line(line, this.name(about));
    this.setPhase(
      {
        kind: 'voteReveal',
        question: row,
        votes: Object.entries(votes).map(([from, to]) => ({ from, to })),
        leaders: [about],
        gains,
        author,
        about,
      },
      say,
    );
    await this.narrated(this.dur.voteReveal, say);
  }

  /** «Кто быстрее?»: a few rounds of waiting for green and slapping the phone. */
  private async reflex(): Promise<void> {
    const say = this.host.decks.line('reflexIntro');
    const best = new Map<string, number>();
    const totals: Record<string, number> = {};
    let last: { player: string; ms: number | null; early: boolean }[] = [];

    for (let round = 1; round <= REFLEX_ROUNDS; round++) {
      this.reflexEarly.clear();
      const intro = round === 1 ? say : undefined;
      const holdOn = async (stage: 'wait' | 'decoy', ms: number, say?: string): Promise<void> => {
        this.setPhase({ kind: 'reflex', round, rounds: REFLEX_ROUNDS, stage, last, tapped: [] }, say);
        await this.wait(ms);
        // setPhase forgets answers, so false starts are carried over by hand
        for (const id of this.answers.keys()) this.reflexEarly.add(id);
      };
      // a random wait, or players learn the rhythm and tap on the beat instead of the signal
      const waitMs = () => this.dur.reflexWait * (0.4 + 0.6 * this.host.rng());
      await holdOn('wait', this.speech(intro) + waitMs(), intro);
      if (round > 1 && this.host.rng() < REFLEX_DECOY_CHANCE) {
        await holdOn('decoy', this.dur.reflexDecoy);
        await holdOn('wait', waitMs() / 2);
      }

      this.setPhase({ kind: 'reflex', round, rounds: REFLEX_ROUNDS, stage: 'go', last, tapped: [] });
      this.reflexGoAt = Date.now();
      await this.wait(this.dur.reflexGo, {
        who: () => this.active().filter((p) => !this.reflexEarly.has(p.id)),
        done: (p) => this.answers.has(p.id),
      });

      const results = this.active().map((p) => {
        const ms = this.answers.get(p.id);
        const early = this.reflexEarly.has(p.id);
        return { player: p.id, ms: typeof ms === 'number' && !early ? ms : null, early };
      });
      results.sort((a, b) => (a.ms ?? Infinity) - (b.ms ?? Infinity));
      const gains: Record<string, number> = {};
      results.forEach((r, place) => {
        if (r.ms === null) return;
        gains[r.player] = REFLEX_POINTS[Math.min(place, REFLEX_POINTS.length - 1)]!;
        totals[r.player] = (totals[r.player] ?? 0) + gains[r.player]!;
        best.set(r.player, Math.min(best.get(r.player) ?? Infinity, r.ms));
      });
      if (results[0]?.ms != null) {
        const winner = this.player(results[0].player);
        if (winner) winner.stats.reflexWins++;
      }
      this.award(gains);
      last = results;
    }
    this.reflexEarly.clear();

    const fastest = Math.min(...best.values());
    const champions = [...best].filter(([, ms]) => ms === fastest).map(([id]) => this.name(id));
    const revealSay = champions.length
      ? this.host.decks.line('reflexWinner', joinNames(champions))
      : 'Никто не успел нажать вовремя! Пальцы сегодня явно торопятся.';
    this.setPhase(
      {
        kind: 'reflexReveal',
        best: Object.fromEntries(this.active().map((p) => [p.id, best.get(p.id) ?? null])),
        gains: totals,
      },
      revealSay,
    );
    await this.narrated(this.dur.reflexReveal, revealSay);
  }

  private async tilt(): Promise<void> {
    const players = this.active();
    if (players.length === 0) return;
    const arena = new Arena(
      players.map((p) => ({ id: p.id, bot: p.bot })),
      this.host.rng,
    );
    this.arena = arena;
    let teams: Record<string, 0 | 1> | undefined;
    const seatedTeams = new Set(players.map((p) => p.team));
    if (seatedTeams.size === 2 && !seatedTeams.has(undefined)) {
      teams = Object.fromEntries(players.map((p) => [p.id, p.team as 0 | 1]));
    } else if (players.length >= TEAM_MIN_PLAYERS && this.host.rng() < TEAM_CHANCE) {
      teams = Object.fromEntries(shuffle(players, this.host.rng).map((p, i) => [p.id, (i % 2) as 0 | 1]));
    }
    const say = teams
      ? 'Командный звездопад! Огненные против Ледяных. Звёзды идут в общую копилку команды!'
      : this.host.decks.line('tiltIntro');
    const countdown = this.dur.tiltCountdown + this.speech(say);
    const startsAt = Date.now() + countdown;
    this.setPhase(
      {
        kind: 'tilt',
        arena: { w: ARENA.w, h: ARENA.h },
        startsAt,
        deadline: startsAt + this.dur.tiltPlay,
        stars: Object.fromEntries(arena.stars),
        teams,
      },
      say,
    );
    const phaseId = this.phaseId;
    let last = Date.now();
    let idleSentAt = 0;
    const loop = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const phase = this.phase;
      const running = phase.kind === 'tilt' && !this.paused && now >= phase.startsAt;
      // nothing moves before the start or while paused; an occasional frame covers a TV that reconnects
      if (!running && now - idleSentAt < IDLE_ARENA_MS) return;
      if (running) arena.step(dt, now);
      else idleSentAt = now;
      const snap = arena.snapshot();
      this.host.sendArena(phaseId, snap);
      if (phase.kind === 'tilt' && snap.hits.length > 0) {
        phase.stars = Object.fromEntries(arena.stars);
        this.host.changed();
      }
    }, ARENA_TICK_MS);

    try {
      await this.wait(countdown + this.dur.tiltPlay);
    } finally {
      clearInterval(loop);
      this.arena = null;
    }

    const stars = Object.fromEntries(arena.stars);
    const gains: Record<string, number> = {};
    for (const [id, n] of arena.stars) {
      if (n > 0) gains[id] = n * STAR_POINTS;
      const p = this.player(id);
      if (p) p.stats.stars += n;
    }
    if (teams) {
      const teamStars: [number, number] = [0, 0];
      for (const [id, n] of arena.stars) teamStars[teams[id] ?? 0] += n;
      const winner = teamStars[0] === teamStars[1] ? null : teamStars[0] > teamStars[1] ? 0 : 1;
      if (winner !== null) {
        for (const [id, team] of Object.entries(teams)) if (team === winner) gains[id] = (gains[id] ?? 0) + TEAM_BONUS;
      }
      this.award(gains);
      const revealSay =
        winner === null
          ? `Ничья, ${teamStars[0]} на ${teamStars[1]}! Дружба победила.`
          : `Побеждают ${TEAM_INFO[winner].title} со счётом ${teamStars[winner]} : ${teamStars[1 - winner]}! Каждому в команде бонус.`;
      this.setPhase({ kind: 'tiltReveal', stars, gains, teams, teamStars, winner }, revealSay);
      await this.narrated(this.dur.tiltReveal, revealSay);
      return;
    }
    this.award(gains);
    const best = Math.max(0, ...arena.stars.values());
    const leaders = [...arena.stars].filter(([, n]) => n === best && best > 0).map(([id]) => this.name(id));
    const revealSay =
      leaders.length > 0
        ? this.host.decks.line('tiltWinner', joinNames(leaders))
        : 'Ни одной звезды? Космос в лёгком недоумении.';
    this.setPhase({ kind: 'tiltReveal', stars, gains }, revealSay);
    await this.narrated(this.dur.tiltReveal, revealSay);
  }

  /** «Сумо на льдине», «Квач» and «Захват»: the star arena with a melting floe, a hunter or paint instead of stars. */
  private async brawl(mode: BrawlMode): Promise<void> {
    const players = this.active();
    if (players.length < 2) return this.vote(false);
    const arena = new Arena(
      players.map((p) => ({ id: p.id, bot: p.bot })),
      this.host.rng,
      mode,
      this.dur.brawlPlay / 1000,
    );
    this.arena = arena;
    const say = this.host.decks.line(`${mode}Intro`, mode === 'tag' ? this.name(arena.it ?? '') : undefined);
    const countdown = this.dur.tiltCountdown + this.speech(say);
    const startsAt = Date.now() + countdown;
    const phase: Phase = {
      kind: 'tilt',
      mode,
      arena: { w: ARENA.w, h: ARENA.h },
      startsAt,
      deadline: startsAt + this.dur.brawlPlay,
      stars: {},
      out: [],
      it: arena.it ?? undefined,
      painters: mode === 'paint' ? players.map((p) => p.id) : undefined,
    };
    this.setPhase(phase, say);
    const phaseId = this.phaseId;
    let last = Date.now();
    let idleSentAt = 0;
    const loop = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const running = this.phase === phase && !this.paused && phase.kind === 'tilt' && now >= phase.startsAt;
      if (!running && now - idleSentAt < IDLE_ARENA_MS) return;
      if (running) arena.step(dt, now);
      else idleSentAt = now;
      this.host.sendArena(phaseId, arena.snapshot());
      // phones show «you are it» or «you fell», so a change of either is worth a full update
      const fallen = arena.fallen();
      if (fallen.length !== phase.out!.length || (arena.it ?? undefined) !== phase.it) {
        phase.out = fallen;
        phase.it = arena.it ?? undefined;
        this.host.changed();
        this.poke();
      }
    }, ARENA_TICK_MS);
    try {
      await this.wait(countdown + this.dur.brawlPlay, { who: () => [], done: () => false, abandoned: () => mode === 'sumo' && arena.standing().length <= 1 });
    } finally {
      clearInterval(loop);
      this.arena = null;
    }

    const gains: Record<string, number> = {};
    let ranking: { player: string; place: number; seconds: number; knockouts: number; area?: number }[];
    if (mode === 'sumo') {
      const standing = arena.standing();
      const fallen = arena.fallen().reverse();
      ranking = [...standing.map((id) => ({ id, place: 1 })), ...fallen.map((id, i) => ({ id, place: standing.length + i + 1 }))].map(({ id, place }) => ({
        player: id,
        place,
        seconds: 0,
        knockouts: arena.knockouts.get(id) ?? 0,
      }));
      for (const r of ranking) {
        const points = (SUMO_POINTS[r.place - 1] ?? 0) + r.knockouts * SUMO_KO_POINTS;
        if (points > 0) gains[r.player] = points;
      }
    } else if (mode === 'paint') {
      const cells = PAINT.cols * PAINT.rows;
      const sorted = [...arena.painted()].map(([id, n]) => ({ id, area: Math.round((n / cells) * 100) })).sort((a, b) => b.area - a.area);
      for (const r of sorted) {
        const first = r.area > 0 && r.area === sorted[0]!.area;
        const points = r.area * PAINT_POINTS_PER_PERCENT + (first ? PAINT_WIN_BONUS : 0);
        if (points > 0) gains[r.id] = points;
      }
      ranking = sorted.map((r) => ({ player: r.id, place: sorted.findIndex((o) => o.area === r.area) + 1, seconds: 0, knockouts: 0, area: r.area }));
    } else {
      const sorted = [...arena.free].map(([id, sec]) => ({ id, seconds: Math.round(sec) })).sort((a, b) => b.seconds - a.seconds);
      ranking = sorted.map((r) => ({ player: r.id, place: sorted.findIndex((o) => o.seconds === r.seconds) + 1, seconds: r.seconds, knockouts: 0 }));
      for (const r of ranking) if (r.seconds > 0) gains[r.player] = r.seconds * TAG_POINTS_PER_SECOND;
    }
    this.award(gains);
    const winners = ranking.filter((r) => r.place === 1).map((r) => this.name(r.player));
    const line = this.host.decks.line(`${mode}Win`, joinNames(winners));
    this.setPhase({ kind: 'brawlReveal', mode, ranking, gains }, line);
    await this.narrated(this.dur.brawlReveal, line);
  }

  /** «Перетягивание каната»: two teams tap; a team's pull is its taps per member, so sizes need not match. */
  private async tug(): Promise<void> {
    const players = this.active();
    if (players.length < 2) return this.vote(false);
    const seated = new Set(players.map((p) => p.team));
    const teams: Record<string, 0 | 1> =
      seated.size === 2 && !seated.has(undefined)
        ? Object.fromEntries(players.map((p) => [p.id, p.team as 0 | 1]))
        : Object.fromEntries(
            [...shuffle(players.filter((p) => !p.bot), this.host.rng), ...shuffle(players.filter((p) => p.bot), this.host.rng)].map((p, i) => [p.id, (i % 2) as 0 | 1]),
          );
    const say = this.host.decks.line('tugIntro');
    const countdown = this.dur.tugCountdown + this.speech(say);
    const startsAt = Date.now() + countdown;
    const counts: Record<string, number> = Object.fromEntries(players.map((p) => [p.id, 0]));
    this.tugWinner = null;
    this.setPhase({ kind: 'tug', teams, startsAt, deadline: startsAt + this.dur.tugPlay, counts, gap: TUG_GAP }, say);
    await this.wait(countdown + this.dur.tugPlay + this.dur.grace, { who: () => [], done: () => false, abandoned: () => this.tugWinner !== null });

    const lead = tugLead(teams, counts);
    const winner = this.tugWinner ?? (lead === 0 ? null : lead > 0 ? 0 : 1);
    const gains: Record<string, number> = {};
    if (winner !== null) for (const [id, team] of Object.entries(teams)) if (team === winner) gains[id] = TUG_WIN_POINTS;
    const strongest = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (strongest && strongest[1] > 0) gains[strongest[0]] = (gains[strongest[0]] ?? 0) + TUG_STRONGEST_POINTS;
    this.award(gains);
    const line = winner === null ? 'Канат не сдвинулся ни на сантиметр — ничья!' : this.host.decks.line('tugWin', TEAM_INFO[winner].title);
    this.setPhase({ kind: 'tugReveal', teams, counts: { ...counts }, winner, gains }, line);
    await this.narrated(this.dur.tugReveal, line);
  }

  tiltInput(playerId: string, phaseId: number, x: unknown, y: unknown): void {
    if (phaseId !== this.phaseId || this.phase.kind !== 'tilt' || !this.arena) return;
    if (typeof x !== 'number' || typeof y !== 'number') return;
    this.arena.input(playerId, x, y, Date.now());
  }

  /** Shows the items, takes the votes and returns the points it handed out. */
  private async gallery(prompt: string, items: GalleryItem[], stat: 'art' | 'photo', after?: string, original?: PictureRef): Promise<Record<string, number>> {
    if (items.length === 0) {
      const say = 'Хм, никто ничего не прислал. Сделаем вид, что это был концептуальный перформанс.';
      this.setPhase(
        { kind: 'galleryReveal', prompt, items, votes: {}, winners: [], gains: {}, original },
        say,
      );
      await this.narrated(this.dur.galleryReveal, say);
      return {};
    }

    const intro = this.host.decks.line('galleryIntro');
    const show = items.length * this.dur.galleryPerItem + this.speech(intro);
    const voting = items.length > 1 ? this.dur.galleryVote : 0;
    const showFrom = Date.now();
    const votingFrom = showFrom + show;
    this.setPhase(
      { kind: 'gallery', prompt, items, showFrom, votingFrom, deadline: votingFrom + voting, voted: [], original },
      intro,
    );
    await this.wait(show + voting, {
      who: () => this.galleryVoters(items),
      done: (p) => this.answers.has(p.id),
      open: () => this.phase.kind === 'gallery' && Date.now() >= this.phase.votingFrom,
    });

    const ballots = this.stringAnswers();
    const crowd = this.crowdPick();
    const result = scoreGallery(items, ballots);
    // the stats feed the final's titles, which should not lean on a round's twist
    for (const [id, points] of Object.entries(result.gains)) {
      const p = this.player(id);
      if (p) p.stats[stat] += points / 100;
    }
    this.award(result.gains);
    const winners = items.filter((i) => result.winners.includes(i.id));
    this.highlights.push(...(winners.length > 0 ? winners.slice(0, 2) : items.slice(0, 1)));
    const winnerNames = [...new Set(winners.flatMap((i) => i.authors))].map((id) => this.name(id));
    const verdict =
      winnerNames.length > 0
        ? this.host.decks.line('galleryWinner', joinNames(winnerNames))
        : 'Все работы прекрасны, и это не обсуждается!';
    const say = after ? `${verdict} ${after}` : verdict;
    this.setPhase(
      {
        kind: 'galleryReveal',
        prompt,
        items,
        votes: result.votes,
        winners: result.winners,
        gains: result.gains,
        original,
        crowd,
      },
      say,
    );
    await this.narrated(this.dur.galleryReveal, say);
    return result.gains;
  }

  private rows() {
    return rank(
      this.host.players().map((p) => ({ id: p.id, score: p.score, delta: this.deltas.get(p.id) ?? 0 })),
    );
  }

  /** The standings after `played` of `total` rounds, with the narrator's take on the race and what comes next. */
  private async scores(played: number, total: number): Promise<void> {
    const rows = this.rows();
    const top = rows[0]?.score ?? 0;
    const leaders = rows.filter((r) => r.place === 1).map((r) => r.player);
    const lines: string[] = [];
    if (this.coop) {
      lines.push(`Вместе у вас уже ${this.teamTotals()[0] ?? 0} очков.`);
      const trend = this.coopTrend();
      if (trend) lines.push(this.host.decks.line(trend));
    } else if (top === 0) lines.push('Пока у всех по нулям — самое интересное впереди!');
    else if (leaders.length > 1) lines.push(this.host.decks.line('leadersTied'));
    else if (this.scoreLeader === undefined) lines.push(this.host.decks.line('scores', this.name(leaders[0]!)));
    else lines.push(this.host.decks.line(leaders[0] === this.scoreLeader ? 'leaderKeeps' : 'leaderNew', this.name(leaders[0]!)));
    this.scoreLeader = leaders.length === 1 ? leaders[0] : undefined;

    // cheering up the last place works once per person; every round would turn it into mockery
    const last = rows.at(-1);
    if (!this.coop && last && rows.length >= 3 && top >= FAR_BEHIND_MIN && last.score * 10 < top * FAR_BEHIND_SHARE && !this.cheered.has(last.player)) {
      this.cheered.add(last.player);
      lines.push(this.host.decks.line('farBehind', this.name(last.player)));
    }
    if (played === total - 1) {
      const close = !this.coop && rows.length >= 2 && top - rows[1]!.score <= Math.max(CLOSE_RACE_MIN, top * CLOSE_RACE_SHARE);
      lines.push(this.host.decks.line(close ? 'lastRoundClose' : 'lastRound'));
    } else if (total >= 4 && played === Math.floor(total / 2)) lines.push(this.host.decks.line('halfway'));
    const say = lines.join(' ');
    this.setPhase({ kind: 'scores', rows }, say);
    this.deltas.clear();
    await this.narrated(this.dur.scores, say);
  }

  private report(event: MissionEvent): void {
    // a phone shows its mission ticking off right away; the TV keeps it secret until the end
    if (this.missions && this.missions.report(event).length > 0) this.host.changed();
  }

  /** A player's secret mission, when the party has them. */
  mission(playerId: string): MissionView | undefined {
    return this.missions?.view(playerId);
  }

  private async missionsReveal(): Promise<void> {
    if (!this.missions) return;
    const results = this.missions.close().filter((r) => this.player(r.player));
    const gains = Object.fromEntries(results.filter((r) => r.done).map((r) => [r.player, MISSION_POINTS]));
    this.award(gains);
    const done = results.filter((r) => r.done).map((r) => this.name(r.player));
    const say =
      done.length === 0
        ? 'А теперь раскроем тайные миссии! Увы, ни одна не выполнена. Но попытки были отличные!'
        : `А теперь раскроем тайные миссии! Справились: ${joinNames(done)}. Плюс ${MISSION_POINTS} очков!`;
    this.setPhase({ kind: 'missions', results, gains }, say);
    await this.narrated(this.dur.missions, say);
  }

  /**
   * Points per team, by team index, as if every team were as big as the biggest; empty when nobody
   * plays in teams. Five players split 3 to 2, and a plain sum would hand the win to headcount.
   * The TV and phones count the same way in client/src/common/teams.ts.
   */
  private teamTotals(): number[] {
    const sums: number[] = [];
    const sizes: number[] = [];
    for (const p of this.host.players()) {
      if (p.team === undefined) continue;
      sums[p.team] = (sums[p.team] ?? 0) + p.score;
      sizes[p.team] = (sizes[p.team] ?? 0) + 1;
    }
    const biggest = Math.max(0, ...sizes.filter((n) => n !== undefined));
    return sums.map((s, t) => Math.round((s * biggest) / sizes[t]!));
  }

  private final(): void {
    const team = this.teamTotals();
    const total = team[0] ?? 0;
    // a pair played for one shared score, so the podium has a single step they share
    const rows = this.coop ? this.rows().map((r) => ({ ...r, score: total, place: 1 })) : this.rows();
    const players = this.host.players();
    const awards = buildAwards(players, this.host.rng);
    const winners = rows.filter((r) => r.place === 1).map((r) => this.name(r.player));
    const lead = (team[0] ?? 0) - (team[1] ?? 0);
    const say = this.coop
      ? `Игра окончена! Вместе — ${team[0] ?? 0} очков, и вы ответили одинаково ${this.coop.matched} из ${this.coop.asked}. ${this.coop.matched * 2 >= this.coop.asked ? 'Родственные души!' : 'Есть куда расти — сыграем ещё?'}`
      : team.length === 2 && lead !== 0
        ? `Игра окончена! Побеждает команда «${TEAM_INFO[lead > 0 ? 0 : 1].title}»!`
        : winners.length > 1
          ? `Игра окончена! Первое место делят ${joinNames(winners)}. Вот это дружба!`
          : this.host.decks.line('final', winners[0]);
    this.finished = true;
    const evening = this.host.recordGame(rows.filter((r) => r.place === 1).map((r) => r.player));
    this.setPhase({ kind: 'final', rows, awards, gallery: this.highlights.slice(0, 8), moments: pickMoments(this.moments), coop: this.coop ?? undefined, evening, played: [...this.explained] }, say);
  }

  private stringAnswers(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [id, value] of this.answers) if (typeof value === 'string') out[id] = value;
    return out;
  }

  private galleryVoters(items: GalleryItem[]): Player[] {
    if (this.host.settings.selfVote) return this.active();
    return this.active().filter((p) => items.some((i) => !i.authors.includes(p.id)));
  }

  /** Audience vote in a plain «Кто из нас?» question, a gallery or a vote on answers; it never scores. */
  crowdAnswer(id: string, phaseId: number, value: unknown): void {
    const phase = this.phase;
    if (phaseId !== this.phaseId || typeof value !== 'string' || this.crowdVotes.has(id)) return;
    const fits =
      (phase.kind === 'vote' && !phase.quote && phase.options.includes(value)) ||
      (phase.kind === 'gallery' && Date.now() >= phase.votingFrom && phase.items.some((i) => i.id === value)) ||
      (phase.kind === 'rushVote' && phase.replies.some((r) => r.player === value));
    if (!fits) return;
    this.crowdVotes.set(id, value);
    this.host.changed();
  }

  crowdPersonal(id: string): Personal {
    const phase = this.phase;
    const answer = this.crowdVotes.get(id);
    if (phase.kind === 'vote' && !phase.quote) return { kind: 'vote', answer };
    if (phase.kind === 'gallery') return { kind: 'gallery', canVote: true, own: [], answer };
    if (phase.kind === 'rushVote') return { kind: 'rushVote', answer };
    return { kind: 'none' };
  }

  private crowdPick(): CrowdPick | undefined {
    const tally = new Map<string, number>();
    for (const to of this.crowdVotes.values()) tally.set(to, (tally.get(to) ?? 0) + 1);
    let best: [string, number] | undefined;
    for (const entry of tally) if (!best || entry[1] > best[1]) best = entry;
    return best && { pick: best[0], votes: best[1], total: this.crowdVotes.size };
  }

  /** Called after a player connects or disconnects, which can change who we're waiting for. */
  rosterChanged(): void {
    const phase = this.phase;
    // a bomb in a pocket that left the Wi-Fi would just sit there until the fuse runs out
    if (phase.kind === 'bomb' && !this.player(phase.holder)?.connected) {
      const to = this.bombTargets(phase.holder);
      if (to.length > 0) this.passBomb(pick(to, this.host.rng));
    }
    this.poke();
  }

  answer(playerId: string, phaseId: number, value: unknown): boolean {
    const ok = this.take(playerId, phaseId, value);
    if (ok && this.missions) {
      const texts = typeof value === 'string' ? [value] : Array.isArray(value) ? value : [(value as Partial<ChatPost> | null)?.text];
      for (const text of texts) if (typeof text === 'string') this.report({ kind: 'text', player: playerId, text });
    }
    return ok;
  }

  private take(playerId: string, phaseId: number, value: unknown): boolean {
    // list phones resend their growing list; tap-like games keep their counts outside `answers`
    if (phaseId !== this.phaseId || (this.answers.has(playerId) && this.phase.kind !== 'list')) return false;
    const phase = this.phase;
    switch (phase.kind) {
      case 'never': {
        if (typeof value !== 'string') return false;
        const match = /^([01]):(\d+)$/.exec(value);
        if (!match || Number(match[2]) > phase.players) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'tap': {
        // phones report a running total a few times a second, so this answer repeats by design
        if (typeof value !== 'number' || !Number.isInteger(value) || !(playerId in phase.counts)) return false;
        const now = Date.now();
        if (now < phase.startsAt - 300) return false;
        const cap = Math.floor((Math.max(0, Math.min(now, phase.deadline) - phase.startsAt) / 1000) * TAP_MAX_RATE) + 5;
        const count = Math.min(value, cap);
        if (count <= (phase.counts[playerId] ?? 0)) return true;
        phase.counts[playerId] = count;
        // only the TV draws the race, and it is fine at a few frames a second
        if (now - this.tapShown >= TAP_SHOW_MS) {
          this.tapShown = now;
          this.host.sendTap(this.phaseId, phase.counts);
        }
        return true;
      }
      case 'contactWrite': {
        if (playerId === phase.leader || !Array.isArray(value) || value.length !== 2) return false;
        const [w, hint] = value.map((v) => (typeof v === 'string' ? clip(stripControls(v).replace(/\s+/g, ' ').trim(), QUOTE_MAX) : ''));
        if (!w || !hint || /\s/.test(w) || !normalize(w).startsWith(normalize(phase.prefix)) || normalize(w) === normalize(phase.prefix)) return false;
        if (clueProblem(w, hint)) return false;
        this.answers.set(playerId, [w, hint]);
        phase.done.push(playerId);
        break;
      }
      case 'contactGuess': {
        // «hintId:word»; the leader may answer every hint at once, everyone else one hint that is not their own
        const leader = playerId === phase.leader;
        const entries = (leader && Array.isArray(value) ? value : [value]).filter((e): e is string => typeof e === 'string');
        const clean = entries.flatMap((e) => {
          const at = e.indexOf(':');
          const hint = e.slice(0, at);
          const w = cleanGuess(e.slice(at + 1));
          const h = this.contactHints.get(hint);
          return at > 0 && w && h && h.author !== playerId ? [`${hint}:${w}`] : [];
        });
        if (clean.length === 0 || (!leader && clean.length !== 1)) return false;
        this.answers.set(playerId, leader ? clean : clean[0]!);
        phase.done.push(playerId);
        break;
      }
      case 'band': {
        // each tap arrives on its own, stamped with the phone's server-clock time, so it stays out of `answers`
        const part = phase.parts[playerId];
        const hits = this.bandHits.get(playerId);
        if (!part || !hits || typeof value !== 'number' || Math.abs(value - Date.now()) > BAND_CLOCK_SLACK_MS) return false;
        const at = (value - phase.startsAt) / phase.beat;
        const near = part.notes.reduce((best, n, i) => (hits.has(i) ? best : best < 0 || Math.abs(n - at) < Math.abs(part.notes[best]! - at) ? i : best), -1);
        const off = near < 0 ? Infinity : Math.abs(part.notes[near]! - at) * phase.beat;
        if (off > BAND_WINDOW_MS) {
          // trying the sound out during the countdown is fine
          if (value >= phase.startsAt) this.bandStrays.set(playerId, (this.bandStrays.get(playerId) ?? 0) + 1);
        } else hits.set(near, off <= BAND_PERFECT_MS ? 2 : 1);
        const earned = [...hits.values()].reduce((a, b) => a + b, 0) - (this.bandStrays.get(playerId) ?? 0);
        phase.scores[playerId] = Math.max(0, Math.round((earned / (part.notes.length * 2)) * 100));
        if (Date.now() - this.tapShown >= TAP_SHOW_MS) {
          this.tapShown = Date.now();
          this.host.sendTap(this.phaseId, phase.scores);
        }
        return true;
      }
      case 'caseSurvey': {
        if (!this.player(playerId) || !Array.isArray(value) || value.length !== phase.questions.length) return false;
        const picks = value.filter((v, i): v is number => Number.isInteger(v) && v >= 0 && v < phase.questions[i]!.options.length);
        if (picks.length !== phase.questions.length) return false;
        // stored as «2,0,1», like «Четырёхлистник», so the answers map keeps its three shapes
        this.answers.set(playerId, picks.join(','));
        phase.done.push(playerId);
        break;
      }
      case 'caseClue': {
        if (playerId === this.caseCulprit || phase.accused.includes(playerId) || typeof value !== 'string' || value === playerId || !this.player(value)) return false;
        this.answers.set(playerId, value);
        phase.accused.push(playerId);
        break;
      }
      case 'junkBid': {
        const coins = this.junkCoins.get(playerId) ?? 0;
        if (playerId === phase.seller || typeof value !== 'number' || !(JUNK_BIDS as readonly number[]).includes(value) || value > coins) return false;
        this.answers.set(playerId, value);
        phase.bids.push(playerId);
        break;
      }
      case 'ninja': {
        // each slice arrives on its own, so this answer repeats by design and stays out of `answers`
        const cut = this.ninjaSliced.get(playerId);
        const fruit = typeof value === 'number' ? phase.fruits.find((f) => f.id === value) : undefined;
        if (!cut || !fruit || cut.has(fruit.id)) return false;
        const t = Date.now() - phase.startsAt;
        if (t < fruit.at - NINJA_SLACK_MS || t > fruit.at + fruit.flight + NINJA_SLACK_MS) return false;
        cut.add(fruit.id);
        if (fruit.kind === NINJA_BOMB) {
          this.ninjaBombs.set(playerId, (this.ninjaBombs.get(playerId) ?? 0) + 1);
          phase.scores[playerId] = Math.max(0, (phase.scores[playerId] ?? 0) - NINJA_BOMB_POINTS);
        } else phase.scores[playerId] = (phase.scores[playerId] ?? 0) + NINJA_FRUIT_POINTS;
        if (Date.now() - this.tapShown >= TAP_SHOW_MS) {
          this.tapShown = Date.now();
          this.host.sendTap(this.phaseId, phase.scores);
        }
        return true;
      }
      case 'taleVote': {
        const mine = this.taleCards.get(playerId);
        if (playerId === phase.teller || typeof value !== 'string' || value === mine || !phase.items.some((c) => c.id === value)) return false;
        this.answers.set(playerId, value);
        phase.voted.push(playerId);
        break;
      }
      case 'quiz': {
        if (!phase.alive.includes(playerId) || typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value >= phase.options.length) return false;
        this.answers.set(playerId, value);
        // read off the deadline, which a pause pushes back, so time spent paused is not lost
        this.quizTimes.set(playerId, Math.max(0, phase.deadline - Date.now()));
        phase.answered.push(playerId);
        break;
      }
      case 'years': {
        if (!this.player(playerId) || typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > phase.timeline.length) return false;
        this.answers.set(playerId, value);
        phase.done.push(playerId);
        break;
      }
      case 'clover': {
        if (playerId === phase.author || !this.player(playerId) || !Array.isArray(value) || value.length !== CLOVER_SIZE) return false;
        const cards = value.filter((c): c is number => Number.isInteger(c) && c >= 0 && c < phase.cards.length);
        if (cards.length !== CLOVER_SIZE || new Set(cards).size !== CLOVER_SIZE) return false;
        // stored as «2,0,4,1» like «Я никогда не» does, so the answers map keeps its three shapes
        this.answers.set(playerId, cards.join(','));
        phase.done.push(playerId);
        break;
      }
      case 'shaker': {
        // running totals like «Тапалка»; a balloon that burst takes no more pumps
        if (typeof value !== 'number' || !Number.isInteger(value) || !(playerId in phase.sizes) || phase.popped.includes(playerId)) return false;
        const now = Date.now();
        if (now < phase.startsAt - 300) return false;
        const cap = Math.floor((Math.max(0, Math.min(now, phase.deadline) - phase.startsAt) / 1000) * TAP_MAX_RATE) + 5;
        const count = Math.min(value, cap);
        if (count <= (phase.sizes[playerId] ?? 0)) return true;
        const limit = this.shakerLimits.get(playerId) ?? Infinity;
        phase.sizes[playerId] = Math.min(count, limit);
        if (count >= limit) {
          phase.popped.push(playerId);
          this.host.changed();
        } else if (now - this.tapShown >= TAP_SHOW_MS) {
          this.tapShown = now;
          this.host.sendTap(this.phaseId, phase.sizes);
        }
        return true;
      }
      case 'tug': {
        // the same running totals as «Тапалка», capped at a human thumb's speed
        if (typeof value !== 'number' || !Number.isInteger(value) || !(playerId in phase.counts) || this.tugWinner !== null) return false;
        const now = Date.now();
        if (now < phase.startsAt - 300) return false;
        const cap = Math.floor((Math.max(0, Math.min(now, phase.deadline) - phase.startsAt) / 1000) * TAP_MAX_RATE) + 5;
        const count = Math.min(value, cap);
        if (count <= (phase.counts[playerId] ?? 0)) return true;
        phase.counts[playerId] = count;
        const lead = tugLead(phase.teams, phase.counts);
        if (Math.abs(lead) >= phase.gap) {
          this.tugWinner = lead > 0 ? 0 : 1;
          this.poke();
        }
        if (now - this.tapShown >= TAP_SHOW_MS) {
          this.tapShown = now;
          this.host.sendTap(this.phaseId, phase.counts);
        }
        return true;
      }
      case 'vote': {
        if (typeof value !== 'string' || !phase.options.includes(value)) return false;
        if (!phase.allowSelf && value === playerId) return false;
        if ((phase.quote || phase.emoji) && playerId === this.quoteAuthor) return false;
        if (phase.duel && phase.options.includes(playerId)) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'predict': {
        if (typeof value !== 'number' || !Number.isInteger(value)) return false;
        if (phase.lie && playerId === phase.target) return false;
        if (value < 0 || value >= phase.options.length) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'rules':
        this.answers.set(playerId, 'ready');
        phase.ready.push(playerId);
        break;
      case 'scale': {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > SCALE_MAX) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'write': {
        if (phase.author && playerId !== phase.author) return false;
        if (phase.forehead === playerId) return false;
        if (phase.forehead && typeof value === 'string' && givesAway(this.foreheadWord ?? '', value)) return false;
        if (phase.clover) {
          const words = this.cloverCards.get(playerId);
          if (!words || !Array.isArray(value) || value.length !== CLOVER_SIZE) return false;
          const clues = value.map((v) => (typeof v === 'string' ? clip(stripControls(v).trim(), CLUE_MAX) : ''));
          const pairs = clues.map((c, k) => [words[k]!, words[(k + 1) % CLOVER_SIZE]!]);
          if (clues.some((c, k) => !c || /\s/.test(c) || pairs[k]!.some((w) => clueProblem(w, c)))) return false;
          this.answers.set(playerId, clues);
          phase.done.push(playerId);
          break;
        }
        if (phase.slots) {
          if (playerId !== phase.author || !Array.isArray(value) || value.length !== phase.slots.length) return false;
          const lines = value.map((v) => (typeof v === 'string' ? clip(stripControls(v).replace(/\s+/g, ' ').trim(), QUOTE_MAX) : ''));
          if (lines.some((l) => !l)) return false;
          this.answers.set(playerId, lines);
          phase.done.push(playerId);
          break;
        }
        if (typeof value !== 'string') return false;
        if (phase.quip && !this.quipPrompts.has(playerId)) return false;
        if (phase.clue) {
          const secret = this.clueSecrets.get(playerId);
          const clue = clip(stripControls(value).replace(/\s+/g, ' ').trim(), CLUE_MAX);
          if (!secret || clueProblem(secret.word, clue)) return false;
          this.answers.set(playerId, clue);
          phase.done.push(playerId);
          break;
        }
        const text = phase.emoji
          ? onlyEmoji(value)
          : clip(stripControls(value).replace(/\s+/g, ' ').trim(), phase.hat ? GUESS_MAX : phase.herd || phase.odd ? HERD_MAX : phase.fib ? FIB_MAX : phase.quip ? QUIP_MAX : QUOTE_MAX);
        if (!text) return false;
        this.answers.set(playerId, text);
        phase.done.push(playerId);
        break;
      }
      case 'percentGuess': {
        if (playerId !== phase.hero || typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 100 || value % PERCENT_STEP) return false;
        this.answers.set(playerId, value);
        break;
      }
      case 'percentBet': {
        if (playerId === phase.hero || (value !== 0 && value !== 1)) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'fibVote': {
        if (typeof value !== 'string' || !phase.options.some((o) => o.id === value) || this.fibAuthors.get(value) === playerId) return false;
        this.answers.set(playerId, value);
        phase.voted.push(playerId);
        break;
      }
      case 'simon': {
        if (!phase.alive.includes(playerId) || typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value >= SIMON_COLORS.length) return false;
        this.answers.set(playerId, value);
        break;
      }
      case 'mafiaNight':
      case 'mafiaVote': {
        if (typeof value !== 'string' || !this.mafiaOptions(playerId).includes(value)) return false;
        this.answers.set(playerId, value);
        if (phase.kind === 'mafiaNight') phase.done.push(playerId);
        else phase.voted.push(playerId);
        // the seer learns the answer at once, so the morning talk can use it
        if (phase.kind === 'mafiaNight' && this.mafiaRoles.get(playerId) === 'seer' && !this.mafiaSeen.some((s) => s.player === value)) {
          this.mafiaSeen.push({ player: value, wolf: this.mafiaRoles.get(value) === 'wolf' });
        }
        break;
      }
      case 'hat': {
        // the explainer's only button; guesses come in through guess(), which may repeat
        if (playerId !== phase.explainer || value !== 'skip') return false;
        this.hatSkip();
        return true;
      }
      case 'replyPick': {
        const hand = this.replyHands.get(playerId);
        if (!hand || typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value >= hand.length) return false;
        this.answers.set(playerId, value);
        phase.done.push(playerId);
        break;
      }
      case 'foreheadGuess': {
        if (playerId !== phase.guesser || typeof value !== 'string') return false;
        const guess = clip(stripControls(value).replace(/\s+/g, ' ').trim(), GUESS_MAX);
        if (!guess) return false;
        this.answers.set(playerId, guess);
        break;
      }
      case 'quipVote': {
        if (typeof value !== 'string' || !phase.answers.some((a) => a.id === value)) return false;
        if ([...this.quipAuthors.values()].includes(playerId)) return false;
        this.answers.set(playerId, value);
        phase.voted.push(playerId);
        break;
      }
      case 'bomb': {
        if (playerId !== phase.holder || typeof value !== 'string') return false;
        if (!this.bombTargets(playerId).includes(value) || Date.now() - this.bombPassedAt < BOMB_MIN_HOLD_MS) return false;
        this.passBomb(value);
        return true;
      }
      case 'list': {
        // a phone that reconnected after the round opened still gets to play
        if (!this.player(playerId) || !Array.isArray(value)) return false;
        const seen = new Set<string>();
        const items: string[] = [];
        for (const raw of value.slice(0, LIST_MAX_ITEMS * 2)) {
          if (typeof raw !== 'string') continue;
          const text = clip(stripControls(raw.slice(0, LIST_ITEM_MAX * 4)).replace(/\s+/g, ' ').trim(), LIST_ITEM_MAX);
          const key = listKey(text);
          if (key.length < LIST_MIN_KEY || seen.has(key)) continue;
          seen.add(key);
          items.push(text);
          if (items.length >= LIST_MAX_ITEMS) break;
        }
        const before = this.answers.get(playerId);
        if (Array.isArray(before) && before.join('\n') === items.join('\n')) return true;
        this.answers.set(playerId, items);
        phase.counts[playerId] = items.length;
        this.host.changed();
        return true;
      }
      case 'rps': {
        if (typeof value !== 'string' || !(RPS_THROWS as readonly string[]).includes(value)) return false;
        if (!phase.matches.some((m) => m.b !== null && (m.a === playerId || m.b === playerId))) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'clueGuess': {
        if (playerId === phase.author || typeof value !== 'string' || !phase.options.includes(value)) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'treasure': {
        if (phase.stage !== 'choose' || !phase.inside.includes(playerId) || (value !== 0 && value !== 1)) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'truth':
      case 'even':
      case 'percent': {
        if (value !== 0 && value !== 1) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'spy': {
        if (typeof value !== 'string' || value === playerId || !phase.options.includes(playerId) || !phase.options.includes(value)) {
          return false;
        }
        this.answers.set(playerId, value);
        phase.voted.push(playerId);
        break;
      }
      case 'spyGuess': {
        if (playerId !== phase.spy || typeof value !== 'string' || !phase.options.includes(value)) return false;
        this.answers.set(playerId, value);
        break;
      }
      case 'plot': {
        const plot = this.plot;
        const post = value as Partial<ChatPost> | null;
        if (!plot || phase.caught || typeof post?.thread !== 'string' || typeof post.text !== 'string') return false;
        const message = plot.chat.post(playerId, post.thread, post.text);
        if (!message) return false;
        phase.sent = plot.chat.total;
        if (playerId === plot.target && mentions(message.text, plot.word.word)) {
          plot.slip = message.text;
          phase.caught = true;
        }
        break;
      }
      case 'date': {
        const post = value as Partial<ChatPost> | null;
        if (!this.date || typeof post?.thread !== 'string' || typeof post.text !== 'string') return false;
        if (!this.date.chat.post(playerId, post.thread, post.text)) return false;
        phase.sent = this.date.chat.total;
        break;
      }
      case 'rush': {
        const draft = value as Partial<RushDraft> | null;
        if (typeof draft?.text !== 'string' || phase.done.includes(playerId)) return false;
        const text = stripControls(draft.text).replace(/\s/g, ' ').slice(0, RUSH_MAX);
        // the whole point of the game: a reply may only grow, so a phone cannot quietly fix a typo
        if (!text.startsWith(phase.texts[playerId] ?? '')) return false;
        phase.texts[playerId] = text;
        if (draft.final && text.trim()) phase.done.push(playerId);
        break;
      }
      case 'rushVote': {
        if (typeof value !== 'string' || value === playerId || !phase.replies.some((r) => r.player === value)) return false;
        this.answers.set(playerId, value);
        phase.voted.push(playerId);
        break;
      }
      case 'waveHint': {
        if (playerId !== phase.psychic || typeof value !== 'string') return false;
        const hint = clip(stripControls(value).replace(/\s+/g, ' ').trim(), WAVE_HINT_MAX);
        if (!hint) return false;
        this.answers.set(playerId, hint);
        break;
      }
      case 'waveGuess': {
        if (playerId === phase.psychic || typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > WAVE_MAX) return false;
        phase.answered.push(playerId);
        this.answers.set(playerId, value);
        break;
      }
      case 'orderWrite': {
        if (!this.order?.numbers.has(playerId) || typeof value !== 'string') return false;
        const text = clip(stripControls(value).replace(/\s+/g, ' ').trim(), ORDER_TEXT_MAX);
        if (!text) return false;
        this.answers.set(playerId, text);
        phase.done.push(playerId);
        break;
      }
      case 'orderSort': {
        const cards = phase.cards.map((c) => c.player);
        const valid = Array.isArray(value) && value.length === cards.length && cards.every((id) => value.includes(id));
        if (!valid || !cards.includes(playerId)) return false;
        this.answers.set(playerId, value as string[]);
        phase.done.push(playerId);
        break;
      }
      case 'freeze': {
        // a stream of reports nobody else needs to see, so it skips the room broadcast like taps do
        const f = this.freeze;
        if (!f || !phase.alive.includes(playerId)) return false;
        const late = Date.now() - f.holdFrom;
        if (value === `moved:${f.round}`) {
          if (phase.stage === 'freeze' && late >= this.dur.freezeGrace) f.moved.add(playerId);
          return true;
        }
        if (!Array.isArray(value) || value[0] !== f.round || typeof value[1] !== 'number' || !Number.isFinite(value[1])) return false;
        if (phase.stage === 'music' || (phase.stage === 'freeze' && late < this.dur.freezeGrace)) f.dance.set(playerId, Math.min(value[1], f.musicMs));
        return true;
      }
      case 'market': {
        const market = this.market;
        if (!market || !market.clues.has(playerId)) return false;
        if (Array.isArray(value)) {
          const cats = market.case.categories;
          const valid = value.length === cats.length && value.every((v, k) => Number.isInteger(v) && v >= 0 && v < cats[k]!.options.length);
          if (!valid || market.guesses.has(playerId)) return false;
          market.guesses.set(playerId, value as number[]);
          phase.solved.push(playerId);
          break;
        }
        const post = value as Partial<ChatPost> | null;
        if (typeof post?.thread !== 'string' || !post.thread.startsWith('dm:') || typeof post.text !== 'string') return false;
        if (!market.chat.post(playerId, post.thread, post.text)) return false;
        phase.sent = market.chat.total;
        break;
      }
      case 'masq': {
        const post = value as Partial<ChatPost> | null;
        const masq = this.masq;
        if (!masq || post?.thread !== MASQ_THREAD || typeof post.text !== 'string') return false;
        if (!masq.chat.post(playerId, MASQ_THREAD, post.text)) return false;
        const messages = masq.chat.view(playerId).find((t) => t.id === MASQ_THREAD)?.messages ?? [];
        phase.feed = messages.slice(-MASQ_FEED).map((m) => ({ id: m.id, mask: masq.owners.indexOf(m.from), text: m.text }));
        break;
      }
      case 'masqGuess': {
        const owners = this.masq?.owners;
        const mine = owners?.indexOf(playerId) ?? -1;
        if (!owners || mine < 0 || !Array.isArray(value) || value.length !== owners.length) return false;
        const picked = value.filter((v) => v !== null);
        const valid = value.every((v, i) => (v === null ? true : typeof v === 'string' && i !== mine && v !== playerId && owners.includes(v)));
        if (!valid || picked.length === 0 || new Set(picked).size !== picked.length) return false;
        this.answers.set(playerId, value);
        phase.voted.push(playerId);
        break;
      }
      case 'radio': {
        if (typeof value !== 'string' || !this.radioChain(playerId)) return false;
        const text = clip(stripControls(value.slice(0, 600)).replace(/\s+/g, ' ').trim(), 140);
        if (!text || text.split(' ').length > RADIO_WORDS_MAX) return false;
        this.answers.set(playerId, text);
        phase.done.push(playerId);
        break;
      }
      case 'radioVote': {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value >= phase.finals.length) return false;
        if (this.radioMine(playerId).includes(value)) return false;
        this.answers.set(playerId, value);
        phase.voted.push(playerId);
        break;
      }
      case 'datePick': {
        if (typeof value !== 'string' || value === playerId || !this.date?.quirks.has(value) || !this.date.quirks.has(playerId)) return false;
        this.answers.set(playerId, value);
        phase.voted.push(playerId);
        break;
      }
      case 'plotGuess': {
        if (!phase.voters.includes(playerId) || !Array.isArray(value)) return false;
        const picked = [...new Set(value.filter((v): v is string => typeof v === 'string'))];
        const options = this.active().map((p) => p.id).filter((id) => id !== playerId && id !== phase.target);
        if (picked.length !== Math.min(phase.plotters, options.length) || !picked.every((id) => options.includes(id))) return false;
        this.answers.set(playerId, picked);
        phase.voted.push(playerId);
        break;
      }
      case 'closest': {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > CLOSEST_MAX) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'sync': {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value >= phase.options.length) return false;
        if (!phase.groups.some((g) => g.includes(playerId))) return false;
        this.answers.set(playerId, value);
        phase.answered.push(playerId);
        break;
      }
      case 'reflex': {
        if (phase.stage !== 'go') {
          this.answers.set(playerId, 'early');
          break;
        }
        if (this.reflexEarly.has(playerId) || typeof value !== 'number' || !Number.isFinite(value)) return false;
        // the phone times itself, but cannot claim much less than the server saw pass since «go»
        const floor = Date.now() - this.reflexGoAt - REFLEX_SLACK_MS;
        this.answers.set(playerId, Math.round(Math.min(this.dur.reflexGo, Math.max(REFLEX_MIN_MS, floor, value))));
        phase.tapped.push(playerId);
        break;
      }
      case 'gallery': {
        if (Date.now() < phase.votingFrom || typeof value !== 'string') return false;
        const item = phase.items.find((i) => i.id === value);
        if (!item || (item.authors.includes(playerId) && !this.host.settings.selfVote)) return false;
        this.answers.set(playerId, value);
        phase.voted.push(playerId);
        break;
      }
      default:
        return false;
    }
    this.host.changed();
    this.poke();
    return true;
  }

  ink(playerId: string, phaseId: number, op: InkOp): void {
    if (phaseId !== this.phaseId || this.done.has(playerId)) return;
    if (typeof op !== 'object' || op === null) return;
    const phase = this.phase;
    const drawing =
      (phase.kind === 'draw' && phase.describer !== playerId) ||
      (phase.kind === 'shared' && phase.artist === playerId) ||
      (phase.kind === 'guess' && phase.artist === playerId && !phase.mime);
    if (!drawing) return;
    const board = phase.board;

    const strokes = this.inks.get(playerId) ?? [];
    let relay: InkOp;
    if (op.k === 'move' || op.k === 'end') {
      const stroke = cleanStroke(op.s, board);
      if (!stroke) return;
      relay = { k: op.k, s: stroke };
      if (op.k === 'end') {
        if (strokes.length >= MAX_STROKES) return;
        strokes.push(stroke);
      }
    } else if (op.k === 'undo') {
      strokes.pop();
      relay = op;
    } else if (op.k === 'clear') {
      strokes.length = 0;
      relay = op;
    } else {
      return;
    }
    this.inks.set(playerId, strokes);
    this.host.relayInk(playerId, relay, phase.kind === 'shared' || phase.kind === 'guess');
  }

  submit(playerId: string, phaseId: number): void {
    if (phaseId !== this.phaseId) return;
    const phase = this.phase;
    if (phase.kind === 'draw') {
      if (this.done.has(playerId) || phase.describer === playerId) return;
      this.done.add(playerId);
      phase.done.push(playerId);
    } else if (phase.kind === 'shared' && phase.artist === playerId) {
      this.done.add(playerId);
    } else {
      return;
    }
    this.host.changed();
    this.poke();
  }

  photoUploaded(playerId: string, phaseId: number, asset: string): boolean {
    const phase = this.phase;
    if (phaseId !== this.phaseId || phase.kind !== 'photo' || this.done.has(playerId)) return false;
    if (phase.subject && phase.subject !== playerId) return false;
    this.photos.set(playerId, asset);
    this.done.add(playerId);
    phase.done.push(playerId);
    this.host.changed();
    this.poke();
    return true;
  }

  personal(playerId: string): Personal {
    const phase = this.phase;
    switch (phase.kind) {
      case 'vote': {
        const answer = this.answers.get(playerId);
        return {
          kind: 'vote',
          answer: typeof answer === 'string' ? answer : undefined,
          joker: this.jokerAllowed(playerId) ? this.jokersPlayed.has(playerId) : undefined,
          mine:
            ((phase.quote || phase.emoji) && playerId === this.quoteAuthor) ||
            (phase.duel && phase.options.includes(playerId))
              ? true
              : undefined,
        };
      }
      case 'write':
        return {
          kind: 'write',
          done: this.answers.has(playerId),
          watching:
            (phase.author !== undefined && phase.author !== playerId) ||
            (phase.quip && !this.quipPrompts.has(playerId)) ||
            (phase.clue && !this.clueSecrets.has(playerId)) ||
            phase.forehead === playerId
              ? true
              : undefined,
          previous: phase.story && phase.author === playerId ? (this.storyPrevious ?? undefined) : undefined,
          about: phase.emoji ? this.emojiTargets.get(playerId) : undefined,
          clover: phase.clover ? this.cloverCards.get(playerId)?.slice(0, CLOVER_SIZE) : undefined,
          prompt: phase.junk
            ? this.junkItems.get(playerId)
            : phase.quip
            ? this.quipPrompts.get(playerId)
            : phase.clue
              ? this.clueSecrets.get(playerId)?.word
              : phase.odd && this.oddRound
                ? playerId === this.oddRound.player
                  ? this.oddRound.pair.odd
                  : this.oddRound.pair.q
                : phase.forehead && phase.forehead !== playerId
                  ? (this.foreheadWord ?? undefined)
                  : undefined,
        };
      case 'never': {
        const answer = this.answers.get(playerId);
        if (typeof answer !== 'string') return { kind: 'never' };
        const [yes, guess] = answer.split(':');
        return { kind: 'never', did: yes === '1', guess: Number(guess) };
      }
      case 'tap':
        return { kind: 'tap', count: phase.counts[playerId] ?? 0 };
      case 'quipVote': {
        const answer = this.answers.get(playerId);
        return {
          kind: 'quipVote',
          mine: [...this.quipAuthors.values()].includes(playerId),
          answer: typeof answer === 'string' ? answer : undefined,
        };
      }
      case 'bomb': {
        const holding = phase.holder === playerId;
        return { kind: 'bomb', holding, targets: holding ? this.bombTargets(playerId) : [] };
      }
      case 'closest': {
        const answer = this.answers.get(playerId);
        return { kind: 'closest', answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'truth': {
        const answer = this.answers.get(playerId);
        return { kind: 'truth', answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'even':
      case 'percent': {
        const answer = this.answers.get(playerId);
        return { kind: phase.kind, answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'percentGuess':
      case 'percentBet': {
        const answer = this.answers.get(playerId);
        return { kind: phase.kind, hero: phase.hero === playerId, answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'fibVote': {
        const answer = this.answers.get(playerId);
        const mine = [...this.fibAuthors].find(([, author]) => author === playerId)?.[0];
        return { kind: 'fibVote', mine, answer: typeof answer === 'string' ? answer : undefined };
      }
      case 'simon': {
        const answer = this.answers.get(playerId);
        return { kind: 'simon', alive: phase.alive.includes(playerId), answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'replyPick': {
        const answer = this.answers.get(playerId);
        return { kind: 'replyPick', hand: this.replyHands.get(playerId) ?? [], answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'foreheadGuess': {
        const answer = this.answers.get(playerId);
        return { kind: 'foreheadGuess', guesser: phase.guesser === playerId, answer: typeof answer === 'string' ? answer : undefined };
      }
      case 'mafiaRoles':
      case 'mafiaNight':
      case 'mafiaDay':
      case 'mafiaVote':
      case 'mafiaExile': {
        const role = this.mafiaRoles.get(playerId);
        if (!role) return { kind: 'none' };
        const answer = this.answers.get(playerId);
        return {
          kind: 'mafia',
          role,
          mates: role === 'wolf' ? [...this.mafiaRoles].filter(([id, r]) => r === 'wolf' && id !== playerId).map(([id]) => id) : [],
          alive: this.mafiaAlive.has(playerId),
          options: this.mafiaOptions(playerId),
          answer: typeof answer === 'string' ? answer : undefined,
          seen: role === 'seer' ? this.mafiaSeen : [],
        };
      }
      case 'caseSurvey':
        return { kind: 'caseSurvey', done: this.answers.has(playerId) };
      case 'contactWrite':
        return { kind: 'contactWrite', leader: phase.leader === playerId, done: this.answers.has(playerId) };
      case 'contactGuess': {
        const mine = [...this.contactHints].find(([, h]) => h.author === playerId)?.[0];
        return { kind: 'contactGuess', leader: phase.leader === playerId, mine, done: this.answers.has(playerId) };
      }
      case 'band':
        return { kind: 'band', part: phase.parts[playerId] };
      case 'caseClue': {
        const answer = this.answers.get(playerId);
        return { kind: 'caseClue', culprit: this.caseCulprit === playerId, answer: typeof answer === 'string' ? answer : this.caseLocked.get(playerId)?.suspect };
      }
      case 'junkBid': {
        const answer = this.answers.get(playerId);
        return { kind: 'junkBid', seller: phase.seller === playerId, coins: this.junkCoins.get(playerId) ?? 0, answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'ninja':
        return { kind: 'ninja', sliced: [...(this.ninjaSliced.get(playerId) ?? [])], score: phase.scores[playerId] ?? 0 };
      case 'taleVote': {
        const answer = this.answers.get(playerId);
        return { kind: 'taleVote', teller: phase.teller === playerId, mine: this.taleCards.get(playerId), answer: typeof answer === 'string' ? answer : undefined };
      }
      case 'quiz': {
        const answer = this.answers.get(playerId);
        return { kind: 'quiz', alive: phase.alive.includes(playerId), answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'years': {
        const answer = this.answers.get(playerId);
        return { kind: 'years', answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'clover': {
        const answer = this.answers.get(playerId);
        return { kind: 'clover', author: phase.author === playerId, answer: typeof answer === 'string' ? cloverPick(answer) : undefined };
      }
      case 'shaker':
        return { kind: 'shaker', count: phase.sizes[playerId] ?? 0, popped: phase.popped.includes(playerId) };
      case 'hat':
        return {
          kind: 'hat',
          word: phase.explainer === playerId ? this.hatQueue[0] : undefined,
          close: this.hatTurn?.close.has(playerId) ?? false,
          got: phase.got.filter((c) => c.player === playerId).length,
        };
      case 'list': {
        const items = this.answers.get(playerId);
        return { kind: 'list', items: Array.isArray(items) ? items : [] };
      }
      case 'rps': {
        const match = phase.matches.find((m) => m.b !== null && (m.a === playerId || m.b === playerId));
        const answer = this.answers.get(playerId);
        if (!match) return { kind: 'rps', playing: false };
        return {
          kind: 'rps',
          playing: true,
          opponent: match.a === playerId ? match.b! : match.a,
          answer: typeof answer === 'string' ? answer : undefined,
        };
      }
      case 'clueGuess': {
        const answer = this.answers.get(playerId);
        return { kind: 'clueGuess', mine: phase.author === playerId, answer: typeof answer === 'string' ? answer : undefined };
      }
      case 'treasure': {
        const answer = this.answers.get(playerId);
        return { kind: 'treasure', inside: phase.inside.includes(playerId), answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'spy': {
        const answer = this.answers.get(playerId);
        const spy = this.spyId === playerId;
        return {
          kind: 'spy',
          spy,
          place: spy || !phase.options.includes(playerId) ? undefined : this.spyPlace,
          answer: typeof answer === 'string' ? answer : undefined,
        };
      }
      case 'plot': {
        const plot = this.plot;
        if (!plot) return { kind: 'none' };
        const plotter = plot.plotters.includes(playerId);
        const role: PlotRole = plotter ? 'plotter' : playerId === plot.target ? 'target' : 'bystander';
        return {
          kind: 'plot',
          role,
          target: plot.target,
          word: plotter ? plot.word.word : undefined,
          plotters: plotter ? plot.plotters : undefined,
          lures: plotter ? plot.word.lures : undefined,
          chats: plot.chat.view(playerId),
          left: plot.chat.left(playerId),
        };
      }
      case 'date': {
        const quirk = this.date?.quirks.get(playerId);
        if (!this.date || !quirk) return { kind: 'none' };
        return { kind: 'date', quirk: quirk.text, chats: this.date.chat.view(playerId), left: this.date.chat.left(playerId) };
      }
      case 'rush':
        return { kind: 'rush', text: phase.texts[playerId] ?? '', done: phase.done.includes(playerId) };
      case 'rushVote': {
        const answer = this.answers.get(playerId);
        return { kind: 'rushVote', answer: typeof answer === 'string' ? answer : undefined };
      }
      case 'waveHint':
        return phase.psychic === playerId && this.wave ? { kind: 'waveHint', target: this.wave.target, sent: this.answers.has(playerId) } : { kind: 'none' };
      case 'waveGuess': {
        if (phase.psychic === playerId) return { kind: 'none' };
        const answer = this.answers.get(playerId);
        return { kind: 'waveGuess', answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'orderWrite':
      case 'orderSort': {
        const number = this.order?.numbers.get(playerId);
        if (number === undefined) return { kind: 'none' };
        const answer = this.answers.get(playerId);
        return phase.kind === 'orderWrite'
          ? { kind: 'orderWrite', number, text: typeof answer === 'string' ? answer : undefined }
          : { kind: 'orderSort', number, answer: Array.isArray(answer) ? (answer as string[]) : undefined };
      }
      case 'freeze':
        return { kind: 'freeze', alive: phase.alive.includes(playerId) };
      case 'market': {
        const market = this.market;
        const clues = market?.clues.get(playerId);
        if (!market || !clues) return { kind: 'none' };
        return { kind: 'market', clues, chats: market.chat.view(playerId), left: market.chat.left(playerId), guess: market.guesses.get(playerId) };
      }
      case 'masq': {
        const mask = this.masq?.owners.indexOf(playerId) ?? -1;
        if (!this.masq || mask < 0) return { kind: 'none' };
        return { kind: 'masq', mask, chats: this.masqChats(playerId), left: this.masq.chat.left(playerId) };
      }
      case 'masqGuess': {
        const mask = this.masq?.owners.indexOf(playerId) ?? -1;
        if (mask < 0) return { kind: 'none' };
        const answer = this.answers.get(playerId);
        return { kind: 'masqGuess', mask, answer: Array.isArray(answer) ? (answer as (string | null)[]) : undefined };
      }
      case 'radio': {
        const chain = this.radioChain(playerId);
        if (!chain) return { kind: 'none' };
        return { kind: 'radio', incoming: chain.at(-1)!.text, original: chain.length === 1, done: this.answers.has(playerId) };
      }
      case 'radioVote': {
        const answer = this.answers.get(playerId);
        return { kind: 'radioVote', mine: this.radioMine(playerId), answer: typeof answer === 'number' ? answer : undefined };
      }
      case 'datePick': {
        const answer = this.answers.get(playerId);
        return { kind: 'datePick', answer: typeof answer === 'string' ? answer : undefined };
      }
      case 'plotGuess': {
        const answer = this.answers.get(playerId);
        return { kind: 'plotGuess', voting: phase.voters.includes(playerId), count: phase.plotters, answer: Array.isArray(answer) ? (answer as string[]) : undefined };
      }
      case 'spyGuess': {
        const answer = this.answers.get(playerId);
        return { kind: 'spyGuess', spy: phase.spy === playerId, answer: typeof answer === 'string' ? answer : undefined };
      }
      case 'sync': {
        const answer = this.answers.get(playerId);
        const group = phase.groups.find((g) => g.includes(playerId));
        if (!group) return { kind: 'none' };
        return {
          kind: 'sync',
          partners: group.filter((id) => id !== playerId),
          answer: typeof answer === 'number' ? answer : undefined,
        };
      }
      case 'scale': {
        const answer = this.answers.get(playerId);
        return {
          kind: 'scale',
          role: phase.target === playerId ? 'target' : 'guesser',
          answer: typeof answer === 'number' ? answer : undefined,
        };
      }
      case 'reflex': {
        const answer = this.answers.get(playerId);
        const early = this.reflexEarly.has(playerId) || (phase.stage !== 'go' && answer !== undefined);
        return { kind: 'reflex', early, ms: typeof answer === 'number' ? answer : undefined };
      }
      case 'predict': {
        const answer = this.answers.get(playerId);
        return {
          kind: 'predict',
          role: phase.target === playerId ? 'target' : 'guesser',
          answer: typeof answer === 'number' ? answer : undefined,
          joker: this.jokerAllowed(playerId) ? this.jokersPlayed.has(playerId) : undefined,
        };
      }
      case 'draw': {
        if (phase.describer === playerId) return { kind: 'describe', scene: this.describeScene ?? '' };
        const strokes = this.inks.get(playerId) ?? [];
        const done = this.done.has(playerId);
        if (phase.mode !== 'monster' || !this.monster) return { kind: 'draw', done, strokes };
        const step = phase.step ?? 0;
        const order = this.monster.order;
        if (!order.includes(playerId)) return { kind: 'none' };
        return {
          kind: 'draw',
          done,
          strokes,
          section: this.monster.sections[step],
          guide: this.monster.guides.get(playerId),
        };
      }
      case 'photo':
        return { kind: 'photo', done: this.done.has(playerId) };
      case 'rules':
        return { kind: 'rules', ready: this.answers.has(playerId) };
      case 'shared': {
        const myTurn = this.sharedArtist === playerId && !this.done.has(playerId);
        return { kind: 'shared', myTurn, strokes: myTurn ? (this.inks.get(playerId) ?? []) : undefined };
      }
      case 'guess': {
        const state = this.guessRound;
        const artist = phase.artist === playerId;
        return {
          kind: 'guess',
          role: artist ? 'artist' : 'guesser',
          word: artist ? state?.word : undefined,
          solved: state?.points.has(playerId) ?? false,
          feedback: state?.feedback.get(playerId),
          tries: state?.tries.get(playerId) ?? [],
          strokes: artist ? (this.inks.get(playerId) ?? []) : [],
        };
      }
      case 'tilt': {
        const status =
          !phase.mode ? undefined : phase.mode === 'paint' ? 'paint' : phase.mode === 'sumo' ? (phase.out?.includes(playerId) ? 'out' : 'on') : phase.it === playerId ? 'it' : 'free';
        return { kind: 'tilt', stars: phase.stars[playerId] ?? 0, status };
      }
      case 'tug':
        return { kind: 'tug', count: phase.counts[playerId] ?? 0, team: phase.teams[playerId] ?? 0 };
      case 'gallery': {
        const answer = this.answers.get(playerId);
        return {
          kind: 'gallery',
          canVote:
            phase.items.length > 1 &&
            (this.host.settings.selfVote || phase.items.some((i) => !i.authors.includes(playerId))),
          own: phase.items.filter((i) => i.authors.includes(playerId)).map((i) => i.id),
          answer: typeof answer === 'string' ? answer : undefined,
        };
      }
      default:
        return { kind: 'none' };
    }
  }
}

/** Whether gesture `x` beats `y`: each one beats the next in RPS_THROWS, the last beats the first. */
function beats(x: RpsThrow, y: RpsThrow): boolean {
  return RPS_THROWS[(RPS_THROWS.indexOf(x) + 1) % RPS_THROWS.length] === y;
}

const graphemes = new Intl.Segmenter('ru', { granularity: 'grapheme' });

/**
 * Case, ё and punctuation never split a herd: «Кот!», «кот» and «КОТ» are one answer. An answer of
 * only emoji or symbols keeps them, or «🍕» and «😂» would both reduce to nothing and match.
 */
function herdKey(text: string): string {
  const lower = text.toLowerCase().replaceAll('ё', 'е');
  return lower.replace(/[^\p{L}\p{N}]+/gu, ' ').trim() || lower.replace(/\s+/g, '');
}

/** Keeps the first few emoji of a phone's answer and drops everything else, letters included. */
function onlyEmoji(raw: string): string {
  return [...graphemes.segment(raw)]
    .map((g) => g.segment)
    .filter((g) => /\p{Extended_Pictographic}/u.test(g))
    .slice(0, EMOJI_MAX)
    .join('');
}

/** «Оркестр»: each instrument's part over the piece, one pattern per bar with a fill in every fourth bar. */
function bandNotes(instrument: BandInstrument): number[] {
  const bar = { drum: [0, 2], clap: [1, 3], bell: [0, 1.5, 3], bass: [0, 0.5, 2, 2.5] }[instrument];
  const fill = { drum: [0, 1, 2, 3], clap: [1, 2, 3, 3.5], bell: [0, 1, 2, 3], bass: [0, 1, 1.5, 2, 3] }[instrument];
  const notes: number[] = [];
  for (let b = 0; b < BAND_BEATS / 4; b++) for (const n of b % 4 === 3 ? fill : bar) notes.push(b * 4 + n);
  return notes;
}

function cloverPick(stored: string): number[] {
  return stored.split(',').map(Number);
}

function cleanStroke(raw: unknown, board: Board): Stroke | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { c, w, p } = raw as Partial<Stroke>;
  if (typeof c !== 'string' || (c !== ERASER && !(INK_COLORS as readonly string[]).includes(c))) return null;
  if (typeof w !== 'number' || !Number.isFinite(w) || w < 1 || w > 120) return null;
  if (!Array.isArray(p) || p.length < 2 || p.length % 2 !== 0 || p.length > MAX_POINTS * 2) return null;
  const points: number[] = [];
  for (let i = 0; i < p.length; i += 2) {
    const x = p[i];
    const y = p[i + 1];
    if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }
    points.push(clamp(Math.round(x), 0, board.w), clamp(Math.round(y), 0, board.h));
  }
  return { c, w: Math.round(w), p: points };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function shiftStroke(stroke: Stroke, dy: number): Stroke {
  return { ...stroke, p: stroke.p.map((v, i) => (i % 2 === 1 ? v + dy : v)) };
}

/** Strokes that reach into the bottom guide band, shifted so the band sits just above y = 0. */
export function guideStrip(strokes: Stroke[], board: Board): Stroke[] {
  const from = board.h - MONSTER_GUIDE;
  return strokes
    .filter((s) => s.c !== ERASER && s.p.some((v, i) => i % 2 === 1 && v >= from - s.w))
    .map((s) => shiftStroke(s, -board.h));
}
