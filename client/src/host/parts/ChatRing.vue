<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { ChatFlight, PublicPlayer } from '../../../../shared/protocol';

const props = defineProps<{
  players: PublicPlayer[];
  code: string;
  flights: ChatFlight[];
  /** Sits in the middle, larger; letters to them fly inwards. */
  center?: PublicPlayer;
  radius?: { x: number; y: number };
  /** Seats everyone on one line this far apart instead of round an ellipse. */
  row?: number;
}>();

const ring = computed(() => props.players.filter((p) => p.id !== props.center?.id));
function spot(id: string): { x: number; y: number } {
  if (id === props.center?.id) return { x: 0, y: 0 };
  const i = ring.value.findIndex((p) => p.id === id);
  if (props.row) return { x: (i - (ring.value.length - 1) / 2) * props.row, y: 0 };
  const r = props.radius ?? { x: 640, y: 250 };
  const a = Math.PI + (i + 0.5) * ((Math.PI * 2) / Math.max(1, ring.value.length));
  return { x: Math.cos(a) * r.x, y: Math.sin(a) * r.y };
}

const letters = ref<{ id: number; from: { x: number; y: number }; to: { x: number; y: number } }[]>([]);
const timers: ReturnType<typeof setTimeout>[] = [];
let shown = 0;
watch(
  () => props.flights,
  (flights) => {
    for (const f of flights) {
      if (f.id <= shown) continue;
      shown = f.id;
      letters.value = [...letters.value, { id: f.id, from: spot(f.from), to: spot(f.to) }];
      timers.push(setTimeout(() => (letters.value = letters.value.filter((l) => l.id !== f.id)), 1300));
    }
  },
  { immediate: true, deep: true },
);
onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<template>
  <div class="ring">
    <div v-for="p in ring" :key="p.id" class="seat" :style="{ translate: `${spot(p.id).x}px ${spot(p.id).y}px` }">
      <Avatar :player="p" :code="code" :size="96" :ring="4" />
      <slot name="badge" :player="p" />
    </div>
    <div v-if="center" class="seat center">
      <Avatar :player="center" :code="code" :size="170" :ring="7" />
      <span class="cname plate">{{ center.name }}</span>
    </div>
    <span
      v-for="l in letters"
      :key="l.id"
      class="letter"
      :style="{ '--x0': `${l.from.x}px`, '--y0': `${l.from.y}px`, '--x1': `${l.to.x}px`, '--y1': `${l.to.y}px` }"
    >
      <Emoji char="💌" :size="54" />
    </span>
  </div>
</template>

<style scoped>
.ring {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 0;
  height: 0;
}

.seat {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.cname {
  font-size: 26px;
}

.letter {
  position: absolute;
  animation: fly 1.2s cubic-bezier(0.4, 0, 0.3, 1) both;
}

@keyframes fly {
  from {
    transform: translate(calc(var(--x0) - 50%), calc(var(--y0) - 50%)) scale(0.6);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  to {
    transform: translate(calc(var(--x1) - 50%), calc(var(--y1) - 50%)) scale(1);
    opacity: 0;
  }
}
</style>
