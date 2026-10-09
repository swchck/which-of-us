<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import Confetti from '../../common/Confetti.vue';
import { computed } from 'vue';
import { withUnit } from '../../../../shared/catalog';
import { playerById, state, view } from '../store';

const result = computed(() => {
  const v = view.value;
  if (!v) return null;
  const p = v.phase;
  switch (p.kind) {
    case 'guessReveal': {
      const gain = p.gains[state.you] ?? 0;
      if (p.artist === state.you) {
        return gain > 0 ? { text: `Ваш рисунок поняли! +${gain}`, good: true } : { text: 'Слово так и осталось загадкой', good: false };
      }
      return gain > 0 ? { text: `+${gain} очков`, good: true } : { text: `Это было «${p.word}»`, good: false };
    }
    case 'tiltReveal': {
      const gain = p.gains[state.you] ?? 0;
      const n = p.stars[state.you] ?? 0;
      return { text: `${n} звёзд · +${gain} очков`, good: gain > 0 };
    }
    case 'reflexReveal': {
      const gain = p.gains[state.you] ?? 0;
      const ms = p.best[state.you];
      return { text: ms == null ? 'Ни одного точного нажатия' : `Лучшая реакция ${ms} мс · +${gain}`, good: gain > 0 };
    }
    case 'voteReveal':
      if (p.author === state.you) {
        const gain = p.gains[state.you] ?? 0;
        return gain > 0 ? { text: `Вы запутали друзей! +${gain}`, good: true } : { text: 'Вас раскусили!', good: false };
      }
      return (p.gains[state.you] ?? 0) > 0 ? { text: `+${p.gains[state.you]} очков`, good: true } : { text: 'В этот раз мимо', good: false };
    case 'predictReveal':
    case 'galleryReveal': {
      const gain = p.gains[state.you] ?? 0;
      if (p.kind === 'predictReveal' && p.target === state.you) {
        return gain > 0 ? { text: `Вас угадали! +${gain}`, good: true } : { text: 'Вас никто не раскусил', good: false };
      }
      return gain > 0 ? { text: `+${gain} очков`, good: true } : { text: 'В этот раз мимо', good: false };
    }
    case 'scaleReveal': {
      const gain = p.gains[state.you] ?? 0;
      if (p.target === state.you) {
        return gain > 0 ? { text: `Вас знают! +${gain}`, good: true } : { text: 'Вы — загадка для друзей', good: false };
      }
      return gain > 0 ? { text: `+${gain} очков`, good: true } : { text: p.truth === null ? 'Ответа не было' : `Было ${p.truth}`, good: false };
    }
    case 'neverReveal': {
      const gain = p.gains[state.you] ?? 0;
      return gain > 0 ? { text: `Точно подсчитали! +${gain}`, good: true } : { text: `«Было» у ${p.did.length} из ${p.did.length + p.didNot.length}`, good: false };
    }
    case 'tapReveal': {
      const gain = p.gains[state.you] ?? 0;
      return { text: `${p.counts[state.you] ?? 0} нажатий${gain > 0 ? ` · +${gain}` : ''}`, good: gain > 0 };
    }
    case 'quizReveal': {
      if (p.answer < 0) {
        const gain = p.gains[state.you] ?? 0;
        return gain > 0 ? { text: `Итог викторины: +${gain}`, good: true } : { text: 'В этот раз без очков', good: false };
      }
      const lives = p.lives[state.you] ?? 0;
      if (p.out.includes(state.you)) return { text: 'Жизни кончились — вы выбыли', good: false };
      return p.picks[state.you] === p.answer ? { text: 'Верно!', good: true } : { text: `Минус жизнь, осталось: ${lives}`, good: false };
    }
    case 'shakerReveal': {
      const gain = p.gains[state.you] ?? 0;
      if (p.popped.includes(state.you)) return { text: 'Шарик лопнул — без очков', good: false };
      return gain > 0 ? { text: `Шарик выдержал! +${gain}`, good: true } : { text: 'Шарик цел, но маловат', good: false };
    }
    case 'herdReveal': {
      const gain = p.gains[state.you] ?? 0;
      return gain > 0 ? { text: `Вы со стадом! +${gain}`, good: true } : { text: 'Свой путь — без очков', good: false };
    }
    case 'syncReveal': {
      const gain = p.gains[state.you] ?? 0;
      return gain > 0 ? { text: `Телепатия сработала! +${gain}`, good: true } : { text: 'Не совпали', good: false };
    }
    case 'bombReveal':
      return p.loser === state.you
        ? { text: 'Бабах! Бомба рванула у вас', good: false }
        : { text: `Уцелели! +${p.gains[state.you] ?? 0}`, good: true };
    case 'closestReveal': {
      const gain = p.gains[state.you] ?? 0;
      const answer = `Ответ: ${withUnit(p.answer, p.unit)}`;
      return gain > 0 ? { text: `${answer} · +${gain}`, good: true } : { text: answer, good: false };
    }
    case 'quipReveal': {
      const gain = p.gains[state.you] ?? 0;
      const mine = p.answers.some((a) => a.author === state.you);
      if (!mine) return null;
      return gain > 0 ? { text: `Ваш ответ зашёл! +${gain}`, good: true } : { text: 'В этот раз зал выбрал соперника', good: false };
    }
    case 'truthReveal': {
      const gain = p.gains[state.you] ?? 0;
      return gain > 0 ? { text: `В точку! +${gain}`, good: true } : { text: p.truth ? 'А это правда!' : 'Это была выдумка', good: false };
    }
    case 'percentReveal':
    case 'fibReveal':
    case 'simonReveal':
    case 'foreheadReveal':
    case 'hatReveal':
    case 'mafiaEnd':
    case 'cloverReveal':
    case 'yearsReveal':
    case 'taleReveal':
    case 'junkSold':
    case 'caseReveal':
    case 'contactReveal':
    case 'bandReveal':
    case 'ninjaReveal': {
      const gain = p.gains[state.you] ?? 0;
      return gain > 0 ? { text: `Отлично! +${gain}`, good: true } : { text: 'В этот раз без очков', good: false };
    }
    case 'evenReveal': {
      const gain = p.gains[state.you] ?? 0;
      return gain > 0 ? { text: `Меньшинство рулит! +${gain}`, good: true } : { text: 'Вы были с большинством', good: false };
    }
    case 'spyReveal': {
      const gain = p.gains[state.you] ?? 0;
      if (p.spy === state.you) return gain > 0 ? { text: `Шпионская миссия удалась! +${gain}`, good: true } : { text: 'Вас раскусили', good: false };
      return gain > 0 ? { text: `Вы вычислили шпиона! +${gain}`, good: true } : { text: `Шпион — ${playerById(p.spy)?.name ?? '?'}`, good: false };
    }
    case 'clueReveal': {
      const gain = p.gains[state.you] ?? 0;
      if (p.author === state.you) {
        return gain > 0 ? { text: `Ваше слово поняли! +${gain}`, good: true } : { text: 'Слово так никто и не нашёл', good: false };
      }
      return gain > 0 ? { text: `Угадано! +${gain}`, good: true } : { text: `Было слово «${p.word}»`, good: false };
    }
    case 'listReveal': {
      const gain = p.gains[state.you] ?? 0;
      const unique = p.items.filter((i) => i.by.length === 1 && i.by[0] === state.you).length;
      if (gain === 0) return { text: 'В этот раз без ответов', good: false };
      return { text: unique > 0 ? `Уникальных ответов: ${unique} · +${gain}` : `+${gain} очков`, good: true };
    }
    case 'rpsReveal': {
      if (p.champion === state.you) return { text: `Турнир ваш! +${p.gains[state.you] ?? 0}`, good: true };
      const match = p.matches.find((m) => m.a === state.you || m.b === state.you);
      if (!match) return null;
      if (match.winner === null) return { text: 'Ничья — переигровка!', good: false };
      return match.winner === state.you ? { text: `Победа! +${p.gains[state.you] ?? 0}`, good: true } : { text: 'Вы выбываете', good: false };
    }
    case 'treasureReveal': {
      const gain = p.gains[state.you] ?? 0;
      if (p.lost.includes(state.you)) return { text: 'Ловушка! Добыча осталась в пещере', good: false };
      if (!(state.you in p.haul)) return null;
      return gain > 0 ? { text: `Вынесено камней: ${p.haul[state.you]} · +${gain}`, good: true } : { text: 'Вышли с пустыми руками', good: false };
    }
    case 'scores': {
      const row = p.rows.find((r) => r.player === state.you);
      return row ? { text: `${row.place} место · ${row.score} очков`, good: row.place === 1 } : null;
    }
    default:
      return null;
  }
});

