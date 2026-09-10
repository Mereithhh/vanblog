const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./admin-api-mock');

const COVER_URL = 'https://cdn.example.com/hero.webp';

function json(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function seedArticle(cover) {
  return {
    id: 288,
    title: '题头图测试文章',
    category: '测试',
    tags: ['cover'],
    hidden: false,
    top: 0,
    viewer: 1,
    pathname: 'cover-test',
    copyright: '',
    cover: cover || '',
    createdAt: '2023-04-29T00:00:00.000Z',
  };
}

async function mockArticleCoverApis(page, store) {
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
    if (path === '/api/admin/article' && method === 'GET') {
      return json(route, {
        statusCode: 200,
        data: { articles: store.articles, total: store.articles.length },
      });
    }
    if (path === '/api/admin/article/288' && method === 'GET') {
      return json(route, { statusCode: 200, data: store.articles[0] });
    }
    if (path === '/api/admin/article/288' && method === 'PUT') {
      const body = route.request().postDataJSON() || {};
      store.updates.push(body);
      Object.assign(store.articles[0], body);
      return json(route, { statusCode: 200, data: store.articles[0] });
    }
    if (path.startsWith('/api/admin/category/all') && method === 'GET') {
      return json(route, { statusCode: 200, data: ['测试'] });
    }
    if (path === '/api/admin/tag/all' && method === 'GET') {
      return json(route, { statusCode: 200, data: ['cover'] });
    }
    if (path === '/api/admin/collaborator/list' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }
    return json(route, { statusCode: 200, data: {} });
  });
}

async function openCoverForm(page, store) {
  await loginAsAdmin(page);
  await mockArticleCoverApis(page, store);
  await page.goto('/admin/article');
  await expect(page.getByText('文章管理').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('题头图测试文章')).toBeVisible();

  const row = page.locator('.ant-table-row').filter({ hasText: '题头图测试文章' });
  await row.locator('a.more-hover').click();
  await page.getByText('修改信息', { exact: true }).click();

  const dialog = page.locator('.ant-modal-content').filter({ hasText: '修改信息' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('题头图', { exact: true })).toBeVisible();
  return dialog;
}

test.describe('admin article cover (#288)', () => {
  test('sets a cover URL in 修改信息 and persists it', async ({ page }) => {
    const store = { articles: [seedArticle('')], updates: [] };
    const dialog = await openCoverForm(page, store);

    const input = dialog.locator('#cover');
    await expect(input).toBeVisible();
    await input.fill(COVER_URL);
    await dialog.getByRole('button', { name: /提\s*交|确\s*[定认]/ }).click();

    await expect.poll(() => store.updates.length, { timeout: 10_000 }).toBe(1);
    expect(store.updates[0].cover).toBe(COVER_URL);
    await expect(page.getByText('修改文章成功！')).toBeVisible();

    await page.reload();
    await expect(page.getByText('题头图测试文章')).toBeVisible();
    const row = page.locator('.ant-table-row').filter({ hasText: '题头图测试文章' });
    await row.locator('a.more-hover').click();
    await page.getByText('修改信息', { exact: true }).click();
    const again = page.locator('.ant-modal-content').filter({ hasText: '修改信息' });
    await expect(again.locator('#cover')).toHaveValue(COVER_URL);
  });

  test('clears the cover and persists the empty value', async ({ page }) => {
    const store = { articles: [seedArticle(COVER_URL)], updates: [] };
    const dialog = await openCoverForm(page, store);

    const input = dialog.locator('#cover');
    await expect(input).toHaveValue(COVER_URL);
    await dialog.locator('[data-article-cover-clear="cover"]').click();
    await expect(input).toHaveValue('');
    await dialog.getByRole('button', { name: /提\s*交|确\s*[定认]/ }).click();

    await expect.poll(() => store.updates.length, { timeout: 10_000 }).toBe(1);
    expect(store.updates[0].cover).toBe('');
  });
});
