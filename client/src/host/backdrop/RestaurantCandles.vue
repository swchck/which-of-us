<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(214);
const f1 = (n: number) => n.toFixed(1);
const circ = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;
const BRICKS = (() => {
  let d = '';
  for (let r = 0; r < 14; r++) {
    const y = -40 + r * 52;
    d += `M-60 ${y} H1980 `;
    for (let x = -60 + (r % 2) * 60; x < 1980; x += 120) d += `M${x} ${y} V${y + 52} `;
  }
  return d;
})();
const STARS = twinkleGroups(Array.from({ length: 30 }, () => ({ x: 700 + rnd() * 520, y: 150 + rnd() * 300, r: 1 + rnd() * 2 }))).map((g) => g.map((s) => circ(s.x, s.y, s.r)).join(' '));
const CITY = 'M680 600 V500 H740 V460 H800 V520 H860 V430 H920 V520 H980 V480 H1040 V410 H1100 V500 H1160 V470 H1240 V600 Z';
const LIGHTS = 'M700 520 h0.1 M760 490 h0.1 M820 540 h0.1 M880 460 h0.1 M940 540 h0.1 M1000 500 h0.1 M1060 440 h0.1 M1120 520 h0.1 M1190 500 h0.1 M880 500 h0.1 M1060 480 h0.1';
const ROSES = [
  { x: -24, y: -150, a: -14 },
  { x: 20, y: -170, a: 6 },
  { x: 0, y: -126, a: 0 },
  { x: 40, y: -130, a: 18 },
  { x: -46, y: -126, a: -24 },
];
const PETALS = [
  { x: 560, y: 860, a: 20 },
  { x: 1340, y: 880, a: -30 },
  { x: 700, y: 900, a: 60 },
];
const HEARTS = [0, 1, 2];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="restaurant-candles-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3b1530" />
        <stop offset="100%" stop-color="#1e0c1c" />
      </linearGradient>
      <linearGradient id="restaurant-candles-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0c0a2c" />
        <stop offset="100%" stop-color="#4a2a6e" />
      </linearGradient>
      <radialGradient id="restaurant-candles-moon" cx="38%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#fffbe6" />
        <stop offset="100%" stop-color="#f2d98a" />
      </radialGradient>
      <radialGradient id="restaurant-candles-warm" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffcf6a" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ff8a3d" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="restaurant-candles-cloth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffaf0" />
        <stop offset="100%" stop-color="#f0d8c8" />
      </linearGradient>
      <linearGradient id="restaurant-candles-drape" x1="0" y1="0" x2="50" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
        <stop offset="0%" stop-color="#8c0f3a" />
        <stop offset="50%" stop-color="#d8306a" />
        <stop offset="100%" stop-color="#8c0f3a" />
      </linearGradient>
      <linearGradient id="restaurant-candles-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a1a30" />
        <stop offset="100%" stop-color="#1e0a16" />
      </linearGradient>
      <linearGradient id="restaurant-candles-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e8f6ff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#a8d4f0" stop-opacity="0.6" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="840" fill="url(#restaurant-candles-wall)" />
    <path :d="BRICKS" stroke="#150610" stroke-width="4" opacity="0.6" />

    <path d="M660 640 V280 Q660 120 960 120 Q1260 120 1260 280 V640 Z" fill="url(#restaurant-candles-sky)" />
    <path v-for="(d, gi) in STARS" :key="`st${gi}`" :d="d" fill="#fff6dc" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" />
    <circle cx="1080" cy="270" r="110" fill="#fff4c2" opacity="0.1" />
    <circle cx="1080" cy="270" r="66" fill="url(#restaurant-candles-moon)" stroke="#1b1033" stroke-width="5" />
    <path :d="CITY" fill="#2b1a5e" />
    <path :d="LIGHTS" stroke="#ffd36b" stroke-width="9" stroke-linecap="round" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M660 640 V280 Q660 120 960 120 Q1260 120 1260 280 V640" fill="none" stroke-width="40" />
      <path d="M660 640 V280 Q660 120 960 120 Q1260 120 1260 280 V640" fill="none" stroke="#5a2a20" stroke-width="28" />
      <path d="M960 124 V640 M664 380 H1256" stroke-width="16" />
      <path d="M960 124 V640 M664 380 H1256" stroke="#5a2a20" stroke-width="8" />
      <path d="M620 640 H1300 L1320 670 H600 Z" fill="#7a3a2a" stroke-width="5" filter="url(#cel-s)" />
    </g>
    <g stroke="#1b1033" stroke-width="6" stroke-linejoin="round">
      <path d="M520 60 H700 Q640 300 690 520 Q700 640 620 760 H520 Z" fill="url(#restaurant-candles-drape)" />
      <path d="M1400 60 H1220 Q1280 300 1230 520 Q1220 640 1300 760 H1400 Z" fill="url(#restaurant-candles-drape)" />
      <path d="M500 50 H1420" stroke-width="16" stroke-linecap="round" />
      <path d="M500 50 H1420" stroke="#e8c070" stroke-width="8" stroke-linecap="round" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="120" y="180" width="240" height="300" rx="10" fill="#e8c070" stroke-width="6" filter="url(#cel-s)" />
      <rect x="146" y="206" width="188" height="248" rx="4" fill="#2a1030" stroke-width="4" />
      <path d="M240 260 C200 220 160 270 240 340 C320 270 280 220 240 260 Z" fill="#ff4f6d" stroke-width="5" />
      <rect x="1560" y="200" width="240" height="300" rx="10" fill="#e8c070" stroke-width="6" filter="url(#cel-s)" />
      <rect x="1586" y="226" width="188" height="248" rx="4" fill="#ffe0b0" stroke-width="4" />
      <path d="M1600 440 Q1640 360 1680 400 Q1720 330 1760 440 Z" fill="#5fb04a" stroke-width="4" />
      <circle cx="1720" cy="290" r="26" fill="#ffd23f" stroke-width="4" />
    </g>

    <path d="M-60 780 H1980 V1140 H-60 Z" fill="url(#restaurant-candles-floor)" />
    <path d="M-60 780 H1980" stroke="#1b1033" stroke-width="5" />

    <ellipse cx="960" cy="720" rx="700" ry="380" fill="url(#restaurant-candles-warm)" class="restaurant-candles-warm" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="960" cy="1100" rx="560" ry="40" fill="#0a0410" opacity="0.4" stroke="none" />
      <path d="M440 840 Q440 820 470 820 H1450 Q1480 820 1480 840 L1520 1110 H400 Z" fill="url(#restaurant-candles-cloth)" stroke-width="7" filter="url(#cel)" />
      <path d="M440 860 H1480" stroke="#e8c8b8" stroke-width="5" />
      <path d="M480 1110 Q500 960 470 860 M1440 1110 Q1420 960 1450 860 M760 1110 Q780 980 760 860 M1160 1110 Q1140 980 1160 860" stroke="#e0c0b0" stroke-width="5" fill="none" />
    </g>

    <g v-for="(px, i) in [690, 1230]" :key="`pl${i}`" :transform="`translate(${px} 850)`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="0" rx="120" ry="28" fill="#fffaf0" stroke-width="5" />
      <ellipse cx="0" cy="-4" rx="80" ry="16" fill="#f0e0d0" stroke-width="3" />
      <path d="M-50 -6 Q-30 -30 0 -20 Q30 -34 50 -8 Q30 6 0 0 Q-30 8 -50 -6 Z" fill="#ffd27a" stroke-width="4" />
      <path d="M-30 -14 q10 -8 20 0 M0 -16 q10 -8 20 2" stroke="#e0a040" stroke-width="3" fill="none" />
      <circle cx="-8" cy="-14" r="9" fill="#e8304a" stroke-width="3" />
      <circle cx="18" cy="-10" r="8" fill="#e8304a" stroke-width="3" />
      <path :d="i ? 'M-150 -10 L-190 20 M-140 -16 L-176 16' : 'M150 -10 L190 20 M140 -16 L176 16'" stroke="#c9d4f2" stroke-width="7" stroke-linecap="round" />
    </g>
    <g v-for="(gx, i) in [560, 1360]" :key="`gl${i}`" :transform="`translate(${gx} 840)`" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-30 -110 Q-34 -60 0 -50 Q34 -60 30 -110 Z" fill="url(#restaurant-candles-glass)" stroke-width="5" />
      <path d="M-28 -84 Q-28 -60 0 -54 Q28 -60 28 -84 Z" fill="#ff7ab0" stroke-width="3" />
      <path d="M0 -50 V-6 M-24 0 H24" stroke-width="6" stroke-linecap="round" />
      <path d="M-18 -100 V-80" stroke="#fff" stroke-width="5" stroke-linecap="round" />
    </g>

    <g transform="translate(960 830)" stroke="#1b1033" stroke-linejoin="round">
      <g v-for="(r, i) in ROSES" :key="`rs${i}`">
        <path :d="`M0 -40 Q${r.x * 0.5} ${r.y * 0.6} ${r.x} ${r.y}`" stroke="#3f8a3a" stroke-width="6" fill="none" />
        <g :transform="`translate(${r.x} ${r.y}) rotate(${r.a})`">
          <path d="M-22 4 Q-26 -24 0 -26 Q26 -24 22 4 Q0 16 -22 4 Z" fill="#e8304a" stroke-width="4" />
          <path d="M-10 -6 Q0 -18 10 -6 Q0 2 -10 -6 Z" fill="#a8183a" stroke-width="3" />
        </g>
      </g>
      <path d="M30 -90 q24 -10 30 10 q-20 10 -30 -10 Z M-30 -80 q-24 -6 -30 14 q22 6 30 -14 Z" fill="#5fb04a" stroke-width="3" />
      <path d="M-36 0 Q-46 -40 -20 -50 H20 Q46 -40 36 0 Z" fill="url(#restaurant-candles-glass)" stroke-width="5" />
    </g>

    <g v-for="(cx, i) in [820, 1100]" :key="`cd${i}`">
      <g :transform="`translate(${cx} 840)`" stroke="#1b1033" stroke-linejoin="round">
        <path d="M-30 0 Q-30 -14 0 -14 Q30 -14 30 0 Z" fill="#e8c070" stroke-width="4" />
        <rect x="-12" y="-130" width="24" height="118" rx="5" fill="#fffaf0" stroke-width="5" />
        <path d="M-12 -122 q6 12 12 0 q6 16 12 0" fill="#f0e0d0" stroke-width="3" />
        <path d="M0 -130 v-12" stroke-width="4" />
      </g>
      <g :transform="`translate(${cx} 698)`">
        <circle r="70" fill="url(#restaurant-candles-warm)" class="restaurant-candles-halo" />
        <g class="restaurant-candles-flame" :style="{ animationDelay: `-${i * 0.15}s` }">
          <path d="M0 0 Q-16 -18 0 -46 Q16 -18 0 0 Z" fill="#ffb02e" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
          <path d="M0 -6 Q-7 -16 0 -30 Q7 -16 0 -6 Z" fill="#fff6c0" />
        </g>
      </g>
    </g>

    <path v-for="(p, i) in PETALS" :key="`pt${i}`" d="M0 0 q10 -14 20 0 q-10 10 -20 0 Z" :transform="`translate(${p.x} ${p.y}) rotate(${p.a})`" fill="#e8304a" stroke="#1b1033" stroke-width="3" />

    <g v-for="i in HEARTS" :key="`ht${i}`" class="restaurant-candles-heart" :style="{ animationDelay: `-${i * 2}s` }">
      <path :d="`M${900 + i * 60} 600 c-10 -14 -30 -4 -20 12 l20 18 l20 -18 c10 -16 -10 -26 -20 -12 Z`" fill="#ff7ab0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    </g>
  </g>
</template>

<style scoped>
.restaurant-candles-warm {
  animation: restaurant-candles-glow 2.4s ease-in-out infinite alternate;
}

.restaurant-candles-halo {
  animation: restaurant-candles-glow 0.9s ease-in-out infinite alternate;
}

.restaurant-candles-flame {
  transform-origin: 0 0;
  animation: restaurant-candles-flame 0.3s ease-in-out infinite alternate;
}

.restaurant-candles-heart {
  animation: restaurant-candles-heart 6s ease-out infinite;
}

@keyframes restaurant-candles-glow {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

@keyframes restaurant-candles-flame {
  from {
    scale: 1 1;
    rotate: -4deg;
  }
  to {
    scale: 0.9 1.12;
    rotate: 4deg;
  }
}

@keyframes restaurant-candles-heart {
  from {
    translate: 0 0;
    opacity: 0;
  }
  20% {
    opacity: 0.9;
  }
  to {
    translate: 30px -260px;
    opacity: 0;
  }
}
</style>
