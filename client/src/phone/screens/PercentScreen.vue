<script setup lang="ts">
import { computed, ref } from 'vue';
import { PERCENT_STEP } from '../../../../shared/protocol';
import { answer, playerById, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'percent' || p?.kind === 'percentGuess' || p?.kind === 'percentBet' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'percent' || p?.kind === 'percentGuess' || p?.kind === 'percentBet' ? p : null;
});
const hero = computed(() => playerById(phase.value?.hero));
const share = ref(50);
</script>

<template>
  <div v-if="phase && personal" class="percent">
    <div class="question sticker">{{ phase.question }}</div>

    <template v-if="personal.kind === 'percent'">
      <template v-if="personal.answer === undefined">
        <button class="btn green big deal" style="--i: 0" @click="answer(1)">Да</button>
        <button class="btn pink big deal" style="--i: 1" @click="answer(0)">Нет</button>
      </template>
      <Waiting v-else :title="personal.answer === 1 ? 'Ваш ответ: да' : 'Ваш ответ: нет'" note="Никто не узнает, кто что ответил" icon="🤫" />
    </template>

    <template v-else-if="personal.kind === 'percentGuess'">
      <template v-if="personal.hero && personal.answer === undefined">
        <p class="tip">Сколько процентов ответили «да»?</p>
        <div class="value display">{{ share }}%</div>
        <input v-model.number="share" class="slider" type="range" min="0" max="100" :step="PERCENT_STEP" />
        <button class="btn green big" @click="answer(share)">Это мой ответ</button>
      </template>
      <Waiting v-else-if="personal.hero" title="Ответ принят" note="Сейчас остальные сделают ставки" icon="📊" />
      <Waiting v-else :title="`Угадывает ${hero?.name ?? 'герой'}`" note="Потом ваша ставка: больше или меньше" icon="📊" />
    </template>

    <template v-else-if="personal.kind === 'percentBet' && phase.kind === 'percentBet'">
      <Waiting v-if="personal.hero" title="Ставят остальные" :note="`Ваш ответ — ${phase.guess}%`" icon="📊" />
      <template v-else-if="personal.answer === undefined">
        <p class="tip">{{ hero?.name }} думает: {{ phase.guess }}%. А на самом деле?</p>
        <button class="btn cyan big deal" style="--i: 0" @click="answer(1)">Больше</button>
        <button class="btn pink big deal" style="--i: 1" @click="answer(0)">Меньше</button>
      </template>
      <Waiting v-else :title="personal.answer === 1 ? 'Ставка: больше' : 'Ставка: меньше'" note="Смотрите на экран" icon="📊" />
    </template>
  </div>
</template>

<style scoped>
.percent {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.question {
  padding: 18px;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
}

.tip {
  margin: 0;
  font-weight: 800;
  text-align: center;
}

.value {
  font-size: 64px;
  text-align: center;
}

.slider {
  width: 100%;
  accent-color: var(--pink);
}

.big {
  min-height: 84px;
  font-size: 26px;
}
</style>
