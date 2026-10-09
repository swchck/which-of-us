<script setup lang="ts">
import Icon from '../../common/Icon.vue';
import Emoji from '../../common/Emoji.vue';
import { computed, ref, watch } from 'vue';
import type { GalleryItem } from '../../../../shared/protocol';
import { saveCollage, saveItem, saveMoment, type MomentCard } from '../../common/album';
import { assetUrl } from '../../common/ink';
import InkView from '../../common/InkView.vue';
import { teamTotals } from '../../common/teams';
import { BADGES, progress, record } from '../progress';
import { me, playerById, send, state, view } from '../store';

const phase = computed(() => (view.value?.phase.kind === 'final' ? view.value.phase : null));
const row = computed(() => phase.value?.rows.find((r) => r.player === state.you));
const teams = computed(() => teamTotals(view.value?.players ?? []));
const myTeam = computed(() => teams.value.find((t) => t.members.some((m) => m.id === state.you)));
const awards = computed(() => phase.value?.awards.filter((a) => a.player === state.you) ?? []);
// own work first: that is what people want to keep
const album = computed(() => {
  const items = phase.value?.gallery ?? [];
  return [...items.filter((i) => i.authors.includes(state.you)), ...items.filter((i) => !i.authors.includes(state.you))];
});
const saving = ref<string | null>(null);
const moments = computed<MomentCard[]>(() =>
  (phase.value?.moments ?? []).map((m) => ({
    icon: m.icon,
    label: m.label,
    text: m.text,
    by: m.players.map((id) => playerById(id)?.name).filter(Boolean).join(', '),
  })),
);

async function keepMoment(card: MomentCard, index: number): Promise<void> {
  if (saving.value) return;
  saving.value = `m${index}`;
  try {
    await saveMoment(card, `kto-iz-nas-moment-${index + 1}`);
  } catch (err) {
    console.error('moment save failed:', err);
  } finally {
    saving.value = null;
  }
}

const myWins = computed(() => phase.value?.evening.wins.find((w) => w.player === state.you)?.count ?? 0);

async function saveAll(): Promise<void> {
  if (!view.value || saving.value) return;
  saving.value = 'all';
  try {
    await saveCollage(view.value.code, album.value, moments.value);
  } catch (err) {
    console.error('album save failed:', err);
  } finally {
    saving.value = null;
  }
}

async function save(item: GalleryItem, index: number): Promise<void> {
  if (!view.value || saving.value) return;
  saving.value = item.id;
  try {
    await saveItem(view.value.code, item, `kto-iz-nas-${index + 1}`);
  } catch (err) {
    console.error('album save failed:', err);
  } finally {
    saving.value = null;
  }
}
// counted once per game: the id stays the same if the final screen is shown again after a reload
const fresh = ref<ReturnType<typeof record>>([]);
watch(
  [phase, row],
  ([p, r]) => {
    if (!p || !r || !view.value) return;
    const unlocked = record({ id: `${view.value.code}-${p.evening.games}`, place: r.place, score: r.score, awards: awards.value.map((a) => a.title), games: p.played });
    if (unlocked.length) fresh.value = unlocked;
  },
  { immediate: true },
);
const showBadges = ref(false);
const medal = computed(() => ['🥇', '🥈', '🥉'][(row.value?.place ?? 99) - 1] ?? '🎉');
</script>

