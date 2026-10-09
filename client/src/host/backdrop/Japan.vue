<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(612);
const f1 = (n: number) => n.toFixed(1);

const PETAL_COLORS = ['#ffc2d6', '#ffd6e4', '#ff9ec0'];
const PETALS = Array.from({ length: 54 }, () => ({ x: rnd() * 2160, y: rnd() * 1080, a: rnd() * 180, k: 0.7 + rnd() * 0.7, c: PETAL_COLORS[Math.floor(rnd() * 3)] }));
// each sheet is drawn twice, one drift-length apart, so the fall loops without a seam
const PETAL_SHEETS = [26, 20, 16].map((s, i) => ({ s, d: i * 5, petals: PETALS.filter((_, j) => j % 3 === i) }));

// blossom clusters: many puffs merged into one path per shade, so a whole canopy is three nodes
const puffs = (cx: number, cy: number, n: number, spread: number, r: number) =>
  Array.from({ length: n }, () => {
    const x = cx + (rnd() - 0.5) * spread * 2;
    const y = cy + (rnd() - 0.5) * spread;
    const rr = r * (0.6 + rnd() * 0.6);
    return `M${f1(x - rr)} ${f1(y)} a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(rr * 2)} 0 a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-rr * 2)} 0 Z`;
  }).join(' ');
const RIGHT_CLUSTERS: [number, number, number][] = [
  [1420, 150, 90],
  [1560, 70, 110],
  [1720, 40, 120],
  [1880, 110, 110],
  [1640, 230, 90],
  [1840, 300, 90],
  [1500, 290, 60],
];
const LEFT_CLUSTERS: [number, number, number][] = [
  [60, 60, 100],
  [230, 110, 80],
  [380, 150, 60],
  [120, 200, 70],
];
const blossom = (clusters: [number, number, number][]) => ({
  deep: clusters.map(([x, y, s]) => puffs(x + 10, y + 16, 7, s, s * 0.42)).join(' '),
  mid: clusters.map(([x, y, s]) => puffs(x, y, 9, s, s * 0.36)).join(' '),
  light: clusters.map(([x, y, s]) => puffs(x - 12, y - 14, 6, s * 0.7, s * 0.22)).join(' '),
});
const RIGHT_BLOSSOM = blossom(RIGHT_CLUSTERS);
const LEFT_BLOSSOM = blossom(LEFT_CLUSTERS);
const DOTS = [...RIGHT_CLUSTERS, ...LEFT_CLUSTERS]
  .flatMap(([cx, cy, s]) => Array.from({ length: 5 }, () => `M${f1(cx + (rnd() - 0.5) * s * 1.6)} ${f1(cy + (rnd() - 0.5) * s * 0.8)} h0.1`))
  .join(' ');

const roof = (y: number, w: number) =>
  `M${-w} ${y + 4} Q${-w * 0.8} ${y} ${-w * 0.62} ${y - 40} H${w * 0.62} Q${w * 0.8} ${y} ${w} ${y + 4} L${w * 0.92} ${y + 14} Q0 ${y - 2} ${-w * 0.92} ${y + 14} Z`;
const TIERS = [
  { y: -150, w: 190, bw: 92, bot: -30 },
  { y: -250, w: 156, bw: 72, bot: -190 },
  { y: -340, w: 128, bw: 56, bot: -290 },
];

const quadY = (a: number, c: number, t: number) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * c + t * t * a;
const BRIDGE_POSTS = [0.06, 0.2, 0.35, 0.5, 0.65, 0.8, 0.94].map((t) => ({ x: 440 + 520 * t, deck: quadY(846, 626, t), rail: quadY(790, 570, t) }));

