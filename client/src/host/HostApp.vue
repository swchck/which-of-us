<script setup lang="ts">
import Icon from '../common/Icon.vue';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { audio, type Theme } from '../common/audio';
import { useWakeLock } from '../common/wakeLock';
import Backdrop from './Backdrop.vue';
import Bublik from './Bublik.vue';
import { inTauri, toggleFullscreen } from './fullscreen';
import { lessMotion } from './prefs';
import AppSettings from './parts/AppSettings.vue';
import RosterToasts from './parts/RosterToasts.vue';
import ScoreRail from './parts/ScoreRail.vue';
import DrawView from './screens/DrawView.vue';
import FinalView from './screens/FinalView.vue';
import GalleryRevealView from './screens/GalleryRevealView.vue';
import GalleryView from './screens/GalleryView.vue';
import GuessRevealView from './screens/GuessRevealView.vue';
import GuessView from './screens/GuessView.vue';
import BombRevealView from './screens/BombRevealView.vue';
import BombView from './screens/BombView.vue';
import ClosestRevealView from './screens/ClosestRevealView.vue';
import ClosestView from './screens/ClosestView.vue';
import HerdRevealView from './screens/HerdRevealView.vue';
import IntroView from './screens/IntroView.vue';
import SceneView from './screens/SceneView.vue';
import LobbyView from './screens/LobbyView.vue';
import NeverRevealView from './screens/NeverRevealView.vue';
import NeverView from './screens/NeverView.vue';
import PhotoView from './screens/PhotoView.vue';
import PredictRevealView from './screens/PredictRevealView.vue';
import PredictView from './screens/PredictView.vue';
import ReflexRevealView from './screens/ReflexRevealView.vue';
import ReflexView from './screens/ReflexView.vue';
import RulesView from './screens/RulesView.vue';
import PlotView from './screens/PlotView.vue';
import MissionsView from './screens/MissionsView.vue';
import DateView from './screens/DateView.vue';
import DateMatchView from './screens/DateMatchView.vue';
import PlotRevealView from './screens/PlotRevealView.vue';
import MasqView from './screens/MasqView.vue';
import MasqRevealView from './screens/MasqRevealView.vue';
import RadioView from './screens/RadioView.vue';
import RushView from './screens/RushView.vue';
import MarketView from './screens/MarketView.vue';
import WaveView from './screens/WaveView.vue';
import OrderView from './screens/OrderView.vue';
import FreezeView from './screens/FreezeView.vue';
import BrawlRevealView from './screens/BrawlRevealView.vue';
import TugView from './screens/TugView.vue';
import ScaleRevealView from './screens/ScaleRevealView.vue';
import ScaleView from './screens/ScaleView.vue';
import ScoresView from './screens/ScoresView.vue';
import SharedRevealView from './screens/SharedRevealView.vue';
import SharedView from './screens/SharedView.vue';
import QuipRevealView from './screens/QuipRevealView.vue';
import QuipVoteView from './screens/QuipVoteView.vue';
import SpyRevealView from './screens/SpyRevealView.vue';
import ClueView from './screens/ClueView.vue';
import ClueRevealView from './screens/ClueRevealView.vue';
import TreasureView from './screens/TreasureView.vue';
import TreasureRevealView from './screens/TreasureRevealView.vue';
import ListView from './screens/ListView.vue';
import ListRevealView from './screens/ListRevealView.vue';
import RpsView from './screens/RpsView.vue';
import RpsRevealView from './screens/RpsRevealView.vue';
import SpyView from './screens/SpyView.vue';
import TruthRevealView from './screens/TruthRevealView.vue';
import TruthView from './screens/TruthView.vue';
import EvenRevealView from './screens/EvenRevealView.vue';
import EvenView from './screens/EvenView.vue';
import FibView from './screens/FibView.vue';
import PercentView from './screens/PercentView.vue';
import SimonView from './screens/SimonView.vue';
import ReplyView from './screens/ReplyView.vue';
import ForeheadView from './screens/ForeheadView.vue';
import HatView from './screens/HatView.vue';
import MafiaView from './screens/MafiaView.vue';
import CloverView from './screens/CloverView.vue';
import ShakerView from './screens/ShakerView.vue';
import QuizView from './screens/QuizView.vue';
import YearsView from './screens/YearsView.vue';
import TaleView from './screens/TaleView.vue';
import CopyShowView from './screens/CopyShowView.vue';
import JunkView from './screens/JunkView.vue';
import NinjaView from './screens/NinjaView.vue';
import CaseView from './screens/CaseView.vue';
import ContactView from './screens/ContactView.vue';
import BandView from './screens/BandView.vue';
import SyncRevealView from './screens/SyncRevealView.vue';
import SyncView from './screens/SyncView.vue';
import TapRevealView from './screens/TapRevealView.vue';
import TapView from './screens/TapView.vue';
import StoryRevealView from './screens/StoryRevealView.vue';
import TiltRevealView from './screens/TiltRevealView.vue';
import TiltView from './screens/TiltView.vue';
import VoteRevealView from './screens/VoteRevealView.vue';
import VoteView from './screens/VoteView.vue';
import WriteView from './screens/WriteView.vue';
import { createRoom, report, send, sendReport, socket, tellVoice, view, wantRoom } from './store';
import { vTip } from './tip';

