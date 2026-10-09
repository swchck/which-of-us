<script setup lang="ts">
import { computed } from 'vue';
import { QUIZ_LIVES } from '../../../../shared/protocol';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'quiz' || p?.kind === 'quizReveal' ? p : null;
});
/** The closing reveal has no question, only who made it through and the totals. */
const final = computed(() => phase.value?.kind === 'quizReveal' && phase.value.answer < 0);
const COLORS = ['var(--pink)', 'var(--cyan)', 'var(--yellow)', 'var(--green)'];
const players = computed(() =>
  Object.entries(phase.value?.lives ?? {})
    .map(([id, lives]) => ({ player: playerById(id), lives }))
    .filter((r) => r.player)
    .sort((a, b) => b.lives - a.lives),
);
const pickers = (i: number) => {
  const p = phase.value;
  if (p?.kind !== 'quizReveal') return [];
  return Object.entries(p.picks).filter(([, v]) => v === i).map(([id]) => playerById(id)).filter((pl) => pl !== undefined);
};
</script>

<template>
  <div v-if="phase && view" class="quiz">
    <template v-if="!final">
      <div class="top">
        <div class="card sticker">
          <div class="label display"><Emoji char="❤" /> Викторина на выбывание<template v-if="phase.kind === 'quiz'"> · {{ phase.n }} из {{ phase.of }}</template></div>
          <div class="q display">{{ phase.q }}</div>
        </div>
        <TimerRing v-if="phase.kind === 'quiz'" :deadline="phase.deadline" :size="170" />
      </div>
      <div class="options">
        <div
          v-for="(o, i) in phase.options"
          :key="i"
          class="option sticker"
          :class="{ right: phase.kind === 'quizReveal' && phase.answer === i, wrong: phase.kind === 'quizReveal' && phase.answer !== i }"
          :style="{ '--c': COLORS[i] }"
        >
          <span class="display">{{ o }}</span>
          <span class="who">
            <Avatar v-for="pl in pickers(i)" :key="pl.id" :player="pl" :code="view.code" :size="44" :ring="2" />
          </span>
        </div>
      </div>
    </template>
    <h2 v-else class="display">Итоги викторины</h2>
    <div class="lives">
      <div v-for="r in players" :key="r.player!.id" class="life" :class="{ out: r.lives === 0 }">
        <Avatar :player="r.player!" :code="view.code" :size="final ? 100 : 70" :ring="3" />
        <span class="hearts">
          <span v-for="i in QUIZ_LIVES" :key="i" :class="{ lost: i > r.lives }">❤</span>
        </span>
        <b v-if="phase.kind === 'quizReveal' && phase.gains[r.player!.id]" class="gain">+{{ phase.gains[r.player!.id] }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz {
  position: absolute;
  inset: 0;
  padding: 44px 170px 230px 90px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 24px 40px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 26px;
  color: var(--pink);
}

.q {
  font-size: 50px;
  line-height: 1.1;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.option {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 92px;
  padding: 10px 24px;
  background: var(--c);
  font-size: 38px;
  animation: pop-in 400ms both;
}

.option .display {
  flex: 1;
}

.option.wrong {
  opacity: 0.4;
}

.option.right {
  box-shadow:
    0 0 0 8px #fff,
    var(--shadow);
}

.who {
  display: flex;
  gap: 4px;
}

h2 {
  margin: 0;
  text-align: center;
  font-size: 64px;
  color: var(--yellow);
  -webkit-text-stroke: 8px var(--ink);
  paint-order: stroke;
}

.lives {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 22px 34px;
}

.life {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.life.out {
  opacity: 0.45;
  filter: grayscale(1);
}

.hearts {
  font-size: 24px;
  color: var(--red);
}

.hearts .lost {
  opacity: 0.2;
}

.gain {
  font-size: 28px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
