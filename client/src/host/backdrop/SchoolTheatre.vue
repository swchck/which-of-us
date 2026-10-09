<script setup lang="ts">

const SWAGS = Array.from({ length: 8 }, (_, i) => -60 + i * 260)
  .map((x) => `M${x} 60 Q${x + 130} 200 ${x + 260} 60`)
  .join(' ');
const FOOTLIGHTS = Array.from({ length: 13 }, (_, i) => 220 + i * 123);
const HEADS = (() => {
  const out: { x: number; y: number; r: number; c: string }[] = [];
  const colors = ['#2a1a4a', '#3a2258', '#24163e'];
  for (let i = 0; i < 16; i++) out.push({ x: -40 + i * 132 + (i % 2) * 20, y: 1040, r: 62, c: colors[i % 3]! });
  for (let i = 0; i < 18; i++) out.push({ x: 0 + i * 116, y: 1110, r: 70, c: colors[(i + 1) % 3]! });
  return out;
})();
const TAPE = 'M712 520 l40 -14 M1180 600 l36 12 M940 380 l30 -10 M840 700 l40 12';
</script>

<template>
  <g>
    <defs>
      <linearGradient id="school-theatre-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7a4a8a" />
        <stop offset="100%" stop-color="#3d2258" />
      </linearGradient>
      <linearGradient id="school-theatre-stage" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0a464" />
        <stop offset="100%" stop-color="#a86a36" />
      </linearGradient>
      <linearGradient id="school-theatre-apron" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a3a5a" />
        <stop offset="100%" stop-color="#4a1a3a" />
      </linearGradient>
      <linearGradient id="school-theatre-card" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4d0a0" />
        <stop offset="100%" stop-color="#d8a46a" />
      </linearGradient>
      <linearGradient id="school-theatre-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7ac4ff" />
        <stop offset="100%" stop-color="#c8ecff" />
      </linearGradient>
      <radialGradient id="school-theatre-spot" cx="50%" cy="100%" r="80%">
        <stop offset="0%" stop-color="#fff6c0" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fff6c0" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="school-theatre-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6c0" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#fff6c0" stop-opacity="0.35" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1200" fill="url(#school-theatre-wall)" />
    <rect x="200" y="120" width="1520" height="700" fill="url(#school-theatre-sky)" stroke="#1b1033" stroke-width="5" />
    <path d="M200 640 Q500 560 800 610 Q1100 660 1400 590 Q1600 560 1720 600 V820 H200 Z" fill="#7ed06a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path d="M200 700 Q600 660 960 690 Q1300 720 1720 680 V820 H200 Z" fill="#5fb04a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M300 300 Q330 270 380 284 Q420 260 460 290 Q500 296 490 320 H300 Z M1420 240 Q1450 210 1500 224 Q1540 200 1580 230 Q1620 236 1610 260 H1420 Z" fill="#fff" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />

    <g filter="url(#cel)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round">
      <path d="M700 760 V470 H720 V440 H750 V470 H780 V440 H810 V470 H840 V440 H870 V470 H880 V560 H1040 V470 H1050 V440 H1080 V470 H1110 V440 H1140 V470 H1170 V440 H1200 V470 H1220 V760 Z" fill="url(#school-theatre-card)" />
      <path d="M900 560 V330 H912 V300 H940 V330 H966 V300 H994 V330 H1020 V560 Z" fill="url(#school-theatre-card)" />
      <path d="M890 330 L960 210 L1030 330 Z" fill="#e8553f" />
      <path d="M690 470 L790 380 L890 470 Z M1030 470 L1130 380 L1230 470 Z" fill="#4a7ad8" />
    </g>
    <path d="M960 210 V160" stroke="#1b1033" stroke-width="5" />
    <path d="M960 162 L1010 176 L960 190 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <g stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path d="M910 760 V660 Q960 600 1010 660 V760 Z" fill="#8a4a2a" />
      <path d="M960 620 V760" stroke-width="3" />
      <path d="M744 520 h40 v60 h-40 Z M1136 520 h40 v60 h-40 Z M940 380 h40 v56 h-40 Z" fill="#3a2a6a" />
      <path d="M764 520 v60 M744 550 h40 M1156 520 v60 M1136 550 h40" stroke-width="3" />
    </g>
    <path d="M730 600 h50 M1160 640 h40 M740 700 h30 M1100 720 h50 M930 470 h40" stroke="#b07a4a" stroke-width="4" stroke-linecap="round" />
    <path :d="TAPE" stroke="#f4f0e0" stroke-width="16" stroke-linecap="square" opacity="0.85" />
    <path d="M1220 700 L1300 790 M700 700 L620 790" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
    <path d="M1220 700 L1300 790 M700 700 L620 790" stroke="#c48a52" stroke-width="6" stroke-linecap="round" />

    <g class="school-theatre-sun">
      <path d="M1460 820 V430" stroke="#1b1033" stroke-width="12" />
      <path d="M1460 820 V430" stroke="#c48a52" stroke-width="6" />
      <g transform="translate(1460 380)" stroke="#1b1033" stroke-linejoin="round">
        <path d="M0 -96 L18 -66 L52 -80 L48 -44 L84 -36 L60 -8 L88 18 L52 28 L58 64 L24 56 L10 90 L-10 60 L-40 80 L-44 44 L-80 40 L-58 10 L-86 -14 L-50 -28 L-60 -62 L-24 -58 Z" fill="#ffc94a" stroke-width="5" />
        <circle r="46" fill="#ffe14d" stroke-width="5" />
        <path d="M-18 -8 h0.1 M18 -8 h0.1" stroke-width="10" stroke-linecap="round" />
        <path d="M-18 14 Q0 30 18 14" stroke-width="5" fill="none" stroke-linecap="round" />
        <ellipse cx="-28" cy="8" rx="8" ry="5" fill="#ff8a8a" stroke="none" />
        <ellipse cx="28" cy="8" rx="8" ry="5" fill="#ff8a8a" stroke="none" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <g transform="translate(420 800)">
        <path d="M0 0 V-120" stroke-width="12" />
        <path d="M0 0 V-120" stroke="#c48a52" stroke-width="6" />
        <path d="M-90 -110 Q-110 -200 -40 -230 Q0 -300 60 -240 Q120 -220 100 -150 Q110 -100 60 -100 H-60 Q-100 -90 -90 -110 Z" fill="#5fb04a" stroke-width="6" filter="url(#cel-s)" />
        <circle cx="-30" cy="-180" r="12" fill="#e8553f" stroke-width="4" />
        <circle cx="40" cy="-150" r="12" fill="#e8553f" stroke-width="4" />
        <circle cx="10" cy="-220" r="12" fill="#e8553f" stroke-width="4" />
      </g>
    </g>

    <g class="school-theatre-beam" style="transform-origin: 1500px -40px">
      <path d="M1480 -40 L1520 -40 L1180 800 L860 800 Z" fill="url(#school-theatre-beam)" />
    </g>

    <path d="M-60 -60 H1980 V60 H-60 Z" fill="#8c0f3a" />
    <path :d="`M-60 -60 H1980 V60 ${SWAGS.replace(/M/g, 'L')} Z`" fill="url(#g-curtain)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path :d="SWAGS" fill="none" stroke="#ffd23f" stroke-width="8" />
    <g stroke="#1b1033" stroke-width="6" stroke-linejoin="round">
      <path d="M-60 -60 H300 Q260 300 290 560 Q320 760 220 900 H-60 Z" fill="url(#g-curtain)" />
      <path d="M1980 -60 H1620 Q1660 300 1630 560 Q1600 760 1700 900 H1980 Z" fill="url(#g-curtain)" />
      <path d="M-60 -60 H300 Q260 300 290 560 Q320 760 220 900 H-60 Z M1980 -60 H1620 Q1660 300 1630 560 Q1600 760 1700 900 H1980 Z" fill="url(#g-curtain-shade)" stroke="none" />
    </g>
    <path d="M230 560 Q300 540 330 570 M1690 560 Q1620 540 1590 570" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
    <path d="M230 560 Q300 540 330 570 M1690 560 Q1620 540 1590 570" stroke="#ffd23f" stroke-width="8" fill="none" stroke-linecap="round" />

    <path d="M-60 800 H1980 V880 H-60 Z" fill="url(#school-theatre-stage)" stroke="#1b1033" stroke-width="5" />
    <path d="M-60 812 H1980" stroke="#ffe0b0" stroke-width="4" />
    <path d="M-60 880 H1980 V1140 H-60 Z" fill="url(#school-theatre-apron)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <g v-for="(x, i) in FOOTLIGHTS" :key="`fl${i}`" stroke="#1b1033" stroke-linejoin="round">
      <path :d="`M${x - 26} 880 V858 Q${x} 840 ${x + 26} 858 V880 Z`" fill="#3d2a5a" stroke-width="4" />
    </g>
    <g class="school-theatre-foot">
      <ellipse v-for="(x, i) in FOOTLIGHTS" :key="`fg${i}`" :cx="x" cy="856" rx="16" ry="8" fill="#fff6c0" />
    </g>
    <ellipse cx="960" cy="800" rx="520" ry="70" fill="url(#school-theatre-spot)" class="school-theatre-pool" />

    <circle v-for="(h, i) in HEADS" :key="`hd${i}`" :cx="h.x" :cy="h.y" :r="h.r" :fill="h.c" stroke="#120826" stroke-width="5" />
    <path d="M300 1000 l-14 -30 l24 10 Z M1290 990 l-10 -34 l26 14 Z" fill="#2a1a4a" stroke="#120826" stroke-width="4" stroke-linejoin="round" />
    <g class="school-theatre-phone">
      <rect x="1500" y="940" width="44" height="72" rx="8" fill="#1b1033" stroke="#120826" stroke-width="4" />
      <rect x="1506" y="948" width="32" height="54" rx="4" fill="#9ae0ff" />
    </g>
  </g>
</template>

<style scoped>
.school-theatre-sun {
  animation: school-theatre-bob 2.4s ease-in-out infinite alternate;
}

.school-theatre-foot {
  animation: school-theatre-glow 1.6s ease-in-out infinite alternate;
}

.school-theatre-pool {
  animation: school-theatre-glow 3s ease-in-out infinite alternate;
}

.school-theatre-beam {
  animation: school-theatre-sweep 7s ease-in-out infinite alternate;
}

.school-theatre-phone {
  animation: school-theatre-bob 3s ease-in-out infinite alternate;
}

@keyframes school-theatre-bob {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -24px;
  }
}

@keyframes school-theatre-glow {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}

@keyframes school-theatre-sweep {
  from {
    rotate: -8deg;
  }
  to {
    rotate: 10deg;
  }
}
</style>
