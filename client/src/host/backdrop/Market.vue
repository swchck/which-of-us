<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(733);
const VX = 960;
const VY = 560;
const LEFT = -60;
const RIGHT = 1980;
const U_END = 0.765;
const f1 = (n: number) => n.toFixed(1);

// a side wall is drawn at full size at the screen edge (u = 0) and pulled toward the vanishing point as u grows
const wall = (xn: number, yn: number, u: number) => `${f1(xn + (VX - xn) * u)} ${f1(yn + (VY - yn) * u)}`;
const quad = (xn: number, u0: number, u1: number, yb: number, yt: number) =>
  `M${wall(xn, yb, u0)} L${wall(xn, yb, u1)} L${wall(xn, yt, u1)} L${wall(xn, yt, u0)} Z`;
const bothWalls = (fn: (xn: number) => string) => fn(LEFT) + fn(RIGHT);

const GOODS = ['#ff4d6d', '#ffb02e', '#2ec9b0', '#5ab8ff', '#9b5cff', '#7be06a', '#ff7a2f', '#ffd23f', '#ff8ccf'];
const BANDS = ['#fffaf0', '#fffaf0', '#ffd23f', '#1b1033', '#ff4d6d'];
const SHELF_TOPS = [1040, 850, 660, 470, 280];
const NEAR_LIMIT = 0.5;

const near: Record<string, string> = {};
const far: Record<string, string> = {};
const bands: Record<string, string> = {};
let caps = '';
let shine = '';
const add = (map: Record<string, string>, key: string, d: string) => {
  map[key] = (map[key] ?? '') + d;
};

// equal world widths shrink with depth as (1 - u)^2, so stepping 1 / (1 - u) packs the shelf evenly
const stock = (xn: number) => {
  for (const shelf of SHELF_TOPS) {
    let inv = 1 + rnd() * 0.04;
    for (;;) {
      const kind = rnd();
      const w = kind < 0.25 ? 24 + rnd() * 10 : kind < 0.45 ? 34 + rnd() * 8 : 44 + rnd() * 46;
      const u0 = 1 - 1 / inv;
      const next = inv + (w * 1.5) / 1020;
      const u1 = 1 - 1 / next;
      if (u1 > U_END) break;
      inv = next + 6 / 1020;
      const c = GOODS[Math.floor(rnd() * GOODS.length)] ?? '#ff4d6d';
      const band = BANDS[Math.floor(rnd() * BANDS.length)] ?? '#fffaf0';
      const map = u1 < NEAR_LIMIT ? near : far;
      const du = u1 - u0;
      if (kind < 0.25) {
        const h = 130 + rnd() * 30;
        const n0 = u0 + du * 0.3;
        const n1 = u0 + du * 0.7;
        add(map, c, quad(xn, u0, u1, shelf, shelf - h * 0.62) + quad(xn, n0, n1, shelf - h * 0.62, shelf - h));
        add(bands, band, quad(xn, u0, u1, shelf - h * 0.16, shelf - h * 0.42));
        caps += quad(xn, n0, n1, shelf - h * 0.9, shelf - h);
      } else if (kind < 0.45) {
        add(map, c, quad(xn, u0, u1, shelf, shelf - 70) + quad(xn, u0, u1, shelf - 74, shelf - 144));
        add(bands, band, quad(xn, u0, u1, shelf - 26, shelf - 44) + quad(xn, u0, u1, shelf - 100, shelf - 118));
        caps += quad(xn, u0, u1, shelf - 64, shelf - 70) + quad(xn, u0, u1, shelf - 138, shelf - 144);
      } else {
        const h = 100 + rnd() * 60;
        add(map, c, quad(xn, u0, u1, shelf, shelf - h));
        add(bands, band, quad(xn, u0, u1, shelf - h * 0.42, shelf - h * 0.66));
      }
      if (u1 < 0.62) {
        const us = u0 + du * 0.18;
        shine += `M${wall(xn, shelf - 10, us)} L${wall(xn, shelf - 60, us)} `;
      }
    }
  }
};
stock(LEFT);
stock(RIGHT);
const NEAR_GOODS = Object.entries(near);
const FAR_GOODS = Object.entries(far);
const BAND_PATHS = Object.entries(bands);

