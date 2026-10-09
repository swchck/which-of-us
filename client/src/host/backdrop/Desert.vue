<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(220);
const CLOUDS = [
  { y: 150, k: 1.2, d: 20, s: 110 },
  { y: 270, k: 0.8, d: 70, s: 90 },
];
const VULTURES = [0, 1];
const CACTI = [
  { x: 250, y: 990, h: 400, k: 1, armL: 0.45, armR: 0.62 },
  { x: 1660, y: 950, h: 320, k: 1, armL: 0.58, armR: 0.4 },
];
const SPINES = (h: number) => {
  let d = '';
  for (let y = -30; y > -h + 20; y -= 34) d += `M-34 ${y} l-10 -4 M34 ${y - 16} l10 -4 `;
  return d;
};
const PEBBLES = Array.from({ length: 14 }, () => ({ x: 120 + rnd() * 1680, y: 900 + rnd() * 60, r: 5 + rnd() * 8 }));
const CRACKS = 'M560 1010 l40 10 l20 -12 l36 8 M600 1020 l-6 24 M1180 1000 l30 12 l30 -6 l24 14 M1240 1006 l6 -18 M860 1050 l40 -6 l24 12';
const BLADES = Array.from({ length: 12 }, (_, i) => i * 30);
</script>

<template>
  <g>
    <defs>
      <linearGradient id="desert-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a1a5e" />
        <stop offset="35%" stop-color="#a8306e" />
        <stop offset="62%" stop-color="#ff7a4a" />
        <stop offset="80%" stop-color="#ffc46a" />
      </linearGradient>
      <linearGradient id="desert-sun" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="100%" stop-color="#ff9a3c" />
      </linearGradient>
      <linearGradient id="desert-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe0a0" stop-opacity="0" />
        <stop offset="60%" stop-color="#ffe0a0" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffe0a0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="desert-butte" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0%" stop-color="#f08a52" />
        <stop offset="100%" stop-color="#b8443a" />
      </linearGradient>
      <linearGradient id="desert-dune" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffc47a" />
        <stop offset="100%" stop-color="#f0985a" />
      </linearGradient>
      <linearGradient id="desert-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e88a4a" />
        <stop offset="100%" stop-color="#a8502e" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1200" fill="url(#desert-sky)" />
    <circle cx="1240" cy="640" r="300" fill="#ffd23f" fill-opacity="0.12" class="glow" />
    <circle cx="1240" cy="640" r="215" fill="#ffd23f" fill-opacity="0.16" />
    <circle cx="1240" cy="640" r="160" fill="url(#desert-sun)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M1090 600 H1390 M1086 640 H1394 M1090 680 H1390" stroke="#ff7a4a" stroke-width="10" opacity="0.5" />
    <path d="M1150 540 Q1180 510 1220 502" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8" />

    <g v-for="(c, i) in CLOUDS" :key="`dc${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-180 16 Q-170 -6 -120 -4 Q-100 -34 -40 -26 Q0 -50 60 -26 Q120 -30 140 -4 Q190 -2 190 16 Z" fill="#ff9ab0" stroke="#d86a8a" stroke-width="3" stroke-linejoin="round" />
        <path d="M-170 14 Q0 26 182 14" stroke="#ffd0a0" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M-80 -18 Q-50 -32 -20 -28" stroke="#ffd0e0" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="v in VULTURES" :key="`vu${v}`" class="circle-fly" :style="{ animationDelay: `-${v * 5}s` }">
      <g :transform="`scale(${v ? 0.7 : 1})`" stroke="#1b1033" stroke-linejoin="round">
        <path d="M0 0 Q-30 -26 -70 -18 L-82 -10 L-72 -8 L-80 0 L-68 0 L-72 8 Q-40 0 0 8 Q40 0 72 8 L68 0 L80 0 L72 -8 L82 -10 L70 -18 Q30 -26 0 0 Z" fill="#3a2440" stroke-width="3" />
        <ellipse cx="0" cy="4" rx="12" ry="8" fill="#2a1830" stroke-width="3" />
        <circle cx="0" cy="-8" r="6" fill="#e88a8a" stroke-width="2.5" />
        <path d="M-8 -14 Q-20 -18 -30 -16" stroke="#ffd0c0" stroke-width="2" fill="none" opacity="0.6" />
      </g>
    </g>

    <path d="M-60 750 L380 750 L420 640 L470 630 L600 630 L620 650 L660 650 L700 750 L880 750 L900 700 L1000 700 L1020 750 L1280 750 L1300 680 L1330 670 L1440 670 L1470 750 L1980 750 L1980 1140 L-60 1140 Z" fill="#d87a7a" stroke="#b85a6e" stroke-width="3" stroke-linejoin="round" />
    <path d="M440 670 H640 M430 710 H670 M910 724 H1006 M1310 700 H1450 M1300 724 H1456" stroke="#b85a6e" stroke-width="3" opacity="0.6" />
    <path d="M480 640 H580 M1340 678 H1420" stroke="#ffb0a0" stroke-width="3" stroke-linecap="round" opacity="0.7" />
    <rect x="-60" y="620" width="2040" height="220" fill="url(#desert-haze)" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-60 860 V500 L40 500 L60 470 L300 470 L330 500 L380 500 L430 860 Z" fill="url(#desert-butte)" stroke-width="5" filter="url(#cel)" />
      <path d="M-40 560 H360 M-40 620 H380 M-40 690 H390 M-40 760 H404" stroke="#8a2a2a" stroke-width="5" opacity="0.4" />
      <path d="M60 480 L300 480 M80 540 L120 540 M200 600 L260 600" stroke="#ffc49a" stroke-width="5" stroke-linecap="round" opacity="0.6" />
      <path d="M1980 860 V420 L1900 420 L1880 450 L1700 450 L1680 500 L1620 500 L1560 860 Z" fill="url(#desert-butte)" stroke-width="5" filter="url(#cel)" />
      <path d="M1600 560 H1980 M1590 640 H1980 M1580 720 H1980 M1570 800 H1980" stroke="#8a2a2a" stroke-width="5" opacity="0.4" />
      <path d="M1710 460 H1880 M1690 520 L1640 520" stroke="#ffc49a" stroke-width="5" stroke-linecap="round" opacity="0.6" />
      <path d="M1480 860 L1492 640 Q1470 610 1500 590 Q1490 560 1520 550 Q1550 560 1540 590 Q1566 610 1546 640 L1560 860 Z" fill="url(#desert-butte)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M1494 660 H1546 M1490 720 H1550" stroke="#8a2a2a" stroke-width="4" opacity="0.4" />
    </g>

    <path d="M-60 840 Q400 790 900 820 Q1400 850 1980 800 L1980 1140 L-60 1140 Z" fill="url(#desert-dune)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M300 850 Q420 836 520 848 M1000 840 Q1100 830 1200 842 M1440 840 Q1560 826 1680 834" stroke="#e07a46" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />

    <g transform="translate(700 830)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="4" rx="60" ry="8" fill="#6a2a1a" opacity="0.3" stroke="none" />
      <path d="M-30 0 L-8 -190 M30 0 L8 -190 M-24 -50 L24 -50 M-18 -110 L18 -110 M-24 -50 L18 -110 M24 -50 L-18 -110" stroke-width="5" fill="none" />
      <path d="M8 -190 L70 -184 L70 -170 L10 -178 Z" fill="#d84a3a" stroke-width="4" />
      <g transform="translate(0 -196)">
        <g class="desert-blades">
          <path v-for="a in BLADES" :key="a" d="M0 -6 L8 -66 L-8 -66 Z" :transform="`rotate(${a})`" fill="#f4e0c0" stroke-width="3" />
          <circle cx="0" cy="0" r="66" fill="none" stroke-width="4" />
        </g>
        <circle cx="0" cy="0" r="9" fill="#5a3a2a" stroke-width="3" />
      </g>
    </g>

    <g fill="#c86a3a" stroke="#1b1033" stroke-width="3">
      <ellipse v-for="(p, i) in PEBBLES" :key="`pb${i}`" :cx="p.x" :cy="p.y" :rx="p.r" :ry="p.r * 0.6" />
    </g>

    <g v-for="(c, i) in CACTI" :key="`c${i}`" :transform="`translate(${c.x} ${c.y})`" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="10" cy="6" rx="110" ry="14" fill="#6a2a1a" opacity="0.3" />
      <path :d="`M0 ${-c.h * c.armL} H-60 Q-90 ${-c.h * c.armL} -90 ${-c.h * c.armL - 30} V${-c.h * c.armL - 120}`" stroke="#1b1033" stroke-width="58" fill="none" />
      <path :d="`M0 ${-c.h * c.armR} H60 Q90 ${-c.h * c.armR} 90 ${-c.h * c.armR - 30} V${-c.h * c.armR - 100}`" stroke="#1b1033" stroke-width="58" fill="none" />
      <path :d="`M0 0 V${-c.h}`" stroke="#1b1033" stroke-width="82" fill="none" />
      <path :d="`M0 ${-c.h * c.armL} H-60 Q-90 ${-c.h * c.armL} -90 ${-c.h * c.armL - 30} V${-c.h * c.armL - 120}`" stroke="#3ab06a" stroke-width="46" fill="none" />
      <path :d="`M0 ${-c.h * c.armR} H60 Q90 ${-c.h * c.armR} 90 ${-c.h * c.armR - 30} V${-c.h * c.armR - 100}`" stroke="#2e9a5a" stroke-width="46" fill="none" />
      <path :d="`M0 0 V${-c.h}`" stroke="#3ab06a" stroke-width="70" fill="none" />
      <path :d="`M14 -10 V${-c.h + 6} M98 ${-c.h * c.armR - 30} V${-c.h * c.armR - 96}`" stroke="#1f7a44" stroke-width="12" fill="none" opacity="0.8" />
      <path :d="`M-16 -20 V${-c.h + 10} M-98 ${-c.h * c.armL - 30} V${-c.h * c.armL - 116}`" stroke="#8ae0a0" stroke-width="6" fill="none" opacity="0.8" />
      <path :d="`M2 -20 V${-c.h + 10}`" stroke="#1f7a44" stroke-width="4" fill="none" opacity="0.6" />
      <path :d="SPINES(c.h)" stroke="#fff4dc" stroke-width="3" fill="none" />
      <g :transform="`translate(0 ${-c.h - 34})`" stroke="#1b1033" stroke-width="3">
        <ellipse cx="-10" cy="0" rx="10" ry="14" fill="#ff5a8a" transform="rotate(-25)" />
        <ellipse cx="10" cy="0" rx="10" ry="14" fill="#ff5a8a" transform="rotate(25)" />
        <circle cx="0" cy="2" r="6" fill="#ffd23f" />
      </g>
    </g>

    <g transform="translate(1420 960) rotate(-12)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="80" ry="10" fill="#6a2a1a" opacity="0.3" stroke="none" />
      <circle cx="0" cy="-30" r="66" fill="none" stroke-width="20" />
      <circle cx="0" cy="-30" r="66" fill="none" stroke="#9a5a32" stroke-width="12" />
      <path d="M0 -96 V36 M-66 -30 H66 M-47 -77 L47 17 M47 -77 L-47 17" stroke-width="12" />
      <path d="M0 -96 V36 M-66 -30 H66 M-47 -77 L47 17 M47 -77 L-47 17" stroke="#c48a52" stroke-width="5" />
      <circle cx="0" cy="-30" r="14" fill="#7a4a2a" stroke-width="4" />
      <path d="M-50 -76 Q-30 -94 -6 -96" stroke="#e0b080" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(540 930)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="6" cy="4" rx="50" ry="8" fill="#6a2a1a" opacity="0.3" stroke="none" />
      <rect x="-8" y="-170" width="16" height="174" fill="#9a5a32" stroke-width="4" />
      <path d="M-70 -160 H50 L74 -140 L50 -120 H-70 Z" fill="#c48a52" stroke-width="5" filter="url(#cel-s)" />
      <path d="M70 -110 H-50 L-74 -90 L-50 -70 H70 Z" fill="#b07a46" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-60 -148 H30 M60 -96 H-30 M-56 -82 H40" stroke="#7a4a2a" stroke-width="3" opacity="0.6" />
    </g>

    <path d="M-60 950 Q500 925 960 945 Q1500 970 1980 930 L1980 1140 L-60 1140 Z" fill="url(#desert-front)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="CRACKS" stroke="#7a3420" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
    <path d="M200 960 l-10 -26 M210 960 l2 -30 M220 960 l12 -24 M1300 968 l-10 -24 M1310 968 l2 -28 M1320 968 l12 -22 M980 958 l-8 -20 M988 958 l2 -24 M996 958 l10 -18" stroke="#a87a3a" stroke-width="4" stroke-linecap="round" />

    <g transform="translate(400 1020)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="16" rx="70" ry="10" fill="#4a1a10" opacity="0.3" stroke="none" />
      <path d="M-30 -30 Q-80 -60 -96 -20 Q-74 -40 -50 -20 M30 -30 Q80 -60 96 -20 Q74 -40 50 -20" fill="#fff4dc" stroke-width="4" />
      <path d="M-40 -34 Q0 -50 40 -34 Q46 0 20 20 H-20 Q-46 0 -40 -34 Z" fill="#fff4dc" stroke-width="5" />
      <ellipse cx="-16" cy="-16" rx="9" ry="11" fill="#1b1033" />
      <ellipse cx="16" cy="-16" rx="9" ry="11" fill="#1b1033" />
      <path d="M-6 6 L-2 12 M6 6 L2 12" stroke-width="3" stroke-linecap="round" />
      <path d="M-30 -30 Q-10 -42 10 -40" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <g class="tumble">
      <g class="spin-weed" stroke-linecap="round" fill="none">
        <path d="M-38 -14 Q0 34 38 -14 M-24 32 Q0 -34 26 32 M-36 18 Q10 -14 34 22 M-10 -40 Q30 0 -6 40 M14 -40 Q-30 -4 10 40 M-40 4 Q0 -20 40 6" stroke="#4a2410" stroke-width="8" />
        <path d="M-38 -14 Q0 34 38 -14 M-24 32 Q0 -34 26 32 M-36 18 Q10 -14 34 22 M-10 -40 Q30 0 -6 40 M14 -40 Q-30 -4 10 40 M-40 4 Q0 -20 40 6" stroke="#d8a060" stroke-width="4" />
      </g>
    </g>

    <g fill="#3a1424" stroke="#1e0812" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 V900 Q20 860 110 890 Q190 900 230 980 Q290 1030 280 1140 Z" />
      <path d="M40 890 Q10 800 -40 760 Q40 790 70 880 Z M80 886 Q90 780 140 730 Q120 820 110 890 Z M110 892 Q170 820 230 810 Q170 860 140 900 Z M20 888 Q-30 830 -60 820 Q0 870 10 900 Z" />
      <path d="M1980 1140 V900 Q1900 880 1830 920 Q1740 940 1720 1020 Q1680 1070 1690 1140 Z" />
      <ellipse cx="1840" cy="860" rx="44" ry="60" />
      <ellipse cx="1790" cy="780" rx="34" ry="46" transform="rotate(-24 1790 780)" />
      <ellipse cx="1888" cy="770" rx="32" ry="44" transform="rotate(22 1888 770)" />
      <ellipse cx="1846" cy="700" rx="26" ry="36" />
    </g>
    <path d="M-40 910 Q30 880 100 900 M1960 896 Q1890 890 1840 930 M1806 820 Q1790 790 1800 760 M1830 818 Q1816 860 1824 900" stroke="#6a2a3a" stroke-width="4" fill="none" stroke-linecap="round" />
    <circle cx="1846" cy="660" r="10" fill="#ff5a8a" stroke="#1e0812" stroke-width="3" />
    <circle cx="1772" cy="732" r="8" fill="#ff5a8a" stroke="#1e0812" stroke-width="3" />
  </g>
</template>

<style scoped>
.desert-blades {
  transform-box: fill-box;
  transform-origin: center;
  animation: desert-turn 9s linear infinite;
}

@keyframes desert-turn {
  to {
    rotate: 360deg;
  }
}
</style>
