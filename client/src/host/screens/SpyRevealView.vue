<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'spyReveal' ? view.value.phase : null));
const spy = computed(() => playerById(phase.value?.spy));
const verdict = computed(() => {
  const p = phase.value;
  if (!p) return '';
  if (!p.caught) return 'Шпиону удалось скрыться!';
  return p.guessed ? 'Шпиона вычислили, но место угадано!' : 'Шпиона вычислили!';
});
const accused = computed(() => {
  const counts = new Map<string, string[]>();
  for (const v of phase.value?.votes ?? []) counts.set(v.to, [...(counts.get(v.to) ?? []), v.from]);
  return [...counts]
    .map(([id, from]) => ({ player: playerById(id), voters: from.map((f) => playerById(f)).filter((p) => p !== undefined) }))
    .filter((r) => r.player !== undefined)
    .sort((a, b) => b.voters.length - a.voters.length);
});

onMounted(() => audio.sfx(phase.value?.caught && !phase.value.guessed ? 'fanfare' : 'buzz'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="phase.caught" :delay="1" :y="0.4" />
    <div class="row">
      <div v-if="spy" class="spy">
        <Avatar :player="spy" :code="view.code" :size="230" :ring="8" />
        <Emoji class="hat" char="🕵️" :size="120" rim />
        <div class="name display">{{ spy.name }}</div>
        <b v-if="phase.gains[spy.id]" class="gain display">+{{ phase.gains[spy.id] }}</b>
      </div>
      <div class="facts">
        <div class="verdict display" :class="{ caught: phase.caught && !phase.guessed }">{{ verdict }}</div>
        <div class="place sticker">Место: <b>{{ phase.place }}</b></div>
        <div class="votes">
          <div v-for="r in accused" :key="r.player!.id" class="vrow" :class="{ hit: r.player!.id === phase.spy }">
            <Avatar :player="r.player!" :code="view.code" :size="60" :ring="3" />
            <span class="arrow">←</span>
            <Avatar v-for="v in r.voters" :key="v.id" :player="v" :code="view.code" :size="44" :ring="2" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 60px 110px 230px;
  display: flex;
  align-items: center;
}

.row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 80px;
}

.spy {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: pop-in 600ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.hat {
  position: absolute;
  top: -60px;
  right: -50px;
  rotate: 14deg;
}

.name {
  font-size: 46px;
}

.gain {
  font-size: 36px;
  color: var(--green);
}

.facts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.verdict {
  font-size: 72px;
  color: var(--yellow);
  -webkit-text-stroke: 5px var(--ink);
  paint-order: stroke;
  animation: pop-in 500ms 0.5s both;
}

.verdict.caught {
  color: var(--green);
}

.place {
  align-self: flex-start;
  padding: 14px 28px;
  font-size: 38px;
  animation: pop-in 400ms 0.9s both;
}

.votes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: pop-in 400ms 1.3s both;
}

.vrow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 18px;
  background: rgba(18, 6, 42, 0.5);
  align-self: flex-start;
}

.vrow.hit {
  outline: 4px solid var(--green);
}

.arrow {
  font-size: 30px;
  font-weight: 900;
}
</style>
