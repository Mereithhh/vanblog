const { test, expect } = require('@playwright/test');

async function reset(page) {
  await page.request.post('/e2e/reset');
}

async function createCategory(page, name) {
  const res = await page.request.post('/api/admin/category/', { data: { name } });
  expect(res.ok()).toBeTruthy();
}

async function createArticle(page, title, category) {
  const res = await page.request.post('/api/admin/article', { data: { title, category } });
  expect(res.ok()).toBeTruthy();
}

async function createDraft(page, title, category) {
  const res = await page.request.post('/api/admin/draft', { data: { title, category } });
  expect(res.ok()).toBeTruthy();
}

test.describe('category rename cascades to articles and drafts', () => {
  test('renaming AAA to BBB updates every article, draft, and public listing', async ({
    page,
  }) => {
    await reset(page);
    await createCategory(page, 'AAA');
    await createArticle(page, '已发布文章', 'AAA');
    await createDraft(page, '未发布草稿', 'AAA');

    await page.goto('/admin/category');
    await expect(page.locator('[data-category-name="AAA"]')).toBeVisible();

    await page.goto('/admin/article');
    await expect(page.locator('[data-article-title="已发布文章"]')).toBeVisible();
    await expect(page.locator('[data-article-category="AAA"]')).toHaveText('AAA');

    await page.goto('/admin/draft');
    await expect(page.locator('[data-draft-title="未发布草稿"]')).toBeVisible();
    await expect(page.locator('[data-draft-category="AAA"]')).toHaveText('AAA');

    await page.goto('/admin/category');
    await page.locator('#old-category-name').fill('AAA');
    await page.locator('#rename-category-name').fill('BBB');
    await page.locator('#rename-category-btn').click();
    await expect(page.locator('[data-category-name="BBB"]')).toBeVisible();
    await expect(page.locator('[data-category-name="AAA"]')).toHaveCount(0);

    await page.goto('/admin/article');
    await expect(page.locator('[data-article-category="BBB"]')).toHaveText('BBB');
    await expect(page.locator('[data-article-category="AAA"]')).toHaveCount(0);

    await page.goto('/admin/draft');
    await expect(page.locator('[data-draft-category="BBB"]')).toHaveText('BBB');
    await expect(page.locator('[data-draft-category="AAA"]')).toHaveCount(0);

    await page.goto('/');
    await expect(page.locator('[data-article-category="BBB"]')).toHaveText('BBB');
    await expect(page.locator('[data-article-category="AAA"]')).toHaveCount(0);
  });

  test('delete still refuses when the category has articles', async ({ page }) => {
    await reset(page);
    await createCategory(page, 'BBB');
    await createArticle(page, '还在', 'BBB');

    const res = await page.request.delete('/api/admin/category/BBB');
    expect(res.status()).toBe(406);
    const body = await res.json();
    expect(body.message).toBe('分类已有文章，无法删除！');

    await page.goto('/admin/category');
    await expect(page.locator('[data-category-name="BBB"]')).toBeVisible();
  });
});
