<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import Avatar from '../../common/Avatar.vue';
import { computed } from 'vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'spy' || p?.kind === 'spyGuess' ? p : null;
});
const players = computed(() => (phase.value?.kind === 'spy' ? phase.value.options.map((id) => playerById(id)).filter((p) => p !== undefined) : []));
const spy = computed(() => (phase.value?.kind === 'spyGuess' ? playerById(phase.value.spy) : undefined));
</script>

<template>
  <div v-if="phase && view" class="spy">
    <div class="top">
      <div class="card sticker">
        <div class="label display"><Emoji char="🕵️" /> Шпион</div>
        <template v-if="phase.kind === 'spy'">
          <div class="text">Среди нас шпион. И шпиону неизвестно, где мы!</div>
          <div class="note">Задавайте друг другу вопросы по кругу вслух и голосуйте на телефоне, кто шпион</div>
        </template>
        <div v-else class="text">Шпиона вычислили! Получится ли угадать место?</div>
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div v-if="phase.kind === 'spy'" class="voters">
      <div class="hint ribbon">{{ phase.voted.length }} из {{ players.length }} проголосовали</div>
      <PlayerRow :code="view.code" :players="players" :done="phase.voted" :size="140" />
    </div>
    <div v-else class="guess">
      <div v-if="spy" class="caught">
        <Avatar :player="spy" :code="view.code" :size="200" :ring="8" />
        <Emoji class="hat" char="🕵️" :size="110" rim />
      </div>
      <div class="options">
        <span v-for="(o, i) in phase.options" :key="o" class="option plate" :style="{ animationDelay: `${0.3 + i * 0.1}s` }">{{ o }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spy {
  position: absolute;
  inset: 0;
  padding: 60px 90px 230px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 34px 44px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 8px;
  font-size: 58px;
  font-weight: 900;
  line-height: 1.12;
}

.note {
  margin-top: 12px;
  font-size: 26px;
  font-weight: 800;
  color: #6b5a99;
}

.voters {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.hint {
  font-size: 22px;
  color: #fff;
}

.guess {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
}

.caught {
  position: relative;
  animation: pop-in 500ms both;
}

.hat {
  position: absolute;
  top: -50px;
  right: -40px;
  rotate: 14deg;
}

.options {
  display: grid;
  grid-template-columns: repeat(2, minmax(300px, auto));
  gap: 16px;
}

.option {
  font-size: 32px;
  font-weight: 900;
  text-align: center;
  animation: pop-in 400ms both;
}
</style>
