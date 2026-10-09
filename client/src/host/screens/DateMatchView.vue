<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'dateMatch' ? view.value.phase : null));
const pairs = computed(() =>
  (phase.value?.matches ?? []).map(([a, b]) => [playerById(a), playerById(b)] as const).filter(([a, b]) => a && b),
);
const paired = computed(() => new Set((phase.value?.matches ?? []).flat()));
const crushes = computed(() => {
  const by = new Map<string, string[]>();
  for (const [from, to] of Object.entries(phase.value?.picks ?? {})) {
    if (paired.value.has(from) && phase.value?.picks[to] === from) continue;
    by.set(to, [...(by.get(to) ?? []), from]);
  }
  return [...by]
    .map(([to, from]) => ({ to: playerById(to), from: from.map((id) => playerById(id)).filter((p) => p !== undefined) }))
    .filter((c) => c.to !== undefined)
    .sort((a, b) => b.from.length - a.from.length);
});
const quirks = computed(() =>
  Object.entries(phase.value?.quirks ?? {})
    .map(([id, q]) => ({ player: playerById(id), ...q }))
    .filter((q) => q.player !== undefined),
);

onMounted(() => audio.sfx(pairs.value.length ? 'fanfare' : 'whoosh'));
</script>

<template>
  <div v-if="phase && view" class="match">
    <Confetti v-if="pairs.length" :delay="0.4" :y="0.3" />
    <div class="title display plate">
      {{ phase.quirks ? 'Итоги свиданий' : `Вечер ${phase.night}: ${pairs.length ? 'есть пара!' : 'без взаимности'}` }}
    </div>
    <div v-if="!phase.quirks" class="board">
      <div class="pairs">
        <div v-for="([a, b], i) in pairs" :key="`${a!.id}${b!.id}`" class="pair sticker" :style="{ animationDelay: `${0.3 + i * 0.2}s` }">
          <Avatar :player="a!" :code="view.code" :size="110" :ring="5" />
          <Emoji class="heart" char="💞" :size="80" animated />
          <Avatar :player="b!" :code="view.code" :size="110" :ring="5" />
          <b class="gain">+{{ phase.gains[a!.id] }} / +{{ phase.gains[b!.id] }}</b>
        </div>
      </div>
      <div v-if="!pairs.length && !crushes.length" class="nobody plate">Никто никого не позвал. Смелее!</div>
      <div class="crushes">
        <div v-for="c in crushes" :key="c.to!.id" class="crush">
          <Avatar v-for="f in c.from" :key="f.id" :player="f" :code="view.code" :size="54" :ring="2" />
          <Emoji char="💌" :size="40" /><span class="arrow">→</span>
          <Avatar :player="c.to!" :code="view.code" :size="70" :ring="3" />
        </div>
      </div>
    </div>
    <div v-else class="quirks">
      <div v-for="(q, i) in quirks" :key="q.player!.id" class="quirk sticker" :style="{ animationDelay: `${0.2 + i * 0.15}s` }">
        <Avatar :player="q.player!" :code="view.code" :size="70" :ring="3" />
        <div class="qtext">
          <b>{{ q.player!.name }}</b>
          <span>{{ q.text }}</span>
        </div>
        <span class="kept">{{ '✓'.repeat(q.kept) || '—' }}</span>
        <b v-if="phase.gains[q.player!.id]" class="gain">+{{ phase.gains[q.player!.id] }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.match {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.title {
  font-size: 54px;
  color: var(--yellow);
  animation: pop-in 400ms both;
}

.board {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
}

.pairs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
}

.pair {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  animation: pop-in 500ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.heart {
  margin: 0 -6px;
}

.gain {
  font-size: 26px;
  color: var(--green);
}

.crushes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px 30px;
  animation: pop-in 400ms 0.8s both;
}

.crush {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 18px;
  background: rgba(18, 6, 42, 0.6);
}

.arrow {
  font-size: 28px;
}

.nobody {
  font-size: 34px;
  font-weight: 900;
}

.quirks {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 30px;
}

.quirk {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px;
  animation: pop-in 400ms both;
}

.qtext {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 22px;
  font-weight: 700;
}

.qtext b {
  font-size: 26px;
}

.kept {
  font-size: 30px;
  font-weight: 900;
  color: var(--green);
  -webkit-text-stroke: 3px var(--ink);
  paint-order: stroke;
}
</style>
