const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./admin-api-mock');

const LOGIN_ROW = {
  time: '2024-01-02T03:04:05.000Z',
  address: '上海-测试区',
  ip: '203.0.113.10',
  platform: 'Firefox',
  success: true,
};

const SYSTEM_LINES = ['vanblog-system-line-ok', 'audit-api-ready'];

function json(route, body) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

test.describe('admin log management uses adblock-safe audit API', () => {
  test('loads rows from /api/admin/audit and never fetches /api/admin/log', async ({
    page,
  }) => {
    const auditUrls = [];
    const blockedLogUrls = [];

    await loginAsAdmin(page);
    await page.route('**/api/admin/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const method = route.request().method();

      // Simulate uBlock Origin dropping the old path.
      if (path === '/api/admin/log') {
        blockedLogUrls.push(url.href);
        return route.abort('blockedbyclient');
      }

      if (path === '/api/admin/audit' && method === 'GET') {
        auditUrls.push(url.href);
        const event = url.searchParams.get('event');
        if (event === 'login') {
          return json(route, {
            statusCode: 200,
            data: { data: [LOGIN_ROW], total: 1 },
          });
        }
        if (event === 'system') {
          return json(route, {
            statusCode: 200,
            data: { data: SYSTEM_LINES, total: SYSTEM_LINES.length },
          });
        }
        return json(route, { statusCode: 200, data: { data: [], total: 0 } });
      }

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

    await page.goto('/admin/site/log');
    await expect(page.getByText('系统日志（每5s自动刷新）')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('vanblog-system-line-ok')).toBeVisible();
    await expect(page.getByText('audit-api-ready')).toBeVisible();

    await page.getByRole('tab', { name: '登录日志' }).click();
    await expect(page.getByText('上海-测试区')).toBeVisible();
    await expect(page.getByText('203.0.113.10')).toBeVisible();
    await expect(page.getByText('Firefox')).toBeVisible();
    await expect(page.locator('.ant-tag').filter({ hasText: '成功' })).toBeVisible();

    expect(blockedLogUrls, 'old /api/admin/log must not be requested').toEqual([]);
    expect(auditUrls.length).toBeGreaterThan(0);
    expect(auditUrls.every((href) => href.includes('/api/admin/audit'))).toBe(true);
    expect(auditUrls.some((href) => /[?&]event=system(?:&|$)/.test(href))).toBe(true);
    expect(auditUrls.some((href) => /[?&]event=login(?:&|$)/.test(href))).toBe(true);
    expect(auditUrls.every((href) => !/\/api\/admin\/log(?:\?|$)/.test(href))).toBe(
      true,
    );
  });
});
