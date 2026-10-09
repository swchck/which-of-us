<script setup lang="ts">
import { seeded, tufts, twinkleGroups } from './kit';

const rnd = seeded(26059);
const f1 = (n: number) => n.toFixed(1);

function firRow(base: number, step: number, hMin: number, hMax: number): string {
  let d = `M-60 1140 L-60 ${base}`;
  for (let x = -60; x < 2040; x += step * (0.7 + rnd() * 0.6)) {
    const h = hMin + rnd() * (hMax - hMin);
    const w = step * 0.55;
    d += ` L${f1(x - w)} ${base} L${f1(x - w * 0.45)} ${f1(base - h * 0.45)} L${f1(x - w * 0.7)} ${f1(base - h * 0.45)} L${f1(x)} ${f1(base - h)} L${f1(x + w * 0.7)} ${f1(base - h * 0.45)} L${f1(x + w * 0.45)} ${f1(base - h * 0.45)} L${f1(x + w)} ${base}`;
  }
  return `${d} L1980 ${base} L1980 1140 Z`;
}
const FAR_FIRS = firRow(690, 90, 120, 210);
const MID_FIRS = firRow(740, 130, 150, 260);

// canopy clusters: many puffs merged into one path per shade, so a whole canopy is a few nodes
const puffs = (cx: number, cy: number, n: number, spread: number, r: number) =>
  Array.from({ length: n }, () => {
    const x = cx + (rnd() - 0.5) * spread * 2;
    const y = cy + (rnd() - 0.5) * spread;
    const rr = r * (0.6 + rnd() * 0.6);
    return `M${f1(x - rr)} ${f1(y)} a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(rr * 2)} 0 a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-rr * 2)} 0 Z`;
  }).join(' ');
type Cluster = [number, number, number];
const canopy = (clusters: Cluster[]) => ({
  deep: clusters.map(([x, y, s]) => puffs(x + 12, y + 18, 7, s, s * 0.44)).join(' '),
  mid: clusters.map(([x, y, s]) => puffs(x, y, 8, s, s * 0.36)).join(' '),
  light: clusters.map(([x, y, s]) => puffs(x - 16, y - 18, 5, s * 0.7, s * 0.22)).join(' '),
});
const MID_CANOPY = canopy([
  [380, 30, 120],
  [600, 70, 100],
  [740, 10, 80],
  [1200, 20, 80],
  [1360, 60, 110],
  [1560, 20, 120],
]);
const NEAR_CANOPY = canopy([
  [-10, 40, 150],
  [190, 10, 130],
  [330, 110, 90],
  [1640, 110, 100],
  [1790, 20, 140],
  [1960, 130, 130],
]);
const LEAF_VEINS = [
  [60, 120],
  [250, 60],
  [1720, 80],
  [1880, 150],
]
  .map(([x = 0, y = 0]) => `M${x - 40} ${y + 20} q30 -16 60 -6 M${x + 10} ${y - 30} q24 -8 44 4`)
  .join(' ');

const MID_TRUNKS = [
  { x: 470, w: 46, top: 40 },
  { x: 640, w: 34, top: 60 },
  { x: 1300, w: 38, top: 50 },
  { x: 1470, w: 52, top: 30 },
];

const SHAFTS = [
  { d: 'M880 -60 L980 -60 L760 820 L560 820 Z', s: 7, delay: 0 },
  { d: 'M1010 -60 L1070 -60 L960 800 L840 800 Z', s: 9, delay: 3 },
  { d: 'M1120 -60 L1220 -60 L1260 800 L1080 800 Z', s: 8, delay: 5 },
];

const PATH_STONES = [
  { x: 968, y: 772, rx: 10, ry: 3 },
  { x: 990, y: 800, rx: 14, ry: 4 },
  { x: 958, y: 838, rx: 20, ry: 6 },
  { x: 1010, y: 880, rx: 26, ry: 8 },
  { x: 930, y: 930, rx: 34, ry: 10 },
  { x: 1020, y: 990, rx: 42, ry: 12 },
  { x: 900, y: 1060, rx: 54, ry: 15 },
];

