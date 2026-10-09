<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(7321);
const f1 = (n: number) => n.toFixed(1);
const VP = { x: 960, y: 360 };
const WALL_FOOT = 800;
const FLOOR_TOP = 830;
const PAPER_EDGE = 640;
const PAINT_EDGE = 1400;

const recede = (x: number, yNear: number, yFar: number) => VP.x + ((x - VP.x) * (yFar - VP.y)) / (yNear - VP.y);
const blob = (x: number, y: number, r: number) => {
  const k = r * 0.55;
  return `M${f1(x - r)} ${f1(y)} C${f1(x - r)} ${f1(y - k)} ${f1(x - k)} ${f1(y - r * 0.8)} ${f1(x)} ${f1(y - r * 0.8)} C${f1(x + k * 1.3)} ${f1(y - r)} ${f1(x + r * 1.1)} ${f1(y - k)} ${f1(x + r)} ${f1(y + k * 0.4)} C${f1(x + r * 0.8)} ${f1(y + r)} ${f1(x - k)} ${f1(y + r * 0.9)} ${f1(x - r)} ${f1(y)} Z`;
};

const STRIP_W = 140;
const PAPER_SEAMS = Array.from({ length: 5 }, (_, i) => `M${-60 + (i + 1) * STRIP_W} 40 V${WALL_FOOT}`).join(' ');
const PAPER_DIAMONDS = (() => {
  let d = '';
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 9; row++) {
      const x = -60 + col * STRIP_W + 40 + (row % 2) * 60;
      const y = 90 + row * 80;
      d += `M${x} ${y - 12} l9 12 l-9 12 l-9 -12 Z `;
    }
  }
  return d;
})();
const PAPER_STEMS = Array.from({ length: 5 }, (_, col) => {
  const x = -60 + col * STRIP_W + 70;
  return `M${x} 60 q-16 40 0 80 t0 80 t0 80 t0 80 t0 80 t0 80 t0 80 t0 80 t0 80`;
}).join(' ');

// ragged roller edge where the fresh paint stops
const PAINT_SHAPE = (() => {
  let d = `M1980 40 H${PAINT_EDGE}`;
  for (let y = 40; y < WALL_FOOT; y += 60) {
    const dx = (rnd() - 0.5) * 50;
    d += ` L${f1(PAINT_EDGE + dx)} ${y + 30} L${f1(PAINT_EDGE + 10 + dx * 0.4)} ${y + 60}`;
  }
  return `${d} L${PAINT_EDGE} ${WALL_FOOT} H1980 Z`;
})();
const ROLLER_STREAKS = Array.from({ length: 8 }, (_, i) => {
  const x = PAINT_EDGE + 60 + i * 66;
  return `M${x} ${f1(70 + rnd() * 60)} V${f1(640 + rnd() * 120)}`;
}).join(' ');

const SPACKLE = Array.from({ length: 7 }, (_, i) => {
  const x = 700 + i * 100 + (rnd() - 0.5) * 60;
  const y = i % 2 ? 140 + rnd() * 120 : 560 + rnd() * 150;
  return blob(x, y, 22 + rnd() * 26);
}).join(' ');

const BOARDS = Array.from({ length: 21 }, (_, i) => -1640 + i * 180)
  .map((x) => `M${f1(recede(x, 1140, FLOOR_TOP))} ${FLOOR_TOP} L${x} 1140`)
  .join(' ');

const SHEET_FOLDS = [
  'M-20 900 Q120 940 260 920',
  'M520 880 Q700 930 860 900 Q960 884 1040 910',
  'M1180 900 Q1320 950 1460 924',
  'M140 1010 Q360 1060 600 1030',
  'M820 1000 Q1000 1050 1200 1020',
  'M1380 1040 Q1600 1000 1900 1060',
].join(' ');
const FLOOR_SPLATS = [blob(560, 1000, 18), blob(600, 1020, 8), blob(1330, 980, 14), blob(1300, 1004, 6), blob(140, 1080, 20)].join(' ');

