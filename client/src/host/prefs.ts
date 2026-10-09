import { ref, watchEffect } from 'vue';

const KEY = 'kto.lessMotion';

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** Per-TV switch that freezes the backdrop and skips confetti. */
export const lessMotion = ref(read());

watchEffect(() => document.documentElement.classList.toggle('less-motion', lessMotion.value));

export function setLessMotion(on: boolean): void {
  lessMotion.value = on;
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    // private mode: the choice just lasts until the page reloads
  }
}
