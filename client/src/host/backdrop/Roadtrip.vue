<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(7321);
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
const CLOUD_SPOTS = [
  [380, 190, 120],
  [1060, 120, 96],
  [1420, 300, 64],
];
const CLOUDS = CLOUD_SPOTS.map(([x = 0, y = 0, w = 0]) => cloud(x, y, w)).join(' ');
const CLOUD_SHADE = CLOUD_SPOTS.map(([x = 0, y = 0, w = 0]) => {
  const [b, s] = [y + w * 0.3, w * 0.75];
  return `M${x - s} ${b} Q${x} ${b + w * 0.3} ${x + s} ${b} Q${x} ${b + w * 0.14} ${x - s} ${b} Z`;
}).join(' ');

const FAR_HILLS = 'M-60 720 Q120 600 320 640 Q520 560 760 630 Q980 584 1180 640 Q1400 560 1640 620 Q1820 584 1980 640 L1980 780 L-60 780 Z';
const MID_HILLS = 'M-60 744 Q200 664 460 702 Q700 652 900 706 Q1120 672 1340 702 Q1600 644 1980 700 L1980 800 L-60 800 Z';

// round trees on the hill crests: one fill path and one highlight path for the whole row
const TREE_SPOTS = [
  [140, 672, 20],
  [182, 678, 15],
  [560, 660, 18],
  [900, 682, 16],
  [940, 682, 12],
  [1510, 650, 20],
  [1552, 654, 14],
];
const TREES = TREE_SPOTS.map(([x = 0, y = 0, r = 0]) => circle(x, y, r)).join(' ');
const TREE_LIGHT = TREE_SPOTS.map(([x = 0, y = 0, r = 0]) => circle(x - r * 0.3, y - r * 0.3, r * 0.45)).join(' ');
const TRUNKS = TREE_SPOTS.map(([x = 0, y = 0, r = 0]) => `M${x} ${y + r * 0.6} v${f1(r * 0.9)}`).join(' ');

const WHEAT_ROWS = Array.from({ length: 9 }, (_, i) => {
  const y = 716 + i * 8;
  return `M${-40 + i * 6} ${y} Q${240} ${y - 10 - i} ${520 - i * 10} ${y + 2}`;
}).join(' ');
const SUNFLOWER_DOTS = Array.from({ length: 46 }, () => {
  return [1000 + rnd() * 460, 706 + rnd() * 58];
});
const SUNFLOWER_HEADS = SUNFLOWER_DOTS.map(([x = 0, y = 0]) => circle(x, y, 6 + rnd() * 2)).join(' ');
const SUNFLOWER_HEARTS = SUNFLOWER_DOTS.map(([x = 0, y = 0]) => `M${f1(x)} ${f1(y)} h0.1`).join(' ');

const POLES = [40, 620, 1200];
const sag = (a: number, b: number, y: number) => `M${a} ${y} Q${(a + b) / 2} ${y + 34} ${b} ${y}`;
const WIRES = [sag(-60, 40, 632), sag(40, 620, 632), sag(620, 1200, 632), sag(-60, 40, 652), sag(40, 620, 652), sag(620, 1200, 652)].join(' ');
const WIRE_BIRDS = [
  [820, 648],
  [860, 649],
  [1020, 647],
];

const KM_POSTS = [
  { x: 820, y: 828, s: 0.7 },
  { x: 1300, y: 830, s: 1 },
];

const DASHES = 'M-60 905 L1980 899';
const FAR_EDGE = 'M-60 848 L1980 842';
const NEAR_EDGE = 'M-60 962 L1980 956';

const BOARD = { x: 1390, y: 370, w: 280, h: 124 };
const BULBS = (() => {
  const pts: number[][] = [];
  const { x, y, w, h } = BOARD;
  for (let t = 18; t < w - 8; t += 30) pts.push([x + t, y + 2], [x + t, y + h - 2]);
  for (let t = 22; t < h - 8; t += 30) pts.push([x + 2, y + t], [x + w - 2, y + t]);
  return pts;
})();
const BULBS_A = BULBS.filter((_, i) => i % 2 === 0)
  .map(([x = 0, y = 0]) => circle(x, y, 6))
  .join(' ');
