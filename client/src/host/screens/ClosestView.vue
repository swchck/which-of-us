<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed } from 'vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'closest' ? view.value.phase : null));
const players = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
</script>

<template>
  <div v-if="phase && view" class="closest">
    <div class="top">
      <div :key="phase.question" class="card sticker">
        <div class="label display"><Emoji char="🎯" /> Ближе всех · {{ phase.round }} из {{ phase.rounds }}</div>
        <WordsIn class="text" :text="phase.question" />
        <div class="note">Введите число на телефоне{{ phase.unit ? ` (${phase.unit})` : '' }} — точно знать не обязательно</div>
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div class="voters">
      <div class="hint ribbon">{{ phase.answered.length }} из {{ players.length }} ответили</div>
      <PlayerRow :code="view.code" :players="players" :done="phase.answered" :size="140" />
    </div>
  </div>
</template>

<style scoped>
.closest {
  position: absolute;
  inset: 0;
  padding: 60px 90px 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 34px 44px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 8px;
  font-size: 62px;
  font-weight: 900;
  line-height: 1.12;
}

.note {
  margin-top: 14px;
  font-size: 30px;
  font-weight: 800;
  color: #6b5a99;
}

.voters {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
}

.hint {
  font-size: 22px;
  color: #fff;
}
</style>
