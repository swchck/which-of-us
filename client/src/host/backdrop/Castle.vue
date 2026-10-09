<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(237);
const STARS = Array.from({ length: 80 }, () => ({
  x: rnd() * 1920,
  y: rnd() * 520,
  r: 0.8 + rnd() * 2.2,
}));
const STAR_GROUPS = [0, 1].map((g) => STARS.filter((_, i) => i % 2 === g));
const CLOUDS = [
  { y: 150, k: 1, d: 10, s: 70 },
  { y: 250, k: 0.7, d: 46, s: 90 },
];
// each flock carries two wing poses and blinks between them: three animated nodes instead of one per bat
const FLOCKS = [
  { y: 300, k: 0.9, d: 3, s: 19, bats: [{ x: 0, y: 0 }, { x: 70, y: -40 }, { x: 130, y: 10 }] },
  { y: 130, k: 0.6, d: 13, s: 27, bats: [{ x: 0, y: 0 }, { x: 90, y: 30 }] },
];
const WINDOWS = [
  { x: 1295, y: 430, h: 46 },
  { x: 1295, y: 540, h: 46 },
  { x: 1650, y: 380, h: 50 },
  { x: 1650, y: 500, h: 50 },
  { x: 1470, y: 410, h: 40 },
  { x: 1390, y: 560, h: 40 },
  { x: 1550, y: 560, h: 40 },
];
const CRENELS = [1340, 1384, 1530, 1574];
const FAR_TREES = [90, 160, 470, 540, 880, 1040, 1110];
const GRAVES = [
  { x: 470, y: 900, s: 1, r: -6, kind: 'round' },
  { x: 640, y: 915, s: 0.8, r: 5, kind: 'cross' },
  { x: 1230, y: 905, s: 0.85, r: 4, kind: 'round' },
];
const FENCE = Array.from({ length: 9 }, (_, i) => ({ x: 1560 + i * 52, r: Math.round((rnd() - 0.5) * 8) }));
const PUMPKINS = [
  { x: 570, y: 950, s: 1 },
  { x: 1300, y: 955, s: 0.8 },
];
</script>

