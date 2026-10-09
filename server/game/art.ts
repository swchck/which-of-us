import { INK_COLORS, PLAYER_COLORS, type Board, type Stroke } from '../../shared/protocol.js';
import { pick, type Rng } from '../util.js';

const SKIN = ['#ffd9b8', '#f2c29b', '#d9a066', '#b07a4f', '#8a5a3c', '#ffe3cc'];
const HAIR = ['#2b1b10', '#5a3420', '#c97b3a', '#f4d35e', '#1b1033', '#ff6fb5', '#6fd3ff'];

export type Mood = 'smile' | 'grin' | 'wow' | 'grumpy' | 'silly';

/** Cartoon face standing in for a missing selfie, and the "photos" bots take. */
export function faceSvg(colorIndex: number, rng: Rng, mood: Mood = 'smile'): string {
  const bg = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
  const skin = pick(SKIN, rng);
  const hair = pick(HAIR, rng);
  const eyeY = 230 + Math.round(rng() * 20);
  const eyeGap = 70 + Math.round(rng() * 20);
  const mouths: Record<Mood, string> = {
    smile: `<path d="M196 330 Q256 390 316 330" stroke="#1b1033" stroke-width="14" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M180 320 Q256 420 332 320 Z" fill="#1b1033"/><path d="M200 330 Q256 360 312 330 Z" fill="#fff"/>`,
    wow: `<ellipse cx="256" cy="345" rx="34" ry="44" fill="#1b1033"/>`,
    grumpy: `<path d="M200 360 Q256 315 312 360" stroke="#1b1033" stroke-width="14" fill="none" stroke-linecap="round"/>`,
    silly: `<path d="M196 330 Q256 380 316 330" stroke="#1b1033" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M240 350 Q256 410 276 350 Z" fill="#ff5c8a"/>`,
  };
  const brows =
    mood === 'grumpy'
      ? `<path d="M${256 - eyeGap - 30} ${eyeY - 50} L${256 - eyeGap + 30} ${eyeY - 30} M${256 + eyeGap + 30} ${eyeY - 50} L${256 + eyeGap - 30} ${eyeY - 30}" stroke="#1b1033" stroke-width="12" stroke-linecap="round"/>`
      : mood === 'wow'
        ? `<path d="M${256 - eyeGap - 28} ${eyeY - 58} Q${256 - eyeGap} ${eyeY - 78} ${256 - eyeGap + 28} ${eyeY - 58} M${256 + eyeGap - 28} ${eyeY - 58} Q${256 + eyeGap} ${eyeY - 78} ${256 + eyeGap + 28} ${eyeY - 58}" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round"/>`
        : '';
  const eyeR = mood === 'wow' ? 26 : 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<rect width="512" height="512" fill="${bg}"/>
<circle cx="256" cy="560" r="230" fill="#1b1033" opacity="0.25"/>
<ellipse cx="256" cy="270" rx="165" ry="185" fill="${skin}"/>
<path d="M95 240 Q110 70 256 75 Q402 70 417 240 Q380 150 256 150 Q132 150 95 240 Z" fill="${hair}"/>
<circle cx="${256 - eyeGap}" cy="${eyeY}" r="${eyeR}" fill="#1b1033"/>
<circle cx="${256 + eyeGap}" cy="${eyeY}" r="${eyeR}" fill="#1b1033"/>
<circle cx="${256 - eyeGap + 7}" cy="${eyeY - 7}" r="6" fill="#fff"/>
<circle cx="${256 + eyeGap + 7}" cy="${eyeY - 7}" r="6" fill="#fff"/>
${brows}
<ellipse cx="${256 - eyeGap - 25}" cy="${eyeY + 55}" rx="26" ry="14" fill="#ff7a9c" opacity="0.5"/>
<ellipse cx="${256 + eyeGap + 25}" cy="${eyeY + 55}" rx="26" ry="14" fill="#ff7a9c" opacity="0.5"/>
${mouths[mood]}
</svg>`;
}

type Doodle = (cx: number, cy: number, r: number, rng: Rng) => number[][];

function ring(cx: number, cy: number, rx: number, ry: number, from = 0, to = Math.PI * 2, steps = 28): number[] {
  const p: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    p.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  }
  return p;
}

const DOODLES: Doodle[] = [
  (cx, cy, r) => [
    ring(cx, cy, r, r),
    ring(cx - r * 0.35, cy - r * 0.2, r * 0.1, r * 0.1, 0, Math.PI * 2, 10),
    ring(cx + r * 0.35, cy - r * 0.2, r * 0.1, r * 0.1, 0, Math.PI * 2, 10),
    ring(cx, cy + r * 0.1, r * 0.5, r * 0.45, 0.2, Math.PI - 0.2, 14),
  ],
  (cx, cy, r) => {
    const rays: number[][] = [ring(cx, cy, r * 0.5, r * 0.5)];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      rays.push([cx + Math.cos(a) * r * 0.65, cy + Math.sin(a) * r * 0.65, cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return rays;
  },
  (cx, cy, r) => {
    const p: number[] = [];
    for (let i = 0; i <= 60; i++) {
      const a = i * 0.35;
      const rr = (r * i) / 60;
      p.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    return [p];
  },
  (cx, cy, r) => {
    const p: number[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? r : r * 0.42;
      p.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    return [p];
  },
  (cx, cy, r, rng) => {
    const p: number[] = [];
    for (let i = 0; i <= 8; i++) p.push(cx - r + (i * r) / 4, cy + (i % 2 === 0 ? -r : r) * (0.3 + rng() * 0.3));
    return [p];
  },
  (cx, cy, r) => [
    [cx - r, cy + r, cx - r, cy - r * 0.2, cx, cy - r, cx + r, cy - r * 0.2, cx + r, cy + r, cx - r, cy + r],
    [cx - r * 0.25, cy + r, cx - r * 0.25, cy + r * 0.3, cx + r * 0.25, cy + r * 0.3, cx + r * 0.25, cy + r],
  ],
  (cx, cy, r) => [
    ring(cx, cy, r, r * 0.55),
    [cx + r, cy, cx + r * 1.4, cy - r * 0.4, cx + r * 1.4, cy + r * 0.4, cx + r, cy],
    ring(cx - r * 0.55, cy - r * 0.1, r * 0.08, r * 0.08, 0, Math.PI * 2, 8),
  ],
];

/** Random recognisable scribble for bots, kept inside the band [top, bottom). */
export function doodle(board: Board, rng: Rng, top = 0, bottom = board.h): Stroke[] {
  const strokes: Stroke[] = [];
  const count = 1 + Math.floor(rng() * 3);
  const height = bottom - top;
  for (let i = 0; i < count; i++) {
    const r = Math.min(board.w, height) * (0.12 + rng() * 0.18);
    const cx = r + rng() * (board.w - 2 * r);
    const cy = top + r + rng() * Math.max(1, height - 2 * r);
    const color = pick(INK_COLORS.filter((c) => c !== '#ffffff'), rng);
    const w = pick([6, 12, 22], rng);
    for (const p of pick(DOODLES, rng)(cx, cy, r, rng)) {
      strokes.push({ c: color, w, p: p.map((v, j) => Math.round(Math.max(0, Math.min(j % 2 ? board.h : board.w, v)))) });
    }
  }
  return strokes;
}
