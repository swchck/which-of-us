<script setup lang="ts">
import { computed } from 'vue';
import { SIMON_COLORS } from '../../../../shared/protocol';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'simon' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'simon' ? view.value.personal : null));
const FILLS = ['var(--red)', 'var(--cyan)', 'var(--green)', 'var(--yellow)'];
</script>

<template>
  <div v-if="phase && personal" class="simon">
    <Waiting v-if="!personal.alive" title="Вы выбыли" note="Болейте за тех, кто остался" icon="🎯" />
    <Waiting v-else-if="personal.answer !== undefined" title="Нажато!" note="Ждём следующую команду" icon="🎯" />
    <template v-else>
      <p class="tip">Только если «Бублик говорит»!</p>
      <div class="pads">
        <button
          v-for="(name, i) in SIMON_COLORS"
          :key="name"
          class="pad"
          :aria-label="name"
          :style="{ background: FILLS[i] }"
          @pointerdown.prevent="answer(i)"
        ></button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.simon {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip {
  margin: 0;
  font-weight: 800;
  text-align: center;
}

.pads {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pad {
  min-height: 120px;
  border: var(--line) solid var(--ink);
  border-radius: 24px;
  box-shadow: var(--shadow);
  touch-action: manipulation;
}

.pad:active {
  translate: 3px 4px;
  box-shadow: none;
}
</style>
