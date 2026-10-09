import { execFile } from 'node:child_process';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { logPath } from './log.js';

/** How long a screenshot may take before the report is saved without one. */
const SCREENSHOT_TIMEOUT_MS = 5000;

/**
 * Saves a bug report next to the game's data: the room's state and recent events as JSON, the
 * server's log when it keeps one, and a screenshot of the screen on macOS, where the server runs
 * on the same computer as the TV page.
 * Elsewhere, or when the system refuses screen recording, the report goes out without the picture.
 */
export async function saveReport(root: string, code: string, data: object): Promise<{ dir: string; screenshot: boolean }> {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = join(root, `${stamp}-${code}`);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'report.json'), JSON.stringify(data, null, 2));
  // the room's journal says what the game did; the log says what the voice and the TV page did
  const log = logPath();
  if (log) await copyFile(log, join(dir, 'server.log')).catch(() => undefined);
  const screenshot = process.platform === 'darwin' && (await capture(join(dir, 'screenshot.png')));
  return { dir, screenshot };
}

function capture(file: string): Promise<boolean> {
  return new Promise((done) => {
    // -x keeps the shutter sound off: the room is mid-party
    execFile('screencapture', ['-x', '-t', 'png', file], { timeout: SCREENSHOT_TIMEOUT_MS }, (err) => done(!err));
  });
}
