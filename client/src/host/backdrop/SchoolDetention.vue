<script setup lang="ts">
import { seeded, strokeText } from './kit';

const rnd = seeded(5150);
const f1 = (n: number) => n.toFixed(1);
const VP = { x: 960, y: 330 };
const WALL_FOOT = 660;

// after lessons every chair goes up on its desk, legs in the air, backrest hanging over our side
function desk(o: number, y: number) {
  const k = (y - VP.y) / 670;
  const at = (ox: number, yy: number) => VP.x + ox * (yy - VP.y);
  const w = 0.36;
  const yb = y - 70 * k;
  const top = `M${f1(at(o - w, y))} ${f1(y)} L${f1(at(o + w, y))} ${f1(y)} L${f1(at(o + w, yb))} ${f1(yb)} L${f1(at(o - w, yb))} ${f1(yb)} Z`;
  const xl = at(o - w, y);
  const xr = at(o + w, y);
  const legs = `M${f1(xl + 16 * k)} ${f1(y + 14 * k)} V${f1(y + 150 * k)} M${f1(xr - 16 * k)} ${f1(y + 14 * k)} V${f1(y + 150 * k)}`;
  const cx = at(o, y);
  const seatY = y - 40 * k;
  const chairLegs = `M${f1(cx - 80 * k)} ${f1(seatY)} V${f1(seatY - 120 * k)} M${f1(cx + 80 * k)} ${f1(seatY)} V${f1(seatY - 120 * k)} M${f1(cx - 64 * k)} ${f1(seatY - 30 * k)} V${f1(seatY - 136 * k)} M${f1(cx + 64 * k)} ${f1(seatY - 30 * k)} V${f1(seatY - 136 * k)} M${f1(cx - 70 * k)} ${f1(seatY)} V${f1(y + 30 * k)} M${f1(cx + 70 * k)} ${f1(seatY)} V${f1(y + 30 * k)}`;
  return { top, legs, xl, w: xr - xl, y, k, cx, seatY, chairLegs };
}
const ROWS = [
  [-1.55, -0.55, 0.55, 1.55].map((o) => desk(o, 720)),
  [-1.5, -0.55, 0.55, 1.5].map((o) => desk(o, 900)),
];
const CHAIR_COLORS = ['#4a7ad8', '#e8553f', '#5fb04a', '#ffb02e'];

const PLANKS = Array.from({ length: 33 }, (_, i) => -1960 + i * 180)
  .map((x) => `M${x} ${WALL_FOOT} L${f1(VP.x + ((x - VP.x) * (1140 - VP.y)) / (WALL_FOOT - VP.y))} 1140`)
  .join(' ');
