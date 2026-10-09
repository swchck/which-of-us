<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(186);

/** A row of round treetops: arcs hopping left to right, filled down past the bottom edge. */
function treeline(y: number, rMin: number, rMax: number, jitter: number): string {
  let d = `M-60 1140 L-60 ${y}`;
  for (let x = -60; x < 1980; ) {
    const r = rMin + rnd() * (rMax - rMin);
    const nx = x + r * 1.7;
    d += ` A${r.toFixed(0)} ${r.toFixed(0)} 0 0 1 ${nx.toFixed(0)} ${(y + (rnd() - 0.5) * jitter).toFixed(0)}`;
    x = nx;
  }
  return `${d} L1980 1140 Z`;
}
const FAR_TREES = treeline(470, 50, 90, 70);
const MID_TREES = treeline(600, 60, 110, 60);
const BUSHES = treeline(770, 36, 70, 40);
const CANOPY_TUFTS = [
  { x: 110, y: 250, r: 10 },
  { x: 300, y: 216, r: -8 },
  { x: 480, y: 168, r: 6 },
  { x: 650, y: 106, r: -4 },
  { x: 1310, y: 106, r: 4 },
  { x: 1490, y: 168, r: -6 },
  { x: 1680, y: 216, r: 8 },
  { x: 1870, y: 250, r: -10 },
];
const TUFT_ANGLES = [-38, 0, 38];
const FAR_TRUNKS = Array.from({ length: 14 }, (_, i) => {
  const x = 40 + i * 140 + rnd() * 60;
  return `M${x.toFixed(0)} 560 V760`;
}).join(' ');

const MOTE_LIST = Array.from({ length: 18 }, () => ({ x: 560 + rnd() * 900, y: 150 + rnd() * 700, r: 1.5 + rnd() * 2.5 }));
const MOTES = [0, 1].map((g) => MOTE_LIST.filter((_, i) => i % 2 === g));
const FALL_STREAKS = Array.from({ length: 16 }, () => ({ x: 1268 + rnd() * 74, y: rnd() * 380, h: 40 + rnd() * 70 }));

const VINES = [
  { x: 560, len: 330, d: 0, monkey: false },
  { x: 700, len: 210, d: 1.7, monkey: false },
  { x: 1290, len: 260, d: 0.9, monkey: false },
  { x: 1520, len: 300, d: 2.6, monkey: true },
];
const STATIC_VINES = [
  { x: 330, len: 520 },
  { x: 1630, len: 460 },
  { x: 1440, len: 170 },
];
function vinePath(x: number, len: number): string {
  return `M${x} -20 Q${x + 34} ${len * 0.35} ${x - 6} ${len * 0.7} T${x + 4} ${len}`;
}
function vineLeaves(x: number, len: number): string {
  let d = '';
  for (let t = 0.18; t < 0.95; t += 0.16) {
    const y = len * t;
    const vx = x + Math.sin(t * 5) * 14;
    const side = Math.round(t * 10) % 2 ? 1 : -1;
    d += `M${vx.toFixed(0)} ${y.toFixed(0)} q${side * 16} -18 ${side * 32} -6 q${side * -14} 16 ${side * -32} 6 z `;
  }
  return d;
}

