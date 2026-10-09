import { describe, expect, it } from 'vitest';
import { speechPieces, speechSentences, speechText } from '../shared/catalog.js';
import { GAMES, LOCATIONS, MINIS_MAX, QUESTIONS_MIN } from '../shared/protocol.js';
import { Game } from '../server/game/game.js';
import { scaledDurations } from '../server/game/types.js';
import { Room } from '../server/room.js';
import { fixedSentences, nameFragments } from '../server/tts-lines.js';
import { seededRng } from '../server/util.js';

/**
 * Plays bot parties through every game and place and checks that the narrator says nothing the
 * prebuilt voice cache lacks, apart from players' names, what players typed and running scores.
 * A failure names the sentence: add its template to server/tts-lines.ts.
 */

const SEEDS = 16;
// running scores and star counts take any value, so these few lines are rendered during the game
const SCORES = [/очк/, /со счётом/, /^Ничья, .* на .*!$/];

function texts(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => texts(x, out));
  return out;
}

describe('prebuilt narration', () => {
  it('covers every sentence of bot parties but names, typed answers and scores', async () => {
    const known = new Set([...fixedSentences(), ...nameFragments()]);
    const typed: string[] = [];
    const answer = Game.prototype.answer;
    Game.prototype.answer = function (this: Game, ...args: Parameters<typeof answer>) {
      for (const t of texts(args.slice(1))) if (t.length >= 3) typed.push(speechText(t));
      return answer.apply(this, args);
    };
    const missing = new Map<string, number>();
    try {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const room = new Room('0000', { durations: scaledDurations(0.003), rng: seededRng(seed), botPace: 0.003, joinUrl: () => 'x', httpsAvailable: false });
        room.settings.episodes = 3;
        room.settings.questions = QUESTIONS_MIN;
        room.settings.minis = MINIS_MAX;
        room.settings.games = [...GAMES];
        room.settings.missions = seed % 2 === 0;
        room.settings.teams = seed % 4 === 0;
        room.settings.locations = [0, 1, 2].map((k) => LOCATIONS[(seed * 3 + k * 17) % LOCATIONS.length]!);
        for (let i = 0; i < 2 + (seed % 7); i++) room.addBot();
        const names = room.players().map((p) => p.name);
        const spoken = names.map(speechText);
        room.start();
        let last: string | undefined;
        const started = Date.now();
        while (room.phase.kind !== 'final' && Date.now() - started < 60_000) {
          const say = room.say;
          if (say && say !== last) {
            last = say;
            for (const s of speechSentences(say)) {
              if (known.has(s) || SCORES.some((re) => re.test(s))) continue;
              const pieces = speechPieces(s, names).filter((p) => !spoken.includes(p));
              if (pieces.every((p) => known.has(p) || typed.some((t) => p.includes(t) || t.includes(p)))) continue;
              missing.set(s, (missing.get(s) ?? 0) + 1);
            }
          }
          await new Promise((r) => setTimeout(r, 1));
        }
      }
    } finally {
      Game.prototype.answer = answer;
    }
    expect([...missing.keys()]).toEqual([]);
  }, 600_000);
});
