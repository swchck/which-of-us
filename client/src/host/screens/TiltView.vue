<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { TEAM_INFO } from '../../../../shared/catalog';
import { ARENA, PAINT, PLAYER_COLORS, type ArenaSnap, type PublicPlayer } from '../../../../shared/protocol';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import { useCountdown } from '../../common/countdown';
import TimerRing from '../parts/TimerRing.vue';
import { onArena, socket, view } from '../store';

const SCALE = 0.9;
/** Share of the remaining distance covered per 60 Hz frame; hides the 30 Hz network steps. */
const SMOOTH = 0.35;
const BALL = ARENA.ball * 2;

const phase = computed(() => (view.value?.phase.kind === 'tilt' ? view.value.phase : null));
const teamOf = (id: string) => phase.value?.teams?.[id];
const teamColor = (id: string) => {
  const team = teamOf(id);
  return team === undefined ? undefined : TEAM_INFO[team].color;
};
const teamStars = computed(() => {
  const p = phase.value;
  if (!p?.teams) return null;
  const sums = [0, 0];
  for (const [id, n] of Object.entries(p.stars)) sums[p.teams[id] ?? 0]! += n;
  return sums;
});
const startsIn = useCountdown(
  computed(() => phase.value?.startsAt),
  () => socket.now(),
  computed(() => view.value?.paused ?? false),
);

interface Ball {
  x: number;
  y: number;
  tx: number;
  ty: number;
  el?: HTMLElement;
}

// positions change every frame, so they live outside Vue and frame() writes the transforms itself
const balls = new Map<string, Ball>();
const ballIds = shallowRef<string[]>([]);
const stars = shallowRef<ArenaSnap['stars']>([]);
const pops = ref<{ key: number; x: number; y: number; value: number }[]>([]);
const floe = ref<number | undefined>(undefined);
const it = ref<string | undefined>(undefined);
const sinking = ref(new Set<string>());
/** «Захват»: percent of the floor per player, refreshed only when a whole percent changes hands. */
const areas = shallowRef<Record<string, number>>({});
const paintCanvas = ref<HTMLCanvasElement>();
let painted = '';
let popKey = 0;
let raf = 0;
let lastFrame = 0;

const byId = computed(() => new Map<string, PublicPlayer>(view.value?.players.map((p) => [p.id, p])));

const mode = computed(() => phase.value?.mode);
const TITLES = { sumo: ['🧊', 'Сумо на льдине'], tag: ['🏃', 'Квач'], paint: ['🎨', 'Захват'] } as const;
const brawlers = computed(() => {
  const p = phase.value;
  if (!p?.mode) return [];
  const out = p.out ?? [];
  return [...(view.value?.players ?? [])]
    .filter((pl) => pl.connected || out.includes(pl.id))
    .map((pl) => ({ player: pl, out: out.includes(pl.id), it: p.it === pl.id, area: areas.value[pl.id] }))
    .sort((a, b) => Number(a.out) - Number(b.out) || Number(b.it) - Number(a.it) || (b.area ?? 0) - (a.area ?? 0));
});

const board = computed(() =>
  [...(view.value?.players ?? [])]
    .filter((p) => phase.value && p.id in phase.value.stars)
    .map((p) => ({ player: p, stars: phase.value?.stars[p.id] ?? 0 }))
    .sort((a, b) => b.stars - a.stars),
);

function bindBall(id: string, el: unknown): void {
  const b = balls.get(id);
  if (!b) return;
  b.el = el instanceof HTMLElement ? el : undefined;
  place(b);
}

function place(b: Ball): void {
  if (b.el) b.el.style.transform = `translate(${b.x - ARENA.ball}px, ${b.y - ARENA.ball}px)`;
}

function onSnap(snap: ArenaSnap): void {
  let joined = false;
  for (const [id, x, y] of snap.balls) {
    const b = balls.get(id);
    if (b) {
      b.tx = x;
      b.ty = y;
    } else {
      balls.set(id, { x, y, tx: x, ty: y });
      joined = true;
    }
  }
  if (joined) ballIds.value = [...balls.keys()];
  floe.value = snap.floe;
  it.value = snap.it;
  if (snap.paint) paint(snap.paint);
  // a ball missing from the snapshot slid off the floe: let it sink, then drop it
  const present = new Set(snap.balls.map((b) => b[0]));
  for (const id of balls.keys()) {
    if (present.has(id) || sinking.value.has(id)) continue;
    sinking.value = new Set([...sinking.value, id]);
    audio.sfx('swoosh');
    later(() => {
      balls.delete(id);
      ballIds.value = [...balls.keys()];
    }, 700);
  }
  const before = stars.value;
  stars.value = snap.stars;
  for (const [, starId, value] of snap.hits) {
    const s = before.find((star) => star[0] === starId);
    if (!s) continue;
    const key = popKey++;
    pops.value = [...pops.value, { key, x: s[1], y: s[2], value }];
    later(() => (pops.value = pops.value.filter((p) => p.key !== key)), 900);
    audio.sfx(value > 1 ? 'fanfare' : 'pop');
  }
}

