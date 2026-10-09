<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(316);
const f1 = (n: number) => n.toFixed(1);

// moves a path made only of absolute M/L/Q/C/Z commands, so many small props merge into one node
function place(d: string, x: number, y: number, a = 0, k = 1): string {
  const c = Math.cos((a * Math.PI) / 180) * k;
  const sn = Math.sin((a * Math.PI) / 180) * k;
  return d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, px: string, py: string) => `${f1(x + +px * c - +py * sn)} ${f1(y + +px * sn + +py * c)}`);
}
const circ = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;
const STARS = Array.from({ length: 56 }, () => ({ x: rnd() * 1920, y: rnd() * 320, r: 1 + rnd() * 2.2 }));
const STAR_PATHS = [0, 1].map((g) => STARS.filter((_, i) => i % 2 === g).map((s) => circ(s.x, s.y, s.r)).join(' '));
const SPARKLE = 'M0 -18 Q3 -3 18 0 Q3 3 0 18 Q-3 3 -18 0 Q-3 -3 0 -18 Z';
const SPARKLES = [
  [640, 120, 1],
  [1180, 70, 0.7],
  [1840, 160, 0.9],
  [90, 470, 0.6],
]
  .map(([x, y, k]) => place(SPARKLE, x!, y!, 0, k))
  .join(' ');

const arch = (cx: number, y: number, hw: number, hh: number) => `M${f1(cx - hw)} ${f1(y)} Q${f1(cx)} ${f1(y - hh * 2)} ${f1(cx + hw)} ${f1(y)} Q${f1(cx)} ${f1(y - hh * 0.8)} ${f1(cx - hw)} ${f1(y)} Z`;

type Face = 'happy' | 'grin' | 'wink';
// carved holes as one path, so the static carving and its glow overlay share the same shape
function face(w: number, h: number, style: Face): string {
  if (style === 'happy') {
    return [
      arch(-w * 0.3, -h * 0.08, w * 0.17, h * 0.2),
      arch(w * 0.3, -h * 0.08, w * 0.17, h * 0.2),
      `M${f1(-w * 0.5)} ${f1(h * 0.12)} Q0 ${f1(h * 0.9)} ${f1(w * 0.5)} ${f1(h * 0.12)} Q0 ${f1(h * 0.42)} ${f1(-w * 0.5)} ${f1(h * 0.12)} Z`,
    ].join(' ');
  }
  if (style === 'grin') {
    const eye = (cx: number) => `M${f1(cx - w * 0.16)} ${f1(-h * 0.02)} L${f1(cx)} ${f1(-h * 0.42)} L${f1(cx + w * 0.16)} ${f1(-h * 0.02)} Z`;
    return [
      eye(-w * 0.3),
      eye(w * 0.3),
      `M${f1(-w * 0.07)} ${f1(h * 0.16)} L0 ${f1(h * 0.04)} L${f1(w * 0.07)} ${f1(h * 0.16)} Z`,
      `M${f1(-w * 0.56)} ${f1(h * 0.22)} Q0 ${f1(h * 0.95)} ${f1(w * 0.56)} ${f1(h * 0.22)} L${f1(w * 0.36)} ${f1(h * 0.32)} L${f1(w * 0.2)} ${f1(h * 0.24)} L0 ${f1(h * 0.36)} L${f1(-w * 0.2)} ${f1(h * 0.24)} L${f1(-w * 0.36)} ${f1(h * 0.32)} Z`,
    ].join(' ');
  }
  return [
    circ(-w * 0.3, -h * 0.18, w * 0.13),
    arch(w * 0.3, -h * 0.1, w * 0.16, h * 0.16),
    `M${f1(-w * 0.42)} ${f1(h * 0.2)} Q0 ${f1(h * 0.8)} ${f1(w * 0.42)} ${f1(h * 0.2)} Q0 ${f1(h * 0.42)} ${f1(-w * 0.42)} ${f1(h * 0.2)} Z`,
  ].join(' ');
}

type Kind = 'orange' | 'cream' | 'teal';
interface PumpkinSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: Kind;
  look?: Face;
  flip?: number;
}
const build = (p: PumpkinSpec) => ({
  ...p,
  kind: p.kind ?? 'orange',
  flip: p.flip ?? 1,
  sw: p.w > 80 ? 6 : p.w > 36 ? 5 : 4,
  face: p.look ? face(p.w, p.h, p.look) : '',
  ribs: `M${f1(-p.w * 0.17)} ${f1(-p.h * 0.82)} Q${f1(-p.w * 0.3)} 0 ${f1(-p.w * 0.17)} ${f1(p.h * 0.84)} M${f1(p.w * 0.17)} ${f1(-p.h * 0.82)} Q${f1(p.w * 0.3)} 0 ${f1(p.w * 0.17)} ${f1(p.h * 0.84)}`,
  glint: `M${f1(-p.w * 0.66)} ${f1(-p.h * 0.2)} Q${f1(-p.w * 0.66)} ${f1(-p.h * 0.6)} ${f1(-p.w * 0.42)} ${f1(-p.h * 0.78)}`,
  stem: `M0 ${f1(-p.h * 0.86)} Q${f1(p.w * 0.04)} ${f1(-p.h - p.w * 0.3)} ${f1(p.w * 0.2)} ${f1(-p.h - p.w * 0.4)}`,
  curl: `M${f1(p.w * 0.06)} ${f1(-p.h - p.w * 0.12)} q${f1(p.w * 0.3)} ${f1(-p.w * 0.12)} ${f1(p.w * 0.28)} ${f1(p.w * 0.1)} q${f1(-p.w * 0.04)} ${f1(p.w * 0.16)} ${f1(-p.w * 0.16)} ${f1(p.w * 0.06)}`,
});
const SKINS: Record<Kind, { side: string; rib: string }> = {
  orange: { side: '#c84a1a', rib: '#a83a14' },
  cream: { side: '#d8bca4', rib: '#a88a78' },
  teal: { side: '#2f8a84', rib: '#1f5a5a' },
};

