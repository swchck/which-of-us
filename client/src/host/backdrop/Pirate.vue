<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(707);
const HORIZON = 652;
const DECK_TOP = 880;
const VP = { x: 960, y: 560 };
// plank seams run from the bottom edge towards one vanishing point, so the deck reads as receding
const SEAM_COUNT = 30;
const seamX = (i: number, y: number) => {
  const xb = -900 + i * 130;
  return VP.x + ((xb - VP.x) * (y - VP.y)) / (1140 - VP.y);
};
const SEAMS = Array.from({ length: SEAM_COUNT }, (_, i) => ({ xb: seamX(i, 1140), xt: seamX(i, DECK_TOP) }));
const JOINTS = Array.from({ length: 22 }, () => {
  const i = Math.floor(rnd() * (SEAM_COUNT - 1));
  const y = DECK_TOP + 20 + rnd() * 240;
  return { a: seamX(i, y), b: seamX(i + 1, y), y };
});
const SEAM_PATH = SEAMS.map((s) => `M${s.xt} ${DECK_TOP} L${s.xb} 1140`).join(' ');
const JOINT_PATH = JOINTS.map((j) => `M${j.a} ${j.y} L${j.b} ${j.y}`).join(' ');
const NAIL_PATH = JOINTS.map((j) => `M${j.a + 8} ${j.y + 6} h0.1 M${j.b - 8} ${j.y + 6} h0.1`).join(' ');
const BALUSTERS = Array.from({ length: 33 }, (_, i) => -40 + i * 63);
const WAVE_ROWS = [
  { y: 690, w: 3, c: '#ffd9b0', o: 0.6, s: 9, k: 0.6 },
  { y: 740, w: 4, c: '#ffe2c4', o: 0.65, s: 7, k: 0.8 },
  { y: 800, w: 5, c: '#c8f0f4', o: 0.75, s: 5.5, k: 1 },
  { y: 850, w: 6, c: '#c8f0f4', o: 0.8, s: 4.5, k: 1.2 },
];
const crests = (y: number, k: number) => {
  let d = '';
  for (let x = -60; x < 2200; x += 100) d += `M${x} ${y} q${25 * k} ${-10 * k} ${50} 0 `;
  return d;
};
const GULLS = [
  { y: 230, k: 0.8, s: 30, d: 4 },
  { y: 320, k: 0.55, s: 38, d: 22 },
];
const SPARKLES = [
  { x: 1702, y: 990, r: 14 },
  { x: 1786, y: 976, r: 10 },
  { x: 1750, y: 1016, r: 8 },
];
const BARREL_STAVES = [-30, -12, 6, 24];
const SPOKES = [0, 45, 90, 135, 180, 225, 270, 315];
const BALLS = [
  { x: 0, y: 0 },
  { x: 30, y: 0 },
  { x: 15, y: -24 },
];
</script>

