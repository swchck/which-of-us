<script setup lang="ts">
import Confetti from '../../common/Confetti.vue';
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'predictReveal' ? view.value.phase : null));
const target = computed(() => playerById(phase.value?.target));
const COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--green)'];
const LETTERS = ['А', 'Б', 'В', 'Г'];
const REVEAL = 2.2;

const columns = computed(() => {
  const p = phase.value;
  if (!p) return [];
  let n = 0;
  return p.options.map((text, i) => ({
    text,
    correct: i === p.correct,
    guessers: Object.entries(p.guesses)
      .filter(([, a]) => a === i)
      .map(([id]) => ({ player: playerById(id), delay: n++ * 0.25 })),
  }));
});

let sting: ReturnType<typeof setTimeout> | undefined;
onMounted(() => {
  audio.sfx('drumroll');
  sting = setTimeout(() => audio.sfx(phase.value && phase.value.correct >= 0 ? 'fanfare' : 'buzz'), REVEAL * 1000);
});
onBeforeUnmount(() => clearTimeout(sting));
</script>

<template>
  <div v-if="phase && view && target" class="reveal" :style="{ '--reveal': `${REVEAL}s` }">
    <Confetti v-if="columns[phase.correct]?.guessers.length" :delay="REVEAL" :y="0.6" />
    <div class="head plate">
      <Avatar :player="target" :code="view.code" :size="110" />
      <div class="question">{{ phase.question }}</div>
    </div>
    <div class="cols" :style="{ gridTemplateColumns: `repeat(${phase.options.length}, 1fr)` }">
      <div v-for="(c, i) in columns" :key="i" class="col" :class="{ correct: c.correct, wrong: !c.correct && phase.correct >= 0 }">
        <div class="guessers">
          <div v-for="(g, j) in c.guessers" :key="j" class="guess" :style="{ animationDelay: `${g.delay}s` }">
            <Avatar v-if="g.player" :player="g.player" :code="view.code" :size="70" :ring="3" />
            <span v-if="c.correct && g.player" class="plus display">+{{ phase.gains[g.player.id] }}</span>
            <span v-if="g.player && phase.jokers?.includes(g.player.id)" class="joker">🃏</span>
          </div>
        </div>
        <div class="option" :style="{ background: COLORS[i % 4] }">
          <span class="letter display">{{ LETTERS[i] }}</span>
          <span>{{ c.text }}</span>
          <div v-if="c.correct" class="stamp display">{{ phase.lie ? 'Это ложь!' : `${target.name} выбирает это` }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.joker {
  font-size: 28px;
  filter: drop-shadow(0 2px 0 var(--ink));
}

.reveal {
  position: absolute;
  inset: 0;
  padding: 50px 80px 230px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.head {
  align-self: center;
  display: flex;
  align-items: center;
  gap: 30px;
  justify-content: center;
}

.question {
  font-size: 46px;
  font-weight: 900;
  text-shadow: 0 4px 0 var(--ink);
}

.cols {
  flex: 1;
  display: grid;
  gap: 30px;
  align-items: end;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition:
    opacity 400ms,
    transform 400ms;
}

.wrong {
  animation: fade 400ms both;
  animation-delay: var(--reveal);
}

.correct .option {
  animation: win 700ms cubic-bezier(0.3, 1.6, 0.5, 1) both;
  animation-delay: var(--reveal);
}

.guessers {
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: center;
  gap: 14px;
  min-height: 90px;
}

.guess {
  position: relative;
  animation: fly 500ms cubic-bezier(0.3, 1.5, 0.5, 1) both;
}

.plus {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: 800;
  color: var(--green);
  text-shadow: 0 3px 0 var(--ink);
  animation: pop-in 400ms both;
  animation-delay: calc(var(--reveal) + 0.3s);
}

.option {
  position: relative;
  min-height: 150px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  border: var(--line) solid var(--ink);
  box-shadow: var(--shadow);
  color: var(--ink);
  font-size: 32px;
  font-weight: 900;
  line-height: 1.1;
}

.letter {
  width: 54px;
  height: 54px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--paper);
  border: 3px solid var(--ink);
  font-size: 24px;
}

.stamp {
  position: absolute;
  top: -26px;
  right: -14px;
  padding: 6px 14px;
  background: var(--ink);
  color: var(--yellow);
  border-radius: 12px;
  font-size: 18px;
  transform: rotate(6deg);
  animation: pop-in 500ms both;
  animation-delay: var(--reveal);
}

@keyframes fly {
  from {
    transform: translateY(-400px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@keyframes fade {
  to {
    opacity: 0.35;
    transform: scale(0.94);
  }
}

@keyframes win {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12) rotate(-2deg);
  }
  100% {
    transform: scale(1.06) rotate(-1deg);
    box-shadow:
      0 6px 0 var(--ink),
      0 0 0 10px #fff,
      0 0 60px 20px rgba(255, 255, 255, 0.6);
  }
}
</style>
