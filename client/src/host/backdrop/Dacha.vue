<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(4339);
const f1 = (n: number) => n.toFixed(1);
const circle = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;

// far tree line: one fill and one rim path, so the whole horizon is a handful of nodes
const FAR_PUFFS = Array.from({ length: 46 }, (_, i) => ({ x: -60 + i * 46 + rnd() * 20, y: 690 - rnd() * 30, r: 34 + rnd() * 30 }));
const FAR_TREES = `${FAR_PUFFS.map((p) => circle(p.x, p.y, p.r)).join(' ')} M-60 690 H1980 V780 H-60 Z`;
const FAR_LIGHT = FAR_PUFFS.filter((_, i) => i % 2 === 0)
  .map((p) => circle(p.x - p.r * 0.25, p.y - p.r * 0.3, p.r * 0.5))
  .join(' ');
const FAR_BIRCHES = [130, 610, 1010, 1390, 1690].map((x) => `M${x} 740 V${f1(680 - rnd() * 20)} M${x + 26} 740 V${f1(690 - rnd() * 20)}`).join(' ');

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
const CLOUDS = [cloud(560, 190, 130), cloud(1280, 130, 110), cloud(1520, 400, 70)].join(' ');
const CLOUD_SHADE = [
  [560, 230, 150],
  [1280, 166, 120],
  [1520, 424, 76],
]
  .map(([x = 0, y = 0, w = 0]) => `M${x - w} ${y} Q${x} ${y + w * 0.3} ${x + w} ${y} Q${x} ${y + w * 0.14} ${x - w} ${y} Z`)
  .join(' ');

const puffs = (cx: number, cy: number, n: number, spread: number, r: number) =>
  Array.from({ length: n }, () => circle(cx + (rnd() - 0.5) * spread * 2, cy + (rnd() - 0.5) * spread, r * (0.6 + rnd() * 0.6))).join(' ');
type Cluster = [number, number, number];
const APPLE_CLUSTERS: Cluster[] = [
  [1730, 470, 80],
  [1770, 350, 130],
  [1910, 250, 150],
  [1960, 470, 120],
  [1840, 540, 100],
];
const CROWN = {
  deep: APPLE_CLUSTERS.map(([x, y, s]) => puffs(x + 12, y + 18, 7, s, s * 0.44)).join(' '),
  mid: APPLE_CLUSTERS.map(([x, y, s]) => puffs(x, y, 8, s, s * 0.36)).join(' '),
  light: APPLE_CLUSTERS.map(([x, y, s]) => puffs(x - 16, y - 18, 5, s * 0.7, s * 0.22)).join(' '),
};
const APPLES = [
  [1672, 500],
  [1716, 420],
  [1770, 548],
  [1820, 392],
  [1880, 320],
  [1936, 520],
  [1740, 300],
  [1868, 590],
  [1960, 380],
  [1800, 470],
];

const FENCE_X = Array.from({ length: 27 }, (_, i) => 760 + i * 28);
const PICKETS = FENCE_X.map((x) => `M${x} 812 V748 L${x + 9} 734 L${x + 18} 748 V812 Z`).join(' ');
const PICKET_GRAIN = FENCE_X.filter((_, i) => i % 3 === 1)
  .map((x) => `M${x + 6} 800 v-${18 + (x % 5) * 4}`)
  .join(' ');

const FAR_HOUSES = [
  { x: 860, w: 70, h: 44, wall: '#eccdb0', roof: '#d9a294' },
  { x: 1000, w: 90, h: 54, wall: '#dfe0c2', roof: '#a8b8c8' },
  { x: 1112, w: 62, h: 40, wall: '#f0d6b8', roof: '#c8a0a8' },
];

const FACADE_LOGS = Array.from({ length: 9 }, (_, i) => 556 + i * 28);
const GABLE_BOARDS = Array.from({ length: 13 }, (_, i) => {
  const x = 114 + i * 26;
  return `M${x} 530 V${f1(372 + Math.abs(x - 270) * (158 / 180) + 6)}`;
}).join(' ');
const lerp = (a: number[], b: number[], t: number) => [a[0]! + (b[0]! - a[0]!) * t, a[1]! + (b[1]! - a[1]!) * t];
const ROOF_SEAMS = [0.2, 0.4, 0.6, 0.8]
  .map((t) => {
    const top = lerp([270, 344], [340, 304], t);
    const bot = lerp([478, 552], [560, 500], t);
    return `M${top.map(f1).join(' ')} L${bot.map(f1).join(' ')}`;
  })
  .join(' ');
const WINDOWS = [182, 358];
const SILL_SCALLOPS = `M-60 68 ${'a10 10 0 0 0 20 0 '.repeat(6)}Z`;

const BANYA_LOGS = Array.from({ length: 5 }, (_, i) => 676 + i * 26);
const WOODPILE = Array.from({ length: 9 }, (_, i) => ({ x: 1772 + (i % 3) * 18 + (Math.floor(i / 3) % 2) * 9, y: 790 - Math.floor(i / 3) * 16 }));

function petals(r: number, n: number, rot: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    const [ri, w] = [r * 0.5, r * 0.22];
    const [mx, my] = [(c * (ri + r)) / 2, (s * (ri + r)) / 2];
    d += `M${f1(c * ri)} ${f1(s * ri)} Q${f1(mx - s * w)} ${f1(my + c * w)} ${f1(c * r)} ${f1(s * r)} Q${f1(mx + s * w)} ${f1(my - c * w)} ${f1(c * ri)} ${f1(s * ri)} Z `;
  }
  return d;
}
const SEEDS = [
  [-0.2, -0.2],
  [0.16, -0.24],
  [0, 0.04],
  [-0.26, 0.14],
  [0.24, 0.1],
  [0.04, 0.3],
  [-0.06, -0.36],
];
const SUNFLOWERS = [
  { x: 812, y: 676, r: 42, lean: -14 },
  { x: 876, y: 624, r: 50, lean: 6 },
  { x: 944, y: 706, r: 36, lean: 18 },
].map((f) => ({
  ...f,
  back: petals(f.r, 14, Math.PI / 14),
  front: petals(f.r * 0.92, 14, 0),
  seeds: SEEDS.map(([x = 0, y = 0]) => `M${f1(x * f.r)} ${f1(y * f.r)} h0.1`).join(' '),
}));

