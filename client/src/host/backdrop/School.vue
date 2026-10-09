<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(781);
const VP = { x: 960, y: 330 };
const WALL_FOOT = 780;

// shrinks x toward the vanishing point as a floor line recedes from yNear to yFar
const recede = (x: number, yNear: number, yFar: number) => VP.x + ((x - VP.x) * (yFar - VP.y)) / (yNear - VP.y);
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');

function desk(xl: number, xr: number, yf: number, depth: number, h: number) {
  const yb = yf - depth;
  const top = `M${pts([
    [xl, yf],
    [xr, yf],
    [recede(xr, yf, yb), yb],
    [recede(xl, yf, yb), yb],
  ])} Z`;
  const floor = yf + 18 + h;
  const backFloor = floor - depth * 0.7;
  const legs = `M${xl + 18} ${yf + 18} V${floor} M${xr - 18} ${yf + 18} V${floor} M${recede(xl, yf, yb) + 18} ${yb + 10} V${backFloor} M${recede(xr, yf, yb) - 18} ${yb + 10} V${backFloor}`;
  return { xl, xr, yf, yb, top, legs, floor, mid: (xl + xr) / 2, w: xr - xl };
}
const DESKS = [desk(170, 520, 830, 56, 110), desk(-90, 400, 968, 80, 200), desk(1540, 2010, 978, 80, 200)];

const PLANKS = Array.from({ length: 33 }, (_, i) => -1960 + i * 180)
  .map((x) => `M${x} ${WALL_FOOT} L${recede(x, WALL_FOOT, 1140).toFixed(0)} 1140`)
  .join(' ');
