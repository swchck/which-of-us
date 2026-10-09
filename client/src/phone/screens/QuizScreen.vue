<script setup lang="ts">
import { computed } from 'vue';
import { QUIZ_LIVES } from '../../../../shared/protocol';
import { answer, state, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'quiz' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'quiz' ? view.value.personal : null));
const lives = computed(() => phase.value?.lives[state.you] ?? 0);
const COLORS = ['var(--pink)', 'var(--cyan)', 'var(--yellow)', 'var(--green)'];
</script>

<template>
  <div v-if="phase && personal" class="quiz">
    <div class="lives" :aria-label="`Жизней: ${lives}`">
      <span v-for="i in QUIZ_LIVES" :key="i" class="heart" :class="{ lost: i > lives }">❤</span>
    </div>
    <Waiting v-if="!personal.alive" title="Вы выбыли" note="Болейте за остальных" icon="🙈" />
    <Waiting v-else-if="personal.answer !== undefined" title="Ответ принят" :note="phase.options[personal.answer]" icon="⏱" />
    <template v-else>
      <p class="q">{{ phase.q }}</p>
      <div class="grid">
        <button v-for="(o, i) in phase.options" :key="i" class="option deal" :style="{ '--c': COLORS[i], '--i': i }" @click="answer(i)">{{ o }}</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.quiz {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lives {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 30px;
}

.heart {
  color: var(--red);
}

.heart.lost {
  opacity: 0.2;
  filter: grayscale(1);
}

.q {
  margin: 0;
  text-align: center;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.25;
}

.grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.option {
  min-height: 96px;
  padding: 10px;
  border-radius: 20px;
  border: 4px solid var(--ink);
  background: var(--c);
  color: var(--ink);
  box-shadow: 0 5px 0 var(--ink);
  font: inherit;
  font-size: 19px;
  font-weight: 900;
  overflow-wrap: anywhere;
}
</style>
