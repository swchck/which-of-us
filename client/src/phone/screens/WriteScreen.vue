<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import { computed, ref } from 'vue';
import { CLUE_MAX, CLUE_WORDS, FIB_MAX, GUESS_MAX, HERD_MAX, QUIP_MAX, QUOTE_MAX } from '../../../../shared/protocol';
import { clueProblem, clueWords, givesAway } from '../../../../shared/catalog';
import Avatar from '../../common/Avatar.vue';
import { answer, playerById, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'write' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'write' ? view.value.personal : null));
const author = computed(() => playerById(phase.value?.author));
const about = computed(() => playerById(personal.value?.about));
const PALETTE = [
  '😂', '😎', '🥳', '😴', '🤓', '😇', '🤪', '🥺', '😈', '🤠', '🙃', '🤯',
  '🍕', '🍔', '☕️', '🍰', '🥑', '🍜', '🐱', '🐶', '🦄', '🐢', '🦊', '🐼',
  '🎮', '📚', '🎸', '⚽️', '🏖️', '✈️', '🚗', '💻', '📱', '🎨', '🛋️', '💤',
  '🔥', '✨', '❤️', '💸', '🌙', '☀️', '🌈', '🎉', '👑', '💪', '🧠', '🤡',
];
const EMOJI_LIMIT = 5;
const emoji = ref<string[]>([]);

function addEmoji(e: string): void {
  if (emoji.value.length < EMOJI_LIMIT) emoji.value = [...emoji.value, e];
}

function submitEmoji(): void {
  if (emoji.value.length) answer(emoji.value.join(''));
}
const text = ref('');
const limit = computed(() => (phase.value?.hat ? GUESS_MAX : phase.value?.fib ? FIB_MAX : phase.value?.herd || phase.value?.odd || phase.value?.forehead ? HERD_MAX : phase.value?.quip ? QUIP_MAX : phase.value?.clue ? CLUE_MAX : QUOTE_MAX));
const wordCount = computed(() => clueWords(text.value).length);
const clueError = computed(() => {
  if (!text.value.trim()) return null;
  if (phase.value?.clue) return clueProblem(personal.value?.prompt ?? '', text.value);
  if (phase.value?.forehead && givesAway(personal.value?.prompt ?? '', text.value)) return 'Без самого слова и однокоренных';
  return null;
});
const lines = ref(['', '', '']);
const linesReady = computed(() => lines.value.every((l) => l.trim()));

function submit(): void {
  const value = text.value.trim();
  if (value && !clueError.value) answer(value);
}

function submitLines(): void {
  if (linesReady.value) answer(lines.value.map((l) => l.trim()));
}
</script>

