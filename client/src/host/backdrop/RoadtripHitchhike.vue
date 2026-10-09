<script setup lang="ts">
import { seeded, strokeText, tufts } from './kit';

const rnd = seeded(2718);
const f1 = (n: number) => n.toFixed(1);
const PLEA = strokeText('На море!', 0, 0, 34, 'middle');
const ROAD_SIGN = strokeText('Море', 0, 18, 36, 'middle');
const DASHES = Array.from({ length: 12 }, (_, i) => `M${-60 + i * 180} 836 h100`).join(' ');
const FLOWERS = Array.from({ length: 26 }, () => ({ x: rnd() * 2000 - 40, y: 640 + rnd() * 90, k: 0.5 + rnd() * 0.4 }));
const POLES = [140, 620, 1100, 1580];
const CLOUDS = [
  { y: 150, k: 1, d: 0, s: 110 },
  { y: 300, k: 0.7, d: 60, s: 140 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="roadtrip-hitch-field" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a8d85a" />
        <stop offset="100%" stop-color="#6aa83a" />
      </linearGradient>
      <linearGradient id="roadtrip-hitch-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8fcf5a" />
        <stop offset="100%" stop-color="#4f9a3a" />
      </linearGradient>
      <linearGradient id="roadtrip-hitch-road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6a6a8a" />
        <stop offset="100%" stop-color="#4a4a6a" />
      </linearGradient>
      <linearGradient id="roadtrip-hitch-truck" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#c9d4f2" />
      </linearGradient>
      <linearGradient id="roadtrip-hitch-cab" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff7a5a" />
        <stop offset="100%" stop-color="#d8402a" />
      </linearGradient>
      <linearGradient id="roadtrip-hitch-card" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4d0a0" />
        <stop offset="100%" stop-color="#d8a46a" />
      </linearGradient>
    </defs>

    <circle cx="1700" cy="160" r="170" fill="#fff6c0" opacity="0.35" />
    <circle cx="1700" cy="160" r="90" fill="#ffe14d" stroke="#1b1033" stroke-width="5" />
    <g v-for="(c, i) in CLOUDS" :key="`cl${i}`" class="roadtrip-hitch-cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-150 20 Q-170 -10 -120 -20 Q-110 -60 -50 -50 Q-20 -90 40 -66 Q90 -80 110 -36 Q170 -36 160 20 Z" fill="#fff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      </g>
    </g>

    <path d="M-60 600 Q300 540 700 580 Q1100 520 1500 570 Q1760 540 1980 570 V760 H-60 Z" fill="#7cbf5a" stroke="#4f8a3a" stroke-width="3" stroke-linejoin="round" />
    <path d="M-60 640 Q500 610 960 630 Q1400 650 1980 620 V760 H-60 Z" fill="url(#roadtrip-hitch-field)" />
    <g v-for="(f, i) in FLOWERS" :key="`fl${i}`" :transform="`translate(${f1(f.x)} ${f1(f.y)}) scale(${f1(f.k)})`" stroke="#1b1033" stroke-width="3">
      <path d="M0 0 V40" stroke="#3f7a2a" stroke-width="5" />
      <circle r="16" fill="#ffd23f" />
      <circle r="7" fill="#8a4a2a" />
    </g>
    <g stroke="#1b1033" stroke-linecap="round">
      <path v-for="x in POLES" :key="`pl${x}`" :d="`M${x} 760 V560 M${x - 30} 580 H${x + 30}`" stroke-width="12" />
      <path v-for="x in POLES" :key="`pc${x}`" :d="`M${x} 760 V560 M${x - 30} 580 H${x + 30}`" stroke="#a8683e" stroke-width="5" />
    </g>
    <path d="M-60 586 Q20 600 140 580 Q380 610 620 580 Q860 610 1100 580 Q1340 610 1580 580 Q1800 606 1980 586" stroke="#1b1033" stroke-width="3" fill="none" />

    <rect x="-60" y="760" width="2040" height="160" fill="url(#roadtrip-hitch-road)" stroke="#1b1033" stroke-width="5" />
    <path :d="DASHES" stroke="#fff" stroke-width="8" />
    <path d="M-60 776 H1980 M-60 904 H1980" stroke="#fffaf0" stroke-width="5" opacity="0.8" />

    <g class="roadtrip-hitch-truck">
      <g transform="translate(0 828)" stroke="#1b1033" stroke-linejoin="round">
        <ellipse cx="260" cy="24" rx="300" ry="12" fill="#2a2a44" opacity="0.4" stroke="none" />
        <rect x="0" y="-220" width="400" height="210" rx="10" fill="url(#roadtrip-hitch-truck)" stroke-width="6" />
        <path d="M30 -180 Q120 -200 200 -170 Q280 -140 370 -170" stroke="#4fb8ff" stroke-width="22" fill="none" stroke-linecap="round" />
        <circle cx="120" cy="-90" r="34" fill="#ffd23f" stroke-width="5" />
        <path d="M180 -100 h160 M180 -70 h120" stroke="#4fb8ff" stroke-width="14" stroke-linecap="round" />
        <path d="M410 -10 V-130 Q410 -150 430 -150 H490 Q520 -150 530 -110 L550 -60 V-10 Z" fill="url(#roadtrip-hitch-cab)" stroke-width="6" />
        <path d="M440 -136 H486 Q504 -136 512 -110 L522 -84 H440 Z" fill="#bfe6ff" stroke-width="4" />
        <rect x="532" y="-50" width="22" height="16" rx="4" fill="#fff6a0" stroke-width="3" />
        <circle cx="80" cy="0" r="32" fill="#2a2240" stroke-width="5" />
        <circle cx="80" cy="0" r="12" fill="#c9d4f2" stroke-width="4" />
        <circle cx="320" cy="0" r="32" fill="#2a2240" stroke-width="5" />
        <circle cx="320" cy="0" r="12" fill="#c9d4f2" stroke-width="4" />
        <circle cx="480" cy="0" r="32" fill="#2a2240" stroke-width="5" />
        <circle cx="480" cy="0" r="12" fill="#c9d4f2" stroke-width="4" />
      </g>
    </g>
    <g class="roadtrip-hitch-van">
      <g transform="translate(0 896) scale(-1 1)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M-130 -10 V-110 Q-130 -130 -110 -130 H60 Q100 -130 120 -80 L136 -50 V-10 Z" fill="#5fd06a" stroke-width="6" />
        <path d="M-110 -116 H-30 V-74 H-110 Z M-14 -116 H54 Q80 -116 94 -80 L100 -74 H-14 Z" fill="#bfe6ff" stroke-width="4" />
        <path d="M-130 -40 H136" stroke="#fff" stroke-width="8" />
        <circle cx="-80" cy="-4" r="26" fill="#2a2240" stroke-width="5" />
        <circle cx="-80" cy="-4" r="10" fill="#c9d4f2" stroke-width="3" />
        <circle cx="80" cy="-4" r="26" fill="#2a2240" stroke-width="5" />
        <circle cx="80" cy="-4" r="10" fill="#c9d4f2" stroke-width="3" />
        <path d="M-100 -130 V-150 H40 V-130" fill="none" stroke-width="5" />
        <rect x="-90" y="-176" width="110" height="26" rx="6" fill="#ffb02e" stroke-width="4" />
      </g>
    </g>

    <path d="M-60 916 Q400 900 960 920 Q1500 940 1980 910 V1200 H-60 Z" fill="url(#roadtrip-hitch-near)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(30, 930, 1900, 0.012)" stroke="#a8e07a" stroke-width="5" fill="none" stroke-linecap="round" />

    <g transform="translate(330 920)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M0 0 V-260" stroke-width="14" />
      <path d="M0 0 V-260" stroke="#c9d4f2" stroke-width="6" />
      <rect x="-110" y="-360" width="220" height="110" rx="12" fill="#2f5ec0" stroke-width="6" filter="url(#cel-s)" />
      <rect x="-98" y="-348" width="196" height="86" rx="8" fill="none" stroke="#fff" stroke-width="4" />
    </g>
    <g transform="translate(330 600)">
      <path :d="ROAD_SIGN" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" transform="translate(-26 0)" />
      <path d="M52 -2 h40 m-14 -14 l14 14 l-14 14" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <g transform="translate(1480 1000) scale(1.18)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="50" rx="160" ry="18" fill="#2a4a1a" opacity="0.35" stroke="none" />
      <path d="M-30 40 V-60 M30 40 V-60" stroke-width="26" stroke-linecap="round" />
      <path d="M-30 40 V-60 M30 40 V-60" stroke="#3f6ad0" stroke-width="16" stroke-linecap="round" />
      <path d="M-120 -70 Q-130 -190 -70 -200 H0 Q-30 -120 -50 -60 Z" fill="#ff8a3a" stroke-width="6" />
      <path d="M-56 -60 Q-70 -200 0 -206 Q70 -200 56 -60 Z" fill="#5fb04a" stroke-width="6" filter="url(#cel-s)" />
      <circle cx="0" cy="-252" r="52" fill="#ffc890" stroke-width="5" />
      <path d="M-60 -256 Q-60 -320 0 -320 Q60 -320 60 -256 H-60 Z" fill="#ffd23f" stroke-width="5" />
      <path d="M40 -270 H110" stroke-width="12" stroke-linecap="round" />
      <path d="M40 -270 H110" stroke="#ffd23f" stroke-width="6" stroke-linecap="round" />
      <path d="M-18 -252 h0.1 M18 -252 h0.1" stroke-width="10" stroke-linecap="round" />
      <path d="M-22 -226 Q0 -206 22 -226" stroke-width="5" fill="none" stroke-linecap="round" />
      <g class="roadtrip-hitch-thumb" style="transform-origin: -50px -170px">
        <path d="M-50 -170 L-170 -220" stroke-width="22" stroke-linecap="round" />
        <path d="M-50 -170 L-170 -220" stroke="#5fb04a" stroke-width="13" stroke-linecap="round" />
        <path d="M-196 -228 Q-210 -232 -206 -210 Q-200 -194 -180 -198 L-160 -206 Q-150 -222 -164 -236 Z" fill="#ffc890" stroke-width="5" />
        <path d="M-196 -228 L-200 -262 Q-200 -276 -188 -272 L-180 -236" fill="#ffc890" stroke-width="5" />
      </g>
      <g transform="translate(130 -40) rotate(6)">
        <path d="M-10 0 V120" stroke-width="10" />
        <rect x="-150" y="-80" width="300" height="110" rx="6" fill="url(#roadtrip-hitch-card)" stroke-width="6" />
        <path d="M-130 -60 l20 6 M120 10 l-16 -8" stroke="#b07a4a" stroke-width="4" />
        <path :d="PLEA" transform="translate(0 -8)" fill="none" stroke="#c8302e" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </g>
    <g transform="translate(1180 1050)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-70 40 Q-80 -60 0 -66 Q80 -60 70 40 Z" fill="#e8553f" stroke-width="6" />
      <path d="M-40 -10 H40 V34 H-40 Z" fill="#ffd23f" stroke-width="5" />
      <path d="M-70 40 H70" stroke-width="5" />
      <path d="M-30 -66 Q0 -100 30 -66" fill="none" stroke-width="8" />
    </g>
  </g>
</template>

<style scoped>
.roadtrip-hitch-cloud {
  animation: roadtrip-hitch-cloud linear infinite;
}

.roadtrip-hitch-truck {
  animation: roadtrip-hitch-truck 9s linear infinite;
}

.roadtrip-hitch-van {
  animation: roadtrip-hitch-van 9s linear infinite;
  animation-delay: -4s;
}

.roadtrip-hitch-thumb {
  animation: roadtrip-hitch-wave 1.2s ease-in-out infinite alternate;
}

@keyframes roadtrip-hitch-cloud {
  from {
    translate: -300px 0;
  }
  to {
    translate: 2250px 0;
  }
}

/* rushes past, then waits off screen a while: nobody stops, of course */
@keyframes roadtrip-hitch-truck {
  0% {
    translate: -700px 0;
  }
  40%,
  100% {
    translate: 2100px 0;
  }
}

@keyframes roadtrip-hitch-van {
  0% {
    translate: 2200px 0;
  }
  35%,
  100% {
    translate: -300px 0;
  }
}

@keyframes roadtrip-hitch-wave {
  from {
    rotate: -6deg;
  }
  to {
    rotate: 8deg;
  }
}
</style>
