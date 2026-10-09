<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import InkView from '../../common/InkView.vue';
import { assetUrl } from '../../common/ink';
import TimerRing from '../parts/TimerRing.vue';
import { liveInk, playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'draw' ? view.value.phase : null));
const subject = computed(() => playerById(phase.value?.subject));
const describer = computed(() => playerById(phase.value?.describer));
const artists = computed(() => view.value?.players.filter((p) => p.connected && p.id !== phase.value?.describer) ?? []);
const tile = computed(() => {
  const n = artists.value.length;
  const tall = (phase.value?.board.h ?? 1000) / (phase.value?.board.w ?? 1000);
  const perRow = n <= 4 ? n : Math.ceil(n / 2);
  const rows = n <= 4 ? 1 : 2;
  const byWidth = (1700 - (perRow - 1) * 30) / perRow;
  const byHeight = (rows === 1 ? 470 : 250) / tall;
  return Math.min(380, byWidth, byHeight);
});
</script>

<template>
  <div v-if="phase && view" class="draw">
    <div class="head">
      <img v-if="phase.mode === 'selfie' && phase.image" class="model" :src="assetUrl(view.code, phase.image)" alt="" />
      <Avatar v-else-if="describer" :player="describer" :code="view.code" :size="150" />
      <div class="task sticker">
        <div class="label display">
          <template v-if="phase.mode === 'selfie'">Дорисуй селфи · модель: {{ subject?.name }}</template>
          <template v-else-if="phase.mode === 'copy'"><Emoji char="🖼" /> Срисуй по памяти</template>
          <template v-else-if="phase.mode === 'tale'"><Emoji char="📖" /> Сказочник · рисунки увидим без имён</template>
          <template v-else-if="describer"><Emoji char="🗣️" /> Нарисуй по описанию</template>
          <template v-else>Монстр по частям · часть {{ (phase.step ?? 0) + 1 }} из {{ phase.steps?.length }}</template>
        </div>
        <div class="text">
          <template v-if="describer">{{ describer.name }} описывает картинку — слушайте и рисуйте!</template>
          <template v-else-if="phase.mode === 'copy'">Картинка спрятана. Рисуйте, что запомнили!</template>
          <template v-else-if="phase.mode === 'tale'">{{ phase.prompt }}</template>
          <template v-else>
            {{ phase.mode === 'selfie' ? phase.prompt : `${phase.prompt}: ${phase.steps?.[phase.step ?? 0]?.toLowerCase()}` }}
          </template>
        </div>
      </div>
      <TimerRing :deadline="phase.deadline" :size="150" />
    </div>
    <div class="tiles">
      <div v-for="p in artists" :key="p.id" class="tile" :style="{ width: `${tile}px` }">
        <div class="canvas sticker" :class="{ done: phase.done.includes(p.id) }">
          <div v-if="phase.mode === 'tale'" class="secret display">🤫</div>
          <InkView
            v-else
            :code="view.code"
            :board="phase.board"
            :image="phase.mode === 'selfie' ? phase.image : undefined"
            :live="liveInk(p.id)"
          />
          <div v-if="phase.done.includes(p.id)" class="ok pop-in"><Icon name="check" /></div>
        </div>
        <div class="who">
          <Avatar :player="p" :code="view.code" :size="40" :ring="3" />
          <span>{{ p.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draw {
  position: absolute;
  inset: 0;
  padding: 40px 80px 230px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.secret {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  font-size: 80px;
}

.head {
  display: flex;
  gap: 30px;
  align-items: center;
}

.model {
  width: 150px;
  height: 150px;
  border-radius: 24px;
  border: var(--line) solid var(--ink);
  box-shadow: var(--shadow);
  object-fit: cover;
  transform: rotate(-4deg);
}

.task {
  flex: 1;
  padding: 22px 32px;
}

.label {
  font-size: 22px;
  font-weight: 800;
  color: var(--pink);
}

.text {
  font-size: 46px;
  font-weight: 900;
  line-height: 1.1;
}

.tiles {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  gap: 24px 30px;
}

.tile {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.canvas {
  position: relative;
  overflow: hidden;
  padding: 0;
  transition: transform 300ms;
}

.canvas.done {
  transform: rotate(-1.5deg);
  box-shadow:
    0 6px 0 var(--ink),
    0 0 0 6px var(--green);
}

.ok {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--green);
  border: 4px solid var(--ink);
  font-weight: 900;
  font-size: 24px;
}

.who {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 900;
  padding-left: 6px;
}
</style>
