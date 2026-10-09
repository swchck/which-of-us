import type { Component } from 'vue';

/**
 * Backdrops of the scenes in shared/scenes.ts, keyed `place/scene`. Each is its own chunk, like the
 * places: a party downloads only the scenes its rounds pass through.
 */
export const VARIANT_LOADERS: Record<string, () => Promise<{ default: Component }>> = {
  'school/exam': () => import('./SchoolExam.vue'),
  'school/lunch': () => import('./SchoolLunch.vue'),
  'school/bus': () => import('./SchoolBus.vue'),
  'school/detention': () => import('./SchoolDetention.vue'),
  'school/theatre': () => import('./SchoolTheatre.vue'),
  'camp/canoe': () => import('./CampCanoe.vue'),
  'camp/lost': () => import('./CampLost.vue'),
  'jungle/safari': () => import('./JungleSafari.vue'),
  'plane/airport': () => import('./PlaneAirport.vue'),
  'city/sights': () => import('./CitySights.vue'),
  'city/hotel': () => import('./CityHotel.vue'),
  'roadtrip/hitchhike': () => import('./RoadtripHitchhike.vue'),
  'roadtrip/breakdown': () => import('./RoadtripBreakdown.vue'),
  'party/rock': () => import('./PartyRock.vue'),
  'party/birthday': () => import('./PartyBirthday.vue'),
  'karaoke/band': () => import('./KaraokeBand.vue'),
  'mystery/seance': () => import('./MysterySeance.vue'),
  'mystery/crime': () => import('./MysteryCrime.vue'),
  'mystery/heist': () => import('./MysteryHeist.vue'),
  'mystery/jail': () => import('./MysteryJail.vue'),
  'cinema/drivein': () => import('./CinemaDrivein.vue'),
  'lab/time': () => import('./LabTime.vue'),
  'pumpkin/trick': () => import('./PumpkinTrick.vue'),
  'restaurant/candles': () => import('./RestaurantCandles.vue'),
  'fair/ferris': () => import('./FairFerris.vue'),
  'fair/bumper': () => import('./FairBumper.vue'),
  'fair/fireworks': () => import('./FairFireworks.vue'),
  'circus/magic': () => import('./CircusMagic.vue'),
  'feast/kitchen': () => import('./FeastKitchen.vue'),
  'museum/studio': () => import('./MuseumStudio.vue'),
  'gym/dance': () => import('./GymDance.vue'),
  'gym/karate': () => import('./GymKarate.vue'),
};
