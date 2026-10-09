<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(808);
const f1 = (n: number) => n.toFixed(1);
const circ = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;
const STARS = twinkleGroups(Array.from({ length: 80 }, () => ({ x: rnd() * 1920, y: rnd() * 480, r: 1 + rnd() * 2.2 }))).map((g) => g.map((s) => circ(s.x, s.y, s.r)).join(' '));
const LIGHT_COLORS = ['#fff3a0', '#ff7ab0', '#7af0ff', '#9dff8a'];
const PARK_LIGHTS = twinkleGroups(
  Array.from({ length: 120 }, () => {
    const x = rnd() * 1920;
    return { x, y: 680 + rnd() * 200 };
  }),
);
const TENTS = [
  { x: 260, y: 700, w: 70, c: '#ff4f6d' },
  { x: 460, y: 730, w: 90, c: '#3ad6e0' },
  { x: 1380, y: 720, w: 80, c: '#ffd23f' },
  { x: 1600, y: 700, w: 60, c: '#8a6bff' },
  { x: 1760, y: 740, w: 90, c: '#ff8a2f' },
];
// we ride at the top of a wheel whose hub is far below the screen; only its rim and the neighbours show
const HUB = { x: 960, y: 1500 };
const rimAt = (r: number, x: number) => HUB.y - Math.sqrt(r * r - (x - HUB.x) ** 2);
const RIM = `M-60 ${f1(rimAt(1300, -60))} A1300 1300 0 0 1 1980 ${f1(rimAt(1300, 1980))} M-60 ${f1(rimAt(1240, -60))} A1240 1240 0 0 1 1980 ${f1(rimAt(1240, 1980))}`;
const BRACES = Array.from({ length: 22 }, (_, i) => -40 + i * 92)
  .map((x) => `M${x} ${f1(rimAt(1300, x))} L${x + 46} ${f1(rimAt(1240, x + 46))}`)
  .join(' ');
const RIM_LIGHTS = Array.from({ length: 22 }, (_, i) => -20 + i * 92)
  .map((x) => `M${x} ${f1(rimAt(1270, x))} h0.1`)
  .join(' ');
