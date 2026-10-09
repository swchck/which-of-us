<script setup lang="ts">
import { seeded, tufts, twinkleGroups } from './kit';

const rnd = seeded(4339);
const f1 = (n: number) => n.toFixed(1);

const puffs = (cx: number, cy: number, n: number, spread: number, r: number) =>
  Array.from({ length: n }, () => {
    const x = cx + (rnd() - 0.5) * spread * 2;
    const y = cy + (rnd() - 0.5) * spread;
    const rr = r * (0.6 + rnd() * 0.6);
    return `M${f1(x - rr)} ${f1(y)} a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(rr * 2)} 0 a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-rr * 2)} 0 Z`;
  }).join(' ');
const canopy = (clusters: [number, number, number][]) => ({
  deep: clusters.map(([x, y, s]) => puffs(x + 10, y + 18, 7, s, s * 0.44)).join(' '),
  mid: clusters.map(([x, y, s]) => puffs(x, y, 8, s, s * 0.36)).join(' '),
  light: clusters.map(([x, y, s]) => puffs(x - 14, y - 16, 5, s * 0.7, s * 0.22)).join(' '),
  blooms: clusters
    .flatMap(([x, y, s]) => Array.from({ length: 4 }, () => `M${f1(x + (rnd() - 0.5) * s * 1.6)} ${f1(y + (rnd() - 0.5) * s * 0.8)} h0.1`))
    .join(' '),
});
const RIGHT_CANOPY = canopy([
  [1560, 50, 110],
  [1720, 20, 130],
  [1880, 70, 120],
  [1660, 170, 80],
  [1830, 220, 100],
  [1950, 300, 70],
]);
const LEFT_CANOPY = canopy([
  [30, 30, 120],
  [200, 60, 90],
  [60, 190, 80],
  [340, 20, 70],
]);

const leafAt = (x: number, y: number, a: number, l: number) => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const p = (u: number, v: number) => `${f1(x + u * c - v * s)} ${f1(y + u * s + v * c)}`;
  return { body: `M${p(0, 0)} Q${p(l / 2, -l * 0.4)} ${p(l, 0)} Q${p(l / 2, l * 0.4)} ${p(0, 0)} Z`, rib: `M${p(3, 0)} L${p(l * 0.8, 0)}` };
};
const ROSE_COLORS = ['#ff8fb1', '#ffc2d4', '#fff6f2', '#f76d98', '#ffd9a8'];
type Rose = { x: number; y: number; r: number; c?: string };
const swirl = ({ x, y, r }: Rose) =>
  `M${f1(x)} ${f1(y - r * 0.2)} a${f1(r * 0.2)} ${f1(r * 0.2)} 0 1 1 ${f1(-r * 0.3)} ${f1(r * 0.25)} a${f1(r * 0.48)} ${f1(r * 0.48)} 0 1 1 ${f1(r * 0.78)} ${f1(r * 0.3)} M${f1(x - r * 0.8)} ${f1(y + r * 0.15)} Q${f1(x - r * 0.55)} ${f1(y + r * 0.8)} ${f1(x + r * 0.25)} ${f1(y + r * 0.72)}`;

// garland sits heavy on the arch's left shoulder and trails down the post, with a small echo on the right
const ARCH = { x: 330, y: 520, r: 130 };
const onArch = (d: number): [number, number] => [ARCH.x + ARCH.r * Math.cos((d * Math.PI) / 180), ARCH.y - ARCH.r * Math.sin((d * Math.PI) / 180)];
const GARLAND_POINTS: [number, number][] = [
  ...[180, 166, 152, 138, 124, 110, 96, 82].map(onArch),
  ...[550, 585, 620, 655, 690, 725].map((y): [number, number] => [ARCH.x - ARCH.r, y]),
  ...[0, 16, 32].map(onArch),
  ...[555, 590].map((y): [number, number] => [ARCH.x + ARCH.r, y]),
];
const garlandLeaves = GARLAND_POINTS.flatMap(([x, y]) => Array.from({ length: 3 }, () => leafAt(x, y, rnd() * Math.PI * 2, 28 + rnd() * 16)));
const GARLAND = {
  leaves: garlandLeaves.map((l) => l.body).join(' '),
  ribs: garlandLeaves.map((l) => l.rib).join(' '),
  roses: GARLAND_POINTS.filter((_, i) => i % 4 !== 3).map(([x, y]) => ({ x: x + (rnd() - 0.5) * 16, y: y + (rnd() - 0.5) * 16, r: 13 + rnd() * 9, c: ROSE_COLORS[Math.floor(rnd() * 5)] })),
  breath: GARLAND_POINTS.flatMap(([x, y]) => Array.from({ length: 3 }, () => `M${f1(x + (rnd() - 0.5) * 56)} ${f1(y + (rnd() - 0.5) * 56)} h0.1`)).join(' '),
};
const GARLAND_SWIRLS = GARLAND.roses.map(swirl).join(' ');

