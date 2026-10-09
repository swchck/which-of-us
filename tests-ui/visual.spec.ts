import { expect, test, type Page } from '@playwright/test';
import { VISUAL_PORT } from '../playwright.config';

/**
 * Screenshot comparisons of the screens that hold still: the lobby, the setup panel, the catalog
 * and the phone's join and lobby screens. Live play stays with party.spec.ts, which checks layout
 * rules instead, since bots and timers never repeat a frame exactly.
 * Run `npx playwright test visual --update-snapshots` after a deliberate design change.
 */

const BASE = `http://localhost:${VISUAL_PORT}`;
const PHONE = { width: 375, height: 740 };

async function quiet(page: Page): Promise<void> {
  await page.addInitScript(() => {
    speechSynthesis.speak = () => {};
    HTMLMediaElement.prototype.play = () => Promise.resolve();
  });
}

/** Things that differ between machines or moments: the LAN address, its QR code, confetti. */
function masks(page: Page) {
  return [page.locator('.qr, canvas, .lan, .url, .credits')];
}

test.describe.configure({ mode: 'serial' });

test('TV and phone menus look as they did', async ({ browser }) => {
  const tvContext = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
  const tv = await tvContext.newPage();
  await quiet(tv);
  await tv.goto(BASE);
  await expect(tv).toHaveScreenshot('tv-home.png', { mask: masks(tv) });

  await tv.getByRole('button', { name: 'Создать игру' }).click();
  const code = (await tv.locator('.code').first().textContent())!.trim();
  const phoneContext = await browser.newContext({ viewport: PHONE, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const phone = await phoneContext.newPage();
  await quiet(phone);
  await phone.goto(`${BASE}/p?c=${code}`);
  // the phone suggests a random free colour
  await expect(phone).toHaveScreenshot('phone-join.png', { mask: [phone.locator('.colors')] });
  await phone.getByPlaceholder('Например, Аня').fill('Аня');
  await phone.locator('.colors button').first().click();
  await phone.locator('form.join button[type=submit]').click();
  await expect(tv.locator('.players .player:not(.empty)')).toHaveCount(1);
  await tv.locator('.player.add').click();
  await tv.locator('.player.add').click();
  await expect(tv.locator('.players .player:not(.empty)')).toHaveCount(3);
  await expect(phone).toHaveScreenshot('phone-lobby.png');
  await expect(tv).toHaveScreenshot('tv-lobby.png', { mask: masks(tv) });

  await tv.getByRole('button', { name: /Настроить/ }).click();
  for (const tab of await tv.locator('.tab').all()) {
    await tab.click();
    const name = (await tab.textContent())!.trim();
    await expect(tv).toHaveScreenshot(`tv-setup-${name}.png`, { mask: masks(tv) });
  }
  await tv.locator('.tab').first().click();
  for (const picker of ['Мини-игры', 'Места']) {
    await tv.locator('.picker', { hasText: picker }).click();
    await expect(tv.getByRole('dialog')).toBeVisible();
    await expect(tv).toHaveScreenshot(`tv-catalog-${picker}.png`, { mask: masks(tv) });
    await tv.getByRole('dialog').getByRole('button', { name: 'Готово' }).click();
  }
});
