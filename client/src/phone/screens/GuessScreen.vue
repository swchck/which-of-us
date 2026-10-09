<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, ref, watch } from 'vue';
import { GUESS_MAX, type InkOp } from '../../../../shared/protocol';
import InkView from '../../common/InkView.vue';
import DrawPad from '../DrawPad.vue';
import { live, playerById, send, view } from '../store';
import { event } from '../haptics';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'guess' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'guess' ? view.value.personal : null));
const artist = computed(() => playerById(phase.value?.artist));

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
  // too soon: keep the text so the guess is not silently lost, and wobble to say «wait a beat»
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

function onOp(op: InkOp): void {
  const v = view.value;
  if (v) send({ t: 'ink', phaseId: v.phaseId, op });
}

watch(
  () => personal.value?.tries.length,
  (n, was) => {
    if (n !== undefined && was !== undefined && n > was) event(personal.value?.feedback === 'close' ? 'hit' : 'tick');
  },
);

watch(
  () => personal.value?.solved,
  (solved, was) => {
    if (solved && !was) event('win');
  },
);
</script>

<template>
  <div v-if="phase && personal && view" class="guess">
    <template v-if="personal.role === 'artist' && phase.mime">
      <div class="task sticker">
        <div class="label">Покажите слово жестами</div>
        <div class="word display">{{ personal.word }}</div>
      </div>
      <div class="mime-rules sticker">
        <Emoji char="🐊" :size="72" />
        <p>Ни слов, ни звуков, ни букв в воздухе. Только жесты, мимика и актёрский талант!</p>
      </div>
      <p class="note">Угадали: {{ phase.solved.length }}</p>
    </template>
    <template v-else-if="personal.role === 'artist'">
      <div class="task sticker">
        <div class="label">Нарисуйте слово · не пишите буквы!</div>
        <div class="word display">{{ personal.word }}</div>
      </div>
      <DrawPad :key="view.phaseId" :code="view.code" :board="phase.board" :initial="personal.strokes" @op="onOp" />
      <p class="note">Угадали: {{ phase.solved.length }}</p>
    </template>

    <Waiting
      v-else-if="personal.solved"
      title="Угадано!"
      note="Смотрите, как мучаются остальные"
      icon="🎯"
    />

    <template v-else>
      <div class="head">
        <span class="who">{{ phase.mime ? 'Показывает' : 'Рисует' }} {{ artist?.name }}</span>
        <span class="hint display">{{ phase.hint }}</span>
      </div>
      <div v-if="phase.mime" class="mime-watch sticker">
        <Emoji char="🐊" :size="64" />
        <p>Смотрите на {{ artist?.name }} и пишите догадки</p>
      </div>
      <div v-else class="watch sticker">
        <InkView :code="view.code" :board="phase.board" :live="live" />
      </div>
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
      <div v-if="personal.feedback" :key="personal.tries.length" class="verdict pop-in" :class="personal.feedback">
        <Emoji :char="personal.feedback === 'close' ? '🔥' : '❄️'" />
        {{ personal.feedback === 'close' ? 'Горячо! Почти угадали' : 'Мимо' }}
      </div>
      <div v-if="personal.tries.length" class="tries">
        <span v-for="(t, i) in personal.tries" :key="i">{{ t }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ask.shake {
  animation: wobble 0.3s ease-in-out;
}

.mime-rules,
.mime-watch {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
}

.mime-rules p,
.mime-watch p {
  margin: 0;
}

.guess {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.task {
  padding: 10px 14px;
  flex: none;
  background: var(--yellow);
}

.label {
  font-size: 13px;
  font-weight: 900;
  color: #7a5fc0;
  text-transform: uppercase;
}

.word {
  font-size: 28px;
  font-weight: 900;
  line-height: 1.1;
}

.note {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.who {
  font-weight: 800;
  color: var(--muted);
}

.hint {
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.08em;
  white-space: pre;
}

.watch {
  padding: 0;
  overflow: hidden;
  flex: none;
}

.ask {
  display: flex;
  gap: 10px;
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
  align-self: center;
  padding: 8px 16px;
  border-radius: 999px;
  border: 3px solid var(--ink);
  font-weight: 900;
  color: var(--ink);
  background: var(--cyan);
}

.verdict.close {
  background: var(--orange);
}

.tries {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.tries span {
  padding: 3px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  font-weight: 700;
  text-decoration: line-through;
  color: var(--muted);
}
</style>
