<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import { computed, nextTick, reactive, ref, watch } from 'vue';
import {
  CUSTOM_MAX,
  GAMES,
  LOCATIONS,
  MINIS_MAX,
  MINIS_MIN,
  PLACEMENTS,
  NAME_TOKEN,
  OPTION_MAX,
  PACES,
  PACKS,
  PREDICT_OPTIONS_MAX,
  QUESTIONS_MAX,
  QUESTIONS_MIN,
  ROUNDS_MAX,
  SCALE_LABEL_MAX,
  TIMERS,
  type GameId,
  type LocationId,
  type QuestionDraft,
  type QuestionKind,
  type Settings,
  type TimerId,
} from '../../../../shared/protocol';
import { GAME_INFO, LOCATION_INFO, PACE_FACTOR, PACE_INFO, PACK_INFO, PLACEMENT_INFO, ROUND_FORMATS, TIMER_INFO } from '../../../../shared/catalog';
import { BUILT_IN, dropPreset, matches, saved, savePreset, type Preset } from '../presets';
import Emoji from '../../common/Emoji.vue';
import Catalog from './Catalog.vue';
import NewBadge from '../../common/NewBadge.vue';
import { forget, library, remember } from '../questions';
import { playerById, send, view } from '../store';
import { vTip } from '../tip';

defineEmits<{ close: [] }>();

type Tab = 'games' | 'rules' | 'questions';
const tab = ref<Tab>('games');
const TABS: { id: Tab; icon: string; title: string }[] = [
  { id: 'games', icon: '🎲', title: 'Игры и места' },
  { id: 'rules', icon: '⏱️', title: 'Правила и таймеры' },
  { id: 'questions', icon: '✍️', title: 'Свои вопросы' },
];

type ListKey = 'games' | 'locations' | 'packs';
type NumKey = 'episodes' | 'questions' | 'minis';

// two quick taps would both start from the same server echo and the first one would be lost
const draft = reactive<Record<ListKey, string[]> & Record<NumKey, number> & { timers: Settings['timers'] }>({
  games: [],
  locations: [],
  packs: [],
  episodes: 0,
  questions: 0,
  minis: 0,
  timers: {},
});
// every room message carries a fresh settings object, so resync only when these really change
watch(
  () => {
    const s = view.value?.settings;
    return s ? JSON.stringify([s.games, s.locations, s.packs, s.episodes, s.questions, s.minis, s.timers]) : '';
  },
  () => {
    const s = view.value?.settings;
    if (!s) return;
    draft.games = [...s.games];
    draft.locations = [...s.locations];
    draft.packs = [...s.packs];
    draft.episodes = s.episodes;
    draft.questions = s.questions;
    draft.minis = s.minis;
    draft.timers = { ...s.timers };
  },
  { immediate: true },
);

function settings(patch: Partial<Settings>): void {
  send({ t: 'host.settings', settings: patch });
}

function apply(p: Preset): void {
  draft.games = [...p.games];
  draft.locations = [...p.locations];
  draft.packs = [...p.packs];
  settings({ games: p.games, locations: p.locations, packs: p.packs, pace: p.pace });
}

/** Sets a whole list at once; an empty list means «only the basics» for places and packs. */
function setAll<K extends ListKey>(key: K, ids: readonly Settings[K][number][]): void {
  const next = ids.length > 0 || key === 'games' ? [...ids] : ['party'];
  draft[key] = next;
  settings({ [key]: next } as Partial<Settings>);
}

const catalog = ref<'games' | 'locations' | null>(null);
const PICKERS = [
  {
    kind: 'games' as const,
    title: 'Мини-игры',
    total: GAMES.length,
    note: '«Кто из нас?» играется всегда',
    icons: () => draft.games.map((g) => GAME_INFO[g as GameId].icon),
    fresh: GAMES.filter((g) => GAME_INFO[g].fresh).length,
  },
  {
    kind: 'locations' as const,
    title: 'Места',
    total: LOCATIONS.length,
    note: 'тема каждого раунда',
    icons: () => draft.locations.map((l) => LOCATION_INFO[l as LocationId].icon),
    fresh: LOCATIONS.filter((l) => LOCATION_INFO[l].fresh).length,
  },
];
const naming = ref(false);
const presetName = ref('');

function saveCurrent(): void {
  const s = view.value?.settings;
  const name = presetName.value.trim().slice(0, 24);
  if (!s || !name) return;
  savePreset({ name, icon: '⭐', games: [...s.games], locations: [...s.locations], packs: [...s.packs], pace: s.pace });
  presetName.value = '';
  naming.value = false;
}

/** Flips one id in a settings list; places and packs keep at least one entry, games may go to zero. */
function toggle<K extends ListKey>(key: K, id: Settings[K][number]): void {
  const list = draft[key];
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  if (next.length === 0 && key !== 'games') return;
  draft[key] = next;
  settings({ [key]: next } as Partial<Settings>);
}

const LIMITS: Record<NumKey, [number, number]> = {
  episodes: [1, ROUNDS_MAX],
  questions: [QUESTIONS_MIN, QUESTIONS_MAX],
  minis: [MINIS_MIN, MINIS_MAX],
};

function format(f: (typeof ROUND_FORMATS)[number]): void {
  draft.questions = f.questions;
  draft.minis = f.minis;
  settings({ questions: f.questions, minis: f.minis });
}

