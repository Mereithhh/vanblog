const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./admin-api-mock');

function json(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

test.describe('comment admin opens Waline outside the iframe (#121)', () => {
  test('在新窗口打开 points at /ui/ in a new tab', async ({ page }) => {
    await loginAsAdmin(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('CommentTipped', 'true');
    });

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

      if (path === '/api/admin/collaborator/list' && method === 'GET') {
        return json(route, { statusCode: 200, data: [] });
      }

      return json(route, { statusCode: 200, data: {} });
    });

    // Dev builds point the embedded iframe at a LAN Waline. Abort it so the
    // header link can be asserted without waiting on that host.
    await page.route('http://192.168.5.11:8360/**', (route) => route.abort());

    await page.goto('/admin/site/comment');

    const openLink = page.getByRole('link', { name: '在新窗口打开' });
    await expect(openLink).toBeVisible({ timeout: 30_000 });
    await expect(openLink).toHaveAttribute('href', '/ui/');
    await expect(openLink).toHaveAttribute('target', '_blank');
    await expect(openLink).toHaveAttribute('rel', /noopener/);

    // Ant Design inserts a space between a two-character Chinese label ("帮 助").
    const helpButton = page.getByRole('button', { name: /帮\s*助/ });
    await expect(helpButton).toBeVisible();
    const dialog = page.getByRole('dialog');
    if (!(await dialog.isVisible())) {
      await helpButton.click();
    }
    await expect(dialog).toContainText('GITHUB_ID');
    await expect(dialog).toContainText('GITHUB_SECRET');
    await expect(dialog).toContainText('顶层窗口');
    await expect(dialog).toContainText('/ui/');
  });
});
