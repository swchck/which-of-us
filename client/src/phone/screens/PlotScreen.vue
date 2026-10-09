<script setup lang="ts">
import { computed, ref } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import Messenger from '../parts/Messenger.vue';
import { answer, playerById, send, state, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'plot' || p?.kind === 'plotGuess' ? p : null;
});
const personal = computed(() => {
  const p = view.value?.personal;
  return p?.kind === 'plot' || p?.kind === 'plotGuess' ? p : null;
});
const target = computed(() => playerById(phase.value?.target));
const accomplices = computed(() =>
  personal.value?.kind === 'plot'
    ? (personal.value.plotters ?? []).filter((id) => id !== state.you).map((id) => playerById(id)?.name ?? '…')
    : [],
);
// the briefing gives the game away to a neighbour's glance, so it folds away on a tap
const folded = ref(false);

function post(thread: string, text: string): void {
  const v = view.value;
  if (v) send({ t: 'answer', phaseId: v.phaseId, value: { thread, text } });
}

const picked = ref<string[]>([]);
const suspects = computed(() =>
  (view.value?.players ?? []).filter((p) => p.id !== state.you && p.id !== phase.value?.target && p.connected),
);
function toggle(id: string): void {
  const need = personal.value?.kind === 'plotGuess' ? personal.value.count : 1;
  if (picked.value.includes(id)) picked.value = picked.value.filter((p) => p !== id);
  else if (picked.value.length < need) picked.value = [...picked.value, id];
}
</script>

<template>
  <div v-if="phase && personal && view" class="plot">
    <template v-if="phase.kind === 'plot' && personal.kind === 'plot'">
      <button class="brief sticker" :class="personal.role" @click="folded = !folded">
        <template v-if="folded">🤫 Роль скрыта — нажмите, чтобы показать</template>
        <template v-else-if="personal.role === 'plotter'">
          <b>Вы в сговоре!</b>
          <span>
            Выманите у игрока {{ target?.name }} слово <b class="word">«{{ personal.word }}»</b>.
            <template v-if="accomplices.length">Сообщники: {{ accomplices.join(', ') }}.</template>
          </span>
        </template>
        <template v-else-if="personal.role === 'target'">
          <b>Против вас заговор!</b>
          <span>Кто-то хочет, чтобы вы сами написали тайное слово. Не попадитесь — и вычислите заговорщиков.</span>
        </template>
        <template v-else>
          <b>Вы не в сговоре</b>
          <span>Но заговор есть, его жертва — {{ target?.name }}. Вычислите заговорщиков по переписке.</span>
        </template>
      </button>
      <div v-if="phase.caught" class="caught sticker"><Emoji char="🪤" /> Ловушка сработала!</div>
      <Messenger
        :chats="personal.chats"
        :players="view.players"
        :you="state.you"
        :code="view.code"
        :left="personal.left"
        :closed="phase.caught"
        :hints="personal.role === 'plotter' && personal.lures ? { to: personal.target, lines: personal.lures } : undefined"
        @send="post"
      />
    </template>

    <template v-else-if="phase.kind === 'plotGuess' && personal.kind === 'plotGuess'">
      <template v-if="personal.voting && !personal.answer">
        <p class="tip">
          Кто был в сговоре? Выберите {{ personal.count === 1 ? 'одного' : `${personal.count}` }}
        </p>
        <div class="grid">
          <button
            v-for="(p, i) in suspects"
            :key="p.id"
            class="pick deal"
            :class="{ on: picked.includes(p.id) }"
            :style="{ '--c': PLAYER_COLORS[p.color], '--i': i }"
            @click="toggle(p.id)"
          >
            <Avatar :player="p" :code="view.code" :size="48" :ring="3" />
            <span class="name">{{ p.name }}</span>
          </button>
        </div>
        <button class="btn pink" :disabled="picked.length !== Math.min(personal.count, suspects.length)" @click="answer(picked)">Это они!</button>
      </template>
      <Waiting v-else-if="personal.voting" title="Подозрения приняты" icon="🔎" />
      <Waiting v-else title="Вас вычисляют!" note="Жертва и непричастные ищут заговорщиков" icon="🤫" />
    </template>
  </div>
</template>

<style scoped>
.plot {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.brief {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  color: var(--ink);
}

.brief b {
  font-size: 18px;
}

.brief.plotter {
  background: var(--ink);
  color: #fff;
}

.word {
  color: var(--yellow);
}

.caught {
  padding: 8px 12px;
  background: var(--yellow);
  font-weight: 900;
  text-align: center;
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

.pick.on {
  background: var(--c);
  color: #fff;
}

.name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
