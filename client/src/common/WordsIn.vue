<script setup lang="ts">
import { computed } from 'vue';

/** Text that drops in word by word, for questions the room reads together. */
const props = withDefaults(defineProps<{ text: string; step?: number; delay?: number }>(), { step: 0.06, delay: 0.15 });
const words = computed(() => props.text.split(/\s+/).filter(Boolean));
</script>

<template>
  <span class="words">
    <template v-for="(w, i) in words" :key="`${i}${w}`">
      <span class="w" :style="{ animationDelay: `${delay + i * step}s` }">{{ w }}</span>{{ ' ' }}
    </template>
  </span>
</template>

<style scoped>
.words {
  display: block;
}

.w {
  display: inline-block;
  animation: word-in 420ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

@keyframes word-in {
  from {
    opacity: 0;
    translate: 0 0.6em;
    rotate: 6deg;
  }
  to {
    opacity: 1;
    translate: 0 0;
    rotate: 0deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .w {
    animation: none;
  }
}
</style>
