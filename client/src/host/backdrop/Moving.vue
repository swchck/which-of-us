<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(7717);
const VP = { x: 960, y: 360 };
const WALL_FOOT = 800;
const FLOOR_FOOT = 1140;
const WIN = { x0: 150, x1: 690, y0: 130, y1: 580 };
const STREET = 500;

const xAt = (xBottom: number, y: number) => VP.x + ((xBottom - VP.x) * (y - VP.y)) / (FLOOR_FOOT - VP.y);

const PLANK_XS = Array.from({ length: 23 }, (_, i) => -1800 + i * 170);
const PLANKS = PLANK_XS.map((x) => `M${xAt(x, WALL_FOOT).toFixed(0)} ${WALL_FOOT} L${x} ${FLOOR_FOOT}`).join(' ');
const JOINTS = PLANK_XS.slice(0, -1)
  .map((x, i) => {
    const y = WALL_FOOT + 20 + rnd() * 300;
    return `M${xAt(x, y).toFixed(0)} ${y.toFixed(0)} L${xAt(PLANK_XS[i + 1]!, y).toFixed(0)} ${y.toFixed(0)}`;
  })
  .join(' ');
const FLECKS = Array.from({ length: 28 }, (_, i) => {
  const x = i % 2 ? 1380 + rnd() * 560 : -40 + rnd() * 560;
  const y = 830 + rnd() * 280;
  return `M${x.toFixed(0)} ${y.toFixed(0)} l${(6 + rnd() * 8).toFixed(0)} ${(rnd() * 6 - 3).toFixed(0)}`;
}).join(' ');

function houses() {
  let d = '';
  let lit = '';
  for (let x = WIN.x0 - 20; x < WIN.x1 + 20; ) {
    const w = 70 + rnd() * 70;
    const h = 90 + rnd() * 150;
    d += `M${x.toFixed(0)} ${STREET} V${(STREET - h).toFixed(0)} H${(x + w).toFixed(0)} V${STREET} Z `;
    for (let y = STREET - h + 20; y < STREET - 24; y += 30) {
      for (let wx = x + 14; wx < x + w - 18; wx += 24) lit += `M${wx.toFixed(0)} ${y.toFixed(0)} h10 `;
    }
    x += w + 4 + rnd() * 10;
  }
  return { d, lit };
}
const HOUSES = houses();

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
  s: 1 | -1;
  r?: number;
}

// s is the side that faces the vanishing point: boxes left of centre show their right face
function boxShape(b: Box) {
  const { x, y, w, h } = b;
  const dx = b.d * b.s;
  const dy = b.d * 0.6;
  const sx = b.s > 0 ? x + w : x;
  const cx = x + w / 2;
  return {
    front: `M${x} ${y} H${x + w} V${y + h} H${x} Z`,
    side: `M${sx} ${y} L${sx + dx} ${y - dy} V${y + h - dy} L${sx} ${y + h} Z`,
    top: `M${x} ${y} L${x + dx} ${y - dy} H${x + w + dx} L${x + w} ${y} Z`,
    tape: `M${cx - 12} ${y} L${cx - 12 + dx} ${y - dy} H${cx + 12 + dx} L${cx + 12} ${y} Z M${cx - 12} ${y} H${cx + 12} V${y + h * 0.3} H${cx - 12} Z`,
    mark: `M${x + 22} ${y + h * 0.62} q10 -10 20 0 t20 0 t20 0 M${x + 22} ${y + h * 0.8} h${Math.min(70, w * 0.4)}`,
    rotate: b.r ? `rotate(${b.r} ${cx} ${y + h})` : undefined,
  };
}

