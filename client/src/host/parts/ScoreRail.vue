<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Avatar from '../../common/Avatar.vue';
import { teamTotals } from '../../common/teams';
import type { PublicPlayer } from '../../../../shared/protocol';
import { view } from '../store';

const players = computed(() => [...(view.value?.players ?? [])].sort((a, b) => b.score - a.score));
const teams = computed(() => teamTotals(view.value?.players ?? []));
type Row = { key: string; team: ReturnType<typeof teamTotals>[number] } | { key: string; player: PublicPlayer };
const rows = computed<Row[]>(() =>
  teams.value.length
    ? teams.value.flatMap((t) => [{ key: `team${t.team}`, team: t }, ...[...t.members].sort((a, b) => b.score - a.score).map((p) => ({ key: p.id, player: p }))])
    : players.value.map((p) => ({ key: p.id, player: p })),
);
const top = computed(() => players.value[0]?.score ?? 0);
// a score that just grew flashes its plus for a moment, so the room sees who scored without reading numbers
const bumped = ref<Record<string, number>>({});
const timers = new Map<string, ReturnType<typeof setTimeout>>();
watch(
  () => Object.fromEntries((view.value?.players ?? []).map((p) => [p.id, p.score])),
  (now, before) => {
    for (const [id, score] of Object.entries(now)) {
      const gain = score - (before?.[id] ?? score);
      if (gain <= 0) continue;
      bumped.value = { ...bumped.value, [id]: gain };
      clearTimeout(timers.get(id));
      timers.set(id, setTimeout(() => {
        const rest = { ...bumped.value };
        delete rest[id];
        bumped.value = rest;
      }, 2500));
    }
  },
);
</script>

<template>
  <TransitionGroup v-if="view" tag="div" name="rail" class="rail" aria-label="Очки">
    <template v-for="r in rows" :key="r.key">
      <div v-if="'team' in r" class="team" :style="{ '--tc': r.team.color }">
        <span>{{ r.team.icon }}</span>
        <b>{{ r.team.score }}</b>
      </div>
      <div v-else class="seat" :class="{ lead: !teams.length && r.player.score > 0 && r.player.score === top, away: !r.player.connected }">
        <Avatar :player="r.player" :code="view.code" :size="teams.length ? 48 : 58" :ring="3" />
        <b class="score">{{ r.player.score }}</b>
        <span v-if="bumped[r.player.id]" class="plus">+{{ bumped[r.player.id] }}</span>
      </div>
    </template>
  </TransitionGroup>
</template>

<style scoped>
.rail {
  position: absolute;
  top: 50%;
  right: 14px;
  z-index: 4;
  translate: 0 -50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 6px;
  border: 3px solid var(--ink);
  border-radius: 14px;
  background: var(--tc);
  color: #fff;
  font-size: 22px;
  font-weight: 900;
  -webkit-text-stroke: 3px var(--ink);
  paint-order: stroke;
}

.seat {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.seat.away {
  opacity: 0.45;
  filter: grayscale(1);
}

.score {
  min-width: 56px;
  padding: 0 6px;
  border-radius: 10px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-size: 17px;
  font-weight: 900;
  text-align: center;
}

.lead .score {
  background: var(--yellow);
}

.plus {
  position: absolute;
  top: 6px;
  right: 64px;
  font-size: 24px;
  font-weight: 900;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
  white-space: nowrap;
  animation: pop-in 400ms both;
}

.rail-move {
  transition: transform 600ms cubic-bezier(0.3, 1.3, 0.5, 1);
}
</style>
