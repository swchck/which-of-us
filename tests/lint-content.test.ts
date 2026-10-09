import { describe, expect, it } from 'vitest';
import { blankPrompts, narrator, placeContent, questionPacks, selfiePrompts } from '../server/content/index.js';
import { sceneLines } from '../server/content/scenes.js';
import { writtenLines } from '../server/tts-lines.js';
import { LOCATIONS } from '../shared/protocol.js';

/**
 * Lints every question players see: no gendered forms about the players, no question that is
 * another one reworded, nothing the narrator's voice would stumble over, nothing too long for the TV.
 */

interface Line {
  where: string;
  q: string;
  kind: 'vote' | 'predict';
}

// the «Для всех» pack is the general bank itself, so it is read once, through the packs
const lines: Line[] = [
  ...Object.entries(questionPacks).flatMap(([pack, p]) => [
    ...p.vote.map((v) => ({ where: `pack ${pack}`, q: v.q, kind: 'vote' as const })),
    ...p.predict.map((v) => ({ where: `pack ${pack}`, q: v.q, kind: 'predict' as const })),
  ]),
  ...LOCATIONS.flatMap((id) => [
    ...placeContent[id].vote.map((v) => ({ where: id, q: v.q, kind: 'vote' as const })),
    ...placeContent[id].predict.map((v) => ({ where: id, q: v.q, kind: 'predict' as const })),
  ]),
];

/**
 * A past-tense verb or a short adjective right after the player's name picks a gender the narrator
 * cannot know: «Аня готов». After «кто» the masculine is just Russian grammar («кто пришёл»), so it stays.
 */
const GENDERED = [
  /\{name\}\s+(был|была|готов|готова|сам|сама|должен|должна|рад|рада|[а-яё]+л|[а-яё]+ла|[а-яё]+лся|[а-яё]+лась)(?=[^а-яё]|$)/i,
];

const STOP = new Set(
  'кто из нас в на с и не по за к у о от до для как что это будет его её их а но или же ли бы то так все всех всё уже при про чтобы когда самый самая самое где куда чем'.split(' '),
);

/** Word stems without filler words; two questions with mostly the same stems say the same thing. */
function stems(q: string): string[] {
  const words = q
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\{name\}/g, '')
    .split(/[^а-яa-z]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  return [...new Set(words.map((w) => w.slice(0, 5)))];
}

/** Pairs of questions of one kind whose stems overlap by at least `ratio`, found through an index so 9000 lines stay fast. */
function nearDuplicates(items: Line[], ratio: number): [Line, Line][] {
  const keys = items.map((l) => stems(l.q));
  const index = new Map<string, number[]>();
  keys.forEach((k, i) => k.forEach((t) => index.set(t, [...(index.get(t) ?? []), i])));
  const out: [Line, Line][] = [];
  keys.forEach((k, i) => {
    const shared = new Map<number, number>();
    for (const t of k) for (const j of index.get(t)!) if (j > i) shared.set(j, (shared.get(j) ?? 0) + 1);
    for (const [j, n] of shared) {
      if (n < 3) continue;
      const union = new Set([...k, ...keys[j]!]).size;
      if (n / union >= ratio) out.push([items[i]!, items[j]!]);
    }
  });
  return out;
}

function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
}

/** Everything else the narrator says or the TV shows about a player: host lines, lead-ins and punchlines, prompts. */
const extras = [...Object.values(questionPacks), ...LOCATIONS.map((id) => placeContent[id])].flatMap((c) => [
  ...[...c.vote, ...c.predict].flatMap((q) => [q.setup, q.after]),
  ...('blank' in c ? [...(c.blank ?? []), ...(c.sketch ?? [])].flatMap((p) => [p.q, p.setup, p.after]) : []),
]);
const spoken = [
  ...strings(narrator).map((q) => ({ where: 'narrator', q })),
  ...strings(sceneLines).map((q) => ({ where: 'scene', q })),
  ...[...blankPrompts, ...selfiePrompts].flatMap((p) => [p.q, p.setup, p.after]).flatMap((q) => (q ? [{ where: 'prompt', q }] : [])),
  ...extras.flatMap((q) => (q ? [{ where: 'lead-in', q }] : [])),
];

/** Titles and answer options: short, but announced at the reveal all the same. */
const labels = [...Object.values(questionPacks), ...LOCATIONS.map((id) => placeContent[id])].flatMap((c) => [
  ...c.vote.map((v) => ({ where: 'title', q: v.title })),
  ...c.predict.flatMap((p) => p.options.map((q) => ({ where: 'option', q }))),
]);

describe('content lint', () => {
  it('never puts a gendered form on a player', () => {
    const bad = [...lines, ...spoken].filter((l) => GENDERED.some((re) => re.test(l.q))).map((l) => `${l.where}: ${l.q}`);
    expect(bad).toEqual([]);
  });

  for (const kind of ['vote', 'predict'] as const) {
    it(`has no ${kind} question that is another one reworded`, () => {
      const pairs = nearDuplicates(
        lines.filter((l) => l.kind === kind),
        0.7,
      ).map(([a, b]) => `${a.where}: ${a.q}  ~  ${b.where}: ${b.q}`);
      expect(pairs).toEqual([]);
    });
  }

  // digits are spoken in the nominative, so «на 72-м месте» or «в 1994 году» come out wrong; Latin is fine,
  // the voices spell out «Facebook» and «DJ», but not a Latin letter hiding inside a Russian word
  it('gives the narrator only text it reads right', () => {
    const bad = [...lines, ...spoken, ...labels, ...writtenLines().map((q) => ({ where: 'spoken', q }))]
      .filter(({ q }) => /\d|[а-яё][a-z]|[a-z][а-яё]|т\.\s?[дп]\.|(^|\s)(км|кг|см|руб|тыс|млн)(?=[\s.,!?]|$)/i.test(q))
      .map((l) => `${l.where}: ${l.q}`);
    expect(bad).toEqual([]);
  });

  it('fits every question on the TV in three lines', () => {
    const long = lines.filter((l) => l.q.length > 150).map((l) => `${l.where}: ${l.q.length} ${l.q}`);
    expect(long).toEqual([]);
  });
});