const LINES = [0, 1, 2, 3].map((i) => strokeText('Я больше не буду', 620 + (i % 2) * 14, 160 + i * 62, 40));
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);
const DUST = [0, 1, 2].map(() => Array.from({ length: 8 }, () => ({ x: 200 + rnd() * 900, y: 260 + rnd() * 600, r: 1.6 + rnd() * 2.4 })));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="school-detention-wall" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#ffd2a8" />
        <stop offset="100%" stop-color="#f09a7a" />
      </linearGradient>
      <linearGradient id="school-detention-wains" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c28a9a" />
        <stop offset="100%" stop-color="#8a5a7a" />
      </linearGradient>
      <linearGradient id="school-detention-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6a4aa8" />
        <stop offset="45%" stop-color="#ff7a6a" />
        <stop offset="100%" stop-color="#ffd27a" />
      </linearGradient>
      <radialGradient id="school-detention-sun">
        <stop offset="0%" stop-color="#fff6c0" />
        <stop offset="60%" stop-color="#ffc24a" />
        <stop offset="100%" stop-color="#ff8a3a" />
      </radialGradient>
      <linearGradient id="school-detention-board" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3a7d5c" />
        <stop offset="100%" stop-color="#1d4a36" />
      </linearGradient>
      <linearGradient id="school-detention-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0a464" />
        <stop offset="100%" stop-color="#a86a36" />
      </linearGradient>
      <linearGradient id="school-detention-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b47640" />
        <stop offset="100%" stop-color="#7a4422" />
      </linearGradient>
      <linearGradient id="school-detention-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c8805a" />
        <stop offset="100%" stop-color="#7a3e30" />
      </linearGradient>
      <linearGradient id="school-detention-desk" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffc890" />
        <stop offset="100%" stop-color="#d08a5a" />
      </linearGradient>
      <linearGradient id="school-detention-shaft" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffd27a" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#ffd27a" stop-opacity="0" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="760" fill="url(#school-detention-wall)" />
    <rect x="-60" y="500" width="2040" height="160" fill="url(#school-detention-wains)" />
    <rect x="-60" y="488" width="2040" height="16" fill="url(#school-detention-wood)" stroke="#1b1033" stroke-width="4" />
    <rect x="-60" y="636" width="2040" height="24" fill="url(#school-detention-dark)" stroke="#1b1033" stroke-width="4" />

    <rect x="1490" y="90" width="420" height="380" fill="url(#school-detention-sky)" />
    <circle cx="1700" cy="380" r="120" fill="#fff0b0" opacity="0.25" class="school-detention-glow" />
    <circle cx="1700" cy="380" r="74" fill="url(#school-detention-sun)" stroke="#1b1033" stroke-width="4" />
    <path d="M1490 420 Q1560 380 1640 404 Q1720 370 1800 400 Q1860 380 1910 396 V470 H1490 Z" fill="#7a3a7a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M1530 404 V340 H1570 V404 M1590 400 V310 H1620 V400 M1820 396 V330 H1860 V396" fill="#5a2a6a" stroke="#1b1033" stroke-width="4" />
    <path d="M1540 180 Q1580 160 1620 176 M1760 150 Q1800 134 1850 150" stroke="#ffb0a0" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.7" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1474" y="74" width="452" height="412" rx="10" fill="none" stroke-width="30" />
      <rect x="1474" y="74" width="452" height="412" rx="10" fill="none" stroke="#fffaf0" stroke-width="20" />
      <path d="M1700 90 V470 M1490 260 H1910" stroke-width="16" />
      <path d="M1700 90 V470 M1490 260 H1910" stroke="#fffaf0" stroke-width="9" />
      <path d="M1460 480 H1940 L1956 506 H1444 Z" fill="#fffaf0" stroke-width="5" filter="url(#cel-s)" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="560" y="80" width="800" height="330" rx="10" fill="url(#school-detention-wood)" stroke-width="6" filter="url(#cel)" />
      <rect x="584" y="102" width="752" height="286" rx="4" fill="url(#school-detention-board)" stroke-width="4" />
      <rect x="570" y="400" width="780" height="18" rx="4" fill="url(#school-detention-dark)" stroke-width="4" />
      <rect x="1180" y="378" width="72" height="22" rx="4" fill="#5a3a2a" stroke-width="3.5" />
      <rect x="1180" y="390" width="72" height="10" fill="#e8e0f0" stroke-width="3" />
    </g>
    <path :d="LINES.join(' ')" fill="none" stroke="#f4fff8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" />
    <path d="M1100 360 q20 -10 40 0 q20 10 40 0" stroke="#f4fff8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5" />

    <g transform="translate(300 230)" stroke="#1b1033">
      <circle r="92" fill="#e8553f" stroke-width="6" filter="url(#cel-s)" />
      <circle r="74" fill="#fffaf0" stroke-width="4" />
      <path v-for="a in TICKS" :key="`tk${a}`" :d="a % 90 === 0 ? 'M0 -66 V-52' : 'M0 -66 V-58'" :transform="`rotate(${a})`" :stroke-width="a % 90 === 0 ? 6 : 3" stroke-linecap="round" />
      <path d="M0 0 L-4 40" stroke-width="8" stroke-linecap="round" />
      <g class="school-detention-hand">
        <path d="M0 6 V-56" stroke-width="5" stroke-linecap="round" />
      </g>
      <circle r="7" fill="#ffd23f" stroke-width="3" />
    </g>

    <path d="M-60 660 H1980 V1140 H-60 Z" fill="url(#school-detention-floor)" />
    <path :d="PLANKS" stroke="#5a2a1e" stroke-width="3" opacity="0.4" />
    <path d="M-60 660 H1980" stroke="#1b1033" stroke-width="4" />

    <g class="school-detention-shaft">
      <path d="M1474 90 L1700 90 L520 1140 L-60 1140 L-60 1000 Z M1700 260 L1910 260 L1100 1140 L700 1140 Z" fill="url(#school-detention-shaft)" opacity="0.45" />
    </g>

    <g v-for="(row, ri) in ROWS" :key="`r${ri}`" stroke="#1b1033" stroke-linejoin="round">
      <g v-for="(d, di) in row" :key="`d${di}`">
        <ellipse :cx="d.cx" :cy="d.y + 150 * d.k" :rx="d.w * 0.7" :ry="16 * d.k" fill="#3a1420" opacity="0.3" stroke="none" />
        <path :d="d.legs" :stroke-width="14 * d.k + 2" stroke-linecap="round" />
        <path :d="d.legs" stroke="#7a8aa8" :stroke-width="7 * d.k" stroke-linecap="round" />
        <path :d="d.top" fill="url(#school-detention-desk)" :stroke-width="4 * d.k + 1" />
        <rect :x="d.xl" :y="d.y" :width="d.w" :height="18 * d.k" :rx="4 * d.k" fill="url(#school-detention-wood)" :stroke-width="4 * d.k + 1" />
        <path :d="d.chairLegs" :stroke-width="12 * d.k + 2" stroke-linecap="round" />
        <path :d="d.chairLegs" stroke="#9aa8c8" :stroke-width="6 * d.k" stroke-linecap="round" />
        <rect :x="d.cx - 96 * d.k" :y="d.seatY - 8 * d.k" :width="192 * d.k" :height="22 * d.k" :rx="8 * d.k" :fill="CHAIR_COLORS[(ri + di) % 4]" :stroke-width="4 * d.k + 1.5" />
        <rect :x="d.cx - 90 * d.k" :y="d.y + 22 * d.k" :width="180 * d.k" :height="62 * d.k" :rx="14 * d.k" :fill="CHAIR_COLORS[(ri + di) % 4]" :stroke-width="4 * d.k + 1.5" />
        <path :d="`M${d.cx - 74 * d.k} ${d.y + 38 * d.k} H${d.cx + 20 * d.k}`" stroke="#fff" :stroke-width="5 * d.k" stroke-linecap="round" opacity="0.5" />
      </g>
    </g>

    <g transform="translate(1660 1010)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="20" cy="70" rx="130" ry="16" fill="#3a1420" opacity="0.3" stroke="none" />
      <path d="M-60 70 Q-80 -80 20 -84 Q120 -80 100 70 Q20 84 -60 70 Z" fill="#4a7ad8" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-40 10 Q20 0 80 10 L78 66 H-38 Z" fill="#3f6ad0" stroke-width="5" />
      <path d="M-10 -84 Q20 -124 50 -84" fill="none" stroke-width="9" />
      <circle cx="20" cy="18" r="9" fill="#ffd23f" stroke-width="3.5" />
    </g>
    <g transform="translate(240 1040) rotate(-8)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-120 0 L-90 -50 H120 L100 0 Z" fill="#fffaf0" stroke-width="5" />
      <path d="M0 -50 L-6 0" stroke-width="3" />
      <path d="M-80 -24 H-20 M20 -36 H90 M16 -20 H80" stroke="#9ab0d8" stroke-width="4" />
      <path d="M40 -10 l10 -10 l10 10" stroke="#e8553f" stroke-width="6" fill="none" stroke-linecap="round" />
    </g>

    <g v-for="(g, i) in DUST" :key="`ds${i}`" class="school-detention-dust" :style="{ animationDelay: `-${i * 2.3}s` }" fill="#fff0c0">
      <circle v-for="(s, j) in g" :key="j" :cx="s.x" :cy="s.y" :r="s.r" />
    </g>
  </g>
</template>

<style scoped>
.school-detention-hand {
  animation: school-detention-spin 90s linear infinite;
}

.school-detention-glow {
  transform-box: fill-box;
  transform-origin: center;
  animation: school-detention-glow 4s ease-in-out infinite alternate;
}

.school-detention-shaft {
  animation: school-detention-shaft 6s ease-in-out infinite alternate;
}

.school-detention-dust {
  animation: school-detention-dust 8s ease-in-out infinite alternate;
}

@keyframes school-detention-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes school-detention-glow {
  from {
    scale: 0.9;
    opacity: 0.6;
  }
  to {
    scale: 1.1;
    opacity: 1;
  }
}

@keyframes school-detention-shaft {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

@keyframes school-detention-dust {
  0% {
    translate: 0 0;
    opacity: 0.2;
  }
  50% {
    opacity: 0.85;
  }
  100% {
    translate: -24px -36px;
    opacity: 0.3;
  }
}
</style>
