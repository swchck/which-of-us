<script setup lang="ts">
import Emoji from '../../common/Emoji.vue';
import { computed, onBeforeUnmount, ref } from 'vue';
import { squareJpeg } from '../camera';
import { playerById, state, uploadImage, view } from '../store';
import Waiting from './Waiting.vue';

const phase = computed(() => (view.value?.phase.kind === 'photo' ? view.value.phase : null));
const done = computed(() => view.value?.personal.kind === 'photo' && view.value.personal.done);
const model = computed(() => (phase.value?.subject ? playerById(phase.value.subject) : undefined));
const mine = computed(() => !phase.value?.subject || phase.value.subject === state.you);

const shot = ref<Blob | null>(null);
const preview = ref('');
const sending = ref(false);
/** Upload accepted; the server's `done` follows in the next update, so keep the button off until then. */
const sent = ref(false);
const failed = ref(false);

function forget(): void {
  if (preview.value) URL.revokeObjectURL(preview.value);
  shot.value = null;
  preview.value = '';
  sent.value = false;
  failed.value = false;
}


async function onFile(ev: Event): Promise<void> {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  try {
    shot.value = await squareJpeg(file);
    if (preview.value) URL.revokeObjectURL(preview.value);
    preview.value = URL.createObjectURL(shot.value);
    failed.value = false;
  } catch {
    failed.value = true;
  }
}

async function sendShot(): Promise<void> {
  const v = view.value;
  if (!shot.value || !v || sending.value || sent.value) return;
  sending.value = true;
  try {
    sent.value = await uploadImage(shot.value, 'photo', v.phaseId);
    failed.value = !sent.value;
  } catch {
    failed.value = true;
  } finally {
    sending.value = false;
  }
}

onBeforeUnmount(forget);
</script>

<template>
  <div v-if="phase" class="photo">
    <Waiting v-if="!mine" :title="`Позирует ${model?.name ?? 'модель'}`" note="Сейчас будем рисовать поверх" icon="📸" />
    <template v-else-if="!done">
      <div class="task sticker">
        <div class="label">{{ phase.subject ? 'Позируйте для портрета' : 'Фото-задание' }}</div>
        <div class="prompt">{{ phase.prompt }}</div>
      </div>
      <div class="frame sticker">
        <img v-if="preview" :src="preview" alt="Ваше фото" />
        <div v-else class="empty"><Emoji char="📸" /></div>
      </div>
      <p v-if="failed" class="err">Не получилось — попробуйте ещё раз</p>
      <label class="btn cyan" :class="{ busy: sending || sent }">
        <input type="file" accept="image/*" capture="user" hidden :disabled="sending || sent" @change="onFile" />
        {{ preview ? 'Переснять' : 'Открыть камеру' }}
      </label>
      <button v-if="preview" class="btn green" :disabled="sending || sent" @click="sendShot">
        {{ sending ? 'Отправляю…' : 'Отправить!' }}
      </button>
    </template>
    <Waiting v-else :title="phase.subject ? 'Отличный кадр!' : 'Кадр в коллекции!'" :note="phase.subject ? 'Сейчас все будут его рисовать' : 'Ждём остальных фотографов'" icon="📸" />
  </div>
</template>

<style scoped>
.photo {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.task {
  padding: 12px 16px;
}

.label {
  font-size: 13px;
  font-weight: 900;
  color: #7a5fc0;
  text-transform: uppercase;
}

.prompt {
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
}

.frame {
  aspect-ratio: 1;
  width: min(100%, 46vh);
  align-self: center;
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: 0;
}

.frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.empty {
  font-size: 80px;
  opacity: 0.4;
}

.err {
  margin: 0;
  color: var(--red);
  font-weight: 800;
  text-align: center;
}
</style>
