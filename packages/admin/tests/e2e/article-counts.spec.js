const { test, expect } = require('@playwright/test');

const PLACEHOLDER = '...';

async function openCountsPage(page, fulfill) {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  await page.route('**/api/public/article/viewer/**', async (route) => {
    const url = new URL(route.request().url());
    const id = decodeURIComponent(url.pathname.split('/').pop() || '');
    await fulfill(id, route);
  });

  await page.goto('/article-counts.html');
  await expect(page.locator('[data-count-case="article"]')).toBeVisible();
  await expect(page.locator('[data-count-case="overview"]')).toBeVisible();
  await expect(page.locator('[data-count-case="zero"]')).toBeVisible();
  expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
}

function viewerOf(page, caseName) {
  return page.locator(`[data-count-case="${caseName}"] [data-article-viewer]`);
}

function commentsOf(page, caseName) {
  return page.locator(`[data-count-case="${caseName}"] .waline-comment-count`);
}

test.describe('public article view and comment count placeholders (#230)', () => {
  test('shows ... before load, then the real view and comment numbers', async ({ page }) => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });

    await openCountsPage(page, async (id, route) => {
      await gate;
      const viewer = id === '1' ? 41 : 12;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ statusCode: 200, data: { viewer } }),
      });
    });

    await expect(viewerOf(page, 'article')).toHaveText(PLACEHOLDER);
    await expect(viewerOf(page, 'overview')).toHaveText(PLACEHOLDER);
    await expect(commentsOf(page, 'article')).toHaveText(PLACEHOLDER);
    await expect(commentsOf(page, 'overview')).toHaveText(PLACEHOLDER);
    await expect(viewerOf(page, 'article')).toHaveAttribute('aria-busy', 'true');
    await expect(viewerOf(page, 'article')).not.toHaveText('0');
    await expect(commentsOf(page, 'article')).not.toHaveText('0');

    await page.evaluate(() => {
      window.__fillCommentCounts({
        '/post/1': 7,
        '/post/2': 3,
        '/post/3': 0,
        default: 0,
      });
    });
    release();

    await expect(viewerOf(page, 'article')).toHaveText('42');
    await expect(viewerOf(page, 'overview')).toHaveText('12');
    await expect(commentsOf(page, 'article')).toHaveText('7');
    await expect(commentsOf(page, 'overview')).toHaveText('3');
    await expect(viewerOf(page, 'article')).toHaveAttribute('aria-busy', 'false');
  });

  test('shows a real 0 after load instead of leaving the placeholder', async ({ page }) => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });

    await openCountsPage(page, async (id, route) => {
      await gate;
      const viewer = id === '3' ? 0 : 5;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ statusCode: 200, data: { viewer } }),
      });
    });

    await expect(viewerOf(page, 'zero')).toHaveText(PLACEHOLDER);
    await expect(commentsOf(page, 'zero')).toHaveText(PLACEHOLDER);

    await page.evaluate(() => {
      window.__fillCommentCounts({
        '/post/3': 0,
        default: 0,
      });
    });
    release();

    await expect(viewerOf(page, 'zero')).toHaveText('0');
    await expect(commentsOf(page, 'zero')).toHaveText('0');
    await expect(viewerOf(page, 'zero')).not.toHaveText(PLACEHOLDER);
    await expect(commentsOf(page, 'zero')).not.toHaveText(PLACEHOLDER);
  });
});
