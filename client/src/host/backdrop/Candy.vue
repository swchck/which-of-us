<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(515);
const CLOUDS = Array.from({ length: 3 }, (_, i) => ({ y: 120 + i * 110 + rnd() * 40, k: 0.7 + rnd() * 0.45, d: rnd() * 60 + i * 30, s: 70 + rnd() * 30, blue: i === 1 }));
const RAINBOW = ['#ff9aa8', '#ffc59a', '#fff0a0', '#b8f0c0', '#a8d8ff', '#d8b8ff'];
const rainbowArc = (r: number) => `M${1560 - r} 780 A${r} ${r} 0 0 1 ${1560 + r} 780`;

const spiral = (r: number) => {
  const turns = 3;
  const n = 72;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = (i / n) * turns * Math.PI * 2;
    const rr = (r * i) / n;
    return `${(Math.cos(t) * rr).toFixed(1)} ${(Math.sin(t) * rr).toFixed(1)}`;
  });
  return `M${pts.join(' L')}`;
};
const LOLLIPOPS = [
  { x: 110, y: 905, h: 300, r: 84, c: '#ff4f9e', dark: '#c42a72', d: 0 },
  { x: 640, y: 812, h: 130, r: 40, c: '#ffb02e', dark: '#d97a12', d: 1.3 },
  { x: 1200, y: 878, h: 230, r: 62, c: '#2ec9b0', dark: '#16907e', d: 2.1 },
  { x: 1835, y: 915, h: 330, r: 92, c: '#9b5cff', dark: '#6a32c8', d: 0.7 },
].map((l) => ({ ...l, swirl: spiral(l.r * 0.92) }));
const FAR_POPS = [
  { x: 820, y: 690, r: 16, c: '#f6a6d0' },
  { x: 1010, y: 676, r: 12, c: '#a8e2d8' },
  { x: 1120, y: 688, r: 14, c: '#ffd9a0' },
];
const GUMDROPS = [
  { x: 560, y: 790, r: 34, c: '#ff6b8b', s: '#c93a5e' },
  { x: 930, y: 770, r: 26, c: '#ffd23f', s: '#d9a01a' },
  { x: 1000, y: 774, r: 20, c: '#7be06a', s: '#45a83a' },
  { x: 1330, y: 742, r: 38, c: '#5ab8ff', s: '#2f7fd0' },
];
const MALLOWS = [
  { x: 620, y: 500, k: 0.9, d: 0, s: 4.2 },
  { x: 1720, y: 400, k: 0.85, d: 1.6, s: 5 },
  { x: 1430, y: 540, k: 0.6, d: 2.7, s: 3.6 },
];

const RIVER = 'M704 814 Q620 840 470 866 Q210 930 120 1040 Q86 1100 40 1160 L470 1160 Q470 1060 560 980 Q700 880 768 836 Q790 818 760 812 Z';
const RIPPLE_STEP = 34;
const RIPPLE_SHIFT = -22;
// three row variants repeat every 3 rows, so sliding the sheet by exactly 3 rows loops without a jump
const RIPPLE_VARIANTS = [0, 1, 2].map(() => Array.from({ length: 9 }, (_, j) => j * 120 + rnd() * 60));
const RIPPLES = Array.from({ length: 21 }, (_, k) => {
  const y = 590 + k * RIPPLE_STEP;
  return (RIPPLE_VARIANTS[k % 3] ?? []).map((x) => `M${(x + k * RIPPLE_SHIFT).toFixed(1)} ${y} q16 -7 32 0`).join(' ');
}).join(' ');
const SHEET_SHIFT = { x: `${RIPPLE_SHIFT * 3}px`, y: `${RIPPLE_STEP * 3}px` };

