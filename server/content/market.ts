/**
 * «Рынок слухов»: small mysteries of three questions with four answers each. Every player gets
 * clues that rule out wrong answers, so the case only cracks when people trade what they know.
 */
export interface MarketCase {
  title: string;
  categories: { title: string; options: string[] }[];
}

export const marketCases: MarketCase[] = [
  {
    title: 'Кто съел праздничный торт?',
    categories: [
      { title: 'Кто', options: ['Енот', 'Кот', 'Попугай', 'Хомяк'] },
      { title: 'Где', options: ['на кухне', 'в саду', 'на чердаке', 'в гараже'] },
      { title: 'Чем', options: ['ложкой', 'вилкой', 'лапой', 'половником'] },
    ],
  },
  {
    title: 'Кто спрятал пульт от телевизора?',
    categories: [
      { title: 'Кто', options: ['Бабушка', 'Пёс', 'Младший брат', 'Робот-пылесос'] },
      { title: 'Куда', options: ['в холодильник', 'под диван', 'в цветочный горшок', 'в сапог'] },
      { title: 'Когда', options: ['утром', 'в обед', 'вечером', 'ночью'] },
    ],
  },
  {
    title: 'Кто украл корону с карнавала?',
    categories: [
      { title: 'Кто', options: ['Фокусник', 'Клоун', 'Дракон', 'Пингвин'] },
      { title: 'Где', options: ['за сценой', 'у фонтана', 'в шатре', 'на карусели'] },
      { title: 'Зачем', options: ['для селфи', 'на память', 'чтобы примерить', 'ради шутки'] },
    ],
  },
  {
    title: 'Кто разрисовал забор во дворе?',
    categories: [
      { title: 'Кто', options: ['Сосед', 'Ёжик', 'Почтальон', 'Пришелец'] },
      { title: 'Чем', options: ['мелом', 'вареньем', 'кетчупом', 'зубной пастой'] },
      { title: 'Что', options: ['кота', 'ракету', 'радугу', 'портрет директора'] },
    ],
  },
  {
    title: 'Кто запустил ракету из школьного двора?',
    categories: [
      { title: 'Кто', options: ['Учитель физики', 'Повар', 'Дворник', 'Хомяк'] },
      { title: 'Из чего', options: ['из кастрюль', 'из бутылок', 'из картона', 'из пылесоса'] },
      { title: 'Куда', options: ['на Луну', 'на крышу', 'в соседний город', 'в пруд'] },
    ],
  },
];

/** What a bot says when it shares a clue: the clue itself, honestly. */
export const marketClueLine = (category: string, option: string) => `${category}: точно не ${option}`;
export const marketSmallTalk = ['Что у тебя есть?', 'Меняю улику на улику', 'Кажется, я догадываюсь…', 'Не верь всему, что пишут 😉', 'Давай объединим силы'];
