<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'foreheadGuess' || p?.kind === 'foreheadReveal' ? p : null;
});
const guesser = computed(() => playerById(phase.value?.guesser));
</script>

<template>
  <div v-if="phase && view" class="forehead">
    <Confetti v-if="phase.kind === 'foreheadReveal' && phase.right" :delay="0.5" :y="0.35" />
    <div class="top">
      <div v-if="guesser" class="guesser">
        <Avatar :player="guesser" :code="view.code" :size="160" :ring="5" />
        <div class="sign sticker display">{{ phase.kind === 'foreheadReveal' ? phase.word : '???' }}</div>
      </div>
      <div class="ask">
        <b class="display">{{ guesser?.name }}</b>
        <span v-if="phase.just" class="title">Ровно один</span>
        <span v-if="phase.kind === 'foreheadGuess'">читает подсказки и угадывает слово</span>
        <span v-else class="verdict display" :class="{ right: phase.right }">{{ phase.guess ? `«${phase.guess}»` : 'нет ответа' }} — {{ phase.right ? 'верно!' : 'мимо' }}</span>
      </div>
      <TimerRing v-if="phase.kind === 'foreheadGuess'" :deadline="phase.deadline" :size="170" />
    </div>
    <div class="hints">
      <div v-for="(h, i) in phase.hints" :key="h.player" class="hint sticker" :class="{ burnt: h.cancelled }" :style="{ animationDelay: `${0.2 + i * 0.12}s` }">
        <Avatar v-if="playerById(h.player)" :player="playerById(h.player)!" :code="view.code" :size="54" :ring="3" />
        <span v-if="h.text" :class="{ struck: h.cancelled }">{{ h.text }}</span>
        <span v-else>🔥 сгорела</span>
        <b v-if="phase.kind === 'foreheadReveal' && phase.gains[h.player]" class="gain">+{{ phase.gains[h.player] }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forehead {
  position: absolute;
  inset: 0;
  padding: 50px 170px 230px 90px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.top {
  display: flex;
  align-items: center;
  gap: 36px;
}

.guesser {
  position: relative;
}

.sign {
  position: absolute;
  top: -26px;
  left: 50%;
  translate: -50%;
  padding: 6px 18px;
  font-size: 30px;
  white-space: nowrap;
  rotate: -4deg;
}

.ask {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 3px 0 var(--ink);
}

.ask b {
  font-size: 56px;
}

.verdict {
  font-size: 46px;
  color: var(--pink);
}

.verdict.right {
  color: var(--green);
}

.hints {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 22px;
  font-size: 34px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.hint.burnt {
  background: #e7e0f5;
  color: #6b5a99;
}

.struck {
  text-decoration: line-through;
}

.title {
  color: var(--yellow);
}

.gain {
  font-size: 26px;
  color: var(--green);
}
</style>
