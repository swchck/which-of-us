<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(666);
const f1 = (n: number) => n.toFixed(1);
const TRUSS = (() => {
  let d = 'M-60 80 H1980 M-60 130 H1980';
  for (let x = -60; x < 1980; x += 50) d += ` M${x} 80 L${x + 25} 130 L${x + 50} 80`;
  return d;
})();
const CANS = [160, 420, 700, 1220, 1500, 1760].map((x, i) => ({ x, c: ['#ff4fa8', '#3ad6e0', '#ffd23f', '#ffd23f', '#3ad6e0', '#ff4fa8'][i]! }));
const BEAMS = [
  { x: 420, cls: 'party-rock-b1', c: '#ff4fa8' },
  { x: 700, cls: 'party-rock-b2', c: '#3ad6e0' },
  { x: 1220, cls: 'party-rock-b3', c: '#ffd23f' },
  { x: 1500, cls: 'party-rock-b1 late', c: '#3ad6e0' },
];
const ampGrid = (x: number, y: number, w: number, h: number) => {
  let d = '';
  for (let yy = y + 12; yy < y + h; yy += 14) d += `M${x + 8} ${yy} H${x + w - 8} `;
  return d;
};
const STACKS = [
  { x: 40, w: 300 },
  { x: 1580, w: 300 },
].map((s) => ({ ...s, cabs: [0, 1, 2].map((i) => ({ y: 340 + i * 150 })) }));
const CROWD_ROWS = [0, 1].map((r) =>
  Array.from({ length: 15 }, (_, i) => ({
    x: -40 + i * 140 + r * 70 + rnd() * 30,
    y: 960 + r * 90,
    up: rnd() > 0.45,
    side: rnd() > 0.5 ? 1 : -1,
  })),
);
const CROWD_GROUPS = [0, 1].map((g) => CROWD_ROWS.flat().filter((_, i) => i % 2 === g));
const head = (x: number, y: number) => `M${f1(x - 44)} ${f1(y + 140)} Q${f1(x - 50)} ${f1(y + 40)} ${f1(x)} ${f1(y + 36)} Q${f1(x + 50)} ${f1(y + 40)} ${f1(x + 44)} ${f1(y + 140)} Z M${f1(x - 30)} ${f1(y)} a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 Z`;
const arm = (x: number, y: number, s: number) => `M${f1(x + s * 30)} ${f1(y + 60)} L${f1(x + s * 60)} ${f1(y - 50)}`;
const SPARKS = Array.from({ length: 10 }, () => ({ x: 560 + rnd() * 800, y: 240 + rnd() * 300, r: 2 + rnd() * 3 }));
</script>

