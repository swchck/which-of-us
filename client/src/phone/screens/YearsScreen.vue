<script setup lang="ts">
import { computed } from 'vue';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'years' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'years' ? view.value.personal : null));

function slotName(i: number): string {
  const t = phase.value?.timeline ?? [];
  if (i === 0) return `Раньше, чем ${t[0]?.year}`;
  if (i === t.length) return `Позже, чем ${t[t.length - 1]?.year}`;
  return `Между ${t[i - 1]?.year} и ${t[i]?.year}`;
}
</script>

<template>
  <div v-if="phase && personal" class="years">
    <div class="event sticker">
      <span class="label">Когда это было?</span>
      <b class="display">{{ phase.event }}</b>
    </div>
    <Waiting v-if="personal.answer !== undefined" title="Место выбрано" :note="slotName(personal.answer)" icon="⏱" />
    <div v-else class="line">
      <template v-for="(card, i) in phase.timeline" :key="card.e">
        <button class="slot deal" :style="{ '--i': i }" @click="answer(i)">Сюда</button>
        <div class="card">
          <b class="display">{{ card.year }}</b>
          <span>{{ card.e }}</span>
        </div>
      </template>
      <button class="slot deal" :style="{ '--i': phase.timeline.length }" @click="answer(phase.timeline.length)">Сюда</button>
    </div>
  </div>
</template>

<style scoped>
.years {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: var(--yellow);
}

.label {
  font-size: 13px;
  font-weight: 900;
  color: #7a5fc0;
  text-transform: uppercase;
}

.event b {
  font-size: 22px;
  line-height: 1.2;
}

.line {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slot {
  min-height: 44px;
  border-radius: 14px;
  border: 3px dashed var(--ink);
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink);
  font: inherit;
  font-weight: 900;
}

.card {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-weight: 800;
}

.card b {
  font-size: 20px;
  flex: none;
}
</style>
