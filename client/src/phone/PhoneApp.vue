<script setup lang="ts">
import Emoji from '../common/Emoji.vue';
import Icon from '../common/Icon.vue';
import { computed, ref, watch } from 'vue';
import { PLAYER_COLORS } from '../../../shared/protocol';
import { useCountdown } from '../common/countdown';
import CountUp from '../common/CountUp.vue';
import DescribeScreen from './screens/DescribeScreen.vue';
import DrawScreen from './screens/DrawScreen.vue';
import FinalScreen from './screens/FinalScreen.vue';
import GalleryScreen from './screens/GalleryScreen.vue';
import GuessScreen from './screens/GuessScreen.vue';
import JoinScreen from './screens/JoinScreen.vue';
import LobbyScreen from './screens/LobbyScreen.vue';
import NeverScreen from './screens/NeverScreen.vue';
import PhotoScreen from './screens/PhotoScreen.vue';
import PredictScreen from './screens/PredictScreen.vue';
import ReflexScreen from './screens/ReflexScreen.vue';
import RulesScreen from './screens/RulesScreen.vue';
import ScaleScreen from './screens/ScaleScreen.vue';
import SharedScreen from './screens/SharedScreen.vue';
import BombScreen from './screens/BombScreen.vue';
import ClosestScreen from './screens/ClosestScreen.vue';
import QuipVoteScreen from './screens/QuipVoteScreen.vue';
import SpyScreen from './screens/SpyScreen.vue';
import ClueScreen from './screens/ClueScreen.vue';
import TreasureScreen from './screens/TreasureScreen.vue';
import ListScreen from './screens/ListScreen.vue';
import RpsScreen from './screens/RpsScreen.vue';
import PlotScreen from './screens/PlotScreen.vue';
import DateScreen from './screens/DateScreen.vue';
import MasqScreen from './screens/MasqScreen.vue';
import RadioScreen from './screens/RadioScreen.vue';
import RushScreen from './screens/RushScreen.vue';
import MarketScreen from './screens/MarketScreen.vue';
import WaveScreen from './screens/WaveScreen.vue';
import OrderScreen from './screens/OrderScreen.vue';
import FreezeScreen from './screens/FreezeScreen.vue';
import TugScreen from './screens/TugScreen.vue';
import Waiting from './screens/Waiting.vue';
import TruthScreen from './screens/TruthScreen.vue';
import EvenScreen from './screens/EvenScreen.vue';
import FibScreen from './screens/FibScreen.vue';
import PercentScreen from './screens/PercentScreen.vue';
import SimonScreen from './screens/SimonScreen.vue';
import ReplyScreen from './screens/ReplyScreen.vue';
import ForeheadScreen from './screens/ForeheadScreen.vue';
import HatScreen from './screens/HatScreen.vue';
import MafiaScreen from './screens/MafiaScreen.vue';
import CloverScreen from './screens/CloverScreen.vue';
import CloverWriteScreen from './screens/CloverWriteScreen.vue';
import ShakerScreen from './screens/ShakerScreen.vue';
import QuizScreen from './screens/QuizScreen.vue';
import YearsScreen from './screens/YearsScreen.vue';
import TaleScreen from './screens/TaleScreen.vue';
import JunkScreen from './screens/JunkScreen.vue';
import NinjaScreen from './screens/NinjaScreen.vue';
import CaseScreen from './screens/CaseScreen.vue';
import ContactScreen from './screens/ContactScreen.vue';
import BandScreen from './screens/BandScreen.vue';
import SyncScreen from './screens/SyncScreen.vue';
import SpectatorScreen from './screens/SpectatorScreen.vue';
import TapScreen from './screens/TapScreen.vue';
import TiltScreen from './screens/TiltScreen.vue';
import VoteScreen from './screens/VoteScreen.vue';
import WatchScreen from './screens/WatchScreen.vue';
import WriteScreen from './screens/WriteScreen.vue';
import { useWakeLock } from '../common/wakeLock';
import { event } from './haptics';
import { prefs } from './prefs';
import { chime, secret } from './sound';
import { me, send, socket, state, view } from './store';

