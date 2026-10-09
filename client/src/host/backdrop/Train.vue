<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(517);
const TILE = 1920;
type Wave = [number, number, number];

// every wave has a whole number of periods per tile, so a layer shifted by one tile lands on itself
function waveY(base: number, waves: Wave[], x: number): number {
  return waves.reduce((y, [k, a, p]) => y + a * Math.sin((2 * Math.PI * k * x) / TILE + p), base);
}
function ridge(base: number, waves: Wave[], bottom: number): string {
  let d = `M-40 ${bottom}`;
  for (let x = -40; x <= 2 * TILE + 40; x += 32) d += ` L${x} ${waveY(base, waves, x).toFixed(1)}`;
  return `${d} L${2 * TILE + 40} ${bottom} Z`;
}
const twice = <T extends { x: number }>(items: T[]): T[] => items.flatMap((o) => [o, { ...o, x: o.x + TILE }]);

const FAR_W: Wave[] = [
  [2, 26, 0],
  [3, 14, 1],
  [5, 6, 2],
];
const MID_W: Wave[] = [
  [1, 10, 0.5],
  [4, 12, 0],
  [7, 4, 1],
];
const NEAR_W: Wave[] = [
  [3, 6, 0],
  [8, 3, 1],
];
const FAR = ridge(470, FAR_W, 700);
const MID = ridge(548, MID_W, 700);
const NEAR = ridge(626, NEAR_W, 700);

const FAR_TREES = twice(
  Array.from({ length: 22 }, () => {
    const x = rnd() * TILE;
    return { x, y: waveY(470, FAR_W, x) + 6, r: 8 + rnd() * 7 };
  }),
);
const CHURCHES = twice([{ x: 640 }, { x: 1560 }].map((c) => ({ ...c, y: waveY(470, FAR_W, c.x) + 8 })));
const MID_TREES = twice(
  Array.from({ length: 12 }, () => {
    const x = rnd() * TILE;
    return { x, y: waveY(548, MID_W, x) + 10 + rnd() * 20, r: 16 + rnd() * 12 };
  }),
);
const HOUSES = twice(
  [
    { x: 300, c: '#e8553f' },
    { x: 360, c: '#4a7ad8' },
    { x: 430, c: '#e8553f' },
    { x: 1180, c: '#f0a030' },
    { x: 1240, c: '#e8553f' },
  ].map((h) => ({ ...h, y: waveY(548, MID_W, h.x) + 22 })),
);
const STACKS = twice([{ x: 800 }, { x: 870 }, { x: 1620 }].map((s) => ({ ...s, y: waveY(548, MID_W, s.x) + 30 })));
const BUSHES = twice(
  Array.from({ length: 9 }, () => {
    const x = rnd() * TILE;
    return { x, y: waveY(626, NEAR_W, x) + 8, r: 18 + rnd() * 14 };
  }),
);
const POLES = Array.from({ length: 7 }, (_, i) => 160 + i * 640);
const WIRES = POLES.slice(0, -1)
  .map((x) => `M${x - 30} 284 Q${x + 290} 318 ${x + 610} 284 M${x + 30} 284 Q${x + 350} 318 ${x + 670} 284`)
  .join(' ');
const CLOUDS = twice([
  { x: 260, y: 320, k: 0.8 },
  { x: 900, y: 296, k: 1 },
  { x: 1500, y: 340, k: 0.7 },
]);

const WINDOWS = [120, 1120];
const WIN_W = 680;
// panelling grain, skipping the window holes
const PLANKS = Array.from({ length: 34 }, (_, i) => -40 + i * 60)
  .map((x) => (WINDOWS.some((w) => x > w && x < w + WIN_W) ? `M${x} 70 V246 M${x} 668 V700` : `M${x} 70 V700`))
  .join(' ');
