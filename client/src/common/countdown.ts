import { computed, onBeforeUnmount, ref, type Ref } from 'vue';

/** Seconds left until `deadline` (server clock), ticking a few times a second. */
export function useCountdown(deadline: Ref<number | undefined>, now: () => number, paused?: Ref<boolean>) {
  const tick = ref(now());
  const timer = setInterval(() => {
    if (!paused?.value) tick.value = now();
  }, 200);
  onBeforeUnmount(() => clearInterval(timer));
  return computed(() => {
    if (deadline.value === undefined) return 0;
    return Math.max(0, Math.ceil((deadline.value - tick.value) / 1000));
  });
}
