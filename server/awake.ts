import { spawn, type ChildProcess } from 'node:child_process';

/**
 * Keeps the computer and its display awake while any room has a game on. On macOS this runs
 * `caffeinate`, which the TV page's Wake Lock cannot replace: the desktop app's WebKit view has no
 * Wake Lock API. Elsewhere it does nothing and the TV page's own lock is all there is.
 */

const holders = new Set<object>();
let caffeinate: ChildProcess | null = null;
// unit tests start hundreds of games; a process per game would only slow them down
const enabled = process.platform === 'darwin' && !process.env.VITEST;

function sync(): void {
  if (holders.size > 0 && !caffeinate && enabled) {
    // -w ties it to this server, so a crashed server cannot leave the Mac awake forever
    const child = spawn('caffeinate', ['-d', '-i', '-w', String(process.pid)], { stdio: 'ignore' });
    caffeinate = child;
    child.on('error', (err) => console.warn('cannot keep the computer awake:', err.message));
    // a killed one exits late, possibly after the next game has already started its own
    child.on('exit', () => {
      if (caffeinate === child) caffeinate = null;
    });
  } else if (holders.size === 0 && caffeinate) {
    caffeinate.kill();
    caffeinate = null;
  }
}

/** Holds the computer awake on behalf of `owner` until `releaseAwake` is called with it. */
export function holdAwake(owner: object): void {
  holders.add(owner);
  sync();
}

/** Drops `owner`'s hold; the computer may sleep once nobody holds it. */
export function releaseAwake(owner: object): void {
  holders.delete(owner);
  sync();
}