function step(key: NumKey, by: number): void {
  const [min, max] = LIMITS[key];
  const next = Math.min(max, Math.max(min, draft[key] + by));
  if (next === draft[key]) return;
  draft[key] = next;
  settings({ [key]: next });
}

/** What a timer runs at now: the host's own value, or the default stretched by the pace. */
function timerValue(id: TimerId): number {
  return draft.timers[id] ?? Math.round(TIMER_INFO[id].seconds * PACE_FACTOR[view.value?.settings.pace ?? 'normal']);
}

function stepTimer(id: TimerId, by: number): void {
  const { min, max } = TIMER_INFO[id];
  const next = Math.min(max, Math.max(min, timerValue(id) + by));
  draft.timers = { ...draft.timers, [id]: next };
  settings({ timers: draft.timers });
}

function resetTimer(id: TimerId): void {
  const next = { ...draft.timers };
  delete next[id];
  draft.timers = next;
  settings({ timers: next });
}

const KINDS: { id: QuestionKind; icon: string; title: string; hint: string }[] = [
  { id: 'vote', icon: '👥', title: 'Кто из нас?', hint: 'все голосуют, кто из компании подходит лучше всех' },
  { id: 'predict', icon: '🔮', title: 'Угадай ответ', hint: 'про одного игрока: этот игрок выбирает вариант, остальные угадывают' },
  { id: 'scale', icon: '🌡️', title: 'Шкала', hint: 'про одного игрока: оценка от 0 до 10, остальные угадывают' },
];
const kind = ref<QuestionKind>('vote');
const text = ref('');
const options = ref<string[]>(['', '']);
const low = ref('');
const high = ref('');

const draftQuestion = computed<QuestionDraft | null>(() => {
  const t = text.value.trim();
  if (t.length < MIN_LENGTH) return null;
  if (kind.value === 'vote') return { kind: 'vote', text: t };
  if (kind.value === 'scale') return { kind: 'scale', text: t, low: low.value.trim(), high: high.value.trim() };
  const opts = options.value.map((o) => o.trim()).filter(Boolean);
  return opts.length >= 2 ? { kind: 'predict', text: t, options: opts } : null;
});

function insertName(): void {
  if (!text.value.includes(NAME_TOKEN)) text.value = `${text.value.trimEnd()} ${NAME_TOKEN} `.trimStart();
  textInput.value?.focus();
}

const PLACEHOLDERS: Record<QuestionKind, string> = {
  vote: 'Кто из нас первым…',
  predict: `Что ${NAME_TOKEN} закажет в кафе?`,
  scale: `Насколько ${NAME_TOKEN} любит поспать?`,
};
const STARTERS: Record<QuestionKind, string[]> = {
  vote: ['Кто из нас первым ', 'Кто из нас скорее ', 'Кто из нас никогда не ', 'Кто из нас лучше всех ', 'Кто из нас тайно '],
  predict: ['Что {name} выберет: ', 'Куда {name} поедет ', 'Что {name} сделает, если ', 'Какой {name} '],
  scale: ['Насколько {name} любит ', 'Насколько {name} боится ', 'Как часто {name} '],
};
const EXAMPLES: Record<QuestionKind, QuestionDraft> = {
  vote: { kind: 'vote', text: 'Кто из нас первым уснёт в поезде?' },
  predict: { kind: 'predict', text: `Что ${NAME_TOKEN} закажет в кафе?`, options: ['Кофе', 'Чай', 'Что-нибудь сладкое'] },
  scale: { kind: 'scale', text: `Насколько ${NAME_TOKEN} любит поспать?`, low: 'совсем нет', high: 'очень' },
};
const EXAMPLE_NAME = 'Аня';
const LIST_SEARCH_FROM = 6;
const MIN_LENGTH = 5;

const bulk = ref(false);
const bulkText = ref('');
const bulkQuestions = computed(() =>
  bulkText.value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= MIN_LENGTH),
);
const editing = ref<QuestionDraft | null>(null);
const textInput = ref<HTMLTextAreaElement>();
const bulkInput = ref<HTMLTextAreaElement>();
const list = ref<'room' | 'library'>('room');
const search = ref('');

function plural(n: number, one: string, few: string, many: string): string {
  const d = n % 10;
  const h = n % 100;
  if (d === 1 && h !== 11) return one;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few;
  return many;
}

/** What the editor says under the card: a hard blocker, or an amber nudge that has an action. */
const status = computed<{ text: string; nudge: boolean } | null>(() => {
  if (bulk.value && kind.value === 'vote') return null;
  const left = MIN_LENGTH - text.value.trim().length;
  if (left > 0) return { text: `Ещё ${left} ${plural(left, 'символ', 'символа', 'символов')}`, nudge: false };
  if (kind.value === 'predict' && options.value.filter((o) => o.trim()).length < 2) {
    return { text: 'Добавьте ещё вариант: нужно минимум два', nudge: false };
  }
  if (kind.value !== 'vote' && !text.value.includes(NAME_TOKEN)) return { text: `В вопросе нет ${NAME_TOKEN} — имя поставим в начало.`, nudge: true };
  return null;
});

