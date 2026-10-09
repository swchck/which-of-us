// Wire protocol shared by the server, the TV host and the phones.
// Every message is a JSON object with a `t` discriminator.

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const NAME_MAX = 14;

export const PLAYER_COLORS = [
  '#ff4f8b',
  '#ffb81f',
  '#2ed47a',
  '#22b8ff',
  '#a66bff',
  '#ff7a2f',
  '#14d4c4',
  '#f75cff',
] as const;

export const INK_COLORS = [
  '#1b1033',
  '#ffffff',
  '#ff3b5c',
  '#ff9f1c',
  '#ffe14d',
  '#2ed47a',
  '#1fa5ff',
  '#8b5cf6',
  '#ff7ac8',
  '#8a5a3c',
] as const;

export const ERASER = 'erase';

/** Normalized board width; heights depend on the board kind. */
const BOARD_W = 1000;

export interface Board {
  w: number;
  h: number;
}

export const BOARDS = {
  selfie: { w: BOARD_W, h: 1000 },
  monster: { w: BOARD_W, h: 700 },
  shared: { w: BOARD_W, h: 625 },
  describe: { w: BOARD_W, h: 750 },
} as const satisfies Record<string, Board>;

/** Height of the strip of the previous monster section shown above the current one. */
export const MONSTER_GUIDE = 110;

export interface Stroke {
  /** Hex color or ERASER. */
  c: string;
  /** Width in board units. */
  w: number;
  /** Flat list of x,y pairs in board units, rounded to integers. */
  p: number[];
}

export const LOCATIONS = [
  'party',
  'camp',
  'space',
  'ocean',
  'city',
  'jungle',
  'snow',
  'desert',
  'castle',
  'arcade',
  'beach',
  'circus',
  'farm',
  'museum',
  'plane',
  'restaurant',
  'dino',
  'pirate',
  'cinema',
  'stadium',
  'train',
  'school',
  'ski',
  'candy',
  'lab',
  'volcano',
  'market',
  'zoo',
  'japan',
  'fair',
  'egypt',
  'bowling',
  'forest',
  'future',
  'mine',
  'race',
  'pumpkin',
  'sky',
  'dacha',
  'wedding',
  'karaoke',
  'gym',
  'office',
  'newyear',
  'repair',
  'clinic',
  'commute',
  'moving',
  'feast',
  'roadtrip',
  'mystery',
] as const;
export type LocationId = (typeof LOCATIONS)[number];

/** Mini-games the host can switch on and off; the «Кто из нас?» vote itself always plays. */
export const GAMES = [
  'predict',
  'scale',
  'quote',
  'lie',
  'guess',
  'selfie',
  'describe',
  'monster',
  'shared',
  'story',
  'photo',
  'tilt',
  'reflex',
  'never',
  'tap',
  'emoji',
  'herd',
  'duel',
  'sync',
  'bomb',
  'closest',
  'quip',
  'mime',
  'truth',
  'spy',
  'clue',
  'treasure',
  'list',
  'rps',
  'plot',
  'date',
  'masq',
  'radio',
  'rush',
  'blank',
  'market',
  'wave',
  'order',
  'freeze',
  'sumo',
  'tag',
  'tug',
  'paint',
  'hat',
  'mafia',
  'just',
  'shaker',
  'clover',
  'quiz',
  'years',
  'tale',
  'copy',
  'rhyme',
  'junk',
  'ninja',
  'case',
  'contact',
  'band',
  'odd',
  'even',
  'percent',
  'fib',
  'simon',
  'reply',
  'forehead',
] as const;
export type GameId = (typeof GAMES)[number];

/**
 * General question sets that can come up in any place; they set the company's tone, while the
 * situations (office, school, travel…) live with the places themselves.
 */
export const PACKS = ['party', 'family', 'whatif', 'birthday', 'spicy'] as const;

/** Neural narrator engines; each runs as a local worker next to the server when it is installed. */
export const TTS_ENGINES = ['vosk'] as const;
export type TtsEngine = (typeof TTS_ENGINES)[number];
/** How a voice is shaped; mirrors `Tune` in tts/protocol.py, where each key is explained. */
export interface TtsTune {
  speed?: number;
  timbre?: number;
  noise?: number;
  noise_w?: number;
}
/** Longest sentence the server will synthesize; narrator lines are a fraction of this. */
export const TTS_SENTENCE_MAX = 400;
export type PackId = (typeof PACKS)[number];

export interface PublicPlayer {
  id: string;
  name: string;
  color: number;
  /** Asset id of the selfie, absent until one is uploaded. */
  selfie?: string;
  connected: boolean;
  score: number;
  /** Jokers left; each doubles the points of one «Кто из нас?» or «Угадай ответ» answer. */
  jokers: number;
  /** Index into TEAM_INFO while a team game runs; a game for exactly two people puts both on team 0. */
  team?: number;
  vip: boolean;
  bot: boolean;
}

export interface GalleryItem {
  id: string;
  authors: string[];
  kind: 'selfie' | 'photo' | 'monster' | 'shared' | 'guess' | 'describe' | 'copy';
  /** Asset id of a JSON Stroke[] drawing. */
  ink?: string;
  /** Asset id of a background or photo image. */
  image?: string;
  board?: Board;
  caption: string;
}

export interface Award {
  title: string;
  detail: string;
  player: string;
}

interface RankRow {
  player: string;
  score: number;
  delta: number;
  place: number;
}

