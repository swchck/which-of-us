<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(316);
const f1 = (n: number) => n.toFixed(1);
const circle = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;

interface Isle {
  cx: number;
  top: number;
  w: number;
  depth: number;
}

// rocky cone hanging under the turf: a jagged contour down each side to an off-centre tip
const island = ({ cx, top, w, depth }: Isle) => {
  const hw = w / 2;
  const tipX = cx + w * 0.06;
  const n = 7;
  const edge = (side: number): [number, number][] =>
    Array.from({ length: n - 1 }, (_, k) => {
      const t = (k + 1) / n;
      const jag = (k % 2 ? 1 : -1) * hw * (0.04 + rnd() * 0.06);
      return [cx + (tipX - cx) * t + side * (hw * (1 - t) ** 0.7 + jag), top + 10 + (depth - 10) * t ** 1.15];
    });
  const left = edge(-1);
  const right = edge(1).reverse();
  const at = (pts: [number, number][], i: number) => pts[i] ?? [cx, top];
  const rock = `M${cx - hw} ${top + 10} ${left.map(([x, y]) => `L${f1(x)} ${f1(y)}`).join(' ')} L${f1(tipX)} ${top + depth} ${right.map(([x, y]) => `L${f1(x)} ${f1(y)}`).join(' ')} L${cx + hw} ${top + 10} Z`;
  const strata = [0.22, 0.42, 0.62]
    .map((t) => {
      const half = hw * (1 - t) ** 0.7;
      const y = top + 10 + (depth - 10) * t ** 1.15;
      const a = cx - half * (0.75 - rnd() * 0.15);
      const b = cx + half * (0.1 + rnd() * 0.5);
      return `M${f1(a)} ${f1(y)} L${f1((a + b) / 2)} ${f1(y + 6)} L${f1(b)} ${f1(y - 2)}`;
    })
    .join(' ');
  const cracks = [at(left, 1), at(right, 2), at(left, 3)].map(([x, y]) => `M${f1(x)} ${f1(y)} l${f1((cx - x) * 0.18)} ${f1(14 + rnd() * 10)}`).join(' ');
  const scallops = Math.max(3, Math.round(w / 64));
  const step = (w + 24) / scallops;
  let lip = '';
  for (let i = scallops - 1; i >= 0; i--) {
    const x = cx - hw - 12 + i * step;
    lip += ` Q${f1(x + step / 2)} ${f1(top + 30 + rnd() * 12)} ${f1(x)} ${top + 16}`;
  }
  const turf = `M${cx - hw - 12} ${top + 16} Q${cx - hw} ${top - 22} ${f1(cx - hw * 0.5)} ${top - 26} Q${cx} ${top - 34} ${f1(cx + hw * 0.5)} ${top - 24} Q${cx + hw} ${top - 20} ${cx + hw + 12} ${top + 16}${lip} Z`;
  const rim = `M${f1(cx - hw + 10)} ${top - 4} Q${f1(cx - hw * 0.7)} ${top - 24} ${f1(cx - hw * 0.25)} ${top - 28}`;
  const roots = [at(left, 0), at(left, 2), at(right, 1), at(right, 3), at(left, 4)]
    .map(([x, y], i) => {
      const len = 60 + rnd() * 70;
      const sway = (i % 2 ? 1 : -1) * (10 + rnd() * 12);
      return `M${f1(x)} ${f1(y - 6)} q${f1(sway)} ${f1(len * 0.4)} 0 ${f1(len * 0.7)} t${f1(-sway * 0.4)} ${f1(len * 0.3)}`;
    })
    .join(' ');
  return { rock, strata, cracks, turf, rim, roots, grass: tufts(cx - hw + 40, top - 22, cx + hw - 30, 0.02) };
};

const ISLE_A = island({ cx: 330, top: 600, w: 760, depth: 320 });
const ISLE_B = island({ cx: 1110, top: 690, w: 220, depth: 150 });
const ISLE_C = island({ cx: 1690, top: 640, w: 640, depth: 290 });
const FAR_ISLES = [
  { cx: 790, top: 480, w: 170, depth: 110 },
  { cx: 1300, top: 430, w: 120, depth: 80 },
].map((i) => ({ ...i, ...island(i) }));

