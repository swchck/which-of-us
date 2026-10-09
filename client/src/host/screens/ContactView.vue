<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'contactWrite' || p?.kind === 'contactGuess' || p?.kind === 'contactReveal' ? p : null;
});
const leader = computed(() => playerById(phase.value?.leader));
const players = computed(() => view.value?.players.filter((p) => p.connected && p.id !== phase.value?.leader) ?? []);
const deadline = computed(() => (phase.value && phase.value.kind !== 'contactReveal' ? phase.value.deadline : undefined));
const hints = computed(() => {
  const p = phase.value;
  if (p?.kind === 'contactReveal') return p.hints.map((h) => ({ id: h.id, text: h.text, shown: h }));
  return p?.kind === 'contactGuess' ? p.hints.map((h) => ({ id: h.id, text: h.text, shown: undefined })) : [];
});
const note = computed(() => {
  const p = phase.value;
  if (!p) return '';
  if (p.kind === 'contactWrite') return 'Загадайте слово на эти буквы и напишите к нему подсказку';
  if (p.kind === 'contactGuess') return 'Угадайте чужое слово по подсказке, пока ведущий не перебил!';
  if (p.word) return `Загаданное слово — «${p.word}»`;
  return p.opened ? 'Контакт! Открывается новая буква' : 'Контакта нет, буква остаётся закрытой';
});
</script>

<template>
  <div v-if="phase && view" class="contact">
    <div class="top">
      <div class="card sticker">
        <div class="label display"><Emoji char="🤝" /> Контакт<template v-if="phase.kind === 'contactWrite'"> · заход {{ phase.step }} из {{ phase.steps }}</template></div>
        <div class="prefix display">{{ phase.kind === 'contactReveal' && phase.word ? phase.word.toUpperCase() : `${phase.prefix}…` }}</div>
        <div class="note">{{ note }}</div>
      </div>
      <div class="leader">
        <Avatar v-if="leader" :player="leader" :code="view.code" :size="120" :ring="5" />
        <span>ведущий</span>
      </div>
      <TimerRing v-if="deadline" :deadline="deadline" :size="150" />
    </div>

    <PlayerRow v-if="phase.kind === 'contactWrite'" :code="view.code" :players="players" :done="phase.done" :size="90" />
    <div v-else class="hints">
      <div
        v-for="(h, i) in hints"
        :key="h.id"
        class="hint sticker"
        :class="{ through: h.shown && h.shown.contacts.length > 0 && !h.shown.blocked, blocked: h.shown?.blocked }"
        :style="{ animationDelay: `${i * 0.08}s` }"
      >
        <span class="text">«{{ h.text }}»</span>
        <template v-if="h.shown">
          <span class="word display">{{ h.shown.word }}</span>
          <span class="who">
            <Avatar v-if="playerById(h.shown.author)" :player="playerById(h.shown.author)!" :code="view.code" :size="40" :ring="2" />
            <template v-if="h.shown.contacts.length">
              🤝
              <Avatar v-for="c in h.shown.contacts" :key="c" :player="playerById(c)!" :code="view.code" :size="40" :ring="2" />
            </template>
            <span v-if="h.shown.blocked" class="tag display">перебит</span>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact {
  position: absolute;
  inset: 0;
  padding: 40px 120px 230px 90px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top {
  display: flex;
  gap: 30px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 22px 36px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 26px;
  color: var(--pink);
}

.prefix {
  font-size: 84px;
  letter-spacing: 0.08em;
  line-height: 1.05;
}

.note {
  font-size: 26px;
  font-weight: 800;
}

.leader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 3px 0 var(--ink);
}

.hints {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 22px;
  font-size: 28px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.hint .text {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.hint.through {
  background: var(--green);
}

.hint.blocked {
  background: #e7e0f5;
}

.word {
  font-size: 30px;
  color: var(--pink);
}

.who {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag {
  font-size: 20px;
  color: var(--red);
}
</style>