export type Phase =
  | { kind: 'lobby' }
  | {
      kind: 'intro';
      episode: number;
      episodes: number;
      location: LocationId;
      title: string;
      /** Spotlight round: every question this round is about this player. */
      hero?: string;
      /** A twist on this round's scoring or timers. */
      modifier?: RoundModifier;
    }
  /** The round moves to another scene of its place: a card and a line from the narrator. */
  | { kind: 'scene'; location: LocationId; scene: string; title: string }
  /** How to play, shown before a mini-game's first round in a party. */
  | { kind: 'rules'; game: GameId; deadline: number; ready: string[] }
  | {
      kind: 'vote';
      question: string;
      options: string[];
      allowSelf: boolean;
      /** majority: points for agreeing with the crowd; received: points per vote received. */
      scoring: 'majority' | 'received';
      deadline: number;
      answered: string[];
      bonus: boolean;
      /** «Кто это написал?»: the question is an anonymous answer and the vote is for its author. */
      quote?: boolean;
      /** «Эмодзи-портрет»: the question is a row of emoji and the vote is for who they describe. */
      emoji?: boolean;
      /** «Дуэль»: the options are the two duelists, who sit this vote out. */
      duel?: boolean;
      /** Someone in the room wrote this question in the lobby. */
      custom?: boolean;
    }
  | {
      kind: 'voteReveal';
      question: string;
      votes: { from: string; to: string }[];
      leaders: string[];
      gains: Record<string, number>;
      title?: string;
      /** «Кто это написал?»: who really wrote the quote; «Эмодзи-портрет»: who picked the emoji. */
      author?: string;
      /** «Эмодзи-портрет»: who the emoji were about. */
      about?: string;
      /** The audience's favourite, when anyone in the audience voted; ties go to the first one picked. */
      crowd?: CrowdPick;
      /** Who played a joker on this question; their points are already doubled in `gains`. */
      jokers?: string[];
      /** Everyone picked the same person, which earns every voter a joker. */
      unanimous?: boolean;
    }
  | {
      kind: 'predict';
      question: string;
      target: string;
      options: string[];
      deadline: number;
      answered: string[];
      /** «Кто соврал?»: the options are the target's statements and the guess is which one is the lie. */
      lie?: boolean;
    }
  | {
      kind: 'predictReveal';
      question: string;
      target: string;
      options: string[];
      /** Index of the target's answer, -1 when the target did not answer. */
      correct: number;
      guesses: Record<string, number>;
      gains: Record<string, number>;
      lie?: boolean;
      jokers?: string[];
    }
  | {
      kind: 'draw';
      /** `copy` redraws a picture the TV just hid; `tale` keeps the drawings off the TV, since «Сказочник» hides who drew what. */
      mode: 'selfie' | 'monster' | 'describe' | 'copy' | 'tale';
      prompt: string;
      /** Selfie mode: whose selfie is drawn on. */
      subject?: string;
      /** Selfie mode: asset id of the background image. */
      image?: string;
      board: Board;
      deadline: number;
      done: string[];
      /** Describe mode: who reads the secret scene out loud; the prompt stays empty until the gallery. */
      describer?: string;
      /** Monster mode: current step (0-based) and step names. */
      step?: number;
      steps?: string[];
    }
  /** With `subject`, only that player shoots: the model posing for a drawing. */
  | { kind: 'photo'; prompt: string; deadline: number; done: string[]; subject?: string }
  | {
      kind: 'shared';
      theme: string;
      order: string[];
      turn: number;
      turns: number;
      artist: string;
      task: string;
      deadline: number;
      board: Board;
      /** Asset id of the strokes committed by previous turns. */
      ink?: string;
    }
  | {
      kind: 'gallery';
      prompt: string;
      items: GalleryItem[];
      /** «Срисуй по памяти»: the picture everyone redrew, shown beside the copies. */
      original?: PictureRef;
      /** Server time the one-by-one show starts; voting opens at votingFrom. */
      showFrom: number;
      votingFrom: number;
      deadline: number;
      voted: string[];
    }
  | {
      kind: 'galleryReveal';
      prompt: string;
      items: GalleryItem[];
      original?: PictureRef;
      /** The audience favourite, by item id; it never scores. */
      crowd?: CrowdPick;
      votes: Record<string, string[]>;
      winners: string[];
      gains: Record<string, number>;
    }
  | { kind: 'sharedReveal'; theme: string; ink: string; board: Board; order: string[] }
  | {
      kind: 'guess';
      artist: string;
      /** The word with unrevealed letters as "_", letters separated by spaces. */
      hint: string;
      round: number;
      rounds: number;
      deadline: number;
      board: Board;
      /** Players who guessed, in order. */
      solved: string[];
      /** Latest wrong guesses, newest last. */
      feed: { player: string; text: string }[];
      /** «Крокодил»: the artist acts the word out instead of drawing it; the board stays empty. */
      mime?: boolean;
    }
  | {
      kind: 'guessReveal';
      artist: string;
      word: string;
      ink?: string;
      board: Board;
      solved: string[];
      gains: Record<string, number>;
      mime?: boolean;
    }
  | {
      kind: 'tilt';
      arena: Board;
      /** Server time when balls start moving; before that the TV counts down. */
      startsAt: number;
      deadline: number;
      stars: Record<string, number>;
      /** Team round: each player's team, 0 or 1 (see TEAM_INFO). */
      teams?: Record<string, 0 | 1>;
      /** The same arena for «Сумо на льдине», «Квач» and «Захват» instead of stars. */
      mode?: BrawlMode;
      /** «Захват»: player ids in the order the arena's `paint` letters count them, `a` first. */
      painters?: string[];
      /** «Сумо»: who slid off the ice so far, first faller first. */
      out?: string[];
      /** «Квач»: the hunter right now. */
      it?: string;
    }
  | {
      kind: 'brawlReveal';
      mode: BrawlMode;
      /** Best first: «Сумо» by how long each stayed on the ice, «Квач» by seconds spent not hunting, «Захват» by area. */
      ranking: { player: string; place: number; seconds: number; knockouts: number; area?: number }[];
      gains: Record<string, number>;
    }
  | {
      kind: 'tug';
      teams: Record<string, 0 | 1>;
      startsAt: number;
      deadline: number;
      /** Taps per player so far; the TV also gets them live, between full updates. */
      counts: Record<string, number>;
      /** How far ahead, in taps per player, a team must pull to win outright. */
      gap: number;
    }
  | { kind: 'tugReveal'; teams: Record<string, 0 | 1>; counts: Record<string, number>; winner: 0 | 1 | null; gains: Record<string, number> }
  | {
      kind: 'tiltReveal';
      stars: Record<string, number>;
      gains: Record<string, number>;
      teams?: Record<string, 0 | 1>;
      /** Team round: stars per team and the winning team, null on a draw. */
      teamStars?: [number, number];
      winner?: 0 | 1 | null;
    }
  | {
      kind: 'write';
      prompt: string;
      deadline: number;
      done: string[];
      /** «Кто соврал?» and «Продолжи историю»: only this player writes; slots ask for one line each. */
      author?: string;
      slots?: string[];
      /** «Продолжи историю»: which line of the story is being written, 0-based. */
      story?: { turn: number; turns: number };
      /** «Эмодзи-портрет»: answers are a few emoji about a secretly assigned person. */
      emoji?: boolean;
      /** «Вставь слово»: everyone fills the gap in a sentence about one player. */
      blank?: boolean;
      /** «Стадное чувство»: answers are a word or two, up to HERD_MAX characters. */
      herd?: boolean;
      /** «Чужак в стае»: each phone holds its own question, one of them a different one; the TV shows none. */
      odd?: boolean;
      /** «Словарь выдумок»: the rare word everyone writes a fake definition for. */
      fib?: string;
      /** «Что у меня на лбу?»: everyone but this player writes a hint for the word on their phone. */
      forehead?: string;
      /** «Четырёхлистник»: everyone writes four one-word clues, one per pair of neighbouring words on their clover. */
      clover?: boolean;
      /** «Ровно один»: with `forehead`, matching hints burn before the guesser sees them. */
      just?: boolean;
      /** «Рифмач»: `prompt` is the first line of a couplet, everyone writes the rhyming second. */
      rhyme?: boolean;
      /** «Барахолка»: each seller writes a pitch for their own junk, sent in Personal as `prompt`. */
      junk?: boolean;
      /** «Сказочник»: the teller writes a clue for their own drawing. */
      tale?: boolean;
      /** «Шляпа»: everyone drops one word into the hat. */
      hat?: boolean;
      /** «Битва ответов»: each writer answers their own prompt, sent in Personal; `prompt` stays empty. */
      quip?: boolean;
      /** «Три слова»: each writer explains their own secret word, sent in Personal as `prompt`, in up to three words. */
      clue?: boolean;
    }
  | {
      kind: 'quipVote';
      prompt: string;
      /** Anonymous answers; `id` is what a vote names, never the author. */
      answers: { id: string; text: string }[];
      match: number;
      matches: number;
      deadline: number;
      voted: string[];
    }
  | {
      kind: 'quipReveal';
      prompt: string;
      answers: { id: string; text: string; author: string; votes: string[] }[];
      gains: Record<string, number>;
    }
  | {
      kind: 'herdReveal';
      prompt: string;
      /** Matching answers grouped together, biggest group first; `answer` is how the first of them spelled it. */
      groups: { answer: string; players: string[] }[];
      gains: Record<string, number>;
    }
  | {
      kind: 'never';
      /** Completes «Я никогда не…». */
      statement: string;
      round: number;
      rounds: number;
      deadline: number;
      answered: string[];
      /** How many people answer, the top of the «how many said yes» guess. */
      players: number;
    }
  | {
      kind: 'neverReveal';
      statement: string;
      did: string[];
      didNot: string[];
      guesses: Record<string, number>;
      gains: Record<string, number>;
    }
  | {
      kind: 'tap';
      /** Server time the tapping opens; the TV counts down to it. */
      startsAt: number;
      deadline: number;
      counts: Record<string, number>;
    }
  | { kind: 'tapReveal'; counts: Record<string, number>; gains: Record<string, number> }
  | {
      kind: 'sync';
      question: string;
      options: string[];
      round: number;
      rounds: number;
      deadline: number;
      answered: string[];
      /** Who tries to pick alike: pairs, plus one trio when the count is odd. */
      groups: string[][];
    }
  | {
      kind: 'bomb';
      /** Say a word for it out loud before passing. */
      category: string;
      holder: string;
      round: number;
      rounds: number;
      passes: number;
      /** Server time the bomb went live; the fuse length stays secret. */
      startedAt: number;
    }
  | { kind: 'bombReveal'; category: string; loser: string; passes: number; gains: Record<string, number> }
  | {
      kind: 'closest';
      question: string;
      /** Short word shown after numbers, e.g. «лет». */
      unit?: string;
      round: number;
      rounds: number;
      deadline: number;
      answered: string[];
    }
  | {
      kind: 'closestReveal';
      question: string;
      unit?: string;
      answer: number;
      /** Closest first. */
      guesses: { player: string; value: number }[];
      gains: Record<string, number>;
    }
  | {
      kind: 'truth';
      statement: string;
      round: number;
      rounds: number;
      deadline: number;
      answered: string[];
    }
  | {
      kind: 'truthReveal';
      statement: string;
      truth: boolean;
      /** The real story behind the statement. */
      note: string;
      believers: string[];
      doubters: string[];
      gains: Record<string, number>;
    }
  | {
      kind: 'list';
      category: string;
      round: number;
      rounds: number;
      deadline: number;
      /** How many answers each player has so far; the answers stay secret until the reveal. */
      counts: Record<string, number>;
    }
  | {
      kind: 'listReveal';
      category: string;
      /** Every distinct answer with who wrote it, most shared first. */
      items: { text: string; by: string[] }[];
      gains: Record<string, number>;
    }
  | {
      kind: 'rps';
      /** Players left in the tournament; null as `b` is a bye. */
      matches: { a: string; b: string | null }[];
      /** Remaining players before this bracket round: 2 is the final. */
      left: number;
      /** A rethrow of drawn matches. */
      replay: boolean;
      /** Already through to the next bracket round: byes and decided matches. */
      through: string[];
      deadline: number;
      answered: string[];
    }
  | {
      kind: 'rpsReveal';
      /** `coin`: a draw that ran out of rethrows, or nobody threw; `walkover`: somebody had left. */
      matches: { a: string; b: string | null; ta?: RpsThrow; tb?: RpsThrow; winner: string | null; coin?: boolean; walkover?: boolean }[];
      left: number;
      champion?: string;
      gains: Record<string, number>;
    }
  | {
      kind: 'plot';
      target: string;
      deadline: number;
      /** The latest messages in flight, without their text: the TV only shows who writes to whom. */
      flights: ChatFlight[];
      sent: number;
      /** The target has written the secret word; the chat closes a moment later. */
      caught: boolean;
    }
  | {
      kind: 'plotGuess';
      target: string;
      deadline: number;
      /** How many plotters there are, so each guess names exactly that many. */
      plotters: number;
      voters: string[];
      voted: string[];
    }
  | {
      kind: 'date';
      night: number;
      nights: number;
      deadline: number;
      flights: ChatFlight[];
      sent: number;
    }
  | { kind: 'datePick'; night: number; nights: number; deadline: number; voted: string[] }
  | {
      kind: 'dateMatch';
      night: number;
      nights: number;
      /** Who asked whom out tonight. */
      picks: Record<string, string>;
      /** Pairs who picked each other. */
      matches: [string, string][];
      gains: Record<string, number>;
      /** After the last night: everyone's quirk and the nights they kept to it. */
      quirks?: Record<string, { text: string; kept: number }>;
    }
  | {
      kind: 'masq';
      deadline: number;
      /** What the narrator suggests talking about right now. */
      prompt: string;
      /** The latest messages, signed with masks only. */
      feed: { id: number; mask: number; text: string }[];
      masks: number;
    }
  | { kind: 'masqGuess'; deadline: number; masks: number; voted: string[] }
  | {
      kind: 'masqReveal';
      /** Who wore each mask, by mask index. */
      owners: string[];
      /** Each guesser's pick per mask index; null where they skipped or the mask was their own. */
      guesses: Record<string, (string | null)[]>;
      gains: Record<string, number>;
    }
  | {
      kind: 'rush';
      /** Who the urgent message is from, with an emoji, and what it says. */
      from: string;
      message: string;
      round: number;
      rounds: number;
      deadline: number;
      /** Everyone's reply as typed so far; it only ever grows. */
      texts: Record<string, string>;
      done: string[];
    }
  /** `ask` is the question on the phones, «Какой ответ лучше?» when absent. */
  | { kind: 'rushVote'; from: string; message: string; replies: { player: string; text: string }[]; deadline: number; voted: string[]; ask?: string }
  | {
      kind: 'rushReveal';
      from: string;
      message: string;
      replies: { player: string; text: string; votes: string[] }[];
      gains: Record<string, number>;
      /** «Чужак в стае»: who had the other question, and what it was. */
      odd?: { player: string; question: string };
      /** The audience favourite, by `player`; it never scores. */
      crowd?: CrowdPick;
    }
  /** «Сколько процентов?»: everyone answers yes or no in secret. */
  | { kind: 'percent'; question: string; hero: string; round: number; rounds: number; deadline: number; answered: string[] }
  /** The hero guesses the share of yeses, in steps of PERCENT_STEP. */
  | { kind: 'percentGuess'; question: string; hero: string; deadline: number }
  /** The others bet whether the real share is higher or lower than the hero's guess. */
  | { kind: 'percentBet'; question: string; hero: string; guess: number; deadline: number; answered: string[] }
  | {
      kind: 'percentReveal';
      question: string;
      hero: string;
      guess: number;
      /** The real share of yeses, 0–100. */
      share: number;
      higher: string[];
      lower: string[];
      gains: Record<string, number>;
    }
  /** «Словарь выдумок»: the real definition hides among the fakes; `id` is opaque so authors stay hidden. */
  | {
      kind: 'fibVote';
      word: string;
      options: { id: string; text: string }[];
      deadline: number;
      voted: string[];
      /** The game's title and the question on the phones; «Словарь выдумок» when absent. */
      title?: string;
      ask?: string;
    }
  | {
      kind: 'fibReveal';
      word: string;
      /** `author` is absent on the real definition, whose id is `truth`. */
      options: { id: string; text: string; author?: string; votes: string[] }[];
      /** Empty when there is no right answer, only a favourite. */
      truth: string;
      gains: Record<string, number>;
      title?: string;
    }
  /** «Подбери реплику»: each phone picks the phrase from its hand that fits the situation best. */
  | { kind: 'replyPick'; situation: string; round: number; rounds: number; deadline: number; done: string[] }
  /** «Что у меня на лбу?»: the guesser reads the hints and types the word. */
  | { kind: 'foreheadGuess'; guesser: string; hints: ForeheadHint[]; deadline: number; just?: boolean }
  | { kind: 'foreheadReveal'; guesser: string; word: string; guess: string; right: boolean; hints: ForeheadHint[]; gains: Record<string, number>; just?: boolean }
  /** «Мафия-ТВ»: the phones hand out roles; nobody shows theirs. */
  | { kind: 'mafiaRoles'; deadline: number; alive: string[] }
  /** Every phone picks someone at night, villagers too, so nobody gives a role away by tapping. */
  | { kind: 'mafiaNight'; night: number; nights: number; deadline: number; alive: string[]; done: string[] }
  /** `victim` is who the wolves took, absent on a quiet night; `saved` when the doctor got there first. */
  | { kind: 'mafiaDay'; day: number; days: number; deadline: number; alive: string[]; victim?: string; saved: boolean }
  | { kind: 'mafiaVote'; day: number; deadline: number; alive: string[]; voted: string[] }
  | { kind: 'mafiaExile'; day: number; alive: string[]; exiled?: string; role?: MafiaRole; votes: { from: string; to: string }[] }
  | { kind: 'mafiaEnd'; winner: 'wolves' | 'village'; roles: Record<string, MafiaRole>; alive: string[]; gains: Record<string, number> }
  /**
   * «Четырёхлистник»: one player's clover. Clue `k` sits between corners `k` and `k + 1` (clockwise from the
   * top left); the room places four of the five `cards` on the corners.
   */
  | { kind: 'clover'; author: string; clues: string[]; cards: string[]; round: number; rounds: number; deadline: number; done: string[] }
  /** `words` in corner order; `picks` are each guesser's card indexes per corner. */
  | { kind: 'cloverReveal'; author: string; clues: string[]; cards: string[]; words: string[]; picks: Record<string, number[]>; gains: Record<string, number> }
  /** «Срисуй по памяти»: the picture shows for a few seconds, then hides for the drawing. */
  | { kind: 'copyShow'; picture: PictureRef; deadline: number }
  /** «Сказочник»: the teller's clue; the drawings carry no authors until the reveal. */
  | { kind: 'taleVote'; teller: string; clue: string; items: TaleCard[]; round: number; rounds: number; deadline: number; voted: string[] }
  | { kind: 'taleReveal'; teller: string; clue: string; items: (TaleCard & { author: string; votes: string[] })[]; truth: string; gains: Record<string, number> }
  /**
   * «Контакт»: the leader's word shows as `prefix`; everyone else writes a word on that prefix and a
   * hint to it, then tries to make contact on someone's hint before the leader names the word.
   */
  | { kind: 'contactWrite'; leader: string; prefix: string; step: number; steps: number; deadline: number; done: string[] }
  | { kind: 'contactGuess'; leader: string; prefix: string; hints: { id: string; text: string }[]; deadline: number; done: string[] }
  /** `opened` when a contact got through and the next letter is out; `word` once the leader's word is out. */
  | { kind: 'contactReveal'; leader: string; prefix: string; hints: ContactHint[]; opened: boolean; word?: string; gains: Record<string, number> }
  /**
   * «Оркестр»: `startsAt` is the first beat on the server clock, `beat` its length in ms; each part's
   * notes are beat positions from 0, halves allowed. `scores` are each player's accuracy in percent.
   */
  | { kind: 'band'; startsAt: number; beat: number; beats: number; parts: Record<string, BandPart>; deadline: number; scores: Record<string, number> }
  | { kind: 'bandReveal'; parts: Record<string, BandPart>; scores: Record<string, number>; gains: Record<string, number> }
  /** «Расследование»: everyone answers the short survey about themselves that the clues will come from. */
  | { kind: 'caseSurvey'; questions: { q: string; options: string[] }[]; deadline: number; done: string[] }
  /** One more clue is out; `accused` have locked their accusation, which they make once. */
  | { kind: 'caseClue'; crime: string; clues: string[]; round: number; rounds: number; deadline: number; accused: string[] }
  /** `clue` is how many clues were out when that accusation was locked, from 1. */
  | { kind: 'caseReveal'; crime: string; culprit: string; clues: string[]; accusations: { player: string; suspect: string; clue: number }[]; gains: Record<string, number> }
  /**
   * «Барахолка»: one lot up for sealed bids. A buyer has `budget` coins for the whole fair, and
   * a lot is worth more to its buyer the more people wanted it.
   */
  | { kind: 'junkBid'; seller: string; item: string; pitch: string; lot: number; lots: number; deadline: number; bids: string[] }
  | { kind: 'junkSold'; seller: string; item: string; pitch: string; buyer?: string; price: number; bidders: string[]; coins: Record<string, number>; gains: Record<string, number> }
  /**
   * «Фруктовый ниндзя»: every lane gets the same `fruits` schedule; `at` is ms after `startsAt`,
   * `x` the launch spot across the lane from 0 to 1, and a fruit stays sliceable for `flight` ms.
   */
  | { kind: 'ninja'; startsAt: number; deadline: number; fruits: NinjaFruit[]; scores: Record<string, number> }
  | { kind: 'ninjaReveal'; scores: Record<string, number>; bombs: Record<string, number>; gains: Record<string, number> }
  /** «Викторина на выбывание»: a wrong or missing answer costs a life; `alive` still have at least one. */
  | { kind: 'quiz'; q: string; options: string[]; n: number; of: number; deadline: number; alive: string[]; lives: Record<string, number>; answered: string[] }
  /** `out` lost their last life on this question. */
  | { kind: 'quizReveal'; q: string; options: string[]; answer: number; picks: Record<string, number>; lives: Record<string, number>; out: string[]; gains: Record<string, number> }
  /** «В каком году?»: place `event` on the timeline; a slot `i` means before `timeline[i]`, and the last slot after all. */
  | { kind: 'years'; event: string; timeline: YearCard[]; round: number; rounds: number; deadline: number; done: string[] }
  | { kind: 'yearsReveal'; event: string; year: number; timeline: YearCard[]; slot: number; picks: Record<string, number>; gains: Record<string, number> }
  /** «Шейкер»: pumps per balloon so far; each one bursts at its own secret size, and a burst one is out. */
  | { kind: 'shaker'; startsAt: number; deadline: number; sizes: Record<string, number>; popped: string[] }
  | { kind: 'shakerReveal'; sizes: Record<string, number>; popped: string[]; gains: Record<string, number> }
  /** «Шляпа»: one explainer's turn; `left` counts the words still in the hat, the current one included. */
  | { kind: 'hat'; explainer: string; mode: HatMode; round: number; rounds: number; deadline: number; left: number; got: HatCatch[]; feed: { player: string; text: string }[] }
  | { kind: 'hatReveal'; explainer: string; mode: HatMode; round: number; rounds: number; got: HatCatch[]; gains: Record<string, number> }
  /** «Бублик говорит»: one command; only a command that starts with «Бублик говорит» may be obeyed. */
  | { kind: 'simon'; command: string; magic: boolean; color: number; step: number; steps: number; deadline: number; alive: string[]; out: string[] }
  | { kind: 'simonReveal'; alive: string[]; out: string[]; gains: Record<string, number> }
  /** «Поровну»: a question with two answers; the smaller side scores. */
  | { kind: 'even'; question: string; options: [string, string]; round: number; rounds: number; deadline: number; answered: string[] }
  | { kind: 'evenReveal'; question: string; options: [string, string]; sides: [string[], string[]]; gains: Record<string, number> }
  | {
      kind: 'market';
      title: string;
      categories: MarketCategory[];
      deadline: number;
      flights: ChatFlight[];
      sent: number;
      /** Who has named a version, in the order they did. */
      solved: string[];
    }
  | {
      kind: 'marketReveal';
      title: string;
      categories: MarketCategory[];
      /** The right option per category. */
      truth: number[];
      guesses: Record<string, number[]>;
      solved: string[];
      gains: Record<string, number>;
    }
  | { kind: 'radio'; step: number; steps: number; deadline: number; done: string[] }
  | { kind: 'waveHint'; left: string; right: string; psychic: string; round: number; rounds: number; deadline: number }
  | {
      kind: 'waveGuess';
      left: string;
      right: string;
      psychic: string;
      hint: string;
      round: number;
      rounds: number;
      deadline: number;
      answered: string[];
    }
  | {
      kind: 'waveReveal';
      left: string;
      right: string;
      psychic: string;
      hint: string;
      /** The secret point, 0 to WAVE_MAX. */
      target: number;
      guesses: Record<string, number>;
      gains: Record<string, number>;
    }
  | { kind: 'orderWrite'; left: string; right: string; deadline: number; done: string[] }
  | {
      kind: 'orderSort';
      left: string;
      right: string;
      /** Everyone's thing, shuffled; the room puts them from `left` to `right`. */
      cards: { player: string; text: string }[];
      deadline: number;
      done: string[];
    }
  | {
      kind: 'orderReveal';
      left: string;
      right: string;
      /** In the true order, with each card's secret number and how many put it on exactly its place. */
      cards: { player: string; text: string; number: number; exact: number }[];
      gains: Record<string, number>;
    }
  | {
      kind: 'freeze';
      /** `ready` before the first song, then `music` and `freeze` take turns. */
      stage: 'ready' | 'music' | 'freeze';
      round: number;
      rounds: number;
      alive: string[];
      /** Everyone caught so far, with the round and the reason. */
      out: { player: string; round: number; why: FreezeFault }[];
      deadline: number;
    }
  | { kind: 'freezeReveal'; survivors: string[]; out: { player: string; round: number; why: FreezeFault }[]; gains: Record<string, number> }
  | {
      kind: 'radioShow';
      index: number;
      total: number;
      /** The original first (author null), then every retelling with who wrote it. */
      chain: { author: string | null; text: string }[];
    }
  | { kind: 'radioVote'; deadline: number; finals: string[]; voted: string[] }
  | {
      kind: 'radioReveal';
      finals: string[];
      /** Who wrote each final version; null where nobody retold that rumour. */
      authors: (string | null)[];
      tally: number[];
      gains: Record<string, number>;
    }
  | {
      kind: 'plotReveal';
      target: string;
      word: string;
      plotters: string[];
      /** The target's message with the word in it, or null when the target held out. */
      slip: string | null;
      guesses: Record<string, string[]>;
      gains: Record<string, number>;
    }
  | {
      kind: 'clueGuess';
      author: string;
      clue: string;
      /** The secret word and its decoys, shuffled. */
      options: string[];
      round: number;
      rounds: number;
      deadline: number;
      answered: string[];
    }
  | {
      kind: 'clueReveal';
      author: string;
      clue: string;
      word: string;
      options: string[];
      /** Picked word per player who answered. */
      picks: Record<string, string>;
      gains: Record<string, number>;
    }
  | {
      kind: 'treasure';
      /** 'choose': everyone inside decides to go on or leave; 'card': the next card turns over. */
      stage: 'choose' | 'card';
      expedition: number;
      expeditions: number;
      /** Cards turned over so far, oldest first. */
      path: TreasureCard[];
      /** Still in the cave. */
      inside: string[];
      /** Who walked out at the latest decision. */
      left: string[];
      /** Gems carried by each player still inside, lost on a bust. */
      carried: Record<string, number>;
      /** Gems safely out of the cave across all expeditions. */
      banked: Record<string, number>;
      /** Gems left on the path that did not split evenly; leavers share them. */
      loose: number;
      /** Set when a second trap of a kind ended the expedition. */
      bust?: TrapId;
      deadline?: number;
      answered: string[];
    }
  | {
      kind: 'treasureReveal';
      expedition: number;
      expeditions: number;
      /** Gems brought out this expedition per player. */
      haul: Record<string, number>;
      /** Who was still inside on a bust and lost their gems. */
      lost: string[];
      gains: Record<string, number>;
    }
  | {
      kind: 'spy';
      deadline: number;
      /** Who can be accused: everyone playing this round. */
      options: string[];
      voted: string[];
    }
  | { kind: 'spyGuess'; spy: string; options: string[]; deadline: number }
  | {
      kind: 'spyReveal';
      spy: string;
      place: string;
      /** The single most accused player; null on a tie or when nobody voted. */
      accused: string | null;
      caught: boolean;
      /** A caught spy's guess at the place; null when there was no guess. */
      guessed: boolean | null;
      votes: { from: string; to: string }[];
      gains: Record<string, number>;
    }
  | {
      kind: 'syncReveal';
      question: string;
      options: string[];
      groups: string[][];
      /** Option index per player who answered. */
      picks: Record<string, number>;
      gains: Record<string, number>;
    }
  | {
      kind: 'scale';
      question: string;
      target: string;
      /** Labels for 0 and SCALE_MAX. */
      low: string;
      high: string;
      deadline: number;
      answered: string[];
    }
  | {
      kind: 'scaleReveal';
      question: string;
      target: string;
      low: string;
      high: string;
      /** The target's own answer; null when they did not give one. */
      truth: number | null;
      guesses: { player: string; value: number }[];
      gains: Record<string, number>;
    }
  | {
      kind: 'storyReveal';
      /** The opening line first (no author), then each written line. */
      lines: { author?: string; text: string }[];
    }
  | {
      kind: 'reflex';
      round: number;
      rounds: number;
      /** wait and decoy (a blue trap signal): tapping now is a false start; go: tap as fast as possible. */
      stage: 'wait' | 'decoy' | 'go';
      /** Reaction times of the previous round in ms, fastest first; null when the player did not tap in time. */
      last: { player: string; ms: number | null; early: boolean }[];
      tapped: string[];
    }
  | {
      kind: 'reflexReveal';
      /** Best reaction per player in ms; null when every round was a false start or a miss. */
      best: Record<string, number | null>;
      gains: Record<string, number>;
    }
  | { kind: 'scores'; rows: RankRow[] }
  | {
      kind: 'missions';
      results: { player: string; text: string; done: boolean }[];
      gains: Record<string, number>;
    }
  | {
      kind: 'final';
      rows: RankRow[];
      awards: Award[];
      gallery: GalleryItem[];
      moments: Moment[];
      /** A game for two: how many questions the pair answered alike. */
      coop?: { matched: number; asked: number };
      /** Every game this room has finished tonight, this one included. */
      evening: Evening;
      /** Mini-games played in this game, for each phone's own record of what it has tried. */
      played: GameId[];
    };

