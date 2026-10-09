<script setup lang="ts">
import { seeded, tufts, twinkleGroups } from './kit';

const rnd = seeded(1966);
// the far stand is bounded by two quadratic curves that spread apart at the sides, where the bowl wraps towards us
const quad = (u: number, end: number, mid: number) => (1 - u) * (1 - u) * end + 2 * u * (1 - u) * mid + u * u * end;
const STAND_TOP = { end: 250, mid: 480 };
const STAND_BOT = { end: 800, mid: 620 };
const standY = (x: number, t: number) => {
  const u = (x + 60) / 2040;
  return quad(u, STAND_TOP.end, STAND_TOP.mid) * (1 - t) + quad(u, STAND_BOT.end, STAND_BOT.mid) * t;
};
const TEAM = ['#e85a72', '#e8e2f0', '#f0c84a', '#4ac0d0', '#f0904a', '#9a70e8'];
const SKIN = ['#ffd9b0', '#e0a878', '#a8704a'];
const AISLES = [180, 560, 960, 1360, 1740];
const WAVE_SPAN = 5;
type Dot = { x: number; y: number; r: number; c: number; s: number };
const dots: Dot[] = [];
for (let t = 0.06, row = 0; t < 0.95; t += 0.055, row++) {
  for (let x = -50 + (row % 2) * 10; x < 1980; ) {
    const near = Math.abs(x - 960) / 1020;
    const step = 18 + near * 12;
    if (AISLES.every((a) => Math.abs(a - x) > step * 0.9)) {
      dots.push({ x: x + (rnd() - 0.5) * 5, y: standY(x, t) + (rnd() - 0.5) * 4, r: step * 0.3, c: Math.floor(rnd() * TEAM.length), s: Math.floor(rnd() * SKIN.length) });
    }
    x += step;
  }
}
const circlePath = (list: Dot[], dy = 0) => list.map((d) => `M${d.x - d.r} ${d.y + dy} a${d.r} ${d.r} 0 1 0 ${2 * d.r} 0 a${d.r} ${d.r} 0 1 0 ${-2 * d.r} 0`).join(' ');
const shirts = dots.map((d) => ({ ...d, y: d.y + d.r * 1.1, r: d.r * 1.15 }));
const CROWD = TEAM.map((c, i) => ({ c, d: circlePath(shirts.filter((p) => p.c === i)) }));
const HEADS = SKIN.map((c, i) => ({ c, d: circlePath(dots.filter((p) => p.s === i)) }));
const BODIES = circlePath(
  shirts.map((d) => ({ ...d, r: d.r * 1.25 })),
  2,
);
// the wave: raised-arm figures in a few vertical sheets that light up one after another
const WAVES = Array.from({ length: WAVE_SPAN }, (_, i) => {
  const x0 = -60 + (i * 2040) / WAVE_SPAN;
  const x1 = x0 + 2040 / WAVE_SPAN;
  const inSheet = dots.filter((d) => d.x >= x0 && d.x < x1 && rnd() < 0.7);
  return {
    heads: circlePath(inSheet, -6),
    arms: inSheet.map((d) => `M${d.x - d.r * 0.6} ${d.y - 2} l${-d.r * 0.7} ${-d.r * 1.8} M${d.x + d.r * 0.6} ${d.y - 2} l${d.r * 0.7} ${-d.r * 1.8}`).join(' '),
  };
});
const TIER_LINES = [0.2, 0.4, 0.6, 0.8].map((t) => `M-60 ${standY(-60, t)} Q960 ${2 * standY(960, t) - (standY(-60, t) + standY(1980, t)) / 2} 1980 ${standY(1980, t)}`);
const AISLE_PATH = AISLES.map((x) => `M${x} ${standY(x, 0)} L${x} ${standY(x, 1)}`).join(' ');
const STEP_PATH = AISLES.flatMap((x) => [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t) => `M${x - 10} ${standY(x, t)} h20`)).join(' ');
const STARS = twinkleGroups(Array.from({ length: 22 }, () => ({ x: 260 + rnd() * 1400, y: 20 + rnd() * 200, r: 1.5 + rnd() * 2 })));
const LAMPS = [0, 1, 2, 3].flatMap((c) => [0, 1, 2].map((r) => ({ x: -66 + c * 34, y: -44 + r * 30 })));
const TOWERS = [
  { x: 130, k: 1, flip: 1 },
  { x: 1790, k: 1, flip: -1 },
];
const FAR_TOWERS = [
  { x: 640, y: 330 },
  { x: 1280, y: 330 },
];
const BANNERS = [
  { x: 330, c1: '#ff4f6a', c2: '#fffaf0', kind: 'stripes' },
  { x: 700, c1: '#3ad6e0', c2: '#1b2b6b', kind: 'star' },
  { x: 1220, c1: '#ffd23f', c2: '#ff4f6a', kind: 'check' },
  { x: 1590, c1: '#a66bff', c2: '#fffaf0', kind: 'stripes' },
];
const FLAGS = [
  { x: 260, t: 0.35, c: '#ff4f6a', d: 0 },
  { x: 820, t: 0.25, c: '#ffd23f', d: 0.8 },
  { x: 1120, t: 0.3, c: '#3ad6e0', d: 1.6 },
  { x: 1680, t: 0.4, c: '#a66bff', d: 0.4 },
];
const FLAG_GROUPS = [FLAGS.filter((_, i) => i % 2 === 0), FLAGS.filter((_, i) => i % 2 === 1)];
const BOARDS = ['#ff4f6a', '#ffd23f', '#3ad6e0', '#a66bff'];
const BOARD_CURVE = 'M-60 806 Q960 626 1980 806';
// stripes radiate from one point above the far stand so the lawn recedes with the pitch
const STRIPES = Array.from({ length: 16 }, (_, i) => {
  const a = -1600 + i * 320;
  return `M${a} 1140 L${a + 160} 1140 L${960 + (a + 160 - 960) * 0.18} 600 L${960 + (a - 960) * 0.18} 600 Z`;
});
const goalLineX = (y: number) => 200 - (y - 834) * 0.964;
const PITCH_LINES = [
  'M100 850 Q960 700 1820 850',
  `M200 834 L${goalLineX(1140)} 1140`,
  `M${goalLineX(846)} 846 L520 846 L362 1010 L${goalLineX(1010)} 1010`,
  `M${goalLineX(862)} 862 L283 862 L165 985 L${goalLineX(985)} 985`,
  'M468 900 Q540 930 410 960',
  'M960 775 V1140',
].join(' ');
</script>

