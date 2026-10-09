<script setup lang="ts">
import { glyphs } from '../../common/emoji';
import Emoji from '../../common/Emoji.vue';
import Confetti from '../../common/Confetti.vue';
import CountUp from '../../common/CountUp.vue';
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'voteReveal' ? view.value.phase : null));
const STEP = 0.32;

const columns = computed(() => {
  const p = phase.value;
  if (!p || !view.value) return [];
  let order = 0;
  const cols = view.value.players.map((player) => {
    const voters = p.votes
      .filter((v) => v.to === player.id)
      .map((v) => ({ player: playerById(v.from), delay: 0 }))
      .filter((v) => v.player !== undefined);
    return { player, voters, leader: p.leaders.includes(player.id) };
  });
  for (const col of cols) for (const v of col.voters) v.delay = order++ * STEP;
  return cols;
});
const total = computed(() => phase.value?.votes.length ?? 0);
const chip = computed(() => (Math.max(0, ...columns.value.map((c) => c.voters.length)) > 5 ? 40 : 54));
const revealAt = computed(() => total.value * STEP + 0.5);
const crowdPick = computed(() => playerById(phase.value?.crowd?.pick));

let sting: ReturnType<typeof setTimeout> | undefined;
onMounted(() => {
  audio.sfx('drumroll');
  sting = setTimeout(() => audio.sfx(phase.value?.leaders.length === 1 ? 'fanfare' : 'ding'), revealAt.value * 1000);
});
onBeforeUnmount(() => clearTimeout(sting));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="phase.leaders.length === 1" :delay="revealAt" :y="0.6" />
    <div class="question plate" :class="{ emoji: phase.about }">
      <template v-if="phase.about"><Emoji v-for="(g, i) in glyphs(phase.question)" :key="i" :char="g" /></template>
      <template v-else>{{ phase.question }}</template>
    </div>
    <div class="columns">
      <div v-for="col in columns" :key="col.player.id" class="col" :class="{ leader: col.leader }" :style="{ '--reveal': `${revealAt}s` }">
        <div class="stack">
          <div
            v-for="(v, i) in col.voters"
            :key="i"
            class="chip"
            :style="{ animationDelay: `${v.delay}s` }"
          >
            <Avatar v-if="v.player" :player="v.player" :code="view.code" :size="chip" :ring="3" />
            <span v-if="v.player && phase.jokers?.includes(v.player.id)" class="joker">🃏</span>
          </div>
        </div>
        <div class="me">
          <div v-if="col.voters.length" class="count display" :style="{ animationDelay: `${revealAt - 0.3}s` }">
            {{ col.voters.length }}
          </div>
          <Emoji v-if="col.leader" class="crown" :char="phase.about ? '🎯' : phase.author ? '✍️' : '👑'" />
          <Avatar :player="col.player" :code="view.code" :size="col.leader ? 170 : 120" />
        </div>
        <div class="name">{{ col.player.name }}</div>
        <div v-if="phase.gains[col.player.id]" class="gain display">
          +<CountUp :value="phase.gains[col.player.id]!" :from="0" :delay="revealAt" /><small v-if="phase.jokers?.includes(col.player.id)"> ×2</small>
        </div>
      </div>
    </div>
    <div v-if="phase.unanimous" class="unanimous sticker display" :style="{ animationDelay: `${revealAt + 0.4}s` }">
      Единогласно! Каждому по джокеру <Emoji char="🃏" />
    </div>
    <div v-if="phase.crowd && crowdPick" class="crowd sticker" :style="{ animationDelay: `${revealAt + 0.6}s` }">
      <Emoji class="eyes" char="👀" />
      <Avatar :player="crowdPick" :code="view.code" :size="64" :ring="3" />
      <span>
        Зрители за <b>{{ crowdPick.name }}</b><br />
        <small>{{ phase.crowd.votes }} из {{ phase.crowd.total }}</small>
      </span>
    </div>
    <div v-if="phase.about" class="title sticker display" :style="{ animationDelay: `${revealAt + 0.2}s` }">
      <Emoji char="🎯" /> Это {{ playerById(phase.about)?.name }} · эмодзи от {{ playerById(phase.author)?.name }}
    </div>
    <div v-else-if="phase.author" class="title sticker display" :style="{ animationDelay: `${revealAt + 0.2}s` }">
      <Emoji char="✍️" /> Автор: {{ playerById(phase.author)?.name }}
    </div>
    <div v-else-if="phase.title" class="title sticker display" :style="{ animationDelay: `${revealAt + 0.2}s` }">
      <Emoji char="🏆" /> {{ phase.title }}
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 50px 60px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.question {
  font-size: 40px;
  font-weight: 900;
  text-align: center;
  max-width: 1500px;
  text-shadow: 0 4px 0 var(--ink);
}

.question.emoji {
  font-size: 72px;
  letter-spacing: 12px;
}

.columns {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 40px;
  width: 100%;
}

.col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 140px;
}

.stack {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 8px;
}

.chip {
  position: relative;
  animation: fly-in 500ms cubic-bezier(0.3, 1.5, 0.5, 1) both;
}

.count {
  position: absolute;
  left: -14px;
  bottom: -6px;
  z-index: 3;
  min-width: 52px;
  height: 52px;
  padding: 0 8px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--yellow);
  color: var(--ink);
  border: 4px solid var(--ink);
  font-size: 26px;
  font-weight: 900;
  animation: pop-in 400ms both;
}

.me {
  position: relative;
  transition: transform 400ms;
}

.leader .me {
  animation: pop-in 600ms both;
  animation-delay: var(--reveal);
}

.crown {
  position: absolute;
  top: -70px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 72px;
  animation: crown 700ms cubic-bezier(0.3, 1.6, 0.5, 1) both;
  animation-delay: var(--reveal);
  z-index: 2;
}

.name {
  font-size: 26px;
  font-weight: 900;
  padding: 2px 14px;
  border-radius: 12px;
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--ink);
}

.leader .name {
  background: var(--yellow);
}

.joker {
  position: absolute;
  right: -6px;
  bottom: -6px;
  font-size: 26px;
  filter: drop-shadow(0 2px 0 var(--ink));
}

.unanimous {
  position: absolute;
  top: 30px;
  right: 120px;
  padding: 12px 24px;
  font-size: 34px;
  background: var(--yellow);
  rotate: 3deg;
  animation: pop-in 450ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.gain {
  padding: 4px 14px;
  border-radius: 999px;
  background: var(--ink);
  font-size: 32px;
  font-weight: 900;
  color: var(--yellow);
  animation: pop-in 400ms both;
  animation-delay: var(--reveal);
}

.crowd {
  position: absolute;
  right: 60px;
  top: 130px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 22px;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
  transform: rotate(2deg);
  animation: pop-in 500ms both;
}

.crowd .eyes {
  font-size: 40px;
}

.crowd small {
  font-size: 18px;
  color: #6b5a99;
}

.title {
  margin-top: 26px;
  padding: 16px 40px;
  font-size: 48px;
  font-weight: 900;
  background: var(--yellow);
  transform: rotate(-2deg);
  animation: pop-in 600ms cubic-bezier(0.2, 0.9, 0.3, 1.4) both;
}

@keyframes fly-in {
  from {
    transform: translateY(-600px) scale(0.5);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes crown {
  from {
    transform: translate(-50%, -200px) rotate(-40deg);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0) rotate(-10deg);
    opacity: 1;
  }
}
</style>