const W = 1920;
const H = 1080;
/** Window pixels kept free under the stage for the control buttons; must cover `.controls` height plus its offset. */
const CONTROLS_BAND = 76;

const appSettings = ref(false);
// the desktop window has no title bar and draws its traffic lights over the page, so keep that strip clear
const TITLE_BAR = inTauri && navigator.userAgent.includes('Mac') ? 28 : 0;
const titleBar = ref(TITLE_BAR);
const scale = ref(1);

async function fit(): Promise<void> {
  if (TITLE_BAR) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    titleBar.value = (await getCurrentWindow().isFullscreen()) ? 0 : TITLE_BAR;
  }
  scale.value = Math.min(window.innerWidth / W, (window.innerHeight - titleBar.value - CONTROLS_BAND) / H);
  // window-wide overlays live outside the stage, yet size their cards in stage pixels
  document.documentElement.style.setProperty('--stage-scale', String(scale.value));
}

function onResize(): void {
  void fit();
}

const kind = computed(() => view.value?.phase.kind);
useWakeLock(computed(() => kind.value !== undefined && kind.value !== 'lobby'));
const theme = computed<Theme>(() => {
  if (!view.value || kind.value === 'lobby') return 'lobby';
  if (kind.value === 'final') return 'final';
  return view.value.location ?? 'party';
});
// the story page already shows every word the narrator reads out
const NO_CAPTION = new Set(['lobby', 'final', 'intro', 'scene', 'storyReveal']);
const showCaption = computed(() => !NO_CAPTION.has(kind.value ?? ''));
// screens that already rank everyone, or come before anyone has scored
const NO_RAIL = new Set(['lobby', 'intro', 'scene', 'rules', 'scores', 'missions', 'final']);
const showRail = computed(() => !NO_RAIL.has(kind.value ?? 'lobby'));
const soundLocked = ref(!audio.unlocked);
const chrome = ref(true);
let chromeTimer: ReturnType<typeof setTimeout> | undefined;

function poke(): void {
  chrome.value = true;
  clearTimeout(chromeTimer);
  chromeTimer = setTimeout(() => (chrome.value = false), 3000);
}

function unlock(): void {
  audio.unlock();
  soundLocked.value = false;
  if (view.value) {
    audio.setMusic(view.value.settings.music);
    audio.setVoice(view.value.settings.narrator);
  }
}

function start(): void {
  unlock();
  createRoom();
}

// leaving mid-game throws away the scores, so the first press only arms the button
const menuArmed = ref(false);
let menuTimer: ReturnType<typeof setTimeout> | undefined;

function toMenu(): void {
  clearTimeout(menuTimer);
  if (menuArmed.value) {
    menuArmed.value = false;
    send({ t: 'host.again' });
    return;
  }
  menuArmed.value = true;
  menuTimer = setTimeout(() => (menuArmed.value = false), 3000);
}

function togglePause(): void {
  if (view.value && kind.value !== 'lobby' && kind.value !== 'final') send({ t: 'host.pause', paused: !view.value.paused });
}

function setting(key: 'music' | 'narrator'): void {
  if (!view.value) return;
  send({ t: 'host.settings', settings: { [key]: !view.value.settings[key] } });
}

