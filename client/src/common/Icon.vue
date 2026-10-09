<script setup lang="ts">
export type IconName =
  | 'play'
  | 'pause'
  | 'skip'
  | 'home'
  | 'voice'
  | 'music'
  | 'fullscreen'
  | 'close'
  | 'check'
  | 'undo'
  | 'trash'
  | 'eraser'
  | 'contrast'
  | 'backspace'
  | 'arrow'
  | 'mute'
  | 'gear'
  | 'info'
  | 'edit';

withDefaults(defineProps<{ name: IconName; size?: number | string }>(), { size: '1em' });

// 24-unit line glyphs for controls; filled parts use currentColor so a button's text colour drives them
const PATHS: Record<IconName, { d: string; fill?: string }> = {
  play: { d: 'M7 4.5 19.5 12 7 19.5Z', fill: 'M7 4.5 19.5 12 7 19.5Z' },
  pause: { d: 'M7 5v14M17 5v14' },
  skip: { d: 'M5 5 15 12 5 19ZM19 5v14', fill: 'M5 5 15 12 5 19Z' },
  home: { d: 'M4 11 12 4l8 7v9h-5.5v-6h-5v6H4Z' },
  edit: { d: 'M4 20h4L19 9l-4-4L4 16ZM13.5 6.5l4 4' },
  voice: { d: 'M4 5h16v11H10l-5 4v-4H4ZM8 9h8M8 12.5h5' },
  music: { d: 'M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
  fullscreen: { d: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5' },
  close: { d: 'M6 6l12 12M18 6 6 18' },
  check: { d: 'M5 12.5 10 17.5 19.5 7' },
  undo: { d: 'M9 5 4 10l5 5M4 10h10a5 5 0 0 1 0 10h-3' },
  trash: { d: 'M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13M10 11v5M14 11v5' },
  eraser: { d: 'M8 20h12M3.5 14.5 13 5l6 6-8.5 8.5H8.5ZM9 9l6 6' },
  contrast: { d: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 4v16', fill: 'M12 4a8 8 0 0 1 0 16Z' },
  backspace: { d: 'M9 5h11v14H9l-6-7ZM12 9l5 6M17 9l-5 6' },
  arrow: { d: 'M4 12h15M13 6l6 6-6 6' },
  mute: { d: 'M4 9h4l5-4v14l-5-4H4ZM16.5 9l5 6M21.5 9l-5 6' },
  info: { d: 'M12 10.5v7M12 6.5v.2', fill: 'M10.6 6.6a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 0 0-2.8 0Z' },
  gear: {
    d: 'M9.6 5L10.2 2.4L13.8 2.4L14.4 5A7.4 7.4 0 0 1 15.3 5.4L17.5 3.9L20.1 6.5L18.6 8.7A7.4 7.4 0 0 1 19 9.6L21.6 10.2L21.6 13.8L19 14.4A7.4 7.4 0 0 1 18.6 15.3L20.1 17.5L17.5 20.1L15.3 18.6A7.4 7.4 0 0 1 14.4 19L13.8 21.6L10.2 21.6L9.6 19A7.4 7.4 0 0 1 8.7 18.6L6.5 20.1L3.9 17.5L5.4 15.3A7.4 7.4 0 0 1 5 14.4L2.4 13.8L2.4 10.2L5 9.6A7.4 7.4 0 0 1 5.4 8.7L3.9 6.5L6.5 3.9L8.7 5.4A7.4 7.4 0 0 1 9.6 5ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  },
};
</script>

<template>
  <svg class="icon" viewBox="0 0 24 24" :width="size" :height="size" aria-hidden="true">
    <path v-if="PATHS[name].fill" :d="PATHS[name].fill" fill="currentColor" />
    <path :d="PATHS[name].d" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<style scoped>
.icon {
  display: inline-block;
  flex: none;
  vertical-align: -0.15em;
}
</style>
