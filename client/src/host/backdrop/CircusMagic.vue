<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(777);
const f1 = (n: number) => n.toFixed(1);
const star = (x: number, y: number, r: number) =>
  `M${Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`;
  }).join(' L')} Z`;
const DRAPE_STARS = twinkleGroups(Array.from({ length: 36 }, () => ({ x: 80 + rnd() * 1760, y: 80 + rnd() * 560, r: 8 + rnd() * 10 }))).map((g) => g.map((s) => star(s.x, s.y, s.r)).join(' '));
const SPARKLES = [0, 1, 2].map(() => Array.from({ length: 6 }, () => star(rnd() * 260 - 130, -rnd() * 200, 6 + rnd() * 8)).join(' '));
const CARDS = [
  { x: 420, y: 340, a: -16, s: '♥', c: '#e8304a', d: 0 },
  { x: 560, y: 250, a: 10, s: '♠', c: '#1b1033', d: -1 },
  { x: 1360, y: 260, a: -8, s: '♦', c: '#e8304a', d: -2 },
  { x: 1500, y: 350, a: 14, s: '♣', c: '#1b1033', d: -0.5 },
];
const BULBS = Array.from({ length: 24 }, (_, i) => -20 + i * 84);
const BULB_GROUPS = [0, 1].map((g) => BULBS.filter((_, i) => i % 2 === g));
const suit = (s: string) => {
  if (s === '♥') return 'M0 14 L-16 -2 Q-24 -12 -14 -20 Q-4 -24 0 -12 Q4 -24 14 -20 Q24 -12 16 -2 Z';
  if (s === '♦') return 'M0 -20 L16 0 L0 20 L-16 0 Z';
  if (s === '♠') return 'M0 -20 L16 0 Q22 12 10 14 Q4 14 2 8 L6 20 H-6 L-2 8 Q-4 14 -10 14 Q-22 12 -16 0 Z';
  return 'M0 -20 a8 8 0 1 1 0.1 0 Z M-10 -2 a8 8 0 1 1 0.1 0 Z M10 -2 a8 8 0 1 1 0.1 0 Z M-4 0 L-6 20 H6 L4 0 Z';
};
</script>

<template>
  <g>
    <defs>
      <linearGradient id="circus-magic-drape" x1="0" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
        <stop offset="0%" stop-color="#1a1050" />
        <stop offset="50%" stop-color="#2f2480" />
        <stop offset="100%" stop-color="#1a1050" />
      </linearGradient>
      <linearGradient id="circus-magic-stage" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a3ab0" />
        <stop offset="100%" stop-color="#4a1a6a" />
      </linearGradient>
      <radialGradient id="circus-magic-spot" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff6c0" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fff6c0" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="circus-magic-hat" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2a2240" />
        <stop offset="100%" stop-color="#120e24" />
      </linearGradient>
      <linearGradient id="circus-magic-table" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8304a" />
        <stop offset="100%" stop-color="#8c0f3a" />
      </linearGradient>
      <linearGradient id="circus-magic-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="50%" stop-color="#ffcc33" />
        <stop offset="100%" stop-color="#d9861c" />
      </linearGradient>
      <clipPath id="circus-magic-hat-mouth"><rect x="760" y="100" width="400" height="392" /></clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="900" fill="url(#circus-magic-drape)" />
    <path v-for="(d, gi) in DRAPE_STARS" :key="`ds${gi}`" :d="d" fill="#ffd23f" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" opacity="0.9" />
    <g stroke="#1b1033" stroke-width="6" stroke-linejoin="round">
      <path d="M-60 -60 H360 Q300 300 330 560 Q340 760 240 900 H-60 Z" fill="url(#g-curtain)" filter="url(#cel)" />
      <path d="M1980 -60 H1560 Q1620 300 1590 560 Q1580 760 1680 900 H1980 Z" fill="url(#g-curtain)" filter="url(#cel)" />
      <path d="M-60 -60 H1980 V50 Q1720 130 1460 50 Q1200 130 960 50 Q720 130 460 50 Q200 130 -60 50 Z" fill="url(#g-curtain)" />
    </g>
    <path d="M-60 50 Q200 130 460 50 Q720 130 960 50 Q1200 130 1460 50 Q1720 130 1980 50" stroke="#ffd23f" stroke-width="10" fill="none" />

    <ellipse cx="960" cy="560" rx="460" ry="420" fill="url(#circus-magic-spot)" class="circus-magic-spot" />

    <g v-for="(c, i) in CARDS" :key="`cd${i}`" :transform="`translate(${c.x} ${c.y}) rotate(${c.a})`">
      <g class="circus-magic-float" :style="{ animationDelay: `${c.d}s` }">
        <rect x="-50" y="-70" width="100" height="140" rx="10" fill="#fffaf0" stroke="#1b1033" stroke-width="5" />
        <path :d="suit(c.s)" :fill="c.c" stroke="#1b1033" stroke-width="2" transform="scale(1.4)" />
        <path :d="suit(c.s)" :fill="c.c" transform="translate(-30 -46) scale(0.5)" />
      </g>
    </g>

    <path d="M-60 840 H1980 V900 H-60 Z" fill="url(#circus-magic-gold)" stroke="#1b1033" stroke-width="5" />
    <path d="M-60 900 H1980 V1200 H-60 Z" fill="url(#circus-magic-stage)" stroke="#1b1033" stroke-width="6" filter="url(#cel)" />
    <g v-for="(g, gi) in BULB_GROUPS" :key="`bg${gi}`" :class="gi ? 'circus-magic-blink late' : 'circus-magic-blink'">
      <circle v-for="x in g" :key="`b${x}`" :cx="x" cy="930" r="11" fill="#fff3a0" stroke="#1b1033" stroke-width="3" />
    </g>
    <ellipse cx="960" cy="860" rx="420" ry="50" fill="url(#circus-magic-spot)" />

    <g transform="translate(960 840)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="0" rx="200" ry="20" fill="#2a0a3a" opacity="0.4" stroke="none" />
      <path d="M-30 0 L-14 -180 H14 L30 0 Z" fill="url(#circus-magic-gold)" stroke-width="6" />
      <path d="M-170 -180 H170 L150 -110 Q0 -90 -150 -110 Z" fill="url(#circus-magic-table)" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-150 -110 L-140 -60 M-90 -102 L-84 -60 M90 -102 L84 -60 M150 -110 L140 -60" stroke="#ffd23f" stroke-width="5" stroke-linecap="round" />
      <ellipse cx="0" cy="-180" rx="170" ry="24" fill="#ff5a7a" stroke-width="5" />
    </g>
    <ellipse cx="960" cy="490" rx="96" ry="24" fill="#05030f" stroke="#1b1033" stroke-width="5" />
    <g clip-path="url(#circus-magic-hat-mouth)">
      <g transform="translate(960 490)">
        <g class="circus-magic-rabbit">
          <g stroke="#1b1033" stroke-linejoin="round">
            <path d="M-30 -60 Q-50 -170 -20 -180 Q0 -170 -6 -70 Z M30 -60 Q50 -170 20 -180 Q0 -170 6 -70 Z" fill="#fffaf0" stroke-width="5" />
            <path d="M-24 -80 Q-34 -150 -20 -164 M24 -80 Q34 -150 20 -164" stroke="#ff9ab8" stroke-width="7" fill="none" stroke-linecap="round" />
            <circle cx="0" cy="-30" r="56" fill="#fffaf0" stroke-width="5" />
            <circle cx="-20" cy="-40" r="7" fill="#1b1033" stroke="none" />
            <circle cx="20" cy="-40" r="7" fill="#1b1033" stroke="none" />
            <path d="M-6 -22 L0 -16 L6 -22 Z" fill="#ff9ab8" stroke-width="3" />
            <path d="M0 -16 V-6 M-8 -4 Q0 2 8 -4" stroke-width="3" fill="none" />
            <ellipse cx="-34" cy="-18" rx="10" ry="6" fill="#ffb0c8" stroke="none" />
            <ellipse cx="34" cy="-18" rx="10" ry="6" fill="#ffb0c8" stroke="none" />
          </g>
        </g>
      </g>
    </g>
    <g transform="translate(960 490)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-80 4 L-70 170 Q0 186 70 170 L80 4 Q0 22 -80 4 Z" fill="url(#circus-magic-hat)" stroke-width="6" />
      <path d="M-76 60 Q0 76 76 60 L74 90 Q0 106 -74 90 Z" fill="#e8304a" stroke-width="5" />
      <path d="M-60 30 Q-56 100 -50 150" stroke="#4a4a6a" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M-100 0 A100 26 0 0 0 100 0" fill="url(#circus-magic-hat)" stroke-width="6" />
      <path d="M-100 0 A100 26 0 0 1 100 0 M-80 0 A80 16 0 0 1 80 0" fill="none" stroke-width="5" />
    </g>

    <g transform="translate(1180 560) rotate(-40)" stroke="#1b1033" stroke-linejoin="round">
      <g class="circus-magic-wand" style="transform-origin: -110px 0">
        <rect x="-110" y="-12" width="220" height="24" rx="8" fill="#1a1020" stroke-width="5" />
        <rect x="70" y="-12" width="40" height="24" rx="6" fill="#fffaf0" stroke-width="5" />
        <rect x="-110" y="-12" width="40" height="24" rx="6" fill="#fffaf0" stroke-width="5" />
      </g>
    </g>
    <g v-for="(s, i) in SPARKLES" :key="`sp${i}`" transform="translate(1260 470)">
      <path :d="s" fill="#fff3a0" stroke="#ffcc33" stroke-width="2" class="circus-magic-sparkle" :style="{ animationDelay: `-${i * 0.5}s` }" />
    </g>

    <g class="circus-magic-dove">
      <g transform="translate(0 220)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M-40 0 Q-10 -20 30 -6 L56 -16 L44 2 Q20 24 -20 16 L-60 20 Z" fill="#fffaf0" stroke-width="5" />
        <g class="circus-magic-flap">
          <path d="M-10 -6 Q-20 -60 20 -70 Q20 -30 10 -4 Z" fill="#e8f0ff" stroke-width="4" />
        </g>
        <circle cx="34" cy="-12" r="3" fill="#1b1033" stroke="none" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.circus-magic-spot {
  animation: circus-magic-pulse 3s ease-in-out infinite alternate;
}

.circus-magic-float {
  animation: circus-magic-float 3s ease-in-out infinite alternate;
}

.circus-magic-blink {
  animation: circus-magic-blink 1s steps(2) infinite;
}

.circus-magic-blink.late {
  animation-delay: -0.5s;
}

.circus-magic-rabbit {
  animation: circus-magic-pop 5s ease-in-out infinite;
}

.circus-magic-wand {
  animation: circus-magic-wave 1.6s ease-in-out infinite alternate;
}

.circus-magic-sparkle {
  animation: circus-magic-sparkle 1.5s ease-out infinite;
}

.circus-magic-dove {
  animation: circus-magic-dove 14s linear infinite;
}

.circus-magic-flap {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: circus-magic-flap 0.3s ease-in-out infinite alternate;
}

@keyframes circus-magic-pulse {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

@keyframes circus-magic-float {
  from {
    translate: 0 0;
    rotate: -4deg;
  }
  to {
    translate: 0 -24px;
    rotate: 4deg;
  }
}

@keyframes circus-magic-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.35;
  }
}

/* ta-da: the rabbit pops out of the hat, waits for applause and hides again */
@keyframes circus-magic-pop {
  0%,
  15%,
  100% {
    translate: 0 200px;
  }
  30%,
  80% {
    translate: 0 0;
  }
}

@keyframes circus-magic-wave {
  from {
    rotate: -8deg;
  }
  to {
    rotate: 10deg;
  }
}

@keyframes circus-magic-sparkle {
  from {
    translate: 0 30px;
    opacity: 1;
    scale: 0.6;
  }
  to {
    translate: 20px -40px;
    opacity: 0;
    scale: 1.1;
  }
}

@keyframes circus-magic-dove {
  from {
    translate: -200px 0;
  }
  to {
    translate: 2200px -120px;
  }
}

@keyframes circus-magic-flap {
  from {
    scale: 1 1;
  }
  to {
    scale: 1 -0.6;
  }
}
</style>
