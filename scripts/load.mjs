#!/usr/bin/env node
// Load test: a TV and 8 phones over raw WebSockets play the drawing and tilt games at full input
// rate (ink every 70 ms, tilt every 50 ms, like the real phone client), while every phone pings
// the server twice a second. Reports round-trip times and how evenly arena frames reach the TV.
//
//   npm run build && node scripts/load.mjs              spawns its own server
//   node scripts/load.mjs --url ws://host:3000/ws       targets a running one
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { WebSocket } from 'ws';

const PHONES = 8;
const PORT = 3322;
const PING_MS = 500;
const INK_MS = 70;
const TILT_MS = 50;
const GAMES = ['selfie', 'monster', 'shared', 'guess', 'tilt'];

const urlArg = process.argv.indexOf('--url');
let url = urlArg > 0 ? process.argv[urlArg + 1] : `ws://localhost:${PORT}/ws`;
let server = null;

if (urlArg < 0) {
  server = spawn(process.execPath, ['dist-server/server/main.js'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), GAME_SPEED: '2' },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  // a crash below must not leave this server behind for the next run to load-test by mistake
  process.on('exit', () => server.kill());
  let up = false;
  for (let i = 0; i < 50 && !up; i++) {
    up = await fetch(`http://localhost:${PORT}/api/info`).then((r) => r.ok, () => false);
    if (!up) await sleep(200);
  }
  if (!up) throw new Error(`server did not come up on :${PORT}`);
}

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

function next(ws, test) {
  return new Promise((resolve) => {
    const on = (data) => {
      const msg = JSON.parse(data.toString());
      if (test(msg)) {
        ws.off('message', on);
        resolve(msg);
      }
    };
    ws.on('message', on);
  });
}

const rtts = [];
const arenaGaps = [];
const counts = { sent: 0, received: 0 };

const host = await connect();
host.send(JSON.stringify({ t: 'host.create' }));
const { code } = await next(host, (m) => m.t === 'host.welcome');
host.send(JSON.stringify({ t: 'host.settings', settings: { episodes: 1, games: GAMES } }));
let lastArena = 0;
let phaseKind = 'lobby';
// the arena only sends an occasional frame during the 3-2-1, so gaps count from the start
let rollingFrom = Infinity;
host.on('message', (data) => {
  counts.received++;
  const msg = JSON.parse(data.toString());
  if (msg.t === 'room') {
    phaseKind = msg.view.phase.kind;
    if (phaseKind === 'tilt') rollingFrom = performance.now() + msg.view.phase.startsAt - msg.view.serverNow;
    else lastArena = 0;
  }
  if (msg.t !== 'arena' || phaseKind !== 'tilt' || performance.now() < rollingFrom) return;
  const now = performance.now();
  if (lastArena) arenaGaps.push(now - lastArena);
  lastArena = now;
});

function play(ws, you) {
  let view = null;
  let stroke = null;
  const send = (msg) => {
    counts.sent++;
    ws.send(JSON.stringify(msg));
  };
  const answered = new Set();
  ws.on('message', (data) => {
    counts.received++;
    const msg = JSON.parse(data.toString());
    if (msg.t === 'pong') rtts.push(performance.now() - msg.at);
    if (msg.t !== 'me') return;
    view = msg.view;
    const p = view.phase;
    const key = view.phaseId;
    if (answered.has(key)) return;
    const answer = (value) => {
      answered.add(key);
      send({ t: 'answer', phaseId: key, value });
    };
    if (p.kind === 'rules') answer('ready');
    else if (p.kind === 'vote') answer(p.options.find((id) => id !== you) ?? p.options[0]);
    else if (p.kind === 'predict' && p.target !== you) answer(0);
    else if (p.kind === 'gallery' && view.personal.canVote && Date.now() >= p.votingFrom - 2000) {
      const pick = p.items.find((i) => !view.personal.own.includes(i.id));
      if (pick) setTimeout(() => answer(pick.id), Math.max(0, p.votingFrom - view.serverNow) + 50);
    }
  });

  const ping = setInterval(() => send({ t: 'ping', at: performance.now() }), PING_MS);
  const ink = setInterval(() => {
    const p = view?.phase;
    const drawing =
      (p?.kind === 'draw' && view.personal.kind === 'draw' && !view.personal.done) ||
      (p?.kind === 'shared' && view.personal.myTurn) ||
      (p?.kind === 'guess' && p.artist === you);
    if (!drawing) {
      stroke = null;
      return;
    }
    if (!stroke || stroke.p.length > 120) {
      if (stroke) send({ t: 'ink', phaseId: view.phaseId, op: { k: 'end', s: stroke } });
      stroke = { c: '#222222', w: 8, p: [] };
    }
    const fresh = [];
    for (let i = 0; i < 4; i++) fresh.push(Math.round(Math.random() * 600), Math.round(Math.random() * 600));
    stroke.p.push(...fresh);
    send({ t: 'ink', phaseId: view.phaseId, op: { k: 'move', s: { c: stroke.c, w: stroke.w, p: fresh } } });
  }, INK_MS);
  const tilt = setInterval(() => {
    if (view?.phase.kind !== 'tilt') return;
    const t = performance.now() / 1000;
    send({ t: 'tilt', phaseId: view.phaseId, x: Math.round(Math.sin(t) * 100) / 100, y: Math.round(Math.cos(t * 1.3) * 100) / 100 });
  }, TILT_MS);
  return () => [ping, ink, tilt].forEach(clearInterval);
}

const stops = [];
const phones = [];
for (let i = 0; i < PHONES; i++) {
  const ws = await connect();
  ws.send(JSON.stringify({ t: 'join', code, name: `Нагрузка ${i + 1}`, color: i }));
  const { you } = await next(ws, (m) => m.t === 'welcome');
  stops.push(play(ws, you));
  phones.push(ws);
}

const started = performance.now();
host.send(JSON.stringify({ t: 'host.start' }));
const seen = new Set();
await new Promise((resolve) => {
  const timer = setInterval(() => {
    seen.add(phaseKind);
    if (phaseKind === 'final' || performance.now() - started > 8 * 60_000) {
      clearInterval(timer);
      resolve();
    }
  }, 100);
});

stops.forEach((stop) => stop());
for (const ws of [host, ...phones]) ws.close();
server?.kill();

const pct = (list, q) => {
  if (list.length === 0) return NaN;
  const sorted = [...list].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
};
const fmt = (n) => (Number.isNaN(n) ? '—' : `${n.toFixed(1)} ms`);
const seconds = (performance.now() - started) / 1000;
console.log(`phases: ${[...seen].join(', ')}`);
console.log(`${PHONES} phones, ${seconds.toFixed(0)} s, ${counts.sent} messages up, ${counts.received} down`);
console.log(`ping RTT        p50 ${fmt(pct(rtts, 0.5))}  p95 ${fmt(pct(rtts, 0.95))}  p99 ${fmt(pct(rtts, 0.99))}  max ${fmt(rtts.length ? Math.max(...rtts) : NaN)}`);
console.log(`arena frame gap p50 ${fmt(pct(arenaGaps, 0.5))}  p95 ${fmt(pct(arenaGaps, 0.95))}  max ${fmt(arenaGaps.length ? Math.max(...arenaGaps) : NaN)}  (target 33 ms)`);
if (!seen.has('final')) console.error('the party never reached the final screen');
process.exit(seen.has('final') ? 0 : 1);
