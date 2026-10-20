<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { NINJA_BOMB, NINJA_BOMB_POINTS, NINJA_FRUIT_POINTS } from '../../../../shared/protocol';
import { useCountdown } from '../../common/countdown';
import { useInFlight } from '../../common/flight';
import { answer, socket, view } from '../store';
import { event } from '../haptics';

const phase = computed(() => (view.value?.phase.kind === 'ninja' ? view.value.phase : null));
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => phase.value?.startsAt), () => socket.now(), paused);
const left = useCountdown(computed(() => phase.value?.deadline), () => socket.now(), paused);
const flying = useInFlight(
  computed(() => phase.value?.fruits ?? []),
  (f) => (phase.value?.startsAt ?? 0) + f.at,
  (f) => f.flight,
  () => socket.now(),
  paused,
);
const sliced = ref(new Set<number>(view.value?.personal.kind === 'ninja' ? view.value.personal.sliced : []));
const served = computed(() => (view.value?.personal.kind === 'ninja' ? view.value.personal.score : 0));
// counted here for an instant reply, then put right whenever the server's tally arrives
const score = ref(served.value);
watch(served, (n) => (score.value = n));
const height = ref(0);
const boom = ref(0);

// Canvas overlay for blade trail and slice fx
const laneEl = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ro: ResizeObserver | null = null;

interface TrailPoint { x: number; y: number; t: number }
interface Particle { x: number; y: number; vx: number; vy: number; color: string; born: number }
interface FloatText { x: number; y: number; text: string; color: string; born: number }

const trail: TrailPoint[] = [];
const particles: Particle[] = [];
const floats: FloatText[] = [];
let raf = 0;

const FRUIT_COLORS: Record<string, string> = {
  '🍉': '#fb5d6a', '🍊': '#f59331', '🍋': '#f4cf26', '🍎': '#e23b3b',
  '🍓': '#e8294e', '🍌': '#ffe135', '🍍': '#c5b200', '🥝': '#6dbf3e',
  '🍑': '#ff7b54', '🍇': '#9b51e0',
};
const BOMB_COLOR = '#a3122f';

function laneCoords(clientX: number, clientY: number): { x: number; y: number } {
  const rect = laneEl.value?.getBoundingClientRect();
  if (!rect) return { x: 0, y: 0 };
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function pushTrail(clientX: number, clientY: number): void {
  const { x, y } = laneCoords(clientX, clientY);
  trail.push({ x, y, t: performance.now() });
  if (trail.length > 32) trail.shift();
}

function spawnBurst(clientX: number, clientY: number, color: string): void {
  const { x, y } = laneCoords(clientX, clientY);
  for (let i = 0; i < 9; i++) {
    const a = (Math.PI * 2 * i) / 9 + Math.random() * 0.6;
    const sp = 80 + Math.random() * 140;
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, color, born: performance.now() });
  }
}

function spawnFloat(clientX: number, clientY: number, text: string, color: string): void {
  const { x, y } = laneCoords(clientX, clientY);
  floats.push({ x, y: y - 20, text, color, born: performance.now() });
}

function drawFrame(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const now = performance.now();

  ctx.clearRect(0, 0, W, H);

  // Blade trail
  const TRAIL_LIFE = 150;
  if (trail.length >= 2) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < trail.length; i++) {
      const p0 = trail[i - 1]!;
      const p1 = trail[i]!;
      const a = Math.max(0, 1 - (now - p1.t) / TRAIL_LIFE);
      if (a <= 0) continue;
      // colored glow
      ctx.strokeStyle = '#7c4dff';
      ctx.globalAlpha = a * 0.32;
      ctx.lineWidth = 14 * a + 2;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      // white core
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = a * 0.88;
      ctx.lineWidth = 4 * a + 1;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Particles
  const PART_LIFE = 600;
  for (const p of particles) {
    const age = now - p.born;
    if (age >= PART_LIFE) continue;
    const a = 1 - age / PART_LIFE;
    const dt = age / 1000;
    const px = p.x + p.vx * dt;
    const py = p.y + p.vy * dt + 300 * dt * dt;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, 4 * a + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Floating score text
  const FLOAT_LIFE = 700;
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const f of floats) {
    const age = now - f.born;
    if (age >= FLOAT_LIFE) continue;
    const a = 1 - age / FLOAT_LIFE;
    const py = f.y - (age / FLOAT_LIFE) * 50;
    ctx.globalAlpha = a;
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, py);
  }
  ctx.globalAlpha = 1;

  // Prune expired entries
  const trailCutoff = now - TRAIL_LIFE;
  while (trail.length && trail[0]!.t < trailCutoff) trail.shift();
  for (let i = particles.length - 1; i >= 0; i--) {
    if (now - particles[i]!.born >= PART_LIFE) particles.splice(i, 1);
  }
  for (let i = floats.length - 1; i >= 0; i--) {
    if (now - floats[i]!.born >= FLOAT_LIFE) floats.splice(i, 1);
  }

  raf = requestAnimationFrame(drawFrame);
}

