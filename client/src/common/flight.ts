import { computed, onBeforeUnmount, ref, type Ref } from 'vue';

/** How far ahead of its start an item is mounted, so it is in the DOM before its animation begins. */
const LEAD_MS = 600;
const TICK_MS = 250;

/**
 * Items whose CSS flight is under way or about to start, each with the animation delay that lines
 * it up with the server clock. Only these are in the DOM: a round's whole schedule is hundreds of
 * elements across the lanes, and every one would be a running animation on the TV.
 * `start` and `duration` are server-clock ms; `ids` must be unique. While `paused`, the list holds
 * still and the caller freezes the running animations (the `frozen` class): the server moves the
 * schedule by the length of the pause, so frozen flights resume exactly in step.
 */
export function useInFlight<T extends { id: number }>(
  items: Ref<T[]>,
  start: (item: T) => number,
  duration: (item: T) => number,
  now: () => number,
  paused?: Ref<boolean>,
) {
  const tick = ref(now());
  const timer = setInterval(() => {
    if (!paused?.value) tick.value = now();
  }, TICK_MS);
  onBeforeUnmount(() => clearInterval(timer));
  // the delay is fixed when an item mounts; recomputing it on every tick would jerk the running animation
  const mounted = new Map<number, T & { delay: number }>();
  let last: (T & { delay: number })[] = [];
  return computed(() => {
    const t = tick.value;
    const next = items.value
      .filter((item) => t > start(item) - LEAD_MS && t < start(item) + duration(item) + TICK_MS)
      .map((item) => {
        let m = mounted.get(item.id);
        if (!m) {
          m = { ...item, delay: start(item) - now() };
          mounted.set(item.id, m);
        }
        return m;
      });
    // the same flights as last tick: hand back the old array so the lanes skip a re-render
    if (next.length === last.length && next.every((m, i) => m === last[i])) return last;
    last = next;
    return next;
  });
}
