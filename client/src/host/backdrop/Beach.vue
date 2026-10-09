<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(271);
const GULLS = Array.from({ length: 3 }, (_, i) => ({
  y: 150 + i * 90 + rnd() * 40,
  k: 1 - i * 0.2,
  d: rnd() * 20,
  s: 20 + rnd() * 10,
}));
const WAVES = [0, 1, 2];
const CLOUDS = Array.from({ length: 3 }, (_, i) => ({ y: 110 + i * 80 + rnd() * 30, k: 0.8 + rnd() * 0.5, d: rnd() * 60, s: 60 + rnd() * 30 }));
const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);
const GLINTS = Array.from({ length: 9 }, (_, i) => ({ x: 1560 + (rnd() - 0.5) * 160, y: 660 + i * 18, w: 30 + rnd() * 50 }));
const FAR_PALMS = [180, 250, 420];
const RIPPLES = Array.from({ length: 14 }, () => ({ x: 60 + rnd() * 1800, y: 900 + rnd() * 160 }));
const PALMS = [
  { x: 170, y: 1010, flip: 1, k: 1, d: 0 },
  { x: 1810, y: 960, flip: -1, k: 0.8, d: 2.4 },
];
const FROND = 'M0 0 Q-120 -90 -250 16 L-218 8 L-206 34 L-180 6 L-162 36 L-136 0 L-114 30 L-92 -6 L-66 18 Q-34 -12 0 0 Z';
const FRONDS = [
  { r: 0, sx: 1 },
  { r: 0, sx: -1 },
  { r: 38, sx: 1 },
  { r: -38, sx: -1 },
  { r: -34, sx: 1 },
  { r: 34, sx: -1 },
  { r: 78, sx: 1 },
];
const UMBRELLA = Array.from({ length: 5 }, (_, i) => {
  const x0 = -200 + i * 80;
  const x1 = x0 + 80;
  return { d: `M0 -80 Q${x0 * 0.85} -50 ${x0} 50 Q${x0 + 40} 70 ${x1} 50 Q${x1 * 0.85} -50 0 -80 Z`, c: i % 2 ? '#fffaf0' : '#ff4f8b' };
});
</script>

