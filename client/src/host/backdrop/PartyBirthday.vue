<script setup lang="ts">
import { seeded, strokeText } from './kit';

const rnd = seeded(1207);
const f1 = (n: number) => n.toFixed(1);
const WORDS = 'С днём рождения!';
const FLAG_COLORS = ['#ff4f6d', '#ffd23f', '#3ad6e0', '#8a6bff', '#5fd06a', '#ff8a2f'];
// pennants hang from a sagging string, one letter each; spaces just skip a flag
const FLAGS = (() => {
  const chars = [...WORDS];
  const x0 = 170;
  const step = (1750 - x0) / (chars.length - 1);
  return chars
    .map((ch, i) => {
      const x = x0 + i * step;
      const t = (x - x0) / (1750 - x0);
      const y = 80 + Math.sin(t * Math.PI) * 90;
      return { ch, x, y, c: FLAG_COLORS[i % FLAG_COLORS.length]!, letter: strokeText(ch, x, y + 50, 30, 'middle') };
    })
    .filter((f) => f.ch !== ' ');
})();
const STRING = `M60 70 Q960 ${80 + 180} 1860 70`;
const BALLOONS = [
  { x: 150, y: 420, c: '#ff4f6d', k: 1.1, d: 0 },
  { x: 290, y: 330, c: '#3ad6e0', k: 0.9, d: -1.2 },
  { x: 230, y: 560, c: '#ffd23f', k: 1, d: -2.1 },
  { x: 1680, y: 360, c: '#8a6bff', k: 1.05, d: -0.6 },
  { x: 1810, y: 470, c: '#5fd06a', k: 0.95, d: -1.7 },
  { x: 1600, y: 540, c: '#ff8a2f', k: 0.85, d: -2.6 },
];
const CANDLES = [-110, -55, 0, 55, 110];
const CONFETTI = FLAG_COLORS.slice(0, 4).map((c) => ({
  c,
  d: Array.from({ length: 10 }, () => {
    const x = rnd() * 1920;
    const y = rnd() * 1000;
    const a = rnd() * 6;
    return `M${f1(x)} ${f1(y)} l${f1(Math.cos(a) * 12)} ${f1(Math.sin(a) * 6)}`;
  }).join(' '),
}));
const WALL_DOTS = Array.from({ length: 50 }, () => `M${f1(rnd() * 1920)} ${f1(240 + rnd() * 460)} h0.1`).join(' ');
</script>

