<script setup lang="ts">
import { computed, ref } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import { answer, playerById, state, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'spy' || p?.kind === 'spyGuess' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'spy' || p?.kind === 'spyGuess' ? p : null;
});
const suspects = computed(() =>
  phase.value?.kind === 'spy'
    ? phase.value.options.filter((id) => id !== state.you).map((id) => playerById(id)).filter((p) => p !== undefined)
    : [],
);
const accused = computed(() => (personal.value?.kind === 'spy' ? playerById(personal.value.answer) : undefined));
// the place is a secret from the spy sitting next to you, so it hides on a tap
const hidden = ref(false);
</script>

<template>
  <div v-if="phase && personal && view" class="spy">
    <template v-if="phase.kind === 'spy' && personal.kind === 'spy'">
      <button class="secret sticker" :class="{ agent: personal.spy }" @click="hidden = !hidden">
        <template v-if="hidden">Нажмите, чтобы показать</template>
        <template v-else-if="personal.spy">
          <Emoji char="🕵️" :size="56" />
          <span class="big display">Вы — шпион!</span>
          <span class="small">Слушайте вопросы и вычислите, где все находятся</span>
        </template>
        <template v-else>
          <span class="small">Мы находимся:</span>
          <span class="big display">{{ personal.place }}</span>
          <span class="small">Шпион этого не знает. Нажмите, чтобы скрыть</span>
        </template>
      </button>
      <template v-if="!accused">
        <p class="tip">Кто шпион?</p>
        <div class="grid">
          <button
            v-for="(p, i) in suspects"
            :key="p.id"
            class="pick deal"
            :style="{ '--c': PLAYER_COLORS[p.color], '--i': i }"
            @click="answer(p.id)"
          >
            <Avatar :player="p" :code="view.code" :size="52" :ring="3" />
            <span class="name">{{ p.name }}</span>
          </button>
        </div>
      </template>
      <p v-else class="tip">Ваш голос: {{ accused.name }}</p>
    </template>
    <template v-else-if="phase.kind === 'spyGuess' && personal.kind === 'spyGuess'">
      <template v-if="personal.spy && !personal.answer">
        <div class="secret sticker agent"><span class="big display">Где все находятся?</span></div>
        <button v-for="(o, i) in phase.options" :key="o" class="btn option deal" :style="{ '--i': i }" @click="answer(o)">{{ o }}</button>
      </template>
      <Waiting v-else-if="personal.spy" title="Ответ принят" :note="`Вы выбрали: ${personal.answer}`" icon="🕵️" />
      <Waiting v-else title="Шпион гадает" note="Если угадает место — спасётся" icon="🕵️" />
    </template>
  </div>
</template>

<style scoped>
.spy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.secret {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px;
  min-height: 150px;
  justify-content: center;
  text-align: center;
  font: inherit;
  color: var(--ink);
  cursor: pointer;
}

.secret.agent {
  background: var(--ink);
  color: #fff;
}

.big {
  font-size: 30px;
}

.small {
  font-size: 15px;
  font-weight: 800;
  opacity: 0.8;
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 360px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.pick {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 70px;
  padding: 8px 12px;
  border-radius: 18px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 4px 0 var(--ink);
  font: inherit;
  font-weight: 900;
  text-align: left;
}

.name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option {
  min-height: 60px;
  font-size: 19px;
}
</style>
