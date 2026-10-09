<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(7321);
const f1 = (n: number) => n.toFixed(1);
const WALL_FOOT = 800;
const WIN = { x0: 740, x1: 1180, y0: 150, y1: 560 };
const insideWindow = (x: number, y: number) => x > WIN.x0 - 40 && x < WIN.x1 + 40 && y > WIN.y0 - 40 && y < WIN.y1 + 40;

const STRIPES = Array.from({ length: 34 }, (_, i) => -40 + i * 60)
  .map((x) => (x > WIN.x0 - 30 && x < WIN.x1 + 30 ? `M${x} -60 V${WIN.y0 - 30} M${x} ${WIN.y1 + 30} V${WALL_FOOT}` : `M${x} -60 V${WALL_FOOT}`))
  .join(' ');
// wallpaper sprigs on every other stripe, offset per column so the grid does not read as tiles
const SPRIGS = Array.from({ length: 17 }, (_, i) => -10 + i * 120)
  .flatMap((x, i) => Array.from({ length: 8 }, (_, j) => ({ x, y: 40 + j * 96 + (i % 2) * 48 })))
  .filter((p) => !insideWindow(p.x, p.y) && p.y < WALL_FOOT - 30)
  .map((p) => `M${p.x} ${p.y - 9} l7 9 l-7 9 l-7 -9 Z`)
  .join(' ');

// one rope per span between the nails; flags are split into two paths that sway out of phase
const NAILS = [-60, 420, 960, 1500, 1980];
const FLAG_COLORS = ['#ff6b6b', '#ffd25f', '#5fc8a0', '#6aa8ff', '#ff9ec4'];
const ROPE = NAILS.slice(1)
  .map((x1, i) => {
    const x0 = NAILS[i] ?? 0;
    return `M${x0} 36 Q${(x0 + x1) / 2} 156 ${x1} 36`;
  })
  .join(' ');
const FLAGS = NAILS.slice(1).flatMap((x1, i) => {
  const x0 = NAILS[i] ?? 0;
  return Array.from({ length: 8 }, (_, k) => {
    const t = (k + 0.75) / 8.5;
    const x = x0 + (x1 - x0) * t;
    const y = 36 + 240 * t * (1 - t) - 2;
    return { d: `M${f1(x - 20)} ${f1(y)} H${f1(x + 20)} L${f1(x)} ${f1(y + 46)} Z`, c: FLAG_COLORS[(i * 8 + k) % FLAG_COLORS.length] ?? '#fff', odd: k % 2 === 1 };
  });
});
const FLAGS_A = FLAGS.filter((f) => !f.odd);
const FLAGS_B = FLAGS.filter((f) => f.odd);

const CARPET = { x0: 60, x1: 500, y0: 140, y1: 560 };
const CX = (CARPET.x0 + CARPET.x1) / 2;
const CY = (CARPET.y0 + CARPET.y1) / 2;
const diamond = (cx: number, cy: number, rx: number, ry: number) => `M${cx} ${cy - ry} L${cx + rx} ${cy} L${cx} ${cy + ry} L${cx - rx} ${cy} Z`;
const zigzag = (x0: number, x1: number, y: number, step: number, h: number) => {
  let d = `M${x0} ${y}`;
  for (let x = x0, up = true; x < x1; x += step, up = !up) d += ` L${x + step} ${up ? y - h : y}`;
  return d;
};
const CARPET_ZIGZAG = [zigzag(CARPET.x0 + 30, CARPET.x1 - 30, CARPET.y0 + 26, 14, 8), zigzag(CARPET.x0 + 30, CARPET.x1 - 30, CARPET.y1 - 18, 14, 8)].join(' ');
const CARPET_SIDES = Array.from({ length: 13 }, (_, i) => CARPET.y0 + 44 + i * 26)
  .map((y) => `${diamond(CARPET.x0 + 22, y, 6, 9)} ${diamond(CARPET.x1 - 22, y, 6, 9)}`)
  .join(' ');
const FRINGE = Array.from({ length: 37 }, (_, i) => CARPET.x0 + 4 + i * 12)
  .map((x) => `M${x} ${CARPET.y0} v-14 M${x} ${CARPET.y1} v14`)
  .join(' ');
