<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import Avatar from '../../common/Avatar.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'bombReveal' ? view.value.phase : null));
const loser = computed(() => playerById(phase.value?.loser));
const survivors = computed(() =>
  Object.keys(phase.value?.gains ?? {})
    .map((id) => playerById(id))
    .filter((p) => p !== undefined),
);

onMounted(() => audio.sfx('buzz'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <div class="flash"></div>
    <div class="boom">
      <Emoji char="💥" :size="420" animated :loops="1" />
      <div v-if="loser" class="loser">
        <Avatar :player="loser" :code="view.code" :size="200" :ring="7" />
        <div class="name display">{{ loser.name }}</div>
      </div>
    </div>
    <div class="facts">
      <span class="plate">{{ phase.category }} · передач: {{ phase.passes }}</span>
    </div>
    <div v-if="survivors.length" class="survivors">
      <span class="ghead ribbon">Уцелели · +50</span>
      <Avatar v-for="p in survivors" :key="p.id" :player="p" :code="view.code" :size="96" :ring="4" />
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 40px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.flash {
  position: absolute;
  inset: 0;
  background: #fff4c2;
  pointer-events: none;
  animation: flash 600ms ease-out both;
}

.boom {
  position: relative;
  flex: 1;
  display: grid;
  place-items: center;
}

.boom > :first-child {
  grid-area: 1 / 1;
  animation: blast 700ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

.loser {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  rotate: -6deg;
  animation: singed 600ms 350ms cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

.loser :deep(.avatar) {
  filter: sepia(0.5) brightness(0.8);
}

.name {
  font-size: 52px;
  color: var(--yellow);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.facts {
  font-size: 30px;
  font-weight: 900;
}

.survivors {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 28px;
  font-weight: 900;
  animation: pop-in 500ms 1s both;
}

.ghead {
  color: #fff;
}

@keyframes flash {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 0;
  }
}

@keyframes blast {
  from {
    scale: 0.2;
    opacity: 0;
  }
}

@keyframes singed {
  from {
    scale: 0.3;
    opacity: 0;
    rotate: 30deg;
  }
}
</style>
