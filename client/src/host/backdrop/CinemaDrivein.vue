<script setup lang="ts">
import { seeded, strokeText, twinkleGroups } from './kit';

const rnd = seeded(1955);
const f1 = (n: number) => n.toFixed(1);
const circ = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;
const STARS = twinkleGroups(Array.from({ length: 100 }, () => ({ x: rnd() * 1920, y: rnd() * 600, r: 0.9 + rnd() * 2.2 }))).map((g) => g.map((s) => circ(s.x, s.y, s.r)).join(' '));
const SIGN = strokeText('Кино', 1660, 650, 44, 'middle');
const CARS = [
  { x: 330, y: 840, k: 0.7, c: '#ff4f6d', kid: true },
  { x: 760, y: 820, k: 0.66, c: '#3ad6e0', kid: false },
  { x: 1170, y: 820, k: 0.66, c: '#ffd23f', kid: true },
  { x: 1580, y: 840, k: 0.7, c: '#8a6bff', kid: false },
  { x: 120, y: 1040, k: 1.05, c: '#5fd06a', kid: true },
  { x: 960, y: 1060, k: 1.15, c: '#ff8a2f', kid: true },
  { x: 1800, y: 1040, k: 1.05, c: '#4a7ad8', kid: false },
];
const POSTS = [540, 960, 1380];
const BULBS = Array.from({ length: 9 }, (_, i) => ({ x: 1530 + (i % 9) * 32, y: 590 }));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="cinema-drivein-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#070f38" />
        <stop offset="60%" stop-color="#2a1a5e" />
        <stop offset="100%" stop-color="#6a2f7e" />
      </linearGradient>
      <linearGradient id="cinema-drivein-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2f3a6a" />
        <stop offset="100%" stop-color="#141838" />
      </linearGradient>
      <linearGradient id="cinema-drivein-film" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6ab8ff" />
        <stop offset="100%" stop-color="#d8f0ff" />
      </linearGradient>
      <linearGradient id="cinema-drivein-beam" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#fff6d0" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#fff6d0" stop-opacity="0.05" />
      </linearGradient>
      <radialGradient id="cinema-drivein-glow">
        <stop offset="0%" stop-color="#bfe6ff" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#bfe6ff" stop-opacity="0" />
      </radialGradient>
      <clipPath id="cinema-drivein-screen"><rect x="560" y="130" width="800" height="420" rx="6" /></clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#cinema-drivein-sky)" />
    <path v-for="(d, gi) in STARS" :key="`st${gi}`" :d="d" fill="#fff6dc" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" />
    <circle cx="240" cy="170" r="110" fill="#fff4c2" opacity="0.08" />
    <path d="M250 100 A72 72 0 1 0 312 206 A60 60 0 1 1 250 100 Z" fill="#fff4c2" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <line x1="0" y1="0" x2="140" y2="60" stroke="#fff" stroke-width="4" stroke-linecap="round" class="shooting late" />

    <path d="M-60 700 Q400 640 800 680 Q1300 620 1980 680 V760 H-60 Z" fill="#2a2458" />
    <path d="M-60 720 Q480 700 960 712 Q1440 724 1980 704 L1980 1200 L-60 1200 Z" fill="url(#cinema-drivein-ground)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />

    <ellipse cx="960" cy="340" rx="560" ry="320" fill="url(#cinema-drivein-glow)" class="cinema-drivein-glow" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M640 560 V740 M1280 560 V740 M720 560 V740 M1200 560 V740" stroke-width="18" />
      <path d="M640 560 V740 M1280 560 V740 M720 560 V740 M1200 560 V740" stroke="#5a5a8a" stroke-width="8" />
      <path d="M640 640 L720 600 M640 600 L720 640 M1200 640 L1280 600 M1200 600 L1280 640" stroke-width="6" />
      <rect x="530" y="100" width="860" height="480" rx="12" fill="#e8e0f0" stroke-width="8" filter="url(#cel)" />
      <rect x="560" y="130" width="800" height="420" rx="6" fill="url(#cinema-drivein-film)" stroke-width="5" />
    </g>
    <g clip-path="url(#cinema-drivein-screen)">
      <path d="M560 480 Q760 400 960 460 Q1160 400 1360 470 V560 H560 Z" fill="#7ed06a" stroke="#1b1033" stroke-width="5" />
      <path d="M560 520 Q800 490 1000 510 Q1200 530 1360 500 V560 H560 Z" fill="#5fb04a" />
      <circle cx="1220" cy="210" r="40" fill="#ffe14d" stroke="#1b1033" stroke-width="4" />
      <g class="cinema-drivein-ufo">
        <g transform="translate(860 280)" stroke="#1b1033" stroke-linejoin="round">
          <path d="M-40 -10 Q-40 -60 0 -62 Q40 -60 40 -10 Z" fill="#bfe6ff" stroke-width="5" />
          <circle cx="0" cy="-30" r="14" fill="#9dff8a" stroke-width="4" />
          <circle cx="-5" cy="-34" r="3" fill="#1b1033" stroke="none" />
          <circle cx="5" cy="-34" r="3" fill="#1b1033" stroke="none" />
          <ellipse cx="0" cy="0" rx="110" ry="28" fill="#ff7ab0" stroke-width="6" />
          <path d="M-70 0 h0.1 M-35 6 h0.1 M0 8 h0.1 M35 6 h0.1 M70 0 h0.1" stroke="#ffd23f" stroke-width="10" stroke-linecap="round" />
          <path d="M-40 26 L-90 160 H90 L40 26 Z" fill="#fff6a0" opacity="0.5" stroke="none" />
        </g>
      </g>
      <g class="cinema-drivein-cow">
        <g transform="translate(860 440)" stroke="#1b1033" stroke-linejoin="round">
          <path d="M-40 0 Q-44 -40 0 -40 Q44 -40 40 0 Z" fill="#fffaf0" stroke-width="4" />
          <path d="M-20 -30 q10 -6 14 6 q-12 8 -14 -6 Z M12 -18 q10 -4 12 8 q-12 4 -12 -8 Z" fill="#1b1033" stroke="none" />
          <path d="M-30 0 V18 M30 0 V18" stroke-width="6" />
        </g>
      </g>
      <rect x="560" y="130" width="800" height="420" fill="#fff" class="cinema-drivein-flicker" />
    </g>

    <path d="M960 1140 L560 130 H1360 Z" fill="url(#cinema-drivein-beam)" class="cinema-drivein-beam" />

    <g transform="translate(1660 0)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M0 740 V680" stroke-width="18" />
      <path d="M0 740 V680" stroke="#5a5a8a" stroke-width="8" />
      <rect x="-150" y="560" width="300" height="120" rx="14" fill="#e8304a" stroke-width="6" filter="url(#cel-s)" />
    </g>
    <path :d="SIGN" fill="none" stroke="#fff6c0" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
    <g class="cinema-drivein-bulbs" fill="#ffd23f" stroke="#1b1033" stroke-width="2">
      <circle v-for="(b, i) in BULBS" :key="`bb${i}`" :cx="b.x" :cy="b.y - 10" r="6" />
      <circle v-for="(b, i) in BULBS" :key="`bt${i}`" :cx="b.x" :cy="b.y + 100" r="6" />
    </g>

    <g v-for="x in POSTS" :key="`ps${x}`" stroke="#1b1033" stroke-linejoin="round">
      <path :d="`M${x} 860 V770`" stroke-width="12" />
      <path :d="`M${x} 860 V770`" stroke="#8b9dd8" stroke-width="5" />
      <rect :x="x - 22" y="742" width="44" height="34" rx="6" fill="#5a5a8a" stroke-width="4" />
      <path :d="`M${x - 12} 754 h24 M${x - 12} 764 h24`" stroke="#c9d4f2" stroke-width="3" />
    </g>

    <g v-for="(c, i) in CARS" :key="`car${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.k})`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="10" rx="220" ry="20" fill="#05081a" opacity="0.5" stroke="none" />
      <path d="M-120 -150 Q-110 -230 -40 -236 H40 Q110 -230 120 -150 Z" :fill="c.c" stroke-width="7" />
      <path d="M-100 -156 Q-92 -216 -36 -220 H36 Q92 -216 100 -156 Z" fill="#1a1d3a" stroke-width="5" />
      <g v-if="c.kid">
        <circle cx="-40" cy="-176" r="28" fill="#3a2a2a" stroke="none" />
        <circle cx="40" cy="-180" r="30" fill="#5a3a2a" stroke="none" />
      </g>
      <path d="M-200 0 V-110 Q-200 -150 -160 -150 H160 Q200 -150 200 -110 V0 Z" :fill="c.c" stroke-width="7" filter="url(#cel-s)" />
      <rect x="-70" y="-110" width="140" height="44" rx="8" fill="#fffaf0" stroke-width="5" />
      <path d="M-200 -40 H200" stroke-width="5" />
      <rect x="-184" y="-120" width="50" height="30" rx="8" fill="#a8183a" stroke-width="4" />
      <rect x="134" y="-120" width="50" height="30" rx="8" fill="#a8183a" stroke-width="4" />
      <rect x="-210" y="-20" width="80" height="34" rx="10" fill="#2a2240" stroke-width="5" />
      <rect x="130" y="-20" width="80" height="34" rx="10" fill="#2a2240" stroke-width="5" />
    </g>
    <g class="cinema-drivein-brake">
      <g v-for="(c, i) in CARS.filter((_, j) => j % 3 === 1)" :key="`br${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.k})`">
        <rect x="-180" y="-116" width="42" height="22" rx="6" fill="#ff6a6a" />
        <rect x="138" y="-116" width="42" height="22" rx="6" fill="#ff6a6a" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.cinema-drivein-ufo {
  animation: cinema-drivein-ufo 8s ease-in-out infinite alternate;
}

