const { test, expect } = require('@playwright/test');

async function reset(page, forceLoginComment) {
  await page.request.post('/e2e/reset', { data: { forceLoginComment } });
}

test.describe('force login comments', () => {
  test('anonymous submit is rejected when force login is enabled', async ({ page }) => {
    await reset(page, true);
    await page.goto('/post/1');
    await page.locator('#comment').fill('匿名回复');
    await page.locator('button', { hasText: '发表评论' }).click();
    await expect(page.locator('#comment-status')).toHaveText('请先登录后再评论');
    await expect(page.locator('#comment-list li')).toHaveCount(0);
  });

  test('logged-in user can comment when force login is enabled', async ({ page }) => {
    await reset(page, true);
    await page.goto('/login');
    await page.locator('button', { hasText: '登录' }).click();
    await expect(page.locator('#login-status')).toHaveText('登录成功');

    await page.goto('/post/1');
    await page.locator('#comment').fill('登录后的回复');
    await page.locator('button', { hasText: '发表评论' }).click();
    await expect(page.locator('#comment-status')).toHaveText('评论成功');
    await expect(page.locator('#comment-list li')).toHaveText('alice: 登录后的回复');
  });

  test('admin toggle persists and starts rejecting anonymous replies', async ({ page }) => {
    await reset(page, false);
    await page.goto('/post/1');
    await page.locator('#comment').fill('先匿名');
    await page.locator('button', { hasText: '发表评论' }).click();
    await expect(page.locator('#comment-status')).toHaveText('评论成功');

    await page.goto('/admin/setting');
    await page.locator('#forceLoginComment').selectOption('true');
    await page.locator('button', { hasText: '保存' }).click();
    await expect(page.locator('#save-status')).toHaveText('更新成功！');

    const setting = await page.request.get('/api/admin/setting/waline').then((res) => res.json());
    expect(setting.data.forceLoginComment).toBe(true);

    await page.goto('/post/1');
    await page.locator('#comment').fill('再匿名');
    await page.locator('button', { hasText: '发表评论' }).click();
    await expect(page.locator('#comment-status')).toHaveText('请先登录后再评论');
  });
});
