<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(612);
const f1 = (n: number) => n.toFixed(1);

const acacia = (x: number, y: number, k: number) => ({ x, y, k });
const FAR_ACACIAS = [acacia(560, 700, 0.35), acacia(1180, 690, 0.3), acacia(860, 705, 0.22)];
const GRASS = Array.from({ length: 60 }, () => {
  const x = rnd() * 2000 - 40;
  const y = 760 + rnd() * 380;
  const h = 14 + (y - 740) * 0.08;
  return `M${f1(x - 8)} ${f1(y)} L${f1(x - 4)} ${f1(y - h)} M${f1(x)} ${f1(y)} L${f1(x + 2)} ${f1(y - h * 1.3)} M${f1(x + 8)} ${f1(y)} L${f1(x + 7)} ${f1(y - h * 0.9)}`;
}).join(' ');
const GIRAFFES = [
  { x: 1520, y: 820, k: 1, d: 0 },
  { x: 1740, y: 860, k: 0.78, d: -1.6 },
];
const BIRDS = [0, 60, 120];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="jungle-safari-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff9a5a" />
        <stop offset="55%" stop-color="#ffc86a" />
        <stop offset="100%" stop-color="#fff0b0" />
      </linearGradient>
      <radialGradient id="jungle-safari-sun">
        <stop offset="0%" stop-color="#fffbe0" />
        <stop offset="70%" stop-color="#ffe07a" />
        <stop offset="100%" stop-color="#ffb84a" />
      </radialGradient>
      <radialGradient id="jungle-safari-halo">
        <stop offset="0%" stop-color="#fff0b0" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#fff0b0" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="jungle-safari-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f4c45a" />
        <stop offset="60%" stop-color="#d89a3a" />
        <stop offset="100%" stop-color="#a86a2a" />
      </linearGradient>
      <linearGradient id="jungle-safari-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8a06a" />
        <stop offset="100%" stop-color="#d88a5a" />
      </linearGradient>
      <linearGradient id="jungle-safari-jeep" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8ac04a" />
        <stop offset="100%" stop-color="#4a8a2a" />
      </linearGradient>
      <linearGradient id="jungle-safari-giraffe" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffd27a" />
        <stop offset="100%" stop-color="#f0a83a" />
      </linearGradient>
      <linearGradient id="jungle-safari-leaf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6cc04a" />
        <stop offset="100%" stop-color="#2f7a3a" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#jungle-safari-sky)" />
    <circle cx="420" cy="380" r="300" fill="url(#jungle-safari-halo)" class="jungle-safari-halo" />
    <circle cx="420" cy="380" r="150" fill="url(#jungle-safari-sun)" stroke="#1b1033" stroke-width="5" />
    <path d="M1200 200 Q1240 170 1300 180 Q1340 150 1400 176 Q1460 172 1480 200 Z M120 120 Q150 100 200 106 Q230 86 280 104 L280 120 Z" fill="#fff4d6" stroke="#e8a06a" stroke-width="3" stroke-linejoin="round" />
    <g class="jungle-safari-birds">
      <path v-for="(b, i) in BIRDS" :key="`bd${i}`" :d="`M${b - 16} ${260 + (i % 2) * 24} q8 -12 16 0 q8 -12 16 0`" stroke="#5a2a3a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <path d="M-60 690 Q200 600 420 640 Q620 560 860 650 Q1100 610 1300 660 Q1500 590 1700 640 Q1860 610 1980 650 V760 H-60 Z" fill="url(#jungle-safari-far)" stroke="#c07a4a" stroke-width="3" stroke-linejoin="round" />
    <g v-for="(a, i) in FAR_ACACIAS" :key="`fa${i}`" :transform="`translate(${a.x} ${a.y}) scale(${a.k})`" fill="#a8603a">
      <path d="M-8 0 L-4 -160 Q-60 -200 -120 -220 L-110 -232 Q-40 -214 0 -180 Q40 -214 110 -232 L120 -220 Q60 -200 4 -160 L8 0 Z" />
      <path d="M-240 -220 Q-200 -290 -60 -280 Q0 -320 80 -290 Q220 -300 260 -230 Q120 -200 0 -210 Q-120 -200 -240 -220 Z" />
    </g>
    <path d="M300 700 q14 -30 40 -30 q16 -20 34 0 h30 q10 30 -4 30 Z M1340 696 q10 -24 30 -24 q12 -14 24 0 h20 q8 22 -4 24 Z" fill="#8a4a3a" opacity="0.6" />

    <path d="M-60 740 Q480 720 960 740 Q1440 760 1980 730 L1980 1200 L-60 1200 Z" fill="url(#jungle-safari-ground)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="GRASS" stroke="#b07a2a" stroke-width="4" fill="none" stroke-linecap="round" />

    <g transform="translate(1500 760) scale(1.1)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M0 0 L6 -260 Q-80 -320 -200 -340 L-190 -356 Q-60 -330 10 -290 Q60 -340 180 -360 L190 -346 Q80 -320 26 -260 L34 0 Z" fill="#8a5a3a" stroke-width="6" />
      <path d="M-380 -340 Q-330 -440 -120 -430 Q-20 -480 120 -440 Q340 -450 400 -350 Q200 -310 20 -320 Q-180 -306 -380 -340 Z" fill="url(#jungle-safari-leaf)" stroke-width="6" filter="url(#cel)" />
      <path d="M-300 -370 Q-200 -420 -60 -410 M60 -420 Q200 -430 320 -380" stroke="#b6ec8a" stroke-width="6" fill="none" stroke-linecap="round" />
    </g>

    <g v-for="(g, gi) in GIRAFFES" :key="`gf${gi}`" :transform="`translate(${g.x} ${g.y}) scale(${g.k})`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="8" rx="120" ry="14" fill="#6a3a1a" opacity="0.3" stroke="none" />
      <path d="M-70 -150 L-80 0 M-30 -150 L-34 0 M40 -150 L46 0 M80 -150 L84 0" stroke-width="30" stroke-linecap="round" />
      <path d="M-70 -150 L-80 0 M-30 -150 L-34 0 M40 -150 L46 0 M80 -150 L84 0" stroke="#ffd27a" stroke-width="19" stroke-linecap="round" />
      <path d="M-100 -150 Q-110 -230 -20 -236 L60 -240 Q110 -236 104 -160 Q90 -126 0 -130 Q-80 -126 -100 -150 Z" fill="url(#jungle-safari-giraffe)" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-100 -180 Q-130 -170 -140 -130" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-50 -210 l14 -6 l6 14 l-14 6 Z M0 -180 l16 -4 l4 16 l-16 4 Z M40 -220 l14 -2 l2 14 l-14 2 Z M66 -170 l12 -4 l4 12 l-12 4 Z M-60 -160 l12 0 l0 12 l-12 0 Z" fill="#b86a2a" stroke="none" />
      <g class="jungle-safari-neck" :style="{ animationDelay: `${g.d}s` }">
        <path d="M50 -220 L100 -480 Q104 -500 124 -500 L140 -496 Q150 -480 144 -460 L104 -210 Z" fill="url(#jungle-safari-giraffe)" stroke-width="6" />
        <path d="M104 -470 L64 -230" stroke="#b86a2a" stroke-width="10" stroke-dasharray="14 10" />
        <g transform="translate(140 -500) rotate(18) scale(1.45)">
          <path d="M-30 -24 Q0 -40 40 -16 Q70 -4 64 14 Q40 30 0 22 Q-34 16 -30 -24 Z" fill="url(#jungle-safari-giraffe)" stroke-width="5" />
          <path d="M-14 -30 V-56 M8 -32 V-58" stroke-width="5" stroke-linecap="round" />
          <circle cx="-14" cy="-60" r="7" fill="#b86a2a" stroke-width="4" />
          <circle cx="8" cy="-62" r="7" fill="#b86a2a" stroke-width="4" />
          <path d="M-30 -20 Q-50 -30 -54 -12 Q-44 -6 -30 -12 Z" fill="#ffd27a" stroke-width="4" />
          <circle cx="16" cy="-12" r="5" fill="#1b1033" stroke="none" />
          <path d="M48 6 h0.1 M56 2 h0.1" stroke-width="5" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <g transform="translate(560 960)">
      <g class="jungle-safari-idle">
        <ellipse cx="20" cy="70" rx="340" ry="22" fill="#6a3a1a" opacity="0.35" />
        <g stroke="#1b1033" stroke-linejoin="round">
          <path d="M-250 -150 V-250 H170 V-150" stroke-width="16" fill="none" stroke-linecap="round" />
          <path d="M-250 -150 V-250 H170 V-150" stroke="#e8e0f0" stroke-width="8" fill="none" stroke-linecap="round" />
          <path d="M-300 30 V-100 Q-300 -150 -250 -150 H40 L120 -140 Q140 -80 300 -70 Q340 -66 340 -20 V30 Z" fill="url(#jungle-safari-jeep)" stroke-width="7" filter="url(#cel)" />
          <path d="M60 -150 L110 -230" stroke-width="10" stroke-linecap="round" />
          <path d="M80 -146 L136 -236 H160 L110 -146 Z" fill="#bfe6ff" stroke-width="5" />
          <path d="M-270 -110 h120 v70 h-120 Z M-120 -110 h130 v70 h-130 Z" fill="#6aa83a" stroke-width="4" />
          <path d="M-250 -70 l14 -24 l16 18 l-14 26 Z M-90 -96 l20 -10 l10 24 l-20 10 Z M-40 -64 l18 -18 l14 20 l-18 16 Z" fill="#3f6a2a" stroke="none" />
          <rect x="300" y="-50" width="44" height="22" rx="8" fill="#fff6a0" stroke-width="4" />
          <path d="M-300 0 H340" stroke-width="5" />
          <circle cx="-180" cy="40" r="62" fill="#2a2240" stroke-width="7" />
          <circle cx="-180" cy="40" r="26" fill="#c9d4f2" stroke-width="5" />
          <circle cx="200" cy="40" r="62" fill="#2a2240" stroke-width="7" />
          <circle cx="200" cy="40" r="26" fill="#c9d4f2" stroke-width="5" />
          <path d="M-320 -80 V-16 Q-354 -16 -350 -48 Q-354 -80 -320 -80 Z" fill="#2a2240" stroke-width="5" />
        </g>
        <g stroke="#1b1033" stroke-linejoin="round" transform="translate(-60 -150)">
          <path d="M-40 0 Q-40 -70 0 -70 Q40 -70 40 0 Z" fill="#e0b070" stroke-width="5" />
          <circle cx="0" cy="-104" r="40" fill="#ffc890" stroke-width="5" />
          <path d="M-60 -116 Q-50 -170 0 -170 Q50 -170 60 -116 Q0 -100 -60 -116 Z" fill="#f4e0a0" stroke-width="5" />
          <path d="M-76 -116 H76" stroke-width="10" stroke-linecap="round" />
          <path d="M-76 -116 H76" stroke="#f4e0a0" stroke-width="4" stroke-linecap="round" />
          <rect x="-34" y="-112" width="30" height="24" rx="8" fill="#3a3a5a" stroke-width="4" />
          <rect x="4" y="-112" width="30" height="24" rx="8" fill="#3a3a5a" stroke-width="4" />
          <path d="M-30 -90 L-40 -40 M30 -90 L40 -40" stroke-width="10" stroke-linecap="round" />
          <path d="M-30 -90 L-40 -40 M30 -90 L40 -40" stroke="#ffc890" stroke-width="5" stroke-linecap="round" />
        </g>
      </g>
      <g class="jungle-safari-dust">
        <circle cx="-380" cy="40" r="26" fill="#f4d090" opacity="0.6" />
        <circle cx="-420" cy="20" r="18" fill="#f4d090" opacity="0.5" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round" filter="url(#cel)">
      <path d="M-60 1200 Q-60 980 60 960 Q120 900 200 940 Q260 900 300 980 Q320 1100 280 1200 Z" fill="#4f9a3a" stroke-width="6" />
      <path d="M1980 1200 Q1980 960 1860 950 Q1800 890 1720 940 Q1660 930 1650 1010 Q1620 1100 1660 1200 Z" fill="#4f9a3a" stroke-width="6" />
    </g>
    <path d="M40 1000 Q80 970 120 976 M1760 980 Q1800 960 1840 966" stroke="#9ad06a" stroke-width="6" fill="none" stroke-linecap="round" />
    <g class="jungle-safari-butterfly">
      <path d="M0 0 q-20 -26 -30 -4 q10 18 30 4 q20 -26 30 -4 q-10 18 -30 4 Z" transform="translate(1080 860)" fill="#ff7ab0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    </g>
  </g>
</template>

<style scoped>
.jungle-safari-halo {
  transform-box: fill-box;
  transform-origin: center;
  animation: jungle-safari-halo 5s ease-in-out infinite alternate;
}

.jungle-safari-neck {
  transform-origin: 70px -220px;
  animation: jungle-safari-neck 4s ease-in-out infinite alternate;
}

.jungle-safari-idle {
  animation: jungle-safari-idle 0.24s ease-in-out infinite alternate;
}

.jungle-safari-dust {
  animation: jungle-safari-dust 1.6s ease-out infinite;
}

.jungle-safari-birds {
  animation: jungle-safari-birds 34s linear infinite;
}

.jungle-safari-butterfly {
  animation: jungle-safari-flutter 6s ease-in-out infinite alternate;
}

@keyframes jungle-safari-halo {
  from {
    scale: 0.92;
  }
  to {
    scale: 1.06;
  }
}

@keyframes jungle-safari-neck {
  from {
    rotate: -4deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes jungle-safari-idle {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 2px;
  }
}

@keyframes jungle-safari-dust {
  from {
    translate: 0 0;
    opacity: 0.8;
  }
  to {
    translate: -60px -30px;
    opacity: 0;
  }
}

@keyframes jungle-safari-birds {
  from {
    translate: 2100px 0;
  }
  to {
    translate: -300px -60px;
  }
}

@keyframes jungle-safari-flutter {
  0% {
    translate: 0 0;
  }
  50% {
    translate: -120px -60px;
  }
  100% {
    translate: -260px 10px;
  }
}
</style>
