<script setup lang="ts">
import Icon from '../common/Icon.vue';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { ERASER, INK_COLORS, MONSTER_GUIDE, type Board, type InkOp, type Stroke } from '../../../shared/protocol';
import { drawCover, loadImage, loadInk, paint } from '../common/ink';

const props = withDefaults(
  defineProps<{
    code: string;
    board: Board;
    image?: string;
    /** Stored strokes painted under the player's own ink (shared canvas). */
    under?: string;
    /** Monster: strokes from the section above, already shifted into negative y. */
    guide?: Stroke[];
    /** Monster: mark the bottom band the next player will see. */
    handoff?: boolean;
    initial?: Stroke[];
  }>(),
  { image: undefined, under: undefined, guide: undefined, handoff: false, initial: () => [] },
);

const emit = defineEmits<{ op: [op: InkOp] }>();

const SIZES = [6, 14, 30];
const MAX_POINTS = 1100;
const LIVE_MS = 70;

const wrap = ref<HTMLDivElement>();
const bg = ref<HTMLCanvasElement>();
const fg = ref<HTMLCanvasElement>();
const color = ref<string>(INK_COLORS[0]);
const size = ref(SIZES[1]!);
const erasing = ref(false);
const strokes = shallowRef<Stroke[]>(props.initial.slice());
let current: Stroke | null = null;
/** Coordinates of `current` already streamed; each live move carries only the rest. */
let streamed = 0;
let pointerId: number | null = null;
let scale = 1;
let lastLive = 0;
let raf = 0;
let img: HTMLImageElement | null = null;
let underStrokes: Stroke[] = [];
let observer: ResizeObserver | null = null;
let rect: DOMRect | null = null;
let loads = 0;
// finished strokes live in an offscreen layer, so a frame repaints one blit plus the stroke in progress
const committed = document.createElement('canvas');

/** Board units shown above y = 0 for the monster guide. */
const band = computed(() => (props.guide ? MONSTER_GUIDE : 0));
const total = computed(() => props.board.h + band.value);

function layout(): void {
  const el = wrap.value;
  if (!el || !bg.value || !fg.value) return;
  const maxW = el.clientWidth;
  const maxH = el.clientHeight;
  if (maxW === 0 || maxH === 0) return;
  const width = Math.min(maxW, (maxH * props.board.w) / total.value);
  const height = (width * total.value) / props.board.w;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  for (const c of [bg.value, fg.value]) {
    c.style.width = `${width}px`;
    c.style.height = `${height}px`;
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
  }
  committed.width = fg.value.width;
  committed.height = fg.value.height;
  scale = bg.value.width / props.board.w;
  drawBg();
  recommit();
}

function drawBg(): void {
  const c = bg.value;
  const ctx = c?.getContext('2d');
  if (!c || !ctx) return;
  const top = band.value * scale;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(0, top, c.width, c.height - top);
  if (img) {
    ctx.save();
    ctx.translate(0, top);
    drawCover(ctx, img, c.width, c.height - top);
    ctx.restore();
  }
  if (underStrokes.length) paint(ctx, underStrokes, scale, -band.value);
  if (props.guide) {
    ctx.fillStyle = '#e9e1ff';
    ctx.fillRect(0, 0, c.width, top);
    ctx.globalAlpha = 0.85;
    paint(ctx, props.guide, scale, -band.value);
    ctx.globalAlpha = 1;
    dashed(ctx, top, '#8b5cf6');
  }
  if (props.handoff) {
    const y = (band.value + props.board.h - MONSTER_GUIDE) * scale;
    ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
    ctx.fillRect(0, y, c.width, c.height - y);
    dashed(ctx, y, '#8b5cf6');
  }
}

function dashed(ctx: CanvasRenderingContext2D, y: number, stroke: string): void {
  ctx.save();
  ctx.setLineDash([14 * scale, 10 * scale]);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(ctx.canvas.width, y);
  ctx.stroke();
  ctx.restore();
}

function redraw(): void {
  raf = 0;
  const c = fg.value;
  const ctx = c?.getContext('2d');
  if (!c || !ctx) return;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(committed, 0, 0);
  if (current) paint(ctx, [current], scale, -band.value);
}

function recommit(): void {
  const ctx = committed.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, committed.width, committed.height);
  paint(ctx, strokes.value, scale, -band.value);
  schedule();
}

function schedule(): void {
  if (!raf) raf = requestAnimationFrame(redraw);
}

function toBoard(ev: PointerEvent): [number, number] {
  rect ??= fg.value!.getBoundingClientRect();
  const k = props.board.w / rect.width;
  const x = Math.round((ev.clientX - rect.left) * k);
  const y = Math.round((ev.clientY - rect.top) * k - band.value);
  return [Math.max(0, Math.min(props.board.w, x)), Math.max(0, Math.min(props.board.h, y))];
}

function startStroke(ev: PointerEvent): void {
  current = { c: erasing.value ? ERASER : color.value, w: erasing.value ? size.value * 2 : size.value, p: toBoard(ev) };
  streamed = 0;
}

function down(ev: PointerEvent): void {
  if (pointerId !== null) return;
  // capture first: it throws for a pointer that is already gone, and a claimed id would lock the pad
  fg.value?.setPointerCapture(ev.pointerId);
  pointerId = ev.pointerId;
  rect = null;
  window.getSelection()?.removeAllRanges();
  startStroke(ev);
  schedule();
}

