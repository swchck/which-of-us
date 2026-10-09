import { TEAM_INFO } from '../../../shared/catalog';
import type { PublicPlayer } from '../../../shared/protocol';

export interface TeamTotal {
  team: number;
  icon: string;
  title: string;
  color: string;
  score: number;
  members: PublicPlayer[];
}

/**
 * Teams in play with their points, best first; empty outside team games. One team means a game for
 * two. A smaller team's sum is scaled up to the biggest team's size, as the server does for the win.
 */
export function teamTotals(players: readonly PublicPlayer[]): TeamTotal[] {
  const teams = new Map<number, TeamTotal>();
  for (const p of players) {
    if (p.team === undefined) continue;
    const info = TEAM_INFO[p.team] ?? TEAM_INFO[0];
    const t = teams.get(p.team) ?? { team: p.team, icon: info.icon, title: info.title, color: info.color, score: 0, members: [] };
    t.score += p.score;
    t.members.push(p);
    teams.set(p.team, t);
  }
  const biggest = Math.max(0, ...[...teams.values()].map((t) => t.members.length));
  for (const t of teams.values()) t.score = Math.round((t.score * biggest) / t.members.length);
  const list = [...teams.values()].sort((a, b) => b.score - a.score);
  // a pair shares one score, and «Огненные» would be an odd name for two people on a sofa
  if (list.length === 1) Object.assign(list[0]!, { icon: '🤝', title: 'Вместе' });
  return list;
}
