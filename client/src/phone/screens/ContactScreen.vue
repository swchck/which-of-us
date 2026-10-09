<script setup lang="ts">
import { computed, ref } from 'vue';
import { clueProblem } from '../../../../shared/catalog';
import { GUESS_MAX, QUOTE_MAX } from '../../../../shared/protocol';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'contactWrite' || p?.kind === 'contactGuess' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'contactWrite' || p?.kind === 'contactGuess' ? p : null;
});
const norm = (s: string) => s.trim().toLowerCase().replace(/ё/g, 'е');
const word = ref('');
const hint = ref('');
const problem = computed(() => {
  const prefix = phase.value?.prefix ?? '';
  if (!word.value.trim()) return null;
  if (/\s/.test(word.value.trim())) return 'Только одно слово';
  if (!norm(word.value).startsWith(norm(prefix))) return `Слово должно начинаться на «${prefix}»`;
  if (norm(word.value) === norm(prefix)) return 'Нужно слово длиннее';
  return hint.value.trim() ? clueProblem(word.value, hint.value) : null;
});
const picked = ref<string | null>(null);
const guesses = ref<Record<string, string>>({});
const others = computed(() => {
  const mine = personal.value?.kind === 'contactGuess' ? personal.value.mine : undefined;
  return phase.value?.kind === 'contactGuess' ? phase.value.hints.filter((h) => h.id !== mine) : [];
});

function sendWord(): void {
  if (word.value.trim() && hint.value.trim() && !problem.value) answer([word.value.trim(), hint.value.trim()]);
}

const leading = computed(() => personal.value?.kind === 'contactGuess' && personal.value.leader);
// the leader answers every hint at once, anyone else only the hint picked last
const ready = computed(() =>
  leading.value
    ? Object.entries(guesses.value)
        .filter(([, w]) => w.trim())
        .map(([id, w]) => `${id}:${w.trim()}`)
    : picked.value && guesses.value[picked.value]?.trim()
      ? [`${picked.value}:${guesses.value[picked.value]!.trim()}`]
      : [],
);

function sendGuesses(): void {
  if (ready.value.length) answer(leading.value ? ready.value : ready.value[0]!);
}
</script>

<template>
  <div v-if="phase && personal" class="contact">
    <div class="prefix display">{{ phase.prefix }}…</div>
    <template v-if="phase.kind === 'contactWrite' && personal.kind === 'contactWrite'">
      <Waiting v-if="personal.leader" title="Вы ведущий" note="Остальные загадывают слова на открытые буквы" icon="🤝" />
      <Waiting v-else-if="personal.done" title="Слово загадано" note="Скоро будем ловить контакт" icon="🤝" />
      <form v-else class="form" @submit.prevent="sendWord">
        <input v-model="word" :maxlength="GUESS_MAX" autocomplete="off" autocapitalize="off" :placeholder="`Ваше слово на «${phase.prefix}»`" />
        <input v-model="hint" :maxlength="QUOTE_MAX" autocomplete="off" placeholder="Подсказка к нему" />
        <span v-if="problem" class="problem">{{ problem }}</span>
        <button class="btn green" :disabled="!word.trim() || !hint.trim() || !!problem">Загадать</button>
      </form>
    </template>
    <template v-else-if="phase.kind === 'contactGuess' && personal.kind === 'contactGuess'">
      <Waiting v-if="personal.done" title="Ответ принят" note="Смотрим, был ли контакт" icon="🤝" />
      <template v-else>
        <p class="tip">{{ personal.leader ? 'Вы ведущий: назовите чужие слова первым, чтобы перебить контакт' : 'Выберите одну подсказку и назовите слово' }}</p>
        <div v-for="h in others" :key="h.id" class="hint sticker" :class="{ on: picked === h.id }" @click="picked = h.id">
          <span>{{ h.text }}</span>
          <input
            v-if="personal.leader || picked === h.id"
            v-model="guesses[h.id]"
            :maxlength="GUESS_MAX"
            autocomplete="off"
            autocapitalize="off"
            placeholder="Это слово…"
            @focus="picked = h.id"
          />
        </div>
        <button class="btn green" :disabled="!ready.length" @click="sendGuesses">Отправить</button>
      </template>
    </template>
  </div>
</template>

<style scoped>
.contact {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prefix {
  text-align: center;
  font-size: 44px;
  letter-spacing: 0.08em;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 12px 14px;
  border: var(--line) solid var(--ink);
  border-radius: 14px;
  font: inherit;
  font-size: 20px;
  font-weight: 800;
}

.problem {
  font-size: 14px;
  font-weight: 800;
  color: var(--red);
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.hint {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  font-weight: 800;
}

.hint.on {
  background: var(--yellow);
}
</style>
