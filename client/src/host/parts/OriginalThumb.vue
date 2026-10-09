<script setup lang="ts">
import type { PictureRef } from '../../../../shared/protocol';
import InkView from '../../common/InkView.vue';

const props = defineProps<{ code: string; picture: PictureRef; height: number }>();
const width = (props.height * props.picture.board.w) / props.picture.board.h;
</script>

<template>
  <div class="original sticker">
    <div class="pic" :style="{ width: `${width}px`, height: `${height}px` }">
      <InkView :code="code" :board="picture.board" :ink="picture.ink" :image="picture.image" />
    </div>
    <span class="display">Оригинал</span>
  </div>
</template>

<style scoped>
.original {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  rotate: -3deg;
}

.pic {
  overflow: hidden;
  border-radius: 10px;
}

span {
  font-size: 18px;
}
</style>
