<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, ref, watch } from 'vue';
import { HAT_MODE_INFO } from '../../../../shared/catalog';
import { GUESS_MAX } from '../../../../shared/protocol';
import { answer, playerById, send, view } from '../store';
import { event } from '../haptics';

const phase = computed(() => (view.value?.phase.kind === 'hat' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'hat' ? view.value.personal : null));
const explainer = computed(() => playerById(phase.value?.explainer));
const mode = computed(() => (phase.value ? HAT_MODE_INFO[phase.value.mode] : null));

const text = ref('');
const input = ref<HTMLInputElement>();
const shake = ref(false);
/** The server ignores guesses closer together than 500 ms; a little margin for the trip. */
const GUESS_GAP_MS = 600;
let lastSent = 0;

function submit(): void {
  const v = view.value;
  const t = text.value.trim();
  if (!v || !t) return;
  if (Date.now() - lastSent < GUESS_GAP_MS) {
    shake.value = true;
    setTimeout(() => (shake.value = false), 300);
    return;
  }
  lastSent = Date.now();
  send({ t: 'guess', phaseId: v.phaseId, text: t });
  text.value = '';
  input.value?.focus();
}

watch(
  () => phase.value?.got.length,
  (n, was) => {
    if (n !== undefined && was !== undefined && n > was) event(personal.value?.word !== undefined ? 'hit' : 'tick');
  },
);
</script>

<template>
  <div v-if="phase && personal && mode" class="hat">
    <div class="mode sticker">
      <Emoji :char="mode.icon" :size="34" />
      <div>
        <b class="display">{{ mode.title }}</b>
        <small>{{ mode.rule }}</small>
      </div>
    </div>

    <template v-if="personal.word !== undefined">
      <div class="task sticker">
        <div class="label">Объясните слово</div>
        <div :key="personal.word" class="word display pop-in">{{ personal.word }}</div>
      </div>
      <button class="btn" :disabled="phase.left < 2" @click="answer('skip')">Пропустить</button>
      <p class="note">Угадано: {{ phase.got.length }} · в шляпе: {{ phase.left }}</p>
    </template>

    <template v-else>
      <p class="who">Объясняет {{ explainer?.name }}</p>
      <form class="ask" :class="{ shake }" @submit.prevent="submit">
        <input
          ref="input"
          v-model="text"
          :maxlength="GUESS_MAX"
          placeholder="Ваш вариант"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          enterkeyhint="send"
        />
        <button class="btn pink" type="submit" :disabled="!text.trim()" aria-label="Отправить"><Icon name="arrow" /></button>
      </form>
      <div v-if="personal.close" class="verdict close pop-in"><Emoji char="🔥" /> Горячо! Почти угадали</div>
      <p class="note">Вы угадали: {{ personal.got }}</p>
    </template>
  </div>
</template>

<style scoped>
.hat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mode {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.mode b {
  display: block;
  font-size: 20px;
}

.mode small {
  font-size: 15px;
  font-weight: 700;
  color: var(--muted);
}

.task {
  padding: 14px 16px;
  background: var(--yellow);
}

.label {
  font-size: 13px;
  font-weight: 900;
  color: #7a5fc0;
  text-transform: uppercase;
}

.word {
  font-size: 40px;
  font-weight: 900;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.who {
  margin: 0;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
}

.note {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.ask {
  display: flex;
  gap: 10px;
}

.ask.shake {
  animation: wobble 0.3s ease-in-out;
}

.ask input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: 20px;
  font-weight: 800;
  padding: 12px 14px;
  border-radius: 16px;
  border: var(--line) solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 4px 0 var(--ink);
  outline: none;
}

.ask .btn {
  min-width: 64px;
  font-size: 26px;
}

.verdict {
  text-align: center;
  font-size: 20px;
  font-weight: 900;
  color: var(--pink);
}
</style>