const FIELD = [
  { x: 640, y: 812, w: 22, h: 17 },
  { x: 1090, y: 818, w: 20, h: 15, kind: 'cream' as Kind },
  { x: 1230, y: 806, w: 26, h: 20, look: 'happy' as Face },
  { x: 770, y: 822, w: 18, h: 14, kind: 'teal' as Kind, flip: -1 },
  { x: 590, y: 868, w: 50, h: 38, look: 'happy' as Face },
  { x: 735, y: 878, w: 34, h: 26, kind: 'cream' as Kind, flip: -1 },
  { x: 880, y: 862, w: 44, h: 34, look: 'grin' as Face },
  { x: 1040, y: 872, w: 34, h: 26, kind: 'teal' as Kind },
  { x: 1190, y: 870, w: 52, h: 40, look: 'wink' as Face, flip: -1 },
].map(build);
// grouped by neighbourhood, not round-robin: a group's repaint rect is the union of its members
const FIELD_GLOW = [[590], [880], [1190, 1230]].map((xs) => FIELD.filter((p) => p.face && xs.includes(p.x)));

const FRONT = [
  { x: 250, y: 1000, w: 140, h: 104, look: 'grin' as Face },
  { x: 1840, y: 1046, w: 96, h: 70, kind: 'cream' as Kind, flip: -1 },
  { x: 1630, y: 1012, w: 92, h: 70, look: 'happy' as Face },
  { x: 1500, y: 1052, w: 44, h: 34, kind: 'teal' as Kind },
  { x: 470, y: 1040, w: 48, h: 36, flip: -1 },
].map(build);
const FRONT_GLOW = FRONT.filter((p) => p.face).map((p) => [p]);
const BUCKET = FRONT[2]!;

const LEAF = 'M0 0 Q-26 -8 -30 -30 Q-16 -26 -10 -40 Q0 -56 10 -40 Q16 -26 30 -30 Q26 -8 0 0 Z';
const LEAF_RIB = 'M0 -2 L0 -40 M0 -14 L-18 -26 M0 -14 L18 -26';
const LEAVES = [
  { x: 520, y: 880, a: -40, k: 1 },
  { x: 680, y: 884, a: 30, k: 0.8 },
  { x: 960, y: 880, a: -10, k: 1.1 },
  { x: 1120, y: 884, a: 40, k: 0.9 },
  { x: 820, y: 828, a: -20, k: 0.6 },
  { x: 1290, y: 880, a: -30, k: 0.9 },
  { x: 380, y: 1010, a: -30, k: 1.4 },
  { x: 560, y: 1060, a: 25, k: 1.3 },
  { x: 1400, y: 1040, a: -20, k: 1.4 },
];
const FENCE_LEAVES = [
  { x: 1414, y: 850, a: 20, k: 0.8 },
  { x: 1660, y: 828, a: -30, k: 0.8 },
  { x: 1850, y: 868, a: 15, k: 0.8 },
];
type LeafSpot = { x: number; y: number; a: number; k: number };
const leaves = (spots: LeafSpot[]) => ({
  fill: spots.map((l) => place(LEAF, l.x, l.y, l.a, l.k)).join(' '),
  ribs: spots.map((l) => place(LEAF_RIB, l.x, l.y, l.a, l.k)).join(' '),
});
const FIELD_LEAVES = leaves(LEAVES);
const FENCE_LEAF = leaves(FENCE_LEAVES);
// wavy vine with a little curl at every other bend, as one path per row
function vine(x0: number, x1: number, y: number, amp: number): string {
  let d = `M${x0} ${y}`;
  for (let x = x0, i = 0; x < x1; x += 130, i++) {
    const dy = i % 2 ? amp : -amp;
    d += ` Q${x + 65} ${y + dy} ${x + 130} ${y}`;
    if (i % 2 === 0) d += ` q10 -22 30 -12 q10 10 -4 16 q-12 2 -8 -8 M${x + 130} ${y}`;
  }
  return d;
}
const CORNER_LEAVES = [
  { x: 10, y: 1140, a: 20, k: 5 },
  { x: -40, y: 1060, a: 60, k: 4 },
  { x: 1930, y: 1140, a: -25, k: 5 },
  { x: 1980, y: 1050, a: -60, k: 3.6 },
]
  .map((l) => place(LEAF, l.x, l.y, l.a, l.k))
  .join(' ');
const VINES = vine(430, 1330, 884, 12) + ' ' + vine(-60, 700, 1050, 16) + ' ' + vine(1300, 1980, 1060, 14);

const FENCE = Array.from({ length: 12 }, (_, i) => ({ x: 1340 + i * 58, r: Math.round((rnd() - 0.5) * 14), h: 104 + Math.round(rnd() * 22) }));
const FENCE_POSTS = FENCE.map((f) => place(`M-15 0 L-15 ${-f.h} L0 ${-f.h - 20} L15 ${-f.h} L15 0 Z`, f.x, 910, f.r)).join(' ');
const FENCE_GRAIN = FENCE.map((f) => place(`M-6 -10 L-6 ${-f.h + 6}`, f.x, 910, f.r)).join(' ');

const quad = (a: number, c: number, b: number, t: number) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * c + t * t * b;
const STRING = { x0: 1488, y0: 480, cx: 1330, cy: 700, x1: 1184, y1: 600 };
const LANTERN_COLORS = ['#ff8a2a', '#3fc0b0', '#a66bff'];
const LANTERNS = [0.14, 0.3, 0.47, 0.64, 0.82].map((t, i) => ({
  x: quad(STRING.x0, STRING.cx, STRING.x1, t),
  y: quad(STRING.y0, STRING.cy, STRING.y1, t),
  c: i % 3,
}));
const lanterns = (d: string, only?: number) =>
  LANTERNS.filter((l) => only === undefined || l.c === only)
    .map((l) => place(d, l.x, l.y))
    .join(' ');
