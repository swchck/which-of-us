<script setup lang="ts">
import { computed } from 'vue';
import { MAFIA_ROLE_INFO } from '../../../../shared/catalog';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  switch (p?.kind) {
    case 'mafiaRoles':
    case 'mafiaNight':
    case 'mafiaDay':
    case 'mafiaVote':
    case 'mafiaExile':
    case 'mafiaEnd':
      return p;
    default:
      return null;
  }
});

const night = computed(() => phase.value?.kind === 'mafiaNight');
const deadline = computed(() => (phase.value && 'deadline' in phase.value ? phase.value.deadline : undefined));

const head = computed(() => {
  const p = phase.value;
  if (!p) return { icon: '', title: '', note: '' };
  switch (p.kind) {
    case 'mafiaRoles':
      return { icon: '😈', title: 'В деревне волки', note: 'Держите палец на карточке в телефоне, чтобы увидеть роль. Никому не показывайте!' };
    case 'mafiaNight':
      return { icon: '🌙', title: `Ночь ${p.night} из ${p.nights}`, note: 'Деревня спит. Каждый делает выбор на телефоне, молча' };
    case 'mafiaDay': {
      const victim = playerById(p.victim)?.name;
      const what = victim ? `Этой ночью волки утащили: ${victim}` : p.saved ? 'Доктор спас жертву волков!' : 'Ночь прошла спокойно';
      return { icon: '☀', title: `День ${p.day}`, note: `${what}. Спорьте вслух: кто волк?` };
    }
    case 'mafiaVote':
      return { icon: '🗳', title: 'Голосование', note: 'Кого изгоняем? Голосуйте на телефонах' };
    case 'mafiaExile': {
      const exiled = playerById(p.exiled)?.name;
      if (!exiled || !p.role) return { icon: '🤝', title: 'Никого не изгнали', note: 'Голоса разделились' };
      const role = MAFIA_ROLE_INFO[p.role];
      return { icon: role.icon, title: `${exiled} — ${role.title.toLowerCase()}`, note: p.role === 'wolf' ? 'Одним волком меньше!' : 'Волки довольны' };
    }
    case 'mafiaEnd':
      return p.winner === 'village'
        ? { icon: '🏡', title: 'Деревня победила!', note: 'Все волки изгнаны' }
        : { icon: '😈', title: 'Волки победили!', note: 'Деревня их так и не разглядела' };
  }
  return { icon: '', title: '', note: '' };
});

const villagers = computed(() => {
  const p = phase.value;
  if (!p || !view.value) return [];
  const roles = p.kind === 'mafiaEnd' ? p.roles : null;
  const done = p.kind === 'mafiaNight' ? p.done : p.kind === 'mafiaVote' ? p.voted : [];
  const votes = p.kind === 'mafiaExile' ? p.votes : [];
  const ids = roles ? Object.keys(roles) : view.value.players.map((pl) => pl.id);
  return ids
    .map((id) => playerById(id))
    .filter((pl) => pl !== undefined)
    .map((pl) => ({
      player: pl,
      alive: p.alive.includes(pl.id),
      done: done.includes(pl.id),
      role: roles?.[pl.id],
      against: votes.filter((v) => v.to === pl.id).length,
      gain: p.kind === 'mafiaEnd' ? p.gains[pl.id] : undefined,
    }));
});
</script>

<template>
  <div v-if="phase && view" class="mafia" :class="{ night }">
    <div class="top">
      <div class="card sticker">
        <div class="label display"><Emoji char="😈" /> Мафия-ТВ</div>
        <div class="title display"><Emoji :char="head.icon" /> {{ head.title }}</div>
        <div class="note">{{ head.note }}</div>
      </div>
      <TimerRing v-if="deadline" :deadline="deadline" :size="170" />
    </div>

    <div class="village">
      <div
        v-for="(v, i) in villagers"
        :key="v.player.id"
        class="house"
        :class="{ gone: !v.alive, done: v.done, wolf: v.role === 'wolf' }"
        :style="{ animationDelay: `${0.1 + i * 0.06}s` }"
      >
        <Avatar :player="v.player" :code="view.code" :size="120" :ring="5" />
        <span class="name">{{ v.player.name }}</span>
        <span v-if="v.role" class="role display"><Emoji :char="MAFIA_ROLE_INFO[v.role].icon" /> {{ MAFIA_ROLE_INFO[v.role].title }}</span>
        <span v-else-if="!v.alive" class="role display">вне игры</span>
        <span v-else-if="v.against" class="votes display">{{ v.against }} 🗳</span>
        <b v-if="v.gain" class="gain">+{{ v.gain }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mafia {
  position: absolute;
  inset: 0;
  padding: 50px 170px 230px 90px;
  display: flex;
  flex-direction: column;
  gap: 34px;
}

.mafia.night {
  background: rgba(10, 6, 40, 0.55);
}

.top {
  display: flex;
  gap: 40px;
  align-items: center;
}

.card {
  flex: 1;
  padding: 24px 40px;
  animation: pop-in 500ms both;
}

.label {
  font-size: 26px;
  color: var(--pink);
}

.title {
  font-size: 62px;
  line-height: 1.05;
}

.note {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 800;
}

.village {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  gap: 26px 34px;
}

.house {
  width: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #fff;
  text-shadow: 0 3px 0 var(--ink);
  animation: pop-in 400ms both;
}

.house.gone {
  opacity: 0.45;
  filter: grayscale(1);
}

.house.done :deep(.avatar) {
  box-shadow: 0 0 0 6px var(--green);
  border-radius: 50%;
}

.name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 26px;
  font-weight: 900;
}

.role,
.votes {
  font-size: 22px;
  white-space: nowrap;
}

.house.wolf .role {
  color: var(--pink);
}

.gain {
  font-size: 28px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
  text-shadow: none;
}
</style>
