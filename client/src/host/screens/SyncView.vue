<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import Avatar from '../../common/Avatar.vue';
import Icon from '../../common/Icon.vue';
import { computed } from 'vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--green)'];

const phase = computed(() => (view.value?.phase.kind === 'sync' ? view.value.phase : null));
const groups = computed(
  () => phase.value?.groups.map((g) => g.map((id) => playerById(id)).filter((p) => p !== undefined)) ?? [],
);
</script>

<template>
  <div v-if="phase && view" class="sync">
    <div class="top">
      <div :key="phase.question" class="card sticker">
        <div class="label display"><Emoji char="🤝" /> Синхрон · {{ phase.round }} из {{ phase.rounds }}</div>
        <WordsIn class="text" :text="phase.question" />
        <div class="options">
          <span v-for="(o, i) in phase.options" :key="i" class="option" :style="{ background: COLORS[i], '--i': i }">{{ o }}</span>
        </div>
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div class="pairs">
      <div v-for="(g, i) in groups" :key="i" class="pair" :style="{ animationDelay: `${0.3 + i * 0.1}s` }">
        <div v-for="p in g" :key="p.id" class="member">
          <Avatar :player="p" :code="view.code" :size="96" />
          <span v-if="phase.answered.includes(p.id)" class="tick"><Icon name="check" /></span>
          <span class="name">{{ p.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sync {
  position: absolute;
  inset: 0;
  padding: 60px 90px 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 30px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 30px 44px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 8px;
  font-size: 58px;
  font-weight: 900;
  line-height: 1.12;
}

.options {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.option {
  padding: 14px 16px;
  border-radius: 18px;
  border: 4px solid var(--ink);
  box-shadow: 3px 4px 0 var(--ink);
  font-size: 26px;
  font-weight: 900;
  text-align: center;
  color: var(--ink);
  animation: pop-in 400ms calc(0.6s + var(--i) * 0.1s) both;
}

.pairs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 26px 40px;
}

.pair {
  display: flex;
  gap: 18px;
  padding: 18px 24px 12px;
  border-radius: 28px;
  border: 4px dashed rgba(255, 255, 255, 0.35);
  background: rgba(18, 6, 42, 0.5);
  animation: pop-in 500ms both;
}

.member {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tick {
  position: absolute;
  top: -6px;
  right: -8px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--green);
  border: 3px solid var(--ink);
  color: var(--ink);
  font-size: 22px;
  animation: pop-in 300ms both;
}

.name {
  font-size: 24px;
  font-weight: 900;
}
</style>
