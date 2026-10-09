<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { view } from '../store';

withDefaults(defineProps<{ title?: string; note?: string; icon?: string }>(), {
  title: 'Готово!',
  note: 'Ждём остальных — смотрите на экран',
  icon: '✔',
});

/** Who is done in the current phase, when the phase keeps such a list; the wait feels shorter when you see it fill up. */
const progress = computed(() => {
  const v = view.value;
  if (!v) return null;
  const p = v.phase;
  if (p.kind === 'treasure' && p.stage === 'card') return null;
  const done = 'answered' in p ? p.answered : 'done' in p ? p.done : 'voted' in p ? p.voted : null;
  if (!done) return null;
  // only the people who still owe an answer: the clue's author and anyone out of the cave do not
  const players = v.players.filter(
    (pl) => pl.connected && !(p.kind === 'clueGuess' && pl.id === p.author) && !(p.kind === 'treasure' && !p.inside.includes(pl.id)) &&
      !(p.kind === 'rps' && !p.matches.some((m) => m.b !== null && (m.a === pl.id || m.b === pl.id))) &&
      !('alive' in p && !p.alive.includes(pl.id)),
  );
  return { players, done: new Set(done), left: players.filter((pl) => !done.includes(pl.id)).length };
});
</script>

<template>
  <div class="waiting">
    <div class="badge display pop-in"><span class="ring"></span><Emoji :char="icon" animated /></div>
    <div class="title display">{{ title }}</div>
    <p>{{ note }}</p>
    <slot />
    <div v-if="progress && progress.left > 0" class="progress">
      <div class="faces">
        <Avatar
          v-for="pl in progress.players"
          :key="pl.id"
          :class="{ pending: !progress.done.has(pl.id) }"
          :player="pl"
          :code="view!.code"
          :size="34"
          :ring="2"
        />
      </div>
      <span class="left">Ждём ещё {{ progress.left }}…</span>
    </div>
  </div>
</template>

<style scoped>
.progress {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.faces {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.faces .pending {
  filter: grayscale(1);
  opacity: 0.45;
}

.faces > * {
  transition:
    filter 300ms,
    opacity 300ms;
}

.left {
  font-size: 14px;
  font-weight: 800;
  color: var(--muted);
}

.waiting {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 20px 0;
}

.badge {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 56px;
  background: var(--green);
  color: var(--ink);
  border: var(--line) solid var(--ink);
  /* straight down: the usual diagonal sticker shadow knocks a circle visibly off its ripple ring */
  box-shadow: 0 6px 0 var(--ink);
}

.ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 4px solid var(--green);
  animation: ripple 1.8s ease-out 0.4s infinite;
}

@keyframes ripple {
  from {
    scale: 1;
    opacity: 0.9;
  }
  to {
    scale: 1.7;
    opacity: 0;
  }
}

.title {
  animation: rise 400ms ease-out 150ms both;
}

p {
  animation: rise 400ms ease-out 250ms both;
}

@keyframes rise {
  from {
    opacity: 0;
    translate: 0 12px;
  }
}

.title {
  font-size: 28px;
  font-weight: 800;
}

p {
  margin: 0;
  color: var(--muted);
  font-weight: 700;
  font-size: 17px;
}
</style>