/** A line worth keeping from tonight, shown at the final and saved to the phone album. */
export interface Moment {
  icon: string;
  /** Where it came from, e.g. «Битва ответов»: and the prompt. */
  label: string;
  text: string;
  /** Who wrote it or who it is about. */
  players: string[];
}

export interface Evening {
  games: number;
  /** First places per player across the evening, most first; ties count for everyone tied. */
  wins: { player: string; count: number }[];
}

export type PhaseKind = Phase['kind'];

/** Phone-only details for the current phase. */
export type Personal =
  | { kind: 'none' }
  | {
      kind: 'vote';
      answer?: string;
      /** The quote up for the vote is this player's own, so they sit it out. */
      mine?: boolean;
      /** A joker is played on this question; absent where jokers are not allowed. */
      joker?: boolean;
    }
  | { kind: 'predict'; role: 'target' | 'guesser'; answer?: number; joker?: boolean }
  | {
      kind: 'draw';
      done: boolean;
      /** Monster mode: what to draw and the guide strokes from the section above (already shifted). */
      section?: string;
      guide?: Stroke[];
      /**
       * Own strokes the server already has, so a reconnecting phone can restore its canvas.
       * Sent once per phase and socket; later views omit it and the phone keeps the earlier copy.
       */
      strokes?: Stroke[];
    }
  | { kind: 'photo'; done: boolean }
  | { kind: 'describe'; scene: string }
  | { kind: 'rules'; ready: boolean }
  | {
      kind: 'write';
      done: boolean;
      /** Someone else is writing, this phone just waits. */
      watching?: boolean;
      /** «Продолжи историю»: the only line of the story the writer gets to see. */
      previous?: string;
      /** «Эмодзи-портрет»: the person this phone describes. */
      about?: string;
      /** «Битва ответов»: this writer's own prompt. */
      prompt?: string;
      /** «Четырёхлистник»: this writer's four words, clockwise from the top left. */
      clover?: string[];
    }
  | {
      kind: 'quipVote';
      /** One of the answers up for this vote is this phone's own, so it sits the vote out. */
      mine: boolean;
      answer?: string;
    }
  | { kind: 'never'; did?: boolean; guess?: number }
  | { kind: 'tap'; count: number }
  | { kind: 'sync'; partners: string[]; answer?: number }
  | {
      kind: 'bomb';
      holding: boolean;
      /** Who the bomb can go to right now: everyone else, except the one who just passed it when there is a choice. */
      targets: string[];
    }
  | { kind: 'closest'; answer?: number }
  /** 1 for «верю», 0 for «не верю». */
  | { kind: 'truth'; answer?: number }
  | { kind: 'clueGuess'; mine: boolean; answer?: string }
  /** This phone's own answers so far, for restoring the list after a reconnect. */
  | { kind: 'list'; items: string[] }
  | { kind: 'rps'; playing: boolean; opponent?: string; answer?: string }
  /** 1 to go deeper, 0 to leave with the gems. */
  | { kind: 'treasure'; inside: boolean; answer?: number }
  | {
      kind: 'plot';
      role: PlotRole;
      target: string;
      /** Plotters see the word, their accomplices and openers to steer the target with. */
      word?: string;
      plotters?: string[];
      lures?: string[];
      chats: ChatThread[];
      /** Messages this phone may still send this round. */
      left: number;
    }
  | { kind: 'plotGuess'; voting: boolean; count: number; answer?: string[] }
  | {
      kind: 'date';
      /** The secret way this player has to write. */
      quirk: string;
      chats: ChatThread[];
      left: number;
    }
  | { kind: 'datePick'; answer?: string }
  | {
      kind: 'masq';
      /** This player's own mask index. */
      mask: number;
      /** The masquerade group; other people's messages come signed with `mask:<index>`. */
      chats: ChatThread[];
      left: number;
    }
  | { kind: 'masqGuess'; mask: number; answer?: (string | null)[] }
  | { kind: 'radio'; incoming: string; original: boolean; done: boolean }
  | { kind: 'rush'; text: string; done: boolean }
  | { kind: 'rushVote'; answer?: string }
  | { kind: 'even'; answer?: number }
  | { kind: 'percent'; answer?: number }
  | { kind: 'percentGuess'; hero: boolean; answer?: number }
  | { kind: 'percentBet'; hero: boolean; answer?: number }
  /** `mine` is this phone's own fake, which it cannot vote for. */
  | { kind: 'fibVote'; mine?: string; answer?: string }
  | { kind: 'simon'; alive: boolean; answer?: number }
  | { kind: 'replyPick'; hand: string[]; answer?: number }
  | { kind: 'foreheadGuess'; guesser: boolean; answer?: string }
  /**
   * «Мафия-ТВ», every phase: the phone's own role, fellow wolves, what the seer learned so far, and the
   * people this phone may pick now; `options` is empty for the dead and outside the night and the vote.
   */
  | { kind: 'mafia'; role: MafiaRole; mates: string[]; alive: boolean; options: string[]; answer?: string; seen: { player: string; wolf: boolean }[] }
  | { kind: 'shaker'; count: number; popped: boolean }
  | { kind: 'clover'; author: boolean; answer?: number[] }
  | { kind: 'quiz'; alive: boolean; answer?: number }
  | { kind: 'junkBid'; seller: boolean; coins: number; answer?: number }
  | { kind: 'caseSurvey'; done: boolean }
  | { kind: 'contactWrite'; leader: boolean; done: boolean }
  /** `mine` is this phone's own hint; the leader may answer every hint, everyone else one. */
  | { kind: 'contactGuess'; leader: boolean; mine?: string; done: boolean }
  | { kind: 'band'; part?: BandPart }
  /** The culprit's phone knows it; everyone else picks a suspect once. */
  | { kind: 'caseClue'; culprit: boolean; answer?: string }
  | { kind: 'ninja'; sliced: number[]; score: number }
  /** `mine` is this phone's own drawing, which it may not vote for. */
  | { kind: 'taleVote'; teller: boolean; mine?: string; answer?: string }
  | { kind: 'years'; answer?: number }
  /** «Шляпа»: `word` only on the explainer's phone; `close` when this guesser's last try was nearly right. */
  | { kind: 'hat'; word?: string; close: boolean; got: number }
  | { kind: 'waveHint'; target: number; sent: boolean }
  | { kind: 'waveGuess'; answer?: number }
  | { kind: 'orderWrite'; number: number; text?: string }
  | { kind: 'orderSort'; number: number; answer?: string[] }
  | { kind: 'freeze'; alive: boolean }
  | {
      kind: 'market';
      /** This player's clues, one per category: the option index it rules out. */
      clues: number[];
      chats: ChatThread[];
      left: number;
      guess?: number[];
    }
  | { kind: 'radioVote'; mine: number[]; answer?: number }
  | {
      kind: 'spy';
      spy: boolean;
      /** Everyone but the spy sees the place. */
      place?: string;
      answer?: string;
    }
  | { kind: 'spyGuess'; spy: boolean; answer?: string }
  | { kind: 'scale'; role: 'target' | 'guesser'; answer?: number }
  | { kind: 'reflex'; early: boolean; ms?: number }
  | {
      kind: 'shared';
      myTurn: boolean;
      /** The artist's own strokes this turn, sent once per phase like draw's, for restoring after a reconnect. */
      strokes?: Stroke[];
    }
  | { kind: 'gallery'; canVote: boolean; own: string[]; answer?: string }
  | {
      kind: 'guess';
      role: 'artist' | 'guesser';
      /** Artist only. */
      word?: string;
      solved: boolean;
      /** Verdict on the latest guess. */
      feedback?: 'close' | 'wrong';
      tries: string[];
      /** Artist only: strokes already on the server, for restoring after a reconnect; sent like draw's. */
      strokes?: Stroke[];
    }
  | { kind: 'tilt'; stars: number; status?: 'it' | 'free' | 'out' | 'on' | 'paint' }
  | { kind: 'tug'; count: number; team: 0 | 1 };

