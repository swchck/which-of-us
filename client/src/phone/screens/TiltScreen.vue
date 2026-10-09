<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { TEAM_INFO } from '../../../../shared/catalog';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import { useCountdown } from '../../common/countdown';
import { needsPermission, requestSensors, sensorsPossible, watchTilt, type TiltWatcher } from '../tilt';
import { me, send, socket, view } from '../store';

const SEND_MS = 50;
const RESEND_MS = 250;

const phase = computed(() => (view.value?.phase.kind === 'tilt' ? view.value.phase : null));
const stars = computed(() => (view.value?.personal.kind === 'tilt' ? view.value.personal.stars : 0));
const status = computed(() => (view.value?.personal.kind === 'tilt' ? view.value.personal.status : undefined));
const STATUS = {
  on: { icon: '🧊', text: 'Держитесь на льдине!' },
  out: { icon: '💦', text: 'Вы в воде — смотрите на экран' },
  it: { icon: '🫵', text: 'Вы водите! Догоняйте' },
  free: { icon: '🏃', text: 'Убегайте от водящего!' },
  paint: { icon: '🎨', text: 'Красьте пол своим цветом!' },
} as const;
const color = computed(() => (me.value ? PLAYER_COLORS[me.value.color] : 'var(--yellow)'));
const team = computed(() => {
  const t = me.value ? phase.value?.teams?.[me.value.id] : undefined;
  return t === undefined ? null : TEAM_INFO[t];
});
const startsIn = useCountdown(
  computed(() => phase.value?.startsAt),
  () => socket.now(),
);

const possible = sensorsPossible();
const permissionNeeded = ref(needsPermission());
const sensorLive = ref(false);
const pad = ref<HTMLDivElement>();
const knob = ref<HTMLDivElement>();
const bubble = ref<HTMLSpanElement>();
let watcher: TiltWatcher | null = null;
let sensor = { x: 0, y: 0 };
let stick: { x: number; y: number } | null = null;
let stickPointer: number | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
let lastSent = { x: 9, y: 9, at: 0 };

// knob and bubble follow the finger or sensor at input rate; going through Vue would re-render per event
function place(el: HTMLElement | undefined, v: { x: number; y: number }, reach: number): void {
  if (el) el.style.transform = `translate(${v.x * reach}px, ${v.y * reach}px)`;
}

function startSensors(): void {
  watcher?.stop();
  watcher = watchTilt((x, y) => {
    sensorLive.value = true;
    sensor = { x, y };
    place(bubble.value, sensor, 46);
  });
}

async function enable(): Promise<void> {
  if (await requestSensors()) {
    permissionNeeded.value = false;
    startSensors();
  }
}

function tick(): void {
  const v = view.value;
  if (!v || v.paused || v.phase.kind !== 'tilt' || socket.now() < v.phase.startsAt) return;
  const cur = stick ?? (sensorLive.value ? sensor : { x: 0, y: 0 });
  const now = Date.now();
  const moved = Math.abs(cur.x - lastSent.x) > 0.02 || Math.abs(cur.y - lastSent.y) > 0.02;
  // the server forgets input after 600 ms, so a held tilt has to be restated
  if (!moved && now - lastSent.at < RESEND_MS) return;
  lastSent = { x: cur.x, y: cur.y, at: now };
  send({ t: 'tilt', phaseId: v.phaseId, x: Math.round(cur.x * 100) / 100, y: Math.round(cur.y * 100) / 100 });
}

function stickFrom(ev: PointerEvent): void {
  const el = pad.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const radius = r.width / 2;
  let x = (ev.clientX - r.left - radius) / radius;
  let y = (ev.clientY - r.top - radius) / radius;
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  stick = { x, y };
  place(knob.value, stick, 70);
}

function down(ev: PointerEvent): void {
  if (stickPointer !== null) return;
  pad.value?.setPointerCapture(ev.pointerId);
  stickPointer = ev.pointerId;
  stickFrom(ev);
}

function move(ev: PointerEvent): void {
  if (ev.pointerId === stickPointer) stickFrom(ev);
}

function up(ev: PointerEvent): void {
  if (ev.pointerId !== stickPointer) return;
  stickPointer = null;
  stick = null;
  place(knob.value, { x: 0, y: 0 }, 0);
}

onMounted(() => {
  if (possible && !permissionNeeded.value) startSensors();
  timer = setInterval(tick, SEND_MS);
});

onBeforeUnmount(() => {
  watcher?.stop();
  clearInterval(timer);
});
</script>

<template>
  <div v-if="phase" class="tilt" :style="{ '--c': color }">
    <div v-if="status" :key="status" class="status display pop-in" :class="status">
      <Emoji :char="STATUS[status].icon" /> {{ STATUS[status].text }}
    </div>
    <div v-else class="stars display">
      <Emoji class="star" char="⭐" />
      <span :key="stars" class="n pop-in">{{ stars }}</span>
    </div>

    <div v-if="team" class="team display" :style="{ background: team.color }">Команда: <Emoji :char="team.icon" /> {{ team.title }}</div>
    <div v-if="startsIn > 0" class="ready display">Приготовьтесь… {{ startsIn }}</div>

    <template v-if="possible">
      <button v-if="permissionNeeded" class="btn pink" @click="enable">Включить управление наклоном</button>
      <div v-else-if="sensorLive" class="sensor">
        <div class="level">
          <span ref="bubble" class="bubble"></span>
        </div>
        <div class="hint">Наклоняйте телефон, чтобы катить шарик</div>
        <button class="btn ghost small" @click="watcher?.recalibrate()">Выровнять</button>
      </div>
    </template>
    <p v-else class="hint">Управляйте пальцем. Для наклона включите в лобби режим «Датчики наклона».</p>

    <div
      ref="pad"
      class="pad"
      @pointerdown.prevent="down"
      @pointermove.prevent="move"
      @pointerup="up"
      @pointercancel="up"
    >
      <div ref="knob" class="knob"></div>
    </div>
  </div>
</template>

<style scoped>
.status {
  padding: 8px 18px;
  border: 3px solid var(--ink);
  border-radius: 16px;
  background: var(--paper);
  color: var(--ink);
  font-size: 22px;
  text-align: center;
}

.status.it {
  background: var(--red);
  color: #fff;
}

.status.out {
  background: #a9e2f7;
}

.team {
  align-self: center;
  padding: 6px 16px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  color: #fff;
  font-weight: 900;
  text-shadow: 0 2px 0 var(--ink);
}

.tilt {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  gap: 16px;
  padding: 10px 0;
  user-select: none;
}

.stars {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 72px;
  font-weight: 900;
}

.star {
  animation: wobble 1.2s ease-in-out infinite;
}

.ready {
  font-size: 26px;
  font-weight: 800;
  color: var(--yellow);
}

.sensor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.level {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 4px solid var(--ink);
  background: var(--paper);
  display: grid;
  place-items: center;
}

.bubble {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--c);
  border: 3px solid var(--ink);
}

.hint {
  margin: 0;
  max-width: 300px;
  text-align: center;
  font-weight: 700;
  color: var(--muted);
}

.pad {
  position: relative;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 4px dashed rgba(255, 255, 255, 0.35);
  background: rgba(0, 0, 0, 0.2);
  display: grid;
  place-items: center;
  touch-action: none;
}

.knob {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: var(--c);
  border: 4px solid var(--ink);
  box-shadow: 0 5px 0 var(--ink);
  pointer-events: none;
}
</style>
