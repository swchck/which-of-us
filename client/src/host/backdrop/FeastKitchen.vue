<script setup lang="ts">
const TILES = (() => {
  let d = '';
  for (let y = 460; y <= 700; y += 48) d += `M-60 ${y} H1980 `;
  for (let x = -60; x <= 1980; x += 48) d += `M${x} 460 V700 `;
  return d;
})();
const MAGNETS = [
  { x: 150, y: 330, c: '#ff4f6d' },
  { x: 290, y: 420, c: '#ffd23f' },
  { x: 220, y: 640, c: '#3ad6e0' },
  { x: 300, y: 720, c: '#9dff8a' },
];
const JARS = [
  { x: 1180, w: 70, h: 90, c: '#ffb02e' },
  { x: 1270, w: 60, h: 110, c: '#e8304a' },
  { x: 1350, w: 80, h: 80, c: '#7ed06a' },
  { x: 1450, w: 60, h: 100, c: '#b07aff' },
];
const UTENSILS = [
  { x: 1730, kind: 'ladle' },
  { x: 1790, kind: 'spatula' },
  { x: 1850, kind: 'whisk' },
  { x: 1910, kind: 'ladle' },
];
const STEAM = [
  { x: 1000, d: 0 },
  { x: 1240, d: -1.2 },
  { x: 1560, d: -2.1 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="feast-kitchen-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe7c2" />
        <stop offset="100%" stop-color="#f4c890" />
      </linearGradient>
      <linearGradient id="feast-kitchen-tile" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#bfe6ff" />
        <stop offset="100%" stop-color="#8ac4ea" />
      </linearGradient>
      <linearGradient id="feast-kitchen-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a4a9a" />
        <stop offset="60%" stop-color="#b87ab8" />
        <stop offset="100%" stop-color="#ffb890" />
      </linearGradient>
      <linearGradient id="feast-kitchen-fridge" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fffaf0" />
        <stop offset="100%" stop-color="#d8dcef" />
      </linearGradient>
      <linearGradient id="feast-kitchen-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0a464" />
        <stop offset="100%" stop-color="#a86a36" />
      </linearGradient>
      <linearGradient id="feast-kitchen-cab" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7ac8a8" />
        <stop offset="100%" stop-color="#4a9a7a" />
      </linearGradient>
      <linearGradient id="feast-kitchen-pot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ff7a5a" />
        <stop offset="100%" stop-color="#c8402a" />
      </linearGradient>
      <linearGradient id="feast-kitchen-steel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e8eefc" />
        <stop offset="100%" stop-color="#9aa8d0" />
      </linearGradient>
      <linearGradient id="feast-kitchen-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c88a5a" />
        <stop offset="100%" stop-color="#8a5a3a" />
      </linearGradient>
      <radialGradient id="feast-kitchen-flame">
        <stop offset="0%" stop-color="#9ae8ff" />
        <stop offset="100%" stop-color="#3a7ad8" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="900" fill="url(#feast-kitchen-wall)" />
    <rect x="-60" y="460" width="2040" height="240" fill="url(#feast-kitchen-tile)" />
    <path :d="TILES" stroke="#6aa8d8" stroke-width="3" opacity="0.7" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1100" y="40" width="760" height="200" rx="10" fill="url(#feast-kitchen-cab)" stroke-width="6" filter="url(#cel-s)" />
      <path d="M1290 40 V240 M1480 40 V240 M1670 40 V240" stroke-width="5" />
      <path d="M1270 130 v40 M1310 130 v40 M1650 130 v40 M1690 130 v40" stroke-width="8" stroke-linecap="round" />
      <rect x="1140" y="360" width="400" height="20" rx="4" fill="url(#feast-kitchen-wood)" stroke-width="5" />
      <g v-for="(j, i) in JARS" :key="`jr${i}`">
        <rect :x="j.x" :y="360 - j.h" :width="j.w" :height="j.h" rx="10" fill="#eaf6ff" stroke-width="5" />
        <rect :x="j.x + 6" :y="360 - j.h * 0.7" :width="j.w - 12" :height="j.h * 0.7 - 6" rx="6" :fill="j.c" stroke-width="3" />
        <rect :x="j.x - 4" :y="350 - j.h" :width="j.w + 8" height="16" rx="5" fill="#e8304a" stroke-width="4" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="460" y="70" width="380" height="320" rx="10" fill="url(#feast-kitchen-sky)" stroke-width="6" />
      <circle cx="760" cy="160" r="36" fill="#fff4c2" stroke-width="4" />
      <path d="M470 330 Q560 280 650 310 Q740 270 830 300 V380 H470 Z" fill="#5a4a9a" />
      <path d="M460 70 H840 V390 H460 Z" fill="none" stroke-width="22" />
      <path d="M460 70 H840 V390 H460 Z" fill="none" stroke="#fffaf0" stroke-width="12" />
      <path d="M650 70 V390 M460 230 H840" stroke-width="12" />
      <path d="M650 70 V390 M460 230 H840" stroke="#fffaf0" stroke-width="6" />
      <path d="M430 50 Q480 200 450 400 H520 Q540 200 500 50 Z M870 50 Q820 200 850 400 H780 Q760 200 800 50 Z" fill="#ff9ab0" stroke-width="5" />
      <path d="M440 40 H860" stroke-width="10" stroke-linecap="round" />
      <path d="M440 400 H860 L876 424 H424 Z" fill="#fffaf0" stroke-width="5" />
      <g transform="translate(560 400)">
        <path d="M-28 0 L-22 -40 H22 L28 0 Z" fill="#f08a5a" stroke-width="4" />
        <path d="M0 -40 Q-30 -90 -10 -110 M0 -40 Q30 -80 20 -100 M0 -40 V-110" stroke="#3f9a3a" stroke-width="7" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <path d="M1700 430 H1950" stroke="#1b1033" stroke-width="10" stroke-linecap="round" />
    <path d="M1700 430 H1950" stroke="#c9d4f2" stroke-width="4" stroke-linecap="round" />
    <g v-for="(u, i) in UTENSILS" :key="`ut${i}`" class="feast-kitchen-hang" :style="{ transformOrigin: `${u.x}px 430px`, animationDelay: `-${i * 0.7}s` }" stroke="#1b1033" stroke-linejoin="round">
      <path :d="`M${u.x} 430 V530`" stroke-width="10" stroke-linecap="round" />
      <path :d="`M${u.x} 430 V530`" stroke="#c9d4f2" stroke-width="5" stroke-linecap="round" />
      <path v-if="u.kind === 'ladle'" :d="`M${u.x - 26} 530 Q${u.x - 26} 570 ${u.x} 570 Q${u.x + 26} 570 ${u.x + 26} 530 Z`" fill="url(#feast-kitchen-steel)" stroke-width="5" />
      <rect v-else-if="u.kind === 'spatula'" :x="u.x - 22" y="528" width="44" height="50" rx="8" fill="#ff7a3a" stroke-width="5" />
      <path v-else :d="`M${u.x} 528 Q${u.x - 30} 580 ${u.x} 590 Q${u.x + 30} 580 ${u.x} 528 M${u.x} 528 Q${u.x - 12} 580 ${u.x} 590 Q${u.x + 12} 580 ${u.x} 528`" fill="none" stroke-width="4" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="40" y="180" width="380" height="800" rx="26" fill="url(#feast-kitchen-fridge)" stroke-width="7" filter="url(#cel)" />
      <path d="M40 480 H420" stroke-width="6" />
      <path d="M380 260 V420 M380 540 V700" stroke-width="16" stroke-linecap="round" />
      <path d="M380 260 V420 M380 540 V700" stroke="#c9d4f2" stroke-width="8" stroke-linecap="round" />
      <rect x="90" y="540" width="170" height="130" fill="#fffaf0" stroke-width="4" transform="rotate(-5 175 605)" />
      <path d="M110 650 L150 580 L180 630 L220 590 L240 650 Z" fill="#7ed06a" stroke-width="3" transform="rotate(-5 175 605)" />
      <circle cx="210" cy="570" r="16" fill="#ffd23f" stroke-width="3" />
      <path d="M120 600 h0.1 M140 600 h0.1 M126 616 q10 8 20 0" stroke-width="4" fill="none" stroke-linecap="round" transform="rotate(-5 175 605)" />
      <circle v-for="(m, i) in MAGNETS" :key="`mg${i}`" :cx="m.x" :cy="m.y" r="18" :fill="m.c" stroke-width="4" />
      <path d="M110 280 h120 M110 310 h90 M110 340 h110" stroke="#9ab0d8" stroke-width="5" />
      <rect x="96" y="260" width="150" height="100" fill="none" stroke-width="4" />
    </g>

    <path d="M-60 840 H1980 V1140 H-60 Z" fill="url(#feast-kitchen-floor)" />
    <path d="M300 840 L-100 1140 M700 840 L560 1140 M1220 840 L1360 1140 M1620 840 L2020 1140" stroke="#7a4a2a" stroke-width="4" opacity="0.6" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="440" y="700" width="1500" height="160" fill="url(#feast-kitchen-cab)" stroke-width="7" filter="url(#cel)" />
      <path d="M760 720 V860 M1100 720 V860 M1440 720 V860" stroke-width="5" />
      <path d="M720 770 h-40 M800 770 h40 M1060 770 h-40 M1140 770 h40" stroke-width="8" stroke-linecap="round" />
      <rect x="420" y="684" width="1540" height="26" rx="6" fill="url(#feast-kitchen-wood)" stroke-width="6" />
      <rect x="880" y="660" width="760" height="30" rx="6" fill="#3a3a5a" stroke-width="5" />
    </g>
    <ellipse v-for="x in [1000, 1240, 1500]" :key="`fl${x}`" :cx="x" cy="664" rx="70" ry="10" fill="url(#feast-kitchen-flame)" class="feast-kitchen-flame" />

    <g transform="translate(1000 660)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-110 0 V-140 H110 V0 Q0 14 -110 0 Z" fill="url(#feast-kitchen-pot)" stroke-width="7" filter="url(#cel-s)" />
      <path d="M-130 -110 H-110 M110 -110 H130" stroke-width="14" stroke-linecap="round" />
      <path d="M-86 -120 V-30" stroke="#ffb0a0" stroke-width="8" stroke-linecap="round" />
    </g>
    <g transform="translate(1000 520)">
      <g class="feast-kitchen-lid">
        <path d="M-120 0 Q0 -40 120 0 Z" fill="url(#feast-kitchen-steel)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
        <circle cy="-30" r="12" fill="#1b1033" />
      </g>
    </g>
    <g transform="translate(1240 660)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-120 -20 H120 V0 H-120 Z" fill="#3a3a5a" stroke-width="6" />
      <path d="M120 -10 H260" stroke-width="16" stroke-linecap="round" />
      <path d="M120 -10 H260" stroke="#5a5a7a" stroke-width="8" stroke-linecap="round" />
      <ellipse cx="-20" cy="-30" rx="40" ry="12" fill="#ffd23f" stroke-width="4" />
      <ellipse cx="50" cy="-30" rx="40" ry="12" fill="#ffd23f" stroke-width="4" />
      <circle cx="-20" cy="-32" r="7" fill="#ff8a2f" stroke="none" />
      <circle cx="50" cy="-32" r="7" fill="#ff8a2f" stroke="none" />
    </g>
    <g transform="translate(1520 660)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-70 0 Q-90 -100 0 -110 Q90 -100 70 0 Z" fill="#5ad0c0" stroke-width="6" filter="url(#cel-s)" />
      <path d="M60 -60 Q120 -80 130 -130" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M60 -60 Q120 -80 130 -130" stroke="#5ad0c0" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M-40 -110 Q0 -150 40 -110" stroke-width="8" fill="none" />
      <circle cx="0" cy="-116" r="10" fill="#e8304a" stroke-width="4" />
    </g>

    <g v-for="(s, i) in STEAM" :key="`sm${i}`" class="feast-kitchen-steam" :style="{ animationDelay: `${s.d}s` }">
      <path :d="`M${s.x} 470 q-20 -30 0 -60 q20 -30 0 -60 M${s.x + 40} 480 q-16 -24 0 -48 q16 -24 0 -48`" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.85" />
    </g>
    <path d="M1650 520 q20 -20 50 -20 q30 0 50 -26" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" class="feast-kitchen-steam" />

    <g transform="translate(560 960)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="120" ry="16" fill="#3a1a0a" opacity="0.35" stroke="none" />
      <path d="M-90 40 Q-100 -30 -40 -40 Q20 -50 70 -20 Q100 0 90 40 Z" fill="#8a8ab0" stroke-width="5" />
      <circle cx="70" cy="-40" r="34" fill="#8a8ab0" stroke-width="5" />
      <path d="M48 -66 L52 -92 L70 -72 M88 -70 L98 -94 L100 -66" fill="#8a8ab0" stroke-width="4" />
      <path d="M60 -44 q6 4 12 0 M80 -44 q6 4 12 0" stroke-width="4" fill="none" stroke-linecap="round" />
      <g class="feast-kitchen-tail" style="transform-origin: -86px 30px">
        <path d="M-86 30 Q-150 20 -140 -40" stroke-width="16" fill="none" stroke-linecap="round" />
        <path d="M-86 30 Q-150 20 -140 -40" stroke="#8a8ab0" stroke-width="8" fill="none" stroke-linecap="round" />
      </g>
      <ellipse cx="200" cy="40" rx="50" ry="14" fill="#e8eefc" stroke-width="5" />
      <ellipse cx="200" cy="36" rx="34" ry="8" fill="#fffaf0" stroke-width="3" />
    </g>
  </g>
</template>

<style scoped>
.feast-kitchen-hang {
  animation: feast-kitchen-hang 3s ease-in-out infinite alternate;
}

.feast-kitchen-flame {
  animation: feast-kitchen-flame 0.4s ease-in-out infinite alternate;
}

.feast-kitchen-lid {
  animation: feast-kitchen-lid 1.4s steps(1) infinite;
}

.feast-kitchen-steam {
  animation: feast-kitchen-steam 3s ease-out infinite;
}

.feast-kitchen-tail {
  animation: feast-kitchen-hang 2.2s ease-in-out infinite alternate;
}

@keyframes feast-kitchen-hang {
  from {
    rotate: -5deg;
  }
  to {
    rotate: 5deg;
  }
}

@keyframes feast-kitchen-flame {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

/* the lid rattles as the soup boils */
@keyframes feast-kitchen-lid {
  0%,
  60% {
    translate: 0 0;
    rotate: 0deg;
  }
  70% {
    translate: 0 -10px;
    rotate: -3deg;
  }
  80% {
    translate: 0 -4px;
    rotate: 3deg;
  }
  90% {
    translate: 0 -8px;
    rotate: -2deg;
  }
}

@keyframes feast-kitchen-steam {
  from {
    translate: 0 10px;
    opacity: 0;
  }
  30% {
    opacity: 0.9;
  }
  to {
    translate: 0 -80px;
    opacity: 0;
  }
}
</style>
