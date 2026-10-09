<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'neverReveal' ? view.value.phase : null));
const people = (ids: string[]) => ids.map((id) => playerById(id)).filter((p) => p !== undefined);
const did = computed(() => people(phase.value?.did ?? []));
const didNot = computed(() => people(phase.value?.didNot ?? []));
const exact = computed(() => Object.values(phase.value?.gains ?? {}).some((g) => g >= 100));
const guessers = computed(() =>
  Object.entries(phase.value?.guesses ?? {})
    .map(([id, guess]) => ({ player: playerById(id), guess, gain: phase.value?.gains[id] ?? 0 }))
    .filter((g) => g.player !== undefined),
);

onMounted(() => audio.sfx('drumroll'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="exact" :delay="1.4" :y="0.4" />
    <div class="statement plate">Я никогда не {{ phase.statement }}</div>
    <div class="cols">
      <div class="col did">
        <div class="head display"><Emoji char="🙋" /> Было · {{ did.length }}</div>
        <div class="faces">
          <div v-for="(p, i) in did" :key="p.id" class="face" :style="{ animationDelay: `${0.5 + i * 0.15}s` }">
            <Avatar :player="p" :code="view.code" :size="140" />
            <span class="name">{{ p.name }}</span>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="head display"><Emoji char="🙅" /> Не было · {{ didNot.length }}</div>
        <div class="faces">
          <div v-for="(p, i) in didNot" :key="p.id" class="face" :style="{ animationDelay: `${0.5 + i * 0.15}s` }">
            <Avatar :player="p" :code="view.code" :size="140" />
            <span class="name">{{ p.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="guesses">
      <span class="ghead">Угадывали:</span>
      <span v-for="g in guessers" :key="g.player!.id" class="guess" :class="{ hit: g.gain > 0 }">
        {{ g.player!.name }} — {{ g.guess }}<b v-if="g.gain"> +{{ g.gain }}</b>
      </span>
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
  gap: 28px;
}

.statement {
  font-size: 44px;
  font-weight: 900;
  text-align: center;
  max-width: 1600px;
}

.cols {
  flex: 1;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.col {
  border-radius: 30px;
  padding: 24px;
  background: rgba(18, 6, 42, 0.6);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.col.did {
  background: rgba(255, 79, 139, 0.35);
}

.head {
  font-size: 40px;
  font-weight: 900;
  text-align: center;
}

.faces {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
}

.face {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: pop-in 500ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

.name {
  font-size: 26px;
  font-weight: 900;
}

.guesses {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 28px;
  font-size: 30px;
  font-weight: 800;
  animation: pop-in 500ms 1.2s both;
}

.ghead {
  color: var(--muted);
}

.guess.hit {
  color: var(--green);
}
</style>
