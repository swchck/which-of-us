<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(417);
const TABLES = [
  { x: 640, y: 770, k: 0.58, near: false },
  { x: 1220, y: 770, k: 0.58, near: false },
  { x: 250, y: 900, k: 1.15, near: true },
  { x: 1680, y: 900, k: 1.15, near: true },
];
const LAMPS = [
  { x: 520, len: 170, d: 0 },
  { x: 960, len: 120, d: 1.7 },
  { x: 1400, len: 170, d: 3.4 },
];
// a few bricks repainted by hand so the wall doesn't read as a stamped pattern
const ODD_BRICKS = Array.from({ length: 22 }, () => {
  const row = Math.floor(rnd() * 10);
  const col = Math.floor(rnd() * 32);
  return { x: col * 60 + (row % 2 ? 30 : 0) + 3, y: row * 28 + 3 + 20, c: rnd() > 0.5 ? '#c96a4e' : '#8e3b32' };
});
// one-point floor: rows get wider apart toward the viewer, columns meet at (960, 420)
const FLOOR_ROWS = [760, 790, 830, 885, 960, 1060, 1200];
const FLOOR_COLS = Array.from({ length: 19 }, (_, j) => -900 + j * 210);
const floorX = (x: number, y: number) => 960 + ((x - 960) * (y - 420)) / (1200 - 420);
const spans = (a: number[]) => a.slice(0, -1).map((v, i) => [v, a[i + 1] ?? v] as const);
const FLOOR_DARK = spans(FLOOR_ROWS)
  .flatMap(([y1, y2], i) =>
    spans(FLOOR_COLS)
      .filter((_, j) => (i + j) % 2 === 0)
      .map(([a, b]) => `M${floorX(a, y1)} ${y1}L${floorX(b, y1)} ${y1}L${floorX(b, y2)} ${y2}L${floorX(a, y2)} ${y2}Z`),
  )
  .join('');
const PANELS = Array.from({ length: 12 }, (_, i) => i * 170 + 20);
const UTENSILS = [1500, 1560, 1790, 1840];
const BOTTLES = [
  { x: 560, c: '#2f8a4a', h: 70 },
  { x: 600, c: '#7a1f3a', h: 80 },
  { x: 640, c: '#2f8a4a', h: 64 },
  { x: 700, c: '#c98a2a', h: 50 },
  { x: 740, c: '#7a1f3a', h: 76 },
];
</script>