<template>
  <g>
    <defs>
      <linearGradient id="party-birthday-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffb3d9" />
        <stop offset="100%" stop-color="#e87ab8" />
      </linearGradient>
      <linearGradient id="party-birthday-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b87ad0" />
        <stop offset="100%" stop-color="#7a3a9a" />
      </linearGradient>
      <linearGradient id="party-birthday-cloth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffaf0" />
        <stop offset="100%" stop-color="#e8d8f0" />
      </linearGradient>
      <linearGradient id="party-birthday-cake" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ff9ccf" />
        <stop offset="100%" stop-color="#e05a9a" />
      </linearGradient>
      <linearGradient id="party-birthday-cake2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fff0c0" />
        <stop offset="100%" stop-color="#f0c87a" />
      </linearGradient>
      <radialGradient id="party-birthday-glow">
        <stop offset="0%" stop-color="#fff3a0" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fff3a0" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="party-birthday-shine" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="840" fill="url(#party-birthday-wall)" />
    <path :d="WALL_DOTS" stroke="#fff0f8" stroke-width="16" stroke-linecap="round" opacity="0.5" />
    <rect x="-60" y="700" width="2040" height="80" fill="#c85a9a" />
    <path d="M-60 700 H1980" stroke="#1b1033" stroke-width="5" />
    <path d="M-60 780 H1980 V1140 H-60 Z" fill="url(#party-birthday-floor)" />
    <path d="M-60 780 H1980" stroke="#1b1033" stroke-width="5" />

    <path :d="STRING" stroke="#1b1033" stroke-width="4" fill="none" />
    <g v-for="(f, i) in FLAGS" :key="`fl${i}`" stroke="#1b1033" stroke-linejoin="round">
      <path :d="`M${f1(f.x - 40)} ${f1(f.y)} H${f1(f.x + 40)} L${f1(f.x)} ${f1(f.y + 100)} Z`" :fill="f.c" stroke-width="4" />
      <path :d="f.letter" fill="none" stroke="#fffaf0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <g v-for="(b, i) in BALLOONS" :key="`bl${i}`" :transform="`translate(${b.x} ${b.y}) scale(${b.k})`">
      <g class="party-birthday-bob" :style="{ animationDelay: `${b.d}s` }">
        <path d="M0 76 Q-20 140 10 200 Q30 260 0 330" stroke="#1b1033" stroke-width="3" fill="none" />
        <path d="M0 -80 Q66 -80 66 -6 Q66 60 0 76 Q-66 60 -66 -6 Q-66 -80 0 -80 Z" :fill="b.c" stroke="#1b1033" stroke-width="5" />
        <path d="M0 -80 Q66 -80 66 -6 Q66 60 0 76 Q-66 60 -66 -6 Q-66 -80 0 -80 Z" fill="url(#party-birthday-shine)" />
        <path d="M-10 76 L0 90 L10 76 Z" :fill="b.c" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-36 -40 Q-30 -60 -12 -64" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />
      </g>
    </g>

    <ellipse cx="960" cy="560" rx="360" ry="200" fill="url(#party-birthday-glow)" class="party-birthday-glow" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="960" cy="1000" rx="560" ry="40" fill="#4a1a5a" opacity="0.35" stroke="none" />
      <path d="M440 820 H1480 L1520 1000 H400 Z" fill="url(#party-birthday-cloth)" stroke-width="6" filter="url(#cel)" />
      <path d="M400 1000 Q460 1030 520 1000 Q580 1030 640 1000 Q700 1030 760 1000 Q820 1030 880 1000 Q940 1030 1000 1000 Q1060 1030 1120 1000 Q1180 1030 1240 1000 Q1300 1030 1360 1000 Q1420 1030 1480 1000 Q1500 1014 1520 1000" fill="#ff9ccf" stroke-width="5" />
      <path d="M480 840 H1400" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
    </g>

    <g transform="translate(960 840)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="0" rx="230" ry="26" fill="#e8e0f0" stroke-width="5" />
      <path d="M-190 -10 V-110 H190 V-10 Q0 14 -190 -10 Z" fill="url(#party-birthday-cake)" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-190 -110 Q-160 -80 -130 -110 Q-100 -80 -70 -110 Q-40 -80 -10 -110 Q20 -80 50 -110 Q80 -80 110 -110 Q140 -80 170 -110 Q180 -96 190 -110" fill="#fffaf0" stroke-width="4" />
      <path d="M-140 -210 V-110 H140 V-210 Z" fill="url(#party-birthday-cake2)" stroke-width="6" />
      <path d="M-140 -210 Q-115 -180 -90 -210 Q-65 -180 -40 -210 Q-15 -180 10 -210 Q35 -180 60 -210 Q85 -180 110 -210 Q125 -190 140 -210" fill="#ff9ccf" stroke-width="4" />
      <ellipse cx="0" cy="-210" rx="140" ry="16" fill="#ffd0e8" stroke-width="4" />
      <path d="M-160 -60 h0.1 M-100 -40 h0.1 M-40 -56 h0.1 M30 -44 h0.1 M90 -60 h0.1 M150 -42 h0.1 M-100 -150 h0.1 M-30 -140 h0.1 M50 -156 h0.1 M110 -144 h0.1" stroke="#5ad0ff" stroke-width="10" stroke-linecap="round" />
      <path d="M-140 -50 h0.1 M-70 -66 h0.1 M0 -40 h0.1 M60 -64 h0.1 M120 -50 h0.1 M-70 -130 h0.1 M10 -170 h0.1 M80 -126 h0.1" stroke="#ffd23f" stroke-width="10" stroke-linecap="round" />
      <g v-for="(x, i) in CANDLES" :key="`cd${i}`">
        <rect :x="x - 9" y="-290" width="18" height="74" rx="4" :fill="FLAG_COLORS[i]" stroke-width="4" />
        <path :d="`M${x - 9} -270 l18 -10 M${x - 9} -250 l18 -10 M${x - 9} -230 l18 -10`" stroke="#fff" stroke-width="4" opacity="0.7" />
        <path :d="`M${x} -290 V-302`" stroke-width="4" />
      </g>
    </g>
    <g v-for="(x, i) in CANDLES" :key="`fm${i}`" :transform="`translate(${960 + x} 538)`">
      <circle r="30" fill="url(#party-birthday-glow)" />
      <g class="party-birthday-flame" :style="{ animationDelay: `-${i * 0.13}s` }">
        <path d="M0 0 Q-16 -18 0 -44 Q16 -18 0 0 Z" fill="#ffb02e" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M0 -6 Q-7 -16 0 -30 Q7 -16 0 -6 Z" fill="#fff6c0" />
      </g>
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <g transform="translate(560 830)">
        <rect x="-70" y="-110" width="140" height="110" rx="6" fill="#3ad6e0" stroke-width="6" filter="url(#cel-s)" />
        <path d="M-12 -110 V0 M12 -110 V0" stroke="#ff4f6d" stroke-width="8" />
        <path d="M0 -110 Q-50 -160 -40 -120 Q-30 -100 0 -110 Q30 -100 40 -120 Q50 -160 0 -110 Z" fill="#ff4f6d" stroke-width="4" />
      </g>
      <g transform="translate(1370 830)">
        <rect x="-60" y="-150" width="120" height="150" rx="6" fill="#ffd23f" stroke-width="6" filter="url(#cel-s)" />
        <path d="M-60 -80 H60" stroke="#8a6bff" stroke-width="12" />
        <path d="M0 -150 Q-40 -196 -34 -160 Q-26 -140 0 -150 Q26 -140 34 -160 Q40 -196 0 -150 Z" fill="#8a6bff" stroke-width="4" />
      </g>
      <g transform="translate(1250 830)">
        <path d="M-40 0 L0 -100 L40 0 Z" fill="#5fd06a" stroke-width="5" />
        <path d="M-26 -34 L26 -34 M-14 -64 H14" stroke="#ffd23f" stroke-width="7" />
        <circle cx="0" cy="-104" r="12" fill="#ff4f6d" stroke-width="4" />
      </g>
    </g>

    <g v-for="(c, i) in CONFETTI" :key="`cf${i}`" class="confetti" :style="{ animationDuration: `${7 + i * 1.5}s`, animationDelay: `-${i * 2}s` }">
      <path :d="c.d" :stroke="c.c" stroke-width="7" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.party-birthday-bob {
  animation: party-birthday-bob 3.2s ease-in-out infinite alternate;
}

.party-birthday-flame {
  transform-origin: 0 0;
  animation: party-birthday-flame 0.3s ease-in-out infinite alternate;
}

.party-birthday-glow {
  animation: party-birthday-glow 2s ease-in-out infinite alternate;
}

@keyframes party-birthday-bob {
  from {
    translate: 0 0;
    rotate: -3deg;
  }
  to {
    translate: 0 -24px;
    rotate: 3deg;
  }
}

@keyframes party-birthday-flame {
  from {
    scale: 1 1;
    rotate: -4deg;
  }
  to {
    scale: 0.9 1.12;
    rotate: 4deg;
  }
}

@keyframes party-birthday-glow {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}
</style>
