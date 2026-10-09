<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(118);
const COLORS = ['#ff4f8b', '#22d3ee', '#ffd23f', '#a66bff', '#2ed47a', '#ff7a2f'];

// dance floor in one-point perspective: columns fan out from a vanishing point above the horizon
const VY = 380;
const BY = 1180;
const ROWS = [800, 826, 860, 906, 970, 1060, 1180];
const COLS = Array.from({ length: 17 }, (_, i) => 960 + (i - 8) * 290);
const fx = (xb: number, y: number) => 960 + ((xb - 960) * (y - VY)) / (BY - VY);
const spans = (edges: number[]) => edges.slice(1).map((b, i) => ({ a: edges[i] ?? b, b }));
const TILES = spans(ROWS).flatMap(({ a: y0, b: y1 }, j) =>
  spans(COLS).map(({ a: xa, b: xb }, i) => {
    return {
      d: `M${fx(xa, y0)} ${y0} L${fx(xb, y0)} ${y0} L${fx(xb, y1)} ${y1} L${fx(xa, y1)} ${y1} Z`,
      c: COLORS[(i * 2 + j * 3) % COLORS.length],
      g: (i + j) % 2,
    };
  }),
);
const TILE_GROUPS = [0, 1].map((g) => TILES.filter((t) => t.g === g));
const FLOOR_GRID = [
  ...ROWS.slice(1).map((y) => `M-60 ${y} L1980 ${y}`),
  ...COLS.map((xb) => `M${fx(xb, 800)} 800 L${fx(xb, 1180)} 1180`),
].join(' ');

const swag = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const u = 1 - t;
    return { x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * y0 + 2 * u * t * cy + t * t * y1 };
  });
const BULBS = [...swag(-60, 60, 450, 250, 960, 60, 13), ...swag(960, 60, 1470, 250, 1980, 60, 13)].map((b, i) => ({
  ...b,
  c: COLORS[i % COLORS.length],
}));
const BULB_GROUPS = [0, 1].map((g) => BULBS.filter((_, i) => i % 2 === g));
const bulbPath = (x: number, y: number) =>
  `M${x} ${y + 8} Q${x + 12} ${y + 12} ${x + 11} ${y + 22} Q${x + 9} ${y + 32} ${x} ${y + 32} Q${x - 9} ${y + 32} ${x - 11} ${y + 22} Q${x - 12} ${y + 12} ${x} ${y + 8} Z`;

