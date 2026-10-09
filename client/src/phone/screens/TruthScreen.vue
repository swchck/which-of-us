<script setup lang="ts">
import { computed } from 'vue';
import Emoji from '../../common/Emoji.vue';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'truth' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'truth' ? view.value.personal : null));
</script>

<template>
  <div v-if="phase && personal" class="truth">
    <template v-if="personal.answer === undefined">
      <div class="statement sticker">{{ phase.statement }}</div>
      <button class="btn green big deal" style="--i: 0" @click="answer(1)"><Emoji char="✅" :size="34" /> Верю</button>
      <button class="btn pink big deal" style="--i: 1" @click="answer(0)"><Emoji char="❌" :size="34" /> Не верю</button>
    </template>
    <Waiting v-else :title="personal.answer === 1 ? 'Вы верите' : 'Вы не верите'" note="Сейчас узнаем правду" icon="🤔" />
  </div>
</template>

<style scoped>
.truth {
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