<template>
  <g>
    <defs>
      <radialGradient id="castle-moon" cx="38%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#fffbe6" />
        <stop offset="100%" stop-color="#f2d98c" />
      </radialGradient>
      <linearGradient id="castle-stone" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#7a66b4" />
        <stop offset="100%" stop-color="#3e2d6e" />
      </linearGradient>
      <linearGradient id="castle-roof" x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0%" stop-color="#a15ad0" />
        <stop offset="100%" stop-color="#47206e" />
      </linearGradient>
      <linearGradient id="castle-mist" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a991e6" stop-opacity="0" />
        <stop offset="60%" stop-color="#a991e6" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#a991e6" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="castle-hill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4e4685" />
        <stop offset="60%" stop-color="#2d2456" />
      </linearGradient>
      <linearGradient id="castle-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3f5584" />
        <stop offset="70%" stop-color="#232a52" />
      </linearGradient>
      <linearGradient id="castle-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1f2246" />
        <stop offset="100%" stop-color="#0e0c22" />
      </linearGradient>
      <linearGradient id="castle-grave" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0%" stop-color="#b8b2dc" />
        <stop offset="100%" stop-color="#6c6598" />
      </linearGradient>
      <radialGradient id="castle-ghost" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#cfc4ff" />
      </radialGradient>
      <radialGradient id="castle-pumpkin" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffb04a" />
        <stop offset="100%" stop-color="#d9531a" />
      </radialGradient>
      <radialGradient id="castle-halo">
        <stop offset="0%" stop-color="#ffd96b" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffd96b" stop-opacity="0" />
      </radialGradient>
    </defs>

    <g v-for="(g, gi) in STAR_GROUPS" :key="`cs${gi}`" class="twinkle" :style="{ animationDelay: `${gi * 1.5}s` }"><circle v-for="(s, i) in g" :key="i" :cx="s.x" :cy="s.y" :r="s.r" fill="#fff" /></g>

    <circle cx="1480" cy="220" r="300" fill="#fff4c2" opacity="0.07" />
    <circle cx="1480" cy="220" r="200" fill="#fff4c2" opacity="0.12" />
    <circle cx="1480" cy="220" r="125" fill="url(#castle-moon)" stroke="#1b1033" stroke-width="5" />
    <circle cx="1440" cy="190" r="26" fill="#e6c877" opacity="0.7" />
    <circle cx="1530" cy="250" r="18" fill="#e6c877" opacity="0.7" />
    <circle cx="1500" cy="160" r="11" fill="#e6c877" opacity="0.7" />
    <circle cx="1450" cy="280" r="13" fill="#e6c877" opacity="0.6" />
    <path d="M1392 166 Q1410 128 1452 114" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.85" />

    <path d="M640 0 L600 120 L640 124 L590 250 L630 252 L560 380 L670 220 L630 218 L690 110 L650 108 L700 0 Z" fill="#fff8c2" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" class="bolt" />

    <g v-for="(c, i) in CLOUDS" :key="`cc${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-150 20 Q-170 -10 -120 -20 Q-110 -60 -50 -50 Q-20 -90 40 -66 Q90 -80 110 -36 Q170 -36 160 20 Z" fill="#3a2366" stroke="#241446" stroke-width="4" stroke-linejoin="round" opacity="0.9" />
        <path d="M-110 -24 Q-100 -52 -54 -44 M-16 -60 Q30 -82 78 -60" stroke="#7d64b8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>

    <path d="M-60 720 L60 650 Q120 620 200 660 L320 610 Q420 580 520 640 L640 600 Q760 570 880 640 L1000 620 Q1080 600 1160 650 L1980 640 L1980 1140 L-60 1140 Z" fill="#45346f" stroke="#6650a0" stroke-width="3" stroke-linejoin="round" />
    <g fill="#33255a" stroke="#6650a0" stroke-width="3" stroke-linejoin="round">
      <path v-for="x in FAR_TREES" :key="`ft${x}`" :d="`M${x - 22} 680 L${x} 590 L${x + 22} 680 Z`" />
    </g>
    <rect x="-60" y="580" width="2040" height="240" fill="url(#castle-mist)" />

    <g filter="url(#cel)">
      <g stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
        <path :d="`M1340 780 V480 ${CRENELS.map((x) => `H${x} V450 H${x + 26} V480`).join(' ')} H1600 V780 Z`" fill="url(#castle-stone)" />
        <rect x="1420" y="340" width="100" height="160" fill="url(#castle-stone)" />
        <rect x="1250" y="380" width="90" height="400" fill="url(#castle-stone)" />
        <rect x="1600" y="320" width="110" height="460" fill="url(#castle-stone)" />
        <path d="M1405 344 L1470 220 L1535 344 Z" fill="url(#castle-roof)" />
        <path d="M1234 384 L1295 236 L1356 384 Z" fill="url(#castle-roof)" />
        <path d="M1584 324 L1655 170 L1726 324 Z" fill="url(#castle-roof)" />
      </g>
      <path d="M1655 172 L1655 120 L1700 132 L1680 140 L1702 152 L1655 150" fill="#ff4f8b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>
    <g stroke="#2a1d50" stroke-width="3" stroke-linecap="round" opacity="0.55">
      <path d="M1262 470 h26 M1300 500 h28 M1268 620 h30 M1306 660 h24 M1360 520 h34 M1430 610 h30 M1520 520 h30 M1560 640 h26 M1450 390 h24 M1612 440 h30 M1660 600 h34 M1620 700 h26 M1360 690 h30" />
    </g>
    <g stroke="#cf9cf0" stroke-width="3" stroke-linecap="round" opacity="0.45">
      <path d="M1262 360 L1292 290 M1600 310 L1640 230 M1430 330 L1462 262" />
    </g>
    <g class="castle-glow">
      <path v-for="(w, i) in WINDOWS" :key="`cw${i}`" :d="`M${w.x - 14} ${w.y + w.h} V${w.y + 12} Q${w.x} ${w.y - 6} ${w.x + 14} ${w.y + 12} V${w.y + w.h} Z`" fill="#ffd96b" stroke="#1b1033" stroke-width="4" />
    </g>
    <path d="M1440 720 V650 Q1470 610 1500 650 V720 Z" fill="#2a1430" stroke="#1b1033" stroke-width="5" />
    <path d="M1455 712 V660 M1470 712 V646 M1485 712 V660" stroke="#4a2a40" stroke-width="3" />

    <path d="M860 1140 Q960 820 1180 740 Q1300 700 1460 712 Q1680 700 1800 740 Q1900 770 1980 780 L1980 1140 Z" fill="url(#castle-hill)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1470 724 Q1420 770 1500 800 Q1580 830 1460 870" stroke="#8d7cc0" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.5" />
    <path d="M1120 800 L1170 790 M1700 780 L1750 792 M1250 840 L1300 830" stroke="#1c1640" stroke-width="5" stroke-linecap="round" opacity="0.5" />

    <path d="M-60 880 Q420 820 900 860 Q1300 892 1980 850 L1980 1140 L-60 1140 Z" fill="url(#castle-ground)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(30, 866, 1900, 0.014)" stroke="#5a75a8" stroke-width="5" fill="none" stroke-linecap="round" />

    <g v-for="(g, i) in GRAVES" :key="`gr${i}`" :transform="`translate(${g.x} ${g.y}) scale(${g.s})`">
      <ellipse cx="6" cy="6" rx="70" ry="12" fill="#0b0a20" opacity="0.35" />
      <g :transform="`rotate(${g.r})`">
        <path v-if="g.kind === 'round'" d="M-42 4 L-42 -80 Q-42 -124 0 -124 Q42 -124 42 -80 L42 4 Z" fill="url(#castle-grave)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
        <path v-else-if="g.kind === 'cross'" d="M-13 4 V-78 H-42 V-104 H-13 V-136 H13 V-104 H42 V-78 H13 V4 Z" fill="url(#castle-grave)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
        <path v-if="g.kind === 'round'" d="M-14 -96 L-4 -78 L-12 -62 L2 -46" stroke="#4a4478" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M-40 4 Q-30 -16 -14 -6 Q-4 -18 8 -4 L8 4 Z" fill="#4f8a5a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      </g>
    </g>

    <g class="castle-peek">
      <g transform="translate(1400 830) scale(0.6)">
        <path d="M-60 40 L-60 -10 Q-60 -86 0 -86 Q60 -86 60 -10 L60 40 Z" fill="url(#castle-ghost)" stroke="#1b1033" stroke-width="6" />
        <ellipse cx="-20" cy="-24" rx="10" ry="14" fill="#1b1033" />
        <ellipse cx="20" cy="-24" rx="10" ry="14" fill="#1b1033" />
        <circle cx="-23" cy="-29" r="4" fill="#fff" />
        <circle cx="17" cy="-29" r="4" fill="#fff" />
      </g>
    </g>
    <g transform="translate(1400 925) scale(1.05)">
      <path d="M-54 4 L-48 -96 L48 -104 L54 4 Z" fill="url(#castle-grave)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" transform="rotate(-3)" />
      <path d="M-30 -60 H28 M-26 -40 H24" stroke="#4a4478" stroke-width="4" stroke-linecap="round" opacity="0.6" transform="rotate(-3)" />
      <path d="M-14 -96 L-4 -78 L-12 -62 L2 -46" stroke="#4a4478" stroke-width="3" fill="none" stroke-linecap="round" transform="rotate(-3)" />
      <path d="M-40 4 Q-30 -16 -14 -6 Q-4 -18 8 -4 L8 4 Z" fill="#4f8a5a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" transform="rotate(-3)" />
    </g>

    <g v-for="(p, i) in PUMPKINS" :key="`pk${i}`" :transform="`translate(${p.x} ${p.y}) scale(${p.s})`">
      <ellipse cx="0" cy="-30" rx="110" ry="70" fill="url(#castle-halo)" />
      <ellipse cx="4" cy="4" rx="64" ry="10" fill="#0b0a20" opacity="0.35" />
      <path d="M-4 -60 Q-2 -84 12 -92" stroke="#1b1033" stroke-width="14" fill="none" stroke-linecap="round" />
      <path d="M-4 -60 Q-2 -84 12 -92" stroke="#4f8a5a" stroke-width="7" fill="none" stroke-linecap="round" />
      <ellipse cx="-24" cy="-28" rx="32" ry="32" fill="url(#castle-pumpkin)" stroke="#1b1033" stroke-width="5" />
      <ellipse cx="24" cy="-28" rx="32" ry="32" fill="url(#castle-pumpkin)" stroke="#1b1033" stroke-width="5" />
      <ellipse cx="0" cy="-30" rx="28" ry="34" fill="url(#castle-pumpkin)" stroke="#1b1033" stroke-width="5" />
      <path d="M-18 -42 L-6 -42 L-12 -54 Z M6 -42 L18 -42 L12 -54 Z" fill="#ffe14d" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-28 -24 Q0 -2 28 -24 L20 -20 L14 -26 L6 -18 L0 -24 L-6 -18 L-14 -26 L-20 -20 Z" fill="#ffe14d" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-44 -46 Q-50 -36 -48 -24" stroke="#ffd59a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>

    <g transform="translate(230 905)">
      <ellipse cx="20" cy="6" rx="160" ry="18" fill="#0b0a20" opacity="0.35" />
      <g filter="url(#cel)">
        <g stroke="#1b1033" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M0 0 C-15 -100 40 -180 5 -280 C-25 -360 20 -430 70 -480" stroke-width="72" />
          <path d="M60 -480 C120 -540 180 -540 250 -600 M250 -600 C290 -630 310 -620 350 -660" stroke-width="44" />
          <path d="M60 -470 C20 -540 -30 -570 -80 -650 M-80 -650 C-100 -690 -130 -700 -160 -740 M-40 -580 C-80 -590 -120 -570 -170 -590" stroke-width="40" />
          <path d="M15 -300 C90 -340 150 -320 210 -360 M210 -360 C240 -380 250 -410 290 -420" stroke-width="36" />
          <path d="M0 -250 C-60 -280 -120 -260 -190 -300" stroke-width="34" />
          <path d="M0 0 C-30 20 -60 15 -90 30 M10 0 C40 20 70 15 110 30" stroke-width="34" />
        </g>
        <g stroke="#463160" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M0 0 C-15 -100 40 -180 5 -280 C-25 -360 20 -430 70 -480" stroke-width="60" />
          <path d="M60 -480 C120 -540 180 -540 250 -600 M250 -600 C290 -630 310 -620 350 -660" stroke-width="32" />
          <path d="M60 -470 C20 -540 -30 -570 -80 -650 M-80 -650 C-100 -690 -130 -700 -160 -740 M-40 -580 C-80 -590 -120 -570 -170 -590" stroke-width="28" />
          <path d="M15 -300 C90 -340 150 -320 210 -360 M210 -360 C240 -380 250 -410 290 -420" stroke-width="24" />
          <path d="M0 -250 C-60 -280 -120 -260 -190 -300" stroke-width="22" />
          <path d="M0 0 C-30 20 -60 15 -90 30 M10 0 C40 20 70 15 110 30" stroke-width="22" />
        </g>
      </g>
      <path d="M-14 -20 C-26 -100 26 -180 -8 -270 M14 -60 C20 -120 30 -150 20 -200 M-6 -330 C-20 -380 10 -420 40 -450" stroke="#2a1b3e" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      <path d="M-20 -40 C-34 -110 14 -180 -18 -260 M60 -500 C110 -540 170 -550 230 -596" stroke="#7a5f98" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      <ellipse cx="12" cy="-150" rx="16" ry="26" fill="#140a22" stroke="#1b1033" stroke-width="4" />
      <circle cx="6" cy="-154" r="4" fill="#ffd23f" />
      <circle cx="18" cy="-154" r="4" fill="#ffd23f" />
      <g transform="translate(200 -372)">
        <path d="M-26 0 Q-30 -50 0 -54 Q30 -50 26 0 Q0 10 -26 0 Z" fill="#8a6a4a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-24 -40 L-20 -62 L-8 -48 M24 -40 L20 -62 L8 -48" fill="#8a6a4a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-14 -4 Q0 -24 14 -4 Q0 4 -14 -4 Z" fill="#d9b88a" />
        <circle cx="-11" cy="-34" r="11" fill="#fff6c8" stroke="#1b1033" stroke-width="3" />
        <circle cx="11" cy="-34" r="11" fill="#fff6c8" stroke="#1b1033" stroke-width="3" />
        <circle cx="-10" cy="-34" r="5" fill="#1b1033" />
        <circle cx="10" cy="-34" r="5" fill="#1b1033" />
        <path d="M-3 -26 L0 -20 L3 -26 Z" fill="#ffa53b" />
        <g class="castle-blink">
          <circle cx="-11" cy="-34" r="11" fill="#8a6a4a" stroke="#1b1033" stroke-width="3" />
          <circle cx="11" cy="-34" r="11" fill="#8a6a4a" stroke="#1b1033" stroke-width="3" />
        </g>
      </g>
    </g>

    <g class="castle-ghost">
      <g transform="translate(560 600)">
        <path d="M-56 70 L-58 -10 Q-58 -84 0 -84 Q58 -84 58 -10 L56 70 Q46 56 36 70 Q26 84 16 70 Q6 56 -4 70 Q-14 84 -24 70 Q-34 56 -44 70 Q-50 80 -56 70 Z" fill="url(#castle-ghost)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M-56 0 Q-86 -4 -90 -28 M56 4 Q84 10 92 -12" stroke="#1b1033" stroke-width="18" fill="none" stroke-linecap="round" />
        <path d="M-56 0 Q-86 -4 -90 -28 M56 4 Q84 10 92 -12" stroke="#ece6ff" stroke-width="9" fill="none" stroke-linecap="round" />
        <path d="M-36 -60 Q-26 -74 -8 -76" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" />
        <ellipse cx="-20" cy="-26" rx="9" ry="13" fill="#1b1033" />
        <ellipse cx="20" cy="-26" rx="9" ry="13" fill="#1b1033" />
        <circle cx="-23" cy="-31" r="3.5" fill="#fff" />
        <circle cx="17" cy="-31" r="3.5" fill="#fff" />
        <ellipse cx="-34" cy="-4" rx="10" ry="5" fill="#ff8ab0" opacity="0.6" />
        <ellipse cx="34" cy="-4" rx="10" ry="5" fill="#ff8ab0" opacity="0.6" />
        <ellipse cx="0" cy="8" rx="9" ry="12" fill="#1b1033" />
      </g>
    </g>

    <g v-for="(f, fi) in FLOCKS" :key="`fl${fi}`" class="bat" :style="{ animationDelay: `-${f.d}s`, animationDuration: `${f.s}s` }">
      <g :transform="`translate(0 ${f.y}) scale(${f.k})`">
        <g class="castle-wing" fill="#3d2660" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
          <g v-for="(b, bi) in f.bats" :key="bi" :transform="`translate(${b.x} ${b.y})`">
            <path d="M-6 -2 Q-24 -36 -56 -34 Q-46 -22 -50 -10 Q-36 -16 -30 -4 Q-20 -12 -6 4 Z" />
            <path d="M-6 -2 Q-24 -36 -56 -34 Q-46 -22 -50 -10 Q-36 -16 -30 -4 Q-20 -12 -6 4 Z" transform="scale(-1 1)" />
          </g>
        </g>
        <g class="castle-wing down" fill="#3d2660" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
          <g v-for="(b, bi) in f.bats" :key="bi" :transform="`translate(${b.x} ${b.y})`">
            <path d="M-6 0 Q-26 6 -52 26 Q-42 26 -40 36 Q-30 24 -22 28 Q-16 14 -6 8 Z" />
            <path d="M-6 0 Q-26 6 -52 26 Q-42 26 -40 36 Q-30 24 -22 28 Q-16 14 -6 8 Z" transform="scale(-1 1)" />
          </g>
        </g>
        <g v-for="(b, bi) in f.bats" :key="`bb${bi}`" :transform="`translate(${b.x} ${b.y})`">
          <path d="M-8 -6 L-10 -22 L-2 -12 Z M8 -6 L10 -22 L2 -12 Z" fill="#2a1840" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <ellipse cx="0" cy="2" rx="11" ry="14" fill="#2a1840" stroke="#1b1033" stroke-width="3" />
          <circle cx="-4" cy="-2" r="2.5" fill="#ffd23f" />
          <circle cx="4" cy="-2" r="2.5" fill="#ffd23f" />
        </g>
      </g>
    </g>

    <path d="M-60 990 Q960 955 1980 990 L1980 1140 L-60 1140 Z" fill="url(#castle-front)" stroke="#1b1033" stroke-width="5" />
    <g transform="translate(0 1000)">
      <path d="M1540 -70 H1980 M1540 -20 H1980" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
      <path d="M1540 -70 H1980 M1540 -20 H1980" stroke="#3a2f5e" stroke-width="5" stroke-linecap="round" />
      <g v-for="p in FENCE" :key="`fn${p.x}`" :transform="`translate(${p.x} 0) rotate(${p.r})`">
        <path d="M-8 20 V-130 L-16 -130 L0 -160 L16 -130 L8 -130 V20 Z" fill="#241c44" stroke="#0e0a20" stroke-width="5" stroke-linejoin="round" />
        <path d="M-2 -120 V0" stroke="#5a4c8a" stroke-width="3" stroke-linecap="round" opacity="0.8" />
      </g>
    </g>
    <path :d="tufts(60, 990, 1500, 0.02)" stroke="#2f3566" stroke-width="5" fill="none" stroke-linecap="round" />
    <g fill="#0e0b20" stroke="#2c2552" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-30 940 140 870 Q60 990 100 1140 Z" />
      <path d="M-60 1140 Q60 990 300 970 Q160 1050 190 1140 Z" />
      <path d="M40 1140 Q120 1010 210 1000 Q150 1070 170 1140 Z" />
      <path d="M1980 1140 Q1960 960 1800 900 Q1880 1030 1840 1140 Z" />
      <path d="M1980 1140 Q1890 1000 1660 990 Q1780 1060 1760 1140 Z" />
    </g>

    <rect width="1920" height="1080" fill="#e6dcff" class="lightning" />
  </g>
</template>

<style scoped>
.castle-glow {
  animation: castle-glow 2.6s ease-in-out infinite alternate;
}

.castle-wing {
  animation: castle-flap 0.36s steps(1) infinite;
}

.castle-wing.down {
  animation-delay: -0.18s;
}

.castle-blink {
  opacity: 0;
  animation: castle-blink 4s steps(1) infinite;
}

.castle-ghost {
  animation: castle-float 6s ease-in-out infinite;
}

.castle-peek {
  animation: castle-peek 7s ease-in-out infinite;
}

@keyframes castle-glow {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}

@keyframes castle-flap {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes castle-blink {
  0%,
  92% {
    opacity: 0;
  }
  94%,
  97% {
    opacity: 1;
  }
  98% {
    opacity: 0;
  }
}

@keyframes castle-float {
  0%,
  100% {
    translate: 0 0;
    opacity: 0.95;
  }
  50% {
    translate: 90px -50px;
    opacity: 0.55;
  }
}

@keyframes castle-peek {
  0%,
  30%,
  100% {
    translate: 0 70px;
  }
  45%,
  80% {
    translate: 0 0;
  }
}
</style>
