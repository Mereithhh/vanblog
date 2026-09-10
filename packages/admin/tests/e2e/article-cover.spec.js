const { test, expect } = require('@playwright/test');

async function openCoverFixture(page) {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  await page.goto('/article-cover.html');
  await expect(page.locator('[data-article-cover-case="set"]')).toBeVisible();
  await expect(page.locator('[data-article-cover-case="unset"]')).toBeVisible();
  expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
}

test.describe('public article cover (#288)', () => {
  test('shows the cover image when set and hides it when unset', async ({ page }) => {
    await openCoverFixture(page);

    const withCover = page.locator('[data-article-cover-case="set"]');
    const withoutCover = page.locator('[data-article-cover-case="unset"]');

    const cover = withCover.locator('[data-article-cover] img');
    await expect(cover).toBeVisible();
    await expect(cover).toHaveAttribute('src', '/static/img/hero.webp');
    await expect(withCover.locator('h1')).toBeVisible();

    await expect(withoutCover.locator('[data-article-cover]')).toHaveCount(0);
    await expect(withoutCover.locator('h1')).toBeVisible();
    await expect(withoutCover.locator('h1')).toHaveText('没有题头图的文章');
  });

  test('adds og and twitter image meta when a cover exists', async ({ page }) => {
    await openCoverFixture(page);

    const og = page.locator('meta[property="og:image"]');
    const twitter = page.locator('meta[name="twitter:image"]');
    const card = page.locator('meta[name="twitter:card"]');
    await expect(og).toHaveAttribute('content', 'https://blog.example.com/static/img/hero.webp');
    await expect(twitter).toHaveAttribute('content', 'https://blog.example.com/static/img/hero.webp');
    await expect(card).toHaveAttribute('content', 'summary_large_image');
  });
});