const puffs = (cx: number, cy: number, n: number, spread: number, r: number) =>
  Array.from({ length: n }, () => circle(cx + (rnd() - 0.5) * spread * 2, cy + (rnd() - 0.5) * spread, r * (0.6 + rnd() * 0.6))).join(' ');
const tree = (x: number, y: number, r: number) => ({
  x,
  y,
  r,
  deep: puffs(x + r * 0.15, y - r * 1.55, 6, r * 0.8, r * 0.6),
  mid: puffs(x - r * 0.05, y - r * 1.7, 6, r * 0.75, r * 0.5),
  light: puffs(x - r * 0.3, y - r * 1.95, 3, r * 0.4, r * 0.28),
});
const TREES = [tree(150, 584, 70), tree(1100, 666, 44), tree(1450, 618, 50), tree(660, 590, 40)];

// a bank of merged puffs plus a solid floor; the white top is the same puffs shrunk towards
// the upper-left, so a lavender crescent is left bottom-right as the shading
const cloudBank = (base: number, rMin: number, rMax: number) => {
  // floor wound the same way as the arcs, or nonzero fill punches holes where they overlap
  let outer = `M-260 ${base} V1160 H2180 V${base} Z`;
  let inner = `M-260 ${base + 10} V1160 H2180 V${base + 10} Z`;
  for (let x = -240; x < 2180; x += rMin * 1.3 + rnd() * rMin) {
    const r = rMin + rnd() * (rMax - rMin);
    const y = base + (rnd() - 0.3) * r * 0.6;
    outer += ' ' + circle(x, y, r);
    inner += ' ' + circle(x - r * 0.1, y - r * 0.12, r * 0.8);
  }
  return { outer, inner };
};
const CLOUD_FAR = cloudBank(800, 40, 80);
const CLOUD_MID = cloudBank(890, 60, 110);
const CLOUD_NEAR = cloudBank(1010, 80, 140);
const CIRRUS = 'M260 400 H520 M330 430 H640 M1180 360 H1460 M1250 390 H1600 M860 300 H1080';

const RAINBOW = ['#ff9aa8', '#ffc48a', '#fff09a', '#a8eaa0', '#9ad4ff', '#c4a8ff'];

const BLADE_ANGLES = [0, 90, 180, 270];
const LATTICE = 'M10 -50 H44 M10 -76 H44 M10 -102 H44 M10 -128 H44 M27 -36 V-146';

const BIRDS = [
  { x: 0, y: 0, k: 1, d: 0 },
  { x: -70, y: 26, k: 0.8, d: 0.12 },
  { x: -120, y: -18, k: 0.7, d: 0.24 },
];
const BALLOON_NEAR = { x: 210, y: 300, k: 0.9, a: '#ff7a8a', b: '#ffe07a', s: 7 };
const BALLOON_FAR = { x: 990, y: 560, k: 0.42, a: '#8ad0ff', d: 3, s: 9 };
const GORES = 'M0 -96 C-30 -90 -34 -20 -22 40 L-10 74 M0 -96 C30 -90 34 -20 22 40 L10 74';

const FALL_STREAKS = (x: number, y0: number, y1: number) =>
  [-12, -2, 9, 18].map((dx, i) => `M${x + dx} ${y0 - 60 - i * 17} V${y1}`).join(' ');

const bush = (x: number, y: number, s: number) => {
  const deep = puffs(x + s * 0.1, y, 7, s, s * 0.55);
  const mid = puffs(x - s * 0.05, y - s * 0.1, 6, s * 0.9, s * 0.45);
  return { all: `${deep} ${mid}`, deep, mid, light: puffs(x - s * 0.25, y - s * 0.3, 3, s * 0.5, s * 0.25) };
};
const BUSHES = [bush(10, 960, 110), bush(1950, 990, 100)];
const SHEEP_WOOL = [circle(-18, -30, 18), circle(0, -36, 20), circle(18, -30, 18), circle(-8, -18, 18), circle(12, -18, 18)].join(' ');

