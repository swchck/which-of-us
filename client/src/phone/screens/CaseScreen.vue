<script setup lang="ts">
import { computed, ref } from 'vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import Avatar from '../../common/Avatar.vue';
import { answer, playerById, state, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'caseSurvey' || p?.kind === 'caseClue' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'caseSurvey' || p?.kind === 'caseClue' ? p : null;
});
const picks = ref<(number | null)[]>([]);
const ready = computed(() => phase.value?.kind === 'caseSurvey' && phase.value.questions.every((_, i) => picks.value[i] != null));
const suspects = computed(() => (view.value?.players ?? []).filter((p) => p.id !== state.you));
const accused = computed(() => (personal.value?.kind === 'caseClue' ? playerById(personal.value.answer) : undefined));

function choose(q: number, o: number): void {
  const next = [...picks.value];
  next[q] = o;
  picks.value = next;
}
</script>

<template>
  <div v-if="phase && personal && view" class="case">
    <template v-if="phase.kind === 'caseSurvey' && personal.kind === 'caseSurvey'">
      <Waiting v-if="personal.done" title="Анкета сдана" note="Следствие начинается" icon="🔎" />
      <template v-else>
        <p class="tip">Анкета для протокола. Отвечайте честно!</p>
        <div v-for="(q, i) in phase.questions" :key="q.q" class="q sticker">
          <b>{{ q.q }}</b>
          <div class="options">
            <button v-for="(o, k) in q.options" :key="o" class="opt" :class="{ on: picks[i] === k }" @click="choose(i, k)">{{ o }}</button>
          </div>
        </div>
        <button class="btn green" :disabled="!ready" @click="answer(picks as number[])">Сдать анкету</button>
      </template>
    </template>
    <template v-else-if="phase.kind === 'caseClue' && personal.kind === 'caseClue'">
      <div class="clues sticker">
        <span class="label">{{ phase.crime }}</span>
        <span v-for="(c, i) in phase.clues" :key="i" class="clue">🔎 {{ c }}</span>
      </div>
      <Waiting v-if="personal.culprit" title="Это сделали вы!" note="Только тихо. Каждый, кто вас не вычислит, — очки вам" icon="🤫" />
      <Waiting v-else-if="accused" :title="`Вы обвинили: ${accused.name}`" note="Обвинение принято, ждём остальные улики" icon="🔎" />
      <template v-else>
        <p class="tip">Кто это сделал? Чем раньше обвините верно, тем больше очков. Обвинить можно один раз</p>
        <div class="grid">
          <button v-for="(p, i) in suspects" :key="p.id" class="pick deal" :style="{ '--c': PLAYER_COLORS[p.color], '--i': i }" @click="answer(p.id)">
            <Avatar :player="p" :code="view.code" :size="48" :ring="3" />
            <span class="name">{{ p.name }}</span>
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.case {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.q {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.opt {
  min-height: 44px;
  padding: 6px 8px;
  border-radius: 12px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-weight: 800;
}

.opt.on {
  background: var(--yellow);
}

.clues {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  font-weight: 800;
}

.label {
  font-size: 18px;
  font-weight: 900;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.pick {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 8px 12px;
  border-radius: 18px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 4px 0 var(--ink);
  font: inherit;
  font-weight: 900;
  text-align: left;
}

.name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
