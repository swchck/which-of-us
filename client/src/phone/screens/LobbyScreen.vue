<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, nextTick, ref } from 'vue';
import { CUSTOM_MAX, MIN_PLAYERS, NAME_MAX, PLAYER_COLORS } from '../../../../shared/protocol';
import Avatar from '../../common/Avatar.vue';
import { squareJpeg } from '../camera';
import { prefs } from '../prefs';
import { toggleSound } from '../sound';
import { me, send, state, uploadImage, view } from '../store';

const uploading = ref(false);
const failed = ref(false);
const input = ref<HTMLInputElement>();

const online = computed(() => view.value?.players.filter((p) => p.connected).length ?? 0);
const canStart = computed(() => online.value >= MIN_PLAYERS);
const takenColors = computed(
  () => new Set(view.value?.players.filter((p) => p.id !== state.you).map((p) => p.color) ?? []),
);

async function onFile(ev: Event): Promise<void> {
  const file = (ev.target as HTMLInputElement).files?.[0];
  if (!file || uploading.value) return;
  uploading.value = true;
  failed.value = false;
  try {
    failed.value = !(await uploadImage(await squareJpeg(file), 'selfie'));
  } catch {
    failed.value = true;
  } finally {
    uploading.value = false;
    if (input.value) input.value.value = '';
  }
}

const renaming = ref(false);
const newName = ref('');
const nameInput = ref<HTMLInputElement>();
const nameTaken = computed(() => {
  const n = newName.value.trim().toLowerCase();
  return n !== '' && (view.value?.players ?? []).some((p) => p.id !== state.you && p.name.toLowerCase() === n);
});

function startRename(): void {
  newName.value = me.value?.name ?? '';
  renaming.value = true;
  // the old name comes selected, so typing replaces it instead of gluing onto it
  void nextTick(() => nameInput.value?.select());
}

function rename(): void {
  const name = newName.value.trim();
  if (name && !nameTaken.value) send({ t: 'rename', name });
  renaming.value = false;
}

const question = ref('');

function addQuestion(): void {
  const text = question.value.trim();
  if (text.length < 5) return;
  send({ t: 'question', text });
  question.value = '';
}

const leaving = ref(false);
let leaveTimer: ReturnType<typeof setTimeout> | undefined;

// one stray tap at the bottom of a scrolling page used to drop the seat, the selfie and the crown
function leave(): void {
  if (leaving.value) {
    send({ t: 'leave' });
    return;
  }
  leaving.value = true;
  clearTimeout(leaveTimer);
  leaveTimer = setTimeout(() => (leaving.value = false), 3000);
}
</script>