const LANTERN_PARTS = {
  bodies: LANTERN_COLORS.map((c, i) => ({ c, d: lanterns('M-15 30 C-15 6 15 6 15 30 C15 54 -15 54 -15 30 Z', i) })),
  caps: lanterns('M-7 8 L7 8 L7 14 L-7 14 Z M-6 46 L6 46 L6 51 L-6 51 Z'),
  hooks: lanterns('M0 0 L0 8'),
  ribs: lanterns('M-6 14 Q-12 30 -6 46 M6 14 Q12 30 6 46'),
  glints: lanterns('M-9 22 Q-10 30 -8 36'),
  cores: lanterns('M-6 32 C-6 20 6 20 6 32 C6 44 -6 44 -6 32 Z'),
};

const CANDY_SPOTS = [
  { x: 1440, y: 990, a: -20 },
  { x: 1555, y: 1068, a: 30 },
  { x: 1720, y: 1072, a: -50 },
  { x: 400, y: 1072, a: 15 },
  { x: 560, y: 990, a: -35 },
  { x: 1612, y: 932, a: -10 },
  { x: 1650, y: 928, a: 25 },
];
const candy = (d: string) => CANDY_SPOTS.map((c) => place(d, c.x, c.y, c.a, 1.2)).join(' ');
const CANDY = {
  base: candy('M-12 10 Q0 14 12 10 L2 -18 Q0 -21 -2 -18 Z'),
  mid: candy('M-8.2 0 Q0 2 8.2 0 L2 -18 Q0 -21 -2 -18 Z'),
  tip: candy('M-4.4 -9 L4.4 -9 L2 -18 Q0 -21 -2 -18 Z'),
};

const swarm = (cx: number, cy: number) => Array.from({ length: 7 }, () => ({ x: cx + (rnd() - 0.5) * 300, y: cy + (rnd() - 0.5) * 140 }));
const FLY_GROUPS = [swarm(980, 700), swarm(260, 760)].map((g) => ({
  halo: g.map((f) => circ(f.x, f.y, 11)).join(' '),
  core: g.map((f) => circ(f.x, f.y, 4)).join(' '),
}));

const BATS = [
  { x: 0, y: 0, k: 1 },
  { x: 90, y: -40, k: 0.8 },
  { x: 160, y: 20, k: 0.9 },
  { x: 250, y: -20, k: 0.7 },
];
const FAR_TREES = [
  { x: 520, y: 668, k: 0.8 },
  { x: 900, y: 628, k: 1 },
  { x: 1000, y: 618, k: 0.7 },
  { x: 1300, y: 640, k: 0.9 },
];
const FAR_DOTS = [380, 440, 700, 760, 1120, 1180, 1400].map((x, i) => circ(x, 680 + ((i * 23) % 30), 9)).join(' ');
const SMOKE_PUFF = [circ(1740, 278, 14), circ(1758, 272, 12), circ(1750, 262, 11)].join(' ');
const PLANKS = [-150, -120, -90, -60, -30].map((y) => `M-112 ${y} L114 ${y - 6}`).join(' ');
</script>

