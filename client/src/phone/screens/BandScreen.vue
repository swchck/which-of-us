<script setup lang="ts">
import { computed, ref } from 'vue';
import { BAND_INFO, BAND_ROOTS } from '../../../../shared/catalog';
import { useCountdown } from '../../common/countdown';
import { useInFlight } from '../../common/flight';
import { answer, socket, view } from '../store';
import { event } from '../haptics';
import { bandNote } from '../sound';

/** Beats a note takes to fall to the hit line; matches the TV. */
const LEAD_BEATS = 2;
/** Same windows as the server, so the phone's verdict matches the score. */
const WINDOW_MS = 200;
const PERFECT_MS = 80;

const phase = computed(() => (view.value?.phase.kind === 'band' ? view.value.phase : null));
const part = computed(() => (view.value?.personal.kind === 'band' ? view.value.personal.part : undefined));
const info = computed(() => (part.value ? BAND_INFO[part.value.instrument] : null));
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => phase.value?.startsAt), () => socket.now(), paused);
const lead = computed(() => (phase.value?.beat ?? 600) * LEAD_BEATS);
const notes = computed(() => (part.value?.notes ?? []).map((beat, id) => ({ id, beat })));
const falling = useInFlight(
  notes,
  (n) => (phase.value?.startsAt ?? 0) + n.beat * (phase.value?.beat ?? 0) - lead.value,
  () => lead.value,
  () => socket.now(),
  paused,
);
const hit = new Set<number>();
const verdict = ref<{ key: number; text: string; good: boolean } | null>(null);
let verdicts = 0;

function tap(): void {
  const p = phase.value;
  const mine = part.value;
  if (!p || !mine) return;
  const now = socket.now();
  answer(now, false);
  const at = (now - p.startsAt) / p.beat;
  let best = -1;
  mine.notes.forEach((n, i) => {
    if (!hit.has(i) && (best < 0 || Math.abs(n - at) < Math.abs(mine.notes[best]! - at))) best = i;
  });
  const off = best < 0 ? Infinity : Math.abs(mine.notes[best]! - at) * p.beat;
  // a hit takes the pitch the TV plays for that note, so the phones and the screen stay in tune
  bandNote(mine.instrument, best < 0 ? 0 : BAND_ROOTS[Math.floor(mine.notes[best]! / 4) % BAND_ROOTS.length]!);
  if (off <= WINDOW_MS) {
    hit.add(best);
    verdict.value = { key: ++verdicts, text: off <= PERFECT_MS ? 'Точно!' : 'Хорошо', good: true };
    event('tick');
  } else verdict.value = { key: ++verdicts, text: 'Мимо', good: false };
}
</script>

<template>
  <div v-if="phase && part && info" class="band" :class="{ frozen: paused }">
    <div class="status display">
      <span>{{ info.icon }} {{ info.title }}</span>
      <span v-if="opensIn > 0">· через {{ opensIn }}</span>
    </div>
    <button class="lane" :style="{ '--lead': `${lead}ms` }" @pointerdown.prevent="tap">
      <span
        v-for="n in falling"
        :key="n.id"
        class="note"
        :style="{ animationDelay: `${n.delay}ms`, animationDuration: `${lead}ms` }"
      >{{ info.icon }}</span>
      <span class="line" />
      <span v-if="verdict" :key="verdict.key" class="verdict display" :class="{ good: verdict.good }">{{ verdict.text }}</span>
    </button>
  </div>
</template>

<style scoped>
.band {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 800;
}

.lane {
  position: relative;
  flex: 1;
  min-height: 380px;
  padding: 0;
  overflow: hidden;
  border-radius: 28px;
  border: var(--line) solid var(--ink);
  background: linear-gradient(#2c1a5c, #12062a);
  font: inherit;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

.line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 70px;
  height: 8px;
  background: var(--yellow);
}

.note {
  position: absolute;
  left: 50%;
  /* centred on the line: 70 px up plus half its 8 px, minus half the note */
  bottom: 42px;
  width: 64px;
  height: 64px;
  margin-left: -32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  border: 4px solid var(--ink);
  font-size: 34px;
  animation-name: fall;
  animation-timing-function: linear;
  animation-fill-mode: both;
  will-change: transform;
}

/* starts above the lane and reaches the line exactly when its beat lands */
@keyframes fall {
  from {
    transform: translateY(-520px);
  }
  to {
    transform: translateY(0);
  }
}

.verdict {
  position: absolute;
  left: 0;
  right: 0;
  top: 30%;
  text-align: center;
  font-size: 40px;
  color: var(--pink);
  animation: pop-in 300ms both;
  pointer-events: none;
}

.verdict.good {
  color: var(--green);
}
</style>
