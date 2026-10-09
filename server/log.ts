import { execFile } from 'node:child_process';
import { appendFileSync, copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { arch, cpus, homedir, release, totalmem } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

/**
 * Keeps a log file of everything the server prints, plus what the TV page reports about itself, and
 * packs it with the system details into one archive a player can send to the developer. Nothing
 * leaves the computer by itself: the archive lands on the desktop and the player decides.
 */

/** A log past this size starts over, keeping the previous one beside it. */
const LOG_MAX_BYTES = 4 * 1024 * 1024;
/** Bug reports carry screenshots of several megabytes; the archive takes only the latest few. */
const REPORTS_IN_ARCHIVE = 3;

const run = promisify(execFile);
// the QR code and colours in the startup banner are terminal escapes, noise in a text file
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*[A-Za-z]`, 'g');

let logFile: string | undefined;

/** Starts copying stdout and stderr into `dir`/server.log; call once, before anything is printed. */
export function startLog(dir: string): void {
  mkdirSync(dir, { recursive: true });
  logFile = join(dir, 'server.log');
  if (existsSync(logFile) && statSync(logFile).size > LOG_MAX_BYTES) renameSync(logFile, join(dir, 'server.old.log'));
  appendLine(`--- started, pid ${process.pid}`);
  for (const stream of [process.stdout, process.stderr]) {
    const write = stream.write.bind(stream) as (chunk: unknown, ...rest: unknown[]) => boolean;
    stream.write = ((chunk: unknown, ...rest: unknown[]) => {
      appendLine(typeof chunk === 'string' ? chunk : Buffer.isBuffer(chunk) ? chunk.toString() : String(chunk));
      return write(chunk, ...rest);
    }) as typeof stream.write;
  }
}

/** The log file being written, if the server keeps one. */
export function logPath(): string | undefined {
  return logFile;
}

/** Appends a line from somewhere other than the console, e.g. the TV page, tagged with its source. */
export function logLine(source: string, text: string): void {
  appendLine(text.split('\n').map((l) => `[${source}] ${l}`).join('\n'));
}

function appendLine(text: string): void {
  if (!logFile) return;
  const clean = text.replace(ANSI, '').replace(/\n+$/, '');
  if (!clean.trim()) return;
  const stamp = new Date().toISOString();
  try {
    appendFileSync(logFile, clean.split('\n').map((l) => `${stamp} ${l}`).join('\n') + '\n');
  } catch {
    // a full or read-only disk must not take the party down with it
  }
}

/**
 * Packs the logs, the latest bug reports and `details` into an archive on the desktop (or in the data
 * folder when there is no desktop) and resolves to its path. Shows it in Finder on macOS.
 */
export async function collectLogs(dataDir: string, details: object): Promise<string> {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  // Latin only: mail clients and Windows unzip mangle Cyrillic file names in zips
  const name = `kto-iz-nas-logs-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const staging = join(dataDir, 'logs', 'collect', name);
  rmSync(join(dataDir, 'logs', 'collect'), { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });

  for (const f of ['server.log', 'server.old.log', 'app.log']) {
    const from = join(dataDir, 'logs', f);
    if (existsSync(from)) copyFileSync(from, join(staging, f));
  }
  const reports = join(dataDir, 'reports');
  if (existsSync(reports)) {
    for (const r of readdirSync(reports).sort().slice(-REPORTS_IN_ARCHIVE)) {
      try {
        cpSync(join(reports, r), join(staging, `report ${r}`), { recursive: true });
      } catch {
        // one unreadable report must not cost the whole archive
      }
    }
  }
  writeFileSync(join(staging, 'system.json'), JSON.stringify({ ...(await system()), ...details }, null, 2));

  const desktop = join(homedir(), 'Desktop');
  const outDir = existsSync(desktop) ? desktop : join(dataDir, 'logs');
  if (process.platform !== 'darwin') {
    const out = join(outDir, name);
    cpSync(staging, out, { recursive: true });
    return out;
  }
  const out = join(outDir, `${name}.zip`);
  // ditto writes the zip Finder itself would; --norsrc keeps the __MACOSX clutter out of it
  await run('ditto', ['-c', '-k', '--norsrc', '--keepParent', staging, out]);
  void run('open', ['-R', out]).catch(() => undefined);
  return out;
}

async function system(): Promise<object> {
  const macos = process.platform === 'darwin' ? (await run('sw_vers', ['-productVersion']).catch(() => ({ stdout: '' }))).stdout.trim() : undefined;
  return {
    collectedAt: new Date().toISOString(),
    platform: process.platform,
    macos,
    kernel: release(),
    arch: arch(),
    cpu: cpus()[0]?.model,
    cores: cpus().length,
    memoryGb: Math.round(totalmem() / 2 ** 30),
    node: process.version,
  };
}
