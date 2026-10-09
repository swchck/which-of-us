<script setup lang="ts">
import { computed } from 'vue';
import InkView from '../../common/InkView.vue';
import { useCountdown } from '../../common/countdown';
import { assetUrl } from '../../common/ink';
import { answer, socket, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'gallery' ? view.value.phase : null));
const personal = computed(() => (view.value?.personal.kind === 'gallery' ? view.value.personal : null));
const opensIn = useCountdown(
  computed(() => phase.value?.votingFrom),
  () => socket.now(),
);
const items = computed(() => phase.value?.items ?? []);
</script>

<template>
  <div v-if="phase && personal && view" class="gallery">
    <Waiting
      v-if="!personal.canVote"
      title="Выставка!"
      note="Ваша работа на экране — пусть все оценят"
      icon="🖼"
    />
    <Waiting
      v-else-if="opensIn > 0"
      title="Смотрите на экран"
      :note="`Голосование откроется через ${opensIn} сек`"
      icon="📺"
    />
    <Waiting v-else-if="personal.answer" title="Голос принят!" note="Ждём остальных ценителей искусства" icon="🏆" />
    <template v-else>
      <div class="question sticker">Что лучше всего получилось?</div>
      <div class="grid">
        <button
          v-for="(item, i) in items"
          :key="item.id"
          class="item"
          :disabled="personal.own.includes(item.id) && !view.settings.selfVote"
          @click="answer(item.id)"
        >
          <span class="num display">{{ i + 1 }}</span>
          <img v-if="item.kind === 'photo' && item.image" :src="assetUrl(view.code, item.image)" alt="" />
          <InkView v-else-if="item.board" :code="view.code" :board="item.board" :ink="item.ink" :image="item.image" />
          <span v-if="personal.own.includes(item.id)" class="own">ваше</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.question {
  padding: 14px;
  font-size: 20px;
  font-weight: 900;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: start;
}

.item {
  position: relative;
  padding: 0;
  border: var(--line) solid var(--ink);
  border-radius: 16px;
  overflow: hidden;
  background: var(--paper);
  box-shadow: 0 5px 0 var(--ink);
  cursor: pointer;
  display: block;
  width: 100%;
}

.item:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 1px 0 var(--ink);
}

.item:disabled {
  opacity: 0.45;
  cursor: default;
}

.item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.num {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--yellow);
  color: var(--ink);
  border: 3px solid var(--ink);
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 900;
}

.own {
  position: absolute;
  bottom: 6px;
  right: 6px;
  z-index: 2;
  background: var(--ink);
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 8px;
}
</style>
