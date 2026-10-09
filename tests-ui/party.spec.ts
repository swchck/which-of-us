import { expect, test, type Browser, type Page } from '@playwright/test';
import { GAME_INFO } from '../shared/catalog';
import { GAMES, QUESTIONS_MAX, QUESTIONS_MIN, type GameId } from '../shared/protocol';

/**
 * Plays a short party in real browsers: a TV at a MacBook's 16:10 and two phones that tap
 * whatever is on screen. Every TV scene is checked for content spilling off the stage or under
 * the corner buttons, every phone for sideways scrolling, and nothing may log an error.
 */

const PHONE = { width: 375, height: 740 };

interface Problem {
  where: string;
  what: string;
}

function watchErrors(page: Page, name: string, errors: string[]): void {
  page.on('pageerror', (err) => errors.push(`${name}: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${name}: ${msg.text()}`);
  });
}

/** Waits for entry animations to end, so things flying in from off-stage are not counted. */
async function settle(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () =>
        document
          .getAnimations()
          .every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity),
      undefined,
      { timeout: 4000, polling: 100 },
    )
    .catch(() => undefined);
}

/** Content boxes that leave the stage or touch the corner buttons; decorations are ignored. */
async function tvProblems(tv: Page): Promise<string[]> {
  return tv.evaluate(() => {
    const stage = document.querySelector('.stage')?.getBoundingClientRect();
    const controls = document.querySelector('.viewport > .controls')?.getBoundingClientRect();
    if (!stage || !controls) return ['no stage'];
    const out: string[] = [];
    const slack = 2;
    const content = document.querySelectorAll<HTMLElement>(
      '.stage button, .stage img, .stage canvas, .stage .sticker, .stage .plate, .stage .name, .stage h1, .stage h2',
    );
    // a slideshow can start its next fly-in right after settle(), so skip anything still moving in
    const arriving = (el: Element | null): boolean => {
      for (; el; el = el.parentElement) {
        if (el.getAnimations().some((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity)) return true;
      }
      return false;
    };
    for (const el of content) {
      // a scene mid-wipe has its classes set a frame before its transition registers as running
      if (arriving(el) || el.closest('[class*="-leave-active"], [class*="-enter-active"]')) continue;
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (r.width < 2 || r.height < 2 || style.visibility === 'hidden' || Number(style.opacity) < 0.05) continue;
      const label = `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent?.trim().slice(0, 30) ?? ''}"`;
      if (r.left < stage.left - slack || r.right > stage.right + slack || r.top < stage.top - slack || r.bottom > stage.bottom + slack) {
        const box = (x: DOMRect) => `${Math.round(x.left)},${Math.round(x.top)} ${Math.round(x.width)}x${Math.round(x.height)}`;
        out.push(`${label} at ${box(r)} leaves the stage at ${box(stage)} (parent ${el.parentElement?.className ?? ''})`);
      }
      const overlaps = r.left < controls.right && r.right > controls.left && r.top < controls.bottom && r.bottom > controls.top;
      if (overlaps) out.push(`${label} sits under the corner buttons`);
    }
    return out;
  });
}

async function phoneProblems(phone: Page): Promise<string[]> {
  return phone.evaluate(() => {
    const out: string[] = [];
    if (document.documentElement.scrollWidth > window.innerWidth + 1) {
      out.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${window.innerWidth})`);
    }
    return out;
  });
}

/** One step of a player who taps the first thing that looks actionable. */
async function monkey(phone: Page): Promise<void> {
  await phone.evaluate(() => {
    const main = document.querySelector('main');
    if (!main || main.querySelector('.final')) return;
    const fields = main.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input:not([type=file]), textarea');
    for (const f of fields) {
      if (f.value) continue;
      f.value = 'кактус';
      f.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const pad = main.querySelector<HTMLElement>('.pad');
    if (pad) {
      if (pad.classList.contains('go')) pad.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      return;
    }
    const form = main.querySelector('form');
    if (form && fields.length) {
      form.requestSubmit();
      return;
    }
    const button = [...main.querySelectorAll<HTMLButtonElement>('button:not([disabled])')].find(
      (b) => !/Сохранить|Ластик|Отменить|Очистить/.test(b.textContent ?? ''),
    );
    button?.click();
  });
  // confetti is a canvas too, but nobody draws on it
  const canvas = phone.locator('main canvas:not(.confetti)').first();
  if (await canvas.isVisible().catch(() => false)) {
    const box = await canvas.boundingBox();
    if (box && box.height > 100) {
      await phone.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
      await phone.mouse.down();
      await phone.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 8 });
      await phone.mouse.up();
    }
  }
}

interface Party {
  tv: Page;
  phones: Page[];
  problems: Problem[];
  errors: string[];
  scenes: Set<string>;
}

/** Leaves only this mini-game switched on in the TV's setup panel. */
async function onlyGame(tv: Page, game: GameId): Promise<void> {
  await tv.getByRole('button', { name: /Настроить/ }).click();
  await tv.locator('.picker', { hasText: 'Мини-игры' }).click();
  const catalog = tv.getByRole('dialog');
  await catalog.getByRole('button', { name: 'Ни одной' }).click();
  await expect(catalog.locator('.count')).toHaveText(`0 из ${GAMES.length}`);
  const add = catalog.getByRole('button', { name: `Добавить: ${GAME_INFO[game].title}`, exact: true });
  await add.click();
  await expect(catalog.locator('.count')).toHaveText(`1 из ${GAMES.length}`);
  await expect(catalog.locator('.row.on')).toContainText(GAME_INFO[game].title);
  await catalog.getByRole('button', { name: 'Готово' }).click();
  await tv.getByRole('button', { name: 'Готово' }).click();
}

/** Fewest questions per round, so a two-round party fits the test timeout. */
async function fewQuestions(tv: Page): Promise<void> {
  await tv.getByRole('button', { name: /Настроить/ }).click();
  await tv.locator('.tab', { hasText: 'Правила' }).click();
  const questions = tv.locator('.num', { hasText: 'Вопросов' });
  const minus = questions.locator('button').first();
  for (let i = 0; i < QUESTIONS_MAX; i++) await minus.click();
  await expect(questions.locator('b')).toHaveText(String(QUESTIONS_MIN));
  await tv.getByRole('button', { name: 'Готово' }).click();
}

async function playParty(browser: Browser, game?: GameId): Promise<Party> {
  const errors: string[] = [];
  const problems: Problem[] = [];

  // per-game runs only check layout, and with motion each one pins a CPU core on a software-rendered scene;
  // the mixed party keeps it, so animated emoji, confetti and count-ups still run under the error watch
  const reducedMotion = game ? 'reduce' : 'no-preference';
  const tvContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
  // the narrator speaks through the OS voice, which --mute-audio does not reach; neural clips are muted
  // too in case a dev machine's settings pick one
  await tvContext.addInitScript(() => {
    speechSynthesis.speak = () => {};
    HTMLMediaElement.prototype.play = () => Promise.resolve();
  });
  const tv = await tvContext.newPage();
  watchErrors(tv, 'tv', errors);
  await tv.goto('/');
  await tv.getByRole('button', { name: 'Создать игру' }).click();
  const code = (await tv.locator('.code').first().textContent())!.trim();
  expect(code).toMatch(/^\d{4}$/);

  if (!game) {
    for (const size of [
      { width: 1920, height: 1080 },
      { width: 1280, height: 720 },
      { width: 1440, height: 900 },
    ]) {
      await tv.setViewportSize(size);
      await tv.waitForTimeout(300);
      for (const what of await tvProblems(tv)) problems.push({ where: `lobby ${size.width}x${size.height}`, what });
    }
  }

  const phones: Page[] = [];
  for (const name of ['Аня', 'Боря']) {
    const context = await browser.newContext({ viewport: PHONE, hasTouch: true, isMobile: true, reducedMotion });
    const phone = await context.newPage();
    watchErrors(phone, name, errors);
    await phone.goto(`/p?c=${code}`);
    await phone.getByPlaceholder('Например, Аня').fill(name);
    await phone.locator('form.join button[type=submit]').click();
    phones.push(phone);
  }
  await expect(tv.locator('.players .player:not(.empty)')).toHaveCount(2);
  for (let i = 0; i < 2; i++) await tv.getByRole('button', { name: 'Меньше раундов' }).click();
  await fewQuestions(tv);
  // two bots beside the two phones let the team and lie rounds play out as at a real table; bigger games get their minimum
  const bots = game ? Math.max(2, (GAME_INFO[game].players ?? 0) - phones.length) : 1;
  if (game) await onlyGame(tv, game);
  for (let i = 0; i < bots; i++) await tv.locator('.player.add').click();
  await tv.getByRole('button', { name: 'Поехали!' }).click();

  const scenes = new Set<string>();
  let last = '';
  const deadline = Date.now() + 5 * 60_000;
  while (Date.now() < deadline) {
    await Promise.all(phones.map((p) => monkey(p).catch(() => undefined)));
    const scene = await tv.evaluate(() => {
      const el = document.querySelector('.stage > div:not(.caption):not(.conn):not(.paused)');
      return el ? [...el.classList].filter((c) => !c.startsWith('scene-')).join('.') : '';
    });
    if (scene && scene !== last) {
      last = scene;
      await settle(tv);
      if (!scenes.has(scene)) {
        scenes.add(scene);
        for (const what of await tvProblems(tv)) problems.push({ where: `tv ${scene}`, what });
        for (const [i, phone] of phones.entries()) {
          for (const what of await phoneProblems(phone)) problems.push({ where: `phone ${i} during ${scene}`, what });
        }
      }
      if (scene.includes('final')) break;
    }
    await tv.waitForTimeout(250);
  }
  expect([...scenes].some((s) => s.includes('final')), `scenes seen: ${[...scenes].join(', ')}`).toBe(true);
  return { tv, phones, problems, errors, scenes };
}

test('a quick mixed party stays on screen and saves the album', async ({ browser }) => {
  const { phones, problems, errors } = await playParty(browser);

  const phone = phones[0]!;
  await expect(phone.locator('.album .shot').first()).toBeVisible();
  for (const what of await phoneProblems(phone)) problems.push({ where: 'phone final', what });
  const one = phone.waitForEvent('download', { timeout: 10_000 });
  await phone.locator('.album .shot button').first().click();
  expect((await one).suggestedFilename()).toMatch(/\.png$/);
  const collage = phone.getByRole('button', { name: /одной картинкой/ });
  if (await collage.isVisible()) {
    const all = phone.waitForEvent('download', { timeout: 15_000 });
    await collage.click();
    expect((await all).suggestedFilename()).toBe('kto-iz-nas-album.png');
  }

  expect(problems, JSON.stringify(problems, null, 2)).toEqual([]);
  expect(errors, errors.join('\n')).toEqual([]);
});

for (const game of GAMES) {
  test(`${GAME_INFO[game].title}: every scene stays on screen`, async ({ browser }) => {
    const { problems, errors } = await playParty(browser, game);
    expect(problems, JSON.stringify(problems, null, 2)).toEqual([]);
    expect(errors, errors.join('\n')).toEqual([]);
  });
}
