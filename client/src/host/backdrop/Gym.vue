<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(4339);
const f1 = (n: number) => n.toFixed(1);

// one-point room: the back wall is a flat rectangle, side walls and floor converge on VP
const VP = { x: 960, y: 400 };
const BACK = { l: 260, r: 1660, t: 60, b: 740 };
const INK = '#1b1033';

// h is a height measured on the back wall; a side-wall point at screen x scales it away from VP
const wallY = (x: number, h: number) => VP.y + ((h - VP.y) * Math.abs(x - VP.x)) / (BACK.r - VP.x);
const wallQuad = (x0: number, x1: number, h0: number, h1: number) =>
  `M${f1(x0)} ${f1(wallY(x0, h0))} L${f1(x1)} ${f1(wallY(x1, h0))} L${f1(x1)} ${f1(wallY(x1, h1))} L${f1(x0)} ${f1(wallY(x0, h1))} Z`;
// affine stand-in for perspective: maps a local 0..100 square onto a side-wall patch, close enough for posters
const wallMatrix = (x0: number, x1: number, h0: number, h1: number) => {
  const y0 = wallY(x0, h0);
  return `matrix(${((x1 - x0) / 100).toFixed(4)} ${((wallY(x1, h0) - y0) / 100).toFixed(4)} 0 ${((wallY(x0, h1) - y0) / 100).toFixed(4)} ${f1(x0)} ${f1(y0)})`;
};
const floorX = (x: number, y: number) => VP.x + ((x - VP.x) * (y - VP.y)) / (BACK.b - VP.y);
const floorQuad = (x0: number, x1: number, y0: number, y1: number) =>
  `M${f1(floorX(x0, y0))} ${y0} L${f1(floorX(x1, y0))} ${y0} L${f1(floorX(x1, y1))} ${y1} L${f1(floorX(x0, y1))} ${y1} Z`;

const LEFT_WALL = `M-80 ${f1(wallY(-80, BACK.t))} L${BACK.l} ${BACK.t} L${BACK.l} ${BACK.b} L-80 ${f1(wallY(-80, BACK.b))} Z`;
const RIGHT_WALL = `M2000 ${f1(wallY(2000, BACK.t))} L${BACK.r} ${BACK.t} L${BACK.r} ${BACK.b} L2000 ${f1(wallY(2000, BACK.b))} Z`;
const CEILING = `M-80 -160 L2000 -160 L2000 ${f1(wallY(2000, BACK.t))} L${BACK.r} ${BACK.t} L${BACK.l} ${BACK.t} L-80 ${f1(wallY(-80, BACK.t))} Z`;
const FLOOR = `M-80 ${f1(wallY(-80, BACK.b))} L${BACK.l} ${BACK.b} L${BACK.r} ${BACK.b} L2000 ${f1(wallY(2000, BACK.b))} L2000 1140 L-80 1140 Z`;
const WIN = { l: 600, r: 1320, t: 140, b: 560 };
const BACK_WALL = `M${BACK.l} ${BACK.t} H${BACK.r} V${BACK.b} H${BACK.l} Z M${WIN.l} ${WIN.t} V${WIN.b} H${WIN.r} V${WIN.t} Z`;

const stripe = (h0: number, h1: number) => `M${BACK.l} ${h0} H${BACK.r} V${h1} H${BACK.l} Z ${wallQuad(-80, BACK.l, h0, h1)} ${wallQuad(BACK.r, 2000, h0, h1)}`;
const STRIPE_CORAL = stripe(596, 624);
const STRIPE_TEAL = stripe(632, 648);
const BASEBOARD = stripe(720, 740);

const PLANK_XS = Array.from({ length: 40 }, (_, i) => -400 + i * 70);
const PLANKS = PLANK_XS.map((x) => `M${f1(x)} ${BACK.b} L${f1(floorX(x, 1140))} 1140`).join(' ');
const SEAM_ROWS = [762, 790, 824, 866, 916, 976, 1046, 1126];
const SEAMS = SEAM_ROWS.flatMap((y, j) =>
  PLANK_XS.filter((_, i) => (i + j) % 3 === Math.floor(rnd() * 3) % 3).map((x) => `M${f1(floorX(x, y))} ${y} L${f1(floorX(x + 70, y))} ${y}`),
).join(' ');
const GLOSS = [440, 820, 1180, 1520].map((x) => floorQuad(x, x + 26, 760, 1140)).join(' ');
const MAT = floorQuad(560, 1360, 868, 1180);
const MAT_TILES = [760, 960, 1160].map((x) => `M${f1(floorX(x, 868))} 868 L${f1(floorX(x, 1140))} 1140`).join(' ') + ` M${f1(floorX(560, 990))} 990 L${f1(floorX(1360, 990))} 990`;

