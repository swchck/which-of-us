<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(316);
const f1 = (n: number) => n.toFixed(1);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)] as T;

const SHIRTS = ['#ff4f6d', '#3ad6e0', '#ffd23f', '#8a6bff', '#2ed47a', '#ff8a2f', '#ffffff', '#3a8cff'];
const SKIN = ['#ffd9b8', '#f2b98c', '#c98a5e', '#8a5a3c', '#ffe4cc'];
const HATS = ['#ff3d4f', '#3a8cff', '#ffd23f', '#1b1033'];

const STAND_ROWS = 5;
const ROW_Y = (r: number) => 548 + r * 30;
const CROWD = Array.from({ length: STAND_ROWS }, (_, r) =>
  Array.from({ length: 21 }, (_, i) => {
    const x = -40 + (r % 2) * 14 + i * 29 + (rnd() - 0.5) * 6;
    return { x, y: ROW_Y(r) + 6, shirt: pick(SHIRTS), skin: pick(SKIN), hat: rnd() < 0.3 ? pick(HATS) : '' };
  }).filter((p) => p.x < 585),
);
const FACES = CROWD.flat()
  .map((p) => `M${f1(p.x - 3.5)} ${f1(p.y - 30)} h0.1 M${f1(p.x + 3.5)} ${f1(p.y - 30)} h0.1`)
  .join(' ');
const WAVE_FLAGS = ['#ff3d4f', '#ffd23f', '#3a8cff', '#2ed47a', '#ffffff'];
const WAVERS = [0, 1].map((g) =>
  CROWD.flatMap((row, r) => row.filter((_, i) => (i * 7 + r * 3) % 11 === g * 5).map((p, k) => ({ ...p, flag: WAVE_FLAGS[(k + r + g) % WAVE_FLAGS.length] }))),
);

// quadratic sag between two posts, sampled for the pennants
const bunting = (x0: number, y0: number, x1: number, y1: number, sag: number, n: number) => {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + sag;
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const u = 1 - t;
    return { x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * y0 + 2 * u * t * cy + t * t * y1 };
  });
  return { line: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, pts };
};
const PENNANT_COLORS = ['#ff3d4f', '#ffd23f', '#3a8cff', '#2ed47a', '#ffffff'];
const BUNTING = [bunting(612, 462, 900, 560, 50, 11), bunting(900, 560, 1180, 560, 46, 11), bunting(1180, 560, 1250, 575, 14, 3)];
const PENNANTS = BUNTING.flatMap((b) => b.pts).map((p, i) => ({
  d: `M${f1(p.x - 9)} ${f1(p.y - 2)} L${f1(p.x + 9)} ${f1(p.y + 1)} L${f1(p.x)} ${f1(p.y + 20)} Z`,
  c: PENNANT_COLORS[i % PENNANT_COLORS.length],
}));

const FAR_TREES = [80, 150, 690, 760, 820, 1040, 1110, 1190, 1820, 1880].map((x) => ({ x, y: 650 + Math.sin(x * 0.01) * 8, r: 14 + rnd() * 10 }));

// gantry beam corners: near end is lower and taller because it is closer to the camera
const BEAM = { ax: 336, ay: 646, bx: 548, by: 588, hNear: 52, hFar: 38 };
const beamPt = (u: number, v: number) => {
  const h = BEAM.hNear + (BEAM.hFar - BEAM.hNear) * u;
  return [BEAM.ax + (BEAM.bx - BEAM.ax) * u, BEAM.ay + (BEAM.by - BEAM.ay) * u + v * h] as const;
};
const quad = (p: (u: number, v: number) => readonly [number, number], u0: number, v0: number, u1: number, v1: number) => {
  const c = [p(u0, v0), p(u1, v0), p(u1, v1), p(u0, v1)];
  return `M${c.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L')} Z`;
};
const BEAM_CHECKS = Array.from({ length: 16 }, (_, k) => {
  const i = k % 8;
  const j = Math.floor(k / 8);
  return (i + j) % 2 ? quad(beamPt, i / 8, j / 2, (i + 1) / 8, (j + 1) / 2) : '';
}).join(' ');
const LIGHTS = [0.3, 0.45, 0.6, 0.75].map((u) => beamPt(u, 1));

// painted start line across the front straight, far edge (y 880) to near edge (y 1012)
const linePt = (u: number, v: number) => {
  const w = 22 + 16 * v;
  return [528 - 160 * v + u * w, 880 + 132 * v] as const;
};
const LINE_CHECKS = Array.from({ length: 14 }, (_, k) => {
  const i = k % 2;
  const j = Math.floor(k / 2);
  return (i + j) % 2 ? quad(linePt, i / 2, j / 7, (i + 1) / 2, (j + 1) / 7) : '';
}).join(' ');
const LINE_OUTLINE = quad(linePt, 0, 0, 1, 1);

