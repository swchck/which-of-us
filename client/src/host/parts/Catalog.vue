<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Backdrop from '../Backdrop.vue';
import Emoji from '../../common/Emoji.vue';
import NewBadge from '../../common/NewBadge.vue';
import { GAMES, LOCATIONS, type GameId, type LocationId } from '../../../../shared/protocol';
import { GAME_INFO, LOCATION_INFO } from '../../../../shared/catalog';
import { PLACE_SCENES } from '../../../../shared/scenes';

const props = defineProps<{ kind: 'games' | 'locations'; selected: readonly string[] }>();
const emit = defineEmits<{ toggle: [id: string]; all: [on: boolean]; close: [] }>();

const items = computed(() =>
  (props.kind === 'games'
    ? GAMES.map((id) => ({ id: id as string, icon: GAME_INFO[id].icon, title: GAME_INFO[id].title, fresh: GAME_INFO[id].fresh === true, players: GAME_INFO[id].players ?? 0 }))
    : LOCATIONS.map((id) => ({ id: id as string, icon: LOCATION_INFO[id].icon, title: LOCATION_INFO[id].title, fresh: LOCATION_INFO[id].fresh === true, players: 0 }))
  ).sort((a, b) => Number(b.fresh) - Number(a.fresh)),
);
const query = ref('');
const shown = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? items.value.filter((i) => i.title.toLowerCase().includes(q)) : items.value;
});
const focus = ref(items.value[0]!.id);
const item = computed(() => items.value.find((i) => i.id === focus.value)!);
const game = computed(() => (props.kind === 'games' ? GAME_INFO[focus.value as GameId] : null));
const place = computed(() => (props.kind === 'locations' ? LOCATION_INFO[focus.value as LocationId] : null));
const on = computed(() => props.selected.includes(focus.value));
const scenes = computed(() => Object.entries((props.kind === 'locations' && PLACE_SCENES[focus.value as LocationId]) || {}));
/** The place's scene shown in the preview; undefined is the place itself. */
const scene = ref<string>();
watch(focus, () => (scene.value = undefined));