const kind = computed(() => view.value?.phase.kind);
// from the join tap (state.joining) to leaving; the video fallback needs that tap to start
useWakeLock(computed(() => (state.joining || !!state.token || !!view.value) && kind.value !== 'final'), { video: true });
// the mission is a secret from the neighbours, so it shows only on a tap and folds away again
const missionOpen = ref(false);
watch(
  () => view.value?.mission?.done,
  (done, before) => {
    if (done && before === false) {
      event('win');
      missionOpen.value = true;
    }
  },
);
const deadline = computed(() => {
  const p = view.value?.phase;
  if (!p || !('deadline' in p)) return undefined;
  if (p.kind === 'shared' && p.artist !== state.you) return undefined;
  return p.deadline;
});
const left = useCountdown(deadline, () => socket.now(), computed(() => view.value?.paused ?? false));
const color = computed(() => (me.value ? PLAYER_COLORS[me.value.color] : 'var(--muted)'));
// zooming a canvas screen would throw off where strokes and the joystick land
const CANVAS_SCREENS = new Set(['draw', 'shared', 'guess', 'tilt', 'ninja', 'band']);
const zoomed = computed(() => prefs.big && !CANVAS_SCREENS.has(kind.value ?? ''));
const remote = computed(() => me.value?.vip && kind.value !== 'lobby' && kind.value !== 'final');

const gain = ref(0);
const gainKey = ref(0);
const bump = ref(false);
let bumpTimer: ReturnType<typeof setTimeout> | undefined;
watch(
  () => me.value?.score,
  (score, prev) => {
    if (score === undefined || prev === undefined || score <= prev) return;
    event('hit');
    gain.value = score - prev;
    gainKey.value++;
    bump.value = true;
    clearTimeout(bumpTimer);
    bumpTimer = setTimeout(() => (bump.value = false), 500);
  },
);

/** Phases that need a tap from this phone, so it buzzes when one opens. */
const ACTION_KINDS = new Set<string>(['vote', 'predict', 'scale', 'draw', 'photo', 'guess', 'tilt', 'write', 'never', 'tap', 'sync', 'closest', 'quipVote', 'truth', 'even', 'percent', 'percentGuess', 'percentBet', 'fibVote', 'simon', 'replyPick', 'foreheadGuess', 'hat', 'mafiaRoles', 'mafiaNight', 'mafiaVote', 'clover', 'shaker', 'quiz', 'years', 'taleVote', 'junkBid', 'ninja', 'caseSurvey', 'caseClue', 'contactWrite', 'contactGuess', 'band', 'spy', 'clueGuess', 'list', 'rps', 'plot', 'plotGuess', 'date', 'datePick', 'masq', 'masqGuess', 'radio', 'radioVote', 'rush', 'rushVote', 'market', 'waveHint', 'waveGuess', 'orderWrite', 'orderSort', 'freeze', 'tug']);

watch(
  () => view.value?.phaseId,
  (id, prev) => {
    if (id === undefined || prev === undefined || id === prev) return;
    const k = kind.value;
    if (k && ACTION_KINDS.has(k)) event('turn');
    if (k === 'treasure' && view.value?.phase.kind === 'treasure' && view.value.phase.stage === 'choose' && view.value.personal.kind === 'treasure' && view.value.personal.inside) {
      event('turn');
      chime();
    }
    if (k === 'shared' && view.value?.personal.kind === 'shared' && view.value.personal.myTurn) {
      event('turn');
      chime();
    }
    // roles and nights start for everyone at once, with one sound, so the room cannot tell who holds what
    const p = view.value?.personal;
    if (!view.value?.spectator && (k === 'spy' || ((k === 'mafiaRoles' || k === 'mafiaNight') && p?.kind === 'mafia' && p.alive))) secret();
  },
);

watch(kind, (now, was) => {
  if (was === 'lobby' && now !== 'lobby' && view.value?.mission && !view.value.spectator) secret();
});

// out of a round for good: a lost life, a night kill, a tag, a push off the platform
const alive = computed(() => {
  const p = view.value?.personal;
  if (p?.kind === 'tilt') return p.status !== 'out' && p.status !== 'it';
  return p && 'alive' in p ? p.alive : undefined;
});
watch(alive, (now, was) => {
  if (was && now === false) event('lose');
});

