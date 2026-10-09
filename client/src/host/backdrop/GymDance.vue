<script setup lang="ts">
const MIRRORS = Array.from({ length: 6 }, (_, i) => ({ x: -40 + i * 340 }));
const PLANKS = Array.from({ length: 24 }, (_, i) => -1200 + i * 200)
  .map((xb) => `M${(960 + (xb - 960) * 0.3).toFixed(1)} 720 L${xb} 1140`)
  .join(' ');
const MIRROR_PLANKS = Array.from({ length: 24 }, (_, i) => -1200 + i * 200)
  .map((xb) => `M${(960 + (xb - 960) * 0.2).toFixed(1)} 560 L${(960 + (xb - 960) * 0.3).toFixed(1)} 700`)
  .join(' ');
const BRACKETS = [140, 560, 960, 1360, 1780];
const NOTES = [
  { x: 1500, y: 860, d: 0 },
  { x: 1560, y: 840, d: -2 },
  { x: 1460, y: 820, d: -4 },
];
const LIGHTS = [260, 760, 1160, 1660];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="gym-dance-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffd8e8" />
        <stop offset="100%" stop-color="#f0b0d0" />
      </linearGradient>
      <linearGradient id="gym-dance-mirror" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e0f4ff" />
        <stop offset="60%" stop-color="#a8d4f0" />
        <stop offset="100%" stop-color="#8ab8e0" />
      </linearGradient>
      <linearGradient id="gym-dance-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f0c080" />
        <stop offset="100%" stop-color="#c0803a" />
      </linearGradient>
      <linearGradient id="gym-dance-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8b47a" />
        <stop offset="100%" stop-color="#a8683e" />
      </linearGradient>
      <linearGradient id="gym-dance-shine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="gym-dance-pool" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff6c0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#fff6c0" stop-opacity="0" />
      </radialGradient>
      <clipPath id="gym-dance-glass"><rect x="-40" y="140" width="2040" height="560" /></clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="800" fill="url(#gym-dance-wall)" />
    <path d="M-60 0 H1980 M-60 40 H1980" stroke="#e890b8" stroke-width="6" />
    <g v-for="x in LIGHTS" :key="`lt${x}`" stroke="#1b1033" stroke-linejoin="round">
      <path :d="`M${x - 40} 60 H${x + 40} L${x + 30} 90 H${x - 30} Z`" fill="#fffaf0" stroke-width="5" />
    </g>

    <rect x="-40" y="140" width="2040" height="560" fill="url(#gym-dance-mirror)" />
    <g clip-path="url(#gym-dance-glass)">
      <path d="M-40 560 H2000 V700 H-40 Z" fill="#c0d8f0" opacity="0.8" />
      <path :d="MIRROR_PLANKS" stroke="#9ab8d8" stroke-width="3" opacity="0.6" />
      <g opacity="0.45">
        <g transform="translate(1100 560) scale(0.8)" stroke="#5a7ab0" stroke-linejoin="round" fill="#8aa8d8">
          <circle cx="0" cy="-310" r="40" stroke-width="5" />
          <path d="M-36 -270 L-50 -150 Q0 -130 50 -150 L36 -270 Z" stroke-width="5" />
          <path d="M-60 -150 Q0 -110 60 -150 L80 -120 Q0 -80 -80 -120 Z" stroke-width="5" />
          <path d="M-14 -110 L-30 0 M14 -110 L60 -40" stroke-width="16" stroke-linecap="round" />
          <path d="M-36 -250 L-120 -310 M36 -250 L120 -310" stroke-width="12" stroke-linecap="round" />
        </g>
      </g>
      <g class="gym-dance-shine">
        <path d="M-200 140 L-80 140 L-380 700 L-500 700 Z M-30 140 L10 140 L-290 700 L-330 700 Z" fill="url(#gym-dance-shine)" />
      </g>
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect v-for="(m, i) in MIRRORS" :key="`mr${i}`" :x="m.x" y="140" width="340" height="560" fill="none" stroke-width="10" />
      <rect x="-40" y="130" width="2040" height="16" fill="#fffaf0" stroke-width="5" />
    </g>

    <path d="M-60 720 H1980 V1140 H-60 Z" fill="url(#gym-dance-floor)" />
    <path :d="PLANKS" stroke="#a8682e" stroke-width="3" opacity="0.5" />
    <path d="M-60 700 H1980 V722 H-60 Z" fill="#fffaf0" stroke="#1b1033" stroke-width="5" />
    <ellipse cx="960" cy="900" rx="520" ry="110" fill="url(#gym-dance-pool)" class="gym-dance-pool" />
    <path d="M500 1060 l40 -20 M900 980 l50 10 M1300 1040 l30 -30" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.35" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <path v-for="x in BRACKETS" :key="`bk${x}`" :d="`M${x} 520 V700`" stroke-width="16" />
      <path v-for="x in BRACKETS" :key="`bc${x}`" :d="`M${x} 520 V700`" stroke="#c9d4f2" stroke-width="7" />
      <rect x="-60" y="500" width="2040" height="30" rx="15" fill="url(#gym-dance-wood)" stroke-width="7" filter="url(#cel-s)" />
      <path d="M-40 508 H1960" stroke="#ffe0b0" stroke-width="5" stroke-linecap="round" />
    </g>

    <g transform="translate(420 980)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="30" rx="140" ry="16" fill="#5a2a10" opacity="0.3" stroke="none" />
      <path d="M-110 30 Q-130 -10 -90 -16 H-30 Q-10 -16 -10 10 V30 Z" fill="#ff9ab8" stroke-width="5" />
      <path d="M10 30 Q-10 -10 30 -16 H90 Q110 -16 110 10 V30 Z" fill="#ff9ab8" stroke-width="5" />
      <path d="M-70 -16 Q-80 -60 -40 -80 M50 -16 Q40 -60 80 -80" stroke="#ff9ab8" stroke-width="7" fill="none" stroke-linecap="round" />
    </g>

    <g transform="translate(1520 960)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="70" rx="200" ry="20" fill="#5a2a10" opacity="0.3" stroke="none" />
      <path d="M-100 -110 Q0 -190 100 -110" stroke-width="14" fill="none" stroke-linecap="round" />
      <rect x="-180" y="-110" width="360" height="180" rx="24" fill="#4a7ad8" stroke-width="7" filter="url(#cel-s)" />
      <circle cx="-100" cy="-20" r="56" fill="#2a2240" stroke-width="5" />
      <circle cx="100" cy="-20" r="56" fill="#2a2240" stroke-width="5" />
      <rect x="-40" y="-90" width="80" height="40" rx="6" fill="#9ae8ff" stroke-width="4" />
      <path d="M-30 -30 h60 M-30 -10 h60" stroke-width="5" />
    </g>
    <g v-for="(s, i) in [-100, 100]" :key="`sp${i}`" :transform="`translate(${1520 + s} 940)`">
      <circle r="26" fill="#5a5a7a" stroke="#1b1033" stroke-width="4" class="gym-dance-woof" />
    </g>
    <g v-for="(n, i) in NOTES" :key="`nt${i}`" class="gym-dance-note" :style="{ animationDelay: `${n.d}s` }">
      <path :d="`M${n.x} ${n.y} V${n.y - 60} L${n.x + 40} ${n.y - 74} V${n.y - 14}`" stroke="#e8307a" stroke-width="7" fill="none" stroke-linejoin="round" />
      <ellipse :cx="n.x - 10" :cy="n.y" rx="13" ry="10" fill="#e8307a" />
      <ellipse :cx="n.x + 30" :cy="n.y - 14" rx="13" ry="10" fill="#e8307a" />
    </g>

    <g transform="translate(1800 960)">
      <g class="gym-dance-ribbon" style="transform-origin: 0 0">
        <path d="M0 0 L0 -160" stroke="#1b1033" stroke-width="10" stroke-linecap="round" />
        <path d="M0 0 L0 -160" stroke="#fffaf0" stroke-width="5" stroke-linecap="round" />
        <path d="M0 -160 Q80 -220 40 -300 Q0 -360 80 -400 Q140 -420 120 -480" stroke="#ff4f6d" stroke-width="14" fill="none" stroke-linecap="round" />
      </g>
      <path d="M-50 60 L-60 -40 H60 L50 60 Z" fill="#ffd23f" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
      <path d="M-58 -10 H58" stroke="#e8902a" stroke-width="8" />
    </g>
    <g transform="translate(150 980)" stroke="#1b1033" stroke-linejoin="round">
      <rect x="-60" y="-120" width="120" height="150" rx="16" fill="#3ad6e0" stroke-width="6" />
      <path d="M-40 -120 V-150 H40 V-120" fill="none" stroke-width="7" />
      <rect x="-40" y="-80" width="80" height="40" rx="6" fill="#fffaf0" stroke-width="4" />
    </g>
  </g>
</template>

<style scoped>
.gym-dance-shine {
  animation: gym-dance-shine 7s ease-in-out infinite;
}

.gym-dance-pool {
  animation: gym-dance-pool 3s ease-in-out infinite alternate;
}

.gym-dance-woof {
  transform-box: fill-box;
  transform-origin: center;
  animation: gym-dance-woof 0.4s ease-in-out infinite alternate;
}

.gym-dance-note {
  animation: gym-dance-note 6s ease-out infinite;
}

.gym-dance-ribbon {
  animation: gym-dance-ribbon 2.4s ease-in-out infinite alternate;
}

/* a glint slides across the mirror wall now and then */
@keyframes gym-dance-shine {
  0% {
    translate: 0 0;
  }
  60%,
  100% {
    translate: 2600px 0;
  }
}

@keyframes gym-dance-pool {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

@keyframes gym-dance-woof {
  from {
    scale: 1;
  }
  to {
    scale: 1.15;
  }
}

@keyframes gym-dance-note {
  0% {
    translate: 0 0;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    translate: -60px -260px;
    opacity: 0;
  }
}

@keyframes gym-dance-ribbon {
  from {
    rotate: -18deg;
  }
  to {
    rotate: 14deg;
  }
}
</style>
