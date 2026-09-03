const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./admin-api-mock');

function json(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function createFolderStore() {
  const files = new Map();
  const uploads = [];
  const deletes = [];

  const treeFromFiles = () => {
    const root = [];
    const dirs = new Map();
    const ensureDir = (dirKey) => {
      if (!dirKey) return root;
      if (dirs.has(dirKey)) return dirs.get(dirKey).children;
      const parts = dirKey.split('/');
      const title = parts[parts.length - 1];
      const parentKey = parts.slice(0, -1).join('/');
      const node = { title, key: dirKey, type: 'directory', children: [] };
      dirs.set(dirKey, node);
      ensureDir(parentKey).push(node);
      return node.children;
    };
    for (const key of [...files.keys()].sort()) {
      const parts = key.split('/');
      const title = parts[parts.length - 1];
      const parentKey = parts.slice(0, -1).join('/');
      ensureDir(parentKey).push({ title, key, type: 'file', isLeaf: true });
    }
    return root;
  };

  return { files, uploads, deletes, treeFromFiles };
}

async function mockFolderApis(page, store) {
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
    if (path === '/api/admin/customPage/folder' && method === 'GET') {
      return json(route, { statusCode: 200, data: store.treeFromFiles() });
    }
    if (path === '/api/admin/customPage/file' && method === 'GET') {
      const key = url.searchParams.get('key');
      return json(route, { statusCode: 200, data: store.files.get(key) || '' });
    }
    if (path === '/api/admin/customPage/file' && method === 'DELETE') {
      const key = url.searchParams.get('key');
      store.deletes.push({ path: url.searchParams.get('path'), key });
      store.files.delete(key);
      return json(route, { statusCode: 200, data: true });
    }
    if (path === '/api/admin/customPage/upload' && method === 'POST') {
      const pagePath = url.searchParams.get('path');
      const name = url.searchParams.get('name');
      store.uploads.push({ path: pagePath, name });
      store.files.set(name, `uploaded:${name}`);
      return json(route, { statusCode: 200, data: { src: name, isNew: true } });
    }
    if (path === '/api/admin/pipeline/config' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }
    if (path === '/api/admin/collaborator/list' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }
    return json(route, { statusCode: 200, data: [] });
  });
}

test.describe('custom page multi-file upload and delete', () => {
  test('upload file, folder nested path, then delete file', async ({ page }) => {
    const store = createFolderStore();
    store.files.set('keep.html', '<p>keep</p>');
    await loginAsAdmin(page);
    await mockFolderApis(page, store);
    await page.goto('/admin/code?type=folder&path=/clock');
    await expect(page.getByText('keep.html')).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: /操\s*作/ }).click();
    const fileInput = page.locator('.ant-dropdown input[type="file"]:not([webkitdirectory])');
    await fileInput.setInputFiles({
      name: 'hello.html',
      mimeType: 'text/html',
      buffer: Buffer.from('<p>hello</p>'),
    });
    await expect.poll(() => store.uploads).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: '/clock', name: 'hello.html' })]),
    );
    await expect(page.getByText('hello.html')).toBeVisible();

    await page.getByRole('button', { name: /操\s*作/ }).click();
    const folderInput = page.locator('.ant-dropdown input[webkitdirectory]');
    await folderInput.setInputFiles({
      name: 'style.css',
      mimeType: 'text/css',
      buffer: Buffer.from('body{}'),
    });
    await expect.poll(() => store.uploads.length).toBeGreaterThanOrEqual(2);

    await page.getByText('hello.html').click();
    await page.getByRole('button', { name: /操\s*作/ }).click();
    await page.getByText('删除文件', { exact: true }).click();
    const confirm = page.locator('.ant-modal-content').filter({ hasText: '删除确认' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: /确\s*[定认]/ }).click();
    await expect.poll(() => store.deletes).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: '/clock', key: 'hello.html' })]),
    );
    await expect(page.getByText('hello.html')).toHaveCount(0);
    await expect(page.getByText('keep.html')).toBeVisible();
  });
});
