<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'missions' ? view.value.phase : null));
const rows = computed(() =>
  (phase.value?.results ?? [])
    .map((r) => ({ ...r, player: playerById(r.player) }))
    .filter((r) => r.player !== undefined)
    .sort((a, b) => Number(b.done) - Number(a.done)),
);

onMounted(() => audio.sfx(rows.value.some((r) => r.done) ? 'fanfare' : 'whoosh'));
</script>

<template>
  <div v-if="phase && view" class="missions">
    <Confetti v-if="rows.some((r) => r.done)" :delay="1" :y="0.3" />
    <div class="title display plate"><Emoji char="🎯" /> Тайные миссии</div>
    <div class="grid" :class="{ few: rows.length <= 4 }">
      <div v-for="(r, i) in rows" :key="r.player!.id" class="row sticker" :class="{ done: r.done }" :style="{ animationDelay: `${0.3 + i * 0.18}s` }">
        <Avatar :player="r.player!" :code="view.code" :size="76" :ring="3" />
        <div class="text">
          <b>{{ r.player!.name }}</b>
          <span>{{ r.text }}</span>
        </div>
        <Emoji :char="r.done ? '✅' : '❌'" :size="52" />
        <b v-if="phase.gains[r.player!.id]" class="gain">+{{ phase.gains[r.player!.id] }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.missions {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.title {
  font-size: 56px;
  color: var(--yellow);
  animation: pop-in 400ms both;
}

.grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 30px;
}

.grid.few {
  grid-template-columns: minmax(0, 1100px);
  justify-content: center;
}

.row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 20px;
  animation: pop-in 450ms both;
}

.row:not(.done) {
  opacity: 0.75;
}

.text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.text b {
  font-size: 26px;
}

.gain {
  font-size: 30px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
