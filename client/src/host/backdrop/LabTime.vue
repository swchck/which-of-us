<script setup lang="ts">
import { seeded, strokeText } from './kit';

const rnd = seeded(1885);
const f1 = (n: number) => n.toFixed(1);
const gear = (r: number, teeth: number) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * 0.82;
    pts.push(`${f1(Math.cos(a) * rr)} ${f1(Math.sin(a) * rr)}`);
  }
  return `M${pts.join(' L')} Z M${f1(r * 0.3)} 0 a${f1(r * 0.3)} ${f1(r * 0.3)} 0 1 0 ${f1(-r * 0.6)} 0 a${f1(r * 0.3)} ${f1(r * 0.3)} 0 1 0 ${f1(r * 0.6)} 0 Z`;
};
const BRICKS = (() => {
  let d = '';
  for (let r = 0; r < 13; r++) {
    const y = r * 56;
    d += `M-60 ${y} H1980 `;
    for (let x = -60 + (r % 2) * 70; x < 1980; x += 140) d += `M${x} ${y} V${y + 56} `;
  }
  return d;
})();
const SWIRL = Array.from({ length: 5 }, (_, i) => {
  const a = (i / 5) * Math.PI * 2;
  const r0 = 30;
  const r1 = 230;
  return `M${f1(Math.cos(a) * r0)} ${f1(Math.sin(a) * r0)} Q${f1(Math.cos(a + 1.2) * r1 * 0.7)} ${f1(Math.sin(a + 1.2) * r1 * 0.7)} ${f1(Math.cos(a + 2) * r1)} ${f1(Math.sin(a + 2) * r1)}`;
}).join(' ');
const RIVETS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  return `M${f1(Math.cos(a) * 286)} ${f1(Math.sin(a) * 286)} h0.1`;
}).join(' ');
const YEAR_A = strokeText('1812', 0, 0, 40, 'middle');
const YEAR_B = strokeText('2077', 0, 0, 40, 'middle');
const DIALS = [
  { x: 200, y: 520, r: 56, d: 0 },
  { x: 340, y: 520, r: 56, d: -0.7 },
];
const CLOCKS = [
  { r: 330, a: 0, k: 0.5, d: 0 },
  { r: 330, a: 0, k: 0.4, d: -3 },
  { r: 330, a: 0, k: 0.32, d: -6 },
];
const SPARKS = Array.from({ length: 12 }, () => {
  const a = rnd() * Math.PI * 2;
  const r = 300 + rnd() * 60;
  return `M${f1(960 + Math.cos(a) * r)} ${f1(430 + Math.sin(a) * r)} h0.1`;
}).join(' ');
</script>

