<script setup lang="ts">
const f1 = (n: number) => n.toFixed(1);

type Facade = { x: number; w: number; top: number; c: string; roof: string; cols: number; rows: number };
const FACADES: Facade[] = [
  { x: -60, w: 300, top: 380, c: '#ffb0a0', roof: '#c8504a', cols: 3, rows: 3 },
  { x: 240, w: 240, top: 430, c: '#ffe08a', roof: '#4a7ad8', cols: 2, rows: 3 },
  { x: 760, w: 280, top: 460, c: '#a8e0c8', roof: '#3a8a6a', cols: 3, rows: 2 },
  { x: 1040, w: 260, top: 410, c: '#c8b8ff', roof: '#6a4ab0', cols: 2, rows: 3 },
  { x: 1300, w: 300, top: 360, c: '#ffc890', roof: '#c8603a', cols: 3, rows: 3 },
  { x: 1600, w: 380, top: 420, c: '#9ad0ff', roof: '#2f5ec0', cols: 3, rows: 3 },
];
const GROUND = 780;
const WINDOWS = FACADES.flatMap((f) => {
  const out: string[] = [];
  const cw = f.w / f.cols;
  const rh = (GROUND - 40 - f.top - 40) / f.rows;
  for (let c = 0; c < f.cols; c++)
    for (let r = 0; r < f.rows; r++) {
      const x = f.x + c * cw + cw / 2;
      const y = f.top + 50 + r * rh;
      out.push(`M${f1(x - 18)} ${f1(y + rh * 0.62)} V${f1(y + 14)} Q${f1(x)} ${f1(y - 6)} ${f1(x + 18)} ${f1(y + 14)} V${f1(y + rh * 0.62)} Z`);
    }
  return out;
}).join(' ');
const PAVING = Array.from({ length: 22 }, (_, i) => -1200 + i * 200)
  .map((xb) => `M${f1(960 + (xb - 960) * 0.25)} ${GROUND} L${xb} 1140`)
  .join(' ');
const TOURISTS = [
  { x: 1380, c: '#e8553f', hair: '#5a3a2a', k: 1 },
  { x: 1500, c: '#5fb04a', hair: '#ffcf5a', k: 0.92 },
  { x: 1620, c: '#ffb02e', hair: '#1b1033', k: 1.05 },
  { x: 1750, c: '#4a7ad8', hair: '#c4502a', k: 0.95 },
];
const PIGEONS = [
  { x: 640, y: 1010, s: 1 },
  { x: 720, y: 1040, s: -1 },
  { x: 1220, y: 1000, s: 1 },
];
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);
</script>

