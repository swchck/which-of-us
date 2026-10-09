<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(4339);
const f1 = (n: number) => n.toFixed(1);

type Pt = { x: number; y: number };
const qPoint = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) * (1 - t) * a.x + 2 * t * (1 - t) * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * t * (1 - t) * c.y + t * t * b.y,
});
const qPath = (a: Pt, c: Pt, b: Pt) => `M${f1(a.x)} ${f1(a.y)} Q${f1(c.x)} ${f1(c.y)} ${f1(b.x)} ${f1(b.y)}`;

const TX = 320;
const TY = 890;
const TIERS = [
  { top: -380, bot: -90, w: 295, n: 6, bulbs: 9 },
  { top: -520, bot: -270, w: 235, n: 5, bulbs: 7 },
  { top: -650, bot: -420, w: 175, n: 4, bulbs: 6 },
  { top: -740, bot: -560, w: 115, n: 3, bulbs: 4 },
];
// concave sides and a scalloped hem, so each tier reads as drooping branches rather than a triangle
const tierPath = (top: number, bot: number, w: number, n: number) => {
  const h = bot - top;
  let d = `M0 ${top} Q${f1(-w * 0.3)} ${f1(top + h * 0.6)} ${f1(-w)} ${bot}`;
  const step = (2 * w) / n;
  for (let i = 0; i < n; i++) {
    const x = -w + step * (i + 1);
    d += ` Q${f1(x - step / 2)} ${f1(bot + 26)} ${f1(x)} ${i === n - 1 ? bot : bot - 6}`;
  }
  return `${d} Q${f1(w * 0.3)} ${f1(top + h * 0.6)} 0 ${top} Z`;
};
const TIER_PATHS = TIERS.map((t) => tierPath(t.top, t.bot, t.w, t.n));
const NEEDLES = TIERS.flatMap((t) =>
  Array.from({ length: 20 }, () => {
    const f = 0.35 + rnd() * 0.6;
    const y = t.top + (t.bot - t.top) * f;
    const x = (rnd() - 0.5) * 1.3 * t.w * f;
    return `M${f1(x - 9)} ${f1(y - 5)} L${f1(x)} ${f1(y + 4)} L${f1(x + 9)} ${f1(y - 5)}`;
  }),
).join(' ');
const TIER_RIMS = TIERS.map((t) => {
  const h = t.bot - t.top;
  return `M-8 ${t.top + 30} Q${f1(-t.w * 0.22)} ${f1(t.top + h * 0.5)} ${f1(-t.w * 0.62)} ${f1(t.top + h * 0.82)}`;
}).join(' ');

const GARLANDS = TIERS.map((t) => {
  const h = t.bot - t.top;
  return { n: t.bulbs, a: { x: -0.4 * t.w, y: t.top + 0.58 * h }, c: { x: 0.05 * t.w, y: t.top + 1.02 * h }, b: { x: 0.62 * t.w, y: t.top + 0.8 * h } };
});
const GARLAND_WIRE = GARLANDS.map((g) => qPath(g.a, g.c, g.b)).join(' ');
const TINSEL_TREE = TIERS.filter((_, i) => i % 2 === 0)
  .map((t) => {
    const h = t.bot - t.top;
    return qPath({ x: -0.66 * t.w, y: t.top + 0.86 * h }, { x: -0.1 * t.w, y: t.top + 0.95 * h }, { x: 0.3 * t.w, y: t.top + 0.48 * h });
  })
  .join(' ');

const WINDOW_SWAGS: [Pt, Pt, Pt][] = [
  [
    { x: 1190, y: 78 },
    { x: 1320, y: 150 },
    { x: 1450, y: 84 },
  ],
  [
    { x: 1450, y: 84 },
    { x: 1580, y: 150 },
    { x: 1710, y: 78 },
  ],
];
const WINDOW_WIRE = WINDOW_SWAGS.map(([a, c, b]) => qPath(a, c, b)).join(' ');

const LIGHT_COLORS = ['#ffd23f', '#ff4a6a', '#4ad8ff', '#8cff5a', '#ff9a3a'];
const BULBS = [
  ...GARLANDS.flatMap((g) =>
    Array.from({ length: g.n }, (_, k) => {
      const p = qPoint(g.a, g.c, g.b, 0.06 + (0.88 * k) / (g.n - 1));
      return { x: p.x + TX, y: p.y + TY };
    }),
  ),
  ...WINDOW_SWAGS.flatMap(([a, c, b]) => Array.from({ length: 6 }, (_, k) => qPoint(a, c, b, 0.08 + k * 0.17))),
].map((p, i) => ({ ...p, c: LIGHT_COLORS[i % LIGHT_COLORS.length] }));
const LIGHTS = twinkleGroups(BULBS);

const BAUBLES = [
  { x: 130, y: 786, r: 21, c: '#e8304a' },
  { x: 330, y: 770, r: 23, c: '#ffc93a' },
  { x: 470, y: 800, r: 18, c: '#3a8aff' },
  { x: 230, y: 700, r: 15, c: '#b45aff' },
  { x: 170, y: 618, r: 18, c: '#ffc93a' },
  { x: 420, y: 608, r: 19, c: '#e8304a' },
  { x: 300, y: 560, r: 14, c: '#3ad89a' },
  { x: 230, y: 468, r: 16, c: '#3a8aff' },
  { x: 410, y: 462, r: 15, c: '#ffc93a' },
  { x: 330, y: 330, r: 14, c: '#e8304a' },
  { x: 268, y: 380, r: 11, c: '#b45aff' },
];

const STAR = Array.from({ length: 10 }, (_, i) => {
  const a = (i * Math.PI) / 5 - Math.PI / 2;
  const r = i % 2 ? 18 : 44;
  return `${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`;
}).join(' L');

// tinsel is a fat dashed stroke: each dash is a strand standing across the path, so it reads fluffy for free
const TOP_TINSEL = 'M-80 20 Q160 110 400 30 Q640 110 880 26 Q1120 106 1360 24 Q1600 104 1840 22 Q1940 60 2000 40';