<template>
  <div v-if="phase" class="write">
    <Waiting
      v-if="personal?.watching && phase.story"
      :title="`Пишет ${author?.name ?? ''}`"
      note="Ваша очередь тоже придёт — следите за телефоном"
      icon="📜"
    />
    <Waiting
      v-else-if="personal?.watching && phase.quip"
      title="Вы в жюри"
      note="Пары сочиняют ответы — скоро вы решите, чей смешнее"
      icon="🥊"
    />
    <Waiting
      v-else-if="personal?.watching && phase.tale"
      :title="`Подсказку придумывает ${author?.name ?? ''}`"
      note="Скоро будем искать рисунок рассказчика"
      icon="📖"
    />
    <Waiting
      v-else-if="personal?.watching"
      :title="`Сочиняет ${author?.name ?? ''}`"
      note="Две правды и одна ложь — скоро будем искать враньё"
      icon="🤥"
    />
    <template v-else-if="phase.emoji && !personal?.done">
      <div class="prompt sticker">
        <div class="label">Тайный герой — никому не говорите</div>
        <div class="hero">
          <Avatar v-if="about && view" :player="about" :code="view.code" :size="64" :ring="3" />
          <span class="text">{{ about?.name ?? '…' }}</span>
        </div>
      </div>
      <div class="picked display">
        <Emoji v-for="(e, i) in emoji" :key="i" class="pop-in" :char="e" />
        <span v-if="!emoji.length" class="placeholder">три эмодзи про героя</span>
      </div>
      <div class="palette">
        <button v-for="e in PALETTE" :key="e" type="button" class="key" :disabled="emoji.length >= EMOJI_LIMIT" @click="addEmoji(e)"><Emoji :char="e" /></button>
      </div>
      <div class="row">
        <button class="btn ghost small" type="button" :disabled="!emoji.length" @click="emoji = emoji.slice(0, -1)"><Icon name="backspace" /> Стереть</button>
        <button class="btn pink" type="button" :disabled="!emoji.length" @click="submitEmoji">Отправить</button>
      </div>
    </template>
    <template v-else-if="phase.slots && !personal?.done">
      <div class="prompt sticker">
        <div class="label">Кто соврал?</div>
        <div class="text">Две правды и одна ложь о себе</div>
      </div>
      <form class="form" @submit.prevent="submitLines">
        <label v-for="(slot, i) in phase.slots" :key="i" class="slot" :class="{ lie: i === phase.slots.length - 1 }">
          <span>{{ slot }}</span>
          <input v-model="lines[i]" :maxlength="QUOTE_MAX" autocomplete="off" />
        </label>
        <p class="tip">Порядок перемешаем — никто не узнает, какая строка была последней</p>
        <button class="btn pink" type="submit" :disabled="!linesReady">Отправить</button>
      </form>
    </template>
    <template v-else-if="!personal?.done">
      <div v-if="phase.rhyme" class="prompt sticker">
        <div class="label">Допишите вторую строчку в рифму</div>
        <div class="text">{{ phase.prompt }}…</div>
      </div>
      <div v-else-if="phase.junk" class="prompt sticker">
        <div class="label">Продайте это! Напишите рекламу</div>
        <div class="text secret display">{{ personal?.prompt }}</div>
      </div>
      <div v-else-if="phase.tale" class="prompt sticker">
        <div class="label">Вы рассказчик</div>
        <div class="text">Придумайте подсказку к своему рисунку: слово, фразу, строчку из песни</div>
      </div>
      <div v-else-if="phase.story" class="prompt sticker">
        <div class="label">Продолжите историю · строка {{ phase.story.turn + 1 }} из {{ phase.story.turns }}</div>
        <div class="text">…{{ personal?.previous }}</div>
      </div>
      <div v-else-if="phase.quip" class="prompt sticker">
        <div class="label">Битва ответов · ответьте смешнее соперника</div>
        <div class="text">{{ personal?.prompt }}</div>
      </div>
      <div v-else-if="phase.clue" class="prompt sticker">
        <div class="label">Ваше тайное слово — объясните его тремя словами</div>
        <div class="text secret display">{{ personal?.prompt }}</div>
      </div>
      <div v-else-if="phase.herd" class="prompt sticker">
        <div class="label">Ответьте как большинство</div>
        <div class="text">{{ phase.prompt }}</div>
      </div>
      <div v-else-if="phase.fib" class="prompt sticker">
        <div class="label">Что значит это слово? Сочините правдоподобно</div>
        <div class="text">{{ phase.fib }}</div>
      </div>
      <div v-else-if="phase.forehead" class="prompt sticker">
        <div class="label">{{ phase.just ? 'Подсказка к слову · совпавшие сгорят' : 'Подсказка к слову · без самого слова' }}</div>
        <div class="text secret display">{{ personal?.prompt }}</div>
      </div>
      <div v-else-if="phase.hat" class="prompt sticker">
        <div class="label">Слово в шляпу · его будут объяснять трижды</div>
        <div class="text">Предмет, животное, профессия — что угодно, что можно объяснить</div>
      </div>
      <div v-else-if="phase.odd" class="prompt sticker">
        <div class="label">Ваш вопрос · не показывайте его другим</div>
        <div class="text">{{ personal?.prompt }}</div>
      </div>
      <div v-else class="prompt sticker">
        <div class="label">{{ phase.blank ? 'Вставьте слово вместо «…»' : 'Допишите фразу' }}</div>
        <div class="text">{{ phase.prompt }}</div>
      </div>
      <form class="form" @submit.prevent="submit">
        <input
          v-if="phase.herd || phase.odd || phase.forehead || phase.clue || phase.hat"
          v-model="text"
          class="short"
          :maxlength="limit"
          autocomplete="off"
          :placeholder="phase.clue ? 'Не больше трёх слов' : phase.hat ? 'Одно слово' : 'Слово или два'"
          enterkeyhint="send"
        />
        <textarea
          v-else
          v-model="text"
          :maxlength="limit"
          rows="3"
          :placeholder="phase.rhyme ? 'Вторая строчка' : phase.junk ? 'Ваша реклама' : phase.tale ? 'Ваша подсказка' : phase.story ? 'Что было дальше?' : phase.quip ? 'Ваш ответ' : 'Ваш ответ — никто не узнает, что это вы. Пока что.'"
          enterkeyhint="send"
          @keydown.enter.prevent="submit"
        ></textarea>
        <div v-if="clueError" class="count problem">{{ clueError }}</div>
        <div v-else-if="phase.clue" class="count">{{ wordCount }} / {{ CLUE_WORDS }} слова</div>
        <div v-else class="count">{{ text.length }} / {{ limit }}</div>
        <button class="btn pink" type="submit" :disabled="!text.trim() || !!clueError">Отправить</button>
      </form>
    </template>
    <Waiting v-else-if="phase.story" title="Строчка в истории!" note="Целиком её прочитают в конце" icon="📜" />
    <Waiting v-else-if="phase.quip" title="Ответ готов!" note="Скоро он сразится с ответом соперника" icon="🥊" />
    <Waiting v-else-if="phase.clue" title="Подсказка готова!" note="Посмотрим, угадают ли ваше слово" icon="🧩" />
    <Waiting v-else-if="phase.herd" title="Ответ принят!" note="Посмотрим, сколько людей думает так же" icon="🐑" />
    <Waiting v-else-if="phase.emoji" title="Портрет готов!" note="Скоро все будут гадать, про кого это" icon="😜" />
    <Waiting v-else-if="phase.blank" title="Слово вписано!" note="Скоро голосуем за самый смешной вариант" icon="✍️" />
    <Waiting v-else title="Ответ принят!" note="Скоро будем вычислять авторов" icon="✍️" />
  </div>
