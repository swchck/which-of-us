import { computed, ref } from 'vue';
import { inTauri } from './fullscreen';

/**
 * The downloadable half of the voice.
 *
 * The light desktop build ships without it: the rendered lines and the speech engine together are
 * more than a gigabyte, which is most of the installer for something not every player wants. They
 * are fetched on first run instead, and a full build with them already inside stays available for
 * a computer with no connection.
 *
 * Everything here happens in the Tauri shell — it owns the data directory and the server process
 * that has to come back once the files are there.
 */
export type PartId = 'lines' | 'engine';

export interface Part {
  id: PartId;
  /** Download size in bytes, from the release manifest. */
  size: number;
}

/** What each part is, in the words the screen uses. */
export const ABOUT: Record<PartId, { title: string; note: string }> = {
  lines: { title: 'Озвученные вопросы', note: 'Записаны заранее, звучат сразу' },
  engine: { title: 'Голос «Артём»', note: 'Произносит имена игроков вслух' },
};

export const parts = ref<Part[]>([]);
export const installed = ref<PartId[]>([]);
/** Bytes transferred so far, per part. */
export const done = ref<Partial<Record<PartId, number>>>({});
export const downloading = ref<PartId[]>([]);
export const failure = ref('');
/** False until the catalogue has been asked for, so the screen does not offer an empty list. */
export const known = ref(false);

export const percent = computed(() => {
  const total = downloading.value.reduce((sum, id) => sum + size(id), 0);
  if (!total) return 0;
  const got = downloading.value.reduce((sum, id) => sum + (done.value[id] ?? 0), 0);
  return Math.min(100, Math.round((got / total) * 100));
});

export function size(id: PartId): number {
  return parts.value.find((p) => p.id === id)?.size ?? 0;
}

export function missing(): Part[] {
  return parts.value.filter((p) => !installed.value.includes(p.id));
}

interface Progress {
  id: PartId;
  received: number;
  total: number;
}

let listening = false;
let asked = false;

/** Asks the shell what the release offers and what this computer already has. */
export async function load(): Promise<void> {
  if (!inTauri || asked) return;
  asked = true;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const state = await invoke<{ parts: Part[]; present: PartId[] }>('voice_state');
    parts.value = state.parts;
    installed.value = state.present;
    failure.value = '';
  } catch (err) {
    // no release to ask, or no network: the screen says so rather than offering nothing
    failure.value = String(err);
  }
  known.value = true;

  if (listening) return;
  listening = true;
  const { listen } = await import('@tauri-apps/api/event');
  await listen<Progress>('voice:progress', (event) => {
    done.value = { ...done.value, [event.payload.id]: event.payload.received };
  });
}

/**
 * Downloads the chosen parts. The shell drops the game server when it finishes, which is how the
 * voice gets picked up: the server looks for it once, at startup, and the page reconnects to the
 * same port on its own.
 */
export async function cancel(): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke('voice_cancel');
}

export async function start(ids: PartId[]): Promise<void> {
  failure.value = '';
  done.value = {};
  downloading.value = ids;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('voice_install', { parts: ids });
    installed.value = [...new Set([...installed.value, ...ids])];
  } catch (err) {
    failure.value = String(err);
  }
  downloading.value = [];
}