<template>
  <div v-if="me && view" class="lobby">
    <div class="me sticker pop-in">
      <Avatar :player="me" :code="view.code" :size="150" :ring="6" />
      <form v-if="renaming" class="rename" @submit.prevent="rename">
        <input ref="nameInput" v-model="newName" :maxlength="NAME_MAX" autocomplete="nickname" enterkeyhint="done" aria-label="Новое имя" @blur="rename" />
        <p v-if="nameTaken" class="hint err">Такое имя уже занято</p>
      </form>
      <button v-else class="name display" aria-label="Изменить имя" @click="startRename">{{ me.name }} <Icon name="edit" /></button>
      <label class="btn cyan selfie" :class="{ busy: uploading }">
        <input ref="input" type="file" accept="image/*" capture="user" hidden :disabled="uploading" @change="onFile" />
        <Emoji v-if="!uploading" char="📸" />
        {{ uploading ? 'Загружаю…' : me.selfie ? 'Переснять' : 'Сделать селфи' }}
      </label>
      <p v-if="failed" class="hint err">Не получилось загрузить, попробуйте ещё раз</p>
      <p v-else-if="!me.selfie" class="hint">Селфи будут использоваться в игре — рисовать на них тоже будут!</p>
    </div>

    <div class="colors">
      <button
        v-for="(c, i) in PLAYER_COLORS"
        :key="c"
        class="color"
        :class="{ on: me.color === i, taken: takenColors.has(i) }"
        :disabled="takenColors.has(i)"
        :style="{ background: c }"
        :aria-label="`Цвет ${i + 1}`"
        @click="send({ t: 'color', color: i })"
      ></button>
    </div>

    <div class="status">
      <div class="count display">{{ online }} / 8</div>
      <div>игроков в комнате</div>
    </div>

    <template v-if="me.vip">
      <button class="btn pink start" :disabled="!canStart" @click="send({ t: 'start' })">
        Все в сборе — поехали!
      </button>
      <p v-if="!canStart" class="hint center">Нужно хотя бы {{ MIN_PLAYERS }} игрока</p>
    </template>
    <p v-else class="hint center wait">Ждём, когда главный нажмёт «Поехали»…</p>

    <form class="ask" @submit.prevent="addQuestion">
      <label class="ask-label">Свой вопрос для «Кто из нас?»</label>
      <div class="ask-row">
        <input v-model="question" :maxlength="CUSTOM_MAX" placeholder="Кто из нас…" enterkeyhint="send" />
        <button class="btn small green" type="submit" :disabled="question.trim().length < 5">+</button>
      </div>
      <p class="hint">
        В копилке: {{ view.customCount }}. Зададим их первыми!
      </p>
    </form>

    <div class="prefs">
      <button class="pref" :class="{ on: prefs.big }" @click="prefs.big = !prefs.big">Аа Крупный текст</button>
      <button class="pref" :class="{ on: prefs.contrast }" @click="prefs.contrast = !prefs.contrast"><Icon name="contrast" /> Контраст</button>
      <button class="pref" :class="{ on: prefs.vibration }" @click="prefs.vibration = !prefs.vibration">Вибрация</button>
      <button class="pref" :class="{ on: prefs.sound }" @click="toggleSound">Звук</button>
    </div>

    <button class="leave" :class="{ sure: leaving }" @click="leave">
      {{ leaving ? 'Точно выйти? Нажмите ещё раз' : 'Выйти из комнаты' }}
    </button>
  </div>
</template>

<style scoped>
.ask {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ask-label {
  font-weight: 800;
}

.ask-row {
  display: flex;
  gap: 8px;
}

.ask-row input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  font: inherit;
  font-size: 17px;
}

.prefs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.pref {
  padding: 8px 14px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font: inherit;
  font-weight: 800;
}

.pref.on {
  background: var(--yellow);
  color: var(--ink);
}

.lobby {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 20px;
}

.me {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 26px 18px 18px;
}

.name {
  max-width: 100%;
  font-size: clamp(18px, 7vw, 26px);
  font-weight: 800;
  overflow-wrap: anywhere;
}

.selfie {
  width: 100%;
}

.hint {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #6b5a99;
  text-align: center;
}

.hint.err {
  color: var(--red);
}

.hint.center {
  color: var(--muted);
}

.wait {
  animation: float 2.4s ease-in-out infinite;
}

.colors {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

/* eight in a row are ~28px dots on a narrow phone; two rows of four stay comfortably tappable */
@media (max-width: 420px) {
  .colors {
    grid-template-columns: repeat(4, minmax(44px, 56px));
    justify-content: center;
    gap: 12px;
  }
}

.color {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 3px solid var(--ink);
  cursor: pointer;
}

.color.on {
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 6px var(--ink);
  transform: scale(1.15);
}

.color.taken {
  opacity: 0.25;
}

.status {
  text-align: center;
  font-weight: 800;
  color: var(--muted);
}

.count {
  font-size: 36px;
  color: #fff;
}

.start {
  min-height: 70px;
  font-size: 21px;
}

.leave {
  background: none;
  border: 0;
  color: var(--muted);
  text-decoration: underline;
  font-weight: 700;
  padding: 8px;
  cursor: pointer;
}

.leave.sure {
  color: var(--orange);
  text-decoration: none;
}
.rename input {
  width: 100%;
  padding: 8px 14px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 24px;
  font-weight: 900;
  text-align: center;
}

button.name {
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
}

button.name :deep(svg) {
  width: 0.6em;
  height: 0.6em;
  opacity: 0.6;
}
</style>
