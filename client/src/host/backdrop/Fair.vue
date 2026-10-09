<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(931);
const f1 = (n: number) => n.toFixed(1);
const rad = (a: number) => (a * Math.PI) / 180;

const STARS = twinkleGroups(Array.from({ length: 44 }, () => ({ x: rnd() * 1920, y: 20 + rnd() * 360, r: 1.5 + rnd() * 2.5 })));
const STAR_PATHS = STARS.map((g) => g.map((s) => `M${f1(s.x)} ${f1(s.y)} h0.1`).join(' '));

const WHEEL_R = 260;
const WHEEL_INNER = 222;
const SPOKES = Array.from({ length: 16 }, (_, i) => i * 22.5)
  .map((a) => `M0 0 L${f1(Math.cos(rad(a)) * WHEEL_R)} ${f1(Math.sin(rad(a)) * WHEEL_R)}`)
  .join(' ');
const TRUSS = Array.from({ length: 33 }, (_, i) => {
  const r = i % 2 ? WHEEL_INNER : WHEEL_R;
  const a = rad(i * 11.25);
  return `${i ? 'L' : 'M'}${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`;
}).join(' ');
const rimDots = (from: number) =>
  Array.from({ length: 16 }, (_, i) => {
    const a = rad(from + i * 22.5);
    return `M${f1(Math.cos(a) * WHEEL_R)} ${f1(Math.sin(a) * WHEEL_R)} h0.1`;
  }).join(' ');
const RIM_WARM = rimDots(0);
const RIM_COOL = rimDots(11.25);
const CABIN_COLORS = ['#ff4f6d', '#3ad6e0', '#ffd23f', '#8a6bff', '#2ed47a', '#ff8a2f'];
const CABINS = CABIN_COLORS.map((c, i) => {
  const a = rad(i * 60 + 30);
  return { x: Math.cos(a) * WHEEL_R, y: Math.sin(a) * WHEEL_R, c };
});

// the car's keyframes follow these exact vertices, so moving one means editing fair-ride too
const TRACK: [number, number][] = [
  [1380, 800],
  [1480, 800],
  [1650, 480],
  [1710, 480],
  [1790, 720],
  [1840, 720],
  [1910, 600],
  [2060, 600],
];
const TRACK_PATH = TRACK.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
const trackY = (x: number) => {
  let [x0, y0] = TRACK[0] ?? [0, 0];
  for (const [x1, y1] of TRACK) {
    if (x <= x1 && x1 > x0) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    [x0, y0] = [x1, y1];
  }
  return y0;
};
const STILTS = Array.from({ length: 15 }, (_, i) => 1420 + i * 40).map((x) => ({ x, y: trackY(x) + 8 }));
const STILT_PATH = STILTS.map((s) => `M${s.x} ${f1(s.y)} V820`).join(' ');
const BRACE_PATH = STILTS.slice(1)
  .map((s, i) => {
    const p = STILTS[i] ?? s;
    const lo = Math.max(p.y, s.y);
    return lo < 780 ? `M${p.x} ${f1(lo)} L${s.x} 820 M${s.x} ${f1(lo)} L${p.x} 820` : '';
  })
  .join(' ');

const CAROUSEL = { x: 1330, apex: 596, brim: 690, half: 210 };
const STRIPES = Array.from({ length: 10 }, (_, i) => {
  const x0 = CAROUSEL.x - CAROUSEL.half + i * 42;
  return { d: `M${CAROUSEL.x} ${CAROUSEL.apex} L${x0} ${CAROUSEL.brim} Q${x0 + 21} ${CAROUSEL.brim + 8} ${x0 + 42} ${CAROUSEL.brim} Z`, c: i % 2 ? '#fff4e8' : '#ff3d6e' };
});
const SCALLOPS = Array.from({ length: 10 }, (_, i) => ({ x: CAROUSEL.x - CAROUSEL.half + i * 42, c: i % 2 ? '#ff3d6e' : '#ffd23f' }));
const HORSES = [
  { x: 1190, c: '#fff4e8', saddle: '#3ad6e0', g: 0 },
  { x: 1270, c: '#ffb3d0', saddle: '#ffd23f', g: 1 },
  { x: 1400, c: '#fff4e8', saddle: '#8a6bff', g: 0 },
  { x: 1480, c: '#c9f0ff', saddle: '#ff3d6e', g: 1 },
];

