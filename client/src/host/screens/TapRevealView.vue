<script setup lang="ts">
import { computed } from 'vue';
import BarsReveal, { type BarRow } from '../parts/BarsReveal.vue';
import { playerById, view } from '../store';

const rows = computed<BarRow[]>(() => {
  const p = view.value?.phase;
  if (p?.kind !== 'tapReveal') return [];
  const best = Math.max(1, ...Object.values(p.counts));
  return Object.entries(p.counts)
    .flatMap(([id, n]) => {
      const player = playerById(id);
      return player ? [{ player, fill: n / best, label: `${n}`, icon: '👆', gain: p.gains[id] ?? 0, top: n === best && n > 0 }] : [];
    })
    .sort((a, b) => b.fill - a.fill);
});
</script>

<template>
  <BarsReveal title="Самые быстрые пальцы" :rows="rows" />
</template>
