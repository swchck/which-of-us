<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { audio } from '../../common/audio';
import { useCountdown } from '../../common/countdown';
import { socket, view } from '../store';

const props = withDefaults(defineProps<{ deadline: number; size?: number }>(), { size: 150 });

const left = useCountdown(
  computed(() => props.deadline),
  () => socket.now(),
  computed(() => view.value?.paused ?? false),
);
const remaining = () => Math.max(1, Math.ceil((props.deadline - socket.now()) / 1000));
const total = ref(remaining());
// a resume moves the deadline by the paused time, which must not refill the ring
watch(
  () => props.deadline,
  () => (total.value = Math.max(total.value, remaining())),
);
watch(left, (s, prev) => {
  if (s < prev && s > 0 && s <= 5) audio.sfx('tick');
});

const R = 62;
const C = 2 * Math.PI * R;
const dash = computed(() => C * (left.value / total.value));
</script>

<template>
  <div class="timer" :class="{ hurry: left <= 5 }" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="-80 -80 160 160">
      <circle r="72" fill="#fffaf0" stroke="#1b1033" stroke-width="8" />
      <circle
        r="62"
        fill="none"
        :stroke="left <= 5 ? '#ff3b5c' : '#ffd23f'"
        stroke-width="18"
        :stroke-dasharray="`${dash} ${C}`"
        transform="rotate(-90)"
        class="arc"
      />
    </svg>
    <span :key="left <= 5 ? left : -1" class="num display">{{ left }}</span>
    <!-- the stage is scaled into the window, so a glow on it leaves the margins and the bottom band bare -->
    <Teleport to=".viewport">
      <div v-if="left <= 5 && !view?.paused" class="tension"></div>
    </Teleport>
  </div>
</template>

<style scoped>
.tension {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(255, 40, 70, 0.4) 100%);
  animation: tension 1s ease-in-out infinite;
}

@keyframes tension {
  50% {
    opacity: 0.35;
  }
}

.timer {
  position: relative;
  display: grid;
  place-items: center;
}

svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.arc {
  transition: stroke-dasharray 250ms linear;
}

.num {
  position: relative;
  color: var(--ink);
  font-size: 54px;
  font-weight: 900;
}

.hurry {
  animation:
    wobble 0.5s ease-in-out infinite,
    throb 1s ease-out infinite;
}

.hurry .num {
  animation: tick-pop 1s ease-out;
}

@keyframes throb {
  0% {
    scale: 1.12;
  }
  60% {
    scale: 1;
  }
}

@keyframes tick-pop {
  0% {
    scale: 1.6;
    color: var(--red);
  }
  40% {
    scale: 1;
  }
}
</style>
