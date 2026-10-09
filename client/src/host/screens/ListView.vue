<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed, watch } from 'vue';
import { audio } from '../../common/audio';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'list' ? view.value.phase : null));
const rows = computed(() => {
  const counts = phase.value?.counts ?? {};
  return Object.keys(counts)
    .map((id) => ({ player: playerById(id), count: counts[id] ?? 0 }))
    .filter((r) => r.player !== undefined);
});
const top = computed(() => Math.max(1, ...rows.value.map((r) => r.count)));
const total = computed(() => rows.value.reduce((n, r) => n + r.count, 0));

watch(total, (n, prev) => {
  if (n > prev) audio.sfx('pop', Math.min(12, n / 3));
});
</script>

<template>
  <div v-if="phase && view" class="list">
    <div class="top">
      <div :key="phase.category" class="card sticker">
        <div class="label display"><Emoji char="📝" /> Кто больше · {{ phase.round }} из {{ phase.rounds }}</div>
        <WordsIn class="text" :text="phase.category" />
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div class="race" :class="{ two: rows.length > 4 }">
      <div v-for="r in rows" :key="r.player!.id" class="lane">
        <Avatar :player="r.player!" :code="view.code" :size="84" :ring="4" />
        <div class="track">
          <div class="fill" :style="{ width: `${Math.max(6, (r.count / top) * 100)}%` }">
            <span :key="r.count" class="count display">{{ r.count }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="hint ribbon">Ответы откроются в конце. Уникальные — втрое дороже!</div>
  </div>
</template>

<style scoped>
.list {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 30px 44px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 8px;
  font-size: 66px;
  font-weight: 900;
  line-height: 1.1;
}

.race {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  min-height: 0;
}

/* eight full-width lanes would not fit under the card, so a crowd splits into two columns */
.race.two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: center;
  gap: 14px 40px;
}

.lane {
  display: flex;
  align-items: center;
  gap: 18px;
}

.track {
  flex: 1;
  height: 52px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.25);
}

.fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 14px;
  border-radius: 16px;
  border: 4px solid var(--ink);
  background: linear-gradient(90deg, var(--cyan), var(--green));
  transition: width 400ms cubic-bezier(0.2, 1.3, 0.4, 1);
}

.count {
  font-size: 30px;
  color: var(--ink);
  animation: pop-in 300ms both;
}

.hint {
  align-self: center;
  font-size: 22px;
  color: #fff;
}
</style>
