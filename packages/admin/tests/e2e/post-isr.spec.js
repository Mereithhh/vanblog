const { test, expect } = require('@playwright/test');

test.describe('admin edit refreshes public post URLs', () => {
  test('numeric-id page updates after saving a post with custom pathname', async ({ page }) => {
    await page.request.post('/e2e/reset');

    await page.goto('/post/30');
    await expect(page.locator('[data-post-content]')).toContainText('旧内容：安装步骤');
    await page.goto('/post/gitea');
    await expect(page.locator('[data-post-content]')).toContainText('旧内容：安装步骤');

    await page.goto('/admin/editor');
    await expect(page.locator('[data-article-id]')).toHaveText('30');
    await expect(page.locator('[data-article-pathname]')).toHaveText('gitea');
    await page.locator('#content').fill('新内容：升级到 1.20');
    await page.locator('#save-btn').click();
    await expect(page.locator('#save-status')).toHaveText('saved');

    await page.goto('/post/30');
    await expect(page.locator('[data-post-content]')).toContainText('新内容：升级到 1.20');
    await expect(page.locator('[data-post-content]')).not.toContainText('旧内容');

    await page.goto('/post/gitea');
    await expect(page.locator('[data-post-content]')).toContainText('新内容：升级到 1.20');
  });
});
