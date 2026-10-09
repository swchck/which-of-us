<script setup lang="ts">
import { glyphs } from '../../common/emoji';
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import Avatar from '../../common/Avatar.vue';
import { answer, playerById, state, view } from '../store';
import JokerButton from '../parts/JokerButton.vue';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'vote' ? view.value.phase : null));
const mine = computed(() => (view.value?.personal.kind === 'vote' ? view.value.personal.answer : undefined));
const options = computed(() =>
  (phase.value?.options ?? [])
    .filter((id) => phase.value?.allowSelf || id !== state.you)
    .map((id) => playerById(id))
    .filter((p) => p !== undefined),
);
const chosen = computed(() => playerById(mine.value));
const ownQuote = computed(() => view.value?.personal.kind === 'vote' && view.value.personal.mine);
</script>

<template>
  <div v-if="phase && view" class="vote">
    <Waiting v-if="ownQuote && phase.emoji" title="Это ваши эмодзи!" note="Молчите — посмотрим, узнают ли героя" icon="🤐" />
    <Waiting v-else-if="ownQuote && phase.duel" title="Вы на дуэли!" note="Голосуют остальные. Можно бросить сопернику грозный взгляд" icon="⚔️" />
    <Waiting v-else-if="ownQuote" title="Это ваш ответ!" note="Сидите с невозмутимым лицом — посмотрим, раскусят ли вас" icon="🤫" />
    <template v-else-if="!chosen">
      <div class="question sticker">
        <span v-if="phase.bonus" class="bonus display">×2</span>
        <div v-if="phase.quote" class="quote-label">Кто это написал?</div>
        <div v-if="phase.emoji" class="quote-label">Про кого эти эмодзи?</div>
        <div v-if="phase.duel" class="quote-label">Дуэль</div>
        <span v-if="phase.emoji" class="emoji"><Emoji v-for="(g, i) in glyphs(phase.question)" :key="i" :char="g" /></span>
        <template v-else>{{ phase.question }}</template>
      </div>
      <JokerButton />
      <div class="grid" :class="{ many: options.length > 6 }">
        <button
          v-for="(p, i) in options"
          :key="p.id"
          class="pick deal"
          :style="{ '--c': PLAYER_COLORS[p.color], '--i': i }"
          @click="answer(p.id)"
        >
          <Avatar :player="p" :code="view.code" :size="options.length > 6 ? 58 : 72" :ring="3" />
          <span class="name">{{ p.id === state.you ? `${p.name} (я)` : p.name }}</span>
        </button>
      </div>
    </template>
    <Waiting v-else title="Голос принят!" :note="`Вы выбрали: ${chosen.name}`">
      <Avatar :player="chosen" :code="view.code" :size="90" />
    </Waiting>
  </div>
</template>

<style scoped>
.vote {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.emoji {
  display: block;
  font-size: 48px;
  letter-spacing: 6px;
  text-align: center;
}

.question {
  position: relative;
  padding: 18px;
  font-size: 21px;
  font-weight: 800;
  line-height: 1.25;
}

.quote-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 900;
  color: #7a5fc0;
  text-transform: uppercase;
}

.bonus {
  position: absolute;
  top: -16px;
  right: -8px;
  background: var(--pink);
  color: #fff;
  border: 3px solid var(--ink);
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 18px;
  transform: rotate(8deg);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.pick {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 8px 12px;
  background: var(--paper);
  color: var(--ink);
  border: var(--line) solid var(--ink);
  border-radius: 20px;
  box-shadow: 0 5px 0 var(--ink);
  cursor: pointer;
  transition: transform 80ms;
}

.pick:active {
  transform: translateY(4px);
  box-shadow: 0 1px 0 var(--ink);
  background: var(--c);
}

.many .pick {
  padding: 10px 6px 8px;
  gap: 6px;
}

.name {
  font-weight: 900;
  font-size: 17px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
