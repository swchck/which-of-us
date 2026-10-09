<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Avatar from '../../common/Avatar.vue';
import { PLAYER_COLORS, RUSH_MAX } from '../../../../shared/protocol';
import { answer, playerById, send, state, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'rush' || p?.kind === 'rushVote' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'rush' || p?.kind === 'rushVote' ? p : null;
});

// what the server already has: the field may only grow past it
const committed = ref(personal.value?.kind === 'rush' ? personal.value.text : '');
const box = ref<HTMLTextAreaElement>();
let sent = committed.value;
let timer: ReturnType<typeof setInterval> | undefined;

let finished = false;

function push(final = false): void {
  const v = view.value;
  if (!v || finished || (!final && committed.value === sent)) return;
  // a double tap on «Отправить» would send the final text twice and the server's refusal reaches every phone
  finished = final;
  sent = committed.value;
  send({ t: 'answer', phaseId: v.phaseId, value: { text: committed.value, final } });
}

function toEnd(): void {
  const el = box.value;
  if (el) el.setSelectionRange(el.value.length, el.value.length);
}

function blockErase(e: InputEvent): void {
  if (e.inputType.startsWith('delete') || e.inputType === 'insertReplacementText' || e.inputType === 'historyUndo') e.preventDefault();
  else toEnd();
}

function typed(): void {
  const el = box.value;
  if (!el) return;
  // an Android keyboard's composition can still rewrite letters; whatever is not an append snaps back
  if (el.value.startsWith(committed.value)) committed.value = el.value.slice(0, RUSH_MAX);
  el.value = committed.value;
  toEnd();
}

onMounted(() => {
  if (box.value) box.value.value = committed.value;
  timer = setInterval(() => push(), 300);
});
onBeforeUnmount(() => clearInterval(timer));

const replies = computed(() => (phase.value?.kind === 'rushVote' ? phase.value.replies : []));
const picked = computed(() => (personal.value?.kind === 'rushVote' ? playerById(personal.value.answer) : undefined));
</script>

<template>
  <div v-if="phase && personal && view" class="rush">
    <div class="incoming sticker">
      <small>{{ phase.from }}</small>
      <b>{{ phase.message }}</b>
    </div>

    <template v-if="phase.kind === 'rush' && personal.kind === 'rush'">
      <Waiting v-if="personal.done" title="Ответ отправлен" note="Смотрите на экран: там видно, как печатают остальные" icon="⌨️" />
      <template v-else>
        <p class="tip">Стереть нельзя — каждая буква сразу на экране</p>
        <textarea
          ref="box"
          rows="4"
          :maxlength="RUSH_MAX"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="sentences"
          spellcheck="false"
          placeholder="Пишите ответ…"
          @beforeinput="blockErase"
          @input="typed"
          @click="toEnd"
          @keyup="toEnd"
        />
        <button class="btn pink" :disabled="!committed.trim()" @click="push(true)">Отправить</button>
      </template>
    </template>

    <template v-else-if="phase.kind === 'rushVote' && personal.kind === 'rushVote'">
      <Waiting v-if="picked" title="Голос принят" :note="`За ответ игрока ${picked.name}`" icon="⌨️" />
      <template v-else>
        <p class="tip">{{ phase.ask ?? 'Какой ответ лучше?' }}</p>
        <div class="replies">
          <button
            v-for="(r, i) in replies"
            :key="r.player"
            class="reply deal"
            :disabled="r.player === state.you"
            :style="{ '--c': PLAYER_COLORS[playerById(r.player)?.color ?? 0], '--i': i }"
            @click="answer(r.player)"
          >
            <Avatar v-if="playerById(r.player)" :player="playerById(r.player)!" :code="view.code" :size="40" :ring="2" />
            <span>{{ r.text }}</span>
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.rush {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.incoming {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 22px 22px 22px 6px;
}

.incoming small {
  font-weight: 900;
  color: var(--pink);
}

.incoming b {
  font-size: 19px;
  line-height: 1.25;
}

.tip {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

textarea {
  padding: 12px 14px;
  border-radius: 18px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 19px;
  font-weight: 700;
  resize: none;
}

.replies {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 18px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 4px 0 var(--ink);
  font: inherit;
  font-weight: 800;
  text-align: left;
}

.reply:disabled {
  opacity: 0.45;
}
</style>
