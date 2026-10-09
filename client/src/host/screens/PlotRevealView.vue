<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'plotReveal' ? view.value.phase : null));
const target = computed(() => playerById(phase.value?.target));
const plotters = computed(() => (phase.value?.plotters ?? []).map((id) => playerById(id)).filter((p) => p !== undefined));
const guesses = computed(() =>
  Object.entries(phase.value?.guesses ?? {})
    .map(([id, picked]) => ({
      voter: playerById(id),
      picked: picked.map((p) => ({ player: playerById(p), hit: phase.value!.plotters.includes(p) })).filter((g) => g.player !== undefined),
    }))
    .filter((g) => g.voter !== undefined),
);

onMounted(() => audio.sfx(phase.value?.slip ? 'fanfare' : 'ding'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="phase.slip" :delay="0.8" :y="0.35" />
    <div class="row">
      <div v-if="target" class="target">
        <Avatar :player="target" :code="view.code" :size="200" :ring="8" />
        <div class="name display plate">{{ target.name }}</div>
        <b v-if="phase.gains[target.id]" class="gain display plate">+{{ phase.gains[target.id] }}</b>
      </div>
      <div class="facts">
        <div class="word sticker"><span>Тайное слово</span><b class="display">«{{ phase.word }}»</b></div>
        <div v-if="phase.slip" class="slip">
          <Emoji char="🪤" :size="56" />
          <span class="bubble">{{ phase.slip }}</span>
        </div>
        <div v-else class="held display">Слово так и не прозвучало!</div>
        <div class="plotters">
          <span class="caption plate">В сговоре:</span>
          <div v-for="p in plotters" :key="p.id" class="plotter">
            <Avatar :player="p" :code="view.code" :size="70" :ring="3" />
            <b v-if="phase.gains[p.id]" class="small-gain">+{{ phase.gains[p.id] }}</b>
          </div>
        </div>
        <div class="guesses">
          <div v-for="g in guesses" :key="g.voter!.id" class="grow">
            <Avatar :player="g.voter!" :code="view.code" :size="48" :ring="2" />
            <span class="arrow">→</span>
            <span v-for="p in g.picked" :key="p.player!.id" class="guess" :class="{ hit: p.hit }">
              <Avatar :player="p.player!" :code="view.code" :size="44" :ring="2" />
            </span>
            <b v-if="phase.gains[g.voter!.id]" class="small-gain">+{{ phase.gains[g.voter!.id] }}</b>
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

.target {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: pop-in 600ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.name {
  font-size: 40px;
}

.gain {
  font-size: 36px;
  color: var(--green);
}

.facts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.word {
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  padding: 14px 30px;
  animation: pop-in 400ms 0.3s both;
}

.word span {
  font-size: 22px;
  font-weight: 800;
  color: var(--muted);
}

.word b {
  font-size: 64px;
}

.slip {
  display: flex;
  align-items: center;
  gap: 14px;
  animation: pop-in 400ms 0.8s both;
}

.bubble {
  max-width: 900px;
  padding: 14px 22px;
  border-radius: 24px 24px 24px 6px;
  border: 4px solid var(--ink);
  background: #fff;
  color: var(--ink);
  font-size: 32px;
  font-weight: 800;
}

.held {
  font-size: 54px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
  animation: pop-in 400ms 0.8s both;
}

.plotters {
  display: flex;
  align-items: center;
  gap: 14px;
  animation: pop-in 400ms 1.2s both;
}

.caption {
  font-size: 28px;
  font-weight: 900;
}

.plotter {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.small-gain {
  font-size: 22px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.guesses {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  animation: pop-in 400ms 1.6s both;
}

.grow {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 18px;
  background: rgba(18, 6, 42, 0.5);
}

.arrow {
  font-size: 26px;
  font-weight: 900;
}

.guess {
  border-radius: 50%;
  opacity: 0.45;
}

.guess.hit {
  opacity: 1;
  outline: 4px solid var(--green);
}
</style>
