<script setup lang="ts">
const f1 = (n: number) => n.toFixed(1);
const PANELS = Array.from({ length: 9 }, (_, i) => -40 + i * 240);
const RIVETS = PANELS.flatMap((x) => [
  [x + 16, 40],
  [x + 204, 40],
  [x + 16, 640],
  [x + 204, 640],
])
  .map(([x, y]) => `M${x} ${y} h0.1`)
  .join(' ');
const BOLTS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  return `M${f1(Math.cos(a) * 196)} ${f1(Math.sin(a) * 196)} h0.1`;
}).join(' ');
const SPOKES = [0, 60, 120].map((a) => `rotate(${a})`);
const GOLD = (() => {
  const out: { x: number; y: number }[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4 - r; c++) out.push({ x: 1430 + c * 74 + r * 37, y: 560 - r * 34 });
  return out;
})();
const MONEY = [
  { x: 1440, y: 360 },
  { x: 1540, y: 360 },
  { x: 1640, y: 360 },
  { x: 1490, y: 330 },
  { x: 1590, y: 330 },
];
const LASERS = [
  { d: 'M-60 820 L1300 1000', cls: '' },
  { d: 'M-60 1000 L1300 780', cls: 'late' },
  { d: 'M200 720 L1100 1100', cls: '' },
  { d: 'M300 1100 L1240 700', cls: 'late' },
];
const TILES = (() => {
  let d = '';
  for (let y = 760; y < 1140; y += 76) d += `M-60 ${y} H1980 `;
  for (let x = -1400; x < 3400; x += 160) d += `M${f1(960 + (x - 960) * 0.4)} 740 L${x} 1140 `;
  return d;
})();
</script>

