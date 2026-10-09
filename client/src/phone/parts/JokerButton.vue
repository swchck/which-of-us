<script setup lang="ts">
import { computed } from 'vue';
import { me, send, view } from '../store';
import { event } from '../haptics';

/** Shown on questions that take a joker; one tap spends it, there is no taking it back. */
const played = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'vote' || p?.kind === 'predict' ? p.joker : undefined;
});
const left = computed(() => me.value?.jokers ?? 0);

function play(): void {
  const v = view.value;
  if (!v || played.value !== false || left.value <= 0) return;
  send({ t: 'joker', phaseId: v.phaseId });
  event('hit');
  // the server's answer comes with the next update; show the joker on the table right away
  if (v.personal.kind === 'vote' || v.personal.kind === 'predict') view.value = { ...v, personal: { ...v.personal, joker: true } };
}
</script>

<template>
  <button v-if="played !== undefined && (played || left > 0)" class="joker" :class="{ on: played }" :disabled="played" @click="play">
    <span class="card">🃏</span>
    <span v-if="played" class="text"><b>Джокер ×2 стоит</b><small>очки за этот ответ удвоятся</small></span>
    <span v-else class="text"><b>Поставить джокер ×2</b><small>если уверены, что ответят как вы · осталось {{ left }}</small></span>
  </button>
</template>

<style scoped>
.joker {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border: 3px dashed var(--ink);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  color: var(--ink);
  font: inherit;
  text-align: left;
}

.joker.on {
  border-style: solid;
  background: var(--yellow);
  animation: pop-in 300ms both;
}

.card {
  font-size: 30px;
}

.text {
  display: flex;
  flex-direction: column;
}

.text b {
  font-size: 17px;
}

.text small {
  font-size: 13px;
  font-weight: 700;
}
</style>
