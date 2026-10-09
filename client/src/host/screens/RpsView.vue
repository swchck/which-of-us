<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import Icon from '../../common/Icon.vue';
import { computed } from 'vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'rps' ? view.value.phase : null));
const stage = computed(() => {
  const left = phase.value?.left ?? 0;
  if (left <= 2) return 'Финал';
  if (left <= 4) return 'Полуфинал';
  return 'Отборочный тур';
});
const matches = computed(() =>
  (phase.value?.matches ?? []).map((m) => ({ key: `${m.a}:${m.b}`, a: playerById(m.a), b: m.b ? playerById(m.b) : undefined, bye: m.b === null })),
);
</script>

<template>
  <div v-if="phase && view" class="rps">
    <div class="top">
      <div class="label display"><Emoji char="✌️" /> Цу-е-фа · {{ phase.replay ? 'переигровка' : stage }}</div>
      <TimerRing :deadline="phase.deadline" :size="140" />
    </div>
    <div class="hands">
      <Emoji class="hand" char="✊" :size="110" rim />
      <Emoji class="hand" char="✌️" :size="110" rim />
      <Emoji class="hand" char="✋" :size="110" rim />
    </div>
    <div class="matches" :class="{ few: matches.length <= 2 }">
      <div v-for="(m, i) in matches" :key="m.key" class="match sticker" :class="{ bye: m.bye }" :style="{ animationDelay: `${i * 0.12}s` }">
        <template v-if="m.a">
          <div class="side" :class="{ ready: phase.answered.includes(m.a.id) }">
            <Avatar :player="m.a" :code="view.code" :size="100" :ring="4" />
            <span class="name" :style="{ '--len': m.a.name.length }">{{ m.a.name }}</span>
            <span v-if="phase.answered.includes(m.a.id)" class="ok pop-in"><Icon name="check" /></span>
          </div>
          <template v-if="m.b">
            <span class="vs display">VS</span>
            <div class="side" :class="{ ready: phase.answered.includes(m.b.id) }">
              <Avatar :player="m.b" :code="view.code" :size="100" :ring="4" />
              <span class="name" :style="{ '--len': m.b.name.length }">{{ m.b.name }}</span>
              <span v-if="phase.answered.includes(m.b.id)" class="ok pop-in"><Icon name="check" /></span>
            </div>
          </template>
          <span v-else class="pass">проходит дальше без игры</span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rps {
  position: absolute;
  inset: 0;
  padding: 40px 90px 230px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-size: 44px;
  color: var(--yellow);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.hands {
  display: flex;
  justify-content: center;
  gap: 50px;
}

.hand {
  animation: rps-shake 0.5s ease-in-out infinite alternate;
}

.hand:nth-child(2) {
  animation-delay: 0.15s;
}

.hand:nth-child(3) {
  animation-delay: 0.3s;
}

.matches {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: center;
  gap: 22px 40px;
}

.matches.few {
  grid-template-columns: minmax(0, 900px);
  justify-content: center;
}

.match {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 14px 24px;
  animation: pop-in 400ms both;
}

.match.bye {
  opacity: 0.75;
}

.side {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
  transition: translate 300ms;
}

.side.ready {
  translate: 0 -8px;
}

.name {
  max-width: 220px;
  font-size: clamp(16px, calc(264px / var(--len)), 24px);
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ok {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 3px solid var(--ink);
  background: var(--green);
}

.vs {
  font-size: 44px;
  color: var(--pink);
}

.pass {
  font-size: 22px;
  font-weight: 800;
  color: var(--muted);
}

@keyframes rps-shake {
  from {
    translate: 0 -10px;
    rotate: -8deg;
  }
  to {
    translate: 0 10px;
    rotate: 8deg;
  }
}
</style>