const TOMATO_STAKES = [1004, 1060, 1116];
const TOMATO_LEAVES = TOMATO_STAKES.map((x) => puffs(x, 818, 6, 26, 22)).join(' ');
const TOMATOES = TOMATO_STAKES.flatMap((x, i) => [
  [x - 16, 800 + i * 6, 10],
  [x + 14, 830 - i * 4, 11],
  [x - 4, 852, 9],
]);
const GH_PLANTS = [1222, 1268, 1330, 1380, 1420].map((x) => puffs(x, 790, 4, 18, 18)).join(' ');

const CABBAGES = Array.from({ length: 9 }, (_, i) => ({ x: 610 + i * 84, y: 980 + (i % 2) * 6, k: 0.9 + rnd() * 0.25 }));
const SKEWER_CHUNKS = [-84, -50, -16, 18, 52, 86];

const DAISIES = [
  ...Array.from({ length: 16 }, () => [30 + rnd() * 460, 850 + rnd() * 50]),
  ...Array.from({ length: 14 }, () => [1150 + rnd() * 380, 880 + rnd() * 60]),
  ...Array.from({ length: 10 }, () => [220 + rnd() * 1500, 1080 + rnd() * 40]),
];
const DAISY_PETALS = DAISIES.map(([x = 0, y = 0]) => `${circle(x - 4, y, 3.5)} ${circle(x + 4, y, 3.5)} ${circle(x, y - 4, 3.5)} ${circle(x, y + 4, 3.5)}`).join(' ');
const DAISY_HEARTS = DAISIES.map(([x = 0, y = 0]) => `M${f1(x)} ${f1(y)} h0.1`).join(' ');

const smokePuff = (x: number, y: number, r: number) => [circle(x, y, r), circle(x - r * 0.7, y + r * 0.4, r * 0.7), circle(x + r * 0.75, y + r * 0.3, r * 0.75)].join(' ');
const BANYA_SMOKE = [0, 1, 2].map(() => smokePuff(1562, 494, 20));
const GRILL_SMOKE = [0, 1].map((i) => smokePuff(220 + i * 60, 880, 18));
const SWALLOWS = [
  [0, 0, 1],
  [70, -26, 0.8],
  [128, 12, 0.9],
];
const BUTTERFLIES = [
  { x: 470, y: 900, c: '#fffaf0', spot: '#1b1033', s: 11, d: 0 },
  { x: 1500, y: 870, c: '#ff9a2e', spot: '#7a2a10', s: 13, d: 4 },
];
const BEES = [
  [930, 590],
  [990, 660],
  [770, 620],
];
</script>