const FAR_CITY = [
  [620, 420, 70],
  [700, 380, 60],
  [770, 440, 90],
  [870, 400, 60],
  [940, 360, 70],
  [1020, 430, 80],
  [1110, 390, 60],
  [1180, 450, 90],
  [1250, 410, 70],
];
const NEAR_CITY = [
  { x: 610, t: 470, w: 90 },
  { x: 730, t: 440, w: 70 },
  { x: 840, t: 490, w: 110 },
  { x: 1000, t: 455, w: 80 },
  { x: 1110, t: 480, w: 100 },
  { x: 1230, t: 445, w: 90 },
];
const CITY_WINDOWS = NEAR_CITY.flatMap((b) =>
  Array.from({ length: Math.floor((540 - b.t - 20) / 22) }, (_, r) => [0.3, 0.7].map((t) => `M${f1(b.x + b.w * t - 6)} ${b.t + 16 + r * 22} h12`)).flat(),
).join(' ');
const BUSHES = [630, 690, 760, 1080, 1150, 1230, 1290];

const PANE_SHINE = [WIN.l + 40, 980].map((x) => `M${x} ${WIN.b - 10} L${x + 150} ${WIN.t + 10} L${x + 200} ${WIN.t + 10} L${x + 50} ${WIN.b - 10} Z M${x + 230} ${WIN.b - 10} L${x + 300} ${WIN.t + 120} L${x + 316} ${WIN.t + 120} L${x + 246} ${WIN.b - 10} Z`).join(' ');

const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${i ? 'L' : 'M'}${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
  }).join(' ') + ' Z';
const BELL_COLORS = ['#ff5a6e', '#ffb02e', '#2ec4b6', '#4a7bff', '#a66bff', '#3a3f5c'];
const DUMBBELLS = [
  ...Array.from({ length: 6 }, (_, i) => ({ x: -130 + i * 52, y: -158, r: 19, c: BELL_COLORS[i] })),
  ...Array.from({ length: 5 }, (_, i) => ({ x: -124 + i * 62, y: -84, r: 26, c: BELL_COLORS[(i + 2) % 6] })),
];
const KETTLEBELLS = [
  { x: 300, k: 1.15, c: '#3a3f5c', hi: '#7a80a8' },
  { x: 390, k: 0.9, c: '#ff5a6e', hi: '#ffb0b8' },
  { x: 465, k: 0.75, c: '#2ec4b6', hi: '#9ff0e8' },
  { x: 528, k: 0.6, c: '#ffb02e', hi: '#ffe39a' },
];

const TREADMILLS = [
  { x: 1110, y: 790, k: 0.92, d: 0 },
  { x: 1290, y: 818, k: 1, d: 0.3 },
  { x: 1475, y: 852, k: 1.08, d: 0.55 },
];
const BELT_MARKS = Array.from({ length: 11 }, (_, i) => `M${-130 + i * 30} -31 h12`).join(' ');

const CLOCK = { x: 1490, y: 196, r: 64 };
const CLOCK_TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (Math.PI / 6) * i;
  const r0 = i % 3 ? 44 : 38;
  return `M${f1(CLOCK.x + r0 * Math.sin(a))} ${f1(CLOCK.y - r0 * Math.cos(a))} L${f1(CLOCK.x + 50 * Math.sin(a))} ${f1(CLOCK.y - 50 * Math.cos(a))}`;
}).join(' ');

