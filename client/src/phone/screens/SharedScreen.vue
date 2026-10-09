<script setup lang="ts">
import { computed } from 'vue';
import type { InkOp } from '../../../../shared/protocol';
import InkView from '../../common/InkView.vue';
import DrawPad from '../DrawPad.vue';
import { live, playerById, send, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'shared' ? view.value.phase : null));
const myTurn = computed(() => view.value?.personal.kind === 'shared' && view.value.personal.myTurn);
const artist = computed(() => playerById(phase.value?.artist));
const next = computed(() => {
  const p = phase.value;
  if (!p || p.turn + 1 >= p.turns) return undefined;
  return playerById(p.order[(p.turn + 1) % p.order.length]);
});

function onOp(op: InkOp): void {
  const v = view.value;
  if (v) send({ t: 'ink', phaseId: v.phaseId, op });
}

function submit(): void {
  const v = view.value;
  if (v) send({ t: 'submit', phaseId: v.phaseId });
}
</script>

<template>
  <div v-if="phase && view" class="shared">
    <div class="task sticker" :class="{ mine: myTurn }">
      <div class="label">{{ phase.theme }} · ход {{ phase.turn + 1 }} из {{ phase.turns }}</div>
      <div class="prompt">{{ myTurn ? phase.task : `Рисует ${artist?.name}` }}</div>
      <div v-if="!myTurn" class="sub">Задание: {{ phase.task }}</div>
    </div>
    <template v-if="myTurn">
      <DrawPad
        :key="view.phaseId"
        :code="view.code"
        :board="phase.board"
        :under="phase.ink"
        :initial="view.personal.kind === 'shared' ? view.personal.strokes : undefined"
        @op="onOp"
      />
      <button class="btn green" @click="submit">Передать кисть!</button>
    </template>
    <template v-else>
      <div class="watch sticker">
        <InkView :code="view.code" :board="phase.board" :ink="phase.ink" :live="live" />
      </div>
      <p class="next">{{ next ? `Следующим рисует ${next.name}` : 'Это последний ход!' }}</p>
    </template>
  </div>
</template>

<style scoped>
.shared {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.task {
  padding: 10px 14px;
  flex: none;
}

.task.mine {
  background: var(--yellow);
  animation: pop-in 400ms both;
}

.label {
  font-size: 13px;
  font-weight: 900;
  color: #7a5fc0;
  text-transform: uppercase;
}

.prompt {
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
}

.sub {
  font-size: 14px;
  font-weight: 700;
  color: #6b5a99;
}

.watch {
  overflow: hidden;
  padding: 0;
}

.next {
  margin: 0;
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}
</style>
