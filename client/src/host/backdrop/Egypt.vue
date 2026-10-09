<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(1347);
const f1 = (n: number) => n.toFixed(1);

const courses = (ax: number, ay: number, lx: number, rx: number, by: number, step: number) => {
  let d = '';
  for (let y = ay + step; y < by; y += step) {
    const t = (y - ay) / (by - ay);
    d += `M${f1(ax + (lx - ax) * t)} ${y} L${f1(ax + (rx - ax) * t)} ${y} `;
  }
  return d;
};
const PYRAMIDS = [
  { ax: 1730, ay: 430, l: 1500, m: 1790, r: 1980, by: 760, lit: 'url(#egypt-pyr-far)', shade: '#d39a68', line: '#c4885a', o: 0.9 },
  { ax: 480, ay: 610, l: 360, m: 510, r: 610, by: 760, lit: 'url(#egypt-pyr-far)', shade: '#d39a68', line: '#c4885a', o: 0.8 },
  { ax: 900, ay: 560, l: 760, m: 936, r: 1050, by: 760, lit: 'url(#egypt-pyr-far)', shade: '#d39a68', line: '#c4885a', o: 0.95 },
  { ax: 1300, ay: 320, l: 960, m: 1390, r: 1640, by: 760, lit: 'url(#egypt-pyr)', shade: 'url(#egypt-pyr-shade)', line: '#a8663a', o: 1 },
].map((p) => ({ ...p, lines: courses(p.ax, p.ay, p.l, p.m, p.by, p.by - p.ay > 300 ? 34 : 26) }));

const CAMELS = [0, 120, 240];
const SPARKLES = Array.from({ length: 7 }, () => ({ x: 1480 + rnd() * 400, y: 948 + rnd() * 50, r: 6 + rnd() * 6 }));
const PALMS = [
  { x: 1600, y: 950, h: 320, lean: -40, flip: 1, d: 0 },
  { x: 1880, y: 960, h: 420, lean: 30, flip: -1, d: 1.8 },
  { x: 1750, y: 930, h: 220, lean: -10, flip: 1, d: 0.9 },
];
const REEDS = [1420, 1460, 1920, 1955];
const SAND_DOTS = Array.from({ length: 40 }, () => `M${f1(rnd() * 1920)} ${f1(980 + rnd() * 140)} h0.1`).join(' ');
</script>