<template>
  <g>
    <defs>
      <radialGradient id="pirate-sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff6c8" />
        <stop offset="70%" stop-color="#ffd27a" />
        <stop offset="100%" stop-color="#ff9a52" />
      </radialGradient>
      <linearGradient id="pirate-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f7a98a" />
        <stop offset="18%" stop-color="#6fa8b8" />
        <stop offset="100%" stop-color="#1f6a86" />
      </linearGradient>
      <linearGradient id="pirate-island" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c98f88" />
        <stop offset="100%" stop-color="#b27a84" />
      </linearGradient>
      <linearGradient id="pirate-wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#d79a5e" />
        <stop offset="55%" stop-color="#a8683a" />
        <stop offset="100%" stop-color="#6e3f22" />
      </linearGradient>
      <linearGradient id="pirate-rail" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c98a52" />
        <stop offset="100%" stop-color="#7a4426" />
      </linearGradient>
      <linearGradient id="pirate-deck" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e2a86a" />
        <stop offset="45%" stop-color="#c0804a" />
        <stop offset="100%" stop-color="#7a4426" />
      </linearGradient>
      <linearGradient id="pirate-sail" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff8e6" />
        <stop offset="60%" stop-color="#f3e0bc" />
        <stop offset="100%" stop-color="#d6b98c" />
      </linearGradient>
      <linearGradient id="pirate-iron" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6a6680" />
        <stop offset="50%" stop-color="#2e2a40" />
        <stop offset="100%" stop-color="#16121f" />
      </linearGradient>
      <linearGradient id="pirate-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="50%" stop-color="#ffcc33" />
        <stop offset="100%" stop-color="#d9861c" />
      </linearGradient>
      <linearGradient id="pirate-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe0b8" stop-opacity="0" />
        <stop offset="60%" stop-color="#ffe0b8" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ffe0b8" stop-opacity="0" />
      </linearGradient>
    </defs>

    <g fill="#ffb08a" opacity="0.55">
      <path d="M-60 250 Q120 220 340 236 Q420 250 300 262 Q120 270 -60 266 Z" />
      <path d="M1460 300 Q1640 270 1840 284 Q1990 294 1980 310 Q1700 320 1480 314 Z" />
      <path d="M700 420 Q900 398 1120 410 Q1180 424 1060 430 Q860 436 700 430 Z" />
    </g>
    <path d="M-40 250 Q120 228 320 240 M1480 298 Q1640 278 1820 288 M720 418 Q900 402 1100 412" stroke="#ffe6c4" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />

    <circle cx="1380" cy="640" r="260" fill="#fff1b0" opacity="0.18" />
    <circle cx="1380" cy="640" r="170" fill="#fff1b0" fill-opacity="0.3" class="glow" />
    <circle cx="1380" cy="640" r="110" fill="url(#pirate-sun)" stroke="#c4553a" stroke-width="4" />
    <path d="M1316 586 Q1340 560 1380 556" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.8" />

    <g v-for="(g, i) in GULLS" :key="`gl${i}`" class="gull" :style="{ animationDelay: `-${g.d}s`, animationDuration: `${g.s}s` }">
      <g :transform="`translate(0 ${g.y}) scale(${g.k})`">
        <path d="M-40 0 Q-20 -24 0 0 Q20 -24 40 0" stroke="#5a2a3a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" class="flap" />
      </g>
    </g>

    <path :d="`M-60 ${HORIZON} H1980 V900 H-60 Z`" fill="url(#pirate-sea)" />
    <g transform="translate(430 652)">
      <path d="M-200 2 Q-150 -30 -60 -42 Q20 -60 90 -34 Q170 -20 210 2 Z" fill="url(#pirate-island)" stroke="#a8566a" stroke-width="3" stroke-linejoin="round" />
      <path d="M-120 -24 Q-60 -38 0 -40" stroke="#e2b0a0" stroke-width="4" fill="none" stroke-linecap="round" />
      <g stroke="#a8566a" stroke-width="3" fill="#b77a86" stroke-linejoin="round">
        <path d="M-20 -46 Q-10 -110 6 -150" fill="none" stroke-width="7" />
        <path d="M6 -150 Q-40 -170 -76 -140 Q-36 -152 6 -150 Z M6 -150 Q50 -176 90 -144 Q46 -154 6 -150 Z M6 -150 Q-10 -190 -40 -196 Q-6 -176 6 -150 Z M6 -150 Q30 -186 64 -186 Q30 -170 6 -150 Z" />
        <path d="M60 -40 Q74 -90 96 -116" fill="none" stroke-width="6" />
        <path d="M96 -116 Q60 -134 30 -110 Q62 -118 96 -116 Z M96 -116 Q130 -136 160 -110 Q126 -120 96 -116 Z M96 -116 Q90 -150 66 -156 Q90 -140 96 -116 Z" />
      </g>
    </g>
    <path d="M1180 664 h400 M1230 680 h300 M1270 700 h220 M1300 724 h160 M1330 752 h100" stroke="#fff3c0" stroke-width="7" stroke-linecap="round" class="glow" />
    <rect x="-60" y="580" width="2040" height="150" fill="url(#pirate-haze)" />
    <g v-for="(r, i) in WAVE_ROWS" :key="`wv${i}`" class="wave" :style="{ animationDuration: `${r.s}s` }">
      <path :d="crests(r.y, r.k)" :stroke="r.c" :stroke-width="r.w" fill="none" stroke-linecap="round" :opacity="r.o" />
    </g>

    <g transform="translate(1770 0)">
      <path d="M0 790 V470" stroke="#1b1033" stroke-width="18" stroke-linecap="round" />
      <path d="M0 790 V470" stroke="#a8683a" stroke-width="10" stroke-linecap="round" />
      <circle cx="0" cy="462" r="12" fill="url(#pirate-gold)" stroke="#1b1033" stroke-width="4" />
      <g transform="translate(-6 480)">
        <g class="pirate-flag">
          <path d="M0 0 Q-60 -14 -110 6 Q-160 22 -200 4 Q-190 60 -206 116 Q-160 132 -110 114 Q-60 98 0 112 Z" fill="#241a33" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
          <path d="M-20 10 Q-70 0 -110 16" stroke="#4a3c5e" stroke-width="5" fill="none" stroke-linecap="round" />
          <g transform="translate(-104 58)" fill="#fffaf0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
            <path d="M-34 30 L34 -4 M-34 -4 L34 30" stroke="#fffaf0" stroke-width="9" stroke-linecap="round" />
            <circle cx="-36" cy="32" r="6" />
            <circle cx="36" cy="32" r="6" />
            <circle cx="-36" cy="-6" r="6" />
            <circle cx="36" cy="-6" r="6" />
            <path d="M-22 -10 Q-24 -40 0 -40 Q24 -40 22 -10 Q20 2 12 4 V12 H-12 V4 Q-20 2 -22 -10 Z" />
            <circle cx="-9" cy="-18" r="6" fill="#241a33" stroke="none" />
            <circle cx="9" cy="-18" r="6" fill="#241a33" stroke="none" />
            <path d="M-2 -6 L0 -10 L2 -6 Z" fill="#241a33" stroke="none" />
          </g>
        </g>
      </g>
    </g>

    <rect x="-60" y="852" width="2040" height="30" fill="url(#pirate-rail)" stroke="#1b1033" stroke-width="5" />
    <g fill="url(#pirate-wood)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)">
      <path v-for="x in BALUSTERS" :key="`bl${x}`" :d="`M${x - 9} 852 Q${x - 18} 834 ${x - 7} 820 Q${x - 14} 808 ${x - 8} 800 H${x + 8} Q${x + 14} 808 ${x + 7} 820 Q${x + 18} 834 ${x + 9} 852 Z`" />
    </g>
    <rect x="-60" y="778" width="2040" height="26" rx="6" fill="url(#pirate-rail)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
    <path d="M-60 785 H1980" stroke="#f0bd84" stroke-width="4" opacity="0.8" />

    <g transform="translate(1290 780)">
      <g class="parrot">
        <path d="M8 -10 Q30 30 22 70 Q8 40 -2 -6 Z" fill="#2e7ed6" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-10 -4 Q-36 -36 -20 -74 Q4 -98 22 -78 Q34 -50 20 -6 Z" fill="#ff3b3b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-4 -40 Q14 -60 22 -30 Q14 -6 -4 -14 Z" fill="#2ed47a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M2 -34 Q10 -40 16 -32 M2 -24 Q10 -30 16 -22" stroke="#178a4a" stroke-width="3" fill="none" />
        <path d="M-24 -66 Q-40 -66 -40 -50 Q-30 -54 -24 -52 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <circle cx="-12" cy="-66" r="8" fill="#fffaf0" stroke="#1b1033" stroke-width="2.5" />
        <circle cx="-13" cy="-66" r="3.5" fill="#1b1033" />
        <path d="M-14 -84 Q-4 -92 8 -86" stroke="#ff9a9a" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M-8 -2 l-4 8 M4 -2 l2 8" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>

    <path :d="`M-60 ${DECK_TOP} H1980 V1140 H-60 Z`" fill="url(#pirate-deck)" stroke="#1b1033" stroke-width="5" />
    <path :d="SEAM_PATH" stroke="#6a3a1e" stroke-width="3" opacity="0.55" />
    <path :d="JOINT_PATH" stroke="#6a3a1e" stroke-width="3" opacity="0.5" />
    <path :d="NAIL_PATH" stroke="#3a1e10" stroke-width="5" stroke-linecap="round" opacity="0.45" />
    <path d="M300 930 Q600 916 900 924 M1100 960 Q1300 950 1500 962" stroke="#f6c690" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.4" />
    <rect x="-60" y="880" width="2040" height="18" fill="#3a1e10" opacity="0.3" />

    <g stroke="#3a2418" stroke-width="4" fill="none" opacity="0.85">
      <path d="M262 300 L30 800 M262 300 L110 800 M262 300 L190 800 M262 300 L420 800 M262 300 L500 800" />
      <path d="M1880 260 L1600 800 M1880 260 L1680 800" />
    </g>
    <g stroke="#3a2418" stroke-width="3" fill="none" opacity="0.6">
      <path d="M90 670 L470 670 M120 600 L430 600 M150 530 L395 530 M180 460 L360 460 M212 400 L330 400" />
    </g>

    <g transform="translate(262 0)">
      <ellipse cx="0" cy="962" rx="90" ry="14" fill="#3a1e10" opacity="0.35" />
      <path d="M-26 -60 L-34 960 L34 960 L26 -60 Z" fill="url(#pirate-wood)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-16 -40 L-20 940" stroke="#f0bd84" stroke-width="5" opacity="0.6" />
      <path d="M-30 230 h60 M-32 520 h64 M-33 760 h66" stroke="#2e2a40" stroke-width="12" />
      <path d="M-30 226 h18 M-32 516 h18 M-33 756 h18" stroke="#8a86a0" stroke-width="3" />
      <rect x="-320" y="100" width="640" height="26" rx="12" fill="url(#pirate-rail)" stroke="#1b1033" stroke-width="5" />
    </g>
    <g transform="translate(262 126)">
      <g class="pirate-sail">
        <path d="M-300 0 H300 Q336 160 290 330 Q0 400 -290 330 Q-336 160 -300 0 Z" fill="url(#pirate-sail)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
        <path d="M-150 6 Q-170 170 -146 352 M0 6 Q-6 180 0 364 M150 6 Q170 170 146 352" stroke="#c9a878" stroke-width="4" fill="none" opacity="0.7" />
        <path d="M60 220 Q200 250 270 300 Q120 330 -20 340 Q30 290 60 220 Z" fill="#c9a878" opacity="0.4" />
        <path d="M-292 310 Q0 380 292 310 Q290 322 290 330 Q0 400 -290 330 Z" fill="#b8956a" opacity="0.5" />
        <path d="M-260 30 Q-276 140 -256 250" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />
        <rect x="-110" y="150" width="60" height="50" fill="#e8c890" stroke="#1b1033" stroke-width="3" transform="rotate(-6 -80 175)" />
        <path d="M-104 160 h48 M-104 190 h48" stroke="#a8683a" stroke-width="2" stroke-dasharray="4 5" transform="rotate(-6 -80 175)" />
      </g>
    </g>

    <g transform="translate(1880 0)">
      <path d="M-26 -60 L-34 980 L34 980 L26 -60 Z" fill="url(#pirate-wood)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-30 300 h60 M-32 620 h64" stroke="#2e2a40" stroke-width="12" />
      <rect x="-300" y="70" width="460" height="24" rx="12" fill="url(#pirate-rail)" stroke="#1b1033" stroke-width="5" />
    </g>
    <g transform="translate(1720 94)">
      <g class="pirate-sail" style="animation-delay: -1.7s">
        <path d="M-150 0 H260 V320 Q40 380 -140 310 Q-184 150 -150 0 Z" fill="url(#pirate-sail)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
        <path d="M-60 6 Q-80 160 -56 336 M60 6 Q50 180 64 350" stroke="#c9a878" stroke-width="4" fill="none" opacity="0.7" />
        <path d="M-140 290 Q40 350 258 300 V320 Q40 380 -140 310 Z" fill="#b8956a" opacity="0.5" />
        <path d="M-118 30 Q-136 140 -116 250" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />
      </g>
    </g>

    <g transform="translate(560 990)">
      <ellipse cx="0" cy="8" rx="150" ry="18" fill="#3a1e10" opacity="0.35" />
      <path d="M-30 -60 L150 -150 Q176 -156 182 -130 Q186 -108 164 -100 L-10 -10 Z" fill="url(#pirate-iron)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <ellipse cx="174" cy="-130" rx="14" ry="26" transform="rotate(-27 174 -130)" fill="#16121f" stroke="#1b1033" stroke-width="4" />
      <path d="M40 -100 L58 -64 M100 -128 L116 -94" stroke="#6a6680" stroke-width="8" />
      <path d="M-10 -66 L140 -140" stroke="#9a96b4" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <circle cx="-34" cy="-40" r="22" fill="url(#pirate-iron)" stroke="#1b1033" stroke-width="5" />
      <path d="M-100 0 L-90 -50 L80 -50 L100 0 Z" fill="url(#pirate-rail)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-84 -30 H86" stroke="#6a3a1e" stroke-width="3" opacity="0.6" />
      <g fill="#8a5a32" stroke="#1b1033" stroke-width="5">
        <circle cx="-60" cy="0" r="24" />
        <circle cx="60" cy="0" r="24" />
      </g>
      <circle cx="-60" cy="0" r="6" fill="#2e2a40" />
      <circle cx="60" cy="0" r="6" fill="#2e2a40" />
      <g transform="translate(160 0)">
        <circle v-for="(b, i) in BALLS" :key="`cb${i}`" :cx="b.x" :cy="b.y - 14" r="15" fill="url(#pirate-iron)" stroke="#1b1033" stroke-width="4" />
        <path d="M-6 -22 q4 -6 10 -6 M24 -22 q4 -6 10 -6 M9 -46 q4 -6 10 -6" stroke="#9a96b4" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g transform="translate(1540 1000)">
      <ellipse cx="0" cy="14" rx="120" ry="18" fill="#3a1e10" opacity="0.35" />
      <path d="M-40 10 L-30 -150 L30 -150 L40 10 Z" fill="url(#pirate-wood)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-20 -130 V-10" stroke="#f0bd84" stroke-width="4" opacity="0.6" />
      <g transform="translate(0 -210)">
        <g class="pirate-wheel">
          <g stroke-linecap="round">
            <path v-for="a in SPOKES" :key="`sp${a}`" d="M0 0 V-128" :transform="`rotate(${a})`" stroke="#1b1033" stroke-width="16" />
            <path v-for="a in SPOKES" :key="`sq${a}`" d="M0 0 V-128" :transform="`rotate(${a})`" stroke="#b47640" stroke-width="8" />
            <circle v-for="a in SPOKES" :key="`sk${a}`" cx="0" cy="-130" r="11" :transform="`rotate(${a})`" fill="#d79a5e" stroke="#1b1033" stroke-width="4" />
          </g>
          <circle r="96" fill="none" stroke="#1b1033" stroke-width="26" />
          <circle r="96" fill="none" stroke="#b47640" stroke-width="16" />
          <path d="M-80 -46 A92 92 0 0 1 -30 -88" stroke="#f0bd84" stroke-width="5" fill="none" stroke-linecap="round" />
          <circle r="26" fill="url(#pirate-gold)" stroke="#1b1033" stroke-width="5" />
          <circle cx="-8" cy="-8" r="6" fill="#fff" opacity="0.8" />
        </g>
      </g>
    </g>

    <path d="M1240 1070 a110 26 0 1 0 220 0 a110 26 0 1 0 -220 0 M1270 1068 a80 18 0 1 0 160 0 a80 18 0 1 0 -160 0 M1300 1066 a50 11 0 1 0 100 0" stroke="#1b1033" stroke-width="16" fill="none" />
    <path d="M1240 1070 a110 26 0 1 0 220 0 a110 26 0 1 0 -220 0 M1270 1068 a80 18 0 1 0 160 0 a80 18 0 1 0 -160 0 M1300 1066 a50 11 0 1 0 100 0" stroke="#d9b07a" stroke-width="9" fill="none" />

    <g transform="translate(1760 1080)">
      <ellipse cx="0" cy="10" rx="190" ry="22" fill="#3a1e10" opacity="0.4" />
      <path d="M-150 -90 Q-150 -190 0 -200 Q150 -190 150 -90 Z" fill="url(#pirate-rail)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" transform="rotate(-14 -150 -90)" filter="url(#cel-s)" />
      <path d="M-120 -120 Q-60 -170 40 -176" stroke="#f0bd84" stroke-width="6" fill="none" stroke-linecap="round" transform="rotate(-14 -150 -90)" />
      <path d="M-140 -90 Q-60 -130 0 -112 Q60 -134 140 -90 Q60 -78 0 -84 Q-60 -76 -140 -90 Z" fill="url(#pirate-gold)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <g fill="url(#pirate-gold)" stroke="#9a5a14" stroke-width="3">
        <circle cx="-70" cy="-112" r="14" />
        <circle cx="-30" cy="-120" r="14" />
        <circle cx="20" cy="-118" r="14" />
        <circle cx="70" cy="-110" r="14" />
        <circle cx="0" cy="-134" r="14" />
      </g>
      <path d="M-50 -140 L-30 -168 L-10 -140 Z" fill="#ff4f8a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M30 -136 L48 -160 L66 -136 L48 -124 Z" fill="#3ad6e0" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <rect x="-150" y="-90" width="300" height="110" rx="8" fill="url(#pirate-rail)" stroke="#1b1033" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-110 -90 V20 M110 -90 V20" stroke="#2e2a40" stroke-width="16" />
      <path d="M-150 -40 H150" stroke="#6a3a1e" stroke-width="3" opacity="0.6" />
      <rect x="-18" y="-80" width="36" height="40" rx="6" fill="url(#pirate-gold)" stroke="#1b1033" stroke-width="4" />
      <circle cx="0" cy="-64" r="5" fill="#1b1033" />
      <g transform="translate(-260 -40)" fill="url(#pirate-gold)" stroke="#9a5a14" stroke-width="3">
        <ellipse cx="0" cy="0" rx="16" ry="6" />
        <ellipse cx="30" cy="10" rx="16" ry="6" />
        <ellipse cx="10" cy="-6" rx="16" ry="6" />
      </g>
    </g>
    <g class="pirate-glint">
      <path v-for="(s, i) in SPARKLES" :key="`sk${i}`" :d="`M${s.x} ${s.y - s.r} Q${s.x} ${s.y} ${s.x + s.r} ${s.y} Q${s.x} ${s.y} ${s.x} ${s.y + s.r} Q${s.x} ${s.y} ${s.x - s.r} ${s.y} Q${s.x} ${s.y} ${s.x} ${s.y - s.r} Z`" fill="#fffbe0" />
    </g>

    <g v-for="(b, i) in [{ x: 110, y: 1040, k: 1.1 }, { x: 290, y: 1060, k: 0.95 }]" :key="`br${i}`" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`">
      <ellipse cx="0" cy="6" rx="80" ry="14" fill="#3a1e10" opacity="0.35" />
      <path d="M-56 0 Q-70 -80 -56 -160 L56 -160 Q70 -80 56 0 Z" fill="url(#pirate-wood)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path v-for="x in BARREL_STAVES" :key="`bs${x}`" :d="`M${x} -156 Q${x * 1.2} -80 ${x} -4`" stroke="#6a3a1e" stroke-width="3" fill="none" opacity="0.6" />
      <path d="M-62 -40 Q0 -30 62 -40 M-62 -120 Q0 -110 62 -120" stroke="#2e2a40" stroke-width="10" fill="none" />
      <ellipse cx="0" cy="-160" rx="56" ry="12" fill="#c98a52" stroke="#1b1033" stroke-width="5" />
      <path d="M-30 -164 Q0 -170 30 -164" stroke="#8a5a32" stroke-width="3" fill="none" />
      <path d="M-40 -146 Q-48 -90 -40 -50" stroke="#f0bd84" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    </g>

    <g fill="#2a140c" stroke="#120806" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 L-60 940 Q20 930 60 960 L80 1140 Z" />
      <path d="M1980 1140 L1980 960 Q1920 950 1890 980 L1880 1140 Z" />
    </g>
    <path d="M-40 1000 Q20 990 60 1010 M-40 1060 Q20 1050 70 1070" stroke="#5a3020" stroke-width="5" fill="none" stroke-linecap="round" />
  </g>
</template>

<style scoped>
.pirate-sail {
  transform-box: fill-box;
  transform-origin: top center;
  animation: pirate-billow 3.6s ease-in-out infinite alternate;
}

.pirate-flag {
  transform-box: fill-box;
  transform-origin: right center;
  animation: pirate-flutter 1.4s ease-in-out infinite alternate;
}

.pirate-wheel {
  transform-box: fill-box;
  transform-origin: center;
  animation: pirate-helm 6s ease-in-out infinite alternate;
}

.pirate-glint {
  animation: pirate-glint 2.4s ease-in-out infinite;
}

@keyframes pirate-billow {
  from {
    scale: 1 1;
  }
  to {
    scale: 1.03 1.05;
  }
}

@keyframes pirate-flutter {
  from {
    scale: 1 1;
    rotate: 0deg;
  }
  to {
    scale: 0.92 1.04;
    rotate: -3deg;
  }
}

@keyframes pirate-helm {
  from {
    rotate: -10deg;
  }
  to {
    rotate: 10deg;
  }
}

@keyframes pirate-glint {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
