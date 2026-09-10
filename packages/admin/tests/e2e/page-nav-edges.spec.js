const { test, expect } = require('@playwright/test');

const PREV = 'Previous page';
const NEXT = 'Next page';

async function openPager(page) {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  await page.goto('/page-nav.html');
  await expect(page.locator('[data-page-nav-case="first"] nav[aria-label="Pagination"]')).toBeVisible();
  await expect(page.locator('[data-page-nav-case="middle"] nav[aria-label="Pagination"]')).toBeVisible();
  await expect(page.locator('[data-page-nav-case="last"] nav[aria-label="Pagination"]')).toBeVisible();
  expect(pageErrors, `fixture pageerror: ${pageErrors.join('\n')}`).toEqual([]);
}

function caseRoot(page, name) {
  return page.locator(`[data-page-nav-case="${name}"]`);
}

async function expectDisabledControl(root, label) {
  const control = root.getByLabel(label);
  await expect(control).toBeVisible();
  await expect(control).toHaveAttribute('aria-disabled', 'true');
  await expect(control).toHaveJSProperty('tagName', 'SPAN');
  await expect(control).not.toHaveAttribute('href');
  await expect(control.locator('a')).toHaveCount(0);
  await expect(control.locator('div')).toHaveClass(/cursor-not-allowed/);
  await expect(control.locator('div')).toHaveClass(/opacity-40/);
}

async function expectEnabledControl(root, label, href) {
  const control = root.getByRole('link', { name: label });
  await expect(control).toBeVisible();
  await expect(control).toHaveAttribute('href', href);
  await expect(control).not.toHaveAttribute('aria-disabled');
}

test.describe('public PageNav first/last edges (#331)', () => {
  test.beforeEach(async ({ page }) => {
    await openPager(page);
  });

  test('first page: prev disabled and not navigable; next stays a link', async ({ page }) => {
    const first = caseRoot(page, 'first');
    await expectDisabledControl(first, PREV);
    await expectEnabledControl(first, NEXT, '/page/2');
    await expect(first.getByRole('link', { name: '1' })).toHaveAttribute('aria-current', 'page');

    const urlBefore = page.url();
    await first.getByLabel(PREV).click();
    await expect(page).toHaveURL(urlBefore);
  });

  test('last page: next disabled and not navigable; prev stays a link', async ({ page }) => {
    const last = caseRoot(page, 'last');
    await expectDisabledControl(last, NEXT);
    await expectEnabledControl(last, PREV, '/page/2');
    await expect(last.getByRole('link', { name: '3' })).toHaveAttribute('aria-current', 'page');

    const urlBefore = page.url();
    await last.getByLabel(NEXT).click();
    await expect(page).toHaveURL(urlBefore);
  });

  test('middle page: prev and next are both enabled', async ({ page }) => {
    const middle = caseRoot(page, 'middle');
    await expectEnabledControl(middle, PREV, '/');
    await expectEnabledControl(middle, NEXT, '/page/3');
    await expect(middle.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    await expect(middle.getByLabel(PREV)).not.toHaveAttribute('aria-disabled');
    await expect(middle.getByLabel(NEXT)).not.toHaveAttribute('aria-disabled');
  });

  test('desktop and mobile share the same disabled-edge pager', async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await expectDisabledControl(caseRoot(page, 'first'), PREV);
      await expectDisabledControl(caseRoot(page, 'last'), NEXT);
      await expectEnabledControl(caseRoot(page, 'middle'), PREV, '/');
      await expectEnabledControl(caseRoot(page, 'middle'), NEXT, '/page/3');
    }
  });
});
