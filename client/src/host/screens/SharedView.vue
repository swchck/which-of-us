<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import InkView from '../../common/InkView.vue';
import TimerRing from '../parts/TimerRing.vue';
import { liveInk, playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'shared' ? view.value.phase : null));
const artist = computed(() => playerById(phase.value?.artist));
const order = computed(() => phase.value?.order.map((id) => playerById(id)).filter((p) => p !== undefined) ?? []);
</script>

<template>
  <div v-if="phase && view && artist" class="shared">
    <div class="side">
      <div class="plate">
        <div class="label display">Общая картина</div>
        <div class="theme display">{{ phase.theme }}</div>
      </div>
      <div :key="phase.turn" class="now sticker">
        <Avatar :player="artist" :code="view.code" :size="110" />
        <div>
          <div class="who display">Рисует {{ artist.name }}</div>
          <div class="task">{{ phase.task }}</div>
        </div>
      </div>
      <div class="turns">
        Ход {{ phase.turn + 1 }} из {{ phase.turns }}
        <div class="order">
          <div
            v-for="(p, i) in order"
            :key="p.id"
            class="o"
            :class="{ on: p.id === artist.id, past: i < phase.turn % order.length }"
          >
            <Avatar :player="p" :code="view.code" :size="54" :ring="3" />
          </div>
        </div>
      </div>
      <TimerRing :deadline="phase.deadline" :size="140" />
    </div>
    <div class="easel sticker">
      <InkView :code="view.code" :board="phase.board" :ink="phase.ink" :live="liveInk(artist.id)" />
    </div>
  </div>
</template>

<style scoped>
.shared {
  position: absolute;
  inset: 0;
  padding: 40px 70px 230px;
  display: flex;
  gap: 40px;
  align-items: center;
}

.side {
  width: 470px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.label {
  font-size: 22px;
  color: var(--pink);
  font-weight: 800;
}

.theme {
  font-size: 46px;
  font-weight: 900;
  line-height: 1.05;
  text-shadow: 0 4px 0 var(--ink);
}

.now {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 18px;
  animation: pop-in 450ms both;
}

.who {
  font-size: 22px;
  font-weight: 800;
  color: var(--pink);
}

.task {
  font-size: 28px;
  font-weight: 900;
  line-height: 1.1;
}

.turns {
  font-size: 22px;
  font-weight: 800;
  color: var(--muted);
}

.order {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 12px;
}

.o {
  opacity: 0.55;
  transition: transform 300ms;
}

.o.on {
  opacity: 1;
  transform: scale(1.2) translateY(-6px);
}

.easel {
  flex: 1;
  padding: 0;
  overflow: hidden;
  transform: rotate(0.6deg);
}
</style>
