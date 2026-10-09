<script setup lang="ts">
import { strokeText } from './kit';

const f1 = (n: number) => n.toFixed(1);
const circ = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;
const STRIPES = Array.from({ length: 26 }, (_, i) => `M${-60 + i * 80} -60 V720`).join(' ');
// the trail runs from the cake table to the dog bed, and the dog has cream on its nose
const PAWS = (
  [
    [820, 880, 0.8],
    [760, 900, 0.85],
    [690, 916, 0.9],
    [620, 940, 0.95],
    [550, 956, 1],
    [480, 980, 1.05],
  ] as const
)
  .map(([x, y, k]) => [circ(x, y, 9 * k), circ(x - 9 * k, y - 12 * k, 4 * k), circ(x, y - 16 * k, 4 * k), circ(x + 9 * k, y - 12 * k, 4 * k)].join(' '))
  .join(' ');
const CRUMBS = 'M880 860 h0.1 M850 880 h0.1 M800 870 h0.1 M720 900 h0.1 M650 930 h0.1 M590 944 h0.1 M520 970 h0.1';
const MARKERS = [
  { x: 1000, y: 900, n: '1' },
  { x: 650, y: 980, n: '2' },
  { x: 1450, y: 920, n: '3' },
].map((m) => ({ ...m, d: strokeText(m.n, m.x, m.y - 10, 26, 'middle') }));
const TAPES = ['translate(0 1010) rotate(-3 960 0)', 'translate(-1500 520) rotate(-38 960 0)'];
const TAPE_WORDS = Array.from({ length: 4 }, (_, i) => strokeText('Не входить', 220 + i * 520, 26, 30)).join(' ');
</script>

