<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed, watch } from 'vue';
import { answer, view } from '../store';
import { event } from '../haptics';

const phase = computed(() => (view.value?.phase.kind === 'reflex' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'reflex' ? view.value.personal : null));
const tapped = computed(() => personal.value?.ms !== undefined || personal.value?.early);
let shownAt = 0;
let tappedIn = -1;

// the phone times the reaction itself from the moment green appears, so Wi-Fi lag costs nobody
watch(
  () => phase.value?.stage === 'go' && view.value?.phaseId,
  (go) => {
    if (!go) return;
    shownAt = performance.now();
    event('hit');
  },
  { immediate: true, flush: 'post' },
);

function tap(): void {
  const p = phase.value;
  // the server's word on this tap is a round trip away; a second finger in the meantime is the same tap
  if (!p || !view.value || tapped.value || tappedIn === view.value.phaseId) return;
  tappedIn = view.value.phaseId;
  if (p.stage !== 'go') answer('early');
  else answer(Math.round(performance.now() - shownAt));
}
</script>

<template>
  <div v-if="phase && personal" class="reflex">
    <div class="round">Раунд {{ phase.round }} из {{ phase.rounds }}</div>
    <button
      class="pad display"
      :class="[phase.stage, { early: personal.early, done: personal.ms !== undefined }]"
      @pointerdown.prevent="tap"
    >
      <template v-if="personal.early">Фальстарт! <Emoji char="🙈" /></template>
      <template v-else-if="personal.ms !== undefined">{{ personal.ms }} мс</template>
      <template v-else-if="phase.stage === 'wait'">Ждите…</template>
      <template v-else-if="phase.stage === 'decoy'">Не жми!</template>
      <template v-else>ЖМИ!</template>
    </button>
    <p class="hint">Жмите, когда кнопка станет зелёной. Синяя — ловушка!</p>
  </div>
</template>

<style scoped>
.reflex {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
}

.round {
  font-weight: 900;
  color: var(--muted);
}

.pad {
  flex: 1;
  width: 100%;
  min-height: 320px;
  border-radius: 32px;
  border: 6px solid var(--ink);
  box-shadow: 0 8px 0 var(--ink);
  background: #ff3b5c;
  color: #fff;
  font-size: 44px;
  font-weight: 900;
  text-shadow: 0 4px 0 var(--ink);
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.pad.go {
  background: var(--green);
}

.pad.decoy {
  background: #3b8bff;
}

.pad.early {
  background: #7a6a9e;
}

.pad.done {
  background: var(--yellow);
  color: var(--ink);
  text-shadow: none;
}

.hint {
  margin: 0;
  text-align: center;
  font-weight: 700;
  color: var(--muted);
}
</style>
