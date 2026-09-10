const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./admin-api-mock');

function json(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function seedCategories() {
  return [
    {
      id: 1,
      name: '随笔',
      type: 'category',
      private: false,
      hidden: false,
      password: '',
    },
    {
      id: 2,
      name: '教程',
      type: 'category',
      private: false,
      hidden: false,
      password: '',
    },
  ];
}

async function mockRenameApis(page, store) {
  await page.route('**/api/admin/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/admin/meta' && method === 'GET') {
      return json(route, {
        statusCode: 200,
        data: {
          version: 'dev',
          latestVersion: 'dev',
          updatedAt: new Date().toISOString(),
          user: { id: 0, name: 'admin' },
          baseUrl: 'http://127.0.0.1:3002',
          enableComment: 'true',
          allowDomains: '',
        },
      });
    }
    if (path.startsWith('/api/admin/category/all') && method === 'GET') {
      return json(route, { statusCode: 200, data: store.categories });
    }
    if (path === '/api/admin/tag/all' && method === 'GET') {
      return json(route, { statusCode: 200, data: store.tags });
    }
    if (path === '/api/admin/collaborator/list' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }
    return json(route, { statusCode: 200, data: {} });
  });

  await page.route('**/api/public/**', async (route) => {
    return json(route, { statusCode: 200, data: {} });
  });
}

function categoryRenameLink(page, name) {
  return page.locator(`.ant-table-tbody [data-category-rename="${name}"]`);
}

function tagRenameLink(page, name) {
  return page.locator(`.ant-table-tbody [data-tag-rename="${name}"]`);
}

test.describe('admin rename copy (#194)', () => {
  test('category and tag rename actions share 重命名 wording', async ({ page }) => {
    const store = { categories: seedCategories(), tags: ['随笔标签', '教程标签'] };
    await loginAsAdmin(page);
    await mockRenameApis(page, store);

    await page.goto('/admin/site/data?tab=category');
    await expect(page.getByText('分类管理').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('随笔', { exact: true }).first()).toBeVisible();

    await expect(categoryRenameLink(page, '随笔')).toBeVisible();
    await expect(categoryRenameLink(page, '教程')).toBeVisible();
    await expect(categoryRenameLink(page, '随笔')).toHaveText('重命名');
    await expect(page.getByRole('link', { name: '批量改名' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: '修改', exact: true })).toHaveCount(0);
    await expect(page.getByText('修改分类')).toHaveCount(0);

    await categoryRenameLink(page, '随笔').click();
    const categoryModal = page.locator('.ant-modal').filter({ hasText: '重命名分类 "随笔"' });
    await expect(categoryModal).toBeVisible();
    await expect(categoryModal.locator('.ant-modal-title')).toHaveText('重命名分类 "随笔"');
    await expect(page.getByText('批量修改标签')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(categoryModal).toHaveCount(0);

    await page.goto('/admin/site/data?tab=tag');
    await expect(page.getByText('标签管理').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('随笔标签', { exact: true }).first()).toBeVisible();

    await expect(tagRenameLink(page, '随笔标签')).toBeVisible();
    await expect(tagRenameLink(page, '教程标签')).toBeVisible();
    await expect(tagRenameLink(page, '随笔标签')).toHaveText('重命名');
    await expect(page.getByRole('link', { name: '批量改名' })).toHaveCount(0);
    await expect(page.getByText('批量修改标签')).toHaveCount(0);

    await tagRenameLink(page, '随笔标签').click();
    const tagModal = page.locator('.ant-modal').filter({ hasText: '重命名标签 "随笔标签"' });
    await expect(tagModal).toBeVisible();
    await expect(tagModal.locator('.ant-modal-title')).toHaveText('重命名标签 "随笔标签"');
    await expect(page.getByText('修改分类')).toHaveCount(0);
  });
});