const CAKE_X = 1520;
const TIERS = [
  { w: 230, bot: 762, h: 100, fill: 'url(#wedding-tier-pink)' },
  { w: 180, bot: 662, h: 90, fill: 'url(#wedding-tier-cream)' },
  { w: 136, bot: 572, h: 80, fill: 'url(#wedding-tier-pink)' },
  { w: 94, bot: 492, h: 70, fill: 'url(#wedding-tier-cream)' },
].map((t) => {
  const l = CAKE_X - t.w / 2;
  const r = CAKE_X + t.w / 2;
  const top = t.bot - t.h;
  const n = Math.round(t.w / 26);
  const s = t.w / n;
  let drip = `M${l} ${top}`;
  for (let i = 0; i < n; i++) {
    const x = l + i * s;
    const len = 6 + ((i * 7) % 5) * 4;
    drip += ` L${f1(x + s * 0.3)} ${top + 12} L${f1(x + s * 0.3)} ${top + 12 + len} a${f1(s * 0.2)} ${f1(s * 0.2)} 0 0 0 ${f1(s * 0.4)} 0 L${f1(x + s * 0.7)} ${top + 12} L${f1(x + s)} ${top + 14}`;
  }
  drip += ` L${r} ${top} Z`;
  return {
    ...t,
    top,
    body: `M${l} ${top} V${t.bot} A${t.w / 2} 12 0 0 0 ${r} ${t.bot} V${top} Z`,
    drip,
    beads: `M${l + 8} ${t.bot - 4} Q${CAKE_X} ${t.bot + 20} ${r - 8} ${t.bot - 4}`,
    glint: `M${l + 14} ${top + 34} V${t.bot - 10}`,
  };
});
const CAKE_ROSES: Rose[] = Array.from({ length: 9 }, (_, i) => {
  const t = i / 8;
  return { x: CAKE_X + 40 - 120 * t + Math.sin(t * 9) * 22, y: 432 + 318 * t, r: 12 + t * 8, c: ROSE_COLORS[i % 5] };
});
const cakeLeaves = CAKE_ROSES.flatMap(({ x, y, r }) => [leafAt(x, y, -2.6 + rnd(), r + 14), leafAt(x, y, 0.2 + rnd(), r + 12)]);
const CAKE_LEAVES = { body: cakeLeaves.map((l) => l.body).join(' '), rib: cakeLeaves.map((l) => l.rib).join(' ') };

const GLASSES = [
  { x: 1385, y: 806, juice: '#ffab3d' },
  { x: 1412, y: 814, juice: '#ff7fa6' },
  { x: 1630, y: 814, juice: '#ffab3d' },
  { x: 1658, y: 806, juice: '#ff7fa6' },
];

const GIFTS = [
  { x: 1785, bot: 852, w: 80, h: 64, c: '#ffc2d4', rib: '#e2a93b' },
  { x: 1878, bot: 852, w: 104, h: 92, c: '#fff4e0', rib: '#f76d98' },
  { x: 1968, bot: 852, w: 76, h: 58, c: '#f6d27a', rib: '#fffaf0' },
  { x: 1872, bot: 760, w: 62, h: 48, c: '#bfe6d0', rib: '#f76d98' },
];
const KNOT = { x: 1790, y: 786 };
const BALLOONS = [
  { x: 1700, y: 470, r: 40, c: '#ffb3cb' },
  { x: 1782, y: 420, r: 44, c: '#fff1d6' },
  { x: 1872, y: 452, r: 42, c: '#f6d27a' },
  { x: 1744, y: 548, r: 36, c: '#bfe6d0' },
  { x: 1836, y: 536, r: 40, c: '#ff8fb1' },
  { x: 1926, y: 532, r: 34, c: '#fffaf0' },
];

const CHAIRS = [
  { x: 60, y: 912, k: 0.68 },
  { x: 150, y: 912, k: 0.68 },
  { x: 515, y: 912, k: 0.68 },
  { x: 600, y: 912, k: 0.68 },
  { x: 660, y: 1010, k: 0.92 },
];
const TABLES = [
  { x: 820, y: 868, k: 0.56 },
  { x: 1020, y: 852, k: 0.5 },
  { x: 1222, y: 870, k: 0.56 },
];

const FLOOR_ROWS = [905, 930, 962, 1004, 1060, 1140];
const floorX = (y: number, f: number) => {
  const t = (y - 905) / 235;
  const l = 780 - 180 * t;
  const r = 1160 + 180 * t;
  return l + (r - l) * f;
};
const FLOOR_TILES = ['', ''];
for (let r = 0; r < FLOOR_ROWS.length - 1; r++) {
  const y0 = FLOOR_ROWS[r] ?? 0;
  const y1 = FLOOR_ROWS[r + 1] ?? 0;
  for (let c = 0; c < 8; c++) {
    FLOOR_TILES[(r + c) % 2] +=
      `M${f1(floorX(y0, c / 8))} ${y0} L${f1(floorX(y0, (c + 1) / 8))} ${y0} L${f1(floorX(y1, (c + 1) / 8))} ${y1} L${f1(floorX(y1, c / 8))} ${y1} Z `;
  }
}

const star = (x: number, y: number, s: number) =>
  `M${f1(x)} ${f1(y - s)} L${f1(x + s * 0.22)} ${f1(y - s * 0.22)} L${f1(x + s)} ${f1(y)} L${f1(x + s * 0.22)} ${f1(y + s * 0.22)} L${f1(x)} ${f1(y + s)} L${f1(x - s * 0.22)} ${f1(y + s * 0.22)} L${f1(x - s)} ${f1(y)} L${f1(x - s * 0.22)} ${f1(y - s * 0.22)} Z`;
const BALL = { x: 640, y: 372, r: 38, hang: 266 };
const SPARKLES = [
  Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + rnd();
    return star(BALL.x + Math.cos(a) * (60 + rnd() * 30), BALL.y + Math.sin(a) * (50 + rnd() * 26), 7 + rnd() * 6);
  }).join(' '),
  Array.from({ length: 9 }, () => {
    const y = 915 + rnd() * 150;
    return star(floorX(y, 0.08 + rnd() * 0.84), y, 6 + rnd() * 7);
  }).join(' '),
];

