<script setup lang="ts">
import { computed } from 'vue';
import { HAT_MODE_INFO } from '../../../../shared/catalog';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'hat' || p?.kind === 'hatReveal' ? p : null;
});
const explainer = computed(() => playerById(phase.value?.explainer));
const mode = computed(() => (phase.value ? HAT_MODE_INFO[phase.value.mode] : null));
</script>

<template>
  <div v-if="phase && view && mode" class="hat">
    <div class="top">
      <div class="mode sticker">
        <div class="label display"><Emoji char="🤠" /> Шляпа · круг {{ phase.round }} из {{ phase.rounds }}</div>
        <div class="title display"><Emoji :char="mode.icon" /> {{ mode.title }}</div>
        <div class="rule">{{ mode.rule }}</div>
      </div>
      <TimerRing v-if="phase.kind === 'hat'" :deadline="phase.deadline" :size="170" />
    </div>

    <div class="stage">
      <div class="explainer">
        <Avatar v-if="explainer" :player="explainer" :code="view.code" :size="190" :ring="6" />
        <b class="display">{{ explainer?.name }}</b>
        <span>{{ phase.kind === 'hat' ? 'объясняет' : 'итог хода' }}</span>
        <div v-if="phase.kind === 'hat'" class="left sticker display"><Emoji char="🤠" /> в шляпе: {{ phase.left }}</div>
      </div>

      <div class="caught">
        <div v-if="phase.got.length === 0" class="empty display">{{ phase.kind === 'hat' ? 'Пишите догадки на телефонах!' : 'Ни одного слова' }}</div>
        <div v-for="(c, i) in phase.got" :key="`${c.word}${i}`" class="word sticker" :style="{ animationDelay: phase.kind === 'hatReveal' ? `${0.1 + i * 0.08}s` : '0s' }">
          <span class="display">{{ c.word }}</span>
          <Avatar v-if="playerById(c.player)" :player="playerById(c.player)!" :code="view.code" :size="48" :ring="3" />
        </div>
      </div>
    </div>

    <div v-if="phase.kind === 'hat' && phase.feed.length" class="feed">
      <span v-for="(f, i) in phase.feed.slice(-5)" :key="i" class="try">{{ playerById(f.player)?.name }}: {{ f.text }}</span>
    </div>
    <div v-else-if="phase.kind === 'hatReveal'" class="gains">
      <span v-for="(g, id) in phase.gains" :key="id" class="gain sticker">
        <Avatar v-if="playerById(id)" :player="playerById(id)!" :code="view.code" :size="44" :ring="3" />
        <b>+{{ g }}</b>
      </span>
    </div>
  </div>
</template>

<style scoped>
.hat {
  position: absolute;
  inset: 0;
  padding: 50px 170px 230px 90px;
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.mode {
  flex: 1;
  padding: 22px 36px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 26px;
  color: var(--pink);
}

.title {
  font-size: 60px;
  line-height: 1.05;
}

.rule {
  font-size: 26px;
  font-weight: 800;
}

.stage {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 50px;
}

.explainer {
  width: 300px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 3px 0 var(--ink);
}

.explainer b {
  font-size: 46px;
}

.left {
  margin-top: 8px;
  padding: 8px 20px;
  font-size: 28px;
  color: var(--ink);
  text-shadow: none;
}

.caught {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 16px;
}

.empty {
  font-size: 40px;
  color: #fff;
  text-shadow: 0 4px 0 var(--ink);
}

.word {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px 10px 24px;
  font-size: 38px;
  animation: pop-in 400ms both;
}

.feed {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.try {
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  font-size: 22px;
  font-weight: 800;
  color: var(--ink);
}

.gains {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.gain {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 18px 6px 8px;
  font-size: 30px;
  color: var(--green);
  animation: pop-in 400ms both;
}

.gain b {
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