<template>
  <g>
    <defs>
      <linearGradient id="stadium-stand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a3a7a" />
        <stop offset="100%" stop-color="#16204a" />
      </linearGradient>
      <linearGradient id="stadium-dim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0e1636" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#0e1636" stop-opacity="0.05" />
      </linearGradient>
      <linearGradient id="stadium-roof" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a5a9a" />
        <stop offset="100%" stop-color="#1b2450" />
      </linearGradient>
      <linearGradient id="stadium-pitch" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5cc45a" />
        <stop offset="100%" stop-color="#2a8a3a" />
      </linearGradient>
      <radialGradient id="stadium-glare">
        <stop offset="0%" stop-color="#fffbe0" stop-opacity="0.95" />
        <stop offset="25%" stop-color="#fff6c8" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#fff6c8" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="stadium-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffbe0" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#fffbe0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="stadium-steel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#c8d2ec" />
        <stop offset="100%" stop-color="#6a78a8" />
      </linearGradient>
      <pattern id="stadium-net" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <path d="M0 0 H14 M0 0 V14" stroke="#ffffff" stroke-width="2" opacity="0.7" />
      </pattern>
      <clipPath id="stadium-pitch-clip">
        <path d="M-60 830 Q960 650 1980 830 L1980 1140 L-60 1140 Z" />
      </clipPath>
    </defs>

    <g v-for="(grp, gi) in STARS" :key="`st${gi}`" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" fill="#fff6e0">
      <circle v-for="(s, i) in grp" :key="i" :cx="s.x" :cy="s.y" :r="s.r" />
    </g>
    <path d="M-60 300 Q960 380 1980 300 L1980 420 L-60 420 Z" fill="#9ab4ff" opacity="0.18" />

    <g v-for="(t, i) in FAR_TOWERS" :key="`ft${i}`" :transform="`translate(${t.x} ${t.y})`">
      <path d="M0 0 V-150" stroke="#5a6aa8" stroke-width="8" />
      <rect x="-30" y="-180" width="60" height="34" rx="4" fill="#8a9ad0" stroke="#5a6aa8" stroke-width="3" />
      <circle cx="0" cy="-164" r="60" fill="url(#stadium-glare)" opacity="0.6" />
    </g>

    <path d="M-60 250 Q960 480 1980 250 L1980 180 Q960 410 -60 180 Z" fill="url(#stadium-roof)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M-60 214 Q960 444 1980 214" stroke="#8a9ad0" stroke-width="3" fill="none" opacity="0.6" />
    <path d="M100 196 L120 280 M400 252 L410 330 M700 288 L704 364 M1220 288 L1216 364 M1520 252 L1510 330 M1820 196 L1800 280" stroke="#0e1636" stroke-width="6" opacity="0.7" />
    <g fill="#fffbe0" class="glow">
      <circle v-for="x in [200, 420, 640, 860, 1060, 1280, 1500, 1720]" :key="`rl${x}`" :cx="x" :cy="standY(x, 0) - 8" r="4" />
    </g>

    <path d="M-60 250 Q960 480 1980 250 L1980 800 Q960 620 -60 800 Z" fill="url(#stadium-stand)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path v-for="(d, i) in TIER_LINES" :key="`tl${i}`" :d="d" stroke="#0e1636" stroke-width="3" fill="none" opacity="0.6" />
    <path :d="BODIES" fill="#0e1636" opacity="0.7" />
    <path v-for="(c, i) in CROWD" :key="`cr${i}`" :d="c.d" :fill="c.c" />
    <path v-for="(c, i) in HEADS" :key="`hd${i}`" :d="c.d" :fill="c.c" />
    <path d="M-60 250 Q960 480 1980 250 L1980 800 Q960 620 -60 800 Z" fill="url(#stadium-dim)" />
    <path :d="AISLE_PATH" stroke="#8a9ad0" stroke-width="22" opacity="0.55" />
    <path :d="STEP_PATH" stroke="#c8d2ec" stroke-width="4" opacity="0.6" />
    <g v-for="(w, i) in WAVES" :key="`wv${i}`" class="stadium-wave" :style="{ animationDelay: `${i * 0.45}s` }">
      <path :d="w.arms" stroke="#fffaf0" stroke-width="4" stroke-linecap="round" />
      <path :d="w.heads" fill="#ffe2b0" />
    </g>
    <rect x="-60" y="240" width="2040" height="160" fill="#0e1636" opacity="0.18" />

    <g v-for="(grp, gi) in FLAG_GROUPS" :key="`fg${gi}`">
      <g v-for="(f, i) in grp" :key="`fl${i}`" :transform="`translate(${f.x} ${standY(f.x, f.t)})`">
        <g class="stadium-flag" :style="{ animationDelay: `-${f.d}s` }">
          <path d="M0 0 V-90" stroke="#1b1033" stroke-width="7" stroke-linecap="round" />
          <path d="M0 0 V-90" stroke="#e0e6ff" stroke-width="3" stroke-linecap="round" />
          <path d="M2 -88 Q36 -96 66 -80 Q60 -64 66 -48 Q36 -62 2 -54 Z" :fill="f.c" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
          <path d="M8 -80 Q30 -86 48 -78" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7" />
        </g>
      </g>
    </g>

    <path d="M-60 800 Q960 620 1980 800" stroke="#1b1033" stroke-width="16" fill="none" />
    <path d="M-60 798 Q960 618 1980 798" stroke="#c8d2ec" stroke-width="6" fill="none" />
    <g v-for="(b, i) in BANNERS" :key="`bn${i}`" :transform="`translate(${b.x} ${standY(b.x, 1) - 54})`">
      <rect x="-50" y="0" width="100" height="56" :fill="b.c1" stroke="#1b1033" stroke-width="4" />
      <path v-if="b.kind === 'stripes'" d="M-25 2 V54 M25 2 V54" :stroke="b.c2" stroke-width="16" />
      <path v-if="b.kind === 'star'" d="M0 8 L7 22 L22 23 L11 33 L14 48 L0 40 L-14 48 L-11 33 L-22 23 L-7 22 Z" :fill="b.c2" stroke="#1b1033" stroke-width="2.5" stroke-linejoin="round" />
      <path v-if="b.kind === 'check'" d="M-48 2 h24 v26 h-24 Z M0 2 h24 v26 h-24 Z M-24 28 h24 v26 h-24 Z M24 28 h24 v26 h-24 Z" :fill="b.c2" />
      <rect x="-50" y="0" width="100" height="56" fill="none" stroke="#1b1033" stroke-width="4" />
      <path d="M-44 6 H20" stroke="#fff" stroke-width="3" opacity="0.6" stroke-linecap="round" />
    </g>

    <path d="M-60 830 Q960 650 1980 830 L1980 1140 L-60 1140 Z" fill="url(#stadium-pitch)" stroke="#1b1033" stroke-width="5" />
    <g clip-path="url(#stadium-pitch-clip)">
      <path :d="STRIPES.join(' ')" fill="#7ad86a" opacity="0.35" />
      <path d="M-60 830 Q960 650 1980 830 L1980 880 Q960 700 -60 880 Z" fill="#0e3a1a" opacity="0.25" />
    </g>
    <path v-for="(c, i) in BOARDS" :key="`bd${i}`" :d="BOARD_CURVE" :stroke="c" stroke-width="40" fill="none" stroke-dasharray="240 720" :stroke-dashoffset="-i * 240" />
    <path :d="BOARD_CURVE" stroke="#fff" stroke-width="10" fill="none" stroke-dasharray="14 26" opacity="0.45" />
    <path d="M-60 786 Q960 606 1980 786 M-60 826 Q960 646 1980 826" stroke="#1b1033" stroke-width="4" fill="none" />
    <path d="M-60 790 Q960 610 1980 790" stroke="#fff" stroke-width="3" fill="none" opacity="0.5" />

    <path :d="PITCH_LINES" stroke="#f4fff0" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.85" />
    <ellipse cx="960" cy="900" rx="260" ry="80" fill="none" stroke="#f4fff0" stroke-width="6" opacity="0.6" />
    <ellipse cx="960" cy="900" rx="9" ry="4" fill="#f4fff0" opacity="0.8" />
    <ellipse cx="330" cy="930" rx="8" ry="4" fill="#f4fff0" opacity="0.85" />
    <path :d="tufts(30, 1080, 1900, 0.02)" stroke="#1f6a2c" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />

    <g>
      <ellipse cx="80" cy="930" rx="120" ry="30" fill="#0e3a1a" opacity="0.3" />
      <path d="M156 760 L79 820 L-21 880 L66 800 Z" fill="url(#stadium-net)" />
      <path d="M156 760 L156 880 L66 872 L66 800 Z" fill="url(#stadium-net)" />
      <path d="M66 800 L66 872 L-21 954 L-21 880 Z" fill="url(#stadium-net)" />
      <path d="M156 760 L66 800 L-21 880 M156 880 L66 872 L-21 954 M66 800 V872 M-21 880 V954" stroke="#c8d2ec" stroke-width="4" fill="none" stroke-linejoin="round" />
      <path d="M156 880 V760 L79 820 V960" stroke="#1b1033" stroke-width="16" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M156 880 V760 L79 820 V960" stroke="#fffaf0" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M152 870 V768" stroke="#c8d2ec" stroke-width="3" />
    </g>

    <g v-for="(t, i) in TOWERS" :key="`tw${i}`" :transform="`translate(${t.x} 0) scale(${t.flip} 1)`">
      <path d="M-14 520 L-6 120 H6 L14 520 Z" fill="url(#stadium-steel)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-10 480 L8 420 L-8 360 L8 300 L-8 240 L6 180" stroke="#4a5a9a" stroke-width="3" fill="none" />
      <g transform="translate(0 110) rotate(12)">
        <rect x="-80" y="-60" width="150" height="100" rx="8" fill="#2a3a7a" stroke="#1b1033" stroke-width="5" />
        <rect v-for="(l, li) in LAMPS" :key="`lp${li}`" :x="l.x" :y="l.y" width="26" height="22" rx="4" fill="#fffbe0" stroke="#c8b860" stroke-width="2" />
      </g>
      <path d="M-60 140 L-520 1000 L460 1000 L60 140 Z" fill="url(#stadium-beam)" />
      <circle cx="0" cy="110" r="190" fill="url(#stadium-glare)" class="glow" :style="{ animationDelay: `-${i * 0.6}s` }" />
    </g>

    <g transform="translate(1240 990)">
      <ellipse cx="0" cy="2" rx="46" ry="10" fill="#0e3a1a" opacity="0.4" class="stadium-shadow" />
      <g class="stadium-ball">
        <circle cx="0" cy="-34" r="34" fill="#fffaf0" stroke="#1b1033" stroke-width="5" />
        <path d="M0 -48 L13 -38 L8 -22 L-8 -22 L-13 -38 Z" fill="#1b1033" />
        <path d="M-30 -48 L-20 -42 L-24 -28 L-33 -26 M30 -48 L20 -42 L24 -28 L33 -26 M-14 -2 L-8 -12 L8 -12 L14 -2" stroke="#1b1033" stroke-width="4" fill="none" stroke-linejoin="round" />
        <path d="M-20 -56 Q-12 -62 -2 -63" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M20 -10 Q30 -18 32 -30" stroke="#c8d2ec" stroke-width="5" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g transform="translate(470 1060)">
      <g v-for="(cx, ci) in [0, 90]" :key="`cn${ci}`" :transform="`translate(${cx} ${ci * 14})`">
        <ellipse cx="0" cy="4" rx="40" ry="9" fill="#0e3a1a" opacity="0.35" />
        <path d="M-34 0 L-12 -64 Q0 -70 12 -64 L34 0 Z" fill="#ff8a2f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)" />
        <path d="M-22 -30 Q0 -24 22 -30" stroke="#fffaf0" stroke-width="7" fill="none" />
        <path d="M-40 0 H40" stroke="#1b1033" stroke-width="7" stroke-linecap="round" />
      </g>
    </g>

    <g fill="#0b1430" stroke="#05091a" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 V1000 Q60 970 170 1010 Q240 1050 250 1140 Z" />
      <path d="M1830 1000 L1740 1140 M1830 1000 L1830 1140 M1830 1000 L1920 1140" fill="none" stroke-width="14" stroke-linecap="round" />
      <rect x="1760" y="900" width="230" height="110" rx="16" />
      <rect x="1680" y="918" width="90" height="72" rx="10" />
      <path d="M1660 908 L1690 908 L1690 1000 L1660 1000 Z" />
      <path d="M1800 900 V870 H1900 V900" />
    </g>
    <path d="M-40 1010 Q60 986 160 1018 M1774 906 H1980 M1688 924 H1764 M1808 876 H1896" stroke="#6a8ad0" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.5" />
  </g>
</template>

<style scoped>
.stadium-wave {
  opacity: 0;
  animation: stadium-wave 4.5s ease-in-out infinite;
}

.stadium-flag {
  transform-box: fill-box;
  transform-origin: bottom left;
  animation: stadium-flag 1.6s ease-in-out infinite alternate;
}

.stadium-ball {
  animation: stadium-bounce 1.4s cubic-bezier(0.5, 0, 0.5, 1) infinite alternate;
}

.stadium-shadow {
  transform-box: fill-box;
  transform-origin: center;
  animation: stadium-shadow 1.4s cubic-bezier(0.5, 0, 0.5, 1) infinite alternate;
}

@keyframes stadium-wave {
  0%,
  24%,
  100% {
    opacity: 0;
    translate: 0 6px;
  }
  10% {
    opacity: 1;
    translate: 0 -4px;
  }
}

@keyframes stadium-flag {
  from {
    rotate: -8deg;
  }
  to {
    rotate: 8deg;
  }
}

@keyframes stadium-bounce {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -40px;
  }
}

@keyframes stadium-shadow {
  from {
    scale: 1;
    opacity: 0.4;
  }
  to {
    scale: 0.6;
    opacity: 0.2;
  }
}
</style>
