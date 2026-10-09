<script setup lang="ts">
import { strokeText } from './kit';

const BANNER = strokeText('Наша группа', 960, 150, 52, 'middle');
const BRICKS = (() => {
  let d = '';
  for (let r = 0; r < 14; r++) {
    const y = 40 + r * 50;
    d += `M-60 ${y} H1980 `;
    for (let x = -60 + (r % 2) * 60; x < 1980; x += 120) d += `M${x} ${y} V${y + 50} `;
  }
  return d;
})();
const SLATS = Array.from({ length: 7 }, (_, i) => `M1350 ${120 + i * 40} H1880`).join(' ');
const BULBS = Array.from({ length: 22 }, (_, i) => {
  const x = -20 + i * 92;
  const t = (i % 11) / 10;
  return { x, y: 250 + Math.sin(t * Math.PI) * 50, c: ['#ff4fa8', '#ffd23f', '#3ad6e0', '#9dff8a'][i % 4]! };
});
const LIGHT_STRING = `M-60 250 Q440 350 960 250 Q1480 350 1980 250`;
const BULB_GROUPS = [0, 1].map((g) => BULBS.filter((_, i) => i % 2 === g));
const NOTES = [
  { x: 620, y: 560, d: 0 },
  { x: 1300, y: 520, d: -2 },
  { x: 900, y: 480, d: -4 },
];
const TOOLS = 'M120 360 v80 M100 360 h40 M200 360 l-20 90 M200 360 l20 90 M270 360 v90 M250 380 h40';
</script>