const BUTTERFLIES = [
  { c: '#ffd23f', d: 3, s: 22 },
  { c: '#3fd0ff', d: 13, s: 26 },
];
const FLOWERS = [
  { x: 470, y: 900, c: '#ff4d6d' },
  { x: 1180, y: 912, c: '#ff8ac0' },
  { x: 1480, y: 896, c: '#ff4d6d' },
];
const PETALS = [0, 72, 144, 216, 288];
const FERNS = [
  { x: 380, s: 0.9 },
  { x: 860, s: 0.7 },
  { x: 1120, s: 0.75 },
  { x: 1560, s: 1 },
];
const FERN_ANGLES = [-64, -32, 0, 32, 64];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="jungle-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7fd38a" />
        <stop offset="45%" stop-color="#3f9f6a" />
        <stop offset="100%" stop-color="#1d5a3e" />
      </linearGradient>
      <radialGradient id="jungle-sun" cx="0.42" cy="0" r="0.6">
        <stop offset="0%" stop-color="#fff8b8" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#fff8b8" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="jungle-shaft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffbd0" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fffbd0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="jungle-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8ffd0" stop-opacity="0" />
        <stop offset="60%" stop-color="#e8ffd0" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#e8ffd0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="jungle-bark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#a8704a" />
        <stop offset="60%" stop-color="#7a4a2c" />
        <stop offset="100%" stop-color="#4f2c1a" />
      </linearGradient>
      <linearGradient id="jungle-canopy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1f7a44" />
        <stop offset="100%" stop-color="#2ea25a" />
      </linearGradient>
      <linearGradient id="jungle-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5fb04a" />
        <stop offset="50%" stop-color="#3a8a3a" />
      </linearGradient>
      <linearGradient id="jungle-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a6a32" />
        <stop offset="100%" stop-color="#143a1c" />
      </linearGradient>
      <linearGradient id="jungle-cliff" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0%" stop-color="#9ab8a0" />
        <stop offset="100%" stop-color="#6f9484" />
      </linearGradient>
      <linearGradient id="jungle-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c8f4ff" />
        <stop offset="100%" stop-color="#7fd8f0" />
      </linearGradient>
      <clipPath id="jungle-fall-clip">
        <path d="M1262 410 H1350 L1356 790 H1256 Z" />
      </clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1200" fill="url(#jungle-sky)" />
    <rect x="-60" y="-60" width="2040" height="900" fill="url(#jungle-sun)" />

    <path :d="FAR_TREES" fill="#9cd6a4" stroke="#b6e4b8" stroke-width="3" stroke-linejoin="round" />
    <path :d="FAR_TRUNKS" stroke="#84c090" stroke-width="10" stroke-linecap="round" />

    <g stroke-linejoin="round">
      <path d="M1180 1000 L1200 470 Q1230 380 1300 392 L1330 410 Q1400 380 1430 440 L1450 1000 Z" fill="url(#jungle-cliff)" stroke="#5a7f70" stroke-width="3" />
      <path d="M1210 520 L1250 512 M1386 470 L1420 480 M1214 640 L1246 634 M1380 600 L1418 612" stroke="#5a7f70" stroke-width="4" stroke-linecap="round" opacity="0.7" />
      <path d="M1262 410 H1350 L1356 790 H1256 Z" fill="url(#jungle-water)" stroke="#5a7f70" stroke-width="3" />
      <g clip-path="url(#jungle-fall-clip)">
        <g class="jungle-fall">
          <template v-for="(f, i) in FALL_STREAKS" :key="`fs${i}`">
            <path :d="`M${f.x.toFixed(0)} ${(f.y + 400).toFixed(0)} v${f.h.toFixed(0)}`" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.85" />
            <path :d="`M${f.x.toFixed(0)} ${(f.y + 20).toFixed(0)} v${f.h.toFixed(0)}`" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.85" />
          </template>
        </g>
      </g>
      <ellipse cx="1306" cy="792" rx="96" ry="22" fill="#e8fbff" stroke="#9ad0dc" stroke-width="3" />
      <path d="M1236 784 q14 -24 30 -4 q12 -22 28 -2 q14 -24 30 -2 q14 -22 30 0 q12 -18 26 4" fill="#fff" stroke="#9ad0dc" stroke-width="3" />
    </g>

    <path :d="MID_TREES" fill="#5fae78" stroke="#4a9468" stroke-width="3" stroke-linejoin="round" />
    <rect x="-60" y="560" width="2040" height="320" fill="url(#jungle-haze)" />
    <path d="M500 -20 Q520 400 490 820 H560 Q580 400 556 -20 Z M1570 -20 Q1590 400 1560 820 H1630 Q1650 400 1626 -20 Z" fill="#5a8a62" stroke="#3f6f50" stroke-width="3" stroke-linejoin="round" />
    <path d="M512 100 Q522 400 506 700 M1582 100 Q1592 400 1576 700" stroke="#7aaa80" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <path :d="BUSHES" fill="#4a9a5e" stroke="#2f7a4a" stroke-width="4" stroke-linejoin="round" />
    <path :d="tufts(60, 772, 1880, 0.03)" stroke="#2f7a4a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />

    <path d="M560 -40 L420 1000 L700 1000 Z" fill="url(#jungle-shaft)" />
    <g class="jungle-shafts">
      <path d="M860 -40 L760 1000 L1060 1000 L940 -40 Z" fill="url(#jungle-shaft)" />
      <path d="M1130 -40 L1100 900 L1260 900 L1180 -40 Z" fill="url(#jungle-shaft)" />
    </g>
    <g v-for="(g, gi) in MOTES" :key="`mo${gi}`" class="jungle-mote" :style="{ animationDelay: `-${gi * 3}s` }" fill="#fffbd0">
      <circle v-for="(m, i) in g" :key="i" :cx="m.x" :cy="m.y" :r="m.r" />
    </g>

    <path d="M-60 860 Q300 800 700 840 Q1100 880 1500 830 Q1800 800 1980 840 L1980 1140 L-60 1140 Z" fill="url(#jungle-floor)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(120, 846, 1820, 0.011)" stroke="#2f7a2a" stroke-width="5" fill="none" stroke-linecap="round" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-60 -60 H300 Q260 200 250 500 Q240 760 300 900 Q340 950 420 960 L-60 980 Z" fill="url(#jungle-bark)" stroke-width="6" filter="url(#cel)" />
      <path d="M60 -20 Q40 300 70 620 M150 40 Q140 260 160 520 M120 640 Q100 760 130 880 M200 300 Q190 420 205 520" stroke="#3a1f12" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.45" />
      <path d="M210 120 Q200 300 214 460" stroke="#d6a070" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
      <path d="M240 470 Q380 440 560 470 Q570 482 560 492 Q380 470 246 506 Z" fill="url(#jungle-bark)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M250 820 Q300 900 400 950 Q330 960 260 900 Z" fill="#6a3e24" stroke-width="5" />
      <path d="M190 600 Q250 570 290 604 Q250 620 196 616 Z M200 650 Q240 630 270 652 Q240 664 204 662 Z" fill="#f0a050" stroke-width="4" />
      <path d="M-60 330 Q20 290 110 300 Q130 330 90 350 Q20 370 -60 360 Z" fill="#4fb85a" stroke-width="4" />

      <path d="M1980 -60 H1660 Q1700 220 1710 500 Q1720 760 1650 900 Q1610 950 1520 962 L1980 980 Z" fill="url(#jungle-bark)" stroke-width="6" filter="url(#cel)" />
      <path d="M1860 -20 Q1880 300 1850 640 M1760 60 Q1770 300 1756 560 M1800 660 Q1820 780 1790 900" stroke="#3a1f12" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.45" />
      <path d="M1700 160 Q1712 320 1704 480" stroke="#d6a070" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
      <path d="M1700 820 Q1650 910 1540 952 Q1620 958 1690 900 Z" fill="#6a3e24" stroke-width="5" />
      <path d="M1716 560 Q1660 530 1620 566 Q1660 582 1712 578 Z" fill="#f0a050" stroke-width="4" />
      <path d="M1980 420 Q1880 380 1800 420 Q1790 450 1830 466 Q1900 480 1980 470 Z" fill="#4fb85a" stroke-width="4" />
    </g>
    <ellipse cx="160" cy="968" rx="260" ry="22" fill="#0f2a10" opacity="0.3" />
    <ellipse cx="1760" cy="970" rx="260" ry="22" fill="#0f2a10" opacity="0.3" />

    <g fill="url(#jungle-canopy)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)">
      <path d="M-60 -60 H860 Q840 20 760 40 Q740 110 640 110 Q600 190 480 170 Q420 260 300 220 Q220 300 110 250 Q30 300 -60 260 Z" />
      <path d="M1980 -60 H1100 Q1110 20 1200 40 Q1220 120 1320 110 Q1370 200 1490 170 Q1560 260 1680 220 Q1770 300 1870 250 Q1940 290 1980 270 Z" />
    </g>
    <g v-for="(t, i) in CANOPY_TUFTS" :key="`ct${i}`" :transform="`translate(${t.x} ${t.y}) rotate(${t.r})`">
      <path v-for="(a, j) in TUFT_ANGLES" :key="a" d="M0 -10 Q-26 40 0 96 Q26 40 0 -10 Z" :transform="`rotate(${a})`" :fill="j === 1 ? '#3fc070' : '#2ea25a'" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path v-for="a in TUFT_ANGLES" :key="`m${a}`" d="M0 0 Q3 40 0 84" :transform="`rotate(${a})`" stroke="#1b6a36" stroke-width="3" fill="none" opacity="0.7" />
    </g>
    <path d="M80 210 Q180 230 290 190 M380 150 Q480 160 600 90 M1340 90 Q1440 160 1540 140 M1620 200 Q1740 240 1860 210" stroke="#7be0a0" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />

    <g v-for="(v, i) in STATIC_VINES" :key="`sv${i}`">
      <path :d="vinePath(v.x, v.len)" stroke="#1b1033" stroke-width="11" fill="none" stroke-linecap="round" />
      <path :d="vinePath(v.x, v.len)" stroke="#5a9a3a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path :d="vineLeaves(v.x, v.len)" fill="#3fb86a" stroke="#1b1033" stroke-width="3" />
    </g>
    <g v-for="(v, i) in VINES" :key="`v${i}`" class="jungle-vine" :style="{ animationDelay: `-${v.d}s` }">
      <path :d="vinePath(v.x, v.len)" stroke="#1b1033" stroke-width="11" fill="none" stroke-linecap="round" />
      <path :d="vinePath(v.x, v.len)" stroke="#5a9a3a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path :d="vineLeaves(v.x, v.len)" fill="#3fb86a" stroke="#1b1033" stroke-width="3" />
      <g v-if="v.monkey" :transform="`translate(${v.x + 4} ${v.len})`" stroke="#1b1033" stroke-linejoin="round">
        <path d="M0 0 Q-24 10 -10 30 Q4 44 -6 66" stroke-width="12" fill="none" stroke-linecap="round" />
        <path d="M0 0 Q-24 10 -10 30 Q4 44 -6 66" stroke="#8a5434" stroke-width="6" fill="none" stroke-linecap="round" />
        <ellipse cx="-4" cy="96" rx="30" ry="38" fill="#8a5434" stroke-width="5" />
        <ellipse cx="-4" cy="104" rx="17" ry="24" fill="#e8b888" />
        <path d="M-30 96 Q-56 120 -50 160 M22 96 Q44 124 40 156" stroke-width="12" fill="none" stroke-linecap="round" />
        <path d="M-30 96 Q-56 120 -50 160 M22 96 Q44 124 40 156" stroke="#8a5434" stroke-width="6" fill="none" stroke-linecap="round" />
        <circle cx="-30" cy="166" r="14" fill="#8a5434" stroke-width="4" />
        <circle cx="-56" cy="166" r="10" fill="#e8b888" stroke-width="4" />
        <circle cx="-4" cy="166" r="10" fill="#e8b888" stroke-width="4" />
        <ellipse cx="-30" cy="174" rx="12" ry="9" fill="#e8b888" stroke-width="3" />
        <circle cx="-35" cy="162" r="3.5" fill="#1b1033" stroke="none" />
        <circle cx="-25" cy="162" r="3.5" fill="#1b1033" stroke="none" />
        <circle cx="-36" cy="161" r="1.2" fill="#fff" stroke="none" />
        <path d="M-35 176 Q-30 180 -25 176" stroke-width="2.5" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g class="parrot">
      <g transform="translate(430 470)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M-8 30 L-30 150 L-10 150 L6 40 Z" fill="#2e7bff" stroke-width="4" />
        <path d="M2 34 L-6 160 L12 156 L16 40 Z" fill="#ff3b5c" stroke-width="4" />
        <ellipse cx="0" cy="-10" rx="30" ry="46" fill="#ff3b5c" stroke-width="5" transform="rotate(14)" />
        <path d="M-24 -18 Q-40 30 -10 54 Q10 20 0 -12 Z" fill="#ffd23f" stroke-width="4" />
        <path d="M-22 6 Q-34 40 -8 56 Q-2 36 -6 16 Z" fill="#2e7bff" stroke-width="4" />
        <circle cx="10" cy="-52" r="24" fill="#ff3b5c" stroke-width="5" />
        <ellipse cx="18" cy="-52" rx="12" ry="10" fill="#fff" stroke-width="3" />
        <circle cx="18" cy="-54" r="4.5" fill="#1b1033" stroke="none" />
        <circle cx="16.5" cy="-55.5" r="1.5" fill="#fff" stroke="none" />
        <path d="M30 -60 Q50 -60 48 -36 Q42 -44 30 -42 Z" fill="#fff4dc" stroke-width="4" />
        <path d="M30 -42 Q40 -40 42 -32 Q32 -32 28 -38 Z" fill="#1b1033" stroke-width="2" />
        <path d="M-6 -60 Q2 -74 16 -74" stroke="#ffb0bd" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M-12 34 l-6 10 M6 34 l4 10" stroke-width="5" stroke-linecap="round" stroke="#ffb02e" />
      </g>
    </g>

    <g v-for="(f, i) in FERNS" :key="`fe${i}`" :transform="`translate(${f.x} 880) scale(${f.s})`">
      <path v-for="a in FERN_ANGLES" :key="a" d="M0 0 Q-40 -60 0 -120 Q40 -60 0 0 Z" :transform="`rotate(${a})`" :fill="a % 64 === 0 ? '#1f9a55' : '#2ed47a'" stroke="#1b1033" stroke-width="4" />
      <path v-for="a in FERN_ANGLES" :key="`r${a}`" d="M0 -6 Q2 -60 0 -110" :transform="`rotate(${a})`" stroke="#9af0c0" stroke-width="3" fill="none" opacity="0.7" />
    </g>
    <g v-for="(f, i) in FLOWERS" :key="`fl${i}`" :transform="`translate(${f.x} ${f.y})`">
      <ellipse cx="0" cy="18" rx="30" ry="6" fill="#0f2a10" opacity="0.3" />
      <path d="M0 18 Q-4 4 0 -6" stroke="#2f7a2a" stroke-width="5" fill="none" />
      <ellipse v-for="a in PETALS" :key="a" cx="0" cy="-20" rx="10" ry="16" :transform="`rotate(${a} 0 -6)`" :fill="f.c" stroke="#1b1033" stroke-width="3" />
      <circle cx="0" cy="-6" r="7" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
    </g>
    <g transform="translate(980 896)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <ellipse cx="10" cy="10" rx="60" ry="8" fill="#0f2a10" opacity="0.3" stroke="none" />
      <path d="M-14 10 V-14 H6 V10 Z M24 10 V-4 H36 V10 Z" fill="#fff4dc" />
      <path d="M-34 -12 Q-4 -56 26 -12 Z" fill="#ff5a3c" filter="url(#cel-s)" />
      <path d="M14 -2 Q30 -26 46 -2 Z" fill="#ff5a3c" />
      <circle cx="-14" cy="-26" r="5" fill="#fff" stroke="none" />
      <circle cx="4" cy="-20" r="4" fill="#fff" stroke="none" />
    </g>

    <g v-for="(b, i) in BUTTERFLIES" :key="`bf${i}`" class="butterfly" :style="{ animationDelay: `-${b.d}s`, animationDuration: `${b.s}s` }">
      <g class="wings">
        <path d="M0 0 Q-30 -34 -26 -4 Q-30 22 0 4 Z" :fill="b.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M0 0 Q30 -34 26 -4 Q30 22 0 4 Z" :fill="b.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <circle cx="-14" cy="-10" r="4" fill="#fff" opacity="0.8" />
        <circle cx="14" cy="-10" r="4" fill="#fff" opacity="0.8" />
      </g>
      <rect x="-3" y="-14" width="6" height="26" rx="3" fill="#1b1033" />
    </g>

    <path d="M-60 970 Q500 940 960 960 Q1450 985 1980 950 L1980 1140 L-60 1140 Z" fill="url(#jungle-front)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(60, 958, 1880, 0.02)" stroke="#1f5a24" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M420 1010 q30 -10 60 0 M700 1040 q40 -12 80 0 M1100 1020 q30 -10 60 0 M1380 1050 q40 -12 80 0 M560 1080 q30 -8 60 0 M1240 1090 q30 -8 60 0" stroke="#0f2a14" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.45" />
    <path d="M300 990 q30 -8 60 -2 M860 990 q40 -8 80 -2 M1500 984 q30 -8 60 -2" stroke="#5fae5a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />

    <g class="jungle-sway">
      <g transform="translate(240 1100) rotate(28)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M0 0 Q-110 -80 -90 -250 Q-30 -380 0 -420 Q30 -380 90 -250 Q110 -80 0 0 Z" fill="#2ea25a" stroke-width="5" />
        <path d="M0 -10 Q6 -200 0 -400" stroke="#1b6a36" stroke-width="5" fill="none" />
        <path d="M2 -80 Q50 -110 80 -150 M2 -170 Q50 -210 76 -260 M2 -260 Q40 -300 50 -340 M-2 -80 Q-50 -110 -80 -150 M-2 -170 Q-50 -210 -76 -260 M-2 -260 Q-40 -300 -50 -340" stroke="#1b6a36" stroke-width="4" fill="none" opacity="0.7" />
        <path d="M-60 -240 Q-60 -330 -14 -390" stroke="#9af0c0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>
    <g class="jungle-sway late">
      <g transform="translate(1700 1110) rotate(-26)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M0 0 Q-110 -80 -90 -250 Q-30 -380 0 -420 Q30 -380 90 -250 Q110 -80 0 0 Z" fill="#27a95c" stroke-width="5" />
        <path d="M0 -10 Q6 -200 0 -400" stroke="#1b6a36" stroke-width="5" fill="none" />
        <path d="M2 -80 Q50 -110 80 -150 M2 -170 Q50 -210 76 -260 M2 -260 Q40 -300 50 -340 M-2 -80 Q-50 -110 -80 -150 M-2 -170 Q-50 -210 -76 -260 M-2 -260 Q-40 -300 -50 -340" stroke="#1b6a36" stroke-width="4" fill="none" opacity="0.7" />
        <path d="M-60 -240 Q-60 -330 -14 -390" stroke="#9af0c0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>

    <g fill="#123a22" stroke="#0b1a12" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-30 860 180 760 Q90 940 140 1140 Z" />
      <path d="M-60 1140 Q60 960 360 940 Q190 1030 220 1140 Z" />
      <path d="M-60 700 Q60 760 120 900 Q20 860 -60 860 Z" />
      <path d="M1980 1140 Q1960 880 1760 790 Q1850 950 1810 1140 Z" />
      <path d="M1980 1140 Q1860 980 1580 970 Q1740 1040 1730 1140 Z" />
      <path d="M1980 740 Q1870 790 1810 920 Q1910 880 1980 880 Z" />
    </g>
    <path d="M-30 1100 Q0 900 160 790 M1950 1100 Q1930 900 1770 810" stroke="#2a6a3a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
  </g>
</template>

<style scoped>
.jungle-fall {
  animation: jungle-fall 1.6s linear infinite;
}

.jungle-shafts {
  animation: jungle-shafts 6s ease-in-out infinite alternate;
}

.jungle-mote {
  animation: jungle-mote 9s ease-in-out infinite;
}

.jungle-vine {
  transform-box: fill-box;
  transform-origin: top center;
  animation: jungle-vine 4.5s ease-in-out infinite alternate;
}

.jungle-sway {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: jungle-vine 3.8s ease-in-out infinite alternate;
}

.jungle-sway.late {
  animation-delay: -1.9s;
}

@keyframes jungle-fall {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 380px;
  }
}

@keyframes jungle-shafts {
  from {
    opacity: 0.45;
  }
  to {
    opacity: 1;
  }
}

@keyframes jungle-mote {
  0%,
  100% {
    translate: 0 0;
    opacity: 0.2;
  }
  50% {
    translate: 30px -50px;
    opacity: 0.9;
  }
}

@keyframes jungle-vine {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}
</style>