const LADDER = { yTop: 330, yFoot: 880, l0: 180, l1: 250, r0: 420, r1: 350 };
const railX = (x0: number, x1: number, y: number) => x0 + ((x1 - x0) * (LADDER.yFoot - y)) / (LADDER.yFoot - LADDER.yTop);
const RAILS = `M${LADDER.l0} ${LADDER.yFoot} L${LADDER.l1} ${LADDER.yTop} M${LADDER.r0} ${LADDER.yFoot} L${LADDER.r1} ${LADDER.yTop}`;
const STEPS = [430, 530, 630, 730, 830]
  .map((y) => `M${f1(railX(LADDER.l0, LADDER.l1, y))} ${y} H${f1(railX(LADDER.r0, LADDER.r1, y))}`)
  .join(' ');

const RADIO_SPLATS = [blob(1604, 668, 10), blob(1740, 742, 12), blob(1700, 662, 6), blob(1596, 752, 7)].join(' ');
const GRILLE = [-24, -12, 0, 12, 24].map((y) => `M${f1(1630 - Math.sqrt(30 * 30 - y * y))} ${712 + y} H${f1(1630 + Math.sqrt(30 * 30 - y * y))}`).join(' ');

const bucket = (cx: number, top: number, bottom: number, wTop: number, wBottom: number) =>
  `M${cx - wTop / 2} ${top} L${cx - wBottom / 2} ${bottom} Q${cx} ${bottom + 10} ${cx + wBottom / 2} ${bottom} L${cx + wTop / 2} ${top} Z`;
const BUCKET_A = bucket(1680, 772, 900, 190, 156);
const BUCKET_B = bucket(1880, 806, 930, 170, 140);
</script>

