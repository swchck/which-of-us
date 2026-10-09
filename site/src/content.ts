import generated from './generated.json';

export const REPO = 'https://github.com/swchck/which-of-us';
// fixed asset names the release workflow gives the installers, so «latest» always resolves to a file
const LATEST = `${REPO}/releases/latest/download`;
export const DOWNLOADS = [
  { os: 'mac', label: 'Скачать для macOS', href: `${LATEST}/kto-iz-nas-macos-arm64.dmg` },
  { os: 'win', label: 'Скачать для Windows', href: `${LATEST}/kto-iz-nas-windows-x64-setup.exe` },
] as const;

export const gameById = new Map(generated.games.map((g) => [g.id, g]));

/** Game ids per tab; an id the catalog no longer has is skipped, so a rename cannot break the page. */
export const GAME_TABS = [
  {
    id: 'know',
    label: 'Узнаём друг друга',
    lead: 'Кто что выберет, кто как ответит и кто сколько насчитает. Здесь выигрывает тот, кто лучше знает друзей.',
    games: ['predict', 'scale', 'wave', 'order', 'percent', 'closest', 'herd', 'never', 'years', 'even', 'odd', 'emoji'],
  },
  {
    id: 'draw',
    label: 'Рисуем',
    lead: 'Рисуют пальцем на телефонах, а общая картина собирается на экране ТВ.',
    games: ['guess', 'selfie', 'describe', 'monster', 'shared', 'copy', 'photo', 'mime'],
  },
  {
    id: 'write',
    label: 'Пишем и врём',
    lead: 'Выдумывают, дописывают, ловят на лжи. Имена открываются только в конце.',
    games: ['quote', 'lie', 'story', 'quip', 'blank', 'fib', 'rhyme', 'rush', 'tale', 'radio', 'plot', 'date'],
  },
  {
    id: 'move',
    label: 'Двигаемся',
    lead: 'Телефон работает как джойстик или датчик. Если включить HTTPS, «Звездопад» и другие игры слушаются наклона.',
    games: ['tilt', 'sumo', 'tag', 'tug', 'paint', 'ninja', 'shaker', 'freeze', 'simon', 'band', 'tap', 'reflex'],
  },
  {
    id: 'team',
    label: 'Все вместе',
    lead: 'Игры на слова, команды и подозрения: тут главное говорить и спорить.',
    games: ['mafia', 'hat', 'contact', 'clue', 'just', 'spy', 'truth', 'forehead', 'case', 'quiz', 'market', 'junk'],
  },
] as const;

export const STEPS = [
  {
    title: 'Откройте игру на ТВ',
    text: 'Запустите приложение на компьютере и выведите окно на телевизор. Или откройте адрес из лобби в браузере смарт-ТВ.',
    shot: ['tv-home', 'tv-lobby'],
    alt: 'Главный экран игры на ТВ',
  },
  {
    title: 'Отсканируйте QR-код',
    text: 'На экране появится код комнаты и QR. Гости наводят камеру телефона, вводят имя и фотографируют селфи. Приложения не нужны.',
    shot: ['phone-join', 'tv-lobby'],
    alt: 'Вход в игру с телефона',
  },
  {
    title: 'Играйте',
    text: 'Вопросы, рисование, погони и голосования идут на ТВ и телефонах одновременно. Ведущий Бублик озвучивает всё вслух.',
    shot: ['phone-vote', 'tv-question'],
    alt: 'Голосование на телефоне',
  },
] as const;

export const GALLERY = [
  { name: 'tv-home', kind: 'tv', caption: 'Главный экран' },
  { name: 'tv-lobby', kind: 'tv', caption: 'Лобби: код комнаты и игроки' },
  { name: 'tv-question', kind: 'tv', caption: 'Вопрос «Кто из нас?»' },
  { name: 'tv-reveal', kind: 'tv', caption: 'Итоги голосования' },
  { name: 'tv-draw', kind: 'tv', caption: 'Рисуем на телефонах' },
  { name: 'tv-active', kind: 'tv', caption: 'Активная игра на арене' },
  { name: 'tv-final', kind: 'tv', caption: 'Финал и награды' },
  { name: 'phone-join', kind: 'phone', caption: 'Вход по QR-коду' },
  { name: 'phone-lobby', kind: 'phone', caption: 'Лобби на телефоне' },
  { name: 'phone-vote', kind: 'phone', caption: 'Голосование' },
  { name: 'phone-draw', kind: 'phone', caption: 'Рисование' },
] as const;

export const FAQ = [
  {
    q: 'Гостям нужно ставить приложение?',
    a: 'Нет. Телефон открывает игру в обычном браузере по QR-коду. Установка нужна только на компьютере, который показывает игру на ТВ.',
  },
  {
    q: 'Нужен один Wi-Fi или интернет?',
    a: 'По умолчанию все сидят в одной сети Wi-Fi с компьютером. Если гости в разных местах, включите в настройках на ТВ переключатель «Через интернет»: телефоны зайдут по постоянному HTTPS-адресу из любой сети. После перезапуска приложения игра возвращается в режим Wi-Fi.',
  },
  {
    q: 'Сколько человек может играть?',
    a: 'От 2 до 8. Вдвоём можно играть с ботами: их добавляют кнопкой в лобби. Кто пришёл, когда партия уже идёт, становится зрителем: он голосует в вопросах без очков, а в следующей партии садится за стол.',
  },
  {
    q: 'Работает ли без интернета?',
    a: 'Да. Игре нужна только общая локальная сеть. Голос ведущего Артёма синтезируется на компьютере и тоже не ходит в интернет. Выход в сеть нужен лишь для режима «Через интернет».',
  },
  {
    q: 'Как вывести игру на телевизор?',
    a: 'Самый надёжный способ — HDMI-кабель. Подойдут также AirPlay, трансляция вкладки Chrome через Chromecast и браузер смарт-ТВ: на нём открывают адрес из лобби и нажимают «Создать игру».',
  },
  {
    q: 'Это бесплатно?',
    a: 'Да. Игра с открытым кодом под лицензией GPL-3.0, без рекламы и подписок. Исходники лежат на GitHub.',
  },
] as const;

export const CREDITS = [
  { name: 'Dela Gothic One, Rubik, Shantell Sans', what: 'шрифты', license: 'SIL OFL 1.1' },
  { name: 'Fluent Emoji (Microsoft)', what: 'эмодзи', license: 'MIT' },
  { name: 'Noto Emoji Animation (Google)', what: 'анимированные эмодзи', license: 'CC BY 4.0' },
  { name: 'Interface Sounds (Kenney)', what: 'звуки интерфейса', license: 'CC0' },
  { name: 'Vosk TTS', what: 'голос Артёма', license: 'Apache 2.0' },
] as const;

export const LICENSES_URL = `${REPO}/tree/master/client/public/licenses`;
