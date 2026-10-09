<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Change this to fire another burst; the first one goes off after `delay`. */
    shot?: number;
    /** Seconds before the first burst, to line up with a reveal animation. */
    delay?: number;
    count?: number;
    /** Where the burst starts, as fractions of the box. */
    x?: number;
    y?: number;
  }>(),
  { shot: 0, delay: 0, count: 140, x: 0.5, y: 0.35 },
);

const COLORS = ['#ff4f8b', '#ffd23f', '#22d3ee', '#2ed47a', '#a66bff', '#ff7a2f', '#ffffff'];
const LIFE_MS = 2600;
const GRAVITY = 0.00045;

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  w: number;
  h: number;
  c: string;
}

const canvas = ref<HTMLCanvasElement>();
let bits: Bit[] = [];
let raf = 0;
let last = 0;
let born = 0;
let dpr = 1;
let scale = 1;
let timer: ReturnType<typeof setTimeout> | undefined;
const osReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fire(): void {
  const c = canvas.value;
  clearTimeout(timer);
  if (!c || osReduced || document.documentElement.classList.contains('less-motion')) return;
  const rect = c.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = rect.width * dpr;
  c.height = rect.height * dpr;
  scale = Math.max(0.6, rect.width / 1000);
  bits = Array.from({ length: props.count }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = (0.6 + Math.random() * 0.9) * scale;
    return {
      x: rect.width * props.x,
      y: rect.height * props.y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      spin: (Math.random() - 0.5) * 0.02,
      angle: Math.random() * Math.PI,
      w: (8 + Math.random() * 8) * scale,
      h: (4 + Math.random() * 5) * scale,
      c: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    };
  });
  born = last = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame);
}

function frame(now: number): void {
  const c = canvas.value;
  const ctx = c?.getContext('2d');
  if (!c || !ctx) return;
  const dt = Math.min(40, now - last);
  last = now;
  const fade = Math.max(0, 1 - (now - born) / LIFE_MS);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = Math.min(1, fade * 2);
  for (const b of bits) {
    b.vy += GRAVITY * scale * dt;
    b.vx *= 0.995;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.angle += b.spin * dt;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    // flipping the width fakes a paper bit tumbling in 3D
    ctx.scale(Math.cos(b.angle * 2), 1);
    ctx.fillStyle = b.c;
    ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.restore();
  }
  if (fade > 0) raf = requestAnimationFrame(frame);
  else ctx.clearRect(0, 0, c.width, c.height);
}

onMounted(() => {
  timer = setTimeout(fire, props.delay * 1000);
});
watch(
  () => props.shot,
  () => fire(),
);
onBeforeUnmount(() => {
  clearTimeout(timer);
  cancelAnimationFrame(raf);
});
</script>

<template>
  <canvas ref="canvas" class="confetti" aria-hidden="true"></canvas>
</template>

<style scoped>
.confetti {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 30;
}
</style>
