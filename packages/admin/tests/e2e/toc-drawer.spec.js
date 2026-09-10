const { test, expect } = require('@playwright/test');

async function headingMetrics(page, dataId) {
  return page.evaluate((id) => {
    const el = [...document.querySelectorAll('h1[data-id], h2[data-id], h3[data-id], h4[data-id], h5[data-id], h6[data-id]')].find(
      (node) => node.getAttribute('data-id') === id,
    );
    if (!el) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    return {
      dataId: el.getAttribute('data-id'),
      offsetTop: el.offsetTop,
      inViewport: rect.top >= 0 && rect.top < window.innerHeight,
      scrollY: window.scrollY,
    };
  }, dataId);
}

test.describe('mobile article TOC drawer (#451)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('FAB is hidden when the article has no TOC', async ({ page }) => {
    await page.goto('/toc-article.html?empty=1');
    await expect(page.locator('[data-toc-fab]')).toHaveCount(0);
    await expect(page.locator('[data-toc-drawer]')).toHaveCount(0);
    await expect(page.locator('.markdown-navigation .title-anchor')).toHaveCount(0);
  });

  test('FAB opens a right drawer with TOC entries when headings exist', async ({ page }) => {
    await page.goto('/toc-article.html');
    await expect(page.locator('h2[data-id="Clean Title"]')).toBeVisible();

    const fab = page.locator('[data-toc-fab]');
    await expect(fab).toBeVisible();
    await expect(fab).toHaveAttribute('aria-label', '打开目录');
    await expect(page.locator('[data-toc-drawer]')).toHaveCount(0);

    await fab.click();
    const drawer = page.locator('[data-toc-drawer]');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer.locator('.markdown-navigation .title-anchor')).toContainText([
      'My Title',
      'Extra Spaces',
      'Clean Title',
    ]);

    const box = await drawer.boundingBox();
    expect(box).toBeTruthy();
    expect(box.x + box.width).toBeGreaterThan(page.viewportSize().width - 8);
  });

  test('tapping a heading scrolls to it and closes the drawer', async ({ page }) => {
    await page.goto('/toc-article.html');
    await page.locator('[data-toc-fab]').click();
    await expect(page.locator('[data-toc-drawer]')).toBeVisible();

    await page
      .locator('[data-toc-drawer] .markdown-navigation .title-anchor')
      .filter({ hasText: /^Clean Title$/ })
      .click();

    await expect(page.locator('[data-toc-drawer]')).toHaveCount(0);
    await expect
      .poll(async () => {
        const after = await headingMetrics(page, 'Clean Title');
        return after && Math.abs(after.scrollY - after.offsetTop) < 8 ? after : null;
      })
      .toMatchObject({
        dataId: 'Clean Title',
        inViewport: true,
      });
  });

  test('overlay click closes the drawer without leaving it open', async ({ page }) => {
    await page.goto('/toc-article.html');
    await page.locator('[data-toc-fab]').click();
    await expect(page.locator('[data-toc-drawer]')).toBeVisible();
    await page.locator('[data-toc-drawer-overlay]').click({ position: { x: 8, y: 8 } });
    await expect(page.locator('[data-toc-drawer]')).toHaveCount(0);
    await expect(page.locator('[data-toc-fab]')).toBeVisible();
  });
});

test.describe('desktop article TOC is unchanged (#451)', () => {
  test('desktop viewport keeps the sidebar TOC and hides the mobile FAB', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/toc-article.html');
    await expect(page.locator('[data-toc] .markdown-navigation .title-anchor').first()).toBeVisible();
    await expect(page.locator('[data-toc-fab]')).toBeHidden();
    await expect(page.locator('[data-toc-drawer]')).toHaveCount(0);
  });
});
