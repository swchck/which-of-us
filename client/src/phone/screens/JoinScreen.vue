<script setup lang="ts">
import { computed, ref } from 'vue';
import { NAME_MAX, PLAYER_COLORS } from '../../../../shared/protocol';
import { join, socket, state } from '../store';

const NAME_KEY = 'kto-iz-nas:name';

function storedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

const code = ref(state.code);
const name = ref(storedName());
const color = ref(Math.floor(Math.random() * PLAYER_COLORS.length));

const valid = computed(() => /^\d{4}$/.test(code.value) && name.value.trim().length > 0);

function submit(): void {
  if (!valid.value || state.joining) return;
  try {
    localStorage.setItem(NAME_KEY, name.value.trim());
  } catch {
    // private mode can refuse storage; remembering the name is only a convenience
  }
  join(code.value, name.value.trim(), color.value);
}
</script>

<template>
  <form class="join" @submit.prevent="submit">
    <div class="logo pop-in">
      <span class="display">Кто</span>
      <span class="display">из нас?</span>
    </div>

    <label class="field">
      <span>Код комнаты с экрана</span>
      <input
        v-model="code"
        class="code display"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="4"
        autocomplete="off"
        placeholder="0000"
        @input="code = code.replace(/\D/g, '').slice(0, 4)"
      />
    </label>

    <label class="field">
      <span>Ваше имя</span>
      <input v-model="name" :maxlength="NAME_MAX" autocomplete="nickname" placeholder="Например, Аня" enterkeyhint="go" />
    </label>

    <div class="field">
      <span>Цвет</span>
      <div class="colors">
        <button
          v-for="(c, i) in PLAYER_COLORS"
          :key="c"
          type="button"
          class="color"
          :class="{ on: color === i }"
          :style="{ background: c }"
          :aria-label="`Цвет ${i + 1}`"
          @click="color = i"
        ></button>
      </div>
    </div>

    <p v-if="state.error" class="error">{{ state.error }}</p>
    <p v-if="state.kicked" class="error">Вас убрали из комнаты</p>

    <button class="btn pink go" type="submit" :disabled="!valid || state.joining || socket.status.value !== 'open'">
      {{ state.joining ? 'Подключаюсь…' : 'Играть!' }}
    </button>
  </form>
</template>

<style scoped>
.join {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px 4px 24px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0 6px;
  transform: rotate(-3deg);
}

.logo span {
  font-size: 44px;
  font-weight: 900;
  line-height: 1;
  color: var(--yellow);
  text-shadow:
    0 4px 0 var(--ink),
    4px 0 0 var(--ink),
    -4px 0 0 var(--ink),
    0 -4px 0 var(--ink),
    0 8px 0 var(--pink);
}

.logo span + span {
  color: #fff;
  font-size: 38px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 800;
  color: var(--muted);
}

input {
  font: inherit;
  font-size: 22px;
  font-weight: 800;
  padding: 14px 16px;
  border-radius: 16px;
  border: var(--line) solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 4px 0 var(--ink);
  outline: none;
  width: 100%;
}

input:focus {
  background: #fff;
  box-shadow:
    0 4px 0 var(--ink),
    0 0 0 4px var(--cyan);
}

.code {
  text-align: center;
  font-size: 38px;
  letter-spacing: 0.3em;
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
  transition: transform 120ms;
}

.color.on {
  transform: scale(1.2);
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 6px var(--ink);
}

.error {
  margin: 0;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--red);
  border: 3px solid var(--ink);
  font-weight: 800;
}

.go {
  margin-top: 6px;
  font-size: 22px;
  min-height: 64px;
}
</style>
