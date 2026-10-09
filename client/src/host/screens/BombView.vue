<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import Avatar from '../../common/Avatar.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { audio } from '../../common/audio';
import { playerById, socket, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'bomb' ? view.value.phase : null));
const holder = computed(() => playerById(phase.value?.holder));

// the fuse is secret, so the ticking only speeds up with time: it tells nothing, but it sure feels like it does
let timer: ReturnType<typeof setTimeout> | undefined;
/** Live time this screen has ticked through; a pause stops it, so resuming does not jump to full speed. */
let elapsed = phase.value ? Math.max(0, socket.now() - phase.value.startedAt) : 0;
function tick(): void {
  const gap = Math.max(220, 900 - elapsed / 30);
  if (phase.value && !view.value?.paused) {
    audio.sfx('tick');
    elapsed += gap;
  }
  timer = setTimeout(tick, gap);
}
onMounted(tick);
watch(
  () => phase.value?.passes,
  (n, was) => {
    if (n !== undefined && was !== undefined && n > was) audio.sfx('whoosh');
  },
);
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div v-if="phase && view" class="bomb">
    <div class="card sticker">
      <div class="label display"><Emoji char="💣" /> Горячая картошка · {{ phase.round }} из {{ phase.rounds }}</div>
      <WordsIn class="text" :text="phase.category" />
    </div>
    <div class="stage">
      <div v-if="holder" :key="holder.id" class="holder">
        <Avatar :player="holder" :code="view.code" :size="230" :ring="8" />
        <div class="name display">{{ holder.name }}</div>
      </div>
      <div :key="phase.passes" class="device">
        <Emoji char="💣" :size="300" rim />
        <Emoji class="spark" char="💥" :size="90" />
      </div>
    </div>
    <div class="passes ribbon">Передач: {{ phase.passes }}</div>
  </div>
</template>

<style scoped>
.bomb {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.card {
  align-self: stretch;
  padding: 28px 44px;
  text-align: center;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 6px;
  font-size: 68px;
  font-weight: 900;
  line-height: 1.1;
}

.stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
}

.holder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: catch 450ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.name {
  font-size: 48px;
  color: #fff;
  -webkit-text-stroke: 8px var(--ink);
  paint-order: stroke;
}

.device {
  position: relative;
  animation:
    fly-in 380ms cubic-bezier(0.3, 1.4, 0.5, 1) both,
    shake 0.18s 380ms linear infinite;
}

.spark {
  position: absolute;
  top: -10px;
  right: 6px;
  animation: flicker 0.25s steps(2) infinite;
}

.passes {
  font-size: 26px;
  color: #fff;
}

@keyframes catch {
  from {
    scale: 0.6;
    rotate: -12deg;
    opacity: 0;
  }
}

@keyframes fly-in {
  from {
    translate: -420px -120px;
    rotate: -80deg;
    scale: 0.5;
  }
}

@keyframes shake {
  25% {
    translate: -4px 2px;
    rotate: -3deg;
  }
  75% {
    translate: 4px -2px;
    rotate: 3deg;
  }
}

@keyframes flicker {
  50% {
    opacity: 0.4;
    scale: 0.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .device,
  .spark {
    animation: none;
  }
}
</style>
