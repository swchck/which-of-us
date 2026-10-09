<script setup lang="ts">
import { seeded, tufts, twinkleGroups } from './kit';

const rnd = seeded(135);
const STARS = Array.from({ length: 110 }, () => ({
  x: rnd() * 1920,
  y: rnd() * 560,
  r: 0.8 + rnd() * 2.4,
}));
const CAMP_SKY = twinkleGroups(STARS);

// a pine as three drooping tiers over a stub of trunk
const TIERS = [
  { f: 0.66, hw: 0.24 },
  { f: 0.4, hw: 0.36 },
  { f: 0.12, hw: 0.5 },
];
function pine(x: number, base: number, h: number, w: number): string {
  let right = '';
  let left = '';
  let start = `${x} ${base - h}`;
  TIERS.forEach(({ f, hw }, i) => {
    const y = base - h * f;
    const inner = i === TIERS.length - 1 ? 0.08 : hw * 0.45;
    right += ` Q${x + w * hw * 0.7} ${y - h * 0.06} ${x + w * hw} ${y} L${x + w * inner} ${y - h * 0.03}`;
    left = ` L${x - w * inner} ${y - h * 0.03} L${x - w * hw} ${y} Q${x - w * hw * 0.7} ${y - h * 0.06} ${start}` + left;
    start = `${x - w * inner} ${y - h * 0.03}`;
  });
  return `M${x} ${base - h}${right} L${x + w * 0.08} ${base} L${x - w * 0.08} ${base}${left} Z`;
}
const FAR_PINES = Array.from({ length: 34 }, (_, i) => pine(-40 + i * 60 + rnd() * 30, 770, 110 + rnd() * 90, 90 + rnd() * 30)).join(' ');
const MID_PINES = [
  ...Array.from({ length: 6 }, (_, i) => ({ x: -40 + i * 120 + rnd() * 40 })),
  ...Array.from({ length: 6 }, (_, i) => ({ x: 1300 + i * 120 + rnd() * 40 })),
].map((p) => pine(p.x, 840, 250 + rnd() * 140, 150 + rnd() * 40)).join(' ');
const NEAR_PINES = [pine(1880, 1150, 900, 380), pine(-20, 1150, 560, 300)].join(' ');

