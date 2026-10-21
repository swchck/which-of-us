#!/usr/bin/env node
// Generates latest.json for tauri-plugin-updater from the signed release artifacts.
// Usage: node scripts/updater-manifest.mjs <version> <release-dir>
// Writes the manifest to stdout; exits 0 even when no .sig files exist (unsigned build).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , version, dir] = process.argv;
if (!version || !dir) {
  process.stderr.write('Usage: updater-manifest.mjs <version> <release-dir>\n');
  process.exit(1);
}

const REPO = 'https://github.com/swchck/which-of-us';
const DOWNLOAD_BASE = `${REPO}/releases/latest/download`;

// Maps platform key → bundle filename pattern
const PLATFORMS = {
  'darwin-aarch64': { bundle: 'kto-iz-nas-macos-arm64.app.tar.gz', installer: 'kto-iz-nas-macos-arm64.dmg' },
  'windows-x86_64': { bundle: 'kto-iz-nas-windows-x64-setup.exe', installer: 'kto-iz-nas-windows-x64-setup.exe' },
};

const files = readdirSync(dir);
const sigs = files.filter((f) => f.endsWith('.sig'));

if (sigs.length === 0) {
  process.stderr.write('No .sig files found — skipping updater manifest\n');
  process.exit(0);
}

const platforms = {};
for (const [platform, { bundle, installer }] of Object.entries(PLATFORMS)) {
  const sigFile = files.find((f) => f === `${bundle}.sig` || f === `${installer}.sig`);
  if (!sigFile) continue;
  const bundleFile = files.find((f) => f === bundle);
  platforms[platform] = {
    signature: readFileSync(join(dir, sigFile), 'utf8').trim(),
    url: `${DOWNLOAD_BASE}/${bundleFile ?? bundle}`,
  };
}

if (Object.keys(platforms).length === 0) {
  process.stderr.write('No matching platform artifacts found — skipping updater manifest\n');
  process.exit(0);
}

function changelogNotes(ver) {
  const root = dirname(fileURLToPath(import.meta.url));
  const path = join(root, '..', 'CHANGELOG.md');
  if (!existsSync(path)) return '';
  const text = readFileSync(path, 'utf8');
  const match = text.match(new RegExp(`^##\\s+${ver.replace(/\./g, '\\.')}\\s*$([\\s\\S]*?)(?=^##\\s|$)`, 'm'));
  return match ? match[1].trim() : '';
}

const manifest = {
  version,
  notes: changelogNotes(version),
  pub_date: new Date().toISOString(),
  platforms,
};

process.stdout.write(JSON.stringify(manifest, null, 2) + '\n');
