<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '../../common/Avatar.vue';
import Emoji from '../../common/Emoji.vue';
import { TEAM_INFO } from '../../../../shared/catalog';
import { useCountdown } from '../../common/countdown';
import TimerRing from '../parts/TimerRing.vue';
import { playerById, socket, view } from '../store';

const phase = computed(() => {
  const p = view.value?.phase;
  return p?.kind === 'tug' || p?.kind === 'tugReveal' ? p : null;
});
const startsIn = useCountdown(
  computed(() => (phase.value?.kind === 'tug' ? phase.value.startsAt : undefined)),
  () => socket.now(),
  computed(() => view.value?.paused ?? false),
);
const sides = computed(() =>
  ([0, 1] as const).map((team) => {
    const p = phase.value;
    const ids = Object.entries(p?.teams ?? {})
      .filter(([, t]) => t === team)
      .map(([id]) => id);
    const taps = ids.reduce((sum, id) => sum + (p?.counts[id] ?? 0), 0);
    return { team, info: TEAM_INFO[team], members: ids.map((id) => playerById(id)).filter((pl) => pl !== undefined), pull: ids.length ? taps / ids.length : 0 };
  }),
);
/** Where the knot sits, from -1 (all the way to team 0) to 1; matches the server's win line at the ends. */
const knot = computed(() => {
  const p = phase.value;
  if (p?.kind === 'tugReveal') return p.winner === null ? 0 : p.winner === 0 ? -1 : 1;
  const gap = p?.kind === 'tug' ? p.gap : 1;
  return Math.max(-1, Math.min(1, (sides.value[1]!.pull - sides.value[0]!.pull) / gap));
});
</script>

<template>
  <div v-if="phase && view" class="tugv">
    <div class="head">
      <h2 class="display">Перетягивание каната</h2>
      <TimerRing v-if="phase.kind === 'tug'" :deadline="phase.deadline" :size="130" />
    </div>

    <div class="field">
      <div v-for="s in sides" :key="s.team" class="side" :class="`t${s.team}`" :style="{ '--tc': s.info.color }">
        <div class="name display"><Emoji :char="s.info.icon" /> {{ s.info.title }}</div>
        <div class="crew">
          <div v-for="m in s.members" :key="m.id" class="pul" :class="{ win: phase.kind === 'tugReveal' && phase.winner === s.team }">
            <Avatar :player="m" :code="view.code" :size="84" :ring="4" />
            <b v-if="phase.kind === 'tugReveal' && phase.gains[m.id]" class="gain">+{{ phase.gains[m.id] }}</b>
          </div>
        </div>
      </div>
      <div class="rope">
        <div class="line" :style="{ transform: `translateX(${knot * 18.75}%)` }">
          <i class="mid" />
        </div>
        <i class="mark left" />
        <i class="mark right" />
      </div>
      <div v-if="phase.kind === 'tug' && startsIn > 0" class="count display">
        <span :key="startsIn" class="pop-in">{{ startsIn }}</span>
      </div>
      <div v-if="phase.kind === 'tugReveal'" class="result sticker display">
        {{ phase.winner === null ? 'Ничья!' : `Победа: ${TEAM_INFO[phase.winner].icon} ${TEAM_INFO[phase.winner].title}` }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.tugv {
  position: absolute;
  inset: 0;
  padding: 40px 120px 230px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head h2 {
  margin: 0;
  font-size: 64px;
  color: var(--yellow);
  -webkit-text-stroke: 8px var(--ink);
  paint-order: stroke;
}

.field {
  position: relative;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 240px;
  align-items: start;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}

.name {
  padding: 6px 22px;
  border: 4px solid var(--ink);
  border-radius: 18px;
  background: var(--tc);
  color: #fff;
  font-size: 34px;
  text-shadow: 0 3px 0 var(--ink);
}

.crew {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.pul {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: heave 0.4s ease-in-out infinite alternate;
}

.t0 .pul {
  --lean: -8deg;
}

.t1 .pul {
  --lean: 8deg;
}

@keyframes heave {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(var(--lean)) translateX(calc(var(--lean) * 0.8));
  }
}

.pul.win {
  animation: none;
  transform: translateY(-14px);
}

.gain {
  font-size: 28px;
  color: var(--green);
  -webkit-text-stroke: 4px var(--ink);
  paint-order: stroke;
}

.rope {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 40px;
  height: 90px;
  overflow: hidden;
}

.line {
  position: absolute;
  left: -30%;
  right: -30%;
  top: 28px;
  height: 34px;
  border: 5px solid var(--ink);
  border-radius: 17px;
  background: repeating-linear-gradient(-60deg, #c98a3a 0 14px, #e8b46a 14px 28px);
  transition: transform 160ms linear;
}

.mid {
  position: absolute;
  left: 50%;
  top: -26px;
  width: 26px;
  height: 76px;
  margin-left: -13px;
  border: 4px solid var(--ink);
  border-radius: 6px;
  background: var(--red);
}

.mark {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6px;
  background: rgba(255, 255, 255, 0.7);
}

.mark.left {
  left: 20%;
}

.mark.right {
  right: 20%;
}

.count {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 160px;
  color: var(--yellow);
  -webkit-text-stroke: 12px var(--ink);
  paint-order: stroke;
}

.result {
  position: absolute;
  left: 50%;
  top: 40%;
  translate: -50% 0;
  padding: 14px 30px;
  font-size: 48px;
  animation: pop-in 450ms cubic-bezier(0.2, 1.5, 0.4, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .pul {
    animation: none;
  }
}
</style>
