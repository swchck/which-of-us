<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useCountdown } from '../../common/countdown';
import { answer, socket, view } from '../store';
import { event } from '../haptics';

const phase = computed(() => (view.value?.phase.kind === 'tap' ? view.value.phase : null));
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => phase.value?.startsAt), () => socket.now(), paused);
const left = useCountdown(computed(() => phase.value?.deadline), () => socket.now(), paused);
const open = computed(() => opensIn.value <= 0 && left.value > 0);
const count = ref(view.value?.personal.kind === 'tap' ? view.value.personal.count : 0);
let sent = count.value;

// a message per tap would flood the room at 10 taps a second, so the total goes out on a timer
const ticker = setInterval(() => {
  if (count.value !== sent) {
    sent = count.value;
    // the running total goes out several times a second; a buzz each time would feel like a jammed phone
    answer(sent, false);
  }
}, 250);
onBeforeUnmount(() => clearInterval(ticker));

function tap(): void {
  if (!open.value) return;
  count.value++;
  if (count.value % 10 === 0) event('hit');
}
</script>

<template>
  <div v-if="phase" class="tap">
    <div class="status display">
      <template v-if="opensIn > 0">Приготовьтесь… {{ opensIn }}</template>
      <template v-else-if="left > 0">Жмите! {{ left }} с</template>
      <template v-else>Стоп!</template>
    </div>
    <button class="pad display" :class="{ open }" @pointerdown.prevent="tap">
      <span class="count">{{ count }}</span>
      <small>{{ open ? 'жми-жми-жми' : 'ждём старта' }}</small>
    </button>
  </div>
</template>

<style scoped>
.tap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  background: var(--yellow);
}

.pad:active.open {
  translate: 0 4px;
  box-shadow: 0 2px 0 var(--ink);
}

.count {
  font-size: 96px;
  font-weight: 900;
}

.pad small {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 800;
}
</style>
