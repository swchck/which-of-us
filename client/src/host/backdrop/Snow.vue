<script setup lang="ts">
import { seeded, twinkleGroups } from './kit';

const rnd = seeded(203);
const FLAKES = Array.from({ length: 90 }, () => {
  const flake = { x: rnd() * 1920, r: 2 + rnd() * 5, y: rnd() * 1080 };
  rnd();
  return flake;
});
// three falling sheets instead of 90 falling flakes; each sheet is drawn twice a screen apart, so it loops without a seam
const SNOW = [18, 14, 10].map((s, i) => ({ s, flakes: FLAKES.filter((_, j) => j % 3 === i) }));
const STARS = twinkleGroups(Array.from({ length: 60 }, () => ({ x: rnd() * 1920, y: rnd() * 420, r: 0.8 + rnd() * 1.8 })));
const SMOKE = [0, 1, 2];
const AURORA = [
  { c: '#2ed47a', y: 110, d: 0 },
  { c: '#22d3ee', y: 170, d: 3 },
  { c: '#a66bff', y: 230, d: 6 },
];

const FAR_PINES = Array.from({ length: 26 }, (_, i) => {
  const x = -40 + i * 78 + rnd() * 30;
  const h = 70 + rnd() * 60;
  const base = 790 + Math.sin(x / 300) * 20;
  return `M${x.toFixed(0)} ${base.toFixed(0)} L${(x + 26).toFixed(0)} ${(base - h).toFixed(0)} L${(x + 52).toFixed(0)} ${base.toFixed(0)} Z`;
}).join(' ');

