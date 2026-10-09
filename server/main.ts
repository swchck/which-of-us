import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import QRCode from 'qrcode';
import { lanAddress, startApp } from './app.js';
import { collectLogs, startLog } from './log.js';
import { assetsHandler } from './assets.js';
import { seededRng } from './util.js';
import { scaledDurations, DURATIONS } from './game/types.js';
import { loadOrCreateCert } from './tls.js';
import { Tts } from './tts.js';

function projectRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(dir, 'package.json'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('package.json not found');
    dir = parent;
  }
  return dir;
}

const PAGES: Record<string, string> = { '/': 'host.html', '/p': 'play.html' };

async function main(): Promise<void> {
  // the desktop app ships the client as a resource and points us at it
  const bundledDist = process.env.KTO_DIST;
  const prod = process.env.NODE_ENV === 'production' || bundledDist !== undefined;
  const port = Number(process.env.PORT) || 3000;
  const httpsPort = Number(process.env.HTTPS_PORT) || port + 443;
  const speed = Number(process.env.GAME_SPEED) || 1;
  // screenshot tests need the same room code, bots and faces on every run
  const seed = Number(process.env.GAME_SEED) || 0;
  const publicUrl = process.env.PUBLIC_URL?.replace(/\/+$/, '');
  const dataDir = process.env.KTO_DATA_DIR || join(homedir(), '.kto-iz-nas');
  // only the desktop app keeps a log file: a terminal run already shows everything, and a public server has its own
  const logs = bundledDist && !publicUrl ? join(dataDir, 'logs') : undefined;
  if (logs) startLog(logs);

  const running = await startApp({
    port,
    durations: speed === 1 ? DURATIONS : scaledDurations(1 / speed),
    rng: seed ? seededRng(seed) : undefined,
    botPace: 1 / speed,
    // a public deployment sits behind a proxy that already speaks HTTPS
    https: publicUrl ? undefined : { port: httpsPort, tls: () => loadOrCreateCert(dataDir, lanAddress()) },
    stateDir: join(dataDir, 'rooms'),
    reportsDir: join(dataDir, 'reports'),
    publicUrl: publicUrl || undefined,
    // the desktop build bakes the relay's address in; without one the TV does not offer it
    relay: process.env.KTO_RELAY_URL ? { url: process.env.KTO_RELAY_URL, identityFile: join(dataDir, 'relay.json') } : undefined,
    collectLogs: logs ? (details) => collectLogs(dataDir, { build: process.env.KTO_BUILD ?? 'dev', ...details }) : undefined,
    // the desktop app passes the checkout it was built from; a dev run finds tts/ next to package.json
    tts: Tts.open({
      dir: process.env.KTO_TTS_DIR ?? (bundledDist ? undefined : join(projectRoot(), 'tts')),
      bundle: process.env.KTO_TTS_BUNDLE ?? (bundledDist ? undefined : join(projectRoot(), 'tts', 'voices')),
      runtime: process.env.KTO_TTS_RUNTIME,
      cache: join(dataDir, 'tts-cache'),
    }),
    pages: async (app, server) => {
      if (prod) {
        const dist = bundledDist ?? join(projectRoot(), 'dist');
        for (const [route, file] of Object.entries(PAGES)) {
          const html = readFileSync(join(dist, file), 'utf8');
          app.get(route, (_req, res) => {
            res.type('html').setHeader('Cache-Control', 'no-cache').send(html);
          });
        }
        app.use('/assets', assetsHandler(join(dist, 'assets')));
        // everything Vite copies from client/public (sketch backdrops, licence texts) lives beside the pages
        app.use(express.static(dist, { index: false, maxAge: '1d' }));
        return;
      }
      const root = projectRoot();
      const { createServer } = await import('vite');
      const vite = await createServer({
        configFile: join(root, 'vite.config.ts'),
        server: { middlewareMode: true, hmr: { server } },
        appType: 'custom',
      });
      for (const [route, file] of Object.entries(PAGES)) {
        app.get(route, async (req, res, next) => {
          try {
            const raw = await readFile(join(root, 'client', file), 'utf8');
            res.type('html').send(await vite.transformIndexHtml(req.originalUrl, raw));
          } catch (err) {
            next(err);
          }
        });
      }
      app.use(vite.middlewares);
    },
  });

  const lan = publicUrl ?? `http://${lanAddress()}:${running.port}`;
  const qr = await QRCode.toString(`${lan}/p`, { type: 'terminal', small: true });
  const secure = running.httpsPort ? `\n  С датчиками:    https://${lanAddress()}:${running.httpsPort}/p` : '';
  console.log(`
  «Кто из нас?» запущена${prod ? '' : ' (dev)'}

  Экран для ТВ:   http://localhost:${running.port}
  Телефоны:       ${lan}/p${secure}
${qr}`);
  // the desktop shell waits for this exact line before opening the TV page
  console.log(`KTO_READY ${running.port}`);

  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    setTimeout(() => process.exit(0), 2000).unref();
    void running.close().then(() => process.exit(0));
  };
  // timers drive every game, and one bad tick in a bare setTimeout would end all parties at once
  process.on('uncaughtException', (err) => console.error('uncaught:', err));
  process.on('unhandledRejection', (err) => console.error('unhandled rejection:', err));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  if (process.env.KTO_EXIT_WITH_STDIN) {
    // the desktop app holds our stdin; it closes when the app quits or crashes, so we don't linger
    process.stdin.on('data', (chunk: Buffer) => chunk.toString().includes('quit') && shutdown());
    process.stdin.on('end', shutdown);
    process.stdin.on('close', shutdown);
    process.stdin.resume();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
