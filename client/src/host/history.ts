const KEY = 'kto-host-history-v1';

interface HostHistory {
  games: Record<string, number>;
  places: Record<string, number>;
}

function load(): HostHistory {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { games: {}, places: {} };
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return { games: {}, places: {} };
    const h = parsed as Record<string, unknown>;
    return {
      games: typeof h['games'] === 'object' && h['games'] !== null ? (h['games'] as Record<string, number>) : {},
      places: typeof h['places'] === 'object' && h['places'] !== null ? (h['places'] as Record<string, number>) : {},
    };
  } catch {
    return { games: {}, places: {} };
  }
}

function save(h: HostHistory): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(h));
  } catch { /* localStorage unavailable */ }
}

export function recordGame(id: string): void {
  const h = load();
  h.games[id] = (h.games[id] ?? 0) + 1;
  save(h);
}

export function recordPlace(id: string): void {
  const h = load();
  h.places[id] = (h.places[id] ?? 0) + 1;
  save(h);
}

export function gameCount(id: string): number {
  return load().games[id] ?? 0;
}

export function placeCount(id: string): number {
  return load().places[id] ?? 0;
}
