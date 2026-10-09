import { describe, expect, it } from 'vitest';
import { dmThread } from '../shared/catalog.js';
import { CHAT_GAP_MS, CHAT_MESSAGES_MAX } from '../shared/protocol.js';
import { Chat, mentions } from '../server/game/chat.js';

describe('messenger', () => {
  const clock = () => {
    let t = 0;
    return { now: () => t, tick: () => (t += CHAT_GAP_MS) };
  };

  it('opens a direct chat on the first message and keeps strangers out of it', () => {
    const c = clock();
    const chat = new Chat(['a', 'b', 'c'], { now: c.now });
    c.tick();
    expect(chat.post('a', dmThread('a', 'b'), ' привет ')).toMatchObject({ from: 'a', text: 'привет' });
    c.tick();
    expect(chat.post('c', dmThread('a', 'b'), 'и я тут')).toBeNull();
    expect(chat.post('a', 'dm:a:a', 'сам себе')).toBeNull();
    expect(chat.post('a', 'dm:b:a', 'не тот порядок')).toBeNull();
    expect(chat.view('b').map((t) => t.id)).toEqual([dmThread('a', 'b')]);
    expect(chat.view('c')).toEqual([]);
    expect(chat.flights).toEqual([{ id: 1, from: 'a', to: 'b' }]);
  });

  it('lets only members write to a group and shows it to them first', () => {
    const c = clock();
    const chat = new Chat(['a', 'b', 'c'], { groups: [{ id: 'group:x', title: 'Тайна', members: ['a', 'b'] }], now: c.now });
    c.tick();
    expect(chat.post('c', 'group:x', 'можно?')).toBeNull();
    expect(chat.post('a', 'group:x', 'план такой')).not.toBeNull();
    c.tick();
    chat.post('b', dmThread('b', 'c'), 'привет');
    expect(chat.view('b').map((t) => t.id)).toEqual(['group:x', dmThread('b', 'c')]);
    expect(chat.flights).toEqual([{ id: 2, from: 'b', to: 'c' }]);
  });

  it('throttles a flood and caps the messages per round', () => {
    const c = clock();
    const chat = new Chat(['a', 'b'], { now: c.now });
    c.tick();
    expect(chat.post('a', dmThread('a', 'b'), 'раз')).not.toBeNull();
    expect(chat.post('a', dmThread('a', 'b'), 'два')).toBeNull();
    for (let i = 1; i < CHAT_MESSAGES_MAX; i++) {
      c.tick();
      expect(chat.post('a', dmThread('a', 'b'), `${i}`)).not.toBeNull();
    }
    c.tick();
    expect(chat.left('a')).toBe(0);
    expect(chat.post('a', dmThread('a', 'b'), 'ещё')).toBeNull();
    chat.nextRound();
    expect(chat.left('a')).toBe(CHAT_MESSAGES_MAX);
    expect(chat.view('a')[0]!.messages).toHaveLength(CHAT_MESSAGES_MAX);
  });
});

describe('secret word match', () => {
  it.each([
    ['Обожаю пельменей поесть', 'пельмени', true],
    ['у меня два кота', 'кот', true],
    ['котлета', 'кот', false],
    ['Ёлки зелёные', 'ёлка', true],
    ['батареек нет', 'батарейка', true],
    ['рад', 'радуга', false],
    ['ПИНГВИН!', 'пингвин', true],
  ])('«%s» against «%s» is %s', (text, word, expected) => {
    expect(mentions(text, word)).toBe(expected);
  });
});
