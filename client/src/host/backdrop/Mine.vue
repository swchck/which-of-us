<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(26059);
const f1 = (n: number) => n.toFixed(1);

type Palette = [string, string, string];
const CYAN: Palette = ['#d4fdff', '#4fe3f5', '#1a86c0'];
const PINK: Palette = ['#ffd6f4', '#ff5ad0', '#a8208a'];
const GREEN: Palette = ['#d0ffe0', '#3fdc8a', '#12845a'];
const AMBER: Palette = ['#fff2b8', '#ffc23a', '#c4740e'];
const VIOLET: Palette = ['#eedcff', '#a66bff', '#5a2fb0'];

// one crystal is three facets (light, mid, dark) converging on the tip, in local coords with the base at 0 0
const facets = (h: number, w: number) => {
  const sh = -h + w * 0.6;
  const ih = -h + w * 0.5;
  const a = w / 2;
  const b = w / 6;
  return {
    l: `M${-a} 0 V${sh} L0 ${-h} L${-b} ${ih} V0 Z`,
    m: `M${-b} 0 V${ih} L0 ${-h} L${b} ${ih} V0 Z`,
    r: `M${b} 0 V${ih} L0 ${-h} L${a} ${sh} V0 Z`,
    o: `M${-a} 0 V${sh} L0 ${-h} L${a} ${sh} V0 Z`,
    g: `M${-a + 6} ${sh + 12} V${sh + Math.min(60, h * 0.3)}`,
  };
};

const SHAPE: [number, number, number, number][] = [
  [-18, 210, 56, -8],
  [22, 170, 50, 14],
  [44, 140, 44, 30],
  [-48, 128, 44, -32],
  [72, 86, 34, 52],
  [-74, 78, 32, -56],
];

interface Cluster {
  x: number;
  y: number;
  k: number;
  rot: number;
  pals: Palette[];
}
const CLUSTERS: Cluster[] = [
  { x: 10, y: 470, k: 0.95, rot: 62, pals: [GREEN, GREEN, CYAN, GREEN, GREEN, CYAN] },
  { x: 372, y: 300, k: 0.55, rot: 38, pals: [AMBER] },
  { x: 1612, y: 540, k: 0.55, rot: -62, pals: [PINK, VIOLET] },
  { x: 1735, y: 200, k: 0.5, rot: 172, pals: [VIOLET, PINK] },
  { x: 1050, y: 792, k: 0.42, rot: -8, pals: [CYAN] },
  { x: 742, y: 806, k: 0.36, rot: 4, pals: [VIOLET, AMBER] },
  { x: 1468, y: 860, k: 0.72, rot: -14, pals: [PINK, PINK, VIOLET] },
  { x: 70, y: 1090, k: 0.85, rot: 18, pals: [VIOLET, PINK, VIOLET] },
  { x: 1870, y: 1110, k: 1.4, rot: -10, pals: [CYAN, CYAN, PINK, CYAN, PINK, VIOLET] },
];
const HALO_COLOR = (p: Palette) => (p === CYAN ? 'cyan' : p === GREEN ? 'green' : p === AMBER ? 'amber' : 'pink');

const rad = (d: number) => (d * Math.PI) / 180;
const CRYSTALS = CLUSTERS.map((c) => ({
  t: `translate(${c.x} ${c.y}) rotate(${c.rot}) scale(${c.k})`,
  halo: HALO_COLOR(c.pals[0] ?? CYAN),
  items: SHAPE.map(([dx, h, w, a], i) => ({ dx, h, w, a, pal: c.pals[i % c.pals.length] ?? CYAN, f: facets(h, w) })),
}));

const SPARKLE_SPOTS = CLUSTERS.flatMap((c) =>
  SHAPE.slice(0, 4).map(([dx, h, , a]) => {
    // tip in cluster space, then into the scene through the cluster's rotate+scale
    const lx = dx + h * Math.sin(rad(a));
    const ly = -h * Math.cos(rad(a));
    const r = rad(c.rot);
    return { x: c.x + c.k * (lx * Math.cos(r) - ly * Math.sin(r)), y: c.y + c.k * (lx * Math.sin(r) + ly * Math.cos(r)), s: 10 + c.k * 9 };
  }),
);
const star = (x: number, y: number, s: number) => `M${f1(x)} ${f1(y - s)} Q${f1(x)} ${f1(y)} ${f1(x + s)} ${f1(y)} Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y + s)} Q${f1(x)} ${f1(y)} ${f1(x - s)} ${f1(y)} Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y - s)} Z`;
const SPARKLES = twinkleGroups(SPARKLE_SPOTS).map((g) => g.map((p) => star(p.x, p.y, p.s)).join(' '));

