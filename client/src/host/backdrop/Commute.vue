<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(6113);
const f1 = (n: number) => n.toFixed(1);
const circle = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;

const cloud = (cx: number, cy: number, w: number) =>
  [
    [-0.8, 0, 0.36],
    [-0.4, -0.28, 0.46],
    [0.12, -0.42, 0.52],
    [0.6, -0.2, 0.42],
    [0.92, 0.04, 0.3],
    [0, 0.06, 0.5],
  ]
    .map(([x = 0, y = 0, r = 0]) => circle(cx + x * w, cy + y * w, r * w))
    .join(' ');
const CLOUDS = [cloud(440, 170, 100), cloud(1060, 110, 80), cloud(1640, 250, 64)].join(' ');

// far skyline: every block and every lit window folds into two paths
const HORIZON = 770;
const FAR: { x: number; w: number; h: number }[] = [];
for (let x = -60; x < 1980; ) {
  const w = 70 + rnd() * 90;
  FAR.push({ x, w, h: 130 + rnd() * 210 });
  x += w - 8;
}
const FAR_BLOCKS = FAR.map((b) => `M${f1(b.x)} ${HORIZON} V${f1(HORIZON - b.h)} H${f1(b.x + b.w)} V${HORIZON} Z`).join(' ');
const FAR_WINDOWS = FAR.flatMap((b) => {
  const out: string[] = [];
  for (let wy = HORIZON - b.h + 20; wy < HORIZON - 40; wy += 34) {
    for (let wx = b.x + 14; wx < b.x + b.w - 20; wx += 26) {
      if (rnd() < 0.55) out.push(`M${f1(wx)} ${f1(wy)} h10 v14 h-10 Z`);
    }
  }
  return out;
}).join(' ');

const NEAR = [
  { x: -60, w: 230, top: 250, c: '#e98a6a' },
  { x: 150, w: 170, top: 340, c: '#f3c46e' },
  { x: 1290, w: 200, top: 300, c: '#8fb8e8' },
  { x: 1470, w: 250, top: 210, c: '#e98a6a' },
  { x: 1700, w: 300, top: 330, c: '#b8a0e0' },
];
const NEAR_WINDOWS = NEAR.flatMap((b) => {
  const out: string[] = [];
  for (let wy = b.top + 36; wy < HORIZON - 70; wy += 64) {
    for (let wx = b.x + 26; wx < b.x + b.w - 40; wx += 54) out.push(`M${wx} ${wy} h30 v40 h-30 Z`);
  }
  return out;
}).join(' ');
const NEAR_GLINTS = NEAR.flatMap((b) => {
  const out: string[] = [];
  for (let wy = b.top + 36; wy < HORIZON - 70; wy += 64) {
    for (let wx = b.x + 26; wx < b.x + b.w - 40; wx += 54) if (rnd() < 0.35) out.push(`M${wx + 6} ${wy + 30} L${wx + 22} ${wy + 8}`);
  }
  return out;
}).join(' ');

const TREES = [
  { x: 770, y: 690, r: 58 },
  { x: 980, y: 676, r: 66 },
  { x: 1180, y: 694, r: 54 },
];
const TREE_CROWNS = TREES.map((t) => [circle(t.x, t.y, t.r), circle(t.x - t.r * 0.6, t.y + t.r * 0.25, t.r * 0.62), circle(t.x + t.r * 0.62, t.y + t.r * 0.2, t.r * 0.6)].join(' ')).join(' ');
const TREE_LIGHT = TREES.map((t) => circle(t.x - t.r * 0.25, t.y - t.r * 0.3, t.r * 0.42)).join(' ');

const DASHES = Array.from({ length: 14 }, (_, i) => `M${-40 + i * 150} 826 h80`).join(' ');
const PAVING = [
  ...Array.from({ length: 11 }, (_, i) => `M${-60 + i * 200} 904 L${-140 + i * 220} 1080`),
  'M-60 960 H1980 M-60 1030 H1980',
].join(' ');

const TIMETABLE_ROWS = Array.from({ length: 6 }, (_, i) => `M86 ${618 + i * 18} h${40 + ((i * 29) % 34)} M150 ${618 + i * 18} h24`).join(' ');

