<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { send, view } from '../store';
import { event } from '../haptics';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'freeze' ? view.value.phase : null));
const alive = computed(() => view.value?.personal.kind === 'freeze' && view.value.personal.alive);
const stage = computed(() => phase.value?.stage ?? 'ready');
const round = computed(() => phase.value?.round ?? 0);

/** A finger that moved within this window still counts as dancing. */
const MOVING_MS = 150;
const SAMPLE_MS = 100;
const REPORT_MS = 400;
// a finger already on the glass when the music stops gets this long to lift before it counts
const LIFT_MS = 400;

let lastMove = 0;
let danced = 0;
const fingers = new Set<number>();
let liftCheck: ReturnType<typeof setTimeout> | undefined;
let liftBy = 0;
const caught = ref(false);
const meter = ref(0);

function report(value: [number, number] | string): void {
  const v = view.value;
  if (v) send({ t: 'answer', phaseId: v.phaseId, value: value as number[] | string });
}

function flinch(): void {
  if (stage.value !== 'freeze' || caught.value || Date.now() < liftBy) return;
  caught.value = true;
  event('lose');
  report(`moved:${round.value}`);
}

function down(ev: PointerEvent): void {
  fingers.add(ev.pointerId);
  lastMove = Date.now();
  flinch();
}

function move(): void {
  lastMove = Date.now();
  flinch();
}

function up(ev: PointerEvent): void {
  fingers.delete(ev.pointerId);
}

watch([stage, round], ([s], [prev]) => {
  if (s === 'music') {
    danced = 0;
    meter.value = 0;
    caught.value = false;
  } else if (s === 'freeze' && prev === 'music') {
    report([round.value, danced]);
    liftBy = Date.now() + LIFT_MS;
    liftCheck = setTimeout(() => fingers.size > 0 && flinch(), LIFT_MS + 20);
  }
});

const sampler = setInterval(() => {
  if (stage.value !== 'music' || Date.now() - lastMove > MOVING_MS) return;
  danced += SAMPLE_MS;
  meter.value = Math.min(1, danced / 4000);
}, SAMPLE_MS);
const reporter = setInterval(() => {
  if (stage.value === 'music' && alive.value) report([round.value, danced]);
}, REPORT_MS);
onBeforeUnmount(() => {
  clearTimeout(liftCheck);
  clearInterval(sampler);
  clearInterval(reporter);
});
</script>

<template>
  <div v-if="phase" class="freeze">
    <Waiting v-if="!alive" title="Вы выбыли" note="Смотрите, кто продержится дольше" icon="🫠" />
    <div
      v-else
      class="pad"
      :class="[stage, { caught }]"
      @pointerdown.prevent="down"
      @pointermove.prevent="move"
      @pointerup="up"
      @pointercancel="up"
      @pointerleave="up"
    >
      <b class="display">{{ stage === 'ready' ? 'Приготовьтесь…' : stage === 'music' ? 'Танцуйте!' : caught ? 'Ой!' : 'Замри!' }}</b>
      <small>{{ stage === 'music' ? 'водите пальцем по экрану' : stage === 'freeze' ? 'не трогайте экран' : 'сейчас заиграет музыка' }}</small>
      <div v-if="stage === 'music'" class="meter"><i :style="{ width: `${meter * 100}%` }" /></div>
    </div>
  </div>
</template>

<style scoped>
.freeze {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pad {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 4px solid var(--ink);
  border-radius: 28px;
  background: var(--violet);
  color: #fff;
  text-align: center;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition: background-color 100ms;
}

.pad b {
  font-size: 44px;
}

.pad small {
  font-size: 18px;
  font-weight: 800;
}

.pad.music {
  background: radial-gradient(circle at 50% 40%, var(--pink), #8a1f6b);
}

.pad.freeze {
  background: radial-gradient(circle at 50% 40%, #d6f6ff, #5ab8e0);
  color: var(--ink);
}

.pad.caught {
  background: var(--red);
  color: #fff;
}

.meter {
  width: 70%;
  height: 16px;
  border: 3px solid var(--ink);
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.meter i {
  display: block;
  height: 100%;
  background: var(--yellow);
}
</style>
