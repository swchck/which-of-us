<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed } from 'vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'truth' ? view.value.phase : null));
const players = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
</script>

<template>
  <div v-if="phase && view" class="truth">
    <div class="top">
      <div :key="phase.statement" class="card sticker">
        <div class="label display"><Emoji char="🤔" /> Верю — не верю · {{ phase.round }} из {{ phase.rounds }}</div>
        <WordsIn class="text" :text="phase.statement" />
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div class="choices">
      <span class="choice yes display"><Emoji char="✅" /> Верю</span>
      <span class="choice no display"><Emoji char="❌" /> Не верю</span>
    </div>
    <div class="voters">
      <div class="hint ribbon">{{ phase.answered.length }} из {{ players.length }} решили</div>
      <PlayerRow :code="view.code" :players="players" :done="phase.answered" :size="130" />
    </div>
  </div>
</template>

<style scoped>
.truth {
  position: absolute;
  inset: 0;
  padding: 60px 90px 230px;
  display: flex;
  flex-direction: column;
  gap: 30px;
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

.choices {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.choice {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 30px;
  border-radius: 20px;
  border: 5px solid var(--ink);
  box-shadow: var(--shadow);
  font-size: 40px;
  color: var(--ink);
  animation: pop-in 400ms 0.8s both;
}

.choice.yes {
  background: var(--green);
  rotate: -3deg;
}

.choice.no {
  background: var(--pink);
  rotate: 3deg;
}

.voters {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.hint {
  font-size: 22px;
  color: #fff;
}
</style>