const BUS_WINDOWS = [1454, 1546, 1638, 1730];
const BUS_HEADS = [
  [1490, 690, '#5b4b8a'],
  [1606, 696, '#c25a4a'],
  [1694, 688, '#2f6a8a'],
  [1772, 694, '#7a4a2a'],
] as const;

type Rider = { x: number; body: string; head: string; skin: string };
const RIDERS: Rider[] = [
  { x: 340, body: '#5b6fc0', head: '#3a2a1a', skin: '#f2c8a0' },
  { x: 448, body: '#e06a58', head: '#e0b040', skin: '#d89a70' },
  { x: 560, body: '#3fa078', head: '#1b1033', skin: '#a8704a' },
];

const PIGEONS = [
  { x: 330, y: 546, flip: 1, d: 0 },
  { x: 410, y: 546, flip: -1, d: -0.5 },
  { x: 760, y: 968, flip: 1, d: -1.1 },
  { x: 856, y: 984, flip: -1, d: -0.3 },
];

const smokePuff = (x: number, y: number, r: number) => [circle(x, y, r), circle(x + r * 0.8, y - r * 0.3, r * 0.7), circle(x + r * 0.4, y + r * 0.5, r * 0.6)].join(' ');
const EXHAUST = [0, 1, 2].map(() => smokePuff(1838, 832, 14));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="commute-road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a8ea8" />
        <stop offset="100%" stop-color="#5c6080" />
      </linearGradient>
      <linearGradient id="commute-walk" gradientUnits="userSpaceOnUse" x1="0" y1="890" x2="0" y2="1140">
        <stop offset="0%" stop-color="#f1e2cc" />
        <stop offset="100%" stop-color="#c9b098" />
      </linearGradient>
      <linearGradient id="commute-bus" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffd85a" />
        <stop offset="100%" stop-color="#f2952e" />
      </linearGradient>
      <linearGradient id="commute-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#eefaff" />
        <stop offset="100%" stop-color="#7ab8e0" />
      </linearGradient>
      <linearGradient id="commute-roof" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5cc8b8" />
        <stop offset="100%" stop-color="#22807a" />
      </linearGradient>
      <radialGradient id="commute-sun">
        <stop offset="0%" stop-color="#fff6cc" stop-opacity="0.9" />
        <stop offset="45%" stop-color="#ffe7a0" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#ffe7a0" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-commute)" />
    <circle cx="1260" cy="210" r="210" fill="url(#commute-sun)" />
    <circle cx="1260" cy="210" r="64" fill="#fff4c0" stroke="#f0c060" stroke-width="4" />
    <path class="commute-clouds" :d="CLOUDS" fill="#ffffff" stroke="#b6d0ea" stroke-width="4" />

    <path :d="FAR_BLOCKS" fill="#c4cdea" stroke="#94a2cc" stroke-width="3" stroke-linejoin="round" />
    <path :d="FAR_WINDOWS" fill="#e8eeff" />

    <g stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
      <rect v-for="(b, i) in NEAR" :key="`nb${i}`" :x="b.x" :y="b.top" :width="b.w" :height="HORIZON - b.top" :fill="b.c" filter="url(#cel)" />
    </g>
    <path :d="NEAR_WINDOWS" fill="url(#commute-glass)" stroke="#1b1033" stroke-width="3" />
    <path :d="NEAR_GLINTS" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7" />

    <path d="M770 770 V700 M980 770 V690 M1180 770 V710" stroke="#7a4a2a" stroke-width="14" stroke-linecap="round" />
    <path :d="TREE_CROWNS" fill="#6cbf6a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="TREE_LIGHT" fill="#a8e08a" />

    <rect x="-60" y="770" width="2040" height="112" fill="url(#commute-road)" />
    <path d="M-60 770 H1980" stroke="#1b1033" stroke-width="4" />
    <path :d="DASHES" stroke="#fff8e0" stroke-width="8" stroke-linecap="round" />
    <rect x="-60" y="880" width="2040" height="20" fill="#e2dcef" stroke="#1b1033" stroke-width="4" />
    <rect x="-60" y="900" width="2040" height="240" fill="url(#commute-walk)" />
    <path :d="PAVING" stroke="#b49c84" stroke-width="3" opacity="0.6" />

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <path d="M140 900 V560" stroke-width="12" />
      <path d="M140 900 V560" stroke="#9aa4c0" stroke-width="5" />
      <rect x="70" y="586" width="140" height="150" rx="8" fill="#fffdf4" stroke-width="5" filter="url(#cel-s)" />
      <rect x="70" y="586" width="140" height="22" rx="6" fill="#3d7ac0" stroke-width="4" />
      <path :d="TIMETABLE_ROWS" stroke="#7a86a8" stroke-width="5" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <rect x="268" y="596" width="352" height="232" fill="url(#commute-glass)" opacity="0.55" stroke-width="4" />
      <path d="M300 640 L340 600 M330 680 L410 600 M560 700 L600 660" stroke="#ffffff" stroke-width="8" opacity="0.6" />
      <path d="M262 900 V560 M626 900 V560" stroke-width="12" />
      <path d="M262 900 V560 M626 900 V560" stroke="#b8c2dc" stroke-width="5" />
      <path d="M232 560 H656 L640 590 H248 Z" fill="url(#commute-roof)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="560" y="470" width="78" height="70" rx="8" fill="#ffd34a" stroke-width="5" />
      <path d="M582 526 L599 484 L616 526 M588 512 H610" fill="none" stroke-width="6" />
      <path d="M599 540 V560" stroke-width="6" />
      <rect x="292" y="806" width="300" height="20" rx="6" fill="#d88a4a" stroke-width="4" />
      <path d="M312 826 V870 M572 826 V870" stroke-width="7" />
    </g>

    <g v-for="r in RIDERS" :key="r.x" :transform="`translate(${r.x} 0)`" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path d="M-30 892 V740 Q-30 706 0 706 Q30 706 30 740 V892 Z" :fill="r.body" />
      <path d="M-20 892 V820 M20 892 V820" stroke="#1b1033" stroke-width="3" opacity="0.5" />
      <circle cx="0" cy="682" r="24" :fill="r.skin" />
      <path d="M-24 680 Q-22 654 0 654 Q24 654 24 680 Q12 668 -24 680 Z" :fill="r.head" />
    </g>
    <rect x="532" y="740" width="18" height="28" rx="4" fill="#2a2450" stroke="#1b1033" stroke-width="3" transform="rotate(-12 541 754)" />
    <path d="M340 760 h-44 v60" fill="none" stroke="#1b1033" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M340 760 h-44 v60" fill="none" stroke="#5b6fc0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="280" y="812" width="34" height="40" rx="6" fill="#c2884a" stroke="#1b1033" stroke-width="4" />

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <path d="M1870 900 V420" stroke-width="12" />
      <path d="M1870 900 V420" stroke="#9aa4c0" stroke-width="5" />
      <circle cx="1870" cy="350" r="62" fill="#ffffff" stroke-width="6" filter="url(#cel-s)" />
      <path d="M1836 380 V322 L1870 358 L1904 322 V380" fill="none" stroke="#e0402e" stroke-width="13" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <path d="M1290 862 Q1280 842 1300 840 L1810 840 Q1830 842 1824 862 Z" fill="#000" opacity="0.18" stroke="none" />
      <rect x="1260" y="586" width="570" height="256" rx="30" fill="url(#commute-bus)" stroke-width="6" filter="url(#cel)" />
      <rect x="1260" y="752" width="570" height="24" fill="#e0503e" stroke-width="4" />
      <rect x="1278" y="598" width="134" height="30" rx="6" fill="#2a2450" stroke-width="4" />
      <path d="M1296 613 h24 M1334 613 h20 M1366 613 h30" stroke="#ffb030" stroke-width="7" />
      <path d="M1272 640 H1356 V740 H1286 Q1272 740 1272 724 Z" fill="url(#commute-glass)" stroke-width="5" />
      <rect x="1370" y="640" width="70" height="196" rx="4" fill="url(#commute-glass)" stroke-width="5" />
      <path d="M1405 640 V836" stroke-width="4" />
      <rect v-for="x in BUS_WINDOWS" :key="x" :x="x" y="640" width="80" height="94" rx="6" fill="url(#commute-glass)" stroke-width="5" />
      <circle v-for="[x, y, c] in BUS_HEADS" :key="x" :cx="x" :cy="y + 30" r="18" :fill="c" stroke-width="3" />
      <path d="M1290 662 L1318 640 M1470 660 L1494 640 M1654 660 L1678 640 M1384 680 L1418 646" stroke="#ffffff" stroke-width="7" opacity="0.7" />
      <circle cx="1280" cy="802" r="14" fill="#fff8d0" stroke-width="4" />
      <rect x="1820" y="786" width="14" height="30" rx="4" fill="#e0402e" stroke-width="3" />
      <path d="M1294 842 a64 64 0 0 1 128 0 Z M1644 842 a64 64 0 0 1 128 0 Z" fill="#3a3456" stroke-width="5" />
      <circle cx="1358" cy="848" r="44" fill="#2a2450" stroke-width="5" />
      <circle cx="1708" cy="848" r="44" fill="#2a2450" stroke-width="5" />
      <circle cx="1358" cy="848" r="18" fill="#c8cee0" stroke-width="4" />
      <circle cx="1708" cy="848" r="18" fill="#c8cee0" stroke-width="4" />
    </g>
    <circle class="commute-blink" cx="1268" cy="770" r="9" fill="#ffb030" stroke="#1b1033" stroke-width="3" />
    <path v-for="(d, i) in EXHAUST" :key="`ex${i}`" class="commute-exhaust" :style="{ animationDelay: `${-i * 1.4}s` }" :d="d" fill="#eef0f8" stroke="#a8aec8" stroke-width="3" />

    <g v-for="(p, i) in PIGEONS" :key="`pg${i}`" :transform="`translate(${p.x} ${p.y}) scale(${p.flip} 1)`" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
      <path d="M-30 -4 L-44 -14 L-40 2 Z" fill="#7a8098" />
      <path d="M-34 -6 Q-30 -30 0 -28 Q20 -26 20 -10 Q16 6 -10 6 Q-30 6 -34 -6 Z" fill="#a8b0c6" />
      <path d="M-20 -16 Q-6 -24 6 -14" fill="none" stroke="#7a8098" stroke-width="3" />
      <path d="M-4 6 V14 M6 6 V14" stroke="#e07050" stroke-width="3" />
      <g class="commute-peck" :style="{ animationDelay: `${p.d}s` }">
        <circle cx="20" cy="-30" r="11" fill="#8a90b0" />
        <path d="M30 -32 L38 -28 L30 -25 Z" fill="#f0a040" stroke-width="2" />
        <circle cx="23" cy="-33" r="2" fill="#1b1033" stroke="none" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.commute-clouds {
  animation: commute-drift 46s ease-in-out infinite alternate;
}

.commute-blink {
  animation: commute-blink 1s steps(2) infinite;
}

.commute-exhaust {
  transform-box: fill-box;
  transform-origin: center;
  animation: commute-exhaust 4.2s ease-out infinite;
}

.commute-peck {
  animation: commute-peck 2.6s ease-in-out infinite;
}

@keyframes commute-drift {
  from {
    translate: -60px 0;
  }
  to {
    translate: 60px 0;
  }
}

@keyframes commute-blink {
  to {
    opacity: 0.15;
  }
}

@keyframes commute-exhaust {
  0% {
    translate: 0 0;
    scale: 0.4;
    opacity: 0;
  }
  15% {
    opacity: 0.9;
  }
  100% {
    translate: 80px -70px;
    scale: 1.6;
    opacity: 0;
  }
}

@keyframes commute-peck {
  0%,
  60%,
  100% {
    translate: 0 0;
  }
  70% {
    translate: 8px 14px;
  }
  78% {
    translate: 0 0;
  }
  86% {
    translate: 8px 14px;
  }
}
</style>