const BULBS_B = BULBS.filter((_, i) => i % 2 === 1)
  .map(([x = 0, y = 0]) => circle(x, y, 6))
  .join(' ');
// block letters drawn as strokes: SVG text would fall back to whatever font the TV has
const LETTERS = (() => {
  const [x, y] = [1412, 392];
  const k = `M${x} ${y} V${y + 64} M${x + 40} ${y} L${x + 4} ${y + 34} L${x + 40} ${y + 64}`;
  const a = `M${x + 64} ${y + 64} L${x + 84} ${y} L${x + 104} ${y + 64} M${x + 72} ${y + 42} H${x + 96}`;
  const f = `M${x + 150} ${y} V${y + 64} M${x + 130} ${y + 30} a20 15 0 1 0 40 0 a20 15 0 1 0 -40 0`;
  const e = `M${x + 228} ${y} H${x + 192} V${y + 64} H${x + 228} M${x + 192} ${y + 32} H${x + 220}`;
  return `${k} ${a} ${f} ${e}`;
})();

const AWNING_X = Array.from({ length: 8 }, (_, i) => 1572 + i * 40);
const AWNING_RED = AWNING_X.filter((_, i) => i % 2 === 0)
  .map((x) => `M${x} 700 h40 v26 a20 12 0 0 1 -40 0 Z`)
  .join(' ');
const AWNING_WHITE = AWNING_X.filter((_, i) => i % 2 === 1)
  .map((x) => `M${x} 700 h40 v26 a20 12 0 0 1 -40 0 Z`)
  .join(' ');

const WHEELS = [232, 502];
const GRASS_FLOWERS = Array.from({ length: 22 }, () => [rnd() * 1960 - 20, 1000 + rnd() * 70]);
const FLOWER_DOTS = GRASS_FLOWERS.map(([x = 0, y = 0]) => `${circle(x - 4, y, 3.5)} ${circle(x + 4, y, 3.5)} ${circle(x, y - 4, 3.5)} ${circle(x, y + 4, 3.5)}`).join(' ');
const FLOWER_HEARTS = GRASS_FLOWERS.map(([x = 0, y = 0]) => `M${f1(x)} ${f1(y)} h0.1`).join(' ');
</script>