function onKey(ev: KeyboardEvent): void {
  if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLSelectElement) return;
  if (ev.code === 'Space') {
    ev.preventDefault();
    togglePause();
  } else if (ev.code === 'KeyF') void toggleFullscreen();
  else if (ev.code === 'KeyN') send({ t: 'host.skip' });
  else if (ev.code === 'KeyM') setting('music');
}

onMounted(() => {
  void fit();
  void audio.loadEngines();
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKey);
  window.addEventListener('mousemove', poke);
  poke();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('mousemove', poke);
});

watch(theme, (t) => audio.setTheme(t), { immediate: true });
watch([audio.voiceChoice, audio.engines], () => tellVoice());
watch(
  () => view.value?.players.map((p) => p.name).join('\n'),
  () => (audio.names = view.value?.players.map((p) => p.name) ?? []),
  { immediate: true },
);
// a TV that lost its server keeps no game going, so it should not keep the party music going either
const silent = computed(() => (view.value?.paused ?? false) || (view.value !== null && socket.status.value !== 'open'));
watch(silent, (s) => audio.setPaused(s));
// a report belongs to the pause it was made in; the next pause starts with a fresh button
watch(
  () => view.value?.paused,
  (paused) => !paused && (report.value = null),
);
watch(
  () => {
    const p = view.value?.phase;
    return p?.kind === 'freeze' && p.stage !== 'ready' ? p.stage : null;
  },
  (stage) => audio.setDance(stage),
);
watch(
  () => view.value?.settings.music,
  (on) => on !== undefined && audio.setMusic(on),
  { immediate: true },
);
watch(
  () => view.value?.settings.narrator,
  (on) => on !== undefined && audio.setVoice(on),
  { immediate: true },
);
watch([() => view.value?.phaseId, () => view.value?.say], ([id, say]) => {
  if (id === undefined) return;
  // the server holds an early finish until the line is read out, so nobody gets cut off mid-question
  const voiced = !!say && view.value?.settings.narrator !== false;
  audio.speak(say, () => socket.send({ t: 'host.spoken', phaseId: id, voiced }));
  if (kind.value !== 'lobby') audio.sfx('swoosh');
});
// a colour sweep crosses the screen mid-swap, so a new phase reads as a new beat, not a page reload
const wipe = ref(0);
watch(kind, (k, prev) => {
  if (k && prev && k !== prev && k !== 'final' && prev !== 'lobby') wipe.value++;
});
const CHEER = new Set(['voteReveal', 'predictReveal', 'galleryReveal', 'guessReveal', 'scaleReveal', 'tiltReveal', 'reflexReveal', 'neverReveal', 'tapReveal', 'scores', 'herdReveal', 'syncReveal', 'closestReveal', 'quipReveal', 'truthReveal', 'evenReveal', 'percentReveal', 'fibReveal', 'simonReveal', 'foreheadReveal', 'hatReveal', 'mafiaEnd', 'cloverReveal', 'shakerReveal', 'quizReveal', 'yearsReveal', 'taleReveal', 'junkSold', 'ninjaReveal', 'caseReveal', 'contactReveal', 'bandReveal', 'spyReveal', 'clueReveal', 'treasureReveal', 'listReveal', 'rpsReveal', 'plotReveal', 'dateMatch', 'masqReveal', 'radioReveal', 'rushReveal', 'marketReveal', 'waveReveal', 'orderReveal', 'freezeReveal', 'brawlReveal', 'tugReveal']);
const cheer = computed(() => CHEER.has(kind.value ?? ''));
watch(
  () => view.value?.players.length ?? 0,
  (n, prev) => {
    if (n > prev) audio.sfx('pop');
  },
);
watch(
  () => {
    const p = view.value?.phase;
    if (!p) return 0;
    switch (p.kind) {
      case 'vote':
      case 'predict':
      case 'scale':
      case 'sync':
      case 'closest':
      case 'truth':
      case 'even':
      case 'percent':
      case 'percentBet':
      case 'clueGuess':
      case 'treasure':
      case 'rps':
      case 'never':
      case 'waveGuess':
        return p.answered.length;
      default:
        break;
    }
    // guess and photo screens ring their own sounds
    if (p.kind === 'draw' || p.kind === 'write') return p.done.length;
    if (p.kind === 'rules') return p.ready.length;
    if (p.kind === 'gallery' || p.kind === 'quipVote' || p.kind === 'spy' || p.kind === 'plotGuess' || p.kind === 'datePick' || p.kind === 'masqGuess' || p.kind === 'radioVote' || p.kind === 'rushVote' || p.kind === 'fibVote') return p.voted.length;
    if (p.kind === 'radio' || p.kind === 'rush' || p.kind === 'orderWrite' || p.kind === 'orderSort' || p.kind === 'replyPick') return p.done.length;
    if (p.kind === 'market') return p.solved.length;
    return 0;
  },
  (n, prev) => {
    // each answer rings a step higher, so the room hears the count climb without looking
    if (n > prev) audio.sfx('ding', Math.min(n - 1, 12));
  },
);
</script>

