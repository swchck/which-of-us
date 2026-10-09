<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(152);
const BUBBLE_DOTS = Array.from({ length: 26 }, () => {
  const bubble = { x: 60 + rnd() * 1800, r: 5 + rnd() * 14, y: 1100 - rnd() * 1240 };
  rnd();
  return bubble;
});
// rising sheets like the snow, the copy a whole 1240px loop below
const BUBBLES = [15, 10].map((s, i) => ({ s, dots: BUBBLE_DOTS.filter((_, j) => j % 2 === i) }));
const FISH = [
  { y: 260, size: 1.1, c: '#ffd23f', b: '#fff2a8', st: '#ff7a2f', d: 3, s: 24, back: false },
  { y: 470, size: 0.8, c: '#ff7a2f', b: '#ffd0a8', st: '#fff', d: 12, s: 19, back: true },
  { y: 640, size: 1.25, c: '#22d3ee', b: '#c9f8ff', st: '#1b6ad0', d: 7, s: 28, back: false },
  { y: 360, size: 0.9, c: '#ff4f8b', b: '#ffd0e0', st: '#ffd23f', d: 18, s: 22, back: true },
];
const SCHOOL = Array.from({ length: 9 }, (_, i) => ({ x: (i % 3) * 46 + (i % 2) * 18, y: Math.floor(i / 3) * 30 + (i % 3) * 8 }));
const JELLIES = [
  { x: 640, d: 4, s: 26, c: '#ff9fe0', l: '#ffe0f6' },
  { x: 1260, d: 17, s: 30, c: '#c9a8ff', l: '#efe4ff' },
];

// one kelp stalk: a wavy stem with alternating blades
function kelp(x: number, h: number): { stem: string; blades: string } {
  const top = 960 - h;
  const stem = `M${x} 960 Q${x - 30} ${960 - h * 0.35} ${x + 10} ${960 - h * 0.6} Q${x + 40} ${960 - h * 0.85} ${x} ${top}`;
  let blades = '';
  for (let i = 1; i < 6; i++) {
    const y = 960 - (h * i) / 6;
    const sx = x + Math.sin(i * 1.7) * 14;
    const dir = i % 2 ? 1 : -1;
    blades += `M${sx} ${y} Q${sx + dir * 60} ${y - 40} ${sx + dir * 70} ${y - 90} Q${sx + dir * 20} ${y - 50} ${sx} ${y} Z `;
  }
  return { stem, blades };
}
const KELP_L = [kelp(40, 640), kelp(140, 470), kelp(420, 380)];
const KELP_R = [kelp(1580, 420), kelp(1860, 620), kelp(1950, 480)];
const FAR_KELP = [260, 700, 1180, 1340, 1700]
  .map((x) => `M${x} 800 Q${x - 20} 700 ${x + 8} 620 Q${x + 30} 560 ${x + 4} 500`)
  .join(' ');
