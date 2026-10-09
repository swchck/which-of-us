import { PACE_FACTOR, TIMER_INFO } from '../../shared/catalog.js';

export { PACE_FACTOR };
import type { ArenaSnap, Evening, InkOp, Pace, Settings, TimerId } from '../../shared/protocol.js';
import type { Freshness, Rng } from '../util.js';
import type { ContentDecks } from './content.js';

export interface Stats {
  majority: number;
  predictHits: number;
  guessedAbout: number;
  art: number;
  photo: number;
  guessHits: number;
  drawingsSolved: number;
  stars: number;
  /** «Кто это написал?»: voters who picked someone else for this player's answer. */
  fooled: number;
  /** Reaction rounds won. */
  reflexWins: number;
  titles: { title: string; question: string }[];
}

export interface Player {
  id: string;
  token: string;
  name: string;
  color: number;
  selfie?: string;
  score: number;
  jokers: number;
  team?: number;
  vip: boolean;
  bot: boolean;
  connected: boolean;
  stats: Stats;
}

export function emptyStats(): Stats {
  return {
    majority: 0,
    predictHits: 0,
    guessedAbout: 0,
    art: 0,
    photo: 0,
    guessHits: 0,
    drawingsSolved: 0,
    stars: 0,
    fooled: 0,
    reflexWins: 0,
    titles: [],
  };
}

/** What the game needs from the room that runs it. */
export interface GameHost {
  readonly rng: Rng;
  readonly decks: ContentDecks;
  readonly settings: Settings;
  players(): Player[];
  changed(): void;
  /** Forwards live ink to the TV, and to the other phones when `toPlayers` is set. */
  relayInk(player: string, op: InkOp, toPlayers: boolean): void;
  putAsset(mime: string, data: Buffer | string): string;
  /** Streams arena positions to the TV, outside the regular state snapshots. */
  sendArena(phaseId: number, snap: ArenaSnap): void;
  sendTap(phaseId: number, counts: Record<string, number>): void;
  /** Selfie of the player, or a generated cartoon face when there is none. */
  faceAsset(player: Player): string;
  /** Memory of what came up in earlier games, shared by all rooms; absent in isolated tests. */
  readonly fresh?: Freshness;
  /** Adds a finished game to the evening's tally and returns the tally so far. */
  recordGame(winners: string[]): Evening;
}