// track: flat across the foreground, then a hard turn up into the tunnel mouth
const P = [
  [-140, 990],
  [700, 996],
  [1268, 1004],
  [1268, 786],
] as const;
const bez = (t: number, i: 0 | 1) => {
  const u = 1 - t;
  return u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i];
};
const tangent = (t: number) => {
  const e = 0.001;
  const dx = bez(Math.min(1, t + e), 0) - bez(Math.max(0, t - e), 0);
  const dy = bez(Math.min(1, t + e), 1) - bez(Math.max(0, t - e), 1);
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l] as const;
};
const gauge = (t: number) => 30 + 16 * t * t;
const at = (t: number, off: number, along = 0) => {
  const [tx, ty] = tangent(t);
  return `${f1(bez(t, 0) - ty * off + tx * along)} ${f1(bez(t, 1) + tx * off + ty * along)}`;
};
const TS = Array.from({ length: 61 }, (_, i) => i / 60);
const RAILS = [1, -1].map((s) => {
  const rw = (t: number) => 11 - 5 * t;
  const outer = TS.map((t) => at(t, s * (gauge(t) + rw(t) / 2)));
  const inner = TS.map((t) => at(t, s * (gauge(t) - rw(t) / 2))).reverse();
  return { d: `M${outer.join(' L')} L${inner.join(' L')} Z`, hi: `M${TS.map((t) => at(t, s * gauge(t) - rw(t) * 0.2)).join(' L')}` };
});
const SLEEPERS = Array.from({ length: 30 }, (_, i) => (i + 0.5) / 30)
  .map((t) => {
    const g = gauge(t) * 1.5;
    const th = 9 - 4 * t;
    return `M${at(t, -g, -th)} L${at(t, g, -th)} L${at(t, g, th)} L${at(t, -g, th)} Z`;
  })
  .join(' ');

let lo = 0;
let hi = 1;
for (let i = 0; i < 30; i++) {
  const mid = (lo + hi) / 2;
  if (bez(mid, 0) < 320) lo = mid;
  else hi = mid;
}
const CART = { x: bez(lo, 0), y: bez(lo, 1) + gauge(lo) };

const GEM_PALS = [CYAN, PINK, GREEN, AMBER, VIOLET];
const GEMS = [
  ...[-108, -72, -36, 0, 36, 72, 108].map((x) => ({ x, y: -168 })),
  ...[-84, -46, -6, 34, 74].map((x) => ({ x: x + 6, y: -194 })),
  ...[-46, -6, 34].map((x) => ({ x, y: -218 })),
].map((g, i) => {
  const s = 20 + rnd() * 9;
  const p = GEM_PALS[(i * 3 + Math.floor(rnd() * 2)) % 5] ?? CYAN;
  const kind = i % 3;
  const { x, y } = g;
  const base =
    kind === 0
      ? `M${x} ${f1(y - s)} L${f1(x + s * 0.8)} ${y} L${x} ${f1(y + s)} L${f1(x - s * 0.8)} ${y} Z`
      : kind === 1
        ? `M${f1(x - s * 0.5)} ${f1(y - s * 0.8)} H${f1(x + s * 0.5)} L${f1(x + s)} ${f1(y - s * 0.2)} L${x} ${f1(y + s * 0.9)} L${f1(x - s)} ${f1(y - s * 0.2)} Z`
        : `M${f1(x - s * 0.4)} ${f1(y - s * 0.8)} H${f1(x + s * 0.4)} L${f1(x + s * 0.8)} ${f1(y - s * 0.3)} V${f1(y + s * 0.3)} L${f1(x + s * 0.4)} ${f1(y + s * 0.8)} H${f1(x - s * 0.4)} L${f1(x - s * 0.8)} ${f1(y + s * 0.3)} V${f1(y - s * 0.3)} Z`;
  const facet =
    kind === 0
      ? `M${x} ${f1(y - s)} L${f1(x - s * 0.8)} ${y} L${x} ${y} Z`
      : kind === 1
        ? `M${f1(x - s * 0.5)} ${f1(y - s * 0.8)} H${f1(x + s * 0.5)} L${f1(x + s)} ${f1(y - s * 0.2)} H${f1(x - s)} Z`
        : `M${f1(x - s * 0.4)} ${f1(y - s * 0.4)} H${f1(x + s * 0.4)} V${f1(y + s * 0.4)} H${f1(x - s * 0.4)} Z`;
  return { base, facet, pal: p, glint: `M${f1(x - s * 0.45)} ${f1(y - s * 0.15)} l${f1(s * 0.2)} ${f1(-s * 0.3)}` };
});
const CART_STARS = [star(-60, -214, 14), star(70, -230, 11), star(4, -250, 16)].join(' ');

