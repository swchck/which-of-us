<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useCountdown } from '../../common/countdown';
import { answer, socket, view } from '../store';
import { event } from '../haptics';

const BLOCK_H = 30;
const START_W = 0.82;
const INIT_SPEED = 0.4;
const SPEED_INC = 0.025;
const MAX_SPEED = 1.8;
const MOVING_GAP = 60;
const TOP_MARGIN = 50;
const COLORS = ['#ff4f8b', '#ffce3b', '#4df0a2', '#3bceff', '#ff8c42', '#c97dff', '#ff5555', '#7dff4f'];

interface Block {
  x: number;
  w: number;
  color: string;
}

const phase = computed(() => (view.value?.phase.kind === 'stack' ? view.value.phase : null));
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => phase.value?.startsAt), () => socket.now(), paused);
const left = useCountdown(computed(() => phase.value?.deadline), () => socket.now(), paused);
const open = computed(() => opensIn.value <= 0 && left.value > 0);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const layers = ref(0);
const gameOver = ref(false);

let stack: Block[] = [];
let moving = { x: 0, w: 0, dir: 1 as 1 | -1, speed: 0 };
let rafId = 0;
let lastTime = 0;

function colorAt(i: number): string {
  return COLORS[i % COLORS.length]!;
}

function initGame(canvas: HTMLCanvasElement): void {
  const cw = canvas.width;
  const bw = Math.round(cw * START_W);
  stack = [{ x: Math.round((cw - bw) / 2), w: bw, color: '#334155' }];
  layers.value = 0;
  gameOver.value = false;
  moving = { x: 0, w: bw, dir: 1, speed: (INIT_SPEED * cw) / 1000 };
  lastTime = 0;
}

function render(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!;
  const cw = canvas.width;
  const ch = canvas.height;
  const n = stack.length;

  const naturalMovingY = ch - (n + 1) * BLOCK_H - MOVING_GAP;
  const cameraOffset = Math.max(0, TOP_MARGIN - naturalMovingY);

  ctx.clearRect(0, 0, cw, ch);

  const bg = ctx.createLinearGradient(0, 0, 0, ch);
  bg.addColorStop(0, '#1a2a4a');
  bg.addColorStop(1, '#0a1020');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cw, ch);

  ctx.save();
  ctx.translate(0, cameraOffset);

  for (let i = 0; i < n; i++) {
    const b = stack[i]!;
    const by = ch - (i + 1) * BLOCK_H;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, by, b.w, BLOCK_H);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x + 1, by + 1, b.w - 2, BLOCK_H - 2);
  }

  if (!gameOver.value) {
    ctx.fillStyle = colorAt(n);
    ctx.fillRect(moving.x, naturalMovingY, moving.w, BLOCK_H);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(moving.x + 1, naturalMovingY + 1, moving.w - 2, BLOCK_H - 2);
  }

  ctx.restore();
}

function loop(ts: number): void {
  if (gameOver.value) return;

  const canvas = canvasRef.value;
  if (!canvas) return;

  const dt = lastTime ? Math.min(ts - lastTime, 50) : 16;
  lastTime = ts;

  if (!paused.value && open.value) {
    const cw = canvas.width;
    moving.x += moving.dir * moving.speed * dt;
    if (moving.x <= 0) {
      moving.x = 0;
      moving.dir = 1;
    } else if (moving.x + moving.w >= cw) {
      moving.x = cw - moving.w;
      moving.dir = -1;
    }
  }

  render(canvas);
  rafId = requestAnimationFrame(loop);
}

function drop(): void {
  if (!open.value || gameOver.value) return;

  const canvas = canvasRef.value;
  if (!canvas) return;
  const cw = canvas.width;

  const top = stack[stack.length - 1]!;
  const ol = Math.max(moving.x, top.x);
  const or_ = Math.min(moving.x + moving.w, top.x + top.w);
  const ow = or_ - ol;

  if (ow <= 0) {
    gameOver.value = true;
    render(canvas);
    answer(layers.value);
    event('lose');
    return;
  }

  stack.push({ x: ol, w: ow, color: colorAt(stack.length) });
  layers.value = stack.length - 1;

  const newSpeed = Math.min(MAX_SPEED, INIT_SPEED + SPEED_INC * layers.value) * cw / 1000;
  moving = { x: 0, w: ow, dir: 1, speed: newSpeed };

  answer(layers.value);
  event('tick');
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = canvas.clientWidth || 320;
  canvas.height = canvas.clientHeight || 500;
  initGame(canvas);
  rafId = requestAnimationFrame(loop);
});

onBeforeUnmount(() => cancelAnimationFrame(rafId));

watch(left, (n) => {
  if (n === 0 && !gameOver.value) {
    gameOver.value = true;
    const canvas = canvasRef.value;
    if (canvas) render(canvas);
    answer(layers.value);
  }
});
</script>

<template>
  <div v-if="phase" class="stack" :class="{ frozen: paused }">
    <div class="status display">
      <template v-if="opensIn > 0">Приготовьтесь… {{ opensIn }}</template>
      <template v-else-if="left > 0">Этажей: {{ layers }} · {{ left }} с</template>
      <template v-else>Стоп! {{ layers }} эт.</template>
    </div>
    <div class="field">
      <canvas ref="canvasRef" @pointerdown.prevent="drop" />
      <div v-if="opensIn > 0" class="overlay display">{{ opensIn }}</div>
      <div v-else-if="gameOver || left === 0" class="overlay">
        <span class="stop-label display">Стоп!</span>
        <span class="stop-count display">{{ layers }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status {
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  flex: none;
}

.field {
  position: relative;
  flex: 1;
  min-height: 300px;
  border-radius: 24px;
  border: var(--line) solid var(--ink);
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(10, 16, 32, 0.6);
  pointer-events: none;
}

.overlay.display {
  font-size: 100px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow: 0 6px 0 var(--ink);
}

.stop-label {
  font-size: 48px;
  color: #fff;
  text-shadow: 0 4px 0 var(--ink);
}

.stop-count {
  font-size: 96px;
  color: var(--yellow);
  text-shadow: 0 6px 0 var(--ink);
}

.frozen canvas {
  opacity: 0.6;
}
</style>
