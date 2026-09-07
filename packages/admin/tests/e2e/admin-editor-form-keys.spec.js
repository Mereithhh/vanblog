const { test, expect } = require('@playwright/test');
const { loginAsAdmin, mockAdminApis } = require('./admin-api-mock');

async function openArticleInfoForm(page) {
  await loginAsAdmin(page);
  await mockAdminApis(page);
  await page.goto('/admin/editor?type=article&id=108');

  const editor = page.locator('.bytemd-editor .CodeMirror').first();
  await expect(editor).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('方向键光标测试标题').first()).toBeVisible();

  await page.getByRole('button', { name: '操作' }).click();
  await page.getByText('修改信息', { exact: true }).click();

  const dialog = page.locator('.ant-modal-content').filter({ hasText: '修改信息' });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function installKeyLog(input, keys) {
  await input.evaluate((el, watched) => {
    window.__vanblogFormKeyLog = [];
    if (el.__vanblogFormKeyListener) {
      el.removeEventListener('keydown', el.__vanblogFormKeyListener, true);
    }
    el.__vanblogFormKeyListener = (e) => {
      if (!watched.includes(e.key)) {
        return;
      }
      queueMicrotask(() => {
        window.__vanblogFormKeyLog.push({
          key: e.key,
          defaultPrevented: e.defaultPrevented,
          tag: e.target && e.target.tagName,
          id: e.target && e.target.id,
        });
      });
    };
    el.addEventListener('keydown', el.__vanblogFormKeyListener, true);
  }, keys);
}

async function assertArrowsNotPreventDefaulted(input) {
  await installKeyLog(input, ['ArrowLeft', 'ArrowRight']);

  await input.press('ArrowLeft');
  await input.press('ArrowRight');

  const log = await input.evaluate(() => window.__vanblogFormKeyLog || []);
  const left = log.filter((row) => row.key === 'ArrowLeft');
  const right = log.filter((row) => row.key === 'ArrowRight');
  expect(left.length).toBeGreaterThan(0);
  expect(right.length).toBeGreaterThan(0);
  expect(left.every((row) => row.defaultPrevented === false)).toBe(true);
  expect(right.every((row) => row.defaultPrevented === false)).toBe(true);
}

async function assertArrowsMoveCaret(page, input, typed) {
  await input.click();
  await input.fill(typed);
  await input.evaluate((el, value) => {
    el.focus();
    el.setSelectionRange(value.length, value.length);
  }, typed);

  await assertArrowsNotPreventDefaulted(input);

  await input.evaluate((el, value) => {
    el.focus();
    el.setSelectionRange(value.length, value.length);
  }, typed);

  await input.press('ArrowLeft');
  await input.press('ArrowLeft');
  expect(await input.evaluate((el) => el.selectionStart)).toBe(typed.length - 2);

  await input.press('ArrowRight');
  expect(await input.evaluate((el) => el.selectionStart)).toBe(typed.length - 1);

  await input.press('ArrowUp');
  expect(await input.evaluate((el) => el.selectionStart)).toBe(0);

  await input.press('ArrowDown');
  expect(await input.evaluate((el) => el.selectionStart)).toBe(typed.length);
}

async function assertBackspaceDeleteEdit(input, typed) {
  await input.click();
  await input.fill(typed);
  await input.evaluate((el, value) => {
    el.focus();
    el.setSelectionRange(value.length, value.length);
  }, typed);

  await installKeyLog(input, ['Backspace', 'Delete']);

  await input.press('Backspace');
  expect(await input.inputValue()).toBe(typed.slice(0, -1));
  expect(await input.evaluate((el) => el.selectionStart)).toBe(typed.length - 1);

  await input.fill(typed);
  await input.evaluate((el, value) => {
    el.focus();
    el.setSelectionRange(0, 0);
  }, typed);

  await input.press('Delete');
  expect(await input.inputValue()).toBe(typed.slice(1));
  expect(await input.evaluate((el) => el.selectionStart)).toBe(0);

  const log = await input.evaluate(() => window.__vanblogFormKeyLog || []);
  const backspace = log.filter((row) => row.key === 'Backspace');
  const del = log.filter((row) => row.key === 'Delete');
  expect(backspace.length).toBeGreaterThan(0);
  expect(del.length).toBeGreaterThan(0);
  expect(backspace.every((row) => row.defaultPrevented === false)).toBe(true);
  expect(del.every((row) => row.defaultPrevented === false)).toBe(true);
}

test.describe('admin editor article form keys', () => {
  test('arrow keys move the caret in the article title input (#390)', async ({ page }) => {
    const dialog = await openArticleInfoForm(page);

    const title = dialog.locator('#title');
    await expect(title).toBeVisible();
    await assertArrowsMoveCaret(page, title, 'ABCDEF');
  });

  test('arrow keys move the caret in 修改信息 fields', async ({ page }) => {
    const dialog = await openArticleInfoForm(page);

    const title = dialog.locator('#title');
    await expect(title).toBeVisible();
    await assertArrowsMoveCaret(page, title, 'ABCDEF');

    const pathname = dialog.locator('#pathname');
    await expect(pathname).toBeVisible();
    await assertArrowsMoveCaret(page, pathname, 'hello-path');
  });

  test('Backspace / Delete edit the article title input (#233)', async ({ page }) => {
    const dialog = await openArticleInfoForm(page);

    const title = dialog.locator('#title');
    await expect(title).toBeVisible();
    await assertBackspaceDeleteEdit(title, 'ABCDEF');
  });

  test('Backspace / Delete edit 修改信息 fields (#233)', async ({ page }) => {
    const dialog = await openArticleInfoForm(page);

    const title = dialog.locator('#title');
    await expect(title).toBeVisible();
    await assertBackspaceDeleteEdit(title, 'ABCDEF');

    const pathname = dialog.locator('#pathname');
    await expect(pathname).toBeVisible();
    await assertBackspaceDeleteEdit(pathname, 'hello-path');
  });
});
