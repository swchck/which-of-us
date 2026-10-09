<script setup lang="ts">
import { seeded, tufts, twinkleGroups } from './kit';

const rnd = seeded(4040);
const f1 = (n: number) => n.toFixed(1);
const circ = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;
const STARS = twinkleGroups(Array.from({ length: 90 }, () => ({ x: rnd() * 1920, y: rnd() * 520, r: 0.9 + rnd() * 2.2 }))).map((g) => g.map((s) => circ(s.x, s.y, s.r)).join(' '));
const DASHES = Array.from({ length: 12 }, (_, i) => `M${-60 + i * 180} 836 h100`).join(' ');
const STEAM = [0, 1, 2];
const POLES = [300, 960];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="roadtrip-night-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#070f38" />
        <stop offset="60%" stop-color="#1d1f66" />
        <stop offset="100%" stop-color="#4a2f84" />
      </linearGradient>
      <radialGradient id="roadtrip-night-moon" cx="38%" cy="34%" r="70%">
        <stop offset="0%" stop-color="#fffbe6" />
        <stop offset="100%" stop-color="#f2d98a" />
      </radialGradient>
      <linearGradient id="roadtrip-night-field" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2f4a70" />
        <stop offset="100%" stop-color="#1d2a52" />
      </linearGradient>
      <linearGradient id="roadtrip-night-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2f6070" />
        <stop offset="100%" stop-color="#132438" />
      </linearGradient>
      <linearGradient id="roadtrip-night-road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a3a5a" />
        <stop offset="100%" stop-color="#25253f" />
      </linearGradient>
      <linearGradient id="roadtrip-night-car" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff9a4a" />
        <stop offset="100%" stop-color="#d0502a" />
      </linearGradient>
      <radialGradient id="roadtrip-night-hazard">
        <stop offset="0%" stop-color="#ffb02e" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#ffb02e" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="roadtrip-night-beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fff6c0" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#fff6c0" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="roadtrip-night-lamp" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stop-color="#ffe08a" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ffe08a" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#roadtrip-night-sky)" />
    <path v-for="(d, gi) in STARS" :key="`st${gi}`" :d="d" fill="#fff6dc" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" />
    <circle cx="1560" cy="170" r="200" fill="#fff4c2" opacity="0.07" />
    <circle cx="1560" cy="170" r="84" fill="url(#roadtrip-night-moon)" stroke="#1b1033" stroke-width="5" />
    <circle cx="1530" cy="150" r="14" fill="#e2c574" opacity="0.7" />
    <circle cx="1590" cy="200" r="10" fill="#e2c574" opacity="0.7" />
    <line x1="0" y1="0" x2="140" y2="60" stroke="#fff" stroke-width="4" stroke-linecap="round" class="shooting" />

    <path d="M-60 640 Q300 560 700 600 Q1100 540 1500 590 Q1760 560 1980 590 V760 H-60 Z" fill="#26306a" stroke="#4a4a98" stroke-width="3" stroke-linejoin="round" />
    <path d="M-60 680 Q500 650 960 670 Q1400 690 1980 660 V760 H-60 Z" fill="url(#roadtrip-night-field)" />
    <path d="M1120 640 h40 v-40 h30 v40 h20" fill="#1d2552" stroke="#1d2552" stroke-width="4" />
    <path d="M1150 616 h12 v12 h-12 Z" fill="#ffd36b" />

    <g v-for="x in POLES" :key="`lp${x}`">
      <ellipse :cx="x + 60" cy="800" rx="200" ry="70" fill="url(#roadtrip-night-lamp)" />
      <path :d="`M${x} 760 V440 Q${x} 410 ${x + 40} 410 H${x + 70}`" stroke="#1b1033" stroke-width="14" fill="none" stroke-linecap="round" />
      <path :d="`M${x} 760 V440 Q${x} 410 ${x + 40} 410 H${x + 70}`" stroke="#5a5a8a" stroke-width="6" fill="none" stroke-linecap="round" />
      <path :d="`M${x + 44} 414 h52 l-8 16 h-36 Z`" fill="#ffe08a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path :d="`M${x + 52} 430 L${x - 60} 790 H${x + 200} Z`" fill="#ffe08a" opacity="0.1" />
    </g>

    <rect x="-60" y="760" width="2040" height="160" fill="url(#roadtrip-night-road)" stroke="#1b1033" stroke-width="5" />
    <path :d="DASHES" stroke="#c9c3e6" stroke-width="8" opacity="0.8" />
    <path d="M-60 776 H1980 M-60 904 H1980" stroke="#c9c3e6" stroke-width="5" opacity="0.6" />

    <g transform="translate(1440 880)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="340" ry="22" fill="#0a0a1a" opacity="0.5" stroke="none" />
      <path d="M-300 -10 V-90 Q-300 -120 -270 -120 L-200 -124 L-120 -210 H120 L190 -130 L280 -120 Q320 -116 320 -80 V-10 Z" fill="url(#roadtrip-night-car)" stroke-width="7" filter="url(#cel)" />
      <path d="M-104 -196 H-10 V-134 H-180 Z M10 -196 H110 L168 -134 H10 Z" fill="#3a4a8a" stroke-width="5" />
      <path d="M-90 -186 L-120 -146 M30 -186 L10 -150" stroke="#8aa8e8" stroke-width="6" stroke-linecap="round" />
      <path d="M-300 -60 H320" stroke-width="4" />
      <path d="M-20 -110 V-20" stroke-width="4" />
      <rect x="-12" y="-96" width="26" height="8" rx="3" fill="#1b1033" stroke="none" />
      <path d="M190 -124 L300 -260 L320 -244 L230 -120 Z" fill="url(#roadtrip-night-car)" stroke-width="6" />
      <path d="M200 -128 L270 -132 L290 -120" fill="#2a2a44" stroke-width="5" />
      <rect x="226" y="-148" width="70" height="26" rx="6" fill="#5a5a7a" stroke-width="4" />
      <circle cx="-190" cy="-2" r="54" fill="#2a2240" stroke-width="7" />
      <circle cx="-190" cy="-2" r="22" fill="#c9d4f2" stroke-width="5" />
      <circle cx="200" cy="-2" r="54" fill="#2a2240" stroke-width="7" />
      <circle cx="200" cy="-2" r="22" fill="#c9d4f2" stroke-width="5" />
      <path d="M-150 -216 V-232 H110 V-216" fill="none" stroke-width="6" />
      <rect x="-130" y="-276" width="120" height="44" rx="10" fill="#4a7ad8" stroke-width="5" />
      <rect x="0" y="-266" width="90" height="34" rx="8" fill="#ffd23f" stroke-width="5" />
      <rect x="296" y="-84" width="26" height="22" rx="5" fill="#ffb02e" stroke-width="4" />
      <rect x="-306" y="-84" width="22" height="22" rx="5" fill="#ffb02e" stroke-width="4" />
    </g>
    <g class="roadtrip-night-hazard">
      <circle cx="1750" cy="807" r="60" fill="url(#roadtrip-night-hazard)" />
      <circle cx="1145" cy="807" r="60" fill="url(#roadtrip-night-hazard)" />
      <rect x="1736" y="796" width="26" height="22" rx="5" fill="#fff0a0" />
      <rect x="1134" y="796" width="22" height="22" rx="5" fill="#fff0a0" />
    </g>
    <circle v-for="i in STEAM" :key="`sm${i}`" cx="1690" cy="720" r="26" fill="#c9c3e6" opacity="0.7" class="roadtrip-night-steam" :style="{ animationDelay: `-${i * 1.2}s` }" />

    <path d="M-60 916 Q400 900 960 920 Q1500 940 1980 910 V1200 H-60 Z" fill="url(#roadtrip-night-near)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(30, 930, 1900, 0.012)" stroke="#4a8a98" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />

    <g transform="translate(860 900)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="10" rx="80" ry="10" fill="#0a0a1a" opacity="0.4" stroke="none" />
      <path d="M0 -110 L70 10 H-70 Z" fill="#e8304a" stroke-width="7" />
      <path d="M0 -70 L36 -6 H-36 Z" fill="#2a2240" stroke-width="5" />
      <path d="M-30 10 L-50 30 M30 10 L50 30" stroke-width="7" stroke-linecap="round" />
    </g>
    <g class="roadtrip-night-glint">
      <path d="M860 790 L930 910 H790 Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" opacity="0.8" />
    </g>

    <g transform="translate(1100 1040)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="44" rx="110" ry="14" fill="#0a0a1a" opacity="0.4" stroke="none" />
      <path d="M-26 40 V-50 M26 40 V-50" stroke-width="24" stroke-linecap="round" />
      <path d="M-26 40 V-50 M26 40 V-50" stroke="#3f4a8a" stroke-width="14" stroke-linecap="round" />
      <path d="M-56 -50 Q-64 -190 0 -196 Q64 -190 56 -50 Z" fill="#ffd23f" stroke-width="6" filter="url(#cel-s)" />
      <circle cx="0" cy="-240" r="50" fill="#ffc890" stroke-width="5" />
      <path d="M-54 -246 Q-50 -306 0 -308 Q50 -306 54 -246 Q20 -270 -54 -246 Z" fill="#5a3a2a" stroke-width="5" />
      <path d="M-18 -240 h0.1 M18 -240 h0.1" stroke-width="10" stroke-linecap="round" />
      <ellipse cx="0" cy="-212" rx="10" ry="8" fill="#1b1033" stroke="none" />
      <path d="M40 -150 L120 -170" stroke-width="20" stroke-linecap="round" />
      <path d="M40 -150 L120 -170" stroke="#ffd23f" stroke-width="11" stroke-linecap="round" />
      <rect x="112" y="-190" width="70" height="34" rx="8" fill="#5a5a7a" stroke-width="5" transform="rotate(-14 147 -173)" />
    </g>
    <g class="roadtrip-night-beam" style="transform-origin: 1280px 868px">
      <path d="M1280 868 L1700 700 L1720 800 Z" fill="url(#roadtrip-night-beam)" />
    </g>

    <g fill="#0f1a34" stroke="#05081a" stroke-width="6" stroke-linejoin="round">
      <path d="M-60 1200 Q-40 980 120 960 Q160 900 240 930 Q330 920 340 1000 Q400 1020 380 1200 Z" />
    </g>
    <g class="roadtrip-night-crickets" fill="#fff59b">
      <circle cx="120" cy="1000" r="5" />
      <circle cx="260" cy="1040" r="4" />
      <circle cx="1820" cy="990" r="5" />
    </g>
  </g>