const MUSHROOMS = [
  { x: 560, y: 960, k: 1.15, cap: '#e8402e', spot: '#fffaf0', glow: false },
  { x: 690, y: 1004, k: 0.55, cap: '#ff7a3a', spot: '#fff1d6', glow: false },
  { x: 1430, y: 930, k: 0.85, cap: '#e8402e', spot: '#fffaf0', glow: false },
  { x: 1350, y: 978, k: 0.5, cap: '#c8602e', spot: '#ffe0b0', glow: false },
  { x: 1690, y: 1010, k: 0.44, cap: '#4fe0d0', spot: '#e6fffb', glow: true },
  { x: 1748, y: 1028, k: 0.32, cap: '#4fe0d0', spot: '#e6fffb', glow: true },
  { x: 250, y: 1056, k: 0.4, cap: '#b07aff', spot: '#f2e6ff', glow: true },
  { x: 302, y: 1070, k: 0.28, cap: '#b07aff', spot: '#f2e6ff', glow: true },
];
const SPOTS = [
  [-50, -140, 14],
  [2, -172, 16],
  [46, -132, 12],
  [-12, -118, 8],
  [62, -164, 8],
];
const MUSHROOM_GLOWS = MUSHROOMS.filter((m) => m.glow);

const FERNS = [
  { x: 380, y: 1070, k: 1, flip: 1, d: 0 },
  { x: 1570, y: 1066, k: 0.95, flip: -1, d: 1.6 },
];
// arching fronds: leaflets placed along each quadratic midrib, shrinking toward the tip
function frond(angle: number, len: number) {
  const a = (angle * Math.PI) / 180;
  const ex = Math.sin(a) * len * 1.15;
  const ey = -Math.cos(a) * len * 0.7;
  const cx = Math.sin(a) * len * 0.35;
  const cy = -len * 0.95;
  let leaves = '';
  for (let t = 0.14; t < 0.97; t += 0.065) {
    const u = 1 - t;
    const px = 2 * u * t * cx + t * t * ex;
    const py = 2 * u * t * cy + t * t * ey;
    const tx = 2 * u * cx + 2 * t * (ex - cx);
    const ty = 2 * u * cy + 2 * t * (ey - cy);
    const tl = Math.hypot(tx, ty);
    const [ux, uy] = [tx / tl, ty / tl];
    const sz = 46 * (1 - t * 0.7);
    for (const side of [1, -1]) {
      const [nx, ny] = [-uy * side, ux * side];
      const tip = [px + nx * sz + ux * sz * 0.5, py + ny * sz + uy * sz * 0.5];
      const c1 = [px + nx * sz * 0.2 + ux * sz * 0.6, py + ny * sz * 0.2 + uy * sz * 0.6];
      const c2 = [px + nx * sz * 0.8 - ux * sz * 0.15, py + ny * sz * 0.8 - uy * sz * 0.15];
      leaves += `M${f1(px)} ${f1(py)} Q${c1.map(f1).join(' ')} ${tip.map(f1).join(' ')} Q${c2.map(f1).join(' ')} ${f1(px)} ${f1(py)} Z `;
    }
  }
  return { rib: `M0 0 Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}`, leaves };
}
const BACK_FRONDS = [frond(-62, 200), frond(-8, 250), frond(48, 210)];
const FRONT_FRONDS = [frond(-34, 220), frond(22, 230), frond(74, 170)];
const FERN_LAYERS = [
  { fronds: BACK_FRONDS, fill: '#2a8a4c', rib: '#1f6a3a' },
  { fronds: FRONT_FRONDS, fill: '#4cb862', rib: '#a8e890' },
].map((l) => ({ ...l, leaves: l.fronds.map((f) => f.leaves).join(' '), ribs: l.fronds.map((f) => f.rib).join(' ') }));

const FIREFLIES = twinkleGroups(
  Array.from({ length: 44 }, (_, i) => {
    const zone = i % 3;
    const cx = zone === 0 ? 420 : zone === 1 ? 1560 : 980;
    const cy = zone === 2 ? 700 : 820;
    return { x: cx + (rnd() - 0.5) * (zone === 2 ? 700 : 420), y: cy + (rnd() - 0.5) * 300 };
  }),
);