export type RelayState = 'off' | 'connecting' | 'online' | 'error';

export interface RelayView {
  state: RelayState;
  /** Why the last attempt failed: no answer at all, or the relay turned this computer away. */
  error?: 'unreachable' | 'rejected';
}

export interface RoomView {
  code: string;
  phaseId: number;
  phase: Phase;
  players: PublicPlayer[];
  /** Narrator caption for the phase; the host speaks it. */
  say?: string;
  serverNow: number;
  joinUrl: string;
  paused: boolean;
  /** «Поехали!» was pressed and the narrator's voice is still loading; the game starts once it is ready. */
  warming?: boolean;
  settings: Settings;
  httpsAvailable: boolean;
  /** The internet relay's connection, or null where this server has no relay to offer. */
  relay: RelayView | null;
  /** Rough game length in minutes for 1, 2 and 3 episodes with the current settings. */
  minutes: number[];
  /** Location of the current episode, for the backdrop and music. */
  location?: LocationId;
  /** Scene of the place the round is in now (shared/scenes.ts); absent while at the place itself. */
  scene?: string;
  /** Connected audience phones. */
  audience: number;
  /** Phones join over the local network; false when the game is hosted on the internet. */
  lan: boolean;
  /** Questions the room wrote and the game has not asked yet. */
  customCount: number;
  /** TV only: the questions themselves, so the host can weed out the bad ones. */
  custom?: CustomQuestion[];
}

