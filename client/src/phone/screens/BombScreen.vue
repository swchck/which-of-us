<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { PLAYER_COLORS } from '../../../../shared/protocol';
import { answer, playerById, view } from '../store';
import { event } from '../haptics';
import { chime } from '../sound';

const phase = computed(() => (view.value?.phase.kind === 'bomb' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'bomb' ? view.value.personal : null));
const holder = computed(() => playerById(phase.value?.holder));
const targets = computed(() => (personal.value?.targets ?? []).map((id) => playerById(id)).filter((p) => p !== undefined));

// a heartbeat buzz the whole time the bomb is in hand, so the phone feels hot even face down
let buzz: ReturnType<typeof setInterval> | undefined;
watch(
  () => personal.value?.holding,
  (holding, was) => {
    clearInterval(buzz);
    if (holding) {
      event('alert');
      chime();
      buzz = setInterval(() => event('hit'), 1200);
    } else if (was) event('tick');
  },
  { immediate: true },
);
onBeforeUnmount(() => clearInterval(buzz));
</script>

<template>
  <div v-if="phase && personal && view" class="bomb" :class="{ hot: personal.holding }">
    <template v-if="personal.holding">
      <div class="alarm display"><Emoji char="💣" :size="56" /> Бомба у вас!</div>
      <div class="category sticker">{{ phase.category }}</div>
      <p class="tip">Назовите слово вслух — и передайте:</p>
      <div class="grid">
        <button
          v-for="(p, i) in targets"
          :key="p.id"
          class="pick deal"
          :style="{ '--c': PLAYER_COLORS[p.color], '--i': i }"
          @click="answer(p.id)"
        >
          <Avatar :player="p" :code="view.code" :size="44" :ring="3" />
          <span class="name">{{ p.name }}</span>
        </button>
      </div>
    </template>
    <div v-else class="calm">
      <Emoji char="💣" :size="110" />
      <div class="who display">Бомба сейчас у игрока<br /><span class="holder">{{ holder?.name }}</span></div>
      <div class="category sticker">{{ phase.category }}</div>
      <p class="tip">Подсказывать можно, но держите телефон наготове</p>
    </div>
  </div>
</template>

<style scoped>
.bomb {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bomb.hot {
  margin: 0 -16px;
  padding: 0 16px;
  border-radius: 24px;
  background: radial-gradient(circle at 50% 10%, rgba(255, 82, 82, 0.55), transparent 70%);
}

.hot .category {
  animation: alarm 0.6s ease-in-out infinite alternate;
}

@keyframes alarm {
  to {
    box-shadow: 0 0 0 6px var(--red);
  }
}

.alarm {
  align-self: center;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 30px;
  color: var(--yellow);
  animation: wobble 0.35s ease-in-out infinite;
}

.category {
  padding: 16px;
  font-size: 24px;
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
  min-height: 76px;
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

.pick:active {
  translate: 0 3px;
  box-shadow: 0 1px 0 var(--ink);
  background: var(--c);
}

.name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* five targets on a 640px-tall phone must fit without scrolling mid-panic */
@media (max-height: 700px) {
  .pick {
    min-height: 56px;
    padding: 6px 10px;
  }

  .alarm {
    font-size: 26px;
  }
}

.calm {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}

.who {
  font-size: 22px;
}

.holder {
  font-size: 30px;
  white-space: nowrap;
}
</style>
