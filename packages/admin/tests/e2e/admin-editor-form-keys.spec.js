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

async function assertArrowsMoveCaret(input, typed) {
  await input.click();
  await input.fill(typed);
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

test.describe('admin editor article form keys', () => {
  test('arrow keys move the caret in 修改信息 fields', async ({ page }) => {
    const dialog = await openArticleInfoForm(page);

    const title = dialog.locator('#title');
    await expect(title).toBeVisible();
    await assertArrowsMoveCaret(title, 'ABCDEF');

    const pathname = dialog.locator('#pathname');
    await expect(pathname).toBeVisible();
    await assertArrowsMoveCaret(pathname, 'hello-path');
  });
});
