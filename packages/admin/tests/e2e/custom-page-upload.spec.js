const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./admin-api-mock');

function filesToTree(files) {
  const root = [];
  const ensureDir = (parts) => {
    let level = root;
    let key = '';
    for (const part of parts) {
      key = key ? `${key}/${part}` : part;
      let node = level.find((item) => item.title === part && item.type === 'directory');
      if (!node) {
        node = { title: part, key, type: 'directory', children: [] };
        level.push(node);
      }
      level = node.children;
    }
    return level;
  };
  for (const rel of [...files.keys()].sort()) {
    const parts = rel.split('/');
    const name = parts.pop();
    const parent = parts.length ? ensureDir(parts) : root;
    parent.push({ title: name, key: rel, type: 'file', isLeaf: true });
  }
  return root;
}

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
  return {
    files,
    uploads,
    deletes,
    addFile(relPath, content) {
      files.set(String(relPath || '').replace(/\\/g, '/'), content);
    },
    removeFile(relPath) {
      files.delete(String(relPath || '').replace(/\\/g, '/'));
    },
    tree() {
      return filesToTree(files);
    },
  };
}

async function mockFolderApis(page, store) {
  await page.route('**/api/admin/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const pathname = url.pathname;

    if (pathname === '/api/admin/meta' && method === 'GET') {
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
    if (pathname === '/api/admin/pipeline/config' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }
    if (pathname === '/api/admin/customPage/folder' && method === 'GET') {
      return json(route, { statusCode: 200, data: store.tree() });
    }
    if (pathname === '/api/admin/customPage/file' && method === 'GET') {
      const key = url.searchParams.get('key');
      return json(route, { statusCode: 200, data: store.files.get(key) || '' });
    }
    if (pathname === '/api/admin/customPage/file' && method === 'DELETE') {
      const key = url.searchParams.get('key');
      store.deletes.push(key);
      store.removeFile(key);
      return json(route, { statusCode: 200, data: true });
    }
    if (pathname === '/api/admin/customPage/upload' && method === 'POST') {
      const name = url.searchParams.get('name');
      store.uploads.push(name);
      store.addFile(name, `uploaded:${name}`);
      return json(route, { statusCode: 200, data: { src: name, isNew: true } });
    }
    if (pathname === '/api/admin/collaborator/list' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }

    return json(route, { statusCode: 200, data: [] });
  });
}

async function openFolderEditor(page, store) {
  await loginAsAdmin(page);
  await mockFolderApis(page, store);
  await page.goto('/code?type=folder&path=/door');
  await expect(page.getByRole('button', { name: /操\s*作/ })).toBeVisible({ timeout: 30_000 });
}

function uploadedName(uploads, suffix) {
  return uploads.find((name) => name === suffix || name.endsWith(`/${suffix}`));
}

test.describe('custom page multi-file upload', () => {
  test('upload file, upload folder (nested), then delete a file', async ({ page }) => {
    const store = createFolderStore();
    await openFolderEditor(page, store);

    await page.getByRole('button', { name: /操\s*作/ }).click();
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('上传文件', { exact: true }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'note.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from('# note'),
    });

    await expect.poll(() => store.uploads).toEqual(['note.md']);
    await expect(page.getByText('note.md', { exact: true })).toBeVisible();

    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /操\s*作/ }).click();
    const folderChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('上传文件夹', { exact: true }).click();
    const folderChooser = await folderChooserPromise;
    expect(folderChooser.isMultiple()).toBeTruthy();
    // Linux/CI filechooser does not reliably ingest a directory path. Feed the
    // nested files as payloads so webkitRelativePath / name keep the folder layout.
    await folderChooser.setFiles([
      {
        name: 'site/index.html',
        mimeType: 'text/html',
        buffer: Buffer.from('<h1>hi</h1>'),
      },
      {
        name: 'site/css/style.css',
        mimeType: 'text/css',
        buffer: Buffer.from('body{}'),
      },
    ]);

    await expect.poll(() => uploadedName(store.uploads, 'index.html'), { timeout: 15_000 }).toBeTruthy();
    await expect.poll(() => uploadedName(store.uploads, 'css/style.css')).toBeTruthy();
    expect(store.uploads).toContain('note.md');

    const closed = page.locator('.file-tree .ant-tree-switcher_close');
    for (let i = 0; i < 8 && (await closed.count()); i += 1) {
      await closed.first().click();
    }

    await expect(page.getByText('note.md', { exact: true })).toBeVisible();
    await expect(page.getByText('index.html', { exact: true })).toBeVisible();
    await expect(page.getByText('style.css', { exact: true })).toBeVisible();

    await page.getByText('note.md', { exact: true }).click();
    await page.getByRole('button', { name: /操\s*作/ }).click();
    await page.getByText('删除文件', { exact: true }).click();
    const confirm = page.locator('.ant-modal-content').filter({ hasText: '删除确认' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: /确\s*[定认]/ }).click();

    await expect.poll(() => store.deletes).toEqual(['note.md']);
    await expect(page.getByText('note.md', { exact: true })).toHaveCount(0);
    await expect(page.getByText('index.html', { exact: true })).toBeVisible();
    await expect(page.getByText('style.css', { exact: true })).toBeVisible();
  });
});
