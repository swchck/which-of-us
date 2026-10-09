<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'caseSurvey' || p?.kind === 'caseClue' || p?.kind === 'caseReveal' ? p : null;
});
const players = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
const culprit = computed(() => (phase.value?.kind === 'caseReveal' ? playerById(phase.value.culprit) : undefined));
const deadline = computed(() => (phase.value && 'deadline' in phase.value ? phase.value.deadline : undefined));
const verdicts = computed(() => {
  const p = phase.value;
  if (p?.kind !== 'caseReveal') return [];
  return p.accusations
    .map((a) => ({ player: playerById(a.player), suspect: playerById(a.suspect), clue: a.clue, right: a.suspect === p.culprit, gain: p.gains[a.player] }))
    .filter((v) => v.player && v.suspect);
});
</script>

<template>
  <div v-if="phase && view" class="case">
    <div class="top">
      <div class="card sticker">
        <div class="label display"><Emoji char="🔎" /> Расследование</div>
        <div v-if="phase.kind === 'caseSurvey'" class="crime display">Анкета для протокола</div>
        <div v-else class="crime display">{{ phase.crime }}</div>
        <div v-if="phase.kind === 'caseSurvey'" class="note">Ответьте на телефонах честно — это важно для следствия</div>
      </div>
      <TimerRing v-if="deadline" :deadline="deadline" :size="160" />
    </div>

    <div v-if="phase.kind !== 'caseSurvey'" class="board">
      <div class="clues">
        <div v-for="(c, i) in phase.clues" :key="i" class="clue sticker" :style="{ animationDelay: `${i * 0.1}s` }">
          <span class="n display">{{ i + 1 }}</span>
          <span>{{ c }}</span>
        </div>
      </div>
      <div v-if="culprit" class="culprit sticker">
        <span class="stamp display">Виновник</span>
        <Avatar :player="culprit" :code="view.code" :size="150" :ring="6" />
        <b class="display">{{ culprit.name }}</b>
        <b v-if="phase.kind === 'caseReveal' && phase.gains[culprit.id]" class="gain">+{{ phase.gains[culprit.id] }}</b>
      </div>
    </div>

    <PlayerRow v-if="phase.kind === 'caseSurvey'" :code="view.code" :players="players" :done="phase.done" :size="90" />
    <PlayerRow v-else-if="phase.kind === 'caseClue'" :code="view.code" :players="players" :done="phase.accused" :size="70" />
    <div v-else class="verdicts">
      <span v-for="v in verdicts" :key="v.player!.id" class="verdict" :class="{ right: v.right }">
        <Avatar :player="v.player!" :code="view.code" :size="40" :ring="2" />
        → <Avatar :player="v.suspect!" :code="view.code" :size="40" :ring="2" />
        <b v-if="v.gain" class="gain">+{{ v.gain }}</b>
      </span>
    </div>
  </div>
</template>

<style scoped>
.case {
  position: absolute;
  inset: 0;
  padding: 40px 150px 230px 90px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 22px 36px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 26px;
  color: var(--pink);
}

.crime {
  font-size: 50px;
  line-height: 1.1;
}

.note {
  font-size: 24px;
  font-weight: 800;
}

.board {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 40px;
  align-items: center;
}

.clues {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.clue {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 22px;
  font-size: 32px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.n {
  font-size: 40px;
  color: var(--pink);
}

.culprit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 30px;
  background: var(--yellow);
  rotate: 3deg;
  animation: pop-in 500ms 300ms both;
}

.stamp {
  font-size: 32px;
  color: var(--red);
}

.culprit b {
  font-size: 34px;
}

.verdicts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 26px;
}

.verdict {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  opacity: 0.6;
}

.verdict.right {
  opacity: 1;
}

.gain {
  font-size: 26px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
