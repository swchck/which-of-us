<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'simon' || p?.kind === 'simonReveal' ? p : null;
});
const people = (ids: string[]) => ids.map((id) => playerById(id)).filter((p) => p !== undefined);
</script>

<template>
  <div v-if="phase && view" class="simon">
    <Confetti v-if="phase.kind === 'simonReveal' && phase.alive.length" :delay="0.6" :y="0.4" />
    <template v-if="phase.kind === 'simon'">
      <div class="step ribbon">Команда {{ phase.step }} из {{ phase.steps }}</div>
      <div :key="phase.step" class="command sticker display">{{ phase.command }}</div>
    </template>
    <div v-else class="command sticker display">{{ phase.alive.length ? 'Выстояли!' : 'Все попались!' }}</div>
    <div class="crowd">
      <div v-for="p in people(phase.alive)" :key="p.id" class="face">
        <Avatar :player="p" :code="view.code" :size="110" :ring="4" />
        <b v-if="phase.kind === 'simonReveal' && phase.gains[p.id]" class="gain">+{{ phase.gains[p.id] }}</b>
      </div>
      <div v-for="p in people(phase.out)" :key="p.id" class="face out">
        <Avatar :player="p" :code="view.code" :size="80" :ring="3" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.simon {
  position: absolute;
  inset: 0;
  padding: 60px 170px 230px 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 34px;
}

.step {
  font-size: 28px;
}

.command {
  padding: 40px 70px;
  font-size: 84px;
  line-height: 1.05;
  text-align: center;
  animation: drop 450ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

.crowd {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 18px;
}

.face {
  position: relative;
}

.face.out {
  opacity: 0.4;
  filter: grayscale(1);
}

.gain {
  position: absolute;
  right: -10px;
  bottom: -6px;
  font-size: 26px;
  color: var(--green);
  text-shadow: 0 2px 0 var(--ink);
}
</style>
