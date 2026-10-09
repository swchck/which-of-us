// Packs the game server into one executable for the desktop app (Tauri sidecar):
// esbuild bundles server/main.ts into CommonJS, Node SEA turns it into a binary,
// and the result lands where tauri.conf.json's externalBin expects it.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'build', 'sidecar');
const win = process.platform === 'win32';

function hostTriple() {
  const info = execFileSync('rustc', ['-vV'], { encoding: 'utf8' });
  const line = info.split('\n').find((l) => l.startsWith('host:'));
  if (!line) throw new Error('rustc -vV did not report a host triple');
  return line.slice('host:'.length).trim();
}

/** True when this node binary can build single executables (distro builds often can't). */
function canBuildSea(node) {
  const probe = spawnSync(node, ['--build-sea', join(root, 'package.json')], { encoding: 'utf8' });
  const out = `${probe.stderr}${probe.stdout}`;
  return !out.includes('Single executable application is disabled') && !out.includes('bad option');
}

/**
 * Official Node of the same version from nodejs.org, checksum-verified and cached in build/.
 * Homebrew's node, for one, ships with SEA disabled.
 */
async function officialNode() {
  const version = `v${process.versions.node}`;
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  const platform = win ? 'win' : process.platform;
  const name = `node-${version}-${platform}-${arch}`;
  const archive = win ? `${name}.zip` : `${name}.tar.gz`;
  const cache = join(root, 'build', 'node');
  const exe = win ? join(cache, name, 'node.exe') : join(cache, name, 'bin', 'node');
  if (existsSync(exe)) return exe;

  mkdirSync(cache, { recursive: true });
  const base = `https://nodejs.org/dist/${version}`;
  console.log(`fetching ${base}/${archive}`);
  const listing = await fetch(`${base}/SHASUMS256.txt`);
  if (!listing.ok) throw new Error(`checksum list failed: ${listing.status}`);
  const sums = await listing.text();
  const expected = sums.split('\n').find((l) => l.endsWith(`  ${archive}`))?.split(' ')[0];
  if (!expected) throw new Error(`no checksum for ${archive}`);
  const res = await fetch(`${base}/${archive}`);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const data = Buffer.from(await res.arrayBuffer());
  const actual = createHash('sha256').update(data).digest('hex');
  if (actual !== expected) throw new Error(`checksum mismatch for ${archive}`);
  const file = join(cache, archive);
  writeFileSync(file, data);
  // on Windows runners GNU tar from Git comes first on PATH and cannot read zip; bsdtar in System32 can
  const tar = win ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
  execFileSync(tar, ['-xf', file, '-C', cache], { stdio: 'inherit' });
  return exe;
}

function buildName() {
  const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  let commit = 'unknown';
  try {
    commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root }).toString().trim();
  } catch {
    // a source archive without .git still builds
  }
  return `${version} ${commit} ${new Date().toISOString().slice(0, 16)}`;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

await build({
  entryPoints: [join(root, 'server', 'main.ts')],
  outfile: join(out, 'server.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  // vite is only imported in dev mode; ws probes these optional native speedups
  external: ['vite', 'bufferutil', 'utf-8-validate'],
  // CommonJS has no import.meta; the bundle only needs it outside the desktop app
  // the build is named in log archives, so a report says which commit it came from
  define: { 'import.meta.url': '__kto_import_meta_url', 'process.env.KTO_BUILD': JSON.stringify(buildName()) },
  banner: { js: "const __kto_import_meta_url = require('node:url').pathToFileURL(__filename).href;" },
  logLevel: 'warning',
});

const binary = join(out, win ? 'kto-server.exe' : 'kto-server');
writeFileSync(
  join(out, 'sea.json'),
  JSON.stringify({
    main: join(out, 'server.cjs'),
    output: binary,
    disableExperimentalSEAWarning: true,
    useCodeCache: false,
    useSnapshot: false,
  }),
);
const [major, minor] = process.versions.node.split('.').map(Number);
// --build-sea arrived in 25.5; an older version would download the same old Node and fail after it
if (major < 25 || (major === 25 && minor < 5)) throw new Error(`the sidecar needs Node 25.5+, this is ${process.version}`);
const node = canBuildSea(process.execPath) ? process.execPath : await officialNode();
execFileSync(node, ['--build-sea', join(out, 'sea.json')], { stdio: 'inherit' });

// injecting the blob invalidates the node binary's signature, and Apple Silicon refuses unsigned code
if (process.platform === 'darwin') {
  execFileSync('codesign', ['--sign', '-', '--force', binary], { stdio: 'inherit' });
}

const target = join(root, 'desktop', 'src-tauri', 'binaries', `kto-server-${hostTriple()}${win ? '.exe' : ''}`);
mkdirSync(dirname(target), { recursive: true });
copyFileSync(binary, target);
console.log(`sidecar → ${target}`);