/** Phase durations in milliseconds. */
export interface Durations {
  intro: number;
  /** The card when a round moves to another scene of its place. */
  scene: number;
  /** Rules card before a mini-game's first round; ends early once every person taps «Понятно». */
  rules: number;
  voteAsk: number;
  voteReveal: number;
  predictAsk: number;
  predictReveal: number;
  selfieDraw: number;
  photo: number;
  monsterStep: number;
  sharedTurn: number;
  sharedReveal: number;
  galleryPerItem: number;
  galleryVote: number;
  galleryReveal: number;
  scores: number;
  guessDraw: number;
  guessReveal: number;
  write: number;
  scaleAsk: number;
  scaleReveal: number;
  storyTurn: number;
  /** Story reveal per line, on top of the narration. */
  storyLine: number;
  /** Longest random wait before «ЖМИ!»; the actual wait is 40-100% of it. */
  reflexWait: number;
  reflexGo: number;
  /** How long the blue trap signal stays up. */
  reflexDecoy: number;
  reflexReveal: number;
  tiltPlay: number;
  /** 3-2-1 on the TV before the balls start rolling. */
  tiltCountdown: number;
  tiltReveal: number;
  neverAsk: number;
  neverReveal: number;
  /** 3-2-1 before «Тапалка» opens. */
  tapCountdown: number;
  tapPlay: number;
  tapReveal: number;
  /** «Эмодзи-портрет»: picking the emoji, shorter than writing a sentence. */
  emojiWrite: number;
  /** «Стадное чувство»: a word or two, so the answer timer, not the writing one. */
  herdWrite: number;
  herdReveal: number;
  oddVote: number;
  oddReveal: number;
  evenAsk: number;
  evenReveal: number;
  percentAsk: number;
  percentGuess: number;
  percentBet: number;
  percentReveal: number;
  fibWrite: number;
  fibVote: number;
  fibReveal: number;
  /** One «Бублик говорит» command; short on purpose, hesitation is the game. */
  simonStep: number;
  simonReveal: number;
  replyPick: number;
  foreheadWrite: number;
  foreheadGuess: number;
  foreheadReveal: number;
  syncAsk: number;
  syncReveal: number;
  /** «Горячая картошка»: the secret fuse is a random length between these two. */
  bombFuseMin: number;
  bombFuseMax: number;
  bombReveal: number;
  closestAsk: number;
  closestReveal: number;
  /** «Битва ответов»: a punchline, shorter than a full quote. */
  quipWrite: number;
  quipVote: number;
  quipReveal: number;
  /** «Крокодил»: acting the word out. */
  mimeAct: number;
  truthAsk: number;
  truthReveal: number;
  /** «Шпион»: questioning each other out loud, voting as they go. */
  spyTalk: number;
  spyGuess: number;
  spyReveal: number;
  /** «Три слова»: writing a clue for the secret word. */
  clueWrite: number;
  clueGuess: number;
  clueReveal: number;
  /** «Сокровища»: deciding to go on or leave, then watching the next card turn. */
  treasureChoose: number;
  treasureCard: number;
  treasureReveal: number;
  /** «Кто больше»: typing answers to one category. */
  listWrite: number;
  listReveal: number;
  /** «Цу-е-фа»: picking a gesture, then the hands shown. */
  rpsThrow: number;
  rpsReveal: number;
  plotChat: number;
  /** How long the TV shows the catch before the chat closes. */
  plotCaught: number;
  plotGuess: number;
  plotReveal: number;
  dateChat: number;
  datePick: number;
  dateMatch: number;
  masqChat: number;
  masqGuess: number;
  masqReveal: number;
  /** «Сарафанное радио»: reading and retelling one rumour. */
  radioWrite: number;
  /** Showing one chain on the TV, before the time it takes to read it out. */
  radioShow: number;
  radioVote: number;
  /** «Вставь слово»: filling the gap; the vote and reveal reuse «Без стёрки»'s timings. */
  blankWrite: number;
  radioReveal: number;
  /** «Без стёрки»: typing one urgent reply. */
  rushType: number;
  rushVote: number;
  rushReveal: number;
  marketChat: number;
  marketReveal: number;
  /** «Волна»: writing the hint, then everyone placing a mark. */
  waveHint: number;
  waveGuess: number;
  waveReveal: number;
  /** «По порядку»: naming a thing for your number, then sorting everyone's. */
  orderWrite: number;
  orderSort: number;
  orderReveal: number;
  /** «Замри!»: the countdown before the first song and how long each pause lasts. */
  freezeReady: number;
  freezeHold: number;
  /** The phone hears about the pause a network hop late, and a finger takes ~300 ms to lift. */
  freezeGrace: number;
  freezeReveal: number;
  /** «Мафия-ТВ»: reading roles, one night, the day's talk, the vote, the exile and the final roles. */
  mafiaRoles: number;
  mafiaNight: number;
  mafiaDay: number;
  mafiaVote: number;
  mafiaExile: number;
  mafiaEnd: number;
  /** «Контакт»: writing a word and a hint, hunting for contacts, and the step's reveal. */
  contactWrite: number;
  contactGuess: number;
  contactReveal: number;
  /** «Оркестр»: the count-in before the first beat, the whole piece (32 beats) and the reveal. */
  bandCountdown: number;
  bandPlay: number;
  bandReveal: number;
  /** «Расследование»: the survey, one clue's window to accuse, and the reveal. */
  caseSurvey: number;
  caseClue: number;
  caseReveal: number;
  /** «Рифмач»: writing the second line, then the performance and the vote. */
  rhymeWrite: number;
  rhymeVote: number;
  rhymeReveal: number;
  /** «Барахолка»: writing the pitch, bidding on one lot and its sale. */
  junkWrite: number;
  junkBid: number;
  junkSold: number;
  /** «Фруктовый ниндзя»: the countdown, the slicing and the result. */
  ninjaCountdown: number;
  ninjaPlay: number;
  ninjaReveal: number;
  /** «Срисуй по памяти»: how long the picture shows, then the drawing. */
  copyShow: number;
  copyDraw: number;
  /** «Сказочник»: drawing, the teller's clue, the hunt for the teller's drawing and its reveal. */
  taleDraw: number;
  taleClue: number;
  taleVote: number;
  taleReveal: number;
  /** «Викторина на выбывание»: one question and its reveal. */
  quizAsk: number;
  quizReveal: number;
  /** «В каком году?»: placing one event and its reveal. */
  yearsAsk: number;
  yearsReveal: number;
  /** «Четырёхлистник»: writing the four clues, placing one clover's words, and its reveal. */
  cloverWrite: number;
  cloverGuess: number;
  cloverReveal: number;
  /** «Шейкер»: the countdown, the pumping and the result. */
  shakerCountdown: number;
  shakerPlay: number;
  shakerReveal: number;
  /** «Шляпа»: dropping words in, one explainer's turn and its tally. */
  hatWrite: number;
  hatTurn: number;
  hatReveal: number;
  /** «Сумо на льдине», «Квач» and «Захват»: one bout on the arena. */
  brawlPlay: number;
  brawlReveal: number;
  /** «Перетягивание каната»: the countdown, the pull and the result. */
  tugCountdown: number;
  tugPlay: number;
  tugReveal: number;
  missions: number;
  /** Delay after the last answer before moving on, so the TV can show it landing. */
  grace: number;
  /** Extra time per narrated character, so the host finishes speaking. */
  speechPerChar: number;
  /** How long past the estimated end of a line an early finish waits for the TV to report it read. */
  speechSlack: number;
}

