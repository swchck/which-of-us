<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(913);
const FLOOR_TOP = 800;
const VP = { x: 960, y: 420 };
const floorX = (xb: number, y: number) => VP.x + ((xb - VP.x) * (y - VP.y)) / (1140 - VP.y);
const FLOOR_SEAMS = Array.from({ length: 23 }, (_, i) => -1300 + i * 200)
  .map((xb) => `M${floorX(xb, FLOOR_TOP).toFixed(1)} ${FLOOR_TOP} L${xb} 1140`)
  .join(' ');
const FLOOR_ROWS = [830, 870, 926, 1000, 1090].map((y) => `M-60 ${y} H1980`).join(' ');
const STARS = Array.from({ length: 12 }, () => ({ x: -110 + rnd() * 220, y: -170 + rnd() * 220, r: 1.5 + rnd() * 2 }));
const SPARKS = [
  'M0 0 L-30 -24 L-44 -8 L-80 -40 L-96 -20 L-130 -52',
  'M0 0 L26 -30 L44 -14 L70 -56 L96 -40 L118 -74',
  'M0 0 L-16 -40 L4 -54 L-10 -96',
  'M0 0 L40 6 L58 -10 L96 4 L120 -14',
  'M0 0 L-44 10 L-60 -6 L-100 12',
  'M0 0 L18 -44 L-2 -62 L20 -104 L4 -126',
];
const SPARK_GROUPS = [SPARKS.filter((_, i) => i % 2 === 0), SPARKS.filter((_, i) => i % 2 === 1)];
const COIL_RINGS = Array.from({ length: 16 }, (_, i) => -96 - i * 17);
const BUBBLE_SETS = [
  { x: 450, y: 724, w: 22, c: '#c9ffb8' },
  { x: 618, y: 676, w: 16, c: '#f0c8ff' },
  { x: 790, y: 680, w: 10, c: '#c8fbff' },
  { x: 1290, y: 700, w: 34, c: '#ffd6f2' },
].map((b) => ({
  ...b,
  dots: Array.from({ length: 5 }, () => ({ x: (rnd() - 0.5) * b.w * 2, y: -rnd() * 30, r: 3 + rnd() * 5 })),
}));
const RIVETS = Array.from({ length: 9 }, (_, i) => -128 + i * 32);
const GAUGE_TICKS = [-120, -80, -40, 0, 40, 80, 120];
</script>

