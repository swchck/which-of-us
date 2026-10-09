<script setup lang="ts">
import { computed } from 'vue';
import { JUNK_BIDS } from '../../../../shared/protocol';
import { answer, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'junkBid' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'junkBid' ? view.value.personal : null));
</script>

<template>
  <div v-if="phase && personal" class="junk">
    <Waiting v-if="personal.seller" title="Это ваш лот" note="Смотрите, как за него торгуются" icon="🛒" />
    <Waiting v-else-if="personal.answer !== undefined" :title="personal.answer ? `Ставка: ${personal.answer} 🪙` : 'Пас'" note="Ставки тайные — итог на экране" icon="🛒" />
    <template v-else>
      <div class="lot sticker">
        <b class="display">{{ phase.item }}</b>
        <span>«{{ phase.pitch }}»</span>
      </div>
      <p class="coins display">У вас {{ personal.coins }} 🪙</p>
      <div class="bids">
        <button v-for="b in JUNK_BIDS" :key="b" class="bid" :class="{ pass: b === 0 }" :disabled="b > personal.coins" @click="answer(b)">
          {{ b === 0 ? 'Пас' : `${b} 🪙` }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.junk {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lot {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  font-weight: 800;
}

.lot b {
  font-size: 22px;
}

.coins {
  margin: 0;
  text-align: center;
  font-size: 22px;
}

.bids {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.bid {
  min-height: 80px;
  border-radius: 20px;
  border: 4px solid var(--ink);
  background: var(--yellow);
  color: var(--ink);
  box-shadow: 0 5px 0 var(--ink);
  font: inherit;
  font-size: 24px;
  font-weight: 900;
}

.bid.pass {
  background: var(--paper);
}

.bid:disabled {
  opacity: 0.35;
}
</style>
