<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(3110);
const f1 = (n: number) => n.toFixed(1);
const circ = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;
const STARS = twinkleGroups(Array.from({ length: 60 }, () => ({ x: rnd() * 1920, y: rnd() * 300, r: 1 + rnd() * 2 }))).map((g) => g.map((s) => circ(s.x, s.y, s.r)).join(' '));
const HOUSES = [
  { x: -60, w: 420, top: 360, c: '#6a3a9a', roof: '#3a1a5a', door: '#ff8a3d' },
  { x: 360, w: 360, top: 420, c: '#2f8a8a', roof: '#1a4a5a', door: '#ffd23f' },
  { x: 1200, w: 380, top: 400, c: '#c2408f', roof: '#6a1a5a', door: '#9dff8a' },
  { x: 1580, w: 400, top: 350, c: '#4a5ab0', roof: '#232a5e', door: '#ff7ab0' },
];
const GROUND = 800;
const KIDS = [
  { x: 640, kind: 'ghost', k: 1, d: 0 },
  { x: 820, kind: 'witch', k: 1.05, d: -0.3 },
  { x: 1000, kind: 'pumpkin', k: 0.9, d: -0.6 },
  { x: 1170, kind: 'cat', k: 0.95, d: -0.15 },
];
const BATS = [0, 70, 140];
</script>

