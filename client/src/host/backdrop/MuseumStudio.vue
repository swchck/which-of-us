<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(1503);
const PLANKS = Array.from({ length: 24 }, (_, i) => -1200 + i * 200)
  .map((xb) => `M${(960 + (xb - 960) * 0.3).toFixed(1)} 720 L${xb} 1140`)
  .join(' ');
// three canvases, three takes on the same sitter: realistic, cubist and a stick figure
const EASELS = [
  { x: 330, y: 1000, k: 1.1, a: 4, art: 'real' },
  { x: 1600, y: 1000, k: 1.1, a: -4, art: 'cube' },
  { x: 1300, y: 850, k: 0.7, a: -2, art: 'stick' },
];
const SPLATS = [
  { x: 700, y: 1040, c: '#e8304a', r: 26 },
  { x: 1180, y: 1080, c: '#4a7ad8', r: 20 },
  { x: 900, y: 980, c: '#ffd23f', r: 16 },
  { x: 1450, y: 1100, c: '#5fb04a', r: 22 },
];
const DUST = [0, 1, 2].map(() => Array.from({ length: 8 }, () => ({ x: 700 + rnd() * 520, y: 140 + rnd() * 560, r: 1.6 + rnd() * 2.2 })));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="museum-studio-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7a6ab8" />
        <stop offset="100%" stop-color="#4c3b7e" />
      </linearGradient>
      <linearGradient id="museum-studio-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c8905a" />
        <stop offset="100%" stop-color="#7a4a2a" />
      </linearGradient>
      <linearGradient id="museum-studio-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7cc4ff" />
        <stop offset="100%" stop-color="#d8f0ff" />
      </linearGradient>
      <linearGradient id="museum-studio-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffbe0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#fffbe0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="museum-studio-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d89a5a" />
        <stop offset="100%" stop-color="#8a5a2a" />
      </linearGradient>
      <linearGradient id="museum-studio-drape" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff7ab0" />
        <stop offset="100%" stop-color="#c2307a" />
      </linearGradient>
      <radialGradient id="museum-studio-skin" cx="40%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#ffd8b0" />
        <stop offset="100%" stop-color="#f0b080" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="800" fill="url(#museum-studio-wall)" />
    <path d="M-60 520 H1980" stroke="#3a2a6a" stroke-width="12" />
    <path d="M760 -60 H1160 L1120 60 H800 Z" fill="url(#museum-studio-sky)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
    <path d="M960 -60 V60 M780 0 H1140" stroke="#1b1033" stroke-width="8" />
    <path d="M800 60 L560 760 H1360 L1120 60 Z" fill="url(#museum-studio-beam)" class="museum-studio-beam" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="80" y="140" width="220" height="170" rx="6" fill="#e8c070" stroke-width="6" filter="url(#cel-s)" />
      <rect x="98" y="158" width="184" height="134" fill="#ffe0b0" stroke-width="4" />
      <path d="M110 280 Q150 200 190 250 Q230 190 270 280 Z" fill="#7ed06a" stroke-width="3" />
      <rect x="1620" y="110" width="200" height="250" rx="6" fill="#e8c070" stroke-width="6" filter="url(#cel-s)" />
      <rect x="1638" y="128" width="164" height="214" fill="#2a1a4a" stroke-width="4" />
      <path d="M1660 300 q40 -100 80 -60 q20 -60 40 -10" stroke="#ffd23f" stroke-width="8" fill="none" stroke-linecap="round" />
      <circle cx="1760" cy="180" r="20" fill="#fff4c2" stroke-width="3" />
      <rect x="1380" y="400" width="300" height="20" rx="4" fill="url(#museum-studio-wood)" stroke-width="5" />
      <rect x="1400" y="340" width="40" height="60" rx="6" fill="#4a7ad8" stroke-width="4" />
      <path d="M1410 340 l-10 -50 M1420 340 l4 -60 M1432 340 l14 -46" stroke-width="6" stroke-linecap="round" />
      <path d="M1400 290 l-6 -16 M1424 280 v-18 M1446 294 l6 -16" stroke="#e8304a" stroke-width="8" stroke-linecap="round" />
      <path d="M1480 400 Q1470 330 1520 330 Q1570 330 1560 400 Z" fill="#fffaf0" stroke-width="4" />
      <rect x="1590" y="360" width="60" height="40" rx="6" fill="#ffd23f" stroke-width="4" />
    </g>

    <path d="M-60 720 H1980 V1140 H-60 Z" fill="url(#museum-studio-floor)" />
    <path :d="PLANKS" stroke="#6a3a1a" stroke-width="3" opacity="0.5" />
    <path d="M-60 720 H1980" stroke="#1b1033" stroke-width="5" />
    <ellipse v-for="(s, i) in SPLATS" :key="`sp${i}`" :cx="s.x" :cy="s.y" :rx="s.r * 1.8" :ry="s.r * 0.6" :fill="s.c" stroke="#1b1033" stroke-width="3" opacity="0.9" />

    <g transform="translate(960 830)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="200" ry="24" fill="#3a1a0a" opacity="0.35" stroke="none" />
      <path d="M-200 40 Q-210 -10 -180 -20 H180 Q210 -10 200 40 Z" fill="#8a3ab0" stroke-width="6" />
      <path d="M-70 -40 L-90 40 M70 -40 L90 40 M-40 -40 L-44 40 M40 -40 L44 40" stroke-width="12" stroke-linecap="round" />
      <path d="M-70 -40 L-90 40 M70 -40 L90 40 M-40 -40 L-44 40 M40 -40 L44 40" stroke="#d89a5a" stroke-width="6" stroke-linecap="round" />
      <ellipse cx="0" cy="-44" rx="100" ry="22" fill="url(#museum-studio-wood)" stroke-width="6" />
      <path d="M-60 -60 Q-80 -200 0 -210 Q80 -200 60 -60 Z" fill="url(#museum-studio-drape)" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-40 -60 L-60 0 M40 -60 L64 6" stroke-width="22" stroke-linecap="round" />
      <path d="M-40 -60 L-60 0 M40 -60 L64 6" stroke="#4a7ad8" stroke-width="14" stroke-linecap="round" />
      <path d="M-50 -170 Q-110 -150 -80 -100" stroke-width="20" fill="none" stroke-linecap="round" />
      <path d="M-50 -170 Q-110 -150 -80 -100" stroke="url(#museum-studio-skin)" stroke-width="11" fill="none" stroke-linecap="round" />
      <path d="M50 -170 Q100 -200 80 -260" stroke-width="20" fill="none" stroke-linecap="round" />
      <path d="M50 -170 Q100 -200 80 -260" stroke="#f0b080" stroke-width="11" fill="none" stroke-linecap="round" />
      <circle cx="80" cy="-280" r="24" fill="#e8304a" stroke-width="5" />
      <path d="M80 -304 q4 -14 14 -16" stroke-width="4" fill="none" />
      <circle cx="0" cy="-260" r="50" fill="url(#museum-studio-skin)" stroke-width="5" />
      <path d="M-56 -270 Q-60 -330 0 -330 Q60 -330 56 -270 Q30 -296 0 -294 Q-30 -296 -56 -270 Z" fill="#5a3a2a" stroke-width="5" />
      <path d="M-90 -300 Q0 -360 90 -300 Q0 -320 -90 -300 Z" fill="#ffd23f" stroke-width="5" />
      <path d="M-50 -320 Q0 -380 50 -320" fill="#ffd23f" stroke-width="5" />
      <circle cx="30" cy="-336" r="10" fill="#ff7ab0" stroke-width="3" />
      <path d="M-18 -256 h0.1 M18 -256 h0.1" stroke-width="10" stroke-linecap="round" />
      <g class="museum-studio-blink">
        <circle cx="-18" cy="-256" r="9" fill="#ffd0a8" stroke="none" />
        <circle cx="18" cy="-256" r="9" fill="#ffd0a8" stroke="none" />
        <path d="M-26 -256 h16 M10 -256 h16" stroke-width="5" stroke-linecap="round" />
      </g>
      <path d="M-14 -232 Q0 -222 14 -232" stroke-width="5" fill="none" stroke-linecap="round" />
      <ellipse cx="-30" cy="-238" rx="9" ry="5" fill="#ff8a8a" stroke="none" />
      <ellipse cx="30" cy="-238" rx="9" ry="5" fill="#ff8a8a" stroke="none" />
    </g>

    <g v-for="(e, i) in EASELS" :key="`ea${i}`" :transform="`translate(${e.x} ${e.y}) scale(${e.k}) rotate(${e.a})`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="20" rx="160" ry="18" fill="#3a1a0a" opacity="0.35" stroke="none" />
      <path d="M-110 20 L-20 -520 M110 20 L20 -520 M0 -520 L40 40" stroke-width="20" stroke-linecap="round" />
      <path d="M-110 20 L-20 -520 M110 20 L20 -520 M0 -520 L40 40" stroke="#d89a5a" stroke-width="10" stroke-linecap="round" />
      <rect x="-140" y="-200" width="280" height="22" rx="4" fill="url(#museum-studio-wood)" stroke-width="5" />
      <rect x="-130" y="-470" width="260" height="280" rx="4" fill="#fffaf0" stroke-width="7" filter="url(#cel-s)" />
      <template v-if="e.art === 'real'">
        <rect x="-116" y="-456" width="232" height="252" fill="#c8b8f0" stroke="none" />
        <path d="M-60 -220 Q-70 -330 0 -336 Q70 -330 60 -220 Z" fill="#ff7ab0" stroke-width="4" />
        <circle cx="0" cy="-360" r="34" fill="#ffd8b0" stroke-width="4" />
        <path d="M-60 -380 Q0 -420 60 -380 Q0 -394 -60 -380 Z" fill="#ffd23f" stroke-width="4" />
        <path d="M-10 -360 h0.1 M10 -360 h0.1" stroke-width="7" stroke-linecap="round" />
        <path d="M-8 -346 Q0 -340 8 -346" stroke-width="3" fill="none" />
      </template>
      <template v-else-if="e.art === 'cube'">
        <rect x="-116" y="-456" width="232" height="252" fill="#ffe08a" stroke="none" />
        <path d="M-80 -220 L-40 -330 L40 -310 L70 -220 Z" fill="#ff7ab0" stroke-width="4" />
        <path d="M-50 -330 L0 -400 L50 -350 L20 -320 Z" fill="#ffd8b0" stroke-width="4" />
        <path d="M-80 -390 L60 -420 L40 -380 Z" fill="#4a7ad8" stroke-width="4" />
        <circle cx="-6" cy="-360" r="6" fill="#1b1033" stroke="none" />
        <path d="M14 -372 l10 10 l-10 10 Z" fill="#1b1033" stroke="none" />
        <path d="M-100 -260 L-60 -240 M80 -300 L100 -260" stroke="#e8304a" stroke-width="10" stroke-linecap="round" />
      </template>
      <template v-else>
        <rect x="-116" y="-456" width="232" height="252" fill="#fffaf0" stroke="none" />
        <circle cx="0" cy="-370" r="30" fill="none" stroke-width="6" />
        <path d="M0 -340 V-270 M0 -320 L-40 -300 M0 -320 L40 -350 M0 -270 L-30 -220 M0 -270 L30 -220" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M-10 -374 h0.1 M10 -374 h0.1 M-10 -358 Q0 -350 10 -358" stroke-width="5" fill="none" stroke-linecap="round" />
      </template>
    </g>

    <g transform="translate(560 960)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-90 0 Q-110 -60 -40 -70 Q40 -80 90 -40 Q110 -10 80 10 Q40 20 30 0 Q20 -20 0 0 Q-40 20 -90 0 Z" fill="url(#museum-studio-wood)" stroke-width="6" />
      <circle cx="-56" cy="-40" r="12" fill="#e8304a" stroke-width="3" />
      <circle cx="-20" cy="-52" r="12" fill="#ffd23f" stroke-width="3" />
      <circle cx="20" cy="-50" r="12" fill="#4a7ad8" stroke-width="3" />
      <circle cx="54" cy="-34" r="12" fill="#5fb04a" stroke-width="3" />
      <circle cx="-60" cy="-8" r="12" fill="#fffaf0" stroke-width="3" />
    </g>
    <g transform="translate(1450 600)">
      <g class="museum-studio-brush" style="transform-origin: 80px 140px">
        <path d="M80 140 L-40 -60" stroke="#1b1033" stroke-width="16" stroke-linecap="round" />
        <path d="M80 140 L-40 -60" stroke="#e8304a" stroke-width="8" stroke-linecap="round" />
        <path d="M-40 -60 L-60 -94" stroke="#1b1033" stroke-width="20" stroke-linecap="round" />
        <path d="M-40 -60 L-60 -94" stroke="#5a3a2a" stroke-width="12" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="(g, i) in DUST" :key="`ds${i}`" class="museum-studio-dust" :style="{ animationDelay: `-${i * 2.3}s` }" fill="#fffbe0">
      <circle v-for="(s, j) in g" :key="j" :cx="s.x" :cy="s.y" :r="s.r" />
    </g>
  </g>
</template>

<style scoped>
.museum-studio-beam {
  animation: museum-studio-glow 6s ease-in-out infinite alternate;
}

.museum-studio-blink {
  opacity: 0;
  animation: museum-studio-blink 4s steps(1) infinite;
}

.museum-studio-brush {
  animation: museum-studio-dab 1.2s ease-in-out infinite alternate;
}

.museum-studio-dust {
  animation: museum-studio-dust 7s ease-in-out infinite alternate;
}

@keyframes museum-studio-glow {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}

@keyframes museum-studio-blink {
  0%,
  92% {
    opacity: 0;
  }
  94%,
  97% {
    opacity: 1;
  }
}

@keyframes museum-studio-dab {
  from {
    rotate: -10deg;
  }
  to {
    rotate: 8deg;
  }
}

@keyframes museum-studio-dust {
  0% {
    translate: 0 0;
    opacity: 0.2;
  }
  50% {
    opacity: 0.85;
  }
  100% {
    translate: 24px -40px;
    opacity: 0.3;
  }
}
</style>
