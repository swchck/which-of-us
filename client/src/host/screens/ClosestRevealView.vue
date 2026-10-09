<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import CountUp from '../../common/CountUp.vue';
import { computed, onMounted } from 'vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import { audio } from '../../common/audio';
import { unitFor } from '../../../../shared/catalog';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'closestReveal' ? view.value.phase : null));
/** Pins closer than this share of the track would cover each other, so they go on separate lanes. */
const LANE_GAP = 0.09;
const LANES = 3;

// a signed log scale: one wild guess must not squash every sensible one into the bullseye
const rows = computed(() => {
  const p = phase.value;
  if (!p) return [];
  const far = Math.log1p(Math.max(1, ...p.guesses.map((g) => Math.abs(g.value - p.answer))));
  const pins = p.guesses
    .map((g) => ({ ...g, player: playerById(g.player), gain: p.gains[g.player] ?? 0 }))
    .filter((g) => g.player !== undefined)
    .map((g) => ({ ...g, x: 0.5 + (Math.sign(g.value - p.answer) * Math.log1p(Math.abs(g.value - p.answer))) / far / 2.2, lane: 0 }));
  const lastX = Array<number>(LANES).fill(-1);
  for (const pin of [...pins].sort((a, b) => a.x - b.x)) {
    const free = lastX.findIndex((x) => pin.x - x >= LANE_GAP);
    pin.lane = free >= 0 ? free : lastX.indexOf(Math.min(...lastX));
    lastX[pin.lane] = pin.x;
  }
  return pins;
});

const exact = computed(() => rows.value.some((r) => r.value === phase.value?.answer));

onMounted(() => audio.sfx('drumroll'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="exact" :delay="1.6" :y="0.35" />
    <div class="question plate">{{ phase.question }}</div>
    <div class="answer display">
      <CountUp :value="phase.answer" :ms="1400" />
      <small v-if="phase.unit">{{ unitFor(phase.answer, phase.unit) }}</small>
    </div>
    <div class="track">
      <span class="bull"></span>
      <div
        v-for="(r, i) in rows"
        :key="r.player!.id"
        class="pin"
        :style="{ left: `${r.x * 100}%`, top: `${26 + r.lane * 120}px`, '--c': PLAYER_COLORS[r.player!.color], animationDelay: `${1.5 + i * 0.12}s`, zIndex: rows.length - i }"
      >
        <Avatar :player="r.player!" :code="view.code" :size="70" :ring="3" />
        <span class="value">{{ r.value }}</span>
        <b v-if="r.gain" class="gain">+{{ r.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.question {
  font-size: 40px;
  font-weight: 900;
  text-align: center;
  max-width: 1600px;
}

.answer {
  display: flex;
  align-items: baseline;
  gap: 16px;
  font-size: 150px;
  line-height: 1;
  color: var(--yellow);
  -webkit-text-stroke: 6px var(--ink);
  paint-order: stroke;
  animation: pop-in 600ms 200ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.answer small {
  font-size: 56px;
  color: #fff;
}

.track {
  position: relative;
  width: 100%;
  flex: 1;
  margin-top: 30px;
  border-top: 6px dashed rgba(255, 255, 255, 0.35);
}

.bull {
  position: absolute;
  left: 50%;
  top: -21px;
  width: 36px;
  height: 36px;
  translate: -50% 0;
  border-radius: 50%;
  background: var(--yellow);
  border: 5px solid var(--ink);
  box-shadow: 0 0 0 8px rgba(255, 210, 63, 0.35);
}

.pin {
  position: absolute;
  top: 26px;
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  animation: drop 500ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.value {
  padding: 2px 10px;
  border-radius: 10px;
  background: var(--c);
  border: 3px solid var(--ink);
  color: var(--ink);
  font-size: 24px;
  font-weight: 900;
}

.gain {
  font-size: 24px;
  color: var(--green);
}

@keyframes drop {
  from {
    translate: -50% -120px;
    opacity: 0;
  }
}
</style>
