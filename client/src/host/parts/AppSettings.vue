<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { TTS_INFO } from '../../../../shared/catalog';
import { audio, type VolumeKey } from '../../common/audio';
import Emoji from '../../common/Emoji.vue';
import Icon from '../../common/Icon.vue';
import { isFullscreen, toggleFullscreen } from '../fullscreen';
import { lessMotion, setLessMotion } from '../prefs';
import { logs, saveLogs, send, view } from '../store';
import SwitchRow from './SwitchRow.vue';

const emit = defineEmits<{ close: [] }>();

const VOLUME_TITLES: Record<VolumeKey, string> = { master: 'Общая громкость', sfx: 'Звуки игры', music: 'Громкость музыки', voice: 'Громкость голоса' };

const percent = (key: VolumeKey) => Math.round(audio.volumes.value[key] * 100);
const setVolume = (key: VolumeKey, ev: Event) => audio.setVolume(key, +(ev.target as HTMLInputElement).value / 100);

// the change event fires on release; the sample lets the host hear the new level, music is audible already
function heard(key: VolumeKey): void {
  if (key === 'voice') audio.previewVoice();
  else if (key !== 'music') audio.sfx('ding');
}

function room(key: 'narrator' | 'music'): void {
  if (view.value) send({ t: 'host.settings', settings: { [key]: !view.value.settings[key] } });
}

// neural voices by name, then the computer's own as one choice: each OS brings a different one, and
// an empty name lets the browser pick its best Russian voice
const SYSTEM_VOICE = 'system:';
const voiceOptions = computed(() => [
  ...audio.engines.value.flatMap((e) => Object.entries(TTS_INFO[e].voices).map(([id, v]) => ({ value: `${e}:${id}`, title: v.title }))),
  ...(audio.voices.value.length ? [{ value: SYSTEM_VOICE, title: 'Системный' }] : []),
]);
// a lone voice leaves nothing to pick
const choices = computed(() => (voiceOptions.value.length > 1 ? voiceOptions.value : []));
const chosen = (o: { value: string }) => o.value === audio.voiceChoice.value || (o.value === SYSTEM_VOICE && audio.voiceChoice.value.startsWith(SYSTEM_VOICE));

const card = ref<HTMLElement>();

// capture on window: the host's N/F/M/Space shortcuts must stay quiet while the menu is open
function onKey(ev: KeyboardEvent): void {
  if (ev.key === 'Escape') emit('close');
  else if (ev.code === 'Space' || ev.code.startsWith('Key')) ev.stopPropagation();
}
onMounted(() => {
  window.addEventListener('keydown', onKey, true);
  card.value?.focus();
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey, true));
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div ref="card" class="card sticker" role="dialog" aria-modal="true" aria-labelledby="app-settings-title" tabindex="-1">
      <div class="head">
        <h2 id="app-settings-title" class="display">Настройки приложения</h2>
        <button class="close" aria-label="Закрыть" @click="emit('close')"><Icon name="close" /></button>
      </div>

      <div class="cols">
        <div class="col">
          <section>
            <h3><Emoji char="🔊" /> Звук</h3>
            <label v-for="key in ['master', 'sfx'] as VolumeKey[]" :key="key" class="slider">
              <span class="stitle">{{ VOLUME_TITLES[key] }}</span>
              <b class="pct">{{ percent(key) }}%</b>
              <input type="range" min="0" max="100" step="5" :value="percent(key)" :style="{ '--fill': `${percent(key)}%` }" @input="setVolume(key, $event)" @change="heard(key)" />
            </label>
            <SwitchRow v-if="view" title="Музыка" :on="view.settings.music" @flip="room('music')" />
            <label class="slider" :class="{ dim: view && !view.settings.music }">
              <span class="stitle">{{ VOLUME_TITLES.music }}</span>
              <b class="pct">{{ percent('music') }}%</b>
              <input type="range" min="0" max="100" step="5" :value="percent('music')" :style="{ '--fill': `${percent('music')}%` }" @input="setVolume('music', $event)" />
            </label>
          </section>


          <section>
            <h3><Emoji char="🖥️" /> Экран</h3>
            <SwitchRow title="Во весь экран" :on="isFullscreen" @flip="void toggleFullscreen()" />
            <SwitchRow title="Меньше анимации" note="Фон замирает, конфетти не летит" :on="lessMotion" @flip="setLessMotion(!lessMotion)" />
          </section>
        </div>

        <div class="col">
          <section>
            <h3><Emoji char="🎙️" /> Ведущий</h3>
            <SwitchRow v-if="view" title="Говорит вслух" note="Выключите, и реплики останутся только на экране" :on="view.settings.narrator" @flip="room('narrator')" />
            <div v-if="choices.length" class="chips" role="radiogroup" aria-label="Голос ведущего">
              <button
                v-for="o in choices"
                :key="o.value"
                class="chip"
                :class="{ on: chosen(o) }"
                role="radio"
                :aria-checked="chosen(o)"
                @click="audio.chooseVoice(o.value)"
              >
                {{ o.title }}
              </button>
              <button class="chip listen" @click="audio.previewVoice()"><Icon name="voice" /> Прослушать</button>
            </div>
            <label class="slider" :class="{ dim: view && !view.settings.narrator }">
              <span class="stitle">{{ VOLUME_TITLES.voice }}</span>
              <b class="pct">{{ percent('voice') }}%</b>
              <input type="range" min="0" max="100" step="5" :value="percent('voice')" :style="{ '--fill': `${percent('voice')}%` }" @input="setVolume('voice', $event)" @change="heard('voice')" />
            </label>
            <p class="note">Голос и громкость хранятся на этом компьютере и не зависят от игры.</p>
          </section>

          <section v-if="view?.httpsAvailable">
            <h3><Emoji char="📱" /> Подключение телефонов</h3>
            <SwitchRow
              title="Датчики наклона (HTTPS)"
              :note="
                view.settings.secure
                  ? 'Телефон покажет предупреждение о сертификате — нажмите «Подробнее» → «Перейти на сайт». Один раз.'
                  : 'Без этого в «Звездопаде» управляют пальцем. Включите до того, как игроки подключатся.'
              "
              :on="view.settings.secure"
              @flip="send({ t: 'host.settings', settings: { secure: !view.settings.secure } })"
            />
          </section>

          <section v-if="logs">
            <h3><Emoji char="🛟" /> Помощь</h3>
            <p class="note">Что-то не работает? Соберите логи в архив и отправьте разработчику.</p>
            <button v-if="logs.state !== 'saved'" class="btn ghost" :disabled="logs.state === 'saving'" @click="saveLogs">
              {{ logs.state === 'saving' ? 'Собираю…' : logs.state === 'failed' ? 'Не получилось — ещё раз?' : 'Собрать логи' }}
            </button>
            <p v-else class="saved">Архив на рабочем столе: <code>{{ logs.file }}</code></p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(18, 6, 42, 0.7);
}

