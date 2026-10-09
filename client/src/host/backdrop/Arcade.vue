<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(254);
const STARS = Array.from({ length: 60 }, () => ({
  x: Math.round((rnd() * 1920) / 8) * 8,
  y: Math.round((rnd() * 480) / 8) * 8,
}));
const PIXELS = [0, 1].map((g) => STARS.filter((_, i) => i % 2 === g));
const GRID_X = Array.from({ length: 25 }, (_, i) => i - 12);
const GRID_ROWS = 10;
const GRID_PERIOD = 3;
const PX = 7;
// each stripe is only as wide as the sun at its top edge: an overhang would show as a dark bar
// across the glow behind the sun; the stripes slide 34px down, so the corners overhang a little
const SUN_STRIPES = Array.from({ length: 7 }, (_, n) => ({
  y: 560 + n * 34,
  h: 9 + n * 3,
  w: Math.ceil(Math.sqrt(260 ** 2 - (n * 34) ** 2)) + 4,
}));

/** One path of unit squares for every X in the bitmap rows. */
function pixels(rows: string[]): string {
  let d = '';
  rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === 'X') d += `M${x * PX} ${y * PX}h${PX}v${PX}h${-PX}Z`;
    }),
  );
  return d;
}

const CRAB = [
  pixels(['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...']),
  pixels(['..X.....X..', 'X..X...X..X', 'X.XXXXXXX.X', 'XXX.XXX.XXX', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..X.....X..', '.X.......X.']),
];
const SQUID = [
  pixels(['...XX...', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '..X..X..', '.X.XX.X.', 'X.X..X.X']),
  pixels(['...XX...', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '.X.XX.X.', 'X......X', '.X....X.']),
];
const FLEET = [
  ...[0, 1, 2, 3].map((i) => ({ x: 14 + i * 110, y: 0, shape: SQUID, c: '#ff4fd8' })),
  ...[0, 1, 2, 3].map((i) => ({ x: i * 110, y: 80, shape: CRAB, c: '#2ef2a0' })),
];
const DOTS = Array.from({ length: 22 }, (_, i) => 420 + i * 52);
const CABS = [
  { x: -30, flip: 1, body: 'url(#arcade-cab-a)', side: '#24105a', neon: '#22d3ee' },
  { x: 1950, flip: -1, body: 'url(#arcade-cab-b)', side: '#5a0f3e', neon: '#ffd23f' },
];
const PALMS = [
  { x: 470, k: 1 },
  { x: 1450, k: 0.85 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="arcade-sky" x1="0" y1="0" x2="0" y2="720" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0d0026" />
        <stop offset="55%" stop-color="#3a0a6a" />
        <stop offset="85%" stop-color="#8a1a7a" />
        <stop offset="100%" stop-color="#d42d86" />
      </linearGradient>
      <linearGradient id="arcade-sun" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff38a" />
        <stop offset="45%" stop-color="#ffb347" />
        <stop offset="100%" stop-color="#ff3d8b" />
      </linearGradient>
      <linearGradient id="arcade-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6a2ab0" />
        <stop offset="100%" stop-color="#3a1272" />
      </linearGradient>
      <linearGradient id="arcade-near" x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0%" stop-color="#3d1680" />
        <stop offset="100%" stop-color="#1a063c" />
      </linearGradient>
      <linearGradient id="arcade-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff5fa8" stop-opacity="0" />
        <stop offset="75%" stop-color="#ff5fa8" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#ff5fa8" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="arcade-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a0656" />
        <stop offset="100%" stop-color="#0c0020" />
      </linearGradient>
      <linearGradient id="arcade-cab-a" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#6a3ae0" />
        <stop offset="100%" stop-color="#2c1280" />
      </linearGradient>
      <linearGradient id="arcade-cab-b" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#ff4f8b" />
        <stop offset="100%" stop-color="#9a1458" />
      </linearGradient>
      <linearGradient id="arcade-screen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#14306a" />
        <stop offset="100%" stop-color="#070a26" />
      </linearGradient>
      <linearGradient id="arcade-marquee" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6c8" />
        <stop offset="100%" stop-color="#ffb347" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="800" fill="url(#arcade-sky)" />
    <g v-for="(g, gi) in PIXELS" :key="`px${gi}`" class="twinkle" :style="{ animationDelay: `${gi * 1.5}s` }"><rect v-for="(p, i) in g" :key="i" :x="p.x" :y="p.y" width="8" height="8" fill="#9ff3ff" /></g>

    <circle cx="960" cy="560" r="330" fill="#ff7ac0" opacity="0.12" />
    <circle cx="960" cy="560" r="260" fill="url(#arcade-sun)" stroke="#1b1033" stroke-width="5" />
    <path d="M820 380 Q870 334 940 320" stroke="#fffbe8" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.7" />
    <g class="stripes">
      <rect v-for="s in SUN_STRIPES" :key="`st${s.y}`" :x="960 - s.w" :y="s.y" :width="s.w * 2" :height="s.h" fill="url(#arcade-sky)" />
    </g>

    <path d="M-60 700 L80 610 L180 650 L330 540 L470 640 L560 600 L700 700 Z M1220 700 L1360 600 L1440 640 L1600 530 L1740 630 L1840 580 L1980 650 L1980 700 Z" fill="url(#arcade-far)" stroke="#ff8ad0" stroke-width="3" stroke-linejoin="round" />
    <path d="M330 540 L300 700 M330 540 L380 700 M180 650 L200 700 M560 600 L540 700 M1600 530 L1570 700 M1600 530 L1660 700 M1360 600 L1380 700 M1840 580 L1820 700" stroke="#ff8ad0" stroke-width="2" opacity="0.45" />
    <rect x="-60" y="560" width="2040" height="160" fill="url(#arcade-haze)" />
    <path d="M-60 700 L40 650 L140 680 L250 630 L380 700 Z M1560 700 L1680 640 L1780 676 L1880 620 L1980 660 L1980 700 Z" fill="url(#arcade-near)" stroke="#22d3ee" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)" />

    <g v-for="(p, i) in PALMS" :key="`pa${i}`" :transform="`translate(${p.x} 700) scale(${p.k})`">
      <path d="M0 0 Q14 -150 -18 -300" stroke="#ff5fa8" stroke-width="26" fill="none" stroke-linecap="round" />
      <path d="M0 0 Q14 -150 -18 -300" stroke="#1a0636" stroke-width="18" fill="none" stroke-linecap="round" />
      <g transform="translate(-18 -300)" fill="#1a0636" stroke="#ff5fa8" stroke-width="4" stroke-linejoin="round">
        <path d="M0 0 Q-90 -40 -170 30 Q-80 -6 0 0 Z" />
        <path d="M0 0 Q100 -40 170 30 Q80 -6 0 0 Z" />
        <path d="M0 0 Q-40 -90 -120 -110 Q-30 -50 0 0 Z" />
        <path d="M0 0 Q50 -90 130 -96 Q40 -46 0 0 Z" />
        <path d="M0 0 Q-110 10 -150 90 Q-70 20 0 0 Z" />
      </g>
    </g>

    <path d="M-60 700 L1980 700 L1980 1140 L-60 1140 Z" fill="url(#arcade-floor)" />
    <g stroke="#ff3d8b" stroke-width="3" opacity="0.85">
      <line v-for="x in GRID_X" :key="`gx${x}`" :x1="960 + x * 60" y1="700" :x2="960 + x * 330" y2="1080" />
    </g>
    <g stroke="#22d3ee" stroke-width="3">
      <line
        v-for="i in GRID_ROWS"
        :key="`gy${i}`"
        x1="0"
        y1="700"
        x2="1920"
        y2="700"
        class="row"
        :style="{ animationDelay: `-${((i - 1) * GRID_PERIOD) / GRID_ROWS}s`, animationDuration: `${GRID_PERIOD}s` }"
      />
    </g>
    <line x1="-60" y1="700" x2="1980" y2="700" stroke="#ff3d8b" stroke-width="10" opacity="0.35" />
    <line x1="-60" y1="700" x2="1980" y2="700" stroke="#ffd0ea" stroke-width="4" />

    <g class="arcade-march">
      <g transform="translate(170 110)">
        <g v-for="(v, i) in FLEET" :key="`fl${i}`" :transform="`translate(${v.x} ${v.y})`">
          <path :d="v.shape[0]" fill="#1b1033" transform="translate(5 5)" />
        </g>
        <g class="arcade-frame">
          <path v-for="(v, i) in FLEET" :key="`fa${i}`" :d="v.shape[0]" :fill="v.c" :transform="`translate(${v.x} ${v.y})`" />
        </g>
        <g class="arcade-frame b">
          <path v-for="(v, i) in FLEET" :key="`fb${i}`" :d="v.shape[1]" :fill="v.c" :transform="`translate(${v.x} ${v.y})`" />
        </g>
      </g>
    </g>

    <circle v-for="x in DOTS" :key="`dot${x}`" :cx="x" cy="1040" r="6" fill="#ffd9a0" stroke="#1b1033" stroke-width="3" />
    <g class="chase">
      <g transform="translate(0 1040)">
        <circle cx="0" cy="0" r="34" fill="#ffd23f" stroke="#1b1033" stroke-width="5" />
        <path d="M-14 -22 Q0 -30 14 -24" stroke="#fff6c8" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M2 0 L40 -24 L40 24 Z" fill="#0c0020" class="chomp" />
        <circle cx="4" cy="-16" r="5" fill="#1b1033" />
        <g transform="translate(-120 0)">
          <path d="M-30 30 L-30 -4 Q-30 -34 0 -34 Q30 -34 30 -4 L30 30 L15 18 L0 30 L-15 18 Z" fill="#ff4f8b" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
          <path d="M-18 -22 Q-8 -30 4 -30" stroke="#ffb3d0" stroke-width="5" fill="none" stroke-linecap="round" />
          <ellipse cx="-10" cy="-6" rx="8" ry="10" fill="#fff" />
          <ellipse cx="12" cy="-6" rx="8" ry="10" fill="#fff" />
          <circle cx="-6" cy="-5" r="4" fill="#1b1033" />
          <circle cx="16" cy="-5" r="4" fill="#1b1033" />
        </g>
      </g>
    </g>

    <g v-for="(c, i) in CABS" :key="`cab${i}`" :transform="`translate(${c.x} 0) scale(${c.flip} 1)`">
      <ellipse cx="190" cy="1046" rx="230" ry="26" fill="#000" opacity="0.4" />
      <g filter="url(#cel)">
        <path d="M300 430 L360 452 L360 1030 L300 1050 Z" :fill="c.side" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <rect x="30" y="510" width="270" height="270" :fill="c.body" stroke="#1b1033" stroke-width="5" />
        <rect x="30" y="830" width="270" height="220" :fill="c.body" stroke="#1b1033" stroke-width="5" />
      </g>
      <path d="M318 520 L346 540 M318 600 L346 640 M318 900 L346 940" :stroke="c.neon" stroke-width="6" stroke-linecap="round" opacity="0.8" />
      <rect x="20" y="420" width="290" height="96" rx="8" fill="url(#arcade-marquee)" stroke="#1b1033" stroke-width="5" />
      <path d="M60 468 l14 -24 l14 24 Z M240 468 l14 -24 l14 24 Z" :fill="c.neon" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <rect x="110" y="446" width="110" height="18" rx="9" fill="#ff3d8b" stroke="#1b1033" stroke-width="3" />
      <rect x="110" y="474" width="110" height="12" rx="6" fill="#a66bff" stroke="#1b1033" stroke-width="3" />
      <path d="M36 432 Q100 426 170 428" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
      <rect x="58" y="534" width="214" height="200" rx="18" fill="#140a30" stroke="#1b1033" stroke-width="5" />
      <rect x="72" y="548" width="186" height="172" rx="12" fill="url(#arcade-screen)" />
      <path :d="SQUID[0]" fill="#2ef2a0" transform="translate(110 570) scale(0.6)" />
      <path :d="CRAB[0]" fill="#ff4fd8" transform="translate(170 576) scale(0.6)" />
      <path :d="CRAB[1]" fill="#ffd23f" transform="translate(132 616) scale(0.6)" />
      <path d="M150 700 h12 v-10 h8 v10 h12 v10 h-32 Z" :fill="c.neon" />
      <rect x="90" y="560" width="60" height="6" fill="#9ff3ff" opacity="0.7" />
      <path d="M88 690 L130 560 M106 700 L146 580" stroke="#fff" stroke-width="5" opacity="0.15" stroke-linecap="round" />
      <path d="M0 780 L330 780 L350 840 L-20 840 Z" fill="#1d0c46" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M10 790 L320 790" stroke="#4a3a9a" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <ellipse cx="100" cy="808" rx="24" ry="8" fill="#0c0020" />
      <path d="M100 808 L92 760" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
      <path d="M100 808 L92 760" stroke="#c8c2e8" stroke-width="5" stroke-linecap="round" />
      <circle cx="90" cy="752" r="17" fill="#ff3b5c" stroke="#1b1033" stroke-width="4" />
      <circle cx="84" cy="746" r="5" fill="#fff" opacity="0.8" />
      <ellipse cx="190" cy="810" rx="16" ry="9" fill="#22d3ee" stroke="#1b1033" stroke-width="4" />
      <ellipse cx="236" cy="804" rx="16" ry="9" fill="#ffd23f" stroke="#1b1033" stroke-width="4" />
      <ellipse cx="280" cy="814" rx="16" ry="9" fill="#2ef2a0" stroke="#1b1033" stroke-width="4" />
      <rect x="125" y="880" width="80" height="110" rx="6" fill="#1d0c46" stroke="#1b1033" stroke-width="5" />
      <rect x="140" y="900" width="14" height="30" rx="3" fill="#ff7a2f" stroke="#1b1033" stroke-width="3" />
      <rect x="176" y="900" width="14" height="30" rx="3" fill="#ff7a2f" stroke="#1b1033" stroke-width="3" />
      <path d="M140 960 H190" stroke="#4a3a9a" stroke-width="5" stroke-linecap="round" />
    </g>
    <g class="arcade-flicker" fill="#9ff3ff">
      <rect x="42" y="548" width="186" height="172" rx="12" />
      <rect x="1692" y="548" width="186" height="172" rx="12" />
    </g>

    <rect x="-60" y="-60" width="2040" height="1200" fill="url(#scanlines)" />
  </g>
</template>

<style scoped>
.arcade-march {
  animation: arcade-march 6s steps(6) infinite alternate;
}

.arcade-frame {
  animation: arcade-frame 1s steps(1) infinite;
}

.arcade-frame.b {
  animation-delay: -0.5s;
}

.arcade-flicker {
  animation: arcade-flicker 0.24s steps(2) infinite alternate;
}

@keyframes arcade-march {
  from {
    translate: 0 0;
  }
  to {
    translate: 300px 24px;
  }
}

@keyframes arcade-frame {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes arcade-flicker {
  from {
    opacity: 0.04;
  }
  to {
    opacity: 0.12;
  }
}
</style>
