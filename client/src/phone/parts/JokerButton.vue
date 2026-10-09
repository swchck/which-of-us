<script setup lang="ts">
import { computed } from 'vue';
import { me, send, view } from '../store';
import { event } from '../haptics';

/** Shown on questions that take a joker; a played one can be taken back until the answers lock. */
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'vote' || p?.kind === 'predict' ? p : undefined;
});
const played = computed(() => personal.value?.joker);
const fixed = computed(() => !!personal.value?.jokerFixed);
const answered = computed(() => personal.value?.answer !== undefined);
const left = computed(() => me.value?.jokers ?? 0);
// the server only takes a new joker before this phone's own answer
const shown = computed(() => played.value === true || (played.value === false && !answered.value && left.value > 0));

function toggle(): void {
  const v = view.value;
  if (!v || played.value === undefined || fixed.value) return;
  if (!played.value && (answered.value || left.value <= 0)) return;
  send({ t: 'joker', phaseId: v.phaseId, off: played.value || undefined });
  if (!played.value) event('hit');
  // the server's answer comes with the next update; move the joker on the table right away
  if (v.personal.kind === 'vote' || v.personal.kind === 'predict') view.value = { ...v, personal: { ...v.personal, joker: !played.value } };
}
</script>

<template>
  <button v-if="shown" class="joker" :class="{ on: played }" :disabled="fixed" @click="toggle">
    <span class="card">🃏</span>
    <span v-if="played" class="text">
      <b>Джокер ×2 стоит</b>
      <small v-if="fixed">очки за этот ответ удвоятся</small>
      <small v-else>передумали? Нажмите, пока ответили не все</small>
    </span>
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