<template>
  <g>
    <defs>
      <linearGradient id="repair-paper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffe6ee" />
        <stop offset="100%" stop-color="#f4bfd0" />
      </linearGradient>
      <linearGradient id="repair-paint" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8fe0c8" />
        <stop offset="100%" stop-color="#4fb69a" />
      </linearGradient>
      <linearGradient id="repair-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e2ac70" />
        <stop offset="100%" stop-color="#a8683a" />
      </linearGradient>
      <linearGradient id="repair-sheet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f4fbff" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#c4e0f2" stop-opacity="0.6" />
      </linearGradient>
      <linearGradient id="repair-wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffd987" />
        <stop offset="100%" stop-color="#e09a3e" />
      </linearGradient>
      <linearGradient id="repair-bucket" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#c2cadc" />
      </linearGradient>
      <linearGradient id="repair-radio" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff8f6a" />
        <stop offset="100%" stop-color="#d04a36" />
      </linearGradient>
      <linearGradient id="repair-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e2e6f0" />
        <stop offset="100%" stop-color="#8a92aa" />
      </linearGradient>
      <linearGradient id="repair-drill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe066" />
        <stop offset="100%" stop-color="#eaa21e" />
      </linearGradient>
      <radialGradient id="repair-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff6c0" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#fff6c0" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-repair)" />

    <path :d="SPACKLE" fill="#fbf4e8" stroke="#d6bc96" stroke-width="3" opacity="0.8" />
    <g fill="none" stroke="#7a6a8a" stroke-width="3" stroke-linecap="round" opacity="0.55">
      <path d="M820 130 l18 18 M838 130 l-18 18 M1180 120 l18 18 M1198 120 l-18 18" />
      <path d="M800 180 H1220 M1010 170 v20" stroke-dasharray="14 10" />
      <path d="M1250 230 q14 -18 28 0 q-4 14 -14 18 v10 M1264 274 v2" />
    </g>

    <rect x="-60" y="40" :width="PAPER_EDGE + 60" :height="WALL_FOOT - 40" fill="url(#repair-paper)" />
    <path :d="PAPER_STEMS" fill="none" stroke="#9ed6a8" stroke-width="4" stroke-linecap="round" />
    <path :d="PAPER_DIAMONDS" fill="#ff9fba" stroke="#d66a8c" stroke-width="2.5" />
    <path :d="PAPER_SEAMS" stroke="#d99ab0" stroke-width="3" />
    <path :d="`M${PAPER_EDGE} 40 V${WALL_FOOT}`" stroke="#1b1033" stroke-width="4" />

    <path :d="PAINT_SHAPE" fill="url(#repair-paint)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="ROLLER_STREAKS" stroke="#b8f4e2" stroke-width="18" stroke-linecap="round" opacity="0.35" />

    <rect x="-60" y="-60" width="2040" height="100" fill="#fbf6ec" stroke="#1b1033" stroke-width="4" />
    <path d="M300 40 l20 -14 l16 8 l22 -18 M1500 40 l-14 -12 l10 -10" fill="none" stroke="#b8a690" stroke-width="3" stroke-linecap="round" />

    <rect x="-60" :y="WALL_FOOT" width="2040" :height="FLOOR_TOP - WALL_FOOT" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
    <rect x="-60" :y="FLOOR_TOP" width="2040" height="320" fill="url(#repair-floor)" />
    <path :d="BOARDS" stroke="#8a5028" stroke-width="3" opacity="0.5" />
    <path d="M-60 830 H1980" stroke="#1b1033" stroke-width="4" />

    <path d="M-60 856 Q300 838 700 852 Q1100 836 1500 856 Q1800 846 1980 860 V1140 H-60 Z" fill="url(#repair-sheet)" stroke="#7a9cbc" stroke-width="4" />
    <path :d="SHEET_FOLDS" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.7" />
    <path :d="SHEET_FOLDS" fill="none" stroke="#8fb0cc" stroke-width="3" stroke-linecap="round" opacity="0.5" transform="translate(0 6)" />
    <path :d="FLOOR_SPLATS" fill="#4fb69a" stroke="#1b1033" stroke-width="2.5" opacity="0.85" />

    <g class="repair-strip">
      <path d="M640 40 H760 V500 Q760 566 724 578 Q694 586 686 560 Q700 548 690 530 L640 512 Z" fill="url(#repair-paper)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M690 530 Q700 548 686 560 Q694 586 724 578 Q740 560 730 540 Z" fill="#fff6ea" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M700 90 l9 12 l-9 12 l-9 -12 Z M700 250 l9 12 l-9 12 l-9 -12 Z M700 410 l9 12 l-9 12 l-9 -12 Z" fill="#ff9fba" stroke="#d66a8c" stroke-width="2.5" />
      <path d="M744 60 V480" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.5" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="300" cy="884" rx="170" ry="14" fill="#3a2a4a" opacity="0.25" stroke="none" />
      <path :d="`M262 ${LADDER.yTop} L120 ${LADDER.yFoot} M338 ${LADDER.yTop} L480 ${LADDER.yFoot}`" stroke-width="22" fill="none" />
      <path :d="`M262 ${LADDER.yTop} L120 ${LADDER.yFoot} M338 ${LADDER.yTop} L480 ${LADDER.yFoot}`" stroke="#c4822e" stroke-width="13" fill="none" />
      <path :d="STEPS" stroke-width="22" />
      <path :d="STEPS" stroke="#f6c46a" stroke-width="13" />
      <path :d="RAILS" stroke-width="28" />
      <path :d="RAILS" stroke="url(#repair-wood)" stroke-width="19" />
      <path d="M186 870 L254 344" stroke="#fff2c8" stroke-width="4" opacity="0.7" />
      <rect x="232" y="312" width="136" height="26" rx="6" fill="url(#repair-wood)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M368 640 q30 4 26 40 q-4 26 -24 30 q8 -30 -2 -70 Z" fill="#ffe08a" stroke-width="3.5" />

      <rect x="262" y="250" width="76" height="62" rx="5" fill="url(#repair-metal)" stroke-width="4.5" />
      <ellipse cx="300" cy="250" rx="38" ry="9" fill="#4fb69a" stroke-width="4" />
      <path d="M326 254 V286 q0 8 6 8 q6 0 6 -8 V252" fill="#4fb69a" stroke-width="3" />
      <rect x="270" y="270" width="50" height="22" rx="3" fill="#fffaf0" stroke-width="3" />
      <path d="M262 250 Q300 200 338 250" fill="none" stroke-width="4" />
      <circle class="repair-drop" cx="332" cy="300" r="5" fill="#4fb69a" stroke-width="2.5" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="80" cy="958" rx="110" ry="12" fill="#3a2a4a" opacity="0.25" stroke="none" />
      <rect x="-20" y="900" width="200" height="54" rx="27" fill="url(#repair-paper)" stroke-width="4.5" />
      <ellipse cx="180" cy="927" rx="14" ry="27" fill="#fff6ea" stroke-width="4" />
      <ellipse cx="180" cy="927" rx="5" ry="10" fill="#c8a07a" stroke-width="2.5" />
      <path d="M20 912 V942 M70 912 V942" stroke="#d66a8c" stroke-width="3" />
      <rect x="40" y="866" width="160" height="40" rx="20" fill="#cde8ff" stroke-width="4.5" />
      <ellipse cx="200" cy="886" rx="10" ry="20" fill="#f4fbff" stroke-width="3.5" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="540" cy="928" rx="90" ry="10" fill="#3a2a4a" opacity="0.25" stroke="none" />
      <path d="M460 920 L480 880 H610 L624 920 Z" fill="url(#repair-metal)" stroke-width="4.5" />
      <path d="M486 888 H600 L612 912 H474 Z" fill="#4fb69a" stroke-width="3" />
      <rect x="500" y="860" width="78" height="30" rx="14" fill="#4fb69a" stroke-width="4" />
      <path d="M578 875 H600 Q612 875 612 860 V820 L660 790" fill="none" stroke-width="10" />
      <path d="M578 875 H600 Q612 875 612 860 V820 L660 790" fill="none" stroke="#c8cede" stroke-width="5" />
      <path d="M650 798 L690 772" stroke-width="16" />
      <path d="M650 798 L690 772" stroke="#ff8f6a" stroke-width="9" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <path d="M1530 900 L1430 400" stroke-width="16" />
      <path d="M1530 900 L1430 400" stroke="#ffd987" stroke-width="9" />
      <path d="M1432 410 L1424 360 H1470" fill="none" stroke-width="7" />
      <rect x="1360" y="336" width="150" height="46" rx="22" fill="url(#repair-paint)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M1380 350 H1480" stroke="#c8f6e8" stroke-width="5" opacity="0.8" />
      <ellipse cx="1500" cy="904" rx="40" ry="8" fill="#3a2a4a" opacity="0.25" stroke="none" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="1780" cy="930" rx="220" ry="16" fill="#3a2a4a" opacity="0.25" stroke="none" />
      <path :d="BUCKET_B" fill="url(#repair-bucket)" stroke-width="5" filter="url(#cel-s)" />
      <ellipse cx="1880" cy="806" rx="85" ry="14" fill="#e8ecf4" stroke-width="4.5" />
      <path d="M1812 846 H1940 L1934 880 H1820 Z" fill="#ffd060" stroke-width="3" />
      <path d="M1800 760 h-40 v14 h40 Z" fill="url(#repair-metal)" stroke-width="3.5" />
      <rect x="1798" y="748" width="20" height="38" rx="5" fill="#3a3550" stroke-width="3.5" />
      <rect x="1816" y="744" width="130" height="48" rx="20" fill="url(#repair-drill)" stroke-width="4.5" />
      <path d="M1880 792 L1872 806 H1916 L1920 792" fill="#3a3550" stroke-width="4" />
      <rect x="1900" y="752" width="30" height="14" rx="5" fill="#3a3550" stroke-width="3" />
      <path d="M1830 756 H1890" stroke="#fff6c0" stroke-width="5" opacity="0.8" />

      <path :d="BUCKET_A" fill="url(#repair-bucket)" stroke-width="5" filter="url(#cel-s)" />
      <ellipse cx="1680" cy="772" rx="95" ry="14" fill="#e8ecf4" stroke-width="4.5" />
      <path d="M1600 812 H1760 L1754 852 H1606 Z" fill="#4fb69a" stroke-width="3" />
      <path d="M1640 812 v22 q0 8 6 8 q6 0 6 -8 v-22 M1720 852 v14 q0 6 5 6 q5 0 5 -6 v-14" fill="#4fb69a" stroke-width="2.5" />
      <path d="M1600 780 Q1590 840 1612 890" fill="none" stroke="#fff" stroke-width="6" opacity="0.6" />

      <path d="M1606 650 Q1606 600 1680 600 Q1754 600 1754 650" fill="none" stroke-width="12" />
      <path d="M1606 650 Q1606 600 1680 600 Q1754 600 1754 650" fill="none" stroke="#3a3550" stroke-width="5" />
      <path d="M1762 652 L1846 560" stroke-width="5" />
      <circle cx="1846" cy="560" r="7" fill="#e8ecf4" stroke-width="3.5" />
      <rect x="1580" y="648" width="200" height="122" rx="18" fill="url(#repair-radio)" stroke-width="5" filter="url(#cel-s)" />
      <circle cx="1630" cy="712" r="38" fill="#3a2a4a" stroke-width="4.5" />
      <path :d="GRILLE" stroke="#8a7aa0" stroke-width="3" />
      <rect x="1686" y="672" width="76" height="32" rx="6" fill="#fff4c8" stroke-width="3.5" />
      <path d="M1696 696 v-8 M1710 696 v-4 M1724 696 v-8 M1738 696 v-4 M1752 696 v-8" stroke="#a87a3a" stroke-width="2.5" />
      <path d="M1728 674 V702" stroke="#e84a3a" stroke-width="3" />
      <circle cx="1702" cy="738" r="12" fill="#3a3550" stroke-width="3.5" />
      <circle cx="1744" cy="738" r="12" fill="#3a3550" stroke-width="3.5" />
      <path d="M1594 662 Q1620 652 1650 656" fill="none" stroke="#ffc8b0" stroke-width="5" />
      <path :d="RADIO_SPLATS" fill="#fffaf0" stroke-width="2.5" />
    </g>

    <g fill="#1b1033">
      <g class="repair-note">
        <ellipse cx="1630" cy="640" rx="11" ry="8" transform="rotate(-20 1630 640)" />
        <path d="M1640 636 V598 l16 6 v8 l-12 -4 V636 Z" />
      </g>
      <g class="repair-note repair-note-b">
        <ellipse cx="1600" cy="640" rx="10" ry="7" transform="rotate(-20 1600 640)" />
        <ellipse cx="1630" cy="632" rx="10" ry="7" transform="rotate(-20 1630 632)" />
        <path d="M1608 636 V600 L1638 592 V628 H1634 V600 L1612 606 V636 Z" />
      </g>
    </g>

    <g class="repair-bulb" stroke="#1b1033" stroke-linejoin="round">
      <circle cx="1080" cy="222" r="70" fill="url(#repair-glow)" stroke="none" />
      <path d="M1080 36 V184" stroke-width="4" />
      <rect x="1068" y="180" width="24" height="22" rx="4" fill="#3a3550" stroke-width="3.5" />
      <circle cx="1080" cy="224" r="24" fill="#fff2a0" stroke-width="4" />
      <path d="M1070 214 Q1078 206 1088 212" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.repair-bulb {
  transform-box: view-box;
  transform-origin: 1080px 36px;
  animation: repair-swing 6s ease-in-out infinite alternate;
}

.repair-strip {
  transform-box: view-box;
  transform-origin: 700px 40px;
  animation: repair-swing 5s ease-in-out infinite alternate;
  animation-delay: -2s;
}

.repair-note {
  animation: repair-note 4s ease-out infinite;
}

.repair-note-b {
  animation-delay: -2s;
}

.repair-drop {
  animation: repair-drop 3.6s ease-in infinite;
}

@keyframes repair-swing {
  from {
    rotate: -2deg;
  }
  to {
    rotate: 2deg;
  }
}

@keyframes repair-note {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(-50px, -120px);
    opacity: 0;
  }
}

@keyframes repair-drop {
  0%,
  60% {
    transform: translateY(0);
    opacity: 0;
  }
  65% {
    opacity: 1;
  }
  100% {
    transform: translateY(56px);
    opacity: 0;
  }
}
</style>