<template>
  <g>
    <defs>
      <pattern id="lab-tiles" width="120" height="60" patternUnits="userSpaceOnUse">
        <path d="M0 0.5 H120 M0 30.5 H120 M0.5 0 V30 M60.5 30 V60" stroke="#0a2a32" stroke-width="3" fill="none" />
        <path d="M4 4 H56 M64 34 H116" stroke="#2f6c78" stroke-width="2" opacity="0.5" />
      </pattern>
      <linearGradient id="lab-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a3f52" />
        <stop offset="100%" stop-color="#121c2c" />
      </linearGradient>
      <linearGradient id="lab-night" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1b1f5a" />
        <stop offset="100%" stop-color="#4a3a8a" />
      </linearGradient>
      <linearGradient id="lab-metal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#c6d4e0" />
        <stop offset="50%" stop-color="#7d8ea6" />
        <stop offset="100%" stop-color="#465570" />
      </linearGradient>
      <linearGradient id="lab-copper" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffc88a" />
        <stop offset="35%" stop-color="#e0843e" />
        <stop offset="100%" stop-color="#8a3e1c" />
      </linearGradient>
      <linearGradient id="lab-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9a5a3a" />
        <stop offset="100%" stop-color="#5e3022" />
      </linearGradient>
      <linearGradient id="lab-paper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3f7fd6" />
        <stop offset="100%" stop-color="#2a5aa8" />
      </linearGradient>
      <linearGradient id="lab-robot" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffe08a" />
        <stop offset="100%" stop-color="#f2a33a" />
      </linearGradient>
      <radialGradient id="lab-pool-green">
        <stop offset="0%" stop-color="#7dff6a" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#7dff6a" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="lab-pool-purple">
        <stop offset="0%" stop-color="#d06bff" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#d06bff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="lab-pool-cyan">
        <stop offset="0%" stop-color="#4ff0ff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#4ff0ff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="lab-pool-orange">
        <stop offset="0%" stop-color="#ffb04a" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffb04a" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="lab-halo-green">
        <stop offset="0%" stop-color="#7dff6a" stop-opacity="0.55" />
        <stop offset="45%" stop-color="#7dff6a" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#7dff6a" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="lab-halo-purple">
        <stop offset="0%" stop-color="#c46bff" stop-opacity="0.55" />
        <stop offset="45%" stop-color="#c46bff" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#c46bff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="lab-halo-cyan">
        <stop offset="0%" stop-color="#4ff0ff" stop-opacity="0.55" />
        <stop offset="45%" stop-color="#4ff0ff" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#4ff0ff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="lab-halo-pink">
        <stop offset="0%" stop-color="#ff4fa8" stop-opacity="0.55" />
        <stop offset="45%" stop-color="#ff4fa8" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#ff4fa8" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="lab-wall-light">
        <stop offset="0%" stop-color="#3a8a90" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#3a8a90" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="870" fill="url(#lab-tiles)" opacity="0.8" />
    <ellipse cx="960" cy="420" rx="760" ry="420" fill="url(#lab-wall-light)" />
    <path d="M-60 40 H1980" stroke="#1b1033" stroke-width="40" />
    <path d="M-60 40 H1980" stroke="#3a5a6a" stroke-width="28" />
    <path d="M-60 32 H1980" stroke="#7c9ab0" stroke-width="4" opacity="0.7" />
    <path d="M300 54 V0 M820 54 V0 M1300 54 V0" stroke="#1b1033" stroke-width="10" />

    <g transform="translate(270 330)">
      <path d="M-140 180 V-70 A140 140 0 0 1 140 -70 V180 Z" fill="#1b1033" />
      <path d="M-124 170 V-64 A124 124 0 0 1 124 -64 V170 Z" fill="url(#lab-night)" />
      <circle v-for="(s, i) in STARS" :key="`st${i}`" :cx="s.x" :cy="s.y" :r="s.r" fill="#fff6c8" opacity="0.85" />
      <circle cx="54" cy="-80" r="40" fill="#fff3c0" stroke="#1b1033" stroke-width="4" />
      <circle cx="40" cy="-90" r="8" fill="#e8d88a" />
      <circle cx="68" cy="-62" r="6" fill="#e8d88a" />
      <path d="M30 -104 Q42 -116 58 -116" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-120 140 Q-80 110 -40 130 Q0 100 40 126 Q80 104 120 128 V170 H-120 Z" fill="#141640" />
      <path d="M-124 170 V-64 A124 124 0 0 1 124 -64 V170 Z" fill="#dff4ff" class="lab-flash" />
      <path d="M-60 -150 L-40 -90 L-62 -84 L-30 -10" stroke="#fff" stroke-width="6" fill="none" stroke-linejoin="round" class="lab-flash" />
      <path d="M0 -190 V170 M-124 40 H124" stroke="#1b1033" stroke-width="14" />
      <path d="M0 -190 V170 M-124 40 H124" stroke="#4a6070" stroke-width="7" />
      <path d="M-140 180 V-70 A140 140 0 0 1 140 -70 V180" stroke="#4a6070" stroke-width="8" fill="none" />
      <rect x="-164" y="176" width="328" height="24" rx="6" fill="#3a5a6a" stroke="#1b1033" stroke-width="5" />
      <path d="M-156 182 H156" stroke="#8aaabb" stroke-width="4" stroke-linecap="round" />
    </g>

    <g transform="translate(1260 420) rotate(2)">
      <rect x="-150" y="-110" width="300" height="200" fill="url(#lab-paper)" stroke="#1b1033" stroke-width="4" opacity="0.85" />
      <g stroke="#cfe6ff" stroke-width="3" fill="none" opacity="0.75">
        <path d="M-150 -70 H150 M-150 -30 H150 M-150 10 H150 M-150 50 H150 M-110 -110 V90 M-60 -110 V90 M-10 -110 V90 M40 -110 V90 M90 -110 V90" stroke-width="1.5" opacity="0.4" />
        <rect x="-110" y="-70" width="70" height="90" rx="10" />
        <circle cx="-75" cy="-38" r="12" />
        <path d="M-90 -6 H-60 M-75 -70 V-90 M-110 -20 H-128 M-40 -20 H-22 M-96 20 V44 M-54 20 V44" />
        <circle cx="70" cy="-10" r="44" />
        <circle cx="70" cy="-10" r="18" />
        <path d="M70 -54 V-66 M70 34 V46 M26 -10 H14 M114 -10 H126 M39 -41 L31 -49 M101 21 L109 29 M101 -41 L109 -49 M39 21 L31 29" />
        <path d="M-20 70 H120 M-20 64 V76 M120 64 V76" />
      </g>
      <circle cx="-136" cy="-96" r="7" fill="#ff4f6a" stroke="#1b1033" stroke-width="3" />
      <circle cx="136" cy="-96" r="7" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
    </g>
    <g transform="translate(990 460) rotate(-6)">
      <rect x="-70" y="-56" width="140" height="112" fill="url(#lab-paper)" stroke="#1b1033" stroke-width="4" opacity="0.7" />
      <g stroke="#cfe6ff" stroke-width="3" fill="none" opacity="0.6">
        <path d="M-40 30 L-10 -30 L20 30 Z M-50 30 H50" />
        <circle cx="30" cy="-20" r="16" />
      </g>
      <circle cx="0" cy="-48" r="6" fill="#2ec9b0" stroke="#1b1033" stroke-width="3" />
    </g>

    <g>
      <g fill="url(#lab-wood)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
        <rect x="420" y="430" width="320" height="18" rx="4" />
        <rect x="420" y="580" width="320" height="18" rx="4" />
      </g>
      <path d="M428 436 H730 M428 586 H730" stroke="#c48a62" stroke-width="3" stroke-linecap="round" />
      <path d="M450 448 L450 476 L476 448 M710 448 L710 476 L684 448 M450 598 L450 626 L476 598 M710 598 L710 626 L684 598" stroke="#1b1033" stroke-width="5" fill="none" stroke-linejoin="round" />
      <g class="lab-glow-pulse">
        <circle cx="470" cy="400" r="62" fill="url(#lab-halo-green)" />
        <circle cx="568" cy="398" r="64" fill="url(#lab-halo-purple)" />
        <circle cx="490" cy="540" r="59" fill="url(#lab-halo-cyan)" />
        <circle cx="690" cy="548" r="54" fill="url(#lab-halo-pink)" />
      </g>
      <g transform="translate(470 430)">
        <path d="M-10 -78 V-42 L-38 0 H38 L10 -42 V-78 Z" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-23 -22 L-36 -2 H36 L23 -22 Z" fill="#7dff6a" />
        <path d="M-23 -22 H23" stroke="#d6ffc8" stroke-width="3" />
        <path d="M-14 -80 H14" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
        <path d="M-4 -70 V-46 M-26 -12 L-18 -24" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.8" />
      </g>
      <g transform="translate(568 430)">
        <rect x="-8" y="-92" width="16" height="40" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="4" />
        <circle cx="0" cy="-30" r="30" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="4" />
        <path d="M-29 -36 A30 30 0 1 0 29 -36 Z" fill="#c46bff" />
        <path d="M-29 -36 H29" stroke="#f0d0ff" stroke-width="3" />
        <path d="M-18 -46 Q-12 -54 -4 -56" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cx="10" cy="-18" r="4" fill="#f0d0ff" />
        <path d="M-10 -96 H10" stroke="#e05a3a" stroke-width="10" stroke-linecap="round" />
      </g>
      <g transform="translate(660 430)">
        <rect x="-40" y="-36" width="80" height="12" rx="3" fill="#7d8ea6" stroke="#1b1033" stroke-width="3" />
        <g v-for="(t, i) in [{ x: -24, c: '#4ff0ff', h: 30 }, { x: 0, c: '#ff4fa8', h: 40 }, { x: 24, c: '#ffd23f', h: 22 }]" :key="`tt${i}`">
          <rect :x="t.x - 7" y="-76" width="14" height="74" rx="7" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="3" />
          <rect :x="t.x - 5" :y="-4 - t.h" width="10" :height="t.h" rx="5" :fill="t.c" />
        </g>
        <path d="M-40 -2 H40" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
      </g>
      <g transform="translate(490 580)">
        <rect x="-20" y="-100" width="40" height="100" rx="6" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="4" />
        <rect x="-16" y="-64" width="32" height="60" rx="4" fill="#4ff0ff" />
        <path d="M-16 -64 H16" stroke="#d0fcff" stroke-width="3" />
        <path d="M20 -90 h-8 M20 -70 h-8 M20 -50 h-8 M20 -30 h-8" stroke="#1b1033" stroke-width="2.5" />
        <path d="M-10 -92 V-70" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      </g>
      <g transform="translate(590 580)">
        <rect x="-36" y="-70" width="72" height="70" rx="14" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="4" />
        <rect x="-32" y="-44" width="64" height="40" rx="10" fill="#ff9a3a" />
        <rect x="-40" y="-82" width="80" height="16" rx="4" fill="#7d8ea6" stroke="#1b1033" stroke-width="4" />
        <circle cx="-10" cy="-24" r="6" fill="#ffd8a0" />
        <circle cx="10" cy="-30" r="4" fill="#ffd8a0" />
        <path d="M-26 -60 V-46" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      </g>
      <g transform="translate(690 580)">
        <rect x="-6" y="-74" width="12" height="30" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="3.5" />
        <circle cx="0" cy="-24" r="24" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="4" />
        <path d="M-23 -28 A24 24 0 1 0 23 -28 Z" fill="#ff4fa8" />
        <path d="M-14 -36 Q-8 -42 0 -44" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <path :d="`M-60 ${FLOOR_TOP} H1980 V1140 H-60 Z`" fill="url(#lab-floor)" />
    <path :d="FLOOR_SEAMS + ' ' + FLOOR_ROWS" stroke="#4a6680" stroke-width="3" opacity="0.4" />
    <rect x="-60" :y="FLOOR_TOP - 18" width="2040" height="22" fill="#1e3a44" stroke="#1b1033" stroke-width="4" />
    <path :d="`M-60 ${FLOOR_TOP - 12} H1980`" stroke="#4f8090" stroke-width="3" opacity="0.6" />

    <ellipse cx="160" cy="930" rx="230" ry="60" fill="url(#lab-pool-cyan)" />
    <ellipse cx="620" cy="960" rx="300" ry="70" fill="url(#lab-pool-green)" />
    <ellipse cx="1290" cy="950" rx="240" ry="60" fill="url(#lab-pool-purple)" />
    <ellipse cx="1650" cy="900" rx="220" ry="50" fill="url(#lab-pool-orange)" />

    <g transform="translate(1650 880)">
      <ellipse cx="0" cy="6" rx="200" ry="20" fill="#05080f" opacity="0.4" />
      <path d="M-26 -470 V-900" stroke="#1b1033" stroke-width="54" />
      <path d="M-26 -470 V-900" stroke="url(#lab-copper)" stroke-width="40" />
      <path d="M-40 -480 V-860" stroke="#ffd8a8" stroke-width="5" opacity="0.7" />
      <rect x="-56" y="-640" width="60" height="20" rx="4" fill="#b8642c" stroke="#1b1033" stroke-width="4" />
      <path d="M-150 -360 Q-150 -470 0 -470 Q150 -470 150 -360 Z" fill="url(#lab-copper)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel-s)" />
      <rect x="-150" y="-370" width="300" height="370" rx="16" fill="url(#lab-copper)" stroke="#1b1033" stroke-width="6" filter="url(#cel)" />
      <path d="M-150 -300 H150 M-150 -120 H150" stroke="#1b1033" stroke-width="4" />
      <path d="M-150 -296 H150 M-150 -116 H150" stroke="#ffd0a0" stroke-width="3" opacity="0.6" />
      <g fill="#ffd8a8" stroke="#6a2a10" stroke-width="2">
        <circle v-for="x in RIVETS" :key="`rv1${x}`" :cx="x + 16" cy="-310" r="4" />
        <circle v-for="x in RIVETS" :key="`rv2${x}`" :cx="x + 16" cy="-130" r="4" />
      </g>
      <path d="M-120 -350 Q-130 -200 -120 -40" stroke="#ffe2c0" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.6" />
      <rect x="-60" y="-100" width="120" height="80" rx="10" fill="#3a1a12" stroke="#1b1033" stroke-width="5" />
      <path d="M-44 -80 H44 M-44 -60 H44 M-44 -40 H44" stroke="#ffb04a" stroke-width="7" stroke-linecap="round" class="glow" />
      <g v-for="(gz, i) in [{ x: -60, y: -220, r: 40 }, { x: 70, y: -210, r: 32 }]" :key="`gz${i}`" :transform="`translate(${gz.x} ${gz.y})`">
        <circle :r="gz.r + 6" fill="#c6d4e0" stroke="#1b1033" stroke-width="5" />
        <circle :r="gz.r - 2" fill="#fffaf0" stroke="#7d8ea6" stroke-width="2" />
        <path :d="`M${-gz.r * 0.62} ${gz.r * 0.36} A${gz.r * 0.72} ${gz.r * 0.72} 0 0 1 ${gz.r * 0.62} ${gz.r * 0.36}`" stroke="#ff4f6a" stroke-width="5" fill="none" stroke-dasharray="0 90 40" />
        <path v-for="a in GAUGE_TICKS" :key="a" :d="`M0 ${-gz.r + 6} v8`" :transform="`rotate(${a})`" stroke="#1b1033" stroke-width="3" />
        <g class="lab-needle" :style="{ animationDelay: `-${i * 0.7}s` }">
          <path :d="`M0 4 L0 ${-gz.r + 10}`" stroke="#e0303a" stroke-width="4" stroke-linecap="round" />
        </g>
        <circle r="5" fill="#1b1033" />
        <path :d="`M${-gz.r * 0.6} ${-gz.r * 0.5} Q${-gz.r * 0.3} ${-gz.r * 0.8} 0 ${-gz.r * 0.82}`" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
      </g>
      <path d="M150 -300 H220 V-340" stroke="#1b1033" stroke-width="30" fill="none" stroke-linejoin="round" />
      <path d="M150 -300 H220 V-340" stroke="url(#lab-copper)" stroke-width="18" fill="none" stroke-linejoin="round" />
      <path d="M200 -350 H240" stroke="#1b1033" stroke-width="16" stroke-linecap="round" />
      <circle v-for="i in [0, 1, 2]" :key="`stm${i}`" cx="220" cy="-370" r="18" fill="#dff4ff" opacity="0.5" class="smoke" :style="{ animationDelay: `-${i * 2}s` }" />
      <g transform="translate(150 -180)">
        <circle r="30" fill="none" stroke="#1b1033" stroke-width="14" />
        <circle r="30" fill="none" stroke="#e0303a" stroke-width="8" />
        <path d="M-30 0 H30 M0 -30 V30" stroke="#1b1033" stroke-width="7" />
        <path d="M-30 0 H30 M0 -30 V30" stroke="#e0303a" stroke-width="3" />
        <circle r="8" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
      </g>
    </g>
    <path d="M1500 620 H1290 V720" stroke="#1b1033" stroke-width="34" fill="none" stroke-linejoin="round" />
    <path d="M1500 620 H1290 V720" stroke="url(#lab-copper)" stroke-width="22" fill="none" stroke-linejoin="round" />
    <path d="M1490 613 H1298 V700" stroke="#ffd8a8" stroke-width="4" fill="none" opacity="0.6" />
    <rect x="1376" y="604" width="18" height="32" rx="3" fill="#b8642c" stroke="#1b1033" stroke-width="4" />

    <g transform="translate(1290 880)">
      <ellipse cx="0" cy="40" rx="140" ry="14" fill="#05080f" opacity="0.4" />
      <rect x="-110" y="-40" width="220" height="22" rx="5" fill="url(#lab-metal)" stroke="#1b1033" stroke-width="5" />
      <path d="M-96 -18 V30 M96 -18 V30" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
      <path d="M-96 -18 V30 M96 -18 V30" stroke="#9aaabb" stroke-width="5" stroke-linecap="round" />
      <circle cx="-96" cy="34" r="10" fill="#2a2a3a" stroke="#1b1033" stroke-width="4" />
      <circle cx="96" cy="34" r="10" fill="#2a2a3a" stroke="#1b1033" stroke-width="4" />
      <circle cx="0" cy="-130" r="148" fill="url(#lab-halo-pink)" class="glow" />
      <path d="M-70 -44 V-170 Q-70 -186 -54 -186 H54 Q70 -186 70 -170 V-44 Z" fill="#c46bff" fill-opacity="0.22" stroke="#1b1033" stroke-width="5" />
      <path d="M-66 -150 H66 V-46 H-66 Z" fill="#9b5cff" opacity="0.28" />
      <path d="M-50 -100 Q-58 -136 -30 -146 Q-20 -166 6 -156 Q30 -170 46 -146 Q64 -132 54 -106 Q60 -80 36 -76 Q0 -66 -30 -76 Q-56 -80 -50 -100 Z" fill="#ffa8dc" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-34 -132 Q-24 -124 -30 -112 M-6 -150 Q2 -138 -6 -128 M22 -144 Q30 -132 24 -122 M40 -120 Q30 -112 40 -100" stroke="#e070b0" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <path d="M-38 -134 Q-30 -148 -14 -150" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="-14" cy="-102" r="6" fill="#1b1033" />
      <circle cx="16" cy="-102" r="6" fill="#1b1033" />
      <circle cx="-16" cy="-104" r="2" fill="#fff" />
      <circle cx="14" cy="-104" r="2" fill="#fff" />
      <path d="M-8 -90 Q1 -82 10 -90" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
      <ellipse cx="-28" cy="-92" rx="6" ry="3.5" fill="#ff4f8a" opacity="0.6" />
      <ellipse cx="30" cy="-92" rx="6" ry="3.5" fill="#ff4f8a" opacity="0.6" />
      <path d="M-56 -176 V-60" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.55" />
      <path d="M-40 -176 V-150" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.45" />
      <rect x="-80" y="-206" width="160" height="26" rx="6" fill="url(#lab-metal)" stroke="#1b1033" stroke-width="5" />
      <g fill="#ffd23f" stroke="#1b1033" stroke-width="2.5">
        <circle cx="-60" cy="-193" r="4" />
        <circle cx="-20" cy="-193" r="4" />
        <circle cx="20" cy="-193" r="4" />
        <circle cx="60" cy="-193" r="4" />
      </g>
    </g>

    <g transform="translate(150 900)">
      <ellipse cx="0" cy="6" rx="100" ry="16" fill="#05080f" opacity="0.45" />
      <rect x="-76" y="-90" width="152" height="90" rx="10" fill="url(#lab-metal)" stroke="#1b1033" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-76 -60 H76" stroke="#1b1033" stroke-width="4" />
      <circle cx="-44" cy="-30" r="9" fill="#7dff6a" stroke="#1b1033" stroke-width="3" class="blinker" />
      <circle cx="-14" cy="-30" r="9" fill="#ff4f6a" stroke="#1b1033" stroke-width="3" />
      <rect x="14" y="-40" width="44" height="20" rx="4" fill="#1b2a3a" stroke="#1b1033" stroke-width="3" />
      <path d="M20 -30 L30 -36 L40 -26 L52 -34" stroke="#4ff0ff" stroke-width="3" fill="none" />
      <path d="M0 -96 V-380" stroke="#1b1033" stroke-width="60" />
      <path d="M0 -96 V-380" stroke="#e8e0d0" stroke-width="48" />
      <path v-for="y in COIL_RINGS" :key="y" :d="`M-24 ${y} Q0 ${y + 6} 24 ${y}`" stroke="#c4682a" stroke-width="9" fill="none" />
      <path d="M-14 -100 V-376" stroke="#fff" stroke-width="6" opacity="0.5" />
      <path d="M16 -100 V-376" stroke="#1b1033" stroke-width="6" opacity="0.25" />
      <path d="M-8 -380 V-430" stroke="#1b1033" stroke-width="14" />
      <path d="M-8 -380 V-430 M8 -380 V-430" stroke="#9aaabb" stroke-width="6" />
      <ellipse cx="0" cy="-440" rx="96" ry="34" fill="url(#lab-metal)" stroke="#1b1033" stroke-width="6" />
      <ellipse cx="0" cy="-446" rx="58" ry="14" fill="#465570" opacity="0.5" />
      <path d="M-74 -452 Q-50 -470 -10 -474" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
      <circle cx="0" cy="-478" r="94" fill="url(#lab-halo-cyan)" class="glow" />
      <circle cx="0" cy="-478" r="16" fill="#e0fdff" stroke="#1b1033" stroke-width="4" />
      <g v-for="(grp, gi) in SPARK_GROUPS" :key="`sp${gi}`" :class="`lab-spark lab-spark-${gi}`" transform="translate(0 -478)">
        <path v-for="(d, i) in grp" :key="`sh${i}`" :d="d" stroke="#4ff0ff" stroke-width="12" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.35" />
        <path v-for="(d, i) in grp" :key="`sc${i}`" :d="d" stroke="#f0ffff" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      </g>
    </g>
    <path d="M230 870 Q300 940 420 930 Q520 920 560 980" stroke="#1b1033" stroke-width="14" fill="none" stroke-linecap="round" />
    <path d="M230 870 Q300 940 420 930 Q520 920 560 980" stroke="#e05a3a" stroke-width="7" fill="none" stroke-linecap="round" />

    <g>
      <ellipse cx="620" cy="980" rx="300" ry="20" fill="#05080f" opacity="0.4" />
      <rect x="340" y="830" width="560" height="140" rx="6" fill="url(#lab-wood)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
      <g fill="#7a4228" stroke="#1b1033" stroke-width="4">
        <rect x="362" y="852" width="160" height="50" rx="5" />
        <rect x="540" y="852" width="160" height="50" rx="5" />
        <rect x="718" y="852" width="160" height="50" rx="5" />
        <rect x="362" y="910" width="160" height="46" rx="5" />
        <rect x="718" y="910" width="160" height="46" rx="5" />
      </g>
      <path d="M422 877 H462 M600 877 H640 M778 877 H818 M422 933 H462 M778 933 H818" stroke="#ffd23f" stroke-width="6" stroke-linecap="round" />
      <rect x="324" y="796" width="592" height="38" rx="8" fill="#2a3a4a" stroke="#1b1033" stroke-width="6" />
      <path d="M336 806 H904" stroke="#5a7a90" stroke-width="5" stroke-linecap="round" />

      <circle cx="450" cy="740" r="94" fill="url(#lab-halo-green)" class="glow" />
      <g transform="translate(450 796)">
        <path d="M-40 -96 H40 V-6 Q40 0 34 0 H-34 Q-40 0 -40 -6 Z" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M-36 -70 H36 V-6 Q36 -3 32 -3 H-32 Q-36 -3 -36 -6 Z" fill="#5be84a" />
        <path d="M-36 -70 H36" stroke="#d6ffc8" stroke-width="4" />
        <path d="M-48 -96 H48" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
        <path d="M40 -84 h-10 M40 -64 h-10 M40 -44 h-10 M40 -24 h-10" stroke="#1b1033" stroke-width="3" />
        <path d="M-28 -88 V-20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.75" />
        <circle cx="10" cy="-30" r="6" fill="#c9ffb8" />
        <circle cx="-8" cy="-48" r="4" fill="#c9ffb8" />
      </g>
      <path d="M470 700 Q480 620 560 620 Q610 620 610 650" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M470 700 Q480 620 560 620 Q610 620 610 650" stroke="#d6f4ff" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M476 690 Q484 632 556 628" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />

      <circle cx="618" cy="700" r="108" fill="url(#lab-halo-purple)" class="glow" />
      <g transform="translate(618 796)">
        <path d="M-40 0 L-30 -50 M40 0 L30 -50 M-36 -50 H36" stroke="#1b1033" stroke-width="9" fill="none" stroke-linecap="round" />
        <path d="M-40 0 L-30 -50 M40 0 L30 -50 M-36 -50 H36" stroke="#9aaabb" stroke-width="4" fill="none" stroke-linecap="round" />
        <rect x="-10" y="-30" width="20" height="30" fill="#465570" stroke="#1b1033" stroke-width="3" />
        <path d="M-8 -34 Q-12 -50 0 -62 Q12 -50 8 -34 Z" fill="#4fa8ff" stroke="#1b1033" stroke-width="3" class="fire" />
        <path d="M-10 -150 V-108 M10 -150 V-108" stroke="#1b1033" stroke-width="4" />
        <circle cx="0" cy="-92" r="42" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="5" />
        <path d="M-40 -104 A42 42 0 1 0 40 -104 Z" fill="#b04aff" />
        <path d="M-40 -104 H40" stroke="#f0c8ff" stroke-width="4" />
        <path d="M-26 -114 Q-18 -126 -6 -130" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle cx="16" cy="-74" r="6" fill="#f0c8ff" />
        <path d="M-12 -152 H12" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
      </g>

      <circle cx="790" cy="710" r="81" fill="url(#lab-halo-cyan)" class="glow" />
      <g transform="translate(790 796)">
        <path d="M-30 0 H30" stroke="#1b1033" stroke-width="10" stroke-linecap="round" />
        <rect x="-18" y="-140" width="36" height="136" rx="6" fill="#bfe8ee" fill-opacity="0.25" stroke="#1b1033" stroke-width="5" />
        <rect x="-14" y="-110" width="28" height="104" rx="4" fill="#2fd6f0" />
        <path d="M-14 -110 H14" stroke="#d0fcff" stroke-width="4" />
        <path d="M18 -120 h-8 M18 -96 h-8 M18 -72 h-8 M18 -48 h-8 M18 -24 h-8" stroke="#1b1033" stroke-width="3" />
        <path d="M-8 -132 V-30" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.75" />
      </g>
    </g>

    <g v-for="(b, i) in BUBBLE_SETS" :key="`bb${i}`" :transform="`translate(${b.x} ${b.y})`">
      <g v-for="h in [0, 1]" :key="`bh${h}`" class="lab-bubbles" :style="{ animationDelay: `-${h * 1.1 + i * 0.4}s` }">
        <circle v-for="(d, j) in b.dots" :key="j" :cx="d.x" :cy="d.y" :r="d.r" fill="none" :stroke="b.c" stroke-width="3" />
      </g>
    </g>

    <g transform="translate(1470 1010)">
      <ellipse cx="0" cy="6" rx="90" ry="14" fill="#05080f" opacity="0.45" />
      <rect x="-60" y="-34" width="120" height="34" rx="16" fill="#2a3a4a" stroke="#1b1033" stroke-width="5" />
      <circle v-for="x in [-36, 0, 36]" :key="`wh${x}`" :cx="x" cy="-17" r="9" fill="#7d8ea6" stroke="#1b1033" stroke-width="3" />
      <path d="M-56 -110 Q-96 -90 -100 -50" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M-56 -110 Q-96 -90 -100 -50" stroke="#7d8ea6" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M56 -110 Q96 -140 100 -180" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M56 -110 Q96 -140 100 -180" stroke="#7d8ea6" stroke-width="8" fill="none" stroke-linecap="round" />
      <circle cx="-100" cy="-44" r="14" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" />
      <circle cx="100" cy="-186" r="14" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" />
      <rect x="-60" y="-140" width="120" height="110" rx="20" fill="url(#lab-robot)" stroke="#1b1033" stroke-width="6" filter="url(#cel-s)" />
      <rect x="-34" y="-112" width="68" height="44" rx="8" fill="#1b2a3a" stroke="#1b1033" stroke-width="4" />
      <path d="M-24 -90 Q-12 -104 0 -90 Q12 -76 24 -90" stroke="#ff4fa8" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="-30" cy="-54" r="7" fill="#7dff6a" stroke="#1b1033" stroke-width="3" />
      <circle cx="-8" cy="-54" r="7" fill="#4ff0ff" stroke="#1b1033" stroke-width="3" />
      <path d="M-48 -128 Q-30 -136 -10 -134" stroke="#fff6c8" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-10 -140 V-160 M10 -140 V-160" stroke="#1b1033" stroke-width="8" />
      <rect x="-56" y="-246" width="112" height="90" rx="30" fill="url(#lab-robot)" stroke="#1b1033" stroke-width="6" />
      <rect x="-44" y="-230" width="88" height="54" rx="22" fill="#1b2a3a" stroke="#1b1033" stroke-width="4" />
      <circle cx="-18" cy="-204" r="13" fill="#4ff0ff" />
      <circle cx="18" cy="-204" r="13" fill="#4ff0ff" />
      <circle cx="-22" cy="-209" r="4" fill="#fff" />
      <circle cx="14" cy="-209" r="4" fill="#fff" />
      <path d="M-10 -186 Q0 -180 10 -186" stroke="#4ff0ff" stroke-width="3" fill="none" stroke-linecap="round" />
      <ellipse cx="-40" cy="-176" rx="7" ry="4" fill="#ff4f8a" opacity="0.6" />
      <ellipse cx="40" cy="-176" rx="7" ry="4" fill="#ff4f8a" opacity="0.6" />
      <path d="M-42 -240 Q-24 -250 0 -248" stroke="#fff6c8" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M0 -246 V-280" stroke="#1b1033" stroke-width="5" />
      <circle cx="0" cy="-286" r="10" fill="#ff4f6a" stroke="#1b1033" stroke-width="4" class="blinker" />
      <rect x="-66" y="-218" width="12" height="30" rx="5" fill="#7d8ea6" stroke="#1b1033" stroke-width="3" />
      <rect x="54" y="-218" width="12" height="30" rx="5" fill="#7d8ea6" stroke="#1b1033" stroke-width="3" />
    </g>

    <g fill="#081419" stroke="#02070a" stroke-width="5" stroke-linejoin="round">
      <rect x="-60" y="990" width="250" height="160" rx="6" />
      <rect x="40" y="920" width="160" height="80" rx="6" />
      <path d="M1660 1150 Q1650 1060 1800 980 V880 H1880 V980 Q2030 1060 2020 1150 Z" />
      <rect x="1784" y="862" width="112" height="26" rx="8" />
    </g>
    <path d="M-40 1010 H170 M60 940 H180" stroke="#1d3a44" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M1700 1150 Q1700 1080 1730 1050 Q1840 1070 1950 1050 Q1990 1090 1990 1150 Z" fill="#2fd6f0" opacity="0.35" />
    <path d="M1730 1050 Q1840 1070 1950 1050" stroke="#8af4ff" stroke-width="4" fill="none" opacity="0.5" />
    <path d="M1812 900 V990 Q1740 1030 1716 1090" stroke="#1d3a44" stroke-width="6" fill="none" stroke-linecap="round" />
  </g>
