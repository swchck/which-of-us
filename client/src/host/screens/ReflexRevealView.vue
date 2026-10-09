<script setup lang="ts">
import { computed } from 'vue';
import BarsReveal, { type BarRow } from '../parts/BarsReveal.vue';
import { playerById, view } from '../store';

const rows = computed<BarRow[]>(() => {
  const p = view.value?.phase;
  if (p?.kind !== 'reflexReveal') return [];
  const times = Object.values(p.best).filter((ms): ms is number => ms !== null);
  const fastest = Math.min(...times);
  return Object.entries(p.best)
    .flatMap(([id, ms]) => {
      const player = playerById(id);
      if (!player) return [];
      const fill = ms === null ? 0 : fastest / ms;
      return [{ player, fill, label: ms === null ? 'мимо' : `${ms} мс`, gain: p.gains[id] ?? 0, top: ms === fastest }];
    })
    .sort((a, b) => b.fill - a.fill);
});
</script>

<template>
  <BarsReveal title="Самая быстрая реакция" :rows="rows" />
</template>
