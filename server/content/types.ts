export interface VoteQuestion {
  /** Full question about the group, e.g. "Кто скорее всего проспит собственную свадьбу?". */
  q: string;
  /** Joke title awarded to whoever gets the most votes, e.g. "Соня года". */
  title: string;
  /** Said by the narrator right before the question. */
  setup?: string;
  /** Said right after the answer is revealed: a joke on the result or a short true fact. */
  after?: string;
  /** Asked only while the round is in this scene of its place (shared/scenes.ts). */
  scene?: string;
  /** Written for two players; preferred in a game for two and left out of bigger ones. */
  pair?: true;
}

export interface PredictQuestion {
  /** Question about one player; `{name}` is replaced with the nominative name. */
  q: string;
  /** Two to four short answer options. */
  options: string[];
  /** Said by the narrator right before the question. */
  setup?: string;
  /** Said right after the answer is revealed: a joke on the result or a short true fact. */
  after?: string;
  /** Asked only while the round is in this scene of its place (shared/scenes.ts). */
  scene?: string;
  /** Written for two players; preferred in a game for two and left out of bigger ones. */
  pair?: true;
}

/** SyncPrompt is one «Синхрон» round: a topic and four options a pair tries to agree on without talking. */
export interface SyncPrompt {
  /** Topic both partners answer silently, e.g. "Идеальный выходной". */
  q: string;
  /** Four equally plausible picks, each at most 24 characters. */
  options: [string, string, string, string];
}

/** ClosestQuestion is one «Ближе всех» round: everyone types a number and the nearest guess wins. */
export interface ClosestQuestion {
  /** Question with a single numeric answer, e.g. "Сколько клавиш у стандартного пианино?". */
  q: string;
  /** Exact, well-established fact; an integer from 0 to 100000. */
  answer: number;
  /** Short word shown after numbers, e.g. "лет", "км", "шт."; omitted when the number stands alone. */
  unit?: string;
}

/** QuizQuestion is one «Викторина на выбывание» question: four options, one right. */
export interface QuizQuestion {
  /** Question read out to the room, e.g. "Какая планета ближе всех к Солнцу?". */
  q: string;
  /** Four short options shown on the TV and the phones; numbers spelled out, as the lint asks. */
  options: [string, string, string, string];
  /** Index of the right option. */
  answer: number;
}

/** YearEvent is one «В каком году?» card that the room places on a growing timeline. */
export interface YearEvent {
  /** What happened, read out and shown on the card, e.g. "Гагарин полетел в космос". */
  e: string;
  /** The year it happened, shown on the TV only; negative for years before our era. */
  year: number;
}

/** TruthFact is one «Верю — не верю» round: the room decides whether a statement is true. */
export interface TruthFact {
  /** Statement read out to the room, e.g. "У осьминога три сердца.". */
  s: string;
  /** Whether the statement is true. */
  truth: boolean;
  /** One short sentence shown after the reveal; for a false statement it says what is actually true. */
  note: string;
}

/**
 * PlaceContent drops a round into its place's situation: questions and mini-game material about
 * what happens there, so «Лагерь» asks about tents and campfires and «Самолёт» about how people travel.
 */
export interface PlaceContent {
  /** «Кто из нас?» questions set in this situation; at least 100, so a place visited again stays fresh. */
  vote: VoteQuestion[];
  /** Questions about one player in this situation, `{name}` included; at least 20. */
  predict: PredictQuestion[];
  /** Nouns from this place that can be both drawn and acted out; at least 25. */
  words: string[];
  /** «Кто больше» categories about this place; at least 4. */
  list: ListCategory[];
  /** «Битва ответов» prompts set here; at least 10. */
  quip: string[];
  /** «Горячая картошка» categories with dozens of easy answers; at least 6. */
  bomb: string[];
  /** «Вставь слово» prompts set here, mixed with the general ones. */
  blank?: BlankPrompt[];
  /** «Селфи-арт» tasks set here, mixed with the general ones. */
  sketch?: SketchPrompt[];
}

/** BlankPrompt is one «Вставь слово» round about a player: a line with a `___` gap, or an open question. */
export interface BlankPrompt {
  /** Has `{name}`, e.g. «В походе {name} всегда берёт с собой ___» or «Как {name} готовится к экзаменам?». */
  q: string;
  setup?: string;
  after?: string;
  scene?: string;
  pair?: true;
}

