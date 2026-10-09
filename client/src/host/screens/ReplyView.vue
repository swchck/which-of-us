<script setup lang="ts">
import { computed } from 'vue';
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'replyPick' ? view.value.phase : null));
const players = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
</script>

<template>
  <div v-if="phase && view" class="reply">
    <div class="top">
      <div :key="phase.situation" class="card sticker">
        <div class="label display"><Emoji char="💬" /> Подбери реплику · {{ phase.round }} из {{ phase.rounds }}</div>
        <WordsIn class="text" :class="{ long: phase.situation.length > 60 }" :text="phase.situation" />
        <div class="note">Выберите фразу из своих карточек на телефоне</div>
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div class="row">
      <div class="hint ribbon">{{ phase.done.length }} из {{ players.length }} выбрали</div>
      <PlayerRow :code="view.code" :players="players" :done="phase.done" :size="100" />
    </div>
  </div>
</template>

<style scoped>
.reply {
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
  font-size: 58px;
  font-weight: 900;
  line-height: 1.12;
}

.text.long {
  font-size: 42px;
}

.note {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
}

.row {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
}

.hint {
  font-size: 22px;
  color: #fff;
}
</style>