// nudges a player who has not answered yet when the timer is about to run out
const HURRY_AT = 5;
const ANSWER_KINDS = new Set<string>(['vote', 'predict', 'quiz', 'even', 'truth', 'closest', 'years', 'fibVote', 'percent', 'percentGuess', 'percentBet']);
watch(left, (now, was) => {
  const p = view.value?.personal;
  if (was <= HURRY_AT || now > HURRY_AT || now === 0 || view.value?.spectator || !p || !ANSWER_KINDS.has(p.kind)) return;
  if ('answer' in p && p.answer !== undefined) return;
  if (('mine' in p && p.mine === true) || ('alive' in p && !p.alive)) return;
  event('alert');
});
</script>

<template>
  <div class="phone" :class="{ big: zoomed, contrast: prefs.contrast }" :style="{ '--me': color }">
    <header v-if="view && me">
      <div class="who">
        <span class="dot"></span>
        <span class="name">{{ me.name }}</span>
      </div>
      <button v-if="view.mission" class="mission" :class="{ done: view.mission.done }" aria-label="Тайная миссия" @click="missionOpen = !missionOpen">
        <Emoji :char="view.mission.done ? '✅' : '🎯'" :size="24" />
      </button>
      <div v-if="remote" class="remote">
        <button
          :aria-label="view.paused ? 'Продолжить' : 'Пауза'"
          @click="send({ t: 'pause', paused: !view.paused })"
        >
          <Icon :name="view.paused ? 'play' : 'pause'" />
        </button>
        <button aria-label="Дальше" @click="send({ t: 'skip' })"><Icon name="skip" /></button>
      </div>
      <div v-if="deadline !== undefined" class="timer display" :class="{ hurry: left <= 5 }">{{ left }}</div>
      <div class="score display" :class="{ bump }">
        <CountUp :value="me.score" :ms="1200" />
        <span v-if="gainKey" :key="gainKey" class="plus">+{{ gain }}</span>
      </div>
    </header>
    <button v-if="missionOpen && view?.mission" class="mission-card sticker" @click="missionOpen = false">
      <small>Тайная миссия · никому не показывайте</small>
      <b>{{ view.mission.text }}</b>
      <span v-if="view.mission.done" class="mission-done">Выполнено! +300 в конце игры</span>
    </button>
    <div v-if="socket.status.value === 'replaced'" class="replaced">
      <p>Игра открыта в другой вкладке или на другом устройстве</p>
      <button class="btn pink" @click="socket.reclaim()">Играть здесь</button>
    </div>
    <div v-else-if="socket.status.value !== 'open'" class="offline">Переподключаюсь…</div>
    <div v-if="view?.paused" class="offline paused">Пауза</div>
    <main>
      <Transition name="screen" mode="out-in">
        <JoinScreen v-if="!view" />
        <VoteScreen v-else-if="view.spectator && kind === 'vote' && view.personal.kind === 'vote'" />
        <GalleryScreen v-else-if="view.spectator && kind === 'gallery' && view.personal.kind === 'gallery'" />
        <RushScreen v-else-if="view.spectator && kind === 'rushVote' && view.personal.kind === 'rushVote'" :key="view.phaseId" />
        <SpectatorScreen v-else-if="view.spectator" />
        <LobbyScreen v-else-if="kind === 'lobby'" />
        <VoteScreen v-else-if="kind === 'vote'" :key="view.phaseId" />
        <PredictScreen v-else-if="kind === 'predict'" :key="view.phaseId" />
        <DrawScreen v-else-if="kind === 'draw' && view.personal.kind === 'draw'" />
        <DescribeScreen v-else-if="kind === 'draw' && view.personal.kind === 'describe'" />
        <PhotoScreen v-else-if="kind === 'photo'" :key="view.phaseId" />
        <SharedScreen v-else-if="kind === 'shared'" />
        <GalleryScreen v-else-if="kind === 'gallery'" />
        <GuessScreen v-else-if="kind === 'guess'" :key="view.phaseId" />
        <TiltScreen v-else-if="kind === 'tilt'" />
        <CloverWriteScreen v-else-if="kind === 'write' && view.phase.kind === 'write' && view.phase.clover" :key="`cw${view.phaseId}`" />
        <WriteScreen v-else-if="kind === 'write'" :key="view.phaseId" />
        <ReflexScreen v-else-if="kind === 'reflex'" />
        <RulesScreen v-else-if="kind === 'rules'" />
        <ScaleScreen v-else-if="kind === 'scale'" :key="view.phaseId" />
        <NeverScreen v-else-if="kind === 'never'" :key="view.phaseId" />
        <TapScreen v-else-if="kind === 'tap'" :key="view.phaseId" />
        <SyncScreen v-else-if="kind === 'sync'" :key="view.phaseId" />
        <BombScreen v-else-if="kind === 'bomb'" :key="view.phaseId" />
        <ClosestScreen v-else-if="kind === 'closest'" :key="view.phaseId" />
        <QuipVoteScreen v-else-if="kind === 'quipVote'" :key="view.phaseId" />
        <TruthScreen v-else-if="kind === 'truth'" :key="view.phaseId" />
        <EvenScreen v-else-if="kind === 'even'" :key="view.phaseId" />
        <PercentScreen v-else-if="kind === 'percent' || kind === 'percentGuess' || kind === 'percentBet'" :key="view.phaseId" />
        <FibScreen v-else-if="kind === 'fibVote'" :key="view.phaseId" />
        <SimonScreen v-else-if="kind === 'simon'" :key="view.phaseId" />
        <ReplyScreen v-else-if="kind === 'replyPick'" :key="view.phaseId" />
        <ForeheadScreen v-else-if="kind === 'foreheadGuess'" :key="view.phaseId" />
        <HatScreen v-else-if="kind === 'hat'" :key="view.phaseId" />
        <MafiaScreen v-else-if="view.personal.kind === 'mafia'" :key="view.phaseId" />
        <CloverScreen v-else-if="kind === 'clover'" :key="view.phaseId" />
        <ShakerScreen v-else-if="kind === 'shaker'" :key="view.phaseId" />
        <TaleScreen v-else-if="kind === 'taleVote'" :key="view.phaseId" />
        <ContactScreen v-else-if="kind === 'contactWrite' || kind === 'contactGuess'" :key="view.phaseId" />
        <BandScreen v-else-if="kind === 'band'" :key="view.phaseId" />
        <CaseScreen v-else-if="kind === 'caseSurvey' || kind === 'caseClue'" :key="view.phaseId" />
        <JunkScreen v-else-if="kind === 'junkBid'" :key="view.phaseId" />
        <NinjaScreen v-else-if="kind === 'ninja'" :key="view.phaseId" />
        <QuizScreen v-else-if="kind === 'quiz'" :key="view.phaseId" />
        <YearsScreen v-else-if="kind === 'years'" :key="view.phaseId" />
        <SpyScreen v-else-if="kind === 'spy' || kind === 'spyGuess'" :key="view.phaseId" />
        <ClueScreen v-else-if="kind === 'clueGuess'" :key="view.phaseId" />
        <TreasureScreen v-else-if="kind === 'treasure'" />
        <ListScreen v-else-if="kind === 'list'" :key="view.phaseId" />
        <RpsScreen v-else-if="kind === 'rps'" :key="view.phaseId" />
        <PlotScreen v-else-if="kind === 'plot' || kind === 'plotGuess'" :key="view.phaseId" />
        <DateScreen v-else-if="kind === 'date' || kind === 'datePick'" :key="view.phaseId" />
        <MasqScreen v-else-if="kind === 'masq' || kind === 'masqGuess'" :key="view.phaseId" />
        <RadioScreen v-else-if="kind === 'radio' || kind === 'radioVote'" :key="view.phaseId" />
        <RushScreen v-else-if="kind === 'rush' || kind === 'rushVote'" :key="view.phaseId" />
        <MarketScreen v-else-if="kind === 'market'" :key="view.phaseId" />
        <WaveScreen v-else-if="kind === 'waveHint' || kind === 'waveGuess'" :key="view.phaseId" />
        <OrderScreen v-else-if="kind === 'orderWrite' || kind === 'orderSort'" :key="view.phaseId" />
        <FreezeScreen v-else-if="kind === 'freeze'" :key="view.phaseId" />
        <TugScreen v-else-if="kind === 'tug'" :key="view.phaseId" />
        <Waiting
          v-else-if="kind === 'missions' && view.mission"
          :title="view.mission.done ? 'Миссия выполнена!' : 'Миссия провалена'"
          :note="view.mission.text"
          :icon="view.mission.done ? '🏆' : '🎯'"
        />
        <FinalScreen v-else-if="kind === 'final'" />
        <WatchScreen v-else />
      </Transition>
    </main>
  </div>
