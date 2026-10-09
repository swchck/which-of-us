<script setup lang="ts">
import { computed } from 'vue';
import { LOCATION_INFO } from '../../../../shared/catalog';
import Emoji from '../../common/Emoji.vue';
import { view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'scene' ? view.value.phase : null));
</script>

<template>
  <div v-if="phase" class="scene-card">
    <div class="from ribbon">
      <Emoji :char="LOCATION_INFO[phase.location].icon" />
      {{ LOCATION_INFO[phase.location].title }}
    </div>
    <div class="to sticker display">{{ phase.title }}</div>
  </div>
</template>

<style scoped>
.scene-card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding-bottom: 160px;
}

.from {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 34px;
  animation: pop-in 400ms both;
}

.to {
  padding: 28px 64px;
  font-size: 88px;
  font-weight: 900;
  line-height: 1;
  transform: rotate(2deg);
  animation: drop 800ms cubic-bezier(0.2, 1.4, 0.4, 1) 250ms both;
}
</style>
