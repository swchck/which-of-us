<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(339);

// one-point perspective: the back wall spans x 440-1480, y 150-720 and everything converges on (960, 520)
const VX = 960;
const VY = 520;
const depth = (x: number) => Math.abs(x - VX) / 520;
// v runs 0 at the ceiling edge to 1 at the floor, along a side wall at screen x
const wallY = (x: number, v: number) => VY + (-370 + 570 * v) * depth(x);
const pt = (x: number, v: number) => `${x.toFixed(1)} ${wallY(x, v).toFixed(1)}`;
const quad = (x1: number, x2: number, v1: number, v2: number) => `M${pt(x1, v1)} L${pt(x2, v1)} L${pt(x2, v2)} L${pt(x1, v2)} Z`;
// affine fit of a 100x100 art box onto a wall quad: exact on the top edge, close enough below
const artMatrix = (x1: number, x2: number, v1: number, v2: number) => {
  const y1 = wallY(x1, v1);
  return `matrix(${(x2 - x1) / 100} ${(wallY(x2, v1) - y1) / 100} 0 ${(wallY(x1, v2) - y1) / 100} ${x1} ${y1})`;
};

const SIDE_PAINTINGS = [
  { x1: 70, x2: 270, v1: 0.27, v2: 0.62 },
  { x1: 1650, x2: 1850, v1: 0.27, v2: 0.62 },
].map((p) => ({
  frame: quad(p.x1, p.x2, p.v1, p.v2),
  canvas: quad(p.x1 + 16, p.x2 - 16, p.v1 + 0.025, p.v2 - 0.025),
  art: artMatrix(p.x1 + 16, p.x2 - 16, p.v1 + 0.025, p.v2 - 0.025),
}));

const WALL_L = `M-60 ${wallY(-60, 0)} L440 150 L440 720 L-60 ${wallY(-60, 1)} Z`;
const WALL_R = `M1980 ${wallY(1980, 0)} L1480 150 L1480 720 L1980 ${wallY(1980, 1)} Z`;
const WAINSCOT = `M-60 ${wallY(-60, 0.8)} L440 606 L440 720 L-60 ${wallY(-60, 1)} Z M1980 ${wallY(1980, 0.8)} L1480 606 L1480 720 L1980 ${wallY(1980, 1)} Z`;
const WAIN_PANELS = [
  { a: 20, b: 160 },
  { a: 210, b: 330 },
  { a: 1590, b: 1710 },
  { a: 1760, b: 1900 },
]
  .map(({ a, b }) => quad(a, b, 0.84, 0.96))
  .join(' ');

const WALLPAPER = Array.from({ length: 20 }, (_, i) => `M${470 + i * 52} 170V606`).join('');
const SIDE_STRIPES = [-20, 60, 130, 195, 255, 310, 360, 405, 1515, 1560, 1610, 1665, 1725, 1790, 1860, 1940]
  .map((x) => `M${x} ${wallY(x, 0.02).toFixed(1)}V${wallY(x, 0.8).toFixed(1)}`)
  .join('');
const FLOOR_K = [1, 1.16, 1.36, 1.62, 1.98, 2.5, 3.3];
const FLOOR_X = Array.from({ length: 11 }, (_, j) => 440 + j * 104);
const floorPt = (x: number, k: number) => `${(VX + (x - VX) * k).toFixed(1)} ${(VY + 200 * k).toFixed(1)}`;
const spans = (a: number[]) => a.slice(0, -1).map((v, i) => [v, a[i + 1] ?? v] as const);
const TILES_DARK = spans(FLOOR_K)
  .flatMap(([k1, k2], i) =>
    spans(FLOOR_X)
      .filter((_, j) => (i + j) % 2 === 0)
      .map(([xa, xb]) => `M${floorPt(xa, k1)} L${floorPt(xb, k1)} L${floorPt(xb, k2)} L${floorPt(xa, k2)} Z`),
  )
  .join('');

