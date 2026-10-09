<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import SpectrumBar from '../parts/SpectrumBar.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'orderWrite' || p?.kind === 'orderSort' || p?.kind === 'orderReveal' ? p : null;
});
const seats = computed(() => {
  const p = phase.value;
  if (p?.kind !== 'orderWrite' && p?.kind !== 'orderSort') return [];
  const ids = p.kind === 'orderSort' ? p.cards.map((c) => c.player) : (view.value?.players ?? []).filter((pl) => pl.connected).map((pl) => pl.id);
  return ids.map((id) => ({ player: playerById(id), done: p.done.includes(id) })).filter((s) => s.player);
});
</script>

<template>
  <div v-if="phase && view" class="order">
    <div class="top">
      <div class="lead sticker">
        <template v-if="phase.kind === 'orderWrite'">
          <b>У каждого тайное число от 1 до 100</b>
          <span>Назовите то, что подходит вашему числу на шкале</span>
        </template>
        <template v-else-if="phase.kind === 'orderSort'">
          <b>Расставьте ответы по порядку</b>
          <span>От «{{ phase.left }}» к «{{ phase.right }}» — на телефонах</span>
        </template>
        <template v-else>
          <b>Правильный порядок</b>
          <span>🎯 — сколько человек поставили ответ точно на его место</span>
        </template>
      </div>
      <TimerRing v-if="phase.kind !== 'orderReveal'" :deadline="phase.deadline" :size="160" />
    </div>

    <SpectrumBar :left="phase.left" :right="phase.right" />

    <div v-if="phase.kind === 'orderSort'" class="cards">
      <div v-for="(c, i) in phase.cards" :key="c.player" class="chip sticker" :style="{ animationDelay: `${i * 0.08}s` }">
        <Avatar :player="playerById(c.player)!" :code="view.code" :size="48" :ring="2" />
        <span>{{ c.text }}</span>
      </div>
    </div>
    <div v-else-if="phase.kind === 'orderReveal'" class="row">
      <div v-for="(c, i) in phase.cards" :key="c.player" class="slot sticker" :style="{ animationDelay: `${0.3 + i * 0.35}s` }">
        <b class="num display">{{ c.number }}</b>
        <span class="t">{{ c.text }}</span>
        <Avatar :player="playerById(c.player)!" :code="view.code" :size="54" :ring="2" />
        <small v-if="c.exact">🎯 {{ c.exact }}</small>
        <b v-if="phase.gains[c.player]" class="gain">+{{ phase.gains[c.player] }}</b>
      </div>
    </div>

    <div v-if="phase.kind !== 'orderReveal'" class="who">
      <div v-for="s in seats" :key="s.player!.id" class="seat" :class="{ done: s.done }">
        <Avatar :player="s.player!" :code="view.code" :size="70" :ring="3" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.order {
  position: absolute;
  inset: 0;
  padding: 50px 120px 230px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.top {
  display: flex;
  align-items: center;
  gap: 40px;
}

.lead {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 22px 34px;
  font-size: 44px;
  font-weight: 900;
  animation: pop-in 400ms both;
}

.lead span {
  font-size: 26px;
  font-weight: 700;
  color: #6b5a99;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
}

.chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px 8px 10px;
  font-size: 30px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.row {
  display: flex;
  gap: 14px;
}

.slot {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  text-align: center;
  animation: pop-in 450ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.num {
  font-size: 46px;
  color: var(--pink);
}

.t {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.slot small {
  font-size: 20px;
  font-weight: 800;
}

.gain {
  font-size: 24px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.who {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.seat {
  opacity: 0.4;
  transition: opacity 300ms, transform 300ms;
}

.seat.done {
  opacity: 1;
  transform: translateY(-8px);
}
</style>
