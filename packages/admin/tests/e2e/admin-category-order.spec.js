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
      name: '深度学习',
      type: 'category',
      private: false,
      hidden: false,
      order: 0,
      password: '',
    },
    {
      id: 2,
      name: 'Linux运维',
      type: 'category',
      private: false,
      hidden: false,
      order: 1,
      password: '',
    },
    {
      id: 3,
      name: '单片机',
      type: 'category',
      private: false,
      hidden: true,
      order: 2,
      password: '',
    },
    {
      id: 4,
      name: 'Python',
      type: 'category',
      private: false,
      hidden: false,
      order: 3,
      password: '',
    },
  ];
}

function sortByOrder(categories) {
  return [...categories].sort((a, b) => {
    const ao = typeof a.order === 'number' ? a.order : a.id;
    const bo = typeof b.order === 'number' ? b.order : b.id;
    return ao - bo;
  });
}

function publicCategoryNames(categories) {
  return sortByOrder(categories)
    .filter((item) => !item.hidden)
    .map((item) => item.name);
}

function applyOrder(categories, names) {
  const byName = new Map(categories.map((item) => [item.name, item]));
  const seen = new Set();
  let order = 0;
  for (const name of names) {
    const item = byName.get(name);
    if (!item || seen.has(name)) {
      continue;
    }
    item.order = order;
    order += 1;
    seen.add(name);
  }
  for (const item of sortByOrder(categories)) {
    if (seen.has(item.name)) {
      continue;
    }
    item.order = order;
    order += 1;
  }
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
    if (path === '/api/admin/category/all/order' && method === 'PUT') {
      const body = route.request().postDataJSON() || {};
      store.reorders.push(body);
      applyOrder(store.categories, body.names || []);
      return json(route, { statusCode: 200, data: body.names || [] });
    }
    if (path.startsWith('/api/admin/category/all') && method === 'GET') {
      return json(route, { statusCode: 200, data: sortByOrder(store.categories) });
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

function nameCells(page) {
  return page.locator('.ant-table-tbody tr td:first-child');
}

function moveDown(page, name) {
  return page.locator(`[data-category-move-down="${name}"]`);
}

function moveUp(page, name) {
  return page.locator(`[data-category-move-up="${name}"]`);
}

async function openCategoryAdmin(page, store) {
  await loginAsAdmin(page);
  await mockCategoryApis(page, store);
  await page.goto('/admin/site/data?tab=category');
  await expect(page.getByText('分类管理').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('深度学习', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Linux运维', { exact: true }).first()).toBeVisible();
}

test.describe('admin category order (#152)', () => {
  test('reorders in admin and public projections follow that order', async ({ page }) => {
    const store = { categories: seedCategories(), reorders: [] };
    await openCategoryAdmin(page, store);

    await expect(page.locator('.ant-table-thead').getByText('排序', { exact: true })).toBeVisible();
    await expect(nameCells(page)).toHaveText(['深度学习', 'Linux运维', '单片机', 'Python']);
    expect(publicCategoryNames(store.categories)).toEqual(['深度学习', 'Linux运维', 'Python']);

    await moveDown(page, '深度学习').click();
    await expect.poll(() => store.reorders.length, { timeout: 10_000 }).toBe(1);
    expect(store.reorders[0].names).toEqual(['Linux运维', '深度学习', '单片机', 'Python']);
    await expect(page.getByText('已调整分类顺序')).toBeVisible();
    await expect(nameCells(page)).toHaveText(['Linux运维', '深度学习', '单片机', 'Python']);
    expect(publicCategoryNames(store.categories)).toEqual(['Linux运维', '深度学习', 'Python']);
    expect(publicCategoryNames(store.categories)).not.toContain('单片机');

    await page.reload();
    await expect(nameCells(page)).toHaveText(['Linux运维', '深度学习', '单片机', 'Python']);
    await expect(moveUp(page, 'Linux运维')).toBeDisabled();
    await expect(moveDown(page, 'Python')).toBeDisabled();
  });

  test('moving up restores the previous public order and keeps hidden filtered', async ({
    page,
  }) => {
    const store = { categories: seedCategories(), reorders: [] };
    applyOrder(store.categories, ['Linux运维', '深度学习', '单片机', 'Python']);
    await openCategoryAdmin(page, store);

    await expect(nameCells(page)).toHaveText(['Linux运维', '深度学习', '单片机', 'Python']);
    expect(publicCategoryNames(store.categories)).toEqual(['Linux运维', '深度学习', 'Python']);

    await moveUp(page, '深度学习').click();
    await expect.poll(() => store.reorders.length, { timeout: 10_000 }).toBe(1);
    expect(store.reorders[0].names).toEqual(['深度学习', 'Linux运维', '单片机', 'Python']);
    await expect(nameCells(page)).toHaveText(['深度学习', 'Linux运维', '单片机', 'Python']);
    expect(publicCategoryNames(store.categories)).toEqual(['深度学习', 'Linux运维', 'Python']);
    expect(publicCategoryNames(store.categories)).not.toContain('单片机');
  });
});
