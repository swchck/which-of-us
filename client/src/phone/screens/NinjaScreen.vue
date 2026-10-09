<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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

function cut(id: number): void {
  const fruit = phase.value?.fruits.find((f) => f.id === id);
  if (!fruit || sliced.value.has(id) || opensIn.value > 0 || left.value <= 0) return;
  sliced.value = new Set([...sliced.value, id]);
  answer(id, false);
  if (fruit.kind === NINJA_BOMB) {
    score.value = Math.max(0, score.value - NINJA_BOMB_POINTS);
    boom.value++;
    event('lose');
  } else {
    score.value += NINJA_FRUIT_POINTS;
    event('tick');
  }
}

function swipe(ev: PointerEvent): void {
  if (ev.pointerType === 'mouse' && ev.buttons === 0) return;
  const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>('[data-fruit]');
  if (el) cut(Number(el.dataset.fruit));
}

function measure(el: unknown): void {
  if (el instanceof HTMLElement && !height.value) height.value = el.clientHeight;
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
      :ref="measure"
      class="lane"
      :style="{ '--h': `${height}px` }"
      @pointerdown.prevent="swipe"
      @pointermove="swipe"
    >
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

.flash {
  position: absolute;
  inset: 0;
  background: #a3122f;
  pointer-events: none;
  animation: flash 400ms both;
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
