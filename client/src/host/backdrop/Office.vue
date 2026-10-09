<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(4339);
const VP = { x: 960, y: 360 };
const WALL_FOOT = 790;
const WIN = { x0: 540, x1: 1380, y0: 100, y1: 640 };

const recede = (x: number, yNear: number, yFar: number) => VP.x + ((x - VP.x) * (yFar - VP.y)) / (yNear - VP.y);

function buildings(minW: number, maxW: number, minH: number, maxH: number) {
  const out: { x: number; w: number; h: number }[] = [];
  for (let x = WIN.x0 - 30; x < WIN.x1; ) {
    const w = minW + rnd() * (maxW - minW);
    out.push({ x, w, h: minH + rnd() * (maxH - minH) });
    x += w + rnd() * 14;
  }
  return out;
}
const SKY_FOOT = 660;
const FAR = buildings(46, 90, 150, 330)
  .map((b) => `M${b.x.toFixed(0)} ${SKY_FOOT} V${(SKY_FOOT - b.h).toFixed(0)} H${(b.x + b.w).toFixed(0)} V${SKY_FOOT} Z`)
  .join(' ');
const NEAR_COLORS = ['#8fb2e2', '#f2b7a6', '#a9d3c4', '#c4b2ea', '#f5d38c'];
const NEAR = buildings(70, 120, 70, 210).map((b, i) => ({ ...b, c: NEAR_COLORS[i % NEAR_COLORS.length] }));
const NEAR_LIT = NEAR.map((b) => {
  let d = '';
  for (let y = SKY_FOOT - b.h + 22; y < SKY_FOOT - 20; y += 26) {
    for (let x = b.x + 14; x < b.x + b.w - 20; x += 22) d += `M${x.toFixed(0)} ${y} h10 `;
  }
  return d;
}).join('');

const TILES = Array.from({ length: 25 }, (_, i) => -1960 + i * 240)
  .map((x) => `M${recede(x, 1140, WALL_FOOT).toFixed(0)} ${WALL_FOOT} L${x} 1140`)
  .join(' ');
const TILE_ROWS = [826, 872, 934, 1014, 1112].map((y) => `M-60 ${y} H1980`).join(' ');
const FLECKS = Array.from({ length: 40 }, () => {
  const x = -40 + rnd() * 2000;
  const y = 810 + rnd() * 320;
  return `M${x.toFixed(0)} ${y.toFixed(0)} h${(4 + rnd() * 8).toFixed(0)}`;
}).join(' ');

const deskTop = (xl: number, xr: number, yf: number, yb: number) =>
  `M${xl} ${yf} L${xr} ${yf} L${recede(xr, yf, yb).toFixed(1)} ${yb} L${recede(xl, yf, yb).toFixed(1)} ${yb} Z`;
const LEFT_DESK = deskTop(-60, 560, 900, 838);
const RIGHT_DESK = deskTop(1360, 1980, 900, 838);

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);
const NOTES = [
  { x: 1600, y: 150, r: -6, c: '#ffe46b' },
  { x: 1690, y: 140, r: 4, c: '#ff9ec4' },
  { x: 1780, y: 156, r: -3, c: '#9fe3ff' },
  { x: 1620, y: 260, r: 5, c: '#b6f08a' },
  { x: 1716, y: 262, r: -5, c: '#ffbe7a' },
  { x: 1796, y: 272, r: 7, c: '#ffe46b' },
];
const PLANES = [
  { y: 400, k: 1, s: 26, d: 0 },
  { y: 540, k: 0.75, s: 34, d: 17 },
];
const MONSTERA = [
  { a: -58, s: 0.9 },
  { a: -28, s: 1.05 },
  { a: 2, s: 1.15 },
  { a: 30, s: 1 },
  { a: 60, s: 0.85 },
];
const LEAF =
  'M0 0 Q60 -6 84 -52 L36 -66 L88 -84 Q94 -118 76 -138 L30 -112 L56 -154 Q32 -182 0 -184 Q-32 -182 -56 -154 L-30 -112 L-76 -138 Q-94 -118 -88 -84 L-36 -66 L-84 -52 Q-60 -6 0 0 Z';
