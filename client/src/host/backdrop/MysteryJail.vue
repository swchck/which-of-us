<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(8128);
const f1 = (n: number) => n.toFixed(1);
const STONES = (() => {
  let d = '';
  for (let r = 0; r < 12; r++) {
    const y = -40 + r * 64;
    let x = -60 - (r % 2) * 70;
    while (x < 1980) {
      const w = 110 + rnd() * 60;
      d += `M${f1(x + 6)} ${y + 6} h${f1(w - 12)} q6 0 6 6 v46 q0 6 -6 6 h${f1(-(w - 12))} q-6 0 -6 -6 v-46 q0 -6 6 -6 Z `;
      x += w;
    }
  }
  return d;
})();
const TALLY = [0, 1, 2].map((g) => `M${460 + g * 90} 330 v70 M${478 + g * 90} 330 v70 M${496 + g * 90} 330 v70 M${514 + g * 90} 330 v70 M${450 + g * 90} 380 l76 -36`).join(' ');
const BARS = [-20, 60, 140].map((x) => x);
const BARS_R = [1780, 1860, 1940];
const DIRT = 'M1260 820 Q1300 760 1360 770 Q1400 740 1440 780 Q1500 790 1490 830 Z';
</script>

<template>
  <g>
    <defs>
      <linearGradient id="mystery-jail-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a428a" />
        <stop offset="100%" stop-color="#2c275e" />
      </linearGradient>
      <linearGradient id="mystery-jail-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a5294" />
        <stop offset="100%" stop-color="#2b2a5c" />
      </linearGradient>
      <linearGradient id="mystery-jail-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#120a36" />
        <stop offset="100%" stop-color="#2e2470" />
      </linearGradient>
      <linearGradient id="mystery-jail-bar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#c9d4f2" />
        <stop offset="100%" stop-color="#6a78b0" />
      </linearGradient>
      <linearGradient id="mystery-jail-blanket" x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
        <stop offset="0%" stop-color="#ff8a3a" />
        <stop offset="50%" stop-color="#ff8a3a" />
        <stop offset="50%" stop-color="#fffaf0" />
        <stop offset="100%" stop-color="#fffaf0" />
      </linearGradient>
      <radialGradient id="mystery-jail-hole" cx="50%" cy="60%" r="60%">
        <stop offset="0%" stop-color="#05030f" />
        <stop offset="100%" stop-color="#2a1a1a" />
      </radialGradient>
      <linearGradient id="mystery-jail-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6c0" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fff6c0" stop-opacity="0" />
      </linearGradient>
      <clipPath id="mystery-jail-hole-clip"><path d="M1290 790 Q1290 650 1380 640 Q1470 650 1470 790 Z" /></clipPath>
      <clipPath id="mystery-jail-window"><rect x="820" y="80" width="280" height="220" /></clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="840" fill="url(#mystery-jail-wall)" />
    <path :d="STONES" fill="#3e3878" stroke="#241e50" stroke-width="3" />

    <rect x="820" y="80" width="280" height="220" fill="url(#mystery-jail-sky)" />
    <g clip-path="url(#mystery-jail-window)">
      <circle cx="1030" cy="150" r="40" fill="#fff4c2" stroke="#1b1033" stroke-width="4" />
      <path d="M840 140 h0.1 M900 110 h0.1 M960 170 h0.1 M880 200 h0.1" stroke="#fff6dc" stroke-width="5" stroke-linecap="round" />
      <g class="mystery-jail-search" style="transform-origin: 960px 420px">
        <path d="M940 420 L860 60 H1060 L980 420 Z" fill="#fff6c0" opacity="0.35" />
      </g>
      <path d="M820 270 H1100 V300 H820 Z M860 270 V230 H900 V270 M1000 270 V220 H1040 V270" fill="#1b1638" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="806" y="66" width="308" height="248" rx="6" fill="none" stroke="#6a62a8" stroke-width="20" />
      <rect x="806" y="66" width="308" height="248" rx="6" fill="none" stroke-width="4" />
      <path d="M876 80 V300 M946 80 V300 M1016 80 V300 M820 190 H1100" stroke-width="14" stroke-linecap="round" />
      <path d="M876 80 V300 M946 80 V300 M1016 80 V300 M820 190 H1100" stroke="url(#mystery-jail-bar)" stroke-width="7" stroke-linecap="round" />
    </g>
    <path d="M940 314 L760 780 H1300 L1000 314 Z" fill="url(#mystery-jail-beam)" opacity="0.35" />

    <path :d="TALLY" stroke="#d8d0f0" stroke-width="6" stroke-linecap="round" opacity="0.8" />

    <g transform="translate(1380 220) rotate(4)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-110" y="0" width="220" height="260" fill="#ffe0a0" stroke-width="5" />
      <path d="M-80 220 L-30 120 L10 180 L50 100 L90 220 Z" fill="#7ed06a" stroke-width="4" />
      <circle cx="50" cy="60" r="24" fill="#ffd23f" stroke-width="4" />
      <path d="M-110 260 Q-60 300 -20 250 Q30 300 110 260" fill="#e8c890" stroke-width="5" />
      <path d="M-104 6 l14 0 M96 6 l14 0" stroke="#d8d0f0" stroke-width="10" />
    </g>

    <path d="M-60 780 H1980 V1140 H-60 Z" fill="url(#mystery-jail-floor)" />
    <path d="M-60 780 H1980" stroke="#1b1033" stroke-width="5" />
    <path d="M200 860 H700 M1100 920 H1700 M300 1000 H900 M1300 1060 H1900" stroke="#3a3478" stroke-width="5" opacity="0.7" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M1290 790 Q1290 650 1380 640 Q1470 650 1470 790 Z" fill="url(#mystery-jail-hole)" stroke-width="7" filter="url(#cel-s)" />
      <path d="M1310 700 l-20 -10 M1460 690 l20 -16 M1330 660 l-14 -20" stroke-width="5" stroke-linecap="round" />
      <path :d="DIRT" fill="#8a5a3a" stroke-width="5" />
      <path d="M1300 800 h0.1 M1340 776 h0.1 M1420 790 h0.1 M1470 810 h0.1" stroke="#c48a52" stroke-width="10" stroke-linecap="round" />
    </g>
    <g clip-path="url(#mystery-jail-hole-clip)">
      <g class="mystery-jail-mouse">
        <g transform="translate(1380 760)" stroke="#1b1033" stroke-linejoin="round">
          <circle cx="-24" cy="-36" r="14" fill="#c9c3e6" stroke-width="4" />
          <circle cx="24" cy="-36" r="14" fill="#c9c3e6" stroke-width="4" />
          <circle cx="-24" cy="-36" r="6" fill="#ff9ab8" stroke="none" />
          <circle cx="24" cy="-36" r="6" fill="#ff9ab8" stroke="none" />
          <path d="M-30 10 Q-34 -30 0 -30 Q34 -30 30 10 Z" fill="#c9c3e6" stroke-width="4" />
          <circle cx="-10" cy="-12" r="4" fill="#1b1033" stroke="none" />
          <circle cx="10" cy="-12" r="4" fill="#1b1033" stroke="none" />
          <circle cx="0" cy="-2" r="5" fill="#ff9ab8" stroke-width="2" />
        </g>
      </g>
    </g>
    <path d="M1260 818 H1500" stroke="#1b1033" stroke-width="5" />

    <g transform="translate(1180 930) rotate(-20)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="90" ry="10" fill="#120a2a" opacity="0.4" stroke="none" />
      <path d="M-80 0 H40" stroke-width="16" stroke-linecap="round" />
      <path d="M-80 0 H40" stroke="#e8eefc" stroke-width="8" stroke-linecap="round" />
      <ellipse cx="70" cy="0" rx="40" ry="24" fill="#e8eefc" stroke-width="6" />
      <path d="M56 -10 Q70 -16 86 -8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>
    <g transform="translate(1250 905)">
      <path class="mystery-jail-glint" d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z" fill="#fffbe0" />
    </g>

    <g transform="translate(420 0)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-200 470 V1000 M200 470 V1000" stroke-width="22" stroke-linecap="round" />
      <path d="M-200 470 V1000 M200 470 V1000" stroke="#8b9dd8" stroke-width="12" stroke-linecap="round" />
      <rect x="-210" y="560" width="420" height="40" rx="8" fill="#8b9dd8" stroke-width="5" />
      <path d="M-200 560 Q-190 500 -120 500 H170 Q200 500 200 560 Z" fill="url(#mystery-jail-blanket)" stroke-width="5" />
      <rect x="-190" y="490" width="110" height="50" rx="20" fill="#fffaf0" stroke-width="5" />
      <rect x="-210" y="840" width="420" height="40" rx="8" fill="#8b9dd8" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-200 840 Q-190 770 -120 770 H170 Q200 770 200 840 Z" fill="url(#mystery-jail-blanket)" stroke-width="5" />
      <rect x="80" y="760" width="110" height="50" rx="20" fill="#fffaf0" stroke-width="5" />
      <path d="M-160 600 V840 M-120 600 V840" stroke-width="5" />
      <path d="M-160 640 H-120 M-160 700 H-120 M-160 760 H-120" stroke-width="5" />
    </g>
    <g transform="translate(720 960)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="30" rx="60" ry="10" fill="#120a2a" opacity="0.4" stroke="none" />
      <path d="M-34 30 L-40 -40 H40 L34 30 Z" fill="#c9d4f2" stroke-width="5" />
      <path d="M40 -26 Q70 -20 64 6 Q60 20 36 16" fill="none" stroke-width="7" />
      <ellipse cx="0" cy="-40" rx="40" ry="10" fill="#8b9dd8" stroke-width="4" />
    </g>

    <g stroke="#1b1033" stroke-linecap="round">
      <path v-for="x in [...BARS, ...BARS_R]" :key="`br${x}`" :d="`M${x} -60 V1140`" stroke-width="40" />
      <path v-for="x in [...BARS, ...BARS_R]" :key="`bc${x}`" :d="`M${x} -60 V1140`" stroke="#a8b4dc" stroke-width="26" />
      <path v-for="x in [...BARS, ...BARS_R]" :key="`bh${x}`" :d="`M${x - 6} -60 V1140`" stroke="#e8eefc" stroke-width="6" />
      <path d="M-60 120 H180 M-60 960 H180 M1740 120 H1980 M1740 960 H1980" stroke-width="30" />
      <path d="M-60 120 H180 M-60 960 H180 M1740 120 H1980 M1740 960 H1980" stroke="#8b9dd8" stroke-width="18" />
    </g>
    <g transform="translate(1800 560)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-60" y="-50" width="100" height="120" rx="12" fill="#8b9dd8" stroke-width="6" />
      <circle cx="-10" cy="0" r="14" fill="#1b1033" />
      <path d="M-10 6 V36" stroke-width="10" />
    </g>
  </g>
</template>

<style scoped>
.mystery-jail-search {
  animation: mystery-jail-sweep 6s ease-in-out infinite alternate;
}

.mystery-jail-mouse {
  animation: mystery-jail-peek 7s ease-in-out infinite;
}

.mystery-jail-glint {
  animation: mystery-jail-glint 2.4s ease-in-out infinite;
}

@keyframes mystery-jail-sweep {
  from {
    rotate: -24deg;
  }
  to {
    rotate: 24deg;
  }
}

/* the cellmate pops out of the tunnel, looks around and ducks back in */
@keyframes mystery-jail-peek {
  0%,
  25%,
  100% {
    translate: 0 70px;
  }
  40%,
  75% {
    translate: 0 0;
  }
}

@keyframes mystery-jail-glint {
  0%,
  60%,
  100% {
    opacity: 0;
    scale: 0.5;
  }
  75% {
    opacity: 1;
    scale: 1.2;
  }
}
</style>
