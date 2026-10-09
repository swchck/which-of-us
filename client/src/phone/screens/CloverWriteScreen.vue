<script setup lang="ts">
import { computed, ref } from 'vue';
import { clueProblem } from '../../../../shared/catalog';
import { CLUE_MAX } from '../../../../shared/protocol';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const personal = computed(() => (view.value?.personal.kind === 'write' ? view.value.personal : null));
const words = computed(() => personal.value?.clover ?? []);
const clues = ref(['', '', '', '']);
const pairs = computed(() => words.value.map((w, k) => [w, words.value[(k + 1) % words.value.length]!] as const));
const problems = computed(() =>
  clues.value.map((c, k) => {
    const clue = c.trim();
    if (!clue) return null;
    if (/\s/.test(clue)) return 'Только одно слово';
    const pair = pairs.value[k];
    return pair ? (clueProblem(pair[0], clue) ?? clueProblem(pair[1], clue)) : null;
  }),
);
const ready = computed(() => clues.value.every((c, k) => c.trim() && !problems.value[k]));

function submit(): void {
  if (ready.value) answer(clues.value.map((c) => c.trim()));
}
</script>

<template>
  <div v-if="personal" class="clover">
    <Waiting v-if="personal.done" title="Клевер готов" note="Скоро его разложат остальные" icon="🍀" />
    <form v-else class="form" @submit.prevent="submit">
      <p class="tip">Одно слово, которое связывает оба слова пары</p>
      <label v-for="([a, b], k) in pairs" :key="k" class="pair sticker">
        <span class="words display">{{ a }} + {{ b }}</span>
        <input v-model="clues[k]" :maxlength="CLUE_MAX" autocomplete="off" autocapitalize="off" placeholder="Слово-связка" :enterkeyhint="k < 3 ? 'next' : 'send'" />
        <span v-if="problems[k]" class="problem">{{ problems[k] }}</span>
      </label>
      <button class="btn green" :disabled="!ready">Готово</button>
    </form>
  </div>
</template>

<style scoped>
.clover {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.pair {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px;
}

.words {
  font-size: 20px;
}

.pair input {
  padding: 10px 12px;
  border: var(--line) solid var(--ink);
  border-radius: 12px;
  font: inherit;
  font-size: 20px;
  font-weight: 800;
}

.problem {
  font-size: 14px;
  font-weight: 800;
  color: var(--red);
}
</style>
