<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(907);
const CLOUDS = [
  { y: 150, k: 0.9, d: 10, s: 90 },
  { y: 250, k: 0.6, d: 55, s: 120 },
];

const CABLE = { x0: 1120, y0: 722, x1: 2060, y1: 306 };
const SLOPE = (CABLE.y1 - CABLE.y0) / (CABLE.x1 - CABLE.x0);
const STEP = 140;
// chairs one STEP apart, so a group shifted by exactly one STEP looks identical and loops without a seam
const CHAIRS = Array.from({ length: 8 }, (_, i) => ({ x: CABLE.x0 + i * STEP, y: CABLE.y0 + i * STEP * SLOPE, rider: i % 3 !== 2, c: ['#ff5a5a', '#4a7ad8', '#ffd23f', '#b07aff'][i % 4] }));
const DROP = 34;
const TOWERS = [1360, 1660].map((x) => ({ x, y: CABLE.y0 + (x - CABLE.x0) * SLOPE }));

const FAR_PINES = Array.from({ length: 40 }, (_, i) => {
  const x = -40 + i * 52 + rnd() * 24;
  const h = 26 + rnd() * 26;
  const base = 690 + Math.sin(x / 160) * 14 + (x > 860 && x < 1100 ? 10 : 0);
  return `M${x.toFixed(0)} ${base.toFixed(0)} L${(x + 13).toFixed(0)} ${(base - h).toFixed(0)} L${(x + 26).toFixed(0)} ${base.toFixed(0)} Z`;
}).join(' ');
const SLOPE_PINES = [
  ...Array.from({ length: 9 }, (_, i) => ({ x: 120 + i * 26 + rnd() * 10, y: 600 + rnd() * 30 })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: 1680 + i * 28 + rnd() * 10, y: 560 + rnd() * 30 })),
]
  .map((p) => `M${p.x.toFixed(0)} ${p.y.toFixed(0)} l10 -30 l10 30 Z`)
  .join(' ');
const PINES = [
  { x: 1300, y: 812, k: 0.5 },
  { x: 1500, y: 744, k: 0.62 },
  { x: 1560, y: 760, k: 0.48 },
  { x: 1830, y: 640, k: 0.7 },
  { x: 760, y: 880, k: 0.55 },
];
const SPARKLES = twinkleGroups(
  Array.from({ length: 28 }, () => {
    const x = 60 + rnd() * 1800;
    return { x, y: (x > 1100 ? 960 : 930) + rnd() * 140, s: 0.5 + rnd() * 0.7 };
  }),
);
const SMOKE = [0, 1, 2];
const GATES = [
  { x: 590, y: 488 },
  { x: 524, y: 546 },
  { x: 586, y: 604 },
];
const BALLS = [
  { x: -36, y: 0 },
  { x: 0, y: 0 },
  { x: 36, y: 0 },
  { x: -18, y: -32 },
  { x: 18, y: -32 },
  { x: 0, y: -64 },
];
const SKIERS = [
  { x: 470, y: 436, c: '#ff3b5c', n: 1 },
  { x: 200, y: 520, c: '#2ed4c0', n: 2 },
  { x: 1520, y: 410, c: '#ffd23f', n: 3 },
];
// A-frame plank lines clipped by hand to the triangle walls
const PLANKS = Array.from({ length: 6 }, (_, i) => -80 - i * 40)
  .map((y) => {
    const half = (200 * (y + 330)) / 290;
    return `M${(-half + 8).toFixed(0)} ${y} H${(half - 8).toFixed(0)}`;
  })
  .join(' ');
</script>