const SKYLIGHT = 'M700 30 L1220 30 L1180 120 L740 120 Z';
const LASERS = [
  `M${pt(150, 0.9)} L${pt(1770, 0.84)} M${pt(150, 0.84)} L${pt(1770, 0.93)}`,
  `M${pt(260, 0.92)} L${pt(1660, 0.88)} M${pt(260, 0.86)} L${pt(1660, 0.94)}`,
];
const EMITTERS = (
  [
    [150, 0.9],
    [150, 0.84],
    [260, 0.92],
    [260, 0.86],
    [1770, 0.84],
    [1770, 0.93],
    [1660, 0.88],
    [1660, 0.94],
  ] as const
).map(([x, v]) => ({ x, y: wallY(x, v) }));
const MOTES = [0, 1, 2].map((g) =>
  Array.from({ length: 7 }, () => ({ x: 480 + rnd() * 960, y: 140 + rnd() * 520, r: 2 + rnd() * 3, g })),
);
</script>

<template>
  <g>
    <defs>
      <linearGradient id="museum-back" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7d6cc0" />
        <stop offset="100%" stop-color="#6a59ac" />
      </linearGradient>
      <linearGradient id="museum-wall-l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#3a2a74" />
        <stop offset="100%" stop-color="#5a4a9c" />
      </linearGradient>
      <linearGradient id="museum-wall-r" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="#30225f" />
        <stop offset="100%" stop-color="#52438f" />
      </linearGradient>
      <linearGradient id="museum-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d9c8e8" />
        <stop offset="100%" stop-color="#b9a2cf" />
      </linearGradient>
      <linearGradient id="museum-marble" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="60%" stop-color="#e6def4" />
        <stop offset="100%" stop-color="#c2b4dc" />
      </linearGradient>
      <linearGradient id="museum-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffe27a" />
        <stop offset="55%" stop-color="#f2b53a" />
        <stop offset="100%" stop-color="#c47d1e" />
      </linearGradient>
      <linearGradient id="museum-shaft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6d6" stop-opacity="0.32" />
        <stop offset="100%" stop-color="#fff6d6" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="museum-gleam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="museum-doorway" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b8acdf" />
        <stop offset="100%" stop-color="#ddd3f2" />
      </linearGradient>
      <linearGradient id="museum-clay" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffa860" />
        <stop offset="60%" stop-color="#e2733a" />
        <stop offset="100%" stop-color="#a84a26" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1200" fill="#251a4c" />
    <path d="M-60 -60 H1980 V-180 L1480 150 H440 L-60 -180 Z" fill="#2e2260" />
    <path d="M440 150 L-60 -206 M1480 150 L1980 -206 M560 150 L250 -60 M1360 150 L1670 -60" stroke="#4a3a86" stroke-width="4" />
    <path :d="SKYLIGHT" fill="#9fdcff" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M830 30 L812 120 M960 30 V120 M1090 30 L1108 120 M718 75 H1200" stroke="#3b3070" stroke-width="6" />
    <path d="M730 44 L760 44 M860 44 L900 44" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.8" />

    <rect x="440" y="150" width="1040" height="570" fill="url(#museum-back)" />
    <path :d="WALLPAPER" stroke="#8a7acc" stroke-width="10" opacity="0.35" />
    <rect x="440" y="606" width="1040" height="114" fill="#4c3c8a" />
    <path d="M440 606 H1480" stroke="#e6c25a" stroke-width="6" />
    <g fill="none" stroke="#3a2c72" stroke-width="3">
      <rect x="470" y="626" width="300" height="76" rx="4" />
      <rect x="1150" y="626" width="300" height="76" rx="4" />
    </g>
    <path d="M440 160 H1480" stroke="#5a4a9c" stroke-width="10" />
    <path d="M845 720 V470 Q845 370 960 370 Q1075 370 1075 470 V720 Z" fill="url(#museum-doorway)" stroke="#2c2160" stroke-width="5" />
    <path d="M860 720 V660 H1060 V720 Z" fill="#cbbde8" />
    <path d="M900 660 L880 720 M960 660 V720 M1020 660 L1040 720" stroke="#b3a4d6" stroke-width="3" />
    <path d="M845 720 V470 Q845 370 960 370 Q1075 370 1075 470 V500 Q1060 392 960 392 Q866 392 866 480 V720 Z" fill="#9488c2" />
    <rect x="930" y="470" width="60" height="44" fill="#e6c25a" stroke="#6a59ac" stroke-width="3" />
    <rect x="938" y="477" width="44" height="30" fill="#7ac6a0" />
    <path d="M845 720 L800 760 M1075 720 L1120 760" stroke="#2c2160" stroke-width="3" opacity="0.5" />
    <path d="M880 700 L1040 700" stroke="#c8bce6" stroke-width="4" opacity="0.6" />

    <path :d="WALL_L" fill="url(#museum-wall-l)" />
    <path :d="WALL_R" fill="url(#museum-wall-r)" />
    <path :d="SIDE_STRIPES" stroke="#6a5ab0" stroke-width="8" opacity="0.3" />
    <path :d="WAINSCOT" fill="#2a1d58" />
    <path :d="`M-60 ${wallY(-60, 0.8)} L440 606 M1980 ${wallY(1980, 0.8)} L1480 606`" stroke="#e6c25a" stroke-width="6" />
    <path :d="WAIN_PANELS" fill="none" stroke="#1d1442" stroke-width="3" />
    <path d="M440 150 V720 M1480 150 V720" stroke="#1b1033" stroke-width="4" />

    <path d="M440 720 H1480 L2600 1180 L-680 1180 Z" fill="url(#museum-floor)" />
    <path :d="TILES_DARK" fill="#9d84bf" opacity="0.55" />
    <path d="M440 720 H1480" stroke="#1b1033" stroke-width="5" />
    <path d="M440 720 L-60 912 M1480 720 L1980 912" stroke="#1b1033" stroke-width="5" />
    <g fill="#fff" opacity="0.18">
      <path d="M406 722 H474 L486 800 H394 Z" />
      <path d="M1446 722 H1514 L1526 800 H1434 Z" />
      <path d="M260 1000 H400 L420 1140 H240 Z" />
      <path d="M1590 910 H1730 L1744 1010 H1576 Z" />
    </g>
    <path d="M845 720 L820 780 M1075 720 L1100 780" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.14" />

    <path d="M760 120 L520 720 L1400 720 L1160 120 Z" fill="url(#museum-shaft)" class="soft-glow" />
    <g v-for="(g, gi) in MOTES" :key="`mo${gi}`" class="museum-dust" :style="{ animationDelay: `-${gi * 3}s`, animationDuration: `${9 + gi * 2}s` }">
      <circle v-for="(m, i) in g" :key="i" :cx="m.x" :cy="m.y" :r="m.r" fill="#fff3d6" />
    </g>

    <g v-for="(p, i) in SIDE_PAINTINGS" :key="`sp${i}`">
      <path :d="p.frame" fill="url(#museum-gold)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path :d="p.canvas" :fill="i === 0 ? '#3c7a9a' : '#1f2a6a'" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <clipPath :id="`museum-canvas-${i}`">
        <path :d="p.canvas" />
      </clipPath>
      <g :clip-path="`url(#museum-canvas-${i})`">
        <g v-if="i === 0" :transform="p.art">
          <path d="M18 100 Q16 70 50 66 Q84 70 82 100 Z" fill="#c23a5a" />
          <path d="M40 68 L50 84 L60 68" fill="#f4e2c8" />
          <ellipse cx="50" cy="44" rx="16" ry="20" fill="#f6d2b0" />
          <path d="M32 46 Q30 18 50 18 Q72 18 68 46 Q66 32 50 30 Q36 32 32 46 Z M32 44 Q26 70 36 74 L36 50 Z M68 44 Q74 70 64 74 L64 50 Z" fill="#4a2a1a" />
          <path d="M44 52 Q50 56 56 52" stroke="#8a3a3a" stroke-width="1.6" fill="none" stroke-linecap="round" />
          <circle cx="44" cy="44" r="1.8" fill="#1b1033" />
          <circle cx="56" cy="44" r="1.8" fill="#1b1033" />
          <path d="M6 12 Q14 6 22 12" stroke="#7fb0c8" stroke-width="2" fill="none" />
        </g>
        <g v-else :transform="p.art">
          <path d="M0 76 Q30 64 50 74 Q76 60 100 70 V100 H0 Z" fill="#163a4a" />
          <path d="M16 74 Q10 40 20 14 Q24 40 22 74 Z" fill="#0f1a2a" />
          <circle cx="72" cy="22" r="10" fill="#ffe14d" />
          <path d="M6 40 Q30 26 50 40 Q70 54 94 36 M10 54 Q34 42 56 52 Q76 62 96 50" stroke="#7aa8ff" stroke-width="3" fill="none" stroke-linecap="round" />
          <g fill="#fff6a0">
            <circle cx="40" cy="14" r="2.5" />
            <circle cx="56" cy="10" r="2" />
            <circle cx="88" cy="40" r="2" />
            <circle cx="30" cy="30" r="2" />
          </g>
        </g>
      </g>
      <path :d="`M${i === 0 ? 86 : 1666} ${wallY(i === 0 ? 86 : 1666, 0.29) + 4} l30 ${i === 0 ? 8 : -8}`" stroke="#fff6c8" stroke-width="5" stroke-linecap="round" opacity="0.8" />
    </g>

    <g class="museum-frame">
      <g transform="translate(660 250)">
        <path d="M0 -70 L-100 4 M0 -70 L100 4" stroke="#1b1033" stroke-width="3" fill="none" />
        <circle cx="0" cy="-72" r="5" fill="#e6c25a" stroke="#1b1033" stroke-width="2" />
        <rect x="-110" y="0" width="220" height="160" rx="6" fill="url(#museum-gold)" stroke="#1b1033" stroke-width="5" />
        <rect x="-92" y="16" width="184" height="128" fill="#9fe0ff" stroke="#1b1033" stroke-width="3" />
        <path d="M-92 100 L-40 52 L-8 82 L30 40 L92 100 V144 H-92 Z" fill="#6aa0c8" />
        <path d="M30 40 L44 54 L36 58 L22 52 Z" fill="#fff" />
        <path d="M-92 144 V112 Q-40 92 0 114 Q40 98 92 116 V144 Z" fill="#3fbf6a" />
        <circle cx="56" cy="40" r="14" fill="#ffd23f" />
        <path d="M-100 10 H100" stroke="#fff3b0" stroke-width="4" opacity="0.7" />
      </g>
    </g>
    <g class="museum-frame" style="animation-delay: -3s">
      <g transform="translate(1260 240)">
        <path d="M0 -60 L-90 4 M0 -60 L90 4" stroke="#1b1033" stroke-width="3" fill="none" />
        <circle cx="0" cy="-62" r="5" fill="#e6c25a" stroke="#1b1033" stroke-width="2" />
        <rect x="-100" y="0" width="200" height="180" rx="6" fill="url(#museum-gold)" stroke="#1b1033" stroke-width="5" />
        <rect x="-82" y="16" width="164" height="148" fill="#fffaf0" stroke="#1b1033" stroke-width="3" />
        <rect x="-82" y="16" width="70" height="80" fill="#ff4f8b" />
        <rect x="20" y="104" width="62" height="60" fill="#22a3ee" />
        <rect x="-12" y="16" width="32" height="40" fill="#ffd23f" />
        <path d="M-12 16 V164 M20 16 V164 M-82 96 H82 M-12 56 H82" stroke="#1b1033" stroke-width="6" />
        <path d="M-90 10 H90" stroke="#fff3b0" stroke-width="4" opacity="0.7" />
      </g>
    </g>
    <g fill="#ffe8a8" class="soft-glow" style="animation-delay: -2s">
      <path d="M660 130 L560 260 L760 260 Z" opacity="0.2" />
      <path d="M1260 130 L1160 250 L1360 250 Z" opacity="0.2" />
    </g>
    <path d="M600 132 H1320" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
    <g fill="#3a2c72" stroke="#1b1033" stroke-width="4">
      <path d="M646 132 L640 158 H680 L674 132 Z" />
      <path d="M1246 132 L1240 158 H1280 L1274 132 Z" />
    </g>

    <g v-for="x in [440, 1480]" :key="`bc${x}`" :transform="`translate(${x} 0)`">
      <rect x="-34" y="190" width="68" height="510" fill="url(#museum-marble)" stroke="#1b1033" stroke-width="4" filter="url(#cel-s)" />
      <path d="M-12 200 V690 M12 200 V690" stroke="#b0a2d0" stroke-width="3" />
      <rect x="-46" y="166" width="92" height="26" rx="4" fill="#efe8fa" stroke="#1b1033" stroke-width="4" />
      <rect x="-46" y="698" width="92" height="24" rx="4" fill="#efe8fa" stroke="#1b1033" stroke-width="4" />
    </g>

    <g stroke="#ff3b5c" stroke-width="3" fill="none" stroke-linecap="round">
      <path :d="LASERS[0]" class="museum-laser" />
      <path :d="LASERS[1]" class="museum-laser" style="animation-delay: -0.9s" />
    </g>
    <g fill="#3a2c72" stroke="#1b1033" stroke-width="3">
      <rect v-for="(e, i) in EMITTERS" :key="`em${i}`" :x="e.x - 9" :y="e.y - 9" width="18" height="18" rx="4" />
    </g>
    <g fill="#ff3b5c">
      <circle v-for="(e, i) in EMITTERS" :key="`el${i}`" :cx="e.x" :cy="e.y" r="4.5" />
    </g>

    <g transform="translate(1590 168)">
      <path d="M40 -10 V20 H20" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round" />
      <path d="M40 -10 V20 H20" stroke="#8a86a8" stroke-width="5" fill="none" stroke-linecap="round" />
      <g class="museum-cam">
        <rect x="-70" y="6" width="90" height="40" rx="8" fill="#e6e2f2" stroke="#1b1033" stroke-width="4" />
        <path d="M-70 6 L-90 0 V52 L-70 46 Z" fill="#3a2c72" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-58 14 H8" stroke="#fff" stroke-width="4" stroke-linecap="round" />
        <circle cx="4" cy="34" r="5" fill="#ff3b5c" class="blinker" />
      </g>
    </g>

    <g transform="translate(1660 900)">
      <ellipse cx="0" cy="4" rx="120" ry="18" fill="#1b0a33" opacity="0.3" />
      <path d="M-70 0 V-170 H70 V0 Z" fill="url(#museum-marble)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-86" y="-190" width="172" height="24" rx="5" fill="#efe8fa" stroke="#1b1033" stroke-width="5" />
      <rect x="-82" y="-16" width="164" height="20" rx="5" fill="#d8cfee" stroke="#1b1033" stroke-width="5" />
      <path d="M-40 -150 V-30 M0 -150 V-30 M40 -150 V-30" stroke="#c2b4dc" stroke-width="4" />
      <path d="M-30 -190 Q-70 -250 -40 -310 Q-24 -330 -24 -348 H24 Q24 -330 40 -310 Q70 -250 30 -190 Z" fill="url(#museum-clay)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <rect x="-32" y="-362" width="64" height="16" rx="5" fill="#e2733a" stroke="#1b1033" stroke-width="4" />
      <path d="M-26 -330 Q-62 -330 -52 -290 M26 -330 Q62 -330 52 -290" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
      <path d="M-26 -330 Q-62 -330 -52 -290 M26 -330 Q62 -330 52 -290" stroke="#e2733a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-56 -260 Q0 -244 56 -260 M-50 -232 Q0 -216 50 -232" stroke="#1b1033" stroke-width="9" fill="none" />
      <path d="M-34 -250 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8" stroke="#ffd9a0" stroke-width="3" fill="none" stroke-linejoin="round" />
      <path d="M-38 -290 Q-48 -260 -40 -224" stroke="#ffd2a8" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8" />
      <path d="M-20 -200 Q-10 -222 0 -212" stroke="#7a3418" stroke-width="3" fill="none" />
    </g>

    <g transform="translate(330 990)">
      <ellipse cx="0" cy="4" rx="140" ry="20" fill="#1b0a33" opacity="0.3" />
      <path d="M-70 0 V-200 H70 V0 Z" fill="url(#museum-marble)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
      <rect x="-90" y="-226" width="180" height="30" rx="6" fill="#efe8fa" stroke="#1b1033" stroke-width="5" />
      <rect x="-88" y="-20" width="176" height="24" rx="6" fill="#d8cfee" stroke="#1b1033" stroke-width="5" />
      <path d="M-50 -60 L-36 -90 L-44 -120 M30 -160 L46 -140" stroke="#b0a2d0" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M-82 -226 Q-90 -300 -30 -320 L30 -320 Q90 -300 82 -226 Z" fill="url(#museum-marble)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-60 -236 Q-40 -290 10 -310 M20 -236 Q40 -276 70 -290" stroke="#c2b4dc" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-20 -318 V-350 H20 V-318 Z" fill="#e6def4" stroke="#1b1033" stroke-width="5" />
      <ellipse cx="0" cy="-396" rx="46" ry="56" fill="url(#museum-marble)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-46 -414 Q-30 -462 6 -456 Q40 -452 46 -418" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M-46 -414 Q-30 -462 6 -456 Q40 -452 46 -418" stroke="#4fc87a" stroke-width="9" fill="none" stroke-linecap="round" />
      <path d="M-40 -428 l-10 -6 M-28 -446 l-8 -10 M-10 -456 l-4 -12 M12 -456 l4 -12 M30 -446 l8 -10 M42 -428 l10 -6" stroke="#2f9e5a" stroke-width="6" stroke-linecap="round" />
      <path d="M-24 -398 Q-16 -406 -8 -398 M8 -398 Q16 -406 24 -398" stroke="#1b1033" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <path d="M0 -394 Q-8 -376 0 -372" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M-10 -360 Q0 -354 10 -360" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M-26 -428 Q-18 -440 -4 -442" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
      <ellipse cx="-26" cy="-380" rx="8" ry="5" fill="#ffb3c7" opacity="0.5" />
    </g>

    <g v-for="x in [1480, 1840]" :key="`po${x}`" :transform="`translate(${x} ${x === 1480 ? 960 : 980})`">
      <ellipse cx="0" cy="2" rx="40" ry="10" fill="#1b0a33" opacity="0.3" />
      <ellipse cx="0" cy="-4" rx="30" ry="10" fill="url(#museum-gold)" stroke="#1b1033" stroke-width="4" />
      <rect x="-7" y="-140" width="14" height="136" fill="url(#museum-gold)" stroke="#1b1033" stroke-width="4" />
      <circle cx="0" cy="-148" r="13" fill="url(#museum-gold)" stroke="#1b1033" stroke-width="4" />
      <circle cx="-4" cy="-152" r="4" fill="#fff6c8" />
    </g>
    <path d="M1480 818 Q1660 930 1840 838" stroke="#1b1033" stroke-width="18" fill="none" stroke-linecap="round" />
    <path d="M1480 818 Q1660 930 1840 838" stroke="#d6264a" stroke-width="11" fill="none" stroke-linecap="round" />
    <path d="M1560 862 Q1650 892 1740 870" stroke="#ff7a96" stroke-width="3" fill="none" stroke-linecap="round" />

    <g fill="#140c30" stroke="#07041a" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-20 900 140 830 Q70 960 110 1140 Z" />
      <path d="M-60 1140 Q50 990 280 970 Q150 1040 170 1140 Z" />
      <path d="M-60 980 Q-10 880 60 800 Q30 900 20 1000 Z" />
      <path d="M1980 1140 Q1960 920 1800 850 Q1870 990 1830 1140 Z" />
      <path d="M1980 1140 Q1880 1000 1660 990 Q1780 1060 1760 1140 Z" />
      <path d="M1980 990 Q1930 880 1870 810 Q1900 910 1900 1010 Z" />
    </g>
  </g>
</template>

<style scoped>
.museum-cam {
  transform-box: fill-box;
  transform-origin: 100% 40%;
  animation: museum-cam-pan 7s ease-in-out infinite alternate;
}

@keyframes museum-cam-pan {
  0%,
  20% {
    rotate: -14deg;
  }
  80%,
  100% {
    rotate: 10deg;
  }
}
</style>
