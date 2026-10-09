<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import Confetti from '../../common/Confetti.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import InkView from '../../common/InkView.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'guessReveal' ? view.value.phase : null));
const artist = computed(() => playerById(phase.value?.artist));
const solved = computed(() =>
  (phase.value?.solved ?? []).map((id) => ({ player: playerById(id), gain: phase.value?.gains[id] ?? 0 })),
);

onMounted(() => audio.sfx(phase.value?.solved.length ? 'fanfare' : 'buzz'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="phase.solved.length" :delay="0.3" :x="0.25" />
    <div class="left">
      <div class="said display">Это было:</div>
      <div class="word display">{{ phase.word }}</div>
      <div v-if="artist" class="artist">
        <Avatar :player="artist" :code="view.code" :size="70" :ring="3" />
        <span>{{ phase.mime ? 'В роли крокодила' : 'Художник' }}: {{ artist.name }}</span>
        <b v-if="phase.gains[artist.id]" class="display">+{{ phase.gains[artist.id] }}</b>
      </div>
      <div class="solved">
        <div v-for="(s, i) in solved" :key="i" class="row" :style="{ animationDelay: `${0.3 + i * 0.15}s` }">
          <span class="place display">{{ i + 1 }}</span>
          <Avatar v-if="s.player" :player="s.player" :code="view.code" :size="50" :ring="3" />
          <span class="name">{{ s.player?.name }}</span>
          <b class="display">+{{ s.gain }}</b>
        </div>
        <div v-if="solved.length === 0" class="none">Никто не угадал <Emoji char="🙈" /></div>
      </div>
    </div>
    <div v-if="phase.mime" class="art stage-mime">
      <Avatar v-if="artist" :player="artist" :code="view.code" :size="300" :ring="10" />
      <Emoji char="🐊" :size="160" rim />
    </div>
    <div v-else class="art sticker">
      <InkView v-if="phase.ink" :code="view.code" :board="phase.board" :ink="phase.ink" :replay="3500" />
      <div v-else class="blank">Холст остался чистым</div>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 40px 70px 220px;
  display: flex;
  gap: 50px;
  align-items: center;
}

.left {
  width: 640px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.said {
  font-size: 30px;
  font-weight: 800;
  color: var(--muted);
}

.word {
  font-size: 84px;
  font-weight: 900;
  line-height: 1;
  color: var(--yellow);
  text-shadow: 0 6px 0 var(--ink);
  animation: pop-in 600ms both;
  overflow-wrap: anywhere;
}

.artist {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 26px;
  font-weight: 900;
}

.artist b,
.row b {
  color: var(--green);
  text-shadow: 0 3px 0 var(--ink);
}

.solved {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 24px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.place {
  width: 34px;
  text-align: center;
}

.name {
  flex: 1;
}

.none {
  font-size: 28px;
  font-weight: 900;
}

.art {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.stage-mime {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: visible;
}

.blank {
  aspect-ratio: 16 / 10;
  display: grid;
  place-items: center;
  font-size: 32px;
  font-weight: 900;
  color: #6b5a99;
}
</style>