const BULB_COLORS = ['#fff3a0', '#ff7ab0', '#7af0ff', '#9dff8a'];
const catenary = (x0: number, y0: number, x1: number, y1: number, sag: number, step: number) => {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + sag * 2;
  const n = Math.round((x1 - x0) / step);
  const pts = Array.from({ length: n - 1 }, (_, i) => {
    const t = (i + 1) / n;
    return { x: (1 - t) ** 2 * x0 + 2 * t * (1 - t) * cx + t * t * x1, y: (1 - t) ** 2 * y0 + 2 * t * (1 - t) * cy + t * t * y1 };
  });
  return { d: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, pts };
};
const STRINGS = [catenary(560, 600, CAROUSEL.x, CAROUSEL.apex - 30, 46, 44), catenary(CAROUSEL.x, CAROUSEL.apex - 30, 1990, 520, 40, 44)];
const BULBS = STRINGS.flatMap((s) => s.pts).map((p, i) => ({ ...p, c: BULB_COLORS[i % 4] }));
const BULB_GROUPS = [0, 1].map((g) => BULBS.filter((_, i) => i % 2 === g));

const FIREWORKS = [
  { x: 150, y: 120, r: 90, c: '#ff7ab0', tip: '#fff3a0', d: 0 },
  { x: 1720, y: 150, r: 104, c: '#7af0ff', tip: '#ffffff', d: 2.2 },
  { x: 1470, y: 290, r: 66, c: '#ffd23f', tip: '#ff8a2f', d: 4.1 },
];
const burst = (r: number) =>
  Array.from({ length: 14 }, (_, i) => {
    const a = rad(i * (360 / 14));
    return `M${f1(Math.cos(a) * r * 0.3)} ${f1(Math.sin(a) * r * 0.3)} L${f1(Math.cos(a) * r * 0.85)} ${f1(Math.sin(a) * r * 0.85)}`;
  }).join(' ');
const burstTips = (r: number) =>
  Array.from({ length: 14 }, (_, i) => {
    const a = rad(i * (360 / 14) + 6);
    return `M${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)} h0.1`;
  }).join(' ');

const BALLOONS = [
  { x: -40, y: -200, c: '#ff3d6e', r: 1.1 },
  { x: 10, y: -236, c: '#3ad6e0', r: 0.85 },
  { x: 58, y: -182, c: '#ffd23f', r: 1.2 },
  { x: 0, y: -150, c: '#8a6bff', r: 0.75 },
];
const FLOSS = [
  { x: -60, c: '#ff9ccf' },
  { x: -10, c: '#b7a2ff' },
  { x: 40, c: '#ff9ccf' },
];
const CONFETTI_COLORS = ['#ff7ab0', '#7af0ff', '#ffd23f', '#9dff8a'];
const CONFETTI = CONFETTI_COLORS.map(() =>
  Array.from({ length: 9 }, () => {
    const x = rnd() * 1920;
    const y = 850 + rnd() * 260;
    const a = rnd() * 6;
    return `M${f1(x)} ${f1(y)} l${f1(Math.cos(a) * 10)} ${f1(Math.sin(a) * 4)}`;
  }).join(' '),
);
const VP = { x: 960, y: 700 };
const PAVING = Array.from({ length: 21 }, (_, i) => -1100 + i * 205)
  .map((xb) => `M${f1(VP.x + ((xb - VP.x) * (820 - VP.y)) / (1140 - VP.y))} 820 L${xb} 1140`)
  .join(' ');
</script>

