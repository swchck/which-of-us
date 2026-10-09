<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import { BAND_INFO, BAND_ROOTS } from '../../../../shared/catalog';
import { BAND_INSTRUMENTS } from '../../../../shared/protocol';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { audio } from '../../common/audio';
import { useCountdown } from '../../common/countdown';
import { useInFlight } from '../../common/flight';
import { playerById, socket, view } from '../store';

/** Beats a note takes to cross the lane to the hit line. */
const LEAD_BEATS = 2;
const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'band' || p?.kind === 'bandReveal' ? p : null;
});
const live = computed(() => (phase.value?.kind === 'band' ? phase.value : null));
const paused = computed(() => view.value?.paused ?? false);
const opensIn = useCountdown(computed(() => live.value?.startsAt), () => socket.now(), paused);
const rows = computed(() => {
  const p = phase.value;
  if (!p) return [];
  return Object.entries(p.parts)
    .map(([id, part]) => ({ player: playerById(id), part, score: p.scores[id] ?? 0, gain: p.kind === 'bandReveal' ? p.gains[id] : undefined }))
    .filter((r) => r.player);
});
const notes = computed(() => {
  const p = live.value;
  if (!p) return [];
  const parts = new Map(Object.values(p.parts).map((part) => [part.instrument, part]));
  return [...parts.values()].flatMap((part) =>
    part.notes.map((n, i) => ({ id: BAND_INSTRUMENTS.indexOf(part.instrument) * 1000 + i, instrument: part.instrument, beat: n })),
  );
});
const lead = computed(() => (live.value?.beat ?? 600) * LEAD_BEATS);
const flying = useInFlight(
  notes,
  (n) => (live.value?.startsAt ?? 0) + n.beat * (live.value?.beat ?? 0) - lead.value,
  () => lead.value,
  () => socket.now(),
  paused,
);

// each note is queued as its flight mounts, a beat or two ahead, so a pause or a skip cuts the tune
// short; queuing the whole score up front left it playing over the next screen
let sound = audio.group();
const queued = new Set<number>();
watch(
  [flying, paused],
  ([list, still]) => {
    const p = live.value;
    if (still) {
      sound.stop();
      sound = audio.group();
      queued.clear();
      return;
    }
    if (!p) return;
    for (const n of list) {
      if (queued.has(n.id)) continue;
      queued.add(n.id);
      const delay = (p.startsAt + n.beat * p.beat - socket.now()) / 1000;
      if (delay >= 0) audio.note(n.instrument, delay, BAND_ROOTS[Math.floor(n.beat / 4) % BAND_ROOTS.length], sound.node);
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => sound.stop());
</script>

<template>
  <div v-if="phase && view" class="band" :class="{ frozen: paused }">
    <div class="title display"><Emoji char="🎵" /> Оркестр</div>
    <div v-if="live && opensIn > 0" :key="opensIn" class="count display">{{ opensIn }}</div>
    <div class="rows">
      <div v-for="r in rows" :key="r.player!.id" class="row">
        <span class="inst">{{ BAND_INFO[r.part.instrument].icon }}</span>
        <Avatar :player="r.player!" :code="view.code" :size="60" :ring="3" />
        <div class="lane" :style="{ '--lead': `${lead}ms` }">
          <span class="line" />
          <template v-if="live">
            <span
              v-for="n in flying.filter((f) => f.instrument === r.part.instrument)"
              :key="n.id"
              class="note"
              :style="{ animationDelay: `${n.delay}ms`, animationDuration: `${lead}ms` }"
            />
          </template>
        </div>
        <b class="pct display">{{ r.score }}%</b>
        <b v-if="r.gain" class="gain">+{{ r.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.band {
  position: absolute;
  inset: 0;
  padding: 36px 120px 230px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.title {
  text-align: center;
  font-size: 48px;
  color: var(--yellow);
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

.rows {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.row {
  display: grid;
  grid-template-columns: 56px 70px 1fr 110px 90px;
  align-items: center;
  gap: 12px;
}

.inst {
  font-size: 46px;
  text-align: center;
}

.lane {
  position: relative;
  height: 64px;
  overflow: hidden;
  border-radius: 32px;
  border: 4px solid var(--ink);
  background: rgba(18, 6, 42, 0.75);
}

.line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 60px;
  width: 6px;
  background: var(--yellow);
}

.note {
  position: absolute;
  top: 10px;
  left: 42px;
  width: 40px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid var(--ink);
  animation-name: travel;
  animation-timing-function: linear;
  animation-fill-mode: both;
  will-change: transform;
}

/* starts beyond the right edge and reaches the line exactly when its beat lands */
@keyframes travel {
  from {
    transform: translateX(1200px);
  }
  to {
    transform: translateX(0);
  }
}

.pct {
  font-size: 34px;
  color: #fff;
  text-shadow: 0 3px 0 var(--ink);
}

.gain {
  font-size: 28px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