const STALACTITES: [number, number, number, number][] = [
  [40, 300, 240, 44],
  [196, 236, 170, 30],
  [318, 172, 120, 22],
  [470, 130, 70, 16],
  [600, 100, 96, 18],
  [790, 84, 60, 13],
  [1080, 76, 70, 14],
  [1240, 84, 50, 12],
  [1420, 104, 110, 20],
  [1560, 128, 70, 16],
  [1660, 166, 150, 26],
  [1930, 280, 200, 34],
];
const STALACTITE_D = STALACTITES.map(([x, y, l, w0]) => {
  const w = w0 * 1.5;
  return `M${x - w} ${y - 40} Q${x - w * 0.6} ${y + l * 0.45} ${x} ${y + l} Q${x + w * 0.5} ${y + l * 0.45} ${x + w} ${y - 40} Z`;
}).join(' ');
const STALACTITE_HI = STALACTITES.map(([x, y, l, w]) => `M${f1(x - w * 0.55)} ${y} Q${f1(x - w * 0.4)} ${f1(y + l * 0.4)} ${f1(x - w * 0.12)} ${f1(y + l * 0.75)}`).join(' ');

const FLECK_COLORS = ['#7ef0ff', '#ff9ae6', '#b8f5a0'];
const FLECKS = FLECK_COLORS.map(() =>
  Array.from({ length: 22 }, () => `M${f1(380 + rnd() * 1200)} ${f1(120 + rnd() * 560)} h0.1`).join(' '),
);
const PEBBLES = Array.from({ length: 26 }, () => {
  const x = 120 + rnd() * 1700;
  const y = 830 + rnd() * 260;
  const r = 6 + rnd() * 10;
  return { x, y, rx: r * 1.4, ry: r * 0.8 };
}).filter((p) => !(p.x > 140 && p.x < 520 && p.y > 940) && !(p.x > 1400 && p.y < 950) && !(p.x > 1620 && p.y > 930));

// receding timber sets inside the tunnel, scaled toward the vanishing point
const VANISH = { x: 1272, y: 704 };
const DEPTHS = [0.72, 0.5, 0.33].map((s, i) => ({ s, t: `translate(${VANISH.x} ${VANISH.y}) scale(${s}) translate(${-VANISH.x} ${-VANISH.y})`, c: ['#a86a3a', '#8a5032', '#6a3a2e'][i] }));

