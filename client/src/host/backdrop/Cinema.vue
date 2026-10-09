<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(404);
const HAIR = ['plain', 'bun', 'cap', 'curly', 'tail'] as const;
// rows go from the screen towards the viewer: each one lower, wider and darker than the last
const ROWS = [
  { y: 690, w: 64, h: 40, o: -20, dark: 0.45 },
  { y: 752, w: 80, h: 52, o: 14, dark: 0.35 },
  { y: 836, w: 104, h: 68, o: -40, dark: 0.22 },
  { y: 944, w: 138, h: 92, o: 10, dark: 0.1 },
].map((r) => {
  const step = r.w + r.w * 0.18;
  const seats = [];
  for (let x = -80 + r.o; x < 2000; x += step) {
    const sat = rnd() < 0.55;
    seats.push({ x, sat, hair: HAIR[Math.floor(rnd() * HAIR.length)], tilt: (rnd() - 0.5) * 16 });
  }
  return { ...r, step, seats };
});
const seatBack = (x: number, y: number, w: number, h: number) => {
  const r = w * 0.28;
  return `M${x} ${y + h} V${y + r} Q${x} ${y} ${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h} Z`;
};
const DUST = twinkleGroups(Array.from({ length: 40 }, () => {
  const t = rnd();
  const y = 20 + t * 560;
  const half = 40 + t * 560;
  return { x: 960 + (rnd() - 0.5) * 2 * half, y, r: 1.5 + rnd() * 2.5 };
}));
const STARS = twinkleGroups(Array.from({ length: 24 }, (_, i) => ({ x: 40 + i * 80 + rnd() * 40, y: 14 + rnd() * 34 })));
const SCONCES = [
  { x: 70, y: 420, k: 1 },
  { x: 196, y: 360, k: 0.7 },
  { x: 1850, y: 420, k: -1 },
  { x: 1724, y: 360, k: -0.7 },
];
const FOLDS = [24, 60, 96, 132];
const KERNELS = [
  { x: -46, y: -6 },
  { x: -22, y: -20 },
  { x: 6, y: -26 },
  { x: 32, y: -16 },
  { x: 50, y: -2 },
  { x: -34, y: 12 },
  { x: 0, y: -4 },
  { x: 26, y: 8 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="cinema-wall" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2a0e2a" />
        <stop offset="100%" stop-color="#4a1a3a" />
      </linearGradient>
      <linearGradient id="cinema-wall-r" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="#2a0e2a" />
        <stop offset="100%" stop-color="#4a1a3a" />
      </linearGradient>
      <radialGradient id="cinema-screen" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#5a4a78" />
        <stop offset="100%" stop-color="#3a2a52" />
      </radialGradient>
      <linearGradient id="cinema-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8f0ff" stop-opacity="0.32" />
        <stop offset="100%" stop-color="#e8f0ff" stop-opacity="0.03" />
      </linearGradient>
      <linearGradient id="cinema-velvet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff5a6a" />
        <stop offset="35%" stop-color="#d42a46" />
        <stop offset="100%" stop-color="#7a0e2c" />
      </linearGradient>
      <linearGradient id="cinema-stage" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6a3a3a" />
        <stop offset="100%" stop-color="#2a1020" />
      </linearGradient>
      <linearGradient id="cinema-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="50%" stop-color="#ffc23a" />
        <stop offset="100%" stop-color="#c47a1c" />
      </linearGradient>
      <radialGradient id="cinema-lamp">
        <stop offset="0%" stop-color="#ffd98a" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#ffb04a" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="cinema-cup" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#5ad0ff" />
        <stop offset="100%" stop-color="#2a6ad6" />
      </linearGradient>
    </defs>

    <g v-for="(grp, gi) in STARS" :key="`sg${gi}`" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" fill="#ffd98a">
      <circle v-for="(s, i) in grp" :key="i" :cx="s.x" :cy="s.y" r="2.5" />
    </g>

    <path d="M-60 -60 L300 70 L300 720 L-60 920 Z" fill="url(#cinema-wall)" stroke="#120414" stroke-width="4" stroke-linejoin="round" />
    <path d="M1980 -60 L1620 70 L1620 720 L1980 920 Z" fill="url(#cinema-wall-r)" stroke="#120414" stroke-width="4" stroke-linejoin="round" />
    <path d="M40 -20 V870 M140 20 V820 M230 52 V770 M1880 -20 V870 M1780 20 V820 M1690 52 V770" stroke="#1a0618" stroke-width="5" opacity="0.6" />
    <path d="M-60 560 L300 470 M1980 560 L1620 470" stroke="#7a3a5a" stroke-width="5" opacity="0.6" />
    <g v-for="(s, i) in SCONCES" :key="`sc${i}`" :transform="`translate(${s.x} ${s.y}) scale(${s.k} ${Math.abs(s.k)})`">
      <ellipse cx="0" cy="-60" rx="80" ry="110" fill="url(#cinema-lamp)" class="glow" />
      <path d="M-26 0 Q-30 -40 0 -46 Q30 -40 26 0 Q0 12 -26 0 Z" fill="url(#cinema-gold)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-14 -4 Q-14 -34 0 -38 M0 -4 V-40 M14 -4 Q14 -34 0 -38" stroke="#c47a1c" stroke-width="3" fill="none" />
      <path d="M-18 -10 Q-20 -30 -8 -38" stroke="#fff6c8" stroke-width="4" fill="none" stroke-linecap="round" />
      <ellipse cx="0" cy="-44" rx="22" ry="5" fill="#fff3c0" />
    </g>

    <rect x="300" y="60" width="1320" height="680" fill="#1a0618" />
    <rect x="352" y="168" width="1216" height="452" rx="6" fill="#4a3a66" opacity="0.35" />
    <rect x="370" y="180" width="1180" height="430" rx="4" fill="url(#cinema-screen)" stroke="#120414" stroke-width="10" />
    <path d="M390 200 H1530" stroke="#8a7aa8" stroke-width="3" opacity="0.4" />

    <path d="M300 620 H1620 L1660 690 H260 Z" fill="url(#cinema-stage)" stroke="#120414" stroke-width="4" stroke-linejoin="round" />
    <path d="M300 628 H1620" stroke="#b07060" stroke-width="3" opacity="0.6" />
    <g fill="#ffcf6a" class="glow">
      <circle v-for="i in 12" :key="`fl${i}`" :cx="300 + i * 101" cy="660" r="5" />
    </g>

    <g>
      <path d="M210 40 H380 Q360 200 372 360 Q392 520 300 640 Q330 690 340 760 H210 Z" fill="url(#g-curtain)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M210 40 H380 Q360 200 372 360 Q392 520 300 640 Q330 690 340 760 H210 Z" fill="url(#g-curtain-shade)" />
      <path d="M1710 40 H1540 Q1560 200 1548 360 Q1528 520 1620 640 Q1590 690 1580 760 H1710 Z" fill="url(#g-curtain)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M1710 40 H1540 Q1560 200 1548 360 Q1528 520 1620 640 Q1590 690 1580 760 H1710 Z" fill="url(#g-curtain-shade)" />
      <path d="M300 640 Q330 610 372 620 M1620 640 Q1590 610 1548 620" stroke="url(#cinema-gold)" stroke-width="12" fill="none" stroke-linecap="round" />
      <circle cx="372" cy="620" r="12" fill="url(#cinema-gold)" stroke="#1b1033" stroke-width="4" />
      <circle cx="1548" cy="620" r="12" fill="url(#cinema-gold)" stroke="#1b1033" stroke-width="4" />
      <path d="M190 20 H1730 V120 Q1676 170 1622 120 Q1568 170 1514 120 Q1460 170 1406 120 Q1352 170 1298 120 Q1244 170 1190 120 Q1136 170 1082 120 Q1028 170 974 120 Q920 170 866 120 Q812 170 758 120 Q704 170 650 120 Q596 170 542 120 Q488 170 434 120 Q380 170 326 120 Q272 170 190 120 Z" fill="url(#g-curtain)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M190 94 Q960 110 1730 94" stroke="url(#cinema-gold)" stroke-width="8" fill="none" />
      <path d="M190 20 H1730" stroke="#ffd36b" stroke-width="10" />
    </g>

    <g class="cinema-beam">
      <path d="M930 -60 L1000 -60 L1560 610 L360 610 Z" fill="url(#cinema-beam)" />
      <path d="M950 -60 L620 610 M980 -60 L1250 610 M965 -60 L940 610" stroke="#f4f8ff" stroke-width="10" opacity="0.06" />
    </g>
    <g v-for="(grp, gi) in DUST" :key="`du${gi}`" class="cinema-dust" :style="{ animationDelay: `-${gi * 1.6}s` }" fill="#fff6e0">
      <circle v-for="(d, i) in grp" :key="i" :cx="d.x" :cy="d.y" :r="d.r" />
    </g>

    <g v-for="(r, ri) in ROWS" :key="`row${ri}`">
      <g :class="ri % 2 ? 'cinema-nod' : 'cinema-nod late'" fill="#1a0a20">
        <g v-for="(s, si) in r.seats.filter((seat) => seat.sat)" :key="`h${si}`" :transform="`translate(${s.x + r.w / 2} ${r.y + r.h * 0.1}) scale(${r.w / 100}) rotate(${s.tilt})`">
          <path d="M-20 30 Q-22 10 -34 -6 L34 -6 Q22 10 20 30 Z" />
          <ellipse cx="0" cy="-30" rx="30" ry="34" />
          <circle v-if="s.hair === 'bun'" cx="0" cy="-70" r="15" />
          <path v-if="s.hair === 'cap'" d="M-32 -36 Q-30 -70 0 -70 Q30 -70 32 -36 Q44 -32 52 -30 L30 -28 Z" fill="#3a1438" />
          <g v-if="s.hair === 'curly'">
            <circle cx="-24" cy="-50" r="16" />
            <circle cx="0" cy="-62" r="18" />
            <circle cx="24" cy="-50" r="16" />
          </g>
          <path v-if="s.hair === 'tail'" d="M24 -40 Q56 -40 50 -4 Q40 -20 26 -24 Z" />
          <path d="M-22 -54 Q0 -68 22 -54" stroke="#a89ad8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
          <path d="M-31 -24 Q-32 -6 -24 4 M31 -24 Q32 -6 24 4" stroke="#6a4a8a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
        </g>
      </g>
      <g fill="url(#cinema-velvet)" stroke="#1b1033" :stroke-width="2 + ri" stroke-linejoin="round" filter="url(#cel-s)">
        <path v-for="(s, si) in r.seats" :key="`sb${si}`" :d="seatBack(s.x, r.y, r.w, r.h + 60)" />
      </g>
      <path :d="r.seats.map((s) => `M${s.x + r.w * 0.2} ${r.y + r.h * 0.2} Q${s.x + r.w * 0.5} ${r.y + r.h * 0.08} ${s.x + r.w * 0.8} ${r.y + r.h * 0.2}`).join(' ')" stroke="#ff9aa8" :stroke-width="2 + ri" fill="none" stroke-linecap="round" opacity="0.75" />
      <path :d="r.seats.map((s) => `M${s.x + r.w * 0.5} ${r.y + r.h * 0.42} V${r.y + r.h + 60}`).join(' ')" stroke="#6a0a24" :stroke-width="1 + ri" opacity="0.5" />
      <rect x="-60" :y="r.y + r.h * 0.9" width="2040" :height="r.h * 0.4" fill="#120414" :opacity="r.dark" />
    </g>

    <g fill="#160616" stroke="#0a020c" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 V1020 Q-60 980 -20 980 H170 Q210 980 210 1020 V1140 Z" />
      <path d="M1980 1140 V1020 Q1980 980 1940 980 H1750 Q1710 980 1710 1020 V1140 Z" />
      <rect x="240" y="1040" width="140" height="120" rx="20" />
      <rect x="1540" y="1040" width="140" height="120" rx="20" />
    </g>
    <path d="M-40 990 H180 M1740 990 H1960" stroke="#5a2a4a" stroke-width="5" stroke-linecap="round" />

    <g transform="translate(310 1046)">
      <ellipse cx="0" cy="0" rx="70" ry="10" fill="#000" opacity="0.4" />
      <path d="M-62 -150 L-48 0 H48 L62 -150 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path v-for="f in FOLDS" :key="`pf${f}`" :d="`M${-62 + f - 6} -150 L${-48 + f * 0.78 - 4} 0 H${-48 + f * 0.78 + 10} L${-62 + f + 12} -150 Z`" fill="#e8343e" />
      <path d="M-62 -150 L-48 0 H48 L62 -150 Z" fill="none" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-52 -130 L-42 -20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <g fill="#fff3c8" stroke="#1b1033" stroke-width="3.5">
        <circle v-for="(k, i) in KERNELS" :key="`pk${i}`" :cx="k.x" :cy="k.y - 154" r="17" />
      </g>
      <g fill="#ffd36b">
        <circle cx="-30" cy="-176" r="6" />
        <circle cx="16" cy="-182" r="5" />
        <circle cx="40" cy="-160" r="5" />
      </g>
      <path d="M-28 -184 q6 -8 14 -6 M2 -192 q6 -8 14 -6" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1610 1046)">
      <ellipse cx="0" cy="0" rx="56" ry="9" fill="#000" opacity="0.4" />
      <path d="M-46 -150 L-36 0 H36 L46 -150 Z" fill="url(#cinema-cup)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-44 -110 Q0 -100 44 -110 L42 -84 Q0 -74 -42 -84 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <circle cx="0" cy="-44" r="16" fill="#ffd23f" stroke="#1b1033" stroke-width="3.5" />
      <path d="M-34 -140 L-28 -14" stroke="#c8f0ff" stroke-width="5" stroke-linecap="round" opacity="0.8" />
      <path d="M-52 -150 Q0 -172 52 -150 Q0 -140 -52 -150 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M8 -160 L26 -230 L48 -236" stroke="#1b1033" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8 -160 L26 -230 L48 -236" stroke="#ff4f8a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 -180 L18 -204" stroke="#fff" stroke-width="3" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.cinema-beam {
  animation: cinema-flicker 3.2s ease-in-out infinite alternate;
}

.cinema-dust {
  animation: cinema-dust 6.4s ease-in-out infinite;
}

.cinema-nod {
  animation: cinema-nod 5s ease-in-out infinite alternate;
}

.cinema-nod.late {
  animation-duration: 6.5s;
  animation-delay: -2s;
}

@keyframes cinema-flicker {
  0% {
    opacity: 0.75;
  }
  40% {
    opacity: 1;
  }
  55% {
    opacity: 0.85;
  }
  100% {
    opacity: 1;
  }
}

@keyframes cinema-dust {
  0%,
  100% {
    opacity: 0.15;
    translate: 0 0;
  }
  50% {
    opacity: 0.9;
    translate: 10px -14px;
  }
}

@keyframes cinema-nod {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 3px;
  }
}
</style>