<template>
  <g>
    <defs>
      <linearGradient id="mystery-crime-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a2f7a" />
        <stop offset="100%" stop-color="#5b4a9e" />
      </linearGradient>
      <linearGradient id="mystery-crime-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a5a6a" />
        <stop offset="100%" stop-color="#4a2a4a" />
      </linearGradient>
      <linearGradient id="mystery-crime-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b47640" />
        <stop offset="100%" stop-color="#7a4422" />
      </linearGradient>
      <linearGradient id="mystery-crime-cloth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffaf0" />
        <stop offset="100%" stop-color="#d8d0f0" />
      </linearGradient>
      <linearGradient id="mystery-crime-sponge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe0a0" />
        <stop offset="100%" stop-color="#e8b060" />
      </linearGradient>
      <radialGradient id="mystery-crime-lamp" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stop-color="#fff0b0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#fff0b0" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="mystery-crime-lens" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#bfe6ff" stop-opacity="0.2" />
      </radialGradient>
      <linearGradient id="mystery-crime-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#120a36" />
        <stop offset="100%" stop-color="#2e2470" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="800" fill="url(#mystery-crime-wall)" />
    <path :d="STRIPES" stroke="#4a3f8a" stroke-width="22" opacity="0.6" />
    <rect x="-60" y="560" width="2040" height="180" fill="#2c2160" />
    <rect x="-60" y="548" width="2040" height="16" fill="url(#mystery-crime-wood)" stroke="#1b1033" stroke-width="4" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1400" y="110" width="360" height="380" fill="url(#mystery-crime-sky)" stroke-width="6" />
      <circle cx="1650" cy="200" r="50" fill="#fff4c2" stroke-width="4" />
      <path d="M1400 110 H1760 V490 H1400 Z" fill="none" stroke-width="28" />
      <path d="M1400 110 H1760 V490 H1400 Z" fill="none" stroke="#c8b8ff" stroke-width="18" />
      <path d="M1580 110 V490 M1400 300 H1760" stroke-width="14" />
      <path d="M1580 110 V490 M1400 300 H1760" stroke="#c8b8ff" stroke-width="7" />
      <path d="M1370 480 H1790 L1806 504 H1354 Z" fill="#c8b8ff" stroke-width="5" filter="url(#cel-s)" />
    </g>

    <g transform="translate(320 160)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-120" y="0" width="240" height="280" rx="8" fill="url(#mystery-crime-wood)" stroke-width="6" filter="url(#cel-s)" />
      <rect x="-96" y="24" width="192" height="232" rx="4" fill="#ffe0b0" stroke-width="4" />
      <path d="M-50 170 Q-60 90 0 84 Q60 90 50 170 Z" fill="#ff8a5a" stroke-width="4" />
      <circle cx="0" cy="80" r="40" fill="#f0c890" stroke-width="4" />
      <path d="M-30 50 L-40 30 L-16 44 M30 50 L40 30 L16 44" fill="#f0c890" stroke-width="4" />
      <path d="M-14 76 h0.1 M14 76 h0.1" stroke-width="8" stroke-linecap="round" />
      <path d="M-8 96 Q0 102 8 96" stroke-width="3" fill="none" />
      <path d="M-50 230 H50" stroke="#c89060" stroke-width="10" stroke-linecap="round" />
    </g>

    <path d="M-60 740 H1980 V1140 H-60 Z" fill="url(#mystery-crime-floor)" />
    <path d="M-60 740 H1980" stroke="#1b1033" stroke-width="5" />
    <path d="M300 740 L-100 1140 M700 740 L560 1140 M1220 740 L1360 1140 M1620 740 L2000 1140" stroke="#6a3a5a" stroke-width="4" opacity="0.6" />

    <g class="mystery-crime-lamp" style="transform-origin: 1060px -60px">
      <path d="M1060 -60 V300" stroke="#1b1033" stroke-width="5" />
      <path d="M1000 340 Q1000 296 1060 292 Q1120 296 1120 340 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M1040 344 L780 860 H1340 L1080 344 Z" fill="url(#mystery-crime-lamp)" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="1060" cy="920" rx="330" ry="30" fill="#2a1030" opacity="0.4" stroke="none" />
      <path d="M800 800 V920 M1320 800 V920" stroke-width="22" stroke-linecap="round" />
      <path d="M800 800 V920 M1320 800 V920" stroke="#b47640" stroke-width="12" stroke-linecap="round" />
      <path d="M770 700 H1350 L1380 800 H740 Z" fill="url(#mystery-crime-cloth)" stroke-width="6" filter="url(#cel)" />
      <path d="M740 800 Q780 830 820 800 Q860 830 900 800 Q940 830 980 800 Q1020 830 1060 800 Q1100 830 1140 800 Q1180 830 1220 800 Q1260 830 1300 800 Q1340 830 1380 800" fill="#ff9ab0" stroke-width="4" />
    </g>
    <g transform="translate(1060 730)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="0" rx="170" ry="26" fill="#e8e0f0" stroke-width="5" />
      <path d="M-130 -6 V-110 H40 L0 -6 Z" fill="url(#mystery-crime-sponge)" stroke-width="6" />
      <path d="M-130 -110 Q-110 -90 -90 -110 Q-70 -90 -50 -110 Q-30 -90 -10 -110 Q10 -90 40 -110" fill="#ff9ccf" stroke-width="4" />
      <path d="M-130 -60 H20" stroke="#ff9ccf" stroke-width="10" />
      <path d="M40 -110 L0 -6 L40 -6 M40 -110 L130 -110 V-6 H40" fill="none" stroke-width="4" stroke-dasharray="8 8" opacity="0.6" />
      <path d="M90 -6 Q110 -24 130 -10 Q120 4 90 -6 Z" fill="url(#mystery-crime-sponge)" stroke-width="3" />
      <ellipse cx="-50" cy="-126" rx="70" ry="14" fill="#ffd0e8" stroke-width="4" />
      <circle cx="-80" cy="-142" r="14" fill="#e8304a" stroke-width="4" />
      <path d="M-80 -156 q4 -14 14 -16" stroke-width="3" fill="none" />
      <path d="M150 -20 L200 -60" stroke-width="10" stroke-linecap="round" />
      <path d="M150 -20 L200 -60" stroke="#c9d4f2" stroke-width="5" stroke-linecap="round" />
    </g>
    <path :d="CRUMBS" stroke="#e8b060" stroke-width="10" stroke-linecap="round" />
    <path :d="PAWS" fill="#2a1030" opacity="0.6" />

    <g v-for="(m, i) in MARKERS" :key="`mk${i}`" stroke="#1b1033" stroke-linejoin="round">
      <path :d="`M${m.x - 34} ${m.y + 20} L${m.x - 22} ${m.y - 46} H${m.x + 22} L${m.x + 34} ${m.y + 20} Z`" fill="#ffd23f" stroke-width="5" />
      <path :d="m.d" fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <g transform="translate(330 1010)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="190" ry="20" fill="#2a1030" opacity="0.4" stroke="none" />
      <path d="M-170 30 Q-180 -50 -120 -60 H120 Q180 -50 170 30 Q0 60 -170 30 Z" fill="#4a7ad8" stroke-width="6" filter="url(#cel-s)" />
      <g class="mystery-crime-snore">
        <path d="M-110 10 Q-120 -50 -40 -56 Q20 -60 60 -40 Q90 -60 120 -30 Q130 10 80 20 Q-20 30 -110 10 Z" fill="#e8b47a" stroke-width="5" />
        <path d="M60 -40 Q70 -80 110 -70 Q140 -60 130 -30" fill="#e8b47a" stroke-width="5" />
        <path d="M70 -60 Q40 -100 60 -110 Q80 -90 84 -66" fill="#a8683e" stroke-width="4" />
        <path d="M100 -46 q6 4 12 0" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cx="134" cy="-36" r="8" fill="#1b1033" stroke="none" />
        <ellipse cx="136" cy="-46" rx="12" ry="7" fill="#fff" stroke-width="3" />
      </g>
      <g class="mystery-crime-z" stroke="none" fill="#fffaf0">
        <path d="M150 -110 h22 l-22 26 h22" stroke="#fffaf0" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      </g>
    </g>

    <g class="mystery-crime-glass">
      <g transform="translate(1640 940) rotate(-30)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M0 110 V250" stroke-width="34" stroke-linecap="round" />
        <path d="M0 110 V250" stroke="#8a4a2a" stroke-width="22" stroke-linecap="round" />
        <circle r="110" fill="url(#mystery-crime-lens)" stroke-width="7" />
        <circle r="110" fill="none" stroke="#ffd23f" stroke-width="16" />
        <circle r="110" fill="none" stroke-width="5" />
        <circle r="126" fill="none" stroke-width="5" />
        <path d="M-60 -50 Q-40 -76 -10 -80" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="(t, i) in TAPES" :key="`tp${i}`" :transform="t">
      <rect x="-100" y="-25" width="2120" height="50" fill="#ffd23f" stroke="#1b1033" stroke-width="5" />
      <path :d="TAPE_WORDS" transform="translate(0 -21)" fill="none" stroke="#1b1033" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <g class="mystery-crime-flash">
      <rect x="-60" y="-60" width="2040" height="1260" fill="#fffbe0" />
    </g>
  </g>
</template>

<style scoped>
.mystery-crime-lamp {
  animation: mystery-crime-sway 5s ease-in-out infinite alternate;
}

.mystery-crime-snore {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: mystery-crime-snore 2.4s ease-in-out infinite alternate;
}

.mystery-crime-z {
  animation: mystery-crime-z 2.4s ease-out infinite;
}

.mystery-crime-glass {
  animation: mystery-crime-glass 7s ease-in-out infinite alternate;
}

.mystery-crime-flash {
  opacity: 0;
  animation: mystery-crime-flash 7s linear infinite;
}

@keyframes mystery-crime-sway {
  from {
    rotate: -1.5deg;
  }
  to {
    rotate: 1.5deg;
  }
}

@keyframes mystery-crime-snore {
  from {
    scale: 1 1;
  }
  to {
    scale: 1.03 1.08;
  }
}

@keyframes mystery-crime-z {
  from {
    translate: 0 0;
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  to {
    translate: 30px -60px;
    opacity: 0;
  }
}

@keyframes mystery-crime-glass {
  from {
    translate: 0 0;
  }
  to {
    translate: -160px -30px;
  }
}

/* a crime-scene camera going off now and then */
@keyframes mystery-crime-flash {
  0%,
  94%,
  100% {
    opacity: 0;
  }
  95% {
    opacity: 0.35;
  }
}
</style>
