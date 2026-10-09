<script setup lang="ts">
import { computed } from 'vue';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'fibVote' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'fibVote' ? view.value.personal : null));
const picked = computed(() => phase.value?.options.find((o) => o.id === personal.value?.answer));
</script>

<template>
  <div v-if="phase && personal" class="fib">
    <Waiting v-if="picked" title="Голос принят" :note="picked.text" icon="📖" />
    <template v-else>
      <p class="tip">{{ phase.ask ?? `Что на самом деле значит «${phase.word}»?` }}</p>
      <button
        v-for="(o, i) in phase.options"
        :key="o.id"
        class="option deal"
        :disabled="o.id === personal.mine"
        :style="{ '--i': i }"
        @click="answer(o.id)"
      >
        {{ o.text }}
        <small v-if="o.id === personal.mine">{{ phase.title ? 'ваша' : 'ваша выдумка' }}</small>
      </button>
    </template>
  </div>
</template>

<style scoped>
.fib {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip {
  margin: 0;
  font-weight: 800;
}

.option {
  padding: 14px 16px;
  border: var(--line) solid var(--ink);
  border-radius: 16px;
  background: var(--paper);
  box-shadow: var(--shadow);
  font: inherit;
  font-weight: 800;
  text-align: left;
  color: var(--ink);
}

.option:disabled {
  opacity: 0.5;
}

small {
  display: block;
  font-weight: 600;
}
</style>
