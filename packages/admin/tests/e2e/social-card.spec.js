const { test, expect } = require('@playwright/test');

async function linkByHref(page, href) {
  const loc = page.locator(`[data-author-card] a[href="${href}"]`);
  await expect(loc).toBeVisible();
  return loc;
}

test.describe('AuthorCard custom social links (#394)', () => {
  test.beforeEach(async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await page.goto('/social-card.html');
    await expect(page.locator('[data-author-card] a').first()).toBeVisible();
    expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
  });

  test('builtin github and email still work as links', async ({ page }) => {
    const github = await linkByHref(page, 'https://github.com/Mereithhh');
    await expect(github).toHaveAttribute('target', '_blank');
    await expect(github).toContainText('Github');
    await expect(github.locator('svg')).toHaveCount(1);

    const email = await linkByHref(page, 'mailto:hi@example.com');
    await expect(email).toContainText('Email');
  });

  test('custom Telegram uses the display name, url, and icon', async ({ page }) => {
    const telegram = await linkByHref(page, 'https://t.me/vanblog');
    await expect(telegram).toHaveAttribute('target', '_blank');
    await expect(telegram).toContainText('Telegram');
    await expect(telegram.locator('img')).toHaveAttribute('src', 'https://example.com/telegram.png');
  });

  test('custom Twitter / X works as a link without a custom icon', async ({ page }) => {
    const twitter = await linkByHref(page, 'https://x.com/vanblog');
    await expect(twitter).toHaveAttribute('target', '_blank');
    await expect(twitter).toContainText('Twitter / X');
    await expect(twitter.locator('img')).toHaveCount(0);
    await expect(twitter.locator('svg')).toHaveCount(1);
  });
});