<template>
  <g>
    <defs>
      <radialGradient id="roadtrip-sun">
        <stop offset="0%" stop-color="#fff8d0" stop-opacity="0.95" />
        <stop offset="40%" stop-color="#fff0a8" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#fff0a8" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="roadtrip-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4dc" stop-opacity="0" />
        <stop offset="60%" stop-color="#fff4dc" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fff4dc" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="roadtrip-verge" gradientUnits="userSpaceOnUse" x1="0" y1="760" x2="0" y2="850">
        <stop offset="0%" stop-color="#b8de78" />
        <stop offset="100%" stop-color="#7cb44c" />
      </linearGradient>
      <linearGradient id="roadtrip-near" gradientUnits="userSpaceOnUse" x1="0" y1="960" x2="0" y2="1140">
        <stop offset="0%" stop-color="#6aa84a" />
        <stop offset="100%" stop-color="#3a7232" />
      </linearGradient>
      <linearGradient id="roadtrip-asphalt" gradientUnits="userSpaceOnUse" x1="0" y1="836" x2="0" y2="976">
        <stop offset="0%" stop-color="#6e6884" />
        <stop offset="100%" stop-color="#4a4460" />
      </linearGradient>
      <linearGradient id="roadtrip-car" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff9a6a" />
        <stop offset="100%" stop-color="#d8483a" />
      </linearGradient>
      <linearGradient id="roadtrip-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8f8ff" />
        <stop offset="100%" stop-color="#7ab4dc" />
      </linearGradient>
      <linearGradient id="roadtrip-board" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe476" />
        <stop offset="100%" stop-color="#f4b23a" />
      </linearGradient>
      <linearGradient id="roadtrip-wall" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff0d4" />
        <stop offset="100%" stop-color="#e8c49a" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-roadtrip)" />
    <circle cx="1700" cy="150" r="300" fill="url(#roadtrip-sun)" />
    <circle cx="1700" cy="150" r="70" fill="#fff6c8" stroke="#f0b040" stroke-width="5" />
    <path d="M1664 122 Q1678 102 1708 98" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.85" />

    <g class="roadtrip-clouds">
      <path :d="CLOUDS" fill="none" stroke="#8ab8dc" stroke-width="7" />
      <path :d="CLOUDS" fill="#fffdf6" />
      <path :d="CLOUD_SHADE" fill="#cfe4f4" />
    </g>

    <path :d="FAR_HILLS" fill="#a8d0b4" stroke="#7ea896" stroke-width="5" stroke-linejoin="round" />
    <path d="M200 644 Q300 628 380 654 M1260 628 Q1380 592 1480 616" stroke="#c8e6cc" stroke-width="8" fill="none" stroke-linecap="round" />
    <rect x="-60" y="600" width="2040" height="180" fill="url(#roadtrip-haze)" />

    <path :d="MID_HILLS" fill="#9cce6a" stroke="#6e9e58" stroke-width="4" stroke-linejoin="round" />
    <path :d="WHEAT_ROWS" stroke="#e8c45a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85" />
    <path :d="TRUNKS" stroke="#6a4a3a" stroke-width="4" stroke-linecap="round" />
    <path :d="TREES" fill="#5e9a4a" stroke="#3e6a3a" stroke-width="3" />
    <path :d="TREE_LIGHT" fill="#86bc62" />
    <path :d="SUNFLOWER_HEADS" fill="#ffd23a" stroke="#c8902a" stroke-width="2" />
    <path :d="SUNFLOWER_HEARTS" stroke="#7a4a1e" stroke-width="5" stroke-linecap="round" />

    <path d="M-60 776 Q480 760 960 770 Q1440 780 1980 764 L1980 850 L-60 850 Z" fill="url(#roadtrip-verge)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(30, 790, 1900, 0.011)" stroke="#5f9a3a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />

    <path :d="WIRES" stroke="#3a3050" stroke-width="2.5" fill="none" />
    <g v-for="x in POLES" :key="`pole${x}`">
      <path :d="`M${x} 820 V600`" stroke="#1b1033" stroke-width="16" stroke-linecap="round" />
      <path :d="`M${x} 818 V602`" stroke="#9a6a44" stroke-width="9" stroke-linecap="round" />
      <path :d="`M${x - 28} 626 H${x + 28}`" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
      <path :d="`M${x - 28} 626 H${x + 28}`" stroke="#9a6a44" stroke-width="6" stroke-linecap="round" />
    </g>
    <g v-for="(b, i) in WIRE_BIRDS" :key="`wb${i}`" :transform="`translate(${b[0]} ${b[1]})`" stroke="#1b1033" stroke-width="2.5">
      <ellipse cy="-9" rx="10" ry="9" fill="#5a6a9a" />
      <circle cx="7" cy="-17" r="6" fill="#5a6a9a" />
      <path d="M12 -17 l6 2 l-6 2 Z" fill="#ffb03a" stroke-linejoin="round" />
      <path d="M-8 -6 l-8 6" stroke-linecap="round" />
    </g>

    <g v-for="(p, i) in KM_POSTS" :key="`km${i}`" :transform="`translate(${p.x} ${p.y}) scale(${p.s})`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cy="2" rx="26" ry="6" fill="#1b2a10" opacity="0.25" stroke="none" />
      <rect x="-16" y="-92" width="32" height="92" rx="4" fill="#f8f4ea" stroke-width="5" />
      <rect x="-16" y="-92" width="32" height="20" rx="4" fill="#e8402e" stroke-width="5" />
      <rect x="-11" y="-60" width="22" height="26" fill="#1b1033" stroke="none" />
      <path d="M-5 -54 v14 M2 -54 h5 v7 h-5 v7 h5" stroke="#f8f4ea" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M-9 -86 v10" stroke="#ffb0a0" stroke-width="3" stroke-linecap="round" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="1730" cy="812" rx="190" ry="12" fill="#1b2a10" opacity="0.28" stroke="none" />
      <rect x="1572" y="716" width="320" height="94" fill="url(#roadtrip-wall)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="1560" y="682" width="344" height="20" rx="4" fill="#7a5a8a" stroke-width="5" />
      <path :d="AWNING_RED" fill="#e8483a" stroke-width="3.5" />
      <path :d="AWNING_WHITE" fill="#fff6ea" stroke-width="3.5" />
      <rect x="1604" y="748" width="70" height="44" fill="#ffd77a" stroke-width="4" />
      <rect x="1798" y="748" width="70" height="44" fill="#ffd77a" stroke-width="4" />
      <path d="M1639 748 v44 M1833 748 v44" stroke-width="3" />
      <rect x="1702" y="740" width="66" height="70" fill="#8a4e2a" stroke-width="4" />
      <circle cx="1756" cy="778" r="4" fill="#1b1033" stroke="none" />
      <path d="M1612 758 l14 -6 M1806 758 l14 -6" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1518" y="494" width="24" height="346" fill="#8a8a9a" stroke-width="5" />
      <path d="M1524 500 V834" stroke="#c4c4d4" stroke-width="5" opacity="0.8" />
      <rect :x="BOARD.x" :y="BOARD.y" :width="BOARD.w" :height="BOARD.h" rx="16" fill="url(#roadtrip-board)" stroke-width="7" filter="url(#cel-s)" />
      <path :d="LETTERS" fill="none" stroke="#c8302e" stroke-width="13" stroke-linecap="round" />
      <path d="M1420 474 H1640" stroke="#c8302e" stroke-width="6" stroke-linecap="round" opacity="0.6" />
      <path :d="BULBS_A" class="roadtrip-bulbs" fill="#fff6c0" stroke-width="2.5" />
      <path :d="BULBS_B" class="roadtrip-bulbs roadtrip-bulbs-b" fill="#fff6c0" stroke-width="2.5" />
    </g>

    <path d="M-60 836 L1980 830 L1980 972 L-60 978 Z" fill="url(#roadtrip-asphalt)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="FAR_EDGE" stroke="#e8e2d0" stroke-width="5" opacity="0.8" />
    <path :d="DASHES" stroke="#f8f0d8" stroke-width="9" stroke-dasharray="70 56" stroke-linecap="round" />
    <path :d="NEAR_EDGE" stroke="#e8e2d0" stroke-width="6" opacity="0.85" />

    <path d="M-60 970 Q500 966 960 968 Q1440 970 1980 962 L1980 1140 L-60 1140 Z" fill="url(#roadtrip-near)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(20, 986, 1900, 0.017)" stroke="#2e6228" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    <path :d="FLOWER_DOTS" fill="#fffaf0" />
    <path :d="FLOWER_HEARTS" stroke="#ffc21e" stroke-width="5" stroke-linecap="round" />

    <ellipse cx="368" cy="944" rx="268" ry="14" fill="#1b1033" opacity="0.3" />
    <g class="roadtrip-bob" stroke="#1b1033" stroke-linejoin="round">
      <path d="M318 702 h188 M330 702 v-12 M494 702 v-12" stroke-width="8" stroke-linecap="round" />
      <path d="M318 702 h188" stroke="#9a9ab0" stroke-width="3" stroke-linecap="round" />
      <rect x="306" y="626" width="102" height="64" rx="8" fill="#ffb03a" stroke-width="5" />
      <path d="M340 626 v-10 h34 v10" fill="none" stroke-width="5" />
      <path d="M316 640 v38" stroke="#ffe0a0" stroke-width="5" stroke-linecap="round" />
      <rect x="414" y="642" width="88" height="48" rx="8" fill="#4a8ae0" stroke-width="5" />
      <path d="M424 652 v28" stroke="#a8d0ff" stroke-width="5" stroke-linecap="round" />
      <rect x="330" y="592" width="150" height="34" rx="17" fill="#5ab86a" stroke-width="5" />
      <path d="M368 594 v30 M406 594 v30 M444 594 v30" stroke="#2e7a44" stroke-width="4" />
      <path d="M352 596 Q400 588 460 596" stroke="#a8e4a8" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M342 702 L372 590 M470 702 L438 590" stroke="#f4e4c0" stroke-width="5" fill="none" stroke-linecap="round" />

      <path
        d="M140 892 Q126 892 126 874 L128 826 Q132 798 164 794 L244 790 L302 724 Q314 710 334 710 L478 710 Q502 710 516 728 L562 790 Q604 796 610 822 L612 874 Q612 892 594 892 Z"
        fill="url(#roadtrip-car)"
        stroke-width="6"
      />
      <path d="M130 852 Q370 864 610 852 L612 874 Q612 892 594 892 L140 892 Q126 892 126 874 Z" fill="#b8342e" opacity="0.7" stroke="none" />
      <path d="M262 786 L312 732 Q318 724 330 724 L390 724 L390 786 Z" fill="url(#roadtrip-glass)" stroke-width="5" />
      <path d="M404 724 L476 724 Q490 724 500 736 L544 786 L404 786 Z" fill="url(#roadtrip-glass)" stroke-width="5" />
      <circle cx="332" cy="760" r="21" fill="#c88a4a" stroke-width="3.5" />
      <ellipse cx="352" cy="768" rx="13" ry="9" fill="#f0c898" stroke-width="3" />
      <path d="M318 744 q-16 4 -12 30 q12 -4 16 -18 Z" fill="#8a5a2e" stroke-width="3" />
      <circle cx="338" cy="752" r="3.5" fill="#1b1033" stroke="none" />
      <circle cx="363" cy="764" r="4.5" fill="#1b1033" stroke="none" />
      <path d="M352 776 q2 8 8 6" stroke="#ff7a8a" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M420 736 L440 736 M420 736 Q410 754 418 780" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.75" />
      <path d="M397 794 V884" stroke-width="4" />
      <path d="M268 800 V884" stroke-width="3" opacity="0.5" />
      <rect x="414" y="808" width="26" height="7" rx="3" fill="#1b1033" stroke="none" />
      <rect x="282" y="808" width="26" height="7" rx="3" fill="#1b1033" stroke="none" />
      <path d="M598 808 q14 4 12 24 q-14 -2 -18 -20 Z" fill="#fff4b0" stroke-width="3.5" />
      <rect x="126" y="808" width="14" height="24" rx="4" fill="#ff5a4a" stroke-width="3.5" />
      <path d="M172 806 Q300 798 420 800" stroke="#ffd0b0" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8" />
      <path d="M186 892 A46 46 0 0 1 278 892 Z M456 892 A46 46 0 0 1 548 892 Z" fill="#1b1033" stroke="none" />
    </g>
    <g v-for="x in WHEELS" :key="`wh${x}`" :transform="`translate(${x} 896)`" stroke="#1b1033">
      <circle r="44" fill="#2a2438" stroke-width="5" />
      <g class="roadtrip-wheel">
        <circle r="22" fill="#c8c4d8" stroke-width="4" />
        <path d="M0 -18 V18 M-18 0 H18" stroke="#6a6680" stroke-width="5" stroke-linecap="round" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.roadtrip-clouds {
  animation: roadtrip-clouds 44s ease-in-out infinite alternate;
}

.roadtrip-bob {
  animation: roadtrip-bob 0.7s ease-in-out infinite alternate;
}

.roadtrip-wheel {
  transform-box: fill-box;
  transform-origin: center;
  animation: roadtrip-wheel 1.1s linear infinite;
}

.roadtrip-bulbs {
  animation: roadtrip-bulbs 1.8s linear infinite;
}

.roadtrip-bulbs-b {
  animation-delay: -0.9s;
}

@keyframes roadtrip-clouds {
  from {
    translate: -70px 0;
  }
  to {
    translate: 70px 0;
  }
}

@keyframes roadtrip-bob {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -4px;
  }
}

@keyframes roadtrip-wheel {
  to {
    rotate: 360deg;
  }
}

@keyframes roadtrip-bulbs {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0.25;
  }
}
</style>
