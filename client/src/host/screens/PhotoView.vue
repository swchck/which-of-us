<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed, watch } from 'vue';
import { audio } from '../../common/audio';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'photo' ? view.value.phase : null));
const players = computed(() => view.value?.players.filter((p) => p.connected && (!phase.value?.subject || p.id === phase.value.subject)) ?? []);

watch(
  () => phase.value?.done.length ?? 0,
  (n, prev) => {
    if (n > prev) audio.sfx('pop');
  },
);
</script>

<template>
  <div v-if="phase && view" class="photo">
    <div class="head">
      <div class="task sticker">
        <div class="label display"><Emoji char="📸" /> {{ phase.subject ? 'Модель позирует' : 'Фото-задание' }}</div>
        <WordsIn class="text" :text="phase.prompt" />
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div class="camera">
      <div class="body">
        <div class="lens"></div>
        <div class="flash"></div>
      </div>
    </div>
    <PlayerRow :code="view.code" :players="players" :done="phase.done" :size="110" />
  </div>
</template>

<style scoped>
.photo {
  position: absolute;
  inset: 0;
  padding: 50px 80px 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
}

.head {
  display: flex;
  gap: 30px;
  align-items: center;
}

.task {
  flex: 1;
  padding: 28px 40px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 26px;
  font-weight: 800;
  color: var(--pink);
}

.text {
  font-size: 56px;
  font-weight: 900;
  line-height: 1.1;
}

.camera {
  display: grid;
  place-items: center;
}

.body {
  position: relative;
  width: 280px;
  height: 180px;
  border-radius: 34px;
  background: var(--cyan);
  border: 6px solid var(--ink);
  box-shadow: var(--shadow);
  animation: float 2.4s ease-in-out infinite;
}

.body::before {
  content: '';
  position: absolute;
  top: -34px;
  left: 40px;
  width: 80px;
  height: 34px;
  border-radius: 12px 12px 0 0;
  background: var(--cyan);
  border: 6px solid var(--ink);
  border-bottom: 0;
}

.lens {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 110px;
  height: 110px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #9ff3ff 0 14%, #1b1033 16% 100%);
  border: 10px solid var(--paper);
  outline: 5px solid var(--ink);
}

.flash {
  position: absolute;
  top: 18px;
  right: 22px;
  width: 36px;
  height: 22px;
  border-radius: 6px;
  background: var(--yellow);
  border: 4px solid var(--ink);
  animation: flash 2.4s steps(1) infinite;
}

@keyframes flash {
  0%,
  90% {
    background: var(--yellow);
    box-shadow: none;
  }
  95% {
    background: #fff;
    box-shadow: 0 0 80px 40px #fff;
  }
}
</style>