const PANELS = bothWalls((xn) => quad(xn, 0, U_END, 1200, 100));
const LIPS = bothWalls((xn) => SHELF_TOPS.map((p) => quad(xn, 0, U_END, p + 24, p)).join(''));
const STRIPS = bothWalls((xn) => SHELF_TOPS.map((p) => quad(xn, 0, U_END, p + 18, p + 8)).join(''));
const UNDER = bothWalls((xn) => SHELF_TOPS.map((p) => quad(xn, 0, U_END, p + 64, p + 24)).join(''));
const TAGS = bothWalls((xn) =>
  SHELF_TOPS.map((p) =>
    [0.04, 0.2, 0.34, 0.46, 0.56, 0.64, 0.7]
      .map((u) => quad(xn, u, u + 0.03 * (1 - u) * (1 - u), p + 20, p + 6))
      .join(''),
  ).join(''),
);
const KICKS = bothWalls((xn) => quad(xn, 0, U_END, 1200, 1064));
const UPRIGHTS = [1, 1.6, 2.2, 2.8, 3.4, 4].map((inv) => {
  const u = 1 - 1 / inv;
  return { l: `M${wall(LEFT, 100, u)} L${wall(LEFT, 1200, u)}`, r: `M${wall(RIGHT, 100, u)} L${wall(RIGHT, 1200, u)}`, w: 16 * (1 - u) };
});

const ceil = (x: number, s: number) => `${f1(VX + x * s)} ${f1(VY - 520 * s)}`;
const floor = (x: number, s: number) => `${f1(VX + x * s)} ${f1(VY + 640 * s)}`;
const S_BACK = 1 - U_END;
const LIGHT_DEPTHS: [number, number][] = [
  [1.12, 0.98],
  [0.78, 0.71],
  [0.58, 0.54],
  [0.45, 0.425],
  [0.36, 0.345],
  [0.3, 0.29],
];
const lightPanel = (x: number, [s0, s1]: [number, number]) =>
  `M${ceil(x - 70, s0)} L${ceil(x + 70, s0)} L${ceil(x + 70, s1)} L${ceil(x - 70, s1)} Z`;
const LIGHTS = [-600, 0, 600].map((x) => LIGHT_DEPTHS.map((d) => lightPanel(x, d)).join('')).join('');
const CEIL_GRID =
  Array.from({ length: 9 }, (_, i) => {
    const x = -1020 + i * 255;
    return `M${ceil(x, 1.2)} L${ceil(x, S_BACK)}`;
  }).join(' ') +
  [1.2, 0.9, 0.7, 0.56, 0.46, 0.39, 0.33, 0.28]
    .map((s) => `M${ceil(-1020, s)} L${ceil(1020, s)}`)
    .join(' ');

const ROW_INV = Array.from({ length: 11 }, (_, k) => 1 / S_BACK - k * 0.33);
const FLOOR_TILES = ROW_INV.slice(0, -1)
  .map((inv, k) => {
    const sa = 1 / inv;
    const sb = 1 / (ROW_INV[k + 1] ?? 1);
    return Array.from({ length: 12 }, (_, j) => j)
      .filter((j) => (j + k) % 2 === 0)
      .map((j) => {
        const xa = -1020 + j * 170;
        const xb = xa + 170;
        return `M${floor(xa, sa)} L${floor(xb, sa)} L${floor(xb, sb)} L${floor(xa, sb)} Z`;
      })
      .join('');
  })
  .join('');
const GLOSS = [-600, 0, 600].map((x) => `M${floor(x - 40, S_BACK)} L${floor(x + 40, S_BACK)} L${floor(x + 90, 0.95)} L${floor(x - 90, 0.95)} Z`).join('');