function syncSize(): void {
  const lane = laneEl.value;
  const canvas = canvasRef.value;
  if (!lane || !canvas) return;
  canvas.width = lane.clientWidth;
  canvas.height = lane.clientHeight;
  // clientHeight may be 0 if layout isn't done yet — only update when we get a real value
  if (lane.clientHeight > 0) height.value = lane.clientHeight;
}

// stable ref callback — a new arrow function each render would cause Vue to call old(null)
// then new(el) on every re-render, briefly setting laneEl to null and breaking syncSize
function setLaneRef(el: unknown): void {
  laneEl.value = el instanceof HTMLElement ? el : null;
}

onMounted(() => {
  syncSize();
  ro = new ResizeObserver(syncSize);
  if (laneEl.value) ro.observe(laneEl.value);
  raf = requestAnimationFrame(drawFrame);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  ro?.disconnect();
});

function cut(id: number, clientX: number, clientY: number): void {
  const fruit = phase.value?.fruits.find((f) => f.id === id);
  if (!fruit || sliced.value.has(id) || opensIn.value > 0 || left.value <= 0) return;
  sliced.value = new Set([...sliced.value, id]);
  answer(id, false);
  if (fruit.kind === NINJA_BOMB) {
    score.value = Math.max(0, score.value - NINJA_BOMB_POINTS);
    boom.value++;
    event('lose');
    spawnBurst(clientX, clientY, BOMB_COLOR);
    spawnFloat(clientX, clientY, `-${NINJA_BOMB_POINTS}`, '#ff4455');
  } else {
    score.value += NINJA_FRUIT_POINTS;
    event('tick');
    spawnBurst(clientX, clientY, FRUIT_COLORS[fruit.kind] ?? '#ffd700');
    spawnFloat(clientX, clientY, `+${NINJA_FRUIT_POINTS}`, '#ffe066');
  }
}

function swipe(ev: PointerEvent): void {
  if (ev.pointerType === 'mouse' && ev.buttons === 0) return;
  pushTrail(ev.clientX, ev.clientY);
  const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>('[data-fruit]');
  if (el) cut(Number(el.dataset.fruit), ev.clientX, ev.clientY);
}

</script>

<template>
  <div v-if="phase" class="ninja" :class="{ frozen: paused }">
    <div class="status display">
      <template v-if="opensIn > 0">Приготовьтесь… {{ opensIn }}</template>
      <template v-else-if="left > 0">Режьте! {{ left }} с · {{ score }}</template>
      <template v-else>Стоп! {{ score }} очков</template>
    </div>
    <div
      :ref="setLaneRef"
      class="lane"
      :style="{ '--h': `${height}px` }"
      @pointerdown.prevent="swipe"
      @pointermove="swipe"
    >
      <canvas ref="canvasRef" class="overlay" />
      <div v-if="boom" :key="boom" class="flash" />
      <span
        v-for="f in flying"
        :key="f.id"
        class="fruit"
        :class="{ cut: sliced.has(f.id) }"
        :data-fruit="f.id"
        :style="{ left: `${f.x * 100}%`, animationDuration: `${f.flight}ms`, animationDelay: `${f.delay}ms` }"
      >
        <span class="spin" :style="{ animationDuration: `${f.flight}ms`, animationDelay: `${f.delay}ms` }">{{ f.kind }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.ninja {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status {
  text-align: center;
  font-size: 24px;
  font-weight: 800;
}

.lane {
  position: relative;
  flex: 1;
  min-height: 360px;
  overflow: hidden;
  border-radius: 28px;
  border: var(--line) solid var(--ink);
  background: linear-gradient(#2c1a5c, #12062a);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.flash {
  position: absolute;
  inset: 0;
  background: #a3122f;
  pointer-events: none;
  animation: flash 400ms both;
  z-index: 1;
}

.fruit {
  position: absolute;
  bottom: -70px;
  width: 70px;
  height: 70px;
  margin-left: -35px;
  display: grid;
  place-items: center;
  font-size: 56px;
  line-height: 1;
  animation-name: arc;
  animation-fill-mode: both;
  will-change: transform;
  z-index: 1;
}

.spin {
  animation-name: spin;
  animation-timing-function: linear;
  animation-fill-mode: both;
  pointer-events: none;
}

.fruit.cut {
  opacity: 0;
  transition: opacity 150ms;
  pointer-events: none;
}

@keyframes arc {
  0% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
  }
  50% {
    transform: translateY(calc(var(--h) * -0.8));
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    rotate: 300deg;
  }
}

@keyframes flash {
  from {
    opacity: 0.8;
  }
  to {
    opacity: 0;
  }
}
</style>
