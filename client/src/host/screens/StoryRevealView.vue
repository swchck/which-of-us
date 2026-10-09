<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'storyReveal' ? view.value.phase : null));
const LINE_STEP = 1.2;
</script>

<template>
  <div v-if="phase && view" class="story">
    <div class="title display"><span class="plate"><Emoji char="📜" /> Что у нас получилось</span></div>
    <div class="page sticker">
      <div
        v-for="(line, i) in phase.lines"
        :key="i"
        class="line"
        :class="{ start: !line.author }"
        :style="{ animationDelay: `${i * LINE_STEP}s` }"
      >
        <Avatar v-if="playerById(line.author)" :player="playerById(line.author)!" :code="view.code" :size="48" :ring="3" />
        <Emoji v-else class="quill" char="✒️" />
        <span class="text">{{ line.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.story {
  position: absolute;
  inset: 0;
  padding: 40px 140px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.title {
  font-size: 34px;
  font-weight: 900;
}

.page {
  width: 100%;
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transform: rotate(-0.6deg);
}

.line {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  animation: pop-in 450ms both;
}

.line.start {
  font-style: italic;
  color: #6b5a99;
}

.quill {
  width: 48px;
  font-size: 34px;
  text-align: center;
  flex: none;
}
</style>