function move(ev: PointerEvent): void {
  if (ev.pointerId !== pointerId || !current) return;
  const events = ev.getCoalescedEvents?.() ?? [ev];
  for (const e of events.length ? events : [ev]) {
    const [x, y] = toBoard(e);
    const n = current.p.length;
    if (Math.hypot(x - current.p[n - 2]!, y - current.p[n - 1]!) < 3) continue;
    current.p.push(x, y);
    if (current.p.length / 2 >= MAX_POINTS) {
      finish();
      startStroke(e);
    }
  }
  schedule();
  const now = performance.now();
  if (now - lastLive > LIVE_MS && current.p.length > streamed) {
    lastLive = now;
    emit('op', { k: 'move', s: { c: current.c, w: current.w, p: current.p.slice(streamed) } });
    streamed = current.p.length;
  }
}

function finish(): void {
  if (!current) return;
  const done = current;
  current = null;
  strokes.value = [...strokes.value, done];
  const ctx = committed.getContext('2d');
  if (ctx) paint(ctx, [done], scale, -band.value);
  emit('op', { k: 'end', s: done });
  schedule();
}

function up(ev: PointerEvent): void {
  if (ev.pointerId !== pointerId) return;
  pointerId = null;
  finish();
}

function undo(): void {
  if (strokes.value.length === 0) return;
  strokes.value = strokes.value.slice(0, -1);
  emit('op', { k: 'undo' });
  recommit();
}

function clear(): void {
  if (strokes.value.length === 0) return;
  strokes.value = [];
  emit('op', { k: 'clear' });
  recommit();
}

function pickColor(c: string): void {
  color.value = c;
  erasing.value = false;
}

async function loadLayers(): Promise<void> {
  const generation = ++loads;
  const layers = await Promise.all([
    props.image ? loadImage(props.code, props.image).catch(() => null) : null,
    props.under ? loadInk(props.code, props.under).catch(() => []) : [],
  ]);
  if (generation !== loads) return;
  [img, underStrokes] = layers;
  drawBg();
}

onMounted(() => {
  observer = new ResizeObserver(layout);
  if (wrap.value) observer.observe(wrap.value);
  layout();
  void loadLayers();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  if (raf) cancelAnimationFrame(raf);
  committed.width = 0;
  // the canvas keeps pointer capture while it fades out, so drop the stroke or its moves hit a null ref
  pointerId = null;
  current = null;
});

watch(() => [props.image, props.under], () => void loadLayers());
watch(() => props.guide, drawBg);
</script>

<template>
  <div class="pad">
    <div ref="wrap" class="surface">
      <div class="stack">
        <canvas ref="bg" class="bg"></canvas>
        <canvas
          ref="fg"
          class="fg"
          @pointerdown.prevent="down"
          @pointermove.prevent="move"
          @pointerup="up"
          @pointercancel="up"
          @touchstart.prevent
          @touchmove.prevent
          @contextmenu.prevent
        ></canvas>
      </div>
    </div>
    <div class="tools">
      <div class="swatches">
        <button
          v-for="c in INK_COLORS"
          :key="c"
          class="swatch"
          :class="{ on: !erasing && color === c }"
          :style="{ background: c }"
          :aria-label="`Цвет ${c}`"
          @click="pickColor(c)"
        ></button>
      </div>
      <div class="row">
        <button
          v-for="s in SIZES"
          :key="s"
          class="tool size"
          :class="{ on: size === s }"
          :aria-label="`Толщина ${s}`"
          @click="size = s"
        >
          <span :style="{ width: `${s * 0.7 + 4}px`, height: `${s * 0.7 + 4}px`, background: erasing ? '#fff' : color }"></span>
        </button>
        <button class="tool" :class="{ on: erasing }" aria-label="Ластик" @click="erasing = !erasing"><Icon name="eraser" /></button>
        <button class="tool" aria-label="Отменить" :disabled="strokes.length === 0" @click="undo"><Icon name="undo" /></button>
        <button class="tool" aria-label="Очистить" :disabled="strokes.length === 0" @click="clear"><Icon name="trash" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pad {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
}

.surface {
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
}

.stack {
  position: relative;
  border: var(--line) solid var(--ink);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow);
  line-height: 0;
}

.fg {
  position: absolute;
  inset: 0;
  touch-action: none;
  cursor: crosshair;
}

.tools {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: none;
}

.swatches {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
}

.swatch {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 3px solid var(--ink);
  padding: 0;
  cursor: pointer;
  transition: transform 100ms;
}

/* ten in a row shrink to ~25px dots on a 320px phone; two rows of wide pills stay easy to hit */
@media (max-width: 400px) {
  .swatches {
    grid-template-columns: repeat(5, 1fr);
  }

  .swatch {
    aspect-ratio: auto;
    height: 36px;
    border-radius: 14px;
  }
}

.swatch.on {
  transform: scale(1.18);
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 6px var(--ink);
}

.row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.tool {
  height: 46px;
  border-radius: 12px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-size: 22px;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 3px 0 var(--ink);
}

.tool.on {
  background: var(--yellow);
}

.tool:disabled {
  opacity: 0.45;
}

.size span {
  display: block;
  border-radius: 50%;
  border: 2px solid var(--ink);
}
</style>
