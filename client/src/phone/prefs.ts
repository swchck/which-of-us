import { reactive, watch } from 'vue';

const KEY = 'kto.prefs';

/** Per-phone display preferences; they never leave the device. */
export const prefs = reactive({ big: false, contrast: false, vibration: true, sound: true });

try {
  Object.assign(prefs, JSON.parse(localStorage.getItem(KEY) ?? '{}'));
} catch {
  // private mode or a mangled value: defaults it is
}

watch(prefs, () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // private mode: the choice lasts until the tab closes
  }
});
