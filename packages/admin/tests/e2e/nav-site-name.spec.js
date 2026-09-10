const { test, expect } = require('@playwright/test');

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };
const TOLERANCE = 8;

async function titleMetrics(page, which) {
  return page.evaluate((slot) => {
    const el = document.querySelector(`[data-nav-site-name="${slot}"]`);
    if (!el) {
      return null;
    }
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const leading = document.querySelector('.nav-bar-leading');
    const leadingBox = leading ? leading.getBoundingClientRect() : null;
    return {
      visible: style.display !== 'none' && rect.width > 0 && rect.height > 0,
      display: style.display,
      position: style.position,
      x: rect.x,
      width: rect.width,
      centerX: rect.x + rect.width / 2,
      viewportWidth: window.innerWidth,
      leftoverCenterX: leadingBox
        ? leadingBox.right + (window.innerWidth - leadingBox.right) / 2
        : null,
    };
  }, which);
}

test.describe('mobile header site name is viewport-centered (#262)', () => {
  test.use({
    viewport: MOBILE,
    isMobile: true,
    hasTouch: true,
  });

  test('short site name is centered on the full page width', async ({ page }) => {
    await page.goto('/nav-bar.html?name=Van');
    const mobile = page.locator('[data-nav-site-name="mobile"]');
    await expect(mobile).toBeVisible();
    await expect(mobile).toHaveText('Van');
    await expect(page.locator('[data-nav-site-name="desktop"]')).toBeHidden();

    const metrics = await titleMetrics(page, 'mobile');
    expect(metrics).toBeTruthy();
    expect(metrics.visible).toBe(true);
    expect(metrics.position).toBe('absolute');
    expect(metrics.viewportWidth).toBe(MOBILE.width);
    expect(Math.abs(metrics.centerX - metrics.viewportWidth / 2)).toBeLessThanOrEqual(
      TOLERANCE,
    );
    expect(metrics.leftoverCenterX).not.toBeNull();
    expect(Math.abs(metrics.leftoverCenterX - metrics.viewportWidth / 2)).toBeGreaterThan(
      TOLERANCE,
    );
    expect(Math.abs(metrics.centerX - metrics.leftoverCenterX)).toBeGreaterThan(TOLERANCE);
  });

  test('hamburger and search stay clickable beside the centered title', async ({ page }) => {
    await page.goto('/nav-bar.html?name=Van');
    const menu = page.getByRole('button', { name: '打开菜单' });
    const search = page.getByRole('button', { name: '搜索' });
    await expect(menu).toBeVisible();
    await expect(search).toBeVisible();
    await expect(menu).toBeEnabled();
    await expect(search).toBeEnabled();

    const menuBox = await menu.boundingBox();
    const searchBox = await search.boundingBox();
    expect(menuBox).toBeTruthy();
    expect(searchBox).toBeTruthy();
    expect(menuBox.x).toBeLessThan(MOBILE.width / 3);
    expect(searchBox.x + searchBox.width).toBeGreaterThan((MOBILE.width * 2) / 3);
  });
});

test.describe('desktop header site name layout is unchanged (#262)', () => {
  test('desktop viewport keeps the left site name and hides the mobile overlay', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/nav-bar.html?name=VanBlog');

    const desktop = page.locator('[data-nav-site-name="desktop"]');
    const mobile = page.locator('[data-nav-site-name="mobile"]');
    await expect(desktop).toBeVisible();
    await expect(desktop).toHaveText('VanBlog');
    await expect(mobile).toBeHidden();
    await expect(page.getByRole('button', { name: '打开菜单' })).toBeHidden();
    await expect(page.getByRole('link', { name: '首页' })).toBeVisible();

    const metrics = await titleMetrics(page, 'desktop');
    expect(metrics).toBeTruthy();
    expect(metrics.visible).toBe(true);
    expect(metrics.position).not.toBe('absolute');
    expect(metrics.centerX).toBeLessThan(DESKTOP.width / 3);
  });
});
