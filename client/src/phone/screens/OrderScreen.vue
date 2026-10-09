<script setup lang="ts">
import { computed, ref } from 'vue';
import { ORDER_MAX, ORDER_TEXT_MAX } from '../../../../shared/protocol';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'orderWrite' || p?.kind === 'orderSort' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'orderWrite' || p?.kind === 'orderSort' ? p : null;
});
const text = ref('');
const picked = ref<string[]>([]);
const cards = computed(() => (phase.value?.kind === 'orderSort' ? phase.value.cards : []));

function toggle(id: string): void {
  picked.value = picked.value.includes(id) ? picked.value.filter((p) => p !== id) : [...picked.value, id];
}

function sendText(): void {
  const t = text.value.trim();
  if (t) answer(t);
}
</script>

<template>
  <div v-if="phase && personal" class="order">
    <div class="number sticker">
      <small>Ваше тайное число</small>
      <b class="display">{{ personal.number }}</b>
      <small>из {{ ORDER_MAX }}: 1 — «{{ phase.left }}», {{ ORDER_MAX }} — «{{ phase.right }}»</small>
    </div>

    <template v-if="personal.kind === 'orderWrite'">
      <Waiting v-if="personal.text" :title="`«${personal.text}»`" note="Ждём остальных — потом расставим всё по порядку" icon="🔢" />
      <form v-else class="send" @submit.prevent="sendText">
        <p class="tip">Назовите то, что подходит вашему числу на этой шкале</p>
        <input v-model="text" :maxlength="ORDER_TEXT_MAX" placeholder="Например, кактус" enterkeyhint="send" />
        <button class="btn pink" :disabled="!text.trim()">Отправить</button>
      </form>
    </template>

    <template v-else>
      <Waiting v-if="personal.answer" title="Порядок отправлен" icon="🔢" />
      <template v-else>
        <p class="tip">Нажимайте по порядку: от «{{ phase.left }}» к «{{ phase.right }}»</p>
        <div class="cards">
          <button v-for="c in cards" :key="c.player" class="card" :class="{ on: picked.includes(c.player) }" @click="toggle(c.player)">
            <b class="place">{{ picked.includes(c.player) ? picked.indexOf(c.player) + 1 : '' }}</b>
            <span>{{ c.text }}</span>
          </button>
        </div>
        <div class="row">
          <button class="btn ghost" :disabled="picked.length === 0" @click="picked = []">Заново</button>
          <button class="btn pink" :disabled="picked.length !== cards.length" @click="answer(picked)">Готово</button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.order {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 16px;
}

.number {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  text-align: center;
}

.number b {
  font-size: 64px;
  line-height: 1;
  color: var(--pink);
}

.number small {
  font-weight: 800;
}

.tip {
  margin: 0;
  font-weight: 700;
}

.send {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.send input {
  padding: 12px 14px;
  border: 3px solid var(--ink);
  border-radius: 14px;
  font: inherit;
  font-size: 18px;
  font-weight: 700;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 3px solid var(--ink);
  border-radius: 14px;
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 18px;
  font-weight: 800;
  text-align: left;
}

.card.on {
  background: var(--yellow);
}

.place {
  width: 30px;
  height: 30px;
  flex: none;
  display: grid;
  place-items: center;
  border: 3px solid var(--ink);
  border-radius: 50%;
  background: #fff;
}

.row {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.row .btn {
  flex: 1;
}
</style>
