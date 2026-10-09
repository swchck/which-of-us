<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Board, Stroke } from '../../../shared/protocol';
import { drawCover, loadImage, loadInk, paint, partial, pointCount, type LiveInk } from './ink';

const props = withDefaults(
  defineProps<{
    code: string;
    board: Board;
    ink?: string;
    /** Strokes streamed from the artist right now, painted on top. */
    live?: LiveInk;
    image?: string;
    /** Animate the drawing stroke by stroke over this many ms; 0 shows it at once. */
    replay?: number;
    paper?: string;
  }>(),
  { ink: undefined, live: undefined, image: undefined, replay: 0, paper: '#fffaf0' },
);

const root = ref<HTMLDivElement>();
const bg = ref<HTMLCanvasElement>();
const fg = ref<HTMLCanvasElement>();
let strokes: Stroke[] = [];
let img: HTMLImageElement | null = null;
let scale = 1;
let raf = 0;
let replayStart = 0;
let observer: ResizeObserver | null = null;

function size(): void {
  const el = root.value;
  if (!el || !bg.value || !fg.value) return;
  const width = el.clientWidth;
  if (width === 0) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const height = (width * props.board.h) / props.board.w;
  for (const c of [bg.value, fg.value]) {
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
  }
  scale = bg.value.width / props.board.w;
  drawBg();
  drawFg();
}

function drawBg(): void {
  const c = bg.value;
  const ctx = c?.getContext('2d');
  if (!c || !ctx) return;
  ctx.fillStyle = props.paper;
  ctx.fillRect(0, 0, c.width, c.height);
  if (img) drawCover(ctx, img, c.width, c.height);
}

function drawFg(): void {
  cancelAnimationFrame(raf);
  raf = 0;
  const c = fg.value;
  const ctx = c?.getContext('2d');
  if (!c || !ctx) return;
  ctx.clearRect(0, 0, c.width, c.height);
  let shown = strokes;
  if (props.replay > 0) {
    const t = Math.min(1, (performance.now() - replayStart) / props.replay);
    shown = partial(strokes, pointCount(strokes) * t);
    if (t < 1) raf = requestAnimationFrame(drawFg);
  }
  paint(ctx, props.live ? [...shown, ...props.live.strokes()] : shown, scale);
}

let loads = 0;

async function load(): Promise<void> {
  const generation = ++loads;
  const [loadedInk, loadedImg] = await Promise.all([
    props.ink ? loadInk(props.code, props.ink).catch(() => []) : Promise.resolve([]),
    props.image ? loadImage(props.code, props.image).catch(() => null) : Promise.resolve(null),
  ]);
  if (generation !== loads) return;
  strokes = loadedInk;
  img = loadedImg;
  replayStart = performance.now();
  drawBg();
  drawFg();
}

onMounted(() => {
  observer = new ResizeObserver(size);
  if (root.value) observer.observe(root.value);
  size();
  void load();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  cancelAnimationFrame(raf);
});

watch(() => [props.ink, props.image], () => void load());
// several ops can land within one frame; paint once per frame
watch(
  () => props.live?.version.value,
  () => {
    if (props.replay === 0 && !raf) raf = requestAnimationFrame(drawFg);
  },
);
</script>

<template>
  <div ref="root" class="inkview" :style="{ aspectRatio: `${board.w} / ${board.h}` }">
    <canvas ref="bg"></canvas>
    <canvas ref="fg"></canvas>
  </div>
</template>

<style scoped>
.inkview {
  position: relative;
  width: 100%;
  overflow: hidden;
}

canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
