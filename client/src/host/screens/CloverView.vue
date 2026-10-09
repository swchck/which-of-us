<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'clover' || p?.kind === 'cloverReveal' ? p : null;
});
const author = computed(() => playerById(phase.value?.author));
const guessers = computed(() => view.value?.players.filter((p) => p.connected && p.id !== phase.value?.author) ?? []);
// corners go clockwise from the top left, so the grid lists the bottom row right to left
const GRID = [
  { corner: 0, area: 'tl' },
  { corner: 1, area: 'tr' },
  { corner: 3, area: 'bl' },
  { corner: 2, area: 'br' },
];
const scores = computed(() => {
  const p = phase.value;
  if (p?.kind !== 'cloverReveal') return [];
  return Object.entries(p.picks)
    .map(([id, pick]) => ({ player: playerById(id), right: pick.filter((c, k) => p.cards[c] === p.words[k]).length, gain: p.gains[id] ?? 0 }))
    .filter((s) => s.player)
    .sort((a, b) => b.right - a.right);
});
</script>

<template>
  <div v-if="phase && view" class="clover">
    <div class="side">
      <div class="who sticker">
        <Avatar v-if="author" :player="author" :code="view.code" :size="110" :ring="4" />
        <span class="display">Клевер игрока {{ author?.name }}</span>
        <small v-if="phase.kind === 'clover'">{{ phase.round }} из {{ phase.rounds }}</small>
      </div>
      <TimerRing v-if="phase.kind === 'clover'" :deadline="phase.deadline" :size="150" />
      <div v-else class="scores">
        <div v-for="s in scores" :key="s.player!.id" class="score sticker">
          <Avatar :player="s.player!" :code="view.code" :size="48" :ring="3" />
          <span class="display">{{ s.right }} из 4</span>
          <b v-if="s.gain" class="gain">+{{ s.gain }}</b>
        </div>
      </div>
    </div>

    <div class="board">
      <div class="leaf">
        <span v-for="(c, k) in phase.clues" :key="k" class="clue display" :class="['top', 'right', 'bottom', 'left'][k]">{{ c }}</span>
        <div v-for="g in GRID" :key="g.corner" class="corner display" :class="[g.area, { known: phase.kind === 'cloverReveal' }]">
          {{ phase.kind === 'cloverReveal' ? phase.words[g.corner] : '?' }}
        </div>
      </div>
      <div class="cards">
        <span
          v-for="card in phase.cards"
          :key="card"
          class="card sticker"
          :class="{ decoy: phase.kind === 'cloverReveal' && !phase.words.includes(card) }"
        >{{ card }}</span>
      </div>
      <PlayerRow v-if="phase.kind === 'clover'" :code="view.code" :players="guessers" :done="phase.done" :size="70" />
    </div>
  </div>
</template>

<style scoped>
.clover {
  position: absolute;
  inset: 0;
  padding: 40px 120px 230px 90px;
  display: flex;
  gap: 50px;
}

.side {
  width: 330px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.who {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 20px;
  font-size: 30px;
  text-align: center;
  animation: pop-in 500ms both;
}

.who small {
  font-size: 22px;
  font-weight: 800;
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.score {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 14px;
  font-size: 26px;
  animation: pop-in 400ms both;
}

.gain {
  margin-left: auto;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.board {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.leaf {
  width: 760px;
  display: grid;
  grid-template-columns: 70px 1fr 1fr 70px;
  grid-template-rows: 70px 150px 150px 70px;
  grid-template-areas:
    '. top top .'
    'left tl tr right'
    'left bl br right'
    '. bottom bottom .';
  gap: 12px;
  padding: 14px;
  border-radius: 60px;
  background: #3fae5a;
  border: 6px solid var(--ink);
  box-shadow: var(--shadow);
}

.clue {
  display: grid;
  place-items: center;
  font-size: 40px;
  color: #fff;
  text-shadow: 0 4px 0 var(--ink);
  text-align: center;
}

.clue.top {
  grid-area: top;
}

.clue.bottom {
  grid-area: bottom;
}

.clue.left,
.clue.right {
  writing-mode: vertical-rl;
}

.clue.left {
  grid-area: left;
  rotate: 180deg;
}

.clue.right {
  grid-area: right;
}

.corner {
  display: grid;
  place-items: center;
  padding: 10px;
  border-radius: 30px;
  border: 5px dashed var(--ink);
  background: rgba(255, 255, 255, 0.55);
  font-size: 40px;
  text-align: center;
  overflow-wrap: anywhere;
}

.corner.known {
  border-style: solid;
  background: var(--paper);
  animation: pop-in 400ms both;
}

.corner.tl {
  grid-area: tl;
}

.corner.tr {
  grid-area: tr;
}

.corner.bl {
  grid-area: bl;
}

.corner.br {
  grid-area: br;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
}

.card {
  padding: 10px 22px;
  font-size: 30px;
  font-weight: 900;
}

.card.decoy {
  opacity: 0.45;
  text-decoration: line-through;
}
</style>
