const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./admin-api-mock');

function json(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function seedArticles() {
  return [
    {
      id: 268,
      title: '可见文章',
      category: '测试',
      tags: ['list'],
      hidden: false,
      top: 0,
      viewer: 1,
      createdAt: '2023-03-29T00:00:00.000Z',
    },
    {
      id: 269,
      title: '已隐藏文章',
      category: '测试',
      tags: ['list'],
      hidden: true,
      top: 0,
      viewer: 2,
      createdAt: '2023-03-29T00:00:00.000Z',
    },
  ];
}

async function mockArticleListApis(page, store) {
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
    const putMatch = path.match(/^\/api\/admin\/article\/(\d+)$/);
    if (putMatch && method === 'PUT') {
      const id = Number(putMatch[1]);
      const body = route.request().postDataJSON() || {};
      store.updates.push({ id, body });
      const article = store.articles.find((item) => item.id === id);
      if (article && typeof body.hidden === 'boolean') {
        article.hidden = body.hidden;
      }
      return json(route, { statusCode: 200, data: article || body });
    }
    if (path.startsWith('/api/admin/category/all') && method === 'GET') {
      return json(route, { statusCode: 200, data: ['测试'] });
    }
    if (path === '/api/admin/tag/all' && method === 'GET') {
      return json(route, { statusCode: 200, data: ['list'] });
    }
    if (path === '/api/admin/collaborator/list' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }
    return json(route, { statusCode: 200, data: {} });
  });
}

function hiddenSwitch(page, id) {
  return page.locator(`[data-article-hidden-toggle="${id}"] [role="switch"]`);
}

async function openArticleAdmin(page, store) {
  await loginAsAdmin(page);
  await mockArticleListApis(page, store);
  await page.goto('/admin/article');
  await expect(page.getByText('文章管理').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('可见文章')).toBeVisible();
  await expect(page.getByText('已隐藏文章')).toBeVisible();
}

test.describe('admin article list hidden column (#268)', () => {
  test('shows hidden status on the list and toggling persists after reload', async ({ page }) => {
    const store = { articles: seedArticles(), updates: [] };
    await openArticleAdmin(page, store);

    await expect(page.getByRole('columnheader', { name: '是否隐藏' })).toBeVisible();

    const visibleToggle = hiddenSwitch(page, 268);
    const hiddenToggle = hiddenSwitch(page, 269);
    await expect(visibleToggle).toBeVisible();
    await expect(hiddenToggle).toBeVisible();
    await expect(visibleToggle).toHaveAttribute('aria-checked', 'false');
    await expect(hiddenToggle).toHaveAttribute('aria-checked', 'true');
    await expect(visibleToggle).toHaveText('否');
    await expect(hiddenToggle).toHaveText('是');

    await visibleToggle.click();
    await expect.poll(() => store.updates.length, { timeout: 10_000 }).toBe(1);
    expect(store.updates[0].id).toBe(268);
    expect(store.updates[0].body).toEqual({ hidden: true });
    await expect(hiddenSwitch(page, 268)).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText('已设为隐藏')).toBeVisible();

    await page.reload();
    await expect(page.getByText('可见文章')).toBeVisible();
    await expect(hiddenSwitch(page, 268)).toHaveAttribute('aria-checked', 'true');
    await expect(hiddenSwitch(page, 269)).toHaveAttribute('aria-checked', 'true');
    await expect(hiddenSwitch(page, 268)).toHaveText('是');
  });

  test('unhiding from the list updates the API and survives reload', async ({ page }) => {
    const store = { articles: seedArticles(), updates: [] };
    await openArticleAdmin(page, store);

    const hiddenToggle = hiddenSwitch(page, 269);
    await hiddenToggle.click();
    await expect.poll(() => store.updates.length, { timeout: 10_000 }).toBe(1);
    expect(store.updates[0].id).toBe(269);
    expect(store.updates[0].body).toEqual({ hidden: false });
    await expect(hiddenSwitch(page, 269)).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByText('已取消隐藏')).toBeVisible();

    await page.reload();
    await expect(page.getByText('已隐藏文章')).toBeVisible();
    await expect(hiddenSwitch(page, 269)).toHaveAttribute('aria-checked', 'false');
    await expect(hiddenSwitch(page, 269)).toHaveText('否');
    await expect(hiddenSwitch(page, 268)).toHaveAttribute('aria-checked', 'false');
  });
});
