<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import type { PublicPlayer } from '../../../../shared/protocol';
import Avatar from '../../common/Avatar.vue';
import { computed } from 'vue';
import { useCountdown } from '../../common/countdown';
import { socket, view } from '../store';

const props = withDefaults(
  defineProps<{
    code: string;
    players: PublicPlayer[];
    /** Ids of players who have answered: they get a tick and hop up. */
    done?: string[];
    size?: number;
    highlight?: string;
  }>(),
  { done: () => [], size: 110, highlight: '' },
);

/** Seconds left at which the stragglers start to fidget, so the room knows whom to hurry. */
const HURRY_AT = 5;

const deadline = computed(() => {
  const p = view.value?.phase;
  return p && 'deadline' in p ? p.deadline : undefined;
});
const left = useCountdown(deadline, () => socket.now(), computed(() => view.value?.paused ?? false));
const hurry = computed(() => deadline.value !== undefined && props.done.length > 0 && left.value <= HURRY_AT);
</script>

<template>
  <div class="row">
    <div
      v-for="(p, i) in players"
      :key="p.id"
      class="slot"
      :class="{ done: done.includes(p.id), hl: highlight === p.id, late: hurry && !done.includes(p.id) }"
      :style="{ '--i': i }"
    >
      <Avatar :player="p" :code="code" :size="size" />
      <div class="name" :style="{ '--len': p.name.length }">{{ p.name }}</div>
      <div v-if="done.includes(p.id)" class="tick pop-in"><Icon name="check" /></div>
      <div v-if="done.length > 1 && done[0] === p.id" class="first hand">Шустрик!</div>
    </div>
  </div>
</template>

<style scoped>
.first {
  position: absolute;
  top: -14px;
  left: -18px;
  padding: 2px 10px;
  border-radius: 10px;
  border: 3px solid var(--ink);
  background: var(--yellow);
  color: var(--ink);
  font-size: 20px;
  font-weight: 700;
  rotate: -10deg;
  animation: pop-in 400ms cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

@keyframes fidget {
  25% {
    rotate: -6deg;
  }
  75% {
    rotate: 6deg;
  }
}

.row {
  display: flex;
  justify-content: center;
  gap: 34px;
  flex-wrap: wrap;
}

.slot {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  transition:
    transform 300ms cubic-bezier(0.3, 1.5, 0.5, 1),
    opacity 300ms;
  opacity: 0.75;
}

.slot {
  animation: slot-in 450ms cubic-bezier(0.2, 1.4, 0.4, 1) calc(var(--i) * 70ms) both;
}

/* waiting players sway out of step with each other, so the row looks like it is thinking */
.slot:not(.done) > :first-child {
  animation: bob 2.4s ease-in-out calc(var(--i) * -0.37s) infinite;
}

.slot.done > :first-child {
  animation: hop 500ms cubic-bezier(0.3, 1.6, 0.5, 1);
}

@keyframes slot-in {
  from {
    opacity: 0;
    translate: 0 60px;
  }
}

@keyframes bob {
  0%,
  100% {
    translate: 0 0;
    rotate: -2deg;
  }
  50% {
    translate: 0 -6px;
    rotate: 2deg;
  }
}

@keyframes hop {
  40% {
    translate: 0 -24px;
    scale: 1.08;
  }
}

.slot.done {
  transform: translateY(-14px);
  opacity: 1;
}

.slot.hl {
  opacity: 1;
  transform: scale(1.12);
}

.name {
  font-weight: 900;
  font-size: clamp(15px, calc(190px / var(--len)), 24px);
  padding: 2px 14px;
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--ink);
  border-radius: 12px;
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tick {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 900;
  background: var(--green);
  color: var(--ink);
  border: 4px solid var(--ink);
}

/* after the idle bob above, which it must override */
.slot.late > :first-child {
  animation: fidget 0.35s ease-in-out infinite;
}
</style>
