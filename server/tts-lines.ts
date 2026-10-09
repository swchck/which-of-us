import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NAME_MARK, rulesLine, speechPieces, speechSentences, VOICE_SAMPLE, withUnit } from '../shared/catalog.js';
import { GAMES, MAX_PLAYERS, SCALE_MAX, SIMON_COLORS } from '../shared/protocol.js';
import {
  blankPrompts,
  bombCategories,
  evenQuestions,
  fibWords,
  foreheadWords,
  quizQuestions,
  yearEvents,
  taleThemes,
  rhymeStarts,
  junkItems,
  caseCrimes,
  caseQuestions,
  oddPairs,
  percentQuestions,
  guessWords,
  mimeWords,
  closestQuestions,
  clueSets,
  duelChallenges,
  herdPrompts,
  listCategories,
  marketCases,
  masqTopics,
  monsterThemes,
  narrator,
  neverStatements,
  photoPrompts,
  placeContent,
  plotWords,
  questionPacks,
  quipPrompts,
  replySituations,
  rushMessages,
  scaleQuestions,
  selfiePrompts,
  sharedThemes,
  spyPlaces,
  storyStarts,
  syncPrompts,
  truthFacts,
} from './content/index.js';
import { sceneLines } from './content/scenes.js';
import { DATE_NIGHT_NAMES, MISSION_POINTS, simonCommand } from './game/game.js';
import { radioRumours } from './content/radio.js';
import { spectra } from './content/spectrum.js';
import type { BlankPrompt, PredictQuestion, SketchPrompt, VoteQuestion } from './content/types.js';

/**
 * Every sentence the narrator can say, as the TTS cache keys it, so the shipped app renders nothing
 * but players' names and what players type. The game builds many lines from templates in
 * server/game/game.ts; the templates are repeated here, and tests/tts-coverage.test.ts plays bot
 * games to catch any line the two disagree on.
 */

function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
}

const named = (line: string) => line.replaceAll('{name}', NAME_MARK);

