<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(defineProps<{ value: number; ms?: number; delay?: number; from?: number }>(), {
  ms: 900,
  delay: 0,
  from: undefined,
});

const shown = ref(props.from ?? props.value);
let raf = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function run(from: number, to: number): void {
  cancelAnimationFrame(raf);
  clearTimeout(timer);
  if (reduced || from === to) {
    shown.value = to;
    return;
  }
  timer = setTimeout(() => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / props.ms);
      const eased = 1 - (1 - t) ** 3;
      shown.value = Math.round(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }, props.delay * 1000);
}

if (props.from !== undefined) run(props.from, props.value);
watch(
  () => props.value,
  (to) => run(shown.value, to),
);
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  clearTimeout(timer);
});
</script>

<template>
  <span>{{ shown }}</span>
</template>
