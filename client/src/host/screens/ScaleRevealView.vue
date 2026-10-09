<script setup lang="ts">
import Confetti from '../../common/Confetti.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import ScaleBar from '../parts/ScaleBar.vue';
import { scalePos as at } from '../parts/scale';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'scaleReveal' ? view.value.phase : null));
const target = computed(() => playerById(phase.value?.target));
// equal guesses stack instead of drawing over each other
const stacks = computed(() => {
  const by = new Map<number, string[]>();
  for (const g of phase.value?.guesses ?? []) by.set(g.value, [...(by.get(g.value) ?? []), g.player]);
  return [...by].map(([value, ids]) => ({
    value,
    players: ids.flatMap((id) => {
      const p = playerById(id);
      return p ? [p] : [];
    }),
  }));
});

const bullseye = computed(() => phase.value?.guesses.some((g) => g.value === phase.value?.truth) ?? false);

onMounted(() => audio.sfx('drumroll'));
</script>

<template>
  <div v-if="phase && view && target" class="reveal">
    <Confetti v-if="bullseye" :delay="2" :x="0.5" :y="0.55" />
    <div class="question plate">{{ phase.question }}</div>
    <div class="field">
      <ScaleBar :low="phase.low" :high="phase.high">
        <div v-for="(s, i) in stacks" :key="s.value" class="stack" :style="{ left: at(s.value), animationDelay: `${i * 0.15}s` }">
          <div v-for="p in s.players" :key="p.id" class="guess">
            <Avatar :player="p" :code="view.code" :size="62" :ring="3" />
            <b v-if="phase.gains[p.id]" class="gain display">+{{ phase.gains[p.id] }}</b>
          </div>
        </div>
        <div v-if="phase.truth !== null" class="truth" :style="{ left: at(phase.truth) }">
          <span class="value display">{{ phase.truth }}</span>
          <Avatar :player="target" :code="view.code" :size="120" :ring="6" />
        </div>
      </ScaleBar>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 50px 80px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.question {
  font-size: 40px;
  font-weight: 900;
  text-align: center;
  max-width: 1500px;
}

.field {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  padding-bottom: 60px;
}

.stack {
  position: absolute;
  bottom: 70px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 6px;
  animation: pop-in 400ms both;
}

.guess {
  position: relative;
}

.gain {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 6px;
  font-size: 22px;
  color: var(--green);
  text-shadow: 0 3px 0 var(--ink);
}

.truth {
  position: absolute;
  top: 110px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: drop 900ms cubic-bezier(0.2, 1.4, 0.4, 1) 1.4s both;
}

.value {
  font-size: 44px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow: 0 4px 0 var(--ink);
}

@keyframes drop {
  from {
    opacity: 0;
    transform: translate(-50%, 200px) scale(0.4);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}
</style>