<template>
  <div class="viewport" :class="{ nochrome: !chrome }" @click="soundLocked && unlock()">
    <!-- the backdrop covers the whole window, so non-16:9 windows get scenery instead of black bars -->
    <Backdrop :theme="theme" :scene="theme === view?.location ? view?.scene : undefined" :still="silent || lessMotion" />
    <div
      class="stage"
      :style="{
        top: `calc(50% + ${(titleBar - CONTROLS_BAND) / 2}px)`,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }"
    >
      <div v-if="!view" class="title">
        <h1 class="logo display">
          <span>Кто</span>
          <span>из нас?</span>
        </h1>
        <Bublik :size="320" />
        <p class="tag">Вечеринка, где главные герои — вы. Играйте с телефонов!</p>
        <ol v-if="!wantRoom" class="steps">
          <li><b>1</b>Откройте эту страницу на большом экране</li>
          <li><b>2</b>Создайте игру — появится код и QR</li>
          <li><b>3</b>Гости заходят с телефонов, без приложений</li>
        </ol>
        <button v-if="!wantRoom" class="btn pink big" @click="start">Создать игру</button>
        <p v-else class="tag">Подключаюсь к серверу…</p>
      </div>

      <template v-else>
        <Transition name="scene" mode="out-in">
          <LobbyView v-if="kind === 'lobby'" key="lobby" />
          <IntroView v-else-if="kind === 'intro'" :key="`i${view.phaseId}`" />
          <SceneView v-else-if="kind === 'scene'" :key="`sc${view.phaseId}`" />
          <RulesView v-else-if="kind === 'rules'" :key="`r${view.phaseId}`" />
          <VoteView v-else-if="kind === 'vote'" :key="`v${view.phaseId}`" />
          <VoteRevealView v-else-if="kind === 'voteReveal'" :key="`vr${view.phaseId}`" />
          <PredictView v-else-if="kind === 'predict'" :key="`p${view.phaseId}`" />
          <PredictRevealView v-else-if="kind === 'predictReveal'" :key="`pr${view.phaseId}`" />
          <DrawView v-else-if="kind === 'draw'" :key="`d${view.phaseId}`" />
          <PhotoView v-else-if="kind === 'photo'" :key="`ph${view.phaseId}`" />
          <SharedView v-else-if="kind === 'shared'" key="shared" />
          <SharedRevealView v-else-if="kind === 'sharedReveal'" :key="`sr${view.phaseId}`" />
          <GalleryView v-else-if="kind === 'gallery'" :key="`g${view.phaseId}`" />
          <GalleryRevealView v-else-if="kind === 'galleryReveal'" :key="`gr${view.phaseId}`" />
          <ScoresView v-else-if="kind === 'scores'" :key="`s${view.phaseId}`" />
          <GuessView v-else-if="kind === 'guess'" :key="`gu${view.phaseId}`" />
          <GuessRevealView v-else-if="kind === 'guessReveal'" :key="`gur${view.phaseId}`" />
          <TiltView v-else-if="kind === 'tilt'" :key="`t${view.phaseId}`" />
          <TiltRevealView v-else-if="kind === 'tiltReveal'" :key="`tr${view.phaseId}`" />
          <WriteView v-else-if="kind === 'write'" :key="`w${view.phaseId}`" />
          <ReflexView v-else-if="kind === 'reflex'" key="reflex" />
          <ReflexRevealView v-else-if="kind === 'reflexReveal'" :key="`rxr${view.phaseId}`" />
          <ScaleView v-else-if="kind === 'scale'" :key="`sc${view.phaseId}`" />
          <ScaleRevealView v-else-if="kind === 'scaleReveal'" :key="`scr${view.phaseId}`" />
          <StoryRevealView v-else-if="kind === 'storyReveal'" :key="`st${view.phaseId}`" />
          <NeverView v-else-if="kind === 'never'" :key="`nv${view.phaseId}`" />
          <NeverRevealView v-else-if="kind === 'neverReveal'" :key="`nvr${view.phaseId}`" />
          <TapView v-else-if="kind === 'tap'" key="tap" />
          <TapRevealView v-else-if="kind === 'tapReveal'" :key="`tpr${view.phaseId}`" />
          <HerdRevealView v-else-if="kind === 'herdReveal'" :key="`hr${view.phaseId}`" />
          <SyncView v-else-if="kind === 'sync'" :key="`sy${view.phaseId}`" />
          <SyncRevealView v-else-if="kind === 'syncReveal'" :key="`syr${view.phaseId}`" />
          <BombView v-else-if="kind === 'bomb'" :key="`b${view.phaseId}`" />
          <BombRevealView v-else-if="kind === 'bombReveal'" :key="`br${view.phaseId}`" />
          <ClosestView v-else-if="kind === 'closest'" :key="`c${view.phaseId}`" />
          <ClosestRevealView v-else-if="kind === 'closestReveal'" :key="`cr${view.phaseId}`" />
          <QuipVoteView v-else-if="kind === 'quipVote'" :key="`qv${view.phaseId}`" />
          <QuipRevealView v-else-if="kind === 'quipReveal'" :key="`qr${view.phaseId}`" />
          <TruthView v-else-if="kind === 'truth'" :key="`ts${view.phaseId}`" />
          <TruthRevealView v-else-if="kind === 'truthReveal'" :key="`tsr${view.phaseId}`" />
          <EvenView v-else-if="kind === 'even'" :key="`ev${view.phaseId}`" />
          <EvenRevealView v-else-if="kind === 'evenReveal'" :key="`evr${view.phaseId}`" />
          <PercentView v-else-if="kind === 'percent' || kind === 'percentGuess' || kind === 'percentBet' || kind === 'percentReveal'" :key="`pc${view.phaseId}`" />
          <FibView v-else-if="kind === 'fibVote' || kind === 'fibReveal'" :key="`fb${view.phaseId}`" />
          <SimonView v-else-if="kind === 'simon' || kind === 'simonReveal'" :key="`sm${view.phaseId}`" />
          <ReplyView v-else-if="kind === 'replyPick'" :key="`rp${view.phaseId}`" />
          <ForeheadView v-else-if="kind === 'foreheadGuess' || kind === 'foreheadReveal'" :key="`fh${view.phaseId}`" />
          <HatView v-else-if="kind === 'hat' || kind === 'hatReveal'" :key="`hat${view.phaseId}`" />
          <MafiaView v-else-if="kind?.startsWith('mafia')" :key="`mf${view.phaseId}`" />
          <TaleView v-else-if="kind === 'taleVote' || kind === 'taleReveal'" :key="`tl${view.phaseId}`" />
          <ContactView v-else-if="kind === 'contactWrite' || kind === 'contactGuess' || kind === 'contactReveal'" :key="`ct${view.phaseId}`" />
          <BandView v-else-if="kind === 'band' || kind === 'bandReveal'" :key="`bd${view.phaseId}`" />
          <CaseView v-else-if="kind === 'caseSurvey' || kind === 'caseClue' || kind === 'caseReveal'" :key="`ca${view.phaseId}`" />
          <JunkView v-else-if="kind === 'junkBid' || kind === 'junkSold'" :key="`jk${view.phaseId}`" />
          <NinjaView v-else-if="kind === 'ninja' || kind === 'ninjaReveal'" :key="kind === 'ninja' ? 'ninja' : `njr${view.phaseId}`" />
          <CopyShowView v-else-if="kind === 'copyShow'" :key="`cs${view.phaseId}`" />
          <QuizView v-else-if="kind === 'quiz' || kind === 'quizReveal'" :key="`qz${view.phaseId}`" />
          <YearsView v-else-if="kind === 'years' || kind === 'yearsReveal'" :key="`yr${view.phaseId}`" />
          <CloverView v-else-if="kind === 'clover' || kind === 'cloverReveal'" :key="`cl${view.phaseId}`" />
          <ShakerView v-else-if="kind === 'shaker' || kind === 'shakerReveal'" :key="kind === 'shaker' ? 'shaker' : `shr${view.phaseId}`" />
          <SpyView v-else-if="kind === 'spy' || kind === 'spyGuess'" :key="`sp${view.phaseId}`" />
          <SpyRevealView v-else-if="kind === 'spyReveal'" :key="`spr${view.phaseId}`" />
          <ClueView v-else-if="kind === 'clueGuess'" :key="`cl${view.phaseId}`" />
          <ClueRevealView v-else-if="kind === 'clueReveal'" :key="`clr${view.phaseId}`" />
          <TreasureView v-else-if="kind === 'treasure'" :key="`tr${view.phaseId}`" />
          <TreasureRevealView v-else-if="kind === 'treasureReveal'" :key="`trr${view.phaseId}`" />
          <ListView v-else-if="kind === 'list'" :key="`ls${view.phaseId}`" />
          <ListRevealView v-else-if="kind === 'listReveal'" :key="`lsr${view.phaseId}`" />
          <RpsView v-else-if="kind === 'rps'" :key="`rp${view.phaseId}`" />
          <RpsRevealView v-else-if="kind === 'rpsReveal'" :key="`rpr${view.phaseId}`" />
          <PlotView v-else-if="kind === 'plot' || kind === 'plotGuess'" :key="`pl${view.phaseId}`" />
          <PlotRevealView v-else-if="kind === 'plotReveal'" :key="`plr${view.phaseId}`" />
          <DateView v-else-if="kind === 'date' || kind === 'datePick'" :key="`dt${view.phaseId}`" />
          <DateMatchView v-else-if="kind === 'dateMatch'" :key="`dtm${view.phaseId}`" />
          <MasqView v-else-if="kind === 'masq' || kind === 'masqGuess'" :key="`mq${view.phaseId}`" />
          <MasqRevealView v-else-if="kind === 'masqReveal'" :key="`mqr${view.phaseId}`" />
          <RushView v-else-if="kind === 'rush' || kind === 'rushVote' || kind === 'rushReveal'" :key="`rs${view.phaseId}`" />
          <MarketView v-else-if="kind === 'market' || kind === 'marketReveal'" :key="`mk${view.phaseId}`" />
          <RadioView v-else-if="kind === 'radio' || kind === 'radioShow' || kind === 'radioVote' || kind === 'radioReveal'" :key="`rd${view.phaseId}`" />
          <WaveView v-else-if="kind === 'waveHint' || kind === 'waveGuess' || kind === 'waveReveal'" :key="`wv${view.phaseId}`" />
          <OrderView v-else-if="kind === 'orderWrite' || kind === 'orderSort' || kind === 'orderReveal'" :key="`od${view.phaseId}`" />
          <FreezeView v-else-if="kind === 'freeze' || kind === 'freezeReveal'" :key="`fz${view.phaseId}`" />
          <BrawlRevealView v-else-if="kind === 'brawlReveal'" :key="`br${view.phaseId}`" />
          <TugView v-else-if="kind === 'tug' || kind === 'tugReveal'" :key="`tg${view.phaseId}`" />
          <MissionsView v-else-if="kind === 'missions'" :key="`ms${view.phaseId}`" />
          <FinalView v-else-if="kind === 'final'" key="final" />
        </Transition>

        <div v-if="showCaption" class="caption">
          <div class="host" :class="{ cheer }"><Bublik :size="190" /></div>
          <Transition name="bubble" mode="out-in">
            <div v-if="view.say" :key="view.say" class="bubble sticker">{{ view.say }}</div>
          </Transition>
        </div>

        <ScoreRail v-if="showRail" />
        <RosterToasts />
      </template>

      <div v-if="socket.status.value === 'replaced'" class="conn">
        Экран игры открыт в другой вкладке
        <button class="btn small" @click="socket.reclaim()">Показывать здесь</button>
      </div>
      <div v-else-if="socket.status.value !== 'open'" class="conn">Нет связи с сервером — переподключаюсь…</div>
    </div>

    <!-- outside the stage: a 16:10 or taller screen has bars the letterboxed stage never reaches -->
    <div v-if="wipe" :key="wipe" class="wipe" aria-hidden="true"><i></i><i></i><i></i></div>
    <!-- dims the whole window, not just the 16:9 stage, so the scenery around it pauses visibly too -->
    <div v-if="view?.warming" class="paused warming">
      <div class="pause-card" :style="{ transform: `scale(${scale})` }">
        <Bublik :size="220" mood="wow" />
        <div class="sticker display">Минутку!</div>
        <p>Бублик разогревает голос<span class="dots"><i>.</i><i>.</i><i>.</i></span></p>
      </div>
    </div>
    <div v-if="view?.paused" class="paused">
      <div class="pause-card" :style="{ transform: `scale(${scale})` }">
        <div class="sticker display">Пауза</div>
        <p>Пробел или <Icon name="play" /> на телефоне ведущего — продолжить</p>
        <button v-if="report?.state !== 'saved'" class="btn ghost bug" :disabled="report?.state === 'saving'" @click="sendReport">
          {{ report?.state === 'saving' ? 'Сохраняю…' : report?.state === 'failed' ? 'Не получилось — ещё раз?' : '🐞 Что-то пошло не так' }}
        </button>
        <p v-else class="saved">
          Отчёт сохранён{{ report.screenshot ? ' со скриншотом' : '' }}:<br /><code>{{ report.dir }}</code>
        </p>
      </div>
    </div>

    <!-- CC BY asks for visible credit; the full texts ship in /licenses.
         Pinned to the window, not the stage, so it never lands on a scene's floor line -->
    <p v-if="!view" class="credits">
      Иконки — Microsoft Fluent Emoji (MIT) · анимации — Google Noto Emoji (CC BY 4.0) · звуки — Kenney (CC0) ·
      шрифты — Dela Gothic One, Rubik, Shantell Sans (OFL)
    </p>

    <div v-if="titleBar" class="titlebar" data-tauri-drag-region></div>

    <div class="controls">
      <template v-if="view && kind !== 'lobby'">
        <button v-tip="view.paused ? 'Продолжить' : 'Пауза'" @click="togglePause"><Icon :name="view.paused ? 'play' : 'pause'" /></button>
        <button v-tip="'Пропустить этап'" @click="send({ t: 'host.skip' })"><Icon name="skip" /></button>
        <button v-if="kind !== 'final'" v-tip="menuArmed ? 'Нажмите ещё раз — игра закончится' : 'В меню'" class="menu" :class="{ armed: menuArmed }" @click="toMenu">
          <template v-if="menuArmed">Точно в меню?</template>
          <Icon v-else name="home" />
        </button>
      </template>
      <button v-if="view" v-tip="view.settings.narrator ? 'Выключить голос ведущего' : 'Включить голос ведущего'" :class="{ off: !view.settings.narrator }" @click="setting('narrator')"><Icon name="voice" /></button>
      <button v-if="view" v-tip="view.settings.music ? 'Выключить музыку' : 'Включить музыку'" :class="{ off: !view.settings.music }" @click="setting('music')"><Icon name="music" /></button>
      <button v-tip="'Во весь экран'" @click="void toggleFullscreen()"><Icon name="fullscreen" /></button>
      <button v-tip="'Настройки'" @click="appSettings = true"><Icon name="gear" /></button>
    </div>

    <AppSettings v-if="appSettings" @close="appSettings = false" />

    <div v-if="soundLocked && view" class="unlock" @click.stop="unlock"><Icon name="mute" /> Нажмите, чтобы включить звук</div>
  </div>
