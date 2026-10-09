<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue';
import { bakeScene } from './backdrop/bake';
import type { Theme } from '../common/audio';
import { VARIANT_LOADERS } from './backdrop/variants';
import './backdrop/scenes.css';

/** `scene` moves a place's backdrop to one of its scenes; a scene without art falls back to the place. */
const props = defineProps<{ theme: Theme; scene?: string; still?: boolean }>();

// each scene is its own chunk: the TV downloads and parses only the places this party visits
const LOADERS: Record<Theme, () => Promise<{ default: Component }>> = {
  lobby: () => import('./backdrop/Stage.vue'),
  final: () => import('./backdrop/Stage.vue'),
  party: () => import('./backdrop/Party.vue'),
  camp: () => import('./backdrop/Camp.vue'),
  ocean: () => import('./backdrop/Ocean.vue'),
  city: () => import('./backdrop/City.vue'),
  jungle: () => import('./backdrop/Jungle.vue'),
  snow: () => import('./backdrop/Snow.vue'),
  desert: () => import('./backdrop/Desert.vue'),
  castle: () => import('./backdrop/Castle.vue'),
  arcade: () => import('./backdrop/Arcade.vue'),
  beach: () => import('./backdrop/Beach.vue'),
  space: () => import('./backdrop/Space.vue'),
  circus: () => import('./backdrop/Circus.vue'),
  farm: () => import('./backdrop/Farm.vue'),
  museum: () => import('./backdrop/Museum.vue'),
  plane: () => import('./backdrop/Plane.vue'),
  restaurant: () => import('./backdrop/Restaurant.vue'),
  dino: () => import('./backdrop/Dino.vue'),
  pirate: () => import('./backdrop/Pirate.vue'),
  cinema: () => import('./backdrop/Cinema.vue'),
  stadium: () => import('./backdrop/Stadium.vue'),
  train: () => import('./backdrop/Train.vue'),
  school: () => import('./backdrop/School.vue'),
  ski: () => import('./backdrop/Ski.vue'),
  candy: () => import('./backdrop/Candy.vue'),
  lab: () => import('./backdrop/Lab.vue'),
  volcano: () => import('./backdrop/Volcano.vue'),
  market: () => import('./backdrop/Market.vue'),
  zoo: () => import('./backdrop/Zoo.vue'),
  japan: () => import('./backdrop/Japan.vue'),
  fair: () => import('./backdrop/Fair.vue'),
  egypt: () => import('./backdrop/Egypt.vue'),
  bowling: () => import('./backdrop/Bowling.vue'),
  forest: () => import('./backdrop/Forest.vue'),
  future: () => import('./backdrop/Future.vue'),
  mine: () => import('./backdrop/Mine.vue'),
  race: () => import('./backdrop/Race.vue'),
  pumpkin: () => import('./backdrop/Pumpkin.vue'),
  sky: () => import('./backdrop/Sky.vue'),
  dacha: () => import('./backdrop/Dacha.vue'),
  wedding: () => import('./backdrop/Wedding.vue'),
  karaoke: () => import('./backdrop/Karaoke.vue'),
  gym: () => import('./backdrop/Gym.vue'),
  office: () => import('./backdrop/Office.vue'),
  newyear: () => import('./backdrop/NewYear.vue'),
  repair: () => import('./backdrop/Repair.vue'),
  clinic: () => import('./backdrop/Clinic.vue'),
  commute: () => import('./backdrop/Commute.vue'),
  moving: () => import('./backdrop/Moving.vue'),
  feast: () => import('./backdrop/Feast.vue'),
  roadtrip: () => import('./backdrop/Roadtrip.vue'),
  mystery: () => import('./backdrop/Mystery.vue'),
};
const SCENES = Object.fromEntries(
  Object.entries(LOADERS).map(([theme, load]) => [theme, defineAsyncComponent(load)]),
) as Record<Theme, Component>;
const VARIANTS = Object.fromEntries(
  Object.entries(VARIANT_LOADERS).map(([key, load]) => [key, defineAsyncComponent(load)]),
) as Record<string, Component>;
const variant = computed(() => (props.scene ? `${props.theme}/${props.scene}` : ''));
const loader = () => VARIANT_LOADERS[variant.value] ?? LOADERS[props.theme];
const painting = computed(() => VARIANTS[variant.value] ?? SCENES[props.theme]);

const art = ref<SVGSVGElement>();
let unbake = () => {};
let bakeTimer = 0;
let bakes = 0;

