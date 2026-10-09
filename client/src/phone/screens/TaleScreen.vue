<script setup lang="ts">
import { computed } from 'vue';
import InkView from '../../common/InkView.vue';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'taleVote' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'taleVote' ? view.value.personal : null));
const picked = computed(() => phase.value?.items.findIndex((c) => c.id === personal.value?.answer) ?? -1);
</script>

<template>
  <div v-if="phase && personal && view" class="tale">
    <Waiting v-if="personal.teller" title="Это ваша подсказка" note="Посмотрим, найдут ли ваш рисунок" icon="📖" />
    <Waiting v-else-if="picked >= 0" title="Голос принят" :note="`Рисунок №${picked + 1}`" icon="📖" />
    <template v-else>
      <p class="clue display">«{{ phase.clue }}»</p>
      <p class="tip">Какой рисунок у рассказчика? Свой выбрать нельзя</p>
      <div class="grid">
        <button v-for="(c, i) in phase.items" :key="c.id" class="card" :disabled="c.id === personal.mine" @click="answer(c.id)">
          <InkView :code="view.code" :board="c.board" :ink="c.ink" />
          <span class="num display">{{ c.id === personal.mine ? 'ваш' : i + 1 }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tale {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clue {
  margin: 0;
  text-align: center;
  font-size: 24px;
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.card {
  position: relative;
  padding: 0;
  overflow: hidden;
  border-radius: 16px;
  border: 4px solid var(--ink);
  background: var(--paper);
  box-shadow: 0 4px 0 var(--ink);
}

.card:disabled {
  opacity: 0.4;
}

.num {
  position: absolute;
  top: 4px;
  left: 8px;
  font-size: 20px;
  color: var(--ink);
}
</style>
