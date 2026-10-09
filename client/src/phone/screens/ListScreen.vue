<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { LIST_ITEM_MAX, LIST_MAX_ITEMS, LIST_MIN_KEY } from '../../../../shared/protocol';
import { listKey } from '../../../../shared/catalog';
import { send, view } from '../store';
import { event } from '../haptics';

const phase = computed(() => (view.value?.phase.kind === 'list' ? view.value.phase : null));
// seeded once from the server so a reconnect brings the list back; after that this phone is the source
const items = ref<string[]>(view.value?.personal.kind === 'list' ? [...view.value.personal.items] : []);
const text = ref('');
const repeat = computed(() => {
  const key = listKey(text.value);
  return key !== '' && items.value.some((i) => listKey(i) === key);
});
const full = computed(() => items.value.length >= LIST_MAX_ITEMS);
const tooShort = computed(() => text.value.trim() !== '' && listKey(text.value).length < LIST_MIN_KEY);
const keys = (list: string[]) => list.map(listKey).join('\n');

function sync(): void {
  const v = view.value;
  if (v) send({ t: 'answer', phaseId: v.phaseId, value: items.value });
}

function add(): void {
  const value = text.value.trim();
  if (tooShort.value || !value || repeat.value || full.value) return;
  items.value = [value, ...items.value];
  text.value = '';
  event('tick');
  sync();
}

// a send lost to a dropped socket or refused by the server shows up as the server's copy lagging behind
watch(
  () => view.value?.personal,
  (p) => {
    if (p?.kind === 'list' && keys(p.items) !== keys(items.value)) sync();
  },
);

function remove(i: number): void {
  items.value = items.value.filter((_, j) => j !== i);
  sync();
}
</script>

<template>
  <div v-if="phase" class="list">
    <div class="prompt sticker">
      <div class="label">Кто больше · пишите по одному</div>
      <div class="text">{{ phase.category }}</div>
    </div>
    <form class="form" @submit.prevent="add">
      <input v-model="text" :maxlength="LIST_ITEM_MAX" autocomplete="off" enterkeyhint="send" placeholder="Ещё вариант" :disabled="full" />
      <button class="btn pink" type="submit" :disabled="!text.trim() || tooShort || repeat || full">+</button>
    </form>
    <p v-if="repeat" class="tip warn">Такой ответ уже есть</p>
    <p v-else-if="tooShort" class="tip warn">Нужно хотя бы {{ LIST_MIN_KEY }} буквы</p>
    <p v-else class="tip">Ответов: {{ items.length }}. Нажмите на ответ, чтобы убрать его</p>
    <div class="items">
      <button v-for="(item, i) in items" :key="item" type="button" class="item pop-in" @click="remove(i)">{{ item }}</button>
    </div>
  </div>
</template>

<style scoped>
.list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.prompt {
  padding: 14px 18px;
}

.label {
  font-size: 13px;
  font-weight: 900;
  color: var(--muted);
}

.text {
  margin-top: 4px;
  font-size: 24px;
  font-weight: 900;
  line-height: 1.2;
}

.form {
  display: flex;
  gap: 10px;
}

.form input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-weight: 800;
  padding: 10px 14px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  outline: none;
  font-size: 22px;
  box-shadow: 0 4px 0 var(--ink);
}

.form .btn {
  width: 64px;
  font-size: 32px;
}

.tip {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
}

.tip.warn {
  color: var(--red);
}

.items {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
}

.item {
  padding: 6px 14px;
  border-radius: 999px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 17px;
  font-weight: 800;
}
</style>
