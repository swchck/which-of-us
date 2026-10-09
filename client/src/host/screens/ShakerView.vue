<script setup lang="ts">
import { computed } from 'vue';
import { PLAYER_COLORS, SHAKER_POP_MAX } from '../../../../shared/protocol';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { useCountdown } from '../../common/countdown';
import { socket, view } from '../store';


const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'shaker' || p?.kind === 'shakerReveal' ? p : null;
});
const live = computed(() => (phase.value?.kind === 'shaker' ? phase.value : null));
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => live.value?.startsAt), () => socket.now(), paused);
const left = useCountdown(computed(() => live.value?.deadline), () => socket.now(), paused);
const balloons = computed(() => {
  const p = phase.value;
  if (!p) return [];
  return (view.value?.players ?? [])
    .filter((pl) => pl.id in p.sizes)
    .map((pl) => {
      const size = p.sizes[pl.id] ?? 0;
      return {
        player: pl,
        size,
        popped: p.popped.includes(pl.id),
        scale: 0.3 + Math.min(1, size / SHAKER_POP_MAX) * 0.85,
        gain: p.kind === 'shakerReveal' ? p.gains[pl.id] : undefined,
      };
    });
});
</script>

<template>
  <div v-if="phase && view" class="shaker">
    <div class="title display">
      <span class="plate"><Emoji char="🎈" /> Шейкер</span>
    </div>
    <div v-if="live && opensIn > 0" :key="opensIn" class="count display">{{ opensIn }}</div>
    <div v-else-if="live" class="clock display" :class="{ hurry: left <= 3 }">{{ left > 0 ? `${left} с` : 'Стоп!' }}</div>
    <div class="field">
      <div v-for="b in balloons" :key="b.player.id" class="slot">
        <div class="air">
          <span v-if="b.popped" class="burst">💥</span>
          <span v-else class="balloon" :style="{ '--c': PLAYER_COLORS[b.player.color], transform: `scale(${b.scale})` }" />
        </div>
        <span class="string" :class="{ limp: b.popped }" />
        <Avatar :player="b.player" :code="view.code" :size="90" :ring="3" />
        <span class="name">{{ b.player.name }}</span>
        <b v-if="b.gain" class="gain">+{{ b.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shaker {
  position: absolute;
  inset: 0;
  padding: 40px 120px 230px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  text-align: center;
  font-size: 48px;
  font-weight: 900;
  color: var(--yellow);
}

.count {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 300px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow: 0 14px 0 var(--ink);
  z-index: 2;
  animation: pop-in 600ms both;
}

.clock {
  align-self: center;
  font-size: 56px;
  font-weight: 900;
}

.clock.hurry {
  color: var(--red);
}

.field {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 30px;
}

.slot {
  width: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #fff;
  text-shadow: 0 3px 0 var(--ink);
}

.air {
  height: 330px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.balloon {
  width: 150px;
  height: 188px;
  flex: none;
  border: 6px solid var(--ink);
  border-radius: 50% 50% 48% 52% / 58% 58% 42% 42%;
  background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.75) 0 12%, transparent 13%), var(--c);
  transform-origin: 50% 100%;
  /* the size steps four times a second; easing on the compositor hides the steps without a repaint */
  transition: transform 260ms ease-out;
}

.burst {
  font-size: 150px;
  line-height: 1;
  animation: pop-in 300ms both;
}

.string {
  width: 4px;
  height: 40px;
  background: var(--ink);
}

.string.limp {
  rotate: 20deg;
}

.name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 24px;
  font-weight: 900;
}

.gain {
  font-size: 30px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
  text-shadow: none;
}
</style>
