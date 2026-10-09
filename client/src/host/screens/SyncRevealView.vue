<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Confetti from '../../common/Confetti.vue';
import { computed, onMounted } from 'vue';
import { audio } from '../../common/audio';
import { playerById, view } from '../store';

const COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--green)'];

const phase = computed(() => (view.value?.phase.kind === 'syncReveal' ? view.value.phase : null));
const groups = computed(() =>
  (phase.value?.groups ?? []).map((ids) => {
    const members = ids
      .map((id) => ({ player: playerById(id), pick: phase.value?.picks[id], gain: phase.value?.gains[id] ?? 0 }))
      .filter((m) => m.player !== undefined);
    return { members, matched: members.some((m) => m.gain > 0) };
  }),
);
const anyMatch = computed(() => groups.value.some((g) => g.matched));

onMounted(() => audio.sfx('drumroll'));
</script>

<template>
  <div v-if="phase && view" class="reveal">
    <Confetti v-if="anyMatch" :delay="1.2" :y="0.45" />
    <div class="question plate">{{ phase.question }}</div>
    <div class="groups">
      <div
        v-for="(g, i) in groups"
        :key="i"
        class="group"
        :class="{ matched: g.matched }"
        :style="{ animationDelay: `${0.4 + i * 0.25}s` }"
      >
        <div v-for="m in g.members" :key="m.player!.id" class="member">
          <Avatar :player="m.player!" :code="view.code" :size="110" />
          <span class="name">{{ m.player!.name }}</span>
          <span v-if="m.pick !== undefined" class="pick" :style="{ background: COLORS[m.pick] }">{{ phase.options[m.pick] }}</span>
          <span v-else class="pick none">молчание</span>
          <b v-if="m.gain" class="gain">+{{ m.gain }}</b>
        </div>
      </div>
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
  gap: 36px;
}

.question {
  font-size: 46px;
  font-weight: 900;
  text-align: center;
  max-width: 1600px;
}

.groups {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  gap: 30px 44px;
}

.group {
  display: flex;
  gap: 24px;
  padding: 22px 28px;
  border-radius: 30px;
  background: rgba(18, 6, 42, 0.6);
  border: 4px solid transparent;
  animation: pop-in 500ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

.group.matched {
  background: rgba(46, 212, 122, 0.28);
  border-color: var(--green);
}

.member {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 170px;
}

.name {
  font-size: 26px;
  font-weight: 900;
}

.pick {
  max-width: 230px;
  padding: 6px 14px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  color: var(--ink);
  font-size: 22px;
  font-weight: 900;
  text-align: center;
}

.pick.none {
  background: rgba(255, 255, 255, 0.2);
  color: var(--muted);
  border-style: dashed;
}

.gain {
  font-size: 28px;
  color: var(--green);
}
</style>
