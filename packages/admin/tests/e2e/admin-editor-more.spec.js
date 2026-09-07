const { test, expect } = require('@playwright/test');
const { loginAsAdmin, mockAdminApis } = require('./admin-api-mock');
const {
  collectUncaughtErrors,
  expectNoEditorCrash,
  expectPreviewVisibleAndIdle,
  readEditorValue,
} = require('./page-errors');

test.describe('admin editor tip + more marker (#429)', () => {
  test('Enter between <!-- more --> and ---- does not white-screen the editor', async ({
    page,
  }) => {
    const errors = collectUncaughtErrors(page);
    await loginAsAdmin(page);
    await mockAdminApis(page);

    await page.goto('/admin/editor?type=article&id=429');

    const editor = page.locator('.bytemd-editor .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Markdown 语法测试').first()).toBeVisible();
    await expectPreviewVisibleAndIdle(page);

    await expect
      .poll(async () => readEditorValue(page))
      .toContain('<!-- more -->');
    await expect
      .poll(async () => readEditorValue(page))
      .toContain(':::tip');

    await expect(page.locator('.bytemd-preview .custom-container.tip').first()).toBeVisible();

    await editor.click({ position: { x: 24, y: 24 } });
    await expect(editor).toHaveClass(/CodeMirror-focused/);

    const placed = await page.evaluate(() => {
      const cm = document.querySelector('.CodeMirror')?.CodeMirror;
      if (!cm) {
        return false;
      }
      const lines = String(cm.getValue() || '').split('\n');
      const moreLine = lines.findIndex((row) => row.includes('<!-- more -->'));
      if (moreLine < 0) {
        return false;
      }
      cm.focus();
      cm.setCursor({ line: moreLine + 1, ch: 0 });
      return true;
    });
    expect(placed).toBe(true);

    await page.keyboard.press('Enter');
    await page.keyboard.type('E2E_429_ENTER_OK');

    await expect.poll(async () => readEditorValue(page)).toContain('E2E_429_ENTER_OK');
    await expect.poll(async () => readEditorValue(page)).toContain('<!-- more -->');
    await expect.poll(async () => readEditorValue(page)).toContain('欢迎体验');

    await page.keyboard.press('Enter');
    await page.keyboard.type('STILL_EDITABLE');
    await expect.poll(async () => readEditorValue(page)).toContain('STILL_EDITABLE');

    await expect(page.getByText('Something went wrong')).toHaveCount(0);
    expectNoEditorCrash(page, errors);
    await expectPreviewVisibleAndIdle(page);
    await expect(page.locator('.bytemd-preview .custom-container.tip').first()).toBeVisible();
  });
});
