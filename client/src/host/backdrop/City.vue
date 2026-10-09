<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(169);
const STARS = Array.from({ length: 80 }, () => ({
  x: rnd() * 1920,
  y: rnd() * 470,
  r: 0.8 + rnd() * 2.2,
}));
const CITY_SKY = twinkleGroups(STARS);

const FAR = (() => {
  const out: { x: number; w: number; top: number; spire: boolean }[] = [];
  for (let x = -60; x < 1980; ) {
    const w = 70 + rnd() * 90;
    // the middle stays low so the far line never fights the cards for attention
    const mid = Math.abs(x + w / 2 - 960) < 420;
    out.push({ x, w, top: (mid ? 600 : 470) + rnd() * 140, spire: rnd() < 0.25 });
    x += w + 4;
  }
  return out;
})();
const FAR_WINDOWS = FAR.map((b) => {
  let d = '';
  for (let y = b.top + 24; y < 900; y += 30) {
    for (let x = b.x + 12; x < b.x + b.w - 16; x += 22) if (rnd() < 0.3) d += `M${x.toFixed(0)} ${y.toFixed(0)}h7v10h-7z`;
  }
  return d;
}).join('');

type Roof = 'flat' | 'tank' | 'antenna' | 'deco' | 'dome';
const BUILDINGS: { x: number; w: number; top: number; roof: Roof; tone: number; shop?: string }[] = [
  { x: -60, w: 240, top: 430, roof: 'antenna', tone: 0, shop: '#ff4d6d' },
  { x: 186, w: 170, top: 590, roof: 'tank', tone: 2 },
  { x: 362, w: 210, top: 360, roof: 'deco', tone: 1, shop: '#2ed47a' },
  { x: 578, w: 160, top: 660, roof: 'flat', tone: 3 },
  { x: 744, w: 220, top: 720, roof: 'flat', tone: 0, shop: '#ffd23f' },
  { x: 970, w: 180, top: 690, roof: 'tank', tone: 2 },
  { x: 1156, w: 200, top: 740, roof: 'flat', tone: 3, shop: '#3fd0ff' },
  { x: 1362, w: 170, top: 560, roof: 'antenna', tone: 1 },
  { x: 1538, w: 230, top: 400, roof: 'dome', tone: 0, shop: '#ff8a3d' },
  { x: 1774, w: 266, top: 520, roof: 'flat', tone: 2 },
];
const BLOCKS = BUILDINGS.map((b) => {
  let lit = '';
  let dark = '';
  let glint = '';
  let tv = '';
  const blinks: { x: number; y: number }[] = [];
  const cols = Math.floor((b.w - 30) / 38);
  const x0 = b.x + (b.w - cols * 38 + 14) / 2;
  for (let y = b.top + 46; y < (b.shop ? 820 : 900); y += 52) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * 38;
      if (x < -40 || x > 1940) continue;
      const roll = rnd();
      if (roll < 0.05) blinks.push({ x, y });
      else if (roll < 0.1) tv += `M${x.toFixed(0)} ${y}h20v28h-20z`;
      else if (roll < 0.45) {
        lit += `M${x.toFixed(0)} ${y}h20v28h-20z`;
        glint += `M${(x + 4).toFixed(0)} ${y + 20}v-15h8`;
      } else dark += `M${x.toFixed(0)} ${y}h20v28h-20z`;
    }
  }
  return { ...b, lit, dark, glint, tv, blinks };
});
const ALL_BLINKS = BLOCKS.flatMap((w) => w.blinks);
const BLINKS = [0, 1].map((g) => ALL_BLINKS.filter((_, i) => i % 2 === g));
const LEDGES = BUILDINGS.map((b) => {
  let d = '';
  for (let y = b.top + 150; y < 860; y += 156) d += `M${b.x + 8} ${y}H${b.x + b.w - 8}`;
  return d;
}).join('');
const ANTENNAS = BUILDINGS.filter((b) => b.roof === 'antenna').map((b) => ({ x: b.x + b.w * 0.6, top: b.top - 30 }));

const CLOUDS = [
  { y: 150, k: 1.1, d: 10, s: 90 },
  { y: 300, k: 0.8, d: 55, s: 75 },
];
const CARS = [
  { c: '#ff4d6d', d: 0, s: 9, back: false },
  { c: '#ffd23f', d: 5, s: 11, back: false },
  { c: '#3fd0ff', d: 2, s: 10, back: true },
];
const LAMPS = [260, 1010, 1660];
const SCALLOP = (w: number) => {
  let d = `M${-w / 2 + 4} -40`;
  for (let x = -w / 2 + 4; x < w / 2 - 22; x += 18) d += ` a9 9 0 0 0 18 0`;
  return d;
};
</script>

