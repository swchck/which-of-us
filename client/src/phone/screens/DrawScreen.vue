<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { InkOp } from '../../../../shared/protocol';
import DrawPad from '../DrawPad.vue';
import { playerById, send, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'draw' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'draw' ? view.value.personal : null));
const subject = computed(() => playerById(phase.value?.subject));
const describer = computed(() => playerById(phase.value?.describer));
const drawn = ref(0);

watch(
  () => view.value?.phaseId,
  () => {
    drawn.value = personal.value?.strokes?.length ?? 0;
  },
  { immediate: true },
);

function onOp(op: InkOp): void {
  const v = view.value;
  if (!v) return;
  if (op.k === 'end') drawn.value++;
  else if (op.k === 'undo') drawn.value = Math.max(0, drawn.value - 1);
  else if (op.k === 'clear') drawn.value = 0;
  send({ t: 'ink', phaseId: v.phaseId, op });
}

function submit(): void {
  const v = view.value;
  if (v) send({ t: 'submit', phaseId: v.phaseId });
}
</script>

<template>
  <div v-if="phase && personal && view" class="draw">
    <template v-if="!personal.done">
      <div class="task sticker">
        <template v-if="phase.mode === 'selfie'">
          <div class="label">Модель: {{ subject?.name }}</div>
          <div class="prompt">{{ phase.prompt }}</div>
        </template>
        <template v-else-if="phase.mode === 'copy'">
          <div class="label">Срисуй по памяти</div>
          <div class="prompt">Нарисуйте картинку, которую только что видели</div>
        </template>
        <template v-else-if="phase.mode === 'tale'">
          <div class="label">Сказочник · тема</div>
          <div class="prompt">{{ phase.prompt }}</div>
          <div class="sub">Авторов никто не увидит. Рисуйте загадочно!</div>
        </template>
        <template v-else-if="describer">
          <div class="label">Нарисуй по описанию</div>
          <div class="prompt">Слушайте, что рассказывает {{ describer.name }}</div>
        </template>
        <template v-else>
          <div class="label">{{ phase.prompt }} · часть {{ (phase.step ?? 0) + 1 }} из {{ phase.steps?.length }}</div>
          <div class="prompt">{{ personal.section }}</div>
          <div v-if="personal.guide" class="sub">Сверху — краешек чужой части. Продолжите линии!</div>
          <div v-else-if="(phase.step ?? 0) < (phase.steps?.length ?? 1) - 1" class="sub">
            Заведите линии в нижнюю полосу — её увидит следующий
          </div>
        </template>
      </div>
      <DrawPad
        :key="view.phaseId"
        :code="view.code"
        :board="phase.board"
        :image="phase.image"
        :guide="personal.guide"
        :handoff="phase.mode === 'monster' && (phase.step ?? 0) < (phase.steps?.length ?? 1) - 1"
        :initial="personal.strokes"
        @op="onOp"
      />
      <button class="btn green done" :disabled="drawn === 0" @click="submit">Готово!</button>
    </template>
    <Waiting v-else title="Шедевр отправлен!" note="Ждём остальных художников" icon="🎨" />
  </div>
</template>

<style scoped>
.draw {
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

.label {
  font-size: 13px;
  font-weight: 900;
  color: #7a5fc0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.prompt {
  font-size: 19px;
  font-weight: 900;
  line-height: 1.2;
}

.sub {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  color: #6b5a99;
}

.done {
  flex: none;
}
</style>
