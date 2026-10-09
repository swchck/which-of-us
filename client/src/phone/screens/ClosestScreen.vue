<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from '../../common/Icon.vue';
import { CLOSEST_MAX } from '../../../../shared/protocol';
import { formatNumber, withUnit } from '../../../../shared/catalog';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'closest' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'closest' ? view.value.personal : null));
const digits = ref('');
const value = computed(() => (digits.value ? Number(digits.value) : null));
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0'];

function press(key: string): void {
  const next = digits.value === '0' ? key : digits.value + key;
  if (Number(next) <= CLOSEST_MAX) digits.value = next;
}

function submit(): void {
  if (value.value !== null) answer(value.value);
}
</script>

<template>
  <div v-if="phase && personal" class="closest">
    <template v-if="personal.answer === undefined">
      <div class="question sticker">{{ phase.question }}</div>
      <div class="display-row display">
        <span class="num" :class="{ empty: value === null }">{{ value === null ? '?' : formatNumber(value) }}</span>
        <small v-if="phase.unit">{{ phase.unit }}</small>
      </div>
      <div class="pad">
        <button v-for="(k, i) in KEYS" :key="i" class="key" :class="{ blank: !k }" :disabled="!k" type="button" @click="press(k)">{{ k }}</button>
        <button class="key" type="button" aria-label="Стереть" @click="digits = digits.slice(0, -1)"><Icon name="backspace" /></button>
      </div>
      <button class="btn pink" type="button" :disabled="value === null" @click="submit">Отправить</button>
    </template>
    <Waiting
      v-else
      title="Ставка принята!"
      :note="`Ваш ответ: ${withUnit(personal.answer, phase.unit)}`"
      icon="🎯"
    />
  </div>
</template>

<style scoped>
.closest {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question {
  padding: 16px;
  font-size: 21px;
  font-weight: 800;
  line-height: 1.25;
}

.display-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  font-size: 44px;
}

.num.empty {
  color: var(--muted);
}

.display-row small {
  font-size: 20px;
  color: var(--muted);
}

.pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.key {
  min-height: 58px;
  border-radius: 16px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 4px 0 var(--ink);
  font: inherit;
  font-size: 26px;
  font-weight: 900;
}

.key:active {
  translate: 0 3px;
  box-shadow: 0 1px 0 var(--ink);
}

.key.blank {
  visibility: hidden;
}
</style>
