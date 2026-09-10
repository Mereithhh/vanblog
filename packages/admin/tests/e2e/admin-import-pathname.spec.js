const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./admin-api-mock');

const HEXO_MD = `---
title: Hexo 迁移文章
date: 2023-11-22 23:18:40
categories:
  - 测试
tags:
  - hexo
abbrlink: cb933e30
---

从 archives/cb933e30.html 迁过来。
`;

const HUGO_SLUG_MD = `---
title: Hugo 迁移文章
date: 2023-11-22 23:18:40
categories:
  - 测试
tags:
  - hugo
slug: my-old-post
---

从 permalinks.post = "/post/:slug" 迁过来。
`;

const HUGO_URL_MD = `---
title: Hugo url 文章
date: 2023-11-22 23:18:40
categories:
  - 测试
tags:
  - hugo
url: /post/keep-slug
---

只有 url、没有 slug 字段。
`;

function json(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockArticleImportApis(page, created) {
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
      return json(route, { statusCode: 200, data: { articles: [], total: 0 } });
    }
    if (path === '/api/admin/article' && method === 'POST') {
      const body = route.request().postDataJSON() || {};
      created.push(body);
      return json(route, {
        statusCode: 200,
        data: { id: 383, ...body },
      });
    }
    if (path.startsWith('/api/admin/category/all') && method === 'GET') {
      return json(route, { statusCode: 200, data: ['测试'] });
    }
    if (path === '/api/admin/tag/all' && method === 'GET') {
      return json(route, { statusCode: 200, data: ['hexo'] });
    }
    if (path === '/api/admin/collaborator/list' && method === 'GET') {
      return json(route, { statusCode: 200, data: [] });
    }

    return json(route, { statusCode: 200, data: {} });
  });
}

async function openArticleAdmin(page, created) {
  await loginAsAdmin(page);
  await mockArticleImportApis(page, created);
  await page.goto('/admin/article');
  await expect(page.getByRole('heading', { name: '文章管理' }).or(page.getByText('文章管理').first())).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole('button', { name: /导\s*入/ }).last()).toBeVisible();
}

async function uploadMarkdown(page, name, content) {
  const toolbar = page.locator('.ant-pro-table-list-toolbar');
  const fileInput = toolbar.locator('input[type="file"][accept=".md"]').first();
  await fileInput.setInputFiles({
    name,
    mimeType: 'text/markdown',
    buffer: Buffer.from(content, 'utf8'),
  });
}

test.describe('admin import article pathname (#383)', () => {
  test('shows custom pathname and prefills abbrlink, user can override', async ({ page }) => {
    const created = [];
    await openArticleAdmin(page, created);

    await uploadMarkdown(page, 'hexo-post.md', HEXO_MD);

    const dialog = page.locator('.ant-modal-content').filter({ hasText: '导入文章' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#pathname')).toBeVisible();
    await expect(dialog.locator('#pathname')).toHaveValue('cb933e30');
    await expect(dialog.locator('#title')).toHaveValue('Hexo 迁移文章');

    await dialog.locator('#pathname').fill('keep-old-url');
    await dialog.getByRole('button', { name: /提\s*交|确\s*[定认]/ }).click();

    await expect.poll(() => created.length, { timeout: 10_000 }).toBe(1);
    expect(created[0].pathname).toBe('keep-old-url');
    expect(created[0].title).toBe('Hexo 迁移文章');
    expect(created[0].category).toBe('测试');
  });

  test('submits abbrlink as pathname when the user leaves the default', async ({ page }) => {
    const created = [];
    await openArticleAdmin(page, created);

    await uploadMarkdown(page, 'hexo-post.md', HEXO_MD);

    const dialog = page.locator('.ant-modal-content').filter({ hasText: '导入文章' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#pathname')).toHaveValue('cb933e30');

    await dialog.getByRole('button', { name: /提\s*交|确\s*[定认]/ }).click();

    await expect.poll(() => created.length, { timeout: 10_000 }).toBe(1);
    expect(created[0].pathname).toBe('cb933e30');
  });
});

test.describe('admin import article pathname from Hugo slug (#487)', () => {
  test('prefills slug as pathname and submits it when left unchanged', async ({ page }) => {
    const created = [];
    await openArticleAdmin(page, created);

    await uploadMarkdown(page, 'hugo-post.md', HUGO_SLUG_MD);

    const dialog = page.locator('.ant-modal-content').filter({ hasText: '导入文章' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#pathname')).toBeVisible();
    await expect(dialog.locator('#pathname')).toHaveValue('my-old-post');
    await expect(dialog.getByText('自定义路径名', { exact: false })).toBeVisible();
    await expect(dialog.locator('#title')).toHaveValue('Hugo 迁移文章');

    await dialog.getByRole('button', { name: /提\s*交|确\s*[定认]/ }).click();

    await expect.poll(() => created.length, { timeout: 10_000 }).toBe(1);
    expect(created[0].pathname).toBe('my-old-post');
    expect(created[0].title).toBe('Hugo 迁移文章');
  });

  test('prefills a simple /post/<slug> url when slug is absent', async ({ page }) => {
    const created = [];
    await openArticleAdmin(page, created);

    await uploadMarkdown(page, 'hugo-url.md', HUGO_URL_MD);

    const dialog = page.locator('.ant-modal-content').filter({ hasText: '导入文章' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#pathname')).toHaveValue('keep-slug');

    await dialog.getByRole('button', { name: /提\s*交|确\s*[定认]/ }).click();

    await expect.poll(() => created.length, { timeout: 10_000 }).toBe(1);
    expect(created[0].pathname).toBe('keep-slug');
  });
});
