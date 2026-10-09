<script setup lang="ts">
import { seeded } from './kit';

defineProps<{ theme: 'lobby' | 'final' }>();

const rnd = seeded(101);
const CONFETTI_COLORS = ['#ff4f8b', '#ffd23f', '#22d3ee', '#2ed47a', '#a66bff', '#ff7a2f'];
const PIECES = Array.from({ length: 46 }, (_, i) => {
  const piece = { x: rnd() * 1920, y: rnd() * 1080, w: 14 + rnd() * 18, h: 8 + rnd() * 10, r: rnd() * 360, c: CONFETTI_COLORS[i % CONFETTI_COLORS.length] };
  rnd();
  rnd();
  return { ...piece, round: rnd() > 0.6 };
});
// falling sheets like the snow: a sheet falls 1200px a loop, so its copy sits 1200px above
const CONFETTI = [13, 10, 7].map((s, i) => ({ s, pieces: PIECES.filter((_, j) => j % 3 === i) }));
const RAYS = Array.from({ length: 18 }, (_, i) => i * 20);
// the show set: a static sunburst behind the stage and a scalloped valance with gold trim
const SUNBURST = Array.from({ length: 12 }, (_, i) => i * 30);
function wedge(angle: number): string {
  const ray = (a: number) => `${960 + Math.cos((a * Math.PI) / 180) * 1800} ${420 + Math.sin((a * Math.PI) / 180) * 1800}`;
  return `M960 420 L${ray(angle)} L${ray(angle + 15)} Z`;
}
const SCALLOPS = Array.from({ length: 12 }, (_, i) => i * 160);
const VALANCE = `M0 0 H1920 V58 ${SCALLOPS.map((x) => `Q${1920 - x - 80} 122 ${1920 - x - 160} 58`).join(' ')} Z`;
const VALANCE_TRIM = `M0 62 ${SCALLOPS.map((x) => `Q${x + 80} 126 ${x + 160} 62`).join(' ')}`;
// sizes fake depth: a small balloon is far away, so it also rises slower and fades into the haze
const BALLOONS = Array.from({ length: 11 }, (_, i) => {
  const k = 0.5 + rnd() * 0.95;
  return { x: 80 + rnd() * 1760, c: CONFETTI_COLORS[i % CONFETTI_COLORS.length], d: rnd() * 24, s: 34 - k * 12 + rnd() * 6, k, o: 0.55 + k * 0.35 };
}).sort((a, b) => a.k - b.k);
</script>

<template>
  <g>
    <g v-if="theme === 'final'" class="rays">
      <path
        v-for="a in RAYS"
        :key="a"
        d="M960 540 L940 -900 L980 -900 Z"
        fill="#fff"
        opacity="0.09"
        :transform="`rotate(${a} 960 540) scale(1)`"
      />
    </g>
    <path v-for="a in SUNBURST" :key="`sb${a}`" :d="wedge(a)" fill="#fff" opacity="0.045" />
    <path d="M0 990 Q960 940 1920 990 L1920 1080 L0 1080 Z" fill="#1c0a3a" />
    <path d="M0 990 Q960 940 1920 990" stroke="#ffcf33" stroke-width="5" fill="none" opacity="0.6" />
    <ellipse cx="560" cy="1010" rx="300" ry="46" fill="url(#g-pool)" />
    <ellipse cx="1360" cy="1010" rx="300" ry="46" fill="url(#g-pool)" />
    <g v-if="theme === 'lobby'">
      <g
        v-for="(b, i) in BALLOONS"
        :key="`bl${i}`"
        class="balloon"
        :opacity="Math.min(1, b.o)"
        :style="{ animationDelay: `-${b.d}s`, animationDuration: `${b.s}s` }"
      >
        <g :transform="`translate(${b.x} 1110) scale(${b.k})`">
          <path d="M0 40 q-12 40 0 80" stroke="#fff" stroke-opacity="0.5" stroke-width="2" fill="none" />
          <ellipse rx="34" ry="42" :fill="b.c" stroke="#1b1033" stroke-width="4" />
          <path d="M-5 41 l5 8 l5 -8 Z" :fill="b.c" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
          <ellipse cx="-12" cy="-16" rx="7" ry="12" fill="#fff" opacity="0.5" />
        </g>
      </g>
    </g>
    <g v-for="side in [1, -1]" :key="`cu${side}`" :transform="side === -1 ? 'translate(1920 0) scale(-1 1)' : undefined">
      <path d="M0 0 H210 C180 280 140 540 118 690 C108 770 150 860 170 1080 H0 Z" fill="url(#g-curtain)" stroke="#1b1033" stroke-width="6" />
      <path d="M0 0 H210 C180 280 140 540 118 690 C108 770 150 860 170 1080 H0 Z" fill="url(#g-curtain-shade)" />
      <path d="M0 668 Q70 700 124 694" stroke="#1b1033" stroke-width="18" fill="none" stroke-linecap="round" />
      <path d="M0 668 Q70 700 124 694" stroke="#ffcf33" stroke-width="9" fill="none" stroke-linecap="round" />
      <path d="M116 700 Q128 720 124 742 L150 742 Q144 718 132 700 Z" fill="#ffcf33" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
      <path d="M124 742 L120 784 M131 742 L130 788 M138 742 L140 788 M145 742 L150 784" stroke="#e8a817" stroke-width="5" stroke-linecap="round" />
      <circle cx="126" cy="696" r="10" fill="#ffcf33" stroke="#1b1033" stroke-width="5" />
    </g>
    <path :d="VALANCE" fill="url(#g-curtain)" stroke="#1b1033" stroke-width="6" />
    <path :d="VALANCE" fill="#1a0726" opacity="0.25" />
    <path :d="VALANCE_TRIM" stroke="#ffcf33" stroke-width="8" fill="none" />
    <g v-for="(sheet, i) in CONFETTI" :key="`cf${i}`" class="confetti" :style="{ animationDuration: `${sheet.s}s` }">
      <g v-for="copy in 2" :key="copy" :transform="copy === 2 ? 'translate(-40 -1200)' : undefined">
        <template v-for="(c, j) in sheet.pieces" :key="j">
          <circle v-if="c.round" :cx="c.x" :cy="c.y" :r="c.h * 0.7" :fill="c.c" />
          <rect v-else :x="c.x" :y="c.y" :width="c.w" :height="c.h" rx="3" :fill="c.c" :transform="`rotate(${c.r} ${c.x} ${c.y})`" />
        </template>
      </g>
    </g>
  </g>
</template>
