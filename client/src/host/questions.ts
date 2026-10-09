import { ref } from 'vue';
import type { QuestionDraft } from '../../../shared/protocol';

const KEY = 'kto.questions';
const LIMIT = 200;

function read(): QuestionDraft[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? (raw as QuestionDraft[]).filter((q) => typeof q?.text === 'string') : [];
  } catch {
    return [];
  }
}

/** Questions written on this TV, kept across rooms so a favourite set can be sent again next time. */
export const library = ref<QuestionDraft[]>(read());

function write(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(library.value));
  } catch {
    // private mode: the library just lives as long as the page
  }
}

/** Adds a question to the library unless the same one is already there. */
export function remember(q: QuestionDraft): void {
  const same = (o: QuestionDraft) => (o.kind ?? 'vote') === (q.kind ?? 'vote') && o.text.toLowerCase() === q.text.toLowerCase();
  if (library.value.some(same)) return;
  library.value = [q, ...library.value].slice(0, LIMIT);
  write();
}

/** Removes a question from the library. */
export function forget(q: QuestionDraft): void {
  library.value = library.value.filter((o) => o !== q);
  write();
}