const BOXES = ([
  { x: 40, y: 640, w: 230, h: 160, d: 50, s: 1 },
  { x: 290, y: 690, w: 170, h: 110, d: 40, s: 1 },
  { x: 70, y: 540, w: 170, h: 100, d: 40, s: 1, r: 3 },
  { x: 1520, y: 620, w: 220, h: 180, d: 50, s: -1 },
  { x: 1546, y: 490, w: 170, h: 130, d: 40, s: -1, r: -2 },
  { x: 1580, y: 410, w: 116, h: 80, d: 30, s: -1, r: 6 },
  { x: 1770, y: 650, w: 200, h: 150, d: 46, s: -1 },
  { x: 1796, y: 540, w: 150, h: 110, d: 36, s: -1, r: 3 },
  { x: -40, y: 960, w: 240, h: 150, d: 60, s: 1 },
] satisfies Box[]).map(boxShape);

const LEAF = 'M0 0 Q26 -22 4 -78 Q-24 -24 0 0 Z';
const LEAVES = Array.from({ length: 9 }, (_, i) => {
  const side = i % 2 ? 1 : -1;
  const y = -150 - i * 30;
  const a = side * (40 + rnd() * 30);
  const k = 0.9 + rnd() * 0.5 - i * 0.03;
  return { t: `translate(${(side * 4).toFixed(0)} ${y}) rotate(${a.toFixed(0)}) scale(${k.toFixed(2)})`, c: i % 3 ? '#4fb46a' : '#2f8a52' };
});
</script>