async function focusEnd(): Promise<void> {
  await nextTick();
  const el = textInput.value;
  if (!el) return;
  el.focus();
  el.setSelectionRange(el.value.length, el.value.length);
}

function start(starter: string): void {
  text.value = starter.replace('{name}', NAME_TOKEN);
  void focusEnd();
}

function resetEditor(): void {
  editing.value = null;
  text.value = '';
  options.value = ['', ''];
  low.value = '';
  high.value = '';
}

const exampleText = computed(() => EXAMPLES[kind.value].text.replaceAll(NAME_TOKEN, EXAMPLE_NAME));

/** Fills the editor with a ready question of the chosen kind, to see how it works. */
function tryExample(): void {
  const q = EXAMPLES[kind.value];
  bulk.value = false;
  text.value = q.text;
  options.value = q.options ? [...q.options] : ['', ''];
  low.value = q.low ?? '';
  high.value = q.high ?? '';
  void focusEnd();
}

function afterAdd(): void {
  list.value = 'room';
  search.value = '';
  void nextTick(() => (bulk.value ? bulkInput : textInput).value?.focus());
}

function addQuestion(): void {
  const q = draftQuestion.value;
  if (!q) return;
  if (editing.value) forget(editing.value);
  send({ t: 'host.question', ...q });
  remember(q);
  resetEditor();
  afterAdd();
}

function addBulk(): void {
  for (const line of bulkQuestions.value) {
    const q: QuestionDraft = { kind: 'vote', text: line };
    send({ t: 'host.question', ...q });
    remember(q);
  }
  bulkText.value = '';
  afterAdd();
}

/** Enter submits the one-line editor; Shift+Enter would break the question into lines, so it is ignored. */
function onTextKey(e: KeyboardEvent): void {
  if (e.key !== 'Enter' || e.isComposing) return;
  e.preventDefault();
  addQuestion();
}

function onBulkKey(e: KeyboardEvent): void {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    addBulk();
  }
}

/** Loads a saved question into the editor; saving replaces it in the library. */
function edit(q: QuestionDraft): void {
  bulk.value = false;
  editing.value = q;
  kind.value = q.kind ?? 'vote';
  text.value = q.text.replaceAll('{name}', NAME_TOKEN);
  options.value = q.options?.length ? [...q.options] : ['', ''];
  low.value = q.low ?? '';
  high.value = q.high ?? '';
  void focusEnd();
}

const roomAll = computed(() => [...(view.value?.custom ?? [])].reverse());
// a search box only earns its place on a long list; a stale query on a short one would hide rows silently
const query = (n: number) => (n > LIST_SEARCH_FROM ? search.value.trim().toLowerCase() : '');
const roomShown = computed(() => roomAll.value.filter((q) => q.text.toLowerCase().includes(query(roomAll.value.length))));
const libraryShown = computed(() => library.value.filter((q) => q.text.toLowerCase().includes(query(library.value.length))));
const searchable = computed(() => (list.value === 'room' ? roomAll.value.length : library.value.length) > LIST_SEARCH_FROM);

// rows that arrived since the last update get a short highlight
const fresh = ref(new Set<string>());
watch(
  () => view.value?.custom,
  (now, before) => {
    if (!before || !now) return;
    const known = new Set(before.map((q) => q.id));
    const added = now.filter((q) => !known.has(q.id)).map((q) => q.id);
    if (!added.length) return;
    fresh.value = new Set([...fresh.value, ...added]);
    setTimeout(() => (fresh.value = new Set([...fresh.value].filter((id) => !added.includes(id)))), 600);
  },
);

function sendSaved(q: QuestionDraft): void {
  send({ t: 'host.question', ...q });
}

function shown(q: { text: string }): string {
  return q.text.replaceAll('{name}', '…').replaceAll(NAME_TOKEN, '…');
}

// predict and scale questions only come up when their game is planned
const kindOff = (k: QuestionKind | undefined) => k !== undefined && k !== 'vote' && !draft.games.includes(k);

const kindIcon = (k: QuestionKind | undefined) => KINDS.find((x) => x.id === (k ?? 'vote'))!.icon;

// grow the sticker with its text; field-sizing is not in every WebKit the desktop app may run on
watch(
  [text, textInput],
  () => {
    const el = textInput.value;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  },
  { flush: 'post' },
);
</script>

