<script setup lang="ts">
import OriginalThumb from '../parts/OriginalThumb.vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { audio } from '../../common/audio';
import ItemCard from '../parts/ItemCard.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { socket, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'gallery' ? view.value.phase : null));
const now = ref(socket.now());
const timer = setInterval(() => {
  if (!view.value?.paused) now.value = socket.now();
}, 150);
onBeforeUnmount(() => clearInterval(timer));

const per = computed(() => {
  const p = phase.value;
  if (!p || p.items.length === 0) return 1;
  return Math.max(1, (p.votingFrom - p.showFrom) / p.items.length);
});
const voting = computed(() => phase.value !== null && now.value >= phase.value.votingFrom);
const index = computed(() => Math.min((phase.value?.items.length ?? 1) - 1, Math.floor((now.value - (phase.value?.showFrom ?? 0)) / per.value)));
const current = computed(() => phase.value?.items[Math.max(0, index.value)]);
const voters = computed(() => view.value?.players.filter((p) => p.connected) ?? []);

const gridHeight = computed(() => {
  const items = phase.value?.items ?? [];
  const tall = items.some((i) => i.board && i.board.h > i.board.w * 1.5);
  const n = items.length;
  if (tall) return n <= 4 ? 470 : 400;
  return n <= 4 ? 380 : n <= 6 ? 300 : 240;
});
const showHeight = computed(() => {
  const b = current.value?.board;
  return b && b.h > b.w * 1.5 ? 740 : 660;
});

watch(index, () => audio.sfx('whoosh'));
watch(voting, (v) => v && audio.sfx('ding'));
</script>

<template>
  <div v-if="phase && view" class="gallery">
    <div class="top">
      <div class="head plate">
        <div class="label display">{{ voting ? 'Голосуйте на телефонах!' : 'Выставка' }}</div>
        <div class="prompt">{{ phase.prompt }}</div>
      </div>
      <OriginalThumb v-if="phase.original" :code="view.code" :picture="phase.original" :height="110" />
    </div>

    <div v-if="!voting && current" :key="current.id" class="show">
      <div class="num display">№{{ index + 1 }}</div>
      <ItemCard class="big" :item="current" :code="view.code" :height="showHeight" :replay="per * 0.75" />
    </div>

    <template v-else>
      <div class="grid">
        <div v-for="(item, i) in phase.items" :key="item.id" class="cell" :style="{ animationDelay: `${i * 0.08}s` }">
          <ItemCard :item="item" :code="view.code" :height="gridHeight">
            <div class="badge display">{{ i + 1 }}</div>
          </ItemCard>
        </div>
      </div>
      <div class="foot">
        <PlayerRow :code="view.code" :players="voters" :done="phase.voted" :size="70" />
        <TimerRing v-if="phase.items.length > 1" :deadline="phase.deadline" :size="120" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.gallery {
  position: absolute;
  inset: 0;
  padding: 30px 70px 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.head {
  text-align: center;
}

.label {
  font-size: 24px;
  font-weight: 800;
  color: var(--yellow);
  text-shadow: 0 3px 0 var(--ink);
}

.prompt {
  font-size: 38px;
  font-weight: 900;
  text-shadow: 0 4px 0 var(--ink);
  max-width: 1600px;
}

.show {
  position: relative;
  flex: 1;
  display: grid;
  place-items: center;
  animation: swing-in 600ms cubic-bezier(0.2, 1.3, 0.4, 1) both;
}

.big {
  transform: rotate(-1deg);
}

.num {
  position: absolute;
  top: 0;
  left: -110px;
  z-index: 2;
  width: 100px;
  height: 100px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--yellow);
  color: var(--ink);
  border: 5px solid var(--ink);
  font-size: 34px;
  font-weight: 900;
  transform: rotate(-10deg);
}

.grid {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  gap: 26px;
}

.cell {
  animation: pop-in 450ms both;
}

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--yellow);
  border: 4px solid var(--ink);
  font-size: 24px;
  font-weight: 900;
}

.foot {
  display: flex;
  align-items: center;
  gap: 40px;
}

@keyframes swing-in {
  from {
    transform: translateX(1200px) rotate(20deg);
  }
  to {
    transform: none;
  }
}
</style>
