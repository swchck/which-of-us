<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import Avatar from '../../common/Avatar.vue';
import { useCountdown } from '../../common/countdown';
import { socket, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'tap' ? view.value.phase : null));
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => phase.value?.startsAt), () => socket.now(), paused);
const left = useCountdown(computed(() => phase.value?.deadline), () => socket.now(), paused);
const rows = computed(() => {
  const counts = phase.value?.counts ?? {};
  const best = Math.max(30, ...Object.values(counts));
  return (view.value?.players ?? [])
    .filter((p) => p.id in counts)
    .map((p) => ({ player: p, count: counts[p.id] ?? 0, fill: (counts[p.id] ?? 0) / best }));
});
</script>

<template>
  <div v-if="phase && view" class="tap">
    <div class="title display">
      <span class="plate"><Emoji char="👆" /> Тапалка</span>
    </div>
    <div v-if="opensIn > 0" :key="opensIn" class="count display">{{ opensIn }}</div>
    <div v-else class="clock display" :class="{ hurry: left <= 3 }">{{ left > 0 ? `${left} с` : 'Стоп!' }}</div>
    <div class="lanes">
      <div v-for="r in rows" :key="r.player.id" class="lane">
        <Avatar :player="r.player" :code="view.code" :size="88" :ring="3" />
        <span class="name">{{ r.player.name }}</span>
        <span class="track">
          <span class="fill" :style="{ width: `${Math.max(3, r.fill * 100)}%`, background: PLAYER_COLORS[r.player.color] }"></span>
        </span>
        <b class="num display">{{ r.count }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tap {
  position: absolute;
  inset: 0;
  padding: 40px 120px 230px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  animation: wobble 0.5s ease-in-out infinite;
}

.lanes {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}

.lane {
  display: grid;
  grid-template-columns: 96px 240px 1fr 130px;
  align-items: center;
  gap: 18px;
}

.name {
  font-size: 32px;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track {
  height: 66px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.fill {
  display: block;
  height: 100%;
  border-radius: 16px;
  border: 4px solid var(--ink);
  transition: width 260ms ease-out;
}

.num {
  font-size: 50px;
  font-weight: 900;
  text-align: right;
}
</style>
