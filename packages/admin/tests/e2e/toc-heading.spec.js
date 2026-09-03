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

const TALL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="1200">
  <rect width="640" height="1200" fill="#c8c8c8"/>
</svg>`;

async function holdLazyScreenshots(page, delayMs = 600) {
  await page.route('**/tall.svg', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: TALL_SVG,
    });
  });
}

test.describe('public article TOC jump below lazy images', () => {
  test('heading below unloaded images is already in the DOM', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await holdLazyScreenshots(page);
    await page.goto('/toc-article.html');
    await expect(page.locator('h2[data-id="4. 配置DHCP引导选项"]')).toBeVisible();
    await expect(page.locator('img[loading="lazy"]')).toHaveCount(3);
    const before = await headingMetrics(page, '4. 配置DHCP引导选项');
    expect(before).not.toBeNull();
    expect(before.offsetTop).toBeLessThan(4000);
    expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
  });

  test('TOC click lands on a heading below unloaded lazy images', async ({ page }) => {
    await holdLazyScreenshots(page);
    await page.goto('/toc-article.html');
    await expect(page.locator('h2[data-id="4. 配置DHCP引导选项"]')).toBeVisible();
    const before = await headingMetrics(page, '4. 配置DHCP引导选项');
    expect(before.offsetTop).toBeLessThan(4000);

    await clickToc(page, '4. 配置DHCP引导选项');

    await expect
      .poll(
        async () => {
          const after = await headingMetrics(page, '4. 配置DHCP引导选项');
          return after &&
            after.offsetTop > before.offsetTop + 800 &&
            Math.abs(after.scrollY - after.offsetTop) < 8
            ? after
            : null;
        },
        { timeout: 10_000 },
      )
      .toMatchObject({
        dataId: '4. 配置DHCP引导选项',
        inViewport: true,
      });
  });

  test('hash navigation lands on a heading below unloaded lazy images', async ({ page }) => {
    await holdLazyScreenshots(page);
    await page.goto('/toc-article.html#4. 配置DHCP引导选项');
    await expect
      .poll(
        async () => {
          const after = await headingMetrics(page, '4. 配置DHCP引导选项');
          return after && after.offsetTop > 5000 && after.inViewport ? after : null;
        },
        { timeout: 10_000 },
      )
      .toMatchObject({
        id: '4. 配置DHCP引导选项',
        dataId: '4. 配置DHCP引导选项',
        inViewport: true,
      });
  });
});
