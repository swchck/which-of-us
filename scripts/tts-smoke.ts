// Renders one line through build/tts-runtime exactly as the desktop app's server would, so a build
// whose live narration is broken fails here and not on a player's computer.
//
//   npm run tts:smoke
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Tts } from '../server/tts.js';

const runtime = join(dirname(fileURLToPath(import.meta.url)), '..', 'build', 'tts-runtime');
const cache = mkdtempSync(join(tmpdir(), 'kto-smoke-'));
const tts = Tts.open({ runtime, cache });
try {
  if (!tts?.installed('vosk')) throw new Error('build/tts-runtime has no vosk engine');
  const audio = await tts.file('vosk', 'speaker-3', 'Проверка связи, Зинаида Прокофьевна!');
  const bytes = statSync(audio.file).size;
  if (bytes < 1000) throw new Error(`the rendered line is ${bytes} bytes`);
  console.log(`rendered ${bytes} bytes through the shipped runtime`);
} finally {
  tts?.close();
  rmSync(cache, { recursive: true, force: true });
}
