<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import WordsIn from '../../common/WordsIn.vue';
import { computed } from 'vue';
import PlayerRow from '../parts/PlayerRow.vue';
import TimerRing from '../parts/TimerRing.vue';
import { glyphs } from '../../common/emoji';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'vote' ? view.value.phase : null));
// duelists sit their own duel out, so they are not counted among the voters
const voters = computed(
  () => view.value?.players.filter((p) => p.connected && !(phase.value?.duel && phase.value.options.includes(p.id))) ?? [],
);
// the author sits the vote out, so per-player ticks would leave exactly one face unticked: theirs
const secretAuthor = computed(() => Boolean(phase.value?.quote || phase.value?.emoji));
const expected = computed(() => voters.value.length - (secretAuthor.value ? 1 : 0));
const label = computed(() => {
  const p = phase.value;
  if (p?.duel) return { icon: '⚔️', text: 'Дуэль' };
  if (p?.emoji) return { icon: '😜', text: 'Про кого эти эмодзи?' };
  if (p?.quote) return { icon: '✍️', text: 'Кто это написал?' };
  if (p?.custom) return { icon: '💌', text: 'Вопрос от компании' };
  return { icon: '', text: p?.scoring === 'received' ? 'Голосование' : 'Кто из нас?' };
});
const candidates = computed(() => phase.value?.options.map((id) => playerById(id)).filter((p) => p !== undefined) ?? []);
</script>

<template>
  <div v-if="phase && view" class="vote">
    <div class="top">
      <div :key="phase.question" class="question sticker">
        <div class="label display">
          <Emoji v-if="label.icon" :char="label.icon" />
          {{ label.text }}
          <span v-if="phase.bonus" class="bonus">×2 очка</span>
        </div>
        <div v-if="phase.emoji" class="text emoji pop-in"><Emoji v-for="(g, i) in glyphs(phase.question)" :key="i" :char="g" /></div>
        <WordsIn v-else class="text" :class="{ quote: phase.quote }" :text="phase.question" />
      </div>
      <TimerRing :deadline="phase.deadline" :size="170" />
    </div>
    <div v-if="phase.duel" class="faceoff">
      <template v-for="(p, i) in candidates" :key="p.id">
        <span v-if="i > 0" class="vs display">VS</span>
        <div class="duelist" :class="i === 0 ? 'left' : 'right'">
          <Avatar :player="p" :code="view.code" :size="190" />
          <span class="name display">{{ p.name }}</span>
        </div>
      </template>
    </div>
    <PlayerRow v-else-if="phase.scoring === 'received'" class="cands" :code="view.code" :players="candidates" :size="130" />
    <div class="voters">
      <div class="hint ribbon">{{ phase.answered.length }} из {{ expected }} проголосовали</div>
      <PlayerRow :code="view.code" :players="voters" :done="secretAuthor ? [] : phase.answered" :size="phase.scoring === 'received' ? 80 : 150" />
    </div>
  </div>
</template>

<style scoped>
.vote {
  position: absolute;
  inset: 0;
  padding: 60px 90px 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.question {
  flex: 1;
  padding: 34px 44px;
  animation: pop-in 500ms both;
}

.label {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 28px;
  color: var(--pink);
  font-weight: 800;
}

.bonus {
  background: var(--pink);
  color: #fff;
  padding: 4px 14px;
  border-radius: 12px;
  border: 3px solid var(--ink);
  font-size: 22px;
  animation: wobble 0.8s ease-in-out infinite;
}

.text {
  margin-top: 8px;
  font-size: 62px;
  font-weight: 900;
  line-height: 1.12;
}

.text.emoji {
  display: flex;
  gap: 24px;
  font-size: 120px;
}

.text.quote {
  font-style: italic;
}

.faceoff {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 70px;
  margin-top: 30px;
}

.duelist {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.duelist.left {
  animation: slide-left 600ms cubic-bezier(0.2, 1.3, 0.4, 1) both;
}

.duelist.right {
  animation: slide-right 600ms cubic-bezier(0.2, 1.3, 0.4, 1) both;
}

.duelist .name {
  font-size: 36px;
}

.vs {
  font-size: 96px;
  color: var(--yellow);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
  rotate: -8deg;
  animation: pop-in 500ms 450ms cubic-bezier(0.2, 1.6, 0.4, 1) both;
}

@keyframes slide-left {
  from {
    translate: -320px 0;
    opacity: 0;
  }
}

@keyframes slide-right {
  from {
    translate: 320px 0;
    opacity: 0;
  }
}

.voters {
  flex: 1;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.hint {
  font-size: 22px;
  color: #fff;
}
</style>
