<script setup lang="ts">
import { computed, ref } from 'vue';
import { CLOVER_SIZE } from '../../../../shared/protocol';
import { answer, playerById, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'clover' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'clover' ? view.value.personal : null));
const author = computed(() => playerById(phase.value?.author));
/** Card index on each corner, clockwise from the top left; null while a corner is empty. */
const corners = ref<(number | null)[]>(Array.from({ length: CLOVER_SIZE }, () => null));
const active = ref(0);
const ready = computed(() => corners.value.every((c) => c !== null));
// corners sit clockwise from the top left, so the bottom row reads right to left
const GRID = [
  { corner: 0, area: 'tl' },
  { corner: 1, area: 'tr' },
  { corner: 3, area: 'bl' },
  { corner: 2, area: 'br' },
];

function place(card: number): void {
  const next = corners.value.map((c) => (c === card ? null : c));
  next[active.value] = card;
  corners.value = next;
  const empty = next.findIndex((c) => c === null);
  if (empty >= 0) active.value = empty;
}

function submit(): void {
  if (ready.value) answer(corners.value as number[]);
}
</script>

<template>
  <div v-if="phase && personal" class="clover">
    <Waiting v-if="personal.author" title="Это ваш клевер" note="Смотрите, как его разложат" icon="🍀" />
    <Waiting v-else-if="personal.answer" title="Клевер собран" note="Ждём остальных" icon="🍀" />
    <template v-else>
      <p class="tip">Клевер игрока {{ author?.name }}: выберите угол, потом слово</p>
      <div class="leaf">
        <span class="clue top display">{{ phase.clues[0] }}</span>
        <span class="clue right display">{{ phase.clues[1] }}</span>
        <span class="clue bottom display">{{ phase.clues[2] }}</span>
        <span class="clue left display">{{ phase.clues[3] }}</span>
        <button
          v-for="g in GRID"
          :key="g.corner"
          class="corner"
          :class="[g.area, { active: active === g.corner, filled: corners[g.corner] !== null }]"
          @click="active = g.corner"
        >
          {{ corners[g.corner] !== null ? phase.cards[corners[g.corner]!] : '?' }}
        </button>
      </div>
      <div class="cards">
        <button v-for="(card, i) in phase.cards" :key="card" class="card" :class="{ used: corners.includes(i) }" @click="place(i)">{{ card }}</button>
      </div>
      <button class="btn green" :disabled="!ready" @click="submit">Готово</button>
    </template>
  </div>
</template>

<style scoped>
.clover {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.leaf {
  display: grid;
  grid-template-columns: 34px 1fr 1fr 34px;
  grid-template-rows: auto 1fr 1fr auto;
  grid-template-areas:
    '. top top .'
    'left tl tr right'
    'left bl br right'
    '. bottom bottom .';
  gap: 6px;
  padding: 10px;
  border-radius: 28px;
  background: #3fae5a;
  border: var(--line) solid var(--ink);
}

.clue {
  display: grid;
  place-items: center;
  font-size: 18px;
  color: #fff;
  text-shadow: 0 2px 0 var(--ink);
  overflow-wrap: anywhere;
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
  min-height: 74px;
  padding: 6px;
  border-radius: 18px;
  border: 4px dashed var(--ink);
  background: rgba(255, 255, 255, 0.6);
  color: var(--ink);
  font: inherit;
  font-size: 17px;
  font-weight: 900;
  overflow-wrap: anywhere;
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

.corner.filled {
  border-style: solid;
  background: var(--paper);
}

.corner.active {
  box-shadow: 0 0 0 4px var(--yellow);
}

.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.card {
  padding: 10px 14px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 3px 0 var(--ink);
  font: inherit;
  font-size: 17px;
  font-weight: 900;
}

.card.used {
  opacity: 0.35;
}
</style>