const SWAGS: [number, number, number, number, number][] = [
  [-60, 70, 420, 170, 80],
  [420, 170, 1500, 170, 150],
  [1500, 170, 1990, 60, 80],
];
const BULB_COLORS = ['#fff3b8', '#ffd1e0', '#ffe08a'];
const BULBS = SWAGS.flatMap(([ax, ay, bx, by, sag]) => {
  const cx = (ax + bx) / 2;
  const cy = (ay + by) / 2 + sag * 2;
  const n = Math.round((bx - ax) / 62);
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const x = (1 - t) * (1 - t) * ax + 2 * t * (1 - t) * cx + t * t * bx;
    const y = (1 - t) * (1 - t) * ay + 2 * t * (1 - t) * cy + t * t * by;
    return { x, y, c: BULB_COLORS[i % 3] };
  });
}).filter((b) => b.x > -20 && b.x < 1960);
const WIRES = SWAGS.map(([ax, ay, bx, by, sag]) => `M${ax} ${ay} Q${(ax + bx) / 2} ${(ay + by) / 2 + sag * 2} ${bx} ${by}`).join(' ');
const HALOS = twinkleGroups(BULBS);

let hedge = 'M-60 870 L-60 800';
let hedgeShine = '';
for (let x = -60; x < 1980; x += 90) {
  const peak = 752 + rnd() * 22;
  hedge += ` Q${x + 45} ${f1(peak)} ${x + 90} ${f1(796 + rnd() * 8)}`;
  hedgeShine += `M${x + 22} ${f1(peak + 30)} Q${x + 45} ${f1(peak + 16)} ${x + 66} ${f1(peak + 28)} `;
}
hedge += ' L1980 870 Z';
const HEDGE_FLOWERS = [0, 1].map(() => Array.from({ length: 34 }, () => `M${f1(rnd() * 1960)} ${f1(790 + rnd() * 34)} h0.1`).join(' '));
const DAISIES = Array.from({ length: 30 }, () => {
  const x = rnd() < 0.5 ? rnd() * 700 : 1240 + rnd() * 700;
  return `M${f1(x)} ${f1(870 + rnd() * 200)} h0.1`;
}).join(' ');
// mowing stripes fan out from the middle of the horizon so the lawn reads as a flat plane
const LAWN_STRIPES = Array.from({ length: 7 }, (_, k) => {
  const i = (k - 3) * 2;
  return `M${960 + i * 130} 840 L${960 + i * 130 + 65} 840 L${960 + i * 420 + 210} 1140 L${960 + i * 420} 1140 Z`;
}).join(' ');
const RUNNER_PETALS = Array.from({ length: 14 }, () => {
  const y = 880 + rnd() * 240;
  const t = (y - 866) / 274;
  return { x: 262 - 242 * t + (136 + 444 * t) * (0.1 + rnd() * 0.8), y, a: rnd() * 180, c: ROSE_COLORS[Math.floor(rnd() * 2)] };
});

const FAR_TREES = Array.from({ length: 8 }, (_, i) => ({ x: 80 + i * 260 + rnd() * 90, y: 700 + rnd() * 20, r: 20 + rnd() * 14 }));
const CLOUDS = [
  { x: 560, y: 440, k: 0.9 },
  { x: 1290, y: 400, k: 1.1 },
];

const DOVES = [
  { y: 320, k: 0.8, s: 30, d: 4 },
  { y: 430, k: 0.6, s: 40, d: 24 },
];

const PETAL_COLORS = ['#ffc2d6', '#fff6f8', '#ff9ec0', '#ffe3b0'];
const PETALS = Array.from({ length: 48 }, () => ({ x: rnd() * 2160, y: rnd() * 1080, a: rnd() * 180, k: 0.7 + rnd() * 0.7, c: PETAL_COLORS[Math.floor(rnd() * 4)] }));
// each sheet is drawn twice, one drift-length apart, so the fall loops without a seam
const PETAL_SHEETS = [28, 22, 18].map((s, i) => ({ s, d: i * 6, petals: PETALS.filter((_, j) => j % 3 === i) }));

const BUSH_ROSES: Rose[] = [
  { x: 40, y: 960, r: 20, c: '#c4507e' },
  { x: 130, y: 990, r: 16, c: '#d8749a' },
  { x: 210, y: 1050, r: 18, c: '#c4507e' },
  { x: 1830, y: 940, r: 20, c: '#d8749a' },
  { x: 1720, y: 990, r: 16, c: '#c4507e' },
  { x: 1900, y: 1010, r: 18, c: '#c4507e' },
  { x: 1670, y: 1070, r: 15, c: '#d8749a' },
];
const BUSH_SWIRLS = BUSH_ROSES.map(swirl).join(' ');
</script>