const MOW = Array.from({ length: 9 }, (_, i) => {
  const x = -40 + i * 170;
  return `M${x} 722 L${x + 80} 722 L${x + 30} 876 L${x - 50} 876 Z`;
}).join(' ');

const KARTS = [
  { x: 300, y: 948, k: 0.82, body: '#3a8cff', dark: '#2458b8', helmet: '#ffffff', stripe: '#ff3d4f', suit: '#ffd23f', d: 0.07 },
  { x: 0, y: 990, k: 1, body: '#ff3d4f', dark: '#b81f35', helmet: '#ffd23f', stripe: '#3a8cff', suit: '#ffffff', d: 0 },
  { x: -330, y: 972, k: 0.92, body: '#2ed47a', dark: '#1a8f50', helmet: '#8a6bff', stripe: '#ffffff', suit: '#ff8a2f', d: 0.12 },
];
const FAR_KARTS = [
  { x: 0, body: '#ff3d4f', helmet: '#ffd23f' },
  { x: 70, body: '#3a8cff', helmet: '#ffffff' },
  { x: 150, body: '#2ed47a', helmet: '#8a6bff' },
];

const tyreStack = (x: number, base: number, n: number, w: number, h: number, band: string) => ({
  x,
  w,
  top: base - n * h,
  tyres: Array.from({ length: n }, (_, k) => ({ y: base - (k + 1) * h, band: k % 2 ? band : '' })),
  h,
});
const STACKS_BACK = [tyreStack(1620, 746, 2, 46, 22, '#ff3d4f'), tyreStack(1668, 746, 3, 46, 22, '#ffffff'), tyreStack(1716, 746, 2, 46, 22, '#ff3d4f')];
const STACKS_FRONT = [
  tyreStack(40, 1130, 4, 120, 50, '#ff3d4f'),
  tyreStack(160, 1150, 3, 120, 50, '#ffffff'),
  tyreStack(1760, 1140, 4, 120, 50, '#ffffff'),
  tyreStack(1880, 1120, 5, 120, 50, '#ff3d4f'),
];
const CONES = [
  { x: 760, y: 872, k: 0.55 },
  { x: 1010, y: 870, k: 0.5 },
  { x: 290, y: 1110, k: 1.2 },
  { x: 1630, y: 1100, k: 1.1 },
];
const SPARKLES = [
  [1436, 712, 1],
  [1384, 742, 0.7],
  [1470, 760, 0.6],
] as const;
const BUSHES = [
  { x: 120, s: 1 },
  { x: 760, s: 0.8 },
  { x: 1190, s: 0.9 },
];
const SPARKLE = 'M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12 Z';
</script>