/** vote: «Кто из нас…?» about everyone; predict and scale: about one person, `{name}` in the text. */
export const QUESTION_KINDS = ['vote', 'predict', 'scale'] as const;
export type QuestionKind = (typeof QUESTION_KINDS)[number];

/** What an editor sends; the server fills in the id and author. */
export interface QuestionDraft {
  kind?: QuestionKind;
  text: string;
  /** predict: 2..PREDICT_OPTIONS_MAX answers the person picks from. */
  options?: string[];
  /** scale: captions for 0 and for SCALE_MAX. */
  low?: string;
  high?: string;
}

export const PREDICT_OPTIONS_MAX = 4;
export const OPTION_MAX = 40;
export const SCALE_LABEL_MAX = 24;
/** Stands for the person a predict or scale question is about, as typed in editors. */
export const NAME_TOKEN = '{имя}';

export interface CustomQuestion {
  id: string;
  kind: QuestionKind;
  /** predict and scale carry `{name}` where the person's name goes. */
  text: string;
  options?: string[];
  low?: string;
  high?: string;
  /** Player who wrote it; absent when typed on the TV. */
  by?: string;
}

export const CUSTOM_MAX = 90;
/** Top of the «Шкала» range; answers are whole numbers from 0. */
export const SCALE_MAX = 10;
/** «Сколько процентов?»: the hero's guess moves in these steps. */
export const PERCENT_STEP = 10;
/** «Бублик говорит»: the four buttons on the phone, in order. */
export const SIMON_COLORS = ['красную', 'синюю', 'зелёную', 'жёлтую'] as const;
/** Room-wide and per-player caps, so one keen phone cannot fill the whole game. */
export const CUSTOM_LIMIT = 40;
export const CUSTOM_PER_PLAYER = 8;