<template>
  <g>
    <defs>
      <linearGradient id="karaoke-band-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a3a7a" />
        <stop offset="100%" stop-color="#3a2258" />
      </linearGradient>
      <linearGradient id="karaoke-band-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7a7a9a" />
        <stop offset="100%" stop-color="#3d3d5a" />
      </linearGradient>
      <linearGradient id="karaoke-band-door" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c9d4f2" />
        <stop offset="100%" stop-color="#8b9dd8" />
      </linearGradient>
      <linearGradient id="karaoke-band-dusk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a1580" />
        <stop offset="100%" stop-color="#ff4fa8" />
      </linearGradient>
      <linearGradient id="karaoke-band-amp" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a3a4a" />
        <stop offset="100%" stop-color="#1a1a24" />
      </linearGradient>
      <linearGradient id="karaoke-band-drum" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#3ad6e0" />
        <stop offset="100%" stop-color="#1a8aa8" />
      </linearGradient>
      <linearGradient id="karaoke-band-rug" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff4f6d" />
        <stop offset="100%" stop-color="#b01a4a" />
      </linearGradient>
      <linearGradient id="karaoke-band-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c48a52" />
        <stop offset="100%" stop-color="#7a4a2a" />
      </linearGradient>
      <radialGradient id="karaoke-band-lamp" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stop-color="#fff0b0" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#fff0b0" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="820" fill="url(#karaoke-band-wall)" />
    <path :d="BRICKS" stroke="#2a1648" stroke-width="4" opacity="0.5" />

    <rect x="1340" y="100" width="560" height="660" fill="url(#karaoke-band-dusk)" stroke="#1b1033" stroke-width="6" />
    <path d="M1340 660 Q1500 600 1640 640 Q1780 600 1900 640 V760 H1340 Z" fill="#2a0f4f" />
    <path d="M1400 640 V560 H1440 V640 M1700 620 V540 H1750 V620" fill="#2a0f4f" stroke="#2a0f4f" stroke-width="4" />
    <circle cx="1780" cy="420" r="40" fill="#ffe08a" stroke="#1b1033" stroke-width="4" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1340" y="100" width="560" height="300" fill="url(#karaoke-band-door)" stroke-width="6" filter="url(#cel-s)" />
      <path :d="SLATS" stroke="#6a7ab8" stroke-width="5" />
      <rect x="1580" y="370" width="80" height="22" rx="8" fill="#5a5a7a" stroke-width="4" />
      <path d="M1320 80 H1920 V100 H1320 Z" fill="#5a5a7a" stroke-width="5" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M560 70 H1360 L1330 190 H590 Z" fill="#fffaf0" stroke-width="6" filter="url(#cel-s)" />
      <path d="M560 70 L520 40 M1360 70 L1400 40" stroke-width="4" />
    </g>
    <path :d="BANNER" fill="none" stroke="#e8304a" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -4)" />
    <path d="M610 170 l30 -6 M1270 176 l40 -10" stroke="#ffb0c0" stroke-width="6" stroke-linecap="round" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="60" y="320" width="300" height="200" rx="6" fill="#7a5a3a" stroke-width="5" />
      <path :d="TOOLS" stroke-width="10" stroke-linecap="round" />
      <path :d="TOOLS" stroke="#c9d4f2" stroke-width="5" stroke-linecap="round" />
      <rect x="380" y="300" width="160" height="220" rx="6" fill="#ffd23f" stroke-width="5" transform="rotate(4 460 410)" />
      <path d="M420 360 L460 330 L500 360 L470 360 L490 470 L440 400 L460 400 Z" fill="#e8304a" stroke-width="4" transform="rotate(4 460 410)" />
    </g>

    <path :d="LIGHT_STRING" stroke="#1b1033" stroke-width="4" fill="none" />
    <g v-for="(g, gi) in BULB_GROUPS" :key="`bg${gi}`" :class="gi ? 'karaoke-band-blink late' : 'karaoke-band-blink'">
      <g v-for="(b, i) in g" :key="`b${i}`">
        <circle :cx="b.x" :cy="b.y + 22" r="20" :fill="b.c" opacity="0.3" />
        <ellipse :cx="b.x" :cy="b.y + 20" rx="9" ry="13" :fill="b.c" stroke="#1b1033" stroke-width="3" />
      </g>
    </g>

    <path d="M-60 760 H1980 V1140 H-60 Z" fill="url(#karaoke-band-floor)" />
    <path d="M-60 760 H1980" stroke="#1b1033" stroke-width="5" />
    <path d="M200 860 q60 -20 120 0 M1500 900 q80 -20 160 4 M800 1060 q40 -14 80 0" stroke="#5a5a7a" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.6" />
    <ellipse cx="960" cy="900" rx="560" ry="110" fill="url(#karaoke-band-rug)" stroke="#1b1033" stroke-width="6" />
    <ellipse cx="960" cy="900" rx="500" ry="90" fill="none" stroke="#ffd23f" stroke-width="5" stroke-dasharray="18 14" />

    <g class="karaoke-band-lamp" style="transform-origin: 960px 190px">
      <path d="M960 190 V360" stroke="#1b1033" stroke-width="5" />
      <path d="M920 400 Q920 360 960 356 Q1000 360 1000 400 Z" fill="#5a5a7a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <ellipse cx="960" cy="402" rx="14" ry="6" fill="#fff6c0" />
      <path d="M940 404 L700 900 H1220 L980 404 Z" fill="url(#karaoke-band-lamp)" />
    </g>

    <g transform="translate(960 880)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-220 -40 V-240 M230 -40 V-270 M-130 -60 L-150 0 M130 -60 L150 0" stroke-width="7" />
      <ellipse cx="-220" cy="-246" rx="70" ry="14" fill="#ffd23f" stroke-width="4" class="karaoke-band-cymbal" />
      <ellipse cx="230" cy="-276" rx="76" ry="14" fill="#ffd23f" stroke-width="4" class="karaoke-band-cymbal late" />
      <rect x="-190" y="-150" width="100" height="74" rx="10" fill="url(#karaoke-band-drum)" stroke-width="5" />
      <rect x="90" y="-150" width="100" height="74" rx="10" fill="url(#karaoke-band-drum)" stroke-width="5" />
      <ellipse cx="-140" cy="-150" rx="50" ry="10" fill="#fffaf0" stroke-width="4" />
      <ellipse cx="140" cy="-150" rx="50" ry="10" fill="#fffaf0" stroke-width="4" />
      <circle cx="0" cy="-90" r="100" fill="url(#karaoke-band-drum)" stroke-width="7" filter="url(#cel-s)" />
      <circle cx="0" cy="-90" r="74" fill="#fffaf0" stroke-width="5" />
      <path d="M-40 -110 L-20 -60 L0 -110 L20 -60 L40 -110" stroke="#e8304a" stroke-width="9" fill="none" stroke-linecap="round" />
      <path d="M-60 -170 Q-20 -186 10 -180" stroke="#d8fbff" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M-80 0 L-100 14 M80 0 L100 14" stroke-width="7" stroke-linecap="round" />
      <g class="karaoke-band-stick" style="transform-origin: -140px -150px">
        <path d="M-140 -150 L-60 -210" stroke-width="10" stroke-linecap="round" />
        <path d="M-140 -150 L-60 -210" stroke="#f4d0a0" stroke-width="5" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="(a, i) in [{ x: 300, w: 260, h: 220 }, { x: 1560, w: 220, h: 180 }]" :key="`am${i}`" :transform="`translate(${a.x} 940)`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="10" :rx="a.w * 0.6" ry="14" fill="#1a1030" opacity="0.4" stroke="none" />
      <rect :x="-a.w / 2" :y="-a.h" :width="a.w" :height="a.h" rx="12" fill="url(#karaoke-band-amp)" stroke-width="6" filter="url(#cel-s)" />
      <rect :x="-a.w / 2 + 12" :y="-a.h + 12" :width="a.w - 24" height="34" rx="5" fill="#ffd23f" stroke-width="4" />
      <circle v-for="k in 4" :key="`kb${k}`" :cx="-a.w / 2 + 20 + k * (a.w - 40) / 5" :cy="-a.h + 29" r="7" fill="#1a1a24" stroke-width="3" />
      <circle cx="0" :cy="-a.h / 2 + 24" :r="a.h * 0.3" fill="#2a2a38" stroke-width="5" />
      <g class="karaoke-band-woof">
        <circle cx="0" :cy="-a.h / 2 + 24" :r="a.h * 0.16" fill="#4a4a5a" stroke-width="4" />
      </g>
    </g>

    <g transform="translate(560 900)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M0 0 V-330 L60 -380" stroke-width="8" fill="none" />
      <path d="M-34 0 L0 -40 L34 0" stroke-width="7" fill="none" />
      <rect x="50" y="-410" width="34" height="50" rx="16" fill="#5a5a7a" stroke-width="5" transform="rotate(40 67 -385)" />
    </g>
    <g transform="translate(1340 900) rotate(-14)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M0 -150 V-430" stroke-width="20" stroke-linecap="round" />
      <path d="M0 -150 V-430" stroke="#c48a52" stroke-width="11" stroke-linecap="round" />
      <path d="M-14 -430 H14 L20 -470 H-20 Z" fill="#1a1a24" stroke-width="5" />
      <path d="M0 -20 Q-80 -16 -80 -70 Q-80 -100 -52 -108 Q-74 -150 -56 -180 Q-30 -156 -18 -136 H18 Q34 -176 58 -186 Q66 -140 50 -110 Q84 -98 80 -64 Q76 -20 0 -20 Z" fill="#ff8a2f" stroke-width="7" />
      <rect x="-30" y="-110" width="60" height="16" rx="4" fill="#fff6e0" stroke-width="4" />
      <path d="M-24 -60 H24" stroke-width="7" />
    </g>

    <g v-for="(n, i) in NOTES" :key="`nt${i}`" class="karaoke-band-note" :style="{ animationDelay: `${n.d}s` }">
      <path :d="`M${n.x} ${n.y} V${n.y - 60} L${n.x + 40} ${n.y - 74} V${n.y - 14}`" stroke="#9dff8a" stroke-width="7" fill="none" stroke-linejoin="round" />
      <ellipse :cx="n.x - 10" :cy="n.y" rx="13" ry="10" fill="#9dff8a" />
      <ellipse :cx="n.x + 30" :cy="n.y - 14" rx="13" ry="10" fill="#9dff8a" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M-80 1140 V960 Q-80 920 -40 920 H200 Q240 920 240 960 V1140 Z" fill="#8a3ab0" stroke-width="7" filter="url(#cel)" />
      <path d="M-60 1000 H220" stroke="#b86ad8" stroke-width="6" />
      <rect x="1720" y="980" width="200" height="160" rx="8" fill="url(#karaoke-band-wood)" stroke-width="6" filter="url(#cel-s)" />
      <path d="M1730 1030 H1910 M1730 1080 H1910" stroke="#5a2a14" stroke-width="4" />
      <rect x="1750" y="940" width="70" height="44" rx="6" fill="#fffaf0" stroke-width="4" />
    </g>
  </g>
