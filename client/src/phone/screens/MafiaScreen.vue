<script setup lang="ts">
import { computed, ref } from 'vue';
import { MAFIA_ROLE_INFO } from '../../../../shared/catalog';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { answer, playerById, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => view.value?.phase.kind);
const me = computed(() => (view.value?.personal.kind === 'mafia' ? view.value.personal : null));
const info = computed(() => (me.value ? MAFIA_ROLE_INFO[me.value.role] : null));
const options = computed(() => (me.value?.options ?? []).map((id) => playerById(id)).filter((p) => p !== undefined));
const picked = computed(() => playerById(me.value?.answer));
const mates = computed(() => (me.value?.mates ?? []).map((id) => playerById(id)?.name).filter(Boolean).join(', '));
// the role shows only while a finger holds the card, so a glance from the next seat finds nothing
const peek = ref(false);
const ask = computed(() => (phase.value === 'mafiaVote' ? 'Кого изгоняем?' : peek.value ? (info.value?.night ?? '') : 'Ночной выбор: держите карточку, чтобы вспомнить задание'));
</script>

<template>
  <div v-if="me && info && view" class="mafia">
    <button
      class="role sticker"
      :class="{ open: peek, wolf: peek && me.role === 'wolf' }"
      @pointerdown="peek = true"
      @pointerup="peek = false"
      @pointerleave="peek = false"
      @pointercancel="peek = false"
      @contextmenu.prevent
    >
      <template v-if="peek">
        <Emoji :char="info.icon" :size="56" />
        <span class="big display">{{ info.title }}</span>
        <span class="small">{{ info.about }}</span>
        <span v-if="mates" class="small">Ещё волки: {{ mates }}</span>
        <span v-for="s in me.seen" :key="s.player" class="small">{{ playerById(s.player)?.name }} — {{ s.wolf ? 'волк' : 'не волк' }}</span>
      </template>
      <template v-else>
        <Emoji char="❓" :size="48" />
        <span class="small">Держите палец на карточке, чтобы увидеть роль</span>
      </template>
    </button>

    <Waiting v-if="!me.alive" title="Вы выбыли" note="Молчите и смотрите, чем всё закончится" icon="😴" />
    <template v-else-if="options.length && !picked">
      <p class="tip">{{ ask }}</p>
      <div class="grid">
        <button
          v-for="(p, i) in options"
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
    <Waiting v-else-if="picked" title="Выбор сделан" :note="picked.name" icon="🤫" />
    <p v-else-if="phase === 'mafiaDay'" class="tip">Обсуждайте вслух: кто здесь волк?</p>
    <p v-else class="tip">Смотрите на экран</p>
  </div>
</template>

<style scoped>
.mafia {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 170px;
  padding: 18px;
  font: inherit;
  text-align: center;
  color: var(--ink);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: none;
}

.role.wolf {
  background: var(--ink);
  color: #fff;
}

.big {
  font-size: 32px;
}

.small {
  font-size: 15px;
  font-weight: 800;
  opacity: 0.85;
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
</style>
