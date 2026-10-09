import type { LocationId } from './protocol.js';

/**
 * Scenes inside a place: the same trip moved somewhere else halfway through a round, with its own
 * backdrop and questions («Лагерь» → «На каноэ»). The place itself is the opening scene and is not
 * listed. Every scene here needs a backdrop in client/src/host/backdrop/variants.ts and a narrator
 * line in server/content/scenes.ts; the content tests hold all three together.
 */
export const PLACE_SCENES: Partial<Record<LocationId, Record<string, string>>> = {
  camp: { canoe: 'На каноэ', lost: 'Заблудились в лесу' },
  jungle: { safari: 'Сафари' },
  school: { exam: 'Экзамен', lunch: 'Большая перемена', bus: 'Школьный автобус', detention: 'После уроков', theatre: 'Театральный кружок' },
  plane: { airport: 'Аэропорт' },
  city: { sights: 'Экскурсия', hotel: 'Гостиница' },
  roadtrip: { hitchhike: 'Автостоп', breakdown: 'Поломка в ночи' },
  party: { rock: 'Рок-концерт', birthday: 'День рождения' },
  karaoke: { band: 'Своя группа' },
  mystery: { seance: 'Салон гадалки', crime: 'Место преступления', heist: 'Ограбление банка', jail: 'Побег из тюрьмы' },
  cinema: { drivein: 'Кино под открытым небом' },
  lab: { time: 'Машина времени' },
  pumpkin: { trick: 'Сласти или напасти' },
  restaurant: { candles: 'Ужин при свечах' },
  fair: { ferris: 'Колесо обозрения', bumper: 'Автодром', fireworks: 'Фейерверк' },
  circus: { magic: 'Магическое шоу' },
  feast: { kitchen: 'На кухне' },
  museum: { studio: 'Рисование с натуры' },
  gym: { dance: 'Танцкласс', karate: 'Додзё' },
};

/** The scenes of a place in a stable order; empty for a place that has none. */
export function placeScenes(location: LocationId): string[] {
  return Object.keys(PLACE_SCENES[location] ?? {});
}