export const DURATIONS: Durations = {
  intro: 4500,
  scene: 2500,
  rules: 12_000,
  voteAsk: TIMER_INFO.answer.seconds * 1000,
  voteReveal: 7000,
  predictAsk: TIMER_INFO.answer.seconds * 1000,
  predictReveal: 7000,
  selfieDraw: TIMER_INFO.draw.seconds * 1000,
  photo: TIMER_INFO.photo.seconds * 1000,
  monsterStep: TIMER_INFO.monster.seconds * 1000,
  sharedTurn: TIMER_INFO.shared.seconds * 1000,
  sharedReveal: 9000,
  galleryPerItem: 5000,
  galleryVote: TIMER_INFO.galleryVote.seconds * 1000,
  galleryReveal: 7000,
  scores: 6000,
  guessDraw: TIMER_INFO.guess.seconds * 1000,
  guessReveal: 7000,
  write: TIMER_INFO.write.seconds * 1000,
  scaleAsk: TIMER_INFO.answer.seconds * 1000,
  scaleReveal: 8000,
  storyTurn: TIMER_INFO.story.seconds * 1000,
  storyLine: 1200,
  reflexWait: 4000,
  reflexGo: 3000,
  reflexDecoy: 1100,
  reflexReveal: 7000,
  tiltPlay: TIMER_INFO.tilt.seconds * 1000,
  tiltCountdown: 3500,
  tiltReveal: 7000,
  neverAsk: TIMER_INFO.answer.seconds * 1000,
  neverReveal: 7000,
  tapCountdown: 3500,
  tapPlay: 10_000,
  tapReveal: 7000,
  emojiWrite: 45_000,
  herdWrite: TIMER_INFO.answer.seconds * 1000,
  herdReveal: 8000,
  oddVote: TIMER_INFO.answer.seconds * 1000,
  oddReveal: 9000,
  evenAsk: TIMER_INFO.answer.seconds * 1000,
  evenReveal: 7000,
  percentAsk: TIMER_INFO.answer.seconds * 1000,
  percentGuess: 15_000,
  percentBet: 12_000,
  percentReveal: 8000,
  fibWrite: 45_000,
  fibVote: 25_000,
  fibReveal: 10_000,
  simonStep: 3200,
  simonReveal: 7000,
  replyPick: 25_000,
  foreheadWrite: 30_000,
  foreheadGuess: 25_000,
  foreheadReveal: 8000,
  syncAsk: TIMER_INFO.answer.seconds * 1000,
  syncReveal: 7000,
  bombFuseMin: 12_000,
  bombFuseMax: 26_000,
  bombReveal: 7000,
  closestAsk: TIMER_INFO.answer.seconds * 1000,
  closestReveal: 8000,
  quipWrite: 50_000,
  quipVote: TIMER_INFO.answer.seconds * 1000,
  quipReveal: 7000,
  mimeAct: 60_000,
  truthAsk: TIMER_INFO.answer.seconds * 1000,
  truthReveal: 8000,
  spyTalk: 120_000,
  spyGuess: 20_000,
  spyReveal: 9000,
  clueWrite: 45_000,
  clueGuess: 15_000,
  clueReveal: 6000,
  treasureChoose: 10_000,
  treasureCard: 2800,
  treasureReveal: 8000,
  listWrite: 40_000,
  listReveal: 10_000,
  rpsThrow: 8000,
  rpsReveal: 4500,
  plotChat: 120_000,
  plotCaught: 3000,
  plotGuess: 25_000,
  plotReveal: 12_000,
  dateChat: 60_000,
  datePick: 15_000,
  dateMatch: 7000,
  masqChat: 90_000,
  masqGuess: 40_000,
  masqReveal: 12_000,
  radioWrite: 45_000,
  radioShow: 4000,
  radioVote: 20_000,
  blankWrite: 35_000,
  radioReveal: 8000,
  rushType: 20_000,
  rushVote: 15_000,
  rushReveal: 7000,
  marketChat: 120_000,
  marketReveal: 14_000,
  waveHint: 35_000,
  waveGuess: 25_000,
  waveReveal: 9000,
  orderWrite: 40_000,
  orderSort: 50_000,
  orderReveal: 12_000,
  freezeReady: 4000,
  freezeHold: 3500,
  freezeGrace: 700,
  freezeReveal: 9000,
  mafiaRoles: 10_000,
  mafiaNight: 20_000,
  mafiaDay: 50_000,
  mafiaVote: 20_000,
  mafiaExile: 7000,
  mafiaEnd: 12_000,
  contactWrite: 35_000,
  contactGuess: 30_000,
  contactReveal: 8000,
  bandCountdown: 4000,
  bandPlay: 19_200,
  bandReveal: 8000,
  caseSurvey: 40_000,
  caseClue: 25_000,
  caseReveal: 12_000,
  rhymeWrite: 45_000,
  rhymeVote: 20_000,
  rhymeReveal: 8000,
  junkWrite: 45_000,
  junkBid: 14_000,
  junkSold: 6000,
  ninjaCountdown: 3500,
  ninjaPlay: 30_000,
  ninjaReveal: 8000,
  copyShow: 7000,
  copyDraw: 60_000,
  taleDraw: 70_000,
  taleClue: 30_000,
  taleVote: 25_000,
  taleReveal: 10_000,
  quizAsk: 12_000,
  quizReveal: 6000,
  yearsAsk: 25_000,
  yearsReveal: 7000,
  cloverWrite: 75_000,
  cloverGuess: 45_000,
  cloverReveal: 9000,
  shakerCountdown: 3500,
  shakerPlay: 15_000,
  shakerReveal: 8000,
  hatWrite: 30_000,
  hatTurn: 35_000,
  hatReveal: 6000,
  brawlPlay: 40_000,
  brawlReveal: 9000,
  tugCountdown: 3000,
  tugPlay: 20_000,
  tugReveal: 8000,
  missions: 14_000,
  grace: 1200,
  speechPerChar: 65,
  speechSlack: 6000,
};


