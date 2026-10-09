<script setup lang="ts">
import { computed, ref } from 'vue';
import Messenger from '../parts/Messenger.vue';
import { answer, send, state, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'market' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'market' ? view.value.personal : null));
const clues = computed(() =>
  (phase.value?.categories ?? []).map((c, k) => ({ title: c.title, option: c.options[personal.value?.clues[k] ?? 0] })),
);
const version = computed(() => personal.value?.guess?.map((g, k) => phase.value?.categories[k]?.options[g]).join(', '));

const picking = ref(false);
const pick = ref<(number | null)[]>([]);
const ready = computed(() => pick.value.length === (phase.value?.categories.length ?? 0) && pick.value.every((p) => p !== null));

function choose(k: number, i: number): void {
  const next = [...pick.value];
  next[k] = i;
  pick.value = next;
}

function submit(): void {
  if (!ready.value) return;
  answer(pick.value as number[]);
  picking.value = false;
}

function post(thread: string, text: string): void {
  const v = view.value;
  if (v) send({ t: 'answer', phaseId: v.phaseId, value: { thread, text } });
}
</script>

<template>
  <div v-if="phase && personal && view" class="market">
    <template v-if="!picking">
      <div class="clues sticker">
        <small>Ваши улики — {{ phase.title }}</small>
        <span v-for="c in clues" :key="c.title"><b>{{ c.title }}:</b> точно не {{ c.option }}</span>
      </div>
      <div v-if="version" class="version">🕵️ Ваша версия: {{ version }}</div>
      <button v-else class="btn pink" @click="picking = true">Назвать версию</button>
      <Messenger :chats="personal.chats" :players="view.players" :you="state.you" :code="view.code" :left="personal.left" @send="post" />
    </template>
    <template v-else>
      <p class="tip">Версия принимается один раз — чем раньше верная, тем больше очков</p>
      <div v-for="(c, k) in phase.categories" :key="c.title" class="cat">
        <b>{{ c.title }}?</b>
        <div class="opts">
          <button
            v-for="(o, i) in c.options"
            :key="o"
            class="opt"
            :class="{ on: pick[k] === i, out: personal.clues[k] === i }"
            @click="choose(k, i)"
          >
            {{ o }}
          </button>
        </div>
      </div>
      <div class="row">
        <button class="btn" @click="picking = false">Назад</button>
        <button class="btn pink" :disabled="!ready" @click="submit">Это моя версия</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.market {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clues {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: var(--ink);
  color: #fff;
  font-weight: 700;
}

.clues small {
  font-size: 13px;
  opacity: 0.75;
}

.version {
  padding: 8px 12px;
  border-radius: 14px;
  background: var(--yellow);
  color: var(--ink);
  font-weight: 900;
  text-align: center;
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.cat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 18px;
}

.opts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.opt {
  min-height: 48px;
  padding: 6px 10px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 16px;
  font-weight: 800;
}

.opt.out {
  text-decoration: line-through;
  opacity: 0.55;
}

.opt.on {
  background: var(--pink);
  color: #fff;
  opacity: 1;
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
