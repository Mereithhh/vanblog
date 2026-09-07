const { test, expect } = require('@playwright/test');

function expectNoStore(headers) {
  expect(headers['cache-control'] || '').toMatch(/no-store/i);
  expect(headers['cache-control'] || '').toMatch(/private/i);
  expect(headers['cdn-cache-control']).toBe('no-store');
  expect(headers['cloudflare-cdn-cache-control']).toBe('no-store');
}

test.describe('admin HTML is not cacheable (#140)', () => {
  test('GET /admin/user/login sends private no-store to CDNs', async ({ page }) => {
    const res = await page.request.get('/admin/user/login');
    expect(res.ok()).toBeTruthy();
    expectNoStore(res.headers());
  });
});