</template>

<style>
html,
body {
  overscroll-behavior: none;
}

body {
  background: var(--violet);
}

/* a fixed layer instead of background-attachment: fixed, which repaints the whole page on every scroll on phones */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.05) 28%, transparent 32%) 0 0 / 18px 18px,
    radial-gradient(circle at 20% 0%, rgba(255, 79, 139, 0.3), transparent 45%),
    radial-gradient(circle at 100% 60%, rgba(34, 211, 238, 0.2), transparent 50%);
}

#app {
  position: relative;
  min-height: 100dvh;
}

/* a finger dragging off the canvas used to select the task text and hijack the stroke */
.phone {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/* the header stays at 1x: name, VIP remote, timer and score already fill a 320px phone */
.phone.big main {
  zoom: 1.2;
}

.phone.contrast {
  --muted: #ffffff;
  --violet: #000000;
  --line: 5px;
}

.phone.contrast main {
  background: #000;
  border-radius: 18px;
}

.phone input,
.phone textarea {
  -webkit-user-select: text;
  user-select: text;
}
</style>

<style scoped>
.phone {
  min-height: 100dvh;
  /* clip, not hidden: the score bump and slide-ins poke past the edge, and hidden would break sticky children */
  overflow-x: clip;
  display: flex;
  flex-direction: column;
  max-width: 560px;
  margin: 0 auto;
  padding: env(safe-area-inset-top) 16px env(safe-area-inset-bottom);
}

.mission {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 3px solid var(--ink);
  background: var(--paper);
  box-shadow: 0 3px 0 var(--ink);
}

.mission.done {
  background: var(--green);
}

.mission-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  padding: 12px 14px;
  font: inherit;
  text-align: left;
  color: var(--ink);
}

