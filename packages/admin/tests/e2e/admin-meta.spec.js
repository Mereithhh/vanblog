const { test, expect } = require('@playwright/test');

test.describe('admin meta is not blocked by version check', () => {
  test('/api/admin/meta and admin dashboard stay fast when version API is delayed', async ({
    page,
  }) => {
    await page.request.post('/e2e/reset', {
      data: { versionDelayMs: 3000, versionReachable: true },
    });

    const started = Date.now();
    const meta = await page.request.get('/api/admin/meta').then((res) => res.json());
    const elapsed = Date.now() - started;

    expect(elapsed).toBeLessThan(500);
    expect(meta.statusCode).toBe(200);
    expect(meta.data.version).toBe('0.54.0');
    expect(meta.data.latestVersion).toBe('0.54.0');

    await page.goto('/admin');
    await expect(page.locator('#dashboard-status')).toHaveText('后台已就绪');
    await expect(page.locator('#local-version')).toHaveText('0.54.0');
    const uiDuration = Number(await page.locator('#meta-duration').innerText());
    expect(uiDuration).toBeLessThan(500);
  });

  test('update hint appears from cache after a background refresh', async ({ page }) => {
    await page.request.post('/e2e/reset', {
      data: { versionDelayMs: 200, versionReachable: true },
    });

    const started = Date.now();
    const first = await page.request.get('/api/admin/meta').then((res) => res.json());
    expect(Date.now() - started).toBeLessThan(500);
    expect(first.statusCode).toBe(200);

    await page.goto('/admin');
    await expect(page.locator('#dashboard-status')).toHaveText('后台已就绪');
    await page.waitForTimeout(400);
    await page.locator('#refresh-meta').click();
    await expect(page.locator('#latest-version')).toHaveText('0.99.0');
    const refreshDuration = Number(await page.locator('#meta-duration').innerText());
    expect(refreshDuration).toBeLessThan(500);
  });

  test('/api/admin/meta fail-opens when version API is unreachable', async ({ page }) => {
    await page.request.post('/e2e/reset', {
      data: { versionDelayMs: 3000, versionReachable: false },
    });

    const started = Date.now();
    const meta = await page.request.get('/api/admin/meta').then((res) => res.json());
    expect(Date.now() - started).toBeLessThan(500);
    expect(meta.data.latestVersion).toBe(meta.data.version);

    await page.goto('/admin');
    await expect(page.locator('#dashboard-status')).toHaveText('后台已就绪');
  });
});
