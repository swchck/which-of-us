<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { PLAYER_COLORS, SHAKER_POP_MAX } from '../../../../shared/protocol';
import { useCountdown } from '../../common/countdown';
import { needsPermission, requestSensors, sensorsPossible, watchShake } from '../tilt';
import { answer, me, socket, view } from '../store';
import { event } from '../haptics';

const phase = computed(() => (view.value?.phase.kind === 'shaker' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'shaker' ? view.value.personal : null));
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => phase.value?.startsAt), () => socket.now(), paused);
const left = useCountdown(computed(() => phase.value?.deadline), () => socket.now(), paused);
const open = computed(() => opensIn.value <= 0 && left.value > 0 && !personal.value?.popped);
const count = ref(personal.value?.count ?? 0);
const color = computed(() => (me.value ? PLAYER_COLORS[me.value.color] : 'var(--pink)'));
const scale = computed(() => 0.35 + Math.min(1, count.value / SHAKER_POP_MAX) * 0.9);
const permissionNeeded = ref(needsPermission());
let sent = count.value;
let stopShake: (() => void) | null = null;
const shaking = ref(false);

// a message per pump would flood the room, so the total goes out on a timer, as in «Тапалка»
const ticker = setInterval(() => {
  if (count.value !== sent) {
    sent = count.value;
    answer(sent, false);
  }
}, 250);

function pump(): void {
  if (!open.value) return;
  count.value++;
  if (count.value % 10 === 0) event('hit');
}

function listen(): void {
  stopShake?.();
  stopShake = watchShake(pump);
  shaking.value = true;
}

async function enable(): Promise<void> {
  if (await requestSensors()) {
    permissionNeeded.value = false;
    listen();
  }
}

onMounted(() => {
  if (sensorsPossible() && !permissionNeeded.value) listen();
});
onBeforeUnmount(() => {
  clearInterval(ticker);
  stopShake?.();
});
</script>

<template>
  <div v-if="phase && personal" class="shaker">
    <div class="status display">
      <template v-if="personal.popped">Бах! Шарик лопнул</template>
      <template v-else-if="opensIn > 0">Приготовьтесь… {{ opensIn }}</template>
      <template v-else-if="left > 0">Надувайте! {{ left }} с</template>
      <template v-else>Стоп!</template>
    </div>
    <button class="pad" :class="{ open }" @pointerdown.prevent="pump">
      <span v-if="personal.popped" class="burst">💥</span>
      <span v-else class="balloon" :style="{ '--c': color, transform: `scale(${scale})` }" />
      <small class="display">{{ personal.popped ? 'В этот раз без очков' : !open ? 'ждём старта' : shaking ? 'трясите телефон или жмите сюда' : 'жмите сюда' }}</small>
    </button>
    <button v-if="permissionNeeded && !personal.popped" class="btn pink" @click="enable">Надувать тряской</button>
  </div>
</template>

<style scoped>
.shaker {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.status {
  text-align: center;
  font-size: 24px;
  font-weight: 800;
}

.pad {
  flex: 1;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
  overflow: hidden;
  border-radius: 32px;
  border: var(--line) solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  touch-action: manipulation;
}

.pad.open:active {
  background: #fff6d6;
}

.balloon {
  width: 200px;
  height: 240px;
  flex: none;
  border: 5px solid var(--ink);
  border-radius: 50% 50% 48% 52% / 58% 58% 42% 42%;
  background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.75) 0 12%, transparent 13%), var(--c);
  transform-origin: 50% 100%;
  transition: transform 160ms ease-out;
}

.burst {
  font-size: 140px;
  line-height: 1;
}

small {
  font-size: 18px;
}
</style>