// a new scene stays unpainted until its bitmaps are in: painting it once with live filters cost WebKit
// up to 1.5 s in a single frame at Retina size, right under the transition wipe that hides it anyway
const raw = ref(true);
/** Longest a scene stays hidden; a slow bake (Chromium takes seconds) shows the live art meanwhile. */
const RAW_MAX_MS = 1000;

async function bake(fresh: boolean): Promise<void> {
  unbake();
  // two bakes of one theme can overlap; the older handle would be overwritten and its bitmaps never freed
  const mine = ++bakes;
  if (fresh) raw.value = true;
  const reveal = window.setTimeout(() => mine === bakes && (raw.value = false), RAW_MAX_MS);
  try {
    await loader()();
    await nextTick();
    // two frames: the async scene renders on the tick after its chunk resolves
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    if (mine !== bakes || !art.value) return;
    const baked = bakeScene(art.value, () => mine === bakes);
    unbake = baked.restore;
    await baked.done;
  } finally {
    clearTimeout(reveal);
    if (mine === bakes) raw.value = false;
  }
}

function rebakeLater(): void {
  clearTimeout(bakeTimer);
  // bitmaps are cut for the current screen density, so a resized window gets fresh ones once it settles
  bakeTimer = window.setTimeout(() => void bake(false), 400);
}

watch([() => props.theme, variant], () => void bake(true));
onMounted(() => {
  void bake(true);
  window.addEventListener('resize', rebakeLater);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', rebakeLater);
  clearTimeout(bakeTimer);
  unbake();
});

onMounted(() => {
  // fetch the rest while the lobby idles, so a new round never opens on an empty sky
  const warm = () => [...Object.values(LOADERS), ...Object.values(VARIANT_LOADERS)].forEach((load) => void load());
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 5000 });
  else setTimeout(warm, 3000);
});
</script>

