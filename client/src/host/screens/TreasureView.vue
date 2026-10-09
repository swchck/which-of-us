<script setup lang="ts">
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, onMounted } from 'vue';
import { TRAP_INFO } from '../../../../shared/catalog';
import { audio } from '../../common/audio';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'treasure' ? view.value.phase : null));
const people = (ids: string[]) => ids.map((id) => playerById(id)).filter((p) => p !== undefined);
const inside = computed(() => people(phase.value?.inside ?? []));
const camp = computed(() => {
  const p = phase.value;
  if (!p) return [];
  return (view.value?.players ?? []).filter((pl) => !p.inside.includes(pl.id) && (pl.id in p.banked || p.left.includes(pl.id)));
});
const cards = computed(() =>
  (phase.value?.path ?? []).map((c, i, all) => {
    if ('gems' in c) return { key: i, icon: '💎', gems: c.gems, trap: false, deadly: false };
    const twin = all.findIndex((o) => 'trap' in o && o.trap === c.trap);
    return { key: i, icon: TRAP_INFO[c.trap].icon, gems: 0, trap: true, deadly: twin !== i };
  }),
);
/** Traps already on the path: the next one of these kinds ends the expedition. */
const armed = computed(() => cards.value.filter((c) => c.trap && !c.deadly).map((c) => c.icon));

onMounted(() => {
  const p = phase.value;
  if (p?.stage !== 'card') return;
  const last = p.path.at(-1);
  if (p.bust) audio.sfx('buzz');
  else if (last && 'trap' in last) audio.sfx('whoosh');
  else if (last) audio.sfx('ding', Math.min(12, last.gems / 2));
});
</script>

<template>
  <div v-if="phase && view" class="treasure">
    <div class="top">
      <div class="label display"><Emoji char="💎" /> Сокровища · экспедиция {{ phase.expedition }} из {{ phase.expeditions }}</div>
      <div v-if="armed.length" class="armed ribbon">
        Опасно: <Emoji v-for="(a, i) in armed" :key="i" :char="a" :size="34" />
      </div>
      <TimerRing v-if="phase.stage === 'choose' && phase.deadline" :deadline="phase.deadline" :size="130" />
    </div>

    <div class="path">
      <div
        v-for="c in cards"
        :key="c.key"
        class="card"
        :class="{ trap: c.trap, deadly: c.deadly, fresh: phase.stage === 'card' && c.key === cards.length - 1, small: cards.length > 12 }"
        :style="{ '--tilt': `${((c.key * 37) % 7) - 3}deg` }"
      >
        <Emoji :char="c.icon" :size="cards.length > 12 ? 64 : 88" />
        <b v-if="!c.trap" class="gems display">{{ c.gems }}</b>
      </div>
      <div v-if="phase.loose > 0" class="loose sticker"><Emoji char="💎" :size="30" /> {{ phase.loose }} на тропе</div>
    </div>

    <div v-if="phase.bust" class="bust">
      <Emoji :char="TRAP_INFO[phase.bust].icon" :size="220" rim />
      <div class="stamp display">Бежим!</div>
    </div>

    <div class="zones">
      <div class="zone cave">
        <div class="head display"><Emoji char="🔦" /> В пещере · {{ inside.length }}</div>
        <div class="faces">
          <div v-for="p in inside" :key="p.id" class="face" :class="{ ready: phase.stage === 'choose' && phase.answered.includes(p.id), lost: !!phase.bust }">
            <Avatar :player="p" :code="view.code" :size="96" :ring="4" />
            <b class="bag"><Emoji char="💎" :size="22" /> {{ phase.carried[p.id] ?? 0 }}</b>
          </div>
        </div>
      </div>
      <div class="zone out">
        <div class="head display"><Emoji char="🏃" /> Выбрались · {{ camp.length }}</div>
        <div class="faces">
          <div v-for="p in camp" :key="p.id" class="face" :class="{ fresh: phase.left.includes(p.id) }">
            <Avatar :player="p" :code="view.code" :size="80" :ring="3" />
            <b class="bag safe"><Emoji char="💎" :size="20" /> {{ phase.banked[p.id] ?? 0 }}</b>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.treasure {
  position: absolute;
  inset: 0;
  padding: 36px 80px 230px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top {
  display: flex;
  align-items: center;
  gap: 30px;
  min-height: 130px;
}

.label {
  flex: 1;
  font-size: 40px;
  color: var(--yellow);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.armed {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  color: #fff;
}

.path {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 18px;
}

.card {
  position: relative;
  width: 140px;
  height: 180px;
  rotate: var(--tilt);
  display: grid;
  place-items: center;
  border-radius: 18px;
  border: 5px solid var(--ink);
  background: linear-gradient(160deg, #6ff0ff, #3a7bd5);
  box-shadow: 0 6px 0 var(--ink);
}

/* a long expedition runs past twenty cards, which only fit two rows at this size */
.card.small {
  width: 104px;
  height: 134px;
}

.card.trap {
  background: linear-gradient(160deg, #ffb36b, #c2408f);
}

.card.deadly {
  background: linear-gradient(160deg, #ff5a5a, #7a1030);
  outline: 6px solid var(--yellow);
}

.card.fresh {
  animation: treasure-flip 600ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

.gems {
  position: absolute;
  bottom: 4px;
  right: 10px;
  font-size: 44px;
  color: #fff;
  -webkit-text-stroke: 3px var(--ink);
  paint-order: stroke;
}

.loose {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 24px;
  font-weight: 900;
}

.bust {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  background: radial-gradient(circle, rgba(255, 40, 60, 0.45), transparent 60%);
  pointer-events: none;
  z-index: 2;
  animation: pop-in 500ms 0.5s both;
}

.stamp {
  padding: 4px 40px;
  border-radius: 18px;
  border: 6px solid var(--ink);
  background: var(--red);
  color: #fff;
  font-size: 80px;
  rotate: -6deg;
  box-shadow: var(--shadow);
}

.zones {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 30px;
  min-height: 190px;
}

.zone {
  padding: 16px 20px;
  border-radius: 26px;
  background: rgba(18, 6, 42, 0.55);
}

.zone.out {
  background: rgba(46, 212, 122, 0.22);
}

.head {
  font-size: 28px;
}

.faces {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.face {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition:
    translate 300ms,
    opacity 300ms;
}

.face.ready {
  translate: 0 -10px;
}

.face.lost {
  opacity: 0.45;
  animation: wobble 0.5s ease-in-out 2;
}

.face.fresh {
  animation: pop-in 450ms both;
}

.bag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--paper);
  border: 3px solid var(--ink);
  color: var(--ink);
  font-size: 20px;
}

.bag.safe {
  background: var(--green);
}

@keyframes treasure-flip {
  from {
    transform: rotateY(90deg) translateY(-30px);
    opacity: 0;
  }
}
</style>