const HANGING_BATS = [
  { x: 126, y: 270, k: 0.8 },
  { x: 160, y: 258, k: 0.66 },
  { x: 1846, y: 238, k: 0.75 },
];
const FLYERS = [
  { x: 0, y: 0, k: 0.9, d: 0 },
  { x: 120, y: -50, k: 0.7, d: 0.15 },
  { x: 210, y: 20, k: 0.6, d: 0.3 },
];
const LANTERNS = [
  { x: 404, y: 612, chain: 18, k: 0.9, g: 0 },
  { x: 1272, y: 618, chain: 16, k: 0.75, g: 1 },
  { x: 1574, y: 610, chain: 30, k: 0.85, g: 0 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="mine-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#22184a" />
        <stop offset="45%" stop-color="#3e2c72" />
        <stop offset="78%" stop-color="#6c4a8e" />
        <stop offset="100%" stop-color="#8a5a7a" />
      </linearGradient>
      <radialGradient id="mine-warm" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#ffb070" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ffb070" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="mine-far" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8c78bc" />
        <stop offset="100%" stop-color="#64509a" />
      </linearGradient>
      <linearGradient id="mine-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffd6c8" stop-opacity="0" />
        <stop offset="60%" stop-color="#ffd6c8" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#ffd6c8" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="mine-rock" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#b07aa8" />
        <stop offset="100%" stop-color="#5e3868" />
      </linearGradient>
      <linearGradient id="mine-rock-r" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7a4c86" />
        <stop offset="100%" stop-color="#9a6a9a" />
      </linearGradient>
      <linearGradient id="mine-ceil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a1c44" />
        <stop offset="100%" stop-color="#7a5496" />
      </linearGradient>
      <linearGradient id="mine-stal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#9a72b8" />
        <stop offset="100%" stop-color="#5a3a78" />
      </linearGradient>
      <linearGradient id="mine-floor" gradientUnits="userSpaceOnUse" x1="0" y1="780" x2="0" y2="1140">
        <stop offset="0%" stop-color="#e0a066" />
        <stop offset="100%" stop-color="#9a5a3a" />
      </linearGradient>
      <linearGradient id="mine-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e09a56" />
        <stop offset="100%" stop-color="#94562a" />
      </linearGradient>
      <radialGradient id="mine-tunnel" cx="0.5" cy="0.7" r="0.6">
        <stop offset="0%" stop-color="#ffe08a" />
        <stop offset="35%" stop-color="#e0784a" />
        <stop offset="100%" stop-color="#3a1840" />
      </radialGradient>
      <linearGradient id="mine-adit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a0e2c" />
        <stop offset="100%" stop-color="#4a2240" />
      </linearGradient>
      <radialGradient id="mine-lamp" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#ffe6a0" stop-opacity="0.6" />
        <stop offset="45%" stop-color="#ffc46a" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#ffc46a" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="mine-halo-cyan" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#6af0ff" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#6af0ff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="mine-halo-pink" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#ff7ae0" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ff7ae0" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="mine-halo-green" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#6affa8" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#6affa8" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="mine-halo-amber" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#ffd25a" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffd25a" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="mine-pool" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8af6ff" />
        <stop offset="100%" stop-color="#1a7ab8" />
      </linearGradient>
      <linearGradient id="mine-fall" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#c8faff" />
        <stop offset="45%" stop-color="#5ad8f4" />
        <stop offset="100%" stop-color="#2a8ed0" />
      </linearGradient>
      <linearGradient id="mine-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a8b4d4" />
        <stop offset="100%" stop-color="#58628a" />
      </linearGradient>
      <linearGradient id="mine-cart" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff8a5a" />
        <stop offset="100%" stop-color="#b8402e" />
      </linearGradient>
      <clipPath id="mine-fall-clip">
        <path d="M1694 330 Q1688 600 1678 852 H1792 Q1782 600 1772 330 Z" />
      </clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#mine-wall)" />
    <path d="M-60 400 Q480 360 960 410 Q1440 450 1980 390 L1980 450 Q1440 510 960 470 Q480 420 -60 460 Z" fill="#4c3684" opacity="0.6" />
    <path d="M-60 540 Q520 500 980 550 Q1460 590 1980 530 L1980 572 Q1460 630 980 590 Q520 540 -60 580 Z" fill="#7a5a9e" opacity="0.45" />
    <path d="M-60 250 Q600 220 1000 260 Q1500 300 1980 240 L1980 270 Q1500 330 1000 290 Q600 250 -60 280 Z" fill="#33246a" opacity="0.6" />
    <path v-for="(d, i) in FLECKS" :key="`fk${i}`" :d="d" :stroke="FLECK_COLORS[i]" stroke-width="6" stroke-linecap="round" opacity="0.45" />
    <ellipse cx="1272" cy="690" rx="520" ry="300" fill="url(#mine-warm)" />

    <g fill="url(#mine-far)" stroke="#5a4688" stroke-width="3" stroke-linejoin="round">
      <path d="M612 812 Q640 600 612 430 Q596 260 650 40 L742 40 Q780 260 752 430 Q724 600 764 812 Z" />
      <path d="M884 812 Q900 660 884 560 Q874 470 910 380 L950 380 Q980 470 966 560 Q954 660 980 812 Z" />
      <path d="M520 812 Q548 740 566 650 Q580 740 610 812 Z" />
      <path d="M1000 812 Q1018 760 1030 700 Q1044 760 1060 812 Z" />
      <path d="M1440 812 Q1470 720 1490 620 Q1510 720 1540 812 Z" />
      <path d="M880 40 Q910 150 930 250 Q948 150 980 40 Z" />
    </g>
    <path d="M640 120 Q676 130 700 120 M628 300 Q670 312 712 296 M620 520 Q666 532 716 516 M632 690 Q690 700 740 690 M896 480 Q930 490 956 478 M900 640 Q934 650 962 640" stroke="#c4b2ea" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
    <g stroke="#5a4688" stroke-width="2" stroke-linejoin="round">
      <path d="M690 250 l10 -26 l10 26 Z M706 252 l7 -18 l7 18 Z" fill="#9ee8f4" />
      <path d="M720 600 l9 -24 l9 24 Z" fill="#f4a8e4" />
      <path d="M920 520 l8 -20 l8 20 Z" fill="#b8f0c8" />
    </g>

    <path d="M1090 812 V636 Q1090 508 1272 500 Q1454 508 1454 636 V812 Z" fill="url(#mine-far)" stroke="#5a4688" stroke-width="4" stroke-linejoin="round" />
    <path d="M1106 640 Q1110 528 1220 514 M1420 600 Q1430 650 1436 760" stroke="#c4b2ea" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
    <path d="M1140 812 V650 Q1140 562 1272 556 Q1404 562 1404 650 V812 Z" fill="url(#mine-tunnel)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M1224 812 L1262 704 M1318 812 L1282 704" stroke="#3a2030" stroke-width="5" stroke-linecap="round" opacity="0.7" />
    <g v-for="(dp, i) in DEPTHS" :key="`dp${i}`" :transform="dp.t">
      <path d="M1130 816 V600 M1414 816 V600" :stroke="dp.c" stroke-width="22" />
      <path d="M1110 592 H1434" :stroke="dp.c" stroke-width="24" />
      <circle cx="1272" cy="620" r="16" fill="#ffe08a" />
    </g>
    <rect x="-60" y="610" width="2040" height="210" fill="url(#mine-haze)" />

    <path d="M-60 812 Q300 798 620 800 Q900 786 1140 784 Q1400 790 1600 822 Q1800 842 1980 832 L1980 1140 L-60 1140 Z" fill="url(#mine-floor)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <ellipse v-for="(p, i) in PEBBLES" :key="`pb${i}`" :cx="p.x" :cy="p.y" :rx="p.rx" :ry="p.ry" fill="#b87048" stroke="#6a3a2a" stroke-width="3" />
    <path d="M520 880 l40 10 l20 -6 M860 840 l30 8 l24 -4 M1080 1080 l50 -8 l20 10 M700 1100 l36 6 M1500 1060 l40 -6" stroke="#7a4430" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
    <ellipse cx="404" cy="820" rx="190" ry="34" fill="#ffd27a" opacity="0.28" />
    <ellipse cx="1272" cy="800" rx="170" ry="26" fill="#ffd27a" opacity="0.3" />

    <path d="M-60 -60 H270 Q300 120 380 300 Q470 480 452 640 Q444 760 474 818 L-60 818 Z" fill="url(#mine-rock)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M-60 330 Q120 380 330 330 M-60 520 Q60 560 150 540 M380 470 Q410 520 440 520 M-60 700 Q40 730 120 720 M200 200 Q260 260 300 230" stroke="#e0b0d4" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5" />
    <path d="M-60 360 Q120 410 330 360 M-60 560 Q60 600 140 584 M300 120 Q330 200 352 240" stroke="#4a2a58" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.55" />
    <path d="M150 818 V650 Q150 548 260 542 Q370 548 370 650 V818 Z" fill="url(#mine-adit)" stroke="#1b1033" stroke-width="5" />
    <ellipse cx="260" cy="760" rx="50" ry="40" fill="#ffb070" opacity="0.18" />
    <g fill="url(#mine-wood)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
      <rect x="126" y="590" width="32" height="232" rx="4" />
      <rect x="362" y="590" width="32" height="232" rx="4" />
      <rect x="104" y="566" width="314" height="34" rx="5" />
      <path d="M158 600 L200 600 L158 640 Z M362 600 L320 600 L362 640 Z" />
    </g>
    <path d="M114 576 H300 M136 620 V800 M372 620 V800 M330 590 h40" stroke="#ffd09a" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    <path d="M150 650 v8 M150 740 v10 M384 680 v8 M200 584 h40" stroke="#6a3a1e" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    <circle cx="140" cy="583" r="4" fill="#3a2a3a" />
    <circle cx="380" cy="583" r="4" fill="#3a2a3a" />

    <path d="M1980 -60 V884 H1556 Q1512 800 1566 700 Q1618 600 1590 480 Q1560 360 1610 250 Q1652 150 1628 -60 Z" fill="url(#mine-rock-r)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1620 300 Q1760 330 1980 290 M1600 470 Q1700 500 1980 460 M1580 720 Q1700 700 1980 740 M1640 160 Q1780 190 1980 150" stroke="#d8a8d8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.45" />
    <path d="M1610 330 Q1760 360 1980 320 M1590 500 Q1700 530 1980 490" stroke="#4a2a5a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5" />
    <ellipse cx="1733" cy="330" rx="58" ry="24" fill="#1e1030" stroke="#1b1033" stroke-width="5" />
    <path d="M1694 330 Q1688 600 1678 852 H1792 Q1782 600 1772 330 Z" fill="url(#mine-fall)" />
    <g clip-path="url(#mine-fall-clip)">
      <path class="mine-fall" d="M1702 200 V900 M1724 160 V900 M1746 220 V900 M1768 180 V900 M1714 240 V900 M1756 140 V900" stroke="#ffffff" stroke-width="7" stroke-dasharray="96 24" stroke-linecap="round" opacity="0.55" />
    </g>
    <path d="M1694 330 Q1688 600 1678 852 M1772 330 Q1782 600 1792 852" stroke="#1b1033" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M1704 360 Q1700 560 1694 760" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />

    <path d="M1380 880 Q1400 838 1540 836 Q1720 828 1900 846 Q1990 872 1930 918 Q1720 952 1480 940 Q1370 922 1380 880 Z" fill="url(#mine-pool)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M1430 870 Q1500 856 1580 860 M1520 912 Q1620 902 1700 910 M1800 900 Q1860 896 1900 884" stroke="#e8fdff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    <ellipse cx="1734" cy="872" rx="110" ry="20" fill="none" stroke="#e8fdff" stroke-width="4" opacity="0.6" />
    <ellipse cx="1734" cy="872" rx="170" ry="32" fill="none" stroke="#e8fdff" stroke-width="3" opacity="0.35" />
    <path d="M1666 862 a22 16 0 0 1 36 -14 a24 18 0 0 1 42 -4 a22 16 0 0 1 40 6 a18 14 0 0 1 22 16 Z" fill="#f4feff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <g fill="#8a6a8a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path d="M1364 890 Q1366 862 1396 864 Q1420 872 1414 896 Q1388 906 1364 890 Z" />
      <path d="M1600 944 Q1610 920 1646 924 Q1670 936 1660 956 Q1626 962 1600 944 Z" />
    </g>

    <path :d="STALACTITE_D" fill="url(#mine-stal)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
    <path d="M-60 -60 H1980 V300 Q1900 244 1800 236 Q1700 168 1560 124 Q1300 60 960 70 Q600 62 420 122 Q250 172 140 262 Q60 304 -60 334 Z" fill="url(#mine-ceil)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="STALACTITE_HI" stroke="#b08ad0" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    <path d="M200 200 Q400 120 620 96 M1300 76 Q1520 100 1700 170 M60 280 Q120 250 170 236" stroke="#9a78c4" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5" />

    <g v-for="(b, i) in HANGING_BATS" :key="`hb${i}`" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`">
      <path d="M-6 0 V10 M6 0 V10" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
      <path d="M0 8 Q-24 14 -22 42 Q-14 68 0 74 Q14 68 22 42 Q24 14 0 8 Z" fill="#6a4aa8" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-10 74 L-18 90 L-4 78 M10 74 L18 90 L4 78" fill="#6a4aa8" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M-12 20 Q-8 44 -10 60 M12 20 Q8 44 10 60" stroke="#3a2470" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M-11 62 q4 -4 8 0 M3 62 q4 -4 8 0" stroke="#1b1033" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <ellipse cx="-12" cy="56" rx="4" ry="2.5" fill="#ff8ab8" opacity="0.7" />
      <ellipse cx="12" cy="56" rx="4" ry="2.5" fill="#ff8ab8" opacity="0.7" />
      <path d="M-14 22 Q-16 34 -14 44" stroke="#a88ae0" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1272 572)">
      <g fill="url(#mine-wood)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
        <rect x="-150" y="22" width="30" height="214" rx="4" />
        <rect x="120" y="22" width="30" height="214" rx="4" />
        <rect x="-172" y="0" width="344" height="32" rx="5" />
        <path d="M-120 32 L-84 32 L-120 66 Z M120 32 L84 32 L120 66 Z" />
      </g>
      <path d="M-162 10 H40 M-140 50 V220 M130 50 V220" stroke="#ffd09a" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    </g>

    <g class="mine-lamp-a">
      <circle v-for="(l, i) in LANTERNS.filter((x) => x.g === 0)" :key="`la${i}`" :cx="l.x" :cy="l.y + l.chain + 30" r="210" fill="url(#mine-lamp)" />
    </g>
    <g class="mine-lamp-b">
      <circle v-for="(l, i) in LANTERNS.filter((x) => x.g === 1)" :key="`lb${i}`" :cx="l.x" :cy="l.y + l.chain + 30" r="170" fill="url(#mine-lamp)" />
    </g>
    <path d="M1574 560 V610 M1560 560 H1600" stroke="#3a2a3a" stroke-width="6" stroke-linecap="round" />
    <path d="M404 600 V612" stroke="#3a2a3a" stroke-width="6" stroke-linecap="round" />
    <g v-for="(l, i) in LANTERNS" :key="`ln${i}`" :transform="`translate(${l.x} ${l.y}) scale(${l.k})`">
      <path :d="`M0 0 V${l.chain}`" stroke="#3a2a3a" stroke-width="4" stroke-dasharray="7 4" />
      <g :transform="`translate(0 ${l.chain})`">
        <circle cx="0" cy="-2" r="6" fill="none" stroke="#1b1033" stroke-width="3" />
        <path d="M-24 18 L-14 4 H14 L24 18 Z" fill="#4a3c6a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <rect x="-19" y="18" width="38" height="52" rx="7" fill="#ffd25a" stroke="#1b1033" stroke-width="4" />
        <ellipse cx="0" cy="46" rx="8" ry="14" fill="#fff8d0" />
        <path d="M-7 18 V70 M7 18 V70" stroke="#1b1033" stroke-width="3" />
        <path d="M-26 70 H26 L20 80 H-20 Z" fill="#4a3c6a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-13 26 V40" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.85" />
      </g>
    </g>

    <path :d="SLEEPERS" fill="url(#mine-wood)" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    <g v-for="(r, i) in RAILS" :key="`rl${i}`">
      <path :d="r.d" fill="url(#mine-steel)" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <path :d="r.hi" stroke="#e8eeff" stroke-width="2.5" fill="none" opacity="0.7" />
    </g>

    <ellipse cx="560" cy="836" rx="110" ry="14" fill="#2a1020" opacity="0.32" />
    <g v-for="(b, i) in [{ x: 520, y: 832, k: 1 }, { x: 610, y: 838, k: 0.82 }]" :key="`br${i}`" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`">
      <path d="M-40 0 Q-52 -55 -40 -110 H40 Q52 -55 40 0 Z" fill="url(#mine-wood)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-20 -6 Q-26 -55 -20 -104 M0 -4 V-106 M20 -6 Q26 -55 20 -104" stroke="#8a4e26" stroke-width="3" fill="none" opacity="0.7" />
      <path d="M-46 -24 Q0 -14 46 -24 M-46 -86 Q0 -76 46 -86" stroke="#1b1033" stroke-width="9" fill="none" stroke-linecap="round" />
      <path d="M-46 -24 Q0 -14 46 -24 M-46 -86 Q0 -76 46 -86" stroke="#7a84a8" stroke-width="5" fill="none" stroke-linecap="round" />
      <ellipse cx="0" cy="-110" rx="40" ry="10" fill="#f0b070" stroke="#1b1033" stroke-width="4" />
      <path d="M-34 -60 Q-38 -80 -32 -100" stroke="#ffd09a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>
    <g transform="translate(676 842) rotate(-24)">
      <path d="M0 0 V-170" stroke="#1b1033" stroke-width="16" stroke-linecap="round" />
      <path d="M0 0 V-170" stroke="#c8864a" stroke-width="9" stroke-linecap="round" />
      <path d="M-74 -150 Q0 -196 74 -150 Q0 -172 -74 -150 Z" fill="url(#mine-steel)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <rect x="-10" y="-180" width="20" height="24" rx="4" fill="#5a6488" stroke="#1b1033" stroke-width="4" />
      <path d="M-48 -164 Q-20 -180 10 -180" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>
    <path d="M690 812 Q700 778 740 774 Q780 772 796 806 Q760 818 690 812 Z" fill="#9a6a8a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />

    <g class="mine-cart">
      <g :transform="`translate(${f1(CART.x)} ${f1(CART.y)})`">
        <ellipse cx="0" cy="4" rx="150" ry="14" fill="#2a1020" opacity="0.35" />
        <path v-for="(g, i) in GEMS" :key="`gb${i}`" :d="g.base" :fill="g.pal[1]" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path v-for="(g, i) in GEMS" :key="`gf${i}`" :d="g.facet" :fill="g.pal[0]" opacity="0.85" />
        <path :d="GEMS.map((g) => g.glint).join(' ')" stroke="#fff" stroke-width="3" stroke-linecap="round" />
        <path d="M-140 -160 L140 -160 L116 -44 L-116 -44 Z" fill="url(#mine-cart)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
        <path d="M-150 -172 H150 V-156 H-150 Z" fill="#5a6488" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M-70 -156 L-62 -46 M0 -156 V-46 M70 -156 L62 -46" stroke="#7a3a2a" stroke-width="8" />
        <path d="M-120 -144 L-104 -60" stroke="#ffc0a0" stroke-width="5" stroke-linecap="round" opacity="0.8" />
        <path d="M-140 -168 H60" stroke="#c8d0ea" stroke-width="3" stroke-linecap="round" />
        <circle v-for="x in [-70, 0, 70]" :key="`rv${x}`" :cx="x" cy="-140" r="4" fill="#3a2030" />
        <path d="M-116 -44 H116" stroke="#1b1033" stroke-width="6" />
        <g v-for="x in [-74, 74]" :key="`wh${x}`" :transform="`translate(${x} -26)`">
          <g class="mine-wheel">
            <circle r="26" fill="#4a4c6a" stroke="#1b1033" stroke-width="5" />
            <circle r="16" fill="none" stroke="#8a90b4" stroke-width="3" />
            <path d="M-20 0 H20 M0 -20 V20" stroke="#1b1033" stroke-width="4" />
            <circle r="6" fill="#c8d0ea" stroke="#1b1033" stroke-width="3" />
          </g>
        </g>
        <path :d="CART_STARS" fill="#fff" />
      </g>
    </g>

    <g fill="#2c1a40" stroke="#120a20" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 V600 Q-10 620 24 760 Q54 900 110 1140 Z" />
      <path d="M-60 1140 Q-20 1030 80 1020 Q170 1024 200 1080 Q220 1110 230 1140 Z" />
      <path d="M1600 1140 Q1640 1020 1790 996 Q1920 984 1980 1000 V1140 Z" />
      <path d="M1980 1140 V560 Q1940 600 1920 720 Q1900 860 1870 1000 Z" />
    </g>
    <path d="M30 880 Q50 980 70 1040 M1660 1060 Q1720 1016 1800 1010" stroke="#5a3a78" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />

    <g class="mine-pulse-a">
      <template v-for="(c, i) in CRYSTALS" :key="`ha${i}`">
        <ellipse v-if="i % 2 === 0" cx="0" cy="-110" rx="210" ry="180" :transform="c.t" :fill="`url(#mine-halo-${c.halo})`" />
      </template>
    </g>
    <g class="mine-pulse-b">
      <template v-for="(c, i) in CRYSTALS" :key="`hb${i}`">
        <ellipse v-if="i % 2 === 1" cx="0" cy="-110" rx="210" ry="180" :transform="c.t" :fill="`url(#mine-halo-${c.halo})`" />
      </template>
    </g>

    <g v-for="(c, i) in CRYSTALS" :key="`cl${i}`" :transform="c.t">
      <ellipse cx="0" cy="0" rx="100" ry="16" fill="#1b1033" opacity="0.3" />
      <g v-for="(k, j) in c.items" :key="j" :transform="`translate(${k.dx} 0) rotate(${k.a})`">
        <path :d="k.f.l" :fill="k.pal[0]" />
        <path :d="k.f.m" :fill="k.pal[1]" />
        <path :d="k.f.r" :fill="k.pal[2]" />
        <path :d="k.f.o" fill="none" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path :d="k.f.g" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.9" />
      </g>
    </g>

    <path v-for="(d, i) in SPARKLES" :key="`sp${i}`" :d="d" fill="#fff" class="mine-twinkle" :style="{ animationDelay: `-${i * 0.8}s` }" />

    <g class="mine-bats">
      <g transform="translate(2100 360)">
        <g v-for="(b, i) in FLYERS" :key="`fb${i}`" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`">
          <g class="mine-flap" :style="{ animationDelay: `-${b.d}s` }">
            <path d="M-12 -4 Q-40 -34 -74 -12 Q-60 -6 -58 6 Q-46 -2 -40 10 Q-30 2 -14 8 Z M12 -4 Q40 -34 74 -12 Q60 -6 58 6 Q46 -2 40 10 Q30 2 14 8 Z" fill="#4a3488" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
          </g>
          <path d="M-12 -14 L-14 -30 L-4 -18 Z M12 -14 L14 -30 L4 -18 Z" fill="#6a4aa8" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
          <ellipse cx="0" cy="0" rx="17" ry="19" fill="#6a4aa8" stroke="#1b1033" stroke-width="4" />
          <circle cx="-6" cy="-4" r="5" fill="#fff" />
          <circle cx="6" cy="-4" r="5" fill="#fff" />
          <circle cx="-5" cy="-3" r="2.5" fill="#1b1033" />
          <circle cx="7" cy="-3" r="2.5" fill="#1b1033" />
          <path d="M-4 8 l2 5 l2 -5 M2 8 l2 5 l2 -5" fill="#fff" stroke="#1b1033" stroke-width="1.5" />
          <ellipse cx="-11" cy="5" rx="4" ry="2.5" fill="#ff8ab8" opacity="0.7" />
          <ellipse cx="11" cy="5" rx="4" ry="2.5" fill="#ff8ab8" opacity="0.7" />
        </g>
      </g>
    </g>
  </g>
</template>

<style scoped>
.mine-fall {
  animation: mine-fall 1.1s linear infinite;
}

.mine-pulse-a {
  animation: mine-pulse 3.4s ease-in-out infinite alternate;
}

.mine-pulse-b {
  animation: mine-pulse 4.2s ease-in-out -2s infinite alternate;
}

.mine-lamp-a {
  animation: mine-lamp 2.6s ease-in-out infinite alternate;
}

.mine-lamp-b {
  animation: mine-lamp 1.9s ease-in-out -1s infinite alternate;
}

.mine-twinkle {
  animation: mine-twinkle 3.2s ease-in-out infinite;
}

.mine-cart {
  animation: mine-cart 14s ease-in-out infinite;
}

.mine-wheel {
  transform-box: fill-box;
  transform-origin: center;
  animation: mine-wheel 14s ease-in-out infinite;
}

.mine-bats {
  animation: mine-bats 34s linear infinite;
}

.mine-flap {
  transform-box: fill-box;
  transform-origin: center;
  animation: mine-flap 0.36s ease-in-out infinite alternate;
}

@keyframes mine-fall {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 120px;
  }
}

@keyframes mine-pulse {
  from {
    opacity: 0.45;
  }
  to {
    opacity: 1;
  }
}

@keyframes mine-lamp {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}

@keyframes mine-twinkle {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

/* the cart nudges forward along the flat stretch, waits, then rolls back; wheels share the timing */
@keyframes mine-cart {
  0%,
  35% {
    translate: 0 0;
  }
  50%,
  80% {
    translate: 120px 1px;
  }
  95%,
  100% {
    translate: 0 0;
  }
}

@keyframes mine-wheel {
  0%,
  35% {
    rotate: 0deg;
  }
  50%,
  80% {
    rotate: 264deg;
  }
  95%,
  100% {
    rotate: 0deg;
  }
}

@keyframes mine-bats {
  0% {
    translate: 0 0;
  }
  12% {
    translate: -620px 50px;
  }
  24% {
    translate: -1240px -30px;
  }
  36% {
    translate: -1860px 40px;
  }
  48%,
  100% {
    translate: -2480px 0;
  }
}

@keyframes mine-flap {
  from {
    scale: 1 1;
  }
  to {
    scale: 1 0.3;
  }
}
</style>