</template>

<style scoped>
.lab-flash {
  opacity: 0;
  animation: lab-flash 9s linear infinite;
}

.lab-spark {
  opacity: 0;
  animation: lab-spark 0.9s steps(1) infinite;
}

.lab-spark-1 {
  animation-delay: -0.45s;
}

.lab-glow-pulse {
  animation: lab-pulse 2.6s ease-in-out infinite alternate;
}

.lab-needle {
  animation: lab-needle 1.8s ease-in-out infinite alternate;
}

.lab-bubbles {
  animation: lab-bubbles 2.2s ease-in infinite;
}

@keyframes lab-flash {
  0%,
  86%,
  89%,
  92%,
  100% {
    opacity: 0;
  }
  87% {
    opacity: 0.85;
  }
  90.5% {
    opacity: 0.6;
  }
}

@keyframes lab-spark {
  0% {
    opacity: 1;
  }
  30% {
    opacity: 0;
  }
  55% {
    opacity: 0.8;
  }
  70% {
    opacity: 0;
  }
}

@keyframes lab-pulse {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}

@keyframes lab-needle {
  from {
    rotate: -50deg;
  }
  to {
    rotate: 35deg;
  }
}

@keyframes lab-bubbles {
  from {
    translate: 0 0;
    opacity: 1;
  }
  to {
    translate: 0 -80px;
    opacity: 0;
  }
}
</style>