<template>
  <g class="scenery">
    <defs>
      <linearGradient id="race-asphalt" x1="0" y1="688" x2="0" y2="1012" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#9a96b4" />
        <stop offset="45%" stop-color="#6e6a88" />
        <stop offset="100%" stop-color="#4a4562" />
      </linearGradient>
      <linearGradient id="race-ground" x1="0" y1="660" x2="0" y2="1140" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#9fe07a" />
        <stop offset="40%" stop-color="#6cc957" />
        <stop offset="100%" stop-color="#3f9a44" />
      </linearGradient>
      <linearGradient id="race-stand" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7d8fe0" />
        <stop offset="100%" stop-color="#4b5aa8" />
      </linearGradient>
      <linearGradient id="race-garage" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#cfc8e6" />
      </linearGradient>
      <linearGradient id="race-blimp" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="60%" stop-color="#dfe3f2" />
        <stop offset="100%" stop-color="#a9b0cc" />
      </linearGradient>
      <linearGradient id="race-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="45%" stop-color="#ffcc33" />
        <stop offset="100%" stop-color="#d58a12" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-race)" />
    <circle cx="210" cy="150" r="230" fill="#fff6c8" opacity="0.18" />
    <circle cx="210" cy="150" r="140" fill="#fff1b0" fill-opacity="0.35" class="glow" />
    <path d="M210 40 V10 M210 260 V290 M100 150 H70 M320 150 H350 M132 72 L110 50 M288 228 L310 250 M288 72 L310 50 M132 228 L110 250" stroke="#ffd36b" stroke-width="8" stroke-linecap="round" opacity="0.8" />
    <circle cx="210" cy="150" r="78" fill="#ffe36b" stroke="#1b1033" stroke-width="5" />
    <path d="M168 120 Q186 96 220 92" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.8" />

    <g class="cloud" style="animation-duration: 170s; animation-delay: -60s">
      <g transform="translate(0 110)">
        <path d="M0 40 Q-10 0 40 4 Q60 -30 110 -6 Q150 -24 170 14 Q210 18 196 44 Z" fill="#ffffff" stroke="#8fb8d8" stroke-width="3" stroke-linejoin="round" />
        <path d="M14 40 Q100 30 190 40" stroke="#cfe3f3" stroke-width="8" fill="none" stroke-linecap="round" />
      </g>
      <g transform="translate(-900 250) scale(0.7)">
        <path d="M0 40 Q-10 0 40 4 Q60 -30 110 -6 Q150 -24 170 14 Q210 18 196 44 Z" fill="#ffffff" stroke="#8fb8d8" stroke-width="4" stroke-linejoin="round" />
        <path d="M14 40 Q100 30 190 40" stroke="#cfe3f3" stroke-width="10" fill="none" stroke-linecap="round" />
      </g>
    </g>
    <g class="cloud" style="animation-duration: 230s; animation-delay: -170s">
      <g transform="translate(0 330) scale(0.85)">
        <path d="M0 40 Q-6 4 34 6 Q50 -24 96 -4 Q120 -30 160 0 Q200 6 190 42 Z" fill="#ffffff" stroke="#8fb8d8" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M14 40 Q100 30 180 40" stroke="#cfe3f3" stroke-width="8" fill="none" stroke-linecap="round" />
      </g>
      <g transform="translate(-1100 70) scale(0.6)">
        <path d="M0 40 Q-6 4 34 6 Q50 -24 96 -4 Q120 -30 160 0 Q200 6 190 42 Z" fill="#ffffff" stroke="#8fb8d8" stroke-width="5" stroke-linejoin="round" />
      </g>
    </g>

    <g class="race-blimp">
      <g transform="translate(0 175)">
        <path d="M-150 -6 L-200 -52 L-176 -4 L-200 44 Z" fill="#ff3d4f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <ellipse cx="0" cy="0" rx="160" ry="54" fill="url(#race-blimp)" stroke="#1b1033" stroke-width="5" />
        <path d="M-150 14 Q0 40 150 14 Q140 34 110 42 Q0 58 -110 42 Q-140 34 -150 14 Z" fill="#ff3d4f" />
        <path d="M-130 26 Q0 46 130 26" stroke="#ffd23f" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M-100 -36 Q-20 -54 70 -40" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9" />
        <ellipse cx="0" cy="0" rx="160" ry="54" fill="none" stroke="#1b1033" stroke-width="5" />
        <path d="M-160 -4 L-196 -10" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
        <rect x="-30" y="50" width="60" height="22" rx="9" fill="#3a8cff" stroke="#1b1033" stroke-width="4" />
        <path d="M-18 60 h10 M2 60 h10" stroke="#c9f0ff" stroke-width="6" stroke-linecap="round" />
      </g>
    </g>

    <g transform="translate(1800 215)">
      <g class="race-balloon">
        <path d="M-24 52 L-16 84 M24 52 L16 84" stroke="#1b1033" stroke-width="3" />
        <path d="M0 -120 C78 -120 98 -40 64 12 L26 54 L-26 54 L-64 12 C-98 -40 -78 -120 0 -120 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M0 -120 C-40 -116 -52 -40 -40 12 L-26 54 L-10 54 L-18 12 C-26 -40 -20 -110 0 -120 Z M0 -120 C40 -116 52 -40 40 12 L26 54 L10 54 L18 12 C26 -40 20 -110 0 -120 Z" fill="#ff3d4f" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M-60 -10 Q0 4 60 -10" stroke="#1b1033" stroke-width="3" fill="none" opacity="0.4" />
        <path d="M-50 -70 Q-40 -102 -14 -110" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />
        <path d="M40 -60 Q50 -10 30 30" stroke="#b8860b" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.35" />
        <rect x="-20" y="80" width="40" height="28" rx="5" fill="#b77744" stroke="#1b1033" stroke-width="4" />
        <path d="M-16 90 h32 M-16 98 h32" stroke="#7d4a26" stroke-width="2.5" />
      </g>
    </g>

    <path d="M-60 640 Q200 540 460 600 Q700 520 980 590 Q1250 520 1500 585 Q1750 530 1980 600 L1980 780 L-60 780 Z" fill="#c3e8ad" stroke="#8cb79c" stroke-width="3" stroke-linejoin="round" />
    <path d="M-60 680 Q300 610 640 662 Q960 612 1300 662 Q1650 618 1980 670 L1980 780 L-60 780 Z" fill="#a2d886" stroke="#73a57e" stroke-width="3" stroke-linejoin="round" />
    <g fill="#6fb46a" stroke="#5a8f6a" stroke-width="3">
      <circle v-for="(t, i) in FAR_TREES" :key="`ft${i}`" :cx="t.x" :cy="t.y" :r="t.r" />
    </g>
    <rect x="-60" y="520" width="2040" height="230" fill="url(#g-haze)" />

    <path d="M-60 672 Q960 660 1980 676 L1980 1140 L-60 1140 Z" fill="url(#race-ground)" stroke="#1b1033" stroke-width="4" filter="url(#cel)" />

    <g>
      <path d="M-60 440 L612 440 L644 478 L-60 478 Z" fill="#ff3d4f" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M40 440 L72 478 M140 440 L172 478 M240 440 L272 478 M340 440 L372 478 M440 440 L472 478 M540 440 L572 478" stroke="#fff4e8" stroke-width="26" />
      <path d="M-60 440 L612 440 L644 478 L-60 478 Z" fill="none" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-40 446 L600 446" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      <rect x="-60" y="478" width="660" height="210" fill="url(#race-stand)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
      <path d="M120 478 V688 M340 478 V688 M580 478 V688" stroke="#2f3a78" stroke-width="10" />
      <template v-for="(row, r) in CROWD" :key="`row${r}`">
        <g stroke="#2a1d4a" stroke-width="2.5">
          <template v-for="(p, i) in row" :key="`p${r}-${i}`">
            <path :d="`M${f1(p.x - 12)} ${p.y} Q${f1(p.x - 12)} ${p.y - 22} ${f1(p.x)} ${p.y - 22} Q${f1(p.x + 12)} ${p.y - 22} ${f1(p.x + 12)} ${p.y} Z`" :fill="p.shirt" />
            <circle :cx="f1(p.x)" :cy="p.y - 30" r="9.5" :fill="p.skin" />
            <path v-if="p.hat" :d="`M${f1(p.x - 10)} ${p.y - 32} Q${f1(p.x)} ${p.y - 46} ${f1(p.x + 10)} ${p.y - 32} Z`" :fill="p.hat" />
          </template>
        </g>
        <rect x="-60" :y="ROW_Y(r) + 4" width="660" height="12" :fill="r % 2 ? '#ffd23f' : '#3ad6e0'" stroke="#1b1033" stroke-width="3" />
      </template>
      <path :d="FACES" stroke="#1b1033" stroke-width="3.5" stroke-linecap="round" />
      <g v-for="(g, gi) in WAVERS" :key="`wv${gi}`" class="race-wave" :style="{ animationDelay: `-${gi * 0.45}s` }">
        <g v-for="(p, i) in g" :key="`w${gi}-${i}`">
          <path :d="`M${f1(p.x + 8)} ${p.y - 16} L${f1(p.x + 18)} ${p.y - 44}`" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
          <path :d="`M${f1(p.x + 8)} ${p.y - 16} L${f1(p.x + 18)} ${p.y - 44}`" :stroke="p.skin" stroke-width="4" stroke-linecap="round" />
          <path :d="`M${f1(p.x + 18)} ${p.y - 40} V${p.y - 76}`" stroke="#1b1033" stroke-width="3" />
          <path :d="`M${f1(p.x + 18)} ${p.y - 76} L${f1(p.x + 46)} ${p.y - 68} L${f1(p.x + 18)} ${p.y - 58} Z`" :fill="p.flag" stroke="#1b1033" stroke-width="2.5" stroke-linejoin="round" />
        </g>
      </g>
      <rect x="-60" y="664" width="672" height="26" fill="#fff4e8" stroke="#1b1033" stroke-width="4" />
      <path d="M0 668 h60 v18 h-60 Z M140 668 h60 v18 h-60 Z M280 668 h60 v18 h-60 Z M420 668 h60 v18 h-60 Z M560 668 h52 v18 h-52 Z" fill="#ff3d4f" />
      <path d="M70 668 h60 v18 h-60 Z M210 668 h60 v18 h-60 Z M350 668 h60 v18 h-60 Z M490 668 h60 v18 h-60 Z" fill="#3a8cff" />
    </g>

    <g fill="none" stroke-linecap="round">
      <path v-for="(b, i) in BUNTING" :key="`bl${i}`" :d="b.line" stroke="#1b1033" stroke-width="2.5" />
    </g>
    <path d="M900 560 V688 M1180 560 V688" stroke="#1b1033" stroke-width="9" stroke-linecap="round" />
    <path d="M900 560 V688 M1180 560 V688" stroke="#e9e4f5" stroke-width="4" stroke-linecap="round" />
    <path v-for="(p, i) in PENNANTS" :key="`pn${i}`" :d="p.d" :fill="p.c" stroke="#1b1033" stroke-width="2.5" stroke-linejoin="round" />

    <g>
      <rect x="1250" y="560" width="440" height="128" fill="url(#race-garage)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
      <rect x="1236" y="546" width="468" height="20" rx="4" fill="#5a6fc0" stroke="#1b1033" stroke-width="4" />
      <g v-for="i in 3" :key="`bay${i}`" :transform="`translate(${1272 + (i - 1) * 142} 600)`">
        <rect x="0" y="0" width="114" height="88" fill="#2a2440" stroke="#1b1033" stroke-width="4" />
        <rect x="0" y="0" width="114" height="34" fill="#cfd6e8" stroke="#1b1033" stroke-width="4" />
        <path d="M4 10 h106 M4 20 h106" stroke="#8e96b8" stroke-width="3" />
        <path d="M0 -20 h114 l-8 16 h-98 Z" :fill="i === 2 ? '#3a8cff' : '#ff3d4f'" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M20 -20 l-4 16 M44 -20 l-2 16 M70 -20 l2 16 M94 -20 l4 16" stroke="#fff4e8" stroke-width="8" />
      </g>
      <path d="M1296 688 Q1300 664 1330 662 L1366 664 Q1380 670 1382 688 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="3.5" />
      <circle cx="1310" cy="684" r="7" fill="#1b1033" />
      <rect x="1560" y="478" width="120" height="70" rx="6" fill="#e9e4f5" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <rect x="1572" y="490" width="96" height="30" rx="4" fill="#7fd6ff" stroke="#1b1033" stroke-width="3.5" />
      <path d="M1582 512 L1600 494 M1600 514 L1614 500" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8" />
      <rect x="1552" y="466" width="136" height="16" rx="4" fill="#ff3d4f" stroke="#1b1033" stroke-width="4" />
      <path d="M1660 466 V376" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />
      <circle cx="1660" cy="372" r="6" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
      <g class="race-flag">
        <path d="M1662 380 Q1690 372 1714 382 Q1738 392 1760 384 L1760 432 Q1738 440 1714 430 Q1690 420 1662 428 Z" fill="#fff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M1662 380 Q1676 376 1686 377 L1686 401 Q1676 400 1662 404 Z M1710 381 Q1722 385 1736 389 L1736 413 Q1722 409 1710 405 Z M1686 401 Q1698 402 1710 405 L1710 429 Q1698 426 1686 425 Z M1736 413 Q1748 412 1760 408 L1760 432 Q1748 436 1736 437 Z" fill="#1b1033" />
      </g>
    </g>

    <path d="M-60 688 L1600 688 C1800 688 1960 740 1950 840 C1940 950 1800 1012 1560 1012 L-60 1012 L-60 880 L1520 880 C1700 880 1750 800 1690 762 C1660 740 1630 718 1580 718 L-60 718 Z" fill="url(#race-asphalt)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="MOW" fill="#ffffff" opacity="0.1" />
    <path d="M1720 760 Q1860 790 1840 880 M1700 780 Q1820 820 1790 900 M1500 960 Q1700 950 1820 900 M600 975 L1000 968 M700 990 L1080 984" stroke="#2a2440" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.22" />
    <path d="M-40 940 L1200 940" stroke="#b3afc8" stroke-width="3" stroke-dasharray="50 40" opacity="0.2" />
    <g fill="none">
      <path d="M-60 688 L1600 688" stroke="#fff" stroke-width="6" />
      <path d="M-60 688 L1600 688" stroke="#ff3d4f" stroke-width="6" stroke-dasharray="16 16" />
      <path d="M-60 718 L1580 718" stroke="#fff" stroke-width="6" />
      <path d="M-60 718 L1580 718" stroke="#ff3d4f" stroke-width="6" stroke-dasharray="16 16" />
      <path d="M1600 688 C1800 688 1960 740 1950 840 C1940 950 1800 1012 1560 1012" stroke="#fff" stroke-width="12" />
      <path d="M1600 688 C1800 688 1960 740 1950 840 C1940 950 1800 1012 1560 1012" stroke="#ff3d4f" stroke-width="12" stroke-dasharray="28 28" />
      <path d="M1520 880 C1700 880 1750 800 1690 762 C1660 740 1630 718 1580 718" stroke="#fff" stroke-width="10" />
      <path d="M1520 880 C1700 880 1750 800 1690 762 C1660 740 1630 718 1580 718" stroke="#ff3d4f" stroke-width="10" stroke-dasharray="24 24" />
      <path d="M-60 880 L1520 880" stroke="#fff" stroke-width="12" />
      <path d="M-60 880 L1520 880" stroke="#ff3d4f" stroke-width="12" stroke-dasharray="34 34" />
      <path d="M-60 1012 L1560 1012" stroke="#fff" stroke-width="18" />
      <path d="M-60 1012 L1560 1012" stroke="#ff3d4f" stroke-width="18" stroke-dasharray="48 48" />
      <path d="M-60 682 L1600 682 M-60 873 L1520 873 M-60 1003 L1560 1003" stroke="#1b1033" stroke-width="3" opacity="0.35" />
    </g>
    <path :d="LINE_OUTLINE" fill="#fff" />
    <path :d="LINE_CHECKS" fill="#1b1033" />
    <path :d="tufts(-20, 1040, 1700, 0.02)" stroke="#2f7a2a" stroke-width="5" fill="none" stroke-linecap="round" />
    <path :d="tufts(40, 860, 1400, 0.03)" stroke="#3f9a3c" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />

    <g v-for="(b, i) in BUSHES" :key="`bu${i}`" :transform="`translate(${b.x} 768) scale(${b.s})`">
      <ellipse cx="0" cy="2" rx="70" ry="9" fill="#1b2a10" opacity="0.25" />
      <path d="M-62 0 Q-74 -30 -40 -36 Q-30 -64 0 -58 Q30 -70 44 -38 Q74 -32 62 0 Z" fill="#3fae4a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-44 -26 Q-34 -42 -18 -44 M10 -50 Q24 -52 32 -42" stroke="#9be87a" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="-20" cy="-18" r="5" fill="#ff7ab0" stroke="#1b1033" stroke-width="2" />
      <circle cx="24" cy="-24" r="5" fill="#ffd23f" stroke="#1b1033" stroke-width="2" />
    </g>

    <g class="race-far">
      <g v-for="(k, i) in FAR_KARTS" :key="`fk${i}`" :transform="`translate(${k.x} 714) scale(-0.34 0.34)`">
        <ellipse cx="0" cy="0" rx="90" ry="10" fill="#1b1033" opacity="0.3" />
        <circle cx="-55" cy="-26" r="26" fill="#2a2636" stroke="#1b1033" stroke-width="8" />
        <circle cx="62" cy="-22" r="22" fill="#2a2636" stroke="#1b1033" stroke-width="8" />
        <path d="M-96 -28 L-84 -60 L-16 -62 L22 -50 L96 -46 Q114 -40 106 -24 L-84 -20 Z" :fill="k.body" stroke="#1b1033" stroke-width="8" stroke-linejoin="round" />
        <circle cx="-8" cy="-100" r="26" :fill="k.helmet" stroke="#1b1033" stroke-width="8" />
        <path d="M2 -110 Q22 -108 18 -94 L2 -94 Z" fill="#1b1033" />
        <path d="M-150 -70 h-90 M-160 -36 h-120" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>

    <g v-for="(s, i) in STACKS_BACK" :key="`sb${i}`">
      <g v-for="(t, k) in s.tyres" :key="`sbt${k}`">
        <rect :x="s.x - s.w / 2" :y="t.y" :width="s.w" :height="s.h" rx="8" fill="#2d2a3a" stroke="#1b1033" stroke-width="3.5" />
        <rect v-if="t.band" :x="s.x - s.w / 2 + 2" :y="t.y + s.h / 2 - 4" :width="s.w - 4" height="8" :fill="t.band" />
      </g>
      <ellipse :cx="s.x" :cy="s.top" :rx="s.w / 2" :ry="s.w * 0.17" fill="#3a3648" stroke="#1b1033" stroke-width="3.5" />
      <ellipse :cx="s.x" :cy="s.top" :rx="s.w * 0.26" :ry="s.w * 0.08" fill="#15121f" />
    </g>

    <g>
      <ellipse cx="1420" cy="866" rx="130" ry="12" fill="#1b2a10" opacity="0.3" />
      <rect x="1318" y="812" width="68" height="52" fill="#cfd6e8" stroke="#1b1033" stroke-width="4.5" filter="url(#cel-s)" />
      <rect x="1384" y="790" width="72" height="74" fill="#ffd23f" stroke="#1b1033" stroke-width="4.5" filter="url(#cel-s)" />
      <rect x="1454" y="826" width="66" height="38" fill="#e39a5a" stroke="#1b1033" stroke-width="4.5" filter="url(#cel-s)" />
      <path d="M1324 818 h56 M1390 796 h60 M1460 832 h54" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7" />
      <path d="M1420 812 l5 10 l11 1 l-8 7 l3 11 l-11 -6 l-11 6 l3 -11 l-8 -7 l11 -1 Z" fill="#fff4b0" stroke="#b8860b" stroke-width="2" stroke-linejoin="round" />
      <path d="M1396 742 Q1374 742 1378 758 Q1382 772 1400 768 M1444 742 Q1466 742 1462 758 Q1458 772 1440 768" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round" />
      <path d="M1396 742 Q1374 742 1378 758 Q1382 772 1400 768 M1444 742 Q1466 742 1462 758 Q1458 772 1440 768" stroke="#ffcc33" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M1394 732 h52 Q1446 772 1426 778 V784 h10 v6 h-32 v-6 h10 V778 Q1394 772 1394 732 Z" fill="url(#race-gold)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M1402 742 Q1402 762 1412 770" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85" />
      <ellipse cx="1420" cy="732" rx="26" ry="5" fill="#d58a12" stroke="#1b1033" stroke-width="3" />
    </g>
    <g class="race-sparkle">
      <path v-for="(s, i) in SPARKLES" :key="`sp${i}`" :d="SPARKLE" :transform="`translate(${s[0]} ${s[1]}) scale(${s[2]})`" fill="#fff8c8" stroke="#ffb02e" stroke-width="2" />
    </g>

    <g v-for="(c, i) in CONES.slice(0, 2)" :key="`cb${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.k})`">
      <ellipse cx="0" cy="2" rx="30" ry="7" fill="#1b2a10" opacity="0.3" />
      <rect x="-26" y="-8" width="52" height="10" rx="3" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" />
      <path d="M-18 -8 L-6 -64 L6 -64 L18 -8 Z" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-13 -30 L13 -30 L10 -44 L-10 -44 Z" fill="#fff" />
      <path d="M-8 -16 L-2 -56" stroke="#ffd0a8" stroke-width="3" stroke-linecap="round" />
    </g>

    <path d="M534 610 V884" stroke="#1b1033" stroke-width="22" stroke-linecap="round" />
    <path d="M534 610 V884" stroke="#cfd6e8" stroke-width="14" stroke-linecap="round" />
    <path d="M530 616 V878" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    <rect x="518" y="872" width="32" height="14" rx="3" fill="#5a6fc0" stroke="#1b1033" stroke-width="3.5" />
    <path :d="quad(beamPt, 0, 0, 1, 1)" fill="#fff" />
    <path :d="BEAM_CHECKS" fill="#1b1033" />
    <path :d="quad(beamPt, 0, 0, 1, 1)" fill="none" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path :d="`M${BEAM.ax} ${BEAM.ay - 6} L${BEAM.bx} ${BEAM.by - 6}`" stroke="#ff3d4f" stroke-width="10" stroke-linecap="round" />
    <g v-for="(l, i) in LIGHTS" :key="`lt${i}`" :transform="`translate(${f1(l[0])} ${f1(l[1])})`">
      <rect x="-11" y="0" width="22" height="44" rx="6" fill="#2a2440" stroke="#1b1033" stroke-width="3.5" />
      <circle cx="0" cy="12" r="6.5" fill="#ff3d4f" />
      <circle cx="0" cy="31" r="6.5" fill="#1d4a34" />
    </g>
    <g class="race-go">
      <circle v-for="(l, i) in LIGHTS" :key="`go${i}`" :cx="f1(l[0])" :cy="f1(l[1] + 31)" r="7" fill="#5dff9a" />
    </g>

    <g class="race-pack">
      <g v-for="(k, i) in KARTS" :key="`k${i}`" :transform="`translate(${k.x} ${k.y}) scale(${k.k})`">
        <ellipse cx="0" cy="0" rx="96" ry="11" fill="#1b1033" opacity="0.3" />
        <g class="race-rumble" :style="{ animationDelay: `-${k.d}s` }">
          <path d="M-130 -76 h-90 M-140 -44 h-130 M-124 -14 h-70" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.75" />
          <path d="M-98 -84 L-80 -84 L-72 -60 L-86 -58 Z" fill="#1b1033" />
          <rect x="-116" y="-96" width="44" height="14" rx="4" :fill="k.dark" stroke="#1b1033" stroke-width="4.5" />
          <circle cx="-55" cy="-26" r="27" fill="#2a2636" stroke="#1b1033" stroke-width="5" />
          <circle cx="-55" cy="-26" r="11" fill="#c9c4dc" stroke="#1b1033" stroke-width="3" />
          <path d="M-72 -40 Q-66 -48 -56 -50" stroke="#6a6488" stroke-width="4" fill="none" stroke-linecap="round" />
          <circle cx="62" cy="-22" r="23" fill="#2a2636" stroke="#1b1033" stroke-width="5" />
          <circle cx="62" cy="-22" r="9" fill="#c9c4dc" stroke="#1b1033" stroke-width="3" />
          <path d="M-96 -28 L-84 -60 L-16 -62 L22 -50 L96 -46 Q114 -40 106 -24 L-84 -20 Z" :fill="k.body" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
          <path d="M-84 -26 L104 -30 Q106 -24 104 -24 L-84 -20 Z" :fill="k.dark" />
          <path d="M-78 -54 L-20 -56 M26 -44 L92 -41" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.6" />
          <path d="M-40 -42 L60 -38" :stroke="k.stripe" stroke-width="7" stroke-linecap="round" />
          <path d="M-34 -58 Q-34 -88 -8 -90 Q14 -88 12 -58 Z" :fill="k.suit" stroke="#1b1033" stroke-width="4.5" />
          <path d="M4 -76 L34 -68" stroke="#1b1033" stroke-width="10" stroke-linecap="round" />
          <path d="M4 -76 L34 -68" :stroke="k.suit" stroke-width="5" stroke-linecap="round" />
          <ellipse cx="38" cy="-68" rx="5" ry="12" fill="#2a2440" stroke="#1b1033" stroke-width="3" />
          <circle cx="-8" cy="-104" r="25" :fill="k.helmet" stroke="#1b1033" stroke-width="5" />
          <path d="M-30 -110 Q-8 -126 14 -116" :stroke="k.stripe" stroke-width="7" fill="none" stroke-linecap="round" />
          <path d="M0 -114 Q20 -114 20 -102 Q20 -92 0 -94 Z" fill="#1b1033" />
          <path d="M6 -108 L14 -108" stroke="#7fd6ff" stroke-width="4" stroke-linecap="round" />
          <path d="M-24 -116 Q-18 -124 -8 -126" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85" />
        </g>
      </g>
    </g>

    <path d="M362 680 V1036" stroke="#1b1033" stroke-width="30" stroke-linecap="round" />
    <path d="M362 680 V1036" stroke="#cfd6e8" stroke-width="20" stroke-linecap="round" />
    <path d="M356 688 V1028" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
    <path d="M370 700 V1028" stroke="#8e96b8" stroke-width="5" stroke-linecap="round" opacity="0.6" />
    <ellipse cx="362" cy="1046" rx="44" ry="8" fill="#1b2a10" opacity="0.3" />
    <rect x="340" y="1022" width="44" height="20" rx="4" fill="#5a6fc0" stroke="#1b1033" stroke-width="4" />

    <g fill="#1f5a2e" stroke="#0b1a12" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-40 960 90 920 Q60 1000 140 980 Q200 1020 230 1140 Z" />
      <path d="M1980 1140 Q1990 940 1860 900 Q1880 980 1780 960 Q1700 1000 1690 1140 Z" />
    </g>
    <g v-for="(s, i) in STACKS_FRONT" :key="`sf${i}`">
      <g v-for="(t, k) in s.tyres" :key="`sft${k}`">
        <rect :x="s.x - s.w / 2" :y="t.y" :width="s.w" :height="s.h" rx="16" fill="#2d2a3a" stroke="#1b1033" stroke-width="5" />
        <rect v-if="t.band" :x="s.x - s.w / 2 + 3" :y="t.y + s.h / 2 - 8" :width="s.w - 6" height="16" :fill="t.band" />
        <path :d="`M${s.x - s.w / 2 + 14} ${t.y + 10} Q${s.x - s.w / 4} ${t.y + 5} ${s.x} ${t.y + 6}`" stroke="#5a5672" stroke-width="5" fill="none" stroke-linecap="round" />
      </g>
      <ellipse :cx="s.x" :cy="s.top" :rx="s.w / 2" :ry="s.w * 0.17" fill="#3a3648" stroke="#1b1033" stroke-width="5" />
      <ellipse :cx="s.x" :cy="s.top" :rx="s.w * 0.26" :ry="s.w * 0.08" fill="#15121f" />
    </g>
    <g v-for="(c, i) in CONES.slice(2)" :key="`cf${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.k})`">
      <ellipse cx="0" cy="2" rx="34" ry="8" fill="#0f2a10" opacity="0.3" />
      <rect x="-28" y="-10" width="56" height="12" rx="3" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" />
      <path d="M-20 -10 L-6 -72 L6 -72 L20 -10 Z" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-14 -34 L14 -34 L11 -50 L-11 -50 Z" fill="#fff" />
      <path d="M-9 -18 L-2 -62" stroke="#ffd0a8" stroke-width="3" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.race-blimp {
  animation: race-blimp 140s linear infinite;
  animation-delay: -40s;
}

.race-balloon {
  animation: race-bob 5s ease-in-out infinite alternate;
}

.race-wave {
  animation: race-wave 0.9s ease-in-out infinite alternate;
}

.race-flag {
  transform-box: fill-box;
  transform-origin: left center;
  animation: race-flutter 1.4s ease-in-out infinite alternate;
}

.race-sparkle {
  animation: race-sparkle 2.2s ease-in-out infinite alternate;
}

.race-go {
  animation: race-go 6s steps(1) infinite;
}

/* one 12s lap: the near pack crosses first, then the same colours reappear small on the back straight */
.race-pack {
  animation: race-pack 12s linear infinite;
}

.race-far {
  animation: race-far 12s linear infinite;
}

.race-rumble {
  animation: race-rumble 0.18s ease-in-out infinite alternate;
}

@keyframes race-blimp {
  from {
    translate: -300px 0;
  }
  to {
    translate: 2300px 0;
  }
}

@keyframes race-bob {
  from {
    translate: 0 -10px;
  }
  to {
    translate: 0 14px;
  }
}

@keyframes race-wave {
  from {
    translate: 0 4px;
  }
  to {
    translate: 0 -6px;
  }
}

@keyframes race-flutter {
  from {
    scale: 1 1;
  }
  to {
    scale: 0.9 1.06;
  }
}

@keyframes race-sparkle {
  from {
    opacity: 0.15;
  }
  to {
    opacity: 1;
  }
}

@keyframes race-go {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes race-pack {
  0% {
    translate: -700px 0;
  }
  50% {
    translate: 2400px 0;
  }
  100% {
    translate: 2400px 0;
  }
}

@keyframes race-far {
  0%,
  55% {
    translate: 1700px 0;
    opacity: 0;
  }
  56% {
    opacity: 1;
  }
  100% {
    translate: -320px 0;
    opacity: 1;
  }
}

@keyframes race-rumble {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -3px;
  }
}
</style>
