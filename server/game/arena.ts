import { ARENA, PAINT, type ArenaSnap } from '../../shared/protocol.js';
import type { Rng } from '../util.js';

const ACCEL = 2600;
/** Fraction of speed kept after one second without input. */
const FRICTION = 0.12;
const MAX_SPEED = 1100;
const WALL_BOUNCE = 0.6;
const BALL_BOUNCE = 0.95;
const NORMAL_STARS = 3;
const BIG_EVERY = 7;
const BIG_LIFETIME = 5;
const BIG_VALUE = 3;
/** Input older than this is treated as released, so a sleeping phone stops its ball. */
const INPUT_TTL_MS = 600;
/** Pull toward the nearest star vs. random drift; 0.7/0.6 lands bots at 15-27 stars a round. */
const BOT_DRIVE = 0.7;
const BOT_WOBBLE = 0.6;
/** «Сумо»: the floe starts at this radius and melts down to the last one over the bout. */
const FLOE_END = 170;
/** Ice keeps more speed and bumps harder, or nobody would ever slide off. */
const ICE_FRICTION = 0.4;
const ICE_BOUNCE = 1.5;
/** A fall within this many seconds of a bump counts as that bumper's knockout. */
const PUSH_CREDIT = 1.5;
/** «Квач»: a fresh hunter cannot tag back the one who just passed the role. */
const TAG_IMMUNE = 1.2;
/** «Захват»: a ball paints every cell whose centre it covers; a touch narrower than the ball keeps trails crisp. */
const PAINT_REACH = ARENA.ball * 0.9;
/** «Захват»: a bot heads for a fresh patch this often, or sooner once it gets there. */
const PAINT_RETARGET = 1.6;
const PAINT_CELL_W = ARENA.w / PAINT.cols;
const PAINT_CELL_H = ARENA.h / PAINT.rows;

export type ArenaMode = 'stars' | 'sumo' | 'tag' | 'paint';

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ix: number;
  iy: number;
  inputAt: number;
  bot: boolean;
  /** Bots wobble around their target so they don't play perfectly. */
  aim: number;
  /** «Сумо»: simulated second the ball slid off the floe. */
  fell?: number;
  /** «Сумо»: who last bumped this ball, and when. */
  pushedBy?: string;
  pushedAt?: number;
  /** «Захват»: where a bot is heading and until when. */
  goal?: { x: number; y: number; until: number };
}

interface Star {
  id: number;
  x: number;
  y: number;
  big: boolean;
  expires: number;
}

/**
 * Star-collecting arena: balls driven by tilt input, bouncing off walls and each other.
 * Time is in seconds of simulated play; callers advance it with `step`.
 */
export class Arena {
  readonly stars = new Map<string, number>();
  private balls: Ball[] = [];
  private field: Star[] = [];
  private nextStar = 1;
  private time = 0;
  private nextBig = BIG_EVERY;
  private hits: [string, number, number][] = [];
  /** «Квач»: who is the hunter, who may not be tagged yet, and seconds each spent free. */
  it: string | null = null;
  private immune: { id: string; until: number } | null = null;
  private passedAt = -1;
  readonly free = new Map<string, number>();
  /** «Сумо»: knockouts credited per bumper. */
  readonly knockouts = new Map<string, number>();
  /** «Захват»: owner of each floor cell row by row, as an index into the balls; -1 is bare floor. */
  private readonly cells = new Int8Array(PAINT.cols * PAINT.rows).fill(-1);
  /** `cells` as letters for the TV, rebuilt only on a tick that changed an owner. */
  private paintText: string | null = null;

  constructor(
    players: { id: string; bot: boolean }[],
    private readonly rng: Rng,
    private readonly mode: ArenaMode = 'stars',
    /** «Сумо»: seconds of play over which the floe melts. */
    private readonly melt = 40,
  ) {
    const n = players.length;
    players.forEach((p, i) => {
      const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
      this.balls.push({
        id: p.id,
        x: ARENA.w / 2 + Math.cos(a) * ARENA.h * 0.3,
        y: ARENA.h / 2 + Math.sin(a) * ARENA.h * 0.3,
        vx: 0,
        vy: 0,
        ix: 0,
        iy: 0,
        inputAt: 0,
        bot: p.bot,
        aim: rng() * Math.PI * 2,
      });
      this.stars.set(p.id, 0);
      this.free.set(p.id, 0);
    });
    if (mode === 'stars') while (this.field.filter((s) => !s.big).length < NORMAL_STARS) this.spawn(false);
    if (mode === 'tag') this.it = players[Math.floor(rng() * n)]?.id ?? null;
  }