// each sheet is drawn twice, one drift-length apart, so the rise loops without a seam
const seed = (x: number, y: number, a: number) => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const tip = (l: number, da: number) => `M${f1(x)} ${f1(y)} l${f1(Math.sin(a + da) * l)} ${f1(-Math.cos(a + da) * l)}`;
  return `M${f1(x)} ${f1(y)} l${f1(-s * 12)} ${f1(c * 12)} ${tip(9, -0.7)} ${tip(10, 0)} ${tip(9, 0.7)}`;
};
const SEED_SHEETS = [30, 22].map((s, i) => {
  const pts = Array.from({ length: 16 }, () => ({ x: rnd() * 2220 - 300, y: rnd() * 1080, a: (rnd() - 0.5) * 1.2 }));
  return {
    s,
    d: i * 9,
    path: pts.map((p) => `${seed(p.x, p.y, p.a)} ${seed(p.x - 300, p.y + 1080, p.a)}`).join(' '),
    heads: pts.flatMap((p) => [`M${f1(p.x)} ${f1(p.y)} h0.1`, `M${f1(p.x - 300)} ${f1(p.y + 1080)} h0.1`]).join(' '),
  };
});

const BARK_LINES =
  'M60 -40 C40 200 90 400 80 640 M130 60 C110 260 150 460 170 700 M20 300 C10 420 30 520 20 600 ' +
  'M1830 -40 C1850 200 1800 420 1810 640 M1900 80 C1920 300 1880 500 1900 720 M1760 160 C1780 300 1750 420 1750 520';
</script>

