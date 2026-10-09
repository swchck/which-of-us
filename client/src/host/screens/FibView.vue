<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'fibVote' || p?.kind === 'fibReveal' ? p : null;
});
const options = computed(() => {
  const p = phase.value;
  if (p?.kind === 'fibVote') return p.options.map((o) => ({ ...o, author: undefined, votes: [] as string[] }));
  return p?.options ?? [];
});
</script>

<template>
  <div v-if="phase && view" class="fib">
    <div class="top">
      <div class="word sticker">
        <div class="label display"><Emoji :char="phase.title ? '💬' : '📖'" /> {{ phase.title ?? 'Словарь выдумок' }}</div>
        <div class="text display" :class="{ long: phase.title }">{{ phase.word }}</div>
        <div v-if="phase.kind === 'fibVote'" class="note">{{ phase.ask ?? 'Какое определение настоящее?' }} Голосуйте на телефонах</div>
      </div>
      <TimerRing v-if="phase.kind === 'fibVote'" :deadline="phase.deadline" :size="170" />
    </div>
    <div class="defs" :class="{ many: options.length > 5 }">
      <div
        v-for="(o, i) in options"
        :key="o.id"
        class="def sticker"
        :class="{ truth: phase.kind === 'fibReveal' && o.id === phase.truth }"
        :style="{ animationDelay: `${0.15 + i * 0.1}s` }"
      >
        <span class="t">{{ o.text }}</span>
        <template v-if="phase.kind === 'fibReveal'">
          <span class="who">
            <template v-if="o.id === phase.truth"><Emoji char="✅" /> Из словаря</template>
            <Avatar v-else-if="playerById(o.author)" :player="playerById(o.author)!" :code="view.code" :size="48" :ring="2" />
          </span>
          <span class="voters">
            <Avatar v-for="v in o.votes" :key="v" :player="playerById(v)!" :code="view.code" :size="38" :ring="2" />
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fib {
  position: absolute;
  inset: 0;
  padding: 50px 170px 230px 90px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.word {
  flex: 1;
  padding: 26px 40px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 26px;
  color: var(--pink);
}

.text {
  font-size: 80px;
  line-height: 1.05;
}

.text.long {
  font-size: 52px;
}

.note {
  font-size: 24px;
  font-weight: 700;
}

.defs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.defs.many {
  grid-template-columns: 1fr 1fr;
}

.def {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 22px;
  font-size: 30px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.def.truth {
  background: var(--green);
}

.t {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.who {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 22px;
}

.voters {
  display: flex;
  gap: 4px;
}
</style>