const PLATES = [
  { dx: 150, w: 36, h: 210, c: '#ff5a6e', hi: '#ffb0b8' },
  { dx: 190, w: 30, h: 168, c: '#4a7bff', hi: '#a8c4ff' },
  { dx: 222, w: 24, h: 118, c: '#ffb02e', hi: '#ffe39a' },
];
const LAMPS = [
  { x: 470, len: 110 },
  { x: 1450, len: 90 },
];
const BAG_BANDS = [430, 560, 660];
const CORNER_PLANTS = [
  { x: -30, flip: 1, k: 1.15 },
  { x: 1960, flip: -1, k: 1.1 },
];
const CORNER_LEAVES = [10, 35, 60, -15];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="gym-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4fb0ff" />
        <stop offset="100%" stop-color="#d4f0ff" />
      </linearGradient>
      <linearGradient id="gym-wall" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#fff6e2" />
        <stop offset="100%" stop-color="#f7d6a8" />
      </linearGradient>
      <linearGradient id="gym-side-l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e2a874" />
        <stop offset="100%" stop-color="#f4cf9e" />
      </linearGradient>
      <linearGradient id="gym-side-r" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="#d89a68" />
        <stop offset="100%" stop-color="#efc591" />
      </linearGradient>
      <linearGradient id="gym-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e9b47a" />
        <stop offset="55%" stop-color="#d89254" />
        <stop offset="100%" stop-color="#a8622e" />
      </linearGradient>
      <linearGradient id="gym-mat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6f8fd0" />
        <stop offset="100%" stop-color="#3d5aa6" />
      </linearGradient>
      <linearGradient id="gym-mirror" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8fbff" />
        <stop offset="60%" stop-color="#a8dcef" />
        <stop offset="100%" stop-color="#8ab4de" />
      </linearGradient>
      <linearGradient id="gym-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#eef2fb" />
        <stop offset="55%" stop-color="#aab3cc" />
        <stop offset="100%" stop-color="#6a7394" />
      </linearGradient>
      <linearGradient id="gym-deck" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a6088" />
        <stop offset="100%" stop-color="#2e3252" />
      </linearGradient>
      <linearGradient id="gym-bag" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ff7a6a" />
        <stop offset="55%" stop-color="#e2384a" />
        <stop offset="100%" stop-color="#9a1a36" />
      </linearGradient>
      <linearGradient id="gym-water" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#c8efff" />
        <stop offset="60%" stop-color="#6cc6f4" />
        <stop offset="100%" stop-color="#3a8ed0" />
      </linearGradient>
      <radialGradient id="gym-ball-pink" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ffc2dc" />
        <stop offset="50%" stop-color="#ff6aa8" />
        <stop offset="100%" stop-color="#b8306e" />
      </radialGradient>
      <radialGradient id="gym-ball-teal" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#b8fff2" />
        <stop offset="50%" stop-color="#2ec4b6" />
        <stop offset="100%" stop-color="#16736c" />
      </radialGradient>
      <radialGradient id="gym-lampglow" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stop-color="#fff6c8" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#fff6c8" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="gym-sunlight" cx="50%" cy="0%" r="80%">
        <stop offset="0%" stop-color="#fff8dc" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fff8dc" stop-opacity="0" />
      </radialGradient>
      <clipPath id="gym-belt">
        <rect x="-98" y="-36" width="216" height="9" rx="4" />
      </clipPath>
      <clipPath id="gym-mirror-clip">
        <rect x="3" y="2" width="94" height="96" />
      </clipPath>
      <clipPath id="gym-floor-clip">
        <path :d="FLOOR" />
      </clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#gym-sky)" />
    <circle cx="1190" cy="230" r="86" fill="#fff6c8" opacity="0.4" class="gym-sun" />
    <circle cx="1190" cy="230" r="54" fill="#fff3a8" stroke="#e8a83a" stroke-width="3" />
    <path d="M1162 210 Q1172 194 1190 190" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />
    <g class="gym-cloud" fill="#fff" stroke="#9cc4ea" stroke-width="3">
      <path d="M660 250 Q660 222 690 222 Q700 196 732 204 Q756 190 774 214 Q800 214 800 240 Q800 258 780 258 H676 Q660 258 660 250 Z" />
      <path d="M1010 190 Q1010 170 1032 170 Q1042 152 1066 160 Q1086 152 1094 174 Q1114 176 1112 194 Q1110 206 1094 206 H1024 Q1010 206 1010 190 Z" />
    </g>
    <g class="gym-cloud gym-cloud-b" fill="#fff" stroke="#9cc4ea" stroke-width="3">
      <path d="M860 300 Q862 282 884 284 Q896 266 918 274 Q936 268 942 288 Q960 290 958 306 Q956 316 942 316 H872 Q860 316 860 300 Z" />
    </g>
    <path v-for="(b, i) in FAR_CITY" :key="`fc${i}`" :d="`M${b[0]} 560 V${b[1]} h${b[2]} V560 Z`" fill="#b9d6f4" stroke="#8fb0dd" stroke-width="3" stroke-linejoin="round" />
    <rect x="580" y="420" width="760" height="140" fill="url(#g-haze)" opacity="0.8" />
    <path v-for="(b, i) in NEAR_CITY" :key="`nc${i}`" :d="`M${b.x} 560 V${b.t} h${b.w} V560 Z`" fill="#8ea8de" stroke="#5c74b0" stroke-width="3" stroke-linejoin="round" />
    <path :d="CITY_WINDOWS" stroke="#e4f2ff" stroke-width="7" opacity="0.7" />
    <circle v-for="x in BUSHES" :key="`bu${x}`" :cx="x" cy="548" r="26" fill="#6cc46a" stroke="#3f8a4a" stroke-width="3" />

    <path :d="CEILING" fill="#e6b886" stroke="#a8566a" stroke-width="3" />
    <path :d="BACK_WALL" fill="url(#gym-wall)" fill-rule="evenodd" stroke="#a8566a" stroke-width="3" filter="url(#cel)" />
    <path :d="LEFT_WALL" fill="url(#gym-side-l)" stroke="#a8566a" stroke-width="3" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="RIGHT_WALL" fill="url(#gym-side-r)" stroke="#a8566a" stroke-width="3" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="STRIPE_CORAL" fill="#ff7a6a" />
    <path :d="STRIPE_TEAL" fill="#2ec4b6" />
    <path :d="BASEBOARD" fill="#8a4e3a" stroke="#5a2a2a" stroke-width="2" />
    <path :d="`M${BACK.l} 80 V700 M${BACK.r} 80 V700`" stroke="#c88a62" stroke-width="3" opacity="0.5" />

    <rect :x="WIN.l - 20" :y="WIN.t - 20" :width="WIN.r - WIN.l + 40" :height="WIN.b - WIN.t + 40" rx="10" fill="none" stroke="#ffffff" stroke-width="26" />
    <rect :x="WIN.l - 33" :y="WIN.t - 33" :width="WIN.r - WIN.l + 66" :height="WIN.b - WIN.t + 66" rx="16" fill="none" :stroke="INK" stroke-width="4" />
    <rect :x="WIN.l - 7" :y="WIN.t - 7" :width="WIN.r - WIN.l + 14" :height="WIN.b - WIN.t + 14" fill="none" :stroke="INK" stroke-width="4" />
    <path :d="`M960 ${WIN.t} V${WIN.b} M${WIN.l} 350 H${WIN.r}`" :stroke="INK" stroke-width="20" />
    <path :d="`M960 ${WIN.t} V${WIN.b} M${WIN.l} 350 H${WIN.r}`" stroke="#fff" stroke-width="12" />
    <path :d="PANE_SHINE" fill="#fff" opacity="0.2" />
    <rect :x="WIN.l - 50" :y="WIN.b + 26" :width="WIN.r - WIN.l + 100" height="20" rx="6" fill="#fffaf0" :stroke="INK" stroke-width="4" />
    <g transform="translate(1250 582)">
      <path d="M-20 0 L-16 -34 H16 L20 0 Z" fill="#ff8a5a" :stroke="INK" stroke-width="4" stroke-linejoin="round" />
      <rect x="-20" y="-40" width="40" height="10" rx="3" fill="#ffa478" :stroke="INK" stroke-width="3" />
      <g fill="#3fb06a" :stroke="INK" stroke-width="3" stroke-linejoin="round">
        <path d="M0 -40 Q-30 -60 -34 -88 Q-6 -78 0 -40 Z" />
        <path d="M0 -40 Q26 -66 24 -96 Q4 -80 0 -40 Z" />
        <path d="M0 -40 Q-4 -80 6 -108 Q14 -76 0 -40 Z" />
      </g>
    </g>
    <path d="M712 582 Q718 556 742 556 Q766 556 772 582" fill="#4a7bff" :stroke="INK" stroke-width="4" />
    <path d="M724 568 Q732 562 744 562" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7" />

    <g transform="translate(386 270) rotate(-3)">
      <rect x="-80" y="-104" width="160" height="208" rx="6" fill="#ffd23f" :stroke="INK" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-64" y="-88" width="128" height="176" rx="4" fill="#ff8a3a" opacity="0.35" />
      <path d="M14 -76 L-40 10 H-2 L-18 80 L44 -16 H6 Z" fill="#fff6c8" :stroke="INK" stroke-width="5" stroke-linejoin="round" />
      <path d="M8 -60 L-26 -2" stroke="#fff" stroke-width="4" stroke-linecap="round" />
      <rect x="-30" y="-114" width="60" height="18" fill="#fff" opacity="0.7" transform="rotate(4)" />
    </g>

    <circle :cx="CLOCK.x" :cy="CLOCK.y + 6" :r="CLOCK.r" fill="#8a4e3a" opacity="0.25" />
    <circle :cx="CLOCK.x" :cy="CLOCK.y" :r="CLOCK.r" fill="#ff7a6a" :stroke="INK" stroke-width="5" filter="url(#cel-s)" />
    <circle :cx="CLOCK.x" :cy="CLOCK.y" :r="CLOCK.r - 12" fill="#fffaf0" :stroke="INK" stroke-width="3" />
    <path :d="CLOCK_TICKS" :stroke="INK" stroke-width="4" stroke-linecap="round" />
    <path :d="`M${CLOCK.x - 36} ${CLOCK.y - 50} Q${CLOCK.x - 56} ${CLOCK.y - 30} ${CLOCK.x - 58} ${CLOCK.y - 6}`" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <g :transform="`translate(${CLOCK.x} ${CLOCK.y})`">
      <path class="gym-hand gym-hand-h" d="M0 6 V-28" :stroke="INK" stroke-width="7" stroke-linecap="round" />
      <path class="gym-hand gym-hand-m" d="M0 8 V-42" stroke="#e2384a" stroke-width="4" stroke-linecap="round" />
      <circle r="6" :fill="INK" />
    </g>

    <g :transform="wallMatrix(-30, 236, 150, 650)">
      <rect x="0" y="0" width="100" height="100" rx="2" fill="#fffaf0" :stroke="INK" stroke-width="5" vector-effect="non-scaling-stroke" />
      <rect x="3" y="2" width="94" height="96" fill="url(#gym-mirror)" :stroke="INK" stroke-width="3" vector-effect="non-scaling-stroke" />
      <path d="M8 98 V70 H40 V98 M60 98 V60 H92 V98" fill="#9ccbe4" opacity="0.5" />
      <path d="M10 40 L30 10 L40 10 L20 40 Z M46 46 L72 6 L78 6 L52 46 Z" fill="#fff" opacity="0.55" />
      <g clip-path="url(#gym-mirror-clip)">
        <path class="gym-shine" d="M-40 100 L0 0 L14 0 L-26 100 Z M-18 100 L22 0 L28 0 L-12 100 Z" fill="#fff" opacity="0.7" />
      </g>
    </g>

    <g :transform="wallMatrix(1690, 1800, 170, 410)">
      <rect x="0" y="0" width="100" height="100" rx="3" fill="#2ec4b6" :stroke="INK" stroke-width="5" vector-effect="non-scaling-stroke" />
      <path d="M8 84 L36 34 L52 58 L64 42 L92 84 Z" fill="#e8fffb" :stroke="INK" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      <path d="M36 34 L28 48 L36 44 L42 50 L44 44 Z" fill="#fff" />
      <path d="M36 34 V12 M36 12 L56 17 L36 22" fill="#ff5a6e" :stroke="INK" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      <circle cx="78" cy="18" r="9" fill="#ffd23f" />
    </g>
    <g :transform="wallMatrix(1840, 1960, 150, 440)">
      <rect x="0" y="0" width="100" height="100" rx="3" fill="#a66bff" :stroke="INK" stroke-width="5" vector-effect="non-scaling-stroke" />
      <path d="M50 84 Q14 58 18 34 Q22 16 38 18 Q48 20 50 32 Q52 20 62 18 Q78 16 82 34 Q86 58 50 84 Z" fill="#ff5a6e" :stroke="INK" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      <path d="M28 32 Q30 24 38 24" stroke="#ffc0c8" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M10 52 H34 L40 40 L48 64 L56 46 L62 52 H90" stroke="#fff6c8" stroke-width="3" fill="none" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
    </g>

    <path :d="FLOOR" fill="url(#gym-floor)" :stroke="INK" stroke-width="4" stroke-linejoin="round" />
    <g clip-path="url(#gym-floor-clip)">
      <path :d="PLANKS" stroke="#9a5a2e" stroke-width="2.5" opacity="0.35" />
      <path :d="SEAMS" stroke="#9a5a2e" stroke-width="2.5" opacity="0.4" />
      <path :d="GLOSS" fill="#fff6e0" opacity="0.14" />
    </g>
    <ellipse cx="960" cy="760" rx="420" ry="40" fill="url(#gym-sunlight)" />
    <path :d="MAT" fill="url(#gym-mat)" :stroke="INK" stroke-width="4" stroke-linejoin="round" opacity="0.75" />
    <path :d="MAT_TILES" stroke="#2a3e7a" stroke-width="3" opacity="0.45" />

    <g v-for="(l, i) in LAMPS" :key="`lp${i}`">
      <path :d="`M${l.x} -80 V${l.len - 20}`" :stroke="INK" stroke-width="4" />
      <path :d="`M${l.x - 70} ${l.len + 260} L${l.x - 40} ${l.len + 30} H${l.x + 40} L${l.x + 70} ${l.len + 260} Z`" fill="url(#gym-lampglow)" class="gym-glow" :style="{ animationDelay: `-${i * 1.3}s` }" />
      <path :d="`M${l.x - 14} ${l.len - 22} H${l.x + 14} L${l.x + 46} ${l.len + 26} H${l.x - 46} Z`" fill="#2ec4b6" :stroke="INK" stroke-width="4" stroke-linejoin="round" />
      <path :d="`M${l.x - 6} ${l.len - 14} L${l.x - 30} ${l.len + 18}`" stroke="#b8fff2" stroke-width="4" stroke-linecap="round" />
      <ellipse :cx="l.x" :cy="l.len + 28" rx="26" ry="8" fill="#fff6c8" :stroke="INK" stroke-width="3" />
    </g>

    <ellipse cx="1700" cy="806" rx="70" ry="12" fill="#3a1a10" opacity="0.3" />
    <g transform="translate(1700 800) scale(0.9)">
      <rect x="-52" y="-176" width="104" height="176" rx="12" fill="#f2f4fb" :stroke="INK" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-34" y="-136" width="68" height="64" rx="8" fill="#c8cee4" :stroke="INK" stroke-width="3" />
      <rect x="-24" y="-136" width="14" height="16" rx="3" fill="#4a7bff" :stroke="INK" stroke-width="3" />
      <rect x="10" y="-136" width="14" height="16" rx="3" fill="#ff5a6e" :stroke="INK" stroke-width="3" />
      <rect x="-30" y="-84" width="60" height="8" rx="3" fill="#8a90b0" :stroke="INK" stroke-width="2" />
      <path d="M-40 -60 H40 M-40 -40 H40" stroke="#c8cee4" stroke-width="3" />
      <path d="M-38 -166 V-20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8" />
      <rect x="-18" y="-196" width="36" height="22" rx="4" fill="#6cc6f4" :stroke="INK" stroke-width="4" />
      <path d="M-44 -196 Q-48 -300 -36 -330 Q0 -346 36 -330 Q48 -300 44 -196 Z" fill="url(#gym-water)" :stroke="INK" stroke-width="5" stroke-linejoin="round" opacity="0.92" />
      <path d="M-44 -250 Q-22 -258 0 -250 Q22 -242 44 -250" stroke="#2a78c0" stroke-width="3" fill="none" opacity="0.6" />
      <path d="M-28 -310 Q-34 -270 -30 -216" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.85" />
      <circle cx="10" cy="-214" r="7" fill="#e8f8ff" stroke="#2a78c0" stroke-width="2" class="gym-bubble" />
      <rect x="54" y="-150" width="20" height="70" rx="6" fill="#fffaf0" :stroke="INK" stroke-width="3" />
    </g>

    <g v-for="(t, i) in TREADMILLS" :key="`tm${i}`" :transform="`translate(${t.x} ${t.y}) scale(${t.k})`">
      <ellipse cx="0" cy="6" rx="150" ry="14" fill="#3a1a10" opacity="0.3" />
      <path d="M-120 -30 H112 Q132 -30 132 -15 Q132 0 112 0 H-120 Z" fill="url(#gym-deck)" :stroke="INK" stroke-width="5" stroke-linejoin="round" />
      <rect x="-100" y="-38" width="220" height="12" rx="6" fill="#262a44" :stroke="INK" stroke-width="3" />
      <g clip-path="url(#gym-belt)">
        <path class="gym-belt" :d="BELT_MARKS" stroke="#7a80a8" stroke-width="3" :style="{ animationDelay: `-${t.d}s` }" />
      </g>
      <circle cx="116" cy="-15" r="9" fill="#aab3cc" :stroke="INK" stroke-width="3" />
      <path d="M-110 -26 H100" stroke="#8a90c0" stroke-width="3" opacity="0.6" />
      <path d="M-134 -26 L-134 -62 Q-134 -72 -122 -72 L-84 -72 Q-72 -72 -72 -62 L-72 -26 Z" fill="#ff7a6a" :stroke="INK" stroke-width="4" stroke-linejoin="round" />
      <path d="M-126 -62 H-88" stroke="#ffc0b8" stroke-width="4" stroke-linecap="round" />
      <path d="M-112 -70 L-132 -190 M-128 -166 L-30 -132 V-46" :stroke="INK" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M-112 -70 L-132 -190 M-128 -166 L-30 -132 V-46" stroke="url(#gym-metal)" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <g transform="rotate(-16 -130 -205)">
        <rect x="-182" y="-234" width="100" height="56" rx="12" fill="#ff7a6a" :stroke="INK" stroke-width="4" />
        <rect x="-170" y="-224" width="62" height="30" rx="6" fill="#1b2a4a" :stroke="INK" stroke-width="2" />
        <path d="M-100 -218 v0.1 M-100 -202 v0.1" stroke="#ffd23f" stroke-width="9" stroke-linecap="round" />
        <path d="M-176 -228 H-120" stroke="#ffc0b8" stroke-width="3" stroke-linecap="round" />
      </g>
      <path d="M-160 -214 h20 M-156 -204 h34" stroke="#3af0ff" stroke-width="5" stroke-linecap="round" transform="rotate(-16 -130 -205)" class="gym-blink" :style="{ animationDelay: `-${t.d * 3}s` }" />
      <rect x="-128" y="-4" width="20" height="10" rx="3" :fill="INK" />
      <rect x="96" y="-4" width="20" height="10" rx="3" :fill="INK" />
    </g>

    <ellipse cx="460" cy="806" rx="200" ry="16" fill="#3a1a10" opacity="0.3" />
    <g transform="translate(460 800)">
      <path d="M-170 0 V-200 M170 0 V-200" :stroke="INK" stroke-width="16" stroke-linecap="round" />
      <path d="M-170 0 V-200 M170 0 V-200" stroke="url(#gym-metal)" stroke-width="9" stroke-linecap="round" />
      <path d="M-178 -128 L178 -136 L178 -122 L-178 -114 Z M-178 -52 L178 -60 L178 -46 L-178 -38 Z" fill="#5a6385" :stroke="INK" stroke-width="4" stroke-linejoin="round" />
      <g :stroke="INK" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)">
        <path v-for="(d, i) in DUMBBELLS" :key="`db${i}`" :d="hex(d.x, d.y, d.r)" :fill="d.c" />
      </g>
      <circle v-for="(d, i) in DUMBBELLS" :key="`dh${i}`" :cx="d.x" :cy="d.y" :r="d.r * 0.32" fill="#d8dcea" :stroke="INK" stroke-width="3" />
      <path :d="DUMBBELLS.map((d) => `M${f1(d.x - d.r * 0.6)} ${f1(d.y - d.r * 0.5)} L${f1(d.x - d.r * 0.1)} ${f1(d.y - d.r * 0.78)}`).join(' ')" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.6" />
    </g>

    <g v-for="(b, i) in KETTLEBELLS" :key="`kb${i}`" :transform="`translate(${b.x} 858) scale(${b.k})`">
      <ellipse cx="0" cy="4" rx="44" ry="9" fill="#3a1a10" opacity="0.3" />
      <path d="M-20 -50 Q-26 -96 0 -96 Q26 -96 20 -50" fill="none" :stroke="INK" stroke-width="18" />
      <path d="M-20 -50 Q-26 -96 0 -96 Q26 -96 20 -50" fill="none" :stroke="b.c" stroke-width="9" />
      <path d="M-30 0 Q-46 -30 -28 -54 Q0 -72 28 -54 Q46 -30 30 0 Z" :fill="b.c" :stroke="INK" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-26 -36 Q-22 -50 -8 -56" :stroke="b.hi" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-12 -92 Q-4 -96 6 -94" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7" />
    </g>

    <ellipse cx="170" cy="966" rx="90" ry="16" fill="#3a1a10" opacity="0.22" />
    <g transform="translate(170 -80)">
      <g class="gym-swing">
        <path d="M0 0 V380 M0 380 L-50 420 M0 380 L50 420" :stroke="INK" stroke-width="5" fill="none" />
        <path d="M0 0 V380" stroke="#aab3cc" stroke-width="2" stroke-dasharray="8 6" />
        <rect x="-26" y="372" width="52" height="16" rx="5" fill="#3a3f5c" :stroke="INK" stroke-width="3" />
        <path d="M-70 430 Q-70 410 -50 410 H50 Q70 410 70 430 V756 Q70 790 0 790 Q-70 790 -70 756 Z" fill="url(#gym-bag)" :stroke="INK" stroke-width="6" stroke-linejoin="round" />
        <path v-for="y in BAG_BANDS" :key="`bb${y}`" :d="`M-70 ${y} Q0 ${y + 18} 70 ${y} V${y + 22} Q0 ${y + 40} -70 ${y + 22} Z`" fill="#3a3f5c" :stroke="INK" stroke-width="3" />
        <path d="M-48 448 V740" stroke="#ffb8a8" stroke-width="8" stroke-linecap="round" opacity="0.7" />
        <path d="M40 470 Q46 500 42 530 M36 600 Q44 620 40 640" stroke="#7a1028" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5" />
      </g>
    </g>

    <g transform="translate(900 1040)" fill="none" stroke-linecap="round">
      <path d="M-200 0 Q-260 -40 -180 -46 Q-60 -54 20 -20 Q120 24 200 -10 Q260 -36 220 -60" :stroke="INK" stroke-width="10" />
      <path d="M-200 0 Q-260 -40 -180 -46 Q-60 -54 20 -20 Q120 24 200 -10 Q260 -36 220 -60" stroke="#ffd23f" stroke-width="5" />
      <rect x="-236" y="-8" width="60" height="22" rx="10" fill="#ff5a6e" :stroke="INK" stroke-width="4" transform="rotate(14 -206 3)" />
      <rect x="196" y="-84" width="60" height="22" rx="10" fill="#ff5a6e" :stroke="INK" stroke-width="4" transform="rotate(-30 226 -73)" />
    </g>

    <g transform="translate(520 1046)">
      <ellipse cx="-40" cy="34" rx="170" ry="16" fill="#3a1a10" opacity="0.3" />
      <rect x="-190" y="-36" width="230" height="64" rx="32" fill="#a66bff" :stroke="INK" stroke-width="5" filter="url(#cel-s)" />
      <ellipse cx="40" cy="-4" rx="18" ry="32" fill="#c9a6ff" :stroke="INK" stroke-width="4" />
      <path d="M40 -4 m-8 0 a8 14 0 1 1 8 14 a12 22 0 1 1 6 -26" stroke="#7a4ad0" stroke-width="3" fill="none" />
      <rect x="-160" y="-96" width="210" height="60" rx="30" fill="#2ec4b6" :stroke="INK" stroke-width="5" filter="url(#cel-s)" />
      <ellipse cx="50" cy="-66" rx="17" ry="30" fill="#9ff0e8" :stroke="INK" stroke-width="4" />
      <path d="M50 -66 m-7 0 a7 13 0 1 1 7 13 a11 20 0 1 1 5 -24" stroke="#16736c" stroke-width="3" fill="none" />
      <path d="M-170 -24 H-30 M-140 -84 H-20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.5" />
      <path d="M-100 -36 V28 M-60 -96 V-36" stroke="#1b1033" stroke-width="3" opacity="0.25" />
    </g>

    <ellipse cx="215" cy="1080" rx="110" ry="18" fill="#3a1a10" opacity="0.35" />
    <circle cx="215" cy="985" r="100" fill="url(#gym-ball-pink)" :stroke="INK" stroke-width="6" />
    <path d="M124 954 Q215 988 311 952 M140 1040 Q215 1016 292 1042" stroke="#b8306e" stroke-width="4" fill="none" opacity="0.5" />
    <path d="M155 925 Q174 899 205 892" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.85" />
    <circle cx="232" cy="894" r="5" fill="#fff" opacity="0.85" />
    <ellipse cx="40" cy="1110" rx="90" ry="14" fill="#3a1a10" opacity="0.35" />
    <circle cx="40" cy="1040" r="80" fill="url(#gym-ball-teal)" :stroke="INK" stroke-width="6" />
    <path d="M-4 994 Q12 974 36 968" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.85" />

    <ellipse cx="1700" cy="1070" rx="320" ry="22" fill="#3a1a10" opacity="0.35" />
    <g transform="translate(1700 1064)">
      <path d="M-120 0 V-110 M120 0 V-110" :stroke="INK" stroke-width="18" stroke-linecap="round" />
      <path d="M-120 0 V-110 M120 0 V-110" stroke="url(#gym-metal)" stroke-width="10" stroke-linecap="round" />
      <path d="M-140 0 H-100 M100 0 H140" :stroke="INK" stroke-width="10" stroke-linecap="round" />
      <path d="M-300 -110 H300" :stroke="INK" stroke-width="16" stroke-linecap="round" />
      <path d="M-300 -110 H300" stroke="url(#gym-metal)" stroke-width="8" stroke-linecap="round" />
      <path d="M-100 -116 V-104 M-80 -116 V-104 M-60 -116 V-104 M60 -116 V-104 M80 -116 V-104 M100 -116 V-104" :stroke="INK" stroke-width="2" opacity="0.4" />
      <g :stroke="INK" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
        <template v-for="(p, i) in PLATES" :key="`pl${i}`">
          <rect :x="-p.dx - p.w / 2" :y="-110 - p.h / 2" :width="p.w" :height="p.h" :rx="p.w / 2.4" :fill="p.c" />
          <rect :x="p.dx - p.w / 2" :y="-110 - p.h / 2" :width="p.w" :height="p.h" :rx="p.w / 2.4" :fill="p.c" />
        </template>
      </g>
      <path
        v-for="(p, i) in PLATES"
        :key="`ph${i}`"
        :d="`M${-p.dx - p.w / 4} ${-110 - p.h / 2 + 18} V${-110 + p.h / 4} M${p.dx - p.w / 4} ${-110 - p.h / 2 + 18} V${-110 + p.h / 4}`"
        :stroke="p.hi"
        stroke-width="5"
        stroke-linecap="round"
      />
      <rect x="-250" y="-122" width="14" height="24" rx="3" fill="#aab3cc" :stroke="INK" stroke-width="3" />
      <rect x="236" y="-122" width="14" height="24" rx="3" fill="#aab3cc" :stroke="INK" stroke-width="3" />
      <path d="M-64 -118 Q-30 -126 6 -118 L12 -10 L-2 -18 L-14 -6 L-26 -18 L-40 -6 L-52 -18 L-66 -8 Z" fill="#fffaf0" :stroke="INK" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-65 -60 L10 -64 M-65 -46 L11 -50" stroke="#2ec4b6" stroke-width="7" />
      <path d="M-54 -108 Q-30 -114 -6 -108" stroke="#d8dcea" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <g v-for="(c, i) in CORNER_PLANTS" :key="`cp${i}`" :transform="`translate(${c.x} 1150) scale(${c.flip * c.k} ${c.k})`">
      <path v-for="(a, j) in CORNER_LEAVES" :key="j" d="M0 0 Q-60 -110 0 -230 Q60 -110 0 0 Z" :transform="`rotate(${a})`" fill="#2a2148" stroke="#120a24" stroke-width="5" stroke-linejoin="round" />
      <path v-for="(a, j) in CORNER_LEAVES" :key="`r${j}`" d="M0 -10 Q4 -110 0 -210" :transform="`rotate(${a})`" stroke="#4a3e78" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.gym-sun {
  animation: gym-glow 4s ease-in-out infinite alternate;
}

