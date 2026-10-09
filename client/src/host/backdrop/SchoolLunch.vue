<script setup lang="ts">
import { strokeText } from './kit';

const f1 = (n: number) => n.toFixed(1);
const VP = { x: 960, y: 360 };

const TILES = (() => {
  let d = '';
  for (let y = 380; y < 620; y += 40) d += `M-60 ${y} H1980 `;
  for (let x = -40; x < 1980; x += 40) d += `M${x} 380 V620 `;
  return d;
})();
const CHECKS = (() => {
  // floor tiles: rows shrink toward the counter, columns converge on the vanishing point
  const rows = [700, 740, 790, 850, 924, 1012, 1120];
  let d = '';
  for (let r = 0; r < rows.length - 1; r++) {
    const y0 = rows[r]!;
    const y1 = rows[r + 1]!;
    for (let c = -14; c < 14; c++) {
      if ((r + c) % 2 === 0) continue;
      const x = (o: number, y: number) => f1(VP.x + o * 0.3 * (y - VP.y));
      d += `M${x(c, y0)} ${y0} L${x(c + 1, y0)} ${y0} L${x(c + 1, y1)} ${y1} L${x(c, y1)} ${y1} Z `;
    }
  }
  return d;
})();
const SIGN = strokeText('Столовая', 960, 150, 64, 'middle');
const MENU = strokeText('Меню', 254, 136, 40, 'middle');
const POTS = [
  { x: 640, c: '#c9d4f2', lid: '#8b9dd8' },
  { x: 860, c: '#ff8a5a', lid: '#d8502a' },
  { x: 1080, c: '#c9d4f2', lid: '#8b9dd8' },
  { x: 1290, c: '#ffd23f', lid: '#e09a1c' },
];
const GLASSES = Array.from({ length: 7 }, (_, i) => 1520 + i * 52);
const BUNS = [
  { x: 470, y: 590 },
  { x: 520, y: 584 },
  { x: 495, y: 562 },
];
const TRAYS = [
  { x: 320, y: 960, k: 1, r: -4, soup: '#ff8a5a' },
  { x: 1610, y: 966, k: 1.05, r: 5, soup: '#ffd23f' },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="school-lunch-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff0d2" />
        <stop offset="100%" stop-color="#f6d6a2" />
      </linearGradient>
      <linearGradient id="school-lunch-tile" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c8f0e8" />
        <stop offset="100%" stop-color="#8fd0c4" />
      </linearGradient>
      <linearGradient id="school-lunch-counter" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8eefc" />
        <stop offset="100%" stop-color="#a6b4dc" />
      </linearGradient>
      <linearGradient id="school-lunch-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4fb8a8" />
        <stop offset="100%" stop-color="#2a7a72" />
      </linearGradient>
      <linearGradient id="school-lunch-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f6e6c4" />
        <stop offset="100%" stop-color="#e0c08a" />
      </linearGradient>
      <linearGradient id="school-lunch-table" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffd9a0" />
        <stop offset="100%" stop-color="#e0a464" />
      </linearGradient>
      <linearGradient id="school-lunch-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0a464" />
        <stop offset="100%" stop-color="#a86a36" />
      </linearGradient>
      <linearGradient id="school-lunch-tray" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff9ab0" />
        <stop offset="100%" stop-color="#e0507a" />
      </linearGradient>
      <linearGradient id="school-lunch-compote" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffb0c8" />
        <stop offset="100%" stop-color="#d84a6a" />
      </linearGradient>
      <radialGradient id="school-lunch-bun" cx="40%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffe0a0" />
        <stop offset="100%" stop-color="#d8862e" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="800" fill="url(#school-lunch-wall)" />
    <path d="M-60 0 H1980" stroke="#e0b884" stroke-width="10" />
    <rect x="-60" y="380" width="2040" height="320" fill="url(#school-lunch-tile)" />
    <path :d="TILES" stroke="#6ab4a8" stroke-width="3" opacity="0.6" />
    <rect x="-60" y="366" width="2040" height="16" fill="url(#school-lunch-wood)" stroke="#1b1033" stroke-width="4" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="620" y="60" width="680" height="120" rx="16" fill="#e8553f" stroke-width="6" filter="url(#cel-s)" />
      <path d="M700 40 V60 M1220 40 V60" stroke-width="5" />
    </g>
    <path :d="SIGN" fill="none" stroke="#fff6e0" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="100" y="70" width="310" height="270" rx="8" fill="url(#school-lunch-wood)" stroke-width="6" filter="url(#cel-s)" />
      <rect x="120" y="90" width="270" height="230" rx="4" fill="#2a5a46" stroke-width="4" />
    </g>
    <path :d="MENU" fill="none" stroke="#fffbe0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <g fill="none" stroke="#f4fff8" stroke-width="5" stroke-linecap="round" opacity="0.85">
      <circle cx="160" cy="190" r="14" />
      <path d="M190 190 H360 M160 240 h0.1 M190 240 H330 M160 290 h0.1 M190 290 H350" />
      <path d="M150 236 q10 -10 20 0 q-10 10 -20 0 M148 284 h24 l-4 14 h-16 Z" />
    </g>

    <g transform="translate(1640 90)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-90" y="0" width="300" height="250" rx="10" fill="#fffaf0" stroke-width="6" filter="url(#cel-s)" />
      <rect x="-70" y="20" width="260" height="210" rx="6" fill="#bfe6ff" stroke-width="4" />
      <path d="M60 20 V230 M-70 125 H190" stroke-width="6" />
      <circle cx="140" cy="70" r="30" fill="#ffe14d" stroke-width="4" />
      <path d="M-60 200 Q0 170 50 196 M70 210 Q130 180 186 200" stroke="#7ed06a" stroke-width="16" fill="none" stroke-linecap="round" />
    </g>

    <rect x="-60" y="700" width="2040" height="440" fill="url(#school-lunch-floor)" />
    <path :d="CHECKS" fill="#d8a86a" opacity="0.55" />
    <path d="M-60 700 H1980" stroke="#1b1033" stroke-width="4" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="300" y="610" width="1360" height="110" fill="url(#school-lunch-front)" stroke-width="6" filter="url(#cel)" />
      <path d="M340 640 V700 M500 640 V700 M660 640 V700 M820 640 V700 M980 640 V700 M1140 640 V700 M1300 640 V700 M1460 640 V700 M1620 640 V700" stroke="#2a6a62" stroke-width="4" opacity="0.6" />
      <rect x="280" y="590" width="1400" height="26" rx="6" fill="url(#school-lunch-counter)" stroke-width="5" />
      <path d="M300 598 H1600" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      <path d="M280 560 H1680" stroke-width="12" stroke-linecap="round" />
      <path d="M280 560 H1680" stroke="#dfe6f8" stroke-width="6" stroke-linecap="round" />
      <path d="M300 560 V590 M1660 560 V590 M760 560 V590 M1200 560 V590" stroke-width="5" />
    </g>

    <g v-for="(p, i) in POTS" :key="`pt${i}`" :transform="`translate(${p.x} 590)`" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-74 0 V-70 Q-74 -80 -64 -80 H64 Q74 -80 74 -70 V0 Z" :fill="p.c" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-90 -64 H-74 M74 -64 H90" stroke-width="10" stroke-linecap="round" />
      <path d="M-80 -80 Q0 -112 80 -80 Z" :fill="p.lid" stroke-width="5" />
      <circle cy="-106" r="9" :fill="p.lid" stroke-width="4" />
      <path d="M-56 -60 V-14" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.6" />
    </g>
    <g v-for="(p, i) in POTS" :key="`sm${i}`" class="school-lunch-steam" :style="{ animationDelay: `-${i * 0.8}s` }">
      <path :d="`M${p.x - 24} 470 q-14 -24 0 -48 q14 -24 0 -48 M${p.x + 22} 466 q-14 -22 0 -44 q14 -22 0 -44`" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="495" cy="592" rx="70" ry="10" fill="#c9d4f2" stroke-width="4" />
      <path v-for="(b, i) in BUNS" :key="`bn${i}`" :d="`M${b.x - 32} ${b.y} Q${b.x - 32} ${b.y - 36} ${b.x} ${b.y - 36} Q${b.x + 32} ${b.y - 36} ${b.x + 32} ${b.y} Z`" fill="url(#school-lunch-bun)" stroke-width="4" />
      <path d="M455 570 h0.1 M478 580 h0.1 M510 548 h0.1 M534 572 h0.1" stroke="#fff6e0" stroke-width="5" stroke-linecap="round" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <g v-for="(x, i) in GLASSES" :key="`gl${i}`" :transform="`translate(${x - 1520 + 1440} 590)`">
        <path d="M-18 0 L-22 -58 H22 L18 0 Z" fill="#eaf6ff" stroke-width="4" />
        <path d="M-18 -4 L-20 -40 H20 L18 -4 Z" fill="url(#school-lunch-compote)" />
        <circle cx="-4" cy="-16" r="6" fill="#ffd23f" stroke-width="2.5" />
        <circle cx="8" cy="-26" r="5" fill="#b0306a" stroke-width="2.5" />
        <path d="M-12 -50 V-12" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>

    <g v-for="x in [520, 1400]" :key="`lp${x}`" class="school-lunch-lamp" :style="{ transformOrigin: `${x}px 0px` }">
      <path :d="`M${x} 0 V250`" stroke="#1b1033" stroke-width="5" />
      <path :d="`M${x - 60} 290 Q${x - 60} 250 ${x} 246 Q${x + 60} 250 ${x + 60} 290 Z`" fill="#4fb8a8" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <ellipse :cx="x" cy="292" rx="22" ry="8" fill="#fff6c0" stroke="#1b1033" stroke-width="3" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M60 1030 V1140 M520 1030 V1140 M1400 1030 V1140 M1860 1030 V1140" stroke-width="26" />
      <path d="M60 1030 V1140 M520 1030 V1140 M1400 1030 V1140 M1860 1030 V1140" stroke="#7a8aa8" stroke-width="14" />
      <path d="M-80 1000 H640 L590 850 H-80 Z" fill="url(#school-lunch-table)" stroke-width="6" />
      <rect x="-80" y="1000" width="740" height="32" rx="6" fill="url(#school-lunch-wood)" stroke-width="6" filter="url(#cel-s)" />
      <path d="M1280 1000 H2000 V850 H1330 Z" fill="url(#school-lunch-table)" stroke-width="6" />
      <rect x="1260" y="1000" width="740" height="32" rx="6" fill="url(#school-lunch-wood)" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-40 870 H560 M1360 870 H1960" stroke="#fff6e0" stroke-width="5" stroke-linecap="round" opacity="0.7" />
    </g>

    <g v-for="(t, i) in TRAYS" :key="`tr${i}`" :transform="`translate(${t.x} ${t.y}) rotate(${t.r}) scale(${t.k})`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="24" rx="200" ry="22" fill="#5a2a10" opacity="0.25" stroke="none" />
      <path d="M-190 -80 H190 L210 20 H-210 Z" fill="url(#school-lunch-tray)" stroke-width="6" />
      <path d="M-170 -64 H170 L184 6 H-184 Z" fill="#ffc0d0" stroke-width="3" />
      <ellipse cx="-90" cy="-28" rx="70" ry="30" fill="#fffaf0" stroke-width="5" />
      <ellipse cx="-90" cy="-32" rx="54" ry="20" :fill="t.soup" stroke-width="3" />
      <path d="M-110 -36 h0.1 M-80 -28 h0.1 M-70 -40 h0.1" stroke="#fff" stroke-width="7" stroke-linecap="round" />
      <path d="M-20 -40 L40 -110" stroke-width="10" stroke-linecap="round" />
      <path d="M-20 -40 L40 -110" stroke="#c9d4f2" stroke-width="5" stroke-linecap="round" />
      <path d="M40 0 Q40 -50 80 -50 Q120 -50 120 0 Z" fill="url(#school-lunch-bun)" stroke-width="5" />
      <path d="M60 -30 Q80 -42 100 -30" stroke="#fff3c0" stroke-width="5" fill="none" stroke-linecap="round" />
      <g transform="translate(160 -6)">
        <path d="M-26 0 L-32 -96 H32 L26 0 Z" fill="#eaf6ff" stroke-width="5" />
        <path d="M-26 -6 L-29 -66 H29 L26 -6 Z" fill="url(#school-lunch-compote)" />
        <circle cx="-6" cy="-24" r="9" fill="#ffd23f" stroke-width="3" />
        <circle cx="10" cy="-44" r="7" fill="#b0306a" stroke-width="3" />
        <path d="M-18 -84 V-16" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
        <path d="M10 -96 L30 -140" stroke-width="8" stroke-linecap="round" />
        <path d="M10 -96 L30 -140" stroke="#4fb8ff" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.school-lunch-steam {
  animation: school-lunch-steam 3s ease-out infinite;
}

.school-lunch-lamp {
  animation: school-lunch-lamp 5s ease-in-out infinite alternate;
}

@keyframes school-lunch-steam {
  from {
    translate: 0 10px;
    opacity: 0;
  }
  30% {
    opacity: 0.9;
  }
  to {
    translate: 0 -60px;
    opacity: 0;
  }
}

@keyframes school-lunch-lamp {
  from {
    rotate: -1.5deg;
  }
  to {
    rotate: 1.5deg;
  }
}
</style>
