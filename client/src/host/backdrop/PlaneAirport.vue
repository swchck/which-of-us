<script setup lang="ts">
import { strokeText } from './kit';

const ROWS = [
  { city: 'Сочи', time: '09:40', ok: true },
  { city: 'Казань', time: '10:15', ok: true },
  { city: 'Париж', time: '11:05', ok: false },
  { city: 'Пекин', time: '12:30', ok: true },
];
const BOARD_X = 110;
const BOARD_Y = 140;
const HEADER = strokeText('Вылет', BOARD_X + 270, BOARD_Y + 60, 36, 'middle');
const CITIES = ROWS.map((r, i) => strokeText(r.city, BOARD_X + 40, BOARD_Y + 132 + i * 58, 26)).join(' ');
const TIMES = ROWS.map((r, i) => strokeText(r.time, BOARD_X + 330, BOARD_Y + 132 + i * 58, 26)).join(' ');
const CONTROL = strokeText('Контроль', 1660, 486, 30, 'middle');
const MULLIONS = Array.from({ length: 9 }, (_, i) => `M${-40 + i * 250} 120 V620`).join(' ');
const SLATS = Array.from({ length: 40 }, (_, i) => `M${-60 + i * 56} 950 l20 70`).join(' ');
const BAGS = [
  { x: 0, w: 150, h: 110, c: '#e8553f', strap: '#ffd23f' },
  { x: 300, w: 120, h: 150, c: '#4a7ad8', strap: '#fff' },
  { x: 560, w: 170, h: 100, c: '#ffb02e', strap: '#8a4a2a' },
  { x: 860, w: 130, h: 130, c: '#5fb04a', strap: '#ffd23f' },
  { x: 1120, w: 160, h: 120, c: '#b07aff', strap: '#fff' },
  { x: 1420, w: 110, h: 140, c: '#ff7ab0', strap: '#4a7ad8' },
  { x: 1680, w: 150, h: 110, c: '#3ad6e0', strap: '#e8553f' },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="plane-airport-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8eefc" />
        <stop offset="100%" stop-color="#b8c4ec" />
      </linearGradient>
      <linearGradient id="plane-airport-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a8fe8" />
        <stop offset="100%" stop-color="#bfe6ff" />
      </linearGradient>
      <linearGradient id="plane-airport-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d8dff4" />
        <stop offset="100%" stop-color="#8b9dd8" />
      </linearGradient>
      <linearGradient id="plane-airport-board" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a2f5a" />
        <stop offset="100%" stop-color="#1a1d3a" />
      </linearGradient>
      <linearGradient id="plane-airport-booth" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5a8ae8" />
        <stop offset="100%" stop-color="#2f4fb0" />
      </linearGradient>
      <linearGradient id="plane-airport-belt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a5a7a" />
        <stop offset="100%" stop-color="#2a2a44" />
      </linearGradient>
      <linearGradient id="plane-airport-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f4f6ff" />
        <stop offset="100%" stop-color="#a8b4dc" />
      </linearGradient>
      <clipPath id="plane-airport-glass"><rect x="-60" y="120" width="2040" height="500" /></clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1200" fill="url(#plane-airport-wall)" />
    <rect x="-60" y="120" width="2040" height="500" fill="url(#plane-airport-sky)" />
    <g clip-path="url(#plane-airport-glass)">
      <path d="M200 260 Q240 230 300 240 Q340 210 400 236 Q460 230 480 260 Z M1300 220 Q1340 190 1400 200 Q1450 176 1510 200 Q1560 200 1580 224 Z" fill="#fff" stroke="#9ac4ea" stroke-width="3" stroke-linejoin="round" />
      <path d="M-60 540 Q400 500 900 520 Q1400 540 1980 500 V620 H-60 Z" fill="#8fd06a" />
      <path d="M-60 560 L1980 540 V620 H-60 Z" fill="#6a6a8a" />
      <path d="M0 580 h80 M200 578 h80 M400 576 h80 M600 574 h80 M800 572 h80 M1000 570 h80 M1200 568 h80 M1400 566 h80 M1600 564 h80 M1800 562 h80" stroke="#fff" stroke-width="5" />
      <g transform="translate(1520 520)" stroke="#1b1033" stroke-linejoin="round">
        <rect x="-12" y="-120" width="24" height="120" fill="#e8e0f0" stroke-width="4" />
        <path d="M-50 -160 H50 L40 -120 H-40 Z" fill="#5a8ae8" stroke-width="4" />
        <path d="M-40 -152 H40" stroke="#bfe6ff" stroke-width="10" />
      </g>
      <g class="plane-airport-takeoff">
        <g transform="translate(0 520) rotate(-8) scale(0.8)" stroke="#1b1033" stroke-linejoin="round">
          <path d="M-160 0 Q-170 -30 -130 -36 H120 Q170 -34 180 -10 Q170 10 120 12 H-120 Q-160 12 -160 0 Z" fill="#fffaf0" stroke-width="5" />
          <path d="M-150 -30 L-180 -90 H-140 L-100 -34 Z" fill="#e8553f" stroke-width="5" />
          <path d="M-20 0 L-80 60 H-40 L40 4 Z" fill="#c9d4f2" stroke-width="5" />
          <path d="M-90 -18 h0.1 M-60 -18 h0.1 M-30 -18 h0.1 M0 -18 h0.1 M30 -18 h0.1 M60 -18 h0.1" stroke="#4a7ad8" stroke-width="10" stroke-linecap="round" />
          <path d="M136 -26 Q160 -24 168 -12 H136 Z" fill="#4a7ad8" stroke-width="3" />
        </g>
      </g>
    </g>
    <path :d="MULLIONS" stroke="#1b1033" stroke-width="18" />
    <path :d="MULLIONS" stroke="#e8eefc" stroke-width="10" />
    <rect x="-60" y="100" width="2040" height="24" fill="url(#plane-airport-metal)" stroke="#1b1033" stroke-width="5" />
    <rect x="-60" y="616" width="2040" height="24" fill="url(#plane-airport-metal)" stroke="#1b1033" stroke-width="5" />

    <path d="M-60 640 H1980 V1140 H-60 Z" fill="url(#plane-airport-floor)" />
    <path d="M300 640 L-200 1140 M700 640 L500 1140 M1100 640 L1300 1140 M1500 640 L2000 1140" stroke="#a8b4dc" stroke-width="4" opacity="0.6" />
    <path d="M200 760 H700 M1200 800 H1500" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.5" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <path :d="`M${BOARD_X + 100} 0 V${BOARD_Y} M${BOARD_X + 440} 0 V${BOARD_Y}`" stroke-width="8" />
      <rect :x="BOARD_X" :y="BOARD_Y" width="540" height="380" rx="14" fill="url(#plane-airport-board)" stroke-width="7" filter="url(#cel)" />
      <rect :x="BOARD_X + 20" :y="BOARD_Y + 16" width="500" height="60" rx="8" fill="#ffd23f" stroke-width="4" />
      <path v-for="i in 4" :key="`rw${i}`" :d="`M${BOARD_X + 24} ${BOARD_Y + 88 + i * 58} H${BOARD_X + 516}`" stroke="#3a3f6a" stroke-width="3" />
    </g>
    <path :d="HEADER" fill="none" stroke="#1b1033" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
    <path :d="CITIES" fill="none" stroke="#fff6c0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <path :d="TIMES" fill="none" stroke="#ffd23f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <g v-for="(r, i) in ROWS" :key="`lt${i}`" :class="r.ok ? '' : 'plane-airport-blink'">
      <circle :cx="BOARD_X + 488" :cy="BOARD_Y + 120 + i * 58" r="11" :fill="r.ok ? '#5fd06a' : '#ff5a5a'" stroke="#1b1033" stroke-width="3" />
    </g>

    <g transform="translate(1660 0)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-200" y="440" width="400" height="66" rx="10" fill="#ffd23f" stroke-width="6" />
      <path d="M-160 440 V380 M160 440 V380" stroke-width="6" />
      <path d="M-210 920 V560 Q-210 520 -170 520 H170 Q210 520 210 560 V920 Z" fill="url(#plane-airport-booth)" stroke-width="7" filter="url(#cel)" />
      <rect x="-160" y="560" width="320" height="170" rx="12" fill="#bfe6ff" stroke-width="5" />
      <path d="M-120 580 L-60 720 M40 580 L100 720" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.6" />
      <circle cx="0" cy="680" r="44" fill="#ffc890" stroke-width="5" />
      <path d="M-50 664 Q-50 610 0 608 Q50 610 50 664 Q30 640 0 642 Q-30 640 -50 664 Z" fill="#2f3a6a" stroke-width="5" />
      <path d="M-56 650 H56" stroke-width="8" stroke-linecap="round" />
      <path d="M-16 680 h0.1 M16 680 h0.1" stroke-width="9" stroke-linecap="round" />
      <path d="M-14 702 Q0 708 14 702" stroke-width="4" fill="none" stroke-linecap="round" />
      <rect x="-230" y="730" width="460" height="30" rx="8" fill="url(#plane-airport-metal)" stroke-width="5" />
      <g transform="translate(-120 712) rotate(-10)">
        <rect x="-30" y="-40" width="64" height="44" rx="5" fill="#a8302a" stroke-width="4" />
        <circle cx="2" cy="-20" r="10" fill="#ffd23f" stroke-width="3" />
      </g>
      <g class="plane-airport-stamp" style="transform-origin: 90px 726px">
        <path d="M76 640 h28 v50 h-28 Z" fill="#8a4a2a" stroke-width="4" />
        <rect x="64" y="690" width="52" height="30" rx="5" fill="#e8553f" stroke-width="4" />
      </g>
    </g>
    <path :d="CONTROL" fill="none" stroke="#1b1033" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-80 900 Q960 870 2000 900 V960 H-80 Z" fill="url(#plane-airport-metal)" stroke-width="6" />
      <rect x="-80" y="950" width="2080" height="90" fill="url(#plane-airport-belt)" stroke-width="6" filter="url(#cel)" />
      <path d="M-80 1040 H2000 V1140 H-80 Z" fill="#c9d4f2" stroke-width="6" />
    </g>
    <g class="plane-airport-slats">
      <path :d="SLATS" stroke="#7a7aa0" stroke-width="5" />
    </g>
    <g class="plane-airport-belt">
      <g v-for="(b, i) in [...BAGS, ...BAGS.map((c) => ({ ...c, x: c.x + 1950 }))]" :key="`bg${i}`" :transform="`translate(${b.x} ${990 - b.h})`" stroke="#1b1033" stroke-linejoin="round">
        <path :d="`M${b.w * 0.3} 0 V-24 H${b.w * 0.7} V0`" fill="none" stroke-width="12" />
        <path :d="`M${b.w * 0.3} 0 V-24 H${b.w * 0.7} V0`" fill="none" stroke="#5a5a7a" stroke-width="5" />
        <rect x="0" y="0" :width="b.w" :height="b.h" rx="16" :fill="b.c" stroke-width="6" />
        <path :d="`M${b.w * 0.25} 4 V${b.h - 4} M${b.w * 0.75} 4 V${b.h - 4}`" :stroke="b.strap" stroke-width="10" />
        <path :d="`M14 18 Q14 10 24 10 H${b.w * 0.5}`" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.5" />
        <rect :x="b.w * 0.5 - 18" :y="b.h * 0.4" width="36" height="24" rx="4" fill="#fffaf0" stroke-width="3" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.plane-airport-takeoff {
  animation: plane-airport-takeoff 14s ease-in infinite;
}

.plane-airport-blink {
  animation: plane-airport-blink 1s steps(2) infinite;
}

.plane-airport-stamp {
  animation: plane-airport-stamp 2.2s ease-in-out infinite;
}

.plane-airport-belt {
  animation: plane-airport-belt 24s linear infinite;
}

.plane-airport-slats {
  animation: plane-airport-slats 1.2s linear infinite;
}

/* rolls along the runway, then lifts off and climbs out of the window */
@keyframes plane-airport-takeoff {
  0% {
    translate: -300px 40px;
  }
  45% {
    translate: 700px 30px;
  }
  75%,
  100% {
    translate: 2400px -500px;
  }
}

@keyframes plane-airport-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.2;
  }
}

@keyframes plane-airport-stamp {
  0%,
  60%,
  100% {
    translate: 0 0;
  }
  70% {
    translate: 0 -30px;
  }
  80% {
    translate: 0 10px;
  }
}

/* the bags are drawn twice, 1950px apart, so sliding by that much brings the first set back */
@keyframes plane-airport-belt {
  from {
    translate: -1950px 0;
  }
  to {
    translate: 0 0;
  }
}

@keyframes plane-airport-slats {
  from {
    translate: 0 0;
  }
  to {
    translate: 56px 0;
  }
}
</style>
