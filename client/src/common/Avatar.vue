<script setup lang="ts">
import Emoji from './Emoji.vue';
import { computed } from 'vue';
import { PLAYER_COLORS, type PublicPlayer } from '../../../shared/protocol';
import { assetUrl } from './ink';

const props = withDefaults(
  defineProps<{
    player: PublicPlayer;
    code: string;
    size?: number;
    ring?: number;
  }>(),
  { size: 96, ring: 5 },
);

const color = computed(() => PLAYER_COLORS[props.player.color % PLAYER_COLORS.length]);
const initial = computed(() => props.player.name.trim().charAt(0).toUpperCase() || '?');
</script>

<template>
  <div
    class="avatar"
    :class="{ offline: !player.connected }"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      boxShadow: `0 0 0 ${ring}px ${color}, 0 0 0 ${ring + 4}px var(--ink)`,
    }"
  >
    <img v-if="player.selfie" :src="assetUrl(code, player.selfie)" alt="" draggable="false" />
    <span v-else class="initial display" :style="{ fontSize: `${size * 0.46}px` }">{{ initial }}</span>
    <span v-if="player.bot" class="bot" :style="{ fontSize: `${Math.max(12, size * 0.22)}px` }"><Emoji char="🤖" /></span>
  </div>
</template>

<style scoped>
.avatar {
  position: relative;
  border-radius: 50%;
  overflow: visible;
  flex: none;
  display: grid;
  place-items: center;
  transition: filter 300ms;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.initial {
  color: #fff;
  font-weight: 800;
  text-shadow: 0 3px 0 rgba(27, 16, 51, 0.35);
}

.offline {
  filter: grayscale(1) brightness(0.6);
}

.bot {
  position: absolute;
  right: -6%;
  bottom: -6%;
}
</style>