<template>
  <div v-if="view" class="backdrop" @click.self="$emit('close')">
    <div class="panel sticker">
      <div class="head">
        <h2 class="display">Настройка игры</h2>
        <div class="tabs">
          <button v-for="t in TABS" :key="t.id" class="tab" :class="{ on: tab === t.id }" @click="tab = t.id"><Emoji :char="t.icon" /> {{ t.title }}</button>
        </div>
        <button class="btn small" @click="$emit('close')">Готово</button>
      </div>

      <template v-if="tab === 'games'">
        <section>
          <h3>Готовые наборы <small>одним нажатием, потом можно поправить ниже</small></h3>
          <div class="tiles presets">
            <button
              v-for="p in [...BUILT_IN, ...saved]"
              :key="p.name"
              class="tile"
              :class="{ on: matches(p, { ...draft, pace: view.settings.pace }) }"
              @click="apply(p)"
            >
              <Emoji :char="p.icon" :size="48" />
              <span class="tname">{{ p.name }}</span>
              <span v-if="saved.includes(p)" class="drop" title="Удалить набор" @click.stop="dropPreset(p.name)"><Icon name="close" /></span>
            </button>
            <form v-if="naming" class="name-form" @submit.prevent="saveCurrent">
              <input v-model="presetName" maxlength="24" placeholder="Название набора" />
              <button class="btn small green" type="submit" :disabled="!presetName.trim()">Сохранить</button>
            </form>
            <button v-else class="tile save" @click="naming = true">
              <Emoji char="💾" :size="48" />
              <span class="tname">Сохранить текущий</span>
            </button>
          </div>
        </section>

        <div class="pickers">
          <button v-for="c in PICKERS" :key="c.kind" class="picker" @click="catalog = c.kind">
            <span class="picker-head">
              <b>{{ c.title }} <NewBadge v-if="c.fresh" :size="15" /></b>
              <small>выбрано {{ draft[c.kind].length }} из {{ c.total }}</small>
              <small>{{ c.note }}</small>
              <small v-if="c.fresh" class="fresh">новых: {{ c.fresh }}</small>
            </span>
            <span class="strip">
              <Emoji v-for="icon in c.icons().slice(0, 14)" :key="icon" :char="icon" :size="38" />
              <span v-if="c.icons().length > 14" class="more">+{{ c.icons().length - 14 }}</span>
              <span v-if="c.icons().length === 0" class="more">ничего не выбрано</span>
            </span>
            <span class="btn small pink">Выбрать</span>
          </button>
        </div>

        <section>
          <h3>
            Общие вопросы
            <span class="bulk"><button @click="setAll('packs', PACKS)">все</button><button @click="setAll('packs', [])">сбросить</button></span>
          </h3>
          <p class="hint">Попадаются в любом месте и задают тон компании. Остальные вопросы раунда — про его место.</p>
          <div class="tiles">
            <button v-for="p in PACKS" :key="p" class="tile" :class="{ on: draft.packs.includes(p) }" @click="toggle('packs', p)">
              <Emoji :char="PACK_INFO[p].icon" :size="48" />
              <span class="tname">{{ PACK_INFO[p].title }}</span>
            </button>
          </div>
        </section>
      </template>

      <template v-else-if="tab === 'rules'">
        <section>
          <h3>Формат раунда <small>или выставьте числа ниже</small></h3>
          <div class="chips">
            <button
              v-for="f in ROUND_FORMATS"
              :key="f.questions"
              class="chip"
              :class="{ on: draft.questions === f.questions && draft.minis === f.minis }"
              @click="format(f)"
            >
              {{ f.title }} <small>{{ f.questions }} вопросов · {{ f.minis }} {{ f.minis === 1 ? 'мини-игра' : 'мини-игры' }}</small>
            </button>
          </div>
        </section>

        <section class="grid3">
          <div class="num">
            <h3>Раунды</h3>
            <div class="stepper">
              <button @click="step('episodes', -1)">−</button><b>{{ draft.episodes }}</b><button @click="step('episodes', 1)">+</button>
            </div>
            <small>≈ {{ view.minutes[draft.episodes - 1] }} мин</small>
          </div>
          <div class="num">
            <h3>Вопросов в раунде</h3>
            <div class="stepper">
              <button @click="step('questions', -1)">−</button><b>{{ draft.questions }}</b><button @click="step('questions', 1)">+</button>
            </div>
            <small>«Кто из нас?» или про героя раунда</small>
          </div>
          <div class="num">
            <h3>Мини-игр в раунде</h3>
            <div class="stepper">
              <button @click="step('minis', -1)">−</button><b>{{ draft.minis }}</b><button @click="step('minis', 1)">+</button>
            </div>
            <small>между вопросами</small>
          </div>
        </section>

        <section>
          <h3>Мини-игры между вопросами</h3>
          <div class="chips">
            <button v-for="p in PLACEMENTS" :key="p" class="chip" :class="{ on: view.settings.placement === p }" @click="settings({ placement: p })">
              {{ PLACEMENT_INFO[p].title }} <small>{{ PLACEMENT_INFO[p].note }}</small>
            </button>
          </div>
        </section>

        <section class="toggles">
          <button class="chip" :class="{ on: view.settings.spotlight }" @click="settings({ spotlight: !view.settings.spotlight })">
            <Emoji char="🌟" /> Раунды-звёзды <small>каждый второй раунд — все вопросы про одного игрока</small>
          </button>
          <button class="chip" :class="{ on: view.settings.selfVote }" @click="settings({ selfVote: !view.settings.selfVote })">
            <Emoji char="🙋" /> Можно голосовать за себя <small>за свой рисунок, фото или строчку</small>
          </button>
          <button class="chip" :class="{ on: view.settings.missions }" @click="settings({ missions: !view.settings.missions })">
            <Emoji char="🎯" /> Тайные миссии <small>у каждого секретная цель на всю игру, +300 за выполнение</small>
          </button>
          <button class="chip" :class="{ on: view.settings.modifiers }" @click="settings({ modifiers: !view.settings.modifiers })">
            <Emoji char="⚡" /> Особые раунды <small>двойные очки в финале, блиц и помощь отстающим</small>
          </button>
          <button class="chip" :class="{ on: view.settings.teams }" @click="settings({ teams: !view.settings.teams })">
            <Emoji char="🤜" /> Две команды <small>очки участников складываются; от 4 игроков, вдвоём вы и так одна команда</small>
          </button>
        </section>

        <section>
          <h3>Темп <small>для таймеров «авто»</small></h3>
          <div class="chips">
            <button v-for="p in PACES" :key="p" class="chip" :class="{ on: view.settings.pace === p }" @click="settings({ pace: p })">
              <Emoji :char="PACE_INFO[p].icon" /> {{ PACE_INFO[p].title }}
            </button>
          </div>
        </section>

        <section>
          <h3>Таймеры <small>секунды на ответ; «авто» следует темпу</small></h3>
          <div class="timers">
            <div v-for="id in TIMERS" :key="id" class="timer" :class="{ own: draft.timers[id] !== undefined }">
              <span class="tname"><Emoji :char="TIMER_INFO[id].icon" /> {{ TIMER_INFO[id].title }}</span>
              <div class="stepper small">
                <button @click="stepTimer(id, -5)">−</button><b>{{ timerValue(id) }}</b><button @click="stepTimer(id, 5)">+</button>
              </div>
              <button v-if="draft.timers[id] !== undefined" class="auto" title="Вернуть авто" @click="resetTimer(id)">авто</button>
              <span v-else class="auto off">авто</span>
            </div>
          </div>
        </section>
      </template>

      <template v-else>
        <div class="workshop">
          <section class="maker">
            <div class="kinds">
              <button v-for="k in KINDS" :key="k.id" class="tile" :class="{ on: kind === k.id }" :aria-pressed="kind === k.id" @click="kind = k.id">
                <Emoji :char="k.icon" :size="44" />
                <span class="tname">{{ k.title }}</span>
              </button>
            </div>
            <p class="hint">{{ KINDS.find((k) => k.id === kind)!.hint }}</p>
            <div v-if="kindOff(kind)" class="banner" role="alert">
              <span>Игра «{{ GAME_INFO[kind as GameId].title }}» выключена — такие вопросы не прозвучат.</span>
              <button class="btn small" @click="toggle('games', kind as GameId)">Включить игру</button>
            </div>

            <div v-if="kind === 'vote'" class="editor-head">
              <div class="seg" role="group" aria-label="Способ добавления">
                <button :class="{ on: !bulk }" :aria-pressed="!bulk" @click="bulk = false">По одному</button>
                <button :class="{ on: bulk }" :aria-pressed="bulk" @click="bulk = true">Списком</button>
              </div>
            </div>

            <form v-if="bulk && kind === 'vote'" class="editor" @submit.prevent="addBulk">
              <textarea
                ref="bulkInput"
                v-model="bulkText"
                class="bulk-text"
                rows="7"
                aria-label="Вопросы списком"
                placeholder="Каждая строка — отдельный вопрос&#10;Кто из нас первым уснёт в поезде?&#10;Кто из нас скорее станет блогером?"
                @keydown="onBulkKey"
              ></textarea>
              <div class="submit">
                <span class="status" aria-live="polite"></span>
                <button class="btn green go" type="submit" :disabled="bulkQuestions.length === 0">
                  Добавить {{ bulkQuestions.length || '' }} {{ plural(bulkQuestions.length, 'вопрос', 'вопроса', 'вопросов') }}
                </button>
              </div>
            </form>

            <form v-else class="editor" @submit.prevent="addQuestion">
              <div class="starters">
                <span class="starters-label">Начать с:</span>
                <button v-for="st in STARTERS[kind]" :key="st" type="button" class="starter" @click="start(st)">{{ st.replace('{name}', NAME_TOKEN) }}</button>
              </div>

              <div class="card sticker" :class="{ editing }">
                <span v-if="editing" class="ribbon display">Правите вопрос</span>
                <div class="plabel display"><Emoji :char="KINDS.find((k) => k.id === kind)!.icon" /> Так это будет на экране</div>
                <textarea
                  ref="textInput"
                  v-model="text"
                  class="ptext hand"
                  rows="2"
                  aria-label="Текст вопроса"
                  :maxlength="CUSTOM_MAX"
                  :placeholder="PLACEHOLDERS[kind]"
                  @keydown="onTextKey"
                ></textarea>
                <div v-if="kind === 'predict'" class="popts">
                  <div v-for="(_, i) in options" :key="i" class="opt">
                    <input v-model="options[i]" :maxlength="OPTION_MAX" :aria-label="`Вариант ${i + 1}`" :placeholder="`Вариант ${i + 1}`" />
                    <button v-if="options.length > 2" type="button" class="opt-drop" aria-label="Убрать вариант" @click="options.splice(i, 1)">
                      <Icon name="close" />
                    </button>
                  </div>
                  <button v-if="options.length < PREDICT_OPTIONS_MAX" type="button" class="opt-add" @click="options.push('')">+ вариант</button>
                </div>
                <div class="card-foot">
                  <div v-if="kind === 'scale'" class="pscale">
                    <input v-model="low" :maxlength="SCALE_LABEL_MAX" aria-label="Подпись к нулю" placeholder="0 — совсем нет" />
                    <input v-model="high" :maxlength="SCALE_LABEL_MAX" aria-label="Подпись к десяти" placeholder="10 — очень" />
                  </div>
                  <button v-if="kind !== 'vote'" type="button" class="name-btn" @click="insertName">+ {{ NAME_TOKEN }}</button>
                </div>
              </div>

              <div class="submit">
                <p class="status" :class="{ nudge: status?.nudge }" aria-live="polite">
                  <template v-if="status">
                    {{ status.text }}
                    <button v-if="status.nudge" type="button" class="btn small" @click="insertName">Вставить имя</button>
                  </template>
                </p>
                <button v-if="editing" type="button" class="btn ghost" @click="resetEditor">Отмена</button>
                <button class="btn green go" type="submit" :disabled="!draftQuestion">{{ editing ? 'Сохранить' : 'Добавить в игру ⏎' }}</button>
              </div>
            </form>
          </section>

          <section class="lists sticker">
            <div class="lists-head">
              <div class="seg" role="group" aria-label="Список вопросов">
                <button :class="{ on: list === 'room' }" :aria-pressed="list === 'room'" @click="list = 'room'">В этой игре · {{ view.custom?.length ?? 0 }}</button>
                <button :class="{ on: list === 'library' }" :aria-pressed="list === 'library'" @click="list = 'library'">Мои вопросы · {{ library.length }}</button>
              </div>
              <button v-if="list === 'library' && library.length" class="btn small" @click="library.forEach(sendSaved)">Все в игру ({{ library.length }})</button>
            </div>
            <input v-if="searchable" v-model="search" class="search" aria-label="Найти вопрос" placeholder="Найти вопрос" />

            <div class="rows">
              <template v-if="list === 'room'">
                <p v-if="roomAll.length" class="hint">Ваши вопросы зададим первыми</p>
                <ul v-if="roomShown.length" class="custom">
                  <li v-for="q in roomShown" :key="q.id" class="q" :class="{ off: kindOff(q.kind), fresh: fresh.has(q.id) }">
                    <Emoji class="kind" :char="kindIcon(q.kind)" :size="36" />
                    <span class="qtext">{{ shown(q) }}</span>
                    <small v-if="q.by" class="tag">{{ playerById(q.by)?.name }}</small>
                    <small v-if="kindOff(q.kind)" class="tag off-tag">игра выключена</small>
                    <button v-tip="'Убрать из игры'" class="rowbtn" @click="send({ t: 'host.dropQuestion', id: q.id })"><Icon name="close" /></button>
                  </li>
                </ul>
                <div v-else-if="roomAll.length" class="empty">
                  <p>Ничего не нашли по «{{ search.trim() }}»</p>
                  <button class="btn small" @click="search = ''">Сбросить</button>
                </div>
                <div v-else class="empty">
                  <p>Пока ни одного вопроса. Напишите свой или возьмите пример</p>
                  <p class="example hand">{{ exampleText }}</p>
                  <button class="btn small" @click="tryExample">Попробовать пример</button>
                </div>
              </template>
              <template v-else>
                <ul v-if="libraryShown.length" class="custom">
                  <li v-for="q in libraryShown" :key="`${q.kind}${q.text}`" class="q">
                    <Emoji class="kind" :char="kindIcon(q.kind)" :size="36" />
                    <span class="qtext">{{ shown(q) }}</span>
                    <button v-tip="'Изменить'" class="rowbtn" @click="edit(q)"><Icon name="edit" /></button>
                    <button v-tip="'В игру'" class="rowbtn" @click="sendSaved(q)"><Icon name="arrow" /></button>
                    <button v-tip="'Удалить из моих'" class="rowbtn" @click="forget(q)"><Icon name="trash" /></button>
                  </li>
                </ul>
                <div v-else-if="library.length" class="empty">
                  <p>Ничего не нашли по «{{ search.trim() }}»</p>
                  <button class="btn small" @click="search = ''">Сбросить</button>
                </div>
                <div v-else class="empty"><p>Здесь будут все ваши вопросы. Их можно отправить в любую игру</p></div>
              </template>
            </div>

            <p class="phones"><Emoji char="📱" /> Игроки тоже могут добавлять вопросы с телефонов</p>
          </section>
        </div>
      </template>
    </div>
    <Catalog
      v-if="catalog"
      :kind="catalog"
      :selected="draft[catalog]"
      @toggle="(id) => toggle(catalog!, id as never)"
      @all="(on) => setAll(catalog!, on ? (catalog === 'games' ? GAMES : LOCATIONS) : [])"
      @close="catalog = null"
    />
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  background: rgba(18, 6, 42, 0.7);
}

