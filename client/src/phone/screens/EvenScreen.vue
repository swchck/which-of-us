<script setup lang="ts">
import { computed } from 'vue';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'even' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'even' ? view.value.personal : null));
</script>

<template>
  <div v-if="phase && personal" class="even">
    <template v-if="personal.answer === undefined">
      <div class="statement sticker">{{ phase.question }}</div>
      <button class="btn cyan big deal" style="--i: 0" @click="answer(0)">{{ phase.options[0] }}</button>
      <button class="btn pink big deal" style="--i: 1" @click="answer(1)">{{ phase.options[1] }}</button>
    </template>
    <Waiting v-else :title="`Ваш выбор: ${phase.options[personal.answer]}`" note="Очки получит меньшинство" icon="⚖️" />
  </div>
</template>

<style scoped>
.even {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.statement {
  padding: 18px;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
}

.big {
  min-height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 26px;
}
</style>
