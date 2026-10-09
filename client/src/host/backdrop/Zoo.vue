<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(921);
const f1 = (n: number) => n.toFixed(1);

const CLOUDS = [
  { y: 150, k: 0.9, d: 10, s: 80 },
  { y: 280, k: 0.6, d: 52, s: 100 },
];
const BIRDS = [
  { y: 210, k: 0.55, s: 30, d: 6, c: '#ff5a5a' },
  { y: 330, k: 0.4, s: 38, d: 21, c: '#3fa8ff' },
];

const spiky = (n: number, ro: number, ri: number) =>
  `M${Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI) / n;
    const r = i % 2 ? ri : ro;
    return `${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`;
  }).join(' L')} Z`;
const MANE = spiky(16, 56, 42);

const NECK = 'M-34 30 C-30 -100 0 -200 40 -270 L84 -256 C52 -190 30 -100 34 30 Z';
const NECK_SPOTS = [
  [-8, -10, 16, 12],
  [18, -50, 14, 11],
  [-12, -64, 10, 9],
  [-2, -100, 13, 10],
  [26, -124, 12, 10],
  [8, -160, 12, 9],
  [42, -196, 11, 9],
  [30, -232, 10, 8],
  [60, -240, 8, 7],
];
const BODY_SPOTS = Array.from({ length: 14 }, () => ({ x: 190 + rnd() * 230, y: 640 + rnd() * 90, r: 10 + rnd() * 9 }));
const FENCE_POSTS = Array.from({ length: 11 }, (_, i) => -40 + i * 62);

const FLAMINGOS = [
  { x: 270, y: 1004, k: 1, d: 0 },
  { x: 420, y: 1030, k: 1.1, d: 1.4 },
  { x: 575, y: 996, k: 0.9, d: 2.6 },
];
const LILIES = [
  { x: 160, y: 1010, r: 22 },
  { x: 690, y: 1040, r: 18 },
  { x: 520, y: 1064, r: 20 },
];

const BALLOONS = [
  { x: -62, y: -224, r: 34, c: '#ff4d6d', dark: '#c22a4a' },
  { x: 58, y: -232, r: 36, c: '#5ab8ff', dark: '#2f7fd0' },
  { x: -4, y: -280, r: 40, c: '#ffd23f', dark: '#d9a01a' },
  { x: -34, y: -176, r: 30, c: '#9b5cff', dark: '#6a32c8' },
  { x: 34, y: -170, r: 30, c: '#7be06a', dark: '#45a83a' },
  { x: 2, y: -214, r: 32, c: '#ff8ccf', dark: '#d8569a' },
];

type Pt = [number, number];
const qAt = (p0: Pt, c: Pt, p1: Pt, t: number): Pt => [
  (1 - t) * (1 - t) * p0[0] + 2 * t * (1 - t) * c[0] + t * t * p1[0],
  (1 - t) * (1 - t) * p0[1] + 2 * t * (1 - t) * c[1] + t * t * p1[1],
];
const FLAG_COLORS = ['#ff4d6d', '#ffd23f', '#2ec9b0', '#9b5cff', '#ff7a2f', '#5ab8ff'];
const bunting = (p0: Pt, c: Pt, p1: Pt, n: number) => ({
  line: `M${p0[0]} ${p0[1]} Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`,
  flags: Array.from({ length: n }, (_, i) => {
    const [x, y] = qAt(p0, c, p1, (i + 0.5) / n);
    return { d: `M${f1(x - 14)} ${f1(y)} L${f1(x + 14)} ${f1(y)} L${f1(x)} ${f1(y + 32)} Z`, c: FLAG_COLORS[i % FLAG_COLORS.length] };
  }),
});
const BUNTING = [bunting([1490, 560], [1560, 610], [1640, 540], 4), bunting([1640, 540], [1800, 600], [1990, 500], 7)];
const BUSHES = [
  { x: 900, y: 772, k: 0.7 },
  { x: 1180, y: 940, k: 1 },
];
const PEBBLES = Array.from({ length: 26 }, () => {
  const t = rnd();
  const y = 760 + t * 360;
  const x = 980 + (t - 0.2) * 160 + (rnd() - 0.5) * 120 * t;
  return `M${f1(x)} ${f1(y)} h${f1(4 + t * 8)}`;
}).join(' ');
</script>

<template>
  <g>
    <defs>
      <radialGradient id="zoo-sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fffbe0" />
        <stop offset="70%" stop-color="#ffe680" />
        <stop offset="100%" stop-color="#ffc94a" />
      </radialGradient>
      <linearGradient id="zoo-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff8dc" stop-opacity="0" />
        <stop offset="60%" stop-color="#fff8dc" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#fff8dc" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="zoo-mid" gradientUnits="userSpaceOnUse" x1="0" y1="700" x2="0" y2="1100">
        <stop offset="0%" stop-color="#a6e05a" />
        <stop offset="100%" stop-color="#6fbf3c" />
      </linearGradient>
      <linearGradient id="zoo-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5fb43a" />
        <stop offset="100%" stop-color="#2f7a2a" />
      </linearGradient>
      <linearGradient id="zoo-path" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffeec0" />
        <stop offset="100%" stop-color="#f2c97a" />
      </linearGradient>
      <linearGradient id="zoo-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d9a066" />
        <stop offset="100%" stop-color="#94592e" />
      </linearGradient>
      <linearGradient id="zoo-giraffe" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffd86a" />
        <stop offset="100%" stop-color="#f2a93a" />
      </linearGradient>
      <linearGradient id="zoo-elephant" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c2bff0" />
        <stop offset="100%" stop-color="#8781c4" />
      </linearGradient>
      <linearGradient id="zoo-lion" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffcf6a" />
        <stop offset="100%" stop-color="#e09a32" />
      </linearGradient>
      <linearGradient id="zoo-rock" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e2c8a8" />
        <stop offset="100%" stop-color="#a88a72" />
      </linearGradient>
      <linearGradient id="zoo-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7fe0f0" />
        <stop offset="100%" stop-color="#2fa8d0" />
      </linearGradient>
      <linearGradient id="zoo-canopy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6ccf4a" />
        <stop offset="100%" stop-color="#2f8a3a" />
      </linearGradient>
      <linearGradient id="zoo-kiosk" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7fd0ff" />
        <stop offset="100%" stop-color="#3a8ad8" />
      </linearGradient>
      <clipPath id="zoo-neck-clip">
        <path :d="NECK" />
      </clipPath>
      <clipPath id="zoo-pond-clip">
        <ellipse cx="420" cy="1000" rx="350" ry="96" />
      </clipPath>
    </defs>

    <circle cx="1640" cy="170" r="190" fill="#fff6c8" opacity="0.25" />
    <circle cx="1640" cy="170" r="120" fill="#fff6c8" fill-opacity="0.35" class="glow" />
    <circle cx="1640" cy="170" r="74" fill="url(#zoo-sun)" stroke="#e8a030" stroke-width="5" />
    <path d="M1606 140 Q1622 118 1652 114" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.8" />

    <g v-for="(c, i) in CLOUDS" :key="`cl${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-130 20 Q-160 -14 -116 -30 Q-110 -70 -56 -62 Q-30 -104 26 -88 Q70 -110 100 -66 Q150 -62 138 -18 Q160 14 116 22 Z" fill="#fff" stroke="#8ec8ec" stroke-width="4" stroke-linejoin="round" />
        <path d="M-116 16 Q0 2 118 18 Q40 32 -116 16 Z" fill="#d6eefc" />
        <path d="M-76 -50 Q-54 -68 -30 -64 M6 -80 Q32 -94 58 -84" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="(b, i) in BIRDS" :key="`bd${i}`" class="gull" :style="{ animationDelay: `-${b.d}s`, animationDuration: `${b.s}s` }">
      <g :transform="`translate(0 ${b.y}) scale(${b.k})`">
        <path d="M0 0 Q-30 -50 -80 -40 Q-50 -16 -30 8 Q-10 -4 0 8 Q10 -4 30 8 Q50 -16 80 -40 Q30 -50 0 0 Z" :fill="b.c" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" class="flap" />
        <ellipse cx="0" cy="6" rx="26" ry="16" :fill="b.c" stroke="#1b1033" stroke-width="5" />
        <circle cx="16" cy="0" r="4" fill="#1b1033" />
        <path d="M22 6 L40 10 L22 14 Z" fill="#ffb02e" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M-24 6 L-44 -2 L-40 16 Z" :fill="b.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      </g>
    </g>

    <path d="M-60 700 Q200 640 420 668 Q640 618 880 660 Q1100 628 1340 666 Q1600 626 1980 670 L1980 1140 L-60 1140 Z" fill="#c4ead0" stroke="#8cc4a6" stroke-width="3" stroke-linejoin="round" />
    <g fill="#a4d6b6" stroke="#8cc4a6" stroke-width="3" stroke-linejoin="round">
      <path d="M1180 662 V610 M1180 616 L1160 600 M1180 612 L1204 596" fill="none" stroke-width="5" />
      <path d="M1120 600 Q1180 566 1250 598 Q1180 610 1120 600 Z" />
      <path d="M440 668 V626 M440 630 L424 616" fill="none" stroke-width="4" />
      <path d="M396 620 Q440 594 490 618 Q440 628 396 620 Z" />
      <path d="M640 664 A86 86 0 0 1 812 664 Z" fill="#d6f0de" />
    </g>
    <path d="M664 664 Q726 590 726 578 M726 578 Q726 590 788 664 M652 630 H800 M682 600 H770" stroke="#a8cdb8" stroke-width="3" fill="none" />
    <circle cx="726" cy="574" r="6" fill="#ffb3c7" stroke="#8cc4a6" stroke-width="2" />
    <rect x="-60" y="600" width="2040" height="200" fill="url(#zoo-haze)" />

    <path d="M-60 742 Q400 700 960 724 Q1500 748 1980 714 L1980 1140 L-60 1140 Z" fill="url(#zoo-mid)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(600, 734, 1500, 0.014)" stroke="#6aae38" stroke-width="5" fill="none" stroke-linecap="round" />

    <g transform="translate(150 720)">
      <ellipse cx="0" cy="6" rx="80" ry="12" fill="#1b4010" opacity="0.3" />
      <path d="M-18 0 Q-6 -160 -40 -300 M-6 -140 Q40 -220 110 -300 M-24 -220 Q-90 -260 -150 -300" stroke="#1b1033" stroke-width="30" fill="none" stroke-linecap="round" />
      <path d="M-18 0 Q-6 -160 -40 -300 M-6 -140 Q40 -220 110 -300 M-24 -220 Q-90 -260 -150 -300" stroke="#a8683a" stroke-width="20" fill="none" stroke-linecap="round" />
      <path d="M-8 -20 Q0 -120 -26 -240" stroke="#d6a070" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
      <path d="M-260 -310 Q-240 -380 -130 -392 Q-20 -432 110 -398 Q240 -390 270 -320 Q130 -296 0 -306 Q-130 -294 -260 -310 Z" fill="url(#zoo-canopy)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-200 -360 Q-150 -380 -100 -378 M-20 -410 Q30 -420 80 -404 M140 -380 Q190 -372 220 -352" stroke="#a6ef7a" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M-230 -316 Q0 -290 250 -322" stroke="#1f6a2a" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.6" />
    </g>

    <ellipse cx="300" cy="690" rx="150" ry="70" fill="url(#zoo-giraffe)" stroke="#1b1033" stroke-width="5" />
    <ellipse v-for="(s, i) in BODY_SPOTS" :key="`gs${i}`" :cx="s.x" :cy="s.y" :rx="s.r" :ry="s.r * 0.8" fill="#c8682a" opacity="0.85" />
    <g transform="translate(360 650)">
      <g class="zoo-neck">
        <path :d="NECK" fill="url(#zoo-giraffe)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <g clip-path="url(#zoo-neck-clip)" fill="#c8682a">
          <ellipse v-for="(s, i) in NECK_SPOTS" :key="`ns${i}`" :cx="s[0]" :cy="s[1]" :rx="s[2]" :ry="s[3]" />
        </g>
        <path d="M-30 10 C-26 -100 4 -196 42 -264" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
        <path d="M-30 10 C-26 -100 4 -196 42 -264" stroke="#a8541e" stroke-width="10" fill="none" stroke-linecap="round" />
        <path d="M24 -20 C30 -100 50 -190 76 -250" stroke="#fff2c0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
        <path d="M62 -312 L58 -342 M84 -314 L86 -344" stroke="#1b1033" stroke-width="9" stroke-linecap="round" />
        <path d="M62 -312 L58 -342 M84 -314 L86 -344" stroke="#f2a93a" stroke-width="5" stroke-linecap="round" />
        <circle cx="58" cy="-344" r="7" fill="#8a4418" stroke="#1b1033" stroke-width="3" />
        <circle cx="86" cy="-346" r="7" fill="#8a4418" stroke="#1b1033" stroke-width="3" />
        <path d="M50 -300 Q16 -324 4 -306 Q22 -290 50 -292 Z" fill="#ffd86a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M30 -280 C34 -312 70 -324 110 -312 C150 -300 174 -282 170 -262 C166 -246 140 -244 110 -250 C80 -256 40 -258 30 -280 Z" fill="url(#zoo-giraffe)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <ellipse cx="150" cy="-264" rx="24" ry="17" fill="#ffe8b0" stroke="#1b1033" stroke-width="3" />
        <circle cx="160" cy="-270" r="3" fill="#1b1033" />
        <path d="M134 -252 Q146 -246 158 -252" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
        <ellipse cx="72" cy="-292" rx="9" ry="6" fill="#c8682a" opacity="0.8" />
        <circle cx="96" cy="-290" r="8" fill="#1b1033" />
        <circle cx="93" cy="-293" r="2.6" fill="#fff" />
        <path d="M90 -298 l-4 -7 M96 -299 l0 -8 M102 -298 l4 -7" stroke="#1b1033" stroke-width="2.5" stroke-linecap="round" />
        <ellipse cx="118" cy="-272" rx="11" ry="6" fill="#ff7a8a" opacity="0.6" />
        <path d="M46 -294 Q62 -312 90 -314" stroke="#fff6d0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
      </g>
    </g>

    <g fill="url(#zoo-wood)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
      <path v-for="x in FENCE_POSTS" :key="`fp${x}`" :d="`M${x} 860 V600 L${x + 13} 580 L${x + 26} 600 V860 Z`" />
    </g>
    <g fill="url(#zoo-wood)" stroke="#1b1033" stroke-width="5">
      <rect x="-70" y="636" width="680" height="24" rx="4" />
      <rect x="-70" y="776" width="680" height="24" rx="4" />
    </g>
    <path d="M-60 642 H600 M-60 782 H600" stroke="#f2c08a" stroke-width="4" opacity="0.8" />
    <path d="M10 700 v40 M134 690 v50 M320 710 v40 M444 700 v36 M568 690 v50" stroke="#7a4424" stroke-width="4" stroke-linecap="round" opacity="0.6" />


    <g transform="translate(1270 830)">
      <ellipse cx="0" cy="6" rx="200" ry="18" fill="#1b4010" opacity="0.3" />
      <path d="M150 -110 Q180 -80 172 -40" stroke="#1b1033" stroke-width="10" fill="none" stroke-linecap="round" />
      <path d="M150 -110 Q180 -80 172 -40" stroke="#9a94d4" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M166 -44 l-6 18 l14 -6 l4 14 l6 -20 Z" fill="#4a3a6a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <g fill="#9a94d4" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)">
        <rect x="-64" y="-80" width="44" height="80" rx="16" />
        <rect x="-16" y="-80" width="44" height="80" rx="16" />
        <rect x="64" y="-80" width="44" height="80" rx="16" />
        <rect x="108" y="-80" width="40" height="76" rx="16" />
      </g>
      <path d="M-58 -6 q8 -8 16 0 q8 -8 16 0 M-10 -6 q8 -8 16 0 q8 -8 16 0 M70 -6 q8 -8 16 0 q8 -8 16 0" stroke="#fffaf0" stroke-width="4" fill="none" stroke-linecap="round" />
      <ellipse cx="40" cy="-118" rx="128" ry="82" fill="url(#zoo-elephant)" stroke="#1b1033" stroke-width="6" filter="url(#cel)" />
      <path d="M-40 -170 Q30 -196 110 -174" stroke="#e2e0ff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />
      <path d="M60 -90 q14 6 28 0 M30 -60 q14 6 28 0" stroke="#6a64a8" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
      <path d="M-128 -122 Q-170 -60 -150 -18 Q-138 4 -118 -8 Q-108 -16 -116 -28" stroke="#1b1033" stroke-width="36" fill="none" stroke-linecap="round" />
      <path d="M-128 -122 Q-170 -60 -150 -18 Q-138 4 -118 -8 Q-108 -16 -116 -28" stroke="#aaa5e2" stroke-width="26" fill="none" stroke-linecap="round" />
      <path d="M-150 -100 l12 4 M-160 -70 l12 2 M-158 -44 l12 0" stroke="#6a64a8" stroke-width="4" stroke-linecap="round" />
      <circle cx="-104" cy="-150" r="64" fill="url(#zoo-elephant)" stroke="#1b1033" stroke-width="6" />
      <path d="M-134 -104 Q-146 -90 -164 -92 Q-150 -100 -142 -112 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <circle cx="-120" cy="-164" r="8" fill="#1b1033" />
      <circle cx="-123" cy="-167" r="2.6" fill="#fff" />
      <ellipse cx="-96" cy="-136" rx="12" ry="7" fill="#ff8aa8" opacity="0.6" />
      <path d="M-140 -196 Q-118 -214 -88 -210" stroke="#ecebff" stroke-width="6" fill="none" stroke-linecap="round" />
      <g transform="translate(-70 -186)">
        <g class="zoo-ear">
          <path d="M0 0 Q80 -30 96 40 Q104 112 34 120 Q-8 112 -6 64 Z" fill="url(#zoo-elephant)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
          <path d="M10 14 Q66 -6 78 44 Q84 96 36 102 Q8 96 8 62 Z" fill="#ffb3c7" opacity="0.75" />
        </g>
      </g>
    </g>
    <path d="M1140 838 Q1300 812 1500 846 L1500 870 Q1300 840 1140 864 Z" fill="#cfc4b4" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M1170 842 v18 M1220 836 v20 M1280 832 v22 M1360 834 v20 M1440 840 v20" stroke="#9a8a7a" stroke-width="4" />

    <path d="M1490 820 V560" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
    <path d="M1490 820 V560" stroke="#fffaf0" stroke-width="7" stroke-linecap="round" />
    <circle cx="1490" cy="552" r="12" fill="#ffd23f" stroke="#1b1033" stroke-width="4" />

    <g transform="translate(1880 760)">
      <ellipse cx="0" cy="6" rx="80" ry="12" fill="#1b4010" opacity="0.3" />
      <path d="M0 0 Q-30 -220 20 -460" stroke="#1b1033" stroke-width="40" fill="none" stroke-linecap="round" />
      <path d="M0 0 Q-30 -220 20 -460" stroke="#b77744" stroke-width="28" fill="none" stroke-linecap="round" />
      <path d="M0 0 Q-30 -220 20 -460" stroke="#7d4a26" stroke-width="28" fill="none" stroke-dasharray="6 30" />
      <g transform="translate(20 -460)">
        <g fill="#2fbf62" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)">
          <path d="M0 0 Q-130 -40 -230 60 Q-110 0 0 0 Z" />
          <path d="M0 0 Q130 -50 230 40 Q110 0 0 0 Z" />
          <path d="M0 0 Q-40 -120 -130 -150 Q-30 -70 0 0 Z" />
          <path d="M0 0 Q70 -110 170 -120 Q60 -60 0 0 Z" />
          <path d="M0 0 Q-90 30 -150 130 Q-60 50 0 0 Z" />
        </g>
        <path d="M-6 -4 Q-110 -20 -210 46 M-4 -8 Q-40 -100 -118 -138 M-4 4 Q-80 50 -136 116" stroke="#8be8a8" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
        <circle cx="-12" cy="10" r="13" fill="#7a4a2a" stroke="#1b1033" stroke-width="4" />
        <circle cx="10" cy="14" r="13" fill="#7a4a2a" stroke="#1b1033" stroke-width="4" />
      </g>
    </g>

    <g transform="translate(1640 820)">
      <ellipse cx="0" cy="6" rx="160" ry="16" fill="#1b4010" opacity="0.3" />
      <path d="M-120 0 V-210 H120 V0 Z" fill="url(#zoo-kiosk)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-120 -40 H120" stroke="#1b1033" stroke-width="4" />
      <path d="M-120 -40 H120 V0 H-120 Z" fill="#ffd23f" />
      <path d="M-120 -40 H120 V0 H-120 Z" fill="none" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-100 -20 h30 M-40 -20 h30 M20 -20 h30 M80 -20 h20" stroke="#ff7a2f" stroke-width="8" stroke-linecap="round" />
      <rect x="-84" y="-176" width="168" height="94" rx="10" fill="#3a2a5a" stroke="#1b1033" stroke-width="5" />
      <circle cx="40" cy="-150" r="10" fill="#fff2a0" />
      <circle cx="-50" cy="-104" r="16" fill="#ffd23f" stroke="#1b1033" stroke-width="4" />
      <circle cx="-50" cy="-104" r="6" fill="#ff7a2f" />
      <rect x="-100" y="-86" width="200" height="16" rx="4" fill="url(#zoo-wood)" stroke="#1b1033" stroke-width="4" />
      <path d="M-140 -214 H140 V-176 H-140 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-140 -214 h40 v38 h-40 Z M-60 -214 h40 v38 h-40 Z M20 -214 h40 v38 h-40 Z M100 -214 h40 v38 h-40 Z" fill="#ff4d6d" />
      <path d="M-140 -176 q20 24 40 0 q20 24 40 0 q20 24 40 0 q20 24 40 0 q20 24 40 0 q20 24 40 0 q20 24 40 0" fill="#ff4d6d" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-140 -214 H140 V-176 H-140 Z" fill="none" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-150 -212 Q0 -330 150 -212 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
      <path d="M-90 -226 Q0 -300 90 -226 M-40 -222 Q0 -296 40 -222" stroke="#e0a020" stroke-width="5" fill="none" />
      <path d="M-110 -228 Q-70 -270 -20 -284" stroke="#fff6c0" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M0 -272 V-330" stroke="#1b1033" stroke-width="5" />
      <path d="M2 -330 L44 -318 L2 -304 Z" fill="#ff4d6d" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-104 -120 V-190 M104 -120 V-190" stroke="#bfe8ff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
    </g>
    <g v-for="(b, i) in BUNTING" :key="`bt${i}`">
      <path :d="b.line" stroke="#1b1033" stroke-width="3" fill="none" />
      <path v-for="(f, j) in b.flags" :key="j" :d="f.d" :fill="f.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    </g>

    <path d="M-60 900 Q400 872 980 892 Q1560 914 1980 880 L1980 1140 L-60 1140 Z" fill="url(#zoo-near)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(20, 892, 800, 0.02)" stroke="#2f7a2a" stroke-width="5" fill="none" stroke-linecap="round" />
    <path :d="tufts(1240, 906, 1900, 0.02)" stroke="#2f7a2a" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M955 722 C975 780 1060 840 1010 900 C960 960 880 1020 860 1140 L1220 1140 C1180 1040 1150 960 1130 900 C1110 840 1020 780 995 722 Z" fill="url(#zoo-path)" stroke="#c49a5a" stroke-width="4" stroke-linejoin="round" />
    <path :d="PEBBLES" stroke="#d6a868" stroke-width="5" stroke-linecap="round" opacity="0.6" />
    <g v-for="(b, i) in BUSHES" :key="`bu${i}`" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`">
      <ellipse cx="0" cy="4" rx="50" ry="8" fill="#1b4010" opacity="0.3" />
      <path d="M-48 0 Q-60 -30 -30 -40 Q-20 -66 8 -58 Q36 -70 44 -40 Q64 -24 48 0 Z" fill="#3fae4a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-30 -30 Q-20 -46 -4 -48" stroke="#a6ef7a" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="-20" cy="-20" r="6" fill="#ff8ccf" stroke="#1b1033" stroke-width="2" />
      <circle cx="16" cy="-36" r="6" fill="#ffd23f" stroke="#1b1033" stroke-width="2" />
      <circle cx="26" cy="-12" r="6" fill="#ff8ccf" stroke="#1b1033" stroke-width="2" />
    </g>

    <g transform="translate(740 774)">
      <ellipse cx="0" cy="110" rx="190" ry="20" fill="#1b4010" opacity="0.3" />
      <path d="M-170 110 Q-180 30 -110 6 Q-40 -16 40 -8 Q130 -4 170 50 Q190 100 170 110 Z" fill="url(#zoo-rock)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-130 50 L-60 40 M20 60 L110 52 M-90 86 L-20 80 M60 92 L130 88" stroke="#8a6a52" stroke-width="5" stroke-linecap="round" opacity="0.55" />
      <path d="M-120 20 Q-60 0 0 2" stroke="#fff0dc" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8" />
      <g transform="translate(96 -24)">
        <g class="zoo-tail">
          <path d="M0 0 Q36 14 40 70" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
          <path d="M0 0 Q36 14 40 70" stroke="#f2b04a" stroke-width="6" fill="none" stroke-linecap="round" />
          <ellipse cx="40" cy="80" rx="11" ry="16" fill="#a8541e" stroke="#1b1033" stroke-width="4" />
        </g>
      </g>
      <path d="M-70 -6 Q-80 -60 0 -62 Q90 -66 110 -30 Q120 0 90 4 L-60 4 Q-74 2 -70 -6 Z" fill="url(#zoo-lion)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M40 -56 Q90 -60 100 -28" stroke="#fff0b0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
      <path d="M20 -40 q10 10 0 24" stroke="#c87a22" stroke-width="4" fill="none" stroke-linecap="round" />
      <g transform="translate(-92 -30)">
        <path :d="MANE" fill="#d9661e" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <circle r="30" fill="url(#zoo-lion)" stroke="#1b1033" stroke-width="4" />
        <circle cx="-22" cy="-24" r="9" fill="#ffcf6a" stroke="#1b1033" stroke-width="3" />
        <circle cx="22" cy="-24" r="9" fill="#ffcf6a" stroke="#1b1033" stroke-width="3" />
        <path d="M-16 -6 q6 5 12 0 M4 -6 q6 5 12 0" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
        <ellipse cx="0" cy="12" rx="14" ry="10" fill="#fff0c8" />
        <path d="M-6 6 L6 6 L0 13 Z" fill="#5a2a1a" />
        <path d="M0 13 V17 M-6 19 q6 4 12 0" stroke="#1b1033" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <ellipse cx="-18" cy="6" rx="6" ry="3.5" fill="#ff7a6a" opacity="0.6" />
        <ellipse cx="18" cy="6" rx="6" ry="3.5" fill="#ff7a6a" opacity="0.6" />
      </g>
      <ellipse cx="-118" cy="0" rx="22" ry="12" fill="url(#zoo-lion)" stroke="#1b1033" stroke-width="4" />
      <ellipse cx="-80" cy="2" rx="22" ry="12" fill="url(#zoo-lion)" stroke="#1b1033" stroke-width="4" />
      <path d="M-126 2 v6 M-118 2 v6 M-88 4 v6 M-80 4 v6" stroke="#c87a22" stroke-width="3" stroke-linecap="round" />
    </g>

    <ellipse cx="420" cy="1000" rx="350" ry="96" fill="url(#zoo-water)" stroke="#1b1033" stroke-width="6" />
    <g clip-path="url(#zoo-pond-clip)">
      <path d="M100 960 Q300 930 560 950 M200 1050 Q420 1030 700 1050" stroke="#d6f8ff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6" />
      <ellipse v-for="(f, i) in FLAMINGOS" :key="`rf${i}`" :cx="f.x" :cy="f.y + 24" rx="28" ry="40" fill="#ff8ab0" opacity="0.25" />
      <ellipse v-for="(f, i) in FLAMINGOS" :key="`rp${i}`" :cx="f.x" :cy="f.y" rx="40" ry="11" fill="none" stroke="#fff" stroke-width="4" class="zoo-ripple" :style="{ animationDelay: `-${f.d}s` }" />
    </g>
    <path d="M110 970 Q100 1040 160 1080" stroke="#0f6a8a" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.4" />
    <g v-for="(l, i) in LILIES" :key="`ly${i}`">
      <path :d="`M${l.x} ${l.y} L${l.x + l.r} ${l.y - 4} A${l.r} ${l.r * 0.45} 0 1 1 ${l.x + l.r} ${l.y + 4} Z`" fill="#4fcf5a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <circle :cx="l.x - 4" :cy="l.y - 4" r="7" fill="#ff8ccf" stroke="#1b1033" stroke-width="2.5" />
      <circle :cx="l.x - 4" :cy="l.y - 4" r="2.5" fill="#ffd23f" />
    </g>
    <g v-for="(f, i) in FLAMINGOS" :key="`fl${i}`" :transform="`translate(${f.x} ${f.y}) scale(${f.k})`">
      <g class="zoo-sway" :style="{ animationDelay: `-${f.d}s` }">
        <path d="M0 0 V-118" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
        <path d="M0 0 V-118" stroke="#ff7aa8" stroke-width="4" stroke-linecap="round" />
        <path d="M4 -120 L24 -86 L2 -78" stroke="#1b1033" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4 -120 L24 -86 L2 -78" stroke="#ff7aa8" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M-24 -144 Q-52 -190 -22 -222 Q4 -250 -14 -270" stroke="#1b1033" stroke-width="15" fill="none" stroke-linecap="round" />
        <path d="M-24 -144 Q-52 -190 -22 -222 Q4 -250 -14 -270" stroke="#ff8ab4" stroke-width="9" fill="none" stroke-linecap="round" />
        <path d="M-30 -136 Q-20 -166 30 -160 Q66 -154 64 -132 Q50 -112 10 -114 Q-30 -116 -30 -136 Z" fill="#ff8ab4" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M0 -146 Q30 -152 54 -134 Q30 -124 0 -130 Z" fill="#ff5a90" />
        <path d="M60 -140 L80 -128 L60 -124 Z" fill="#ff5a90" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M-18 -150 Q0 -160 24 -156" stroke="#ffd6e6" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cx="-14" cy="-272" r="12" fill="#ff8ab4" stroke="#1b1033" stroke-width="4" />
        <path d="M-6 -276 L12 -272 Q16 -260 6 -254 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M12 -264 Q14 -258 6 -254 L8 -262 Z" fill="#1b1033" />
        <circle cx="-14" cy="-276" r="2.5" fill="#1b1033" />
      </g>
    </g>
    <g fill="#9a8a9a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path d="M60 1000 Q66 970 100 972 Q130 976 128 1004 Z" />
      <path d="M700 960 Q720 930 760 938 Q790 950 780 978 Z" />
    </g>

    <g transform="translate(1740 1050)">
      <ellipse cx="0" cy="20" rx="170" ry="18" fill="#0f2a10" opacity="0.3" />
      <g transform="translate(0 -120)">
        <g class="zoo-bob">
          <path v-for="(b, i) in BALLOONS" :key="`bs${i}`" :d="`M0 0 Q${b.x * 0.3} ${b.y * 0.5} ${b.x} ${b.y + b.r}`" stroke="#6a5a8a" stroke-width="2.5" fill="none" />
          <g v-for="(b, i) in BALLOONS" :key="`bb${i}`">
            <ellipse :cx="b.x" :cy="b.y" :rx="b.r" :ry="b.r * 1.15" :fill="b.c" stroke="#1b1033" stroke-width="4" />
            <path :d="`M${b.x + b.r * 0.5} ${b.y + b.r * 0.5} Q${b.x + b.r * 0.8} ${b.y} ${b.x + b.r * 0.5} ${b.y - b.r * 0.6}`" :stroke="b.dark" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.6" />
            <path :d="`M${b.x - b.r * 0.5} ${b.y - b.r * 0.5} Q${b.x - b.r * 0.2} ${b.y - b.r * 0.9} ${b.x + b.r * 0.1} ${b.y - b.r * 0.9}`" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9" />
          </g>
        </g>
      </g>
      <path d="M-140 -120 H140 L120 -16 H-120 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-104 -120 L-92 -16 M-48 -120 L-44 -16 M8 -120 L6 -16 M64 -120 L56 -16 M118 -120 L104 -16" stroke="#ff4d6d" stroke-width="22" />
      <path d="M-140 -120 H140 L120 -16 H-120 Z" fill="none" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
      <rect x="-150" y="-136" width="300" height="18" rx="6" fill="#2ec9b0" stroke="#1b1033" stroke-width="5" />
      <path d="M140 -60 L200 -90" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
      <path d="M140 -60 L200 -90" stroke="#ffd23f" stroke-width="7" stroke-linecap="round" />
      <circle cx="-80" cy="0" r="32" fill="#2ec9b0" stroke="#1b1033" stroke-width="6" />
      <circle cx="80" cy="0" r="32" fill="#2ec9b0" stroke="#1b1033" stroke-width="6" />
      <circle cx="-80" cy="0" r="10" fill="#fffaf0" stroke="#1b1033" stroke-width="3" />
      <circle cx="80" cy="0" r="10" fill="#fffaf0" stroke="#1b1033" stroke-width="3" />
    </g>

    <g fill="#163f1e" stroke="#0b1a12" stroke-width="5">
      <path d="M-60 1140 Q-30 960 120 900 Q60 1000 100 1140 Z" />
      <path d="M-60 1140 Q60 1020 260 1010 Q140 1070 160 1140 Z" />
      <path d="M1980 1140 Q1990 980 1900 940 Q1940 1040 1880 1140 Z" />
    </g>
    <g fill="#ff5a90" stroke="#0b1a12" stroke-width="3">
      <circle cx="96" cy="934" r="9" />
      <circle cx="210" cy="1018" r="8" />
      <circle cx="1912" cy="966" r="8" />
    </g>
  </g>
</template>

<style scoped>
.zoo-neck,
.zoo-ear,
.zoo-tail,
.zoo-sway,
.zoo-bob {
  transform-box: view-box;
  transform-origin: 0 0;
}

.zoo-neck {
  animation: zoo-neck 4s ease-in-out infinite alternate;
}

.zoo-ear {
  animation: zoo-ear 1.8s ease-in-out infinite alternate;
}

.zoo-tail {
  animation: zoo-tail 2.2s ease-in-out infinite;
}

.zoo-sway {
  animation: zoo-sway 3.6s ease-in-out infinite alternate;
}

.zoo-bob {
  animation: zoo-sway 3s ease-in-out infinite alternate;
}

.zoo-ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: zoo-ripple 3s ease-out infinite;
}

@keyframes zoo-neck {
  from {
    rotate: -4deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes zoo-ear {
  from {
    rotate: -6deg;
    scale: 1 1;
  }
  to {
    rotate: 8deg;
    scale: 0.82 1;
  }
}

@keyframes zoo-tail {
  0%,
  60%,
  100% {
    rotate: 0deg;
  }
  70% {
    rotate: 24deg;
  }
  80% {
    rotate: -8deg;
  }
  90% {
    rotate: 14deg;
  }
}

@keyframes zoo-sway {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes zoo-ripple {
  from {
    scale: 0.4;
    opacity: 0.9;
  }
  to {
    scale: 1.5;
    opacity: 0;
  }
}
</style>
