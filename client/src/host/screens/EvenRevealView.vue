<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'evenReveal' ? view.value.phase : null));
const people = (ids: string[]) => ids.map((id) => playerById(id)).filter((p) => p !== undefined);
const sides = computed(() => {
  const p = phase.value;
  if (!p) return [];
  return p.options.map((title, i) => ({ key: String(i), title, players: people(p.sides[i]!), right: p.sides[i]!.some((id) => p.gains[id]) }));
});

const verdict = computed(() => {
  const [a, b] = phase.value?.sides ?? [[], []];
  if (a.length === b.length && a.length > 0) return { text: 'Поровну!', cls: 'true' };
  if (a.length === 0 || b.length === 0) return { text: 'Все заодно', cls: 'false' };
  return { text: 'Меньшинство!', cls: 'true' };
});

onMounted(() => audio.sfx('drumroll'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="Object.keys(phase.gains).length" :delay="1.3" :y="0.35" />
    <div class="statement plate">{{ phase.question }}</div>
    <div class="stamp display" :class="verdict.cls">{{ verdict.text }}</div>
    <div class="sides">
      <div v-for="s in sides" :key="s.key" class="side" :class="{ right: s.right }">
        <div class="head display">{{ s.title }} · {{ s.players.length }}</div>
        <div class="faces">
          <div v-for="(p, i) in s.players" :key="p.id" class="face" :style="{ animationDelay: `${1.6 + i * 0.1}s` }">
            <Avatar :player="p" :code="view.code" :size="80" :ring="3" />
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
  padding: 40px 90px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.statement {
  font-size: 38px;
  font-weight: 900;
  text-align: center;
  max-width: 1600px;
}

.stamp {
  padding: 6px 40px;
  border-radius: 18px;
  border: 6px solid var(--ink);
  font-size: 84px;
  color: var(--ink);
  rotate: -6deg;
  box-shadow: var(--shadow);
  animation: stamp 500ms 0.4s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

.stamp.true {
  background: var(--green);
}

.stamp.false {
  background: var(--pink);
  color: #fff;
}


.sides {
  flex: 1;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.side {
  padding: 18px;
  border-radius: 26px;
  background: rgba(18, 6, 42, 0.55);
  opacity: 0.7;
}

.side.right {
  opacity: 1;
  background: rgba(46, 212, 122, 0.3);
  outline: 4px solid var(--green);
}

.head {
  font-size: 32px;
  text-align: center;
}

.faces {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.face {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  animation: pop-in 400ms both;
}

.gain {
  font-size: 22px;
  color: var(--green);
}

@keyframes stamp {
  from {
    scale: 2.6;
    opacity: 0;
  }
}
</style>
