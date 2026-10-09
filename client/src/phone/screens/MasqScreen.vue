<script setup lang="ts">
import { computed, ref } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { MASKS, PLAYER_COLORS } from '../../../../shared/protocol';
import Messenger from '../parts/Messenger.vue';
import { answer, send, state, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'masq' || p?.kind === 'masqGuess' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'masq' || p?.kind === 'masqGuess' ? p : null;
});
const own = computed(() => (personal.value ? MASKS[personal.value.mask] : undefined));
const names = computed(() => Object.fromEntries(MASKS.map((m, i) => [`mask:${i}`, `${m.icon} ${m.name}`])));

function post(thread: string, text: string): void {
  const v = view.value;
  if (v) send({ t: 'answer', phaseId: v.phaseId, value: { thread, text } });
}

// one mask at a time, so a phone never shows a seven-by-seven grid
const guess = ref<(string | null)[]>([]);
const masks = computed(() => (phase.value ? Array.from({ length: phase.value.masks }, (_, i) => i).filter((i) => i !== personal.value?.mask) : []));
const step = computed(() => guess.value.length);
const asking = computed(() => masks.value[step.value]);
const people = computed(() => (view.value?.players ?? []).filter((p) => p.id !== state.you && p.connected));

function choose(id: string | null): void {
  guess.value = [...guess.value, id];
  if (guess.value.length < masks.value.length) return;
  const full: (string | null)[] = Array.from({ length: phase.value?.masks ?? 0 }, () => null);
  masks.value.forEach((m, i) => (full[m] = guess.value[i] ?? null));
  if (full.some((g) => g !== null)) answer(full);
  else guess.value = [];
}
</script>

<template>
  <div v-if="phase && personal && view && own" class="masq">
    <template v-if="phase.kind === 'masq' && personal.kind === 'masq'">
      <div class="mask sticker">
        <Emoji :char="own.icon" :size="44" />
        <span>
          <small>Ваша маска — никому не показывайте</small>
          <b>{{ own.name }}</b>
        </span>
      </div>
      <div class="topic">{{ phase.prompt }}</div>
      <Messenger :chats="personal.chats" :players="view.players" :you="state.you" :code="view.code" :left="personal.left" :names="names" single @send="post" />
    </template>

    <template v-else-if="phase.kind === 'masqGuess' && personal.kind === 'masqGuess'">
      <Waiting v-if="personal.answer" title="Догадки приняты" note="Скоро маски снимут" icon="🎭" />
      <template v-else-if="asking !== undefined">
        <p class="tip">Маска {{ step + 1 }} из {{ masks.length }}</p>
        <div class="ask sticker">
          <Emoji :char="MASKS[asking]!.icon" :size="64" />
          <b>Кто под маской «{{ MASKS[asking]!.name }}»?</b>
        </div>
        <div class="grid">
          <button
            v-for="(p, i) in people"
            :key="p.id"
            class="pick deal"
            :disabled="guess.includes(p.id)"
            :style="{ '--c': PLAYER_COLORS[p.color], '--i': i }"
            @click="choose(p.id)"
          >
            <Avatar :player="p" :code="view.code" :size="44" :ring="3" />
            <span class="name">{{ p.name }}</span>
          </button>
        </div>
        <div class="row">
          <button v-if="step > 0" class="btn" @click="guess = guess.slice(0, -1)">Назад</button>
          <button class="btn" @click="choose(null)">Не знаю</button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.masq {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mask {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  background: var(--ink);
  color: #fff;
}

.mask span {
  display: flex;
  flex-direction: column;
}

.mask small {
  font-size: 13px;
  opacity: 0.75;
}

.mask b {
  font-size: 22px;
}

.topic {
  padding: 0 4px;
  font-weight: 800;
  text-align: center;
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.ask {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px;
  font-size: 20px;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.pick {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
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

.pick:disabled {
  opacity: 0.35;
}

.name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row {
  display: flex;
  gap: 10px;
}

.row .btn {
  flex: 1;
}
</style>
