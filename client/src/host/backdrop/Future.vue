<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(26059);
const f1 = (n: number) => n.toFixed(1);

// a row of cloud bumps from edge to edge: arcs drawn left to right bulge upward
const cloudBand = (y: number, step: number, jitter: number) => {
  let d = `M-60 1140 L-60 ${y}`;
  for (let x = -60; x < 1980; ) {
    const s = step * (0.7 + rnd() * 0.6);
    const ny = y + (rnd() - 0.5) * jitter;
    d += ` A${f1(s * 0.62)} ${f1(s * 0.62)} 0 0 1 ${f1(x + s)} ${f1(ny)}`;
    x += s;
  }
  return `${d} L1980 1140 Z`;
};
const BACK_CLOUDS = cloudBand(772, 90, 16);
const FRONT_CLOUDS = cloudBand(884, 140, 26);

const SKY_CLOUDS = [
  { x: 330, y: 330, k: 1 },
  { x: 980, y: 150, k: 0.7 },
  { x: 1230, y: 420, k: 0.55 },
  { x: 40, y: 560, k: 0.7 },
  { x: 1560, y: 400, k: 0.6 },
];

type FarKind = 'pill' | 'needle' | 'dome';
const FAR: { x: number; w: number; top: number; kind: FarKind }[] = [
  { x: 60, w: 90, top: 470, kind: 'pill' },
  { x: 170, w: 50, top: 420, kind: 'needle' },
  { x: 380, w: 110, top: 540, kind: 'dome' },
  { x: 470, w: 56, top: 500, kind: 'needle' },
  { x: 760, w: 120, top: 640, kind: 'dome' },
  { x: 880, w: 70, top: 600, kind: 'pill' },
  { x: 1000, w: 50, top: 560, kind: 'needle' },
  { x: 1110, w: 140, top: 660, kind: 'dome' },
  { x: 1240, w: 80, top: 590, kind: 'pill' },
  { x: 1330, w: 50, top: 480, kind: 'needle' },
  { x: 1610, w: 100, top: 560, kind: 'pill' },
  { x: 1720, w: 60, top: 440, kind: 'needle' },
  { x: 1890, w: 120, top: 520, kind: 'pill' },
];
const farPath = (t: (typeof FAR)[number]) => {
  const l = t.x - t.w / 2;
  const r = t.x + t.w / 2;
  if (t.kind === 'needle') return `M${t.x - 7} 820 V${t.top} H${t.x + 7} V820 Z`;
  return `M${l} 820 V${t.top + t.w / 2} A${t.w / 2} ${t.w / 2} 0 0 1 ${r} ${t.top + t.w / 2} V820 Z`;
};
const FAR_STRIPES = FAR.filter((t) => t.kind !== 'needle')
  .flatMap((t) => Array.from({ length: Math.floor((760 - t.top - t.w / 2) / 34) }, (_, i) => `M${t.x - t.w / 2 + 12} ${t.top + t.w / 2 + 20 + i * 34} h${t.w - 24}`))
  .join(' ');

// cars repeat every `span` px, so moving the lane by exactly one span loops without a seam
const laneCars = (span: number, offsets: { dx: number; c: string }[], from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => offsets.map((o) => ({ x: (from + i) * span + o.dx, c: o.c }))).flat();
const LANE_NEAR = laneCars(1500, [{ dx: 0, c: '#ff6a7a' }, { dx: 560, c: '#ffc23a' }], -1, 1);
const LANE_FAR = laneCars(1200, [{ dx: 0, c: '#3ad6c0' }, { dx: 520, c: '#b48aff' }], 0, 2);

const grid = (x0: number, y0: number, cols: number, rows: number, dx: number, dy: number, w: number, h: number) =>
  Array.from({ length: cols * rows }, (_, i) => ({ x: x0 + (i % cols) * dx, y: y0 + Math.floor(i / cols) * dy, w, h }));
const WINDOWS = [...grid(1394, 482, 4, 7, 32, 42, 18, 26), ...grid(556, 566, 3, 5, 32, 44, 16, 26), ...grid(1676, 656, 6, 5, 52, 46, 28, 28)];
const LIT = twinkleGroups(WINDOWS.filter(() => rnd() < 0.45));
const winPath = (ws: typeof WINDOWS) => ws.map((w) => `M${w.x + 5} ${w.y} h${w.w - 10} a5 5 0 0 1 5 5 v${w.h - 10} a5 5 0 0 1 -5 5 h${-(w.w - 10)} a5 5 0 0 1 -5 -5 v${-(w.h - 10)} a5 5 0 0 1 5 -5 Z`).join(' ');
const WIN_ALL = winPath(WINDOWS);
const WIN_LIT = LIT.map(winPath);

