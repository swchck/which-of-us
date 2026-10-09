<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'quipReveal' ? view.value.phase : null));
const top = computed(() => Math.max(0, ...(phase.value?.answers.map((a) => a.votes.length) ?? [])));
const cards = computed(() =>
  (phase.value?.answers ?? []).map((a) => ({
    ...a,
    player: playerById(a.author),
    voters: a.votes.map((id) => playerById(id)).filter((p) => p !== undefined),
    gain: phase.value?.gains[a.author] ?? 0,
    winner: top.value > 0 && a.votes.length === top.value,
  })),
);
const sweep = computed(() => cards.value.some((c) => c.winner && c.voters.length > 1 && cards.value.every((o) => o === c || o.voters.length === 0)));

const timers: ReturnType<typeof setTimeout>[] = [];
onMounted(() => {
  audio.sfx('drumroll');
  for (const c of cards.value) c.voters.forEach((_, j) => timers.push(setTimeout(() => audio.sfx('pop', j * 2), 1000 + j * 300)));
});
onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="top > 0" :delay="1.2" :y="0.45" />
    <div class="prompt plate">{{ phase.prompt }}</div>
    <div class="cards">
      <div v-for="(c, i) in cards" :key="c.id" class="col" :class="{ winner: c.winner }" :style="{ animationDelay: `${0.3 + i * 0.2}s` }">
        <div class="answer sticker hand">{{ c.text }}</div>
        <div v-if="c.player" class="author">
          <Avatar :player="c.player" :code="view.code" :size="96" :ring="4" />
          <span class="name">{{ c.player.name }}</span>
          <b v-if="c.gain" class="gain display">+{{ c.gain }}</b>
        </div>
        <div class="voters">
          <Avatar
            v-for="(v, j) in c.voters"
            :key="v.id"
            class="voter"
            :player="v"
            :code="view.code"
            :size="72"
            :ring="3"
            :style="{ animationDelay: `${1 + j * 0.3}s` }"
          />
        </div>
      </div>
    </div>
    <div v-if="sweep" class="sweep display">Всухую!</div>
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
  gap: 30px;
}

.prompt {
  font-size: 40px;
  font-weight: 900;
  text-align: center;
  max-width: 1600px;
}

.cards {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
}

.col {
  width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  opacity: 0.75;
  animation: pop-in 500ms both;
  transition:
    scale 400ms 1.4s,
    opacity 400ms 1.4s;
}

.col.winner {
  opacity: 1;
  scale: 1.06;
}

.answer {
  align-self: stretch;
  padding: 30px 36px;
  font-size: 56px;
  line-height: 1.15;
  text-align: center;
  hyphens: auto;
  overflow-wrap: break-word;
}

.winner .answer {
  outline: 6px solid var(--yellow);
}

.author {
  display: flex;
  align-items: center;
  gap: 14px;
  animation: pop-in 400ms 0.8s both;
}

.name {
  font-size: 32px;
  font-weight: 900;
}

.gain {
  font-size: 32px;
  color: var(--green);
}

.voters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.voter {
  animation: pop-in 300ms both;
}

.sweep {
  font-size: 80px;
  color: var(--yellow);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
  rotate: -6deg;
  animation: pop-in 500ms 1.8s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}
</style>
