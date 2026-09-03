const { test, expect } = require('@playwright/test');

async function headingMetrics(page, dataId) {
  return page.evaluate((id) => {
    const el = document.querySelector(`h2[data-id="${id}"]`);
    if (!el) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    return {
      id: el.id,
      dataId: el.getAttribute('data-id'),
      offsetTop: el.offsetTop,
      top: rect.top,
      inViewport: rect.top >= 0 && rect.top < window.innerHeight,
      scrollY: window.scrollY,
    };
  }, dataId);
}

async function clickToc(page, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  await page.locator('.markdown-navigation .title-anchor', { hasText: new RegExp(`^${escaped}$`) }).click();
}

test.describe('public article TOC heading jump', () => {
  test.beforeEach(async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await page.goto('/toc-article.html');
    await expect(page.locator('h2[data-id="My Title"]')).toBeVisible();
    await expect(page.locator('h2[data-id="Extra Spaces"]')).toBeVisible();
    await expect(page.locator('h2[data-id="Clean Title"]')).toBeVisible();
    expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
  });

  test('heading ids drop trailing and extra spaces', async ({ page }) => {
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll('.markdown-heading')].map((el) => ({
        tag: el.tagName,
        id: el.id,
        dataId: el.getAttribute('data-id'),
      })),
    );
    expect(ids).toEqual(
      expect.arrayContaining([
        { tag: 'H2', id: 'My Title', dataId: 'My Title' },
        { tag: 'H2', id: 'Extra Spaces', dataId: 'Extra Spaces' },
        { tag: 'H2', id: 'Clean Title', dataId: 'Clean Title' },
      ]),
    );
    expect(ids.some((item) => / $/.test(item.id) || / $/.test(item.dataId))).toBe(false);
  });

  test('TOC click jumps to a heading that has a trailing space in markdown', async ({ page }) => {
    const before = await headingMetrics(page, 'My Title');
    expect(before?.offsetTop).toBeGreaterThan(100);
    expect(before?.top).toBeGreaterThan(200);

    await clickToc(page, 'My Title');

    await expect
      .poll(async () => {
        const after = await headingMetrics(page, 'My Title');
        return after && Math.abs(after.scrollY - after.offsetTop) < 8 ? after : null;
      })
      .toMatchObject({
        dataId: 'My Title',
        inViewport: true,
      });
  });

  test('TOC click jumps to a heading with extra leading and trailing spaces', async ({ page }) => {
    await clickToc(page, 'Extra Spaces');
    await expect
      .poll(async () => {
        const after = await headingMetrics(page, 'Extra Spaces');
        return after && Math.abs(after.scrollY - after.offsetTop) < 8 ? after : null;
      })
      .toMatchObject({
        dataId: 'Extra Spaces',
        inViewport: true,
      });
  });

  test('headings without extra spaces still jump', async ({ page }) => {
    await clickToc(page, 'Clean Title');
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

  test('hash navigation lands on the trimmed heading id', async ({ page }) => {
    await page.evaluate(() => {
      window.location.hash = 'My Title';
    });
    await expect
      .poll(async () => {
        const after = await headingMetrics(page, 'My Title');
        return after && after.inViewport ? after : null;
      })
      .toMatchObject({
        id: 'My Title',
        dataId: 'My Title',
        inViewport: true,
      });
  });
});

test.describe('public article TOC lazy-load jump', () => {
  test('later heading is not in the initial DOM', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await page.goto('/toc-lazy-article.html');
    await expect(page.locator('h2[data-id="1. 概述"]')).toBeVisible();
    await expect(page.locator('[data-lazy-markdown-sentinel]')).toHaveCount(1);
    await expect(page.locator('h2[data-id="4. 配置DHCP引导选项"]')).toHaveCount(0);
    await expect(
      page.locator('.markdown-navigation .title-anchor', { hasText: /^4\. 配置DHCP引导选项$/ }),
    ).toBeVisible();
    expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
  });

  test('TOC click jumps to a heading that is not in the initial DOM', async ({ page }) => {
    await page.goto('/toc-lazy-article.html');
    await expect(page.locator('h2[data-id="1. 概述"]')).toBeVisible();
    await expect(page.locator('h2[data-id="4. 配置DHCP引导选项"]')).toHaveCount(0);

    await clickToc(page, '4. 配置DHCP引导选项');

    await expect
      .poll(async () => {
        const after = await headingMetrics(page, '4. 配置DHCP引导选项');
        return after && Math.abs(after.scrollY - after.offsetTop) < 8 ? after : null;
      })
      .toMatchObject({
        dataId: '4. 配置DHCP引导选项',
        inViewport: true,
      });
    await expect(page.locator('[data-lazy-markdown-sentinel]')).toHaveCount(0);
  });

  test('hash navigation lands on a heading below the lazy-load fold', async ({ page }) => {
    await page.goto('/toc-lazy-article.html#4. 配置DHCP引导选项');
    await expect
      .poll(async () => {
        const after = await headingMetrics(page, '4. 配置DHCP引导选项');
        return after && after.inViewport ? after : null;
      })
      .toMatchObject({
        id: '4. 配置DHCP引导选项',
        dataId: '4. 配置DHCP引导选项',
        inViewport: true,
      });
  });

  test('trailing-space headings still jump after remaining content loads', async ({ page }) => {
    await page.goto('/toc-lazy-article.html');
    await expect(page.locator('h2[data-id="My Title"]')).toHaveCount(0);
    await clickToc(page, 'My Title');
    await expect
      .poll(async () => {
        const after = await headingMetrics(page, 'My Title');
        return after && Math.abs(after.scrollY - after.offsetTop) < 8 ? after : null;
      })
      .toMatchObject({
        dataId: 'My Title',
        inViewport: true,
      });
  });
});
