// Packs tts/voices into build/tts-pack for the desktop app: one data file and one index per voice
// instead of tens of thousands of small files. macOS checks every file of an app against its
// signature on first launch, and with ~190 000 loose sentences that took eight minutes (29 s packed).
// The repository keeps loose files, so git still sees which sentences changed.
//
//   npm run desktop:prepare    runs it after tts:bundle
import { closeSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeFileSync, writeSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TTS_INFO } from '../shared/catalog.js';
import { TTS_ENGINES } from '../shared/protocol.js';
import { packFiles, type PackIndex } from '../server/tts.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const voices = join(root, 'tts', 'voices');
const out = join(root, 'build', 'tts-pack');

rmSync(out, { recursive: true, force: true });
for (const engine of TTS_ENGINES) {
  for (const voice of Object.keys(TTS_INFO[engine].voices)) {
    let names: string[];
    try {
      names = readdirSync(join(voices, engine, voice)).filter((f) => f.endsWith('.webm')).sort();
    } catch {
      continue;
    }
    if (!names.length) continue;
    const { data, index } = packFiles(engine, voice);
    mkdirSync(dirname(join(out, data)), { recursive: true });
    const fd = openSync(join(out, data), 'w');
    const ranges: PackIndex = {};
    let offset = 0;
    for (const name of names) {
      const bytes = readFileSync(join(voices, engine, voice, name));
      writeSync(fd, bytes);
      ranges[name] = [offset, bytes.length];
      offset += bytes.length;
    }
    closeSync(fd);
    writeFileSync(join(out, index), JSON.stringify(ranges));
    console.log(`${engine}:${voice} — ${names.length} lines, ${(offset / 2 ** 20).toFixed(0)} MB`);
  }
}
