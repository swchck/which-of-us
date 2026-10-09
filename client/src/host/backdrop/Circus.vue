<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(305);
const CONFETTI_COLORS = ['#ff4f8b', '#ffd23f', '#22d3ee', '#2ed47a', '#a66bff', '#ff7a2f'];
const SPARKLES = Array.from({ length: 28 }, () => ({ x: rnd() * 1920, y: 250 + rnd() * 240, k: 0.5 + rnd() * 0.7 }));
const SPARKLE_GROUPS = [0, 1].map((g) => SPARKLES.filter((_, i) => i % 2 === g));
const BIG_TOP = Array.from({ length: 14 }, (_, i) => ({ x: -160 + i * 160, red: i % 2 === 0 }));
const BULBS = [0, 1].map((g) => BIG_TOP.filter((_, i) => i % 2 === g).map((b) => b.x + 80));
// flags hang on a quadratic string (0,250)-(960,370)-(1920,250); three groups flutter out of phase
const BUNTING = [0, 1, 2].map((g) =>
  Array.from({ length: 8 }, (_, j) => {
    const n = j * 3 + g;
    const x = 40 + n * 78;
    const t = x / 1920;
    return { x, y: 250 + 240 * t * (1 - t), c: CONFETTI_COLORS[n % CONFETTI_COLORS.length] };
  }),
);
const CROWD_COLORS = ['#7d5aa6', '#9a5f8e', '#6a62a8', '#a0708a', '#5f6aa0'];
const CROWD = [0, 1, 2].flatMap((row) =>
  Array.from({ length: 34 - row * 2 }, (_, i) => ({
    x: -20 + i * (60 + row * 4) + (row % 2) * 30 + rnd() * 10,
    y: 590 + row * 62 + rnd() * 6,
    r: 17 + row * 2,
    c: CROWD_COLORS[Math.floor(rnd() * CROWD_COLORS.length)],
  })),
);
const DIAMONDS = Array.from({ length: 25 }, (_, i) => -40 + i * 84);
const POLES = [230, 1690];
const JUGGLE = [
  { c: '#ff4f8b', d: 0 },
  { c: '#ffd23f', d: 0.47 },
  { c: '#22d3ee', d: 0.93 },
];
const DOTS = [
  { x: -24, y: -140 },
  { x: 20, y: -112 },
  { x: -18, y: -86 },
  { x: 30, y: -150 },
];
const SAWDUST = Array.from({ length: 18 }, () => ({ x: 120 + rnd() * 1680, y: 900 + rnd() * 140 }));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="circus-red" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7a0f2c" />
        <stop offset="100%" stop-color="#ff3b5c" />
      </linearGradient>
      <linearGradient id="circus-cream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8f7a8a" />
        <stop offset="100%" stop-color="#fff3e0" />
      </linearGradient>
      <linearGradient id="circus-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d42a4a" />
        <stop offset="100%" stop-color="#8a1030" />
      </linearGradient>
      <linearGradient id="circus-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffd9a0" stop-opacity="0" />
        <stop offset="60%" stop-color="#ffd9a0" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#ffd9a0" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="circus-sawdust" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffd08a" />
        <stop offset="100%" stop-color="#d0803e" />
      </radialGradient>
      <linearGradient id="circus-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a1446" />
        <stop offset="100%" stop-color="#1a0824" />
      </linearGradient>
      <pattern id="circus-candy" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
        <rect width="56" height="56" fill="#fff3e0" />
        <rect width="56" height="26" fill="#ff3b5c" />
      </pattern>
      <linearGradient id="circus-pole-shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.35" />
        <stop offset="35%" stop-color="#fff" stop-opacity="0" />
        <stop offset="65%" stop-color="#1b0a33" stop-opacity="0" />
        <stop offset="100%" stop-color="#1b0a33" stop-opacity="0.45" />
      </linearGradient>
      <linearGradient id="circus-suit" x1="0" y1="0" x2="1" y2="0.5">
        <stop offset="0%" stop-color="#5ae6ff" />
        <stop offset="100%" stop-color="#1a9ac0" />
      </linearGradient>
      <linearGradient id="circus-seal" x1="0" y1="0" x2="1" y2="0.5">
        <stop offset="0%" stop-color="#a8bce0" />
        <stop offset="100%" stop-color="#6078a8" />
      </linearGradient>
      <linearGradient id="circus-drum" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6a4ae0" />
        <stop offset="100%" stop-color="#2e1a80" />
      </linearGradient>
    </defs>

    <g v-for="(g, gi) in SPARKLE_GROUPS" :key="`sp${gi}`" class="twinkle" :style="{ animationDelay: `${gi * 1.5}s` }">
      <path v-for="(s, i) in g" :key="i" d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12 Z" :transform="`translate(${s.x} ${s.y}) scale(${s.k})`" fill="#ffe7a0" opacity="0.7" />
    </g>

    <path d="M-60 560 L1980 560 L1980 800 L-60 800 Z" fill="#3a1652" stroke="#5e2f80" stroke-width="3" />
    <g stroke="#5e2f80" stroke-width="3">
      <path d="M-60 620 H1980 M-60 684 H1980 M-60 748 H1980" />
    </g>
    <g v-for="(p, i) in CROWD" :key="`cr${i}`">
      <ellipse :cx="p.x" :cy="p.y + p.r * 1.3" :rx="p.r * 1.3" :ry="p.r * 0.9" :fill="p.c" stroke="#5e2f80" stroke-width="3" />
      <circle :cx="p.x" :cy="p.y" :r="p.r" :fill="p.c" stroke="#5e2f80" stroke-width="3" />
    </g>
    <rect x="-60" y="640" width="2040" height="200" fill="url(#circus-haze)" />

    <path d="M330 200 L120 1000 L540 1000 Z" fill="#fff59b" fill-opacity="0.13" class="circ-spot s1" />
    <path d="M1590 200 L1380 1000 L1800 1000 Z" fill="#9ff3ff" fill-opacity="0.12" class="circ-spot s2" />

    <path d="M-60 790 H1980 V1140 H-60 Z" fill="url(#circus-floor)" />
    <path d="M-60 770 H1980 V850 H-60 Z" fill="url(#circus-wall)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M-60 778 H1980" stroke="#ffd23f" stroke-width="8" />
    <g fill="#ffd23f" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
      <path v-for="x in DIAMONDS" :key="`dm${x}`" :d="`M${x} 796 L${x + 14} 814 L${x} 832 L${x - 14} 814 Z`" />
    </g>

    <g stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path v-for="b in BIG_TOP" :key="`bt${b.x}`" :d="`M960 -500 L${b.x} 180 Q${b.x + 80} 250 ${b.x + 160} 180 Z`" :fill="b.red ? 'url(#circus-red)' : 'url(#circus-cream)'" />
    </g>
    <g stroke="#1b0a33" stroke-width="12" opacity="0.18">
      <path v-for="b in BIG_TOP" :key="`fold${b.x}`" :d="`M960 -500 L${b.x + 150} 196`" />
    </g>
    <path d="M-60 186 Q20 230 100 196 M260 196 Q340 230 420 196 M580 196 Q660 230 740 196 M900 196 Q980 230 1060 196 M1220 196 Q1300 230 1380 196 M1540 196 Q1620 230 1700 196" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.3" />
    <g v-for="(g, gi) in BULBS" :key="`bl${gi}`" class="bulb" :style="{ animationDelay: `-${gi * 0.8}s` }">
      <g v-for="x in g" :key="x" :transform="`translate(${x} 218)`">
        <circle r="14" fill="#ffe14d" opacity="0.35" />
        <circle r="8" fill="#fff6c8" stroke="#1b1033" stroke-width="3" />
      </g>
    </g>

    <path d="M0 250 Q960 370 1920 250" stroke="#1b1033" stroke-width="4" fill="none" />
    <g v-for="(g, gi) in BUNTING" :key="`bg${gi}`" class="circ-flags" :style="{ animationDelay: `-${gi * 0.6}s` }">
      <g v-for="f in g" :key="f.x">
        <path :d="`M${f.x - 26} ${f.y} L${f.x + 26} ${f.y} L${f.x} ${f.y + 54} Z`" :fill="f.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path :d="`M${f.x - 16} ${f.y + 6} L${f.x - 2} ${f.y + 34}`" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.5" />
      </g>
    </g>

    <g v-for="x in POLES" :key="`pole${x}`" filter="url(#cel)">
      <rect :x="x - 26" y="-80" width="52" height="1000" fill="url(#circus-candy)" stroke="#1b1033" stroke-width="5" />
      <rect :x="x - 26" y="-80" width="52" height="1000" fill="url(#circus-pole-shade)" />
      <rect :x="x - 40" y="900" width="80" height="40" rx="8" fill="#ffd23f" stroke="#1b1033" stroke-width="5" />
    </g>

    <ellipse cx="960" cy="1010" rx="1000" ry="170" fill="url(#circus-sawdust)" stroke="#1b1033" stroke-width="5" />
    <path v-for="(d, i) in SAWDUST" :key="`sd${i}`" :d="`M${d.x} ${d.y} l14 -4`" stroke="#b56a30" stroke-width="4" stroke-linecap="round" opacity="0.6" />
    <ellipse cx="960" cy="1010" rx="1000" ry="170" fill="none" stroke="#1b1033" stroke-width="40" />
    <ellipse cx="960" cy="1010" rx="1000" ry="170" fill="none" stroke="#ff3b5c" stroke-width="28" />
    <ellipse cx="960" cy="1010" rx="1000" ry="170" fill="none" stroke="#fffaf0" stroke-width="28" stroke-dasharray="70 70" />
    <ellipse cx="960" cy="1002" rx="1000" ry="170" fill="none" stroke="#fff" stroke-width="5" opacity="0.4" />

    <g transform="translate(450 1000) scale(1.1)">
      <ellipse cx="0" cy="4" rx="90" ry="14" fill="#5a2a10" opacity="0.35" />
      <path d="M-44 -70 L-52 -14 L-14 -14 L-8 -64 Z M44 -70 L52 -14 L14 -14 L8 -64 Z" fill="#1a9ac0" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <ellipse cx="-40" cy="-8" rx="38" ry="15" fill="#ff3b5c" stroke="#1b1033" stroke-width="5" />
      <ellipse cx="40" cy="-8" rx="38" ry="15" fill="#ff3b5c" stroke="#1b1033" stroke-width="5" />
      <path d="M-60 -16 Q-50 -22 -36 -20 M24 -20 Q36 -24 50 -18" stroke="#ffb3c0" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-46 -150 Q-62 -128 -70 -152" stroke="#1b1033" stroke-width="24" fill="none" stroke-linecap="round" />
      <path d="M46 -150 Q62 -128 70 -152" stroke="#1b1033" stroke-width="24" fill="none" stroke-linecap="round" />
      <path d="M-46 -150 Q-62 -128 -70 -152" stroke="#ffd23f" stroke-width="14" fill="none" stroke-linecap="round" />
      <path d="M46 -150 Q62 -128 70 -152" stroke="#ffd23f" stroke-width="14" fill="none" stroke-linecap="round" />
      <path d="M-58 -60 Q-70 -172 0 -180 Q70 -172 58 -60 Q30 -44 0 -60 Q-30 -44 -58 -60 Z" fill="url(#circus-suit)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <circle v-for="(d, i) in DOTS" :key="`cd${i}`" :cx="d.x" :cy="d.y" r="8" :fill="i % 2 ? '#ffd23f' : '#ff4f8b'" stroke="#1b1033" stroke-width="3" />
      <circle cx="-72" cy="-154" r="14" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
      <circle cx="72" cy="-154" r="14" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
      <path d="M-56 -184 Q-48 -160 -28 -176 Q-20 -156 0 -172 Q20 -156 28 -176 Q48 -160 56 -184 Q30 -196 0 -194 Q-30 -196 -56 -184 Z" fill="#fff3a0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <circle cx="-40" cy="-238" r="22" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" />
      <circle cx="40" cy="-238" r="22" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" />
      <circle cx="0" cy="-226" r="40" fill="#fff0e0" stroke="#1b1033" stroke-width="5" />
      <path d="M-26 -250 Q-18 -262 -6 -262" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-20 -208 Q0 -186 20 -208" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
      <path d="M-20 -208 Q0 -186 20 -208" stroke="#ff3b5c" stroke-width="6" fill="none" stroke-linecap="round" />
      <ellipse cx="-26" cy="-214" rx="9" ry="5" fill="#ff8ab0" opacity="0.7" />
      <ellipse cx="26" cy="-214" rx="9" ry="5" fill="#ff8ab0" opacity="0.7" />
      <ellipse cx="-14" cy="-238" rx="5" ry="7" fill="#1b1033" />
      <ellipse cx="14" cy="-238" rx="5" ry="7" fill="#1b1033" />
      <circle cx="-15" cy="-241" r="2" fill="#fff" />
      <circle cx="13" cy="-241" r="2" fill="#fff" />
      <circle cx="0" cy="-222" r="11" fill="#ff3b5c" stroke="#1b1033" stroke-width="3" />
      <circle cx="-3" cy="-226" r="3" fill="#fff" opacity="0.8" />
      <path d="M-26 -260 L4 -330 L28 -258 Z" fill="#a66bff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-14 -270 L2 -310" stroke="#d0b0ff" stroke-width="4" stroke-linecap="round" />
      <circle cx="4" cy="-332" r="10" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
      <circle v-for="b in JUGGLE" :key="b.c" cx="-70" cy="-174" r="17" :fill="b.c" stroke="#1b1033" stroke-width="4" class="circ-juggle" :style="{ animationDelay: `-${b.d}s` }" />
    </g>

    <g transform="translate(1480 1000)">
      <ellipse cx="0" cy="6" rx="130" ry="18" fill="#5a2a10" opacity="0.35" />
      <g filter="url(#cel-s)">
        <path d="M-100 0 V-110 H100 V0 A100 22 0 0 1 -100 0 Z" fill="url(#circus-drum)" stroke="#1b1033" stroke-width="5" />
        <rect x="-100" y="-130" width="200" height="30" fill="#ffd23f" stroke="#1b1033" stroke-width="5" />
        <ellipse cx="0" cy="-130" rx="100" ry="22" fill="#ff3b5c" stroke="#1b1033" stroke-width="5" />
      </g>
      <path d="M0 -90 L9 -68 L32 -68 L14 -54 L20 -32 L0 -45 L-20 -32 L-14 -54 L-32 -68 L-9 -68 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-86 -96 V-10" stroke="#9a86ff" stroke-width="6" stroke-linecap="round" opacity="0.7" />
      <g transform="translate(0 -130)">
        <g class="circ-seal">
          <path d="M-60 -6 Q-90 -150 -10 -186 Q56 -176 56 -110 Q60 -60 76 -6 Z" fill="url(#circus-seal)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
          <ellipse cx="2" cy="-80" rx="28" ry="56" fill="#d4def2" />
          <ellipse cx="66" cy="-80" rx="12" ry="38" transform="rotate(-25 66 -80)" fill="#6078a8" stroke="#1b1033" stroke-width="4" />
          <ellipse cx="-62" cy="-80" rx="12" ry="38" transform="rotate(25 -62 -80)" fill="#6078a8" stroke="#1b1033" stroke-width="4" />
          <path d="M-60 -120 Q-56 -160 -30 -176" stroke="#d4def2" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />
          <circle cx="-8" cy="-212" r="42" fill="url(#circus-seal)" stroke="#1b1033" stroke-width="5" />
          <path d="M-38 -230 Q-30 -248 -14 -250" stroke="#d4def2" stroke-width="6" fill="none" stroke-linecap="round" />
          <ellipse cx="14" cy="-198" rx="24" ry="16" fill="#d4def2" stroke="#1b1033" stroke-width="3" />
          <ellipse cx="30" cy="-206" rx="7" ry="5" fill="#1b1033" />
          <circle cx="-14" cy="-224" r="7" fill="#1b1033" />
          <circle cx="-16" cy="-227" r="2.5" fill="#fff" />
          <ellipse cx="-24" cy="-200" rx="8" ry="4" fill="#ff8ab0" opacity="0.6" />
          <path d="M22 -194 L54 -200 M22 -188 L52 -184" stroke="#1b1033" stroke-width="3" stroke-linecap="round" />
          <g transform="translate(30 -258)">
            <g class="circ-roll">
              <circle cx="0" cy="0" r="30" fill="#ffd23f" stroke="#1b1033" stroke-width="5" />
              <path d="M-30 0 Q0 -18 30 0 M0 -30 Q-14 0 0 30" stroke="#ff4f8b" stroke-width="8" fill="none" />
              <circle cx="0" cy="0" r="30" fill="none" stroke="#1b1033" stroke-width="5" />
            </g>
            <path d="M-18 -14 Q-10 -22 0 -24" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
          </g>
        </g>
      </g>
    </g>

    <g fill="#140824" stroke="#3a2050" stroke-width="5">
      <ellipse cx="60" cy="1120" rx="120" ry="70" />
      <circle cx="70" cy="1010" r="58" />
      <ellipse cx="250" cy="1150" rx="110" ry="60" />
      <circle cx="250" cy="1060" r="50" />
      <ellipse cx="1860" cy="1120" rx="120" ry="70" />
      <circle cx="1850" cy="1010" r="58" />
      <ellipse cx="1680" cy="1150" rx="100" ry="56" />
      <circle cx="1680" cy="1068" r="46" />
    </g>
    <g transform="translate(1755 960) rotate(14)">
      <path d="M0 0 V120" stroke="#140824" stroke-width="10" stroke-linecap="round" />
      <circle cx="0" cy="-30" r="44" fill="#ff9ad0" stroke="#140824" stroke-width="5" />
      <path d="M-26 -50 Q-14 -66 4 -66" stroke="#ffd0ea" stroke-width="6" fill="none" stroke-linecap="round" />
    </g>
  </g>
</template>