const KOI = [
  { x: 900, y: 1000, k: 1, d: 0, s: 26, body: '#fffaf0', spot: '#ff5a2a' },
  { x: 820, y: 1030, k: -1.2, d: 9, s: 34, body: '#ff7a2f', spot: '#fffaf0' },
  { x: 1000, y: 980, k: 0.75, d: 17, s: 22, body: '#ffd23f', spot: '#1b1033' },
];
const LANTERNS = [
  { x: 210, y: 960, k: 1.1, d: 0 },
  { x: 1500, y: 880, k: 0.8, d: 1.3 },
];
const RAKE_RINGS = [70, 100, 130, 160, 190];
const RAKE_LINES = Array.from({ length: 9 }, (_, i) => {
  const y = 930 + i * 26;
  return `M1380 ${y} Q1460 ${y - 8} 1540 ${y} T1700 ${y} T1860 ${y} T2020 ${y}`;
}).join(' ');
const BAMBOO = [
  { x: -10, w: 30, c: '#5fb43a' },
  { x: 50, w: 26, c: '#7fcf4a' },
  { x: 100, w: 22, c: '#4a9a32' },
].map((b, i) => ({
  ...b,
  nodes: Array.from({ length: 10 }, (_, k) => `M${b.x - b.w / 2 - 3} ${1100 - k * 130 - i * 40} h${b.w + 6}`).join(' '),
}));
const BAMBOO_LEAVES = [
  { x: 40, y: 120, a: -30 },
  { x: 90, y: 260, a: 20 },
  { x: 10, y: 380, a: -50 },
  { x: 120, y: 470, a: 30 },
  { x: 60, y: 560, a: -20 },
];
const IRIS = [
  { x: 1400, y: 1000 },
  { x: 1340, y: 1080 },
  { x: 330, y: 900 },
];
const FAR_TREES = Array.from({ length: 9 }, (_, i) => ({ x: 60 + i * 230 + rnd() * 80, y: 690 + rnd() * 20, r: 20 + rnd() * 14 }));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="japan-fuji" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a99ad8" />
        <stop offset="100%" stop-color="#ecc6dc" />
      </linearGradient>
      <linearGradient id="japan-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff3e8" stop-opacity="0" />
        <stop offset="60%" stop-color="#fff3e8" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#fff3e8" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="japan-moss" gradientUnits="userSpaceOnUse" x1="0" y1="740" x2="0" y2="1140">
        <stop offset="0%" stop-color="#a8dc8a" />
        <stop offset="100%" stop-color="#4f9a5a" />
      </linearGradient>
      <linearGradient id="japan-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a8e8ec" />
        <stop offset="100%" stop-color="#3a98c0" />
      </linearGradient>
      <linearGradient id="japan-red" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff6a4a" />
        <stop offset="100%" stop-color="#c8281e" />
      </linearGradient>
      <linearGradient id="japan-roof" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a6aa0" />
        <stop offset="100%" stop-color="#2e3866" />
      </linearGradient>
      <linearGradient id="japan-stone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d8d2dc" />
        <stop offset="100%" stop-color="#8a8496" />
      </linearGradient>
      <linearGradient id="japan-bark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#8a5a4a" />
        <stop offset="100%" stop-color="#4a2a2a" />
      </linearGradient>
      <linearGradient id="japan-gravel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbf4ea" />
        <stop offset="100%" stop-color="#e4d6c6" />
      </linearGradient>
      <clipPath id="japan-pond-clip">
        <path d="M200 1140 C170 960 300 860 440 850 C470 848 480 800 560 790 L840 790 C900 792 900 836 960 834 C1150 826 1380 836 1430 920 C1470 1000 1420 1080 1380 1140 Z" />
      </clipPath>
      <clipPath id="japan-gravel-clip">
        <path d="M1380 1140 Q1440 960 1600 930 Q1800 900 1980 910 L1980 1140 Z" />
      </clipPath>
    </defs>

    <circle cx="700" cy="240" r="200" fill="#fff4e8" opacity="0.35" />
    <circle cx="700" cy="240" r="110" fill="#ff8a8a" opacity="0.75" />
    <path d="M640 200 Q660 170 700 162" stroke="#ffd0c8" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8" />
    <path d="M380 330 H760 M520 360 H980 M1020 280 H1420 M1180 310 H1640" stroke="#fff4f0" stroke-width="10" stroke-linecap="round" opacity="0.6" />

    <g class="gull" style="animation-duration: 44s; animation-delay: -12s">
      <g transform="translate(0 420) scale(0.5)">
        <path d="M-10 0 Q-40 -60 -120 -50 Q-70 -20 -40 10 Q-10 0 0 10 Q10 0 40 10 Q70 -20 120 -50 Q40 -60 10 0 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" class="flap" />
        <path d="M-120 -50 Q-100 -46 -84 -36 M120 -50 Q100 -46 84 -36" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
        <ellipse cx="0" cy="8" rx="34" ry="14" fill="#fffaf0" stroke="#1b1033" stroke-width="5" />
        <path d="M30 4 Q60 -10 80 -6" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round" />
        <path d="M30 4 Q60 -10 80 -6" stroke="#fffaf0" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle cx="82" cy="-6" r="7" fill="#ff3b3b" stroke="#1b1033" stroke-width="3" />
        <path d="M88 -4 L112 0 L88 4 Z" fill="#ffb02e" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M-34 10 L-90 20" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />
      </g>
    </g>

    <path d="M760 720 Q1000 560 1150 400 Q1210 330 1260 330 Q1310 330 1370 400 Q1520 560 1780 720 Z" fill="url(#japan-fuji)" stroke="#9a84c4" stroke-width="3" stroke-linejoin="round" />
    <path d="M1150 400 Q1210 330 1260 330 Q1310 330 1370 400 L1352 418 L1324 402 L1300 436 L1270 412 L1244 446 L1214 414 L1186 432 L1170 412 Z" fill="#fffaff" stroke="#9a84c4" stroke-width="3" stroke-linejoin="round" />
    <path d="M1196 360 Q1220 342 1246 338 M1300 436 L1330 520 M1244 446 L1230 540 M1186 432 L1140 500" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    <path d="M1380 470 L1440 560 M1420 520 L1500 600 M1100 500 L1050 580" stroke="#c4b2e4" stroke-width="5" stroke-linecap="round" opacity="0.6" />

    <circle v-for="(t, i) in FAR_TREES" :key="`ft${i}`" :cx="t.x" :cy="t.y - 26" :r="t.r" fill="#f8d2e4" stroke="#d8a0c0" stroke-width="2.5" />
    <path d="M-60 712 Q180 650 400 684 Q600 646 820 690 Q1040 666 1260 694 Q1500 650 1720 690 Q1860 670 1980 690 L1980 1140 L-60 1140 Z" fill="#eebfd6" stroke="#c890b4" stroke-width="3" stroke-linejoin="round" />
    <rect x="-60" y="620" width="2040" height="200" fill="url(#japan-haze)" />

    <path d="M-60 778 Q500 744 960 762 Q1400 780 1980 752 L1980 1140 L-60 1140 Z" fill="url(#japan-moss)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(560, 770, 1380, 0.015)" stroke="#5f9a4a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />

    <g transform="translate(270 790)">
      <ellipse cx="0" cy="6" rx="190" ry="16" fill="#1b2a10" opacity="0.3" />
      <path d="M-150 0 V-30 H150 V0 Z" fill="url(#japan-stone)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-110 -15 H110" stroke="#6a6478" stroke-width="3" opacity="0.6" />
      <path d="M0 -380 V-560" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
      <path d="M0 -380 V-560" stroke="#ffc94a" stroke-width="7" stroke-linecap="round" />
      <path d="M-14 -420 h28 M-14 -444 h28 M-14 -468 h28 M-12 -492 h24 M-10 -514 h20" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
      <path d="M-14 -420 h28 M-14 -444 h28 M-14 -468 h28 M-12 -492 h24 M-10 -514 h20" stroke="#ffc94a" stroke-width="4" stroke-linecap="round" />
      <circle cx="0" cy="-566" r="9" fill="#ffc94a" stroke="#1b1033" stroke-width="4" />
      <g v-for="(t, i) in TIERS" :key="`pt${i}`">
        <rect :x="-t.bw" :y="t.y" :width="t.bw * 2" :height="t.bot - t.y" fill="#fff0dc" stroke="#1b1033" stroke-width="5" />
        <path :d="`M${-t.bw + 10} ${t.y} V${t.bot} M${t.bw - 10} ${t.y} V${t.bot} M${-t.bw * 0.3} ${t.y} V${t.bot} M${t.bw * 0.3} ${t.y} V${t.bot}`" stroke="#e04a3a" stroke-width="12" />
        <path :d="`M${-t.bw * 0.3 + 10} ${(t.y + t.bot) / 2} H${t.bw * 0.3 - 10}`" stroke="#a8784a" stroke-width="4" />
        <path :d="`M${-t.bw} ${t.y + 10} H${t.bw}`" stroke="#e04a3a" stroke-width="8" />
        <path :d="roof(t.y, t.w)" fill="url(#japan-roof)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
        <path :d="`M${-t.w * 0.55} ${t.y - 30} H${t.w * 0.3}`" stroke="#8a9ad8" stroke-width="4" stroke-linecap="round" opacity="0.8" />
        <circle :cx="-t.w + 6" :cy="t.y + 10" r="6" fill="#ffc94a" stroke="#1b1033" stroke-width="2.5" />
        <circle :cx="t.w - 6" :cy="t.y + 10" r="6" fill="#ffc94a" stroke="#1b1033" stroke-width="2.5" />
      </g>
      <path d="M-30 -30 V-100 Q0 -120 30 -100 V-30 Z" fill="#6a2a2a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>

    <g transform="translate(1570 806)">
      <ellipse cx="0" cy="6" rx="170" ry="14" fill="#1b2a10" opacity="0.3" />
      <g fill="url(#japan-red)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
        <path d="M-124 0 L-112 -300 H-88 L-96 0 Z" />
        <path d="M124 0 L112 -300 H88 L96 0 Z" />
        <rect x="-150" y="-252" width="300" height="22" />
        <rect x="-12" y="-286" width="24" height="34" />
      </g>
      <path d="M-180 -296 Q0 -320 180 -296 L192 -312 Q0 -342 -192 -312 Z" fill="url(#japan-red)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-200 -312 Q0 -344 200 -312 L208 -330 Q0 -364 -208 -330 Z" fill="#2a1a2a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-128 0 h40 v-22 h-40 Z M88 0 h40 v-22 h-40 Z" fill="#2a1a2a" stroke="#1b1033" stroke-width="4" />
      <path d="M-104 -40 L-98 -280 M98 -280 L104 -40" stroke="#ffa080" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      <path d="M-160 -330 Q0 -356 160 -330" stroke="#6a5a7a" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <path d="M200 1140 C170 960 300 860 440 850 C470 848 480 800 560 790 L840 790 C900 792 900 836 960 834 C1150 826 1380 836 1430 920 C1470 1000 1420 1080 1380 1140 Z" fill="url(#japan-water)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
    <g clip-path="url(#japan-pond-clip)">
      <path d="M560 800 Q700 760 840 800" stroke="#c8281e" stroke-width="14" fill="none" opacity="0.25" />
      <path d="M300 940 Q500 910 700 930 M760 900 Q1000 880 1300 900 M400 1040 Q700 1010 1000 1030 M1050 1080 Q1250 1060 1400 1090" stroke="#e6fbff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.55" />
      <g v-for="(k, i) in KOI" :key="`koi${i}`" :transform="`translate(${k.x} ${k.y}) scale(${k.k} ${Math.abs(k.k)})`">
        <g class="japan-koi" :style="{ animationDelay: `-${k.d}s`, animationDuration: `${k.s}s` }">
          <path d="M-38 0 L-62 -18 Q-54 0 -62 18 Z" :fill="k.body" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <path d="M8 -12 L-4 -24 L-12 -12 Z M8 12 L-4 24 L-12 12 Z" :fill="k.body" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <path d="M42 0 Q34 -15 4 -15 Q-26 -12 -42 0 Q-26 12 4 15 Q34 15 42 0 Z" :fill="k.body" stroke="#1b1033" stroke-width="3.5" />
          <path d="M30 -8 Q14 -14 4 -4 Q14 6 28 4 Z M-6 6 Q-18 -6 -30 0 Q-18 8 -6 6 Z" :fill="k.spot" />
          <circle cx="32" cy="-6" r="2.5" fill="#1b1033" />
          <circle cx="32" cy="6" r="2.5" fill="#1b1033" />
        </g>
      </g>
      <path d="M200 1140 C170 960 300 860 440 850" stroke="#2a6a8a" stroke-width="16" fill="none" opacity="0.25" />
    </g>
    <g fill="url(#japan-stone)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path d="M410 860 Q420 830 460 834 Q490 840 486 866 Q450 880 410 860 Z" />
      <path d="M940 846 Q950 816 990 822 Q1020 832 1012 856 Q976 866 940 846 Z" />
      <path d="M1380 900 Q1400 870 1440 880 Q1470 900 1450 924 Q1410 930 1380 900 Z" />
      <path d="M220 1000 Q236 966 276 974 Q300 990 290 1018 Q250 1030 220 1000 Z" />
    </g>
    <g v-for="(lp, i) in [{ x: 600, y: 1010 }, { x: 1180, y: 1060 }, { x: 1100, y: 900 }]" :key="`lp${i}`">
      <path :d="`M${lp.x} ${lp.y} L${lp.x + 30} ${lp.y - 5} A30 12 0 1 1 ${lp.x + 30} ${lp.y + 5} Z`" fill="#4fbf5a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path :d="`M${lp.x - 8} ${lp.y - 4} l-8 -16 l10 6 l4 -14 l4 14 l10 -6 l-8 16 Z`" fill="#ff9ec0" stroke="#1b1033" stroke-width="2.5" stroke-linejoin="round" />
    </g>

    <g>
      <path d="M560 796 V900 M840 796 V900" stroke="#1b1033" stroke-width="22" />
      <path d="M560 796 V900 M840 796 V900" stroke="#a8281e" stroke-width="14" />
      <path d="M430 848 Q700 628 970 848 L960 874 Q700 676 440 874 Z" fill="url(#japan-red)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M470 840 Q700 660 930 840" stroke="#ffa080" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
      <g v-for="(p, i) in BRIDGE_POSTS" :key="`bp${i}`">
        <path :d="`M${p.x} ${p.deck} V${p.rail - 6}`" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
        <path :d="`M${p.x} ${p.deck} V${p.rail - 6}`" stroke="#e8402e" stroke-width="7" stroke-linecap="round" />
      </g>
      <path d="M440 790 Q700 570 960 790" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M440 790 Q700 570 960 790" stroke="#e8402e" stroke-width="9" fill="none" stroke-linecap="round" />
      <path d="M470 770 Q600 670 680 660" stroke="#ffb8a0" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M440 816 Q700 598 960 816" stroke="#c8281e" stroke-width="5" fill="none" />
      <g fill="#ffc94a" stroke="#1b1033" stroke-width="3">
        <path :d="`M${BRIDGE_POSTS[0]?.x ?? 0} ${(BRIDGE_POSTS[0]?.rail ?? 0) - 22} q-10 10 0 16 q10 -6 0 -16 Z`" />
        <path :d="`M${BRIDGE_POSTS[6]?.x ?? 0} ${(BRIDGE_POSTS[6]?.rail ?? 0) - 22} q-10 10 0 16 q10 -6 0 -16 Z`" />
      </g>
    </g>

    <g v-for="(b, i) in [{ x: 370, y: 880, k: 1 }, { x: 1040, y: 860, k: 0.8 }, { x: 1300, y: 836, k: 0.7 }]" :key="`az${i}`" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`">
      <ellipse cx="0" cy="4" rx="60" ry="9" fill="#1b2a10" opacity="0.3" />
      <path d="M-60 0 Q-70 -36 -36 -44 Q-24 -74 8 -64 Q40 -76 50 -40 Q74 -24 56 0 Z" fill="#e8508a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-40 -36 Q-26 -54 -6 -56 M14 -52 q12 -4 22 2" stroke="#ffb0cc" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-40 -6 Q0 -20 46 -6" stroke="#b02a62" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
    </g>

    <g v-for="(l, i) in LANTERNS" :key="`ln${i}`" :transform="`translate(${l.x} ${l.y}) scale(${l.k})`">
      <ellipse cx="0" cy="4" rx="70" ry="10" fill="#1b2a10" opacity="0.3" />
      <g fill="url(#japan-stone)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
        <path d="M-44 0 V-16 H44 V0 Z" />
        <path d="M-14 -16 V-90 H14 V-16 Z" />
        <path d="M-40 -90 V-104 H40 V-90 Z" />
        <rect x="-30" y="-150" width="60" height="46" />
        <path d="M-64 -150 Q-40 -156 -26 -176 H26 Q40 -156 64 -150 Z" />
      </g>
      <rect x="-16" y="-142" width="32" height="30" fill="#fff2a0" stroke="#1b1033" stroke-width="3" class="japan-glow" :style="{ animationDelay: `-${l.d}s` }" />
      <path d="M0 -142 V-112" stroke="#1b1033" stroke-width="3" />
      <circle cx="0" cy="-186" r="10" fill="url(#japan-stone)" stroke="#1b1033" stroke-width="4" />
      <path d="M-50 -154 Q-36 -160 -24 -172" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
      <path d="M-30 -104 q20 -6 40 0" stroke="#6fbf4a" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7" />
    </g>

    <g v-for="(r, i) in IRIS" :key="`ir${i}`" :transform="`translate(${r.x} ${r.y})`">
      <path d="M0 0 Q-6 -50 -18 -80 M0 0 Q4 -60 10 -96 M0 0 Q12 -40 28 -66" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round" />
      <path d="M0 0 Q-6 -50 -18 -80 M0 0 Q4 -60 10 -96 M0 0 Q12 -40 28 -66" stroke="#4fae4a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M10 -96 q-14 -10 -6 -22 q8 6 6 22 q14 -12 6 -24 q-10 8 -6 24 Z" fill="#8a5aff" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M28 -66 q-12 -10 -4 -20 q8 6 4 20 q12 -10 6 -20 q-10 6 -6 20 Z" fill="#b48aff" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    </g>

    <path d="M1380 1140 Q1440 960 1600 930 Q1800 900 1980 910 L1980 1140 Z" fill="url(#japan-gravel)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <g clip-path="url(#japan-gravel-clip)" fill="none" stroke="#c8b8a4" stroke-width="4">
      <path :d="RAKE_LINES" />
      <ellipse v-for="r in RAKE_RINGS" :key="`rr${r}`" cx="1730" cy="1010" :rx="r" :ry="r * 0.38" fill="#f6eee2" />
    </g>
    <ellipse cx="1730" cy="1012" rx="80" ry="16" fill="#3a2a3a" opacity="0.3" />
    <path d="M1660 1010 Q1660 950 1720 940 Q1790 934 1800 990 Q1806 1014 1780 1016 L1680 1018 Q1660 1018 1660 1010 Z" fill="url(#japan-stone)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
    <path d="M1690 960 Q1720 944 1760 948 Q1740 966 1700 972 Z" fill="#6fbf4a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    <path d="M1690 990 l30 -4 M1740 1000 l40 -6" stroke="#6a6478" stroke-width="4" stroke-linecap="round" opacity="0.6" />

    <path d="M1880 1140 Q1850 900 1820 760 Q1790 600 1720 470 Q1680 400 1600 330" stroke="#1b1033" stroke-width="64" fill="none" stroke-linecap="round" />
    <path d="M1880 1140 Q1850 900 1820 760 Q1790 600 1720 470 Q1680 400 1600 330" stroke="url(#japan-bark)" stroke-width="52" fill="none" stroke-linecap="round" />
    <path d="M1760 520 Q1800 360 1880 280 M1700 420 Q1640 260 1520 200 M1810 680 Q1900 560 1990 520 M1650 380 Q1560 340 1440 280" stroke="#1b1033" stroke-width="30" fill="none" stroke-linecap="round" />
    <path d="M1760 520 Q1800 360 1880 280 M1700 420 Q1640 260 1520 200 M1810 680 Q1900 560 1990 520 M1650 380 Q1560 340 1440 280" stroke="#6a3a34" stroke-width="20" fill="none" stroke-linecap="round" />
    <path d="M1836 1100 Q1814 900 1790 780 M1790 700 l16 -4 M1830 900 l16 -4" stroke="#b07a6a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />

    <path d="M-60 80 Q200 60 440 150 M120 70 Q160 140 120 230 M260 100 Q300 60 380 40" stroke="#1b1033" stroke-width="24" fill="none" stroke-linecap="round" />
    <path d="M-60 80 Q200 60 440 150 M120 70 Q160 140 120 230 M260 100 Q300 60 380 40" stroke="#6a3a34" stroke-width="15" fill="none" stroke-linecap="round" />

    <path :d="RIGHT_BLOSSOM.deep + LEFT_BLOSSOM.deep" fill="#1b1033" stroke="#1b1033" stroke-width="9" />
    <path :d="RIGHT_BLOSSOM.deep + LEFT_BLOSSOM.deep" fill="#f27aa8" filter="url(#cel-s)" />
    <path :d="RIGHT_BLOSSOM.mid + LEFT_BLOSSOM.mid" fill="#ffaccb" />
    <path :d="RIGHT_BLOSSOM.light + LEFT_BLOSSOM.light" fill="#ffd6e6" />
    <path :d="DOTS" stroke="#d8407a" stroke-width="7" stroke-linecap="round" />

    <g v-for="(b, i) in BAMBOO" :key="`bb${i}`">
      <path :d="`M${b.x} 1160 V-60`" stroke="#1b1033" :stroke-width="b.w + 8" />
      <path :d="`M${b.x} 1160 V-60`" :stroke="b.c" :stroke-width="b.w" />
      <path :d="b.nodes" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />
      <path :d="`M${b.x - b.w / 4} 1140 V-40`" stroke="#c8f0a0" stroke-width="4" opacity="0.6" />
    </g>
    <g fill="#5fb43a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
      <path v-for="(l, i) in BAMBOO_LEAVES" :key="`bl${i}`" :transform="`translate(${l.x} ${l.y}) rotate(${l.a})`" d="M0 0 Q40 -14 90 0 Q40 12 0 0 Z" />
    </g>

    <g fill="#1d3a28" stroke="#0b1a12" stroke-width="5">
      <path d="M-60 1140 Q-30 980 110 940 Q60 1040 90 1140 Z" />
      <path d="M-60 1140 Q60 1040 240 1040 Q140 1090 150 1140 Z" />
      <path d="M1980 1140 Q1990 1000 1900 980 Q1940 1060 1890 1140 Z" />
    </g>

    <g v-for="(sheet, i) in PETAL_SHEETS" :key="`ps${i}`" class="japan-petals" :style="{ animationDuration: `${sheet.s}s`, animationDelay: `-${sheet.d}s` }">
      <template v-for="(p, j) in sheet.petals" :key="j">
        <ellipse :cx="p.x" :cy="p.y" :rx="8 * p.k" :ry="4.5 * p.k" :transform="`rotate(${p.a} ${p.x} ${p.y})`" :fill="p.c" stroke="#e06a98" stroke-width="1.5" />
        <ellipse :cx="p.x + 240" :cy="p.y - 1080" :rx="8 * p.k" :ry="4.5 * p.k" :transform="`rotate(${p.a} ${p.x + 240} ${p.y - 1080})`" :fill="p.c" stroke="#e06a98" stroke-width="1.5" />
      </template>
    </g>
  </g>
</template>

<style scoped>
.japan-koi {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: japan-koi linear infinite;
}

.japan-glow {
  animation: japan-glow 2.4s ease-in-out infinite alternate;
}

.japan-petals {
  animation: japan-petals linear infinite;
}

@keyframes japan-glow {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}

@keyframes japan-petals {
  from {
    translate: 0 0;
  }
  to {
    translate: -240px 1080px;
  }
}

@keyframes japan-koi {
  0% {
    translate: 230px 0px;
    rotate: 90deg;
  }
  4.17% {
    translate: 222px 21px;
    rotate: 128deg;
  }
  8.33% {
    translate: 199px 40px;
    rotate: 149deg;
  }
  12.5% {
    translate: 163px 57px;
    rotate: 161deg;
  }
  16.67% {
    translate: 115px 69px;
    rotate: 169deg;
  }
  20.83% {
    translate: 60px 77px;
    rotate: 175deg;
  }
  25% {
    translate: 0px 80px;
    rotate: 180deg;
  }
  29.17% {
    translate: -60px 77px;
    rotate: 185deg;
  }
  33.33% {
    translate: -115px 69px;
    rotate: 191deg;
  }
  37.5% {
    translate: -163px 57px;
    rotate: 199deg;
  }
  41.67% {
    translate: -199px 40px;
    rotate: 211deg;
  }
  45.83% {
    translate: -222px 21px;
    rotate: 232deg;
  }
  50% {
    translate: -230px 0px;
    rotate: 270deg;
  }
  54.17% {
    translate: -222px -21px;
    rotate: 308deg;
  }
  58.33% {
    translate: -199px -40px;
    rotate: 329deg;
  }
  62.5% {
    translate: -163px -57px;
    rotate: 341deg;
  }
  66.67% {
    translate: -115px -69px;
    rotate: 349deg;
  }
  70.83% {
    translate: -60px -77px;
    rotate: 355deg;
  }
  75% {
    translate: 0px -80px;
    rotate: 360deg;
  }
  79.17% {
    translate: 60px -77px;
    rotate: 365deg;
  }
  83.33% {
    translate: 115px -69px;
    rotate: 371deg;
  }
  87.5% {
    translate: 163px -57px;
    rotate: 379deg;
  }
  91.67% {
    translate: 199px -40px;
    rotate: 391deg;
  }
  95.83% {
    translate: 222px -21px;
    rotate: 412deg;
  }
  100% {
    translate: 230px 0px;
    rotate: 450deg;
  }
}
</style>
