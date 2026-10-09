<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(2025);
const f1 = (n: number) => n.toFixed(1);
const rad = (a: number) => (a * Math.PI) / 180;
const circ = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;
const STARS = twinkleGroups(Array.from({ length: 70 }, () => ({ x: rnd() * 1920, y: rnd() * 640, r: 0.9 + rnd() * 2 }))).map((g) => g.map((s) => circ(s.x, s.y, s.r)).join(' '));
const ray = (n: number, r: number, inner: number, turn = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = rad(i * (360 / n) + turn);
    return `M${f1(Math.cos(a) * r * inner)} ${f1(Math.sin(a) * r * inner)} L${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`;
  }).join(' ');
const tips = (n: number, r: number, turn = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = rad(i * (360 / n) + turn);
    return `M${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)} h0.1`;
  }).join(' ');
const BURSTS = [
  { x: 260, y: 220, r: 150, c: '#ff4fa8', tip: '#fff3a0', d: 0, n: 16 },
  { x: 700, y: 140, r: 120, c: '#7af0ff', tip: '#ffffff', d: -1.1, n: 14 },
  { x: 1230, y: 200, r: 170, c: '#ffd23f', tip: '#ff8a2f', d: -2.3, n: 18 },
  { x: 1680, y: 260, r: 140, c: '#9dff8a', tip: '#ffffff', d: -0.6, n: 14 },
  { x: 960, y: 380, r: 110, c: '#b07aff', tip: '#ff7ab0', d: -3.1, n: 12 },
  { x: 480, y: 430, r: 100, c: '#ff8a2f', tip: '#fff3a0', d: -1.8, n: 12 },
  { x: 1500, y: 470, r: 96, c: '#ff4f6d', tip: '#ffffff', d: -2.8, n: 12 },
];
const TRAILS = [
  { x: 380, d: -0.4 },
  { x: 1100, d: -1.6 },
  { x: 1780, d: -2.7 },
];
const CROWD = Array.from({ length: 22 }, (_, i) => ({ x: -40 + i * 92 + rnd() * 20, y: 1030 + (i % 3) * 18, k: 0.8 + rnd() * 0.4 }));
const WHEEL_SPOKES = Array.from({ length: 12 }, (_, i) => {
  const a = rad(i * 30);
  return `M0 0 L${f1(Math.cos(a) * 200)} ${f1(Math.sin(a) * 200)}`;
}).join(' ');
const WHEEL_BULBS = tips(24, 200);
</script>

