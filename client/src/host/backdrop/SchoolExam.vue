<script setup lang="ts">
import { seeded, strokeText } from './kit';

const rnd = seeded(2207);
const f1 = (n: number) => n.toFixed(1);
const VP = { x: 960, y: 330 };
const WALL_FOOT = 640;

// a desk seen from the back of the room: the empty chair is on our side, the paper waits on the top
function desk(o: number, y: number) {
  const k = (y - VP.y) / 670;
  const at = (ox: number, yy: number) => VP.x + ox * (yy - VP.y);
  const w = 0.36;
  const yb = y - 70 * k;
  const top = `M${f1(at(o - w, y))} ${f1(y)} L${f1(at(o + w, y))} ${f1(y)} L${f1(at(o + w, yb))} ${f1(yb)} L${f1(at(o - w, yb))} ${f1(yb)} Z`;
  const xl = at(o - w, y);
  const xr = at(o + w, y);
  const legs = `M${f1(xl + 16 * k)} ${f1(y + 14 * k)} V${f1(y + 150 * k)} M${f1(xr - 16 * k)} ${f1(y + 14 * k)} V${f1(y + 150 * k)}`;
  const cx = at(o, y);
  const tilt = (rnd() - 0.5) * 14;
  const chair = { x: cx - 90 * k, y: y + 34 * k, w: 180 * k, h: 70 * k };
  const chairLegs = `M${f1(chair.x + 14 * k)} ${f1(chair.y + chair.h)} V${f1(y + 190 * k)} M${f1(chair.x + chair.w - 14 * k)} ${f1(chair.y + chair.h)} V${f1(y + 190 * k)}`;
  const paper = `translate(${f1(cx - 50 * k)} ${f1(y - 44 * k)}) rotate(${f1(tilt)}) scale(${f1(k * 1.25)})`;
  return { top, legs, xl, w: xr - xl, y, k, chair, chairLegs, paper, cx };
}
const ROWS = [
  { y: 700, o: [-1.55, -0.55, 0.55, 1.55] },
  { y: 830, o: [-1.55, -0.55, 0.55, 1.55] },
  { y: 1010, o: [-1.5, -0.55, 0.55, 1.5] },
].map((r) => r.o.map((o) => desk(o, r.y)));
const CHAIR_COLORS = ['#4a7ad8', '#e8553f', '#5fb04a', '#ffb02e'];

const PLANKS = Array.from({ length: 33 }, (_, i) => -1960 + i * 180)
  .map((x) => `M${x} ${WALL_FOOT} L${f1(VP.x + ((x - VP.x) * (1140 - VP.y)) / (WALL_FOOT - VP.y))} 1140`)
  .join(' ');
const SILENCE = strokeText('Тишина!', 960, 268, 96, 'middle');
const TICKS = Array.from({ length: 60 }, (_, i) => i * 6);
const DUST = [0, 1, 2].map(() => Array.from({ length: 8 }, () => ({ x: 120 + rnd() * 1700, y: 120 + rnd() * 560, r: 1.6 + rnd() * 2.2 })));
</script>