const CHAIRS = [
  { x: 770, y: 950, k: 1 },
  { x: 1220, y: 944, k: -1 },
];
const BARS = [
  { h: 40, c: '#5fe0a0' },
  { h: 70, c: '#ffd25f' },
  { h: 54, c: '#ff7a8a' },
  { h: 96, c: '#7ac8ff' },
  { h: 80, c: '#5fe0a0' },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="office-wall" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stop-color="#effaf5" />
        <stop offset="100%" stop-color="#bfe2d3" />
      </linearGradient>
      <linearGradient id="office-band" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffd36e" />
        <stop offset="100%" stop-color="#eba640" />
      </linearGradient>
      <linearGradient id="office-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9aaedb" />
        <stop offset="100%" stop-color="#5d6ba8" />
      </linearGradient>
      <linearGradient id="office-top" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#d8def0" />
      </linearGradient>
      <linearGradient id="office-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f2be7c" />
        <stop offset="100%" stop-color="#c07e40" />
      </linearGradient>
      <linearGradient id="office-panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4f6fc" />
        <stop offset="100%" stop-color="#b6bfd8" />
      </linearGradient>
      <linearGradient id="office-screen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3a4c9a" />
        <stop offset="100%" stop-color="#18204e" />
      </linearGradient>
      <linearGradient id="office-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d6dcea" />
        <stop offset="100%" stop-color="#8790aa" />
      </linearGradient>
      <linearGradient id="office-chair" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff8a6a" />
        <stop offset="100%" stop-color="#d4402e" />
      </linearGradient>
      <linearGradient id="office-chair-b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6ad0c8" />
        <stop offset="100%" stop-color="#22888a" />
      </linearGradient>
      <linearGradient id="office-red" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff7066" />
        <stop offset="100%" stop-color="#b8282e" />
      </linearGradient>
      <linearGradient id="office-water" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#d4f0ff" />
        <stop offset="100%" stop-color="#5fb4ec" />
      </linearGradient>
      <linearGradient id="office-cork" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e6b478" />
        <stop offset="100%" stop-color="#b47a40" />
      </linearGradient>
      <linearGradient id="office-board" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#dfe6f2" />
      </linearGradient>
      <linearGradient id="office-pot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffe8c8" />
        <stop offset="100%" stop-color="#d8a87a" />
      </linearGradient>
      <linearGradient id="office-sun" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stop-color="#fffbe0" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#fffbe0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="office-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eef7ff" stop-opacity="0" />
        <stop offset="100%" stop-color="#eef7ff" stop-opacity="0.75" />
      </linearGradient>
      <radialGradient id="office-bowl" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#f2fcff" />
        <stop offset="60%" stop-color="#a8e2ff" />
        <stop offset="100%" stop-color="#5aa8e0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-office)" />
    <circle cx="1240" cy="230" r="120" fill="#fff6c8" opacity="0.35" />
    <circle cx="1240" cy="230" r="60" fill="#fff7cf" stroke="#e8c870" stroke-width="3" />
    <g class="office-clouds" fill="#ffffff" stroke="#b8d2ea" stroke-width="3">
      <path d="M600 220 q10 -40 60 -34 q20 -34 70 -20 q40 -10 52 26 q36 6 26 34 H596 q-26 -6 4 -6 Z" />
      <path d="M940 310 q8 -30 48 -26 q18 -26 56 -14 q34 -4 40 22 q28 6 18 26 H936 q-20 -4 4 -8 Z" />
    </g>
    <path :d="FAR" fill="#c8dcf0" stroke="#98b6d6" stroke-width="3" stroke-linejoin="round" />
    <path d="M700 470 V420 M1080 420 V370 M1290 460 V410" stroke="#98b6d6" stroke-width="4" stroke-linecap="round" />
    <rect :x="WIN.x0" y="420" :width="WIN.x1 - WIN.x0" height="240" fill="url(#office-haze)" />
    <g stroke="#56669a" stroke-width="3.5" stroke-linejoin="round">
      <rect v-for="(b, i) in NEAR" :key="`nb${i}`" :x="b.x" :y="SKY_FOOT - b.h" :width="b.w" :height="b.h" :fill="b.c" />
    </g>
    <path :d="NEAR_LIT" stroke="#fffbe8" stroke-width="10" opacity="0.6" />
    <path d="M560 640 Q760 600 960 640 Q1160 610 1380 640 V660 H540 Z" fill="#7fc49a" stroke="#56669a" stroke-width="3" />

    <path
      :d="`M-60 -60 H1980 V${WALL_FOOT} H-60 Z M${WIN.x0} ${WIN.y0} H${WIN.x1} V${WIN.y1} H${WIN.x0} Z`"
      fill="url(#office-wall)"
      fill-rule="evenodd"
    />
    <path d="M-30 520 Q30 500 80 540 M480 60 Q520 44 520 80 M1420 560 Q1480 530 1540 566 M1880 600 Q1920 580 1960 610" stroke="#a6d4c0" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.5" />
    <rect x="-60" y="-60" width="2040" height="96" fill="#fdfdf8" stroke="#1b1033" stroke-width="4" />
    <path d="M-60 24 H1980" stroke="#d8dccf" stroke-width="6" />
    <path d="M120 -60 V36 M440 -60 V36 M1480 -60 V36 M1800 -60 V36" stroke="#d8dccf" stroke-width="4" />
    <rect x="-60" y="700" width="2040" height="90" fill="url(#office-band)" />
    <path d="M-60 700 H1980" stroke="#1b1033" stroke-width="4" />
    <path d="M-60 712 H1980" stroke="#ffeab0" stroke-width="4" />
    <path d="M-60 768 H1980" stroke="#c07a2a" stroke-width="3" opacity="0.6" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect :x="WIN.x0 - 14" :y="WIN.y0 - 14" :width="WIN.x1 - WIN.x0 + 28" :height="WIN.y1 - WIN.y0 + 28" rx="8" fill="none" stroke-width="34" />
      <rect :x="WIN.x0 - 14" :y="WIN.y0 - 14" :width="WIN.x1 - WIN.x0 + 28" :height="WIN.y1 - WIN.y0 + 28" rx="8" fill="none" stroke="#fbfcff" stroke-width="24" />
      <path d="M820 100 V640 M1100 100 V640 M540 250 H1380" stroke-width="18" />
      <path d="M820 100 V640 M1100 100 V640 M540 250 H1380" stroke="#fbfcff" stroke-width="10" />
      <path :d="`M${WIN.x0 - 40} 640 H${WIN.x1 + 40} L${WIN.x1 + 56} 668 H${WIN.x0 - 56} Z`" fill="#fbfcff" stroke-width="5" filter="url(#cel-s)" />
      <path d="M600 160 L570 230 M640 160 L600 240 M880 300 L840 400 M1160 300 L1120 380 M1200 300 L1180 340" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.4" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="54" y="120" width="420" height="276" rx="10" fill="url(#office-metal)" stroke-width="6" filter="url(#cel)" />
      <rect x="70" y="136" width="388" height="244" rx="4" fill="url(#office-board)" stroke-width="3.5" />
      <path d="M90 360 L320 150" stroke="#fff" stroke-width="22" stroke-linecap="round" opacity="0.5" />
      <g fill="none" stroke-width="5" stroke-linecap="round">
        <path d="M96 350 L150 300 L196 322 L254 246 L300 268 L352 180" stroke="#e8463a" />
        <path d="M330 180 L354 178 L350 202" stroke="#e8463a" />
        <path d="M96 160 V356 H442" stroke="#3a4a8a" stroke-width="4" />
        <rect x="360" y="290" width="58" height="40" rx="6" stroke="#2f8ae0" stroke-width="4" />
        <circle cx="404" cy="190" r="30" stroke="#2fb06a" stroke-width="4" />
        <path d="M404 160 V190 L430 204" stroke="#2fb06a" stroke-width="4" />
        <path d="M130 200 q14 -14 28 0 t28 0 t28 0" stroke="#2f8ae0" stroke-width="4" />
        <path d="M374 260 h30 M372 246 h40" stroke="#9aa4c4" stroke-width="4" />
      </g>
      <rect x="140" y="392" width="250" height="14" rx="5" fill="url(#office-metal)" stroke-width="4" />
      <rect x="170" y="382" width="44" height="12" rx="5" fill="#e8463a" stroke-width="3" />
      <rect x="226" y="382" width="44" height="12" rx="5" fill="#2f8ae0" stroke-width="3" />
    </g>

    <g transform="translate(1480 190)" stroke="#1b1033">
      <circle r="66" fill="#2fb0a8" stroke-width="5" filter="url(#cel-s)" />
      <circle r="52" fill="#fffdf4" stroke-width="4" />
      <path v-for="a in TICKS" :key="`tk${a}`" :d="a % 90 === 0 ? 'M0 -46 V-36' : 'M0 -46 V-41'" :transform="`rotate(${a})`" :stroke-width="a % 90 === 0 ? 5 : 3" stroke-linecap="round" />
      <g class="office-hour">
        <path d="M0 4 V-24" stroke-width="7" stroke-linecap="round" />
      </g>
      <g class="office-minute">
        <path d="M0 6 V-38" stroke-width="4.5" stroke-linecap="round" />
      </g>
      <circle r="5" fill="#ff7a5a" stroke-width="3" />
      <path d="M-42 -32 Q-30 -48 -10 -54" stroke="#b6f0e8" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1570" y="110" width="300" height="290" rx="8" fill="url(#office-wood)" stroke-width="6" filter="url(#cel)" />
      <rect x="1584" y="124" width="272" height="262" rx="3" fill="url(#office-cork)" stroke-width="3.5" />
      <path d="M1610 360 h8 M1700 330 h6 M1820 200 h8 M1760 370 h6 M1640 230 h6 M1840 330 h6" stroke="#8a5424" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      <g v-for="(n, i) in NOTES" :key="`nt${i}`" :transform="`rotate(${n.r} ${n.x + 34} ${n.y + 34})`">
        <rect :x="n.x" :y="n.y" width="68" height="68" :fill="n.c" stroke-width="3.5" />
        <path :d="`M${n.x} ${n.y + 56} L${n.x + 12} ${n.y + 68} H${n.x} Z`" fill="#1b1033" opacity="0.15" stroke="none" />
        <path :d="`M${n.x + 12} ${n.y + 26} q8 -6 16 0 t16 0 t16 0 M${n.x + 12} ${n.y + 42} h34`" stroke="#6a5a8a" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6" />
        <circle :cx="n.x + 34" :cy="n.y + 8" r="6" :fill="i % 2 ? '#e8463a' : '#2f8ae0'" stroke-width="2.5" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="960" cy="792" rx="400" ry="12" fill="#3a4a7a" opacity="0.3" stroke="none" />
      <rect x="600" y="694" width="720" height="96" rx="6" fill="url(#office-wood)" stroke-width="5" />
      <path d="M840 704 V780 M1080 704 V780" stroke-width="3.5" />
      <path d="M612 704 H1300" stroke="#ffe0b0" stroke-width="4" stroke-linecap="round" />
      <path d="M700 744 h40 M940 744 h40 M1180 744 h40" stroke-width="6" stroke-linecap="round" />
      <g transform="translate(660 694)">
        <rect x="0" y="-62" width="22" height="62" fill="#ff9a6a" stroke-width="3.5" />
        <rect x="24" y="-70" width="22" height="70" fill="#7ac8ff" stroke-width="3.5" />
        <rect x="48" y="-56" width="22" height="56" fill="#b6e08a" stroke-width="3.5" transform="rotate(10 59 0)" />
      </g>
      <g transform="translate(1250 694)">
        <path d="M-24 0 L-20 -30 H20 L24 0 Z" fill="url(#office-pot)" stroke-width="4" />
        <path d="M0 -30 Q-18 -62 -6 -86 Q8 -60 0 -30 Z M0 -30 Q20 -56 36 -60 Q28 -34 0 -30 Z M0 -30 Q-24 -40 -40 -36 Q-26 -24 0 -30 Z" fill="#6cc46a" stroke-width="3.5" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="230" cy="792" rx="230" ry="14" fill="#3a4a7a" opacity="0.3" stroke="none" />
      <rect x="10" y="616" width="440" height="176" rx="4" fill="url(#office-panel)" stroke-width="5" filter="url(#cel)" />
      <rect x="0" y="600" width="460" height="22" rx="5" fill="url(#office-wood)" stroke-width="5" />
      <path d="M12 606 H440" stroke="#ffe0b0" stroke-width="3" stroke-linecap="round" />
      <path d="M230 630 V780" stroke-width="3.5" />
      <path d="M206 690 v30 M254 690 v30" stroke-width="6" stroke-linecap="round" />
      <g transform="translate(150 600)">
        <rect x="-74" y="-170" width="148" height="170" rx="18" fill="url(#office-red)" stroke-width="5" filter="url(#cel-s)" />
        <rect x="-60" y="-190" width="120" height="26" rx="10" fill="#3a3550" stroke-width="4.5" />
        <rect x="-46" y="-100" width="92" height="90" rx="8" fill="#2a2440" stroke-width="4" />
        <rect x="-16" y="-104" width="32" height="20" rx="4" fill="url(#office-metal)" stroke-width="3.5" />
        <path d="M-22 -10 L-18 -46 H18 L22 -10 Z" fill="#fff" stroke-width="3.5" />
        <path d="M22 -38 Q36 -36 34 -24 Q32 -16 20 -18" fill="none" stroke-width="4" />
        <ellipse cx="0" cy="-46" rx="18" ry="4" fill="#6a3a1e" stroke-width="2.5" />
        <circle cx="-40" cy="-136" r="9" fill="#ffd36e" stroke-width="3" />
        <circle cx="-12" cy="-136" r="9" fill="#fff" stroke-width="3" />
        <circle cx="40" cy="-136" r="5" fill="#5fe08a" stroke-width="2.5" />
        <path d="M-60 -150 Q-60 -164 -44 -164" stroke="#ffb0a8" stroke-width="5" fill="none" stroke-linecap="round" />
        <g class="office-steam" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.85">
          <path d="M-6 -56 q-10 -14 0 -28 t0 -28" />
        </g>
        <g class="office-steam office-steam-b" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85">
          <path d="M8 -56 q10 -12 0 -24 t0 -24" />
        </g>
      </g>
      <g transform="translate(300 600)">
        <path d="M-18 0 V-34 H18 V0 Z" fill="#7ac8ff" stroke-width="4" />
        <path d="M18 -26 Q30 -24 28 -14 Q26 -6 18 -8" fill="none" stroke-width="4" />
        <path d="M-12 -28 V-8" stroke="#d6efff" stroke-width="4" stroke-linecap="round" />
        <path d="M30 0 V-58 Q30 -66 38 -66 H82 Q90 -66 90 -58 V0 Z" fill="#fff2d8" stroke-width="4" opacity="0.95" />
        <rect x="26" y="-78" width="68" height="14" rx="5" fill="#e8463a" stroke-width="4" />
        <circle cx="48" cy="-20" r="9" fill="#c88a4a" stroke-width="3" />
        <circle cx="72" cy="-34" r="9" fill="#c88a4a" stroke-width="3" />
        <path d="M38 -54 V-14" stroke="#fff" stroke-width="4" stroke-linecap="round" />
        <path d="M110 0 V-26 H140 V0 Z" fill="#ffd36e" stroke-width="4" />
      </g>
    </g>

    <g transform="translate(560 790)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="4" rx="80" ry="12" fill="#3a4a7a" opacity="0.3" stroke="none" />
      <g class="office-monstera">
        <g v-for="(l, i) in MONSTERA" :key="`ms${i}`" :transform="`translate(0 -80) rotate(${l.a}) scale(${l.s})`">
          <path d="M0 0 Q-6 -60 0 -130" stroke-width="6" fill="none" />
          <path :d="LEAF" :transform="'translate(0 -110) scale(0.62)'" :fill="i % 2 ? '#2f9a5a' : '#46c06e'" stroke-width="6" />
          <path d="M0 -114 Q-4 -160 0 -218" stroke="#a8f0b8" stroke-width="3" fill="none" stroke-linecap="round" />
        </g>
      </g>
      <path d="M-50 -90 H50 L40 0 H-40 Z" fill="url(#office-pot)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-58" y="-102" width="116" height="20" rx="6" fill="#fff2dc" stroke-width="5" />
      <path d="M-44 -94 H16" stroke="#fff" stroke-width="4" stroke-linecap="round" />
    </g>

    <g transform="translate(1470 790)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="4" rx="90" ry="12" fill="#3a4a7a" opacity="0.3" stroke="none" />
      <path d="M-70 0 V-170 H70 V0 Z" fill="url(#office-panel)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-70 -64 H70" stroke-width="3.5" />
      <path d="M-56 -30 H56" stroke="#8a94b0" stroke-width="3" opacity="0.6" />
      <path d="M50 -170 V-6" stroke="#8a94b0" stroke-width="5" opacity="0.4" />
      <path d="M-74 -170 L-66 -230 H66 L74 -170 Z" fill="#7a849e" stroke-width="5" />
      <rect x="-50" y="-226" width="100" height="40" rx="4" fill="#9aa4be" stroke-width="4" />
      <circle cx="44" cy="-200" r="5" fill="#5fe08a" stroke-width="2.5" />
      <rect x="-56" y="-236" width="88" height="12" rx="3" fill="#f4f6fc" stroke-width="3.5" />
      <g class="office-sheet">
        <path d="M-80 -150 L-10 -150 L-6 -170 L-76 -170 Z" fill="#fff" stroke-width="3.5" />
        <path d="M-66 -160 H-24" stroke="#7ac8ff" stroke-width="4" stroke-linecap="round" />
      </g>
      <path d="M-74 -144 L-130 -144 L-126 -170 L-70 -170" fill="#e8ecf6" stroke-width="4" />
      <path d="M-120 -156 H-80" stroke="#c8d0e4" stroke-width="3" />
      <path d="M-66 -212 Q-60 -224 -46 -224" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1720 790)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="4" rx="80" ry="12" fill="#3a4a7a" opacity="0.3" stroke="none" />
      <path d="M-56 0 V-200 Q-56 -214 -42 -214 H42 Q56 -214 56 -200 V0 Z" fill="url(#office-panel)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-30" y="-180" width="60" height="44" rx="8" fill="#e6eaf4" stroke-width="4" />
      <rect x="-24" y="-150" width="14" height="20" rx="3" fill="#ff6a5a" stroke-width="3" />
      <rect x="10" y="-150" width="14" height="20" rx="3" fill="#4aa8ff" stroke-width="3" />
      <rect x="-30" y="-70" width="60" height="10" rx="4" fill="#8a94b0" stroke-width="3" />
      <path d="M-40 -224 H40 L32 -214 H-32 Z" fill="#c8d0e4" stroke-width="4" />
      <path d="M-50 -232 Q-62 -300 -40 -340 Q0 -356 40 -340 Q62 -300 50 -232 Z" fill="url(#office-water)" stroke-width="5" opacity="0.92" />
      <path d="M-46 -290 Q0 -280 46 -290" stroke="#2f80c8" stroke-width="3" fill="none" opacity="0.6" />
      <rect x="-14" y="-370" width="28" height="22" rx="4" fill="#4aa8ff" stroke-width="4" />
      <path d="M-34 -330 Q-40 -296 -34 -258" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.85" />
      <g class="office-bubble" fill="#e8f8ff" stroke="#2f80c8" stroke-width="2.5">
        <circle cx="8" cy="-250" r="7" />
        <circle cx="20" cy="-262" r="4" />
      </g>
      <g transform="translate(80 -60)">
        <path d="M-14 0 L-18 -60 H18 L14 0 Z" fill="#fff" stroke-width="4" />
        <path d="M-18 -46 H18 M-18 -32 H18 M-18 -18 H18" stroke="#c8d0e4" stroke-width="3" />
      </g>
    </g>

    <path d="M-60 790 H1980 V1140 H-60 Z" fill="url(#office-floor)" />
    <path :d="TILES" stroke="#4e5a94" stroke-width="3" opacity="0.35" />
    <path :d="TILE_ROWS" stroke="#4e5a94" stroke-width="3" opacity="0.3" />
    <path :d="FLECKS" stroke="#c4d0f0" stroke-width="3" stroke-linecap="round" opacity="0.5" />
    <path d="M-60 790 H1980" stroke="#1b1033" stroke-width="5" />
    <path d="M540 800 L1380 800 L1560 1140 L380 1140 Z" fill="url(#office-sun)" opacity="0.6" />

    <g v-for="(c, i) in CHAIRS" :key="`ch${i}`" :transform="`translate(${c.x} ${c.y}) scale(${c.k} 1)`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="124" rx="120" ry="16" fill="#2a3266" opacity="0.32" stroke="none" />
      <path d="M0 40 L-96 108 M0 40 L96 108 M0 40 L-20 120 M0 40 L40 116" stroke-width="16" stroke-linecap="round" />
      <path d="M0 40 L-96 108 M0 40 L96 108 M0 40 L-20 120 M0 40 L40 116" stroke="#6a7290" stroke-width="8" stroke-linecap="round" />
      <circle cx="-96" cy="114" r="11" fill="#2a2440" stroke-width="4" />
      <circle cx="96" cy="114" r="11" fill="#2a2440" stroke-width="4" />
      <circle cx="-20" cy="126" r="11" fill="#2a2440" stroke-width="4" />
      <circle cx="40" cy="122" r="11" fill="#2a2440" stroke-width="4" />
      <rect x="-12" y="-10" width="24" height="56" fill="url(#office-metal)" stroke-width="4" />
      <ellipse cx="0" cy="-14" rx="96" ry="26" :fill="i ? '#1f7a7a' : '#b8322a'" stroke-width="5" />
      <path d="M-20 -30 V-80" stroke-width="18" stroke-linecap="round" />
      <path d="M-20 -30 V-80" stroke="#6a7290" stroke-width="9" stroke-linecap="round" />
      <path d="M-92 -84 Q-96 -200 -4 -206 Q88 -204 84 -84 Q-4 -64 -92 -84 Z" :fill="i ? 'url(#office-chair-b)' : 'url(#office-chair)'" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-70 -110 Q-10 -96 60 -110" stroke-width="3" fill="none" opacity="0.4" />
      <path d="M-74 -150 Q-70 -186 -30 -192" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6" />
    </g>

    <g transform="translate(600 1100)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="6" rx="56" ry="10" fill="#2a3266" opacity="0.32" stroke="none" />
      <path d="M-42 -90 H42 L34 4 H-34 Z" fill="url(#office-metal)" stroke-width="5" />
      <path d="M-26 -78 L-20 -6 M0 -78 V-6 M26 -78 L20 -6" stroke="#6a7290" stroke-width="3" opacity="0.6" />
      <circle cx="-14" cy="-96" r="18" fill="#fff" stroke-width="4" />
      <circle cx="16" cy="-92" r="14" fill="#fffbe8" stroke-width="4" />
      <path d="M-24 -98 l8 4 l4 -8 M10 -94 l6 -2" stroke-width="2.5" fill="none" />
      <circle cx="70" cy="-6" r="14" fill="#fff" stroke-width="4" />
      <path d="M62 -8 l6 4 l6 -6" stroke-width="2.5" fill="none" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="250" cy="1128" rx="320" ry="20" fill="#2a3266" opacity="0.3" stroke="none" />
      <rect x="-60" y="920" width="250" height="230" fill="url(#office-panel)" stroke-width="6" filter="url(#cel)" />
      <path d="M-50 1000 H180 M-50 1080 H180" stroke-width="4" />
      <path d="M40 960 h50 M40 1040 h50" stroke-width="7" stroke-linecap="round" />
      <path d="M512 924 V1130" stroke-width="20" stroke-linecap="round" />
      <path d="M512 924 V1130" stroke="#8a94b0" stroke-width="11" stroke-linecap="round" />
      <path d="M180 924 Q240 1040 360 1060 Q450 1074 470 1140" stroke-width="7" fill="none" />
      <path d="M180 924 Q240 1040 360 1060 Q450 1074 470 1140" stroke="#3a3550" stroke-width="3" fill="none" />
      <path d="M300 924 Q330 1010 420 1020 Q500 1030 540 1140" stroke-width="7" fill="none" />
      <path d="M300 924 Q330 1010 420 1020 Q500 1030 540 1140" stroke="#5a6a9a" stroke-width="3" fill="none" />
      <path :d="LEFT_DESK" fill="url(#office-top)" stroke-width="6" filter="url(#cel)" />
      <rect x="-60" y="900" width="620" height="26" rx="5" fill="url(#office-wood)" stroke-width="6" />
      <path d="M-40 906 H540" stroke="#ffe0b0" stroke-width="4" stroke-linecap="round" />
      <path d="M380 856 L470 856 L480 880 L370 880 Z" fill="#f4f6fc" stroke-width="4" />
      <path d="M100 860 Q60 856 52 840" stroke-width="4" fill="none" />

      <ellipse cx="300" cy="868" rx="80" ry="10" fill="#2a3266" opacity="0.25" stroke="none" />
      <path d="M270 868 L282 820 H318 L330 868 Z" fill="url(#office-metal)" stroke-width="5" />
      <rect x="150" y="620" width="300" height="206" rx="14" fill="#2a2a40" stroke-width="6" filter="url(#cel-s)" />
      <rect x="166" y="636" width="268" height="168" rx="6" fill="url(#office-screen)" stroke-width="4" />
      <path d="M182 780 H418 M182 740 H418 M182 700 H418" stroke="#4a5ca8" stroke-width="2" opacity="0.7" />
      <g class="office-bars">
        <rect v-for="(b, i) in BARS" :key="`br${i}`" :x="196 + i * 34" :y="790 - b.h" width="22" :height="b.h" :fill="b.c" stroke-width="3" />
      </g>
      <circle cx="388" cy="694" r="30" fill="#7ac8ff" stroke-width="3.5" />
      <path d="M388 694 V664 A30 30 0 0 1 416 704 Z" fill="#ffd25f" stroke-width="3.5" />
      <path d="M362 760 L382 744 L398 752 L418 728" stroke="#5fe0a0" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M180 650 L240 650" stroke="#8aa4ff" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      <rect x="400" y="600" width="44" height="44" fill="#ffe46b" stroke-width="3.5" transform="rotate(8 422 622)" />
      <path d="M408 624 q8 -6 14 0 t14 0" stroke="#8a7a3a" stroke-width="3" fill="none" transform="rotate(8 422 622)" />
      <rect x="140" y="760" width="40" height="40" fill="#ff9ec4" stroke-width="3.5" transform="rotate(-10 160 780)" />
      <path d="M200 884 L210 856 H390 L398 884 Z" fill="#e8ecf6" stroke-width="4.5" />
      <path d="M220 864 H384 M216 874 H390 M250 864 V874 M290 864 V874 M330 864 V874" stroke="#9aa4c4" stroke-width="2.5" />
      <path d="M156 872 Q158 856 172 856 Q186 858 184 874 Q170 884 156 872 Z" fill="#f4f6fc" stroke-width="4" />

      <g transform="translate(70 870)">
        <path d="M-22 0 V-46 H22 V0 Z" fill="#ffd36e" stroke-width="4.5" />
        <path d="M22 -36 Q38 -34 36 -20 Q34 -10 22 -12" fill="none" stroke-width="4.5" />
        <path d="M-14 -38 V-10" stroke="#fff3c8" stroke-width="5" stroke-linecap="round" />
        <path d="M-22 -30 H22" stroke="#e8463a" stroke-width="4" />
      </g>

      <g transform="translate(500 880)">
        <ellipse cx="0" cy="2" rx="46" ry="8" fill="#2a3266" opacity="0.3" stroke="none" />
        <path d="M-40 -96 Q-70 -60 -50 -16 Q-30 6 0 6 Q30 6 50 -16 Q70 -60 40 -96 Z" fill="url(#office-bowl)" stroke-width="5" />
        <path d="M-56 -60 Q0 -48 56 -60" stroke="#3a8ad0" stroke-width="3" fill="none" />
        <path d="M-40 -12 Q0 2 40 -12 Q20 -4 0 -4 Q-20 -4 -40 -12 Z" fill="#f2d28a" stroke-width="3" />
        <path d="M-10 -10 Q-16 -30 -6 -44 M8 -8 Q16 -26 10 -38" stroke="#3aa86a" stroke-width="5" fill="none" stroke-linecap="round" />
        <g class="office-fish">
          <g transform="translate(0 -34)">
            <path d="M-16 0 Q0 -14 16 0 Q0 14 -16 0 Z" fill="#ff8a2a" stroke-width="3.5" />
            <path d="M-14 0 L-28 -10 L-26 10 Z" fill="#ffb05a" stroke-width="3.5" />
            <circle cx="8" cy="-2" r="2.5" fill="#1b1033" stroke="none" />
          </g>
        </g>
        <ellipse cx="0" cy="-96" rx="40" ry="8" fill="#d8f4ff" stroke-width="4" />
        <path d="M-42 -74 Q-52 -50 -40 -28" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="1680" cy="1128" rx="320" ry="20" fill="#2a3266" opacity="0.3" stroke="none" />
      <path d="M1410 924 V1130" stroke-width="20" stroke-linecap="round" />
      <path d="M1410 924 V1130" stroke="#8a94b0" stroke-width="11" stroke-linecap="round" />
      <rect x="1720" y="920" width="270" height="230" fill="url(#office-panel)" stroke-width="6" filter="url(#cel)" />
      <path d="M1730 1000 H1980 M1730 1080 H1980" stroke-width="4" />
      <path d="M1820 960 h50 M1820 1040 h50" stroke-width="7" stroke-linecap="round" />
      <path :d="RIGHT_DESK" fill="url(#office-top)" stroke-width="6" filter="url(#cel)" />
      <rect x="1360" y="900" width="620" height="26" rx="5" fill="url(#office-wood)" stroke-width="6" />
      <path d="M1380 906 H1960" stroke="#ffe0b0" stroke-width="4" stroke-linecap="round" />
      <path d="M1700 924 Q1680 1020 1600 1050 Q1520 1080 1500 1140" stroke-width="7" fill="none" />
      <path d="M1700 924 Q1680 1020 1600 1050 Q1520 1080 1500 1140" stroke="#3a3550" stroke-width="3" fill="none" />

      <ellipse cx="1740" cy="884" rx="130" ry="10" fill="#2a3266" opacity="0.25" stroke="none" />
      <path d="M1626 744 L1840 744 L1836 870 L1640 870 Z" fill="#c8d0e4" stroke-width="5" filter="url(#cel-s)" />
      <path d="M1642 758 L1824 758 L1820 856 L1654 856 Z" fill="url(#office-screen)" stroke-width="3.5" />
      <path d="M1664 840 L1700 800 L1730 816 L1770 780 L1806 790" stroke="#ffd25f" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M1664 846 L1700 826 L1740 836 L1806 810" stroke="#ff7a8a" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="1696" cy="780" r="12" fill="#5fe0a0" stroke-width="3" />
      <path d="M1600 870 L1866 870 L1880 892 L1588 892 Z" fill="url(#office-metal)" stroke-width="5" />
      <path d="M1700 880 h70" stroke="#6a7290" stroke-width="4" stroke-linecap="round" />
      <path d="M1650 754 L1700 754" stroke="#8aa4ff" stroke-width="4" stroke-linecap="round" opacity="0.6" />

      <g transform="translate(1920 880)">
        <path d="M-22 0 L-18 -32 H18 L22 0 Z" fill="#e8463a" stroke-width="4" />
        <path d="M-10 -32 Q-14 -76 0 -84 Q14 -76 10 -32 Z" fill="#5fc054" stroke-width="4" />
        <path d="M-10 -56 Q-24 -58 -24 -72 M10 -50 Q24 -52 24 -66" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle cx="0" cy="-88" r="6" fill="#ff9ec4" stroke-width="3" />
      </g>

      <g transform="translate(1480 892)">
        <ellipse cx="0" cy="4" rx="90" ry="10" fill="#2a3266" opacity="0.3" stroke="none" />
        <path d="M60 -4 Q96 -6 92 -34 Q88 -50 70 -44" stroke-width="16" fill="none" stroke-linecap="round" />
        <path d="M60 -4 Q96 -6 92 -34 Q88 -50 70 -44" stroke="#ffb05a" stroke-width="8" fill="none" stroke-linecap="round" />
        <g class="office-cat">
          <path d="M-74 0 Q-84 -62 -10 -70 Q66 -72 74 -16 Q74 4 50 4 H-60 Q-74 4 -74 0 Z" fill="#ffb05a" stroke-width="5" />
          <path d="M-20 -66 Q-10 -50 -20 -34 M10 -70 Q20 -54 12 -36 M38 -62 Q46 -48 40 -32" stroke="#d07a2a" stroke-width="5" fill="none" stroke-linecap="round" />
          <path d="M-56 -40 Q-40 -60 -14 -64" stroke="#ffe0b0" stroke-width="5" fill="none" stroke-linecap="round" />
        </g>
        <path d="M-96 -2 Q-110 -40 -78 -52 Q-46 -54 -42 -20 Q-44 2 -70 2 Q-90 4 -96 -2 Z" fill="#ffb05a" stroke-width="5" />
        <path d="M-96 -36 L-94 -70 L-76 -50 Z M-62 -52 L-48 -76 L-44 -44 Z" fill="#ffb05a" stroke-width="4.5" />
        <path d="M-90 -50 L-89 -62 L-82 -54 Z M-56 -54 L-50 -64 L-49 -50 Z" fill="#ff9aa8" stroke="none" />
        <path d="M-88 -26 Q-82 -20 -76 -26 M-66 -28 Q-60 -22 -54 -28" stroke-width="3.5" fill="none" stroke-linecap="round" />
        <path d="M-72 -16 l-3 3 l-3 -3" stroke-width="3" fill="none" />
        <ellipse cx="-90" cy="-14" rx="7" ry="4" fill="#ff7a8a" opacity="0.55" stroke="none" />
        <ellipse cx="-50" cy="-16" rx="7" ry="4" fill="#ff7a8a" opacity="0.55" stroke="none" />
        <path d="M-96 -16 L-114 -18 M-96 -10 L-112 -6 M-44 -16 L-26 -18 M-44 -10 L-28 -6" stroke-width="2" />
      </g>
    </g>

    <g v-for="(p, i) in PLANES" :key="`pl${i}`" :transform="`translate(0 ${p.y}) scale(${p.k})`">
      <g class="office-plane" :style="{ animationDelay: `-${p.d}s`, animationDuration: `${p.s}s` }">
        <g stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
          <path d="M40 0 L-40 -22 L-24 0 Z" fill="#ffffff" />
          <path d="M40 0 L-24 0 L-40 18 Z" fill="#dfe6f4" />
          <path d="M40 0 L-24 0 L-30 8 Z" fill="#b8c4e0" stroke-width="3" />
        </g>
      </g>
    </g>

    <g class="office-leaf">
      <g fill="#1f4a3e" stroke="#0e1f1c" stroke-width="5" stroke-linejoin="round">
        <path :d="LEAF" transform="translate(-40 1160) rotate(30) scale(1.9)" />
        <path :d="LEAF" transform="translate(-60 1060) rotate(70) scale(1.4)" />
        <path :d="LEAF" transform="translate(1980 1160) rotate(-34) scale(1.8)" />
      </g>
      <path d="M-40 1160 L118 890 M-60 1060 L180 980 M1980 1160 L1790 900" stroke="#3a6e5a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>
    <g fill="#16302a" stroke="#0e1f1c" stroke-width="5" stroke-linejoin="round">
      <path :d="LEAF" transform="translate(1990 1050) rotate(-80) scale(1.3)" />
    </g>
  </g>
</template>

<style scoped>
.office-clouds {
  animation: office-drift 40s ease-in-out infinite alternate;
}

.office-minute {
  animation: office-spin 60s linear infinite;
}

.office-hour {
  animation: office-spin 720s linear infinite;
}

.office-steam {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: office-steam 3.2s ease-out infinite;
}

.office-steam-b {
  animation-delay: -1.6s;
}

.office-sheet {
  animation: office-print 7s ease-in-out infinite;
}

.office-bubble {
  animation: office-bubble 5s ease-in infinite;
}

.office-bars {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: office-bars 2.6s ease-in-out infinite alternate;
}

.office-fish {
  animation: office-swim 8s ease-in-out infinite;
}

.office-cat {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: office-breathe 3.4s ease-in-out infinite alternate;
}

.office-monstera {
  transform-origin: 0 -80px;
  animation: office-sway 5s ease-in-out infinite alternate;
}

.office-leaf {
  transform-origin: 0 1140px;
  animation: office-sway 6s ease-in-out infinite alternate;
}

.office-plane {
  animation: office-fly linear infinite;
}

@keyframes office-drift {
  to {
    translate: 140px 0;
  }
}

@keyframes office-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes office-steam {
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

@keyframes office-print {
  0%,
  40% {
    transform: translateX(70px);
    opacity: 1;
  }
  70%,
  85% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 0;
  }
}

@keyframes office-bubble {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(-80px);
    opacity: 0;
  }
}

@keyframes office-bars {
  from {
    transform: scaleY(0.7);
  }
  to {
    transform: scaleY(1);
  }
}

@keyframes office-swim {
  0% {
    transform: translateX(-16px) scaleX(1);
  }
  45% {
    transform: translateX(16px) scaleX(1);
  }
  50% {
    transform: translateX(16px) scaleX(-1);
  }
  95% {
    transform: translateX(-16px) scaleX(-1);
  }
  100% {
    transform: translateX(-16px) scaleX(1);
  }
}

@keyframes office-breathe {
  from {
    transform: scale(1, 1);
  }
  to {
    transform: scale(1.02, 1.07);
  }
}

@keyframes office-sway {
  from {
    rotate: -1.5deg;
  }
  to {
    rotate: 1.5deg;
  }
}

@keyframes office-fly {
  0% {
    transform: translate(-200px, 30px) rotate(-6deg);
  }
  20% {
    transform: translate(400px, -20px) rotate(4deg);
  }
  40% {
    transform: translate(1000px, 0) rotate(0deg);
  }
  44% {
    transform: translate(1100px, -70px) rotate(-90deg);
  }
  48% {
    transform: translate(1020px, -150px) rotate(-180deg);
  }
  52% {
    transform: translate(940px, -70px) rotate(-270deg);
  }
  56% {
    transform: translate(1020px, 0) rotate(-360deg);
  }
  78% {
    transform: translate(1600px, 30px) rotate(-356deg);
  }
  100% {
    transform: translate(2200px, -10px) rotate(-362deg);
  }
}
</style>