<template>
  <g>
    <defs>
      <pattern id="restaurant-brick" width="120" height="56" patternUnits="userSpaceOnUse" y="20">
        <rect width="120" height="56" fill="#5e2428" />
        <rect x="3" y="3" width="54" height="22" rx="3" fill="#b04e3c" />
        <rect x="63" y="3" width="54" height="22" rx="3" fill="#a44636" />
        <rect x="-27" y="31" width="54" height="22" rx="3" fill="#a44636" />
        <rect x="33" y="31" width="54" height="22" rx="3" fill="#b85844" />
        <rect x="93" y="31" width="54" height="22" rx="3" fill="#a44636" />
        <path d="M7 7 h22 M67 7 h14 M37 35 h20 M97 35 h12" stroke="#d98a66" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
      </pattern>
      <pattern id="restaurant-gingham" width="28" height="28" patternUnits="userSpaceOnUse">
        <rect width="28" height="28" fill="#fffaf0" />
        <rect width="14" height="28" fill="#e23b4a" opacity="0.5" />
        <rect width="28" height="14" fill="#e23b4a" opacity="0.5" />
      </pattern>
      <pattern id="restaurant-tile" width="36" height="36" patternUnits="userSpaceOnUse">
        <rect width="36" height="36" fill="#dfe8ee" />
        <path d="M0 0.5 H36 M0.5 0 V36" stroke="#a9bccb" stroke-width="2" />
      </pattern>
      <radialGradient id="restaurant-shade" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stop-color="#2a0c1a" stop-opacity="0" />
        <stop offset="70%" stop-color="#2a0c1a" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#1a0612" stop-opacity="0.7" />
      </radialGradient>
      <radialGradient id="restaurant-pool">
        <stop offset="0%" stop-color="#ffd27a" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#ffd27a" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="restaurant-dusk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a0612" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#1a0612" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="restaurant-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8c9a0" />
        <stop offset="100%" stop-color="#b98a5e" />
      </linearGradient>
      <linearGradient id="restaurant-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7a3a26" />
        <stop offset="100%" stop-color="#4e2018" />
      </linearGradient>
      <linearGradient id="restaurant-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f2f6fa" />
        <stop offset="100%" stop-color="#9aa8b8" />
      </linearGradient>
      <linearGradient id="restaurant-copper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffb070" />
        <stop offset="60%" stop-color="#d0703a" />
        <stop offset="100%" stop-color="#8a3a1e" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="680" fill="url(#restaurant-brick)" />
    <rect v-for="(b, i) in ODD_BRICKS" :key="`ob${i}`" :x="b.x" :y="b.y" width="54" height="22" rx="3" :fill="b.c" />
    <rect x="-60" y="-60" width="2040" height="680" fill="url(#restaurant-shade)" />
    <rect x="-60" y="-60" width="2040" height="420" fill="url(#restaurant-dusk)" />
    <ellipse v-for="l in LAMPS" :key="`pool${l.x}`" :cx="l.x" :cy="l.len + 120" rx="300" ry="240" fill="url(#restaurant-pool)" />

    <rect x="-60" y="600" width="2040" height="170" fill="url(#restaurant-wood)" />
    <path :d="PANELS.map((x) => `M${x} 626 h140 v118 h-140 Z`).join('')" fill="none" stroke="#3a140e" stroke-width="4" />
    <path :d="PANELS.map((x) => `M${x + 6} 632 h128`).join('')" stroke="#9a5a3a" stroke-width="3" opacity="0.7" />
    <rect x="-60" y="590" width="2040" height="18" fill="#9a5434" stroke="#1b1033" stroke-width="4" />
    <path d="M-60 594 H1980" stroke="#d08a5a" stroke-width="3" />

    <path d="M-60 760 H1980 V1140 H-60 Z" fill="url(#restaurant-floor)" />
    <path :d="FLOOR_DARK" fill="#7a3a2a" opacity="0.45" />
    <path d="M-60 770 H1980" stroke="#1b1033" stroke-width="5" />
    <path d="M-60 760 H1980" stroke="#3a140e" stroke-width="16" />

    <g transform="translate(70 150)">
      <rect x="0" y="0" width="330" height="270" rx="10" fill="#7a4a2a" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <rect x="18" y="18" width="294" height="234" rx="4" fill="#26443c" stroke="#1b1033" stroke-width="3" />
      <g stroke="#f4f0e6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
        <path d="M120 40 q20 -10 40 0 q20 10 40 0" stroke-width="4" />
        <path d="M46 92 q12 -8 24 0 t24 0 t24 0 M46 132 q12 -8 24 0 t24 0 t24 0 t24 0 M46 172 q12 -8 24 0 t24 0 M46 212 q12 -8 24 0 t24 0 t24 0" stroke-width="3" />
        <path d="M230 86 Q270 66 290 96 Q270 122 230 104 L214 116 L216 94 L212 74 Z" stroke-width="3" />
        <circle cx="276" cy="92" r="2.5" fill="#f4f0e6" />
        <path d="M222 158 h44 v30 q0 18 -22 18 q-22 0 -22 -18 Z M266 166 q14 0 14 12 q0 10 -14 10" stroke-width="3" />
        <path d="M232 150 q-6 -10 0 -18 M248 150 q-6 -10 0 -18" stroke-width="2.5" />
        <path d="M200 228 l20 -18 l20 18" stroke-width="3" />
      </g>
      <path d="M24 26 L60 26" stroke="#fff" stroke-width="3" opacity="0.25" />
      <rect x="10" y="262" width="310" height="14" rx="4" fill="#9a6a3a" stroke="#1b1033" stroke-width="4" />
      <rect x="60" y="256" width="26" height="8" rx="3" fill="#fff" />
      <rect x="110" y="256" width="18" height="8" rx="3" fill="#ffd23f" />
    </g>

    <g>
      <rect x="520" y="514" width="260" height="14" rx="4" fill="#9a5434" stroke="#1b1033" stroke-width="4" />
      <path d="M540 528 l14 22 M760 528 l-14 22" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
      <g v-for="b in BOTTLES" :key="`bt${b.x}`" :transform="`translate(${b.x} 514)`">
        <path :d="`M-13 0 V${-b.h * 0.6} Q-13 ${-b.h * 0.75} -5 ${-b.h * 0.8} V${-b.h} H5 V${-b.h * 0.8} Q13 ${-b.h * 0.75} 13 ${-b.h * 0.6} V0 Z`" :fill="b.c" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path :d="`M-7 -6 V${-b.h * 0.55}`" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.45" />
        <rect x="-9" :y="-b.h * 0.42" width="18" height="16" fill="#fffaf0" opacity="0.85" />
      </g>
    </g>

    <g transform="translate(1320 770)">
      <ellipse cx="0" cy="4" rx="70" ry="12" fill="#1a0612" opacity="0.35" />
      <path d="M0 -70 Q-10 -180 6 -270" stroke="#4a2a1a" stroke-width="8" fill="none" stroke-linecap="round" />
      <g fill="#3fa75a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
        <path d="M2 -150 Q-70 -170 -80 -230 Q-20 -220 2 -150 Z" />
        <path d="M4 -190 Q70 -200 84 -260 Q20 -260 4 -190 Z" />
        <path d="M6 -250 Q-50 -290 -40 -340 Q10 -310 6 -250 Z" />
        <path d="M6 -260 Q50 -300 40 -350 Q0 -320 6 -260 Z" />
        <path d="M2 -110 Q60 -110 80 -160 Q20 -170 2 -110 Z" />
      </g>
      <path d="M-2 -152 Q-40 -176 -70 -222 M6 -190 Q40 -210 74 -252 M6 -250 Q-20 -290 -36 -330 M2 -112 Q40 -124 70 -154" stroke="#2a7a40" stroke-width="3" fill="none" />
      <path d="M-46 -76 L-36 0 H36 L46 -76 Z" fill="url(#restaurant-copper)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <rect x="-52" y="-86" width="104" height="16" rx="5" fill="#d0703a" stroke="#1b1033" stroke-width="4" />
    </g>

    <g>
      <rect x="1446" y="206" width="440" height="368" rx="8" fill="#5a2a1a" stroke="#1b1033" stroke-width="6" />
      <rect x="1470" y="230" width="392" height="330" fill="url(#restaurant-tile)" />
      <path d="M1470 230 H1862 V280 Q1666 310 1470 280 Z" fill="#b8c4d0" stroke="#1b1033" stroke-width="4" />
      <path d="M1490 250 H1842" stroke="#fff" stroke-width="4" opacity="0.6" />
      <path d="M1480 300 H1860" stroke="#5a6a7a" stroke-width="5" stroke-linecap="round" />
      <g v-for="(x, i) in UTENSILS" :key="`ut${x}`" stroke="#1b1033" stroke-width="3">
        <path :d="`M${x} 300 V${i % 2 ? 340 : 350}`" stroke-width="4" />
        <circle v-if="i % 2 === 0" :cx="x" :cy="370" r="22" fill="url(#restaurant-copper)" />
        <ellipse v-else :cx="x" :cy="352" rx="10" ry="14" fill="#c7d0dc" />
      </g>
      <g transform="translate(1666 560)">
        <path d="M-90 0 Q-96 -120 0 -130 Q96 -120 90 0 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
        <path d="M-30 -126 L0 -86 L30 -126" fill="#e23b3b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M0 -86 V-10" stroke="#d8cfe0" stroke-width="3" />
        <circle cx="-16" cy="-60" r="5" fill="#d8cfe0" stroke="#1b1033" stroke-width="2" />
        <circle cx="-16" cy="-30" r="5" fill="#d8cfe0" stroke="#1b1033" stroke-width="2" />
        <circle cx="16" cy="-60" r="5" fill="#d8cfe0" stroke="#1b1033" stroke-width="2" />
        <circle cx="16" cy="-30" r="5" fill="#d8cfe0" stroke="#1b1033" stroke-width="2" />
        <circle cx="0" cy="-176" r="48" fill="#ffd2b0" stroke="#1b1033" stroke-width="5" />
        <circle cx="-48" cy="-172" r="12" fill="#ffc29a" stroke="#1b1033" stroke-width="4" />
        <circle cx="48" cy="-172" r="12" fill="#ffc29a" stroke="#1b1033" stroke-width="4" />
        <path d="M-50 -218 Q-70 -270 -30 -280 Q-20 -320 10 -306 Q40 -326 54 -290 Q84 -270 54 -222 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
        <rect x="-50" y="-230" width="104" height="24" rx="6" fill="#fffaf0" stroke="#1b1033" stroke-width="5" />
        <path d="M-30 -284 Q-20 -296 -6 -294" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M-22 -184 Q-16 -192 -8 -184 M8 -184 Q16 -192 22 -184" stroke="#1b1033" stroke-width="4" fill="none" stroke-linecap="round" />
        <ellipse cx="-30" cy="-164" rx="9" ry="5" fill="#ff7a8a" opacity="0.6" />
        <ellipse cx="30" cy="-164" rx="9" ry="5" fill="#ff7a8a" opacity="0.6" />
        <path d="M0 -164 Q-24 -172 -40 -152 Q-24 -150 0 -156 Q24 -150 40 -152 Q24 -172 0 -164 Z" fill="#5a2f1c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <circle cx="0" cy="-170" r="8" fill="#ffb08a" stroke="#1b1033" stroke-width="3" />
        <path d="M-8 -144 Q0 -136 8 -144" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M78 -40 Q100 -56 106 -82" stroke="#1b1033" stroke-width="30" fill="none" stroke-linecap="round" />
        <path d="M78 -40 Q100 -56 106 -82" stroke="#fffaf0" stroke-width="22" fill="none" stroke-linecap="round" />
        <path d="M106 -90 L136 -98" stroke="#1b1033" stroke-width="9" stroke-linecap="round" />
        <path d="M106 -90 L136 -98" stroke="#4a4a5a" stroke-width="4" stroke-linecap="round" />
        <circle cx="106" cy="-88" r="14" fill="#ffd2b0" stroke="#1b1033" stroke-width="4" />
        <ellipse cx="160" cy="-104" rx="30" ry="10" fill="#3a3a4a" stroke="#1b1033" stroke-width="4" />
        <path d="M138 -108 Q160 -114 180 -108" stroke="#7a7a8a" stroke-width="3" fill="none" stroke-linecap="round" />
        <g class="restaurant-flip">
          <ellipse cx="160" cy="-118" rx="22" ry="7" fill="#f2b84a" stroke="#1b1033" stroke-width="4" />
          <path d="M148 -120 Q156 -124 166 -122" stroke="#ffe08a" stroke-width="3" fill="none" stroke-linecap="round" />
        </g>
      </g>
      <rect x="1430" y="556" width="472" height="26" rx="5" fill="url(#restaurant-steel)" stroke="#1b1033" stroke-width="5" />
      <path d="M1450 564 H1880" stroke="#fff" stroke-width="3" opacity="0.8" />
      <g transform="translate(1510 556)">
        <path d="M-40 0 V-44 H40 V0 Z" fill="url(#restaurant-steel)" stroke="#1b1033" stroke-width="4" />
        <path d="M-46 -44 H46 M-52 -30 h12 M40 -30 h12" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
        <path d="M-30 -36 V-8" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
        <path v-for="j in 2" :key="`ks${j}`" :d="`M${-16 + (j - 1) * 30} -52 q-10 -20 0 -40 q10 -20 0 -40`" stroke="#fffaf0" stroke-width="6" fill="none" stroke-linecap="round" class="rest-steam" :style="{ animationDelay: `-${j * 1.3}s` }" />
      </g>
      <g transform="translate(1820 556)">
        <ellipse cx="0" cy="-4" rx="42" ry="9" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
        <path d="M-34 -8 Q-34 -50 0 -54 Q34 -50 34 -8 Z" fill="url(#restaurant-steel)" stroke="#1b1033" stroke-width="4" />
        <circle cx="0" cy="-58" r="6" fill="#c7d0dc" stroke="#1b1033" stroke-width="3" />
        <path d="M-20 -30 Q-16 -42 -4 -46" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="l in LAMPS" :key="`lamp${l.x}`" :transform="`translate(${l.x} 0)`">
      <g class="rest-lamp" :style="{ animationDelay: `-${l.d}s` }">
        <path :d="`M0 -20 V${l.len}`" stroke="#1b1033" stroke-width="4" />
        <path :d="`M-72 ${l.len + 56} Q-64 ${l.len} 0 ${l.len - 4} Q64 ${l.len} 72 ${l.len + 56} Z`" fill="url(#restaurant-copper)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path :d="`M-44 ${l.len + 36} Q-36 ${l.len + 14} -12 ${l.len + 8}`" stroke="#ffd0a0" stroke-width="5" fill="none" stroke-linecap="round" />
        <rect x="-10" :y="l.len - 16" width="20" height="16" rx="3" fill="#3a2a2a" stroke="#1b1033" stroke-width="3" />
        <ellipse cx="0" :cy="l.len + 58" rx="30" ry="12" fill="#fff3b0" stroke="#1b1033" stroke-width="3" />
      </g>
    </g>

    <g v-for="(t, ti) in TABLES" :key="`tb${ti}`" :transform="`translate(${t.x} ${t.y}) scale(${t.k})`">
      <ellipse cx="0" cy="176" rx="210" ry="24" fill="#2a0c12" opacity="0.35" />
      <g v-if="!t.near" stroke="#1b1033" stroke-width="6" fill="none" stroke-linecap="round">
        <path d="M-150 20 V-90 Q-150 -130 -110 -130 Q-70 -130 -70 -90 V0" />
        <path d="M70 0 V-90 Q70 -130 110 -130 Q150 -130 150 -90 V20" />
      </g>
      <g v-if="!t.near" stroke="#8a4a2a" stroke-width="10" fill="none" stroke-linecap="round">
        <path d="M-150 20 V-90 Q-150 -130 -110 -130 Q-70 -130 -70 -90 V0" />
        <path d="M70 0 V-90 Q70 -130 110 -130 Q150 -130 150 -90 V20" />
        <path d="M-130 -60 H-90 M90 -60 H130" stroke-width="6" />
      </g>
      <path d="M-170 10 Q-200 100 -186 176 Q-150 160 -120 176 Q-80 160 -40 178 Q0 162 40 178 Q80 160 120 176 Q150 160 186 176 Q200 100 170 10 Z" fill="url(#restaurant-gingham)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-120 40 Q-130 110 -120 170 M-40 50 Q-44 120 -40 172 M40 50 Q44 120 40 172 M120 40 Q130 110 120 170" stroke="#1b1033" stroke-width="3" fill="none" opacity="0.25" />
      <ellipse cx="0" cy="0" rx="172" ry="40" fill="#fffaf0" stroke="#1b1033" stroke-width="5" />
      <path d="M-120 -16 Q-60 -34 10 -34" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9" />
      <ellipse cx="-56" cy="2" rx="58" ry="16" fill="#fff" stroke="#1b1033" stroke-width="4" />
      <ellipse cx="-56" cy="0" rx="38" ry="10" fill="#e8dcc8" />
      <path d="M-84 -2 Q-70 -26 -54 -14 Q-40 -30 -28 -6 Q-50 6 -84 -2 Z" fill="#ffd36b" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-74 -8 q8 -8 14 0 q6 -10 14 0" stroke="#e8a83a" stroke-width="2.5" fill="none" />
      <circle cx="-58" cy="-16" r="8" fill="#a8402a" stroke="#1b1033" stroke-width="3" />
      <circle cx="-44" cy="-10" r="7" fill="#a8402a" stroke="#1b1033" stroke-width="3" />
      <path d="M-70 -14 q4 4 10 0" stroke="#e23b3b" stroke-width="4" fill="none" stroke-linecap="round" />
      <g transform="translate(20 -4)">
        <path d="M-14 -70 Q-16 -40 0 -36 Q16 -40 14 -70 Z" fill="#fffaf0" fill-opacity="0.35" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M-13 -54 Q-12 -40 0 -38 Q12 -40 13 -54 Z" fill="#a8243e" />
        <path d="M0 -36 V-4 M-12 -2 H12" stroke="#1b1033" stroke-width="3.5" stroke-linecap="round" />
        <path d="M-8 -64 V-52" stroke="#fff" stroke-width="3" stroke-linecap="round" />
      </g>
      <g transform="translate(86 0)">
        <ellipse cx="0" cy="40" rx="40" ry="10" fill="#ffd27a" opacity="0.18" />
        <path d="M-16 0 V-34 Q-16 -46 -6 -50 V-66 H6 V-50 Q16 -46 16 -34 V0 Z" fill="#2f7a4a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M-9 -6 V-34" stroke="#8adca0" stroke-width="3" stroke-linecap="round" opacity="0.6" />
        <rect x="-5" y="-96" width="10" height="32" fill="#fffaf0" stroke="#1b1033" stroke-width="3" />
        <path d="M-5 -70 q-4 6 -2 12 M5 -74 q4 4 2 14" stroke="#fffaf0" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cx="0" cy="-114" r="22" fill="#ffd23f" fill-opacity="0.2" />
        <g class="fire" :style="{ animationDelay: `-${ti * 0.13}s` }">
          <path d="M0 -96 Q-10 -110 0 -128 Q10 -110 0 -96 Z" fill="#ff7a2f" stroke="#1b1033" stroke-width="2.5" />
          <path d="M0 -98 Q-5 -108 0 -118 Q5 -108 0 -98 Z" fill="#ffe14d" />
        </g>
      </g>
      <template v-if="t.near">
        <path v-for="j in 2" :key="j" :d="`M${-68 + (j - 1) * 24} -30 q-10 -22 0 -44 q10 -22 0 -44`" stroke="#fffaf0" stroke-width="5" fill="none" stroke-linecap="round" class="rest-steam" :style="{ animationDelay: `-${j * 1.4 + ti * 0.5}s` }" />
      </template>
    </g>

    <g fill="none" stroke-linecap="round" transform="translate(-70 70)">
      <path d="M-40 1160 V900 Q-40 800 60 800 Q160 800 160 900 V1160" stroke="#0e0208" stroke-width="40" />
      <path d="M-40 1160 V900 Q-40 800 60 800 Q160 800 160 900 V1160" stroke="#24081a" stroke-width="30" />
      <path d="M0 1160 V920 Q0 850 60 850 Q120 850 120 920 V1160" stroke="#0e0208" stroke-width="22" />
      <path d="M0 1160 V920 Q0 850 60 850 Q120 850 120 920 V1160" stroke="#24081a" stroke-width="14" />
      <path d="M-30 820 Q20 812 50 812" stroke="#5a2a3a" stroke-width="6" />
    </g>
    <g fill="#24081a" stroke="#0e0208" stroke-width="5" stroke-linejoin="round">
      <path d="M1980 1140 Q1960 930 1810 870 Q1880 1000 1850 1140 Z" />
      <path d="M1980 1140 Q1890 1010 1720 1010 Q1800 1070 1790 1140 Z" />
      <path d="M1980 960 Q1930 870 1880 800 Q1910 900 1910 990 Z" />
    </g>
  </g>
</template>

<style scoped>
.restaurant-flip {
  animation: restaurant-flip 2.6s infinite;
  transform-box: fill-box;
  transform-origin: center;
}

/* per-keyframe easing so the pancake slows at the top of its arc */
@keyframes restaurant-flip {
  0%,
  40% {
    translate: 0 0;
    rotate: 0deg;
    animation-timing-function: ease-out;
  }
  70% {
    translate: 0 -90px;
    rotate: 180deg;
    animation-timing-function: ease-in;
  }
  100% {
    translate: 0 0;
    rotate: 360deg;
  }
}
</style>
