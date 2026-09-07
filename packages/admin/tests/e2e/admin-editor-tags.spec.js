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

function tagsSelect(dialog) {
  return dialog.locator('.ant-form-item').filter({ hasText: '标签' }).locator('.ant-select').first();
}

async function selectedTagTexts(select) {
  return select.locator('.ant-select-selection-item-content').allTextContents();
}

async function pasteIntoTags(page, select, text) {
  const input = select.locator('input.ant-select-selection-search-input');
  await select.click();
  await expect(input).toBeFocused();
  await page.evaluate(async (value) => {
    await navigator.clipboard.writeText(value);
  }, text);
  await input.press('Control+v');
}

test.describe('admin editor article tags bulk paste (#489)', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('pasting comma-separated tags creates multiple tags', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const dialog = await openArticleInfoForm(page);
    const select = tagsSelect(dialog);

    await expect(dialog.getByText(/粘贴多个标签|逗号 \/ 分号 \/ 换行/)).toBeVisible();

    await pasteIntoTags(page, select, 'tag1,tag2，tag3');

    await expect
      .poll(async () => selectedTagTexts(select), { timeout: 5_000 })
      .toEqual(expect.arrayContaining(['E2E', 'tag1', 'tag2', 'tag3']));
  });

  test('pasting newline-separated tags creates multiple tags', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const dialog = await openArticleInfoForm(page);
    const select = tagsSelect(dialog);

    await pasteIntoTags(page, select, 'alpha\nbeta\ngamma');

    await expect
      .poll(async () => selectedTagTexts(select), { timeout: 5_000 })
      .toEqual(expect.arrayContaining(['E2E', 'alpha', 'beta', 'gamma']));
  });

  test('pasting semicolon-separated tags creates multiple tags', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const dialog = await openArticleInfoForm(page);
    const select = tagsSelect(dialog);

    await pasteIntoTags(page, select, 'one;two；three');

    await expect
      .poll(async () => selectedTagTexts(select), { timeout: 5_000 })
      .toEqual(expect.arrayContaining(['E2E', 'one', 'two', 'three']));
  });
});
