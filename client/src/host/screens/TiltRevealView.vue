<script setup lang="ts">
import { computed } from 'vue';
import { TEAM_INFO } from '../../../../shared/catalog';
import BarsReveal, { type BarRow } from '../parts/BarsReveal.vue';
import { playerById, view } from '../store';

const rows = computed<BarRow[]>(() => {
  const p = view.value?.phase;
  if (p?.kind !== 'tiltReveal') return [];
  const best = Math.max(1, ...Object.values(p.stars));
  return Object.entries(p.stars)
    .flatMap(([id, n]) => {
      const player = playerById(id);
      const team = p.teams?.[id];
      const icon = team === undefined ? '⭐' : TEAM_INFO[team].icon;
      const top = p.teams ? p.winner === team : n === best && n > 0;
      return player ? [{ player, fill: n / best, label: `${n}`, icon, gain: p.gains[id] ?? 0, top }] : [];
    })
    .sort((a, b) => b.fill - a.fill);
});
const title = computed(() => {
  const p = view.value?.phase;
  if (p?.kind !== 'tiltReveal' || !p.teamStars) return 'Итоги звездопада';
  const score = `${TEAM_INFO[0].title} ${p.teamStars[0]} : ${p.teamStars[1]} ${TEAM_INFO[1].title}`;
  return p.winner == null ? `Ничья · ${score}` : `Победа: ${TEAM_INFO[p.winner].title} · ${score}`;
});
</script>

<template>
  <BarsReveal :title="title" :rows="rows" />
</template>
