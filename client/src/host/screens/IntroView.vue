<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import { LOCATION_INFO, MODIFIER_INFO } from '../../../../shared/catalog';
import Avatar from '../../common/Avatar.vue';
import Bublik from '../Bublik.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'intro' ? view.value.phase : null));
const hero = computed(() => playerById(phase.value?.hero));
</script>

<template>
  <div v-if="phase" :key="phase.episode" class="intro">
    <div class="episode ribbon">Раунд {{ phase.episode + 1 }} из {{ phase.episodes }}</div>
    <div class="card sticker">
      <Emoji class="icon" :char="LOCATION_INFO[phase.location].icon" rim />
      <div>
        <span class="title display">{{ phase.title }}</span>
        <div class="theme hand">{{ LOCATION_INFO[phase.location].theme }}</div>
      </div>
    </div>
    <div v-if="phase.modifier" class="twist sticker">
      <Emoji :char="MODIFIER_INFO[phase.modifier].icon" :size="48" />
      <div>
        <b class="display">{{ MODIFIER_INFO[phase.modifier].title }}</b>
        <small>{{ MODIFIER_INFO[phase.modifier].note }}</small>
      </div>
    </div>
    <div v-if="hero && view" class="hero">
      <div class="spot"></div>
      <Avatar :player="hero" :code="view.code" :size="200" />
      <div class="hname display">{{ hero.name }}</div>
      <div class="hnote">Весь раунд — вопросы про эту звезду</div>
    </div>
    <Bublik class="mascot" :size="300" />
  </div>
</template>

<style scoped>
.twist {
  position: absolute;
  top: 40px;
  right: 60px;
  max-width: 560px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 26px;
  background: var(--yellow);
  rotate: -2deg;
  animation: pop-in 500ms 600ms both;
}

.twist b {
  display: block;
  font-size: 38px;
}

.twist small {
  font-size: 22px;
  font-weight: 800;
}

.intro {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding-bottom: 200px;
}

.episode {
  font-size: 34px;
  animation: pop-in 500ms both;
}

.card {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 36px 60px;
  transform: rotate(-2deg);
  animation: drop 900ms cubic-bezier(0.2, 1.4, 0.4, 1) 200ms both;
}

.icon {
  font-size: 110px;
}

.theme {
  margin-top: 6px;
  font-size: 34px;
  color: #5b4a8a;
  animation: pop-in 400ms 900ms both;
}

.title {
  font-size: 92px;
  font-weight: 900;
  line-height: 1;
}

.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: pop-in 700ms cubic-bezier(0.2, 1.4, 0.4, 1) 900ms both;
}

.spot {
  position: absolute;
  top: -40px;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 245, 155, 0.55), transparent 70%);
  animation: glow 1.6s ease-in-out infinite alternate;
}

.hname {
  position: relative;
  font-size: 54px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow: 0 5px 0 var(--ink);
}

.hnote {
  position: relative;
  font-size: 26px;
  font-weight: 800;
}

@keyframes glow {
  from {
    opacity: 0.5;
    scale: 0.9;
  }
  to {
    opacity: 1;
    scale: 1.05;
  }
}

.mascot {
  position: absolute;
  right: 120px;
  bottom: 220px;
  animation: pop-in 600ms 700ms both;
}

@keyframes drop {
  from {
    transform: translateY(-900px) rotate(-14deg);
  }
  to {
    transform: translateY(0) rotate(-2deg);
  }
}
</style>
