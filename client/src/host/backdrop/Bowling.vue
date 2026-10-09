<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(5150);
const f1 = (n: number) => n.toFixed(1);

// one-point perspective: everything on the floor converges on VP; the ball animation scales about this same point
const VP = { x: 960, y: 300 };
const FAR = 600;
const FOUL = 960;
const proj = (x: number, y: number) => VP.x + ((x - VP.x) * (y - VP.y)) / (FAR - VP.y);
const LANE_W = 200;
const GUTTER = 20;
const LANES = Array.from({ length: 6 }, (_, i) => 360 + i * LANE_W);
const quad = (xa: number, xb: number, y0: number, y1: number) => `M${f1(proj(xa, y0))} ${y0} L${f1(proj(xb, y0))} ${y0} L${f1(proj(xb, y1))} ${y1} L${f1(proj(xa, y1))} ${y1} Z`;
const ray = (x: number, y0: number, y1: number) => `M${f1(proj(x, y0))} ${y0} L${f1(proj(x, y1))} ${y1}`;

const WOOD = LANES.map((x) => quad(x + GUTTER, x + LANE_W - GUTTER, FAR, FOUL)).join(' ');
const GUTTERS = LANES.flatMap((x) => [quad(x, x + GUTTER, FAR, FOUL), quad(x + LANE_W - GUTTER, x + LANE_W, FAR, FOUL)]).join(' ');
const DIVIDERS = [...LANES, 360 + 6 * LANE_W].map((x) => ray(x, FAR, 1140)).join(' ');
const BOARDS = LANES.flatMap((x) => Array.from({ length: 7 }, (_, j) => ray(x + GUTTER + ((LANE_W - 2 * GUTTER) * (j + 1)) / 8, FAR, FOUL))).join(' ');
const GLOSS = LANES.map((x) => quad(x + 46, x + 70, FAR + 30, FOUL)).join(' ');
const ARROW_Y = 800;
const ARROWS = LANES.flatMap((x) =>
  [0.2, 0.35, 0.5, 0.65, 0.8].map((t) => {
    const lx = x + GUTTER + (LANE_W - 2 * GUTTER) * t;
    const k = (ARROW_Y - VP.y) / (FAR - VP.y);
    const cx = proj(lx, ARROW_Y);
    return `M${f1(cx - 5 * k)} ${ARROW_Y + 6} L${f1(cx)} ${ARROW_Y - 10} L${f1(cx + 5 * k)} ${ARROW_Y + 6} Z`;
  }),
).join(' ');
const APPROACH_DOTS = LANES.flatMap((x) => [0.3, 0.5, 0.7].map((t) => `M${f1(proj(x + GUTTER + (LANE_W - 2 * GUTTER) * t, 1010))} 1010 h0.1`)).join(' ');

const PIN_ROWS = [
  { y: 594, k: 1.8, xs: [-1.5, -0.5, 0.5, 1.5] },
  { y: 603, k: 1.9, xs: [-1, 0, 1] },
  { y: 612, k: 2, xs: [-0.5, 0.5] },
  { y: 621, k: 2.1, xs: [0] },
];
const PINS = LANES.flatMap((x) => PIN_ROWS.flatMap((r) => r.xs.map((p) => ({ x: x + LANE_W / 2 + p * 40, y: r.y, k: r.k }))));

const BALL_LANE = 360 + 4.5 * LANE_W;
const BALL = { x: proj(BALL_LANE, FOUL), y: FOUL - 38, r: 38 };