/** Phases where people type, pick or draw; only these stretch with the pace. */
const ANSWER_PHASES: (keyof Durations)[] = [
  'rules',
  'voteAsk',
  'predictAsk',
  'selfieDraw',
  'photo',
  'monsterStep',
  'sharedTurn',
  'galleryVote',
  'guessDraw',
  'write',
  'scaleAsk',
  'storyTurn',
  'neverAsk',
  'emojiWrite',
  'herdWrite',
  'oddVote',
  'evenAsk',
  'percentAsk',
  'percentGuess',
  'percentBet',
  'fibWrite',
  'fibVote',
  'replyPick',
  'foreheadWrite',
  'foreheadGuess',
  'hatWrite',
  'cloverWrite',
  'cloverGuess',
  'yearsAsk',
  'copyDraw',
  'caseSurvey',
  'caseClue',
  'contactWrite',
  'contactGuess',
  'rhymeWrite',
  'rhymeVote',
  'junkWrite',
  'junkBid',
  'taleDraw',
  'taleClue',
  'taleVote',
  'mafiaNight',
  'mafiaVote',
  'syncAsk',
  'closestAsk',
  'quipWrite',
  'quipVote',
  'mimeAct',
  'truthAsk',
  'spyTalk',
  'spyGuess',
  'clueWrite',
  'clueGuess',
  'treasureChoose',
  'listWrite',
  'rpsThrow',
  'masqGuess',
  'radioWrite',
  'radioVote',
  'blankWrite',
  'rushVote',
  'waveHint',
  'waveGuess',
  'orderWrite',
  'orderSort',
];

