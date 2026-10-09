<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed } from 'vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import Avatar from '../../common/Avatar.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'write' ? view.value.phase : null));
const writers = computed(() => view.value?.players.filter((p) => p.connected) ?? []);
const author = computed(() => playerById(phase.value?.author));
const label = computed(() => {
  const p = phase.value;
  if (p?.story) return { icon: '📜', text: `Продолжи историю · строка ${p.story.turn + 1} из ${p.story.turns}` };
  if (p?.tale) return { icon: '📖', text: 'Сказочник' };
  if (p?.rhyme) return { icon: '🎤', text: 'Рифмач' };
  if (p?.junk) return { icon: '🛒', text: 'Барахолка' };
  if (author.value) return { icon: '🤥', text: 'Кто соврал?' };
  if (p?.emoji) return { icon: '😜', text: 'Эмодзи-портрет' };
  if (p?.herd) return { icon: '🐑', text: 'Стадное чувство' };
  if (p?.odd) return { icon: '👾', text: 'Чужак в стае' };
  if (p?.fib) return { icon: '📖', text: 'Словарь выдумок' };
  if (p?.clover) return { icon: '🍀', text: 'Четырёхлистник' };
  if (p?.just) return { icon: '👆', text: 'Ровно один' };
  if (p?.forehead) return { icon: '🤔', text: 'Что у меня на лбу?' };
  if (p?.hat) return { icon: '🤠', text: 'Шляпа' };
  if (p?.quip) return { icon: '🥊', text: 'Битва ответов' };
  if (p?.clue) return { icon: '🧩', text: 'Три слова' };
  if (p?.blank) return { icon: '✍️', text: 'Вставь слово' };
  return { icon: '✍️', text: 'Кто это написал?' };
});
const note = computed(() => {
  const p = phase.value;
  if (!p) return '';
  if (p.story) return 'Автор видит только предыдущую строчку. Целиком историю прочитаем в конце!';
  if (p.tale) return 'Рассказчик загадывает свой рисунок. Не слишком явно и не слишком туманно!';
  if (p.rhyme) return 'Допишите вторую строчку на телефоне. Главное — в рифму!';
  if (p.junk) return 'Пишем рекламу. Скоро торги: у каждого по 300 монет';
  if (author.value) return 'Порядок строк перемешаем, а вы найдёте ложь';
  if (p.emoji) return 'У каждого на телефоне свой тайный герой. Потом угадаем, кто есть кто!';
  if (p.herd) return 'Слово или два на телефоне. Очки тем, кто ответит как большинство';
  if (p.odd) return 'Вопросы почти одинаковые. Почти! Один из вас отвечает на другой';
  if (p.fib) return 'Придумайте такое определение, чтобы все поверили';
  if (p.clover) return 'На каждом телефоне свой клевер. Свяжите соседние слова, каждую пару одним словом';
  if (p.just) return 'Совпавшие подсказки сгорят, так что будьте оригинальны!';
  if (p.forehead) return 'Слово на телефонах у всех, кроме отгадчика. Само слово называть нельзя!';
  if (p.hat) return 'Что-то, что можно объяснить: предмет, животное, профессию. Слова никто не увидит до игры';
  if (p.quip) return 'У каждой пары своё задание. Потом ответы сразятся без имён';
  if (p.clue) return 'Однокоренные нельзя! Потом угадаем слово из четырёх похожих';
  if (p.blank) return 'Впишите своё слово на телефоне — потом выберем самое смешное';
  return 'Допишите фразу на телефоне — потом угадаем, кто что написал';
});
</script>

<template>
  <div v-if="phase && view" class="write">
    <div class="top">
      <div class="prompt sticker">
        <div class="label display">
          <Emoji :char="label.icon" />
          {{ label.text }}
        </div>
        <WordsIn
          class="text"
          :text="phase.junk ? 'Каждый продаёт свой хлам' : phase.quip ? 'Сочиняем самые смешные ответы' : phase.clue ? 'Объясните тайное слово тремя словами' : phase.odd ? 'У каждого свой вопрос на телефоне' : phase.forehead ? `Подсказки для игрока ${playerById(phase.forehead)?.name ?? ''}` : phase.prompt"
        />
        <div class="note">
          {{ note }}
        </div>
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div v-if="author" class="writers">
      <Avatar :player="author" :code="view.code" :size="220" :ring="7" />
      <div class="hint ribbon">
        <template v-if="phase.done.length">Готово <Icon name="check" /></template>
        <template v-else>{{ author.name }} {{ phase.story ? 'пишет продолжение…' : 'сочиняет…' }}</template>
      </div>
    </div>
    <div v-else class="writers">
      <div class="hint ribbon">{{ phase.done.length }} из {{ writers.length }} написали</div>
      <PlayerRow :code="view.code" :players="writers" :done="phase.done" :size="150" />
    </div>
  </div>
</template>

<style scoped>
.write {
  position: absolute;
  inset: 0;
  padding: 60px 90px 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.prompt {
  flex: 1;
  padding: 34px 44px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  font-weight: 800;
  color: var(--pink);
}

.text {
  margin-top: 8px;
  font-size: 60px;
  font-weight: 900;
  line-height: 1.12;
}

.note {
  margin-top: 14px;
  font-size: 24px;
  font-weight: 700;
  color: #6b5a99;
}

.writers {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
}

.hint {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
}
</style>