const PAPER_FLAKES = [
  { x: 1268, y: 584, r: 30 },
  { x: 1640, y: 586, r: 24 },
  { x: 1268, y: 150, r: 18 },
  { x: 1636, y: 318, r: 20 },
];
const flakePath = (r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (k * Math.PI) / 3;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const at = (d: number, off: number) => `${f1(cos * d - sin * off)} ${f1(sin * d + cos * off)}`;
    return `M0 0 L${at(r, 0)} M${at(r * 0.55, 0)} L${at(r * 0.8, r * 0.22)} M${at(r * 0.55, 0)} L${at(r * 0.8, -r * 0.22)}`;
  }).join(' ');

const BLOCKS = [
  { x: 1190, w: 150, top: 392 },
  { x: 1352, w: 104, top: 452 },
  { x: 1446, w: 168, top: 360 },
  { x: 1606, w: 110, top: 430 },
];
const WIN_LIT: string[] = [];
const WIN_DARK: string[] = [];
for (const b of BLOCKS) {
  for (let y = b.top + 22; y < 600; y += 32) {
    for (let x = b.x + 14; x < b.x + b.w - 16; x += 24) {
      (rnd() < 0.38 ? WIN_LIT : WIN_DARK).push(`M${x} ${y} h12 v14 h-12 Z`);
    }
  }
}
const SKY_STARS = Array.from({ length: 22 }, () => `M${f1(1225 + rnd() * 450)} ${f1(116 + rnd() * 230)} h0.1`).join(' ');

const BURSTS = [
  { x: 1318, y: 196, r: 66, c: '#ffd23f', d: 0 },
  { x: 1592, y: 168, r: 56, c: '#ff5aa8', d: 1.3 },
  { x: 1522, y: 330, r: 80, c: '#5ae0ff', d: 2.5 },
].map((b) => {
  const rays = Array.from({ length: 14 }, (_, k) => {
    const a = (k * Math.PI * 2) / 14;
    return { cos: Math.cos(a), sin: Math.sin(a) };
  });
  return {
    ...b,
    lines: rays.map(({ cos, sin }) => `M${f1(cos * b.r * 0.3)} ${f1(sin * b.r * 0.3)} L${f1(cos * b.r * 0.82)} ${f1(sin * b.r * 0.82)}`).join(' '),
    dots: rays.map(({ cos, sin }) => `M${f1(cos * b.r)} ${f1(sin * b.r)} h0.1`).join(' '),
  };
});

const FLAKES = Array.from({ length: 44 }, () => ({ x: 1160 + rnd() * 540, y: rnd() * 1080, r: 2 + rnd() * 3.5 }));
// two falling sheets, each drawn twice a loop apart so the snowfall keyframe never shows a seam
const SNOW = [16, 11].map((s, i) => ({ s, flakes: FLAKES.filter((_, j) => j % 2 === i) }));

const CLOCK_TICKS = Array.from({ length: 12 }, (_, k) => {
  const a = (k * Math.PI) / 6;
  const r0 = k % 3 ? 44 : 38;
  return `M${f1(Math.sin(a) * r0)} ${f1(-Math.cos(a) * r0)} L${f1(Math.sin(a) * 50)} ${f1(-Math.cos(a) * 50)}`;
}).join(' ');

const PLANKS = Array.from({ length: 6 }, (_, i) => {
  const y = 836 + i * i * 9 + i * 34;
  let d = `M-60 ${y} H1980`;
  for (let x = ((i * 173) % 260) - 60; x < 1980; x += 260 + i * 40) d += ` M${x} ${y} v${18 + i * 8}`;
  return d;
}).join(' ');

const GIFTS = [
  { x: 96, y: 798, w: 150, h: 122, c: '#e8304a', dark: '#a81a34', rib: '#ffd23f' },
  { x: 372, y: 828, w: 122, h: 100, c: '#3a7aff', dark: '#1f4ab8', rib: '#ff4a6a' },
  { x: 228, y: 858, w: 112, h: 80, c: '#2fb877', dark: '#1a7a4a', rib: '#fff4d0' },
  { x: 468, y: 878, w: 78, h: 64, c: '#b45aff', dark: '#7a2ab8', rib: '#ffd23f' },
];

const TANGERINES = [
  { x: -34, y: -22 },
  { x: 30, y: -24 },
  { x: -2, y: -26 },
  { x: -10, y: -62 },
  { x: 40, y: -62 },
];
const SPARKS = [0, 1].map((g) =>
  Array.from({ length: 9 }, (_, k) => {
    const a = ((k + g * 0.5) * Math.PI * 2) / 9 + rnd() * 0.3;
    const r = 30 + rnd() * 36;
    return `M${f1(Math.cos(a) * 6)} ${f1(Math.sin(a) * 6)} L${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`;
  }).join(' '),
);
</script>

