// Puts the Vosk TTS model into tts/models/vosk, which the engine and the desktop runtime read.
// The zip must match the size and MD5 its host lists in model-list.json, and every extracted file
// the SHA-256 in tts/vosk/model.sha256, so a CI build ships exactly the model the voices were rendered with.
//
//   node scripts/fetch-vosk-model.mjs
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const NAME = 'vosk-model-tts-ru-0.9-multi';
const URL_ = `https://alphacephei.com/vosk/models/${NAME}.zip`;
const ZIP_MD5 = '2f8b6dbf64e912f9ee7eda50ba2d3c80';
const ZIP_SIZE = 782787154;
const dest = join(root, 'tts', 'models', 'vosk');
const manifest = readFileSync(join(root, 'tts', 'vosk', 'model.sha256'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => ({ sha: l.slice(0, 64), file: l.slice(66) }));

async function hashFile(file, algorithm) {
  const hash = createHash(algorithm);
  await pipeline(createReadStream(file), hash);
  return hash.digest('hex');
}

/** Names of the manifest's files that are missing or differ. */
async function mismatches() {
  const bad = [];
  for (const { sha, file } of manifest) {
    const path = join(dest, NAME, file);
    if (!existsSync(path) || (await hashFile(path, 'sha256')) !== sha) bad.push(file);
  }
  return bad;
}

if ((await mismatches()).length === 0) {
  console.log(`${NAME} is in place`);
  process.exit(0);
}

const zip = join(root, 'build', 'vosk-model', `${NAME}.zip`);
mkdirSync(dirname(zip), { recursive: true });
console.log(`fetching ${URL_}`);
const res = await fetch(URL_);
if (!res.ok || !res.body) throw new Error(`download failed: ${res.status}`);
await pipeline(Readable.fromWeb(res.body), createWriteStream(zip));
const size = statSync(zip).size;
if (size !== ZIP_SIZE) throw new Error(`${NAME}.zip is ${size} bytes, the host lists ${ZIP_SIZE}`);
if ((await hashFile(zip, 'md5')) !== ZIP_MD5) throw new Error(`${NAME}.zip does not match the MD5 the host lists`);

rmSync(join(dest, NAME), { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
// on Windows runners GNU tar from Git comes first on PATH and cannot read zip; bsdtar in System32 can
const tar = process.platform === 'win32' ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
execFileSync(tar, ['-xf', zip, '-C', dest], { stdio: 'inherit' });
rmSync(zip);

const bad = await mismatches();
if (bad.length) throw new Error(`the extracted model differs from tts/vosk/model.sha256: ${bad.join(', ')}`);
console.log(`${NAME} verified in ${dest}`);