/** SketchPrompt is one «Селфи-арт» task: the room draws over a player's selfie or over a picture. */
export interface SketchPrompt {
  /** An order to the room; with `{name}` it names the model itself, without it the narrator names them first. */
  q: string;
  setup?: string;
  after?: string;
  /** The model first takes a fresh selfie with this face, e.g. «с ангельским видом». */
  pose?: string;
  /** Draw over this picture from client/public/sketch instead of the selfie. */
  image?: SketchImage;
  scene?: string;
  pair?: true;
}

export const SKETCH_IMAGES = ['hat', 'rabbit', 'stars'] as const;
export type SketchImage = (typeof SKETCH_IMAGES)[number];

/** ListCategory is one «Кто больше» round: the room names as many things that fit as it can. */
export interface ListCategory {
  /** Shown on the TV, e.g. "Фрукты и ягоды". */
  q: string;
  /** Plain answers a bot can type, the common ones people are likely to share. */
  sample: string[];
}

/** ClueSet is four look-alike words for «Три слова»: one is the secret, the other three are decoys. */
export interface ClueSet {
  words: [string, string, string, string];
  /** A bot's clue for the word at the same index: at most three words, none sharing the word's root. */
  clues: [string, string, string, string];
}

export interface MonsterTheme {
  name: string;
  /** Exactly three section tasks, top to bottom. */
  sections: [string, string, string];
}

export interface SharedTheme {
  theme: string;
  /** Per-turn sub-tasks handed out to players in order; at least 10. */
  tasks: string[];
}

import type { LocationId } from '../../shared/protocol.js';

interface LocationLines {
  title: string;
  /** Narrator intros for the episode, one picked at random. */
  intros: string[];
  /** Spotlight round intros; `{name}` is the hero of the round. */
  spotlight: string[];
}

