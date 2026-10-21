#!/usr/bin/env node
// Parses CHANGELOG.md and writes desktop/splash/changelog.json.
// Format: { "1.2.3": "- line\n- line", ... } newest first.
// Usage: node scripts/changelog-export.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const src = join(root, 'CHANGELOG.md');
const out = join(root, 'desktop', 'splash', 'changelog.json');

const text = readFileSync(src, 'utf8');
const result = {};

let current = null;
let lines = [];

for (const line of text.split('\n')) {
  const heading = line.match(/^##\s+(.+)/);
  if (heading) {
    if (current !== null) result[current] = lines.join('\n').trim();
    current = heading[1].trim();
    lines = [];
  } else if (current !== null) {
    lines.push(line);
  }
}
if (current !== null) result[current] = lines.join('\n').trim();

writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(`changelog-export: wrote ${Object.keys(result).length} versions to ${out}`);