<template>
  <g>
    <defs>
      <radialGradient id="party-rock-bg" cx="50%" cy="40%" r="80%">
        <stop offset="0%" stop-color="#5a1a7a" />
        <stop offset="60%" stop-color="#250a40" />
        <stop offset="100%" stop-color="#0e041c" />
      </radialGradient>
      <linearGradient id="party-rock-stage" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a2a5a" />
        <stop offset="100%" stop-color="#1a1030" />
      </linearGradient>
      <linearGradient id="party-rock-amp" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a3a4a" />
        <stop offset="100%" stop-color="#1a1a24" />
      </linearGradient>
      <linearGradient id="party-rock-drum" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ff4f6d" />
        <stop offset="100%" stop-color="#b01a3a" />
      </linearGradient>
      <linearGradient id="party-rock-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="party-rock-pool">
        <stop offset="0%" stop-color="#ff7ab0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ff7ab0" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="party-rock-guitar" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7af0ff" />
        <stop offset="100%" stop-color="#2a9ec4" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#party-rock-bg)" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="520" y="200" width="880" height="420" rx="16" fill="#1a0a30" stroke-width="7" />
      <path d="M540 220 H1380 V600 H540 Z" fill="#2a0f4f" stroke="#ff4fa8" stroke-width="3" opacity="0.6" />
    </g>
    <path d="M960 270 L990 360 L1080 360 L1008 414 L1036 502 L960 450 L884 502 L912 414 L840 360 L930 360 Z" fill="none" stroke="#ffd23f" stroke-width="10" stroke-linejoin="round" class="party-rock-flash" />
    <g class="party-rock-spark" fill="#fff6c0">
      <circle v-for="(s, i) in SPARKS" :key="`sp${i}`" :cx="s.x" :cy="s.y" :r="s.r" />
    </g>

    <g v-for="(b, i) in BEAMS" :key="`bm${i}`" :class="['party-rock-beam', b.cls]" :style="{ transformOrigin: `${b.x}px 150px` }">
      <path :d="`M${b.x - 14} 150 L${b.x - 200} 900 H${b.x + 200} L${b.x + 14} 150 Z`" :fill="b.c" opacity="0.18" />
      <path :d="`M${b.x - 8} 150 L${b.x - 90} 900 H${b.x + 90} L${b.x + 8} 150 Z`" fill="url(#party-rock-beam)" opacity="0.6" />
    </g>

    <path :d="TRUSS" stroke="#1b1033" stroke-width="12" fill="none" stroke-linejoin="round" />
    <path :d="TRUSS" stroke="#a8a0c8" stroke-width="5" fill="none" stroke-linejoin="round" />
    <path d="M30 130 V760 M1890 130 V760" stroke="#1b1033" stroke-width="22" />
    <path d="M30 130 V760 M1890 130 V760" stroke="#a8a0c8" stroke-width="10" stroke-dasharray="20 14" />
    <g v-for="(c, i) in CANS" :key="`cn${i}`" :transform="`translate(${c.x} 150)`" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-24 -20 H24 L30 30 H-30 Z" fill="#2a2a3a" stroke-width="5" />
      <ellipse cx="0" cy="30" rx="30" ry="9" :fill="c.c" stroke-width="4" />
    </g>

    <path d="M-60 760 H1980 V860 H-60 Z" fill="url(#party-rock-stage)" stroke="#1b1033" stroke-width="6" filter="url(#cel)" />
    <path d="M-60 776 H1980" stroke="#6a5aa0" stroke-width="4" />
    <ellipse cx="960" cy="770" rx="500" ry="60" fill="url(#party-rock-pool)" class="party-rock-pool" />

    <g v-for="(s, si) in STACKS" :key="`stk${si}`">
      <g v-for="(cab, ci) in s.cabs" :key="`cab${ci}`" stroke="#1b1033" stroke-linejoin="round">
        <rect :x="s.x" :y="cab.y" :width="s.w" height="140" rx="10" fill="url(#party-rock-amp)" stroke-width="6" filter="url(#cel-s)" />
        <rect :x="s.x + 14" :y="cab.y + 14" :width="s.w - 28" height="112" rx="6" fill="#2a2a38" stroke-width="3" />
        <path :d="ampGrid(s.x + 14, cab.y + 14, s.w - 28, 112)" stroke="#4a4a5a" stroke-width="4" />
        <rect :x="s.x + s.w / 2 - 40" :y="cab.y + 4" width="80" height="18" rx="6" fill="#fff6e0" stroke-width="3" />
      </g>
    </g>

    <g transform="translate(960 760)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="0" rx="220" ry="16" fill="#0a0418" opacity="0.5" stroke="none" />
      <path d="M-200 -60 V-200 M200 -60 V-230" stroke-width="6" />
      <ellipse cx="-200" cy="-206" rx="60" ry="12" fill="#ffd23f" stroke-width="4" class="party-rock-cymbal" />
      <ellipse cx="200" cy="-236" rx="66" ry="12" fill="#ffd23f" stroke-width="4" class="party-rock-cymbal late" />
      <rect x="-150" y="-140" width="90" height="70" rx="10" fill="url(#party-rock-drum)" stroke-width="5" />
      <rect x="60" y="-140" width="90" height="70" rx="10" fill="url(#party-rock-drum)" stroke-width="5" />
      <circle cx="0" cy="-90" r="90" fill="url(#party-rock-drum)" stroke-width="7" filter="url(#cel-s)" />
      <circle cx="0" cy="-90" r="66" fill="#fff6e0" stroke-width="5" />
      <path d="M-24 -108 L-4 -136 L4 -112 L24 -120 L4 -64 L-4 -90 Z" fill="#ffd23f" stroke-width="4" />
      <path d="M-70 -10 L-90 0 M70 -10 L90 0" stroke-width="7" stroke-linecap="round" />
    </g>

    <g transform="translate(560 760)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M0 0 V-280" stroke-width="8" />
      <path d="M-30 0 L0 -40 L30 0" stroke-width="7" fill="none" />
      <ellipse cx="0" cy="-292" rx="18" ry="24" fill="#3a3a4a" stroke-width="5" />
    </g>
    <g transform="translate(1370 760)" stroke="#1b1033" stroke-linejoin="round">
      <path d="M-36 0 L0 -60 L36 0" stroke-width="7" fill="none" />
      <g class="party-rock-guitar" style="transform-origin: 0 -60px">
        <path d="M0 -150 V-360" stroke-width="22" stroke-linecap="round" />
        <path d="M0 -150 V-360" stroke="#c48a52" stroke-width="12" stroke-linecap="round" />
        <path d="M-16 -360 H16 L22 -400 H-22 Z" fill="#1a1a24" stroke-width="5" />
        <path d="M0 -40 Q-80 -36 -80 -90 Q-80 -120 -52 -128 Q-74 -170 -56 -200 Q-30 -176 -18 -156 H18 Q34 -196 58 -206 Q66 -160 50 -130 Q84 -118 80 -84 Q76 -40 0 -40 Z" fill="url(#party-rock-guitar)" stroke-width="7" />
        <rect x="-30" y="-130" width="60" height="16" rx="4" fill="#fff6e0" stroke-width="4" />
        <path d="M-24 -80 H24" stroke-width="7" />
        <circle cx="40" cy="-70" r="7" fill="#fff6e0" stroke-width="3" />
        <path d="M-50 -150 Q-40 -170 -20 -170" stroke="#d8fbff" stroke-width="6" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <g v-for="(g, gi) in CROWD_GROUPS" :key="`cg${gi}`" :class="gi ? 'party-rock-jump late' : 'party-rock-jump'">
      <g v-for="(p, i) in g" :key="`pp${i}`">
        <path v-if="p.up" :d="arm(p.x, p.y, p.side)" stroke="#120826" stroke-width="30" stroke-linecap="round" />
        <path v-if="p.up" :d="arm(p.x, p.y, p.side)" stroke="#2a1648" stroke-width="18" stroke-linecap="round" />
        <path v-if="p.up" :d="`M${p.x + p.side * 60 - 6} ${p.y - 60} v-28 M${p.x + p.side * 60 + 10} ${p.y - 58} v-28`" stroke="#120826" stroke-width="12" stroke-linecap="round" />
        <path :d="head(p.x, p.y)" fill="#2a1648" stroke="#120826" stroke-width="6" stroke-linejoin="round" />
      </g>
    </g>
    <g class="party-rock-lights" fill="#ffd23f">
      <circle cx="320" cy="900" r="8" />
      <circle cx="1100" cy="930" r="8" />
      <circle cx="1650" cy="910" r="8" />
    </g>
  </g>
