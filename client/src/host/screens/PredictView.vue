<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'predict' ? view.value.phase : null));
const target = computed(() => playerById(phase.value?.target));
const others = computed(() => view.value?.players.filter((p) => p.connected && p.id !== phase.value?.target) ?? []);
const COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--green)'];
const LETTERS = ['А', 'Б', 'В', 'Г'];
</script>

<template>
  <div v-if="phase && view && target" class="predict">
    <div class="main">
      <div class="target">
        <Avatar :player="target" :code="view.code" :size="260" :ring="8" />
        <div class="tname display">{{ target.name }}</div>
        <div v-if="phase.lie" class="tstatus">хранит секрет <Emoji char="🤫" /></div>
        <div v-else class="tstatus" :class="{ ok: phase.answered.includes(target.id) }">
          <template v-if="phase.answered.includes(target.id)">ответ записан <Icon name="check" /></template>
          <template v-else>отвечает…</template>
        </div>
      </div>
      <div class="right">
        <div class="head">
          <div class="question sticker">
            <div class="label display"><Emoji :char="phase.lie ? '🤥' : '🔮'" /> {{ phase.lie ? 'Кто соврал?' : 'Угадай ответ' }}</div>
            <WordsIn class="text" :text="phase.question" />
          </div>
          <TimerRing :deadline="phase.deadline" :size="150" />
        </div>
        <div class="options">
          <div
            v-for="(o, i) in phase.options"
            :key="i"
            class="option"
            :style="{ background: COLORS[i % 4], animationDelay: `${i * 0.12}s` }"
          >
            <span class="letter display">{{ LETTERS[i] }}</span>
            {{ o }}
          </div>
        </div>
      </div>
    </div>
    <PlayerRow :code="view.code" :players="others" :done="phase.answered" :size="90" />
  </div>
</template>

<style scoped>
.predict {
  position: absolute;
  inset: 0;
  padding: 50px 80px 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 30px;
}

.main {
  display: flex;
  gap: 60px;
  align-items: center;
}

.target {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  animation: pop-in 500ms both;
}

.tname {
  font-size: 42px;
  font-weight: 900;
  text-shadow: 0 4px 0 var(--ink);
}

.tstatus {
  font-size: 22px;
  font-weight: 800;
  padding: 4px 16px;
  border-radius: 999px;
  background: var(--orange);
  color: var(--ink);
  border: 3px solid var(--ink);
}

.tstatus.ok {
  background: var(--green);
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.head {
  display: flex;
  gap: 30px;
  align-items: center;
}

.question {
  flex: 1;
  padding: 26px 34px;
}

.label {
  font-size: 24px;
  font-weight: 800;
  color: var(--pink);
}

.text {
  font-size: 50px;
  font-weight: 900;
  line-height: 1.12;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.option {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 24px;
  border-radius: 20px;
  border: var(--line) solid var(--ink);
  box-shadow: var(--shadow);
  color: var(--ink);
  font-size: 32px;
  font-weight: 900;
  animation: pop-in 450ms both;
}

.letter {
  width: 54px;
  height: 54px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--paper);
  border: 3px solid var(--ink);
  font-size: 24px;
}
</style>
