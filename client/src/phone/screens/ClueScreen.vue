<script setup lang="ts">
import { computed } from 'vue';
import { answer, playerById, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'clueGuess' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'clueGuess' ? view.value.personal : null));
const author = computed(() => playerById(phase.value?.author));
</script>

<template>
  <div v-if="phase && personal" class="clue">
    <Waiting v-if="personal.mine" title="Это ваша подсказка" note="Держите лицо — остальные гадают" icon="🧩" />
    <template v-else-if="personal.answer === undefined">
      <div class="note sticker">
        <span class="label">Подсказка от игрока {{ author?.name ?? '' }}</span>
        <span class="text hand">{{ phase.clue }}</span>
      </div>
      <div class="grid">
        <button v-for="(o, i) in phase.options" :key="o" class="btn deal option" :style="{ '--i': i }" @click="answer(o)">{{ o }}</button>
      </div>
    </template>
    <Waiting v-else :title="`Ваш выбор: ${personal.answer}`" note="Смотрите на экран — сейчас узнаем слово" icon="🧩" />
  </div>
</template>

<style scoped>
.clue {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.note {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  background: #fff8d6;
}

.label {
  font-size: 13px;
  font-weight: 900;
  color: var(--muted);
}

.text {
  font-size: 28px;
  line-height: 1.2;
  color: var(--ink);
}

.grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.option {
  min-height: 96px;
  font-size: 22px;
  overflow-wrap: break-word;
}
</style>
