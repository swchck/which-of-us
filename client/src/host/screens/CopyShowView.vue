<script setup lang="ts">
import { computed } from 'vue';
import Emoji from '../../common/Emoji.vue';
import InkView from '../../common/InkView.vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'copyShow' ? view.value.phase : null));
const size = computed(() => {
  const b = phase.value?.picture.board;
  if (!b) return { w: 0, h: 0 };
  const h = Math.min(640, (1300 * b.h) / b.w);
  return { w: (h * b.w) / b.h, h };
});
</script>

<template>
  <div v-if="phase && view" class="copy">
    <div class="top">
      <div class="title display"><Emoji char="🖼" /> Запоминайте!</div>
      <TimerRing :deadline="phase.deadline" :size="130" />
    </div>
    <div class="frame sticker" :style="{ width: `${size.w}px`, height: `${size.h}px` }">
      <InkView :code="view.code" :board="phase.picture.board" :ink="phase.picture.ink" :image="phase.picture.image" />
    </div>
  </div>
</template>

<style scoped>
.copy {
  position: absolute;
  inset: 0;
  padding: 36px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.top {
  display: flex;
  align-items: center;
  gap: 30px;
}

.title {
  font-size: 64px;
  color: var(--yellow);
  -webkit-text-stroke: 8px var(--ink);
  paint-order: stroke;
}

.frame {
  overflow: hidden;
  padding: 0;
  animation: pop-in 500ms both;
}
</style>
