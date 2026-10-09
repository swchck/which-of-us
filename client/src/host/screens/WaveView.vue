<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import { WAVE_MAX } from '../../../../shared/protocol';
import SpectrumBar from '../parts/SpectrumBar.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'waveHint' || p?.kind === 'waveGuess' || p?.kind === 'waveReveal' ? p : null;
});
const psychic = computed(() => playerById(phase.value?.psychic));
const pct = (v: number) => `${(v / WAVE_MAX) * 100}%`;
// widths of the scoring bands around the secret point, matching the server's 5 / 12 / 20
const BANDS = [20, 12, 5];
const marks = computed(() => {
  const p = phase.value;
  if (p?.kind !== 'waveReveal') return [];
  return Object.entries(p.guesses)
    .map(([id, at]) => ({ player: playerById(id), at, gain: p.gains[id] ?? 0 }))
    .filter((m) => m.player)
    .sort((a, b) => a.at - b.at);
});
const waiting = computed(() => {
  const p = phase.value;
  if (p?.kind !== 'waveGuess') return [];
  return (view.value?.players ?? []).filter((pl) => pl.connected && pl.id !== p.psychic).map((pl) => ({ player: pl, done: p.answered.includes(pl.id) }));
});
</script>

<template>
  <div v-if="phase && view" class="wave">
    <div class="top">
      <div class="card sticker">
        <Avatar v-if="psychic" :player="psychic" :code="view.code" :size="96" :ring="4" />
        <div class="say">
          <small v-if="phase.kind !== 'waveReveal'">Волна {{ phase.round }} из {{ phase.rounds }}</small>
          <template v-if="phase.kind === 'waveHint'">
            <b>{{ psychic?.name }} видит тайную точку</b>
            <span class="note">и придумывает подсказку…</span>
          </template>
          <template v-else>
            <span class="note">Подсказка от игрока {{ psychic?.name }}</span>
            <b class="hint display">«{{ phase.hint }}»</b>
          </template>
        </div>
      </div>
      <TimerRing v-if="phase.kind !== 'waveReveal'" :deadline="phase.deadline" :size="160" />
    </div>

    <SpectrumBar :left="phase.left" :right="phase.right" :class="{ spaced: phase.kind === 'waveReveal' }">
      <template v-if="phase.kind === 'waveReveal'">
        <div
          v-for="(b, i) in BANDS"
          :key="b"
          class="band"
          :class="`b${i}`"
          :style="{ left: pct(Math.max(0, phase.target - b)), right: pct(Math.max(0, WAVE_MAX - phase.target - b)) }"
        />
        <div class="needle" :style="{ left: pct(phase.target) }" />
        <div v-for="(m, i) in marks" :key="m.player!.id" class="mark" :style="{ left: pct(m.at), '--lift': `${(i % 2) * 64}px`, animationDelay: `${0.5 + i * 0.12}s` }">
          <b v-if="m.gain" class="gain">+{{ m.gain }}</b>
          <Avatar :player="m.player!" :code="view.code" :size="62" :ring="3" />
          <i class="pin" />
        </div>
      </template>
      <div v-else-if="phase.kind === 'waveHint'" class="mystery">?</div>
    </SpectrumBar>

    <div v-if="phase.kind === 'waveGuess'" class="who">
      <div v-for="w in waiting" :key="w.player.id" class="seat" :class="{ done: w.done }">
        <Avatar :player="w.player" :code="view.code" :size="70" :ring="3" />
      </div>
    </div>
    <p v-if="phase.kind === 'waveGuess'" class="tip sticker">Поставьте отметку на телефоне: где на шкале «{{ phase.hint }}»?</p>
    <p v-else-if="phase.kind === 'waveReveal'" class="tip sticker">
      Тайная точка — {{ phase.target }}. Автору подсказки — в среднем по всем: +{{ phase.gains[phase.psychic] ?? 0 }}
    </p>
  </div>
</template>

<style scoped>
.wave {
  position: absolute;
  inset: 0;
  padding: 50px 120px 230px;
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.top {
  display: flex;
  align-items: center;
  gap: 40px;
}

.card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 22px 34px;
  animation: pop-in 400ms both;
}

.say {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 40px;
  font-weight: 900;
}

.say small {
  font-size: 22px;
  color: var(--pink);
}

.note {
  font-size: 26px;
  font-weight: 700;
  color: #6b5a99;
}

.hint {
  font-size: 56px;
  line-height: 1.1;
}

.spaced {
  margin-top: 130px;
}

.band {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 28px;
  animation: grow 600ms both;
}

.b0 {
  background: rgba(255, 255, 255, 0.55);
}

.b1 {
  background: rgba(255, 210, 63, 0.75);
}

.b2 {
  background: var(--yellow);
  box-shadow: inset 0 0 0 3px var(--ink);
}

.needle {
  position: absolute;
  top: -22px;
  bottom: -22px;
  width: 8px;
  margin-left: -4px;
  border-radius: 4px;
  background: var(--ink);
  animation: grow 500ms 300ms both;
}

@keyframes grow {
  from {
    transform: scaleY(0);
  }
}

.mark {
  position: absolute;
  bottom: 70px;
  translate: -50% calc(-1 * var(--lift));
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: pop-in 400ms both;
}

.pin {
  width: 6px;
  height: 22px;
  background: var(--ink);
}

.gain {
  font-size: 26px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.mystery {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: 44px;
  color: var(--ink);
  animation: wobble 1.6s ease-in-out infinite;
}

@keyframes wobble {
  50% {
    transform: scale(1.15) rotate(-6deg);
  }
}

.who {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.seat {
  opacity: 0.4;
  transition: opacity 300ms, transform 300ms;
}

.seat.done {
  opacity: 1;
  transform: translateY(-8px);
}

.tip {
  align-self: center;
  margin: 0;
  padding: 10px 26px;
  text-align: center;
  font-size: 28px;
  font-weight: 800;
}
</style>