.panel {
  zoom: var(--stage-scale, 1);
  width: 1560px;
  max-height: 940px;
  overflow-y: auto;
  padding: 36px 44px;
  display: flex;
  flex-direction: column;
  gap: 26px;
  animation: pop-in 300ms both;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  margin: 0;
  font-size: 44px;
  white-space: nowrap;
}

h3 {
  margin: 0 0 12px;
  font-size: 26px;
  font-weight: 900;
}

h3 small {
  margin-left: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #6b5a99;
}

.drop {
  opacity: 0.6;
}

.name-form {
  display: flex;
  gap: 10px;
}

.name-form input {
  padding: 8px 12px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  font: inherit;
  font-size: 20px;
}

.bulk {
  margin-left: 14px;
  display: inline-flex;
  gap: 8px;
  vertical-align: middle;
}

.bulk button {
  padding: 2px 12px;
  border-radius: 10px;
  border: 2px solid var(--ink);
  background: #fff;
  font: inherit;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.pickers {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.picker {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 22px;
  border: 3px solid var(--ink);
  border-radius: 20px;
  background: #fff;
  box-shadow: 3px 4px 0 var(--ink);
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 120ms ease;
}

.picker:hover,
.picker:focus-visible {
  transform: translateY(-2px);
}

.picker-head {
  width: 330px;
  flex: none;
  display: flex;
  flex-direction: column;
}

.picker-head b {
  font-size: 28px;
  font-weight: 900;
}

.picker-head small {
  font-size: 17px;
  font-weight: 700;
  color: #6b5a99;
}

.strip {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.picker-head .fresh {
  color: var(--pink);
}

.more {
  margin-left: 6px;
  font-size: 20px;
  font-weight: 900;
  color: #6b5a99;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 118px;
  padding: 14px 8px 12px;
  border: 3px dashed #c4b6e6;
  border-radius: 18px;
  background: none;
  color: #8a7bb5;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
  cursor: pointer;
  transition:
    transform 120ms ease,
    background 120ms ease;
}

.tile :deep(img) {
  filter: grayscale(1);
  opacity: 0.45;
  transition:
    filter 160ms ease,
    opacity 160ms ease;
}

.tile:hover {
  transform: translateY(-3px);
}

.tile.on {
  border: 3px solid var(--ink);
  background: #fff;
  color: var(--ink);
  box-shadow: 3px 4px 0 var(--ink);
}

.tile.on :deep(img) {
  filter: none;
  opacity: 1;
}

/* a green tick in the corner says «on» without relying on colour alone */
.tile.on::after {
  content: '✓';
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 3px solid var(--ink);
  background: var(--green);
  color: var(--ink);
  font-size: 16px;
  font-weight: 900;
}

.tile {
  hyphens: auto;
}

/* a preset is a shortcut, not a switch: its icon stays in colour even when the current mix differs */
.presets .tile,
.tile.save {
  color: var(--ink);
}

.presets .tile :deep(img) {
  filter: none;
  opacity: 1;
}

.tile.save :deep(img) {
  filter: none;
  opacity: 1;
}

.tile .drop {
  position: absolute;
  top: 6px;
  left: 10px;
  margin: 0;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 16px;
  border: 3px dashed #c4b6e6;
  background: none;
  color: #8a7bb5;
  font: inherit;
  font-size: 21px;
  font-weight: 700;
  cursor: pointer;
}

.chip.on {
  border: 3px solid var(--ink);
  background: var(--yellow);
  color: var(--ink);
  box-shadow: 3px 4px 0 var(--ink);
}

.head {
  gap: 20px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-right: auto;
  margin-left: 30px;
}

.tab {
  padding: 10px 18px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: #e9e1ff;
  color: #6b5a99;
  font: inherit;
  font-size: 20px;
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;
}

.tab.on {
  background: var(--ink);
  color: #fff;
}

.grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.num small {
  margin-left: 12px;
  color: #6b5a99;
  font-size: 18px;
  font-weight: 700;
}

.hint {
  color: #6b5a99;
  font-size: 18px;
  font-weight: 700;
  margin: 8px 0 12px;
}

.stepper {
  display: inline-flex;
  align-items: center;
  border: 3px solid var(--ink);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 6px;
}

.stepper button {
  width: 56px;
  height: 56px;
  border: 0;
  background: var(--yellow);
  font: inherit;
  font-size: 30px;
  font-weight: 900;
  cursor: pointer;
}

.stepper b {
  min-width: 70px;
  text-align: center;
  font-family: var(--font-display);
  font-size: 30px;
}

.stepper.small button {
  width: 42px;
  height: 42px;
  font-size: 24px;
}

.stepper.small b {
  min-width: 56px;
  font-size: 22px;
}

.toggles {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.chips small,
.toggles small {
  margin-left: 8px;
  font-size: 17px;
  font-weight: 700;
}

.timers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 40px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tname {
  flex: 1;
  font-size: 20px;
  font-weight: 800;
}

.timer.own .stepper {
  box-shadow: 0 0 0 3px var(--pink);
}

.auto {
  width: 64px;
  padding: 4px 0;
  border-radius: 10px;
  border: 2px solid var(--ink);
  background: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  text-align: center;
  cursor: pointer;
}

.auto.off {
  border-color: transparent;
  background: none;
  color: #6b5a99;
  cursor: default;
}

.panel input {
  background: #fff;
  color: var(--ink);
}

.workshop {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 36px;
  align-items: start;
}

.maker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.maker .hint {
  margin: 0;
  font-size: 22px;
}

.kinds {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.kinds .tile {
  border-style: solid;
  background: #fff;
  color: var(--ink);
  box-shadow: 2px 3px 0 var(--ink);
}

.kinds .tile :deep(img) {
  filter: none;
  opacity: 1;
}

.kinds .tile .tname {
  flex: none;
  font-size: 24px;
}

.kinds .tile.on {
  background: var(--yellow);
  box-shadow: 5px 7px 0 var(--ink);
}

.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  border: 3px solid var(--red);
  border-radius: 14px;
  background: #fff;
  color: var(--ink);
  font-size: 22px;
  font-weight: 700;
}

.editor-head {
  display: flex;
  justify-content: flex-end;
}

.seg {
  display: inline-flex;
  gap: 8px;
}

.seg button {
  padding: 8px 18px;
  border: 3px solid var(--ink);
  border-radius: 14px;
  background: #e9e1ff;
  color: #6b5a99;
  font: inherit;
  font-size: 22px;
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;
}

.seg button.on {
  background: var(--ink);
  color: #fff;
}

.editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.starters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.starters-label {
  color: #6b5a99;
  font-size: 22px;
  font-weight: 800;
}

.starter {
  padding: 6px 16px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
}

.starter:hover {
  background: var(--yellow);
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 220px;
  padding: 18px 22px;
  rotate: -0.8deg;
  transition: rotate 150ms ease;
}

.card:focus-within {
  rotate: 0deg;
}

.ribbon {
  position: absolute;
  top: -16px;
  left: 22px;
  padding: 4px 16px;
  border: 3px solid var(--ink);
  border-radius: 10px;
  background: var(--pink);
  color: #fff;
  font-size: 20px;
}

.plabel {
  color: #c2255f;
  font-size: 22px;
}

.ptext {
  width: 100%;
  min-height: 2.4em;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-size: 32px;
  line-height: 1.2;
  resize: none;
  overflow: hidden;
}

.ptext:focus {
  outline: none;
}

.ptext::placeholder {
  color: #6b5a99;
  opacity: 0.8;
}

.popts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.opt {
  display: flex;
  align-items: center;
  gap: 4px;
}

.popts input,
.pscale input {
  padding: 6px 12px;
  border: 2px solid var(--ink);
  border-radius: 10px;
  font: inherit;
  font-size: 22px;
  font-weight: 700;
}

.popts input {
  width: 230px;
  background: var(--yellow);
}

.popts input::placeholder,
.pscale input::placeholder {
  color: #6b5a99;
}

.opt-drop,
.opt-add,
.name-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 0 14px;
  border: 2px solid var(--ink);
  border-radius: 12px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 22px;
  font-weight: 800;
  cursor: pointer;
}

.opt-drop {
  padding: 0;
  border-color: transparent;
  background: none;
}

.card-foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

.pscale {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pscale input {
  width: 220px;
  background: #fff;
}

.name-btn {
  margin-left: auto;
  background: var(--yellow);
}

.submit {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
}

.status {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: #6b5a99;
  font-size: 22px;
  font-weight: 700;
}

.status.nudge {
  color: #8a4b00;
}

.go {
  padding: 14px 28px;
  font-size: 28px;
}

.btn.go:disabled {
  border-color: var(--ink);
  background: transparent;
  color: #6b5a99;
}

.bulk-text {
  padding: 12px 16px;
  border: 3px solid var(--ink);
  border-radius: 14px;
  font: inherit;
  font-size: 24px;
}

.lists {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 700px;
  padding: 18px 20px;
  min-width: 0;
}

.lists-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.lists .seg button {
  padding: 6px 14px;
  font-size: 22px;
}

.search {
  width: 100%;
  padding: 8px 14px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  font: inherit;
  font-size: 22px;
}

.rows {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.rows .hint {
  margin: 0 0 8px;
  font-size: 22px;
}

.custom {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.q {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 6px;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.q.fresh {
  animation: row-in 280ms ease-out;
}

.q.off .qtext {
  opacity: 0.55;
}

.kind {
  flex: none;
}

.qtext {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.tag {
  flex: none;
  padding: 2px 10px;
  border-radius: 999px;
  background: #ece5ff;
  color: #6b5a99;
  font-size: 22px;
  font-weight: 800;
}

.off-tag {
  background: #fff;
  border: 2px solid var(--red);
  color: var(--ink);
}

.rowbtn {
  position: relative;
  flex: none;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 12px;
  background: none;
  color: var(--ink);
  font-size: 24px;
  cursor: pointer;
}

.rowbtn:hover {
  background: #ece5ff;
}

/* the list scrolls and would clip a tip drawn above the first row */
.rowbtn[data-tip]::after {
  bottom: auto;
  top: calc(100% + 8px);
  right: 0;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 28px 20px;
  border: 3px dashed #b8a8de;
  border-radius: 16px;
  color: #6b5a99;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.empty p {
  margin: 0;
}

.example {
  color: var(--ink);
  font-size: 28px;
}

.phones {
  margin: 0;
  padding-top: 12px;
  border-top: 3px solid var(--ink);
  color: #6b5a99;
  font-size: 22px;
  font-weight: 700;
}

.kinds .tile:focus-visible,
.seg button:focus-visible,
.starter:focus-visible,
.rowbtn:focus-visible,
.opt-drop:focus-visible,
.opt-add:focus-visible,
.name-btn:focus-visible,
.card:focus-within,
.search:focus-visible,
.btn:focus-visible {
  outline: 4px solid var(--pink);
  outline-offset: 2px;
}

@keyframes row-in {
  from {
    background: var(--yellow);
  }
}

@media (prefers-reduced-motion: reduce) {
  .q.fresh {
    animation: none;
  }

  .card {
    transition: none;
  }
}
</style>
