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
      name: '私密',
      type: 'category',
      private: false,
      hidden: true,
      password: '',
    },
    {
      id: 3,
      name: '教程',
      type: 'category',
      private: false,
      hidden: false,
      password: '',
    },
  ];
}

function publicCategoryNames(categories) {
  return categories.filter((item) => !item.hidden).map((item) => item.name);
}

async function mockCategoryApis(page, store) {
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
    const putMatch = path.match(/^\/api\/admin\/category\/(.+)$/);
    if (putMatch && method === 'PUT') {
      const name = decodeURIComponent(putMatch[1]);
      const body = route.request().postDataJSON() || {};
      store.updates.push({ name, body });
      const category = store.categories.find((item) => item.name === name);
      if (category && typeof body.hidden === 'boolean') {
        category.hidden = body.hidden;
      }
      return json(route, { statusCode: 200, data: category || body });
    }
    if (path === '/api/admin/collaborator/list' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }
    return json(route, { statusCode: 200, data: {} });
  });

  await page.route('**/api/public/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path === '/api/public/meta') {
      return json(route, {
        statusCode: 200,
        data: { meta: { categories: publicCategoryNames(store.categories) } },
      });
    }
    if (path === '/api/public/category') {
      const data = {};
      for (const name of publicCategoryNames(store.categories)) {
        data[name] = [];
      }
      return json(route, { statusCode: 200, data });
    }
    return json(route, { statusCode: 200, data: {} });
  });
}

function hiddenSwitch(page, name) {
  return page.locator(`[data-category-hidden-toggle="${name}"] [role="switch"]`);
}

async function openCategoryAdmin(page, store) {
  await loginAsAdmin(page);
  await mockCategoryApis(page, store);
  await page.goto('/admin/site/data?tab=category');
  await expect(page.getByText('分类管理').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('随笔', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('私密', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('教程', { exact: true }).first()).toBeVisible();
}

test.describe('admin category hidden column (#359)', () => {
  test('sets hide in admin and public projections omit that category', async ({ page }) => {
    const store = { categories: seedCategories(), updates: [] };
    await openCategoryAdmin(page, store);

    await expect(page.locator('.ant-table-thead').getByText('是否隐藏', { exact: true })).toBeVisible();
    await expect(page.locator('.ant-table-thead').getByText('加密', { exact: true })).toBeVisible();

    const visibleToggle = hiddenSwitch(page, '随笔');
    const hiddenToggle = hiddenSwitch(page, '私密');
    const otherToggle = hiddenSwitch(page, '教程');
    await expect(visibleToggle).toHaveAttribute('aria-checked', 'false');
    await expect(hiddenToggle).toHaveAttribute('aria-checked', 'true');
    await expect(otherToggle).toHaveAttribute('aria-checked', 'false');

    expect(publicCategoryNames(store.categories)).toEqual(['随笔', '教程']);

    await visibleToggle.click();
    await expect.poll(() => store.updates.length, { timeout: 10_000 }).toBe(1);
    expect(store.updates[0].name).toBe('随笔');
    expect(store.updates[0].body).toEqual({ hidden: true });
    await expect(hiddenSwitch(page, '随笔')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText('已设为隐藏')).toBeVisible();
    expect(publicCategoryNames(store.categories)).toEqual(['教程']);
    expect(publicCategoryNames(store.categories)).not.toContain('随笔');
    expect(publicCategoryNames(store.categories)).not.toContain('私密');

    await page.reload();
    await expect(page.getByText('随笔', { exact: true }).first()).toBeVisible();
    await expect(hiddenSwitch(page, '随笔')).toHaveAttribute('aria-checked', 'true');
    await expect(hiddenSwitch(page, '教程')).toHaveAttribute('aria-checked', 'false');
    await expect(hiddenSwitch(page, '教程')).toHaveText('否');
  });

  test('clears hide in admin and leaves other categories unchanged', async ({ page }) => {
    const store = { categories: seedCategories(), updates: [] };
    await openCategoryAdmin(page, store);

    const hiddenToggle = hiddenSwitch(page, '私密');
    await hiddenToggle.click();
    await expect.poll(() => store.updates.length, { timeout: 10_000 }).toBe(1);
    expect(store.updates[0].name).toBe('私密');
    expect(store.updates[0].body).toEqual({ hidden: false });
    await expect(hiddenSwitch(page, '私密')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByText('已取消隐藏')).toBeVisible();
    expect(publicCategoryNames(store.categories)).toEqual(['随笔', '私密', '教程']);

    await page.reload();
    await expect(page.getByText('私密', { exact: true }).first()).toBeVisible();
    await expect(hiddenSwitch(page, '私密')).toHaveAttribute('aria-checked', 'false');
    await expect(hiddenSwitch(page, '私密')).toHaveText('否');
    await expect(hiddenSwitch(page, '随笔')).toHaveAttribute('aria-checked', 'false');
    await expect(hiddenSwitch(page, '教程')).toHaveAttribute('aria-checked', 'false');
  });
});
