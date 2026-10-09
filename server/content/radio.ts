/**
 * «Сарафанное радио»: the rumours that start each chain, and how a bot mishears one. The rumours are
 * small, concrete and a bit absurd, so every retelling has a detail to lose or to embellish.
 */
import { RADIO_WORDS_MAX } from '../../shared/protocol.js';
import { pick, type Rng } from '../util.js';

export const radioRumours = [
  'Сосед сверху по ночам учит попугая петь оперу',
  'В школьной столовой завтра дают торт размером с парту',
  'Почтальон катается на роликах и разносит письма в костюме зайца',
  'Бабушка из третьего подъезда выиграла чемпионат по шашкам среди пиратов',
  'В парке поселился енот, который ворует только синие носки',
  'Учитель физики собрал в гараже настоящую ракету из кастрюль',
  'Кот из соседнего дома каждое утро ездит на трамвае до конечной',
  'Директор зоопарка разрешил жирафу смотреть футбол по телевизору',
  'В лифте нашли записку с рецептом пельменей с клубникой',
  'Местный пекарь испёк батон длиной в целый автобус',
  'На крыше библиотеки живёт сова, которая умеет читать вслух',
  'Дворник подстриг кусты в форме динозавров и получил медаль',
  'Чемодан с воздушными шарами улетел прямо с вокзала',
  'Пингвин из цирка сбежал и устроился работать в кафе мороженщиком',
  'У нового соседа дома три аквариума, а в них черепаха-барабанщица',
  'Таксист возит пассажиров только под песни из мультфильмов',
  'В магазине на углу продают невидимые бутерброды по акции',
  'Хомяк из пятого класса сбежал и прорыл тоннель до спортзала',
  'Кто-то оставил на остановке пианино, и теперь там играют концерты',
  'Лыжник заблудился и вышел прямо к морю в шортах',
];

/** Words a bot swaps in when it mishears something. */
const MISHEARD = ['слон', 'пылесос', 'бабушка', 'единорог', 'кактус', 'пицца', 'вертолёт', 'тапочек', 'космонавт', 'батут', 'огурец', 'дракон'];

/**
 * Retells `text` the way a distracted bot would: keeps most of it, but swaps one longer word for a
 * misheard one and drops another, then fits the result into the word limit.
 */
export function garble(text: string, rng: Rng): string {
  const words = text.split(/\s+/).filter(Boolean);
  const long = words.map((w, i) => ({ w, i })).filter(({ w }) => w.length > 4);
  if (long.length > 0) words[pick(long, rng).i] = pick(MISHEARD, rng);
  if (words.length > 5) words.splice(1 + Math.floor(rng() * (words.length - 2)), 1);
  return words.slice(0, RADIO_WORDS_MAX).join(' ');
}