<template>
  <g>
    <defs>
      <radialGradient id="pumpkin-trick-moon" cx="38%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#fffbe6" />
        <stop offset="100%" stop-color="#ffcf7a" />
      </radialGradient>
      <linearGradient id="pumpkin-trick-street" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a3a8a" />
        <stop offset="100%" stop-color="#241238" />
      </linearGradient>
      <linearGradient id="pumpkin-trick-walk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a6ab0" />
        <stop offset="100%" stop-color="#5a3a80" />
      </linearGradient>
      <radialGradient id="pumpkin-trick-porch">
        <stop offset="0%" stop-color="#ffd96b" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ffd96b" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="pumpkin-trick-pumpkin" cx="40%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#ffb04a" />
        <stop offset="100%" stop-color="#e0601a" />
      </radialGradient>
    </defs>

    <path v-for="(d, gi) in STARS" :key="`st${gi}`" :d="d" fill="#fff6dc" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" />
    <circle cx="960" cy="200" r="220" fill="#fff4c2" opacity="0.08" />
    <circle cx="960" cy="200" r="120" fill="url(#pumpkin-trick-moon)" stroke="#1b1033" stroke-width="5" />
    <circle cx="920" cy="170" r="20" fill="#f0c070" opacity="0.6" />
    <circle cx="1000" cy="240" r="14" fill="#f0c070" opacity="0.6" />
    <g class="pumpkin-trick-bats">
      <g v-for="(b, i) in BATS" :key="`bt${i}`" :transform="`translate(${b} ${180 + (i % 2) * 40}) scale(${1 - i * 0.15})`">
        <path d="M0 0 Q-20 -24 -50 -20 Q-40 -10 -42 0 Q-30 -6 -24 4 Q-14 -2 0 8 Q14 -2 24 4 Q30 -6 42 0 Q40 -10 50 -20 Q20 -24 0 0 Z" fill="#2a1a4a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      </g>
    </g>

    <g v-for="(h, i) in HOUSES" :key="`hs${i}`" stroke="#1b1033" stroke-linejoin="round">
      <rect :x="h.x" :y="h.top" :width="h.w" :height="GROUND - h.top" :fill="h.c" stroke-width="6" filter="url(#cel)" />
      <path :d="`M${h.x - 30} ${h.top + 4} L${h.x + h.w / 2} ${h.top - 150} L${h.x + h.w + 30} ${h.top + 4} Z`" :fill="h.roof" stroke-width="6" />
      <rect :x="h.x + h.w / 2 - 60" :y="GROUND - 210" width="120" height="190" rx="10" :fill="h.door" stroke-width="6" />
      <circle :cx="h.x + h.w / 2 + 34" :cy="GROUND - 110" r="8" fill="#1b1033" stroke="none" />
      <path :d="`M${h.x + h.w / 2 - 80} ${GROUND - 20} H${h.x + h.w / 2 + 80} V${GROUND} H${h.x + h.w / 2 - 80} Z`" fill="#8a6ab0" stroke-width="4" />
      <rect :x="h.x + 40" :y="h.top + 60" width="80" height="90" rx="6" fill="#ffd96b" stroke-width="5" />
      <rect :x="h.x + h.w - 120" :y="h.top + 60" width="80" height="90" rx="6" fill="#ffd96b" stroke-width="5" />
      <path :d="`M${h.x + 80} ${h.top + 60} V${h.top + 150} M${h.x + 40} ${h.top + 105} H${h.x + 120} M${h.x + h.w - 80} ${h.top + 60} V${h.top + 150} M${h.x + h.w - 120} ${h.top + 105} H${h.x + h.w - 40}`" stroke-width="5" />
      <circle :cx="h.x + h.w / 2 - 90" :cy="GROUND - 200" r="12" fill="#fff6a0" stroke-width="4" />
    </g>
    <g class="pumpkin-trick-porch">
      <ellipse v-for="(h, i) in HOUSES" :key="`pc${i}`" :cx="h.x + h.w / 2" :cy="GROUND - 120" rx="160" ry="140" fill="url(#pumpkin-trick-porch)" />
    </g>
    <path d="M720 800 V620 Q720 600 740 600 H1180 Q1200 600 1200 620 V800" fill="#3a2258" stroke="#1b1033" stroke-width="5" />
    <path d="M760 640 h80 v50 h-80 Z M1080 640 h80 v50 h-80 Z" fill="#ffb04a" stroke="#1b1033" stroke-width="4" />

    <g v-for="(h, i) in HOUSES" :key="`pk${i}`" :transform="`translate(${h.x + h.w / 2 + 120} ${GROUND - 4})`" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-40 0 Q-50 -60 0 -60 Q50 -60 40 0 Z" fill="url(#pumpkin-trick-pumpkin)" stroke-width="5" />
      <path d="M-14 -60 Q-20 -30 -14 0 M14 -60 Q20 -30 14 0" stroke="#c0501a" stroke-width="3" fill="none" />
      <path d="M0 -60 q2 -14 10 -18" stroke="#3f7a2a" stroke-width="7" fill="none" stroke-linecap="round" />
      <path d="M-22 -36 l8 -10 l8 10 Z M6 -36 l8 -10 l8 10 Z M-20 -20 Q0 -6 20 -20 l-6 6 l-6 -4 l-8 6 l-8 -6 Z" fill="#fff06a" class="pumpkin-trick-carve" />
    </g>
    <g :transform="`translate(${HOUSES[2]!.x + HOUSES[2]!.w / 2 - 120} ${GROUND - 4})`" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-56 -50 Q-56 0 0 0 Q56 0 56 -50 Z" fill="#7af0ff" stroke-width="5" />
      <circle cx="-26" cy="-58" r="12" fill="#ff4f6d" stroke-width="3" />
      <circle cx="0" cy="-62" r="12" fill="#ffd23f" stroke-width="3" />
      <circle cx="24" cy="-56" r="12" fill="#9dff8a" stroke-width="3" />
      <path d="M-12 -66 l-10 -6 M12 -68 l10 -6" stroke-width="3" />
    </g>

    <path :d="`M-60 ${GROUND} H1980 V880 H-60 Z`" fill="url(#pumpkin-trick-walk)" stroke="#1b1033" stroke-width="5" />
    <path d="M200 800 V880 M500 800 V880 M800 800 V880 M1100 800 V880 M1400 800 V880 M1700 800 V880" stroke="#5a3a80" stroke-width="4" />
    <path d="M-60 880 H1980 V1200 H-60 Z" fill="url(#pumpkin-trick-street)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M-60 1000 H1980" stroke="#ffb04a" stroke-width="8" stroke-dasharray="80 60" opacity="0.6" />

    <g class="pumpkin-trick-walk">
      <g v-for="(k, i) in KIDS" :key="`kd${i}`" :transform="`translate(${k.x} 960) scale(${k.k})`" stroke="#1b1033" stroke-linejoin="round">
        <g class="pumpkin-trick-step" :style="{ animationDelay: `${k.d}s` }">
          <ellipse cx="0" cy="20" rx="60" ry="10" fill="#120826" opacity="0.4" stroke="none" />
          <template v-if="k.kind === 'ghost'">
            <path d="M-56 20 L-60 -100 Q-60 -170 0 -170 Q60 -170 60 -100 L56 20 L36 4 L18 20 L0 4 L-18 20 L-36 4 Z" fill="#fffaf0" stroke-width="6" />
            <ellipse cx="-20" cy="-110" rx="9" ry="13" fill="#1b1033" stroke="none" />
            <ellipse cx="20" cy="-110" rx="9" ry="13" fill="#1b1033" stroke="none" />
            <ellipse cx="0" cy="-80" rx="10" ry="8" fill="#1b1033" stroke="none" />
          </template>
          <template v-else-if="k.kind === 'witch'">
            <path d="M-50 20 Q-60 -90 0 -96 Q60 -90 50 20 Z" fill="#8a3ab0" stroke-width="6" />
            <circle cx="0" cy="-130" r="38" fill="#9dff8a" stroke-width="5" />
            <path d="M-80 -150 H80" stroke-width="12" stroke-linecap="round" />
            <path d="M-36 -150 L10 -260 L36 -150 Z" fill="#2a1a4a" stroke-width="6" />
            <path d="M-12 -132 h0.1 M12 -132 h0.1" stroke-width="9" stroke-linecap="round" />
            <path d="M-12 -112 Q0 -104 12 -112" stroke-width="4" fill="none" />
          </template>
          <template v-else-if="k.kind === 'pumpkin'">
            <path d="M-46 20 V-60 Q-46 -80 0 -80 Q46 -80 46 -60 V20 Z" fill="#3f9a3a" stroke-width="6" />
            <path d="M-64 -100 Q-74 -180 0 -180 Q74 -180 64 -100 Q60 -60 0 -60 Q-60 -60 -64 -100 Z" fill="url(#pumpkin-trick-pumpkin)" stroke-width="6" />
            <path d="M-30 -136 l12 -16 l12 16 Z M6 -136 l12 -16 l12 16 Z M-30 -100 Q0 -80 30 -100" fill="#fff06a" stroke-width="4" />
            <path d="M0 -180 q4 -20 16 -24" stroke="#3f7a2a" stroke-width="9" fill="none" stroke-linecap="round" />
          </template>
          <template v-else>
            <path d="M-46 20 Q-56 -90 0 -96 Q56 -90 46 20 Z" fill="#2a1a4a" stroke-width="6" />
            <circle cx="0" cy="-130" r="40" fill="#ffc890" stroke-width="5" />
            <path d="M-40 -150 L-34 -196 L-8 -166 M40 -150 L34 -196 L8 -166" fill="#2a1a4a" stroke-width="5" />
            <path d="M-40 -150 Q0 -190 40 -150 Q30 -170 0 -172 Q-30 -170 -40 -150 Z" fill="#2a1a4a" stroke-width="4" />
            <path d="M-12 -130 h0.1 M12 -130 h0.1" stroke-width="9" stroke-linecap="round" />
            <path d="M-6 -118 L0 -114 L6 -118 M-30 -116 L-56 -120 M30 -116 L56 -120" stroke-width="3" fill="none" />
            <path d="M40 0 Q90 -20 80 -80" stroke-width="12" fill="none" stroke-linecap="round" />
            <path d="M40 0 Q90 -20 80 -80" stroke="#2a1a4a" stroke-width="6" fill="none" stroke-linecap="round" />
          </template>
          <path d="M40 -40 L60 -10" stroke-width="5" />
          <path d="M44 -10 H80 L74 30 H50 Z" fill="#ff8a3d" stroke-width="5" />
          <circle cx="56" cy="-14" r="6" fill="#ff4f6d" stroke-width="2" />
          <circle cx="68" cy="-16" r="6" fill="#9dff8a" stroke-width="2" />
        </g>
      </g>
    </g>

    <g fill="#1a0f30" stroke="#0a0418" stroke-width="6" stroke-linejoin="round">
      <path d="M-60 1200 Q-40 1000 100 990 Q140 940 220 960 Q300 960 310 1030 Q360 1050 340 1200 Z" />
      <path d="M1980 1200 Q1960 1010 1840 1000 Q1780 960 1710 990 Q1640 1000 1650 1070 Q1600 1110 1620 1200 Z" />
    </g>
  </g>
</template>

<style scoped>
.pumpkin-trick-bats {
  animation: pumpkin-trick-bats 26s linear infinite;
}

.pumpkin-trick-porch {
  animation: pumpkin-trick-glow 2.2s ease-in-out infinite alternate;
}

.pumpkin-trick-carve {
  animation: pumpkin-trick-glow 0.7s ease-in-out infinite alternate;
}

.pumpkin-trick-walk {
  animation: pumpkin-trick-walk 30s linear infinite alternate;
}

.pumpkin-trick-step {
  animation: pumpkin-trick-step 0.5s ease-in-out infinite alternate;
}

@keyframes pumpkin-trick-bats {
  from {
    translate: -300px 0;
  }
  to {
    translate: 2200px -60px;
  }
}

@keyframes pumpkin-trick-glow {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

@keyframes pumpkin-trick-walk {
  from {
    translate: -260px 0;
  }
  to {
    translate: 260px 0;
  }
}

@keyframes pumpkin-trick-step {
  from {
    translate: 0 0;
    rotate: -2deg;
  }
  to {
    translate: 0 -10px;
    rotate: 2deg;
  }
}
</style>
