import { ref } from 'vue';
import { GAMES, LOCATIONS, type GameId, type LocationId, type PackId, type Pace } from '../../../shared/protocol';

/** A full game recipe: which mini-games, places and question packs, and how fast. */
export interface Preset {
  name: string;
  icon: string;
  games: GameId[];
  locations: LocationId[];
  packs: PackId[];
  pace: Pace;
}

const ALL_GAMES = [...GAMES];
const ALL_PLACES = [...LOCATIONS];

export const BUILT_IN: Preset[] = [
  { name: 'Всё подряд', icon: '🎉', games: ALL_GAMES, locations: ALL_PLACES, packs: ['party'], pace: 'normal' },
  {
    name: 'Разговорный',
    icon: '💬',
    games: ['predict', 'scale', 'quote', 'lie', 'story', 'never', 'emoji'],
    locations: ALL_PLACES,
    packs: ['party', 'whatif'],
    pace: 'normal',
  },
  {
    name: 'Художники',
    icon: '🎨',
    games: ['guess', 'selfie', 'describe', 'monster', 'shared'],
    locations: ALL_PLACES,
    packs: ['party'],
    pace: 'relaxed',
  },
  {
    name: 'Активный',
    icon: '⚡',
    games: ['tilt', 'reflex', 'tap', 'guess', 'photo', 'predict'],
    locations: ['party', 'arcade', 'city', 'beach', 'desert', 'circus', 'dino'],
    packs: ['party'],
    pace: 'brisk',
  },
  {
    name: 'Семейный',
    icon: '🏡',
    games: ['predict', 'scale', 'guess', 'selfie', 'describe', 'monster', 'shared', 'story', 'tilt', 'reflex', 'tap', 'emoji'],
    locations: ['camp', 'ocean', 'jungle', 'snow', 'beach', 'space', 'farm', 'circus', 'dino', 'dacha', 'zoo', 'school'],
    packs: ['family', 'party'],
    pace: 'relaxed',
  },
  {
    name: 'Офисный',
    icon: '💼',
    games: ['predict', 'scale', 'quote', 'lie', 'guess', 'describe', 'reflex', 'never', 'emoji'],
    locations: ['office', 'city', 'karaoke', 'bowling', 'plane', 'restaurant', 'cinema'],
    packs: ['party', 'whatif'],
    pace: 'brisk',
  },
  { name: 'Для взрослых', icon: '🌶️', games: ALL_GAMES, locations: ['party', 'city', 'karaoke', 'wedding', 'castle'], packs: ['party', 'spicy'], pace: 'normal' },
  { name: 'Новогодний', icon: '🎄', games: ALL_GAMES, locations: ['newyear', 'snow', 'ski', 'party'], packs: ['party', 'family'], pace: 'normal' },
];

const KEY = 'kto.presets';

function load(): Preset[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
    return Array.isArray(raw) ? (raw as Preset[]) : [];
  } catch {
    return [];
  }
}

/** Recipes saved on this TV; they live in its browser storage only. */
export const saved = ref<Preset[]>(load());

export function savePreset(preset: Preset): void {
  saved.value = [...saved.value.filter((p) => p.name !== preset.name), preset];
  persist();
}

export function dropPreset(name: string): void {
  saved.value = saved.value.filter((p) => p.name !== name);
  persist();
}

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(saved.value));
  } catch {
    // private mode: the preset lasts until the page reloads
  }
}

/** Whether the room's current settings are exactly this recipe, order aside. */
export function matches(p: Preset, s: { games: string[]; locations: string[]; packs: string[]; pace: Pace }): boolean {
  const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));
  return same(p.games, s.games) && same(p.locations, s.locations) && same(p.packs, s.packs) && p.pace === s.pace;
}