// one canvas pixel per floor cell, stretched by CSS: a tick repaints a handful of pixels, not 1600×800 at @2x
function paint(cells: string): void {
  const ctx = paintCanvas.value?.getContext('2d');
  const order = phase.value?.painters;
  if (!ctx || !order) return;
  const colors = order.map((id) => PLAYER_COLORS[(byId.value.get(id)?.color ?? 0) % PLAYER_COLORS.length]!);
  const counts = new Array<number>(order.length).fill(0);
  for (let i = 0; i < cells.length; i++) {
    const k = cells.charCodeAt(i) - 97;
    if (k >= 0) counts[k]!++;
    if (cells[i] === painted[i]) continue;
    if (k < 0) ctx.clearRect(i % PAINT.cols, Math.floor(i / PAINT.cols), 1, 1);
    else {
      ctx.fillStyle = colors[k] ?? '#fff';
      ctx.fillRect(i % PAINT.cols, Math.floor(i / PAINT.cols), 1, 1);
    }
  }
  painted = cells;
  const next = Object.fromEntries(order.map((id, k) => [id, Math.round((counts[k]! / cells.length) * 100)]));
  if (order.some((id) => next[id] !== areas.value[id])) areas.value = next;
}

const timers = new Set<ReturnType<typeof setTimeout>>();
function later(fn: () => void, ms: number): void {
  const t = setTimeout(() => {
    timers.delete(t);
    fn();
  }, ms);
  timers.add(t);
}

function frame(now: number): void {
  // frame-rate independent, so a 120 Hz screen eases as smoothly as a 60 Hz one
  const k = 1 - (1 - SMOOTH) ** (lastFrame ? ((now - lastFrame) * 60) / 1000 : 1);
  lastFrame = now;
  for (const b of balls.values()) {
    const dx = b.tx - b.x;
    const dy = b.ty - b.y;
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) continue;
    b.x += dx * k;
    b.y += dy * k;
    place(b);
  }
  raf = requestAnimationFrame(frame);
}

let off: (() => void) | null = null;
onMounted(() => {
  off = onArena(onSnap);
  raf = requestAnimationFrame(frame);
});
onBeforeUnmount(() => {
  off?.();
  cancelAnimationFrame(raf);
  timers.forEach(clearTimeout);
});
</script>

<template>
  <div v-if="phase && view" class="tilt">
    <div v-if="mode" class="board">
      <div class="title display"><Emoji :char="TITLES[mode][0]" /> {{ TITLES[mode][1] }}</div>
      <div v-for="b in brawlers" :key="b.player.id" class="row" :class="{ gone: b.out }">
        <Avatar :player="b.player" :code="view.code" :size="44" :ring="3" />
        <span v-if="b.it" class="tagged display">водит</span>
        <span v-else-if="mode === 'paint'" class="n display">{{ b.area ?? 0 }}%</span>
        <span v-else-if="b.out">💦</span>
      </div>
    </div>
    <div v-else class="board">
      <div class="title display"><Emoji char="⭐" /> Звездопад</div>
      <div v-if="teamStars" class="teams display">
        <span :style="{ color: TEAM_INFO[0].color }"><Emoji :char="TEAM_INFO[0].icon" /> {{ teamStars[0] }}</span>
        <span :style="{ color: TEAM_INFO[1].color }"><Emoji :char="TEAM_INFO[1].icon" /> {{ teamStars[1] }}</span>
      </div>
      <div v-for="(row, i) in board" :key="row.player.id" class="row">
        <span class="place display">{{ i + 1 }}</span>
        <Avatar :player="row.player" :code="view.code" :size="44" :ring="3" />
        <span class="n display">{{ row.stars }}</span>
      </div>
    </div>

    <div class="arena" :style="{ width: `${ARENA.w * SCALE}px`, height: `${ARENA.h * SCALE}px` }">
      <div class="field" :class="{ water: mode === 'sumo' }" :style="{ width: `${ARENA.w}px`, height: `${ARENA.h}px`, transform: `scale(${SCALE})` }">
        <canvas v-if="mode === 'paint'" ref="paintCanvas" class="paint" :width="PAINT.cols" :height="PAINT.rows" />
        <div
          v-if="floe"
          class="floe"
          :style="{ width: `${ARENA.floe * 2}px`, height: `${ARENA.floe * 2}px`, left: `${ARENA.w / 2 - ARENA.floe}px`, top: `${ARENA.h / 2 - ARENA.floe}px`, transform: `scale(${floe / ARENA.floe})` }"
        />
        <div
          v-for="s in stars"
          :key="s[0]"
          class="star"
          :class="{ big: s[3] === 1 }"
          :style="{ left: `${s[1]}px`, top: `${s[2]}px` }"
        >
          <Emoji char="⭐" />
        </div>
        <div
          v-for="id in ballIds"
          :key="id"
          :ref="(el) => bindBall(id, el)"
          class="ball"
          :class="{ team: teamOf(id) !== undefined, it: it === id, sinking: sinking.has(id) }"
          :style="{ width: `${BALL}px`, height: `${BALL}px`, '--team': teamColor(id) }"
        >
          <Avatar v-if="byId.get(id)" :player="byId.get(id)!" :code="view.code" :size="BALL - (teamOf(id) === undefined ? 8 : 24)" :ring="4" />
        </div>
        <div v-for="p in pops" :key="p.key" class="pop display" :style="{ left: `${p.x}px`, top: `${p.y}px` }">
          +{{ p.value }}
        </div>
      </div>
      <div v-if="startsIn > 0" class="countdown display">
        <span :key="startsIn" class="pop-in">{{ startsIn }}</span>
        <small>{{ mode === 'sumo' ? 'Толкайтесь, но не падайте!' : mode === 'tag' ? 'Убегайте от водящего!' : mode === 'paint' ? 'Красьте пол своим цветом!' : 'Наклоняйте телефоны!' }}</small>
      </div>
    </div>

    <div class="timer">
      <TimerRing :deadline="phase.deadline" :size="140" />
    </div>
  </div>
