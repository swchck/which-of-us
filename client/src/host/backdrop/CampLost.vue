<script setup lang="ts">
import { seeded, strokeText, tufts } from './kit';

const rnd = seeded(907);
const f1 = (n: number) => n.toFixed(1);

const trunk = (x: number, w: number, top: number, base: number, lean: number) =>
  `M${f1(x - w / 2)} ${base} Q${f1(x - w / 2 + lean)} ${f1((top + base) / 2)} ${f1(x - w * 0.4 + lean * 1.6)} ${top} H${f1(x + w * 0.4 + lean * 1.6)} Q${f1(x + w / 2 + lean)} ${f1((top + base) / 2)} ${f1(x + w / 2)} ${base} Z`;
const FAR = Array.from({ length: 22 }, (_, i) => trunk(-40 + i * 92 + rnd() * 40, 26 + rnd() * 14, -60, 720, (rnd() - 0.5) * 20)).join(' ');
const MID = Array.from({ length: 12 }, (_, i) => trunk(-20 + i * 175 + rnd() * 60, 50 + rnd() * 20, -60, 820, (rnd() - 0.5) * 40)).join(' ');
const NEAR = [trunk(60, 190, -60, 1140, 30), trunk(330, 110, -60, 1000, -20), trunk(1860, 210, -60, 1140, -30), trunk(1640, 100, -60, 980, 20)].join(' ');
const CANOPY = Array.from({ length: 16 }, (_, i) => {
  const x = -60 + i * 136;
  const y = 40 + (i % 3) * 40;
  return `M${x - 120} ${y} Q${x - 100} ${y - 120} ${x} ${y - 110} Q${x + 100} ${y - 130} ${x + 140} ${y + 10} Q${x + 60} ${y + 70} ${x} ${y + 40} Q${x - 60} ${y + 80} ${x - 120} ${y} Z`;
}).join(' ');
const FOG = [
  { y: 560, d: 0, s: 26, o: 0.32 },
  { y: 700, d: 9, s: 34, o: 0.4 },
  { y: 850, d: 4, s: 30, o: 0.3 },
];
const ARROWS = [
  { a: -80, y: -380, c: '#7ed06a', t: '?', flip: false },
  { a: -10, y: -330, c: '#ffd23f', t: 'Туда', flip: false },
  { a: 192, y: -270, c: '#ff8a5a', t: 'Сюда', flip: true },
  { a: 18, y: -200, c: '#b07aff', t: '!?', flip: false },
  { a: 160, y: -140, c: '#5ad0ff', t: '??', flip: true },
];
const LABELS = ARROWS.map((a) => strokeText(a.t, 96, 14, 28, 'middle'));
const STEPS = Array.from({ length: 12 }, (_, i) => {
  const t = (i / 12) * Math.PI * 2;
  return { x: 960 + Math.cos(t) * 300, y: 990 + Math.sin(t) * 60, a: (t * 180) / Math.PI + 90, s: i % 2 ? 1 : -1 };
});
const FLIES = [0, 1, 2].map(() => Array.from({ length: 6 }, () => ({ x: 120 + rnd() * 1680, y: 300 + rnd() * 600 })));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="camp-lost-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0d1a3a" />
        <stop offset="60%" stop-color="#244a5e" />
        <stop offset="100%" stop-color="#3c6a6e" />
      </linearGradient>
      <linearGradient id="camp-lost-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2f6060" />
        <stop offset="100%" stop-color="#14283a" />
      </linearGradient>
      <linearGradient id="camp-lost-bark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#4a3a5a" />
        <stop offset="100%" stop-color="#241a34" />
      </linearGradient>
      <linearGradient id="camp-lost-fog" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d8f0ff" stop-opacity="0" />
        <stop offset="50%" stop-color="#d8f0ff" stop-opacity="1" />
        <stop offset="100%" stop-color="#d8f0ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="camp-lost-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c4925a" />
        <stop offset="100%" stop-color="#7a4a2a" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#camp-lost-sky)" />
    <circle cx="1240" cy="120" r="70" fill="#fff4c2" opacity="0.18" />
    <circle cx="1240" cy="120" r="44" fill="#fff4c2" opacity="0.5" />
    <path :d="FAR" fill="#3a5a6e" opacity="0.8" />
    <rect x="-60" y="380" width="2040" height="340" fill="url(#camp-lost-fog)" opacity="0.18" />
    <path :d="MID" fill="#2a3a52" stroke="#1b2a3a" stroke-width="4" />
    <path d="M-60 760 Q480 730 960 750 Q1440 770 1980 740 L1980 1200 L-60 1200 Z" fill="url(#camp-lost-ground)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M700 1200 Q820 960 940 800 Q960 780 980 800 Q1100 960 1220 1200 Z M940 820 Q760 800 520 860 M980 820 Q1180 800 1420 850" fill="#5a7a7a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" opacity="0.7" />
    <path :d="tufts(30, 760, 1900, 0.013)" stroke="#5a9a8a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />

    <g stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path v-for="(s, i) in STEPS" :key="`st${i}`" :d="`M${f1(s.x)} ${f1(s.y)} m-8 -12 q8 -6 16 0 q4 14 -8 24 q-12 -10 -8 -24 Z`" :transform="`rotate(${f1(s.a)} ${f1(s.x)} ${f1(s.y)}) translate(${s.s * 10} 0)`" fill="#24413e" stroke="none" opacity="0.7" />
    </g>

    <g v-for="(f, i) in FOG" :key="`fg${i}`" class="camp-lost-fog" :style="{ animationDuration: `${f.s}s`, animationDelay: `-${f.d}s` }">
      <path :d="`M-400 ${f.y} Q0 ${f.y - 70} 400 ${f.y - 20} Q800 ${f.y - 80} 1200 ${f.y - 20} Q1600 ${f.y - 70} 2000 ${f.y - 20} Q2400 ${f.y - 80} 2800 ${f.y} Q2400 ${f.y + 60} 2000 ${f.y + 30} Q1600 ${f.y + 70} 1200 ${f.y + 30} Q800 ${f.y + 70} 400 ${f.y + 30} Q0 ${f.y + 60} -400 ${f.y} Z`" fill="#d8f0ff" :opacity="f.o" />
    </g>

    <path :d="NEAR" fill="url(#camp-lost-bark)" stroke="#120a20" stroke-width="6" filter="url(#cel)" />
    <path d="M40 200 q20 40 0 80 M80 500 q-16 30 0 60 M1860 300 q20 40 0 80 M1830 700 q-16 30 0 60 M340 300 q10 30 0 60" stroke="#6a5a7a" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7" />
    <path :d="CANOPY" fill="#1a3a3a" stroke="#0e1a24" stroke-width="5" stroke-linejoin="round" />

    <g transform="translate(330 380)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-80 30 Q-20 10 70 34" stroke-width="16" stroke-linecap="round" fill="none" />
      <path d="M-80 30 Q-20 10 70 34" stroke="#5a4a6a" stroke-width="8" stroke-linecap="round" fill="none" />
      <path d="M-34 24 Q-44 -30 -26 -60 L-34 -84 L-12 -66 Q0 -70 12 -66 L34 -84 L26 -60 Q44 -30 34 24 Z" fill="#8a6a4a" stroke-width="5" />
      <path d="M-20 20 Q-22 -10 0 -14 Q22 -10 20 20 Z" fill="#e8c890" stroke-width="3" />
      <circle cx="-13" cy="-42" r="13" fill="#fffbe0" stroke-width="4" />
      <circle cx="13" cy="-42" r="13" fill="#fffbe0" stroke-width="4" />
      <circle cx="-11" cy="-40" r="6" fill="#1b1033" stroke="none" />
      <circle cx="15" cy="-40" r="6" fill="#1b1033" stroke="none" />
      <path d="M-4 -30 L0 -22 L4 -30 Z" fill="#ffb02e" stroke-width="3" />
      <g class="camp-lost-blink">
        <circle cx="-13" cy="-42" r="14" fill="#8a6a4a" stroke-width="4" />
        <circle cx="13" cy="-42" r="14" fill="#8a6a4a" stroke-width="4" />
      </g>
    </g>

    <g transform="translate(1460 980)">
      <ellipse cx="0" cy="10" rx="120" ry="16" fill="#0a1420" opacity="0.4" />
      <g transform="rotate(4)">
        <path d="M0 10 V-390" stroke="#1b1033" stroke-width="30" stroke-linecap="round" />
        <path d="M0 10 V-390" stroke="#a8703e" stroke-width="18" stroke-linecap="round" />
        <g v-for="(a, i) in ARROWS" :key="`ar${i}`" :transform="`translate(0 ${a.y}) rotate(${a.a})`">
          <g :class="i % 2 ? 'camp-lost-wobble late' : 'camp-lost-wobble'">
            <path d="M6 -26 H170 L206 0 L170 26 H6 Z" :fill="a.c" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
            <path d="M18 -14 H150" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.5" />
            <g :transform="a.flip ? 'rotate(180 96 0)' : ''">
              <path :d="LABELS[i]" fill="none" stroke="#1b1033" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
            </g>
          </g>
        </g>
        <circle cx="0" cy="-392" r="12" fill="#8a5a3a" stroke="#1b1033" stroke-width="4" />
      </g>
      <g stroke="#1b1033" stroke-linejoin="round">
        <path d="M-90 10 Q-96 -30 -70 -34 Q-40 -30 -50 10 Z" fill="#fffaf0" stroke-width="4" />
        <path d="M-110 -30 Q-70 -80 -30 -30 Z" fill="#e8553f" stroke-width="5" />
        <circle cx="-80" cy="-46" r="6" fill="#fff" stroke="none" />
        <circle cx="-56" cy="-40" r="4" fill="#fff" stroke="none" />
      </g>
    </g>

    <g fill="#0f2a2a" stroke="#06141a" stroke-width="6" stroke-linejoin="round">
      <path d="M-60 1200 Q-40 960 120 950 Q170 890 260 920 Q350 920 360 1000 Q420 1020 400 1200 Z" />
      <path d="M1980 1200 Q1960 980 1820 980 Q1760 930 1680 970 Q1600 980 1610 1060 Q1560 1100 1580 1200 Z" />
    </g>
    <g class="camp-lost-eyes" fill="#fff59b">
      <ellipse cx="200" cy="1010" rx="9" ry="12" />
      <ellipse cx="236" cy="1010" rx="9" ry="12" />
      <ellipse cx="1720" cy="1030" rx="8" ry="11" />
      <ellipse cx="1752" cy="1030" rx="8" ry="11" />
    </g>

    <g v-for="(g, gi) in FLIES" :key="`fl${gi}`" class="camp-lost-flies" :style="{ animationDuration: `${5 + gi * 1.7}s`, animationDelay: `-${gi * 1.3}s` }">
      <g v-for="(f, i) in g" :key="i">
        <circle :cx="f.x" :cy="f.y" r="14" fill="#fff59b" opacity="0.25" />
        <circle :cx="f.x" :cy="f.y" r="5" fill="#fffbd0" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.camp-lost-fog {
  animation: camp-lost-fog linear infinite alternate;
}