.gym-glow {
  animation: gym-glow 3.2s ease-in-out infinite alternate;
}

.gym-cloud {
  animation: gym-drift 26s ease-in-out infinite alternate;
}

.gym-cloud-b {
  animation-duration: 19s;
  animation-direction: alternate-reverse;
}

.gym-hand {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: gym-spin linear infinite;
}

.gym-hand-m {
  animation-duration: 12s;
}

.gym-hand-h {
  animation-duration: 144s;
}

.gym-shine {
  animation: gym-shine 6s ease-in-out infinite;
}

.gym-swing {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: gym-swing 3.6s ease-in-out infinite alternate;
}

.gym-belt {
  animation: gym-belt 0.9s linear infinite;
}

.gym-blink {
  animation: gym-blink 1.4s steps(2, jump-none) infinite;
}

.gym-bubble {
  animation: gym-bubble 3s ease-in infinite;
}

@keyframes gym-glow {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}

@keyframes gym-drift {
  from {
    transform: translateX(-30px);
  }
  to {
    transform: translateX(40px);
  }
}

@keyframes gym-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes gym-shine {
  0%,
  45% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(160px);
  }
}

@keyframes gym-swing {
  from {
    transform: rotate(-2.5deg);
  }
  to {
    transform: rotate(2.5deg);
  }
}

@keyframes gym-belt {
  to {
    transform: translateX(30px);
  }
}

@keyframes gym-blink {
  to {
    opacity: 0.3;
  }
}

@keyframes gym-bubble {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translateY(-110px);
    opacity: 0;
  }
}
</style>
