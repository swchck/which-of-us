<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'rush' || p?.kind === 'rushVote' || p?.kind === 'rushReveal' ? p : null;
});
const typers = computed(() => {
  const p = phase.value;
  if (p?.kind !== 'rush') return [];
  return (view.value?.players ?? []).filter((pl) => pl.connected).map((pl) => ({ player: pl, text: p.texts[pl.id] ?? '', done: p.done.includes(pl.id) }));
});
const replies = computed(() => {
  const p = phase.value;
  if (p?.kind === 'rushVote') return p.replies.map((r) => ({ ...r, player: playerById(r.player), votes: [] as string[], gain: 0 }));
  if (p?.kind === 'rushReveal') {
    return p.replies.map((r) => ({ ...r, player: playerById(r.player), gain: p.gains[r.player] ?? 0 }));
  }
  return [];
});
const top = computed(() => Math.max(1, ...replies.value.map((r) => r.votes.length)));
</script>

<template>
  <div v-if="phase && view" class="rush">
    <div class="top">
      <div class="incoming sticker">
        <div class="from display">{{ phase.from }}</div>
        <div class="text">{{ phase.message }}</div>
        <div v-if="phase.kind === 'rush'" class="note">Сообщение {{ phase.round }} из {{ phase.rounds }}. Стирать нельзя!</div>
        <div v-else-if="phase.kind === 'rushVote'" class="note">{{ phase.ask ? `${phase.ask} Голосуйте на телефонах` : 'Голосуйте за лучший ответ на телефонах' }}</div>
        <div v-else-if="phase.odd" class="note odd-q">Другой вопрос: {{ phase.odd.question }}</div>
      </div>
      <TimerRing v-if="phase.kind !== 'rushReveal'" :deadline="phase.deadline" :size="170" />
    </div>

    <div v-if="phase.kind === 'rush'" class="typing" :class="{ many: typers.length > 4 }">
      <div v-for="t in typers" :key="t.player.id" class="card sticker" :class="{ done: t.done }">
        <Avatar :player="t.player" :code="view.code" :size="64" :ring="3" />
        <div class="live">
          <small>{{ t.player.name }}</small>
          <span>{{ t.text }}<i v-if="!t.done" class="caret" /></span>
        </div>
        <Emoji v-if="t.done" char="✅" :size="40" />
      </div>
    </div>

    <div v-else class="replies">
      <div
        v-for="(r, i) in replies"
        :key="r.player?.id ?? i"
        class="reply sticker"
        :class="{
          win: phase.kind === 'rushReveal' && !phase.odd && r.votes.length === top,
          odd: phase.kind === 'rushReveal' && phase.odd?.player === r.player?.id,
        }"
        :style="{ animationDelay: `${0.15 + i * 0.1}s` }"
      >
        <Avatar v-if="r.player" :player="r.player" :code="view.code" :size="58" :ring="3" />
        <span class="t">{{ r.text }}</span>
        <span v-if="phase.kind === 'rushReveal'" class="voters">
          <Avatar v-for="v in r.votes" :key="v" :player="playerById(v)!" :code="view.code" :size="38" :ring="2" />
        </span>
        <span v-if="phase.kind === 'rushReveal' && phase.crowd?.pick === r.player?.id" class="fans display">❤ зрители · {{ phase.crowd?.votes }}</span>
        <b v-if="r.gain" class="gain">+{{ r.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fans {
  padding: 2px 12px;
  border-radius: 999px;
  background: var(--pink);
  color: #fff;
  font-size: 20px;
  white-space: nowrap;
}

.rush {
  position: absolute;
  inset: 0;
  /* full-width answer rows would run under the score rail on the right */
  padding: 50px 170px 230px 90px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.incoming {
  flex: 1;
  padding: 22px 36px;
  border-radius: 40px 40px 40px 10px;
  animation: pop-in 450ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.from {
  font-size: 30px;
  color: var(--pink);
}

.text {
  margin-top: 4px;
  font-size: 44px;
  font-weight: 900;
  line-height: 1.15;
}

.note {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 700;
  color: var(--muted);
}

.typing {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  align-content: start;
}

.typing.many {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 92px;
  padding: 10px 20px;
}

.card.done {
  background: #e9ffe9;
}

.live {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.live small {
  font-size: 18px;
  color: var(--muted);
}

.caret {
  display: inline-block;
  width: 3px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: var(--ink);
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.replies {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 22px;
  font-size: 28px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.reply .t {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.reply.win {
  background: var(--yellow);
}

.reply.odd {
  background: #ff9ec2;
  transform: rotate(-1.5deg) scale(1.03);
}

.odd-q {
  font-weight: 800;
}

.voters {
  display: flex;
  gap: 4px;
}

.gain {
  font-size: 28px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}
</style>