</template>

<style scoped>
.karaoke-band-blink {
  animation: karaoke-band-blink 1.2s steps(2) infinite;
}

.karaoke-band-blink.late {
  animation-delay: -0.6s;
}

.karaoke-band-lamp {
  animation: karaoke-band-lamp 4s ease-in-out infinite alternate;
}

.karaoke-band-cymbal {
  transform-box: fill-box;
  transform-origin: center;
  animation: karaoke-band-crash 0.6s ease-in-out infinite alternate;
}

.karaoke-band-cymbal.late {
  animation-delay: -0.3s;
}

.karaoke-band-stick {
  animation: karaoke-band-stick 0.6s ease-in-out infinite alternate;
}

.karaoke-band-woof {
  transform-box: fill-box;
  transform-origin: center;
  animation: karaoke-band-woof 0.3s ease-in-out infinite alternate;
}

.karaoke-band-note {
  animation: karaoke-band-note 6s ease-out infinite;
}

@keyframes karaoke-band-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.35;
  }
}

@keyframes karaoke-band-lamp {
  from {
    rotate: -2deg;
  }
  to {
    rotate: 2deg;
  }
}

@keyframes karaoke-band-crash {
  from {
    rotate: -5deg;
  }
  to {
    rotate: 5deg;
  }
}

@keyframes karaoke-band-stick {
  from {
    rotate: -10deg;
  }
  to {
    rotate: 14deg;
  }
}

@keyframes karaoke-band-woof {
  from {
    scale: 1;
  }
  to {
    scale: 1.18;
  }
}

@keyframes karaoke-band-note {
  0% {
    translate: 0 0;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    translate: 40px -220px;
    opacity: 0;
  }
}
</style>
