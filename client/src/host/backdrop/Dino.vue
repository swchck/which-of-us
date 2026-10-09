<script setup lang="ts">
import { tufts } from './kit';
const SMOKE = [0, 1, 2, 3];
const PTEROS = [
  { y: 200, k: 1, s: 26, d: 0 },
  { y: 330, k: 0.7, s: 36, d: 14 },
];
const PALMS = [
  { x: 120, flip: 1, d: 0 },
  { x: 1830, flip: -1, d: 2 },
];
const FERNS = [
  { x: 60, s: 1.1, d: 0 },
  { x: 330, s: 0.9, d: 1.5 },
  { x: 1560, s: 1, d: 0.8 },
  { x: 1800, s: 1.2, d: 2.2 },
];
const FERN_ANGLES = [-60, -30, 0, 30, 60];
const EGGS = [-40, 0, 40];
</script>

<template>
  <g>
    <circle cx="300" cy="200" r="250" fill="#fff1b0" opacity="0.16" />
    <circle cx="300" cy="200" r="150" fill="#fff1b0" fill-opacity="0.3" class="glow" />
    <circle cx="300" cy="200" r="80" fill="#fff6c8" stroke="#1b1033" stroke-width="5" />
    <path d="M262 168 Q280 146 312 142" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.8" />
    <g v-for="(p, i) in PTEROS" :key="`pt${i}`" class="gull" :style="{ animationDelay: `-${p.d}s`, animationDuration: `${p.s}s` }">
      <g :transform="`translate(0 ${p.y}) scale(${p.k})`">
        <path d="M-18 8 L-46 20" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
        <path d="M0 0 Q-30 -40 -90 -30 Q-60 -10 -50 14 Q-20 0 0 14 Q20 0 50 14 Q60 -10 90 -30 Q30 -40 0 0 Z" fill="#a66bff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" class="flap" />
        <ellipse cx="0" cy="6" rx="18" ry="10" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" />
        <path d="M14 2 L72 -2 L18 -12 Z" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M10 -8 L-12 -26 L4 -2 Z" fill="#ff7a2f" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      </g>
    </g>
    <path d="M-60 700 L140 590 L300 650 L520 520 L700 640 L900 560 L1120 650 L1300 590 L1560 660 L1760 600 L1980 680 L1980 1140 L-60 1140 Z" fill="#f6b48a" stroke="#a8566a" stroke-width="3" stroke-linejoin="round" />
    <rect x="-60" y="600" width="2040" height="200" fill="url(#g-haze)" />
    <path d="M-60 740 L220 580 L420 700 L640 560 L860 710 L1080 640 L1980 740 L1980 1140 L-60 1140 Z" fill="url(#g-dino-rock)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M150 660 L250 640 M520 640 L610 620 M700 680 L790 668 M980 690 L1060 676" stroke="#a5503c" stroke-width="5" stroke-linecap="round" opacity="0.6" />
    <path d="M1150 860 L1380 400 L1520 400 L1750 860 Z" fill="url(#g-dino-volcano)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1300 640 L1340 630 M1560 600 L1600 616 M1250 760 L1300 748 M1620 720 L1670 736" stroke="#3a1f22" stroke-width="5" stroke-linecap="round" opacity="0.5" />
    <path d="M1420 410 Q1400 520 1360 600 L1390 610 Q1420 540 1440 420 Z M1480 412 Q1500 500 1560 640 L1530 650 Q1480 540 1460 420 Z" fill="#ff5a2f" stroke="#1b1033" stroke-width="3" />
    <path d="M1426 430 Q1412 520 1380 594 M1474 432 Q1494 520 1540 630" stroke="#ffd36b" stroke-width="5" fill="none" stroke-linecap="round" />
    <ellipse cx="1450" cy="400" rx="70" ry="18" fill="#3a1f2a" stroke="#1b1033" stroke-width="5" />
    <ellipse cx="1450" cy="398" rx="50" ry="10" fill="#ffb02e" class="glow" />
    <circle v-for="i in SMOKE" :key="`vs${i}`" cx="1450" cy="380" r="26" fill="none" stroke="#4a3a5a" stroke-width="12" class="smoke" :style="{ animationDelay: `-${i * 1.5}s` }" />
    <path d="M-60 830 Q420 760 900 820 Q1300 870 1980 800 L1980 1140 L-60 1140 Z" fill="url(#g-dino-hill)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(40, 812, 1900, 0.012)" stroke="#5f9a2c" stroke-width="5" fill="none" stroke-linecap="round" />
    <ellipse cx="640" cy="890" rx="260" ry="26" fill="#1b2a10" opacity="0.28" />
    <g transform="translate(620 880)">
      <path d="M120 -200 Q300 -190 400 -80 Q290 -110 120 -100 Z" fill="#35c27f" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel-s)" />
      <g class="dino-neck">
        <path d="M-100 -190 Q-190 -330 -210 -470" stroke="#1b1033" stroke-width="56" fill="none" stroke-linecap="round" />
        <path d="M-100 -190 Q-190 -330 -210 -470" stroke="#45d892" stroke-width="44" fill="none" stroke-linecap="round" />
        <path d="M-88 -200 Q-172 -330 -192 -462" stroke="#2a9e66" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.7" />
        <ellipse cx="-225" cy="-490" rx="46" ry="30" transform="rotate(-20 -225 -490)" fill="#45d892" stroke="#1b1033" stroke-width="5" />
        <circle cx="-240" cy="-500" r="8" fill="#1b1033" />
        <circle cx="-243" cy="-503" r="2.5" fill="#fff" />
        <circle cx="-262" cy="-486" r="3.5" fill="#1b1033" />
        <ellipse cx="-218" cy="-478" rx="11" ry="6" fill="#ff7a8a" opacity="0.6" />
        <path d="M-262 -474 Q-244 -466 -228 -476" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
      <g filter="url(#cel-s)">
        <rect x="-120" y="-110" width="46" height="110" rx="18" fill="#2fb877" stroke="#1b1033" stroke-width="5" />
        <rect x="-70" y="-110" width="46" height="110" rx="18" fill="#2fb877" stroke="#1b1033" stroke-width="5" />
        <rect x="50" y="-110" width="46" height="110" rx="18" fill="#2fb877" stroke="#1b1033" stroke-width="5" />
        <rect x="100" y="-110" width="46" height="110" rx="18" fill="#2fb877" stroke="#1b1033" stroke-width="5" />
      </g>
      <path d="M-114 -8 h34 M-64 -8 h34 M56 -8 h34 M106 -8 h34" stroke="#1b1033" stroke-width="4" stroke-linecap="round" opacity="0.5" />
      <ellipse cx="0" cy="-150" rx="170" ry="90" fill="url(#g-dino-skin)" stroke="#1b1033" stroke-width="6" filter="url(#cel)" />
      <path d="M-130 -110 Q0 -40 130 -110 Q0 -76 -130 -110 Z" fill="#c9f5dc" opacity="0.7" />
      <circle cx="-40" cy="-200" r="16" fill="#2a9e66" />
      <circle cx="30" cy="-220" r="20" fill="#2a9e66" />
      <circle cx="90" cy="-180" r="14" fill="#2a9e66" />
      <circle cx="-90" cy="-170" r="10" fill="#2a9e66" />
    </g>
    <path d="M-60 880 Q500 850 960 875 Q1500 905 1980 860 L1980 1140 L-60 1140 Z" fill="#4b9a3c" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(20, 872, 1900, 0.018)" stroke="#2f7a2a" stroke-width="5" fill="none" stroke-linecap="round" />
    <ellipse cx="1280" cy="934" rx="120" ry="16" fill="#0f2a10" opacity="0.3" />
    <g transform="translate(1280 930)">
      <g v-for="(x, i) in EGGS" :key="x" class="dino-egg" :style="{ animationDelay: `-${i * 1.1}s` }">
        <ellipse :cx="x" cy="-26" rx="24" ry="32" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
        <path :d="`M${x - 14} -40 Q${x - 10} -52 ${x - 2} -54`" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
        <path :d="`M${x + 10} -6 Q${x + 20} -16 ${x + 20} -30`" stroke="#d8cbb0" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle :cx="x - 8" cy="-34" r="5" fill="#2ed47a" />
        <circle :cx="x + 8" cy="-18" r="4" fill="#ff7a2f" />
      </g>
      <path d="M-90 4 Q0 56 90 4 Q0 22 -90 4 Z" fill="#7a4a2a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-70 12 L-40 8 M-20 22 L14 18 M34 20 L64 14" stroke="#c48a52" stroke-width="4" stroke-linecap="round" />
    </g>
    <path d="M-60 960 Q960 930 1980 965 L1980 1140 L-60 1140 Z" fill="url(#g-dino-front)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <g v-for="(p, i) in PALMS" :key="`pm${i}`" :transform="`translate(${p.x} 900) scale(${p.flip} 1)`">
      <ellipse cx="0" cy="8" rx="90" ry="14" fill="#0f2a10" opacity="0.3" />
      <g class="dino-palm" :style="{ animationDelay: `-${p.d}s` }">
        <path d="M0 0 Q30 -200 -10 -430" stroke="#1b1033" stroke-width="40" fill="none" stroke-linecap="round" />
        <path d="M0 0 Q30 -200 -10 -430" stroke="#b77744" stroke-width="28" fill="none" stroke-linecap="round" />
        <path d="M0 0 Q30 -200 -10 -430" stroke="#7d4a26" stroke-width="28" fill="none" stroke-dasharray="6 30" />
        <path d="M8 -10 Q36 -200 0 -420" stroke="#d9a06a" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7" />
        <g transform="translate(-10 -430)">
          <g fill="#27a95c" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)">
            <path d="M0 0 Q-130 -40 -220 60 Q-110 0 0 0 Z" />
            <path d="M0 0 Q130 -50 230 40 Q110 0 0 0 Z" />
            <path d="M0 0 Q-40 -120 -130 -150 Q-30 -70 0 0 Z" />
            <path d="M0 0 Q70 -110 170 -120 Q60 -60 0 0 Z" />
          </g>
          <path d="M-6 -4 Q-110 -20 -200 46 M6 -6 Q110 -30 210 30 M-4 -8 Q-40 -100 -118 -138 M4 -8 Q60 -90 156 -112" stroke="#7be0a0" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
          <circle cx="-14" cy="10" r="13" fill="#7a4a2a" stroke="#1b1033" stroke-width="4" />
          <circle cx="10" cy="14" r="13" fill="#7a4a2a" stroke="#1b1033" stroke-width="4" />
        </g>
      </g>
    </g>
    <g v-for="(f, i) in FERNS" :key="`fe${i}`" :transform="`translate(${f.x} 940) scale(${f.s})`">
      <g class="leaf" :style="{ animationDelay: `-${f.d}s` }">
        <path v-for="a in FERN_ANGLES" :key="a" d="M0 0 Q-40 -60 0 -120 Q40 -60 0 0 Z" :transform="`rotate(${a})`" :fill="a % 60 === 0 ? '#1f9a55' : '#2ed47a'" stroke="#1b1033" stroke-width="4" />
      </g>
    </g>
    <g fill="#123a22" stroke="#0b1a12" stroke-width="5">
      <path d="M-60 1140 Q-20 900 160 820 Q80 960 120 1140 Z" />
      <path d="M-60 1140 Q40 980 300 960 Q160 1040 180 1140 Z" />
      <path d="M1980 1140 Q1960 920 1780 850 Q1860 980 1820 1140 Z" />
      <path d="M1980 1140 Q1880 990 1640 980 Q1770 1050 1760 1140 Z" />
    </g>
  </g>
</template>