<template>
  <g>
    <defs>
      <linearGradient id="g-school-exam-wall" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stop-color="#fff0d2" />
        <stop offset="100%" stop-color="#f2cf98" />
      </linearGradient>
      <linearGradient id="school-exam-wains" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8fd0ae" />
        <stop offset="100%" stop-color="#4f9a7a" />
      </linearGradient>
      <linearGradient id="school-exam-board" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3a7d5c" />
        <stop offset="100%" stop-color="#1d4a36" />
      </linearGradient>
      <linearGradient id="school-exam-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0a464" />
        <stop offset="100%" stop-color="#a86a36" />
      </linearGradient>
      <linearGradient id="school-exam-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b47640" />
        <stop offset="100%" stop-color="#7a4422" />
      </linearGradient>
      <linearGradient id="school-exam-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d89c5c" />
        <stop offset="100%" stop-color="#9a5e28" />
      </linearGradient>
      <linearGradient id="school-exam-desk" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffd9a0" />
        <stop offset="100%" stop-color="#e0a464" />
      </linearGradient>
      <radialGradient id="school-exam-face" cx="40%" cy="35%" r="75%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f4ead2" />
      </radialGradient>
      <linearGradient id="school-exam-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e8f6ff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#a8d4f0" stop-opacity="0.7" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="760" fill="url(#g-school-exam-wall)" />
    <rect x="-60" y="470" width="2040" height="170" fill="url(#school-exam-wains)" />
    <rect x="-60" y="458" width="2040" height="16" fill="url(#school-exam-wood)" stroke="#1b1033" stroke-width="4" />
    <g fill="none" stroke="#3a7a5c" stroke-width="4" opacity="0.6">
      <rect v-for="i in 9" :key="`wp${i}`" :x="-40 + (i - 1) * 230" y="492" width="190" height="124" rx="8" />
    </g>
    <rect x="-60" y="616" width="2040" height="24" fill="url(#school-exam-dark)" stroke="#1b1033" stroke-width="4" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="560" y="70" width="800" height="300" rx="10" fill="url(#school-exam-wood)" stroke-width="6" filter="url(#cel)" />
      <rect x="584" y="92" width="752" height="256" rx="4" fill="url(#school-exam-board)" stroke-width="4" />
      <path d="M640 330 Q800 290 980 310 M1100 130 Q1200 110 1300 140" stroke="#e8fff4" stroke-width="40" fill="none" stroke-linecap="round" opacity="0.06" />
      <rect x="570" y="360" width="780" height="18" rx="4" fill="url(#school-exam-dark)" stroke-width="4" />
      <rect x="700" y="348" width="44" height="12" rx="5" fill="#fff" stroke-width="3" />
      <rect x="1180" y="338" width="72" height="22" rx="4" fill="#5a3a2a" stroke-width="3.5" />
      <rect x="1180" y="350" width="72" height="10" fill="#e8e0f0" stroke-width="3" />
    </g>
    <path :d="SILENCE" fill="none" stroke="#f4fff8" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity="0.92" />
    <path d="M700 300 Q960 286 1220 302" stroke="#ffd0e0" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.85" />
    <path d="M650 130 l26 26 M676 130 l-26 26 M1240 128 q16 -14 32 0 q16 14 32 0" stroke="#f4fff8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.55" />

    <g transform="translate(1660 250)" stroke="#1b1033">
      <circle r="176" fill="#e8553f" stroke-width="7" filter="url(#cel)" />
      <circle r="146" fill="url(#school-exam-face)" stroke-width="5" />
      <path v-for="a in TICKS" :key="`tk${a}`" :d="a % 30 === 0 ? 'M0 -136 V-110' : 'M0 -136 V-126'" :transform="`rotate(${a})`" :stroke-width="a % 30 === 0 ? 8 : 3" stroke-linecap="round" />
      <path d="M-104 -96 Q-74 -128 -30 -136" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9" />
      <path d="M0 0 L-46 -40" stroke-width="13" stroke-linecap="round" />
      <path d="M0 10 V-104" stroke-width="10" stroke-linecap="round" />
      <g class="school-exam-sec">
        <path d="M0 26 V-122" stroke="#e8553f" stroke-width="5" stroke-linecap="round" />
        <circle cy="-96" r="8" fill="#e8553f" stroke-width="3" />
      </g>
      <circle r="12" fill="#ffd23f" stroke-width="4" />
      <path d="M-120 -150 L-150 -186 M120 -150 L150 -186" stroke-width="14" stroke-linecap="round" />
      <circle cx="-156" cy="-192" r="26" fill="#ffd23f" stroke-width="5" />
      <circle cx="156" cy="-192" r="26" fill="#ffd23f" stroke-width="5" />
    </g>

    <g transform="translate(260 120)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M0 -40 V-10" stroke-width="3" />
      <path d="M0 -40 L-110 -4 M0 -40 L110 -4" stroke-width="3" fill="none" />
      <rect x="-130" y="0" width="260" height="300" rx="6" fill="#fffaf0" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-130" y="0" width="260" height="64" rx="6" fill="#4a7ad8" stroke-width="5" />
      <g fill="none" stroke-width="5" stroke-linecap="round">
        <rect x="-96" y="96" width="34" height="34" rx="4" fill="#fff" />
        <rect x="-96" y="160" width="34" height="34" rx="4" fill="#fff" />
        <rect x="-96" y="224" width="34" height="34" rx="4" fill="#fff" />
        <path d="M-90 114 l10 10 l20 -24" stroke="#2fa84a" stroke-width="7" />
        <path d="M-40 112 H96 M-40 176 H70 M-40 240 H90" stroke="#9ab0d8" stroke-width="8" />
      </g>
      <path d="M-100 30 H100" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity="0.8" />
    </g>

    <path d="M-60 640 H1980 V1140 H-60 Z" fill="url(#school-exam-floor)" />
    <path :d="PLANKS" stroke="#8a4e1e" stroke-width="3" opacity="0.45" />
    <path d="M-60 640 H1980" stroke="#1b1033" stroke-width="4" />

    <g transform="translate(250 650)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="168" rx="250" ry="18" fill="#5a2a10" opacity="0.3" stroke="none" />
      <path d="M-210 0 H210 L230 -26 H-190 Z" fill="url(#school-exam-desk)" stroke-width="5" />
      <rect x="-220" y="0" width="440" height="22" rx="4" fill="url(#school-exam-wood)" stroke-width="5" />
      <rect x="-200" y="22" width="400" height="146" fill="url(#school-exam-dark)" stroke-width="5" filter="url(#cel)" />
      <path d="M-180 46 V156 M-60 46 V156 M60 46 V156 M180 46 V156" stroke="#5a2a14" stroke-width="3" opacity="0.5" />
      <g transform="translate(-120 -20)">
        <rect v-for="i in 5" :key="`pp${i}`" x="-50" :y="-i * 8" width="110" height="10" rx="2" fill="#fffaf0" stroke-width="3" :transform="`rotate(${(i % 2) * 3 - 1})`" />
      </g>
      <g transform="translate(110 -26) scale(1.35)">
        <rect x="-40" y="-150" width="80" height="14" rx="5" fill="url(#school-exam-wood)" stroke-width="4" />
        <rect x="-40" y="-14" width="80" height="14" rx="5" fill="url(#school-exam-wood)" stroke-width="4" />
        <path d="M-30 -136 Q-30 -96 -4 -76 Q-30 -56 -30 -14 H30 Q30 -56 4 -76 Q30 -96 30 -136 Z" fill="url(#school-exam-glass)" stroke-width="4" />
        <path d="M-22 -130 Q-20 -104 -2 -86 H2 Q20 -104 22 -130 Z" fill="#ffc94a" stroke="none" class="school-exam-top" />
        <path d="M-26 -14 Q-18 -42 0 -48 Q18 -42 26 -14 Z" fill="#ffc94a" stroke-width="3" />
        <path d="M0 -76 V-30" stroke="#ffc94a" stroke-width="4" stroke-dasharray="6 6" class="school-exam-sand" />
        <path d="M-20 -126 Q-24 -100 -10 -84" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8" />
      </g>
    </g>

    <g v-for="(row, ri) in ROWS" :key="`r${ri}`" stroke="#1b1033" stroke-linejoin="round">
      <g v-for="(d, di) in row" :key="`d${di}`">
        <ellipse :cx="d.cx" :cy="d.y + 190 * d.k" :rx="d.w * 0.55" :ry="14 * d.k" fill="#5a2a10" opacity="0.3" stroke="none" />
        <path :d="d.legs" :stroke-width="14 * d.k + 2" stroke-linecap="round" />
        <path :d="d.legs" stroke="#7a8aa8" :stroke-width="7 * d.k" stroke-linecap="round" />
        <path :d="d.top" fill="url(#school-exam-desk)" :stroke-width="4 * d.k + 1" />
        <rect :x="d.xl" :y="d.y" :width="d.w" :height="18 * d.k" :rx="4 * d.k" fill="url(#school-exam-wood)" :stroke-width="4 * d.k + 1" />
        <g :transform="d.paper">
          <rect x="0" y="0" width="80" height="50" rx="3" fill="#fffaf0" stroke-width="3.5" />
          <path d="M10 12 H66 M10 24 H58 M10 36 H62" stroke="#9ab0d8" stroke-width="4" />
        </g>
        <path :d="d.chairLegs" :stroke-width="12 * d.k + 2" stroke-linecap="round" />
        <path :d="d.chairLegs" stroke="#7a8aa8" :stroke-width="6 * d.k" stroke-linecap="round" />
        <rect :x="d.chair.x" :y="d.chair.y" :width="d.chair.w" :height="d.chair.h" :rx="14 * d.k" :fill="CHAIR_COLORS[(ri + di) % 4]" :stroke-width="4 * d.k + 1.5" />
        <path :d="`M${d.chair.x + 16 * d.k} ${d.chair.y + 16 * d.k} H${d.chair.x + d.chair.w * 0.6}`" stroke="#fff" :stroke-width="5 * d.k" stroke-linecap="round" opacity="0.55" />
      </g>
    </g>

    <g transform="translate(1440 996) scale(0.75)" stroke="#1b1033" stroke-linejoin="round">
      <g class="school-exam-pencil">
        <path d="M0 0 L190 -60" stroke-width="22" stroke-linecap="round" />
        <path d="M0 0 L190 -60" stroke="#ffd23f" stroke-width="13" stroke-linecap="round" />
        <path d="M-18 6 L0 0" stroke="#ff9ab0" stroke-width="13" stroke-linecap="round" />
        <path d="M190 -60 L222 -70" stroke="#f4d0a0" stroke-width="12" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="(g, i) in DUST" :key="`ds${i}`" class="school-exam-dust" :style="{ animationDelay: `-${i * 2.3}s` }" fill="#fffbe0">
      <circle v-for="(s, j) in g" :key="j" :cx="s.x" :cy="s.y" :r="s.r" />
    </g>
  </g>
</template>

<style scoped>
.school-exam-sec {
  animation: school-exam-tick 60s steps(60) infinite;
}

.school-exam-sand {
  animation: school-exam-sand 0.6s linear infinite;
}

.school-exam-top {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: school-exam-drain 20s linear infinite;
}

.school-exam-pencil {
  transform-origin: 0 0;
  animation: school-exam-tap 1.4s ease-in-out infinite;
}

.school-exam-dust {
  animation: school-exam-dust 7s ease-in-out infinite alternate;
}

@keyframes school-exam-tick {
  to {
    rotate: 360deg;
  }
}

@keyframes school-exam-sand {
  to {
    translate: 0 12px;
  }
}

@keyframes school-exam-drain {
  from {
    scale: 1 1;
  }
  to {
    scale: 1 0.2;
  }
}

@keyframes school-exam-tap {
  0%,
  60%,
  100% {
    rotate: 0deg;
  }
  70%,
  90% {
    rotate: -5deg;
  }
  80% {
    rotate: 0deg;
  }
}

@keyframes school-exam-dust {
  0% {
    translate: 0 0;
    opacity: 0.2;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    translate: 24px -40px;
    opacity: 0.3;
  }
}
</style>
