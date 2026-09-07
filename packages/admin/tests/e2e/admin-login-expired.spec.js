const { test, expect } = require('@playwright/test');

const EXPIRED_TOKEN = 'expired-admin-token';
const FRESH_TOKEN = 'fresh-admin-token';

const META_OK = {
  statusCode: 200,
  data: {
    version: 'dev',
    latestVersion: 'dev',
    updatedAt: new Date().toISOString(),
    user: { id: 0, name: 'admin', type: 'admin' },
    baseUrl: 'http://127.0.0.1:3002',
    enableComment: 'true',
    allowDomains: '',
  },
};

function json(route, body, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function requestToken(route) {
  return route.request().headers().token || route.request().headers().Token || '';
}

async function mockExpiredThenLogin(page, { delayExpiredMs = 0 } = {}) {
  await page.route('**/api/admin/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();
    const token = requestToken(route);

    if (path === '/api/admin/auth/login' && method === 'POST') {
      return json(route, {
        statusCode: 200,
        data: {
          token: FRESH_TOKEN,
          user: { id: 0, name: 'admin' },
        },
      });
    }

    const expired = !token || token === 'null' || token === EXPIRED_TOKEN;
    if (expired) {
      if (delayExpiredMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayExpiredMs));
      }
      return json(
        route,
        { statusCode: 401, message: 'Unauthorized' },
        401,
      );
    }

    if (path === '/api/admin/meta' && method === 'GET') {
      return json(route, META_OK);
    }

    return json(route, { statusCode: 200, data: {} });
  });
}

async function submitAdminLogin(page) {
  const username = page.locator('#username');
  const password = page.locator('#password');
  await expect(username).toBeVisible({ timeout: 30_000 });
  await username.fill('admin');
  await password.fill('admin');
  // Ant Design 4 inserts a space between two Chinese characters on large buttons.
  await page.locator('button.ant-btn-primary').filter({ hasText: /登\s*录/ }).click();
}

test.describe('admin re-login after session expiry (#316)', () => {
  test('successful re-login after unauthorized state only shows 登录成功', async ({
    page,
  }) => {
    await page.addInitScript((token) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('theme', 'light');
    }, EXPIRED_TOKEN);

    await mockExpiredThenLogin(page);

    await page.goto('/admin/article');
    await expect(page.locator('#username')).toBeVisible({ timeout: 30_000 });

    const errorToast = page.locator('.ant-message-error');
    const successToast = page.locator('.ant-message-success');
    await expect(errorToast.getByText('登录失效')).toBeVisible({ timeout: 15_000 });

    await submitAdminLogin(page);

    await expect(successToast.getByText('登录成功')).toBeVisible({ timeout: 15_000 });
    await expect(errorToast).toHaveCount(0);
    await expect(page.locator('.ant-message-notice').getByText('登录失效')).toHaveCount(0);
    await expect(page.locator('.ant-message-notice').getByText('用户名或密码错误')).toHaveCount(
      0,
    );
  });

  test('late 401 from the expired request does not stack with 登录成功', async ({
    page,
  }) => {
    await page.addInitScript((token) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('theme', 'light');
    }, EXPIRED_TOKEN);

    // Hold the unauthorized response so it can land after submit, like the
    // in-flight request that originally sent the user to the login page.
    await mockExpiredThenLogin(page, { delayExpiredMs: 1200 });

    await page.goto('/admin/user/login');
    await submitAdminLogin(page);

    await expect(page.locator('.ant-message-success').getByText('登录成功')).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForTimeout(1500);
    await expect(page.locator('.ant-message-error')).toHaveCount(0);
    await expect(page.locator('.ant-message-notice').getByText('登录失效')).toHaveCount(0);
  });
});