<template>
  <g>
    <defs>
      <radialGradient id="egypt-sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="60%" stop-color="#fff3b0" />
        <stop offset="100%" stop-color="#ffd25a" />
      </radialGradient>
      <linearGradient id="egypt-pyr" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffe7b4" />
        <stop offset="100%" stop-color="#ecbc7c" />
      </linearGradient>
      <linearGradient id="egypt-pyr-shade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d0925a" />
        <stop offset="100%" stop-color="#a86a3c" />
      </linearGradient>
      <linearGradient id="egypt-pyr-far" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffe9c4" />
        <stop offset="100%" stop-color="#f2c996" />
      </linearGradient>
      <linearGradient id="egypt-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff2d0" stop-opacity="0" />
        <stop offset="60%" stop-color="#fff2d0" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fff2d0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="egypt-dune-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbe0a8" />
        <stop offset="100%" stop-color="#f1c98a" />
      </linearGradient>
      <linearGradient id="egypt-dune-mid" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffd690" />
        <stop offset="60%" stop-color="#f0b46a" />
        <stop offset="100%" stop-color="#dc9a52" />
      </linearGradient>
      <linearGradient id="egypt-dune-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f4b366" />
        <stop offset="100%" stop-color="#c47a3a" />
      </linearGradient>
      <linearGradient id="egypt-stone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fbd9a0" />
        <stop offset="55%" stop-color="#e5ae6c" />
        <stop offset="100%" stop-color="#b9783e" />
      </linearGradient>
      <linearGradient id="egypt-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5fd8e8" />
        <stop offset="100%" stop-color="#1f86b8" />
      </linearGradient>
      <linearGradient id="egypt-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff2a0" />
        <stop offset="50%" stop-color="#ffcc33" />
        <stop offset="100%" stop-color="#d9861c" />
      </linearGradient>
      <linearGradient id="egypt-cat" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4a3e6a" />
        <stop offset="60%" stop-color="#241c3a" />
        <stop offset="100%" stop-color="#140f24" />
      </linearGradient>
    </defs>

    <circle cx="300" cy="170" r="240" fill="#fff6c8" opacity="0.22" />
    <circle cx="300" cy="170" r="150" fill="#fff6c8" fill-opacity="0.35" class="glow" />
    <circle cx="300" cy="170" r="84" fill="url(#egypt-sun)" stroke="#e8a23a" stroke-width="4" />
    <path d="M254 136 Q272 112 306 108" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.85" />

    <g fill="#fffaf0" opacity="0.75">
      <path d="M1420 150 Q1500 120 1600 136 Q1680 128 1760 148 Q1700 166 1580 164 Q1480 170 1420 150 Z" />
      <path d="M600 90 Q660 70 740 82 Q800 78 840 94 Q780 106 690 104 Q630 106 600 90 Z" />
    </g>

    <g v-for="(b, i) in [{ y: 230, k: 0.6, s: 34, d: 6 }, { y: 300, k: 0.45, s: 42, d: 24 }]" :key="`bd${i}`" class="gull" :style="{ animationDelay: `-${b.d}s`, animationDuration: `${b.s}s` }">
      <g :transform="`translate(0 ${b.y}) scale(${b.k})`">
        <path d="M-40 0 Q-20 -24 0 0 Q20 -24 40 0" stroke="#5a3a2a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" class="flap" />
      </g>
    </g>

    <g v-for="(p, i) in PYRAMIDS" :key="`py${i}`" :opacity="p.o" stroke-linejoin="round">
      <path :d="`M${p.ax} ${p.ay} L${p.l} ${p.by} L${p.m} ${p.by} Z`" :fill="p.lit" :stroke="p.line" stroke-width="3" />
      <path :d="`M${p.ax} ${p.ay} L${p.m} ${p.by} L${p.r} ${p.by} Z`" :fill="p.shade" :stroke="p.line" stroke-width="3" />
      <path :d="p.lines" :stroke="p.line" stroke-width="2" opacity="0.45" />
    </g>
    <path d="M1300 320 L1262 362 L1314 362 Z" fill="url(#egypt-gold)" stroke="#a8663a" stroke-width="3" stroke-linejoin="round" />
    <path d="M1300 320 L1314 362 L1330 354 Z" fill="#d9861c" stroke="#a8663a" stroke-width="3" stroke-linejoin="round" />
    <path d="M1286 344 L1296 330" stroke="#fff" stroke-width="4" stroke-linecap="round" />
    <path d="M1290 340 L1150 520 M1110 600 L1060 660" stroke="#fff6dc" stroke-width="5" stroke-linecap="round" opacity="0.6" />

    <path d="M-60 735 Q480 714 960 728 Q1440 742 1980 720 L1980 900 L-60 900 Z" fill="url(#egypt-dune-far)" stroke="#d8a46a" stroke-width="3" stroke-linejoin="round" />
    <path d="M120 760 Q300 748 480 756 M1300 768 Q1500 760 1700 754" stroke="#fff4d6" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    <g class="egypt-caravan">
      <g transform="translate(0 731) scale(0.55)" fill="#9a6440" stroke="#7a4a2a" stroke-width="3" stroke-linejoin="round">
        <g class="egypt-plod">
          <g v-for="x in CAMELS" :key="`cm${x}`" :transform="`translate(${x} 0)`">
            <path d="M-44 0 L-40 -50 M-30 0 L-28 -50 M22 0 L20 -50 M34 0 L32 -50" stroke-width="8" stroke-linecap="round" fill="none" />
            <path d="M-50 -50 Q-56 -80 -30 -86 Q-14 -120 6 -88 Q20 -84 34 -70 Q48 -60 52 -70 L62 -108 Q70 -122 86 -116 L96 -110 L84 -102 L76 -70 Q70 -46 40 -44 Z" />
            <path d="M-14 -112 L-6 -100" stroke-width="5" stroke-linecap="round" />
            <path d="M-50 -60 Q-62 -56 -60 -40" stroke-width="5" fill="none" stroke-linecap="round" />
          </g>
          <path d="M-120 0 L-114 -52 M-104 0 L-106 -52" stroke-width="8" stroke-linecap="round" fill="none" />
          <path d="M-124 -50 L-100 -50 L-104 -96 L-120 -96 Z" />
          <circle cx="-112" cy="-108" r="12" />
          <path d="M-100 -80 L-60 -70" stroke-width="5" fill="none" />
        </g>
      </g>
    </g>
    <rect x="-60" y="620" width="2040" height="200" fill="url(#egypt-haze)" />

    <path d="M-60 850 Q400 790 820 826 Q1200 860 1600 812 Q1800 792 1980 812 L1980 1140 L-60 1140 Z" fill="url(#egypt-dune-mid)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M200 846 Q400 820 600 832 M1240 850 Q1420 830 1600 826" stroke="#fff0c8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    <g stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
      <path d="M1000 870 Q1010 846 1040 846 Q1070 848 1076 872 Z" fill="#c9884a" />
      <path d="M1060 874 Q1066 860 1084 860 Q1100 862 1102 876 Z" fill="#b9783e" />
    </g>
    <path d="M1012 860 Q1022 852 1036 852" stroke="#ffe0a8" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M900 880 Q1000 870 1100 882 M300 900 Q380 890 460 898 M1400 880 Q1500 872 1580 880" stroke="#c9884a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5" />

    <ellipse cx="660" cy="846" rx="260" ry="20" fill="#7a4a22" opacity="0.3" />
    <g transform="translate(430 846)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M12 -6 Q-30 -6 -42 -34 Q-46 -54 -30 -58" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M0 0 Q-16 -40 10 -80 Q40 -116 110 -106 Q170 -98 216 -116 Q250 -170 300 -172 L342 -130 Q356 -80 336 -44 L336 0 Z" fill="url(#egypt-stone)" stroke-width="5" filter="url(#cel)" />
      <path d="M26 -8 Q34 -70 104 -84" stroke-width="4" fill="none" opacity="0.6" />
      <path d="M40 -92 Q80 -108 130 -100 Q180 -94 214 -106" stroke="#fff0c8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.75" />
      <path d="M120 -60 Q170 -70 220 -64 M140 -30 Q200 -40 260 -34" stroke="#b9783e" stroke-width="3" fill="none" opacity="0.6" />
      <path d="M320 -44 L450 -44 Q472 -44 472 -22 L472 0 L320 0 Z" fill="url(#egypt-stone)" stroke-width="5" filter="url(#cel-s)" />
      <path d="M472 -16 h-26 M472 -30 h-26 M380 -44 V0" stroke-width="3" fill="none" opacity="0.5" />
      <path d="M240 -256 Q300 -290 360 -256 L384 -92 L346 -108 L346 -232 L254 -232 L254 -108 L216 -92 Z" fill="#2e6ad6" stroke-width="5" />
      <path d="M220 -100 L254 -114 M346 -114 L380 -100 M224 -148 L254 -154 M228 -172 L254 -178 M234 -198 L254 -204 M346 -154 L376 -148 M346 -178 L372 -172 M346 -204 L366 -198 M252 -264 Q300 -280 348 -264" stroke="#ffd23f" stroke-width="7" fill="none" />
      <path d="M246 -250 Q262 -266 286 -270" stroke="#8ab4ff" stroke-width="4" fill="none" stroke-linecap="round" />
      <rect x="256" y="-240" width="88" height="94" rx="18" fill="#f2bb76" stroke-width="5" />
      <path d="M270 -206 Q280 -214 290 -206 M310 -206 Q320 -214 330 -206" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M298 -198 L294 -178 L306 -178" stroke-width="3" fill="none" />
      <path d="M288 -166 Q300 -160 312 -166" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M290 -146 H310 V-112 Q300 -106 290 -112 Z" fill="#2e6ad6" stroke-width="4" />
      <path d="M290 -134 H310" stroke="#ffd23f" stroke-width="3" />
      <ellipse cx="274" cy="-184" rx="8" ry="5" fill="#ff8a6a" opacity="0.5" stroke="none" />
      <ellipse cx="326" cy="-184" rx="8" ry="5" fill="#ff8a6a" opacity="0.5" stroke="none" />
      <path d="M266 -230 Q272 -238 286 -236" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    </g>

    <path d="M-60 960 Q500 918 1000 948 Q1400 974 1980 936 L1980 1140 L-60 1140 Z" fill="url(#egypt-dune-near)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M300 950 Q520 930 760 940 M1100 968 Q1240 960 1380 962" stroke="#ffd690" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    <path d="M600 1020 Q700 1006 800 1022 Q900 1038 1000 1020 M1040 1080 Q1140 1066 1240 1080 M500 1090 Q580 1078 660 1092" stroke="#a8622a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.4" />
    <path :d="SAND_DOTS" stroke="#a8622a" stroke-width="4" stroke-linecap="round" opacity="0.35" />

    <g transform="translate(150 0)">
      <ellipse cx="20" cy="944" rx="110" ry="16" fill="#5a3010" opacity="0.35" />
      <path d="M-50 940 L-34 380 L34 380 L50 940 Z" fill="url(#egypt-stone)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-34 380 L0 320 L34 380 Z" fill="url(#egypt-gold)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M0 320 L34 380 L14 380 Z" fill="#d9861c" />
      <path d="M-14 350 L-4 334" stroke="#fff" stroke-width="4" stroke-linecap="round" />
      <path d="M-26 410 L-38 900" stroke="#fff0c8" stroke-width="5" stroke-linecap="round" opacity="0.6" />
      <g stroke="#9a5a2a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.75">
        <path d="M-16 440 Q0 424 16 440 Q0 456 -16 440 Z M0 436 v8 M-14 450 L-18 464" />
        <circle cx="0" cy="500" r="13" />
        <circle cx="0" cy="500" r="3" fill="#9a5a2a" />
        <path d="M-18 560 l6 -8 l6 8 l6 -8 l6 8 l6 -8 M-18 574 l6 -8 l6 8 l6 -8 l6 8 l6 -8" />
        <path d="M-10 640 Q-12 614 6 612 Q16 616 10 624 L18 628 L8 632 Q16 650 6 662 M-4 662 l-2 12 M4 662 l2 12" />
        <path d="M0 704 a10 12 0 1 1 0.1 0 M0 728 v36 M-14 738 h28" />
        <path d="M-6 800 Q-14 820 0 850 Q14 820 6 800 M0 800 V856" />
      </g>
    </g>

    <ellipse cx="1680" cy="972" rx="320" ry="52" fill="#5a3010" opacity="0.25" />
    <path d="M1380 966 Q1400 920 1680 916 Q1960 920 1990 966 Q1960 1010 1680 1014 Q1400 1010 1380 966 Z" fill="url(#egypt-water)" stroke="#1b1033" stroke-width="5" />
    <path d="M1420 950 Q1560 930 1700 932" stroke="#bff6ff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8" />
    <path d="M1480 980 h80 M1620 990 h120 M1780 974 h80 M1540 1000 h60" stroke="#9eeaf5" stroke-width="4" stroke-linecap="round" opacity="0.6" />
    <g class="egypt-glint">
      <path v-for="(s, i) in SPARKLES" :key="`sp${i}`" :d="`M${f1(s.x)} ${f1(s.y - s.r)} Q${f1(s.x)} ${f1(s.y)} ${f1(s.x + s.r)} ${f1(s.y)} Q${f1(s.x)} ${f1(s.y)} ${f1(s.x)} ${f1(s.y + s.r)} Q${f1(s.x)} ${f1(s.y)} ${f1(s.x - s.r)} ${f1(s.y)} Q${f1(s.x)} ${f1(s.y)} ${f1(s.x)} ${f1(s.y - s.r)} Z`" fill="#ffffff" />
    </g>
    <path :d="tufts(1360, 930, 1990, 0.03)" stroke="#3f8a2a" stroke-width="5" fill="none" stroke-linecap="round" />

    <g v-for="(p, i) in PALMS" :key="`pm${i}`" :transform="`translate(${p.x} ${p.y})`">
      <ellipse cx="0" cy="6" rx="70" ry="12" fill="#3a2010" opacity="0.3" />
      <g class="egypt-palm" :style="{ animationDelay: `-${p.d}s` }">
        <path :d="`M0 0 Q${p.lean * 0.2} ${-p.h * 0.5} ${p.lean} ${-p.h}`" stroke="#1b1033" stroke-width="34" fill="none" stroke-linecap="round" />
        <path :d="`M0 0 Q${p.lean * 0.2} ${-p.h * 0.5} ${p.lean} ${-p.h}`" stroke="#b77744" stroke-width="22" fill="none" stroke-linecap="round" />
        <path :d="`M0 0 Q${p.lean * 0.2} ${-p.h * 0.5} ${p.lean} ${-p.h}`" stroke="#7d4a26" stroke-width="22" fill="none" stroke-dasharray="5 24" />
        <g :transform="`translate(${p.lean} ${-p.h}) scale(${p.flip * 0.85} 0.85)`">
          <g fill="#2fae5a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
            <path d="M0 0 Q-130 -40 -220 60 Q-110 0 0 0 Z" />
            <path d="M0 0 Q130 -50 230 40 Q110 0 0 0 Z" />
            <path d="M0 0 Q-40 -120 -130 -150 Q-30 -70 0 0 Z" />
            <path d="M0 0 Q70 -110 170 -120 Q60 -60 0 0 Z" />
            <path d="M0 0 Q-90 30 -120 120 Q-60 30 0 0 Z" fill="#22904a" />
          </g>
          <path d="M-6 -4 Q-110 -20 -200 46 M6 -6 Q110 -30 210 30 M-4 -8 Q-40 -100 -118 -138 M4 -8 Q60 -90 156 -112" stroke="#8be8a8" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
          <circle cx="-12" cy="10" r="12" fill="#c4553a" stroke="#1b1033" stroke-width="4" />
          <circle cx="10" cy="14" r="12" fill="#a8402a" stroke="#1b1033" stroke-width="4" />
        </g>
      </g>
    </g>
    <g v-for="(x, i) in REEDS" :key="`rd${x}`" :transform="`translate(${x} 966) scale(${i % 2 ? 0.8 : 1})`">
      <path d="M0 0 Q-4 -60 -14 -110 M8 0 Q12 -50 26 -90" stroke="#1b1033" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M0 0 Q-4 -60 -14 -110 M8 0 Q12 -50 26 -90" stroke="#4aa83a" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-14 -110 l-22 -14 M-14 -110 l-12 -24 M-14 -110 l2 -26 M-14 -110 l14 -20 M-14 -110 l22 -10 M26 -90 l-18 -16 M26 -90 l-4 -24 M26 -90 l12 -20 M26 -90 l22 -8" stroke="#1b1033" stroke-width="7" stroke-linecap="round" />
      <path d="M-14 -110 l-22 -14 M-14 -110 l-12 -24 M-14 -110 l2 -26 M-14 -110 l14 -20 M-14 -110 l22 -10 M26 -90 l-18 -16 M26 -90 l-4 -24 M26 -90 l12 -20 M26 -90 l22 -8" stroke="#8ade4a" stroke-width="3.5" stroke-linecap="round" />
    </g>

    <g transform="translate(360 1068)">
      <ellipse cx="0" cy="6" rx="130" ry="16" fill="#3a2010" opacity="0.4" />
      <rect x="-100" y="-70" width="200" height="76" rx="6" fill="url(#egypt-stone)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-100 -50 H100" stroke="#9a5a2a" stroke-width="3" opacity="0.5" />
      <g stroke="#9a5a2a" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7">
        <path d="M-74 -28 Q-60 -40 -46 -28 Q-60 -16 -74 -28 Z" />
        <path d="M-24 -38 v22 M-32 -30 h16" />
        <path d="M10 -20 l6 -8 l6 8 l6 -8 l6 8" />
        <circle cx="68" cy="-27" r="10" />
      </g>
      <path d="M50 -70 Q90 -72 86 -110 Q82 -136 62 -130" stroke="#1b1033" stroke-width="16" fill="none" stroke-linecap="round" />
      <path d="M50 -70 Q90 -72 86 -110 Q82 -136 62 -130" stroke="#3a2e58" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M-46 -70 Q-60 -170 -26 -224 L-40 -290 L-6 -254 Q0 -258 6 -254 L40 -290 L26 -224 Q60 -170 46 -70 Z" fill="url(#egypt-cat)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-32 -276 L-16 -246 M32 -276 L16 -246" stroke="#7a5aa6" stroke-width="5" stroke-linecap="round" />
      <path d="M-30 -186 Q0 -170 30 -186 L28 -172 Q0 -156 -28 -172 Z" fill="url(#egypt-gold)" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
      <path d="M-4 -166 L0 -150 L4 -166 Z" fill="#3ad6e0" stroke="#1b1033" stroke-width="2.5" />
      <path d="M-22 -228 Q-14 -234 -6 -228 Q-14 -222 -22 -228 Z M6 -228 Q14 -234 22 -228 Q14 -222 6 -228 Z" fill="#9dff5a" stroke="#1b1033" stroke-width="2" />
      <path d="M-4 -212 L0 -208 L4 -212" stroke="#ff9ab0" stroke-width="3" fill="none" stroke-linecap="round" />
      <circle cx="30" cy="-226" r="6" fill="url(#egypt-gold)" stroke="#1b1033" stroke-width="2.5" />
      <path d="M-34 -150 Q-44 -120 -36 -84" stroke="#8a7ac0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      <path d="M-30 -240 Q-24 -250 -16 -246" stroke="#8a7ac0" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-20 -70 V-110 M20 -70 V-110" stroke="#0c0818" stroke-width="4" opacity="0.6" />
    </g>

    <g fill="#5a2e14" stroke="#2a1408" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 L-60 960 Q0 940 70 976 Q120 1000 140 1060 Q170 1090 160 1140 Z" />
      <path d="M1980 1140 V1010 Q1940 1000 1910 1030 Q1880 1070 1840 1090 L1830 1140 Z" />
    </g>
    <path d="M-30 990 Q20 978 60 994 M1940 1030 Q1960 1022 1975 1026" stroke="#8a4a24" stroke-width="5" fill="none" stroke-linecap="round" />
  </g>
</template>

<style scoped>
.egypt-caravan {
  animation: egypt-trek 110s linear infinite;
}

.egypt-plod {
  animation: egypt-plod 0.9s ease-in-out infinite alternate;
}

.egypt-palm {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: egypt-sway 5s ease-in-out infinite alternate;
}

.egypt-glint {
  animation: egypt-glint 2.6s ease-in-out infinite;
}

@keyframes egypt-trek {
  from {
    translate: -200px 0;
  }
  to {
    translate: 2120px 0;
  }
}

@keyframes egypt-plod {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -4px;
  }
}

@keyframes egypt-sway {
  from {
    rotate: -1.5deg;
  }
  to {
    rotate: 1.5deg;
  }
}

@keyframes egypt-glint {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
