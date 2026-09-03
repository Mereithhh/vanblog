const { test, expect } = require('@playwright/test');

async function metrics(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    return {
      id: el.id,
      href: el.getAttribute('href'),
      target: el.getAttribute('target'),
      top: rect.top,
      inViewport: rect.top >= 0 && rect.top < window.innerHeight,
      scrollY: window.scrollY,
      pathname: window.location.pathname,
      hash: window.location.hash,
    };
  }, selector);
}

test.describe('public article markdown footnotes (#290)', () => {
  test.beforeEach(async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await page.goto('/footnote-article.html');
    await expect(page.locator('a[href="#user-content-fn-1"]')).toBeVisible();
    await expect(page.locator('#user-content-fn-1')).toBeVisible();
    expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
  });

  test('renders the footnote block with a separator', async ({ page }) => {
    const section = page.locator('section.footnotes');
    await expect(section).toBeVisible();
    const border = await section.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        width: style.borderTopWidth,
        color: style.borderTopColor,
      };
    });
    expect(Number.parseFloat(border.width)).toBeGreaterThan(0);
    expect(border.color).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('clicking a footnote ref scrolls on the same document, not a new page', async ({
    page,
    context,
  }) => {
    const pagesBefore = context.pages().length;
    const popupPromise = page.waitForEvent('popup', { timeout: 750 }).catch(() => null);
    const ref = page.locator('a[href="#user-content-fn-1"]');
    await expect(ref).not.toHaveAttribute('target', '_blank');

    const before = await metrics(page, '#user-content-fn-1');
    expect(before?.top).toBeGreaterThan(200);
    expect(before?.inViewport).toBe(false);

    await ref.click();

    expect(await popupPromise).toBeNull();
    expect(context.pages().length).toBe(pagesBefore);

    await expect
      .poll(async () => {
        const after = await metrics(page, '#user-content-fn-1');
        return after && after.inViewport && after.hash.includes('fn-1') ? after : null;
      })
      .toMatchObject({
        id: 'user-content-fn-1',
        inViewport: true,
        pathname: '/footnote-article.html',
      });
  });

  test('clicking the footnote back-link returns to the reference', async ({ page, context }) => {
    const pagesBefore = context.pages().length;
    await page.locator('a[href="#user-content-fn-1"]').click();
    await expect
      .poll(async () => {
        const atFootnote = await metrics(page, '#user-content-fn-1');
        return atFootnote && atFootnote.inViewport ? atFootnote : null;
      })
      .toBeTruthy();

    const back = page.locator('a[href="#user-content-fnref-1"]');
    await expect(back).not.toHaveAttribute('target', '_blank');
    const popupPromise = page.waitForEvent('popup', { timeout: 750 }).catch(() => null);
    await back.click();

    expect(await popupPromise).toBeNull();
    expect(context.pages().length).toBe(pagesBefore);

    await expect
      .poll(async () => {
        const after = await metrics(page, '#user-content-fnref-1');
        return after && after.inViewport && after.hash.includes('fnref-1') ? after : null;
      })
      .toMatchObject({
        id: 'user-content-fnref-1',
        inViewport: true,
        pathname: '/footnote-article.html',
      });
  });

  test('normal external links still open in a new tab', async ({ page }) => {
    await expect(page.locator('a[href="https://example.com"]')).toHaveAttribute('target', '_blank');
  });
});
