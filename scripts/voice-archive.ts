// Packs build/tts-pack and build/tts-runtime into build/voice: one archive each and a manifest
// the app reads to know what to fetch, how big it is and what it should hash to.
//
// The desktop build ships two ways. The full one carries both directories inside the app; the
// light one leaves them out and downloads these archives on first run. Same files either way,
// so a computer with no connection can still be handed the full installer.
//
//   npm run voice:archive    after desktop:prepare has built both directories
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'build', 'voice');
// the runtime carries a relocatable Python, so it differs per platform; the rendered lines do not,
// but keeping both in one per-platform set is simpler than having two jobs share a file
const os = process.platform === 'win32' ? 'windows' : 'macos';

/** What the app offers to download, and which built directory each one is. */
const PARTS = [
  { id: 'lines', dir: 'tts-pack' },
  { id: 'engine', dir: 'tts-runtime' },
] as const;

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version: string };

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const parts = PARTS.map(({ id, dir }) => {
  const source = join(root, 'build', dir);
  if (!existsSync(source)) throw new Error(`build/${dir} is missing — run npm run desktop:prepare first`);
  const file = `${id}-${os}.tar.gz`;
  // -C so the archive holds the directory itself, which unpacks straight into the voice folder
  execFileSync('tar', ['-czf', join(out, file), '-C', join(root, 'build'), dir]);
  const bytes = readFileSync(join(out, file));
  return { id, dir, file, size: statSync(join(out, file)).size, sha256: createHash('sha256').update(bytes).digest('hex') };
});

writeFileSync(join(out, `voice-${os}.json`), JSON.stringify({ version, os, parts }, null, 2) + '\n');
for (const p of parts) console.log(`${p.id} — ${(p.size / 2 ** 20).toFixed(0)} MB`);
console.log(`${os} manifest for ${version} in build/voice`);