const RIM_WINDOWS = Array.from({ length: 9 }, (_, i) => {
  const a = Math.PI * (0.12 + (i * 0.76) / 8);
  return { x: 230 + Math.cos(a) * 168, y: 440 + Math.sin(a) * 20 };
});
const PYLONS = [120, 520, 920, 1320, 1720];
const DECK_LINES = Array.from({ length: 17 }, (_, i) => {
  const k = i - 8;
  return `M${960 + k * 150} 920 L${960 + k * 330} 1140`;
}).join(' ');
const BOLLARDS = [
  { x: 560, y: 990 },
  { x: 1290, y: 984 },
];
const TRAIN_WINDOWS = Array.from({ length: 15 }, (_, i) => 30 + i * 40);
</script>

<template>
  <g>
    <defs>
      <linearGradient id="future-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4fa2ee" />
        <stop offset="45%" stop-color="#9fd4f8" />
        <stop offset="78%" stop-color="#ffe2d6" />
        <stop offset="100%" stop-color="#ffc6bc" />
      </linearGradient>
      <radialGradient id="future-planet" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ffe0c0" />
        <stop offset="55%" stop-color="#ff9a86" />
        <stop offset="100%" stop-color="#d4567e" />
      </radialGradient>
      <linearGradient id="future-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e2dcfa" />
        <stop offset="100%" stop-color="#c4bcee" />
      </linearGradient>
      <linearGradient id="future-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4f6" stop-opacity="0" />
        <stop offset="60%" stop-color="#fff4f6" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#fff4f6" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="future-cloud-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#e2d6f6" />
      </linearGradient>
      <linearGradient id="future-cloud" gradientUnits="userSpaceOnUse" x1="0" y1="820" x2="0" y2="1000">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#c8b8f0" />
      </linearGradient>
      <linearGradient id="future-mint" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#b4f8e8" />
        <stop offset="100%" stop-color="#26a8a2" />
      </linearGradient>
      <linearGradient id="future-coral" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0%" stop-color="#ffb8c8" />
        <stop offset="100%" stop-color="#e2507e" />
      </linearGradient>
      <linearGradient id="future-lilac" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0%" stop-color="#d8ccff" />
        <stop offset="100%" stop-color="#7a5ee0" />
      </linearGradient>
      <linearGradient id="future-butter" x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0%" stop-color="#fff2c0" />
        <stop offset="100%" stop-color="#f2a84a" />
      </linearGradient>
      <linearGradient id="future-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#b0aad8" />
      </linearGradient>
      <linearGradient id="future-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#eaffff" />
        <stop offset="100%" stop-color="#62cfee" />
      </linearGradient>
      <linearGradient id="future-deck" gradientUnits="userSpaceOnUse" x1="0" y1="920" x2="0" y2="1140">
        <stop offset="0%" stop-color="#f4f0ff" />
        <stop offset="100%" stop-color="#9a8ee0" />
      </linearGradient>
      <radialGradient id="future-leaf" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#a8f0b0" />
        <stop offset="100%" stop-color="#239a6a" />
      </radialGradient>
      <clipPath id="future-deck-clip">
        <path d="M-60 960 Q960 900 1980 960 L1980 1140 L-60 1140 Z" />
      </clipPath>
      <g id="future-car">
        <ellipse cx="0" cy="26" rx="40" ry="7" fill="#7ff4ff" opacity="0.55" />
        <path d="M-58 -14 L-78 -40 L-46 -18 Z" fill="currentColor" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M-36 -16 Q-30 -68 8 -68 Q48 -66 52 -16 Z" fill="#d8fbff" fill-opacity="0.6" stroke="#1b1033" stroke-width="4" />
        <circle cx="8" cy="-34" r="13" fill="#ffd2a8" stroke="#1b1033" stroke-width="3" />
        <path d="M-4 -44 Q8 -54 20 -44" stroke="#5a3a8a" stroke-width="7" fill="none" stroke-linecap="round" />
        <circle cx="15" cy="-35" r="2.5" fill="#1b1033" />
        <path d="M-24 -40 Q-20 -56 -6 -60" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M-72 0 Q-68 -16 -40 -18 H44 Q76 -16 80 2 Q72 22 0 24 Q-66 22 -72 0 Z" fill="currentColor" stroke="#1b1033" stroke-width="4.5" stroke-linejoin="round" />
        <path d="M-60 -6 Q0 -12 66 -6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
        <path d="M-60 8 Q0 18 70 6" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.35" />
        <circle cx="76" cy="0" r="5" fill="#fff6b0" stroke="#1b1033" stroke-width="2.5" />
      </g>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#future-sky)" />

    <circle cx="120" cy="110" r="70" fill="#ffffff" opacity="0.25" />
    <circle cx="120" cy="110" r="40" fill="#f4f0ff" stroke="#b0a8e0" stroke-width="3" />
    <circle cx="108" cy="100" r="9" fill="#d8d0f4" />
    <circle cx="134" cy="124" r="6" fill="#d8d0f4" />

    <g transform="translate(1760 170) rotate(-16)">
      <circle cx="0" cy="0" r="190" fill="#fff" opacity="0.18" />
      <ellipse cx="0" cy="0" rx="230" ry="50" fill="none" stroke="#1b1033" stroke-width="24" />
      <ellipse cx="0" cy="0" rx="230" ry="50" fill="none" stroke="#8ff0d8" stroke-width="15" />
      <ellipse cx="0" cy="0" rx="230" ry="50" fill="none" stroke="#3ab8b0" stroke-width="3" opacity="0.6" />
      <circle cx="0" cy="0" r="120" fill="url(#future-planet)" stroke="#1b1033" stroke-width="5" />
      <path d="M-110 -40 Q0 -60 112 -30 M-120 10 Q0 -6 118 22 M-96 60 Q0 50 92 74" stroke="#ffd2b8" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.6" />
      <path d="M-76 -70 Q-50 -98 -10 -104" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.8" />
      <path d="M-230 0 A230 50 0 0 0 230 0" fill="none" stroke="#1b1033" stroke-width="24" />
      <path d="M-230 0 A230 50 0 0 0 230 0" fill="none" stroke="#8ff0d8" stroke-width="15" />
      <path d="M-180 26 A230 50 0 0 0 40 50" fill="none" stroke="#e6fff8" stroke-width="4" stroke-linecap="round" />
    </g>

    <g class="future-drift">
      <g v-for="(c, i) in SKY_CLOUDS" :key="`sc${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.k})`">
        <path d="M-110 0 Q-124 -44 -76 -50 Q-64 -96 -16 -92 Q20 -128 64 -92 Q116 -94 112 -46 Q140 -24 118 0 Z" fill="#fffafd" stroke="#b8acdc" stroke-width="3" stroke-linejoin="round" />
        <path d="M-96 -6 Q0 -22 108 -6" stroke="#ddd0f2" stroke-width="10" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g fill="url(#future-far)" stroke="#a69ad8" stroke-width="3" stroke-linejoin="round">
      <path v-for="(t, i) in FAR" :key="`fa${i}`" :d="farPath(t)" />
    </g>
    <g v-for="(t, i) in FAR.filter((f) => f.kind === 'needle')" :key="`fn${i}`">
      <ellipse :cx="t.x" :cy="t.top" :rx="t.w" :ry="t.w * 0.24" fill="#d6cff6" stroke="#a69ad8" stroke-width="3" />
      <path :d="`M${t.x - t.w * 0.5} ${t.top - 4} A${t.w * 0.5} ${t.w * 0.5} 0 0 1 ${t.x + t.w * 0.5} ${t.top - 4} Z`" fill="#eef6ff" stroke="#a69ad8" stroke-width="3" />
      <path :d="`M${t.x} ${t.top - t.w * 0.5} v-30`" stroke="#a69ad8" stroke-width="3" />
    </g>
    <path :d="FAR_STRIPES" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.5" />
    <rect x="-60" y="560" width="2040" height="260" fill="url(#future-haze)" />
    <path :d="BACK_CLOUDS" fill="url(#future-cloud-far)" stroke="#c4b6e6" stroke-width="3" stroke-linejoin="round" />

    <g class="future-lane-far">
      <use v-for="(c, i) in LANE_FAR" :key="`lf${i}`" href="#future-car" :transform="`translate(${c.x} 470) scale(-0.55 0.55)`" :style="{ color: c.c }" />
    </g>

    <g>
      <path d="M200 1000 L214 450 H246 L260 1000 Z" fill="url(#future-metal)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M150 470 L218 620 M310 470 L242 620" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
      <path d="M150 470 L218 620 M310 470 L242 620" stroke="#d8d2f4" stroke-width="6" stroke-linecap="round" />
      <path d="M232 470 V980" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <path d="M60 444 Q230 540 400 444 Z" fill="url(#future-lilac)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M100 436 Q110 330 230 322 Q350 330 360 436 Z" fill="url(#future-glass)" fill-opacity="0.85" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M150 436 V380 M230 436 V324 M310 436 V380" stroke="#4ab0d0" stroke-width="3" opacity="0.6" />
      <path d="M130 400 Q140 350 200 336" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.85" />
      <ellipse cx="230" cy="440" rx="200" ry="34" fill="url(#future-mint)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M50 446 Q230 486 410 446" stroke="#ff5ad8" stroke-width="12" fill="none" opacity="0.3" />
      <path d="M50 446 Q230 486 410 446" stroke="#ff7ae4" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M80 424 Q200 410 300 414" stroke="#e6fff8" stroke-width="5" fill="none" stroke-linecap="round" />
      <circle v-for="(w, i) in RIM_WINDOWS" :key="`rw${i}`" :cx="w.x" :cy="w.y" r="7" fill="#fff4a8" stroke="#1b1033" stroke-width="2.5" />
      <path d="M230 322 V256" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
      <path d="M230 322 V256" stroke="#e6e2ff" stroke-width="3" stroke-linecap="round" />
    </g>

    <g>
      <path d="M246 690 Q400 640 540 690 Z" fill="#c8f6ff" fill-opacity="0.5" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M300 676 V662 M360 668 V654 M420 668 V654 M480 676 V662" stroke="#1b1033" stroke-width="3" opacity="0.5" />
      <path d="M246 690 Q400 712 540 690 L540 706 Q400 730 246 706 Z" fill="url(#future-metal)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M246 700 Q400 722 540 700" stroke="#ff7ae4" stroke-width="3" fill="none" />
    </g>

    <g>
      <rect x="580" y="760" width="40" height="240" fill="url(#future-metal)" stroke="#1b1033" stroke-width="5" />
      <path d="M470 600 A130 26 0 0 1 730 600" fill="none" stroke="#1b1033" stroke-width="16" />
      <path d="M470 600 A130 26 0 0 1 730 600" fill="none" stroke="#ffc23a" stroke-width="9" />
      <rect x="540" y="500" width="120" height="300" rx="60" fill="url(#future-lilac)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
      <path d="M560 560 Q566 520 596 508" stroke="#f0eaff" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M600 500 V452" stroke="#1b1033" stroke-width="7" stroke-linecap="round" />
    </g>

    <g>
      <rect x="1420" y="760" width="60" height="240" fill="url(#future-metal)" stroke="#1b1033" stroke-width="5" />
      <path d="M1320 520 A130 24 0 0 1 1580 520 M1330 660 A120 22 0 0 1 1570 660" fill="none" stroke="#1b1033" stroke-width="16" />
      <path d="M1320 520 A130 24 0 0 1 1580 520 M1330 660 A120 22 0 0 1 1570 660" fill="none" stroke="#3ad6c0" stroke-width="9" />
      <rect x="1375" y="400" width="150" height="380" rx="75" fill="url(#future-coral)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
      <path d="M1396 470 Q1400 430 1434 412" stroke="#ffe0ea" stroke-width="7" fill="none" stroke-linecap="round" />
      <ellipse cx="1450" cy="404" rx="82" ry="14" fill="url(#future-metal)" stroke="#1b1033" stroke-width="5" />
      <circle cx="1450" cy="344" r="62" fill="url(#future-glass)" fill-opacity="0.85" stroke="#1b1033" stroke-width="5" />
      <path d="M1418 316 Q1430 296 1454 290" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M1410 380 Q1450 360 1490 380" stroke="#4ab0d0" stroke-width="4" fill="none" opacity="0.6" />
      <path d="M1450 282 V206" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
      <path d="M1450 282 V206" stroke="#e6e2ff" stroke-width="3" stroke-linecap="round" />
    </g>

    <g>
      <rect x="1640" y="620" width="400" height="420" rx="44" fill="url(#future-butter)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
      <rect x="1810" y="540" width="230" height="100" rx="30" fill="url(#future-mint)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M1840 540 A60 60 0 0 1 1960 540 Z" fill="url(#future-glass)" fill-opacity="0.85" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M1860 524 Q1872 498 1900 492" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M1900 480 V444" stroke="#1b1033" stroke-width="7" stroke-linecap="round" />
      <path d="M1650 632 H2000" stroke="#ff5ad8" stroke-width="12" opacity="0.3" />
      <path d="M1660 634 H2000" stroke="#ff7ae4" stroke-width="4" stroke-linecap="round" />
      <path d="M1664 660 Q1668 640 1690 636" stroke="#fffaf0" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M1690 620 l-24 -16 h48 Z" fill="url(#future-metal)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>

    <path :d="WIN_ALL" fill="#3e3a9a" stroke="#1b1033" stroke-width="2.5" />
    <path v-for="(d, i) in WIN_LIT" :key="`wl${i}`" :d="d" fill="#fff1a0" class="future-win" :style="{ animationDelay: `-${i * 1.7}s` }" />
    <g>
      <path d="M470 600 A130 26 0 0 0 730 600" fill="none" stroke="#1b1033" stroke-width="16" />
      <path d="M470 600 A130 26 0 0 0 730 600" fill="none" stroke="#ffc23a" stroke-width="9" />
      <path d="M490 606 A120 22 0 0 0 600 624" fill="none" stroke="#fff4c0" stroke-width="3" stroke-linecap="round" />
      <path d="M1320 520 A130 24 0 0 0 1580 520 M1330 660 A120 22 0 0 0 1570 660" fill="none" stroke="#1b1033" stroke-width="16" />
      <path d="M1320 520 A130 24 0 0 0 1580 520 M1330 660 A120 22 0 0 0 1570 660" fill="none" stroke="#3ad6c0" stroke-width="9" />
      <path d="M1340 526 A120 20 0 0 0 1450 544 M1350 666 A110 18 0 0 0 1450 682" fill="none" stroke="#c8fff4" stroke-width="3" stroke-linecap="round" />
    </g>

    <g class="future-beacon">
      <circle cx="230" cy="250" r="18" fill="#ff4f8a" opacity="0.35" />
      <circle cx="1450" cy="200" r="18" fill="#ff4f8a" opacity="0.35" />
      <circle cx="600" cy="446" r="14" fill="#ff4f8a" opacity="0.35" />
      <circle cx="1900" cy="438" r="14" fill="#ff4f8a" opacity="0.35" />
    </g>
    <g fill="#ff4f8a" stroke="#1b1033" stroke-width="3">
      <circle cx="230" cy="250" r="9" />
      <circle cx="1450" cy="200" r="9" />
      <circle cx="600" cy="446" r="7" />
      <circle cx="1900" cy="438" r="7" />
    </g>

    <path d="M1690 604 L1596 510 H1784 Z" fill="#7ff4ff" opacity="0.18" />
    <g class="future-holo">
      <rect x="1590" y="380" width="200" height="130" rx="18" fill="#7ff4ff" fill-opacity="0.25" stroke="#3ad6e8" stroke-width="4" />
      <path d="M1606 410 H1774 M1606 440 H1774 M1606 470 H1774" stroke="#bff8ff" stroke-width="3" opacity="0.4" />
      <circle cx="1640" cy="444" r="26" fill="#ff7ae4" fill-opacity="0.5" stroke="#ff5ad8" stroke-width="4" />
      <path d="M1690 470 L1712 422 L1734 470 Z" fill="#ffe680" fill-opacity="0.6" stroke="#ffc23a" stroke-width="4" stroke-linejoin="round" />
      <path d="M1748 460 q8 -18 16 0 q8 18 16 0" stroke="#3ad6c0" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M1604 392 Q1640 386 1676 388" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>

    <path d="M660 640 L1375 618 L1375 668 L660 690 Z" fill="#c8f6ff" fill-opacity="0.35" />
    <g class="future-pod">
      <g transform="translate(680 664)">
        <path d="M-40 0 Q-40 -16 -20 -16 H20 Q42 -16 46 0 Q42 16 20 16 H-20 Q-40 16 -40 0 Z" fill="url(#future-butter)" stroke="#1b1033" stroke-width="3.5" />
        <path d="M4 -10 H24 Q36 -8 38 0 H4 Z" fill="#8fe8ff" stroke="#1b1033" stroke-width="2.5" stroke-linejoin="round" />
        <path d="M-30 -8 H0" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.8" />
      </g>
    </g>
    <path d="M660 640 L1375 618 M660 690 L1375 668" stroke="#1b1033" stroke-width="4" />
    <path d="M670 650 L1365 628" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.75" />
    <g fill="url(#future-metal)" stroke="#1b1033" stroke-width="3.5">
      <rect x="800" y="630" width="16" height="56" rx="5" />
      <rect x="1010" y="624" width="16" height="56" rx="5" />
      <rect x="1220" y="618" width="16" height="56" rx="5" />
    </g>

    <g class="future-lane-near">
      <use v-for="(c, i) in LANE_NEAR" :key="`ln${i}`" href="#future-car" :transform="`translate(${c.x} 330)`" :style="{ color: c.c }" />
    </g>

    <g fill="url(#future-metal)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
      <path v-for="x in PYLONS" :key="`py${x}`" :d="`M${x - 22} 822 L${x - 10} 930 H${x + 10} L${x + 22} 822 Z`" />
      <rect x="-60" y="800" width="2040" height="24" />
    </g>
    <path d="M-60 808 H1980" stroke="#fff" stroke-width="4" opacity="0.8" />
    <path d="M-60 818 H1980" stroke="#3ad6c0" stroke-width="3" />
    <g class="future-train">
      <path d="M0 800 V766 Q0 750 18 750 H600 Q700 750 760 794 Q764 800 756 800 Z" fill="url(#future-metal)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M4 786 H744" stroke="#3ad6c0" stroke-width="8" />
      <path d="M14 790 H740" stroke="#1b1033" stroke-width="2" opacity="0.3" />
      <rect v-for="x in TRAIN_WINDOWS" :key="`tw${x}`" :x="x" y="758" width="26" height="18" rx="8" fill="#3e3a9a" stroke="#1b1033" stroke-width="2.5" />
      <path d="M250 752 V798 M500 752 V798" stroke="#1b1033" stroke-width="3" opacity="0.6" />
      <path d="M640 756 Q690 758 726 780 L680 780 Q664 764 640 764 Z" fill="#8fe8ff" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M20 756 H590" stroke="#fff" stroke-width="3" stroke-linecap="round" />
    </g>

    <path :d="FRONT_CLOUDS" fill="url(#future-cloud)" stroke="#6a5aa8" stroke-width="4" stroke-linejoin="round" filter="url(#cel)" />

    <path d="M-60 960 Q960 900 1980 960 L1980 1140 L-60 1140 Z" fill="url(#future-deck)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <g clip-path="url(#future-deck-clip)">
      <path :d="DECK_LINES" stroke="#8a7ec8" stroke-width="3" opacity="0.5" />
      <path d="M-60 1050 Q960 1000 1980 1050" stroke="#8a7ec8" stroke-width="3" fill="none" opacity="0.5" />
    </g>
    <path d="M-60 978 Q960 918 1980 978" stroke="#3ae8f0" stroke-width="18" fill="none" opacity="0.3" />
    <path d="M-60 978 Q960 918 1980 978" stroke="#3ae8f0" stroke-width="5" fill="none" />
    <path d="M200 958 Q600 930 900 926" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9" />
    <path d="M300 1010 L240 1140 M380 1010 L330 1140 M1500 1080 L1530 1140 M1600 1060 L1640 1140" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.25" />
    <g v-for="b in BOLLARDS" :key="`bo${b.x}`" :transform="`translate(${b.x} ${b.y})`">
      <ellipse cx="0" cy="4" rx="26" ry="6" fill="#1b1033" opacity="0.28" />
      <rect x="-14" y="-40" width="28" height="44" rx="10" fill="url(#future-metal)" stroke="#1b1033" stroke-width="4" />
      <rect x="-9" y="-32" width="18" height="12" rx="5" fill="#7ff4ff" stroke="#1b1033" stroke-width="2.5" />
      <path d="M-8 -4 V-16" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7" />
    </g>

    <g transform="translate(720 1040) scale(1.15)">
      <ellipse cx="0" cy="34" rx="90" ry="12" fill="#1b1033" opacity="0.25" />
      <use href="#future-car" style="color: #3ad6c0" />
    </g>

    <g transform="translate(380 1010)">
      <ellipse cx="0" cy="6" rx="80" ry="12" fill="#1b1033" opacity="0.28" />
      <path d="M-62 -54 H62 Q64 0 0 4 Q-64 0 -62 -54 Z" fill="url(#future-coral)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-62 -54 H62" stroke="#ff7ae4" stroke-width="4" />
      <path d="M-44 -38 Q-40 -16 -20 -10" stroke="#ffe0ea" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M0 -54 V-100" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
      <path d="M0 -54 V-100" stroke="#6a4a3a" stroke-width="6" stroke-linecap="round" />
      <circle cx="0" cy="-150" r="62" fill="url(#future-leaf)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-30 -180 l8 -6 M10 -190 l8 4 M24 -150 l8 -4 M-20 -130 l6 6 M-4 -160 l6 -6" stroke="#1f7a52" stroke-width="4" stroke-linecap="round" opacity="0.7" />
      <path d="M-40 -170 Q-30 -196 -6 -204" stroke="#d8ffe0" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M-84 -144 A84 18 0 0 0 84 -144" fill="none" stroke="#1b1033" stroke-width="10" />
      <path d="M-84 -144 A84 18 0 0 0 84 -144" fill="none" stroke="#ffc23a" stroke-width="5" />
    </g>

    <g>
      <path d="M130 1060 Q120 860 170 760 Q200 712 240 712" stroke="#1b1033" stroke-width="20" fill="none" stroke-linecap="round" />
      <path d="M130 1060 Q120 860 170 760 Q200 712 240 712" stroke="#d8d2f4" stroke-width="10" fill="none" stroke-linecap="round" />
      <circle cx="252" cy="736" r="46" fill="#fff6c0" opacity="0.3" />
      <circle cx="252" cy="736" r="24" fill="#fff6c0" stroke="#1b1033" stroke-width="5" />
      <path d="M240 726 Q246 718 256 716" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1520 1030)">
      <ellipse cx="0" cy="6" rx="78" ry="12" fill="#1b1033" opacity="0.3" />
      <ellipse cx="0" cy="-10" rx="44" ry="16" fill="#4a4280" stroke="#1b1033" stroke-width="5" />
      <path d="M-54 -96 Q-90 -70 -84 -40" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M-54 -96 Q-90 -70 -84 -40" stroke="#d8d2f4" stroke-width="8" fill="none" stroke-linecap="round" />
      <circle cx="-84" cy="-36" r="12" fill="#ffc23a" stroke="#1b1033" stroke-width="4" />
      <path d="M-58 -22 Q-64 -110 -40 -132 H40 Q64 -110 58 -22 Q0 -8 -58 -22 Z" fill="url(#future-mint)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-44 -40 Q-48 -96 -32 -120" stroke="#e6fff8" stroke-width="6" fill="none" stroke-linecap="round" />
      <rect x="-26" y="-100" width="52" height="40" rx="10" fill="#effffb" stroke="#1b1033" stroke-width="3.5" />
      <circle cx="-12" cy="-80" r="6" fill="#ff4f8a" stroke="#1b1033" stroke-width="2" />
      <circle cx="4" cy="-80" r="6" fill="#ffc23a" stroke="#1b1033" stroke-width="2" />
      <path d="M-14 -66 H14" stroke="#3e3a9a" stroke-width="3" stroke-linecap="round" />
      <rect x="-12" y="-146" width="24" height="16" fill="#b0aad8" stroke="#1b1033" stroke-width="4" />
      <g transform="translate(54 -110)">
        <g class="future-wave">
          <path d="M0 0 Q36 -18 44 -60" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
          <path d="M0 0 Q36 -18 44 -60" stroke="#d8d2f4" stroke-width="8" fill="none" stroke-linecap="round" />
          <circle cx="46" cy="-66" r="12" fill="#ffc23a" stroke="#1b1033" stroke-width="4" />
        </g>
      </g>
      <rect x="-52" y="-216" width="104" height="74" rx="32" fill="url(#future-metal)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-40" y="-204" width="80" height="44" rx="18" fill="#26305e" stroke="#1b1033" stroke-width="3" />
      <path d="M-26 -178 q8 -12 16 0 M10 -178 q8 -12 16 0" stroke="#7ff4ff" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-10 -170 q10 8 20 0" stroke="#7ff4ff" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <path d="M-34 -196 q6 -4 14 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6" />
      <circle cx="-54" cy="-180" r="9" fill="#ff6a7a" stroke="#1b1033" stroke-width="3.5" />
      <circle cx="54" cy="-180" r="9" fill="#ff6a7a" stroke="#1b1033" stroke-width="3.5" />
      <path d="M-36 -212 Q-20 -222 4 -222" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M0 -216 V-246" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />
      <circle cx="0" cy="-252" r="9" fill="#ff4f8a" stroke="#1b1033" stroke-width="3.5" />
      <circle cx="0" cy="-252" r="18" fill="#ff4f8a" opacity="0.4" class="future-blip" />
    </g>

    <g transform="translate(1740 770)">
      <g class="future-drone">
        <path d="M-14 12 L-24 44 M14 12 L24 44" stroke="#1b1033" stroke-width="3" />
        <rect x="-28" y="40" width="56" height="44" rx="5" fill="#e8b070" stroke="#1b1033" stroke-width="4" />
        <path d="M0 40 V84 M-28 58 H28" stroke="#b47a3a" stroke-width="5" opacity="0.7" />
        <path d="M-70 -10 H70" stroke="#1b1033" stroke-width="10" stroke-linecap="round" />
        <path d="M-70 -10 H70" stroke="#d8d2f4" stroke-width="4" stroke-linecap="round" />
        <ellipse cx="-70" cy="-18" rx="34" ry="6" fill="#ffffff" fill-opacity="0.6" stroke="#1b1033" stroke-width="3" />
        <ellipse cx="70" cy="-18" rx="34" ry="6" fill="#ffffff" fill-opacity="0.6" stroke="#1b1033" stroke-width="3" />
        <path d="M-44 0 Q-44 -24 -14 -26 H14 Q44 -24 44 0 Q44 18 0 20 Q-44 18 -44 0 Z" fill="url(#future-butter)" stroke="#1b1033" stroke-width="4.5" />
        <circle cx="0" cy="-2" r="12" fill="#26305e" stroke="#1b1033" stroke-width="3" />
        <circle cx="3" cy="-5" r="4" fill="#7ff4ff" />
        <path d="M-32 -12 Q-26 -20 -14 -22" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g fill="#2e2468" stroke="#150a30" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-60 1000 30 980 Q60 900 150 920 Q220 940 210 1010 Q280 1030 260 1140 Z" />
      <path d="M1980 1140 V930 Q1900 920 1880 990 Q1820 990 1810 1060 Q1770 1080 1780 1140 Z" />
      <path d="M1900 1140 Q1880 960 1800 860 Q1900 930 1940 1060 Q1950 900 2000 820 L2000 1140 Z" />
      <path d="M1860 1140 Q1820 1020 1700 980 Q1820 990 1890 1080 Z" />
    </g>
    <path d="M10 1000 Q30 960 70 950 M1900 960 Q1920 944 1950 944" stroke="#5a4aa8" stroke-width="6" fill="none" stroke-linecap="round" />
  </g>
</template>

<style scoped>
.future-drift {
  animation: future-drift 24s ease-in-out infinite alternate;
}

.future-lane-near {
  animation: future-lane-near 26s linear infinite;
}

.future-lane-far {
  animation: future-lane-far 40s linear infinite;
}

.future-train {
  animation: future-train 30s linear infinite;
}

.future-pod {
  animation: future-pod 11s ease-in-out infinite;
}

.future-win {
  animation: future-win 7s steps(1) infinite;
}

.future-beacon,
.future-blip {
  animation: future-blink 1.6s ease-in-out infinite alternate;
}

.future-holo {
  animation: future-holo 5s linear infinite;
}

.future-drone {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: future-drone 2.6s ease-in-out infinite alternate;
}

.future-wave {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: future-wave 1.8s ease-in-out infinite alternate;
}

@keyframes future-drift {
  from {
    translate: 0 0;
  }
  to {
    translate: -70px 0;
  }
}

@keyframes future-lane-near {
  from {
    translate: 0 0;
  }
  to {
    translate: 1500px 0;
  }
}

@keyframes future-lane-far {
  from {
    translate: 0 0;
  }
  to {
    translate: -1200px 0;
  }
}

@keyframes future-train {
  0% {
    translate: -1000px 0;
  }
  36%,
  100% {
    translate: 2900px 0;
  }
}

@keyframes future-pod {
  0% {
    translate: 0 0;
    opacity: 0;
  }
  6% {
    opacity: 1;
  }
  54% {
    opacity: 1;
  }
  60%,
  100% {
    translate: 670px -21px;
    opacity: 0;
  }
}

@keyframes future-win {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes future-blink {
  from {
    opacity: 0.2;
  }
  to {
    opacity: 1;
  }
}

@keyframes future-holo {
  0%,
  44%,
  48%,
  100% {
    opacity: 0.95;
  }
  46% {
    opacity: 0.45;
  }
  80% {
    opacity: 0.75;
  }
}

@keyframes future-drone {
  from {
    translate: 0 0;
    rotate: -2deg;
  }
  to {
    translate: 0 -18px;
    rotate: 2deg;
  }
}

@keyframes future-wave {
  from {
    rotate: -10deg;
  }
  to {
    rotate: 24deg;
  }
}
</style>
