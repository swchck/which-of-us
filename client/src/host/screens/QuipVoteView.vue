<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed } from 'vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const TILTS = [-2.5, 2, -1.5];

const phase = computed(() => (view.value?.phase.kind === 'quipVote' ? view.value.phase : null));
</script>

<template>
  <div v-if="phase && view" class="quip">
    <div class="top">
      <div class="card sticker">
        <div class="label display"><Emoji char="🥊" /> Битва ответов · {{ phase.match }} из {{ phase.matches }}</div>
        <WordsIn class="text" :text="phase.prompt" />
      </div>
      <TimerRing :deadline="phase.deadline" :size="150" />
    </div>
    <div class="ring">
      <template v-for="(a, i) in phase.answers" :key="a.id">
        <span v-if="i > 0" class="vs display">VS</span>
        <div class="answer sticker hand" :style="{ rotate: `${TILTS[i]}deg`, animationDelay: `${0.5 + i * 0.35}s` }">
          {{ a.text }}
        </div>
      </template>
    </div>
    <div class="hint ribbon">Голосуйте на телефоне · {{ phase.voted.length }} проголосовали</div>
  </div>
</template>

<style scoped>
.quip {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.top {
  align-self: stretch;
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
  font-size: 26px;
  color: var(--pink);
}

.text {
  margin-top: 6px;
  font-size: 54px;
  font-weight: 900;
  line-height: 1.12;
}

.ring {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.answer {
  width: 600px;
  min-height: 200px;
  display: grid;
  place-items: center;
  padding: 30px 36px;
  font-size: 46px;
  line-height: 1.15;
  text-align: center;
  hyphens: auto;
  overflow-wrap: break-word;
  animation: slam 500ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.vs {
  font-size: 90px;
  color: var(--yellow);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
  rotate: -8deg;
  animation: pop-in 400ms 0.7s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

.hint {
  font-size: 22px;
  color: #fff;
}

@keyframes slam {
  from {
    scale: 1.8;
    opacity: 0;
  }
}
</style>
