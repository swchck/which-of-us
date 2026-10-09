<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'junkBid' || p?.kind === 'junkSold' ? p : null;
});
const seller = computed(() => playerById(phase.value?.seller));
const buyer = computed(() => (phase.value?.kind === 'junkSold' ? playerById(phase.value.buyer) : undefined));
const bidders = computed(() => view.value?.players.filter((p) => p.connected && p.id !== phase.value?.seller) ?? []);
</script>

<template>
  <div v-if="phase && view" class="junk">
    <div class="top">
      <div class="label display">
        <Emoji char="🛒" /> Барахолка<template v-if="phase.kind === 'junkBid'"> · лот {{ phase.lot }} из {{ phase.lots }}</template>
      </div>
      <TimerRing v-if="phase.kind === 'junkBid'" :deadline="phase.deadline" :size="150" />
    </div>
    <div class="lot">
      <div class="tag sticker">
        <div class="item display">{{ phase.item }}</div>
        <div class="pitch">«{{ phase.pitch }}»</div>
        <div class="seller">
          <Avatar v-if="seller" :player="seller" :code="view.code" :size="54" :ring="3" />
          <span>продаёт {{ seller?.name }}</span>
        </div>
      </div>
      <div v-if="phase.kind === 'junkSold'" class="sold sticker" :class="{ none: !buyer }">
        <template v-if="buyer">
          <span class="stamp display">Продано!</span>
          <Avatar :player="buyer" :code="view.code" :size="120" :ring="5" />
          <b class="display">{{ buyer.name }}</b>
          <span class="price display">за {{ phase.price }} 🪙</span>
          <span class="note">хотели купить: {{ phase.bidders.length }}</span>
        </template>
        <span v-else class="stamp display">Не продано</span>
      </div>
    </div>
    <PlayerRow v-if="phase.kind === 'junkBid'" :code="view.code" :players="bidders" :done="phase.bids" :size="80" />
  </div>
</template>

<style scoped>
.junk {
  position: absolute;
  inset: 0;
  padding: 40px 120px 230px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-size: 44px;
  color: var(--yellow);
}

.lot {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
}

.tag {
  max-width: 900px;
  padding: 30px 44px;
  rotate: -2deg;
  animation: pop-in 500ms both;
}

.item {
  font-size: 58px;
  line-height: 1.05;
}

.pitch {
  margin-top: 14px;
  font-size: 34px;
  font-weight: 800;
  font-style: italic;
}

.seller {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 24px;
  font-weight: 800;
}

.sold {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 26px 40px;
  background: var(--yellow);
  rotate: 3deg;
  animation: pop-in 500ms 200ms both;
}

.sold.none {
  background: #e7e0f5;
}

.stamp {
  font-size: 48px;
  color: var(--red);
}

.sold b {
  font-size: 36px;
}

.price {
  font-size: 34px;
}

.note {
  font-size: 22px;
  font-weight: 800;
}
</style>
