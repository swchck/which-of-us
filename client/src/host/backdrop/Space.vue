<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(288);
const STARS = Array.from({ length: 120 }, () => ({
  x: rnd() * 1920,
  y: rnd() * 900,
  r: 0.8 + rnd() * 2.4,
}));
const SKY = twinkleGroups(STARS);
const DIM = Array.from({ length: 90 }, () => `M${(rnd() * 1920).toFixed(0)} ${(rnd() * 900).toFixed(0)} h0.1`).join(' ');

const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} Q${x + r * 0.16} ${y - r * 0.16} ${x + r} ${y} Q${x + r * 0.16} ${y + r * 0.16} ${x} ${y + r} Q${x - r * 0.16} ${y + r * 0.16} ${x - r} ${y} Q${x - r * 0.16} ${y - r * 0.16} ${x} ${y - r} Z`;
const SPARKS = [
  { x: 140, y: 120, r: 14 },
  { x: 560, y: 520, r: 10 },
  { x: 880, y: 90, r: 12 },
  { x: 1240, y: 330, r: 16 },
  { x: 1820, y: 520, r: 12 },
  { x: 1060, y: 640, r: 9 },
  { x: 420, y: 330, r: 9 },
  { x: 1500, y: 80, r: 10 },
];
const SPARK_GROUPS = [0, 1].map((g) => SPARKS.filter((_, i) => i % 2 === g).map((p) => star(p.x, p.y, p.r)).join(' '));

const CRATERS = [
  { x: 720, y: 968, rx: 96, ry: 20 },
  { x: 1220, y: 1020, rx: 130, ry: 26 },
  { x: 470, y: 1070, rx: 64, ry: 14 },
  { x: 1560, y: 958, rx: 54, ry: 12 },
  { x: 980, y: 930, rx: 40, ry: 8 },
];
const ROCKS = [
  { x: 560, y: 940, s: 1 },
  { x: 1010, y: 1080, s: 1.3 },
  { x: 1380, y: 948, s: 0.8 },
];
const CRYSTALS = [
  { x: 300, y: 980, s: 1, c: '#22d3ee', l: '#c9f8ff', d: '#1593ad', g: 'teal' },
  { x: 1690, y: 940, s: 1.15, c: '#ff6ac1', l: '#ffd0ea', d: '#c22a8a', g: 'pink' },
];
const SHARDS = [
  { a: -24, h: 90, w: 22 },
  { a: 0, h: 130, w: 28 },
  { a: 26, h: 80, w: 20 },
];
</script>

<template>
  <g>
    <defs>
      <radialGradient id="space-sky" cx="65%" cy="25%" r="90%">
        <stop offset="0%" stop-color="#3a1a7a" />
        <stop offset="55%" stop-color="#140a3a" />
        <stop offset="100%" stop-color="#06031a" />
      </radialGradient>
      <radialGradient id="space-neb-pink">
        <stop offset="0%" stop-color="#ff4fa8" stop-opacity="0.32" />
        <stop offset="100%" stop-color="#ff4fa8" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="space-neb-teal">
        <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.24" />
        <stop offset="100%" stop-color="#22d3ee" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="space-planet" cx="35%" cy="32%" r="75%">
        <stop offset="0%" stop-color="#ffc4e4" />
        <stop offset="50%" stop-color="#e65aa6" />
        <stop offset="100%" stop-color="#8a1f6a" />
      </radialGradient>
      <radialGradient id="space-pale" cx="35%" cy="32%" r="75%">
        <stop offset="0%" stop-color="#d8cdf6" />
        <stop offset="100%" stop-color="#8e80c8" />
      </radialGradient>
      <radialGradient id="space-earth" cx="40%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#8fe0ff" />
        <stop offset="55%" stop-color="#3a8ad8" />
        <stop offset="100%" stop-color="#22408e" />
      </radialGradient>
      <linearGradient id="space-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a99ad6" />
        <stop offset="40%" stop-color="#6e5ea6" />
        <stop offset="100%" stop-color="#3a2c66" />
      </linearGradient>
      <linearGradient id="space-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c9b8ff" stop-opacity="0" />
        <stop offset="70%" stop-color="#c9b8ff" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#c9b8ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="space-tail" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stop-color="#c9f8ff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#22d3ee" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="space-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9ff3ff" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#9ff3ff" stop-opacity="0.05" />
      </linearGradient>
      <linearGradient id="space-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e4e8ff" />
        <stop offset="100%" stop-color="#7a84c4" />
      </linearGradient>
      <linearGradient id="space-visor" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5ae6ff" />
        <stop offset="100%" stop-color="#3a2a8a" />
      </linearGradient>
      <clipPath id="space-planet-clip"><circle cx="1640" cy="250" r="150" /></clipPath>
      <clipPath id="space-earth-clip"><circle cx="330" cy="930" r="300" /></clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#space-sky)" />
    <ellipse cx="620" cy="320" rx="640" ry="250" transform="rotate(-14 620 320)" fill="url(#space-neb-pink)" />
    <ellipse cx="1320" cy="520" rx="560" ry="230" transform="rotate(10 1320 520)" fill="url(#space-neb-teal)" />
    <ellipse cx="300" cy="120" rx="360" ry="160" fill="url(#space-neb-teal)" />
    <path :d="DIM" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.4" />
    <g v-for="(g, gi) in SKY" :key="gi" class="twinkle" :style="{ animationDelay: `${gi * 0.75}s` }"><circle v-for="(s, i) in g" :key="i" :cx="s.x" :cy="s.y" :r="s.r" fill="#fff" /></g>
    <path v-for="(d, i) in SPARK_GROUPS" :key="`sk${i}`" :d="d" fill="#fff" class="twinkle" :style="{ animationDelay: `-${i * 1.5}s` }" />

    <g>
      <circle cx="380" cy="190" r="66" fill="url(#space-pale)" stroke="#b8a8e8" stroke-width="3" />
      <path d="M318 170 Q380 186 444 168 M320 210 Q380 222 442 206" stroke="#7a6ab8" stroke-width="6" fill="none" opacity="0.5" />
      <path d="M340 150 Q352 136 372 132" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
    </g>
    <circle cx="1130" cy="130" r="22" fill="#c9bff0" stroke="#9a8ad0" stroke-width="3" />
    <circle cx="1124" cy="126" r="5" fill="#9a8ad0" />

    <path d="M680 360 Q790 270 930 210 Q800 300 694 378 Z" fill="url(#space-tail)" />
    <path d="M676 352 L860 250 M690 372 L900 268" stroke="#c9f8ff" stroke-width="3" stroke-linecap="round" opacity="0.4" />
    <circle cx="684" cy="370" r="15" fill="#e8fdff" stroke="#1b1033" stroke-width="4" />

    <g class="space-float">
      <path d="M1393 330 A260 50 -18 0 1 1887 170" stroke="#1b1033" stroke-width="26" fill="none" stroke-linecap="round" />
      <path d="M1393 330 A260 50 -18 0 1 1887 170" stroke="#ffd23f" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M1410 322 A240 42 -18 0 1 1870 176" stroke="#ff9a3d" stroke-width="4" fill="none" />
      <circle cx="1640" cy="250" r="150" fill="url(#space-planet)" />
      <g clip-path="url(#space-planet-clip)">
        <path d="M1480 200 Q1560 220 1640 196 Q1720 172 1800 196 L1800 230 Q1720 206 1640 230 Q1560 254 1480 232 Z" fill="#c2307a" opacity="0.45" />
        <path d="M1480 290 Q1560 310 1640 288 Q1720 266 1800 290 L1800 310 Q1720 288 1640 308 Q1560 330 1480 310 Z" fill="#ffd0ea" opacity="0.35" />
        <ellipse cx="1690" cy="300" rx="34" ry="16" fill="#8a1f6a" opacity="0.5" />
        <path d="M1490 100 L1800 100 L1800 420 L1490 420 Z M1620 236 m-160 0 a160 160 0 1 0 320 0 a160 160 0 1 0 -320 0 Z" fill="#1b1033" opacity="0.3" fill-rule="evenodd" />
      </g>
      <circle cx="1640" cy="250" r="150" fill="none" stroke="#1b1033" stroke-width="6" />
      <path d="M1550 160 Q1580 124 1630 114" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.75" />
      <path d="M1393 330 A260 50 -18 0 0 1887 170" stroke="#1b1033" stroke-width="26" fill="none" stroke-linecap="round" />
      <path d="M1393 330 A260 50 -18 0 0 1887 170" stroke="#ffd23f" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M1410 322 A240 42 -18 0 0 1870 176" stroke="#ff9a3d" stroke-width="4" fill="none" />
    </g>

    <g class="space-sat">
      <g transform="rotate(-12)">
        <rect x="-70" y="-14" width="44" height="28" fill="#3a6ad8" stroke="#1b1033" stroke-width="4" />
        <rect x="26" y="-14" width="44" height="28" fill="#3a6ad8" stroke="#1b1033" stroke-width="4" />
        <path d="M-48 -14 V14 M48 -14 V14 M-70 0 H-26 M26 0 H70" stroke="#9ad0ff" stroke-width="2" />
        <path d="M-26 0 H26" stroke="#1b1033" stroke-width="4" />
        <rect x="-16" y="-20" width="32" height="40" rx="6" fill="#ffd23f" stroke="#1b1033" stroke-width="4" />
        <path d="M0 -20 L0 -34 M-10 -42 Q0 -30 10 -42" stroke="#1b1033" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <circle cx="330" cy="930" r="300" fill="url(#space-earth)" />
    <g clip-path="url(#space-earth-clip)">
      <path d="M120 760 Q180 700 260 730 Q300 780 250 820 Q200 850 210 900 Q150 900 120 840 Z M380 690 Q470 660 520 720 Q500 780 440 770 Q400 740 380 690 Z M360 860 Q440 820 520 870 Q560 940 480 980 Q400 960 360 860 Z" fill="#4ac08a" opacity="0.85" />
      <path d="M160 700 Q260 680 340 700 M420 800 Q500 790 560 810" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.5" fill="none" />
      <path d="M0 600 L700 600 L700 1240 L0 1240 Z M300 900 m-310 0 a310 310 0 1 0 620 0 a310 310 0 1 0 -620 0 Z" fill="#1b1033" opacity="0.28" fill-rule="evenodd" />
    </g>
    <circle cx="330" cy="930" r="300" fill="none" stroke="#9ff3ff" stroke-width="14" opacity="0.25" />
    <circle cx="330" cy="930" r="300" fill="none" stroke="#7aa8e8" stroke-width="3" />

    <path d="M-60 880 L120 846 L260 868 L420 828 L600 860 L820 836 L1040 862 L1240 832 L1420 858 L1620 826 L1800 852 L1980 836 L1980 1000 L-60 1000 Z" fill="#5a4a8e" stroke="#8a7ac0" stroke-width="3" stroke-linejoin="round" />
    <path d="M200 862 L240 858 M700 850 L740 846 M1300 846 L1350 850 M1700 842 L1740 846" stroke="#4a3a7a" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    <rect x="-60" y="780" width="2040" height="150" fill="url(#space-haze)" />

    <path d="M-60 940 Q500 870 960 880 Q1440 890 1980 930 L1980 1200 L-60 1200 Z" fill="url(#space-ground)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <g v-for="(c, i) in CRATERS" :key="`cr${i}`">
      <ellipse :cx="c.x" :cy="c.y" :rx="c.rx" :ry="c.ry" fill="#4a3a7e" stroke="#1b1033" stroke-width="4" />
      <path :d="`M${c.x - c.rx * 0.8} ${c.y + c.ry * 0.2} Q${c.x} ${c.y + c.ry * 1.3} ${c.x + c.rx * 0.8} ${c.y + c.ry * 0.2}`" stroke="#cfc4f4" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      <path :d="`M${c.x - c.rx * 0.6} ${c.y - c.ry * 0.3} Q${c.x} ${c.y - c.ry * 0.9} ${c.x + c.rx * 0.6} ${c.y - c.ry * 0.3}`" stroke="#2a1e4e" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5" />
    </g>
    <path d="M300 930 h0.1 M380 1000 h0.1 M860 1000 h0.1 M900 1110 h0.1 M1100 940 h0.1 M1460 1060 h0.1 M1500 1000 h0.1 M640 1120 h0.1 M1780 1060 h0.1 M200 1120 h0.1" stroke="#3a2c66" stroke-width="10" stroke-linecap="round" opacity="0.5" />
    <g v-for="(r, i) in ROCKS" :key="`rk${i}`" :transform="`translate(${r.x} ${r.y}) scale(${r.s})`">
      <ellipse cx="0" cy="6" rx="46" ry="8" fill="#1b1033" opacity="0.3" />
      <path d="M-40 6 Q-44 -20 -16 -30 Q10 -42 30 -22 Q46 -6 40 6 Z" fill="#8a7abe" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)" />
    </g>

    <g transform="translate(600 922)">
      <path d="M0 0 L0 -110" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
      <path d="M0 0 L0 -110" stroke="#e4e8ff" stroke-width="4" stroke-linecap="round" />
      <path d="M2 -108 Q36 -116 66 -104 Q50 -90 66 -74 Q36 -84 2 -76 Z" fill="#ff4f8b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path :d="star(30, -91, 9)" fill="#fff6c8" />
    </g>
    <g class="space-glow">
      <ellipse v-for="(c, i) in CRYSTALS" :key="`cg${i}`" :cx="c.x" :cy="c.y - 50 * c.s" :rx="110 * c.s" :ry="90 * c.s" :fill="`url(#space-neb-${c.g})`" />
    </g>
    <g v-for="(c, i) in CRYSTALS" :key="`cy${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.s})`">
      <ellipse cx="0" cy="6" rx="70" ry="10" fill="#1b1033" opacity="0.35" />
      <g v-for="(s, j) in SHARDS" :key="j" :transform="`rotate(${s.a})`">
        <path :d="`M${-s.w} 0 L${-s.w} ${-s.h * 0.7} L0 ${-s.h} L${s.w} ${-s.h * 0.7} L${s.w} 0 Z`" :fill="c.c" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path :d="`M0 0 L0 ${-s.h} L${s.w} ${-s.h * 0.7} L${s.w} 0 Z`" :fill="c.d" opacity="0.7" />
        <path :d="`M${-s.w * 0.55} -8 L${-s.w * 0.55} ${-s.h * 0.66}`" :stroke="c.l" stroke-width="5" stroke-linecap="round" />
      </g>
    </g>

    <g class="space-ufo">
      <path d="M1450 712 L1550 712 L1620 920 L1380 920 Z" fill="url(#space-beam)" />
      <ellipse cx="1500" cy="924" rx="120" ry="16" fill="#9ff3ff" opacity="0.3" />
      <path d="M1486 836 Q1480 812 1500 806 Q1522 806 1518 832 Z" fill="#8a7abe" stroke="#1b1033" stroke-width="3" class="space-lift" />
      <path d="M1440 676 Q1442 610 1500 606 Q1558 610 1560 676 Z" fill="#9ff3ff" fill-opacity="0.75" stroke="#1b1033" stroke-width="5" />
      <circle cx="1500" cy="652" r="22" fill="#5ae68a" stroke="#1b1033" stroke-width="4" />
      <circle cx="1500" cy="648" r="10" fill="#fff" stroke="#1b1033" stroke-width="3" />
      <circle cx="1502" cy="649" r="4.5" fill="#1b1033" />
      <path d="M1500 630 L1500 616" stroke="#1b1033" stroke-width="3" stroke-linecap="round" />
      <circle cx="1500" cy="614" r="4" fill="#ff4f8b" />
      <path d="M1462 650 Q1466 626 1486 618" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
      <ellipse cx="1500" cy="690" rx="120" ry="34" fill="url(#space-metal)" stroke="#1b1033" stroke-width="6" />
      <path d="M1388 686 Q1500 712 1612 686" stroke="#5a5f9e" stroke-width="4" fill="none" />
      <path d="M1420 676 Q1460 664 1500 664" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9" />
      <circle cx="1424" cy="694" r="7" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
      <circle cx="1462" cy="702" r="7" fill="#ff4f8b" stroke="#1b1033" stroke-width="3" />
      <circle cx="1500" cy="705" r="7" fill="#2ed47a" stroke="#1b1033" stroke-width="3" />
      <circle cx="1538" cy="702" r="7" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
      <circle cx="1576" cy="694" r="7" fill="#ff4f8b" stroke="#1b1033" stroke-width="3" />
    </g>

    <g class="space-astro">
      <g transform="translate(240 470) rotate(-14)">
        <path d="M-30 10 Q-74 0 -80 -40" stroke="#1b1033" stroke-width="28" fill="none" stroke-linecap="round" />
        <path d="M-30 10 Q-74 0 -80 -40" stroke="#f4f0ff" stroke-width="18" fill="none" stroke-linecap="round" />
        <path d="M30 14 Q66 30 64 70" stroke="#1b1033" stroke-width="28" fill="none" stroke-linecap="round" />
        <path d="M30 14 Q66 30 64 70" stroke="#f4f0ff" stroke-width="18" fill="none" stroke-linecap="round" />
        <rect x="-44" y="-34" width="88" height="86" rx="16" fill="#b8b0e0" stroke="#1b1033" stroke-width="5" />
        <rect x="-30" y="48" width="26" height="48" rx="11" fill="#f4f0ff" stroke="#1b1033" stroke-width="5" />
        <rect x="6" y="48" width="26" height="48" rx="11" fill="#f4f0ff" stroke="#1b1033" stroke-width="5" />
        <path d="M-30 82 H-4 M6 82 H32" stroke="#ff7a2f" stroke-width="8" />
        <rect x="-36" y="-14" width="72" height="72" rx="26" fill="#f4f0ff" stroke="#1b1033" stroke-width="5" />
        <rect x="-16" y="10" width="32" height="20" rx="4" fill="#c9c3e6" stroke="#1b1033" stroke-width="3" />
        <circle cx="-6" cy="20" r="3.5" fill="#ff4f8b" />
        <circle cx="6" cy="20" r="3.5" fill="#22d3ee" />
        <path d="M24 0 Q30 20 26 44" stroke="#c9c3e6" stroke-width="6" fill="none" stroke-linecap="round" />
        <circle cx="0" cy="-46" r="44" fill="#f4f0ff" stroke="#1b1033" stroke-width="5" />
        <ellipse cx="6" cy="-44" rx="31" ry="25" fill="url(#space-visor)" stroke="#1b1033" stroke-width="4" />
        <path d="M-14 -56 Q-6 -66 8 -66" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
        <circle cx="22" cy="-34" r="3.5" fill="#fff" />
        <path d="M-36 -70 Q-24 -88 -4 -90" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
      </g>
    </g>

    <line x1="0" y1="0" x2="160" y2="70" stroke="#fff" stroke-width="4" stroke-linecap="round" class="shooting" />
    <g class="rocket">
      <g transform="rotate(60)">
        <path d="M-10 32 Q0 92 10 32 Z" fill="#ff7a2f" class="flame" />
        <path d="M-6 32 Q0 66 6 32 Z" fill="#ffe14d" class="flame" />
        <path d="M-18 14 L-36 44 L-18 36 Z M18 14 L36 44 L18 36 Z" fill="#ff4f8b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M0 -56 Q24 -24 20 34 L-20 34 Q-24 -24 0 -56 Z" fill="url(#space-metal)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M0 -56 Q14 -40 18 -26 L-18 -26 Q-14 -40 0 -56 Z" fill="#ff4f8b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <circle cx="0" cy="-2" r="10" fill="#22d3ee" stroke="#1b1033" stroke-width="4" />
        <path d="M-4 -6 Q-2 -9 2 -9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g fill="#1d1438" stroke="#0b0618" stroke-width="6" stroke-linejoin="round">
      <path d="M-60 1200 Q-50 990 90 960 Q200 950 230 1020 Q300 1040 300 1110 Q310 1160 290 1200 Z" />
      <path d="M1980 1200 Q1980 1000 1860 980 Q1760 970 1730 1040 Q1660 1060 1660 1130 Q1650 1170 1670 1200 Z" />
    </g>
    <path d="M40 990 Q90 964 150 966 M1800 1000 Q1850 990 1900 1004" stroke="#6a5ab0" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7" />
    <g fill="#120a26">
      <circle cx="160" cy="1060" r="16" />
      <circle cx="1780" cy="1080" r="12" />
    </g>
  </g>
</template>

<style scoped>
.space-float {
  animation: space-float 8s ease-in-out infinite alternate;
}

.space-ufo {
  animation: space-hover 4s ease-in-out infinite alternate;
}

.space-lift {
  animation: space-lift 2.6s ease-in-out infinite alternate;
}

.space-astro {
  transform-origin: 240px 470px;
  animation: space-astro 9s ease-in-out infinite alternate;
}

.space-glow {
  animation: space-glow 2.2s ease-in-out infinite alternate;
}

.space-sat {
  animation: space-sat 70s linear infinite;
}

@keyframes space-float {
  to {
    translate: 0 18px;
  }
}

@keyframes space-hover {
  from {
    translate: 0 0;
    rotate: 0deg;
  }
  to {
    translate: -60px -24px;
    rotate: -2deg;
  }
}

@keyframes space-lift {
  to {
    translate: 0 -40px;
  }
}

@keyframes space-astro {
  from {
    translate: 0 0;
    rotate: -6deg;
  }
  to {
    translate: 30px -40px;
    rotate: 8deg;
  }
}

@keyframes space-glow {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}

@keyframes space-sat {
  from {
    transform: translate(-160px, 150px) rotate(0deg);
  }
  to {
    transform: translate(2080px, 60px) rotate(40deg);
  }
}
</style>
