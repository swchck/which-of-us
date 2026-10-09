// Downloads the Fluent Emoji 3D renders listed in emoji-sources.json and stores them as small WebP
// files named by codepoint, which is how the client looks them up. Needs cwebp on PATH.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const sources = JSON.parse(readFileSync(join(root, 'client/src/assets/emoji-sources.json'), 'utf8'));
const out = join(root, 'client/src/assets/emoji');
mkdirSync(out, { recursive: true });

function emojiFile(emoji) {
  return [...emoji.replaceAll('️', '')].map((c) => c.codePointAt(0).toString(16)).join('-');
}

for (const [emoji, path] of Object.entries(sources)) {
  const target = join(out, `${emojiFile(emoji)}.webp`);
  if (existsSync(target)) continue;
  const res = await fetch(`https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/${encodeURI(path)}`);
  if (!res.ok) throw new Error(`${emoji} ${path}: ${res.status}`);
  const png = join(tmpdir(), 'emoji.png');
  writeFileSync(png, Buffer.from(await res.arrayBuffer()));
  execFileSync('cwebp', ['-quiet', '-resize', '256', '256', '-q', '82', '-alpha_q', '90', png, '-o', target]);
  rmSync(png);
  console.log(emoji, target);
}