const CARPET_DOTS = Array.from({ length: 26 }, () => {
  const x = CARPET.x0 + 60 + rnd() * (CARPET.x1 - CARPET.x0 - 120);
  const y = CARPET.y0 + 60 + rnd() * (CARPET.y1 - CARPET.y0 - 120);
  return Math.abs(x - CX) / 130 + Math.abs(y - CY) / 130 < 1.05 ? '' : diamond(Math.round(x), Math.round(y), 5, 7);
}).join(' ');

// lace: scalloped hem plus a dot grid, all in two paths per panel
const hem = (x0: number, x1: number) => {
  const n = Math.round((x1 - x0) / 20);
  const w = (x1 - x0) / n;
  return Array.from({ length: n }, () => `q${f1(-w / 2)} 18 ${f1(-w)} 0`).join(' ');
};
const curtain = (top0: number, top1: number, bot0: number, bot1: number, y0: number, y1: number) =>
  `M${top0} ${y0} H${top1} C${top1 + (bot1 - top1) * 0.2} ${y0 + 200} ${bot1 + 10} ${y1 - 160} ${bot1} ${y1} ${hem(bot0, bot1)} ` +
  `C${bot0 - 10} ${y1 - 160} ${top0 + (bot0 - top0) * 0.2} ${y0 + 200} ${top0} ${y0} Z`;
const LACE_DOTS = (x0: number, x1: number) =>
  Array.from({ length: 11 }, (_, r) => 200 + r * 40)
    .flatMap((y, r) => Array.from({ length: 5 }, (_, c) => `M${f1(x0 + 18 + c * ((x1 - x0 - 36) / 4) + (r % 2) * 14 - 7)} ${y} a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 Z`))
    .join(' ');
const CURTAIN_L = curtain(650, 830, 640, 800, 120, 640);
const CURTAIN_R = curtain(1090, 1270, 1120, 1280, 120, 640);
const LACE_L = LACE_DOTS(670, 800);
const LACE_R = LACE_DOTS(1120, 1250);
const VALANCE = `M630 104 H1290 V150 ${Array.from({ length: 11 }, () => 'q-30 34 -60 0').join(' ')} Z`;

const ROOFS = 'M740 560 V492 L790 456 L840 492 V470 H900 V440 L950 410 L1000 440 V500 H1040 V462 L1090 430 L1140 462 V480 H1180 V560 Z';
const ROOF_LIT = [
  [760, 506],
  [810, 520],
  [916, 470],
  [960, 500],
  [1058, 490],
  [1110, 508],
  [1150, 500],
]
  .map(([x = 0, y = 0]) => `M${x} ${y} h16 v14 h-16 Z`)
  .join(' ');
const STARS = Array.from({ length: 9 }, () => {
  const x = WIN.x0 + 30 + rnd() * (WIN.x1 - WIN.x0 - 60);
  const y = WIN.y0 + 20 + rnd() * 200;
  return `M${f1(x)} ${f1(y - 6)} V${f1(y + 6)} M${f1(x - 6)} ${f1(y)} H${f1(x + 6)}`;
}).join(' ');

const PLATES = [1480, 1550, 1620, 1700, 1770];
const CUPS = [1470, 1530, 1680, 1740, 1800];
const CLOTH_HEM = `M-60 870 H1980 V1000 ${Array.from({ length: 26 }, () => 'q-40 30 -80 0').join(' ')} Z`;
const CLOTH_BAND = `M-60 974 ${Array.from({ length: 26 }, (_, i) => `L${-60 + (i + 0.5) * 80} 990 L${-60 + (i + 1) * 80} 974`).join(' ')}`;
const PARQUET = Array.from({ length: 40 }, (_, i) => -100 + i * 56)
  .map((x, i) => (i % 2 ? `M${x} 1000 l40 40 M${x} 1060 l40 40` : `M${x} 1040 l40 -40 M${x} 1100 l40 -40`))
  .join(' ');
const PEAS = Array.from({ length: 22 }, () => {
  const x = 176 + rnd() * 148;
  const y = 784 - rnd() * (40 - Math.abs(x - 250) * 0.4);
  return `M${f1(x)} ${f1(y)} a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z`;
}).join(' ');
const ROSETTES = [1760, 1800, 1840, 1880].map((x) => `M${x - 12} 742 a12 10 0 1 1 24 0 a12 10 0 1 1 -24 0 Z`).join(' ');
</script>