</template>

<style scoped>
.write {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.prompt {
  padding: 16px 18px;
}

.label {
  font-size: 13px;
  font-weight: 900;
  color: #7a5fc0;
  text-transform: uppercase;
}

.text {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.2;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

textarea,
.short {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-family: var(--font-hand);
  font-size: 22px;
  font-weight: 700;
  resize: none;
}

.short {
  font-size: 24px;
  text-align: center;
}

.slot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--green);
}

.slot.lie {
  color: var(--pink);
}

.slot input {
  padding: 12px 14px;
  border-radius: 14px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 18px;
  font-weight: 700;
  text-transform: none;
}

.tip {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
}

.count {
  align-self: flex-end;
  font-size: 13px;
  font-weight: 800;
  color: var(--muted);
}

.count.problem {
  color: var(--red);
}

.secret {
  font-size: 34px;
  color: var(--pink);
}

.hero {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.picked {
  min-height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 46px;
}

.placeholder {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 800;
  color: var(--muted);
}

.palette {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

@media (max-width: 400px) {
  .palette {
    grid-template-columns: repeat(6, 1fr);
  }
}

.key {
  aspect-ratio: 1;
  border: 2px solid var(--ink);
  border-radius: 12px;
  background: var(--paper);
  font-size: 24px;
  touch-action: manipulation;
}

.key:disabled {
  opacity: 0.4;
}

.row {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}
</style>
