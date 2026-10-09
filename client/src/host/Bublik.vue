<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue';
import { audio } from '../common/audio';

const props = withDefaults(defineProps<{ size?: number; mood?: 'happy' | 'wow' }>(), { size: 260, mood: 'happy' });

// two Bubliks can share a page, and SVG gradient ids are document-wide
const uid = useId();
const mouth = ref(0);
const blink = ref(false);
let mouthTimer: ReturnType<typeof setInterval> | undefined;
let blinkTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleBlink(): void {
  blinkTimer = setTimeout(
    () => {
      blink.value = true;
      setTimeout(() => (blink.value = false), 140);
      scheduleBlink();
    },
    2000 + Math.random() * 3500,
  );
}

onMounted(() => {
  // speechSynthesis gives no amplitude, so the mouth flaps on a jittered rhythm instead
  mouthTimer = setInterval(() => {
    mouth.value = audio.speaking.value ? 0.25 + Math.random() * 0.75 : 0;
  }, 110);
  scheduleBlink();
});

onBeforeUnmount(() => {
  clearInterval(mouthTimer);
  clearTimeout(blinkTimer);
});

const mouthPath = computed(() => {
  const open = props.mood === 'wow' ? 0.9 : mouth.value;
  const h = 10 + open * 38;
  return `M-34 58 Q0 ${58 + h * 1.6} 34 58 Q0 ${58 + h * 0.3} -34 58 Z`;
});

const SPRINKLES = [
  { x: -95, y: -62, r: 20, c: '#22d3ee' },
  { x: -52, y: -95, r: -35, c: '#ffd23f' },
  { x: 8, y: -102, r: 70, c: '#2ed47a' },
  { x: 62, y: -88, r: 15, c: '#ffffff' },
  { x: 102, y: -50, r: -50, c: '#22d3ee' },
  { x: -118, y: -18, r: 80, c: '#ffffff' },
  { x: 118, y: -8, r: 40, c: '#ffd23f' },
  { x: -70, y: -30, r: -10, c: '#a66bff' },
  { x: 75, y: -30, r: 60, c: '#2ed47a' },
];
</script>

<template>
  <div class="bublik" :class="{ talking: audio.speaking.value }" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="-170 -170 340 340" :width="size" :height="size">
      <defs>
        <radialGradient :id="`${uid}d`" cx="38%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#ffd99a" />
          <stop offset="55%" stop-color="#f2a94e" />
          <stop offset="100%" stop-color="#c8742a" />
        </radialGradient>
        <linearGradient :id="`${uid}g`" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stop-color="#ffa6dc" />
          <stop offset="100%" stop-color="#ff4fa8" />
        </linearGradient>
        <radialGradient :id="`${uid}h`" cx="50%" cy="70%" r="70%">
          <stop offset="0%" stop-color="#12062e" />
          <stop offset="100%" stop-color="#3d1f7a" />
        </radialGradient>
        <radialGradient :id="`${uid}c`">
          <stop offset="0%" stop-color="#ff4f8b" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#ff4f8b" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="160" rx="120" ry="14" fill="#0c0420" opacity="0.35" />
      <g class="body">
        <g class="arm-l">
          <path d="M-128 60 Q-168 74 -168 34" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
          <circle cx="-168" cy="26" r="20" fill="#fff" stroke="#1b1033" stroke-width="8" />
        </g>
        <g class="arm-r">
          <path d="M136 52 Q178 24 166 -22" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
          <circle cx="164" cy="-34" r="20" fill="#fff" stroke="#1b1033" stroke-width="8" />
          <path d="M152 -46 L148 -60 M164 -52 L164 -68 M176 -46 L181 -60" stroke="#1b1033" stroke-width="6" stroke-linecap="round" />
        </g>
        <ellipse cx="0" cy="10" rx="150" ry="138" :fill="`url(#${uid}d)`" stroke="#1b1033" stroke-width="10" />
        <path d="M-118 96 Q0 160 118 96" stroke="#ffe7bd" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.55" />
        <path
          d="M-140 4 Q-136 30 -112 22 Q-98 50 -76 26 Q-56 50 -32 26 Q-8 54 18 26 Q44 50 64 26 Q86 48 102 22 Q126 36 140 4"
          stroke="#b8651f"
          stroke-width="12"
          fill="none"
          opacity="0.45"
          stroke-linecap="round"
        />
        <path
          d="M-146 -10 Q-150 -128 0 -130 Q150 -128 146 -10 Q140 18 118 6 Q104 34 84 10 Q64 32 40 8 Q16 36 -10 8 Q-36 34 -58 8 Q-82 32 -100 6 Q-124 26 -146 -10 Z"
          :fill="`url(#${uid}g)`"
          stroke="#1b1033"
          stroke-width="10"
          stroke-linejoin="round"
        />
        <path d="M-118 -52 Q-112 -104 -46 -114" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.6" />
        <circle cx="-122" cy="-30" r="6" fill="#fff" opacity="0.6" />
        <ellipse cx="0" cy="-62" rx="48" ry="26" :fill="`url(#${uid}h)`" stroke="#1b1033" stroke-width="10" />
        <rect
          v-for="(s, i) in SPRINKLES"
          :key="i"
          :x="s.x - 11"
          :y="s.y - 4"
          width="22"
          height="8"
          rx="4"
          :fill="s.c"
          stroke="#1b1033"
          stroke-width="2.5"
          :transform="`rotate(${s.r} ${s.x} ${s.y})`"
        />
        <g class="eyes" :class="{ blink }">
          <ellipse cx="-46" cy="22" rx="18" :ry="mood === 'wow' ? 25 : 21" fill="#1b1033" />
          <ellipse cx="46" cy="22" rx="18" :ry="mood === 'wow' ? 25 : 21" fill="#1b1033" />
          <circle cx="-39" cy="13" r="7" fill="#fff" />
          <circle cx="53" cy="13" r="7" fill="#fff" />
          <circle cx="-51" cy="32" r="3" fill="#fff" opacity="0.8" />
          <circle cx="41" cy="32" r="3" fill="#fff" opacity="0.8" />
        </g>
        <ellipse cx="-88" cy="58" rx="26" ry="15" :fill="`url(#${uid}c)`" />
        <ellipse cx="88" cy="58" rx="26" ry="15" :fill="`url(#${uid}c)`" />
        <path :d="mouthPath" fill="#5a1030" stroke="#1b1033" stroke-width="6" stroke-linejoin="round" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.bublik {
  position: relative;
}

svg {
  overflow: visible;
  display: block;
}

.body {
  animation: bounce 1.6s ease-in-out infinite;
  transform-origin: 0 150px;
}

.talking .body {
  animation-duration: 0.7s;
}

.eyes {
  transform-origin: 0 22px;
  transition: transform 60ms;
}

.eyes.blink {
  transform: scaleY(0.1);
}

.arm-r {
  animation: wave 1.2s ease-in-out infinite;
  transform-origin: 136px 52px;
}

.arm-l {
  animation: wave-l 2.4s ease-in-out infinite;
  transform-origin: -128px 60px;
}

@keyframes wave-l {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0) scale(1, 1);
  }
  50% {
    transform: translateY(-8px) scale(0.98, 1.02);
  }
}

@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-22deg);
  }
}
</style>
