// Turns the rendered narrator sentences of every voice into tts/voices, the set the repository keeps
// and the desktop app ships, so a fresh checkout plays and builds without rendering anything. Only
// sentences the current content still says are kept: audio of reworded or deleted lines is removed
// from tts/voices. Fails unless every voice is complete.
//
// The MP3s from tts/cache are re-encoded to Opus in WebM, half their size at the same clarity, which
// matters at sixty thousand sentences a voice. Needs ffmpeg with libopus, but only for sentences
// tts/voices does not hold yet.
//
//   npm run tts:bundle
//   KTO_TTS_PARTIAL=1 npm run desktop:build    a trial build while some voices are still rendering
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { TTS_INFO } from '../shared/catalog.js';
import { TTS_ENGINES } from '../shared/protocol.js';
import { fixedSentences, nameFragments } from '../server/tts-lines.js';
import { bundledFile, ttsFile } from '../server/tts.js';

// Opus keeps speech clear down to about 16 kbps for a mono voice; lower, the hissing sounds start to smear
const OPUS_BITRATE = '16k';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(root, 'tts', 'cache');
const out = join(root, 'tts', 'voices');
const run = promisify(execFile);

async function encode(mp3: string, webm: string): Promise<void> {
  mkdirSync(dirname(webm), { recursive: true });
  // written aside and renamed, so a build cut short never leaves half a file that looks done
  const tmp = `${webm}.part`;
  await run('ffmpeg', ['-loglevel', 'error', '-y', '-i', mp3, '-c:a', 'libopus', '-b:a', OPUS_BITRATE, '-f', 'webm', tmp]);
  renameSync(tmp, webm);
}

const sentences = [...fixedSentences(), ...nameFragments()];
const wanted = new Set<string>();
for (const engine of TTS_ENGINES) {
  for (const voice of Object.keys(TTS_INFO[engine].voices)) {
    const names = sentences.map((s) => ({ mp3: join(cache, ttsFile(engine, voice, s)), name: bundledFile(engine, voice, s) }));
    for (const { name } of names) wanted.add(name);
    const todo = names.filter((f) => !existsSync(join(out, f.name)) && existsSync(f.mp3));
    let next = 0;
    await Promise.all(
      Array.from({ length: availableParallelism() }, async () => {
        while (next < todo.length) {
          const { mp3, name } = todo[next++]!;
          await encode(mp3, join(out, name));
        }
      }),
    );
    const have = names.filter((f) => existsSync(join(out, f.name))).length;
    if (have) console.log(`${engine}:${voice} — ${have}/${sentences.length}${todo.length ? `, ${todo.length} encoded now` : ''}`);
    if (have < sentences.length) {
      console.error(`${engine}:${voice} lacks ${sentences.length - have} lines: npm run tts:prebuild -- ${engine}:${voice}`);
      if (!process.env.KTO_TTS_PARTIAL) process.exitCode = 1;
    }
  }
}

let stale = 0;
for (const name of existsSync(out) ? readdirSync(out, { recursive: true, encoding: 'utf8' }) : []) {
  if (!/\.(webm|part)$/.test(name) || wanted.has(name)) continue;
  rmSync(join(out, name));
  stale++;
}
if (stale) console.log(`removed ${stale} lines the content no longer says`);