const CABINS = [
  { x: 200, y: rimAt(1300, 200), roof: '#ffd23f', body: '#ff7ab0' },
  { x: 1720, y: rimAt(1300, 1720), roof: '#9dff8a', body: '#8a6bff' },
];
const CANOPY = Array.from({ length: 13 }, (_, i) => ({ x: -60 + i * 160, c: i % 2 ? '#fff4e8' : '#ff3d6e' }));
const BULBS = Array.from({ length: 24 }, (_, i) => ({ x: -40 + i * 84, c: ['#fff3a0', '#ff7ab0', '#7af0ff', '#9dff8a'][i % 4]! }));
const BULB_GROUPS = [0, 1].map((g) => BULBS.filter((_, i) => i % 2 === g));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="fair-ferris-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#140a3a" />
        <stop offset="55%" stop-color="#3b1a7a" />
        <stop offset="100%" stop-color="#c2408f" />
      </linearGradient>
      <linearGradient id="fair-ferris-park" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5e3070" />
        <stop offset="100%" stop-color="#2e1842" />
      </linearGradient>
      <linearGradient id="fair-ferris-car" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3ad6e0" />
        <stop offset="100%" stop-color="#1a8aa8" />
      </linearGradient>
      <linearGradient id="fair-ferris-steel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4eaff" />
        <stop offset="100%" stop-color="#a99ad0" />
      </linearGradient>
      <radialGradient id="fair-ferris-moon" cx="38%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#fffbe6" />
        <stop offset="100%" stop-color="#f2d98a" />
      </radialGradient>
      <radialGradient id="fair-ferris-glow">
        <stop offset="0%" stop-color="#ffd6a0" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#ffd6a0" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#fair-ferris-sky)" />
    <path v-for="(d, gi) in STARS" :key="`st${gi}`" :d="d" fill="#fff6dc" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" />
    <circle cx="1460" cy="250" r="150" fill="#fff4c2" opacity="0.08" />
    <circle cx="1460" cy="250" r="78" fill="url(#fair-ferris-moon)" stroke="#1b1033" stroke-width="5" />
    <circle cx="1440" cy="230" r="14" fill="#e2c574" opacity="0.7" />
    <circle cx="1490" cy="280" r="10" fill="#e2c574" opacity="0.7" />
    <g class="fair-ferris-cloud">
      <path d="M300 300 Q320 270 380 276 Q410 246 470 266 Q530 262 540 296 Z" fill="#5a3a9a" stroke="#7a5ab8" stroke-width="3" stroke-linejoin="round" opacity="0.8" />
    </g>

    <path d="M-60 660 Q480 630 960 646 Q1440 662 1980 640 V1200 H-60 Z" fill="url(#fair-ferris-park)" />
    <ellipse cx="960" cy="720" rx="900" ry="120" fill="url(#fair-ferris-glow)" />
    <path d="M100 760 Q500 700 960 740 Q1400 780 1860 720 M600 860 Q800 760 960 740 Q1120 720 1300 860" stroke="#8e5a96" stroke-width="10" fill="none" opacity="0.7" />
    <g stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
      <path v-for="(t, i) in TENTS" :key="`tn${i}`" :d="`M${t.x - t.w / 2} ${t.y} L${t.x} ${t.y - t.w * 0.7} L${t.x + t.w / 2} ${t.y} Z`" :fill="t.c" />
    </g>
    <g transform="translate(960 760)" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
      <ellipse cx="0" cy="0" rx="90" ry="24" fill="#ffd23f" />
      <path d="M-90 0 L0 -60 L90 0 Z" fill="#ff3d6e" />
      <path d="M0 -60 V-76" />
    </g>
    <path d="M1100 700 L1160 640 L1200 700 L1240 660 L1300 700" stroke="#c7628f" stroke-width="5" fill="none" />
    <path v-for="(g, gi) in PARK_LIGHTS" :key="`pl${gi}`" :d="g.map((p) => `M${f1(p.x)} ${f1(p.y)} h0.1`).join(' ')" :stroke="LIGHT_COLORS[gi]" stroke-width="7" stroke-linecap="round" class="twinkle" :style="{ animationDelay: `-${gi * 0.6}s`, animationDuration: '2.2s' }" />

    <g stroke="#1b1033" stroke-linejoin="round" fill="none">
      <path :d="RIM" stroke-width="34" />
      <path :d="RIM" stroke="url(#fair-ferris-steel)" stroke-width="20" />
      <path :d="BRACES" stroke-width="8" />
    </g>
    <path :d="RIM_LIGHTS" stroke="#fff3a0" stroke-width="12" stroke-linecap="round" class="fair-ferris-bulb" />
    <g v-for="(c, i) in CABINS" :key="`cb${i}`" :transform="`translate(${c.x} ${c.y})`">
      <g class="fair-ferris-swing" :style="{ animationDelay: `${-i * 1.3}s` }">
        <g stroke="#1b1033" stroke-linejoin="round">
          <path d="M0 0 V50" stroke-width="10" />
          <path d="M-80 130 Q-80 50 0 50 Q80 50 80 130 Z" :fill="c.roof" stroke-width="6" />
          <rect x="-90" y="120" width="180" height="90" rx="14" :fill="c.body" stroke-width="6" />
          <circle cx="-30" cy="106" r="22" fill="#5a3a2a" stroke-width="4" />
          <circle cx="30" cy="106" r="22" fill="#ffd23f" stroke-width="4" />
          <path d="M-70 150 H70" stroke="#fff" stroke-width="6" opacity="0.5" />
        </g>
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-60 -60 H1980 V90 H-60 Z" fill="#ff3d6e" stroke-width="6" />
      <path v-for="(c, i) in CANOPY" :key="`cn${i}`" :d="`M${c.x} -60 H${c.x + 160} V90 Q${c.x + 80} 150 ${c.x} 90 Z`" :fill="c.c" stroke-width="5" />
      <path d="M-60 90 H1980" stroke-width="5" />
      <rect x="-60" y="80" width="130" height="1100" fill="url(#fair-ferris-car)" stroke-width="7" filter="url(#cel)" />
      <rect x="1850" y="80" width="130" height="1100" fill="url(#fair-ferris-car)" stroke-width="7" filter="url(#cel)" />
      <path d="M40 120 V1000 M1880 120 V1000" stroke="#9af0f8" stroke-width="8" stroke-linecap="round" />
    </g>
    <g v-for="(g, gi) in BULB_GROUPS" :key="`bl${gi}`" :class="gi ? 'fair-ferris-bulb late' : 'fair-ferris-bulb'">
      <circle v-for="(b, i) in g" :key="`b${i}`" :cx="b.x" cy="128" r="9" :fill="b.c" stroke="#1b1033" stroke-width="3" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-60 900 Q960 860 1980 900 V1200 H-60 Z" fill="url(#fair-ferris-car)" stroke-width="7" filter="url(#cel)" />
      <path d="M-60 930 Q960 892 1980 930" stroke="#9af0f8" stroke-width="8" fill="none" />
      <path d="M-60 846 Q960 806 1980 846" stroke-width="36" fill="none" stroke-linecap="round" />
      <path d="M-60 846 Q960 806 1980 846" stroke="#ffd23f" stroke-width="22" fill="none" stroke-linecap="round" />
      <path d="M300 846 V900 M960 826 V890 M1620 846 V900" stroke-width="16" />
      <path d="M300 846 V900 M960 826 V890 M1620 846 V900" stroke="#ffd23f" stroke-width="8" />
      <circle cx="400" cy="1000" r="20" fill="#ffd23f" stroke-width="5" />
      <circle cx="1520" cy="1000" r="20" fill="#ffd23f" stroke-width="5" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <g transform="translate(700 820)">
        <path d="M-40 26 Q-50 -20 -20 -26 Q10 -30 40 -10 Q50 10 40 26 Z" fill="#ffc890" stroke-width="5" />
        <path d="M-30 -20 v-14 M-12 -26 v-14 M6 -26 v-12 M24 -18 v-12" stroke-width="5" stroke-linecap="round" />
      </g>
      <g transform="translate(1220 820)">
        <path d="M40 26 Q50 -20 20 -26 Q-10 -30 -40 -10 Q-50 10 -40 26 Z" fill="#ffc890" stroke-width="5" />
        <path d="M30 -20 v-14 M12 -26 v-14 M-6 -26 v-12 M-24 -18 v-12" stroke-width="5" stroke-linecap="round" />
      </g>
      <g transform="translate(1660 900)">
        <path d="M-50 -110 H50 L40 0 H-40 Z" fill="#fff4e8" stroke-width="6" />
        <path d="M-30 -110 L-24 0 M0 -110 V0 M30 -110 L24 0" stroke="#ff3d6e" stroke-width="10" />
        <circle cx="-30" cy="-120" r="20" fill="#fff6c0" stroke-width="4" />
        <circle cx="0" cy="-134" r="22" fill="#fff6c0" stroke-width="4" />
        <circle cx="30" cy="-120" r="20" fill="#fff6c0" stroke-width="4" />
        <circle cx="-12" cy="-150" r="18" fill="#fff6c0" stroke-width="4" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.fair-ferris-cloud {
  animation: fair-ferris-drift 40s linear infinite alternate;
}

.fair-ferris-swing {
  transform-origin: 0 0;
  animation: fair-ferris-swing 3s ease-in-out infinite alternate;
}

.fair-ferris-bulb {
  animation: fair-ferris-bulb 1.2s steps(2) infinite;
}

.fair-ferris-bulb.late {
  animation-delay: -0.6s;
}

@keyframes fair-ferris-drift {
  from {
    translate: -100px 0;
  }
  to {
    translate: 600px 0;
  }
}

@keyframes fair-ferris-swing {
  from {
    rotate: -5deg;
  }
  to {
    rotate: 5deg;
  }
}

@keyframes fair-ferris-bulb {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.35;
  }
}
</style>
