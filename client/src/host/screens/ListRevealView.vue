<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

/** More stickers than this would not fit the TV; the rest only count toward the points. */
const SHOWN = 42;

const phase = computed(() => (view.value?.phase.kind === 'listReveal' ? view.value.phase : null));
const items = computed(() =>
  // unique answers are the punchline, so they go first and never fall past the cut
  [...(phase.value?.items ?? [])]
    .sort((a, b) => Number(b.by.length === 1) - Number(a.by.length === 1))
    .slice(0, SHOWN)
    .map((item, i) => ({
    ...item,
    alone: item.by.length === 1,
    author: item.by.length === 1 ? playerById(item.by[0]) : undefined,
    tilt: ((i * 37) % 9) - 4,
  })),
);
const hidden = computed(() => Math.max(0, (phase.value?.items.length ?? 0) - SHOWN));
const scores = computed(() =>
  Object.entries(phase.value?.gains ?? {})
    .map(([id, gain]) => ({ player: playerById(id), gain }))
    .filter((r) => r.player !== undefined)
    .sort((a, b) => b.gain - a.gain),
);

onMounted(() => audio.sfx(items.value.some((i) => i.alone) ? 'fanfare' : 'drumroll'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="items.some((i) => i.alone)" :delay="1" :y="0.3" />
    <div class="title plate display">{{ phase.category }}</div>
    <div class="cloud">
      <div
        v-for="(item, i) in items"
        :key="item.text"
        class="chip"
        :class="{ alone: item.alone }"
        :style="{ rotate: `${item.tilt}deg`, animationDelay: `${0.3 + i * 0.04}s` }"
      >
        <Avatar v-if="item.author" :player="item.author" :code="view.code" :size="34" :ring="2" />
        <span>{{ item.text }}</span>
        <b v-if="!item.alone" class="times">×{{ item.by.length }}</b>
      </div>
      <div v-if="hidden" class="chip more">и ещё {{ hidden }}</div>
    </div>
    <div class="scores">
      <div v-for="r in scores" :key="r.player!.id" class="score">
        <Avatar :player="r.player!" :code="view.code" :size="62" :ring="3" />
        <b class="gain display">+{{ r.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 40px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.title {
  font-size: 40px;
  color: var(--yellow);
}

.cloud {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  gap: 12px 14px;
  overflow: hidden;
}

.chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-size: 26px;
  font-weight: 800;
  box-shadow: 0 4px 0 var(--ink);
  animation: pop-in 350ms both;
}

.chip.alone {
  padding-left: 6px;
  background: var(--yellow);
  font-size: 30px;
}

.chip.more {
  background: transparent;
  color: #fff;
  border-style: dashed;
}

.times {
  font-size: 20px;
  color: var(--muted);
}

.scores {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 26px;
}

.score {
  display: flex;
  align-items: center;
  gap: 8px;
  animation: pop-in 400ms 1.6s both;
}

.gain {
  font-size: 32px;
  color: var(--green);
  text-shadow: 0 3px 0 var(--ink);
}
</style>
