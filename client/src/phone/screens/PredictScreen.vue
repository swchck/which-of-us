<script setup lang="ts">
import { computed } from 'vue';
import { answer, playerById, view } from '../store';
import JokerButton from '../parts/JokerButton.vue';
import Waiting from './Waiting.vue';

const COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--green)'];

const phase = computed(() => (view.value?.phase.kind === 'predict' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'predict' ? view.value.personal : null));
const target = computed(() => playerById(phase.value?.target));
</script>

<template>
  <div v-if="phase && personal" class="predict">
    <Waiting
      v-if="phase.lie && personal.role === 'target'"
      title="Ищут вашу ложь"
      note="Держите лицо — не выдайте себя!"
      icon="🤥"
    />
    <template v-else-if="personal.answer === undefined">
      <div class="role display" :class="personal.role">
        {{
          phase.lie
            ? `Где ложь у ${target?.name}?`
            : personal.role === 'target'
              ? 'Вопрос про вас! Отвечайте честно'
              : `Что ответит ${target?.name}?`
        }}
      </div>
      <div class="question sticker">{{ phase.question }}</div>
      <JokerButton />
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
    <Waiting
      v-else
      :title="personal.role === 'target' ? 'Записано!' : 'Ставка сделана!'"
      :note="`Ваш ответ: ${phase.options[personal.answer]}`"
    />
  </div>
</template>

<style scoped>
.predict {
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

.role.target {
  background: var(--pink);
  color: #fff;
  animation: wobble 1.2s ease-in-out infinite;
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
