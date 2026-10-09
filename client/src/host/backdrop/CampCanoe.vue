<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(318);
const f1 = (n: number) => n.toFixed(1);

const TIERS = [
  { f: 0.66, hw: 0.24 },
  { f: 0.4, hw: 0.36 },
  { f: 0.12, hw: 0.5 },
];
function pine(x: number, base: number, h: number, w: number): string {
  let right = '';
  let left = '';
  let start = `${x} ${base - h}`;
  TIERS.forEach(({ f, hw }, i) => {
    const y = base - h * f;
    const inner = i === TIERS.length - 1 ? 0.08 : hw * 0.45;
    right += ` Q${f1(x + w * hw * 0.7)} ${f1(y - h * 0.06)} ${f1(x + w * hw)} ${f1(y)} L${f1(x + w * inner)} ${f1(y - h * 0.03)}`;
    left = ` L${f1(x - w * inner)} ${f1(y - h * 0.03)} L${f1(x - w * hw)} ${f1(y)} Q${f1(x - w * hw * 0.7)} ${f1(y - h * 0.06)} ${start}` + left;
    start = `${f1(x - w * inner)} ${f1(y - h * 0.03)}`;
  });
  return `M${x} ${base - h}${right} L${f1(x + w * 0.08)} ${base} L${f1(x - w * 0.08)} ${base}${left} Z`;
}
// banks close in toward the sun, so the pines shrink as they near the middle
const FAR_PINES = [
  ...Array.from({ length: 12 }, (_, i) => pine(-40 + i * 56 + rnd() * 20, 640 + i * -3, 120 + rnd() * 60 - i * 4, 80)),
  ...Array.from({ length: 12 }, (_, i) => pine(1960 - i * 56 - rnd() * 20, 640 + i * -3, 120 + rnd() * 60 - i * 4, 80)),
].join(' ');
const NEAR_PINES = [
  pine(-30, 900, 640, 300),
  pine(150, 840, 420, 220),
  pine(300, 760, 260, 150),
  pine(1950, 900, 680, 320),
  pine(1770, 830, 440, 220),
  pine(1620, 760, 280, 150),
].join(' ');
const RIPPLES = [0, 1, 2].map(() =>
  Array.from({ length: 7 }, () => {
    const y = 680 + rnd() * 380;
    const x = 400 + rnd() * 1120;
    const w = 30 + (y - 640) * 0.18;
    return `M${f1(x)} ${f1(y)} h${f1(w)}`;
  }).join(' '),
);
const GLINTS = 'M1240 650 h60 M1210 676 h120 M1250 702 h80 M1190 730 h150 M1230 760 h100 M1180 796 h160';
const BIRDS = [
  { x: 0, y: 0, k: 1 },
  { x: 70, y: -30, k: 0.8 },
  { x: 130, y: 16, k: 0.7 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="camp-canoe-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2c2470" />
        <stop offset="35%" stop-color="#8a3a8a" />
        <stop offset="62%" stop-color="#ff7a5a" />
        <stop offset="78%" stop-color="#ffc46a" />
      </linearGradient>
      <radialGradient id="camp-canoe-sun">
        <stop offset="0%" stop-color="#fff6c0" />
        <stop offset="60%" stop-color="#ffd25a" />
        <stop offset="100%" stop-color="#ff9a3a" />
      </radialGradient>
      <radialGradient id="camp-canoe-halo">
        <stop offset="0%" stop-color="#ffe08a" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#ff8a5a" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="camp-canoe-river" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff9a7a" />
        <stop offset="25%" stop-color="#a85aa0" />
        <stop offset="100%" stop-color="#2c2f70" />
      </linearGradient>
      <linearGradient id="camp-canoe-bank" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2f6070" />
        <stop offset="100%" stop-color="#132438" />
      </linearGradient>
      <linearGradient id="camp-canoe-hull" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff9a4a" />
        <stop offset="100%" stop-color="#c84a22" />
      </linearGradient>
      <linearGradient id="camp-canoe-hull2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5ad0c0" />
        <stop offset="100%" stop-color="#2a8a8a" />
      </linearGradient>
      <linearGradient id="camp-canoe-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8b47a" />
        <stop offset="100%" stop-color="#a8683e" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#camp-canoe-sky)" />
    <circle cx="1270" cy="600" r="300" fill="url(#camp-canoe-halo)" class="camp-canoe-halo" />
    <circle cx="1270" cy="610" r="110" fill="url(#camp-canoe-sun)" stroke="#1b1033" stroke-width="5" />
    <path d="M180 200 Q220 170 290 180 Q340 150 410 176 Q470 170 500 200 Z M1500 150 Q1540 124 1600 134 Q1650 110 1710 136 Q1770 136 1790 160 Z" fill="#ff9ab0" stroke="#c45a8a" stroke-width="3" stroke-linejoin="round" opacity="0.8" />
    <path d="M720 300 Q760 280 820 290 Q860 270 900 290 L900 300 Z" fill="#ffb08a" opacity="0.7" />

    <g class="camp-canoe-birds">
      <path v-for="(b, i) in BIRDS" :key="`bd${i}`" :d="`M${b.x - 18 * b.k} ${300 + b.y} q${9 * b.k} -12 ${18 * b.k} 0 q${9 * b.k} -12 ${18 * b.k} 0`" stroke="#2c2058" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <path d="M-60 600 L160 470 L340 560 L560 440 L760 580 L960 520 L1120 600 L1440 600 L1620 480 L1800 560 L1980 470 L1980 680 L-60 680 Z" fill="#5a3a8a" stroke="#7a5ab0" stroke-width="3" stroke-linejoin="round" />
    <path d="M520 470 L560 440 L600 474 L578 468 L560 482 L540 466 Z M1584 506 L1620 480 L1656 510 L1636 504 L1620 516 L1604 502 Z" fill="#c8a8f0" opacity="0.7" />
    <path :d="FAR_PINES" fill="#3a2f78" stroke="#5a4aa0" stroke-width="3" stroke-linejoin="round" />

    <path d="M-60 640 H1980 V1200 H-60 Z" fill="url(#camp-canoe-river)" />
    <path d="M1180 640 Q1270 620 1360 640 L1420 860 Q1270 880 1120 860 Z" fill="#ffd27a" opacity="0.25" />
    <path :d="GLINTS" stroke="#fff0b0" stroke-width="6" stroke-linecap="round" class="camp-canoe-glint" />
    <path v-for="(d, i) in RIPPLES" :key="`rp${i}`" :d="d" stroke="#ffc8d8" stroke-width="5" stroke-linecap="round" opacity="0.5" class="camp-canoe-ripple" :style="{ animationDelay: `-${i * 1.4}s` }" />

    <path d="M-60 640 Q200 660 360 700 Q480 760 420 900 Q380 1000 200 1200 H-60 Z" fill="url(#camp-canoe-bank)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1980 640 Q1720 660 1560 700 Q1440 760 1500 900 Q1540 1000 1720 1200 H1980 Z" fill="url(#camp-canoe-bank)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="NEAR_PINES" fill="#1a2552" stroke="#0e1430" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <g stroke="#1b1033" stroke-linecap="round">
      <path d="M392 780 Q386 720 396 660 M412 800 Q412 740 424 690 M1530 780 Q1536 720 1524 670 M1508 800 Q1506 750 1496 700 M440 900 Q436 840 446 790" stroke-width="10" fill="none" />
      <path d="M392 780 Q386 720 396 660 M412 800 Q412 740 424 690 M1530 780 Q1536 720 1524 670 M1508 800 Q1506 750 1496 700 M440 900 Q436 840 446 790" stroke="#4a8a68" stroke-width="5" fill="none" />
      <path d="M396 660 v-40 M424 690 v-36 M1524 670 v-40 M446 790 v-40" stroke-width="18" />
      <path d="M396 660 v-40 M424 690 v-36 M1524 670 v-40 M446 790 v-40" stroke="#8a5a3a" stroke-width="10" />
    </g>

    <g transform="translate(700 750) scale(0.62)">
      <g class="camp-canoe-bob">
        <ellipse cx="0" cy="40" rx="280" ry="20" fill="#2a1a4a" opacity="0.35" />
        <g stroke="#1b1033" stroke-linejoin="round">
          <circle cx="-80" cy="-50" r="30" fill="#2c2058" stroke-width="5" />
          <path d="M-114 4 Q-110 -36 -80 -36 Q-50 -36 -46 4 Z" fill="#ffd23f" stroke-width="5" />
          <circle cx="80" cy="-56" r="30" fill="#2c2058" stroke-width="5" />
          <path d="M106 -78 Q80 -102 54 -78 Z" fill="#e8553f" stroke-width="4" />
          <path d="M46 4 Q50 -36 80 -40 Q110 -36 114 4 Z" fill="#5ad0ff" stroke-width="5" />
          <path d="M-260 -10 Q-280 -40 -240 -24 Q0 20 240 -24 Q280 -40 260 -10 Q200 50 0 50 Q-200 50 -260 -10 Z" fill="url(#camp-canoe-hull2)" stroke-width="6" />
          <path d="M-240 -16 Q0 26 240 -16" stroke="#b6f0e8" stroke-width="6" fill="none" />
        </g>
        <g class="camp-canoe-paddle" style="transform-origin: -80px -10px">
          <path d="M-60 -60 L-140 70" stroke="#1b1033" stroke-width="13" stroke-linecap="round" />
          <path d="M-60 -60 L-140 70" stroke="#e8b47a" stroke-width="6" stroke-linecap="round" />
          <path d="M-140 70 l-22 34 l16 10 l22 -34 Z" fill="#e8b47a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        </g>
      </g>
    </g>

    <g transform="translate(960 1070) scale(1.25)">
      <g class="camp-canoe-bob slow">
        <path d="M-300 120 Q-260 -20 -40 -150 Q0 -176 40 -150 Q260 -20 300 120 Z" fill="url(#camp-canoe-hull)" stroke="#1b1033" stroke-width="7" stroke-linejoin="round" />
        <path d="M-230 120 Q-180 10 -20 -110 Q0 -124 20 -110 Q180 10 230 120 Z" fill="#7a3a1e" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M-200 120 Q-150 30 -10 -80 M10 -80 Q150 30 200 120" stroke="#a85a32" stroke-width="5" fill="none" />
        <path d="M-150 40 H150" stroke="#1b1033" stroke-width="22" stroke-linecap="round" />
        <path d="M-150 40 H150" stroke="#c4925a" stroke-width="12" stroke-linecap="round" />
        <path d="M-280 80 Q-240 -10 -50 -136" stroke="#ffd0a0" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.8" />
        <path d="M-20 -30 L-6 -60 L8 -30 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      </g>
    </g>
    <g transform="translate(1330 1010) rotate(205)">
      <path d="M0 -230 V120" stroke="#1b1033" stroke-width="20" stroke-linecap="round" />
      <path d="M0 -230 V120" stroke="#c4925a" stroke-width="10" stroke-linecap="round" />
      <path d="M-36 -236 H36" stroke="#1b1033" stroke-width="22" stroke-linecap="round" />
      <path d="M-36 -236 H36" stroke="#e8b47a" stroke-width="12" stroke-linecap="round" />
      <path d="M0 80 Q-50 100 -46 220 Q0 260 46 220 Q50 100 0 80 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
      <path d="M-26 130 Q-28 170 -20 200" stroke="#fff6c0" stroke-width="6" fill="none" stroke-linecap="round" />
    </g>

    <g class="camp-canoe-flies">
      <circle cx="280" cy="780" r="14" fill="#fff59b" opacity="0.25" />
      <circle cx="280" cy="780" r="5" fill="#fffbd0" />
      <circle cx="1680" cy="720" r="14" fill="#fff59b" opacity="0.25" />
      <circle cx="1680" cy="720" r="5" fill="#fffbd0" />
      <circle cx="420" cy="660" r="12" fill="#fff59b" opacity="0.25" />
      <circle cx="420" cy="660" r="4" fill="#fffbd0" />
    </g>
  </g>
</template>

<style scoped>
.camp-canoe-halo {
  animation: camp-canoe-glow 4s ease-in-out infinite alternate;
}

.camp-canoe-glint {
  animation: camp-canoe-glow 1.8s ease-in-out infinite alternate;
}

.camp-canoe-ripple {
  animation: camp-canoe-ripple 4.2s ease-in-out infinite;
}

.camp-canoe-bob {
  animation: camp-canoe-bob 3s ease-in-out infinite alternate;
}

.camp-canoe-bob.slow {
  animation-duration: 4.4s;
}

.camp-canoe-paddle {
  animation: camp-canoe-paddle 2.4s ease-in-out infinite alternate;
}

.camp-canoe-birds {
  animation: camp-canoe-birds 30s linear infinite;
}

.camp-canoe-flies {
  animation: camp-canoe-flies 5s ease-in-out infinite;
}

@keyframes camp-canoe-glow {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}

@keyframes camp-canoe-ripple {
  0%,
  100% {
    translate: -20px 0;
    opacity: 0.15;
  }
  50% {
    translate: 20px 0;
    opacity: 0.6;
  }
}

@keyframes camp-canoe-bob {
  from {
    translate: 0 0;
    rotate: -1deg;
  }
  to {
    translate: 0 10px;
    rotate: 1deg;
  }
}

@keyframes camp-canoe-paddle {
  from {
    rotate: -16deg;
  }
  to {
    rotate: 18deg;
  }
}

@keyframes camp-canoe-birds {
  from {
    translate: -200px 0;
  }
  to {
    translate: 2200px -80px;
  }
}

@keyframes camp-canoe-flies {
  0%,
  100% {
    translate: 0 0;
    opacity: 0.2;
  }
  50% {
    translate: 26px -30px;
    opacity: 1;
  }
}
</style>