<template>
  <g>
    <defs>
      <linearGradient id="pumpkin-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="760">
        <stop offset="0%" stop-color="#160a36" />
        <stop offset="38%" stop-color="#2f1762" />
        <stop offset="66%" stop-color="#6a2a88" />
        <stop offset="85%" stop-color="#c4508a" />
        <stop offset="100%" stop-color="#ff9a4a" />
      </linearGradient>
      <radialGradient id="pumpkin-moon" cx="38%" cy="34%" r="72%">
        <stop offset="0%" stop-color="#fffbe6" />
        <stop offset="100%" stop-color="#ffd98a" />
      </radialGradient>
      <linearGradient id="pumpkin-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b47ab8" />
        <stop offset="60%" stop-color="#8a5aa4" />
      </linearGradient>
      <linearGradient id="pumpkin-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffa070" stop-opacity="0" />
        <stop offset="55%" stop-color="#ffa070" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ffa070" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="pumpkin-hill" gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="860">
        <stop offset="0%" stop-color="#6e4aa8" />
        <stop offset="100%" stop-color="#3a2468" />
      </linearGradient>
      <linearGradient id="pumpkin-soil" gradientUnits="userSpaceOnUse" x1="0" y1="780" x2="0" y2="1000">
        <stop offset="0%" stop-color="#3a8a7a" />
        <stop offset="100%" stop-color="#1c4a52" />
      </linearGradient>
      <linearGradient id="pumpkin-front" gradientUnits="userSpaceOnUse" x1="0" y1="930" x2="0" y2="1140">
        <stop offset="0%" stop-color="#2a5a62" />
        <stop offset="100%" stop-color="#12283a" />
      </linearGradient>
      <radialGradient id="pumpkin-orange" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffc46a" />
        <stop offset="50%" stop-color="#ff8a24" />
        <stop offset="100%" stop-color="#d4501a" />
      </radialGradient>
      <radialGradient id="pumpkin-cream" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#fffaf0" />
        <stop offset="100%" stop-color="#e2c8b0" />
      </radialGradient>
      <radialGradient id="pumpkin-teal" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#a8f0dc" />
        <stop offset="100%" stop-color="#3a9a90" />
      </radialGradient>
      <radialGradient id="pumpkin-halo">
        <stop offset="0%" stop-color="#ffe27a" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#ffe27a" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="pumpkin-wall" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5cc8bc" />
        <stop offset="100%" stop-color="#22707a" />
      </linearGradient>
      <linearGradient id="pumpkin-roof" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#b072e8" />
        <stop offset="100%" stop-color="#4a2282" />
      </linearGradient>
      <linearGradient id="pumpkin-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c88a58" />
        <stop offset="100%" stop-color="#7a4430" />
      </linearGradient>
      <radialGradient id="pumpkin-ghost" cx="35%" cy="28%" r="85%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#d8ccff" />
      </radialGradient>
      <radialGradient id="pumpkin-sack" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffe2a8" />
        <stop offset="100%" stop-color="#c8964e" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#pumpkin-sky)" />
    <path v-for="(d, gi) in STAR_PATHS" :key="`st${gi}`" :d="d" fill="#fff6dc" class="twinkle" :style="{ animationDelay: `-${gi * 1.5}s` }" />
    <path :d="SPARKLES" fill="#ffe9a8" />

    <circle cx="300" cy="230" r="270" fill="#ffe6a8" opacity="0.07" />
    <circle cx="300" cy="230" r="200" fill="#ffe6a8" opacity="0.12" />
    <circle cx="300" cy="230" r="150" fill="url(#pumpkin-moon)" stroke="#1b1033" stroke-width="5" />
    <circle cx="372" cy="170" r="22" fill="#f2c878" opacity="0.6" />
    <circle cx="214" cy="300" r="16" fill="#f2c878" opacity="0.6" />
    <circle cx="390" cy="316" r="12" fill="#f2c878" opacity="0.6" />
    <path d="M196 150 Q222 110 270 98" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8" />
    <g stroke="#7a4a3a" stroke-width="6" fill="none" stroke-linecap="round">
      <path d="M232 224 Q248 238 264 224 M318 224 Q334 238 350 224" />
      <path d="M270 266 Q292 284 314 266" />
    </g>
    <ellipse cx="236" cy="256" rx="16" ry="9" fill="#ff9a8a" opacity="0.55" />
    <ellipse cx="350" cy="256" rx="16" ry="9" fill="#ff9a8a" opacity="0.55" />
    <path d="M60 360 H260 M150 392 H420 M1560 250 H1800 M1640 282 H1940" stroke="#a46ad0" stroke-width="16" stroke-linecap="round" opacity="0.45" />
    <path d="M70 352 H220 M1580 242 H1720" stroke="#e0b0f0" stroke-width="5" stroke-linecap="round" opacity="0.4" />

    <g class="pumpkin-witch">
      <g transform="rotate(-8) scale(0.95)" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
        <path d="M-80 8 L96 -6" stroke-width="11" />
        <path d="M-80 8 L96 -6" stroke="#b07a48" stroke-width="5" />
        <path d="M-76 8 L-138 -14 L-150 10 L-136 32 Z" fill="#ffd36b" stroke-width="4" />
        <path d="M-90 2 L-140 -4 M-92 12 L-144 16" stroke="#c8963a" stroke-width="3" fill="none" />
        <path d="M-80 -2 L-76 16" stroke="#a66bff" stroke-width="7" />
        <path d="M-62 -2 Q-80 -40 -60 -44" fill="none" stroke-width="4" />
        <ellipse cx="-52" cy="-10" rx="12" ry="14" fill="#3a2468" stroke-width="3" />
        <circle cx="-48" cy="-30" r="10" fill="#3a2468" stroke-width="3" />
        <path d="M-56 -36 L-58 -48 L-50 -40 M-42 -38 L-38 -48 L-36 -36" fill="#3a2468" stroke-width="3" />
        <circle cx="-51" cy="-31" r="2.5" fill="#7cffb0" stroke="none" />
        <circle cx="-43" cy="-31" r="2.5" fill="#7cffb0" stroke="none" />
        <path d="M0 -44 Q-36 -34 -64 -16 Q-36 -10 -14 0 Z" fill="#a66bff" stroke-width="4" />
        <path d="M-12 -50 L20 -50 L32 2 L-20 2 Z" fill="#6a3aa8" stroke-width="4" />
        <path d="M24 0 L44 18" stroke-width="11" />
        <path d="M24 0 L44 18" stroke="#ff8a2a" stroke-width="6" stroke-dasharray="5 5" stroke-linecap="butt" />
        <path d="M40 14 L56 16 L52 24 L40 22 Z" fill="#3a2468" stroke-width="3" />
        <path d="M10 -40 L36 -8" stroke-width="9" />
        <path d="M10 -40 L36 -8" stroke="#6a3aa8" stroke-width="4" />
        <path d="M-6 -60 Q-26 -50 -30 -36 M-4 -54 Q-20 -40 -18 -28" stroke="#ff8a2a" stroke-width="5" fill="none" />
        <circle cx="6" cy="-62" r="13" fill="#a8f0a0" stroke-width="4" />
        <path d="M18 -62 Q26 -60 19 -56" fill="#a8f0a0" stroke-width="3" />
        <circle cx="10" cy="-65" r="2.5" fill="#1b1033" stroke="none" />
        <path d="M4 -56 Q10 -52 14 -56" fill="none" stroke-width="2.5" />
        <path d="M-14 -74 L24 -76 Q12 -102 -20 -118 Q-4 -98 -14 -74 Z" fill="#4a2282" stroke-width="4" />
        <ellipse cx="4" cy="-74" rx="28" ry="6" fill="#4a2282" stroke-width="4" />
        <path d="M-12 -80 L22 -82" stroke="#ff8a2a" stroke-width="5" />
      </g>
    </g>

    <g class="pumpkin-bats">
      <g v-for="(b, i) in BATS" :key="`bt${i}`" :transform="`translate(${b.x} ${150 + b.y}) scale(${b.k})`" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
        <g class="pumpkin-wing">
          <path d="M-8 0 Q-28 -32 -60 -28 Q-50 -18 -52 -8 Q-40 -14 -34 -4 Q-24 -10 -8 4 Z M8 0 Q28 -32 60 -28 Q50 -18 52 -8 Q40 -14 34 -4 Q24 -10 8 4 Z" fill="#5a3290" />
        </g>
        <g class="pumpkin-wing late">
          <path d="M-8 0 Q-30 10 -58 24 Q-46 22 -42 14 Q-36 20 -28 12 Q-20 16 -8 6 Z M8 0 Q30 10 58 24 Q46 22 42 14 Q36 20 28 12 Q20 16 8 6 Z" fill="#5a3290" />
        </g>
        <path d="M-10 -8 L-12 -22 L-3 -12 Z M10 -8 L12 -22 L3 -12 Z" fill="#3a2060" />
        <circle r="12" fill="#3a2060" />
        <path d="M-6.6 -2 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 Z M1.4 -2 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 Z" fill="#fff" stroke="none" />
      </g>
    </g>

    <path d="M-60 700 Q200 600 420 650 Q640 700 860 640 Q1100 580 1320 640 Q1560 700 1760 620 Q1880 590 1980 610 L1980 1140 L-60 1140 Z" fill="url(#pumpkin-far)" stroke="#c88ac4" stroke-width="3" stroke-linejoin="round" />
    <g v-for="(t, i) in FAR_TREES" :key="`ft${i}`" :transform="`translate(${t.x} ${t.y}) scale(${t.k})`" stroke="#c88ac4" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M0 10 Q4 -40 -6 -80 M-2 -50 Q-30 -60 -34 -84 q-2 -16 12 -14 M2 -66 Q26 -76 30 -100 q2 -14 -12 -10" stroke="#6e4a96" stroke-width="7" />
    </g>
    <path :d="FAR_DOTS" fill="#ff9a5a" stroke="#c86a6a" stroke-width="2" />
    <rect x="-60" y="560" width="2040" height="220" fill="url(#pumpkin-haze)" />

    <path d="M-60 640 Q150 590 330 650 Q560 730 860 770 Q1150 760 1400 680 Q1620 604 1800 618 Q1920 628 1980 646 L1980 1140 L-60 1140 Z" fill="url(#pumpkin-hill)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M60 662 L120 650 M380 690 L440 706 M1460 670 L1520 656 M1840 640 L1900 646" stroke="#9a78d0" stroke-width="4" stroke-linecap="round" opacity="0.5" />
    <path :d="tufts(20, 646, 560, 0.02)" stroke="#8a64c0" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />

    <g stroke-linecap="round" fill="none">
      <path d="M150 670 Q164 560 142 470 Q126 400 172 340 M144 480 Q96 452 74 404 q-10 -30 14 -36 q22 -2 14 20 M160 410 Q222 384 250 334 q14 -30 -10 -36 q-20 -2 -12 18 M170 342 Q182 292 152 262 q-22 -24 4 -36" stroke="#1b1033" stroke-width="30" />
      <path d="M150 670 Q164 560 142 470 Q126 400 172 340 M144 480 Q96 452 74 404 q-10 -30 14 -36 q22 -2 14 20 M160 410 Q222 384 250 334 q14 -30 -10 -36 q-20 -2 -12 18 M170 342 Q182 292 152 262 q-22 -24 4 -36" stroke="#4a2c72" stroke-width="20" />
      <path d="M144 650 Q156 560 134 476" stroke="#7a58a8" stroke-width="5" opacity="0.7" />
      <path d="M152 600 q8 -6 4 -14 M140 530 q-8 -4 -4 -12" stroke="#2a1850" stroke-width="3" />
    </g>
    <ellipse cx="150" cy="672" rx="70" ry="10" fill="#1b1033" opacity="0.3" />
    <g transform="translate(1640 640)">
      <ellipse cx="0" cy="4" rx="170" ry="16" fill="#1b1033" opacity="0.35" />
      <path d="M90 -240 L86 -340 L130 -344 L134 -240 Z" fill="#d8603a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M90 -320 H130 M88 -296 H132" stroke="#8a2a1a" stroke-width="3" opacity="0.6" />
      <rect x="80" y="-356" width="58" height="16" rx="4" fill="#d8603a" stroke="#1b1033" stroke-width="4" transform="rotate(-4 109 -348)" />
      <path d="M-122 2 L-108 -176 L100 -186 L120 2 Z" fill="url(#pumpkin-wall)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
      <path :d="PLANKS" stroke="#185060" stroke-width="3" opacity="0.5" />
      <path d="M-100 -168 L-112 -10" stroke="#a8f0e4" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      <path d="M-20 2 L-22 -82 Q2 -116 28 -84 L30 2 Z" fill="#9a4a2a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-8 -6 V-90 M6 -4 V-98 M18 -6 V-90" stroke="#6a2a1a" stroke-width="3" opacity="0.6" />
      <circle cx="18" cy="-42" r="4" fill="#ffd23f" stroke="#1b1033" stroke-width="2" />
      <path d="M-92 -96 V-136 Q-70 -160 -48 -136 V-96 Z" fill="#ffc23a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-70 -150 V-96 M-92 -118 H-48" stroke="#1b1033" stroke-width="4" />
      <path d="M-88 -132 Q-84 -142 -76 -146" stroke="#fff6c0" stroke-width="4" fill="none" stroke-linecap="round" />
      <g transform="rotate(-6 70 -120)">
        <rect x="46" y="-146" width="50" height="50" rx="4" fill="#ffc23a" stroke="#1b1033" stroke-width="5" />
        <path d="M71 -146 V-96 M46 -121 H96" stroke="#1b1033" stroke-width="4" />
        <rect x="40" y="-98" width="62" height="10" rx="3" fill="#9a4a2a" stroke="#1b1033" stroke-width="3" />
      </g>
      <circle cx="-71" cy="-118" r="44" fill="url(#pumpkin-halo)" />
      <circle cx="71" cy="-121" r="44" fill="url(#pumpkin-halo)" />
      <path d="M-166 -156 Q-70 -252 0 -330 Q30 -382 70 -392 Q102 -394 106 -370 Q82 -378 72 -352 Q92 -262 176 -164 Q20 -194 -166 -156 Z" fill="url(#pumpkin-roof)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-120 -186 Q-110 -176 -96 -184 Q-84 -174 -70 -184 M-70 -232 Q-58 -222 -44 -230 Q-30 -220 -16 -230 M-30 -280 Q-18 -270 -4 -278 M86 -232 Q100 -222 112 -232 M120 -192 Q134 -182 146 -190 M60 -290 Q72 -280 84 -290" stroke="#3a1a6a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
      <path d="M-130 -168 Q-60 -240 -8 -310" stroke="#d8a8ff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      <circle cx="20" cy="-244" r="20" fill="#ffc23a" stroke="#1b1033" stroke-width="5" />
      <path d="M20 -264 V-224 M0 -244 H40" stroke="#1b1033" stroke-width="3" />
      <g fill="#9a7ac0" stroke="#1b1033" stroke-width="3"><ellipse cx="-20" cy="22" rx="20" ry="7" /><ellipse cx="-62" cy="44" rx="22" ry="8" /><ellipse cx="-112" cy="66" rx="24" ry="8" /><ellipse cx="-160" cy="92" rx="26" ry="9" /></g>
    </g>
    <path d="M1180 752 L1186 586" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
    <path d="M1180 752 L1186 586" stroke="#a0643c" stroke-width="7" stroke-linecap="round" />
    <ellipse cx="1180" cy="752" rx="24" ry="6" fill="#1b1033" opacity="0.3" />
    <path :d="`M${STRING.x0} ${STRING.y0} Q${STRING.cx} ${STRING.cy} ${STRING.x1} ${STRING.y1}`" stroke="#1b1033" stroke-width="3" fill="none" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <path :d="LANTERN_PARTS.hooks" stroke-width="3" />
      <path v-for="b in LANTERN_PARTS.bodies" :key="b.c" :d="b.d" :fill="b.c" stroke-width="4" />
      <path :d="LANTERN_PARTS.ribs" stroke-width="2" fill="none" opacity="0.5" />
      <path :d="LANTERN_PARTS.caps" fill="#3a2468" stroke-width="3" />
      <path :d="LANTERN_PARTS.glints" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7" />
    </g>
    <g class="pumpkin-glow" style="animation-delay: -0.8s">
      <circle v-for="(l, i) in LANTERNS" :key="`lg${i}`" :cx="f1(l.x)" :cy="f1(l.y + 30)" r="34" fill="url(#pumpkin-halo)" />
      <path :d="LANTERN_PARTS.cores" fill="#fff6c0" opacity="0.85" />
    </g>

    <path v-for="i in 2" :key="`sm${i}`" :d="SMOKE_PUFF" fill="#dcc4f4" class="smoke" :style="{ animationDelay: `-${i * 3}s` }" />

    <g transform="translate(1330 420)">
      <ellipse cx="0" cy="260" rx="60" ry="10" fill="#1b1033" opacity="0.18" />
      <g class="pumpkin-ghost">
        <path d="M0 -84 C58 -84 76 -36 76 18 L76 76 Q64 92 52 78 Q38 94 26 78 Q12 94 0 78 Q-12 94 -26 78 Q-38 94 -52 78 Q-64 92 -76 76 L-76 18 C-76 -36 -58 -84 0 -84 Z" fill="url(#pumpkin-ghost)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M60 -10 Q66 30 64 70" stroke="#b8a8e8" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.6" />
        <path d="M-50 -54 Q-38 -72 -14 -76" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" />
        <path d="M-74 6 Q-104 -10 -100 -40 Q-84 -30 -72 -16" fill="#f4f0ff" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M74 18 Q100 30 104 10 Q90 8 76 0" fill="#ece6ff" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <ellipse cx="-24" cy="-18" rx="11" ry="15" fill="#1b1033" />
        <ellipse cx="24" cy="-18" rx="11" ry="15" fill="#1b1033" />
        <circle cx="-27" cy="-24" r="4" fill="#fff" />
        <circle cx="21" cy="-24" r="4" fill="#fff" />
        <ellipse cx="-44" cy="6" rx="12" ry="7" fill="#ff9ac0" opacity="0.7" />
        <ellipse cx="44" cy="6" rx="12" ry="7" fill="#ff9ac0" opacity="0.7" />
        <path d="M-14 8 Q0 30 14 8 Z" fill="#6a2a4a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-6 18 Q0 24 6 18" fill="#ff7a9a" />
      </g>
    </g>

    <path d="M-60 806 Q400 776 900 800 Q1400 826 1980 790 L1980 1140 L-60 1140 Z" fill="url(#pumpkin-soil)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M-60 850 Q900 826 1980 840 M-60 900 Q900 880 1980 900 M300 950 Q900 930 1500 950" stroke="#163a44" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.45" />
    <path :d="tufts(30, 798, 1900, 0.014)" stroke="#6ac0a4" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />

    <path :d="VINES" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path :d="VINES" stroke="#3a9a4a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path :d="FIELD_LEAVES.fill" fill="#3aa86a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
    <path :d="FIELD_LEAVES.ribs" stroke="#8ae0a0" stroke-width="2.5" fill="none" stroke-linecap="round" />

    <g v-for="(p, i) in FIELD" :key="`fp${i}`" :transform="`translate(${p.x} ${p.y})`">
      <ellipse :cy="p.h * 0.86" :rx="p.w * 1.15" :ry="p.h * 0.2" fill="#0a1a20" opacity="0.35" />
      <g :transform="`scale(${p.flip} 1)`">
        <g stroke="#1b1033" :stroke-width="p.sw" :filter="p.w > 40 ? 'url(#cel-s)' : undefined">
          <ellipse :cx="-p.w * 0.42" :rx="p.w * 0.58" :ry="p.h * 0.94" :fill="SKINS[p.kind].side" />
          <ellipse :cx="p.w * 0.42" :rx="p.w * 0.58" :ry="p.h * 0.94" :fill="SKINS[p.kind].side" />
          <ellipse :rx="p.w * 0.5" :ry="p.h" :fill="`url(#pumpkin-${p.kind})`" />
        </g>
        <path :d="p.ribs" :stroke="SKINS[p.kind].rib" stroke-width="3" fill="none" opacity="0.4" />
        <path :d="p.glint" stroke="#fff" :stroke-width="p.w * 0.08" fill="none" stroke-linecap="round" opacity="0.55" />
        <path :d="p.stem" stroke="#1b1033" :stroke-width="p.w * 0.22 + 5" fill="none" stroke-linecap="round" />
        <path :d="p.stem" stroke="#6a8a2a" :stroke-width="p.w * 0.22" fill="none" stroke-linecap="round" />
        <path :d="p.curl" stroke="#3a9a4a" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
      <path v-if="p.face" :d="p.face" fill="#ffb52e" stroke="#7a2a10" stroke-width="3" stroke-linejoin="round" />
    </g>
    <g v-for="(g, gi) in FIELD_GLOW" :key="`fg${gi}`" class="pumpkin-glow" :style="{ animationDelay: `-${gi * 0.6}s` }">
      <g v-for="(p, i) in g" :key="i" :transform="`translate(${p.x} ${p.y})`">
        <ellipse :cy="p.h * 0.1" :rx="p.w * 1.5" :ry="p.h * 1.4" fill="url(#pumpkin-halo)" />
        <path :d="p.face" fill="#fff4b0" />
      </g>
    </g>

    <g transform="translate(450 880)">
      <ellipse cx="0" cy="4" rx="110" ry="14" fill="#0a1a20" opacity="0.35" />
      <rect x="-9" y="-330" width="18" height="334" rx="4" fill="url(#pumpkin-wood)" stroke="#1b1033" stroke-width="4" />
      <rect x="-150" y="-252" width="300" height="14" rx="4" fill="url(#pumpkin-wood)" stroke="#1b1033" stroke-width="4" />
      <path d="M-62 -100 L-74 -50 L-56 -70 L-50 -40 L-38 -74 L-24 -46 L-20 -86 Z M62 -100 L72 -54 L54 -72 L46 -44 L36 -78 L22 -50 L18 -88 Z" fill="#ffd36b" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-150 -258 L-176 -270 L-164 -246 L-182 -238 L-152 -228 Z M150 -258 L176 -270 L164 -246 L182 -238 L152 -228 Z" fill="#ffd36b" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-60 -258 L-150 -264 L-150 -222 L-62 -214 L-56 -96 Q0 -84 56 -96 L62 -214 L150 -222 L150 -264 L60 -258 Q0 -272 -60 -258 Z" fill="#ff8a3a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-130 -262 V-220 M-100 -262 V-218 M100 -262 V-218 M130 -262 V-220 M-30 -266 V-90 M30 -266 V-90 M-56 -230 H56 M-56 -170 H56 M-56 -120 H56" stroke="#7a2a8a" stroke-width="5" opacity="0.45" />
      <rect x="10" y="-196" width="34" height="32" rx="3" fill="#3fc0b0" stroke="#1b1033" stroke-width="3" transform="rotate(8 27 -180)" />
      <path d="M14 -192 l4 4 M14 -170 l4 4 M38 -194 l-4 4 M40 -170 l-4 4" stroke="#1b1033" stroke-width="2" />
      <path d="M-40 -276 Q0 -262 40 -276" stroke="#a0643c" stroke-width="7" fill="none" stroke-linecap="round" />
      <circle cy="-312" r="50" fill="url(#pumpkin-sack)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <circle cx="-18" cy="-320" r="9" fill="#3fc0b0" stroke="#1b1033" stroke-width="3" />
      <circle cx="18" cy="-320" r="9" fill="#a66bff" stroke="#1b1033" stroke-width="3" />
      <path d="M-22 -320 h8 M-18 -324 v8 M14 -320 h8 M18 -324 v8" stroke="#1b1033" stroke-width="2" />
      <path d="M-24 -292 Q0 -274 24 -292" stroke="#1b1033" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-16 -296 l-2 8 M-6 -290 l-1 8 M6 -290 l1 8 M16 -296 l2 8" stroke="#1b1033" stroke-width="2.5" stroke-linecap="round" />
      <ellipse cx="-34" cy="-300" rx="9" ry="5" fill="#ff8a8a" opacity="0.6" />
      <ellipse cx="34" cy="-300" rx="9" ry="5" fill="#ff8a8a" opacity="0.6" />
      <path d="M-30 -336 Q-24 -348 -12 -350" stroke="#fff6dc" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
      <g transform="rotate(-8 0 -350)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M-46 -352 Q-44 -418 -4 -436 Q30 -446 40 -420 Q50 -390 52 -352 Z" fill="#8a5a3a" stroke-width="5" filter="url(#cel-s)" />
        <ellipse cy="-350" rx="96" ry="16" fill="#a06a42" stroke-width="5" />
        <path d="M-44 -366 Q4 -372 50 -366" stroke="#ff8a2a" stroke-width="9" fill="none" />
        <rect x="-26" y="-418" width="26" height="24" fill="#a66bff" stroke-width="3" transform="rotate(10 -13 -406)" />
        <path d="M-24 -412 l4 2 M-24 -400 l4 2 M-4 -410 l4 2" stroke-width="2" />
        <path d="M-30 -400 Q-28 -424 -6 -432" stroke="#c89a6a" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
      <g transform="translate(118 -252)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M-20 -6 L-36 -2 L-22 4 Z" fill="#2a1d50" stroke-width="3" />
        <ellipse cx="0" cy="-16" rx="22" ry="16" fill="#3a2a6a" stroke-width="4" />
        <circle cx="16" cy="-34" r="13" fill="#3a2a6a" stroke-width="4" />
        <path d="M27 -36 L42 -30 L27 -28 Z" fill="#ff9a2a" stroke-width="3" />
        <circle cx="19" cy="-37" r="4.5" fill="#fff" stroke="none" />
        <circle cx="20" cy="-37" r="2.2" fill="#1b1033" stroke="none" />
        <path d="M10 -46 Q12 -54 18 -54 M14 -46 Q18 -52 24 -50" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M-8 -20 Q0 -10 10 -18" stroke="#6a5aa8" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M-4 0 V6 M4 0 V6" stroke="#ff9a2a" stroke-width="3" />
      </g>
    </g>

    <path :d="FENCE_POSTS" fill="#a8683e" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="FENCE_GRAIN" stroke="#e0a878" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    <g fill="url(#pumpkin-wood)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)">
      <path d="M1300 832 L1990 812 L1990 834 L1300 852 Z" />
      <path d="M1300 872 L1990 880 L1990 902 L1300 894 Z" />
    </g>
    <path d="M1320 838 L1980 818 M1320 878 L1980 886" stroke="#f0bc88" stroke-width="2.5" opacity="0.6" />
    <path d="M1360 868 q20 -40 50 -30 q20 10 0 24 q-14 6 -12 -6 M1600 830 q30 -26 56 -8 q10 16 -8 18 M1790 870 q24 -30 50 -14 q12 14 -6 18" stroke="#3a9a4a" stroke-width="5" fill="none" stroke-linecap="round" />
    <path :d="FENCE_LEAF.fill" fill="#3aa86a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
    <path :d="FENCE_LEAF.ribs" stroke="#8ae0a0" stroke-width="2.5" fill="none" stroke-linecap="round" />

    <path d="M-60 962 Q500 934 960 952 Q1400 976 1980 944 L1980 1140 L-60 1140 Z" fill="url(#pumpkin-front)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(40, 956, 1900, 0.018)" stroke="#4a9a8a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <path d="M1704 954 Q1630 880 1556 954" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round" />
    <path d="M1704 954 Q1630 880 1556 954" stroke="#3a2468" stroke-width="5" fill="none" stroke-linecap="round" />

    <path :d="CORNER_LEAVES" fill="#16263e" stroke="#0a0f1e" stroke-width="5" stroke-linejoin="round" />
    <path d="M70 1000 q20 -50 60 -40 q22 10 4 30 q-14 10 -16 -6 M1850 990 q-20 -50 -60 -40 q-22 10 -4 30 q14 10 16 -6" stroke="#16263e" stroke-width="7" fill="none" stroke-linecap="round" />
    <g v-for="(p, i) in FRONT" :key="`fr${i}`" :transform="`translate(${p.x} ${p.y})`">
      <ellipse :cy="p.h * 0.86" :rx="p.w * 1.15" :ry="p.h * 0.2" fill="#050d18" opacity="0.4" />
      <g :transform="`scale(${p.flip} 1)`">
        <g stroke="#1b1033" :stroke-width="p.sw" filter="url(#cel-s)">
          <ellipse :cx="-p.w * 0.42" :rx="p.w * 0.58" :ry="p.h * 0.94" :fill="SKINS[p.kind].side" />
          <ellipse :cx="p.w * 0.42" :rx="p.w * 0.58" :ry="p.h * 0.94" :fill="SKINS[p.kind].side" />
          <ellipse :rx="p.w * 0.5" :ry="p.h" :fill="`url(#pumpkin-${p.kind})`" />
        </g>
        <path :d="p.ribs" :stroke="SKINS[p.kind].rib" stroke-width="4" fill="none" opacity="0.4" />
        <path :d="p.glint" stroke="#fff" :stroke-width="p.w * 0.07" fill="none" stroke-linecap="round" opacity="0.55" />
        <template v-if="p !== BUCKET">
          <path :d="p.stem" stroke="#1b1033" :stroke-width="p.w * 0.2 + 6" fill="none" stroke-linecap="round" />
          <path :d="p.stem" stroke="#6a8a2a" :stroke-width="p.w * 0.2" fill="none" stroke-linecap="round" />
          <path :d="p.curl" stroke="#3a9a4a" stroke-width="4" fill="none" stroke-linecap="round" />
        </template>
      </g>
      <path v-if="p.face" :d="p.face" fill="#ffb52e" stroke="#7a2a10" stroke-width="4" stroke-linejoin="round" />
    </g>
    <g :transform="`translate(${BUCKET.x} ${BUCKET.y})`">
      <ellipse cy="-60" rx="56" ry="13" fill="#5a1e0a" stroke="#1b1033" stroke-width="5" />
      <rect x="-28" y="-92" width="22" height="30" rx="6" fill="#3fc0b0" stroke="#1b1033" stroke-width="3" transform="rotate(-18 -17 -77)" />
      <path d="M-34 -84 l-8 -6 M-12 -96 l2 -10" stroke="#1b1033" stroke-width="3" stroke-linecap="round" />
      <circle cx="26" cy="-76" r="12" fill="#ff5fa2" stroke="#1b1033" stroke-width="3" />
      <path d="M20 -80 Q26 -86 32 -80" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>
    <g v-for="(g, gi) in FRONT_GLOW" :key="`frg${gi}`" class="pumpkin-glow" :style="{ animationDelay: `-${gi * 0.9 + 0.3}s` }">
      <g v-for="(p, i) in g" :key="i" :transform="`translate(${p.x} ${p.y})`">
        <ellipse :cy="p.h * 0.1" :rx="p.w * 1.3" :ry="p.h * 1.2" fill="url(#pumpkin-halo)" />
        <path :d="p.face" fill="#fff4b0" />
      </g>
    </g>

    <path :d="CANDY.base" fill="#ffd23f" />
    <path :d="CANDY.mid" fill="#ff7a1f" />
    <path :d="CANDY.tip" fill="#fffaf0" />
    <path :d="CANDY.base" fill="none" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />

    <g v-for="(g, gi) in FLY_GROUPS" :key="`ff${gi}`" class="firefly" :style="{ animationDuration: `${5 + gi * 2}s`, animationDelay: `-${gi * 2}s` }">
      <path :d="g.halo" fill="#fff3a0" opacity="0.25" />
      <path :d="g.core" fill="#fffbd8" />
    </g>
  </g>
