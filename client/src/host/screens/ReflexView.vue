<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed, watch } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'reflex' ? view.value.phase : null));
const players = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
const podium = computed(() =>
  (phase.value?.last ?? [])
    .filter((r) => r.ms !== null)
    .slice(0, 3)
    .flatMap((r) => {
      const player = playerById(r.player);
      return player ? [{ player, ms: r.ms }] : [];
    }),
);

watch(
  () => phase.value?.stage,
  (stage) => {
    if (stage === 'go') audio.sfx('ding');
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="phase && view" class="reflex" :class="phase.stage">
    <div class="round display"><span class="plate"><Emoji char="⚡" /> Кто быстрее? · раунд {{ phase.round }} из {{ phase.rounds }}</span></div>
    <div class="signal display">
      <span v-if="phase.stage === 'wait'">Ждите…</span>
      <span v-else-if="phase.stage === 'decoy'">Не жми!</span>
      <span v-else>ЖМИ!</span>
    </div>
    <div class="bottom">
      <div v-if="podium.length && phase.stage !== 'go'" class="last">
        <div class="cap">Прошлый раунд</div>
        <div v-for="(r, i) in podium" :key="r.player.id" class="place">
          <b class="display">{{ i + 1 }}</b>
          <Avatar :player="r.player" :code="view.code" :size="54" :ring="3" />
          <span>{{ r.ms }} мс</span>
        </div>
      </div>
      <PlayerRow v-else :code="view.code" :players="players" :done="phase.tapped" :size="110" />
    </div>
  </div>
</template>

<style scoped>
.reflex {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.round {
  font-size: 34px;
  font-weight: 900;
}

.signal {
  width: 520px;
  height: 520px;
  border-radius: 50%;
  border: 10px solid var(--ink);
  display: grid;
  place-items: center;
  font-size: 92px;
  font-weight: 900;
  box-shadow: 0 14px 0 var(--ink);
  background: #ff3b5c;
  color: #fff;
  text-shadow: 0 6px 0 var(--ink);
}

.go .signal {
  background: var(--green);
}

.decoy .signal {
  background: #3b8bff;
  font-size: 80px;
}

.go .signal span,
.decoy .signal span {
  animation: pop-in 260ms both;
}

.bottom {
  min-height: 170px;
  display: flex;
  align-items: center;
}

.last {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 14px 28px;
  border-radius: 22px;
  background: rgba(18, 6, 42, 0.85);
  font-size: 28px;
  font-weight: 800;
}

.cap {
  color: var(--muted);
}

.place {
  display: flex;
  align-items: center;
  gap: 10px;
}

.place b {
  color: var(--yellow);
}
</style>