</template>

<style scoped>
.party-rock-beam {
  animation: party-rock-sweep 5s ease-in-out infinite alternate;
}

.party-rock-b2 {
  animation-duration: 6s;
  animation-direction: alternate-reverse;
}

.party-rock-b3 {
  animation-duration: 4.4s;
}

.party-rock-beam.late {
  animation-delay: -2.5s;
}

.party-rock-flash {
  animation: party-rock-flash 0.9s steps(2) infinite;
}

.party-rock-spark {
  animation: party-rock-flash 1.4s ease-in-out infinite alternate;
}

.party-rock-pool {
  animation: party-rock-flash 2s ease-in-out infinite alternate;
}

.party-rock-cymbal {
  transform-box: fill-box;
  transform-origin: center;
  animation: party-rock-crash 0.5s ease-in-out infinite alternate;
}

.party-rock-cymbal.late {
  animation-delay: -0.25s;
}

.party-rock-guitar {
  animation: party-rock-rock 2.4s ease-in-out infinite alternate;
}

.party-rock-jump {
  animation: party-rock-jump 0.6s ease-in-out infinite alternate;
}

.party-rock-jump.late {
  animation-delay: -0.3s;
}

.party-rock-lights {
  animation: party-rock-flash 0.8s steps(2) infinite;
}

@keyframes party-rock-sweep {
  from {
    rotate: -22deg;
  }
  to {
    rotate: 22deg;
  }
}

@keyframes party-rock-flash {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.35;
  }
}

@keyframes party-rock-crash {
  from {
    rotate: -5deg;
  }
  to {
    rotate: 5deg;
  }
}

@keyframes party-rock-rock {
  from {
    rotate: -3deg;
  }
  to {
    rotate: 3deg;
  }
}

@keyframes party-rock-jump {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -18px;
  }
}
</style>
