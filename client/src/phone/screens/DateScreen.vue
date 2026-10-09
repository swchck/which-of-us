<script setup lang="ts">
import { computed, ref } from 'vue';
import Avatar from '../../common/Avatar.vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import Messenger from '../parts/Messenger.vue';
import { answer, playerById, send, state, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'date' || p?.kind === 'datePick' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'date' || p?.kind === 'datePick' ? p : null;
});
const others = computed(() => (view.value?.players ?? []).filter((p) => p.id !== state.you && p.connected));
const picked = computed(() => (personal.value?.kind === 'datePick' ? playerById(personal.value.answer) : undefined));
// the quirk is a secret from the neighbour's glance, so it folds away on a tap
const folded = ref(false);

function post(thread: string, text: string): void {
  const v = view.value;
  if (v) send({ t: 'answer', phaseId: v.phaseId, value: { thread, text } });
}
</script>

<template>
  <div v-if="phase && personal && view" class="date">
    <template v-if="phase.kind === 'date' && personal.kind === 'date'">
      <button class="quirk sticker" @click="folded = !folded">
        <template v-if="folded">💘 Манера скрыта — нажмите, чтобы показать</template>
        <template v-else>
          <small>Вечер {{ phase.night }} из {{ phase.nights }} · ваша тайная манера:</small>
          <b>{{ personal.quirk }}</b>
        </template>
      </button>
      <Messenger :chats="personal.chats" :players="view.players" :you="state.you" :code="view.code" :left="personal.left" @send="post" />
    </template>

    <template v-else-if="phase.kind === 'datePick' && personal.kind === 'datePick'">
      <template v-if="!picked">
        <p class="tip">С кем пойдёте на свидание?</p>
        <div class="grid">
          <button
            v-for="(p, i) in others"
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
      <Waiting v-else title="Приглашение отправлено" :note="`Свидание с игроком ${picked.name} — если это взаимно`" icon="💘" />
    </template>
  </div>
</template>

<style scoped>
.date {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quirk {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  background: var(--pink);
  color: #fff;
  font: inherit;
  font-weight: 800;
  text-align: left;
}

.quirk small {
  font-size: 13px;
  opacity: 0.85;
}

.quirk b {
  font-size: 20px;
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