<template>
  <div v-if="phase" class="final">
    <Emoji class="medal pop-in" :char="medal" rim animated />
    <div v-if="row" class="place display">{{ row.place }} место</div>
    <div v-if="row" class="score">{{ row.score }} очков</div>
    <div v-if="teams.length === 1" class="score">Вместе: {{ teams[0]!.score }} очков<template v-if="phase.coop?.asked">, ответили одинаково {{ phase.coop.matched }} из {{ phase.coop.asked }}</template></div>
    <div v-else-if="myTeam" class="score">{{ myTeam.icon }} {{ myTeam.title }}: {{ myTeam.score }} — {{ myTeam === teams[0] && teams[0]!.score > (teams[1]?.score ?? 0) ? 'победа!' : teams[0]!.score === teams[1]?.score ? 'ничья' : 'в следующий раз!' }}</div>
    <div v-if="phase.evening.games > 1" class="score">Побед за вечер: {{ myWins }} из {{ phase.evening.games }}</div>
    <div v-if="awards.length" class="awards">
      <div v-for="(a, i) in awards" :key="i" class="award sticker">
        <div class="title display">{{ a.title }}</div>
        <div class="detail">{{ a.detail }}</div>
      </div>
    </div>
    <div v-if="fresh.length" class="badges">
      <h3 class="display">Новые достижения!</h3>
      <div v-for="(b, i) in fresh" :key="b.id" class="badge sticker pop-in" :style="{ animationDelay: `${0.4 + i * 0.15}s` }">
        <span class="icon">{{ b.icon }}</span>
        <div>
          <b class="display">{{ b.title }}</b>
          <small>{{ b.note }}</small>
        </div>
      </div>
    </div>
    <button class="btn ghost" @click="showBadges = !showBadges">Достижения: {{ progress.badges.length }} из {{ BADGES.length }}</button>
    <div v-if="showBadges" class="badges">
      <p class="stats">Игр: {{ progress.parties }} · побед: {{ progress.wins }} · рекорд: {{ progress.best }} · мини-игр: {{ progress.games.length }}</p>
      <div v-for="b in BADGES" :key="b.id" class="badge sticker" :class="{ locked: !progress.badges.includes(b.id) }">
        <span class="icon">{{ b.icon }}</span>
        <div>
          <b class="display">{{ b.title }}</b>
          <small>{{ b.note }}</small>
        </div>
      </div>
    </div>
    <template v-if="me?.vip">
      <button class="btn pink again" @click="send({ t: 'again', start: true })">Сыграть ещё!</button>
      <button class="btn ghost" @click="send({ t: 'again' })"><Icon name="home" /> В меню</button>
    </template>
    <p v-else class="hint">Главный может запустить новую партию</p>
    <div v-if="(album.length || moments.length) && view" class="album">
      <h3 class="display"><Emoji char="📸" /> Альбом вечеринки</h3>
      <button v-if="album.length + moments.length > 1" class="btn cyan" :disabled="saving !== null" @click="saveAll">
        {{ saving === 'all' ? 'Собираю…' : 'Сохранить всё одной картинкой' }}
      </button>
      <div v-for="(item, i) in album" :key="item.id" class="shot sticker">
        <img v-if="item.kind === 'photo' && item.image" :src="assetUrl(view.code, item.image)" alt="" />
        <InkView v-else-if="item.board" :code="view.code" :board="item.board" :ink="item.ink" :image="item.image" />
        <div class="bar">
          <span>{{ item.caption }}</span>
          <button class="btn small cyan" :disabled="saving !== null" @click="save(item, i)">
            {{ saving === item.id ? '…' : 'Сохранить' }}
          </button>
        </div>
      </div>
      <h3 v-if="moments.length" class="display"><Emoji char="✨" /> Лучшие моменты</h3>
      <div v-for="(m, i) in moments" :key="i" class="moment sticker">
        <small>{{ m.icon }} {{ m.label }}</small>
        <b>{{ m.text }}</b>
        <div class="bar">
          <span>{{ m.by }}</span>
          <button class="btn small cyan" :disabled="saving !== null" @click="keepMoment(m, i)">
            {{ saving === `m${i}` ? '…' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badges {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badges h3 {
  margin: 0;
  text-align: center;
}

.badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  text-align: left;
}

.badge.locked {
  opacity: 0.4;
  filter: grayscale(1);
}

.badge .icon {
  font-size: 34px;
}

.badge b {
  display: block;
  font-size: 18px;
}

.badge small {
  font-weight: 700;
  color: #6b5a99;
}

.stats {
  margin: 0;
  text-align: center;
  font-weight: 800;
}

.moment {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
}

.moment small {
  font-weight: 800;
  color: #6b5a99;
}

.moment b {
  font-size: 20px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.final {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 10px 0 20px;
}

.medal {
  font-size: 110px;
  line-height: 1;
}

.place {
  font-size: 34px;
  font-weight: 900;
}

.score {
  font-size: 20px;
  font-weight: 800;
  color: var(--muted);
}

.awards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.award {
  padding: 12px 16px;
  background: var(--yellow);
}

.title {
  font-size: 19px;
  font-weight: 800;
}

.detail {
  font-weight: 700;
  font-size: 15px;
}

.album {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.album h3 {
  margin: 0;
  font-size: 22px;
}

.shot {
  padding: 0;
  overflow: hidden;
}

.shot img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  font-weight: 700;
  font-size: 14px;
  text-align: left;
}

.again {
  width: 100%;
  margin-top: 12px;
}

.hint {
  color: var(--muted);
  font-weight: 700;
}
</style>
