<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import Confetti from '../../common/Confetti.vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { audio } from '../../common/audio';
import Avatar from '../../common/Avatar.vue';
import Bublik from '../Bublik.vue';
import ItemCard from '../parts/ItemCard.vue';
import { teamTotals } from '../../common/teams';
import { playerById, send, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'final' ? view.value.phase : null));
const teams = computed(() => teamTotals(view.value?.players ?? []));

const podium = computed(() => {
  const rows = phase.value?.rows ?? [];
  const top = rows.slice(0, 3).map((r) => ({ ...r, player: playerById(r.player) }));
  return [top[1], top[0], top[2]].filter((r) => r !== undefined && r.player !== undefined);
});
const rest = computed(() =>
  (phase.value?.rows ?? []).slice(3).map((r) => ({ ...r, player: playerById(r.player) })),
);

type Slide = { kind: 'awards' } | { kind: 'evening' } | { kind: 'art'; index: number } | { kind: 'moment'; index: number };
const slide = ref(0);
const slides = computed<Slide[]>(() => {
  const list: Slide[] = [];
  if (phase.value?.awards.length) list.push({ kind: 'awards' });
  if ((phase.value?.evening.games ?? 0) > 1) list.push({ kind: 'evening' });
  const art = phase.value?.gallery ?? [];
  const moments = phase.value?.moments ?? [];
  // drawings and lines take turns, so the slideshow never runs a long stretch of one kind
  for (let i = 0; i < Math.max(art.length, moments.length); i++) {
    if (i < art.length) list.push({ kind: 'art', index: i });
    if (i < moments.length) list.push({ kind: 'moment', index: i });
  }
  return list;
});
const current = computed(() => slides.value[slide.value % Math.max(1, slides.value.length)]);
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  audio.sfx('fanfare');
  timer = setInterval(() => (slide.value += 1), 7000);
});
onBeforeUnmount(() => clearInterval(timer));

function gamesWord(n: number): string {
  const tens = n % 100;
  const ones = n % 10;
  if (tens >= 11 && tens <= 14) return 'партий';
  if (ones === 1) return 'партия';
  return ones >= 2 && ones <= 4 ? 'партии' : 'партий';
}

const HEIGHTS = [340, 260, 200];
const MEDALS = ['🥇', '🥈', '🥉'];
</script>

<template>
  <div v-if="phase && view" class="final">
    <Confetti :delay="1.3" :count="240" :x="0.27" :y="0.45" />
    <div class="left">
      <div class="title display">Итоги</div>
      <div v-if="teams.length" class="teams sticker">
        <template v-if="teams.length === 1">
          <Emoji char="🤝" :size="56" />
          <span>Вместе: <b>{{ teams[0]!.score }}</b> очков<small v-if="phase.coop?.asked"> · ответили одинаково {{ phase.coop.matched }} из {{ phase.coop.asked }}</small></span>
        </template>
        <template v-else>
          <Emoji :char="teams[0]!.icon" :size="56" />
          <span><template v-if="teams[0]!.score > teams[1]!.score">Победа команды «{{ teams[0]!.title }}»</template><template v-else>Ничья команд</template>: <b>{{ teams[0]!.score }}</b> — {{ teams[1]!.score }}</span>
        </template>
      </div>
      <div class="podium">
        <div v-for="(r, i) in podium" :key="r!.player!.id" class="step" :style="{ animationDelay: `${[0.6, 1.2, 0.2][i]}s` }">
          <div class="medal"><Emoji :char="MEDALS[r!.place - 1] ?? '🎉'" rim /></div>
          <Avatar :player="r!.player!" :code="view.code" :size="r!.place === 1 ? 150 : 115" />
          <div class="pname" :style="{ '--len': r!.player!.name.length }">{{ r!.player!.name }}</div>
          <div class="block display" :class="{ gold: r!.place === 1 }" :style="{ height: `${HEIGHTS[r!.place - 1] ?? 160}px` }">
            <span>{{ r!.place }}</span>
            <small>{{ r!.score }}</small>
          </div>
        </div>
      </div>
      <div v-if="rest.length" class="rest">
        <div v-for="r in rest" :key="r.player?.id" class="rrow">
          <span class="display">{{ r.place }}.</span>
          <span>{{ r.player?.name }}</span>
          <b>{{ r.score }}</b>
        </div>
      </div>
    </div>

    <div class="right">
      <div v-if="current?.kind === 'awards'" key="awards" class="awards">
        <div class="atitle display">Награды</div>
        <div v-for="(a, i) in phase.awards.slice(0, 7)" :key="i" class="award sticker" :style="{ animationDelay: `${i * 0.15}s` }">
          <Avatar v-if="playerById(a.player)" :player="playerById(a.player)!" :code="view.code" :size="62" :ring="3" />
          <div>
            <div class="aname display">{{ a.title }} — {{ playerById(a.player)?.name }}</div>
            <div class="adetail">{{ a.detail }}</div>
          </div>
        </div>
      </div>
      <div v-else-if="current?.kind === 'evening'" key="evening" class="awards">
        <div class="atitle display">За вечер: {{ phase.evening.games }} {{ gamesWord(phase.evening.games) }}</div>
        <div v-for="(w, i) in phase.evening.wins.slice(0, 7)" :key="w.player" class="award sticker" :style="{ animationDelay: `${i * 0.15}s` }">
          <Avatar v-if="playerById(w.player)" :player="playerById(w.player)!" :code="view.code" :size="62" :ring="3" />
          <div class="aname display">{{ playerById(w.player)?.name }} — побед: {{ w.count }}</div>
        </div>
        <div v-if="!phase.evening.wins.length" class="adetail">Пока без чемпионов — играем ещё!</div>
      </div>
      <div v-else-if="current?.kind === 'art'" :key="`art${current.index}`" class="art">
        <div class="atitle display">Лучшее за вечер</div>
        <ItemCard :item="phase.gallery[current.index]!" :code="view.code" :height="560" :replay="3000" />
        <div class="caption">{{ phase.gallery[current.index]!.caption }}</div>
      </div>
      <div v-else-if="current?.kind === 'moment'" :key="`m${current.index}`" class="moment">
        <div class="atitle display">Лучшие моменты</div>
        <div class="mcard sticker">
          <div class="mlabel"><Emoji :char="phase.moments[current.index]!.icon" /> {{ phase.moments[current.index]!.label }}</div>
          <div class="mtext display">{{ phase.moments[current.index]!.text }}</div>
          <div class="mby">
            <template v-for="id in phase.moments[current.index]!.players" :key="id">
              <Avatar v-if="playerById(id)" :player="playerById(id)!" :code="view.code" :size="64" :ring="3" />
            </template>
          </div>
        </div>
      </div>
      <div class="actions">
        <Bublik :size="140" />
        <div class="buttons">
          <button class="btn pink again" @click="send({ t: 'host.again', start: true })">Сыграть ещё!</button>
          <button class="btn ghost menu" @click="send({ t: 'host.again' })"><Icon name="home" /> В меню</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.final {
  position: absolute;
  inset: 0;
  padding: 40px 70px 40px;
  display: grid;
  grid-template-columns: 900px 1fr;
  gap: 50px;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  font-size: 72px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow: 0 6px 0 var(--ink);
}

