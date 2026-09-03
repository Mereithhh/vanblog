const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./admin-api-mock');

function createCustomPageStore() {
  const pages = [];
  let seq = 1;

  const create = (body = {}) => {
    const doc = {
      _id: `cp-${seq++}`,
      name: body.name,
      path: body.path,
      type: body.type || 'file',
      html: body.html || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    pages.push(doc);
    return doc;
  };

  const update = (body = {}) => {
    const target = body._id
      ? pages.find((item) => item._id === body._id)
      : pages.find((item) => item.path === body.path);
    if (!target) {
      return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    }
    if (body.name != null) target.name = body.name;
    if (body.path != null) target.path = body.path;
    if (body.type != null) target.type = body.type;
    if (body.html != null) target.html = body.html;
    target.updatedAt = new Date().toISOString();
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  };

  const list = () => pages.map(({ html, ...rest }) => rest);

  return { pages, create, update, list };
}

function json(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockCustomPageApis(page, store) {
  await page.route('**/api/admin/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const path = url.pathname;

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
    if (path === '/api/admin/customPage/all' && method === 'GET') {
      return json(route, { statusCode: 200, data: store.list() });
    }
    if (path === '/api/admin/customPage' && method === 'POST') {
      const body = route.request().postDataJSON() || {};
      return json(route, { statusCode: 200, data: store.create(body) });
    }
    if (path === '/api/admin/customPage' && method === 'PUT') {
      const body = route.request().postDataJSON() || {};
      return json(route, { statusCode: 200, data: store.update(body) });
    }
    if (path === '/api/admin/customPage' && method === 'GET') {
      const found = store.pages.find((item) => item.path === url.searchParams.get('path'));
      return json(route, { statusCode: 200, data: found || null });
    }
    if (path === '/api/admin/collaborator/list' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }

    return json(route, { statusCode: 200, data: [] });
  });
}

async function openCustomPageAdmin(page, store) {
  await loginAsAdmin(page);
  await mockCustomPageApis(page, store);
  await page.goto('/admin/site/customPage');
  await expect(page.getByRole('button', { name: /新\s*建/ })).toBeVisible({ timeout: 30_000 });
}

async function submitModal(dialog) {
  const submit = dialog.getByRole('button', { name: /提\s*交|确\s*[定认]/ });
  await expect(submit).toBeVisible();
  await submit.click();
}

test.describe('custom page info persists', () => {
  test('create then 修改信息 keeps new name and path after reload', async ({ page }) => {
    const store = createCustomPageStore();
    await openCustomPageAdmin(page, store);

    await page.getByRole('button', { name: /新\s*建/ }).click();
    const createDialog = page.locator('.ant-modal-content').filter({ hasText: '新建自定义页面' });
    await expect(createDialog).toBeVisible();

    await createDialog.locator('.ant-form-item').filter({ hasText: '类型' }).locator('.ant-select').click();
    await page.locator('.ant-select-item-option-content').filter({ hasText: '单文件页面' }).click();
    await createDialog.locator('#name').fill('旧名称');
    await createDialog.locator('#path').fill('/old-path');
    await submitModal(createDialog);

    await expect(page.getByText('旧名称')).toBeVisible();
    await expect(page.getByText('/old-path')).toBeVisible();
    expect(store.list()).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: '旧名称', path: '/old-path' })]),
    );

    await page.getByText('修改信息', { exact: true }).click();
    const editDialog = page.locator('.ant-modal-content').filter({ hasText: '修改自定义页面' });
    await expect(editDialog).toBeVisible();
    await expect(editDialog.locator('#name')).toHaveValue('旧名称');
    await expect(editDialog.locator('#path')).toHaveValue('/old-path');

    await editDialog.locator('#name').fill('新名称');
    await editDialog.locator('#path').fill('/new-path');
    await submitModal(editDialog);

    await expect(page.getByText('新名称')).toBeVisible();
    await expect(page.getByText('/new-path')).toBeVisible();
    await expect(page.getByText('旧名称')).toHaveCount(0);
    expect(store.list()).toEqual([
      expect.objectContaining({
        _id: 'cp-1',
        name: '新名称',
        path: '/new-path',
      }),
    ]);

    await page.reload();
    await expect(page.getByText('新名称')).toBeVisible();
    await expect(page.getByText('/new-path')).toBeVisible();
    await expect(page.getByText('旧名称')).toHaveCount(0);
    await expect(page.getByText('/old-path')).toHaveCount(0);
  });
});
