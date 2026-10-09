<script setup lang="ts">
import { strokeText } from './kit';

const f1 = (n: number) => n.toFixed(1);
const star = (x: number, y: number, r: number) =>
  `M${Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`;
  }).join(' L')} Z`;
const SIGN = strokeText('Отель', 960, 190, 60, 'middle');
const STARS = [840, 900, 960, 1020, 1080].map((x) => star(x, 238, 20)).join(' ');
const HOOKS = Array.from({ length: 12 }, (_, i) => ({ x: 1560 + (i % 4) * 80, y: 380 + Math.floor(i / 4) * 110, c: ['#ffd23f', '#ff8a5a', '#7ad0ff', '#b07aff'][i % 4]!, gone: i === 5 || i === 10 }));
const WALL_PANELS = Array.from({ length: 10 }, (_, i) => -40 + i * 220);
const CRYSTALS = Array.from({ length: 9 }, (_, i) => ({ x: 960 + (i - 4) * 34, y: 170 + Math.abs(i - 4) * -8 + (i % 2) * 14 }));
const CITY_LIGHTS = 'M110 420 h0.1 M150 450 h0.1 M200 410 h0.1 M240 470 h0.1 M300 430 h0.1 M130 520 h0.1 M270 540 h0.1 M180 580 h0.1 M330 500 h0.1';
</script>

<template>
  <g>
    <defs>
      <linearGradient id="city-hotel-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7a2a5a" />
        <stop offset="100%" stop-color="#4a1a4a" />
      </linearGradient>
      <linearGradient id="city-hotel-panel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a3a6a" />
        <stop offset="100%" stop-color="#5a2050" />
      </linearGradient>
      <linearGradient id="city-hotel-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f4e0c0" />
        <stop offset="100%" stop-color="#c8a07a" />
      </linearGradient>
      <linearGradient id="city-hotel-desk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b86a3a" />
        <stop offset="100%" stop-color="#7a3a22" />
      </linearGradient>
      <linearGradient id="city-hotel-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="50%" stop-color="#ffcc33" />
        <stop offset="100%" stop-color="#d9861c" />
      </linearGradient>
      <linearGradient id="city-hotel-night" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0c0a2c" />
        <stop offset="100%" stop-color="#6a2f7e" />
      </linearGradient>
      <linearGradient id="city-hotel-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#bfe6ff" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#bfe6ff" stop-opacity="0.15" />
      </linearGradient>
      <radialGradient id="city-hotel-glow">
        <stop offset="0%" stop-color="#fff0b0" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#fff0b0" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="city-hotel-carpet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8304a" />
        <stop offset="100%" stop-color="#a8183a" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="800" fill="url(#city-hotel-wall)" />
    <rect v-for="x in WALL_PANELS" :key="`wp${x}`" :x="x" y="300" width="180" height="380" rx="8" fill="url(#city-hotel-panel)" stroke="#3a1036" stroke-width="4" />
    <path d="M-60 290 H1980" stroke="#1b1033" stroke-width="16" />
    <path d="M-60 290 H1980" stroke="#ffcc33" stroke-width="8" />

    <g v-for="dx in [-500, 520]" :key="`ch${dx}`" :transform="`translate(${dx} 0)`">
      <ellipse cx="960" cy="260" rx="420" ry="200" fill="url(#city-hotel-glow)" class="city-hotel-glow" />
      <g stroke="#1b1033" stroke-linejoin="round">
        <path d="M960 -60 V100" stroke-width="6" />
        <path d="M800 140 Q960 90 1120 140 L1090 170 H830 Z" fill="url(#city-hotel-gold)" stroke-width="5" filter="url(#cel-s)" />
        <path v-for="(c, i) in CRYSTALS" :key="`cr${i}`" :d="`M${c.x} ${c.y} l-10 18 l10 22 l10 -22 Z`" fill="#e8f6ff" stroke-width="3" />
      </g>
      <g class="city-hotel-sparkle">
        <path v-for="(c, i) in CRYSTALS.filter((_, j) => j % 2 === 0)" :key="`sk${i}`" :d="`M${c.x} ${c.y + 46} v14 M${c.x - 7} ${c.y + 53} h14`" stroke="#fff" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M860 -60 V110 M1060 -60 V110" stroke-width="6" />
      <rect x="760" y="110" width="400" height="160" rx="18" fill="#2a1040" stroke-width="6" filter="url(#cel-s)" />
    </g>
    <path :d="SIGN" fill="none" stroke="#ffd23f" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
    <path :d="STARS" fill="#ffd23f" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" class="city-hotel-stars" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="40" y="320" width="380" height="420" fill="url(#city-hotel-night)" stroke-width="6" />
      <path d="M60 740 V560 H120 V500 H180 V620 H240 V460 H320 V560 H400 V740 Z" fill="#2b1a5e" stroke="none" />
      <path :d="CITY_LIGHTS" stroke="#ffd36b" stroke-width="10" stroke-linecap="round" />
      <path d="M40 320 Q230 220 420 320" fill="url(#city-hotel-gold)" stroke-width="6" />
      <rect x="20" y="314" width="420" height="20" rx="6" fill="url(#city-hotel-gold)" stroke-width="5" />
      <path d="M230 334 V740" stroke-width="10" />
      <path d="M230 334 V740" stroke="#ffcc33" stroke-width="5" />
      <g class="city-hotel-door" style="transform-origin: 230px 0">
        <rect x="70" y="350" width="140" height="380" fill="url(#city-hotel-glass)" stroke-width="5" />
        <path d="M100 380 L150 520" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.5" />
        <rect x="190" y="520" width="12" height="80" rx="5" fill="url(#city-hotel-gold)" stroke-width="3" />
      </g>
      <g class="city-hotel-door back" style="transform-origin: 230px 0">
        <rect x="250" y="350" width="140" height="380" fill="url(#city-hotel-glass)" stroke-width="5" />
        <path d="M280 380 L330 520" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.5" />
      </g>
      <rect x="20" y="730" width="420" height="20" rx="6" fill="url(#city-hotel-gold)" stroke-width="5" />
    </g>

    <path d="M-60 740 H1980 V1140 H-60 Z" fill="url(#city-hotel-floor)" />
    <path d="M-60 740 H1980" stroke="#1b1033" stroke-width="5" />
    <path d="M300 740 L-200 1140 M700 740 L560 1140 M1220 740 L1360 1140 M1620 740 L2100 1140" stroke="#b8906a" stroke-width="4" opacity="0.6" />
    <path d="M160 750 H300 L520 1140 H-60 Z" fill="url(#city-hotel-carpet)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M176 766 H290 M80 860 H340 M0 980 H410" stroke="#ffd23f" stroke-width="5" opacity="0.7" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1500" y="330" width="380" height="370" rx="10" fill="#5a2a1a" stroke-width="6" filter="url(#cel-s)" />
      <rect x="1520" y="350" width="340" height="330" rx="6" fill="#7a3a22" stroke-width="4" />
    </g>
    <g v-for="(h, i) in HOOKS" :key="`hk${i}`" stroke="#1b1033" stroke-linejoin="round">
      <circle :cx="h.x" :cy="h.y" r="7" fill="url(#city-hotel-gold)" stroke-width="3" />
      <g v-if="!h.gone" :class="i % 3 === 1 ? 'city-hotel-key' : ''" :style="{ transformOrigin: `${h.x}px ${h.y}px` }">
        <path :d="`M${h.x} ${h.y + 4} V${h.y + 30}`" stroke-width="4" />
        <path :d="`M${h.x - 14} ${h.y + 30} h28 l-4 50 h-20 Z`" :fill="h.c" stroke-width="4" />
        <path :d="`M${h.x} ${h.y + 80} v22 h8 m-8 -8 h6`" stroke-width="6" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M560 1000 V700 Q560 680 580 680 H1340 Q1360 680 1360 700 V1000 Z" fill="url(#city-hotel-desk)" stroke-width="7" filter="url(#cel)" />
      <rect x="530" y="660" width="860" height="36" rx="10" fill="#e8d8c0" stroke-width="6" />
      <path d="M560 668 H1300" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <path d="M640 740 V960 M800 740 V960 M960 740 V960 M1120 740 V960 M1280 740 V960" stroke="#5a2a14" stroke-width="5" opacity="0.5" />
      <path d="M560 740 H1360" stroke="#ffcc33" stroke-width="10" />
      <path d="M560 740 H1360" stroke-width="3" opacity="0.4" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1180" y="606" width="110" height="56" rx="6" fill="#fffaf0" stroke-width="4" transform="rotate(-6 1235 634)" />
      <path d="M1196 620 h70 M1196 636 h50" stroke="#9ab0d8" stroke-width="4" transform="rotate(-6 1235 634)" />
      <path d="M680 660 V560" stroke-width="10" />
      <path d="M680 660 V560" stroke="#ffcc33" stroke-width="4" />
      <path d="M640 560 Q680 520 720 560 Z" fill="#7ad0ff" stroke-width="4" />
      <path d="M660 560 Q680 600 700 560" stroke-width="3" fill="none" />
    </g>
    <g transform="translate(1110 660)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-70 0 Q-70 -80 0 -84 Q70 -80 70 0 Z" fill="#2a1040" stroke-width="5" />
      <path d="M-20 -80 L0 -50 L20 -80 Z" fill="#fff" stroke-width="3" />
      <path d="M-18 -58 L0 -66 L18 -58 L18 -74 L0 -66 L-18 -74 Z" fill="#e8304a" stroke-width="3" />
      <circle cx="0" cy="-130" r="46" fill="#ffc890" stroke-width="5" />
      <path d="M-48 -136 Q-46 -190 0 -190 Q46 -190 48 -136 Q30 -160 0 -156 Q-30 -160 -48 -136 Z" fill="#3a2a2a" stroke-width="5" />
      <path d="M-16 -128 h0.1 M16 -128 h0.1" stroke-width="9" stroke-linecap="round" />
      <path d="M-18 -108 Q0 -92 18 -108" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>
    <g transform="translate(960 660)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="-4" rx="60" ry="10" fill="#3a2a2a" stroke-width="4" />
      <g class="city-hotel-bell" style="transform-origin: 0 -6px">
        <path d="M-50 -10 Q-50 -66 0 -68 Q50 -66 50 -10 Z" fill="url(#city-hotel-gold)" stroke-width="5" />
        <path d="M-30 -24 Q-30 -50 -8 -56" stroke="#fffbe0" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M0 -68 V-80" stroke-width="8" stroke-linecap="round" />
        <circle cy="-84" r="9" fill="url(#city-hotel-gold)" stroke-width="4" />
      </g>
    </g>
    <g class="city-hotel-ding" stroke="#ffd23f" stroke-width="6" stroke-linecap="round">
      <path d="M890 560 l-26 -20 M960 540 v-30 M1030 560 l26 -20" />
    </g>

    <g transform="translate(1700 1000)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="60" rx="200" ry="20" fill="#3a1a1a" opacity="0.3" stroke="none" />
      <path d="M-150 -300 V40 M150 -300 V40" stroke-width="16" stroke-linecap="round" />
      <path d="M-150 -300 V40 M150 -300 V40" stroke="#ffcc33" stroke-width="8" stroke-linecap="round" />
      <path d="M-170 -300 Q0 -380 170 -300" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M-170 -300 Q0 -380 170 -300" stroke="url(#city-hotel-gold)" stroke-width="8" fill="none" stroke-linecap="round" />
      <rect x="-170" y="20" width="340" height="30" rx="8" fill="#e8304a" stroke-width="5" />
      <rect x="-130" y="-120" width="150" height="140" rx="14" fill="#4a7ad8" stroke-width="5" filter="url(#cel-s)" />
      <rect x="20" y="-70" width="120" height="90" rx="12" fill="#ffb02e" stroke-width="5" />
      <rect x="-100" y="-220" width="130" height="100" rx="12" fill="#5fb04a" stroke-width="5" />
      <path d="M-90 -100 V0 M-60 -100 V0 M50 -60 V20 M110 -60 V20 M-70 -210 V-130" stroke="#fff" stroke-width="6" opacity="0.5" />
      <path d="M-40 -220 V-246 H0 V-220" stroke-width="7" fill="none" />
      <circle cx="-120" cy="70" r="16" fill="#3a3a5a" stroke-width="4" />
      <circle cx="120" cy="70" r="16" fill="#3a3a5a" stroke-width="4" />
    </g>

    <g transform="translate(470 1000)" stroke="#1b1033" stroke-linejoin="round">
      <g class="city-hotel-palm" style="transform-origin: 0 -120px">
        <path d="M0 -120 Q-10 -220 10 -300" stroke-width="16" fill="none" />
        <path d="M0 -120 Q-10 -220 10 -300" stroke="#8a5a3a" stroke-width="8" fill="none" />
        <path d="M10 -300 Q-80 -340 -150 -280 Q-70 -300 10 -290 Z M10 -300 Q100 -350 160 -270 Q80 -300 10 -290 Z M10 -300 Q-30 -380 -90 -390 Q-20 -350 4 -292 Z M10 -300 Q60 -390 120 -380 Q50 -350 14 -292 Z" fill="#4fb04a" stroke-width="5" />
      </g>
      <path d="M-60 -120 H60 L46 0 H-46 Z" fill="url(#city-hotel-gold)" stroke-width="6" filter="url(#cel-s)" />
    </g>
  </g>
</template>

<style scoped>
.city-hotel-glow {
  animation: city-hotel-pulse 3s ease-in-out infinite alternate;
}

.city-hotel-sparkle {
  animation: city-hotel-pulse 1.2s ease-in-out infinite alternate;
}

.city-hotel-stars {
  animation: city-hotel-pulse 2s ease-in-out infinite alternate;
}

.city-hotel-door {
  animation: city-hotel-turn 4s linear infinite;
}

.city-hotel-door.back {
  animation-delay: -2s;
}

.city-hotel-key {
  animation: city-hotel-swing 2.6s ease-in-out infinite alternate;
}

.city-hotel-bell {
  animation: city-hotel-bell 4s ease-in-out infinite;
}

.city-hotel-ding {
  opacity: 0;
  animation: city-hotel-ding 4s ease-out infinite;
}

.city-hotel-palm {
  animation: city-hotel-swing 5s ease-in-out infinite alternate;
}

@keyframes city-hotel-pulse {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}

/* a revolving door wing seen from the front narrows to an edge and widens again on the other side */
@keyframes city-hotel-turn {
  0% {
    scale: 1 1;
  }
  25% {
    scale: 0.05 1;
  }
  50% {
    scale: -1 1;
  }
  75% {
    scale: -0.05 1;
  }
  100% {
    scale: 1 1;
  }
}

@keyframes city-hotel-swing {
  from {
    rotate: -6deg;
  }
  to {
    rotate: 6deg;
  }
}

@keyframes city-hotel-bell {
  0%,
  70%,
  100% {
    translate: 0 0;
  }
  74% {
    translate: 0 8px;
  }
  80% {
    translate: 0 -4px;
  }
}

@keyframes city-hotel-ding {
  0%,
  72% {
    opacity: 0;
    translate: 0 10px;
  }
  76% {
    opacity: 1;
  }
  92%,
  100% {
    opacity: 0;
    translate: 0 -20px;
  }
}
</style>