.cinema-drivein-cow {
  animation: cinema-drivein-cow 8s ease-in-out infinite alternate;
}

.cinema-drivein-flicker {
  opacity: 0;
  animation: cinema-drivein-flicker 5s steps(1) infinite;
}

.cinema-drivein-beam {
  animation: cinema-drivein-beam 0.9s ease-in-out infinite alternate;
}

.cinema-drivein-glow {
  animation: cinema-drivein-beam 2.4s ease-in-out infinite alternate;
}

.cinema-drivein-bulbs {
  animation: cinema-drivein-bulbs 1s steps(2) infinite;
}

.cinema-drivein-brake {
  animation: cinema-drivein-bulbs 3s steps(2) infinite;
}

@keyframes cinema-drivein-ufo {
  0% {
    translate: -200px 0;
  }
  50% {
    translate: 0 -40px;
  }
  100% {
    translate: 200px 10px;
  }
}

/* the cow rides up the beam while the saucer hovers over it, and drops back down as it drifts off */
@keyframes cinema-drivein-cow {
  0%,
  20% {
    translate: -200px 0;
    opacity: 0;
  }
  45%,
  60% {
    translate: 0 -100px;
    opacity: 1;
  }
  80%,
  100% {
    translate: 200px 0;
    opacity: 0;
  }
}

@keyframes cinema-drivein-flicker {
  0%,
  90% {
    opacity: 0;
  }
  91% {
    opacity: 0.25;
  }
  93% {
    opacity: 0;
  }
  95% {
    opacity: 0.15;
  }
}

@keyframes cinema-drivein-beam {
  from {
    opacity: 0.75;
  }
  to {
    opacity: 1;
  }
}

@keyframes cinema-drivein-bulbs {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.4;
  }
}
</style>
