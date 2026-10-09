<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import { GAME_INFO } from '../../../../shared/catalog';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'rules' ? view.value.phase : null));
const info = computed(() => (phase.value ? GAME_INFO[phase.value.game] : null));
const people = computed(() => view.value?.players.filter((p) => p.connected && !p.bot) ?? []);
</script>

<template>
  <div v-if="phase && info && view" class="rules">
    <div class="tag ribbon">Новая игра</div>
    <div class="card sticker">
      <div class="head">
        <Emoji class="icon" :char="info.icon" rim animated />
        <span class="title display">{{ info.title }}</span>
        <TimerRing class="timer" :deadline="phase.deadline" :size="130" />
      </div>
      <ol>
        <li v-for="(line, i) in info.rules" :key="i" :style="{ animationDelay: `${400 + i * 250}ms` }">{{ line }}</li>
      </ol>
    </div>
    <div v-if="people.length" class="ready">
      <div class="hint ribbon">Нажмите «Понятно» на телефоне</div>
      <PlayerRow :code="view.code" :players="people" :done="phase.ready" :size="110" />
    </div>
  </div>
</template>

<style scoped>
.rules {
  position: absolute;
  inset: 0;
  padding: 50px 150px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.tag {
  font-size: 34px;
  animation: pop-in 400ms both;
}

.card {
  width: 100%;
  padding: 36px 52px;
  animation: pop-in 500ms 100ms both;
}

.head {
  display: flex;
  align-items: center;
  gap: 26px;
}

.icon {
  font-size: 96px;
}

.title {
  flex: 1;
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
}

ol {
  margin: 26px 0 0;
  padding-left: 52px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

li {
  font-size: 36px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.ready {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.hint {
  font-size: 24px;
  color: #fff;
}
</style>