const WALL = `M-60 -60 H1980 V910 H-60 Z ${WINDOWS.map((w) => `M${w + 34} 262 H${w + WIN_W - 34} Q${w + WIN_W - 12} 262 ${w + WIN_W - 12} 284 V626 Q${w + WIN_W - 12} 648 ${w + WIN_W - 34} 648 H${w + 34} Q${w + 12} 648 ${w + 12} 626 V284 Q${w + 12} 262 ${w + 34} 262 Z`).join(' ')}`;
const BUTTONS = [
  { x: 0, y: 600 },
  { x: 0, y: 680 },
  { x: 0, y: 760 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="train-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c4e4cf" />
        <stop offset="100%" stop-color="#a6d0bc" />
      </linearGradient>
      <linearGradient id="train-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eaf8ff" stop-opacity="0" />
        <stop offset="60%" stop-color="#eaf8ff" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#eaf8ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="train-mid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a6e070" />
        <stop offset="100%" stop-color="#5fb04a" />
      </linearGradient>
      <linearGradient id="train-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4fa042" />
        <stop offset="100%" stop-color="#2a6e30" />
      </linearGradient>
      <linearGradient id="train-wood" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#d0844a" />
        <stop offset="100%" stop-color="#9a4f27" />
      </linearGradient>
      <linearGradient id="train-wood-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a4424" />
        <stop offset="100%" stop-color="#5e2a14" />
      </linearGradient>
      <linearGradient id="train-ceiling" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8cfa0" />
        <stop offset="100%" stop-color="#fff1d0" />
      </linearGradient>
      <linearGradient id="train-frame" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#a85e30" />
        <stop offset="100%" stop-color="#6e3518" />
      </linearGradient>
      <linearGradient id="train-curtain" x1="0" y1="0" x2="36" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
        <stop offset="0%" stop-color="#8a1834" />
        <stop offset="45%" stop-color="#d03a52" />
        <stop offset="60%" stop-color="#e8607a" />
        <stop offset="100%" stop-color="#8a1834" />
      </linearGradient>
      <linearGradient id="train-brass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe7a0" />
        <stop offset="100%" stop-color="#c08a2a" />
      </linearGradient>
      <linearGradient id="train-silver" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f6f8fd" />
        <stop offset="45%" stop-color="#bcc4d8" />
        <stop offset="100%" stop-color="#6c7490" />
      </linearGradient>
      <linearGradient id="train-tea" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffb04a" />
        <stop offset="100%" stop-color="#a8461a" />
      </linearGradient>
      <linearGradient id="train-seat" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4f9a74" />
        <stop offset="100%" stop-color="#1f4a36" />
      </linearGradient>
      <linearGradient id="train-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6a3a20" />
        <stop offset="100%" stop-color="#3e1e10" />
      </linearGradient>
      <linearGradient id="train-shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffe08a" />
        <stop offset="100%" stop-color="#f08a2a" />
      </linearGradient>
      <linearGradient id="train-case" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c8743a" />
        <stop offset="100%" stop-color="#8a4420" />
      </linearGradient>
      <linearGradient id="train-case-b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a9ad8" />
        <stop offset="100%" stop-color="#2f5ea0" />
      </linearGradient>
      <radialGradient id="train-glow">
        <stop offset="0%" stop-color="#fff0b8" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#fff0b8" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- no clip to the glass: WALL's cut-outs already frame the view, and a clip under the panning
         layers made WebKit repaint the whole window area every frame (28 fps at Retina) -->
    <g>
      <g class="train-pan train-clouds">
        <g v-for="(c, i) in CLOUDS" :key="`cl${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.k})`">
          <path d="M-90 16 Q-112 -6 -82 -20 Q-74 -50 -36 -44 Q-16 -72 24 -60 Q54 -76 72 -44 Q106 -42 98 -12 Q112 10 82 16 Z" fill="#fff" stroke="#8ab4dc" stroke-width="3.5" stroke-linejoin="round" />
          <path d="M-82 12 Q0 2 84 12 Q30 22 -82 12 Z" fill="#d6e8f8" />
          <path d="M-52 -34 Q-36 -46 -20 -44" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
        </g>
      </g>
      <g class="train-pan train-far">
        <path :d="FAR" fill="url(#train-far)" stroke="#7fae9e" stroke-width="3" stroke-linejoin="round" />
        <g v-for="(t, i) in FAR_TREES" :key="`ft${i}`">
          <circle :cx="t.x" :cy="t.y - t.r" :r="t.r" fill="#8cc4a0" stroke="#7fae9e" stroke-width="2.5" />
        </g>
        <g v-for="(c, i) in CHURCHES" :key="`ch${i}`" :transform="`translate(${c.x} ${c.y})`" stroke="#7fae9e" stroke-width="2.5" stroke-linejoin="round">
          <rect x="-34" y="-30" width="26" height="30" fill="#f4f0e4" />
          <path d="M-36 -30 L-21 -44 L-6 -30 Z" fill="#d88a7a" />
          <rect x="-6" y="-54" width="22" height="54" fill="#fbf7ec" />
          <path d="M-8 -54 Q-10 -70 5 -82 Q20 -70 18 -54 Z" fill="#7aa6e0" />
          <path d="M5 -82 V-94" />
          <rect x="22" y="-24" width="22" height="24" fill="#f4f0e4" />
          <path d="M20 -24 L33 -36 L46 -24 Z" fill="#d88a7a" />
        </g>
      </g>
      <rect x="-60" y="430" width="2040" height="140" fill="url(#train-haze)" />
      <g class="train-pan train-mid">
        <path :d="MID" fill="url(#train-mid)" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path :d="MID" fill="none" stroke="#4f9a3a" stroke-width="3" stroke-dasharray="40 90" opacity="0.6" transform="translate(0 30)" />
        <g v-for="(h, i) in HOUSES" :key="`h${i}`" :transform="`translate(${h.x} ${h.y})`" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
          <rect x="-24" y="-34" width="48" height="34" fill="#fff6e0" />
          <path d="M-30 -32 L0 -58 L30 -32 Z" :fill="h.c" />
          <rect x="-8" y="-24" width="16" height="14" fill="#ffd96b" />
          <path d="M-20 -40 L-2 -54" stroke="#fff" stroke-width="3" opacity="0.6" />
        </g>
        <g v-for="(s, i) in STACKS" :key="`hs${i}`" :transform="`translate(${s.x} ${s.y})`">
          <path d="M-20 0 Q-22 -34 0 -40 Q22 -34 20 0 Z" fill="#f2c25a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <path d="M-8 -30 Q-2 -36 6 -34" stroke="#fff3b8" stroke-width="3" fill="none" stroke-linecap="round" />
        </g>
        <g v-for="(t, i) in MID_TREES" :key="`mt${i}`">
          <path :d="`M${t.x} ${t.y} V${t.y - t.r}`" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />
          <circle :cx="t.x" :cy="t.y - t.r * 1.4" :r="t.r" fill="#3f9a48" stroke="#1b1033" stroke-width="3" />
          <path :d="`M${t.x - t.r * 0.55} ${t.y - t.r * 1.8} q${t.r * 0.3} ${-t.r * 0.35} ${t.r * 0.75} ${-t.r * 0.3}`" stroke="#9be08a" stroke-width="3.5" fill="none" stroke-linecap="round" />
        </g>
      </g>
      <g class="train-pan train-near">
        <path :d="NEAR" fill="url(#train-near)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <g v-for="(b, i) in BUSHES" :key="`b${i}`" stroke="#1b1033" stroke-width="3.5">
          <circle :cx="b.x - b.r * 0.7" :cy="b.y" :r="b.r * 0.8" fill="#2f7a34" />
          <circle :cx="b.x + b.r * 0.6" :cy="b.y + 2" :r="b.r * 0.75" fill="#2f7a34" />
          <circle :cx="b.x" :cy="b.y - b.r * 0.4" :r="b.r" fill="#3f9440" />
          <path :d="`M${b.x - b.r * 0.5} ${b.y - b.r * 0.9} q${b.r * 0.3} ${-b.r * 0.3} ${b.r * 0.7} ${-b.r * 0.2}`" stroke="#8ad47a" fill="none" stroke-linecap="round" />
        </g>
        <path :d="WIRES" stroke="#1b1033" stroke-width="2.5" fill="none" />
        <g v-for="x in POLES" :key="`p${x}`" stroke="#1b1033" stroke-linejoin="round">
          <rect :x="x - 8" y="220" width="16" height="440" fill="#7a4a2a" stroke-width="4" />
          <path :d="`M${x - 3} 230 V650`" stroke="#b07a4a" stroke-width="3" />
          <rect :x="x - 44" y="276" width="88" height="12" rx="3" fill="#7a4a2a" stroke-width="3.5" />
          <circle :cx="x - 32" cy="276" r="5" fill="#e8f4ff" stroke-width="2.5" />
          <circle :cx="x + 32" cy="276" r="5" fill="#e8f4ff" stroke-width="2.5" />
        </g>
      </g>
    </g>
    <g stroke="#fff" stroke-linecap="round" opacity="0.28">
      <path v-for="w in WINDOWS" :key="`gl${w}`" :d="`M${w + 300} 290 L${w + 160} 620 M${w + 360} 290 L${w + 250} 560 M${w + 620} 300 L${w + 520} 520`" stroke-width="16" />
    </g>

    <path :d="WALL" fill="url(#train-wood)" fill-rule="evenodd" />
    <path :d="PLANKS" stroke="#7a3a1a" stroke-width="3" opacity="0.28" />
    <path d="M-60 236 H1980" stroke="#1b1033" stroke-width="4" opacity="0.5" />
    <path d="M-60 228 H1980" stroke="#f0b07a" stroke-width="5" opacity="0.6" />

    <path d="M-60 -60 H1980 V60 Q960 104 -60 60 Z" fill="url(#train-ceiling)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M200 40 Q960 74 1720 40" stroke="#c8a878" stroke-width="4" fill="none" opacity="0.6" />
    <g v-for="x in [480, 1440]" :key="`cl${x}`" :transform="`translate(${x} 82)`">
      <circle r="120" fill="url(#train-glow)" class="glow" />
      <path d="M-40 -8 Q0 30 40 -8 Z" fill="#fff4cc" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <rect x="-48" y="-14" width="96" height="10" rx="4" fill="url(#train-brass)" stroke="#1b1033" stroke-width="4" />
    </g>

    <g transform="translate(-40 82)">
      <rect x="70" y="0" width="240" height="96" rx="12" fill="url(#train-case)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M120 0 V96 M260 0 V96" stroke="#5a2a10" stroke-width="10" />
      <path d="M120 0 V96 M260 0 V96" stroke="#e0a060" stroke-width="3" opacity="0.6" />
      <path d="M160 0 V-18 H220 V0" stroke="#1b1033" stroke-width="8" fill="none" stroke-linejoin="round" />
      <path d="M86 14 Q120 8 150 10" stroke="#f0b07a" stroke-width="5" fill="none" stroke-linecap="round" />
      <rect x="70" y="0" width="16" height="16" fill="#ffd36b" stroke="#1b1033" stroke-width="3" />
      <rect x="294" y="0" width="16" height="16" fill="#ffd36b" stroke="#1b1033" stroke-width="3" />
    </g>
    <g transform="translate(1600 70)">
      <rect x="20" y="20" width="250" height="88" rx="12" fill="url(#train-case-b)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M20 64 H270" stroke="#1b1033" stroke-width="4" opacity="0.5" />
      <path d="M120 20 V2 H170 V20" stroke="#1b1033" stroke-width="8" fill="none" stroke-linejoin="round" />
      <path d="M36 34 Q80 28 120 30" stroke="#b8d8ff" stroke-width="5" fill="none" stroke-linecap="round" />
      <rect x="-80" y="48" width="96" height="60" rx="30" fill="#e8553f" stroke="#1b1033" stroke-width="5" />
      <path d="M-80 78 H16" stroke="#ffd36b" stroke-width="8" />
      <path d="M-64 60 Q-48 54 -30 56" stroke="#ffb0a0" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
    <g v-for="(r, i) in [{ x0: 10, x1: 840 }, { x0: 1080, x1: 1910 }]" :key="`rack${i}`">
      <path :d="`M${r.x0} 186 L${r.x1} 186`" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
      <path :d="`M${r.x0} 186 L${r.x1} 186`" stroke="url(#train-brass)" stroke-width="7" stroke-linecap="round" />
      <path :d="`M${r.x0 + 30} 190 L${r.x0 + 70} 224 M${r.x1 - 30} 190 L${r.x1 - 70} 224`" stroke="#1b1033" stroke-width="9" stroke-linecap="round" />
      <path :d="`M${r.x0 + 30} 190 L${r.x0 + 70} 224 M${r.x1 - 30} 190 L${r.x1 - 70} 224`" stroke="#e8c070" stroke-width="4" stroke-linecap="round" />
      <path :d="`M${r.x0 + 4} 182 H${r.x1 - 4}`" stroke="#fff6d0" stroke-width="2.5" opacity="0.8" />
    </g>

    <g v-for="w in WINDOWS" :key="`wf${w}`">
      <rect :x="w" y="250" :width="WIN_W" height="410" rx="34" fill="none" stroke="#1b1033" stroke-width="34" />
      <rect :x="w" y="250" :width="WIN_W" height="410" rx="34" fill="none" stroke="url(#train-frame)" stroke-width="24" />
      <rect :x="w - 6" y="244" :width="WIN_W + 12" height="422" rx="38" fill="none" stroke="#e8a46a" stroke-width="3" opacity="0.7" />
      <path :d="`M${w + 12} 334 H${w + WIN_W - 12}`" stroke="#1b1033" stroke-width="16" />
      <path :d="`M${w + 12} 334 H${w + WIN_W - 12}`" stroke="#a85e30" stroke-width="9" />
      <path :d="`M${w + 26} 268 h40 M${w + WIN_W - 70} 268 h40`" stroke="#f0b880" stroke-width="3" stroke-linecap="round" />
    </g>

    <g v-for="(w, wi) in WINDOWS" :key="`cu${w}`">
      <g class="train-curtain" :style="{ animationDelay: `-${wi * 1.7}s` }">
        <g v-for="side in [0, 1]" :key="side" :transform="side ? `translate(${w + WIN_W + 20} 0) scale(-1 1)` : `translate(${w - 20} 0)`">
          <path d="M-6 250 L120 250 Q96 400 70 500 Q100 580 118 672 L-6 672 Z" fill="url(#train-curtain)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
          <path d="M30 262 Q28 400 44 500 Q50 590 40 664 M70 262 Q60 400 58 496 M60 512 Q80 590 86 664" stroke="#5a0a20" stroke-width="3.5" fill="none" opacity="0.55" />
          <path d="M14 270 Q12 380 20 480" stroke="#ff9aaa" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
          <path d="M14 496 Q44 512 78 500" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
          <path d="M14 496 Q44 512 78 500" stroke="#ffcf5a" stroke-width="6" fill="none" stroke-linecap="round" />
          <circle cx="80" cy="512" r="9" fill="#ffcf5a" stroke="#1b1033" stroke-width="3.5" />
        </g>
      </g>
      <g :transform="`translate(${w - 30} 236) scale(${(WIN_W + 60) / 720} 1)`">
        <path :d="`M0 0 H720 V18 Q690 34 660 18 ${Array.from({ length: 11 }, (_, i) => `Q${630 - i * 60} 34 ${600 - i * 60} 18`).join(' ')} Z`" fill="url(#train-curtain)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M0 10 H720" stroke="#ffcf5a" stroke-width="5" />
        <path d="M14 4 H700" stroke="#ff9aaa" stroke-width="3" opacity="0.7" />
      </g>
    </g>

    <g transform="translate(960 420)">
      <circle cy="-40" r="170" fill="url(#train-glow)" class="glow" />
      <ellipse rx="22" ry="34" fill="url(#train-brass)" stroke="#1b1033" stroke-width="4" />
      <path d="M0 10 Q-56 20 -56 -40 M0 10 Q56 20 56 -40" stroke="#1b1033" stroke-width="11" fill="none" stroke-linecap="round" />
      <path d="M0 10 Q-56 20 -56 -40 M0 10 Q56 20 56 -40" stroke="#e8c070" stroke-width="5" fill="none" stroke-linecap="round" />
      <g v-for="x in [-56, 56]" :key="`sc${x}`" :transform="`translate(${x} -40)`">
        <path d="M-12 0 H12 L10 -8 H-10 Z" fill="url(#train-brass)" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M-10 -8 Q-30 -30 -22 -60 Q-12 -48 0 -64 Q12 -48 22 -60 Q30 -30 10 -8 Z" fill="#fff4cc" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-14 -24 Q-18 -40 -14 -50" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
      <path d="M-8 -20 Q-4 -28 4 -28" stroke="#fff6c8" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
    <g transform="translate(960 560)">
      <circle cx="0" cy="0" r="9" fill="url(#train-brass)" stroke="#1b1033" stroke-width="3.5" />
      <g class="train-scarf">
        <path d="M-4 -6 Q-30 0 -26 40 L-30 130 L-2 132 L2 40 L6 100 L30 98 L24 30 Q22 -2 -4 -6 Z" fill="#e8553f" stroke="#1b1033" stroke-width="4.5" stroke-linejoin="round" />
        <path d="M-29 70 L-1 72 M-30 100 L-2 102 M4 60 L26 60 M5 80 L28 80" stroke="#fff6e0" stroke-width="7" />
        <path d="M-20 10 Q-22 40 -18 120" stroke="#ff9a8a" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M-28 132 l-2 12 M-20 132 l0 12 M-12 132 l0 12 M-4 132 l1 12 M8 100 l0 12 M16 100 l1 12 M24 99 l2 12" stroke="#1b1033" stroke-width="3" stroke-linecap="round" />
      </g>
    </g>

    <rect x="-60" y="700" width="2040" height="210" fill="url(#train-wood-dark)" />
    <path d="M-60 700 H1980" stroke="#1b1033" stroke-width="5" />
    <path d="M-60 708 H1980" stroke="#c87a44" stroke-width="3" opacity="0.6" />
    <g fill="none" stroke-linejoin="round">
      <rect v-for="x in [-20, 820, 1830]" :key="`pn${x}`" :x="x" y="740" width="250" height="130" rx="10" stroke="#3e1a0a" stroke-width="4" opacity="0.6" />
    </g>
    <g v-for="w in WINDOWS" :key="`rad${w}`">
      <rect :x="w + 170" y="790" :width="WIN_W - 340" height="80" rx="8" fill="#4a2414" stroke="#1b1033" stroke-width="4" />
      <path :d="Array.from({ length: 14 }, (_, i) => `M${w + 190 + i * 22} 800 V860`).join(' ')" stroke="#c89060" stroke-width="5" stroke-linecap="round" opacity="0.7" />
    </g>

    <rect x="-60" y="900" width="2040" height="240" fill="url(#train-floor)" />
    <path d="M-60 900 H1980" stroke="#1b1033" stroke-width="6" />
    <path d="M-60 960 H1980 M-60 1030 H1980 M-60 1100 H1980" stroke="#2a120a" stroke-width="3" opacity="0.4" />
    <path d="M-60 938 L1980 938 L1980 1034 L-60 1034 Z" fill="#b02838" stroke="#1b1033" stroke-width="4" />
    <path d="M-60 950 H1980 M-60 1022 H1980" stroke="#ffcf5a" stroke-width="4" opacity="0.8" />
    <path :d="Array.from({ length: 22 }, (_, i) => `M${i * 96} 986 l24 -20 l24 20 l-24 20 Z`).join(' ')" fill="#e8607a" stroke="#6a0e20" stroke-width="2.5" opacity="0.8" />

    <g v-for="(w, ti) in WINDOWS" :key="`tb${w}`">
      <path :d="`M${w + 60} 720 Q${w + 340} 760 ${w + WIN_W - 60} 720 V780 H${w + 60} Z`" fill="#1b0a06" opacity="0.28" />
      <path :d="`M${w + 330} 730 V890 M${w + 290} 896 H${w + 390}`" stroke="#1b1033" stroke-width="16" stroke-linecap="round" />
      <path :d="`M${w + 330} 730 V890 M${w + 290} 896 H${w + 390}`" stroke="url(#train-brass)" stroke-width="8" stroke-linecap="round" />
      <path :d="`M${w + 70} 676 L${w + WIN_W - 70} 676 L${w + WIN_W - 30} 700 L${w + 30} 700 Z`" fill="#fffaf0" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <g :transform="`translate(${w + 30} 700)`">
        <path :d="`M0 0 H600 V10 ${Array.from({ length: 20 }, (_, i) => `Q${585 - i * 30} 26 ${570 - i * 30} 10`).join(' ')} Z`" fill="#fffaf0" stroke="#1b1033" stroke-width="4.5" stroke-linejoin="round" filter="url(#cel-s)" />
        <path d="M6 7 H594" stroke="#e8553f" stroke-width="4" stroke-dasharray="10 6" />
      </g>
      <path :d="`M${w + 90} 684 H${w + 300}`" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.9" />

      <g :transform="`translate(${ti ? w + 560 : w + 120} 690)`">
        <circle cx="0" cy="-130" r="120" fill="url(#train-glow)" class="glow" />
        <ellipse cx="0" cy="4" rx="40" ry="7" fill="#1b0a06" opacity="0.3" />
        <path d="M-26 0 Q0 -16 26 0 Z" fill="url(#train-brass)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M0 -6 V-80" stroke="#1b1033" stroke-width="10" />
        <path d="M0 -6 V-80" stroke="#e8c070" stroke-width="5" />
        <path d="M-26 -84 L-48 -140 L48 -140 L26 -84 Z" fill="url(#train-shade)" stroke="#1b1033" stroke-width="4.5" stroke-linejoin="round" />
        <path d="M-50 -84 H50" stroke="#1b1033" stroke-width="4" />
        <path d="M-44 -84 v10 M-30 -84 v12 M-16 -84 v10 M0 -84 v12 M16 -84 v10 M30 -84 v12 M44 -84 v10" stroke="#c84a1a" stroke-width="4" stroke-linecap="round" />
        <path d="M-36 -130 L-24 -94" stroke="#fff6c8" stroke-width="5" stroke-linecap="round" />
      </g>
    </g>

    <g transform="translate(560 690)">
      <ellipse cx="4" cy="6" rx="50" ry="8" fill="#1b0a06" opacity="0.3" />
      <path d="M-56 6 Q-58 -2 -40 -4 H-12 Q4 -2 2 6 Z" fill="#fff" stroke="#1b1033" stroke-width="3.5" />
      <rect x="-50" y="-14" width="16" height="14" rx="2" fill="#fff" stroke="#1b1033" stroke-width="3" />
      <rect x="-30" y="-14" width="16" height="14" rx="2" fill="#fff" stroke="#1b1033" stroke-width="3" />
      <path d="M-50 -7 h16 M-30 -7 h16" stroke="#4a7ad8" stroke-width="3" />
      <g class="train-rattle">
        <path d="M36 -106 L52 -186" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
        <path d="M36 -106 L52 -186" stroke="url(#train-silver)" stroke-width="4" stroke-linecap="round" />
        <path d="M30 -100 L34 -14 H74 L78 -100" fill="url(#train-tea)" />
        <path d="M30 -100 L78 -100 L78 -84 L30 -84 Z" fill="#fff" opacity="0.35" />
        <ellipse cx="54" cy="-86" rx="22" ry="5" fill="#c8601e" />
        <ellipse cx="44" cy="-88" rx="10" ry="4" fill="#ffe14d" stroke="#c8a020" stroke-width="2" />
        <path d="M30 -102 L34 -14 M78 -102 L74 -14" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
        <ellipse cx="54" cy="-102" rx="24" ry="6" fill="none" stroke="#1b1033" stroke-width="4" />
        <path d="M38 -96 V-40" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7" />
        <path d="M26 -62 H82 L76 -6 Q86 2 86 6 H22 Q22 2 32 -6 Z" fill="url(#train-silver)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M34 -50 l8 10 l8 -10 l8 10 l8 -10 l8 10 M36 -24 H72" stroke="#5a6080" stroke-width="2.5" fill="none" />
        <path d="M82 -54 Q108 -52 106 -32 Q104 -12 78 -16" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round" />
        <path d="M82 -54 Q108 -52 106 -32 Q104 -12 78 -16" stroke="url(#train-silver)" stroke-width="4.5" fill="none" stroke-linecap="round" />
        <path d="M30 -58 Q34 -60 40 -60" stroke="#fff" stroke-width="3" stroke-linecap="round" />
      </g>
      <path v-for="j in 2" :key="`st${j}`" :d="`M${40 + j * 10} -112 q-10 -18 0 -36 q10 -18 0 -36`" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" class="train-steam" :style="{ animationDelay: `-${j * 1.4}s` }" />
    </g>
    <g transform="translate(400 690)">
      <ellipse cx="0" cy="2" rx="60" ry="10" fill="#fff" stroke="#1b1033" stroke-width="3.5" />
      <circle cx="-22" cy="-6" r="14" fill="#e8a050" stroke="#1b1033" stroke-width="3" />
      <circle cx="6" cy="-8" r="14" fill="#e8a050" stroke="#1b1033" stroke-width="3" />
      <circle cx="28" cy="-4" r="12" fill="#d88a40" stroke="#1b1033" stroke-width="3" />
      <path d="M-26 -12 h3 M-18 -4 h3 M2 -12 h3 M10 -6 h3" stroke="#7a3a1a" stroke-width="3" stroke-linecap="round" />
    </g>
    <g transform="translate(1300 690)">
      <path d="M-70 0 L-50 -16 H60 L80 0 Z" fill="#f4f0e4" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-44 -10 H0 M-50 -5 H0 M14 -10 H56 M10 -5 H62" stroke="#8a8aa0" stroke-width="2.5" />
      <path d="M-50 -16 L-40 -26 H70 L60 -16" fill="#e8e2d0" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
    </g>
    <g transform="translate(1480 690)">
      <ellipse cx="0" cy="2" rx="66" ry="11" fill="#fff" stroke="#1b1033" stroke-width="3.5" />
      <circle v-for="(o, i) in [{ x: -26, y: -14 }, { x: 24, y: -14 }, { x: 0, y: -32 }]" :key="`or${i}`" :cx="o.x" :cy="o.y" r="20" fill="#ff9a2a" stroke="#1b1033" stroke-width="4" />
      <path d="M-34 -24 Q-30 -30 -24 -30 M16 -24 Q20 -30 26 -30 M-8 -42 Q-4 -48 2 -48" stroke="#ffe0a0" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M0 -52 q6 -10 14 -8" stroke="#2f8a3c" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="160" cy="1110" rx="260" ry="24" fill="#1b0a06" opacity="0.35" stroke="none" />
      <path d="M-80 1140 V560 Q-80 500 -20 500 Q60 500 60 560 V810 H300 Q340 810 340 850 V900 Q340 920 300 920 H200 V1140 Z" fill="url(#train-seat)" stroke-width="6" filter="url(#cel)" />
      <path d="M-40 520 Q0 512 34 530" stroke="#8ad4a8" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M80 826 H300" stroke="#8ad4a8" stroke-width="5" stroke-linecap="round" opacity="0.8" />
      <path d="M60 920 H200 M60 810 V1140" stroke="#163a2a" stroke-width="4" opacity="0.7" />
      <g fill="#ffd36b" stroke-width="2.5">
        <circle v-for="(b, i) in BUTTONS" :key="`bt${i}`" :cx="b.x" :cy="b.y" r="7" />
        <circle v-for="x in [130, 220]" :key="`bs${x}`" :cx="x" cy="864" r="7" />
      </g>
      <path d="M0 600 L-40 640 M0 600 L40 640 M0 680 L-40 720 M0 680 L40 720" stroke="#163a2a" stroke-width="3" opacity="0.6" />
      <path d="M90 810 Q80 740 140 732 Q230 724 250 790 Q256 812 240 812 Z" fill="#fffaf0" stroke-width="5" />
      <path d="M120 760 Q150 748 190 752" stroke="#d8d0e8" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M110 780 L130 800 M200 770 L226 796" stroke="#e8553f" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round" transform="translate(1920 0) scale(-1 1)">
      <ellipse cx="160" cy="1110" rx="260" ry="24" fill="#1b0a06" opacity="0.35" stroke="none" />
      <path d="M-80 1140 V560 Q-80 500 -20 500 Q60 500 60 560 V810 H300 Q340 810 340 850 V900 Q340 920 300 920 H200 V1140 Z" fill="url(#train-seat)" stroke-width="6" />
      <path d="M-40 520 Q0 512 34 530" stroke="#8ad4a8" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M80 826 H300" stroke="#8ad4a8" stroke-width="5" stroke-linecap="round" opacity="0.8" />
      <path d="M60 920 H200 M60 810 V1140" stroke="#163a2a" stroke-width="4" opacity="0.7" />
      <g fill="#ffd36b" stroke-width="2.5">
        <circle v-for="(b, i) in BUTTONS" :key="`bt${i}`" :cx="b.x" :cy="b.y" r="7" />
        <circle v-for="x in [130, 220]" :key="`bs${x}`" :cx="x" cy="864" r="7" />
      </g>
      <path d="M0 600 L-40 640 M0 600 L40 640 M0 680 L-40 720 M0 680 L40 720" stroke="#163a2a" stroke-width="3" opacity="0.6" />
      <ellipse cx="190" cy="806" rx="90" ry="20" fill="#f2d27a" stroke-width="5" />
      <path d="M140 806 Q140 750 190 750 Q240 750 240 806 Z" fill="#f2d27a" stroke-width="5" />
      <path d="M142 790 Q190 800 238 790" stroke="#e8553f" stroke-width="12" fill="none" />
      <path d="M156 770 Q170 758 190 756" stroke="#fff6c8" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.train-pan {
  animation: train-pan linear infinite;
}

.train-clouds {
  animation-duration: 160s;
}

.train-far {
  animation-duration: 90s;
}

.train-mid {
  animation-duration: 36s;
}

.train-near {
  animation-duration: 8s;
}

.train-curtain {
  transform-box: fill-box;
  transform-origin: top center;
  animation: train-curtain 2.6s ease-in-out infinite alternate;
}

.train-scarf {
  transform-origin: 0 0;
  animation: train-scarf 2.6s ease-in-out infinite alternate;
}

.train-rattle {
  animation: train-rattle 0.9s steps(2) infinite;
}

.train-steam {
  animation: train-steam 2.8s ease-out infinite;
}

@keyframes train-pan {
  to {
    translate: -1920px 0;
  }
}

@keyframes train-curtain {
  from {
    scale: 1 1;
  }
  to {
    scale: 0.985 1.01;
  }
}

@keyframes train-scarf {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes train-rattle {
  to {
    translate: 0 -1.5px;
  }
}

@keyframes train-steam {
  from {
    translate: 0 0;
    opacity: 0.8;
  }
  to {
    translate: 6px -50px;
    opacity: 0;
  }
}
</style>
