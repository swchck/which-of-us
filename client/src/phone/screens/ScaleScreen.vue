<script setup lang="ts">
import { computed, ref } from 'vue';
import { SCALE_MAX } from '../../../../shared/protocol';
import { answer, playerById, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'scale' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'scale' ? view.value.personal : null));
const target = computed(() => playerById(phase.value?.target));
const value = ref(Math.round(SCALE_MAX / 2));
</script>

<template>
  <div v-if="phase && personal" class="scale">
    <Waiting
      v-if="personal.answer !== undefined"
      :title="`Ваш ответ: ${personal.answer}`"
      :note="personal.role === 'target' ? 'Посмотрим, как хорошо вас знают' : 'Ждём остальных — смотрите на экран'"
      icon="🌡️"
    />
    <template v-else>
      <div class="question sticker">
        <div class="label">{{ personal.role === 'target' ? 'Честно о себе' : `Угадайте ответ: ${target?.name ?? ''}` }}</div>
        <div class="text">{{ phase.question }}</div>
      </div>
      <div class="value display">{{ value }}</div>
      <input v-model.number="value" class="slider" type="range" min="0" :max="SCALE_MAX" step="1" />
      <div class="ends">
        <span>{{ phase.low }}</span>
        <span>{{ phase.high }}</span>
      </div>
      <button class="btn pink go" @click="answer(value)">Ответить</button>
    </template>
  </div>
</template>

<style scoped>
.scale {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
}

.question {
  padding: 16px 18px;
}

.label {
  font-weight: 800;
  color: var(--pink);
}

.text {
  font-size: 22px;
  font-weight: 900;
  line-height: 1.2;
}

.value {
  align-self: center;
  font-size: 72px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow: 0 5px 0 var(--ink);
}

.slider {
  width: 100%;
  height: 44px;
  accent-color: var(--pink);
  touch-action: pan-x;
}

.ends {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-weight: 800;
  font-size: 15px;
}

.ends span:last-child {
  text-align: right;
}

.go {
  margin-top: auto;
}
</style>
