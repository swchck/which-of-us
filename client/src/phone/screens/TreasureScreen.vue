<script setup lang="ts">
import { computed } from 'vue';
import Emoji from '../../common/Emoji.vue';
import { answer, state, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'treasure' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'treasure' ? view.value.personal : null));
const carried = computed(() => phase.value?.carried[state.you] ?? 0);
const banked = computed(() => phase.value?.banked[state.you] ?? 0);
const traps = computed(() => phase.value?.path.filter((c) => 'trap' in c).length ?? 0);
</script>

<template>
  <div v-if="phase && personal" class="treasure">
    <template v-if="personal.inside">
      <div class="bag sticker">
        <span class="small">В мешке</span>
        <span class="big display"><Emoji char="💎" :size="44" /> {{ carried }}</span>
        <span class="small">Уже вынесено: {{ banked }}</span>
      </div>
      <template v-if="phase.stage === 'choose' && personal.answer === undefined">
        <button class="btn green big deal" style="--i: 0" @click="answer(1)"><Emoji char="🔦" :size="34" /> Глубже</button>
        <button class="btn pink big deal" style="--i: 1" @click="answer(0)"><Emoji char="🏃" :size="34" /> Выбраться</button>
        <p class="tip">Ловушек на тропе: {{ traps }}. Вторая такая же — и все внутри теряют добычу</p>
      </template>
      <Waiting
        v-else-if="phase.stage === 'choose'"
        :title="personal.answer === 1 ? 'Идём дальше!' : 'Уходим с добычей'"
        note="Решения откроются, когда все выберут"
        :icon="personal.answer === 1 ? '🔦' : '🏃'"
      />
      <Waiting v-else-if="phase.bust" title="Ловушка!" note="Добыча осталась в пещере" icon="💥" />
      <Waiting v-else title="Открываем карту…" note="Смотрите на экран" icon="⛏️" />
    </template>
    <Waiting v-else title="Вы в лагере" :note="`Вынесено камней: ${banked}. Болейте за смельчаков!`" icon="🏃" />
  </div>
</template>

<style scoped>
.treasure {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bag {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 14px;
}

.big {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 44px;
}

.small {
  font-size: 14px;
  font-weight: 800;
  color: var(--muted);
}

.btn.big {
  min-height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 26px;
}

.tip {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  color: var(--muted);
}
</style>