<template>
  <g>
    <defs>
      <linearGradient id="newyear-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a2a52" />
        <stop offset="100%" stop-color="#9c5a74" />
      </linearGradient>
      <pattern id="newyear-paper" width="96" height="120" patternUnits="userSpaceOnUse">
        <path d="M0 0 V120" stroke="#ffd6e6" stroke-width="10" opacity="0.06" />
        <path d="M48 22 l12 20 l-12 20 l-12 -20 Z M0 82 l8 14 l-8 14 l-8 -14 Z M96 82 l8 14 l-8 14 l-8 -14 Z" fill="#ffd6e6" opacity="0.1" />
      </pattern>
      <radialGradient id="newyear-warm">
        <stop offset="0%" stop-color="#ffc870" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffc870" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="newyear-vignette" cx="50%" cy="45%" r="75%">
        <stop offset="55%" stop-color="#1a0a2a" stop-opacity="0" />
        <stop offset="100%" stop-color="#1a0a2a" stop-opacity="0.5" />
      </radialGradient>
      <linearGradient id="newyear-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9a5432" />
        <stop offset="100%" stop-color="#5e2c1c" />
      </linearGradient>
      <linearGradient id="newyear-fir" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0%" stop-color="#46c46e" />
        <stop offset="100%" stop-color="#1a6a46" />
      </linearGradient>
      <linearGradient id="newyear-carpet" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c2384e" />
        <stop offset="100%" stop-color="#7e1a36" />
      </linearGradient>
      <linearGradient id="newyear-sofa" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stop-color="#3aa894" />
        <stop offset="100%" stop-color="#1b5e5e" />
      </linearGradient>
      <linearGradient id="newyear-drape" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f0b84a" />
        <stop offset="100%" stop-color="#a8641e" />
      </linearGradient>
      <linearGradient id="newyear-frame" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#cfc8e0" />
      </linearGradient>
      <linearGradient id="newyear-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c47a42" />
        <stop offset="100%" stop-color="#6a3418" />
      </linearGradient>
      <linearGradient id="newyear-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a8b4ff" stop-opacity="0" />
        <stop offset="100%" stop-color="#a8b4ff" stop-opacity="0.5" />
      </linearGradient>
      <linearGradient id="newyear-cloth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffdf6" />
        <stop offset="100%" stop-color="#d4cce8" />
      </linearGradient>
      <radialGradient id="newyear-tangerine" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ffc060" />
        <stop offset="100%" stop-color="#e8641a" />
      </radialGradient>
      <radialGradient id="newyear-cat" cx="35%" cy="25%" r="80%">
        <stop offset="0%" stop-color="#ffb860" />
        <stop offset="100%" stop-color="#d8701e" />
      </radialGradient>
      <radialGradient id="newyear-flare">
        <stop offset="0%" stop-color="#fff6c0" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#ffb02e" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="newyear-starglow">
        <stop offset="0%" stop-color="#ffb08a" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#ff6a5a" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="newyear-mors" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ff5a6a" />
        <stop offset="100%" stop-color="#a8102a" />
      </linearGradient>
      <clipPath id="newyear-glass">
        <rect x="1222" y="112" width="456" height="516" />
      </clipPath>
      <clipPath id="newyear-plaid-clip">
        <path d="M30 -340 Q170 -356 306 -338 L306 -170 Q250 -150 236 -64 L72 -64 Q60 -160 30 -210 Z" />
      </clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="870" fill="url(#newyear-wall)" />
    <rect x="-60" y="-60" width="2040" height="870" fill="url(#newyear-paper)" />

    <g clip-path="url(#newyear-glass)">
      <rect x="1200" y="100" width="500" height="540" fill="url(#g-newyear)" />
      <path :d="SKY_STARS" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      <g v-for="(b, i) in BURSTS" :key="`fw${i}`" :transform="`translate(${b.x} ${b.y})`">
        <g class="newyear-burst" :style="{ animationDelay: `-${b.d}s` }">
          <path :d="b.lines" :stroke="b.c" stroke-width="5" stroke-linecap="round" />
          <path :d="b.dots" stroke="#fff" stroke-width="9" stroke-linecap="round" />
          <path :d="b.dots" :stroke="b.c" stroke-width="5" stroke-linecap="round" />
          <circle r="9" fill="#fff" />
        </g>
      </g>
      <path d="M1200 470 L1240 420 L1290 452 L1350 404 L1410 448 L1470 410 L1540 446 L1600 400 L1660 440 L1700 420 L1700 640 L1200 640 Z" fill="#5a66b0" stroke="#8a96dc" stroke-width="2" stroke-linejoin="round" />
      <g v-for="(b, i) in BLOCKS" :key="`bl${i}`">
        <rect :x="b.x" :y="b.top" :width="b.w" height="260" fill="#34407e" stroke="#8a96d8" stroke-width="3" />
        <rect :x="b.x - 4" :y="b.top - 6" :width="b.w + 8" height="10" rx="5" fill="#eef2ff" stroke="#8a96d8" stroke-width="2" />
      </g>
      <path :d="WIN_DARK.join(' ')" fill="#28306a" />
      <path :d="WIN_LIT.join(' ')" fill="#ffd96b" />
      <rect x="1200" y="360" width="500" height="280" fill="url(#newyear-haze)" />
      <path d="M1200 600 Q1300 586 1400 598 Q1520 610 1700 590 L1700 640 L1200 640 Z" fill="#e4eaff" stroke="#a8b4ec" stroke-width="3" />
      <g v-for="(sheet, i) in SNOW" :key="`sn${i}`" class="flake" fill="#fff" :style="{ animationDuration: `${sheet.s}s` }">
        <template v-for="(f, j) in sheet.flakes" :key="j">
          <circle :cx="f.x" :cy="f.y" :r="f.r" />
          <circle :cx="f.x - 60" :cy="f.y - 1080" :r="f.r" />
        </template>
      </g>
      <path d="M1240 360 L1330 240 M1262 380 L1340 276 M1490 600 L1600 450 M1516 610 L1610 482" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.12" />
    </g>
    <g stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.92">
      <g v-for="(p, i) in PAPER_FLAKES" :key="`pf${i}`" :transform="`translate(${p.x} ${p.y})`">
        <path :d="flakePath(p.r)" />
        <circle r="5" fill="#fff" />
      </g>
    </g>
    <path
      d="M1196 86 H1704 V654 H1196 Z M1222 112 V256 H1438 V112 Z M1462 112 V256 H1678 V112 Z M1222 280 V628 H1438 V280 Z M1462 280 V628 H1678 V280 Z"
      fill="url(#newyear-frame)"
      fill-rule="evenodd"
      stroke="#1b1033"
      stroke-width="5"
      stroke-linejoin="round"
      filter="url(#cel-s)"
    />
    <path d="M1300 268 h40 M1556 268 h40" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
    <rect x="1166" y="636" width="568" height="30" rx="6" fill="url(#newyear-frame)" stroke="#1b1033" stroke-width="5" />
    <path d="M1180 646 H1600" stroke="#fff" stroke-width="5" stroke-linecap="round" />

    <g stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <rect v-for="k in 9" :key="`rad${k}`" :x="1272 + k * 34" y="690" width="28" height="104" rx="12" fill="#ece6f2" />
      <path d="M1300 704 H1600 M1300 780 H1600" stroke-width="5" opacity="0.5" />
    </g>
    <path v-for="k in 9" :key="`radh${k}`" :d="`M${1281 + k * 34} 704 v70`" stroke="#fff" stroke-width="4" stroke-linecap="round" />

    <path d="M1196 100 Q1214 360 1208 620 Q1240 360 1262 100 Z M1704 100 Q1686 360 1692 620 Q1660 360 1638 100 Z" fill="#fff" opacity="0.28" />
    <path d="M1080 66 H1820" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
    <path d="M1080 66 H1820" stroke="#d8a040" stroke-width="7" stroke-linecap="round" />
    <circle cx="1072" cy="66" r="14" fill="#d8a040" stroke="#1b1033" stroke-width="4" />
    <circle cx="1828" cy="66" r="14" fill="#d8a040" stroke="#1b1033" stroke-width="4" />
    <g fill="url(#newyear-drape)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)">
      <path d="M1094 60 H1244 Q1236 300 1188 470 Q1222 640 1248 810 H1084 Q1110 640 1130 470 Q1100 300 1094 60 Z" />
      <path d="M1656 60 H1806 Q1800 300 1770 470 Q1790 640 1816 810 H1652 Q1678 640 1712 470 Q1664 300 1656 60 Z" />
    </g>
    <path d="M1128 90 Q1140 300 1150 460 M1166 90 Q1176 260 1166 460 M1206 90 Q1196 300 1172 460 M1140 500 Q1130 640 1118 790 M1180 500 Q1190 640 1210 790 M1692 90 Q1700 300 1730 460 M1730 90 Q1740 260 1746 460 M1770 90 Q1770 300 1758 460 M1730 500 Q1716 640 1700 790 M1760 500 Q1774 640 1790 790" stroke="#8a4a14" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5" />
    <path d="M1110 100 Q1118 260 1124 420 M1672 100 Q1680 260 1700 420" stroke="#ffe6a0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    <g stroke="#1b1033" stroke-width="4">
      <rect x="1116" y="458" width="84" height="26" rx="12" fill="#c8283e" />
      <rect x="1700" y="458" width="84" height="26" rx="12" fill="#c8283e" />
    </g>

    <circle cx="320" cy="560" r="520" fill="url(#newyear-warm)" />

    <g transform="translate(850 0)">
      <rect x="-212" y="180" width="424" height="420" rx="10" fill="url(#newyear-carpet)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
      <rect x="-184" y="206" width="368" height="368" fill="none" stroke="#e0a848" stroke-width="7" opacity="0.8" />
      <path d="M-160 230 L-136 250 L-160 270 M160 230 L136 250 L160 270 M-160 520 L-136 540 L-160 560 M160 520 L136 540 L160 560" stroke="#e0a848" stroke-width="6" fill="none" stroke-linejoin="round" opacity="0.7" />
      <path d="M-196 196 V584 M196 196 V584" stroke="#5a0e24" stroke-width="10" stroke-dasharray="14 12" opacity="0.5" />
      <path d="M0 250 L120 390 L0 530 L-120 390 Z" fill="#244276" stroke="#e0a848" stroke-width="6" stroke-linejoin="round" />
      <path d="M0 300 L70 390 L0 480 L-70 390 Z" fill="#a8243a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" opacity="0.9" />
      <path d="M0 350 L30 390 L0 430 L-30 390 Z" fill="#e0a848" />
      <path d="M-200 182 v-12 M-170 182 v-12 M-140 182 v-12 M-110 182 v-12 M-80 182 v-12 M-50 182 v-12 M-20 182 v-12 M10 182 v-12 M40 182 v-12 M70 182 v-12 M100 182 v-12 M130 182 v-12 M160 182 v-12 M190 182 v-12" stroke="#e8c48a" stroke-width="4" stroke-linecap="round" />
    </g>

    <g transform="translate(555 300)">
      <g class="newyear-swing" style="animation-duration: 1.2s">
        <path d="M0 0 V118" stroke="#1b1033" stroke-width="9" stroke-linecap="round" />
        <path d="M0 0 V118" stroke="#e0a848" stroke-width="4" stroke-linecap="round" />
        <circle cy="130" r="20" fill="#e0a848" stroke="#1b1033" stroke-width="4" />
        <path d="M-10 122 Q-6 114 2 112" stroke="#fff6c8" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
    </g>
    <g transform="translate(555 245)">
      <path d="M-24 -76 Q0 -100 24 -76 Z" fill="url(#newyear-wood)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <circle r="70" fill="url(#newyear-wood)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <circle r="55" fill="#fff4dc" stroke="#1b1033" stroke-width="4" />
      <path :d="CLOCK_TICKS" stroke="#5a3418" stroke-width="4" stroke-linecap="round" />
      <path d="M0 0 L-3 -30" stroke="#1b1033" stroke-width="7" stroke-linecap="round" />
      <path d="M0 0 L-9 -46" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
      <circle r="6" fill="#e8304a" stroke="#1b1033" stroke-width="2.5" />
      <path d="M-46 -30 Q-36 -48 -18 -54" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>

    <path d="M-80 788 H2000 V812 H-80 Z" fill="#ecdcc8" stroke="#1b1033" stroke-width="4" />
    <rect x="-60" y="810" width="2040" height="340" fill="url(#newyear-floor)" />
    <path :d="PLANKS" stroke="#3a1a10" stroke-width="3" fill="none" opacity="0.4" />
    <path d="M1180 820 L1720 820 L1900 1000 L1080 1000 Z" fill="#9ab4ff" opacity="0.1" />
    <rect x="-60" y="-60" width="2040" height="1200" fill="url(#newyear-vignette)" />

    <path :d="TOP_TINSEL" stroke="#b07018" stroke-width="16" fill="none" stroke-linecap="round" />
    <path :d="TOP_TINSEL" stroke="#ffd84a" stroke-width="30" fill="none" stroke-dasharray="2.5 4.5" />
    <path :d="TOP_TINSEL" transform="translate(0 30) scale(1 0.9)" stroke="#d8e4ff" stroke-width="18" fill="none" stroke-dasharray="2 5" opacity="0.8" />

    <ellipse cx="860" cy="972" rx="560" ry="84" fill="#5a2a6a" stroke="#1b1033" stroke-width="4" />
    <ellipse cx="860" cy="972" rx="500" ry="62" fill="none" stroke="#e0a848" stroke-width="5" stroke-dasharray="18 12" opacity="0.6" />
    <ellipse cx="860" cy="972" rx="380" ry="40" fill="none" stroke="#8a4a9a" stroke-width="10" opacity="0.7" />

    <g transform="translate(840 890)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="4" rx="360" ry="22" fill="#1a0a20" opacity="0.35" stroke="none" />
      <path d="M-290 -6 v18 h20 v-18 M270 -6 v18 h20 v-18" fill="#4a2414" stroke-width="4" />
      <path d="M-290 -130 V-300 Q-290 -338 -250 -338 H250 Q290 -338 290 -300 V-130 Z" fill="url(#newyear-sofa)" stroke-width="6" filter="url(#cel)" />
      <path d="M-96 -320 V-170 M96 -320 V-170" stroke-width="4" opacity="0.4" />
      <g fill="#164848" stroke="none">
        <circle cx="-190" cy="-250" r="6" />
        <circle cx="0" cy="-250" r="6" />
        <circle cx="-96" cy="-200" r="6" />
        <circle cx="96" cy="-200" r="6" />
      </g>
      <path d="M-260 -318 H-120" stroke="#8ae0cc" stroke-width="6" stroke-linecap="round" opacity="0.7" />
      <rect x="-300" y="-160" width="600" height="96" rx="24" fill="#2e9482" stroke-width="5" filter="url(#cel-s)" />
      <path d="M0 -156 V-68" stroke-width="4" opacity="0.5" />
      <rect x="-324" y="-74" width="648" height="66" rx="16" fill="#1d6464" stroke-width="5" />
      <path d="M-340 -20 V-210 Q-340 -252 -300 -252 Q-258 -252 -258 -210 V-20 Z M340 -20 V-210 Q340 -252 300 -252 Q258 -252 258 -210 V-20 Z" fill="url(#newyear-sofa)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-326 -212 Q-322 -238 -300 -240" stroke="#8ae0cc" stroke-width="5" fill="none" stroke-linecap="round" />
      <g transform="translate(-180 -190) rotate(-12)">
        <rect x="-62" y="-56" width="124" height="112" rx="26" fill="#ffc93a" stroke-width="5" filter="url(#cel-s)" />
        <path d="M-40 -34 L40 34 M40 -34 L-40 34" stroke="#e8304a" stroke-width="6" opacity="0.7" />
        <circle r="8" fill="#e8304a" stroke-width="3" />
      </g>
      <path d="M30 -340 Q170 -356 306 -338 L306 -170 Q250 -150 236 -64 L72 -64 Q60 -160 30 -210 Z" fill="#c8283e" stroke="none" />
      <g clip-path="url(#newyear-plaid-clip)" fill="none">
        <path d="M60 -360 V-40 M150 -360 V-40 M240 -360 V-40 M0 -300 H320 M0 -210 H320 M0 -120 H320" stroke="#1f3a6a" stroke-width="22" opacity="0.6" />
        <path d="M90 -360 V-40 M190 -360 V-40 M280 -360 V-40 M0 -260 H320 M0 -160 H320 M0 -90 H320" stroke="#ffd23f" stroke-width="5" opacity="0.8" />
      </g>
      <path d="M30 -340 Q170 -356 306 -338 L306 -170 Q250 -150 236 -64 L72 -64 Q60 -160 30 -210 Z" fill="none" stroke-width="5" />
      <path d="M80 -64 v14 M104 -64 v14 M128 -64 v14 M152 -64 v14 M176 -64 v14 M200 -64 v14 M224 -64 v14" stroke="#c8283e" stroke-width="5" stroke-linecap="round" />
      <path d="M60 -330 Q170 -344 280 -330" stroke="#ff8a8a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    </g>

    <g :transform="`translate(${TX} ${TY})`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="10" rx="300" ry="24" fill="#1a0a20" opacity="0.35" stroke="none" />
      <rect x="-24" y="-110" width="48" height="90" fill="#7a4220" stroke-width="5" />
      <path d="M-70 -40 L70 -40 L56 18 L-56 18 Z" fill="#e8304a" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-74 -44 Q-40 -60 0 -46 Q40 -60 74 -44 Q60 -26 30 -34 Q0 -22 -30 -34 Q-60 -26 -74 -44 Z" fill="#fff" stroke-width="4" />
      <path d="M-50 -10 H50" stroke="#ffd23f" stroke-width="6" />
      <g fill="url(#newyear-fir)" stroke-width="5" filter="url(#cel)">
        <path v-for="(d, i) in TIER_PATHS" :key="`ti${i}`" :d="d" />
      </g>
      <path :d="NEEDLES" stroke="#145a38" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.55" />
      <path :d="TIER_RIMS" stroke="#9cf0b0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.55" />
      <path :d="TINSEL_TREE" stroke="#e8eeff" stroke-width="16" fill="none" stroke-dasharray="2 4" stroke-linecap="butt" opacity="0.9" />
      <path :d="GARLAND_WIRE" stroke="#123a24" stroke-width="3" fill="none" />
      <circle cy="-760" r="90" fill="url(#newyear-starglow)" stroke="none" class="glow" />
      <path :d="`M${STAR} Z`" transform="translate(0 -758)" fill="#e8304a" stroke-width="5" filter="url(#cel-s)" />
      <path :d="`M${STAR} Z`" transform="translate(0 -758) scale(0.5)" fill="#ffd23f" stroke="none" />
    </g>
    <path :d="WINDOW_WIRE" stroke="#1b1033" stroke-width="3" fill="none" />

    <g v-for="(b, i) in BAUBLES" :key="`bb${i}`" stroke="#1b1033">
      <path :d="`M${b.x} ${b.y - b.r - 4} v-12`" stroke-width="2.5" />
      <rect :x="b.x - 6" :y="b.y - b.r - 7" width="12" height="9" rx="2" fill="#e0a848" stroke-width="2.5" />
      <circle :cx="b.x" :cy="b.y" :r="b.r" :fill="b.c" stroke-width="4" />
      <path :d="`M${b.x - b.r * 0.55} ${b.y - b.r * 0.1} Q${b.x - b.r * 0.5} ${b.y - b.r * 0.55} ${b.x - b.r * 0.1} ${b.y - b.r * 0.62}`" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.85" />
    </g>

    <g v-for="(g, gi) in LIGHTS" :key="`lt${gi}`" class="newyear-lights" :style="{ animationDelay: `-${gi * 0.6}s` }">
      <template v-for="(b, i) in g" :key="i">
        <circle :cx="b.x" :cy="b.y" r="15" :fill="b.c" opacity="0.25" />
        <ellipse :cx="b.x" :cy="b.y + 2" rx="6.5" ry="8.5" :fill="b.c" stroke="#1b1033" stroke-width="2.5" />
        <circle :cx="b.x - 2" :cy="b.y - 1" r="2" fill="#fff" />
      </template>
    </g>

    <g v-for="(g, i) in GIFTS" :key="`gf${i}`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse :cx="g.x + g.w / 2 + 8" :cy="g.y + g.h + 4" :rx="g.w * 0.62" ry="10" fill="#1a0a20" opacity="0.35" stroke="none" />
      <rect :x="g.x" :y="g.y + 18" :width="g.w" :height="g.h - 18" :fill="g.c" stroke-width="5" filter="url(#cel-s)" />
      <rect :x="g.x - 8" :y="g.y" :width="g.w + 16" height="26" rx="4" :fill="g.dark" stroke-width="5" />
      <path :d="`M${g.x + g.w / 2} ${g.y} V${g.y + g.h}`" :stroke="g.rib" stroke-width="14" />
      <path :d="`M${g.x} ${g.y + g.h * 0.62} H${g.x + g.w}`" :stroke="g.rib" stroke-width="12" opacity="0.9" />
      <path :d="`M${g.x + g.w / 2} ${g.y} Q${g.x + g.w / 2 - 40} ${g.y - 36} ${g.x + g.w / 2 - 30} ${g.y - 6} Z M${g.x + g.w / 2} ${g.y} Q${g.x + g.w / 2 + 40} ${g.y - 36} ${g.x + g.w / 2 + 30} ${g.y - 6} Z`" :fill="g.rib" stroke-width="4" />
      <path :d="`M${g.x + 10} ${g.y + 36} V${g.y + g.h - 10}`" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.4" />
    </g>

    <g transform="translate(588 818)">
      <g class="newyear-bauble">
        <path d="M0 0 V36" stroke="#1b1033" stroke-width="2.5" />
        <rect x="-6" y="32" width="12" height="9" rx="2" fill="#e0a848" stroke="#1b1033" stroke-width="2.5" />
        <circle cy="56" r="17" fill="#ff5aa8" stroke="#1b1033" stroke-width="4" />
        <path d="M-9 54 Q-8 46 -1 44" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g transform="translate(700 968) scale(0.85)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="6" cy="2" rx="78" ry="12" fill="#1a0a20" opacity="0.35" stroke="none" />
      <path d="M40 -8 Q104 -8 100 -60 Q96 -94 70 -98" stroke-width="24" fill="none" stroke-linecap="round" />
      <path d="M40 -8 Q104 -8 100 -60 Q96 -94 70 -98" stroke="#ff9a3a" stroke-width="15" fill="none" stroke-linecap="round" />
      <path d="M92 -40 l12 2 M98 -68 l12 -4" stroke="#b8501a" stroke-width="5" stroke-linecap="round" />
      <path d="M-52 0 Q-62 -72 -30 -108 Q0 -128 30 -108 Q62 -72 52 0 Z" fill="url(#newyear-cat)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-24 -6 Q-30 -60 -6 -88 Q14 -60 8 -6 Z" fill="#ffe6c4" stroke="none" opacity="0.85" />
      <path d="M30 -96 Q44 -84 46 -64 M38 -54 Q48 -42 48 -24" stroke="#b8501a" stroke-width="5" fill="none" stroke-linecap="round" />
      <ellipse cx="-26" cy="-4" rx="20" ry="11" fill="#ffb860" stroke-width="4" />
      <path d="M-62 -158 L-52 -196 L-30 -168 Z M-10 -170 L6 -198 L16 -162 Z" fill="#ff9a3a" stroke-width="4" />
      <path d="M-55 -166 L-51 -184 L-40 -170 Z M-4 -170 L4 -186 L9 -166 Z" fill="#ff9ab0" stroke="none" />
      <ellipse cx="-24" cy="-136" rx="46" ry="38" fill="url(#newyear-cat)" stroke-width="5" />
      <path d="M-36 -170 l2 12 M-24 -172 v12 M-12 -170 l-2 12" stroke="#b8501a" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="-46" cy="-142" rx="8" ry="10" fill="#9aea6a" stroke-width="3" />
      <ellipse cx="-16" cy="-144" rx="8" ry="10" fill="#9aea6a" stroke-width="3" />
      <ellipse cx="-49" cy="-145" rx="3.5" ry="7" fill="#1b1033" stroke="none" />
      <ellipse cx="-19" cy="-147" rx="3.5" ry="7" fill="#1b1033" stroke="none" />
      <circle cx="-48" cy="-148" r="1.8" fill="#fff" stroke="none" />
      <circle cx="-18" cy="-150" r="1.8" fill="#fff" stroke="none" />
      <path d="M-36 -126 l-6 -6 h12 Z" fill="#ff7a9a" stroke-width="2.5" />
      <path d="M-46 -116 Q-40 -110 -34 -118 Q-28 -110 -22 -116" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M-56 -124 L-90 -130 M-56 -118 L-88 -112 M-12 -124 L22 -132 M-12 -118 L20 -110" stroke-width="2" opacity="0.7" />
      <ellipse cx="-4" cy="-122" rx="9" ry="5" fill="#ff7a8a" stroke="none" opacity="0.5" />
      <g transform="translate(-48 -96)">
        <g class="newyear-paw">
          <path d="M0 0 L-60 -14" stroke-width="22" stroke-linecap="round" />
          <path d="M0 0 L-60 -14" stroke="#ff9a3a" stroke-width="13" stroke-linecap="round" />
          <circle cx="-64" cy="-15" r="11" fill="#ffe6c4" stroke-width="4" />
          <path d="M-30 -14 l-2 9 M-42 -16 l-2 9" stroke="#b8501a" stroke-width="4" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <g fill="#2a1430" stroke="#12081a" stroke-width="5" stroke-linejoin="round">
      <path d="M-80 1150 V840 Q-20 790 70 820 Q120 840 120 900 Q110 1000 150 1150 Z" />
      <path d="M-80 1150 V980 Q60 940 230 990 Q280 1010 270 1150 Z" />
    </g>
    <path d="M-40 840 Q20 812 70 832 M-30 990 Q80 962 200 994" stroke="#5a3a6a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />

    <path d="M1330 894 Q1650 878 2000 872 L2000 1150 L1286 1150 Q1300 1060 1290 990 Q1300 940 1330 894 Z" fill="url(#newyear-cloth)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1294 990 Q1640 970 2000 960" stroke="#1b1033" stroke-width="4" fill="none" opacity="0.35" />
    <path d="M1380 1010 Q1376 1080 1388 1150 M1560 1004 Q1552 1080 1570 1150 M1760 998 Q1770 1070 1756 1150 M1920 994 Q1910 1070 1926 1150" stroke="#a89cc8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
    <path d="M1300 1000 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0" transform="rotate(-1.4 1300 1000)" stroke="#e8304a" stroke-width="4" fill="none" opacity="0.7" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="1400" cy="958" rx="34" ry="8" fill="#1a0a20" opacity="0.25" stroke="none" />
      <path d="M1374 856 L1426 856 L1421 954 Q1400 960 1379 954 Z" fill="#e8f4ff" fill-opacity="0.55" stroke-width="4" />
      <path d="M1375 878 Q1400 884 1425 878 L1421 952 Q1400 957 1379 952 Z" fill="#ff8a2a" stroke="none" />
      <path d="M1375 878 Q1400 884 1425 878" stroke="#1b1033" stroke-width="3" fill="none" opacity="0.6" />
      <path d="M1416 800 L1402 948" stroke-width="10" stroke-linecap="round" />
      <path d="M1416 800 L1402 948" stroke="#ff5a7a" stroke-width="5" stroke-linecap="round" />
      <path d="M1384 866 L1388 940" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />

      <ellipse cx="1546" cy="962" rx="96" ry="12" fill="#1a0a20" opacity="0.28" stroke="none" />
      <path d="M1516 960 L1576 960 L1562 936 L1530 936 Z" fill="#cfe6ff" stroke-width="4" />
      <path d="M1462 880 Q1470 942 1546 942 Q1622 942 1630 880 Z" fill="#cfe6ff" fill-opacity="0.9" stroke-width="5" filter="url(#cel-s)" />
      <path d="M1468 880 Q1490 818 1546 816 Q1602 818 1624 880 Z" fill="#f6e2a0" stroke-width="5" />
      <path d="M1490 920 L1500 896 M1530 932 L1534 900 M1570 932 L1566 900 M1604 916 L1596 894" stroke="#fff" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="1546" cy="880" rx="84" ry="10" fill="none" stroke="#fff" stroke-width="4" opacity="0.7" />
      <g stroke="none">
        <circle cx="1510" cy="856" r="6" fill="#4ab84a" />
        <circle cx="1546" cy="836" r="6" fill="#4ab84a" />
        <circle cx="1586" cy="860" r="6" fill="#4ab84a" />
        <rect x="1524" y="858" width="11" height="11" rx="2" fill="#ff8a3a" />
        <rect x="1568" y="838" width="10" height="10" rx="2" fill="#ff8a3a" />
        <rect x="1492" y="868" width="11" height="10" rx="2" fill="#ffaab4" />
        <rect x="1554" y="866" width="10" height="10" rx="2" fill="#ffaab4" />
        <path d="M1500 840 Q1530 822 1560 824" stroke="#fff8d8" stroke-width="5" fill="none" stroke-linecap="round" />
      </g>
      <path d="M1530 820 Q1536 800 1550 796 M1550 796 Q1546 810 1530 820" fill="#4ab84a" stroke-width="3" />

      <ellipse cx="1660" cy="958" rx="34" ry="8" fill="#1a0a20" opacity="0.25" stroke="none" />
      <path d="M1634 856 L1686 856 L1681 954 Q1660 960 1639 954 Z" fill="#e8f4ff" fill-opacity="0.55" stroke-width="4" />
      <path d="M1635 878 Q1660 884 1685 878 L1681 952 Q1660 957 1639 952 Z" fill="#e8304a" stroke="none" />
      <path d="M1635 878 Q1660 884 1685 878" stroke="#1b1033" stroke-width="3" fill="none" opacity="0.6" />
      <path d="M1662 800 L1662 948" stroke-width="10" stroke-linecap="round" />
      <path d="M1662 800 L1662 948" stroke="#ff5a7a" stroke-width="5" stroke-linecap="round" />
      <path d="M1644 866 L1648 940" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />

      <ellipse cx="1784" cy="954" rx="96" ry="18" fill="#1a0a20" opacity="0.28" stroke="none" />
      <ellipse cx="1782" cy="944" rx="88" ry="20" fill="#fff" stroke-width="5" />
      <ellipse cx="1782" cy="940" rx="62" ry="12" fill="none" stroke="#3a7aff" stroke-width="4" opacity="0.5" />
      <g v-for="(t, i) in TANGERINES" :key="`tg${i}`" :transform="`translate(${1782 + t.x} ${942 + t.y})`">
        <circle r="28" fill="url(#newyear-tangerine)" stroke-width="4.5" />
        <path d="M-14 -12 Q-10 -20 -2 -22" stroke="#fff4c8" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle cx="10" cy="6" r="1.8" fill="#c0500e" stroke="none" />
        <circle cx="2" cy="14" r="1.8" fill="#c0500e" stroke="none" />
        <circle cx="16" cy="-4" r="1.8" fill="#c0500e" stroke="none" />
      </g>
      <path d="M1772 -64 Q1790 -78 1806 -70 Q1790 -60 1772 -64 Z" transform="translate(0 950)" fill="#3aa84a" stroke-width="3" />
      <path d="M1784 872 L1762 712" stroke-width="8" stroke-linecap="round" />
      <path d="M1784 872 L1766 740" stroke="#9a9aae" stroke-width="4" stroke-linecap="round" />
      <path d="M1766 740 L1762 712" stroke="#4a3a3a" stroke-width="4" stroke-linecap="round" />

      <g transform="translate(-30 0)">
        <ellipse cx="1930" cy="962" rx="70" ry="10" fill="#1a0a20" opacity="0.3" stroke="none" />
        <path d="M1880 784 Q1850 790 1846 830 Q1842 880 1886 900" stroke-width="18" fill="none" stroke-linecap="round" />
        <path d="M1880 784 Q1850 790 1846 830 Q1842 880 1886 900" stroke="#e8f4ff" stroke-width="9" fill="none" stroke-linecap="round" />
        <path d="M1892 740 Q1880 720 1872 712 H1990 V740 Q1876 760 1874 820 V940 Q1874 962 1900 962 H1990 Z" fill="#e8f4ff" fill-opacity="0.6" stroke-width="5" />
        <path d="M1875 812 Q1930 820 1990 812 V962 H1900 Q1874 962 1874 940 Z" fill="url(#newyear-mors)" stroke="none" />
        <path d="M1875 812 Q1930 820 1990 812" stroke-width="3" fill="none" opacity="0.6" />
        <path d="M1892 740 Q1880 720 1872 712 H1990 V740 Q1876 760 1874 820 V940 Q1874 962 1900 962 H1990" fill="none" stroke-width="5" />
        <g fill="#a8102a" stroke-width="2.5">
          <circle cx="1912" cy="930" r="8" />
          <circle cx="1936" cy="944" r="7" />
          <circle cx="1958" cy="922" r="8" />
        </g>
        <g transform="translate(1930 800) rotate(-14)">
          <circle r="22" fill="#fff36a" stroke-width="4" />
          <path d="M0 0 L0 -16 M0 0 L14 -8 M0 0 L14 8 M0 0 L0 16 M0 0 L-14 8 M0 0 L-14 -8" stroke="#e8c020" stroke-width="3" />
        </g>
        <path d="M1890 834 Q1886 880 1894 930" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>

    <circle cx="1762" cy="710" r="80" fill="url(#newyear-flare)" />
    <g transform="translate(1762 710)" stroke-linecap="round">
      <path class="newyear-spark" :d="SPARKS[0]" stroke="#fff6b0" stroke-width="4.5" />
      <path class="newyear-spark" :d="SPARKS[1]" stroke="#ffb02e" stroke-width="4" style="animation-delay: -0.22s" />
    </g>
  </g>
</template>

<style scoped>
.newyear-lights {
  animation: newyear-lights 2.4s ease-in-out infinite;
}

.newyear-burst {
  transform-box: fill-box;
  transform-origin: center;
  animation: newyear-burst 4s ease-out infinite;
}

.newyear-swing {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: newyear-swing ease-in-out infinite alternate;
}

.newyear-bauble {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: newyear-bauble 3s ease-in-out infinite;
}

.newyear-paw {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: newyear-paw 3s ease-in-out infinite;
}

.newyear-spark {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: newyear-spark 0.44s linear infinite alternate;
}

@keyframes newyear-lights {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}

@keyframes newyear-burst {
  0% {
    scale: 0.15;
    opacity: 0;
  }
  6% {
    opacity: 1;
  }
  40% {
    scale: 1;
    opacity: 0.9;
  }
  62%,
  100% {
    scale: 1.1;
    opacity: 0;
  }
}

@keyframes newyear-swing {
  from {
    rotate: -9deg;
  }
  to {
    rotate: 9deg;
  }
}

@keyframes newyear-paw {
  0%,
  40% {
    rotate: 16deg;
  }
  52% {
    rotate: -14deg;
  }
  60% {
    rotate: -2deg;
  }
  68% {
    rotate: -14deg;
  }
  82%,
  100% {
    rotate: 16deg;
  }
}

@keyframes newyear-bauble {
  0%,
  52% {
    rotate: 0deg;
  }
  60% {
    rotate: 16deg;
  }
  70% {
    rotate: -10deg;
  }
  80% {
    rotate: 6deg;
  }
  90% {
    rotate: -2deg;
  }
  100% {
    rotate: 0deg;
  }
}

@keyframes newyear-spark {
  from {
    opacity: 1;
    rotate: 0deg;
    scale: 1;
  }
  to {
    opacity: 0.35;
    rotate: 18deg;
    scale: 0.8;
  }
}
</style>
