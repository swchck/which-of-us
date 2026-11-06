<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Emoji from '../../common/Emoji.vue';
import { ABOUT, cancel, done, downloading, failure, installed, known, load, missing, percent, size, start, type PartId } from '../voicePack';

const emit = defineEmits<{ close: [] }>();

const chosen = ref<PartId[]>([]);
const skipped = ref(false);
const empty = ref(false);
const finished = ref(false);

onMounted(async () => {
  await load();
  chosen.value = missing().map((p) => p.id);
});

const offered = computed(() => missing());
const totalBytes = computed(() => chosen.value.reduce((sum, id) => sum + size(id), 0));
// 12 MB/s is a plain home connection; the figure turns gigabytes into something a person can
// decide on, not an estimate anyone should hold us to
const minutes = computed(() => Math.max(1, Math.round(totalBytes.value / (12 * 2 ** 20) / 60)));

function flip(id: PartId): void {
  chosen.value = chosen.value.includes(id) ? chosen.value.filter((x) => x !== id) : [...chosen.value, id];
  if (chosen.value.length) empty.value = false;
}

async function go(): Promise<void> {
  if (!chosen.value.length) {
    empty.value = true;
    return;
  }
  const wanted = chosen.value;
  await start(wanted);
  finished.value = !failure.value && wanted.every((id) => installed.value.includes(id));
}

function mb(bytes: number): string {
  return Math.round(bytes / 2 ** 20).toString();
}

function gb(bytes: number): string {
  return (bytes / 2 ** 30).toFixed(1).replace('.', ',');
}
</script>

<template>
  <Teleport to="body">
    <div class="backdrop">
      <div class="card sticker">
        <template v-if="finished">
          <Emoji class="big" char="🎉" :size="120" />
          <h2 class="display">Голос на месте!</h2>
          <p class="hand sub">Игра сейчас перезапустится и заговорит.</p>
          <button class="btn" @click="emit('close')">Поехали</button>
        </template>

        <template v-else-if="skipped">
          <Emoji class="big" char="🤫" :size="120" />
          <h2 class="display">Играем молча</h2>
          <p class="hand sub">Вопросы будут на экране. Голос можно добавить в настройках.</p>
          <button class="btn" @click="emit('close')">Хорошо</button>
        </template>

        <template v-else-if="downloading.length">
          <h2 class="display">Качаем голос…</h2>
          <div class="meter">
            <div class="top"><span class="display pct">{{ percent }}%</span></div>
            <div class="track"><div class="fill" :style="{ width: percent + '%' }"></div></div>
            <div v-for="id in downloading" :key="id" class="line">
              <div class="label">
                <span>{{ ABOUT[id].title }}</span>
                <span>{{ (done[id] ?? 0) >= size(id) ? 'готово' : mb(done[id] ?? 0) + ' / ' + mb(size(id)) + ' МБ' }}</span>
              </div>
              <div class="mini"><i :style="{ width: ((done[id] ?? 0) / size(id)) * 100 + '%' }"></i></div>
            </div>
          </div>
          <div class="row">
            <button class="btn small ghost" @click="void cancel()">Отмена</button>
          </div>
        </template>

        <template v-else-if="!known">
          <h2 class="display">Секунду…</h2>
          <p class="hand sub">Смотрим, что можно скачать.</p>
        </template>

        <template v-else-if="failure || !offered.length">
          <Emoji class="big" char="😔" :size="100" />
          <h2 class="display">Не вышло</h2>
          <p class="hand sub">Не получилось узнать, что скачивать. Проверьте интернет и попробуйте из настроек ещё раз.</p>
          <button class="btn" @click="emit('close')">Ладно</button>
        </template>

        <template v-else>
          <h2 class="display">Добавим голос?</h2>
          <p class="hand sub">Игра умеет говорить вслух. Но весит это немало — поэтому решай сам.</p>

          <div class="picks">
            <button v-for="part in offered" :key="part.id" class="pick" :class="{ off: !chosen.includes(part.id) }" @click="flip(part.id)">
              <span class="box"><Emoji v-if="chosen.includes(part.id)" char="✅" :size="30" /></span>
              <span class="text">
                <span class="head">
                  <span class="display">{{ ABOUT[part.id].title }}</span>
                  <span class="display mb">{{ mb(part.size) }} МБ</span>
                </span>
                <span class="note">{{ ABOUT[part.id].note }}</span>
              </span>
            </button>
          </div>

          <p v-if="totalBytes" class="display total">Всего {{ gb(totalBytes) }} ГБ · около {{ minutes }} мин</p>
          <p v-if="empty" class="hand warn">Выбери хоть что-нибудь!</p>

          <div class="row">
            <button class="btn pink" @click="void go()">Скачать</button>
            <button class="btn ghost" @click="skipped = true">Можно и молча</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
  display: grid;
  place-items: center;
  background: rgba(18, 6, 42, 0.7);
}

.card {
  zoom: var(--stage-scale, 1);
  width: 820px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  animation: pop-in 300ms both;
}

h2 {
  margin: 0;
  font-size: 46px;
}

.sub {
  margin: -8px 0 0;
  font-size: 22px;
  color: #5b4a7a;
  max-width: 560px;
}

.big {
  animation: float 3s ease-in-out infinite;
}

.picks {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pick {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  width: 100%;
  padding: 18px 20px;
  border: var(--line) solid var(--ink);
  border-radius: 16px;
  background: #fff;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}

.pick.off {
  background: #efe7dc;
  opacity: 0.6;
}

.box {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: var(--line) solid var(--ink);
  border-radius: 12px;
  background: var(--green);
}

.pick.off .box {
  background: #fff;
}

.text {
  flex: 1;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 24px;
}

.note {
  display: block;
  margin-top: 6px;
  font-size: 17px;
  color: #5b4a7a;
}

.total {
  margin: 0;
  font-size: 20px;
}

.warn {
  margin: 0;
  font-size: 22px;
  color: var(--orange);
}

.meter {
  width: 100%;
  padding: 24px;
  border: var(--line) solid var(--ink);
  border-radius: 18px;
  background: #fff;
  color: var(--ink);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.pct {
  font-size: 44px;
}

.speed {
  font-size: 20px;
  color: #5b4a7a;
}

.track {
  height: 34px;
  border: var(--line) solid var(--ink);
  border-radius: 18px;
  background: #f1ebe0;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: var(--pink) linear-gradient(rgba(255, 255, 255, 0.45), transparent 55%);
  transition: width 200ms linear;
}

.line {
  margin-top: 18px;
}

.label {
  display: flex;
  justify-content: space-between;
  font-size: 17px;
  color: #5b4a7a;
  margin-bottom: 6px;
}

.mini {
  height: 16px;
  border: 3px solid var(--ink);
  border-radius: 10px;
  background: #f1ebe0;
  overflow: hidden;
}

.mini i {
  display: block;
  height: 100%;
  background: var(--cyan);
  transition: width 200ms linear;
}

.row {
  display: flex;
  gap: 16px;
}
</style>
