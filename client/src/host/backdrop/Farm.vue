<script setup lang="ts">
import { seeded, tufts } from './kit';

const rnd = seeded(322);
const CLOUDS = Array.from({ length: 3 }, (_, i) => ({ y: 110 + i * 90 + rnd() * 40, k: 0.7 + rnd() * 0.5, d: rnd() * 60 + i * 25, s: 60 + rnd() * 30 }));
const FAR_TREES = [
  { x: 120, y: 650, r: 26 },
  { x: 160, y: 656, r: 20 },
  { x: 760, y: 676, r: 24 },
  { x: 1060, y: 640, r: 28 },
  { x: 1100, y: 646, r: 20 },
  { x: 1790, y: 642, r: 26 },
];
const HAY = [
  { x: 1700, y: 1010, k: 1 },
  { x: 1560, y: 1040, k: 0.85 },
  { x: 150, y: 1020, k: 0.9 },
];
const FENCES = [
  [-20, 90, 200, 310, 420, 530],
  [1390, 1500, 1610, 1720, 1830, 1940],
].map((posts) => ({ posts, first: Math.min(...posts), last: Math.max(...posts) }));
const SUNFLOWERS = [
  { x: 300, y: 1010, h: 250, d: 0 },
  { x: 390, y: 1040, h: 196, d: 1.6 },
];
const PETALS = Array.from({ length: 10 }, (_, i) => i * 36);
const BLADES = [0, 90, 180, 270];
const LATTICE = [-70, -100, -130, -160];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="farm-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b9e2b0" />
        <stop offset="100%" stop-color="#9fd29a" />
      </linearGradient>
      <linearGradient id="farm-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eaf8ff" stop-opacity="0" />
        <stop offset="60%" stop-color="#eaf8ff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#eaf8ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="farm-mid" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#9be35e" />
        <stop offset="50%" stop-color="#6ccb4c" />
      </linearGradient>
      <linearGradient id="farm-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5fc44f" />
        <stop offset="100%" stop-color="#3a9a3e" />
      </linearGradient>
      <linearGradient id="farm-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2f8a3c" />
        <stop offset="100%" stop-color="#17542a" />
      </linearGradient>
      <linearGradient id="farm-wheat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe28a" />
        <stop offset="100%" stop-color="#f2b84a" />
      </linearGradient>
      <linearGradient id="farm-path" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f3d9a4" />
        <stop offset="100%" stop-color="#d9a866" />
      </linearGradient>
      <linearGradient id="farm-red" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f05a4a" />
        <stop offset="100%" stop-color="#c22f36" />
      </linearGradient>
      <linearGradient id="farm-tin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#eef2fb" />
        <stop offset="45%" stop-color="#c3cde3" />
        <stop offset="100%" stop-color="#8592b4" />
      </linearGradient>
      <linearGradient id="farm-stone" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fffaf0" />
        <stop offset="60%" stop-color="#f0e2cc" />
        <stop offset="100%" stop-color="#d6c2a6" />
      </linearGradient>
      <linearGradient id="farm-wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e0a464" />
        <stop offset="100%" stop-color="#b47640" />
      </linearGradient>
      <linearGradient id="farm-hide" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#e2dcef" />
      </linearGradient>
    </defs>

    <circle cx="1560" cy="180" r="230" fill="#fff6c0" opacity="0.18" />
    <circle cx="1560" cy="180" r="140" fill="#fff6c0" fill-opacity="0.35" class="glow" />
    <circle cx="1560" cy="180" r="84" fill="#ffd23f" stroke="#1b1033" stroke-width="5" />
    <path d="M1600 210 Q1580 246 1536 252" stroke="#f0a92a" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.7" />
    <path d="M1520 140 Q1540 116 1576 112" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.85" />

    <g v-for="(c, i) in CLOUDS" :key="`fc${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-120 20 Q-150 -10 -110 -26 Q-100 -64 -50 -56 Q-24 -96 30 -80 Q70 -100 96 -60 Q140 -56 130 -16 Q150 12 110 20 Z" fill="#fff" stroke="#7fa6d6" stroke-width="4" stroke-linejoin="round" />
        <path d="M-110 16 Q0 4 112 16 Q40 30 -110 16 Z" fill="#cfe4f8" />
        <path d="M-70 -46 Q-50 -62 -28 -58 M10 -74 Q34 -86 56 -78" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <path d="M-60 690 Q160 610 420 650 Q700 700 980 630 Q1240 580 1520 640 Q1760 690 1980 620 L1980 1140 L-60 1140 Z" fill="url(#farm-far)" stroke="#6fa48e" stroke-width="3" stroke-linejoin="round" />
    <path d="M420 660 Q600 690 760 670 L820 720 Q600 740 380 720 Z" fill="#e4dc8a" opacity="0.8" />
    <path d="M440 680 L800 690 M410 700 L790 706" stroke="#c8b860" stroke-width="3" opacity="0.6" />
    <path d="M1200 620 Q1360 600 1500 640 L1520 690 Q1340 680 1180 680 Z" fill="#c6e48e" opacity="0.8" />
    <path d="M1210 640 L1500 660 M1200 662 L1510 676" stroke="#8fbf6a" stroke-width="3" opacity="0.6" />
    <g v-for="(t, i) in FAR_TREES" :key="`ft${i}`">
      <path :d="`M${t.x} ${t.y} V${t.y + 22}`" stroke="#6fa48e" stroke-width="5" stroke-linecap="round" />
      <circle :cx="t.x" :cy="t.y - t.r * 0.5" :r="t.r" fill="#86c48a" stroke="#6fa48e" stroke-width="3" />
      <path :d="`M${t.x - t.r * 0.5} ${t.y - t.r} q${t.r * 0.3} ${-t.r * 0.4} ${t.r * 0.7} ${-t.r * 0.3}`" stroke="#c4ecc0" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
    <rect x="-60" y="580" width="2040" height="200" fill="url(#farm-haze)" />

    <path d="M-60 780 Q260 712 620 740 Q980 770 1300 742 Q1640 710 1980 750 L1980 1140 L-60 1140 Z" fill="url(#farm-mid)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M560 768 Q780 754 950 770 Q990 806 1010 842 Q770 856 510 842 Q530 804 560 768 Z" fill="url(#farm-wheat)" stroke="#9a6a2a" stroke-width="4" stroke-linejoin="round" />
    <path d="M570 786 Q770 776 966 788 M548 808 Q770 798 984 810 M530 828 Q770 820 998 830" stroke="#c98a2a" stroke-width="4" stroke-linecap="round" opacity="0.55" />
    <path :d="tufts(40, 752, 520, 0.02)" stroke="#4f9e34" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <path :d="tufts(1060, 748, 1900, 0.02)" stroke="#4f9e34" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />

    <path d="M-60 880 Q480 830 960 852 Q1460 878 1980 838 L1980 1140 L-60 1140 Z" fill="url(#farm-near)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path :d="tufts(30, 856, 1900, 0.014)" stroke="#2e8034" stroke-width="5" fill="none" stroke-linecap="round" />

    <path d="M-60 975 Q960 935 1980 972 L1980 1140 L-60 1140 Z" fill="url(#farm-front)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(20, 962, 1900, 0.02)" stroke="#1d5e2a" stroke-width="5" fill="none" stroke-linecap="round" />

    <path d="M760 1140 Q900 960 1260 880 Q1440 840 1500 800 L1546 800 Q1510 850 1340 900 Q1080 980 1080 1140 Z" fill="url(#farm-path)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path d="M900 1080 Q980 990 1150 930 M1290 880 Q1400 850 1470 816" stroke="#b9844a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
    <g fill="#c99a62" stroke="#1b1033" stroke-width="2.5">
      <ellipse cx="960" cy="1060" rx="12" ry="7" />
      <ellipse cx="1120" cy="950" rx="9" ry="5" />
      <ellipse cx="1360" cy="878" rx="7" ry="4" />
    </g>

    <g transform="translate(330 770)">
      <ellipse cx="0" cy="4" rx="110" ry="14" fill="#1b3a10" opacity="0.3" />
      <path d="M-62 0 L-38 -262 L38 -262 L62 0 Z" fill="url(#farm-stone)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M-56 -60 L-30 -58 M10 -110 L40 -112 M-48 -170 L-22 -168 M14 -210 L36 -212 M30 -40 L52 -42" stroke="#c4ad8c" stroke-width="4" stroke-linecap="round" />
      <path d="M-18 0 V-56 Q0 -78 18 -56 V0 Z" fill="#8a4a2a" stroke="#1b1033" stroke-width="4" />
      <path d="M0 -70 V0" stroke="#5e2e18" stroke-width="3" />
      <rect x="-15" y="-170" width="30" height="40" rx="14" fill="#5a8fd0" stroke="#1b1033" stroke-width="4" />
      <path d="M-8 -160 Q-4 -166 2 -166" stroke="#d6ecff" stroke-width="4" fill="none" stroke-linecap="round" />
      <rect x="-70" y="-120" width="140" height="14" rx="4" fill="#b47640" stroke="#1b1033" stroke-width="4" />
      <path d="M-62 -106 V-84 M-30 -106 V-84 M30 -106 V-84 M62 -106 V-84 M-66 -84 H66" stroke="#1b1033" stroke-width="4" stroke-linecap="round" />
      <path d="M-52 -258 Q-52 -330 0 -338 Q52 -330 52 -258 Z" fill="url(#farm-red)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-30 -300 Q-20 -320 0 -324" stroke="#ff9a8a" stroke-width="5" fill="none" stroke-linecap="round" />
      <g transform="translate(0 -298)">
        <g class="farm-blades">
          <g v-for="a in BLADES" :key="a" :transform="`rotate(${a})`">
            <path d="M0 0 V-205" stroke="#1b1033" stroke-width="12" stroke-linecap="round" />
            <path d="M0 0 V-205" stroke="#a86a3a" stroke-width="6" stroke-linecap="round" />
            <rect x="6" y="-200" width="44" height="150" rx="3" fill="#fffaf0" fill-opacity="0.92" stroke="#1b1033" stroke-width="4" />
            <path :d="LATTICE.map((y) => `M6 ${y} H50`).join(' ') + ' M28 -200 V-50'" stroke="#c7a37a" stroke-width="3" />
          </g>
        </g>
      </g>
      <circle cx="0" cy="-298" r="16" fill="#ffd23f" stroke="#1b1033" stroke-width="4" />
      <circle cx="-4" cy="-302" r="4" fill="#fff" />
    </g>

    <g transform="translate(1420 800)">
      <ellipse cx="80" cy="6" rx="300" ry="20" fill="#1b3a10" opacity="0.3" />
      <path d="M330 0 V-310 L400 -310 V0 Z" fill="url(#farm-tin)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M330 -250 Q365 -240 400 -250 M330 -180 Q365 -170 400 -180 M330 -110 Q365 -100 400 -110 M330 -40 Q365 -30 400 -40" stroke="#6b7898" stroke-width="3" fill="none" />
      <path d="M342 -300 V-20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <path d="M326 -308 Q365 -380 404 -308 Z" fill="#8aa0c8" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M346 -326 Q356 -346 372 -350" stroke="#e6eeff" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-170 0 V-104 L0 -136 V0 Z" fill="#b8323a" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M-140 -10 V-100 M-110 -10 V-108 M-80 -8 V-114 M-50 -6 V-120 M-20 -4 V-126" stroke="#8a2030" stroke-width="3" opacity="0.6" />
      <path d="M-184 -96 L4 -150" stroke="#1b1033" stroke-width="24" stroke-linecap="round" />
      <path d="M-184 -96 L4 -150" stroke="#6a4a5a" stroke-width="15" stroke-linecap="round" />
      <rect x="-120" y="-78" width="44" height="40" fill="#ffd96b" stroke="#fffaf0" stroke-width="6" />
      <rect x="-120" y="-78" width="44" height="40" fill="none" stroke="#1b1033" stroke-width="3" />
      <path d="M0 0 V-172 L50 -252 L150 -294 L250 -252 L300 -172 V0 Z" fill="url(#farm-red)" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" filter="url(#cel)" />
      <path d="M30 -8 V-200 M60 -8 V-240 M90 -8 V-262 M210 -8 V-262 M240 -8 V-240 M270 -8 V-200" stroke="#a82432" stroke-width="3" opacity="0.55" />
      <path d="M-22 -164 L42 -262 L150 -308 L258 -262 L322 -164" stroke="#1b1033" stroke-width="30" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M-22 -164 L42 -262 L150 -308 L258 -262 L322 -164" stroke="#6a4a5a" stroke-width="20" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <path d="M-12 -170 L46 -258 L150 -302" stroke="#9a7a8a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M12 -160 L56 -230 L150 -270 L244 -230 L288 -160" stroke="#fffaf0" stroke-width="8" fill="none" stroke-linejoin="round" />
      <path d="M6 -150 V-6 M294 -150 V-6" stroke="#fffaf0" stroke-width="8" />
      <rect x="112" y="-232" width="76" height="58" fill="#5a2a1a" stroke="#1b1033" stroke-width="4" />
      <path d="M116 -174 Q130 -206 150 -190 Q170 -210 184 -174 Z" fill="#f2c14e" stroke="#1b1033" stroke-width="3" />
      <path d="M130 -190 L124 -204 M150 -194 L152 -210 M168 -188 L176 -202" stroke="#f2c14e" stroke-width="4" stroke-linecap="round" />
      <rect x="112" y="-232" width="76" height="58" fill="none" stroke="#fffaf0" stroke-width="6" />
      <rect x="82" y="-134" width="136" height="134" fill="#9a2430" stroke="#1b1033" stroke-width="5" />
      <g stroke="#fffaf0" stroke-width="8" fill="none" stroke-linejoin="round">
        <rect x="88" y="-128" width="58" height="122" />
        <rect x="154" y="-128" width="58" height="122" />
        <path d="M88 -128 L146 -6 M146 -128 L88 -6 M154 -128 L212 -6 M212 -128 L154 -6" />
      </g>
      <path d="M150 -134 V0" stroke="#1b1033" stroke-width="4" />
    </g>

    <g transform="translate(800 905)">
      <ellipse cx="-10" cy="4" rx="170" ry="16" fill="#123a10" opacity="0.3" />
      <path d="M108 -96 Q146 -84 136 -30" stroke="#1b1033" stroke-width="6" fill="none" stroke-linecap="round" class="farm-tail" />
      <g fill="#ece6f6" stroke="#1b1033" stroke-width="4">
        <rect x="-66" y="-56" width="24" height="56" rx="9" />
        <rect x="62" y="-56" width="24" height="56" rx="9" />
      </g>
      <path d="M-62 -10 h18 M66 -10 h18" stroke="#1b1033" stroke-width="10" />
      <path d="M20 -50 Q34 -24 48 -50 Z" fill="#ffb3c7" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <g fill="url(#farm-hide)" stroke="#1b1033" stroke-width="4">
        <rect x="-96" y="-56" width="26" height="56" rx="9" />
        <rect x="88" y="-56" width="26" height="56" rx="9" />
      </g>
      <path d="M-92 -10 h20 M92 -10 h20" stroke="#1b1033" stroke-width="10" />
      <path d="M-116 -110 Q-118 -150 -60 -150 L80 -150 Q126 -150 126 -104 Q126 -46 70 -44 L-60 -44 Q-118 -46 -116 -110 Z" fill="url(#farm-hide)" stroke="#1b1033" stroke-width="5" filter="url(#cel-s)" />
      <path d="M-40 -150 Q-50 -120 -20 -110 Q10 -104 0 -150 Z M60 -100 Q40 -80 60 -60 Q96 -56 104 -84 Q96 -104 60 -100 Z M-96 -76 Q-80 -96 -60 -80 Q-70 -56 -96 -60 Z" fill="#2a2140" />
      <path d="M-80 -132 Q-60 -144 -40 -144" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-188 -128 Q-216 -136 -222 -122 Q-208 -112 -184 -116 Z M-118 -130 Q-92 -140 -86 -126 Q-100 -116 -122 -118 Z" fill="#ece6f6" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-178 -142 Q-188 -164 -176 -170 M-128 -144 Q-118 -166 -130 -172" stroke="#1b1033" stroke-width="11" fill="none" stroke-linecap="round" />
      <path d="M-178 -142 Q-188 -164 -176 -170 M-128 -144 Q-118 -166 -130 -172" stroke="#fff3d6" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-190 -112 Q-196 -150 -154 -150 Q-112 -150 -116 -112 Q-118 -84 -154 -82 Q-188 -84 -190 -112 Z" fill="url(#farm-hide)" stroke="#1b1033" stroke-width="5" />
      <path d="M-170 -150 Q-160 -128 -150 -150 Z" fill="#2a2140" />
      <ellipse cx="-154" cy="-80" rx="34" ry="22" fill="#ffb3c7" stroke="#1b1033" stroke-width="4" />
      <ellipse cx="-166" cy="-80" rx="5" ry="7" fill="#c76a8a" />
      <ellipse cx="-142" cy="-80" rx="5" ry="7" fill="#c76a8a" />
      <path d="M-170 -92 Q-162 -98 -150 -96" stroke="#ffe0ea" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="-170" cy="-118" r="7" fill="#1b1033" />
      <circle cx="-138" cy="-118" r="7" fill="#1b1033" />
      <circle cx="-172" cy="-121" r="2.4" fill="#fff" />
      <circle cx="-140" cy="-121" r="2.4" fill="#fff" />
      <ellipse cx="-122" cy="-100" rx="8" ry="5" fill="#ff7a8a" opacity="0.5" />
      <path d="M-134 -60 Q-110 -50 -100 -62" stroke="#b05a2a" stroke-width="4" fill="none" />
      <path d="M-128 -60 Q-132 -36 -114 -36 Q-100 -40 -106 -60 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path d="M-122 -54 Q-120 -46 -116 -44" stroke="#fff6c8" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>

    <g v-for="(ch, i) in [{ x: 1130, y: 912, k: 1, d: 0 }, { x: 1250, y: 930, k: 0.9, d: 1.4 }]" :key="`ch${i}`" :transform="`translate(${ch.x} ${ch.y}) scale(${ch.k})`">
      <ellipse cx="4" cy="2" rx="40" ry="8" fill="#123a10" opacity="0.3" />
      <path d="M-6 -14 V0 L-14 4 M-6 0 L0 4 M10 -14 V0 L2 4 M10 0 L16 4" stroke="#ff8a2f" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <g class="farm-peck" :style="{ animationDelay: `-${ch.d}s` }">
        <path d="M-14 -50 Q-60 -54 -54 -92 Q-40 -96 -30 -80 Q-22 -98 -8 -90 Q-2 -70 4 -56 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-40 -82 Q-30 -66 -16 -58" stroke="#d6cbb6" stroke-width="3" fill="none" stroke-linecap="round" />
        <ellipse cx="0" cy="-34" rx="32" ry="25" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
        <path d="M-16 -36 Q2 -14 18 -36 Q2 -46 -16 -36 Z" fill="#ece3d2" stroke="#1b1033" stroke-width="2.5" />
        <path d="M-20 -50 Q-6 -58 8 -56" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cx="26" cy="-64" r="15" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
        <path d="M16 -76 Q16 -90 24 -84 Q28 -96 34 -84 Q42 -88 38 -74 Z" fill="#e23b3b" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M40 -66 L56 -60 L40 -55 Z" fill="#ffb02e" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
        <path d="M40 -54 Q44 -44 38 -44 Q34 -48 38 -54 Z" fill="#e23b3b" stroke="#1b1033" stroke-width="2.5" />
        <circle cx="30" cy="-68" r="3.5" fill="#1b1033" />
        <circle cx="29" cy="-69.5" r="1.2" fill="#fff" />
      </g>
    </g>
    <g v-for="(c, i) in [{ x: 1300, y: 920 }, { x: 1334, y: 934 }]" :key="`chk${i}`" :transform="`translate(${c.x} ${c.y})`">
      <ellipse cx="0" cy="2" rx="16" ry="4" fill="#123a10" opacity="0.3" />
      <circle cx="0" cy="-14" r="13" fill="#ffe14d" stroke="#1b1033" stroke-width="3" />
      <path d="M-7 -20 Q-2 -24 3 -23" stroke="#fff8c0" stroke-width="3" fill="none" stroke-linecap="round" />
      <circle cx="5" cy="-17" r="2.4" fill="#1b1033" />
      <path d="M11 -15 L19 -12 L11 -10 Z" fill="#ff8a2f" stroke="#1b1033" stroke-width="2" stroke-linejoin="round" />
    </g>

    <g v-for="(f, side) in FENCES" :key="`fen${side}`">
      <g fill="url(#farm-wood)" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" filter="url(#cel-s)">
        <path v-for="x in f.posts" :key="`fp${x}`" :d="`M${x} 1000 V900 L${x + 13} 884 L${x + 26} 900 V1000 Z`" />
      </g>
      <g fill="url(#farm-wood)" stroke="#1b1033" stroke-width="4">
        <rect :x="f.first - 40" y="914" :width="f.last - f.first + 100" height="18" rx="5" />
        <rect :x="f.first - 40" y="952" :width="f.last - f.first + 100" height="18" rx="5" />
      </g>
      <path :d="`M${f.first - 30} 919 H${f.last + 50} M${f.first - 30} 957 H${f.last + 50}`" stroke="#f6c690" stroke-width="3" opacity="0.8" />
      <path :d="f.posts.map((x) => `M${x + 8} 940 v12 M${x + 16} 980 v10`).join(' ')" stroke="#7a4a26" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    </g>

    <g v-for="(b, i) in HAY" :key="`hay${i}`" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`">
      <ellipse cx="0" cy="6" rx="110" ry="14" fill="#0f2a10" opacity="0.32" />
      <path d="M-70 0 Q-96 -60 -70 -120 L60 -120 Q86 -60 60 0 Z" fill="url(#farm-wheat)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)" />
      <path d="M-40 -110 L-36 -10 M0 -112 L2 -8 M34 -110 L32 -10" stroke="#c98a2a" stroke-width="4" opacity="0.6" />
      <path d="M-74 -40 Q-60 -36 60 -36 M-74 -84 Q-60 -80 60 -80" stroke="#8a5a2a" stroke-width="5" />
      <ellipse cx="60" cy="-60" rx="34" ry="60" fill="#ffd47a" stroke="#1b1033" stroke-width="5" />
      <path d="M60 -60 m-6 0 a6 10 0 1 1 12 0 a14 24 0 1 1 -26 0 a22 38 0 1 1 42 0" stroke="#c98a2a" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M-50 -112 Q-30 -122 -6 -118" stroke="#fff3b8" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M-70 -120 l-10 -8 M-60 0 l-10 8 M80 -110 l10 -6" stroke="#e8b04a" stroke-width="4" stroke-linecap="round" />
    </g>

    <g v-for="(s, i) in SUNFLOWERS" :key="`sf${i}`" :transform="`translate(${s.x} ${s.y})`">
      <g class="leaf" :style="{ animationDelay: `-${s.d}s`, animationDuration: '4.5s' }">
        <path :d="`M0 0 Q-10 ${-s.h * 0.5} 0 ${-s.h}`" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
        <path :d="`M0 0 Q-10 ${-s.h * 0.5} 0 ${-s.h}`" stroke="#3a9a3e" stroke-width="6" fill="none" stroke-linecap="round" />
        <path :d="`M-4 ${-s.h * 0.4} Q-50 ${-s.h * 0.5} -60 ${-s.h * 0.36} Q-30 ${-s.h * 0.3} -4 ${-s.h * 0.4} Z M-2 ${-s.h * 0.6} Q40 ${-s.h * 0.72} 56 ${-s.h * 0.58} Q30 ${-s.h * 0.52} -2 ${-s.h * 0.6} Z`" fill="#4fae46" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <g :transform="`translate(0 ${-s.h})`">
          <path v-for="a in PETALS" :key="a" d="M0 -26 Q-12 -50 0 -64 Q12 -50 0 -26 Z" :transform="`rotate(${a})`" fill="#ffc82e" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
          <circle r="28" fill="#7a4a26" stroke="#1b1033" stroke-width="4" />
          <path d="M-14 -8 h4 M4 -14 h4 M-6 8 h4 M10 4 h4 M-2 -2 h4" stroke="#4a2a14" stroke-width="4" stroke-linecap="round" />
          <path d="M-14 -16 Q-6 -22 4 -22" stroke="#b07a46" stroke-width="4" fill="none" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <g fill="#174a24" stroke="#0b2212" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-30 920 120 860 Q60 980 110 1140 Z" />
      <path d="M-60 1140 Q60 990 260 980 Q150 1050 180 1140 Z" />
      <path d="M1980 1140 Q1960 930 1800 880 Q1870 1000 1840 1140 Z" />
      <path d="M1980 1140 Q1880 1010 1700 1010 Q1790 1070 1770 1140 Z" />
    </g>
    <path d="M40 1140 L20 1040 M70 1140 L80 1020 M1880 1140 L1900 1050" stroke="#0b2212" stroke-width="6" stroke-linecap="round" />
  </g>
</template>
