const { test, expect } = require('@playwright/test');

const LONG_TEXT = '1'.repeat(36);
const LONG_HREF = 'https://www.baidu.com';
const QUERY_HREF = 'https://example.com/search?q=hello+world&lang=zh-CN';
const PAREN_HREF = 'https://en.wikipedia.org/wiki/Example_(disambiguation)';

async function linkInfo(page, root, href) {
  return page.evaluate(
    ({ sel, url }) => {
      const scope = document.querySelector(sel);
      if (!scope) {
        return null;
      }
      const el = [...scope.querySelectorAll('a')].find((a) => a.getAttribute('href') === url);
      if (!el) {
        return {
          hrefs: [...scope.querySelectorAll('a')].map((a) => a.getAttribute('href')),
        };
      }
      return {
        href: el.getAttribute('href'),
        text: el.textContent,
        target: el.getAttribute('target'),
        html: el.innerHTML,
      };
    },
    { sel: root, url: href },
  );
}

test.describe('public article markdown links (#410)', () => {
  test.beforeEach(async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await page.goto('/markdown-link-article.html');
    await expect(page.locator('[data-overview] a').first()).toBeVisible();
    await expect(page.locator('[data-article] a').first()).toBeVisible();
    expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
  });

  test('homepage excerpt keeps the full href and visible text of a long markdown link', async ({
    page,
  }) => {
    const overview = await linkInfo(page, '[data-overview]', LONG_HREF);
    expect(overview).toMatchObject({
      href: LONG_HREF,
      text: LONG_TEXT,
    });
    const raw = await page.locator('[data-overview]').innerText();
    expect(raw).not.toContain('](https://www');
    expect(raw).toContain(LONG_TEXT);
  });

  test('full article keeps long text, backticks, query strings, and parentheses', async ({
    page,
  }) => {
    const long = await linkInfo(page, '[data-article]', LONG_HREF);
    const query = await linkInfo(page, '[data-article]', QUERY_HREF);
    const paren = await linkInfo(page, '[data-article]', PAREN_HREF);
    expect(long).toMatchObject({ href: LONG_HREF, text: LONG_TEXT, target: '_blank' });
    expect(query).toMatchObject({
      href: QUERY_HREF,
      text: 'code label',
      target: '_blank',
    });
    expect(query.html).toContain('<code>');
    expect(paren).toMatchObject({
      href: PAREN_HREF,
      text: 'wiki parens',
      target: '_blank',
    });
  });

  test('footnote in-page hash links still stay on the same page (#290)', async ({ page }) => {
    const ref = page.locator('[data-article] a[href="#user-content-fn-1"]');
    const back = page.locator('[data-article] a[href="#user-content-fnref-1"]');
    await expect(ref).toBeVisible();
    await expect(back).toBeVisible();
    await expect(ref).not.toHaveAttribute('target', '_blank');
    await expect(back).not.toHaveAttribute('target', '_blank');
    await expect(page.locator('[data-article] a[href="https://example.com"]')).toHaveAttribute(
      'target',
      '_blank',
    );
  });
});
