<script setup lang="ts">
import { computed } from 'vue';
import { playerById, view } from '../store';
import Waiting from './Waiting.vue';

const note = computed(() => {
  const p = view.value?.phase;
  if (!p) return '';
  if (p.kind === 'lobby') return 'Мест больше нет. Если кто-то выйдет, вы займёте его место';
  if (p.kind === 'final') return 'В следующей партии вы играете!';
  if (p.kind === 'voteReveal' && p.crowd) {
    return `Зрители выбрали: ${playerById(p.crowd.pick)?.name ?? '?'} (${p.crowd.votes} из ${p.crowd.total})`;
  }
  return 'Смотрите на экран и голосуйте в вопросах «Кто из нас?» — без очков, просто для души';
});
</script>

<template>
  <Waiting title="Вы зритель" :note="note" icon="👀" />
</template>