export const PACES = ['relaxed', 'normal', 'brisk'] as const;
export type Pace = (typeof PACES)[number];

/** Answer timers the host can set by hand, in seconds; unset ones follow the pace. */
export const TIMERS = ['answer', 'draw', 'monster', 'shared', 'guess', 'write', 'story', 'photo', 'tilt', 'galleryVote'] as const;
export type TimerId = (typeof TIMERS)[number];

export const ROUNDS_MAX = 6;
/** Questions in a round: «Кто из нас?» votes, or questions about the hero in a spotlight round. */
export const QUESTIONS_MIN = 5;
export const QUESTIONS_MAX = 15;
export const MINIS_MIN = 1;
export const MINIS_MAX = 3;
/** mixed: mini-games land between random questions; even: spread at equal gaps. */
export const PLACEMENTS = ['mixed', 'even'] as const;
export type Placement = (typeof PLACEMENTS)[number];

export interface Settings {
  /** Rounds, 1..ROUNDS_MAX. */
  episodes: number;
  questions: number;
  /** Mini-games played between the questions of a round, MINIS_MIN..MINIS_MAX. */
  minis: number;
  placement: Placement;
  /** Every second round puts one player in the spotlight and asks only about them. */
  spotlight: boolean;
  /** People may vote for their own drawing or photo. */
  selfVote: boolean;
  /** Everyone gets a secret objective for the whole party. */
  missions: boolean;
  /** Two teams whose members' points add up; needs at least four players. */
  teams: boolean;
  /** Some rounds get a twist: double points, short timers, or a boost for those behind. */
  modifiers: boolean;
  timers: Partial<Record<TimerId, number>>;
  /** How much time people get to answer and draw; reveals keep their length. */
  pace: Pace;
  narrator: boolean;
  music: boolean;
  /** Point phones at the HTTPS listener, which tilt sensors require. */
  secure: boolean;
  /** Phones join through the internet relay instead of the local network; wins over `secure`. */
  relay: boolean;
  /** Never empty for locations and packs; an empty games list leaves only the votes. */
  games: GameId[];
  locations: LocationId[];
  packs: PackId[];
}