<template>
  <g>
    <defs>
      <radialGradient id="fair-sunset" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffe2a8" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#ffa16b" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="fair-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b9568e" />
        <stop offset="100%" stop-color="#d9708a" />
      </linearGradient>
      <linearGradient id="fair-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffc49a" stop-opacity="0" />
        <stop offset="60%" stop-color="#ffc49a" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ffc49a" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="fair-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8e4a86" />
        <stop offset="45%" stop-color="#5e3070" />
        <stop offset="100%" stop-color="#2e1842" />
      </linearGradient>
      <linearGradient id="fair-steel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4eaff" />
        <stop offset="100%" stop-color="#a99ad0" />
      </linearGradient>
      <linearGradient id="fair-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="50%" stop-color="#ffcc33" />
        <stop offset="100%" stop-color="#d9861c" />
      </linearGradient>
      <linearGradient id="fair-cart" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7af0ff" />
        <stop offset="100%" stop-color="#2a9ec4" />
      </linearGradient>
      <linearGradient id="fair-booth" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffd23f" />
        <stop offset="100%" stop-color="#e08a1c" />
      </linearGradient>
      <radialGradient id="fair-pool" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffd6a0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ffd6a0" stop-opacity="0" />
      </radialGradient>
    </defs>

    <g v-for="(d, i) in STAR_PATHS" :key="`st${i}`" :class="{ twinkle: i % 2 === 0 }" :style="{ animationDelay: `-${i * 0.8}s` }">
      <path :d="d" stroke="#fff6e0" stroke-width="5" stroke-linecap="round" opacity="0.8" />
    </g>

    <g v-for="(f, i) in FIREWORKS" :key="`fw${i}`" :transform="`translate(${f.x} ${f.y})`">
      <g class="fair-burst" :style="{ animationDelay: `-${f.d}s` }">
        <path :d="burst(f.r)" :stroke="f.c" stroke-width="7" stroke-linecap="round" />
        <path :d="burstTips(f.r)" :stroke="f.tip" stroke-width="11" stroke-linecap="round" />
        <circle r="10" :fill="f.tip" />
      </g>
    </g>

    <ellipse cx="960" cy="800" rx="900" ry="240" fill="url(#fair-sunset)" />

    <path d="M-60 800 Q60 760 160 776 Q240 740 340 770 Q460 744 560 772 Q700 750 820 770 L860 700 L900 770 Q1000 756 1080 772 L1092 560 L1116 560 L1128 772 Q1240 748 1340 770 Q1460 740 1580 772 Q1720 746 1840 768 Q1920 756 1980 770 L1980 900 L-60 900 Z" fill="url(#fair-far)" stroke="#9a3f78" stroke-width="3" stroke-linejoin="round" />
    <g fill="#c7628f" stroke="#9a3f78" stroke-width="3" stroke-linejoin="round">
      <path d="M640 776 L700 700 L760 776 Z M960 776 L1000 716 L1040 776 Z" />
      <path d="M1074 560 h60 v12 h-60 Z" />
    </g>
    <path d="M700 700 v-24 l18 8 l-18 8 M1000 716 v-20 l14 7 l-14 7" stroke="#9a3f78" stroke-width="3" fill="#ffd0a0" stroke-linejoin="round" />
    <path d="M1104 600 h0.1 M1104 640 h0.1 M1104 680 h0.1 M1104 720 h0.1 M660 760 h0.1 M700 744 h0.1 M740 760 h0.1 M980 760 h0.1 M1020 760 h0.1" stroke="#ffe6a8" stroke-width="7" stroke-linecap="round" opacity="0.8" />
    <rect x="-60" y="660" width="2040" height="190" fill="url(#fair-haze)" />

    <g stroke-linejoin="round" stroke-linecap="round">
      <path :d="BRACE_PATH" stroke="#4a2a66" stroke-width="3" fill="none" opacity="0.8" />
      <path :d="STILT_PATH" stroke="#2a1640" stroke-width="9" fill="none" />
      <path :d="STILT_PATH" stroke="#7a5aa6" stroke-width="4" fill="none" />
      <path :d="TRACK_PATH" stroke="#2a1640" stroke-width="22" fill="none" />
      <path :d="TRACK_PATH" stroke="#5a3a80" stroke-width="22" fill="none" stroke-dasharray="4 14" stroke-linecap="butt" />
      <path :d="TRACK_PATH" stroke="#ff4f6d" stroke-width="6" fill="none" />
      <path :d="TRACK_PATH" stroke="#ffb0c0" stroke-width="2" fill="none" transform="translate(0 -3)" />
    </g>
    <g class="fair-ride-vis">
      <g class="fair-ride">
        <g transform="scale(0.85)">
          <path d="M-44 -8 L44 -8 L50 -36 Q52 -46 42 -46 L-32 -46 Q-46 -46 -50 -32 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
          <path d="M-38 -38 H36" stroke="#fff6c8" stroke-width="4" stroke-linecap="round" />
          <path d="M-6 -46 V-10" stroke="#1b1033" stroke-width="3" />
          <circle cx="-22" cy="-58" r="11" fill="#ffc8a0" stroke="#1b1033" stroke-width="3.5" />
          <circle cx="18" cy="-58" r="11" fill="#8a5a3a" stroke="#1b1033" stroke-width="3.5" />
          <path d="M-30 -62 L-40 -86 M-14 -62 L-6 -86 M10 -62 L4 -86 M26 -62 L36 -86" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
          <circle cx="-28" cy="-4" r="7" fill="#3a2a50" stroke="#1b1033" stroke-width="3" />
          <circle cx="28" cy="-4" r="7" fill="#3a2a50" stroke="#1b1033" stroke-width="3" />
        </g>
      </g>
    </g>

    <circle cx="330" cy="450" r="320" fill="#ffd0f0" opacity="0.1" />
    <g transform="translate(330 450)">
      <g class="fair-wheel">
        <path :d="SPOKES" stroke="#1b1033" stroke-width="8" />
        <path :d="SPOKES" stroke="url(#fair-steel)" stroke-width="4" />
        <circle :r="WHEEL_INNER" fill="none" stroke="#1b1033" stroke-width="10" />
        <circle :r="WHEEL_INNER" fill="none" stroke="#ffd23f" stroke-width="5" />
        <path :d="TRUSS" fill="none" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
        <path :d="TRUSS" fill="none" stroke="#c9b8f0" stroke-width="3" stroke-linejoin="round" />
        <circle :r="WHEEL_R" fill="none" stroke="#1b1033" stroke-width="18" />
        <circle :r="WHEEL_R" fill="none" stroke="#ff5fa2" stroke-width="10" />
        <path :d="RIM_WARM" stroke="#fff3a0" stroke-width="12" stroke-linecap="round" />
        <path :d="RIM_COOL" stroke="#7af0ff" stroke-width="12" stroke-linecap="round" />
        <g v-for="(c, i) in CABINS" :key="`cb${i}`" :transform="`translate(${f1(c.x)} ${f1(c.y)})`">
          <g class="fair-cabin">
            <path d="M0 0 V30" stroke="#1b1033" stroke-width="5" />
            <path d="M-38 34 Q0 8 38 34 Z" :fill="c.c" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
            <path d="M-28 34 V54 M28 34 V54" stroke="#1b1033" stroke-width="4" />
            <rect x="-36" y="52" width="72" height="38" rx="12" :fill="c.c" stroke="#1b1033" stroke-width="4" />
            <path d="M-26 62 H18" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
            <path d="M-34 80 H34" stroke="#1b1033" stroke-width="3" opacity="0.35" />
            <circle r="7" fill="url(#fair-gold)" stroke="#1b1033" stroke-width="3" />
          </g>
        </g>
      </g>
    </g>
    <ellipse cx="330" cy="852" rx="250" ry="20" fill="#1b0f2a" opacity="0.35" />
    <g stroke-linecap="round">
      <path d="M330 450 L150 840 M330 450 L510 840 M210 710 H450" stroke="#1b1033" stroke-width="28" />
      <path d="M330 450 L150 840 M330 450 L510 840 M210 710 H450" stroke="url(#fair-steel)" stroke-width="16" />
      <path d="M322 470 L162 816" stroke="#fff" stroke-width="4" opacity="0.7" />
    </g>
    <rect x="100" y="826" width="460" height="34" rx="8" fill="#8a6bff" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
    <path d="M120 836 H300" stroke="#c9b8ff" stroke-width="4" stroke-linecap="round" />
    <circle cx="330" cy="450" r="34" fill="url(#fair-gold)" stroke="#1b1033" stroke-width="6" />
    <circle cx="320" cy="440" r="9" fill="#fff" opacity="0.8" />

    <path d="M-60 820 Q480 806 960 816 Q1440 826 1980 812 L1980 1140 L-60 1140 Z" fill="url(#fair-ground)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="PAVING" stroke="#2a1640" stroke-width="3" opacity="0.35" />
    <path d="M-60 900 Q960 880 1980 900 M-60 1000 Q960 975 1980 1000" stroke="#2a1640" stroke-width="3" fill="none" opacity="0.3" />
    <path v-for="(d, i) in CONFETTI" :key="`cf${i}`" :d="d" :stroke="CONFETTI_COLORS[i]" stroke-width="5" stroke-linecap="round" opacity="0.55" />
    <ellipse cx="1330" cy="900" rx="330" ry="70" fill="url(#fair-pool)" />
    <ellipse cx="620" cy="980" rx="230" ry="60" fill="url(#fair-pool)" />
    <ellipse cx="1810" cy="1010" rx="200" ry="56" fill="url(#fair-pool)" />

    <g v-for="(s, i) in STRINGS" :key="`sg${i}`">
      <path :d="s.d" stroke="#1b1033" stroke-width="3" fill="none" />
    </g>
    <path d="M560 600 V826" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
    <path d="M560 600 V826" stroke="#c9b8f0" stroke-width="5" stroke-linecap="round" />
    <g v-for="(grp, gi) in BULB_GROUPS" :key="`bg${gi}`" class="fair-bulbs" :style="{ animationDelay: `-${gi * 0.9}s` }">
      <template v-for="(b, j) in grp" :key="j">
        <circle :cx="f1(b.x)" :cy="f1(b.y + 9)" r="14" :fill="b.c" opacity="0.28" />
        <circle :cx="f1(b.x)" :cy="f1(b.y + 9)" r="6.5" :fill="b.c" stroke="#1b1033" stroke-width="2.5" />
      </template>
    </g>

    <ellipse :cx="CAROUSEL.x" cy="902" rx="250" ry="24" fill="#1b0f2a" opacity="0.4" />
    <g :transform="`translate(${CAROUSEL.x} 0)`">
      <path d="M-196 700 H196 V880 H-196 Z" fill="#3a1f5a" />
      <path d="M-196 700 H196 V730 H-196 Z" fill="#1b1033" opacity="0.4" />
      <rect x="-34" y="700" width="68" height="180" fill="#ff9ccf" stroke="#1b1033" stroke-width="5" />
      <path d="M-34 740 H34 M-34 800 H34 M-34 860 H34" stroke="#1b1033" stroke-width="3" opacity="0.5" />
      <rect x="-22" y="752" width="44" height="38" rx="6" fill="#c9f0ff" stroke="#1b1033" stroke-width="3" />
      <path d="M-16 760 L0 776" stroke="#fff" stroke-width="4" stroke-linecap="round" />
    </g>
    <g v-for="(h, i) in HORSES" :key="`hp${i}`">
      <path :d="`M${h.x} 692 V880`" stroke="#1b1033" stroke-width="10" />
      <path :d="`M${h.x} 692 V880`" stroke="url(#fair-gold)" stroke-width="5" />
    </g>
    <g v-for="g in [0, 1]" :key="`hg${g}`" class="fair-horses" :style="{ animationDelay: `-${g * 1.4}s` }">
      <g v-for="(h, i) in HORSES.filter((x) => x.g === g)" :key="`hs${i}`" :transform="`translate(${h.x} 806) scale(1.2)`">
        <path d="M34 -6 Q56 -12 52 14 Q46 0 34 4 Z" fill="#c4553a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M-12 10 L-26 20 L-34 14 M26 12 L32 32" stroke="#1b1033" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <path d="M-12 10 L-26 20 L-34 14 M26 12 L32 32" :stroke="h.c" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <ellipse cx="8" cy="0" rx="32" ry="17" :fill="h.c" stroke="#1b1033" stroke-width="4" />
        <path d="M-16 -4 L-28 -30 Q-34 -42 -48 -38 L-54 -26 Q-42 -24 -36 -18 L-20 6 Z" :fill="h.c" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-26 -36 Q-18 -22 -12 -8" stroke="#c4553a" stroke-width="6" fill="none" stroke-linecap="round" />
        <circle cx="-38" cy="-30" r="3" fill="#1b1033" />
        <path d="M-6 -16 Q8 -24 22 -16 L20 -4 Q8 -10 -4 -4 Z" :fill="h.saddle" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M-12 -8 Q4 -14 20 -10" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>
    <path d="M1100 878 Q1330 920 1560 878 L1560 904 Q1330 944 1100 904 Z" fill="#ff3d6e" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M1100 878 Q1330 838 1560 878 Q1330 914 1100 878 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M1130 902 Q1330 936 1530 902" stroke="#ffb0c0" stroke-width="4" fill="none" stroke-linecap="round" />
    <g stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
      <path v-for="(s, i) in STRIPES" :key="`cs${i}`" :d="s.d" :fill="s.c" />
    </g>
    <path :d="`M${CAROUSEL.x} ${CAROUSEL.apex + 4} L${CAROUSEL.x - 150} ${CAROUSEL.brim - 6}`" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.6" />
    <path :d="`M${CAROUSEL.x + 40} ${CAROUSEL.apex + 30} L${CAROUSEL.x + 190} ${CAROUSEL.brim + 4} L${CAROUSEL.x + 60} ${CAROUSEL.brim + 4} Z`" fill="#1b1033" opacity="0.18" />
    <g stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path v-for="(s, i) in SCALLOPS" :key="`sc${i}`" :d="`M${s.x} ${CAROUSEL.brim} Q${s.x + 21} ${CAROUSEL.brim + 40} ${s.x + 42} ${CAROUSEL.brim} Z`" :fill="s.c" />
    </g>
    <path :d="SCALLOPS.map((s) => `M${s.x + 21} ${CAROUSEL.brim + 16} h0.1`).join(' ')" stroke="#fff6c8" stroke-width="10" stroke-linecap="round" />
    <path :d="`M${CAROUSEL.x} ${CAROUSEL.apex} V${CAROUSEL.apex - 40}`" stroke="#1b1033" stroke-width="6" />
    <circle :cx="CAROUSEL.x" :cy="CAROUSEL.apex - 44" r="14" fill="url(#fair-gold)" stroke="#1b1033" stroke-width="4" />
    <path :d="`M${CAROUSEL.x} ${CAROUSEL.apex - 58} V${CAROUSEL.apex - 96} L${CAROUSEL.x + 34} ${CAROUSEL.apex - 84} L${CAROUSEL.x} ${CAROUSEL.apex - 72}`" fill="#3ad6e0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />

    <g transform="translate(620 980)">
      <ellipse cx="0" cy="12" rx="170" ry="18" fill="#1b0f2a" opacity="0.45" />
      <g class="fair-balloons">
        <path v-for="(b, i) in BALLOONS" :key="`bs${i}`" :d="`M142 -24 Q${175 + b.x * 0.4} ${-60 + b.y * 0.3} ${175 + b.x} ${b.y + 36 * b.r}`" stroke="#fff6e0" stroke-width="2" fill="none" />
        <g v-for="(b, i) in BALLOONS" :key="`bl${i}`">
          <ellipse :cx="175 + b.x" :cy="b.y" :rx="30 * b.r" :ry="36 * b.r" :fill="b.c" stroke="#1b1033" stroke-width="4" />
          <path :d="`M${175 + b.x - 4} ${b.y + 36 * b.r - 2} l4 8 l4 -8 Z`" :fill="b.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <path :d="`M${175 + b.x - 16 * b.r} ${b.y - 14 * b.r} Q${175 + b.x - 12 * b.r} ${b.y - 28 * b.r} ${175 + b.x} ${b.y - 30 * b.r}`" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8" />
        </g>
      </g>
      <path d="M-120 -96 V0 M120 -96 V0" stroke="#1b1033" stroke-width="10" />
      <path d="M-120 -96 V0 M120 -96 V0" stroke="#fff4e8" stroke-width="4" />
      <path d="M-150 -96 Q-140 -180 0 -186 Q140 -180 150 -96 Z" fill="#ff7ab0" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-50 -180 Q-60 -130 -50 -96 L-10 -96 Q-14 -140 -12 -186 Z M50 -180 Q60 -130 50 -96 L90 -96 Q86 -140 76 -184 Z" fill="#fff4e8" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-120 -160 Q-80 -178 -30 -180" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      <g v-for="(f, i) in FLOSS" :key="`fl${i}`">
        <path :d="`M${f.x - 6} -70 L${f.x} -20 L${f.x + 6} -70 Z`" fill="#fff4e8" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path :d="`M${f.x - 24} -76 a14 14 0 0 1 10 -24 a16 16 0 0 1 28 -2 a14 14 0 0 1 10 24 Q${f.x} -64 ${f.x - 24} -76 Z`" :fill="f.c" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path :d="`M${f.x - 12} -96 q8 -8 18 -4`" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
      </g>
      <rect x="-130" y="-30" width="260" height="34" rx="6" fill="#fff4e8" stroke="#1b1033" stroke-width="5" />
      <rect x="-140" y="0" width="280" height="96" rx="12" fill="url(#fair-cart)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-100 8 V90 M-60 8 V90 M-20 8 V90 M20 8 V90 M60 8 V90 M100 8 V90" stroke="#fff" stroke-width="8" opacity="0.35" />
      <path d="M-124 14 H40" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <circle cx="0" cy="48" r="22" fill="#ff7ab0" stroke="#1b1033" stroke-width="4" />
      <path d="M-12 44 a12 12 0 0 1 24 0 Q0 62 -12 44 Z" fill="#fff4e8" />
      <circle cx="-90" cy="100" r="22" fill="#3a2a50" stroke="#1b1033" stroke-width="5" />
      <circle cx="90" cy="100" r="22" fill="#3a2a50" stroke="#1b1033" stroke-width="5" />
      <circle cx="-90" cy="100" r="7" fill="url(#fair-gold)" />
      <circle cx="90" cy="100" r="7" fill="url(#fair-gold)" />
    </g>

    <g transform="translate(1800 1010)">
      <ellipse cx="0" cy="14" rx="170" ry="20" fill="#1b0f2a" opacity="0.45" />
      <rect x="-120" y="-200" width="240" height="210" rx="10" fill="url(#fair-booth)" stroke="#1b1033" stroke-width="6" filter="url(#cel)" />
      <path d="M-120 -150 H120 M-120 -60 H120" stroke="#b55a10" stroke-width="3" opacity="0.5" />
      <path d="M-70 -70 V-150 Q-70 -186 0 -186 Q70 -186 70 -150 V-70 Z" fill="#3a1f5a" stroke="#1b1033" stroke-width="5" />
      <path d="M-56 -150 Q-54 -172 -20 -176" stroke="#c9b8ff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      <path d="M-70 -110 H70" stroke="#ffd23f" stroke-width="4" opacity="0.5" />
      <rect x="-96" y="-72" width="192" height="22" rx="5" fill="#ff3d6e" stroke="#1b1033" stroke-width="5" />
      <path d="M40 -66 l14 0 l0 4 a4 4 0 0 0 0 8 l0 4 l-14 0 l0 -4 a4 4 0 0 0 0 -8 Z" fill="#fff3a0" stroke="#1b1033" stroke-width="2.5" transform="rotate(-14 47 -58)" />
      <path d="M-150 -196 L-110 -260 H110 L150 -196 Z" fill="#ff3d6e" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
      <path d="M-70 -260 L-90 -196 H-50 L-30 -260 Z M30 -260 L50 -196 H90 L70 -260 Z" fill="#fff4e8" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-150 -196 Q-130 -176 -110 -196 Q-90 -176 -70 -196 Q-50 -176 -30 -196 Q-10 -176 10 -196 Q30 -176 50 -196 Q70 -176 90 -196 Q110 -176 130 -196 Q140 -186 150 -196" fill="#ffd23f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M0 -260 V-310" stroke="#1b1033" stroke-width="5" />
      <path d="M0 -310 L44 -296 L0 -282 Z" fill="#3ad6e0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-130 -244 h0.1 M-60 -244 h0.1 M10 -244 h0.1 M80 -244 h0.1" stroke="#fff6c8" stroke-width="12" stroke-linecap="round" />
      <path d="M-104 -30 H104" stroke="#b55a10" stroke-width="3" opacity="0.5" />
    </g>

    <g fill="#1a0c2a" stroke="#0c0614" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 V930 a70 70 0 0 1 120 -20 a60 60 0 0 1 100 30 a56 56 0 0 1 60 90 Q240 1100 250 1140 Z" />
      <path d="M1980 1140 V1000 a50 50 0 0 0 -90 10 a40 40 0 0 0 -30 70 L1850 1140 Z" />
    </g>
    <path d="M0 940 Q30 916 60 914 M120 950 Q150 940 170 950" stroke="#3a2a50" stroke-width="5" fill="none" stroke-linecap="round" />
  </g>