<template>
  <div class="scenery" :class="{ still }">
    <svg ref="art" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" class="art" :class="{ raw }">
      <defs>
        <radialGradient id="g-lobby" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stop-color="#5b2db0" />
          <stop offset="60%" stop-color="#2f1566" />
          <stop offset="100%" stop-color="#1a0b3d" />
        </radialGradient>
        <!-- cel shading: a hard shadow band inside each shape's bottom-right and a thin light rim top-left,
             cut from the shape's own silhouette so it fits any outline; eroded first so the ink line stays ink -->
        <filter id="cel" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius="4" result="inner" />
          <feOffset in="inner" dx="-18" dy="-16" result="up" />
          <feComposite in="inner" in2="up" operator="out" result="shadeBand" />
          <feFlood flood-color="#1b0a33" flood-opacity="0.3" />
          <feComposite in2="shadeBand" operator="in" result="shade" />
          <feOffset in="inner" dx="7" dy="7" result="down" />
          <feComposite in="inner" in2="down" operator="out" result="lightBand" />
          <feFlood flood-color="#fffbe8" flood-opacity="0.45" />
          <feComposite in2="lightBand" operator="in" result="light" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shade" />
            <feMergeNode in="light" />
          </feMerge>
        </filter>
        <filter id="cel-s" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius="3" result="inner" />
          <feOffset in="inner" dx="-8" dy="-8" result="up" />
          <feComposite in="inner" in2="up" operator="out" result="shadeBand" />
          <feFlood flood-color="#1b0a33" flood-opacity="0.3" />
          <feComposite in2="shadeBand" operator="in" result="shade" />
          <feOffset in="inner" dx="4" dy="4" result="down" />
          <feComposite in="inner" in2="down" operator="out" result="lightBand" />
          <feFlood flood-color="#fffbe8" flood-opacity="0.45" />
          <feComposite in2="lightBand" operator="in" result="light" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shade" />
            <feMergeNode in="light" />
          </feMerge>
        </filter>
        <linearGradient id="g-curtain" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
          <stop offset="0%" stop-color="#8c0f3a" />
          <stop offset="45%" stop-color="#e42d63" />
          <stop offset="60%" stop-color="#ff5d86" />
          <stop offset="100%" stop-color="#8c0f3a" />
        </linearGradient>
        <linearGradient id="g-curtain-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#1a0726" stop-opacity="0" />
          <stop offset="100%" stop-color="#1a0726" stop-opacity="0.55" />
        </linearGradient>
        <radialGradient id="g-pool">
          <stop offset="0%" stop-color="#fff3c4" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#fff3c4" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="g-party" cx="50%" cy="10%" r="90%">
          <stop offset="0%" stop-color="#7a1f6e" />
          <stop offset="55%" stop-color="#2b0f4f" />
          <stop offset="100%" stop-color="#12062a" />
        </radialGradient>
        <linearGradient id="g-camp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0b1a4a" />
          <stop offset="55%" stop-color="#2c2470" />
          <stop offset="100%" stop-color="#5a2f7a" />
        </linearGradient>
        <radialGradient id="g-space" cx="70%" cy="30%" r="90%">
          <stop offset="0%" stop-color="#26135c" />
          <stop offset="60%" stop-color="#0d0828" />
          <stop offset="100%" stop-color="#05030f" />
        </radialGradient>
        <radialGradient id="g-final" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stop-color="#ff8a3d" />
          <stop offset="50%" stop-color="#c2307a" />
          <stop offset="100%" stop-color="#3d1270" />
        </radialGradient>
        <linearGradient id="g-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1f8fc4" />
          <stop offset="55%" stop-color="#14508f" />
          <stop offset="100%" stop-color="#0a2150" />
        </linearGradient>
        <linearGradient id="g-city" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0c0a2c" />
          <stop offset="60%" stop-color="#2b1a5e" />
          <stop offset="100%" stop-color="#6a2f7e" />
        </linearGradient>
        <linearGradient id="g-jungle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1b7a4e" />
          <stop offset="55%" stop-color="#0e4a32" />
          <stop offset="100%" stop-color="#06241a" />
        </linearGradient>
        <linearGradient id="g-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1c2a6b" />
          <stop offset="60%" stop-color="#3f5bb5" />
          <stop offset="100%" stop-color="#8aa2e8" />
        </linearGradient>
        <linearGradient id="g-desert" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5a2a7a" />
          <stop offset="45%" stop-color="#e2556b" />
          <stop offset="100%" stop-color="#ffaa4d" />
        </linearGradient>
        <radialGradient id="g-castle" cx="70%" cy="25%" r="90%">
          <stop offset="0%" stop-color="#4a2a7a" />
          <stop offset="60%" stop-color="#1f0f3d" />
          <stop offset="100%" stop-color="#0b0518" />
        </radialGradient>
        <linearGradient id="g-arcade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0d0026" />
          <stop offset="55%" stop-color="#3a0a6a" />
          <stop offset="100%" stop-color="#14002e" />
        </linearGradient>
        <linearGradient id="g-sun80s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffe14d" />
          <stop offset="100%" stop-color="#ff3d8b" />
        </linearGradient>
        <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="2" fill="#000" opacity="0.18" />
        </pattern>
        <linearGradient id="g-beach" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a8fd6" />
          <stop offset="70%" stop-color="#6cc6f0" />
          <stop offset="100%" stop-color="#a6e3ff" />
        </linearGradient>
        <radialGradient id="g-fire" cx="50%" cy="100%" r="80%">
          <stop offset="0%" stop-color="#ffe14d" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#ff7a2f" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="g-planet" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#ffb3d9" />
          <stop offset="100%" stop-color="#c2307a" />
        </radialGradient>
        <radialGradient id="g-planet2" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#9ff3ff" />
          <stop offset="100%" stop-color="#1f7fd1" />
        </radialGradient>
        <radialGradient id="g-circus" cx="50%" cy="35%" r="85%">
          <stop offset="0%" stop-color="#6a1f7a" />
          <stop offset="60%" stop-color="#34104f" />
          <stop offset="100%" stop-color="#170826" />
        </radialGradient>
        <linearGradient id="g-farm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3fa9f0" />
          <stop offset="60%" stop-color="#9adcff" />
          <stop offset="100%" stop-color="#d9f3ff" />
        </linearGradient>
        <linearGradient id="g-museum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4c3b7e" />
          <stop offset="60%" stop-color="#352a60" />
          <stop offset="100%" stop-color="#1b1236" />
        </linearGradient>
        <linearGradient id="g-plane" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a8fe8" />
          <stop offset="60%" stop-color="#8fd0ff" />
          <stop offset="100%" stop-color="#dff2ff" />
        </linearGradient>
        <linearGradient id="g-planewall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c9d4f2" />
          <stop offset="55%" stop-color="#8b9dd8" />
          <stop offset="80%" stop-color="#3d4a96" />
          <stop offset="100%" stop-color="#1f2a63" />
        </linearGradient>
        <linearGradient id="g-restaurant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5c2039" />
          <stop offset="60%" stop-color="#3b1530" />
          <stop offset="100%" stop-color="#1e0c1c" />
        </linearGradient>
        <pattern id="rest-check" width="160" height="160" patternUnits="userSpaceOnUse">
          <rect width="160" height="160" fill="#3b1a2c" />
          <rect width="80" height="80" fill="#2a1220" />
          <rect x="80" y="80" width="80" height="80" fill="#2a1220" />
        </pattern>
        <linearGradient id="g-dino" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff7059" />
          <stop offset="50%" stop-color="#ffaf6b" />
          <stop offset="100%" stop-color="#ffe4a2" />
        </linearGradient>
        <linearGradient id="g-pirate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff8a5c" />
          <stop offset="55%" stop-color="#ffc27a" />
          <stop offset="100%" stop-color="#ffe7b0" />
        </linearGradient>
        <linearGradient id="g-cinema" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a0f2e" />
          <stop offset="55%" stop-color="#1a0920" />
          <stop offset="100%" stop-color="#0d0412" />
        </linearGradient>
        <linearGradient id="g-stadium" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1b2b6b" />
          <stop offset="55%" stop-color="#3a4fb0" />
          <stop offset="100%" stop-color="#7f9be8" />
        </linearGradient>
        <linearGradient id="g-train" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4aa8e8" />
          <stop offset="55%" stop-color="#9fd8f5" />
          <stop offset="100%" stop-color="#e6f6ff" />
        </linearGradient>
        <linearGradient id="g-school" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffd36b" />
          <stop offset="55%" stop-color="#ffe7a8" />
          <stop offset="100%" stop-color="#fff4d6" />
        </linearGradient>
        <linearGradient id="g-candy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff8ccf" />
          <stop offset="55%" stop-color="#ffc2e6" />
          <stop offset="100%" stop-color="#fff0d6" />
        </linearGradient>
        <linearGradient id="g-lab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f2b33" />
          <stop offset="55%" stop-color="#174450" />
          <stop offset="100%" stop-color="#0b1f26" />
        </linearGradient>
        <linearGradient id="g-volcano" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a0f2e" />
          <stop offset="55%" stop-color="#8a2b2b" />
          <stop offset="100%" stop-color="#ff8a3d" />
        </linearGradient>
        <linearGradient id="g-market" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f4f7ff" />
          <stop offset="55%" stop-color="#e3ecff" />
          <stop offset="100%" stop-color="#c9d8ff" />
        </linearGradient>
        <linearGradient id="g-zoo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#47b6f5" />
          <stop offset="55%" stop-color="#a6e3ff" />
          <stop offset="100%" stop-color="#fff2c4" />
        </linearGradient>
        <linearGradient id="g-japan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffb3c7" />
          <stop offset="55%" stop-color="#ffd9c2" />
          <stop offset="100%" stop-color="#fff3df" />
        </linearGradient>
        <linearGradient id="g-fair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b1a7a" />
          <stop offset="55%" stop-color="#c2408f" />
          <stop offset="100%" stop-color="#ffa16b" />
        </linearGradient>
        <linearGradient id="g-egypt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3fa6e8" />
          <stop offset="55%" stop-color="#a8dcf5" />
          <stop offset="100%" stop-color="#ffe2a8" />
        </linearGradient>
        <linearGradient id="g-bowling" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#140a2e" />
          <stop offset="55%" stop-color="#2a1458" />
          <stop offset="100%" stop-color="#3d1f6e" />
        </linearGradient>
        <linearGradient id="g-forest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2d6b5e" />
          <stop offset="55%" stop-color="#8fcf9a" />
          <stop offset="100%" stop-color="#f6f0b8" />
        </linearGradient>
        <linearGradient id="g-future" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5aa8ea" />
          <stop offset="55%" stop-color="#bfe3ff" />
          <stop offset="100%" stop-color="#ffd9c2" />
        </linearGradient>
        <linearGradient id="g-mine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a1a4a" />
          <stop offset="55%" stop-color="#4a2d6b" />
          <stop offset="100%" stop-color="#c9884f" />
        </linearGradient>
        <linearGradient id="g-race" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a9cf0" />
          <stop offset="55%" stop-color="#9fd8ff" />
          <stop offset="100%" stop-color="#ffe9b0" />
        </linearGradient>
        <linearGradient id="g-mystery" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#120a36" />
          <stop offset="55%" stop-color="#2e2470" />
          <stop offset="100%" stop-color="#5b4a9e" />
        </linearGradient>
        <linearGradient id="g-pumpkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1c0f3d" />
          <stop offset="55%" stop-color="#4b2378" />
          <stop offset="100%" stop-color="#ff8a3d" />
        </linearGradient>
        <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7cc4ff" />
          <stop offset="55%" stop-color="#c9e8ff" />
          <stop offset="100%" stop-color="#ffe0ef" />
        </linearGradient>
        <linearGradient id="g-dacha" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5fb2f0" />
          <stop offset="55%" stop-color="#bfe6ff" />
          <stop offset="100%" stop-color="#fff1c2" />
        </linearGradient>
        <linearGradient id="g-wedding" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffc6d9" />
          <stop offset="55%" stop-color="#fff0f5" />
          <stop offset="100%" stop-color="#fffbea" />
        </linearGradient>
        <linearGradient id="g-karaoke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a0b3d" />
          <stop offset="55%" stop-color="#4a1580" />
          <stop offset="100%" stop-color="#ff4fa8" />
        </linearGradient>
        <linearGradient id="g-gym" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2b3a67" />
          <stop offset="55%" stop-color="#4f6bb0" />
          <stop offset="100%" stop-color="#9fd0ff" />
        </linearGradient>
        <linearGradient id="g-office" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8fc6ee" />
          <stop offset="55%" stop-color="#d8ecfa" />
          <stop offset="100%" stop-color="#f4f1e6" />
        </linearGradient>
        <linearGradient id="g-repair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fbeedb" />
          <stop offset="55%" stop-color="#f3dcbc" />
          <stop offset="100%" stop-color="#e6c79e" />
        </linearGradient>
        <linearGradient id="g-clinic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#cdeee4" />
          <stop offset="55%" stop-color="#e8f7f0" />
          <stop offset="100%" stop-color="#fdf5e4" />
        </linearGradient>
        <linearGradient id="g-commute" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7cc6f2" />
          <stop offset="55%" stop-color="#d4ecf8" />
          <stop offset="100%" stop-color="#ffe1bf" />
        </linearGradient>
        <linearGradient id="g-moving" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6cbcf4" />
          <stop offset="55%" stop-color="#c8ecff" />
          <stop offset="100%" stop-color="#fff2d2" />
        </linearGradient>
        <linearGradient id="g-feast" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a4a9a" />
          <stop offset="60%" stop-color="#b87ab8" />
          <stop offset="100%" stop-color="#ffb890" />
        </linearGradient>
        <linearGradient id="g-roadtrip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5aaef0" />
          <stop offset="55%" stop-color="#bfe8ff" />
          <stop offset="100%" stop-color="#ffe6b4" />
        </linearGradient>
        <linearGradient id="g-newyear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0d1a4a" />
          <stop offset="55%" stop-color="#24357a" />
          <stop offset="100%" stop-color="#5a3d8a" />
        </linearGradient>
        <linearGradient id="g-ski" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3d8ce0" />
          <stop offset="55%" stop-color="#8cc8f5" />
          <stop offset="100%" stop-color="#e9f6ff" />
        </linearGradient>
        <linearGradient id="g-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff4d6" stop-opacity="0" />
          <stop offset="60%" stop-color="#fff4d6" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#fff4d6" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="g-dino-rock" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stop-color="#f0a06a" />
          <stop offset="100%" stop-color="#d0744e" />
        </linearGradient>
        <linearGradient id="g-dino-volcano" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#a0634a" />
          <stop offset="55%" stop-color="#7a4636" />
          <stop offset="100%" stop-color="#58302a" />
        </linearGradient>
        <linearGradient id="g-dino-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a8d85a" />
          <stop offset="40%" stop-color="#7fbb45" />
        </linearGradient>
        <linearGradient id="g-dino-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5ae6a2" />
          <stop offset="100%" stop-color="#2fb877" />
        </linearGradient>
        <linearGradient id="g-dino-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2f6a32" />
          <stop offset="100%" stop-color="#173a1c" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" :fill="`url(#g-${theme})`" />
      <component :is="painting" v-bind="props.theme === 'lobby' || props.theme === 'final' ? { theme: props.theme } : {}" />
    </svg>
    <div class="light"></div>
  </div>
</template>