export interface NarratorLines {
  locations: Record<LocationId, LocationLines>;
  /** Lines before a "Кто из нас?" question. */
  voteIntro: string[];
  /** Lines when a vote is revealed; `{name}` is the leader. */
  voteReveal: string[];
  /** Lines when the vote is an exact tie between several players. */
  voteTie: string[];
  /** Lines when nobody voted. */
  voteEmpty: string[];
  /** Lines before a predict question; `{name}` is the target. */
  predictIntro: string[];
  /** Lines when most guessers were right; `{name}` is the target. */
  predictMostRight: string[];
  /** Lines when most guessers were wrong; `{name}` is the target. */
  predictMostWrong: string[];
  selfieIntro: string[];
  /** Before «Нарисуй по описанию»; `{name}` is the one describing. */
  describeIntro: string[];
  /** Before «Шкала»; `{name}` is the player being read. */
  scaleIntro: string[];
  storyIntro: string[];
  photoIntro: string[];
  monsterIntro: string[];
  sharedIntro: string[];
  galleryIntro: string[];
  /** Gallery winner lines; `{name}` is the author (or authors joined by " и "). */
  galleryWinner: string[];
  /** Mid-game scoreboard lines; `{name}` is the leader. */
  scores: string[];
  /** Final lines; `{name}` is the winner. */
  final: string[];
  /** One player played a joker and matched the room; `{name}` is that player. */
  jokerOneWin: string[];
  /** One player played a joker and missed; `{name}` is that player. */
  jokerOneLose: string[];
  /** Several players played jokers and every one of them matched; no name. */
  jokerAllWin: string[];
  /** Several players played jokers, some matched and some missed; no name. */
  jokerSomeWin: string[];
  /** Several players played jokers and none matched; no name. */
  jokerNoneWin: string[];
  /** Game for two: the pair matches more often than earlier in the game; no name. */
  coopUp: string[];
  /** Game for two: the pair matches less often than earlier in the game; no name. */
  coopDown: string[];
  /** Scores screen: a new leader took first place; `{name}` is the new leader. */
  leaderNew: string[];
  /** Scores screen: the same leader holds first place again; `{name}` is the leader. */
  leaderKeeps: string[];
  /** Scores screen: two or more players share first place; no name. */
  leadersTied: string[];
  /** Half the game has been played; no name. */
  halfway: string[];
  /** The last round is starting; no name. */
  lastRound: string[];
  /** The last round is starting and the top scores are close; no name. */
  lastRoundClose: string[];
  /** A player is far behind and gets friendly encouragement; `{name}` is that player. */
  farBehind: string[];
  /** Before «Вставь слово»; no name. */
  blankIntro: string[];
  /** The funniest fill-in won the vote; `{name}` is its author. */
  blankWin: string[];
  /** «Вставь слово»: everyone votes for the funniest fill-in; no name. */
  blankVote: string[];
  /** Before «Чужак в стае»; no name. */
  oddIntro: string[];
  /** «Чужак в стае»: answers are on the TV, vote for the odd one; no name. */
  oddVote: string[];
  /** The room found the outsider; `{name}` is the outsider. */
  oddCaught: string[];
  /** The outsider slipped past the room; `{name}` is the outsider. */
  oddEscaped: string[];
  /** Before «Поровну»; no name. */
  evenIntro: string[];
  /** «Поровну»: the room split exactly in half; no name. */
  evenHalf: string[];
  /** «Поровну»: one side is smaller and takes the points; no name. */
  evenMinority: string[];
  /** «Поровну»: everyone picked the same answer; no name. */
  evenSame: string[];
  /** Before «Сколько процентов?»; no name. */
  percentIntro: string[];
  /** The hero guesses the share of yeses; `{name}` is the hero. */
  percentGuess: string[];
  /** The others bet higher or lower than the hero's guess; `{name}` is the hero. */
  percentBet: string[];
  /** The hero's guess was close; `{name}` is the hero. */
  percentClose: string[];
  /** The hero's guess was far off; `{name}` is the hero. */
  percentFar: string[];
  /** Before «Словарь выдумок»; no name. */
  fibIntro: string[];
  /** The definitions are on the TV; vote for the real one; no name. */
  fibVote: string[];
  /** A fake fooled the most people; `{name}` is its author. */
  fibFooled: string[];
  /** Nobody fell for any fake; no name. */
  fibHonest: string[];
  /** Before «Бублик говорит»; no name. */
  simonIntro: string[];
  /** Survivors of «Бублик говорит»; `{name}` is one name or a list. */
  simonWin: string[];
  /** Nobody survived «Бублик говорит»; no name. */
  simonNone: string[];
  /** Before «Подбери реплику»; no name. */
  replyIntro: string[];
  /** The picked phrases are on the TV, vote for the funniest; no name. */
  replyVote: string[];
  /** The funniest phrase won; `{name}` is who played it. */
  replyWin: string[];
  /** Before «Что у меня на лбу?»; `{name}` is the guesser. */
  foreheadIntro: string[];
  /** The hints are in, the guesser types the word; `{name}` is the guesser. */
  foreheadGuess: string[];
  /** The guesser got the word; `{name}` is the guesser. */
  foreheadRight: string[];
  /** The guesser missed; `{name}` is the guesser. */
  foreheadWrong: string[];
  justIntro: string[];
  /** «Шпион»: the caught spy, `{name}`, gets one guess at the place. */
  spyCornered: string[];
  shakerIntro: string[];
  /** «Контакт»: `{name}` is the leader. */
  /** Said after a round's intro when the round has a twist. */
  modifierDouble: string[];
  modifierBlitz: string[];
  modifierUnderdog: string[];
  contactIntro: string[];
  contactGuess: string[];
  contactOpened: string[];
  contactBlocked: string[];
  contactNone: string[];
  contactSolved: string[];
  contactEnd: string[];
  bandIntro: string[];
  bandWin: string[];
  caseIntro: string[];
  /** Openers for the first, second and third clue, in order; one line per clue. */
  caseClues: string[];
  /** The culprit, `{name}`, caught by at least someone. */
  caseCaught: string[];
  caseEscaped: string[];
  rhymeIntro: string[];
  rhymeShow: string[];
  rhymeWin: string[];
  junkIntro: string[];
  /** «Барахолка»: a lot goes up; `{name}` is its seller. */
  junkLot: string[];
  /** Sold to `{name}`. */
  junkSold: string[];
  junkUnsold: string[];
  ninjaIntro: string[];
  ninjaWin: string[];
  copyIntro: string[];
  copyGo: string[];
  taleIntro: string[];
  /** «Сказочник»: the teller, `{name}`, thinks of a clue for their own drawing. */
  taleClue: string[];
  taleVote: string[];
  /** Some found the teller's drawing, some did not; `{name}` is the teller. */
  taleFound: string[];
  /** Everyone or nobody found it, so the teller scores nothing. */
  taleMissed: string[];
  quizIntro: string[];
  quizRight: string[];
  quizOut: string[];
  quizWin: string[];
  quizAllOut: string[];
  yearsIntro: string[];
  yearsAsk: string[];
  yearsRight: string[];
  yearsNone: string[];
  cloverIntro: string[];
  cloverGuess: string[];
  cloverPerfect: string[];
  cloverDone: string[];
  shakerWin: string[];
  shakerAllPopped: string[];
  /** Nobody pumped at all. */
  shakerFlat: string[];
  justBurnt: string[];
  /** «Шляпа»: everyone drops a word into the hat. */
  hatIntro: string[];
  /** «Шляпа»: the rule of each of the three rounds. */
  hatTalk: string[];
  hatWord: string[];
  hatMime: string[];
  /** «Шляпа»: whose turn to explain, `{name}`. */
  hatTurn: string[];
  hatTurnGood: string[];
  hatTurnNone: string[];
  paintIntro: string[];
  /** «Мафия-ТВ»: the village falls asleep, a night's outcome with the victim as `{name}`, the exile and the end. */
  mafiaIntro: string[];
  mafiaNight: string[];
  mafiaVictim: string[];
  mafiaSaved: string[];
  mafiaQuiet: string[];
  mafiaVote: string[];
  mafiaExileWolf: string[];
  mafiaExileTown: string[];
  mafiaExileNone: string[];
  mafiaVillageWins: string[];
  mafiaWolvesWin: string[];
  paintWin: string[];
  /** Before a draw-and-guess round; `{name}` is the artist. */
  guessIntro: string[];
  /** After a round most guessers solved; `{name}` is the artist. */
  guessSolved: string[];
  /** After a round nobody solved; `{name}` is the artist. */
  guessUnsolved: string[];
  /** Before players fill in the blank for «Кто это написал?». */
  writeIntro: string[];
  /** Before each anonymous answer is put to the vote. */
  quoteIntro: string[];
  /** Most voters found the author; `{name}` is the author. */
  quoteFound: string[];
  /** Most voters missed the author; `{name}` is the author. */
  quoteHidden: string[];
  /** Before «Кто соврал?»; `{name}` is the one writing. */
  lieIntro: string[];
  /** Most players spotted the lie; `{name}` is the liar. */
  lieFound: string[];
  /** Most players believed the lie; `{name}` is the liar. */
  lieHidden: string[];
  /** Before the reaction game. */
  reflexIntro: string[];
  /** After the reaction game; `{name}` is the winner (or several joined by " и "). */
  reflexWinner: string[];
  /** Before the tilt arena game. */
  tiltIntro: string[];
  /** After the arena game; `{name}` is the best collector (or several joined by " и "). */
  tiltWinner: string[];
  /** Before «Я никогда не…». */
  neverIntro: string[];
  /** After a «Я никогда не…» statement is revealed. */
  neverReveal: string[];
  /** Before the tapping race. */
  tapIntro: string[];
  /** After the tapping race; `{name}` is the player with the fastest fingers. */
  tapWin: string[];
  /** Before players describe a secret person with three emoji. */
  emojiIntro: string[];
  /** Most players guessed the described person; `{name}` is that person. */
  emojiFound: string[];
  /** Almost nobody guessed the described person; `{name}` is that person. */
  emojiHidden: string[];
  /** Before «Стадное чувство». */
  herdIntro: string[];
  /** After a round where many answers matched; `{name}` is the most popular answer. */
  herdMatch: string[];
  /** After a round where nobody matched anyone. */
  herdSplit: string[];
  /** Before a duel; `{name}` is the two duelists joined by " и ". */
  duelIntro: string[];
  /** After a duel; `{name}` is the winner. */
  duelWin: string[];
  /** After a duel that ended in a tie. */
  duelDraw: string[];
  /** Before «Синхрон». */
  syncIntro: string[];
  /** After a pair picked the same option; `{name}` is the pair joined by " и ". */
  syncMatch: string[];
  /** After a round where no pair matched. */
  syncMiss: string[];
  /** Before the first round of «Горячая картошка». */
  bombIntro: string[];
  /** After the bomb explodes; `{name}` is the player holding it. */
  bombBoom: string[];
  /** Before «Ближе всех». */
  closestIntro: string[];
  /** After a round with no exact hit; `{name}` is the closest player. */
  closestWin: string[];
  /** After someone names the exact number; `{name}` is that player. */
  closestExact: string[];
  /** Before players write answers for «Битва ответов». */
  quipIntro: string[];
  /** Before each pair of answers is put to the vote. */
  quipVs: string[];
  /** After a matchup; `{name}` is the author of the winning answer. */
  quipWin: string[];
  /** After a matchup where one answer got every vote; `{name}` is its author. */
  quipSweep: string[];
  /** After a matchup where both answers got equal votes. */
  quipTie: string[];
  /** Before a «Крокодил» round; `{name}` is the actor. */
  mimeIntro: string[];
  /** After a round whose word was guessed; `{name}` is the actor. */
  mimeDone: string[];
  /** Before a «Верю — не верю» statement. */
  truthIntro: string[];
  /** After the statement turns out to be true. */
  truthTrue: string[];
  /** After the statement turns out to be a myth. */
  truthFalse: string[];
  /** Before a «Шпион» round, while everyone secretly checks their phone. */
  spyIntro: string[];
  /** The room caught the spy; `{name}` is the spy. */
  spyCaught: string[];
  /** The spy stayed hidden; `{name}` is the spy. */
  spyEscaped: string[];
  /** A caught spy named the place and wins anyway; `{name}` is the spy. */
  spyGuessed: string[];
  /** Before «Три слова» players get their secret words. */
  clueIntro: string[];
  /** Before guessing one player's clue; `{name}` is its author. */
  clueAsk: string[];
  /** Most of the room found the word; `{name}` is the clue's author. */
  clueGood: string[];
  /** Hardly anyone found the word; `{name}` is the clue's author. */
  clueBad: string[];
  /** Before the first «Сокровища» expedition. */
  treasureIntro: string[];
  /** A second trap of one kind ends the expedition for everyone still inside. */
  treasureBust: string[];
  /** Everyone got out before the cave caved in. */
  treasureSafe: string[];
  /** Before a new step into the cave. */
  treasureDeeper: string[];
  /** Before a «Кто больше» round. */
  listIntro: string[];
  /** After a round; `{name}` wrote the most answers nobody else had. */
  listUnique: string[];
  /** After a round where nobody wrote anything unique. */
  listSame: string[];
  /** Before the «Цу-е-фа» tournament. */
  rpsIntro: string[];
  /** Some matches drew and are thrown again. */
  rpsTie: string[];
  /** The tournament has a winner; `{name}` is the champion. */
  rpsChampion: string[];
  /** Before «Заговор»: everyone looks at their phone for a role. */
  plotIntro: string[];
  /** The target, `{name}`, wrote the secret word. */
  plotCaught: string[];
  /** The target, `{name}`, never wrote it. */
  plotHeld: string[];
  /** Before the guessing: who was in on it? */
  plotGuess: string[];
  /** Before «Свидание вслепую». */
  dateIntro: string[];
  /** The first night is over: time to ask someone out. */
  datePick: string[];
  /** A pair picked each other; `{name}` is both names joined. */
  dateMatch: string[];
  /** Nobody picked each other tonight. */
  dateLonely: string[];
  /** Before «Маскарад»: everyone gets a mask and joins the anonymous chat. */
  masqIntro: string[];
  /** The chat is over: who hid behind which mask? */
  masqGuess: string[];
  /** Masks off; `{name}` hid best. */
  masqReveal: string[];
  /** Before «Сарафанное радио». */
  radioIntro: string[];
  /** Every chain has made its way round: vote for the best final version. */
  radioVote: string[];
  /** Before «Без стёрки». */
  rushIntro: string[];
  /** Typing is over: vote for the best reply. */
  rushVote: string[];
  /** `{name}` wrote the favourite reply. */
  rushWin: string[];
  /** No single favourite. */
  rushTie: string[];
  /** Before «Рынок слухов». */
  marketIntro: string[];
  /** `{name}` solved the case first. */
  marketFirst: string[];
  /** Nobody named the right version. */
  marketCold: string[];
  /** Before «Волна». */
  waveIntro: string[];
  /** `{name}` sees the secret point and writes a hint. */
  waveHint: string[];
  /** `{name}` landed closest. */
  waveWin: string[];
  /** Every mark landed far off. */
  waveMiss: string[];
  /** Before «По порядку»: everyone gets a secret number. */
  orderIntro: string[];
  /** Things are named: now put them in order. */
  orderSort: string[];
  /** `{name}` sorted everything without a single mistake. */
  orderPerfect: string[];
  /** Nobody got the order perfect. */
  orderClose: string[];
  /** Before «Замри!». */
  freezeIntro: string[];
  /** `{name}` lasted to the end. */
  freezeWin: string[];
  /** Everyone got caught. */
  freezeNone: string[];
  /** Before «Сумо на льдине». */
  sumoIntro: string[];
  /** `{name}` stayed on the ice longest. */
  sumoWin: string[];
  /** Before «Квач»; `{name}` hunts first. */
  tagIntro: string[];
  /** `{name}` spent the least time hunting. */
  tagWin: string[];
  /** Before «Перетягивание каната». */
  tugIntro: string[];
  /** `{name}` is the winning team's title, like «Огненные». */
  tugWin: string[];
}
