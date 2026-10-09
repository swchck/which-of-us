<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import QRCode from 'qrcode';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { MAX_PLAYERS, MIN_PLAYERS, ROUNDS_MAX } from '../../../../shared/protocol';
import { GAME_INFO, ROUND_FORMATS } from '../../../../shared/catalog';
import Avatar from '../../common/Avatar.vue';
import Bublik from '../Bublik.vue';
import SetupPanel from '../parts/SetupPanel.vue';
import { players, send, view } from '../store';

const qr = ref('');
watch(
  () => view.value?.joinUrl,
  async (url) => {
    if (!url) return;
    qr.value = await QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#1b1033', light: '#fffaf0' } });
  },
  { immediate: true },
);

// typing the address by hand drops into plain http unless the scheme is spelled out
const shortUrl = computed(() => view.value?.joinUrl.replace(/^http:\/\//, '').replace(/\?.*$/, '') ?? '');
const online = computed(() => players.value.filter((p) => p.connected).length);
const canStart = computed(() => online.value >= MIN_PLAYERS);
// the TV is often driven from a laptop across the room, so Enter starts without hunting for the button
function onEnter(ev: KeyboardEvent): void {
  if (ev.key === 'Enter' && ev.target === document.body && canStart.value && !setup.value) send({ t: 'host.start' });
}
onMounted(() => window.addEventListener('keydown', onEnter));
onBeforeUnmount(() => window.removeEventListener('keydown', onEnter));
const slots = computed(() => Math.max(0, MAX_PLAYERS - players.value.length));
function rounds(by: number): void {
  const next = Math.min(ROUNDS_MAX, Math.max(1, (view.value?.settings.episodes ?? 1) + by));
  send({ t: 'host.settings', settings: { episodes: next } });
}
const LINEUP_MAX = 9;
const lineup = computed(() => view.value?.settings.games.slice(0, LINEUP_MAX) ?? []);
const extra = computed(() => (view.value?.settings.games.length ?? 0) - LINEUP_MAX);
const setup = ref(false);
</script>

<template>
  <div v-if="view" class="lobby">
    <div class="left">
      <h1 class="logo display">
        <span>Кто</span>
        <span>из нас?</span>
      </h1>
      <div class="join sticker">
        <div class="qr" v-html="qr"></div>
        <div class="how">
          <div class="step">Наведите камеру телефона на QR</div>
          <div class="or">или откройте</div>
          <div class="url display">{{ shortUrl }}</div>
          <div class="or">и введите код</div>
          <div class="code display">{{ view.code }}</div>
        </div>
      </div>
      <p v-if="view.lan" class="wifi">Телефоны должны быть в той же Wi‑Fi сети, что и этот компьютер</p>
    </div>

    <div class="right">
      <div class="host">
        <Bublik :size="200" />
        <div class="bubble sticker">
          {{
            players.length === 0
              ? 'Привет! Я Бублик, ваш ведущий. Подключайтесь!'
              : canStart
                ? 'Все в сборе? Главный жмёт «Поехали» на телефоне!'
                : 'Отлично! Нужен ещё хотя бы один игрок.'
          }}
        </div>
      </div>

      <div class="players">
        <TransitionGroup name="join">
          <div v-for="p in players" :key="p.id" class="player">
            <Avatar
              :player="p"
              :code="view.code"
              :size="120"
              :class="{ crownable: !p.bot && !p.vip }"
              :title="p.bot || p.vip ? undefined : 'Сделать главным'"
              @click="!p.bot && !p.vip && send({ t: 'host.vip', player: p.id })"
            />
            <div class="pname" :style="{ '--len': p.name.length + (p.vip ? 2 : 0) }">
              <Emoji v-if="p.vip" char="👑" title="Главный" />
              {{ p.name }}
            </div>
            <button class="kick" title="Убрать" @click="send({ t: 'host.kick', player: p.id })"><Icon name="close" /></button>
          </div>
        </TransitionGroup>
        <button v-if="slots > 0" class="player empty add" title="Добавить бота" @click="send({ t: 'host.addBot' })">
          <div class="hole bot"><Emoji char="🤖" :size="52" /><span class="plus">+</span></div>
          <div class="pname dim">бот</div>
        </button>
        <div v-for="i in slots - 1" :key="`s${i}`" class="player empty">
          <div class="hole" :style="{ '--i': i }">?</div>
        </div>
      </div>

      <div v-if="view.customCount" class="audience"><Emoji char="💌" /> Своих вопросов в копилке: {{ view.customCount }}</div>
      <div v-if="view.audience" class="audience"><Emoji char="👀" /> Ещё {{ view.audience }} в зрителях — сыграют следующую партию</div>

      <div class="bottom">
        <div class="program sticker">
          <div class="phead">
            <span class="display">Программа вечера</span>
            <button class="edit" @click="setup = true"><Icon name="gear" /> Настроить</button>
          </div>
          <div class="lengths">
            <button
              v-for="f in ROUND_FORMATS"
              :key="f.questions"
              class="len"
              :class="{ on: view.settings.questions === f.questions && view.settings.minis === f.minis }"
              @click="send({ t: 'host.settings', settings: { questions: f.questions, minis: f.minis } })"
            >
              <b>{{ f.title }}</b>
              <small>{{ f.questions }} вопросов</small>
              <small>{{ f.minis }} {{ f.minis === 1 ? 'мини-игра' : 'мини-игры' }}</small>
            </button>
          </div>
          <div class="rounds">
            <span>Раундов</span>
            <div class="stepper">
              <button :disabled="view.settings.episodes <= 1" aria-label="Меньше раундов" @click="rounds(-1)">−</button>
              <b class="display">{{ view.settings.episodes }}</b>
              <button :disabled="view.settings.episodes >= ROUNDS_MAX" aria-label="Больше раундов" @click="rounds(1)">+</button>
            </div>
            <span class="minutes">≈ {{ view.minutes[view.settings.episodes - 1] }} мин</span>
          </div>
          <div class="lineup">
            <Emoji v-for="g in lineup" :key="g" :char="GAME_INFO[g].icon" :size="40" :title="GAME_INFO[g].title" />
            <span v-if="extra > 0" class="more">+{{ extra }}</span>
            <span v-if="!view.settings.games.length" class="note">Только «Кто из нас?», без мини-игр</span>
          </div>
        </div>
        <button class="btn pink go" :disabled="!canStart" @click="send({ t: 'host.start' })">
          <Emoji char="🚀" :size="64" />
          <span>Поехали!</span>
          <small v-if="!canStart">нужен ещё игрок</small>
          <small v-else>или Enter</small>
        </button>
      </div>
    </div>
    <!-- out of the letterboxed stage, so the dimming behind the panel covers the whole window -->
    <Teleport to="body"><SetupPanel v-if="setup" @close="setup = false" /></Teleport>
  </div>
</template>

<style scoped>
.crownable {
  cursor: pointer;
}

.audience {
  align-self: center;
  padding: 8px 18px;
  border-radius: 14px;
  background: rgba(18, 6, 42, 0.6);
  font-size: 20px;
  font-weight: 800;
}

.lobby {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 760px 1fr;
  gap: 60px;
  padding: 60px 80px;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.logo {
  margin: 0;
  display: flex;
  flex-direction: column;
  line-height: 0.95;
  transform: rotate(-4deg);
  transform-origin: left center;
}

.logo span {
  font-size: 118px;
  font-weight: 900;
  color: var(--yellow);
  text-shadow:
    0 8px 0 var(--ink),
    6px 0 0 var(--ink),
    -6px 0 0 var(--ink),
    0 -6px 0 var(--ink),
    0 16px 0 var(--pink);
}

.logo span + span {
  color: #fff;
  font-size: 96px;
  margin-left: 60px;
}

.join {
  display: flex;
  gap: 30px;
  align-items: center;
  padding: 26px;
}

.join {
  animation: float 5s ease-in-out infinite;
}

.qr {
  width: 300px;
  height: 300px;
  flex: none;
}

.qr :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.how {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step {
  font-size: 26px;
  font-weight: 900;
  line-height: 1.15;
}

.or {
  font-size: 20px;
  font-weight: 700;
  color: #6b5a99;
}

.url {
  font-size: 24px;
  font-weight: 800;
  word-break: break-all;
}

.code {
  font-size: 84px;
  font-weight: 900;
  letter-spacing: 0.12em;
  color: var(--pink);
  line-height: 1;
}

.wifi {
  margin: 0;
  font-size: 20px;
  color: var(--muted);
  font-weight: 700;
}

.right {
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-width: 0;
}

.host {
  display: flex;
  align-items: center;
  gap: 20px;
}

.bubble {
  position: relative;
  padding: 22px 28px;
  font-size: 28px;
  font-weight: 900;
  line-height: 1.2;
}

.bubble::before {
  content: '';
  position: absolute;
  left: -26px;
  top: 50%;
  border: 14px solid transparent;
  border-right: 16px solid var(--ink);
  transform: translateY(-50%);
}

.players {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 26px 20px;
  flex: 1;
  align-content: start;
}

.player {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.pname {
  font-size: clamp(16px, calc(264px / var(--len, 1)), 24px);
  font-weight: 900;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kick {
  position: absolute;
  top: -6px;
  right: 26px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-weight: 900;
  cursor: pointer;
  opacity: 0;
  transition: opacity 150ms;
}

.player:hover .kick {
  opacity: 1;
}

.hole {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  animation: beckon 2.4s ease-in-out calc(var(--i) * 0.3s) infinite;
  display: grid;
  place-items: center;
  font-size: 50px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.2);
}

.hole::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 5px dashed rgba(255, 255, 255, 0.25);
  animation: spin 14s linear infinite;
}

@keyframes beckon {
  0%,
  100% {
    color: rgba(255, 255, 255, 0.2);
    scale: 1;
  }
  50% {
    color: rgba(255, 255, 255, 0.45);
    scale: 1.06;
  }
}

.bottom {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

.program {
  flex: 1;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  rotate: -0.6deg;
}

.phead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 26px;
}

.edit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 3px solid var(--ink);
  border-radius: 12px;
  background: #fff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.lengths {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.len {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 14px;
  border: 3px dashed #c4b6e6;
  background: none;
  color: #6b5a99;
  text-align: left;
  cursor: pointer;
}

.len {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.len b {
  font-size: 20px;
}

.len small {
  font-size: 15px;
  font-weight: 600;
}

.rounds {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 19px;
  font-weight: 700;
}

.minutes {
  color: #6b5a99;
}

.stepper {
  display: inline-flex;
  align-items: center;
  border: 3px solid var(--ink);
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.stepper button {
  width: 42px;
  height: 40px;
  border: 0;
  background: var(--yellow);
  font: inherit;
  font-size: 24px;
  font-weight: 800;
  cursor: pointer;
}

.stepper button:disabled {
  background: #e9e1ff;
  color: #b8a8de;
  cursor: default;
}

.stepper b {
  min-width: 44px;
  text-align: center;
  font-size: 22px;
}

.len.on {
  border-style: solid;
  border-color: var(--ink);
  background: var(--yellow);
  color: var(--ink);
  box-shadow: 3px 4px 0 var(--ink);
}

.lineup {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 46px;
}

.more {
  margin-left: 4px;
  font-family: var(--font-display);
  font-size: 22px;
}

.note {
  margin-left: 12px;
  font-size: 17px;
  font-weight: 600;
  color: #6b5a99;
}

.go {
  width: 300px;
  flex-direction: column;
  gap: 4px;
  font-size: 36px;
}

.go small {
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 600;
}

.add {
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.hole.bot {
  animation: none;
  color: #fff;
}

.hole.bot::before {
  border-color: rgba(255, 255, 255, 0.55);
}

.add:hover .hole.bot {
  scale: 1.08;
}

.plus {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 3px solid var(--ink);
  background: var(--green);
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 24px;
  line-height: 1;
}

.pname.dim {
  color: rgba(255, 255, 255, 0.6);
}

.join-enter-active {
  animation: pop-in 500ms cubic-bezier(0.2, 0.9, 0.3, 1.3);
}

.join-leave-active {
  transition: all 250ms;
}

.join-leave-to {
  opacity: 0;
  transform: scale(0.3);
}
</style>