<template>
  <g>
    <defs>
      <linearGradient id="mystery-heist-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a4a8a" />
        <stop offset="100%" stop-color="#26306a" />
      </linearGradient>
      <linearGradient id="mystery-heist-panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4f5fa8" />
        <stop offset="100%" stop-color="#34407e" />
      </linearGradient>
      <linearGradient id="mystery-heist-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a4a7a" />
        <stop offset="100%" stop-color="#22224a" />
      </linearGradient>
      <linearGradient id="mystery-heist-steel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8eefc" />
        <stop offset="50%" stop-color="#a8b4dc" />
        <stop offset="100%" stop-color="#6a78b0" />
      </linearGradient>
      <linearGradient id="mystery-heist-vault" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a3a1a" />
        <stop offset="100%" stop-color="#2a1a0a" />
      </linearGradient>
      <linearGradient id="mystery-heist-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="50%" stop-color="#ffcc33" />
        <stop offset="100%" stop-color="#d9861c" />
      </linearGradient>
      <radialGradient id="mystery-heist-glow">
        <stop offset="0%" stop-color="#ffd96b" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffd96b" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="mystery-heist-alarm">
        <stop offset="0%" stop-color="#ff4f4f" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#ff4f4f" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="mystery-heist-bag" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d8c8a0" />
        <stop offset="100%" stop-color="#a08a5a" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="820" fill="url(#mystery-heist-wall)" />
    <rect v-for="x in PANELS" :key="`pn${x}`" :x="x" y="20" width="220" height="640" rx="10" fill="url(#mystery-heist-panel)" stroke="#1b1033" stroke-width="4" />
    <path :d="RIVETS" stroke="#a8b4dc" stroke-width="12" stroke-linecap="round" />

    <g transform="translate(700 0)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-90" y="-20" width="180" height="80" rx="6" fill="#26306a" stroke-width="6" />
      <path d="M-70 0 H70 M-70 20 H70 M-70 40 H70" stroke-width="5" />
      <path d="M0 60 V560" stroke-width="12" />
      <path d="M0 60 V560" stroke="#e8c070" stroke-width="6" stroke-dasharray="10 6" />
      <path d="M-14 560 Q0 600 14 560" stroke-width="6" fill="none" />
    </g>

    <g transform="translate(1600 460)" stroke="#1b1033" stroke-linejoin="round">
      <circle r="280" fill="url(#mystery-heist-steel)" stroke-width="8" filter="url(#cel)" />
      <circle r="236" fill="url(#mystery-heist-vault)" stroke-width="6" />
    </g>
    <ellipse cx="1600" cy="480" rx="220" ry="200" fill="url(#mystery-heist-glow)" class="mystery-heist-shine" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M1380 600 H1820 M1380 420 H1820" stroke-width="12" />
      <path d="M1380 600 H1820 M1380 420 H1820" stroke="#a8b4dc" stroke-width="6" />
      <rect v-for="(g, i) in GOLD" :key="`gd${i}`" :x="g.x" :y="g.y - 30" width="66" height="30" rx="4" fill="url(#mystery-heist-gold)" stroke-width="4" />
      <g v-for="(m, i) in MONEY" :key="`mn${i}`">
        <rect :x="m.x" :y="m.y + 20" width="86" height="40" rx="4" fill="#7ed06a" stroke-width="4" />
        <rect :x="m.x + 30" :y="m.y + 20" width="20" height="40" fill="#fffaf0" stroke-width="3" />
      </g>
    </g>
    <g class="mystery-heist-sparkle" fill="#fffbe0">
      <path d="M1470 488 l6 -16 l6 16 l16 6 l-16 6 l-6 16 l-6 -16 l-16 -6 Z M1690 520 l5 -12 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 Z M1580 350 l5 -12 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 Z" />
    </g>

    <g transform="translate(1250 470)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M40 -290 Q-60 -250 -70 0 Q-60 250 40 290 L60 280 Q-30 240 -40 0 Q-30 -240 60 -280 Z" fill="#8b9dd8" stroke-width="6" />
      <ellipse cx="-50" cy="0" rx="90" ry="270" fill="url(#mystery-heist-steel)" stroke-width="8" filter="url(#cel)" />
      <ellipse cx="-50" cy="0" rx="64" ry="200" fill="none" stroke-width="5" />
      <path :d="BOLTS" transform="translate(-50 0) scale(0.4 1.3)" stroke-width="16" stroke-linecap="round" />
      <g transform="translate(-60 0) scale(0.45 1)">
        <circle r="60" fill="#c9d4f2" stroke-width="10" />
        <path v-for="(s, i) in SPOKES" :key="`sp${i}`" d="M0 -120 V120" :transform="s" stroke-width="22" stroke-linecap="round" />
        <path v-for="(s, i) in SPOKES" :key="`sq${i}`" d="M0 -120 V120" :transform="s" stroke="#e8eefc" stroke-width="10" stroke-linecap="round" />
        <circle r="24" fill="url(#mystery-heist-gold)" stroke-width="8" />
      </g>
    </g>

    <g transform="translate(160 120)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-40 -60 V0 H0" stroke-width="12" fill="none" />
      <g class="mystery-heist-cam" style="transform-origin: 0 0">
        <rect x="0" y="-26" width="140" height="56" rx="10" fill="#e8eefc" stroke-width="6" />
        <path d="M140 -16 L176 -26 V36 L140 26 Z" fill="#a8b4dc" stroke-width="5" />
        <circle cx="160" cy="4" r="10" fill="#1b1033" stroke="none" />
        <circle class="mystery-heist-rec" cx="24" cy="-6" r="8" fill="#ff4f4f" stroke-width="3" />
      </g>
    </g>

    <g transform="translate(960 40)" stroke="#1b1033" stroke-linejoin="round">
      <circle r="140" fill="url(#mystery-heist-alarm)" class="mystery-heist-alarm" stroke="none" />
      <path d="M-40 0 H40 V-30 H-40 Z" fill="#5a5a7a" stroke-width="5" />
      <path d="M-34 0 Q-34 60 0 60 Q34 60 34 0 Z" fill="#ff4f4f" stroke-width="5" />
      <path d="M-18 14 Q-16 36 -4 46" stroke="#ffd0d0" stroke-width="6" fill="none" stroke-linecap="round" />
    </g>

    <path d="M-60 740 H1980 V1140 H-60 Z" fill="url(#mystery-heist-floor)" />
    <path :d="TILES" stroke="#5a5a8a" stroke-width="3" opacity="0.6" />
    <path d="M-60 740 H1980" stroke="#1b1033" stroke-width="5" />

    <g v-for="(l, i) in LASERS" :key="`ls${i}`" :class="['mystery-heist-laser', l.cls]">
      <path :d="l.d" stroke="#ff2f4f" stroke-width="24" opacity="0.4" stroke-linecap="round" />
      <path :d="l.d" stroke="#ff7a8a" stroke-width="9" stroke-linecap="round" />
      <path :d="l.d" stroke="#fff0f0" stroke-width="3" stroke-linecap="round" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="-80" y="700" width="40" height="420" rx="8" fill="#5a5a7a" stroke-width="5" />
      <rect x="1280" y="680" width="40" height="440" rx="8" fill="#5a5a7a" stroke-width="5" />
      <circle cx="-40" cy="820" r="10" fill="#ff4f4f" stroke-width="3" />
      <circle cx="-40" cy="1000" r="10" fill="#ff4f4f" stroke-width="3" />
      <circle cx="1280" cy="780" r="10" fill="#ff4f4f" stroke-width="3" />
      <circle cx="1280" cy="1000" r="10" fill="#ff4f4f" stroke-width="3" />
    </g>

    <g transform="translate(1600 1000)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="60" rx="180" ry="22" fill="#0a0a24" opacity="0.4" stroke="none" />
      <path d="M-50 -150 Q-70 -180 -40 -190 Q0 -170 40 -190 Q70 -180 50 -150 Q160 -90 150 10 Q140 70 0 70 Q-140 70 -150 10 Q-160 -90 -50 -150 Z" fill="url(#mystery-heist-bag)" stroke-width="7" filter="url(#cel-s)" />
      <path d="M-56 -150 Q0 -136 56 -150" stroke-width="10" fill="none" stroke-linecap="round" />
      <path d="M-56 -150 Q0 -136 56 -150" stroke="#e8304a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M30 -70 Q0 -90 -30 -70 Q-46 -46 0 -30 Q46 -14 30 14 Q0 34 -34 12 M0 -100 V44" stroke="#2f8a3a" stroke-width="14" fill="none" stroke-linecap="round" />
      <path d="M-110 -40 Q-100 -90 -60 -110" stroke="#f4ead0" stroke-width="8" fill="none" stroke-linecap="round" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1780" y="1030" width="66" height="30" rx="4" fill="url(#mystery-heist-gold)" stroke-width="4" transform="rotate(-10 1813 1045)" />
      <rect x="1360" y="1050" width="86" height="40" rx="4" fill="#7ed06a" stroke-width="4" transform="rotate(8 1403 1070)" />
    </g>
  </g>
</template>

<style scoped>
.mystery-heist-laser {
  animation: mystery-heist-laser 1.6s ease-in-out infinite alternate;
}

.mystery-heist-laser.late {
  animation-delay: -0.8s;
}

.mystery-heist-cam {
  animation: mystery-heist-cam 6s ease-in-out infinite alternate;
}

.mystery-heist-rec {
  animation: mystery-heist-blink 1s steps(1) infinite;
}

.mystery-heist-alarm {
  animation: mystery-heist-blink 1.2s steps(1) infinite;
}

.mystery-heist-shine {
  animation: mystery-heist-laser 3s ease-in-out infinite alternate;
}

.mystery-heist-sparkle {
  animation: mystery-heist-laser 1.4s ease-in-out infinite alternate;
}

@keyframes mystery-heist-laser {
  from {
    opacity: 0.35;
  }
  to {
    opacity: 1;
  }
}

@keyframes mystery-heist-cam {
  from {
    rotate: 10deg;
  }
  to {
    rotate: 40deg;
  }
}

@keyframes mystery-heist-blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
