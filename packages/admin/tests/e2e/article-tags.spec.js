const { test, expect } = require('@playwright/test');

async function openTagFixture(page) {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  await page.goto('/article-tags.html');
  await expect(page.locator('[data-tag-case="article"]')).toBeVisible();
  expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
}

function caseRoot(page, name) {
  return page.locator(`[data-tag-case="${name}"]`);
}

test.describe('public article-bottom tag icons (#178)', () => {
  test('shows a tag icon on each article-bottom tag link', async ({ page }) => {
    await openTagFixture(page);

    const article = caseRoot(page, 'article');
    const js = article.locator('a[data-article-tag="js"]');
    const essay = article.locator('a[data-article-tag="随笔"]');

    await expect(js).toBeVisible();
    await expect(essay).toBeVisible();
    await expect(js).toHaveAttribute('href', '/tag/js');
    await expect(essay).toHaveAttribute('href', '/tag/随笔');
    await expect(js).toHaveText('js');
    await expect(essay).toHaveText('随笔');

    await expect(js.locator('[data-tag-icon]')).toBeVisible();
    await expect(essay.locator('[data-tag-icon]')).toBeVisible();
    await expect(js.locator('[data-tag-icon]')).toHaveAttribute('aria-hidden', 'true');
    await expect(essay.locator('[data-tag-icon]')).toHaveAttribute('aria-hidden', 'true');
    await expect(article.locator('[data-tag-icon]')).toHaveCount(2);

    await expect(js.locator('svg[data-tag-icon]')).toHaveCount(1);
    await expect(essay.locator('svg[data-tag-icon]')).toHaveCount(1);

    const prev = article.getByRole('link', { name: /上一篇/ });
    const next = article.getByRole('link', { name: /下一篇/ });
    await expect(prev).toBeVisible();
    await expect(next).toBeVisible();
    await expect(prev.locator('[data-tag-icon]')).toHaveCount(0);
    await expect(next.locator('[data-tag-icon]')).toHaveCount(0);
  });

  test('does not show tag links on locked articles, list cards, or empty tag lists', async ({
    page,
  }) => {
    await openTagFixture(page);

    await expect(caseRoot(page, 'locked').locator('[data-article-tag]')).toHaveCount(0);
    await expect(caseRoot(page, 'locked').locator('[data-tag-icon]')).toHaveCount(0);
    await expect(caseRoot(page, 'overview').locator('[data-article-tag]')).toHaveCount(0);
    await expect(caseRoot(page, 'overview').locator('[data-tag-icon]')).toHaveCount(0);
    await expect(caseRoot(page, 'empty').locator('[data-article-tag]')).toHaveCount(0);
    await expect(caseRoot(page, 'empty').locator('[data-tag-icon]')).toHaveCount(0);
  });

  test('keeps the icon in dark mode with the tag label', async ({ page }) => {
    await openTagFixture(page);

    const dark = caseRoot(page, 'dark').locator('a[data-article-tag="dark-tag"]');
    await expect(dark).toBeVisible();
    await expect(dark).toHaveText('dark-tag');
    await expect(dark.locator('[data-tag-icon]')).toBeVisible();
    await expect(dark.locator('[data-tag-icon]')).toHaveAttribute('aria-hidden', 'true');
  });
});
