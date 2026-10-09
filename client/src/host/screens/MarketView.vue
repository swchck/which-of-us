<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import { computed } from 'vue';
import ChatRing from '../parts/ChatRing.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'market' || p?.kind === 'marketReveal' ? p : null;
});
const reveal = computed(() => (phase.value?.kind === 'marketReveal' ? phase.value : null));
const rows = computed(() => {
  const r = reveal.value;
  if (!r) return [];
  return r.solved
    .map((id) => ({ player: playerById(id), guess: r.guesses[id] ?? [], gain: r.gains[id] ?? 0 }))
    .filter((row) => row.player !== undefined);
});
const anyRight = computed(() => rows.value.some((r) => r.guess.every((g, k) => g === reveal.value?.truth[k])));
</script>

<template>
  <div v-if="phase && view" class="market">
    <Confetti v-if="anyRight" :delay="0.8" :y="0.3" />
    <div class="top">
      <div class="card sticker">
        <div class="label display"><Emoji char="🕵️" /> Рынок слухов</div>
        <div class="text">{{ phase.title }}</div>
        <div v-if="!reveal" class="note">Меняйтесь уликами в личке и назовите версию на телефоне — первые верные получают бонус</div>
      </div>
      <TimerRing v-if="phase.kind === 'market'" :deadline="phase.deadline" :size="170" />
    </div>

    <div class="board">
      <div v-for="(c, k) in phase.categories" :key="c.title" class="col sticker">
        <b class="cat display">{{ c.title }}?</b>
        <span
          v-for="(o, i) in c.options"
          :key="o"
          class="opt"
          :class="{ truth: reveal && reveal.truth[k] === i, wrong: reveal && reveal.truth[k] !== i }"
          :style="{ animationDelay: `${0.4 + k * 0.3}s` }"
        >
          {{ o }}
        </span>
      </div>
    </div>

    <div v-if="phase.kind === 'market'" class="room">
      <ChatRing :players="view.players.filter((p) => p.connected)" :code="view.code" :flights="phase.flights" :row="200">
        <template #badge="{ player }">
          <span v-if="phase.solved.includes(player.id)" class="solved">🔍 {{ phase.solved.indexOf(player.id) + 1 }}</span>
        </template>
      </ChatRing>
    </div>

    <div v-else-if="reveal" class="rows">
      <p v-if="rows.length === 0" class="nobody plate">Никто не назвал версию</p>
      <div v-for="(r, i) in rows" :key="r.player!.id" class="row sticker" :style="{ animationDelay: `${1.2 + i * 0.15}s` }">
        <Avatar :player="r.player!" :code="view.code" :size="54" :ring="3" />
        <span class="pname">{{ r.player!.name }}</span>
        <span v-for="(g, k) in r.guess" :key="k" class="chip" :class="{ ok: g === reveal.truth[k] }">{{ reveal.categories[k]?.options[g] }}</span>
        <b v-if="r.gain" class="gain">+{{ r.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.market {
  position: absolute;
  inset: 0;
  padding: 50px 90px 230px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 22px 36px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 28px;
  color: var(--pink);
}

.text {
  margin-top: 4px;
  font-size: 46px;
  font-weight: 900;
  line-height: 1.1;
}

.note {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 700;
  color: var(--muted);
}

.board {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.col {
  width: 330px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 18px;
}

.cat {
  font-size: 26px;
  color: var(--pink);
}

.opt {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 800;
}

.opt.truth {
  background: var(--green);
  color: #fff;
  animation: pop-in 400ms both;
}

.opt.wrong {
  opacity: 0.35;
  text-decoration: line-through;
}

.room {
  position: relative;
  flex: 1;
}

.room :deep(.ring) {
  top: 50%;
}

.solved {
  padding: 2px 10px;
  border-radius: 12px;
  background: var(--yellow);
  font-size: 20px;
  font-weight: 900;
}

.rows {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.row {
  width: 1200px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 18px;
  font-size: 22px;
  font-weight: 800;
  animation: pop-in 400ms both;
}

.pname {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip {
  padding: 2px 10px;
  border-radius: 10px;
  background: #ffd9d9;
}

.chip.ok {
  background: #c9f5cf;
}

.gain {
  font-size: 26px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.nobody {
  font-size: 30px;
  font-weight: 900;
}
</style>