</template>

<style scoped>
.pumpkin-witch {
  animation: pumpkin-witch 30s linear infinite;
  animation-delay: -4s;
}

.pumpkin-bats {
  animation: pumpkin-bats 26s linear infinite;
  animation-delay: -10s;
}

.pumpkin-wing {
  animation: pumpkin-wing 0.5s step-end infinite;
}

.pumpkin-wing.late {
  animation-delay: -0.25s;
}

.pumpkin-ghost {
  transform-box: fill-box;
  transform-origin: center;
  animation: pumpkin-ghost 3.2s ease-in-out infinite alternate;
}

.pumpkin-glow {
  animation: pumpkin-glow 1.8s ease-in-out infinite alternate;
}

/* the witch crosses the moon once per loop, then waits off-screen for the rest of it */
@keyframes pumpkin-witch {
  0% {
    translate: -260px 300px;
  }
  35%,
  100% {
    translate: 2200px 80px;
  }
}

@keyframes pumpkin-bats {
  from {
    translate: -340px 0;
  }
  to {
    translate: 2200px -70px;
  }
}

@keyframes pumpkin-wing {
  0% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@keyframes pumpkin-ghost {
  from {
    translate: 0 0;
    rotate: -4deg;
  }
  to {
    translate: 0 -26px;
    rotate: 4deg;
  }
}

@keyframes pumpkin-glow {
  from {
    opacity: 0.35;
  }
  to {
    opacity: 1;
  }
}
</style>
