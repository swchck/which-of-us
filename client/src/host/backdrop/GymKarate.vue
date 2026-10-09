<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(1964);
const f1 = (n: number) => n.toFixed(1);
const SHOJI = (() => {
  let d = '';
  for (let x = -60; x <= 1980; x += 80) d += `M${x} 40 V640 `;
  for (let y = 40; y <= 640; y += 100) d += `M-60 ${y} H1980 `;
  return d;
})();
const POSTS = [-40, 480, 1440, 1960];
// tatami are laid in the classic pinwheel, so the mats in each row alternate long and short sides
const TATAMI = (() => {
  const rows = [700, 780, 880, 1010, 1160];
  const out: string[] = [];
  const at = (x: number, y: number) => 960 + (x - 960) * (0.55 + ((y - 700) / 460) * 0.75);
  for (let r = 0; r < rows.length - 1; r++) {
    const y0 = rows[r]!;
    const y1 = rows[r + 1]!;
    const step = r % 2 ? 320 : 480;
    for (let x = -1000 + (r % 2) * 160; x < 2900; x += step) out.push(`M${f1(at(x, y0))} ${y0} L${f1(at(x + step, y0))} ${y0} L${f1(at(x + step, y1))} ${y1} L${f1(at(x, y1))} ${y1} Z`);
  }
  return out.join(' ');
})();
const BELTS = ['#fffaf0', '#ffd23f', '#ff8a2f', '#5fb04a', '#4a7ad8', '#8a5a3a', '#1b1033'].map((c, i) => ({ c, x: 90 + i * 52, d: -i * 0.4 }));
const PETALS = [0, 1, 2].map(() => Array.from({ length: 5 }, () => ({ x: rnd() * 1800, y: rnd() * 400, a: rnd() * 180 })));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="gym-karate-paper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffaf0" />
        <stop offset="100%" stop-color="#f4e4c4" />
      </linearGradient>
      <linearGradient id="gym-karate-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b47640" />
        <stop offset="100%" stop-color="#7a4422" />
      </linearGradient>
      <linearGradient id="gym-karate-mat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d8e08a" />
        <stop offset="100%" stop-color="#a8b85a" />
      </linearGradient>
      <linearGradient id="gym-karate-scroll" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6e0" />
        <stop offset="100%" stop-color="#f0dcb0" />
      </linearGradient>
      <radialGradient id="gym-karate-lamp">
        <stop offset="0%" stop-color="#fff0b0" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fff0b0" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="gym-karate-pad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ff5a5a" />
        <stop offset="100%" stop-color="#b02a3a" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="800" fill="url(#gym-karate-paper)" />
    <path :d="SHOJI" stroke="#c8a47a" stroke-width="6" />
    <rect x="-60" y="-60" width="2040" height="100" fill="url(#gym-karate-wood)" stroke="#1b1033" stroke-width="6" />
    <rect x="-60" y="640" width="2040" height="60" fill="url(#gym-karate-wood)" stroke="#1b1033" stroke-width="6" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect v-for="x in POSTS" :key="`ps${x}`" :x="x - 30" y="-60" width="60" height="760" fill="url(#gym-karate-wood)" stroke-width="6" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="560" y="70" width="800" height="540" fill="#f8ecd0" stroke-width="6" filter="url(#cel-s)" />
      <path d="M1090 211 A170 170 0 1 1 1018 160" fill="none" stroke-width="46" stroke-linecap="round" />
      <path d="M1090 211 A170 170 0 1 1 1018 160" fill="none" stroke="#2a2240" stroke-width="34" stroke-linecap="round" />
      <path d="M1040 160 L1000 150" stroke="#2a2240" stroke-width="14" stroke-linecap="round" />
      <rect x="1220" y="500" width="60" height="60" rx="6" fill="#e8304a" stroke-width="4" />
    </g>

    <g transform="translate(1600 80)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M0 -40 V0" stroke-width="4" />
      <rect x="-80" y="0" width="160" height="20" rx="8" fill="url(#gym-karate-wood)" stroke-width="5" />
      <rect x="-64" y="20" width="128" height="420" fill="url(#gym-karate-scroll)" stroke-width="5" />
      <path d="M-10 420 V60" stroke="#3f8a3a" stroke-width="16" stroke-linecap="round" />
      <path d="M-20 140 H0 M-20 240 H0 M-20 340 H0" stroke-width="5" />
      <path d="M-4 150 Q30 110 54 120 Q30 140 -4 150 Z M-4 250 Q-40 210 -54 220 Q-36 240 -4 250 Z M-4 100 Q24 70 44 76 Q24 96 -4 100 Z" fill="#5fb04a" stroke-width="4" />
      <rect x="-80" y="440" width="160" height="20" rx="8" fill="url(#gym-karate-wood)" stroke-width="5" />
      <circle cx="40" cy="410" r="12" fill="#e8304a" stroke="none" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="40" y="140" width="400" height="20" rx="8" fill="url(#gym-karate-wood)" stroke-width="5" />
      <g v-for="(b, i) in BELTS" :key="`bt${i}`" class="gym-karate-belt" :style="{ transformOrigin: `${b.x}px 160px`, animationDelay: `${b.d}s` }">
        <path :d="`M${b.x - 16} 160 V${380 + (i % 2) * 30} M${b.x + 16} 160 V${400 - (i % 2) * 20}`" stroke-width="28" stroke-linecap="round" />
        <path :d="`M${b.x - 16} 160 V${380 + (i % 2) * 30} M${b.x + 16} 160 V${400 - (i % 2) * 20}`" :stroke="b.c" stroke-width="18" stroke-linecap="round" />
      </g>
    </g>

    <path d="M-60 700 H1980 V1140 H-60 Z" fill="url(#gym-karate-mat)" />
    <path :d="TATAMI" fill="none" stroke="#5a6a2a" stroke-width="10" stroke-linejoin="round" />
    <path :d="TATAMI" fill="none" stroke="#2f3a1a" stroke-width="3" stroke-linejoin="round" />

    <g v-for="x in [700, 1220]" :key="`ln${x}`" :transform="`translate(${x} 40)`">
      <g class="gym-karate-lantern" style="transform-origin: 0 0">
        <path d="M0 0 V60" stroke="#1b1033" stroke-width="4" />
        <ellipse cx="0" cy="130" rx="90" ry="80" fill="url(#gym-karate-lamp)" />
        <path d="M-50 70 H50 Q70 130 50 190 H-50 Q-70 130 -50 70 Z" fill="#ff7a5a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M-60 100 H60 M-64 130 H64 M-60 160 H60" stroke="#c8402a" stroke-width="4" />
        <rect x="-30" y="60" width="60" height="14" rx="4" fill="#1b1033" />
        <rect x="-30" y="186" width="60" height="14" rx="4" fill="#1b1033" />
      </g>
    </g>

    <g transform="translate(330 960)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="60" rx="160" ry="18" fill="#3a3a1a" opacity="0.35" stroke="none" />
      <path d="M-60 60 V-100 M60 60 V-100" stroke-width="20" stroke-linecap="round" />
      <path d="M-60 60 V-100 M60 60 V-100" stroke="#9a5a30" stroke-width="10" stroke-linecap="round" />
      <rect x="-90" y="-60" width="180" height="24" rx="4" fill="#e8b47a" stroke-width="5" />
      <path d="M-90 -110 H-6 L-12 -60 H-90 Z" fill="#f0c890" stroke-width="5" transform="rotate(-14 -6 -60)" />
      <path d="M90 -110 H6 L12 -60 H90 Z" fill="#f0c890" stroke-width="5" transform="rotate(14 6 -60)" />
      <path d="M-40 -120 l-20 -20 M0 -140 v-26 M40 -120 l20 -20" stroke="#ffd23f" stroke-width="7" stroke-linecap="round" class="gym-karate-pow" />
    </g>

    <g transform="translate(1830 1000)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="120" ry="16" fill="#3a3a1a" opacity="0.35" stroke="none" />
      <g class="gym-karate-bag" style="transform-origin: 0 -960px">
        <path d="M0 -960 V-330" stroke-width="8" />
        <path d="M-40 -330 L0 -360 L40 -330" stroke-width="6" fill="none" />
        <rect x="-80" y="-330" width="160" height="320" rx="60" fill="url(#gym-karate-pad)" stroke-width="7" filter="url(#cel-s)" />
        <path d="M-80 -250 H80 M-80 -100 H80" stroke-width="6" />
        <path d="M-50 -300 V-60" stroke="#ffb0a0" stroke-width="8" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>

    <g v-for="(g, gi) in PETALS" :key="`pt${gi}`" class="gym-karate-petals" :style="{ animationDelay: `-${gi * 3}s` }">
      <path v-for="(p, i) in g" :key="`p${i}`" d="M0 0 q8 -10 16 0 q-8 8 -16 0 Z" :transform="`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.a)})`" fill="#ffb0c8" stroke="#c2407a" stroke-width="2" />
    </g>
  </g>
</template>

<style scoped>
.gym-karate-belt {
  animation: gym-karate-sway 3s ease-in-out infinite alternate;
}

.gym-karate-lantern {
  animation: gym-karate-sway 4s ease-in-out infinite alternate;
}

.gym-karate-bag {
  animation: gym-karate-bag 3.2s ease-in-out infinite alternate;
}

.gym-karate-pow {
  animation: gym-karate-pow 1.6s steps(2) infinite;
}

.gym-karate-petals {
  animation: gym-karate-petals 9s linear infinite;
}

@keyframes gym-karate-sway {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes gym-karate-bag {
  from {
    rotate: -4deg;
  }
  to {
    rotate: 5deg;
  }
}

@keyframes gym-karate-pow {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.2;
  }
}

@keyframes gym-karate-petals {
  from {
    translate: -100px -100px;
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  to {
    translate: 200px 700px;
    opacity: 0;
  }
}
</style>