const ANEMONE = [-50, -30, -10, 10, 30, 50];
const RAYS = [
  { x: 300, w: 160 },
  { x: 700, w: 220 },
  { x: 1100, w: 180 },
  { x: 1500, w: 240 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="ocean-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3cc2e8" />
        <stop offset="45%" stop-color="#1a72b4" />
        <stop offset="100%" stop-color="#0c2d66" />
      </linearGradient>
      <linearGradient id="ocean-ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8fbff" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#e8fbff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="ocean-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8ad8ff" stop-opacity="0" />
        <stop offset="60%" stop-color="#8ad8ff" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#8ad8ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="ocean-sand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f8dc9e" />
        <stop offset="50%" stop-color="#e2b46e" />
        <stop offset="100%" stop-color="#b07c44" />
      </linearGradient>
      <linearGradient id="ocean-rock" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8a7ad0" />
        <stop offset="100%" stop-color="#3a2f78" />
      </linearGradient>
      <radialGradient id="ocean-gold">
        <stop offset="0%" stop-color="#ffe58a" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#ffe58a" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#ocean-water)" />
    <path d="M-60 -60 L1980 -60 L1980 40 Q1820 70 1660 44 Q1500 20 1340 48 Q1180 74 1020 46 Q860 20 700 48 Q540 74 380 46 Q220 20 60 48 Q0 58 -60 46 Z" fill="#a8ecff" opacity="0.35" />
    <path d="M80 80 Q140 66 200 80 M520 96 Q600 80 680 96 M1080 84 Q1150 70 1220 84 M1560 100 Q1630 86 1700 100" stroke="#e8fbff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.45" />
    <g class="ocean-rays">
      <path v-for="(r, i) in RAYS" :key="`ry${i}`" :d="`M${r.x} -60 L${r.x + r.w} -60 L${r.x + r.w * 0.4 - 180} 1100 L${r.x - r.w * 0.6 - 260} 1100 Z`" fill="url(#ocean-ray)" />
    </g>

    <path d="M0 0 Q120 -70 300 -40 Q420 -20 480 -60 L470 0 L480 60 Q420 20 300 40 Q120 70 0 0 Z M210 -20 Q260 -110 330 -96 Q290 -60 280 -30 Z" fill="#14478a" opacity="0.45" class="whale" />

    <path :d="FAR_KELP" stroke="#2f6aa8" stroke-width="14" fill="none" stroke-linecap="round" />
    <path d="M-60 820 L-60 740 Q60 690 160 730 Q240 680 340 720 Q420 700 500 750 L640 760 Q720 720 820 760 Q960 740 1080 770 Q1180 720 1300 740 Q1400 690 1520 730 Q1620 700 1720 740 Q1840 700 1980 730 L1980 860 L-60 860 Z" fill="#2f6aa8" stroke="#4a8ac8" stroke-width="3" stroke-linejoin="round" />
    <path d="M200 760 L250 752 M760 778 L820 772 M1240 760 L1290 754 M1600 756 L1660 762" stroke="#24588f" stroke-width="5" stroke-linecap="round" opacity="0.8" />
    <rect x="-60" y="620" width="2040" height="260" fill="url(#ocean-haze)" />

    <g v-for="(j, i) in JELLIES" :key="`j${i}`" class="jelly-drift" :style="{ animationDelay: `-${j.d}s`, animationDuration: `${j.s}s` }">
      <g :transform="`translate(${j.x} 1150)`">
        <path d="M-26 0 q-10 30 0 60 q10 30 0 60 M-8 0 q10 34 0 70 q-10 30 0 66 M10 0 q-10 30 0 64 q10 30 0 56 M28 0 q10 30 0 60" :stroke="j.c" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
        <g class="jelly">
          <path d="M-46 0 Q-48 -60 0 -62 Q48 -60 46 0 Q36 -8 23 2 Q12 -8 0 2 Q-12 -8 -23 2 Q-36 -8 -46 0 Z" :fill="j.c" fill-opacity="0.85" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
          <path d="M-28 -6 Q-28 -42 0 -44 Q28 -42 28 -6" :fill="j.l" opacity="0.6" />
          <path d="M-30 -30 Q-24 -48 -6 -52" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
          <circle cx="-12" cy="-20" r="4" fill="#1b1033" />
          <circle cx="12" cy="-20" r="4" fill="#1b1033" />
          <ellipse cx="-20" cy="-12" rx="6" ry="3" fill="#ff5a9a" opacity="0.6" />
          <ellipse cx="20" cy="-12" rx="6" ry="3" fill="#ff5a9a" opacity="0.6" />
        </g>
      </g>
    </g>

    <g class="fish" style="animation-duration: 40s; animation-delay: -12s">
      <g transform="translate(0 540)" fill="#a8e8ff" stroke="#1b4a8a" stroke-width="3" stroke-linejoin="round" opacity="0.8">
        <path v-for="(f, i) in SCHOOL" :key="`sc${i}`" :d="`M${f.x} ${f.y} Q${f.x + 14} ${f.y - 10} ${f.x + 30} ${f.y} Q${f.x + 14} ${f.y + 10} ${f.x} ${f.y} L${f.x - 10} ${f.y - 7} L${f.x - 10} ${f.y + 7} Z`" />
      </g>
    </g>

    <g v-for="(f, i) in FISH" :key="`f${i}`" class="fish" :class="{ back: f.back }" :style="{ animationDelay: `-${f.d}s`, animationDuration: `${f.s}s` }">
      <g :transform="`translate(0 ${f.y}) scale(${f.back ? -f.size : f.size} ${f.size})`">
        <path d="M4 0 L-34 -28 Q-26 0 -34 28 Z" :fill="f.c" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M30 -30 Q44 -52 66 -40 Q56 -32 54 -24 Z" :fill="f.c" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M0 0 Q36 -42 96 -2 Q40 36 0 0 Z" :fill="f.c" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
        <path d="M12 4 Q44 26 84 6 Q44 18 12 4 Z" :fill="f.b" />
        <path d="M38 -22 Q30 0 38 18 M54 -22 Q48 0 54 16" :stroke="f.st" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M18 -12 Q30 -24 50 -26" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
        <circle cx="74" cy="-6" r="8" fill="#fff" stroke="#1b1033" stroke-width="3" />
        <circle cx="76" cy="-6" r="4" fill="#1b1033" />
        <path d="M86 8 Q90 10 92 6" stroke="#1b1033" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <path d="M-60 900 Q240 860 520 890 Q800 920 1060 884 Q1340 850 1620 890 Q1820 912 1980 880 L1980 1200 L-60 1200 Z" fill="url(#ocean-sand)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M300 950 Q340 940 380 950 M640 970 Q690 958 740 970 M980 940 Q1030 930 1080 942 M1240 990 Q1300 978 1360 990 M820 1060 Q880 1048 940 1060 M520 1040 Q560 1030 600 1040" stroke="#b8803e" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />

    <path d="M-60 970 L-60 760 Q40 700 160 730 Q260 696 340 768 Q404 830 380 970 Z" fill="url(#ocean-rock)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1980 960 L1980 760 Q1880 690 1770 724 Q1660 700 1590 776 Q1530 840 1556 960 Z" fill="url(#ocean-rock)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M60 820 L120 810 M220 860 L280 850 M1700 820 L1760 830 M1820 880 L1880 870" stroke="#2a2060" stroke-width="5" stroke-linecap="round" opacity="0.5" />

    <g class="ocean-sway-l">
      <path v-for="(k, i) in KELP_L" :key="`kls${i}`" :d="k.stem" stroke="#1b1033" stroke-width="18" fill="none" stroke-linecap="round" />
      <path v-for="(k, i) in KELP_L" :key="`klc${i}`" :d="k.stem" stroke="#3aa860" stroke-width="10" fill="none" stroke-linecap="round" />
      <path v-for="(k, i) in KELP_L" :key="`klb${i}`" :d="k.blades" fill="#2ed47a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>
    <g class="ocean-sway-r">
      <path v-for="(k, i) in KELP_R" :key="`krs${i}`" :d="k.stem" stroke="#1b1033" stroke-width="18" fill="none" stroke-linecap="round" />
      <path v-for="(k, i) in KELP_R" :key="`krc${i}`" :d="k.stem" stroke="#3aa860" stroke-width="10" fill="none" stroke-linecap="round" />
      <path v-for="(k, i) in KELP_R" :key="`krb${i}`" :d="k.blades" fill="#2ed47a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>

    <g transform="translate(150 736)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M0 0 L0 -80 M0 -46 L-44 -104 M0 -36 L46 -96 M-44 -104 L-54 -146 M46 -96 L64 -136 M0 -80 L10 -128" stroke="#1b1033" stroke-width="32" />
      <path d="M0 0 L0 -80 M0 -46 L-44 -104 M0 -36 L46 -96 M-44 -104 L-54 -146 M46 -96 L64 -136 M0 -80 L10 -128" stroke="#ff6a9a" stroke-width="22" />
      <path d="M-4 -10 L-4 -76 M-46 -108 L-54 -140 M42 -96 L58 -128" stroke="#ffc0d8" stroke-width="6" />
    </g>
    <g transform="translate(300 776)">
      <g fill="#a66bff" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)">
        <rect x="-50" y="-90" width="34" height="96" rx="12" />
        <rect x="-12" y="-130" width="38" height="136" rx="12" />
        <rect x="30" y="-70" width="30" height="76" rx="12" />
      </g>
      <g fill="#3a1f6a" stroke="#1b1033" stroke-width="3">
        <ellipse cx="-33" cy="-86" rx="12" ry="5" />
        <ellipse cx="7" cy="-126" rx="14" ry="5" />
        <ellipse cx="45" cy="-66" rx="10" ry="4" />
      </g>
    </g>

    <g transform="translate(1720 732)">
      <path d="M0 10 Q-130 -40 -110 -170 Q-20 -250 90 -190 Q140 -80 0 10 Z" fill="#c86bff" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M0 4 L-90 -150 M0 4 L-40 -200 M0 4 L20 -210 M0 4 L80 -170 M-100 -110 Q-10 -150 104 -120 M-80 -60 Q0 -90 90 -70" stroke="#7a2ab0" stroke-width="4" fill="none" opacity="0.7" />
      <path d="M0 10 L0 -20" stroke="#1b1033" stroke-width="14" stroke-linecap="round" />
    </g>
    <g transform="translate(1600 790)" fill="none" stroke-linecap="round">
      <path d="M0 0 Q-10 -50 -40 -80 M-6 -40 Q20 -70 30 -110 M-30 -70 L-56 -90 M20 -90 L50 -100" stroke="#1b1033" stroke-width="28" />
      <path d="M0 0 Q-10 -50 -40 -80 M-6 -40 Q20 -70 30 -110 M-30 -70 L-56 -90 M20 -90 L50 -100" stroke="#ff8a3d" stroke-width="18" />
      <path d="M-4 -10 Q-12 -44 -36 -72" stroke="#ffd0a8" stroke-width="5" />
    </g>

    <g transform="translate(500 930)">
      <ellipse cx="0" cy="8" rx="90" ry="12" fill="#5a3a1a" opacity="0.3" />
      <path d="M-80 6 Q-82 -80 0 -82 Q82 -80 80 6 Z" fill="#ffc84a" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-56 -10 Q-40 -50 -10 -40 Q10 -70 40 -46 Q60 -40 56 -10 M-30 -6 Q-20 -30 0 -20 Q20 -40 30 -10" stroke="#c88a1a" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>
    <g transform="translate(640 950)">
      <g class="ocean-anemone">
        <path v-for="a in ANEMONE" :key="a" :d="`M${a * 0.5} 0 Q${a * 0.7} -40 ${a * 1.2} -70`" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
        <path v-for="a in ANEMONE" :key="`c${a}`" :d="`M${a * 0.5} 0 Q${a * 0.7} -40 ${a * 1.2} -70`" stroke="#ff7ac8" stroke-width="8" fill="none" stroke-linecap="round" />
      </g>
      <ellipse cx="0" cy="0" rx="40" ry="14" fill="#c23a8a" stroke="#1b1033" stroke-width="4" />
    </g>

    <ellipse cx="1400" cy="950" rx="170" ry="70" fill="url(#ocean-gold)" class="glow" />
    <g transform="translate(1400 970)">
      <ellipse cx="0" cy="10" rx="110" ry="14" fill="#5a3a1a" opacity="0.35" />
      <path d="M-80 -60 Q-80 -110 0 -112 Q80 -110 80 -60 Z" fill="#a8683e" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" transform="rotate(-14 -80 -60)" />
      <path d="M-70 -66 Q-30 -60 10 -76 Q30 -84 50 -90" stroke="#ffd23f" stroke-width="10" stroke-linecap="round" />
      <circle cx="-30" cy="-72" r="10" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
      <circle cx="20" cy="-82" r="10" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
      <path d="M-80 10 L-80 -60 L80 -60 L80 10 Z" fill="#8a4e2a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-40 -60 L-40 10 M40 -60 L40 10" stroke="#ffc84a" stroke-width="8" />
      <rect x="-12" y="-50" width="24" height="26" rx="4" fill="#ffd23f" stroke="#1b1033" stroke-width="3" />
      <path d="M-70 -30 L-50 -30 M50 -20 L70 -20" stroke="#5a2e14" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    </g>

    <path d="M-60 1200 Q-40 1020 120 1000 Q260 990 300 1080 Q320 1140 320 1200 Z M1980 1200 Q1980 1010 1820 1000 Q1680 996 1650 1090 Q1630 1150 1640 1200 Z" fill="#c8945a" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <g transform="translate(860 1010) rotate(-12)">
      <path d="M0 -36 L10 -12 L36 -10 L16 6 L24 32 L0 18 L-24 32 L-16 6 L-36 -10 L-10 -12 Z" fill="#ff7a2f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <circle cx="0" cy="-16" r="2.5" fill="#fff2a8" />
      <circle cx="10" cy="0" r="2.5" fill="#fff2a8" />
      <circle cx="-10" cy="2" r="2.5" fill="#fff2a8" />
    </g>
    <g transform="translate(1120 990)">
      <path d="M-26 6 Q-30 -26 0 -30 Q30 -26 26 6 Z" fill="#ffd0e0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M0 4 L0 -26 M-12 4 L-18 -20 M12 4 L18 -20" stroke="#e08aa8" stroke-width="3" />
    </g>
    <circle cx="1000" cy="1080" r="8" fill="#a8743e" />
    <circle cx="760" cy="960" r="6" fill="#a8743e" />

    <g
      v-for="(sheet, i) in BUBBLES"
      :key="`b${i}`"
      fill="#ffffff"
      fill-opacity="0.2"
      stroke="#ffffff"
      stroke-opacity="0.75"
      stroke-width="3"
      class="bubble"
      :style="{ animationDuration: `${sheet.s}s` }"
    >
      <g v-for="copy in 2" :key="copy" :transform="copy === 2 ? 'translate(-30 1240)' : undefined">
        <circle v-for="(b, j) in sheet.dots" :key="j" :cx="b.x" :cy="b.y" :r="b.r" />
      </g>
    </g>

    <g fill="#0a2250" stroke="#04122a" stroke-width="6" stroke-linejoin="round">
      <path d="M-60 1200 Q-60 980 40 900 Q60 1000 90 1040 Q120 920 200 860 Q190 980 210 1060 Q260 1000 320 980 Q260 1080 280 1200 Z" />
      <path d="M1980 1200 Q1990 960 1880 880 Q1870 990 1840 1040 Q1810 940 1720 900 Q1740 1000 1720 1070 Q1670 1020 1610 1010 Q1660 1100 1650 1200 Z" />
    </g>
    <path d="M30 940 Q20 990 40 1040 M1880 920 Q1890 980 1870 1030" stroke="#2a5a98" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6" />
  </g>
</template>

<style scoped>
.ocean-rays {
  transform-origin: 960px -60px;
  animation: ocean-rays 9s ease-in-out infinite alternate;
}

.ocean-sway-l,
.ocean-sway-r {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: ocean-sway 4.5s ease-in-out infinite alternate;
}

.ocean-sway-r {
  animation-delay: -2s;
}

.ocean-anemone {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: ocean-sway 2.6s ease-in-out infinite alternate;
}

@keyframes ocean-rays {
  from {
    rotate: -3deg;
    opacity: 0.7;
  }
  to {
    rotate: 3deg;
    opacity: 1;
  }
}

/* skew, not rotate: a skew around the bottom edge keeps every stalk rooted in the sand */
@keyframes ocean-sway {
  from {
    transform: skewX(-5deg);
  }
  to {
    transform: skewX(5deg);
  }
}
</style>