const SPRINKLE_COLORS = ['#ff4f9e', '#ffd23f', '#2ec9b0', '#9b5cff', '#ff7a2f', '#5ab8ff', '#fffaf0'];
const SPRINKLES = Array.from({ length: 96 }, () => {
  const side = rnd();
  const x = side < 0.15 ? 560 + rnd() * 120 : 700 + rnd() * 1220;
  const y = 905 + rnd() * 160;
  const a = rnd() * Math.PI;
  return { d: `M${(x - Math.cos(a) * 8).toFixed(1)} ${(y - Math.sin(a) * 4).toFixed(1)} l${(Math.cos(a) * 16).toFixed(1)} ${(Math.sin(a) * 8).toFixed(1)}`, c: SPRINKLE_COLORS[Math.floor(rnd() * SPRINKLE_COLORS.length)] };
});
const SPRINKLE_GROUPS = twinkleGroups(SPRINKLES);
const FROSTING_SPRINKLES = Array.from({ length: 16 }, () => ({ x: 230 + rnd() * 300, y: 420 + rnd() * 90, c: SPRINKLE_COLORS[Math.floor(rnd() * 6)] }));

// samples the near ridge (two quadratic segments of the near layer path) so the icing hugs it
type Pt = [number, number];
const RIDGE_LEFT: [Pt, Pt, Pt] = [[-60, 910], [480, 856], [960, 876]];
const RIDGE_RIGHT: [Pt, Pt, Pt] = [[960, 876], [1460, 896], [1980, 856]];
const nearRidge = (x: number) => {
  const [p0, c, p1] = x < 960 ? RIDGE_LEFT : RIDGE_RIGHT;
  const t = (x - p0[0]) / (p1[0] - p0[0]);
  return (1 - t) * (1 - t) * p0[1] + 2 * t * (1 - t) * c[1] + t * t * p1[1];
};
const ICING_DRIPS = Array.from({ length: 30 }, (_, i) => {
  const x = -40 + i * 68 + rnd() * 20;
  const y = nearRidge(x) + 4;
  const len = 10 + rnd() * 26;
  return `M${(x - 9).toFixed(1)} ${y.toFixed(1)} v${len.toFixed(1)} a9 9 0 0 0 18 0 v${(-len).toFixed(1)} Z`;
}).join(' ');
const ICING_EDGE = `M-60 ${nearRidge(-60)} Q480 856 960 876 Q1460 896 1980 856`;
const FENCE = Array.from({ length: 10 }, (_, i) => 1090 + i * 100).map((x) => ({ x, cane: `M${x} 1046 V930 Q${x} 902 ${x - 22} 900 Q${x - 44} 900 ${x - 44} 922` }));
const ROOF_DRIPS = [0.15, 0.32, 0.5, 0.68, 0.85];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="candy-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8c6f4" />
        <stop offset="100%" stop-color="#d6b0ea" />
      </linearGradient>
      <linearGradient id="candy-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff0f6" stop-opacity="0" />
        <stop offset="60%" stop-color="#fff0f6" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fff0f6" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="candy-mid" gradientUnits="userSpaceOnUse" x1="-60" y1="736" x2="552" y2="1140">
        <stop offset="0%" stop-color="#b6f5d8" />
        <stop offset="60%" stop-color="#7fe0b8" />
      </linearGradient>
      <linearGradient id="candy-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff9ccb" />
        <stop offset="100%" stop-color="#e2589c" />
      </linearGradient>
      <linearGradient id="candy-choc" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#a8673a" />
        <stop offset="55%" stop-color="#7a4224" />
        <stop offset="100%" stop-color="#4f2614" />
      </linearGradient>
      <linearGradient id="candy-ginger" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e9a160" />
        <stop offset="100%" stop-color="#b0612c" />
      </linearGradient>
      <linearGradient id="candy-roof" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8a4e30" />
        <stop offset="100%" stop-color="#4f2614" />
      </linearGradient>
      <linearGradient id="candy-wafer" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbe0aa" />
        <stop offset="100%" stop-color="#d9a056" />
      </linearGradient>
      <linearGradient id="candy-wrapper" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffc4dc" />
        <stop offset="100%" stop-color="#f29ac0" />
      </linearGradient>
      <linearGradient id="candy-frost" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fffafc" />
        <stop offset="100%" stop-color="#f6d6ea" />
      </linearGradient>
      <linearGradient id="candy-mallow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#ffd2e6" />
      </linearGradient>
      <clipPath id="candy-river-clip">
        <path :d="RIVER" />
      </clipPath>
    </defs>


    <g fill="none" stroke-width="26" opacity="0.5">
      <path v-for="(c, i) in RAINBOW" :key="c" :d="rainbowArc(470 - i * 24)" :stroke="c" />
    </g>

    <g v-for="(c, i) in CLOUDS" :key="`cc${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-130 20 Q-160 -14 -116 -30 Q-110 -70 -56 -62 Q-30 -104 26 -88 Q70 -110 100 -66 Q150 -62 138 -18 Q160 14 116 22 Z" :fill="c.blue ? '#cfe8ff' : '#ffd0ea'" :stroke="c.blue ? '#8ab0e6' : '#e88ac0'" stroke-width="4" stroke-linejoin="round" />
        <path d="M-116 16 Q0 2 118 18 Q40 32 -116 16 Z" :fill="c.blue ? '#a9cff5' : '#f6a8d2'" />
        <path d="M-76 -50 Q-54 -68 -30 -64 M6 -80 Q32 -94 58 -84 M-20 -30 q10 -10 22 -6 M40 -40 q12 -8 24 -2" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9" />
      </g>
    </g>

    <path d="M-60 712 Q60 630 190 668 Q300 610 430 662 Q560 620 700 668 Q840 630 980 664 Q1120 618 1260 660 Q1400 612 1560 664 Q1720 626 1840 660 Q1920 640 1980 660 L1980 1140 L-60 1140 Z" fill="url(#candy-far)" stroke="#b78ac8" stroke-width="3" stroke-linejoin="round" />
    <path d="M120 660 q40 -18 70 -10 M380 642 q30 -14 60 -6 M1200 640 q40 -16 70 -8 M1490 646 q30 -14 60 -6" stroke="#f6e6fb" stroke-width="5" fill="none" stroke-linecap="round" />
    <g v-for="(p, i) in FAR_POPS" :key="`fp${i}`">
      <path :d="`M${p.x} ${p.y} v${-p.r * 2.4}`" stroke="#c9a0d6" stroke-width="4" />
      <circle :cx="p.x" :cy="p.y - p.r * 3.2" :r="p.r" :fill="p.c" stroke="#b78ac8" stroke-width="3" />
      <path :d="`M${p.x - p.r * 0.5} ${p.y - p.r * 3.5} q${p.r * 0.4} ${-p.r * 0.4} ${p.r * 0.9} -${p.r * 0.2}`" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(380 690)">
      <path d="M-180 -170 L180 -170 L150 0 L-150 0 Z" fill="url(#candy-wrapper)" stroke="#b56a92" stroke-width="3" stroke-linejoin="round" />
      <path d="M-140 -166 L-120 -4 M-90 -166 L-80 -4 M-40 -166 L-36 -4 M10 -166 L10 -4 M60 -166 L54 -4 M110 -166 L98 -4 M150 -166 L130 -4" stroke="#e17aa8" stroke-width="4" opacity="0.7" />
      <path d="M-196 -160 Q-210 -210 -170 -230 Q-180 -280 -120 -290 Q-120 -340 -50 -344 Q-20 -390 30 -366 Q90 -380 104 -330 Q170 -330 166 -278 Q216 -262 196 -214 Q218 -176 186 -160 Q100 -140 0 -150 Q-100 -140 -196 -160 Z" fill="url(#candy-frost)" stroke="#b56a92" stroke-width="3" stroke-linejoin="round" />
      <path d="M-170 -214 Q-60 -196 50 -214 Q130 -226 186 -210 M-120 -282 Q-30 -268 60 -286 Q110 -296 150 -282 M-60 -340 Q0 -326 80 -340" stroke="#e8b8d4" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-150 -236 Q-130 -262 -96 -270 M-80 -318 Q-60 -336 -30 -340" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" />
      <path d="M10 -360 Q20 -392 4 -412" stroke="#7a9a4a" stroke-width="5" fill="none" stroke-linecap="round" />
      <circle cx="16" cy="-382" r="30" fill="#f2475e" stroke="#b56a92" stroke-width="3" />
      <path d="M2 -394 Q8 -404 20 -404" stroke="#ffd0d6" stroke-width="6" fill="none" stroke-linecap="round" />
    </g>
    <g stroke-width="5" stroke-linecap="round">
      <path v-for="(s, i) in FROSTING_SPRINKLES" :key="`fs${i}`" :d="`M${s.x} ${s.y} l8 ${i % 2 ? 4 : -4}`" :stroke="s.c" opacity="0.75" />
    </g>

    <rect x="-60" y="600" width="2040" height="210" fill="url(#candy-haze)" />

    <path d="M-60 800 Q200 736 460 770 Q760 806 1000 760 Q1300 716 1600 752 Q1800 772 1980 744 L1980 1140 L-60 1140 Z" fill="url(#candy-mid)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M60 790 q40 -14 80 -12 M840 786 q50 -10 90 -14 M1460 746 q60 -6 110 0 M1700 766 q50 -10 90 -8" stroke="#e4fff2" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <g v-for="(g, i) in GUMDROPS" :key="`gd${i}`">
      <ellipse :cx="g.x" :cy="g.y + 2" :rx="g.r * 1.2" :ry="g.r * 0.22" fill="#1b4030" opacity="0.25" />
      <path :d="`M${g.x - g.r} ${g.y} Q${g.x - g.r} ${g.y - g.r * 1.5} ${g.x} ${g.y - g.r * 1.5} Q${g.x + g.r} ${g.y - g.r * 1.5} ${g.x + g.r} ${g.y} Z`" :fill="g.c" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)" />
      <path :d="`M${g.x - g.r * 0.55} ${g.y - g.r * 0.9} Q${g.x - g.r * 0.4} ${g.y - g.r * 1.25} ${g.x - g.r * 0.05} ${g.y - g.r * 1.3}`" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85" />
      <g fill="#fff" opacity="0.8">
        <circle :cx="g.x + g.r * 0.2" :cy="g.y - g.r * 0.6" r="2.5" />
        <circle :cx="g.x - g.r * 0.3" :cy="g.y - g.r * 0.35" r="2" />
        <circle :cx="g.x + g.r * 0.55" :cy="g.y - g.r * 0.3" r="2" />
      </g>
    </g>

    <path d="M-60 910 Q480 856 960 876 Q1460 896 1980 856 L1980 1140 L-60 1140 Z" fill="url(#candy-near)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="ICING_EDGE" stroke="#1b1033" stroke-width="24" fill="none" />
    <path :d="ICING_DRIPS" fill="#fffaf0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="ICING_EDGE" stroke="#fffaf0" stroke-width="16" fill="none" />
    <path d="M760 896 q60 -12 120 -10 M1100 896 q50 -8 100 -4 M1500 890 q60 -10 120 -8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
    <g v-for="(grp, gi) in SPRINKLE_GROUPS" :key="`sg${gi}`" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s`, animationDuration: '3s' }" stroke-width="6" stroke-linecap="round">
      <path v-for="(s, i) in grp" :key="i" :d="s.d" :stroke="s.c" />
    </g>

    <path :d="RIVER" fill="url(#candy-choc)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <g clip-path="url(#candy-river-clip)">
      <path
        :d="RIPPLES"
        stroke="#c58652"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
        opacity="0.75"
        class="candy-flow"
        :style="{ '--candy-dx': SHEET_SHIFT.x, '--candy-dy': SHEET_SHIFT.y }"
      />
    </g>
    <path d="M600 826 Q700 776 840 812 L840 840 L600 840 Z" fill="url(#candy-mid)" />
    <path d="M600 826 Q700 776 840 812" stroke="#1b1033" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M650 806 q30 -12 60 -12" stroke="#e4fff2" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M680 830 Q600 852 520 864 M600 916 Q500 950 440 990 M300 1040 Q260 1080 240 1130" stroke="#d99a66" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6" />
    <path d="M460 870 Q300 910 200 980" stroke="#fff4e0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.35" />

    <g>
      <ellipse cx="500" cy="944" rx="250" ry="16" fill="#3a1020" opacity="0.3" />
      <path d="M270 930 L270 1000 M730 930 L730 1000" stroke="#1b1033" stroke-width="26" stroke-linecap="round" />
      <path d="M270 930 L270 1000 M730 930 L730 1000" stroke="#7a4224" stroke-width="16" stroke-linecap="round" />
      <path d="M236 910 Q500 846 766 910 L766 944 Q500 882 236 944 Z" fill="url(#candy-wafer)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M300 900 L300 934 M360 888 L360 922 M420 880 L420 914 M480 876 L480 910 M540 876 L540 910 M600 880 L600 914 M660 888 L660 922 M720 900 L720 934 M250 922 Q500 862 754 922" stroke="#c48a46" stroke-width="3" fill="none" opacity="0.8" />
      <path d="M262 906 Q380 874 480 866" stroke="#fff6dc" stroke-width="5" fill="none" stroke-linecap="round" />
      <g stroke="#1b1033" stroke-width="16" stroke-linecap="round" fill="none">
        <path d="M250 900 V850 M370 874 V826 M500 862 V814 M630 874 V826 M750 900 V850 M250 856 Q500 790 750 856" />
      </g>
      <g stroke="#f6d39a" stroke-width="9" stroke-linecap="round" fill="none">
        <path d="M250 900 V850 M370 874 V826 M500 862 V814 M630 874 V826 M750 900 V850 M250 856 Q500 790 750 856" />
      </g>
      <path d="M250 856 Q500 790 750 856" stroke="#a8673a" stroke-width="9" fill="none" stroke-dasharray="4 12" />
    </g>

    <g transform="translate(1530 884)">
      <ellipse cx="0" cy="6" rx="230" ry="18" fill="#5a1036" opacity="0.3" />
      <rect x="62" y="-300" width="46" height="90" fill="#c04a3a" stroke="#1b1033" stroke-width="5" />
      <path d="M58 -300 Q85 -318 112 -300 Q112 -290 104 -284 Q98 -276 92 -288 Q80 -278 72 -290 Q64 -280 58 -292 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-140 0 V-176 H140 V0 Z" fill="url(#candy-ginger)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-120 -40 h20 M-130 -120 h16 M100 -60 h18 M110 -140 h14" stroke="#9a4e22" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      <path d="M-140 -10 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0" stroke="#fffaf0" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M-186 -160 L0 -336 L186 -160 Z" fill="url(#candy-roof)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-120 -196 q14 12 28 0 q14 12 28 0 q14 12 28 0 q14 12 28 0 q14 12 28 0 q14 12 28 0 q14 12 28 0 q14 12 28 0 M-76 -238 q14 12 28 0 q14 12 28 0 q14 12 28 0 q14 12 28 0 q14 12 28 0 M-36 -280 q14 12 28 0 q14 12 28 0 q14 12 28 0" stroke="#a8673a" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-194 -158 L0 -342 L194 -158" stroke="#1b1033" stroke-width="26" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M-194 -158 L0 -342 L194 -158" stroke="#fffaf0" stroke-width="16" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <g fill="#fffaf0" stroke="#1b1033" stroke-width="3">
        <path v-for="t in ROOF_DRIPS" :key="`dl${t}`" :d="`M${-194 + 194 * t - 8} ${-158 - 184 * t + 6} q8 ${24 + t * 10} 16 0 Z`" />
        <path v-for="t in ROOF_DRIPS" :key="`dr${t}`" :d="`M${194 - 194 * t - 8} ${-158 - 184 * t + 6} q8 ${30 - t * 10} 16 0 Z`" />
      </g>
      <g stroke="#1b1033" stroke-width="3">
        <circle cx="0" cy="-350" r="14" fill="#ff4f9e" />
        <circle cx="-90" cy="-262" r="11" fill="#ffd23f" />
        <circle cx="90" cy="-262" r="11" fill="#2ec9b0" />
        <circle cx="-150" cy="-204" r="10" fill="#9b5cff" />
        <circle cx="150" cy="-204" r="10" fill="#ff7a2f" />
      </g>
      <circle cx="-4" cy="-354" r="4" fill="#fff" />
      <g v-for="x in [-82, 82]" :key="`win${x}`" :transform="`translate(${x} -96)`">
        <circle r="30" fill="#ffe680" stroke="#1b1033" stroke-width="4" />
        <circle r="30" fill="none" stroke="#fffaf0" stroke-width="12" />
        <circle r="30" fill="none" stroke="#ff3b5c" stroke-width="12" stroke-dasharray="11.8 11.8" />
        <circle r="36" fill="none" stroke="#1b1033" stroke-width="3" />
        <circle r="24" fill="none" stroke="#1b1033" stroke-width="3" />
        <path d="M-10 -8 Q-4 -14 4 -14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
      <path d="M-32 0 V-80 Q0 -112 32 -80 V0 Z" fill="#6a3418" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-32 -60 H32 M-32 -30 H32 M0 -96 V0" stroke="#4a220e" stroke-width="4" />
      <path d="M-24 -76 Q-10 -96 8 -96" stroke="#a8673a" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="20" cy="-42" r="5" fill="#ffd23f" stroke="#1b1033" stroke-width="2.5" />
      <g v-for="x in [-50, 50]" :key="`cane${x}`">
        <path :d="`M${x} 0 V-120`" stroke="#1b1033" stroke-width="18" stroke-linecap="round" />
        <path :d="`M${x} 0 V-120`" stroke="#fffaf0" stroke-width="11" stroke-linecap="round" />
        <path :d="`M${x} -2 V-120`" stroke="#ff3b5c" stroke-width="11" stroke-dasharray="8 10" />
      </g>
    </g>

    <g transform="translate(1316 912)">
      <ellipse cx="0" cy="4" rx="44" ry="8" fill="#5a1036" opacity="0.3" />
      <path d="M-12 -64 L-44 -78 Q-56 -76 -50 -62 L-16 -46 L-28 -4 Q-24 6 -12 2 L0 -22 L12 2 Q24 6 28 -4 L16 -46 L46 -54 Q56 -62 46 -70 L12 -64 Z" fill="url(#candy-ginger)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <circle cx="0" cy="-86" r="22" fill="url(#candy-ginger)" stroke="#1b1033" stroke-width="4" />
      <path d="M-46 -74 q4 6 0 12 M44 -68 q-4 6 0 12 M-26 -8 q6 4 12 0 M14 -8 q6 4 12 0" stroke="#fffaf0" stroke-width="3" fill="none" stroke-linecap="round" />
      <circle cx="-7" cy="-90" r="3.5" fill="#1b1033" />
      <circle cx="8" cy="-90" r="3.5" fill="#1b1033" />
      <path d="M-8 -78 Q0 -70 8 -78" stroke="#fffaf0" stroke-width="3" fill="none" stroke-linecap="round" />
      <ellipse cx="-14" cy="-80" rx="4" ry="2.5" fill="#ff7a8a" />
      <ellipse cx="14" cy="-80" rx="4" ry="2.5" fill="#ff7a8a" />
      <circle cx="0" cy="-52" r="4.5" fill="#ff4f9e" stroke="#1b1033" stroke-width="2" />
      <circle cx="0" cy="-36" r="4.5" fill="#2ec9b0" stroke="#1b1033" stroke-width="2" />
      <path d="M-12 -100 Q-4 -106 6 -104" stroke="#ffd2a0" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>

    <g v-for="(l, i) in LOLLIPOPS" :key="`lp${i}`" :transform="`translate(${l.x} ${l.y})`">
      <ellipse cx="0" cy="4" :rx="l.r * 0.9" :ry="l.r * 0.16" fill="#3a1030" opacity="0.3" />
      <g class="candy-sway" :style="{ animationDelay: `-${l.d}s` }">
        <path :d="`M0 0 V${-l.h}`" stroke="#1b1033" :stroke-width="l.r * 0.2 + 6" stroke-linecap="round" />
        <path :d="`M0 0 V${-l.h}`" stroke="#fffaf0" :stroke-width="l.r * 0.2" stroke-linecap="round" />
        <path :d="`M${l.r * 0.06} -6 V${-l.h + 6}`" stroke="#d8cfe6" :stroke-width="l.r * 0.07" stroke-linecap="round" />
        <g :transform="`translate(0 ${-l.h - l.r * 0.85})`">
          <circle :r="l.r" :fill="l.c" stroke="#1b1033" stroke-width="6" />
          <path :d="l.swirl" stroke="#fffaf0" :stroke-width="l.r * 0.22" fill="none" stroke-linecap="round" />
          <path :d="`M${l.r * 0.95} ${l.r * 0.1} A${l.r * 0.95} ${l.r * 0.95} 0 0 1 ${-l.r * 0.3} ${l.r * 0.9} A${l.r * 1.1} ${l.r * 1.1} 0 0 0 ${l.r * 0.95} ${l.r * 0.1} Z`" :fill="l.dark" opacity="0.55" />
          <path :d="`M${-l.r * 0.68} ${-l.r * 0.3} A${l.r * 0.72} ${l.r * 0.72} 0 0 1 ${-l.r * 0.2} ${-l.r * 0.7}`" stroke="#fff" :stroke-width="l.r * 0.13" fill="none" stroke-linecap="round" opacity="0.9" />
          <circle :cx="-l.r * 0.12" :cy="-l.r * 0.78" :r="l.r * 0.06" fill="#fff" />
        </g>
        <g :transform="`translate(0 ${-l.h + l.r * 0.12})`" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
          <path :d="`M0 0 L${-l.r * 0.45} ${-l.r * 0.22} L${-l.r * 0.45} ${l.r * 0.22} Z M0 0 L${l.r * 0.45} ${-l.r * 0.22} L${l.r * 0.45} ${l.r * 0.22} Z`" fill="#fffaf0" />
          <circle :r="l.r * 0.1" :fill="l.dark" />
        </g>
      </g>
    </g>

    <g v-for="(m, i) in MALLOWS" :key="`ml${i}`" :transform="`translate(${m.x} ${m.y}) scale(${m.k})`">
      <g class="candy-bob" :style="{ animationDelay: `-${m.d}s`, animationDuration: `${m.s}s` }">
        <rect x="-44" y="-36" width="88" height="70" rx="26" fill="url(#candy-mallow)" stroke="#1b1033" stroke-width="5" />
        <ellipse cx="0" cy="-26" rx="38" ry="12" fill="#fff" stroke="#e7b6cc" stroke-width="3" />
        <path d="M30 -12 Q36 14 24 28" stroke="#f4b6d0" stroke-width="7" fill="none" stroke-linecap="round" />
        <path d="M-34 -8 Q-36 4 -32 14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle cx="-12" cy="2" r="4.5" fill="#1b1033" />
        <circle cx="12" cy="2" r="4.5" fill="#1b1033" />
        <circle cx="-13" cy="0.5" r="1.6" fill="#fff" />
        <circle cx="11" cy="0.5" r="1.6" fill="#fff" />
        <path d="M-6 12 Q0 18 6 12" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
        <ellipse cx="-22" cy="12" rx="6" ry="3.5" fill="#ff7a9a" opacity="0.7" />
        <ellipse cx="22" cy="12" rx="6" ry="3.5" fill="#ff7a9a" opacity="0.7" />
      </g>
    </g>

    <g>
      <g fill="#2ec9b0" stroke="#1b1033" stroke-width="4">
        <rect x="1050" y="954" width="960" height="16" rx="6" />
        <rect x="1050" y="994" width="960" height="16" rx="6" />
      </g>
      <path d="M1060 958 H2000 M1060 998 H2000" stroke="#b6f5e6" stroke-width="3" />
      <path d="M1060 962 H2000 M1060 1002 H2000" stroke="#fffaf0" stroke-width="5" stroke-dasharray="6 18" />
      <g v-for="f in FENCE" :key="`fc${f.x}`">
        <ellipse :cx="f.x + 6" cy="1046" rx="26" ry="5" fill="#3a1030" opacity="0.3" />
        <path :d="f.cane" stroke="#1b1033" stroke-width="22" fill="none" stroke-linecap="round" />
        <path :d="f.cane" stroke="#fffaf0" stroke-width="14" fill="none" stroke-linecap="round" />
        <path :d="f.cane" stroke="#ff3b5c" stroke-width="14" fill="none" stroke-dasharray="9 11" />
        <path :d="`M${f.x - 3} 1036 V934`" stroke="#fff" stroke-width="3" opacity="0.7" />
      </g>
    </g>

    <g fill="#8a2266" stroke="#3e0d33" stroke-width="5" stroke-linejoin="round">
      <path d="M10 1160 V950 Q10 880 80 880 Q150 880 150 950" fill="none" stroke="#3e0d33" stroke-width="58" stroke-linecap="round" />
      <path d="M10 1160 V950 Q10 880 80 880 Q150 880 150 950" fill="none" stroke-width="44" stroke-linecap="round" stroke="#8a2266" />
      <path d="M150 1140 L150 1010" stroke-width="22" stroke-linecap="round" />
      <circle cx="150" cy="980" r="70" />
      <path d="M1940 1160 V960 Q1940 900 1880 900 Q1820 900 1820 950" fill="none" stroke="#3e0d33" stroke-width="58" stroke-linecap="round" />
      <path d="M1940 1160 V960 Q1940 900 1880 900 Q1820 900 1820 950" fill="none" stroke-width="44" stroke-linecap="round" stroke="#8a2266" />
      <path d="M1690 1110 L1720 1080 L1820 1080 L1850 1110 L1820 1140 L1720 1140 Z" />
      <path d="M1720 1080 L1690 1050 L1680 1110 Z M1820 1080 L1860 1050 L1870 1110 Z" />
    </g>
    <path d="M150 980 m-14 0 a14 14 0 1 1 28 0 a30 30 0 1 1 -58 0 a46 46 0 1 1 90 0" stroke="#b44a8a" stroke-width="8" fill="none" stroke-linecap="round" />
    <path d="M10 1160 V950 Q10 880 80 880 Q150 880 150 950 M1940 1160 V960 Q1940 900 1880 900 Q1820 900 1820 950" stroke="#a83a7c" stroke-width="44" fill="none" stroke-dasharray="16 22" />
    <path d="M1736 1092 L1756 1124 M1776 1092 L1796 1124" stroke="#b44a8a" stroke-width="7" stroke-linecap="round" />
  </g>
</template>

<style scoped>
.candy-sway {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: candy-sway 4.5s ease-in-out infinite alternate;
}

.candy-bob {
  animation: candy-bob 4s ease-in-out infinite alternate;
}

.candy-flow {
  animation: candy-flow 3s linear infinite;
}

@keyframes candy-sway {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes candy-bob {
  from {
    translate: 0 -14px;
    rotate: -4deg;
  }
  to {
    translate: 0 14px;
    rotate: 4deg;
  }
}

@keyframes candy-flow {
  from {
    translate: 0 0;
  }
  to {
    translate: var(--candy-dx) var(--candy-dy);
  }
}
</style>
