import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GAMES, LOCATIONS } from '../shared/protocol.js';
import { FreshnessLog } from '../server/fresh.js';
import { ContentDecks } from '../server/game/content.js';
import { planGame } from '../server/game/plan.js';
import { seededRng } from '../server/util.js';

describe('freshness across evenings', () => {
  it('starts a new room with questions the last one never asked', () => {
    const log = new FreshnessLog();
    const first = new ContentDecks(seededRng(1), log);
    const asked = new Set(Array.from({ length: 30 }, () => first.nextVote().q));
    const second = new ContentDecks(seededRng(1), log);
    const next = Array.from({ length: 30 }, () => second.nextVote().q);
    expect(next.filter((q) => asked.has(q))).toEqual([]);
  });

  it('sends the next game to places it has not visited lately', () => {
    const log = new FreshnessLog();
    const options = { games: GAMES, locations: LOCATIONS, questions: 3, minis: 1, spotlight: true, fresh: log };
    const seen = new Set<string>();
    for (let game = 0; game < 3; game++) {
      for (const e of planGame(3, seededRng(game + 1), options)) {
        expect(seen.has(e.location), e.location).toBe(false);
        seen.add(e.location);
      }
    }
  });

  it('remembers across restarts', () => {
    const dir = mkdtempSync(join(tmpdir(), 'kto-fresh-'));
    try {
      const file = join(dir, 'seen.json');
      const log = new FreshnessLog(file);
      log.mark('vote', 'Кто из нас?');
      log.flush();
      expect(new FreshnessLog(file).lastUsed('vote', 'Кто из нас?')).toBeGreaterThan(0);
      expect(new FreshnessLog(file).lastUsed('vote', 'другое')).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
