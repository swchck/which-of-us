<script setup lang="ts">
import CountUp from '../../common/CountUp.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import { teamTotals } from '../../common/teams';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'scores' ? view.value.phase : null));
const teams = computed(() => teamTotals(view.value?.players ?? []));
const max = computed(() => Math.max(1, ...(phase.value?.rows.map((r) => r.score) ?? [1])));
const rows = computed(
  () =>
    phase.value?.rows
      .map((r) => ({ ...r, player: playerById(r.player) }))
      .filter((r) => r.player !== undefined) ?? [],
);

/** When the rows leave the standings they came in with and slide into the new ones. */
const RESHUFFLE_MS = 1900;

const before = computed(() => [...rows.value].sort((a, b) => b.score - b.delta - (a.score - a.delta)));
const settled = ref(false);
const shown = computed(() => (settled.value ? rows.value : before.value));
const climber = computed(() => {
  let best: string | undefined;
  let most = 0;
  for (const [i, r] of rows.value.entries()) {
    const by = before.value.findIndex((b) => b.player!.id === r.player!.id) - i;
    if (by > most) [best, most] = [r.player!.id, by];
  }
  return best;
});

function settle(): void {
  settled.value = true;
  const leaderChanged = before.value[0]?.player!.id !== rows.value[0]?.player!.id;
  if (leaderChanged) audio.sfx('fanfare');
  else if (climber.value) audio.sfx('whoosh');
}

const due = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
onMounted(() => {
  audio.sfx('drumroll');
  timer = setTimeout(() => (due.value = true), RESHUFFLE_MS);
});
onBeforeUnmount(() => clearTimeout(timer));
// a paused room holds the big moment until play resumes
watch([due, () => view.value?.paused], ([isDue, paused]) => {
  if (isDue && !paused && !settled.value) settle();
});
</script>

<template>
  <div v-if="phase && view" class="scores">
    <div class="title display"><span class="plate">Промежуточный счёт</span></div>
    <div v-if="teams.length" class="teams">
      <div v-for="t in teams" :key="t.team" class="team sticker" :style="{ '--tc': t.color }">
        <Emoji :char="t.icon" :size="44" />
        <span>{{ t.title }}</span>
        <b class="display">{{ t.score }}</b>
      </div>
    </div>
    <TransitionGroup tag="div" name="reorder" class="rows">
      <div
        v-for="(r, i) in shown"
        :key="r.player!.id"
        class="row"
        :class="{ climber: settled && climber === r.player!.id }"
        :style="{ animationDelay: `${(rows.length - i) * 0.12}s` }"
      >
        <div class="place display">{{ settled ? r.place : i + 1 }}</div>
        <Avatar :player="r.player!" :code="view.code" :size="66" :ring="3" />
        <div class="name">{{ r.player!.name }}</div>
        <div class="track">
          <div
            class="bar"
            :style="{
              width: `${Math.max(4, (r.score / max) * 100)}%`,
              background: PLAYER_COLORS[r.player!.color],
              animationDelay: `${0.4 + (rows.length - i) * 0.12}s`,
            }"
          >
            <CountUp class="score display" :value="r.score" :from="r.score - r.delta" :delay="0.5 + (rows.length - i) * 0.12" />
          </div>
        </div>
        <div class="delta display" :class="{ zero: r.delta === 0 }">
          +<CountUp :value="r.delta" :from="0" :delay="0.4 + (rows.length - i) * 0.12" />
          <Emoji v-if="settled && climber === r.player!.id" class="fire" char="🔥" :size="44" animated :loops="3" />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.scores {
  position: absolute;
  inset: 0;
  padding: 50px 120px 230px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.title {
  font-size: 56px;
  font-weight: 900;
  text-align: center;
  color: var(--yellow);
  text-shadow: 0 6px 0 var(--ink);
}

.teams {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.team {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 26px;
  border-color: var(--tc);
  font-size: 30px;
  font-weight: 900;
}

.team b {
  font-size: 40px;
}

.rows {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.row {
  display: grid;
  grid-template-columns: 60px 80px 300px 1fr 150px;
  align-items: center;
  gap: 18px;
  animation: slide 500ms cubic-bezier(0.2, 1.2, 0.4, 1) both;
}

.place {
  font-size: 36px;
  font-weight: 900;
  text-align: center;
}

.name {
  font-size: 30px;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track {
  height: 72px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 16px;
}

.bar {
  height: 100%;
  border-radius: 16px;
  border: 4px solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 14px;
  transform-origin: left;
  animation: grow 900ms cubic-bezier(0.2, 1, 0.3, 1) both;
}

.score {
  font-size: 32px;
  font-weight: 900;
  color: var(--ink);
}

.delta {
  font-size: 30px;
  font-weight: 800;
  color: var(--green);
  text-shadow: 0 3px 0 var(--ink);
}

.delta.zero {
  color: var(--muted);
}

/* translate, not transform: a filled transform animation would override the FLIP move's inline transform */
@keyframes slide {
  from {
    translate: -200px 0;
    opacity: 0;
  }
}

.reorder-move {
  transition: transform 800ms cubic-bezier(0.3, 1.3, 0.5, 1);
}

.climber .name {
  color: var(--yellow);
  animation: wobble 0.6s ease-in-out 2;
}

.fire {
  margin-left: 6px;
}

@keyframes grow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>