.teams {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  font-size: 30px;
  font-weight: 800;
}

.teams small {
  font-size: 22px;
  color: #6b5a99;
}

.podium {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 260px;
  animation: rise 800ms cubic-bezier(0.2, 1.3, 0.4, 1) both;
}

.medal {
  font-size: 60px;
}

/* a heavy Cyrillic glyph is ~0.83em wide, so a 14-letter name fits the step only below ~21px */
.pname {
  max-width: 250px;
  font-size: clamp(18px, calc(290px / var(--len)), 30px);
  font-weight: 900;
  line-height: 1.1;
  text-align: center;
  overflow-wrap: anywhere;
}

.block {
  width: 100%;
  border: 5px solid var(--ink);
  border-radius: 20px 20px 0 0;
  background: var(--paper);
  color: var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  box-shadow: inset 0 -20px 0 rgba(27, 16, 51, 0.1);
}

.block.gold {
  background: var(--yellow);
}

.block span {
  font-size: 64px;
  font-weight: 900;
  line-height: 1;
}

.block small {
  font-size: 26px;
  font-weight: 800;
}

.rest {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 30px;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
}

.rrow {
  display: flex;
  gap: 10px;
}

.right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.awards,
.art {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow: hidden;
}

.art {
  align-items: center;
  animation: pop-in 500ms both;
}

.atitle {
  font-size: 38px;
  font-weight: 900;
  text-shadow: 0 4px 0 var(--ink);
}

.award {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 18px;
  animation: award-in 450ms both;
}

/* pop-in overshoots to 108%, and a full-width card would lose its sides to the list's overflow: hidden */
@keyframes award-in {
  0% {
    opacity: 0;
    translate: 0 40px;
    scale: 0.92;
  }
  70% {
    opacity: 1;
    translate: 0 -4px;
  }
  100% {
    translate: none;
    scale: 1;
  }
}

.aname {
  font-size: 22px;
  font-weight: 800;
}

.adetail {
  font-size: 18px;
  font-weight: 700;
  color: #6b5a99;
}

.caption {
  font-size: 26px;
  font-weight: 900;
}

.actions {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: flex-end;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.again {
  font-size: 28px;
  min-height: 80px;
  padding: 0 40px;
}

.menu {
  font-size: 22px;
}

@keyframes rise {
  from {
    transform: translateY(600px);
  }
  to {
    transform: none;
  }
}
.moment {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.mcard {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 30px 36px;
  rotate: -1.5deg;
  animation: pop-in 450ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

.mlabel {
  font-size: 26px;
  font-weight: 800;
  color: #6b5a99;
}

.mtext {
  font-size: 50px;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.mby {
  display: flex;
  gap: 10px;
}
</style>
