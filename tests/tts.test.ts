import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { NAME_MARK, speechPieces, speechSentences, VOICE_SAMPLE } from '../shared/catalog.js';
import { fixedSentences, nameFragments, namedSentences } from '../server/tts-lines.js';
import { stressed } from '../server/stress.js';
import { startApp } from '../server/app.js';
import { Tts, bundledFile, packFiles, ttsFile, type PackIndex } from '../server/tts.js';

describe('stress marks', () => {
  const data = JSON.parse(readFileSync(new URL('../server/content/stress.json', import.meta.url), 'utf8')) as Record<'vosk', Record<string, Record<string, string>>>;

  it('writes a plus before the stressed vowel and leaves the rest of the sentence as it was', () => {
    const [sentence, words] = Object.entries(data.vosk)[0]!;
    const [word, marked] = Object.entries(words)[0]!;
    expect(stressed('vosk', sentence).toLowerCase()).toContain(marked);
    expect(stressed('vosk', sentence).replace('+', '')).toBe(sentence);
    expect(word).toBe(marked.replace('+', ''));
  });

  it('marks only sentences that are said, and keeps the key of every other sentence', () => {
    const said = new Set([...fixedSentences(), ...nameFragments()]);
    for (const s of Object.keys(data.vosk)) expect(said.has(s) || s.includes(NAME_MARK), s).toBe(true);
    expect(ttsFile('vosk', 'speaker-3', 'Привет!')).toBe(ttsFile('vosk', 'speaker-3', stressed('vosk', 'Привет!')));
  });
});

describe('lines the TV says by itself', () => {
  it('are prebuilt like the rest, so a fresh voice never waits on them', () => {
    const fixed = new Set(fixedSentences());
    for (const s of speechSentences(VOICE_SAMPLE)) expect(fixed.has(s), s).toBe(true);
  });
});

describe('tts bundle', () => {
  it('serves prebuilt sentences without any engine installed and refuses the rest', async () => {
    const bundle = mkdtempSync(join(tmpdir(), 'kto-tts-'));
    const file = join(bundle, bundledFile('vosk', 'speaker-3', 'Привет!'));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, 'webm');
    const tts = Tts.open({ bundle })!;
    expect(tts.status().find((e) => e.id === 'vosk')).toMatchObject({ installed: false, bundled: true });
    await expect(tts.file('vosk', 'speaker-3', 'Привет!')).resolves.toEqual({ file, type: 'audio/webm' });
    await expect(tts.file('vosk', 'speaker-3', 'Пока, Аня!')).rejects.toThrow('not installed');
  });

  it('serves a sentence out of a packed voice as its own file, Range requests included', async () => {
    const bundle = mkdtempSync(join(tmpdir(), 'kto-pack-'));
    const { data, index } = packFiles('vosk', 'speaker-3');
    const name = (s: string) => bundledFile('vosk', 'speaker-3', s).split(/[\\/]/).pop()!;
    mkdirSync(dirname(join(bundle, data)), { recursive: true });
    writeFileSync(join(bundle, data), 'firstsecond');
    const ranges: PackIndex = { [name('Раз.')]: [0, 5], [name('Два.')]: [5, 6] };
    writeFileSync(join(bundle, index), JSON.stringify(ranges));
    const tts = Tts.open({ bundle })!;
    expect(tts.cached('vosk', 'speaker-3', 'Два.')).toEqual({ file: join(bundle, data), type: 'audio/webm', start: 5, end: 10 });
    expect(tts.cached('vosk', 'speaker-3', 'Три.')).toBeUndefined();

    const app = await startApp({ port: 0, tts });
    try {
      const url = `http://127.0.0.1:${app.port}/tts/vosk/speaker-3?t=${encodeURIComponent('Два.')}`;
      const whole = await fetch(url);
      expect(whole.headers.get('content-type')).toBe('audio/webm');
      expect(await whole.text()).toBe('second');
      const part = await fetch(url, { headers: { Range: 'bytes=0-1' } });
      expect(part.status).toBe(206);
      expect(part.headers.get('content-range')).toBe('bytes 0-1/6');
      expect(await part.text()).toBe('se');
    } finally {
      await app.close();
    }
  });

  it('keys a tuned voice by its tune, so retuning renders its lines again', () => {
    expect(ttsFile('vosk', 'speaker-3', 'Привет!')).not.toBe(ttsFile('vosk', 'untuned', 'Привет!').replace('untuned', 'speaker-3'));
    expect(ttsFile('vosk', 'speaker-3', 'Привет!')).toMatch(/^vosk[\\/]speaker-3[\\/][0-9a-f]{20}\.mp3$/);
  });

  it('opens nothing when there are neither engines nor a bundle', () => {
    expect(Tts.open({ bundle: join(tmpdir(), 'kto-no-such-bundle') })).toBeUndefined();
  });

  it('says every Latin word of the content in Russian, which Vosk needs to read it at all', () => {
    expect([...fixedSentences(), ...nameFragments()].filter((s) => /[A-Za-z]/.test(s))).toEqual([]);
  });

  it('prebuilds the placeholder-free sentences of templated lines', () => {
    const sentences = fixedSentences();
    expect(sentences.some((s) => s.includes('{'))).toBe(false);
    expect(sentences).toContain('Все вопросы раунда, про нашего дежурного.');
    expect(sentences.some((s) => /name|ИМЯИГРОКА/i.test(s))).toBe(false);
  });

  it('splits a sentence around player names into what a slow voice says apart', () => {
    expect(speechPieces('Да ты молодец, Аня, никто не сравнится с тобой!', ['Аня', 'Ан'])).toEqual(['Да ты молодец', 'Аня', 'никто не сравнится с тобой!']);
    expect(speechPieces('Земля вызывает Аня!', ['Аня'])).toEqual(['Земля вызывает', 'Аня']);
    expect(speechPieces('Танюша молодец.', ['Аня'])).toEqual(['Танюша молодец.']);
  });

  it('caches the very pieces the TV will ask for around a name', () => {
    const fragments = new Set(nameFragments());
    const template = namedSentences().find((s) => s.startsWith('Земля вызывает'))!;
    const said = speechSentences(template.replaceAll(NAME_MARK, 'Вера'))[0]!;
    for (const piece of speechPieces(said, ['Вера'])) if (piece !== 'Вера') expect(fragments.has(piece), piece).toBe(true);
  });
});