<template>
  <g>
    <defs>
      <linearGradient id="wedding-lawn" gradientUnits="userSpaceOnUse" x1="0" y1="820" x2="0" y2="1140">
        <stop offset="0%" stop-color="#bfe48e" />
        <stop offset="45%" stop-color="#7cc25c" />
        <stop offset="100%" stop-color="#4f9a48" />
      </linearGradient>
      <linearGradient id="wedding-hedge" gradientUnits="userSpaceOnUse" x1="0" y1="750" x2="0" y2="870">
        <stop offset="0%" stop-color="#6fc06a" />
        <stop offset="100%" stop-color="#2f7d45" />
      </linearGradient>
      <linearGradient id="wedding-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fffdf6" />
        <stop offset="100%" stop-color="#e9d2b6" />
      </linearGradient>
      <linearGradient id="wedding-cloth" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffeef3" />
        <stop offset="100%" stop-color="#f3a9c2" />
      </linearGradient>
      <linearGradient id="wedding-cream" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fffdf6" />
        <stop offset="100%" stop-color="#ecd8bc" />
      </linearGradient>
      <linearGradient id="wedding-tier-pink" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffeef4" />
        <stop offset="100%" stop-color="#f2a8c1" />
      </linearGradient>
      <linearGradient id="wedding-tier-cream" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fffefa" />
        <stop offset="100%" stop-color="#ecd6b8" />
      </linearGradient>
      <linearGradient id="wedding-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff1a8" />
        <stop offset="50%" stop-color="#e8b44a" />
        <stop offset="100%" stop-color="#b97a1e" />
      </linearGradient>
      <linearGradient id="wedding-runner" gradientUnits="userSpaceOnUse" x1="0" y1="866" x2="0" y2="1140">
        <stop offset="0%" stop-color="#f6e6dc" />
        <stop offset="100%" stop-color="#fffaf4" />
      </linearGradient>
      <linearGradient id="wedding-bark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#a87452" />
        <stop offset="100%" stop-color="#5e3a2a" />
      </linearGradient>
      <radialGradient id="wedding-ball" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="50%" stop-color="#d6d0ea" />
        <stop offset="100%" stop-color="#7d76a0" />
      </radialGradient>
      <radialGradient id="wedding-sun">
        <stop offset="0%" stop-color="#fff6d8" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#fff6d8" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="wedding-spot">
        <stop offset="0%" stop-color="#ff9ec0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ff9ec0" stop-opacity="0" />
      </radialGradient>
      <symbol id="wedding-chair" overflow="visible">
        <path d="M-28 -60 L-31 0 M28 -60 L31 0 M-18 -60 L-20 -10 M18 -60 L20 -10" stroke="#1b1033" stroke-width="10" stroke-linecap="round" />
        <path d="M-28 -60 L-31 0 M28 -60 L31 0 M-18 -60 L-20 -10 M18 -60 L20 -10" stroke="#fffaf0" stroke-width="5" stroke-linecap="round" />
        <path d="M-36 -68 H36 L32 -56 H-32 Z" fill="#f3e3cc" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-28 -62 V-148 M28 -62 V-148 M-28 -146 H28 M-28 -128 H28 M-14 -128 V-66 M0 -128 V-66 M14 -128 V-66" stroke="#1b1033" stroke-width="10" stroke-linecap="round" fill="none" />
        <path d="M-28 -62 V-148 M28 -62 V-148 M-28 -146 H28 M-28 -128 H28 M-14 -128 V-66 M0 -128 V-66 M14 -128 V-66" stroke="#fffaf0" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M-26 -62 V-144" stroke="#d8c2a6" stroke-width="2" opacity="0.8" />
        <rect x="-32" y="-112" width="64" height="16" fill="#f78fb0" stroke="#1b1033" stroke-width="3" />
        <path d="M0 -104 L-24 -120 L-22 -90 Z M0 -104 L24 -120 L22 -90 Z M-3 -100 L-12 -72 L-2 -78 Z M3 -100 L12 -72 L2 -78 Z" fill="#f78fb0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <circle cx="0" cy="-104" r="5" fill="#e0587f" stroke="#1b1033" stroke-width="3" />
      </symbol>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-wedding)" />
    <circle cx="1180" cy="700" r="260" fill="url(#wedding-sun)" />
    <circle cx="1180" cy="700" r="70" fill="#fff4d0" stroke="#efb6a0" stroke-width="3" />
    <g v-for="(c, i) in CLOUDS" :key="`cl${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.k})`">
      <path d="M-96 6 Q-108 -36 -60 -40 Q-50 -80 -2 -72 Q30 -104 66 -64 Q108 -66 102 -24 Q128 -4 96 10 Z" fill="#fff8fb" stroke="#e7a9bf" stroke-width="3" stroke-linejoin="round" />
      <path d="M-80 2 Q-20 -14 30 0 Q70 -10 90 4 Z" fill="#ffdbe7" />
      <path d="M-50 -46 Q-36 -64 -10 -62" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>

    <path d="M-60 720 Q200 650 460 690 Q700 730 920 690 Q1150 640 1400 690 Q1650 740 1980 670 L1980 1140 L-60 1140 Z" fill="#d9e9c6" stroke="#a3bd98" stroke-width="3" stroke-linejoin="round" />
    <g v-for="(t, i) in FAR_TREES" :key="`ft${i}`">
      <path :d="`M${t.x} ${t.y + 20} V${t.y - t.r}`" stroke="#9cae8e" stroke-width="5" />
      <circle :cx="t.x" :cy="t.y - t.r - 8" :r="t.r" fill="#bcd8a6" stroke="#96b38c" stroke-width="3" />
    </g>
    <g transform="translate(1440 712)" stroke="#b98ca0" stroke-width="2.5" stroke-linejoin="round">
      <path d="M-40 0 H40 V-8 H-40 Z" fill="#f7eef2" />
      <path d="M-32 -8 V-46 M-11 -8 V-46 M11 -8 V-46 M32 -8 V-46" stroke-width="4" />
      <path d="M-44 -46 H44 Q30 -86 0 -92 Q-30 -86 -44 -46 Z" fill="#f7eef2" />
      <path d="M0 -92 V-104" />
    </g>
    <path d="M-60 760 Q300 708 640 744 Q960 780 1300 736 Q1640 700 1980 752 L1980 1140 L-60 1140 Z" fill="#c4dfa8" stroke="#8fae86" stroke-width="3" stroke-linejoin="round" />
    <rect x="-60" y="640" width="2040" height="200" fill="url(#g-haze)" />

    <path :d="hedge" fill="url(#wedding-hedge)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="hedgeShine" stroke="#b4ea94" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    <path :d="HEDGE_FLOWERS[0]" stroke="#fffaf0" stroke-width="8" stroke-linecap="round" />
    <path :d="HEDGE_FLOWERS[1]" stroke="#ffb3cb" stroke-width="8" stroke-linecap="round" />

    <path d="M-60 846 Q480 818 960 832 Q1440 846 1980 822 L1980 1140 L-60 1140 Z" fill="url(#wedding-lawn)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="LAWN_STRIPES" fill="#e4f6b4" opacity="0.22" />
    <path :d="tufts(30, 856, 1900, 0.014)" stroke="#5a9a3e" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    <path :d="DAISIES" stroke="#fffaf0" stroke-width="7" stroke-linecap="round" opacity="0.85" />

    <ellipse cx="25" cy="896" rx="70" ry="12" fill="#1b2a10" opacity="0.3" />
    <path d="M-30 900 Q-14 600 0 250 L64 250 Q54 600 80 900 Z" fill="url(#wedding-bark)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
    <path d="M14 820 Q20 700 22 600 M40 520 Q44 420 44 330" stroke="#3e241a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5" />
    <path d="M1880 880 Q1898 560 1880 250 L1944 240 Q1952 560 1970 880 Z" fill="url(#wedding-bark)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
    <path d="M1912 800 Q1920 660 1916 560 M1930 460 Q1932 380 1928 300" stroke="#3e241a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5" />

    <g v-for="(t, i) in TABLES" :key="`tb${i}`" :transform="`translate(${t.x} ${t.y}) scale(${t.k})`">
      <ellipse cx="0" cy="2" rx="150" ry="16" fill="#1b2a10" opacity="0.28" />
      <use href="#wedding-chair" x="-62" y="-40" transform="scale(0.9)" />
      <use href="#wedding-chair" x="62" y="-40" transform="scale(0.9)" />
      <path d="M-120 -100 Q-126 -50 -130 -4 Q-110 6 -86 0 Q-64 8 -43 0 Q-21 8 0 0 Q21 8 43 0 Q64 8 86 0 Q110 6 130 -4 Q126 -50 120 -100 Z" fill="url(#wedding-cream)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-34 -78 L34 -78 L38 0 Q0 10 -38 0 Z" fill="#f9b6cb" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-84 -80 Q-88 -40 -90 -4 M84 -80 Q88 -40 90 -4 M-58 -76 Q-60 -40 -62 0 M58 -76 Q60 -40 62 0" stroke="#d6b89a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
      <ellipse cx="0" cy="-100" rx="120" ry="24" fill="#fffdf6" stroke="#1b1033" stroke-width="6" />
      <path d="M-44 -126 V-104 M44 -126 V-104" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
      <path d="M-44 -126 V-104 M44 -126 V-104" stroke="#fffaf0" stroke-width="7" stroke-linecap="round" />
      <path d="M-44 -132 q-6 -10 0 -18 q6 8 0 18 Z M44 -132 q-6 -10 0 -18 q6 8 0 18 Z" fill="#ffb02e" stroke="#1b1033" stroke-width="2.5" />
      <path d="M-14 -104 L14 -104 L10 -134 L-10 -134 Z" fill="url(#wedding-gold)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <circle cx="-14" cy="-148" r="16" fill="#ff8fb1" stroke="#1b1033" stroke-width="4" />
      <circle cx="14" cy="-150" r="16" fill="#fff6f2" stroke="#1b1033" stroke-width="4" />
      <circle cx="0" cy="-166" r="15" fill="#ffc2d4" stroke="#1b1033" stroke-width="4" />
    </g>

    <ellipse cx="970" cy="1010" rx="320" ry="90" fill="url(#wedding-spot)" />
    <path d="M776 905 L1164 905 L1344 1140 L596 1140 Z" fill="#fff3d6" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path :d="FLOOR_TILES[1]" fill="#f7d6a6" />
    <path :d="FLOOR_TILES[0]" fill="#fff1e0" />
    <path d="M776 905 L1164 905 L1344 1140 L596 1140 Z" fill="url(#wedding-spot)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M790 912 L1150 912" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />

    <path d="M262 866 L398 866 L600 1140 L20 1140 Z" fill="url(#wedding-runner)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M276 870 L64 1140 M384 870 L558 1140" stroke="#e2b55a" stroke-width="5" stroke-linecap="round" opacity="0.85" />
    <ellipse v-for="(p, i) in RUNNER_PETALS" :key="`rp${i}`" :cx="p.x" :cy="p.y" rx="9" ry="5" :transform="`rotate(${p.a} ${p.x} ${p.y})`" :fill="p.c" stroke="#e06a98" stroke-width="1.5" />

    <ellipse cx="330" cy="866" rx="190" ry="16" fill="#1b2a10" opacity="0.3" />
    <path d="M186 862 V520 A144 144 0 0 1 474 520 V862 H446 V520 A116 116 0 0 0 214 520 V862 Z" fill="url(#wedding-wood)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M194 840 V530 M454 840 V530" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
    <path d="M214 560 Q256 610 240 700 Q230 790 258 862 L214 862 Z" fill="#fffafc" fill-opacity="0.75" stroke="#e7a9bf" stroke-width="3" stroke-linejoin="round" />
    <path d="M446 560 Q404 610 420 700 Q430 790 402 862 L446 862 Z" fill="#fffafc" fill-opacity="0.75" stroke="#e7a9bf" stroke-width="3" stroke-linejoin="round" />
    <path d="M226 600 Q238 700 232 840 M434 600 Q422 700 428 840" stroke="#f1c7d6" stroke-width="3" fill="none" stroke-linecap="round" />
    <path :d="GARLAND.leaves" fill="#4fae5a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
    <path :d="GARLAND.ribs" stroke="#2f7d45" stroke-width="2.5" stroke-linecap="round" />
    <circle v-for="(r, i) in GARLAND.roses" :key="`gr${i}`" :cx="r.x" :cy="r.y" :r="r.r" :fill="r.c" stroke="#1b1033" stroke-width="3.5" />
    <path :d="GARLAND_SWIRLS" stroke="#b0325f" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.55" />
    <path :d="GARLAND.breath" stroke="#fffaf0" stroke-width="7" stroke-linecap="round" />
    <path d="M446 548 L414 530 L416 566 Z M446 548 L478 530 L476 566 Z M444 552 L428 604 L440 598 Z M448 552 L466 604 L454 598 Z" fill="#f78fb0" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
    <circle cx="446" cy="548" r="7" fill="#e0587f" stroke="#1b1033" stroke-width="3" />
    <g v-for="x in [200, 460]" :key="`pot${x}`">
      <path :d="`M${x - 30} 838 L${x + 30} 838 L${x + 22} 870 L${x - 22} 870 Z`" fill="url(#wedding-gold)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path :d="`M${x - 34} 840 Q${x - 30} 806 ${x - 8} 812 Q${x} 790 ${x + 14} 810 Q${x + 36} 806 ${x + 34} 840 Z`" fill="#4fae5a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>

    <use v-for="(c, i) in CHAIRS" :key="`ch${i}`" href="#wedding-chair" :transform="`translate(${c.x} ${c.y}) scale(${c.k})`" />

    <ellipse :cx="CAKE_X" cy="908" rx="200" ry="18" fill="#1b2a10" opacity="0.3" />
    <path
      d="M1340 800 Q1336 860 1330 906 Q1349 920 1368 906 Q1387 920 1406 906 Q1425 920 1444 906 Q1463 920 1482 906 Q1501 920 1520 906 Q1539 920 1558 906 Q1577 920 1596 906 Q1615 920 1634 906 Q1653 920 1672 906 Q1691 920 1710 906 Q1704 860 1700 800 Z"
      fill="url(#wedding-cloth)"
      stroke="#1b1033"
      stroke-width="5"
      stroke-linejoin="round"
      filter="url(#cel)"
    />
    <path d="M1380 830 Q1376 870 1370 904 M1440 836 Q1440 870 1438 906 M1600 836 Q1600 870 1602 906 M1660 830 Q1664 870 1670 904" stroke="#d47896" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
    <path d="M1344 812 Q1520 860 1696 812" stroke="#fffaf0" stroke-width="8" fill="none" stroke-dasharray="0 14" stroke-linecap="round" />
    <ellipse :cx="CAKE_X" cy="800" rx="180" ry="28" fill="#ffe3ec" stroke="#1b1033" stroke-width="5" />
    <path d="M1488 800 L1500 772 L1540 772 L1552 800 Z" fill="url(#wedding-gold)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <ellipse :cx="CAKE_X" cy="768" rx="134" ry="13" fill="url(#wedding-gold)" stroke="#1b1033" stroke-width="4" />
    <g v-for="(t, i) in TIERS" :key="`ti${i}`">
      <path :d="t.body" :fill="t.fill" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path :d="t.beads" stroke="#e2a93b" stroke-width="7" fill="none" stroke-dasharray="0 13" stroke-linecap="round" />
      <path :d="t.glint" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.85" />
      <path :d="t.drip" fill="#fffdf8" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <ellipse :cx="CAKE_X" :cy="t.top" :rx="t.w / 2" ry="12" fill="#fffdf8" stroke="#1b1033" stroke-width="4" />
    </g>
    <path d="M1508 422 L1512 396 M1532 422 L1528 396" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
    <path d="M1520 404 C1488 384 1492 350 1520 364 C1548 350 1552 384 1520 404 Z" fill="url(#wedding-gold)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M1504 372 Q1508 364 1516 366" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path :d="CAKE_LEAVES.body" fill="#5cb866" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    <path :d="CAKE_LEAVES.rib" stroke="#2f7d45" stroke-width="2" stroke-linecap="round" />
    <circle v-for="(r, i) in CAKE_ROSES" :key="`cr${i}`" :cx="r.x" :cy="r.y" :r="r.r" :fill="r.c" stroke="#1b1033" stroke-width="3.5" />
    <path :d="CAKE_ROSES.map(swirl).join(' ')" stroke="#b0325f" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.55" />
    <g v-for="(g, i) in GLASSES" :key="`gl${i}`" :transform="`translate(${g.x} ${g.y})`">
      <ellipse cx="0" cy="0" rx="15" ry="4" fill="#fffaf0" stroke="#1b1033" stroke-width="3" />
      <path d="M0 -2 V-40" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
      <path d="M0 -4 V-40" stroke="#eef6ff" stroke-width="2.5" />
      <path d="M-11.6 -70 Q-12.5 -48 0 -40 Q12.5 -48 11.6 -70 Z" :fill="g.juice" />
      <path d="M-12 -92 Q-14 -50 0 -40 Q14 -50 12 -92 Z" fill="#e8f4ff" fill-opacity="0.35" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M-6 -84 Q-8 -64 -4 -52" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M-12 -70 Q0 -66 12 -70" stroke="#1b1033" stroke-width="1.5" fill="none" opacity="0.5" />
    </g>

    <ellipse cx="1880" cy="940" rx="150" ry="14" fill="#1b2a10" opacity="0.3" />
    <path d="M1746 850 L1990 850 L1990 936 Q1960 946 1930 936 Q1900 946 1870 936 Q1840 946 1810 936 Q1780 946 1750 936 L1740 936 Z" fill="url(#wedding-cream)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
    <path d="M1746 862 Q1802 902 1858 862 Q1914 902 1970 862" stroke="#1b1033" stroke-width="13" fill="none" stroke-linecap="round" />
    <path d="M1746 862 Q1802 902 1858 862 Q1914 902 1970 862" stroke="#f78fb0" stroke-width="7" fill="none" stroke-linecap="round" />
    <circle cx="1858" cy="862" r="9" fill="#e2a93b" stroke="#1b1033" stroke-width="3" />
    <g v-for="(b, i) in GIFTS" :key="`gf${i}`">
      <rect :x="b.x - b.w / 2" :y="b.bot - b.h" :width="b.w" :height="b.h" :fill="b.c" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)" />
      <rect :x="b.x - b.w / 2 - 5" :y="b.bot - b.h - 4" :width="b.w + 10" height="16" :fill="b.c" stroke="#1b1033" stroke-width="4" />
      <rect :x="b.x - 7" :y="b.bot - b.h - 4" width="14" :height="b.h + 4" :fill="b.rib" stroke="#1b1033" stroke-width="3" />
      <ellipse :cx="b.x - 13" :cy="b.bot - b.h - 12" rx="14" ry="8" :transform="`rotate(-25 ${b.x - 13} ${b.bot - b.h - 12})`" :fill="b.rib" stroke="#1b1033" stroke-width="3" />
      <ellipse :cx="b.x + 13" :cy="b.bot - b.h - 12" rx="14" ry="8" :transform="`rotate(25 ${b.x + 13} ${b.bot - b.h - 12})`" :fill="b.rib" stroke="#1b1033" stroke-width="3" />
      <circle :cx="b.x" :cy="b.bot - b.h - 6" r="5" :fill="b.rib" stroke="#1b1033" stroke-width="3" />
    </g>

    <g class="wedding-bob" :style="{ transformOrigin: `${KNOT.x}px ${KNOT.y}px` }">
      <path v-for="(b, i) in BALLOONS" :key="`bs${i}`" :d="`M${KNOT.x} ${KNOT.y} Q${(KNOT.x + b.x) / 2 + 14} ${(KNOT.y + b.y) / 2} ${b.x} ${b.y + b.r * 1.15 + 6}`" stroke="#6a4a6a" stroke-width="2.5" fill="none" />
      <g v-for="(b, i) in BALLOONS" :key="`bl${i}`">
        <path :d="`M${b.x - 6} ${b.y + b.r * 1.15 + 8} L${b.x} ${b.y + b.r * 1.15 - 2} L${b.x + 6} ${b.y + b.r * 1.15 + 8} Z`" :fill="b.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <ellipse :cx="b.x" :cy="b.y" :rx="b.r" :ry="b.r * 1.15" :fill="b.c" stroke="#1b1033" stroke-width="4.5" />
        <path :d="`M${b.x + b.r * 0.15} ${b.y + b.r * 1.05} Q${b.x + b.r * 0.85} ${b.y + b.r * 0.6} ${b.x + b.r * 0.9} ${b.y}`" stroke="#1b1033" stroke-width="5" fill="none" opacity="0.14" stroke-linecap="round" />
        <path :d="`M${b.x - b.r * 0.55} ${b.y - b.r * 0.3} Q${b.x - b.r * 0.45} ${b.y - b.r * 0.8} ${b.x - b.r * 0.05} ${b.y - b.r * 0.9}`" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.85" />
      </g>
    </g>
    <circle :cx="KNOT.x" :cy="KNOT.y" r="6" fill="#f78fb0" stroke="#1b1033" stroke-width="3" />

    <!-- stroked once underneath, filled on top: only the outer silhouette keeps an ink line, not every puff -->
    <path :d="RIGHT_CANOPY.deep + LEFT_CANOPY.deep" fill="#1b1033" stroke="#1b1033" stroke-width="10" />
    <path :d="RIGHT_CANOPY.deep + LEFT_CANOPY.deep" fill="#2f7d45" filter="url(#cel)" />
    <path :d="RIGHT_CANOPY.mid + LEFT_CANOPY.mid" fill="#4fae5a" />
    <path :d="RIGHT_CANOPY.light + LEFT_CANOPY.light" fill="#8fd27a" />
    <path :d="RIGHT_CANOPY.blooms + LEFT_CANOPY.blooms" stroke="#fff6f2" stroke-width="10" stroke-linecap="round" />

    <path :d="WIRES" stroke="#4a3050" stroke-width="3" fill="none" />
    <g v-for="(group, gi) in HALOS" :key="`hg${gi}`" class="wedding-halo" :style="{ animationDelay: `-${gi * 0.7}s`, animationDuration: `${2.2 + gi * 0.4}s` }">
      <circle v-for="(b, i) in group" :key="i" :cx="b.x" :cy="b.y + 12" r="17" fill="#fff1a0" />
    </g>
    <g v-for="(b, i) in BULBS" :key="`bu${i}`">
      <rect :x="b.x - 4" :y="b.y - 2" width="8" height="7" fill="#4a3050" />
      <circle :cx="b.x" :cy="b.y + 12" r="8" :fill="b.c" stroke="#1b1033" stroke-width="2.5" />
      <circle :cx="b.x - 2.5" :cy="b.y + 9" r="2" fill="#fff" />
    </g>

    <g class="wedding-swing" :style="{ transformOrigin: `${BALL.x}px ${BALL.hang}px` }">
      <path :d="`M${BALL.x} ${BALL.hang} V${BALL.y - BALL.r}`" stroke="#4a3050" stroke-width="3" />
      <rect :x="BALL.x - 8" :y="BALL.y - BALL.r - 8" width="16" height="10" fill="url(#wedding-gold)" stroke="#1b1033" stroke-width="3" />
      <circle :cx="BALL.x" :cy="BALL.y" :r="BALL.r" fill="url(#wedding-ball)" stroke="#1b1033" stroke-width="4.5" />
      <g stroke="#6a6290" stroke-width="1.5" fill="none" opacity="0.7">
        <ellipse :cx="BALL.x" :cy="BALL.y" rx="14" :ry="BALL.r" />
        <ellipse :cx="BALL.x" :cy="BALL.y" rx="28" :ry="BALL.r" />
        <path :d="`M${BALL.x - 36} ${BALL.y - 13} H${BALL.x + 36} M${BALL.x - 38} ${BALL.y} H${BALL.x + 38} M${BALL.x - 36} ${BALL.y + 13} H${BALL.x + 36} M${BALL.x - 27} ${BALL.y - 26} H${BALL.x + 27} M${BALL.x - 27} ${BALL.y + 26} H${BALL.x + 27}`" />
      </g>
      <path :d="`M${BALL.x - 20} ${BALL.y - 20} h9 v9 h-9 Z M${BALL.x - 6} ${BALL.y - 30} h8 v8 h-8 Z M${BALL.x - 26} ${BALL.y - 4} h7 v8 h-7 Z`" fill="#fff" />
    </g>
    <path :d="SPARKLES[0]" fill="#fffbe0" stroke="#e2a93b" stroke-width="1.5" class="wedding-sparkle" />
    <path :d="SPARKLES[1]" fill="#fff" stroke="#f78fb0" stroke-width="1.5" class="wedding-sparkle" style="animation-delay: -1.1s" />

    <g class="balloon" style="animation-duration: 36s; animation-delay: -9s">
      <g transform="translate(1150 1120)">
        <path d="M0 40 Q-10 80 4 120" stroke="#6a4a6a" stroke-width="2.5" fill="none" />
        <path d="M0 40 C-60 0 -50 -50 0 -30 C50 -50 60 0 0 40 Z" fill="#ff8fb1" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-30 -22 Q-24 -36 -10 -32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="(d, i) in DOVES" :key="`dv${i}`" class="gull" :style="{ animationDelay: `-${d.d}s`, animationDuration: `${d.s}s` }">
      <g :transform="`translate(0 ${d.y}) scale(${d.k})`">
        <path d="M-30 2 L-64 -10 L-58 8 L-66 22 L-30 12 Z" fill="#fff" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <ellipse cx="0" cy="4" rx="34" ry="15" fill="#fff" stroke="#1b1033" stroke-width="4" />
        <path d="M-20 12 Q0 20 26 10" stroke="#d6d0ea" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cx="32" cy="-6" r="12" fill="#fff" stroke="#1b1033" stroke-width="4" />
        <path d="M43 -9 L54 -4 L43 -1 Z" fill="#ffab3d" stroke="#1b1033" stroke-width="2.5" stroke-linejoin="round" />
        <circle cx="35" cy="-9" r="2.5" fill="#1b1033" />
        <path d="M52 -2 Q60 4 66 12" stroke="#2f7d45" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M58 4 l6 -4 l-1 7 Z M63 10 l7 -2 l-3 6 Z" fill="#6fc06a" />
        <g class="flap">
          <path d="M-14 -4 Q-14 -62 34 -80 Q22 -54 26 -36 Q14 -34 18 -14 Q4 -10 -14 -4 Z" fill="#fff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
          <path d="M-4 -12 Q2 -44 24 -66 M6 -10 Q12 -30 22 -38" stroke="#c9c3e0" stroke-width="2.5" fill="none" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <g fill="#24563a" stroke="#13301f" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-74 960 30 940 Q80 890 150 930 Q220 930 236 1010 Q290 1050 270 1140 Z" />
      <path d="M1980 1140 Q2000 900 1870 900 Q1800 860 1740 920 Q1660 930 1666 1010 Q1600 1050 1620 1140 Z" />
    </g>
    <path d="M20 980 Q60 960 90 970 M150 1000 Q190 990 210 1010 M1700 960 Q1740 940 1780 950 M1830 1060 Q1870 1040 1910 1050" stroke="#3f7a52" stroke-width="5" fill="none" stroke-linecap="round" />
    <circle v-for="(r, i) in BUSH_ROSES" :key="`br${i}`" :cx="r.x" :cy="r.y" :r="r.r" :fill="r.c" stroke="#13301f" stroke-width="4" />
    <path :d="BUSH_SWIRLS" stroke="#7a1f48" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7" />

    <g v-for="(sheet, i) in PETAL_SHEETS" :key="`ps${i}`" class="wedding-petals" :style="{ animationDuration: `${sheet.s}s`, animationDelay: `-${sheet.d}s` }">
      <template v-for="(p, j) in sheet.petals" :key="j">
        <ellipse :cx="p.x" :cy="p.y" :rx="8 * p.k" :ry="4.5 * p.k" :transform="`rotate(${p.a} ${p.x} ${p.y})`" :fill="p.c" stroke="#e06a98" stroke-width="1.5" />
        <ellipse :cx="p.x + 240" :cy="p.y - 1080" :rx="8 * p.k" :ry="4.5 * p.k" :transform="`rotate(${p.a} ${p.x + 240} ${p.y - 1080})`" :fill="p.c" stroke="#e06a98" stroke-width="1.5" />
      </template>
    </g>
  </g>
</template>

<style scoped>
.wedding-petals {
  animation: wedding-petals linear infinite;
}

.wedding-halo {
  animation: wedding-halo ease-in-out infinite alternate;
}

.wedding-sparkle {
  animation: wedding-sparkle 2.2s ease-in-out infinite;
}

.wedding-swing {
  transform-box: view-box;
  animation: wedding-swing 3.4s ease-in-out infinite alternate;
}

.wedding-bob {
  transform-box: view-box;
  animation: wedding-bob 4.6s ease-in-out infinite alternate;
}

@keyframes wedding-petals {
  from {
    translate: 0 0;
  }
  to {
    translate: -240px 1080px;
  }
}

@keyframes wedding-halo {
  from {
    opacity: 0.15;
  }
  to {
    opacity: 0.7;
  }
}

@keyframes wedding-sparkle {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes wedding-swing {
  from {
    rotate: -5deg;
  }
  to {
    rotate: 5deg;
  }
}

@keyframes wedding-bob {
  from {
    rotate: -2.5deg;
  }
  to {
    rotate: 2deg;
  }
}
</style>
