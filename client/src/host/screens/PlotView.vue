<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed, watch } from 'vue';
import { audio } from '../../common/audio';
import ChatRing from '../parts/ChatRing.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'plot' || p?.kind === 'plotGuess' ? p : null;
});
const target = computed(() => playerById(phase.value?.target));
watch(
  () => phase.value?.kind === 'plot' && phase.value.caught,
  (caught) => caught && audio.sfx('fanfare'),
);

const voters = computed(() => (phase.value?.kind === 'plotGuess' ? phase.value.voters.map((id) => playerById(id)).filter((p) => p !== undefined) : []));
</script>

<template>
  <div v-if="phase && view" class="plot">
    <div class="top">
      <div class="card sticker">
        <div class="label display"><Emoji char="🤫" /> Заговор</div>
        <template v-if="phase.kind === 'plot'">
          <div class="text">Против игрока {{ target?.name }} плетут заговор!</div>
          <div class="note">Переписывайтесь на телефонах. Заговорщики знают тайное слово, а жертва — нет</div>
        </template>
        <template v-else>
          <div class="text">Кто был в сговоре?</div>
          <div class="note">Жертва и непричастные выбирают подозреваемых на телефонах</div>
        </template>
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>

    <div v-if="phase.kind === 'plot'" class="room">
      <ChatRing :players="view.players" :code="view.code" :flights="phase.flights" :center="target" :class="{ caught: phase.caught }" />
      <div class="hint ribbon">Сообщений: {{ phase.sent }}</div>
      <div v-if="phase.caught" class="trap display">🪤 Попались!</div>
    </div>

    <div v-else class="voters">
      <div class="hint ribbon">{{ phase.voted.length }} из {{ voters.length }} назвали подозреваемых</div>
      <PlayerRow :code="view.code" :players="voters" :done="phase.voted" :size="140" />
    </div>
  </div>
</template>

<style scoped>
.plot {
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

.trap {
  position: absolute;
  top: 30%;
  font-size: 120px;
  color: var(--yellow);
  -webkit-text-stroke: 6px var(--ink);
  paint-order: stroke;
  animation: pop-in 500ms cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

.voters {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.caught :deep(.center) {
  animation: shake 400ms 2;
}

@keyframes shake {
  25% {
    rotate: -6deg;
  }
  75% {
    rotate: 6deg;
  }
}
</style>
