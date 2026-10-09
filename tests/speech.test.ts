import { describe, expect, it } from 'vitest';
import { numberWords, rulesLine, speechSentences, speechText } from '../shared/catalog.js';
import { GAMES } from '../shared/protocol.js';

describe('narrator speech text', () => {
  it('keeps words and intonation, drops symbols a voice would spell out', () => {
    expect(speechText('Титул «Король\\реакций» — твой… #1')).toBe('Титул Король реакций, твой, один');
  });

  it('splits a line into sentences that cache on their own', () => {
    expect(speechSentences('Новый вопрос — новые разоблачения! Голосуйте! Кто первым уснёт?')).toEqual([
      'Новый вопрос, новые разоблачения!',
      'Голосуйте!',
      'Кто первым уснёт?',
    ]);
  });

  it('does not break a number at its decimal point', () => {
    expect(speechSentences('В среднем 3.5 раза. Ага')).toEqual(['В среднем три целых пять десятых раза.', 'Ага']);
    expect(speechText('1,25')).toBe('одна целая двадцать пять сотых');
  });

  it('reads numbers as words, in the genitive after «от», «до» and «из»', () => {
    expect(speechText('Угадали — 100 очков, автору по 50.')).toBe('Угадали, сто очков, автору по пятьдесят.');
    expect(speechText('Шкала от 0 до 10, вечер 2 из 3')).toBe('Шкала от нуля до десяти, вечер два из трёх');
    expect(speechText('Ответ, которого нет ни у кого, — 30 очков')).toBe('Ответ, которого нет ни у кого, тридцать очков');
    expect(numberWords(2024)).toBe('две тысячи двадцать четыре');
    expect(numberWords(11000)).toBe('одиннадцать тысяч');
    expect(numberWords(121000, true)).toBe('ста двадцати одной тысячи');
    expect(numberWords(345)).toBe('триста сорок пять');
    expect(numberWords(1000)).toBe('одна тысяча');
  });

  it('leaves no digits in any fixed narrator line', () => {
    for (const game of GAMES) for (const s of speechSentences(rulesLine(game))) expect(s).not.toMatch(/\d/);
  });

  it('reads every mini-game’s rules as sentences', () => {
    for (const game of GAMES) expect(speechSentences(rulesLine(game)).length).toBeGreaterThan(1);
  });
});
