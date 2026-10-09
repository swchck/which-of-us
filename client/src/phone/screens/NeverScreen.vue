<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed, ref } from 'vue';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'never' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'never' ? view.value.personal : null));
const did = ref<boolean | null>(null);
const counts = computed(() => Array.from({ length: (phase.value?.players ?? 0) + 1 }, (_, i) => i));

function guess(n: number): void {
  if (did.value !== null) answer(`${did.value ? 1 : 0}:${n}`);
}
</script>

<template>
  <div v-if="phase" class="never">
    <div class="statement sticker">
      <div class="label">Раунд {{ phase.round }} из {{ phase.rounds }}</div>
      <div class="text">Я никогда не {{ phase.statement }}</div>
    </div>
    <Waiting
      v-if="personal?.guess !== undefined"
      title="Ответ принят!"
      :note="`${personal.did ? 'Было' : 'Не было'} · угадываете: ${personal.guess}`"
      icon="🙊"
    />
    <template v-else-if="did === null">
      <p class="ask">Честно: было такое?</p>
      <div class="pair">
        <button class="btn pink big deal" style="--i: 0" @click="did = true"><Emoji char="🙋" /> Было</button>
        <button class="btn cyan big deal" style="--i: 1" @click="did = false"><Emoji char="🙅" /> Не было</button>
      </div>
    </template>
    <template v-else>
      <p class="ask">Сколько человек скажут «было»? <button class="back" @click="did = null">изменить ответ</button></p>
      <div class="numbers">
        <button v-for="n in counts" :key="n" class="btn ghost num deal" :style="{ '--i': n }" @click="guess(n)">{{ n }}</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.never {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.statement {
  padding: 18px;
}

.label {
  font-size: 15px;
  font-weight: 800;
  color: var(--pink);
}

.text {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.2;
}

.ask {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  text-align: center;
}

.back {
  display: block;
  margin: 6px auto 0;
  border: 0;
  background: none;
  color: var(--muted);
  font-size: 15px;
  text-decoration: underline;
}

.pair {
  display: grid;
  gap: 14px;
}

.big {
  min-height: 90px;
  font-size: 24px;
}

.numbers {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.num {
  min-height: 64px;
  font-size: 26px;
}
</style>
