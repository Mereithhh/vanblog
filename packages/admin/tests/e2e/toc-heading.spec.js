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

test.describe('public article TOC completeness', () => {
  test('nested headings that render in the article also appear in the public TOC', async ({
    page,
  }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await page.goto('/toc-article.html');
    await expect(page.locator('h3[data-id="Indented Nested"]')).toBeVisible();
    await expect(page.locator('h4[data-id="Deeper Nested"]')).toBeVisible();

    const bodyHeadings = await page.evaluate(() =>
      [...document.querySelectorAll('[data-post-content] .markdown-heading')]
        .map((el) => (el.getAttribute('data-id') || '').trim())
        .filter(Boolean),
    );
    const tocHeadings = await page.evaluate(() =>
      [...document.querySelectorAll('.markdown-navigation .title-anchor')].map((el) =>
        (el.getAttribute('data-id') || el.textContent || '').trim(),
      ),
    );

    expect(bodyHeadings).toEqual(
      expect.arrayContaining(['Indented Nested', 'Deeper Nested', 'Nested Parent', 'My Title']),
    );
    expect(tocHeadings).toEqual(bodyHeadings);
    expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
  });
});

const MATH_COMPARE_ID = '比较 $A$<$B$';
const MATH_MIXED_ID = '由方程 $F(x,y)=0$ 确定的隐函数 $y=y(x)$';

test.describe('public article TOC math headings (#264)', () => {
  test.beforeEach(async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await page.goto('/toc-article.html');
    await expect(page.locator('h2[data-id="Clean Title"]')).toBeVisible();
    expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
  });

  test('TOC label renders KaTeX instead of raw $A$<$B$ dollars', async ({ page }) => {
    const tocItem = page.locator('.markdown-navigation .title-anchor').filter({
      has: page.locator('.katex'),
    }).first();
    await expect(tocItem).toBeVisible();

    const info = await page.evaluate((id) => {
      const el = [...document.querySelectorAll('.markdown-navigation .title-anchor')].find(
        (node) => node.getAttribute('data-id') === id,
      );
      if (!el) return null;
      const visible = el.cloneNode(true);
      visible.querySelectorAll('.katex-mathml').forEach((node) => node.remove());
      return {
        dataId: el.getAttribute('data-id'),
        html: el.innerHTML,
        visibleText: (visible.textContent || '').replace(/\s+/g, ' ').trim(),
        katexCount: el.querySelectorAll('.katex').length,
      };
    }, MATH_COMPARE_ID);

    expect(info).toBeTruthy();
    expect(info.dataId).toBe(MATH_COMPARE_ID);
    expect(info.dataId).toContain('$A$');
    expect(info.html).toContain('katex');
    expect(info.katexCount).toBeGreaterThanOrEqual(2);
    expect(info.html).not.toContain('$A$');
    expect(info.visibleText).not.toContain('$A$');
    expect(info.visibleText).toMatch(/A/);
    expect(info.visibleText).toMatch(/B/);
  });

  test('mixed prose and math heading still keeps source text as data-id', async ({ page }) => {
    const info = await page.evaluate((id) => {
      const el = [...document.querySelectorAll('.markdown-navigation .title-anchor')].find(
        (node) => node.getAttribute('data-id') === id,
      );
      if (!el) return null;
      return {
        dataId: el.getAttribute('data-id'),
        html: el.innerHTML,
        headingId: document.querySelector(`h2[data-id="${CSS.escape(id)}"]`)?.getAttribute('data-id'),
      };
    }, MATH_MIXED_ID);

    expect(info?.dataId).toBe(MATH_MIXED_ID);
    expect(info?.headingId).toBe(MATH_MIXED_ID);
    expect(info?.html).toContain('katex');
    expect(info?.html).not.toContain('$F(x,y)=0$');
  });

  test('clicking a math TOC item still jumps using the unparsed heading id', async ({ page }) => {
    const before = await headingMetrics(page, MATH_COMPARE_ID);
    expect(before?.offsetTop).toBeGreaterThan(100);

    await page.evaluate((id) => {
      const el = [...document.querySelectorAll('.markdown-navigation .title-anchor')].find(
        (node) => node.getAttribute('data-id') === id,
      );
      el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, MATH_COMPARE_ID);

    await expect
      .poll(async () => {
        const after = await headingMetrics(page, MATH_COMPARE_ID);
        return after && Math.abs(after.scrollY - after.offsetTop) < 8 ? after : null;
      })
      .toMatchObject({
        dataId: MATH_COMPARE_ID,
        inViewport: true,
      });
  });
});
