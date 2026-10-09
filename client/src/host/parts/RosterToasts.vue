<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import Avatar from '../../common/Avatar.vue';
import type { PublicPlayer } from '../../../../shared/protocol';
import { view } from '../store';

interface Toast {
  key: number;
  player: PublicPlayer;
  back: boolean;
}

const TOAST_MS = 4500;
const toasts = ref<Toast[]>([]);
const timers = new Set<ReturnType<typeof setTimeout>>();
let seq = 0;

// the lobby shows its own roster, so only mid-game drops and returns are worth a toast
watch(
  () => (view.value?.phase.kind === 'lobby' ? null : view.value?.players.filter((p) => !p.bot)),
  (now, before) => {
    if (!now || !before) return;
    for (const p of now) {
      const was = before.find((b) => b.id === p.id);
      if (!was || was.connected === p.connected) continue;
      const toast = { key: ++seq, player: p, back: p.connected };
      toasts.value = [...toasts.value.filter((t) => t.player.id !== p.id), toast];
      const timer = setTimeout(() => {
        timers.delete(timer);
        // the array holds reactive proxies, so compare by key, never by object identity
        toasts.value = toasts.value.filter((t) => t.key !== toast.key);
      }, TOAST_MS);
      timers.add(timer);
    }
  },
);

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<template>
  <TransitionGroup v-if="view" tag="div" name="toast" class="toasts">
    <div v-for="t in toasts" :key="t.key" class="toast" :class="{ back: t.back }">
      <Avatar :player="t.player" :code="view.code" :size="44" :ring="3" />
      <span>{{ t.player.name }} {{ t.back ? 'снова с нами' : 'отключается — ждём' }}</span>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.toasts {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 15;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 18px 8px 8px;
  border-radius: 999px;
  border: 3px solid var(--ink);
  background: #ffe9e9;
  color: var(--ink);
  font-size: 22px;
  font-weight: 800;
}

.toast.back {
  background: #dcffe4;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    transform 250ms ease,
    opacity 250ms ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}
</style>
