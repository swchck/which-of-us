<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

/** Groups beyond this are lone answers, shown as a compact strip instead of columns. */
const COLUMNS = 4;

const phase = computed(() => (view.value?.phase.kind === 'herdReveal' ? view.value.phase : null));
const groups = computed(() =>
  (phase.value?.groups ?? []).map((g) => ({
    answer: g.answer,
    players: g.players.map((id) => playerById(id)).filter((p) => p !== undefined),
    gain: phase.value?.gains[g.players[0]!] ?? 0,
  })),
);
const herds = computed(() => groups.value.filter((g) => g.players.length > 1).slice(0, COLUMNS));
const strays = computed(() => groups.value.filter((g) => !herds.value.includes(g)));

onMounted(() => audio.sfx('drumroll'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="herds.length" :delay="1" :y="0.4" />
    <div class="prompt plate"><Emoji char="🐑" /> {{ phase.prompt }}</div>
    <div v-if="herds.length" class="herds">
      <div
        v-for="(g, i) in herds"
        :key="g.answer"
        class="herd"
        :class="{ top: i === 0 || g.players.length === herds[0]!.players.length }"
        :style="{ animationDelay: `${0.4 + i * 0.3}s` }"
      >
        <div class="answer display">{{ g.answer }}</div>
        <div class="count">{{ g.players.length }} <span v-if="g.gain">· +{{ g.gain }}</span></div>
        <div class="faces">
          <Avatar v-for="p in g.players" :key="p.id" :player="p" :code="view.code" :size="84" />
        </div>
      </div>
    </div>
    <div v-else class="empty display">Ни одного совпадения!</div>
    <div v-if="strays.length" class="strays">
      <span class="ghead">Своим путём:</span>
      <span v-for="g in strays" :key="g.answer" class="stray">
        <b>{{ g.players.map((p) => p.name).join(', ') }}</b> — {{ g.answer }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: absolute;
  inset: 0;
  padding: 50px 80px 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.prompt {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 46px;
  font-weight: 900;
  text-align: center;
  max-width: 1600px;
}

.herds {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 36px;
}

.herd {
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  border-radius: 30px;
  background: rgba(18, 6, 42, 0.6);
  animation: pop-in 500ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

.herd.top {
  background: rgba(255, 210, 63, 0.3);
  outline: 4px solid var(--yellow);
}

.answer {
  font-size: 44px;
  text-align: center;
  line-height: 1.1;
  hyphens: auto;
  overflow-wrap: break-word;
}

.count {
  font-size: 30px;
  font-weight: 900;
  color: var(--green);
}

.faces {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
}

.empty {
  flex: 1;
  display: grid;
  place-items: center;
  font-size: 64px;
}

.strays {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 28px;
  font-size: 28px;
  font-weight: 800;
  animation: pop-in 500ms 1.4s both;
}

.ghead {
  color: var(--muted);
}
</style>
