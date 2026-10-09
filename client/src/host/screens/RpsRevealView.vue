<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onMounted } from 'vue';
import { RPS_INFO } from '../../../../shared/catalog';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'rpsReveal' ? view.value.phase : null));
const champion = computed(() => playerById(phase.value?.champion));
const matches = computed(() =>
  (phase.value?.matches ?? []).map((m) => ({
    key: `${m.a}:${m.b}`,
    sides: [
      { player: playerById(m.a), hand: m.ta, won: m.winner === m.a },
      { player: m.b ? playerById(m.b) : undefined, hand: m.tb, won: m.winner === m.b },
    ],
    draw: m.winner === null,
    note: m.walkover ? 'техническая победа' : m.coin ? 'решил жребий' : '',
  })),
);

onMounted(() => audio.sfx(phase.value?.champion ? 'fanfare' : 'whoosh'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="champion" :delay="0.6" :y="0.35" />
    <div v-if="champion" class="champion">
      <Emoji class="cup" char="🏆" :size="150" animated rim />
      <Avatar :player="champion" :code="view.code" :size="240" :ring="8" />
      <div class="crown display plate">Победа в турнире — {{ champion.name }}</div>
    </div>
    <div v-else class="matches" :class="{ few: matches.length <= 2 }">
      <div v-for="(m, i) in matches" :key="m.key" class="match sticker" :class="{ draw: m.draw }" :style="{ animationDelay: `${i * 0.12}s` }">
        <template v-for="(s, j) in m.sides" :key="j">
          <div v-if="s.player" class="side" :class="{ won: s.won, lost: !m.draw && !s.won }">
            <Emoji class="thrown" :char="s.hand ? RPS_INFO[s.hand].icon : '❓'" :size="96" />
            <Avatar :player="s.player" :code="view.code" :size="76" :ring="3" />
            <b v-if="phase.gains[s.player.id]" class="gain">+{{ phase.gains[s.player.id] }}</b>
          </div>
          <span v-if="j === 0" class="vs display">{{ m.draw ? '=' : 'VS' }}</span>
        </template>
        <span v-if="m.note" class="note">{{ m.note }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.matches {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 40px;
}

.matches.few {
  grid-template-columns: minmax(0, 900px);
  justify-content: center;
}

.match {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 14px 24px;
  animation: pop-in 400ms both;
}

.match.draw {
  outline: 5px dashed var(--yellow);
}

.side {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: opacity 300ms;
}

.side:first-child {
  flex-direction: row-reverse;
}

.thrown {
  animation: rps-slam 450ms 0.3s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

.side.won .thrown {
  filter: drop-shadow(0 0 18px var(--yellow));
}

.side.lost {
  opacity: 0.4;
}

.gain {
  font-size: 24px;
  color: var(--green);
}

.note {
  position: absolute;
  bottom: -14px;
  padding: 2px 12px;
  border-radius: 999px;
  background: var(--yellow);
  color: var(--ink);
  font-size: 18px;
  font-weight: 900;
}

.vs {
  font-size: 40px;
  color: var(--pink);
}

.champion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: pop-in 600ms both;
}

.cup {
  margin-bottom: -50px;
  z-index: 1;
}

.crown {
  font-size: 56px;
  color: var(--yellow);
}

@keyframes rps-slam {
  from {
    scale: 2.4;
    opacity: 0;
  }
}
</style>