<template>
  <g>
    <defs>
      <linearGradient id="feast-wall" x1="0" y1="0" x2="0.15" y2="1">
        <stop offset="0%" stop-color="#ffe8c4" />
        <stop offset="100%" stop-color="#f0bf8e" />
      </linearGradient>
      <linearGradient id="feast-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d88a4e" />
        <stop offset="100%" stop-color="#8a4a22" />
      </linearGradient>
      <linearGradient id="feast-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8f6ff" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#9cc8e4" stop-opacity="0.55" />
      </linearGradient>
      <linearGradient id="feast-cloth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffdf6" />
        <stop offset="100%" stop-color="#e8dcc8" />
      </linearGradient>
      <linearGradient id="feast-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f4ecdc" />
        <stop offset="100%" stop-color="#fffdf6" />
      </linearGradient>
      <linearGradient id="feast-sofa" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7aa86a" />
        <stop offset="100%" stop-color="#3f6a44" />
      </linearGradient>
      <linearGradient id="feast-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b8743e" />
        <stop offset="100%" stop-color="#7a4422" />
      </linearGradient>
      <linearGradient id="feast-compote" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e2506a" />
        <stop offset="100%" stop-color="#8a1c36" />
      </linearGradient>
      <linearGradient id="feast-pie" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffc870" />
        <stop offset="100%" stop-color="#d4823a" />
      </linearGradient>
      <linearGradient id="feast-cake" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fff4e4" />
        <stop offset="100%" stop-color="#f0c8a0" />
      </linearGradient>
      <linearGradient id="feast-pot" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#c8d4ec" />
      </linearGradient>
      <radialGradient id="feast-moon" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff6c8" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fff6c8" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-feast)" />
    <circle cx="1090" cy="230" r="90" fill="url(#feast-moon)" />
    <path d="M1090 190 a40 40 0 1 0 34 62 a32 32 0 1 1 -34 -62 Z" fill="#fff6c8" stroke="#e8c870" stroke-width="3" />
    <path :d="STARS" stroke="#fff6dc" stroke-width="3" stroke-linecap="round" opacity="0.8" />
    <path d="M760 470 a40 40 0 0 1 70 -10 a34 34 0 0 1 50 30 V560 H760 Z" fill="#4a7a6a" stroke="#2a3a6a" stroke-width="3" opacity="0.7" />
    <path :d="ROOFS" fill="#6a5aa8" stroke="#2a3a6a" stroke-width="3.5" stroke-linejoin="round" />
    <path :d="ROOF_LIT" fill="#ffd96a" />

    <path
      :d="`M-60 -60 H1980 V${WALL_FOOT} H-60 Z M${WIN.x0} ${WIN.y0} H${WIN.x1} V${WIN.y1} H${WIN.x0} Z`"
      fill="url(#feast-wall)"
      fill-rule="evenodd"
    />
    <path :d="STRIPES" stroke="#ffd9a8" stroke-width="18" opacity="0.55" />
    <path :d="SPRIGS" fill="#e89a6a" opacity="0.5" />
    <rect x="-60" y="770" width="2040" height="30" fill="#c8844a" stroke="#1b1033" stroke-width="4" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect :x="WIN.x0 - 14" :y="WIN.y0 - 14" :width="WIN.x1 - WIN.x0 + 28" :height="WIN.y1 - WIN.y0 + 28" rx="6" fill="none" stroke-width="34" />
      <rect :x="WIN.x0 - 14" :y="WIN.y0 - 14" :width="WIN.x1 - WIN.x0 + 28" :height="WIN.y1 - WIN.y0 + 28" rx="6" fill="none" stroke="#fbfcff" stroke-width="24" />
      <path :d="`M960 ${WIN.y0} V${WIN.y1} M${WIN.x0} 300 H${WIN.x1}`" stroke-width="18" />
      <path :d="`M960 ${WIN.y0} V${WIN.y1} M${WIN.x0} 300 H${WIN.x1}`" stroke="#fbfcff" stroke-width="10" />
      <path :d="`M${WIN.x0 - 50} 562 H${WIN.x1 + 50} L${WIN.x1 + 64} 590 H${WIN.x0 - 64} Z`" fill="#fbfcff" stroke-width="5" filter="url(#cel-s)" />
      <path d="M790 200 L770 250 M830 200 L800 270 M1010 340 L980 410" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.35" />
      <g transform="translate(900 562)">
        <path d="M-30 0 L-24 -46 H24 L30 0 Z" fill="#d86a3a" stroke-width="4" />
        <rect x="-32" y="-54" width="64" height="12" rx="4" fill="#e88a4e" stroke-width="4" />
        <path d="M0 -54 Q-30 -70 -46 -60 Q-30 -48 0 -54 Z M0 -54 Q30 -74 48 -62 Q30 -46 0 -54 Z M0 -54 Q-4 -90 6 -100 Q14 -80 0 -54 Z" fill="#5fae5a" stroke-width="3.5" />
        <path d="M-14 -96 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z M14 -84 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 Z M-34 -80 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 Z" fill="#ff4a5a" stroke-width="3.5" />
      </g>
    </g>

    <g class="feast-curtain-l">
      <path :d="CURTAIN_L" fill="#fffaf2" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" opacity="0.88" />
      <path :d="LACE_L" fill="none" stroke="#d8c8e8" stroke-width="3" />
      <path d="M700 140 Q712 380 696 610 M760 140 Q772 380 752 612" stroke="#e4d8ec" stroke-width="4" fill="none" />
    </g>
    <g class="feast-curtain-r">
      <path :d="CURTAIN_R" fill="#fffaf2" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" opacity="0.88" />
      <path :d="LACE_R" fill="none" stroke="#d8c8e8" stroke-width="3" />
      <path d="M1160 140 Q1150 380 1168 612 M1220 140 Q1212 380 1228 610" stroke="#e4d8ec" stroke-width="4" fill="none" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <path :d="VALANCE" fill="#d8475a" stroke-width="5" filter="url(#cel-s)" />
      <path d="M640 118 H1280" stroke="#ffb0b8" stroke-width="5" stroke-linecap="round" />
      <path d="M630 140 H1290" stroke="#f0c050" stroke-width="5" />
      <circle cx="622" cy="112" r="14" fill="#f0c050" stroke-width="4" />
      <circle cx="1298" cy="112" r="14" fill="#f0c050" stroke-width="4" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path :d="FRINGE" stroke="#f4dcb4" stroke-width="4" stroke-linecap="round" />
      <rect :x="CARPET.x0" :y="CARPET.y0" :width="CARPET.x1 - CARPET.x0" :height="CARPET.y1 - CARPET.y0" rx="6" fill="#9a1f36" stroke-width="6" filter="url(#cel)" />
      <rect :x="CARPET.x0 + 40" :y="CARPET.y0 + 40" :width="CARPET.x1 - CARPET.x0 - 80" :height="CARPET.y1 - CARPET.y0 - 80" fill="#c43a48" stroke-width="3.5" />
      <path :d="CARPET_ZIGZAG" fill="none" stroke="#f0b040" stroke-width="4" />
      <path :d="CARPET_SIDES" fill="#f0b040" stroke="none" />
      <path :d="diamond(CX, CY, 150, 170)" fill="#2a3a7a" stroke-width="4" />
      <path :d="diamond(CX, CY, 104, 120)" fill="#f0b040" stroke-width="3.5" />
      <path :d="diamond(CX, CY, 62, 72)" fill="#c43a48" stroke-width="3.5" />
      <path :d="diamond(CX, CY, 24, 28)" fill="#fff2d8" stroke-width="3" />
      <path
        :d="`M${CARPET.x0 + 40} ${CARPET.y0 + 110} L${CARPET.x0 + 110} ${CARPET.y0 + 40} M${CARPET.x1 - 40} ${CARPET.y0 + 110} L${CARPET.x1 - 110} ${CARPET.y0 + 40} M${CARPET.x0 + 40} ${CARPET.y1 - 110} L${CARPET.x0 + 110} ${CARPET.y1 - 40} M${CARPET.x1 - 40} ${CARPET.y1 - 110} L${CARPET.x1 - 110} ${CARPET.y1 - 40}`"
        stroke="#2a3a7a"
        stroke-width="10"
      />
      <path :d="CARPET_DOTS" fill="#2a3a7a" stroke="none" />
      <path :d="`M${CX - 120} ${CY - 20} L${CX - 30} ${CY - 150}`" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.15" />
    </g>

    <g transform="translate(578 280)" stroke="#1b1033" stroke-linejoin="round">
      <circle r="44" fill="#f0c050" stroke-width="5" filter="url(#cel-s)" />
      <circle r="34" fill="#fffdf4" stroke-width="3.5" />
      <path d="M0 0 V-24 M0 0 L16 8" stroke-width="5" stroke-linecap="round" />
      <path d="M0 -30 v6 M30 0 h-6 M0 30 v-6 M-30 0 h6" stroke-width="3" />
      <circle r="4" fill="#d8475a" stroke-width="2" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1310" y="176" width="92" height="112" rx="4" fill="#c88a4a" stroke-width="5" filter="url(#cel-s)" />
      <rect x="1322" y="188" width="68" height="88" fill="#cfe2f0" stroke-width="3" />
      <path d="M1356 216 a12 12 0 1 0 0.1 0 Z M1334 276 Q1356 232 1378 276 Z" fill="#8a6a9a" stroke-width="3" />
      <ellipse cx="1356" cy="368" rx="44" ry="54" fill="#e8b860" stroke-width="5" filter="url(#cel-s)" />
      <ellipse cx="1356" cy="368" rx="32" ry="42" fill="#f4e4c8" stroke-width="3" />
      <path d="M1346 352 a10 10 0 1 0 0.1 0 Z M1366 352 a10 10 0 1 0 0.1 0 Z M1330 404 Q1346 370 1356 404 Q1366 370 1382 404 Z" fill="#9a7a5a" stroke-width="2.5" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-60 610 Q-60 584 -34 584 H576 Q604 584 604 612 V800 H-60 Z" fill="url(#feast-sofa)" stroke-width="6" filter="url(#cel)" />
      <path d="M40 640 v6 M160 640 v6 M280 640 v6 M400 640 v6 M520 640 v6 M100 700 v6 M220 700 v6 M340 700 v6 M460 700 v6" stroke="#2a4a30" stroke-width="7" stroke-linecap="round" />
      <path d="M-40 600 Q200 590 580 602" stroke="#a8d098" stroke-width="5" fill="none" stroke-linecap="round" />
      <g transform="rotate(-8 480 690)">
        <rect x="420" y="630" width="120" height="110" rx="26" fill="#f0b040" stroke-width="5" />
        <path d="M440 650 Q480 670 520 650 M440 720 Q480 700 520 720" stroke="#c88020" stroke-width="3.5" fill="none" />
        <path d="M420 636 l-14 -10 M540 636 l14 -10" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1420" y="294" width="440" height="506" rx="6" fill="url(#feast-wood)" stroke-width="6" filter="url(#cel)" />
      <rect x="1402" y="272" width="476" height="30" rx="6" fill="#b06a34" stroke-width="5" />
      <path d="M1414 280 H1866" stroke="#f0b880" stroke-width="4" stroke-linecap="round" />
      <rect x="1442" y="318" width="194" height="236" fill="#5a2c14" stroke-width="4" />
      <rect x="1644" y="318" width="194" height="236" fill="#5a2c14" stroke-width="4" />
      <path d="M1442 436 H1838" stroke="#8a4a22" stroke-width="8" />
      <circle v-for="x in PLATES" :key="`pl${x}`" :cx="x" cy="386" r="34" fill="#fffdf6" stroke-width="3.5" />
      <path v-for="x in PLATES" :key="`pr${x}`" :d="`M${x} 386 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0`" fill="none" stroke="#4a78d0" stroke-width="3" />
      <g v-for="x in CUPS" :key="`cp${x}`" :transform="`translate(${x} 540)`">
        <path d="M-20 0 Q-22 -34 -20 -40 H20 Q22 -34 20 0 Z" fill="#fffdf6" stroke-width="3.5" />
        <path d="M20 -30 Q34 -28 30 -14 Q28 -8 20 -10" fill="none" stroke-width="3.5" />
        <path d="M-12 -24 h24" stroke="#d8475a" stroke-width="4" />
      </g>
      <path d="M1608 548 L1598 470 L1616 450 L1634 470 L1624 548 Z" fill="#cfeaff" stroke-width="3.5" opacity="0.9" />
      <rect x="1442" y="318" width="194" height="236" fill="url(#feast-glass)" stroke-width="5" />
      <rect x="1644" y="318" width="194" height="236" fill="url(#feast-glass)" stroke-width="5" />
      <path d="M1460 420 L1520 334 M1480 440 L1546 346 M1662 420 L1722 334 M1682 440 L1748 346" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.6" />
      <rect x="1410" y="560" width="460" height="30" rx="5" fill="#b06a34" stroke-width="5" />
      <path d="M1420 568 H1860" stroke="#f0b880" stroke-width="4" stroke-linecap="round" />
      <rect x="1442" y="606" width="194" height="164" rx="4" fill="url(#feast-wood)" stroke-width="4" />
      <rect x="1644" y="606" width="194" height="164" rx="4" fill="url(#feast-wood)" stroke-width="4" />
      <rect x="1464" y="626" width="150" height="124" rx="10" fill="none" stroke="#5a2c14" stroke-width="4" />
      <rect x="1666" y="626" width="150" height="124" rx="10" fill="none" stroke="#5a2c14" stroke-width="4" />
      <circle cx="1624" cy="688" r="7" fill="#f0c050" stroke-width="3" />
      <circle cx="1656" cy="688" r="7" fill="#f0c050" stroke-width="3" />
      <circle cx="1624" cy="436" r="6" fill="#f0c050" stroke-width="3" />
      <circle cx="1656" cy="436" r="6" fill="#f0c050" stroke-width="3" />
      <g transform="translate(1490 272)">
        <path d="M-20 0 Q-30 -30 -14 -54 H14 Q30 -30 20 0 Z" fill="#5fb0d8" stroke-width="4" />
        <path d="M-6 -54 Q-26 -96 -40 -110 M0 -54 V-124 M6 -54 Q26 -96 42 -104" stroke="#3a8a4a" stroke-width="4" fill="none" />
        <path d="M-52 -112 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z M-12 -128 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z M30 -106 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z" fill="#ffe46b" stroke-width="3.5" />
        <path d="M-12 -46 Q-18 -26 -12 -8" stroke="#d4f0ff" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
      <g transform="translate(1790 272)">
        <path d="M-40 0 L-34 -70 H34 L40 0 Z" fill="#e8b860" stroke-width="4.5" />
        <path d="M-24 -10 L-20 -58 H20 L24 -10 Z" fill="#cfe2f0" stroke-width="3" />
        <path d="M-12 -20 Q0 -46 12 -20 Z M-6 -40 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 Z" fill="#d8475a" stroke-width="2.5" />
      </g>
    </g>

    <path d="M-60 990 H1980 V1140 H-60 Z" fill="url(#feast-floor)" />
    <path :d="PARQUET" stroke="#5a2e14" stroke-width="3" opacity="0.4" />
    <path d="M-60 990 H1980" stroke="#1b1033" stroke-width="5" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-60 870 H1980 L1900 800 H20 Z" fill="url(#feast-top)" stroke-width="6" />
      <path :d="CLOTH_HEM" fill="url(#feast-cloth)" stroke-width="6" filter="url(#cel)" />
      <path :d="CLOTH_BAND" stroke="#e86a7a" stroke-width="6" fill="none" />
      <path d="M200 880 Q210 940 196 990 M560 880 Q574 940 556 996 M1360 880 Q1346 940 1362 996 M1720 880 Q1708 940 1724 990" stroke="#d8ccb8" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-40 876 H1960" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="760" cy="846" rx="58" ry="12" fill="#fffdf6" stroke-width="4" />
      <ellipse cx="760" cy="845" rx="38" ry="7" fill="none" stroke="#4a78d0" stroke-width="2.5" />
      <ellipse cx="1160" cy="846" rx="58" ry="12" fill="#fffdf6" stroke-width="4" />
      <ellipse cx="1160" cy="845" rx="38" ry="7" fill="none" stroke="#4a78d0" stroke-width="2.5" />
      <path d="M680 856 l26 -28 M1238 856 l-26 -28" stroke="#9aa4c4" stroke-width="5" stroke-linecap="round" />
      <path d="M910 846 L918 820 H1002 L1010 846 Z" fill="#d8a060" stroke-width="4" />
      <path d="M922 820 Q940 800 960 818 Q980 800 998 820 Z" fill="#f4c888" stroke-width="3.5" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="80" cy="848" rx="52" ry="10" fill="#4a2a2a" opacity="0.25" stroke="none" />
      <path d="M36 846 V716 Q36 700 50 696 H110 Q124 700 124 716 V846 Q80 856 36 846 Z" fill="url(#feast-compote)" stroke-width="5" />
      <path d="M42 730 H118" stroke="#ff9aaa" stroke-width="3" opacity="0.6" />
      <path d="M60 780 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 Z M86 806 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 Z M56 820 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z M90 760 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z" fill="#6a0f24" stroke-width="2.5" />
      <rect x="44" y="684" width="72" height="18" rx="6" fill="#e8ecf6" stroke-width="4" />
      <path d="M50 730 Q46 780 50 830" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.55" />

      <ellipse cx="250" cy="852" rx="110" ry="12" fill="#4a2a2a" opacity="0.25" stroke="none" />
      <path d="M144 790 Q150 850 250 854 Q350 850 356 790 Z" fill="#eef2ff" stroke-width="5" />
      <path d="M150 806 Q250 826 350 806" stroke="#4a78d0" stroke-width="5" fill="none" />
      <path d="M156 792 Q250 700 344 792 Z" fill="#f6e2a0" stroke-width="4.5" />
      <path :d="PEAS" fill="#6cc04a" stroke="none" />
      <path d="M200 770 h10 v8 h-10 Z M262 744 h10 v8 h-10 Z M300 774 h10 v8 h-10 Z M230 786 h10 v8 h-10 Z" fill="#ff8a3a" stroke="none" />
      <path d="M140 790 H360" stroke-width="5" stroke-linecap="round" />
      <path d="M244 722 L232 690 M232 690 q-8 -6 -2 -14 l10 12" stroke="#b8c0d8" stroke-width="5" fill="none" stroke-linecap="round" />

      <ellipse cx="470" cy="842" rx="104" ry="16" fill="#fffdf6" stroke-width="4" />
      <path d="M380 820 Q380 790 470 788 Q560 790 560 820 Q560 840 470 842 Q380 840 380 820 Z" fill="url(#feast-pie)" stroke-width="5" />
      <path d="M410 806 L440 836 M440 794 L480 838 M480 792 L520 834 M510 796 L540 822 M420 826 L450 796 M460 836 L500 792 M500 838 L536 804" stroke="#b86a2a" stroke-width="4" />
      <path d="M520 830 L560 820 L556 842 Z" fill="#ffd8a0" stroke-width="3.5" />
      <path d="M400 806 Q430 792 470 792" stroke="#ffe8b8" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="1440" cy="846" rx="96" ry="14" fill="#fffdf6" stroke-width="4" />
      <path d="M1366 838 V818 Q1440 760 1514 818 V838 Q1440 852 1366 838 Z" fill="#8a2a5a" stroke-width="5" />
      <path d="M1366 826 Q1440 840 1514 826" stroke="#f4ece0" stroke-width="5" fill="none" />
      <path d="M1376 806 Q1440 770 1504 806" stroke="#c84a7a" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M1414 790 l6 -4 M1450 782 l6 2 M1478 794 l4 -4" stroke="#f4ece0" stroke-width="4" stroke-linecap="round" />

      <ellipse cx="1630" cy="850" rx="80" ry="10" fill="#4a2a2a" opacity="0.25" stroke="none" />
      <path d="M1586 768 Q1560 760 1546 730 L1534 734 Q1548 786 1590 800" fill="url(#feast-pot)" stroke-width="4.5" />
      <path d="M1680 784 Q1716 780 1712 754 Q1708 734 1686 742" fill="none" stroke-width="7" stroke-linecap="round" />
      <path d="M1576 846 Q1560 790 1590 760 Q1630 740 1670 760 Q1700 790 1684 846 Z" fill="url(#feast-pot)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M1594 764 Q1630 752 1666 764 Q1630 774 1594 764 Z" fill="#e8ecf6" stroke-width="3.5" />
      <circle cx="1630" cy="752" r="8" fill="#d8475a" stroke-width="3" />
      <path d="M1600 800 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z M1636 812 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 Z" fill="#d8475a" stroke-width="2.5" />
      <path d="M1592 784 Q1590 810 1598 830" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
      <g class="feast-steam" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.85">
        <path d="M1538 722 q-12 -14 0 -28 t0 -28" />
      </g>
      <g class="feast-steam feast-steam-b" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85">
        <path d="M1554 716 q10 -12 0 -24 t0 -24" />
      </g>

      <ellipse cx="1820" cy="852" rx="118" ry="14" fill="#fffdf6" stroke-width="4" />
      <path d="M1730 844 V760 Q1820 740 1910 760 V844 Q1820 860 1730 844 Z" fill="url(#feast-cake)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M1730 790 Q1820 806 1910 790 M1730 818 Q1820 834 1910 818" stroke="#c88a4a" stroke-width="5" fill="none" />
      <path d="M1730 760 Q1820 776 1910 760 Q1820 744 1730 760 Z" fill="#fff8ee" stroke-width="4" />
      <path :d="ROSETTES" fill="#ffb0c4" stroke-width="3" />
      <circle cx="1820" cy="732" r="9" fill="#d81f3a" stroke-width="3" />
      <path d="M1820 724 q4 -14 14 -16" stroke-width="3" fill="none" />
    </g>

    <g transform="translate(240 1060)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="10" cy="14" rx="90" ry="12" fill="#3a1a0a" opacity="0.35" stroke="none" />
      <g class="feast-tail">
        <path d="M50 0 Q110 -10 112 -60 Q114 -90 96 -96" stroke-width="18" fill="none" stroke-linecap="round" />
        <path d="M50 0 Q110 -10 112 -60 Q114 -90 96 -96" stroke="#8a8aa8" stroke-width="10" fill="none" stroke-linecap="round" />
      </g>
      <path d="M-60 6 Q-70 -70 0 -80 Q66 -82 66 -10 Q66 10 40 10 H-40 Q-62 10 -60 6 Z" fill="#8a8aa8" stroke-width="5" />
      <path d="M-30 -60 Q-20 -46 -30 -30 M0 -76 Q10 -60 2 -40 M28 -70 Q36 -56 30 -38" stroke="#5a5a7a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-70 -64 Q-86 -110 -40 -118 Q4 -118 0 -76 Q-4 -50 -34 -48 Q-64 -48 -70 -64 Z" fill="#8a8aa8" stroke-width="5" />
      <path d="M-76 -92 L-76 -132 L-54 -110 Z M-24 -114 L-10 -140 L-6 -104 Z" fill="#8a8aa8" stroke-width="4.5" />
      <path d="M-72 -104 L-72 -122 L-62 -110 Z M-20 -112 L-12 -128 L-11 -108 Z" fill="#ff9aa8" stroke="none" />
      <path d="M-62 -86 Q-56 -80 -50 -86 M-34 -88 Q-28 -82 -22 -88" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <path d="M-40 -74 l-3 3 l-3 -3" stroke-width="3" fill="none" />
      <ellipse cx="-64" cy="-72" rx="7" ry="4" fill="#ff7a8a" opacity="0.55" stroke="none" />
      <ellipse cx="-18" cy="-74" rx="7" ry="4" fill="#ff7a8a" opacity="0.55" stroke="none" />
      <path d="M-70 -74 L-90 -76 M-70 -68 L-88 -62 M-12 -74 L8 -76 M-12 -68 L6 -62" stroke-width="2" />
      <path d="M-46 8 a12 8 0 1 0 24 0 M-14 8 a12 8 0 1 0 24 0" fill="#a8a8c4" stroke-width="4" />
    </g>

    <path :d="ROPE" stroke="#1b1033" stroke-width="7" fill="none" />
    <path :d="ROPE" stroke="#f4e4c8" stroke-width="3" fill="none" />
    <g class="feast-flags" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path v-for="(f, i) in FLAGS_A" :key="`fa${i}`" :d="f.d" :fill="f.c" />
    </g>
    <g class="feast-flags feast-flags-b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path v-for="(f, i) in FLAGS_B" :key="`fb${i}`" :d="f.d" :fill="f.c" />
    </g>
    <g fill="#f0c050" stroke="#1b1033" stroke-width="4">
      <circle v-for="x in NAILS" :key="`nl${x}`" :cx="x" cy="36" r="10" />
    </g>
  </g>
</template>

<style scoped>
.feast-flags {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: feast-flutter 3.6s ease-in-out infinite alternate;
}

.feast-flags-b {
  animation-delay: -1.8s;
}

.feast-curtain-l {
  transform-origin: 740px 120px;
  animation: feast-breeze 7s ease-in-out infinite alternate;
}

.feast-curtain-r {
  transform-origin: 1180px 120px;
  animation: feast-breeze 7s ease-in-out infinite alternate-reverse;
}

.feast-steam {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: feast-steam 3.4s ease-out infinite;
}

.feast-steam-b {
  animation-delay: -1.7s;
}

.feast-tail {
  transform-origin: 50px 0;
  animation: feast-wag 2.8s ease-in-out infinite alternate;
}

@keyframes feast-flutter {
  from {
    transform: skewX(-4deg);
  }
  to {
    transform: skewX(4deg);
  }
}

@keyframes feast-breeze {
  from {
    rotate: -0.8deg;
  }
  to {
    rotate: 0.8deg;
  }
}

@keyframes feast-steam {
  0% {
    transform: translateY(0) scale(0.8);
    opacity: 0;
  }
  25% {
    opacity: 0.85;
  }
  100% {
    transform: translateY(-50px) scale(1.2);
    opacity: 0;
  }
}

@keyframes feast-wag {
  from {
    rotate: -8deg;
  }
  to {
    rotate: 10deg;
  }
}
</style>