<template>
  <g>
    <defs>
      <linearGradient id="ski-far" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stop-color="#cdd8f6" />
        <stop offset="100%" stop-color="#a2b2e2" />
      </linearGradient>
      <linearGradient id="ski-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f0f6ff" stop-opacity="0" />
        <stop offset="60%" stop-color="#f0f6ff" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#f0f6ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="ski-mid" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#d4e0fa" />
      </linearGradient>
      <linearGradient id="ski-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#c8d6f6" />
      </linearGradient>
      <linearGradient id="ski-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f6f9ff" />
        <stop offset="100%" stop-color="#a8bcec" />
      </linearGradient>
      <linearGradient id="ski-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d88a4a" />
        <stop offset="100%" stop-color="#8a4420" />
      </linearGradient>
      <linearGradient id="ski-roof" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d0443a" />
        <stop offset="100%" stop-color="#8a1e24" />
      </linearGradient>
      <linearGradient id="ski-pine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#3fa07a" />
        <stop offset="100%" stop-color="#1d5a4a" />
      </linearGradient>
      <radialGradient id="ski-ball" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="70%" stop-color="#eef2ff" />
        <stop offset="100%" stop-color="#b0c0f0" />
      </radialGradient>
      <radialGradient id="ski-spill">
        <stop offset="0%" stop-color="#ffcf6b" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ffcf6b" stop-opacity="0" />
      </radialGradient>
    </defs>

    <circle cx="1700" cy="150" r="220" fill="#fffbe0" opacity="0.18" />
    <circle cx="1700" cy="150" r="130" fill="#fffbe0" fill-opacity="0.35" class="glow" />
    <circle cx="1700" cy="150" r="72" fill="#fff4b0" stroke="#1b1033" stroke-width="5" />
    <path d="M1664 124 Q1680 104 1708 100" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9" />

    <g v-for="(c, i) in CLOUDS" :key="`sc${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-120 20 Q-150 -10 -110 -26 Q-100 -64 -50 -56 Q-24 -96 30 -80 Q70 -100 96 -60 Q140 -56 130 -16 Q150 12 110 20 Z" fill="#fff" stroke="#8ab4e6" stroke-width="4" stroke-linejoin="round" />
        <path d="M-110 16 Q0 4 112 16 Q40 30 -110 16 Z" fill="#d6e6fa" />
      </g>
    </g>

    <path d="M-60 640 L-60 360 L80 300 L260 190 L420 330 L560 290 L720 400 L900 470 L1080 420 L1260 340 L1420 260 L1600 200 L1760 300 L1880 260 L1980 320 L1980 760 Z" fill="url(#ski-far)" stroke="#8a9ad0" stroke-width="3" stroke-linejoin="round" />
    <path d="M260 190 L420 330 L340 360 L300 300 Z M560 290 L720 400 L640 420 L600 360 Z M1600 200 L1760 300 L1680 340 L1640 290 Z M1260 340 L1420 260 L1380 330 L1320 360 Z" fill="#8494cc" opacity="0.55" />
    <g fill="#ffffff" stroke="#b4c2ec" stroke-width="2.5" stroke-linejoin="round">
      <path d="M260 190 L318 240 L296 236 L276 256 L254 232 L230 244 L206 224 Z" />
      <path d="M1600 200 L1662 240 L1640 240 L1620 260 L1600 238 L1578 252 L1554 226 Z" />
      <path d="M560 290 L604 320 L586 320 L568 334 L548 316 L530 312 Z" />
      <path d="M1420 260 L1456 284 L1440 286 L1424 300 L1406 284 L1390 282 Z" />
    </g>
    <rect x="-60" y="380" width="2040" height="260" fill="url(#ski-haze)" />

    <path d="M-60 780 L-60 540 L140 480 L260 500 L420 392 L600 540 L760 600 L900 664 L1040 624 L1200 524 L1360 452 L1500 372 L1640 470 L1800 430 L1980 520 L1980 1140 L-60 1140 Z" fill="url(#ski-mid)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M420 392 L600 540 L760 600 L640 640 L540 560 L480 470 Z M1500 372 L1640 470 L1800 430 L1980 520 L1980 640 L1720 600 L1600 520 Z M140 480 L260 500 L200 540 Z" fill="#a6b8ec" />
    <path d="M420 392 L436 430 L414 440 L446 470 M1500 372 L1516 404 L1494 418 M140 480 L160 500" stroke="#7a86b0" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7" />
    <path d="M408 406 L380 440 M1488 386 L1460 420" stroke="#fff" stroke-width="6" stroke-linecap="round" />
    <path d="M470 436 Q580 480 550 520 Q500 580 620 620 M200 520 Q140 560 210 610 M1520 400 Q1600 470 1540 540 Q1490 600 1600 660" stroke="#a8c0f0" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="18 10" />
    <path :d="SLOPE_PINES" fill="#3a6a78" stroke="#2a4a5a" stroke-width="2.5" stroke-linejoin="round" />
    <path :d="FAR_PINES" fill="#4a7c88" stroke="#2f5462" stroke-width="2.5" stroke-linejoin="round" />
    <path :d="FAR_PINES" fill="#fff" opacity="0.3" transform="translate(0 8) scale(1 0.99)" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <g v-for="(f, i) in GATES" :key="`gt${i}`" :transform="`translate(${f.x} ${f.y})`">
        <path d="M0 0 V-34" stroke-width="3.5" />
        <path d="M0 -34 L22 -27 L0 -20 Z" :fill="i % 2 ? '#3a7ad8' : '#ff3b5c'" stroke-width="2.5" />
      </g>
    </g>
    <g v-for="(s, i) in SKIERS" :key="`sk${i}`" :class="`ski-run ski-run-${s.n}`">
      <g :transform="`translate(${s.x} ${s.y})`" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
        <path d="M-14 2 L14 6" stroke-width="3.5" />
        <path d="M-8 -14 L-14 2 M4 -14 L10 0" stroke-width="3" />
        <path d="M-6 -24 Q2 -30 8 -20 L6 -10 Q0 -6 -8 -10 Z" :fill="s.c" stroke-width="2.5" />
        <circle cx="2" cy="-30" r="5" fill="#ffd6b8" stroke-width="2.5" />
        <path d="M-3 -33 Q2 -40 7 -33" :fill="s.c" stroke-width="2" />
        <path d="M-10 -16 L-18 2 M12 -16 L18 2" stroke-width="2" />
      </g>
    </g>

    <path d="M-60 900 Q300 846 700 872 Q960 884 1160 808 Q1480 690 1980 512 L1980 1140 L-60 1140 Z" fill="url(#ski-near)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1240 820 Q1500 720 1900 590 M1300 860 Q1600 760 1940 650" stroke="#c4d2f6" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />

    <g v-for="(p, i) in PINES" :key="`pn${i}`" :transform="`translate(${p.x} ${p.y}) scale(${p.k})`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="10" cy="4" rx="80" ry="12" fill="#6a7ac0" opacity="0.3" stroke="none" />
      <rect x="-12" y="-40" width="24" height="42" fill="#6a3a22" stroke-width="5" />
      <g fill="url(#ski-pine)" stroke-width="5">
        <path d="M0 -160 L-96 -34 Q0 -14 96 -34 Z" />
        <path d="M0 -240 L-76 -112 Q0 -94 76 -112 Z" />
        <path d="M0 -310 L-54 -196 Q0 -180 54 -196 Z" />
      </g>
      <g fill="#fff" stroke-width="3.5">
        <path d="M0 -310 L-26 -256 Q0 -244 26 -256 Z" />
        <path d="M-56 -116 Q0 -96 56 -116 L46 -104 Q0 -84 -46 -104 Z" />
        <path d="M-80 -40 Q0 -18 80 -40 L66 -26 Q0 -6 -66 -26 Z" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linecap="round">
      <path v-for="t in TOWERS" :key="`tw${t.x}`" :d="`M${t.x} ${t.y - 8} V${t.y + 150 - (t.x - 1300) * 0.12}`" stroke-width="18" />
      <path v-for="t in TOWERS" :key="`tw2${t.x}`" :d="`M${t.x} ${t.y - 8} V${t.y + 150 - (t.x - 1300) * 0.12}`" stroke="#8a96b8" stroke-width="10" />
      <path v-for="t in TOWERS" :key="`tw3${t.x}`" :d="`M${t.x - 30} ${t.y - 2} H${t.x + 30}`" stroke-width="10" />
    </g>
    <path :d="`M${CABLE.x0} ${CABLE.y0} L${CABLE.x1} ${CABLE.y1} M${CABLE.x0} ${CABLE.y0 + DROP} L${CABLE.x1} ${CABLE.y1 + DROP}`" stroke="#1b1033" stroke-width="3.5" />

    <g v-for="(dir, di) in ['up', 'down']" :key="dir" :class="`ski-chairs-${dir}`">
      <g v-for="(c, i) in CHAIRS" :key="`ch${i}`" :transform="`translate(${c.x + (di ? STEP / 2 : 0)} ${c.y + (di ? (STEP / 2) * SLOPE + DROP : 0)})`" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
        <rect x="-5" y="-4" width="10" height="8" rx="2" fill="#5a6080" stroke-width="2.5" />
        <path d="M0 4 V46" stroke-width="3" />
        <path d="M-20 46 H20 V40 H-14 V20" fill="none" stroke-width="5" />
        <path d="M-20 46 H20" stroke="#ffd23f" stroke-width="2" />
        <template v-if="c.rider && !di">
          <path d="M-8 40 L-6 24 Q0 18 8 24 L10 40 Z" :fill="c.c" stroke-width="2.5" />
          <circle cx="1" cy="16" r="6" fill="#ffd6b8" stroke-width="2.5" />
          <path d="M-5 13 Q1 4 7 13 Z" :fill="c.c" stroke-width="2" />
          <path d="M4 44 L22 58" stroke-width="3.5" />
        </template>
      </g>
    </g>

    <g transform="translate(1100 730)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="84" rx="120" ry="14" fill="#6a7ac0" opacity="0.3" stroke="none" />
      <rect x="-80" y="-20" width="140" height="100" fill="url(#ski-wood)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-80 10 H60 M-80 40 H60" stroke="#6a3418" stroke-width="3" opacity="0.6" />
      <rect x="-60" y="4" width="40" height="34" rx="3" fill="#ffd96b" stroke-width="4" />
      <path d="M-40 4 V38 M-60 21 H-20" stroke-width="3" />
      <circle cx="40" cy="10" r="26" fill="#8a96b8" stroke-width="5" />
      <circle cx="40" cy="10" r="8" fill="#5a6080" stroke-width="3" />
      <path d="M-100 -20 L-20 -66 L80 -20 Z" fill="url(#ski-roof)" stroke-width="5" />
      <path d="M-108 -16 Q-60 -48 -20 -74 Q30 -48 88 -16 Q60 -6 40 -16 Q10 -4 -20 -16 Q-50 -4 -80 -14 Q-96 -6 -108 -16 Z" fill="#fff" stroke-width="4" />
    </g>

    <g transform="translate(370 884)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="260" ry="50" fill="url(#ski-spill)" stroke="none" />
      <ellipse cx="0" cy="6" rx="240" ry="20" fill="#6a7ac0" opacity="0.3" stroke="none" />
      <rect x="96" y="-330" width="40" height="80" fill="#9a8a9a" stroke-width="5" />
      <path d="M96 -306 H136 M96 -282 H136 M116 -330 V-306 M106 -306 V-282 M126 -282 V-258" stroke="#6a5a6a" stroke-width="3" />
      <rect x="88" y="-344" width="56" height="18" rx="8" fill="#fff" stroke-width="4" />
      <path d="M-200 -40 L0 -330 L200 -40 Z" fill="url(#ski-wood)" stroke-width="6" filter="url(#cel)" />
      <path :d="PLANKS" stroke="#6a3418" stroke-width="3" opacity="0.55" />
      <path d="M-200 0 V-44 H200 V0 Z" fill="#9aa4c0" stroke-width="5" />
      <path d="M-170 -22 h40 M-110 -30 h50 M-40 -18 h46 M30 -28 h50 M110 -20 h44" stroke="#6a7494" stroke-width="4" stroke-linecap="round" />
      <g class="glow">
        <path d="M-70 -150 L0 -260 L70 -150 Z" fill="#ffd96b" />
        <rect x="-160" y="-118" width="70" height="56" rx="4" fill="#ffd96b" />
        <rect x="90" y="-118" width="70" height="56" rx="4" fill="#ffd96b" />
      </g>
      <path d="M-70 -150 L0 -260 L70 -150 Z M0 -260 V-150 M-46 -186 H46" fill="none" stroke-width="5" />
      <path d="M-160 -118 h70 v56 h-70 Z M-125 -118 v56 M90 -118 h70 v56 h-70 Z M125 -118 v56" fill="none" stroke-width="5" />
      <path d="M-28 -44 V-112 Q0 -132 28 -112 V-44 Z" fill="#6a3418" stroke-width="5" />
      <circle cx="16" cy="-76" r="4" fill="#ffd23f" stroke-width="2" />
      <rect x="-180" y="-144" width="360" height="14" fill="url(#ski-wood)" stroke-width="4" />
      <path d="M-170 -130 V-160 M-130 -130 V-160 M-90 -130 V-160 M-50 -130 V-160 M50 -130 V-160 M90 -130 V-160 M130 -130 V-160 M170 -130 V-160 M-176 -160 H-40 M40 -160 H176" stroke-width="5" stroke-linecap="round" />
      <path d="M-176 -160 H-40 M40 -160 H176" stroke="#fff" stroke-width="3" stroke-linecap="round" />
      <path d="M-250 -6 L0 -372 L250 -6 L214 -6 L0 -318 L-214 -6 Z" fill="url(#ski-roof)" stroke-width="6" />
      <path d="M-262 -2 L0 -386 L262 -2 Q240 12 226 -4 Q216 14 200 -10 L0 -330 L-200 -10 Q-214 14 -226 -4 Q-240 12 -262 -2 Z" fill="#fff" stroke-width="5" />
      <path d="M-230 -30 L-30 -330" stroke="#dfe8ff" stroke-width="6" stroke-linecap="round" />
      <path d="M-226 -4 l6 24 l6 -22 M-150 -116 l4 20 l4 -18 M160 -116 l4 18 l4 -18 M226 -4 l5 22 l5 -22" fill="#dff4ff" stroke-width="3" />
    </g>
    <circle v-for="i in SMOKE" :key="`sm${i}`" cx="486" cy="530" r="18" fill="#c4cce4" stroke="#8a96c0" stroke-width="3" class="smoke" :style="{ animationDelay: `-${i * 2}s` }" />

    <g transform="translate(660 930)" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="10" cy="6" rx="70" ry="10" fill="#6a7ac0" opacity="0.3" stroke="none" />
      <path d="M-20 0 L-40 -170 Q-42 -186 -30 -186 Q-22 -180 -16 -166 L4 0 Z" fill="#ff5a3c" stroke-width="4.5" />
      <path d="M20 0 L40 -170 Q44 -186 32 -186 Q22 -180 18 -166 L0 0 Z" fill="#3a7ad8" stroke-width="4.5" />
      <path d="M-34 -150 L-18 -20 M30 -156 L14 -30" stroke="#fff" stroke-width="3" opacity="0.7" />
      <path d="M-56 0 L-70 -150 M60 0 L76 -146" stroke-width="5" />
      <circle cx="-56" cy="-14" r="10" fill="none" stroke-width="3.5" />
      <circle cx="60" cy="-14" r="10" fill="none" stroke-width="3.5" />
      <path d="M-72 -150 L-68 -132 M78 -146 L74 -128" stroke="#ffd23f" stroke-width="9" />
    </g>

    <path d="M-60 1000 Q500 960 960 990 Q1400 1020 1980 966 L1980 1140 L-60 1140 Z" fill="url(#ski-front)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M600 1140 Q700 1060 900 1020 M650 1140 Q750 1066 940 1030 M1200 1010 Q1300 1000 1420 1004" stroke="#9cb0e4" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />

    <g transform="translate(1500 1060)" stroke="#1b1033" stroke-width="4">
      <ellipse cx="0" cy="18" rx="80" ry="12" fill="#6a7ac0" opacity="0.3" stroke="none" />
      <circle v-for="(b, i) in BALLS" :key="`b${i}`" :cx="b.x" :cy="b.y" r="18" fill="url(#ski-ball)" />
    </g>

    <g transform="translate(1720 1020)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="10" cy="8" rx="120" ry="16" fill="#6a7ac0" opacity="0.35" stroke="none" />
      <path d="M-50 -150 L-120 -200 M-96 -184 L-108 -214 M50 -160 L110 -110" stroke="#6a3a22" stroke-width="8" stroke-linecap="round" fill="none" />
      <path d="M110 -110 L150 -240" stroke="#1b1033" stroke-width="7" stroke-linecap="round" />
      <path d="M110 -110 L150 -240" stroke="#ffd23f" stroke-width="3" stroke-linecap="round" />
      <circle cx="0" cy="-56" r="66" fill="url(#ski-ball)" stroke-width="5" />
      <circle cx="0" cy="-158" r="50" fill="url(#ski-ball)" stroke-width="5" />
      <circle cx="0" cy="-240" r="40" fill="url(#ski-ball)" stroke-width="5" />
      <path d="M-44 -80 Q-48 -100 -34 -112 M-32 -180 Q-32 -194 -22 -200" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" />
      <circle cx="0" cy="-140" r="6" fill="#1b1033" stroke="none" />
      <circle cx="0" cy="-170" r="6" fill="#1b1033" stroke="none" />
      <path d="M-40 -212 Q0 -196 40 -212 L42 -198 Q0 -180 -42 -198 Z" fill="#2ed4c0" stroke-width="4" />
      <path d="M-22 -204 L-40 -146 L-22 -142 L-6 -200 Z" fill="#2ed4c0" stroke-width="4" />
      <path d="M-36 -160 L-20 -156 M-30 -180 L-14 -176" stroke="#fff" stroke-width="4" />
      <path d="M-38 -264 Q-36 -310 0 -312 Q36 -310 38 -264 Z" fill="#ff3b5c" stroke-width="5" />
      <path d="M-40 -266 H40" stroke-width="12" stroke-linecap="round" />
      <path d="M-40 -266 H40" stroke="#fff" stroke-width="6" stroke-linecap="round" />
      <circle cx="0" cy="-318" r="13" fill="#fff" stroke-width="4" />
      <rect x="-30" y="-292" width="60" height="22" rx="10" fill="#ffb02e" stroke-width="4" />
      <path d="M-22 -286 Q-12 -290 -4 -286" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="-14" cy="-246" r="6" fill="#1b1033" stroke="none" />
      <circle cx="14" cy="-246" r="6" fill="#1b1033" stroke="none" />
      <circle cx="-16" cy="-248" r="2" fill="#fff" stroke="none" />
      <circle cx="12" cy="-248" r="2" fill="#fff" stroke="none" />
      <path d="M0 -236 L46 -228 L0 -222 Z" fill="#ff7a2f" stroke-width="3" />
      <ellipse cx="-24" cy="-226" rx="8" ry="5" fill="#ff8aa0" stroke="none" opacity="0.7" />
      <ellipse cx="22" cy="-224" rx="8" ry="5" fill="#ff8aa0" stroke="none" opacity="0.7" />
      <path d="M-14 -216 Q0 -206 14 -216" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>

    <g fill="#fff">
      <g v-for="(g, gi) in SPARKLES" :key="`sg${gi}`" class="twinkle" :style="{ animationDelay: `${gi * 0.75}s` }">
        <path v-for="(s, i) in g" :key="i" :transform="`translate(${s.x} ${s.y}) scale(${s.s})`" d="M0 -12 L2.5 -2.5 L12 0 L2.5 2.5 L0 12 L-2.5 2.5 L-12 0 L-2.5 -2.5 Z" />
      </g>
    </g>

    <g transform="translate(40 1130) scale(1.5)" stroke="#0c1a30" stroke-linejoin="round">
      <g fill="#1d4a52" stroke-width="5">
        <path d="M0 -160 L-110 -20 Q0 4 110 -20 Z" />
        <path d="M0 -250 L-86 -110 Q0 -90 86 -110 Z" />
        <path d="M0 -330 L-60 -206 Q0 -190 60 -206 Z" />
      </g>
      <g fill="#eef4ff" stroke-width="3.5">
        <path d="M0 -330 L-28 -272 Q0 -260 28 -272 Z" />
        <path d="M-66 -112 Q0 -92 66 -112 L54 -98 Q0 -80 -54 -98 Z" />
        <path d="M-90 -26 Q0 -4 90 -26 L74 -12 Q0 8 -74 -12 Z" />
      </g>
    </g>
    <path d="M-60 1140 Q-40 1060 80 1050 Q200 1046 260 1140 Z" fill="#eef4ff" stroke="#1b1033" stroke-width="5" />
    <path d="M1980 1140 Q1960 1070 1880 1064 Q1780 1060 1740 1140 Z" fill="#eef4ff" stroke="#1b1033" stroke-width="5" />
  </g>
</template>

<style scoped>
.ski-chairs-up {
  animation: ski-up 7s linear infinite;
}

.ski-chairs-down {
  animation: ski-down 7s linear infinite;
}

.ski-run {
  animation: 9s ease-in-out infinite;
}

.ski-run-1 {
  animation-name: ski-run-1;
}

.ski-run-2 {
  animation-name: ski-run-2;
  animation-duration: 11s;
  animation-delay: -4s;
}

.ski-run-3 {
  animation-name: ski-run-3;
  animation-duration: 10s;
  animation-delay: -7s;
}

/* one chair step along the cable: STEP 140 by STEP * SLOPE */
@keyframes ski-up {
  to {
    translate: 140px -61.9px;
  }
}

@keyframes ski-down {
  to {
    translate: -140px 61.9px;
  }
}

@keyframes ski-run-1 {
  0% {
    translate: 0 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  40% {
    translate: 90px 60px;
  }
  70% {
    translate: 40px 130px;
  }
  90% {
    opacity: 1;
  }
  100% {
    translate: 150px 184px;
    opacity: 0;
  }
}

@keyframes ski-run-2 {
  0% {
    translate: 0 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    translate: -50px 46px;
  }
  90% {
    opacity: 1;
  }
  100% {
    translate: 10px 90px;
    opacity: 0;
  }
}

@keyframes ski-run-3 {
  0% {
    translate: 0 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  33% {
    translate: 80px 70px;
  }
  66% {
    translate: 20px 130px;
  }
  90% {
    opacity: 1;
  }
  100% {
    translate: 80px 200px;
    opacity: 0;
  }
}
</style>
