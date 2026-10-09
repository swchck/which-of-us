<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import ScaleBar from '../parts/ScaleBar.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'scale' ? view.value.phase : null));
const target = computed(() => playerById(phase.value?.target));
const others = computed(() => view.value?.players.filter((p) => p.connected && p.id !== phase.value?.target) ?? []);
</script>

<template>
  <div v-if="phase && view && target" class="scale-view">
    <div class="head">
      <Avatar :player="target" :code="view.code" :size="170" :ring="6" />
      <div class="question sticker">
        <div class="label display"><Emoji char="🌡️" /> Шкала</div>
        <WordsIn class="text" :text="phase.question" />
        <div class="note" :class="{ ok: phase.answered.includes(target.id) }">
          <template v-if="phase.answered.includes(target.id)">Оценка от {{ target.name }}: есть <Icon name="check" /></template>
          <template v-else>{{ target.name }} честно оценивает себя…</template>
        </div>
      </div>
      <TimerRing :deadline="phase.deadline" :size="150" />
    </div>
    <ScaleBar :low="phase.low" :high="phase.high" />
    <PlayerRow :code="view.code" :players="others" :done="phase.answered" :size="110" />
  </div>
</template>

<style scoped>
.scale-view {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 34px;
}

.question {
  flex: 1;
  padding: 26px 34px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 24px;
  font-weight: 800;
  color: var(--pink);
}

.text {
  font-size: 52px;
  font-weight: 900;
  line-height: 1.12;
}

.note {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 800;
  color: #6b5a99;
}

.note.ok {
  color: #16a05a;
}
</style>
