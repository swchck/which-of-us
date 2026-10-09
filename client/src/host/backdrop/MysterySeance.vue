<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(1313);
const f1 = (n: number) => n.toFixed(1);
const star = (x: number, y: number, r: number) =>
  `M${Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`;
  }).join(' L')} Z`;
const SPARKLES = twinkleGroups(Array.from({ length: 40 }, () => ({ x: 120 + rnd() * 1680, y: 60 + rnd() * 520, r: 4 + rnd() * 7 }))).map((g) => g.map((s) => star(s.x, s.y, s.r)).join(' '));
const CHARMS = [
  { x: 380, len: 160, kind: 'moon', d: 0 },
  { x: 560, len: 240, kind: 'star', d: -1.2 },
  { x: 1360, len: 220, kind: 'star', d: -2 },
  { x: 1540, len: 150, kind: 'moon', d: -0.6 },
];
const CARDS = [
  { x: -300, y: 20, a: -14, sym: 'sun' },
  { x: -170, y: 40, a: -6, sym: 'moon' },
  { x: 170, y: 40, a: 6, sym: 'star' },
  { x: 300, y: 20, a: 14, sym: 'eye' },
];
const CANDLES = [
  { x: -420, h: 90 },
  { x: 430, h: 120 },
  { x: 480, h: 70 },
];
const FRINGE = Array.from({ length: 34 }, (_, i) => `M${-660 + i * 40} 120 v40`).join(' ');
</script>

<template>
  <g>
    <defs>
      <radialGradient id="mystery-seance-bg" cx="50%" cy="55%" r="80%">
        <stop offset="0%" stop-color="#5a2a8a" />
        <stop offset="60%" stop-color="#2a1050" />
        <stop offset="100%" stop-color="#120626" />
      </radialGradient>
      <linearGradient id="mystery-seance-drape" x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
        <stop offset="0%" stop-color="#4a1a6a" />
        <stop offset="50%" stop-color="#8a3ab0" />
        <stop offset="100%" stop-color="#4a1a6a" />
      </linearGradient>
      <radialGradient id="mystery-seance-ball" cx="38%" cy="32%" r="70%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="35%" stop-color="#bff0ff" />
        <stop offset="80%" stop-color="#6a8af0" />
        <stop offset="100%" stop-color="#3a3aa8" />
      </radialGradient>
      <radialGradient id="mystery-seance-glow">
        <stop offset="0%" stop-color="#9ae8ff" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#9ae8ff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="mystery-seance-candle">
        <stop offset="0%" stop-color="#ffd96b" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ffd96b" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="mystery-seance-cloth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c2307a" />
        <stop offset="100%" stop-color="#6a1048" />
      </linearGradient>
      <linearGradient id="mystery-seance-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="50%" stop-color="#ffcc33" />
        <stop offset="100%" stop-color="#d9861c" />
      </linearGradient>
      <linearGradient id="mystery-seance-card" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffaf0" />
        <stop offset="100%" stop-color="#f0dcae" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#mystery-seance-bg)" />
    <path v-for="(d, gi) in SPARKLES" :key="`sk${gi}`" :d="d" fill="#ffe08a" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" opacity="0.8" />

    <g stroke="#1b1033" stroke-width="6" stroke-linejoin="round">
      <path d="M-60 -60 H460 Q380 300 420 600 Q440 820 300 1140 H-60 Z" fill="url(#mystery-seance-drape)" filter="url(#cel)" />
      <path d="M1980 -60 H1460 Q1540 300 1500 600 Q1480 820 1620 1140 H1980 Z" fill="url(#mystery-seance-drape)" filter="url(#cel)" />
      <path d="M-60 -60 H1980 V60 Q1720 140 1460 60 Q1200 140 960 60 Q720 140 460 60 Q200 140 -60 60 Z" fill="url(#mystery-seance-drape)" />
    </g>
    <path d="M-60 60 Q200 140 460 60 Q720 140 960 60 Q1200 140 1460 60 Q1720 140 1980 60" stroke="url(#mystery-seance-gold)" stroke-width="10" fill="none" />
    <path d="M400 560 Q460 520 500 560 M1520 560 Q1460 520 1420 560" stroke="#1b1033" stroke-width="18" fill="none" stroke-linecap="round" />
    <path d="M400 560 Q460 520 500 560 M1520 560 Q1460 520 1420 560" stroke="url(#mystery-seance-gold)" stroke-width="9" fill="none" stroke-linecap="round" />

    <g v-for="(c, i) in CHARMS" :key="`ch${i}`" class="mystery-seance-charm" :style="{ transformOrigin: `${c.x}px 70px`, animationDelay: `${c.d}s` }">
      <path :d="`M${c.x} 70 V${70 + c.len}`" stroke="#ffd96b" stroke-width="3" />
      <path v-if="c.kind === 'moon'" :d="`M${c.x + 10} ${80 + c.len} a34 34 0 1 0 0 60 a26 26 0 1 1 0 -60 Z`" fill="url(#mystery-seance-gold)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path v-else :d="star(c.x, 104 + c.len, 34)" fill="url(#mystery-seance-gold)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>

    <ellipse cx="960" cy="520" rx="380" ry="300" fill="url(#mystery-seance-glow)" class="mystery-seance-aura" />

    <g transform="translate(960 760)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="380" rx="620" ry="40" fill="#0a0418" opacity="0.4" stroke="none" />
      <path d="M-620 120 Q-640 300 -560 400 H560 Q640 300 620 120 Z" fill="url(#mystery-seance-cloth)" stroke-width="7" filter="url(#cel)" />
      <ellipse cx="0" cy="120" rx="620" ry="110" fill="#d8408a" stroke-width="7" />
      <path :d="FRINGE" stroke="url(#mystery-seance-gold)" stroke-width="6" stroke-linecap="round" transform="translate(0 100)" opacity="0.9" />
      <ellipse cx="0" cy="120" rx="560" ry="90" fill="none" stroke="url(#mystery-seance-gold)" stroke-width="5" stroke-dasharray="4 16" stroke-linecap="round" />

      <path d="M-120 110 L-90 60 H90 L120 110 Z" fill="url(#mystery-seance-gold)" stroke-width="6" />
      <path d="M-80 60 Q-100 30 -60 20 H60 Q100 30 80 60 Z" fill="#8a3ab0" stroke-width="5" />
      <circle cx="0" cy="-90" r="130" fill="url(#mystery-seance-ball)" stroke-width="7" />
      <g class="mystery-seance-swirl" style="transform-origin: 0 -90px">
        <path d="M-60 -60 Q-40 -150 30 -130 Q90 -110 60 -50 Q30 0 -20 -30" stroke="#ffffff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7" />
        <circle cx="40" cy="-60" r="8" fill="#fff" stroke="none" opacity="0.8" />
      </g>
      <path d="M-80 -150 Q-60 -190 -20 -196" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.9" />

      <g v-for="(c, i) in CARDS" :key="`cd${i}`" :transform="`translate(${c.x} ${100 + c.y}) rotate(${c.a})`">
        <rect x="-54" y="-80" width="108" height="150" rx="10" fill="url(#mystery-seance-card)" stroke-width="5" />
        <rect x="-42" y="-68" width="84" height="126" rx="6" fill="none" stroke="#8a3ab0" stroke-width="3" />
        <g v-if="c.sym === 'sun'">
          <circle cx="0" cy="-6" r="22" fill="#ffd23f" stroke-width="4" />
          <path d="M0 -44 v10 M0 22 v10 M-38 -6 h10 M28 -6 h10 M-27 -33 l7 7 M20 20 l7 7 M27 -33 l-7 7 M-20 20 l-7 7" stroke="#e8902a" stroke-width="5" stroke-linecap="round" />
        </g>
        <path v-else-if="c.sym === 'moon'" d="M6 -36 a32 32 0 1 0 0 60 a24 24 0 1 1 0 -60 Z" fill="#9ae8ff" stroke-width="4" />
        <path v-else-if="c.sym === 'star'" :d="star(0, -6, 30)" fill="#ff7ab0" stroke-width="4" />
        <g v-else>
          <path d="M-34 -6 Q0 -40 34 -6 Q0 28 -34 -6 Z" fill="#fff" stroke-width="4" />
          <circle cx="0" cy="-6" r="12" fill="#8a3ab0" stroke-width="3" />
        </g>
      </g>

      <g v-for="(c, i) in CANDLES" :key="`cn${i}`">
        <rect :x="c.x - 16" :y="110 - c.h" width="32" :height="c.h" rx="6" fill="#fffaf0" stroke-width="5" />
        <path :d="`M${c.x - 16} ${116 - c.h} q8 14 16 0 q8 18 16 0`" fill="#f0dcae" stroke-width="3" />
        <path :d="`M${c.x} ${110 - c.h} v-12`" stroke-width="4" />
      </g>
    </g>
    <g v-for="(c, i) in CANDLES" :key="`fl${i}`" :transform="`translate(${960 + c.x} ${858 - c.h})`">
      <circle r="60" fill="url(#mystery-seance-candle)" class="mystery-seance-halo" />
      <g class="mystery-seance-flame" :style="{ animationDelay: `-${i * 0.11}s` }">
        <path d="M0 0 Q-16 -18 0 -46 Q16 -18 0 0 Z" fill="#ffb02e" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M0 -6 Q-7 -16 0 -30 Q7 -16 0 -6 Z" fill="#fff6c0" />
      </g>
    </g>

    <g class="mystery-seance-smoke">
      <path d="M1460 760 q-20 -40 0 -80 q20 -40 0 -80 q-20 -40 0 -80" stroke="#c8b8ff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.6" />
    </g>
    <g transform="translate(1460 780)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-30 0 H30 L20 30 H-20 Z" fill="url(#mystery-seance-gold)" stroke-width="4" />
      <path d="M0 0 V-24" stroke-width="5" />
    </g>

    <g transform="translate(250 1000)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-50 60 Q-70 -40 -30 -70 L-40 -110 L-10 -86 Q0 -90 10 -86 L40 -110 L30 -70 Q70 -40 50 60 Z" fill="#2a1a4a" stroke-width="5" />
      <g class="mystery-seance-tail" style="transform-origin: 46px 50px">
        <path d="M46 50 Q120 40 110 -40" stroke-width="16" fill="none" stroke-linecap="round" />
        <path d="M46 50 Q120 40 110 -40" stroke="#2a1a4a" stroke-width="8" fill="none" stroke-linecap="round" />
      </g>
      <ellipse cx="-14" cy="-60" rx="8" ry="10" fill="#9dff8a" stroke="none" />
      <ellipse cx="14" cy="-60" rx="8" ry="10" fill="#9dff8a" stroke="none" />
      <path d="M-14 -66 v12 M14 -66 v12" stroke-width="3" />
    </g>
  </g>
</template>

<style scoped>
.mystery-seance-charm {
  animation: mystery-seance-swing 3.4s ease-in-out infinite alternate;
}

.mystery-seance-aura {
  animation: mystery-seance-pulse 2.6s ease-in-out infinite alternate;
}

.mystery-seance-swirl {
  animation: mystery-seance-spin 8s linear infinite;
}

.mystery-seance-halo {
  animation: mystery-seance-pulse 0.9s ease-in-out infinite alternate;
}

.mystery-seance-flame {
  transform-origin: 0 0;
  animation: mystery-seance-flame 0.3s ease-in-out infinite alternate;
}

.mystery-seance-smoke {
  animation: mystery-seance-smoke 4s ease-out infinite;
}

.mystery-seance-tail {
  animation: mystery-seance-swing 2.2s ease-in-out infinite alternate;
}

@keyframes mystery-seance-swing {
  from {
    rotate: -5deg;
  }
  to {
    rotate: 5deg;
  }
}

@keyframes mystery-seance-pulse {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}

@keyframes mystery-seance-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes mystery-seance-flame {
  from {
    scale: 1 1;
    rotate: -4deg;
  }
  to {
    scale: 0.9 1.12;
    rotate: 4deg;
  }
}

@keyframes mystery-seance-smoke {
  from {
    translate: 0 20px;
    opacity: 0;
  }
  30% {
    opacity: 0.8;
  }
  to {
    translate: 20px -80px;
    opacity: 0;
  }
}
</style>
