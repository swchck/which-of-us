// Computes the numbers shown on the page from the game's own sources and copies the promo screenshots.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const site = resolve(root, 'site');

const entry = `
import { GAME_INFO, LOCATION_INFO } from './shared/catalog.ts';
import { placeContent, questionPacks } from './server/content/index.ts';
export const data = { GAME_INFO, LOCATION_INFO, placeContent, questionPacks };
`;

const bundled = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'ts' },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  logLevel: 'error',
});
const code = bundled.outputFiles[0].text;
const { data } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

const count = (list) => list.length;
let questions = 0;
for (const pack of Object.values(data.questionPacks)) questions += count(pack.vote) + count(pack.predict);
for (const place of Object.values(data.placeContent)) questions += count(place.vote) + count(place.predict);

const games = Object.entries(data.GAME_INFO).map(([id, g]) => ({ id, icon: g.icon, title: g.title, pitch: g.pitch }));
const places = Object.entries(data.LOCATION_INFO).map(([id, p]) => ({ id, icon: p.icon, title: p.title, theme: p.theme }));

const shotsSrc = resolve(root, 'docs/screenshots');
const shotsDst = resolve(site, 'public/screens');
rmSync(shotsDst, { recursive: true, force: true });
const screens = [];
if (existsSync(shotsSrc)) {
  mkdirSync(shotsDst, { recursive: true });
  cpSync(shotsSrc, shotsDst, { recursive: true });
  for (const f of readdirSync(shotsDst)) if (f.endsWith('.webp')) screens.push(f.slice(0, -5));
}

writeFileSync(
  resolve(site, 'src/generated.json'),
  JSON.stringify({ questions, packs: Object.keys(data.questionPacks).length, games, places, screens: screens.sort() }, null, 2),
);
console.log(`site data: ${games.length} games, ${places.length} places, ${questions} questions, ${screens.length} screenshots`);
