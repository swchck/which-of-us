import type { LocationId } from '../../../shared/protocol.js';
import type { PlaceContent } from '../types.js';
import { arcade } from './arcade.js';
import { beach } from './beach.js';
import { bowling } from './bowling.js';
import { camp } from './camp.js';
import { candy } from './candy.js';
import { castle } from './castle.js';
import { cinema } from './cinema.js';
import { circus } from './circus.js';
import { city } from './city.js';
import { dacha } from './dacha.js';
import { desert } from './desert.js';
import { dino } from './dino.js';
import { egypt } from './egypt.js';
import { fair } from './fair.js';
import { farm } from './farm.js';
import { forest } from './forest.js';
import { future } from './future.js';
import { gym } from './gym.js';
import { japan } from './japan.js';
import { jungle } from './jungle.js';
import { karaoke } from './karaoke.js';
import { lab } from './lab.js';
import { market } from './market.js';
import { mine } from './mine.js';
import { museum } from './museum.js';
import { newYear } from './newyear.js';
import { ocean } from './ocean.js';
import { office } from './office.js';
import { party } from './party.js';
import { pirate } from './pirate.js';
import { plane } from './plane.js';
import { pumpkin } from './pumpkin.js';
import { race } from './race.js';
import { restaurant } from './restaurant.js';
import { school } from './school.js';
import { ski } from './ski.js';
import { sky } from './sky.js';
import { snow } from './snow.js';
import { space } from './space.js';
import { stadium } from './stadium.js';
import { train } from './train.js';
import { volcano } from './volcano.js';
import { wedding } from './wedding.js';
import { zoo } from './zoo.js';
import { repair } from './repair.js';
import { clinic } from './clinic.js';
import { commute } from './commute.js';
import { moving } from './moving.js';
import { feast } from './feast.js';
import { roadtrip } from './roadtrip.js';
import { mystery } from './mystery.js';

/** Every place's own questions and mini-game material, one file per place; the content test checks that none is missing. */
export const placeContent: Record<LocationId, PlaceContent> = {
  arcade,
  beach,
  bowling,
  camp,
  candy,
  castle,
  cinema,
  circus,
  city,
  dacha,
  desert,
  dino,
  egypt,
  fair,
  farm,
  forest,
  future,
  gym,
  japan,
  jungle,
  karaoke,
  lab,
  market,
  mine,
  museum,
  newyear: newYear,
  ocean,
  office,
  party,
  pirate,
  plane,
  pumpkin,
  race,
  restaurant,
  school,
  ski,
  sky,
  snow,
  space,
  stadium,
  train,
  volcano,
  wedding,
  zoo,
  repair,
  clinic,
  commute,
  moving,
  feast,
  roadtrip,
  mystery,
};