const FLOWERS = [
  { x: 70, y: 952, c: '#ff7aa8' },
  { x: 180, y: 940, c: '#ffd84a' },
  { x: 300, y: 948, c: '#fffaf0' },
  { x: 1760, y: 968, c: '#ff9a4a' },
  { x: 1890, y: 958, c: '#ff7aa8' },
];
const PETALS = [0, 72, 144, 216, 288];
const BOWS = [
  { x: -18, y: 50 },
  { x: 14, y: 100 },
  { x: -10, y: 150 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="skyis-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7ec8ff" />
        <stop offset="50%" stop-color="#c4e8ff" />
        <stop offset="80%" stop-color="#ffe6f2" />
        <stop offset="100%" stop-color="#fff2e0" />
      </linearGradient>
      <linearGradient id="skyis-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6fb" stop-opacity="0" />
        <stop offset="60%" stop-color="#fff6fb" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fff6fb" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="skyis-turf" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#c4f27e" />
        <stop offset="100%" stop-color="#58b856" />
      </linearGradient>
      <linearGradient id="skyis-turf-near" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#6ccf5a" />
        <stop offset="100%" stop-color="#2a7a44" />
      </linearGradient>
      <linearGradient id="skyis-rock" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stop-color="#f2c4a8" />
        <stop offset="55%" stop-color="#c88a86" />
        <stop offset="100%" stop-color="#8a5a7a" />
      </linearGradient>
      <linearGradient id="skyis-rock-near" x1="0" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stop-color="#a86a6a" />
        <stop offset="100%" stop-color="#4a2a4a" />
      </linearGradient>
      <linearGradient id="skyis-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f4e0ea" />
        <stop offset="100%" stop-color="#d8cce8" />
      </linearGradient>
      <linearGradient id="skyis-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c8f4ff" />
        <stop offset="100%" stop-color="#6ac4f0" />
      </linearGradient>
      <linearGradient id="skyis-envelope" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stop-color="#ffc0d0" />
        <stop offset="100%" stop-color="#e05a7a" />
      </linearGradient>
      <linearGradient id="skyis-cream" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fffaf0" />
        <stop offset="100%" stop-color="#e8c8a8" />
      </linearGradient>
      <linearGradient id="skyis-roof" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stop-color="#ff8a6a" />
        <stop offset="100%" stop-color="#c8384a" />
      </linearGradient>
      <linearGradient id="skyis-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d89a5a" />
        <stop offset="100%" stop-color="#8a5030" />
      </linearGradient>
      <clipPath id="skyis-fall-a">
        <path d="M586 604 Q580 760 568 900 H632 Q620 760 614 604 Z" />
      </clipPath>
      <clipPath id="skyis-fall-c">
        <path d="M1586 650 Q1580 780 1570 910 H1630 Q1620 780 1614 650 Z" />
      </clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#skyis-sky)" />

    <circle cx="1780" cy="140" r="220" fill="#fff6c8" opacity="0.22" />
    <circle cx="1780" cy="140" r="130" fill="#fff6c8" opacity="0.4" />
    <circle cx="1780" cy="140" r="78" fill="#fff4b0" stroke="#f0b860" stroke-width="4" />
    <path d="M1740 112 Q1756 92 1786 88" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.85" />

    <g fill="none" opacity="0.5">
      <circle v-for="(c, i) in RAINBOW" :key="c" cx="900" cy="860" :r="560 - i * 20" :stroke="c" stroke-width="21" />
    </g>
    <path :d="CIRRUS" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.55" />

    <g v-for="(f, i) in FAR_ISLES" :key="`fi${i}`" stroke="#b0a4d4" stroke-width="3" stroke-linejoin="round">
      <path :d="f.rock" fill="url(#skyis-far)" />
      <path :d="f.strata" fill="none" opacity="0.6" />
      <path :d="f.turf" fill="#d4ecc4" />
      <path :d="circle(f.cx - f.w * 0.15, f.top - 48, 18)" fill="#c4e2b8" />
    </g>

    <g class="skyis-bob" :style="{ animationDuration: `${BALLOON_FAR.s}s`, animationDelay: `-${BALLOON_FAR.d}s` }">
      <g :transform="`translate(${BALLOON_FAR.x} ${BALLOON_FAR.y}) scale(${BALLOON_FAR.k})`" stroke="#9a8ac4" stroke-width="5" stroke-linejoin="round">
        <path d="M0 -96 C64 -96 84 -40 72 2 C62 40 22 60 14 74 L-14 74 C-22 60 -62 40 -72 2 C-84 -40 -64 -96 0 -96 Z" :fill="BALLOON_FAR.a" />
        <path :d="GORES" fill="none" />
        <rect x="-16" y="96" width="32" height="26" rx="4" fill="#e8c8a8" />
        <path d="M-12 74 L-14 96 M12 74 L14 96" />
      </g>
    </g>

    <g class="skyis-drift" style="animation-duration: 26s">
      <path :d="CLOUD_FAR.outer" fill="#d8d0f2" stroke="#b4a8dc" stroke-width="6" />
      <path :d="CLOUD_FAR.outer" fill="#ddd4f4" />
      <path :d="CLOUD_FAR.inner" fill="#f8f4ff" />
    </g>
    <rect x="-60" y="420" width="2040" height="420" fill="url(#skyis-haze)" />

    <g class="gull" style="animation-duration: 46s; animation-delay: -30s">
      <g transform="translate(0 340)">
        <g v-for="(b, i) in BIRDS" :key="`b${i}`" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`">
          <path d="M-36 -4 Q-18 -26 0 0 Q18 -26 36 -4" fill="none" stroke="#3a2a5a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" class="flap" :style="{ animationDelay: `-${b.d}s` }" />
          <ellipse cx="0" cy="2" rx="9" ry="6" fill="#fffaf0" stroke="#3a2a5a" stroke-width="4" />
        </g>
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <path :d="ISLE_B.rock" fill="url(#skyis-rock)" stroke-width="4" filter="url(#cel)" />
      <path :d="ISLE_B.strata" fill="none" stroke="#7a4a5a" stroke-width="3" opacity="0.5" />
      <path :d="ISLE_B.roots" fill="none" stroke="#6b4a3a" stroke-width="3.5" />
      <path :d="ISLE_B.turf" fill="url(#skyis-turf)" stroke-width="4" filter="url(#cel-s)" />
      <path :d="ISLE_B.rim" fill="none" stroke="#eaffc0" stroke-width="5" opacity="0.8" />
    </g>

    <g stroke="#1b1033" stroke-linecap="round">
      <path d="M1205 692 Q1290 734 1372 646" fill="none" stroke-width="13" />
      <path d="M1205 692 Q1290 734 1372 646" fill="none" stroke="#c88a50" stroke-width="7" stroke-dasharray="10 5" stroke-linecap="butt" />
      <path d="M1210 650 Q1290 700 1370 600 M1212 699 L1214 700 M1232 702 V672 M1254 709 V681 M1276 711 V686 M1298 712 V686 M1320 703 V676 M1342 688 V658" fill="none" stroke="#7a5030" stroke-width="3" />
      <path d="M1210 702 V640 M1370 654 V594" stroke-width="12" />
      <path d="M1210 702 V640 M1370 654 V594" stroke="#b07440" stroke-width="6" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <path :d="ISLE_C.rock" fill="url(#skyis-rock)" stroke-width="5" filter="url(#cel)" />
      <path :d="ISLE_C.strata" fill="none" stroke="#7a4a5a" stroke-width="4" opacity="0.5" />
      <path :d="ISLE_C.cracks" fill="none" stroke="#7a4a5a" stroke-width="4" opacity="0.5" />
      <path :d="ISLE_C.roots" fill="none" stroke="#6b4a3a" stroke-width="4" />
      <path d="M1586 650 Q1580 780 1570 910 H1630 Q1620 780 1614 650 Z" fill="url(#skyis-water)" stroke-width="4" />
      <g clip-path="url(#skyis-fall-c)">
        <path class="skyis-flow" :d="FALL_STREAKS(1600, 650, 920)" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="26 34" opacity="0.85" />
      </g>
      <path :d="ISLE_C.turf" fill="url(#skyis-turf)" stroke-width="5" filter="url(#cel)" />
      <path :d="ISLE_C.rim" fill="none" stroke="#eaffc0" stroke-width="6" opacity="0.8" />
      <ellipse cx="1600" cy="640" rx="40" ry="9" fill="#9ae0ff" stroke-width="4" />
      <path :d="ISLE_C.grass" fill="none" stroke="#3f9a40" stroke-width="4" opacity="0.7" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <path :d="ISLE_A.rock" fill="url(#skyis-rock)" stroke-width="5" filter="url(#cel)" />
      <path :d="ISLE_A.strata" fill="none" stroke="#7a4a5a" stroke-width="4" opacity="0.5" />
      <path :d="ISLE_A.cracks" fill="none" stroke="#7a4a5a" stroke-width="4" opacity="0.5" />
      <path :d="ISLE_A.roots" fill="none" stroke="#6b4a3a" stroke-width="4" />
      <path d="M586 604 Q580 760 568 900 H632 Q620 760 614 604 Z" fill="url(#skyis-water)" stroke-width="4" />
      <g clip-path="url(#skyis-fall-a)">
        <path class="skyis-flow" :d="FALL_STREAKS(600, 604, 910)" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="26 34" opacity="0.85" />
      </g>
      <path :d="ISLE_A.turf" fill="url(#skyis-turf)" stroke-width="5" filter="url(#cel)" />
      <path :d="ISLE_A.rim" fill="none" stroke="#eaffc0" stroke-width="6" opacity="0.8" />
      <ellipse cx="600" cy="592" rx="44" ry="10" fill="#9ae0ff" stroke-width="4" />
      <path :d="ISLE_A.grass" fill="none" stroke="#3f9a40" stroke-width="4" opacity="0.7" />
    </g>

    <g v-for="(t, i) in TREES" :key="`t${i}`" stroke-linejoin="round" stroke-linecap="round">
      <ellipse :cx="t.x" :cy="t.y + 4" :rx="t.r * 0.9" :ry="t.r * 0.14" fill="#1b2a10" opacity="0.3" />
      <path :d="`M${t.x - t.r * 0.14} ${t.y} Q${t.x} ${t.y - t.r} ${t.x - t.r * 0.08} ${t.y - t.r * 1.4} L${t.x + t.r * 0.1} ${t.y - t.r * 1.4} Q${t.x + t.r * 0.1} ${t.y - t.r * 0.8} ${t.x + t.r * 0.16} ${t.y} Z`" fill="url(#skyis-wood)" stroke="#1b1033" stroke-width="4" />
      <path :d="`${t.deep} ${t.mid}`" fill="#3a9a4a" stroke="#1b1033" stroke-width="10" />
      <path :d="t.deep" fill="#3a9a4a" />
      <path :d="t.mid" fill="#6ccc5a" />
      <path :d="t.light" fill="#a8ec7a" />
    </g>

    <g transform="translate(300 584)" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="0" cy="2" rx="40" ry="7" fill="#1b2a10" opacity="0.3" stroke="none" />
      <path d="M-16 -10 V2 M-4 -10 V2 M10 -10 V2 M20 -10 V2" stroke-width="6" />
      <path :d="SHEEP_WOOL" fill="#fff" stroke-width="9" />
      <path :d="SHEEP_WOOL" fill="#fffaf4" stroke="none" />
      <path d="M-20 -40 Q-10 -48 4 -48" fill="none" stroke="#e8dcf0" stroke-width="4" />
      <ellipse cx="34" cy="-30" rx="12" ry="15" fill="#3a2a4a" stroke-width="4" />
      <ellipse cx="28" cy="-42" rx="7" ry="4" fill="#3a2a4a" stroke-width="3" transform="rotate(-30 28 -42)" />
      <circle cx="38" cy="-32" r="3" fill="#fff" stroke="none" />
      <ellipse cx="40" cy="-24" rx="4" ry="2.5" fill="#ff8aa8" stroke="none" opacity="0.8" />
    </g>

    <g transform="translate(470 580)" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="0" cy="2" rx="80" ry="12" fill="#1b2a10" opacity="0.3" stroke="none" />
      <path d="M-50 0 L-32 -172 H32 L50 0 Z" fill="url(#skyis-cream)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-44 -40 H44 M-40 -82 H40 M-36 -126 H36" fill="none" stroke="#c8a888" stroke-width="3" opacity="0.7" />
      <path d="M-16 0 V-40 Q0 -56 16 -40 V0 Z" fill="#8a5030" stroke-width="4" />
      <circle cx="0" cy="-104" r="13" fill="#9ad8ff" stroke-width="4" />
      <path d="M-5 -110 Q0 -114 5 -110" fill="none" stroke="#fff" stroke-width="3" />
      <path d="M-44 -168 Q-40 -232 0 -238 Q40 -232 44 -168 Z" fill="url(#skyis-roof)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-26 -190 Q-18 -218 4 -224" fill="none" stroke="#ffc0a8" stroke-width="5" opacity="0.8" />
      <g transform="translate(0 -184)">
        <g class="skyis-spin">
          <g v-for="a in BLADE_ANGLES" :key="a" :transform="`rotate(${a})`">
            <path d="M-4 -14 V-160" stroke-width="10" />
            <path d="M-4 -14 V-160" stroke="#a87040" stroke-width="5" />
            <rect x="6" y="-152" width="44" height="122" rx="3" fill="#fff4e4" stroke-width="4" />
            <path :d="LATTICE" fill="none" stroke="#c89a70" stroke-width="3" />
          </g>
        </g>
        <circle r="14" fill="#ffd84a" stroke-width="5" />
      </g>
    </g>

    <g transform="translate(1750 618)" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="0" cy="2" rx="96" ry="12" fill="#1b2a10" opacity="0.3" stroke="none" />
      <rect x="44" y="-174" width="24" height="60" fill="#c87a5a" stroke-width="4" />
      <rect x="40" y="-182" width="32" height="12" rx="3" fill="#a85a4a" stroke-width="4" />
      <path d="M-64 0 V-100 H64 V0 Z" fill="url(#skyis-cream)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-84 -94 Q-40 -150 0 -178 Q40 -150 84 -94 Q60 -86 0 -88 Q-60 -86 -84 -94 Z" fill="url(#skyis-roof)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-60 -104 Q-30 -140 -4 -160" fill="none" stroke="#ffc0a8" stroke-width="5" opacity="0.8" />
      <path d="M-30 -124 l14 -4 M10 -136 l14 4 M30 -112 l14 4 M-50 -104 l12 -4" fill="none" stroke="#8a2a3a" stroke-width="3" opacity="0.6" />
      <path d="M8 0 V-56 Q26 -74 44 -56 V0 Z" fill="#5aa0e0" stroke-width="4" />
      <circle cx="36" cy="-28" r="3" fill="#ffd84a" stroke="none" />
      <rect x="-48" y="-68" width="36" height="34" rx="4" fill="#ffe8a0" stroke-width="4" />
      <path d="M-30 -68 V-34 M-48 -51 H-12" fill="none" stroke-width="3" />
      <rect x="-52" y="-34" width="44" height="12" rx="3" fill="#a8603a" stroke-width="3" />
      <circle cx="-42" cy="-38" r="5" fill="#ff7aa8" stroke-width="2" />
      <circle cx="-28" cy="-38" r="5" fill="#ffd84a" stroke-width="2" />
      <circle cx="-16" cy="-38" r="5" fill="#ff7aa8" stroke-width="2" />
      <circle cx="0" cy="-130" r="12" fill="#ffe8a0" stroke-width="4" />
    </g>

    <g class="skyis-bob" style="animation-duration: 7s; animation-delay: -2s">
      <g transform="translate(1570 372)" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
        <path d="M-60 54 L-46 90 M60 52 L42 90 M0 62 V90" fill="none" stroke-width="3" />
        <path d="M120 -8 L176 -52 L184 -40 L150 0 Z M120 8 L176 52 L184 40 L150 0 Z" fill="#ffd84a" stroke-width="4" />
        <ellipse cx="0" cy="0" rx="156" ry="64" fill="url(#skyis-envelope)" stroke-width="5" />
        <path d="M-80 -54 Q-96 0 -80 54 M0 -64 Q-12 0 0 64 M80 -54 Q66 0 80 54" fill="none" stroke="#fff0e0" stroke-width="10" opacity="0.7" />
        <path d="M-80 -54 Q-96 0 -80 54 M0 -64 Q-12 0 0 64 M80 -54 Q66 0 80 54" fill="none" stroke-width="2.5" opacity="0.4" />
        <path d="M-110 -30 Q-80 -54 -30 -58" fill="none" stroke="#fff" stroke-width="9" opacity="0.8" />
        <path d="M-60 88 H60 Q66 88 62 100 L54 116 H-54 L-62 100 Q-66 88 -60 88 Z" fill="url(#skyis-wood)" stroke-width="5" />
        <circle cx="-30" cy="101" r="7" fill="#c8f0ff" stroke-width="3" />
        <circle cx="-6" cy="101" r="7" fill="#c8f0ff" stroke-width="3" />
        <circle cx="18" cy="101" r="7" fill="#c8f0ff" stroke-width="3" />
        <path d="M60 102 H78" stroke-width="5" />
        <g transform="translate(82 102)">
          <g class="skyis-prop">
            <ellipse cx="0" cy="0" rx="6" ry="30" fill="#ffe8c0" stroke-width="3" />
          </g>
          <circle r="6" fill="#ffd84a" stroke-width="3" />
        </g>
        <path d="M-156 0 L-176 -6 L-176 6 Z" fill="#ffd84a" stroke-width="3" />
      </g>
    </g>

    <g class="skyis-bob" :style="{ animationDuration: `${BALLOON_NEAR.s}s` }">
      <g :transform="`translate(${BALLOON_NEAR.x} ${BALLOON_NEAR.y}) scale(${BALLOON_NEAR.k})`" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
        <path d="M0 -96 C64 -96 84 -40 72 2 C62 40 22 60 14 74 L-14 74 C-22 60 -62 40 -72 2 C-84 -40 -64 -96 0 -96 Z" :fill="BALLOON_NEAR.a" stroke-width="6" />
        <path d="M0 -96 C-30 -90 -34 -20 -22 40 L-10 74 L10 74 L22 40 C34 -20 30 -90 0 -96 Z" :fill="BALLOON_NEAR.b" stroke-width="4" />
        <path d="M-74 -6 Q0 14 74 -6" fill="none" stroke="#c8384a" stroke-width="10" />
        <path d="M-74 -6 Q0 14 74 -6" fill="none" stroke-width="3" />
        <path d="M-48 -66 Q-36 -86 -14 -92" fill="none" stroke="#fff" stroke-width="8" opacity="0.8" />
        <path d="M-12 74 L-16 100 M12 74 L16 100" fill="none" stroke-width="3" />
        <path d="M-20 100 H20 L16 128 H-16 Z" fill="url(#skyis-wood)" stroke-width="5" />
        <path d="M-18 110 H18" stroke="#7a4a2a" stroke-width="3" />
      </g>
    </g>

    <g class="skyis-drift skyis-back" style="animation-duration: 19s">
      <path :d="CLOUD_MID.outer" fill="#d6ccf2" stroke="#6e5fa8" stroke-width="8" />
      <path :d="CLOUD_MID.outer" fill="#d6ccf2" />
      <path :d="CLOUD_MID.inner" fill="#fffcff" />
    </g>

    <path d="M1730 950 Q1800 860 1880 730" fill="none" stroke="#3a2a5a" stroke-width="2.5" />
    <g transform="translate(1880 730)">
      <g class="skyis-kite" stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
        <path d="M0 0 Q-24 50 0 100 T0 200" fill="none" stroke="#3a2a5a" stroke-width="3" />
        <path v-for="(b, i) in BOWS" :key="`bw${i}`" :d="`M${b.x} ${b.y} l-14 -10 v20 Z M${b.x} ${b.y} l14 -10 v20 Z`" :fill="i % 2 ? '#9ad4ff' : '#ff7aa8'" stroke-width="3" />
        <path d="M0 -150 L56 -50 L0 0 L-56 -50 Z" fill="#ffd84a" stroke-width="5" />
        <path d="M0 -150 L56 -50 L0 -50 Z M0 -50 L-56 -50 L0 0 Z" fill="#ff7aa8" />
        <path d="M0 -150 L56 -50 L0 0 L-56 -50 Z M0 -150 V0 M-56 -50 H56" fill="none" stroke-width="4" />
        <path d="M-10 -126 L-36 -78" fill="none" stroke="#fff" stroke-width="5" opacity="0.8" />
      </g>
    </g>

    <g class="skyis-drift" style="animation-duration: 15s">
      <path :d="CLOUD_NEAR.outer" fill="#c8bcec" stroke="#1b1033" stroke-width="10" />
      <path :d="CLOUD_NEAR.outer" fill="#c8bcec" />
      <path :d="CLOUD_NEAR.inner" fill="#fff" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" stroke-linecap="round">
      <path d="M-60 940 Q100 900 280 912 Q420 922 460 960 Q470 990 430 1000 L400 1060 L360 1140 H-60 Z" fill="url(#skyis-rock-near)" stroke-width="6" filter="url(#cel)" />
      <path d="M-60 930 Q100 892 280 904 Q420 914 470 956 Q440 976 400 966 Q360 990 320 968 Q260 994 200 970 Q140 996 80 972 Q20 994 -60 976 Z" fill="url(#skyis-turf-near)" stroke-width="6" filter="url(#cel)" />
      <path d="M0 920 Q100 900 220 902" fill="none" stroke="#a8ec7a" stroke-width="6" opacity="0.8" />
      <path d="M380 990 l-20 50 M100 1010 l10 40 M230 1000 l-6 50" fill="none" stroke="#2a1a3a" stroke-width="4" opacity="0.5" />
      <path d="M1980 950 Q1820 924 1680 952 Q1600 970 1610 1000 L1640 1060 L1660 1140 H1980 Z" fill="url(#skyis-rock-near)" stroke-width="6" filter="url(#cel)" />
      <path d="M1980 944 Q1820 916 1680 944 Q1590 962 1600 990 Q1640 1000 1680 984 Q1730 1008 1780 986 Q1840 1010 1900 988 Q1950 1004 1980 990 Z" fill="url(#skyis-turf-near)" stroke-width="6" filter="url(#cel)" />
      <path d="M1700 940 Q1800 922 1900 926" fill="none" stroke="#a8ec7a" stroke-width="6" opacity="0.8" />
      <ellipse cx="1730" cy="956" rx="30" ry="7" fill="#0f2a10" opacity="0.3" stroke="none" />
      <path d="M1724 956 L1728 900 H1738 L1740 956 Z" fill="url(#skyis-wood)" stroke-width="4" />
      <path d="M1716 930 H1748" stroke-width="10" />
      <path d="M1716 930 H1748" stroke="#ff9a4a" stroke-width="5" />
    </g>
    <path :d="tufts(-20, 916, 420, 0.03)" stroke="#1f6a34" stroke-width="5" fill="none" stroke-linecap="round" />
    <path :d="tufts(1640, 942, 1960, 0.03)" stroke="#1f6a34" stroke-width="5" fill="none" stroke-linecap="round" />
    <g v-for="(f, i) in FLOWERS" :key="`fl${i}`" :transform="`translate(${f.x} ${f.y})`" stroke="#1b1033">
      <path d="M0 0 V24" stroke="#1f6a34" stroke-width="4" />
      <circle v-for="a in PETALS" :key="a" :cx="Math.cos((a * Math.PI) / 180) * 9" :cy="Math.sin((a * Math.PI) / 180) * 9" r="7" :fill="f.c" stroke-width="3" />
      <circle r="5" fill="#ffb02e" stroke-width="2.5" />
    </g>
    <g v-for="(b, i) in BUSHES" :key="`bu${i}`" stroke-linejoin="round">
      <path :d="b.all" fill="#1f5a3a" stroke="#0f2a1a" stroke-width="12" />
      <path :d="b.deep" fill="#1f5a3a" />
      <path :d="b.mid" fill="#2f7a46" />
      <path :d="b.light" fill="#4a9a52" />
    </g>
  </g>
</template>

<style scoped>
.skyis-drift {
  animation: skyis-drift ease-in-out infinite alternate;
}

.skyis-back {
  animation-direction: alternate-reverse;
}

.skyis-bob {
  animation: skyis-bob ease-in-out infinite alternate;
}

.skyis-spin {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: skyis-spin 14s linear infinite;
}

.skyis-prop {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: skyis-prop 0.18s linear infinite alternate;
}

.skyis-kite {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: skyis-kite 3.2s ease-in-out infinite alternate;
}

.skyis-flow {
  animation: skyis-flow 0.9s linear infinite;
}

@keyframes skyis-drift {
  from {
    translate: -50px 0;
  }
  to {
    translate: 50px 0;
  }
}

@keyframes skyis-bob {
  from {
    translate: 0 0;
  }
  to {
    translate: -26px -18px;
  }
}

@keyframes skyis-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes skyis-prop {
  from {
    scale: 1 1;
  }
  to {
    scale: 1 -1;
  }
}

@keyframes skyis-kite {
  from {
    rotate: -7deg;
  }
  to {
    rotate: 7deg;
  }
}

@keyframes skyis-flow {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 60px;
  }
}
</style>