<template>
  <g>
    <defs>
      <radialGradient id="dacha-sun">
        <stop offset="0%" stop-color="#fff8d0" stop-opacity="0.95" />
        <stop offset="40%" stop-color="#fff0a8" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#fff0a8" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="dacha-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6d8" stop-opacity="0" />
        <stop offset="60%" stop-color="#fff6d8" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#fff6d8" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="dacha-grass" gradientUnits="userSpaceOnUse" x1="0" y1="780" x2="0" y2="1140">
        <stop offset="0%" stop-color="#a8d86a" />
        <stop offset="100%" stop-color="#5a9a3a" />
      </linearGradient>
      <linearGradient id="dacha-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5e9e40" />
        <stop offset="100%" stop-color="#2e6a2e" />
      </linearGradient>
      <linearGradient id="dacha-log" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4bc72" />
        <stop offset="100%" stop-color="#b8723a" />
      </linearGradient>
      <linearGradient id="dacha-log-side" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c8864a" />
        <stop offset="100%" stop-color="#8a5028" />
      </linearGradient>
      <linearGradient id="dacha-log-dark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c47a44" />
        <stop offset="100%" stop-color="#7a4224" />
      </linearGradient>
      <linearGradient id="dacha-roof" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f06a4e" />
        <stop offset="100%" stop-color="#a8302e" />
      </linearGradient>
      <linearGradient id="dacha-roof-green" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6cbf7a" />
        <stop offset="100%" stop-color="#2f7a50" />
      </linearGradient>
      <linearGradient id="dacha-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8f8ff" />
        <stop offset="100%" stop-color="#6aa8d8" />
      </linearGradient>
      <linearGradient id="dacha-brass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffe9a0" />
        <stop offset="45%" stop-color="#f0b040" />
        <stop offset="100%" stop-color="#9a5418" />
      </linearGradient>
      <linearGradient id="dacha-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6a6a7e" />
        <stop offset="100%" stop-color="#2e2a3e" />
      </linearGradient>
      <linearGradient id="dacha-barrow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5aa8f0" />
        <stop offset="100%" stop-color="#2a5aa8" />
      </linearGradient>
      <linearGradient id="dacha-bark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#9a6a4a" />
        <stop offset="100%" stop-color="#4a2a22" />
      </linearGradient>
      <linearGradient id="dacha-gh" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#a8dcf0" stop-opacity="0.35" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-dacha)" />
    <circle cx="150" cy="140" r="300" fill="url(#dacha-sun)" />
    <circle cx="150" cy="140" r="74" fill="#fff6c8" stroke="#f0b040" stroke-width="5" />
    <path d="M112 112 Q128 92 158 88" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.85" />

    <g class="dacha-clouds">
      <path :d="CLOUDS" fill="none" stroke="#8ab8dc" stroke-width="7" />
      <path :d="CLOUDS" fill="#fffdf6" />
      <path :d="CLOUD_SHADE" fill="#cfe4f4" />
    </g>

    <path :d="FAR_TREES" fill="none" stroke="#86ae8e" stroke-width="6" />
    <path :d="FAR_TREES" fill="#b2d6a8" />
    <path :d="FAR_LIGHT" fill="#c8e4ba" />
    <path :d="FAR_BIRCHES" stroke="#f4f8f0" stroke-width="6" stroke-linecap="round" />
    <path :d="FAR_BIRCHES" stroke="#86ae8e" stroke-width="6" stroke-dasharray="3 14" />
    <rect x="-60" y="620" width="2040" height="180" fill="url(#dacha-haze)" />
    <path d="M-60 742 Q480 724 960 734 Q1440 744 1980 728 L1980 1140 L-60 1140 Z" fill="#c4e29a" stroke="#98bc80" stroke-width="3" />

    <g v-for="(h, i) in FAR_HOUSES" :key="`fh${i}`" stroke="#a89090" stroke-width="3" stroke-linejoin="round">
      <rect :x="h.x - h.w / 2" :y="760 - h.h" :width="h.w" :height="h.h" :fill="h.wall" />
      <path :d="`M${h.x - h.w / 2 - 10} ${760 - h.h} L${h.x} ${760 - h.h - h.w * 0.45} L${h.x + h.w / 2 + 10} ${760 - h.h} Z`" :fill="h.roof" />
      <rect :x="h.x - 10" :y="760 - h.h + 12" width="20" height="16" fill="#c8dcec" />
    </g>

    <g class="gull" style="animation-duration: 34s; animation-delay: -12s">
      <g v-for="(b, i) in SWALLOWS" :key="`sw${i}`" :transform="`translate(${b[0]} ${340 + b[1]!}) scale(${b[2]})`">
        <path d="M-8 0 L-24 -7 M-8 0 L-24 7" stroke="#23234a" stroke-width="3" stroke-linecap="round" />
        <ellipse rx="12" ry="5" fill="#23234a" />
        <circle cx="9" cy="1" r="3" fill="#ff7a5a" />
      </g>
      <g class="flap" fill="#23234a" stroke="#1b1033" stroke-width="2" stroke-linejoin="round">
        <path v-for="(b, i) in SWALLOWS" :key="`sww${i}`" :transform="`translate(${b[0]} ${340 + b[1]!}) scale(${b[2]})`" d="M2 0 Q-14 -22 -34 -18 Q-14 -8 -2 4 Z M2 0 Q16 -24 40 -22 Q16 -8 6 4 Z" />
      </g>
    </g>

    <rect x="24" y="420" width="14" height="420" fill="#8a5a3a" stroke="#1b1033" stroke-width="4" />
    <g transform="translate(31 400)">
      <rect x="-30" y="-46" width="60" height="70" fill="#d89a5a" stroke="#1b1033" stroke-width="4" filter="url(#cel-s)" />
      <path d="M-40 -42 L0 -80 L40 -42 Z" fill="url(#dacha-roof-green)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <circle cy="-12" r="11" fill="#2a1420" stroke="#1b1033" stroke-width="3" />
      <path d="M-6 10 h12" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
      <path d="M-22 -36 v40" stroke="#f4c88a" stroke-width="4" stroke-linecap="round" opacity="0.7" />
      <g transform="translate(26 -82)">
        <path d="M-8 0 L-22 8" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
        <ellipse rx="14" ry="10" fill="#3a3a5a" stroke="#1b1033" stroke-width="3" />
        <circle cx="10" cy="-8" r="8" fill="#3a3a5a" stroke="#1b1033" stroke-width="3" />
        <path d="M17 -8 L26 -6 L17 -4 Z" fill="#ffc83a" stroke="#1b1033" stroke-width="2" stroke-linejoin="round" />
        <circle cx="12" cy="-10" r="2" fill="#fff" />
        <path d="M-6 -4 q6 -6 12 -2" stroke="#8a8ac0" stroke-width="2.5" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <rect x="740" y="752" width="790" height="9" fill="#b89068" stroke="#6a4a3a" stroke-width="2.5" />
    <rect x="740" y="786" width="790" height="9" fill="#b89068" stroke="#6a4a3a" stroke-width="2.5" />
    <path :d="PICKETS" fill="#f0e2c0" stroke="#7a5a46" stroke-width="3" stroke-linejoin="round" />
    <path :d="PICKET_GRAIN" stroke="#c8a87a" stroke-width="2.5" stroke-linecap="round" />

    <path d="M-60 800 Q420 780 960 792 Q1500 804 1980 786 L1980 1140 L-60 1140 Z" fill="url(#dacha-grass)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(40, 812, 1900, 0.013)" stroke="#5f9a3a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    <path :d="DAISY_PETALS" fill="#fffaf0" />
    <path :d="DAISY_HEARTS" stroke="#ffc21e" stroke-width="5" stroke-linecap="round" />

    <g>
      <ellipse cx="1320" cy="836" rx="170" ry="14" fill="#1b2a10" opacity="0.28" />
      <path :d="GH_PLANTS" fill="#4a9a3a" />
      <g fill="#e8402e">
        <circle cx="1240" cy="782" r="7" />
        <circle cx="1300" cy="800" r="8" />
        <circle cx="1360" cy="776" r="7" />
        <circle cx="1410" cy="800" r="7" />
      </g>
      <path d="M1390 830 L1390 730 A100 90 0 0 0 1290 640 L1350 610 A100 90 0 0 1 1450 700 L1450 800 Z" fill="#cdeaf6" fill-opacity="0.55" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M1330 652 L1390 622 M1370 688 L1430 660 M1390 764 L1450 736" stroke="#5a8aa8" stroke-width="3" opacity="0.7" />
      <path d="M1190 830 L1190 730 A100 90 0 0 1 1390 730 L1390 830 Z" fill="url(#dacha-gh)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M1240 830 V720 M1340 830 V720 M1190 730 H1390 M1290 640 V730" stroke="#5a8aa8" stroke-width="4" />
      <rect x="1262" y="742" width="56" height="88" fill="#e8f8ff" fill-opacity="0.4" stroke="#1b1033" stroke-width="4" />
      <circle cx="1310" cy="788" r="4" fill="#1b1033" />
      <path d="M1210 700 Q1230 668 1262 656 M1206 760 L1226 740 M1356 706 L1372 690" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>

    <g>
      <ellipse cx="1630" cy="806" rx="170" ry="14" fill="#1b2a10" opacity="0.3" />
      <rect x="1552" y="520" width="20" height="90" fill="#8a8a9a" stroke="#1b1033" stroke-width="4" />
      <path d="M1544 520 h36 l-6 -12 h-24 Z" fill="#5a5a6a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M1500 806 V658 H1760 V806 Z" fill="url(#dacha-log-dark)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
      <path :d="BANYA_LOGS.map((y) => `M1504 ${y} H1756`).join(' ')" stroke="#5a2e18" stroke-width="3" opacity="0.6" />
      <g fill="#e2a46a" stroke="#1b1033" stroke-width="3">
        <circle v-for="y in BANYA_LOGS" :key="`bl${y}`" cx="1500" :cy="y - 12" r="11" />
        <circle v-for="y in BANYA_LOGS" :key="`br${y}`" cx="1760" :cy="y - 12" r="11" />
      </g>
      <path d="M1480 664 L1532 588 L1730 588 L1782 664 Z" fill="url(#dacha-roof-green)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M1540 600 L1510 656 M1600 596 L1590 656 M1660 596 L1670 656 M1720 600 L1750 656" stroke="#245a3a" stroke-width="3" opacity="0.6" />
      <path d="M1536 596 H1726" stroke="#a8e0b0" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      <rect x="1598" y="694" width="52" height="112" fill="#8a4e2a" stroke="#1b1033" stroke-width="4" />
      <path d="M1611 700 V800 M1624 700 V800 M1637 700 V800" stroke="#5a2e18" stroke-width="2.5" opacity="0.7" />
      <circle cx="1640" cy="752" r="4" fill="#1b1033" />
      <rect x="1680" y="690" width="52" height="40" fill="url(#dacha-glass)" stroke="#1b1033" stroke-width="4" />
      <path d="M1706 690 V730" stroke="#1b1033" stroke-width="3" />
      <path d="M1688 698 l10 -4" stroke="#fff" stroke-width="4" stroke-linecap="round" />
      <path d="M1574 700 l-10 34 M1574 700 l0 36 M1574 700 l10 34" stroke="#3a7a2a" stroke-width="6" stroke-linecap="round" />
      <path d="M1574 690 v12" stroke="#7a4a2a" stroke-width="4" stroke-linecap="round" />
      <g fill="#c88a52" stroke="#1b1033" stroke-width="3">
        <circle v-for="(w, i) in WOODPILE" :key="`wp${i}`" :cx="w.x" :cy="w.y" r="9" />
      </g>
      <path :d="WOODPILE.map((w) => `M${w.x - 3} ${w.y} a3 3 0 1 0 6 0`).join(' ')" stroke="#7a4a2a" stroke-width="2" fill="none" />
    </g>
    <path v-for="(d, i) in BANYA_SMOKE" :key="`bs${i}`" :d="d" fill="#f8f6f2" class="dacha-smoke" :style="{ animationDelay: `-${i * 2.3}s` }" />

    <g>
      <ellipse cx="420" cy="826" rx="400" ry="22" fill="#1b2a10" opacity="0.3" />
      <rect x="400" y="300" width="36" height="110" fill="#c8583a" stroke="#1b1033" stroke-width="5" />
      <path d="M400 322 H436 M400 344 H436 M418 300 V322 M410 322 V344 M426 344 V366" stroke="#7a2a1e" stroke-width="3" opacity="0.7" />
      <rect x="394" y="292" width="48" height="12" fill="#8a3a2a" stroke="#1b1033" stroke-width="4" />
      <path d="M450 540 L540 488 L540 796 L450 820 Z" fill="url(#dacha-log-side)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M454 580 L536 548 M454 620 L536 592 M454 660 L536 636 M454 700 L536 680 M454 740 L536 724" stroke="#5a2e18" stroke-width="3" opacity="0.5" />
      <path d="M270 344 L340 304 L560 500 L478 552 Z" fill="url(#dacha-roof)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
      <path :d="ROOF_SEAMS" stroke="#7a1e1e" stroke-width="4" opacity="0.6" />
      <path d="M296 340 L346 318" stroke="#ffb090" stroke-width="5" stroke-linecap="round" opacity="0.8" />

      <path d="M90 820 V530 H450 V820 Z" fill="url(#dacha-log)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path :d="FACADE_LOGS.map((y) => `M94 ${y} H446`).join(' ')" stroke="#8a4e24" stroke-width="3" opacity="0.5" />
      <path :d="FACADE_LOGS.map((y) => `M110 ${y - 8} H200 M300 ${y - 10} H380`).join(' ')" stroke="#ffd8a0" stroke-width="3" stroke-linecap="round" opacity="0.45" />
      <g fill="#ecb478" stroke="#1b1033" stroke-width="3">
        <circle v-for="y in FACADE_LOGS" :key="`fl${y}`" cx="88" :cy="y - 14" r="13" />
      </g>
      <path :d="FACADE_LOGS.map((y) => `M83 ${y - 14} a5 5 0 1 0 10 0`).join(' ')" stroke="#a86a3a" stroke-width="2" fill="none" />
      <rect x="86" y="790" width="368" height="32" fill="#b4aaa4" stroke="#1b1033" stroke-width="5" />
      <path d="M90 806 H450 M130 790 V806 M210 790 V806 M290 790 V806 M370 790 V806 M170 806 V822 M250 806 V822 M330 806 V822 M410 806 V822" stroke="#6a6060" stroke-width="2.5" opacity="0.7" />

      <path d="M90 530 L270 372 L450 530 Z" fill="#f2d48c" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path :d="GABLE_BOARDS" stroke="#b8904a" stroke-width="3" opacity="0.7" />
      <circle cx="270" cy="462" r="32" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
      <circle cx="270" cy="462" r="22" fill="url(#dacha-glass)" stroke="#1b1033" stroke-width="3" />
      <path d="M270 440 V484 M248 462 H292" stroke="#fffaf0" stroke-width="5" />
      <path d="M256 452 q4 -6 10 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M62 552 L270 344 L478 552" stroke="#1b1033" stroke-width="30" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M62 552 L270 344 L478 552" stroke="#fffaf0" stroke-width="20" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M70 552 L270 352 L470 552" stroke="#3a7ad0" stroke-width="7" fill="none" stroke-dasharray="3 13" stroke-linecap="round" />
      <path d="M256 356 h28 v50 l-14 18 l-14 -18 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <circle cx="270" cy="384" r="7" fill="#3a7ad0" />

      <g v-for="cx in WINDOWS" :key="`w${cx}`" :transform="`translate(${cx} 652)`">
        <g fill="#3a7ad0" stroke="#1b1033" stroke-width="4">
          <rect x="-88" y="-50" width="34" height="100" />
          <rect x="54" y="-50" width="34" height="100" />
        </g>
        <path d="M-71 -22 l10 22 l-10 22 l-10 -22 Z M71 -22 l10 22 l-10 22 l-10 -22 Z" fill="#fffaf0" />
        <rect x="-54" y="-56" width="108" height="112" rx="4" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
        <rect x="-42" y="-44" width="84" height="88" fill="url(#dacha-glass)" stroke="#1b1033" stroke-width="3" />
        <path d="M-42 -44 Q-28 -10 -40 44 H-28 Q-20 0 -8 -44 Z M42 -44 Q28 -10 40 44 H28 Q20 0 8 -44 Z" fill="#ff8a9a" opacity="0.85" />
        <rect x="-14" y="28" width="28" height="16" fill="#d0602e" stroke="#1b1033" stroke-width="2.5" />
        <g fill="#ff3a4a" stroke="#1b1033" stroke-width="2">
          <circle cx="-8" cy="20" r="7" />
          <circle cx="7" cy="16" r="7" />
          <circle cx="0" cy="24" r="6" />
        </g>
        <path d="M0 -44 V44 M-42 -4 H42" stroke="#1b1033" stroke-width="9" />
        <path d="M0 -44 V44 M-42 -4 H42" stroke="#fffaf0" stroke-width="5" />
        <path d="M-34 -16 L-14 -36 M-30 -6 L-24 -12" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.85" />
        <path d="M-66 -56 Q-64 -92 0 -106 Q64 -92 66 -56 Z" fill="#3a7ad0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-50 -62 Q-46 -84 0 -94 Q46 -84 50 -62" stroke="#fffaf0" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cy="-74" r="8" fill="#fffaf0" stroke="#1b1033" stroke-width="2.5" />
        <path :d="SILL_SCALLOPS" fill="#3a7ad0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <rect x="-66" y="54" width="132" height="14" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
      </g>
    </g>

    <g>
      <path d="M540 600 H770 V800 H540 Z" fill="#9a5e36" stroke="#1b1033" stroke-width="4" />
      <path d="M570 604 V796 M600 604 V796 M630 604 V796 M660 604 V796 M690 604 V796 M720 604 V796" stroke="#6a3a1e" stroke-width="2.5" opacity="0.5" />
      <rect x="540" y="604" width="230" height="50" fill="#1b1033" opacity="0.25" />
      <path d="M580 566 L578 604 M640 574 L638 612 M700 582 L698 620 M760 590 L758 628" stroke="#7a1e1e" stroke-width="3" opacity="0.6" />
      <path d="M532 570 L790 606" stroke="#ffb090" stroke-width="4" stroke-linecap="round" opacity="0.7" />
      <path d="M524 560 L800 598 L800 640 L524 604 Z" fill="url(#dacha-roof)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M540 640 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 a10 10 0 0 0 20 0 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <g fill="#fffaf0" stroke="#1b1033" stroke-width="4">
        <rect x="541" y="630" width="14" height="172" />
        <rect x="653" y="636" width="14" height="166" />
        <rect x="763" y="640" width="14" height="162" />
      </g>
      <path d="M546 680 h4 M546 740 h4 M658 686 h4 M658 746 h4" stroke="#3a7ad0" stroke-width="6" stroke-linecap="round" />

      <path d="M556 740 H704 L712 776 H548 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M552 768 H708" stroke="#e8503a" stroke-width="6" />
      <path d="M580 744 L576 776 M612 744 L610 776 M644 744 L646 776 M676 744 L680 776" stroke="#e8503a" stroke-width="3" opacity="0.5" />
      <g transform="translate(626 741) scale(0.62)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M-22 0 L22 0 L16 -10 L-16 -10 Z" fill="url(#dacha-brass)" stroke-width="4" />
        <rect x="-9" y="-24" width="18" height="14" fill="url(#dacha-brass)" stroke-width="3.5" />
        <path d="M-34 -24 Q-42 -70 -26 -92 L26 -92 Q42 -70 34 -24 Z" fill="url(#dacha-brass)" stroke-width="4.5" />
        <rect x="-30" y="-100" width="60" height="10" rx="3" fill="#c8862a" stroke-width="3.5" />
        <path d="M-20 -100 L-16 -116 L16 -116 L20 -100 Z" fill="url(#dacha-brass)" stroke-width="3.5" />
        <ellipse cy="-128" rx="17" ry="13" fill="#fffaf0" stroke-width="3.5" />
        <path d="M-12 -132 q4 4 8 0 q4 -4 8 0 q4 4 8 0" stroke="#3a7ad0" stroke-width="2.5" fill="none" />
        <circle cy="-144" r="4" fill="#fffaf0" stroke-width="2.5" />
        <path d="M14 -126 l12 -8" stroke-width="5" stroke-linecap="round" />
        <path d="M-34 -70 q-16 0 -14 16 M34 -70 q16 0 14 16" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M34 -42 h14 v8" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M-24 -82 Q-32 -60 -24 -34" stroke="#fff6d0" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M-28 -60 H28" stroke="#9a5418" stroke-width="3" opacity="0.6" />
      </g>
      <path class="dacha-steam" d="M644 652 q-8 -12 0 -22 q8 -10 0 -22" stroke="#fffaf0" stroke-width="5" fill="none" stroke-linecap="round" />
      <g stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
        <ellipse cx="578" cy="740" rx="16" ry="4" fill="#fffaf0" />
        <path d="M568 740 V724 H588 V740 Z" fill="#fffaf0" />
        <path d="M588 728 q8 0 6 8" fill="none" />
        <ellipse cx="684" cy="740" rx="16" ry="4" fill="#fffaf0" />
        <path d="M674 740 V724 H694 V740 Z" fill="#fffaf0" />
        <path d="M670 732 h28" stroke="#3a7ad0" />
      </g>
      <path d="M538 760 H700 M538 798 H700" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
      <path d="M538 760 H700 M538 798 H700" stroke="#fffaf0" stroke-width="6" stroke-linecap="round" />
      <path d="M556 764 V796 M574 764 V796 M592 764 V796 M610 764 V796 M628 764 V796 M646 764 V796 M664 764 V796 M682 764 V796" stroke="#1b1033" stroke-width="9" />
      <path d="M556 764 V796 M574 764 V796 M592 764 V796 M610 764 V796 M628 764 V796 M646 764 V796 M664 764 V796 M682 764 V796" stroke="#fffaf0" stroke-width="4" />
      <path d="M532 800 H784 V812 H532 Z" fill="#c8864a" stroke="#1b1033" stroke-width="4" />
      <path d="M700 812 H790 V828 H700 Z M708 828 H800 V844 H708 Z" fill="#d89a5a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>

    <g fill="#5a9a3a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
      <path d="M966 884 Q1070 868 1176 884 L1170 898 Q1070 906 972 898 Z" fill="#7a4a2e" />
    </g>
    <path :d="TOMATO_STAKES.map((x) => `M${x} 890 V760`).join(' ')" stroke="#1b1033" stroke-width="10" stroke-linecap="round" />
    <path :d="TOMATO_STAKES.map((x) => `M${x} 890 V760`).join(' ')" stroke="#c8a06a" stroke-width="5" stroke-linecap="round" />
    <path :d="TOMATO_LEAVES" fill="none" stroke="#1b1033" stroke-width="7" />
    <path :d="TOMATO_LEAVES" fill="#3f8a3a" />
    <g stroke="#1b1033" stroke-width="3">
      <circle v-for="(t, i) in TOMATOES" :key="`tm${i}`" :cx="t[0]" :cy="t[1]" :r="t[2]" fill="#ee3a2a" />
    </g>
    <path :d="TOMATOES.map((t) => `M${t[0]! - 4} ${t[1]! - 3} q2 -3 5 -3`).join(' ')" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />

    <g class="dacha-sway">
      <g v-for="(f, i) in SUNFLOWERS" :key="`sf${i}`">
        <path :d="`M${f.x + f.lean} 880 Q${f.x + f.lean * 1.4} ${(f.y + 880) / 2} ${f.x} ${f.y}`" stroke="#1b1033" stroke-width="14" fill="none" stroke-linecap="round" />
        <path :d="`M${f.x + f.lean} 880 Q${f.x + f.lean * 1.4} ${(f.y + 880) / 2} ${f.x} ${f.y}`" stroke="#4a9a3a" stroke-width="8" fill="none" stroke-linecap="round" />
        <g :transform="`translate(${f.x + f.lean} ${(f.y + 880) / 2 + 40})`" fill="#4fa83e" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round">
          <path d="M0 0 Q34 -36 74 -14 Q40 12 0 0 Z" />
          <path d="M0 30 Q-34 -6 -70 12 Q-36 40 0 30 Z" />
          <path d="M6 -2 Q36 -22 64 -14 M-6 28 Q-36 12 -60 14" stroke="#9ad87a" stroke-width="2.5" fill="none" />
        </g>
        <g :transform="`translate(${f.x} ${f.y})`">
          <path :d="f.back" fill="#ffa81e" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <path :d="f.front" fill="#ffd22e" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <circle :r="f.r * 0.54" fill="#6a3a1e" stroke="#1b1033" stroke-width="4" />
          <path :d="f.seeds" stroke="#2e160a" stroke-width="6" stroke-linecap="round" />
          <path :d="`M${-f.r * 0.34} ${-f.r * 0.1} Q${-f.r * 0.3} ${-f.r * 0.34} ${-f.r * 0.08} ${-f.r * 0.38}`" stroke="#b07040" stroke-width="4" fill="none" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <g class="dacha-bees">
      <g v-for="(b, i) in BEES" :key="`be${i}`" :transform="`translate(${b[0]} ${b[1]})`">
        <ellipse cx="-3" cy="-9" rx="6" ry="8" fill="#fffaf0" stroke="#1b1033" stroke-width="2" opacity="0.9" />
        <ellipse cx="5" cy="-9" rx="6" ry="8" fill="#fffaf0" stroke="#1b1033" stroke-width="2" opacity="0.9" />
        <ellipse rx="11" ry="8" fill="#ffcc22" stroke="#1b1033" stroke-width="2.5" />
        <path d="M-3 -7 V7 M4 -7 V7" stroke="#1b1033" stroke-width="3" />
        <path d="M-11 0 h-5" stroke="#1b1033" stroke-width="2" stroke-linecap="round" />
      </g>
    </g>

    <path
      d="M1806 1140 C1820 990 1792 840 1812 700 C1820 640 1800 590 1770 550 L1800 536 C1828 570 1846 610 1850 660 C1866 620 1880 590 1900 570 L1924 590 C1890 640 1874 700 1874 760 C1872 880 1890 1000 1910 1140 Z"
      fill="url(#dacha-bark)"
      stroke="#1b1033"
      stroke-width="6"
      stroke-linejoin="round"
      filter="url(#cel)"
    />
    <path d="M1826 1100 C1834 980 1812 860 1828 740 M1854 880 v-60 M1840 990 v-40" stroke="#2e1810" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5" />
    <path d="M1820 1080 C1826 960 1806 840 1822 720" stroke="#c89a7a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
    <path :d="CROWN.deep" fill="#1b1033" stroke="#1b1033" stroke-width="10" />
    <path :d="CROWN.deep" fill="#3a8a3e" filter="url(#cel-s)" />
    <path :d="CROWN.mid" fill="#58aa48" />
    <path :d="CROWN.light" fill="#8ad06a" />
    <path d="M1700 380 q30 -16 60 -6 M1860 240 q28 -10 50 2 M1900 460 q24 -12 48 -4" stroke="#c4f0a0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    <g stroke="#1b1033" stroke-width="3">
      <circle v-for="(a, i) in APPLES" :key="`ap${i}`" :cx="a[0]" :cy="a[1]" r="14" fill="#f03a3a" />
    </g>
    <path :d="APPLES.map((a) => `M${a[0]! - 7} ${a[1]! - 4} q2 -5 7 -6 M${a[0]} ${a[1]! - 14} l3 -7`).join(' ')" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />

    <rect x="1574" y="824" width="16" height="140" fill="#8a5a3a" stroke="#1b1033" stroke-width="4" />
    <ellipse cx="1720" cy="970" rx="150" ry="14" fill="#1b2a10" opacity="0.3" />
    <g class="dacha-hammock">
      <path d="M1582 830 L1604 848 M1830 836 L1814 850" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
      <g transform="translate(1714 884)">
        <path d="M44 6 Q66 -10 56 -28" stroke="#1b1033" stroke-width="14" fill="none" stroke-linecap="round" />
        <path d="M44 6 Q66 -10 56 -28" stroke="#f29a3a" stroke-width="8" fill="none" stroke-linecap="round" />
        <ellipse cx="6" cy="0" rx="48" ry="24" fill="#f29a3a" stroke="#1b1033" stroke-width="4" />
        <path d="M-6 -22 q4 10 0 18 M10 -24 q4 10 0 18 M26 -20 q4 8 0 16" stroke="#c86a1e" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M-56 -16 L-50 -38 L-38 -22 Z M-24 -24 L-20 -42 L-8 -26 Z" fill="#f29a3a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <ellipse cx="-34" cy="-6" rx="26" ry="20" fill="#f29a3a" stroke="#1b1033" stroke-width="4" />
        <ellipse cx="-40" cy="2" rx="12" ry="8" fill="#fff4e0" />
        <path d="M-48 -8 q4 4 8 0 M-30 -10 q4 4 8 0" stroke="#1b1033" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M-41 -1 l3 3 l3 -3 Z" fill="#ff7a8a" stroke="#1b1033" stroke-width="1.5" />
        <ellipse cx="-22" cy="-2" rx="5" ry="3" fill="#ff7a8a" opacity="0.6" />
        <path d="M-50 -18 q6 -6 14 -6" stroke="#ffd0a0" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
      <path d="M1600 846 Q1720 950 1840 846 Q1720 1000 1600 846 Z" fill="#e8503a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M1600 846 Q1720 966 1840 846 M1600 846 Q1720 982 1840 846" stroke="#fffaf0" stroke-width="5" fill="none" />
      <path d="M1660 914 l-4 14 M1690 922 l-2 14 M1720 924 v14 M1750 922 l2 14 M1780 914 l4 14" stroke="#fffaf0" stroke-width="3" stroke-linecap="round" />
    </g>

    <g>
      <path d="M548 954 L1328 954 L1352 996 L524 996 Z" fill="#6a3e26" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M560 970 H1330 M548 986 H1342" stroke="#4a2a18" stroke-width="3" opacity="0.6" />
      <g v-for="(c, i) in CABBAGES" :key="`cb${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.k})`">
        <path d="M-42 6 Q-50 -20 -22 -22 Q0 -42 22 -22 Q50 -20 42 6 Q0 18 -42 6 Z" fill="#5aaa48" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <circle cy="-8" r="20" fill="#bfe890" stroke="#1b1033" stroke-width="3" />
        <path d="M-6 -26 Q-14 -10 -4 6 M8 -24 Q16 -10 6 6 M-34 0 Q-26 -10 -16 -12 M34 0 Q26 -10 16 -12" stroke="#5a9a3a" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M-12 -20 q6 -6 14 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
      <path d="M524 996 H1352 V1034 H524 Z" fill="#c8864a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M528 1015 H1348 M760 998 V1032 M1040 998 V1032" stroke="#7a4a24" stroke-width="3" opacity="0.6" />
      <path d="M540 1004 H740 M800 1006 H980" stroke="#f0c088" stroke-width="3" stroke-linecap="round" opacity="0.7" />
    </g>

    <g transform="translate(250 960)">
      <ellipse cx="0" cy="54" rx="150" ry="14" fill="#1b2a10" opacity="0.3" />
      <path d="M-90 0 L-102 52 M90 0 L102 52 M-60 0 L-66 46 M60 0 L66 46" stroke="#1b1033" stroke-width="11" stroke-linecap="round" />
      <path d="M-90 0 L-102 52 M90 0 L102 52 M-60 0 L-66 46 M60 0 L66 46" stroke="#5a5a6e" stroke-width="5" stroke-linecap="round" />
      <path d="M-112 -50 L112 -50 L102 4 L-102 4 Z" fill="url(#dacha-metal)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <g fill="#1b1033">
        <circle v-for="x in [-72, -40, -8, 24, 56, 88]" :key="`gh${x}`" :cx="x - 8" cy="-18" r="5" />
      </g>
      <path d="M-104 -44 H104" stroke="#9a9ab0" stroke-width="3" opacity="0.7" />
      <path d="M-106 -52 Q0 -64 106 -52" stroke="#ff7a2f" stroke-width="10" fill="none" stroke-linecap="round" />
      <path d="M-80 -54 h10 M-30 -58 h14 M20 -58 h10 M64 -56 h12" stroke="#ffe08a" stroke-width="5" stroke-linecap="round" />
      <g v-for="(y, k) in [-70, -58]" :key="`sk${k}`">
        <path :d="`M-140 ${y} H140`" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
        <path :d="`M-140 ${y} H140`" stroke="#d0d0dc" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="-148" :cy="y" r="7" fill="none" stroke="#1b1033" stroke-width="3" />
        <g stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
          <rect v-for="(x, j) in SKEWER_CHUNKS" :key="`ch${j}`" :x="x + k * 8 - 11" :y="y - 9" width="22" height="18" rx="5" :fill="j % 3 === 1 ? '#fffaf0' : '#a8442a'" />
        </g>
        <path :d="SKEWER_CHUNKS.filter((_, j) => j % 3 !== 1).map((x) => `M${x + k * 8 - 6} ${y - 4} h8`).join(' ')" stroke="#d8784a" stroke-width="3" stroke-linecap="round" />
      </g>
    </g>
    <path v-for="(d, i) in GRILL_SMOKE" :key="`gs${i}`" :d="d" fill="#f8f6f2" class="dacha-smoke dacha-smoke-grill" :style="{ animationDelay: `-${i * 2.6}s` }" />

    <g transform="translate(470 1024)" fill="none" stroke-linecap="round">
      <ellipse cx="4" cy="10" rx="72" ry="16" fill="#1b2a10" opacity="0.3" stroke="none" />
      <path d="M-60 0 a60 22 0 1 0 120 0 a60 22 0 1 0 -120 0 M-42 -2 a42 15 0 1 0 84 0 a42 15 0 1 0 -84 0 M-24 -4 a24 8 0 1 0 48 0 a24 8 0 1 0 -48 0 M58 4 Q84 0 94 -14" stroke="#1b1033" stroke-width="14" />
      <path d="M-60 0 a60 22 0 1 0 120 0 a60 22 0 1 0 -120 0 M-42 -2 a42 15 0 1 0 84 0 a42 15 0 1 0 -84 0 M-24 -4 a24 8 0 1 0 48 0 a24 8 0 1 0 -48 0 M58 4 Q84 0 94 -14" stroke="#2fb35a" stroke-width="8" />
      <path d="M-50 -10 a50 18 0 0 1 40 -10 M-34 -10 a34 12 0 0 1 22 -6" stroke="#a8f0b0" stroke-width="3" opacity="0.8" />
      <path d="M90 -10 l16 -14" stroke="#1b1033" stroke-width="14" />
      <path d="M90 -10 l16 -14" stroke="#ffcc22" stroke-width="8" />
    </g>

    <g transform="translate(1440 1000)">
      <ellipse cx="10" cy="44" rx="130" ry="12" fill="#1b2a10" opacity="0.3" />
      <path d="M40 -6 L170 16 M50 6 L178 26" stroke="#1b1033" stroke-width="13" stroke-linecap="round" />
      <path d="M40 -6 L170 16 M50 6 L178 26" stroke="#c08a52" stroke-width="7" stroke-linecap="round" />
      <path d="M50 4 L62 40" stroke="#1b1033" stroke-width="9" stroke-linecap="round" />
      <path d="M50 4 L62 40" stroke="#2a5aa8" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="-34" cy="-56" rx="36" ry="28" fill="#ff8a2a" stroke="#1b1033" stroke-width="4" filter="url(#cel-s)" />
      <path d="M-34 -84 Q-46 -56 -34 -28 M-34 -84 Q-22 -56 -34 -28" stroke="#c8561a" stroke-width="3" fill="none" />
      <path d="M-34 -84 q-2 -10 6 -14" stroke="#3a7a2a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-56 -70 q6 -10 14 -10" stroke="#ffd0a0" stroke-width="4" fill="none" stroke-linecap="round" />
      <ellipse cx="22" cy="-56" rx="40" ry="14" transform="rotate(-14 22 -56)" fill="#4a9a3a" stroke="#1b1033" stroke-width="4" />
      <path d="M-4 -56 Q20 -66 52 -70" stroke="#a8e08a" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M-92 -50 L82 -50 L60 12 L-64 12 Z" fill="url(#dacha-barrow)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-86 -44 H76" stroke="#a8d8ff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      <circle cx="-70" cy="22" r="26" fill="#2e2a3e" stroke="#1b1033" stroke-width="5" />
      <circle cx="-70" cy="22" r="9" fill="#c0c0cc" stroke="#1b1033" stroke-width="3" />
      <path d="M-84 6 q8 -6 18 -4" stroke="#6a6a7e" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <path d="M-60 1060 Q500 1040 960 1064 Q1400 1082 1980 1044 L1980 1140 L-60 1140 Z" fill="url(#dacha-front)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(260, 1070, 1700, 0.02)" stroke="#2a5a2c" stroke-width="5" fill="none" stroke-linecap="round" />

    <g fill="#1e4a2c" stroke="#0b1a12" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 L-60 940 Q40 900 120 960 Q190 1010 170 1140 Z" />
      <path d="M40 1140 Q60 1010 190 990 Q300 980 300 1040 Q260 1100 220 1140 Z" />
      <path d="M1980 1140 L1980 960 Q1900 980 1880 1040 Q1860 1100 1880 1140 Z" />
      <path d="M1640 1140 Q1660 1030 1780 1010 Q1850 1004 1860 1060 Q1820 1110 1800 1140 Z" />
      <path d="M1900 1140 Q1870 1020 1940 980 Q1930 1080 1960 1140 Z" />
    </g>
    <path d="M-40 1100 Q20 1010 100 980 M80 1120 Q140 1050 230 1020 M1930 1120 Q1920 1050 1950 1000 M1700 1120 Q1740 1050 1830 1030" stroke="#3a7048" stroke-width="5" fill="none" stroke-linecap="round" />
    <g fill="#f03a3a" stroke="#1b1033" stroke-width="3">
      <circle cx="1720" cy="1096" r="12" />
      <circle cx="1690" cy="1108" r="10" />
    </g>

    <g v-for="(b, i) in BUTTERFLIES" :key="`bf${i}`" class="dacha-flutter" :style="{ animationDuration: `${b.s}s`, animationDelay: `-${b.d}s` }">
      <g :transform="`translate(${b.x} ${b.y})`">
        <g class="dacha-wings">
          <path d="M0 0 Q-24 -30 -30 -8 Q-28 6 0 0 Z M0 0 Q-20 18 -10 22 Q0 18 0 0 Z M0 0 Q24 -30 30 -8 Q28 6 0 0 Z M0 0 Q20 18 10 22 Q0 18 0 0 Z" :fill="b.c" stroke="#1b1033" stroke-width="2.5" stroke-linejoin="round" />
          <circle cx="-18" cy="-12" r="4" :fill="b.spot" />
          <circle cx="18" cy="-12" r="4" :fill="b.spot" />
        </g>
        <path d="M0 -8 V12 M0 -8 l-6 -10 M0 -8 l6 -10" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.dacha-clouds {
  animation: dacha-clouds 40s ease-in-out infinite alternate;
}

.dacha-smoke {
  transform-box: fill-box;
  transform-origin: center;
  animation: dacha-smoke 7s ease-out infinite;
}

.dacha-smoke-grill {
  animation-name: dacha-smoke-grill;
  animation-duration: 5.2s;
}

.dacha-steam {
  animation: dacha-steam 2.4s ease-in-out infinite;
}

.dacha-sway {
  transform-box: view-box;
  transform-origin: 872px 880px;
  animation: dacha-sway 5s ease-in-out infinite alternate;
}

.dacha-bees {
  animation: dacha-bees 3s ease-in-out infinite alternate;
}

.dacha-hammock {
  transform-box: view-box;
  transform-origin: 1720px 840px;
  animation: dacha-hammock 4s ease-in-out infinite alternate;
}

.dacha-flutter {
  animation: dacha-flutter ease-in-out infinite;
}

.dacha-wings {
  transform-box: fill-box;
  transform-origin: center;
  animation: dacha-wings 0.22s ease-in-out infinite alternate;
}

@keyframes dacha-clouds {
  from {
    translate: -70px 0;
  }
  to {
    translate: 70px 0;
  }
}

@keyframes dacha-smoke {
  0% {
    translate: 0 0;
    scale: 0.4;
    opacity: 0;
  }
  15% {
    opacity: 0.95;
  }
  100% {
    translate: -90px -230px;
    scale: 1.7;
    opacity: 0;
  }
}

@keyframes dacha-smoke-grill {
  0% {
    translate: 0 0;
    scale: 0.4;
    opacity: 0;
  }
  15% {
    opacity: 0.85;
  }
  100% {
    translate: 70px -180px;
    scale: 1.5;
    opacity: 0;
  }
}

@keyframes dacha-steam {
  0%,
  100% {
    translate: 0 6px;
    opacity: 0;
  }
  50% {
    opacity: 0.9;
  }
  99% {
    translate: 0 -14px;
  }
}

@keyframes dacha-sway {
  from {
    rotate: -1.6deg;
  }
  to {
    rotate: 1.6deg;
  }
}

@keyframes dacha-bees {
  0% {
    translate: 0 0;
  }
  50% {
    translate: 14px -10px;
  }
  100% {
    translate: -8px 8px;
  }
}

@keyframes dacha-hammock {
  from {
    rotate: -2deg;
  }
  to {
    rotate: 2deg;
  }
}

@keyframes dacha-flutter {
  0%,
  100% {
    translate: 0 0;
  }
  25% {
    translate: 60px -50px;
  }
  50% {
    translate: 130px -10px;
  }
  75% {
    translate: 50px 30px;
  }
}

@keyframes dacha-wings {
  from {
    scale: 1 1;
  }
  to {
    scale: 0.3 1;
  }
}
</style>