<template>
  <g>
    <defs>
      <linearGradient id="moving-wall" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stop-color="#fff4e0" />
        <stop offset="100%" stop-color="#eccfa6" />
      </linearGradient>
      <linearGradient id="moving-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#dba46a" />
        <stop offset="100%" stop-color="#9a5c32" />
      </linearGradient>
      <linearGradient id="moving-card" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f0bc7e" />
        <stop offset="100%" stop-color="#d0924e" />
      </linearGradient>
      <linearGradient id="moving-carpet" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e8605a" />
        <stop offset="100%" stop-color="#a8323a" />
      </linearGradient>
      <linearGradient id="moving-pot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f08a5a" />
        <stop offset="100%" stop-color="#b8502e" />
      </linearGradient>
      <linearGradient id="moving-sun" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#fffbe0" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#fffbe0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="moving-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eef7ff" stop-opacity="0" />
        <stop offset="100%" stop-color="#eef7ff" stop-opacity="0.7" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-moving)" />
    <circle cx="560" cy="210" r="46" fill="#fff7cf" stroke="#e8c870" stroke-width="3" />
    <g class="moving-clouds" fill="#ffffff" stroke="#b8d2ea" stroke-width="3">
      <path d="M120 230 q10 -40 60 -34 q20 -34 70 -20 q40 -10 52 26 q36 6 26 34 H116 q-26 -6 4 -6 Z" />
      <path d="M380 330 q8 -30 48 -26 q18 -26 56 -14 q34 -4 40 22 q28 6 18 26 H376 q-20 -4 4 -8 Z" />
    </g>
    <path :d="HOUSES.d" fill="#c8d6ee" stroke="#8aa0c8" stroke-width="3" stroke-linejoin="round" />
    <path :d="HOUSES.lit" stroke="#fffbe8" stroke-width="9" opacity="0.7" />
    <rect :x="WIN.x0" y="380" :width="WIN.x1 - WIN.x0" height="120" fill="url(#moving-haze)" />
    <g stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round">
      <path d="M200 500 V450 M640 500 V440" stroke-width="5" />
      <circle cx="200" cy="440" r="26" fill="#6cc46a" />
      <circle cx="640" cy="426" r="30" fill="#5ab060" />
    </g>
    <rect :x="WIN.x0 - 20" :y="STREET" :width="WIN.x1 - WIN.x0 + 40" height="16" fill="#e4ddd0" stroke="#1b1033" stroke-width="3" />
    <rect :x="WIN.x0 - 20" :y="STREET + 16" :width="WIN.x1 - WIN.x0 + 40" height="90" fill="#8e94aa" />
    <path d="M170 560 h40 M260 560 h40 M690 560 h40" stroke="#f4f0e4" stroke-width="5" />
    <ellipse cx="470" cy="566" rx="180" ry="10" fill="#3a3a5a" opacity="0.35" />

    <g transform="translate(300 562)">
      <g class="moving-van" stroke="#1b1033" stroke-linejoin="round">
        <rect x="0" y="-150" width="222" height="134" rx="8" fill="#f6f8ff" stroke-width="5" />
        <rect x="0" y="-62" width="222" height="14" fill="#ff8a5a" stroke-width="3" />
        <path d="M14 -136 H120" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
        <g transform="translate(78 -126)">
          <path d="M0 18 L14 6 H62 L48 18 Z" fill="#f5cd96" stroke-width="3" />
          <rect x="0" y="18" width="48" height="36" fill="url(#moving-card)" stroke-width="3" />
          <path d="M48 18 L62 6 V42 L48 54 Z" fill="#c2844a" stroke-width="3" />
          <path d="M20 18 V30 H28 V18" stroke-width="2.5" fill="#f3dea4" />
        </g>
        <path d="M222 -112 H286 Q302 -112 314 -86 L332 -58 V-16 H222 Z" fill="#ff7a5a" stroke-width="5" />
        <path d="M234 -102 H284 Q294 -102 302 -84 L310 -66 H234 Z" fill="#9fd8ff" stroke-width="3.5" />
        <path d="M244 -98 L262 -72" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
        <path d="M250 -60 V-20" stroke-width="3" />
        <rect x="320" y="-30" width="20" height="12" rx="3" fill="#b6bfd8" stroke-width="3" />
        <circle cx="326" cy="-48" r="6" fill="#fff3b0" stroke-width="3" />
        <circle cx="56" cy="-12" r="22" fill="#2a2440" stroke-width="4" />
        <circle cx="56" cy="-12" r="9" fill="#b6bfd8" stroke-width="3" />
        <circle cx="270" cy="-12" r="22" fill="#2a2440" stroke-width="4" />
        <circle cx="270" cy="-12" r="9" fill="#b6bfd8" stroke-width="3" />
      </g>
    </g>

    <path
      :d="`M-60 -60 H1980 V${WALL_FOOT} H-60 Z M${WIN.x0} ${WIN.y0} H${WIN.x1} V${WIN.y1} H${WIN.x0} Z`"
      fill="url(#moving-wall)"
      fill-rule="evenodd"
    />
    <g stroke="none">
      <rect x="840" y="180" width="190" height="150" fill="#fffaf0" opacity="0.8" />
      <rect x="1086" y="230" width="104" height="134" fill="#fffaf0" opacity="0.8" />
      <rect x="1680" y="150" width="150" height="110" fill="#fffaf0" opacity="0.7" />
    </g>
    <g fill="#5a4a6a">
      <circle cx="935" cy="170" r="5" />
      <circle cx="1138" cy="220" r="5" />
      <circle cx="1755" cy="140" r="5" />
    </g>
    <path d="M1040 470 l40 -12 M1060 500 l30 -6" stroke="#d8b88a" stroke-width="5" stroke-linecap="round" opacity="0.6" />
    <rect x="-60" y="-60" width="2040" height="96" fill="#fffbf2" stroke="#1b1033" stroke-width="4" />
    <path d="M-60 22 H1980" stroke="#e6dccb" stroke-width="6" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect :x="WIN.x0 - 14" :y="WIN.y0 - 14" :width="WIN.x1 - WIN.x0 + 28" :height="WIN.y1 - WIN.y0 + 28" rx="8" fill="none" stroke-width="34" />
      <rect :x="WIN.x0 - 14" :y="WIN.y0 - 14" :width="WIN.x1 - WIN.x0 + 28" :height="WIN.y1 - WIN.y0 + 28" rx="8" fill="none" stroke="#fbfcff" stroke-width="24" />
      <path d="M420 130 V580 M150 260 H690" stroke-width="18" />
      <path d="M420 130 V580 M150 260 H690" stroke="#fbfcff" stroke-width="10" />
      <path :d="`M${WIN.x0 - 40} 580 H${WIN.x1 + 40} L${WIN.x1 + 56} 608 H${WIN.x0 - 56} Z`" fill="#fbfcff" stroke-width="5" filter="url(#cel-s)" />
      <path d="M200 300 L170 370 M250 300 L210 390 M480 290 L450 350" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.4" />
      <path d="M96 92 H744" stroke-width="10" stroke-linecap="round" />
      <path d="M96 92 H744" stroke="#c8a070" stroke-width="5" stroke-linecap="round" />
      <circle cx="96" cy="92" r="11" fill="#c8a070" stroke-width="4" />
      <circle cx="744" cy="92" r="11" fill="#c8a070" stroke-width="4" />
      <g fill="none" stroke-width="3.5">
        <circle cx="160" cy="98" r="9" />
        <circle cx="186" cy="98" r="9" />
        <circle cx="672" cy="98" r="9" />
      </g>
      <g transform="translate(236 580)">
        <path d="M-30 0 L-24 -40 H24 L30 0 Z" fill="#ffe8c8" stroke-width="4" />
        <path d="M0 -40 Q-18 -70 -6 -94 Q8 -66 0 -40 Z M0 -40 Q20 -64 36 -68 Q28 -42 0 -40 Z" fill="#6cc46a" stroke-width="3.5" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1296" y="500" width="40" height="60" rx="6" fill="#fffbf2" stroke-width="4" />
      <rect x="1308" y="512" width="16" height="22" rx="3" fill="#e6dccb" stroke-width="3" />
      <rect x="1290" y="716" width="48" height="40" rx="6" fill="#fffbf2" stroke-width="4" />
      <circle cx="1306" cy="736" r="4" fill="#1b1033" stroke="none" />
      <circle cx="1322" cy="736" r="4" fill="#1b1033" stroke="none" />
    </g>

    <rect x="-60" y="766" width="2040" height="34" fill="#fffbf2" />
    <path d="M-60 766 H1980" stroke="#1b1033" stroke-width="4" />
    <path d="M-60 780 H1980" stroke="#e6dccb" stroke-width="4" />

    <path d="M-60 800 H1980 V1140 H-60 Z" fill="url(#moving-floor)" />
    <path :d="PLANKS" stroke="#7a4426" stroke-width="3" opacity="0.4" />
    <path :d="JOINTS" stroke="#7a4426" stroke-width="3" opacity="0.4" />
    <path d="M-60 800 H1980" stroke="#1b1033" stroke-width="5" />
    <path d="M300 812 L780 812 L1040 1140 L420 1140 Z" fill="url(#moving-sun)" />
    <path :d="FLECKS" stroke="#fff2d8" stroke-width="4" stroke-linecap="round" opacity="0.7" />

    <g transform="translate(1420 800)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="10" cy="4" rx="70" ry="10" fill="#5a3418" opacity="0.3" stroke="none" />
      <g transform="rotate(-9)">
        <rect x="-44" y="-430" width="88" height="430" rx="14" fill="url(#moving-carpet)" stroke-width="5" filter="url(#cel-s)" />
        <path d="M-40 -360 H40 M-40 -150 H40" stroke="#ffd36e" stroke-width="10" />
        <path d="M-40 -300 l20 -16 l20 16 l20 -16 l20 16 M-40 -210 l20 -16 l20 16 l20 -16 l20 16" stroke="#ffe8b0" stroke-width="5" fill="none" />
        <rect x="-46" y="-90" width="92" height="14" rx="4" fill="#d8b070" stroke-width="3.5" />
        <rect x="-46" y="-270" width="92" height="14" rx="4" fill="#d8b070" stroke-width="3.5" />
        <path d="M-28 -410 V-40" stroke="#ff9a8a" stroke-width="6" stroke-linecap="round" opacity="0.6" />
        <ellipse cx="0" cy="-430" rx="44" ry="16" fill="#8a2430" stroke-width="5" />
        <path d="M0 -430 q10 -4 12 2 q0 8 -16 6 q-20 -4 -14 -12 q8 -10 34 -2" stroke="#ffd36e" stroke-width="3" fill="none" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="250" cy="802" rx="260" ry="14" fill="#5a3418" opacity="0.3" stroke="none" />
      <ellipse cx="1740" cy="802" rx="260" ry="14" fill="#5a3418" opacity="0.3" stroke="none" />
      <path d="M476 800 L506 630 L590 634 L566 800 Z" fill="#d8a062" stroke-width="5" />
      <path d="M500 700 L580 704" stroke="#a8703a" stroke-width="3" />
      <g v-for="(b, i) in BOXES" :key="`bx${i}`" :transform="b.rotate">
        <path :d="b.side" fill="#c2844a" stroke-width="5" />
        <path :d="b.top" fill="#f5cd96" stroke-width="5" />
        <path :d="b.front" fill="url(#moving-card)" stroke-width="5" filter="url(#cel-s)" />
        <path :d="b.tape" fill="#f3dea4" stroke-width="2.5" opacity="0.95" />
        <path :d="b.mark" stroke="#3a2a5a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>

    <g transform="translate(90 948)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-42 -22 V0 A42 16 0 0 0 42 0 V-22 Z" fill="#e0b860" stroke-width="4" />
      <ellipse cx="0" cy="-22" rx="42" ry="16" fill="#f3dea4" stroke-width="4" />
      <ellipse cx="0" cy="-22" rx="19" ry="7" fill="#b8844a" stroke-width="3" />
      <path d="M42 -8 Q70 4 96 -6" stroke="#f3dea4" stroke-width="10" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(372 1110)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="4" rx="84" ry="12" fill="#5a3418" opacity="0.32" stroke="none" />
      <path d="M0 -118 Q-12 -260 6 -420" stroke-width="7" fill="none" />
      <path d="M0 -118 Q-12 -260 6 -420" stroke="#6a8a3a" stroke-width="3" fill="none" />
      <g v-for="(l, i) in LEAVES" :key="`lf${i}`" :transform="l.t">
        <path :d="LEAF" :fill="l.c" stroke-width="4" />
        <path d="M2 -6 Q4 -40 3 -66" stroke="#a8f0b8" stroke-width="2.5" fill="none" stroke-linecap="round" />
      </g>
      <path d="M-62 -120 H62 L50 0 H-50 Z" fill="url(#moving-pot)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-70" y="-132" width="140" height="20" rx="6" fill="#ffb07a" stroke-width="5" />
      <path d="M-46 -100 L-38 -16" stroke="#ffc8a0" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <path d="M-58 -78 Q0 -66 58 -78" stroke="#f3dea4" stroke-width="9" fill="none" />
    </g>

    <g transform="translate(1700 1104)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="-20" cy="6" rx="220" ry="16" fill="#5a3418" opacity="0.32" stroke="none" />
      <path d="M-194 -212 H106 L118 -282 H-176 Z" fill="#f5cd96" stroke-width="5" />
      <path d="M-150 -180 L-194 -212 H106 L150 -180 Z" fill="#7a4a26" stroke-width="5" />
      <path d="M-92 -186 Q-102 -262 -30 -266 Q42 -262 32 -186 Z" fill="#9aa0b8" stroke-width="5" />
      <path d="M-86 -232 L-82 -294 L-46 -260 Z M-14 -260 L22 -294 L26 -232 Z" fill="#9aa0b8" stroke-width="4.5" />
      <path d="M-78 -248 L-77 -278 L-58 -260 Z M-2 -260 L16 -278 L17 -248 Z" fill="#ffb0c0" stroke="none" />
      <path d="M-42 -264 l4 18 M-30 -266 v20 M-18 -264 l-4 18" stroke="#6a7090" stroke-width="4" stroke-linecap="round" />
      <path d="M-62 -224 q8 -9 16 0 M-14 -224 q8 -9 16 0" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-35 -212 h10 l-5 6 Z" fill="#ff8aa0" stroke-width="2.5" />
      <path d="M-40 -200 Q-35 -194 -30 -200 Q-25 -194 -20 -200" stroke-width="3" fill="none" stroke-linecap="round" />
      <ellipse cx="-70" cy="-206" rx="9" ry="5" fill="#ff8aa0" opacity="0.6" stroke="none" />
      <ellipse cx="10" cy="-206" rx="9" ry="5" fill="#ff8aa0" opacity="0.6" stroke="none" />
      <path d="M-80 -208 L-110 -212 M-80 -200 L-108 -194 M20 -208 L50 -212 M20 -200 L48 -194" stroke-width="2" />
      <path d="M-150 -180 L-194 -212 V-32 L-150 0 Z" fill="#c2844a" stroke-width="5" />
      <path d="M-150 -180 H150 V0 H-150 Z" fill="url(#moving-card)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-150 -180 L-194 -212 L-246 -170 L-202 -140 Z" fill="#f5cd96" stroke-width="5" />
      <path d="M150 -180 L106 -212 L170 -246 L206 -208 Z" fill="#e0aa6a" stroke-width="5" />
      <path d="M-104 -60 V-120 M-120 -102 L-104 -120 L-88 -102 M-60 -60 V-120 M-76 -102 L-60 -120 L-44 -102" stroke="#3a2a5a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      <path d="M10 -90 h100 M10 -60 h70" stroke="#3a2a5a" stroke-width="5" stroke-linecap="round" opacity="0.6" />
      <ellipse cx="-66" cy="-182" rx="20" ry="12" fill="#c8ccdc" stroke-width="4" />
      <ellipse cx="6" cy="-182" rx="20" ry="12" fill="#c8ccdc" stroke-width="4" />
      <path d="M-72 -186 v8 M-62 -186 v8 M0 -186 v8 M10 -186 v8" stroke-width="2.5" />
      <g transform="translate(140 -190)">
        <g class="moving-tail">
          <path d="M0 0 Q56 -6 66 -56 Q72 -96 44 -112" stroke-width="26" fill="none" stroke-linecap="round" />
          <path d="M0 0 Q56 -6 66 -56 Q72 -96 44 -112" stroke="#9aa0b8" stroke-width="16" fill="none" stroke-linecap="round" />
          <path d="M40 -16 l10 10 M62 -46 l12 4 M64 -80 l12 -4" stroke="#6a7090" stroke-width="5" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <g transform="translate(1140 -60)">
      <g class="moving-bulb" stroke="#1b1033" stroke-linejoin="round">
        <circle cx="0" cy="250" r="80" fill="#fff6c8" opacity="0.3" stroke="none" />
        <path d="M0 0 V196" stroke-width="5" />
        <rect x="-14" y="194" width="28" height="30" rx="4" fill="#4a4560" stroke-width="4" />
        <circle cx="0" cy="250" r="30" fill="#fff3b0" stroke-width="4.5" />
        <path d="M-6 242 l6 8 l6 -8" stroke="#e8b040" stroke-width="3" fill="none" />
        <path d="M-18 240 Q-16 228 -6 226" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.moving-clouds {
  animation: moving-drift 36s ease-in-out infinite alternate;
}

.moving-van {
  animation: moving-idle 0.9s ease-in-out infinite alternate;
}

.moving-tail {
  animation: moving-swish 2.4s ease-in-out infinite alternate;
}

.moving-bulb {
  animation: moving-swing 5s ease-in-out infinite alternate;
}

@keyframes moving-drift {
  to {
    translate: 180px 0;
  }
}

@keyframes moving-idle {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-3px);
  }
}

@keyframes moving-swish {
  from {
    rotate: -10deg;
  }
  to {
    rotate: 8deg;
  }
}

@keyframes moving-swing {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}
</style>
