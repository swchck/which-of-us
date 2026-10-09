<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, watch } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import InkView from '../../common/InkView.vue';
import TimerRing from '../parts/TimerRing.vue';
import { liveInk, playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'guess' ? view.value.phase : null));
const artist = computed(() => playerById(phase.value?.artist));
/** hintOf() puts a space between letters, so every other character is a tile. */
const tiles = computed(() => [...(phase.value?.hint ?? '')].filter((_, i) => i % 2 === 0));
const guessers = computed(() => view.value?.players.filter((p) => p.connected && p.id !== phase.value?.artist) ?? []);
// the feed is a sliding window, so keys must not depend on position or every bubble re-animates
const feed = computed(() => {
  const seen = new Map<string, number>();
  return (phase.value?.feed ?? [])
    .map((f) => {
      const base = `${f.player}:${f.text}`;
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      return { ...f, key: `${base}:${n}`, player: playerById(f.player) };
    })
    .reverse();
});

watch(
  () => phase.value?.solved.length ?? 0,
  (n, prev) => {
    if (n > prev) audio.sfx('ding');
  },
);
watch(
  () => phase.value?.hint,
  (h, prev) => {
    if (prev && h !== prev) audio.sfx('whoosh');
  },
);
</script>

<template>
  <div v-if="phase && view && artist" class="guess">
    <div v-if="phase.mime" class="spot">
      <div class="beam"></div>
      <Avatar class="actor" :player="artist" :code="view.code" :size="320" :ring="10" />
      <Emoji class="croc" char="🐊" :size="180" rim />
      <div class="shh display">Ни слова, ни звука!</div>
    </div>
    <div v-else class="easel sticker">
      <InkView :code="view.code" :board="phase.board" :live="liveInk(artist.id)" />
    </div>

    <div class="side">
      <div class="head">
        <div class="artist sticker">
          <Avatar :player="artist" :code="view.code" :size="84" :ring="4" />
          <div>
            <div class="label display">{{ phase.mime ? 'Крокодил' : 'Нарисуй и угадай' }} · {{ phase.round + 1 }}/{{ phase.rounds }}</div>
            <div class="who">{{ phase.mime ? 'Показывает' : 'Рисует' }} {{ artist.name }}</div>
          </div>
        </div>
        <TimerRing :deadline="phase.deadline" :size="130" />
      </div>

      <div class="tiles">
        <span v-for="(ch, i) in tiles" :key="i" class="tile display" :class="{ gap: ch === ' ', open: ch !== '_' && ch !== ' ' }">
          {{ ch === '_' ? '' : ch }}
        </span>
      </div>

      <div class="players">
        <div v-for="p in guessers" :key="p.id" class="g" :class="{ solved: phase.solved.includes(p.id) }">
          <Avatar :player="p" :code="view.code" :size="58" :ring="3" />
          <span v-if="phase.solved.includes(p.id)" class="ok pop-in"><Icon name="check" /></span>
        </div>
      </div>

      <TransitionGroup name="feed" tag="div" class="feed">
        <div v-for="f in feed" :key="f.key" class="bubble">
          <Avatar v-if="f.player" :player="f.player" :code="view.code" :size="38" :ring="2" />
          <span>{{ f.text }}?</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.guess {
  position: absolute;
  inset: 0;
  padding: 36px 60px 220px;
  display: flex;
  gap: 36px;
}

.spot {
  flex: none;
  width: 1080px;
  height: 700px;
  position: relative;
  display: grid;
  place-items: center;
}

.beam {
  position: absolute;
  inset: -60px 120px 40px;
  background: radial-gradient(ellipse at 50% 100%, rgba(255, 244, 194, 0.55), transparent 65%);
  clip-path: polygon(40% 0, 60% 0, 100% 100%, 0 100%);
}

.actor {
  animation: sway 2.4s ease-in-out infinite;
}

.croc {
  position: absolute;
  right: 150px;
  bottom: 110px;
  rotate: 12deg;
}

.shh {
  position: absolute;
  bottom: 20px;
  font-size: 44px;
  color: var(--yellow);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

@keyframes sway {
  50% {
    rotate: 4deg;
    translate: 0 -10px;
  }
}

.easel {
  flex: none;
  width: 1080px;
  align-self: flex-start;
  padding: 0;
  overflow: hidden;
  transform: rotate(-0.6deg);
}

.side {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.head {
  display: flex;
  align-items: center;
  gap: 16px;
}

.artist {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
}

.label {
  font-size: 16px;
  font-weight: 800;
  color: var(--pink);
}

.who {
  font-size: 26px;
  font-weight: 900;
}

.tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tile {
  width: 52px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-size: 32px;
  font-weight: 900;
  box-shadow: 0 4px 0 var(--ink);
}

.tile.gap {
  visibility: hidden;
  width: 20px;
}

.tile.open {
  background: var(--yellow);
  animation: pop-in 500ms both;
}

.players {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.g {
  position: relative;
  opacity: 0.6;
  transition:
    opacity 300ms,
    transform 300ms;
}

.g.solved {
  opacity: 1;
  transform: translateY(-6px);
}

.ok {
  position: absolute;
  right: -8px;
  top: -8px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--green);
  border: 3px solid var(--ink);
  font-weight: 900;
}

.feed {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bubble {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px 6px 8px;
  border-radius: 999px;
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--ink);
  font-size: 22px;
  font-weight: 800;
  max-width: 100%;
}

.bubble span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: line-through;
  text-decoration-color: var(--red);
  text-decoration-thickness: 3px;
}

.feed-enter-active {
  animation: pop-in 350ms cubic-bezier(0.2, 0.9, 0.3, 1.3);
}

.feed-move {
  transition: transform 250ms;
}
</style>
