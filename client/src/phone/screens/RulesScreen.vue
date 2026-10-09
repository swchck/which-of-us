<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import { GAME_INFO } from '../../../../shared/catalog';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'rules' ? view.value.phase : null));
const ready = computed(() => view.value?.personal.kind === 'rules' && view.value.personal.ready);
const info = computed(() => (phase.value ? GAME_INFO[phase.value.game] : null));
</script>

<template>
  <Waiting v-if="ready" title="Поехали!" note="Ждём, пока остальные дочитают" />
  <div v-else-if="info" class="rules">
    <Emoji class="icon pop-in" :char="info.icon" rim />
    <h2 class="display">{{ info.title }}</h2>
    <ol>
      <li v-for="(line, i) in info.rules" :key="i">{{ line }}</li>
    </ol>
    <button class="btn green ok" @click="answer('ready')">Понятно!</button>
  </div>
</template>

<style scoped>
.rules {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 12px 0 16px;
}

.icon {
  font-size: 72px;
}

h2 {
  margin: 0;
  font-size: 28px;
  text-align: center;
}

ol {
  margin: 0;
  padding-left: 24px;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
}

.ok {
  margin-top: auto;
  width: 100%;
}
</style>
