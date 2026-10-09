<script setup lang="ts">
import { computed } from 'vue';
import type { GalleryItem } from '../../../../shared/protocol';
import InkView from '../../common/InkView.vue';
import { assetUrl } from '../../common/ink';

const props = withDefaults(
  defineProps<{
    item: GalleryItem;
    code: string;
    /** Rendered height in px; width follows the item's aspect ratio. */
    height: number;
    replay?: number;
  }>(),
  { replay: 0 },
);

const ratio = computed(() => (props.item.board ? props.item.board.w / props.item.board.h : 1));
</script>

<template>
  <div class="card sticker" :style="{ height: `${height}px`, width: `${height * ratio}px` }">
    <img v-if="item.kind === 'photo' && item.image" :src="assetUrl(code, item.image)" alt="" />
    <InkView v-else-if="item.board" :code="code" :board="item.board" :ink="item.ink" :image="item.image" :replay="replay" />
    <slot />
  </div>
</template>

<style scoped>
.card {
  position: relative;
  padding: 0;
  overflow: hidden;
  flex: none;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
