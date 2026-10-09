<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'radio' || p?.kind === 'radioShow' || p?.kind === 'radioVote' || p?.kind === 'radioReveal' ? p : null;
});
const tellers = computed(() => (view.value?.players ?? []).filter((p) => p.connected));
const links = computed(() =>
  phase.value?.kind === 'radioShow' ? phase.value.chain.map((l) => ({ ...l, player: l.author === null ? undefined : playerById(l.author) })) : [],
);
const top = computed(() => (phase.value?.kind === 'radioReveal' ? Math.max(0, ...phase.value.tally) : 0));
</script>

<template>
  <div v-if="phase && view" class="radio">
    <template v-if="phase.kind === 'radio' || phase.kind === 'radioVote'">
      <div class="top">
        <div class="card sticker">
          <div class="label display"><Emoji char="📻" /> Сарафанное радио</div>
          <template v-if="phase.kind === 'radio'">
            <div class="text">Передача {{ phase.step }} из {{ phase.steps }}</div>
            <div class="note">Прочитайте слух на телефоне и перескажите его по памяти — не больше 14 слов</div>
          </template>
          <template v-else>
            <div class="text">Какой слух смешнее?</div>
            <div class="note">Голосуйте на телефонах — за свою версию нельзя</div>
          </template>
        </div>
        <TimerRing :deadline="phase.deadline" :size="170" />
      </div>
      <div v-if="phase.kind === 'radio'" class="air">
        <Emoji char="📻" :size="200" animated class="set" />
        <PlayerRow :code="view.code" :players="tellers" :done="phase.done" :size="120" />
      </div>
      <div v-else class="finals">
        <div v-for="(f, i) in phase.finals" :key="i" class="final sticker" :style="{ animationDelay: `${0.2 + i * 0.12}s` }">
          <span class="n display">{{ i + 1 }}</span>
          {{ f }}
        </div>
      </div>
    </template>

    <template v-else-if="phase.kind === 'radioShow'">
      <div class="title display plate"><Emoji char="📻" /> Слух {{ phase.index + 1 }} из {{ phase.total }}</div>
      <div class="chain">
        <div
          v-for="(l, i) in links"
          :key="i"
          class="link"
          :class="{ first: i === 0, last: i === links.length - 1 && i > 0 }"
          :style="{ animationDelay: `${0.3 + i * 0.7}s` }"
        >
          <Avatar v-if="l.player" :player="l.player" :code="view.code" :size="70" :ring="3" />
          <Emoji v-else char="📻" :size="70" />
          <div class="said sticker">
            <small>{{ l.player?.name ?? 'Слух' }}</small>
            {{ l.text }}
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <Confetti v-if="top > 0" :delay="0.6" :y="0.3" />
      <div class="title display plate"><Emoji char="📻" /> Итоги эфира</div>
      <div class="finals">
        <div
          v-for="(f, i) in phase.finals"
          :key="i"
          class="final sticker"
          :class="{ win: top > 0 && phase.tally[i] === top }"
          :style="{ animationDelay: `${0.2 + i * 0.12}s` }"
        >
          <span class="n display">{{ i + 1 }}</span>
          <span class="f">{{ f }}</span>
          <Avatar v-if="playerById(phase.authors[i] ?? undefined)" :player="playerById(phase.authors[i] ?? undefined)!" :code="view.code" :size="54" :ring="3" />
          <b class="votes">{{ phase.tally[i] }} 🗳</b>
          <b v-if="phase.authors[i] && phase.gains[phase.authors[i]!]" class="gain">+{{ phase.gains[phase.authors[i]!] }}</b>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.radio {
  position: absolute;
  inset: 0;
  /* full-width answer rows would run under the score rail on the right */
  padding: 50px 170px 230px 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.top {
  width: 100%;
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 26px 40px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 6px;
  font-size: 52px;
  font-weight: 900;
  line-height: 1.1;
}

.note {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--muted);
}

.air {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
}

.set {
  animation: wobble 1.6s ease-in-out infinite;
}

@keyframes wobble {
  25% {
    rotate: -5deg;
  }
  75% {
    rotate: 5deg;
  }
}

.title {
  font-size: 54px;
  color: var(--yellow);
  animation: pop-in 400ms both;
}

.chain {
  width: 100%;
  max-width: 1500px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.link {
  display: flex;
  align-items: center;
  gap: 18px;
  animation: pop-in 450ms both;
}

.link:nth-child(even) {
  flex-direction: row-reverse;
}

.said {
  max-width: 1200px;
  padding: 10px 24px;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
}

.said small {
  display: block;
  font-size: 18px;
  color: var(--pink);
}

.first .said {
  background: var(--ink);
  color: #fff;
}

.last .said {
  background: var(--yellow);
  font-size: 36px;
}

.finals {
  width: 100%;
  max-width: 1500px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.final {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 22px;
  font-size: 28px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.final .f {
  flex: 1;
}

.final.win {
  background: var(--yellow);
  scale: 1.03;
}

.n {
  font-size: 34px;
  color: var(--pink);
}

.votes {
  font-size: 30px;
}

.gain {
  min-width: 90px;
  font-size: 28px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
  text-align: right;
}
</style>
