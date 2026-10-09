<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'brawlReveal' ? view.value.phase : null));
const rows = computed(() => (phase.value?.ranking ?? []).map((r) => ({ ...r, player: playerById(r.player) })).filter((r) => r.player));
const MEDALS = ['🥇', '🥈', '🥉'];
const TITLES = { sumo: 'Итоги сумо', tag: 'Итоги квача', paint: 'Итоги захвата' } as const;
</script>

<template>
  <div v-if="phase && view" class="brawl">
    <h2 class="display">{{ TITLES[phase.mode] }}</h2>
    <div class="rows">
      <div v-for="(r, i) in rows" :key="r.player!.id" class="row sticker" :class="{ first: r.place === 1 }" :style="{ animationDelay: `${0.2 + i * 0.15}s` }">
        <span class="place display"><Emoji v-if="MEDALS[r.place - 1]" :char="MEDALS[r.place - 1]!" /><template v-else>{{ r.place }}</template></span>
        <Avatar :player="r.player!" :code="view.code" :size="70" :ring="3" />
        <span class="name">{{ r.player!.name }}</span>
        <span class="what">
          <template v-if="phase.mode === 'tag'">не водили {{ r.seconds }} с</template>
          <template v-else-if="phase.mode === 'paint'">закрасили {{ r.area ?? 0 }}%</template>
          <template v-else-if="r.knockouts">столкнули: {{ r.knockouts }}</template>
        </span>
        <b v-if="phase.gains[r.player!.id]" class="gain">+{{ phase.gains[r.player!.id] }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.brawl {
  position: absolute;
  inset: 0;
  padding: 40px 260px 230px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h2 {
  margin: 0;
  text-align: center;
  font-size: 64px;
  color: var(--yellow);
  -webkit-text-stroke: 8px var(--ink);
  paint-order: stroke;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 8px 24px;
  font-size: 30px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.row.first {
  background: var(--yellow);
}

.place {
  width: 56px;
  text-align: center;
  font-size: 36px;
}

.name {
  flex: 1;
}

.what {
  font-size: 22px;
  color: #6b5a99;
}

.gain {
  font-size: 32px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
