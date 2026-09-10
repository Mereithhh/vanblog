const { test, expect } = require('@playwright/test');

const PREV = 'Previous page';
const NEXT = 'Next page';
const JUMP_INPUT = '[data-page-nav-jump-input]';
const GO = '前往';

async function openPager(page) {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  await page.goto('/page-nav.html');
  await expect(page.locator('[data-page-nav-case="first"] nav[aria-label="Pagination"]')).toBeVisible();
  await expect(page.locator('[data-page-nav-case="far"] nav[aria-label="Pagination"]')).toBeVisible();
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
}

async function jumpFill(root, value) {
  const input = root.locator(JUMP_INPUT);
  await expect(input).toBeVisible();
  await input.fill(value);
  return input;
}

test.describe('public PageNav jump-to-page (#229)', () => {
  test.beforeEach(async ({ page }) => {
    await openPager(page);
  });

  test('jump to a far middle page updates the URL', async ({ page }) => {
    const far = caseRoot(page, 'far');
    await expect(far.getByRole('link', { name: '1', exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await jumpFill(far, '90');
    await far.getByRole('button', { name: GO }).click();
    await expect(page).toHaveURL(/\/page\/90$/);
  });

  test('Enter on a valid page uses the same /page/n path', async ({ page }) => {
    const far = caseRoot(page, 'far');
    const input = await jumpFill(far, '42');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/page\/42$/);
  });

  test('invalid and out-of-range input does not navigate', async ({ page }) => {
    const far = caseRoot(page, 'far');
    const urlBefore = page.url();

    await jumpFill(far, '');
    await far.getByRole('button', { name: GO }).click();
    await expect(page).toHaveURL(urlBefore);

    await jumpFill(far, '999');
    await far.getByRole('button', { name: GO }).click();
    await expect(page).toHaveURL(urlBefore);

    const input = await jumpFill(far, '0');
    await input.press('Enter');
    await expect(page).toHaveURL(urlBefore);
  });

  test('jump sits beside numbered links and keeps aria-current (#448)', async ({ page }) => {
    const first = caseRoot(page, 'first');
    const middle = caseRoot(page, 'middle');
    const last = caseRoot(page, 'last');

    await expect(first.locator(JUMP_INPUT)).toBeVisible();
    await expect(first.getByRole('button', { name: GO })).toBeVisible();
    await expect(first.getByRole('link', { name: '1', exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(middle.getByRole('link', { name: '2', exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(last.getByRole('link', { name: '3', exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(middle.getByRole('link', { name: '1', exact: true })).not.toHaveAttribute(
      'aria-current'
    );
  });

  test('edges still disable prev/next after a rejected jump (#331)', async ({ page }) => {
    const first = caseRoot(page, 'first');
    const last = caseRoot(page, 'last');
    const urlBefore = page.url();

    await jumpFill(first, '999');
    await first.getByRole('button', { name: GO }).click();
    await expect(page).toHaveURL(urlBefore);

    await expectDisabledControl(first, PREV);
    await expect(first.getByRole('link', { name: NEXT })).toHaveAttribute('href', '/page/2');
    await expectDisabledControl(last, NEXT);
    await expect(last.getByRole('link', { name: PREV })).toHaveAttribute('href', '/page/2');

    await first.getByLabel(PREV).click();
    await last.getByLabel(NEXT).click();
    await expect(page).toHaveURL(urlBefore);
  });

  test('desktop and mobile keep the jump control without breaking the pager', async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      const far = caseRoot(page, 'far');
      const first = caseRoot(page, 'first');
      await expect(far.locator(JUMP_INPUT)).toBeVisible();
      await expect(far.getByRole('button', { name: GO })).toBeVisible();
      await expectDisabledControl(first, PREV);
      await expect(first.getByRole('link', { name: NEXT })).toBeVisible();
    }
  });
});
