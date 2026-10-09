<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import WordsIn from '../../common/WordsIn.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'never' ? view.value.phase : null));
const players = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
</script>

<template>
  <div v-if="phase && view" class="never">
    <div class="top">
      <div :key="phase.statement" class="card sticker">
        <div class="label display"><Emoji char="🙊" /> Я никогда не… · {{ phase.round }} из {{ phase.rounds }}</div>
        <div class="text">
          <span class="lead">Я никогда не</span>
          <WordsIn :text="phase.statement" :delay="0.4" />
        </div>
        <div class="note">На телефоне: было или нет — и сколько из вас скажут «было»</div>
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div class="voters">
      <div class="hint ribbon">{{ phase.answered.length }} из {{ players.length }} ответили</div>
      <PlayerRow :code="view.code" :players="players" :done="phase.answered" :size="130" />
    </div>
  </div>
</template>

<style scoped>
.never {
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
  font-weight: 800;
  color: var(--pink);
}

.text {
  margin-top: 10px;
  font-size: 64px;
  font-weight: 900;
  line-height: 1.12;
}

.lead {
  color: #6b5a99;
  margin-right: 0.3em;
}

.text :deep(.words) {
  display: inline;
}

.note {
  margin-top: 14px;
  font-size: 24px;
  font-weight: 800;
  color: #6b5a99;
}

.voters {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.hint {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
}
</style>
