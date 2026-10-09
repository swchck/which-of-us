const icons = import.meta.glob<string>('../assets/emoji/*.webp', { eager: true, query: '?url', import: 'default' });
const animations = import.meta.glob<string>('../assets/lottie/*.json', { eager: true, query: '?url', import: 'default' });

/** Codepoints in hex joined by dashes, without variation selectors; the asset files are named this way. */
export function emojiKey(emoji: string): string {
  return [...emoji.replaceAll('️', '')].map((c) => c.codePointAt(0)!.toString(16)).join('-');
}

function byKey(files: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.')), url]));
}

const ICONS = byKey(icons);
const ANIMATIONS = byKey(animations);

/** Fluent 3D render of the emoji, when the game ships one. */
export function iconUrl(emoji: string): string | undefined {
  return ICONS.get(emojiKey(emoji));
}

/** Noto Lottie animation of the emoji, when the game ships one. */
export function animationUrl(emoji: string): string | undefined {
  return ANIMATIONS.get(emojiKey(emoji));
}

const graphemes = new Intl.Segmenter('ru', { granularity: 'grapheme' });

/** Splits a row of emoji into single pictures, keeping skin tones and ZWJ sequences whole. */
export function glyphs(row: string): string[] {
  return [...graphemes.segment(row)].map((g) => g.segment).filter((g) => g.trim());
}