.mission-card small {
  font-size: 12px;
  font-weight: 800;
  color: var(--muted);
}

.mission-card b {
  font-size: 18px;
}

.mission-done {
  font-weight: 900;
  color: var(--green);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 0;
  flex: none;
}

.who {
  display: flex;
  flex: 1 1 80px;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-weight: 900;
  font-size: 17px;
}

.dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--me);
  border: 3px solid var(--ink);
  flex: none;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remote {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.remote button {
  width: 40px;
  height: 36px;
  border-radius: 12px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-size: 18px;
  box-shadow: 0 3px 0 var(--ink);
}

.timer {
  min-width: 46px;
  height: 40px;
  padding: 0 10px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--ink);
  font-size: 19px;
  font-weight: 800;
}

.timer.hurry {
  background: var(--red);
  color: #fff;
  animation: wobble 0.5s ease-in-out infinite;
}

.score {
  position: relative;
  font-size: 18px;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 12px;
  background: var(--me);
  color: var(--ink);
  border: 3px solid var(--ink);
}

.score.bump {
  animation: bump 500ms cubic-bezier(0.3, 1.6, 0.5, 1);
}

.plus {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 5;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--green);
  border: 3px solid var(--ink);
  font-size: 16px;
  white-space: nowrap;
  pointer-events: none;
  animation: float-up 1.6s ease-out both;
}

@keyframes bump {
  40% {
    scale: 1.3;
    rotate: -6deg;
  }
}

@keyframes float-up {
  0% {
    opacity: 0;
    translate: 0 10px;
    scale: 0.6;
  }
  20% {
    opacity: 1;
    translate: 0 4px;
    scale: 1.1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    translate: 0 30px;
  }
}

.screen-enter-active,
.screen-leave-active {
  transition:
    opacity 180ms ease,
    translate 240ms cubic-bezier(0.3, 1.3, 0.5, 1);
}

.screen-enter-from {
  opacity: 0;
  translate: 40px 0;
}

.screen-leave-to {
  opacity: 0;
  translate: -40px 0;
}

/* the leaving screen is already unmounted, so a tap on it would reach handlers whose refs are gone;
   kept short because out-in holds the next question back until it is gone */
.screen-leave-active {
  pointer-events: none;
  transition-duration: 90ms;
}

.offline {
  position: fixed;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--orange);
  color: var(--ink);
  font-weight: 900;
  border: 3px solid var(--ink);
}

.replaced {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  text-align: center;
  font-size: 20px;
  font-weight: 900;
  background: var(--violet);
}

.offline.paused {
  background: var(--cyan);
  top: 48px;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-bottom: 16px;
}

/* drawing screens need the canvas to fill the viewport exactly */
.phone:has(.draw, .shared, .guess) {
  height: 100dvh;
}
</style>
