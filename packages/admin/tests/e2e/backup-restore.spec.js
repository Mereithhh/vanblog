const { test, expect } = require('@playwright/test');

async function reset(page, mode) {
  await page.request.post('/e2e/reset', { data: { mode } });
}

test.describe('backup restore categories', () => {
  test('import restores category management and homepage articles', async ({ page }) => {
    await reset(page, 'old-machine');

    await page.goto('/admin/backup');
    await page.locator('#export-btn').click();
    await expect(page.locator('#backup-status')).toHaveText('exported');

    const backup = await page.request.get('/api/admin/backup/export').then((res) => res.json());
    expect(backup.articles.map((item) => item.title)).toEqual([
      '迁徙后的第一篇',
      'Docker 部署笔记',
    ]);
    expect(backup.categories.map((item) => item.name)).toEqual(['随笔', '教程']);

    await reset(page, 'new-machine');
    await page.goto('/admin/category');
    await expect(page.locator('[data-empty-category]')).toBeVisible();
    await page.goto('/');
    await expect(page.locator('[data-empty-home]')).toBeVisible();

    await page.request.post('/api/admin/backup/import', { data: backup });

    await page.goto('/admin/category');
    await expect(page.locator('[data-category-name="随笔"]')).toBeVisible();
    await expect(page.locator('[data-category-name="教程"]')).toBeVisible();

    await page.goto('/');
    await expect(page.locator('[data-article-title="迁徙后的第一篇"]')).toBeVisible();
    await expect(page.locator('[data-article-title="Docker 部署笔记"]')).toBeVisible();
    await expect(page.locator('[data-article-category="随笔"]')).toHaveText('随笔');
  });

  test('old name-only backup still recreates Category documents', async ({ page }) => {
    await reset(page, 'new-machine');
    await page.request.post('/api/admin/backup/import', {
      data: {
        articles: [
          { id: 8, title: '旧备份文章', category: '历史分类', hidden: false },
        ],
        categories: ['历史分类'],
        meta: { categories: [] },
      },
    });

    await page.goto('/admin/category');
    await expect(page.locator('[data-category-name="历史分类"]')).toBeVisible();
    await page.goto('/');
    await expect(page.locator('[data-article-title="旧备份文章"]')).toBeVisible();
  });
});
