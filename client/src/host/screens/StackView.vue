<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import { useCountdown } from '../../common/countdown';
import { socket, view } from '../store';

const MAX_LAYERS = 40;

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'stack' || p?.kind === 'stackReveal' ? p : null;
});
const live = computed(() => (phase.value?.kind === 'stack' ? phase.value : null));
const paused = computed(() => view.value?.paused ?? false);
const left = useCountdown(computed(() => live.value?.deadline), () => socket.now(), paused);

const cols = computed(() => {
  const p = phase.value;
  if (!p) return [];
  return (view.value?.players ?? [])
    .filter((pl) => pl.id in p.scores)
    .map((pl) => ({
      player: pl,
      score: p.scores[pl.id] ?? 0,
      fill: Math.min(1, (p.scores[pl.id] ?? 0) / MAX_LAYERS),
      gain: p.kind === 'stackReveal' ? p.gains[pl.id] : undefined,
    }));
});
</script>

<template>
  <div v-if="phase && view" class="stack" :class="{ frozen: paused }">
    <div class="title display">
      <Emoji char="🏗️" /> Башня
      <span v-if="live && left > 0" class="clock" :class="{ hurry: left <= 3 }">{{ left }} с</span>
      <span v-else-if="live" class="clock">Стоп!</span>
    </div>
    <div class="cols">
      <div v-for="c in cols" :key="c.player.id" class="col">
        <div class="track">
          <div
            class="fill"
            :style="{
              height: `${Math.max(2, c.fill * 100)}%`,
              background: PLAYER_COLORS[c.player.color],
            }"
          />
          <b class="num display">{{ c.score }}</b>
        </div>
        <Avatar :player="c.player" :code="view.code" :size="48" :ring="2" />
        <span class="name">{{ c.player.name }}</span>
        <b v-if="c.gain" class="gain">+{{ c.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stack {
  position: absolute;
  inset: 0;
  padding: 36px 100px 230px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 48px;
  color: var(--yellow);
}

.clock {
  font-size: 44px;
  color: #fff;
}

.clock.hurry {
  color: var(--red);
}

.cols {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  min-height: 0;
}

.col {
  flex: 1;
  max-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.track {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  border-radius: 16px 16px 0 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.fill {
  width: 100%;
  border-radius: 16px 16px 0 0;
  border: 4px solid var(--ink);
  transition: height 350ms ease-out;
  flex: none;
}

.num {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 3px 0 var(--ink);
}

.name {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 0 var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.gain {
  font-size: 28px;
  font-weight: 900;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