<template>
  <g>
    <defs>
      <linearGradient id="fair-fireworks-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a0626" />
        <stop offset="60%" stop-color="#2a1260" />
        <stop offset="100%" stop-color="#7a2a7a" />
      </linearGradient>
      <linearGradient id="fair-fireworks-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2e1842" />
        <stop offset="100%" stop-color="#140a22" />
      </linearGradient>
      <radialGradient id="fair-fireworks-flash">
        <stop offset="0%" stop-color="#fff6d0" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#fff6d0" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#fair-fireworks-sky)" />
    <path v-for="(d, gi) in STARS" :key="`st${gi}`" :d="d" fill="#fff6dc" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" />

    <g v-for="(t, i) in TRAILS" :key="`tr${i}`" class="fair-fireworks-trail" :style="{ animationDelay: `${t.d}s` }">
      <path :d="`M${t.x} 900 v-80`" stroke="#fff3a0" stroke-width="6" stroke-linecap="round" stroke-dasharray="4 14" />
      <circle :cx="t.x" cy="818" r="7" fill="#fffbe0" />
    </g>

    <g v-for="(b, i) in BURSTS" :key="`bs${i}`" :transform="`translate(${b.x} ${b.y})`">
      <circle :r="b.r * 1.6" fill="url(#fair-fireworks-flash)" class="fair-fireworks-flash" :style="{ animationDelay: `${b.d}s` }" />
      <g class="fair-fireworks-burst" :style="{ animationDelay: `${b.d}s` }">
        <path :d="ray(b.n, b.r, 0.3)" :stroke="b.c" stroke-width="8" stroke-linecap="round" />
        <path :d="tips(b.n, b.r)" :stroke="b.tip" stroke-width="14" stroke-linecap="round" />
        <path :d="ray(b.n, b.r * 0.55, 0.35, 180 / b.n)" :stroke="b.tip" stroke-width="5" stroke-linecap="round" />
        <circle r="12" :fill="b.tip" />
      </g>
    </g>

    <g transform="translate(320 780)">
      <g stroke="#1b1033" stroke-linejoin="round">
        <path d="M-150 300 L0 0 L150 300" stroke="#3a1f5a" stroke-width="24" fill="none" />
        <circle r="210" fill="none" stroke="#3a1f5a" stroke-width="16" />
        <path :d="WHEEL_SPOKES" stroke="#3a1f5a" stroke-width="8" />
      </g>
      <g class="fair-fireworks-wheel">
        <path :d="WHEEL_BULBS" stroke="#ffd23f" stroke-width="12" stroke-linecap="round" />
      </g>
    </g>
    <path d="M-60 900 Q60 860 160 876 Q240 840 340 870 Q460 844 560 872 Q700 850 820 870 Q960 856 1080 872 Q1240 848 1340 870 Q1460 840 1580 872 Q1720 846 1840 868 Q1920 856 1980 870 L1980 1200 L-60 1200 Z" fill="#2a1442" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <g transform="translate(1500 870)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
      <path d="M-150 0 V-90 H150 V0 Z" fill="#3a1f5a" />
      <path d="M-170 -90 L0 -190 L170 -90 Z" fill="#4a2a6a" />
      <path d="M0 -190 V-220" />
      <path d="M-150 -90 H150" stroke="#ffd23f" stroke-width="6" stroke-dasharray="2 22" stroke-linecap="round" class="fair-fireworks-bulbs" />
    </g>
    <g transform="translate(1000 870)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
      <path d="M-70 0 L0 -110 L70 0 Z M-30 0 L0 -60 L30 0" fill="#3a1f5a" />
    </g>
    <path d="M-60 900 Q480 880 960 896 Q1440 912 1980 890 V1200 H-60 Z" fill="url(#fair-fireworks-ground)" filter="url(#cel)" stroke="#1b1033" stroke-width="5" />

    <g fill="#1a0a2e" stroke="#0a0418" stroke-width="5" stroke-linejoin="round">
      <g v-for="(p, i) in CROWD" :key="`cr${i}`" :transform="`translate(${f1(p.x)} ${p.y}) scale(${f1(p.k)})`">
        <path d="M-44 120 Q-50 20 0 16 Q50 20 44 120 Z" />
        <circle cx="0" cy="-20" r="34" />
        <path v-if="i % 4 === 1" d="M30 30 L70 -60" stroke-width="26" stroke-linecap="round" />
      </g>
    </g>
    <g class="fair-fireworks-sparkler">
      <path d="M1112 940 l-14 -14 M1112 940 l16 -12 M1112 940 l0 -20 M1112 940 l-18 4 M1112 940 l18 6" stroke="#fff3a0" stroke-width="5" stroke-linecap="round" />
      <circle cx="1112" cy="940" r="16" fill="#fff6c0" opacity="0.5" />
    </g>
  </g>
</template>

<style scoped>
.fair-fireworks-burst {
  animation: fair-fireworks-burst 3.6s ease-out infinite;
}

.fair-fireworks-flash {
  animation: fair-fireworks-flash 3.6s ease-out infinite;
}

.fair-fireworks-trail {
  animation: fair-fireworks-trail 3.6s ease-out infinite;
}

.fair-fireworks-wheel {
  animation: fair-fireworks-blink 1s steps(2) infinite;
}

.fair-fireworks-bulbs {
  animation: fair-fireworks-blink 0.8s steps(2) infinite;
}

.fair-fireworks-sparkler {
  animation: fair-fireworks-blink 0.2s steps(2) infinite;
}

@keyframes fair-fireworks-burst {
  0% {
    scale: 0.15;
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  60% {
    scale: 1;
    opacity: 1;
  }
  100% {
    scale: 1.12;
    opacity: 0;
    translate: 0 30px;
  }
}

@keyframes fair-fireworks-flash {
  0%,
  100% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes fair-fireworks-trail {
  0% {
    translate: 0 0;
    opacity: 1;
  }
  40% {
    translate: 0 -500px;
    opacity: 0;
  }
  100% {
    translate: 0 -500px;
    opacity: 0;
  }
}

@keyframes fair-fireworks-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.35;
  }
}
</style>
