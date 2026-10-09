<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'clueReveal' ? view.value.phase : null));
const author = computed(() => playerById(phase.value?.author));
const options = computed(() => {
  const p = phase.value;
  if (!p) return [];
  return p.options.map((word) => ({
    word,
    right: word === p.word,
    pickers: Object.keys(p.picks)
      .filter((id) => p.picks[id] === word)
      .map((id) => playerById(id))
      .filter((pl) => pl !== undefined),
  }));
});
const hits = computed(() => options.value.find((o) => o.right)?.pickers.length ?? 0);

onMounted(() => audio.sfx(hits.value > 0 ? 'drumroll' : 'buzz'));
</script>

<template>
  <div v-if="phase && view && author" class="reveal">
    <Confetti v-if="hits > 0" :delay="1.2" :y="0.4" />
    <div class="head">
      <Avatar :player="author" :code="view.code" :size="110" :ring="5" />
      <div class="paper sticker hand">{{ phase.clue }}</div>
      <b v-if="phase.gains[author.id]" class="gain big display">+{{ phase.gains[author.id] }}</b>
    </div>
    <div class="options">
      <div v-for="(o, i) in options" :key="o.word" class="option" :class="{ right: o.right }" :style="{ animationDelay: `${0.2 + i * 0.1}s` }">
        <div class="word display">{{ o.word }}</div>
        <div class="faces">
          <div v-for="(p, j) in o.pickers" :key="p.id" class="face" :style="{ animationDelay: `${1.3 + j * 0.08}s` }">
            <Avatar :player="p" :code="view.code" :size="64" :ring="3" />
            <b v-if="phase.gains[p.id]" class="gain">+{{ phase.gains[p.id] }}</b>
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
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.head {
  display: flex;
  align-items: center;
  gap: 30px;
}

.paper {
  padding: 16px 40px;
  font-size: 60px;
  rotate: -1.5deg;
  background: #fff8d6;
  color: var(--ink);
}

.options {
  flex: 1;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 26px;
  align-items: start;
}

.option {
  padding: 20px 14px;
  border-radius: 26px;
  background: rgba(18, 6, 42, 0.55);
  opacity: 0.6;
  animation: pop-in 400ms both;
}

.option.right {
  opacity: 1;
  background: rgba(46, 212, 122, 0.3);
  outline: 5px solid var(--green);
}

.word {
  font-size: 38px;
  text-align: center;
  overflow-wrap: break-word;
}

.right .word {
  color: var(--green);
  -webkit-text-stroke: 3px var(--ink);
  paint-order: stroke;
  animation: clue-win 600ms 0.9s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

.faces {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.face {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  animation: pop-in 350ms both;
}

.gain {
  font-size: 22px;
  color: var(--green);
}

.gain.big {
  font-size: 44px;
  -webkit-text-stroke: 3px var(--ink);
  paint-order: stroke;
}

@keyframes clue-win {
  from {
    scale: 1;
  }
  50% {
    scale: 1.25;
  }
}
</style>