const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`;
const SPARKLES = Array.from({ length: 14 }, () => {
  const a = rnd() * Math.PI * 2;
  const r = 240 + rnd() * 640;
  return star(960 + Math.cos(a) * r, 190 + Math.sin(a) * r * 0.75, 7 + rnd() * 9);
}).join(' ');

const CONFETTI = Array.from({ length: 36 }, () => ({
  x: rnd() * 1920,
  y: -100 + rnd() * 1240,
  a: Math.round(rnd() * 180),
  c: COLORS[Math.floor(rnd() * COLORS.length)],
}));
// falling sheets like the snow, the copy a whole 1240px loop above
const CONFETTI_SHEETS = [14, 19].map((s, i) => ({ s, bits: CONFETTI.filter((_, j) => j % 2 === i) }));

const CROWD = Array.from({ length: 24 }, (_, i) => {
  const x = -30 + i * 86 + rnd() * 30;
  const y = 712 + rnd() * 26;
  const arm = rnd();
  return { x, y, r: 17 + rnd() * 5, arm: arm < 0.35 ? -1 : arm > 0.7 ? 1 : 0, g: i % 2 };
});
const CROWD_GROUPS = [0, 1].map((g) => CROWD.filter((p) => p.g === g));
const crowdArm = (p: (typeof CROWD)[number]) =>
  p.arm === 0 ? '' : `M${p.x + p.arm * 20} ${p.y + 40} Q${p.x + p.arm * 44} ${p.y + 10} ${p.x + p.arm * 34} ${p.y - 38}`;

const DANCERS_L = [
  { x: 60, y: 990, r: 70, arm: 'M110 1020 Q200 940 175 836', hx: 175, hy: 830, hat: false },
  { x: 290, y: 1066, r: 58, arm: 'M340 1096 Q400 1000 368 912', hx: 368, hy: 906, hat: true },
];
const DANCERS_R = [
  { x: 1860, y: 980, r: 72, arm: 'M1805 1010 Q1720 930 1750 826', hx: 1750, hy: 820, hat: true },
  { x: 1640, y: 1070, r: 58, arm: 'M1590 1098 Q1530 1000 1566 912', hx: 1566, hy: 906, hat: false },
];
const WOOFERS = [
  { x: 170, y: 690, r: 74 },
  { x: 170, y: 850, r: 54 },
  { x: 1750, y: 690, r: 74 },
  { x: 1750, y: 850, r: 54 },
  { x: 170, y: 540, r: 44 },
  { x: 1750, y: 540, r: 44 },
];
const BALLOONS = [
  { x: 1690, y: 300, c: '#ff4f8b', k: '#c22a63', r: 1 },
  { x: 1790, y: 262, c: '#22d3ee', k: '#1593ad', r: 1.18 },
  { x: 1860, y: 360, c: '#ffd23f', k: '#d39b17', r: 0.8 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="party-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a0e52" />
        <stop offset="55%" stop-color="#3d1468" />
        <stop offset="100%" stop-color="#5a1a73" />
      </linearGradient>
      <radialGradient id="party-glow">
        <stop offset="0%" stop-color="#ff7ad9" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ff7ad9" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="party-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff7ad9" stop-opacity="0" />
        <stop offset="70%" stop-color="#ff9ae0" stop-opacity="0.32" />
        <stop offset="100%" stop-color="#ff9ae0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="party-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3b1660" />
        <stop offset="100%" stop-color="#14062a" />
      </linearGradient>
      <linearGradient id="party-gloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.22" />
        <stop offset="35%" stop-color="#fff" stop-opacity="0" />
        <stop offset="100%" stop-color="#0c0420" stop-opacity="0.5" />
      </linearGradient>
      <linearGradient id="party-cab" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6a5a9a" />
        <stop offset="100%" stop-color="#2b1f4a" />
      </linearGradient>
      <radialGradient id="party-cone" cx="40%" cy="38%" r="70%">
        <stop offset="0%" stop-color="#8a7ab8" />
        <stop offset="60%" stop-color="#3a2d5e" />
        <stop offset="100%" stop-color="#1e1536" />
      </radialGradient>
      <radialGradient id="party-ball" cx="36%" cy="32%" r="75%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="45%" stop-color="#c3cbf5" />
        <stop offset="100%" stop-color="#5a5f9e" />
      </radialGradient>
      <linearGradient id="party-booth" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4a2d80" />
        <stop offset="100%" stop-color="#1f1040" />
      </linearGradient>
      <linearGradient id="party-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <clipPath id="party-ball-clip"><circle cx="960" cy="200" r="76" /></clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#party-wall)" />
    <ellipse cx="960" cy="230" rx="700" ry="420" fill="url(#party-glow)" />
    <g stroke="#5a2286" stroke-width="3" opacity="0.6">
      <path v-for="i in 13" :key="`pl${i}`" :d="`M${(i - 1) * 160 - 20} 250 L${(i - 1) * 160 - 20} 700`" />
    </g>
    <path d="M-60 250 L1980 250" stroke="#6c2a94" stroke-width="10" />
    <path d="M-60 262 L1980 262" stroke="#24093f" stroke-width="4" opacity="0.6" />

    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M520 470 Q440 400 470 360 Q500 330 520 370 Q540 330 570 360 Q600 400 520 470 Z" stroke="#ff4f8b" stroke-width="26" opacity="0.18" />
      <path d="M520 470 Q440 400 470 360 Q500 330 520 370 Q540 330 570 360 Q600 400 520 470 Z" stroke="#ff4f8b" stroke-width="10" />
      <path d="M520 470 Q440 400 470 360 Q500 330 520 370 Q540 330 570 360 Q600 400 520 470 Z" stroke="#ffd0e4" stroke-width="3" />
      <path :d="star(1420, 410, 62)" stroke="#22d3ee" stroke-width="26" opacity="0.18" />
      <path :d="star(1420, 410, 62)" stroke="#22d3ee" stroke-width="10" />
      <path :d="star(1420, 410, 62)" stroke="#c9f8ff" stroke-width="3" />
    </g>

    <g stroke="#6a3a90" stroke-width="3" stroke-linejoin="round" fill="#40195f">
      <g v-for="(grp, gi) in CROWD_GROUPS" :key="`cr${gi}`" class="party-bob" :style="{ animationDelay: `-${gi * 0.27}s` }">
        <g v-for="(p, i) in grp" :key="i">
          <path v-if="p.arm" :d="crowdArm(p)" fill="none" stroke="#6a3a90" stroke-width="16" stroke-linecap="round" />
          <path v-if="p.arm" :d="crowdArm(p)" fill="none" stroke="#40195f" stroke-width="10" stroke-linecap="round" />
          <path :d="`M${p.x - 34} 820 Q${p.x - 34} ${p.y + 30} ${p.x} ${p.y + 28} Q${p.x + 34} ${p.y + 30} ${p.x + 34} 820 Z`" />
          <circle :cx="p.x" :cy="p.y" :r="p.r" />
        </g>
      </g>
    </g>
    <rect x="-60" y="640" width="2040" height="180" fill="url(#party-haze)" />

    <path d="M-60 800 L1980 800 L1980 1200 L-60 1200 Z" fill="url(#party-floor)" />
    <g v-for="(grp, gi) in TILE_GROUPS" :key="`tg${gi}`" class="party-tile" :style="{ animationDelay: `-${gi * 0.7}s` }">
      <path v-for="(t, i) in grp" :key="i" :d="t.d" :fill="t.c" />
    </g>
    <path d="M-60 800 L1980 800 L1980 1200 L-60 1200 Z" fill="url(#party-gloss)" />
    <path :d="FLOOR_GRID" stroke="#1b1033" stroke-width="4" fill="none" />
    <ellipse cx="960" cy="900" rx="320" ry="40" fill="#fff" opacity="0.08" />
    <path d="M-60 792 L1980 792" stroke="#1b1033" stroke-width="10" />
    <path d="M-60 786 L1980 786" stroke="#8a4cc0" stroke-width="3" opacity="0.7" />

    <g class="party-beam party-beam-l"><path d="M400 120 L470 1180 L770 1180 Z" fill="#ff4f8b" opacity="0.16" /></g>
    <g class="party-beam party-beam-r"><path d="M1520 120 L1150 1180 L1450 1180 Z" fill="#22d3ee" opacity="0.16" /></g>
    <g class="party-rays" opacity="0.08">
      <path d="M960 200 L700 1180 L800 1180 Z M960 200 L1120 1180 L1220 1180 Z M960 200 L-60 640 L-60 700 Z M960 200 L1980 560 L1980 620 Z" fill="url(#party-beam)" />
    </g>

    <ellipse cx="290" cy="912" rx="290" ry="24" fill="#08021a" opacity="0.4" />
    <path d="M40 920 L40 770 Q40 760 50 760 L290 760 Q300 760 300 770 L300 920 Z M70 760 L70 610 Q70 600 80 600 L260 600 Q270 600 270 610 L270 760 Z" fill="url(#party-cab)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1880 920 L1880 770 Q1880 760 1870 760 L1630 760 Q1620 760 1620 770 L1620 920 Z M1850 760 L1850 610 Q1850 600 1840 600 L1660 600 Q1650 600 1650 610 L1650 760 Z" fill="url(#party-cab)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M70 482 L270 482 L270 600 L70 600 Z M1650 482 L1850 482 L1850 600 L1650 600 Z" fill="url(#party-cab)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel-s)" />
    <g fill="#1b1033">
      <rect v-for="(p, i) in [[48, 768], [280, 768], [48, 900], [280, 900], [1628, 768], [1860, 768], [1628, 900], [1860, 900]]" :key="`bo${i}`" :x="p[0] - 2" :y="p[1] - 2" width="14" height="14" rx="3" />
    </g>
    <g v-for="(w, i) in WOOFERS" :key="`wf${i}`">
      <circle :cx="w.x" :cy="w.y" :r="w.r + 8" fill="#1b1033" />
      <circle :cx="w.x" :cy="w.y" :r="w.r + 3" fill="none" stroke="#7d6cb0" stroke-width="3" opacity="0.6" />
    </g>
    <g v-for="side in 2" :key="`pu${side}`" class="party-pulse" :style="{ transformOrigin: side === 1 ? '170px 690px' : '1750px 690px', animationDelay: `-${side * 0.12}s` }">
      <g v-for="(w, i) in WOOFERS.filter((w) => (w.x < 960) === (side === 1))" :key="i">
        <circle :cx="w.x" :cy="w.y" :r="w.r" fill="url(#party-cone)" />
        <circle :cx="w.x" :cy="w.y" :r="w.r * 0.3" fill="#2a1f48" stroke="#1b1033" stroke-width="3" />
        <path :d="`M${w.x - w.r * 0.6} ${w.y - w.r * 0.3} Q${w.x - w.r * 0.45} ${w.y - w.r * 0.62} ${w.x - w.r * 0.1} ${w.y - w.r * 0.7}`" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5" />
      </g>
    </g>

    <path d="M1750 482 Q1720 440 1690 380 M1750 482 Q1780 400 1790 350 M1750 482 Q1820 450 1860 430" stroke="#e8dcff" stroke-width="3" fill="none" opacity="0.8" />
    <g stroke="#1b1033" stroke-width="5" filter="url(#cel-s)">
      <ellipse v-for="(b, i) in BALLOONS" :key="`bl${i}`" :cx="b.x" :cy="b.y" :rx="52 * b.r" :ry="64 * b.r" :fill="b.c" />
    </g>
    <g v-for="(b, i) in BALLOONS" :key="`bk${i}`">
      <path :d="`M${b.x - 8} ${b.y + 64 * b.r + 10} L${b.x} ${b.y + 64 * b.r - 2} L${b.x + 8} ${b.y + 64 * b.r + 10} Z`" :fill="b.k" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path :d="`M${b.x - 30 * b.r} ${b.y - 20 * b.r} Q${b.x - 26 * b.r} ${b.y - 44 * b.r} ${b.x - 6 * b.r} ${b.y - 50 * b.r}`" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.75" />
    </g>

    <ellipse cx="490" cy="912" rx="200" ry="20" fill="#08021a" opacity="0.4" />
    <path d="M330 790 L650 790 L650 910 L330 910 Z" fill="url(#party-booth)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M318 770 L662 770 L662 794 L318 794 Z" fill="#6a4aa8" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M350 848 L630 848" stroke="#22d3ee" stroke-width="16" opacity="0.25" stroke-linecap="round" />
    <path d="M350 848 L630 848" stroke="#9ff3ff" stroke-width="5" stroke-linecap="round" />
    <path d="M360 878 L620 878 M360 820 L620 820" stroke="#7a5ab8" stroke-width="3" opacity="0.5" />
    <g stroke="#1b1033" stroke-width="4">
      <ellipse cx="392" cy="768" rx="50" ry="14" fill="#2a1f48" />
      <ellipse cx="392" cy="766" rx="38" ry="10" fill="#120a24" />
      <ellipse cx="588" cy="768" rx="50" ry="14" fill="#2a1f48" />
      <ellipse cx="588" cy="766" rx="38" ry="10" fill="#120a24" />
      <rect x="456" y="752" width="68" height="20" rx="4" fill="#3f3466" />
    </g>
    <ellipse cx="392" cy="766" rx="10" ry="3" fill="#ff4f8b" />
    <ellipse cx="588" cy="766" rx="10" ry="3" fill="#ffd23f" />
    <path d="M370 762 Q392 758 412 762 M566 762 Q588 758 608 762" stroke="#6a5a9a" stroke-width="2" fill="none" />
    <circle v-for="i in 4" :key="`kn${i}`" :cx="460 + i * 12" cy="762" r="3.5" :fill="COLORS[i]" />

    <g fill="none" stroke-linecap="round">
      <path d="M-60 30 L1980 30 M-60 58 L1980 58" stroke="#1b1033" stroke-width="12" />
      <path d="M-60 30 L1980 30 M-60 58 L1980 58" stroke="#9a96c4" stroke-width="5" />
      <path :d="Array.from({ length: 52 }, (_, i) => `M${i * 40 - 60} 30 L${i * 40 - 40} 58`).join(' ')" stroke="#5a5680" stroke-width="4" />
    </g>
    <path d="M-60 60 Q450 250 960 60 Q1470 250 1980 60" stroke="#1b1033" stroke-width="4" fill="none" />
    <g v-for="(b, i) in BULBS" :key="`bs${i}`">
      <rect :x="b.x - 6" :y="b.y - 2" width="12" height="12" rx="2" fill="#2a2040" stroke="#1b1033" stroke-width="2" />
      <path :d="bulbPath(b.x, b.y)" :fill="b.c" stroke="#1b1033" stroke-width="3" opacity="0.55" />
    </g>
    <g v-for="(grp, gi) in BULB_GROUPS" :key="`bg${gi}`" class="party-bulb" :style="{ animationDelay: `-${gi * 0.8}s` }">
      <g v-for="(b, i) in grp" :key="i">
        <circle :cx="b.x" :cy="b.y + 22" r="26" :fill="b.c" opacity="0.22" />
        <path :d="bulbPath(b.x, b.y)" :fill="b.c" stroke="#1b1033" stroke-width="3" />
        <circle :cx="b.x - 4" :cy="b.y + 17" r="3" fill="#fff" />
      </g>
    </g>

    <g v-for="(s, i) in [{ x: 400, r: 20 }, { x: 1520, r: -20 }]" :key="`sc${i}`">
      <rect :x="s.x - 10" y="50" width="20" height="30" fill="#3f3466" stroke="#1b1033" stroke-width="4" />
      <g :transform="`rotate(${s.r} ${s.x} 96)`">
        <rect :x="s.x - 30" y="72" width="60" height="44" rx="10" fill="#4a4270" stroke="#1b1033" stroke-width="5" />
        <path :d="`M${s.x - 20} 80 L${s.x + 10} 80`" stroke="#8a84b8" stroke-width="4" stroke-linecap="round" />
        <ellipse :cx="s.x" cy="118" rx="26" ry="8" :fill="i === 0 ? '#ffc0d8' : '#c9f8ff'" stroke="#1b1033" stroke-width="4" />
      </g>
    </g>

    <g class="party-sparkles" fill="#fff" opacity="0.8"><path :d="SPARKLES" /></g>
    <path d="M960 58 L960 124" stroke="#1b1033" stroke-width="5" />
    <g class="party-disco">
      <rect x="948" y="112" width="24" height="16" rx="3" fill="#3f3466" stroke="#1b1033" stroke-width="4" />
      <circle cx="960" cy="200" r="76" fill="url(#party-ball)" />
      <g clip-path="url(#party-ball-clip)">
        <rect x="900" y="150" width="18" height="16" fill="#ff9ae0" opacity="0.7" />
        <rect x="990" y="190" width="18" height="16" fill="#9ff3ff" opacity="0.7" />
        <rect x="940" y="240" width="18" height="16" fill="#ffe58a" opacity="0.6" />
        <rect x="1010" y="150" width="18" height="16" fill="#c9b0ff" opacity="0.6" />
        <path d="M884 140 Q960 150 1036 140 M884 170 Q960 182 1036 170 M884 200 L1036 200 M884 230 Q960 218 1036 230 M884 260 Q960 250 1036 260" stroke="#5a5f9e" stroke-width="2.5" fill="none" />
        <path d="M960 124 L960 276 M930 124 Q906 200 930 276 M990 124 Q1014 200 990 276 M905 130 Q860 200 905 270 M1015 130 Q1060 200 1015 270" stroke="#5a5f9e" stroke-width="2.5" fill="none" />
        <path d="M1036 160 Q1040 250 940 278 L1060 300 L1060 150 Z" fill="#1b1033" opacity="0.25" />
      </g>
      <circle cx="960" cy="200" r="76" fill="none" stroke="#1b1033" stroke-width="6" />
      <path d="M912 166 Q924 142 950 134" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" />
      <path :d="star(926, 168, 18)" fill="#fff" />
    </g>

    <g v-for="(sheet, i) in CONFETTI_SHEETS" :key="`cf${i}`" class="party-confetti" stroke="#1b1033" stroke-width="2" :style="{ animationDuration: `${sheet.s}s` }">
      <g v-for="copy in 2" :key="copy" :transform="copy === 2 ? 'translate(20 -1240)' : undefined">
        <rect v-for="(b, j) in sheet.bits" :key="j" :x="b.x - 5" :y="b.y - 9" width="10" height="18" rx="2" :fill="b.c" :transform="`rotate(${b.a} ${b.x} ${b.y})`" />
      </g>
    </g>

    <g v-for="(grp, gi) in [DANCERS_L, DANCERS_R]" :key="`dn${gi}`" class="party-bob-near" :style="{ animationDelay: `-${gi * 0.3}s` }">
      <path v-if="gi === 0" d="M178 840 L150 760" stroke="#22d3ee" stroke-width="26" stroke-linecap="round" opacity="0.3" />
      <path v-if="gi === 0" d="M178 840 L150 760" stroke="#c9f8ff" stroke-width="12" stroke-linecap="round" />
      <g v-for="(p, i) in grp" :key="i" fill="#170a2c" stroke="#08021a" stroke-width="6" stroke-linejoin="round">
        <path :d="p.arm" fill="none" stroke="#08021a" stroke-width="42" stroke-linecap="round" />
        <path :d="p.arm" fill="none" stroke="#170a2c" stroke-width="30" stroke-linecap="round" />
        <circle :cx="p.hx" :cy="p.hy" r="24" />
        <path :d="`M${p.x - p.r * 1.9} 1200 Q${p.x - p.r * 1.8} ${p.y + p.r * 0.9} ${p.x} ${p.y + p.r * 0.8} Q${p.x + p.r * 1.8} ${p.y + p.r * 0.9} ${p.x + p.r * 1.9} 1200 Z`" />
        <path v-if="p.hat" :d="`M${p.x - p.r * 0.6} ${p.y - p.r * 0.7} L${p.x + p.r * 0.3} ${p.y - p.r * 2} L${p.x + p.r * 0.75} ${p.y - p.r * 0.5} Z`" :fill="gi === 0 ? '#ff4f8b' : '#22d3ee'" stroke="#08021a" />
        <circle :cx="p.x" :cy="p.y" :r="p.r" />
        <path :d="`M${p.x - p.r * 0.8} ${p.y - p.r * 0.35} Q${p.x - p.r * 0.6} ${p.y - p.r * 0.85} ${p.x - p.r * 0.05} ${p.y - p.r * 0.92}`" fill="none" :stroke="gi === 0 ? '#ff4f8b' : '#22d3ee'" stroke-width="6" stroke-linecap="round" opacity="0.8" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.party-bob {
  animation: party-bob 0.55s ease-in-out infinite alternate;
}

.party-bob-near {
  animation: party-bob-near 0.55s ease-in-out infinite alternate;
}

.party-tile {
  animation: party-tile 1.4s steps(2) infinite;
}

.party-bulb {
  animation: party-blink 1.6s steps(2) infinite;
}

.party-pulse {
  animation: party-pulse 0.55s ease-out infinite;
}

.party-beam-l {
  transform-origin: 400px 120px;
  animation: party-sweep 6s ease-in-out infinite;
}

.party-beam-r {
  transform-origin: 1520px 120px;
  animation: party-sweep 7s ease-in-out infinite reverse;
}

.party-rays {
  transform-origin: 960px 200px;
  animation: party-spin 30s linear infinite;
}

.party-sparkles {
  transform-origin: 960px 200px;
  animation: party-spin 40s linear infinite reverse;
}

.party-disco {
  transform-origin: 960px 58px;
  animation: party-swing 3s ease-in-out infinite alternate;
}

.party-confetti {
  animation: party-fall linear infinite;
}

@keyframes party-bob {
  to {
    translate: 0 -10px;
  }
}

@keyframes party-bob-near {
  to {
    translate: 0 -22px;
  }
}

@keyframes party-tile {
  from {
    opacity: 0.12;
  }
  to {
    opacity: 0.6;
  }
}

@keyframes party-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes party-pulse {
  0% {
    scale: 1.03;
  }
  100% {
    scale: 1;
  }
}

@keyframes party-sweep {
  0%,
  100% {
    rotate: -14deg;
  }
  50% {
    rotate: 14deg;
  }
}

@keyframes party-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes party-swing {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes party-fall {
  from {
    translate: 0 0;
  }
  to {
    translate: -20px 1240px;
  }
}
</style>