</template>

<style scoped>
.fair-wheel {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: fair-spin 60s linear infinite;
}

.fair-cabin {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: fair-spin 60s linear infinite reverse;
}

.fair-burst {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: fair-burst 6.3s ease-out infinite;
}

.fair-bulbs {
  animation: fair-bulbs 1.8s ease-in-out infinite alternate;
}

.fair-horses {
  animation: fair-bob 2.8s ease-in-out infinite alternate;
}

.fair-balloons {
  transform-box: view-box;
  transform-origin: 142px -24px;
  animation: fair-sway 4s ease-in-out infinite alternate;
}

.fair-ride {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: fair-ride 14s linear infinite;
}

.fair-ride-vis {
  animation: fair-ride-vis 14s linear infinite;
}

@keyframes fair-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes fair-burst {
  0% {
    opacity: 0;
    scale: 0.3;
  }
  8% {
    opacity: 1;
    scale: 0.85;
  }
  30% {
    opacity: 0;
    scale: 1.15;
  }
  100% {
    opacity: 0;
    scale: 1.15;
  }
}

@keyframes fair-bulbs {
  from {
    opacity: 0.45;
  }
  to {
    opacity: 1;
  }
}

@keyframes fair-bob {
  from {
    translate: 0 -14px;
  }
  to {
    translate: 0 14px;
  }
}