/** Single-quoted Russian strings in the game's code: the fixed lines it says without a narrator key. */
function codeLines(): string[] {
  const dir = join(dirname(fileURLToPath(import.meta.url)), 'game');
  const out: string[] = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
    const code = readFileSync(join(dir, file), 'utf8');
    for (const m of code.matchAll(/'((?:[^'\\\n]|\\.)*[А-Яа-яЁё](?:[^'\\\n]|\\.)*)'/g)) {
      // labels and messages to phones are not said, and none of them ends a sentence
      if (/[.!?…]$/.test(m[1]!)) out.push(m[1]!.replace(/\\'/g, "'"));
    }
  }
  return out;
}

function questionLines(): string[] {
  const banks = [...Object.values(questionPacks), ...Object.values(placeContent)];
  const vote: VoteQuestion[] = banks.flatMap((b) => b.vote);
  const predict: PredictQuestion[] = banks.flatMap((b) => b.predict);
  const blank: BlankPrompt[] = [...blankPrompts, ...Object.values(placeContent).flatMap((p) => p.blank ?? [])];
  const sketch: SketchPrompt[] = [...selfiePrompts, ...Object.values(placeContent).flatMap((p) => p.sketch ?? [])];
  return [
    ...vote.flatMap((q) => [q.q, `Титул «${q.title}»!`, q.setup ?? '', q.after ?? '']),
    ...predict.flatMap((q) => [q.q, q.setup ?? '', q.after ?? '']),
    ...blank.flatMap((p) => [p.q.replace('___', '…'), p.setup ?? '', p.after ?? '']),
    ...sketch.flatMap((p) => [p.q.includes('{name}') ? `${p.q}!` : `Модель — {name}. ${p.q}!`, p.setup ?? '', p.after ?? '', p.pose ? `{name}, сделайте селфи ${p.pose}!` : '']),
  ];
}

function miniGameLines(): string[] {
  const places = Object.values(placeContent);
  const words = new Set([...guessWords, ...mimeWords, ...foreheadWords, ...places.flatMap((p) => p.words)]);
  const answers = marketCases.flatMap((c) =>
    c.categories.reduce<string[]>((acc, cat) => acc.flatMap((a) => cat.options.map((o) => (a ? `${a}, ${o}` : o))), ['']),
  );
  return [
    ...storyStarts.flatMap((s) => [`Начало такое: ${s}`, s]),
    ...monsterThemes.map((t) => `Тема: ${t.name}.`),
    ...sharedThemes.map((t) => `Тема: ${t.theme}. Первым рисует {name}!`),
    ...[...words].map((w) => `Загаданное слово — «${w}».`),
    ...neverStatements.map((s) => `Я никогда не ${s}.`),
    ...herdPrompts,
    ...duelChallenges,
    ...syncPrompts.map((p) => p.q),
    ...closestQuestions.map((q) => q.q),
    ...[...bombCategories, ...places.flatMap((p) => p.bomb)].map((c) => `${c}! Начинает {name}.`),
    ...[...quipPrompts, ...places.flatMap((p) => p.quip)],
    ...truthFacts.flatMap((f) => [f.s, f.note]),
    'Угадали не все, но художник не зря старается!',
    ...DATE_NIGHT_NAMES.map((n) => `Вечер ${n}! Продолжаем знакомиться.`),
    ...plotWords.map((w) => `Тайное слово — «${w.word}».`),
    ...rushMessages.map((m) => `${m.from} пишет: ${m.text}`),
    ...answers.map((a) => `Ответ: ${a}.`),
    ...marketCases.map((c) => c.title),
    ...spectra.map((s) => `Шкала: ${s.left} — ${s.right}.`),
    ...masqTopics.map((t) => `Новая тема: ${t.prompt}`),
    ...spyPlaces.map((p) => `Место — «${p}».`),
    ...clueSets.flatMap((c) => c.words.map((w) => `Загадано: «${w}».`)),
    ...[...listCategories, ...places.flatMap((p) => p.list)].map((c) => `${c.q}!`),
    ...photoPrompts,
    ...scaleQuestions.map((q) => q.q),
    ...oddPairs.map((p) => `Другой вопрос был такой: ${p.odd}.`),
    ...evenQuestions.map((q) => q.q),
    ...percentQuestions,
    ...replySituations,
    ...quizQuestions.flatMap((q) => [q.q, ...narrator.quizRight.map((r) => `${r} ${q.options[q.answer]}.`)]),
    ...yearEvents.map((y) => `${y.e}.`),
    ...taleThemes.map((t) => `Тема: ${t.charAt(0).toLowerCase()}${t.slice(1)}.`),
    ...rhymeStarts.map((r) => `${r}…`),
    ...junkItems.map((j) => `${j}.`),
    ...caseCrimes,
    ...caseQuestions.flatMap((q) => q.clues),
    ...fibWords.flatMap((w) => [`${w.word}.`, `${w.word} — это ${w.def.charAt(0).toLowerCase()}${w.def.slice(1)}.`]),
    ...[true, false].flatMap((magic) => SIMON_COLORS.map((_, color) => simonCommand(magic, color))),
    'В точку попали: {name}!',
    'Точно не угадал никто!',
    'Где это на шкале?',
    'Что из этого — ложь? Пишет {name}',
    'Дружба победила.',
    'Каждому в команде бонус.',
    ...radioRumours.flatMap((r) => [`Было: «${r}».`, `Этот слух никто не подхватил: «${r}».`]),
  ];
}


/** Lines whose numbers the game fills in; the speech text turns those digits into words. */
function numberLines(): string[] {
  const fromTo = (n: number) => Array.from({ length: n + 1 }, (_, i) => i);
  return [
    ...GAMES.map(rulesLine),
    ...fromTo(MAX_PLAYERS).flatMap((did) => fromTo(MAX_PLAYERS - did).map((not) => `«Было» — у ${did} из ${did + not}.`)),
    ...closestQuestions.map((q) => `Правильный ответ — ${withUnit(q.answer, q.unit)}.`),
    ...fromTo(SCALE_MAX).flatMap((n) => [`{name}: ${n} из ${SCALE_MAX}.`, `{name} — это ${n} из ${SCALE_MAX}.`]),
    `Справились: {name}. Плюс ${MISSION_POINTS} очков!`,
    ...fromTo(100).map((n) => `На самом деле ${withUnit(n, 'процентов')}.`),
  ];
}

/** Every line the narrator can say as written, with `{name}` where a player's name goes; text authors write, without the number templates. */
export function writtenLines(): string[] {
  return [...strings(narrator), ...strings(sceneLines), ...codeLines(), ...questionLines(), ...miniGameLines(), VOICE_SAMPLE].filter(Boolean);
}

function spokenLines(): string[] {
  return [...writtenLines(), ...numberLines()];
}

let all: string[] | undefined;

/** Every narrator sentence as spoken, with NAME_MARK where a player's name goes. */
function allSentences(): string[] {
  all ??= [...new Set(spokenLines().flatMap((line) => speechSentences(named(line))))];
  return all;
}

/** Every narrator sentence that reads the same in any party. */
export function fixedSentences(): string[] {
  return allSentences().filter((s) => !s.includes(NAME_MARK));
}

/** Narrator sentences that hold a player's name, with NAME_MARK in its place. */
export function namedSentences(): string[] {
  return allSentences().filter((s) => s.includes(NAME_MARK));
}

/**
 * The pieces around the names in every named sentence; a voice says those and the names apart.
 * «и» joins a list of names («Аня, Боря и Вера»), which any one-name line can take.
 */
export function nameFragments(): string[] {
  return [...new Set(['и', ...namedSentences().flatMap((s) => speechPieces(s, [NAME_MARK]).filter((p) => p !== NAME_MARK))])];
}
