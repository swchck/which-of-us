<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(431);
const STARS = Array.from({ length: 26 }, () => ({ x: rnd() * 1920, y: rnd() * 300, r: 0.8 + rnd() * 1.8 }));
const CLOUDS = [
  { y: 330, k: 0.9, d: 10, s: 90 },
  { y: 470, k: 0.65, d: 55, s: 110 },
];
const SMOKE = [0, 1, 2];
const EMBER_COLORS = ['#ffe08a', '#ffb02e', '#ff7a2f'];
const EMBERS = Array.from({ length: 42 }, () => {
  const x = rnd() < 0.3 ? rnd() * 560 : 1160 + rnd() * 760;
  return { x, y: rnd() * 1080, r: 2 + rnd() * 3, c: EMBER_COLORS[Math.floor(rnd() * 3)] };
});
// three rising sheets instead of 42 rising sparks; each is drawn twice a screen apart so the loop has no seam
const EMBER_SHEETS = [16, 12, 9].map((s, i) => ({ s, embers: EMBERS.filter((_, j) => j % 3 === i) }));

const LAVA_LEFT = 'M1404 362 Q1384 440 1334 520 Q1292 590 1302 660 Q1312 720 1262 790';
const LAVA_RIGHT = 'M1486 362 Q1518 450 1580 520 Q1644 600 1622 700 Q1612 760 1652 822';

