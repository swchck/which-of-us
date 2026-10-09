<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'treasureReveal' ? view.value.phase : null));
const rows = computed(() => {
  const p = phase.value;
  if (!p) return [];
  const ids = [...Object.keys(p.haul), ...p.lost.filter((id) => !(id in p.haul))];
  return ids
    .map((id) => ({ player: playerById(id), gems: p.haul[id] ?? 0, lost: p.lost.includes(id), gain: p.gains[id] ?? 0 }))
    .filter((r) => r.player !== undefined)
    .sort((a, b) => b.gems - a.gems);
});
const richest = computed(() => rows.value[0]?.gems ?? 0);

onMounted(() => audio.sfx(richest.value > 0 ? 'fanfare' : 'buzz'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="richest > 0" :delay="0.8" :y="0.3" />
    <div class="title display"><span class="plate">Добыча экспедиции {{ phase.expedition }} из {{ phase.expeditions }}</span></div>
    <div class="rows">
      <div v-for="(r, i) in rows" :key="r.player!.id" class="row" :class="{ lost: r.lost, top: r.gems > 0 && r.gems === richest }" :style="{ animationDelay: `${0.3 + i * 0.12}s` }">
        <Avatar :player="r.player!" :code="view.code" :size="70" :ring="3" />
        <div class="name">{{ r.player!.name }}</div>
        <div class="gems">
          <template v-if="r.lost">
            <Emoji char="💥" :size="44" />
            <span class="note">всё осталось в пещере</span>
          </template>
          <template v-else>
            <Emoji v-for="n in Math.min(r.gems, 12)" :key="n" class="gem" char="💎" :size="38" :style="{ animationDelay: `${0.6 + i * 0.12 + n * 0.05}s` }" />
            <span v-if="r.gems > 12" class="more display">+{{ r.gems - 12 }}</span>
            <span v-if="r.gems === 0" class="note">с пустыми руками</span>
          </template>
        </div>
        <b class="gain display" :class="{ zero: !r.gain }">+{{ r.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 50px 120px 230px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.title {
  font-size: 52px;
  text-align: center;
  color: var(--yellow);
}

.rows {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.row {
  display: grid;
  grid-template-columns: 80px 280px 1fr 130px;
  align-items: center;
  gap: 18px;
  padding: 8px 20px;
  border-radius: 22px;
  background: rgba(18, 6, 42, 0.5);
  animation: pop-in 400ms both;
}

.row.top {
  outline: 5px solid var(--yellow);
  background: rgba(255, 210, 63, 0.22);
}

.row.lost {
  opacity: 0.75;
}

.name {
  font-size: 30px;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gems {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.gem {
  animation: pop-in 300ms both;
}

.more {
  margin-left: 8px;
  font-size: 30px;
}

.note {
  font-size: 24px;
  font-weight: 800;
  color: var(--muted);
}

.gain {
  font-size: 34px;
  color: var(--green);
  text-shadow: 0 3px 0 var(--ink);
  text-align: right;
}

.gain.zero {
  color: var(--muted);
}
</style>
