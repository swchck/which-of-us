<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import { MASKS } from '../../../../shared/protocol';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'masqReveal' ? view.value.phase : null));
const cards = computed(() =>
  (phase.value?.owners ?? []).map((id, i) => {
    const guesses = Object.entries(phase.value?.guesses ?? {}).filter(([g]) => g !== id);
    return {
      mask: MASKS[i]!,
      owner: playerById(id),
      spotted: guesses.filter(([, guess]) => guess[i] === id).map(([g]) => playerById(g)).filter((p) => p !== undefined),
      asked: guesses.length,
      gain: phase.value?.gains[id] ?? 0,
    };
  }),
);
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <div class="title display plate"><Emoji char="🎭" /> Маски долой!</div>
    <div class="grid" :class="{ few: cards.length <= 4 }">
      <div v-for="(c, i) in cards" :key="c.mask.name" class="card sticker" :style="{ animationDelay: `${0.3 + i * 0.25}s` }">
        <div class="flip">
          <Emoji :char="c.mask.icon" :size="84" class="mask" :style="{ animationDelay: `${0.6 + i * 0.25}s` }" />
          <Avatar v-if="c.owner" :player="c.owner" :code="view.code" :size="96" :ring="4" class="face" :style="{ animationDelay: `${0.6 + i * 0.25}s` }" />
        </div>
        <div class="who">
          <small>{{ c.mask.name }}</small>
          <b>{{ c.owner?.name ?? '…' }}</b>
          <span class="spotted">
            <template v-if="c.spotted.length">
              <span class="by">узнали:</span>
              <Avatar v-for="s in c.spotted" :key="s.id" :player="s" :code="view.code" :size="36" :ring="2" />
            </template>
            <template v-else-if="c.asked">маска не раскрыта!</template>
          </span>
        </div>
        <b v-if="c.gain" class="gain">+{{ c.gain }}</b>
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
  align-items: center;
  gap: 26px;
}

.title {
  font-size: 56px;
  color: var(--yellow);
  animation: pop-in 400ms both;
}

.grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 30px;
}

.grid.few {
  grid-template-columns: minmax(0, 1000px);
  justify-content: center;
}

.card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 22px;
  animation: pop-in 450ms both;
}

.flip {
  position: relative;
  width: 100px;
  height: 100px;
  display: grid;
  place-items: center;
}

.flip > * {
  grid-area: 1 / 1;
}

.mask {
  animation: mask-off 500ms ease-in both;
}

.face {
  animation: face-on 450ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

@keyframes mask-off {
  to {
    translate: 60px -50px;
    rotate: 30deg;
    opacity: 0;
  }
}

@keyframes face-on {
  from {
    scale: 0.3;
    opacity: 0;
  }
}

.who {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-weight: 800;
}

.who small {
  font-size: 20px;
  color: var(--pink);
}

.who b {
  font-size: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spotted {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  font-size: 20px;
  color: var(--muted);
}

.by {
  margin-right: 4px;
}

.gain {
  font-size: 30px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