<template>
  <g>
    <defs>
      <radialGradient id="city-moon" cx="38%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#fffbe6" />
        <stop offset="70%" stop-color="#ffe9a8" />
        <stop offset="100%" stop-color="#e8c47a" />
      </radialGradient>
      <linearGradient id="city-beam" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#fff6d0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#fff6d0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="city-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff7ab8" stop-opacity="0" />
        <stop offset="65%" stop-color="#ff7ab8" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#ff7ab8" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="city-b0" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#3d2f8c" />
        <stop offset="100%" stop-color="#231a5c" />
      </linearGradient>
      <linearGradient id="city-b1" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#5a3088" />
        <stop offset="100%" stop-color="#321a58" />
      </linearGradient>
      <linearGradient id="city-b2" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#2c4a8e" />
        <stop offset="100%" stop-color="#1a2a5e" />
      </linearGradient>
      <linearGradient id="city-b3" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#6e3470" />
        <stop offset="100%" stop-color="#3e1a48" />
      </linearGradient>
      <linearGradient id="city-road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a2150" />
        <stop offset="100%" stop-color="#120c2c" />
      </linearGradient>
      <linearGradient id="city-shop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe7a0" />
        <stop offset="100%" stop-color="#f0a050" />
      </linearGradient>
      <radialGradient id="city-pool">
        <stop offset="0%" stop-color="#ffd96b" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ffd96b" stop-opacity="0" />
      </radialGradient>
    </defs>

    <g v-for="(g, gi) in CITY_SKY" :key="`s${gi}`" class="twinkle" :style="{ animationDelay: `${gi * 0.75}s` }">
      <circle v-for="(s, i) in g" :key="i" :cx="s.x" :cy="s.y" :r="s.r" fill="#fff" />
    </g>
    <circle cx="1560" cy="190" r="190" fill="#fff4c2" opacity="0.08" />
    <circle cx="1560" cy="190" r="135" fill="#fff4c2" opacity="0.12" />
    <circle cx="1560" cy="190" r="92" fill="url(#city-moon)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <circle cx="1528" cy="170" r="17" fill="#e8c47a" stroke="#c49a5a" stroke-width="3" />
    <circle cx="1596" cy="226" r="12" fill="#e8c47a" stroke="#c49a5a" stroke-width="3" />
    <circle cx="1600" cy="160" r="7" fill="#e8c47a" />
    <path d="M1502 132 Q1520 112 1550 106" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.85" />

    <path d="M480 780 L380 -100 L590 -100 Z" fill="url(#city-beam)" class="search s1" />
    <path d="M1440 780 L1330 -100 L1540 -100 Z" fill="url(#city-beam)" class="search s2" />

    <g v-for="(c, i) in CLOUDS" :key="`cl${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-130 20 Q-150 -10 -100 -16 Q-90 -60 -30 -50 Q0 -90 60 -60 Q120 -70 120 -20 Q160 -10 140 20 Z" fill="#3a2f7a" stroke="#5a4a9e" stroke-width="3" stroke-linejoin="round" />
        <path d="M-120 14 Q0 30 132 14" stroke="#ff8ac0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.35" />
        <path d="M-80 -22 Q-60 -44 -30 -40" stroke="#8a7ad0" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
      </g>
    </g>

    <g class="plane">
      <path d="M-30 0 Q0 -8 34 -2 L40 2 Q0 8 -30 4 Z M-6 0 L-20 16 L-8 16 L8 2 Z M-26 -2 L-34 -14 L-26 -14 L-18 -2 Z" fill="#2a2058" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <circle cx="-14" cy="14" r="4" fill="#ff3b5c" />
      <circle cx="-30" cy="-12" r="3" fill="#fff" />
    </g>

    <g>
      <path
        v-for="(b, i) in FAR"
        :key="`f${i}`"
        :d="`M${b.x} 1000 V${b.top} H${b.x + b.w} V1000 Z${b.spire ? ` M${b.x + b.w / 2} ${b.top} V${b.top - 60}` : ''}`"
        fill="#4a3586"
        stroke="#7c62b8"
        stroke-width="3"
        stroke-linejoin="round"
      />
      <path :d="FAR_WINDOWS" fill="#ffc97a" opacity="0.4" />
    </g>
    <rect x="-60" y="560" width="2040" height="320" fill="url(#city-haze)" />

    <g v-for="(b, i) in BLOCKS" :key="`h${i}`">
      <g v-if="b.roof === 'deco'" :fill="`url(#city-b${b.tone})`" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
        <path :d="`M${b.x + b.w / 2} ${b.top - 290} L${b.x + b.w / 2 + 10} ${b.top - 150} H${b.x + b.w / 2 - 10} Z`" fill="#ffd96b" />
        <rect :x="b.x + 60" :y="b.top - 150" :width="b.w - 120" height="80" />
        <rect :x="b.x + 30" :y="b.top - 80" :width="b.w - 60" height="90" />
      </g>
      <g v-if="b.roof === 'dome'" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
        <rect :x="b.x + 40" :y="b.top - 70" :width="b.w - 80" height="80" :fill="`url(#city-b${b.tone})`" />
        <path :d="`M${b.x + 50} ${b.top - 70} Q${b.x + b.w / 2} ${b.top - 230} ${b.x + b.w - 50} ${b.top - 70} Z`" fill="#5ad0c8" />
        <path :d="`M${b.x + b.w / 2} ${b.top - 150} V${b.top - 200}`" fill="none" />
        <circle :cx="b.x + b.w / 2" :cy="b.top - 206" r="9" fill="#ffd96b" stroke-width="4" />
        <path :d="`M${b.x + 80} ${b.top - 110} Q${b.x + 96} ${b.top - 140} ${b.x + 120} ${b.top - 146}`" stroke="#c8fff6" stroke-width="6" fill="none" stroke-linecap="round" />
      </g>
      <g v-if="b.roof === 'tank'" :transform="`translate(${b.x + b.w * 0.55} ${b.top})`" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
        <path d="M-26 0 L-20 -40 M26 0 L20 -40 M-22 -14 L22 -30 M22 -14 L-22 -30" fill="none" />
        <rect x="-34" y="-110" width="68" height="72" rx="6" fill="#8a4a3a" filter="url(#cel-s)" />
        <path d="M-40 -108 L0 -146 L40 -108 Z" fill="#5a2f2a" />
        <path d="M-34 -86 H34 M-34 -62 H34" stroke="#5a2f2a" stroke-width="3" opacity="0.8" />
        <path d="M-26 -100 V-48" stroke="#c47a5a" stroke-width="4" opacity="0.7" stroke-linecap="round" />
      </g>
      <path v-if="b.roof === 'antenna'" :d="`M${b.x + b.w * 0.6} ${b.top} V${b.top - 30} M${b.x + b.w * 0.6 - 16} ${b.top - 8} L${b.x + b.w * 0.6} ${b.top - 30} L${b.x + b.w * 0.6 + 16} ${b.top - 8}`" stroke="#1b1033" stroke-width="5" fill="none" stroke-linejoin="round" />
      <rect :x="b.x" :y="b.top" :width="b.w" :height="1060 - b.top" :fill="`url(#city-b${b.tone})`" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
      <rect :x="b.x - 8" :y="b.top - 6" :width="b.w + 16" height="18" rx="3" fill="#5a4aa8" stroke="#1b1033" stroke-width="4" />
      <path :d="b.dark" fill="#1a1240" stroke="#120a30" stroke-width="2" />
      <path :d="b.lit" fill="#ffd96b" stroke="#1b1033" stroke-width="2" />
      <path :d="b.tv" fill="#7fe0ff" stroke="#1b1033" stroke-width="2" />
      <path :d="b.glint" stroke="#fff6cf" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.8" />
      <g v-if="b.shop" :transform="`translate(${b.x + b.w / 2} 900)`">
        <rect :x="-b.w / 2 + 22" y="-30" :width="b.w - 44" height="52" fill="url(#city-shop)" stroke="#1b1033" stroke-width="4" />
        <path :d="`M${-b.w / 2 + 40} 22 V0 H${-b.w / 2 + 90} V22 M${b.w / 2 - 70} 22 V-8 H${b.w / 2 - 40} V22`" fill="#c46a3a" opacity="0.55" />
        <path :d="`M${-b.w / 2 + 34} -20 L${-b.w / 2 + 50} -6`" stroke="#fff" stroke-width="5" opacity="0.7" stroke-linecap="round" />
        <path :d="`M${-b.w / 2 + 14} -68 H${b.w / 2 - 14} L${b.w / 2 - 4} -40 H${-b.w / 2 + 4} Z`" :fill="b.shop" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path :d="`M${-b.w / 2 + 14} -54 H${b.w / 2 - 14}`" stroke="#fff" stroke-width="26" stroke-dasharray="18 18" opacity="0.55" />
        <path :d="SCALLOP(b.w)" :fill="b.shop" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      </g>
    </g>
    <path :d="LEDGES" stroke="#120a30" stroke-width="5" opacity="0.35" />
    <path v-for="(a, i) in ANTENNAS" :key="`at${i}`" :d="`M${a.x} ${a.top} V${a.top - 150}`" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
    <g class="blinker">
      <circle v-for="(a, i) in ANTENNAS" :key="`ab${i}`" :cx="a.x" :cy="a.top - 156" r="9" fill="#ff3b5c" stroke="#1b1033" stroke-width="3" />
    </g>
    <g v-for="(g, gi) in BLINKS" :key="`bw${gi}`" class="blinky" :style="{ animationDuration: `${3 + gi * 1.7}s` }">
      <rect v-for="(w, i) in g" :key="i" :x="w.x" :y="w.y" width="20" height="28" fill="#ffd96b" stroke="#1b1033" stroke-width="2" />
    </g>

    <g transform="translate(150 700)">
      <path d="M0 -150 V140" stroke="#1b1033" stroke-width="6" />
      <rect x="6" y="-140" width="70" height="200" rx="10" fill="#241a4a" stroke="#1b1033" stroke-width="5" />
      <g class="city-neon">
        <path d="M41 -64 C16 -84 16 -112 34 -112 C40 -112 41 -106 41 -102 C41 -106 42 -112 48 -112 C66 -112 66 -84 41 -64 Z" fill="none" stroke="#ff4fa3" stroke-width="13" opacity="0.3" stroke-linejoin="round" />
        <path d="M41 -64 C16 -84 16 -112 34 -112 C40 -112 41 -106 41 -102 C41 -106 42 -112 48 -112 C66 -112 66 -84 41 -64 Z" fill="none" stroke="#ffb3da" stroke-width="5" stroke-linejoin="round" />
        <path d="M41 -40 L47 -22 L66 -22 L51 -10 L57 8 L41 -3 L25 8 L31 -10 L16 -22 L35 -22 Z" fill="none" stroke="#3fe6ff" stroke-width="12" opacity="0.3" stroke-linejoin="round" />
        <path d="M41 -40 L47 -22 L66 -22 L51 -10 L57 8 L41 -3 L25 8 L31 -10 L16 -22 L35 -22 Z" fill="none" stroke="#c4f8ff" stroke-width="4.5" stroke-linejoin="round" />
      </g>
    </g>

    <path d="M-60 950 H1980 V1140 H-60 Z" fill="#3a3070" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M60 966 V990 M260 966 V990 M460 966 V990 M660 966 V990 M860 966 V990 M1060 966 V990 M1260 966 V990 M1460 966 V990 M1660 966 V990 M1860 966 V990" stroke="#241a52" stroke-width="3" opacity="0.7" />
    <path d="M-60 990 H1980 V1140 H-60 Z" fill="url(#city-road)" stroke="#1b1033" stroke-width="5" />
    <path d="M-60 997 H1980" stroke="#6a5aa8" stroke-width="4" opacity="0.5" />
    <path d="M0 1032 h70 M170 1032 h70 M340 1032 h70 M510 1032 h70 M680 1032 h70 M850 1032 h70 M1020 1032 h70 M1190 1032 h70 M1360 1032 h70 M1530 1032 h70 M1700 1032 h70 M1870 1032 h70" stroke="#ffd96b" stroke-width="6" stroke-linecap="round" opacity="0.55" />

    <g v-for="x in LAMPS" :key="`lp${x}`" :transform="`translate(${x} 960)`">
      <ellipse cx="0" cy="40" rx="150" ry="34" fill="url(#city-pool)" />
      <circle cx="31" cy="-205" r="38" fill="#ffd96b" opacity="0.12" />
      <circle cx="31" cy="-205" r="20" fill="#ffe7a0" opacity="0.3" />
      <ellipse cx="0" cy="6" rx="26" ry="6" fill="#0a0620" opacity="0.4" />
      <path d="M0 0 V-200 Q0 -222 26 -222" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round" />
      <path d="M0 0 V-200 Q0 -222 26 -222" stroke="#4a3c86" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M12 -222 H50 L44 -208 H18 Z" fill="#2a2058" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <ellipse cx="31" cy="-205" rx="11" ry="6" fill="#fff4c2" />
      <rect x="-10" y="-12" width="20" height="12" rx="3" fill="#2a2058" stroke="#1b1033" stroke-width="3" />
    </g>

    <g v-for="(c, i) in CARS" :key="`car${i}`" class="car" :class="{ back: c.back }" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="c.back ? 'translate(0 1016) scale(-0.8 0.8)' : 'translate(0 1060)'">
        <path d="M60 -22 L220 -6 L220 10 L60 6 Z" fill="#fff59b" opacity="0.22" />
        <ellipse cx="0" cy="12" rx="70" ry="8" fill="#05020f" opacity="0.4" />
        <path d="M-64 6 V-18 Q-62 -30 -40 -32 L-24 -56 Q-18 -62 -6 -62 H22 Q32 -62 38 -54 L52 -32 Q66 -30 66 -16 V6 Z" :fill="c.c" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M-18 -52 H6 V-34 H-30 Z M14 -52 H30 L40 -34 H14 Z" fill="#9ae6ff" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M-56 -14 Q-50 -26 -36 -28" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
        <path d="M-64 -4 H66" stroke="#1b1033" stroke-width="3" opacity="0.35" />
        <rect x="56" y="-24" width="12" height="9" rx="3" fill="#fff59b" stroke="#1b1033" stroke-width="2.5" />
        <rect x="-68" y="-22" width="9" height="9" rx="2" fill="#ff3b5c" stroke="#1b1033" stroke-width="2.5" />
        <circle cx="-34" cy="6" r="15" fill="#1b1033" />
        <circle cx="38" cy="6" r="15" fill="#1b1033" />
        <circle cx="-34" cy="6" r="6" fill="#8a84b0" />
        <circle cx="38" cy="6" r="6" fill="#8a84b0" />
      </g>
    </g>

    <g fill="#0f0a28" stroke="#05020f" stroke-width="5" stroke-linejoin="round">
      <path d="M40 1140 L52 980 H188 L200 1140 Z" />
      <path d="M30 980 H210 V958 H30 Z" />
      <path d="M90 958 Q86 900 110 880 Q100 850 118 836 L124 852 L138 852 L144 836 Q160 852 150 880 Q172 900 166 958 Z" />
      <path d="M166 950 Q230 940 222 880 Q218 860 236 856" fill="none" stroke-width="10" stroke-linecap="round" />
      <path d="M-60 1140 V1010 Q-60 990 -40 990 H20 Q40 990 40 1010 V1140 Z" />
      <path d="M1880 1140 V600" fill="none" stroke-width="26" />
      <rect x="1820" y="590" width="90" height="200" rx="16" />
      <circle cx="1865" cy="634" r="20" fill="#3a1020" />
      <circle cx="1865" cy="690" r="20" fill="#3a2a10" />
      <circle cx="1865" cy="746" r="20" fill="#2ed47a" />
      <path d="M1640 1140 Q1630 1030 1700 1010 Q1740 970 1790 1000 Q1860 990 1870 1060 Q1940 1060 1980 1100 V1140 Z" />
    </g>
    <path d="M58 990 L48 1130 M36 970 H200 M100 950 Q96 900 116 884 M1830 600 V770" stroke="#3a2f7a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
    <path d="M1650 1120 Q1648 1040 1704 1022 Q1740 990 1786 1012" stroke="#2a3f6a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
    <circle cx="124" cy="866" r="3.5" fill="#ffd96b" />
    <circle cx="140" cy="866" r="3.5" fill="#ffd96b" />
    <circle cx="1865" cy="746" r="40" fill="#2ed47a" opacity="0.22" />
    <path d="M1854 736 Q1858 730 1868 729" stroke="#c8ffe0" stroke-width="4" fill="none" stroke-linecap="round" />
  </g>
</template>

<style scoped>
.city-neon {
  animation: city-buzz 5s steps(1) infinite;
}

@keyframes city-buzz {
  0%,
  70%,
  76%,
  100% {
    opacity: 1;
  }
  72%,
  78% {
    opacity: 0.35;
  }
}
</style>