  /** «Сумо»: the floe's radius right now. */
  get floe(): number {
    return ARENA.floe - (ARENA.floe - FLOE_END) * Math.min(1, this.time / this.melt);
  }

  /** «Сумо»: balls still on the ice. */
  standing(): string[] {
    return this.balls.filter((b) => b.fell === undefined).map((b) => b.id);
  }

  /** «Сумо»: ids by the second they fell, earliest first; balls still standing are left out. */
  fallen(): string[] {
    return this.balls.filter((b) => b.fell !== undefined).sort((a, b) => a.fell! - b.fell!).map((b) => b.id);
  }

  input(id: string, x: number, y: number, now: number): void {
    const ball = this.balls.find((b) => b.id === id);
    if (!ball || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const len = Math.hypot(x, y);
    const k = len > 1 ? 1 / len : 1;
    ball.ix = x * k;
    ball.iy = y * k;
    ball.inputAt = now;
  }

  step(dt: number, now: number): void {
    this.time += dt;
    if (this.mode === 'stars') this.steerBots(dt);
    else if (this.mode === 'paint') this.steerPainters(dt);
    else this.steerBrawlers(dt);
    const keep = Math.pow(this.mode === 'sumo' ? ICE_FRICTION : FRICTION, dt);
    for (const b of this.balls) {
      if (b.fell !== undefined) continue;
      const live = b.bot || now - b.inputAt < INPUT_TTL_MS;
      const ix = live ? b.ix : 0;
      const iy = live ? b.iy : 0;
      b.vx = (b.vx + ix * ACCEL * dt) * keep;
      b.vy = (b.vy + iy * ACCEL * dt) * keep;
      const speed = Math.hypot(b.vx, b.vy);
      if (speed > MAX_SPEED) {
        b.vx *= MAX_SPEED / speed;
        b.vy *= MAX_SPEED / speed;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (this.mode !== 'sumo') this.walls(b);
    }
    this.collide();
    if (this.mode === 'sumo') this.slide();
    if (this.mode === 'tag') for (const b of this.balls) if (b.id !== this.it) this.free.set(b.id, (this.free.get(b.id) ?? 0) + dt);
    if (this.mode === 'paint') this.paint();
    if (this.mode !== 'stars') return;
    this.collect();
    this.field = this.field.filter((s) => !s.big || s.expires > this.time);
    if (this.time >= this.nextBig) {
      this.nextBig = this.time + BIG_EVERY;
      this.spawn(true);
    }
  }

  private walls(b: Ball): void {
    const r = ARENA.ball;
    if (b.x < r) {
      b.x = r;
      b.vx = Math.abs(b.vx) * WALL_BOUNCE;
    } else if (b.x > ARENA.w - r) {
      b.x = ARENA.w - r;
      b.vx = -Math.abs(b.vx) * WALL_BOUNCE;
    }
    if (b.y < r) {
      b.y = r;
      b.vy = Math.abs(b.vy) * WALL_BOUNCE;
    } else if (b.y > ARENA.h - r) {
      b.y = ARENA.h - r;
      b.vy = -Math.abs(b.vy) * WALL_BOUNCE;
    }
  }

  /** Equal-mass elastic bumps: separate the overlap, then swap the normal velocity components. */
  private collide(): void {
    const min = ARENA.ball * 2;
    const bounce = this.mode === 'sumo' ? ICE_BOUNCE : BALL_BOUNCE;
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const a = this.balls[i]!;
        const b = this.balls[j]!;
        if (a.fell !== undefined || b.fell !== undefined) continue;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d >= min) continue;
        if (d === 0) {
          dx = 1;
          dy = 0;
          d = 1;
        }
        const nx = dx / d;
        const ny = dy / d;
        const push = (min - d) / 2;
        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
        this.touch(a, b);
        const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (rel <= 0) continue;
        const impulse = rel * (1 + bounce) * 0.5;
        a.vx -= impulse * nx;
        a.vy -= impulse * ny;
        b.vx += impulse * nx;
        b.vy += impulse * ny;
        if (this.mode !== 'sumo') {
          this.walls(a);
          this.walls(b);
        }
      }
    }
  }

  /** Who touched whom: «Сумо» remembers the bumper for the knockout, «Квач» passes the hunter's role. */
  private touch(a: Ball, b: Ball): void {
    if (this.mode === 'sumo') {
      Object.assign(a, { pushedBy: b.id, pushedAt: this.time });
      Object.assign(b, { pushedBy: a.id, pushedAt: this.time });
    } else if (this.mode === 'tag' && (a.id === this.it || b.id === this.it)) {
      const prey = a.id === this.it ? b : a;
      if (this.immune && this.immune.id === prey.id && this.time < this.immune.until) return;
      // in a huddle the role would hop through every ball touching the new hunter within one step
      if (this.passedAt === this.time) return;
      this.passedAt = this.time;
      this.immune = { id: this.it!, until: this.time + TAG_IMMUNE };
      this.it = prey.id;
    }
  }

  /** «Сумо»: a ball whose centre leaves the floe is out; a recent bumper gets the credit. */
  private slide(): void {
    const r = this.floe;
    for (const b of this.balls) {
      if (b.fell !== undefined || Math.hypot(b.x - ARENA.w / 2, b.y - ARENA.h / 2) <= r) continue;
      b.fell = this.time;
      b.vx = 0;
      b.vy = 0;
      // both balls of a bump remember each other, so a bumper that already fell earns nothing
      const bumper = this.balls.find((o) => o.id === b.pushedBy);
      if (bumper && bumper.fell === undefined && this.time - (b.pushedAt ?? -Infinity) <= PUSH_CREDIT) {
        this.knockouts.set(bumper.id, (this.knockouts.get(bumper.id) ?? 0) + 1);
      }
    }
  }

  /** Bots in «Сумо» go for the nearest rival but back off the edge; in «Квач» they chase or flee. */
  private steerBrawlers(dt: number): void {
    const cx = ARENA.w / 2;
    const cy = ARENA.h / 2;
    for (const b of this.balls) {
      if (!b.bot || b.fell !== undefined) continue;
      b.aim += (this.rng() - 0.5) * 6 * dt;
      const others = this.balls.filter((o) => o !== b && o.fell === undefined);
      const near = others.reduce<Ball | null>((best, o) => (!best || Math.hypot(o.x - b.x, o.y - b.y) < Math.hypot(best.x - b.x, best.y - b.y) ? o : best), null);
      let tx = cx - b.x;
      let ty = cy - b.y;
      if (this.mode === 'sumo') {
        const edge = Math.hypot(b.x - cx, b.y - cy) / this.floe;
        if (near && edge < 0.7) {
          tx = near.x - b.x;
          ty = near.y - b.y;
        }
      } else if (b.id === this.it) {
        const prey = others.filter((o) => !(this.immune?.id === o.id && this.time < this.immune.until));
        const target = prey.reduce<Ball | null>((best, o) => (!best || Math.hypot(o.x - b.x, o.y - b.y) < Math.hypot(best.x - b.x, best.y - b.y) ? o : best), null);
        if (target) {
          tx = target.x - b.x;
          ty = target.y - b.y;
        }
      } else {
        const hunter = this.balls.find((o) => o.id === this.it);
        if (hunter) {
          // run from the hunter, bent toward the middle so a bot does not pin itself in a corner
          tx = b.x - hunter.x + (cx - b.x) * 0.4;
          ty = b.y - hunter.y + (cy - b.y) * 0.4;
        }
      }
      const d = Math.hypot(tx, ty) || 1;
      b.ix = (tx / d) * BOT_DRIVE + Math.cos(b.aim) * BOT_WOBBLE * 0.6;
      b.iy = (ty / d) * BOT_DRIVE + Math.sin(b.aim) * BOT_WOBBLE * 0.6;
    }
  }

  private paint(): void {
    this.balls.forEach((b, i) => {
      const c0 = Math.max(0, Math.floor((b.x - PAINT_REACH) / PAINT_CELL_W));
      const c1 = Math.min(PAINT.cols - 1, Math.floor((b.x + PAINT_REACH) / PAINT_CELL_W));
      const r0 = Math.max(0, Math.floor((b.y - PAINT_REACH) / PAINT_CELL_H));
      const r1 = Math.min(PAINT.rows - 1, Math.floor((b.y + PAINT_REACH) / PAINT_CELL_H));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const at = r * PAINT.cols + c;
          if (this.cells[at] === i || Math.hypot((c + 0.5) * PAINT_CELL_W - b.x, (r + 0.5) * PAINT_CELL_H - b.y) > PAINT_REACH) continue;
          this.cells[at] = i;
          this.paintText = null;
        }
      }
    });
  }

  /** «Захват»: floor cells owned by each player. */
  painted(): Map<string, number> {
    const counts = new Map(this.balls.map((b) => [b.id, 0]));
    for (const owner of this.cells) {
      const b = this.balls[owner];
      if (b) counts.set(b.id, counts.get(b.id)! + 1);
    }
    return counts;
  }

  private steerPainters(dt: number): void {
    this.balls.forEach((b, i) => {
      if (!b.bot) return;
      b.aim += (this.rng() - 0.5) * 6 * dt;
      if (!b.goal || this.time >= b.goal.until || Math.hypot(b.goal.x - b.x, b.goal.y - b.y) < ARENA.ball) {
        let best: { x: number; y: number } | null = null;
        for (let k = 0; k < 8; k++) {
          const cell = Math.floor(this.rng() * this.cells.length);
          if (this.cells[cell] === i) continue;
          const x = ((cell % PAINT.cols) + 0.5) * PAINT_CELL_W;
          const y = (Math.floor(cell / PAINT.cols) + 0.5) * PAINT_CELL_H;
          if (!best || Math.hypot(x - b.x, y - b.y) < Math.hypot(best.x - b.x, best.y - b.y)) best = { x, y };
        }
        b.goal = { ...(best ?? { x: ARENA.w / 2, y: ARENA.h / 2 }), until: this.time + PAINT_RETARGET };
      }
      const dx = b.goal.x - b.x;
      const dy = b.goal.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      b.ix = (dx / d) * BOT_DRIVE + Math.cos(b.aim) * BOT_WOBBLE * 0.5;
      b.iy = (dy / d) * BOT_DRIVE + Math.sin(b.aim) * BOT_WOBBLE * 0.5;
    });
  }

  private collect(): void {
    const reach = ARENA.ball + ARENA.star;
    for (const star of [...this.field]) {
      const hit = this.balls.find((b) => Math.hypot(b.x - star.x, b.y - star.y) < reach * (star.big ? 1.25 : 1));
      if (!hit) continue;
      const value = star.big ? BIG_VALUE : 1;
      this.stars.set(hit.id, (this.stars.get(hit.id) ?? 0) + value);
      this.hits.push([hit.id, star.id, value]);
      this.field = this.field.filter((s) => s !== star);
      if (!star.big) this.spawn(false);
    }
  }

  private spawn(big: boolean): void {
    const margin = ARENA.star * 2;
    let x = 0;
    let y = 0;
    for (let tries = 0; tries < 30; tries++) {
      x = margin + this.rng() * (ARENA.w - 2 * margin);
      y = margin + this.rng() * (ARENA.h - 2 * margin);
      const clear = this.balls.every((b) => Math.hypot(b.x - x, b.y - y) > ARENA.ball * 2.5);
      if (clear) break;
    }
    this.field.push({ id: this.nextStar++, x, y, big, expires: this.time + BIG_LIFETIME });
  }

  private steerBots(dt: number): void {
    for (const b of this.balls) {
      if (!b.bot) continue;
      const target = this.field.reduce<Star | null>((best, s) => {
        const d = Math.hypot(s.x - b.x, s.y - b.y) / (s.big ? 2 : 1);
        return !best || d < Math.hypot(best.x - b.x, best.y - b.y) / (best.big ? 2 : 1) ? s : best;
      }, null);
      b.aim += (this.rng() - 0.5) * 6 * dt;
      if (!target) {
        b.ix = Math.cos(b.aim) * 0.3;
        b.iy = Math.sin(b.aim) * 0.3;
        continue;
      }
      const dx = target.x - b.x;
      const dy = target.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      b.ix = (dx / d) * BOT_DRIVE + Math.cos(b.aim) * BOT_WOBBLE;
      b.iy = (dy / d) * BOT_DRIVE + Math.sin(b.aim) * BOT_WOBBLE;
    }
  }

  /** Snapshot for the TV; drains the list of fresh hits. */
  snapshot(): ArenaSnap {
    const hits = this.hits;
    this.hits = [];
    return {
      balls: this.balls.filter((b) => b.fell === undefined).map((b) => [b.id, Math.round(b.x), Math.round(b.y)]),
      stars: this.field.map((s) => [s.id, Math.round(s.x), Math.round(s.y), s.big ? 1 : 0]),
      hits,
      floe: this.mode === 'sumo' ? Math.round(this.floe) : undefined,
      it: this.it ?? undefined,
      paint: this.mode === 'paint' ? (this.paintText ??= Array.from(this.cells, (o) => (o < 0 ? '.' : String.fromCharCode(97 + o))).join('')) : undefined,
    };
  }

  positions(): { id: string; x: number; y: number }[] {
    return this.balls.map((b) => ({ id: b.id, x: b.x, y: b.y }));
  }
}

/** A busy round yields 20-30 stars, so this keeps the arena on par with one gallery win. */
export const STAR_POINTS = 10;
