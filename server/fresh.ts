import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

/** Remembered keys per kind: enough for the biggest bank, all places together, so nothing seen is forgotten as unseen. */
const KEEP_PER_KIND = 10_000;
const SAVE_DEBOUNCE_MS = 5000;

/**
 * Remembers when each question, place and mini-game last came up, across rooms and restarts,
 * so the next evening starts with what nobody has heard for longest.
 */
export class FreshnessLog {
  private used: Record<string, Record<string, number>> = {};
  private timer: ReturnType<typeof setTimeout> | undefined;
  private clock = 0;

  /** Without a file the log lives as long as the process, which still helps rooms opened later. */
  constructor(private readonly file?: string) {
    if (!file || !existsSync(file)) return;
    try {
      this.used = JSON.parse(readFileSync(file, 'utf8')) as Record<string, Record<string, number>>;
    } catch (err) {
      console.error('freshness log unreadable, starting fresh:', err);
    }
  }

  /** When this key was last used; 0 when never, so unused things sort first. */
  lastUsed(kind: string, key: string): number {
    return this.used[kind]?.[key] ?? 0;
  }

  mark(kind: string, key: string): void {
    const bucket = (this.used[kind] ??= {});
    // a plain Date.now() ties for items marked in the same millisecond, which would make the order arbitrary
    this.clock = Math.max(this.clock + 1, Date.now());
    bucket[key] = this.clock;
    const keys = Object.keys(bucket);
    if (keys.length > KEEP_PER_KIND) {
      for (const old of keys.sort((a, b) => bucket[a]! - bucket[b]!).slice(0, keys.length - KEEP_PER_KIND)) {
        delete bucket[old];
      }
    }
    this.scheduleSave();
  }

  flush(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    if (!this.file) return;
    try {
      const tmp = `${this.file}.tmp`;
      writeFileSync(tmp, JSON.stringify(this.used));
      renameSync(tmp, this.file);
    } catch (err) {
      console.error('saving the freshness log failed:', err);
    }
  }

  private scheduleSave(): void {
    if (!this.file || this.timer) return;
    this.timer = setTimeout(() => this.flush(), SAVE_DEBOUNCE_MS);
    this.timer.unref?.();
  }
}
