<script setup lang="ts">
import { computed } from 'vue';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)'];

const phase = computed(() => (view.value?.phase.kind === 'quipVote' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'quipVote' ? view.value.personal : null));
const chosen = computed(() => phase.value?.answers.find((a) => a.id === personal.value?.answer));
</script>

<template>
  <div v-if="phase && personal" class="quip">
    <Waiting v-if="personal.mine" title="Это ваша битва!" note="Сохраняйте невозмутимость — не выдайте, какой ответ ваш" icon="🥊" />
    <template v-else-if="!chosen">
      <div class="prompt sticker">{{ phase.prompt }}</div>
      <p class="tip">Какой ответ смешнее?</p>
      <button
        v-for="(a, i) in phase.answers"
        :key="a.id"
        class="btn option deal"
        :style="{ background: COLORS[i % COLORS.length], '--i': i }"
        @click="answer(a.id)"
      >
        {{ a.text }}
      </button>
    </template>
    <Waiting v-else title="Голос принят!" :note="`Вы выбрали: «${chosen.text}»`" icon="🥊" />
  </div>
</template>

<style scoped>
.quip {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt {
  padding: 16px;
  font-size: 21px;
  font-weight: 800;
  line-height: 1.25;
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.option {
  min-height: 80px;
  font-family: var(--font-hand);
  font-size: 21px;
  line-height: 1.2;
  text-align: center;
}
</style>