</template>

<style scoped>
.tilt {
  position: absolute;
  inset: 0;
  padding: 36px 30px 220px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 24px;
}

.board {
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.teams {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 32px;
  font-weight: 900;
}

.water {
  border-radius: 28px;
  background: linear-gradient(160deg, #1d6fb8, #0c3f7a);
}

.paint {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  opacity: 0.8;
}

.floe {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #ffffff, #d7f3ff 60%, #a9e2f7);
  box-shadow:
    0 0 0 6px var(--ink),
    0 14px 0 6px rgba(0, 0, 0, 0.25);
  /* scaling a fixed-size disc stays on the compositor; animating its size repaints 1600 px at @2x */
  transition: transform 400ms linear;
}

.ball.it {
  border-radius: 50%;
  box-shadow: 0 0 0 6px var(--red);
}

/* the glow is drawn once and only pulsed: an animated blur shadow repaints every frame of the round */
.ball.it::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 0 40px 16px rgba(255, 59, 92, 0.7);
  pointer-events: none;
  animation: hunt 0.6s ease-in-out infinite alternate;
}

@keyframes hunt {
  from {
    opacity: 0.6;
    transform: scale(0.9);
  }
}

.ball.sinking :deep(.avatar) {
  transition:
    transform 700ms ease-in,
    opacity 700ms ease-in;
  transform: scale(0.2) rotate(200deg);
  opacity: 0;
}

.row.gone {
  opacity: 0.45;
  filter: grayscale(1);
}

.tagged {
  padding: 0 8px;
  border-radius: 8px;
  background: var(--red);
  color: #fff;
  font-size: 15px;
}

.ball.team {
  border-radius: 50%;
  background: var(--team);
  box-shadow: 0 0 0 5px var(--ink);
}

.title {
  font-size: 18px;
  font-weight: 800;
  color: var(--yellow);
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.place {
  width: 20px;
  font-size: 18px;
}

.n {
  font-size: 26px;
  font-weight: 900;
}

.arena {
  position: relative;
  flex: none;
  border-radius: 40px;
  border: 6px solid var(--ink);
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08), transparent 70%),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 2px, transparent 2px 80px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 2px, transparent 2px 80px),
    rgba(18, 6, 42, 0.9);
  box-shadow:
    var(--shadow),
    inset 0 0 60px rgba(34, 211, 238, 0.25);
  overflow: hidden;
}

.field {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}

.ball {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  place-items: center;
  will-change: transform;
}

.star {
  position: absolute;
  font-size: 58px;
  line-height: 1;
  transform: translate(-50%, -50%);
  animation:
    pop-in 400ms both,
    twinkle-star 1.4s ease-in-out infinite;
  /* text-shadow is rasterized with the glyph once; a filter would re-run every animated frame */
  text-shadow: 0 0 12px rgba(255, 210, 63, 0.8);
  will-change: scale, rotate;
}

.star.big {
  font-size: 110px;
  text-shadow: 0 0 30px rgb(255, 210, 63);
}

.pop {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 54px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow: 0 4px 0 var(--ink);
  animation: rise 900ms ease-out both;
  pointer-events: none;
}

.countdown {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(18, 6, 42, 0.55);
  font-size: 220px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow: 0 10px 0 var(--ink);
}

.countdown small {
  font-size: 40px;
  color: #fff;
  text-shadow: 0 4px 0 var(--ink);
}

.timer {
  width: 150px;
  display: flex;
  justify-content: center;
}

@keyframes twinkle-star {
  0%,
  100% {
    scale: 1;
    rotate: -8deg;
  }
  50% {
    scale: 1.15;
    rotate: 8deg;
  }
}

@keyframes rise {
  from {
    opacity: 1;
    translate: 0 0;
  }
  to {
    opacity: 0;
    translate: 0 -90px;
  }
}
</style>
