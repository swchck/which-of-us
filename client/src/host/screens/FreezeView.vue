<script setup lang="ts">
import { computed, watch } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { audio } from '../../common/audio';
import type { FreezeFault } from '../../../../shared/protocol';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'freeze' || p?.kind === 'freezeReveal' ? p : null;
});
const stage = computed(() => (phase.value?.kind === 'freeze' ? phase.value.stage : 'done'));
const alive = computed(() => {
  const p = phase.value;
  const ids = p?.kind === 'freeze' ? p.alive : (p?.survivors ?? []);
  return ids.map((id) => playerById(id)).filter((pl) => pl !== undefined);
});
const out = computed(() => (phase.value?.out ?? []).map((o) => ({ ...o, player: playerById(o.player) })).filter((o) => o.player));
const WHY: Record<FreezeFault, string> = { moved: 'шевельнулись', lazy: 'не танцевали' };

watch(
  () => phase.value?.out.length ?? 0,
  (n, prev) => {
    if (n > prev) audio.sfx('buzz');
  },
);
</script>

<template>
  <div v-if="phase && view" class="freeze" :class="`is-${stage}`">
    <div class="banner">
      <template v-if="stage === 'ready'">
        <Emoji char="🧊" :size="130" animated rim />
        <h2 class="display">Приготовьтесь!</h2>
        <p>Музыка играет — водите пальцем по экрану. Стихла — руки прочь!</p>
      </template>
      <template v-else-if="stage === 'music'">
        <Emoji char="🪩" :size="130" animated rim :loops="20" />
        <h2 class="display">Танцуем!</h2>
        <p v-if="phase.kind === 'freeze'">Пауза {{ phase.round }} из {{ phase.rounds }} — где-то впереди</p>
      </template>
      <template v-else-if="stage === 'freeze'">
        <Emoji char="🥶" :size="130" rim />
        <h2 class="display">Замри!</h2>
      </template>
      <template v-else>
        <Emoji char="🏆" :size="130" animated rim />
        <h2 class="display">{{ alive.length ? 'Ледяное спокойствие!' : 'Все растаяли!' }}</h2>
      </template>
    </div>

    <div class="floor">
      <div v-for="(p, i) in alive" :key="p.id" class="dancer" :style="{ animationDelay: `${(i % 4) * -0.17}s` }">
        <Avatar :player="p" :code="view.code" :size="110" :ring="4" />
        <span class="name sticker">{{ p.name }}</span>
        <b v-if="phase.kind === 'freezeReveal' && phase.gains[p.id]" class="gain">+{{ phase.gains[p.id] }}</b>
      </div>
    </div>

    <div v-if="out.length" class="out">
      <div v-for="o in out" :key="o.player!.id" class="gone">
        <Avatar :player="o.player!" :code="view.code" :size="54" :ring="2" />
        <small class="sticker">{{ WHY[o.why] }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.freeze {
  position: absolute;
  inset: 0;
  padding: 40px 120px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  transition: background-color 120ms;
}

.is-freeze {
  background: rgba(150, 225, 255, 0.35);
}

.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.banner h2 {
  margin: 6px 0 0;
  font-size: 110px;
  color: var(--yellow);
  -webkit-text-stroke: 10px var(--ink);
  paint-order: stroke;
}

.is-freeze .banner h2 {
  color: #bdf0ff;
  animation: shiver 120ms linear 3;
}

.banner p {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
}

@keyframes shiver {
  50% {
    transform: translateX(6px);
  }
}

.floor {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
}

.dancer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.is-music .dancer {
  animation: bop 0.5s ease-in-out infinite alternate;
}

.is-freeze .dancer :deep(.avatar) {
  filter: saturate(0.3) brightness(1.15) hue-rotate(160deg);
}

@keyframes bop {
  from {
    transform: translateY(0) rotate(-6deg);
  }
  to {
    transform: translateY(-26px) rotate(6deg);
  }
}

.name {
  padding: 2px 14px;
  font-size: 22px;
  font-weight: 800;
}

.gain {
  font-size: 30px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.out {
  display: flex;
  gap: 18px;
}

.gone {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gone :deep(.avatar) {
  filter: grayscale(1);
  opacity: 0.8;
}

.gone small {
  margin-top: -8px;
  padding: 0 10px;
  font-size: 20px;
  font-weight: 800;
}

@media (prefers-reduced-motion: reduce) {
  .is-music .dancer,
  .is-freeze .banner h2 {
    animation: none;
  }
}
</style>
