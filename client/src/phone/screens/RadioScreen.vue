<script setup lang="ts">
import { computed, ref } from 'vue';
import Emoji from '../../common/Emoji.vue';
import { RADIO_WORDS_MAX } from '../../../../shared/protocol';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'radio' || p?.kind === 'radioVote' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'radio' || p?.kind === 'radioVote' ? p : null;
});
// once you start retelling, the rumour is gone: the game is about what memory keeps
const writing = ref(false);
const text = ref('');
const words = computed(() => text.value.split(/\s+/).filter(Boolean).length);
const ok = computed(() => words.value > 0 && words.value <= RADIO_WORDS_MAX);

function submit(): void {
  if (ok.value) answer(text.value.trim());
}
</script>

<template>
  <div v-if="phase && personal" class="radio">
    <template v-if="phase.kind === 'radio' && personal.kind === 'radio'">
      <Waiting v-if="personal.done" title="Слух передан" note="Ждём остальных рассказчиков" icon="📻" />
      <template v-else-if="!writing">
        <p class="tip">Шаг {{ phase.step }} из {{ phase.steps }}</p>
        <div class="rumour sticker">
          <Emoji char="📻" :size="48" />
          <small>{{ personal.original ? 'Свежий слух:' : 'Вам по секрету рассказали:' }}</small>
          <b>{{ personal.incoming }}</b>
        </div>
        <p class="tip">Запомните — после нажатия текст исчезнет</p>
        <button class="btn pink" @click="writing = true">Пересказать</button>
      </template>
      <form v-else class="write" @submit.prevent="submit">
        <p class="tip">Перескажите своими словами</p>
        <textarea v-model="text" rows="4" maxlength="140" placeholder="Говорят, что…" />
        <span class="count" :class="{ over: words > RADIO_WORDS_MAX }">{{ words }} / {{ RADIO_WORDS_MAX }} слов</span>
        <button class="btn pink" type="submit" :disabled="!ok">Передать дальше</button>
      </form>
    </template>

    <template v-else-if="phase.kind === 'radioVote' && personal.kind === 'radioVote'">
      <Waiting v-if="personal.answer !== undefined" title="Голос принят" icon="📻" />
      <template v-else>
        <p class="tip">Какой слух получился смешнее всех?</p>
        <div class="finals">
          <button
            v-for="(f, i) in phase.finals"
            :key="i"
            class="final deal"
            :style="{ '--i': i }"
            :disabled="personal.mine.includes(i)"
            @click="answer(i)"
          >
            {{ f }}
            <small v-if="personal.mine.includes(i)">ваш вариант</small>
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.radio {
  flex: 1;
  min-height: 0;
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

.rumour {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px;
  text-align: center;
}

.rumour small {
  font-weight: 800;
  color: var(--muted);
}

.rumour b {
  font-size: 22px;
  line-height: 1.25;
}

.write {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

textarea {
  padding: 12px 14px;
  border-radius: 18px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 18px;
  font-weight: 700;
  resize: none;
}

.count {
  align-self: flex-end;
  font-weight: 800;
  color: var(--muted);
}

.count.over {
  color: var(--pink);
}

.finals {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.final {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 4px 0 var(--ink);
  font: inherit;
  font-weight: 800;
  text-align: left;
}

.final:disabled {
  opacity: 0.45;
}

.final small {
  color: var(--muted);
}
</style>