/** RoomView fields only the TV uses; phones get the rest, which keeps every phone update smaller. */
export type HostOnly = 'joinUrl' | 'httpsAvailable' | 'relay' | 'minutes' | 'lan' | 'settings' | 'custom';

export interface PlayerView extends Omit<RoomView, HostOnly> {
  settings: Pick<Settings, 'selfVote'>;
  you: string;
  personal: Personal;
  /** This player's secret mission for the party, when missions are on. */
  mission?: { text: string; done: boolean };
  /** This phone joined mid-game or into a full room: it watches and votes for fun, without points. */
  spectator?: boolean;
}

export type InkOp =
  /** Points appended to the stroke in progress since the previous move; the first move starts it. */
  | { k: 'move'; s: Stroke }
  /** The finished stroke in full, which replaces whatever the moves built up. */
  | { k: 'end'; s: Stroke }
  | { k: 'undo' }
  | { k: 'clear' };

export type ClientMsg =
  | { t: 'host.create' }
  | { t: 'host.resume'; code: string; token: string }
  | { t: 'host.start' }
  | { t: 'host.skip' }
  | { t: 'host.pause'; paused: boolean }
  /** The narrator voice the TV speaks with; `engine` is null for the browser's own voice. */
  | { t: 'host.voice'; engine: TtsEngine | null; voice: string }
  | { t: 'host.addBot' }
  | { t: 'host.kick'; player: string }
  /** Gives the VIP role (start, pause, skip from the phone) to this person. */
  | { t: 'host.vip'; player: string }
  | ({ t: 'host.question' } & QuestionDraft)
  | { t: 'host.dropQuestion'; id: string }
  | { t: 'host.settings'; settings: Partial<Settings> }
  /** The TV has finished reading out the narration of this phase. */
  /** `voiced` is false when the narrator is off and the line was only shown, which people still need time to read. */
  | { t: 'host.spoken'; phaseId: number; voiced?: boolean }
  /** Saves a bug report on the server's computer; the TV adds what only it knows about its screen. */
  | { t: 'host.report'; client: { agent: string; width: number; height: number; dpr: number } }
  /** Back to the lobby; with `start` a new game begins right away with the same settings. */
  | { t: 'host.again'; start?: boolean }
  | { t: 'join'; code: string; name: string; color: number }
  | { t: 'resume'; code: string; token: string }
  | { t: 'leave' }
  | { t: 'color'; color: number }
  /** A new display name, lobby only. */
  | { t: 'rename'; name: string }
  /** Doubles this player's points for the current question, spending one joker. */
  | { t: 'joker'; phaseId: number }
  /** A lobby-written «Кто из нас?» question. */
  | ({ t: 'question' } & QuestionDraft)
  | { t: 'start' }
  | { t: 'again'; start?: boolean }
  /** The VIP phone doubles as a remote: pause and skip like the TV's buttons. */
  | { t: 'pause'; paused: boolean }
  | { t: 'skip' }
  | { t: 'answer'; phaseId: number; value: string | number | (string | null)[] | number[] | ChatPost | RushDraft }
  | { t: 'ink'; phaseId: number; op: InkOp }
  | { t: 'submit'; phaseId: number }
  | { t: 'guess'; phaseId: number; text: string }
  /** Tilt input, each axis in [-1, 1]; +y points toward the bottom of the arena. */
  | { t: 'tilt'; phaseId: number; x: number; y: number }
  | { t: 'ping'; at: number };

export type ServerMsg =
  | { t: 'host.welcome'; code: string; token: string }
  /** Where the bug report landed, or null when it could not be written. */
  | { t: 'host.reported'; dir: string | null; screenshot: boolean }
  | { t: 'welcome'; code: string; token: string; you: string }
  | { t: 'room'; view: RoomView }
  | { t: 'me'; view: PlayerView }
  | { t: 'ink'; player: string; op: InkOp }
  | { t: 'error'; code: ErrorCode; message: string }
  | { t: 'kicked' }
  | { t: 'arena'; phaseId: number; snap: ArenaSnap }
  /** Everything the current artist has drawn so far, for a screen that just (re)connected mid-drawing. */
  | { t: 'inkFull'; phaseId: number; player: string; strokes: Stroke[] }
  /** TV only: live «Тапалка» totals, so the race does not cost every phone a full state update. */
  | { t: 'tap'; phaseId: number; counts: Record<string, number> }
  | { t: 'pong'; at: number; serverNow: number };

/** Compact arena state streamed to the TV: balls as [id, x, y], stars as [id, x, y, big]. */
export interface ArenaSnap {
  balls: [string, number, number][];
  stars: [number, number, number, 0 | 1][];
  /** Stars collected since the previous snapshot, as [player, starId, value]. */
  hits: [string, number, number][];
  /** «Сумо»: radius of the ice floe around the arena's centre; balls that slid off are gone from `balls`. */
  floe?: number;
  /** «Квач»: who is the hunter. */
  it?: string;
  /** «Захват»: the floor row by row, one letter per cell: `.` is bare, `a` the first of the phase's painters and so on. */
  paint?: string;
}