const PINES = [
  { x: 120, y: 880, k: 1.25 },
  { x: 650, y: 860, k: 0.8 },
  { x: 760, y: 870, k: 0.6 },
  { x: 1240, y: 860, k: 0.7 },
  { x: 1340, y: 868, k: 0.95 },
  { x: 1800, y: 890, k: 1.35 },
];
const SPARKLES = Array.from({ length: 18 }, () => ({ x: 80 + rnd() * 1760, y: 930 + rnd() * 120, s: 0.6 + rnd() * 0.7 }));
const FOOTPRINTS = Array.from({ length: 9 }, (_, i) => ({ x: 600 + i * 60, y: 906 + i * 5 + (i % 2) * 12 }));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="snow-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#121a4e" />
        <stop offset="55%" stop-color="#2f4398" />
        <stop offset="85%" stop-color="#8a8ce0" />
        <stop offset="100%" stop-color="#c8b0f0" />
      </linearGradient>
      <linearGradient id="snow-aurora-0" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2ed47a" stop-opacity="0" />
        <stop offset="45%" stop-color="#2ed47a" />
        <stop offset="100%" stop-color="#2ed47a" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="snow-aurora-1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#22d3ee" stop-opacity="0" />
        <stop offset="45%" stop-color="#22d3ee" />
        <stop offset="100%" stop-color="#22d3ee" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="snow-aurora-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a66bff" stop-opacity="0" />
        <stop offset="45%" stop-color="#a66bff" />
        <stop offset="100%" stop-color="#a66bff" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="snow-moon" cx="38%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="70%" stop-color="#fff3d0" />
        <stop offset="100%" stop-color="#e0d0a8" />
      </radialGradient>
      <linearGradient id="snow-peak" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#9aa8ea" />
        <stop offset="100%" stop-color="#7484d0" />
      </linearGradient>
      <linearGradient id="snow-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eef0ff" stop-opacity="0" />
        <stop offset="60%" stop-color="#eef0ff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#eef0ff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="snow-field" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#c4d2ff" />
      </linearGradient>
      <linearGradient id="snow-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f4f7ff" />
        <stop offset="100%" stop-color="#a8b8f0" />
      </linearGradient>
      <linearGradient id="snow-pine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#3a8a78" />
        <stop offset="100%" stop-color="#1d4a52" />
      </linearGradient>
      <linearGradient id="snow-logs" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#b0683a" />
        <stop offset="100%" stop-color="#7a3f22" />
      </linearGradient>
      <radialGradient id="snow-ball" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="70%" stop-color="#eef2ff" />
        <stop offset="100%" stop-color="#b4c2f0" />
      </radialGradient>
      <radialGradient id="snow-spill">
        <stop offset="0%" stop-color="#ffd96b" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ffd96b" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1200" fill="url(#snow-sky)" />
    <g v-for="(g, gi) in STARS" :key="`st${gi}`" class="twinkle" :style="{ animationDelay: `${gi * 0.75}s` }" fill="#fff">
      <circle v-for="(s, i) in g" :key="i" :cx="s.x" :cy="s.y" :r="s.r" />
    </g>
    <path
      v-for="(a, i) in AURORA"
      :key="`au${i}`"
      :d="`M-200 ${a.y} Q300 ${a.y - 90} 700 ${a.y} T1500 ${a.y} T2300 ${a.y} L2300 ${a.y + 110} Q1900 ${a.y + 30} 1500 ${a.y + 110} T700 ${a.y + 110} T-200 ${a.y + 110} Z`"
      :fill="`url(#snow-aurora-${i})`"
      class="aurora"
      :style="{ animationDelay: `-${a.d}s` }"
    />

    <circle cx="1580" cy="180" r="170" fill="#fff8de" opacity="0.08" />
    <circle cx="1580" cy="180" r="120" fill="#fff8de" opacity="0.12" />
    <circle cx="1580" cy="180" r="78" fill="url(#snow-moon)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <circle cx="1556" cy="164" r="13" fill="#e8dcb8" stroke="#c8b890" stroke-width="3" />
    <circle cx="1608" cy="210" r="9" fill="#e8dcb8" stroke="#c8b890" stroke-width="3" />
    <path d="M1530 130 Q1546 112 1572 108" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9" />

    <path d="M-60 760 L120 560 L240 650 L420 470 L600 640 L760 560 L960 700 L1180 540 L1340 650 L1500 500 L1700 640 L1860 560 L1980 640 L1980 1140 L-60 1140 Z" fill="url(#snow-peak)" stroke="#b0bcf4" stroke-width="3" stroke-linejoin="round" />
    <path d="M120 560 L170 616 L140 606 L112 628 L90 596 Z M420 470 L490 548 L456 536 L424 562 L392 530 L366 536 Z M760 560 L810 600 L780 596 L754 612 L728 592 Z M1180 540 L1240 590 L1210 584 L1184 604 L1150 578 Z M1500 500 L1564 560 L1530 552 L1500 576 L1472 548 L1446 554 Z M1860 560 L1912 600 L1880 598 L1856 614 L1830 590 Z" fill="#f4f6ff" stroke="#c4ccf8" stroke-width="2" stroke-linejoin="round" />
    <path d="M440 520 L520 640 M1520 560 L1600 640 M1200 600 L1270 660" stroke="#6070c0" stroke-width="4" stroke-linecap="round" opacity="0.5" />
    <rect x="-60" y="580" width="2040" height="300" fill="url(#snow-haze)" />

    <path d="M-60 800 Q400 740 900 780 Q1400 820 1980 760 L1980 1140 L-60 1140 Z" fill="#dfe6ff" stroke="#aab8ee" stroke-width="3" />
    <path :d="FAR_PINES" fill="#6a84c4" stroke="#8aa0dc" stroke-width="3" stroke-linejoin="round" />
    <path :d="FAR_PINES" fill="#fff" opacity="0.25" transform="translate(0 6) scale(1 0.985)" />

    <path d="M-60 880 Q500 820 960 860 Q1440 900 1980 850 L1980 1140 L-60 1140 Z" fill="url(#snow-field)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path d="M200 900 Q300 890 380 896 M820 880 Q900 874 980 882 M1100 900 Q1200 894 1280 904 M1560 880 Q1640 872 1720 880" stroke="#a8b8ec" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />

    <g v-for="(p, i) in PINES" :key="`p${i}`" :transform="`translate(${p.x} ${p.y}) scale(${p.k})`" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="10" cy="4" rx="90" ry="12" fill="#5a6ab0" opacity="0.3" stroke="none" />
      <rect x="-14" y="-44" width="28" height="46" fill="#6a3a22" stroke-width="5" />
      <g fill="url(#snow-pine)" stroke-width="5" filter="url(#cel-s)">
        <path d="M0 -160 L-100 -34 Q-50 -18 0 -28 Q50 -18 100 -34 Z" />
        <path d="M0 -240 L-80 -112 Q-40 -98 0 -108 Q40 -98 80 -112 Z" />
        <path d="M0 -316 L-58 -196 Q-28 -184 0 -192 Q28 -184 58 -196 Z" />
      </g>
      <g fill="#fff" stroke-width="3.5">
        <path d="M0 -316 L-28 -258 Q-16 -248 -6 -256 Q4 -244 14 -254 Q22 -248 28 -258 Z" />
        <path d="M-48 -108 Q-24 -96 0 -104 Q24 -96 48 -108 L58 -90 Q40 -80 28 -90 Q14 -78 0 -88 Q-16 -76 -30 -88 Q-46 -80 -58 -90 Z" />
        <path d="M-36 -190 Q-18 -180 0 -186 Q18 -180 36 -190 L44 -174 Q30 -166 20 -174 Q8 -164 -4 -172 Q-18 -162 -30 -172 Q-40 -166 -46 -174 Z" />
        <path d="M-100 -34 Q-50 -18 0 -28 Q50 -18 100 -34 Q60 -12 0 -16 Q-60 -12 -100 -34 Z" />
      </g>
      <path d="M-40 -150 L-60 -120 M-34 -226 L-50 -200" stroke="#7ad0c0" stroke-width="4" stroke-linecap="round" opacity="0.7" />
    </g>

    <g transform="translate(300 900)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="130" cy="6" rx="200" ry="20" fill="#5a6ab0" opacity="0.3" stroke="none" />
      <ellipse cx="80" cy="30" rx="150" ry="40" fill="url(#snow-spill)" stroke="none" />
      <rect x="186" y="-300" width="44" height="110" fill="#8a8aa0" stroke-width="5" />
      <path d="M186 -270 H230 M186 -240 H230 M208 -300 V-270 M196 -270 V-240 M220 -240 V-210" stroke="#5a5a70" stroke-width="3" />
      <rect x="180" y="-312" width="56" height="18" rx="6" fill="#fff" stroke-width="4" />
      <rect x="0" y="-160" width="250" height="160" fill="url(#snow-logs)" stroke-width="6" filter="url(#cel)" />
      <path d="M0 -130 H250 M0 -100 H250 M0 -70 H250 M0 -40 H250" stroke="#5a2a14" stroke-width="4" opacity="0.6" />
      <path d="M-10 -145 h14 M-10 -115 h14 M-10 -85 h14 M-10 -55 h14 M-10 -25 h14 M246 -145 h14 M246 -115 h14 M246 -85 h14 M246 -55 h14 M246 -25 h14" stroke="#e0a070" stroke-width="12" stroke-linecap="round" />
      <path d="M-40 -150 L125 -280 L290 -150 Z" fill="#7a3a2a" stroke-width="6" />
      <path d="M-46 -146 L125 -290 L296 -146 Q270 -128 250 -142 Q230 -124 206 -140 Q180 -126 160 -142 Q130 -124 110 -142 Q86 -126 62 -142 Q36 -126 14 -142 Q-14 -126 -46 -146 Z" fill="#fff" stroke-width="5" />
      <path d="M-10 -168 L118 -268" stroke="#d8e2ff" stroke-width="6" stroke-linecap="round" />
      <path d="M20 -138 l6 22 l6 -22 M90 -138 l5 30 l5 -30 M170 -138 l6 20 l6 -20 M230 -140 l5 26 l5 -26" fill="#dff4ff" stroke-width="3" />
      <rect x="30" y="-118" width="74" height="60" rx="4" fill="#ffd96b" stroke-width="5" class="glow" />
      <path d="M67 -118 V-58 M30 -88 H104" stroke-width="5" />
      <path d="M26 -54 H108" stroke="#fff" stroke-width="12" stroke-linecap="round" />
      <path d="M26 -54 H108" stroke="#1b1033" stroke-width="3" opacity="0.4" />
      <path d="M140 0 V-104 Q140 -116 152 -116 H200 Q212 -116 212 -104 V0 Z" fill="#5a2f1c" stroke-width="5" />
      <circle cx="200" cy="-54" r="5" fill="#ffd23f" stroke-width="2" />
      <path d="M154 -96 V-20 M176 -100 V-20 M198 -96 V-20" stroke="#3a1a0c" stroke-width="3" opacity="0.6" />
      <circle cx="176" cy="-140" r="22" fill="#2f8a4a" stroke-width="4" />
      <circle cx="176" cy="-140" r="12" fill="none" stroke="#1d5a30" stroke-width="3" />
      <path d="M168 -122 l-6 14 M184 -122 l6 14" stroke="#ff3b5c" stroke-width="5" stroke-linecap="round" />
    </g>
    <circle v-for="i in SMOKE" :key="`cs${i}`" cx="508" cy="576" r="18" fill="#e6ecff" stroke="#b8c4f0" stroke-width="3" class="smoke" :style="{ animationDelay: `-${i * 2}s` }" />

    <g fill="#8494d4" opacity="0.8">
      <ellipse v-for="(f, i) in FOOTPRINTS" :key="`fp${i}`" :cx="f.x" :cy="f.y" rx="9" ry="5" />
    </g>

    <g transform="translate(1500 920)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="10" cy="6" rx="110" ry="16" fill="#5a6ab0" opacity="0.35" stroke="none" />
      <path d="M-50 -170 L-130 -220 M-108 -206 L-124 -236 M50 -170 L130 -230 M110 -216 L136 -246" stroke="#6a3a22" stroke-width="8" stroke-linecap="round" fill="none" />
      <circle cx="0" cy="-60" r="70" fill="url(#snow-ball)" stroke-width="5" />
      <circle cx="0" cy="-168" r="52" fill="url(#snow-ball)" stroke-width="5" />
      <circle cx="0" cy="-252" r="40" fill="url(#snow-ball)" stroke-width="5" />
      <path d="M-46 -84 Q-50 -104 -36 -116 M-34 -190 Q-34 -204 -24 -210" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" />
      <circle cx="0" cy="-150" r="6" fill="#1b1033" stroke="none" />
      <circle cx="0" cy="-180" r="6" fill="#1b1033" stroke="none" />
      <circle cx="0" cy="-80" r="6" fill="#1b1033" stroke="none" />
      <path d="M-40 -224 Q0 -206 40 -224 L42 -208 Q0 -190 -42 -208 Z" fill="#ff3b5c" stroke-width="4" />
      <path d="M18 -212 L30 -150 L48 -154 L34 -214 Z" fill="#ff3b5c" stroke-width="4" />
      <path d="M-24 -220 V-202 M-6 -214 V-196 M12 -214 V-198 M23 -150 L41 -154" stroke="#fff" stroke-width="4" />
      <path d="M-34 -284 H34 L28 -330 H-28 Z" fill="#2a2058" stroke-width="5" />
      <path d="M-50 -284 H50" stroke-width="10" stroke-linecap="round" />
      <path d="M-50 -284 H50" stroke="#2a2058" stroke-width="4" stroke-linecap="round" />
      <path d="M-32 -296 H32" stroke="#ff3b5c" stroke-width="7" />
      <circle cx="-14" cy="-262" r="6" fill="#1b1033" stroke="none" />
      <circle cx="14" cy="-262" r="6" fill="#1b1033" stroke="none" />
      <circle cx="-16" cy="-264" r="2" fill="#fff" stroke="none" />
      <circle cx="12" cy="-264" r="2" fill="#fff" stroke="none" />
      <path d="M0 -252 L44 -244 L0 -238 Z" fill="#ff7a2f" stroke-width="3" />
      <ellipse cx="-24" cy="-240" rx="8" ry="5" fill="#ff8aa0" stroke="none" opacity="0.7" />
      <ellipse cx="22" cy="-238" rx="8" ry="5" fill="#ff8aa0" stroke="none" opacity="0.7" />
      <path d="M-14 -228 Q-6 -222 4 -226 Q10 -222 14 -228" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1660 950) rotate(-8)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="40" cy="20" rx="110" ry="12" fill="#5a6ab0" opacity="0.3" stroke="none" />
      <path d="M-40 10 H130 Q160 10 160 -20" stroke-width="12" fill="none" stroke-linecap="round" />
      <path d="M-40 10 H130 Q160 10 160 -20" stroke="#c8d0e0" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-10 10 V-10 M110 10 V-10" stroke-width="6" />
      <rect x="-30" y="-34" width="160" height="26" rx="6" fill="#ff5a3c" stroke-width="5" />
      <path d="M-20 -24 H120" stroke="#ffb09a" stroke-width="4" stroke-linecap="round" />
    </g>

    <path d="M-60 980 Q500 950 960 975 Q1500 1000 1980 960 L1980 1140 L-60 1140 Z" fill="url(#snow-front)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <g fill="#fff">
      <path v-for="(s, i) in SPARKLES" :key="`sp${i}`" :transform="`translate(${s.x} ${s.y + 40}) scale(${s.s})`" d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" />
    </g>

    <g fill="#1a2a5a" stroke="#0c1430" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 L-60 760 L40 640 L120 780 L70 770 L170 900 L110 890 L220 1040 L150 1030 L190 1140 Z" />
      <path d="M1980 1140 L1980 720 L1910 640 L1850 770 L1890 764 L1810 890 L1860 884 L1790 1030 L1840 1024 L1810 1140 Z" />
    </g>
    <g fill="#e8eeff">
      <path d="M40 640 L70 690 Q52 700 40 688 Q28 700 14 690 Z M120 780 L70 770 Q90 790 110 786 Z M170 900 L110 890 Q140 910 160 904 Z" />
      <path d="M1910 640 L1936 690 Q1920 700 1908 688 Q1896 700 1884 690 Z M1850 770 L1890 764 Q1872 784 1856 780 Z M1810 890 L1860 884 Q1840 904 1820 900 Z" />
    </g>

    <g v-for="(sheet, i) in SNOW" :key="`sn${i}`" class="flake" fill="#fff" :style="{ animationDuration: `${sheet.s}s` }">
      <template v-for="(f, j) in sheet.flakes" :key="j">
        <circle :cx="f.x" :cy="f.y" :r="f.r" />
        <circle :cx="f.x - 60" :cy="f.y - 1080" :r="f.r" />
      </template>
    </g>
  </g>
</template>
