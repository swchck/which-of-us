import { describe, expect, it } from 'vitest';
import {
  bombCategories,
  clueSets,
  closestQuestions,
  describeScenes,
  duelChallenges,
  herdPrompts,
  listCategories,
  mimeWords,
  monsterThemes,
  narrator,
  photoPrompts,
  predictQuestions,
  questionPacks,
  quipPrompts,
  selfiePrompts,
  sharedThemes,
  spyPlaces,
  syncPrompts,
  truthFacts,
  voteQuestions,
  placeContent,
} from '../server/content/index.js';
import { clueProblem } from '../shared/catalog.js';
import { CLUE_MAX, GUESS_MAX, LOCATIONS } from '../shared/protocol.js';

const PLACEHOLDER = /\{(\w+)\}/g;

function placeholders(text: string): string[] {
  return [...text.matchAll(PLACEHOLDER)].map((m) => m[1]!);
}

describe('content bank', () => {
  it('has enough material for several full games', () => {
    expect(voteQuestions.length).toBeGreaterThanOrEqual(100);
    expect(predictQuestions.length).toBeGreaterThanOrEqual(60);
    expect(selfiePrompts.length).toBeGreaterThanOrEqual(30);
    expect(photoPrompts.length).toBeGreaterThanOrEqual(30);
    expect(monsterThemes.length).toBeGreaterThanOrEqual(10);
    expect(sharedThemes.length).toBeGreaterThanOrEqual(10);
  });

  it('keeps vote questions free of placeholders and duplicates', () => {
    for (const q of voteQuestions) {
      expect(placeholders(q.q + q.title), q.q).toEqual([]);
      expect(q.title.length).toBeGreaterThan(0);
    }
    expect(new Set(voteQuestions.map((q) => q.q)).size).toBe(voteQuestions.length);
  });

  it('names the target in every predict question and offers 2-4 short options', () => {
    for (const q of predictQuestions) {
      expect(new Set(placeholders(q.q)), q.q).toEqual(new Set(['name']));
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.length).toBeLessThanOrEqual(4);
      for (const o of q.options) expect(o.length, o).toBeLessThanOrEqual(30);
    }
  });

  it('never repeats a question across packs, since the host can mix them', () => {
    const packs = Object.values(questionPacks);
    const vote = packs.flatMap((p) => p.vote.map((q) => q.q));
    const predict = packs.flatMap((p) => p.predict.map((q) => q.q));
    expect(vote.filter((q, i) => vote.indexOf(q) !== i)).toEqual([]);
    expect(predict.filter((q, i) => predict.indexOf(q) !== i)).toEqual([]);
    expect(new Set(describeScenes).size).toBe(describeScenes.length);
  });

  it('gives monsters exactly three sections and shared themes plenty of tasks', () => {
    for (const m of monsterThemes) expect(m.sections).toHaveLength(3);
    for (const s of sharedThemes) expect(s.tasks.length).toBeGreaterThanOrEqual(10);
  });

  it('only uses the {name} placeholder in narrator lines', () => {
    const lines = [
      ...Object.values(narrator.locations).flatMap((l) => [l.title, ...l.intros]),
      ...Object.entries(narrator)
        .filter(([k]) => k !== 'locations')
        .flatMap(([, v]) => v as string[]),
    ];
    for (const line of lines) {
      for (const p of placeholders(line)) expect(p, line).toBe('name');
    }
  });

  it('has narrator lines for every key', () => {
    for (const [key, value] of Object.entries(narrator)) {
      if (key === 'locations') continue;
      expect((value as string[]).length, key).toBeGreaterThan(0);
    }
  });

  it('has enough prompts for the herd, duel and sync games', () => {
    expect(herdPrompts.length).toBeGreaterThanOrEqual(80);
    expect(duelChallenges.length).toBeGreaterThanOrEqual(60);
    expect(syncPrompts.length).toBeGreaterThanOrEqual(50);
  });

  it('keeps herd, duel and sync prompts unique and free of placeholders', () => {
    const texts = [...herdPrompts, ...duelChallenges, ...syncPrompts.flatMap((p) => [p.q, ...p.options])];
    for (const t of texts) expect(placeholders(t), t).toEqual([]);
    expect(new Set(herdPrompts).size).toBe(herdPrompts.length);
    expect(new Set(duelChallenges).size).toBe(duelChallenges.length);
    expect(new Set(syncPrompts.map((p) => p.q)).size).toBe(syncPrompts.length);
  });

  it('phrases every duel as a question about the two duelists', () => {
    for (const d of duelChallenges) expect(d.startsWith('Кто из двоих'), d).toBe(true);
  });

  it('gives every sync prompt four distinct short options', () => {
    for (const p of syncPrompts) {
      expect(p.options, p.q).toHaveLength(4);
      expect(new Set(p.options).size, p.q).toBe(4);
      for (const o of p.options) expect(o.length, o).toBeLessThanOrEqual(24);
    }
  });

  it('has narrator lines for the herd, duel and sync games', () => {
    const keys = [
      'herdIntro',
      'herdMatch',
      'herdSplit',
      'duelIntro',
      'duelWin',
      'duelDraw',
      'syncIntro',
      'syncMatch',
      'syncMiss',
    ] as const;
    for (const key of keys) expect(narrator[key].length, key).toBeGreaterThan(0);
  });

  it('has enough unique, placeholder-free bomb categories', () => {
    expect(bombCategories.length).toBeGreaterThanOrEqual(80);
    expect(new Set(bombCategories).size).toBe(bombCategories.length);
    for (const c of bombCategories) expect(placeholders(c), c).toEqual([]);
  });

  it('keeps closest questions unique with integer answers in range', () => {
    expect(closestQuestions.length).toBeGreaterThanOrEqual(70);
    expect(new Set(closestQuestions.map((q) => q.q)).size).toBe(closestQuestions.length);
    for (const q of closestQuestions) {
      expect(placeholders(q.q + (q.unit ?? '')), q.q).toEqual([]);
      expect(Number.isInteger(q.answer), q.q).toBe(true);
      expect(q.answer, q.q).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.q).toBeLessThanOrEqual(100000);
    }
  });

  it('has narrator lines for the bomb and closest games', () => {
    const keys = ['bombIntro', 'bombBoom', 'closestIntro', 'closestWin', 'closestExact'] as const;
    for (const key of keys) expect(narrator[key].length, key).toBeGreaterThan(0);
  });

  it('has the candy, lab and volcano locations', () => {
    for (const id of ['candy', 'lab', 'volcano'] as const) {
      const loc = narrator.locations[id];
      expect(loc.title.length, id).toBeGreaterThan(0);
      expect(loc.intros.length, id).toBeGreaterThanOrEqual(6);
      expect(loc.spotlight.length, id).toBeGreaterThanOrEqual(5);
      for (const line of loc.spotlight) expect(placeholders(line), line).toEqual(['name']);
    }
  });

  it('has enough unique, placeholder-free quip prompts', () => {
    expect(quipPrompts.length).toBeGreaterThanOrEqual(120);
    expect(new Set(quipPrompts).size).toBe(quipPrompts.length);
    for (const p of quipPrompts) expect(placeholders(p), p).toEqual([]);
  });

  it('keeps mime words unique, lowercase and free of punctuation', () => {
    expect(mimeWords.length).toBeGreaterThanOrEqual(150);
    expect(new Set(mimeWords).size).toBe(mimeWords.length);
    for (const w of mimeWords) expect(w, w).toMatch(/^[а-яё]+(?:[ -][а-яё]+)*$/);
  });

  it('has narrator lines for the quip and mime games', () => {
    const keys = ['quipIntro', 'quipVs', 'quipWin', 'quipSweep', 'quipTie', 'mimeIntro', 'mimeDone'] as const;
    for (const key of keys) expect(narrator[key].length, key).toBeGreaterThan(0);
    for (const key of ['quipWin', 'quipSweep', 'mimeIntro', 'mimeDone'] as const) {
      for (const line of narrator[key]) expect(placeholders(line), line).toEqual(['name']);
    }
    for (const key of ['quipIntro', 'quipVs', 'quipTie'] as const) {
      for (const line of narrator[key]) expect(placeholders(line), line).toEqual([]);
    }
  });

  it('has the market, zoo and japan locations', () => {
    for (const id of ['market', 'zoo', 'japan'] as const) {
      const loc = narrator.locations[id];
      expect(loc.title.length, id).toBeGreaterThan(0);
      expect(loc.intros.length, id).toBeGreaterThanOrEqual(6);
      expect(loc.spotlight.length, id).toBeGreaterThanOrEqual(5);
      for (const line of loc.spotlight) expect(placeholders(line), line).toEqual(['name']);
    }
  });

  it('keeps truth facts unique, balanced and short', () => {
    expect(truthFacts.length).toBeGreaterThanOrEqual(90);
    expect(new Set(truthFacts.map((f) => f.s)).size).toBe(truthFacts.length);
    const trueShare = truthFacts.filter((f) => f.truth).length / truthFacts.length;
    expect(trueShare).toBeGreaterThanOrEqual(0.35);
    expect(trueShare).toBeLessThanOrEqual(0.65);
    for (const f of truthFacts) {
      expect(f.s.length, f.s).toBeLessThanOrEqual(110);
      expect(f.note.length, f.s).toBeGreaterThan(0);
      expect(f.note.length, f.s).toBeLessThanOrEqual(140);
      expect(placeholders(f.s + f.note), f.s).toEqual([]);
    }
  });

  it('has enough unique, placeholder-free spy places', () => {
    expect(spyPlaces.length).toBeGreaterThanOrEqual(70);
    expect(new Set(spyPlaces).size).toBe(spyPlaces.length);
    for (const p of spyPlaces) expect(placeholders(p), p).toEqual([]);
  });

  it('has narrator lines for the truth and spy games', () => {
    const named = ['spyCaught', 'spyEscaped', 'spyGuessed'] as const;
    const plain = ['truthIntro', 'truthTrue', 'truthFalse', 'spyIntro'] as const;
    for (const key of [...named, ...plain]) expect(narrator[key].length, key).toBeGreaterThan(0);
    for (const key of named) {
      for (const line of narrator[key]) expect(placeholders(line), line).toEqual(['name']);
    }
    for (const key of plain) {
      for (const line of narrator[key]) expect(placeholders(line), line).toEqual([]);
    }
  });

  it('has the fair, egypt and bowling locations', () => {
    for (const id of ['fair', 'egypt', 'bowling'] as const) {
      const loc = narrator.locations[id];
      expect(loc.title.length, id).toBeGreaterThan(0);
      expect(loc.intros.length, id).toBeGreaterThanOrEqual(6);
      expect(loc.spotlight.length, id).toBeGreaterThanOrEqual(5);
      for (const line of loc.spotlight) expect(placeholders(line), line).toEqual(['name']);
    }
  });

  it('keeps clue sets unique with short clues that dodge the target root', () => {
    expect(clueSets.length).toBeGreaterThanOrEqual(90);
    const words = clueSets.flatMap((s) => s.words);
    expect(new Set(words).size).toBe(words.length);
    // bots send these through the same check the phones use, and a refused bot clue stalls the round
    const refused = clueSets.flatMap((set) => set.words.flatMap((word, i) => (clueProblem(word, set.clues[i]!) ? [`${word}: ${set.clues[i]}`] : [])));
    expect(refused).toEqual([]);
    for (const set of clueSets) {
      set.words.forEach((word, i) => {
        expect(set.clues[i]!.length, word).toBeLessThanOrEqual(CLUE_MAX);
      });
    }
  });

  it('keeps list categories broad, short and bot-ready', () => {
    expect(listCategories.length).toBeGreaterThanOrEqual(80);
    const qs = listCategories.map((c) => c.q);
    expect(new Set(qs).size).toBe(qs.length);
    for (const { q, sample } of listCategories) {
      expect(q.length, q).toBeLessThanOrEqual(40);
      expect(sample.length, q).toBeGreaterThanOrEqual(8);
      expect(sample.length, q).toBeLessThanOrEqual(12);
      expect(new Set(sample).size, q).toBe(sample.length);
      for (const item of sample) {
        expect(item, q).toBe(item.toLowerCase());
        expect(item.length, item).toBeLessThanOrEqual(20);
      }
    }
  });

  describe('place content', () => {
    for (const id of LOCATIONS) {
      it(`gives «${id}» its own questions and mini-game material`, () => {
        const place = placeContent[id];
        expect(place, id).toBeDefined();
        if (!place) return;
        expect(place.vote.length).toBeGreaterThanOrEqual(100);
        expect(place.predict.length).toBeGreaterThanOrEqual(20);
        expect(place.words.length).toBeGreaterThanOrEqual(25);
        expect(place.list.length).toBeGreaterThanOrEqual(4);
        expect(place.quip.length).toBeGreaterThanOrEqual(10);
        expect(place.bomb.length).toBeGreaterThanOrEqual(6);
        for (const v of place.vote) {
          expect(v.q.endsWith('?'), v.q).toBe(true);
          expect(v.title.length, v.title).toBeLessThanOrEqual(28);
        }
        for (const p of place.predict) {
          expect(p.q, p.q).toContain('{name}');
          expect(p.options.length).toBeGreaterThanOrEqual(2);
          expect(p.options.length).toBeLessThanOrEqual(4);
        }
        for (const w of place.words) expect(w.length, w).toBeLessThanOrEqual(GUESS_MAX);
        for (const c of place.list) {
          expect(c.q.length).toBeLessThanOrEqual(40);
          expect(c.sample.length).toBeGreaterThanOrEqual(8);
        }
        const all = [...place.vote.map((v) => v.q), ...place.predict.map((p) => p.q), ...place.quip, ...place.bomb];
        expect(new Set(all).size, 'duplicates').toBe(all.length);
        expect(new Set(place.words).size, 'duplicate words').toBe(place.words.length);
      });
    }
  });
});
