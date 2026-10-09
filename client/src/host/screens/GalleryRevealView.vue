<script setup lang="ts">
import OriginalThumb from '../parts/OriginalThumb.vue';
import Emoji from '../../common/Emoji.vue';
import Confetti from '../../common/Confetti.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import ItemCard from '../parts/ItemCard.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'galleryReveal' ? view.value.phase : null));

const cards = computed(() => {
  const p = phase.value;
  if (!p) return [];
  return p.items.map((item) => ({
    item,
    winner: p.winners.includes(item.id),
    votes: (p.votes[item.id] ?? []).map((id) => playerById(id)).filter((x) => x !== undefined),
    authors: item.authors.map((id) => playerById(id)).filter((x) => x !== undefined),
  }));
});

const height = computed(() => {
  const items = phase.value?.items ?? [];
  const tall = items.some((i) => i.board && i.board.h > i.board.w * 1.5);
  const n = items.length;
  if (tall) return n <= 4 ? 430 : 360;
  return n <= 3 ? 400 : n <= 4 ? 340 : n <= 6 ? 270 : 220;
});

onMounted(() => {
  if (phase.value?.items.length) audio.sfx(phase.value.winners.length ? 'fanfare' : 'ding');
});
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="phase.winners.length" :delay="0.5" />
    <div class="top">
      <div class="prompt plate">{{ phase.prompt }}</div>
      <OriginalThumb v-if="phase.original" :code="view.code" :picture="phase.original" :height="110" />
    </div>
    <div class="grid">
      <div v-for="(c, i) in cards" :key="c.item.id" class="cell" :class="{ winner: c.winner }" :style="{ animationDelay: `${i * 0.1}s` }">
        <Emoji v-if="c.winner" class="crown" char="👑" />
        <ItemCard :item="c.item" :code="view.code" :height="c.winner ? height * 1.12 : height" />
        <div class="authors">
          <Avatar v-for="a in c.authors" :key="a.id" :player="a" :code="view.code" :size="44" :ring="3" />
          <span v-if="c.authors.length === 1" class="names" :style="{ '--len': c.authors[0]!.name.length }">{{ c.authors[0]!.name }}</span>
        </div>
        <div class="votes">
          <span v-if="c.votes.length" class="n display">{{ c.votes.length }} <Emoji char="🗳️" /></span>
          <Avatar v-for="v in c.votes" :key="v.id" :player="v" :code="view.code" :size="32" :ring="2" />
          <span v-if="phase.crowd?.pick === c.item.id" class="fans display">❤ {{ phase.crowd?.votes }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fans {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--pink);
  color: #fff;
  font-size: 18px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.reveal {
  position: absolute;
  inset: 0;
  padding: 40px 60px 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.prompt {
  font-size: 36px;
  font-weight: 900;
  text-shadow: 0 4px 0 var(--ink);
  text-align: center;
}

.grid {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  align-items: flex-end;
  gap: 24px 34px;
}

.cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: pop-in 450ms both;
}

.cell:not(.winner) {
  opacity: 0.85;
}

.winner :deep(.card) {
  box-shadow:
    0 6px 0 var(--ink),
    0 0 0 8px var(--yellow),
    0 0 60px 10px rgba(255, 210, 63, 0.5);
}

.crown {
  position: absolute;
  top: -58px;
  z-index: 3;
  font-size: 64px;
  animation: pop-in 600ms 400ms both;
}

.authors {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 300px;
}

.names {
  font-size: clamp(16px, calc(264px / var(--len, 1)), 22px);
  font-weight: 900;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.votes {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
}

.n {
  font-size: 22px;
  font-weight: 800;
  color: var(--yellow);
  margin-right: 6px;
}
</style>