<template>
  <g>
    <defs>
      <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#244f5e" />
        <stop offset="38%" stop-color="#4f8f84" />
        <stop offset="62%" stop-color="#e6c58a" />
        <stop offset="100%" stop-color="#ffefc2" />
      </linearGradient>
      <linearGradient id="forest-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff2cc" stop-opacity="0" />
        <stop offset="60%" stop-color="#fff2cc" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fff2cc" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="forest-shaft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6d0" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fff6d0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="forest-moss" gradientUnits="userSpaceOnUse" x1="0" y1="740" x2="0" y2="1140">
        <stop offset="0%" stop-color="#8cc47a" />
        <stop offset="100%" stop-color="#3f7a4e" />
      </linearGradient>
      <linearGradient id="forest-path" gradientUnits="userSpaceOnUse" x1="0" y1="750" x2="0" y2="1140">
        <stop offset="0%" stop-color="#fff0c4" />
        <stop offset="100%" stop-color="#d79e62" />
      </linearGradient>
      <linearGradient id="forest-bark" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#a8725a" />
        <stop offset="100%" stop-color="#55302e" />
      </linearGradient>
      <linearGradient id="forest-bark-r" x1="1" y1="0" x2="0" y2="0.3">
        <stop offset="0%" stop-color="#8a5a4a" />
        <stop offset="100%" stop-color="#4a2a2c" />
      </linearGradient>
      <linearGradient id="forest-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5c9a52" />
        <stop offset="100%" stop-color="#2a5a3a" />
      </linearGradient>
      <radialGradient id="forest-sun">
        <stop offset="0%" stop-color="#fff8d8" stop-opacity="0.95" />
        <stop offset="45%" stop-color="#ffe2a0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ffe2a0" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="forest-glow">
        <stop offset="0%" stop-color="#fff0a0" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#ffd86b" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="forest-teal-glow">
        <stop offset="0%" stop-color="#b8fff4" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#4fe0d0" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="forest-fly">
        <stop offset="0%" stop-color="#fffbe0" />
        <stop offset="30%" stop-color="#fff27a" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#d8ff6a" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#forest-sky)" />
    <circle cx="975" cy="650" r="430" fill="url(#forest-sun)" />

    <path :d="FAR_FIRS" fill="#b4d8bc" stroke="#8cb8a4" stroke-width="3" stroke-linejoin="round" />
    <rect x="-60" y="540" width="2040" height="200" fill="url(#forest-haze)" />
    <path :d="MID_FIRS" fill="#86b89c" stroke="#5f9484" stroke-width="3" stroke-linejoin="round" />
    <rect x="-60" y="620" width="2040" height="180" fill="url(#forest-haze)" />

    <g v-for="(t, i) in MID_TRUNKS" :key="`mt${i}`">
      <path :d="`M${t.x - t.w / 2} 780 Q${t.x - t.w / 2 + 6} 400 ${t.x - t.w / 3} ${t.top} H${t.x + t.w / 3} Q${t.x + t.w / 2 - 6} 400 ${t.x + t.w / 2} 780 Z`" fill="#6f8c7c" stroke="#466a5e" stroke-width="3.5" stroke-linejoin="round" />
      <path :d="`M${t.x - t.w / 6} 760 Q${t.x - t.w / 6 + 4} 420 ${t.x - t.w / 8} ${t.top + 40}`" stroke="#8eaa98" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
      <path :d="`M${t.x + t.w / 6} 700 v-60 M${t.x} 500 v-50 M${t.x + t.w / 5} 300 v-40`" stroke="#4f6e62" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    </g>
    <path :d="MID_CANOPY.deep" fill="#4f7e6c" stroke="#3e6658" stroke-width="6" />
    <path :d="MID_CANOPY.mid" fill="#6a9a7e" />
    <path :d="MID_CANOPY.light" fill="#8cb896" />

    <path d="M-60 790 Q420 742 960 752 Q1500 762 1980 784 L1980 1140 L-60 1140 Z" fill="url(#forest-moss)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(40, 770, 860, 0.013)" stroke="#5a944e" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    <path :d="tufts(1100, 772, 1900, 0.013)" stroke="#5a944e" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />

    <path
      d="M952 752 C900 800 1012 826 944 878 C866 936 760 990 690 1140 L1250 1140 C1200 1010 1080 950 1084 884 C1088 832 1000 800 990 752 Z"
      fill="url(#forest-path)"
      stroke="#1b1033"
      stroke-width="4"
      stroke-linejoin="round"
      filter="url(#cel)"
    />
    <path d="M972 770 C950 800 1000 820 980 850 M960 900 C900 950 840 1000 800 1080" stroke="#fff8e0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    <g fill="#c8a07a" stroke="#8a6a4a" stroke-width="2.5">
      <ellipse v-for="(s, i) in PATH_STONES" :key="`ps${i}`" :cx="s.x" :cy="s.y" :rx="s.rx" :ry="s.ry" />
    </g>
    <path d="M934 926 q14 -6 28 -4 M1004 986 q18 -6 34 -4 M876 1054 q24 -8 46 -6" stroke="#f6e2c4" stroke-width="3" fill="none" stroke-linecap="round" />

    <g v-for="(s, i) in SHAFTS" :key="`sh${i}`" class="forest-shaft" :style="{ animationDuration: `${s.s}s`, animationDelay: `-${s.delay}s` }">
      <path :d="s.d" fill="url(#forest-shaft)" />
    </g>

    <g class="forest-mist">
      <ellipse cx="900" cy="760" rx="200" ry="22" fill="#fff8e6" opacity="0.55" />
      <ellipse cx="1080" cy="778" rx="160" ry="16" fill="#fff8e6" opacity="0.45" />
      <ellipse cx="700" cy="790" rx="140" ry="12" fill="#fff8e6" opacity="0.35" />
      <ellipse cx="1280" cy="800" rx="120" ry="12" fill="#fff8e6" opacity="0.35" />
    </g>

    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M240 900 Q340 980 470 990 Q560 996 640 1050 M180 1000 Q270 1070 300 1150 M300 930 Q420 930 520 880" stroke="#1b1033" stroke-width="36" />
      <path d="M240 900 Q340 980 470 990 Q560 996 640 1050 M180 1000 Q270 1070 300 1150 M300 930 Q420 930 520 880" stroke="#7a4a3a" stroke-width="26" />
      <path d="M260 896 Q350 966 470 978 M310 920 Q420 920 510 872" stroke="#b07a5c" stroke-width="5" opacity="0.8" />
      <path d="M1680 900 Q1560 980 1430 990 Q1340 996 1270 1050 M1760 1000 Q1680 1070 1660 1150 M1640 930 Q1520 940 1420 890" stroke="#1b1033" stroke-width="36" />
      <path d="M1680 900 Q1560 980 1430 990 Q1340 996 1270 1050 M1760 1000 Q1680 1070 1660 1150 M1640 930 Q1520 940 1420 890" stroke="#6a3e34" stroke-width="26" />
      <path d="M1660 898 Q1560 966 1440 978 M1630 920 Q1520 930 1430 882" stroke="#9a6a54" stroke-width="5" opacity="0.8" />
    </g>
    <ellipse cx="560" cy="1050" rx="110" ry="12" fill="#1b2a10" opacity="0.25" />

    <path
      d="M-60 -60 H230 C196 180 236 420 262 640 C282 790 336 880 430 950 C360 966 300 946 268 914 C280 990 240 1050 190 1100 C170 1040 140 1000 100 990 L-60 1010 Z"
      fill="url(#forest-bark)"
      stroke="#1b1033"
      stroke-width="6"
      stroke-linejoin="round"
      filter="url(#cel)"
    />
    <path
      d="M1980 -60 H1700 C1734 180 1690 420 1664 640 C1644 790 1590 880 1496 950 C1566 966 1626 946 1658 914 C1646 990 1686 1050 1736 1100 C1756 1040 1786 1000 1826 990 L1980 1010 Z"
      fill="url(#forest-bark-r)"
      stroke="#1b1033"
      stroke-width="6"
      stroke-linejoin="round"
      filter="url(#cel)"
    />
    <path :d="BARK_LINES" stroke="#3a1e22" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.45" />
    <path d="M196 40 C176 220 210 420 232 600 M1736 60 C1756 240 1720 420 1700 580" stroke="#d09a7a" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6" />
    <g fill="#5a3430" stroke="#1b1033" stroke-width="4">
      <ellipse cx="90" cy="460" rx="22" ry="30" />
      <ellipse cx="1820" cy="560" rx="18" ry="26" />
    </g>
    <path d="M84 446 q6 -8 14 -6 M1814 548 q6 -8 12 -4" stroke="#1b1033" stroke-width="4" fill="none" stroke-linecap="round" />

    <path d="M180 300 Q320 230 470 262 M380 246 Q420 200 470 190" stroke="#1b1033" stroke-width="40" fill="none" stroke-linecap="round" />
    <path d="M180 300 Q320 230 470 262 M380 246 Q420 200 470 190" stroke="#7a4a3a" stroke-width="28" fill="none" stroke-linecap="round" />
    <path d="M1720 430 Q1600 380 1450 410" stroke="#1b1033" stroke-width="38" fill="none" stroke-linecap="round" />
    <path d="M1720 430 Q1600 380 1450 410" stroke="#6a3e34" stroke-width="26" fill="none" stroke-linecap="round" />
    <path d="M200 286 Q320 226 440 248 M1700 418 Q1600 376 1470 400" stroke="#c08868" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />

    <path :d="NEAR_CANOPY.deep" fill="#1b1033" stroke="#1b1033" stroke-width="10" />
    <path :d="NEAR_CANOPY.deep" fill="#2f6e4a" filter="url(#cel-s)" />
    <path :d="NEAR_CANOPY.mid" fill="#3f8a56" />
    <path :d="NEAR_CANOPY.light" fill="#6cb86a" />
    <path :d="LEAF_VEINS" stroke="#a8e08a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />

    <g transform="translate(150 720)">
      <circle r="90" fill="url(#forest-glow)" class="forest-pulse" />
      <circle r="38" fill="#6a3a2e" stroke="#1b1033" stroke-width="5" />
      <circle r="28" fill="#ffd86b" stroke="#1b1033" stroke-width="4" />
      <path d="M0 -28 V28 M-28 0 H28" stroke="#6a3a2e" stroke-width="5" />
      <path d="M-18 -10 q4 -8 10 -10" stroke="#fffbe0" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-46 -30 Q0 -64 46 -30" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
      <path d="M-46 -30 Q0 -64 46 -30" stroke="#3f8a56" stroke-width="6" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(165 990)">
      <ellipse cx="0" cy="14" rx="80" ry="12" fill="#1b2a10" opacity="0.3" />
      <path d="M-70 14 Q-70 -4 -50 -6 H50 Q70 -4 70 14 Z" fill="#b8b0c0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-56 -6 V-90 A56 56 0 0 1 56 -90 V-6 Z" fill="#4a2a26" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-44 -6 V-88 A44 44 0 0 1 44 -88 V-6 Z" fill="#d0602e" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-15 -8 V-128 M15 -8 V-128" stroke="#9a3a1e" stroke-width="4" />
      <path d="M-34 -40 h68 M-34 -90 h68" stroke="#3a2a2a" stroke-width="5" stroke-linecap="round" />
      <circle cx="28" cy="-56" r="6" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
      <path d="M-34 -96 Q-26 -120 -6 -128" stroke="#ff9a6a" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1560 404)">
      <path d="M-40 -6 Q0 18 40 -6" stroke="#1b1033" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M-40 -6 Q0 18 40 -6" stroke="#ffb02e" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="6 10" />
      <path d="M-46 -70 L-56 -138 L-22 -110 Q0 -118 22 -110 L56 -138 L46 -70 Q54 -10 0 -2 Q-54 -10 -46 -70 Z" fill="#9a6a4a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-26 -50 Q0 -64 26 -50 Q30 -14 0 -8 Q-30 -14 -26 -50 Z" fill="#f2d6a8" stroke="#1b1033" stroke-width="3" />
      <path d="M-14 -40 l6 6 l6 -6 M2 -30 l6 6 l6 -6 M-10 -22 l6 6 l6 -6" stroke="#b08a5a" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M-46 -60 Q-66 -40 -50 -10 Q-40 -30 -44 -60 Z M46 -60 Q66 -40 50 -10 Q40 -30 44 -60 Z" fill="#6a4430" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
      <circle cx="-20" cy="-88" r="20" fill="#fff6d0" stroke="#1b1033" stroke-width="4" />
      <circle cx="20" cy="-88" r="20" fill="#fff6d0" stroke="#1b1033" stroke-width="4" />
      <circle cx="-18" cy="-86" r="10" fill="#ff9a1e" />
      <circle cx="18" cy="-86" r="10" fill="#ff9a1e" />
      <circle cx="-18" cy="-86" r="5.5" fill="#1b1033" />
      <circle cx="18" cy="-86" r="5.5" fill="#1b1033" />
      <circle cx="-21" cy="-90" r="2.5" fill="#fff" />
      <circle cx="15" cy="-90" r="2.5" fill="#fff" />
      <g class="forest-blink" fill="#7a5038" stroke="#1b1033" stroke-width="4">
        <circle cx="-20" cy="-88" r="20" />
        <circle cx="20" cy="-88" r="20" />
      </g>
      <path d="M-6 -72 L0 -58 L6 -72 Z" fill="#ffb02e" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-36 -118 Q-24 -126 -10 -124" stroke="#c8a07a" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1800 920)">
      <ellipse cx="0" cy="0" rx="62" ry="84" fill="#5a3430" stroke="#1b1033" stroke-width="6" />
      <ellipse cx="2" cy="6" rx="48" ry="70" fill="#1e0f1c" />
      <g class="forest-ear">
        <path d="M-34 -6 L-30 -50 L-8 -22 Z M34 -6 L30 -50 L8 -22 Z" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-28 -14 L-27 -38 L-14 -22 Z M28 -14 L27 -38 L14 -22 Z" fill="#2a1420" />
      </g>
      <path d="M-40 4 Q-36 -28 0 -28 Q36 -28 40 4 Q30 30 0 44 Q-30 30 -40 4 Z" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-30 14 Q-12 12 0 28 Q12 12 30 14 Q20 36 0 44 Q-20 36 -30 14 Z" fill="#fffaf0" />
      <circle cx="0" cy="38" r="6" fill="#1b1033" />
      <ellipse cx="-14" cy="0" rx="5" ry="7" fill="#1b1033" />
      <ellipse cx="14" cy="0" rx="5" ry="7" fill="#1b1033" />
      <circle cx="-15" cy="-3" r="2" fill="#fff" />
      <circle cx="13" cy="-3" r="2" fill="#fff" />
      <path d="M-26 -16 q10 -8 20 -6" stroke="#ffb07a" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-40 70 q12 -14 28 -6 M40 70 q-12 -14 -28 -6" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M-40 70 q12 -14 28 -6 M40 70 q-12 -14 -28 -6" stroke="#ff7a2f" stroke-width="9" fill="none" stroke-linecap="round" />
      <path d="M-56 -50 Q-40 -76 -10 -82" stroke="#a87060" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>

    <g class="forest-pulse" style="animation-duration: 3s">
      <circle v-for="(m, i) in MUSHROOM_GLOWS" :key="`mg${i}`" :cx="m.x" :cy="m.y - 130 * m.k" :r="200 * m.k" fill="url(#forest-teal-glow)" />
    </g>
    <g v-for="(m, i) in MUSHROOMS" :key="`mu${i}`" :transform="`translate(${m.x} ${m.y}) scale(${m.k})`">
      <ellipse cx="6" cy="2" rx="96" ry="14" fill="#1b2a10" opacity="0.3" />
      <path d="M-24 0 Q-32 -56 -18 -100 H18 Q32 -56 24 0 Z" fill="#fff2dc" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M8 -90 Q20 -50 12 -4" stroke="#d8c4a4" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M-22 -58 Q0 -44 22 -58" stroke="#1b1033" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-86 -92 Q0 -58 86 -92 Q0 -78 -86 -92 Z" fill="#e8c8a0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-92 -90 Q-96 -196 0 -200 Q96 -196 92 -90 Q0 -72 -92 -90 Z" :fill="m.cap" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <circle v-for="(s, j) in SPOTS" :key="j" :cx="s[0]" :cy="s[1]" :r="s[2]" :fill="m.spot" stroke="#1b1033" stroke-width="2.5" />
      <path d="M-70 -138 Q-60 -176 -24 -188" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.75" />
    </g>

    <path d="M-60 1000 Q300 1050 700 1090 Q1100 1110 1240 1100 Q1600 1040 1980 990 L1980 1140 L-60 1140 Z" fill="url(#forest-front)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(20, 1040, 640, 0.02)" stroke="#2a5a34" stroke-width="5" fill="none" stroke-linecap="round" />
    <path :d="tufts(1300, 1050, 1900, 0.02)" stroke="#2a5a34" stroke-width="5" fill="none" stroke-linecap="round" />

    <g v-for="(f, i) in FERNS" :key="`fe${i}`" :transform="`translate(${f.x} ${f.y}) scale(${f.k * f.flip} ${f.k})`">
      <g class="forest-fern" :style="{ animationDelay: `-${f.d}s` }">
        <template v-for="(l, j) in FERN_LAYERS" :key="j">
          <path :d="l.ribs" stroke="#1b1033" stroke-width="9" fill="none" stroke-linecap="round" />
          <path :d="l.leaves" :fill="l.fill" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <path :d="l.ribs" :stroke="l.rib" stroke-width="4" fill="none" stroke-linecap="round" />
        </template>
      </g>
    </g>

    <g fill="#123a28" stroke="#0b1a12" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q60 1030 230 1030 Q140 1080 150 1140 Z" />
      <path d="M1980 1140 Q1880 1070 1720 1080 Q1790 1110 1780 1140 Z" />
      <path d="M1980 1140 Q1990 1020 1900 1010 Q1930 1080 1890 1140 Z" />
    </g>

    <g v-for="(grp, i) in FIREFLIES" :key="`ff${i}`" class="forest-fly" :style="{ animationDelay: `-${i * 0.9}s`, animationDuration: `${3 + i * 0.6}s` }">
      <circle v-for="(p, j) in grp" :key="j" :cx="p.x" :cy="p.y" r="14" fill="url(#forest-fly)" />
    </g>

    <g v-for="(sh, i) in SEED_SHEETS" :key="`sd${i}`" class="forest-seeds" :style="{ animationDuration: `${sh.s}s`, animationDelay: `-${sh.d}s` }">
      <path :d="sh.path" stroke="#fffaf0" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.85" />
      <path :d="sh.heads" stroke="#c8a87a" stroke-width="5" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.forest-shaft {
  animation: forest-shaft ease-in-out infinite alternate;
}

