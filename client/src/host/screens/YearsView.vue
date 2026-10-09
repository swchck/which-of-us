<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'years' || p?.kind === 'yearsReveal' ? p : null;
});
const players = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
const winners = computed(() => {
  const p = phase.value;
  return p?.kind === 'yearsReveal' ? Object.keys(p.gains).map((id) => playerById(id)).filter((pl) => pl !== undefined) : [];
});
</script>

<template>
  <div v-if="phase && view" class="years">
    <div class="top">
      <div class="event sticker">
        <div class="label display"><Emoji char="⏱" /> В каком году?<template v-if="phase.kind === 'years'"> · {{ phase.round }} из {{ phase.rounds }}</template></div>
        <div class="e display">{{ phase.event }}</div>
        <div v-if="phase.kind === 'yearsReveal'" class="year display">{{ phase.year }}</div>
      </div>
      <TimerRing v-if="phase.kind === 'years'" :deadline="phase.deadline" :size="170" />
    </div>

    <div class="line">
      <div
        v-for="(card, i) in phase.timeline"
        :key="card.e"
        class="card sticker"
        :class="{ fresh: phase.kind === 'yearsReveal' && i === phase.slot }"
      >
        <b class="display">{{ card.year }}</b>
        <span>{{ card.e }}</span>
      </div>
    </div>

    <PlayerRow v-if="phase.kind === 'years'" :code="view.code" :players="players" :done="phase.done" :size="80" />
    <div v-else class="winners">
      <template v-if="winners.length">
        <div v-for="pl in winners" :key="pl.id" class="winner">
          <Avatar :player="pl" :code="view.code" :size="80" :ring="3" />
          <b class="gain">+{{ phase.gains[pl.id] }}</b>
        </div>
      </template>
      <span v-else class="none display">Никто не угадал</span>
    </div>
  </div>
</template>

<style scoped>
.years {
  position: absolute;
  inset: 0;
  padding: 44px 120px 230px 90px;
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.event {
  flex: 1;
  padding: 22px 36px;
  background: var(--yellow);
  animation: pop-in 500ms both;
}

.label {
  font-size: 26px;
  color: var(--pink);
}

.e {
  font-size: 50px;
  line-height: 1.1;
}

.year {
  font-size: 72px;
  color: var(--pink);
  animation: pop-in 500ms 200ms both;
}

.line {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.card b {
  font-size: 36px;
}

.card.fresh {
  background: var(--green);
  animation: pop-in 500ms both;
}

.winners {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.winner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.gain {
  font-size: 28px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.none {
  font-size: 40px;
  color: #fff;
  text-shadow: 0 4px 0 var(--ink);
}
</style>
