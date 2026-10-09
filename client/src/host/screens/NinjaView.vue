<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { useCountdown } from '../../common/countdown';
import { useInFlight } from '../../common/flight';
import { socket, view } from '../store';

/** Lane height in TV pixels; the arc peaks at 80% of it. */
const LANE_H = 520;

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'ninja' || p?.kind === 'ninjaReveal' ? p : null;
});
const live = computed(() => (phase.value?.kind === 'ninja' ? phase.value : null));
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => live.value?.startsAt), () => socket.now(), paused);
const left = useCountdown(computed(() => live.value?.deadline), () => socket.now(), paused);
// every lane flies the same schedule, so one window feeds them all
const flying = useInFlight(
  computed(() => live.value?.fruits ?? []),
  (f) => (live.value?.startsAt ?? 0) + f.at,
  (f) => f.flight,
  () => socket.now(),
  paused,
);
const lanes = computed(() => {
  const p = phase.value;
  if (!p) return [];
  return (view.value?.players ?? [])
    .filter((pl) => pl.id in p.scores)
    .map((pl) => ({
      player: pl,
      score: p.scores[pl.id] ?? 0,
      bombs: p.kind === 'ninjaReveal' ? (p.bombs[pl.id] ?? 0) : 0,
      gain: p.kind === 'ninjaReveal' ? p.gains[pl.id] : undefined,
    }));
});
</script>

<template>
  <div v-if="phase && view" class="ninja" :class="{ frozen: paused }">
    <div class="title display">
      <Emoji char="🥑" /> Фруктовый ниндзя
      <span v-if="live && opensIn <= 0" class="clock" :class="{ hurry: left <= 3 }">{{ left > 0 ? `${left} с` : 'Стоп!' }}</span>
    </div>
    <div v-if="live && opensIn > 0" :key="opensIn" class="count display">{{ opensIn }}</div>
    <div class="lanes">
      <div v-for="l in lanes" :key="l.player.id" class="col">
        <div class="lane" :style="{ height: `${LANE_H}px`, '--h': `${LANE_H}px` }">
          <span
            v-for="f in live ? flying : []"
            :key="f.id"
            class="fruit"
            :style="{ left: `${f.x * 100}%`, animationDuration: `${f.flight}ms`, animationDelay: `${f.delay}ms` }"
          >{{ f.kind }}</span>
        </div>
        <div class="who">
          <Avatar :player="l.player" :code="view.code" :size="64" :ring="3" />
          <b class="display">{{ l.score }}</b>
        </div>
        <span v-if="l.bombs" class="bombs">💣 × {{ l.bombs }}</span>
        <b v-if="l.gain" class="gain">+{{ l.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ninja {
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

.count {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 300px;
  color: var(--yellow);
  text-shadow: 0 14px 0 var(--ink);
  z-index: 2;
  animation: pop-in 600ms both;
}

.lanes {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.col {
  flex: 1;
  max-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.lane {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 24px;
  border: 5px solid var(--ink);
  background: linear-gradient(#2c1a5c, #12062a);
}

.fruit {
  position: absolute;
  bottom: -60px;
  margin-left: -28px;
  font-size: 56px;
  line-height: 1;
  animation-name: arc;
  animation-fill-mode: both;
  will-change: transform;
}

@keyframes arc {
  0% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
  }
  50% {
    transform: translateY(calc(var(--h) * -0.8));
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
  }
  100% {
    transform: translateY(0);
  }
}

.who {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  text-shadow: 0 3px 0 var(--ink);
}

.who b {
  font-size: 36px;
}

.bombs {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

.gain {
  font-size: 30px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