.card {
  zoom: var(--stage-scale, 1);
  width: 1000px;
  max-height: 940px;
  overflow-y: auto;
  padding: 32px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: pop-in 300ms both;
}

.card:focus {
  outline: none;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

h2 {
  margin: 0;
  font-size: 44px;
}

.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.col,
section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.col {
  gap: 28px;
}

h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
}

.note {
  margin: 0;
  color: #6b5a99;
  font-size: 20px;
  font-weight: 700;
}

.close {
  flex: none;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 3px solid var(--ink);
  background: #fff;
  color: var(--ink);
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 3px 0 var(--ink);
}


.slider {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  row-gap: 4px;
}

.stitle {
  font-size: 22px;
  font-weight: 800;
}

.pct {
  font-family: var(--font-display);
  font-size: 22px;
}

.slider.dim {
  opacity: 0.45;
}

.slider input {
  grid-column: 1 / -1;
  appearance: none;
  width: 100%;
  height: 44px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}

.slider input::-webkit-slider-runnable-track {
  height: 22px;
  border: 3px solid var(--ink);
  border-radius: 999px;
  background: linear-gradient(to right, var(--yellow) var(--fill), #fff var(--fill));
}

.slider input::-moz-range-track {
  height: 16px;
  border: 3px solid var(--ink);
  border-radius: 999px;
  background: linear-gradient(to right, var(--yellow) var(--fill), #fff var(--fill));
}

.slider input::-webkit-slider-thumb {
  appearance: none;
  width: 36px;
  height: 36px;
  margin-top: -10px;
  border: 3px solid var(--ink);
  border-radius: 50%;
  background: var(--paper);
  box-shadow: 0 3px 0 var(--ink);
}

.slider input::-moz-range-thumb {
  width: 30px;
  height: 30px;
  border: 3px solid var(--ink);
  border-radius: 50%;
  background: var(--paper);
  box-shadow: 0 3px 0 var(--ink);
}

.slider input:focus-visible {
  outline: 4px solid var(--pink);
  outline-offset: 2px;
  border-radius: 999px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.chip {
  min-height: 44px;
  padding: 8px 20px;
  border-radius: 16px;
  border: 3px dashed #c4b6e6;
  background: none;
  color: #6b5a99;
  font: inherit;
  font-size: 21px;
  font-weight: 700;
  cursor: pointer;
}

.chip.listen {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 3px solid var(--ink);
  background: #fff;
  color: var(--ink);
  box-shadow: 0 3px 0 var(--ink);
}

.chip.on {
  border: 3px solid var(--ink);
  background: var(--yellow);
  color: var(--ink);
  box-shadow: 3px 4px 0 var(--ink);
}

.chip:focus-visible,
.close:focus-visible {
  outline: 4px solid var(--pink);
  outline-offset: 3px;
}

.saved {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.saved code {
  word-break: break-all;
}
</style>