@keyframes fair-sway {
  from {
    rotate: -4deg;
  }
  to {
    rotate: 4deg;
  }
}

@keyframes fair-ride-vis {
  0% {
    opacity: 0;
  }
  4%,
  64% {
    opacity: 1;
  }
  66%,
  100% {
    opacity: 0;
  }
}

@keyframes fair-ride {
  0% {
    translate: 1380px 800px;
    rotate: 0deg;
  }
  5.5% {
    translate: 1476px 800px;
    rotate: 0deg;
  }
  6% {
    translate: 1480px 800px;
    rotate: -62deg;
  }
  42% {
    translate: 1647px 486px;
    rotate: -62deg;
  }
  43% {
    translate: 1650px 480px;
    rotate: 0deg;
  }
  46.5% {
    translate: 1706px 480px;
    rotate: 0deg;
  }
  47% {
    translate: 1710px 480px;
    rotate: 72deg;
  }
  52% {
    translate: 1787px 711px;
    rotate: 72deg;
  }
  52.5% {
    translate: 1790px 720px;
    rotate: 0deg;
  }
  54.5% {
    translate: 1836px 720px;
    rotate: 0deg;
  }
  55% {
    translate: 1840px 720px;
    rotate: -60deg;
  }
  59% {
    translate: 1907px 605px;
    rotate: -60deg;
  }
  59.5% {
    translate: 1910px 600px;
    rotate: 0deg;
  }
  66%,
  100% {
    translate: 2060px 600px;
    rotate: 0deg;
  }
}
</style>
