<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'percent' || p?.kind === 'percentGuess' || p?.kind === 'percentBet' || p?.kind === 'percentReveal' ? p : null;
});
const hero = computed(() => playerById(phase.value?.hero));
const players = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
const bettors = computed(() => players.value.filter((p) => p.id !== phase.value?.hero));
const guess = computed(() => (phase.value?.kind === 'percentBet' || phase.value?.kind === 'percentReveal' ? phase.value.guess : null));
const people = (ids: string[]) => ids.map((id) => playerById(id)).filter((p) => p !== undefined);
</script>

<template>
  <div v-if="phase && view" class="percent">
    <Confetti v-if="phase.kind === 'percentReveal' && Object.keys(phase.gains).length" :delay="1" :y="0.4" />
    <div class="top">
      <div :key="phase.question" class="card sticker">
        <div class="label display"><Emoji char="📊" /> Сколько процентов?</div>
        <WordsIn class="text" :text="phase.question" />
      </div>
      <TimerRing v-if="phase.kind !== 'percentReveal'" :deadline="phase.deadline" :size="170" />
    </div>

    <div v-if="phase.kind === 'percent'" class="row">
      <div class="hint ribbon">Тайно отвечаем «да» или «нет» · {{ phase.answered.length }} из {{ players.length }}</div>
      <PlayerRow :code="view.code" :players="players" :done="phase.answered" :size="120" />
    </div>

    <div v-else class="scale">
      <div v-if="hero" class="hero">
        <Avatar :player="hero" :code="view.code" :size="110" :ring="5" />
        <b class="display">{{ hero.name }}</b>
      </div>
      <div class="bar plate">
        <div v-if="guess !== null" class="mark guess" :style="{ left: `${guess}%` }">
          <span class="display">{{ guess }}%</span>
        </div>
        <div v-if="phase.kind === 'percentReveal'" class="mark real" :style="{ left: `${phase.share}%` }">
          <span class="display">{{ phase.share }}%</span>
        </div>
        <div v-if="phase.kind === 'percentGuess'" class="thinking display">думает…</div>
      </div>
      <div v-if="phase.kind === 'percentBet'" class="row">
        <div class="hint ribbon">Больше или меньше? · {{ phase.answered.length }} из {{ bettors.length }}</div>
        <PlayerRow :code="view.code" :players="bettors" :done="phase.answered" :size="100" />
      </div>
      <div v-else-if="phase.kind === 'percentReveal'" class="sides">
        <div v-for="side in [{ t: 'Больше', ids: phase.higher }, { t: 'Меньше', ids: phase.lower }]" :key="side.t" class="side sticker">
          <b class="display">{{ side.t }}</b>
          <div class="faces">
            <div v-for="p in people(side.ids)" :key="p.id" class="face">
              <Avatar :player="p" :code="view.code" :size="70" :ring="3" />
              <b v-if="phase.gains[p.id]" class="gain">+{{ phase.gains[p.id] }}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.percent {
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
  padding: 30px 44px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 8px;
  font-size: 52px;
  font-weight: 900;
  line-height: 1.12;
}

.row {
  flex: 1;
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

.scale {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.hero {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 40px;
  color: #fff;
  text-shadow: 0 4px 0 var(--ink);
}

.bar {
  position: relative;
  width: 100%;
  height: 70px;
  background: linear-gradient(90deg, var(--cyan), var(--yellow), var(--pink));
}

.mark {
  position: absolute;
  top: -18px;
  bottom: -18px;
  width: 10px;
  margin-left: -5px;
  border-radius: 5px;
  background: var(--ink);
}

.mark span {
  position: absolute;
  top: -58px;
  left: 50%;
  translate: -50%;
  font-size: 40px;
  color: #fff;
  text-shadow: 0 4px 0 var(--ink);
}

.mark.real {
  background: var(--green);
  animation: pop-in 500ms 0.6s both;
}

.mark.real span {
  top: auto;
  bottom: -60px;
}

.thinking {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 34px;
  color: var(--ink);
}

.sides {
  display: flex;
  gap: 40px;
  margin-top: 30px;
}

.side {
  min-width: 380px;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 30px;
}

.faces {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.face {
  position: relative;
}

.gain {
  position: absolute;
  right: -10px;
  bottom: -6px;
  font-size: 22px;
  color: var(--green);
  text-shadow: 0 2px 0 var(--ink);
}
</style>