.camp-lost-wobble {
  transform-origin: 6px 0;
  animation: camp-lost-wobble 3.6s ease-in-out infinite alternate;
}

.camp-lost-wobble.late {
  animation-delay: -1.8s;
}

.camp-lost-blink {
  opacity: 0;
  animation: camp-lost-blink 4.5s steps(1) infinite;
}

.camp-lost-eyes {
  animation: camp-lost-eyes 6s steps(1) infinite;
}

.camp-lost-flies {
  animation: camp-lost-flies ease-in-out infinite;
}

@keyframes camp-lost-fog {
  from {
    translate: -360px 0;
  }
  to {
    translate: 0 0;
  }
}

@keyframes camp-lost-wobble {
  from {
    rotate: -4deg;
  }
  to {
    rotate: 4deg;
  }
}

@keyframes camp-lost-blink {
  0%,
  92% {
    opacity: 0;
  }
  94%,
  97% {
    opacity: 1;
  }
}

@keyframes camp-lost-eyes {
  0%,
  44%,
  48%,
  100% {
    opacity: 1;
  }
  46% {
    opacity: 0;
  }
}

@keyframes camp-lost-flies {
  0%,
  100% {
    translate: 0 0;
    opacity: 0.2;
  }
  50% {
    translate: 30px -36px;
    opacity: 1;
  }
}
</style>
