<script setup lang="ts">
import { computed, ref } from 'vue';
import { WAVE_HINT_MAX, WAVE_MAX } from '../../../../shared/protocol';
import { answer, playerById, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'waveHint' || p?.kind === 'waveGuess' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'waveHint' || p?.kind === 'waveGuess' ? p : null;
});
const psychic = computed(() => playerById(phase.value?.psychic));
const hint = ref('');
const mark = ref(Math.round(WAVE_MAX / 2));

function sendHint(): void {
  const text = hint.value.trim();
  if (text) answer(text);
}
</script>

<template>
  <div v-if="phase" class="wave">
    <Waiting v-if="!personal" :title="phase.kind === 'waveHint' ? 'Ждём подсказку' : 'Ваша подсказка на экране'" :note="`${phase.kind === 'waveHint' ? psychic?.name + ' видит тайную точку' : 'Остальные ищут вашу точку'}`" icon="🌊" />

    <template v-else-if="personal.kind === 'waveHint'">
      <Waiting v-if="personal.sent" title="Подсказка отправлена" note="Посмотрим, кто поймает волну" icon="🌊" />
      <template v-else>
        <div class="card sticker">
          <div class="label">Тайная точка — только для вас</div>
          <div class="track">
            <i class="dot" :style="{ left: `${(personal.target / WAVE_MAX) * 100}%` }" />
          </div>
          <div class="ends">
            <span>{{ phase.left }}</span>
            <span>{{ phase.right }}</span>
          </div>
        </div>
        <p class="tip">Назовите то, что на этой шкале стоит примерно здесь</p>
        <form class="send" @submit.prevent="sendHint">
          <input v-model="hint" :maxlength="WAVE_HINT_MAX" placeholder="Например, тёплый чай" enterkeyhint="send" />
          <button class="btn pink" :disabled="!hint.trim()">Отправить</button>
        </form>
      </template>
    </template>

    <template v-else-if="phase.kind === 'waveGuess'">
      <Waiting v-if="personal.answer !== undefined" :title="`Ваша отметка: ${personal.answer}`" icon="🎯" />
      <template v-else>
        <div class="card sticker">
          <div class="label">Подсказка от игрока {{ psychic?.name }}</div>
          <div class="hint">«{{ phase.hint }}»</div>
        </div>
        <input v-model.number="mark" class="slider" type="range" min="0" :max="WAVE_MAX" step="1" />
        <div class="ends">
          <span>{{ phase.left }}</span>
          <span>{{ phase.right }}</span>
        </div>
        <button class="btn pink go" @click="answer(mark)">Здесь!</button>
      </template>
    </template>
  </div>
</template>

<style scoped>
.wave {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
}

.card {
  padding: 16px 18px;
}

.label {
  font-weight: 800;
  color: var(--pink);
}

.hint {
  font-size: 28px;
  font-weight: 900;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.track {
  position: relative;
  height: 36px;
  margin: 12px 0 8px;
  border: 3px solid var(--ink);
  border-radius: 18px;
  background: linear-gradient(90deg, var(--cyan), #fff1c2 50%, var(--pink));
}

.dot {
  position: absolute;
  top: -10px;
  bottom: -10px;
  width: 10px;
  margin-left: -5px;
  border-radius: 5px;
  background: var(--ink);
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

.tip {
  margin: 0;
  font-weight: 700;
}

.send {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.send input {
  padding: 12px 14px;
  border: 3px solid var(--ink);
  border-radius: 14px;
  font: inherit;
  font-size: 18px;
  font-weight: 700;
}

.slider {
  width: 100%;
  height: 44px;
  accent-color: var(--pink);
  touch-action: pan-x;
}

.go {
  margin-top: auto;
}
</style>
