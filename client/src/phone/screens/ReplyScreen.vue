<script setup lang="ts">
import { computed } from 'vue';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'replyPick' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'replyPick' ? view.value.personal : null));
</script>

<template>
  <div v-if="phase && personal" class="reply">
    <Waiting v-if="personal.answer !== undefined" title="Карта сыграна" :note="personal.hand[personal.answer]" icon="💬" />
    <template v-else>
      <div class="situation sticker">{{ phase.situation }}</div>
      <button v-for="(card, i) in personal.hand" :key="card" class="card deal" :style="{ '--i': i }" @click="answer(i)">{{ card }}</button>
    </template>
  </div>
</template>

<style scoped>
.reply {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.situation {
  padding: 16px;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
}

.card {
  padding: 14px 16px;
  border: var(--line) solid var(--ink);
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--shadow);
  font: inherit;
  font-size: 18px;
  font-weight: 800;
  text-align: left;
  color: var(--ink);
}
</style>
