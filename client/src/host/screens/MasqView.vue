<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import { MASKS } from '../../../../shared/protocol';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'masq' || p?.kind === 'masqGuess' ? p : null;
});
const masks = computed(() => MASKS.slice(0, phase.value?.masks ?? 0));
const guessers = computed(() => (view.value?.players ?? []).filter((p) => p.connected));
</script>

<template>
  <div v-if="phase && view" class="masq">
    <div class="top">
      <div class="card sticker">
        <div class="label display"><Emoji char="🎭" /> Маскарад</div>
        <template v-if="phase.kind === 'masq'">
          <Transition name="topic" mode="out-in">
            <div :key="phase.prompt" class="text">{{ phase.prompt }}</div>
          </Transition>
          <div class="note">Отвечайте в общем чате на телефоне. Под маской вас никто не узнает — или узнает?</div>
        </template>
        <template v-else>
          <div class="text">Кто под какой маской?</div>
          <div class="note">Распределите игроков по маскам на телефонах</div>
        </template>
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>

    <div v-if="phase.kind === 'masq'" class="feed">
      <p v-if="phase.feed.length === 0" class="empty plate">Маски надеты. Кто начнёт разговор?</p>
      <TransitionGroup name="msg" tag="div" class="list">
        <div v-for="m in phase.feed" :key="m.id" class="msg">
          <span class="who"><Emoji :char="MASKS[m.mask]?.icon ?? '🎭'" :size="56" /></span>
          <div class="bubble sticker">
            <small>{{ MASKS[m.mask]?.name }}</small>
            {{ m.text }}
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div v-else class="guess">
      <div class="masks">
        <Emoji v-for="(m, i) in masks" :key="m.name" :char="m.icon" :size="96" class="float" :style="{ animationDelay: `${i * -0.4}s` }" />
      </div>
      <PlayerRow :code="view.code" :players="guessers" :done="phase.voted" :size="120" />
    </div>
  </div>
</template>

<style scoped>
.masq {
  position: absolute;
  inset: 0;
  padding: 60px 90px 230px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 26px 40px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 6px;
  font-size: 50px;
  font-weight: 900;
  line-height: 1.1;
}

.note {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--muted);
}

.topic-enter-active,
.topic-leave-active {
  transition:
    opacity 300ms,
    translate 300ms;
}

.topic-enter-from {
  opacity: 0;
  translate: 0 20px;
}

.topic-leave-to {
  opacity: 0;
  translate: 0 -20px;
}

.feed {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.empty {
  align-self: center;
  margin: auto 0;
  font-size: 34px;
  font-weight: 900;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg {
  display: flex;
  align-items: center;
  gap: 14px;
}

.bubble {
  max-width: 1300px;
  padding: 10px 22px;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
}

.bubble small {
  display: block;
  font-size: 18px;
  color: var(--pink);
}

.msg-enter-active {
  transition:
    opacity 350ms,
    translate 350ms cubic-bezier(0.2, 1.4, 0.4, 1);
}

.msg-enter-from {
  opacity: 0;
  translate: -40px 0;
}

.msg-leave-active {
  display: none;
}

.msg-move {
  transition: translate 300ms;
}

.guess {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.masks {
  display: flex;
  gap: 26px;
}

.float {
  animation: bob 2.4s ease-in-out infinite;
}

@keyframes bob {
  50% {
    translate: 0 -14px;
  }
}
</style>