.forest-pulse {
  animation: forest-pulse 2.6s ease-in-out infinite alternate;
}

.forest-mist {
  animation: forest-mist 14s ease-in-out infinite alternate;
}

.forest-blink {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: forest-blink 5s ease-in-out infinite;
}

.forest-ear {
  animation: forest-ear 4s ease-in-out infinite;
}

.forest-fern {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: forest-fern 4s ease-in-out infinite alternate;
}

.forest-fly {
  animation: forest-fly ease-in-out infinite alternate;
}

.forest-seeds {
  animation: forest-seeds linear infinite;
}

@keyframes forest-shaft {
  from {
    opacity: 0.35;
  }
  to {
    opacity: 1;
  }
}

@keyframes forest-pulse {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}

@keyframes forest-mist {
  from {
    translate: -40px 0;
  }
  to {
    translate: 40px 0;
  }
}

@keyframes forest-blink {
  0%,
  90%,
  100% {
    scale: 1 0;
  }
  94% {
    scale: 1 1;
  }
}

@keyframes forest-ear {
  0%,
  80%,
  100% {
    translate: 0 0;
  }
  84%,
  92% {
    translate: 0 -5px;
  }
  88% {
    translate: 0 1px;
  }
}

@keyframes forest-fern {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes forest-fly {
  0% {
    opacity: 0.15;
    translate: 0 0;
  }
  100% {
    opacity: 1;
    translate: 12px -18px;
  }
}

@keyframes forest-seeds {
  from {
    translate: 0 0;
  }
  to {
    translate: 300px -1080px;
  }
}
</style>