type Pt = [number, number];
const BRIDGE: Record<'a' | 'c' | 'b', Pt> = { a: [520, 772], c: [712, 872], b: [904, 792] };
const quad = (t: number, p0: Pt, c: Pt, p1: Pt): Pt => {
  const at = (k: 0 | 1) => (1 - t) * (1 - t) * p0[k] + 2 * t * (1 - t) * c[k] + t * t * p1[k];
  return [at(0), at(1)];
};
const DECK = `M${BRIDGE.a.join(' ')} Q${BRIDGE.c.join(' ')} ${BRIDGE.b.join(' ')}`;
const ROPE_OFFSET = 52;
const ROPE = `M${BRIDGE.a[0]} ${BRIDGE.a[1] - ROPE_OFFSET} Q${BRIDGE.c[0]} ${BRIDGE.c[1] - ROPE_OFFSET - 10} ${BRIDGE.b[0]} ${BRIDGE.b[1] - ROPE_OFFSET}`;
const HANGERS = Array.from({ length: 9 }, (_, i) => {
  const t = (i + 1) / 10;
  const [x, y] = quad(t, BRIDGE.a, BRIDGE.c, BRIDGE.b);
  const ropeY = quad(t, [0, BRIDGE.a[1] - ROPE_OFFSET], [0, BRIDGE.c[1] - ROPE_OFFSET - 10], [0, BRIDGE.b[1] - ROPE_OFFSET])[1];
  return `M${x.toFixed(1)} ${ropeY.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(' ');

const PALMS = [
  { x: 110, y: 760, flip: 1, d: 0, k: 1 },
  { x: 1880, y: 830, flip: -1, d: 1.7, k: 0.9 },
];
const FERN_ANGLES = [-64, -32, 0, 32, 64];
const FERNS = [
  { x: 470, y: 960, k: 1, c: '#2a9a5a' },
  { x: 40, y: 990, k: 1.3, c: '#1f8a4c' },
  { x: 1180, y: 970, k: 0.8, c: '#2a9a5a' },
];
const VENTS = [
  { x: 1050, y: 842, d: 0 },
  { x: 1260, y: 858, d: 2.4 },
];
const COLUMNS = [
  { x: 1268, top: 980, w: 46 },
  { x: 1314, top: 944, w: 50 },
  { x: 1364, top: 966, w: 44 },
  { x: 1408, top: 1000, w: 48 },
];
const LAKE_BUBBLES = [
  { x: 1640, y: 1060, r: 14, d: 0 },
  { x: 1860, y: 1030, r: 10, d: 0.8 },
  { x: 1760, y: 1080, r: 16, d: 1.5 },
  { x: 1560, y: 1100, r: 9, d: 2 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="volcano-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a0f3e" />
        <stop offset="45%" stop-color="#8a2b5a" />
        <stop offset="75%" stop-color="#ff7a4a" />
        <stop offset="100%" stop-color="#ffb46a" />
      </linearGradient>
      <linearGradient id="volcano-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c85a7a" />
        <stop offset="100%" stop-color="#4a1f5a" />
      </linearGradient>
      <linearGradient id="volcano-cone" x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0%" stop-color="#6a2840" />
        <stop offset="50%" stop-color="#3a1230" />
        <stop offset="100%" stop-color="#1e0a1c" />
      </linearGradient>
      <linearGradient id="volcano-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffb07a" stop-opacity="0" />
        <stop offset="60%" stop-color="#ffb07a" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffb07a" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="volcano-jungle" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#3fae6a" />
        <stop offset="60%" stop-color="#22704a" />
      </linearGradient>
      <linearGradient id="volcano-basalt" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#5e2c50" />
        <stop offset="100%" stop-color="#2e1230" />
      </linearGradient>
      <linearGradient id="volcano-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1f6a44" />
        <stop offset="100%" stop-color="#0e2e20" />
      </linearGradient>
      <linearGradient id="volcano-wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#d79a5e" />
        <stop offset="100%" stop-color="#8a5030" />
      </linearGradient>
      <radialGradient id="volcano-lava" cx="45%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#fff3a8" />
        <stop offset="35%" stop-color="#ffb02e" />
        <stop offset="75%" stop-color="#ff5a2f" />
        <stop offset="100%" stop-color="#c42a1a" />
      </radialGradient>
      <radialGradient id="volcano-halo">
        <stop offset="0%" stop-color="#ffb02e" stop-opacity="0.6" />
        <stop offset="50%" stop-color="#ff7a2f" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#ff5a2f" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1200" fill="url(#volcano-sky)" />
    <circle v-for="(s, i) in STARS" :key="`st${i}`" :cx="s.x" :cy="s.y" :r="s.r" fill="#ffe6f0" opacity="0.7" />

    <g v-for="(c, i) in CLOUDS" :key="`vc${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-150 20 Q-170 -10 -120 -22 Q-100 -56 -50 -46 Q-20 -76 30 -60 Q80 -72 100 -40 Q160 -36 150 0 Q170 20 120 24 Z" fill="#b24a72" stroke="#7a2a5a" stroke-width="4" stroke-linejoin="round" />
        <path d="M-140 18 Q0 4 140 18 Q60 34 -140 18 Z" fill="#ff9a6a" />
        <path d="M-60 -38 Q-40 -50 -16 -48 M30 -52 Q56 -60 76 -50" stroke="#e07a96" stroke-width="5" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <rect x="-60" y="700" width="2040" height="300" fill="url(#volcano-sea)" />
    <path d="M60 720 h120 M300 736 h80 M700 724 h140 M860 744 h70 M1040 730 h120 M1120 760 h160 M1220 790 h120" stroke="#ffb07a" stroke-width="4" stroke-linecap="round" opacity="0.6" />
    <path d="M760 704 Q820 670 880 680 Q930 670 960 704 Z" fill="#a04a6a" stroke="#8a3a5a" stroke-width="3" />

    <circle cx="1445" cy="350" r="300" fill="url(#volcano-halo)" />
    <g v-for="i in SMOKE" :key="`sm${i}`" class="volcano-smoke" :style="{ animationDelay: `-${i * 3}s` }">
      <path d="M1395 330 Q1385 300 1415 294 Q1421 268 1449 274 Q1471 260 1487 284 Q1511 290 1501 320 Q1505 340 1475 340 H1415 Q1395 340 1395 330 Z" fill="#6a4466" />
      <path d="M1412 300 Q1424 286 1440 288 M1458 282 Q1474 278 1484 290" stroke="#a87a96" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>
    <path d="M920 800 Q1080 730 1210 570 Q1320 430 1366 352 L1524 352 Q1584 440 1690 570 Q1820 730 1990 770 L1990 1140 L920 1140 Z" fill="url(#volcano-cone)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1180 640 L1230 628 M1110 720 L1170 704 M1260 580 L1296 566 M1700 640 L1750 660 M1620 520 L1650 540 M1760 720 L1820 736 M1400 520 L1430 512 M1520 600 L1560 610" stroke="#2a0f2a" stroke-width="5" stroke-linecap="round" opacity="0.45" />
    <path d="M1372 362 Q1320 440 1216 572 Q1100 720 960 790 M1518 362 Q1580 450 1684 572" stroke="#ff9a5a" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7" />
    <path d="M1300 470 Q1240 560 1180 620 M1560 440 Q1600 500 1640 540" stroke="#ffd36b" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5" />
    <g class="volcano-pulse">
      <path :d="LAVA_LEFT" stroke="#ff5a2f" stroke-width="44" fill="none" stroke-linecap="round" opacity="0.35" />
      <path :d="LAVA_RIGHT" stroke="#ff5a2f" stroke-width="44" fill="none" stroke-linecap="round" opacity="0.35" />
      <ellipse cx="1445" cy="352" rx="110" ry="36" fill="#ffb02e" opacity="0.45" />
    </g>
    <path :d="`${LAVA_LEFT} ${LAVA_RIGHT}`" stroke="#1b1033" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path :d="`${LAVA_LEFT} ${LAVA_RIGHT}`" stroke="#ff6a2f" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path :d="`${LAVA_LEFT} ${LAVA_RIGHT}`" stroke="#ffd36b" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="40 26" />
    <ellipse cx="1445" cy="352" rx="82" ry="20" fill="#3a1020" stroke="#1b1033" stroke-width="5" />
    <ellipse cx="1445" cy="352" rx="62" ry="12" fill="#ffb02e" class="glow" />
    <path d="M1404 352 Q1396 368 1402 380 M1486 352 Q1494 368 1488 380" stroke="#ff6a2f" stroke-width="12" stroke-linecap="round" />
    <path d="M1410 346 Q1440 338 1470 344" stroke="#fff3a8" stroke-width="5" fill="none" stroke-linecap="round" />

    <rect x="-60" y="620" width="2040" height="240" fill="url(#volcano-haze)" />

    <path d="M560 774 L900 794 L860 1000 L600 1000 Z" fill="#2a0f1a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <ellipse cx="730" cy="880" rx="220" ry="90" fill="url(#volcano-halo)" />
    <path d="M590 900 Q680 870 760 890 Q820 904 870 884" stroke="#ff6a2f" stroke-width="30" fill="none" stroke-linecap="round" />
    <path d="M590 900 Q680 870 760 890 Q820 904 870 884" stroke="#ffb02e" stroke-width="16" fill="none" stroke-linecap="round" />
    <path d="M590 900 Q680 870 760 890 Q820 904 870 884" stroke="#fff3a8" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="24 20" />

    <path d="M-60 760 Q120 700 300 714 Q450 726 568 776 L620 1140 L-60 1140 Z" fill="url(#volcano-jungle)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M40 740 q40 -14 80 -14 M360 726 q50 0 90 14" stroke="#8ae0a0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <path d="M560 800 L590 900 M548 860 L574 960" stroke="#1b1033" stroke-width="4" stroke-linecap="round" opacity="0.4" />
    <path d="M892 794 Q1040 770 1200 800 Q1500 846 1990 816 L1990 1140 L860 1140 Z" fill="url(#volcano-basalt)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M920 840 L980 832 M1020 880 L1100 870 M1400 860 L1480 868 M1600 852 L1680 846" stroke="#2a0f2a" stroke-width="5" stroke-linecap="round" opacity="0.5" />
    <path d="M1380 830 L1420 846 L1404 870 L1450 884 M1560 900 L1600 890 L1620 910 M1000 900 L1040 912 L1030 930" stroke="#ff7a2f" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" />
    <path d="M940 806 Q1040 790 1140 802" stroke="#a06a8a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />

    <g v-for="(v, i) in VENTS" :key="`vt${i}`" :transform="`translate(${v.x} ${v.y})`">
      <ellipse cx="0" cy="4" rx="60" ry="9" fill="#120612" opacity="0.35" />
      <path d="M-22 -40 Q-30 -54 -14 -58 Q-10 -72 4 -68 Q18 -74 22 -58 Q34 -52 24 -40 Z" fill="#ffe6dc" opacity="0.45" class="smoke" :style="{ animationDelay: `-${v.d}s` }" />
      <path d="M-52 0 Q-26 -34 -14 -40 L14 -40 Q26 -34 52 0 Z" fill="#5a3456" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <ellipse cx="0" cy="-40" rx="14" ry="4" fill="#ffb02e" />
      <path d="M-30 -14 Q-20 -28 -12 -32" stroke="#9a6a8a" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(300 718)">
      <ellipse cx="0" cy="6" rx="70" ry="10" fill="#0f2a14" opacity="0.4" />
      <g fill="#2ed47a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
        <path d="M0 -226 Q-60 -280 -70 -250 Q-40 -236 0 -226 Z" />
        <path d="M0 -226 Q60 -280 70 -250 Q40 -236 0 -226 Z" />
        <path d="M0 -226 Q-30 -300 -14 -310 Q0 -270 0 -226 Z" fill="#ffd23f" />
        <path d="M0 -226 Q30 -300 14 -310 Q0 -270 0 -226 Z" fill="#ff7a2f" />
      </g>
      <g stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
        <rect x="-36" y="-80" width="72" height="80" rx="8" fill="#2ec9b0" />
        <path d="M-40 -160 H40 V-80 H-40 Z" fill="#ff9a3a" />
        <rect x="-34" y="-230" width="68" height="70" rx="10" fill="#e8484a" />
      </g>
      <path d="M-40 -150 L-62 -130 L-40 -110 Z M40 -150 L62 -130 L40 -110 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <g fill="#fffaf0" stroke="#1b1033" stroke-width="3">
        <ellipse cx="-14" cy="-206" rx="9" ry="11" />
        <ellipse cx="14" cy="-206" rx="9" ry="11" />
        <ellipse cx="-16" cy="-130" rx="11" ry="9" />
        <ellipse cx="16" cy="-130" rx="11" ry="9" />
        <circle cx="-14" cy="-56" r="10" />
        <circle cx="14" cy="-56" r="10" />
      </g>
      <g fill="#1b1033">
        <circle cx="-12" cy="-204" r="4.5" />
        <circle cx="16" cy="-204" r="4.5" />
        <circle cx="-14" cy="-128" r="4.5" />
        <circle cx="18" cy="-128" r="4.5" />
        <circle cx="-12" cy="-54" r="4.5" />
        <circle cx="16" cy="-54" r="4.5" />
      </g>
      <path d="M-14 -184 Q0 -172 14 -184" stroke="#1b1033" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-20 -108 Q0 -92 20 -108 Z" fill="#7a1a2a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M-6 -102 Q0 -88 8 -100" fill="#ff7a9a" stroke="#1b1033" stroke-width="2.5" />
      <path d="M-22 -30 Q0 -12 22 -30 Q0 -22 -22 -30 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M-28 -222 Q-20 -228 -8 -228 M-34 -150 Q-24 -156 -10 -156 M-30 -72 Q-20 -78 -6 -78" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
      <path d="M-36 -160 H36 M-36 -80 H36" stroke="#1b1033" stroke-width="3" opacity="0.5" />
    </g>

    <g>
      <path d="M512 780 V710 M928 800 V734" stroke="#1b1033" stroke-width="18" stroke-linecap="round" />
      <path d="M512 780 V710 M928 800 V734" stroke="url(#volcano-wood)" stroke-width="10" stroke-linecap="round" />
      <path :d="HANGERS" stroke="#c9a070" stroke-width="3" />
      <path :d="DECK" stroke="#1b1033" stroke-width="20" fill="none" stroke-linecap="round" />
      <path :d="DECK" stroke="#c48a52" stroke-width="13" fill="none" stroke-linecap="round" />
      <path :d="DECK" stroke="#5e3018" stroke-width="13" fill="none" stroke-dasharray="3 15" />
      <path :d="ROPE" stroke="#1b1033" stroke-width="8" fill="none" stroke-linecap="round" />
      <path :d="ROPE" stroke="#e2bc86" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <g v-for="(p, i) in PALMS" :key="`pm${i}`" :transform="`translate(${p.x} ${p.y}) scale(${p.flip * p.k} ${p.k})`">
      <ellipse cx="0" cy="6" rx="80" ry="12" fill="#0f1a10" opacity="0.35" />
      <g class="volcano-sway" :style="{ animationDelay: `-${p.d}s` }">
        <path d="M0 0 Q36 -200 0 -400" stroke="#1b1033" stroke-width="38" fill="none" stroke-linecap="round" />
        <path d="M0 0 Q36 -200 0 -400" stroke="#a8683a" stroke-width="26" fill="none" stroke-linecap="round" />
        <path d="M0 0 Q36 -200 0 -400" stroke="#6e3f22" stroke-width="26" fill="none" stroke-dasharray="6 28" />
        <path d="M8 -12 Q40 -200 10 -390" stroke="#e0a06a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
        <g transform="translate(0 -400)">
          <g fill="#2fae5c" stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
            <path d="M0 0 Q-130 -40 -220 60 Q-110 0 0 0 Z" />
            <path d="M0 0 Q130 -50 230 40 Q110 0 0 0 Z" />
            <path d="M0 0 Q-40 -120 -130 -150 Q-30 -70 0 0 Z" />
            <path d="M0 0 Q70 -110 170 -120 Q60 -60 0 0 Z" />
            <path d="M0 0 Q-90 30 -130 120 Q-60 40 0 0 Z" fill="#228a48" />
          </g>
          <path d="M-6 -4 Q-110 -20 -200 46 M6 -6 Q110 -30 210 30 M-4 -8 Q-40 -100 -118 -138 M4 -8 Q60 -90 156 -112" stroke="#8ae8a8" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
          <path d="M-60 -10 Q-100 -14 -150 10 M60 -14 Q110 -20 160 4" stroke="#ff9a5a" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6" />
          <circle cx="-12" cy="10" r="13" fill="#7a4a2a" stroke="#1b1033" stroke-width="4" />
          <circle cx="12" cy="14" r="13" fill="#7a4a2a" stroke="#1b1033" stroke-width="4" />
        </g>
      </g>
    </g>

    <path d="M-60 950 Q400 910 900 936 Q1300 956 1990 930 L1990 1140 L-60 1140 Z" fill="url(#volcano-front)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(20, 940, 1240, 0.016)" stroke="#14492c" stroke-width="5" fill="none" stroke-linecap="round" />
    <path :d="tufts(20, 760, 520, 0.02)" stroke="#1d6a3e" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <path d="M200 950 h50 M760 944 h60 M1000 958 h40 M1160 952 h50" stroke="#5ab07a" stroke-width="5" stroke-linecap="round" opacity="0.7" />
    <g fill="#5a3456" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path d="M620 990 Q640 950 690 952 Q730 960 724 994 Z" />
      <path d="M880 1000 Q900 972 930 976 Q950 986 944 1004 Z" />
      <path d="M320 1010 Q330 980 370 978 Q400 990 396 1014 Z" />
    </g>
    <path d="M640 968 Q660 958 680 958 M334 990 Q348 982 364 982" stroke="#a06a8a" stroke-width="4" fill="none" stroke-linecap="round" />

    <g v-for="(c, i) in COLUMNS" :key="`col${i}`">
      <path :d="`M${c.x} 1150 V${c.top} L${c.x + c.w * 0.25} ${c.top - 12} H${c.x + c.w * 0.75} L${c.x + c.w} ${c.top} V1150 Z`" fill="#4a3456" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path :d="`M${c.x} ${c.top} L${c.x + c.w * 0.25} ${c.top + 10} H${c.x + c.w * 0.75} L${c.x + c.w} ${c.top}`" stroke="#1b1033" stroke-width="3" fill="none" />
      <path :d="`M${c.x + c.w * 0.25} ${c.top + 10} V1150`" stroke="#2a1a34" stroke-width="3" opacity="0.6" />
      <path :d="`M${c.x + 8} ${c.top + 22} V${c.top + 70}`" stroke="#ff9a5a" stroke-width="4" stroke-linecap="round" opacity="0.6" />
    </g>

    <ellipse cx="1720" cy="1020" rx="380" ry="140" fill="url(#volcano-halo)" />
    <path d="M1440 1160 Q1440 1010 1600 990 Q1800 966 1990 996 L1990 1160 Z" fill="url(#volcano-lava)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
    <g fill="#5a1a1e" stroke="#3a0e14" stroke-width="3" stroke-linejoin="round" opacity="0.85">
      <path d="M1520 1066 Q1540 1040 1586 1044 Q1626 1060 1608 1080 Q1570 1096 1530 1084 Z" />
      <path d="M1700 1016 Q1730 1000 1776 1006 Q1796 1022 1770 1034 Q1724 1040 1704 1030 Z" />
      <path d="M1846 1086 Q1880 1064 1924 1072 Q1946 1096 1910 1110 Q1866 1114 1850 1102 Z" />
    </g>
    <path d="M1500 1010 Q1600 990 1700 986 M1620 1110 Q1700 1100 1760 1104" stroke="#fff6c8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <circle v-for="(b, i) in LAKE_BUBBLES" :key="`lb${i}`" :cx="b.x" :cy="b.y" :r="b.r" fill="#ffd36b" stroke="#c42a1a" stroke-width="3" class="volcano-pop" :style="{ animationDelay: `-${b.d}s` }" />
    <g fill="#2a1630" stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
      <path d="M1420 1150 Q1410 1040 1480 1020 Q1530 1030 1520 1090 Q1560 1110 1540 1150 Z" />
      <path d="M1880 1000 Q1900 960 1950 962 Q1996 970 1990 1010 Z" />
    </g>
    <path d="M1440 1060 Q1450 1036 1474 1030" stroke="#ff9a5a" stroke-width="4" fill="none" stroke-linecap="round" />

    <g v-for="(f, i) in FERNS" :key="`fe${i}`" :transform="`translate(${f.x} ${f.y}) scale(${f.k})`">
      <path v-for="a in FERN_ANGLES" :key="a" d="M0 0 Q-40 -60 0 -120 Q40 -60 0 0 Z" :transform="`rotate(${a})`" :fill="a % 64 === 0 ? f.c : '#3fc070'" stroke="#1b1033" stroke-width="4" />
      <path v-for="a in FERN_ANGLES" :key="`m${a}`" d="M0 -6 Q-4 -60 0 -110" :transform="`rotate(${a})`" stroke="#8ae8a8" stroke-width="2.5" fill="none" opacity="0.7" />
    </g>

    <g fill="#12301e" stroke="#081a10" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-30 920 140 850 Q70 980 110 1140 Z" />
      <path d="M-60 1140 Q60 990 280 990 Q160 1050 180 1140 Z" />
    </g>

    <g v-for="(sheet, i) in EMBER_SHEETS" :key="`em${i}`" class="volcano-embers" :style="{ animationDuration: `${sheet.s}s` }">
      <template v-for="(e, j) in sheet.embers" :key="j">
        <circle :cx="e.x" :cy="e.y" :r="e.r" :fill="e.c" />
        <circle :cx="e.x - 40" :cy="e.y + 1080" :r="e.r" :fill="e.c" />
      </template>
    </g>
  </g>
</template>

<style scoped>
.volcano-smoke {
  transform-box: fill-box;
  transform-origin: center;
  animation: volcano-smoke 9s ease-out infinite;
}

.volcano-pulse {
  animation: volcano-pulse 2.8s ease-in-out infinite alternate;
}

.volcano-sway {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: volcano-sway 5s ease-in-out infinite alternate;
}

.volcano-pop {
  transform-box: fill-box;
  transform-origin: center;
  animation: volcano-pop 2.4s ease-out infinite;
}

.volcano-embers {
  animation: volcano-embers linear infinite;
}

@keyframes volcano-smoke {
  from {
    translate: 0 0;
    scale: 0.5;
    opacity: 0.9;
  }
  to {
    translate: 90px -330px;
    scale: 2.6;
    opacity: 0;
  }
}

@keyframes volcano-pulse {
  from {
    opacity: 0.45;
  }
  to {
    opacity: 1;
  }
}

@keyframes volcano-sway {
  from {
    rotate: -2.5deg;
  }
  to {
    rotate: 2.5deg;
  }
}

@keyframes volcano-pop {
  0% {
    scale: 0.3;
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    scale: 1.3;
    opacity: 0;
  }
}

@keyframes volcano-embers {
  from {
    translate: 0 0;
  }
  to {
    translate: 40px -1080px;
  }
}
</style>