/** «Блиц»: answer phases run this share of their length. */
const BLITZ_FACTOR = 0.65;

/** The same durations with the answer phases cut short, for a «Блиц» round. */
export function blitzDurations(base: Durations): Durations {
  const out = { ...base };
  for (const key of ANSWER_PHASES) out[key] = Math.round(base[key] * BLITZ_FACTOR);
  return out;
}

export function pacedDurations(base: Durations, pace: Pace): Durations {
  const out = { ...base };
  for (const key of ANSWER_PHASES) out[key] = Math.round(base[key] * PACE_FACTOR[pace]);
  return out;
}

/** Which phase lengths each host-set timer replaces. */
const TIMER_FIELDS: Record<TimerId, (keyof Durations)[]> = {
  answer: ['voteAsk', 'predictAsk', 'scaleAsk', 'neverAsk', 'herdWrite', 'oddVote', 'evenAsk', 'percentAsk', 'percentBet', 'fibVote', 'replyPick', 'foreheadGuess', 'syncAsk', 'closestAsk', 'quipVote', 'truthAsk', 'clueGuess', 'treasureChoose'],
  draw: ['selfieDraw', 'copyDraw', 'taleDraw'],
  monster: ['monsterStep'],
  shared: ['sharedTurn'],
  guess: ['guessDraw', 'mimeAct'],
  write: ['write', 'emojiWrite', 'quipWrite', 'clueWrite', 'fibWrite', 'foreheadWrite', 'hatWrite', 'rhymeWrite', 'junkWrite'],
  story: ['storyTurn'],
  photo: ['photo'],
  tilt: ['tiltPlay'],
  galleryVote: ['galleryVote'],
};

/** Applies the host's own timers (seconds) on top of paced durations; a set timer ignores the pace. */
export function withTimers(base: Durations, timers: Settings['timers']): Durations {
  const out = { ...base };
  for (const [id, seconds] of Object.entries(timers) as [TimerId, number][]) {
    for (const field of TIMER_FIELDS[id] ?? []) out[field] = seconds * 1000;
  }
  return out;
}

export function scaledDurations(factor: number): Durations {
  const out = { ...DURATIONS };
  for (const key of Object.keys(out) as (keyof Durations)[]) out[key] = Math.round(out[key] * factor);
  return out;
}