export type BrawlMode = 'sumo' | 'tag' | 'paint';
export const MAFIA_ROLES = ['wolf', 'doctor', 'seer', 'villager'] as const;
export type MafiaRole = (typeof MAFIA_ROLES)[number];
/** A drawing (`ink`, an asset of Stroke[]) or an image (`image`, an asset id or a path from `/`) on its board. */
export interface PictureRef {
  ink?: string;
  image?: string;
  board: Board;
}
export interface TaleCard {
  id: string;
  ink: string;
  board: Board;
}
/** «Двойные очки» doubles every gain; «Блиц» shortens answer timers; «Помощь отстающим» boosts the bottom half. */
export const ROUND_MODIFIERS = ['double', 'blitz', 'underdog'] as const;
export type RoundModifier = (typeof ROUND_MODIFIERS)[number];
/** What the audience phones liked best: the pick, its votes and how many voted. */
export interface CrowdPick {
  pick: string;
  votes: number;
  total: number;
}
export interface ContactHint {
  id: string;
  text: string;
  author: string;
  word: string;
  /** Who named the author's word; empty when nobody did. */
  contacts: string[];
  /** The leader named it first, so the contact did not count. */
  blocked: boolean;
}
export const BAND_INSTRUMENTS = ['drum', 'clap', 'bell', 'bass'] as const;
export type BandInstrument = (typeof BAND_INSTRUMENTS)[number];
export interface BandPart {
  instrument: BandInstrument;
  notes: number[];
}
export interface NinjaFruit {
  id: number;
  at: number;
  x: number;
  flight: number;
  /** An emoji; `💣` is a bomb that costs points when sliced. */
  kind: string;
}
/** «Барахолка»: the coins each buyer starts the fair with, and the bids a phone can place. */
export const JUNK_BUDGET = 300;
export const JUNK_BIDS = [0, 50, 100, 150] as const;
export const NINJA_BOMB = '💣';
export const NINJA_FRUIT_POINTS = 10;
export const NINJA_BOMB_POINTS = 30;
/** «Шейкер»: a balloon bursts somewhere between these pump counts, about 2 to 6 seconds of hard tapping. */
export const SHAKER_POP_MIN = 35;
export const SHAKER_POP_MAX = 110;
export const QUIZ_LIVES = 3;
export interface YearCard {
  e: string;
  year: number;
}
/** «Четырёхлистник»: corners on a clover; there are as many clues as corners, each between two of them. */
export const CLOVER_SIZE = 4;
/** «Шляпа»: the three rounds over the same words: talk freely, one word only, gestures only. */
export const HAT_MODES = ['talk', 'word', 'mime'] as const;
export type HatMode = (typeof HAT_MODES)[number];
/** «Что у меня на лбу?» and «Ровно один»: a burnt hint keeps its author but shows no text until the reveal. */
export interface ForeheadHint {
  player: string;
  text: string;
  cancelled?: boolean;
}
export interface HatCatch {
  word: string;
  player: string;
}
/** «Захват»: the floor grid; 32×16 keeps a cell at 50 TV pixels, a little under a ball. */
export const PAINT = { cols: 32, rows: 16 } as const;

/** Arena size and ball, star and starting ice floe sizes, in TV pixels. */
export const ARENA = { w: 1600, h: 800, ball: 58, star: 34, floe: 380 } as const;
export const GUESS_MAX = 32;
/** Longest «Кто это написал?» answer in characters. */
export const QUOTE_MAX = 60;
export const HERD_MAX = 30;
export const QUIP_MAX = 50;
/** «Словарь выдумок»: a fake definition, about as long as a real dictionary one. */
export const FIB_MAX = 80;
export const CLUE_MAX = 40;
export const LIST_ITEM_MAX = 24;
export const LIST_MAX_ITEMS = 30;
/** Shorter answers are a letter of mashing, not a word. */
export const LIST_MIN_KEY = 2;

export const RPS_THROWS = ['rock', 'scissors', 'paper'] as const;

/** One message in the phone messenger. `at` is server time in ms. */
export interface ChatMessage {
  id: number;
  from: string;
  text: string;
  at: number;
}

/**
 * A conversation: a direct chat (`dm:<id>:<id>`, ids sorted, see `dmThread`) or a group with a title.
 * Direct chats exist from their first message on.
 */
export interface ChatThread {
  id: string;
  title?: string;
  members: string[];
  messages: ChatMessage[];
}

/** A direct message seen from the TV: who wrote to whom, never what. */
export interface ChatFlight {
  id: number;
  from: string;
  to: string;
}

/** What a phone sends to post a message. */
export interface ChatPost {
  thread: string;
  text: string;
}

export const CHAT_MESSAGE_MAX = 140;
export const CHAT_MESSAGES_MAX = 40;
/** Shortest gap between two messages from one phone, in ms; a stuck key cannot flood a chat. */
export const CHAT_GAP_MS = 600;
/** «Маскарад» masks in the order they are handed out; the room never has more players than these. */
export const MASKS = [
  { icon: '🦊', name: 'Лиса' },
  { icon: '🐼', name: 'Панда' },
  { icon: '🦉', name: 'Сова' },
  { icon: '🐙', name: 'Осьминог' },
  { icon: '🦝', name: 'Енот' },
  { icon: '🐧', name: 'Пингвин' },
  { icon: '🦄', name: 'Единорог' },
  { icon: '🐸', name: 'Лягушка' },
  { icon: '🐢', name: 'Черепаха' },
  { icon: '🦔', name: 'Ёжик' },
] as const;
/** «Рынок слухов»: one question of the case, like «Кто?», and its suspects. */
export interface MarketCategory {
  title: string;
  options: string[];
}
/** Fewest players for the team mode; below it the setting is ignored. */
export const TEAM_GAME_MIN = 4;
/** Jokers each player starts a game with. */
export const JOKERS_START = 3;
/** A unanimous vote hands out jokers, but nobody holds more than this. */
export const JOKERS_MAX = 5;
/** «Волна»: the scale runs from 0 to this. */
export const WAVE_MAX = 100;
/** «Волна»: the longest hint. */
export const WAVE_HINT_MAX = 40;
/** «По порядку»: secret numbers run from 1 to this. */
export const ORDER_MAX = 100;
/** «По порядку»: the longest thing a player names. */
export const ORDER_TEXT_MAX = 40;
/** «Замри!»: how a player got caught; `lazy` means they hardly danced while the music played. */
export type FreezeFault = 'moved' | 'lazy';
/** «Без стёрки»: the longest reply. */
export const RUSH_MAX = 90;
/** «Без стёрки»: a reply as typed so far; `final` locks it in. */
export interface RushDraft {
  text: string;
  final?: boolean;
}
/** «Сарафанное радио»: the longest retelling, in words. */
export const RADIO_WORDS_MAX = 14;
/** «Свидание вслепую»: messages per player per night. */
export const DATE_MESSAGES = 4;

export type PlotRole = 'plotter' | 'target' | 'bystander';
export type RpsThrow = (typeof RPS_THROWS)[number];
export const CLUE_WORDS = 3;

export const TRAPS = ['snake', 'spider', 'rock', 'fire'] as const;
export type TrapId = (typeof TRAPS)[number];
export type TreasureCard = { gems: number } | { trap: TrapId };
/** «Ближе всех» answers are whole numbers from 0 up to this. */
export const CLOSEST_MAX = 1_000_000;

type ErrorCode =
  | 'no_room'
  | 'room_full'
  | 'started'
  | 'bad_name'
  | 'name_taken'
  | 'bad_token'
  | 'bad_request'
  | 'too_many';

/** Audience phones per room, on top of the players. */
export const MAX_AUDIENCE = 30;

/** Upload limits for selfies and photos: body size in bytes, square side in pixels. */
export const IMAGE_MAX_BYTES = 600_000;
export const IMAGE_SIZE = 512;
