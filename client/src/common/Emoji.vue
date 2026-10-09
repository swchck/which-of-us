<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { AnimationItem } from 'lottie-web';
import { animationUrl, iconUrl } from './emoji';

const props = withDefaults(
  defineProps<{
    char: string;
    /** Pixels, or any CSS length; inherits the text size when absent. */
    size?: number | string;
    /** Plays the Noto animation when there is one, falling back to the still icon. */
    animated?: boolean;
    /** Loops before the animation settles, so a screen full of them stops costing CPU. */
    loops?: number;
    /** White die-cut rim and an ink shadow, for icons standing on their own. */
    rim?: boolean;
  }>(),
  { size: undefined, animated: false, loops: 2, rim: false },
);

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const anim = computed(() => (props.animated && !reduced ? animationUrl(props.char) : undefined));
const icon = computed(() => iconUrl(props.char));
const fontSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size));

const box = ref<HTMLElement>();
const ready = ref(false);
const failed = ref(false);
let player: AnimationItem | undefined;
let gone = false;

onMounted(async () => {
  const path = anim.value;
  if (!path) return;
  const { default: lottie } = await import('lottie-web/build/player/lottie_light');
  if (gone || !box.value) return;
  player = lottie.loadAnimation({ container: box.value, renderer: 'svg', loop: props.loops, autoplay: true, path });
  player.addEventListener('DOMLoaded', () => (ready.value = true));
  player.addEventListener('data_failed', () => (failed.value = true));
});

onBeforeUnmount(() => {
  gone = true;
  player?.destroy();
});
</script>

<template>
  <span class="emoji" :class="{ rim }" :style="{ fontSize }" role="img" :aria-label="char">
    <span v-if="anim && !failed" ref="box" class="anim" :class="{ ready }" />
    <img v-else-if="icon" :src="icon" alt="" draggable="false" decoding="async" />
    <span v-else class="text">{{ char }}</span>
  </span>
</template>

<style scoped>
.emoji {
  display: inline-block;
  width: 1.15em;
  height: 1.15em;
  line-height: 1;
  vertical-align: -0.2em;
  flex: none;
}

img,
.anim {
  display: block;
  width: 100%;
  height: 100%;
}

.anim {
  opacity: 0;
  scale: 0.6;
  transition:
    opacity 160ms ease,
    scale 320ms cubic-bezier(0.2, 1.4, 0.4, 1);
}

.anim.ready {
  opacity: 1;
  scale: 1;
}

.text {
  font-size: 0.95em;
}

/* four hard drop-shadows make the die-cut rim; static, so it is painted once */
.rim img,
.rim .anim {
  filter: drop-shadow(0.03em 0 0 #fff) drop-shadow(-0.03em 0 0 #fff) drop-shadow(0 0.03em 0 #fff) drop-shadow(0 -0.03em 0 #fff)
    drop-shadow(0 0.05em 0 var(--ink));
}
</style>
