/**
 * «Сказочник»: everyone draws on one theme, then a teller hides their drawing behind a clue.
 * Themes stay loose and dreamy, so the drawings differ and a clue can point at one of them.
 */
export const taleThemes: string[] = [
  'Самый странный сон',
  'Место, где хочется оказаться прямо сейчас',
  'Чудовище, которое живёт под кроватью',
  'Волшебная дверь',
  'Город будущего',
  'Секрет, который хранит море',
  'Праздник у инопланетян',
  'Дом мечты',
  'Тайна старого чердака',
  'Самое уютное утро',
  'Остров, которого нет на карте',
  'Портрет вашего настроения',
  'Невероятная машина',
  'Звёздная ночь в лесу',
];

/** Clues a bot teller gives; vague on purpose, as a bot cannot look at its own doodle. */
export const taleBotClues: string[] = [
  'Кажется, это мне уже снилось',
  'Тихо, но очень ярко',
  'Это случилось однажды вечером',
  'Немного грусти и много чудес',
  'Сюда не пускают взрослых',
];
