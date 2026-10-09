import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CustomQuestion, Settings } from '../shared/protocol.js';
import type { Asset } from './room.js';

/**
 * What survives a server restart: who is in each room and how to recognise their phones and TV,
 * plus the evening's tally. A game in progress does not survive; its room comes back in the lobby.
 */
export interface RoomSnapshot {
  code: string;
  hostToken: string;
  savedAt: number;
  settings: Settings;
  players: { id: string; token: string; name: string; color: number; selfie?: string; vip: boolean; bot: boolean }[];
  custom: CustomQuestion[];
  gamesPlayed: number;
  wins: [string, number][];
  /** Ids and types of the selfies the players point at; the bytes live next to the snapshot. */
  assets: { id: string; mime: string }[];
}

const STATE_FILE = 'rooms.json';
const ASSET_DIR = 'assets';
/** An unchanged state is still rewritten this often, so `savedAt` keeps active rooms from expiring. */
const REFRESH_MS = 10 * 60_000;

/** Keeps room snapshots in one JSON file and selfies as files beside it, written atomically. */
export class RoomStore {
  private readonly assetDir: string;
  private lastContent = '';
  private lastWrite = 0;

  constructor(private readonly dir: string) {
    this.assetDir = join(dir, ASSET_DIR);
    mkdirSync(this.assetDir, { recursive: true });
  }

  load(maxAgeMs: number): { snapshot: RoomSnapshot; assets: Map<string, Asset> }[] {
    const file = join(this.dir, STATE_FILE);
    if (!existsSync(file)) return [];
    let snapshots: unknown;
    try {
      snapshots = JSON.parse(readFileSync(file, 'utf8'));
    } catch (err) {
      console.error('room state unreadable, starting fresh:', err);
      return [];
    }
    if (!Array.isArray(snapshots)) return [];
    const now = Date.now();
    const rooms: { snapshot: RoomSnapshot; assets: Map<string, Asset> }[] = [];
    // one damaged room must not keep the server (and the desktop app) from starting at all
    for (const snapshot of snapshots as RoomSnapshot[]) {
      try {
        if (now - snapshot.savedAt >= maxAgeMs) continue;
        const assets = new Map<string, Asset>();
        for (const a of snapshot.assets) {
          const path = join(this.assetDir, assetFile(snapshot.code, a.id));
          if (existsSync(path)) assets.set(a.id, { mime: a.mime, data: readFileSync(path) });
        }
        rooms.push({ snapshot, assets });
      } catch (err) {
        console.error('skipping an unreadable saved room:', err);
      }
    }
    return rooms;
  }

  save(rooms: { snapshot: RoomSnapshot; asset: (id: string) => Asset | undefined }[]): void {
    // every answer mid-game asks for a save, yet a running game is not part of the snapshot
    const content = JSON.stringify(rooms.map((r) => ({ ...r.snapshot, savedAt: 0 })));
    if (content === this.lastContent && Date.now() - this.lastWrite < REFRESH_MS) return;
    this.lastContent = content;
    this.lastWrite = Date.now();
    const keep = new Set<string>();
    for (const { snapshot, asset } of rooms) {
      for (const a of snapshot.assets) {
        const name = assetFile(snapshot.code, a.id);
        keep.add(name);
        const path = join(this.assetDir, name);
        const data = asset(a.id)?.data;
        // asset ids are never reused, so a file that exists is already the right one
        if (data && !existsSync(path)) writeAtomic(path, data);
      }
    }
    writeAtomic(join(this.dir, STATE_FILE), JSON.stringify(rooms.map((r) => r.snapshot)));
    for (const name of readdirSync(this.assetDir)) {
      if (!keep.has(name)) rmSync(join(this.assetDir, name), { force: true });
    }
  }
}

function assetFile(code: string, id: string): string {
  return `${code}-${id}`;
}

function writeAtomic(path: string, data: string | Buffer): void {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, data);
  renameSync(tmp, path);
}