</template>

<style>
body {
  overflow: hidden;
  background: #12062a;
}
</style>

<style scoped>
.viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

.viewport.nochrome {
  cursor: none;
}

.stage {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  transform-origin: center;
}

.title {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
}

.logo {
  margin: 0;
  display: flex;
  gap: 36px;
  transform: rotate(-3deg);
}

.logo span {
  font-size: 150px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow:
    0 10px 0 var(--ink),
    8px 0 0 var(--ink),
    -8px 0 0 var(--ink),
    0 -8px 0 var(--ink),
    0 20px 0 var(--pink);
}

.logo span + span {
  color: #fff;
}

.tag {
  font-size: 32px;
  font-weight: 800;
  color: var(--muted);
  margin: 0;
}

.credits {
  position: fixed;
  bottom: 8px;
  left: 80px;
  right: 80px;
  margin: 0;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

.steps {
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.steps li {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 400px;
  padding: 16px 22px;
  border-radius: 20px;
  background: rgba(18, 6, 42, 0.55);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  text-align: left;
}

.steps b {
  flex: none;
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--yellow);
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 26px;
}

.big {
  font-size: 40px;
  min-height: 100px;
  padding: 0 70px;
}

.caption {
  position: absolute;
  left: 40px;
  right: 60px;
  bottom: 20px;
  height: 200px;
  display: flex;
  align-items: center;
  gap: 24px;
  pointer-events: none;
}

.bubble {
  position: relative;
  max-width: 1500px;
  padding: 18px 30px;
  font-family: var(--font-hand);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.bubble::before {
  content: '';
  position: absolute;
  left: -30px;
  top: 50%;
  border: 16px solid transparent;
  border-right: 18px solid var(--ink);
  transform: translateY(-50%);
}

.paused {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(18, 6, 42, 0.7);
  z-index: 30;
}

.pause-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.warming .sticker {
  margin-top: 12px;
}

.dots i {
  font-style: normal;
  animation: dot 1.2s infinite;
}

.dots i:nth-child(2) {
  animation-delay: 0.2s;
}

.dots i:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot {
  0%,
  60%,
  100% {
    opacity: 0.2;
  }
  30% {
    opacity: 1;
  }
}

.pause-card .bug {
  margin-top: 18px;
  font-size: 20px;
}

.pause-card .saved {
  max-width: 900px;
  font-size: 18px;
}

.pause-card code {
  font-size: 15px;
  overflow-wrap: anywhere;
}

.pause-card .sticker {
  font-size: 90px;
  font-weight: 900;
  padding: 20px 60px;
}

.pause-card p {
  font-size: 30px;
  font-weight: 800;
}

.conn {
  display: flex;
  align-items: center;
  gap: 16px;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: 999px;
  background: var(--orange);
  color: var(--ink);
  border: 4px solid var(--ink);
  font-size: 26px;
  font-weight: 900;
  z-index: 30;
}

.titlebar {
  position: fixed;
  inset: 0 0 auto;
  height: 28px;
  z-index: 30;
}

.controls {
  position: fixed;
  right: 16px;
  bottom: 16px;
  display: flex;
  gap: 8px;
  z-index: 40;
  transition: opacity 400ms;
}

.nochrome .controls {
  opacity: 0;
  pointer-events: none;
}

.controls button {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 3px 0 var(--ink);
}

.controls button.menu.armed {
  width: auto;
  padding: 0 12px;
  background: var(--red);
  color: #fff;
  font-size: 16px;
  font-weight: 900;
}

.controls button.off > * {
  opacity: 0.4;
}

.unlock {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  padding: 10px 18px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: var(--yellow);
  color: var(--ink);
  font-weight: 900;
  cursor: pointer;
}

.scene-enter-active,
.scene-leave-active {
  transition:
    opacity 280ms ease,
    transform 380ms cubic-bezier(0.3, 1.2, 0.5, 1);
}

.scene-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
}

.scene-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.wipe {
  position: fixed;
  inset: 0;
  z-index: 15;
  pointer-events: none;
  overflow: hidden;
}

.wipe i {
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: 0;
  width: 70%;
  rotate: 12deg;
  translate: -160% 0;
  border-inline: 10px solid var(--ink);
  animation: sweep 900ms cubic-bezier(0.6, 0, 0.3, 1) forwards;
}

.wipe i:nth-child(1) {
  background: var(--pink);
}

.wipe i:nth-child(2) {
  background: var(--yellow);
  animation-delay: 70ms;
}

.wipe i:nth-child(3) {
  background: var(--violet-2);
  animation-delay: 140ms;
}

@keyframes sweep {
  to {
    translate: 260% 0;
  }
}

.host {
  flex: none;
}

.host.cheer {
  animation: cheer 600ms cubic-bezier(0.3, 1.6, 0.5, 1) 3;
}

@keyframes cheer {
  0%,
  100% {
    translate: 0 0;
    rotate: 0deg;
  }
  40% {
    translate: 0 -40px;
    rotate: -8deg;
  }
}

.bubble-enter-active {
  animation: pop-in 380ms cubic-bezier(0.2, 0.9, 0.3, 1.3);
}

.bubble-leave-active {
  transition: opacity 150ms;
}

.bubble-leave-to {
  opacity: 0;
}
</style>
