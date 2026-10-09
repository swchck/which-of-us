<script setup lang="ts">
import { strokeText } from './kit';

const f1 = (n: number) => n.toFixed(1);
const SIGN = strokeText('Автодром', 960, 120, 56, 'middle');
const GRID = (() => {
  let d = '';
  for (let x = -60; x <= 1980; x += 80) d += `M${x} 170 L${f1(960 + (x - 960) * 1.3)} 330 `;
  for (const y of [170, 210, 254, 300, 330]) d += `M-60 ${y} H1980 `;
  return d;
})();
const BULBS = Array.from({ length: 26 }, (_, i) => -40 + i * 78);
const BULB_GROUPS = [0, 1].map((g) => BULBS.filter((_, i) => i % 2 === g));
const STRIPES = Array.from({ length: 26 }, (_, i) => ({ x: -60 + i * 80, c: i % 2 ? '#ffd23f' : '#e8304a' }));
const CARS = [
  { x: 420, y: 760, c: '#ff4f6d', hair: '#5a3a2a', k: 0.85, cls: 'fair-bumper-a', flip: false },
  { x: 1450, y: 740, c: '#3ad6e0', hair: '#ffcf5a', k: 0.8, cls: 'fair-bumper-b', flip: true },
  { x: 260, y: 980, c: '#ffd23f', hair: '#1b1033', k: 1.1, cls: 'fair-bumper-c', flip: false },
  { x: 1640, y: 990, c: '#8a6bff', hair: '#c4502a', k: 1.15, cls: 'fair-bumper-d', flip: true },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="fair-bumper-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a0f4f" />
        <stop offset="100%" stop-color="#5a2a7a" />
      </linearGradient>
      <linearGradient id="fair-bumper-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a8ab8" />
        <stop offset="100%" stop-color="#4a4a7a" />
      </linearGradient>
      <linearGradient id="fair-bumper-shine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="fair-bumper-spark">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="40%" stop-color="#9ff6ff" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#9ff6ff" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="fair-bumper-rubber" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a3a4a" />
        <stop offset="100%" stop-color="#15151f" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#fair-bumper-wall)" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="560" y="20" width="800" height="130" rx="20" fill="#e8304a" stroke-width="7" filter="url(#cel-s)" />
    </g>
    <path :d="SIGN" fill="none" stroke="#fff6c0" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
    <g v-for="(g, gi) in BULB_GROUPS" :key="`bg${gi}`" :class="gi ? 'fair-bumper-blink late' : 'fair-bumper-blink'">
      <circle v-for="x in g" :key="`b${x}`" :cx="x" cy="160" r="9" fill="#fff3a0" stroke="#1b1033" stroke-width="3" />
    </g>

    <path d="M-60 170 H1980 L2300 330 H-380 Z" fill="#1a0a30" />
    <path :d="GRID" stroke="#8a7ab8" stroke-width="4" opacity="0.8" />
    <g class="fair-bumper-spark">
      <circle cx="520" cy="300" r="50" fill="url(#fair-bumper-spark)" />
      <path d="M520 300 l-30 -40 M520 300 l40 -30 M520 300 l-10 40 M520 300 l34 24" stroke="#fff" stroke-width="5" stroke-linecap="round" />
    </g>
    <g class="fair-bumper-spark late">
      <circle cx="1380" cy="290" r="50" fill="url(#fair-bumper-spark)" />
      <path d="M1380 290 l-30 -40 M1380 290 l40 -30 M1380 290 l-10 40 M1380 290 l34 24" stroke="#fff" stroke-width="5" stroke-linecap="round" />
    </g>

    <path d="M-60 330 H1980 V580 H-60 Z" fill="#3a1a5a" />
    <g class="fair-bumper-neon" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M180 380 L260 380 L210 450 L290 450 L170 540 L220 470 L150 470 Z M1700 380 L1780 380 L1730 450 L1810 450 L1690 540 L1740 470 L1670 470 Z" stroke="#7af0ff" stroke-width="18" opacity="0.3" />
      <path d="M180 380 L260 380 L210 450 L290 450 L170 540 L220 470 L150 470 Z M1700 380 L1780 380 L1730 450 L1810 450 L1690 540 L1740 470 L1670 470 Z" stroke="#d8fbff" stroke-width="6" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-60 560 H1980 V640 H-60 Z" fill="#e8304a" stroke-width="6" />
      <path v-for="(s, i) in STRIPES" :key="`sr${i}`" :d="`M${s.x} 560 h40 l-20 80 h-40 Z`" :fill="s.c" stroke-width="3" />
      <path d="M-60 640 H1980" stroke-width="6" />
    </g>
    <path d="M-60 640 H1980 L2400 1140 H-480 Z" fill="url(#fair-bumper-floor)" />
    <path d="M300 640 L-100 1140 M700 640 L560 1140 M1220 640 L1360 1140 M1620 640 L2020 1140 M-60 760 H1980 M-60 920 H1980" stroke="#7a7aa8" stroke-width="4" opacity="0.6" />
    <path d="M200 700 L600 1140 H900 L500 700 Z" fill="url(#fair-bumper-shine)" />

    <g v-for="(c, i) in CARS" :key="`car${i}`" :class="c.cls">
      <g :transform="`translate(${c.x} ${c.y}) scale(${c.flip ? -c.k : c.k} ${c.k})`" stroke="#1b1033" stroke-linejoin="round">
        <path d="M30 -100 L60 -620" stroke-width="10" />
        <path d="M30 -100 L60 -620" stroke="#c9d4f2" stroke-width="4" />
        <ellipse cx="0" cy="40" rx="190" ry="26" fill="#1a1030" opacity="0.4" stroke="none" />
        <path d="M-170 30 Q-190 -40 -150 -60 H150 Q190 -40 170 30 Q0 60 -170 30 Z" fill="url(#fair-bumper-rubber)" stroke-width="6" />
        <path d="M-140 -40 Q-150 -110 -80 -116 H90 Q150 -110 140 -40 Z" :fill="c.c" stroke-width="7" />
        <path d="M-120 -80 Q-110 -100 -60 -104" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.6" />
        <circle cx="-10" cy="-150" r="40" fill="#ffc890" stroke-width="5" />
        <path d="M-52 -156 Q-50 -204 -10 -204 Q30 -204 32 -156 Q0 -176 -52 -156 Z" :fill="c.hair" stroke-width="5" />
        <path d="M2 -150 h0.1 M24 -150 h0.1" stroke-width="9" stroke-linecap="round" />
        <path d="M0 -128 Q14 -116 28 -128" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M40 -110 L70 -130" stroke-width="12" stroke-linecap="round" />
        <path d="M40 -110 L70 -130" stroke="#3a3a4a" stroke-width="6" stroke-linecap="round" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.fair-bumper-blink {
  animation: fair-bumper-blink 1s steps(2) infinite;
}

.fair-bumper-blink.late {
  animation-delay: -0.5s;
}

.fair-bumper-spark {
  opacity: 0;
  animation: fair-bumper-spark 2.2s steps(1) infinite;
}

.fair-bumper-spark.late {
  animation-delay: -1.1s;
}

.fair-bumper-neon {
  animation: fair-bumper-blink 1.6s ease-in-out infinite alternate;
}

.fair-bumper-a {
  animation: fair-bumper-a 5s ease-in-out infinite alternate;
}

.fair-bumper-b {
  animation: fair-bumper-b 4.4s ease-in-out infinite alternate;
}

.fair-bumper-c {
  animation: fair-bumper-c 3.6s ease-in-out infinite alternate;
}

.fair-bumper-d {
  animation: fair-bumper-d 4s ease-in-out infinite alternate;
}

@keyframes fair-bumper-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.35;
  }
}

@keyframes fair-bumper-spark {
  0%,
  70% {
    opacity: 0;
  }
  72%,
  78% {
    opacity: 1;
  }
  75% {
    opacity: 0.3;
  }
}

/* two pairs heading for each other and bouncing back: the whole point of the ride */
@keyframes fair-bumper-a {
  from {
    translate: 0 0;
  }
  to {
    translate: 300px 20px;
  }
}

@keyframes fair-bumper-b {
  from {
    translate: 0 0;
  }
  to {
    translate: -300px 30px;
  }
}

@keyframes fair-bumper-c {
  from {
    translate: 0 0;
  }
  to {
    translate: 180px -30px;
  }
}

@keyframes fair-bumper-d {
  from {
    translate: 0 0;
  }
  to {
    translate: -180px -20px;
  }
}
</style>
