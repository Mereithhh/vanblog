const { test, expect } = require('@playwright/test');

async function openCategoryPage(page, expand = false) {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  await page.goto(expand ? '/category-expand.html?expand=true' : '/category-expand.html');
  await expect(page.getByRole('button', { name: /随笔/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /教程/ })).toBeVisible();
  expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
}

function articleLink(page, title) {
  return page.getByRole('link', { name: title });
}

test.describe('public category expand control (#260)', () => {
  test('uses a chevron, not a plus, and expands when the category row is clicked', async ({
    page,
  }) => {
    await openCategoryPage(page, false);

    const essay = page.locator('[data-timeline-item="随笔"]');
    await expect(essay).toHaveAttribute('data-expanded', 'false');
    await expect(essay.locator('[data-expand-chevron]')).toContainText('>');
    await expect(essay.locator('[data-expand-chevron]')).not.toContainText('+');
    await expect(articleLink(page, '随笔一篇')).not.toBeVisible();

    await page.getByRole('button', { name: /随笔/ }).click();
    await expect(essay).toHaveAttribute('data-expanded', 'true');
    await expect(articleLink(page, '随笔一篇')).toBeVisible();
    await expect(articleLink(page, '教程一篇')).not.toBeVisible();

    await page.getByRole('button', { name: /随笔/ }).click();
    await expect(essay).toHaveAttribute('data-expanded', 'false');
    await expect(articleLink(page, '随笔一篇')).not.toBeVisible();
  });

  test('honors default expanded preference and expand-all / collapse-all', async ({ page }) => {
    await openCategoryPage(page, true);

    await expect(page.locator('[data-timeline-item="随笔"]')).toHaveAttribute(
      'data-expanded',
      'true',
    );
    await expect(page.locator('[data-timeline-item="教程"]')).toHaveAttribute(
      'data-expanded',
      'true',
    );
    await expect(articleLink(page, '随笔一篇')).toBeVisible();
    await expect(articleLink(page, '教程一篇')).toBeVisible();

    await page.locator('[data-category-collapse-all]').click();
    await expect(page.locator('[data-timeline-item="随笔"]')).toHaveAttribute(
      'data-expanded',
      'false',
    );
    await expect(page.locator('[data-timeline-item="教程"]')).toHaveAttribute(
      'data-expanded',
      'false',
    );
    await expect(articleLink(page, '随笔一篇')).not.toBeVisible();
    await expect(articleLink(page, '教程一篇')).not.toBeVisible();

    await page.locator('[data-category-expand-all]').click();
    await expect(page.locator('[data-timeline-item="随笔"]')).toHaveAttribute(
      'data-expanded',
      'true',
    );
    await expect(page.locator('[data-timeline-item="教程"]')).toHaveAttribute(
      'data-expanded',
      'true',
    );
    await expect(articleLink(page, '随笔一篇')).toBeVisible();
    await expect(articleLink(page, '教程一篇')).toBeVisible();
  });

  test('starts collapsed when the default expand setting is off', async ({ page }) => {
    await openCategoryPage(page, false);
    await expect(page.locator('[data-timeline-item="随笔"]')).toHaveAttribute(
      'data-expanded',
      'false',
    );
    await expect(page.locator('[data-timeline-item="教程"]')).toHaveAttribute(
      'data-expanded',
      'false',
    );
    await expect(page.getByRole('button', { name: '全部展开' })).toBeVisible();
    await expect(page.getByRole('button', { name: '全部收起' })).toBeVisible();
  });
});
