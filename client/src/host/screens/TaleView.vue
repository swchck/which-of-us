<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import InkView from '../../common/InkView.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'taleVote' || p?.kind === 'taleReveal' ? p : null;
});
const teller = computed(() => playerById(phase.value?.teller));
const voters = computed(() => view.value?.players.filter((p) => p.connected && p.id !== phase.value?.teller) ?? []);
const cards = computed(() => {
  const p = phase.value;
  if (!p) return [];
  if (p.kind === 'taleVote') return p.items.map((c) => ({ ...c, author: undefined, votes: [], truth: false }));
  return p.items.map((c) => ({
    ...c,
    author: playerById(c.author),
    votes: c.votes.map((id) => playerById(id)).filter((pl) => pl !== undefined),
    truth: c.id === p.truth,
  }));
});
/** Card width: two rows from five drawings up, so eight still fit above the bottom bar. */
const width = computed(() => (cards.value.length > 4 ? 300 : 360));
</script>

<template>
  <div v-if="phase && view" class="tale">
    <div class="top">
      <div class="clue sticker">
        <div class="label display"><Emoji char="📖" /> Сказочник<template v-if="phase.kind === 'taleVote'"> · {{ phase.round }} из {{ phase.rounds }}</template></div>
        <div class="text display">«{{ phase.clue }}»</div>
        <div class="who">
          <Avatar v-if="teller" :player="teller" :code="view.code" :size="44" :ring="3" />
          <span>{{ phase.kind === 'taleVote' ? `Подсказка от ${teller?.name}. Какой рисунок её?` : `Рисунок рассказчика: ${teller?.name}` }}</span>
        </div>
      </div>
      <TimerRing v-if="phase.kind === 'taleVote'" :deadline="phase.deadline" :size="150" />
    </div>
    <div class="cards">
      <div v-for="(c, i) in cards" :key="c.id" class="card" :class="{ truth: c.truth, dim: phase.kind === 'taleReveal' && !c.truth }" :style="{ width: `${width}px`, animationDelay: `${i * 0.06}s` }">
        <div class="pic sticker">
          <InkView :code="view.code" :board="c.board" :ink="c.ink" />
          <span class="num display">{{ i + 1 }}</span>
        </div>
        <div v-if="phase.kind === 'taleReveal'" class="meta">
          <Avatar v-if="c.author" :player="c.author" :code="view.code" :size="40" :ring="3" />
          <span class="votes">
            <Avatar v-for="v in c.votes" :key="v.id" :player="v" :code="view.code" :size="28" :ring="2" />
          </span>
          <b v-if="c.author && phase.gains[c.author.id]" class="gain">+{{ phase.gains[c.author.id] }}</b>
        </div>
      </div>
    </div>
    <PlayerRow v-if="phase.kind === 'taleVote'" :code="view.code" :players="voters" :done="phase.voted" :size="60" />
  </div>
</template>

<style scoped>
.tale {
  position: absolute;
  inset: 0;
  padding: 36px 90px 230px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.top {
  display: flex;
  align-items: center;
  gap: 30px;
}

.clue {
  flex: 1;
  padding: 18px 32px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 24px;
  color: var(--pink);
}

.text {
  font-size: 50px;
  line-height: 1.1;
}

.who {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  font-size: 22px;
  font-weight: 800;
}

.cards {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  gap: 16px 20px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: pop-in 400ms both;
}

.pic {
  position: relative;
  padding: 0;
  overflow: hidden;
}

.num {
  position: absolute;
  top: 6px;
  left: 10px;
  font-size: 30px;
}

.card.truth .pic {
  box-shadow:
    0 0 0 8px var(--green),
    var(--shadow);
}

.card.dim {
  opacity: 0.8;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.votes {
  display: flex;
  gap: 2px;
}

.gain {
  margin-left: auto;
  font-size: 24px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