<template>
  <g>
    <defs>
      <linearGradient id="city-sights-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4aa8f0" />
        <stop offset="70%" stop-color="#a8dcff" />
        <stop offset="100%" stop-color="#e0f4ff" />
      </linearGradient>
      <linearGradient id="city-sights-paving" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8d8c0" />
        <stop offset="100%" stop-color="#b8987a" />
      </linearGradient>
      <linearGradient id="city-sights-tower" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e8705a" />
        <stop offset="100%" stop-color="#b03a3a" />
      </linearGradient>
      <linearGradient id="city-sights-stone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8e0f0" />
        <stop offset="100%" stop-color="#a8a0c8" />
      </linearGradient>
      <linearGradient id="city-sights-bronze" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7ad0b0" />
        <stop offset="100%" stop-color="#3a8a7a" />
      </linearGradient>
      <linearGradient id="city-sights-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9ae8ff" />
        <stop offset="100%" stop-color="#3aa8e0" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#city-sights-sky)" />
    <circle cx="1720" cy="150" r="140" fill="#fff6c0" opacity="0.35" />
    <circle cx="1720" cy="150" r="80" fill="#ffe14d" stroke="#1b1033" stroke-width="5" />
    <g v-for="(c, i) in [{ y: 120, d: 10, s: 90 }, { y: 250, d: 50, s: 120 }]" :key="`cl${i}`" class="city-sights-cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <path :d="`M-150 ${c.y + 20} Q-170 ${c.y - 10} -120 ${c.y - 20} Q-110 ${c.y - 60} -50 ${c.y - 50} Q-20 ${c.y - 90} 40 ${c.y - 66} Q90 ${c.y - 80} 110 ${c.y - 36} Q170 ${c.y - 36} 160 ${c.y + 20} Z`" fill="#fff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>

    <g filter="url(#cel)" stroke="#1b1033" stroke-linejoin="round">
      <rect v-for="(f, i) in FACADES" :key="`fc${i}`" :x="f.x" :y="f.top" :width="f.w" :height="GROUND - f.top" :fill="f.c" stroke-width="5" />
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <path v-for="(f, i) in FACADES" :key="`rf${i}`" :d="`M${f.x - 14} ${f.top} L${f.x + 30} ${f.top - 60} H${f.x + f.w - 30} L${f.x + f.w + 14} ${f.top} Z`" :fill="f.roof" stroke-width="5" />
      <path :d="WINDOWS" fill="#4a5a9a" stroke-width="4" />
      <path v-for="(f, i) in FACADES" :key="`cn${i}`" :d="`M${f.x} ${f.top + 30} H${f.x + f.w}`" stroke-width="4" />
    </g>

    <g transform="translate(520 780)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-90" y="-500" width="180" height="500" fill="url(#city-sights-tower)" stroke-width="6" filter="url(#cel)" />
      <path d="M-110 -500 H110 V-530 H-110 Z" fill="#fff6e0" stroke-width="5" />
      <path d="M-90 -530 V-560 H-60 V-530 M-30 -530 V-560 H0 V-530 M30 -530 V-560 H60 V-530" fill="#fff6e0" stroke-width="5" />
      <path d="M-80 -560 L0 -720 L80 -560 Z" fill="#2f8a5a" stroke-width="6" />
      <path d="M0 -720 V-760" stroke-width="5" />
      <path d="M0 -800 L9 -778 L32 -776 L14 -762 L20 -740 L0 -752 L-20 -740 L-14 -762 L-32 -776 L-9 -778 Z" fill="#ff4f4f" stroke-width="4" />
      <circle cx="0" cy="-410" r="62" fill="#fffaf0" stroke-width="6" />
      <path v-for="a in TICKS" :key="`tk${a}`" d="M0 -462 V-452" :transform="`rotate(${a} 0 -410)`" stroke-width="4" stroke-linecap="round" />
      <path d="M0 -410 L-24 -430" stroke-width="7" stroke-linecap="round" />
      <g class="city-sights-hand" style="transform-origin: 0 -410px">
        <path d="M0 -404 V-454" stroke-width="5" stroke-linecap="round" />
      </g>
      <circle cx="0" cy="-410" r="6" fill="#ffd23f" stroke-width="3" />
      <path d="M-40 0 V-90 Q0 -140 40 -90 V0 Z" fill="#6a3a2a" stroke-width="5" />
      <path d="M-60 -260 h30 v50 h-30 Z M30 -260 h30 v50 h-30 Z" fill="#4a5a9a" stroke-width="4" />
    </g>

    <path d="M-60 780 H1980 V1200 H-60 Z" fill="url(#city-sights-paving)" />
    <path :d="PAVING" stroke="#a88a6a" stroke-width="3" opacity="0.5" />
    <path d="M-60 840 H1980 M-60 920 H1980 M-60 1030 H1980" stroke="#a88a6a" stroke-width="3" opacity="0.5" />
    <path d="M-60 780 H1980" stroke="#1b1033" stroke-width="5" />

    <g transform="translate(1180 780)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-70" y="-120" width="140" height="120" fill="url(#city-sights-stone)" stroke-width="6" filter="url(#cel-s)" />
      <rect x="-86" y="-140" width="172" height="24" rx="4" fill="#fffaf0" stroke-width="5" />
      <g fill="url(#city-sights-bronze)" stroke-width="5">
        <path d="M-30 -140 L-24 -230 H24 L30 -140 Z" />
        <path d="M-24 -230 Q-26 -290 0 -292 Q26 -290 24 -230 Z" />
        <circle cx="0" cy="-316" r="26" />
        <path d="M18 -270 L70 -340 L82 -330 L30 -256 Z" />
        <path d="M-20 -270 Q-50 -240 -40 -200" fill="none" stroke-width="12" stroke-linecap="round" />
      </g>
      <path d="M-14 -300 Q0 -332 14 -310" stroke="#b6f0e0" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>
    <g>
      <path d="M1174 -12 q-14 -12 -2 -22 q16 -6 22 10 l14 2 l-12 6 q-8 8 -22 4 Z" transform="translate(70 -320)" fill="#c9d4f2" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    </g>

    <g transform="translate(960 1000)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="300" ry="50" fill="url(#city-sights-stone)" stroke-width="6" filter="url(#cel-s)" />
      <ellipse cx="0" cy="30" rx="260" ry="34" fill="url(#city-sights-water)" stroke-width="4" />
      <path d="M-30 30 V-60 H30 V30 Z" fill="url(#city-sights-stone)" stroke-width="5" />
      <ellipse cx="0" cy="-60" rx="90" ry="18" fill="url(#city-sights-stone)" stroke-width="5" />
      <g class="city-sights-jet">
        <path d="M0 -70 Q-10 -160 0 -200 Q10 -160 0 -70 M0 -180 Q-60 -200 -90 -66 M0 -180 Q60 -200 90 -66" stroke="#bff0ff" stroke-width="10" fill="none" stroke-linecap="round" />
      </g>
      <path d="M-200 30 h40 M120 36 h50 M-60 40 h30" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8" />
    </g>

    <g transform="translate(300 1010)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="90" ry="14" fill="#6a4a3a" opacity="0.3" stroke="none" />
      <path d="M-34 40 L-30 -40 H30 L34 40" fill="none" stroke-width="20" stroke-linecap="round" />
      <path d="M-34 40 L-30 -40 H30 L34 40" fill="none" stroke="#3a3a6a" stroke-width="11" stroke-linecap="round" />
      <path d="M-50 -40 Q-60 -160 0 -170 Q60 -160 50 -40 Z" fill="#ff7a3a" stroke-width="6" filter="url(#cel-s)" />
      <circle cx="0" cy="-214" r="46" fill="#ffc890" stroke-width="5" />
      <path d="M-50 -226 Q-40 -280 0 -280 Q40 -280 50 -226 Q0 -246 -50 -226 Z" fill="#5a3a2a" stroke-width="5" />
      <path d="M-16 -214 h0.1 M16 -214 h0.1" stroke-width="10" stroke-linecap="round" />
      <path d="M-18 -192 Q0 -176 18 -192" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M44 -130 L94 -220" stroke-width="20" stroke-linecap="round" />
      <path d="M44 -130 L94 -220" stroke="#ffc890" stroke-width="11" stroke-linecap="round" />
      <path d="M96 -200 L96 -470" stroke-width="10" stroke-linecap="round" />
      <path d="M96 -200 L96 -470" stroke="#e8e0f0" stroke-width="4" stroke-linecap="round" />
      <g class="city-sights-flag" style="transform-origin: 96px -460px">
        <path d="M96 -466 Q150 -490 200 -462 Q250 -436 290 -456 V-376 Q250 -356 200 -382 Q150 -410 96 -386 Z" fill="#ffd23f" stroke-width="6" />
        <circle cx="190" cy="-422" r="18" fill="#e8553f" stroke-width="4" />
      </g>
    </g>

    <g v-for="(t, i) in TOURISTS" :key="`tr${i}`" :transform="`translate(${t.x} 1030) scale(${t.k})`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="40" rx="70" ry="12" fill="#6a4a3a" opacity="0.3" stroke="none" />
      <path d="M-46 60 Q-56 -90 0 -96 Q56 -90 46 60 Z" :fill="t.c" stroke-width="6" />
      <circle cx="0" cy="-140" r="44" fill="#ffc890" stroke-width="5" />
      <path d="M-46 -150 Q-40 -200 0 -200 Q40 -200 46 -150 Q20 -170 -46 -150 Z" :fill="t.hair" stroke-width="5" />
      <path d="M-14 -140 h0.1 M14 -140 h0.1" stroke-width="9" stroke-linecap="round" />
      <path d="M-12 -118 Q0 -108 12 -118" stroke-width="4" fill="none" stroke-linecap="round" />
      <g v-if="i % 2 === 0">
        <rect x="-30" y="-70" width="60" height="40" rx="8" fill="#3a3a5a" stroke-width="4" />
        <circle cx="0" cy="-50" r="12" fill="#9ae0ff" stroke-width="4" />
      </g>
    </g>
    <g class="city-sights-flash">
      <circle cx="1380" cy="980" r="40" fill="#fffbe0" opacity="0.85" />
      <path d="M1380 920 V1040 M1320 980 H1440" stroke="#fffbe0" stroke-width="8" stroke-linecap="round" />
    </g>

    <g v-for="(p, i) in PIGEONS" :key="`pg${i}`" :transform="`translate(${p.x} ${p.y}) scale(${p.s} 1)`">
      <g :class="i % 2 ? 'city-sights-peck late' : 'city-sights-peck'">
        <path d="M-30 0 Q-34 -30 0 -32 Q16 -50 30 -40 L44 -34 L30 -30 Q34 -6 10 0 Z" fill="#c9d4f2" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-20 -14 Q0 -24 14 -12" stroke="#8b9dd8" stroke-width="5" fill="none" stroke-linecap="round" />
        <circle cx="26" cy="-38" r="3.5" fill="#1b1033" />
        <path d="M-4 0 V12 M8 0 V12" stroke="#e8553f" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.city-sights-cloud {
  animation: city-sights-cloud linear infinite;
}

.city-sights-hand {
  animation: city-sights-spin 60s linear infinite;
}

.city-sights-jet {
  animation: city-sights-jet 0.6s ease-in-out infinite alternate;
}

.city-sights-flag {
  animation: city-sights-flag 1.6s ease-in-out infinite alternate;
}

.city-sights-flash {
  opacity: 0;
  animation: city-sights-flash 5s steps(1) infinite;
}

.city-sights-peck {
  transform-origin: 0 0;
  animation: city-sights-peck 2.4s ease-in-out infinite;
}

.city-sights-peck.late {
  animation-delay: -1.1s;
}

@keyframes city-sights-cloud {
  from {
    translate: -300px 0;
  }
  to {
    translate: 2250px 0;
  }
}

@keyframes city-sights-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes city-sights-jet {
  from {
    opacity: 0.6;
    translate: 0 6px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes city-sights-flag {
  from {
    scale: 1 1;
  }
  to {
    scale: 0.9 1.06;
  }
}

@keyframes city-sights-flash {
  0%,
  88% {
    opacity: 0;
  }
  90% {
    opacity: 1;
  }
  93% {
    opacity: 0;
  }
}

@keyframes city-sights-peck {
  0%,
  50%,
  100% {
    rotate: 0deg;
  }
  60%,
  80% {
    rotate: 24deg;
  }
}
</style>