<template>
  <g>
    <defs>
      <radialGradient id="beach-sun" cx="38%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#fffbe0" />
        <stop offset="100%" stop-color="#ffd23f" />
      </radialGradient>
      <linearGradient id="beach-cloud" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#cfe9fb" />
      </linearGradient>
      <linearGradient id="beach-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1f6fc0" />
        <stop offset="55%" stop-color="#22a4d6" />
        <stop offset="100%" stop-color="#4fdcd4" />
      </linearGradient>
      <linearGradient id="beach-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e9f8ff" stop-opacity="0" />
        <stop offset="60%" stop-color="#e9f8ff" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#e9f8ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="beach-sand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe7a8" />
        <stop offset="100%" stop-color="#f4c77a" />
      </linearGradient>
      <linearGradient id="beach-sand-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f6cc84" />
        <stop offset="100%" stop-color="#e2a25a" />
      </linearGradient>
      <linearGradient id="beach-castle" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0%" stop-color="#ffdc94" />
        <stop offset="100%" stop-color="#d9a256" />
      </linearGradient>
    </defs>

    <g opacity="0.16" fill="#fff6b0">
      <path v-for="a in RAYS" :key="`ray${a}`" d="M1620 180 L1596 -110 L1644 -110 Z" :transform="`rotate(${a} 1620 180)`" />
    </g>
    <circle cx="1620" cy="180" r="150" fill="#fff3a0" opacity="0.3" class="glow" />
    <circle cx="1620" cy="180" r="95" fill="url(#beach-sun)" stroke="#1b1033" stroke-width="5" />
    <path d="M1562 150 Q1576 118 1610 106" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.9" />

    <g v-for="(c, i) in CLOUDS" :key="`bc${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-140 20 Q-160 -14 -116 -22 Q-110 -64 -56 -56 Q-30 -100 30 -80 Q80 -100 104 -50 Q156 -50 150 20 Z" fill="url(#beach-cloud)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-120 12 Q-40 22 40 10 Q100 2 136 12" stroke="#a9cfee" stroke-width="7" fill="none" stroke-linecap="round" />
        <path d="M-94 -30 Q-86 -50 -60 -48 M-18 -70 Q10 -86 40 -72" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="(g, i) in GULLS" :key="`g${i}`" class="gull" :style="{ animationDelay: `-${g.d}s`, animationDuration: `${g.s}s` }">
      <g :transform="`translate(0 ${g.y}) scale(${g.k})`">
        <path d="M-40 4 Q-22 -20 0 2 Q22 -20 40 4" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M-40 4 Q-22 -20 0 2 Q22 -20 40 4" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M0 2 L6 8" stroke="#ffa53b" stroke-width="5" stroke-linecap="round" />
      </g>
    </g>

    <rect x="-60" y="630" width="2040" height="320" fill="url(#beach-sea)" />
    <path d="M-60 640 Q60 560 160 580 Q240 520 340 560 Q440 550 540 600 Q600 620 640 640 Z" fill="#78c2b0" stroke="#4f9ca8" stroke-width="3" stroke-linejoin="round" />
    <path d="M140 590 Q200 570 260 576 M330 566 Q380 560 420 572" stroke="#a6dccb" stroke-width="4" fill="none" stroke-linecap="round" />
    <g v-for="x in FAR_PALMS" :key="`fp${x}`" :transform="`translate(${x} 0)`" stroke="#4f9ca8" stroke-width="5" fill="none" stroke-linecap="round">
      <path d="M0 586 Q4 560 -4 530" />
      <path d="M-4 530 Q-24 520 -36 534 M-4 530 Q16 518 30 532 M-4 530 Q-10 512 -24 508 M-4 530 Q8 512 20 510" />
    </g>
    <path d="M1390 640 Q1430 606 1490 612 Q1550 596 1610 610 Q1670 610 1730 640 Z" fill="#8aa6b8" stroke="#5f84a0" stroke-width="3" stroke-linejoin="round" />
    <path d="M1540 612 L1548 520 L1580 520 L1588 612 Z" fill="#f4f0ff" stroke="#5f84a0" stroke-width="3" stroke-linejoin="round" />
    <path d="M1544 570 L1584 570 L1585 588 L1543 588 Z M1546 536 L1582 536 L1583 552 L1545 552 Z" fill="#ff8a9a" />
    <path d="M1542 520 L1586 520 L1564 494 Z" fill="#ff8a9a" stroke="#5f84a0" stroke-width="3" stroke-linejoin="round" />
    <rect x="-60" y="580" width="2040" height="120" fill="url(#beach-haze)" />

    <g stroke="#fffbe8" stroke-width="5" stroke-linecap="round" opacity="0.7">
      <path v-for="(t, i) in GLINTS" :key="`gl${i}`" :d="`M${t.x - t.w / 2} ${t.y} h${t.w}`" />
    </g>
    <g class="boat">
      <g transform="translate(0 662)">
        <path d="M-56 -12 L56 -12 L40 12 L-40 12 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-50 -2 L50 -2" stroke="#ff4f8b" stroke-width="5" />
        <path d="M0 -14 V-104" stroke="#1b1033" stroke-width="5" />
        <path d="M4 -100 L52 -20 L4 -20 Z" fill="#ff4f8b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-4 -88 L-4 -20 L-40 -20 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      </g>
    </g>
    <path
      v-for="w in WAVES"
      :key="`wave${w}`"
      :d="`M-200 ${700 + w * 60} q50 -14 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0`"
      stroke="#d8f6ff"
      :stroke-width="4 + w * 2"
      stroke-dasharray="120 80"
      fill="none"
      stroke-linecap="round"
      class="wave"
      :style="{ animationDelay: `-${w * 1.3}s`, opacity: 0.5 + w * 0.2 }"
    />

    <path d="M-60 878 Q480 838 960 866 Q1440 894 1980 846 L1980 1140 L-60 1140 Z" fill="url(#beach-sand)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M-60 890 Q480 850 960 878 Q1440 906 1980 858" stroke="#e2b26a" stroke-width="14" fill="none" opacity="0.55" />
    <path d="M-60 872 Q20 854 100 868 T260 862 T420 852 T580 850 T740 856 T900 864 T1060 870 T1220 878 T1380 880 T1540 874 T1700 862 T1860 852 T2020 846" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9" />
    <path v-for="(r, i) in RIPPLES" :key="`rp${i}`" :d="`M${r.x} ${r.y} q16 -8 32 0`" stroke="#d9a660" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />

    <g transform="translate(1430 945)">
      <ellipse cx="-20" cy="10" rx="190" ry="26" fill="#8a5a20" opacity="0.25" />
      <path d="M-220 0 L-40 -24 L30 8 L-150 34 Z" fill="#22d3ee" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-184 -4 L-114 30 M-136 -12 L-66 22 M-88 -18 L-18 16" stroke="#fffaf0" stroke-width="12" />
      <g filter="url(#cel-s)">
        <rect x="60" y="-40" width="110" height="70" rx="10" fill="#2e8bff" stroke="#1b1033" stroke-width="5" />
        <rect x="52" y="-56" width="126" height="26" rx="8" fill="#fffaf0" stroke="#1b1033" stroke-width="5" />
      </g>
      <path d="M90 -60 Q115 -82 140 -60" stroke="#1b1033" stroke-width="6" fill="none" />
      <path d="M0 20 L-6 -320" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
      <path d="M0 20 L-6 -320" stroke="#fffaf0" stroke-width="6" stroke-linecap="round" />
      <g transform="translate(-6 -250)">
        <path v-for="(u, i) in UMBRELLA" :key="`um${i}`" :d="u.d" :fill="u.c" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M-130 0 Q-90 -50 -30 -66" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />
        <circle cx="0" cy="-82" r="9" fill="#ffd23f" stroke="#1b1033" stroke-width="4" />
      </g>
    </g>

    <g v-for="(p, i) in PALMS" :key="`pm${i}`" :transform="`translate(${p.x} ${p.y}) scale(${p.flip * p.k} ${p.k})`">
      <ellipse cx="60" cy="8" rx="120" ry="16" fill="#8a5a20" opacity="0.3" />
      <g class="beach-palm" :style="{ animationDelay: `-${p.d}s` }">
        <path d="M0 0 Q20 -260 110 -480" stroke="#1b1033" stroke-width="44" fill="none" stroke-linecap="round" />
        <path d="M0 0 Q20 -260 110 -480" stroke="#c48a4e" stroke-width="32" fill="none" stroke-linecap="round" />
        <path d="M0 0 Q20 -260 110 -480" stroke="#8a5a2c" stroke-width="32" fill="none" stroke-dasharray="6 32" />
        <path d="M-6 -20 Q12 -260 98 -470" stroke="#e8b880" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7" />
        <g transform="translate(110 -480)">
          <g fill="#2ea25a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
            <path v-for="(f, fi) in FRONDS" :key="fi" :d="FROND" :transform="`rotate(${f.r}) scale(${f.sx} 1)`" />
          </g>
          <path v-for="(f, fi) in FRONDS" :key="`rib${fi}`" d="M-8 -4 Q-120 -70 -236 14" :transform="`rotate(${f.r}) scale(${f.sx} 1)`" stroke="#8ae0a8" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
          <circle cx="-16" cy="12" r="15" fill="#7a4a2a" stroke="#1b1033" stroke-width="4" />
          <circle cx="12" cy="16" r="15" fill="#7a4a2a" stroke="#1b1033" stroke-width="4" />
          <circle cx="-2" cy="30" r="13" fill="#7a4a2a" stroke="#1b1033" stroke-width="4" />
          <path d="M-24 6 Q-20 0 -14 0 M4 10 Q8 4 14 4" stroke="#c48a52" stroke-width="4" fill="none" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <path d="M-60 990 Q700 955 1300 975 Q1700 990 1980 965 L1980 1140 L-60 1140 Z" fill="url(#beach-sand-front)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M300 1040 q14 -6 28 0 M820 1060 q14 -6 28 0 M1500 1050 q14 -6 28 0 M1100 1090 q14 -6 28 0" stroke="#c88a46" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />

    <g transform="translate(640 1010)">
      <ellipse cx="10" cy="6" rx="170" ry="18" fill="#8a5a20" opacity="0.3" />
      <g fill="url(#beach-castle)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
        <path d="M-130 4 L-120 -80 L80 -80 L90 4 Z" />
        <path d="M-150 4 L-150 -120 L-136 -120 L-136 -136 L-120 -136 L-120 -120 L-106 -120 L-106 -136 L-90 -136 L-90 -120 L-76 -120 L-76 4 Z" />
        <path d="M50 4 L50 -130 L64 -130 L64 -146 L80 -146 L80 -130 L94 -130 L94 -146 L110 -146 L110 -130 L124 -130 L124 4 Z" />
        <path d="M-50 -80 L-50 -170 L-36 -170 L-36 -186 L-20 -186 L-20 -170 L-6 -170 L-6 -186 L10 -186 L10 -170 L24 -170 L24 -80 Z" />
      </g>
      <path d="M-28 4 V-34 Q-13 -54 2 -34 V4 Z" fill="#b37a3a" stroke="#1b1033" stroke-width="4" />
      <path d="M-128 -60 h30 M-140 -30 h40 M64 -60 h34 M70 -96 h28 M-40 -120 h40 M-100 -20 h30 M30 -40 h30" stroke="#c48a4a" stroke-width="4" stroke-linecap="round" opacity="0.7" />
      <circle cx="-118" cy="-92" r="6" fill="#ff8a9a" stroke="#1b1033" stroke-width="3" />
      <path d="M-13 -186 V-240" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />
      <path d="M-11 -240 L30 -228 L-11 -214 Z" fill="#ff4f8b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <g transform="translate(190 0)">
        <path d="M-40 4 L-48 -70 L48 -70 L40 4 Z" fill="#2e8bff" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <ellipse cx="0" cy="-70" rx="48" ry="12" fill="#1f5fbf" stroke="#1b1033" stroke-width="5" />
        <path d="M-46 -60 Q0 -110 46 -60" stroke="#1b1033" stroke-width="5" fill="none" />
        <path d="M-34 -56 L-30 -6" stroke="#8ac4ff" stroke-width="7" stroke-linecap="round" />
        <path d="M50 -10 L110 -110" stroke="#1b1033" stroke-width="10" stroke-linecap="round" />
        <path d="M50 -10 L110 -110" stroke="#ffd23f" stroke-width="4" stroke-linecap="round" />
        <path d="M100 -100 L130 -140 L144 -118 L118 -86 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      </g>
    </g>

    <g transform="translate(1180 1000)">
      <ellipse cx="0" cy="34" rx="44" ry="9" fill="#8a5a20" opacity="0.3" />
      <g class="ball">
        <circle cx="0" cy="0" r="38" fill="#fffaf0" stroke="#1b1033" stroke-width="5" />
        <path d="M0 -38 Q-30 0 0 38 Q-46 20 -36 -12 Z" fill="#ff3b5c" />
        <path d="M0 -38 Q30 0 0 38 Q46 20 36 -12 Z" fill="#2e8bff" />
        <path d="M0 -38 Q-30 0 0 38 M0 -38 Q30 0 0 38" stroke="#1b1033" stroke-width="3" fill="none" />
        <circle cx="0" cy="0" r="38" fill="none" stroke="#1b1033" stroke-width="5" />
        <path d="M-22 -20 Q-14 -30 -2 -32" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g transform="translate(940 1060)">
      <g class="beach-crab">
        <ellipse cx="0" cy="18" rx="40" ry="7" fill="#8a5a20" opacity="0.3" />
        <path d="M-26 6 L-44 18 M-22 10 L-36 24 M26 6 L44 18 M22 10 L36 24" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />
        <path d="M-24 -6 L-42 -30 M24 -6 L42 -30" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
        <path d="M-52 -40 Q-36 -50 -34 -30 L-44 -28 Z M52 -40 Q36 -50 34 -30 L44 -28 Z" fill="#ff5a3c" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <ellipse cx="0" cy="0" rx="32" ry="20" fill="#ff5a3c" stroke="#1b1033" stroke-width="5" />
        <path d="M-18 -10 Q-8 -16 4 -16" stroke="#ffb09a" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M-8 -16 V-30 M8 -16 V-30" stroke="#1b1033" stroke-width="4" />
        <circle cx="-8" cy="-32" r="6" fill="#fff" stroke="#1b1033" stroke-width="3" />
        <circle cx="8" cy="-32" r="6" fill="#fff" stroke="#1b1033" stroke-width="3" />
        <circle cx="-7" cy="-32" r="2.5" fill="#1b1033" />
        <circle cx="9" cy="-32" r="2.5" fill="#1b1033" />
      </g>
    </g>

    <path d="M380 1036 l8 -24 l8 24 l24 0 l-20 14 l8 24 l-20 -14 l-20 14 l8 -24 l-20 -14 Z" fill="#ff8a5a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M1596 1050 Q1596 1010 1620 1004 Q1644 1010 1644 1050 Q1620 1060 1596 1050 Z M1608 1048 L1616 1012 M1632 1048 L1624 1012 M1620 1052 V1006" fill="#ffd6e0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <g fill="#1d6a4a" stroke="#0d3a28" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-20 960 120 900 Q50 1010 90 1140 Z" />
      <path d="M-60 1140 Q70 1000 270 990 Q150 1060 170 1140 Z" />
      <path d="M1980 1140 Q1960 960 1810 910 Q1880 1030 1850 1140 Z" />
      <path d="M1980 1140 Q1880 1010 1680 1000 Q1790 1060 1770 1140 Z" />
    </g>
    <path d="M30 1100 Q60 1000 110 930 M1880 1100 Q1860 1010 1830 940" stroke="#3a9a6a" stroke-width="4" fill="none" stroke-linecap="round" />
  </g>
</template>

<style scoped>
.beach-palm {
  transform-box: fill-box;
  transform-origin: bottom left;
  animation: beach-sway 5s ease-in-out infinite alternate;
}

.beach-crab {
  animation: beach-scuttle 5s ease-in-out infinite alternate;
}

@keyframes beach-sway {
  from {
    rotate: -1.5deg;
  }
  to {
    rotate: 1.5deg;
  }
}

@keyframes beach-scuttle {
  0%,
  20% {
    translate: 0 0;
  }
  80%,
  100% {
    translate: 120px 0;
  }
}
</style>
