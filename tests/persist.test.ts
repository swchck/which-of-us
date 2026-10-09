import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import type { ClientMsg, ServerMsg } from '../shared/protocol.js';
import { startApp } from '../server/app.js';
import { scaledDurations } from '../server/game/types.js';
import { seededRng } from '../server/util.js';

const dir = mkdtempSync(join(tmpdir(), 'kto-state-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

async function connect(port: number): Promise<{ send: (m: ClientMsg) => void; next: (t: ServerMsg['t']) => Promise<ServerMsg>; close: () => void }> {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
  const inbox: ServerMsg[] = [];
  ws.on('message', (d) => inbox.push(JSON.parse(d.toString()) as ServerMsg));
  await new Promise((r) => ws.once('open', r));
  return {
    send: (m) => ws.send(JSON.stringify(m)),
    next: async (t) => {
      for (let i = 0; i < 500; i++) {
        const found = inbox.find((m) => m.t === t || m.t === 'error');
        if (found) {
          inbox.splice(inbox.indexOf(found), 1);
          return found;
        }
        await new Promise((r) => setTimeout(r, 10));
      }
      throw new Error(`no ${t}`);
    },
    close: () => ws.close(),
  };
}

describe('server restart', () => {
  it('brings rooms back so the TV and phones resume where they were', async () => {
    const options = { port: 0, durations: scaledDurations(0.01), rng: seededRng(1), botPace: 0.01, stateDir: dir };
    const first = await startApp(options);
    const tv = await connect(first.port);
    tv.send({ t: 'host.create' });
    const hello = await tv.next('host.welcome');
    if (hello.t !== 'host.welcome') throw new Error('expected welcome');
    const phone = await connect(first.port);
    phone.send({ t: 'join', code: hello.code, name: 'Аня', color: 2 });
    const joined = await phone.next('welcome');
    if (joined.t !== 'welcome') throw new Error('expected welcome');
    tv.send({ t: 'host.settings', settings: { episodes: 3, packs: ['family'] } });
    tv.send({ t: 'host.question', text: 'Кто из нас забудет зарядку?' });
    tv.send({ t: 'host.addBot' });
    // one socket is handled in order, so the pong means every message above has landed
    tv.send({ t: 'ping', at: 1 });
    await tv.next('pong');
    tv.close();
    phone.close();
    await first.close();

    const second = await startApp(options);
    try {
      const room = second.rooms.get(hello.code);
      expect(room).toBeDefined();
      expect(room!.settings.episodes).toBe(3);
      expect(room!.settings.packs).toEqual(['family']);
      expect(room!.view().customCount).toBe(1);
      const anya = room!.players().find((p) => p.name === 'Аня')!;
      expect(anya.connected).toBe(false);
      expect(anya.color).toBe(2);
      expect(room!.players().filter((p) => p.bot)).toHaveLength(1);

      const phone2 = await connect(second.port);
      phone2.send({ t: 'resume', code: hello.code, token: joined.token });
      const back = await phone2.next('welcome');
      expect(back.t).toBe('welcome');
      expect(anya.connected).toBe(true);
      const tv2 = await connect(second.port);
      tv2.send({ t: 'host.resume', code: hello.code, token: hello.token });
      expect((await tv2.next('host.welcome')).t).toBe('host.welcome');
      phone2.close();
      tv2.close();
    } finally {
      await second.close();
    }
  });
});

describe('public server', () => {
  it('points phones at the public address and stops code guessing', async () => {
    const app = await startApp({ port: 0, publicUrl: 'https://party.example.com' });
    try {
      const tv = await connect(app.port);
      tv.send({ t: 'host.create' });
      const room = await tv.next('room');
      if (room.t !== 'room') throw new Error('expected room');
      expect(room.view.joinUrl).toMatch(/^https:\/\/party\.example\.com\/p\?c=\d{4}$/);
      expect(room.view.lan).toBe(false);

      const guesser = await connect(app.port);
      const codes: string[] = [];
      for (let i = 0; i < 22; i++) {
        guesser.send({ t: 'join', code: '0000', name: 'x', color: 0 });
        const reply = await guesser.next('error');
        if (reply.t === 'error') codes.push(reply.code);
      }
      expect(codes.slice(0, 20).every((c) => c === 'no_room')).toBe(true);
      expect(codes.at(-1)).toBe('too_many');
      tv.close();
      guesser.close();
    } finally {
      await app.close();
    }
  });
});
