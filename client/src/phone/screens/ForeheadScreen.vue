<script setup lang="ts">
import { computed, ref } from 'vue';
import { GUESS_MAX } from '../../../../shared/protocol';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'foreheadGuess' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'foreheadGuess' ? view.value.personal : null));
const text = ref('');

function send(): void {
  if (text.value.trim()) answer(text.value.trim());
}
</script>

<template>
  <div v-if="phase && personal" class="forehead">
    <Waiting v-if="!personal.guesser" title="Угадывает другой" note="Смотрите на экран" icon="🤔" />
    <Waiting v-else-if="personal.answer" title="Ответ принят" :note="`«${personal.answer}»`" icon="🤔" />
    <template v-else>
      <p class="tip">Подсказки на экране. Что у вас на лбу?</p>
      <form class="form" @submit.prevent="send">
        <input v-model="text" class="input" :maxlength="GUESS_MAX" autocomplete="off" enterkeyhint="send" placeholder="Ваш ответ" />
        <button class="btn green" :disabled="!text.trim()">Ответить</button>
      </form>
    </template>
  </div>
</template>

<style scoped>
.forehead {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tip {
  margin: 0;
  font-weight: 800;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input {
  padding: 14px;
  border: var(--line) solid var(--ink);
  border-radius: 14px;
  font: inherit;
  font-size: 22px;
}
</style>