const DECAL_COLORS = ['#ff4fd8', '#3af0ff', '#f6ff4a'];
const star = (x: number, y: number, r: number) => `M${f1(x)} ${f1(y - r)} L${f1(x + r * 0.3)} ${f1(y - r * 0.3)} L${f1(x + r)} ${f1(y)} L${f1(x + r * 0.3)} ${f1(y + r * 0.3)} L${f1(x)} ${f1(y + r)} L${f1(x - r * 0.3)} ${f1(y + r * 0.3)} L${f1(x - r)} ${f1(y)} L${f1(x - r * 0.3)} ${f1(y - r * 0.3)} Z`;
const DECALS = DECAL_COLORS.map(() =>
  Array.from({ length: 9 }, () => {
    const y = 680 + rnd() * 440;
    const x = proj(360 + rnd() * 1200, y);
    const r = (4 + rnd() * 6) * ((y - VP.y) / (FAR - VP.y));
    return rnd() > 0.5 ? star(x, y, r) : `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r * 0.6)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r * 0.6)} 0 1 0 ${f1(-r * 2)} 0`;
  }).join(' '),
);

const SCREENS = [470, 1070];
const BAR_ROWS = [
  { y: 372, w: 0.8, c: '#3af0ff' },
  { y: 392, w: 0.55, c: '#ff4fd8' },
];
const RETURN_BALLS = [
  { x: -110, c: '#ff3d6e' },
  { x: -50, c: '#3ad6e0' },
  { x: 10, c: '#ffd23f' },
  { x: 70, c: '#8a6bff' },
];
const SHOES = [
  { x: -30, y: 870, c: '#ff3d6e' },
  { x: 110, y: 870, c: '#3a8cff' },
  { x: 250, y: 870, c: '#2ed47a' },
  { x: -30, y: 990, c: '#ffd23f' },
  { x: 110, y: 990, c: '#ff3d6e' },
  { x: 250, y: 990, c: '#8a6bff' },
];
const BEAMS = [
  { d: 'M240 -40 L300 -40 L980 1140 L620 1140 Z', c: '#ff4fd8', delay: 0 },
  { d: 'M930 -40 L990 -40 L1240 1140 L780 1140 Z', c: '#3af0ff', delay: 2.4 },
  { d: 'M1620 -40 L1680 -40 L1360 1140 L940 1140 Z', c: '#f6ff4a', delay: 4.8 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="bowling-back" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1e0f44" />
        <stop offset="100%" stop-color="#341a6a" />
      </linearGradient>
      <linearGradient id="bowling-side" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2a1458" />
        <stop offset="100%" stop-color="#40217a" />
      </linearGradient>
      <linearGradient id="bowling-side-r" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="#22104a" />
        <stop offset="100%" stop-color="#3a1e72" />
      </linearGradient>
      <linearGradient id="bowling-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c98a5a" />
        <stop offset="40%" stop-color="#e6aa6a" />
        <stop offset="100%" stop-color="#b8703a" />
      </linearGradient>
      <linearGradient id="bowling-approach" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d9965a" />
        <stop offset="100%" stop-color="#7a4426" />
      </linearGradient>
      <linearGradient id="bowling-cosmic" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a1458" stop-opacity="0.55" />
        <stop offset="40%" stop-color="#5a2a9a" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#2a1458" stop-opacity="0.5" />
      </linearGradient>
      <linearGradient id="bowling-deck" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a3a9a" />
        <stop offset="100%" stop-color="#fff0c8" />
      </linearGradient>
      <linearGradient id="bowling-mask" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a2aa6" />
        <stop offset="100%" stop-color="#2a1260" />
      </linearGradient>
      <linearGradient id="bowling-chrome" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4f0ff" />
        <stop offset="50%" stop-color="#a8a0c8" />
        <stop offset="100%" stop-color="#5a5080" />
      </linearGradient>
      <linearGradient id="bowling-rack" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c98a52" />
        <stop offset="100%" stop-color="#6e3f22" />
      </linearGradient>
      <radialGradient id="bowling-ball" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ff9ad8" />
        <stop offset="45%" stop-color="#d42a9a" />
        <stop offset="100%" stop-color="#4a0a48" />
      </radialGradient>
      <radialGradient id="bowling-floorglow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#b04aff" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#b04aff" stop-opacity="0" />
      </radialGradient>
    </defs>

    <path d="M-60 -40 L360 100 L1560 100 L1980 -40 Z" fill="#120828" />
    <path d="M560 100 L280 -40 M960 100 V-40 M1360 100 L1640 -40" stroke="#3a2a6a" stroke-width="3" opacity="0.6" />
    <rect x="360" y="100" width="1200" height="500" fill="url(#bowling-back)" />
    <path d="M360 100 L-60 -40 L-60 810 L360 600 Z" fill="url(#bowling-side)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M1560 100 L1980 -40 L1980 810 L1560 600 Z" fill="url(#bowling-side-r)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M250 63 V655 M140 27 V710 M30 -10 V765 M1670 63 V655 M1780 27 V710 M1890 -10 V765" stroke="#1b1033" stroke-width="3" opacity="0.35" />
    <path d="M360 330 L-60 400 M1560 330 L1980 400" stroke="#ff4fd8" stroke-width="4" opacity="0.35" />

    <g v-for="(x, i) in SCREENS" :key="`sc${i}`">
      <path :d="`M${x + 60} 100 V290 M${x + 320} 100 V290`" stroke="#1b1033" stroke-width="6" />
      <rect :x="x - 10" y="282" width="400" height="140" rx="14" fill="#1b1033" />
      <rect :x="x" y="292" width="380" height="120" rx="8" fill="#140c34" stroke="#5a4aa0" stroke-width="3" />
      <path :d="Array.from({ length: 10 }, (_, j) => `M${x + 16 + j * 35} 306 h30 v26 h-30 Z`).join(' ')" fill="none" stroke="#5a4aa0" stroke-width="2.5" />
      <path :d="Array.from({ length: 10 }, (_, j) => `M${x + 23 + j * 35} 316 h14`).join(' ')" stroke="#3af0ff" stroke-width="5" stroke-linecap="round" opacity="0.55" />
      <path v-for="(b, j) in BAR_ROWS" :key="`br${j}`" :d="`M${x + 18} ${b.y} h${(i ? 1 - b.w + 0.3 : b.w) * 340}`" :stroke="b.c" stroke-width="10" stroke-linecap="round" opacity="0.75" />
      <path :d="`M${x + 10} 300 Q${x + 120} 290 ${x + 200} 296`" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.25" />
    </g>
    <g class="bowling-blink">
      <path d="M773 316 h14 M1093 316 h14 M1128 316 h14" stroke="#f6ff4a" stroke-width="5" stroke-linecap="round" />
    </g>

    <rect x="360" y="430" width="1200" height="118" fill="url(#bowling-mask)" stroke="#1b1033" stroke-width="5" />
    <path d="M360 444 H1560" stroke="#8a5ad6" stroke-width="4" opacity="0.7" />
    <path d="M420 520 Q520 460 640 500 Q760 540 880 480 Q1000 430 1120 500 Q1240 560 1360 480 Q1440 440 1520 470" stroke="#3af0ff" stroke-width="5" fill="none" opacity="0.5" />
    <path d="M400 480 Q520 520 640 470 Q800 420 920 510 M1180 460 Q1300 520 1500 500" stroke="#ff4fd8" stroke-width="4" fill="none" opacity="0.45" />
    <circle cx="560" cy="478" r="16" fill="#ffd23f" opacity="0.7" />
    <path d="M536 480 Q560 468 584 480" stroke="#ff8a2f" stroke-width="4" fill="none" opacity="0.7" />
    <circle cx="1400" cy="490" r="12" fill="#3af0ff" opacity="0.6" />
    <path :d="`${star(760, 470, 9)} ${star(1060, 520, 7)} ${star(1220, 462, 8)} ${star(460, 520, 6)}`" fill="#fff6c8" opacity="0.7" />
    <path v-for="x in LANES" :key="`dk${x}`" :d="`M${x + 14} 548 H${x + LANE_W - 14} V600 H${x + 14} Z`" fill="url(#bowling-deck)" opacity="0.85" />
    <path :d="LANES.map((x) => `M${x} 548 V600`).join(' ') + ' M1560 548 V600'" stroke="#1b1033" stroke-width="6" />

    <path :d="quad(360, 1560, FAR, FOUL)" fill="#2a1640" />
    <path :d="WOOD" fill="url(#bowling-wood)" />
    <path :d="BOARDS" stroke="#8a4a22" stroke-width="1.5" opacity="0.45" />
    <path :d="GLOSS" fill="#fff6e0" opacity="0.18" />
    <path :d="ARROWS" fill="#6a2a14" opacity="0.6" />
    <path :d="GUTTERS" fill="#3a2a5a" stroke="#1b1033" stroke-width="2" />
    <path :d="quad(360, 1560, FAR, 1140)" fill="url(#bowling-cosmic)" />
    <path :d="quad(-1000, 3000, FOUL, 1140)" fill="url(#bowling-approach)" />
    <path :d="APPROACH_DOTS" stroke="#3a1a10" stroke-width="7" stroke-linecap="round" opacity="0.5" />
    <path :d="DIVIDERS" stroke="#1b1033" stroke-width="5" />
    <path :d="quad(-1000, 3000, FOUL + 40, 1140)" fill="#2a1458" opacity="0.35" />
    <path :d="`M-60 ${FOUL} H1980`" stroke="#3af0ff" stroke-width="16" opacity="0.25" />
    <path :d="`M-60 ${FOUL} H1980`" stroke="#3af0ff" stroke-width="5" />
    <path :d="`M-60 ${FOUL - 2} H1980`" stroke="#e8ffff" stroke-width="1.5" />
    <ellipse cx="960" cy="1060" rx="760" ry="110" fill="url(#bowling-floorglow)" />
    <g class="bowling-cosmic">
      <path v-for="(d, i) in DECALS" :key="`dc${i}`" :d="d" :fill="DECAL_COLORS[i]" opacity="0.4" />
    </g>

    <g fill="#fffaf0" stroke="#1b1033" stroke-width="0.9" stroke-linejoin="round">
      <g v-for="(p, i) in PINS" :key="`pn${i}`" :transform="`translate(${p.x} ${p.y}) scale(${p.k})`">
        <path d="M-3 0 Q-5.4 -6 -3.4 -10 Q-1.6 -13 -2.2 -16 Q-3 -20 0 -21 Q3 -20 2.2 -16 Q1.6 -13 3.4 -10 Q5.4 -6 3 0 Z" />
        <path d="M-2 -15 H2 M-1.9 -13.4 H1.9" stroke="#ff3d6e" stroke-width="1" />
      </g>
    </g>

    <g class="bowling-roll">
      <ellipse :cx="BALL.x" :cy="FOUL + 6" :rx="BALL.r * 0.8" :ry="BALL.r * 0.22" fill="#ff4fd8" opacity="0.3" />
      <g class="bowling-spin">
        <circle :cx="BALL.x" :cy="BALL.y" :r="BALL.r" fill="url(#bowling-ball)" stroke="#1b1033" stroke-width="4" />
        <circle :cx="BALL.x - 8" :cy="BALL.y - 14" r="5" fill="#2a0a28" />
        <circle :cx="BALL.x + 8" :cy="BALL.y - 14" r="5" fill="#2a0a28" />
        <circle :cx="BALL.x" :cy="BALL.y + 2" r="6" fill="#2a0a28" />
      </g>
      <path :d="`M${BALL.x - 26} ${BALL.y - 12} Q${BALL.x - 20} ${BALL.y - 28} ${BALL.x - 4} ${BALL.y - 32}`" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>

    <g v-for="(b, i) in BEAMS" :key="`bm${i}`" class="bowling-beam" :style="{ animationDelay: `-${b.delay}s` }">
      <path :d="b.d" :fill="b.c" />
    </g>

    <g stroke-linecap="round" stroke-linejoin="round" fill="none">
      <g transform="translate(150 470)">
        <path d="M-30 0 Q-50 -60 -30 -100 Q-15 -130 -22 -160 Q-30 -200 0 -210 Q30 -200 22 -160 Q15 -130 30 -100 Q50 -60 30 0 Z M-20 -150 H20 M-21 -138 H21" stroke="#ff4fd8" stroke-width="18" opacity="0.25" />
        <path d="M-30 0 Q-50 -60 -30 -100 Q-15 -130 -22 -160 Q-30 -200 0 -210 Q30 -200 22 -160 Q15 -130 30 -100 Q50 -60 30 0 Z M-20 -150 H20 M-21 -138 H21" stroke="#ff4fd8" stroke-width="6" />
        <path d="M-30 0 Q-50 -60 -30 -100 Q-15 -130 -22 -160 Q-30 -200 0 -210 Q30 -200 22 -160 Q15 -130 30 -100 Q50 -60 30 0 Z" stroke="#ffd6f4" stroke-width="2" />
      </g>
      <g class="bowling-flicker">
        <path d="M20 650 L64 600 L104 640 L150 586 L190 620 L232 572 L268 600 L306 562 L340 584" stroke="#5aff7a" stroke-width="18" opacity="0.25" />
        <path d="M20 650 L64 600 L104 640 L150 586 L190 620 L232 572 L268 600 L306 562 L340 584" stroke="#5aff7a" stroke-width="6" />
        <path d="M20 650 L64 600 L104 640 L150 586 L190 620 L232 572 L268 600 L306 562 L340 584" stroke="#e0ffe6" stroke-width="2" />
      </g>
      <g transform="translate(1770 290)">
        <circle r="84" stroke="#3af0ff" stroke-width="18" opacity="0.25" />
        <circle r="84" stroke="#3af0ff" stroke-width="6" />
        <circle r="84" stroke="#e0ffff" stroke-width="2" />
        <path d="M-26 -40 a9 9 0 1 0 0.1 0 M4 -46 a9 9 0 1 0 0.1 0 M-16 -10 a9 9 0 1 0 0.1 0" stroke="#3af0ff" stroke-width="5" />
        <path d="M-150 -30 H-106 M-160 6 H-108 M-146 42 H-112" stroke="#3af0ff" stroke-width="6" />
      </g>
      <g class="bowling-flicker" style="animation-delay: -2.1s">
        <path :d="star(1680, 520, 54)" stroke="#f6ff4a" stroke-width="18" opacity="0.25" />
        <path :d="star(1680, 520, 54)" stroke="#f6ff4a" stroke-width="6" />
        <path :d="star(1680, 520, 54)" stroke="#ffffe0" stroke-width="2" />
      </g>
    </g>

    <g transform="translate(1800 1060)">
      <ellipse cx="0" cy="20" rx="220" ry="26" fill="#0c0618" opacity="0.5" />
      <path d="M-200 20 L-190 -60 L190 -60 L200 20 Z" fill="#3a2a6a" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-186 -48 H180" stroke="#7a6ac0" stroke-width="4" opacity="0.7" />
      <path d="M-170 -60 Q-176 -120 -130 -128 L150 -128 Q180 -124 176 -60" fill="none" stroke="#1b1033" stroke-width="16" stroke-linecap="round" />
      <path d="M-170 -60 Q-176 -120 -130 -128 L150 -128 Q180 -124 176 -60" fill="none" stroke="url(#bowling-chrome)" stroke-width="8" stroke-linecap="round" />
      <g v-for="(b, i) in RETURN_BALLS" :key="`rb${i}`">
        <circle :cx="b.x" cy="-98" r="28" :fill="b.c" stroke="#1b1033" stroke-width="4" />
        <path :d="`M${b.x - 16} -108 Q${b.x - 10} -122 ${b.x + 2} -124`" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
        <circle :cx="b.x + 6" cy="-94" r="4" fill="#1b1033" opacity="0.7" />
        <circle :cx="b.x + 14" cy="-100" r="4" fill="#1b1033" opacity="0.7" />
        <path :d="`M${b.x - 10} -76 Q${b.x + 8} -74 ${b.x + 22} -86`" stroke="#1b1033" stroke-width="3" fill="none" opacity="0.3" />
      </g>
      <path d="M-190 -60 Q-190 -200 0 -210 Q190 -200 190 -60 L150 -60 Q150 -168 0 -172 Q-150 -168 -150 -60 Z" fill="#ff3d6e" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-170 -100 Q-160 -180 -40 -194" stroke="#ffb0c0" stroke-width="5" fill="none" stroke-linecap="round" />
      <circle cx="0" cy="-191" r="9" fill="#f6ff4a" stroke="#1b1033" stroke-width="3" />
    </g>

    <g transform="translate(0 0)">
      <ellipse cx="160" cy="1110" rx="260" ry="26" fill="#0c0618" opacity="0.5" />
      <rect x="-80" y="790" width="440" height="330" rx="10" fill="url(#bowling-rack)" stroke="#1b1033" stroke-width="6" filter="url(#cel)" />
      <path d="M-60 910 H340 M-60 1030 H340" stroke="#1b1033" stroke-width="10" />
      <path d="M-60 906 H340 M-60 1026 H340" stroke="#e8b07a" stroke-width="3" opacity="0.7" />
      <path d="M70 800 V1110 M210 800 V1110" stroke="#1b1033" stroke-width="6" />
      <path d="M-62 806 V1100" stroke="#e8b07a" stroke-width="5" stroke-linecap="round" opacity="0.6" />
      <g v-for="(s, i) in SHOES" :key="`sh${i}`" :transform="`translate(${s.x} ${s.y + 30})`">
        <g v-for="o in [0, 22]" :key="o" :transform="`translate(${o} ${-o * 0.2})`">
          <path d="M0 0 L88 0 Q98 -8 90 -20 L58 -28 L44 -46 L8 -46 Q0 -26 0 0 Z" fill="#fff4e8" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
          <path d="M8 -46 L44 -46 L58 -28 L30 -22 Q12 -24 8 -46 Z" :fill="s.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <path d="M0 -6 H90" stroke="#3a2a50" stroke-width="5" />
          <path d="M40 -40 l8 6 M46 -34 l8 6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
          <path d="M70 -14 h12" :stroke="s.c" stroke-width="5" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <g fill="#0c0618" stroke="#05020c" stroke-width="5" stroke-linejoin="round">
      <path d="M1980 1140 L1980 900 Q1960 880 1940 900 L1930 1140 Z" />
      <path d="M-60 1140 L-60 1060 Q60 1050 120 1090 L130 1140 Z" />
    </g>
  </g>
</template>

<style scoped>
.bowling-roll {
  transform-box: view-box;
  transform-origin: 960px 300px;
  animation: bowling-roll 6s ease-out infinite;
}

.bowling-spin {
  transform-box: fill-box;
  transform-origin: center;
  animation: bowling-spin 0.8s linear infinite;
}

.bowling-beam {
  opacity: 0;
  animation: bowling-beam 7.2s ease-in-out infinite;
}

.bowling-flicker {
  animation: bowling-flicker 4s steps(1) infinite;
}

.bowling-blink {
  animation: bowling-blink 1.4s steps(2) infinite;
}

.bowling-cosmic {
  animation: bowling-cosmic 3s ease-in-out infinite alternate;
}

@keyframes bowling-roll {
  0% {
    scale: 1.08;
    opacity: 0;
  }
  6% {
    opacity: 1;
  }
  72% {
    scale: 0.5;
    opacity: 1;
  }
  80%,
  100% {
    scale: 0.48;
    opacity: 0;
  }
}

@keyframes bowling-spin {
  to {
    rotate: -360deg;
  }
}

@keyframes bowling-beam {
  0%,
  100% {
    opacity: 0;
  }
  30% {
    opacity: 0.14;
  }
  55% {
    opacity: 0;
  }
}

@keyframes bowling-flicker {
  0%,
  40%,
  44%,
  48%,
  100% {
    opacity: 1;
  }
  42%,
  46% {
    opacity: 0.35;
  }
}

@keyframes bowling-blink {
  to {
    opacity: 0.2;
  }
}

@keyframes bowling-cosmic {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}
</style>