<template>
  <g>
    <defs>
      <linearGradient id="lab-time-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f2b33" />
        <stop offset="100%" stop-color="#174450" />
      </linearGradient>
      <linearGradient id="lab-time-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a5a5a" />
        <stop offset="100%" stop-color="#0b1f26" />
      </linearGradient>
      <radialGradient id="lab-time-portal">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="25%" stop-color="#9ffaff" />
        <stop offset="60%" stop-color="#8a6bff" />
        <stop offset="100%" stop-color="#3a1a7a" />
      </radialGradient>
      <radialGradient id="lab-time-glow">
        <stop offset="0%" stop-color="#9ffaff" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#9ffaff" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="lab-time-brass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffe0a0" />
        <stop offset="50%" stop-color="#e0a050" />
        <stop offset="100%" stop-color="#a0602a" />
      </linearGradient>
      <linearGradient id="lab-time-console" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a8a9a" />
        <stop offset="100%" stop-color="#2a4a5a" />
      </linearGradient>
      <clipPath id="lab-time-scope"><rect x="1506" y="426" width="248" height="78" rx="6" /></clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="820" fill="url(#lab-time-wall)" />
    <path :d="BRICKS" stroke="#0a2028" stroke-width="4" opacity="0.6" />
    <path d="M-60 120 H1980 M-60 150 H1980" stroke="#1b1033" stroke-width="18" />
    <path d="M-60 120 H1980 M-60 150 H1980" stroke="#3a7a7a" stroke-width="8" />

    <g transform="translate(140 130)" stroke="#1b1033" stroke-linejoin="round">
      <g class="lab-time-gear"><path :d="gear(110, 10)" fill="url(#lab-time-brass)" stroke-width="6" fill-rule="evenodd" /></g>
    </g>
    <g transform="translate(300 60)" stroke="#1b1033" stroke-linejoin="round">
      <g class="lab-time-gear back"><path :d="gear(70, 8)" fill="#c08040" stroke-width="5" fill-rule="evenodd" /></g>
    </g>
    <g transform="translate(1800 160)" stroke="#1b1033" stroke-linejoin="round">
      <g class="lab-time-gear back"><path :d="gear(130, 12)" fill="url(#lab-time-brass)" stroke-width="6" fill-rule="evenodd" /></g>
    </g>

    <ellipse cx="960" cy="430" rx="520" ry="440" fill="url(#lab-time-glow)" class="lab-time-pulse" />

    <path d="M-60 760 H1980 V1140 H-60 Z" fill="url(#lab-time-floor)" />
    <path d="M-60 760 H1980" stroke="#1b1033" stroke-width="5" />
    <ellipse cx="960" cy="860" rx="480" ry="80" fill="url(#lab-time-glow)" class="lab-time-pulse" />

    <g transform="translate(960 430)" stroke="#1b1033" stroke-linejoin="round">
      <circle r="250" fill="url(#lab-time-portal)" />
      <g class="lab-time-swirl">
        <path :d="SWIRL" stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.7" />
      </g>
      <g v-for="(c, i) in CLOCKS" :key="`ck${i}`" class="lab-time-fall" :style="{ animationDelay: `${c.d}s` }">
        <g :transform="`translate(${-180 + i * 160} ${-120 + i * 60})`">
          <circle r="44" fill="#fffaf0" stroke-width="5" />
          <path d="M0 0 V-30 M0 0 L20 10" stroke-width="5" stroke-linecap="round" />
        </g>
      </g>
      <circle r="290" fill="none" stroke-width="70" />
      <circle r="290" fill="none" stroke="url(#lab-time-brass)" stroke-width="56" />
      <path :d="RIVETS" stroke-width="14" stroke-linecap="round" />
      <circle r="256" fill="none" stroke-width="6" />
      <circle r="324" fill="none" stroke-width="6" />
      <path d="M-220 330 L-160 260 M220 330 L160 260" stroke-width="40" stroke-linecap="round" />
      <path d="M-220 330 L-160 260 M220 330 L160 260" stroke="#5a8a9a" stroke-width="26" stroke-linecap="round" />
      <path d="M-300 330 H300 V380 H-300 Z" fill="url(#lab-time-console)" stroke-width="6" />
    </g>
    <path :d="SPARKS" stroke="#fffbe0" stroke-width="10" stroke-linecap="round" class="lab-time-spark" />
    <g class="lab-time-arc" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M690 220 l-30 -30 l20 -10 l-40 -40 M1230 220 l30 -30 l-20 -10 l40 -40" stroke="#9ffaff" stroke-width="7" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M60 760 V440 Q60 420 80 420 H480 Q500 420 500 440 V760 Z" fill="url(#lab-time-console)" stroke-width="7" filter="url(#cel)" />
      <rect x="110" y="610" width="200" height="80" rx="8" fill="#1a1020" stroke-width="5" />
      <path d="M380 620 V560 M440 620 V580" stroke-width="12" stroke-linecap="round" />
      <path d="M380 620 V560 M440 620 V580" stroke="#c9d4f2" stroke-width="6" stroke-linecap="round" />
      <circle cx="380" cy="554" r="16" fill="#e8304a" stroke-width="4" />
      <circle cx="440" cy="574" r="16" fill="#ffd23f" stroke-width="4" />
      <rect x="110" y="700" width="40" height="30" rx="6" fill="#5fd06a" stroke-width="4" />
      <rect x="170" y="700" width="40" height="30" rx="6" fill="#ff7ab0" stroke-width="4" />
      <rect x="230" y="700" width="40" height="30" rx="6" fill="#3ad6e0" stroke-width="4" />
      <g v-for="(d, i) in DIALS" :key="`dl${i}`">
        <circle :cx="d.x" :cy="d.y" :r="d.r" fill="url(#lab-time-brass)" stroke-width="6" />
        <circle :cx="d.x" :cy="d.y" :r="d.r - 12" fill="#fffaf0" stroke-width="4" />
        <path :d="`M${d.x - 30} ${d.y + 10} A32 32 0 0 1 ${d.x + 30} ${d.y + 10}`" stroke="#e8304a" stroke-width="5" fill="none" />
      </g>
    </g>
    <g v-for="(d, i) in DIALS" :key="`nd${i}`" :transform="`translate(${d.x} ${d.y})`">
      <g class="lab-time-needle" :style="{ animationDelay: `${d.d}s` }">
        <path d="M0 6 V-34" stroke="#1b1033" stroke-width="5" stroke-linecap="round" />
      </g>
      <circle r="6" fill="#1b1033" />
    </g>
    <g transform="translate(210 650)">
      <path :d="YEAR_A" transform="translate(0 20)" fill="none" stroke="#ff4f4f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" class="lab-time-year" />
      <path :d="YEAR_B" transform="translate(0 20)" fill="none" stroke="#9dff8a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" class="lab-time-year late" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M1440 760 V520 Q1440 500 1460 500 H1820 Q1840 500 1840 520 V760 Z" fill="url(#lab-time-console)" stroke-width="7" filter="url(#cel)" />
      <path d="M1460 560 H1820 M1460 620 H1820" stroke="#2a4a5a" stroke-width="5" />
      <path d="M1440 640 Q1300 660 1260 720" stroke-width="22" fill="none" stroke-linecap="round" />
      <path d="M1440 640 Q1300 660 1260 720" stroke="#ff8a2f" stroke-width="12" fill="none" stroke-linecap="round" />
      <path d="M1440 700 Q1360 760 1220 760" stroke-width="22" fill="none" stroke-linecap="round" />
      <path d="M1440 700 Q1360 760 1220 760" stroke="#3ad6e0" stroke-width="12" fill="none" stroke-linecap="round" />
      <rect x="1500" y="420" width="260" height="90" rx="10" fill="#1a1020" stroke-width="6" />
    </g>
    <g clip-path="url(#lab-time-scope)">
      <g class="lab-time-wave" stroke="#9dff8a" stroke-width="6" fill="none" stroke-linecap="round">
        <path d="M1500 466 q20 -30 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" />
      </g>
    </g>
    <g transform="translate(1640 690)" stroke="#1b1033" stroke-linejoin="round">
      <g class="lab-time-lever" style="transform-origin: 0 0">
        <path d="M0 0 L60 -100" stroke-width="16" stroke-linecap="round" />
        <path d="M0 0 L60 -100" stroke="#c9d4f2" stroke-width="8" stroke-linecap="round" />
        <circle cx="62" cy="-104" r="22" fill="#e8304a" stroke-width="5" />
      </g>
      <circle r="20" fill="url(#lab-time-brass)" stroke-width="5" />
    </g>

    <g transform="translate(1400 1010)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="50" rx="90" ry="14" fill="#05101a" opacity="0.4" stroke="none" />
      <path d="M-50 50 V-50 Q-50 -80 0 -80 Q50 -80 50 -50 V50 Z" fill="#e8eefc" stroke-width="6" filter="url(#cel-s)" />
      <rect x="-36" y="-56" width="72" height="44" rx="12" fill="#1a1020" stroke-width="5" />
      <circle cx="-14" cy="-34" r="7" fill="#9ffaff" stroke="none" class="lab-time-blink" />
      <circle cx="14" cy="-34" r="7" fill="#9ffaff" stroke="none" class="lab-time-blink" />
      <path d="M0 -80 V-110" stroke-width="5" />
      <circle cx="0" cy="-116" r="9" fill="#ff4f4f" stroke-width="4" />
      <path d="M-50 0 L-90 -30 M50 0 L90 -40" stroke-width="12" stroke-linecap="round" />
      <path d="M-50 0 L-90 -30 M50 0 L90 -40" stroke="#c9d4f2" stroke-width="6" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.lab-time-gear {
  animation: lab-time-spin 14s linear infinite;
}

.lab-time-gear.back {
  animation-direction: reverse;
  animation-duration: 10s;
}

.lab-time-swirl {
  animation: lab-time-spin 5s linear infinite;
}

.lab-time-pulse {
  animation: lab-time-pulse 1.8s ease-in-out infinite alternate;
}

.lab-time-fall {
  animation: lab-time-fall 9s ease-in infinite;
}

.lab-time-spark {
  animation: lab-time-blink 0.8s steps(2) infinite;
}

.lab-time-arc {
  opacity: 0;
  animation: lab-time-arc 3s steps(1) infinite;
}

.lab-time-needle {
  animation: lab-time-needle 1.6s ease-in-out infinite alternate;
}

.lab-time-year {
  animation: lab-time-swap 4s steps(1) infinite;
}

.lab-time-year.late {
  animation-delay: -2s;
}

.lab-time-wave {
  animation: lab-time-wave 0.8s linear infinite;
}

.lab-time-lever {
  animation: lab-time-lever 4s ease-in-out infinite;
}

.lab-time-blink {
  animation: lab-time-blink 2s steps(2) infinite;
}

@keyframes lab-time-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes lab-time-pulse {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

/* clocks get sucked into the vortex: spiral to the middle and shrink away */
@keyframes lab-time-fall {
  from {
    translate: 0 0;
    rotate: 0deg;
    scale: 1;
    opacity: 1;
  }
  to {
    translate: 0 0;
    rotate: 540deg;
    scale: 0;
    opacity: 0.4;
  }
}

@keyframes lab-time-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.3;
  }
}

@keyframes lab-time-arc {
  0%,
  80% {
    opacity: 0;
  }
  82%,
  88% {
    opacity: 1;
  }
  85% {
    opacity: 0.3;
  }
}

@keyframes lab-time-needle {
  from {
    rotate: -50deg;
  }
  to {
    rotate: 55deg;
  }
}

@keyframes lab-time-swap {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes lab-time-wave {
  from {
    translate: 0 0;
  }
  to {
    translate: -80px 0;
  }
}

@keyframes lab-time-lever {
  0%,
  40%,
  100% {
    rotate: 0deg;
  }
  50%,
  80% {
    rotate: -70deg;
  }
}
</style>
