<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'clueGuess' ? view.value.phase : null));
const author = computed(() => playerById(phase.value?.author));
const guessers = computed(
  () => view.value?.players.filter((p) => p.id !== phase.value?.author && (p.connected || phase.value?.answered.includes(p.id))) ?? [],
);
/** Long clues shrink so three words still fit one line beside the avatar. */
const wordSize = computed(() => Math.max(48, Math.min(84, Math.round(2400 / Math.max(1, phase.value?.clue.length ?? 1)))));
const words = computed(() => phase.value?.clue.split(/\s+/).filter(Boolean) ?? []);
const TILTS = [-3, 2, -1.5, 3];
</script>

<template>
  <div v-if="phase && view && author" class="clue">
    <div class="top">
      <div class="label display"><Emoji char="🧩" /> Три слова · {{ phase.round }} из {{ phase.rounds }}</div>
      <TimerRing :deadline="phase.deadline" :size="150" />
    </div>
    <div class="note-card">
      <Avatar class="who" :player="author" :code="view.code" :size="150" :ring="6" />
      <div class="paper sticker">
        <span v-for="(w, i) in words" :key="i" class="word hand" :style="{ animationDelay: `${0.3 + i * 0.35}s`, fontSize: `${wordSize}px` }">{{ w }}</span>
      </div>
    </div>
    <div class="options">
      <div
        v-for="(o, i) in phase.options"
        :key="o"
        class="option display"
        :style="{ rotate: `${TILTS[i % TILTS.length]}deg`, animationDelay: `${1.4 + i * 0.12}s` }"
      >
        {{ o }}
      </div>
    </div>
    <div class="voters">
      <div class="hint ribbon">{{ phase.answered.length }} из {{ guessers.length }} выбрали</div>
      <PlayerRow :code="view.code" :players="guessers" :done="phase.answered" :size="110" />
    </div>
  </div>
</template>

<style scoped>
.clue {
  position: absolute;
  inset: 0;
  padding: 40px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.top {
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-size: 40px;
  color: var(--yellow);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.note-card {
  display: flex;
  align-items: center;
  gap: 36px;
}

.who {
  animation: pop-in 400ms both;
}

.paper {
  min-width: 0;
  max-width: 1450px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 28px;
  padding: 26px 50px;
  rotate: -1.5deg;
  background: #fff8d6;
}

.word {
  line-height: 1.1;
  color: var(--ink);
  animation: pop-in 450ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.options {
  width: 100%;
  max-width: 1700px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 30px;
}

.option {
  padding: 22px 16px;
  border-radius: 22px;
  border: 5px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: var(--shadow);
  font-size: 34px;
  text-align: center;
  overflow-wrap: break-word;
  animation: pop-in 400ms both;
}

.voters {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
}

.hint {
  font-size: 22px;
  color: #fff;
}
</style>