</template>

<style scoped>
.roadtrip-night-hazard {
  animation: roadtrip-night-hazard 1s steps(1) infinite;
}

.roadtrip-night-steam {
  transform-box: fill-box;
  transform-origin: center;
  animation: roadtrip-night-steam 3.6s ease-out infinite;
}

.roadtrip-night-glint {
  animation: roadtrip-night-hazard 1s steps(1) infinite;
  animation-delay: -0.5s;
}

.roadtrip-night-beam {
  animation: roadtrip-night-beam 3s ease-in-out infinite alternate;
}

.roadtrip-night-crickets {
  animation: roadtrip-night-flies 4s ease-in-out infinite;
}

@keyframes roadtrip-night-hazard {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes roadtrip-night-steam {
  from {
    translate: 0 0;
    scale: 0.6;
    opacity: 0.8;
  }
  to {
    translate: 30px -220px;
    scale: 2;
    opacity: 0;
  }
}

@keyframes roadtrip-night-beam {
  from {
    rotate: -6deg;
  }
  to {
    rotate: 4deg;
  }
}

@keyframes roadtrip-night-flies {
  0%,
  100% {
    opacity: 0.2;
    translate: 0 0;
  }
  50% {
    opacity: 1;
    translate: 14px -20px;
  }
}
</style>
