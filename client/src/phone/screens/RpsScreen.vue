<script setup lang="ts">
import { computed } from 'vue';
import Emoji from '../../common/Emoji.vue';
import { RPS_THROWS, type RpsThrow } from '../../../../shared/protocol';
import { RPS_INFO } from '../../../../shared/catalog';
import { answer, playerById, state, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'rps' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'rps' ? view.value.personal : null));
const opponent = computed(() => playerById(personal.value?.opponent));
const through = computed(() => phase.value?.through.includes(state.you) ?? false);
const chosen = computed(() => (personal.value?.answer ? RPS_INFO[personal.value.answer as RpsThrow] : undefined));
</script>

<template>
  <div v-if="phase && personal" class="rps">
    <template v-if="personal.playing && !chosen">
      <p class="vs">Против вас: <b>{{ opponent?.name ?? '?' }}</b></p>
      <button v-for="(t, i) in RPS_THROWS" :key="t" class="btn big deal" :class="['pink', 'green', 'cyan'][i]" :style="{ '--i': i }" @click="answer(t)">
        <Emoji :char="RPS_INFO[t].icon" :size="48" /> {{ RPS_INFO[t].title }}
      </button>
    </template>
    <Waiting v-else-if="chosen" :title="chosen.title" :icon="chosen.icon" :note="`Ждём, что покажет ${opponent?.name ?? 'другой игрок'}`" />
    <Waiting v-else-if="through" title="Вы проходите дальше" note="Ждём, пока доиграют остальные пары" icon="✌️" />
    <Waiting v-else title="Вы болеете" note="Следите за поединками на экране" icon="✌️" />
  </div>
</template>

<style scoped>
.rps {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.vs {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  text-align: center;
}

.btn.big {
  flex: 1;
  max-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  font-size: 28px;
}
</style>
