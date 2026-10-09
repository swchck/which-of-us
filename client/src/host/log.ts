/**
 * Sends what the TV page notices about itself (script errors, a voice falling back to the system
 * one) to the server's log file, so an archive from the desktop app tells the whole story. Only the
 * desktop app keeps that file; elsewhere the server refuses and the page stops trying.
 */

const FLUSH_MS = 2000;
const QUEUE_MAX = 200;

let queue: string[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let refused = false;

/** Notes a line for the log; sent in batches, dropped when the server keeps no log. */
export function tvLog(text: string): void {
  if (refused) return;
  queue.push(text);
  if (queue.length > QUEUE_MAX) queue = queue.slice(-QUEUE_MAX);
  timer ??= setTimeout(flush, FLUSH_MS);
}

function flush(): void {
  timer = undefined;
  const lines = queue;
  queue = [];
  if (!lines.length) return;
  fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines }) })
    .then((res) => {
      if (res.status === 403) refused = true;
    })
    .catch(() => undefined);
}

/** Starts logging uncaught errors, once per page. */
export function watchErrors(): void {
  addEventListener('error', (e) => tvLog(`error: ${e.message} at ${e.filename}:${e.lineno}:${e.colno}`));
  addEventListener('unhandledrejection', (e) => tvLog(`unhandled rejection: ${describe(e.reason)}`));
  tvLog(`page loaded: ${navigator.userAgent}, ${innerWidth}×${innerHeight}@${devicePixelRatio}`);
}

export function describe(err: unknown): string {
  return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
}

/** Packs the logs into an archive on this computer's desktop; resolves to its path, or null on failure. */
export async function collectLogs(about: object): Promise<string | null> {
  flush();
  try {
    const res = await fetch('/api/logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(about) });
    return res.ok ? ((await res.json()) as { file: string }).file : null;
  } catch {
    return null;
  }
}
