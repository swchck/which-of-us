<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import ChatRing from '../parts/ChatRing.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'date' || p?.kind === 'datePick' ? p : null;
});
const players = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
</script>

<template>
  <div v-if="phase && view" class="date">
    <div class="top">
      <div class="card sticker">
        <div class="label display"><Emoji char="💘" /> Свидание вслепую · вечер {{ phase.night }} из {{ phase.nights }}</div>
        <template v-if="phase.kind === 'date'">
          <div class="text">Переписка в разгаре!</div>
          <div class="note">У каждого всего 4 сообщения за вечер и тайная манера письма</div>
        </template>
        <template v-else>
          <div class="text">С кем на свидание?</div>
          <div class="note">Выберите на телефоне одного человека. Взаимность — 200 очков обоим</div>
        </template>
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div v-if="phase.kind === 'date'" class="room">
      <ChatRing :players="players" :code="view.code" :flights="phase.flights" :radius="{ x: 560, y: 220 }" />
      <div class="hint ribbon">Сообщений за игру: {{ phase.sent }}</div>
    </div>
    <div v-else class="voters">
      <div class="hint ribbon">{{ phase.voted.length }} из {{ players.length }} выбрали</div>
      <PlayerRow :code="view.code" :players="players" :done="phase.voted" :size="130" />
    </div>
  </div>
</template>

<style scoped>
.date {
  position: absolute;
  inset: 0;
  padding: 60px 90px 230px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 26px 40px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 6px;
  font-size: 52px;
  font-weight: 900;
  line-height: 1.1;
}

.note {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--muted);
}

.room {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.hint {
  font-size: 22px;
  color: #fff;
}

.voters {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
</style>