const FIREFLIES = Array.from({ length: 21 }, () => ({ x: 120 + rnd() * 1680, y: 560 + rnd() * 420 }));
const FLY_GROUPS = [0, 1, 2].map((g) => ({ flies: FIREFLIES.filter((_, i) => i % 3 === g), s: 5 + g * 1.7 }));
const SPARKS = Array.from({ length: 8 }, () => ({ x: -30 + rnd() * 60, y: -40 - rnd() * 160, r: 2 + rnd() * 3 }));
const STONES = [-70, -40, -5, 32, 66].map((x, i) => ({ x, y: i % 2 ? 6 : 0, rx: 22 + (i % 3) * 3 }));
const SMOKE = [0, 1, 2];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="camp-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#070f38" />
        <stop offset="50%" stop-color="#1d1f66" />
        <stop offset="80%" stop-color="#4a2f84" />
      </linearGradient>
      <radialGradient id="camp-moon" cx="38%" cy="34%" r="70%">
        <stop offset="0%" stop-color="#fffbe6" />
        <stop offset="100%" stop-color="#f2d98a" />
      </radialGradient>
      <linearGradient id="camp-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b7a8ff" stop-opacity="0" />
        <stop offset="65%" stop-color="#b7a8ff" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#b7a8ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="camp-lake" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a6ad0" />
        <stop offset="100%" stop-color="#26307a" />
      </linearGradient>
      <linearGradient id="camp-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2f6070" />
        <stop offset="60%" stop-color="#1d3a52" />
        <stop offset="100%" stop-color="#132438" />
      </linearGradient>
      <linearGradient id="camp-tent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff9a4a" />
        <stop offset="100%" stop-color="#e0562a" />
      </linearGradient>
      <radialGradient id="camp-door" cx="50%" cy="85%" r="80%">
        <stop offset="0%" stop-color="#fff2a8" />
        <stop offset="60%" stop-color="#ffb84a" />
        <stop offset="100%" stop-color="#c25a2a" />
      </radialGradient>
      <radialGradient id="camp-firelight">
        <stop offset="0%" stop-color="#ffcf5a" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ff7a2f" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="camp-log" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a8683e" />
        <stop offset="100%" stop-color="#6a3a22" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#camp-sky)" />
    <g v-for="(g, gi) in CAMP_SKY" :key="gi" class="twinkle" :style="{ animationDelay: `${gi * 0.75}s` }"><circle v-for="(s, i) in g" :key="i" :cx="s.x" :cy="s.y" :r="s.r" fill="#fff" /></g>
    <circle cx="1690" cy="180" r="230" fill="#fff4c2" opacity="0.07" />
    <circle cx="1690" cy="180" r="150" fill="#fff4c2" opacity="0.12" />
    <circle cx="1690" cy="180" r="92" fill="url(#camp-moon)" stroke="#1b1033" stroke-width="5" />
    <path d="M1700 104 Q1780 140 1776 220 Q1740 268 1660 268 Q1740 230 1700 104 Z" fill="#d9b85e" opacity="0.5" />
    <g fill="#e2c574" stroke="#c4a250" stroke-width="2">
      <circle cx="1720" cy="150" r="16" />
      <circle cx="1665" cy="215" r="11" />
      <circle cx="1730" cy="215" r="8" />
    </g>
    <path d="M1632 138 Q1648 110 1680 104" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.85" />
    <path d="M1460 300 Q1500 270 1560 280 Q1600 250 1660 270 Q1720 258 1760 286 Q1820 290 1830 312 L1460 312 Z" fill="#6a5ab8" stroke="#8a7ad0" stroke-width="3" stroke-linejoin="round" opacity="0.55" />
    <path d="M60 220 Q100 196 160 204 Q200 176 260 196 Q320 190 350 216 L60 216 Z" fill="#4a3f98" stroke="#6a5ab0" stroke-width="3" stroke-linejoin="round" opacity="0.5" />
    <line x1="0" y1="0" x2="140" y2="60" stroke="#fff" stroke-width="4" stroke-linecap="round" class="shooting late" />

    <path d="M-60 720 L120 560 L260 640 L460 500 L640 640 L820 580 L1020 660 L1220 540 L1400 640 L1560 560 L1760 650 L1980 540 L1980 900 L-60 900 Z" fill="#33307a" stroke="#6a5ab0" stroke-width="3" stroke-linejoin="round" />
    <path d="M420 530 L460 500 L500 534 L480 528 L462 544 L440 526 Z M1186 566 L1220 540 L1256 570 L1236 564 L1220 576 L1204 562 Z M1940 568 L1980 540 L1980 572 L1960 564 Z M90 586 L120 560 L150 590 L130 584 L118 596 L104 582 Z" fill="#a49af0" opacity="0.7" />
    <path d="M300 620 L360 600 M700 610 L760 628 M1300 600 L1350 584 M1600 590 L1660 610" stroke="#4a46a0" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    <rect x="-60" y="560" width="2040" height="220" fill="url(#camp-haze)" />
    <path :d="FAR_PINES" fill="#272a6a" stroke="#4a4a98" stroke-width="3" stroke-linejoin="round" />
    <path d="M-60 750 Q480 740 960 752 Q1440 762 1980 748 L1980 900 L-60 900 Z" fill="#2c2f70" />
    <rect x="-60" y="690" width="2040" height="120" fill="url(#camp-haze)" opacity="0.7" />

    <path d="M560 812 Q960 776 1380 806 Q980 842 560 812 Z" fill="url(#camp-lake)" stroke="#1b1033" stroke-width="4" />
    <path d="M820 800 L900 800 M940 808 L1000 808 M1040 798 L1140 798 M1100 816 L1150 816 M700 812 L760 812" stroke="#fff4c2" stroke-width="4" stroke-linecap="round" opacity="0.55" />
    <path :d="MID_PINES" fill="#1a2552" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel)" />

    <path d="M-60 850 Q300 810 700 838 Q1100 866 1500 826 Q1760 806 1980 836 L1980 1200 L-60 1200 Z" fill="url(#camp-ground)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(30, 840, 1900, 0.011)" stroke="#4a8a98" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <path d="M200 960 L250 950 M760 990 L830 982 M1000 930 L1060 938 M600 1040 L680 1032" stroke="#0e1a2c" stroke-width="5" stroke-linecap="round" opacity="0.5" />

    <ellipse cx="1420" cy="950" rx="420" ry="110" fill="url(#camp-firelight)" class="glow" />

    <ellipse cx="460" cy="912" rx="260" ry="26" fill="#060c1a" opacity="0.4" />
    <path d="M250 914 L640 700 M640 700 L720 940" stroke="#c9c3e6" stroke-width="3" fill="none" opacity="0.6" />
    <path d="M440 690 L660 716 L760 900 L600 912 Z" fill="#b2421e" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M440 690 L290 910 L600 912 Z" fill="url(#camp-tent)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M440 724 L382 910 L500 910 Z" fill="url(#camp-door)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M440 724 Q404 800 352 906 L382 910 Q414 820 440 724 Z M440 724 Q476 820 530 908 L500 910 Q462 820 440 724 Z" fill="#c24a22" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M520 702 L700 806 M560 708 L728 850" stroke="#7a2a12" stroke-width="3" opacity="0.6" />
    <path d="M430 680 L440 666 L450 680" stroke="#1b1033" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M408 754 Q420 744 432 748" stroke="#fffbe8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    <ellipse cx="440" cy="920" rx="90" ry="18" fill="#ffd36b" opacity="0.35" class="glow" />
    <path d="M246 916 L254 900 M716 944 L722 928" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />

    <g transform="translate(1220 966)">
      <ellipse cx="0" cy="14" rx="130" ry="14" fill="#060c1a" opacity="0.4" />
      <path d="M-110 -30 L100 -30 Q120 -30 120 -4 Q120 16 100 16 L-110 16 Z" fill="url(#camp-log)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <ellipse cx="-110" cy="-7" rx="16" ry="23" fill="#e8b47a" stroke="#1b1033" stroke-width="5" />
      <ellipse cx="-110" cy="-7" rx="8" ry="12" fill="none" stroke="#a8683e" stroke-width="3" />
      <path d="M-70 -18 L-20 -20 M10 -8 L70 -10 M-40 4 L0 2" stroke="#4a2414" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      <path d="M40 -30 L104 -66" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />
      <path d="M40 -30 L104 -66" stroke="#c4925a" stroke-width="4" stroke-linecap="round" />
      <rect x="100" y="-84" width="22" height="26" rx="8" fill="#fffaf0" stroke="#1b1033" stroke-width="4" transform="rotate(-28 111 -71)" />
      <path d="M106 -78 L112 -82" stroke="#c48a52" stroke-width="5" stroke-linecap="round" />
    </g>

    <g transform="translate(1420 950)">
      <ellipse cx="0" cy="18" rx="120" ry="18" fill="#060c1a" opacity="0.45" />
      <path d="M-80 10 L80 -24 M-80 -24 L80 10" stroke="#1b1033" stroke-width="30" stroke-linecap="round" />
      <path d="M-80 10 L80 -24 M-80 -24 L80 10" stroke="url(#camp-log)" stroke-width="20" stroke-linecap="round" />
      <circle cx="-80" cy="10" r="10" fill="#e8b47a" stroke="#1b1033" stroke-width="4" />
      <circle cx="80" cy="10" r="10" fill="#e8b47a" stroke="#1b1033" stroke-width="4" />
      <g class="fire">
        <path d="M-56 -4 Q-74 -80 -26 -120 Q-30 -80 -6 -70 Q-6 -140 30 -180 Q24 -110 50 -90 Q70 -60 56 -4 Z" fill="#ff6a2a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M-34 -8 Q-44 -60 -14 -86 Q-12 -60 4 -54 Q8 -100 26 -124 Q24 -76 40 -60 Q48 -34 34 -8 Z" fill="#ffb02e" />
        <path d="M-16 -10 Q-22 -40 0 -64 Q18 -40 16 -10 Z" fill="#fff2a8" />
      </g>
      <g stroke="#1b1033" stroke-width="4" fill="#7a7a9e" filter="url(#cel-s)">
        <ellipse v-for="(s, i) in STONES" :key="i" :cx="s.x" :cy="s.y + 10" :rx="s.rx" ry="16" />
      </g>
      <g class="camp-sparks" fill="#ffd36b">
        <circle v-for="(s, i) in SPARKS" :key="i" :cx="s.x" :cy="s.y" :r="s.r" />
      </g>
    </g>
    <circle v-for="i in SMOKE" :key="`sm${i}`" cx="1440" cy="740" r="22" fill="none" stroke="#7a72b0" stroke-width="10" class="smoke" :style="{ animationDelay: `-${i * 2}s` }" />

    <g v-for="(g, gi) in FLY_GROUPS" :key="`fg${gi}`" class="camp-flies" :style="{ animationDuration: `${g.s}s`, animationDelay: `-${gi * 1.3}s` }">
      <g v-for="(f, i) in g.flies" :key="i">
        <circle :cx="f.x" :cy="f.y" r="14" fill="#fff59b" opacity="0.25" />
        <circle :cx="f.x" :cy="f.y" r="5" fill="#fffbd0" />
      </g>
    </g>

    <path :d="NEAR_PINES" fill="#0c1430" stroke="#05081a" stroke-width="6" stroke-linejoin="round" />
    <g fill="#0f1a34" stroke="#05081a" stroke-width="6" stroke-linejoin="round">
      <path d="M-60 1200 Q-40 980 120 960 Q160 900 240 930 Q330 920 340 1000 Q400 1020 380 1200 Z" />
      <path d="M1980 1200 Q1960 1000 1820 990 Q1760 940 1680 980 Q1600 990 1610 1060 Q1560 1100 1580 1200 Z" />
    </g>
    <path d="M100 980 Q130 950 170 948 M1700 990 Q1740 966 1780 970" stroke="#3a5a80" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
    <g class="camp-eyes" fill="#fff59b">
      <ellipse cx="190" cy="1020" rx="9" ry="12" />
      <ellipse cx="230" cy="1020" rx="9" ry="12" />
    </g>
  </g>
</template>

<style scoped>
.camp-sparks {
  animation: camp-sparks 2.4s ease-out infinite;
}

.camp-flies {
  animation: camp-flies ease-in-out infinite;
}

.camp-eyes {
  animation: camp-eyes 6s steps(1) infinite;
}

@keyframes camp-sparks {
  from {
    translate: 0 30px;
    opacity: 1;
  }
  to {
    translate: 20px -90px;
    opacity: 0;
  }
}

@keyframes camp-flies {
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

@keyframes camp-eyes {
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
</style>