function key(e: KeyboardEvent): void {
  const list = shown.value;
  const i = list.findIndex((x) => x.id === focus.value);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = list[Math.min(list.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (next) focus.value = next.id;
    document.getElementById(`cat-${focus.value}`)?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === ' ' && document.activeElement?.tagName !== 'INPUT') {
    e.preventDefault();
    emit('toggle', focus.value);
  } else if (e.key === 'Escape') emit('close');
}
const vFocus = { mounted: (el: HTMLElement) => el.focus({ preventScroll: true }) };
</script>

<template>
  <div class="catalog-back" @click.self="emit('close')">
    <div v-focus class="catalog sticker" role="dialog" aria-modal="true" tabindex="-1" @keydown="key">
      <aside class="list">
        <div class="list-head">
          <h3 class="display">{{ kind === 'games' ? 'Мини-игры' : 'Места' }}</h3>
          <span class="count">{{ selected.length }} из {{ items.length }}</span>
        </div>
        <input v-model="query" class="search" placeholder="Найти…" aria-label="Поиск" />
        <div class="bulk">
          <button @click="emit('all', true)">Выбрать все</button>
          <button @click="emit('all', false)">{{ kind === 'games' ? 'Ни одной' : 'Сбросить' }}</button>
        </div>
        <div class="rows">
          <div
            v-for="i in shown"
            :id="`cat-${i.id}`"
            :key="i.id"
            class="row"
            :class="{ focus: i.id === focus, on: selected.includes(i.id) }"
            @click="focus = i.id"
          >
            <Emoji :char="i.icon" :size="40" />
            <span class="title">{{ i.title }}</span>
            <NewBadge v-if="i.fresh" :size="14" />
            <span v-if="i.players" class="min" :title="`Нужно от ${i.players} игроков`">{{ i.players }}+</span>
            <button
              class="check"
              :aria-label="selected.includes(i.id) ? `Убрать: ${i.title}` : `Добавить: ${i.title}`"
              :aria-pressed="selected.includes(i.id)"
              @click.stop="emit('toggle', i.id)"
            >
              {{ selected.includes(i.id) ? '✓' : '+' }}
            </button>
          </div>
          <p v-if="shown.length === 0" class="none">Ничего не нашлось</p>
        </div>
      </aside>

      <section :key="focus" class="preview">
        <div v-if="place" class="scene">
          <Backdrop :theme="focus as LocationId" :scene="scene" />
          <NewBadge v-if="item.fresh" :size="34" class="hero-new" />
        </div>
        <div v-else class="hero">
          <NewBadge v-if="item.fresh" :size="34" class="hero-new" />
          <Emoji :char="item.icon" :size="150" animated rim />
        </div>
        <div class="info">
          <h2 class="display">{{ item.title }} <NewBadge v-if="item.fresh" :size="24" class="title-new" /></h2>
          <p v-if="item.players" class="needs">👥 Нужно от {{ item.players }} игроков, считая ботов — в компании поменьше эта игра не выпадет</p>
          <p v-if="game" class="pitch">{{ game.pitch }}</p>
          <p v-else-if="place" class="pitch">{{ place.theme }}. Вопросы и задания раунда будут про это место.</p>
          <template v-if="place && scenes.length">
            <div class="scenes">
              <button class="chip" :class="{ on: scene === undefined }" @click="scene = undefined">{{ item.title }}</button>
              <button v-for="[id, title] in scenes" :key="id" class="chip" :class="{ on: scene === id }" @click="scene = id">{{ title }}</button>
            </div>
            <p class="note">Раунд начинается здесь, а посреди раунда действие переезжает в одну из сцен: в длинном раунде в две. Задник и вопросы меняются вместе с ней.</p>
          </template>
          <ol v-if="game">
            <li v-for="(line, i) in game.rules" :key="i">{{ line }}</li>
          </ol>
        </div>
        <div class="actions">
          <button class="btn" :class="on ? 'ghost' : 'green'" @click="emit('toggle', focus)">
            {{ on ? 'Убрать из вечера' : 'Добавить в вечер' }}
          </button>
          <button class="btn pink" @click="emit('close')">Готово</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.catalog-back {
  position: absolute;
  inset: 0;
  z-index: 25;
  display: grid;
  place-items: center;
  background: rgba(18, 6, 42, 0.6);
}

.catalog {
  zoom: var(--stage-scale, 1);
  width: 1640px;
  height: 900px;
  display: grid;
  grid-template-columns: 480px minmax(0, 1fr);
  overflow: hidden;
  padding: 0;
  color: var(--ink);
  outline: none;
  animation: pop-in 300ms both;
}

.list {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 28px 22px 22px 28px;
  border-right: 4px solid var(--ink);
  background: #f3edff;
}

.list-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.list-head h3 {
  margin: 0;
  font-size: 40px;
}

.count {
  font-size: 20px;
  font-weight: 900;
  color: #6b5a99;
}

.search {
  padding: 10px 16px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 20px;
  font-weight: 700;
}

.bulk {
  display: flex;
  gap: 10px;
}

.bulk button {
  padding: 4px 12px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: #6b5a99;
  font: inherit;
  font-size: 17px;
  font-weight: 800;
  text-decoration: underline;
  cursor: pointer;
}

.rows {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 6px;
}

.row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  border: 3px solid transparent;
  border-radius: 16px;
  font-size: 21px;
  font-weight: 800;
  color: #8a7bb5;
  cursor: pointer;
}

.row.on {
  color: var(--ink);
}

.row:not(.on) :deep(img) {
  filter: grayscale(0.8);
  opacity: 0.6;
}

.row.focus {
  border-color: var(--ink);
  background: #fff;
  box-shadow: 3px 4px 0 var(--ink);
}

.title {
  flex: 1;
  min-width: 0;
}

.min {
  flex: none;
  padding: 1px 8px;
  border-radius: 10px;
  background: #e4d7ff;
  color: #4a3b78;
  font-size: 15px;
  font-weight: 900;
}

.needs {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
  color: #6b5a99;
}

.check {
  width: 38px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 3px solid var(--ink);
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
}

.row.on .check {
  background: var(--green);
}

.none {
  margin: 20px 0;
  text-align: center;
  font-weight: 800;
  color: #8a7bb5;
}

.preview {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 32px 40px;
  animation: pop-in 250ms both;
}

.scene {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 520px;
  overflow: hidden;
  border: 4px solid var(--ink);
  border-radius: 22px;
  box-shadow: 4px 6px 0 var(--ink);
}

.hero {
  position: relative;
  display: grid;
  place-items: center;
  height: 260px;
  border-radius: 22px;
  background: radial-gradient(circle at 50% 45%, #ffe7f1 0%, #efe4ff 60%, #e4d7ff 100%);
  border: 4px solid var(--ink);
}

.hero-new {
  position: absolute;
  top: 20px;
  right: 26px;
}

.title-new {
  vertical-align: middle;
  margin-left: 10px;
}

.info {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.scenes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0 6px;
}

.chip {
  padding: 6px 14px;
  border: 3px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 17px;
  font-weight: 900;
  cursor: pointer;
}

.chip.on {
  background: var(--yellow);
  box-shadow: 0 3px 0 var(--ink);
}

.note {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #6d5c99;
}

.info h2 {
  margin: 0 0 8px;
  font-size: 50px;
}

.pitch {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
}

ol {
  margin: 0;
  padding-left: 30px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
}
</style>
