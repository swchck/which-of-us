<script setup lang="ts">
import { computed } from 'vue';
import { answer, playerById, view } from '../store';
import Waiting from './Waiting.vue';

const COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--green)'];

const phase = computed(() => (view.value?.phase.kind === 'sync' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'sync' ? view.value.personal : null));
const partners = computed(() =>
  (personal.value?.partners ?? [])
    .map((id) => playerById(id)?.name)
    .filter(Boolean)
    .join(' и '),
);
</script>

<template>
  <div v-if="phase" class="sync">
    <Waiting v-if="!personal" title="Пары уже собраны" note="В следующей игре вы тоже будете в деле" icon="🤝" />
    <template v-else-if="personal.answer === undefined">
      <div class="role display">Ваша пара: {{ partners }}</div>
      <div class="question sticker">{{ phase.question }}</div>
      <div class="options">
        <button
          v-for="(o, i) in phase.options"
          :key="i"
          class="btn option deal"
          :style="{ background: COLORS[i % COLORS.length], '--i': i }"
          @click="answer(i)"
        >
          {{ o }}
        </button>
      </div>
    </template>
    <Waiting v-else title="Выбор сделан!" :note="`Вы выбрали: ${phase.options[personal.answer]}. Совпадёт ли с парой?`" icon="🤝" />
  </div>
</template>

<style scoped>
.sync {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.role {
  align-self: center;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: 999px;
  border: 3px solid var(--ink);
  background: var(--cyan);
  color: var(--ink);
}

.question {
  padding: 18px;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option {
  min-height: 66px;
  font-size: 19px;
  text-align: center;
  line-height: 1.2;
}
</style>
