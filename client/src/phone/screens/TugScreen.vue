<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { TEAM_INFO } from '../../../../shared/catalog';
import { useCountdown } from '../../common/countdown';
import { answer, socket, view } from '../store';
import { event } from '../haptics';

const phase = computed(() => (view.value?.phase.kind === 'tug' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'tug' ? view.value.personal : null));
const team = computed(() => TEAM_INFO[personal.value?.team ?? 0]);
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => phase.value?.startsAt), () => socket.now(), paused);
const left = useCountdown(computed(() => phase.value?.deadline), () => socket.now(), paused);
const open = computed(() => opensIn.value <= 0 && left.value > 0);
const count = ref(personal.value?.count ?? 0);
let sent = count.value;

// one message per tap would flood the room, so the running total goes out on a timer like in «Тапалка»
const ticker = setInterval(() => {
  if (count.value !== sent) {
    sent = count.value;
    answer(sent, false);
  }
}, 150);
onBeforeUnmount(() => clearInterval(ticker));

function pull(): void {
  if (!open.value) return;
  count.value++;
  if (count.value % 10 === 0) event('hit');
}
</script>

<template>
  <div v-if="phase" class="tug" :style="{ '--tc': team.color }">
    <div class="team display">{{ team.icon }} Команда «{{ team.title }}»</div>
    <div class="status display">
      <template v-if="opensIn > 0">Приготовьтесь… {{ opensIn }}</template>
      <template v-else-if="left > 0">Тяните! {{ left }} с</template>
      <template v-else>Стоп!</template>
    </div>
    <button class="pad display" :class="{ open }" @pointerdown.prevent="pull">
      <span class="count">{{ count }}</span>
      <small>{{ open ? 'жмите изо всех сил' : 'ждём старта' }}</small>
    </button>
  </div>
</template>

<style scoped>
.tug {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.team {
  align-self: center;
  padding: 6px 18px;
  border: 3px solid var(--ink);
  border-radius: 14px;
  background: var(--tc);
  color: #fff;
  font-size: 20px;
  text-shadow: 0 2px 0 var(--ink);
}

.status {
  text-align: center;
  font-size: 24px;
  font-weight: 800;
}

.pad {
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 32px;
  border: var(--line) solid var(--ink);
  background: var(--muted);
  color: var(--ink);
  box-shadow: var(--shadow);
  touch-action: none;
  transition: background 200ms;
}

.pad.open {
  background: var(--tc);
  color: #fff;
}

.pad:active.open {
  translate: 0 4px;
  box-shadow: 0 2px 0 var(--ink);
}

.count {
  font-size: 96px;
  font-weight: 900;
  -webkit-text-stroke: 6px var(--ink);
  paint-order: stroke;
}

.pad small {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 800;
}
</style>