const starburst = (n: number, ro: number, ri: number) =>
  `M${Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 ? ri : ro;
    return `${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`;
  }).join(' L')} Z`;
const BURST = starburst(14, 82, 62);
const BURST_SMALL = starburst(10, 26, 17);

const BELT_STRIPES = Array.from({ length: 12 }, (_, i) => `M${1400 + i * 40} 836 L${1418 + i * 40} 796`).join(' ');
const BALLOONS = [
  { a: -40, len: 160, c: '#ff4d6d', dark: '#c22a4a', d: 0 },
  { a: -16, len: 210, c: '#ffd23f', dark: '#d9a01a', d: 1.2 },
  { a: 6, len: 150, c: '#5ab8ff', dark: '#2f7fd0', d: 2.3 },
];
const KEYS = Array.from({ length: 12 }, (_, i) => ({ x: 1846 + (i % 4) * 16, y: 752 + Math.floor(i / 4) * 12 }));

const APPLES = [
  ...[0, 1, 2, 3].map((i) => ({ x: 196 + i * 44, y: 892 })),
  ...[0, 1, 2].map((i) => ({ x: 218 + i * 44, y: 864 })),
  ...[0, 1].map((i) => ({ x: 240 + i * 44, y: 838 })),
];
const ORANGES = [
  ...[0, 1, 2, 3].map((i) => ({ x: 382 + i * 42, y: 892 })),
  ...[0, 1, 2].map((i) => ({ x: 403 + i * 42, y: 864 })),
  ...[0, 1].map((i) => ({ x: 424 + i * 42, y: 838 })),
];
const LEMONS = [
  ...[0, 1, 2].map((i) => ({ x: 574 + i * 44, y: 894 })),
  ...[0, 1].map((i) => ({ x: 596 + i * 44, y: 868 })),
];
const MELONS = [
  { x: 210, y: 772, r: 62 },
  { x: 330, y: 778, r: 56 },
  { x: 270, y: 724, r: 52 },
];
const BANANAS = [470, 530, 590, 650];
const fringe = (n: number) => Array.from({ length: n }, (_, i) => `l9 ${i % 2 ? -14 : 14}`).join(' ');
const ROLLS = [
  ...[0, 1, 2, 3].map((i) => ({ x: 1206 + i * 56, y: 868 })),
  ...[0, 1, 2].map((i) => ({ x: 1234 + i * 56, y: 818 })),
  ...[0, 1].map((i) => ({ x: 1262 + i * 56, y: 768 })),
  { x: 1290, y: 718 },
];
const CART_GRID = [
  ...Array.from({ length: 8 }, (_, i) => `M${-40 + i * 44} 912 L${-40 + i * 44 - i * 2} 1060`),
  'M-60 948 H312 M-60 986 H302 M-60 1024 H294',
].join(' ');
</script>

<template>
  <g>
    <defs>
      <linearGradient id="market-ceiling" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#e2e8ff" />
      </linearGradient>
      <linearGradient id="market-back" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe9e0" />
        <stop offset="100%" stop-color="#ffd8cc" />
      </linearGradient>
      <linearGradient id="market-fridge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eafcff" />
        <stop offset="100%" stop-color="#bfe8f4" />
      </linearGradient>
      <linearGradient id="market-floor-shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a2a5a" stop-opacity="0" />
        <stop offset="100%" stop-color="#3a2a5a" stop-opacity="0.22" />
      </linearGradient>
      <linearGradient id="market-counter" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3fe0c4" />
        <stop offset="100%" stop-color="#14957f" />
      </linearGradient>
      <linearGradient id="market-crate" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e3a462" />
        <stop offset="100%" stop-color="#a8642e" />
      </linearGradient>
      <linearGradient id="market-cart" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff6b80" />
        <stop offset="100%" stop-color="#c41f43" />
      </linearGradient>
      <linearGradient id="market-register" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8a7ad8" />
        <stop offset="100%" stop-color="#4c3c9a" />
      </linearGradient>
      <clipPath id="market-belt-clip">
        <path d="M1478 798 H1758 L1752 834 H1462 Z" />
      </clipPath>
    </defs>

    <path d="M-60 -60 H1980 V40 L1200 437.6 H720 L-60 40 Z" fill="url(#market-ceiling)" />
    <path :d="CEIL_GRID" stroke="#c4cbea" stroke-width="2" fill="none" opacity="0.7" />
    <path :d="LIGHTS" fill="#fffef4" stroke="#b8bde0" stroke-width="2.5" stroke-linejoin="round" />
    <ellipse cx="960" cy="120" rx="320" ry="90" fill="#fff6c8" opacity="0.22" />
    <ellipse cx="960" cy="310" rx="160" ry="40" fill="#fff6c8" opacity="0.3" />

    <rect x="720" y="437" width="480" height="275" fill="url(#market-back)" />
    <rect x="720" y="500" width="480" height="18" fill="#bfeedd" />
    <rect x="720" y="524" width="480" height="6" fill="#ffc2d4" />
    <g stroke="#b8a8c8" stroke-width="2">
      <rect x="734" y="556" width="452" height="150" rx="6" fill="#f2eef8" />
      <rect x="744" y="566" width="104" height="134" rx="4" fill="url(#market-fridge)" />
      <rect x="856" y="566" width="104" height="134" rx="4" fill="url(#market-fridge)" />
      <rect x="968" y="566" width="104" height="134" rx="4" fill="url(#market-fridge)" />
      <rect x="1080" y="566" width="96" height="134" rx="4" fill="url(#market-fridge)" />
    </g>
    <g opacity="0.55">
      <path d="M750 604 h92 M862 604 h92 M974 604 h92 M1086 604 h84 M750 644 h92 M862 644 h92 M974 644 h92 M1086 644 h84 M750 684 h92 M862 684 h92 M974 684 h92 M1086 684 h84" stroke="#9ab8d0" stroke-width="3" />
      <path d="M754 602 v-16 h10 v16 M770 602 v-12 h10 v12 M790 602 v-18 h8 v18 M870 602 v-14 h12 v14 M890 602 v-14 h12 v14 M990 602 v-18 h8 v18 M1010 602 v-12 h10 v12 M1100 602 v-14 h12 v14 M1130 602 v-18 h8 v18 M760 642 v-14 h14 v14 M880 642 v-16 h10 v16 M1000 642 v-12 h14 v12 M1110 642 v-16 h10 v16 M800 682 v-14 h12 v14 M920 682 v-12 h14 v12 M1040 682 v-14 h12 v14 M1150 682 v-12 h12 v12" fill="#ffc2d4" />
    </g>
    <path d="M760 574 l20 40 M872 574 l20 40 M984 574 l20 40 M1094 574 l20 40" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7" />

    <path d="M-60 1200 L720 710.6 H1200 L1980 1200 Z" fill="#fff3e2" />
    <path :d="FLOOR_TILES" fill="#dcefe8" />
    <path :d="GLOSS" fill="#fff" opacity="0.32" />
    <rect x="-60" y="710" width="2040" height="430" fill="url(#market-floor-shade)" />

    <path :d="PANELS" fill="#ece6fb" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="UNDER" fill="#4a3a78" opacity="0.18" />
    <path v-for="[c, d] in FAR_GOODS" :key="`fg${c}`" :d="d" :fill="c" stroke="#8a7aa8" stroke-width="1.2" stroke-linejoin="round" />
    <path v-for="[c, d] in NEAR_GOODS" :key="`ng${c}`" :d="d" :fill="c" stroke="#1b1033" stroke-width="2.5" stroke-linejoin="round" filter="url(#cel-s)" />
    <path v-for="[c, d] in BAND_PATHS" :key="`bd${c}`" :d="d" :fill="c" opacity="0.9" />
    <path :d="caps" fill="#e6e8f4" opacity="0.9" />
    <path :d="shine" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.6" />
    <g v-for="(p, i) in UPRIGHTS" :key="`up${i}`" stroke-linecap="round">
      <path :d="`${p.l} ${p.r}`" stroke="#1b1033" :stroke-width="p.w + 4" />
      <path :d="`${p.l} ${p.r}`" stroke="#d7d0ee" :stroke-width="p.w" />
    </g>
    <path :d="LIPS" fill="#f8f6ff" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    <path :d="STRIPS" fill="#ffd23f" />
    <path :d="TAGS" fill="#fff" stroke="#c8a020" stroke-width="1" />
    <path :d="KICKS" fill="#3a3060" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="quad(LEFT, 0, U_END, 100, 40)" fill="#ff4d6d" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="quad(RIGHT, 0, U_END, 100, 40)" fill="#2ec9b0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="bothWalls((xn) => quad(xn, 0, U_END, 78, 64))" fill="#fffaf0" opacity="0.85" />
    <path :d="bothWalls((xn) => quad(xn, 0, U_END, 40, -200))" fill="#f6f2ff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />

    <g stroke="#1b1033" stroke-width="3">
      <path d="M612 340 V398 M1308 340 V398" />
      <rect x="576" y="398" width="72" height="44" rx="8" fill="#5ab8ff" />
      <rect x="1272" y="398" width="72" height="44" rx="8" fill="#ff8ccf" />
      <circle cx="612" cy="420" r="11" fill="#fffaf0" />
      <circle cx="1308" cy="420" r="11" fill="#fffaf0" />
    </g>

    <g transform="translate(420 360)">
      <g class="market-sway">
        <path d="M-40 -340 L-30 -70 M40 -340 L30 -70" stroke="#6a5a8a" stroke-width="3" />
        <path :d="BURST" fill="#ffd23f" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <circle r="50" fill="#ff4d6d" stroke="#1b1033" stroke-width="4" />
        <circle r="38" fill="none" stroke="#fffaf0" stroke-width="5" stroke-dasharray="8 8" />
        <path d="M-18 -10 L18 -10 L0 22 Z" fill="#fffaf0" />
        <path d="M-56 -40 Q-44 -60 -22 -66" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9" />
      </g>
    </g>

    <g transform="translate(1530 100)">
      <g class="market-swing">
        <path d="M0 -200 V22" stroke="#6a5a8a" stroke-width="3" />
        <path d="M-56 50 L-22 0 H22 L56 50 V196 Q56 210 42 210 H-42 Q-56 210 -56 196 Z" fill="#ff7a2f" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M-44 60 L-16 16 M44 60 V196" stroke="#ffb47a" stroke-width="6" stroke-linecap="round" />
        <circle cy="22" r="9" fill="#fff3e2" stroke="#1b1033" stroke-width="3" />
        <circle cy="104" r="34" fill="#ffd23f" stroke="#1b1033" stroke-width="4" />
        <path :d="BURST_SMALL" transform="translate(0 104)" fill="#fffaf0" />
        <path d="M-34 164 H34 M-24 184 H24" stroke="#fffaf0" stroke-width="8" stroke-linecap="round" />
      </g>
    </g>

    <ellipse cx="1300" cy="904" rx="150" ry="18" fill="#2a1a4a" opacity="0.28" />
    <rect x="1170" y="892" width="240" height="22" rx="4" fill="url(#market-crate)" stroke="#1b1033" stroke-width="4" />
    <path d="M1200 896 v14 M1290 896 v14 M1380 896 v14" stroke="#7a4424" stroke-width="4" />
    <g v-for="(r, i) in ROLLS" :key="`tp${i}`">
      <circle :cx="r.x" :cy="r.y" r="26" fill="#fffaf2" stroke="#1b1033" stroke-width="4" />
      <path :d="`M${r.x + 20} ${r.y - 6} A21 21 0 0 1 ${r.x - 6} ${r.y + 20}`" stroke="#d8cce8" stroke-width="7" fill="none" stroke-linecap="round" />
      <circle :cx="r.x" :cy="r.y" r="9" :fill="i % 2 ? '#ffc2d4' : '#bfe8f4'" stroke="#1b1033" stroke-width="3" />
      <path :d="`M${r.x - 16} ${r.y - 12} Q${r.x - 8} ${r.y - 22} ${r.x + 4} ${r.y - 22}`" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <ellipse cx="1700" cy="1130" rx="420" ry="30" fill="#2a1a4a" opacity="0.3" />
    <path d="M1452 790 H2000 V1160 H1420 V842 Z" fill="url(#market-counter)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1452 790 H2000 V842 H1420 Z" fill="#e8f7f4" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M1420 900 H2000 M1420 926 H2000" stroke="#ffd23f" stroke-width="12" />
    <path d="M1420 913 H2000" stroke="#ff4d6d" stroke-width="8" />
    <path d="M1520 960 V1120 M1700 960 V1120 M1880 960 V1120" stroke="#0f6a5a" stroke-width="5" stroke-linecap="round" opacity="0.5" />
    <path d="M1446 860 V1100" stroke="#a8fff0" stroke-width="6" stroke-linecap="round" opacity="0.7" />
    <path d="M1478 798 H1758 L1752 834 H1462 Z" fill="#2b2448" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <g clip-path="url(#market-belt-clip)">
      <path :d="BELT_STRIPES" stroke="#5a5084" stroke-width="10" class="market-belt" />
    </g>
    <path d="M1462 836 H1752" stroke="#8a84b0" stroke-width="4" />
    <g stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path d="M1500 818 V770 L1512 756 H1536 L1548 770 V818 Z" fill="#fffaf0" />
      <path d="M1500 770 H1548 L1536 756 H1512 Z" fill="#5ab8ff" />
      <rect x="1574" y="740" width="26" height="78" rx="8" fill="#7be06a" />
      <rect x="1580" y="726" width="14" height="16" rx="3" fill="#ff4d6d" />
      <rect x="1626" y="752" width="64" height="66" rx="4" fill="#ff8ccf" />
      <path d="M1626 776 H1690" stroke="#fffaf0" stroke-width="10" />
    </g>
    <path d="M1508 786 v24 M1580 752 v50 M1634 760 v12" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />

    <rect x="1770" y="802" width="58" height="30" rx="4" fill="#1b1033" />
    <rect x="1776" y="808" width="46" height="18" rx="3" fill="#3a2a5a" />
    <rect x="1774" y="814" width="50" height="6" rx="3" fill="#ff3b5c" class="market-blink" />

    <g transform="translate(1860 730)">
      <g v-for="(b, i) in BALLOONS" :key="`bl${i}`" :transform="`rotate(${b.a})`">
        <g class="market-bob" :style="{ animationDelay: `-${b.d}s` }">
          <path :d="`M0 0 Q10 ${-b.len * 0.5} 0 ${-b.len}`" stroke="#6a5a8a" stroke-width="2.5" fill="none" />
          <path :d="`M-7 ${-b.len + 2} L7 ${-b.len + 2} L0 ${-b.len - 10} Z`" :fill="b.dark" stroke="#1b1033" stroke-width="2.5" stroke-linejoin="round" />
          <ellipse cx="0" :cy="-b.len - 54" rx="42" ry="50" :fill="b.c" stroke="#1b1033" stroke-width="5" />
          <path :d="`M22 ${-b.len - 30} Q30 ${-b.len - 54} 20 ${-b.len - 82}`" :stroke="b.dark" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.6" />
          <path :d="`M-22 ${-b.len - 72} Q-12 ${-b.len - 92} 4 ${-b.len - 94}`" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9" />
        </g>
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1834" y="732" width="120" height="66" rx="8" fill="url(#market-register)" stroke-width="5" />
      <rect x="1888" y="664" width="14" height="70" fill="#6a5ab8" stroke-width="4" />
      <rect x="1830" y="582" width="130" height="90" rx="10" fill="url(#market-register)" stroke-width="5" />
      <rect x="1844" y="596" width="102" height="62" rx="5" fill="#bff6ff" stroke-width="3" />
    </g>
    <path d="M1852 610 H1910 M1852 626 H1930 M1852 642 H1896" stroke="#3fc8e0" stroke-width="7" stroke-linecap="round" />
    <path d="M1848 600 L1872 600" stroke="#fff" stroke-width="4" stroke-linecap="round" />
    <circle v-for="(k, i) in KEYS" :key="`k${i}`" :cx="k.x" :cy="k.y" r="4.5" :fill="i === 11 ? '#7be06a' : i === 3 ? '#ff4d6d' : '#fffaf0'" />
    <path d="M1842 740 Q1880 736 1900 738" stroke="#b8a8ff" stroke-width="4" fill="none" stroke-linecap="round" />

    <path d="M60 640 V1010 M690 640 V1010" stroke="#1b1033" stroke-width="16" stroke-linecap="round" />
    <path d="M60 640 V1010 M690 640 V1010" stroke="#c88a52" stroke-width="9" stroke-linecap="round" />
    <g transform="translate(0 -80)">
      <path d="M40 690 H710 V728 H40 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M40 690 h56 v38 h-56 Z M152 690 h56 v38 h-56 Z M264 690 h56 v38 h-56 Z M376 690 h56 v38 h-56 Z M488 690 h56 v38 h-56 Z M600 690 h56 v38 h-56 Z" fill="#ff4d6d" />
      <path d="M40 728 q28 30 56 0 q28 30 56 0 q28 30 56 0 q28 30 56 0 q28 30 56 0 q28 30 56 0 q28 30 56 0 q28 30 56 0 q28 30 56 0 q28 30 56 0 q28 30 56 0 q28 30 56 0" fill="#ff4d6d" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M40 690 H710 V728 H40 Z" fill="none" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M60 698 H700" stroke="#fff" stroke-width="4" opacity="0.6" />
    </g>

    <g v-for="(m, i) in MELONS" :key="`ml${i}`">
      <ellipse :cx="m.x" :cy="m.y" :rx="m.r" :ry="m.r * 0.72" fill="#3fae4a" stroke="#1b1033" stroke-width="5" />
      <path :d="`M${m.x - m.r * 0.8} ${m.y - 10} Q${m.x} ${m.y - m.r * 0.9} ${m.x + m.r * 0.8} ${m.y - 10} M${m.x - m.r * 0.9} ${m.y + 10} Q${m.x} ${m.y - m.r * 0.4} ${m.x + m.r * 0.9} ${m.y + 10} M${m.x - m.r * 0.8} ${m.y + 28} Q${m.x} ${m.y + 6} ${m.x + m.r * 0.8} ${m.y + 28}`" stroke="#1d6a2a" stroke-width="9" fill="none" stroke-linecap="round" />
      <path :d="`M${m.x - m.r * 0.6} ${m.y - m.r * 0.4} Q${m.x - m.r * 0.3} ${m.y - m.r * 0.66} ${m.x} ${m.y - m.r * 0.68}`" stroke="#b8f5a8" stroke-width="7" fill="none" stroke-linecap="round" />
    </g>
    <g v-for="(x, i) in BANANAS" :key="`bn${i}`" :transform="`translate(${x} ${790 - (i % 2) * 14}) rotate(${-10 + i * 7})`">
      <path d="M-36 -10 Q0 40 40 -16 Q36 6 22 18 Q0 34 -22 18 Q-34 8 -36 -10 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-30 -24 Q0 22 38 -30 Q34 -8 20 4 Q0 16 -18 4 Q-28 -6 -30 -24 Z" fill="#ffe36b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-30 -24 l-6 -6 M38 -30 l4 -8" stroke="#5a3a1a" stroke-width="5" stroke-linecap="round" />
      <path d="M-16 0 Q0 12 20 -6" stroke="#fff6c0" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
    <path d="M110 800 H680 V880 H110 Z" fill="url(#market-crate)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
    <path d="M110 826 H680 M110 854 H680 M395 800 V880" stroke="#7a4424" stroke-width="4" />
    <path :d="`M110 800 ${fringe(63)}`" stroke="#2fb85a" stroke-width="5" fill="none" stroke-linejoin="round" />

    <g v-for="(a, i) in APPLES" :key="`ap${i}`">
      <circle :cx="a.x" :cy="a.y" r="22" :fill="i % 4 === 3 ? '#9be04a' : '#ff3b4f'" stroke="#1b1033" stroke-width="4" />
      <path :d="`M${a.x} ${a.y - 20} q2 -10 8 -12`" stroke="#5a3a1a" stroke-width="4" fill="none" stroke-linecap="round" />
      <path :d="`M${a.x - 12} ${a.y - 8} q4 -8 12 -10`" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.85" />
    </g>
    <g v-for="(o, i) in ORANGES" :key="`or${i}`">
      <circle :cx="o.x" :cy="o.y" r="21" fill="#ff8a1f" stroke="#1b1033" stroke-width="4" />
      <path :d="`M${o.x + 6} ${o.y + 8} a14 14 0 0 1 -14 8`" stroke="#d45f0a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path :d="`M${o.x - 11} ${o.y - 8} q4 -8 12 -9`" stroke="#ffe0b0" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle :cx="o.x + 2" :cy="o.y - 16" r="2.5" fill="#5a8a2a" />
    </g>
    <g v-for="(l, i) in LEMONS" :key="`le${i}`">
      <ellipse :cx="l.x" :cy="l.y" rx="24" ry="18" fill="#fff04a" stroke="#1b1033" stroke-width="4" />
      <path :d="`M${l.x - 12} ${l.y - 6} q8 -8 18 -6`" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
    <path d="M150 920 V1140 M640 920 V1140" stroke="#1b1033" stroke-width="18" stroke-linecap="round" />
    <path d="M150 920 V1140 M640 920 V1140" stroke="#a8642e" stroke-width="10" stroke-linecap="round" />
    <path d="M150 906 H680 V990 H150 Z" fill="url(#market-crate)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
    <path d="M150 934 H680 M150 962 H680 M360 906 V990 M546 906 V990" stroke="#7a4424" stroke-width="4" />
    <path d="M160 914 H670" stroke="#ffd6a0" stroke-width="4" opacity="0.7" />
    <path :d="`M150 906 ${fringe(59)}`" stroke="#2fb85a" stroke-width="5" fill="none" stroke-linejoin="round" />
    <g transform="translate(560 950)">
      <path d="M-58 0 A58 58 0 0 1 58 0 Z" fill="#2f9e3c" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-48 0 A48 48 0 0 1 48 0 Z" fill="#fffaf0" />
      <path d="M-42 0 A42 42 0 0 1 42 0 Z" fill="#ff4d6d" />
      <path d="M-20 -14 l2 6 M0 -24 l2 6 M20 -14 l2 6 M-6 -8 l2 6 M12 -30 l2 6" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />
    </g>
    <g transform="translate(480 846)">
      <path d="M0 0 V-90" stroke="#1b1033" stroke-width="4" />
      <path :d="BURST_SMALL" transform="translate(0 -100)" fill="#ff8ccf" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <circle cy="-100" r="8" fill="#fffaf0" />
    </g>

    <ellipse cx="160" cy="1130" rx="260" ry="26" fill="#2a1a4a" opacity="0.3" />
    <path d="M-60 870 H-20 L-10 900" stroke="#1b1033" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M-60 870 H-20 L-10 900" stroke="#ffd23f" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M60 908 V830 L80 816 H110 L118 830 V908 Z" fill="#9b5cff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M60 860 H118" stroke="#ffd23f" stroke-width="12" />
    <path d="M150 900 L220 780" stroke="#1b1033" stroke-width="26" stroke-linecap="round" />
    <path d="M150 900 L220 780" stroke="#e8b46a" stroke-width="18" stroke-linecap="round" />
    <path d="M168 870 l10 6 M184 842 l10 6 M200 814 l10 6" stroke="#b8803a" stroke-width="4" stroke-linecap="round" />
    <path d="M220 908 Q200 860 240 850 Q250 820 280 840 Q310 830 300 870 Q320 890 300 908 Z" fill="#4fcf5a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M250 900 Q256 870 270 852" stroke="#a8f0a0" stroke-width="4" fill="none" stroke-linecap="round" />
    <path d="M-60 900 H340 L300 1070 H-60 Z" fill="url(#market-cart)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="CART_GRID" stroke="#8a1030" stroke-width="5" fill="none" opacity="0.7" />
    <path d="M-60 900 H340" stroke="#1b1033" stroke-width="20" stroke-linecap="round" />
    <path d="M-60 900 H340" stroke="#ff8a9c" stroke-width="12" stroke-linecap="round" />
    <path d="M-50 896 H300" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    <path d="M-60 1096 H300" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
    <path d="M-60 1096 H300" stroke="#cfc8e6" stroke-width="7" stroke-linecap="round" />
    <circle cx="40" cy="1124" r="28" fill="#2b2448" stroke="#1b1033" stroke-width="5" />
    <circle cx="250" cy="1124" r="28" fill="#2b2448" stroke="#1b1033" stroke-width="5" />
    <circle cx="40" cy="1124" r="9" fill="#cfc8e6" />
    <circle cx="250" cy="1124" r="9" fill="#cfc8e6" />
  </g>
</template>

<style scoped>
.market-sway {
  transform-box: fill-box;
  transform-origin: top center;
  animation: market-sway 5s ease-in-out infinite alternate;
}

.market-swing {
  transform-box: fill-box;
  transform-origin: top center;
  animation: market-swing 2.6s ease-in-out infinite alternate;
}

.market-bob {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: market-bob 3.4s ease-in-out infinite alternate;
}

.market-belt {
  animation: market-belt 1.2s linear infinite;
}

.market-blink {
  animation: market-blink 1.6s steps(2) infinite;
}

@keyframes market-sway {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes market-swing {
  from {
    rotate: -9deg;
  }
  to {
    rotate: 9deg;
  }
}

@keyframes market-bob {
  from {
    rotate: -6deg;
    translate: 0 4px;
  }
  to {
    rotate: 6deg;
    translate: 0 -6px;
  }
}

@keyframes market-belt {
  from {
    translate: 0 0;
  }
  to {
    translate: 40px 0;
  }
}

@keyframes market-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.15;
  }
}
</style>