const JOINTS = Array.from({ length: 16 }, () => {
  const y = 800 + rnd() * 320;
  const x = -40 + rnd() * 2000;
  return `M${x.toFixed(0)} ${y.toFixed(0)} h${(30 + rnd() * 40).toFixed(0)}`;
}).join(' ');
const BUNTING = Array.from({ length: 17 }, (_, i) => ({ x: -20 + i * 120, c: ['#ff5a5a', '#ffd23f', '#4ac0ff', '#5fd06a', '#b07aff'][i % 5] }));
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);
const DUST = [0, 1, 2].map(() =>
  Array.from({ length: 9 }, () => {
    const t = rnd();
    return { x: 260 + t * 560 + rnd() * 160, y: 200 + t * 560 + rnd() * 120, r: 1.6 + rnd() * 2.4 };
  }),
);
const PLANT_LEAVES = [
  { a: -70, s: 1 },
  { a: -40, s: 1.15 },
  { a: -10, s: 1.25 },
  { a: 18, s: 1.1 },
  { a: 48, s: 1 },
  { a: 78, s: 0.85 },
];
const BOOKS = [
  { w: 96, c: '#e8553f' },
  { w: 84, c: '#4a7ad8' },
  { w: 100, c: '#5fb04a' },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="school-wall" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stop-color="#fff3dc" />
        <stop offset="100%" stop-color="#f6d6a2" />
      </linearGradient>
      <linearGradient id="school-wains" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8fd0ae" />
        <stop offset="100%" stop-color="#4f9a7a" />
      </linearGradient>
      <linearGradient id="school-board" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3a7d5c" />
        <stop offset="100%" stop-color="#1d4a36" />
      </linearGradient>
      <linearGradient id="school-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0a464" />
        <stop offset="100%" stop-color="#a86a36" />
      </linearGradient>
      <linearGradient id="school-wood-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b47640" />
        <stop offset="100%" stop-color="#7a4422" />
      </linearGradient>
      <linearGradient id="school-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0a868" />
        <stop offset="100%" stop-color="#a8682e" />
      </linearGradient>
      <linearGradient id="school-desk" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffd9a0" />
        <stop offset="100%" stop-color="#e0a464" />
      </linearGradient>
      <linearGradient id="school-shaft" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fffbe0" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fffbe0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="school-sea" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#bfe6ff" />
        <stop offset="100%" stop-color="#7cc0ea" />
      </linearGradient>
      <radialGradient id="school-globe" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#bfe8ff" />
        <stop offset="60%" stop-color="#4aa0e0" />
        <stop offset="100%" stop-color="#2a5aa8" />
      </radialGradient>
      <radialGradient id="school-apple" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ff8a7a" />
        <stop offset="60%" stop-color="#e8303a" />
        <stop offset="100%" stop-color="#a8182a" />
      </radialGradient>
      <linearGradient id="school-pot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f08a5a" />
        <stop offset="100%" stop-color="#b8502a" />
      </linearGradient>
      <linearGradient id="school-pack" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffb04a" />
        <stop offset="100%" stop-color="#e06a1a" />
      </linearGradient>
      <linearGradient id="school-pack-b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6aa8ff" />
        <stop offset="100%" stop-color="#2f5ec0" />
      </linearGradient>
    </defs>

    <circle cx="140" cy="200" r="150" fill="#fff6c8" opacity="0.5" />
    <g class="school-tree">
      <path d="M180 640 Q170 470 220 380 M200 470 Q260 420 300 430" stroke="#1b1033" stroke-width="22" fill="none" stroke-linecap="round" />
      <path d="M180 640 Q170 470 220 380 M200 470 Q260 420 300 430" stroke="#9a6a3a" stroke-width="12" fill="none" stroke-linecap="round" />
      <g fill="#6cc04a" stroke="#1b1033" stroke-width="4">
        <circle cx="110" cy="250" r="90" />
        <circle cx="240" cy="200" r="100" />
        <circle cx="340" cy="320" r="80" />
        <circle cx="160" cy="370" r="74" />
      </g>
      <path d="M60 220 Q80 190 120 180 M200 150 Q230 124 270 126 M310 280 Q330 262 360 264" stroke="#b6ec8a" stroke-width="6" fill="none" stroke-linecap="round" />
      <g fill="#3f9a3a">
        <circle cx="140" cy="290" r="26" />
        <circle cx="280" cy="250" r="30" />
        <circle cx="330" cy="360" r="22" />
      </g>
    </g>
    <path d="M40 560 L140 530 L240 556 L340 520 L480 560 L480 640 L40 640 Z" fill="#f4c8a0" stroke="#c89a7a" stroke-width="3" stroke-linejoin="round" />
    <path d="M60 600 h380 M60 580 v60 M120 580 v60 M180 580 v60 M240 580 v60 M300 580 v60 M360 580 v60 M420 580 v60" stroke="#c89a7a" stroke-width="3" />

    <path d="M-60 -60 H1980 V790 H-60 Z M70 120 H460 V610 H70 Z" fill="url(#school-wall)" fill-rule="evenodd" />
    <path d="M-40 140 Q0 120 30 160 M500 60 Q560 40 620 70 M1400 640 Q1460 610 1540 650 M1840 90 Q1880 70 1930 100" stroke="#e8c088" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.4" />
    <rect x="-60" y="600" width="2040" height="190" fill="url(#school-wains)" />
    <path d="M-60 600 H1980" stroke="#1b1033" stroke-width="5" />
    <rect x="-60" y="588" width="2040" height="16" fill="url(#school-wood)" stroke="#1b1033" stroke-width="4" />
    <path d="M-60 592 H1980" stroke="#ffe0b0" stroke-width="3" />
    <g fill="none" stroke="#3a7a5c" stroke-width="4" opacity="0.6">
      <rect v-for="i in 9" :key="`wp${i}`" :x="-40 + (i - 1) * 230" y="624" width="190" height="130" rx="8" />
    </g>
    <rect x="-60" y="764" width="2040" height="26" fill="url(#school-wood-dark)" stroke="#1b1033" stroke-width="4" />

    <path d="M-60 0 H1980" stroke="#e0b884" stroke-width="10" />
    <path d="M-60 26 Q60 50 180 26 Q300 50 420 26 Q540 50 660 26 Q780 50 900 26 Q1020 50 1140 26 Q1260 50 1380 26 Q1500 50 1620 26 Q1740 50 1860 26 Q1980 50 2100 26" stroke="#1b1033" stroke-width="3" fill="none" />
    <path v-for="(b, i) in BUNTING" :key="`bu${i}`" :d="`M${b.x - 22} ${36 + (i % 2) * 2} L${b.x + 22} ${36 + (i % 2) * 2} L${b.x} 84 Z`" :fill="b.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="54" y="104" width="422" height="522" rx="10" fill="none" stroke-width="30" />
      <rect x="54" y="104" width="422" height="522" rx="10" fill="none" stroke="#fffaf0" stroke-width="20" />
      <path d="M265 120 V610 M70 300 H460" stroke-width="16" />
      <path d="M265 120 V610 M70 300 H460" stroke="#fffaf0" stroke-width="9" />
      <path d="M40 620 H490 L506 646 H24 Z" fill="#fffaf0" stroke-width="5" filter="url(#cel-s)" />
      <path d="M100 160 L80 280 M150 160 L130 260 M330 330 L300 520 M380 330 L360 440" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.35" />
    </g>
    <g transform="translate(400 620)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-28 0 L-24 -34 H24 L28 0 Z" fill="url(#school-pot)" stroke-width="4" />
      <path d="M-30 -34 H30 V-44 H-30 Z" fill="#f08a5a" stroke-width="4" />
      <path d="M-12 -44 Q-16 -100 0 -110 Q16 -100 12 -44 Z" fill="#5fb04a" stroke-width="4" />
      <path d="M10 -70 Q28 -72 28 -92 Q20 -96 16 -80 M-10 -60 Q-28 -60 -28 -80" fill="none" stroke-width="4" />
      <path d="M-4 -96 V-56" stroke="#9be08a" stroke-width="3" stroke-linecap="round" />
      <circle cx="0" cy="-114" r="7" fill="#ff7ab0" stroke-width="3" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="560" y="150" width="800" height="420" rx="10" fill="url(#school-wood)" stroke-width="6" filter="url(#cel)" />
      <rect x="584" y="172" width="752" height="376" rx="4" fill="url(#school-board)" stroke-width="4" />
      <path d="M640 520 Q800 470 980 500 M1100 230 Q1200 210 1300 240 M620 300 Q700 280 760 300" stroke="#e8fff4" stroke-width="40" fill="none" stroke-linecap="round" opacity="0.06" />
      <path d="M600 186 L1320 186" stroke="#5aa07c" stroke-width="3" opacity="0.6" />
      <g fill="none" stroke="#f4fff8" stroke-width="4" stroke-linecap="round" opacity="0.85">
        <path d="M610 230 h50 v50 h-50 Z M630 210 h50 v50 h-50 Z M610 230 l20 -20 M660 230 l20 -20 M660 280 l20 -20 M610 280 l20 -20" />
        <circle cx="1170" cy="486" r="30" />
        <path d="M1158 480 v4 M1182 480 v4 M1154 496 Q1170 510 1186 496" />
        <path d="M1300 210 l6 14 l15 2 l-11 10 l3 15 l-13 -7 l-13 7 l3 -15 l-11 -10 l15 -2 Z" />
        <path d="M612 520 q16 -16 32 0 t32 0 t32 0" />
      </g>
      <rect x="570" y="560" width="780" height="18" rx="4" fill="url(#school-wood-dark)" stroke-width="4" />
      <rect x="700" y="548" width="44" height="12" rx="5" fill="#fff" stroke-width="3" />
      <rect x="760" y="550" width="30" height="10" rx="4" fill="#ffd0e0" stroke-width="3" />
      <rect x="1180" y="538" width="72" height="22" rx="4" fill="#5a3a2a" stroke-width="3.5" />
      <rect x="1180" y="550" width="72" height="10" fill="#e8e0f0" stroke-width="3" />
    </g>

    <g transform="translate(1500 330)" stroke="#1b1033">
      <circle r="78" fill="#e8553f" stroke-width="5" filter="url(#cel-s)" />
      <circle r="62" fill="#fffaf0" stroke-width="4" />
      <path v-for="a in TICKS" :key="`tk${a}`" :d="a % 90 === 0 ? 'M0 -56 V-44' : 'M0 -56 V-50'" :transform="`rotate(${a})`" :stroke-width="a % 90 === 0 ? 5 : 3" stroke-linecap="round" />
      <path d="M0 0 L-24 -20" stroke-width="7" stroke-linecap="round" />
      <g class="school-hand">
        <path d="M0 6 V-46" stroke-width="5" stroke-linecap="round" />
      </g>
      <circle r="6" fill="#ffd23f" stroke-width="3" />
      <path d="M-50 -40 Q-36 -58 -14 -64" stroke="#ff9a8a" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1620 250)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M150 -30 L150 -6" stroke-width="3" />
      <path d="M150 -30 L20 -2 M150 -30 L280 -2" stroke-width="3" fill="none" />
      <rect x="10" y="10" width="280" height="300" fill="url(#school-sea)" stroke-width="4" />
      <path d="M10 90 Q150 70 290 90 M10 170 Q150 150 290 170 M10 250 Q150 230 290 250 M80 10 Q60 160 80 310 M220 10 Q240 160 220 310" stroke="#9ad0f0" stroke-width="3" fill="none" />
      <g stroke-width="3.5">
        <path d="M40 60 Q70 30 110 50 Q130 80 104 110 Q96 150 70 170 Q56 130 40 110 Q24 86 40 60 Z" fill="#7ed06a" />
        <path d="M78 190 Q104 182 110 214 Q104 260 86 280 Q70 240 72 210 Z" fill="#ffd36b" />
        <path d="M150 50 Q190 30 250 54 Q272 90 240 110 Q226 140 196 130 Q184 160 160 140 Q140 110 160 90 Q140 70 150 50 Z" fill="#9adf6a" />
        <path d="M170 160 Q200 150 216 180 Q210 230 186 240 Q166 210 170 160 Z" fill="#ffb07a" />
        <path d="M232 220 Q262 212 274 236 Q260 260 236 254 Z" fill="#f2a0d0" />
      </g>
      <rect x="0" y="-4" width="300" height="18" rx="9" fill="url(#school-wood)" stroke-width="4" />
      <rect x="0" y="306" width="300" height="18" rx="9" fill="url(#school-wood)" stroke-width="4" />
      <path d="M12 0 H180 M12 310 H180" stroke="#ffe0b0" stroke-width="3" />
    </g>

    <path d="M-60 790 H1980 V1140 H-60 Z" fill="url(#school-floor)" />
    <path :d="PLANKS" stroke="#9a5a26" stroke-width="3" opacity="0.5" />
    <path :d="JOINTS" stroke="#9a5a26" stroke-width="3" opacity="0.5" />
    <path d="M-60 790 H1980" stroke="#1b1033" stroke-width="4" />

    <path d="M520 860 L880 840 L1040 980 L620 1010 Z" fill="#fff6c0" opacity="0.28" />

    <g transform="translate(1440 0)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="824" rx="250" ry="20" fill="#5a2a10" opacity="0.3" stroke="none" />
      <path d="M-210 640 H210 L230 612 H-190 Z" fill="url(#school-desk)" stroke-width="5" />
      <rect x="-220" y="640" width="440" height="24" rx="4" fill="url(#school-wood)" stroke-width="5" />
      <rect x="-200" y="664" width="400" height="152" fill="url(#school-wood-dark)" stroke-width="5" filter="url(#cel)" />
      <rect x="60" y="680" width="124" height="54" rx="4" fill="url(#school-wood)" stroke-width="4" />
      <rect x="60" y="744" width="124" height="54" rx="4" fill="url(#school-wood)" stroke-width="4" />
      <path d="M108 707 h28 M108 771 h28" stroke-width="6" stroke-linecap="round" />
      <path d="M-180 690 V800 M-60 690 V800 M30 690 V800" stroke="#5a2a14" stroke-width="3" opacity="0.5" />
      <path d="M-200 650 H180" stroke="#ffe0b0" stroke-width="4" />
    </g>
    <g transform="translate(1330 626)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="4" rx="46" ry="9" fill="#5a2a10" opacity="0.3" stroke="none" />
      <path d="M-34 4 Q0 -14 34 4 Z" fill="#c08a2a" stroke-width="4" />
      <path d="M0 -6 V-30" stroke-width="10" />
      <path d="M0 -6 V-30" stroke="#e8c070" stroke-width="5" />
      <circle cx="0" cy="-100" r="64" fill="url(#school-globe)" stroke-width="5" />
      <g stroke-width="3.5" transform="rotate(-20 0 -100)">
        <path d="M-40 -140 Q-10 -150 6 -126 Q-6 -104 -24 -108 Q-30 -90 -48 -92 Q-60 -116 -40 -140 Z" fill="#7ed06a" />
        <path d="M10 -96 Q34 -100 44 -80 Q36 -54 20 -48 Q8 -70 10 -96 Z" fill="#ffd36b" />
        <path d="M30 -150 Q50 -146 56 -128 Q42 -122 30 -150 Z" fill="#9adf6a" />
      </g>
      <path d="M-62 -60 A72 72 0 0 1 50 -160" stroke-width="10" fill="none" stroke-linecap="round" />
      <path d="M-62 -60 A72 72 0 0 1 50 -160" stroke="#e8c070" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-36 -136 Q-20 -152 0 -156" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.85" />
    </g>
    <g transform="translate(1480 626)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <rect v-for="(b, i) in BOOKS" :key="`bk${i}`" :x="-b.w / 2 + i * 6" :y="-22 * (i + 1)" :width="b.w" height="22" rx="3" :fill="b.c" />
      <path d="M-40 -10 h60 M-30 -32 h50 M-34 -54 h60" stroke="#fff" stroke-width="3" opacity="0.6" />
    </g>
    <g transform="translate(1600 626)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="2" cy="4" rx="32" ry="7" fill="#5a2a10" opacity="0.3" stroke="none" />
      <path d="M0 -50 Q-30 -64 -34 -30 Q-34 2 0 2 Q34 2 34 -30 Q30 -64 0 -50 Z" fill="url(#school-apple)" stroke-width="4.5" />
      <path d="M0 -50 Q2 -64 8 -72" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M6 -62 Q24 -80 38 -66 Q22 -54 6 -62 Z" fill="#5fd06a" stroke-width="3.5" />
      <path d="M-22 -38 Q-20 -46 -12 -48" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1810 790)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="4" rx="90" ry="14" fill="#5a2a10" opacity="0.3" stroke="none" />
      <g class="school-plant">
        <g v-for="(l, i) in PLANT_LEAVES" :key="`pl${i}`" :transform="`translate(0 -90) rotate(${l.a}) scale(${l.s})`">
          <path d="M0 0 Q-8 -60 0 -150" stroke-width="6" fill="none" />
          <path d="M0 -60 Q-60 -110 0 -200 Q60 -110 0 -60 Z" :fill="i % 2 ? '#3f9a48' : '#5fc054'" stroke-width="4" />
          <path d="M0 -70 Q-4 -130 0 -190" stroke="#b6ec8a" stroke-width="3" fill="none" />
        </g>
      </g>
      <path d="M-56 -100 H56 L44 0 H-44 Z" fill="url(#school-pot)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-64" y="-112" width="128" height="22" rx="6" fill="#f08a5a" stroke-width="5" />
      <path d="M-48 -104 H20" stroke="#ffc0a0" stroke-width="4" stroke-linecap="round" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <g v-for="(d, i) in DESKS" :key="`dk${i}`">
        <ellipse :cx="d.mid" :cy="d.floor" :rx="d.w * 0.55" :ry="16" fill="#5a2a10" opacity="0.3" stroke="none" />
        <path :d="d.legs" stroke-width="16" stroke-linecap="round" />
        <path :d="d.legs" stroke="#7a8aa8" stroke-width="8" stroke-linecap="round" />
        <path :d="d.top" fill="url(#school-desk)" stroke-width="5" />
        <rect :x="d.xl" :y="d.yf" :width="d.w" height="20" rx="4" fill="url(#school-wood)" stroke-width="5" />
        <path :d="`M${d.xl + 20} ${d.yf - 8} H${d.xr - 60}`" stroke="#fff6e0" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>

    <g transform="translate(250 830)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-50 -2 L-30 -40 L50 -40 L40 -2 Z" fill="#fff" stroke-width="4" />
      <path d="M0 -40 L-6 -2" stroke-width="3" />
      <path d="M-30 -14 L-12 -14 M10 -28 L32 -28 M8 -16 L30 -16" stroke="#9ab0d8" stroke-width="3" />
      <path d="M70 -14 L150 -30" stroke-width="10" stroke-linecap="round" />
      <path d="M70 -14 L150 -30" stroke="#ffd23f" stroke-width="5" stroke-linecap="round" />
      <path d="M150 -30 L160 -32" stroke="#ff9ab0" stroke-width="6" stroke-linecap="round" />
    </g>
    <circle cx="520" cy="842" r="6" fill="#7a8aa8" stroke="#1b1033" stroke-width="3" />
    <g transform="translate(545 950)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-10 -96 Q-20 -112 -25 -108 M50 -96 Q30 -110 -25 -108" stroke-width="6" fill="none" />
      <path d="M-30 -2 Q-40 -96 20 -100 Q80 -96 70 -2 Q20 10 -30 -2 Z" fill="url(#school-pack)" stroke-width="5" />
      <path d="M-14 -40 H54 V-6 Q20 4 -14 -6 Z" fill="#ffd23f" stroke-width="4" />
      <path d="M-14 -40 H54" stroke-width="4" />
      <path d="M-18 -80 Q-12 -92 4 -94" stroke="#ffe0a0" stroke-width="5" fill="none" stroke-linecap="round" />
      <circle cx="20" cy="-58" r="6" fill="#fff" stroke-width="3" />
    </g>

    <g transform="translate(130 960)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-50 -4 L-30 -36 H70 L60 -4 Z" fill="#4a7ad8" stroke-width="4.5" />
      <path d="M-44 -12 L56 -12" stroke="#fff" stroke-width="3" opacity="0.7" />
      <path d="M-40 -28 L-24 -50 H76 L68 -28 Z" fill="#ff7a5a" stroke-width="4.5" />
      <path d="M120 -24 Q180 -40 230 -26 Q236 -6 220 0 Q170 4 120 -8 Z" fill="#b07aff" stroke-width="4.5" />
      <path d="M140 -20 Q170 -28 210 -22" stroke="#e0c8ff" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
    <g transform="translate(1720 970)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-80" y="-58" width="116" height="48" rx="12" fill="#ff5a5a" stroke-width="4.5" />
      <path d="M-80 -40 H36" stroke-width="3.5" />
      <path d="M-66 -50 H0" stroke="#ffb0a0" stroke-width="4" stroke-linecap="round" />
      <path d="M50 -10 L110 -40" stroke-width="12" stroke-linecap="round" />
      <path d="M50 -10 L110 -40" stroke="#5fd06a" stroke-width="6" stroke-linecap="round" />
      <rect x="120" y="-40" width="90" height="34" rx="6" fill="#fff" stroke-width="4" transform="rotate(-6 160 -24)" />
    </g>

    <g transform="translate(400 1040)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="20" cy="104" rx="120" ry="16" fill="#5a2a10" opacity="0.3" stroke="none" />
      <path d="M-50 -2 Q-70 -130 20 -134 Q110 -130 92 -2 Q20 14 -50 -2 Z" fill="url(#school-pack-b)" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-30 -40 Q20 -50 72 -40 L70 80 H-28 Z" fill="#3f6ad0" stroke-width="5" />
      <path d="M-30 -40 Q20 -30 72 -40" stroke-width="5" fill="none" />
      <path d="M-40 -100 Q-30 -122 0 -126" stroke="#b0d0ff" stroke-width="6" fill="none" stroke-linecap="round" />
      <circle cx="20" cy="-36" r="9" fill="#ffd23f" stroke-width="3.5" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-80 1140 V1000 Q-80 980 -60 980 H300 Q320 980 320 1000 V1140 Z M60 1030 H200 Q220 1030 220 1050 Q220 1068 200 1068 H60 Q40 1068 40 1050 Q40 1030 60 1030 Z" fill="#c0703a" fill-rule="evenodd" stroke-width="6" filter="url(#cel)" />
      <path d="M-60 1000 H300" stroke="#f0b07a" stroke-width="5" stroke-linecap="round" />
      <path d="M-40 1090 Q100 1084 280 1092" stroke="#8a4420" stroke-width="4" fill="none" opacity="0.6" />
      <path d="M1600 1140 V1010 Q1600 990 1620 990 H2000 V1140 Z M1720 1040 H1860 Q1880 1040 1880 1060 Q1880 1078 1860 1078 H1720 Q1700 1078 1700 1060 Q1700 1040 1720 1040 Z" fill="#c0703a" fill-rule="evenodd" stroke-width="6" filter="url(#cel)" />
      <path d="M1620 1010 H1980" stroke="#f0b07a" stroke-width="5" stroke-linecap="round" />
      <path d="M1620 1110 Q1780 1104 1980 1112" stroke="#8a4420" stroke-width="4" fill="none" opacity="0.6" />
    </g>

    <g class="school-shaft">
      <path d="M70 120 L265 120 L930 1140 L520 1140 Z M265 300 L460 300 L1180 1140 L880 1140 Z" fill="url(#school-shaft)" opacity="0.5" />
    </g>
    <g v-for="(g, i) in DUST" :key="`ds${i}`" class="school-dust" :style="{ animationDelay: `-${i * 2.3}s` }" fill="#fffbe0">
      <circle v-for="(s, j) in g" :key="j" :cx="s.x" :cy="s.y" :r="s.r" />
    </g>
  </g>
</template>

<style scoped>
.school-hand {
  animation: school-spin 60s linear infinite;
}

.school-tree {
  transform-origin: 180px 640px;
  animation: school-sway 5s ease-in-out infinite alternate;
}

.school-plant {
  transform-origin: 0 -90px;
  animation: school-sway 4s ease-in-out infinite alternate;
}

.school-shaft {
  animation: school-shaft 6s ease-in-out infinite alternate;
}

.school-dust {
  animation: school-dust 7s ease-in-out infinite alternate;
}

@keyframes school-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes school-sway {
  from {
    rotate: -1.2deg;
  }
  to {
    rotate: 1.2deg;
  }
}

@keyframes school-shaft {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}

@keyframes school-dust {
  0% {
    translate: 0 0;
    opacity: 0.2;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    translate: 24px -40px;
    opacity: 0.3;
  }
}
</style>
