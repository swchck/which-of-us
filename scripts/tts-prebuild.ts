// Renders every narrator sentence and every piece around a player's name ahead of time, so a party
// renders nothing but the names and what players type. Safe to rerun: sentences tts/voices or the
// cache already hold are skipped.
//
//   npm run tts:prebuild                        every voice the game offers
//   npm run tts:prebuild -- vosk:speaker-3      one voice
//   npm run tts:prebuild -- --shard=0/4         every fourth line, to run several renders side by side
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TTS_INFO } from '../shared/catalog.js';
import { TTS_ENGINES, type TtsEngine } from '../shared/protocol.js';
import { fixedSentences, nameFragments } from '../server/tts-lines.js';
import { Tts } from '../server/tts.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

const tts = Tts.open({ dir: join(root, 'tts'), bundle: join(root, 'tts', 'voices') });
if (!tts) {
  console.error('tts/ or uv is missing');
  process.exit(1);
}

const picked = args.filter((a) => !a.startsWith('--'));
const shard = /^--shard=(\d+)\/(\d+)$/.exec(args.find((a) => a.startsWith('--shard=')) ?? '');
const [part, parts] = shard ? [Number(shard[1]), Number(shard[2])] : [0, 1];
const targets: { engine: TtsEngine; voice: string }[] = picked.length
  ? picked.map((a) => {
      const [engine, voice] = a.split(':') as [TtsEngine, string | undefined];
      return { engine, voice: voice ?? Object.keys(TTS_INFO[engine].voices)[0]! };
    })
  : TTS_ENGINES.filter((e) => tts.installed(e)).flatMap((engine) => Object.keys(TTS_INFO[engine].voices).map((voice) => ({ engine, voice })));

const sentences = fixedSentences();
const fragments = nameFragments();
for (const { engine, voice } of targets) {
  const lines = [...sentences, ...fragments].filter((_, i) => i % parts === part);
  const todo = lines.filter((s) => !tts.cached(engine, voice, s));
  console.log(`${engine}:${voice} — ${lines.length - todo.length} cached, ${todo.length} to render`);
  const started = Date.now();
  let failed = 0;
  for (const [i, s] of todo.entries()) {
    try {
      await tts.file(engine, voice, s);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${s}: ${err instanceof Error ? err.message : String(err)}`);
    }
    if ((i + 1) % 50 === 0 || i === todo.length - 1) {
      const rate = (Date.now() - started) / (i + 1);
      console.log(`  ${i + 1}/${todo.length}, ~${Math.round((rate * (todo.length - i - 1)) / 60000)} min left`);
    }
  }
  if (failed) console.log(`  ${failed} failed`);
}
tts.close();