const caption = computed(() => {
  switch (view.value?.phase.kind) {
    case 'intro': {
      const hero = view.value.phase.hero;
      if (!hero) return 'Новый раунд!';
      return hero === state.you ? 'Этот раунд — про вас!' : `Раунд про ${playerById(hero)?.name ?? 'звезду'}!`;
    }
    case 'scene':
      return `Переезжаем: ${view.value.phase.title}`;
    case 'scores':
      return 'Подсчёт очков';
    case 'sharedReveal':
      return 'Любуемся шедевром';
    case 'storyReveal':
      return 'Слушаем историю';
    default:
      return 'Смотрите на экран';
  }
});
</script>

<template>
  <div class="watch">
    <Confetti v-if="result?.good" :key="view?.phaseId" :count="90" :y="0.55" :delay="0.2" />
    <div class="tv">
      <div class="screen"><Emoji char="📺" /></div>
    </div>
    <div class="caption display">{{ caption }}</div>
    <div v-if="result" :key="view?.phaseId" class="result display pop-in" :class="{ good: result.good }">
      {{ result.text }}
    </div>
  </div>
</template>

<style scoped>
.watch {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  text-align: center;
}

.tv {
  animation: float 2.6s ease-in-out infinite;
}

.screen {
  font-size: 110px;
  line-height: 1;
}

.caption {
  font-size: 26px;
  font-weight: 800;
}

.result {
  padding: 14px 22px;
  border-radius: 18px;
  border: var(--line) solid var(--ink);
  background: var(--muted);
  color: var(--ink);
  font-size: 22px;
  font-weight: 800;
  box-shadow: var(--shadow);
}

.result.good {
  background: var(--green);
}
</style>
