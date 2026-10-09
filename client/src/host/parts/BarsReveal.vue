<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import Confetti from '../../common/Confetti.vue';
import CountUp from '../../common/CountUp.vue';
import { onMounted } from 'vue';
import type { PublicPlayer } from '../../../../shared/protocol';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import { view } from '../store';

export interface BarRow {
  player: PublicPlayer;
  /** Bar length as a share of the longest, 0..1. */
  fill: number;
  label: string;
  /** Drawn before the label, e.g. a team badge. */
  icon?: string;
  gain: number;
  top: boolean;
}

defineProps<{ title: string; rows: BarRow[] }>();

onMounted(() => audio.sfx('fanfare'));
</script>

<template>
  <div v-if="view" class="reveal">
    <Confetti v-if="rows.some((r) => r.top)" :delay="0.6" :y="0.3" />
    <div class="title display"><span class="plate">{{ title }}</span></div>
    <div class="rows">
      <div v-for="(r, i) in rows" :key="r.player.id" class="row" :class="{ top: r.top }" :style="{ animationDelay: `${i * 0.12}s` }">
        <span class="crown"><Emoji v-if="r.top" char="👑" /></span>
        <Avatar :player="r.player" :code="view.code" :size="70" :ring="3" />
        <span class="name">{{ r.player.name }}</span>
        <span class="bar">
          <span class="fill" :style="{ width: `${r.fill * 100}%` }"></span>
          <span class="count display" :class="{ empty: r.fill === 0 }"><Emoji v-if="r.icon" :char="r.icon" /> {{ r.label }}</span>
        </span>
        <b class="gain display">+<CountUp :value="r.gain" :from="0" :delay="0.5 + i * 0.12" /></b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 50px 140px 230px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.title {
  text-align: center;
  font-size: 52px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow: 0 5px 0 var(--ink);
}

.rows {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.row {
  display: grid;
  grid-template-columns: 60px 80px 240px 1fr 120px;
  align-items: center;
  gap: 16px;
  animation: pop-in 450ms both;
}

.crown {
  font-size: 44px;
  text-align: center;
}

.name {
  font-size: 30px;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar {
  position: relative;
  height: 54px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: linear-gradient(90deg, #ffb81f, #ffd23f);
  border-right: 4px solid var(--ink);
  animation: grow 900ms cubic-bezier(0.2, 1, 0.3, 1) both;
  transform-origin: left;
}

.count {
  position: relative;
  line-height: 54px;
  padding-left: 16px;
  font-size: 26px;
  font-weight: 900;
  color: var(--ink);
}

.count.empty {
  color: var(--muted);
}

.gain {
  font-size: 30px;
  color: var(--green);
  text-shadow: 0 3px 0 var(--ink);
}

.top .name {
  color: var(--yellow);
}

@keyframes grow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>
