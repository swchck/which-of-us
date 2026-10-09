import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import express from 'express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { assetsHandler } from '../server/assets.js';

let root: string;
let server: Server;
let base: string;

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'kto-assets-'));
  // a checkout or an app folder under ~/.something must serve the same as anywhere else
  const dir = join(root, '.hidden', 'assets');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'app-1.css'), 'body{}');
  writeFileSync(join(dir, 'app-1.css.br'), Buffer.from([0x0b, 0x02, 0x80]));
  writeFileSync(join(dir, 'app-1.css.gz'), Buffer.from([0x1f, 0x8b]));
  const app = express();
  app.use('/assets', assetsHandler(dir));
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const addr = server.address();
  base = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  rmSync(root, { recursive: true, force: true });
});

describe('build assets', () => {
  it('serves the brotli copy from a folder whose path has a dot-directory', async () => {
    const res = await fetch(`${base}/assets/app-1.css`, { headers: { 'accept-encoding': 'br' } });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-encoding')).toBe('br');
    expect(res.headers.get('content-type')).toMatch(/^text\/css/);
  });

  it('serves the plain file when the client takes no compression', async () => {
    const res = await fetch(`${base}/assets/app-1.css`, { headers: { 'accept-encoding': 'identity' } });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-encoding')).toBeNull();
    expect(await res.text()).toBe('body{}');
  });

  it('does not reach outside the folder', async () => {
    const res = await fetch(`${base}/assets/..%2f..%2fapp-1.css`, { headers: { 'accept-encoding': 'br' } });
    expect(res.status).not.toBe(200);
  });
});
